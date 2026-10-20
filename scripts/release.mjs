#!/usr/bin/env node
/**
 * dsh-dpharness 半自动发版（方案 A，2026-10-20 用户拍板）
 *
 * 为什么是「半自动」而不是全自动：
 *   npm 对这个包强制走 staged publish + 2FA 人工授权（2026-10-16、10-19 两次实测，
 *   直发被政策拦成 403）。所以脚本只能把**不可逆动作之前**的所有手工活做掉：
 *   校验 → 改版本 → 打包自检 → 提交 → 打 tag → push → stage publish，
 *   最后一步 approve 必须你在浏览器点一次，脚本只负责把命令与编号打给你。
 *
 * 它**不会**：自动 approve、自动改 changelog 文案、自动覆盖未提交的改动。
 *
 * 用法：
 *   npm run release patch            # 0.6.4 → 0.6.5
 *   npm run release minor -- --dry-run
 *   npm run release 0.7.0
 *
 * 前置（脚本会逐项检查，不满足就停）：
 *   1) 工作区干净（唯一例外：lib/changelog.js 已写好但未提交，会被一并提交）
 *   2) 在 main 分支，且与 origin/main 齐平
 *   3) `node test-local.mjs` 全通过
 *   4) package.json / lib/index.js / CHANGELOG 首条 三者版本一致
 *   5) CHANGELOG 首条已经写成**下一个**版本号（文案是人写的，脚本不代笔）
 *   6) `npm whoami` 能过（本机旧 _authToken 会 401）
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const pkgPath = path.join(ROOT, "package.json");
const indexPath = path.join(ROOT, "lib/index.js");
const changelogPath = path.join(ROOT, "lib/changelog.js");

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const positional = argv.filter((a) => !a.startsWith("--"));
const DRY = flags.has("--dry-run");
const SKIP_TEST = flags.has("--no-test");
const SKIP_PUSH = flags.has("--skip-push");
const bumpArg = positional[0] || "";

function say(msg) {
  console.log(msg);
}
function step(msg) {
  console.log("\n== " + msg);
}
function die(msg) {
  console.error("\n[中止] " + msg);
  process.exit(1);
}

/** 同步执行，默认继承 stdio；capture=true 时返回 stdout（失败抛错）。 */
function run(cmd, args = [], opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: opts.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: process.env,
  });
  if (res.error) die(`${cmd} 无法执行：${res.error.message}`);
  if (res.status !== 0) {
    if (opts.allowFail) return res;
    die(`${cmd} ${args.join(" ")} 退出码 ${res.status}${opts.capture ? "\n" + (res.stderr || "") : ""}`);
  }
  return res;
}

function capture(cmd, args = []) {
  return run(cmd, args, { capture: true }).stdout.trim();
}

/* ---------- 版本 ---------- */
function parseVer(v) {
  const m = String(v).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) die(`版本号不合法：${v}（要 x.y.z）`);
  return m.slice(1).map(Number);
}
function nextVersion(current, arg) {
  if (!arg) die("缺少版本参数：patch | minor | major | x.y.z");
  const [ma, mi, pa] = parseVer(current);
  if (arg === "patch") return `${ma}.${mi}.${pa + 1}`;
  if (arg === "minor") return `${ma}.${mi + 1}.0`;
  if (arg === "major") return `${ma + 1}.0.0`;
  parseVer(arg);
  return arg;
}

/* ---------- 0. 基本信息 ---------- */
const pkgRaw = fs.readFileSync(pkgPath, "utf8");
const curVer = JSON.parse(pkgRaw).version;
const nextVer = nextVersion(curVer, bumpArg);
const tag = "v" + nextVer;

if (DRY) say("（--dry-run：所有写操作只打印，不执行）");

step(`发版 ${curVer} → ${nextVer}${DRY ? "（演练）" : ""}`);

/* ---------- 1. 工作区 ---------- */
step("检查工作区");
const status = capture("git", ["status", "--porcelain"]).split("\n").filter(Boolean);
const allowed = status.filter((line) => line.trim() === "M lib/changelog.js");
const others = status.filter((line) => !allowed.includes(line));
if (others.length) {
  die("有未提交改动，发版脚本不替你决定提交内容：\n  " + others.join("\n  "));
}
if (allowed.length) say("提示：lib/changelog.js 有未提交改动，将随本次发版一起提交。");
else say("工作区干净。");

