-- v4.37 村莊不限武器類別（武器系統定案）：排行榜上傳不再檢查武器類別，其他檢查不變
-- 要先跑過 08（lb_submit 第二界版本）。不改 save_game、不改 ac_version。
create or replace function public.lb_submit(p_village int, p_p int, p_w jsonb, p_nick text) returns int
language plpgsql security definer set search_path = public as $$
declare w jsonb; sw jsonb; pw int;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if p_village is null or p_village not between 0 and 19 then raise exception 'bad village'; end if;
  w := jsonb_build_object('b', lb_bpid(p_w->>'b'), 'q', coalesce((p_w->>'q')::int, 0), 'lv', coalesce((p_w->>'lv')::int, 0), 'rf', coalesce((p_w->>'rf')::int, 0),
         'traits', coalesce(p_w->'traits', '[]'), 'ench', coalesce(p_w->'ench', '[]'));
  -- 武器必須已經存進雲端存檔（剛鍛造的武器要等下一次自動存檔，前端會稍後重送）
  select x into sw from saves s, jsonb_array_elements(coalesce(s.data->'weapons', '[]')) x
    where s.user_id = auth.uid() and lb_bpid(x->>'b') = w->>'b'
      and coalesce((x->>'q')::int, 0) = (w->>'q')::int and coalesce((x->>'lv')::int, 0) = (w->>'lv')::int and coalesce((x->>'rf')::int, 0) = (w->>'rf')::int
      and coalesce(x->'traits', '[]') = w->'traits' and coalesce(x->'ench', '[]') = w->'ench'
    limit 1;
  if sw is null then raise exception 'weapon not saved'; end if;
  pw := lb_power(w);
  insert into lb (user_id, village, nick, p, w) values (auth.uid(), p_village, left(p_nick, 16), pw, w)
  on conflict (user_id, village) do update set
    nick = excluded.nick,
    p = greatest(lb.p, excluded.p),
    w = case when excluded.p > lb.p then excluded.w else lb.w end,
    updated_at = case when excluded.p > lb.p then now() else lb.updated_at end;
  return pw;
end $$;
grant execute on function public.lb_submit(int, int, jsonb, text) to authenticated;

notify pgrst, 'reload schema';
-- 確認：跑完後執行下面這行，應該顯示 true
-- select prosrc not like '%bad weapon%' from pg_proc where proname = 'lb_submit';
