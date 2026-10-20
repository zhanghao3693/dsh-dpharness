/**
 * dsh-dpharness — host half (v0.5.2).
 *
 * Catalog routes, a write-only telemetry relay and a one-click installer:
 *
 *   GET  /api/dpharness/search?q=<kw>&take=<n>&sort=stars  → { count, total, plugins[] }
 *        `count` = 本次返回条数，`total` = 该筛选下的真实命中总数（两者常不等）
 *   GET  /api/dpharness/meta
 *   GET  /api/dpharness/changelog
 *   GET  /api/dpharness/updates
 *   GET  /api/dpharness/postinstall?pkg=<pkg>&via=<local|market>&at=<epochMs>
 *   POST /api/dpharness/event    → relayed to https://dpharness.com/api/track/event
 *   POST /api/dpharness/subscribe → relayed to https://dpharness.com/api/subscribe
 *   POST /api/dpharness/install  → spawns `dsh plugin --profile <p> add <pkg>`
 *   GET  /api/dpharness/install  → progress of the one in-flight install job
 *
 * The telemetry relay exists because the site's tracker sends no CORS headers,
 * so the browser page served from 127.0.0.1:8787 cannot post to it directly.
 * It also stamps every relayed event with the plugin version, which is the only
 * way to tell "nobody did this" apart from "an old version could not report it".
 *
 * Privacy contract: the client never sends search keywords. Only event names,
 * an opaque per-install visitor id, package names the user explicitly copied,
 * and a keyword *length* are relayed. Telemetry can be switched off in the UI.
 *
 * Upstream contracts (all read from source / measured 2026-09-17):
 *   - GET https://dpharness.com/api/plugins → { count, total, plugins[] }; `q` covers
 *     the whole catalog; `take` is clamped at 500; `sort=stars` is a strictly
 *     descending star order; `count` is this page's size while `total` is the real
 *     hit count under the filter (measured 2026-09-30: q=统计 → count=3/30, total=106);
 *     item.installCheck = { status, pkgName }
 *   - POST https://dpharness.com/api/track/event → { type, value, path, visitorId }
 *     (`path` is truncated at "?", so detail belongs in `value`)
 *   - POST /dsh-market/install (dshmarket, when installed) → body { url }, same-origin
 *     only, refuses with 400 when the URL is not in its curated registry
 */

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CHANGELOG, RELEASES_URL, REPO, compareVersions, mergeChangelog, npmLatestUrl } from "./changelog.js";
import { classifyUsage, getUsageReport } from "./usage.js";

export const name = "dpharness";

/** The dsh web server service used to register HTTP routes. */
export const inject = ["webServer"];

export const VERSION = "0.6.4";

/**
 * 本插件在 npm 上的包名 —— 与 dsh 的插件 id（上面的 `name = "dpharness"`）**不是一回事**，
 * 别互相替代：前者用于 registry 查询与升级命令，后者用于 profile 加载清单。
 */
export const PKG_NAME = "dsh-dpharness";

/**
 * 接口负载的**形状版本**。改动 /updates、/changelog 返回的字段时**必须 +1**。
 *
 * 为什么需要它：desktop profile 里本插件是指向工作区的符号链接 —— 客户端刷新页面即生效，
 * 而宿主的路由与字段要**重启 dsh** 才会更新。这个窗口期里界面会缺字段（实测已误导过两次），
 * 客户端据此显式提示「宿主进程是旧版本」，而不是让用户以为功能坏了。
 *
 * ⚠️ 客户端侧有一份同名常量（两个半边同包但不同运行时，没法 import），
 * test-local.mjs **双向断言两者相等** —— 改一处忘了另一处会当场变红。
 */
export const SHAPE_REV = 4;

/**
 * Wall-clock time this dsh process started.
 *
 * Needed to answer "did dsh restart since this install?" — and it has to come
 * from the host, because the client is the same JS before and after a restart
 * and therefore cannot prove a restart happened on its own.
 */
const STARTED_AT = Date.now() - Math.round(process.uptime() * 1000);

/**
 * Identity of this host process, renewed on every start.
 *
 * `STARTED_AT` alone turned out to be a weak proof of "a restart happened":
 * it is a wall-clock value, so a clock step or a later install refreshing the
 * client-side timestamp can make the comparison lie. A boot id has no such
 * ambiguity — it is generated once per process and can only differ when the
 * process really changed. The timestamp is kept as the fallback for clients
 * that already stored a pending record before this field existed.
 */
const BOOT_ID = randomUUID();

/**
 * Profile used for installs.
 *
 * `dsh plugin --profile <name>` requires the flag, but the running web process
 * is started as `dsh web --host … --port …` without it (the web GUI defaults to
 * the `web` profile). Honour an explicit `--profile` if present, otherwise use
 * that default; DSH_DPHARNESS_PROFILE overrides both.
 */
const PROFILE = (() => {
  const flag = process.argv.indexOf("--profile");
  if (flag >= 0 && process.argv[flag + 1]) return process.argv[flag + 1];
  if (process.env.DSH_DPHARNESS_PROFILE) return process.env.DSH_DPHARNESS_PROFILE;
  return profileFromArgv() || "web";
})();

/**
 * Recover the profile name from the desktop shell's positional arguments.
 *
 * The Electron shell boots this host as
 *   …/MacOS/DeepSeek Harness --expose-internals <…>/dsh-desktop-host/lib/index.js \
 *       <…>/app.asar/dsh  <…>/.dsh/profiles/<profile>  <…>/runtime/primary-runtime
 * so neither `--profile` nor DSH_DPHARNESS_PROFILE exists and the plain
 * fallback ("web") names the WRONG profile: the user is looking at `desktop`
 * while the install would land in `web` (measured 2026-09-30 against
 * @deepseek-ai/dsh-desktop 0.2.0-rc.2, where argv held …/profiles/desktop).
 *
 * A candidate is accepted only when a package.json really sits there, so an
 * unrelated path that merely contains "profiles" cannot be mistaken for it.
 */
export function profileFromArgv(argv = process.argv) {
  for (const arg of argv) {
    if (typeof arg !== "string") continue;
    const normalized = arg.replace(/[\\/]+$/, "");
    const match = /[\\/]profiles[\\/]([^\\/]+)$/.exec(normalized);
    if (!match) continue;
    try {
      if (fs.statSync(path.join(normalized, "package.json")).isFile()) return match[1];
    } catch (error) {
      /* not a profile directory — keep looking */
    }
  }
  return null;
}

const UPSTREAM = "https://dpharness.com/api/plugins";
const BEST_UPSTREAM = "https://dpharness.com/api/best";
const SETS_UPSTREAM = "https://dpharness.com/api/sets";
const SITE = "https://dpharness.com";
const TRACK = "https://dpharness.com/api/track/event";
/**
 * Newsletter subscription relay target.
 *
 * The site's `/api/subscribe` is double opt-in: it stores the address as
 * pending and sends the confirmation mail itself. This host only forwards the
 * address — it never stores it. It has to be a local route because the site
 * sends no CORS headers (measured; same reason the event relay exists).
 */
const SUBSCRIBE = "https://dpharness.com/api/subscribe";
const SUBSCRIBE_TIMEOUT_MS = 10 * 1000;
const SUBSCRIBE_WINDOW_MS = 60 * 1000;
/** Kept tight on purpose: a stuck UI must not be able to spray the site. */
const SUBSCRIBE_MAX_PER_WINDOW = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_TAKE = 30;
const MAX_TAKE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15 * 1000;
const EVENT_TIMEOUT_MS = 8 * 1000;

/**
 * Only these site event types may be relayed.
 *
 * The site's `app/api/track/event/route.ts` owns an ALLOWED set; `plugin_hub`
 * was added there together with this plugin (it does not exist upstream yet).
 * `copy_install` is the site's existing type for a copied install command and
 * already carries the package name in `value` — the plugin reuses it as is.
 */
const EVENT_ALLOWLIST = new Set(["copy_install", "plugin_hub"]);
const EVENT_WINDOW_MS = 60 * 1000;
const EVENT_MAX_PER_WINDOW = 120;

/* --------------------------------------------------------------------- install */
/**
 * Install targets are validated with the same character allowlist dshmarket
 * uses before handing anything to a child process (lib/dsh-cli.js TARGET_RE).
 * Anything containing shell metacharacters is refused outright.
 */
const TARGET_RE = /^[A-Za-z0-9@:./_#+~^=-]+$/;
const INSTALL_TIMEOUT_MS = 180 * 1000;
/**
 * 超时之后的收尾宽限。
 *
 * SIGKILL 已经发出，退出事件通常毫秒级就到 —— 这段时间只用来等 close 收尾，
 * 不改变任何结论；到点仍未收敛就**强制解锁**（见 forceUnlock）。它存在的理由是：
 * close 是 active 的**唯一**复位点，而 close 会缺席（2026-10-14 实测宿主因此
 * 彻底装不了任何插件，见 forceUnlock 的注释）。
 */
const INSTALL_SETTLE_MS = 5 * 1000;

/**
 * Re-invoke the dsh CLI that launched this host, instead of looking for `dsh`
 * on PATH (it is not there). Same trick as dshmarket's dshArgv(): the entry is
 * process.argv[1], and spawning it with the current node executable also keeps
 * `process.execArgv` (loader flags) consistent.
 *
 * Spawning through the managed node's bin directory also puts `pnpm` on PATH,
 * because the dsh web process is started by that same node.
 *
 * ⚠️ Under the Electron desktop shell argv[1] is a **flag**, not a path —
 * measured 2026-09-30 on @deepseek-ai/dsh-desktop 0.2.0-rc.2:
 *   argv = [ …/MacOS/DeepSeek Harness, "--expose-internals",
 *            …/app.asar/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/index.js,
 *            …/app.asar/dsh, ~/.dsh/profiles/desktop, …/runtime/primary-runtime ]
 * The old single branch therefore returned null and **every** install died with
 * "cannot locate the dsh entry point (process.argv[1])" — the failure the user
 * sees in the panel. The shell ships its own CLI wrapper, so reuse that.
 */
function dshInvocation() {
  const entry = process.argv[1];
  if (typeof entry === "string" && /[\\/](?:bin\.(?:js|ts)|dsh)$/.test(entry)) {
    const abs = path.resolve(entry);
    return { file: process.execPath, args: [...process.execArgv, abs], cwd: path.dirname(abs) };
  }
  const shellCli = desktopShellCli();
  /* cwd 取用户主目录：桌面版 CLI 位于 .app 包内（只读），任何意外写盘都会失败。
     CLI 自己会切到 profile 目录再跑 pnpm（实测错误信息
     "dsh: pnpm failed in profile directory …" 即由此而来），cwd 只作兜底。 */
  if (shellCli !== null) return { file: shellCli, args: [], cwd: os.homedir() };
  return null;
}

/**
 * The Electron desktop shell ships a CLI wrapper inside its own bundle:
 *   <Contents>/Resources/runtime/cli/bin/dsh
 * It is the only entry that can drive the shell's embedded dsh — a bare
 * `node <asar>/…/bin.js` cannot read asar, and process.execPath there is the
 * Electron binary rather than node. The wrapper itself sets
 * ELECTRON_RUN_AS_NODE=1 and points at dsh-desktop-host/lib/cli.js (read from
 * the file, not guessed).
 *
 * Path derived from the standard macOS bundle layout (…/Contents/MacOS/<App> →
 * …/Contents) and `accessSync`-checked before use, so an unexpected layout
 * degrades to the previous behaviour instead of spawning something wrong.
 */
export function desktopShellCli(execPath = process.execPath, isElectron = typeof process.versions?.electron === "string") {
  if (!isElectron) return null;
  const contents = path.resolve(path.dirname(execPath), "..");
  const candidates = [
    path.join(contents, "Resources", "runtime", "cli", "bin", "dsh"),
    path.join(contents, "Resources", "runtime", "cli", "bin", "dsh.cmd"),
  ];
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch (error) {
      /* try the next candidate */
    }
  }
  return null;
}

const installJob = {
  active: false,
  stage: "idle",
  /* add（安装/升级）| remove（卸载）—— 同一条通道，界面按它决定措辞 */
  verb: "add",
  target: "",
  startedAt: 0,
  finishedAt: 0,
  code: null,
  output: [],
  error: null,
  /* "incompatible" = dsh 自带的兼容性闸门拒绝（见 incompatibleFrom） */
  why: null,
  reject: null,
  /* "changed" / "same"（本来就是目标版本）/ "none"（真的什么都没发生） */
  outcome: null,
};

