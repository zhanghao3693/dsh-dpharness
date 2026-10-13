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
			".dph_cmdWrap{display:flex;flex-direction:column;gap:4px}",
			/* 视图切换（严选推荐 / 分类精选）：复用既有 `.dph_seg`，
			   只加一层包裹让它铺满面板宽度。
			   ⚠️ 不要重定义 .dph_seg / .dph_segBtn —— 排序与数量控件也在用它们，
			   重复定义会**覆盖既有样式**（2026-09-18 自己踩过：加了同名定义且排在后面，
			   把既有的两个控件改了观感）。用包裹层提高特异性即可。 */
			".dph_segWrap{display:flex}",
			".dph_segWrap .dph_seg{flex:1}",
			".dph_segWrap .dph_segBtn{flex:1}",
			/* 分类精选：大类（可折叠）→ 小类 → 条目
			   ⚠️ `flex:none` 不可省（2026-09-18 实测踩到，用户截图暴露）：
			   `.dph_panelBody` 是 `display:flex; flex-direction:column`，而本元素有
			   `overflow:hidden`（为了圆角）。规范规定 flex 子项的**自动最小高度只在
			   overflow:visible 时生效** —— 有了 overflow:hidden，最小高度变 0，
			   于是 9 个大类被**压扁成细线**、展开的那个也把卡片压没了（文字被裁掉）。
			   显式 `flex:none` 让它保持内容高度、由面板主体滚动。
			   （「严选推荐」视图没这个问题，因为 .dph_card 没有 overflow:hidden。） */
			".dph_bestCat{flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}",
			".dph_bestCatHead{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:8px 12px;cursor:pointer;list-style:none;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_bestCatHead::-webkit-details-marker{display:none}",
			".dph_bestCatCount{font-size:10px;font-weight:400;color:var(--dsw-alias-label-tertiary)}",
			".dph_bestSub{padding:0 10px 10px}",
			".dph_bestSubHead{display:flex;align-items:baseline;gap:6px;padding:6px 2px 6px;flex-wrap:wrap}",
			".dph_bestSubName{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_bestSubSum{font-size:10px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}",
			".dph_bestItem{display:flex;flex-direction:column;gap:4px}",
			".dph_bestRank{font-size:10px;font-weight:700;color:var(--dsw-alias-state-business-primary)}",
			".dph_bestReason{font-size:10px;color:var(--dsw-alias-label-tertiary);padding-left:2px}",
			/* 套装：槽位行 = 职责（这个位置干什么）→ 插件名 → 必要性标签 → 星标/已装。
			   职责用等宽小字、与名字左对齐两栏，扫一眼能看出"这套配了哪些岗位"。 */
			".dph_setRow{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding:2px 0}",
			".dph_setRole{flex:none;min-width:74px;max-width:110px;font-size:11px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dph_setName{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_cmdBlock{white-space:pre-wrap;word-break:break-all;max-height:132px;overflow:auto}",
			".dph_cmd{flex:1;min-width:200px;box-sizing:border-box;background:var(--dsw-alias-bg-layer-3);border-radius:6px;padding:6px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--dsw-alias-label-primary);overflow-x:auto;white-space:nowrap}",
			".dph_cmdMissing{font-size:12px;color:var(--dsw-alias-label-tertiary)}",
			".dph_notice{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:14px;font-size:13px;color:var(--dsw-alias-label-secondary)}",
			".dph_noticeBad{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".dph_footer{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.6}",
			".dph_tel{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);cursor:pointer;user-select:none}",
			/* 与自研三件套（归档/官网/重启）同一套原生行规格 */
			".dph_lbWide{display:flex;width:100%;align-self:stretch;min-width:0}",
			".dph_lbOff{display:flex;justify-content:center;width:100%;align-self:stretch;min-width:0}",
			".dph_lb{box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;height:40px;margin:2px 0;color:var(--dsw-alias-label-primary);background:transparent;border:none;border-radius:12px;padding:0 10px 0 8px;font:inherit;font-size:14px;line-height:22px;text-align:left;cursor:pointer;transition:background .12s}",
			".dph_lb:focus-visible{outline:2px solid var(--dsw-specific-accent-primary,#4f46e5);outline-offset:1px}",
			".dph_lb:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dph_lbLabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}",
			".dph_lbOff .dph_lb{justify-content:center;width:36px;height:36px;margin:2px 0;border-radius:50%;padding:0;gap:0}",
			".dph_lbMark{flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;font-size:13px;font-weight:600;line-height:1;color:var(--dsw-alias-state-business-primary)}",
			/* 「上劲」态：浮窗被用户关掉后，点一下侧边栏按钮不恢复，只进入待确认——
			   必须给可见反馈（描边 + 标记脉冲），否则用户以为点击又没生效
			   （2026-10-13 实测：纯无反馈的按钮直接被当成坏的）。5 秒不跟进自动解除。 */
			".dph_lbArmed{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-state-business-primary)}",
			".dph_lbArmed .dph_lbMark{animation:dphArmPulse 1s ease-in-out infinite}",
			"@keyframes dphArmPulse{50%{opacity:.4}}",
			"div:has(> [data-slot=\"sidebar.footer.action\"]){flex-direction:column;align-items:stretch}",
			".dph_ovWrap{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:8px}",
			".dph_pillWrap{position:relative;display:flex}",
			/* 右侧多留 16px 给关闭按钮（padding-right 由 14 改 30） */
			".dph_pill{display:flex;align-items:center;gap:8px;height:38px;padding:0 30px 0 14px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 6px 20px rgba(0,0,0,.14);cursor:grab;touch-action:none;user-select:none;font:inherit;font-size:13px;font-weight:600}",
			".dph_pill:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dph_pillMark{color:var(--dsw-alias-state-business-primary)}",
			/* 胶囊上的关闭按钮：**必须是胶囊的兄弟节点，不能嵌进去** ——
			   <button> 里套 <button> 是非法 HTML，且 pointerdown 会冒泡到胶囊上触发拖动。
			   绝对定位盖在胶囊右端，指针根本落不到胶囊本身，拖动与关闭互不干扰。 */
			".dph_pillClose{position:absolute;top:50%;right:4px;transform:translateY(-50%);box-sizing:border-box;width:22px;height:22px;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:14px;line-height:1;padding:0;cursor:pointer}",
			".dph_pillClose:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dph_panel{width:400px;max-width:calc(100vw - 32px);max-height:min(72vh,620px);display:flex;flex-direction:column;gap:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.22);padding:14px}",
			".dph_panelHead{display:flex;align-items:center;gap:8px}",
			".dph_panelTitle{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_panelBody{display:flex;flex-direction:column;gap:8px;overflow-y:auto;margin-right:-4px;padding-right:4px}",
			".dph_panelFoot{display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--dsw-alias-border-l2);padding-top:8px;cursor:default}",
			".dph_footRow{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}",
			".dph_footToggles{display:flex;align-items:center;gap:14px;flex-wrap:wrap}",
			".dph_close{border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:16px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}",
			".dph_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dph_cardSm{padding:10px 12px;gap:6px}",
			".dph_instRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			".dph_instCol{flex-direction:column;align-items:flex-start;gap:4px}",
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
			/* 每日推荐：顶部卡片与专用视图。沿用严选卡片的规格，只加一层「今日」标识，
			   边框用 business 色 —— 它是当天唯一一条，视觉上要和普通列表区分开。 */
			".dph_daily{display:flex;flex-direction:column;gap:6px;flex:none}",
			".dph_dailyHead{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
			".dph_dailyTag{flex:none;border:1px solid var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:600;line-height:16px}",
			".dph_dailyDate{font-size:12px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}",
			".dph_dailyPath{font-size:11px;color:var(--dsw-alias-label-tertiary)}",
			".dph_dailyWhy{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary);margin:0}",
			/* 待重启横幅：本地通道安装/升级后跨视图常驻（2026-10-13）。
			   用 business 色描边 —— 它是一条"待办"，不是错误；生效确认态退回普通边框。 */
			".dph_restart{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:none;padding:8px 12px;border:1px solid var(--dsw-alias-state-business-primary);border-radius:10px;background:var(--dsw-alias-interactive-bg-hover)}",
			".dph_restartOk{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}",
			".dph_restartText{flex:1;min-width:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-primary)}",
			/* 设置页（settings.plugins.tab）与设置行（settings.general.item） */
			".dph_set{display:flex;flex-direction:column;gap:12px}",
			".dph_setTitle{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_setGroup{display:flex;flex-direction:column;gap:12px;border-top:1px solid var(--dsw-alias-border-l2);padding-top:12px}",
			".dph_setRow{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}",
			".dph_setCol{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".dph_setLabel{font-size:13px;color:var(--dsw-alias-label-primary)}",
			".dph_setHint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
			".dph_setState{flex:none;font-size:12px;color:var(--dsw-alias-label-secondary)}",
			/* 更新日志：版本折叠列表。复用 details/summary（与分类精选同一手法）——
			   原生折叠无需自己管状态，键盘可达性也白送。 */
			".dph_log{flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}",
			".dph_logHead{display:flex;align-items:baseline;gap:8px;padding:7px 10px;cursor:pointer;list-style:none;font-size:12px}",
			".dph_logHead::-webkit-details-marker{display:none}",
			".dph_logVer{flex:none;font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}",
			".dph_logDate{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}",
			".dph_logTitle{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dph_logItems{margin:0;padding:0 12px 10px 26px;display:flex;flex-direction:column;gap:4px}",
			".dph_logItems li{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary)}",
			/* 「更新日志」块（浮窗「更新」视图）：外层收起成一行，展开后内层仍是各版本的折叠项 */
			".dph_logNest{display:flex;flex-direction:column;gap:6px;padding:0 10px 10px}",
			".dph_logCmd{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			/* 更新红点。只有颜色没有文字，对读屏用户等于不存在 —— 所以点里塞一段视觉隐藏文案。 */
			".dph_dotWrap{position:relative;display:inline-flex;flex:none}",
			".dph_dot{position:absolute;top:-2px;right:-2px;width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-error-primary);box-shadow:0 0 0 1.5px var(--dsw-alias-bg-layer-1)}",
			".dph_sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}",
			/* 「更新」视图的行：第一行 = 谁 + 版本 + 操作；第二行 = 这是什么 + 包名 */
			".dph_updItem{display:flex;flex-direction:column;gap:5px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);padding:8px 10px;flex:none}",
			".dph_updOn{border-color:var(--dsw-alias-state-error-primary)}",
			".dph_upd{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			".dph_updSub{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
			".dph_updName{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_updVer{font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
			".dph_updNote{font-size:11px;color:var(--dsw-alias-label-tertiary)}",
			".dph_updList{display:flex;flex-direction:column;gap:6px}",
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
			"action.show": "显示浮窗",
			"action.close": "收起",
			"action.drag": "可拖动调整位置",
			"action.hide": "隐藏浮窗",
			"action.hideHint": "隐藏后不会自动回来，误点也不会：连点两下侧边栏「严选插件」可恢复（第二下才生效），或在「严选插件」页底部重新勾选、设置 → 通用 打开开关",
			"action.closedHint": "浮窗已关闭 —— 点这里不会把它叫回来；在「严选插件」页底部重新勾选，或在 设置 → 通用 打开「右下角浮窗」",
			"action.armRestore": "再点一次恢复浮窗",
			"action.expand": "展开面板",
			"action.showFloat": "显示右下角浮窗",
			"settings.tab": "严选插件",
			"settings.title": "严选插件",
			"settings.float": "右下角浮窗",
			"settings.floatHint": "关闭后不再自动出现，误点也不会叫回来。想恢复：连点两下侧边栏「严选插件」（第二下生效），或在「严选插件」页底部重新勾选。",
			"settings.daily": "每日推荐",
			"settings.dailyHint": "每天推荐一个插件，按自然日轮换（同一自然日对所有用户一致）。",
			"settings.check": "自动检查插件更新",
			"settings.checkHint": "打开 dsh 时向 npm 镜像查询已装插件的最新版（每台机器约 20 次只读请求，最多 10 分钟一次）。关掉后红点不再提醒，仍可手动「检查更新」。",
			"settings.telemetry": "匿名统计",
			"settings.on": "已开启",
			"settings.off": "已关闭",
			"settings.reset": "恢复默认",
			"settings.resetHint": "清除浮窗显示、浮窗位置与每日推荐的本地偏好。",
			"settings.resetDone": "已恢复默认。",
			"settings.about": "以上偏好只保存在本机（localStorage），不会上传；匿名统计的开关同样在本页。",
			"daily.tab": "每日推荐",
			"daily.title": "今日推荐",
			"daily.loading": "正在取今日推荐…",
			"daily.empty": "今日推荐暂不可用（榜单数据未就绪）",
			"daily.why": "为什么是它",
			"daily.hint": "每天 00:00（北京时间）换一条，当天对所有用户一致。",
			"daily.expand": "展开",
			"daily.collapse": "收起",
			"changelog.title": "更新日志",
			"changelog.current": "当前版本 v{v}",
			"changelog.loading": "正在读取更新日志…",
			"changelog.failed": "更新日志读取失败（本机 host 未响应）",
			"changelog.newAvailable": "有新版本 v{v}",
			"changelog.upToDate": "已是最新版",
			"changelog.copyUpgrade": "复制升级命令",
			"changelog.hint": "升级后需要重启 dsh 才会生效；命令里的 profile 已按你本机填好。",
			"changelog.noItems": "该版本没有留下说明。",
			"updates.tab": "我的插件",
			"updates.title": "我的插件",
			"updates.dot": "有可用更新",
			"updates.check": "检查更新",
			"updates.checking": "检查中…",
			"updates.self": "本插件",
			"updates.installed": "已安装的插件",
			"updates.outdated": "可升级",
			"updates.upToDate": "已是最新",
			"updates.unknown": "查不到最新版",
			"updates.none": "已安装的插件都是最新版。",
			"updates.summary": "已检查 {n} 个插件 · 可升级 {m} 个",
			"updates.unknownNote": "另有 {k} 个查不到最新版（多半是没发布到 npm 的本地插件），不下结论。",
			"updates.copyCmd": "复制升级命令",
			"updates.failed": "更新检查失败",
			"updates.loading": "正在检查更新…",
			"updates.note": "最新版来自 npmmirror；这里只发只读请求，不会替你安装任何东西。",
			"updates.remove": "卸载",
			"updates.removeConfirm": "确认卸载？",
			"updates.removing": "正在卸载…",
			"updates.removed": "已卸载",
			"updates.removedRestart": "重启 dsh 后彻底移除",
			"updates.nothingToRemove": "本来就没装",
			"updates.ignore": "忽略此版本",
			"updates.ignored": "已忽略 v{v}",
			"updates.unignore": "取消忽略",
			"updates.ignoreHint": "升到 v{v} 之前不再提醒",
			"sets.installAll": "一键安装整套（{n}）",
			"sets.installAllConfirm": "将逐个安装 {n} 个插件（会改本机 profile、需要重启 dsh 才生效）—— 再点一次开始。",
			"sets.installing": "安装中 {done}/{total} · {name}",
			"updates.ackNote": "红点在你打开本页后熄灭，只有再出现更新的版本才会重新亮。",
			"updates.restartConfirm": "确认重启 dsh？重启后当前会话会中断。",
			"updates.upgrade": "升级",
			"updates.upgradeConfirm": "确认升级到最新版？",
			"updates.upgradeHint": "升级会在本机执行 dsh plugin add <包名>@latest，改的是你的 profile，装完需要重启 dsh。",
			"updates.upgradeAll": "全部升级（{n}）",
			"updates.upgradeAllHint": "逐个串行执行（宿主同一时刻只允许一个安装任务），可随时中止；未轮到的项保持原状。",
			"updates.upgradeAllConfirm": "将逐个升级 {n} 个插件（会改写本机 profile、需要重启 dsh）—— 再点一次开始。",
			"updates.batchProgress": "升级中 {done}/{total} · {name}",
			"updates.stop": "中止",
			"updates.batchDone": "已处理 {done} 个 · 失败 {failed} 个",
			"updates.restartNeeded": "有项目经本地通道安装，需要重启 dsh 才生效。",
			"updates.blocked": "dsh 不兼容",
			"updates.blockedTitle": "dsh 不接受这个版本",
			"updates.blockedBody": "「{spec}」声明只兼容更早的 dsh，而你本机是 {dsh}。这是 dsh 自己的保护机制（它的原话：可能崩溃或数据损坏），要显式放行才能装。",
			"updates.blockedHow": "放行通道见 dsh 自己的说明（dsh plugin allow-version，或插件管理器里的「精确版本豁免」）。本插件不代你放行。",
			"updates.copyRaw": "复制 dsh 原始说明",
			"updates.batchBlocked": "（其中 {k} 个被 dsh 兼容性闸门拦下）",
			"updates.locals": "另有 {n} 个插件是本地链接，不参与更新检查",
			"updates.localsNote": "它们的版本来自本机源码（不是 npm），升级会去装 npm 版本并替换掉你的链接，所以这里不提供升级。",
			"updates.pinned": "清单锁定",
			"updates.pinnedNote": "清单里写死为 v{v}；plugin add 不会把它挪走，要升请先改成范围。",
			"updates.noChangeTitle": "dsh 报告成功，但什么都没装",
			"updates.noChange": "安装目录里的版本仍是 v{v}，且本次操作 dsh 没有任何输出 —— 插件可能已经就是这个版本，或 dsh 的 plugin add 对它不生效。",
			"updates.alreadyTitle": "已经装的就是这个版本",
			"updates.alreadyHint": "当前 v{v} —— 无需重新安装。",
			"card.installed": "已安装 v{v}",
			"install.reinstall": "重新安装",
			"install.reinstallConfirm": "确认重新安装？",
			"updates.batchNoop": "（其中 {k} 个 dsh 报告成功但版本没变）",
			"host.stale": "本机 host 还没提供这个接口 —— 通常是 dsh 未重启。重启 dsh 后再试。",
			"host.skew": "宿主进程是旧版本：本页需要更新的接口字段（重启后正常）。",
			"count.summary": "共 {n} 条结果",
			"count.partial": "已显示前 {m} 条",
			"count.searching": "搜索中…",
			"state.loading": "正在读取插件目录…",
			"state.empty": "没有匹配的插件。换个关键词试试。",
			"state.failed": "读取失败",
			"cmd.missing": "站点未给出已验证的 npm 包名，请到插件页确认安装方式",
			"badge.stars": "★ {n}",
			"label.sell": "卖点",
			"label.untranslated": "未汉化",
			"label.repoSource": "GitHub 源",
			"hint.repoSource": "该插件未发布到 npm，走 GitHub 源安装（与站点详情页同口径）。",
			"best.recommend": "严选推荐",
			"best.picks": "分类精选",
			"best.catCount": "{subs} 个小类 · {n} 个",
			"best.month": "{m} 期 · 每小类 2~3 个",
			"best.loading": "正在取当期榜单…",
			"best.empty": "当期榜单还没有数据（每月 1 日重算）",
			"sets.tab": "套装",
			"sets.count": "{n} 套方案",
			"sets.itemCount": "{n} 个插件",
			"sets.loading": "正在取套装方案…",
			"sets.empty": "暂时没有可用的套装方案",
			"sets.batchHint": "按上面的顺序执行；命令里的 --profile 已按你本机填好。",
			"sets.conflict": "注意",
			"sets.synced": "{m} 期精选已核对 {s} 个跟随位",
			"sets.detail": "看方案详情",
			"need.required": "必备",
			"need.enhance": "增强",
			"need.optional": "可选",
			"footer.hint": "网页无法自动安装：复制命令到终端执行，装完重启 dsh 才会生效。命令里的 --profile 已按你本机填好，别改成别的。",
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
			"install.pendingTag": "待重启",
			"install.pendingBody": "{n}：重启 dsh 后生效",
			"install.effective": "已生效",
			"install.effectiveBody": "{n}：改动已生效",
			"install.dismiss": "知道了",
			"install.restartFailed": "重启接口不可用，请手动重启 dsh",
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
			"action.show": "Show the panel",
			"action.close": "Collapse",
			"action.drag": "Drag to reposition",
			"action.hide": "Hide widget",
			"action.hideHint": "Once closed it never comes back on its own, and a stray click will not bring it back: click the “Curated” sidebar button twice to restore (the second click does it), or re-tick the toggle at the bottom of the Curated tab / flip the switch in Settings → General",
			"action.closedHint": "Closed — clicking here will not bring it back; re-enable it in the Curated tab footer or Settings → General",
			"action.armRestore": "Click again to restore the widget",
			"action.expand": "Expand panel",
			"action.showFloat": "Show the floating widget",
			"settings.tab": "Curated",
			"settings.title": "Curated plugins",
			"settings.float": "Floating widget (bottom right)",
			"settings.floatHint": "Once closed it never comes back on its own, and a stray click will not bring it back. To restore: click the “Curated” sidebar button twice (the second click does it), or re-tick the toggle at the bottom of the Curated tab.",
			"settings.daily": "Daily pick",
			"settings.dailyHint": "One plugin per day, rotated by calendar day (identical for everyone on a given day).",
			"settings.check": "Check plugin updates automatically",
			"settings.checkHint": "Asks the npm mirror for the latest version of every installed plugin when dsh opens (about 20 read-only requests per machine, at most once every 10 minutes). Turning it off stops the red dot; the manual \"Check for updates\" still works.",
			"settings.telemetry": "Anonymous stats",
			"settings.on": "On",
			"settings.off": "Off",
			"settings.reset": "Reset",
			"settings.resetHint": "Clears the widget visibility, widget position and daily-pick preferences stored on this machine.",
			"settings.resetDone": "Reset done.",
			"settings.about": "These preferences live only on this machine (localStorage) and are never uploaded. The anonymous-stats switch is on this page too.",
			"daily.tab": "Daily",
			"daily.title": "Today's pick",
			"daily.loading": "Loading today's pick…",
			"daily.empty": "Today's pick is unavailable (catalogue data not ready)",
			"daily.why": "Why this one",
			"daily.hint": "Rotates at 00:00 (UTC+8); identical for everyone that day.",
			"daily.expand": "Expand",
			"daily.collapse": "Collapse",
			"changelog.title": "Changelog",
			"changelog.current": "Installed v{v}",
			"changelog.loading": "Loading the changelog…",
			"changelog.failed": "Could not read the changelog (local host not responding)",
			"changelog.newAvailable": "v{v} available",
			"changelog.upToDate": "Up to date",
			"changelog.copyUpgrade": "Copy upgrade command",
			"changelog.hint": "A restart is needed after upgrading; the profile in the command is already set to this machine's.",
			"changelog.noItems": "No notes recorded for this version.",
			"updates.tab": "My plugins",
			"updates.title": "My plugins",
			"updates.dot": "Update available",
			"updates.check": "Check for updates",
			"updates.checking": "Checking…",
			"updates.self": "This plugin",
			"updates.installed": "Installed plugins",
			"updates.outdated": "Update available",
			"updates.upToDate": "Up to date",
			"updates.unknown": "Latest version unknown",
			"updates.none": "Every installed plugin is up to date.",
			"updates.summary": "Checked {n} plugins · {m} have updates",
			"updates.unknownNote": "{k} more could not be resolved (usually local plugins never published to npm); no conclusion is drawn for them.",
			"updates.copyCmd": "Copy command",
			"updates.failed": "Update check failed",
			"updates.loading": "Checking for updates…",
			"updates.note": "Latest versions come from npmmirror; these are read-only requests and nothing is installed for you.",
			"updates.remove": "Uninstall",
			"updates.removeConfirm": "Confirm uninstall?",
			"updates.removing": "Uninstalling…",
			"updates.removed": "Uninstalled",
			"updates.removedRestart": "Restart dsh to finish removing it",
			"updates.nothingToRemove": "It was not installed",
			"updates.ignore": "Ignore this version",
			"updates.ignored": "Ignoring v{v}",
			"updates.unignore": "Stop ignoring",
			"updates.ignoreHint": "No nagging until v{v}",
			"sets.installAll": "Install the whole set ({n})",
			"sets.installAllConfirm": "Installs {n} plugins one by one (rewrites your profile, needs a dsh restart) — click again to start.",
			"sets.installing": "Installing {done}/{total} · {name}",
			"updates.ackNote": "The dot clears once you open this page, and returns only when a newer version shows up.",
			"updates.restartConfirm": "Restart dsh? The current session will be interrupted.",
			"updates.upgrade": "Upgrade",
			"updates.upgradeConfirm": "Upgrade to the latest version?",
			"updates.upgradeHint": "This runs dsh plugin add <pkg>@latest against your profile; a restart is needed afterwards.",
			"updates.upgradeAll": "Upgrade all ({n})",
			"updates.upgradeAllHint": "Runs one at a time (the host allows a single install job) and can be stopped; items not reached keep their current state.",
			"updates.upgradeAllConfirm": "This will upgrade {n} plugins one by one (it rewrites this machine's profile and needs a restart) — click again to start.",
			"updates.batchProgress": "Upgrading {done}/{total} · {name}",
			"updates.stop": "Stop",
			"updates.batchDone": "Processed {done} · failed {failed}",
			"updates.restartNeeded": "Some items were installed through the local CLI — restart dsh to activate them.",
			"updates.blocked": "Incompatible with dsh",
			"updates.blockedTitle": "dsh rejected this version",
			"updates.blockedBody": "“{spec}” only declares compatibility with an earlier dsh, while this machine runs {dsh}. This is dsh's own guard (in its words: may cause crashes or data loss) — installing it needs an explicit exemption.",
			"updates.blockedHow": "The exemption path is documented by dsh itself (dsh plugin allow-version, or the exact-version exemption in the plugin manager). This plugin will not grant it for you.",
			"updates.copyRaw": "Copy dsh's own message",
			"updates.batchBlocked": "({k} were stopped by dsh's compatibility gate)",
			"updates.locals": "{n} more plugins are local links and are skipped",
			"updates.localsNote": "Their version comes from local source, not npm; upgrading would install the npm build and replace your link — so no upgrade is offered here.",
			"updates.pinned": "Pinned",
			"updates.pinnedNote": "The manifest pins v{v}; plugin add will not move it — widen the range first.",
			"updates.noChangeTitle": "dsh reported success, but nothing was installed",
			"updates.noChange": "The installed version is still v{v} and dsh produced no output at all — the plugin may already be that version, or dsh's plugin add does not take effect for it.",
			"updates.alreadyTitle": "This version is already installed",
			"updates.alreadyHint": "Currently v{v} — nothing to reinstall.",
			"card.installed": "Installed v{v}",
			"install.reinstall": "Reinstall",
			"install.reinstallConfirm": "Reinstall?",
			"updates.batchNoop": "({k} reported success but kept the same version)",
			"host.stale": "This build of the local host does not serve that route yet — usually dsh has not been restarted. Restart dsh and try again.",
			"host.skew": "The local host process is older than this UI: this page needs newer response fields (a restart fixes it).",
			"count.summary": "{n} results",
			"count.partial": "showing the first {m}",
			"count.searching": "searching…",
			"state.loading": "Loading the catalog…",
			"state.empty": "No matching plugin. Try another keyword.",
			"state.failed": "Failed to load",
			"cmd.missing": "No verified npm package name on record — check the plugin page for the install method",
			"badge.stars": "★ {n}",
			"label.sell": "Highlight",
			"label.untranslated": "Not translated",
			"label.repoSource": "GitHub source",
			"hint.repoSource": "Not published to npm — installs from the GitHub source (same rule as the site's detail page).",
			"best.recommend": "Curated",
			"best.picks": "By category",
			"best.catCount": "{subs} groups · {n}",
			"best.month": "{m} · 2-3 per group",
			"best.loading": "Loading this month's picks…",
			"best.empty": "No picks for the current month yet (recomputed on the 1st)",
			"sets.tab": "Setups",
			"sets.count": "{n} setups",
			"sets.itemCount": "{n} plugins",
			"sets.loading": "Loading setups…",
			"sets.empty": "No setups available yet",
			"sets.batchHint": "Run them in this order; the --profile is already filled for your machine.",
			"sets.conflict": "Note",
			"sets.synced": "Checked against {m} picks ({s} rolling slots)",
			"sets.detail": "View on site",
			"need.required": "Core",
			"need.enhance": "Enhance",
			"need.optional": "Optional",
			"footer.hint": "A web page cannot install plugins: copy the command into a terminal, then restart dsh. The --profile in it is already set to this machine's — leave it as is.",
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
			"install.pendingTag": "Restart needed",
			"install.pendingBody": "{n}: restart dsh to apply",
			"install.effective": "Active",
			"install.effectiveBody": "{n}: changes are live",
			"install.dismiss": "Got it",
			"install.restartFailed": "Restart endpoint unavailable — restart dsh manually",
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
		/* 安装成功但还没验证的凭据（见 reportPostInstall）。
		   只放本地，不上报：重启前没有任何东西可以验证它。 */
		const PENDING_KEY = "dph-hub-pending";
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

		function rememberPending(entry) {
			try {
				localStorage.setItem(PENDING_KEY, JSON.stringify(entry));
			} catch (error) {
				/* 存不下就不存：宁可丢一条回执，也不能影响安装流程 */
			}
		}

		function takePending() {
			try {
				const raw = localStorage.getItem(PENDING_KEY);
				if (!raw) return null;
				/* 取出来就清掉：上报失败不重试。
				   回执是统计用的，重复灌库的代价比丢一条大。 */
				localStorage.removeItem(PENDING_KEY);
				const parsed = JSON.parse(raw);
				return parsed && typeof parsed.pkg === "string" && parsed.pkg ? parsed : null;
			} catch (error) {
				return null;
			}
		}

		/**
		 * 安装后的回执 —— 只有「插件再次被加载」时才知道结果。
		 *
		 * 两个判据都必须由 host 给出，客户端自报不成立：
		 *   · restarted：重启前后是同一段 JS，它无法自证发生过重启；
		 *   · bundled：profile 的加载清单在磁盘上，浏览器读不到。
		 * 查不到时**不传该字段**（host 端 value 里就缺这一项 = 未知），
		 * 绝不用 false 兜底 —— 那会把「没查到」记成一个具体的否定结论。
		 */
		function reportPostInstall() {
			const pending = takePending();
			if (!pending) return;
			const query =
				"pkg=" + encodeURIComponent(pending.pkg) +
				"&via=" + encodeURIComponent(String(pending.via || "")) +
				"&at=" + encodeURIComponent(String(pending.at || ""));
			fetch("/api/dpharness/postinstall?" + query)
				.then((response) => response.json())
				.then((data) => {
					if (!data || data.ok !== true) return;
					const detail = { action: "post_install", via: String(pending.via || "unknown") };
					if (typeof data.restarted === "boolean") detail.restarted = data.restarted;
					if (typeof data.bundled === "boolean") detail.bundled = data.bundled;
					if (typeof data.dep === "boolean") detail.dep = data.dep;
					track("plugin_hub", detail);
				})
				.catch(() => {});
		}

		/* --------------------------------------------------------------- installer */
		/* 两条路径，安全优先：
		   ① 复用已装的 dshmarket 的同源 HTTP 路由（免重启热挂载、可回滚）；
		      它只接受自己 curated registry（awesome 目录）里的 url，不在其中会返回 400；
		   ② 降级到本插件 host 路由，直接 spawn `dsh plugin add`（改 profile，需重启生效）。
		   已在运行 agent 时 dshmarket 会返回 409 —— **只有这一种不降级**。
		   其余一切「市场通道给不出确定答复」的状态都必须降级：dshmarket 缺失、被 dsh 判定
		   与本机核心不兼容而整包跳过、或正在升级时，/dsh-market/* 会整体缺席，POST 命不中
		   任何具名路由，于是落到 dsh 静态前端的 fallback —— 它对非 GET/HEAD 一律回**空体 405**。
		   把这种 405 当硬失败，会让一键安装在市场通道不可用时直接报错，而旁边明明有一条
		   可用的本地通道（桌面版 dsh 0.2.0-rc.2 跳过 dshmarket 1.65.1 时即如此）。 */
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

		/**
		 * 读一个**本机 host 路由**的 JSON 响应（四个取数 hook 共用）。
		 *
		 * ⚠️ 必须容忍「响应体不是 JSON」，这不是防御性编程，是实测踩到的坑：
		 * 客户端代码刷新页面即生效，而 host 的路由要**重启 dsh** 才会注册 ——
		 * 这个窗口期里请求会落到 dsh 静态前端的兜底上，返回纯文本
		 * （实测桌面版返回 `not found`、无凭据时 `unauthorized`）。
		 * 直接 response.json() 会把 JSON 解析错误当成业务错误抛给用户：
		 *   「Unexpected token 'o', "not found" is not valid JSON」
		 * —— 这句话对用户毫无意义，而真实原因（host 进程是旧的）被彻底掩盖。
		 * 所以这里是「先取文本、再尝试解析」，解析失败一律标成 stale（句柄失效），
		 * 由调用方翻成一句可操作的话。
		 */
		/**
		 * 本 UI **期望**的宿主负载形状版本，必须与 host 侧 index.js 的 SHAPE_REV 一致。
		 * 两个半边同包但不同运行时（一个在 Node、一个在浏览器），没法 import，
		 * 只能各写一份 —— test-local.mjs 双向断言两者相等，改一处忘另一处会当场变红。
		 */
		const HOST_SHAPE_REV = 3;

		/**
		 * 宿主进程比客户端旧？
		 *
		 * desktop profile 里本插件是**指向工作区的符号链接**：客户端刷新页面即生效，
		 * 而宿主的路由与字段要**重启 dsh** 才会更新。这个窗口期里界面会缺字段
		 * （例如「更新」视图拿不到中文名）—— 实测已因此误导过两次，
		 * 所以要显式说出来，否则用户只会觉得"功能坏了"。
		 *
		 * 只判「宿主更旧」：宿主更新而客户端旧时，多出来的字段不影响渲染，不必打扰用户。
		 */
		function isHostSkewed(body) {
			return Boolean(body) && typeof body.rev === "number" && body.rev < HOST_SHAPE_REV;
		}

		async function readHostJson(url, signal) {
			const response = await fetch(url, { cache: "no-store", signal: signal });
			const text = await response.text();
			let body = null;
			try {
				body = text ? JSON.parse(text) : null;
			} catch (error) {
				body = null;
			}
			if (body === null) {
				const error = new Error("host route unavailable (HTTP " + response.status + " " + String(text || "").trim().slice(0, 40) + ")");
				/* stale = 这条路压根没注册，而不是服务端报了一个业务错 */
				error.stale = true;
				throw error;
			}
			if (!response.ok || body.ok !== true) {
				throw new Error((body && body.error) || ("HTTP " + response.status));
			}
			return body;
		}

		function messageOf(result, fallback) {
			const data = result && result.data;
			if (data && typeof data.error === "string" && data.error) return data.error.slice(0, 200);
			if (result && result.error) return result.error;
			return fallback + "（HTTP " + (result ? result.status : "?") + "）";
		}

		/* why 是**闭集枚举**，不是错误原文 —— 原文含本地路径与包名，既不可聚合也会
		   把用户环境信息带出去。分类只回答「卡在哪一步」，够用来定位了。 */
		async function pollMarketInstall(deadline) {
			while (Date.now() < deadline) {
				await sleep(INSTALL_POLL_MS);
				const status = await getJson(MARKET_STATUS);
				if (status.status !== 200 || !status.data) return { ok: false, via: "market", why: "poll_unreachable", message: messageOf(status, "dshmarket status unavailable") };
				if (status.data.active === false && status.data.busy === false) {
					if (status.data.error) return { ok: false, via: "market", why: "cli_error", message: String(status.data.error).slice(0, 200) };
					return { ok: true, market: true };
				}
			}
			return { ok: false, via: "market", why: "timeout", message: "timeout" };
		}

		async function pollLocalInstall(deadline) {
			while (Date.now() < deadline) {
				await sleep(INSTALL_POLL_MS);
				const status = await getJson(LOCAL_INSTALL);
				const job = status.data && status.data.job;
				if (status.status !== 200 || !job) return { ok: false, via: "local", why: "poll_unreachable", message: messageOf(status, "install status unavailable") };
				if (job.active === false) {
					if (job.code === 0) return { ok: true, market: false, changed: job.changed };
					if (job.why === "incompatible") {
						/* dsh 自带的兼容性闸门拒绝 —— 与"安装出错"是两回事：
						   它是**预期结果**，界面要给出原因与放行通道，而不是一句失败。 */
						return {
							ok: false,
							via: "local",
							why: "incompatible",
							reject: job.reject || null,
							message: String(job.error || "incompatible").slice(0, 200),
						};
					}
					return { ok: false, via: "local", why: job.error === "timeout" ? "timeout" : "cli_exit", message: String(job.error || job.tail || ("exit code " + job.code)).slice(0, 200) };
				}
			}
			return { ok: false, via: "local", why: "timeout", message: "timeout" };
		}

		/**
		 * 安装与升级共用同一条执行路径，但**事件名必须分开**：
		 * 「装一个新插件」（发现）与「把已装的升到最新」（维护）是两种完全不同的行为，
		 * 混成一个数会让两边都读不出结论（一个涨了，你不知道是新用户在装还是老用户在升）。
		 * 这里只放动作名，调用点保持逐字可检索。
		 */
		const INSTALL_EVENTS = { start: "install", okMarket: "installed_market", okLocal: "installed_local", fail: "install_failed" };
		const UPGRADE_EVENTS = { start: "upgrade", okMarket: "upgrade_done_market", okLocal: "upgrade_done", fail: "upgrade_failed" };

		/**
		 * 目标包名（去掉 @latest / @版本 后缀）。
		 *
		 * 安装回执要拿它去 profile 清单里查，而 `dependencies` 的键是**裸包名** ——
		 * 带着 `@latest` 去查会永远查不到，把「已装上」记成「没装上」。
		 * scoped 包（@scope/name）不含版本时原样返回。
		 */
		function basePackage(target) {
			const value = String(target || "");
			const matched = /^(.*?)@[^@/]+$/.exec(value);
			return matched ? matched[1] : value;
		}

		/**
		 * 安装任务的唯一写入口。
		 *
		 * why / reject 每次都显式给默认值：它们是上一轮的残留最容易被带出去的地方
		 * （上一个任务被兼容性闸门拒过，下一个任务的失败就会顶着别人的原因显示）。
		 */
		function setInstallJob(job) {
			setHub({ install: Object.assign({ why: "", reject: null, verb: "add" }, job) });
		}

		async function runInstall(item, t, kind) {
			const target = item.pkg;
			if (!target) return { ok: false, via: "none", why: "no_target" };
			const ev = kind === "upgrade" ? UPGRADE_EVENTS : INSTALL_EVENTS;
			const deadline = Date.now() + INSTALL_MAX_MS;
			setInstallJob({ active: true, target, phase: "market", message: t("install.market") });
			track("plugin_hub", { action: ev.start });

			let done = null;
			if (item.url) {
				const market = await postJson(MARKET_INSTALL, { url: item.url });
				if (market.status === 200) {
					done = await pollMarketInstall(deadline);
				} else if (market.status === 409) {
					/* 有 agent 正在跑，dshmarket 拒绝抢插件文件 —— 唯一不降级的情况：
					   降级路径同样要写插件文件，此刻写下去一样会把工作中的 agent 写崩。 */
					track("plugin_hub", { action: ev.fail, via: "market", why: "busy" });
					setInstallJob({ active: false, target, phase: "failed", message: messageOf(market, t("install.failed")) });
					return { ok: false, via: "market", why: "busy" };
				} else {
					done = null;
					/* 400/404/0 是预期拒绝（不在 curated registry / 通道不在 / 网络异常），
					   静默降级。其余状态码说明**市场通道本身不可用**，要留痕，否则看板上
					   「市场通道缺席」这件事完全不可见（它只会表现为降级后的成功率偏低）。 */
					if (market.status !== 400 && market.status !== 404 && market.status !== 0) {
						track("plugin_hub", {
							action: "market_unavailable",
							via: "market",
							why: market.status === 0 ? "network" : "http_" + market.status,
						});
					}
				}
			}
			if (done === null) {
				setInstallJob({ active: true, target, phase: "local", message: t("install.local") });
				const local = await postJson(LOCAL_INSTALL, { pkg: target });
				if (local.status !== 202) {
					const why = local.status === 409 ? "busy" : "local_rejected";
					track("plugin_hub", { action: ev.fail, via: "local", why: why });
					setInstallJob({ active: false, target, phase: "failed", message: messageOf(local, t("install.failed")) });
					return { ok: false, via: "local", why: why };
				}
				done = await pollLocalInstall(deadline);
				/* 偶发失败**重试一次**（只一次，不是循环）：
				   实测（2026-10-12）同一台机器、同一条命令，紧挨着的多次操作会抢同一个
				   pnpm-lock.yaml 而报 `Command failed with exit code 1`（dsh 只记命令行、
				   不记 pnpm 输出），隔几分钟单独跑一次就成功。
				   重试是幂等的（`pnpm add 同一个版本`），且宿主侧本来就是单飞（并发会 409）。 */
				if (!done.ok && done.why === "cli_exit") {
					track("plugin_hub", { action: ev.fail, via: "local", why: "retry" });
					setInstallJob({ active: true, target, phase: "local", message: t("install.local") });
					const again = await postJson(LOCAL_INSTALL, { pkg: target });
					if (again.status === 202) done = await pollLocalInstall(deadline);
				}
			}
			setInstallJob({
				active: false,
				target,
				phase: done.ok ? (done.market ? "okMarket" : "okLocal") : "failed",
				message: done.ok ? t(done.market ? "install.okMarket" : "install.okLocal") : done.message,
				why: done.ok ? "" : (done.why || ""),
				reject: done.ok ? null : (done.reject || null),
			});
			/* 装完就重取一次清单：否则行上还是旧版本号，用户会判定"升级没成功"
			   （host 在安装成功时会作废它自己的缓存，所以这次 refresh 拿得到新结果）。 */
			loadUpdates(true);
			if (done.ok) {
				const via = done.market ? "market" : "local";
				track("plugin_hub", { action: done.market ? ev.okMarket : ev.okLocal });
				/* 留一张凭据给下一次加载。安装成功这一刻没有任何东西能验证结果：
				   热挂载路径没有重启，本地 CLI 路径要等重启才生效 —— 两者都只能在
				   「插件再次被加载」时由 host 回查（见 reportPostInstall）。 */
			rememberPending({ pkg: basePackage(target), via: via, at: Date.now() });
			/* 本地通道改的是 profile，必须重启才生效 —— 记一条待重启横幅（市场通道热挂载，
			   不需要；same/none 版本没动，也没什么可生效的）。 */
			if (!done.market && done.changed) markRestartPending(item.nameZh || item.name || target);
			return { ok: true, market: Boolean(done.market), via: via, why: "", changed: done.changed };
			}
			track("plugin_hub", {
				action: ev.fail,
				via: done.via || "local",
				why: done.why || "unknown",
			});
			/* 被 dsh 的兼容性闸门拒过就记住它 —— 下次不再让用户白点一次 */
			if (done.why === "incompatible" && done.reject && done.reject.spec) rememberBlocked(done.reject.spec);
			return { ok: false, via: done.via || "local", why: done.why || "unknown", reject: done.reject || null };
		}

		/**
		 * 卸载 —— 与安装共用同一条本地通道（宿主同一个 job、同一套轮询与脱敏），
		 * 只把 verb 换成 remove。刻意**没有市场通道**：dshmarket 只负责装，卸只能改 profile。
		 *
		 * 卸载同样要重启才彻底（当前进程里插件还挂着），所以成功之后与安装走同一条
		 * 待重启横幅 —— 不另造一套提醒（横幅文案已改成动词中性，装卸都说得通）。
		 */
		async function runRemove(item, t) {
			const target = item.pkg;
			if (!target) return { ok: false, why: "no_target" };
			const deadline = Date.now() + INSTALL_MAX_MS;
			setInstallJob({ active: true, verb: "remove", target, phase: "local", message: t("updates.removing") });
			track("plugin_hub", { action: "remove_start" });
			const local = await postJson(LOCAL_INSTALL, { pkg: target, verb: "remove" });
			if (local.status !== 202) {
				const why = local.status === 409 ? "busy" : "local_rejected";
				track("plugin_hub", { action: "remove_failed", why: why });
				setInstallJob({ active: false, verb: "remove", target, phase: "failed", message: messageOf(local, t("install.failed")) });
				return { ok: false, changed: false, why: why };
			}
			const done = await pollLocalInstall(deadline);
			setInstallJob({
				active: false,
				verb: "remove",
				target,
				phase: done.ok ? "okLocal" : "failed",
				message: done.ok ? t("updates.removed") : done.message,
				why: done.ok ? "" : (done.why || ""),
			});
			/* 装/卸都会改 profile 清单：装完要立刻看到「已安装 vX」消失，所以同样重取 */
			loadUpdates(true);
			if (done.ok && done.changed) {
				track("plugin_hub", { action: "remove_ok" });
				markRestartPending(item.nameZh || item.name || target);
			} else if (done.ok) {
				/* 退出码 0 但磁盘上没变 —— 与安装的 same 同一类三态，别谎报"已卸载" */
				track("plugin_hub", { action: "remove_noop" });
			} else {
				track("plugin_hub", { action: "remove_failed", why: done.why || "unknown" });
			}
			return { ok: Boolean(done.ok), changed: Boolean(done.changed), why: done.why || "" };
		}

		/**
		 * 批量升级。
		 *
		 * ⚠️ **必须串行**：宿主同一时刻只允许一个安装任务（第二个请求直接 409），
		 * 并发只会让大部分条目拿到 busy。
		 * 可中止：每轮开始前看一次标记；中止后剩余条目保持原状（仍是「可升级」），不做任何事 ——
		 * 半途而废也只是"少升了几个"，不会留下损坏状态。
		 */
		async function runUpgradeAll(items, t) {
			const total = items.length;
			setHub({ batch: { active: true, total: total, finished: 0, failed: 0, blocked: 0, noop: 0, current: items[0] ? items[0].name : "", stopRequested: false, restartNeeded: false } });
			let failed = 0;
			let blocked = 0;
			let noop = 0;
			let restartNeeded = false;
			let finished = 0;
			for (let index = 0; index < items.length; index += 1) {
				if (hub.batch && hub.batch.stopRequested) break;
				setHub({ batch: { ...hub.batch, current: items[index].name } });
				const result = await runInstall({ pkg: items[index].pkg, name: items[index].name, nameZh: items[index].nameZh }, t, "upgrade");
				finished += 1;
				if (!result.ok) {
					failed += 1;
					/* 被 dsh 兼容性闸门拦下的要单独计数：它和"真失败"的处置完全不同 */
					if (result.why === "incompatible") blocked += 1;
				} else if (result.changed === false) {
					/* dsh 报成功但版本没变（静默空转）—— 这既不是成功也不是失败，单独计 */
					noop += 1;
				} else if (result.via === "local") {
					restartNeeded = true;
				}
				setHub({ batch: { ...hub.batch, finished: finished, failed: failed, blocked: blocked, noop: noop, restartNeeded: restartNeeded } });
			}
			setHub({ batch: { ...hub.batch, active: false, current: "" } });
			/* 批量结束再重取一次清单（逐个重取会把 13 次检查打成 13 轮请求） */
			loadUpdates(true);
			track("plugin_hub", {
				action: "upgrade_all_done",
				n: finished,
				scope: hub.batch && hub.batch.stopRequested ? "stopped" : "full",
				why: blocked > 0 ? "blocked" : noop > 0 ? "noop" : failed > 0 ? "partial" : "ok",
			});
		}

		/**
		 * 一键安装整套。
		 *
		 * 复用批量升级那台机器（串行 / 总进度 / 可中止 / 同一份失败分类），只换来源 ——
		 * 宿主同一时刻只允许一个安装任务（并发只会拿到 409），所以"整套安装"必须是
		 * 同一个循环换一个数据源，而不是另写一套并发。
		 *
		 * 已经装上的条目会走到 `changed === false`（本来就是目标版本）→ 计 noop，
		 * **不是失败**（与单条安装同一个三态口径）。
		 * 装完的待重启提醒由 runInstall 自己记（本地通道才记），这里不重复。
		 */
		async function runSetInstall(set, t) {
			const items = (Array.isArray(set.items) ? set.items : []).filter((item) => item.pkg);
			const total = items.length;
			if (total === 0) return;
			const labelOf = (item) => item.nameZh || item.name || item.pkg;
			setHub({ batch: {
				active: true,
				kind: "install",
				scope: "set",
				slug: set.slug || "",
				setName: set.name || "",
				total: total,
				finished: 0,
				failed: 0,
				blocked: 0,
				noop: 0,
				current: labelOf(items[0]),
				stopRequested: false,
				restartNeeded: false,
			} });
			track("plugin_hub", { action: "set_install_start", slug: set.slug || "", n: total });
			let failed = 0;
			let blocked = 0;
			let noop = 0;
			let restartNeeded = false;
			let finished = 0;
			for (let index = 0; index < items.length; index += 1) {
				if (hub.batch && hub.batch.stopRequested) break;
				setHub({ batch: { ...hub.batch, current: labelOf(items[index]) } });
				const result = await runInstall({ pkg: items[index].pkg, name: items[index].name, nameZh: items[index].nameZh }, t, "catalog");
				finished += 1;
				if (!result.ok) {
					failed += 1;
					if (result.why === "incompatible") blocked += 1;
				} else if (result.changed === false) {
					noop += 1;
				} else if (result.via === "local") {
					restartNeeded = true;
				}
				setHub({ batch: { ...hub.batch, finished: finished, failed: failed, blocked: blocked, noop: noop, restartNeeded: restartNeeded } });
			}
			setHub({ batch: { ...hub.batch, active: false, current: "" } });
			loadUpdates(true);
			track("plugin_hub", {
				action: "set_install_done",
				slug: set.slug || "",
				n: finished,
				scope: hub.batch && hub.batch.stopRequested ? "stopped" : "full",
				why: blocked > 0 ? "blocked" : noop > 0 ? "noop" : failed > 0 ? "partial" : "ok",
			});
		}

		/** 仅在降级路径（改了 profile）后需要；/api/restart 由 dsh-restart 插件提供（POST）。 */
		async function restartServer() {
			const result = await postJson("/api/restart", {});
			return result.status >= 200 && result.status < 300;
		}

		/* ------------------------------------------------------------------ store */
		/* 浮窗的「是否显示」—— 与位置一起属于浮窗的本地持久状态。 */
		const HIDE_KEY = "dph-hub-hidden";
		let hubHidden = false;
		try {
			hubHidden = localStorage.getItem(HIDE_KEY) === "1";
		} catch (error) {
			/* localStorage 不可用时按"显示"处理：宁可多一个浮窗，也不要让入口凭空消失 */
		}
		function storeHidden(value) {
			try {
				localStorage.setItem(HIDE_KEY, value ? "1" : "0");
			} catch (error) {
				/* 隐私模式下不持久化，本次会话内仍然可关 */
			}
		}

		/* 「每日推荐」开关。默认开 —— 它是这屏里唯一一条「今天该装哪个」的答案，
		   关掉只是不想看，不该是新用户的默认状态。 */
		const DAILY_KEY = "dph-hub-daily";
		let dailyOn = true;
		try {
			dailyOn = localStorage.getItem(DAILY_KEY) !== "0";
		} catch (error) {
			/* localStorage 不可用时按默认（开）处理 */
		}
		function storeDaily(value) {
			try {
				localStorage.setItem(DAILY_KEY, value ? "1" : "0");
			} catch (error) {
				/* 隐私模式下不持久化，本次会话内仍然可关 */
			}
		}

		/* 四个入口共享的轻量 store；不依赖 dsh 内部 store，避免猜测未验证的 API。 */
		/**
		 * 「自动检查插件更新」的开关（默认开）。
		 *
		 * 有真实用户之后才想清楚：自动检查会让**每台用户的机器**在每次打开 dsh 时
		 * 向 npm 镜像发约 20 个只读请求 —— 这是"未经同意就产生的出网行为"。
		 * 声明写在 README 里没用（用户不会去读），所以给出可关的开关，并明确写下量级。
		 * 关掉后：不自动查、红点不再提醒；**手动「检查更新」仍然可用**。
		 */
		const AUTO_CHECK_KEY = "dph-hub-auto-check";
		function readAutoCheck() {
			try {
				return localStorage.getItem(AUTO_CHECK_KEY) !== "0";
			} catch (error) {
				return true;
			}
		}

		/* 「忽略此版本」 —— 本机偏好（localStorage）：某包升到某个版本之前不再提醒。
		   与 acked（看过即消）刻意不同：acked 记的是"我看过了"，这是"我不打算升这一版"，
		   所以它必须持久、且红点与列表都要认它。存的是**目标版本**而不是布尔 ——
		   等真出了更新的版本（latest 变了），提醒应当自己回来。 */
		const IGNORE_KEY = "dph-hub-ignore";
		function readIgnore() {
			try {
				const raw = localStorage.getItem(IGNORE_KEY);
				if (!raw) return {};
				const parsed = JSON.parse(raw);
				if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
				const map = {};
				Object.keys(parsed).forEach((pkg) => {
					const version = parsed[pkg];
					if (typeof version === "string" && version) map[pkg] = version;
				});
				return map;
			} catch (error) {
				return {};
			}
		}
		function storeIgnore(value) {
			try {
				localStorage.setItem(IGNORE_KEY, JSON.stringify(value));
			} catch (error) {
				/* 隐私模式下不持久化：本次会话内仍然有效 */
			}
		}

		/* 「待重启」提醒 —— 本地通道安装/升级成功后的激活闭环（2026-10-13）。
		   为什么必须做：桌面 profile 实测**没有 dshmarket**（只有 dsh-restart 的链接），
		   安装全走本地通道、必须重启才生效 —— 「装了没启用」是主路径而不是边缘情况，
		   它正是实装验证率最大的漏点。行内提示跟着卡片走，切个视图就看不见了，
		   所以这条提醒挂在面板与页签顶部，跨视图、跨会话存在，直到重启生效或
		   用户明确说「知道了」。 */
		const RESTART_KEY = "dph-hub-restart-pending";
		function readRestartPending() {
			try {
				const raw = localStorage.getItem(RESTART_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				if (!parsed || !Array.isArray(parsed.names) || !parsed.names.length) return null;
				return { names: parsed.names.map((name) => String(name)).filter(Boolean), at: Number(parsed.at) || 0 };
			} catch (error) {
				return null;
			}
		}
		function storeRestartPending(value) {
			try {
				if (value) localStorage.setItem(RESTART_KEY, JSON.stringify(value));
				else localStorage.removeItem(RESTART_KEY);
			} catch (error) {
				/* 隐私模式下不持久化：本次会话内仍然提醒 */
			}
		}
		const hub = { open: false, hidden: hubHidden, daily: dailyOn, telemetry: telemetryOn, autoCheck: readAutoCheck(), ignore: readIgnore(), restartPending: readRestartPending(), install: null, batch: null, listeners: new Set() };
		function setHub(patch) {
			Object.assign(hub, patch);
			hub.listeners.forEach((listener) => listener());
		}
		/* 合并去重：连装三个再重启，横幅只出一条，名字不重复。 */
		function markRestartPending(name) {
			const label = String(name || "").trim();
			if (!label) return;
			const current = hub.restartPending || { names: [], at: 0 };
			const next = { names: Array.from(new Set(current.names.concat([label]))), at: Date.now() };
			storeRestartPending(next);
			setHub({ restartPending: next });
		}
		function clearRestartPending() {
			if (!hub.restartPending) return;
			storeRestartPending(null);
			setHub({ restartPending: null });
		}
		/** 忽略（version 为空 = 取消忽略）。包名 → 目标版本，版本一变提醒自动回来。 */
		function setIgnored(pkg, version) {
			const name = String(pkg || "");
			if (!name) return;
			const next = Object.assign({}, hub.ignore);
			if (version) next[name] = String(version);
			else delete next[name];
			storeIgnore(next);
			setHub({ ignore: next });
		}
		/** 这条更新是否被用户忽略（忽略的是**具体目标版本**，不是这个包）。 */
		function isIgnored(item) {
			if (!item || !hub.ignore) return false;
			const version = hub.ignore[String(item.name || "")];
			return Boolean(version) && version === String(item.latest || "");
		}
		/**
		 * 浮窗的「手动关闭」。
		 *
		 * 为什么要能关：`shell.overlay` 是**跨路由常驻**的，胶囊在所有页面都在，
		 * 而 `open` 只表示展开/收起 —— 用户此前没有把这块东西从屏幕上拿掉的手段。
		 * 这里把「隐藏」做成第三种状态并写进 localStorage（下次进来仍然是关的）。
		 *
		 * 恢复入口必须配齐，否则就变成"关掉就找不回来"（三个，误点都不会复活浮窗）：
		 *   ① 「严选插件」页签底部的「显示右下角浮窗」开关（floatToggle）
		 *   ② 浮窗显隐开关所在的设置行（settings.general.item / settings.plugins.tab）
		 *   ③ 侧边栏底部按钮（FooterEntry）—— **两步确认**：隐藏态第一下只上劲
		 *      （按钮描边 + 标记脉冲 + 提示「再点一次恢复浮窗」，5 秒内有效），
		 *      第二下才把胶囊叫回来。
		 * ⚠️ 为什么不是「点一下就地恢复」（2026-10-13 用户反馈：「胶囊用户关闭了
		 *   就别默认打开了」—— 10-12 那版点一次就叫回胶囊，等于没关掉）；而纯无反应
		 *   的按钮又被用户当成「没生效」。两步确认两头都照顾：习惯性误点不会复活
		 *   浮窗，真想找回也只要两下，且按钮永远有可见反馈。
		 * 只有浮窗**可见**时，点侧边栏按钮才展开/收起面板；没有任何 on-mount /
		 * 路由切换类的自动展开。
		 */
		function hideHub(scope) {
			storeHidden(true);
			setHub({ hidden: true, open: false });
			track("plugin_hub", { action: "hide", scope: scope || "pill" });
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

		/**
		 * 只切换「显不显示浮窗」，**不强行展开面板**。
		 *
		 * 「恢复显示」与「展开面板」是两件事，这里只做前者。两个调用方都是用户的
		 * 显式操作：设置里的浮窗开关、页签底部的「显示右下角浮窗」勾选。用户此刻
		 * 人就在别处浏览，把整块面板糊到屏幕上是打扰（2026-10-12 用户反馈）——
		 * 想展开就点右下角胶囊或侧边栏按钮（仅浮窗可见时）。
		 * 侧边栏按钮只在**两步确认的第二下**走这里（见 FooterEntry 的上劲态）。
		 */
		function setFloatVisible(next, scope) {
			if (!next) {
				hideHub(scope || "settings");
				return;
			}
			storeHidden(false);
			setHub({ hidden: false });
			track("plugin_hub", { action: "show", scope: scope || "settings" });
		}

		function setDaily(next, scope) {
			storeDaily(next);
			setHub({ daily: next });
			track("plugin_hub", { action: "daily_toggle", scope: (scope || "settings") + ":" + (next ? "on" : "off") });
		}

		/**
		 * 「自动检查插件更新」开关：开 → 立刻查一次；关 → 清掉结果，红点随之消失
		 * （不自动查也就不该提醒）。手动「检查更新」按钮不受它影响。
		 */
		function setAutoCheck(next, scope) {
			setHub({ autoCheck: next });
			try {
				localStorage.setItem(AUTO_CHECK_KEY, next ? "1" : "0");
			} catch (error) {
				/* 隐私模式下不持久化 */
			}
			track("plugin_hub", { action: "autocheck_toggle", scope: (scope || "settings") + ":" + (next ? "on" : "off") });
			if (next) {
				loadUpdates(true);
			} else {
				setUpdates({ loading: false, loaded: false, data: null, error: null, stale: false });
			}
		}

		/** 匿名统计开关的唯一写入口（面板页脚与设置页共用，避免两处各写一份持久化逻辑）。 */
		function setTelemetry(next) {
			try {
				localStorage.setItem(TEL_KEY, next ? "1" : "0");
			} catch (error) {
				/* 隐私模式下不持久化 */
			}
			setHub({ telemetry: next });
			telemetryOn = next;
		}

		/**
		 * 恢复默认：把三个本地偏好清成出厂值。
		 *
		 * 刻意**不**动 `dph-hub-vid`（访客 ID）与 `dph-hub-pending`（安装回执）——
		 * 前者是统计口径的连续性，后者是一次性的安装结果凭据，都不是「偏好」。
		 * 位置要连 localStorage 一起删：只重置内存里的 pos，下次进来又会读回旧位置。
		 */
		function resetPrefs(scope) {
			try {
				localStorage.removeItem(HIDE_KEY);
				localStorage.removeItem(POS_KEY);
				localStorage.removeItem(DAILY_KEY);
				localStorage.removeItem(AUTO_CHECK_KEY);
			} catch (error) {
				/* 隐私模式下没法清盘，本次会话内仍然生效 */
			}
			setHub({ hidden: false, daily: true, autoCheck: true, open: false });
			storeHidden(false);
			storeDaily(true);
			track("plugin_hub", { action: "prefs_reset", scope: scope || "settings" });
		}

		/* --------------------------------------------------- 更新检查（共享 store） */
		/**
		 * 三处红点 + 「更新」视图读的是**同一份**结果，所以必须是模块级 store。
		 *
		 * 若每个组件各自 useState，一次页面加载会向 host 打四遍；而 host 那边每遍是
		 * N 个 registry 请求（本机 21 个）—— 这不是"顺手抽个 store"，是本模块唯一
		 * 必须共享的状态。
		 *
		 * 「恢复默认」**刻意不清**这个确认标记：它是"我看过了"而不是"我的偏好"，
		 * 一并清掉只会让用户刚关掉的红点立刻又亮起来。
		 */
		const ACK_KEY = "dph-hub-updates-acked";
		let ackedSignature = "";
		try {
			const raw = localStorage.getItem(ACK_KEY);
			ackedSignature = raw ? String(JSON.parse(raw) || "") : "";
		} catch (error) {
			/* 读不到就当没确认过：宁可多亮一次红点，也不要静默吞掉升级提示 */
		}
		/**
		 * dsh 兼容性闸门**拒绝过**的版本（键为 `pkg@version`）。
		 *
		 * 为什么要记：dsh 的闸门只看目标版本的 peerDependencies，而更新检查只看"有没有新版本"，
		 * 两者互不知情 —— 于是列表里会出现"能装但会被 dsh 拒绝"的条目（实测 13 个可升级里就有 2 个）。
		 * 这里**不做预判**（那需要自己实现 semver 范围求值，猜错会误伤），只把**真实发生过的拒绝**
		 * 记住，下次直接标出来，省掉一次白点。
		 */
		const BLOCKED_KEY = "dph-hub-blocked";
		function readBlocked() {
			try {
				const raw = localStorage.getItem(BLOCKED_KEY);
				const parsed = raw ? JSON.parse(raw) : null;
				return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
			} catch (error) {
				return [];
			}
		}

		const updates = { loading: false, loaded: false, data: null, error: null, stale: false, acked: ackedSignature, blocked: readBlocked(), listeners: new Set() };

		function setUpdates(patch) {
			Object.assign(updates, patch);
			updates.listeners.forEach((listener) => listener());
		}

		function storeAcked(signature) {
			try {
				localStorage.setItem(ACK_KEY, JSON.stringify(signature));
			} catch (error) {
				/* 隐私模式下不持久化，本次会话内仍然算已确认 */
			}
		}

		/** 记住一次被 dsh 兼容性闸门拒掉的版本（供后续直接标注）。 */
		function rememberBlocked(spec) {
			const value = String(spec || "");
			if (!value || updates.blocked.includes(value)) return;
			const next = updates.blocked.concat([value]).slice(-50);
			try {
				localStorage.setItem(BLOCKED_KEY, JSON.stringify(next));
			} catch (error) {
				/* 隐私模式下不持久化，本次会话内仍然可见 */
			}
			setUpdates({ blocked: next });
		}

		/**
		 * 「可升级集合」的签名 —— 红点的唯一判据。
		 *
		 * 用「包名@目标版本」排序后的串做签名：只要出现**比上次确认过的更新的版本**，
		 * 串就会变，红点重新亮；同一批更新确认过一次之后不再打扰。
		 * 这与用户已有的 check-updates 本地补丁同一套思路（那里存的是 acked-version），
		 * 目的都是避免红点长期常亮。
		 */
		function updateSignature(data) {
			if (!data || typeof data !== "object") return "";
			const parts = [];
			/* 被忽略的条目不进签名 —— 否则"忽略此版本"之后红点照常亮着，等于没忽略 */
			if (data.self && data.self.outdated === true && !isIgnored(data.self)) parts.push("self@" + String(data.self.latest || ""));
			const list = Array.isArray(data.plugins) ? data.plugins : [];
			list.forEach((item) => {
				if (item && item.outdated === true && !isIgnored(item)) parts.push(String(item.name) + "@" + String(item.latest || ""));
			});
			return parts.sort().join("|");
		}

		/** 红点状态：count = 待升级项数，fresh = 有「还没确认过」的更新。 */
		function pendingUpdates() {
			const signature = updateSignature(updates.data);
			return {
				count: signature === "" ? 0 : signature.split("|").length,
				fresh: signature !== "" && signature !== updates.acked,
			};
		}

		/** 用户**看到清单**即视为已确认（在「更新」视图挂载时调用）。 */
		function ackUpdates(scope) {
			const signature = updateSignature(updates.data);
			if (signature === "" || signature === updates.acked) return;
			storeAcked(signature);
			track("plugin_hub", { action: "updates_ack", scope: scope || "view", n: signature.split("|").length });
			setUpdates({ acked: signature });
		}

		async function loadUpdates(force) {
			if (updates.loading) return;
			if (updates.loaded && !force) return;
			setUpdates({ loading: true, error: null });
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 30000);
			try {
				const body = await readHostJson("/api/dpharness/updates" + (force ? "?refresh=1" : ""), controller.signal);
				setUpdates({ loading: false, loaded: true, data: body, stale: false });
			} catch (error) {
				/* 失败要说出来：悄悄回一份空清单，界面会把它读成「全都已是最新」。
				   stale 单独标出来 —— 它对应的是一句可操作的话（重启 dsh），而不是一个技术错误。 */
				const message = error && error.name === "AbortError" ? "timeout" : String((error && error.message) || error);
				setUpdates({ loading: false, loaded: true, error: message, stale: Boolean(error && error.stale) });
			} finally {
				clearTimeout(timer);
			}
		}

		/**
		 * 订阅 + 首次挂载时触发一次检查（幂等）。
		 *
		 * 侧边栏按钮与浮窗胶囊**始终挂着**，所以红点不需要用户先打开任何页面就能亮起来 ——
		 * 这正是"用户根本不知道有新版本"这个问题的解法。
		 */
		function useUpdates() {
			const [, force] = react.useState(0);
			react.useEffect(() => {
				const listener = () => force((n) => n + 1);
				updates.listeners.add(listener);
				/* 关掉自动检查就不查（红点随之不亮）；手动「检查更新」按钮不受影响 */
				if (hub.autoCheck) loadUpdates(false);
				return () => { updates.listeners.delete(listener); };
			}, []);
			return updates;
		}

		/* ------------------------------------------------------------- utilities */
		function format(template, values) {
			return String(template).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole));
		}

		/**
		 * 「共 N 条结果」里的 N 必须是 host 转发的**真实命中总数**（total），
		 * 不是本次返回条数（count）—— 两者在搜索时经常相差一个数量级
		 * （take 默认 30，而「统计」命中 106 条）。
		 *
		 * 为什么这不是文案细节（2026-09-30 实测踩到）：以前 N 取的是返回条数，
		 * 于是**搜索前后这个数字都是 30**，同时列表首屏变化不大，用户据此判定
		 * 「搜索不生效」—— 功能其实是好的，界面没给出任何证据。
		 * 命中数大于已显示条数时，补一句「已显示前 M 条」，让用户知道列表被截断、
		 * 可以切到 60/100 看更多。
		 *
		 * total 缺失（旧 host）时退回返回条数，保证文案仍有意义。
		 */
		function summaryOf(data, t) {
			if (!data) return "";
			const total = Number.isFinite(data.total) ? data.total : data.count;
			const shown = Array.isArray(data.plugins) ? data.plugins.length : 0;
			const base = format(t("count.summary"), { n: total });
			return total > shown && shown > 0 ? base + " · " + format(t("count.partial"), { m: shown }) : base;
		}

		/**
		 * 标题位置的那行副标题。
		 *
		 * 重新搜索时让位给「搜索中…」：列表刻意保留旧结果（避免整块闪空），
		 * 若标题也原样不动，界面就没有任何「点到了」的证据 —— 用户正是据此判定
		 * 「搜索不生效」（2026-09-30）。首次加载不给这里，因为下方已有
		 * 「正在读取插件目录…」，重复反而吵。
		 */
		function countSub(data, t, loading, suffix) {
			if (!data) return suffix || "";
			if (loading) return t("count.searching");
			return summaryOf(data, t) + (suffix ? " · " + suffix : "");
		}

		/* ------------------------------------------------------- 每日推荐（纯函数） */
		/**
		 * 每日推荐的三个口径，全部做成纯函数：便于单测，也保证所有入口拿到同一份答案。
		 *
		 * 为什么是「按日期算」而不是服务端下发（2026-10-12 定的方案）：
		 * 站点当时没有每日推荐接口（/api/daily、/api/today、/api/recommend 实测全 404），
		 * 而 /api/best 是**月度策展榜单** —— 本身就是编辑审过的集合，从它里按自然日取一条，
		 * 质量有兜底、零站点改动；代价是这条「推荐」是机械轮换，不是编辑每天点选。
		 * 日后站点若给出 /api/daily，只需替换 pickDaily 的数据源，界面无需改动。
		 *
		 * 时区固定 UTC+8：用本地时区会让同一天不同地区的用户看到不同的一条，
		 * 而「今日推荐」的语义本来就是「今天大家看到的是同一条」。
		 */
		const DAILY_TZ_MS = 8 * 60 * 60 * 1000;

		/** 自然日键（UTC+8），形如 2026-10-12。入参是毫秒时间戳，便于测试固定时间。 */
		function dailyKey(nowMs) {
			const shifted = new Date((Number(nowMs) || 0) + DAILY_TZ_MS);
			const y = shifted.getUTCFullYear();
			const m = shifted.getUTCMonth() + 1;
			const d = shifted.getUTCDate();
			return y + "-" + (m < 10 ? "0" : "") + m + "-" + (d < 10 ? "0" : "") + d;
		}

		/** FNV-1a 32 位。用它而不是随机数：同一天必须收敛到同一条，且不依赖任何外部状态。 */
		function hashKey(text) {
			let hash = 0x811c9dc5;
			const value = String(text == null ? "" : text);
			for (let index = 0; index < value.length; index += 1) {
				hash ^= value.charCodeAt(index);
				hash = Math.imul(hash, 0x01000193) >>> 0;
			}
			return hash >>> 0;
		}

		/** 展平 /api/best 的三级结构（大类 → 小类 → 条目），并记住条目所属的小类/大类。 */
		function flattenBest(data) {
			const output = [];
			const categories = data && Array.isArray(data.categories) ? data.categories : [];
			categories.forEach((cat) => {
				const subs = Array.isArray(cat.subs) ? cat.subs : [];
				subs.forEach((sub) => {
					const items = Array.isArray(sub.items) ? sub.items : [];
					items.forEach((item) => {
						if (!item) return;
						/* 目录类条目的唯一键是 fullName；缺它就无从比较、也无从稳定排序 */
						const key = item.fullName || item.pkg;
						if (!key) return;
						output.push({ item: item, key: String(key), cat: cat.label || cat.key || "", sub: sub.label || sub.key || "" });
					});
				});
			});
			return output;
		}

		/**
		 * 取「今天的」那一条。
		 *
		 * ⚠️ 候选**必须先稳定排序**再取模：上游 /api/best 的分组顺序会随站点重算榜单、
		 * 增删小类而变化；若按原顺序取模，同一天刷新两次就可能换人 ——
		 * 「每日推荐」只要不稳定，它就不再是一个可信的说法。
		 * 排序键用条目的唯一键，结果与上游顺序完全无关。
		 */
		function pickDaily(data, dateKey) {
			const all = flattenBest(data);
			if (all.length === 0) return null;
			const sorted = all.slice().sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
			return sorted[hashKey(dateKey) % sorted.length];
		}

		/**
		 * 当前自然日键，跨天自动刷新。
		 *
		 * dsh 是常驻页面，用户可能几天不关 —— 只在挂载时算一次的话，
		 * 第二天打开的还是昨天那条。用 60s 轮询 + 页面重新可见/获得焦点时立即比对，
		 * 都很便宜（一次字符串相等判断），不做定时器级的精确对齐。
		 */
		function useDateKey() {
			const [key, setKey] = react.useState(() => dailyKey(Date.now()));
			react.useEffect(() => {
				const sync = () => setKey((current) => {
					const next = dailyKey(Date.now());
					return next === current ? current : next;
				});
				const timer = setInterval(sync, 60000);
				window.addEventListener("visibilitychange", sync);
				window.addEventListener("focus", sync);
				return () => {
					clearInterval(timer);
					window.removeEventListener("visibilitychange", sync);
					window.removeEventListener("focus", sync);
				};
			}, []);
			return key;
		}

		/* ------------------------------------------------------------ 浮窗位置（可拖动） */
		/* 为什么要能拖：右下角在 dsh 里不是空位 —— 实测与「检查更新」等既有按钮重叠。
		   拖动后位置记在 localStorage（right/bottom，单位 px），下次进来还在原处。 */
		const POS_KEY = "dph-hub-pos";
		const EDGE = 8;
		const DRAG_THRESHOLD = 5;
		/**
		 * 默认位置刻意**不贴右下角**，且要避开其它插件已占的那几个位置。
		 *
		 * 实测（1280×860 与 1280×900 两次量测，2026-09-17/18）右下角竖着排了三个
		 * **z-index 同为 2147483000** 的浮动按钮，DOM 靠后的会压住前面的：
		 *   · `#dsh-check-updates-btn`（「检查更新」）  bottom 16..48
		 *   · `#mem-open`（dsh-mnemon 的「🧠 Memory」）bottom 56..96
		 * 故取 bottom:108（在两者之上）—— 108 这个数是量出来的，不是拍的：
		 * 曾经用 60，正好落在 mnemon 按钮的 56..96 里，导致胶囊被完全覆盖、
		 * **点不动**（playwright 报 `#mem-open … intercepts pointer events`）。
		 *
		 * 不用提高 z-index 去抢：那会让被压住的那个按钮反过来点不动（同样是别人的功能）。
		 * 位置冲突可以用位置解决；用户仍可拖动，位置会记住。
		 */
		const DEFAULT_POS = { right: 16, bottom: 108 };

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
				readHostJson("/api/dpharness/search?" + params.toString(), controller.signal)
					.then((body) => {
						if (controller.signal.aborted) return;
						setState({ loading: false, data: body, error: null });
						if (debounced) {
							// 只上报关键词长度与命中数，不上报关键词原文。
							// 命中数取 total（真实命中总数）：取返回条数时它恒等于 take，
							// 对「这次搜索到底有没有命中东西」没有任何信息量。
							track("plugin_hub", {
								action: "search",
								length: debounced.length,
								results: Number.isFinite(body.total) ? body.total : body.count,
							});
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

		/**
		 * 「分类精选」榜单取数（站点 /best 的同源数据）。
		 *
		 * 按需拉取：只有用户切到该视图才请求，不拖慢默认打开速度。
		 * 拿到一次就不再重复请求（榜单每月 1 日才重算），手动刷新才重取。
		 */
		function useBest(t, enabled) {
			const [reload, setReload] = react.useState(0);
			const [state, setState] = react.useState({ loading: false, data: null, error: null });
			const [copiedCmd, setCopiedCmd] = react.useState("");
			const loaded = react.useRef(false);

			react.useEffect(() => {
				if (!enabled) return undefined;
				if (loaded.current && reload === 0) return undefined;
				loaded.current = true;
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), 20000);
				setState((previous) => ({ loading: true, data: previous.data, error: null }));
				readHostJson("/api/dpharness/best", controller.signal)
					.then((body) => {
						if (controller.signal.aborted) return;
						setState({ loading: false, data: body, error: null });
						track("plugin_hub", { action: "best_open", cats: (body.categories || []).length, total: body.total || 0 });
					})
					.catch((error) => {
						if (controller.signal.aborted) return;
						const message = error && error.name === "AbortError" ? "timeout" : String((error && error.message) || error);
						setState((previous) => ({ loading: false, data: previous.data, error: message }));
					})
					.finally(() => clearTimeout(timer));
				return () => clearTimeout(timer);
			}, [enabled, reload]);

			const markCopied = react.useCallback((text) => {
				setCopiedCmd(text);
				setTimeout(() => setCopiedCmd((current) => (current === text ? "" : current)), 2000);
			}, []);

			return { state, copiedCmd, markCopied, refresh: () => setReload((n) => n + 1) };
		}

		/**
		 * 「套装」取数（站点 /sets 的同源数据，经本机 host 转发）。
		 *
		 * 与 useBest 同一条纪律：只在切到该视图时才请求；拿到一次就不再重复，
		 * 点刷新才重取（缓存交给 host，TTL 5 分钟）。
		 * 与 best 的区别：这里拿到的是**整套方案**（逐条命令与批量命令都由 host 用
		 * 本机 profile 拼好，客户端只负责展示与复制）。
		 */
		function useSets(t, enabled) {
			const [reload, setReload] = react.useState(0);
			const [state, setState] = react.useState({ loading: false, data: null, error: null });
			const [copiedCmd, setCopiedCmd] = react.useState("");
			const loaded = react.useRef(false);

			react.useEffect(() => {
				if (!enabled) return undefined;
				if (loaded.current && reload === 0) return undefined;
				loaded.current = true;
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), 20000);
				setState((previous) => ({ loading: true, data: previous.data, error: null }));
				readHostJson("/api/dpharness/sets", controller.signal)
					.then((body) => {
						if (controller.signal.aborted) return;
						setState({ loading: false, data: body, error: null });
						track("plugin_hub", { action: "sets_open", n: (body.sets || []).length });
					})
					.catch((error) => {
						if (controller.signal.aborted) return;
						const message = error && error.name === "AbortError" ? "timeout" : String((error && error.message) || error);
						setState((previous) => ({ loading: false, data: previous.data, error: message }));
					})
					.finally(() => clearTimeout(timer));
				return () => clearTimeout(timer);
			}, [enabled, reload]);

			const markCopied = react.useCallback((text) => {
				setCopiedCmd(text);
				setTimeout(() => setCopiedCmd((current) => (current === text ? "" : current)), 2000);
			}, []);

			return { state, copiedCmd, markCopied, refresh: () => setReload((n) => n + 1) };
		}

		/**
		 * 更新日志（本机 host 的只读接口）。
		 *
		 * 只在**设置页被打开时**才请求 —— 它是设置页里的一节，没必要在每次打开浮窗时拉一遍。
		 * 与 useBest 一样：拿到一次就不再重复请求，点刷新才重取（缓存交给 host，TTL 5 分钟）。
		 */
		function useChangelog() {
			const [reload, setReload] = react.useState(0);
			const [state, setState] = react.useState({ loading: true, data: null, error: null, stale: false });
			const [copiedCmd, setCopiedCmd] = react.useState("");
			const loaded = react.useRef(false);

			react.useEffect(() => {
				if (loaded.current && reload === 0) return undefined;
				loaded.current = true;
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), 20000);
				setState((previous) => ({ loading: true, data: previous.data, error: null }));
				readHostJson("/api/dpharness/changelog", controller.signal)
					.then((body) => {
						if (controller.signal.aborted) return;
						setState({ loading: false, data: body, error: null, stale: false });
						/* 只在**确实有新版本**时上报：这条事件的用途是「有多少人停在旧版」，
						   把"已是最新"也报进来会把分母撑大，比例就没了意义。 */
						if (body.outdated === true) {
							track("plugin_hub", { action: "changelog_open", scope: "outdated" });
						}
					})
					.catch((error) => {
						if (controller.signal.aborted) return;
						const message = error && error.name === "AbortError" ? "timeout" : String((error && error.message) || error);
						setState({ loading: false, data: null, error: message, stale: Boolean(error && error.stale) });
					})
					.finally(() => clearTimeout(timer));
				return () => clearTimeout(timer);
			}, [reload]);

			const markCopied = react.useCallback((text) => {
				setCopiedCmd(text);
				setTimeout(() => setCopiedCmd((current) => (current === text ? "" : current)), 2000);
			}, []);

			return { state, copiedCmd, markCopied, refresh: () => setReload((n) => n + 1) };
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
				/* kind 只改文案与埋点名 —— 执行路径、二次确认、进度与重启提示全部共用同一套 */
				const upgrading = props.kind === "upgrade";
				const kind = upgrading ? "upgrade" : "catalog";
				const state = useHub();
				const [confirming, setConfirming] = react.useState(false);
				const [restarting, setRestarting] = react.useState(false);
				const [restartFailed, setRestartFailed] = react.useState(false);
				const [copiedRaw, setCopiedRaw] = react.useState(false);
				if (!item.pkg) return null;
				/* 已经装过的**不要再写"安装"** —— 实测有用户对着早就装好的插件反复点「安装」，
				   然后判定"安装不成功"（卡片上的「已安装 vX」标注还不够，按钮才是他看的那一处）。 */
				const idleLabel = upgrading ? t("updates.upgrade") : item.installed ? t("install.reinstall") : t("install.action");
				const confirmLabel = upgrading ? t("updates.upgradeConfirm") : item.installed ? t("install.reinstallConfirm") : t("install.confirm");

				const job = state.install;
				const mine = job && job.target === item.pkg;
				const busyElsewhere = !!(job && job.active && !mine);

				if (mine && job.active) {
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instMsg", key: "msg" }, job.message),
					]);
				}

				if (mine && (job.phase === "okMarket" || job.phase === "okLocal")) {
					/* 三态（host 读盘得出）：changed 装上了 / same **本来就是目标版本**（这是成功）/
					   none 真的什么都没发生。把 same 说成"什么都没装"会让人以为安装失败
					   （2026-10-12 实测被这句误导：用户对着早就装好的插件点安装）。 */
					const outcome = job.outcome || (job.changed === false ? "same" : "changed");
					const needsRestart = outcome === "changed" && job.phase === "okLocal";
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instMsg " + (outcome === "none" ? "dph_instBad" : "dph_instOk"), key: "msg" },
							outcome === "none" ? t("updates.noChangeTitle") : outcome === "same" ? t("updates.alreadyTitle") : job.message),
						outcome === "none" ? h("span", { className: "dph_instHint", key: "nochange" }, format(t("updates.noChange"), { v: String(job.after || job.before || "?") })) : null,
						outcome === "same" ? h("span", { className: "dph_instHint", key: "already" }, format(t("updates.alreadyHint"), { v: String(job.after || "?") })) : null,
						needsRestart
							? h("button", {
									className: "dph_btn dph_btnPrimary",
									key: "restart",
									type: "button",
									disabled: restarting,
									onClick: async () => {
										setRestarting(true);
										/* 点击即上报。结果不能在这里等 —— 成功的重启会掐断这个
										   请求，"重启成功"只能由下次加载时的 post_install 证明；
										   所以这里只记「谁按了」，不记「按了之后成没成」。 */
										track("plugin_hub", { action: "restart_click", via: "local" });
										const ok = await restartServer();
										setRestarting(false);
										if (!ok) {
											setRestartFailed(true);
											track("plugin_hub", { action: "restart_failed", via: "local", why: "restart_http" });
										}
									},
								}, t("install.restart"))
							: null,
						needsRestart && restartFailed
							? h("span", { className: "dph_instMsg dph_instBad", key: "fail" }, "重启接口不可用，请手动重启 dsh")
							: null,
					]);
				}

				if (mine && job.phase === "failed") {
					/* 被 dsh 自带的兼容性闸门拒绝 ≠ 安装出错：它是**预期结果**，
					   必须把原因、两端版本与放行通道说清楚 —— 只说"失败"用户只会觉得功能坏了
					   （实测踩到：通用错误提取抓不到这句话，界面只剩 "dsh: nothing was installed."）。 */
					if (job.why === "incompatible" && job.reject) {
						return h("div", { className: "dph_instRow dph_instCol" }, [
							h("span", { className: "dph_instMsg dph_instBad", key: "title" }, t("updates.blockedTitle")),
							h("span", { className: "dph_instHint", key: "body" }, format(t("updates.blockedBody"), { spec: job.reject.spec || "", dsh: job.reject.dsh || "" })),
							h("span", { className: "dph_instHint", key: "how" }, t("updates.blockedHow")),
							h("button", {
								className: "dph_btn",
								key: "raw",
								type: "button",
								onClick: () => copyText(job.message || "", () => {
									setCopiedRaw(true);
									setTimeout(() => setCopiedRaw(false), 2000);
								}),
							}, copiedRaw ? t("action.copied") : t("updates.copyRaw")),
						]);
					}
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instMsg dph_instBad", key: "msg" }, t("install.failed") + "：" + job.message),
					]);
				}

				if (confirming) {
					return h("div", { className: "dph_instRow" }, [
						h("span", { className: "dph_instHint", key: "hint" }, t(upgrading ? "updates.upgradeHint" : "install.hint")),
						h("button", {
							className: "dph_btn dph_btnPrimary",
							key: "go",
							type: "button",
							onClick: () => {
								setConfirming(false);
								runInstall(item, t, kind);
							},
						}, confirmLabel),
						h("button", {
							className: "dph_btn",
							key: "cancel",
							type: "button",
							onClick: () => {
								setConfirming(false);
								/* 取消单独记一次：只埋 install（确认后）的话，
								   「想装但被确认框劝退」的人会整段消失，
								   而他们恰恰是文案/门槛该优化的对象。 */
								track("plugin_hub", { action: upgrading ? "upgrade_cancel" : "install_cancel", via: "confirm" });
							},
						}, t("install.cancel")),
					]);
				}

				return h("div", { className: "dph_instRow" }, [
					h("button", {
						className: "dph_btn dph_btnPrimary",
						key: "install",
						type: "button",
						disabled: busyElsewhere,
						title: busyElsewhere ? t("install.busy") : item.pkg,
						onClick: () => {
							setConfirming(true);
							track("plugin_hub", { action: upgrading ? "upgrade_ask" : "install_ask", via: "confirm" });
						},
					}, busyElsewhere ? t("install.busy") : idleLabel),
					/* 升级行里包名已经在第二行显示过了，这里再摊一遍只是重复；
					   精确目标（@latest）仍留在按钮的 title 上，悬停可见。 */
					upgrading ? null : h("span", { className: "dph_instHint", key: "pkg" }, item.pkg),
				]);
			}

			/**
		 * 「分类精选」视图：大类（可折叠）→ 小类 → 条目。
		 *
		 * 与「严选推荐」的区别：那边是**可搜索的全量目录**（按你的关键词找），
		 * 这边是**月度策展结果**（每小类只留 2~3 个），回答的是"按用途该装哪几个"。
		 * 所以渲染上刻意保留两项元数据：
		 *   · rank —— 小类内名次，用户要知道"这是这个小类里最好的第几个"；
		 *   · reason —— 上榜理由（如"实装验证通过 · 周下载 12.8 万"），
		 *     这是"为什么是它"的依据，去掉就只是又一个列表。
		 *
		 * 大类**默认全部收起**（2026-10-13 用户反馈：「分类精选默认折叠」）——
		 * 原先第一个大类默认展开，用户一进视图看到的不是"有哪些类"、
		 * 而是某一个类的全部内容，想扫别的类还得先动手关它。9 个大类一屏列完，
		 * 点哪个看哪个。展开状态在本次会话内保留：`open` 是常量 false，
		 * React 只认 prop 变化，不会把用户手动展开的类重新收回去；
		 * 切走再切回视图才恢复默认收起。
		 */
			function renderBest(data, copiedCmd, onCopied) {
				if (!data) return null;
				const cats = Array.isArray(data.categories) ? data.categories : [];
				return cats.map((cat, index) =>
					h("details", { className: "dph_bestCat", key: cat.key || String(index), open: false }, [
						h("summary", { className: "dph_bestCatHead", key: "head" }, [
							h("span", { key: "name" }, cat.label),
							h(
								"span",
								{ className: "dph_bestCatCount", key: "count" },
								format(t("best.catCount"), { subs: (cat.subs || []).length, n: cat.count || 0 }),
							),
						]),
						...(cat.subs || []).map((sub) =>
							h("div", { className: "dph_bestSub", key: sub.key }, [
								h("div", { className: "dph_bestSubHead", key: "subHead" }, [
									h("span", { className: "dph_bestSubName", key: "n" }, sub.label),
									sub.summary
										? h("span", { className: "dph_bestSubSum", key: "s", title: sub.summary }, sub.summary)
										: null,
								]),
								h(
									"div",
									{ className: "dph_list", key: "list" },
									(sub.items || []).map((item) =>
										h("div", { key: item.fullName, className: "dph_bestItem" }, [
											item.rank
												? h("div", { className: "dph_bestRank", key: "rank" }, "#" + item.rank)
												: null,
											renderCard(item, copiedCmd, onCopied, true),
											item.reason
												? h("div", { className: "dph_bestReason", key: "why" }, item.reason)
												: null,
										]),
									),
								),
							]),
						),
					]),
				);
			}

			/**
			 * 「一键安装整套」—— 与「全部升级」同一条两步确认（它会连着改十几次 profile，
			 * 一键直落是这一屏里最容易误触的破坏性动作）。
			 *
			 * 另有一套批量在跑（不分升级/安装）时按钮禁用：宿主同一时刻只允许一个安装任务，
			 * 让用户点了必然拿到 409 不如当场说清。
			 */
			function SetInstallButton(props) {
				const set = props.set;
				const state = useHub();
				const [asked, setAsked] = react.useState(false);
				const count = (set.items || []).filter((item) => item.pkg).length;
				const batch = state.batch;
				const mine = Boolean(batch && batch.scope === "set" && batch.slug === (set.slug || ""));
				if (mine && batch.active) {
					return h("span", { className: "dph_logCmd", key: "run" }, [
						h("span", { className: "dph_instMsg", key: "msg" }, format(t("sets.installing"), { done: batch.finished, total: batch.total, name: batch.current || "" })),
						h("button", {
							className: "dph_btn",
							key: "stop",
							type: "button",
							onClick: () => setHub({ batch: { ...hub.batch, stopRequested: true } }),
						}, t("updates.stop")),
					]);
				}
				if (mine && !batch.active && batch.total > 0) {
					return h("span", { className: "dph_instMsg", key: "done" }, format(t("updates.batchDone"), { done: batch.finished, failed: batch.failed }));
				}
				if (count === 0) return null;
				const busyElsewhere = Boolean(batch && batch.active);
				return h("span", { className: "dph_logCmd", key: "go" }, [
					asked ? h("span", { className: "dph_setHint", key: "warn" }, format(t("sets.installAllConfirm"), { n: count })) : null,
					h("button", {
						className: "dph_btn" + (asked ? " dph_btnPrimary" : ""),
						key: "btn",
						type: "button",
						disabled: busyElsewhere,
						title: busyElsewhere ? t("install.busy") : "",
						onClick: () => {
							if (!asked) {
								setAsked(true);
								track("plugin_hub", { action: "set_install_ask", slug: set.slug || "", n: count });
								return;
							}
							setAsked(false);
							runSetInstall(set, t);
						},
					}, format(t("sets.installAll"), { n: count })),
				]);
			}

			/**
			 * 「套装」视图：一整套方案（跨插件纵向组合）→ 槽位 → 批量命令。
			 *
			 * 与「分类精选」的分工：那边是同类**横向**最优（按小类导购），
			 * 这里是**纵向**组合（回答"我这件整事该配哪一套"）。
			 *
			 * 与分类精选同一条默认：大类/套装**默认全部收起**（2026-10-13 用户反馈），
			 * 一屏列出所有方案，点哪个看哪个。
			 *
			 * ⚠️ 命令一个字都不在客户端拼：批量命令与逐条命令都由 host 用**本机 profile**
			 * 拼好（`installBlock` / `item.cmd`）。客户端只负责展示与复制 —— 抄站点那份
			 * 会把桌面用户装进 web profile（实测踩过）。
			 */
			function renderSets(data, copiedCmd, onCopied) {
				if (!data) return null;
				const sets = Array.isArray(data.sets) ? data.sets : [];
				return sets.map((set, index) =>
					h("details", { className: "dph_bestCat", key: set.slug || String(index), open: false }, [
						h("summary", { className: "dph_bestCatHead", key: "head" }, [
							h("span", { key: "name" }, set.name),
							h("span", { className: "dph_bestCatCount", key: "count" }, format(t("sets.itemCount"), { n: set.itemCount || 0 })),
						]),
						h("div", { className: "dph_bestSub", key: "body" }, [
							h("div", { className: "dph_bestSubHead", key: "lead" }, [
								h("span", { className: "dph_bestSubName", key: "sum" }, set.summary),
								set.audience ? h("span", { className: "dph_bestSubSum", key: "who", title: set.audience }, set.audience) : null,
							]),
							/* 风险徽标：站点给的是结论（自动扫描优先），没结论就没有这条 —— 与页面同口径 */
							set.risk || set.syncedMonth
								? h("div", { className: "dph_tags", key: "meta" }, [
										set.risk ? h("span", { className: "dph_tag" + (set.risk.level === "high" ? " dph_tagBad" : ""), key: "risk", title: set.risk.desc || "" }, set.risk.label) : null,
										set.syncedMonth && set.syncedSlots ? h("span", { className: "dph_tag", key: "sync" }, format(t("sets.synced"), { m: set.syncedMonth, s: set.syncedSlots })) : null,
									])
								: null,
							h("div", { className: "dph_list", key: "list" }, (set.items || []).map((item) =>
								h("div", { className: "dph_setRow", key: item.fullName }, [
									h("span", { className: "dph_setRole", key: "role", title: item.slotRole || "" }, item.slotRole || ""),
									h("span", { className: "dph_setName", key: "name" }, item.nameZh || item.name || item.fullName || ""),
									h("span", { className: "dph_tag", key: "need" }, t("need." + (item.need || "enhance"))),
									item.installed
										? h("span", { className: "dph_tag dph_tagOk", key: "inst" }, format(t("card.installed"), { v: item.installed }))
										: h("span", { className: "dph_stars", key: "stars" }, format(t("badge.stars"), { n: item.stars })),
								]),
							)),
							h("div", { className: "dph_logCmd", key: "install" }, h(SetInstallButton, { set: set })),
							set.installBlock
								? h("div", { className: "dph_cmdWrap", key: "block" }, [
										h("div", { className: "dph_cmdRow", key: "row" }, [
											h("code", { className: "dph_cmd dph_cmdBlock", key: "code" }, set.installBlock),
											h("button", {
												className: "dph_btn",
												key: "copy",
												type: "button",
												onClick: () => copyText(set.installBlock, () => {
													onCopied(set.installBlock);
													track("copy_install", { cmd: set.installBlock, pkg: "" });
													track("plugin_hub", { action: "set_copy", slug: set.slug || "" });
												}),
											}, copiedCmd === set.installBlock ? t("action.copied") : t("action.copy")),
										]),
										h("span", { className: "dph_instHint", key: "hint" }, t("sets.batchHint")),
									])
								: null,
							set.conflictNote
								? h("div", { className: "dph_setHint dph_instBad", key: "conflict" }, t("sets.conflict") + "：" + set.conflictNote)
								: null,
							set.url
								? h("a", { className: "dph_btn", key: "site", href: set.url, target: "_blank", rel: "noopener noreferrer", onClick: () => track("plugin_hub", { action: "set_site", slug: set.slug || "" }) }, t("sets.detail"))
								: null,
						]),
					]),
				);
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
					? h("div", { className: "dph_cmdWrap", key: "cmd" }, [
							h("div", { className: "dph_cmdRow", key: "row" }, [
								// 未发布到 npm 时标明来源 —— 站点详情页也是这么标注的，两处用词保持一致
								item.src === "repo"
									? h("span", { className: "dph_tag", key: "src" }, t("label.repoSource"))
									: null,
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
							]),
							item.src === "repo" ? h("div", { className: "dph_instHint", key: "hint" }, t("hint.repoSource")) : null,
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
					/* 已经装过就直说 —— 实测有用户对着一个早就装好的插件反复点「安装」，
					   然后判定"安装不成功"（他无从知道那东西其实已经在跑了）。 */
					item.installed ? h("div", { className: "dph_tags", key: "installed" }, h("span", { className: "dph_tag dph_tagOk" }, format(t("card.installed"), { v: item.installed }))) : null,
					sellRow,
					descRow,
					h(InstallRow, { item: item, key: "install" }),
					cmdRow,
				]);
			}

			function Notice(props) {
				return h("div", { className: "dph_notice" + (props.kind === "bad" ? " dph_noticeBad" : "") }, props.text);
			}

			/**
			 * 「今日推荐」卡片 —— 浮窗、页签与「每日推荐」视图共用同一个组件。
			 *
			 * 三态都要给出交代，不能只是"没渲染"：取数中 → 显示加载语；
			 * 出错/数据为空 → 明确说「暂不可用」。因为这张卡片出现在默认视图顶部，
			 * 它是最先被看到的位置，悄悄消失会让人以为功能坏了。
			 *
			 * 内层复用 renderCard（同一个插件的呈现只有一份实现），
			 * 本组件只负责上面那行「今日 + 日期 + 所属小类」的抬头与上榜理由。
			 */
			function dailyCard(best, copiedCmd, onCopied, opts) {
				const picked = best.state.data ? pickDaily(best.state.data, opts.dateKey) : null;
				/* 窄面板里默认**收成一行**（调用方给 opts.collapsed + opts.toggle）：
				   实测浮动面板 max-height 只有 min(72vh, 620px)，而完整的今日推荐卡约 350px
				   且 flex:none 不收缩 —— 结果区被压到只剩一小条，用户的说法是
				   「今日推荐的置顶遮挡，导致其他的插件看不到了」。收起时"今天是谁"仍留在标题行。 */
				const collapsible = typeof opts.toggle === "function";
				const head = h("div", { className: "dph_dailyHead", key: "head" }, [
					h("span", { className: "dph_dailyTag", key: "tag" }, t("daily.title")),
					h("span", { className: "dph_dailyDate", key: "date" }, opts.dateKey),
					opts.collapsed && picked ? h("span", { className: "dph_updName", key: "who" }, String(picked.item.nameZh || picked.item.name || picked.item.fullName || "")) : null,
					opts.collapsed && picked && picked.item.installed ? h("span", { className: "dph_tag dph_tagOk", key: "inst" }, format(t("card.installed"), { v: picked.item.installed })) : null,
					h("span", { className: "dph_spacer", key: "gap" }),
					picked
						? h("span", { className: "dph_dailyPath", key: "path" }, [picked.cat, picked.sub].filter(Boolean).join(" › "))
						: null,
					collapsible && picked
						? h("button", { className: "dph_btn", key: "toggle", type: "button", onClick: opts.toggle }, t(opts.collapsed ? "daily.expand" : "daily.collapse"))
						: null,
				]);
				if (!picked) {
					return h("div", { className: "dph_daily", key: "daily" }, [
						head,
						h("div", { className: "dph_instMsg", key: "msg" }, best.state.error ? t("daily.empty") : t("daily.loading")),
					]);
				}
				if (opts.collapsed) return h("div", { className: "dph_daily", key: "daily" }, [head]);
				return h("div", { className: "dph_daily", key: "daily" }, [
					head,
					renderCard(picked.item, copiedCmd, onCopied, true),
					picked.item.reason
						? h("p", { className: "dph_dailyWhy", key: "why" }, t("daily.why") + "：" + picked.item.reason)
						: null,
					h("div", { className: "dph_setHint", key: "hint" }, t("daily.hint")),
				]);
			}

			/**
			 * 「待重启」横幅 —— 本地通道安装/升级成功后的激活闭环（2026-10-13）。
			 *
			 * 为什么是横幅而不是行内按钮：行内提示跟着卡片走，用户切个视图、装第二个
			 * 插件就看不见了；而「装了没启用」正是实装验证率最大的漏点（桌面 profile
			 * 实测没有 dshmarket，安装全走本地通道、必须重启）。所以它挂在面板与页签
			 * 顶部，跨视图、跨会话存在，直到重启生效或用户明确说「知道了」。
			 *
			 * 挂载时向宿主要 startedAt（/api/dpharness/meta）：它比 pending.at 新，
			 * 说明重启已经发生过 —— 这时该说「已生效」而不是继续催重启。取不到就按
			 * 「还没重启」处理：宁可多提醒一次，也不能把提醒悄悄吞掉。
			 */
			function RestartBanner(props) {
				const pending = useHub().restartPending;
				const scope = props && props.scope ? props.scope : "panel";
				const [armed, setArmed] = react.useState(false);
				const [restarting, setRestarting] = react.useState(false);
				const [failed, setFailed] = react.useState(false);
				const [effective, setEffective] = react.useState(false);
				react.useEffect(() => {
					if (!pending) return undefined;
					let alive = true;
					/* 先按「需要重启」算：新的待重启（又装了一个）不能沿用上一次的「已生效」 */
					setEffective(false);
					getJson("/api/dpharness/meta")
						.then((body) => {
							if (!alive || !body) return;
							setEffective(typeof body.startedAt === "number" && body.startedAt > pending.at);
						})
						.catch(() => {});
					return () => { alive = false; };
				}, [pending]);
				if (!pending) return null;
				const names = pending.names;
				const label = names.length <= 2 ? names.join("、") : names.slice(0, 2).join("、") + " 等 " + names.length + " 个";
				const dismiss = (key) => h("button", {
					className: "dph_btn",
					key: key,
					type: "button",
					onClick: () => {
						track("plugin_hub", { action: "restart_ack", scope: scope });
						clearRestartPending();
					},
				}, t("install.dismiss"));
				if (effective) {
					return h("div", { className: "dph_restart dph_restartOk", key: "restart" }, [
						h("span", { className: "dph_dailyTag", key: "tag" }, t("install.effective")),
						h("span", { className: "dph_restartText", key: "text" }, format(t("install.effectiveBody"), { n: label })),
						h("span", { className: "dph_logCmd", key: "cmds" }, dismiss("ok")),
					]);
				}
				return h("div", { className: "dph_restart", key: "restart" }, [
					h("span", { className: "dph_dailyTag", key: "tag" }, t("install.pendingTag")),
					h("span", { className: "dph_restartText", key: "text" }, format(t("install.pendingBody"), { n: label })),
					h("span", { className: "dph_logCmd", key: "cmds" }, [
						armed ? h("span", { className: "dph_setHint", key: "warn" }, t("updates.restartConfirm")) : null,
						h("button", {
							className: "dph_btn dph_btnPrimary",
							key: "restart",
							type: "button",
							disabled: restarting,
							onClick: async () => {
								/* 两步确认：重启会掐断用户当前会话，与「更新」视图那条同一条规则 */
								if (!armed) {
									setArmed(true);
									track("plugin_hub", { action: "restart_ask", scope: scope });
									return;
								}
								setArmed(false);
								setRestarting(true);
								track("plugin_hub", { action: "restart_click", via: scope });
								const ok = await restartServer();
								setRestarting(false);
								if (!ok) {
									setFailed(true);
									track("plugin_hub", { action: "restart_failed", via: scope, why: "restart_http" });
								}
							},
						}, restarting ? t("install.running") : t("install.restart")),
						dismiss("dismiss"),
						failed ? h("span", { className: "dph_instMsg dph_instBad", key: "fail" }, t("install.restartFailed")) : null,
					]),
				]);
			}

			/**
			 * 设置 → 通用 里的一行：只放**最高频**的那一个开关（浮窗显隐）。
			 *
			 * 为什么这一行值得存在：浮窗是跨路由常驻的，被关掉之后用户最可能问的就是
			 * 「我从哪儿再打开它」—— 设置里的这一行就是那个答案，且与页签底部、
			 * 侧边栏按钮共用同一条写路径，不会出现三处状态不一致。
			 */
			function SettingsFloatRow() {
				const state = useHub();
				return h("div", { className: "dph_setRow" }, [
					h("span", { className: "dph_setCol", key: "col" }, [
						h("span", { className: "dph_setLabel", key: "l" }, t("settings.float")),
						h("span", { className: "dph_setHint", key: "h" }, t("settings.floatHint")),
					]),
					h("label", { className: "dph_tel", key: "sw" }, [
						h("input", {
							key: "box",
							type: "checkbox",
							checked: !state.hidden,
							onChange: (event) => setFloatVisible(event.target.checked, "settings"),
						}),
						h("span", { key: "t" }, state.hidden ? t("settings.off") : t("settings.on")),
					]),
				]);
			}

			/**
			 * 版本条目列表 —— 设置页的「更新日志」节与浮窗的「更新」视图**共用同一份渲染**。
			 * openIndex = 默认展开哪一条（0 = 最新一条；null = 全部收起）。
			 */
			function changelogList(entries, prefix, openIndex) {
				return (Array.isArray(entries) ? entries : []).map((entry, index) => h("details", {
					className: "dph_log",
					key: prefix + (entry.version || String(index)),
					/* 最新一条默认展开：其余折叠，否则一屏全是历史 */
					open: openIndex !== null && index === openIndex,
				}, [
					h("summary", { className: "dph_logHead", key: "head" }, [
						h("span", { className: "dph_logVer", key: "v" }, "v" + (entry.version || "")),
						entry.date ? h("span", { className: "dph_logDate", key: "d" }, entry.date) : null,
						h("span", { className: "dph_logTitle", key: "t" }, entry.title || ""),
					]),
					(entry.items || []).length
						? h("ul", { className: "dph_logItems", key: "items" }, entry.items.map((line, i) => h("li", { key: String(i) }, line)))
						: h("div", { className: "dph_logItems", key: "empty" }, t("changelog.noItems")),
				]));
			}

			/**
			 * 「更新日志」**块**（浮窗「更新」视图用）。
			 *
			 * 默认**收起成一行**：这个视图的主任务是"该升哪些"，日志是参考信息 ——
			 * 一进来就铺开会把升级列表挤到屏幕外；收起的摘要行仍能看出最新一版是什么。
			 */
			function changelogBlock(entries, prefix) {
				const list = Array.isArray(entries) ? entries : [];
				if (list.length === 0) return null;
				const newest = list[0] || {};
				return h("details", { className: "dph_log", key: prefix + "log" }, [
					h("summary", { className: "dph_logHead", key: "head" }, [
						h("span", { className: "dph_logVer", key: "label" }, t("changelog.title")),
						h("span", { className: "dph_logDate", key: "v" }, "v" + String(newest.version || "")),
						h("span", { className: "dph_logTitle", key: "title" }, newest.title || ""),
					]),
					h("div", { className: "dph_logNest", key: "body" }, changelogList(list, prefix + ":", 0)),
				]);
			}

			/**
			 * 设置页里的「更新日志」一节。
			 *
			 * 三件事一起给，缺一件就不好用：
			 *   ① 我装的是哪个版本（current，来自 host 的代码常量）；
			 *   ② 有没有更新的版本（outdated 是三态：true / false / 未知）；
			 *   ③ 有的话怎么升（upgrade 命令，profile 已按本机填好，点一下复制）。
			 * 只有 ② 明确为 true 时才谈 ③ ——「未知」时把命令摊出来，只会让人怀疑是不是网络出问题。
			 */
			function changelogSection(cl, pending) {
				const data = cl.state.data;
				if (!data) {
					return h("div", { className: "dph_setGroup", key: "cl" }, [
						h("span", { className: "dph_dotWrap", key: "t" }, [
							h("span", { className: "dph_setTitle", key: "title" }, t("changelog.title")),
							pending.fresh ? updateDot() : null,
						]),
						h("div", { className: "dph_setRow", key: "row" }, [
							h("span", { className: "dph_setHint", key: "h" }, cl.state.loading ? t("changelog.loading") : t("changelog.failed")),
							cl.state.loading ? null : h("button", { className: "dph_btn", key: "b", type: "button", onClick: cl.refresh }, t("action.refresh")),
						]),
						cl.state.stale ? h("div", { className: "dph_setHint", key: "stale" }, t("host.stale")) : null,
					]);
				}
				const entries = Array.isArray(data.entries) ? data.entries : [];
				const upgrade = typeof data.upgrade === "string" ? data.upgrade : "";
				return h("div", { className: "dph_setGroup", key: "cl" }, [
					h("div", { className: "dph_setRow", key: "head" }, [
						h("span", { className: "dph_setCol", key: "col" }, [
							h("span", { className: "dph_dotWrap", key: "l" }, [
								h("span", { className: "dph_setLabel", key: "label" }, t("changelog.title")),
								pending.fresh ? updateDot() : null,
							]),
							h("span", { className: "dph_setHint", key: "h" }, format(t("changelog.current"), { v: data.current || "?" })),
						]),
						data.outdated === true
							? h("span", { className: "dph_tag dph_tagBad", key: "new" }, format(t("changelog.newAvailable"), { v: data.latest || "" }))
							: data.outdated === false
								? h("span", { className: "dph_setState", key: "ok" }, t("changelog.upToDate"))
								: null,
					]),
					data.outdated === true && upgrade
						? h("div", { className: "dph_logCmd", key: "cmd" }, [
								h("code", { className: "dph_cmd", key: "code" }, upgrade),
								h("button", {
									className: "dph_btn dph_btnPrimary",
									key: "copy",
									type: "button",
									onClick: () => copyText(upgrade, () => {
										cl.markCopied(upgrade);
										track("plugin_hub", { action: "upgrade_copy", scope: "changelog" });
									}),
								}, cl.copiedCmd === upgrade ? t("action.copied") : t("changelog.copyUpgrade")),
								h("span", { className: "dph_setHint", key: "hint" }, t("changelog.hint")),
							])
						: null,
					...changelogList(entries, "cl:", 0),
				]);
			}

			/** 更新红点。只有颜色没有文字等于对读屏用户不存在，所以点里塞一段视觉隐藏文案。 */
			function updateDot() {
				return h("span", { className: "dph_dot", key: "dot", title: t("updates.dot") }, h("span", { className: "dph_sr" }, t("updates.dot")));
			}

			/**
			 * 一行的结论。三态必须三句话：可升级（带复制命令）／已是最新／查不到 ——
			 * 把「查不到」显示成「已是最新」是本插件明确禁止的那类错误。
			 */
			/**
			 * 「更新」视图的一行。
			 *
			 * **中文名优先、包名靠后**：用户判断"该不该升"靠的是认得出这是谁，而
			 * `dsh-context` 这种包名对人没有信息量（实测：20 个已装插件的名字里，
			 * 只有本机 locale 与站点目录的并集才覆盖全）。缺中文名时显示包名并标注
			 * 「未汉化」——与卡片同一口径，绝不假装有中文。
			 */
			function updateRow(item, key, prefix, copied, mark, removable) {
				const nameZh = typeof item.nameZh === "string" ? item.nameZh.trim() : "";
				const note = typeof item.note === "string" ? item.note.trim() : "";
				const untranslated = !nameZh || (note !== "" && !/[\u4e00-\u9fff]/.test(note));
				/* 这一版被 dsh 的兼容性闸门拒过？只认**真实发生过**的拒绝，不做预判 */
				const blocked = item.outdated === true && updates.blocked.includes(String(item.name) + "@" + String(item.latest || ""));
				/* 清单里写死版本（0.5.27 这种）—— plugin add 挪不动它，直接说清，免得用户反复点 */
				const pinned = item.kind === "pinned";
				const sub = [];
				if (note) sub.push(note);
				/* 有中文名时，包名挪到第二行（用户要靠它去搜/核对）；没有中文名时它已在第一行 */
				if (nameZh) sub.push(String(item.name));
				if (pinned) sub.push(format(t("updates.pinnedNote"), { v: String(item.current || "") }));
				return h("div", { className: "dph_updItem" + (item.outdated === true ? " dph_updOn" : ""), key: key }, [
					h("div", { className: "dph_upd", key: "row" }, [
						h("span", { className: "dph_updName", key: "n" }, (prefix ? prefix + " · " : "") + (nameZh || String(item.name))),
						untranslated ? h("span", { className: "dph_tag", key: "raw" }, t("label.untranslated")) : null,
						blocked ? h("span", { className: "dph_tag", key: "blocked" }, t("updates.blocked")) : null,
						pinned ? h("span", { className: "dph_tag", key: "pinned" }, t("updates.pinned")) : null,
						h("span", { className: "dph_updVer", key: "v" }, "v" + String(item.current || "?") + (item.outdated === true ? " → v" + String(item.latest || "") : "")),
						h("span", { className: "dph_spacer", key: "gap" }),
						updateVerdict(item, key, copied, mark),
						/* 卸载入口：与"该不该升"并排。破坏性操作，自己带两步确认；
						   本插件自己那一行不给（卸自己等于把管理界面卸掉）。 */
						removable ? h(RemoveButton, { key: "remove", item: { pkg: String(item.name || ""), name: item.nameZh || String(item.name || "") } }) : null,
					]),
					sub.length ? h("div", { className: "dph_updSub", key: "sub" }, sub.join(" · ")) : null,
				]);
			}

			/**
			 * 卸载按钮 —— 破坏性操作，两步确认（与安装/重启同一条规则）。
			 *
			 * 为什么放在「更新」视图：这个视图本来就是"我已装的这些插件"的清单；
			 * 用户在这儿看到某个插件不想要了，最自然的动作就是当场卸掉 ——
			 * 让他为了卸载再开一个终端、再抄一遍包名，等于把他推回命令行。
			 */
			function RemoveButton(props) {
				const item = props.item;
				const state = useHub();
				const [confirming, setConfirming] = react.useState(false);
				const job = state.install;
				const mine = job && job.verb === "remove" && job.target === item.pkg;
				if (mine && job.active) {
					return h("span", { className: "dph_instMsg", key: "rm" }, job.message);
				}
				if (mine && job.phase === "okLocal") {
					return h("span", { className: "dph_instMsg dph_instOk", key: "rm" }, t("updates.removed") + " · " + t("updates.removedRestart"));
				}
				if (mine && job.phase === "failed") {
					return h("span", { className: "dph_instMsg dph_instBad", key: "rm" }, job.message || t("install.failed"));
				}
				if (confirming) {
					return h("span", { className: "dph_logCmd", key: "rm" }, [
						h("button", {
							className: "dph_btn",
							key: "go",
							type: "button",
							onClick: () => { setConfirming(false); runRemove(item, t); },
						}, t("updates.removeConfirm")),
						h("button", {
							className: "dph_btn",
							key: "cancel",
							type: "button",
							onClick: () => { setConfirming(false); track("plugin_hub", { action: "remove_cancel" }); },
						}, t("install.cancel")),
					]);
				}
				return h("button", {
					className: "dph_btn",
					key: "rm",
					type: "button",
					title: item.pkg || "",
					onClick: () => { setConfirming(true); track("plugin_hub", { action: "remove_ask" }); },
				}, t("updates.remove"));
			}

			/**
			 * 一行的结论。三态必须三句话：可升级（一键升级 + 复制命令）／已是最新／查不到 ——
			 * 把「查不到」显示成「已是最新」是本插件明确禁止的那类错误。
			 */
			function updateVerdict(item, key, copied, mark) {
				if (!item || item.outdated === null) {
					return h("span", { className: "dph_updNote", key: key + ":unknown" }, t("updates.unknown"));
				}
				if (item.outdated !== true) {
					return h("span", { className: "dph_updNote", key: key + ":ok" }, t("updates.upToDate"));
				}
				if (isIgnored(item)) {
					/* 忽略记的是**具体目标版本**：出了更新的版本（latest 变了）提醒会自己回来 ——
					   所以这里显示"忽略了哪一版"并给取消，而不是一句模糊的「已忽略」。 */
					return h("span", { className: "dph_logCmd", key: key + ":ignored" }, [
						h("span", { className: "dph_updNote", key: "note" }, format(t("updates.ignored"), { v: String(item.latest || "") })),
						h("button", {
							className: "dph_btn",
							key: "undo",
							type: "button",
							onClick: () => {
								setIgnored(item.name, null);
								track("plugin_hub", { action: "ignore_off", pkg: String(item.name || "") });
							},
						}, t("updates.unignore")),
					]);
				}
				return h("span", { className: "dph_logCmd", key: key + ":out" }, [
					h("span", { className: "dph_tag dph_tagBad", key: "tag" }, t("updates.outdated")),
					/* 一键升级**复用目录项那条安装通道**（二次确认 → 进度 → 失败原因 → 重启提示）：
					   一条路径两处使用，行为才不会分叉。
					   目标用**具体版本号**（更新检查已经知道它）—— 实测 `@latest` 在 dsh 上会静默空转。 */
					h(InstallRow, { key: "do", item: { pkg: String(item.name) + "@" + String(item.latest), current: item.current }, kind: "upgrade" }),
					h("button", {
						className: "dph_btn",
						key: "copy",
						type: "button",
						title: item.upgrade || "",
						onClick: () => copyText(item.upgrade || "", () => {
							mark(item.upgrade || "");
							track("plugin_hub", { action: "upgrade_copy", scope: "updates" });
						}),
					}, copied === item.upgrade ? t("action.copied") : t("updates.copyCmd")),
					/* 「忽略此版本」：把"不打算升这一版"这个决定记下来，红点与列表都认它 ——
					   否则用户每次打开都被同一个红点提醒一遍，久了就学会无视红点（那才是真损失）。 */
					h("button", {
						className: "dph_btn",
						key: "ignore",
						type: "button",
						title: format(t("updates.ignoreHint"), { v: String(item.latest || "") }),
						onClick: () => {
							setIgnored(item.name, item.latest);
							track("plugin_hub", { action: "ignore_on", pkg: String(item.name || ""), v: String(item.latest || "") });
						},
					}, t("updates.ignore")),
				]);
			}

			/**
			 * 「更新」视图：本插件自身 + 已安装插件的更新清单，并**在这里直接升级**。
			 *
			 * 用户**看到清单即视为已确认** —— 红点在这里熄灭（与 check-updates 补丁同一思路：
			 * 只有再出现比已确认版本更新的版本才会重新亮）。
			 */
			function UpdateView(props) {
				const store = useUpdates();
				/* 更新日志也在这里用：用户要看"本插件自己更新了什么"，不该被迫再跑一趟设置页 */
				const cl = useChangelog();
				/* 批量升级的进度挂在 hub 上（它要跨行显示），所以这里也要订阅 hub */
				const state = useHub();
				const [copied, setCopied] = react.useState("");
				/* 批量升级要两步：它一次会改十几个包，一键直落对真实用户太危险 */
				const [batchAsk, setBatchAsk] = react.useState(false);
				const [restartAsk, setRestartAsk] = react.useState(false);
				const [restarting, setRestarting] = react.useState(false);
				const [restartFailed, setRestartFailed] = react.useState(false);
				const data = store.data;
				const scope = props && props.scope ? props.scope : "tab";
				react.useEffect(() => {
					if (data) ackUpdates(scope);
				}, [data]);
				const mark = react.useCallback((text) => {
					setCopied(text);
					setTimeout(() => setCopied((current) => (current === text ? "" : current)), 2000);
				}, []);
				/* 两处需要重启出口（接口没注册 / 批量升级装完），共用同一个按钮；
				   key 同时当埋点的 scope，调用点一眼能看出语境。 */
				function restartButton(key) {
					return h("span", { className: "dph_logCmd", key: key }, [
						/* 两步确认：重启会掐断用户当前的会话，不该一键直落 */
						restartAsk ? h("span", { className: "dph_setHint", key: "warn" }, t("updates.restartConfirm")) : null,
						h("button", {
							className: "dph_btn dph_btnPrimary",
							key: "btn",
							type: "button",
							disabled: restarting,
							onClick: async () => {
								if (!restartAsk) {
									setRestartAsk(true);
									track("plugin_hub", { action: "restart_ask", scope: key });
									return;
								}
								setRestartAsk(false);
								setRestarting(true);
								/* 点击即上报：成功的重启会掐断这个请求，
								   「重启成功」只能由下次加载时的 post_install 证明。 */
								track("plugin_hub", { action: "restart_click", via: key });
								const ok = await restartServer();
								setRestarting(false);
								if (!ok) {
									setRestartFailed(true);
									track("plugin_hub", { action: "restart_failed", via: key, why: "restart_http" });
								}
							},
						}, restarting ? t("install.running") : t("install.restart")),
						restartFailed ? h("span", { className: "dph_instMsg dph_instBad", key: "fail" }, t("install.failed")) : null,
					]);
				}
				const head = h("div", { className: "dph_dailyHead", key: "head" }, [
					h("span", { className: "dph_dailyTag", key: "tag" }, t("updates.title")),
					h("span", { className: "dph_dailyDate", key: "sum" }, data && data.counts ? format(t("updates.summary"), { n: data.counts.checked, m: data.counts.outdated }) : ""),
					h("span", { className: "dph_spacer", key: "gap" }),
					h("button", {
						className: "dph_btn",
						key: "check",
						type: "button",
						disabled: store.loading,
						onClick: () => {
							track("plugin_hub", { action: "updates_check", scope: scope });
							loadUpdates(true);
						},
					}, store.loading ? t("updates.checking") : t("updates.check")),
				]);
				if (store.error) {
					return h("div", { className: "dph_list", key: "upd" }, [
						head,
						h(Notice, { key: "err", kind: "bad", text: t("updates.failed") + "：" + (store.stale ? t("host.stale") : store.error) }),
						store.stale ? restartButton("stale") : null,
					]);
				}
				if (!data) {
					return h("div", { className: "dph_list", key: "upd" }, [head, h(Notice, { key: "loading", text: t("updates.loading") })]);
				}
				const self = data.self || {};
				const rows = Array.isArray(data.plugins) ? data.plugins : [];
				const batch = state.batch;
				/* 自插件也算进去：它同样是"升一下就到最新"，用户在意的是一共几个。
				   目标写成**具体版本号**（@latest 在 dsh 上是空转的）。 */
				const outgoing = rows
					.filter((item) => item.outdated === true)
					.map((item) => ({ name: item.name, pkg: String(item.name) + "@" + String(item.latest) }));
				if (self.outdated === true && self.name) outgoing.unshift({ name: String(self.name), pkg: String(self.name) + "@" + String(self.latest) });
				return h("div", { className: "dph_list", key: "upd" }, [
					head,
					isHostSkewed(data)
						? h("div", { className: "dph_logCmd", key: "skew" }, [
								h("span", { className: "dph_setHint", key: "h" }, t("host.skew")),
								restartButton("skew"),
							])
						: null,
					h("div", { className: "dph_setHint", key: "note" }, t("updates.note") + " " + t("updates.ackNote")),
					/* 批量：只有在"值得批量"时才出现，免得一个入口配一个条目还用两个按钮 */
					outgoing.length >= 2 && !(batch && batch.active)
						? h("div", { className: "dph_logCmd", key: "all" }, [
								/* 批量必须两步：单条升级有确认，批量反而一键直落会连改十几个包 ——
								   对真实用户这是最容易误触的破坏性动作（2026-10-12 补）。 */
								batchAsk ? h("span", { className: "dph_setHint", key: "warn" }, format(t("updates.upgradeAllConfirm"), { n: outgoing.length })) : null,
								h("button", {
									className: "dph_btn" + (batchAsk ? " dph_btnPrimary" : ""),
									key: "go",
									type: "button",
									onClick: () => {
										if (!batchAsk) {
											setBatchAsk(true);
											track("plugin_hub", { action: "upgrade_all_ask", n: outgoing.length, scope: scope });
											return;
										}
										setBatchAsk(false);
										runUpgradeAll(outgoing, t);
									},
								}, format(t("updates.upgradeAll"), { n: outgoing.length })),
								h("span", { className: "dph_setHint", key: "hint" }, t("updates.upgradeAllHint")),
							])
						: null,
					batch && batch.active
						? h("div", { className: "dph_logCmd", key: "running" }, [
								h("span", { className: "dph_instMsg", key: "msg" }, format(batch.kind === "install" ? t("sets.installing") : t("updates.batchProgress"), { done: batch.finished, total: batch.total, name: batch.current })),
								h("button", {
									className: "dph_btn",
									key: "stop",
									type: "button",
									onClick: () => {
										track("plugin_hub", { action: "upgrade_all_stop", n: batch.finished });
										setHub({ batch: { ...batch, stopRequested: true } });
									},
								}, t("updates.stop")),
							])
						: null,
					batch && !batch.active && batch.finished > 0
						? h("div", { className: "dph_logCmd", key: "done" }, [
								h("span", { className: "dph_instMsg dph_instOk", key: "msg" }, format(t("updates.batchDone"), { done: batch.finished, failed: batch.failed })),
								batch.blocked > 0 ? h("span", { className: "dph_setHint", key: "blocked" }, format(t("updates.batchBlocked"), { k: batch.blocked })) : null,
								batch.noop > 0 ? h("span", { className: "dph_setHint", key: "noop" }, format(t("updates.batchNoop"), { k: batch.noop })) : null,
								batch.restartNeeded ? h("span", { className: "dph_setHint", key: "hint" }, t("updates.restartNeeded")) : null,
								batch.restartNeeded ? restartButton("batch") : null,
							])
						: null,
					updateRow(self, "self", t("updates.self"), copied, mark),
					/* 本插件自己的更新日志就在它这一行下面 —— 不必再为它跑一趟设置页 */
					changelogBlock(cl.state.data ? cl.state.data.entries : null, "upd:"),
					h("div", { className: "dph_setTitle", key: "installed" }, t("updates.installed")),
					rows.length === 0
						? h(Notice, { key: "none", text: t("updates.none") })
						: h("div", { className: "dph_updList", key: "list" }, rows.map((item) => updateRow(item, item.name, "", copied, mark, true))),
					data.counts && data.counts.unknown > 0
						? h("div", { className: "dph_setHint", key: "unknown" }, format(t("updates.unknownNote"), { k: data.counts.unknown }))
						: null,
					/* 本地链接的包单列：不是漏了，而是它们根本不参与更新检查 */
					data.counts && data.counts.local > 0
						? h("details", { className: "dph_log", key: "locals" }, [
								h("summary", { className: "dph_logHead", key: "head" }, [
									h("span", { className: "dph_logTitle", key: "t" }, format(t("updates.locals"), { n: data.counts.local })),
								]),
								h("div", { className: "dph_logNest", key: "body" }, [
									h("div", { className: "dph_setHint", key: "note" }, t("updates.localsNote")),
									...((Array.isArray(data.locals) ? data.locals : []).map((row) => h("div", { className: "dph_updSub", key: String(row.name) },
										String(row.name) + "  →  " + String(row.spec || "").replace(/^(link|file):/, ""),
									))),
								]),
							])
						: null,
				]);
			}

			/**
			 * 设置 → 插件 里的「严选插件」页签：完整设置页。
			 *
			 * 页签**必须订阅共享 store**：浮窗开关在通用行也有一份，两处读的是同一个
			 * hidden —— 不订阅就会出现「在通用里开了、到这里还显示关」的错位（页签底部
			 * 的同类问题在 v0.4.4 实测踩过）。
			 */
			function SettingsPanel() {
				const state = useHub();
				const [reset, setReset] = react.useState(false);
				/* 更新日志只在设置页被打开时请求（不是每次打开浮窗都拉） */
				const cl = useChangelog();
				/* 更新检查是共享 store：这里只订阅（触发由始终挂着的侧边栏按钮负责） */
				useUpdates();
				const pending = pendingUpdates();
				function switchRow(key, labelKey, hintKey, checked, onToggle) {
					return h("div", { className: "dph_setRow", key: key }, [
						h("span", { className: "dph_setCol", key: "col" }, [
							h("span", { className: "dph_setLabel", key: "l" }, t(labelKey)),
							h("span", { className: "dph_setHint", key: "h" }, t(hintKey)),
						]),
						h("label", { className: "dph_tel", key: "sw" }, [
							h("input", { key: "box", type: "checkbox", checked: checked, onChange: (event) => onToggle(event.target.checked) }),
							h("span", { key: "t" }, checked ? t("settings.on") : t("settings.off")),
						]),
					]);
				}
				return h("div", { className: "dph_set" }, [
					h("div", { className: "dph_setTitle", key: "title" }, t("settings.title")),
					switchRow("float", "settings.float", "settings.floatHint", !state.hidden, (next) => setFloatVisible(next, "settings")),
					switchRow("daily", "settings.daily", "settings.dailyHint", state.daily, (next) => setDaily(next, "settings")),
					switchRow("check", "settings.check", "settings.checkHint", state.autoCheck, (next) => setAutoCheck(next, "settings")),
					switchRow("tel", "settings.telemetry", "settings.about", state.telemetry, setTelemetry),
					changelogSection(cl, pending),
					h("div", { className: "dph_setGroup", key: "reset" }, [
						h("div", { className: "dph_setRow", key: "row" }, [
							h("span", { className: "dph_setHint", key: "h" }, t("settings.resetHint")),
							h("button", {
								className: "dph_btn",
								key: "btn",
								type: "button",
								onClick: () => {
									resetPrefs("settings");
									setReset(true);
								},
							}, t("settings.reset")),
						]),
						reset ? h("span", { className: "dph_setHint dph_instOk", key: "done" }, t("settings.resetDone")) : null,
					]),
				]);
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

			function telemetryToggle(label) {
				return h("label", { className: "dph_tel", key: "tel" }, [
					h("input", {
						key: "box",
						type: "checkbox",
						checked: hub.telemetry,
						onChange: (event) => setTelemetry(event.target.checked),
					}),
					h("span", { key: "label" }, label || t("telemetry.on")),
				]);
			}

			/**
			 * 浮窗的显示开关。
			 *
			 * 关掉走 hideHub（与胶囊上的 × 同一条路径），打开只取消隐藏、**不强行弹面板** ——
			 * 用户此刻可能就在这个页签里浏览，把面板糊上来是打扰。
			 * 两个入口共用一条路径，才不会出现"关了一半"的中间态。
			 */
			function floatToggle() {
				return h("label", { className: "dph_tel", key: "float" }, [
					h("input", {
						key: "box",
						type: "checkbox",
						checked: !hub.hidden,
						onChange: (event) => setFloatVisible(event.target.checked, "tab"),
					}),
					h("span", { key: "label" }, t("action.showFloat")),
				]);
			}

			/**
			 * 入口 1：会话视图页签（完整页）。
			 *
			 * 与浮窗同一套视图与同一组文案：顶部的「严选推荐 / 分类精选」切换、
			 * 表头副标题、打开站点链接、刷新按钮都随视图联动。
			 * 默认仍是「严选推荐」—— 与浮窗保持一致（同一功能在两处换默认值最容易被当成 bug）。
			 *
			 * 视图切换用**裸 seg() 放在 dph_bar 里**（宽度自适应、靠左），不复用浮窗那层
			 * `.dph_segWrap`（那是让两个按钮铺满 400px 面板用的）。页签宽 1080px，
			 * 铺满会变成两个 500px 的巨大按钮。
			 */
			function CatalogView() {
				const cat = useCatalog(t);
				/* 必须订阅共享 store：页签底部的「显示右下角浮窗」开关读的是同一个
				   hidden 状态，而关闭动作也可能来自胶囊或面板 —— 不订阅就会出现
				   "在别处关了浮窗，这里却还勾着"的错位（实测踩到）。
				   每日推荐的显隐同样读这个 store（设置页改完这里要跟着变）。 */
				const state = useHub();
				const [mode, setMode] = react.useState("search");
				const dateKey = useDateKey();
				/* 默认视图顶部也要放「今日推荐」卡片，所以 daily 开着时必须取榜单数据 ——
				   不取就没东西可渲染。关掉每日推荐后即回到「只有切到榜单/每日视图才请求」。 */
				const best = useBest(t, mode === "best" || mode === "daily" || state.daily);
				const sets = useSets(t, mode === "sets");
				const data = cat.state.data;
				const bestData = best.state.data;
				const setsData = sets.state.data;
				const isBest = mode === "best";
				const isDaily = mode === "daily";
				const isUpdate = mode === "update";
				const isSets = mode === "sets";
				const sub = isSets
					? (setsData ? format(t("sets.count"), { n: setsData.total || 0 }) : "")
					: isBest
					? (bestData ? format(t("best.month"), { m: bestData.month || "" }) : "")
					: isDaily
						? t("daily.hint")
						: isUpdate
							? ""
							: countSub(data, t, cat.state.loading, t("view.sub"));
				/* 各分支各自成段。写成嵌套三元再 spread 已经难以核对，分支越多越该先算好 body。 */
				const body = isUpdate
					? [h(UpdateView, { key: "update", scope: "tab" })]
					: isSets
						? [
								sets.state.error ? h(Notice, { key: "serror", kind: "bad", text: t("state.failed") + "：" + sets.state.error }) : null,
								sets.state.loading && !setsData ? h(Notice, { key: "sloading", text: t("sets.loading") }) : null,
								!sets.state.loading && setsData && (setsData.total || 0) === 0 ? h(Notice, { key: "sempty", text: t("sets.empty") }) : null,
								h("div", { className: "dph_list", key: "slist" }, renderSets(setsData, sets.copiedCmd, sets.markCopied)),
							]
						: isDaily
						? [
								h("div", { className: "dph_list", key: "dlist" }, dailyCard(best, best.copiedCmd, best.markCopied, { dateKey: dateKey })),
							]
						: isBest
							? [
									best.state.error ? h(Notice, { key: "berror", kind: "bad", text: t("state.failed") + "：" + best.state.error }) : null,
									best.state.loading && !bestData ? h(Notice, { key: "bloading", text: t("best.loading") }) : null,
									!best.state.loading && bestData && (bestData.total || 0) === 0 ? h(Notice, { key: "bempty", text: t("best.empty") }) : null,
									h("div", { className: "dph_list", key: "blist" }, renderBest(bestData, best.copiedCmd, best.markCopied)),
								]
							: [
									state.daily ? dailyCard(best, cat.copiedCmd, cat.markCopied, { dateKey: dateKey }) : null,
									controls(cat),
									cat.state.error ? h(Notice, { key: "error", kind: "bad", text: t("state.failed") + "：" + cat.state.error }) : null,
									cat.state.loading && cat.plugins.length === 0 ? h(Notice, { key: "loading", text: t("state.loading") }) : null,
									!cat.state.loading && !cat.state.error && cat.plugins.length === 0 ? h(Notice, { key: "empty", text: t("state.empty") }) : null,
									h("div", { className: "dph_list", key: "list" }, cat.plugins.map((item) => renderCard(item, cat.copiedCmd, cat.markCopied, false))),
								];
				return h("div", { className: "dph_root" }, [
					h("div", { className: "dph_header", key: "header" }, [
						h("h2", { className: "dph_title", key: "title" }, t("view.title")),
						h("span", { className: "dph_sub", key: "sub" }, sub),
						h("span", { className: "dph_spacer", key: "gap" }),
						h("a", {
							className: "dph_btn",
							key: "site",
							href: isSets ? SITE + "/sets" : isBest ? SITE + "/best" : SITE + "/plugins",
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: () => track("plugin_hub", { action: "site_click", scope: isDaily ? "daily" : isSets ? "sets" : isBest ? "best" : "tab" }),
						}, t("action.openSite")),
						h("button", { className: "dph_btn", key: "refresh", type: "button", onClick: isUpdate ? () => loadUpdates(true) : isSets ? sets.refresh : (isBest || isDaily) ? best.refresh : cat.refresh }, t("action.refresh")),
					]),
					/* 单元素不要写成数组：[seg(...)] 这种"数组里塞一个无 key 元素"会触发
					   React 的 key 警告（实测）。直接作为唯一子节点传入即可。 */
					h("div", { className: "dph_bar", key: "seg" }, seg([
						{ value: "search", label: t("best.recommend") },
						{ value: "best", label: t("best.picks") },
						{ value: "sets", label: t("sets.tab") },
						{ value: "daily", label: t("daily.tab") },
						{ value: "update", label: t("updates.tab") },
					], mode, setMode)),
					/* 待重启横幅挂在视图切换之下、结果区之上：不跟着卡片滚走，切视图也在 */
					h(RestartBanner, { scope: "tab", key: "rbanner" }),
					...body,
					h("div", { className: "dph_footer", key: "hint" }, t("footer.hint")),
					h("div", { className: "dph_footer", key: "tel" }, h("div", { className: "dph_footToggles" }, [telemetryToggle(), floatToggle()])),
				]);
			}

			/* −−− 入口 2：左下常驻按钮 −−− */
			function FooterEntry(props) {
				const wide = props && props.wide;
				const state = useHub();
				/* 这个入口**始终挂在侧边栏底部**，所以由它负责首次触发更新检查 ——
				   红点因此能在用户没打开过任何页面时就亮起来。 */
				useUpdates();
				const pending = pendingUpdates();
				/* 「上劲」态：浮窗被关掉后，第一下点击只进入待确认（按钮描边 + 标记脉冲 +
				   提示「再点一次恢复浮窗」），5 秒内的第二下才恢复。习惯性误点不会把浮窗
				   叫回来 —— 这是「关掉了就别默认打开」与「按钮不能是死的」之间的折中
				   （2026-10-13：纯无反应的按钮被用户当成「没生效」）。 */
				const [armed, setArmed] = react.useState(false);
				react.useEffect(() => {
					if (!armed) return undefined;
					const timer = setTimeout(() => setArmed(false), 5000);
					return () => clearTimeout(timer);
				}, [armed]);
				/* 从别处恢复（页签勾选/设置开关）时解除上劲，避免按钮挂着确认态却在做别的事 */
				react.useEffect(() => {
					if (!state.hidden) setArmed(false);
				}, [state.hidden]);
				/* 提示文案随状态说准：关掉了说"怎么恢复/再点一次"，可见时说"展开还是收起" ——
				   点了没反应却写着「显示浮窗」是最差的一种文案（2026-10-13 踩过）。 */
				let tip;
				if (state.hidden) tip = armed ? t("action.armRestore") : t("action.closedHint");
				else if (state.open) tip = t("action.close");
				else tip = t("action.expand");
				return h("div", { className: wide ? "dph_lbWide" : "dph_lbOff", style: { width: "100%", alignSelf: "stretch", display: "flex", minWidth: 0 } }, [
					h("button", {
						className: "dph_lb" + (armed ? " dph_lbArmed" : ""),
						key: "button",
						type: "button",
						title: tip,
						"aria-label": tip,
						onClick: () => {
							/* 浮窗被用户关掉后的两步确认（2026-10-13 用户反馈：
							   「胶囊用户关闭了就别默认打开了」；而纯无反应又被当成
							   「没生效」—— 两头都要照顾）：
							     · 第一下：只上劲，不恢复。习惯性误点到此为止；
							     · 5 秒内第二下：才把胶囊叫回来（只恢复显示，面板不展开）。
							   浮窗**可见**时，这个按钮才是面板开关：展开/收起，不碰显隐。 */
							if (state.hidden) {
								if (!armed) {
									setArmed(true);
									return;
								}
								setArmed(false);
								setFloatVisible(true, "footer");
								return;
							}
							const next = !state.open;
							setHub({ open: next });
							if (next) track("plugin_hub", { action: "open", scope: "footer" });
						},
					}, [
						h("span", { className: "dph_dotWrap", key: "markWrap" }, [
							/* ⚠️ 数组子节点的每个元素都要有 key —— 少一个 React 会告警（实测踩到） */
							h("span", { className: "dph_lbMark", key: "mark" }, "严"),
							pending.fresh ? updateDot() : null,
						]),
						wide ? h("span", { className: "dph_lbLabel", key: "label" }, t("action.open")) : null,
					]),
				]);
			}

			/* −−− 入口 3：全站浮窗（shell.overlay，跨路由） −−− */
			function OverlayEntry() {
				const state = useHub();
				/* 更新检查是共享 store：只订阅（触发由始终挂着的侧边栏按钮负责），红点由它决定 */
				useUpdates();
				const pending = pendingUpdates();
				const cat = useCatalog(t);
				const [pos, setPos] = react.useState(readStoredPos);
				/* 窄面板里今日推荐默认收起（否则它会挤掉整个结果区 —— 实测用户反馈） */
				const [dailyOpen, setDailyOpen] = react.useState(false);
				const posRef = react.useRef(pos);
				posRef.current = pos;
				const skipClickRef = react.useRef(false);
				const panelRef = react.useRef(null);
				const onDrag = makeDragHandlers(() => posRef.current, setPos, skipClickRef);
				/**
				 * 面板内的视图：
				 *   search = 严选推荐（可搜索的全量目录）
				 *   best   = 分类精选（站点 /best 的月度策展结果）
				 *   sets   = 套装（站点 /sets 的组合方案：一整套 + 安装顺序 + 冲突提示）
				 *   daily  = 每日推荐（按自然日从榜单里取一条，当天固定）
				 * 放在同一入口里而不是再开一个入口：用户的意图都是"找该装哪个"，
				 * 分成多个入口只会让人不知道该点哪个。
				 */
				const [mode, setMode] = react.useState("search");
				const dateKey = useDateKey();
				/* 默认视图顶部也要有「今日推荐」，所以面板一展开就得取榜单数据；
				   关掉每日推荐开关后，回到「只有切到榜单/每日视图才请求」。
				   仍然挂在 state.open 上：收成胶囊时不发这个请求。 */
				const best = useBest(t, state.open && (mode === "best" || mode === "daily" || state.daily));
				const bestData = best.state.data;
				const sets = useSets(t, state.open && mode === "sets");
				const setsData = sets.state.data;

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

				/* 用户手动关闭过 ⇒ 整块浮窗（胶囊 + 面板）都不渲染。
				   放在这里是为了在所有 hook 之后，不破坏 hook 顺序。 */
				if (state.hidden) return null;

				if (!state.open) {
					return h("div", { className: "dph_ovWrap", style: anchor }, [
						h("div", { className: "dph_pillWrap", key: "wrap" }, [
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
								h("span", { className: "dph_dotWrap", key: "markWrap" }, [
									h("span", { className: "dph_pillMark", key: "mark" }, "严"),
									pending.fresh ? updateDot() : null,
								]),
								h("span", { key: "label" }, t("action.open")),
							]),
							/* 胶囊是跨路由常驻的，用户需要一个"把这块东西从屏幕上拿掉"的出口。
							   作为兄弟节点绝对定位盖在胶囊右端 —— 嵌进胶囊那个 <button> 里既非法，
							   也会让 pointerdown 冒泡触发拖动。 */
							h("button", {
								className: "dph_pillClose",
								key: "close",
								type: "button",
								title: t("action.hide") + " · " + t("action.hideHint"),
								"aria-label": t("action.hide"),
								onClick: (event) => {
									event.stopPropagation();
									hideHub("pill");
								},
							}, "×"),
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
							h("span", { className: "dph_sub", key: "sub" }, mode === "daily"
							? dateKey
							: mode === "sets"
							? (setsData ? format(t("sets.count"), { n: setsData.total || 0 }) : "")
							: mode === "best"
							? (bestData ? format(t("best.month"), { m: bestData.month || "" }) : "")
							: mode === "update"
							? ""
							: countSub(data, t, cat.state.loading)),
							h("span", { className: "dph_spacer", key: "gap" }),
							h("a", { className: "dph_btn", key: "site", href: mode === "sets" ? SITE + "/sets" : mode === "best" ? SITE + "/best" : SITE + "/plugins", target: "_blank", rel: "noopener noreferrer", onClick: () => track("plugin_hub", { action: "site_click", scope: mode === "daily" ? "daily" : mode === "sets" ? "sets" : mode === "best" ? "best" : "overlay" }) }, t("action.openSite")),
							h("button", { className: "dph_close", key: "close", type: "button", title: t("action.close"), "aria-label": t("action.close"), onClick: () => setHub({ open: false }) }, "×"),
						]),
						h("div", { className: "dph_segWrap", key: "seg" }, seg([
							{ value: "search", label: t("best.recommend") },
							{ value: "best", label: t("best.picks") },
							{ value: "sets", label: t("sets.tab") },
							{ value: "daily", label: t("daily.tab") },
							{ value: "update", label: t("updates.tab") },
						], mode, setMode)),
						/* 待重启横幅在面板滚动区之外：面板再窄也一直看得见 */
						h(RestartBanner, { scope: "panel", key: "rbanner" }),
						...(mode === "update"
							? [
									h("div", { className: "dph_panelBody", key: "ubody" }, h(UpdateView, { scope: "overlay" })),
								]
							: mode === "sets"
							? [
									sets.state.error ? h(Notice, { key: "serror", kind: "bad", text: t("state.failed") + "：" + sets.state.error }) : null,
									sets.state.loading && !setsData ? h(Notice, { key: "sloading", text: t("sets.loading") }) : null,
									!sets.state.loading && setsData && (setsData.total || 0) === 0 ? h(Notice, { key: "sempty", text: t("sets.empty") }) : null,
									h("div", { className: "dph_panelBody", key: "sbody" }, renderSets(setsData, sets.copiedCmd, sets.markCopied)),
								]
							: mode === "daily"
							? [
									h("div", { className: "dph_panelBody", key: "dbody" }, dailyCard(best, best.copiedCmd, best.markCopied, { dateKey: dateKey })),
								]
							: mode === "search"
							? [
									state.daily ? dailyCard(best, cat.copiedCmd, cat.markCopied, { dateKey: dateKey, collapsed: !dailyOpen, toggle: () => setDailyOpen((v) => !v) }) : null,
									controls(cat),
									cat.state.error ? h(Notice, { key: "error", kind: "bad", text: t("state.failed") + "：" + cat.state.error }) : null,
									cat.state.loading && cat.plugins.length === 0 ? h(Notice, { key: "loading", text: t("state.loading") }) : null,
									!cat.state.loading && !cat.state.error && cat.plugins.length === 0 ? h(Notice, { key: "empty", text: t("state.empty") }) : null,
									h("div", { className: "dph_panelBody", key: "body" }, cat.plugins.map((item) => renderCard(item, cat.copiedCmd, cat.markCopied, true))),
								]
							: [
									best.state.error ? h(Notice, { key: "berror", kind: "bad", text: t("state.failed") + "：" + best.state.error }) : null,
									best.state.loading && !bestData ? h(Notice, { key: "bloading", text: t("best.loading") }) : null,
									!best.state.loading && bestData && (bestData.total || 0) === 0 ? h(Notice, { key: "bempty", text: t("best.empty") }) : null,
									h("div", { className: "dph_panelBody", key: "bbody" }, renderBest(bestData, best.copiedCmd, best.markCopied)),
								]),
						h("div", { className: "dph_panelFoot", key: "foot" }, [
							h("div", { className: "dph_footRow", key: "row" }, [
								telemetryToggle(),
								h("button", {
									className: "dph_btn",
									key: "hide",
									type: "button",
									title: t("action.hideHint"),
									onClick: () => hideHub("panel"),
								}, t("action.hide")),
							]),
							h("span", { key: "hint", className: "dph_footer" }, t("footer.hint")),
						]),
					]),
				]);
			}

			return { CatalogView, FooterEntry, OverlayEntry, SettingsFloatRow, SettingsPanel };
		}

		/* ---------------------------------------------------------------- plugin */
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dpharness: dictionaries");
			const t = ctx.locale.bind(NS);
			const ui = makeUi(t);

			/* 插件被加载 = 一次心跳。它同时是「在用哪个版本」的唯一来源：
			   老版本发不出新事件，看板上的空值必须能和「真没人做」区分开。
			   （版本号由 host 在转发时统一附加。） */
			track("plugin_hub", { action: "hello" });
			/* 上一次安装的回执要到这一刻才能取（见 reportPostInstall）。 */
			reportPostInstall();

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

			/* −−− 设置入口（2026-10-12）−−−
			   浮窗是跨路由常驻的，被关掉之后用户需要一个**显式的设置**地方把它打开，
			   而不是只在页签底部留一个勾选框。两个槽位各司其职：
			     · settings.general.item —— 设置 → 通用 里的一行（最高频的浮窗开关）
			     · settings.plugins.tab  —— 设置 → 插件 里的完整设置页
			   ⚠️ 老宿主没有这两个槽位时**不会报错**：SlotRegistry.inject 在槽位未声明时
			   只是登记等待（reconcile 里 specDynamic 为 undefined 就返回），回调永不执行、
			   注册永不发生，属静默降级 —— 故这里不需要 try/catch。
			   （依据：@deepseek-ai/dsh-client-runtime src/client/slots.ts 的 inject 实现，
			   2026-10-12 查证，非猜测。） */
			ctx.slots.inject(
				"settings.general.item",
				() =>
					ctx.slots.register(
						{ name: "settings.general.item", id: "dpharness", order: 40, locale: NS, label: () => t("settings.float"), inject: () => ({}) },
						ui.SettingsFloatRow,
					),
			);

			ctx.slots.inject(
				"settings.plugins.tab",
				() =>
					ctx.slots.register(
						{ name: "settings.plugins.tab", id: "dpharness", order: 40, locale: NS, label: () => t("settings.tab"), inject: () => ({}) },
						ui.SettingsPanel,
					),
			);
		}

		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		/* 供测试使用：位置夹取、副标题文案、每日推荐的选取都是纯函数，单独导出便于断言边界 */
		exports.clampPos = clampPos;
		exports.summaryOf = summaryOf;
		exports.countSub = countSub;
		exports.dailyKey = dailyKey;
		exports.hashKey = hashKey;
		exports.flattenBest = flattenBest;
		exports.pickDaily = pickDaily;
		/* 供测试使用：本机路由的响应解析要能容忍非 JSON 正文（host 未重启的窗口期） */
		exports.readHostJson = readHostJson;
		/* 供测试使用：升级目标要还原成裸包名才能查 profile 清单 */
		exports.basePackage = basePackage;
		return module.exports;
	},
});
