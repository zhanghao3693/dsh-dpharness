# dsh-dpharness（严选插件）

在 DeepSeek Harness（dsh）里浏览、搜索 [dpharness.com](https://dpharness.com) 的 dsh 插件目录，
**并可直接一键安装**。

## 四个视图

浮窗与页签**共用同一套视图与同一组文案**，顶部都能在四个视图间切换，默认都停在「严选推荐」
（同一功能在两处换默认值，最容易被当成 bug）：

| 视图 | 数据来源 | 回答的问题 |
|---|---|---|
| **严选推荐** | `GET /api/plugins`（全量目录） | 「我知道要什么，帮我找」——可搜索、可按 Star 排序 |
| **分类精选** | `GET /api/best`（月度策展，与站点 [/best](https://dpharness.com/best) 同一份数据） | 「我该装哪几个」——按大类 → 小类分组，每小类只留 2~3 个 |
| **每日推荐**（v0.5.0） | 同上榜单，按自然日取一条 | 「今天装哪个」——当天唯一一条，所有用户一致 |
| **更新**（v0.5.0） | 本机 profile + npmmirror | 「我装的这些该升级了吗」——本插件自身 + 已装插件逐包比对 |

分类精选视图刻意保留两项元数据：**小类内名次**与**上榜理由**（如「小类第 1 · 实装验证通过 · 周下载 12.8 万」）。
去掉它们，这份清单就只是又一个列表；它们的价值恰恰在于「为什么是它」可复核。
入榜门槛（站点侧规则）：通过静态安装检查或 CI 实装验证 + 汉化完成；每月 1 日重算并公开淘汰原因。

### 每日推荐怎么选出来的（v0.5.0）

不是随机，也不是服务端下发 —— 站点当时没有 `/api/daily`（`/api/daily`、`/api/today`、
`/api/recommend` 实测全 404，只有 `/api/best` 可用），所以**从月度榜单里按日期确定性取一条**：

```
候选 = 展平 best.categories[].subs[].items[]      （2026-10-12 实测：124 条唯一候选）
候选按 fullName 稳定排序                            ← 不排序的话，站点重算榜单当天就会换人
index = FNV1a(dateKey) % 候选数
dateKey = YYYY-MM-DD（**固定 UTC+8**，不是本地时区）
```

三条不变式（`test-local.mjs` 逐条断言）：

1. **同一自然日恒定同一条** —— 浮窗、页签、卡片三处调用结果必须一致；
2. **上游分组顺序抖动不影响结果** —— 排序键是条目自身的唯一键，与上游顺序无关；
3. **跨天会换** —— 否则「每日」是假的。

- 时区固定 UTC+8：用本地时区会让同一天不同地区的用户看到不同的一条，而「今日推荐」的语义
  本来就是「今天大家看到的是同一条」。
- 页面长期不关（dsh 是常驻页）时靠 `visibilitychange` + **60s 轮询**比对日键来跨天刷新。
- 当天候选池 124 条 ⇒ **124 天不重复**；榜单每月 1 日重算，换月后可能与前月重复（可接受）。
- 榜单不可用 / 返回空 → 卡片显示「今日推荐暂不可用」，**不影响**其余视图（不是静默消失）。
- 想换成编辑每天点选（真正的「每日一荐」），只需把 `pickDaily()` 的数据源换成站点新接口，
  界面不用动。

## 五个入口

| 入口 | 位置 | 说明 |
|---|---|---|
| 页签「严选插件」 | 会话视图区 | 完整页：视图切换 + 搜索 + 排序 + 批量浏览 |
| 左下入口 | 侧边栏底部（`sidebar.footer.action`） | 点击展开全站浮窗；**浮窗被关闭时，它同时是恢复入口** |
| 全站浮窗 | 右下角（`shell.overlay`，跨路由含首页） | 随手查：随时搜、随时装 |
| **设置 → 通用**（v0.5.0） | `settings.general.item` | 一行：浮窗显隐开关（最高频的那个） |
| **设置 → 插件 → 严选插件**（v0.5.0） | `settings.plugins.tab` | 完整设置页：浮窗 / 每日推荐 / 匿名统计 + 更新日志 + 恢复默认 |

设置页里的三个开关与别处**共用同一个状态源**（都读共享 store 并走同一条写路径），
所以不会出现「在通用里开了、到插件页签里还显示关」的错位。

## 更新检查与红点（v0.5.0）

「更新」视图一次回答两件事：**本插件自己**要不要升、**你装的其它 dsh 插件**里哪些有新版。
再加三处红点，让你不用主动去看也能知道。

**检查怎么做的**

| 环节 | 做法 | 依据 |
|---|---|---|
| 装了哪些 | 读 profile 的 `dependencies`（本机磁盘，零网络） | `~/.dsh/profiles/<p>/package.json` |
| 是不是插件 | `package.json` 有 `dsh` 字段，或依赖里出现 `@deepseek-ai/dsh` | **按插件契约判，不按 `dsh-` 前缀猜**（第三方包名五花八门）；与站点 `lib/detect.ts` 分层判据同源 |
| 装了哪个版本 | 读 `node_modules/<pkg>/package.json` 的 `version` | 读不到 = 未知，不是「不是插件」 |
| 最新是哪个版本 | 逐包问 `registry.npmmirror.com/<pkg>/latest` | 站点 `/api/plugins` **不提供版本字段**，所以拿不了目录当版本源 |

代价与护栏（实测：本机 24 个依赖 → 21 个插件，**约 1 秒**）：

- 并发上限 6（全串行十几秒，全并发容易被镜像限流）；
- host 侧整体缓存 **10 分钟**，「检查更新」按钮用 `?refresh=1` 绕过缓存，但 **30 秒内只放行一次**；
- 客户端的结果是**模块级共享 store**：三处红点 + 「更新」视图共用一次请求（否则一次页面加载会打四遍）。

**红点怎么亮、怎么灭**

- 亮：**签名变化**才亮。签名 = 「包名@目标版本」排序后的串；只要出现比上次确认过的更新的版本，红点重新亮；
- 灭：你**看过「更新」视图**即视为已确认，签名落盘（`dph-hub-updates-acked`）。
  这套思路与用户已有的 `check-updates` 本地补丁一致（那里存 acked-version），目的都是避免红点长期常亮；
- 三处都亮：侧边栏底部按钮、浮窗胶囊、设置页「更新日志」节标题旁。
  首次检查由**始终挂着的侧边栏按钮**触发 —— 这正是"用户根本不知道有新版本"的解法所在；
- 红点带视觉隐藏文案：只有颜色没有文字，对读屏用户等于不存在。

> ⚠️ **三态**：`outdated` 为 `true` / `false` / `null`。任一端（本机版本或 npm 最新版）拿不到就记 `null`，
> 界面显示「查不到最新版」。**绝不写成「已是最新」** —— 本机 4 个只在本地开发、没发布到 npm 的插件
> 正是这种情况，混为一谈会让它们永远看起来是最新的。

> ⚠️ 「恢复默认」**刻意不清**红点的确认标记：它是"我看过了"，不是"我的偏好"；
> 一并清掉只会让用户刚关掉的红点立刻又亮起来。

> 💡 升级命令里的 profile 用**本机真实值**拼（桌面版是 `desktop` 而不是 `web`）。
> 本插件只给命令、不代你安装。

> ⚠️ **改了插件代码 ≠ 立即生效**：客户端是刷新页面即生效，但 **host 的路由要重启 dsh 才会注册**。
> 这个窗口期里 `/api/dpharness/updates` 会落到 dsh 静态前端的兜底上、返回**纯文本**（实测
> 桌面版 `not found`、无凭据时 `unauthorized`）。界面因此给出「本机 host 还没提供这个接口 ——
> 通常是 dsh 未重启」，并在本机装了 `dsh-restart` 时给一个**两步确认**的重启按钮。
> 早期版本在这里直接把 `response.json()` 的解析错误抛给用户
> （`Unexpected token 'o', "not found" is not valid JSON`），真实原因被彻底掩盖 —— 已修：
> 四个取数 hook 现在共用 `readHostJson()`，先取文本再解析，解析失败一律标成「路由未注册」。

## 浮窗可以彻底关掉（v0.4.4）

`shell.overlay` 是**跨路由常驻**的：胶囊在首页、会话页、任何页面都在。
`open` 只表示「展开 / 收起」，此前用户**没有**把这块东西从屏幕上拿掉的手段。现在四条路径：

| 关闭 | 位置 |
|---|---|
| 胶囊右端的 `×` | 悬浮胶囊上（直接关） |
| 面板底部的「隐藏浮窗」 | 展开状态下面板页脚 |
| 「严选插件」页底部取消勾选「显示右下角浮窗」 | 会话端页签页脚 |
| **设置 → 通用 / 设置 → 插件**（v0.5.0） | 显式的设置入口 |

关闭 = `hidden` 状态，写进 `localStorage`（`dph-hub-hidden`），**下次进来仍然是关的**；
关闭后**没有任何路径会自动把它弹回来**（`open: true` 在全文件只出现在两处用户点击里，
`test-local.mjs` 对这一点有静态断言）。

> ⚠️ 关闭必须配恢复入口，否则就变成"关掉找不回来"。四个恢复入口：
> ① 侧边栏底部「严选插件」按钮（隐藏状态下点击会先取消隐藏再展开面板）
> ② 「严选插件」页底部的「显示右下角浮窗」开关（只取消隐藏，不强行弹面板）
> ③ 设置 → 通用 的「右下角浮窗」行（v0.5.0）
> ④ 设置 → 插件 → 严选插件 的同一个开关（v0.5.0）
> 判定顺序写死在代码里：`state.hidden` 时**整块浮窗（胶囊 + 面板）都不渲染**。
>
> 胶囊上的 `×` 是胶囊的**兄弟节点**（绝对定位盖在右端），不是它的子节点 ——
> `<button>` 里套 `<button>` 是非法 HTML，且 `pointerdown` 会冒泡到胶囊上把点击变成拖动。

> 💡 **老宿主兼容**：`settings.general.item` / `settings.plugins.tab` 在旧版 dsh 上可能不存在。
> `slots.inject` 在槽位未声明时只是登记等待、永不激活，因此**不会报错、也不会拖累插件加载**
> —— 表现为这两个设置入口干脆不出现，其余功能照常。（依据：`@deepseek-ai/dsh-client-runtime`
> `src/client/slots.ts` 的 `inject` 实现，2026-10-12 查证。）


## 更新日志与「你装的不是最新版」（v0.5.0）

放在 **设置 → 插件 → 严选插件** 的最底部。一次给出三件事，缺一件就不好用：

| 给出 | 来源 | 说明 |
|---|---|---|
| 你装的是哪个版本 | host 的代码常量 `VERSION` | 客户端读不到 `package.json`，版本只可能由 host 提供 |
| 有没有更新的版本 | `registry.npmmirror.com/dsh-dpharness/latest` | **三态**：`true` / `false` / `null`（`null` = 没查到，**绝不显示成「已是最新」**） |
| 怎么升 | 本机真实 profile 拼出的 `dsh plugin --profile <p> add dsh-dpharness@latest` | profile 名按本机填好（桌面版是 `desktop` 不是 `web`），点一下复制 |

**日志正文的权威源只有一份**：`lib/changelog.js`。客户端**不持有副本** —— 双份数据必然漂移
（本站在「安装命令口径」上已经栽过一次）。客户端读的是**本机 host** 的只读路由，
于是「内置数据」与「离线可用」两个性质同时成立。

内容优先级（`mergeChangelog()` 的规则，逐条有单测）：

1. GitHub 有对应版本的 Release → **用 Release 正文覆盖内置**（Release 才是发版当时的正式说明，且能事后修正）；
2. Release 正文为空 → **不覆盖**（空 release 很常见，覆盖等于丢信息）；
3. Release 有、内置没有的版本 → 补进来；
4. 其余用内置底稿；输出按版本号从新到旧（顺序本身就是信息）。

> ⚠️ **发版纪律（有测试兜底）**：`lib/changelog.js` 里**第一条的版本号必须等于 `package.json` 的
> `version`**，否则「更新日志」会悄悄落后于实际发版 —— 那比没有更新日志更糟。
> `test-local.mjs` 对这两处（代码常量与 package.json）双向断言。

> 💡 远端当前**没有任何 Release**（`api.github.com/.../releases` 实测返回 `[]`），
> 故 `source` 恒为 `builtin`，日志直接来自内置底稿。想让 Release 生效，
> 先在 GitHub 上按 `vX.Y.Z` 的 tag 发 Release，之后同名版本会以 Release 正文为准。

## 卡片显示什么

按「汉化优先」组织，缺汉化时明确标注而不是假装有：

1. **中文名**（`nameZh`）— 站点已汉化
2. **中文分类** + 可信度徽章（`tier` / `dshCompat` / `verify` / `tested` / `risk`）
3. **卖点行**（强调）— 取站点 `tagline`，经严格过滤；不合格就不显示
4. **汉化正文** — 站点 `descriptionZh`；没有则显示英文原文并标「未汉化」
5. **安装按钮** + 可复制的 `dsh plugin --profile web add <包名>`

> ⚠️ 上游 `tagline` 实测约一半不可用（英文原文 / 被截断 / 甚至 `安装&nbsp;`、README 目录导航）。
> 本插件用 `pickZh()` 过滤：切段逐段找中文、中文字符 ≥ 6、段长 ≥ 8、丢弃英文导航词开头。
> 覆盖面见 `test-local.mjs` 里那些用真实样本写的用例。

## 一键安装怎么工作

**两条路径，安全优先：**

1. **优先复用 dshmarket 的同源 HTTP 路由**（`POST /dsh-market/install`）——
   免重启热挂载、可回滚、带供应链校验。代价：它只接受自己 curated registry（awesome 目录）里的 URL。
2. **不在目录里 / 未装 dshmarket 时**降级到本插件自己的 spawn：
   `dsh plugin --profile web add <包名>`（**改 profile，装完需重启 dsh 生效**）。

细节与安全约束：

- **命令来源与站点同口径**（`lib/installCmd.ts` 的 `resolveInstallTarget`）：
  只有 `installCheck.status === "pass"` 时才用 npm 包名，否则退回 `owner/repo` **走 GitHub 源安装**，
  并在卡片上标注来源（与站点详情页用词一致）。**不会出现"什么都不给"的情况。**
- 一键安装按钮**只在站点已验证时**出现（未验证/警告都按保守处理，只给可复制的命令）。
- 只有站点给出 `installCheck.status === "pass"` 的条目才显示安装按钮
  （校验未过时 npm 上的同名包**可能属于别人**）。
- 安装前有二次确认，展示将要执行的包名。
- **CLI 入口按宿主自动定位**（2026-09-30 修复）：
  - 常规 `dsh web`（launchd/终端）：复用启动本 host 的 `process.argv[1]`，即 `<prefix>/bin/dsh`；
  - **Electron 桌面版**（`@deepseek-ai/dsh-desktop`）：host 跑在 Electron 进程里，
    `argv[1]` 是 `--expose-internals` 而非路径 —— 旧逻辑在这里必然返回 null，
    表现为**每次安装都失败**（`cannot locate the dsh entry point (process.argv[1])`）。
    现改为使用 app 自带的 `<Contents>/Resources/runtime/cli/bin/dsh`（该脚本自己设
    `ELECTRON_RUN_AS_NODE=1` 并指向 `dsh-desktop-host/lib/cli.js`）。
    **未识别到 Electron 壳时不去猜路径**，宁可如实报错也不乱 spawn。
  - profile 也按宿主判定：桌面版把 profile 目录作为位置参数传入
    （实测 `…/.dsh/profiles/desktop`），只认磁盘上真实存在的 profile 目录；
    否则会 fallback 成 `web`，把插件装进错误的 profile。
- dshmarket 返回 **409**（有 agent 正在运行）时**不降级**，直接报错 —— 避免和正在工作的 agent 抢插件文件。
- 目标包名过字符白名单校验；子进程环境会剥掉宿主的 safe-delete shim（否则 pnpm 清理临时文件被拦）。
- 失败时展示 pnpm 的错误码行（如 `[ERR_PNPM_FETCH_404] …`），而不是一堆进度日志。

## 安装漏斗与埋点

一次安装从「看见」到「真的生效」要跨 7 个环节，每步都有独立事件 —— 否则
「没成功」只能看到一个总数，看不出卡在哪。全部经本地 host 转发（站点端点不带 CORS 头），
`value` 形如 `action:k=v:…`，并**统一附加插件版本**（`v=`）。

| 事件 | 触发点 | 回答的问题 |
|---|---|---|
| `hello` | 插件被加载 | 有哪些版本在用（老版本发不出新事件，空值必须能和「没人做」区分） |
| `open` / `search` / `best_open` | 打开面板 / 搜索 / 切到分类精选 | 入口有没有用 |
| `hide` / `show` | 手动关闭浮窗 / 重新打开（页签底部与设置页共用同一条写路径） | 有多少人嫌这个浮窗碍事（`scope` 区分是胶囊、面板、页签还是设置触发的） |
| `daily_toggle` | 每日推荐开关（`scope=settings:on` / `settings:off`） | 「每天一条」有没有人嫌多余 |
| `changelog_open` | 打开设置页时**发现自己是旧版** | 有多少人停在旧版本上（只上报「确实有新版」的情况） |
| `upgrade_copy` | 复制升级命令 | 看完日志真的去升级的比例 |
| `updates_check` | 点「检查更新」（`scope` 区分浮窗/页签） | 有多少人会主动查 |
| `updates_ack` | 打开「更新」视图确认更新（带 `n` = 确认了几项） | 红点有没有被看见（没 ack 说明三处入口都没被注意到） |
| `prefs_reset` | 设置页点「恢复默认」 | 有多少人需要回到出厂状态（往往意味着某个默认值不合适） |
| `install_ask` | 点「安装」（弹出确认框） | 有多少人真的动了安装的念头 |
| `install_cancel` | 确认框点取消 | 被确认框劝退的人（文案/门槛的优化对象） |
| `install` | 确认后开始安装 | 真正发起的安装 |
| `install_failed` | 安装失败（含 `via` 阶段与 `why` 原因） | 失败卡在哪一步 |
| `installed_market` / `installed_local` | 安装成功（热挂载 / 需重启） | 装成了多少 |
| `restart_click` | 点「立即重启」 | 需重启的那批里有多少人真的重启了 |
| `post_install` | **下一次加载时**回查 | 重启发生没发生、装的包进了加载清单没有 |

`why` 是**闭集枚举**（`busy` / `http_<status>` / `network` / `local_rejected` /
`poll_unreachable` / `cli_exit` / `timeout` / `restart_http`），不是错误原文 —— 原文含本地路径与包名，
既不可聚合也不该外发。市场的 HTTP 失败细分成 `http_<status>`（`http_405` = 路由缺席、
`http_403` = 被拦、`http_5xx` = 上游故障），只匹配到「通道不可用」时另发
`market_unavailable` 事件并照常降级到本地通道。

> 💡 **新增 action 值不需要改站点**：站点 `/api/track/event` 的白名单校验的是 **`type`**
> （`plugin_hub` / `copy_install`），而 `action` 是拼进 `value` 的自由文本
> （host 侧 `clean(detail.action, 24)`，只做字符收紧与截断）。所以 v0.5.0 的
> `daily_toggle` / `prefs_reset` 不需要跨仓库放行。

> ⚠️ 搜索结果里的 **`total` 才是命中总数**，`count` 只是本次返回条数（等于 `take`）。
> 站点的 `GET /api/plugins` 两者都给，早期版本只取 `list.length` 当结果数，于是
> 「共 N 条结果」里的 N 恒等于 30 —— **搜索前后数字不变**，用户据此判定「搜索不生效」
> （2026-09-30 实测：搜「统计」真实命中 106 条，面板却写死「共 30 条结果」）。
> 现在卡片上方的副标题是「共 106 条结果 · 已显示前 30 条」，重新搜索期间显示「搜索中…」。

### 「安装成功之后」怎么验证

安装完成那一刻没有任何东西能证明结果：热挂载路径不重启，本地 CLI 路径要等重启才生效。
所以安装成功时只在 `localStorage` 留一张凭据（目标包名 / 阶段 / 时间），
**下次插件被加载时**由 host 回查两件事：

| 字段 | 来源 | 含义 |
|---|---|---|
| `restarted` | host 进程启动时间 vs 安装时间 | dsh 在安装之后**确实重启过** |
| `bundled` | profile `package.json` 的 `dsh.profile.bundles` | 该包**进了 dsh 的加载清单** |

两个字段都刻意做成三态：`1` / `0` / **不写**。不写表示「没查到」，
绝不用 `0` 兜底 —— 把「查不到」记成「没装上」会让整条漏斗的结论反过来。

> ⚠️ 已知边界：`bundled` 对 `via=market`（dshmarket 热挂载）不作为失败判据 ——
> 它有自己的挂载机制，是否写 profile 清单本插件未验证。看 `bundled` 请以 `via=local` 为准。

## HTTP 路由（host 侧）

| 路由 | 说明 |
|---|---|
| `GET /api/dpharness/search?q=&take=&sort=stars` | 目录查询，字段裁剪后返回，按 `q+take+sort` 缓存 5 分钟。响应含 `count`（本次返回条数）与 `total`（该筛选下的真实命中总数，**展示口径以它为准**） |
| `GET /api/dpharness/best` | 分类精选榜单（站点 `/api/best` 的代理 + 字段裁剪），缓存 5 分钟 |
| `GET /api/dpharness/changelog` | 更新日志（内置底稿 + 可选 GitHub Releases）+ 当前/最新版本比对 + 升级命令，缓存 5 分钟 |
| `GET /api/dpharness/updates` | 本插件 + 已装插件的更新检查（逐包问 npmmirror），缓存 10 分钟；`?refresh=1` 绕过但 30 秒只放行一次 |
| `GET /api/dpharness/postinstall?pkg=&via=&at=` | 安装后回执（只读：进程启动时间 + profile 加载清单） |
| `POST /api/dpharness/event` | 埋点代理 → `dpharness.com/api/track/event` |
| `POST /api/dpharness/install` | `{ pkg }`，spawn `dsh plugin add`；返回 202 + 任务启动 |
| `GET /api/dpharness/install` | 安装任务进度与结果 |
| `GET /api/dpharness/meta` | 版本、profile、路由清单、缓存与安装状态 |

> ⚠️ 改 host 路由时注意：`parseQuery()` 是 search/best 专用的**白名单**解析器，
> 只输出 `q/take/sort`。新路由自定义参数请用 `readParams()` ——
> 复用 `parseQuery()` 会让参数**静默读成空串**（实测踩过）。

## 隐私

- **不采集搜索关键词原文**，只上报动作、关键词长度与命中数。
- **不上报错误原文**，失败原因只发闭集枚举。
- 复制/安装命令的上报口径与站点一致（`copy_install` 的 value 为整条命令），
  来源靠 `path=/dsh-plugin` 区分。
- 回执查询只读本机 profile 的清单文件，结果仅两个布尔量。
- 浮窗与页签底部都有**匿名统计开关**，可随时关闭；页签底部另有**浮窗显示开关**。
- **所有偏好只存在本机 `localStorage`，一项也不上传**：`dph-hub-hidden`（浮窗显隐）、
  `dph-hub-pos`（浮窗位置）、`dph-hub-daily`（每日推荐开关）、`dph-hub-telemetry`（统计开关）、
  `dph-hub-updates-acked`（已确认过的可升级集合签名，用于熄灭红点）。
  设置页的「恢复默认」只清前四项，**刻意不动**访客 ID（统计口径的连续性）、安装回执（一次性凭据）
  与红点确认标记（清了会让刚关掉的红点立刻又亮）。
- 更新检查**只读本地文件与只读 registry**：不上传你装了哪些包，也不代替你安装任何东西。
- 埋点经本地 host 转发（站点端点不带 CORS 头），失败静默忽略，绝不影响操作。
- 安装失败时展示的 pnpm 输出（卡片上的诊断行）**展示前统一脱敏**：
  `.npmrc` 形态的凭据（`_authToken` / `_auth` / `_password` / `token=`）、
  `Authorization: Bearer …` 以及裸 `npm_…` token 一律替换为 `***`。
  pnpm 多数时候会自己打成 `Bearer npm_[hidden]`，但那不是契约 —— 这里按最坏情况兜底。
  **判据是"展示路径是否存在"，不是"凭据是否已泄露"**：路径还在，换 token 也没用。
- 脱敏顺序固定为**先截断（600 字）后替换**：反过来的话，截断会把 token 切成半截，
  半截既匹配不上模式、又照样是泄露。

## 权限与外部服务（上架声明）

- **网络**：访问 `dpharness.com` 站点端点（目录 / 榜单 / 埋点回执）、`api.github.com`（**只读** releases，用于补全更新日志；当前仓库未发过 Release，故此路通常返回空）与 `registry.npmmirror.com`（**只读** `<包名>/latest`：既用于判断本插件是否最新，也用于逐包检查你已安装的插件）。三处都只发 GET，任一失败都静默降级、不影响功能；一键安装走 `dsh` CLI，本插件不直接下载第三方包。
- **网络量级（明确声明）**：更新检查会对 profile 的**每一个直接依赖**各发一次只读请求（本机实测 24 个依赖 / 约 1 秒，并发上限 6），host 侧缓存 10 分钟；不点「检查更新」时每个页面加载最多触发一轮。检查结果只留在本机。
- **文件**：只读 DSH Profile 内的清单文件（回执查询）；不写 Profile 之外的任何路径。
- **命令**：不执行 shell 命令；「一键安装」是把安装命令复制到剪贴板/交给宿主 CLI，由用户触发。
- **凭据**：不读取、不存储任何凭据；也**不在任何展示或上报路径里输出凭据**（安装日志统一脱敏，见「隐私」）。
- **失败边界**：埋点与回执失败一律静默降级，不影响目录浏览与宿主稳定性。
- **兼容性**：DSH 逐版本声明见 `package.json` 的 `dsh.compatibility.dshReleases`（当前 `0.2.0-rc.2: compatible`，v0.4.3 起实装验证）；Node `>=22`。

## 安装本插件

**官方命令（推荐）**：

```bash
dsh plugin --profile web add dsh-dpharness
```

> `--profile web` 是 dsh CLI 的**必需参数**，省略会直接报
> `required option '--profile <name>' not specified`。
> 任何来源给出的 `dsh plugin add <owner/repo>` 都不可用。

也可从 GitHub 源安装（等价，未依赖 npm 缓存时用）：

```bash
dsh plugin --profile web add zhanghao3693/dsh-dpharness
```

开发用（改完立刻看效果，从本地目录装）：`bash install.sh`，然后重启 dsh
（侧边栏「重启」按钮，或 `pkill -9 -f "bin/dsh web"` 让 launchd 拉起）。

> ⚠️ **`install.sh` 与官方命令不能混用**：官方安装会把它并入 profile 的 bundle 层，
> 而 `install.sh` 是往 profile 的 `cordis.patch.yml` 里插一段 `insert` ——
> 同一个 `id` 被插入两次会让 **dsh 启动硬失败**。切换前先清掉另一边。

## 卸载

从 `~/.dsh/profiles/web/cordis.patch.yml` 删掉含 `id: dpharness` 的 `insert` 块，然后：

```bash
rm -rf ~/.dsh/profiles/web/node_modules/dsh-dpharness
```

## 开发自检

```bash
cd .dev && npm install react@19 react-dom@19 && cd ..
node test-local.mjs     # host 侧真打上游 + client 侧 SSR + pickZh 判据（真实样本）
```

> 不要用 `~/.dsh/profiles/node_modules/react` 做测试依赖：那两个软链在 0.1.5 升级后已悬空（实测）。

## License

MIT
