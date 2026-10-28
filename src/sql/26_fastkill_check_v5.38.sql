-- v5.38 秒殺榜伺服器檢查（Mochi 2026-10-28 選「秒殺榜伺服器檢查」）
-- 以前 fk_submit 只檢查秒數在 1～60 之間，改過的遊戲可以直接上傳 1.0 秒。
-- 現在伺服器用雲端存檔裡那把武器（圖紙、強化等級、屬性附魔）＋圖鑑加成，算出「最快可能」秒數：
--   每一下都觸發附加效果（最多 ×2.5）、Boss 武器特效每下都中（×1.3），再多留 2%＋1 點傷害的誤差
--   上傳的秒數比這個快 0.3 秒以上就不收，回傳 'fast'，並記一筆 ac_log（reason＝fk_fast）。管理員帳號略過。
-- 這是「不可能更快」的上限，正常玩家運氣再好也不會被擋；遊戲端 game.js 的 fkMin 是同一套算法。
-- 改武器數值（BPS、ENH_MULT、CSPD、相剋、屬性倍率、圖鑑）或怪物血量（VREQ、HP_SEC）時，這裡要一起改。
-- 前置：20（秒殺榜）。不改 save_game、不改 ac_version。執行完用最後一行確認，應該顯示 5.38。

-- 圖鑑加成（%）：每格 +0.2／+0.6／+1.5，套裝湊齊另外加；跟 game.js 的 cxPct 一樣
create or replace function public.fk_cx(c jsonb) returns float8 language sql immutable as $$
  with f as (
    select e.key as k, j.j, coalesce(e.value->>j.j, '0') not in ('0', 'false', '', 'null') as ok
    from jsonb_each(case when jsonb_typeof(c) = 'object' then c else '{}'::jsonb end) e
    cross join generate_series(0, 2) as j(j)
    where jsonb_typeof(e.value) = 'array'
  ), sets(ks, j, v) as (values
    (array['w0_sword','w0_axe','w0_hammer','w0_dual','w0_spear','w0_bow','w0_xbow'], 0, 2.0),
    (array['w0_sword','w0_axe','w0_hammer','w0_dual','w0_spear','w0_bow','w0_xbow'], 2, 4.0),
    (array['w1_spear','w1_sword','w1_xbow'], 1, 2.0),
    (array['w2_axe','w2_bow','w2_dual'], 1, 2.0),
    (array['w1_troll','w2_utgard'], 2, 3.0),
    (array['g_hofund','g_skadi'], 2, 5.0))
  select round((
    coalesce((select sum((array[0.2, 0.6, 1.5])[f.j + 1]) from f where f.ok), 0)
    + coalesce((select sum(s.v) from sets s where (select count(*) from f where f.ok and f.j = s.j and f.k = any(s.ks)) = cardinality(s.ks)), 0)
  )::numeric, 1)::float8
$$;

-- 最快可能秒數：p_village 0～19，w＝雲端存檔裡的武器，p_cx＝圖鑑加成 %；不認得的圖紙回傳 null（不收）
create or replace function public.fk_min(p_village int, w jsonb, p_cx float8) returns float8 language plpgsql immutable as $$
declare bp text := w->>'b'; cat text; base float8; tm float8 := 1; fx boolean; lv int; iv float8;
  hp float8; enh float8; wk float8 := 1; rc float8 := 1; ek text; et int; mel text; hit float8;
  vreq int[] := array[12,14,15,17,19,22,25,28,31,35, 35,36,37,38,39,40,41,42,43,44];
  mon_el text[] := array['ice','ice','dark','ice','dark','toxic','dark','toxic','fire','light','toxic','ice','bolt','dark','ice','toxic','ice','dark','toxic','bolt'];
  mon_race text[] := array['man','undead','beast','beast','undead','beast','giant','giant','man','man','giant','beast','giant','undead','beast','giant','giant','giant','giant','man'];
  enh_m float8[] := array[1,1.1,1.2,1.3,1.4,1.5,1.6,1.9,2.25,2.65,3.3,4,4.8];
  race_pct float8[] := array[0,1,2,3,4,5,6,8,10,12,15,18,21];
  el_m float8[] := array[1.03,1.06,1.1]; el_r float8[] := array[0.97,0.94,0.9];
