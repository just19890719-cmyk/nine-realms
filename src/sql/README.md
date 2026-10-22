# Supabase SQL
在 Supabase 專案的 SQL Editor 依序執行（已經在正式資料庫跑過的是備份與參考）：
0. `00_tables_snapshot.sql`：saves、lb、market 資料表、索引、讀取權限與 lb_rename（2026-10-22 從正式資料庫匯出；只有重建新專案時才需要）
1. `01_supabase_full_v3.49.sql`：資料表、防作弊、排行榜、交易所全部函式
2. `02_save_game_v3.50.sql`：save_game 加上首通金幣額度（覆蓋 1 的同名函式）
3. `03_security_v3.63.sql`：v3.63 安全修正（管理員判斷、強化／附魔／工坊／村莊進度檢查、交易所成交由伺服器扣款、放寬收入額度）。覆蓋 1、2 的 save_game 與 market_buy。
4. `04_leaderboard_v3.65.sql`：排行榜戰力改由伺服器計算（武器必須在雲端存檔裡），並重算現有紀錄。
5. `05_offline12h_v3.69.sql`：v3.69 正式速度（原 10 倍速寫進遊戲時間）、離線上限 12 小時、收入額度上限放大。覆蓋 3 的 save_game。
7. `07_boss_v3.72.sql`：v3.72 每週首領討伐全服血條（boss 資料表、boss_hit 由伺服器算傷害、boss_board 排名）。要先跑過 04。
8. `08_realm2_v3.76.sql`：v3.76 第二界約頓海姆（save_game 改成 20 座村莊、重鍊等級檢查、收入額度放寬）、排行榜／首領戰力算進重鍊、交易所上架檢查重鍊等級。要先跑過 04、05、07。
9. `09_enchant_v3.84.sql`：v3.84 附魔 12 種，排行榜／首領戰力算進雷霆、劇毒、神聖。要先跑過 08。
10. `10_boss_post_v3.87.sql`：v3.87 首領改成整週駐守（週日 00:00 結算、武器留著繼續打；boss_slot 資料表、boss_post／boss_unpost、boss_board 按時間累積並附上排名玩家的駐守武器、血量隨人數增加），刪掉舊的 boss_hit。要先跑過 07、08（09 在它前面跑）。