/* 当前在跑的安装子进程与它的序号。
   序号是给**延迟收尾**用的：超时兜底计时器可能在下一个任务开始之后才到点，
   没有序号就会把新任务误判成"卡死的老任务"解锁掉。 */
let installChild = null;
let installSeq = 0;

/**
 * Build a clean environment for the child process.
 *
 * The host CLI injects a `safe-delete` shim through PATH, NODE_OPTIONS and
 * CODEBUDDY_SAFE_DELETE_*; pnpm unlinks many temp files during an install, so
 * the shim aborts it (measured failure mode: SAFE_DELETE_BULK_CONFIRM_REQUIRED,
 * and EPERM when the shim refuses to unlink locks). Stripping it mirrors what
 * the dsh web supervisor already does for the server process itself.
 */
function sanitizedEnv(binDir) {
  const env = { ...process.env };
  const keep = (entry) => entry && !/cli[\\/]vendor[\\/]shim|safe-delete|vendor[\\/]brokered-bin/.test(entry);
  const parts = String(env.PATH || "").split(path.delimiter).filter(keep);
  env.PATH = [binDir, ...parts].join(path.delimiter);
  for (const key of Object.keys(env)) {
    if (key.startsWith("CODEBUDDY_SAFE_DELETE")) delete env[key];
  }
  if (env.NODE_OPTIONS) {
    const cleaned = env.NODE_OPTIONS
      .split(/\s+/)
      .filter((token) => !/safe-delete|brokered-bin/.test(token))
      .join(" ")
      .trim();
    // 收紧到 --require 被摘掉后可能剩下的孤立路径参数
    if (cleaned === "" || !/--require|--import|--loader/.test(cleaned)) delete env.NODE_OPTIONS;
    else env.NODE_OPTIONS = cleaned;
  }
  return env;
}

/**
 * 去掉 `@版本` 后缀，得到裸包名（`@scope/name@1.2.3` → `@scope/name`）。
 *
 * 用它去 profile 清单/安装目录里查东西 —— 清单的键是裸包名，
 * 带着 `@latest` 去查会永远查不到。
 */
export function stripVersion(target) {
  const value = String(target || "");
  const matched = /^(.*?)@[^@/]+$/.exec(value);
  return matched ? matched[1] : value;
}

/**
 * 把安装任务复位成「已结束」—— **不依赖 close 事件**的兜底解锁。
 *
 * 🔴 2026-10-14 事故（用户实测，代价=整个插件面板再也装不了东西）：
 * 超时分支只把 error 置成 "timeout" 并 kill 掉**直系**子进程，而真正的安装是
 * **孙进程**（宿主 → dsh CLI → pnpm）：SIGKILL 打不到孙进程，它继续跑；孙进程继承了
 * 管道，于是直系子进程的 close 永远不触发 —— 而 active 的唯一复位点就在 close 里。
 * 结果是 active 永久为 true，之后每一次安装都被守卫拦成 409；现场实测卡死 36 分钟，
 * 界面只显示「安装失败：an install is already running」，用户没有任何自救手段。
 *
 * 所以这里做三件事：①无条件解锁；②把仍在跑的进程组再杀一次（best effort）；
 * ③**补读一次磁盘**——超时时真实安装很可能已经成功（本轮事故正是 4.4.2 → 4.4.3
 * 已落盘却报失败），把事实交给界面，别让"超时"被读成"什么都没发生"。
 *
 * @param reason 记进 error 的兜底原因（仅在 error 为空时使用）
 * @param seq    调用方认定的任务序号；与当前序号不符则**不动手**（老计时器迟到）
 *
 * 导出是给 test-local.mjs 用的（同 desktopShellCli / errorLineFrom 的先例）：
 * "迟到计时器必须无害"这条只能从外部验。
 */
export function forceUnlock(reason, seq) {
  if (seq !== undefined && seq !== installSeq) return false;
  if (!installJob.active) return false;
  installJob.active = false;
  installJob.finishedAt = Date.now();
  installJob.stage = "failed";
  if (!installJob.error) installJob.error = reason || "unlocked";
  killInstallTree();
  if (installJob.pkg) {
    const after = installedVersionOf(installJob.pkg);
    if (after !== null && after !== installJob.before) {
      installJob.after = after;
      installJob.outcome = "changed";
      installJob.changed = true;
      /* 版本真变了 ⇒ 更新检查与"已安装"标注的缓存都得作废，否则界面刷新后
         还显示旧版本号，用户会判定"升级没成功"。 */
      updatesCache = { at: 0, value: null };
      installedCache = { at: 0, value: {} };
    }
  }
  return true;
}

/** 按**进程组**杀掉当前安装（detached 让子进程自成一组，杀组才不会漏掉孙进程）。 */
function killInstallTree() {
  const child = installChild;
  installChild = null;
  if (!child || !child.pid) return;
  try {
    process.kill(-child.pid, "SIGKILL");
    return;
  } catch (error) {
    /* 进程组不可用（Windows / 已经退出）→ 退回只杀直系子进程 */
  }
  try {
    child.kill("SIGKILL");
  } catch (error) {
    /* already gone */
  }
}

function startInstall(target, verb) {
  const invocation = dshInvocation();
  if (invocation === null) {
    installJob.active = false;
    installJob.stage = "failed";
    installJob.error = "cannot locate the dsh entry point (process.argv[1])";
    return;
  }
  /* verb：add（安装/升级）或 remove（卸载）。同一条 spawn/轮询/脱敏通道，
     所以三态结论（changed/same/none）对两者都成立：
       remove 时 changed = 卸掉了 / same = 还在（没卸成）/ none = 本来就没装。 */
  installJob.verb = verb === "remove" ? "remove" : "add";
  installJob.active = true;
  installJob.stage = "running";
  installJob.target = target;
  installJob.startedAt = Date.now();
  installJob.finishedAt = 0;
  installJob.code = null;
  installJob.output = [];
  installJob.error = null;
  /* 兼容性闸门是**预期结果**而非意外故障，单独占一个字段，供界面给可操作的说明 */
  installJob.why = null;
  installJob.reject = null;
  /* 装之前的版本号：装完由 host **亲自读磁盘**比对。
     实测（2026-10-12）dsh 的 `plugin add` 对已安装的包会**静默空转** ——
     退出码 0、pnpm.log 0 字节、版本纹丝不动。若只看退出码，界面会谎报"已安装"。 */
  installJob.pkg = stripVersion(target);
  installJob.before = installedVersionOf(installJob.pkg);
  installJob.after = null;
  installJob.changed = null;
  installJob.outcome = null;

  const binDir = path.dirname(process.execPath);
  /* 本任务的序号：所有**延迟**收尾（超时宽限、exit 兜底）都要拿它比对，
     否则迟到的老计时器会把之后那个健康的任务解锁掉。 */
  const seq = ++installSeq;
  const child = spawn(invocation.file, [...invocation.args, "plugin", "--profile", PROFILE, installJob.verb, target], {
    cwd: invocation.cwd,
    env: sanitizedEnv(binDir),
    stdio: ["ignore", "pipe", "pipe"],
    /* detached ⇒ 子进程自成进程组，超时可以按 -pid 杀掉**整棵树**。
       不这么做的话孙进程（真正干活的 pnpm）活下来，close 就永远不来。 */
    detached: true,
  });
  installChild = child;

  const push = (chunk) => {
    const text = String(chunk);
    installJob.output.push(text);
    if (installJob.output.length > 200) installJob.output.shift();
  };
  child.stdout.on("data", push);
  child.stderr.on("data", push);

  const timer = setTimeout(() => {
    installJob.error = "timeout";
    /* 按进程组杀整棵树 —— 只杀直系子进程会把真正干活的 pnpm 孙进程留下
       （2026-10-14 实测它又活了 36 分钟，并把宿主永久卡进 409）。 */
    killInstallTree();
    /* 但 kill 不保证 close 一定来（孙进程握着管道 / 直系子进程已被换掉）⇒ 到点强制解锁。
       这一层是**必须**的：close 是 active 的唯一复位点，它缺席就等于宿主死锁。 */
    setTimeout(() => {
      if (forceUnlock("timeout", seq)) {
        console.warn(`[dpharness] install of ${target} timed out and did not settle — unlocked`);
      }
    }, INSTALL_SETTLE_MS);
  }, INSTALL_TIMEOUT_MS);

  child.on("error", (error) => {
    clearTimeout(timer);
    if (seq !== installSeq) return;
    installJob.active = false;
    installJob.stage = "failed";
    installJob.error = String((error && error.message) || error);
    installJob.finishedAt = Date.now();
    installChild = null;
  });
  /**
   * exit 兜底：进程退了、但 stdio 还被孙进程攥着 ⇒ close 可能永远不来。
   * 等一个宽限期，让 close 有机会做完整收尾（读磁盘核对三态）；它没来就自己解锁。
   */
  child.on("exit", () => {
    setTimeout(() => {
      if (forceUnlock("exit-without-close", seq)) {
        console.warn(`[dpharness] install of ${target} exited without closing its pipes — unlocked`);
      }
    }, INSTALL_SETTLE_MS);
  });
  child.on("close", (code) => {
    clearTimeout(timer);
    if (seq !== installSeq) return;
    installChild = null;
    installJob.active = false;
    installJob.code = code;
    installJob.finishedAt = Date.now();
    installJob.stage = code === 0 ? "done" : "failed";
    if (code === 0) {
      /* 装完**读磁盘**核对：退出码 0 不等于装上了（dsh 对已安装的包会静默空转）。
         ⚠️ 必须三态 —— 别把"本来就是这个版本"说成"什么都没装"（2026-10-12 用户被这句误导：
         他在目录卡片上点「安装」装一个早就装好的插件，界面报"什么都没装"，他读成安装失败）：
           changed  装上了 / 升级了 → 需要重启
           same     **本来就是目标版本** → 这是成功，不是失败
           none     装前装后都查不到 → 那才是真的什么都没发生 */
      installJob.after = installedVersionOf(installJob.pkg);
      installJob.outcome = installJob.before === null && installJob.after === null
        ? "none"
        : (installJob.before === installJob.after ? "same" : "changed");
      installJob.changed = installJob.outcome === "changed";
      /* 装成了就把更新检查的缓存作废：否则界面刷新后拿到的还是装之前那份清单，
         "升完还显示可升级" —— 用户只会判定"升级没成功"（2026-10-12 实测撞到）。 */
      updatesCache = { at: 0, value: null };
      /* 已装版本变了，目录卡片上的「已安装」标注也要跟着刷新 */
      installedCache = { at: 0, value: {} };
    }
    if (code !== 0 && installJob.error === null) {
      const blocked = incompatibleFrom(installJob.output.join(""));
      if (blocked) {
        installJob.why = "incompatible";
        installJob.reject = blocked;
        /* 给一个结构化、可检索的兜底描述；界面会按 why 翻成人话，不依赖这句 */
        installJob.error = `dsh rejected ${blocked.spec} (incompatible with dsh ${blocked.dsh})`;
      } else {
        /* 供应链策略拒绝也单独成类（同 incompatible 的做法）：它是**预期结果**，
           界面要给出条目、剩余等待时间与通路，而不是一句英文错误码。 */
        const aged = releaseAgeFrom(installJob.output.join(""));
        if (aged) {
          installJob.why = "release-age";
          installJob.reject = aged;
          installJob.error = `pnpm supply-chain policy rejected ${aged.count} lockfile entries (minimumReleaseAge)`;
        } else {
          installJob.error = errorLine();
        }
      }
    }
  });
}

/**
 * 展示前的统一脱敏。
 *
 * 为什么必须在**服务端**做（2026-09-30 用户提出，且这次是我先踩了）：
 * pnpm 输出的尾部会原样出现在面板卡片上（安装失败时用于定位），而 `.npmrc` 里的
 * registry token 一旦落到卡片上就会被截图、被日志外带、被会话记录保存 ——
 * **换 token 也挡不住，因为展示路径还在**。所以堵点是"展示"而不是"凭据"。
 *
 * pnpm 多数情况会自己打成 `Bearer npm_[hidden]`（实测 11.7.0），但那不是契约；
 * 这里按最坏情况兜底：只要形如凭据就替换成 `***`。
 *
 * ⚠️ 调用顺序固定为「先截断、后脱敏」—— 反过来的话，截断会把 token 切成半截，
 * 半截 token 照样是泄露，而且再也匹配不上任何模式。
 */
