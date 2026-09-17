window.__ModuleLoader__.load({
	id: "dsh-dpharness",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		const h = react.createElement;

		/* ------------------------------------------------------------------ styles */
		const css = [
			".dph_root{display:flex;flex-direction:column;gap:12px;width:100%;max-width:1080px;margin:0 auto;padding:6px 4px 24px}",
			".dph_header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
			".dph_title{margin:0;font-size:17px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_sub{color:var(--dsw-alias-label-tertiary);font-size:12px}",
			".dph_spacer{flex:1}",
			".dph_btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:6px;padding:4px 12px;font:inherit;font-size:12px;cursor:pointer;text-decoration:none;white-space:nowrap}",
			".dph_btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dph_bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			".dph_input{flex:1;min-width:180px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:7px 10px;font:inherit;font-size:13px;outline:none}",
			".dph_input:focus{border-color:var(--dsw-alias-state-business-primary)}",
			".dph_seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;overflow:hidden;flex:none}",
			".dph_segBtn{border:0;background:transparent;color:var(--dsw-alias-label-secondary);padding:6px 12px;font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}",
			".dph_segBtnOn{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600}",
			".dph_list{display:flex;flex-direction:column;gap:8px}",
			".dph_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}",
			".dph_cardTop{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
			".dph_name{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_owner{font-size:12px;color:var(--dsw-alias-label-tertiary)}",
			".dph_stars{font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
			".dph_tags{display:flex;gap:6px;flex-wrap:wrap}",
			".dph_tag{border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:1px 8px;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
			".dph_tagOk{color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary)}",
			".dph_tagBad{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}",
			".dph_desc{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary);margin:0}",
			".dph_cmdRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			".dph_cmd{flex:1;min-width:200px;box-sizing:border-box;background:var(--dsw-alias-bg-layer-3);border-radius:6px;padding:6px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--dsw-alias-label-primary);overflow-x:auto;white-space:nowrap}",
			".dph_cmdMissing{font-size:12px;color:var(--dsw-alias-label-tertiary)}",
			".dph_notice{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:14px;font-size:13px;color:var(--dsw-alias-label-secondary)}",
			".dph_noticeBad{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".dph_footer{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.6}",
			".dph_tel{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);cursor:pointer;user-select:none}",
			".dph_lb{box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;gap:8px;width:calc(100% + 8px);height:34px;margin:4px -4px;color:var(--dsw-alias-label-primary);background:transparent;border:none;border-radius:12px;padding:6px 2px 6px 10px;font:inherit;font-size:14px;line-height:22px;text-align:left;cursor:pointer;transition:background .12s}",
			".dph_lb:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dph_lbLabel{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dph_lbOff .dph_lb{justify-content:center;width:36px;height:36px;margin:2px 0;border-radius:50%;padding:0;gap:0}",
			".dph_lbMark{font-size:13px;font-weight:600;color:var(--dsw-alias-state-business-primary)}",
			"div:has(> [data-slot=\"sidebar.footer.action\"]){flex-direction:column}",
			".dph_ovWrap{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:8px}",
			".dph_pill{display:flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 6px 20px rgba(0,0,0,.14);cursor:grab;touch-action:none;user-select:none;font:inherit;font-size:13px;font-weight:600}",
			".dph_pill:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dph_pillMark{color:var(--dsw-alias-state-business-primary)}",
			".dph_panel{width:400px;max-width:calc(100vw - 32px);max-height:min(72vh,620px);display:flex;flex-direction:column;gap:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.22);padding:14px}",
			".dph_panelHead{display:flex;align-items:center;gap:8px}",
			".dph_panelTitle{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_panelBody{display:flex;flex-direction:column;gap:8px;overflow-y:auto;margin-right:-4px;padding-right:4px}",
			".dph_panelFoot{display:flex;align-items:center;gap:8px;justify-content:space-between;border-top:1px solid var(--dsw-alias-border-l2);padding-top:8px;cursor:default}",
			".dph_close{border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:16px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}",
			".dph_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dph_cardSm{padding:10px 12px;gap:6px}",
			".dph_instRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			".dph_btnPrimary{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);font-weight:600}",
			".dph_btn:disabled{opacity:.55;cursor:not-allowed}",
			".dph_instMsg{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".dph_instOk{color:var(--dsw-alias-state-business-primary)}",
			".dph_instBad{color:var(--dsw-alias-state-error-primary)}",
			".dph_instHint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
			".dph_sell{display:flex;align-items:flex-start;gap:6px;font-size:12px;line-height:1.6}",
			".dph_sellTag{flex:none;border:1px solid var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);border-radius:4px;padding:0 5px;font-size:11px;line-height:16px}",
			".dph_sellText{color:var(--dsw-alias-label-primary);font-weight:500}",
			".dph_raw{color:var(--dsw-alias-label-tertiary)}",
			".dph_drag{cursor:grab;touch-action:none;user-select:none}",
			".dph_drag:active{cursor:grabbing}",
		].join("");
		const tagId = "dsh-dpharness/client.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-dpharness";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		/* ---------------------------------------------------------------- locales */
		const NS = "dpharness";
		/* 目录站点；改这里的同时要改 host 侧 lib/index.js 的 SITE / UPSTREAM / TRACK。 */
		const SITE = "https://dpharness.com";
		const TAKE_OPTIONS = [30, 60, 100];
		const zh = {
			"view.tab": "严选插件",
			"view.title": "dsh 严选插件",
			"view.sub": "只推装得上的 · 数据来源 dpharness.com",
			"search.placeholder": "搜索插件名称 / 描述 / 作者…",
			"sort.default": "综合",
			"sort.stars": "按 Star",
			"action.refresh": "刷新",
			"action.openSite": "打开站点",
			"action.copy": "复制命令",
			"action.copied": "已复制",
			"action.open": "严选插件",
			"action.close": "收起",
			"action.drag": "可拖动调整位置",
			"count.summary": "共 {n} 条结果",
			"state.loading": "正在读取插件目录…",
			"state.empty": "没有匹配的插件。换个关键词试试。",
			"state.failed": "读取失败",
			"cmd.missing": "站点未给出已验证的 npm 包名，请到插件页确认安装方式",
			"badge.stars": "★ {n}",
			"label.sell": "卖点",
			"label.untranslated": "未汉化",
			"footer.hint": "网页无法自动安装：复制命令到终端执行，装完重启 dsh 才会生效。命令里的 --profile web 不可省略。",
			"telemetry.on": "匿名统计（不含搜索内容）",
			"install.action": "安装",
			"install.confirm": "确认安装？",
			"install.cancel": "取消",
			"install.running": "正在安装…",
			"install.market": "通过 dshmarket 安装中…",
			"install.local": "正在安装（需要重启生效）…",
			"install.okMarket": "已安装，无需重启",
			"install.okLocal": "已安装，重启 dsh 后生效",
			"install.restart": "立即重启",
			"install.failed": "安装失败",
			"install.busy": "已有安装任务在进行",
			"install.hint": "安装会在你的 dsh 里执行 dsh plugin add，来源为下方命令中的包名。",
		};
		const en = {
			"view.tab": "Curated",
			"view.title": "dsh curated plugins",
			"view.sub": "Only installable ones · source dpharness.com",
			"search.placeholder": "Search name / description / owner…",
			"sort.default": "Relevance",
			"sort.stars": "By stars",
			"action.refresh": "Refresh",
			"action.openSite": "Open site",
			"action.copy": "Copy command",
			"action.copied": "Copied",
			"action.open": "Curated",
			"action.close": "Collapse",
			"action.drag": "Drag to reposition",
			"count.summary": "{n} results",
			"state.loading": "Loading the catalog…",
			"state.empty": "No matching plugin. Try another keyword.",
			"state.failed": "Failed to load",
			"cmd.missing": "No verified npm package name on record — check the plugin page for the install method",
			"badge.stars": "★ {n}",
			"label.sell": "Highlight",
			"label.untranslated": "Not translated",
			"footer.hint": "A web page cannot install plugins: copy the command into a terminal, then restart dsh. The --profile web flag is mandatory.",
			"telemetry.on": "Anonymous stats (no search text)",
			"install.action": "Install",
			"install.confirm": "Confirm install?",
			"install.cancel": "Cancel",
			"install.running": "Installing…",
			"install.market": "Installing via dshmarket…",
			"install.local": "Installing (restart required)…",
			"install.okMarket": "Installed, no restart needed",
			"install.okLocal": "Installed — restart dsh to activate",
			"install.restart": "Restart now",
			"install.failed": "Install failed",
			"install.busy": "Another install is already running",
			"install.hint": "Install runs dsh plugin add inside your dsh, using the package name in the command below.",
		};

		/* ------------------------------------------------------------- telemetry */
		/* 事件经本地 dsh host 转发到 dpharness.com/api/track/event：
		   站点端点不带 CORS 头，浏览器跨源直发不成立（实测）。
		   隐私口径：不发送搜索关键词原文，只发长度与命中数；可整体关闭。 */
		const TEL_KEY = "dph-hub-telemetry";
		const VID_KEY = "dph-hub-vid";
		let telemetryOn = true;
		try {
			telemetryOn = localStorage.getItem(TEL_KEY) !== "0";
		} catch (error) {
			/* localStorage 不可用时保持默认开 */
		}

		function visitorId() {
			try {
				const existing = localStorage.getItem(VID_KEY);
				if (existing) return existing;
				const generated = (crypto && crypto.randomUUID) ? crypto.randomUUID() : "dsh-hub-" + String(Date.now());
				localStorage.setItem(VID_KEY, generated);
				return generated;
			} catch (error) {
				return "";
			}
		}

		function track(event, detail) {
			if (!telemetryOn) return;
			try {
				fetch("/api/dpharness/event", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ event, detail: detail || {}, visitorId: visitorId() }),
					keepalive: true,
				}).catch(() => {});
			} catch (error) {
				/* 埋点失败静默忽略，绝不影响 UI */
			}
		}

		/* --------------------------------------------------------------- installer */
		/* 两条路径，安全优先：
		   ① 复用已装的 dshmarket 的同源 HTTP 路由（免重启热挂载、可回滚）；
		      它只接受自己 curated registry（awesome 目录）里的 url，不在其中会返回 400；
		   ② 降级到本插件 host 路由，直接 spawn `dsh plugin add`（改 profile，需重启生效）。
		   已在运行 agent 时 dshmarket 会返回 409 —— 这种情况不降级，避免把插件文件写坏。 */
		const MARKET_INSTALL = "/dsh-market/install";
		const MARKET_STATUS = "/dsh-market/status";
		const LOCAL_INSTALL = "/api/dpharness/install";
		const INSTALL_POLL_MS = 1200;
		const INSTALL_MAX_MS = 5 * 60 * 1000;

		const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

		async function requestJson(url, options) {
			try {
				const response = await fetch(url, options);
				let data = null;
				try { data = await response.json(); } catch (error) { data = null; }
				return { status: response.status, data };
			} catch (error) {
				return { status: 0, data: null, error: String((error && error.message) || error) };
			}
		}

		const postJson = (url, body) => requestJson(url, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body || {}),
		});

		const getJson = (url) => requestJson(url, { cache: "no-store" });

		function messageOf(result, fallback) {
			const data = result && result.data;
			if (data && typeof data.error === "string" && data.error) return data.error.slice(0, 200);
			if (result && result.error) return result.error;
			return fallback + "（HTTP " + (result ? result.status : "?") + "）";
		}

		async function pollMarketInstall(deadline) {
			while (Date.now() < deadline) {
				await sleep(INSTALL_POLL_MS);
				const status = await getJson(MARKET_STATUS);
				if (status.status !== 200 || !status.data) return { ok: false, message: messageOf(status, "dshmarket status unavailable") };
				if (status.data.active === false && status.data.busy === false) {
					if (status.data.error) return { ok: false, message: String(status.data.error).slice(0, 200) };
					return { ok: true, market: true };
				}
			}
			return { ok: false, message: "timeout" };
		}

		async function pollLocalInstall(deadline) {
			while (Date.now() < deadline) {
				await sleep(INSTALL_POLL_MS);
				const status = await getJson(LOCAL_INSTALL);
				const job = status.data && status.data.job;
				if (status.status !== 200 || !job) return { ok: false, message: messageOf(status, "install status unavailable") };
				if (job.active === false) {
					if (job.code === 0) return { ok: true, market: false };
					return { ok: false, message: String(job.error || job.tail || ("exit code " + job.code)).slice(0, 200) };
				}
			}
			return { ok: false, message: "timeout" };
		}

		async function runInstall(item, t) {
			const target = item.pkg;
			if (!target) return;
			const deadline = Date.now() + INSTALL_MAX_MS;
			setHub({ install: { active: true, target, phase: "market", message: t("install.market") } });
			track("plugin_hub", { action: "install" });

			let done = null;
			if (item.url) {
				const market = await postJson(MARKET_INSTALL, { url: item.url });
				if (market.status === 200) {
					done = await pollMarketInstall(deadline);
				} else if (market.status === 400 || market.status === 404 || market.status === 0) {
					done = null;
				} else {
					setHub({ install: { active: false, target, phase: "failed", message: messageOf(market, t("install.failed")) } });
					return;
				}
			}
			if (done === null) {
				setHub({ install: { active: true, target, phase: "local", message: t("install.local") } });
				const local = await postJson(LOCAL_INSTALL, { pkg: target });
				if (local.status !== 202) {
					setHub({ install: { active: false, target, phase: "failed", message: messageOf(local, t("install.failed")) } });
					return;
				}
				done = await pollLocalInstall(deadline);
			}
			setHub({
				install: {
					active: false,
					target,
					phase: done.ok ? (done.market ? "okMarket" : "okLocal") : "failed",
					message: done.ok ? t(done.market ? "install.okMarket" : "install.okLocal") : done.message,
				},
			});
			if (done.ok) track("plugin_hub", { action: done.market ? "installed_market" : "installed_local" });
		}

		/** 仅在降级路径（改了 profile）后需要；/api/restart 由 dsh-restart 插件提供（POST）。 */
		async function restartServer() {
			const result = await postJson("/api/restart", {});
			return result.status >= 200 && result.status < 300;
		}

		/* ------------------------------------------------------------------ store */
		/* 三个入口共享的轻量 store；不依赖 dsh 内部 store，避免猜测未验证的 API。 */
		const hub = { open: false, telemetry: telemetryOn, install: null, listeners: new Set() };
		function setHub(patch) {
			Object.assign(hub, patch);
			hub.listeners.forEach((listener) => listener());
		}
		function useHub() {
			const [, force] = react.useState(0);
			react.useEffect(() => {
				const listener = () => force((n) => n + 1);
				hub.listeners.add(listener);
				return () => { hub.listeners.delete(listener); };
			}, []);
			return hub;
		}

		/* ------------------------------------------------------------- utilities */
		function format(template, values) {
			return String(template).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole));
		}

		/* ------------------------------------------------------------ 浮窗位置（可拖动） */
		/* 为什么要能拖：右下角在 dsh 里不是空位 —— 实测与「检查更新」等既有按钮重叠。
		   拖动后位置记在 localStorage（right/bottom，单位 px），下次进来还在原处。 */
		const POS_KEY = "dph-hub-pos";
		const EDGE = 8;
		const DRAG_THRESHOLD = 5;
		/**
		 * 默认位置刻意**不贴右下角**。
		 * 实测（1280×860，2026-09-17）：dsh 自身的「检查更新」按钮
		 * `#dsh-check-updates-btn` 位于 right:16 / bottom:16 / 94×32，
		 * 且 z-index 同为 2147483000 —— 与贴角的胶囊**完全重叠**，并在 DOM 中更靠后，
		 * 于是胶囊被压住、点不到（playwright 报元素拦截点击）。
		 * 故默认抬高到它上方（16 + 32 + 12 = 60），首次出现即不冲突；
		 * 用户仍可拖动，位置会记住。
		 */
		const DEFAULT_POS = { right: 16, bottom: 60 };

		function viewportSize() {
			return {
				w: typeof window === "undefined" ? 1440 : window.innerWidth,
				h: typeof window === "undefined" ? 900 : window.innerHeight,
			};
		}

		/** 夹在视口内（留 EDGE 边距）。纯函数，便于测试。 */
		function clampPos(pos, size, view) {
			const right = Math.max(EDGE, Math.min(Number(pos && pos.right) || EDGE, Math.max(EDGE, view.w - size.w - EDGE)));
			const bottom = Math.max(EDGE, Math.min(Number(pos && pos.bottom) || EDGE, Math.max(EDGE, view.h - size.h - EDGE)));
			return { right: Math.round(right), bottom: Math.round(bottom) };
		}

		function readStoredPos() {
			try {
				const raw = localStorage.getItem(POS_KEY);
				if (!raw) return DEFAULT_POS;
				const parsed = JSON.parse(raw);
				return clampPos(parsed, { w: 150, h: 38 }, viewportSize());
			} catch (error) {
				return DEFAULT_POS;
			}
		}

		function storePos(pos) {
			try {
				localStorage.setItem(POS_KEY, JSON.stringify(pos));
			} catch (error) {
				/* 隐私模式下不持久化，本次会话内仍可拖 */
			}
		}

		/**
		 * 拖动逻辑：pointer 事件 + 位移阈值区分「点击」与「拖动」。
		 * 返回的函数把 moved 标记交给调用方，用于在 pointerup 后的 click 里跳过打开动作。
		 *
		 * ⚠️ 监听挂在 `window` 上而不是被拖元素上：元素级监听依赖
		 * `setPointerCapture` 成功，而它并非在所有场景都生效（实测面板标题拖不动就是
		 * 因为指针移出元素后 pointermove 不再派发给它）。window 监听无条件收到移动事件。
		 */
		function makeDragHandlers(getPos, setPos, skipClickRef) {
			return function onPointerDown(event) {
				if (event.button !== undefined && event.button !== 0) return; // 只响应左键
				const node = event.currentTarget;
				const start = getPos();
				const startX = event.clientX;
				const startY = event.clientY;
				const rect = node.getBoundingClientRect();
				const size = { w: rect.width || 150, h: rect.height || 38 };
				let moved = false;
				event.preventDefault();
				try {
					node.setPointerCapture(event.pointerId);
				} catch (error) {
					/* 捕获失败也没关系，下面用 window 监听兜住 */
				}
				const onMove = (moveEvent) => {
					const dx = moveEvent.clientX - startX;
					const dy = moveEvent.clientY - startY;
					if (!moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
					moved = true;
					// right/bottom 与指针位移方向相反
					setPos(clampPos({ right: start.right - dx, bottom: start.bottom - dy }, size, viewportSize()));
				};
				const onUp = () => {
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
					window.removeEventListener("pointercancel", onUp);
					try {
						node.releasePointerCapture(event.pointerId);
					} catch (error) {
						/* ignore */
					}
					if (moved) {
						skipClickRef.current = true;
						storePos(getPos());
					}
				};
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
				window.addEventListener("pointercancel", onUp);
			};
		}

		function copyText(text, done) {			const fallback = () => {
				const area = document.createElement("textarea");
				area.value = text;
				area.setAttribute("readonly", "");
				area.style.position = "absolute";
				area.style.left = "-9999px";
				document.body.appendChild(area);
				area.select();
				try {
					document.execCommand("copy");
				} catch (error) {
					/* 剪贴板不可用时静默降级 */
				}
				document.body.removeChild(area);
				done();
			};
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(text).then(done, fallback);
				return;
			}
			fallback();
		}

		function useCatalog(t) {
			const [keyword, setKeyword] = react.useState("");
			const [debounced, setDebounced] = react.useState("");
			const [take, setTake] = react.useState(TAKE_OPTIONS[0]);
			const [byStars, setByStars] = react.useState(false);
			const [reload, setReload] = react.useState(0);
			const [state, setState] = react.useState({ loading: true, data: null, error: null });
			const [copiedCmd, setCopiedCmd] = react.useState("");
			const abortRef = react.useRef(null);

			react.useEffect(() => {
				const id = setTimeout(() => setDebounced(keyword.trim()), keyword ? 320 : 0);
				return () => clearTimeout(id);
			}, [keyword]);

			react.useEffect(() => {
				if (abortRef.current) abortRef.current.abort();
				const controller = new AbortController();
				abortRef.current = controller;
				const timer = setTimeout(() => controller.abort(), 20000);
				setState((previous) => ({ loading: true, data: previous.data, error: null }));
				const params = new URLSearchParams();
				if (debounced) params.set("q", debounced);
				params.set("take", String(take));
				if (byStars) params.set("sort", "stars");
				fetch("/api/dpharness/search?" + params.toString(), { cache: "no-store", signal: controller.signal })
					.then((response) => response.json().then((body) => ({ status: response.status, body })))
					.then((result) => {
						if (controller.signal.aborted) return;
						if (result.status !== 200 || !result.body || result.body.ok !== true) {
							throw new Error((result.body && result.body.error) || ("HTTP " + result.status));
						}
						setState({ loading: false, data: result.body, error: null });
						if (debounced) {
							// 只上报关键词长度与命中数，不上报关键词原文
							track("plugin_hub", { action: "search", length: debounced.length, results: result.body.count });
						}
					})
					.catch((error) => {
						if (controller.signal.aborted) return;
						const message = error && error.name === "AbortError" ? "timeout" : String((error && error.message) || error);
						setState((previous) => ({ loading: false, data: previous.data, error: message }));
					})
					.finally(() => clearTimeout(timer));
				return () => clearTimeout(timer);
			}, [debounced, take, byStars, reload]);

			const markCopied = react.useCallback((text) => {
				setCopiedCmd(text);
				setTimeout(() => setCopiedCmd((current) => (current === text ? "" : current)), 2000);
			}, []);

			return {
				keyword, setKeyword, take, setTake, byStars, setByStars,
				refresh: () => setReload((n) => n + 1),
				state, copiedCmd, markCopied,
				plugins: state.data && Array.isArray(state.data.plugins) ? state.data.plugins : [],
			};
		}

		/* ------------------------------------------------------------ components */
		function makeUi(t) {
			function badge(label, kind) {
				const cls = kind === "ok" ? "dph_tag dph_tagOk" : kind === "bad" ? "dph_tag dph_tagBad" : "dph_tag";
				return h("span", { className: cls, key: label }, label);
			}

			function tagsOf(item) {
				const tags = [];
				// 中文分类放最前 —— 它是"这东西是干什么的"的第一眼信息
				if (item.cat) tags.push(badge(item.cat, null));
				if (item.tier) tags.push(badge(item.tier, item.tier === "core" ? "ok" : null));
				if (item.compat) tags.push(badge(item.compat, null));
				if (item.verify === "pass") tags.push(badge("verify: pass", "ok"));
				else if (item.verify === "fail") tags.push(badge("verify: fail", "bad"));
				if (item.tested === "passed") tags.push(badge("tested", "ok"));
				if (item.risk && item.risk !== "low") tags.push(badge("risk: " + item.risk, item.risk === "high" ? "bad" : null));
				return tags;
			}

			/* −−− 一键安装：二次确认 → 执行 → 进度 → 结果（失败/需重启） −−− */
			function InstallRow(props) {
				const item = props.item;
				const state = useHub();
				const [confirming, setConfirming] = react.useState(false);
				const [restarting, setRestarting] = react.useState(false);
				const [restartFailed, setRestartFailed] = react.useState(false);
				if (!item.pkg) return null;

				const job = state.install;
				const mine = job && job.target === item.pkg;
				const busyElsewhere = !!(job && job.active && !mine);

				if (mine && job.active) {
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instMsg", key: "msg" }, job.message),
					]);
				}

				if (mine && (job.phase === "okMarket" || job.phase === "okLocal")) {
					const needsRestart = job.phase === "okLocal";
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instMsg dph_instOk", key: "msg" }, job.message),
						needsRestart
							? h("button", {
									className: "dph_btn dph_btnPrimary",
									key: "restart",
									type: "button",
									disabled: restarting,
									onClick: async () => {
										setRestarting(true);
										const ok = await restartServer();
										setRestarting(false);
										if (!ok) setRestartFailed(true);
									},
								}, t("install.restart"))
							: null,
						needsRestart && restartFailed
							? h("span", { className: "dph_instMsg dph_instBad", key: "fail" }, "重启接口不可用，请手动重启 dsh")
							: null,
					]);
				}

				if (mine && job.phase === "failed") {
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instMsg dph_instBad", key: "msg" }, t("install.failed") + "：" + job.message),
					]);
				}

				if (confirming) {
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instHint", key: "hint" }, t("install.hint")),
						h("button", {
							className: "dph_btn dph_btnPrimary",
							key: "go",
							type: "button",
							onClick: () => {
								setConfirming(false);
								runInstall(item, t);
							},
						}, t("install.confirm")),
						h("button", { className: "dph_btn", key: "cancel", type: "button", onClick: () => setConfirming(false) }, t("install.cancel")),
					]);
				}

				return h("div", { className: "dph_instRow" }, [
					h("button", {
						className: "dph_btn dph_btnPrimary",
						key: "install",
						type: "button",
						disabled: busyElsewhere,
						title: busyElsewhere ? t("install.busy") : item.pkg,
						onClick: () => setConfirming(true),
					}, busyElsewhere ? t("install.busy") : t("install.action")),
					h("span", { className: "dph_instHint", key: "pkg" }, item.pkg),
				]);
			}

			function renderCard(item, copiedCmd, onCopied, compact) {
				const title = item.nameZh || item.name || item.fullName || "";
				const tags = tagsOf(item);
				// 卖点行：站点 tagline 经严格过滤后的结果；没有就不占位（宁可不显示，也不放英文原文或垃圾串）
				const sellRow = item.sell
					? h("div", { className: "dph_sell", key: "sell" }, [
							h("span", { className: "dph_sellTag", key: "tag" }, t("label.sell")),
							h("span", { className: "dph_sellText", key: "text" }, item.sell),
						])
					: null;
				// 描述：汉化正文优先；没有汉化才回落到英文原文，并明确标注
				const descRow = item.descZh
					? h("p", { className: "dph_desc", key: "desc" }, item.descZh)
					: item.desc
						? h("p", { className: "dph_desc", key: "desc" }, [
								h("span", { className: "dph_raw", key: "raw" }, item.desc),
								h("span", { className: "dph_tag", key: "unzh" }, t("label.untranslated")),
							])
						: null;
				const cmdRow = item.cmd
					? h("div", { className: "dph_cmdRow", key: "cmd" }, [
							h("code", { className: "dph_cmd", key: "code" }, item.cmd),
							h("button", {
								className: "dph_btn",
								key: "copy",
								type: "button",
								onClick: () => copyText(item.cmd, () => {
									onCopied(item.cmd);
									// 与站点 InstallBlock 同口径：value 传整条命令
									track("copy_install", { cmd: item.cmd, pkg: item.pkg || "" });
								}),
							}, copiedCmd === item.cmd ? t("action.copied") : t("action.copy")),
						])
					: h("div", { className: "dph_cmdMissing", key: "cmd" }, t("cmd.missing"));

				return h("div", { className: "dph_card" + (compact ? " dph_cardSm" : ""), key: item.fullName || title }, [
					h("div", { className: "dph_cardTop", key: "top" }, [
						h("span", { className: "dph_name", key: "name" }, title),
						item.owner ? h("span", { className: "dph_owner", key: "owner" }, "@" + item.owner) : null,
						h("span", { className: "dph_spacer", key: "gap" }),
						h("span", { className: "dph_stars", key: "stars" }, format(t("badge.stars"), { n: item.stars })),
						item.url
							? h("a", { className: "dph_btn", key: "link", href: item.url, target: "_blank", rel: "noopener noreferrer" }, "GitHub")
							: null,
					]),
					tags.length ? h("div", { className: "dph_tags", key: "tags" }, tags) : null,
					sellRow,
					descRow,
					h(InstallRow, { item: item, key: "install" }),
					cmdRow,
				]);
			}

			function Notice(props) {
				return h("div", { className: "dph_notice" + (props.kind === "bad" ? " dph_noticeBad" : "") }, props.text);
			}

			function seg(options, current, onPick) {
				return h("div", { className: "dph_seg" }, options.map((option) =>
					h("button", {
						className: "dph_segBtn" + (current === option.value ? " dph_segBtnOn" : ""),
						key: String(option.value),
						type: "button",
						onClick: () => onPick(option.value),
					}, option.label)));
			}

			function controls(cat) {
				return h("div", { className: "dph_bar", key: "bar" }, [
					h("input", {
						className: "dph_input",
						key: "input",
						type: "search",
						value: cat.keyword,
						placeholder: t("search.placeholder"),
						onChange: (event) => cat.setKeyword(event.target.value),
					}),
					h("span", { key: "sort" }, seg([
						{ value: false, label: t("sort.default") },
						{ value: true, label: t("sort.stars") },
					], cat.byStars, cat.setByStars)),
					h("span", { key: "take" }, seg(TAKE_OPTIONS.map((n) => ({ value: n, label: String(n) })), cat.take, cat.setTake)),
				]);
			}

			function telemetryToggle() {
				return h("label", { className: "dph_tel", key: "tel" }, [
					h("input", {
						key: "box",
						type: "checkbox",
						checked: hub.telemetry,
						onChange: (event) => {
							const next = event.target.checked;
							try { localStorage.setItem(TEL_KEY, next ? "1" : "0"); } catch (error) { /* ignore */ }
							setHub({ telemetry: next });
							telemetryOn = next;
						},
					}),
					h("span", { key: "label" }, t("telemetry.on")),
				]);
			}

			/* −−− 入口 1：会话视图页签（完整页） −−− */
			function CatalogView() {
				const cat = useCatalog(t);
				const data = cat.state.data;
				return h("div", { className: "dph_root" }, [
					h("div", { className: "dph_header", key: "header" }, [
						h("h2", { className: "dph_title", key: "title" }, t("view.title")),
						h("span", { className: "dph_sub", key: "sub" }, data ? format(t("count.summary"), { n: data.count }) + " · " + t("view.sub") : t("view.sub")),
						h("span", { className: "dph_spacer", key: "gap" }),
						h("a", { className: "dph_btn", key: "site", href: SITE + "/plugins", target: "_blank", rel: "noopener noreferrer" }, t("action.openSite")),
						h("button", { className: "dph_btn", key: "refresh", type: "button", onClick: cat.refresh }, t("action.refresh")),
					]),
					controls(cat),
					cat.state.error ? h(Notice, { key: "error", kind: "bad", text: t("state.failed") + "：" + cat.state.error }) : null,
					cat.state.loading && cat.plugins.length === 0 ? h(Notice, { key: "loading", text: t("state.loading") }) : null,
					!cat.state.loading && !cat.state.error && cat.plugins.length === 0 ? h(Notice, { key: "empty", text: t("state.empty") }) : null,
					h("div", { className: "dph_list", key: "list" }, cat.plugins.map((item) => renderCard(item, cat.copiedCmd, cat.markCopied, false))),
					h("div", { className: "dph_footer", key: "hint" }, t("footer.hint")),
					h("div", { className: "dph_footer", key: "tel" }, telemetryToggle()),
				]);
			}

			/* −−− 入口 2：左下常驻按钮 −−− */
			function FooterEntry(props) {
				const wide = props && props.wide;
				const state = useHub();
				return h("div", { className: wide ? "dph_lbWide" : "dph_lbOff" }, [
					h("button", {
						className: "dph_lb",
						key: "button",
						type: "button",
						title: t("action.open"),
						"aria-label": t("action.open"),
						onClick: () => {
							const next = !state.open;
							setHub({ open: next });
							if (next) track("plugin_hub", { action: "open", scope: "footer" });
						},
					}, [
						h("span", { className: "dph_lbMark", key: "mark" }, "严"),
						wide ? h("span", { className: "dph_lbLabel", key: "label" }, t("action.open")) : null,
					]),
				]);
			}

			/* −−− 入口 3：全站浮窗（shell.overlay，跨路由） −−− */
			function OverlayEntry() {
				const state = useHub();
				const cat = useCatalog(t);
				const [pos, setPos] = react.useState(readStoredPos);
				const posRef = react.useRef(pos);
				posRef.current = pos;
				const skipClickRef = react.useRef(false);
				const panelRef = react.useRef(null);
				const onDrag = makeDragHandlers(() => posRef.current, setPos, skipClickRef);

				/**
				 * 展开时按**面板实际尺寸**重新夹取位置。
				 *
				 * 为什么必须这么做（2026-09-17 拖动验证实测发现）：夹取只按胶囊尺寸（150×38）算时，
				 * 锚点可以停在很靠上的位置；而面板最高 72vh（约 620px）且以 bottom 定位，
				 * 于是面板顶部会**跑到视口外**，标题与上半部分既看不见也点不到
				 * （探针表现为 `elementFromPoint` 返回 null、拖动无效）。
				 * 用 ResizeObserver 跟随面板高度变化（内容加载会改高度）重新夹取。
				 */
				react.useEffect(() => {
					if (!state.open) return undefined;
					const element = panelRef.current;
					if (element === null) return undefined;
					const apply = () => {
						const rect = element.getBoundingClientRect();
						const next = clampPos(posRef.current, { w: rect.width || 400, h: rect.height || 560 }, viewportSize());
						if (next.right !== posRef.current.right || next.bottom !== posRef.current.bottom) {
							setPos(next);
							storePos(next);
						}
					};
					apply();
					if (typeof ResizeObserver === "undefined") return undefined;
					const observer = new ResizeObserver(apply);
					observer.observe(element);
					return () => observer.disconnect();
				}, [state.open]);

				// 视口变化时把浮窗夹回可见范围（拖动只保证当时合法）
				react.useEffect(() => {
					const onResize = () => {
						const next = clampPos(posRef.current, { w: 150, h: 38 }, viewportSize());
						if (next.right !== posRef.current.right || next.bottom !== posRef.current.bottom) {
							setPos(next);
							storePos(next);
						}
					};
					window.addEventListener("resize", onResize);
					return () => window.removeEventListener("resize", onResize);
				}, []);

				const anchor = { right: pos.right + "px", bottom: pos.bottom + "px" };

				if (!state.open) {
					return h("div", { className: "dph_ovWrap", style: anchor }, [
						h("button", {
							className: "dph_pill",
							key: "pill",
							type: "button",
							title: t("action.open") + " · " + t("action.drag"),
							"aria-label": t("action.open"),
							onPointerDown: onDrag,
							onClick: () => {
								// 拖动结束会跟一个 click，用标记跳过，避免"拖一下就打开"
								if (skipClickRef.current) {
									skipClickRef.current = false;
									return;
								}
								setHub({ open: true });
								track("plugin_hub", { action: "open", scope: "overlay" });
							},
						}, [
							h("span", { className: "dph_pillMark", key: "mark" }, "严"),
							h("span", { key: "label" }, t("action.open")),
						]),
					]);
				}
				const data = cat.state.data;
				return h("div", { className: "dph_ovWrap", style: anchor }, [
					h("div", { className: "dph_panel", key: "panel", ref: panelRef }, [
						h("div", { className: "dph_panelHead", key: "head" }, [
							h("span", {
								className: "dph_panelTitle dph_drag",
								key: "title",
								title: t("action.drag"),
								onPointerDown: onDrag,
							}, t("view.title")),
							h("span", { className: "dph_sub", key: "sub" }, data ? format(t("count.summary"), { n: data.count }) : ""),
							h("span", { className: "dph_spacer", key: "gap" }),
							h("a", { className: "dph_btn", key: "site", href: SITE + "/plugins", target: "_blank", rel: "noopener noreferrer", onClick: () => track("plugin_hub", { action: "site_click", scope: "overlay" }) }, t("action.openSite")),
							h("button", { className: "dph_close", key: "close", type: "button", title: t("action.close"), "aria-label": t("action.close"), onClick: () => setHub({ open: false }) }, "×"),
						]),
						controls(cat),
						cat.state.error ? h(Notice, { key: "error", kind: "bad", text: t("state.failed") + "：" + cat.state.error }) : null,
						cat.state.loading && cat.plugins.length === 0 ? h(Notice, { key: "loading", text: t("state.loading") }) : null,
						!cat.state.loading && !cat.state.error && cat.plugins.length === 0 ? h(Notice, { key: "empty", text: t("state.empty") }) : null,
						h("div", { className: "dph_panelBody", key: "body" }, cat.plugins.map((item) => renderCard(item, cat.copiedCmd, cat.markCopied, true))),
						h("div", { className: "dph_panelFoot", key: "foot" }, [
							telemetryToggle(),
							h("span", { key: "hint", className: "dph_footer" }, t("footer.hint")),
						]),
					]),
				]);
			}

			return { CatalogView, FooterEntry, OverlayEntry };
		}

		/* ---------------------------------------------------------------- plugin */
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dpharness: dictionaries");
			const t = ctx.locale.bind(NS);
			const ui = makeUi(t);

			ctx.slots.inject(
				"conversation.view",
				() =>
					ctx.slots.register(
						{ name: "conversation.view", id: "dpharness", order: 20, locale: NS, label: () => t("view.tab"), inject: () => ({}) },
						ui.CatalogView,
					),
			);

			ctx.slots.inject(
				"sidebar.footer.action",
				() =>
					ctx.slots.register(
						{ name: "sidebar.footer.action", id: "dpharness", order: 12, locale: NS, label: () => t("action.open"), inject: () => ({}) },
						ui.FooterEntry,
					),
			);

			ctx.slots.inject(
				"shell.overlay",
				() =>
					ctx.slots.register(
						{ name: "shell.overlay", id: "dpharness", order: 12, locale: NS, label: () => t("action.open"), inject: () => ({}) },
						ui.OverlayEntry,
					),
			);
		}

		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		/* 供测试使用：位置夹取是纯函数，单独导出便于断言边界 */
		exports.clampPos = clampPos;
		return module.exports;
	},
});
