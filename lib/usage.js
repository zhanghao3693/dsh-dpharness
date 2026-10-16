/**
 * usage.js — 插件使用频次引擎（本机、只读、离线）。
 *
 * 数据源（2026-10-16 实测）：
 *   · 会话真源 `~/.dsh/sessions/<cwd>/session-<id>/session.v4.jsonl.zstd`
 *     —— **多帧 zstd** JSONL；`tool/call` 事件含 `{name, callId, time}`。
 *     ⚠️ Node 原生 zstd 只解首帧（sync 与 stream 都不跨帧），这里按帧魔数
 *     (`28 B5 2F FD`) 切片逐帧解压，并对每帧做「全行可 JSON 解析」校验以
 *     丢弃压缩流内部的伪魔数。实测全量 30 天扫描约 1.5s。
 *
 * 归属策略（v1，静态表；动态归属见设计方案 M2 原型）：
 *   · 只有**确定归属**的工具才计入单插件（前缀/精确表）；
 *   · `web_search`/`web_fetch`/`read_page` 是「通道类」——由多个提供方动态
 *     接管（实测：某会话里 web_search 由 modsearch 服务、web_fetch 由
 *     free-search 服务），v1 单列通道桶，不计给任何单一插件；
 *   · 内核工具（bash/read/write/…）不进表 → 未归属桶。
 *
 * 三态纪律：引擎不可用 / 插件无可归属工具 → 不产出结论（由调用方标
 * 「无法度量」），**绝不**把「没测到」写成「没在用」。
 *
 * 缓存：`~/.dsh/dpharness/usage-cache.json`（按文件 size+mtime 增量，
 * 只重解析变化过的会话文件；删除的文件自动修剪）。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

/** 统计窗口（天）。拍板值：30。 */
export const USAGE_WINDOW_DAYS = 30;

/** 缓存超过该时长就在下次读取时重扫（毫秒）。 */
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

/** 前缀归属：[正则, 包名]。 */
const TOOL_PREFIX_OWNERS = [
  [/^ego_/u, "dsh-ego-browser"],
  [/^mnemon_/u, "dsh-mnemon"],
];

/** 精确归属（实测自各插件注册名）。 */
const TOOL_EXACT_OWNERS = {
  advanced_search: "dsh-free-search",
  cache_search: "dsh-free-search",
  domain_search: "dsh-free-search",
  compress: "billion-context",
  decompress: "billion-context",
};

/** 通道类工具：多提供方动态接管，v1 不计单插件归属。 */
const CHANNEL_TOOLS = new Set(["web_search", "web_fetch", "read_page"]);

/** 有可归属工具的包集合（即使 0 次调用，也算「可度量」）。 */
export const PKGS_WITH_TOOLS = new Set([
  ...TOOL_PREFIX_OWNERS.map(([, pkg]) => pkg),
  ...Object.values(TOOL_EXACT_OWNERS),
]);

/** 工具名 → 归属包（null = 通道或未归属）。 */
export function ownerOfTool(name) {
  if (typeof name !== "string" || name === "") return null;
  if (CHANNEL_TOOLS.has(name)) return null;
  for (const [re, pkg] of TOOL_PREFIX_OWNERS) {
    if (re.test(name)) return pkg;
  }
  return TOOL_EXACT_OWNERS[name] ?? null;
}

/**
 * 保留价值等级（供 rows 直接下发）。
 * @param enabled - true/false/null（null = 宿主查不到启用状态，不下结论）
 * @param usage - usage 对象或 null（null = 引擎不可用）
 */
export function classifyUsage(enabled, usage) {
  if (enabled === false) return "disabled";
  if (usage === null || usage === undefined) return "unknown";
  if (!usage.measurable) return "unmeasurable";
  const calls = Number(usage.calls) || 0;
  const sessions = Number(usage.sessions) || 0;
  if (calls >= 20 && sessions >= 3) return "core";
  if (calls >= 5) return "common";
  if (calls >= 1) return "occasional";
  return "silent";
}

function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
}

function cachePath() {
  return path.join(dshHome(), "dpharness", "usage-cache.json");
}

const FRAME_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd]);

/** 解一个多帧 zstd 缓冲 → 逐帧文本（校验失败/伪魔数的帧丢弃）。 */
export function decompressFrames(buf) {
  const offsets = [];
  let at = buf.indexOf(FRAME_MAGIC, 0);
  while (at >= 0) {
    offsets.push(at);
    at = buf.indexOf(FRAME_MAGIC, at + 4);
  }
  const out = [];
  for (const off of offsets) {
    let text;
    try {
      text = zlib.zstdDecompressSync(buf.subarray(off)).toString("utf8");
    } catch {
      continue;
    }
    if (!text) continue;
    let ok = true;
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        JSON.parse(line);
      } catch {
        ok = false;
        break;
      }
    }
    if (ok) out.push(text);
  }
  return out;
}

/** 解析单个会话真源 → { calls, tools: {name:[count,lastMs]}, maxMs }。 */
function parseSessionFile(file) {
  const buf = fs.readFileSync(file);
  const tools = {};
  let calls = 0;
  let maxMs = 0;
  for (const text of decompressFrames(buf)) {
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      let ev;
      try {
        ev = JSON.parse(line);
      } catch {
        continue;
      }
      if (!ev || ev.type !== "tool/call") continue;
      const name = ev.data && typeof ev.data.name === "string" ? ev.data.name : "";
      if (!name) continue;
      const time = Number(ev.time) || 0;
      calls += 1;
      if (time > maxMs) maxMs = time;
      const prev = tools[name];
      tools[name] = prev ? [prev[0] + 1, Math.max(prev[1], time)] : [1, time];
    }
  }
  return { calls, tools, maxMs };
}

