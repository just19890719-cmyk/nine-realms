# Supabase SQL
在 Supabase 專案的 SQL Editor 依序執行（已經在正式資料庫跑過的是備份與參考）：
0. `00_tables_snapshot.sql`：saves、lb、market 資料表、索引、讀取權限與 lb_rename（2026-10-22 從正式資料庫匯出；只有重建新專案時才需要）
1. `01_supabase_full_v3.49.sql`：資料表、防作弊、排行榜、交易所全部函式
2. `02_save_game_v3.50.sql`：save_game 加上首通金幣額度（覆蓋 1 的同名函式）
3. `03_security_v3.63.sql`：v3.63 安全修正（管理員判斷、強化／附魔／工坊／村莊進度檢查、交易所成交由伺服器扣款、放寬收入額度）。覆蓋 1、2 的 save_game 與 market_buy。
4. `04_leaderboard_v3.65.sql`：排行榜戰力改由伺服器計算（武器必須在雲端存檔裡），並重算現有紀錄。