begin
  if p_village is null or p_village not between 0 and 19 then return null; end if;
  select v.cat, v.base, v.fx into cat, base, fx from (values
    ('w0_sword','sword',12,false),('w0_axe','axe',12,false),('w0_hammer','hammer',12,false),('w0_dual','dagger',12,false),
    ('w0_spear','polearm',12,false),('w0_bow','bow',12,false),('w0_xbow','crossbow',12,false),
    ('w1_spear','polearm',15,false),('w1_sword','sword',15,false),('w1_xbow','crossbow',15,false),
    ('w1_troll','hammer',16.5,false),('g_hofund','sword',17,true),
    ('w2_axe','axe',15,false),('w2_bow','bow',15,false),('w2_dual','dagger',15,false),
    ('w2_utgard','polearm',16.5,false),('g_skadi','hammer',17,true)
  ) as v(id, cat, base, fx) where v.id = bp;
  if cat is null then return null; end if;
  lv := greatest(0, least(12, coalesce(floor((w->>'lv')::float8)::int, 0)));
  iv := case cat when 'sword' then 1 when 'axe' then 1.3 when 'hammer' then 1.8 when 'dagger' then 0.6
                 when 'polearm' then 1.2 when 'bow' then 1.1 else 1.6 end;
  hp := vreq[p_village + 1] * 50;
  enh := enh_m[lv + 1];
  mel := mon_el[p_village + 1];
  ek := w->'ench'->0->>'k';
  if ek in ('fire','ice','bolt','toxic','light','dark') then
    et := greatest(1, least(3, coalesce(floor((w->'ench'->0->>'v')::float8)::int, 0)));
    if ek = (case mel when 'fire' then 'ice' when 'ice' then 'fire' when 'bolt' then 'toxic' when 'toxic' then 'bolt' when 'light' then 'dark' else 'light' end) then wk := el_m[et];
    elsif ek = mel then wk := el_r[et];
    end if;
  end if;
  if (case cat when 'sword' then 'man' when 'dagger' then 'man' when 'polearm' then 'beast' when 'axe' then 'beast'
              when 'hammer' then 'undead' else 'giant' end) = mon_race[p_village + 1] then rc := 1 + race_pct[lv + 1] / 100; end if;
  hit := base * tm * enh * (1 + coalesce(p_cx, 0) / 100) * iv * wk * rc
         * (case when lv > 0 then 2.5 else 1 end) * (case when fx then 1.3 else 1 end) * 1.02 + 1;
  return greatest(0, (ceil(hp / hit) - 1) * iv);
end $$;

