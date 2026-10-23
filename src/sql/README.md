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
11. `11_chat_v3.88.sql`：v3.88 世界聊天＋玩家名片（chat 表、chat_send 冷卻／禁言／髒話過濾、chat_list、chat_sys、檢舉、管理員禁言、pc_card／pc_like 按讚）。不改 save_game、不改 ac_version，用 `select chat_version();` 確認（應該顯示 3.88）。要先跑過 06、08。
12. `12_social_v3.89.sql`：v3.89 聊天武器卡（chat_send 多一個 p_wid，伺服器從存檔核對武器）、稱號（chat_titles／chat_title，pc_card 回傳稱號）、恭喜（news_cheer 資料表、news_cheer_add、news_cheer_inbox，chat_sys 多回傳恭喜數）。不改 save_game、不改 ac_version，用 `select chat_version();` 確認（應該顯示 3.89）。要先跑過 10、11。
14. `14_guild_v3.98.sql`：v3.98 好友＋公會（friend／friend_req、guild／guild_mem／guild_app／gd_user 資料表；建立公會 50,000 金幣、捐獻與公會商店由伺服器直接改雲端存檔；公會等級加成算進 boss_pw；chat_send／chat_list 多公會頻道；pc_card 回傳好友狀態和公會）。不改 save_game、不改 ac_version，用 `select chat_version();` 確認（應該顯示 3.98）。要先跑過 10、11、12。