const SECRET_PATTERNS = [
  /* 第三方已自带的部分脱敏（pnpm 实测就是 `Bearer npm_[hidden]`，2026-09-30）。
     内容虽然隐藏了，但"日志里会出现 token"这件事本身就该消失——统一压成 ***，
     信息量不减：`Bearer ***` 仍然告诉读者这次请求带了凭据。 */
  [/\bnpm_\[[^\]]*\]/g, "***"],
  /* .npmrc 常见写法：//registry.npmjs.org/:_authToken=xxx、_auth、_password */
  [/((?:_authToken|_auth|_password|password|token)\s*[=:]\s*)\S+/gi, "$1***"],
  /* Authorization 头：Authorization: Bearer xxx / Basic xxx */
  [/(authorization\s*[=:]\s*)(?:bearer|basic|token)\s+\S+/gi, "$1***"],
  /* 无字段名的裸方案前缀：Bearer npm_xxx（pnpm 的错误提示就是这个形状） */
  [/\b(bearer|basic)\s+[A-Za-z0-9._~+/=-]{12,}/gi, "$1 ***"],
  /* npm 的 token 形状本身 */
  [/npm_[A-Za-z0-9]{16,}/g, "npm_***"],
];

export function redactSecrets(text) {
  let out = String(text == null ? "" : text);
  for (const [pattern, replacement] of SECRET_PATTERNS) out = out.replace(pattern, replacement);
  return out;
}

function tail() {
  return redactSecrets(installJob.output.join("").trim().slice(-600));
}

/**
 * Pull the actionable line out of pnpm output for the failure message.
 *
 * pnpm prints its banner and progress first and the reason last, but the reason
 * is followed by generic prose ("This error happened while installing…"), so a
 * plain "last match wins" scan returns the prose instead of the code. Two passes:
 * a distinctive pnpm error code first, generic wording only as a fallback.
 */
function errorLine() {
  /* 与 tail() 同一口径：这一行同样会展示在卡片上，必须脱敏后再出 */
  return redactSecrets(errorLineFrom(installJob.output.join("")));
}

/**
 * dsh **自带的兼容性闸门**拒绝安装时的专用识别。
 *
 * 实测（2026-10-12，桌面版 dsh 0.2.0-rc.2）：`dsh plugin add <pkg>@latest` 会拿目标版本的
 * peerDependencies 跟本机 dsh 比对，不匹配就**硬拒绝**，输出形如：
 *   dsh: installation rejected: Plugin dsh-restart@0.1.2 is incompatible with dsh 0.2.0-rc.2:
 *        peerDependencies {…}. Running it may cause crashes or data loss. …
 *   dsh: nothing was installed.
 *
 * ⚠️ 这段文本里**没有** ERR_ / error / failed 任何一个关键词，所以通用的 errorLineFrom()
 * 抓不到它，界面只剩一句 "dsh: nothing was installed." —— 用户根本看不出为什么"升级不了"
 * （本次实际踩到）。这里把它识别成一个**闭集原因**（incompatible）并带上两端版本，
 * 交给界面翻成人话：该说的说清（拒绝原因 + 放行通道），且**不代用户放行**。
 */
export function incompatibleFrom(text) {
  const matched = /installation rejected:\s*Plugin\s+(\S+?)\s+is incompatible with dsh\s+([^\s:]+)/i.exec(String(text || ""));
  if (!matched) return null;
  const spec = matched[1];
  const at = spec.lastIndexOf("@");
  return {
    /* name@version 拆开：scoped 包（@scope/name@1.2.3）取最后一个 @ 才是版本分隔符 */
    name: at > 0 ? spec.slice(0, at) : spec,
    version: at > 0 ? spec.slice(at + 1) : "",
    spec,
    dsh: matched[2],
  };
}

/**
 * pnpm **供应链策略**拒绝时的专用识别（pnpm 11 内置 `minimumReleaseAge`，2026-10-14 实测）。
 *
 * 原文形状：
 *   [ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION] 3 lockfile entries failed verification:
 *     dsh-connect-workbuddy@4.4.5 was published at 2026-10-13T20:06:51.203Z, within the minimumReleaseAge cutoff (…)
 *
 * 为什么必须单独识别：它**不是"安装出错"**，而是**策略性拒绝** —— 用户能做的只有「等它满 24 小时」
 * 或「改本机 profile 的豁免名单」，界面得说清"哪几条、大概还要等多久、去哪儿加豁免"。
 * 通用的 errorLineFrom() 只会给出头部那一行 `[ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION] 3 lockfile …`，
 * 用户既看不出这是什么、也不知道下一步做什么（2026-10-14 用户实际撞到，卡片上只有这行原文）。
 *
 * ⚠️ 附带一条实测出来、值得写进界面提示的坑：`minimumReleaseAgeExclude` 是**同一包名只认第一条匹配**
 * （pnpm 源码 evaluateVersionPolicy 命中 name 就 return）⇒ 同一个包写成多条 `name@v1`/`name@v2`
 * 时**只有第一条生效**，必须写成同一条规则 `name@v1 || v2`，或用通配符。
 */
export function releaseAgeFrom(text) {
  const source = String(text || "");
  if (!source.includes("MINIMUM_RELEASE_AGE_VIOLATION")) return null;
  const entries = [];
  let cutoff = null;
  for (const line of source.split(/\r?\n/)) {
    const matched = /(\S+) was published at ([\dT:.Z+-]+), within the minimumReleaseAge cutoff \(([\dT:.Z+-]+)\)/.exec(line);
    if (matched === null) continue;
    const at = matched[1].lastIndexOf("@");
    entries.push({
      /* scoped 包（@scope/name@1.2.3）取最后一个 @ 才是版本分隔符 */
      name: at > 0 ? matched[1].slice(0, at) : matched[1],
      version: at > 0 ? matched[1].slice(at + 1) : "",
      publishedAt: matched[2],
    });
    if (cutoff === null) cutoff = matched[3];
  }
  const counted = /(\d+) lockfile entr(?:y|ies) failed verification/.exec(source);
  return {
    /* 头部条数可能大于可见条数（pnpm 超过上限会省略 "…and N more"），两个都留着 */
    count: counted ? Number(counted[1]) : entries.length,
    cutoff,
    entries,
  };
}

/** Same extraction, exposed for tests (input is the raw captured output). */
export function errorLineFrom(text) {
  const lines = String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const codeRe = /\[ERR_[A-Z_]+\]|ERR_PNPM_[A-Z_]+|E404|404 Not Found|No matching version|Conflicting peer dep/;
  const softRe = /\berror\b|failed|cannot find package|not in the npm registry/i;
  for (const pattern of [codeRe, softRe]) {
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      // 只剥掉「✓ / 项目符号 / 空白」这类装饰前缀，保留 [ERR_…] 的方括号
      const line = lines[i].replace(/^[\s✓✔×✗•·\-–—:]+/, "").replace(/^dsh:\s*/, "");
      if (pattern.test(line)) return line.slice(0, 240);
    }
  }
  return String(text || "").trim().slice(-240);
}

/** Serializable view of the install job (the raw output buffer stays server-side). */
function jobView() {
  return {
    active: installJob.active,
    stage: installJob.stage,
    verb: installJob.verb,
    target: installJob.target,
    seconds: installJob.active ? Math.round((Date.now() - installJob.startedAt) / 1000) : 0,
    code: installJob.code,
    error: installJob.error,
    why: installJob.why,
    reject: installJob.reject,
    pkg: installJob.pkg,
    before: installJob.before,
    after: installJob.after,
    outcome: installJob.outcome,
    changed: installJob.changed,
    tail: installJob.output.length > 0 ? tail() : "",
  };
}

/* ------------------------------------------------------- post-install evidence */
/**
 * Read the profile's own manifest.
 *
 * Verified path (2026-09-21, this machine): `~/.dsh/profiles/<profile>/package.json`
 * holds both `dependencies` (what was resolved) and `dsh.profile.bundles`
 * (what dsh actually loads). The bundle list is the stronger signal — a package
 * can sit in node_modules and still not be loaded.
 *
 * Returns null when the file is unreadable, and callers must propagate that as
 * `null` (unknown) rather than `false` (no) — see buildTrackPayload's note on
 * why "unknown" and "no" must stay distinguishable.
 *
 * No DSH_HOME override here on purpose: that variable is not something this
 * plugin has verified dsh honours, and inventing an env knob would make the
 * probe silently report "unknown" for anyone whose layout differs.
 */
function profileManifest() {
  const dir = path.join(os.homedir(), ".dsh", "profiles", PROFILE);
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
  } catch (error) {
    return null;
  }
}

/** { dep, bundled } — each true / false / null(unknown). */
export function pkgState(pkg, manifest = profileManifest()) {
  if (manifest === null || typeof manifest !== "object") return { dep: null, bundled: null };
  const deps = manifest.dependencies && typeof manifest.dependencies === "object" ? manifest.dependencies : null;
  const profile = manifest.dsh && manifest.dsh.profile ? manifest.dsh.profile : null;
  const bundles = profile && Array.isArray(profile.bundles) ? profile.bundles : null;
  return {
    dep: deps === null ? null : Object.prototype.hasOwnProperty.call(deps, pkg),
    bundled: bundles === null ? null : bundles.includes(pkg),
  };
}

/** key -> { at: epochMs, value: { count, plugins } } */
const cache = new Map();
/** /api/best 单键缓存（榜单每月只重算一次，5 分钟缓存足够） */
let bestCache = { at: 0, value: null };
/** /api/sets 单键缓存（套装同样每月才同步一次，缓存策略与 /best 一致） */
let setsCache = { at: 0, value: null };
let eventWindow = { startedAt: 0, count: 0 };
/* 订阅走独立窗口：与埋点共用预算会让「点了一次订阅」挤掉后续埋点（反之亦然） */
let subscribeWindow = { startedAt: 0, count: 0 };

/**
 * 分类中文名 —— 抄自站点 `lib/category.ts` 的 `CATEGORY_LABEL`（2026-09-17）。
 * 站点未把中文名放进公开 API，这里留一份带出处的副本；站点新增分类需同步。
 */
const CATEGORY_ZH = {
  ads: "营销 / 广告",
  market: "市场 / 管理",
  vision: "视觉能力",
  browser: "浏览器",
  platform: "平台集成",
  ui: "UI / 主题",
  chat: "对话 / 记忆",
  desktop: "桌面端",
  tool: "工具 / 效率",
  other: "其他",
};

/**
 * 从上游文本里挑出「可用的中文句子」，找不到就返回 null。
 *
 * 为什么必须过滤（2026-09-17 实测上游数据，样本见 test-local.mjs）：
 *   `tagline` 约一半不可用 —— 有英文原文、有被截断的中英混排、还有两条是垃圾：
 *   `安装&nbsp;&nbsp;&nbsp;`、`Overview • Architecture • Key Features • Getting Started •…`。
 *   直接展示等于把站点的噪声搬到插件里，与「严选」的定位相反。
 *
 * 判据（都不是拍脑袋，是按实测样本定的）：
 *   - 先按 `• · ｜ |` 再按句末标点切分，**逐段**找中文：站点把中英拼在一起时顺序不固定
 *     （`English · 中文` 也出现过）；
 *   - 中文字符数 ≥ 6：滤掉「安装」「插件」这类词，保留真卖点；
 *   - 段长 ≥ 8：滤掉 `安装&nbsp;`；
 *   - 命中英文导航词开头（Overview/Installation/…）直接丢弃；
 *   - **截断后必须仍含中文**（见 fitZh）。
 *
 * ⚠️ 踩过的坑（2026-09-17 上线后由端到端验证抓到）：
 *   最初在**完整文本**上判中文字数、再 `slice(0, max)` 输出，
 *   于是"中文出现在 max 之后"的样本被切成**纯英文开头**——
 *   卡片上出现了 `Chrome sidebar extension that lets DeepSeek Harness operate…` 这种
 *   既没汉化、又被硬截断的卖点。修法：按句切分（让中文句成为可独立命中的候选）
 *   ＋ `fitZh()` 保证截断结果仍含中文。
 */