create or replace function public.fk_submit(p_sid text, p_village int, p_sec numeric, p_wid bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare adm boolean; mn float8; sv saves; x jsonb; old fk; top fk; c fk_ctr; s numeric(5,1) := round(p_sec, 1); kind text; rk int; n int;
begin
  if auth.uid() is null then return jsonb_build_object('r', 'login'); end if;
  if p_village is null or p_village not between 0 and 89 or s is null or s < 1 or s > 60 then return jsonb_build_object('r', 'bad'); end if;
  select * into sv from saves where user_id = auth.uid();
  if not found or sv.session_id is distinct from p_sid then return jsonb_build_object('r', 'session'); end if;
  if coalesce(sv.data->'villages'->p_village->>'status', '') <> 'cleared' then return jsonb_build_object('r', 'nope'); end if;
  select e into x from jsonb_array_elements(coalesce(sv.data->'weapons', '[]')) e where (e->>'id')::bigint = p_wid limit 1;
  if x is null then return jsonb_build_object('r', 'weapon'); end if;
  insert into fk_ctr (user_id, last) values (auth.uid(), now() - interval '1 minute') on conflict (user_id) do nothing;
  select * into c from fk_ctr where user_id = auth.uid() for update;
  if now() - c.last < interval '3 seconds' then return jsonb_build_object('r', 'slow'); end if;
  update fk_ctr set last = now() where user_id = auth.uid();
  -- v5.38 秒數不能比這把武器「最快可能」還快（管理員帳號略過，跟 save_game 一樣）
  adm := exists (select 1 from admins where user_id = auth.uid());
  if not adm then
    mn := fk_min(p_village, x, fk_cx(sv.data->'codex'));
    if mn is null or s < mn - 0.3 then
      insert into ac_log (user_id, nick, reason, detail) values (auth.uid(), sv.nickname, 'fk_fast',
        jsonb_build_object('village', p_village, 'sec', s, 'min', round(mn::numeric, 1), 'w', x));
      return jsonb_build_object('r', 'fast', 'min', round(mn::numeric, 1));
    end if;
  end if;
  select * into old from fk where user_id = auth.uid() and village = p_village;
  if found and old.sec <= s then
    select count(*)::int + 1 into rk from fk where village = p_village and (sec < old.sec or (sec = old.sec and at < old.at));
    select count(*)::int into n from fk where village = p_village;
    return jsonb_build_object('r', 'kept', 'rank', rk, 'n', n, 'sec', old.sec, 'top', (select min(sec) from fk where village = p_village));
  end if;
  select * into top from fk where village = p_village order by sec, at limit 1;
  insert into fk (user_id, village, sec, w, nick, at)
    values (auth.uid(), p_village, s, jsonb_build_object('b', x->'b', 'q', coalesce(x->'q', '0'), 'lv', coalesce(x->'lv', '0'), 'ench', coalesce(x->'ench', '[]')), coalesce(sv.nickname, '無名鐵匠'), now())
    on conflict (user_id, village) do update set sec = excluded.sec, w = excluded.w, nick = excluded.nick, at = excluded.at;
  if p_village % 10 >= 8 then   -- 每一界第 9、10 關才上跑馬燈
    if top.user_id is null then kind := 'first';
    elsif s < top.sec and top.user_id <> auth.uid() then kind := 'top';
    end if;
    if kind is not null then
      insert into fk_feed (user_id, nick, village, sec, bp, lv, kind) values (auth.uid(), coalesce(sv.nickname, '無名鐵匠'), p_village, s, x->>'b', coalesce((x->>'lv')::int, 0), kind);
      delete from fk_feed where created_at < now() - interval '1 day';
    end if;
  end if;
  select count(*)::int + 1 into rk from fk where village = p_village and (sec < s or (sec = s and user_id <> auth.uid() and at < now()));
  select count(*)::int into n from fk where village = p_village;
  return jsonb_build_object('r', 'ok', 'rank', rk, 'n', n, 'sec', s, 'prev', old.sec, 'top', (select min(sec) from fk where village = p_village), 'kind', kind);
end $$;

revoke all on function public.fk_submit(text, int, numeric, bigint) from public, anon;
grant execute on function public.fk_submit(text, int, numeric, bigint) to authenticated;
revoke all on function public.fk_min(int, jsonb, float8) from public, anon, authenticated;
revoke all on function public.fk_cx(jsonb) from public, anon, authenticated;
create or replace function public.fk_version() returns text language sql immutable as $$ select '5.38'::text $$;
grant execute on function public.fk_version() to authenticated, anon;

notify pgrst, 'reload schema';
-- 執行完用這行確認，應該顯示 5.38、還有 1-1 用鐵爐村鐵劍 +0 最快 45 秒、+12 最快 3 秒：
select public.fk_version() as ver,
  public.fk_min(0, '{"b":"w0_sword","lv":0}'::jsonb, 0) as sword0_min,
  public.fk_min(0, '{"b":"w0_sword","lv":12}'::jsonb, 0) as sword12_min;
