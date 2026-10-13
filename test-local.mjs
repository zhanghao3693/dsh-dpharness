/**
 * test-local.mjs — 本地自检：不依赖 dsh 进程，直接验证插件两半。
 *   node test-local.mjs
 * react / react-dom 从 .dev/node_modules 解析（`cd .dev && npm install react@19 react-dom@19`）。
 * ⚠️ 不要用 ~/.dsh/profiles/node_modules/react —— 那两个软链在 0.1.5 升级后已悬空（实测）。
 */
import { createRequire } from "node:module";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const here = path.dirname(new URL(import.meta.url).pathname);
const CANDIDATES = [
  path.join(here, ".dev", "node_modules"),
  path.join(os.homedir(), ".dsh", "profiles", "node_modules"),
];
let base = null;
for (const dir of CANDIDATES) {
  if (fs.existsSync(path.join(dir, "react", "package.json")) && fs.existsSync(path.join(dir, "react-dom", "server.js"))) {
    base = dir;
    break;
  }
}
if (base === null) {
  console.error("找不到可用的 react 安装，先执行：cd .dev && npm install react@19 react-dom@19");
  process.exit(3);
}
const req = createRequire(path.join(base, "noop.js"));

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  if (!ok) failures += 1;
}

/* ---------------------------------------------------------------- host half */
/* 拦截 host 发出的对外请求，断言转发载荷是否符合站点端点的真实契约。 */
const sent = [];
/* 更新日志/更新检查的两个外部上游：
   · releases 默认空数组（与 2026-10-12 的线上实况一致：仓库没有发过 Release）；
   · npm 版本用一张表控制，**不在表里 = 镜像查不到（404）** —— 这是"查不到"三态的来源。 */
let changelogUpstream = { releases: [] };
const npmVersions = new Map();
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  sent.push({ url: String(url), options });
  /* GitHub Releases：真实远端返回的是**数组**（没有 Release 就是空数组） */
  if (String(url).includes("api.github.com/repos/")) {
    return { ok: true, status: 200, json: async () => changelogUpstream.releases };
  }
  /* npm 最新版（npmmirror）：查不到时返回非 200，host 必须降级成 null 而不是编一个版本号 */
  if (String(url).includes("registry.npmmirror.com/")) {
    const name = decodeURIComponent(String(url).replace("https://registry.npmmirror.com/", "").replace(/\/latest$/, ""));
    if (!npmVersions.has(name)) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => ({ version: npmVersions.get(name) }) };
  }
  // 「套装」上游（站点 GET /api/sets）：结构与真实接口一致（方案 → 槽位条目）
  if (String(url).includes("/api/sets")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        total: 2,
        sets: [
          {
            slug: "dsh-newbie-starter",
            name: "DSH 新手开箱套装",
            summary: "刚装完 DSH 不知道装什么？先补齐日常底座。",
            audience: "DSH 新用户 / 从零搭建",
            sceneLabel: "新手入门",
            itemCount: 2,
            risk: { level: "medium", label: "扫描：含敏感能力", desc: "", source: "auto" },
            syncedMonth: "2026-10",
            syncedSlots: 3,
            syncedReplaced: 0,
            conflictNote: "两个插件都会改侧边栏，先装底座再装扩展。",
            steps: "1. 先装底座\n2. 再装增强",
            exampleParams: null,
            effectNote: null,
            url: "/sets/dsh-newbie-starter",
            items: [
              {
                slotRole: "侧栏工作台",
                tier: "required",
                pluginTier: "core",
                subKey: "sidebar",
                fullName: "omdsh-dev/DSH-better-sidebar",
                name: "DSH-better-sidebar",
                nameZh: "可扩展侧边栏工作台",
                tagline: "已适配 DSH 原生侧边栏 API，右列就是工作台",
                descriptionZh: null,
                stars: 3628,
                weeklyDownloads: 12800,
                verifyStatus: "pass",
                testedStatus: null,
                installCheck: { status: "pass", pkgName: "dsh-better-sidebar" },
                risk: null,
              },
              {
                slotRole: "通用客户端桥接",
                tier: "enhance",
                pluginTier: "related",
                subKey: null,
                fullName: "koishi-dev/koishi-dsh",
                name: "koishi-dsh",
                nameZh: null,
                tagline: null,
                descriptionZh: null,
                stars: 512,
                weeklyDownloads: null,
                verifyStatus: "pass",
                testedStatus: null,
                installCheck: null,
                risk: null,
              },
            ],
          },
          {
            slug: "dsh-ocr-vision",
            name: "本地 AI 识图 OCR 套装",
            summary: "让 DSH 真正看得见。",
            audience: null,
            sceneLabel: null,
            itemCount: 1,
            risk: null,
            syncedMonth: null,
            syncedSlots: null,
            syncedReplaced: null,
            conflictNote: null,
            steps: null,
            exampleParams: null,
            effectNote: null,
            url: "/sets/dsh-ocr-vision",
            items: [
              {
                slotRole: "识图",
                tier: "required",
                pluginTier: "core",
                subKey: "vision",
                fullName: "lispking/dsh-image-gen",
                name: "dsh-image-gen",
                nameZh: "像素级识图插件",
                tagline: null,
                descriptionZh: "像素级识图",
                stars: 233,
                weeklyDownloads: 900,
                verifyStatus: "pass",
                testedStatus: null,
                installCheck: { status: "warn", pkgName: null },
                risk: null,
              },
            ],
          },
        ],
      }),
    };
  }
  // 「分类精选」上游（站点 GET /api/best）：结构与真实接口一致（大类→小类→条目）
  if (String(url).includes("/api/best")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        month: "2026-09",
        total: 2,
        categories: [
          {
            key: "browser",
            label: "浏览器",
            count: 2,
            subs: [
              {
                key: "sidebar",
                label: "侧边栏",
                summary: "把工作台放进右列，适合常开侧栏的人。",
                items: [
                  {
                    fullName: "omdsh-dev/DSH-better-sidebar",
                    name: "DSH-better-sidebar",
                    nameZh: "可扩展侧边栏工作台",
                    htmlUrl: "https://github.com/omdsh-dev/DSH-better-sidebar",
                    tagline: "已适配 DSH 原生侧边栏 API，右列就是工作台",
                    descriptionZh: null,
                    stars: 3628,
                    verifyStatus: "pass",
                    installCheck: { status: "pass", pkgName: "dsh-better-sidebar" },
                    rank: 1,
                    reason: "小类第 1 · 实装验证通过 · 周下载 12.8 万",
                  },
                  {
                    // 未验证 npm 的那一类：必须退回 owner/repo（与站点口径一致）
                    fullName: "zhanghao3693/dsh-dpharness",
                    name: "dsh-dpharness",
                    htmlUrl: "https://github.com/zhanghao3693/dsh-dpharness",
                    stars: 0,
                    verifyStatus: "none",
                    installCheck: { status: "warn", pkgName: "dsh-dpharness" },
                    rank: 2,
                    reason: "小类第 2 · 综合分 30",
                  },
                ],
              },
            ],
          },
        ],
      }),
    };
  }
  if (String(url).includes("/api/plugins")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        // 站点真实契约（2026-09-30 实测 q=统计 → count=30 / total=106）：
        // count = 本次返回条数，total = 该筛选下的真实命中总数。这里刻意让两者不等，
        // 用于断言 host 不会拿 count 冒充 total —— 冒充过一次，代价是用户以为搜索没生效。
        count: 2,
        total: 106,
        plugins: [
          {
            fullName: "omdsh-dev/DSH-better-sidebar",
            name: "DSH-better-sidebar",
            nameZh: "可扩展侧边栏工作台",
            owner: "omdsh-dev",
            htmlUrl: "https://github.com/omdsh-dev/DSH-better-sidebar",
            description: "开放的侧边栏底座，支持三方拓展注册新侧边栏页面。内置文件渲染编辑/终端 ｜ Open sidebar foundation.",
            descriptionZh: "开放的侧边栏底座，支持三方拓展注册新侧边栏页面，内置文件渲染编辑、终端、侧边对话与子代理页面。",
            tagline: "已适配 DSH 原生侧边栏 API，右列就是工作台",
            stars: 3628,
            category: "browser",
            tier: "core",
            pluginType: "deepseek-harness",
            dshCompat: "v0.20+",
            riskLevel: "low",
            verifyStatus: "pass",
            testedStatus: "passed",
            installCheck: { status: "pass", pkgName: "dsh-better-sidebar" },
            finalScore: 71,
          },
          {
            // 未发布到 npm 的那一类：站点给 owner/repo，走 GitHub 源安装
            fullName: "zhanghao3693/dsh-dpharness",
            name: "dsh-dpharness",
            owner: "zhanghao3693",
            htmlUrl: "https://github.com/zhanghao3693/dsh-dpharness",
            description: "严选插件：在 dsh 里浏览 dpharness.com 目录并一键安装",
            stars: 0,
            category: "market",
            tier: "core",
            pluginType: "deepseek-harness",
            verifyStatus: "warn",
            installCheck: { status: "warn", pkgName: "dsh-dpharness" },
            finalScore: 30,
          },
        ],
      }),
    };
  }
  return { ok: true, status: 200, json: async () => ({ ok: true }) };
};

const host = await import("./lib/index.js");
const routes = {};
const ctx = {
  effect: (fn) => fn(),
  webServer: { register: (config) => { routes[config.path] = config.handler; return { dispose() {} }; } },
};
host.apply(ctx);

check("host: name 导出", host.name === "dpharness", host.name);
check("host: 版本号形如 x.y.z", /^\d+\.\d+\.\d+$/.test(host.VERSION), host.VERSION);
const pkgVersion = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url), "utf8")).version;
check("host: package.json 版本与代码常量一致", pkgVersion === host.VERSION, `package.json=${pkgVersion} code=${host.VERSION}`);
check("host: 注册九条路由", Object.keys(routes).length === 9, Object.keys(routes).join(", "));

/* --- Electron 桌面宿主：CLI 定位与 profile 判定 ---
   2026-09-30 用户实测：桌面版下每次安装都失败，错误是
   "cannot locate the dsh entry point (process.argv[1])"。
   原因：宿主跑在 Electron 进程里，argv[1] 是 "--expose-internals" 而非脚本路径；
   且桌面版实际使用 desktop profile，而判定会 fallback 到 "web"（装错地方）。 */
const REAL_SHELL_EXE = "/Applications/DeepSeek Harness.app/Contents/MacOS/DeepSeek Harness";
check(
  "desktop: 从 Electron 可执行路径推出 app 自带 CLI",
  host.desktopShellCli(REAL_SHELL_EXE, true) === "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh",
  String(host.desktopShellCli(REAL_SHELL_EXE, true)),
);
check("desktop: 非 Electron 环境绝不猜路径", host.desktopShellCli("/usr/local/bin/node", false) === null);
check(
  "desktop: 伪造的 profiles 路径不认（必须是磁盘上真实存在的 profile）",
  host.profileFromArgv(["/tmp/definitely-not-a-profile/profiles/ghost"]) === null,
);
const realProfileArg = path.join(os.homedir(), ".dsh", "profiles", "desktop");
if (fs.existsSync(path.join(realProfileArg, "package.json"))) {
  check(
    "desktop: 从宿主 argv 的 profiles/<name> 推出 profile",
    host.profileFromArgv([REAL_SHELL_EXE, "--expose-internals", "/x/lib/index.js", "/x/app.asar/dsh", realProfileArg, "/x/runtime"]) === "desktop",
    String(host.profileFromArgv([realProfileArg])),
  );
}
check(
  "desktop: argv 无 profiles 路径时返回 null（launchd 版判定不受影响）",
  host.profileFromArgv(["/usr/local/bin/node", "/Users/x/ws/bin/dsh", "web", "--port", "8787"]) === null,
);

function mockRes() {
  const out = { status: 0, body: null };
  return {
    out,
    writeHead(status) { out.status = status; },
    end(payload) { try { out.body = payload ? JSON.parse(payload) : null; } catch { out.body = payload; } },
  };
}

function mockReq(method, url, body) {
  const listeners = {};
  const req = {
    method,
    url,
    on(event, handler) { (listeners[event] ||= []).push(handler); return req; },
    destroy() {},
  };
  setTimeout(() => {
    (listeners.data || []).forEach((fn) => fn(Buffer.from(body === undefined ? "" : JSON.stringify(body))));
    (listeners.end || []).forEach((fn) => fn());
  }, 0);
  return req;
}

/* --- catalog route --- */
const res = mockRes();
await routes["/api/dpharness/search"]({ method: "GET", url: "/api/dpharness/search?q=sidebar&take=3" }, res);
check("search: 200", res.out.status === 200, "status=" + res.out.status);
const sample = res.out.body && res.out.body.plugins && res.out.body.plugins[0];
check("search: 字段裁剪", sample && !("finalScore" in sample) && "fullName" in sample);
check("search: 安装命令形式", sample && /^dsh plugin --profile web add \S+$/.test(sample.cmd || ""), sample && sample.cmd);
check("search: 带出汉化正文 descZh", sample && /开放的侧边栏底座/.test(sample.descZh || ""), sample && sample.descZh);
check("search: 带出卖点 sell", sample && sample.sell === "已适配 DSH 原生侧边栏 API，右列就是工作台", sample && sample.sell);
check("search: 分类已译中文", sample && sample.cat === "浏览器", sample && sample.cat);

/* --- 结果总数：必须是上游 total，不是本次返回条数 ---
   用户报「搜索不生效」的直接原因：以前拿 list.length 当结果数，于是
   「共 N 条结果」里的 N 恒等于 take（默认 30），搜索前后数字完全不变。 */
check("search: 透传上游 total（真实命中总数）", res.out.body.total === 106, "total=" + res.out.body.total);
check("search: count 仍是本次返回条数（两者不可混为一谈）", res.out.body.count === 2, "count=" + res.out.body.count);

/* --- 安装命令口径必须与站点 resolveInstallTarget 一致 --- */
const repoItem = res.out.body.plugins[1];
check("口径: 未验证 npm 时用 owner/repo", repoItem && repoItem.cmd === "dsh plugin --profile web add zhanghao3693/dsh-dpharness", repoItem && repoItem.cmd);
check("口径: 标注来源为 repo", repoItem && repoItem.src === "repo" && repoItem.verified === false, repoItem && `${repoItem.src}/${repoItem.verified}`);
check("口径: 未验证时不给一键安装（pkg 为空）", repoItem && repoItem.pkg === null, JSON.stringify(repoItem && repoItem.pkg));
check("口径: status=warn 也算未验证（只有 pass 才用包名）", sample && sample.src === "npm" && sample.verified === true, sample && `${sample.src}/${sample.verified}`);
check("口径: 两条都有命令，不再出现『什么都不给』", !!(sample && sample.cmd) && !!(repoItem && repoItem.cmd));

