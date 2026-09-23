/**
 * dsh-dpharness — host half (v0.4.4).
 *
 * Catalog routes, a write-only telemetry relay and a one-click installer:
 *
 *   GET  /api/dpharness/search?q=<kw>&take=<n>&sort=stars
 *   GET  /api/dpharness/meta
 *   GET  /api/dpharness/postinstall?pkg=<pkg>&via=<local|market>&at=<epochMs>
 *   POST /api/dpharness/event    → relayed to https://dpharness.com/api/track/event
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
 *   - GET https://dpharness.com/api/plugins → { count, plugins[] }; `q` covers the
 *     whole catalog; `take` is clamped at 500; `sort=stars` is a strictly
 *     descending star order; item.installCheck = { status, pkgName }
 *   - POST https://dpharness.com/api/track/event → { type, value, path, visitorId }
 *     (`path` is truncated at "?", so detail belongs in `value`)
 *   - POST /dsh-market/install (dshmarket, when installed) → body { url }, same-origin
 *     only, refuses with 400 when the URL is not in its curated registry
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const name = "dpharness";

/** The dsh web server service used to register HTTP routes. */
export const inject = ["webServer"];

export const VERSION = "0.4.4";

/**
 * Wall-clock time this dsh process started.
 *
 * Needed to answer "did dsh restart since this install?" — and it has to come
 * from the host, because the client is the same JS before and after a restart
 * and therefore cannot prove a restart happened on its own.
 */
const STARTED_AT = Date.now() - Math.round(process.uptime() * 1000);

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
  return process.env.DSH_DPHARNESS_PROFILE || "web";
})();

const UPSTREAM = "https://dpharness.com/api/plugins";
const BEST_UPSTREAM = "https://dpharness.com/api/best";
const SITE = "https://dpharness.com";
const TRACK = "https://dpharness.com/api/track/event";
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
 * Re-invoke the dsh CLI that launched this host, instead of looking for `dsh`
 * on PATH (it is not there). Same trick as dshmarket's dshArgv(): the entry is
 * process.argv[1], and spawning it with the current node executable also keeps
 * `process.execArgv` (loader flags) consistent.
 *
 * Spawning through the managed node's bin directory also puts `pnpm` on PATH,
 * because the dsh web process is started by that same node.
 */
function dshInvocation() {
  const entry = process.argv[1];
  if (typeof entry !== "string" || !/[\\/](?:bin\.(?:js|ts)|dsh)$/.test(entry)) return null;
  const abs = path.resolve(entry);
  return { file: process.execPath, args: [...process.execArgv, abs], cwd: path.dirname(abs) };
}

const installJob = {
  active: false,
  stage: "idle",
  target: "",
  startedAt: 0,
  finishedAt: 0,
  code: null,
  output: [],
  error: null,
};

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

function startInstall(target) {
  const invocation = dshInvocation();
  if (invocation === null) {
    installJob.active = false;
    installJob.stage = "failed";
    installJob.error = "cannot locate the dsh entry point (process.argv[1])";
    return;
  }
  installJob.active = true;
  installJob.stage = "running";
  installJob.target = target;
  installJob.startedAt = Date.now();
  installJob.finishedAt = 0;
  installJob.code = null;
  installJob.output = [];
  installJob.error = null;

  const binDir = path.dirname(process.execPath);
  const child = spawn(invocation.file, [...invocation.args, "plugin", "--profile", PROFILE, "add", target], {
    cwd: invocation.cwd,
    env: sanitizedEnv(binDir),
    stdio: ["ignore", "pipe", "pipe"],
  });

  const push = (chunk) => {
    const text = String(chunk);
    installJob.output.push(text);
    if (installJob.output.length > 200) installJob.output.shift();
  };
  child.stdout.on("data", push);
  child.stderr.on("data", push);

  const timer = setTimeout(() => {
    installJob.error = "timeout";
    try { child.kill("SIGKILL"); } catch (error) { /* already gone */ }
  }, INSTALL_TIMEOUT_MS);

  child.on("error", (error) => {
    clearTimeout(timer);
    installJob.active = false;
    installJob.stage = "failed";
    installJob.error = String((error && error.message) || error);
    installJob.finishedAt = Date.now();
  });
  child.on("close", (code) => {
    clearTimeout(timer);
    installJob.active = false;
    installJob.code = code;
    installJob.finishedAt = Date.now();
    installJob.stage = code === 0 ? "done" : "failed";
    if (code !== 0 && installJob.error === null) installJob.error = errorLine();
  });
}

function tail() {
  return installJob.output.join("").trim().slice(-600);
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
  return errorLineFrom(installJob.output.join(""));
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
    target: installJob.target,
    seconds: installJob.active ? Math.round((Date.now() - installJob.startedAt) / 1000) : 0,
    code: installJob.code,
    error: installJob.error,
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
let eventWindow = { startedAt: 0, count: 0 };

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
    // `--profile web` 是 dsh CLI 必需参数；target 已是同口径的结果
    cmd: target ? `dsh plugin --profile web add ${target}` : null,
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
    return { count: hit.value.count, plugins: hit.value.plugins, cached: true, fetchedAt: hit.at };
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
    const value = { count: list.length, plugins: list.map(slim) };
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

function withinEventBudget() {
  const now = Date.now();  if (now - eventWindow.startedAt > EVENT_WINDOW_MS) {
    eventWindow = { startedAt: now, count: 0 };
  }
  eventWindow.count += 1;
  return eventWindow.count <= EVENT_MAX_PER_WINDOW;
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
    // `why` 是**闭集枚举**（market_http / busy / timeout / cli_exit …），
    // 不是错误原文：原文可能含本地路径与包名，既超长又不可聚合。
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
        categories: result.categories,
      });
    } catch (error) {
      sendJson(res, 502, { ok: false, error: String((error && error.message) || error) });
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
        plugins: result.plugins,
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
      sendJson(res, 409, { ok: false, error: "an install is already running", job: jobView() });
      return;
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
    startInstall(target);
    sendJson(res, 202, { ok: true, target, profile: PROFILE, job: jobView() });
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
      routes: [
        "/api/dpharness/search",
        "/api/dpharness/best",
        "/api/dpharness/event",
        "/api/dpharness/install",
        "/api/dpharness/postinstall",
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
