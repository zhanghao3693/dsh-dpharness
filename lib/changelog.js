/**
 * dsh-dpharness — 更新日志（**权威源，只有这一份**）。
 *
 * 为什么不把这份数据同时内联到 client.js：
 * 双份数据必然漂移（本站已在"命令口径"上栽过一次）。客户端不持有副本，
 * 而是读本机 host 的 `GET /api/dpharness/changelog` —— host 就在 localhost，
 * 于是"内置数据"与"离线可用"两个性质同时成立，且不存在两个版本号可对不上。
 *
 * 与三个外部事实的关系：
 *   1. 本文件 = 内置底稿，永远可用；
 *   2. GitHub Releases（可选）→ 有 Release 时**覆盖同名版本**、补齐内置没有的版本；
 *      实测 2026-10-12：远端 releases 为空数组，故当前 source 恒为 "builtin"；
 *   3. npm（npmmirror）→ 只用来回答「你装的这个是不是最新版」，不参与日志正文。
 *
 * ⚠️ 发版纪律（有测试兜底）：本数组的**第一条版本号必须等于 package.json 的 version**，
 * 否则「更新日志」会悄悄落后于实际发版 —— 那比没有更新日志更糟。
 */

/** 仓库全名。改仓库名要同时改这里与 package.json 的 repository.url。 */
export const REPO = "zhanghao3693/dsh-dpharness";

/** GitHub Releases（只读）。仓库若从未发过 Release，这里会返回空数组 —— 属正常。 */
export const RELEASES_URL = "https://api.github.com/repos/" + REPO + "/releases?per_page=30";

/** npm 最新版。用 npmmirror 而非官方 registry：国内直连官方 registry 经常超时。 */
export const NPM_LATEST_URL = "https://registry.npmmirror.com/dsh-dpharness/latest";

/**
 * 历史版本。**新版本加在最前面**，并按下面的"发版纪律"同步 package.json。
 *
 * items 的写法：一句话说清「用户能看到什么变化」，不写实现细节
 * （用户要看的是行为变化，不是我们的 commit 分类）。
 */
export const CHANGELOG = [
  {
    version: "0.5.0",
    date: "2026-10-12",
    title: "每日推荐 + 设置入口 + 更新日志",
    items: [
      "新增「每日推荐」视图：每天从站点月度榜单里取一条，当天固定、所有用户看到同一条（按北京时间换日）。",
      "默认视图顶部加入「今日推荐」卡片；榜单取不到时明确提示「暂不可用」，不影响其它视图。",
      "新增两处设置入口：设置 → 通用（浮窗开关）、设置 → 插件 → 严选插件（完整设置页）。",
      "设置页可开关浮窗显隐、每日推荐与匿名统计，并一键恢复默认。",
      "新增本页「更新日志」：看历史版本，并提示你装的不是最新版时给出升级命令。",
      "修复：搜索结果的「共 N 条」改用真实命中总数（此前恒等于本次返回条数，看起来像搜索没生效）。",
      "修复：安装走市场通道给不出确定答复时一律降级到本地通道（仅「有会话正在运行」时除外）。",
      "修复：桌面版下找不到 dsh 入口、且把 profile 判成 web 的问题。",
      "安全：安装失败时展示的包管理器输出统一脱敏。",
    ],
  },
  {
    version: "0.4.4",
    date: "2026-09-24",
    title: "分类精选 · 浮窗可彻底关闭",
    items: [
      "会话端页签加入「分类精选」视图（与站点 /best 同源），保留小类名次与上榜理由。",
      "浮窗可被手动彻底关闭，且关闭状态跨会话生效（不会下次进来又自己冒出来）。",
      "关闭后可从侧边栏底部按钮、或页签底部的「显示右下角浮窗」开关恢复。",
    ],
  },
  {
    version: "0.4.3",
    date: "2026-09-23",
    title: "适配 dsh 0.1.5-rc.3",
    items: [
      "补齐宿主兼容声明，适配 dsh 0.1.5-rc.3。",
    ],
  },
  {
    version: "0.4.2",
    date: "2026-09-21",
    title: "安装漏斗埋点",
    items: [
      "补齐安装埋点：确认、取消、失败阶段与原因、点重启，以及「装完之后到底生效没有」的回执。",
    ],
  },
  {
    version: "0.4.1",
    date: "2026-09-18",
    title: "分类精选视图",
    items: [
      "新增「分类精选」视图（站点 /best 的同源数据）。",
      "修复：分类精选被压扁成细线的布局问题。",
    ],
  },
  {
    version: "0.3.5",
    date: "2026-09-17",
    title: "首个可用版本",
    items: [
      "在 dsh 里浏览、搜索 dpharness.com 的插件目录，并可直接一键安装。",
      "修复：补上 bundle 声明（此前用命令安装后不会生效）。",
      "安装命令口径与站点对齐：未验证 npm 包名时退回 owner/repo。",
    ],
  },
];