/* --- pickZh：用真实抓到的上游样本做判据（含垃圾数据） --- */
const good = [
  ["deepseek 官方", "用插件自由拼装智能体，快速搭建专属 AI 工作流"],
  ["中英混排", "OpenDesign：开源的 Claude Design 替代方案"],
  ["尾带省略号", "面向企业级、本地优先的智能体工作台，服务于个人与智能体团队…"],
];
for (const [name, input] of good) {
  const out = host.pickZh(input);
  check(`pickZh 保留可用卖点（${name}）`, typeof out === "string" && out.length > 0, out === null ? "null" : out.slice(0, 40));
}
const junk = [
  ["HTML 实体垃圾", "安装&nbsp;&nbsp;&nbsp;"],
  ["README 目录导航", "Overview • Architecture • Key Features • Getting Started •…"],
  ["纯英文 tagline", "A curated list of plugins for DeepSeek Harness dsh ·…"],
  ["中文过少", "DeepSeek Harness 插件"],
  ["空值", ""],
  ["非字符串", null],
];
for (const [name, input] of junk) {
  check(`pickZh 丢弃噪声（${name}）`, host.pickZh(input) === null, JSON.stringify(host.pickZh(input)));
}
check(
  "pickZh 处理中英顺序不定（中文在后）",
  host.pickZh("A curated list of plugins for DeepSeek Harness (dsh) · DeepSeek Harness 插件精选列表") !== null,
  host.pickZh("A curated list of plugins for DeepSeek Harness (dsh) · DeepSeek Harness 插件精选列表"),
);
check("pickZh 去掉尾部省略号", !/…$/.test(host.pickZh("面向企业级、本地优先的智能体工作台，服务于个人与智能体团队…") || "…"), host.pickZh("面向企业级、本地优先的智能体工作台，服务于个人与智能体团队…"));

/* --- 上线后由端到端验证抓到的真实 bug：中文在截断点之后 → 输出纯英文 --- */
const lateZh = "Chrome sidebar extension that lets DeepSeek Harness operate your browser directly, no visible UI needed. 让 DeepSeek Harness 直接操控你的浏览器，无需切窗口";
const lateOut = host.pickZh(lateZh, 90);
check("pickZh 中文在截断点之后 → 不返回纯英文", typeof lateOut === "string" && /[\u4e00-\u9fff]/.test(lateOut), JSON.stringify(lateOut));
check("pickZh 截断结果仍含足够中文", ((lateOut || "").match(/[\u4e00-\u9fff]/g) || []).length >= 4, JSON.stringify(lateOut));
check("pickZh 纯英文长句仍拒绝", host.pickZh("Chrome sidebar extension that lets DeepSeek Harness operate your browser directly, no visible UI needed at all here", 90) === null);
check("pickZh 尊重 max 上限", (host.pickZh("这是一个很长的中文说明".repeat(20), 40) || "").length <= 40, String((host.pickZh("这是一个很长的中文说明".repeat(20), 40) || "").length));

/* --- 第二个真实 bug：descZh 含 43 个中文字，但前 262 字是英文 --- */
const realBilingual = "The best DeepSeek Harness plugin for context insight and management. See what your agent reads, in what order, what it makes of, and how it evolves. 一站式 DeepSeek Harness 上下文可视化插件，Context 面板及浏览器和终端一体化视图。";
const biOut = host.pickZh(realBilingual, 400);
check("pickZh 丢掉中文之前的英文长前缀", typeof biOut === "string" && /^[\u4e00-\u9fff]/.test(biOut), JSON.stringify((biOut || "").slice(0, 40)));
check("pickZh 保留短前缀不误伤（Browser4——…）", /^Browser4——/.test(host.pickZh("Browser4——一个面向自主智能体、智能提取和大规模 Web 自动化的 AI 原生浏览器引擎", 400) || ""), host.pickZh("Browser4——一个面向自主智能体、智能提取和大规模 Web 自动化的 AI 原生浏览器引擎", 400));

const res405 = mockRes();
await routes["/api/dpharness/search"]({ method: "POST", url: "/api/dpharness/search" }, res405);
check("search: 非 GET → 405", res405.out.status === 405, "status=" + res405.out.status);

/* --- telemetry relay: 站点契约 { type, value, path, visitorId } --- */
async function relay(payload) {
  const out = mockRes();
  const req = mockReq("POST", "/api/dpharness/event", payload);
  await routes["/api/dpharness/event"](req, out);
  const forwarded = sent.filter((entry) => entry.url.includes("/api/track/event")).pop();
  return { res: out, forwarded };
}

const vid = "0f4b2c1e-1111-2222-3333-444455556666";
const copy = await relay({
  event: "copy_install",
  visitorId: vid,
  detail: { cmd: "dsh plugin --profile web add dsh-better-sidebar", pkg: "dsh-better-sidebar" },
});
let body = copy.forwarded && JSON.parse(copy.forwarded.options.body);
check("relay: 转发到 /api/track/event", !!(copy.forwarded && copy.forwarded.url === "https://dpharness.com/api/track/event"), copy.forwarded && copy.forwarded.url);
check("relay: copy_install 与站点同口径（value=整条命令）", body && body.type === "copy_install" && body.value === "dsh plugin --profile web add dsh-better-sidebar", JSON.stringify(body));
check("relay: visitorId 合法", body && /^[A-Za-z0-9-]{8,64}$/.test(body.visitorId), body && body.visitorId);
check("relay: path 不含 query（服务端会 split('?')[0]）", body && body.path === "/dsh-plugin" && !body.path.includes("?"), body && body.path);
check("relay: UA 带插件标识", copy.forwarded && /dsh-dpharness\/\d+\.\d+\.\d+/.test(copy.forwarded.options.headers["user-agent"]), copy.forwarded && copy.forwarded.options.headers["user-agent"]);

const search = await relay({ event: "plugin_hub", visitorId: vid, detail: { action: "search", length: 7, results: 23 } });
body = search.forwarded && JSON.parse(search.forwarded.options.body);
check("relay: plugin_hub 载荷", body && body.type === "plugin_hub" && body.value === "search:len=7:hits=23:v=" + host.VERSION, JSON.stringify(body));
check("relay: 不含搜索关键词原文", body && !/kimi|sidebar/i.test(String(body.value)), body && body.value);

const bad = await relay({ event: "whatever", visitorId: vid, detail: {} });
check("relay: 白名单外事件 → 400", bad.res.out.status === 400, "status=" + bad.res.out.status);

const badVid = await relay({ event: "plugin_hub", visitorId: "short", detail: { action: "open" } });
body = badVid.forwarded && JSON.parse(badVid.forwarded.options.body);
check("relay: 非法 visitorId → null", body && body.visitorId === null, JSON.stringify(body && body.visitorId));

/* --- install route：只测拒绝路径与状态形状，自动化测试绝不真装 --- */
/* --- 分类精选（站点 /best 的同源数据） ---
   放在 install 段之前：那条「自动化测试未触发真实安装」的不变式会在 install 段开始时
   对 `sent` 取快照，任何晚于它的出站调用都会被算作"install 段新增请求"（本次踩到）。 */
const best = mockRes();
await routes["/api/dpharness/best"]({ method: "GET", url: "/api/dpharness/best" }, best);
check("best: 200", best.out.status === 200, "status=" + best.out.status);
check(
  "best: 带期次与总数",
  best.out.body.month === "2026-09" && best.out.body.total === 2,
  JSON.stringify({ month: best.out.body.month, total: best.out.body.total }),
);
const bestCat = (best.out.body.categories || [])[0];
const bestSub = bestCat && (bestCat.subs || [])[0];
check(
  "best: 三级分组（大类→小类→条目）",
  !!(bestCat && bestSub && (bestSub.items || []).length === 2),
  bestCat ? `${bestCat.label} / ${bestSub && bestSub.label}` : "无分类",
);
const bestItem = bestSub && bestSub.items[0];
check(
  "best: 条目走同一个 slim()（命令/来源/包名齐全）",
  bestItem && bestItem.cmd === "dsh plugin --profile web add dsh-better-sidebar" && bestItem.src === "npm" && bestItem.pkg === "dsh-better-sidebar",
  bestItem && `${bestItem.cmd} | src=${bestItem.src}`,
);
check(
  "best: 名次与上榜理由被保留（去掉就只是又一个列表）",
  bestItem && bestItem.rank === 1 && typeof bestItem.reason === "string" && bestItem.reason.includes("实装验证通过"),
  bestItem && `#${bestItem.rank} ${bestItem.reason}`,
);
check("best: 大类 key 注入条目的分类字段", bestItem && bestItem.cat === "浏览器", bestItem && bestItem.cat);
check(
  "best: 未验证 npm 的条目退回 owner/repo",
  bestSub && bestSub.items[1] && bestSub.items[1].src === "repo" && bestSub.items[1].cmd === "dsh plugin --profile web add zhanghao3693/dsh-dpharness",
  bestSub && bestSub.items[1] && bestSub.items[1].cmd,
);

const best405 = mockRes();
await routes["/api/dpharness/best"]({ method: "POST", url: "/api/dpharness/best" }, best405);
check("best: 非 GET → 405", best405.out.status === 405, "status=" + best405.out.status);

/* --- v0.5.0 套装（站点 /sets 同源）：跨插件纵向组合 ---
   与 best 的分工是「纵向 vs 横向」；命令同样必须由本机拼装（不能抄站点的 --profile web）。 */
const setsRes = mockRes();
await routes["/api/dpharness/sets"]({ method: "GET", url: "/api/dpharness/sets" }, setsRes);
const setsBody = setsRes.out.body;
check("sets: 200 + 方案数", setsRes.out.status === 200 && setsBody.total === 2, `status=${setsRes.out.status} total=${setsBody.total}`);
const starter = (setsBody.sets || [])[0];
check(
  "sets: 方案元数据齐全（名称/摘要/人群/冲突提示/同步期次）",
  !!starter && starter.name === "DSH 新手开箱套装" && !!starter.summary && !!starter.audience && !!starter.conflictNote && starter.syncedMonth === "2026-10",
  starter && JSON.stringify({ name: starter.name, month: starter.syncedMonth }),
);
check(
  "sets: 条目走同一个 slim()（命令用本机 profile，与 best 同一条口径）",
  starter && starter.items[0].cmd === "dsh plugin --profile web add dsh-better-sidebar" && starter.items[0].pkg === "dsh-better-sidebar",
  starter && starter.items[0].cmd,
);
check(
  "sets: 相关生态（pluginTier=related）走 git clone —— 与站点 installCmd 同口径",
  starter && starter.items[1].cmd === "git clone https://github.com/koishi-dev/koishi-dsh.git",
  starter && starter.items[1].cmd,
);
check(
  "sets: 批量命令 = 逐条命令按安装顺序换行拼接（不在客户端拼、也不抄站点字符串）",
  starter && starter.installBlock === `${starter.items[0].cmd}\n${starter.items[1].cmd}`,
  starter && starter.installBlock.replace(/\n/g, " / "),
);
check(
  "sets: 套装必要性（need）与插件生态分层（tier）不混用（同名不同义，传输层已把后者改名 pluginTier）",
  starter && starter.items[0].need === "required" && starter.items[0].tier === "core" && starter.items[1].tier === "related",
  starter && JSON.stringify({ need: starter.items[0].need, tier: starter.items[0].tier, tier2: starter.items[1].tier }),
);
check("sets: 槽位职责原样带出（滚动槽位每月换人，界面按「这个位置干什么」渲染）", starter && starter.items[0].slotRole === "侧栏工作台", starter && starter.items[0].slotRole);
check(
  "sets: npm 归属未通过校验的条目仍给 owner/repo 命令（不能不给命令）",
  setsBody.sets[1] && setsBody.sets[1].items[0].cmd === "dsh plugin --profile web add lispking/dsh-image-gen",
  setsBody.sets[1] && setsBody.sets[1].items[0].cmd,
);
const sets405 = mockRes();
await routes["/api/dpharness/sets"]({ method: "POST", url: "/api/dpharness/sets" }, sets405);
check("sets: 非 GET → 405", sets405.out.status === 405, "status=" + sets405.out.status);

const outboundBeforeInstall = sent.length;

const installGet = mockRes();
await routes["/api/dpharness/install"]({ method: "GET", url: "/api/dpharness/install" }, installGet);
check("install: GET 返回 job 视图", installGet.out.status === 200 && installGet.out.body.job && installGet.out.body.job.active === false, JSON.stringify(installGet.out.body && installGet.out.body.job));

const unsafe = mockRes();
await routes["/api/dpharness/install"](mockReq("POST", "/api/dpharness/install", { pkg: "evil; rm -rf /" }), unsafe);
check("install: 注入型目标 → 400", unsafe.out.status === 400, "status=" + unsafe.out.status + " " + JSON.stringify(unsafe.out.body));

const unsafe2 = mockRes();
await routes["/api/dpharness/install"](mockReq("POST", "/api/dpharness/install", { pkg: "$(whoami)" }), unsafe2);
check("install: 命令替换 → 400", unsafe2.out.status === 400, "status=" + unsafe2.out.status);

const empty = mockRes();
await routes["/api/dpharness/install"](mockReq("POST", "/api/dpharness/install", {}), empty);
check("install: 空目标 → 400", empty.out.status === 400, "status=" + empty.out.status);

const install405 = mockRes();
await routes["/api/dpharness/install"]({ method: "DELETE", url: "/api/dpharness/install" }, install405);
check("install: 非 GET/POST → 405", install405.out.status === 405, "status=" + install405.out.status);

const metaRoutes = mockRes();
routes["/api/dpharness/meta"]({ method: "GET", url: "/api/dpharness/meta" }, metaRoutes);
check("meta: 列出九条路由", metaRoutes.out.body.routes.length === 9, JSON.stringify(metaRoutes.out.body.routes));

