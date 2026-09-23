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
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  sent.push({ url: String(url), options });
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
        count: 1,
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
check("host: 注册六条路由", Object.keys(routes).length === 6, Object.keys(routes).join(", "));

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
check("meta: 列出六条路由", metaRoutes.out.body.routes.length === 6, JSON.stringify(metaRoutes.out.body.routes));

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
check("client: 注册三个入口", slotNames.length === 3, slotNames.join(", "));
check("client: 含页签", !!registered["conversation.view"]);
check("client: 含左下入口", !!registered["sidebar.footer.action"]);
check("client: 含全站浮窗", !!registered["shell.overlay"]);

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
check("client: 400/404 才降级（409 不降级）", /status === 400 \|\| market\.status === 404/.test(clientSource));
check("client: 复制与安装分别埋点", clientSource.includes('"copy_install"') && clientSource.includes('action: "install"'));
check("client: 安装失败区分阶段与原因", /action: "install_failed", via: "market", why/.test(clientSource) && /why: local\.status === 409 \? "busy" : "local_rejected"/.test(clientSource));
check("client: 确认框的流向单独埋点", clientSource.includes('action: "install_ask"') && clientSource.includes('action: "install_cancel"'));
check("client: 点击重启即上报（结果靠回执证明）", clientSource.includes('action: "restart_click"') && clientSource.includes('action: "restart_failed"'));
check("client: 失败原因只发闭集枚举，不发错误原文", !/why: String\(/.test(clientSource) && !/why: done\.message/.test(clientSource));

/* --- 浮窗可拖动：位置夹取是纯函数，断言边界 --- */
check("client: 暴露 clampPos 供测试", typeof client.clampPos === "function");
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

check("overlay: 关闭状态落盘（下次进来仍然是关的）", /HIDE_KEY = "dph-hub-hidden"/.test(clientSource) && /storeHidden\(/.test(clientSource));
check("client: 侧边栏按钮是恢复入口（隐藏时先取消隐藏再打开）", /if \(state\.hidden\) \{[\s\S]{0,60}showHub\("footer"\)/.test(clientSource));
check("client: 面板底部也给「隐藏浮窗」出口", clientSource.includes('hideHub("panel")'));
check("client: 关闭动作单独埋点（否则不知道这功能有没有人用）", clientSource.includes('action: "hide"') && clientSource.includes('action: "show"'));
localStorage.removeItem("dph-hub-hidden");

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

console.log(`\n${failures === 0 ? "全部通过" : failures + " 项失败"}`);
process.exit(failures === 0 ? 0 : 1);