/**
 * 比较两个 x.y.z 版本号，返回 -1 / 0 / 1。
 *
 * 只比数字段：预发布后缀（-rc.1 等）在本插件里没出现过，一旦出现也只按数字段判断，
 * 既不抛错也不假装精确。认不出的输入一律当 0 段处理（宁可判"相等"，也不误报"有新版本"）。
 */
export function compareVersions(left, right) {
  const parts = (value) => String(value == null ? "" : value).trim().split("-")[0].split(".").slice(0, 3).map((piece) => {
    const number = Number.parseInt(piece, 10);
    return Number.isFinite(number) ? number : 0;
  });
  const a = parts(left);
  const b = parts(right);
  for (let index = 0; index < 3; index += 1) {
    const x = a[index] || 0;
    const y = b[index] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/** GitHub release 的正文（markdown）→ 逐条要点。空/未识别就返回空数组，绝不编造。 */
export function releaseItems(body) {
  if (typeof body !== "string") return [];
  return body
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, "").replace(/^#+\s*/, "").trim())
    .filter((line) => line.length > 0)
    // 只保留「人话」条目标题：过滤掉 markdown 分隔线、纯链接、纯徽章等噪声
    .filter((line) => !/^[-=_*]{3,}$/.test(line) && !/^https?:\/\/\S+$/.test(line) && !/^!\[/.test(line))
    .map((line) => line.slice(0, 200))
    .slice(0, 12);
}

/** 把 GitHub releases 归一成与 CHANGELOG 同形的条目（按版本号从新到旧）。 */
export function normalizeReleases(releases) {
  if (!Array.isArray(releases)) return [];
  return releases
    .map((release) => {
      if (!release || release.draft === true) return null;
      const raw = typeof release.tag_name === "string" ? release.tag_name : release.tag;
      const version = String(raw || "").replace(/^v/i, "").trim();
      if (!/^\d+\.\d+\.\d+/.test(version)) return null;
      return {
        version,
        date: typeof release.published_at === "string" ? release.published_at.slice(0, 10) : "",
        title: typeof release.name === "string" && release.name.trim() ? release.name.trim().slice(0, 80) : version,
        items: releaseItems(release.body),
        origin: "github",
      };
    })
    .filter(Boolean)
    .sort((a, b) => compareVersions(b.version, a.version));
}

/**
 * 合并内置底稿与远端 releases。
 *
 * 规则（顺序即优先级）：
 *   1. 远端与内置**同版本** → 用远端（Release 才是发版时的正式说明，且能事后修正）；
 *   2. 远端独有的版本 → 补进来（例如某个版本忘了写进内置底稿）；
 *   3. 其余用内置。
 * 输出按版本号从新到旧 —— 不依赖调用方传入的顺序。
 */
export function mergeChangelog(builtin, releases) {
  const remote = normalizeReleases(releases);
  const merged = new Map();
  for (const entry of Array.isArray(builtin) ? builtin : []) {
    if (entry && entry.version) merged.set(entry.version, { ...entry, origin: "builtin" });
  }
  for (const entry of remote) {
    const existing = merged.get(entry.version);
    // 远端没写要点时不要用它盖掉内置的（空 release 正文很常见，那会丢信息）
    if (existing && entry.items.length === 0) continue;
    merged.set(entry.version, entry);
  }
  return Array.from(merged.values()).sort((a, b) => compareVersions(b.version, a.version));
}