check("meta: 带 profile", typeof metaRoutes.out.body.profile === "string", metaRoutes.out.body.profile);
check("meta: 带进程启动时间（判重启的基准）", Number.isFinite(metaRoutes.out.body.startedAt) && metaRoutes.out.body.startedAt <= Date.now(), String(metaRoutes.out.body.startedAt));
check("自动化测试未触发真实安装", sent.length === outboundBeforeInstall && installGet.out.body.job.active === false, "install 段新增外部请求=" + (sent.length - outboundBeforeInstall));

/* --- v0.4.2：安装漏斗与「安装成功之后」的埋点 ---
   这一段回答的问题：装完之后到底发生过什么。此前只有 installed_*（成功那一刻），
   失败、取消、重启、重启后是否生效全都没有记录。 */
const hello = await relay({ event: "plugin_hub", visitorId: vid, detail: { action: "hello" } });
body = hello.forwarded && JSON.parse(hello.forwarded.options.body);
check("relay: 每条事件附插件版本（新埋点覆盖率的唯一判据）", body && body.value === "hello:v=" + host.VERSION, JSON.stringify(body && body.value));

const failed = await relay({
  event: "plugin_hub",
  visitorId: vid,
  detail: { action: "install_failed", via: "local", why: "cli_exit" },
});
body = failed.forwarded && JSON.parse(failed.forwarded.options.body);
check("relay: 安装失败带阶段与闭集原因", body && body.value === "install_failed:via=local:why=cli_exit:v=" + host.VERSION, JSON.stringify(body && body.value));

const whyDirty = await relay({
  event: "plugin_hub",
  visitorId: vid,
  detail: { action: "install_failed", via: "local", why: "boom; rm -rf /tmp/x" },
});
body = whyDirty.forwarded && JSON.parse(whyDirty.forwarded.options.body);
check("relay: 原因字段被收紧（不带出本地路径/元字符）", body && !/[ ;]/.test(String(body.value).split("why=")[1] || ""), JSON.stringify(body && body.value));

const postKnown = await relay({
  event: "plugin_hub",
  visitorId: vid,
  detail: { action: "post_install", via: "local", restarted: true, bundled: false },
});
body = postKnown.forwarded && JSON.parse(postKnown.forwarded.options.body);
check("relay: 安装后回执（重启/生效两个布尔量）", body && body.value === "post_install:via=local:restarted=1:bundled=0:v=" + host.VERSION, JSON.stringify(body && body.value));

const postUnknown = await relay({ event: "plugin_hub", visitorId: vid, detail: { action: "post_install", via: "market" } });
body = postUnknown.forwarded && JSON.parse(postUnknown.forwarded.options.body);
check("relay: 查不到就不写字段（未知必须区别于否）", body && body.value === "post_install:via=market:v=" + host.VERSION && !/restarted|bundled/.test(body.value), JSON.stringify(body && body.value));

/* postinstall 路由：两个判据都来自 host（客户端无法自证） */
const pkgQuery = "pkg=dsh-dpharness&via=local&at=";
const postRoute = async (query, method = "GET") => {
  const out = mockRes();
  await routes["/api/dpharness/postinstall"]({ method, url: "/api/dpharness/postinstall?" + query }, out);
  return out;
};
const postFar = await postRoute(pkgQuery + (Date.now() + 60 * 1000));
check("postinstall: 安装时间在未来 → restarted=false", postFar.out.status === 200 && postFar.out.body.restarted === false, JSON.stringify(postFar.out.body));
const postPast = await postRoute(pkgQuery + "1");
check("postinstall: 进程启动晚于安装 → restarted=true", postPast.out.body.restarted === true, JSON.stringify(postPast.out.body));
const postNoAt = await postRoute("pkg=dsh-dpharness&via=local&at=abc");
check("postinstall: 时间戳不可用 → restarted=null（不是 false）", postNoAt.out.body.restarted === null, JSON.stringify(postNoAt.out.body));
const post405 = await postRoute("", "POST");
check("postinstall: 非 GET → 405", post405.out.status === 405, "status=" + post405.out.status);
const postUnsafe = await postRoute("pkg=" + encodeURIComponent("$(whoami)") + "&at=1");
check("postinstall: 不安全包名不落盘查询", postUnsafe.out.body.dep === null && postUnsafe.out.body.bundled === null, JSON.stringify(postUnsafe.out.body));

/* pkgState 三态：true / false / null 必须各不相同 —— 「查不到」被当成
   「没装上」会让整条漏斗的结论反过来。 */
check("pkgState: 清单不可读 → 全 null", JSON.stringify(host.pkgState("x", null)) === '{"dep":null,"bundled":null}', JSON.stringify(host.pkgState("x", null)));
check("pkgState: 有依赖无 bundles → dep=true, bundled=null", JSON.stringify(host.pkgState("x", { dependencies: { x: "1.0.0" } })) === '{"dep":true,"bundled":null}', JSON.stringify(host.pkgState("x", { dependencies: { x: "1.0.0" } })));
check("pkgState: 在加载清单里 → bundled=true", JSON.stringify(host.pkgState("x", { dependencies: {}, dsh: { profile: { bundles: ["x"] } } })) === '{"dep":false,"bundled":true}', JSON.stringify(host.pkgState("x", { dependencies: {}, dsh: { profile: { bundles: ["x"] } } })));
check("pkgState: 都不在 → 全 false", JSON.stringify(host.pkgState("x", { dependencies: {}, dsh: { profile: { bundles: [] } } })) === '{"dep":false,"bundled":false}', JSON.stringify(host.pkgState("x", { dependencies: {}, dsh: { profile: { bundles: [] } } })));

/* --- v0.5.0：更新日志（host 侧） ---
   两个上游默认都不可用，正是 2026-10-12 的线上实况：仓库没有 Release、离线时 npm 也查不到。
   三态是这一节的判据核心：latest=null（查不到）绝不能被显示成「已是最新」。 */
const changelogMod = await import("./lib/changelog.js");
check("changelog: 首条版本号 == 代码常量 VERSION（发版纪律的一半）", changelogMod.CHANGELOG[0].version === host.VERSION, changelogMod.CHANGELOG[0].version + " vs " + host.VERSION);
check("changelog: 首条版本号 == package.json version（另一半，少了它就悄悄落后于发版）", changelogMod.CHANGELOG[0].version === pkgVersion, changelogMod.CHANGELOG[0].version + " vs " + pkgVersion);
check(
  "changelog: 条目按版本从新到旧（界面靠顺序表达新旧，排序错了就是错的）",
  changelogMod.CHANGELOG.every((entry, i, all) => i === 0 || changelogMod.compareVersions(all[i - 1].version, entry.version) > 0),
  changelogMod.CHANGELOG.map((e) => e.version).join(" > "),
);
check(
  "changelog: 每条都有 version/date/title 且 items 非空",
  changelogMod.CHANGELOG.every((e) => e.version && e.date && e.title && Array.isArray(e.items) && e.items.length > 0),
);
check("compareVersions: 0.4.4 < 0.5.0", changelogMod.compareVersions("0.4.4", "0.5.0") === -1);
check("compareVersions: 相等", changelogMod.compareVersions("0.5.0", "0.5.0") === 0);
check("compareVersions: 0.10.0 > 0.9.9（不能按字符串比）", changelogMod.compareVersions("0.10.0", "0.9.9") === 1);
check("compareVersions: 脏输入不抛错、也不误报有新版本", changelogMod.compareVersions("x", "0.0.0") === 0, String(changelogMod.compareVersions("x", "0.0.0")));
const rawBody = "- 修复 A\n## 标题\n\n---\nhttps://example.com/x\n* 新增 B";
check("releaseItems: 剥掉 markdown 记号、丢掉分隔线与纯链接", JSON.stringify(changelogMod.releaseItems(rawBody)) === JSON.stringify(["修复 A", "标题", "新增 B"]), JSON.stringify(changelogMod.releaseItems(rawBody)));
check(
  "normalizeReleases: 草案与非法 tag 被丢弃",
  changelogMod.normalizeReleases([
    { tag_name: "v0.6.0", published_at: "2026-11-01T00:00:00Z", body: "x", draft: false },
    { tag_name: "v0.5.1", draft: true },
    { tag_name: "nightly" },
  ]).length === 1,
);
check(
  "mergeChangelog: 远端与内置同版本 → 用远端（Release 才是发版的正式说明，且能事后修正）",
  changelogMod.mergeChangelog(changelogMod.CHANGELOG, [{ tag_name: "v0.5.0", published_at: "2026-10-13T00:00:00Z", body: "- 远端改写的说明", draft: false }]).find((e) => e.version === "0.5.0").items[0] === "远端改写的说明",
);
check(
  "mergeChangelog: 远端正文为空时不覆盖内置（空 release 很常见，覆盖会丢信息）",
  changelogMod.mergeChangelog(changelogMod.CHANGELOG, [{ tag_name: "v0.5.0", published_at: "2026-10-13T00:00:00Z", body: "", draft: false }]).find((e) => e.version === "0.5.0").origin === "builtin",
);
check(
  "mergeChangelog: 远端独有版本补进来",
  changelogMod.mergeChangelog(changelogMod.CHANGELOG, [{ tag_name: "v0.6.0", published_at: "2026-11-01T00:00:00Z", body: "- 新东西", draft: false }])[0].version === "0.6.0",
);

/* 路由场景一：两个上游都不可用 → 明确降级为内置，且「查不到」落到 null */
const clRoute = mockRes();
await routes["/api/dpharness/changelog"]({ method: "GET", url: "/api/dpharness/changelog" }, clRoute);
const clBody = clRoute.out.body;
check("changelog 路由: 200 且 ok", clRoute.out.status === 200 && !!clBody && clBody.ok === true, "status=" + clRoute.out.status);
check("changelog 路由: current 取自代码常量", clBody.current === host.VERSION, clBody.current);
check("changelog 路由: 查不到最新版 → latest=null 且 outdated=null（三态，绝不能等于「已是最新」）", clBody.latest === null && clBody.outdated === null, JSON.stringify({ latest: clBody.latest, outdated: clBody.outdated }));
check("changelog 路由: 无 Release → source=builtin，条目就是内置底稿", clBody.source === "builtin" && clBody.entries.length === changelogMod.CHANGELOG.length, JSON.stringify({ source: clBody.source, n: clBody.entries.length }));
check("changelog 路由: upgrade 命令用本机真实 profile 拼（与 meta 报的 profile 一致）", clBody.upgrade === "dsh plugin --profile " + metaRoutes.out.body.profile + " add dsh-dpharness@latest", clBody.upgrade);
const cl405 = mockRes();
await routes["/api/dpharness/changelog"]({ method: "POST", url: "/api/dpharness/changelog" }, cl405);
check("changelog 路由: 非 GET → 405", cl405.out.status === 405, "status=" + cl405.out.status);

/* 路由场景二：「确实有新版」。必须换一个**新的 host 实例** ——
   结果是 5 分钟缓存的，同一实例里第二次调用只会拿到上一次的缓存，那会掩盖真实分支。 */
changelogUpstream = {
  releases: [{ tag_name: "v0.5.1", published_at: "2026-10-20T00:00:00Z", name: "0.5.1", body: "- 远端发布说明", draft: false }],
};
npmVersions.set("dsh-dpharness", "0.5.1");
const hostFresh = await import("./lib/index.js?fresh=changelog");
const routesFresh = {};
hostFresh.apply({
  effect: (fn) => fn(),
  webServer: { register: (config) => { routesFresh[config.path] = config.handler; return { dispose() {} }; } },
});
const clFresh = mockRes();
await routesFresh["/api/dpharness/changelog"]({ method: "GET", url: "/api/dpharness/changelog" }, clFresh);
const clFreshBody = clFresh.out.body;
check("changelog 路由: 有 Release → source=builtin+github", clFreshBody.source === "builtin+github", clFreshBody.source);
check("changelog 路由: npm 有更高版本 → outdated=true 且带出该版本号", clFreshBody.outdated === true && clFreshBody.latest === "0.5.1", JSON.stringify({ outdated: clFreshBody.outdated, latest: clFreshBody.latest }));
check("changelog 路由: 远端同版本覆盖内置正文", (clFreshBody.entries[0].items || []).includes("远端发布说明"), JSON.stringify(clFreshBody.entries[0].items));
changelogUpstream = { releases: [] };
npmVersions.clear();

/* --- v0.5.0：已装插件的更新检查（host 侧） ---
   这条路由读的是**真实 profile**（本机 24 个依赖），所以只断言结构不变式与三态纪律，
   不断言具体包名/条数 —— 换台机器也必须成立。 */
check(
  "pluginCandidates: 从 dependencies 取，并带出 bundled 与 spec（spec 决定能不能升）",
  JSON.stringify(host.pluginCandidates(null)) === "[]"
    && JSON.stringify(host.pluginCandidates({ dependencies: { b: "1", a: "1" }, dsh: { profile: { bundles: ["a"] } } })) === JSON.stringify([{ name: "a", bundled: true, spec: "1" }, { name: "b", bundled: false, spec: "1" }]),
  JSON.stringify(host.pluginCandidates({ dependencies: { b: "1", a: "1" }, dsh: { profile: { bundles: ["a"] } } })),
);
check(
  "classifySpec: link/file = 本地链接（不该升级）",
  host.classifySpec("link:/Users/x/dsh-foo") === "local" && host.classifySpec("file:../dsh-bar") === "local",
  host.classifySpec("link:/Users/x/dsh-foo"),
);
check("classifySpec: 纯版本号 = 精确锁定（plugin add 挪不动）", host.classifySpec("0.5.27") === "pinned" && host.classifySpec("1.8.20") === "pinned", host.classifySpec("0.5.27"));
check("classifySpec: ^ / ~ / * = 可浮动范围", host.classifySpec("^0.8.5") === "range" && host.classifySpec("~1.2.0") === "range" && host.classifySpec("*") === "range", host.classifySpec("^0.8.5"));
check("classifySpec: 空值不抛错，判成 range（保守：不阻断升级入口）", host.classifySpec("") === "range" && host.classifySpec(null) === "range");