function fitZh(text, max) {
  if (text.length <= max) return text;
  const firstZh = text.search(/[\u4e00-\u9fff]/);
  // 中文起点在截断点附近或更靠后时，从中文处起截，避免输出一段纯英文
  if (firstZh >= 0 && firstZh > max - 12) return text.slice(firstZh, firstZh + max).trim();
  return text.slice(0, max).trim();
}

/**
 * 丢掉中文之前的英文长前缀。
 *
 * 为什么需要（2026-09-17 端到端验证抓到的第二个真实问题）：
 * `dsh-context` 的 descriptionZh 长 346 字、含 43 个中文字，但**前 262 字全是英文**
 * （"The best DeepSeek Harness plugin for context insight and management, 一站式…"）。
 * 于是卡片上用户先看到 60+ 字的英文 —— 名义上"有汉化"，观感仍是英文。
 * 短前缀保留（如 "Browser4——面向自主智能体…" 的 "Browser4——" 只有 9 字符）。
 */
function leadWithChinese(text) {
  const firstZh = text.search(/[\u4e00-\u9fff]/);
  if (firstZh <= 12) return text.trim();
  return text.slice(firstZh).trim();
}

export function pickZh(text, max = 120) {
  if (typeof text !== "string") return null;
  const cleaned = text.replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  const segments = cleaned
    .split(/[•·｜|]/)
    .flatMap((chunk) => chunk.split(/(?<=[。！？!?；;])\s*/))
    .map((part) => part.trim())
    .filter(Boolean);
  for (const segment of segments) {
    if (segment.length < 8) continue;
    const zhChars = (segment.match(/[\u4e00-\u9fff]/g) || []).length;
    if (zhChars < 6) continue;
    if (/^(overview|installation|usage|features|readme|getting started|table of contents|documentation)/i.test(segment)) continue;
    const out = fitZh(leadWithChinese(segment.replace(/[…]+$/, "").replace(/\s*[·｜|]\s*$/, "").trim()), max);
    // 截断后可能只剩英文前缀 —— 那种情况不算汉化，继续找下一段
    if ((out.match(/[\u4e00-\u9fff]/g) || []).length < 4) continue;
    return out;
  }
  return null;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Reduce an upstream item to the fields the client actually renders. */
function slim(item) {
  const check = item && item.installCheck;
  // 与站点 lib/installCmd.ts 的 resolveInstallTarget 保持**同一口径**：
  //   只有 installCheck.status === "pass" 时才敢用 npm 包名（校验未过时 npm 上的同名包可能属于别人）；
  //   否则退回 owner/repo，走 GitHub 源安装。
  // ⚠️ 2026-09-17 实测教训：本站此前只认 pkgName，于是「未发布到 npm 但可从源码安装」的插件
  //    在插件里**连命令都不给**，而站点详情页给的是 `dsh plugin --profile web add owner/repo`
  //    并标注「该插件未发布到 npm，走 GitHub 源安装」—— 两套口径，正是 installCmd.ts 注释里
  //    记过的那类分歧（同一插件在不同出口给不同命令）。
  const verified = !!check && check.status === "pass";
  const pkgName = verified && typeof check.pkgName === "string" && check.pkgName ? check.pkgName : null;
  const target = pkgName || item.fullName || "";
  const rawDesc = typeof item.description === "string" ? item.description : "";
  return {
    fullName: item.fullName || null,
    name: item.name || null,
    nameZh: item.nameZh || null,
    owner: item.owner || null,
    url: item.htmlUrl || null,
    // 卖点：优先站点 tagline，其次汉化正文，最后从英文 description 里抠中文段
    sell: pickZh(item.tagline, 90) || pickZh(item.descriptionZh, 90) || pickZh(rawDesc, 90) || null,
    // 汉化正文：站点 descriptionZh（2026-09-17 起公开 API 才带出来）→ 中文段 → null
    descZh: pickZh(item.descriptionZh, 400) || pickZh(rawDesc, 400) || null,
    // 原文兜底：没有汉化时展示它，并让客户端标注「未汉化」
    desc: rawDesc.replace(/\s+/g, " ").trim().slice(0, 280),
    cat: CATEGORY_ZH[item.category] || CATEGORY_ZH.other,
    stars: typeof item.stars === "number" ? item.stars : 0,
    category: item.category || null,
    tier: item.tier || null,
    type: item.pluginType || null,
    compat: item.dshCompat || null,
    risk: item.riskLevel || null,
    verify: item.verifyStatus || null,
    tested: item.testedStatus || null,
    /** 一键安装按钮的开关：只在站点已验证过 npm 包名时打开 */
    pkg: pkgName,
    /** 命令的来源类型，供前端标注「npm」还是「GitHub 源」 */
    src: pkgName ? "npm" : "repo",
    /** 站点是否验证通过（pass）；未验证/警告都按保守处理 */
    verified,
    /* ⚠️ 这里必须用**本机真实 profile**，不能抄站点详情页的 `--profile web`（2026-10-12 修正）。
       原先照抄站点口径是想"两个出口给同一句话"，但对 desktop profile 的用户来说，
       复制出来的命令会装进 **web** profile —— 桌面上永远看不到那个插件，
       用户只会得出"安装不成功"（实测用户就是这么撞上的）。
       站点无法知道你本机用的是哪个 profile，所以这一处**必须分歧**：命令是给人当场执行的。 */
    cmd: target ? `dsh plugin --profile ${PROFILE} add ${target}` : null,
  };
}

function parseQuery(req) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
  const sort = (url.searchParams.get("sort") || "").trim().slice(0, 32);
  const rawTake = Number.parseInt(url.searchParams.get("take") || "", 10);
  const take = Number.isFinite(rawTake) ? Math.min(Math.max(rawTake, 1), MAX_TAKE) : DEFAULT_TAKE;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("take", String(take));
  if (sort) params.set("sort", sort);
  return params;
}

/**
 * Raw query access for routes with their own parameter set.
 *
 * Do NOT reuse parseQuery() outside search/best: it is a **whitelist** and only
 * emits q/take/sort, so any other parameter silently reads as empty
 * (measured 2026-09-21 — the postinstall route got pkg="" from `?pkg=…` until
 * it stopped sharing that helper).
 */
function readParams(req) {
  return new URL(req.url || "/", "http://127.0.0.1").searchParams;
}

