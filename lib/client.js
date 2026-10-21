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
			".dph_root{display:flex;flex-direction:column;gap:16px;width:100%;max-width:1080px;margin:0 auto;padding:8px 4px 24px}",
			".dph_header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
			".dph_title{margin:0;font-size:17px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_sub{color:var(--dsw-alias-label-tertiary);font-size:12px}",
			".dph_spacer{flex:1}",
			".dph_btn{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:28px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font:inherit;font-size:12px;line-height:1;cursor:pointer;text-decoration:none;white-space:nowrap}",
			".dph_btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dph_bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			".dph_input{flex:1;min-width:180px;box-sizing:border-box;height:32px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;font:inherit;font-size:13px;outline:none}",
			".dph_input:focus{border-color:var(--dsw-alias-state-business-primary)}",
			".dph_seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;overflow:hidden;flex:none}",
			".dph_segBtn{border:0;background:transparent;color:var(--dsw-alias-label-secondary);height:30px;padding:0 12px;box-sizing:border-box;font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}",
			".dph_segBtnOn{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600}",
			".dph_list{display:flex;flex-direction:column;gap:8px}",
			".dph_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px}",
			".dph_cardTop{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
			".dph_name{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_owner{font-size:12px;color:var(--dsw-alias-label-tertiary)}",
			".dph_stars{font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
			".dph_tags{display:flex;gap:6px;flex-wrap:wrap}",
			".dph_tag{display:inline-flex;align-items:center;box-sizing:border-box;height:20px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;padding:0 7px;font-size:11px;line-height:1;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
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
			/* 周榜（2026-10-20）：面板从 5 个视图变 6 个，`.dph_segBtn{flex:1}` 六等分
			   在 372px 可用宽里会把四字标签（严选推荐 / 分类精选 / 每日推荐 / 我的插件）
			   挤到溢出裁切。这里**不改任何既有文案、也不重定义 .dph_segBtn**：
			   只给多出来的这一层加横向滚动，按钮转为按内容宽度排列。
			   min-width:100% 保证视图少时不缩成一坨（与原来的铺满观感一致）。 */
			".dph_segWrapScroll{display:flex;overflow-x:auto;scrollbar-width:none}",
			".dph_segWrapScroll::-webkit-scrollbar{display:none}",
			/* 12px→10px 内边距是为 372px 可用宽算过的：六个标签合计 360px，能整排放下；
			   justify-content:space-between 把余量摊回两端，不会在右侧留一条空档。
			   更窄（<360px）时才真的横向滚动 —— 滚动条隐藏，但不裁字。 */
			".dph_segWrapScroll .dph_seg{flex:none;min-width:100%;justify-content:space-between}",
			".dph_segWrapScroll .dph_segBtn{flex:none;padding:6px 10px}",
			/* 周榜行头：名次 + 依据（周下载 / 本周人数）。名次宽度固定，便于纵向扫读。 */
			".dph_boardHead{display:flex;align-items:baseline;gap:8px;padding:2px 2px 0}",
			".dph_boardRank{flex:none;min-width:22px;font-size:11px;font-weight:700;color:var(--dsw-alias-state-business-primary);font-variant-numeric:tabular-nums}",
			".dph_boardMetric{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
			".dph_boardDelta{font-size:11px;color:var(--dsw-alias-label-tertiary)}",
			".dph_boardWhy{flex:none;font-size:10px;line-height:1.5;color:var(--dsw-alias-label-tertiary);padding:2px 2px 4px}",
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
			/* 套装槽位行（2026-10-20 重排）：职责 → 插件名 → 必要性 → 星标/已装。
			   ⚠️ 三个坑，动之前先看：
			   1) **不要复用 `.dph_setRow`**：设置页那一族也叫这个名字（见下方 `.dph_set*`），
			      后定义者覆盖前者 —— 实测把槽位行变成 `justify-content:space-between`，
			      四段被均摊到行两端，名字/徽标的位置随星数宽度漂移（用户截图暴露）；
			   2) 职责列旧版写死 `max-width:110px` + nowrap，长文案被截成「免 Key 主视觉入口…」
			      ⇒ 现改两行 clamp，并在 title 里保留全文；
			   3) 宽屏单行 flex 时行内总宽只有 450px 上下，主列却有 850px+，右侧整片空白
			      （用户反馈「单靠左边」）⇒ 用 auto-fit 网格，让宽度按列数吃满。 */
			".dph_slotGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px 22px}",
			".dph_slotRow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;column-gap:8px;row-gap:2px;align-items:baseline;min-width:0;padding:2px 0}",
			".dph_slotRole{grid-column:1/-1;min-height:16px;font-size:11px;line-height:1.45;color:var(--dsw-alias-label-tertiary);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}",
			".dph_slotName{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dph_slotNeed{justify-self:end;white-space:nowrap}",
			".dph_slotTail{justify-self:end;max-width:112px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}",
			".dph_cmdBlock{white-space:pre-wrap;word-break:break-all;max-height:132px;overflow:auto}",
			".dph_cmd{flex:1;min-width:200px;box-sizing:border-box;display:flex;align-items:center;height:28px;background:var(--dsw-alias-bg-layer-3);border-radius:8px;padding:0 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--dsw-alias-label-primary);overflow-x:auto;white-space:nowrap}",
			".dph_cmdMissing{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--dsw-alias-label-tertiary)}",
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
			".dph_instRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l2)}",
			".dph_instCol{flex-direction:column;align-items:flex-start;gap:4px}",
			".dph_btnPrimary{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);font-weight:600}",
			".dph_btn:disabled{opacity:.55;cursor:not-allowed}",
			".dph_instMsg{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".dph_instOk{color:var(--dsw-alias-state-business-primary)}",
			".dph_instBad{color:var(--dsw-alias-state-error-primary)}",
			".dph_instHint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
			".dph_sell{display:flex;align-items:flex-start;gap:6px;font-size:12px;line-height:1.6}",
			".dph_sellTag{flex:none;display:inline-flex;align-items:center;box-sizing:border-box;height:18px;border:1px solid var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);border-radius:6px;padding:0 5px;font-size:10px;line-height:1}",
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
			/* 对比：入口条 + 并排事实表。列用 flex 等分，2 列/3 列都自适应（上限 3 见 COMPARE_MAX）。 */
			".dph_cmpBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}",
			".dph_cmp{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:1px solid var(--dsw-alias-state-business-primary);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}",
			".dph_cmpRow{display:flex;gap:6px;align-items:flex-start}",
			".dph_cmpCell{flex:1;min-width:0;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-primary);word-break:break-word}",
			".dph_cmpLabel{flex:none;width:56px;color:var(--dsw-alias-label-tertiary)}",
			".dph_cmpName{font-weight:600}",
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
			/* ──────────────── 页签入口：双栏工作台（2026-10-19 A2 重构） ────────────────
			   原来是一条 12px 等距的纵向流：页头 / 页签 / 今日推荐 / 筛选 / 列表 / 页脚
			   全贴在同一张背景上，区块之间没有边界；宽屏下卡片正文只占一半、右侧空着。
			   现在分四层：页头 + 页签 / 主列（检索与列表）/ 侧栏（决策信息）。
			   ⚠️ 两条实测要点：
			     1) 主列与侧栏都必须 min-width:0 —— 卡片里的安装命令是 nowrap 的 <code>，
			        不写会把 1fr 列撑破、侧栏被挤出可视区；
			     2) 窄窗单列时用 display:contents 把侧栏拆成两个栅格项（今日推荐 / 其余），
			        靠 order 把今日推荐提到列表之前 —— 不复制 DOM，也不存在两套渲染分支。 */
			".dph_work{display:grid;grid-template-columns:minmax(0,1fr) 212px;gap:20px;align-items:start;width:100%;max-width:1080px;margin:0 auto;padding:12px 4px 20px}",
			".dph_workHead{grid-column:1/-1;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 0 0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_tabbar{grid-column:1/-1;display:flex;gap:20px;flex-wrap:wrap;border-bottom:1px solid var(--dsw-alias-border-l2)}",
			".dph_tab{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;height:32px;padding:0 0 10px;box-sizing:border-box;cursor:pointer;white-space:nowrap}",
			".dph_tab:hover{color:var(--dsw-alias-label-primary)}",
			".dph_tabOn{color:var(--dsw-alias-state-business-primary);font-weight:600;box-shadow:inset 0 -2px 0 var(--dsw-alias-state-business-primary)}",
			".dph_mainCol{display:flex;flex-direction:column;gap:12px;min-width:0}",
			".dph_sectionHead{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
			".dph_sectionTitle{margin:0;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_sectionCount{font-size:11px;color:var(--dsw-alias-label-tertiary)}",
			".dph_rail{display:flex;flex-direction:column;gap:8px;min-width:0;position:sticky;top:0}",
			".dph_railSlot{display:flex;flex-direction:column;gap:10px;min-width:0}",
			".dph_railCard{display:flex;flex-direction:column;gap:8px;min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:12px}",
			/* 今日推荐是侧栏里唯一"当天只有一个答案"的东西，给一条强调边区分于其它信息块 */
			".dph_railCardAccent{border-left:3px solid var(--dsw-alias-state-business-primary)}",
			".dph_railLabel{margin:0;font-size:11px;color:var(--dsw-alias-label-tertiary)}",
			".dph_railName{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);margin-top:4px;word-break:break-word}",
			".dph_railMeta{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.5;word-break:break-word}",
			".dph_railDesc{margin:4px 0 0;font-size:11px;line-height:1.55;color:var(--dsw-alias-label-secondary)}",
			".dph_railWhy{margin:5px 0 0;padding-top:6px;border-top:1px solid var(--dsw-alias-border-l2);font-size:11px;line-height:1.55;color:var(--dsw-alias-label-tertiary)}",
			".dph_railDivider{border-top:1px solid var(--dsw-alias-border-l2);padding-top:6px;margin-top:3px;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
			".dph_railLink{color:var(--dsw-alias-state-business-primary);text-decoration:none}",
			".dph_railLink:hover{text-decoration:underline}",
			".dph_railWarn{color:var(--dsw-alias-state-business-primary)}",
			".dph_top3{display:flex;align-items:baseline;gap:7px;min-width:0;font-size:11px;color:var(--dsw-alias-label-primary)}",
			".dph_top3Rank{flex:none;width:10px;color:var(--dsw-alias-state-business-primary);font-weight:600}",
			".dph_top3Name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dph_top3Num{flex:none;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}",
			/* 宽屏卡片：左内容 + 右 84px 操作轨道。只由 renderCard 的 wide 分支产出；
			   浮窗 / 今日推荐 / 分类精选仍走原来的 .dph_card，互不影响。 */
			".dph_cardLg{display:grid;grid-template-columns:minmax(0,1fr) 88px;gap:14px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:14px}",
			".dph_cardLgMain{display:flex;flex-direction:column;gap:10px;min-width:0}",
			".dph_opRail{display:flex;flex-direction:column;gap:5px}",
			".dph_opRail .dph_btn{width:100%;text-align:center;padding:5px 6px}",
			".dph_btnSm{height:28px;padding:0 10px;font-size:12px;border-radius:8px;box-sizing:border-box}",
			/* 命令条：复制按钮内嵌右端，不再靠 flex:1 把按钮顶到卡的另一头 */
			/* 分享（2026-10-21）：与「复制命令」同行，所以命令条必须允许换行 ——
			   浮窗只有 400px，展开后 4 个动作按钮放不下，不换行就会顶出卡片右边界。 */
			".dph_shareWrap{display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px;max-width:100%}",
			/* 212px 侧栏里的命令条是竖排（.dph_cmdbarCol），四个动作若各占一行会把卡片拉高近一半；
			   改成两列网格即可。只在展开态生效，收起态仍是一颗普通按钮。 */
			".dph_cmdbarCol .dph_shareWrapOpen{display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%}",
			".dph_cmdbarCol .dph_shareWrapOpen .dph_btn{width:100%;text-align:center}",
			".dph_cmdbar{display:flex;align-items:center;gap:6px;row-gap:4px;flex-wrap:wrap;min-width:0;background:var(--dsw-alias-bg-layer-3);border-radius:6px;padding:5px 6px 5px 9px}",
			".dph_cmdbarCode{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			/* 212px 侧栏里的命令条：横向排会把命令截成「dsh plugin ----」（实测），
			   改竖排 + 允许断词，命令必须完整可读 —— 它是这一块的行动依据。 */
			".dph_cmdbarCol{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:6px}",
			".dph_cmdbarCol .dph_cmdbarCode{white-space:normal;overflow-wrap:anywhere;word-break:normal;line-height:1.5}",
			/* 侧栏里的安装行同理：包名在窄栏里必须能换行，否则会顶出卡片右边界 */
			".dph_railCard .dph_instRow{flex-direction:column;align-items:flex-start;gap:4px}",
			/* 2026-10-21：安装按钮原被拉满整行（176px），比下面两列 88px 的「复制命令/分享」
			   宽一倍，看起来就是"比别的按钮大"。按半行宽 —— 与命令条网格单元格同宽。 */
			".dph_railCard .dph_instRow .dph_btn{min-width:50%}",
			".dph_railCard .dph_instHint{word-break:break-all}",
			"@media (max-width:900px){.dph_work{grid-template-columns:minmax(0,1fr)}.dph_rail{display:contents}.dph_workHead,.dph_tabbar{order:0}.dph_dailySlot{order:1}.dph_mainCol{order:2}.dph_railSlot{order:3}.dph_railCard .dph_instRow{flex-direction:row;align-items:center}.dph_cmdbarCol{flex-direction:row;align-items:center}.dph_cmdbarCol .dph_cmdbarCode{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}",
			/* ──────────────── 社群 + 订阅（2026-10-20） ────────────────
			   一条通栏卡，三处共用：会话页签（宽）/ 右下浮窗（compact）/ 设置页（无外框）。
			   ⚠️ 二维码 84px 是站点实测的下限（64px 时 jsQR 已解不出，72px 是临界），
			   这里不改小 —— 扫不出来的二维码等于没有入口。
			   二维码**默认收起**：展开后高度约 +120px，页签首屏会被列表挤走，
			   「入口存在但看不见」比没有入口更糟。 */
			".dph_join{flex:none;display:flex;flex-direction:column;gap:8px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:12px 14px}",
			".dph_joinHead{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
			".dph_joinTitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dph_joinSub{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
			".dph_joinRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
			".dph_qrRow{display:flex;gap:16px;flex-wrap:wrap;padding:2px 0 1px}",
			".dph_qrItem{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}",
			".dph_qrImg{display:block;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:#fff;padding:3px}",
			".dph_qrHint{font-size:10px;color:var(--dsw-alias-label-tertiary);text-align:center}",
			".dph_qrLink{font-size:11px;color:var(--dsw-alias-state-business-primary);text-decoration:none}",
			".dph_qrLink:hover{text-decoration:underline}",
			".dph_subForm{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;min-width:0}",
			".dph_subInput{flex:1;min-width:150px;box-sizing:border-box;height:28px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 9px;font:inherit;font-size:12px;outline:none}",
			".dph_subInput:focus{border-color:var(--dsw-alias-state-business-primary)}",
			".dph_joinMsg{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary)}",
			".dph_joinOk{color:var(--dsw-alias-state-business-primary)}",
			".dph_joinBad{color:var(--dsw-alias-state-error-primary)}",
			".dph_joinNote{font-size:10px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
			/* 浮窗 400px：省掉说明行，二维码与表单各占一行，不再并排 */
			".dph_joinCompact .dph_joinSub{display:none}",
			/* 设置页里是「卡中卡」：去掉外框，用一条分隔线接在更新日志之后 */
			".dph_joinInSet{border:0;border-top:1px solid var(--dsw-alias-border-l2);border-radius:0;background:transparent;padding:12px 0 0}",
			".dph_workHead::before{content:\"\";width:3px;height:11px;border-radius:2px;background:var(--dsw-alias-state-business-primary)}",
			".dph_workHead .dph_sub{font-weight:400}",
			/* 已安装：实底浅蓝 —— 它说的是「现在的事实」，与分类标签同形不同质 */
			".dph_tagSolid{background:var(--dsw-alias-state-business-tertiary);border-color:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary)}",
			/* 选中（已进对比篮）：整卡描边 + 极浅主色底。
			   只靠按钮变蓝在长列表里认不出「这条被选了」——用户原话是「选中之后需要加高亮」。
			   第二圈用 box-shadow inset 画，不加 border 宽度：改宽度会让卡片跳 1px。 */
			".dph_cardOn{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary);box-shadow:inset 0 0 0 1px var(--dsw-alias-state-business-primary)}",
			/* 已收藏：只在左侧画 3px 竖条，不染色不描边 —— 收藏是跨会话的持久偏好，
			   用户可能攒十几条，整卡染色会盖掉「对比选中」那个更临时的信号。
			   padding-left 从 14 减到 11：3px 边框 + 11px 内距 = 内容仍从 14px 起，不动版。 */
			".dph_cardFav{border-left:3px solid var(--dsw-alias-state-business-primary);padding-left:11px}",
			/* 选中卡里的主按钮改回白底：浅蓝底 + 蓝描边按钮叠在一起会糊成一片 */
			".dph_cardOn .dph_btnPrimary{background:var(--dsw-alias-bg-layer-1)}",
			/* 右栏命令条是两列网格：命令跨两列，复制/分享各占一格（展开态自然排成 2×2） */
			".dph_cmdbarCol .dph_cmdbarCode{grid-column:1/-1;font-size:11.5px}",
			".dph_cmdbarCol .dph_shareWrap,.dph_cmdbarCol .dph_shareWrap .dph_btn{width:100%}",
			".dph_cmdbarCol .dph_shareWrap .dph_btn{height:28px;padding:0 6px;font-size:11.5px}",
			/* 响应式（2026-10-21）：主列单栏时宽卡也拆单列，操作轨道转横排成一条动作行 */
			"@media (max-width:900px){.dph_cardLg{grid-template-columns:minmax(0,1fr);gap:10px}.dph_opRail{flex-direction:row;flex-wrap:wrap;margin-top:2px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l2)}.dph_opRail .dph_btn{flex:1 1 0;min-width:0}.dph_rail{position:static}}",
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
		/**
		 * 社群入口（2026-10-20）。
		 *
		 * 真源在站点 `lib/community.ts`（首页右栏 / 文章页 CTA / 全站页脚三处读它）。
		 * 插件是**独立 npm 包，不能 import 站点代码**，所以这里保留一份副本：
		 * 换群或改链接时两处都要改，否则插件里进的是旧群。
		 *
		 * 二维码不存图：站点 `app/qr/route.ts` 按 url 现生成 PNG（`/qr?url=…`），
		 * 换群链接后二维码自动跟着变，不存在「图没换」这种事故。
		 */
		const COMMUNITY_GROUPS = [
			{
				key: "qq",
				labelKey: "join.qq",
				scanKey: "join.scanQq",
				name: "DPharness QQ 群",
				url: "https://qm.qq.com/q/CwSG74aKdi",
			},
			{
				key: "feishu",
				labelKey: "join.feishu",
				scanKey: "join.scanFeishu",
				name: "DPharness 飞书群",
				/* applink 深链：装了飞书直接唤起飞书，没装会跳下载引导页 —— 预期行为 */
				url: "https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=640sc405-cb7b-4ba8-b75d-0d21949251a6",
			},
		].map((group) => Object.assign({}, group, { qr: SITE + "/qr?url=" + encodeURIComponent(group.url) }));
		const NEWSLETTER_URL = SITE + "/newsletter";
		const zh = {
			"view.tab": "严选插件",
			"view.title": "dsh 严选插件",
			"view.sub": "只推装得上的 · 数据来源 dpharness.com",
			/* 区标题：与页头口径分开 —— 页头说"这是什么"，区标题说"现在看到的是哪一段" */
			"section.browse": "浏览插件",
			"section.best": "分类精选",
			"section.sets": "套装方案",
			"section.daily": "每日推荐",
			"section.updates": "我的插件",
			/* 侧栏：今日推荐 / 各小类冠军 / 安装须知 */
			"rail.highlights": "各小类冠军 · 周下载前 3",
			"rail.highlightsHint": "共 {n} 个小类各取第 1 名 · {m} 期 · 按周下载排序",
			"rail.viewBoard": "查看完整榜单 →",
			"rail.install": "安装须知",
			"rail.installTip": "插件走本地通道安装，重启 dsh 后生效；未重启时页面上方会提示。",
			"rail.restartPending": "有插件装完还没重启，重启 dsh 才会生效。",
			"rail.week": "周下载 {n}",
			"search.placeholder": "搜索插件名称 / 描述 / 作者…",
			"sort.default": "综合",
			"sort.stars": "按 Star",
			"action.refresh": "刷新",
			"action.openSite": "打开站点",
			"action.copy": "复制命令",
			"action.copied": "已复制",
			/* 分享（2026-10-21）：入口贴近「复制命令」—— 两者同属「把这条带走」，
			   所以文案也贴着这两条放，翻译时一起改，别分到两个区块去。 */
			"share.action": "分享",
			"share.toggle": "把这条发给同事：链接 / 文案 / 说明图",
			"share.closeHint": "收起分享选项",
			"share.link": "复制链接",
			"share.linkHint": "复制站点详情页链接（带 dsh 来源标识，落地可在渠道追踪里看到）",
			"share.text": "复制文案",
			"share.textHint": "标题 + 一句话卖点 + 链接，直接贴进群里",
			"share.card": "说明图",
			"share.cardHint": "下载这张插件的说明图（1200×630 PNG），发群或贴文用",
			"share.collapse": "收起",
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
			"compare.pick": "对比",
			"compare.picked": "已选",
			"compare.toggle": "加入对比（最多 {max} 个）",
			"compare.selected": "已选 {n}/{max}",
			"compare.needTwo": "至少选 2 个才能对比",
			"compare.show": "开始对比",
			"compare.hide": "收起对比",
			"compare.clear": "清空",
			"compare.stars": "星标",
			"compare.verify": "实装验证",
			"compare.tested": "人工实测通过",
			/* 与卡片标签同一口径（tag.verify.*）：verifyStatus 是**实装验证**的结果，
			   不是 installCheck（装得上吗）—— 旧文案「通过安装校验」把两件事混成了一件。 */
			"compare.verified": "实装验证通过",
			"compare.failed": "实装验证未通过",
			"compare.unverified": "未验证",
			"compare.installed": "本机",
			"compare.notInstalled": "未安装",
			"compare.cat": "分类",
			"compare.sell": "卖点",
			"compare.install": "安装命令",
			"fav.toggle": "收藏待装",
			"fav.add": "收藏",
			"fav.added": "已藏",
			"fav.title": "收藏待装",
			"fav.count": "收藏待装（{n}）",
			"fav.hint": "先攒着，之后再一起装；只存本机，不会上传。",
			"fav.remove": "移除",
			"fav.installAll": "一键安装全部（{n}）",
			"fav.installConfirm": "将逐个安装 {n} 个收藏（会改本机 profile、需要重启 dsh 才生效）—— 再点一次开始。",
			"fav.empty": "还没有收藏。在「严选推荐」的卡片上点「收藏」就会放到这里。",
			"benefits.title": "福利专区",
			"benefits.body": "全网大模型新用户免费额度与限时活动，每周人工更新。",
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
			"updates.releaseAge": "供应链策略暂停",
			"updates.releaseAgeTitle": "供应链策略暂停了这次安装",
			"updates.releaseAgeBody": "pnpm 默认拒绝「发布不满 24 小时」的版本，本次被拦下 {n} 条：{list}。",
			"updates.releaseAgeHow": "两条路：① 等 —— 最新一条约 {h} 小时后自动可装；② 在本机 profile 的 pnpm-workspace.yaml 里给这些包加 minimumReleaseAgeExclude 豁免（同一个包要写成一条规则，多条 name@version 只有第一条生效）。",
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
			"usage.summary": "近 {d} 天：核心 {a} · 常用 {b} · 偶尔 {c} · 可考虑清理 {e} · 无法度量 {f}",
			"usage.core": "核心在用",
			"usage.common": "常用",
			"usage.occasional": "偶尔用",
			"usage.silent": "可考虑清理",
			"usage.disabled": "已停用",
			"usage.unmeasurable": "无法度量",
			"usage.unknown": "使用数据不可用",
			"usage.calls30d": "近30天 {n} 次",
			"usage.stats": "近30天 {n} 次 · 上次使用 {d}",
			"usage.today": "今天",
			"usage.yesterday": "昨天",
			"usage.daysAgo": "{d} 天前",
			"usage.silentNote": "近 30 天没有可观测的调用记录",
			"usage.unmeasurableNote": "该插件不产生可观测的调用（被动型），是否保留请人工判断",
			"usage.unknownNote": "暂时读不到使用数据（宿主未提供统计）",
			"usage.keep": "保留",
			"usage.kept": "已保留",
			"usage.keepHint": "标为保留后，不会再出现在清理建议里（只存本机，不上传）",
			"usage.onlySuggest": "只看建议清理",
			"usage.sortUsage": "按使用频率",
			"usage.sortUsageOn": "恢复默认排序",
			"usage.noneSuggest": "没有建议清理的插件（已保留的不会出现在这里）。",
			"usage.disable": "禁用",
			"usage.enable": "启用",
			"usage.disableConfirm": "确认禁用？",
			"usage.enableConfirm": "确认启用？",
			"usage.toggleHint": "禁用/启用即时生效、随时可恢复（改的是本机 profile patch，不动依赖清单）",
			"usage.toggling": "处理中…",
			"usage.disabledDone": "已禁用",
			"usage.enabledDone": "已启用",
			"usage.toggleFailed": "操作失败",
			"usage.toggleOverridden": "未能生效（被更高优先级的层覆盖）",
			"usage.toggleSelf": "不能禁用它自己（管理界面会一起消失）",
			"usage.toggleReadonly": "该行由 dsh 管理，不能在这里启停",
			"usage.toggleUnaddressable": "该行定位不到（刷新后重试）",
			"usage.toggleUnsupported": "当前宿主不支持启停（需要较新的 dsh）",
			"usage.batchDisable": "批量禁用（{n}）",
			"usage.batchConfirm": "将逐个禁用 {n} 个启用中的候选（可随时恢复）—— 再点一次开始。",
			"usage.batchProgress": "禁用中 {done}/{total} · {name}",
			"usage.batchDone": "已禁用 {done} 个 · 失败 {failed} 个",
			"usage.batchHint": "只处理启用中的候选；已停用的请在行内卸载",
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
			/* 卡片标签（站点英文枚举的中文名，见 makeUi 的 TAG_LABEL）
			   ⚠️ tier 与 usage.core 是**两套语义**：这里是生态分层（核心 / 相关），
			   那里的「核心在用」是使用频次，别合并。 */
			"tag.tier.core": "核心",
			"tag.tier.related": "相关",
			"tag.verify.pass": "实装验证通过",
			"tag.verify.fail": "实装验证未通过",
			"tag.tested.passed": "人工实测通过",
			"tag.risk.medium": "风险：中",
			"tag.risk.high": "风险：高",
			"tag.compat": "适配 DSH {v}",
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
			/* 周榜（2026-10-20）：站点两条榜单线搬进插件。
			   两者口径不同，文案里必须各自点名依据 —— 下载量 vs 站内复制安装
			   差好几个数量级，用户拿它们互相对照就会得出错误结论。 */
			"board.tab": "周榜",
			"board.top": "精选 Top 榜",
			"board.installs": "真装机周榜",
			"board.topSub": "{n} 条 · 第 {p} 期",
			"board.topSubLive": "{n} 条 · 实时口径",
			"board.installsSub": "{n} 条 · 近 7 天",
			"board.loading": "正在取当期周榜…",
			"board.empty": "本周还没有可上榜的数据",
			"board.topWhy": "按 npm 全网周下载量排序，每周一采集一期；期次是当时的数据，不随现在重算。",
			"board.topWhyLive": "当期快照还没回填，这里显示的是实时口径（没有期次）。",
			"board.installsWhy": "按本站「复制安装」的人数排序 —— 本站实测，不是全网热度，不能和上面的下载量榜对照。",
			"board.weekly": "周下载 {n}",
			"board.thisWeek": "本周 {n} 人",
			"board.prevWeek": "上周 {m} 人",
			"board.deltaUp": "↑{n}",
			"board.deltaDown": "↓{n}",
			"board.deltaNew": "新增",
			"board.deltaFlat": "持平",
			"board.offline": "站点榜单接口暂不可用（可能还没发版），点「打开官网」看完整榜单。",
			/* 大数单位（见 fmtCount）：中文按万，英文按 K —— 单位跟着语言走 */
			"board.scale": "10000|万",
			/* 社群 + 订阅（页签 / 浮窗 / 设置页三处共用一套文案） */
			"join.title": "插件交流群已开放",
			"join.sub": "用法、报错、新插件，群里问更快",
			"join.showQr": "查看二维码",
			"join.hideQr": "收起二维码",
			"join.qq": "QQ 群",
			"join.feishu": "飞书群",
			"join.scanQq": "手机 QQ 扫码进群",
			"join.scanFeishu": "飞书扫码进群",
			"join.joinGroup": "加入{label}",
			"join.newsletter": "每周一封插件周报",
			"join.newsletterSub": "新插件、精选评测与福利，周一早上发",
			"join.email": "你的邮箱",
			"join.subscribe": "订阅",
			"join.sending": "发送中…",
			"join.subscribeOk": "确认信已发出，请到邮箱点确认",
			/* 失败文案按「错在哪一段」分开说（2026-10-20 实测踩过）：
			   宿主未重启时路由根本没注册，请求拿不到 2xx，旧版把所有情况压成
			   「订阅失败，请稍后再试」——用户对着一个已订阅的邮箱排不出任何线索。 */
			"join.failRoute": "订阅失败（HTTP {code}）：插件路由未加载 —— 完全退出 dsh 再打开后重试",
			"join.failHttp": "订阅失败（HTTP {code}）",
			"join.failUpstream": "订阅失败（HTTP {code}）：站点暂不可用，稍后再试",
			"join.failNetwork": "订阅失败：连不上本机插件服务 —— 确认 dsh 正在运行",
			"join.needEmail": "请先填邮箱",
			"join.note": "邮箱只用于周报，可随时退订。",
			"join.past": "往期周报 →",
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
			"install.unknownState": "查不到重启状态，可刷新页面确认",
			"install.restartFailed": "重启接口不可用，请手动重启 dsh",
			"install.failed": "安装失败",
			"install.busy": "已有安装任务在进行",
			"install.busySince": "已有安装任务在进行（已 {n} 秒）—— 等它结束再试，或重启 dsh",
			"install.timeout": "安装超时（3 分钟没有结束）—— 已停掉这次安装，可以重试",
			"install.timeoutChanged": "安装超时，但版本已从 {from} 变成 {to} —— 多半是装上了，重启 dsh 后确认",
			"install.hint": "安装会在你的 dsh 里执行 dsh plugin add，来源为下方命令中的包名。",
		};
		const en = {
			"view.tab": "Curated",
			"view.title": "dsh curated plugins",
			"view.sub": "Only installable ones · source dpharness.com",
			"section.browse": "Browse plugins",
			"section.best": "By category",
			"section.sets": "Setups",
			"section.daily": "Daily pick",
			"section.updates": "My plugins",
			"rail.highlights": "Top of each group · weekly downloads",
			"rail.highlightsHint": "{n} groups, 1 each · {m} · ranked by weekly downloads",
			"rail.viewBoard": "See the full board →",
			"rail.install": "Install notes",
			"rail.installTip": "Installs go through the local channel and take effect after restarting dsh.",
			"rail.restartPending": "A plugin is installed but dsh has not been restarted yet.",
			"rail.week": "{n}/wk",
			"search.placeholder": "Search name / description / owner…",
			"sort.default": "Relevance",
			"sort.stars": "By stars",
			"action.refresh": "Refresh",
			"action.openSite": "Open site",
			"action.copy": "Copy command",
			"action.copied": "Copied",
			"share.action": "Share",
			"share.toggle": "Send this to a teammate: link / text / card",
			"share.closeHint": "Hide the share options",
			"share.link": "Copy link",
			"share.linkHint": "Copies the site detail-page URL with a dsh source tag (visible in channel tracking)",
			"share.text": "Copy text",
			"share.textHint": "Name + one-line pitch + link, ready to paste into a chat",
			"share.card": "Card",
			"share.cardHint": "Downloads the 1200×630 explainer card (PNG) for chats or posts",
			"share.collapse": "Hide",
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
			"compare.pick": "Compare",
			"compare.picked": "Picked",
			"compare.toggle": "Add to comparison (up to {max})",
			"compare.selected": "Picked {n}/{max}",
			"compare.needTwo": "Pick at least 2 to compare",
			"compare.show": "Compare",
			"compare.hide": "Hide comparison",
			"compare.clear": "Clear",
			"compare.stars": "Stars",
			"compare.verify": "Verified",
			"compare.tested": "Hands-on tested",
			"compare.verified": "Install verified",
			"compare.failed": "Install verification failed",
			"compare.unverified": "Unverified",
			"compare.installed": "On this machine",
			"compare.notInstalled": "Not installed",
			"compare.cat": "Category",
			"compare.sell": "Pitch",
			"compare.install": "Install command",
			"fav.toggle": "Save for later",
			"fav.add": "Save",
			"fav.added": "Saved",
			"fav.title": "Saved for later",
			"fav.count": "Saved for later ({n})",
			"fav.hint": "Collect them first, install together later; stored on this machine only.",
			"fav.remove": "Remove",
			"fav.installAll": "Install all saved ({n})",
			"fav.installConfirm": "Installs {n} saved plugins one by one (rewrites your profile, needs a dsh restart) — click again to start.",
			"fav.empty": "Nothing saved yet. Hit “Save” on a card under Recommend to collect it here.",
			"benefits.title": "Perks",
			"benefits.body": "Free tiers and new-user credits across LLM platforms, hand-updated weekly.",
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
			"updates.releaseAge": "Supply-chain policy hold",
			"updates.releaseAgeTitle": "A supply-chain policy paused this install",
			"updates.releaseAgeBody": "pnpm refuses versions published less than 24 hours ago by default. Blocked this time ({n}): {list}.",
			"updates.releaseAgeHow": "Two ways out: (1) wait — the newest entry becomes installable in about {h}h; (2) add these packages to minimumReleaseAgeExclude in your profile's pnpm-workspace.yaml (one rule per package — multiple name@version lines only the first one counts).",
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
			"usage.summary": "Last {d} days: {a} core · {b} regular · {c} occasional · {e} consider-removing · {f} undetectable",
			"usage.core": "Core",
			"usage.common": "Regular",
			"usage.occasional": "Occasional",
			"usage.silent": "Consider removing",
			"usage.disabled": "Disabled",
			"usage.unmeasurable": "Undetectable",
			"usage.unknown": "Usage data unavailable",
			"usage.calls30d": "{n} calls in 30d",
			"usage.stats": "{n} calls in 30d · last used {d}",
			"usage.today": "today",
			"usage.yesterday": "yesterday",
			"usage.daysAgo": "{d} days ago",
			"usage.silentNote": "No observed calls in the last 30 days",
			"usage.unmeasurableNote": "This plugin produces no observable calls (passive) — keep or remove manually",
			"usage.unknownNote": "Usage data is unavailable from this host",
			"usage.keep": "Keep",
			"usage.kept": "Kept",
			"usage.keepHint": "Kept plugins are excluded from removal suggestions (stored locally only)",
			"usage.onlySuggest": "Suggestions only",
			"usage.sortUsage": "By usage",
			"usage.sortUsageOn": "Default order",
			"usage.noneSuggest": "Nothing flagged for removal (kept plugins are excluded).",
			"usage.disable": "Disable",
			"usage.enable": "Enable",
			"usage.disableConfirm": "Confirm disable?",
			"usage.enableConfirm": "Confirm enable?",
			"usage.toggleHint": "Enable/disable applies to the live session immediately and is fully reversible (edits the local profile patch, not dependencies).",
			"usage.toggling": "Working…",
			"usage.disabledDone": "Disabled",
			"usage.enabledDone": "Enabled",
			"usage.toggleFailed": "Failed",
			"usage.toggleOverridden": "Not applied (overridden by a higher-priority layer)",
			"usage.toggleSelf": "Cannot disable the hub itself",
			"usage.toggleReadonly": "This row is managed by dsh and cannot be toggled here",
			"usage.toggleUnaddressable": "This row cannot be addressed (refresh and retry)",
			"usage.toggleUnsupported": "This host does not support enable/disable (needs a newer dsh)",
			"usage.batchDisable": "Disable all ({n})",
			"usage.batchConfirm": "Disable {n} enabled candidates one by one (fully reversible) — click again to start.",
			"usage.batchProgress": "Disabling {done}/{total} · {name}",
			"usage.batchDone": "Disabled {done} · failed {failed}",
			"usage.batchHint": "Only enabled candidates are handled; uninstall disabled ones individually",
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
			"tag.tier.core": "Core",
			"tag.tier.related": "Related",
			"tag.verify.pass": "Install verified",
			"tag.verify.fail": "Install verification failed",
			"tag.tested.passed": "Hands-on tested",
			"tag.risk.medium": "Risk: medium",
			"tag.risk.high": "Risk: high",
			"tag.compat": "DSH {v}",
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
			/* Weekly boards: two different measurements — npm downloads vs.
			   in-site copy-install visitors. Never present them as comparable. */
			"board.tab": "Weekly",
			"board.top": "Top downloads",
			"board.installs": "Real installs",
			"board.topSub": "{n} items · issue {p}",
			"board.topSubLive": "{n} items · live",
			"board.installsSub": "{n} items · last 7 days",
			"board.loading": "Loading this week's board…",
			"board.empty": "No qualifying data for this week yet",
			"board.topWhy": "Ranked by weekly npm downloads, captured every Monday; the issue is a snapshot, not a live re-rank.",
			"board.topWhyLive": "This issue's snapshot has not been captured yet — showing a live ranking (no issue number).",
			"board.installsWhy": "Ranked by unique visitors who copied an install command on this site — measured here, not a global popularity metric. Not comparable with the downloads board.",
			"board.weekly": "{n}/wk",
			"board.thisWeek": "{n} this week",
			"board.prevWeek": "{m} last week",
			"board.deltaUp": "↑{n}",
			"board.deltaDown": "↓{n}",
			"board.deltaNew": "new",
			"board.deltaFlat": "flat",
			"board.offline": "The site's board API is unavailable (probably not released yet). Use “Open site” to see the full board.",
			"board.scale": "1000|K",
			"join.title": "Community group is open",
			"join.sub": "Usage, install errors and new plugins — asking in the group is faster",
			"join.showQr": "Show QR codes",
			"join.hideQr": "Hide QR codes",
			"join.qq": "QQ group",
			"join.feishu": "Feishu group",
			"join.scanQq": "Scan with mobile QQ",
			"join.scanFeishu": "Scan with Feishu",
			"join.joinGroup": "Join {label}",
			"join.newsletter": "Weekly plugin digest",
			"join.newsletterSub": "New plugins, reviews and perks — Monday mornings",
			"join.email": "Your email",
			"join.subscribe": "Subscribe",
			"join.sending": "Sending…",
			"join.subscribeOk": "Confirmation sent — open your inbox and click the link",
			"join.failRoute": "Subscribe failed (HTTP {code}): plugin route not loaded — quit dsh completely, reopen, then retry",
			"join.failHttp": "Subscribe failed (HTTP {code})",
			"join.failUpstream": "Subscribe failed (HTTP {code}): the site is unavailable, try again later",
			"join.failNetwork": "Subscribe failed: cannot reach the local plugin service — make sure dsh is running",
			"join.needEmail": "Enter your email first",
			"join.note": "Used for the digest only; unsubscribe anytime.",
			"join.past": "Past issues →",
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
			"install.unknownState": "Can't confirm the restart state — reload the page",
			"install.restartFailed": "Restart endpoint unavailable — restart dsh manually",
			"install.failed": "Install failed",
			"install.busy": "Another install is already running",
			"install.busySince": "Another install is already running ({n}s) — wait for it to finish, or restart dsh",
			"install.timeout": "Install timed out (no result in 3 minutes) — this run was stopped, retry when ready",
			"install.timeoutChanged": "Install timed out, but the version changed {from} → {to} — it most likely landed; confirm after restarting dsh",
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
		/* 对比上限：面板宽 400px，第 4 列已经挤到读不下去；页签更宽，但同一份数据两处渲染，
		   口径必须一致（不能浮窗 3 列、页签 4 列）。 */
		const COMPARE_MAX = 3;

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
		const HOST_SHAPE_REV = 4;

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
					/* 供应链策略拒绝（pnpm 内置 24 小时最小发布年龄）—— 与"安装出错"是两回事：
					   它是**预期结果**，界面要给出条目、等待时间与通路。条目在 host 侧已解析好。 */
					if (job.why === "release-age") {
						const aged = job.reject || { count: 0, entries: [] };
						const list = (Array.isArray(aged.entries) ? aged.entries : [])
							.slice(0, 3)
							.map((entry) => entry.name + "@" + entry.version)
							.join("、");
						return {
							ok: false,
							via: "local",
							why: "release-age",
							reject: aged,
							message: format(t("updates.releaseAgeBody"), { n: aged.count || 0, list: list }),
						};
					}
					/* 超时是**唯一**会在"其实已经落盘"的情况下报失败的路径：宿主超时解锁时
					   会补读一次磁盘（见 host forceUnlock），这里就把它读到的版本变化说出来。
					   否则用户看到"失败"会重装一遍，而它早就装上了
					   （2026-10-14 实测 4.4.2 → 4.4.3 已落盘，界面却报失败）。 */
					if (job.error === "timeout") {
						return {
							ok: false,
							via: "local",
							why: "timeout",
							message: job.outcome === "changed"
								? format(t("install.timeoutChanged"), { from: String(job.before || "?"), to: String(job.after || "?") })
								: t("install.timeout"),
						};
					}
					return { ok: false, via: "local", why: "cli_exit", message: String(job.error || job.tail || ("exit code " + job.code)).slice(0, 200) };
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
					/* 409 = 宿主里已有一个安装任务。它的原文是英文（"an install is already
					   running"），直接摊在卡片上等于没解释 —— 改成按 why 出中文，并带上
					   已经跑了多少秒，用户至少知道该等它还是该重启。
					   宿主侧另有一层自愈：明显超时没收尾的任务会被自动解锁（见 forceUnlock），
					   所以这里的 409 只会表示"真的有一个健康的任务在跑"。 */
					const busySeconds = why === "busy" && local.data && Number(local.data.seconds) > 0
						? Math.round(Number(local.data.seconds))
						: 0;
					setInstallJob({
						active: false,
						target,
						phase: "failed",
						message: why === "busy"
							? format(t("install.busySince"), { n: busySeconds })
							: messageOf(local, t("install.failed")),
					});
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
			if (!done.market && done.changed) {
				/* 先钉住宿主这一轮的 bootId（一次本地 GET，拿不到也只是留空）——
				   待重启记录必须记下「安装发生在哪一次启动里」，否则重启后无从判定。 */
				await primeHostBoot();
				markRestartPending(item.nameZh || item.name || target);
			}
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
				/* 与安装同一条通道、同一份 busy 口径（英文原文不出现在界面上） */
				const busySeconds = why === "busy" && local.data && Number(local.data.seconds) > 0
					? Math.round(Number(local.data.seconds))
					: 0;
				setInstallJob({
					active: false,
					verb: "remove",
					target,
					phase: "failed",
					message: why === "busy"
						? format(t("install.busySince"), { n: busySeconds })
						: messageOf(local, t("install.failed")),
				});
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
				await primeHostBoot();
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

		/* 「收藏待装」 —— 本机偏好（localStorage）：先攒着，之后一起装。
		   存的是**条目快照**（只留渲染与安装需要的字段），不是包名引用 ——
		   站点目录会变，包名回头可能查不到，快照至少让这一条还显示得出来、还装得上。
		   与「对比」刻意不同：对比是一次性动作（不持久），收藏是**跨会话的意图**。 */
		const FAV_KEY = "dph-hub-fav";
		const FAV_FIELDS = ["fullName", "pkg", "name", "nameZh", "sell", "cat", "stars", "cmd"];
		function readFav() {
			try {
				const raw = localStorage.getItem(FAV_KEY);
				if (!raw) return [];
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return [];
				return parsed
					.filter((entry) => entry && typeof entry === "object" && (entry.fullName || entry.pkg))
					.slice(0, 100)
					.map((entry) => {
						const snapshot = {};
						FAV_FIELDS.forEach((field) => { if (entry[field] !== undefined) snapshot[field] = entry[field]; });
						return snapshot;
					});
			} catch (error) {
				return [];
			}
		}
		function storeFav(value) {
			try {
				localStorage.setItem(FAV_KEY, JSON.stringify(value));
			} catch (error) {
				/* 隐私模式下不持久化：本次会话内仍然有效 */
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

		/* 「保留」标注 —— 本机偏好（localStorage）：手动认定"这个插件我要留着"。
		   语义：**人工标注高于一切机器判定** —— 被标注的插件永不进入清理候选；
		   反过来，机器测不到（无法度量）的插件也要靠它把用户的真实意图记录下来。 */
		const KEEP_KEY = "dph-hub-keep";
		function readKeep() {
			try {
				const raw = localStorage.getItem(KEEP_KEY);
				if (!raw) return [];
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return [];
				return parsed.map((name) => String(name)).filter(Boolean).slice(0, 300);
			} catch (error) {
				return [];
			}
		}
		function storeKeep(value) {
			try {
				localStorage.setItem(KEEP_KEY, JSON.stringify(value));
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
		/* 宿主 bootId 缓存 —— 安装时随待重启记录一起落盘，重启后 bootId 变了才是
		   「已生效」的硬证据。时间戳只是兜底：它会被「又装了一个」刷新，也怕时钟回拨。 */
		let hostBootId = "";
		let bootInFlight = null;
		function primeHostBoot() {
			if (hostBootId) return Promise.resolve(hostBootId);
			if (bootInFlight) return bootInFlight;
			bootInFlight = getJson("/api/dpharness/meta")
				.then((result) => {
					const body = result && result.data;
					if (body && typeof body.bootId === "string" && body.bootId) hostBootId = body.bootId;
					return hostBootId;
				})
				.catch(() => hostBootId)
				.then((value) => {
					bootInFlight = null;
					return value;
				});
			return bootInFlight;
		}
		function readRestartPending() {
			try {
				const raw = localStorage.getItem(RESTART_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				if (!parsed || !Array.isArray(parsed.names) || !parsed.names.length) return null;
				return {
					names: parsed.names.map((name) => String(name)).filter(Boolean),
					at: Number(parsed.at) || 0,
					/* 旧记录没有 boot 字段 ⇒ 空串 ⇒ 判定回退到时间戳比较 */
					boot: typeof parsed.boot === "string" ? parsed.boot : "",
				};
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
		const hub = { open: false, hidden: hubHidden, daily: dailyOn, telemetry: telemetryOn, autoCheck: readAutoCheck(), ignore: readIgnore(), fav: readFav(), keep: readKeep(), restartPending: readRestartPending(), install: null, batch: null, compare: [], listeners: new Set() };
		function setHub(patch) {
			Object.assign(hub, patch);
			hub.listeners.forEach((listener) => listener());
		}
		/* 合并去重：连装三个再重启，横幅只出一条，名字不重复。 */
		function markRestartPending(name) {
			const label = String(name || "").trim();
			if (!label) return;
			const current = hub.restartPending || { names: [], at: 0 };
			const next = {
				names: Array.from(new Set(current.names.concat([label]))),
				at: Date.now(),
				/* boot = 装完这一刻宿主是哪一次启动（拿不到就留空，判定回退时间戳）。
				   注意连装多个时 at 会被刷新，boot 不变 —— 正是「最后一次安装之后
				   有没有重启过」这个语义。 */
				boot: hostBootId || "",
			};
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
		/** 收藏条目只留渲染与安装要用的字段（目录会变，快照是唯一还认得出它的东西）。 */
		const favKey = (item) => String((item && (item.fullName || item.pkg)) || "");
		function inFav(item) {
			const key = favKey(item);
			return Boolean(key) && (hub.fav || []).some((entry) => favKey(entry) === key);
		}
		function toggleFav(item) {
			const key = favKey(item);
			if (!key) return;
			const list = hub.fav || [];
			if (inFav(item)) {
				const next = list.filter((entry) => favKey(entry) !== key);
				storeFav(next);
				setHub({ fav: next });
				return;
			}
			const snapshot = {};
			FAV_FIELDS.forEach((field) => { if (item[field] !== undefined) snapshot[field] = item[field]; });
			/* 上限 100：这是"攒着待装"的清单，不是知识库；超了丢最旧的（本地存储也不该无限长） */
			const next = list.concat([snapshot]).slice(-100);
			storeFav(next);
			setHub({ fav: next });
		}
		/** 这条更新是否被用户忽略（忽略的是**具体目标版本**，不是这个包）。 */
		function isIgnored(item) {
			if (!item || !hub.ignore) return false;
			const version = hub.ignore[String(item.name || "")];
			return Boolean(version) && version === String(item.latest || "");
		}
		/** 「保留」查询与切换（按包名，跨视图共享一份 hub.keep）。 */
		function isKept(name) {
			const key = String(name || "");
			return Boolean(key) && (hub.keep || []).indexOf(key) >= 0;
		}
		function toggleKeep(name) {
			const key = String(name || "");
			if (!key) return;
			const list = hub.keep || [];
			const next = isKept(key) ? list.filter((entry) => entry !== key) : list.concat([key]).slice(-300);
			storeKeep(next);
			setHub({ keep: next });
		}
		/**
		 * 对比选择集 —— 挂在 hub 上（浮窗与页签共用一份），但**刻意不持久**：
		 * 对比是一次性的动作，不是偏好；下次打开还挂着上回选的两个插件只会让人困惑。
		 * 存的是**条目对象**而不是包名：搜索词一改，列表就换了，只存名字的话
		 * 表格会当场变空（拿不到星标/卖点这些字段）。
		 */
		const compareKey = (item) => String((item && (item.fullName || item.pkg)) || "");
		function inCompare(item) {
			const key = compareKey(item);
			return Boolean(key) && (hub.compare || []).some((entry) => compareKey(entry) === key);
		}
		function toggleCompare(item) {
			const key = compareKey(item);
			if (!key) return;
			const list = hub.compare || [];
			if (inCompare(item)) {
				setHub({ compare: list.filter((entry) => compareKey(entry) !== key) });
				return;
			}
			if (list.length >= COMPARE_MAX) return;
			setHub({ compare: list.concat([item]) });
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
		 * 侧栏「各小类冠军」的三条 —— 口径 A（2026-10-19 定案）。
		 *
		 * ⚠️ 不能直接取 /api/best 的前三条：那个接口的分组顺序是
		 * `subKey asc, rank asc`（app/api/best/route.ts），**没有跨小类排名**。
		 * 实测当期（2026-10）直接取前三条得到的是「市场/管理 › 插件发现」这一个
		 * 小类的第 1、2、3 名 —— 看起来像"榜单坏了"，实际是读错了口径。
		 *
		 * 所以：候选集只保留 rank=1（每个小类一条，当期 43 条），按周下载降序，
		 * 并列时用星数、再用 fullName 字典序兜底 —— 最后一级与 pickDaily 同一条纪律：
		 * 上游分组顺序会随站点重算榜单而变，只有唯一键排序才能保证同一天多次刷新一致。
		 *
		 * 全部在客户端完成：不新增请求、不改站点接口。数据未就绪时返回空数组，
		 * 调用方据此整块不渲染（不占位、不显示"暂无"）。
		 */
		function pickHighlights(data, limit) {
			const all = flattenBest(data).filter((entry) => Number(entry.item.rank) === 1);
			if (all.length === 0) return [];
			const num = (value) => (typeof value === "number" && Number.isFinite(value) ? value : -1);
			const sorted = all.slice().sort((a, b) => {
				const weekly = num(b.item.weeklyDownloads) - num(a.item.weeklyDownloads);
				if (weekly !== 0) return weekly;
				const stars = num(b.item.stars) - num(a.item.stars);
				if (stars !== 0) return stars;
				return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
			});
			const seen = Object.create(null);
			const output = [];
			const max = limit && limit > 0 ? limit : 3;
			for (let index = 0; index < sorted.length; index += 1) {
				const entry = sorted[index];
				/* 同一插件在两个小类都以 rank=1 出现时只留一条（fullName 是唯一键） */
				if (seen[entry.key]) continue;
				seen[entry.key] = true;
				output.push(entry);
				if (output.length >= max) break;
			}
			return output;
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
		 * 「周榜」取数：kind = top（npm 周下载）| installs（站内真装机）。
		 *
		 * 与 useBest / useSets 的三处刻意差别：
		 *  ① **按 kind 分别取**，切到另一个榜必须重新请求（不能拿上一条缓存充数：
		 *     两个榜的字段不同，混用会让装机榜显示成下载量）；
		 *  ② 不设「拿到一次就不再请求」的 loaded 闸 —— 装机榜的窗口是滚动的，
		 *     面板开一整天还显示早上那份就会自相矛盾；真正的成本闸在 host 端
		 *     （top 5 分钟 / installs 60 秒）；
		 *  ③ 卸载时 abort 在途请求：快速来回切两个榜时，晚到的旧响应会覆盖新数据。
		 *
		 * 出错时把「站点接口还没发版（404）」与「真的失败了」分开说 ——
		 * 前者有明确的下一步（去官网看），后者才该说"失败"。
		 */
		function useBoard(t, kind, enabled) {
			const [reload, setReload] = react.useState(0);
			const [state, setState] = react.useState({ loading: false, kind: null, data: null, error: null });

			react.useEffect(() => {
				if (!enabled) return undefined;
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), 20000);
				/* 换榜时先把上一条数据摘掉：两榜条目字段不同，留着只会显示错东西 */
				setState((previous) => ({
					loading: true,
					kind,
					data: previous.kind === kind ? previous.data : null,
					error: null,
				}));
				readHostJson("/api/dpharness/board?kind=" + kind, controller.signal)
					.then((body) => {
						if (controller.signal.aborted) return;
						setState({ loading: false, kind, data: body, error: null });
						track("plugin_hub", { action: "board_open", kind, n: (body && body.total) || 0 });
					})
					.catch((error) => {
						if (controller.signal.aborted) return;
						const message = error && error.name === "AbortError" ? "timeout" : String((error && error.message) || error);
						setState((previous) => ({ loading: false, kind, data: previous.kind === kind ? previous.data : null, error: message }));
					})
					.finally(() => clearTimeout(timer));
				return () => {
					clearTimeout(timer);
					controller.abort();
				};
			}, [enabled, kind, reload]);

			const [copiedCmd, setCopiedCmd] = react.useState("");
			const markCopied = react.useCallback((text) => {
				setCopiedCmd(text);
				setTimeout(() => setCopiedCmd((current) => (current === text ? "" : current)), 2000);
			}, []);

			return {
				state,
				copiedCmd,
				markCopied,
				refresh: () => setReload((n) => n + 1),
				items: state.data && Array.isArray(state.data.items) ? state.data.items : [],
			};
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

			/* 标签文案表：站点 API 给的是**英文枚举**（tier / verifyStatus / testedStatus / riskLevel），
			   原先直接渲染，中文界面里因此露出 `core`、`verify: pass`、`risk: unknown`
			   （2026-10-19 用户截图指出）。这里把枚举翻成中文，与本文件 tierLabel 同一约定：
			   **字典里没有的值返回空串** —— 不显示、不猜，也不把内部标识当文案丢给用户。
			   新增枚举值只改这张表 + 两份字典，勿在 tagsOf 里现拼字符串。 */
			const TAG_LABEL = {
				tier: { core: "tag.tier.core", related: "tag.tier.related" },
				verify: { pass: "tag.verify.pass", fail: "tag.verify.fail" },
				tested: { passed: "tag.tested.passed" },
				/* low / unknown 有意**不给文案**：unknown 占当前样本 97%（194/200），
				   挂一个「风险未知」等于每张卡都贴一条零信息量徽标；low 无风险可报（与站点
				   「站点给的是结论，没结论就没有这条」同口径）。 */
				risk: { medium: "tag.risk.medium", high: "tag.risk.high" },
			};
			function tagLabel(group, value) {
				const key = TAG_LABEL[group] && TAG_LABEL[group][value];
				return key ? t(key) : "";
			}

			function tagsOf(item) {
				const tags = [];
				// 中文分类放最前 —— 它是"这东西是干什么的"的第一眼信息
				if (item.cat) tags.push(badge(item.cat, null));
				const tier = item.tier ? tagLabel("tier", item.tier) : "";
				if (tier) tags.push(badge(tier, item.tier === "core" ? "ok" : null));
				// 兼容范围是版本号，不翻译本体，只补中文前缀（站点原样是「DSH v0.20+」）
				if (item.compat) tags.push(badge(format(t("tag.compat"), { v: item.compat }), null));
				const verify = item.verify ? tagLabel("verify", item.verify) : "";
				if (verify) tags.push(badge(verify, item.verify === "pass" ? "ok" : "bad"));
				const tested = item.tested ? tagLabel("tested", item.tested) : "";
				if (tested) tags.push(badge(tested, "ok"));
				const risk = item.risk ? tagLabel("risk", item.risk) : "";
				if (risk) tags.push(badge(risk, item.risk === "high" ? "bad" : null));
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
					/* 供应链策略暂停：给出被拦的条目 + 还要等多久 + 两条通路。
					   只回一句英文错误码，用户会以为"插件坏了"（2026-10-14 用户实际撞到）。 */
					if (job.why === "release-age" && job.reject) {
						const aged = job.reject;
						const agedEntries = Array.isArray(aged.entries) ? aged.entries : [];
						const latest = agedEntries.reduce((max, entry) => {
							const at = Date.parse(entry.publishedAt || "");
							return Number.isFinite(at) && at > max ? at : max;
						}, 0);
						/* 剩余小时数：不满 1 小时也显示 1，避免出现「约 0 小时后」 */
						const hoursLeft = latest > 0
							? Math.max(1, Math.ceil((latest + 24 * 60 * 60 * 1000 - Date.now()) / (60 * 60 * 1000)))
							: 0;
						return h("div", { className: "dph_instRow dph_instCol" }, [
							h("span", { className: "dph_instMsg dph_instBad", key: "title" }, t("updates.releaseAgeTitle")),
							h("span", { className: "dph_instHint", key: "body" }, format(t("updates.releaseAgeBody"), {
								n: String(aged.count || agedEntries.length),
								list: agedEntries.map((entry) => entry.name + "@" + entry.version).join("、"),
							})),
							hoursLeft > 0
								? h("span", { className: "dph_instHint", key: "how" }, format(t("updates.releaseAgeHow"), { h: String(hoursLeft) }))
								: null,
						]);
					}
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
											renderCard(item, copiedCmd, onCopied, true, false, false, "best"),
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
			 * 数字口径（周下载量这类大数）。
			 *
			 * 为什么单位来自词典而不是代码：中文读「万」、英文读「K/M」，
			 * 写死一种语言就等于在另一种语言里输出乱码式数字（"54.8 万" 出现在英文界面）。
			 * 词典键 `board.scale` 形如 `10000|万` / `1000|K`。
			 */
			function fmtCount(n, t) {
				const v = Math.round(Number(n) || 0);
				if (!Number.isFinite(v) || v <= 0) return "0";
				const scale = String(t("board.scale") || "1000|K").split("|");
				const div = Number(scale[0]) || 1000;
				const unit = scale[1] || "K";
				if (v < div) return String(v);
				const w = v / div;
				const num = w >= 100 ? String(Math.round(w)) : w.toFixed(1).replace(/\.0$/, "");
				return num + " " + unit;
			}

			/**
			 * 「周榜」列表：名次 + 依据 → 复用同一张插件卡。
			 *
			 * 为什么不新写一张卡：安装命令、已装态、汉化兜底、copy_install 埋点
			 * 全在 renderCard 里，复制一份必然分叉 —— 站点侧已经为「同一个插件
			 * 在两个出口给出两套命令」付过代价（lib/installCmd.ts 头部注释）。
			 * 本函数只负责卡片**上面**那一行：第几名、凭什么上榜。
			 *
			 * 名次优先用上游给的 rank（top 是快照固化的名次，installs 侧没有），
			 * 缺失时按下标补，避免出现「第 0 名」。
			 */
			function renderBoard(data, kind, copiedCmd, onCopied, opts) {
				if (!data) return null;
				const items = Array.isArray(data.items) ? data.items : [];
				const wide = !!(opts && opts.wide);
				return items.map((item, index) => {
					const rank = typeof item.rank === "number" && item.rank > 0 ? item.rank : index + 1;
					const metric =
						kind === "top"
							? format(t("board.weekly"), { n: fmtCount(item.weekly, t) })
							: format(t("board.thisWeek"), { n: item.thisUv }) + " · " + format(t("board.prevWeek"), { m: item.prevUv });
					/* 增减只在装机榜有意义：下载量榜的期次差值不在这里算（快照之间对比是另一件事） */
					const prev = Number(item.prevUv) || 0;
					const delta = Number(item.delta) || 0;
					const deltaText =
						kind !== "installs"
							? null
							: prev === 0 && delta > 0
								? t("board.deltaNew")
								: delta > 0
									? format(t("board.deltaUp"), { n: delta })
									: delta < 0
										? format(t("board.deltaDown"), { n: -delta })
										: t("board.deltaFlat");
					return h("div", { className: "dph_boardItem", key: item.fullName || "board" + index }, [
						h("div", { className: "dph_boardHead", key: "head" }, [
							h("span", { className: "dph_boardRank", key: "rank" }, "#" + rank),
							h("span", { className: "dph_boardMetric", key: "metric" }, metric),
							deltaText ? h("span", { className: "dph_boardDelta", key: "delta" }, deltaText) : null,
							h("span", { className: "dph_spacer", key: "gap" }),
							item.src === "repo" ? h("span", { className: "dph_tag", key: "src" }, t("label.repoSource")) : null,
						]),
						renderCard(item, copiedCmd, onCopied, !wide, false, wide, "board"),
					]);
				});
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
							/* 槽位行：类名**故意不复用 `.dph_setRow`**（那个名字归设置页，见样式区注释）。
							   role 为空的条目（没有槽位定义的老套装）仍渲染空 span 占位：
							   role 行是 `grid-column:1/-1` 的整行，缺了它这一格就少一行、与邻格错位。 */
							h("div", { className: "dph_slotGrid", key: "list" }, (set.items || []).map((item) =>
								h("div", { className: "dph_slotRow", key: item.fullName }, [
									h("span", { className: "dph_slotRole", key: "role", title: item.slotRole || "" }, item.slotRole || ""),
									h("span", { className: "dph_slotName", key: "name", title: item.nameZh || item.name || item.fullName || "" }, item.nameZh || item.name || item.fullName || ""),
									h("span", { className: "dph_tag dph_slotNeed", key: "need" }, t("need." + (item.need || "enhance"))),
									item.installed
										? h("span", { className: "dph_tag dph_tagOk dph_slotTail", key: "inst", title: format(t("card.installed"), { v: item.installed }) }, format(t("card.installed"), { v: item.installed }))
										: h("span", { className: "dph_stars dph_slotTail", key: "stars" }, format(t("badge.stars"), { n: item.stars })),
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

			/**
			 * 「对比」—— 把候选并排看关键事实（服务"内容评测"那条差异化在客户端的形态）。
			 *
			 * 为什么值得做：此前只有单张卡片，用户要在 A 和 B 之间选时只能来回滚、靠记忆比。
			 * 这张表把「能据此做决定」的几件事并排放。**一行只放事实，不放评价** ——
			 * 评价（深度评测、对比结论）是站点的活，客户端负责让人当场看得清。
			 */
			function CompareTable(props) {
				const list = useHub().compare || [];
				if (list.length < 2) return null;
				const rows = [
					{ key: "stars", label: t("compare.stars"), value: (item) => format(t("badge.stars"), { n: item.stars }) },
					{ key: "verify", label: t("compare.verify"), value: (item) => (item.tested === "passed" ? t("compare.tested") : item.verify === "pass" ? t("compare.verified") : item.verify === "fail" ? t("compare.failed") : t("compare.unverified")) },
					{ key: "installed", label: t("compare.installed"), value: (item) => (item.installed ? format(t("card.installed"), { v: item.installed }) : t("compare.notInstalled")) },
					{ key: "cat", label: t("compare.cat"), value: (item) => item.cat || "—" },
					{ key: "sell", label: t("compare.sell"), value: (item) => item.sell || "—" },
				];
				const cells = (head, render) => [h("span", { className: "dph_cmpCell dph_cmpLabel", key: "label" }, head)]
					.concat(list.map((item) => render(item)));
				return h("div", { className: "dph_cmp", key: "cmp" }, [
					h("div", { className: "dph_cmpRow", key: "head" }, cells("", (item) => h(
						"span",
						{ className: "dph_cmpCell dph_cmpName", key: compareKey(item), title: String(item.fullName || "") },
						item.nameZh || item.name || item.fullName || "",
					))),
					...rows.map((row) => h("div", { className: "dph_cmpRow", key: row.key }, cells(row.label, (item) => h(
						"span",
						{ className: "dph_cmpCell", key: compareKey(item) },
						String(row.value(item)),
					)))),
					h("div", { className: "dph_cmpRow", key: "cmd" }, cells(t("compare.install"), (item) => h(
						"span",
						{ className: "dph_cmpCell", key: compareKey(item) },
						item.cmd
							? h("button", {
									className: "dph_btn",
									key: "copy",
									type: "button",
									title: item.cmd,
									onClick: () => copyText(item.cmd, () => {
										props.markCopied(item.cmd);
										track("copy_install", { cmd: item.cmd, pkg: item.pkg || "" });
										track("plugin_hub", { action: "compare_copy" });
									}),
								}, props.copiedCmd === item.cmd ? t("action.copied") : t("action.copy"))
							: h("span", { className: "dph_updNote", key: "none" }, t("cmd.missing")),
					))),
				]);
			}

			/** 对比条：只在选了东西时出现；少于 2 个开不了表（比一个东西没有意义）。 */
			function CompareBar(props) {
				const list = useHub().compare || [];
				if (list.length === 0) return null;
				const enough = list.length >= 2;
				return h("div", { className: "dph_cmpBar", key: "cmpBar" }, [
					h("span", { className: "dph_setHint", key: "n" }, format(t("compare.selected"), { n: list.length, max: COMPARE_MAX })),
					h("button", {
						className: "dph_btn" + (props.open ? " dph_btnPrimary" : ""),
						key: "go",
						type: "button",
						disabled: !enough,
						title: enough ? "" : t("compare.needTwo"),
						onClick: props.onToggle,
					}, props.open ? t("compare.hide") : t("compare.show")),
					h("button", {
						className: "dph_btn",
						key: "clear",
						type: "button",
						onClick: () => {
							setHub({ compare: [] });
							track("plugin_hub", { action: "compare_clear" });
						},
					}, t("compare.clear")),
				]);
			}

			/* ------------------------------------------------------- share (2026-10-21) */
			/**
			 * 把一条插件变成「能直接发出去的东西」。
			 *
			 * 为什么面板只给三个动作，不照搬站点 ShareButton 的 14 个平台入口：
			 *   · 微博 / X / QQ 的网页分享接口是给浏览器页设计的，桌面面板里跳编辑框
			 *     比把文案直接贴进群多绕两步；
			 *   · 微信没有网页分享接口，站点用「PC 显示二维码、手机扫」绕过去 —— 这里
			 *     方向正好相反：手机上装不了 dsh 插件，扫码过去只能看详情页，多一步零增量；
			 *   · 站点那套的价值在「网页里读完好转发」，而面板里用户是在挑插件，
			 *     他要的是「这条能发给同事」的物料。
			 *
			 * 文案刻意**不带安装命令**：面板命令里的 --profile 是本机真实值（host 侧 PROFILE），
			 * 接收方若用 web profile 就会装到别处（2026-10-12 已踩过）。只给链接，让对方在
			 * 详情页拿他自己的命令 —— 详情页与验证器是同一口径。
			 *
			 * 说明图走站点的 /og-card（带 Content-Disposition: attachment），点一下即落盘。
			 * 不走「取 PNG 再转 blob」：该接口不带 CORS 头，跨源 fetch 会被浏览器拒。
			 */
			function sharePathOf(fullName) {
				return String(fullName || "").split("/").filter(Boolean).map(encodeURIComponent).join("/");
			}

			/** 详情页 + 渠道参数。utm_source=dsh 已在站点 lib/source-glossary.ts 登记。 */
			function shareLinkOf(fullName) {
				const slug = String(fullName || "").replace(/\//g, "-");
				return SITE + "/plugin/" + sharePathOf(fullName)
					+ "?utm_source=dsh&utm_medium=panel&utm_content=" + encodeURIComponent(slug);
			}

			/** 1200×630 说明图；服务端声明 attachment，点击即下载。 */
			function shareCardOf(fullName) {
				return SITE + "/og-card/" + sharePathOf(fullName) + ".png";
			}

			/**
			 * 摘要截断：优先在句子边界收尾（与站点 ShareButton 的 clipText 同一策略）。
			 * 裸 slice 会把文案切成半句话，分享出去读起来像没写完。
			 * ① 句末标点（保留）② 句中停顿（去标点）③ 都没有才硬截 + 省略号。
			 * ①② 的落点不得早于 max*0.6，否则回退过头、丢的信息比截断还多。
			 */
			function shareClip(text, max) {
				const value = String(text || "").replace(/\s+/g, " ").trim();
				if (value.length <= max) return value;
				const head = value.slice(0, max);
				const floor = Math.floor(max * 0.6);
				const hard = Math.max(head.lastIndexOf("。"), head.lastIndexOf("！"), head.lastIndexOf("？"), head.lastIndexOf("；"));
				if (hard >= floor) return head.slice(0, hard + 1);
				const soft = Math.max(head.lastIndexOf("，"), head.lastIndexOf("、"), head.lastIndexOf("："));
				if (soft >= floor) return head.slice(0, soft);
				return head.trimEnd() + "…";
			}

			/** 分享文案：标题行 + 一句话卖点 + 链接。可直接贴群、贴微博。 */
			function shareTextOf(item) {
				const title = item.nameZh || item.name || item.fullName || "";
				const head = title
					+ (item.owner ? " @" + item.owner : "")
					+ (Number(item.stars) > 0 ? " " + format(t("badge.stars"), { n: item.stars }) : "");
				const brief = shareClip(item.sell || item.descZh || "", 60);
				return (brief ? head + "\n" + brief : head) + "\n" + shareLinkOf(item.fullName);
			}

			/**
			 * 分享入口本体。**行内展开**，不是浮层：浮窗的 .dph_panelBody 是 overflow-y:auto，
			 * 绝对定位弹层会被裁掉（HandoffToDesktop 踩过同类问题，那边能 portal 出去，
			 * 这里 portal 出去会跟卡片脱节）。行内展开零定位风险，也与 InstallRow 的
			 * 二次确认同一交互范式。
			 *
			 * scope = 视图名（picks / panel / daily / best / board），由 renderCard 传入，
			 * 用来回答「哪个视图的人在分享」—— 卡片曝光拿不到，只能看分布与趋势。
			 */
			function ShareUnit(props) {
				const item = props.item || {};
				const fullName = typeof item.fullName === "string" ? item.fullName : "";
				const scope = props.scope || "";
				const [open, setOpen] = react.useState(false);
				const [done, setDone] = react.useState("");
				/* 没有 owner/repo 就拼不出详情页（站点 /plugin/<owner>/<repo> 需要两段）——
				   宁可不渲染这个入口，也不给一个必然落到列表页的链接。hooks 已跑完，早退安全。 */
				if (fullName.indexOf("/") < 0) return null;
				const mark = (key) => {
					setDone(key);
					setTimeout(() => setDone((current) => (current === key ? "" : current)), 1800);
				};
				const copy = (kind, text) => copyText(text, () => {
					mark(kind);
					track("plugin_hub", { action: kind === "link" ? "share_link" : "share_text", scope });
				});
				const toggle = h("button", {
					className: "dph_btn" + (open ? " dph_btnPrimary" : ""),
					key: "toggle",
					type: "button",
					title: open ? t("share.closeHint") : t("share.toggle"),
					onClick: () => {
						const next = !open;
						setOpen(next);
						/* 打开与收起分开记：收起多半是误触或反悔，混进分享量会把分子放大。 */
						track("plugin_hub", { action: next ? "share_open" : "share_close", scope });
					},
					/* 展开后这个按钮自己变成「收起」—— 不再单列第四个「收起」按钮：
					   400px 浮窗里多一个按钮就多占一行，而这两个本来就是同一个开关。 */
				}, open ? t("share.collapse") : t("share.action"));
				if (!open) return h("span", { className: "dph_shareWrap", key: "share" }, [toggle]);
				return h("span", { className: "dph_shareWrap dph_shareWrapOpen", key: "share" }, [
					toggle,
					h("button", {
						className: "dph_btn dph_btnSm",
						key: "link",
						type: "button",
						title: t("share.linkHint"),
						onClick: () => copy("link", shareLinkOf(fullName)),
					}, done === "link" ? t("action.copied") : t("share.link")),
					h("button", {
						className: "dph_btn dph_btnSm",
						key: "text",
						type: "button",
						title: t("share.textHint"),
						onClick: () => copy("text", shareTextOf(item)),
					}, done === "text" ? t("action.copied") : t("share.text")),
					h("a", {
						className: "dph_btn dph_btnSm",
						key: "card",
						href: shareCardOf(fullName),
						target: "_blank",
						rel: "noopener noreferrer",
						title: t("share.cardHint"),
						onClick: () => track("plugin_hub", { action: "share_card", scope }),
					}, t("share.card")),
				]);
			}

			/**
			 * 一张插件卡。
			 *
			 * 两种版式，同一份数据：
			 *   · 窄卡（默认，浮窗 / 今日推荐 / 分类精选）：.dph_card，动作按钮都在标题行；
			 *   · 宽卡（wide=true，仅页签「严选推荐」列表）：.dph_cardLg = 左内容 + 右 84px
			 *     操作轨道。原来靠 .dph_spacer 把 ★ 与 GitHub 顶到卡片两端，正文只占一半、
			 *     右侧大片空白；挪成轨道后操作按列对齐、可纵向扫读（2026-10-19 A2）。
			 * ⚠️ wide 必须由调用方显式传参，不能靠样式选择器自动套用 —— 本组件有 4 处复用。
			 * scope 同理：只用于分享埋点的 via，缺省空串（老调用点不传也能跑）。
			 */
			function renderCard(item, copiedCmd, onCopied, compact, comparable, wide, scope) {
				const title = item.nameZh || item.name || item.fullName || "";
				const tags = tagsOf(item);
				/* 卖点行：站点 tagline 经严格过滤后的结果；没有就不占位（宁可不显示，也不放英文原文或垃圾串）。
				   2026-10-21：卖点与正文**开头相同**时只留正文。host 侧 slim() 在 tagline 缺失时
				   把 sell 回落到 descriptionZh，于是卡片上会出现两行几乎一样的字（真机截图里就是这样），
				   层级反而被抹平 —— 判据取前 16 字，足够区分「同一句话」与「同一主题的两种说法」。 */
				const sellEcho = item.sell && item.descZh
					&& (item.descZh.startsWith(item.sell.slice(0, 16)) || item.sell.startsWith(item.descZh));
				const sellRow = item.sell && !sellEcho
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
				/* 已经装过就直说 —— 实测有用户对着一个早就装好的插件反复点「安装」，
				   然后判定"安装不成功"（他无从知道那东西其实已经在跑了）。
				   2026-10-21 版式：已安装并入标签行（实底浅蓝）。它和分类标签同属
				   「这条现在什么状态」，单开一行既多 20px、又让人以为是另一种层级。 */
				const installedChip = item.installed
					? h("span", { className: "dph_tag dph_tagSolid", key: "installed" }, format(t("card.installed"), { v: item.installed }))
					: null;
				const tagRow = (tags.length || installedChip)
					? h("div", { className: "dph_tags", key: "tags" }, installedChip ? tags.concat([installedChip]) : tags)
					: null;
				const onCopy = () => copyText(item.cmd, () => {
					onCopied(item.cmd);
					// 与站点 InstallBlock 同口径：value 传整条命令
					track("copy_install", { cmd: item.cmd, pkg: item.pkg || "" });
				});
				/* comparable = 这张卡片支持"选择类动作"（对比 + 收藏）。两处都放最左：
				   多选/收藏的第一列位置固定，扫一眼就知道能选；第二列才是插件名。
				   宽屏时这两个按钮与 GitHub 一起挪到右侧操作轨道，样式与行为不变。 */
				const cmpBtn = comparable ? h("button", {
					className: "dph_btn" + (inCompare(item) ? " dph_btnPrimary" : ""),
					key: "cmp",
					type: "button",
					title: format(t("compare.toggle"), { max: COMPARE_MAX }),
					onClick: () => {
						/* 先读旧状态再改 —— toggleCompare 是同步写 hub，改完再判断就反了 */
						const was = inCompare(item);
						toggleCompare(item);
						track("plugin_hub", { action: was ? "compare_off" : "compare_on" });
					},
				}, inCompare(item) ? t("compare.picked") : t("compare.pick")) : null;
				const favBtn = comparable ? h("button", {
					className: "dph_btn" + (inFav(item) ? " dph_btnPrimary" : ""),
					key: "fav",
					type: "button",
					title: t("fav.toggle"),
					onClick: () => {
						const was = inFav(item);
						toggleFav(item);
						track("plugin_hub", { action: was ? "fav_off" : "fav_on" });
					},
				}, inFav(item) ? t("fav.added") : t("fav.add")) : null;
				const linkBtn = item.url
					? h("a", { className: "dph_btn", key: "link", href: item.url, target: "_blank", rel: "noopener noreferrer" }, "GitHub")
					: null;

				if (wide) {
					/* 命令条通栏、复制按钮内嵌右端 —— 短命令不再拉出一条空白。
					   分享与复制命令同处一条：都是「把这条带走」，分开摆要来回找。 */
					const share = h(ShareUnit, { item: item, scope: scope, key: "share" });
					const bar = item.cmd
						? h("div", { className: "dph_cmdbar", key: "cmd" }, [
								h("code", { className: "dph_cmdbarCode", key: "code" }, item.cmd),
								h("button", { className: "dph_btn dph_btnSm", key: "copy", type: "button", onClick: onCopy },
									copiedCmd === item.cmd ? t("action.copied") : t("action.copy")),
								share,
							])
						: h("div", { className: "dph_cmdMissing", key: "cmd" }, [
								h("span", { key: "text" }, t("cmd.missing")),
								/* 命令缺失不等于不能分享：这条仍可发给同事，让对方自己判断 */
								share,
							]);
					return h("div", { className: "dph_cardLg" + (comparable && inCompare(item) ? " dph_cardOn" : "") + (comparable && inFav(item) ? " dph_cardFav" : ""), key: item.fullName || title }, [
						h("div", { className: "dph_cardLgMain", key: "main" }, [
							h("div", { className: "dph_cardTop", key: "top" }, [
								h("span", { className: "dph_name", key: "name" }, title),
								item.owner ? h("span", { className: "dph_owner", key: "owner" }, "@" + item.owner) : null,
								h("span", { className: "dph_stars", key: "stars" }, format(t("badge.stars"), { n: item.stars })),
								item.src === "repo" ? h("span", { className: "dph_tag", key: "src" }, t("label.repoSource")) : null,
							]),
						tagRow,
							sellRow,
							descRow,
							h(InstallRow, { item: item, key: "install" }),
							bar,
						]),
						h("div", { className: "dph_opRail", key: "ops" }, [cmpBtn, favBtn, linkBtn]),
					]);
				}

				/* 窄卡同理：分享紧挨复制按钮（.dph_cmdRow 本来就会换行，展开后自动落到第二行） */
				const shareUnit = h(ShareUnit, { item: item, scope: scope, key: "share" });
				const cmdRow = item.cmd
					? h("div", { className: "dph_cmdWrap", key: "cmd" }, [
							h("div", { className: "dph_cmdRow", key: "row" }, [
								// 未发布到 npm 时标明来源 —— 站点详情页也是这么标注的，两处用词保持一致
								item.src === "repo"
									? h("span", { className: "dph_tag", key: "src" }, t("label.repoSource"))
									: null,
								h("code", { className: "dph_cmd", key: "code" }, item.cmd),
								h("button", { className: "dph_btn", key: "copy", type: "button", onClick: onCopy },
									copiedCmd === item.cmd ? t("action.copied") : t("action.copy")),
								shareUnit,
							]),
							item.src === "repo" ? h("div", { className: "dph_instHint", key: "hint" }, t("hint.repoSource")) : null,
						])
					: h("div", { className: "dph_cmdMissing", key: "cmd" }, [
							h("span", { key: "text" }, t("cmd.missing")),
							shareUnit,
						]);

				return h("div", { className: "dph_card" + (compact ? " dph_cardSm" : "") + (comparable && inCompare(item) ? " dph_cardOn" : "") + (comparable && inFav(item) ? " dph_cardFav" : ""), key: item.fullName || title }, [
					h("div", { className: "dph_cardTop", key: "top" }, [
						cmpBtn,
						favBtn,
						h("span", { className: "dph_name", key: "name" }, title),
						item.owner ? h("span", { className: "dph_owner", key: "owner" }, "@" + item.owner) : null,
						h("span", { className: "dph_spacer", key: "gap" }),
						h("span", { className: "dph_stars", key: "stars" }, format(t("badge.stars"), { n: item.stars })),
						linkBtn,
					]),
					tagRow,
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
					renderCard(picked.item, copiedCmd, onCopied, true, false, false, "daily"),
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
			 * 挂载时向宿主要 startedAt / bootId（/api/dpharness/meta）：bootId 变了（老宿主
			 * 只给 startedAt，则看它是否比 pending.at 新）就说明重启已经发生过 —— 这时该说
			 * 「已生效」而不是继续催重启。取不到就按「还没重启」处理：宁可多提醒一次，
			 * 也不能把提醒悄悄吞掉。
			 */
			function RestartBanner(props) {
				const pending = useHub().restartPending;
				const scope = props && props.scope ? props.scope : "panel";
				const [armed, setArmed] = react.useState(false);
				const [restarting, setRestarting] = react.useState(false);
				const [failed, setFailed] = react.useState(false);
				const [effective, setEffective] = react.useState(false);
				const [unknown, setUnknown] = react.useState(false);
				react.useEffect(() => {
					if (!pending) return undefined;
					let alive = true;
					let timer = 0;
					let asks = 0;
					let misses = 0;
					/* 只问一次是不够的：desktop 的「重启」换的是**宿主进程**，页面往往只是重连
					   而不重新挂载 —— 那一次判定会被永久跳过，横幅就永远停在「待重启」
					   （2026-10-17 用户实测：确实重启过，提示照旧）。所以按退避重试。 */
					const RETRY_MS = [0, 8000, 20000, 40000];
					const MAX_ASKS = 10;
					/* 先按「需要重启」算：新的待重启（又装了一个）不能沿用上一次的「已生效」 */
					setEffective(false);
					setUnknown(false);
					const ask = async () => {
						const result = await getJson("/api/dpharness/meta");
						if (!alive) return;
						/* ⚠️ getJson 返回的是 { status, data }，不是裸 body。这里曾经直接读
						   `body.startedAt`（永远 undefined），「已生效」分支因此从未生效过。 */
						const body = result && result.data;
						if (!body || typeof body.startedAt !== "number") {
							misses += 1;
							/* 连续取不到就别再假装「需要重启」—— 三次之后改说「确认不了」，
							   否则用户会以为自己没重启成功，反复重启。 */
							if (misses >= 3) setUnknown(true);
						} else {
							misses = 0;
							setUnknown(false);
							/* bootId 优先：它每次进程启动都变，不受时钟与「又装一个把 at 刷新」
							   的影响；任一端缺失才回退到时间戳比较。 */
							const restarted = pending.boot && typeof body.bootId === "string" && body.bootId
								? body.bootId !== pending.boot
								: body.startedAt > pending.at;
							if (restarted) {
								setEffective(true);
								return;
							}
						}
						asks += 1;
						if (asks < MAX_ASKS) {
							const delay = asks < RETRY_MS.length ? RETRY_MS[asks] : 30000;
							timer = setTimeout(ask, delay);
						}
					};
					ask();
					return () => { alive = false; if (timer) clearTimeout(timer); };
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
						unknown ? h("span", { className: "dph_setHint", key: "unknown" }, t("install.unknownState")) : null,
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
			/* ---- 使用频次与保留价值（宿主下发 tier + usage；这里只做展示与筛选） ---- */

			/** tier → 本地化标签（未知 tier 返回空串，不显示、不猜）。 */
			function tierLabel(tier) {
				const keys = { core: "usage.core", common: "usage.common", occasional: "usage.occasional", silent: "usage.silent", disabled: "usage.disabled", unmeasurable: "usage.unmeasurable", unknown: "usage.unknown" };
				return keys[tier] ? t(keys[tier]) : "";
			}

			/** 上次使用时间的人话（今天 / 昨天 / N 天前）。 */
			function usageDaysText(ms) {
				const at = Number(ms) || 0;
				if (!at) return "";
				const days = Math.floor((Date.now() - at) / 86400000);
				if (days <= 0) return t("usage.today");
				if (days === 1) return t("usage.yesterday");
				return format(t("usage.daysAgo"), { d: days });
			}

			/** 行内副标题里追加的使用情况（没有可说的就不加，保持安静）。 */
			function usageSubLines(item) {
				const tier = item && item.tier;
				const u = item && item.usage;
				if (tier === "unknown") return [t("usage.unknownNote")];
				if (tier === "unmeasurable") return [t("usage.unmeasurableNote")];
				if (u && u.measurable) {
					return u.calls > 0
						? [format(t("usage.stats"), { n: u.calls, d: usageDaysText(u.lastUsedMs) })]
						: [t("usage.silentNote")];
				}
				return [];
			}

			/** 汇总行：「近 30 天：核心 4 · 常用 6 …」（宿主给了窗口天数就用它）。 */
			function usageSummaryText(rows, meta) {
				const count = { core: 0, common: 0, occasional: 0, silent: 0, unmeasurable: 0 };
				(Array.isArray(rows) ? rows : []).forEach((item) => {
					const tier = item && item.tier;
					if (tier && count[tier] !== undefined) count[tier] += 1;
				});
				const days = meta && meta.windowDays ? meta.windowDays : 30;
				return format(t("usage.summary"), { d: days, a: count.core, b: count.common, c: count.occasional, e: count.silent, f: count.unmeasurable });
			}

			/** 排序与筛选（纯函数）：默认序 = 宿主顺序；usage = 按近 30 天调用数降序，未度量排后。 */
			function applyUsageView(rows, sortMode, onlySuggest) {
				let list = Array.isArray(rows) ? rows.slice() : [];
				if (onlySuggest) {
					list = list.filter((item) => {
						const tier = item && item.tier;
						return (tier === "silent" || tier === "disabled") && !isKept(item && item.name);
					});
				}
				if (sortMode === "usage") {
					list.sort((a, b) => {
						const ca = a && a.usage && typeof a.usage.calls === "number" ? a.usage.calls : -1;
						const cb = b && b.usage && typeof b.usage.calls === "number" ? b.usage.calls : -1;
						if (cb !== ca) return cb - ca;
						return String((a && a.name) || "").localeCompare(String((b && b.name) || ""));
					});
				}
				return list;
			}

			function updateRow(item, key, prefix, copied, mark, removable) {
				const nameZh = typeof item.nameZh === "string" ? item.nameZh.trim() : "";
				const note = typeof item.note === "string" ? item.note.trim() : "";
				const untranslated = !nameZh || (note !== "" && !/[\u4e00-\u9fff]/.test(note));
				/* 这一版被 dsh 的兼容性闸门拒过？只认**真实发生过**的拒绝，不做预判 */
				const blocked = item.outdated === true && updates.blocked.includes(String(item.name) + "@" + String(item.latest || ""));
				/* 清单里写死版本（0.5.27 这种）—— plugin add 挪不动它，直接说清，免得用户反复点 */
				const pinned = item.kind === "pinned";
				/* 使用频次与保留（tier 由宿主下发；kept 只对本机已装行生效） */
				const tier = typeof item.tier === "string" ? item.tier : "";
				const kept = removable ? isKept(item.name) : false;
				const sub = [];
				if (note) sub.push(note);
				/* 有中文名时，包名挪到第二行（用户要靠它去搜/核对）；没有中文名时它已在第一行 */
				if (nameZh) sub.push(String(item.name));
				if (pinned) sub.push(format(t("updates.pinnedNote"), { v: String(item.current || "") }));
				usageSubLines(item).forEach((line) => sub.push(line));
				return h("div", { className: "dph_updItem" + (item.outdated === true ? " dph_updOn" : ""), key: key }, [
					h("div", { className: "dph_upd", key: "row" }, [
						h("span", { className: "dph_updName", key: "n" }, (prefix ? prefix + " · " : "") + (nameZh || String(item.name))),
						untranslated ? h("span", { className: "dph_tag", key: "raw" }, t("label.untranslated")) : null,
						blocked ? h("span", { className: "dph_tag", key: "blocked" }, t("updates.blocked")) : null,
						pinned ? h("span", { className: "dph_tag", key: "pinned" }, t("updates.pinned")) : null,
						tier ? h("span", { className: "dph_tag", key: "usage" }, tierLabel(tier)) : null,
						h("span", { className: "dph_updVer", key: "v" }, "v" + String(item.current || "?") + (item.outdated === true ? " → v" + String(item.latest || "") : "")),
						h("span", { className: "dph_spacer", key: "gap" }),
						updateVerdict(item, key, copied, mark),
						/* 「保留」标注：人工高于机器 —— 标了就不再进清理建议；再点一次取消 */
						removable ? h("button", {
							className: "dph_btn",
							key: "keep",
							type: "button",
							title: t("usage.keepHint"),
							onClick: () => {
								const on = !kept;
								toggleKeep(item.name);
								track("plugin_hub", { action: "keep_toggle", on: on, scope: "updates" });
							},
						}, kept ? t("usage.kept") : t("usage.keep")) : null,
						/* 启用/禁用：可逆的「观察」动作（宿主提供启停能力时才有这一项） */
						removable && typeof item.enabled === "boolean" ? h(ToggleButton, { key: "toggle", item: item }) : null,
						/* 卸载入口：与"该不该升"并排。破坏性操作，自己带两步确认；
						   本插件自己那一行不给（卸自己等于把管理界面卸掉）。 */
						removable ? h(RemoveButton, { key: "remove", item: { pkg: String(item.name || ""), name: item.nameZh || String(item.name || "") } }) : null,
					]),
					sub.length ? h("div", { className: "dph_updSub", key: "sub" }, sub.join(" · ")) : null,
				]);
			}

			/**
			 * 「收藏待装」—— 先攒着，之后再一起装（本机偏好，跨会话）。
			 *
			 * 为什么放在「我的插件」而不是再开一个页签：① 浮窗只有 400px，第 6 个标签会把
			 * 一排标签挤爆；② 语义也对 —— 这一屏本来就是"我这边的东西"（装了的 + 攒着的）。
			 * 批量装复用「一键安装整套」那台机器（串行/进度/可中止/同一条两步确认），
			 * 只是数据源从"一套方案"换成"我的收藏"。
			 */
			function FavSection(props) {
				const state = useHub();
				const list = state.fav || [];
				const [asked, setAsked] = react.useState(false);
				if (list.length === 0) return null;
				const installed = props.installedNames || new Set();
				/* 能批量装的 = 有 npm 包名（pkg）且本机还没装 —— 没有 pkg 的走逐条复制命令那条路 */
				const pending = list.filter((item) => item.pkg && !installed.has(String(item.pkg)));
				return h("div", { className: "dph_setGroup", key: "fav" }, [
					h("div", { className: "dph_setRow", key: "head" }, [
						h("span", { className: "dph_setCol", key: "col" }, [
							h("span", { className: "dph_setLabel", key: "l" }, format(t("fav.count"), { n: list.length })),
							h("span", { className: "dph_setHint", key: "h" }, t("fav.hint")),
						]),
					]),
					...list.map((item) => h("div", { className: "dph_updSub", key: favKey(item) }, [
						h("span", { key: "n" }, item.nameZh || item.name || item.fullName || ""),
						item.cmd
							? h("button", {
									className: "dph_btn",
									key: "copy",
									type: "button",
									title: item.cmd,
									onClick: () => copyText(item.cmd, () => {
										props.markCopied(item.cmd);
										track("copy_install", { cmd: item.cmd, pkg: item.pkg || "" });
										track("plugin_hub", { action: "fav_copy" });
									}),
								}, props.copiedCmd === item.cmd ? t("action.copied") : t("action.copy"))
							: null,
						h("button", {
							className: "dph_btn",
							key: "rm",
							type: "button",
							onClick: () => {
								toggleFav(item);
								track("plugin_hub", { action: "fav_off", scope: "list" });
							},
						}, t("fav.remove")),
					])),
					pending.length >= 2
						? h("span", { className: "dph_logCmd", key: "installAll" }, [
								asked ? h("span", { className: "dph_setHint", key: "warn" }, format(t("fav.installConfirm"), { n: pending.length })) : null,
								h("button", {
									className: "dph_btn" + (asked ? " dph_btnPrimary" : ""),
									key: "go",
									type: "button",
									disabled: Boolean(state.batch && state.batch.active),
									onClick: () => {
										if (!asked) {
											setAsked(true);
											track("plugin_hub", { action: "fav_install_ask", n: pending.length });
											return;
										}
										setAsked(false);
										/* 复用「一键安装整套」那台机器：slug 用内部保留值，界面不会误认成套装的进度 */
										runSetInstall({ slug: "__fav__", name: t("fav.title"), items: pending }, t);
									},
								}, format(t("fav.installAll"), { n: pending.length })),
							])
						: null,
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
			 * 启用 / 禁用 —— 「先停用观察」的出口（v0.6.0）。
			 *
			 * 与卸载的分工：卸载是破坏性的（改依赖清单、要重启）；禁用是**可逆的**
			 * （改本机 profile patch、即时应用、随时恢复）—— 对"拿不准要不要留"的插件，
			 * 先禁用是唯一不后悔的动作。两步确认照旧；宿主不提供启停能力时不出这个按钮。
			 */
			function ToggleButton(props) {
				const item = props.item;
				const [confirming, setConfirming] = react.useState(false);
				const [busy, setBusy] = react.useState(false);
				const [done, setDone] = react.useState("");
				const [failed, setFailed] = react.useState("");
				/* enabled=false 的行 → 目标是「启用」；其余（含 true）→ 「禁用」 */
				const want = item.enabled !== true;
				if (busy) return h("span", { className: "dph_instMsg", key: "tg" }, t("usage.toggling"));
				if (done) return h("span", { className: "dph_instMsg dph_instOk", key: "tg" }, done);
				if (failed) return h("span", { className: "dph_instMsg dph_instBad", key: "tg" }, failed);
				if (confirming) {
					return h("span", { className: "dph_logCmd", key: "tg" }, [
						h("button", {
							className: "dph_btn",
							key: "go",
							type: "button",
							onClick: async () => {
								setConfirming(false);
								setBusy(true);
								track("plugin_hub", { action: "toggle", on: want, pkg: String(item.name || "") });
								const result = await postJson("/api/dpharness/toggle", { name: String(item.name || ""), enabled: want });
								setBusy(false);
								const body = (result && result.data) || {};
								if (result && result.status === 200 && body.ok === true && body.enabled === want) {
									setDone(want ? t("usage.enabledDone") : t("usage.disabledDone"));
									loadUpdates(true);
									return;
								}
								if (body.code === "unsupported") { setFailed(t("usage.toggleUnsupported")); return; }
								if (body.code === "self") { setFailed(t("usage.toggleSelf")); return; }
								if (body.code === "management-required") { setFailed(t("usage.toggleReadonly")); return; }
								if (body.code === "unaddressable" || body.code === "not-found" || body.code === "ambiguous") { setFailed(t("usage.toggleUnaddressable")); return; }
								if (body.overridden === true) { setFailed(t("usage.toggleOverridden")); loadUpdates(true); return; }
								setFailed(t("usage.toggleFailed") + (body.error ? "：" + String(body.error) : ""));
							},
						}, want ? t("usage.enableConfirm") : t("usage.disableConfirm")),
						h("button", {
							className: "dph_btn",
							key: "cancel",
							type: "button",
							onClick: () => { setConfirming(false); track("plugin_hub", { action: "toggle_cancel" }); },
						}, t("install.cancel")),
					]);
				}
				return h("button", {
					className: "dph_btn",
					key: "tg",
					type: "button",
					title: t("usage.toggleHint"),
					onClick: () => { setConfirming(true); track("plugin_hub", { action: "toggle_ask", on: want }); },
				}, want ? t("usage.enable") : t("usage.disable"));
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
				/* 使用视图：排序切换与「只看建议清理」筛选（本会话内有效，不持久） */
				const [sortMode, setSortMode] = react.useState("default");
				const [onlySuggest, setOnlySuggest] = react.useState(false);
				/* 批量禁用：本地状态驱动（不挤占安装批处理那台机器）；stop 用 ref 传递中止信号。
				   ⚠️ 变量名带 disable —— 上面的 `batchAsk` 是「批量升级」的，同名会直接语法错 */
				const [batchDisableAsk, setBatchDisableAsk] = react.useState(false);
				const [batchRun, setBatchRun] = react.useState(null);
				const batchStop = react.useRef(null);
				const data = store.data;
				/* 收藏区要知道哪些已经装了（用更新检查这份清单，不再多打一次请求） */
				const installedNames = new Set(
					(Array.isArray(data && data.plugins) ? data.plugins : [])
						.concat(data && data.self ? [data.self] : [])
						.map((item) => String((item && item.name) || ""))
						.filter(Boolean),
				);
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
				const visibleRows = applyUsageView(rows, sortMode, onlySuggest);
				/* 批量禁用只处理「启用中」的候选；已停用的走行内卸载 */
				const batchCandidates = visibleRows.filter((row) => row && row.enabled === true);
				async function runBatchDisable() {
					const queue = batchCandidates.slice();
					const state = { done: 0, failed: 0, stop: false };
					batchStop.current = state;
					setBatchRun({ done: 0, failed: 0, total: queue.length, current: "", finished: false });
					for (const row of queue) {
						if (state.stop) break;
						const result = await postJson("/api/dpharness/toggle", { name: String(row.name || ""), enabled: false });
						const body = (result && result.data) || {};
						if (result && result.status === 200 && body.ok === true && body.enabled === false) state.done += 1;
						else state.failed += 1;
						setBatchRun({ done: state.done, failed: state.failed, total: queue.length, current: String(row.name || ""), finished: false });
					}
					batchStop.current = null;
					setBatchRun({ done: state.done, failed: state.failed, total: queue.length, current: "", finished: true });
					loadUpdates(true);
					track("plugin_hub", { action: "batch_disable_done", done: state.done, failed: state.failed });
				}
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
					h(FavSection, { key: "fav", copiedCmd: copied, markCopied: mark, installedNames: installedNames }),
					updateRow(self, "self", t("updates.self"), copied, mark),
					/* 本插件自己的更新日志就在它这一行下面 —— 不必再为它跑一趟设置页 */
					changelogBlock(cl.state.data ? cl.state.data.entries : null, "upd:"),
					h("div", { className: "dph_setTitle", key: "installed" }, t("updates.installed")),
					h("div", { className: "dph_logCmd", key: "usagebar" }, [
						h("span", { className: "dph_setHint", key: "sum" }, usageSummaryText(rows, data.usageMeta)),
						h("span", { className: "dph_spacer", key: "gap" }),
						h("button", {
							className: "dph_btn",
							key: "sort",
							type: "button",
							onClick: () => {
								const next = sortMode === "usage" ? "default" : "usage";
								setSortMode(next);
								track("plugin_hub", { action: "usage_sort", mode: next, scope: scope });
							},
						}, sortMode === "usage" ? t("usage.sortUsageOn") : t("usage.sortUsage")),
						h("button", {
							className: "dph_btn" + (onlySuggest ? " dph_btnPrimary" : ""),
							key: "filter",
							type: "button",
							onClick: () => {
								const next = !onlySuggest;
								setOnlySuggest(next);
								track("plugin_hub", { action: "usage_filter", on: next, scope: scope });
							},
						}, t("usage.onlySuggest")),
					]),
					batchRun
						? h("div", { className: "dph_logCmd", key: "batchrun" }, [
								h("span", { className: "dph_instMsg", key: "msg" }, batchRun.finished
									? format(t("usage.batchDone"), { done: batchRun.done, failed: batchRun.failed })
									: format(t("usage.batchProgress"), { done: batchRun.done, total: batchRun.total, name: batchRun.current })),
								!batchRun.finished
									? h("button", {
											className: "dph_btn",
											key: "stop",
											type: "button",
											onClick: () => { if (batchStop.current) batchStop.current.stop = true; track("plugin_hub", { action: "batch_disable_stop" }); },
										}, t("updates.stop"))
									: null,
							])
						: (onlySuggest && batchCandidates.length > 0
							? h("div", { className: "dph_logCmd", key: "batchask" }, [
									batchDisableAsk ? h("span", { className: "dph_setHint", key: "warn" }, format(t("usage.batchConfirm"), { n: batchCandidates.length })) : null,
									h("button", {
										className: "dph_btn" + (batchDisableAsk ? " dph_btnPrimary" : ""),
										key: "go",
										type: "button",
										onClick: () => {
											if (!batchDisableAsk) {
												setBatchDisableAsk(true);
												track("plugin_hub", { action: "batch_disable_ask", n: batchCandidates.length });
												return;
											}
											setBatchDisableAsk(false);
											runBatchDisable();
										},
									}, format(t("usage.batchDisable"), { n: batchCandidates.length })),
									h("span", { className: "dph_setHint", key: "hint" }, t("usage.batchHint")),
								])
							: null),
					visibleRows.length === 0
						? h(Notice, { key: "none", text: rows.length === 0 ? t("updates.none") : t("usage.noneSuggest") })
						: h("div", { className: "dph_updList", key: "list" }, visibleRows.map((item) => updateRow(item, item.name, "", copied, mark, true))),
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
									...((Array.isArray(data.locals) ? data.locals : []).map((row) => {
										const bits = [];
										if (row && row.tier) bits.push(tierLabel(row.tier));
										if (row && row.usage && row.usage.measurable && row.usage.calls > 0) bits.push(format(t("usage.calls30d"), { n: row.usage.calls }));
										const suffix = bits.length ? "  ·  " + bits.join(" · ") : "";
										return h("div", { className: "dph_updSub", key: String(row.name) },
											String(row.name) + "  →  " + String(row.spec || "").replace(/^(link|file):/, "") + suffix,
										);
									})),
								]),
							])
						: null,
					/* 福利专区：一句话说清是什么 + 外链。**刻意不在此处复刻站点的福利清单** ——
					   站点那份是人工每周维护的（lib/benefits.ts），公开接口只有爬虫候选池
					   （未审核），拿它当内容会把没核过的东西推给用户。所以这里只做入口。 */
					h("div", { className: "dph_setGroup", key: "benefits" }, [
						h("div", { className: "dph_setRow", key: "row" }, [
							h("span", { className: "dph_setCol", key: "col" }, [
								h("span", { className: "dph_setLabel", key: "l" }, t("benefits.title")),
								h("span", { className: "dph_setHint", key: "h" }, t("benefits.body")),
							]),
							h("a", {
								className: "dph_btn",
								key: "go",
								href: SITE + "/benefits",
								target: "_blank",
								rel: "noopener noreferrer",
								onClick: () => track("plugin_hub", { action: "site_click", scope: "benefits" }),
							}, t("action.openSite")),
						]),
					]),
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
					/* 社群 + 订阅：放在开关之后、更新日志之前 —— 它属于「这个插件还能给你什么」，
					   不是「版本改了什么」。inSet 去掉外框，只留一条分隔线，避免卡中卡。 */
					h(JoinCard, { key: "join", inSet: true }),
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

			/**
			 * 社群 + 订阅入口（2026-10-20）。
			 *
			 * 三处共用：会话页签（宽）/ 右下浮窗（compact）/ 设置 → 插件（宽、无外框）。
			 *
			 * 两个必须守住的点：
			 *  1) **订阅必须经本机 host 转发**（`/api/dpharness/subscribe`）。站点
			 *     `/api/subscribe` 不带 CORS 头，浏览器跨源直发不成立 —— 与 track()
			 *     下面那条注释是同一个实测结论。邮箱只发给站点、只用于周报，卡内写明。
			 *  2) 二维码默认收起、点开才显示，尺寸不小于 84px（站点实测：64px 时
			 *     jsQR 已解不出）。「入口在但看不见」和「码扫不出来」都是把入口做成摆设。
			 */
			function JoinCard(props) {
				const compact = !!(props && props.compact);
				const inSet = !!(props && props.inSet);
				const [open, setOpen] = react.useState(false);
				const [email, setEmail] = react.useState("");
				const [sub, setSub] = react.useState(null);
				const busy = !!sub && sub.phase === "sending";

				function submit(event) {
					if (event && event.preventDefault) event.preventDefault();
					if (busy) return;
					const value = String(email || "").trim();
					if (!value) {
						setSub({ phase: "bad", text: t("join.needEmail") });
						return;
					}
					setSub({ phase: "sending" });
					track("plugin_hub", { action: "subscribe_submit" });
					fetch("/api/dpharness/subscribe", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ email: value, source: "dsh-plugin" }),
					})
						.then((response) =>
							response.json().catch(() => ({})).then((data) => ({ response, data })),
						)
						.then((pair) => {
							const response = pair.response;
							const data = pair.data || {};
							/* content-type 判断很关键：宿主没注册这个前缀时，SPA 兜底会回一份
							   HTML（200），只判 response.ok 会被当成成功，界面显示空白或假成功。 */
							const jsonType = String(response.headers.get("content-type") || "").indexOf("application/json") >= 0;
							const detail = typeof data.error === "string" ? data.error : "";
							if (!response.ok || !jsonType || data.ok === false) {
								let text;
								if (response.status === 404 || !jsonType) {
									/* 路由不在（或拿回网页）：只有完全重启 dsh 才会重新注册 —— 路由只在进程启动时挂一次 */
									text = format(t("join.failRoute"), { code: String(response.status) });
								} else if (response.status >= 500) {
									text = detail || format(t("join.failUpstream"), { code: String(response.status) });
								} else {
									/* 4xx：服务端给了中文人话（邮箱格式 / 频率限制）就原样透出 */
									text = detail || format(t("join.failHttp"), { code: String(response.status) });
								}
								setSub({ phase: "bad", text });
								return;
							}
							setEmail("");
							setSub({ phase: "ok", text: data.message || t("join.subscribeOk") });
							track("plugin_hub", { action: "subscribe_ok" });
						})
						.catch(() => setSub({ phase: "bad", text: t("join.failNetwork") }));
				}

				const qrRow = open
					? h("div", { className: "dph_qrRow", key: "qr" }, COMMUNITY_GROUPS.map((group) =>
						h("div", { className: "dph_qrItem", key: group.key }, [
							h("a", {
								key: "img",
								href: group.url,
								target: "_blank",
								rel: "noopener noreferrer",
								onClick: () => track("plugin_hub", { action: "community_join", scope: group.key }),
							}, h("img", {
								className: "dph_qrImg",
								src: group.qr,
								width: 84,
								height: 84,
								alt: group.name + " · " + t(group.scanKey),
							})),
							h("a", {
								className: "dph_qrLink",
								key: "link",
								href: group.url,
								target: "_blank",
								rel: "noopener noreferrer",
								onClick: () => track("plugin_hub", { action: "community_join", scope: group.key }),
							}, format(t("join.joinGroup"), { label: t(group.labelKey) })),
							h("span", { className: "dph_qrHint", key: "hint" }, t(group.scanKey)),
						]),
					))
					: null;

				return h("div", {
					className: "dph_join" + (compact ? " dph_joinCompact" : "") + (inSet ? " dph_joinInSet" : ""),
				}, [
					h("div", { className: "dph_joinHead", key: "gh" }, [
						h("span", { className: "dph_joinTitle", key: "title" }, "💬 " + t("join.title")),
						h("span", { className: "dph_joinSub", key: "sub" }, t("join.sub")),
						h("span", { className: "dph_spacer", key: "gap" }),
						h("button", {
							className: "dph_btn dph_btnSm",
							key: "toggle",
							type: "button",
							"aria-expanded": open ? "true" : "false",
							onClick: () => {
								if (!open) track("plugin_hub", { action: "community_open" });
								setOpen(!open);
							},
						}, open ? t("join.hideQr") : t("join.showQr")),
					]),
					qrRow,
					h("div", { className: "dph_joinHead", key: "nh" }, [
						h("span", { className: "dph_joinTitle", key: "title" }, "✉️ " + t("join.newsletter")),
						h("span", { className: "dph_joinSub", key: "sub" }, t("join.newsletterSub")),
					]),
					h("form", { className: "dph_subForm", key: "form", onSubmit: submit }, [
						h("input", {
							className: "dph_subInput",
							key: "input",
							type: "email",
							value: email,
							placeholder: t("join.email"),
							autoComplete: "email",
							onChange: (event) => setEmail(event.target.value),
						}),
						h("button", {
							className: "dph_btn dph_btnPrimary",
							key: "go",
							type: "submit",
							disabled: busy,
						}, busy ? t("join.sending") : t("join.subscribe")),
					]),
					sub
						? h("div", {
								className:
									"dph_joinMsg" +
									(sub.phase === "ok" ? " dph_joinOk" : sub.phase === "bad" ? " dph_joinBad" : ""),
								key: "msg",
								role: "status",
							}, sub.text)
						: null,
					h("div", { className: "dph_joinNote", key: "note" }, [
						t("join.note") + " ",
						h("a", {
							className: "dph_qrLink",
							key: "past",
							href: NEWSLETTER_URL,
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: () => track("plugin_hub", { action: "site_click", scope: "newsletter" }),
						}, t("join.past")),
					]),
				]);
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
			/**
			 * 侧栏版「今日推荐」——212px 宽。
			 *
			 * 与 dailyCard 同源（都走 pickDaily），只换版式：面板与「每日推荐」视图
			 * 继续用带卡片壳的 dailyCard，这里去掉那层壳、把理由与刷新说明收进卡内，
			 * 避免选取逻辑出现第二份实现。取数失败时同样要说清"暂不可用"，
			 * 不能静止消失 —— 它是侧栏里唯一"今天该装哪个"的答案。
			 */
			function railDailyCard(best, copiedCmd, onCopied, dateKey) {
				const picked = best.state.data ? pickDaily(best.state.data, dateKey) : null;
				if (!picked) {
					return h("div", { className: "dph_railCard dph_railCardAccent", key: "daily" }, [
						h("div", { className: "dph_bar", key: "head" }, [
							h("span", { className: "dph_dailyTag", key: "tag" }, t("daily.title")),
							h("span", { className: "dph_dailyDate", key: "date" }, dateKey),
						]),
						h("div", { className: "dph_instMsg", key: "msg" }, best.state.error ? t("daily.empty") : t("daily.loading")),
					]);
				}
				const item = picked.item;
				const title = item.nameZh || item.name || item.fullName || "";
				const where = [picked.cat, picked.sub].filter(Boolean).join(" › ");
				const meta = [format(t("badge.stars"), { n: item.stars }), where].filter(Boolean).join(" · ");
				const desc = item.descZh || item.sell || "";
				const verify = item.verify ? tagLabel("verify", item.verify) : "";
				return h("div", { className: "dph_railCard dph_railCardAccent", key: "daily" }, [
					h("div", { className: "dph_bar", key: "head" }, [
						h("span", { className: "dph_dailyTag", key: "tag" }, t("daily.title")),
						h("span", { className: "dph_dailyDate", key: "date" }, dateKey),
					]),
					h("div", { className: "dph_railName", key: "name" }, title),
					h("div", { className: "dph_railMeta", key: "meta" }, meta),
					verify ? h("div", { className: "dph_tags", key: "verify" }, h("span", { className: "dph_tag" + (item.verify === "pass" ? " dph_tagOk" : " dph_tagBad") }, verify)) : null,
					desc ? h("p", { className: "dph_railDesc", key: "desc" }, desc) : null,
					h(InstallRow, { item: item, key: "install" }),
					item.cmd
						? h("div", { className: "dph_cmdbar dph_cmdbarCol", key: "cmd" }, [
								h("code", { className: "dph_cmdbarCode", key: "code", title: item.cmd }, item.cmd),
								h("button", {
									className: "dph_btn dph_btnSm",
									key: "copy",
									type: "button",
									onClick: () => copyText(item.cmd, () => {
										onCopied(item.cmd);
										track("copy_install", { cmd: item.cmd, pkg: item.pkg || "" });
									}),
								}, copiedCmd === item.cmd ? t("action.copied") : t("action.copy")),
								/* 侧栏这条命令条是**自建**的（不走 renderCard），所以分享要单独接一次。
								   2026-10-21 首版漏了这一处：用户在真机截图里发现"今日推荐卡没有分享"。 */
								h(ShareUnit, { item: item, scope: "rail", key: "share" }),
							])
						: null,
					item.reason ? h("p", { className: "dph_railWhy", key: "why" }, t("daily.why") + "：" + item.reason) : null,
				]);
			}

			/**
			 * 入口 1：会话视图页签（完整页）。
			 *
			 * 2026-10-19 版式（A2）：页头 + 页签 / 左主列 / 右 212px 侧栏。
			 * 原来是一条 12px 等距的纵向流，今日推荐与列表卡同规格、理由行还漂在卡外，
			 * 用户的原话是「模块分布不清晰、右侧空白太多」。
			 * 现在：主列只做检索与列表（区标题 → 筛选 → 结果），侧栏放"今天装哪个"
			 * 与"各小类冠军"，横向空白由决策信息吸收。
			 * 视图切换从分段按钮改成下划线页签：它管的是整页内容，不该长得像一个
			 * 与正文平级的控件（浮窗仍用 .dph_seg，两处互不影响）。
			 */
			function CatalogView() {
				const cat = useCatalog(t);
				/* 必须订阅共享 store：页签底部的「显示右下角浮窗」开关读的是同一个
				   hidden 状态，而关闭动作也可能来自胶囊或面板 —— 不订阅就会出现
				   "在别处关了浮窗，这里却还勾着"的错位（实测踩到）。
				   每日推荐的显隐同样读这个 store（设置页改完这里要跟着变）。 */
				const state = useHub();
				const [mode, setMode] = react.useState("search");
				/* 周榜内部的两条线（top / installs）。默认 top：它与分类精选同属"全网热度"
				   口径，先给用户熟悉的那一半；装机榜是本站私有信号，解释成本更高。 */
				const [boardKind, setBoardKind] = react.useState("top");
				/* 对比表开没开 ── 每个面各自记（选择集在 hub 上共享，表格的展开状态是本面的） */
				const [comparing, setComparing] = react.useState(false);
				const dateKey = useDateKey();
				/* 侧栏也要放「今日推荐」与「各小类冠军」，两处都来自 /api/best：
				   daily 开着时必须取，关掉后即回到「只有切到榜单/每日视图才请求」。
				   不给侧栏新增任何请求 —— 全站只有这一个数据源。 */
				const best = useBest(t, mode === "best" || mode === "daily" || state.daily);
				const sets = useSets(t, mode === "sets");
				const board = useBoard(t, boardKind, mode === "board");
				const data = cat.state.data;
				const bestData = best.state.data;
				const setsData = sets.state.data;
				const boardData = board.state.data;
				const isBest = mode === "best";
				const isDaily = mode === "daily";
				const isUpdate = mode === "update";
				const isSets = mode === "sets";
				const isBoard = mode === "board";

				/* 页头副标题与区标题分工：页头说「这是什么」（固定口径），
				   区标题说「现在看到的是哪一段 + 多少条」。
				   两处都写"共 N 条"会让页面重复又啰嗦（原版就是这个毛病）。 */
				const headSub = isSets || isBest || isDaily || isUpdate || isBoard ? "" : t("view.sub");
				const sectionTitle = isUpdate
					? t("section.updates")
					: isSets
						? t("section.sets")
						: isBoard
							? t("board.tab")
							: isBest
								? t("section.best")
								: isDaily
									? t("section.daily")
									: t("section.browse");
				const sectionCount = isUpdate
					? ""
					: isSets
						? (setsData ? format(t("sets.count"), { n: setsData.total || 0 }) : "")
						: isBoard
							? (boardData
									? boardKind === "top"
										? boardData.periodNo
											? format(t("board.topSub"), { n: boardData.total || 0, p: boardData.periodNo })
											: format(t("board.topSubLive"), { n: boardData.total || 0 })
										: format(t("board.installsSub"), { n: boardData.total || 0 })
									: "")
							: isBest
								? (bestData ? format(t("best.month"), { m: bestData.month || "" }) : "")
								: isDaily
									? dateKey
									: countSub(data, t, cat.state.loading, "");

				const TABS = [
					{ value: "search", label: t("best.recommend") },
					{ value: "best", label: t("best.picks") },
					{ value: "board", label: t("board.tab") },
					{ value: "sets", label: t("sets.tab") },
					{ value: "daily", label: t("daily.tab") },
					{ value: "update", label: t("updates.tab") },
				];

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
						: isBoard
							? [
									/* 两条线用二级切换，不再拆两个顶级页签：顶级页签已经 6 个，
									   而且用户的心智是"看榜"，不是"看两个榜"。 */
									h("div", { className: "dph_bar", key: "bkind" }, seg([
										{ value: "top", label: t("board.top") },
										{ value: "installs", label: t("board.installs") },
									], boardKind, setBoardKind)),
									/* 口径必须常驻一行：两个榜的量级差几个数量级，不解释就会被互相对照 */
									h("p", { className: "dph_boardWhy", key: "why" },
										boardKind === "top"
											? (boardData && boardData.live ? t("board.topWhyLive") : t("board.topWhy"))
											: t("board.installsWhy")),
									board.state.error
										? h(Notice, {
												key: "boerror",
												kind: "bad",
												text: /404/.test(board.state.error) ? t("board.offline") : t("state.failed") + "：" + board.state.error,
											})
										: null,
									board.state.loading && !boardData ? h(Notice, { key: "boloading", text: t("board.loading") }) : null,
									!board.state.loading && boardData && (boardData.total || 0) === 0 ? h(Notice, { key: "boempty", text: t("board.empty") }) : null,
									h("div", { className: "dph_list", key: "bolist" }, renderBoard(boardData, boardKind, board.copiedCmd, board.markCopied, { wide: true })),
								]
						: isBest
							? [
									best.state.error ? h(Notice, { key: "berror", kind: "bad", text: t("state.failed") + "：" + best.state.error }) : null,
									best.state.loading && !bestData ? h(Notice, { key: "bloading", text: t("best.loading") }) : null,
									!best.state.loading && bestData && (bestData.total || 0) === 0 ? h(Notice, { key: "bempty", text: t("best.empty") }) : null,
									h("div", { className: "dph_list", key: "blist" }, renderBest(bestData, best.copiedCmd, best.markCopied)),
								]
							: [
									controls(cat),
									cat.state.error ? h(Notice, { key: "error", kind: "bad", text: t("state.failed") + "：" + cat.state.error }) : null,
									cat.state.loading && cat.plugins.length === 0 ? h(Notice, { key: "loading", text: t("state.loading") }) : null,
									!cat.state.loading && !cat.state.error && cat.plugins.length === 0 ? h(Notice, { key: "empty", text: t("state.empty") }) : null,
									h(CompareBar, { key: "cmpBar", open: comparing, onToggle: () => setComparing((value) => !value) }),
									comparing ? h(CompareTable, { key: "cmp", copiedCmd: cat.copiedCmd, markCopied: cat.markCopied }) : null,
									h("div", { className: "dph_list", key: "list" }, cat.plugins.map((item) => renderCard(item, cat.copiedCmd, cat.markCopied, false, true, true, "picks"))),
								];

				/* ── 侧栏：今日推荐（「每日推荐」视图里正文已经是这条，不重复）+ 各小类冠军 + 安装须知 ── */
				const showRailDaily = state.daily && !isDaily;
				const highlights = bestData ? pickHighlights(bestData, 3) : [];
				const subCount = bestData && Array.isArray(bestData.categories)
					? bestData.categories.reduce((total, entry) => total + (Array.isArray(entry.subs) ? entry.subs.length : 0), 0)
					: 0;
				const highlightCard = highlights.length
					? h("div", { className: "dph_railCard", key: "top3" }, [
							h("p", { className: "dph_railLabel", key: "label" }, t("rail.highlights")),
							...highlights.map((entry, index) => {
								const name = entry.item.nameZh || entry.item.name || entry.item.fullName || "";
								const weekly = Number(entry.item.weeklyDownloads);
								return h("div", { className: "dph_top3", key: entry.key }, [
									h("span", { className: "dph_top3Rank", key: "rank" }, String(index + 1)),
									h("span", { className: "dph_top3Name", key: "name", title: name }, name),
									h("span", { className: "dph_top3Num", key: "num", title: format(t("rail.week"), { n: Number.isFinite(weekly) ? weekly.toLocaleString() : "—" }) },
										Number.isFinite(weekly) && weekly > 0 ? weekly.toLocaleString() : "—"),
								]);
							}),
							h("div", { className: "dph_railDivider", key: "foot" }, [
								format(t("rail.highlightsHint"), { n: String(subCount), m: String(bestData.month || "") }),
								h("br", { key: "br" }),
								h("a", {
									className: "dph_railLink",
									key: "more",
									href: SITE + "/best",
									target: "_blank",
									rel: "noopener noreferrer",
									onClick: () => track("plugin_hub", { action: "site_click", scope: "rail_board" }),
								}, t("rail.viewBoard")),
							]),
						])
					: null;
				const installCard = h("div", { className: "dph_railCard", key: "install" }, [
					h("p", { className: "dph_railLabel", key: "label" }, t("rail.install")),
					h("p", { className: "dph_railDesc", key: "body" }, t("rail.installTip")),
					state.restartPending ? h("p", { className: "dph_railDesc dph_railWarn", key: "pending" }, t("rail.restartPending")) : null,
				]);

				return h("div", { className: "dph_work" }, [
					h("div", { className: "dph_workHead", key: "header" }, [
						h("h2", { className: "dph_title", key: "title" }, t("view.title")),
						headSub ? h("span", { className: "dph_sub", key: "sub" }, headSub) : null,
						h("span", { className: "dph_spacer", key: "gap" }),
						h("a", {
							className: "dph_btn",
							key: "site",
							/* 周榜按当前子榜给对应站点页：本站两个榜是**两个独立页面**，
							   点错了会看到另一套口径（/top 是下载量，/ranking/installs 是站内装机）。 */
							href: isBoard ? SITE + (boardKind === "top" ? "/top" : "/ranking/installs") : isSets ? SITE + "/sets" : isBest ? SITE + "/best" : SITE + "/plugins",
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: () => track("plugin_hub", { action: "site_click", scope: isBoard ? "board_" + boardKind : isDaily ? "daily" : isSets ? "sets" : isBest ? "best" : "tab" }),
						}, t("action.openSite")),
						h("button", { className: "dph_btn", key: "refresh", type: "button", onClick: isUpdate ? () => loadUpdates(true) : isBoard ? board.refresh : isSets ? sets.refresh : (isBest || isDaily) ? best.refresh : cat.refresh }, t("action.refresh")),
					]),
					/* 页签是页级导航：用下划线而不是分段按钮 —— 原来那枚 seg 与正文控件同规格，
					   读不出"它管着下面全部内容"（用户反馈"模块分布不清晰"的一部分）。 */
					h("div", { className: "dph_tabbar", key: "tabs" }, TABS.map((entry) =>
						h("button", {
							className: "dph_tab" + (mode === entry.value ? " dph_tabOn" : ""),
							key: entry.value,
							type: "button",
							"aria-current": mode === entry.value ? "page" : undefined,
							onClick: () => setMode(entry.value),
						}, entry.label))),
					h("div", { className: "dph_mainCol", key: "main" }, [
						h("div", { className: "dph_sectionHead", key: "sec" }, [
							h("h3", { className: "dph_sectionTitle", key: "t" }, sectionTitle),
							sectionCount ? h("span", { className: "dph_sectionCount", key: "c" }, sectionCount) : null,
						]),
						/* 待重启横幅挂在区标题之下、结果区之上：不跟着卡片滚走，切视图也在 */
						h(RestartBanner, { scope: "tab", key: "rbanner" }),
						/* 社群 + 订阅：与待重启横幅同一层（常驻、不随列表滚走）。展开二维码后
						   会把列表往下推约 120px —— 可接受，因为它是点击后的主动结果。 */
						h(JoinCard, { key: "join" }),
						...body,
						h("div", { className: "dph_footer", key: "hint" }, t("footer.hint")),
						h("div", { className: "dph_footer", key: "tel" }, h("div", { className: "dph_footToggles" }, [telemetryToggle(), floatToggle()])),
					]),
					h("div", { className: "dph_rail", key: "rail" }, [
						showRailDaily
							? h("div", { className: "dph_dailySlot", key: "dslot" }, railDailyCard(best, cat.copiedCmd, cat.markCopied, dateKey))
							: null,
						h("div", { className: "dph_railSlot", key: "rslot" }, [highlightCard, installCard].filter(Boolean)),
					]),
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
				/* 周榜子线（见 CatalogView 同名状态）：两处各记一份，与 comparing 同理 */
				const [boardKind, setBoardKind] = react.useState("top");
				/* 对比表开没开 —— 与页签各记一份（选择集共享，展开状态是本面的） */
				const [comparing, setComparing] = react.useState(false);
				const dateKey = useDateKey();
				/* 默认视图顶部也要有「今日推荐」，所以面板一展开就得取榜单数据；
				   关掉每日推荐开关后，回到「只有切到榜单/每日视图才请求」。
				   仍然挂在 state.open 上：收成胶囊时不发这个请求。 */
				const best = useBest(t, state.open && (mode === "best" || mode === "daily" || state.daily));
				const bestData = best.state.data;
				const sets = useSets(t, state.open && mode === "sets");
				const setsData = sets.state.data;
				const board = useBoard(t, boardKind, state.open && mode === "board");
				const boardData = board.state.data;

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
							: mode === "board"
							? (boardData
									? boardKind === "top"
										? boardData.periodNo
											? format(t("board.topSub"), { n: boardData.total || 0, p: boardData.periodNo })
											: format(t("board.topSubLive"), { n: boardData.total || 0 })
										: format(t("board.installsSub"), { n: boardData.total || 0 })
									: "")
							: mode === "best"
							? (bestData ? format(t("best.month"), { m: bestData.month || "" }) : "")
							: mode === "update"
							? ""
							: countSub(data, t, cat.state.loading)),
							h("span", { className: "dph_spacer", key: "gap" }),
							h("a", { className: "dph_btn", key: "site", href: mode === "board" ? SITE + (boardKind === "top" ? "/top" : "/ranking/installs") : mode === "sets" ? SITE + "/sets" : mode === "best" ? SITE + "/best" : SITE + "/plugins", target: "_blank", rel: "noopener noreferrer", onClick: () => track("plugin_hub", { action: "site_click", scope: mode === "board" ? "board_" + boardKind : mode === "daily" ? "daily" : mode === "sets" ? "sets" : mode === "best" ? "best" : "overlay" }) }, t("action.openSite")),
							h("button", { className: "dph_close", key: "close", type: "button", title: t("action.close"), "aria-label": t("action.close"), onClick: () => setHub({ open: false }) }, "×"),
						]),
						/* 6 个视图在 372px 可用宽里会把四字标签挤到裁切 ⇒ 换滚动层（见样式注释） */
						h("div", { className: "dph_segWrap dph_segWrapScroll", key: "seg" }, seg([
							{ value: "search", label: t("best.recommend") },
							{ value: "best", label: t("best.picks") },
							{ value: "board", label: t("board.tab") },
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
							: mode === "board"
							? [
									h("div", { className: "dph_bar", key: "bkind" }, seg([
										{ value: "top", label: t("board.top") },
										{ value: "installs", label: t("board.installs") },
									], boardKind, setBoardKind)),
									h("p", { className: "dph_boardWhy", key: "why" },
										boardKind === "top"
											? (boardData && boardData.live ? t("board.topWhyLive") : t("board.topWhy"))
											: t("board.installsWhy")),
									board.state.error
										? h(Notice, {
												key: "boerror",
												kind: "bad",
												text: /404/.test(board.state.error) ? t("board.offline") : t("state.failed") + "：" + board.state.error,
											})
										: null,
									board.state.loading && !boardData ? h(Notice, { key: "boloading", text: t("board.loading") }) : null,
									!board.state.loading && boardData && (boardData.total || 0) === 0 ? h(Notice, { key: "boempty", text: t("board.empty") }) : null,
									h("div", { className: "dph_panelBody", key: "bobody" }, renderBoard(boardData, boardKind, board.copiedCmd, board.markCopied, { wide: false })),
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
									h(CompareBar, { key: "cmpBar", open: comparing, onToggle: () => setComparing((value) => !value) }),
									comparing ? h(CompareTable, { key: "cmp", copiedCmd: cat.copiedCmd, markCopied: cat.markCopied }) : null,
									h("div", { className: "dph_panelBody", key: "body" }, cat.plugins.map((item) => renderCard(item, cat.copiedCmd, cat.markCopied, true, true, false, "panel"))),
								]
							: [
									best.state.error ? h(Notice, { key: "berror", kind: "bad", text: t("state.failed") + "：" + best.state.error }) : null,
									best.state.loading && !bestData ? h(Notice, { key: "bloading", text: t("best.loading") }) : null,
									!best.state.loading && bestData && (bestData.total || 0) === 0 ? h(Notice, { key: "bempty", text: t("best.empty") }) : null,
									h("div", { className: "dph_panelBody", key: "bbody" }, renderBest(bestData, best.copiedCmd, best.markCopied)),
								]),
						h("div", { className: "dph_panelFoot", key: "foot" }, [
							/* 浮窗里也放一份：浮窗是曝光最高的入口，只有页签有等于大半用户看不到。
							   compact 版省掉说明行，二维码默认收起（面板只有 400px 宽）。 */
							h(JoinCard, { key: "join", compact: true }),
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
		/* 侧栏「各小类冠军」的口径是纯函数，单独导出便于断言排序与去重边界 */
		exports.pickHighlights = pickHighlights;
		/* 供测试使用：本机路由的响应解析要能容忍非 JSON 正文（host 未重启的窗口期） */
		exports.readHostJson = readHostJson;
		/* 供测试使用：升级目标要还原成裸包名才能查 profile 清单 */
		exports.basePackage = basePackage;
		return module.exports;
	},
});
