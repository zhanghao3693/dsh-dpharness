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

/** npm 镜像。用 npmmirror 而非官方 registry：国内直连官方 registry 经常超时。 */
export const REGISTRY = "https://registry.npmmirror.com";

/** 任意包的「最新版」端点。刻意做成函数：本插件与"已装插件"的检查共用同一个来源。 */
export function npmLatestUrl(pkg) {
  return REGISTRY + "/" + String(pkg) + "/latest";
}

/**
 * 历史版本。**新版本加在最前面**，并按下面的"发版纪律"同步 package.json。
 *
 * items 的写法：一句话说清「用户能看到什么变化」，不写实现细节
 * （用户要看的是行为变化，不是我们的 commit 分类）。
 */
export const CHANGELOG = [
  {
    version: "0.6.4",
    date: "2026-10-20",
    title: "插件里可以直接进群与订阅周报",
    items: [
      "页签顶部多了一张「交流群 + 周报」卡：点「查看二维码」展开 QQ 群与飞书群两枚码，手机扫码进群。",
      "填一行邮箱就能订阅周报，不用跳站；站点会发一封确认信，点开邮件里的链接才算订阅成功，之后随时可以退订。",
      "右下浮窗底部与「设置 → 插件 → 严选插件」也各有一份同样的入口，在哪个界面都能进群或订阅。",
      "二维码是现生成的：群链接换了码就跟着变，不会出现扫到旧群的情况。",
    ],
  },
  {
    version: "0.6.3",
    date: "2026-10-19",
    title: "严选插件页换成双栏工作台",
    items: [
      "整页重新分区：页头与页签各有一条分隔线，下面分成「浏览插件」主区和右侧信息栏，不再是几个同样间距的块平铺在一张背景上。",
      "右侧信息栏常驻三块：今天推荐哪个（附上榜理由）、各小类下载最多的三个、安装须知；窗口宽度不足 900px 时自动收成一列，今日推荐排到列表前面。",
      "插件卡片改成左右两栏：左边是名称、标签、说明与安装命令，右边一列固定放对比 / 收藏 / GitHub，不用再在一条卡里左右找按钮。",
      "安装命令改为通栏显示、复制按钮就在命令右侧，短命令后面不再拖出一大片空白。",
    ],
  },
  {
    version: "0.6.2",
    date: "2026-10-19",
    title: "卡片标签全部中文化",
    items: [
      "插件卡片上的标签改成中文：核心 / 相关、实装验证通过 / 未通过、人工实测通过、风险：中 / 高，不再出现 core、verify: pass 这类英文标记。",
      "兼容范围写成「适配 DSH v0.20+」，一眼看出这条说的是 dsh 版本要求。",
      "风险未评估的插件不再挂标记（此前几乎每张卡都有一条「未知」，等于噪声）；只保留中等、高风险两种提示。",
      "修复「对比」表把未实测、未验证、验证未通过都显示成「通过」的问题。",
    ],
  },
  {
    version: "0.6.1",
    date: "2026-10-17",
    title: "重启横幅能认出「已经重启过」",
    items: [
      "修复「待重启」横幅在重启后仍然一直提示的问题：真的重启过一次，横幅会自动改口「已生效」，不必再手动点「知道了」。",
      "「是否已生效」改由本机 dsh 的启动轮次判定（每次启动都不同）——「又装了另一个插件」不会再让上一次的重启结论失效。",
      "未生效时会自动复查（最长约 4 分钟），页面不需要手动刷新；连续查不到状态时如实提示「查不到重启状态」，不再让人误以为自己没重启成功。",
    ],
  },
  {
    version: "0.6.0",
    date: "2026-10-16",
    title: "插件使用频次与保留价值",
    items: [
      "「我的插件」新增使用概览：按**本机会话记录**统计每个插件近 30 天的调用次数与上次使用时间——只在本机计算，不上传。",
      "插件按使用情况分级：核心在用 / 常用 / 偶尔用 / 可考虑清理 / 已停用；不产生调用记录的被动型插件标注「无法度量」，**不做「没用」的结论**。",
      "新增「保留」标注：人工标为保留的插件不再出现在清理建议里；另支持按使用频率排序与「只看建议清理」筛选。",
      "新增「禁用 / 启用」与「批量禁用」：拿不准的插件先停用观察（可逆、即时生效、不动依赖清单），确定不用了再卸载。",
    ],
  },
  {
    version: "0.5.2",
    date: "2026-10-14",
    title: "被供应链策略拦下时说人话",
    items: [
      "安装被 pnpm 的供应链策略（默认拒绝「发布不满 24 小时」的版本）拦下时，面板改为说明：被拦的是哪几条、最新一条大约还要等多久、以及两条通路（等 / 在本机 profile 里加豁免）。此前这里只把 pnpm 的英文错误码原样摊在卡片上。",
    ],
  },
  {
    version: "0.5.1",
    date: "2026-10-14",
    title: "安装卡死能自愈了 + 超时不再吃掉真实结果",
    items: [
      "修复：某次安装超时后，整个面板会**再也装不了任何插件**（一直报「已有安装任务在进行」）—— 现在宿主会自己解锁，不必重启 dsh。",
      "修复：安装超时不再一律说成失败。如果这期间版本其实已经升上去了，会明确告诉你从哪一版到了哪一版（多半重启 dsh 就生效），不再让你白重装一遍。",
      "修复：「已有安装任务在进行」不再直接显示英文原文，改为中文，并带上它已经跑了多少秒。",
      "修复：超时改为停掉**整个安装进程树**（此前只停最外层，真正干活的包管理器会继续留在后台跑）。",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-10-13",
    title: "每日推荐 + 设置入口 + 更新日志",
    items: [
      "新增「每日推荐」视图：每天从站点月度榜单里取一条，当天固定、所有用户看到同一条（按北京时间换日）。",
      "默认视图顶部加入「今日推荐」卡片；榜单取不到时明确提示「暂不可用」，不影响其它视图。",
      "新增两处设置入口：设置 → 通用（浮窗开关）、设置 → 插件 → 严选插件（完整设置页）。",
      "设置页可开关浮窗显隐、每日推荐与匿名统计，并一键恢复默认。",
      "新增本页「更新日志」：看历史版本，并提示你装的不是最新版时给出升级命令。",
      "新增「更新」视图与红点提醒：检查本插件与已安装插件有没有新版本（逐包比对，约 1 秒），红点亮在侧边栏、浮窗胶囊与设置页，看过即熄灭。",
      "新增「套装」视图：与站点 /sets 同源，把「按类目逛」变成「按场景配」——一整套方案 + 安装顺序 + 冲突提示 + 批量命令（命令按你本机的 profile 拼好）；并支持「一键安装整套」（串行、有进度、可中止，两步确认）。",
      "新增「对比」：在严选推荐里给卡片打上标记（最多 3 个），并排看星标、实装验证、本机是否已装、分类与卖点 —— 决定装哪个时不用来回滚着比。",
      "新增「收藏待装」：在严选推荐里把想装的先攒起来（只存本机），之后在「我的插件」里一键装全部。另加福利专区入口（全网大模型免费额度与限时活动）。",
      "「更新」视图改名「我的插件」并升级成管理入口：可当场卸载（两步确认，卸完同样提醒重启），以及「忽略此版本」——忽略的是那一版，出了更新的版本提醒会自己回来。",
      "新增「待重启」横幅：一键安装在桌面端走本地通道、需要重启才生效，装完后在面板与页签顶部常驻提醒（可一键重启，两步确认）；重启发生后自动改口「已生效」—— 补上「装了没启用」这个漏点。",
      "修复：搜索结果的「共 N 条」改用真实命中总数（此前恒等于本次返回条数，看起来像搜索没生效）。",
      "修复：安装走市场通道给不出确定答复时一律降级到本地通道（仅「有会话正在运行」时除外）。",
      "修复：桌面版下找不到 dsh 入口、且把 profile 判成 web 的问题。",
      "安全：安装失败时展示的包管理器输出统一脱敏。",
      "修复：「分类精选」视图的大类默认全部收起（此前第一个大类默认展开，想扫别的类还得先动手关它）。",
      "修复：关闭浮窗（胶囊上的 × 或「隐藏浮窗」）后，侧边栏「严选插件」按钮改为两步确认恢复 —— 第一下只上劲（按钮描边 + 脉冲 + 提示「再点一次恢复浮窗」，5 秒内有效），第二下才把胶囊叫回来；误点不会复活浮窗，按钮也不再是死的。浮窗可见时点它照旧展开/收起面板。",
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
