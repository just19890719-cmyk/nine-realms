/* =====================================================================
 * 九界鐵匠 UI 皮膚設定（skin.js）
 * 美術素材交付後，只要改這一個檔案，全遊戲所有使用該元件的畫面都會同步更新。
 *
 * 每個槽位填 null＝使用目前的 CSS 外觀（預設全部 null，外觀與 v3.9 完全相同）。
 * 要套用美術時填一個物件：
 *   src     圖片路徑（PNG 或 WebP，需真透明背景），例：'art/ui/ui_btn_primary_normal.webp'
 *   mode    '9slice'（預設，可伸縮邊框）或 'bg'（整張當背景，拉滿元件）
 *   slice   9-slice 四邊「不可拉伸」的像素寬度，依序：上、右、下、左（以原圖像素計）
 *   border  顯示時四邊框的寬度（px），依序：上、右、下、左；省略時＝slice 的 1/3（3 倍解析度素材）
 *   repeat  中間與四邊延伸方式：'stretch'（拉伸，預設）或 'round'（重複圖樣）
 *   fill    true（預設）＝中間區塊也畫出來；false＝只畫外框
 *   shadow  false（預設）＝移除原本 CSS 陰影；true＝保留
 *   css     額外 CSS（選填），例：'padding:4px 18px;color:#ffe9b8'
 *
 * 狀態寫法：在槽位名稱後加上 :pressed（按下）、:disabled（停用）、:on（選中）
 *   例：'btn-primary:pressed': {src:'art/ui/ui_btn_primary_pressed.webp', slice:[40,48,40,48]}
 *   狀態槽位只需要給 src，其他設定會沿用一般狀態。
 *
 * 槽位對應的元件請見開發工具 →「UI 元件」分頁，或 UI_元件架構說明.txt。
 * ===================================================================== */
