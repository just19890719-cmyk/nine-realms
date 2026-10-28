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
M. `15_stable6_v4.00.sql`：v4.00 安定值全部改成 +6，只換掉 `ac_stable`（save_game 不用重貼）。最後一行的 select 四欄都要顯示 6。要先跑過 08。
16. `16_god_weapons_v4.15.sql`：v4.15 神明武器＋神格覺醒（ac_mult、lb_bp 認得霍夫德之劍／斯卡蒂之弓，lb_power +11 攻擊力 ×1.1，boss_pw +13 首領傷害 ×1.15，chat_titles 多「守望者」「雪山之主」）。最後一行的 select 應該顯示 4.15、569、18。要先跑過 08、09、12、14、15。
18. `18_element_v4.45.sql`：v4.45 屬性附魔與怪物弱點（lb_power 不再算附魔和天生詞條、boss_weak 改成屬性、boss_pw 依屬性等級 ×1.2／1.4／1.6）。最後一行的 select 應該顯示 4.45、418、4320。要先跑過 08、09、10、14、16。
19. `19_market_items_v4.56.sql`：v4.56 交易所賣道具（market 多 kind／item／grp／qty／left_qty 欄位、新表 market_fill；market_list_item／market_buy_item／market_cancel_item／market_item_pending／market_item_claim 直接改雲端存檔；舊的 market_buy／market_cancel／market_pending 只處理武器）。不改 save_game。最後一行的 select 應該顯示 4.56。要先跑過 01、03、08。
20. `20_fastkill_v4.73.sql`：v4.73 秒殺榜（fk 每人每關最快 1 筆、fk_feed 王關首殺／刷新第 1 名公告、fk_submit 核對雲端存檔已收復＋武器在存檔、fk_board 前 50 名、fk_feed_list）。不改 save_game、不改 ac_version。最後一行的 select 應該顯示 4.73。
23. `23_fastkill_reset_v5.34.sql`：v5.34 怪物血量改成「偏難」表，秒殺榜重新開始（舊紀錄先備份到 fk_old_v473，再清空 fk、fk_feed）。不改 save_game、不改 ac_version。最後一行的 select 應該顯示 5.34、0、0、備份筆數。要先跑過 20。
24. `24_relaunch_wipe_v5.35.sql`：v5.35 **重新開放前清空所有玩家進度**（只在開放當天、MAINT 改成 false 之前跑一次）。每張遊戲資料表先完整複製到 `bak_v535` 備份區再清空；保留 admins、髒話名單和所有函式。v5.38 起（Mochi 選「只留管理員」）**帳號也一起刪**，只留 admins 名單裡的帳號（先備份到 `bak_v535.auth_users`；admins 是空的會停下來不刪帳號）。最後還有一行確認剩下帳號數＝管理員數。不改 save_game、不改 ac_version。最後的 select 列出每張表的備份筆數和清空後筆數（清空後都要是 0）。重跑也安全（已經有備份就不會覆蓋）。
25. `25_shop_bucket_v5.36.sql`：v5.36 save_game 的道具／材料額度把「花掉的金幣、鑽石」和「打開的英靈・遺物」算進去（商城一次買很多、一次開很多遺物不再被誤判作弊；同一筆錢不會同時抵道具和材料）。也補上 22 少掉的 `end $$;`（照 22 檔案貼會失敗）。最後的 select 應該顯示 5.36、true。要先跑過 08。
26. `26_fastkill_check_v5.38.sql`：v5.38 秒殺榜伺服器檢查（新增 fk_cx 圖鑑加成、fk_min 最快可能秒數；fk_submit 比最快可能秒數快 0.3 秒以上回 `fast`、記 ac_log `fk_fast`，管理員略過）。改武器數值或怪物血量時 fk_min 要跟 game.js 的 fkMin 一起改。不改 save_game、不改 ac_version。最後的 select 應該顯示 5.38、45、3。要先跑過 20。