/* readInstalled 用一次性 fixture 目录验：判据是**插件契约**，不能靠本机碰巧装了什么来覆盖 */
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "dsh-upd-"));
function fixture(name, payload) {
  const dir = path.join(fixtureDir, "node_modules", name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(payload));
}
fixture("has-dsh-field", { version: "1.2.3", description: "A tiny dsh plugin", dsh: { bundle: { patch: "./cordis.patch.yml" } } });
fixture("has-peer-dsh", { version: "2.0.0", peerDependencies: { "@deepseek-ai/dsh": ">=0.1.0" } });
fixture("plain-lib", { version: "3.0.0", dependencies: { left: "1" } });
/* 「这是谁」的两条来源：本机 locale/zh.json（优先）与站点目录（补位）。这里验前者。 */
function fixtureLocale(name, payload) {
  const dir = path.join(fixtureDir, "node_modules", name, "locale");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "zh.json"), JSON.stringify(payload));
}
fixtureLocale("has-dsh-field", { meta: { title: "模型优惠时钟 (dsh-client-ui-model-clock)", description: "按优惠时段自动切换模型，省着用。" } });
fixtureLocale("has-peer-dsh", { meta: { title: "Model Clock", description: "English only here" } });
const installedInfo = host.readInstalled("has-dsh-field", fixtureDir);
check("readInstalled: 声明了 dsh 字段 → 是插件", installedInfo.version === "1.2.3" && installedInfo.plugin === true, JSON.stringify(installedInfo));
check("readInstalled: 带上原文描述（中文名缺失时界面拿它兜底并标「未汉化」）", installedInfo.desc === "A tiny dsh plugin", installedInfo.desc);
check("readInstalled: peerDependencies 命中 @deepseek-ai/dsh → 是插件", host.readInstalled("has-peer-dsh", fixtureDir).plugin === true);
check("readInstalled: 普通依赖 → 不是插件（按契约判，不按包名猜）", host.readInstalled("plain-lib", fixtureDir).plugin === false);
check("readInstalled: 读不到 → null（未知，不等于「不是插件」）", host.readInstalled("not-installed-here", fixtureDir) === null);

/* localIdentity：只认包自己声明的中文元数据，读不到就 null —— 不猜、不翻译 */
const idHit = host.localIdentity("has-dsh-field", fixtureDir);
check("localIdentity: 取 meta.title 作中文名", !!idHit && idHit.nameZh === "模型优惠时钟", idHit && idHit.nameZh);
check("localIdentity: 去掉 title 里重复的那截包名（界面另有位置放包名）", !!idHit && !/dsh-client-ui-model-clock/.test(idHit.nameZh), idHit && idHit.nameZh);
check("localIdentity: 带出中文说明", !!idHit && /省着用/.test(idHit.note), idHit && idHit.note);
check("localIdentity: 只有英文 title → null（绝不把英文当中文名）", host.localIdentity("has-peer-dsh", fixtureDir) === null, JSON.stringify(host.localIdentity("has-peer-dsh", fixtureDir)));
check("localIdentity: 没有 locale 目录 → null（不抛错）", host.localIdentity("plain-lib", fixtureDir) === null, JSON.stringify(host.localIdentity("plain-lib", fixtureDir)));
fs.rmSync(fixtureDir, { recursive: true, force: true });

check(
  "sortUpdates: 可升级 → 未知 → 已最新，同组按包名",
  host.sortUpdates([{ name: "b", outdated: false }, { name: "a", outdated: null }, { name: "c", outdated: true }]).map((e) => e.name).join("") === "cab",
  host.sortUpdates([{ name: "b", outdated: false }, { name: "a", outdated: null }, { name: "c", outdated: true }]).map((e) => e.name + ":" + e.outdated).join(", "),
);

/* 路由：只让镜像认得本插件 → self 可判定，已装插件全部落在「查不到」而不是「已最新」 */
npmVersions.set("dsh-dpharness", "9.9.9");
const upRoute = mockRes();
await routes["/api/dpharness/updates"]({ method: "GET", url: "/api/dpharness/updates" }, upRoute);
const upBody = upRoute.out.body;
check("updates 路由: 200 且 ok", upRoute.out.status === 200 && !!upBody && upBody.ok === true, "status=" + upRoute.out.status);
check("updates 路由: 带形状版本号（客户端据此识别「宿主是旧的」）", typeof upBody.rev === "number" && upBody.rev === host.SHAPE_REV, "rev=" + upBody.rev);
check("updates 路由: self.current 取自代码常量、latest 取自镜像", upBody.self.current === host.VERSION && upBody.self.latest === "9.9.9", JSON.stringify(upBody.self));
check(
  "updates 路由: 判定有新版本，并给出用本机 profile + **具体版本号** 拼的升级命令（@latest 在 dsh 上会空转）",
  upBody.self.outdated === true && upBody.self.upgrade === "dsh plugin --profile " + upBody.profile + " add dsh-dpharness@9.9.9",
  upBody.self.upgrade,
);
check("updates 路由: 本插件**不**在已装清单里重复出现（两处都列会让人以为要升两次）", upBody.plugins.every((item) => item.name !== host.PKG_NAME), upBody.plugins.map((item) => item.name).join(","));
check(
  "updates 路由: 镜像查不到的包 → outdated=null（绝不能写成 false「已是最新」）",
  upBody.plugins.every((item) => item.outdated === null),
  "已装插件 " + upBody.plugins.length + " 个：" + JSON.stringify(upBody.plugins.slice(0, 3)),
);
check(
  "updates 路由: counts 自洽",
  upBody.counts.checked === upBody.plugins.length && upBody.counts.unknown === upBody.counts.checked && upBody.counts.installed >= upBody.counts.checked,
  JSON.stringify(upBody.counts),
);
check(
  "updates 路由: 每条都带用本机 profile 拼的升级命令",
  upBody.plugins.every((item) => item.upgrade === "dsh plugin --profile " + upBody.profile + " add " + item.name + "@latest"),
  upBody.plugins[0] && upBody.plugins[0].upgrade,
);
check(
  "updates 路由: 每条都带「这是谁」的两个字段（中文名可能为空，说明一定有来源）",
  upBody.plugins.every((item) => typeof item.nameZh === "string" && typeof item.note === "string")
    && typeof upBody.self.nameZh === "string" && typeof upBody.self.note === "string",
  JSON.stringify({ self: { nameZh: upBody.self.nameZh, note: (upBody.self.note || "").slice(0, 24) }, first: upBody.plugins[0] && { nameZh: upBody.plugins[0].nameZh, note: (upBody.plugins[0].note || "").slice(0, 24) } }),
);
check(
  "updates 路由: 中文名只在这一条里出现中文（英文包名不会被当成中文名）",
  upBody.plugins.every((item) => !item.nameZh || /[\u4e00-\u9fff]/.test(item.nameZh)),
  JSON.stringify(upBody.plugins.map((i) => i.nameZh).filter(Boolean).slice(0, 5)),
);
const upCached = mockRes();
await routes["/api/dpharness/updates"]({ method: "GET", url: "/api/dpharness/updates?refresh=1" }, upCached);
check("updates 路由: 连点「检查更新」在 30 秒内只放行一次（缓存可以绕，镜像不能被打爆）", upCached.out.body.cached === true, String(upCached.out.body.cached));
const up405 = mockRes();
await routes["/api/dpharness/updates"]({ method: "POST", url: "/api/dpharness/updates" }, up405);
check("updates 路由: 非 GET → 405", up405.out.status === 405, "status=" + up405.out.status);
npmVersions.delete("dsh-dpharness");

/* --- 2026-10-12 用户实测：复制出去的安装命令装错了 profile ---
   原先照抄站点详情页的 `--profile web`；desktop profile 的用户拿去执行会装进 web profile，
   桌面版里永远看不到那个插件 —— 用户只会得出「安装不成功」。 */
