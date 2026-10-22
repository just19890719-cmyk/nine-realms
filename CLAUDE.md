# 九界鐵匠（Nine Realms Blacksmith）— Claude Code 開發說明

北歐暗黑奇幻風（類似天堂W）的放置型鐵匠手機網頁遊戲。單一 HTML 頁面＋原生 JS，沒有框架、沒有 npm 依賴。
目前版本：v3.56 封測（看 `src/game.js` 的 `BUILD_ID`）。

## 跟使用者合作的規則（一定要遵守）
- 一律用**繁體中文、台灣用語**回覆，不要用英文、不要用大陸用語。
- 開始做事前先說**預估要多久**。
- 只做**局部修改**，不要整檔重寫；改程式前用 1～2 句話說明會動到哪些既有模組。新需求跟既有邏輯衝突時先提醒，不要直接覆蓋。
- 已確認完成的部分（UI 錨點、校準過的座標、碰撞範圍、武器圖安全距離）沒被要求就不要動。
- 只跑**跟這次修改有關的快速測試**，不要跑好幾分鐘的模擬或長回歸測試。
- 每次修改完都要給**可以玩的測試版**（推上 GitHub Pages：https://just19890719-cmyk.github.io/nine-realms/ ）。
- 每個新功能都要在**開發者工具**加一個測試按鈕（頭像連點 20 下開開發者模式）。
- 需要使用者做決定時，用**選項表單**（AskUserQuestion）讓他選，不要只用文字問。
- 美術、特效一律用 **AI 生圖**，不要用程式畫；給生圖提示詞時每一則都要**完整獨立**（不要寫「同上，只改最後一行」）。
- 每次修改後**主動檢查並指出畫面問題**（怪的灰底、武器被裁切或碰到框、黑色圖示框、文字換行等）。
- 檔案不要打包成 ZIP，一個一個給。

## 不可以改的規則
- 強化成功率表 `RATE` 與爆裝公式。
- 符文時間軸。
- 武器圖的安全距離。

## 專案結構
```
src/                    ← 原始碼（只改這裡）
  game.js               主程式（資料、經濟、畫面、雲端、交易所、新手導覽、開發者工具）
  style.css             全部樣式（檔案本身包含 <style>…</style>，新樣式要加在 </style> 之前）
  skin.js               UI 皮膚設定
  tests.js              遊戲內快速測試（開發者工具按「執行快速測試」時才載入）
  sw.js                 Service Worker：art/、sfx/ 先用快取，背景更新
  index.template.html   頁面骨架（<!--STYLE--> 和 <!--SCRIPT--> 會被建置腳本換掉）
  build.py              建置腳本
  sql/                  Supabase 資料庫函式（照檔名順序在 SQL Editor 執行）
  tools/ui_test.js      Playwright 介面測試
  docs/                 UI 元件架構說明
art/  sfx/              美術與音效（網站直接讀取）
index.html  version.json  tests.js  sw.js   ← 建置產物，不要手動改
```

## 建置與發佈
```bash
# 1. 改 src/ 裡的檔案，並把 src/game.js 的 BUILD_ID 加一版（例如 3.56 → 3.57）
python3 src/build.py          # 產生根目錄的 index.html、version.json、tests.js、sw.js
git add -A && git commit -m "v3.57 …" && git push    # GitHub Pages 約 1 分鐘後更新
```
- **每次發佈都要更新 BUILD_ID**：網站會比對 `version.json`，舊版玩家會被要求更新（只允許玩最新版）。
- 本機預覽：在 repo 根目錄 `python3 -m http.server 8765`，開 http://localhost:8765/ 。
  注意：只有 github.io 網域才會啟用「只能雲端存檔」模式；本機可加 `#cloudonly` 模擬。

## 測試
- 遊戲內：開發者工具 →「執行快速測試」（tests.js，約 52 項）。
- 介面測試：`npm i -D playwright && npx playwright install chromium`，啟動本機伺服器後 `node src/tools/ui_test.js`。

## 架構重點
- **速度**：v3.69 起原本的封測 10 倍速已直接寫進狩獵／鍛造時間（`GAME_SPEED=1`，只剩開發者工具的加速按鈕會改它），畫面時間＝真實時間；離線上限 `OFFLINE_H=12` 小時（伺服器 save_game 也固定 12）；`BETA=true` 時商城隱藏鑽石儲值、月卡免費。
- **鍛造（v3.78）**：武器學徒已拿掉，鍛造一律 `FORGE_SEC=5` 秒、一次一批（批量也是 5 秒）；舊存檔的 `S.slots` 只留著算鐵匠等級。熟練鍛造天賦、鍛造沙漏已移除。
- **雲端（Supabase）**：專案 `bzvilstgpjkztrydjwlt`（東京），前端只用 publishable key（已寫在 game.js）。
  **絕對不要索取或使用 service_role / secret key。**
  - 一律雲端存檔、沒有訪客模式（網站上）、同帳號只能一支手機登入（`claim_session`）。
  - 存檔：`save_game` RPC，每 10 秒＋切到背景＋關頁時；伺服器時間由 `server_now` 校正（`CLOCK.offset`）。
  - 防作弊（方案 A）：`save_game` 在伺服器端用 token bucket 檢查金幣／鑽石／材料／道具／新武器增加速度與武器數值，不合理就回 `cheat:原因` 並寫入 `ac_log`；`admins` 表的帳號略過檢查。方案 B（全部邏輯搬到伺服器）上架前再評估。
  - 排行榜：真人資料 `lb` 表（`lb_submit`、`lb_rename`），首次達成發獎勵。
  - 暱稱：註冊後立刻取，2～8 字、不可重複。
- **交易所**：玩家間買賣武器，金幣或鑽石計價、手續費 5%、最低價 10、上架 3 天、最多 10 件；上鎖或駐守中的武器不能上架。RPC：`market_list / market_buy / market_cancel / market_pending / market_ack`，都要帶 `p_sid`；用帳本（`S.mk`）確保每筆只入帳一次。
- **新手導覽**：`TUT` 步驟陣列，支援 `sel`（高亮目標）、`tf`（動態文字）、`done`；目標會自動捲到畫面內。
- **畫面更新**：`render()` 會保留鐵匠鋪上方 hero 區塊（避免動畫重跑）、保留橫向捲動位置；導覽列和上方資源列只有內容變了才重畫。
- **效能（v3.56）**：動畫只用 transform／opacity；視差 rAF 收斂就停；不要在 body／html 上用 `:has()`（改用 render 時切換 class，例如 `body.bpc`、`html.scrimmed`）。
- **音效**：`snd(名稱)`，音量 `S.vol`，檔案在 `sfx/`。

## 環境限制（雲端 Claude Code）
- Supabase 資料庫函式要由使用者自己在 Supabase 網站的 SQL Editor 執行；改了 SQL 就把完整 SQL 給他貼。
- 如果連不到 github.io 或 Google Fonts，是沙盒網路限制，不是程式問題。