/* ---------- 2. 分支与远端 ---------- */
step("检查分支与远端");
const branch = capture("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
if (branch !== "main") die(`当前在 ${branch}，发版必须在 main。`);
run("git", ["fetch", "origin", "main", "--quiet"]);
const head = capture("git", ["rev-parse", "HEAD"]);
const remote = capture("git", ["rev-parse", "origin/main"]);
if (head !== remote) {
  die(`本地 main (${head.slice(0, 7)}) 与 origin/main (${remote.slice(0, 7)}) 不一致，先推齐再发。`);
}
say(`main 与 origin/main 齐平（${head.slice(0, 7)}）。`);

/* ---------- 3. 自测 ---------- */
if (SKIP_TEST) say("\n（--no-test：跳过自测）");
else {
  step("跑自测 test-local.mjs（426 项）");
  const res = run(process.execPath, ["test-local.mjs"], { capture: true, allowFail: true });
  const out = (res.stdout || "") + (res.stderr || "");
  const fails = out.split("\n").filter((l) => l.startsWith("FAIL"));
  if (res.status !== 0 || fails.length) {
    die("自测未通过，不发版：\n" + fails.slice(0, 10).join("\n"));
  }
  const pass = out.split("\n").filter((l) => l.startsWith("PASS")).length;
  say(`自测通过（${pass} 项）。`);
}

/* ---------- 4. 三处版本一致 ---------- */
step("核对三处版本");
const idxRaw = fs.readFileSync(indexPath, "utf8");
const idxVer = (idxRaw.match(/export const VERSION = "([^"]+)"/) || [])[1];
const clRaw = fs.readFileSync(changelogPath, "utf8");
const clVer = (clRaw.match(/export const CHANGELOG = \[\s*\{[\s\S]*?version:\s*"([^"]+)"/) || [])[1];
if (!idxVer || !clVer) die("解析不到 lib/index.js 的 VERSION 或 lib/changelog.js 的首条版本。");
if (idxVer !== curVer) die(`package.json=${curVer} 与 lib/index.js VERSION=${idxVer} 不一致（先修齐再发）。`);
if (clVer !== nextVer) {
  die(
    `CHANGELOG 首条是 ${clVer}，本次要发 ${nextVer}。\n` +
      `  更新日志是人写的，脚本不代笔。请先在 lib/changelog.js 的 CHANGELOG 数组顶部加一条：\n` +
      `  {\n    version: "${nextVer}",\n    date: "${new Date().toLocaleDateString("sv-SE")}",\n    title: "一句话说清这次变了什么",\n    items: ["用户能感知的变化，一条一句"],\n  },`
  );
}
say(`package.json / lib/index.js / CHANGELOG 首条 均为可发状态（当前 ${curVer} → 目标 ${nextVer}）。`);

/* ---------- 5. 改版本（只改一行，别整份重写 JSON） ---------- */
step("写版本号");
/*
 * 2026-10-20 踩过的坑：用 JSON.stringify 整份重写 package.json 会把 exports 缩进
 * 与 files 折行一起改掉（+8/-4 行噪声）。这里只做**单点替换**，并要求恰好命中一次。
 */
function replaceOnce(file, pattern, replacement, label) {
  const src = fs.readFileSync(file, "utf8");
  const matches = src.match(pattern);
  if (!matches || matches.length !== 1) die(`${label} 里匹配到 ${matches ? matches.length : 0} 处，期望 1 处。`);
  if (DRY) {
    say(`[dry-run] ${label}：${matches[0].slice(0, 60)} → ${replacement.slice(0, 60)}`);
    return;
  }
  fs.writeFileSync(file, src.replace(pattern, replacement));
  say(`${label} 已更新。`);
}
replaceOnce(pkgPath, /"version":\s*"[^"]+"/, `"version": "${nextVer}"`, "package.json");
replaceOnce(indexPath, /export const VERSION = "[^"]+";/, `export const VERSION = "${nextVer}";`, "lib/index.js");

/* ---------- 6. 打包自检（专防 0.6.3 那种漏文件事故） ---------- */
step("打包自检（npm pack + 依赖完整性）");
/*
 * 2026-10-20 的真实事故：package.json 的 files 白名单漏了 lib/usage.js，而
 * lib/index.js 里 `import ... from "./usage.js"` ⇒ 从 npm 装回来的包一加载就
 * ERR_MODULE_NOT_FOUND。本地一直正常，因为 desktop profile 走 `link:` 绕过打包。
 * 所以这里做两件事：① 解包后实测 import 入口；② 静态比对 lib 内的相对依赖是否都在包里。
 */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dsh-rel-"));
const packRes = run("npm", ["pack", "--pack-destination", tmpDir, "--json"], { capture: true, allowFail: true });
if (packRes.status !== 0) die("npm pack 失败：\n" + (packRes.stderr || ""));
let packInfo;
try {
  packInfo = JSON.parse(packRes.stdout)[0];
} catch {
  die("npm pack 输出解析失败：" + packRes.stdout.slice(0, 200));
}
const tarball = path.join(tmpDir, packInfo.filename);
const unpacked = path.join(tmpDir, "unpacked");
fs.mkdirSync(unpacked, { recursive: true });
run("tar", ["-xzf", tarball, "-C", unpacked]);
const pkgRoot = path.join(unpacked, "package");
const packed = new Set(packInfo.files.map((f) => f.path));
say(`包内 ${packed.size} 个文件，tarball ${(packInfo.size / 1024).toFixed(1)} KB。`);

// ① 静态依赖检查：lib/*.js 里所有相对 import 必须在包内
const missing = [];
for (const rel of [...packed].filter((p) => /^lib\/.*\.js$/.test(p))) {
  const src = fs.readFileSync(path.join(pkgRoot, rel), "utf8");
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*"\.\/([A-Za-z0-9_.-]+\.js)"/g)) {
    const dep = "lib/" + m[1];
    if (!packed.has(dep)) missing.push(`${rel} → ${dep}`);
  }
}
if (missing.length) die("包内缺少被 import 的文件（files 白名单漏了）：\n  " + missing.join("\n  "));

// ② 实测入口能加载
const importRes = run(
  process.execPath,
  ["--input-type=module", "-e", `const m = await import(${JSON.stringify(path.join(pkgRoot, "lib/index.js"))}); if (!m.VERSION) throw new Error("no VERSION"); console.log("VERSION=" + m.VERSION);`],
  { capture: true, allowFail: true }
);
if (importRes.status !== 0) die("解包后的入口加载失败：\n" + ((importRes.stderr || "") + (importRes.stdout || "")).trim());
say(`入口可加载：${(importRes.stdout || "").trim()}`);

/* ---------- 7. 提交 + tag ---------- */
step("提交与打 tag");
if (DRY) {
  say(`[dry-run] git add package.json lib/index.js lib/changelog.js`);
  say(`[dry-run] git commit -m "release: ${tag}"`);
  say(`[dry-run] git tag ${tag}`);
} else {
  run("git", ["add", "package.json", "lib/index.js", "lib/changelog.js"]);
  run("git", ["commit", "-m", `release: ${tag}`]);
  // lightweight tag：与 v0.6.3 / v0.6.4 一致（v0.6.2 是 annotated，历史混用，不跟随）
  run("git", ["tag", tag]);
  say(`已提交并打 tag ${tag}。`);
}

/* ---------- 8. push ---------- */
step("推送到远端");
if (DRY) say(`[dry-run] git push origin main && git push origin ${tag}`);
else if (SKIP_PUSH) say("（--skip-push：跳过 push）");
else {
  run("git", ["push", "origin", "main"]);
  run("git", ["push", "origin", tag]);
  say("main 与 tag 已推送。");
}

/* ---------- 9. npm 登录态 ---------- */
step("检查 npm 登录态");
const who = run("npx", ["npm@latest", "whoami"], { capture: true, allowFail: true });
if (who.status !== 0) {
  die(
    "npm 未登录（本机旧 _authToken 会 401）。先执行：\n" +
      "  printf 'dpharness\\n\\n' | script -q /tmp/npm-login.log npx npm@latest login --auth-type=web\n" +
      "  浏览器完成授权后重跑本脚本（登录态约 5 分钟有效，尽量别拖）。"
  );
}
say(`npm 账号：${(who.stdout || "").trim()}`);

/* ---------- 10. stage publish ---------- */
step("staged publish（最后一步 approve 需要你点 2FA）");
if (DRY) {
  say("[dry-run] script -q /tmp/dsh-release-stage.log npx npm@latest stage publish");
} else {
  /* 必须用 script 造伪终端：npm 的 stage 命令在非 TTY 下端输出会被 spinner 吞掉 */
  const stageRes = run("script", ["-q", "/tmp/dsh-release-stage.log", "npx", "npm@latest", "stage", "publish"], { allowFail: true });
  if (stageRes.status !== 0) die("stage publish 失败，看 /tmp/dsh-release-stage.log");
  say("已提交 staged 版本。");
}

/* ---------- 11. 下一步指引 ---------- */
step("下一步（人工，无法自动化）");
say(`
1) 确认 staged 版本状态（validating 阶段批不动，必须等它变成 staged）：
     npx npm@latest stage list

2) 拿到 id 后 approve，终端会打印一个 2FA 授权链接：
     script -q /tmp/dsh-approve.log npx npm@latest stage approve <id>
   在浏览器点授权。该链接约 5 分钟过期，超时会报 404 /-/v1/done，重来即可。

3) 核验（成败只看 registry，不看终端有没有报错）：
     npm view dsh-dpharness version
     npm view dsh-dpharness dist-tags.latest

4) 站点侧数据有滞后：详情页版本号与 /v1/plugins 靠仓库扫描刷新，
   必要时在后台对单插件点「只验这一个」推进。
`);

if (!DRY) {
  say(`发版包已 stage。approve 之前 registry 上仍是 ${curVer}，别把终端输出当成功。`);
}