async function fetchCatalog(params) {
  const key = params.toString();
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.at < CACHE_TTL_MS) {
    return { count: hit.value.count, total: hit.value.total, plugins: hit.value.plugins, cached: true, fetchedAt: hit.at };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const url = key ? `${UPSTREAM}?${key}` : UPSTREAM;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": `dsh-dpharness/${VERSION}`,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`upstream HTTP ${response.status}`);
    const body = await response.json();
    const list = Array.isArray(body && body.plugins) ? body.plugins : [];
    /* 上游同时给两个数：count = 本次返回条数，total = 该筛选下的真实命中总数。
       ⚠️ 以前只取 list.length 当结果数，于是「共 N 条结果」里的 N 永远等于 take
       （默认 30）—— 搜索前后这个数字完全不变，用户据此判定「搜索不生效」
       （2026-09-30 实测：搜「统计」真实命中 106 条，面板写死「共 30 条结果」）。
       total 缺失时退回 list.length，保证老上游下文案仍有意义。 */
    const total = Number.isFinite(body && body.total) ? body.total : list.length;
    const value = { count: list.length, total, plugins: list.map(slim) };
    cache.set(key, { at: Date.now(), value });
    return { ...value, cached: false, fetchedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 「分类精选」榜单（站点 /api/best，2026-09-18 新增的只读接口）。
 *
 * 与 fetchCatalog 的关系：两者都是站点的策展/目录数据，**条目一律走同一个 slim()**，
 * 否则卡片会出现两套字段口径（本站已经栽过一次：命令口径不一致）。
 * 唯一补充是 `category`：上游 /api/best 只给大类 key 在分组结构里，
 * 条目本身没有 Plugin.category，故把所在大类的 key 注入每条，卡片才能显示正确分类。
 */
async function fetchBest() {
  const now = Date.now();
  if (bestCache.value && now - bestCache.at < CACHE_TTL_MS) {
    return { ...bestCache.value, cached: true, fetchedAt: bestCache.at };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(BEST_UPSTREAM, {
      headers: { accept: "application/json", "user-agent": `dsh-dpharness/${VERSION}` },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`upstream HTTP ${response.status}`);
    const body = await response.json();
    const categories = (Array.isArray(body && body.categories) ? body.categories : []).map((cat) => ({
      key: cat.key,
      label: cat.label,
      count: cat.count,
      subs: (Array.isArray(cat.subs) ? cat.subs : []).map((sub) => ({
        key: sub.key,
        label: sub.label,
        summary: sub.summary || "",
        items: (Array.isArray(sub.items) ? sub.items : []).map((item) => ({
          ...slim({ ...item, category: cat.key }),
          // 名次与上榜理由是「为什么是它」的依据，不能丢
          rank: typeof item.rank === "number" ? item.rank : null,
          reason: typeof item.reason === "string" ? item.reason : "",
        })),
      })),
    }));
    const value = {
      month: body && typeof body.month === "string" ? body.month : null,
      total: typeof (body && body.total) === "number" ? body.total : 0,
      categories,
      // rank 越靠前的越该被看见，这里按小类聚合但保持接口给的顺序（口径与页面一致）
    };
    bestCache = { at: Date.now(), value };
    return { ...value, cached: false, fetchedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 「组合方案套装」（站点 /api/sets 的同源数据，2026-10-13 新增）。
 *
 * 与 /best 的分工：best 是同类**横向**最优（按小类导购）；sets 是跨插件**纵向**
 * 组合（一整套协作方案 + 安装顺序 + 冲突提示）。两者都回答"该装哪个"，但粒度不同 ——
 * 用户说"我要做 OCR"时，套装才是答案。
 *
 * ⚠️ 命令一律**由本机拼装**，不抄站点给的字符串：
 *   · 站点侧的命令常量 profile 是 `web`，而本机可能是 desktop（抄了就是错命令，
 *     桌面用户装进 web profile 后永远看不到 —— 2026-10-12 已实测踩过）；
 *   · 站点条目自带 `pluginTier`（core|related）与 `installCheck`，`slim` 已有同一套
 *     target 口径（pass 用包名，否则 owner/repo）+ 本机 profile 注入；
 *   · `related`（MCP / Koishi / 通用客户端等无 npm 归属可核验的生态）走 git clone ——
 *     与站点 lib/installCmd.ts 的 resolveSetItemCommand 同为一条规则。
 *   批量命令 = 逐条命令按安装顺序换行拼接（与站点 buildSetInstallBlock 同语义）。
 *
 * ⚠️ 套装条目的 `tier`（套装内必要性 required|enhance|optional）与插件的 `tier`
 *   （生态分层 core|related）**同名不同义**，传输时后者已由站点改名为 `pluginTier`。
 */
async function fetchSets() {
  const now = Date.now();
  if (setsCache.value && now - setsCache.at < CACHE_TTL_MS) {
    return { ...setsCache.value, cached: true, fetchedAt: setsCache.at };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(SETS_UPSTREAM, {
      headers: { accept: "application/json", "user-agent": `dsh-dpharness/${VERSION}` },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`upstream HTTP ${response.status}`);
    const body = await response.json();
    const installed = installedMap();
    const sets = (Array.isArray(body && body.sets) ? body.sets : []).map((set) => {
      const items = (Array.isArray(set.items) ? set.items : []).map((raw) => {
        /* tier 覆盖成**插件的**生态分层再交给 slim —— 否则 slim 会把套装必要性
           （required/enhance/optional）当生态分层读，"related → git clone" 永远不成立。 */
        const shaped = slim(Object.assign({}, raw, { tier: raw.pluginTier, category: null }));
        if (shaped.tier === "related" && shaped.fullName) {
          shaped.cmd = `git clone https://github.com/${shaped.fullName}.git`;
          shaped.src = "repo";
        }
        return Object.assign(shaped, {
          /* 套装内必要性（与 slim 的 tier 不是一回事，单列一个字段避免混用） */
          need: raw.tier || "enhance",
          /* 槽位职责：这个"位置"是干什么的（滚动槽位每月可能换人，所以不写插件名） */
          slotRole: raw.slotRole || null,
          installed: installedOf(shaped, installed),
        });
      });
      return {
        slug: set.slug || null,
        name: set.name || null,
        summary: set.summary || "",
        audience: set.audience || null,
        sceneLabel: set.sceneLabel || null,
        itemCount: items.length,
        risk: set.risk || null,
        syncedMonth: set.syncedMonth || null,
        syncedSlots: typeof set.syncedSlots === "number" ? set.syncedSlots : null,
        syncedReplaced: typeof set.syncedReplaced === "number" ? set.syncedReplaced : null,
        conflictNote: set.conflictNote || null,
        steps: set.steps || null,
        exampleParams: set.exampleParams || null,
        effectNote: set.effectNote || null,
        url: set.url ? `${SITE}${set.url}` : null,
        /* 批量安装命令：逐条命令按顺序换行拼接（顺序即安装顺序） */
        installBlock: items.map((item) => item.cmd).filter(Boolean).join("\n"),
        items,
      };
    }).filter((set) => set.itemCount > 0);
    const value = {
      total: sets.length,
      sets,
    };
    setsCache = { at: Date.now(), value };
    return { ...value, cached: false, fetchedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 「周榜」两条线（站点 /api/board/{top,installs}，2026-10-20 新增的只读接口）。
 *
 * ── 两个榜不是一回事，**不要合并**──────────────────────────────────────────
 *   top      = 精选插件 Top 榜：按 npm **全网周下载量**排序，20 条，周一落期次快照
 *   installs = 真装机周榜：按站内 `copy_install` **去重访客**排序，30 条，滚动 7 天
 * 前者衡量"全网有多热"，后者衡量"本站真有人在装"。两者差好几个数量级，
 * 放在同一个榜单里用户会互相对照并得出错误结论（站点侧同样是两个独立页面）。
 *
 * ── 字段为什么要重新拼 ─────────────────────────────────────────────────────
 * 两条上游的条目形状不同：
 *   · top 直接给 `installCheck { status, pkgName }`（与 catalog 同形）；
 *   · installs 给的是扁平 `installStatus` + `pkgName`。
 * 若不在这里归一，`slim()` 就要长出第二个分支 —— 而它承载的是「命令该用包名
 * 还是 owner/repo」这条唯一口径。⇒ 归一放在本层，`slim()` 一行不改。
 *
 * ⚠️ 份额（sharePct）**有意不透传**：站内复制安装也计入本榜口径，榜进插件后
 *   上榜条目曝光更多、复制更多，份额会自我强化。卡片只给「本周 / 上周 / 增减」，
 *   足以判断趋势，不把百分比摊到用户面前。
 */
const BOARD_UPSTREAM = `${SITE}/api/board`;
/** 两个榜的缓存：top 一周才变（5 分钟足够），installs 与站点侧 60s 缓存对齐 */
const BOARD_TTL_MS = { top: 300_000, installs: 60_000 };
const boardCache = { top: { at: 0, value: null }, installs: { at: 0, value: null } };

async function fetchBoard(kind) {
  const now = Date.now();
  const slot = boardCache[kind];
  if (slot.value && now - slot.at < BOARD_TTL_MS[kind]) {
    return { ...slot.value, cached: true, fetchedAt: slot.at };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${BOARD_UPSTREAM}/${kind}`, {
      headers: { accept: "application/json", "user-agent": `dsh-dpharness/${VERSION}` },
      signal: controller.signal,
    });
    // 站点接口尚未发版时是 404 —— 让调用方拿到明确的状态码，不要伪装成"空榜单"
    if (!response.ok) throw new Error(`upstream HTTP ${response.status}`);
    const body = await response.json();
    const installed = installedMap();
    const items = (Array.isArray(body && body.items) ? body.items : []).map((raw) => {
      /* installs 侧的形状归一：扁平 installStatus → installCheck 对象。
         只搬事实（pkgName 原样带过来，不做 pass 过滤），是否可信由 slim() 判定。 */
      const normalized =
        raw && raw.installCheck === undefined
          ? { ...raw, installCheck: raw.pkgName ? { status: raw.installStatus || null, pkgName: raw.pkgName } : null }
          : raw;
      const shaped = slim(normalized);
      const extra =
        kind === "top"
          ? { rank: Number(raw && raw.rank) || null, weekly: Number(raw && raw.weeklyDownloads) || 0 }
          : {
              rank: null,
              weekly: null,
              thisUv: Number(raw && raw.thisUv) || 0,
              prevUv: Number(raw && raw.prevUv) || 0,
              delta: Number(raw && raw.delta) || 0,
            };
      return Object.assign(shaped, extra, { installed: installedOf(shaped, installed) });
    });
    const value =
      kind === "top"
        ? {
            total: items.length,
            period: (body && body.period) || null,
            periodNo: (body && body.periodNo) || null,
            weekStart: (body && body.weekStart) || null,
            capturedAt: (body && body.capturedAt) || null,
            dataFrom: (body && body.dataFrom) || null,
            dataTo: (body && body.dataTo) || null,
            /* true = 当期快照还没回填，此次是实时口径（页面不得显示"第 N 期"） */
            live: !!(body && body.isLive),
            eligibleCount: Number(body && body.eligibleCount) || 0,
            totalPlugins: Number(body && body.totalPlugins) || 0,
            items,
          }
        : {
            total: items.length,
            windowStart: (body && body.windowStart) || null,
            prevWindowStart: (body && body.prevWindowStart) || null,
            totalUv: Number(body && body.totalUv) || 0,
            totalPrevUv: Number(body && body.totalPrevUv) || 0,
            mappedUv: Number(body && body.mappedUv) || 0,
            items,
          };
    boardCache[kind] = { at: Date.now(), value };
    return { ...value, cached: false, fetchedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

function withinEventBudget() {
  const now = Date.now();
  if (now - eventWindow.startedAt > EVENT_WINDOW_MS) {
    eventWindow = { startedAt: now, count: 0 };
  }
  eventWindow.count += 1;
  return eventWindow.count <= EVENT_MAX_PER_WINDOW;
}

/** Same sliding-window shape as withinEventBudget, separate budget. */
function withinSubscribeBudget() {
  const now = Date.now();
  if (now - subscribeWindow.startedAt > SUBSCRIBE_WINDOW_MS) {
    subscribeWindow = { startedAt: now, count: 0 };
  }
  subscribeWindow.count += 1;
  return subscribeWindow.count <= SUBSCRIBE_MAX_PER_WINDOW;
}

const clampText = (value, max) => (typeof value === "string" ? value.slice(0, max) : "");

/**
 * Build the site's event payload.
 *
 * Site contract (read from app/api/track/event/route.ts, not guessed):
 *   { type, value, path, visitorId }
 *   - type   ∈ ALLOWED set there
 *   - path   is truncated at "?" (`path.split("?")[0]`) and must not start with
 *            /api, /dashboard or /_next → so all detail goes in `value`, never in a query
 *   - value  trimmed and capped at 120 chars, free text
 *   - visitorId must match /^[A-Za-z0-9-]{8,64}$/ or it is dropped
 *   - the route also filters loopback IPs, bot UAs and SELF_IP_HASHES
 */
function buildTrackPayload(input) {
  const type = clampText(input.event, 32);
  const rawVisitor = clampText(input.visitorId, 64);
  const visitorId = /^[A-Za-z0-9-]{8,64}$/.test(rawVisitor) ? rawVisitor : null;
  const detail = input.detail && typeof input.detail === "object" ? input.detail : {};
  const clean = (value, max) => String(value == null ? "" : value).replace(/[^A-Za-z0-9@/._:-]/g, "").slice(0, max);
  // 命令含空格，需单独净化：保留空格但折叠，其余字符收紧
  const cleanCommand = (value) => String(value == null ? "" : value)
    .replace(/[^A-Za-z0-9@/._: -]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  let value = "";
  if (type === "copy_install") {
    // 与站点既有口径一致：copy_install 的 value 是**整条命令**
    // （站点 components/HubUI.tsx 的 InstallBlock 就是 trackEvent("copy_install", command)）。
    // 来源靠 path 区分（站点是页面路径，插件固定 /dsh-plugin），不靠 value。
    value = cleanCommand(detail.cmd) || cleanCommand(detail.pkg);
  } else {
    // plugin_hub carries "<action>:<detail>" — query strings would be truncated away.
    const action = clean(detail.action, 24) || "unknown";
    const parts = [action];
    if (Number.isFinite(detail.length)) parts.push("len=" + Number(detail.length));
    if (Number.isFinite(detail.results)) parts.push("hits=" + Number(detail.results));
    // `via` 记录动作发生在哪条路径上（footer/overlay/local/market）；
    // 旧版 open 事件用的字段名是 `scope`，保留兼容，避免同一含义两个键。
    const via = detail.via || detail.scope;
    if (via) parts.push("via=" + clean(via, 12));
    // `why` 是**闭集枚举**（http_405 / network / busy / timeout / cli_exit …），
    // 不是错误原文：原文可能含本地路径与包名，既超长又不可聚合。
    // 2026-09-30 起 HTTP 失败细化为 `http_<status>`（原 market_http 已被取代）——
    // 只有区分 405（路由缺席）/403（被拦）/5xx（上游故障）才能定位市场通道的问题。
    if (detail.why) parts.push("why=" + clean(detail.why, 24));
    // 布尔量只在**明确知道**时才写入（调用方不传即省略）。
    // 省略 = 未知，与 `=0`（明确为否）必须在数据层可区分 —— 否则「查不到」
    // 会被统计成一个具体的否定结论。
    for (const flag of ["restarted", "bundled", "dep"]) {
      if (typeof detail[flag] === "boolean") parts.push(flag + "=" + (detail[flag] ? 1 : 0));
    }
    // 版本号由 host 统一附加（客户端读不到 package.json）。
    // 这是「新埋点覆盖率」的唯一判据：老版本插件永远发不出新事件，
    // 看板上的空值既可能是"没人做过"也可能是"老版本没上报"，只有版本维能切开。
    parts.push("v=" + VERSION);
    value = parts.join(":").slice(0, 120);
  }

  return { type, value, path: "/dsh-plugin", visitorId };
}

function registerRoute(ctx, pathname, handler) {
  ctx.effect(
    () => ctx.webServer.register({ kind: "prefix", path: pathname, handler }),
    `dpharness: ${pathname} route`,
  );
}

/* --------------------------------------------------------------- 更新日志 */
/** /api/dpharness/changelog 的结果缓存（日志正文与版本号都不是秒级变化的数据）。 */
let changelogCache = null;

/**
 * 任一个包在 npm 上的最新版（走 npmmirror）。本插件自身与「已装插件」的检查共用它。
 *
 * 查不到就返回 null —— **既不编造版本号，也不把「查不到」当成「已是最新」**：
 * 这两件事在界面上是两句不同的话，混为一谈会让离线用户以为自己已经最新而错过升级。
 * （同类三态问题本插件已踩过一次：postinstall 的 restarted 绝不用 false 兜底。）
 */
async function fetchNpmVersion(pkg) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(npmLatestUrl(pkg), {
      headers: { accept: "application/json", "user-agent": `dsh-dpharness/${VERSION}` },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`npm HTTP ${response.status}`);
    const body = await response.json();
    const version = body && typeof body.version === "string" ? body.version.trim() : "";
    return /^\d+\.\d+\.\d+/.test(version) ? version : null;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GitHub Releases（可选增强）。
 *
 * 仓库没发过 Release 时 GitHub 返回 `[]`（实测 2026-10-12 就是这种状态），
 * 网络/代理失败返回 null —— 两者都不该让「更新日志」整体不可用，故一律降级到内置底稿。
 */
async function fetchReleases() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(RELEASES_URL, {
      headers: { accept: "application/vnd.github+json", "user-agent": `dsh-dpharness/${VERSION}` },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`github HTTP ${response.status}`);
    const body = await response.json();
    return Array.isArray(body) ? body : [];
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* --------------------------------------------- 已装插件的更新检查（v0.5.0） */
/** 逐包出站请求的并发上限。全串行会拖到十几秒，全并发容易触发镜像限流。 */
const UPDATE_CONCURRENCY = 6;
/** 结果缓存。比目录的 5 分钟更长：这一段是 N 个出站请求，不该被反复触发。 */
const UPDATE_TTL_MS = 10 * 60 * 1000;
/** 「检查更新」按钮连点时的最小间隔：缓存可以绕过，但镜像不能被连点打爆。 */
const UPDATE_MIN_FORCE_MS = 30 * 1000;
let updatesCache = { at: 0, value: null };

/** profile 目录。与 profileManifest() 同源，避免两处各拼一次路径。 */
function profileDir() {
  return path.join(os.homedir(), ".dsh", "profiles", PROFILE);
}

/**
 * profile 里声明过的依赖清单（即「用户装了什么」）。
 *
 * 纯函数 + 入参可注入，便于单测；`bundled` 与 pkgState() 同口径
 * —— bundles 是更强的信号：包躺在 node_modules 里也可能根本没被加载。
 */
export function pluginCandidates(manifest) {
  if (manifest === null || typeof manifest !== "object") return [];
  const deps = manifest.dependencies && typeof manifest.dependencies === "object" ? manifest.dependencies : null;
  if (deps === null) return [];
  const profile = manifest.dsh && manifest.dsh.profile ? manifest.dsh.profile : null;
  const bundles = profile && Array.isArray(profile.bundles) ? profile.bundles : [];
  /* spec 一并带出来：它决定"这个包能不能靠 plugin add 升级"（见 classifySpec） */
  return Object.keys(deps).sort().map((name) => ({
    name,
    bundled: bundles.includes(name),
    spec: typeof deps[name] === "string" ? deps[name] : "",
  }));
}

/**
 * 依赖 spec 的形态 —— 它决定"还能不能升级"，这是实测撞出来的三类：
 *
 *   local  : `link:…` / `file:…` —— **本地开发链接**，指向本机源码目录。
 *            "升级"它等于去装 npm 上的版本，既会被 dsh 的兼容性闸门拒，
 *            **语义上也是错的**（用户自己正在开发这个包）。实测本机 desktop profile
 *            20 个依赖里有 11 个是这种，其中就包括本插件自己。
 *   pinned : `0.5.27` 这种**精确锁定**。`plugin add` 不会把它挪走（实测版本号纹丝不动）。
 *   range  : `^0.8.5` 这类允许浮动的范围。
 *
 * 判定只看清单里写的形态，不猜语义 —— 猜错会误伤（比如把范围包当成锁定包）。
 */
export function classifySpec(spec) {
  const value = String(spec || "");
  if (value.startsWith("link:") || value.startsWith("file:")) return "local";
  if (/^\d/.test(value)) return "pinned";
  return "range";
}

/**
 * 读一个已装包在 profile 里的实际版本，并判断它是不是 dsh 插件。
 *
 * 判据按**插件契约**判，不按包名猜（`dsh-` 前缀不是契约，第三方包名五花八门）：
 *   · package.json 里声明了 dsh 字段（dsh.bundle / dsh.client），或
 *   · 依赖里出现 @deepseek-ai/dsh —— 与站点 lib/detect.ts 的分层判据同源。
 * 读不到返回 null（未知），调用方必须把它和「不是插件」分开处理。
 */
export function readInstalled(name, dir = profileDir()) {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, "node_modules", name, "package.json"), "utf8"));
    const deps = manifest.dependencies && typeof manifest.dependencies === "object" ? manifest.dependencies : {};
    const peers = manifest.peerDependencies && typeof manifest.peerDependencies === "object" ? manifest.peerDependencies : {};
    return {
      version: typeof manifest.version === "string" ? manifest.version : null,
      plugin: Boolean(manifest.dsh && typeof manifest.dsh === "object")
        || Object.prototype.hasOwnProperty.call(deps, "@deepseek-ai/dsh")
        || Object.prototype.hasOwnProperty.call(peers, "@deepseek-ai/dsh"),
      /* 原文描述。中文名/说明都没有时，界面拿它兜底并明确标注「未汉化」——不假装有中文。 */
      desc: typeof manifest.description === "string" ? manifest.description.trim().slice(0, 200) : "",
    };
  } catch (error) {
    return null;
  }
}

/* -------------------------------------- 已装插件的「这是谁」（v0.5.0） */
/**
 * 只显示 npm 包名（dsh-context / billion-context），用户认不出这是哪个插件 ——
 * 「更新」页面的价值就塌了一半（它要回答的是"我装的哪些该升级"，前提是认得出是谁）。
 *
 * 两个来源**互补且都不完整**（2026-10-12 实测本机 desktop profile 的 20 个依赖）：
 *   · 本机 `<pkg>/locale/zh.json` 的 meta.title：15/20 —— 离线、零请求，
 *     而且是**包自己声明**的，最贴近"这是谁"；
 *   · 站点目录（`take=500`，而目录共 17304 条）：9/20 —— 但补上了本机完全没有的那 5 个。
 *   并集 20/20。单用任何一个都会让一部分插件只剩裸包名 —— 那就等于没说。
 */
const IDENTITY_TTL_MS = 30 * 60 * 1000;
let identityCache = { at: 0, value: new Map() };

/**
 * 读包自己声明的中文元数据（离线）。读不到返回 null —— **不猜、不翻译、不编造**。
 *
 * 顺带清掉 meta.title 里常见的那截包名：社区惯例写成
 * 「模型优惠时钟 (dsh-client-ui-model-clock)」，而包名在界面上另有位置，
 * 重复一次只会让行更挤。只在括号里含 ASCII 字母时才当它是包名（「插件（官方）」不该被砍）。
 */
export function localIdentity(name, dir = profileDir()) {
  const base = path.join(dir, "node_modules", name, "locale");
  for (const file of ["zh.json", "zh-CN.json"]) {
    try {
      const meta = JSON.parse(fs.readFileSync(path.join(base, file), "utf8")).meta || {};
      const title = typeof meta.title === "string" ? meta.title.trim() : "";
      if (!/[\u4e00-\u9fff]/.test(title)) continue;
      const cleaned = title.replace(/\s*[（(][^）)]*[A-Za-z@][^）)]*[）)]\s*$/, "").trim() || title;
      return { nameZh: cleaned.slice(0, 40), note: pickZh(meta.description, 80) || "" };
    } catch (error) {
      /* 没有这个文件、或不是 JSON —— 继续试下一个候选文件名 */
    }
  }
  return null;
}

/** 站点目录里 pkgName → { nameZh, note } 的映射（一次 take=500，缓存）。 */
async function fetchCatalogIdentity() {
  const now = Date.now();
  if (now - identityCache.at < IDENTITY_TTL_MS) return identityCache.value;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${UPSTREAM}?take=500`, {
      headers: { accept: "application/json", "user-agent": `dsh-dpharness/${VERSION}` },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`upstream HTTP ${response.status}`);
    const body = await response.json();
    const map = new Map();
    (Array.isArray(body && body.plugins) ? body.plugins : []).forEach((item) => {
      const pkg = item && item.installCheck && item.installCheck.pkgName;
      if (!pkg) return;
      const nameZh = typeof item.nameZh === "string" && /[\u4e00-\u9fff]/.test(item.nameZh) ? item.nameZh.trim().slice(0, 40) : "";
      const note = pickZh(item.tagline, 80) || pickZh(item.descriptionZh, 80) || "";
      if (nameZh || note) map.set(pkg, { nameZh, note });
    });
    identityCache = { at: now, value: map };
    return map;
  } catch (error) {
    /* 站点不可达就只靠本机 locale —— 降级，不影响更新检查本身 */
    return new Map();
  } finally {
    clearTimeout(timer);
  }
}

/** 安装目录里的版本号；查不到返回 null（未知，不等于"没装"）。 */
function installedVersionOf(pkg) {
  const info = readInstalled(pkg);
  return info ? info.version : null;
}

/** 一个目录条目对应的已装版本（先按 npm 包名查，退回 owner/repo），查不到就 null。 */
function installedOf(item, map) {
  if (!item || !map) return null;
  return map[item.pkg || ""] || map[item.fullName || ""] || null;
}

/**
 * profile 里"已装了哪些、装的什么版本"（键为包名）。
 *
 * 用途：目录卡片上把「安装」标成「已安装 vX」—— 实测有用户对着一个早就装好的插件
 * 反复点「安装」，然后判定"安装不成功"（他无从知道那东西其实已经在跑了）。
 * 30 秒缓存：搜索是边打字边发的，不该每次都读几十个 package.json。
 */
let installedCache = { at: 0, value: {} };
function installedMap() {
  const now = Date.now();
  if (now - installedCache.at < 30 * 1000) return installedCache.value;
  const dir = profileDir();
  const map = {};
  pluginCandidates(profileManifest()).forEach((row) => {
    const info = readInstalled(row.name, dir);
    if (info && info.version) map[row.name] = info.version;
  });
  installedCache = { at: now, value: map };
  return map;
}

/** 带并发上限的 map：保住顺序，也别把镜像打爆。 */
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = [];
  for (let index = 0; index < Math.min(limit, items.length); index += 1) {
    runners.push((async () => {
      while (cursor < items.length) {
        /* 取号与自增都是**同步**完成的（在 await 之前），所以两个 runner 不会拿到同一个下标 */
        const current = cursor;
        cursor += 1;
        results[current] = await worker(items[current], current);
      }
    })());
  }
  await Promise.all(runners);
  return results;
}

/** 排序权重：可升级的最前，其次未知，最后已最新 —— 让「该做什么」排在最上面。 */
function rankUpdate(entry) {
  if (entry.outdated === true) return 0;
  if (entry.outdated === null) return 1;
  return 2;
}

/** 按「可升级 → 未知 → 已最新，再按包名」排序（就地排序，返回同一个数组便于断言）。 */
export function sortUpdates(entries) {
  return (Array.isArray(entries) ? entries : []).slice().sort((a, b) => (rankUpdate(a) - rankUpdate(b)) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/**
 * 组装一次完整的更新检查结果：本插件自身 + 已装插件。
 *
 * 本插件**从已装列表里摘出来单独给**（self）—— 它同时出现在 profile 的 dependencies 里，
 * 两处都列会让人以为有两个不同的东西要升级。
 */
/** pluginManager 的已知拒绝原因（界面据此出中文；不在表里的原样展示）。 */
const TOGGLE_FAILURE_CODES = ["unknown-plugin", "management-required", "unaddressable", "incompatible-version"];

/** 使用频次引擎失败时不产出结论（三态），绝不让「没测到」冒充「没在用」。 */
function safeUsageReport() {
  try {
    return getUsageReport();
  } catch {
    return null;
  }
}

/**
 * 启用状态（三态）：从运行时 `pluginManager` 服务读取。
 * 服务不存在（或读取失败）→ null，全部按「未知」处理，不猜。
 */
async function enabledMapOf(ctx) {
  try {
    const manager = ctx && typeof ctx.get === "function" ? ctx.get("pluginManager") : undefined;
    if (!manager || typeof manager.listPlugins !== "function") return null;
    const rows = await manager.listPlugins();
    const map = new Map();
    for (const row of Array.isArray(rows) ? rows : []) {
      if (row && typeof row.moduleName === "string") map.set(row.moduleName, row.enabled !== false);
    }
    return map;
  } catch {
    return null;
  }
}

/** 安装/最近变化时间（粗略）：node_modules/<pkg> 的 mtime。link: 包指向源码目录，不适用，给 null。 */
function installedAtOf(name, dir, kind) {
  if (kind === "local") return null;
  try {
    return fs.statSync(path.join(dir, "node_modules", name)).mtimeMs || null;
  } catch {
    return null;
  }
}

/** 单个包的使用记录；引擎不可用给 null，无归属工具的包给 { measurable:false }。 */
function usageFor(usageReport, pkg) {
  if (!usageReport) return null;
  const found = usageReport.plugins && usageReport.plugins[pkg];
  if (found) return found;
  return { measurable: false, calls: 0, sessions: 0, lastUsedMs: null, tools: [] };
}

async function buildUpdates(ctx) {
  const dir = profileDir();
  const candidates = pluginCandidates(profileManifest());
  const usageReport = safeUsageReport();
  const enabledByPkg = await enabledMapOf(ctx);
  const installed = await mapLimit(candidates, UPDATE_CONCURRENCY, (candidate) => readInstalled(candidate.name, dir));
  const rows = candidates.map((candidate, index) => ({ ...candidate, info: installed[index], kind: classifySpec(candidate.spec) }));
  /* 本地链接的包**不参与更新检查**：它们的"版本"来自本机源码，跟 npm 上的最新版没有关系。
     实测本机 desktop profile 的 20 个依赖里有 11 个是这种（含本插件自己）——
     把它们当"可升级"列出来，只会让用户点一次、失败一次（而且方向本来就是错的）。 */
  const locals = rows.filter((row) => row.kind === "local").map((row) => {
    const usageRow = usageFor(usageReport, row.name);
    const enabled = enabledByPkg ? (enabledByPkg.has(row.name) ? enabledByPkg.get(row.name) : null) : null;
    return {
      name: row.name,
      spec: row.spec,
      enabled,
      installedAtMs: installedAtOf(row.name, dir, row.kind),
      usage: usageRow,
      tier: classifyUsage(enabled, usageRow),
    };
  });
  const plugins = rows.filter((row) => row.kind !== "local" && row.info && row.info.plugin && row.name !== PKG_NAME);
  const versions = await mapLimit(plugins, UPDATE_CONCURRENCY, (row) => fetchNpmVersion(row.name));

  /* 「这是谁」：先读本机 locale（离线、零请求），缺口再用站点目录补一次 —— 并集才完整 */
  const identity = new Map();
  plugins.forEach((row) => {
    const found = localIdentity(row.name, dir);
    if (found) identity.set(row.name, found);
  });
  if (plugins.some((row) => {
    const found = identity.get(row.name);
    return !found || !found.nameZh || !found.note;
  })) {
    const site = await fetchCatalogIdentity();
    plugins.forEach((row) => {
      const extra = site.get(row.name);
      if (!extra) return;
      const found = identity.get(row.name) || { nameZh: "", note: "" };
      identity.set(row.name, { nameZh: found.nameZh || extra.nameZh, note: found.note || extra.note });
    });
  }

  let selfIdentity = localIdentity(PKG_NAME, dir);
  if (!selfIdentity || !selfIdentity.nameZh || !selfIdentity.note) {
    const extra = (await fetchCatalogIdentity()).get(PKG_NAME);
    if (extra) {
      selfIdentity = {
        nameZh: (selfIdentity && selfIdentity.nameZh) || extra.nameZh,
        note: (selfIdentity && selfIdentity.note) || extra.note,
      };
    }
  }
  if (!selfIdentity) selfIdentity = { nameZh: "", note: "" };

  const selfLatest = await fetchNpmVersion(PKG_NAME);
  const entries = sortUpdates(plugins.map((row, index) => {
    const current = row.info.version;
    const latest = versions[index];
    const found = identity.get(row.name) || { nameZh: "", note: "" };
    const usageRow = usageFor(usageReport, row.name);
    const enabled = enabledByPkg ? (enabledByPkg.has(row.name) ? enabledByPkg.get(row.name) : null) : null;
    return {
      name: row.name,
      /* 中文名可能为空 —— 界面回落显示包名，并明确标注「未汉化」，绝不假装有中文 */
      nameZh: found.nameZh,
      /* 说明：优先包自己/站点的中文，其次本机 package.json 的原文（英文，界面会标未汉化） */
      note: found.note || row.info.desc,
      bundled: row.bundled,
      /* 清单里的 spec 与它的形态（range / pinned）。界面据此说明"为什么升不动"。 */
      spec: row.spec,
      kind: row.kind,
      current,
      latest,
      /* 使用频次与保留价值（本机计算、零上传；详见 lib/usage.js 的口径说明） */
      enabled,
      installedAtMs: installedAtOf(row.name, dir, row.kind),
      usage: usageRow,
      /* 等级：core/common/occasional/silent/disabled/unmeasurable/unknown —— 客户端直接消费 */
      tier: classifyUsage(enabled, usageRow),
      /* 三态：任一端拿不到就不下结论（null），绝不用 false 兜底 */
      outdated: latest && current ? compareVersions(current, latest) < 0 : null,
      /* ⚠️ 用**具体版本号**（dsh-context@0.69.1），不要 `@latest`。
         实测（2026-10-12，桌面版 dsh 0.2.0-rc.2）：
           dsh plugin --profile desktop add dsh-context@latest   → 静默空转（pnpm.log 0 字节、版本不动）
           dsh plugin --profile desktop add dsh-context@0.69.1   → 成功（Done in 1.7s）
         既然更新检查已经知道目标版本，就没有理由再走那条空转的路。 */
      upgrade: latest
        ? `dsh plugin --profile ${PROFILE} add ${row.name}@${latest}`
        : `dsh plugin --profile ${PROFILE} add ${row.name}@latest`,
    };
  }));

  return {
    ok: true,
    rev: SHAPE_REV,
    profile: PROFILE,
    fetchedAt: Date.now(),
    self: {
      name: PKG_NAME,
      nameZh: selfIdentity.nameZh,
      note: selfIdentity.note,
      current: VERSION,
      latest: selfLatest,
      outdated: selfLatest ? compareVersions(VERSION, selfLatest) < 0 : null,
      /* 同已装插件：走具体版本号，`@latest` 在 dsh 这条路上是空转的（见 buildUpdates 的注释） */
      upgrade: selfLatest
        ? `dsh plugin --profile ${PROFILE} add ${PKG_NAME}@${selfLatest}`
        : `dsh plugin --profile ${PROFILE} add ${PKG_NAME}@latest`,
    },
    plugins: entries,
    /* 使用频次统计口径（本机计算，零上传）。null = 引擎不可用，客户端按「无法度量」展示 */
    usageMeta: usageReport
      ? {
          windowDays: usageReport.windowDays,
          generatedAtMs: usageReport.generatedAtMs,
          cacheAgeMs: usageReport.cacheAgeMs,
          scanned: usageReport.scanned,
        }
      : null,
    /* 本地链接的包（link:/file:）单列：它们不参与更新检查，但用户需要知道"它们为什么不在列表里" */
    locals: locals,
    counts: {
      installed: candidates.length,
      skipped: candidates.length - plugins.length,
      local: locals.length,
      checked: entries.length,
      outdated: entries.filter((entry) => entry.outdated === true).length,
      unknown: entries.filter((entry) => entry.outdated === null).length,
    },
  };
}

export function apply(ctx) {
  // 「分类精选」：站点 /best 专区的同源数据（月度策展，每小类 2~3 个）
  registerRoute(ctx, "/api/dpharness/best", async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    try {
      const result = await fetchBest();
      sendJson(res, 200, {
        ok: true,
        source: `${SITE}/best`,
        cached: result.cached,
        fetchedAt: new Date(result.fetchedAt).toISOString(),
        month: result.month,
        total: result.total,
        /* 同搜索：给榜单条目也标上「已安装 vX」（那几张卡片同样有「安装」按钮） */
        categories: (Array.isArray(result.categories) ? result.categories : []).map((cat) => Object.assign({}, cat, {
          subs: (Array.isArray(cat.subs) ? cat.subs : []).map((sub) => Object.assign({}, sub, {
            items: (Array.isArray(sub.items) ? sub.items : []).map((item) => Object.assign({}, item, { installed: installedOf(item, installedMap()) })),
          })),
        })),
      });
    } catch (error) {
      sendJson(res, 502, { ok: false, error: String((error && error.message) || error) });
    }
  });

  // 「组合方案套装」：站点 /sets 专区的同源数据（跨插件纵向组合，见 fetchSets 注释）
  registerRoute(ctx, "/api/dpharness/sets", async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    try {
      const result = await fetchSets();
      sendJson(res, 200, {
        ok: true,
        source: `${SITE}/sets`,
        cached: result.cached,
        fetchedAt: new Date(result.fetchedAt).toISOString(),
        total: result.total,
        sets: result.sets,
      });
    } catch (error) {
      sendJson(res, 502, { ok: false, error: String((error && error.message) || error) });
    }
  });

  /**
   * 「周榜」：站点两条榜单线的同源数据（精选 Top 榜 / 真装机周榜）。
   *
   * kind 必填且白名单化：不给默认值 —— 默认成任何一个都会让
   * 「我明明点的是装机榜，怎么显示下载量」变成难查的静默错误。
   * 非法 kind 返回 400 + 允许值，而不是回落 top。
   */
  registerRoute(ctx, "/api/dpharness/board", async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    const kind = (readParams(req).get("kind") || "").trim();
    if (kind !== "top" && kind !== "installs") {
      sendJson(res, 400, {
        ok: false,
        error: "kind 必须是 top 或 installs",
        allowed: ["top", "installs"],
      });
      return;
    }
    try {
      const result = await fetchBoard(kind);
      const { cached, fetchedAt, ...payload } = result;
      sendJson(res, 200, {
        ok: true,
        kind,
        source: `${SITE}/api/board/${kind}`,
        cached,
        fetchedAt: new Date(fetchedAt).toISOString(),
        ...payload,
      });
    } catch (error) {
      sendJson(res, 502, {
        ok: false,
        kind,
        error: String((error && error.message) || error),
        /* 站点接口未上线时是 404：给客户端一句能照做的解释，别只丢状态码 */
        hint: "站点榜单接口暂不可用（可能尚未发版），可点「打开官网」查看完整榜单",
      });
    }
  });

  registerRoute(ctx, "/api/dpharness/search", async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    const params = parseQuery(req);
    try {
      const result = await fetchCatalog(params);
      sendJson(res, 200, {
        ok: true,
        source: SITE,
        cached: result.cached,
        fetchedAt: new Date(result.fetchedAt).toISOString(),
        query: Object.fromEntries(params),
        count: result.count,
        total: result.total,
        /* 「已装了哪些」**不进缓存**：装完要立刻在卡片上看到「已安装 vX」 */
        plugins: result.plugins.map((item) => Object.assign({}, item, { installed: installedOf(item, installedMap()) })),
      });
    } catch (error) {
      const message = error && error.name === "AbortError" ? "upstream timeout" : String((error && error.message) || error);
      sendJson(res, 502, { ok: false, error: message, source: SITE });
    }
  });

  registerRoute(ctx, "/api/dpharness/event", async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405, { allow: "POST" });
      res.end();
      return;
    }
    if (!withinEventBudget()) {
      sendJson(res, 429, { ok: false, error: "rate limited" });
      return;
    }
    let input;
    try {
      input = JSON.parse(await readBody(req, 4096) || "{}");
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String((error && error.message) || error) });
      return;
    }
    if (!EVENT_ALLOWLIST.has(clampText(input && input.event, 32))) {
      sendJson(res, 400, { ok: false, error: "event not allowed" });
      return;
    }
    const payload = buildTrackPayload(input || {});
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EVENT_TIMEOUT_MS);
    try {
      const response = await fetch(TRACK, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          // Verified: this UA is not classified as a bot by the site's filter
          // (curl's default UA is). Keep the honest identifier.
          "user-agent": `dsh-dpharness/${VERSION}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      sendJson(res, 200, { ok: response.ok, forwarded: { type: payload.type, value: payload.value } });
    } catch (error) {
      const message = error && error.name === "AbortError" ? "relay timeout" : String((error && error.message) || error);
      // Telemetry must never surface as an error in the UI; report and move on.
      sendJson(res, 202, { ok: false, error: message });
    } finally {
      clearTimeout(timer);
    }
  });

  /**
   * Newsletter subscription relay (2026-10-20).
   *
   * Why it lives here and not in the browser: the site's `/api/subscribe` sends
   * no CORS headers (measured — the event relay above exists for the same
   * reason), so a cross-origin POST from the dsh web GUI is refused before it
   * ever reaches the route.
   *
   * Scope is deliberately narrow — one field in, one result out. No visitor id,
   * no inbox storage, no address logged. The site owns double opt-in: it stores
   * the address as pending and mails the confirmation link itself, so this
   * handler returning `ok` only means "the site accepted the request".
   */
  registerRoute(ctx, "/api/dpharness/subscribe", async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405, { allow: "POST" });
      res.end();
      return;
    }
    if (!withinSubscribeBudget()) {
      sendJson(res, 429, { ok: false, error: "操作太频繁，请稍后再试" });
      return;
    }
    let input;
    try {
      input = JSON.parse((await readBody(req, 2048)) || "{}");
    } catch (error) {
      sendJson(res, 400, { ok: false, error: "请求格式不正确" });
      return;
    }
    const email = String((input && input.email) || "").trim().toLowerCase().slice(0, 254);
    if (!EMAIL_RE.test(email)) {
      sendJson(res, 400, { ok: false, error: "邮箱格式不正确" });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SUBSCRIBE_TIMEOUT_MS);
    try {
      const response = await fetch(SUBSCRIBE, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "user-agent": `dsh-dpharness/${VERSION}`,
        },
        body: JSON.stringify({ email, source: "dsh-plugin" }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        /* 站点的 error 是给人看的中文（格式/频率），优先透出；没有就自己兜一句 */
        sendJson(res, 502, { ok: false, error: (data && data.error) || "订阅服务暂时不可用，请稍后再试" });
        return;
      }
      sendJson(res, 200, {
        ok: !(data && data.ok === false),
        message: typeof (data && data.message) === "string" ? data.message : "",
        already: !!(data && data.already === true),
        error: typeof (data && data.error) === "string" ? data.error : "",
      });
    } catch (error) {
      const message = error && error.name === "AbortError" ? "订阅请求超时，请稍后再试" : "无法连接 dpharness.com";
      sendJson(res, 502, { ok: false, error: message });
    } finally {
      clearTimeout(timer);
    }
  });

  /**
   * One-click install.
   *
   * The client tries dshmarket's own route first (same origin, no CORS issue,
   * restart-free hot mount, rollback available). That route only accepts URLs
   * present in its curated registry, so anything else falls back here — this
   * spawns the dsh CLI directly, which changes the profile and therefore only
   * takes effect after a restart.
   */
  registerRoute(ctx, "/api/dpharness/install", async (req, res) => {
    if (req.method === "GET") {
      sendJson(res, 200, { ok: true, profile: PROFILE, job: jobView() });
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(405, { allow: "GET, POST" });
      res.end();
      return;
    }
    if (installJob.active) {
      const elapsed = Date.now() - installJob.startedAt;
      if (elapsed > INSTALL_TIMEOUT_MS + INSTALL_SETTLE_MS) {
        /* 早已越过「超时 + 宽限」却还标着 active ⇒ 只可能是收尾路径没跑到
           （宿主从旧版本热更新上来、计时器所在进程被挂起…）。这时**自愈**比让用户去
           重启 dsh 合理：现场实测（2026-10-14）用户因此彻底装不了任何插件，
           而界面上只有一句英文报错、没有任何自救入口。 */
        console.warn(`[dpharness] install job stuck for ${Math.round(elapsed / 1000)}s — self-healing`);
        forceUnlock("stale", installSeq);
      } else {
        sendJson(res, 409, {
          ok: false,
          /* 保留原文：它同时是**兼容旧客户端的兜底文案**，按 why 翻的界面读 why 就好 */
          error: "an install is already running",
          /* why 是闭集枚举：界面据此出中文，别把英文原文直接摊给用户 */
          why: "busy",
          seconds: Math.round(elapsed / 1000),
          job: jobView(),
        });
        return;
      }
    }
    let input;
    try {
      input = JSON.parse((await readBody(req, 2048)) || "{}");
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String((error && error.message) || error) });
      return;
    }
    const target = typeof (input && input.pkg) === "string" ? input.pkg.trim().slice(0, 214) : "";
    if (!TARGET_RE.test(target)) {
      sendJson(res, 400, { ok: false, error: "unsafe plugin target rejected" });
      return;
    }
    /* verb 是**闭集**：只认 add / remove，别的一律按 add 走（不接受任何未枚举的动作） */
    const verb = input && input.verb === "remove" ? "remove" : "add";
    startInstall(target, verb);
    sendJson(res, 202, { ok: true, target, verb, profile: PROFILE, job: jobView() });
  });

  /**
   * 启用/禁用（「禁用观察」通道）。
   *
   * 走运行时 `pluginManager.setPluginEnabled(entryId, enabled)`——它把改动写进 profile 的
   * patch 并即时应用（`reload`），比"卸载"温和得多：可随时恢复、不改依赖清单。
   * 与卸载一样要求两步确认在**客户端**做（这里只承接已确认的调用）。
   *
   * 三态纪律：
   *   · 宿主没有该服务（旧内核）→ 501 `unsupported`（明说"不支持"，不冒充失败）；
   *   · 同名多入口 / 无 entryId / 只读行 → 409 带 code，界面据此出中文；
   *   · 改完**复读真值**——`setPluginEnabled` 可能被更高优先级的层覆盖（overridden），
   *     响应里的 `enabled` 永远是"实际状态"而不是"请求状态"。
   */
  registerRoute(ctx, "/api/dpharness/toggle", async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405, { allow: "POST" });
      res.end();
      return;
    }
    let input;
    try {
      input = JSON.parse((await readBody(req, 2048)) || "{}");
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String((error && error.message) || error) });
      return;
    }
    const name = typeof (input && input.name) === "string" ? input.name.trim().slice(0, 214) : "";
    const want = input && input.enabled === true;
    if (!name) {
      sendJson(res, 400, { ok: false, error: "missing plugin name", code: "missing-name" });
      return;
    }
    /* 禁自己等于把管理界面一起关掉：明确拒绝（卸载通道也有同样的保护） */
    if (name === PKG_NAME) {
      sendJson(res, 400, { ok: false, error: "refusing to toggle dsh-dpharness itself", code: "self" });
      return;
    }
    const manager = ctx && typeof ctx.get === "function" ? ctx.get("pluginManager") : undefined;
    if (!manager || typeof manager.listPlugins !== "function" || typeof manager.setPluginEnabled !== "function") {
      sendJson(res, 501, { ok: false, error: "toggle is not supported by this host", code: "unsupported" });
      return;
    }
    try {
      const rows = await manager.listPlugins();
      const matches = (Array.isArray(rows) ? rows : []).filter((row) => row && row.moduleName === name);
      if (matches.length === 0) {
        sendJson(res, 404, { ok: false, error: "plugin entry not found", code: "not-found" });
        return;
      }
      if (matches.length > 1) {
        sendJson(res, 409, { ok: false, error: "multiple entries share this name", code: "ambiguous" });
        return;
      }
      const row = matches[0];
      if (typeof row.entryId !== "string" || !row.entryId) {
        sendJson(res, 409, { ok: false, error: "entry cannot be addressed", code: "unaddressable" });
        return;
      }
      if (row.enabled === want) {
        sendJson(res, 200, { ok: true, name, enabled: want, changed: false });
        return;
      }
      await manager.setPluginEnabled(row.entryId, want);
      const after = (await manager.listPlugins()).find((item) => item && item.entryId === row.entryId);
      const actual = after ? after.enabled !== false : null;
      sendJson(res, 200, {
        ok: true,
        name,
        enabled: actual,
        changed: actual === want,
        ...(actual === want ? {} : { overridden: true }),
      });
    } catch (error) {
      const raw = String((error && error.message) || error);
      const code = (error && typeof error.code === "string" && error.code) || (TOGGLE_FAILURE_CODES.includes(raw) ? raw : undefined);
      sendJson(res, 409, { ok: false, error: raw, ...(code ? { code } : {}) });
    }
  });

  /**
   * Post-install evidence for telemetry.
   *
   * The client leaves a pending marker when an install succeeds and asks here
   * the next time the plugin is loaded. Both answers are computed host-side
   * because neither can be self-reported: the client is the same JS before and
   * after a restart, and it cannot see the profile's manifest.
   *
   * Read-only: no writes, no side effects, safe to call on every load.
   */
  registerRoute(ctx, "/api/dpharness/postinstall", (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    const params = readParams(req);
    const pkg = String(params.get("pkg") || "").trim().slice(0, 214);
    const via = String(params.get("via") || "").trim().slice(0, 12);
    const at = Number(params.get("at"));
    // restarted: true only when this process provably started after the install
    // finished. null (not false) when the client sent no usable timestamp.
    const restarted = Number.isFinite(at) && at > 0 ? STARTED_AT > at : null;
    const state = TARGET_RE.test(pkg) ? pkgState(pkg) : { dep: null, bundled: null };
    sendJson(res, 200, {
      ok: true,
      profile: PROFILE,
      startedAt: STARTED_AT,
      restarted,
      pkg,
      via,
      dep: state.dep,
      bundled: state.bundled,
    });
  });

  /**
   * 更新日志（只读）。
   *
   * 三个字段的语义必须分开、**不能互相兜底**：
   *   current  = 本进程加载的插件版本（来自代码常量，唯一可信来源）
   *   latest   = npm 最新版；null = 没查到（≠ 已是最新）
   *   outdated = true / false / null（null = 无从判断，例：离线）
   * 同一条响应里给出 upgrade 命令，并用**本机真实 profile** 拼 —— 用户不用猜 profile 名
   * （桌面版是 desktop 而不是 web，这个坑 2026-09-30 已经踩过一次）。
   *
   * 日志正文来自内置底稿（lib/changelog.js）；仓库发过 Release 之后，
   * releases 会按版本号覆盖/补齐底稿（mergeChangelog 的规则写在那里）。
   */
  registerRoute(ctx, "/api/dpharness/changelog", async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    const now = Date.now();
    if (changelogCache && now - changelogCache.at < CACHE_TTL_MS) {
      sendJson(res, 200, { ...changelogCache.value, cached: true });
      return;
    }
    // 两个外部查询互不依赖：并发发出去，任一失败都不影响另一个
    const [releases, latest] = await Promise.all([fetchReleases(), fetchNpmVersion(PKG_NAME)]);
    const value = {
      ok: true,
      rev: SHAPE_REV,
      current: VERSION,
      latest,
      outdated: latest ? compareVersions(VERSION, latest) < 0 : null,
      repo: REPO,
      source: releases && releases.length > 0 ? "builtin+github" : "builtin",
      upgrade: `dsh plugin --profile ${PROFILE} add dsh-dpharness@latest`,
      entries: mergeChangelog(CHANGELOG, releases),
      cached: false,
      fetchedAt: now,
    };
    changelogCache = { at: now, value };
    sendJson(res, 200, value);
  });

  /**
   * 插件更新检查（只读）。
   *
   * 两件事一起回答（2026-10-12 的需求「新增检查插件更新入口，更新红点提醒能力」）：
   *   1. 本插件自己有没有新版本（self）；
   *   2. 用户**已安装的 dsh 插件**里，哪些有更新的版本（plugins）。
   *
   * 数据来源与代价必须写清楚：
   *   · 「装了哪些」= profile 的 dependencies，本机磁盘读取，零网络；
   *   · 「最新版」= 逐包问 npmmirror（本机实测 23 个依赖），故并发上限 6、整体缓存 10 分钟；
   *   · 站点 /api/plugins **不提供版本字段**，所以没法拿目录当版本源 —— 只能逐包问 registry。
   * `?refresh=1` 可绕过缓存（「检查更新」按钮），但 30 秒内只放行一次，避免连点把镜像打爆。
   *
   * 三态纪律同 changelog：outdated 为 true / false / null（null = 任一端拿不到，不下结论）。
   */
  registerRoute(ctx, "/api/dpharness/updates", async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    const now = Date.now();
    const fresh = now - updatesCache.at < UPDATE_TTL_MS;
    const force = readParams(req).get("refresh") === "1";
    if (updatesCache.value && fresh && !(force && now - updatesCache.at >= UPDATE_MIN_FORCE_MS)) {
      sendJson(res, 200, { ...updatesCache.value, cached: true });
      return;
    }
    try {
      const value = await buildUpdates(ctx);
      updatesCache = { at: Date.now(), value };
      sendJson(res, 200, { ...value, cached: false });
    } catch (error) {
      /* 失败必须显式报错，不能悄悄回一份空清单 —— 空清单会被界面读成「全都已是最新」 */
      sendJson(res, 500, { ok: false, error: String((error && error.message) || error) });
    }
  });

  registerRoute(ctx, "/api/dpharness/meta", (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { allow: "GET" });
      res.end();
      return;
    }
    sendJson(res, 200, {
      ok: true,
      name,
      version: VERSION,
      profile: PROFILE,
      source: SITE,
      upstream: UPSTREAM,
      tracker: TRACK,
      startedAt: STARTED_AT,
      bootId: BOOT_ID,
      routes: [
        "/api/dpharness/search",
        "/api/dpharness/best",
        "/api/dpharness/sets",
        "/api/dpharness/event",
        "/api/dpharness/subscribe",
        "/api/dpharness/install",
        "/api/dpharness/postinstall",
        "/api/dpharness/toggle",
        "/api/dpharness/changelog",
        "/api/dpharness/updates",
        "/api/dpharness/meta",
      ],
      events: Array.from(EVENT_ALLOWLIST),
      install: { running: installJob.active, target: installJob.target },
      cache: {
        ttlMs: CACHE_TTL_MS,
        entries: cache.size,
        keys: Array.from(cache.keys()),
      },
    });
  });
}
