# dsh-dpharness（严选插件）

在 DeepSeek Harness（dsh）里浏览、搜索 [dpharness.com](https://dpharness.com) 的 dsh 插件目录，
**并可直接一键安装**。

## 两个视图

面板（浮窗与页签共用同一套组件）顶部可在两个视图间切换：

| 视图 | 数据来源 | 回答的问题 |
|---|---|---|
| **严选推荐** | `GET /api/plugins`（全量目录） | 「我知道要什么，帮我找」——可搜索、可按 Star 排序 |
| **分类精选** | `GET /api/best`（月度策展，与站点 [/best](https://dpharness.com/best) 同一份数据） | 「我该装哪几个」——按大类 → 小类分组，每小类只留 2~3 个 |

分类精选视图刻意保留两项元数据：**小类内名次**与**上榜理由**（如「小类第 1 · 实装验证通过 · 周下载 12.8 万」）。
去掉它们，这份清单就只是又一个列表；它们的价值恰恰在于「为什么是它」可复核。
入榜门槛（站点侧规则）：通过静态安装检查或 CI 实装验证 + 汉化完成；每月 1 日重算并公开淘汰原因。

## 三个入口

| 入口 | 位置 | 说明 |
|---|---|---|
| 页签「严选插件」 | 会话视图区 | 完整页：搜索 + 排序 + 批量浏览 |
| 左下入口 | 侧边栏底部（`sidebar.footer.action`） | 点击展开全站浮窗 |
| 全站浮窗 | 右下角（`shell.overlay`，跨路由含首页） | 随手查：随时搜、随时装 |

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
| `install_ask` | 点「安装」（弹出确认框） | 有多少人真的动了安装的念头 |
| `install_cancel` | 确认框点取消 | 被确认框劝退的人（文案/门槛的优化对象） |
| `install` | 确认后开始安装 | 真正发起的安装 |
| `install_failed` | 安装失败（含 `via` 阶段与 `why` 原因） | 失败卡在哪一步 |
| `installed_market` / `installed_local` | 安装成功（热挂载 / 需重启） | 装成了多少 |
| `restart_click` | 点「立即重启」 | 需重启的那批里有多少人真的重启了 |
| `post_install` | **下一次加载时**回查 | 重启发生没发生、装的包进了加载清单没有 |

`why` 是**闭集枚举**（`busy` / `market_http` / `local_rejected` / `poll_unreachable` /
`cli_exit` / `timeout` / `restart_http`），不是错误原文 —— 原文含本地路径与包名，
既不可聚合也不该外发。

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
| `GET /api/dpharness/search?q=&take=&sort=stars` | 目录查询，字段裁剪后返回，按 `q+take+sort` 缓存 5 分钟 |
| `GET /api/dpharness/best` | 分类精选榜单（站点 `/api/best` 的代理 + 字段裁剪），缓存 5 分钟 |
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
- 浮窗与页签底部都有**匿名统计开关**，可随时关闭。
- 埋点经本地 host 转发（站点端点不带 CORS 头），失败静默忽略，绝不影响操作。

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