const searchRoute = mockRes();
await routes["/api/dpharness/search"]({ method: "GET", url: "/api/dpharness/search?q=&take=30" }, searchRoute);
const searchCmds = (searchRoute.out.body.plugins || []).map((item) => item.cmd).filter(Boolean);
check(
  "搜索：复制出去的安装命令用**本机真实 profile**（桌面版不能照抄站点的 --profile web）",
  searchCmds.length > 0 && searchCmds.every((cmd) => cmd.indexOf("--profile " + metaRoutes.out.body.profile + " ") > 0),
  searchCmds[0],
);
check(
  "host: 生成命令处不再硬编码 --profile web（有测试锁住）",
  /cmd: target \? `dsh plugin --profile \$\{PROFILE\} add \$\{target\}` : null/.test(fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8")),
);
const clientSrcUpd = fs.readFileSync(new URL("./lib/client.js", import.meta.url), "utf8");
check("client: 底部提示词不再把 --profile web 说成必填（那会把人推向错 profile）", !/--profile web/.test(clientSrcUpd) && clientSrcUpd.includes('t("footer.hint")'));

/* --- 本地链接与精确锁定：不该被当成"可升级" --- */
check(
  "updates 路由: 本地链接的包不进更新检查，单列在 locals 里（本机 20 个依赖里有 11 个）",
  !upBody.plugins.some((item) => String(item.spec || "").startsWith("link:"))
    && upBody.locals.every((row) => String(row.spec || "").startsWith("link:") || String(row.spec || "").startsWith("file:"))
    && upBody.counts.local === upBody.locals.length,
  "local=" + upBody.counts.local + " checked=" + upBody.counts.checked,
);
check(
  "updates 路由: 每条带 spec 与 kind（界面据此解释「为什么升不动」）",
  upBody.plugins.every((item) => typeof item.spec === "string" && ["range", "pinned"].includes(item.kind)),
  JSON.stringify(upBody.plugins.slice(0, 2).map((i) => ({ n: i.name, spec: i.spec, kind: i.kind }))),
);
check("client: 精确锁定的行标出来并说明原因", clientSrcUpd.includes('t("updates.pinned")') && clientSrcUpd.includes('t("updates.pinnedNote")'));
check("client: 本地链接单列并说清「为什么不在列表里」", clientSrcUpd.includes('t("updates.locals")') && clientSrcUpd.includes('t("updates.localsNote")'));
check("client: 装完刷新清单（否则行上还是旧版本号，用户判定「升级没成功」）", /loadUpdates\(true\);/.test(clientSrcUpd) && (clientSrcUpd.match(/loadUpdates\(true\)/g) || []).length >= 3);
check("host: 安装成功后作废更新缓存（否则刷新拿到的还是装之前那份清单）", /updatesCache = \{ at: 0, value: null \};/.test(fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8")));

/* --- v0.5.0 卸载：与安装共用同一条通道，只换 verb（add | remove）---
   不在这里真跑 POST：那会 spawn 一个真的 `dsh plugin remove`，测试机上的插件会被卸掉。
   所以钉的是「同一条通道 + verb 闭集 + 三态不谎报」。 */
const hostSrcRemove = fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8");
const rmJob = mockRes();
await routes["/api/dpharness/install"]({ method: "GET", url: "/api/dpharness/install" }, rmJob);
check(
  "remove: job 视图带 verb（界面据此分辨是装还是卸）",
  !!(rmJob.out.body.job && "verb" in rmJob.out.body.job),
  JSON.stringify(rmJob.out.body.job && rmJob.out.body.job.verb),
);
check(
  "remove: 与安装共用同一条 spawn（只把 add 换成 installJob.verb，不另写一套）",
  /"plugin", "--profile", PROFILE, installJob\.verb, target/.test(hostSrcRemove),
);
check(
  "remove: verb 是闭集（只认 remove，其余一律按 add，不接受未枚举动作）",
  /input\.verb === "remove" \? "remove" : "add"/.test(hostSrcRemove),
);
check(
  "remove: 三态公式对装卸都成立（changed 卸掉了 / same 还在 / none 本来就没装）",
  /installJob\.before === installJob\.after \? "same" : "changed"/.test(hostSrcRemove) && /installJob\.verb = verb === "remove" \? "remove" : "add"/.test(hostSrcRemove),
);
check(
  "client: 三态如实报 —— changed 装上 / same **本来就是这版**（是成功）/ none 什么都没发生",
  clientSrcUpd.includes('t("updates.noChangeTitle")') && clientSrcUpd.includes('t("updates.alreadyTitle")')
    && /job\.outcome \|\| \(job\.changed === false \? "same"/.test(clientSrcUpd),
);
check(
  "client: 设置页有「自动检查插件更新」开关（有真实用户后必须可关）",
  clientSrcUpd.includes('"settings.check":') && clientSrcUpd.includes('"settings.checkHint":') && /switchRow\("check", "settings\.check", "settings\.checkHint", state\.autoCheck/.test(clientSrcUpd),
);
check(
  "client: 关掉后不自动查（红点随之不亮），手动「检查更新」仍可用",
  /if \(hub\.autoCheck\) loadUpdates\(false\);/.test(clientSrcUpd) && clientSrcUpd.includes('AUTO_CHECK_KEY = "dph-hub-auto-check"'),
);
check(
  "client: 窄面板里今日推荐默认收起（否则它会挤掉整个结果区 —— 用户实测反馈）",
  /const \[dailyOpen, setDailyOpen\] = react\.useState\(false\);/.test(clientSrcUpd)
    && /collapsed: !dailyOpen, toggle: \(\) => setDailyOpen/.test(clientSrcUpd),
);
check("client: 只收窄面板、页签（整页）保持展开（整页不存在遮挡问题）", (clientSrcUpd.match(/collapsed: !dailyOpen/g) || []).length === 1, String((clientSrcUpd.match(/collapsed: !dailyOpen/g) || []).length) + " 处");
check("client: 收起态仍写清「今天是谁」，并可展开/收起", clientSrcUpd.includes('"daily.expand":') && clientSrcUpd.includes('"daily.collapse":') && /t\(opts\.collapsed \? "daily\.expand" : "daily\.collapse"\)/.test(clientSrcUpd));
check("client: 「恢复默认」把自动检查一并复位（它是偏好，不是「看过了」）", /localStorage\.removeItem\(AUTO_CHECK_KEY\)/.test(clientSrcUpd) && /hidden: false, daily: true, autoCheck: true/.test(clientSrcUpd));
check("client: 「已安装」只在 changed 时才提示重启（same 无需重启）", /needsRestart = outcome === "changed" && job\.phase === "okLocal"/.test(clientSrcUpd));
check(
  "host: 装完由 host 亲自读磁盘比对版本（changed = 装前 !== 装后）",
  (() => {
    const hostSrc = fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8");
    return /installJob\.after = installedVersionOf\(installJob\.pkg\)/.test(hostSrc)
      && /installJob\.outcome = installJob\.before === null && installJob\.after === null/.test(hostSrc)
      && /outcome: installJob\.outcome/.test(hostSrc);
  })(),
);
check(
  "stripVersion: @latest / @版本 后缀被剥掉（scoped 包取最后一个 @）",
  host.stripVersion("dsh-context@latest") === "dsh-context"
    && host.stripVersion("@laoyuehanni/dsh-x@0.4.7") === "@laoyuehanni/dsh-x"
    && host.stripVersion("@scope/name") === "@scope/name"
    && host.stripVersion("dsh-mnemon") === "dsh-mnemon",
  host.stripVersion("@laoyuehanni/dsh-x@0.4.7"),
);
check("client: 批量把「报成功但没变」与失败分开计数", /result\.changed === false/.test(clientSrcUpd) && clientSrcUpd.includes('t("updates.batchNoop")'));
check("client: 偶发失败**重试一次**（且只一次，不是循环）", /if \(!done\.ok && done\.why === "cli_exit"\) \{/.test(clientSrcUpd) && (clientSrcUpd.match(/const again = await postJson\(LOCAL_INSTALL/g) || []).length === 1);
check("client: 重试单独埋点（能看出有多少次是第一把失败的）", clientSrcUpd.includes('why: "retry"'));
check("client: 目录卡片标出「已安装 vX」（用户不会对着装好的插件反复点安装）", clientSrcUpd.includes('t("card.installed")'));
check(
  "client: 已装过的卡片按钮不说「安装」而说「重新安装」（按钮才是用户看的那一处）",
  clientSrcUpd.includes('t("install.reinstall")') && clientSrcUpd.includes('t("install.reinstallConfirm")')
    && /idleLabel = upgrading \? t\("updates\.upgrade"\) : item\.installed \? t\("install\.reinstall"\)/.test(clientSrcUpd),
);
check("host: 目录下发时补 installed 字段（不进缓存，装完立刻可见）", /function installedOf\(item, map\)/.test(fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8")));

globalThis.fetch = realFetch;

/* -------------------------------------------------------------- client half */
let spec = null;
globalThis.window = { __ModuleLoader__: { load: (value) => { spec = value; } } };
globalThis.localStorage = {
  store: new Map(),
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; },
  setItem(key, value) { this.store.set(key, String(value)); },
  removeItem(key) { this.store.delete(key); },
};

/* 客户端埋点要**真跑一遍**才算验证过 —— 装一个能捕获并应答的 fetch。
   此前 client 段没有 mock，apply() 里的埋点打到不存在的相对 URL 上被静默吞掉，
   等于这段代码从来没被真正执行过。 */
const hubCalls = [];
let postinstallReply = { ok: true, restarted: true, bundled: true, dep: true };
globalThis.fetch = async (url, options) => {
  const target = String(url);
  hubCalls.push({ url: target, options });
  if (target.includes("/api/dpharness/postinstall")) {
    return { ok: true, status: 200, json: async () => postinstallReply };
  }
  return { ok: true, status: 200, json: async () => ({ ok: true }) };
};
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));
const hubEvents = () =>
  hubCalls.filter((c) => c.url.includes("/api/dpharness/event")).map((c) => JSON.parse(c.options.body));

new Function(fs.readFileSync(new URL("./lib/client.js", import.meta.url), "utf8"))();
check("client: 模块被注册", spec !== null && spec.id === "dsh-dpharness", spec && spec.id);

const client = spec.factory((id) => {
  if (id === "react") return req("react");
  throw new Error("unexpected require: " + id);
});
check("client: 导出 apply/inject/NS", typeof client.apply === "function" && client.NS === "dpharness");

const registered = {};
const clientCtx = {
  effect: (fn) => fn(),
  locale: { register: () => ({ dispose() {} }), bind: () => (key) => key },
  slots: {
    inject: (name, fn) => fn(),
    register: (options, view) => { registered[options.name] = { options, view }; return { dispose() {} }; },
  },
};
/* 留一张「上次安装成功」的凭据，验证加载时会不会去取回执 */
localStorage.setItem("dph-hub-pending", JSON.stringify({ pkg: "dsh-better-sidebar", via: "local", at: 1 }));
client.apply(clientCtx);
await tick();
const slotNames = Object.keys(registered).sort();
/* v0.5.0：入口由 3 个变 5 个 —— 新增的两个是**设置槽位**。
   它们不是"又一个入口"，而是回答「浮窗被关掉之后从哪儿再打开」的那句话。 */
check("client: 注册五个入口", slotNames.length === 5, slotNames.join(", "));
check("client: 含页签", !!registered["conversation.view"]);
check("client: 含左下入口", !!registered["sidebar.footer.action"]);
check("client: 含全站浮窗", !!registered["shell.overlay"]);
check("client: 含「设置 → 通用」的一行（浮窗开关）", !!registered["settings.general.item"]);
check("client: 含「设置 → 插件」的页签（完整设置页）", !!registered["settings.plugins.tab"]);

/* --- v0.4.2：加载心跳 + 安装后回执（跑的是真实代码路径，不是源码匹配） --- */
const firstEvents = hubEvents();
check("client: 加载即上报 hello", firstEvents.some((e) => e.detail.action === "hello"), JSON.stringify(firstEvents.map((e) => e.detail.action)));
const postCallIndex = hubCalls.findIndex((c) => c.url.includes("/api/dpharness/postinstall"));
check("client: 有 pending 时查回执（带上次的包名/路径/时间）", postCallIndex >= 0 && /pkg=dsh-better-sidebar/.test(hubCalls[postCallIndex].url) && /via=local/.test(hubCalls[postCallIndex].url) && /at=1/.test(hubCalls[postCallIndex].url), hubCalls[postCallIndex] && hubCalls[postCallIndex].url);
const postEvent = firstEvents.find((e) => e.detail.action === "post_install");
check("client: 回执带上 host 给出的判定", postEvent && postEvent.detail.restarted === true && postEvent.detail.bundled === true && postEvent.detail.via === "local", JSON.stringify(postEvent && postEvent.detail));
check("client: 回执取走后清掉 pending", localStorage.getItem("dph-hub-pending") === null);

/* host 无法判定时（null）必须省略字段 —— 降级成 false 会把「没查到」
   统计成一个具体的否定结论，整条漏斗的方向就反了。 */
localStorage.setItem("dph-hub-pending", JSON.stringify({ pkg: "some-plugin", via: "market", at: 1 }));
postinstallReply = { ok: true, restarted: null, bundled: null, dep: null };
hubCalls.length = 0;
client.apply(clientCtx);
await tick();
const unknownEvent = hubEvents().find((e) => e.detail.action === "post_install");
check(
  "client: 无法判定 → 不写字段（未知≠否）",
  !!unknownEvent && !("restarted" in unknownEvent.detail) && !("bundled" in unknownEvent.detail) && unknownEvent.detail.via === "market",
  JSON.stringify(unknownEvent && unknownEvent.detail),
);

/* 第三次加载：pending 已被上一次取走，不该再查 —— 否则每次开页面都发一条，
   回执会从「一次性事件」退化成「每次加载都刷」的心跳。 */
hubCalls.length = 0;
client.apply(clientCtx);
await tick();
check("client: pending 已消费 → 不再查回执", hubCalls.filter((c) => c.url.includes("/postinstall")).length === 0, JSON.stringify(hubCalls.map((c) => c.url)));
check("client: 回执只发一次（每次加载仍会发 hello）", hubEvents().filter((e) => e.detail.action === "post_install").length === 0 && hubEvents().some((e) => e.detail.action === "hello"));

const react = req("react");
const { renderToStaticMarkup } = req("react-dom/server");

const tabHtml = renderToStaticMarkup(react.createElement(registered["conversation.view"].view, {}));
check("tab: SSR 渲染", tabHtml.includes("dph_root"), tabHtml.slice(0, 80));
/* v0.4.4：会话端页签加入「分类精选」—— 判据是**两个视图的文案 key 都出现**，
   而不是只看有没有 dph_seg（排序/数量控件也在用同一套 class）。 */
check(
  "tab: 顶部有「严选推荐 / 分类精选」切换",
  tabHtml.includes("best.recommend") && tabHtml.includes("best.picks"),
  `recommend=${tabHtml.includes("best.recommend")} picks=${tabHtml.includes("best.picks")}`,
);
check("tab: 视图切换默认停在「严选推荐」", /dph_segBtnOn[^>]*>best\.recommend</.test(tabHtml), (tabHtml.match(/<button class="dph_segBtn[^>]*>[^<]*</g) || []).slice(0, 3).join(" | "));
check("tab: 底部有「显示右下角浮窗」开关（浮窗被隐藏后的第二个恢复入口）", tabHtml.includes("action.showFloat"));
/* 页签必须订阅共享 store：否则在胶囊/面板里关闭浮窗后，这里的勾选态不跟着变。
   （clientSource 在下面才定义，这里单独读一次源码。） */
const srcForTab = fs.readFileSync(new URL("./lib/client.js", import.meta.url), "utf8");
check("tab: 订阅了共享 store（勾选态不会与其它入口错位）", /function CatalogView\(\)\s*\{[\s\S]{0,240}?useHub\(\)/.test(srcForTab));

const footHtml = renderToStaticMarkup(react.createElement(registered["sidebar.footer.action"].view, { wide: true }));
check("footer: wide 时含文字标签", footHtml.includes("dph_lbLabel"), footHtml.slice(0, 90));
const footRail = renderToStaticMarkup(react.createElement(registered["sidebar.footer.action"].view, { wide: false }));
check("footer: 收起时只有单字标记", footRail.includes("dph_lbOff") && !footRail.includes("dph_lbLabel"));

const overlayHtml = renderToStaticMarkup(react.createElement(registered["shell.overlay"].view, {}));
check("overlay: 默认收起为胶囊", overlayHtml.includes("dph_pill"), overlayHtml.slice(0, 90));

const clientSource = fs.readFileSync(new URL("./lib/client.js", import.meta.url), "utf8");
check("client: 安装优先走 dshmarket 路由", clientSource.includes('"/dsh-market/install"') && clientSource.includes('"/dsh-market/status"'));
check("client: 降级走自有 host 路由", clientSource.includes('"/api/dpharness/install"'));
/* 2026-09-30 契约变更：只有 409（有 agent 在跑）不降级；其余一切「市场通道给不出确定答复」
   的状态都必须降级 —— dshmarket 缺失/被 dsh 判定不兼容而整包跳过时，/dsh-market/* 会整体
   缺席，POST 落到 dsh 静态前端的 fallback（非 GET/HEAD ⇒ 空体 405）。把它当硬失败会让
   一键安装在市场不可用时直接报错，而旁边明明有可用的本地通道。 */
check("client: 只有 409 不降级（busy 仍是硬失败）", /market\.status === 409\) \{/.test(clientSource) && /why: "busy"/.test(clientSource));
check("client: 旧的「其他状态码一律硬失败」已移除（不再有 market_http）", !/"market_http"/.test(clientSource));
check("client: 通道不可用要留痕（market_unavailable + http_<status>）", /action: "market_unavailable"/.test(clientSource) && /"http_" \+ market\.status/.test(clientSource));
check("client: 复制与安装分别埋点（升级另设事件名，不混进安装漏斗）", clientSource.includes('"copy_install"') && clientSource.includes('start: "install"') && clientSource.includes('start: "upgrade"'));

/* 套装视图（v0.5.0）：面板与页签两处必须同口径；命令一律用 host 给的，不在客户端拼。
   （视图本体只在切到该 mode 时渲染，SSR 起手停在 search，所以这里钉的是接线与口径。） */
check(
  "client: 套装视图在两处都注册（浮窗 + 页签），标签同源",
  (clientSource.match(/\{ value: "sets", label: t\("sets\.tab"\) \}/g) || []).length === 2,
  String((clientSource.match(/\{ value: "sets", label: t\("sets\.tab"\) \}/g) || []).length) + " 处",
);
check(
  "client: 套装只在切到它时才取数（与 best 同一条纪律：收成胶囊/别的视图都不请求）",
  /useSets\(t, state\.open && mode === "sets"\)/.test(clientSource) && /useSets\(t, mode === "sets"\)/.test(clientSource),
);
check(
  "client: 客户端**不拼任何安装命令**（一律用 host 给的 installBlock / item.cmd）",
  clientSource.includes("set.installBlock") && !/dsh plugin --profile/.test(clientSource),
);
check(
  "client: 套装的「打开站点/刷新」都跟着视图走（别让刷新按钮刷错东西）",
  /isSets \? SITE \+ "\/sets"/.test(clientSource) && /isSets \? sets\.refresh/.test(clientSource),
);
check(
  "client: 套装内必要性说人话（必备/增强/可选），不把 required 直接摊给用户",
  clientSource.includes('t("need." + (item.need || "enhance"))') && clientSource.includes('"need.required": "必备"'),
);

/* --- v0.5.0 「我的插件中心」：卸载 + 忽略此版本 --- */
check(
  "client: 卸载走同一条本地通道（verb=remove），破坏性操作自己两步确认",
  /verb: "remove"/.test(clientSource) && /t\("updates\.removeConfirm"\)/.test(clientSource) && /action: "remove_ask"/.test(clientSource) && /action: "remove_cancel"/.test(clientSource),
);
check(
  "client: 卸载成功也记待重启（当前进程里插件还挂着，与安装同一条横幅）",
  /if \(done\.ok && done\.changed\) \{[\s\S]{0,160}?markRestartPending/.test(clientSource),
);
check(
  "client: 自插件那一行不给卸载（卸自己 = 把管理界面卸掉）",
  /updateRow\(self, "self"/.test(clientSource) && /updateRow\(item, item\.name, "", copied, mark, true\)/.test(clientSource),
);
check(
  "client: 忽略的是**目标版本**不是布尔（出了更新的版本，提醒自己回来）",
  /IGNORE_KEY = "dph-hub-ignore"/.test(clientSource) && /version === String\(item\.latest \|\| ""\)/.test(clientSource),
);
check(
  "client: 被忽略的条目不进红点签名（否则「忽略」之后红点照常亮，等于没忽略）",
  /data\.self\.outdated === true && !isIgnored\(data\.self\)/.test(clientSource) && /item\.outdated === true && !isIgnored\(item\)/.test(clientSource),
);
check(
  "client: 一键安装整套复用批量那台机器（串行/进度/可中止/两步确认），不另写并发",
  /async function runSetInstall/.test(clientSource) && /scope: "set"/.test(clientSource) && /action: "set_install_ask"/.test(clientSource) && /stopRequested: true/.test(clientSource),
);
check(
  "client: 安装整套的两步确认会先说清「会改 profile、要重启」",
  clientSource.includes('"sets.installAllConfirm": "将逐个安装 {n} 个插件'),
);
check(
  "client: 批量文案按 kind 分开（套装在装的时候，别在更新视图里说成「升级中」）",
  /batch\.kind === "install" \? t\("sets\.installing"\) : t\("updates\.batchProgress"\)/.test(clientSource),
);
check(
  "client: 待重启横幅文案动词中性（装卸共用一条横幅，不能写死「已安装」）",
  clientSource.includes('"install.pendingBody": "{n}：重启 dsh 后生效"'),
);

/* --- v0.5.0 对比：把候选并排看关键事实（「内容评测」差异化在客户端的形态）--- */
check(
  "client: 对比上限 3 且选择集**不持久**（对比是一次性动作，不是偏好）",
  /const COMPARE_MAX = 3;/.test(clientSource) && /compare: \[\]/.test(clientSource) && !/COMPARE_KEY/.test(clientSource),
);
check(
  "client: 对比存的是**条目对象**而不是包名（搜索词一改列表就换，只存名字表格会当场变空）",
  /setHub\(\{ compare: list\.concat\(\[item\]\) \}\)/.test(clientSource),
);
check(
  "client: 少于 2 个开不了表（比一个东西没有意义），并可一键清空",
  /disabled: !enough/.test(clientSource) && clientSource.includes('"compare.needTwo"') && /compare_clear/.test(clientSource),
);
check(
  "client: 对比表只放**事实**（星标/实装验证/本机已装/分类/卖点），不放评价",
  ["compare.stars", "compare.verify", "compare.tested", "compare.installed", "compare.cat", "compare.sell"].every((key) => clientSource.includes('"' + key + '"')),
);
check(
  "client: 对比开关放在卡片最左（多选的第一列位置固定，扫一眼就知道能选）",
  /comparable \? h\("button", \{[\s\S]{0,240}?key: "cmp"/.test(clientSource) && /renderCard\((item|picked\.item), [^)]*true\)/.test(clientSource),
);
check(
  "client: 浮窗与页签都接了对比条（选择集共享，展开状态各自记）",
  (clientSource.match(/h\(CompareBar, \{ key: "cmpBar", open: comparing/g) || []).length === 2 && (clientSource.match(/const \[comparing, setComparing\]/g) || []).length === 2,
);

/* --- v0.5.0 P2：收藏待装 + 福利专区入口 --- */
check(
  "client: 收藏存的是**条目快照**（只留渲染与安装要用的字段），不是包名引用 —— 目录会变",
  /FAV_KEY = "dph-hub-fav"/.test(clientSource) && /const FAV_FIELDS = \[/.test(clientSource) && /FAV_FIELDS\.forEach/.test(clientSource),
);
check(
  "client: 收藏与对比语义相反（收藏跨会话持久、对比不持久）—— 两套状态不能混用一个 key",
  /fav: readFav\(\)/.test(clientSource) && /compare: \[\]/.test(clientSource) && !/readFav\(\)\)[^\n]*compare/.test(clientSource),
);
check(
  "client: 收藏清单落在「我的插件」里，不开第 6 个页签（浮窗 400px 一排标签挤不下）",
  /function FavSection\(props\) \{/.test(clientSource) && /h\(FavSection, \{ key: "fav"/.test(clientSource),
);
check(
  "client: 收藏的批量装复用「一键安装整套」那台机器（内部保留 slug，不与套装进度混淆）",
  /slug: "__fav__"/.test(clientSource) && /runSetInstall\(\{ slug: "__fav__"/.test(clientSource),
);
check(
  "client: 只有「有 npm 包名且本机还没装」的收藏才进批量（没 pkg 的走逐条复制命令）",
  /item\.pkg && !installed\.has\(String\(item\.pkg\)\)/.test(clientSource) && /pending\.length >= 2/.test(clientSource),
);
check(
  "client: 福利入口只做链接、不复刻清单（公开接口只有未审核的爬虫候选池，把没核过的推给用户是错的）",
  /SITE \+ "\/benefits"/.test(clientSource) && !clientSource.includes("/api/benefits"),
);
check(
  "client: 安装失败区分阶段与原因（升级走自己的失败事件名）",
  /fail: "install_failed"/.test(clientSource)
    && /fail: "upgrade_failed"/.test(clientSource)
    && /local\.status === 409 \? "busy" : "local_rejected"/.test(clientSource)
    && /via: done\.via \|\| "local"/.test(clientSource),
);
check("client: 确认框的流向单独埋点（安装与升级各自记账）", /"upgrade_ask" : "install_ask"/.test(clientSource) && /"upgrade_cancel" : "install_cancel"/.test(clientSource));
check("client: 点击重启即上报（结果靠回执证明）", clientSource.includes('action: "restart_click"') && clientSource.includes('action: "restart_failed"'));
check("client: 失败原因只发闭集枚举，不发错误原文", !/why: String\(/.test(clientSource) && !/why: done\.message/.test(clientSource));

/* --- 浮窗可拖动：位置夹取是纯函数，断言边界 --- */
check("client: 暴露 clampPos 供测试", typeof client.clampPos === "function");

/* --- 结果总数文案：纯函数单测（「搜索看起来不生效」的修复点） --- */
const fakeT = (key) => ({ "count.summary": "共 {n} 条结果", "count.partial": "已显示前 {m} 条", "count.searching": "搜索中…" }[key] || key);
const truncated = { count: 30, total: 106, plugins: new Array(30).fill({}) };
check(
  "summaryOf: 命中 106 条但只返回 30 条 → 必须说清被截断",
  client.summaryOf(truncated, fakeT) === "共 106 条结果 · 已显示前 30 条",
  client.summaryOf(truncated, fakeT),
);
check(
  "summaryOf: 全部返回时不加多余尾巴",
  client.summaryOf({ count: 2, total: 2, plugins: [{}, {}] }, fakeT) === "共 2 条结果",
  client.summaryOf({ count: 2, total: 2, plugins: [{}, {}] }, fakeT),
);
check(
  "summaryOf: 旧 host 没给 total 时退回返回条数（文案仍成立）",
  client.summaryOf({ count: 30, plugins: new Array(30).fill({}) }, fakeT) === "共 30 条结果",
  client.summaryOf({ count: 30, plugins: new Array(30).fill({}) }, fakeT),
);
check("summaryOf: 空数据不抛错", client.summaryOf(null, fakeT) === "");

/* --- 副标题：搜索时必须给出「点到了」的证据 --- */
check(
  "countSub: 重新搜索时标题位让给「搜索中…」（列表保留旧结果显示不动，没有这句就没有反馈）",
  client.countSub(truncated, fakeT, true, "只推装得上的") === "搜索中…",
  client.countSub(truncated, fakeT, true, "只推装得上的"),
);
check(
  "countSub: 不搜索时拼上后缀",
  client.countSub(truncated, fakeT, false, "只推装得上的") === "共 106 条结果 · 已显示前 30 条 · 只推装得上的",
  client.countSub(truncated, fakeT, false, "只推装得上的"),
);
check(
  "countSub: 尚无数据时只给后缀（首次加载下方已有 loading 提示，不重复）",
  client.countSub(null, fakeT, true, "只推装得上的") === "只推装得上的",
);
check("countSub: 浮窗入口无后缀时为空串", client.countSub(null, fakeT, true) === "");
const VIEW = { w: 1200, h: 800 };
const PILL = { w: 150, h: 38 };
check("clampPos 左上越界 → 夹到边距", JSON.stringify(client.clampPos({ right: -100, bottom: -100 }, PILL, VIEW)) === JSON.stringify({ right: 8, bottom: 8 }), JSON.stringify(client.clampPos({ right: -100, bottom: -100 }, PILL, VIEW)));
check("clampPos 右下越界 → 夹到视口内", JSON.stringify(client.clampPos({ right: 9999, bottom: 9999 }, PILL, VIEW)) === JSON.stringify({ right: 1042, bottom: 754 }), JSON.stringify(client.clampPos({ right: 9999, bottom: 9999 }, PILL, VIEW)));
check("clampPos 合法值原样保留", JSON.stringify(client.clampPos({ right: 300, bottom: 200 }, PILL, VIEW)) === JSON.stringify({ right: 300, bottom: 200 }));
check("clampPos 脏输入不抛错", JSON.stringify(client.clampPos({ right: "x", bottom: null }, PILL, VIEW)) === JSON.stringify({ right: 8, bottom: 8 }), JSON.stringify(client.clampPos({ right: "x", bottom: null }, PILL, VIEW)));
check("client: 胶囊与面板标题都可拖", /dph_pill[\s\S]{0,400}onPointerDown/.test(clientSource) && /dph_panelTitle dph_drag/.test(clientSource));
check("client: 拖动位移阈值防误触", /DRAG_THRESHOLD = 5/.test(clientSource) && /skipClickRef/.test(clientSource));
check("client: 位置写入 localStorage", /POS_KEY = "dph-hub-pos"/.test(clientSource) && /storePos\(/.test(clientSource));

/* --- v0.4.4：浮窗可被用户手动关闭 ---
   隐藏状态是在**模块加载时**从 localStorage 读入的，所以必须重新加载一次模块
   才能验证真实路径（源码匹配只能证明"写了这段代码"，证明不了"确实这么渲染"）。 */
function loadFreshClient() {
  const previousWindow = globalThis.window;
  let captured = null;
  globalThis.window = { __ModuleLoader__: { load: (value) => { captured = value; } } };
  new Function(fs.readFileSync(new URL("./lib/client.js", import.meta.url), "utf8"))();
  globalThis.window = previousWindow;
  return captured.factory((id) => {
    if (id === "react") return react;
    throw new Error("unexpected require: " + id);
  });
}
function slotsOf(fresh) {
  const map = {};
  fresh.apply({
    effect: (fn) => fn(),
    locale: { register: () => ({ dispose() {} }), bind: () => (key) => key },
    slots: { inject: (name, fn) => fn(), register: (options, view) => { map[options.name] = view; return { dispose() {} }; } },
  });
  return map;
}

localStorage.removeItem("dph-hub-hidden");
const overlayShown = renderToStaticMarkup(react.createElement(slotsOf(loadFreshClient())["shell.overlay"], {}));
check("overlay: 未关闭时渲染胶囊", overlayShown.includes("dph_pill"));
check(
  "overlay: 胶囊带独立关闭按钮（兄弟节点 —— 嵌进 button 里是非法 HTML，还会触发拖动）",
  overlayShown.includes("dph_pillClose") && overlayShown.indexOf("dph_pillClose") > overlayShown.indexOf('class="dph_pill"'),
  overlayShown.slice(0, 170),
);

localStorage.setItem("dph-hub-hidden", "1");
const overlayHidden = renderToStaticMarkup(react.createElement(slotsOf(loadFreshClient())["shell.overlay"], {}));
check("overlay: 手动关闭后整块浮窗不渲染", overlayHidden === "", JSON.stringify(overlayHidden.slice(0, 60)));
/* 2026-10-13：按钮提示随状态说准 —— 关掉了就说"怎么恢复"，可见时才说"展开/收起"。
   不能点了没反应还写着「显示浮窗」。走真实渲染，不是源码匹配。 */
const footClosedTip = renderToStaticMarkup(react.createElement(slotsOf(loadFreshClient())["sidebar.footer.action"], {}));
check("footer: 浮窗关闭后提示改说「怎么恢复」（不再写着「显示浮窗」—— 点了没反应不能撒谎）", footClosedTip.includes('title="action.closedHint"'), footClosedTip.slice(0, 140));
localStorage.removeItem("dph-hub-hidden");
const footOpenTip = renderToStaticMarkup(react.createElement(slotsOf(loadFreshClient())["sidebar.footer.action"], {}));
check("footer: 浮窗可见（面板收起）时提示「展开面板」", footOpenTip.includes('title="action.expand"'), footOpenTip.slice(0, 140));

check("overlay: 关闭状态落盘（下次进来仍然是关的）", /HIDE_KEY = "dph-hub-hidden"/.test(clientSource) && /storeHidden\(/.test(clientSource));
check(
  "client: 浮窗关闭后侧边栏按钮**两步确认**才恢复（用户反馈：胶囊关闭了就别默认打开；而纯无反应又被当成没生效）",
  /if \(state\.hidden\) \{[\s\S]{0,200}if \(!armed\) \{[\s\S]{0,120}setArmed\(true\);[\s\S]{0,120}return;/.test(clientSource),
);
check(
  "client: 恢复只发生在第二步（上劲后 setArmed(false) + setFloatVisible(true)，只恢复显示、不顺手展开面板）",
  /setArmed\(false\);\s*\n\s*setFloatVisible\(true, "footer"\);/.test(clientSource) && !/setFloatVisible\(true, "footer"\);\s*\n\s*setHub\(\{ open: true/.test(clientSource),
);
check(
  "client: 上劲态有可见反馈且自动解除（描边类 + 脉冲动画 + 5 秒超时）—— 不能是 Silent 的无反馈",
  /dph_lbArmed/.test(clientSource) && /@keyframes dphArmPulse/.test(clientSource) && /setTimeout\(\(\) => setArmed\(false\), 5000\)/.test(clientSource),
);
check(
  "client: 侧边栏按钮只在浮窗**可见**时开关面板（隐藏态走上劲/恢复，可见态 toggle 面板，不碰显隐）",
  /const next = !state\.open;/.test(clientSource) && /setHub\(\{ open: next \}\)/.test(clientSource),
);
check("client: 主动展开面板的入口只有两个用户点击：右下角胶囊 + 侧边栏按钮（后者仅浮窗可见时）", (clientSource.match(/setHub\(\{ open: true \}\)/g) || []).length === 1 && /setHub\(\{ open: next \}\)/.test(clientSource), String((clientSource.match(/setHub\(\{ open: true \}\)/g) || []).length) + " 处");
check(
  "client: FooterEntry 里 useUpdates() 只调一次（它是 hook：重复调用会双份触发更新检查，而 SSR 渲染查不出来）",
  (() => {
    const seg = clientSource.slice(clientSource.indexOf("function FooterEntry"), clientSource.indexOf("function OverlayEntry"));
    return (seg.match(/useUpdates\(\)/g) || []).length === 1;
  })(),
);
check(
  "client: 按钮提示随状态说准（关掉了说怎么恢复/再点一次，可见时说展开/收起 —— 不能点了没反应还写着「显示浮窗」）",
  clientSource.includes('t("action.closedHint")') && clientSource.includes('t("action.armRestore")') && clientSource.includes('t("action.expand")') && !/t\(state\.hidden \? "action\.show"/.test(clientSource),
);
check(
  "client: 隐藏提示与设置提示说准恢复路径（连点两下侧边栏/页签勾选），不再写着「侧边栏永远可以再次打开」",
  /连点两下/.test(clientSource) && !/可再次打开/.test(clientSource) && !/永远可以再次打开/.test(clientSource) && clientSource.includes('"action.closedHint"'),
);
check(
  "client: 「分类精选」大类默认全部收起（用户反馈：默认折叠，别第一个就展开挡路）",
  !/open: index === 0/.test(clientSource) && /"dph_bestCat", key: cat\.key \|\| String\(index\), open: false/.test(clientSource),
);
check("client: 面板底部也给「隐藏浮窗」出口", clientSource.includes('hideHub("panel")'));
check("client: 关闭动作单独埋点（否则不知道这功能有没有人用）", clientSource.includes('action: "hide"') && clientSource.includes('action: "show"'));
localStorage.removeItem("dph-hub-hidden");

/* --- v0.5.0 每日推荐：选取必须与「自然日」一一对应且当天稳定 ---
   判据不是"能选出一条"，而是三条最容易写错的不变式：
     ① 同一天 → 同一条（浮窗、页签、卡片三处调用必须收敛）；
     ② 上游分组顺序抖动 → 结果不变（不先排序，站点重算榜单当天就会换人）；
     ③ 跨天 → 会换（否则「每日」是假的）。 */
const fixedBest = {
  month: "2026-10",
  total: 3,
  categories: [
    { key: "a", label: "浏览器", subs: [{ key: "s1", label: "侧边栏", items: [
      { fullName: "o/one", name: "one" },
      { fullName: "o/two", name: "two" },
    ] }] },
    { key: "b", label: "工具", subs: [{ key: "s2", label: "统计", items: [{ fullName: "o/three", name: "three" }] }] },
  ],
};
check(
  "dailyKey: 按 UTC+8 切日（23:59 仍属前一天）",
  client.dailyKey(Date.UTC(2026, 9, 11, 15, 59)) === "2026-10-11" && client.dailyKey(Date.UTC(2026, 9, 11, 16, 0)) === "2026-10-12",
  client.dailyKey(Date.UTC(2026, 9, 11, 15, 59)) + " | " + client.dailyKey(Date.UTC(2026, 9, 11, 16, 0)),
);
check("dailyKey: 月/日补零", client.dailyKey(Date.UTC(2026, 0, 5, 4, 0)) === "2026-01-05", client.dailyKey(Date.UTC(2026, 0, 5, 4, 0)));
const day1 = client.pickDaily(fixedBest, "2026-10-12");
const day1Bis = client.pickDaily(fixedBest, "2026-10-12");
check("pickDaily: 同一自然日恒定同一条", !!day1 && !!day1Bis && day1.key === day1Bis.key, day1 && day1.key);
check("pickDaily: 带出所属大类与小类（卡片要显示它）", !!day1 && !!day1.cat && !!day1.sub, day1 && day1.cat + "/" + day1.sub);
check(
  "pickDaily: 上游分组顺序打乱后结果不变（否则站点重算榜单当天就会换人）",
  (() => {
    const shuffled = { ...fixedBest, categories: [fixedBest.categories[1], fixedBest.categories[0]] };
    const again = client.pickDaily(shuffled, "2026-10-12");
    return !!again && !!day1 && again.key === day1.key;
  })(),
  day1 && day1.key,
);
const weekKeys = ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"].map((d) => (client.pickDaily(fixedBest, d) || {}).key);
check("pickDaily: 跨天会换（否则「每日」是假的）", new Set(weekKeys).size > 1, weekKeys.join(" > "));
check("pickDaily: 空数据/空分组 → null（不抛错）", client.pickDaily(null, "2026-10-12") === null && client.pickDaily({ categories: [] }, "2026-10-12") === null);
check(
  "flattenBest: 跳过缺唯一键的脏条目",
  client.flattenBest({ categories: [{ label: "x", subs: [{ label: "y", items: [{ name: "no-key" }, { fullName: "o/ok" }] }] }] }).length === 1,
);
check("client: 选取是确定性的（无随机数）", !/Math\.random/.test(clientSource) && /FNV-1a/.test(clientSource));
check("client: 时区口径写死 UTC+8（本地时区会让同一天不同地区看到不同一条）", /DAILY_TZ_MS = 8 \* 60 \* 60 \* 1000/.test(clientSource));
check(
  "client: 没有任何自动展开浮窗的路径（open:true 只剩胶囊那一处，且来自用户点击）",
  (clientSource.match(/open: true/g) || []).length === 1 && /setHub\(\{ open: true \}\);\n\t+track\("plugin_hub", \{ action: "open", scope: "overlay" \}\)/.test(clientSource),
  String((clientSource.match(/open: true/g) || []).length) + " 处",
);
check(
  "client: 设置挂在 dsh 原生槽位上（不自造设置页）",
  /ctx\.slots\.inject\(\s*"settings\.general\.item"/.test(clientSource) && /ctx\.slots\.inject\(\s*"settings\.plugins\.tab"/.test(clientSource),
);
check("client: 每日推荐开关落盘（下次进来仍然是关的）", /DAILY_KEY = "dph-hub-daily"/.test(clientSource) && /storeDaily\(/.test(clientSource));

/* 设置两处的渲染：一个行（通用）一个页（插件页签） */
const setRowHtml = renderToStaticMarkup(react.createElement(registered["settings.general.item"].view, {}));
check("settings: 通用行含浮窗开关与说明", setRowHtml.includes("settings.float") && setRowHtml.includes("settings.floatHint"), setRowHtml.slice(0, 110));
const setPanelHtml = renderToStaticMarkup(react.createElement(registered["settings.plugins.tab"].view, {}));
check(
  "settings: 插件页签含三个开关（浮窗 / 每日推荐 / 匿名统计）",
  setPanelHtml.includes("settings.float") && setPanelHtml.includes("settings.daily") && setPanelHtml.includes("settings.telemetry"),
  setPanelHtml.slice(0, 110),
);
check("settings: 插件页签带「恢复默认」", setPanelHtml.includes("settings.reset") && setPanelHtml.includes("settings.about"));
check(
  "settings: 两处开关同源（都订阅共享 store，改一处另一处立刻同步）",
  /function SettingsFloatRow\(\)\s*\{[\s\S]{0,300}?useHub\(\)/.test(clientSource) && /function SettingsPanel\(\)\s*\{[\s\S]{0,200}?useHub\(\)/.test(clientSource),
);

/* --- v0.5.0：更新日志（客户端侧） --- */
check("settings: 设置页含「更新日志」一节（SSR 首屏是加载态）", setPanelHtml.includes("changelog.title") && setPanelHtml.includes("changelog.loading"), setPanelHtml.slice(0, 90));
check("client: 更新日志读本机 host 的只读接口", clientSource.includes('"/api/dpharness/changelog"'));
check(
  "client: 更新日志只在设置页与「更新」视图两处使用（目录/榜单不顺手拉）",
  (clientSource.match(/useChangelog\(\)/g) || []).length === 3,
  "useChangelog 出现次数=" + String((clientSource.match(/useChangelog\(\)/g) || []).length) + "（1 处定义 + 2 处调用）",
);
check(
  "client: 「更新」视图里直接能看到本插件自己的更新日志（不必再跑一趟设置页）",
  /changelogBlock\(cl\.state\.data \? cl\.state\.data\.entries : null, "upd:"\)/.test(clientSource),
);
check("client: 两处日志共用同一份渲染（版本条目只有一种实现）", (clientSource.match(/changelogList\(/g) || []).length === 3, String((clientSource.match(/changelogList\(/g) || []).length) + " 处引用");

/* --- v0.5.0：「宿主比客户端旧」必须显式说出来 ---
   desktop profile 里本插件是指向工作区的符号链接：客户端刷新即生效，宿主字段要重启才更新。
   今天已经因为这件事误导过用户两次（一次是 JSON 解析错误，一次是「更新」页缺中文名）。 */
const hostRev = /export const SHAPE_REV = (\d+);/.exec(fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8"));
const clientRev = /const HOST_SHAPE_REV = (\d+);/.exec(clientSource);
check("形状版本号两侧都有且**相等**（两个半边同包不同运行时，只能各写一份，靠这条锁住）", !!hostRev && !!clientRev && hostRev[1] === clientRev[1], `host=${hostRev && hostRev[1]} client=${clientRev && clientRev[1]}`);
check("形状版本号：宿主负载里带上了 rev", /rev: SHAPE_REV/.test(fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8")));
check("client: 只判「宿主更旧」，宿主更新时不打扰用户", /body\.rev < HOST_SHAPE_REV/.test(clientSource) && !/body\.rev !== HOST_SHAPE_REV/.test(clientSource));
check("client: 宿主更旧时给出可操作的一句话（不是让用户以为功能坏了）", clientSource.includes('t("host.skew")') && clientSource.includes('restartButton("skew")'));
check("client: 只有 outdated === true 才谈升级（未知/已最新不摊命令）", /data\.outdated === true && upgrade/.test(clientSource));
check("client: 「已是最新」与「查不到」是两句不同的话", clientSource.includes('t("changelog.upToDate")') && /data\.outdated === false/.test(clientSource));
check("client: 复制升级命令单独埋点", clientSource.includes('action: "upgrade_copy"'));
check("client: 只在确实有新版本时上报（把「已最新」也报进来会撑大分母）", /if \(body\.outdated === true\) \{/.test(clientSource));

/* --- v0.5.0：更新检查 + 红点 --- */
check("tab: 视图切换里有「我的插件」（原「更新」）", tabHtml.includes("updates.tab"), tabHtml.includes("updates.tab") ? "有" : "无");
check(
  "tab: 「更新」已改名「我的插件」（它现在管的是整屏插件，不只是更新）",
  clientSource.includes('"updates.tab": "我的插件"') && clientSource.includes('"updates.title": "我的插件"'),
);
check("client: 更新检查读本机 host 的只读接口", clientSource.includes('"/api/dpharness/updates"'));
check("client: 更新结果是模块级共享 store（三处红点 + 视图共用一次请求）", /const updates = \{ loading/.test(clientSource) && /function useUpdates\(\)/.test(clientSource));
check(
  "client: 红点挂在预期的地方（侧边栏 1 + 胶囊 1 + 设置页「更新日志」加载态/就绪态各 1 = 4）",
  (clientSource.match(/pending\.fresh \? updateDot\(\) : null/g) || []).length === 4,
  "出现 " + String((clientSource.match(/pending\.fresh \? updateDot\(\) : null/g) || []).length) + " 次",
);
check("client: 侧边栏按钮负责首次触发（它始终挂着，红点因此不必先打开任何页面）", /function FooterEntry\(props\)[\s\S]{0,500}?useUpdates\(\)/.test(clientSource));
check("client: 红点带视觉隐藏文案（只有颜色，对读屏用户等于不存在）", clientSource.includes("dph_sr") && clientSource.includes("function updateDot()"));
check("client: 看过即消 —— 打开「更新」视图时记下已确认的版本", /if \(data\) ackUpdates\(scope\)/.test(clientSource));
check("client: 已确认版本落盘（下次进来不重复打扰）", /ACK_KEY = "dph-hub-updates-acked"/.test(clientSource) && /storeAcked\(/.test(clientSource));
check("client: 红点判据是「签名变化」而不是「存在更新」", /function updateSignature\(data\)/.test(clientSource) && /signature !== updates\.acked/.test(clientSource));
check("client: 检查失败要显式报错（一份空清单会被界面读成「全都已是最新」）", clientSource.includes('t("updates.failed")'));
check("client: 「恢复默认」不清红点确认标记（否则刚关掉的红点立刻又亮）", /updates\.acked/.test(clientSource) && !/function resetPrefs\(scope\) \{[\s\S]{0,600}?ACK_KEY/.test(clientSource));
check("client: 本插件的升级命令只出现一次（不重复列出自己）", /updates\.self/.test(clientSource));

/* --- v0.5.0：默认视图顶部要有「今日推荐」，关掉后必须真的消失 ---
   与浮窗隐藏同一条思路：状态是**模块加载时**从 localStorage 读入的，
   所以必须重新加载一次模块才能验证真实路径。 */
check("tab: 视图切换多了「每日推荐」", tabHtml.includes("daily.tab"), tabHtml.includes("daily.tab") ? "有" : "无");
check(
  "tab: 默认视图顶部有「今日推荐」卡片（当天唯一一条，不能只在专用视图才出现）",
  tabHtml.includes("daily.title") && tabHtml.includes("daily.loading"),
  `title=${tabHtml.includes("daily.title")} loading=${tabHtml.includes("daily.loading")}`,
);
localStorage.setItem("dph-hub-daily", "0");
const tabDailyOff = renderToStaticMarkup(react.createElement(slotsOf(loadFreshClient())["conversation.view"], {}));
check(
  "tab: 关掉每日推荐 → 顶部卡片消失、视图切换仍在",
  !tabDailyOff.includes("daily.title") && tabDailyOff.includes("daily.tab"),
  `title=${tabDailyOff.includes("daily.title")} tab=${tabDailyOff.includes("daily.tab")}`,
);
localStorage.removeItem("dph-hub-daily");

/* --- v0.5.0：本机路由的响应必须容忍「正文不是 JSON」 ---
   实测事故（2026-10-12，用户截图）：桌面版 host 进程比客户端代码旧 ——
   客户端刷新页面即生效，而 host 的路由要**重启 dsh** 才注册。窗口期里请求落到
   dsh 静态前端的兜底上，返回纯文本（浏览器里是 not found、无凭据时 unauthorized），
   于是界面上出现「Unexpected token 'o', "not found" is not valid JSON」，
   真实原因（进程没重启）被彻底掩盖。 */
const htmlFetch = globalThis.fetch;
globalThis.fetch = async () => ({ ok: false, status: 401, text: async () => "unauthorized" });
let staleErr = null;
try {
  await client.readHostJson("/api/dpharness/updates");
} catch (error) {
  staleErr = error;
}
check(
  "readHostJson: 非 JSON 正文 → 标为 stale，且绝不把 JSON 解析错误抛给用户",
  !!staleErr && staleErr.stale === true && !/JSON/i.test(staleErr.message),
  staleErr && staleErr.message,
);
globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ ok: true, value: 1 }) });
const okBody = await client.readHostJson("/api/dpharness/updates");
check("readHostJson: 正常 JSON 原样返回", okBody.value === 1, JSON.stringify(okBody));
globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ ok: false, error: "boom" }) });
let bizErr = null;
try {
  await client.readHostJson("/api/dpharness/updates");
} catch (error) {
  bizErr = error;
}
check("readHostJson: 业务错误保留服务端给的 error 文案，且不标成 stale", !!bizErr && bizErr.message === "boom" && bizErr.stale !== true, bizErr && bizErr.message);
globalThis.fetch = htmlFetch;
check("client: 四个取数 hook 共用同一个解析器（裸 response.json().then 已全部移除）", !/response\.json\(\)\.then/.test(clientSource));
check(
  "client: stale 时给「重启 dsh」出口，且要两步确认（重启会掐断当前会话）",
  clientSource.includes('restartButton("stale")')
    && clientSource.includes('t("updates.restartConfirm")')
    && clientSource.includes("if (!restartAsk)")
    && clientSource.includes('action: "restart_ask", scope: key'),
);

/* --- v0.5.0：一键升级 / 批量升级 --- */
check(
  "client: 一键升级复用安装通道，且目标用**具体版本号**（同一个 InstallRow，只换 kind）",
  /h\(InstallRow, \{ key: "do", item: \{ pkg: String\(item\.name\) \+ "@" \+ String\(item\.latest\), current: item\.current \}, kind: "upgrade" \}\)/.test(clientSource),
);
check(
  "client: 批量**串行**执行（宿主同一时刻只允许一个安装任务，并发只会拿到 409）",
  /await runInstall\(\{ pkg: items\[index\]\.pkg[^}]*\}, t, "upgrade"\)/.test(clientSource) && /for \(let index = 0; index < items\.length/.test(clientSource),
);
check(
  "client: 批量升级要**两步确认**（一次会改十几个包，一键直落对真实用户太危险）",
  clientSrcUpd.includes('t("updates.upgradeAllConfirm")') && /if \(!batchAsk\) \{[\s\S]{0,120}?setBatchAsk\(true\)/.test(clientSrcUpd),
);
check("client: 批量可中止，中止后不再往下跑", /if \(hub\.batch && hub\.batch\.stopRequested\) break;/.test(clientSource) && clientSource.includes('action: "upgrade_all_stop"'));
check("client: 批量完成后给重启出口（本地通道要重启才生效）", clientSource.includes('restartButton("batch")') && clientSource.includes('t("updates.restartNeeded")'));
check("client: 自插件也算进批量（用户在意的是「一共几个」）", /if \(self\.outdated === true && self\.name\) outgoing\.unshift/.test(clientSource));

/* --- v0.5.0 安装后引导：待重启横幅（2026-10-13）---
   桌面 profile 实测没有 dshmarket，安装全走本地通道、必须重启才生效 ——
   「装了没启用」是实装验证率最大的漏点。这条提醒必须：① 只在真需要重启时出现；
   ② 跨视图/跨会话持久；③ 重启发生后改口说「已生效」，不继续催。 */
check(
  "client: 只有本地通道且真改了 profile 才记「待重启」（市场通道热挂载不记；same/none 版本没动也不记）",
  /if \(!done\.market && done\.changed\) markRestartPending\(/.test(clientSource),
);
check(
  "client: 待重启落 localStorage 且合并去重（连装几个只出一条，名字不重复）",
  /RESTART_KEY = "dph-hub-restart-pending"/.test(clientSource) && /Array\.from\(new Set\(current\.names\.concat/.test(clientSource),
);
check(
  "client: 横幅挂载问宿主 startedAt —— 重启已发生就改口「已生效」；取不到按未重启处理（宁可多提醒）",
  /setEffective\(typeof body\.startedAt === "number" && body\.startedAt > pending\.at\)/.test(clientSource),
);
check(
  "client: 新的待重启先重置「已生效」（否则装完第二个插件会沿用上一次的已生效状态）",
  /setEffective\(false\);\s*\n\s*getJson\("\/api\/dpharness\/meta"\)/.test(clientSource),
);
check(
  "client: 横幅的重启按钮同样两步确认，并单独埋点（重启会掐断当前会话）",
  /action: "restart_ask", scope: scope/.test(clientSource) && /action: "restart_click", via: scope/.test(clientSource),
);
/* 真实渲染（不是源码匹配）：有待重启时，页签顶部必须真的出现横幅 */
localStorage.setItem("dph-hub-restart-pending", JSON.stringify({ names: ["dsh-better-sidebar"], at: Date.now() }));
const bannerTabHtml = renderToStaticMarkup(react.createElement(slotsOf(loadFreshClient())["conversation.view"], {}));
check(
  "tab: 有待重启时顶部渲染横幅（含「立即重启」与「知道了」两个出口）",
  bannerTabHtml.includes("dph_restart") && bannerTabHtml.includes("install.restart") && bannerTabHtml.includes("install.dismiss"),
  bannerTabHtml.slice(0, 160),
);
localStorage.removeItem("dph-hub-restart-pending");
const noBannerHtml = renderToStaticMarkup(react.createElement(slotsOf(loadFreshClient())["conversation.view"], {}));
check("tab: 没有待重启时不渲染横幅（不常驻占位）", !noBannerHtml.includes("dph_restart"));
check(
  "client: 更新行中文名优先，包名退到第二行（用户要认得出这是谁）",
  /nameZh \|\| String\(item\.name\)/.test(clientSource) && /if \(nameZh\) sub\.push\(String\(item\.name\)\)/.test(clientSource),
);
check("client: 缺中文名时标「未汉化」，不假装有中文", /t\("label\.untranslated"\)/.test(clientSource) && /const untranslated = !nameZh/.test(clientSource));
check(
  "client: 升级回执用裸包名（带 @latest 去查 profile 清单会永远查不到，把「装上了」记成「没装上」）",
  /function basePackage\(target\)/.test(clientSource) && /rememberPending\(\{ pkg: basePackage\(target\)/.test(clientSource),
);
check("basePackage: 去 @latest", client.basePackage("dsh-context@latest") === "dsh-context", client.basePackage("dsh-context@latest"));
check("basePackage: scoped 包去 @latest", client.basePackage("@laoyuehanni/dsh-token-usage@latest") === "@laoyuehanni/dsh-token-usage", client.basePackage("@laoyuehanni/dsh-token-usage@latest"));
check("basePackage: scoped 无版本时原样返回（不能把 scope 的 @ 当成版本分隔符）", client.basePackage("@scope/name") === "@scope/name", client.basePackage("@scope/name"));
check("basePackage: 带具体版本号也还原成裸名", client.basePackage("dsh-memento@1.2.3") === "dsh-memento", client.basePackage("dsh-memento@1.2.3"));
check("basePackage: 空值不抛错", client.basePackage(null) === "" && client.basePackage(undefined) === "", JSON.stringify(client.basePackage(null)));

/* --- v0.5.0：dsh 自带的兼容性闸门（用真实捕获的日志做样本） ---
   2026-10-12 在桌面版 dsh 0.2.0-rc.2 上实际拿到的输出：dsh 会拿目标版本的 peerDependencies
   跟本机 dsh 比对，不匹配就**硬拒绝**。 */
const realRejection = [
  "",
  'dsh: installation rejected: Plugin dsh-restart@0.1.2 is incompatible with dsh 0.2.0-rc.2: peerDependencies {"@deepseek-ai/dsh-llm":"^0.1.1-rc.2"}. Running it may cause crashes or data loss. Update the plugin or install a plugin version compatible with this dsh runtime. To accept this risk explicitly, grant the exact-version exemption for dsh-restart@0.1.2 on dsh 0.2.0-rc.2 with `dsh plugin allow-version` or the plugin manager, then retry the installation or restart dsh. Exact-version exemption: not active.',
  "dsh: nothing was installed.",
].join("\n");
const rejection = host.incompatibleFrom(realRejection);
check("兼容性闸门: 识别出被拒的包与版本", !!rejection && rejection.name === "dsh-restart" && rejection.version === "0.1.2", JSON.stringify(rejection));
check("兼容性闸门: 带出对方的 dsh 版本（界面要说明本机是哪个版本）", !!rejection && rejection.dsh === "0.2.0-rc.2", rejection && rejection.dsh);
const scopedRejection = host.incompatibleFrom("dsh: installation rejected: Plugin @laoyuehanni/dsh-x@0.4.7 is incompatible with dsh 0.2.0-rc.2: peerDependencies {}");
check("兼容性闸门: scoped 包不会把 scope 的 @ 当成版本分隔符", !!scopedRejection && scopedRejection.name === "@laoyuehanni/dsh-x" && scopedRejection.version === "0.4.7", JSON.stringify(scopedRejection));
check("兼容性闸门: 普通安装失败不被误判成闸门拒绝", host.incompatibleFrom("[ERR_PNPM_FETCH_404] GET https://registry.npmjs.org/x: Not Found - 404") === null);
check(
  "兼容性闸门: 通用错误提取器确实抓不到它（这正是需要专用解析器的原因）",
  /nothing was installed/.test(host.errorLineFrom(realRejection)),
  host.errorLineFrom(realRejection),
);
check("兼容性闸门: job 视图带出 why / reject 两个字段（界面据此翻成人话）", (() => {
  const hostSrc = fs.readFileSync(new URL("./lib/index.js", import.meta.url), "utf8");
  return /why: installJob\.why/.test(hostSrc) && /reject: installJob\.reject/.test(hostSrc);
})());
check(
  "兼容性闸门: 界面把拒绝原因翻成人话（不是一句「失败」）—— 三件事都要给",
  /format\(t\("updates\.blockedBody"\), \{ spec:[\s\S]{0,120}?dsh:/.test(clientSource)
    && clientSource.includes('t("updates.blockedHow")')
    && clientSource.includes('t("updates.copyRaw")'),
);
check("兼容性闸门: 被拒的版本记在本机，下次直接标注（不做预判，只记真实发生过的）", /BLOCKED_KEY = "dph-hub-blocked"/.test(clientSource) && /rememberBlocked\(done\.reject\.spec\)/.test(clientSource) && clientSource.includes('t("updates.blocked")'));
check("兼容性闸门: 批量把「被拦下」与「真失败」分开计数", /if \(result\.why === "incompatible"\) blocked \+= 1;/.test(clientSource) && clientSource.includes('t("updates.batchBlocked")'));
check("兼容性闸门: 失败原因进闭集埋点（why=incompatible 可单独统计）", /why: done\.why \|\| "unknown"/.test(clientSource));

/* --- 失败信息提取：用真实捕获的 pnpm 输出（不是编造的样例） --- */
const realPnpmFailure = [
  "✓ Lockfile passes supply-chain policies (verified 2m ago)",
  "Progress: resolved 1, reused 0, downloaded 0, added 0",
  "[ERR_PNPM_FETCH_404] GET https://registry.npmjs.org/@dpharness%2Fdefinitely-not-exist-xyz: Not Found - 404",
  "",
  "This error happened while installing a direct dependency of /Users/zhanghao/.dsh/profiles/web",
  "",
  "@dpharness/definitely-not-exist-xyz is not in the npm registry, or you have no permission to fetch it.",
  "No authorization header was set for the request.",
  "dsh: pnpm failed in profile directory /Users/zhanghao/.dsh/profiles/web",
].join("\n");
const extracted = host.errorLineFrom(realPnpmFailure);
check("错误提取：取到 ERR_PNPM 代码行而非泛化描述", /ERR_PNPM_FETCH_404/.test(extracted), extracted);
check("错误提取：不是那句 This error happened", !/^This error happened/.test(extracted), extracted);
check("错误提取：空输入不抛错", host.errorLineFrom("") === "", JSON.stringify(host.errorLineFrom("")));

/* --- 脱敏：展示路径不能把 .npmrc 的 token 带出去 ---
   2026-09-30 用户提出：只换 token 没用，展示路径还在就会被继续带出。
   用**假** token 做样本（绝不写真 token）。 */
check(
  "脱敏: .npmrc 的 _authToken（含 registry 前缀）",
  host.redactSecrets("//registry.npmjs.org/:_authToken=npm_FAKEFAKEFAKEFAKE1234567890") === "//registry.npmjs.org/:_authToken=***",
  host.redactSecrets("//registry.npmjs.org/:_authToken=npm_FAKEFAKEFAKEFAKE1234567890"),
);
check(
  "脱敏: pnpm 的 Bearer 行（实测就是这个形状）",
  host.redactSecrets("An authorization header was used: Bearer npm_FAKEFAKEFAKEFAKE1234567890") ===
    "An authorization header was used: Bearer ***",
  host.redactSecrets("An authorization header was used: Bearer npm_FAKEFAKEFAKEFAKE1234567890"),
);
check(
  "脱敏: 裸 npm_ token（没有字段名也要拦）",
  !host.redactSecrets("token npm_FAKEFAKEFAKEFAKE1234567890 leaked").includes("FAKEFAKEFAKEFAKE"),
);
check(
  "脱敏: _password / NPM_TOKEN 等变体",
  host.redactSecrets("_password=hunter2") === "_password=***" && !host.redactSecrets("NPM_TOKEN=abc123").includes("abc123"),
  host.redactSecrets("NPM_TOKEN=abc123"),
);
check(
  "脱敏: 正常的错误行不受影响（不能把诊断信息一起吃掉）",
  host.redactSecrets("[ERR_PNPM_FETCH_404] GET https://registry.npmjs.org/x: Not Found - 404") ===
    "[ERR_PNPM_FETCH_404] GET https://registry.npmjs.org/x: Not Found - 404",
);
check("脱敏: 空值/undefined 不抛错", host.redactSecrets(undefined) === "" && host.redactSecrets(null) === "");
check(
  "脱敏: pnpm 自带的半遮形式（npm_[hidden]）也归一为 ***",
  host.redactSecrets("An authorization header was used: Bearer npm_[hidden]") === "An authorization header was used: Bearer ***",
  host.redactSecrets("An authorization header was used: Bearer npm_[hidden]"),
);
/* 先截断后脱敏：只要 token 完整出现在可见窗口内，就必须被完整替换 */
const longNoise = "x".repeat(570);
check(
  "脱敏: 截断与脱敏的顺序正确（token 落在 600 字窗口里要被完整替换）",
  !host.redactSecrets(longNoise + " _authToken=npm_FAKEFAKEFAKEFAKE1234567890").includes("FAKEFAKEFAKEFAKE"),
);

console.log(`\n${failures === 0 ? "全部通过" : failures + " 项失败"}`);
process.exit(failures === 0 ? 0 : 1);