const UI_SKIN={
  // v4.91 Mochi：程式畫的框和按鈕看起來很廉價 → 換成 AI 細線框（拼圖：/mnt/project-files/ui-skin/v4.91/整合版_*）
  //   規則：雕花只在四個角，所有元件的角落雕花都一樣大（圖框繪製寬度 ÷ 切片 ≈ 0.3）；框中間是空的，保留元件原本的深色底（Mochi：皮革底紋很醜，不用）
  'btn-primary':{src:'art/ui/ui491_b_pri.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-primary:pressed':{src:'art/ui/ui491_b_pri_p.webp'},  'btn-primary:disabled':{src:'art/ui/ui491_b_pri_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-primary-big':{src:'art/ui/ui491_b_pri.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-primary-big:pressed':{src:'art/ui/ui491_b_pri_p.webp'},  'btn-primary-big:disabled':{src:'art/ui/ui491_b_pri_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-primary-compact':{src:'art/ui/ui491_b_pri.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-primary-compact:pressed':{src:'art/ui/ui491_b_pri_p.webp'},  'btn-primary-compact:disabled':{src:'art/ui/ui491_b_pri_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-secondary':{src:'art/ui/ui491_b_sec.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-secondary:pressed':{src:'art/ui/ui491_b_sec_p.webp'},  'btn-secondary:disabled':{src:'art/ui/ui491_b_sec_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-secondary-big':{src:'art/ui/ui491_b_sec.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-secondary-big:pressed':{src:'art/ui/ui491_b_sec_p.webp'},  'btn-secondary-big:disabled':{src:'art/ui/ui491_b_sec_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-secondary-compact':{src:'art/ui/ui491_b_sec.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-secondary-compact:pressed':{src:'art/ui/ui491_b_sec_p.webp'},  'btn-secondary-compact:disabled':{src:'art/ui/ui491_b_sec_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-danger':{src:'art/ui/ui491_b_dan.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-danger:pressed':{src:'art/ui/ui491_b_dan_p.webp'},  'btn-danger:disabled':{src:'art/ui/ui491_b_dan_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-danger-big':{src:'art/ui/ui491_b_dan.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-danger-big:pressed':{src:'art/ui/ui491_b_dan_p.webp'},  'btn-danger-big:disabled':{src:'art/ui/ui491_b_dan_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-danger-compact':{src:'art/ui/ui491_b_dan.webp',slice:[52,52,52,52],width:[15,15,15,15],css:'text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85);padding-left:16px;padding-right:16px'},  'btn-danger-compact:pressed':{src:'art/ui/ui491_b_dan_p.webp'},  'btn-danger-compact:disabled':{src:'art/ui/ui491_b_dan_d.webp',css:'filter:none;opacity:1;color:#bdb3a2;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.85)'},
  'btn-chip':{src:'art/ui/ui491_cap.webp',slice:[53,53,53,53],width:[30,30,30,30],fill:false,css:'background:#15110d'},  'btn-chip:on':{src:'art/ui/ui491_cap_on.webp',css:'color:var(--gold-hi)'},
  'btn-toggle':{src:'art/ui/ui491_fr.webp',slice:[50,50,50,50],width:[15,15,15,15],fill:false,bg:true},  'btn-toggle:on':{src:'art/ui/ui491_fr_on.webp'},
  'btn-accent':null,            'btn-accent:pressed':null,
  'btn-icon':null,              'btn-icon:pressed':null,
  'tab':{src:'art/ui/ui491_fr.webp',slice:[50,50,50,50],width:[15,15,15,15],fill:false,bg:true},  'tab:on':{src:'art/ui/ui491_fr_on.webp'},
  // 面板與卡片
  'panel':{src:'art/ui/ui491_fr.webp',slice:[50,50,50,50],width:[15,15,15,15],fill:false,bg:true},
  'title':null,
  'card':{src:'art/ui/ui491_fr.webp',slice:[50,50,50,50],width:[15,15,15,15],fill:false,bg:true},  'card:on':{src:'art/ui/ui491_fr_on.webp'},
  'card-compact':{src:'art/ui/ui491_fr.webp',slice:[50,50,50,50],width:[15,15,15,15],fill:false,bg:true},  'card-compact:on':{src:'art/ui/ui491_fr_on.webp'},
  'card-feature':null,
  'card-option':{src:'art/ui/ui491_fr.webp',slice:[50,50,50,50],width:[15,15,15,15],fill:false,bg:true},  'card-option:on':{src:'art/ui/ui491_fr_on.webp'},
  'card-row':{src:'art/ui/ui491_fr.webp',slice:[50,50,50,50],width:[15,15,15,15],fill:false,bg:true},
  'badge':null,
  'prog':null,                  'prog-fill':null,
  // 視窗與常駐列
  'sheet':{src:'art/ui/ui491_fr_modal.webp',slice:[50,50,50,50],width:[17,17,17,17],fill:false,bg:true},
  'modal':{src:'art/ui/ui491_fr_modal.webp',slice:[50,50,50,50],width:[17,17,17,17],fill:false,bg:true},
  'toast':null,
  'topbar':null,
  'navbar':null,
  'navtab':null,                'navtab:on':null,
  'page-bg':null
};

/* 介面圖示：目前用文字符號的圖示。填圖片路徑即改用圖片，null＝維持原本文字符號。
 * 其他已經是圖片的圖示（關閉 ic_close、齒輪 ic_gear、＋ ic_plus、鎖 ic_lock…）直接用同檔名覆蓋 art/ 內的檔案即可。 */
const UI_ICON={
  'info':null,          // ⓘ 說明
  'arrow-next':null,    // ➜ 強化等級 +N → +N+1
  'arrow-left':null,    // ‹ 九界上一個
  'arrow-right':null,   // › 九界下一個
  'clear':null,         // ✕ 清除篩選
  'sound-on':null,      // 🔊 音效開
  'sound-off':null      // 🔇 音效關
};

/* 介面圖片替換：把既有的圖示檔名（art/ 內的 ic_close 等）換成新素材路徑。預設空白＝不變。
 *   例：'ic_close':'art/ui/ui_icon_01_sq.webp' */
const UI_ART={};

/* =====================================================================
 * 第二階段候選皮膚（UI_SKIN_PREVIEW）——預設不啟用，遊戲外觀不變
 * 只用「已通過素材檢查與 9-slice 驗證」的素材（pub/art/ui/）。
 * 在開發工具 →「UI 元件」按「預覽第二階段候選皮膚」可暫時套用（不寫進存檔，重新整理就還原）。
 * 確認後要正式啟用：把下面的設定逐項搬到上面的 UI_SKIN 即可。
 *
 * width 參數：圖框的繪製寬度（px），不改元件原本的邊框，所以版面尺寸不變。
 *   按鈕類（只能橫向伸縮的素材）上下寬度＝最高按鈕高度的一半，比較矮的按鈕會整組等比縮小，四角不變形。
 * 沒有合格素材的槽位維持原外觀：title、badge、page-bg、card-compact（附魔欄位、鑽石商品）。
 * navtab：旗幟素材 ui_navigation_11～13 試套後會和分頁圖示重疊，暫不放入。
 * ===================================================================== */
const UI_SKIN_PREVIEW={
  // v3.14 AI 手繪素材
  //   一般按鈕：所有寬度都用 narrow（兩端角飾窄，44px 高時約 17px），standard 角飾太寬（44px 高時 46px），小於 180px 的按鈕會壓字
  //   大按鈕 .big（強化、交付等）：畫面寬 ≥400px 用 standard；390px 以下有些大按鈕兩個並排、寬度不夠，改用 narrow
  //   小按鈕 .sm：用 compact
  //   slice 依實測角飾範圍（manifest 的 standard 65 會切到角飾，實測約 110）
  'btn-primary': {src:'art/ui/ui314_btn_primary_narrow_normal.webp',slice:[44,34,44,34],width:[22,17,22,17],css:'color:#fff6e0;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:18px;padding-right:18px'},
  'btn-primary:pressed': {src:'art/ui/ui314_btn_primary_narrow_pressed.webp'},
  'btn-primary:disabled': {src:'art/ui/ui314_btn_primary_narrow_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-secondary': {src:'art/ui/ui314_btn_secondary_narrow_normal.webp',slice:[44,34,44,34],width:[22,17,22,17],css:'text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:18px;padding-right:18px'},
  'btn-secondary:pressed': {src:'art/ui/ui314_btn_secondary_narrow_pressed.webp'},
  'btn-secondary:disabled': {src:'art/ui/ui314_btn_secondary_narrow_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-danger': {src:'art/ui/ui314_btn_danger_narrow_normal.webp',slice:[44,34,44,34],width:[22,17,22,17],css:'color:#fff4ea;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:18px;padding-right:18px'},
  'btn-danger:pressed': {src:'art/ui/ui314_btn_danger_narrow_pressed.webp'},
  'btn-danger:disabled': {src:'art/ui/ui314_btn_danger_narrow_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-primary-big': {src:'art/ui/ui314_btn_primary_normal.webp',slice:[55,115,55,115],width:[26,54.4,26,54.4],css:'color:#fff6e0;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:56px;padding-right:56px',minWidth:400},
  'btn-primary-big:pressed': {src:'art/ui/ui314_btn_primary_pressed.webp'},
  'btn-primary-big:disabled': {src:'art/ui/ui314_btn_primary_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-secondary-big': {src:'art/ui/ui314_btn_secondary_normal.webp',slice:[55,115,55,115],width:[26,54.4,26,54.4],css:'text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:56px;padding-right:56px',minWidth:400},
  'btn-secondary-big:pressed': {src:'art/ui/ui314_btn_secondary_pressed.webp'},
  'btn-secondary-big:disabled': {src:'art/ui/ui314_btn_secondary_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-danger-big': {src:'art/ui/ui314_btn_danger_normal.webp',slice:[55,115,55,115],width:[26,54.4,26,54.4],css:'color:#fff4ea;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:56px;padding-right:56px',minWidth:400},
  'btn-danger-big:pressed': {src:'art/ui/ui314_btn_danger_pressed.webp'},
  'btn-danger-big:disabled': {src:'art/ui/ui314_btn_danger_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-primary-big|narrow': {src:'art/ui/ui314_btn_primary_narrow_normal.webp',slice:[44,34,44,34],width:[26,20,26,20],css:'color:#fff6e0;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:18px;padding-right:18px',maxWidth:399},
  'btn-primary-big|narrow:pressed': {src:'art/ui/ui314_btn_primary_narrow_pressed.webp'},
  'btn-primary-big|narrow:disabled': {src:'art/ui/ui314_btn_primary_narrow_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-secondary-big|narrow': {src:'art/ui/ui314_btn_secondary_narrow_normal.webp',slice:[44,34,44,34],width:[26,20,26,20],css:'text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:18px;padding-right:18px',maxWidth:399},
  'btn-secondary-big|narrow:pressed': {src:'art/ui/ui314_btn_secondary_narrow_pressed.webp'},
  'btn-secondary-big|narrow:disabled': {src:'art/ui/ui314_btn_secondary_narrow_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-danger-big|narrow': {src:'art/ui/ui314_btn_danger_narrow_normal.webp',slice:[44,34,44,34],width:[26,20,26,20],css:'color:#fff4ea;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:18px;padding-right:18px',maxWidth:399},
  'btn-danger-big|narrow:pressed': {src:'art/ui/ui314_btn_danger_narrow_pressed.webp'},
  'btn-danger-big|narrow:disabled': {src:'art/ui/ui314_btn_danger_narrow_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-primary-compact': {src:'art/ui/ui314_btn_primary_compact_normal.webp',slice:[36,28,37,28],width:[22,16.9,22,16.9],css:'color:#fff6e0;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:16px;padding-right:16px'},
  'btn-primary-compact:pressed': {src:'art/ui/ui314_btn_primary_compact_pressed.webp'},
  'btn-primary-compact:disabled': {src:'art/ui/ui314_btn_primary_compact_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-secondary-compact': {src:'art/ui/ui314_btn_secondary_compact_normal.webp',slice:[36,28,37,28],width:[22,16.9,22,16.9],css:'text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:16px;padding-right:16px'},
  'btn-secondary-compact:pressed': {src:'art/ui/ui314_btn_secondary_compact_pressed.webp'},
  'btn-secondary-compact:disabled': {src:'art/ui/ui314_btn_secondary_compact_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  'btn-danger-compact': {src:'art/ui/ui314_btn_danger_compact_normal.webp',slice:[36,28,37,28],width:[22,16.9,22,16.9],css:'color:#fff4ea;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9);padding-left:16px;padding-right:16px'},
  'btn-danger-compact:pressed': {src:'art/ui/ui314_btn_danger_compact_pressed.webp'},
  'btn-danger-compact:disabled': {src:'art/ui/ui314_btn_danger_compact_disabled.webp',css:'filter:none;opacity:1;color:#f3eadb;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)'},
  // tab：320／360px 退回原外觀（「鍛造中 (1/1)」分頁寬 106px，文字 90px，放不下兩端角飾，會斷成兩行）
  'tab':             {src:'art/ui/ui314_tab_narrow_normal.webp',slice:[44,28,44,28],width:[22,14,22,14],css:'padding-left:13px;padding-right:13px',minWidth:361},
  'tab:on':          {src:'art/ui/ui314_tab_narrow_active.webp'},
  'card-row':        {src:'art/ui/ui314_row_narrow.webp',slice:[46,40,46,40],width:[46,40,46,40],css:'padding:8px 26px',minWidth:361},
  // card-option 退回：ui314_option 是 300×88 的橫條，套到狩獵策略、附魔詞條這種直式小卡（107×78～121）時兩端角飾在中間重疊，320px 壓字 8～33px
  // navbar：中央鑽飾拆成獨立一層（ui314_navbar_diamond），固定比例置中；底圖用拿掉鑽飾的 ui314_navbar_bg_plain 橫向伸縮
  //   （兩張都是從 ChatGPT 的 ui314_navbar_bg 切出來的，疊回去和原圖平均差 0.3／255）
  'navbar':          {src:'art/ui/ui314_navbar_bg_plain.webp',slice:[112,150,113,150],width:[37.5,50,37.5,50],overlay:{src:'art/ui/ui314_navbar_diamond.webp',ratio:'154/225'},css:'background-color:#16110d;padding-left:calc(30px + env(safe-area-inset-left,0px));padding-right:calc(30px + env(safe-area-inset-right,0px))',minWidth:361},
  'navbar|narrow':   {src:'art/ui/ui314_navbar_bg_plain.webp',slice:[112,150,113,150],width:[37.5,50,37.5,50],overlay:{src:'art/ui/ui314_navbar_diamond.webp',ratio:'154/225'},css:'background-color:#16110d;padding-left:calc(42px + env(safe-area-inset-left,0px));padding-right:calc(42px + env(safe-area-inset-right,0px))',maxWidth:360},
  'btn-chip':        {src:'art/ui/ui_navigation_17.webp',slice:[36,27,37,27],width:[20,14.8,20,14.8],css:'padding-left:15px;padding-right:15px'},
  'btn-chip:on':     {src:'art/ui/ui_navigation_23.webp',slice:[37,24,38,24],width:[20,12.8,20,12.8]},
  'btn-toggle':      {src:'art/ui/ui_panel_13.webp',slice:[31,38,31,38],width:[12.4,15.2,12.4,15.2]},
  'btn-toggle:on':   {src:'art/ui/ui_panel_17.webp',slice:[37,37,37,37],width:[14.8,14.8,14.8,14.8]},
  'btn-accent':      {src:'art/ui/ui_panel_17.webp',slice:[37,37,37,37],width:[14.8,14.8,14.8,14.8],css:'color:#ffe6a8;text-shadow:0 1px 2px #000'},
  'btn-icon':        {mode:'clear'},
  'panel':           {src:'art/ui/ui_rarity_07.webp',slice:[55,61,55,61],width:[22,24.4,22,24.4]},
  'card':            {src:'art/ui/ui_rarity_09.webp',slice:[56,59,56,59],width:[18.5,19.5,18.5,19.5]},
  'card:on':         {src:'art/ui/ui_rarity_08.webp',slice:[57,58,57,58],width:[18.8,19.1,18.8,19.1]},
  'card-feature':    {src:'art/ui/ui_rarity_07.webp',slice:[55,61,55,61],width:[24.8,27.4,24.8,27.4]},
  'prog':            {src:'art/ui/ui_navigation_14.webp',slice:[32,73,33,73],width:[8,18,8,18]},
  'prog-fill':       {src:'art/ui/ui_navigation_15.webp',slice:[33,77,33,77],width:[7,16.3,7,16.3]},
  'sheet':           {src:'art/ui/ui_rarity_07.webp',slice:[55,61,55,61],width:[24.8,27.4,24.8,27.4]},
  'modal':           {src:'art/ui/ui_rarity_07.webp',slice:[55,61,55,61],width:[24.8,27.4,24.8,27.4]},
  'toast':           {src:'art/ui/ui_navigation_21.webp',slice:[79,112,80,112],width:[21,29.6,21,29.6]},
  // topbar 頂部列退回：左側等級徽章壓在 ui_panel_10 的尖端裝飾上（390px、320px 兩行版都會）
};
const UI_ICON_PREVIEW={
  'info':'art/ui/ui_icon_03_sq.webp','arrow-left':'art/ui/ui_icon_11_sq.webp','arrow-right':'art/ui/ui_icon_12_sq.webp',
  'clear':'art/ui/ui_icon_01_sq.webp','sound-on':'art/ui/ui_icon_09_sq.webp','sound-off':'art/ui/ui_icon_10_sq.webp'
};
const UI_ART_PREVIEW={
  'ic_close':'art/ui/ui_icon_01_sq.webp','ic_gear':'art/ui/ui_icon_07_sq.webp','ic_plus':'art/ui/ui_icon_05_sq.webp',
  'ic_lock':'art/ui/ui_icon_17_sq.webp','ic_unlock':'art/ui/ui_icon_18_sq.webp','ic_check':'art/ui/ui_icon_13_sq.webp','ic_back':'art/ui/ui_icon_11_sq.webp'
};
