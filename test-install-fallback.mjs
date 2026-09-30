/**
 * test-install-fallback.mjs — 安装通道降级判定的行为回归测试。
 *
 *   node test-install-fallback.mjs [对照副本的 lib/client.js 路径]
 *
 * 为什么需要它：`/dsh-market/*` 是**别人的**路由（dshmarket）。当 dshmarket 缺失、
 * 被 dsh 判定与本机核心不兼容而整包跳过、或正在升级时，这条前缀会整体缺席，于是
 * `POST /dsh-market/install` 命不中任何具名路由，落到 dsh 静态前端的 fallback ——
 * 它对非 GET/HEAD **一律回空体 405**。若客户端把 405 当硬失败，一键安装在市场通道
 * 不可用时就直接报错，而旁边明明有一条可用的本地通道（见 README 的 2026-09-30 事故）。
 *
 * 手法：把**真实的** `async function runInstall(item, t) {…}` 源码原样抽出执行，
 * 不重写逻辑。传对照副本时会做 A/B 打印，便于证明「改前硬失败 / 改后降级」。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(here, "lib", "client.js");
const BASELINE = process.argv[2]
  || path.join(os.homedir(), ".dsh/profiles/web/node_modules/dsh-dpharness/lib/client.js");

/** 抽 runInstall：起点是声明行，终点是其后第一条恰好为两个制表符 + } 的行。 */
function extractRunInstall(file) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const start = lines.findIndex((l) => l.includes("async function runInstall(item, t) {"));
  if (start < 0) throw new Error("找不到 runInstall：" + file);
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i] === "\t\t}") return lines.slice(start, i + 1).join("\n");
  }
  throw new Error("找不到 runInstall 结尾：" + file);
}

function compile(file) {
  const src = extractRunInstall(file);
  return new Function("deps", "with (deps) { " + src + "\n return runInstall; }");
}

/** 跑一个场景，返回可断言的轨迹（不触网、不写盘）。 */
async function scenario(file, { url, marketStatus, localStatus, marketPoll, localPoll }) {
  const calls = { market: 0, local: 0, track: [], hub: [] };
  const runInstall = compile(file)({
    INSTALL_MAX_MS: 5 * 60 * 1000,
    MARKET_INSTALL: "/dsh-market/install",
    LOCAL_INSTALL: "/api/dpharness/install",
    setHub: (state) => calls.hub.push(state.install),
    track: (_event, detail) => calls.track.push(detail),
    rememberPending: () => {},
    messageOf: (result, fallback) => (result && result.data && result.data.error) || fallback + "（HTTP " + (result ? result.status : "?") + "）",
    postJson: async (endpoint) => {
      if (endpoint === "/dsh-market/install") { calls.market += 1; return { status: marketStatus, data: marketStatus === 405 ? null : { error: "stub" } }; }
      calls.local += 1;
      return { status: localStatus, data: { error: "stub" } };
    },
    pollMarketInstall: async () => { calls.polled = "market"; return marketPoll; },
    pollLocalInstall: async () => { calls.polled = "local"; return localPoll; },
  });
  await runInstall({ pkg: "@laoyuehanni/dsh-token-usage", url }, () => "label");
  return { calls, terminal: calls.hub[calls.hub.length - 1] };
}

const OK_LOCAL = { ok: true, market: false };
const OK_MARKET = { ok: true, market: true };
const URL = "https://github.com/LaoYueHanNi/dsh-token-usage";

let failures = 0;
function check(label, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
  if (!ok) failures += 1;
}

async function run(label, opts, assert) {
  const b = await scenario(SUBJECT, opts);
  let a = null;
  if (fs.existsSync(BASELINE)) a = await scenario(BASELINE, opts);
  console.log(`\n[${label}]  改后: market=${b.calls.market} local=${b.calls.local} track=${JSON.stringify(b.calls.track)} terminal=${b.terminal && b.terminal.phase}`);
  if (a) console.log(`[${label}]  改前: market=${a.calls.market} local=${a.calls.local} track=${JSON.stringify(a.calls.track)} terminal=${a.terminal && a.terminal.phase}`);
  assert(b);
}

/* 核心回归：市场通道缺席（dsh 静态前端对非 GET/HEAD 回空体 405） */
await run("market=405（通道缺席）", { url: URL, marketStatus: 405, localStatus: 202, localPoll: OK_LOCAL }, (b) => {
  check("405 不再硬失败，确实降级到本地通道", b.calls.local === 1, "local=" + b.calls.local);
  check("落了 market_unavailable:http_405 埋点", b.calls.track.some((d) => d.action === "market_unavailable" && d.why === "http_405"), JSON.stringify(b.calls.track));
  check("最终态是本地安装成功", b.terminal && b.terminal.phase === "okLocal", JSON.stringify(b.terminal));
});

/* 409 = 有 agent 在跑：必须保持不降级（降级路径同样写插件文件） */
await run("market=409（有 agent 在跑）", { url: URL, marketStatus: 409, localStatus: 202, localPoll: OK_LOCAL }, (b) => {
  check("409 仍不降级", b.calls.local === 0, "local=" + b.calls.local);
  check("仍按 busy 记失败", b.calls.track.some((d) => d.action === "install_failed" && d.why === "busy"), JSON.stringify(b.calls.track));
  check("终态 failed", b.terminal && b.terminal.phase === "failed");
});

/* 预期拒绝：静默降级、不新增埋点 */
for (const status of [400, 404]) {
  await run(`market=${status}（预期拒绝）`, { url: URL, marketStatus: status, localStatus: 202, localPoll: OK_LOCAL }, (b) => {
    check(`${status} 静默降级、不新增 market_unavailable`, b.calls.local === 1 && !b.calls.track.some((d) => d.action === "market_unavailable"), JSON.stringify(b.calls.track));
  });
}

/* 其它「通道不可用」状态：降级 + 留痕（区分 40x 与 5xx 是定位的前提） */
for (const status of [401, 403, 500, 502]) {
  await run(`market=${status}`, { url: URL, marketStatus: status, localStatus: 202, localPoll: OK_LOCAL }, (b) => {
    check(`${status} 降级 + 留痕`, b.calls.local === 1 && b.calls.track.some((d) => d.why === "http_" + status), JSON.stringify(b.calls.track));
  });
}

/* 两条通道都不可用时才允许报失败 */
await run("market=405 且 local 非 202", { url: URL, marketStatus: 405, localStatus: 400 }, (b) => {
  check("两条通道都不可用时才报失败（via=local）", b.calls.track.some((d) => d.action === "install_failed" && d.via === "local"), JSON.stringify(b.calls.track));
  check("终态 failed", b.terminal && b.terminal.phase === "failed");
});

/* 未回归：热挂载正常路径 / 无 url 直接本地 */
await run("market=200（正常热挂载）", { url: URL, marketStatus: 200, marketPoll: OK_MARKET }, (b) => {
  check("200 仍走市场通道、不碰本地", b.calls.local === 0 && b.terminal.phase === "okMarket", JSON.stringify(b.terminal));
});
await run("无 url → 直接本地", { url: null, localStatus: 202, localPoll: OK_LOCAL }, (b) => {
  check("无 url 时不打市场通道", b.calls.market === 0 && b.calls.local === 1);
});

console.log("\n" + "=".repeat(72));
if (failures === 0) console.log("全部通过");
else console.log(`${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