/** 枚举会话真源文件（~/.dsh/sessions/<slug>/session-<id>/session.v4.jsonl.zstd）。 */
function listSessionFiles() {
  const root = path.join(dshHome(), "sessions");
  const files = [];
  let slugs;
  try {
    slugs = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const slug of slugs) {
    if (!slug.isDirectory()) continue;
    const slugDir = path.join(root, slug.name);
    let sessions;
    try {
      sessions = fs.readdirSync(slugDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const session of sessions) {
      if (!session.isDirectory() || !session.name.startsWith("session-")) continue;
      const file = path.join(slugDir, session.name, "session.v4.jsonl.zstd");
      try {
        const st = fs.statSync(file);
        if (st.isFile()) files.push({ file, size: st.size, mtimeMs: st.mtimeMs });
      } catch {
        /* 没有真源文件的会话（如仅投影）跳过 */
      }
    }
  }
  return files;
}

function readCache() {
  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath(), "utf8"));
    if (parsed && parsed.version === 1 && parsed.files && typeof parsed.files === "object") return parsed;
  } catch {
    /* 无缓存 / 损坏 → 重建 */
  }
  return { version: 1, generatedAtMs: 0, files: {} };
}

function writeCache(cache) {
  try {
    const file = cachePath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify(cache));
    fs.renameSync(tmp, file);
  } catch {
    /* 写不进缓存不是错误：下次重扫即可 */
  }
}

/**
 * 增量扫描 + 聚合。
 * @param options.force - true 时忽略缓存新鲜度，重扫变化文件
 * @param options.now - 注入时钟（测试用）
 */
export function getUsageReport(options = {}) {
  const now = Number(options.now) || Date.now();
  const windowDays = Number(options.windowDays) || USAGE_WINDOW_DAYS;
  const cutoff = now - windowDays * 24 * 3600 * 1000;
  const cache = readCache();
  const fresh = cache.generatedAtMs && now - cache.generatedAtMs < CACHE_MAX_AGE_MS;
  let parsedFiles = 0;

  if (!fresh || options.force === true) {
    const files = listSessionFiles();
    const seen = new Set();
    for (const entry of files) {
      seen.add(entry.file);
      const prev = cache.files[entry.file];
      if (prev && prev.size === entry.size && prev.mtimeMs === entry.mtimeMs) continue;
      try {
        const parsed = parseSessionFile(entry.file);
        cache.files[entry.file] = { size: entry.size, mtimeMs: entry.mtimeMs, ...parsed };
        parsedFiles += 1;
      } catch {
        /* 单文件失败不影响其它会话 */
      }
    }
    for (const key of Object.keys(cache.files)) {
      if (!seen.has(key)) delete cache.files[key];
    }
    cache.generatedAtMs = now;
    writeCache(cache);
  }

  /* ---- 聚合（窗口内文件） ---- */
  const perPkg = {};
  const unattributed = {};
  const channel = {};
  let filesInWindow = 0;
  let sessionsWithCalls = 0;
  let totalCalls = 0;
  for (const [file, info] of Object.entries(cache.files)) {
    if (!info || info.mtimeMs < cutoff) continue;
    filesInWindow += 1;
    if (info.calls > 0) sessionsWithCalls += 1;
    const touchedPkgs = new Set();
    for (const [tool, pair] of Object.entries(info.tools || {})) {
      const count = pair[0];
      const lastMs = pair[1] || 0;
      totalCalls += count;
      const owner = ownerOfTool(tool);
      if (owner === null) {
        if (CHANNEL_TOOLS.has(tool)) channel[tool] = (channel[tool] || 0) + count;
        else unattributed[tool] = (unattributed[tool] || 0) + count;
        continue;
      }
      const slot = perPkg[owner] || (perPkg[owner] = { calls: 0, sessions: 0, lastUsedMs: 0, tools: {} });
      slot.calls += count;
      slot.tools[tool] = (slot.tools[tool] || 0) + count;
      if (lastMs > slot.lastUsedMs) slot.lastUsedMs = lastMs;
      if (!touchedPkgs.has(owner)) {
        touchedPkgs.add(owner);
        slot.sessions += 1;
      }
    }
  }

  /* 可归属但窗口内没有调用的包补零，保证「可度量 + 沉默」可被区分 */
  for (const pkg of PKGS_WITH_TOOLS) {
    if (!perPkg[pkg]) perPkg[pkg] = { calls: 0, sessions: 0, lastUsedMs: 0, tools: {} };
  }

  const plugins = {};
  for (const [pkg, slot] of Object.entries(perPkg)) {
    plugins[pkg] = {
      measurable: true,
      calls: slot.calls,
      sessions: slot.sessions,
      lastUsedMs: slot.lastUsedMs || null,
      tools: Object.entries(slot.tools)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    };
  }

  return {
    ok: true,
    windowDays,
    generatedAtMs: cache.generatedAtMs || null,
    cacheAgeMs: cache.generatedAtMs ? now - cache.generatedAtMs : null,
    scanned: { files: filesInWindow, parsed: parsedFiles, sessions: sessionsWithCalls, calls: totalCalls },
    plugins,
    channel,
    unattributed,
  };
}
