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
check("host: 注册四条路由", Object.keys(routes).length === 4, Object.keys(routes).join(", "));

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
check("relay: plugin_hub 载荷", body && body.type === "plugin_hub" && body.value === "search:len=7:hits=23", JSON.stringify(body));
check("relay: 不含搜索关键词原文", body && !/kimi|sidebar/i.test(String(body.value)), body && body.value);

const bad = await relay({ event: "whatever", visitorId: vid, detail: {} });
check("relay: 白名单外事件 → 400", bad.res.out.status === 400, "status=" + bad.res.out.status);

const badVid = await relay({ event: "plugin_hub", visitorId: "short", detail: { action: "open" } });
body = badVid.forwarded && JSON.parse(badVid.forwarded.options.body);
check("relay: 非法 visitorId → null", body && body.visitorId === null, JSON.stringify(body && body.visitorId));

/* --- install route：只测拒绝路径与状态形状，自动化测试绝不真装 --- */
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
check("meta: 列出四条路由", metaRoutes.out.body.routes.length === 4, JSON.stringify(metaRoutes.out.body.routes));
check("meta: 带 profile", typeof metaRoutes.out.body.profile === "string", metaRoutes.out.body.profile);
check("自动化测试未触发真实安装", sent.length === outboundBeforeInstall && installGet.out.body.job.active === false, "install 段新增外部请求=" + (sent.length - outboundBeforeInstall));

globalThis.fetch = realFetch;

/* -------------------------------------------------------------- client half */
let spec = null;
globalThis.window = { __ModuleLoader__: { load: (value) => { spec = value; } } };
globalThis.localStorage = {
  store: new Map(),
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; },
  setItem(key, value) { this.store.set(key, String(value)); },
};
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
client.apply(clientCtx);
const slotNames = Object.keys(registered).sort();
check("client: 注册三个入口", slotNames.length === 3, slotNames.join(", "));
check("client: 含页签", !!registered["conversation.view"]);
check("client: 含左下入口", !!registered["sidebar.footer.action"]);
check("client: 含全站浮窗", !!registered["shell.overlay"]);

const react = req("react");
const { renderToStaticMarkup } = req("react-dom/server");

const tabHtml = renderToStaticMarkup(react.createElement(registered["conversation.view"].view, {}));
check("tab: SSR 渲染", tabHtml.includes("dph_root"), tabHtml.slice(0, 80));

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
