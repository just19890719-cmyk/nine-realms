/* ===================== 九界鐵匠 v3 自動測試 ===================== */
/* 在沙盒狀態執行：會暫存玩家存檔，跑完還原，不會寫入 localStorage */
function withSandbox(fn){
  const keepS=S,keepClock=CLOCK.offset,keepQ=QUIET;QUIET=true;
  try{return fn()}finally{S=keepS;CLOCK.offset=keepClock;QUIET=keepQ}
}
function T(name,pass,detail){return{name,pass:!!pass,detail:detail||''}}
// v3.70 每日任務／活躍度寶箱／七日簽到
function dailyTests(){return withSandbox(()=>{const res=[];S=sanitize(fresh());
  dailyRoll();const p0=dailyPts();S.stats.enhTry+=5;S.stats.melted+=1;const p1=dailyPts();
  const g0=S.gold,r0=claimBox(0),again=claimBox(0),b2=claimBox(2);
  res.push(T('H1 每日任務進度與活躍度寶箱只領一次',p0===10&&p1===60&&r0&&!again&&!b2&&S.gold===g0+r0.gold,`登入 ${p0} 點；強化＋熔解後 ${p1} 點；40 寶箱 ${r0?rwText(r0):'沒領到'}；重領 ${again?'可以（錯）':'擋下'}；100 寶箱未達成 ${b2?'可領（錯）':'擋下'}`));
  S.daily.d='2000-01-01';const p2=dailyPts();
  res.push(T('H2 換日後每日任務重置',p2===10&&S.daily.box.length===0,`換日後活躍度 ${p2}、已領寶箱 ${S.daily.box.length}`));
  const gems0=S.gems,got=[];for(let d=0;d<8;d++){S.sign.last='';got.push(claimSign())}S.sign.last=today();const dup=claimSign();
  res.push(T('H3 七日簽到每天一次、第 7 天後回到第 1 天',got[3].gems===50&&got[6].gems===100&&got[7].gold===1000&&!dup&&S.gems===gems0+230,`第 4 天 ${rwText(got[3])}；第 7 天 ${rwText(got[6])}；第 8 次 ${rwText(got[7])}；同一天重領 ${dup?'可以（錯）':'擋下'}`));
  {const g0=S.gold,m0=S.gems,t0=S.mats.thor|0;S.gold=6000;S.gems=1000;shopBuyMat('thor','gold',10);const okG=S.gold===0&&(S.mats.thor|0)===t0+10;shopBuyMat('thor','gold',10);const blk=(S.mats.thor|0)===t0+10;shopBuyMat('thor','gems',10);const okM=S.gems===700&&(S.mats.thor|0)===t0+20;
   S.gems=1;shopBuyMat('miron','gems',1);const ceil=S.gems===0;S.gold=g0;S.gems=m0;S.mats.thor=t0;
   res.push(T('H5 v4.59 商城材料：金幣／鑽石扣款、錢不夠擋下、鑽石無條件進位',okG&&blk&&okM&&ceil,`金幣 ${okG}、不夠擋下 ${blk}、鑽石 ${okM}、進位 ${ceil}`))}
  const n0=NEWS.out.length;newsQueue('t2_longsword',12,true);
  res.push(T('H4 測試中強化不會送出跑馬燈公告',NEWS.out.length===n0,`排隊 ${NEWS.out.length-n0} 則`));
  return res})}
// v3.88 世界聊天：輸入檢查、錯誤訊息、封鎖過濾、新訊息不重複計算
function chatTests(){return withSandbox(()=>{const res=[];S=sanitize(fresh());
  const cs=[['大家好',0],['https://abc.com',1],['www.abc.tw',1],['加我 line id abc',1],['0912-345-678',1],['12345678',1],['   ',1],['字'.repeat(61),1],['字'.repeat(60),0],['+12 長劍 3000 金幣',0]];
  const bad=cs.filter(([t,e])=>!!chatPre(t)!==!!e);
  res.push(T('I1 聊天輸入檢查（網址、電話、LINE、字數）',!bad.length,bad.length?'沒擋好：'+bad.map(x=>x[0].slice(0,12)).join('、'):`${cs.length} 項都正確`));
  const m=[chatErrText('slow:3'),chatErrText('muted:10/23 05:58'),chatErrText('lv'),chatErrText('xyz')];
  res.push(T('I2 伺服器回應轉成中文提示',m[0].includes('3 秒')&&m[1].includes('10/23 05:58')&&m[2].includes('Lv.3')&&m[3].includes('失敗'),m.join('／')));
  const keep={rows:CHAT.rows,last:CHAT.last,unread:CHAT.unread};CHAT.rows=[];CHAT.last=0;
  const r=[{id:1,uid:'a',nick:'甲',lv:5,body:'x',mine:false,at:''},{id:2,uid:'b',nick:'乙',lv:5,body:'y',mine:false,at:''},{id:3,uid:'me',nick:'我',lv:5,body:'z',mine:true,at:''}];
  const n1=chatAdd(r),n2=chatAdd(r);S.cbl=[{u:'b',n:'乙'}];const n3=chatAdd([{id:4,uid:'b',nick:'乙',lv:5,body:'w',mine:false,at:''}]);
  const shown=CHAT.rows.filter(x=>!chatBlocked(x.uid)).length;
  res.push(T('I3 新訊息計數不重複、不算自己和封鎖的人',n1===2&&n2===0&&n3===0&&CHAT.last===4&&shown===2,`第一次 ${n1}、重複 ${n2}、封鎖者 ${n3}、顯示 ${shown} 則`));
  Object.assign(CHAT,keep);
  // v3.89 稱號、武器卡、恭喜
  const t0=TITLES.filter(t=>titleLocal(t.k)).length;S.stats.maxLv=12;S.stats.forged[4]=1;const t1=TITLES.filter(t=>titleLocal(t.k)).map(t=>t.k).join(',');
  res.push(T('I4 稱號解鎖條件（+12、傳說）',t0===0&&t1==='smith12,legend',`新存檔 ${t0} 個；+12＋傳說後：${t1}`));
  const h=chatRowHtml({id:9,uid:'a',nick:'甲',lv:5,body:'看',mine:false,at:'',title:'smith12',w:{b:'t2_longsword',q:3,lv:12,traits:[],ench:[]}}),h2=chatRowHtml({id:9,uid:'a',nick:'<b>x',lv:5,body:'<img src=x>',mine:false,at:'',title:'nope'});
  res.push(T('I5 聊天顯示稱號、武器卡，名字和內容會跳脫',h.includes('百鍛名匠')&&h.includes('data-act="chatw"')&&!h2.includes('<img')&&!h2.includes('<b>x')&&!h2.includes('class="tt"'),'檢查 HTML'));
  const sa=chatSysHtml({id:1,uid:'a',nick:'甲',bp:'t2_longsword',lv:12,ok:true,at:'',cheers:2}),sb=chatSysHtml({id:2,uid:'a',nick:'甲',bp:'t2_longsword',lv:12,ok:true,at:'',cheers:2,mine:true}),sc=chatSysHtml({id:3,uid:'a',nick:'甲',bp:'t2_longsword',lv:11,ok:false,at:''});
  res.push(T('I6 恭喜鈕只出現在別人的成功公告',sa.includes('data-act="cheer"')&&!sb.includes('data-act="cheer"')&&sb.includes('2 位鐵匠恭喜你')&&!sc.includes('data-act="cheer"'),'別人／自己／爆裝'));
  // v3.98 公會、好友
  const lvs=[0,999,1000,2999,3000,69999,70000,1e7].map(gdLvOf).join(','),pk=GD_PERK.every(([l,t])=>/金幣/.test(t)?GD_GOLD[l-1]>GD_GOLD[l-2]&&t.includes('+'+GD_GOLD[l-1]+'%'):/首領/.test(t)?GD_BOSS[l-1]>GD_BOSS[l-2]&&t.includes('+'+GD_BOSS[l-1]+'%'):gdCap(l)>gdCap(l-1)&&t.includes(String(gdCap(l))));
  res.push(T('I7 公會等級表（經驗門檻、加成、人數上限）',lvs==='1,1,2,2,3,9,10,10'&&pk&&gdCap(1)===20&&gdCap(5)===30&&gdCap(8)===40,`等級 ${lvs}・加成表${pk?'一致':'不一致'}`));
  const w=makeWeapon('t1_woodaxe',0,3),bo=evtNow().boss;S.villages[0].status='cleared';S.villages[0].weaponId=w.id;S.gd=null;const g0=gph(0,w),d0=bossDmgOf(w,bo);S.gd={id:1,name:'測',emb:'測',lv:10,gold:8,boss:8};const g1=gph(0,w),d1=bossDmgOf(w,bo);S.gd=null;
  res.push(T('I8 公會加成算進狩獵金幣和首領傷害',g1>g0&&Math.abs(g1/g0-(1+(tal('gold')+8)/100)/(1+tal('gold')/100))<.02&&Math.abs(d1-Math.round(d0*1.08))<=1,`金幣 ${g0}→${g1}、首領 ${d0}→${d1}`));
  const kg={d:GD.d,list:GD.list,mk:GD.mk,edit:GD.edit,tab:GD.tab},kf={d:FR.d,tab:FR.tab,find:FR.find};
  GD.mk=false;GD.edit=false;GD.tab='mem';GD.d={g:null,me:{pts:0,don:3,shop:{},cd:null,apps:[]}};GD.list=[{id:1,name:'<img src=x>',emb:'<',lv:1,n:1,cap:20,join_mode:'open',applied:false}];const hl=sheetGuild();
  GD.d={g:{id:1,name:'<b>g',emb:'<',notice:'<script>',join:'open',exp:0,lv:1,gold:0,boss:0,cap:20,n:1,rank:1},role:'lead',me:{pts:0,don:3,shop:{}},mem:[{uid:'u1',nick:'<i>n',lv:3,role:'lead',wk:0,tot:0,at:''}],apps:[{uid:'u2',nick:'<u>a',lv:3,at:''}]};const hh=sheetGuild();
  FR.d={f:[{uid:'u3',nick:'<s>f',lv:3,at:'',g:'<em>'}],in:[],out:[]};FR.tab='f';const hf=sheetFriend();
  Object.assign(GD,kg);Object.assign(FR,kf);
  res.push(T('I9 公會、好友畫面的名字會跳脫',![hl,hh,hf].some(h=>['<img src=x>','<b>g','<script>','<i>n','<u>a','<s>f','<em>'].some(x=>h.includes(x)))&&hh.includes('data-act="gdapp"')&&hl.includes('data-act="gdjoin"'),'公會列表／主頁／好友'));
  return res})}
const near=(a,b,tol)=>Math.abs(a-b)<=tol;

/* ---------- A. 關卡可行性 ---------- */
function minUpgrade(b,req,needAffix){
  // 回傳每個品質達標所需的最低強化等級（不靠烈焰/霜寒）
  const out=[];for(let q=0;q<5;q++){if(b.t===3&&q<2){out.push(null);continue}let need=null;
    for(let lv=0;lv<=MAX_LV;lv++){const p=Math.round(b.base*TIERS[b.t].mult*QUAL[q].m*enhMult(lv));if(p>=req){need=lv;break}}out.push(need)}return out}
function levelCheck(){
  const res=[],rows=[];const sources=new Set(['iron','oak','leather']);
  for(let i=0;i<10;i++){   // 第一界：不靠重鍊；1-10 才算神器；第二界另外在 A12 檢查
    const v=VILLAGES[i],c=i; // 交付第 i 關時已收復 i 關
    const avail=BPS.filter(b=>c>=b.unlock&&(b.t<3||i>=9));   // v4.37 不限類別：任何圖紙都算
    const affixOk=true;   // v4.43 附魔只花金幣，不再需要碎片
    const anv=i>=6?3:i>=3?2:1,keepA=S.anvil;S.anvil=anv;const opts=[];
    for(const b of avail){const mats=Object.keys(recipe(b));if(!mats.every(m=>sources.has(m)))continue;
      const ups=minUpgrade(b,v.req);
      for(let q=0;q<5;q++){const lv=ups[q];if(lv==null)continue;const st=TIERS[b.t].stable,safe=lv<=st,dsteps=Math.max(0,lv-st);
        let pReach=1;for(let n=st+1;n<=lv;n++)pReach*=RATE[n]; // 危險區連續成功的機率（失敗未必爆）
        const pQ=qualWeights(false,b.t).slice(q).reduce((a,x)=>a+x,0)/1000,expForges=pQ?1/pQ:Infinity;
        const ok=q<=2&&expForges<=10&&(safe||(i>=8&&dsteps<=4));
        opts.push({b,q,lv,safe,dsteps,pReach,expForges,ok,score:dsteps*30+q*10+lv})}}
    S.anvil=keepA;opts.sort((a,b)=>(b.ok-a.ok)||a.score-b.score);const best=opts[0]||null;const expForges=best?best.expForges:Infinity;
    rows.push({i,v,best,affixOk,expForges});
    const pass=best&&best.ok&&affixOk;
    res.push(T(`A${i+1} ${vNo(i)} ${v.name}`,pass,best?`${best.b.n}（${TIERS[best.b.t].n}）${QUAL[best.q].n} +${best.lv}${best.safe?'（安定區內）':'（需危險強化 '+best.dsteps+' 階，連續成功率 '+(best.pReach*100).toFixed(0)+'%）'}；鐵砧Lv${anv} 期望鍛造 ${expForges.toFixed(1)} 次`:'沒有可用武器或材料無來源'));
    v.drops.forEach(d=>sources.add(d[0]));
  }
  // 素材循環：每個圖紙的材料是否在其解鎖前就有來源
  const src2=new Set();const bad=[];   // v4.54 開局武器只花金幣，其他材料都要從村莊來
  for(let i=0;i<=VILLAGES.length;i++){BPS.filter(b=>b.unlock===i&&(!b.r||BP_R[b.id])).forEach(b=>{const ms=Object.keys(recipe(b)).filter(m=>!src2.has(m));if(ms.length)bad.push(b.n+'缺'+ms.map(m=>MATS[m]).join('、'))});if(VILLAGES[i])VILLAGES[i].drops.forEach(d=>src2.add(d[0]))}
  // v4.37 村莊不限武器：+0 普通鐵製、沒附魔的武器每一關都能交
  {const w={id:-1,b:'t1_woodaxe',q:0,lv:0,traits:[],ench:[null,null,null,null]},bad=VILLAGES.map((v,i)=>i).filter(i=>!eligible(i,w));
   res.push(T('A12 任何武器都能交付每一關（+0 普通鐵製、沒附魔）',!bad.length,bad.length?'不能交：'+bad.map(vNo).join('、'):'20 關都能交'))}
  res.push(T('A11 材料來源與解鎖順序（無循環、無無法取得素材）',!bad.length,bad.length?bad.join('；'):'所有圖紙在解鎖時，材料都已有來源'));
  return{res,rows};
}

/* ---------- B. 鍛造 ---------- */
function forgeTests(N=100000){
  const res=[];
  withSandbox(()=>{
    S=fresh();
    for(let a=1;a<=5;a++){S.anvil=a;const exp=qualWeights(false,0),sum=exp.reduce((x,y)=>x+y,0),cnt=[0,0,0,0,0];
      for(let n=0;n<N;n++)cnt[rollQuality(false,0)]++;
      const dev=cnt.map((c,i)=>Math.abs(c/N-exp[i]/1000));const ok=sum===1000&&Math.max(...dev)<Math.max(.003,4.5*Math.sqrt(.25/N))&&cnt.every((c,i)=>c>=0);
      res.push(T(`B${a} 鐵砧 Lv${a} 品質機率（${N.toLocaleString()} 次）`,ok,`權重總和 ${sum}/1000；實測 ${cnt.map((c,i)=>QUAL[i].n+' '+(c/N*100).toFixed(2)+'%').join('、')}`))}
    S.anvil=1;const tc=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];let dup=0,outRange=0;const perQ=Math.floor(N/5);
    // v4.37 鍛造特性刪除：新武器不帶特性；舊武器殘留的特性、重鍊等級都不再影響攻擊力、狩獵時間、金幣、掉落
    const nw=[0,1,2,3,4].map(q=>makeWeapon('t2_wolfaxe',q,0)),old={...nw[4],traits:[{k:'light',v:30},{k:'sturdy',v:40},{k:'treasure',v:40},{k:'giantslayer',v:20}],rf:5},neu={...nw[4],traits:[],rf:0};
    const same=[0,7,10].every(i=>timeReduction(i,old)===timeReduction(i,neu)&&goldMul(i,old)===goldMul(i,neu))&&power(old)===power(neu);
    res.push(T('B6 鍛造不再帶特性；舊特性和重鍊等級不再計算',nw.every(w=>!w.traits.length)&&same,`新武器特性 ${nw.map(w=>w.traits.length).join('/')}；舊武器攻擊力 ${power(old)}＝${power(neu)}`));
    // 神器最低稀有、傳說圖紙
    let low=0;for(let n=0;n<20000;n++)if(rollQuality(false,3)<2)low++;let bpOk=true;for(let n=0;n<1000;n++)if(rollQuality(true,0)!==4)bpOk=false;
    res.push(T('B7 神器最低稀有、傳說圖紙必出傳說',!low&&bpOk,`神器低於稀有 ${low} 次；圖紙 ${bpOk?'全部傳說':'有非傳說'}`));
    // 鍛造保底
    S=fresh();S.villages.forEach(v=>v.status='cleared');S.furnace=5;S.slots=4;S.gold=1e9;S.mats.silver=1e6;S.mats.fang=1e6;S.mats.iron=1e6;let maxRun=0,run=0;
    for(let n=0;n<300;n++){const j=forgeStart('t2_wolfaxe',10,false);j.end=0;tick();}
    S.weapons.sort((a,b)=>a.id-b.id).forEach(w=>{if(w.q<2){run++;maxRun=Math.max(maxRun,run)}else run=0});
    res.push(T('B9 霜銀以上鍛造保底（連續 9 把低於稀有，第 10 把保證稀有）',maxRun<=9,`3,000 把霜銀戰斧中，最長連續低於稀有 ${maxRun} 把`));
    // 材料消耗、批量、取消
    S=fresh();S.gold=99999;S.mats.iron=100;S.mats.oak=100;S.villages.forEach((v,i)=>{if(i<5)v.status='cleared'});S.slots=4;
    const before={...S.mats},g0=S.gold;const j=forgeStart('t1_woodaxe',5,false);
    const used=before.iron-S.mats.iron,usedOak=before.oak-S.mats.oak,ug=g0-S.gold;
    cancelJob(S.jobs.indexOf(j));const back=S.mats.iron===before.iron&&S.mats.oak===before.oak&&S.gold===g0;
    const j2=forgeStart('t1_woodaxe',10,false);j2.end=NOW()-1;const n0=S.weapons.length;tick();const n1=S.weapons.length;tick();
    const ids=new Set(S.weapons.map(w=>w.id));
    res.push(T('B8 批量鍛造只扣金幣（v4.43 沒有材料）、取消全額退回、完成只發一次',used===0&&usedOak===0&&ug===goldOf(BP.t1_woodaxe)*5&&back&&n1-n0===10&&S.weapons.length===n1&&ids.size===S.weapons.length,
      `×5 扣鐵礦 ${used}、橡木 ${usedOak}、金幣 ${ug}；取消後${back?'完全退回':'沒有退回'}；×10 完成產出 ${n1-n0} 把，ID 不重複 ${ids.size===S.weapons.length}`));
  });
  return res;
}

/* ---------- C. 強化 ---------- */
function enhanceTests(N=100000){
  const res=[];
  // 純判定：各目標等級
  const rows=[];let ok=true;
  for(let next=1;next<=MAX_LV;next++){const r=RATE[next],bc=next<=6?0:next<=9?1:2/3;let s=0,b=0;
    for(let n=0;n<N;n++){const o=rollEnhance(r,bc);if(o==='ok')s++;else if(o==='break')b++}
    const eb=(1-r)*bc;const tol=Math.max(.003,4.5*Math.sqrt(.25/N));const good=near(s/N,r,tol)&&near(b/N,eb,tol);if(!good)ok=false;rows.push(`+${next} 成功 ${(s/N*100).toFixed(1)}%/${(r*100).toFixed(1)}%、爆 ${(b/N*100).toFixed(1)}%/${(eb*100).toFixed(1)}%`)}
  res.push(T(`C1 強化判定（v4.50 新表，每級 ${N.toLocaleString()} 次）`,ok,rows.join('；')));
  // v4.50 安定值 +6、新成功率／爆裝／倍率表、上限 +12
  withSandbox(()=>{S=fresh();const mk=b=>makeWeapon(b,0,0,[]);
    const t1=mk('t1_woodaxe');const bc=[6,7,9,10,12].map(n=>breakChance(t1,n));
    const mul=ENH_MULT.map((_,i)=>enhMult(i)),spec=[1,1.1,1.2,1.3,1.4,1.5,1.6,1.9,2.25,2.65,3.3,4,4.8];
    const rt=[1,2,3,4,5,6].every(n=>RATE[n]===1)&&near(RATE[7],.35,1e-9)&&near(RATE[8],.325,1e-9)&&near(RATE[9],.3,1e-9)&&[10,11,12].every(n=>near(RATE[n],.01,1e-9))&&RATE.length===MAX_LV+1;
    t1.lv=MAX_LV;const top=enhanceCore(t1.id,{});
    res.push(T('C2 成功率 +1～+6 100%、+7/8/9 35/32.5/30%、+10～+12 1%；失敗後爆裝 +7～+9 100%、+10～+12 2/3；倍率表；最高 +12',
      MAX_LV===12&&stable(t1)===6&&rt&&bc[0]===0&&bc[1]===1&&bc[2]===1&&near(bc[3],2/3,1e-9)&&near(bc[4],2/3,1e-9)&&mul.every((x,i)=>near(x,spec[i],1e-9))&&enhMult(15)===4.8&&!!top.err,
      `爆裝(失敗後) +6 ${bc[0]}、+7 ${bc[1]}、+9 ${bc[2]}、+10 ${bc[3].toFixed(3)}、+12 ${bc[4].toFixed(3)}；倍率 ${mul.map(x=>x.toFixed(2)).join('/')}；+12 再強化「${top.err}」`));
    // 強化石：每次 1 顆、不花金幣、不夠就擋；收成掉落、熔解退 1 顆；駐守武器不能強化
    S=fresh();const g0=S.gold,st0=stones();const w=mk('t1_ironsword');const r1=enhanceCore(w.id,{}),g1=S.gold,s1=stones();
    S.items[STONE]=0;const r0=enhanceCore(w.id,{});
    S.items[STONE]=0;const m=meltCore(w.id);
    const vs={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};for(let c=0;c<40000;c++)rollCycle(19,null,vs,NOW());const late=vs.bank.mats[STONE]|0;
    const v0={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};for(let c=0;c<40000;c++)rollCycle(0,null,v0,NOW());const early=v0.bank.mats[STONE]|0;
    S.villages[0].bank={cycles:3,gold:10,mats:{[STONE]:4},events:0};const k0=stones();collectCore(0);const got=stones()-k0;
    const v=mk('t1_woodaxe');S.villages[0].weaponId=v.id;S.items[STONE]=5;const r2=enhanceCore(v.id,{});
    res.push(T('C3 強化石：每次 1 顆不花金幣、沒有就擋下、收成掉落（越後面越多）收進道具、熔解退 1 顆、駐守不能強化',
      st0===10&&r1.k==='ok'&&s1===9&&g1===g0&&r0.err==='強化石不夠'&&m&&m[STONE]===1&&stoneE(19)>stoneE(0)&&late>50&&early>50&&got===4&&!S.mats[STONE]&&r2.err,
      `新存檔 ${st0} 顆；強化後剩 ${s1} 顆、金幣${g1===g0?'沒變':'有變(錯誤)'}；沒石頭「${r0.err}」；熔解退 ${m&&m[STONE]} 顆；每 4 萬隻 1-1 ${early} 顆、2-10 ${late} 顆；收成進道具 ${got} 顆；駐守「${r2.err}」`));
  });
  // 完整過程模擬：用幾顆強化石、燒幾把 +6
  const journey=(target,runs=20000)=>{let tries=0,reach=0;
    for(let r=0;r<runs;r++){let lv=0;while(lv<target){tries++;const next=lv+1,bc=next<=6?0:next<=9?1:2/3;const o=rollEnhance(RATE[next],bc);
      if(o==='ok')lv++;else if(o==='break')break}if(lv>=target)reach++}
    return`+0→+${target}：成功 ${(reach/runs*100).toFixed(2)}%、平均 ${(tries/runs).toFixed(1)} 顆強化石／把`};
  res.push(T('C4 從 +0 衝到 +6/+7/+8/+9（每項 20,000 把）',true,[6,7,8,9].map(t=>journey(t)).join('；')));
  return res;
}

/* ---------- E. 存檔與漏洞 ---------- */
function saveTests(){
  const res=[];
  withSandbox(()=>{
    // 新存檔
    S=fresh();res.push(T('E1 新存檔結構完整',S.v===3&&S.villages.length===VILLAGES.length&&S.weapons.length===0&&S.stats&&Object.keys(S.mats).length===8&&Object.values(S.mats).every(x=>x===0)&&Object.keys(S.items).join()==='relic_g,relic_b,relic_r,relic_y,estone,enstone,repair'&&RELICS.every(k=>S.items[k]===0)&&S.items.estone===10&&S.items.enstone===3,'v'+S.v));
    // v2 遷移
    const o={gold:999,gems:50,mats:{iron:5,oak:5,leather:5,silver:2,fang:1,scale:0,rune:0,shard:3},items:{scroll:2,bless:0,blueprint:0},furnace:2,anvil:1,slots:1,nextId:3,
      weapons:[{id:1,b:'t1_woodaxe',q:1,lv:3,ench:[{k:'swift',v:8}]},{id:1,b:'t1_farmspear',q:0,lv:2,ench:[]},{id:5,b:'xx_missing',q:0,lv:0}],jobs:[],
      villages:VILLAGES.map((v,i)=>({status:i<2?'cleared':i===2?'open':'locked',weaponId:i===0?1:null,cycleStart:i===0?NOW():null,pending:i===0?5:0})),monthly:{until:0,last:''}};
    S=sanitize(migrateV2(o));S.villages.forEach((st,i)=>{const n=st._pending||0;delete st._pending;const w=st.weaponId!=null&&W(st.weaponId);for(let c=0;c<n;c++)rollCycle(i,w,st)});
    const ids=S.weapons.map(w=>w.id);
    res.push(T('E2 v2 存檔遷移（重複 ID 修正、未知武器移除、累積輪數轉成獎勵）',S.gold===999&&S.weapons.length===2&&new Set(ids).size===2&&S.villages[0].bank.cycles===5&&S.weapons.every(w=>w.ench.length===4&&Array.isArray(w.traits))&&S.nextId>Math.max(...ids),
      `武器 ${S.weapons.length} 把、ID ${ids.join(',')}、1-1 累積 ${S.villages[0].bank.cycles} 輪、nextId ${S.nextId}`));
    // 序列化往返
    const json=JSON.stringify(S),back=sanitize(JSON.parse(json));res.push(T('E3 重整網頁後狀態恢復（JSON 往返一致）',JSON.stringify(back)===json,json.length+' bytes'));
    // 離線恢復、上限
    S=fresh();S.speed=1;S.capH=12;const w=makeWeapon('t1_woodaxe',0,0,[]);deliverCore(0,w.id);const d=gameDur(0,w);
    CLOCK.offset+=d*3+1000;tick();const c3=S.villages[0].bank.cycles;CLOCK.offset+=48*3600000;tick();const cap=S.villages[0].bank.cycles,expCap=capCycles(0,w);
    res.push(T('E4 離線恢復與累積上限',c3===3&&cap===expCap,`經過 3 輪時間得到 ${c3} 輪；離線 48 小時封頂 ${cap}/${expCap} 輪（${S.capH} 小時）`));
    // 重複領取
    const r1=collectCore(0),r2=collectCore(0);res.push(T('E5 同一筆獎勵不能重複領取',r1&&r1.n===cap&&r2===null,`第一次 ${r1&&r1.n} 輪，第二次 ${r2===null?'沒有獎勵':'又領到(錯誤)'}`));
    // 策略切換不刷新
    CLOCK.offset+=d*2+1000;tick();const bk=JSON.stringify(S.villages[0].bank);setStrategy(0,'rare');setStrategy(0,'normal');setStrategy(0,'material');
    res.push(T('E6 切換狩獵策略不會重算或刷新已累積獎勵',JSON.stringify(S.villages[0].bank)===bk,'切換三次後累積內容不變'));
    // 收回不重複
    const g0=S.gold,m0=JSON.stringify(S.mats);recallCore(0);recallCore(0);res.push(T('E7 收回武器不會取得材料',S.gold===g0&&JSON.stringify(S.mats)===m0,'收回兩次，金幣與材料不變'));
    // 時間回撥
    S=fresh();S.speed=1;const w2=makeWeapon('t1_woodaxe',0,0,[]);deliverCore(0,w2.id);const d2=gameDur(0,w2);CLOCK.offset+=d2*2+500;tick();const a=S.villages[0].bank.cycles;
    CLOCK.offset-=3600000;tick();const b=S.villages[0].bank.cycles;CLOCK.offset+=3600000;tick();const c=S.villages[0].bank.cycles;
    res.push(T('E8 裝置時間倒退再恢復，不會重複結算',a===2&&b===2&&c===2&&S.clockWarn===false,`倒退前 ${a} 輪、倒退中 ${b} 輪、恢復後 ${c} 輪。注意：時間往前調（作弊快轉）在沒有伺服器時間的單機版無法阻止，正式版需伺服器驗證。`));
    // 隨機操作模糊測試：不會負數、ID 不重複、駐守唯一
    S=fresh();S.speed=60;S.gold=3000;S.mats.iron=50;S.mats.oak=50;S.mats.leather=50;S.mats.shard=20;S.villages.forEach(v=>v.status='cleared');S.furnace=2;S.mats.silver=30;S.mats.fang=30;S.slots=4;let errs=0;
    const acts=[()=>forgeStart(BPS[rnd(0,20)].id,[1,5,10][rnd(0,2)],false),()=>{S.jobs.forEach(j=>j.end=NOW())},()=>tick(),()=>{const w=S.weapons[rnd(0,S.weapons.length-1)];if(w)enhanceCore(w.id,{scroll:true,bless:true})},
      ()=>{const w=S.weapons[rnd(0,S.weapons.length-1)];if(w)meltCore(w.id)},()=>{const w=S.weapons[rnd(0,S.weapons.length-1)];if(w)deliverCore(rnd(0,9),w.id)},()=>recallCore(rnd(0,9)),()=>collectCore(rnd(0,9)),
      ()=>setStrategy(rnd(0,9),['normal','material','rare'][rnd(0,2)]),()=>{CLOCK.offset+=rnd(0,600000)},()=>cancelJob(0),()=>{const w=S.weapons[0];if(w)enchantCore(w.id,rnd(0,3))}];
    for(let n=0;n<3000;n++){acts[rnd(0,acts.length-1)]();
      const neg=S.gold<0||S.gems<0||S.slag<0||Object.values(S.mats).some(x=>x<0)||Object.values(S.items).some(x=>x<0);
      const ids=S.weapons.map(w=>w.id),posts=S.villages.map(v=>v.weaponId).filter(x=>x!=null);
      if(neg||new Set(ids).size!==ids.length||new Set(posts).size!==posts.length||posts.some(id=>!W(id)))errs++}
    res.push(T('E9 3,000 次隨機操作：無負數、ID 不重複、同一把武器不會同時駐守兩村、熔解後真正消失',!errs,`異常 ${errs} 次；最終武器 ${S.weapons.length} 把`));
    // v4.44 屬性附魔：只有 1 欄、重抽覆蓋、扣費正確、等級機率 70：25：5、6 種平均、不加攻擊力
    S=fresh();S.gold=1e9;S.items.enstone=1e5;const x=makeWeapon('t2_wolfaxe',2,0,[]);const p0=power(x),cnt={},tc=[0,0,0,0];
    let brk=0;const ot=S.tut;S.tut=99;for(let n=0;n<6000;n++){if(isBroken(x)){S.items.repair=1;repairCore(x.id)}enchantCore(x.id,0);const e=x.ench[0];if(e.k==='broken'){brk++;continue}cnt[e.k]=(cnt[e.k]||0)+1;tc[e.v]++}const ok6=6000-brk;   // v4.83 破損 5% 另外算
    if(isBroken(x)){S.items.repair=1;repairCore(x.id)}const g1=S.gold,n1=S.items.enstone;DEV.elForce=['fire',1];enchantCore(x.id,0);const n2=S.items.enstone,e2=enchantCore(x.id,1),e3=enchantCore(x.id,3);S.items.enstone=0;const e4=enchantCore(x.id,0);
    const even=Object.keys(ELEM).every(k=>Math.abs((cnt[k]||0)/ok6-1/6)<.025),tierOk=Math.abs(tc[1]/ok6-.7)<.03&&Math.abs(tc[2]/ok6-.25)<.03&&Math.abs(tc[3]/ok6-.05)<.015&&Math.abs(brk/6000-BRK_P)<.012;S.tut=ot;
    res.push(T('E10 屬性附魔：1 欄、重抽覆蓋、扣 1 顆附魔石＋金幣（沒有就擋下）、6 種平均、等級 70／25／5、不加攻擊力',x.ench.length===4&&!x.ench[1]&&!x.ench[2]&&!x.ench[3]&&g1-S.gold===enchCost(x)&&n1-n2===1&&e4.err==='附魔石不夠'&&e2.err&&e3.err&&even&&tierOk&&power(x)===p0,
      `6000 次（破損 ${brk}）：${Object.keys(ELEM).map(k=>ELEM[k].n+' '+(cnt[k]||0)).join('、')}；等級 ${tc[1]}／${tc[2]}／${tc[3]}；第 2 格「${e2.err||'可用(錯)'}」；攻擊力 ${p0}→${power(x)}`));
    // v4.83 奧丁之咒：不能駐守／挑戰／強化／上架／登錄圖鑑／再附魔，解咒石解咒變無屬性，載入不會被清掉
    {S=fresh();S.gold=1e6;S.items.enstone=5;const b=makeWeapon('t2_wolfaxe',2,3,[],[{k:'broken',v:1},null,null,null]),c={...b,ench:[{k:'broken',v:1},null,null,null]};elemCleanW(c);
     const d=makeWeapon('t2_wolfaxe',2,3,[]),stkOk=wKey(b)!==wKey(d)&&wSame(b)===1;const el=eligible(0,b),sell=mkSellable(b),eh=enhanceCore(b.id,{}),en=enchantCore(b.id,0),r0=repairCore(b.id);S.items.repair=1;const r1x=repairCore(b.id);
     res.push(T('E12 奧丁之咒與矮人解咒石',!el&&!sell&&!!eh.err&&!!en.err&&!!r0.err&&r1x.ok&&!b.ench[0]&&isBroken(c)&&(S.items.repair|0)===0&&eligible(0,b)&&!elemOf(c)&&stkOk,
      `駐守 ${el}、上架 ${sell}、強化「${eh.err}」、附魔「${en.err}」、沒石頭修「${r0.err}」、解咒後 ${JSON.stringify(b.ench[0])}、載入保留 ${isBroken(c)}、跟同款分開疊 ${stkOk}`))}
    // v4.44 舊附魔載入時清空、弱點倍率
    {const w={id:1,b:'t1_woodaxe',q:0,lv:0,ench:[{k:'flame',v:10},{k:'giant',v:30},{k:'fire',v:2},null]},w2={id:2,b:'t1_woodaxe',q:0,lv:0,ench:[{k:'ice',v:3},null,null,null]},w3={id:3,b:'t1_woodaxe',q:0,lv:0,ench:[{k:'bolt',v:9},null,null,null]};elemCleanW(w);elemCleanW(w2);elemCleanW(w3);
     const m9=weakMul(8,w2),m9f=weakMul(8,{ench:[{k:'fire',v:3}]}),m0=weakMul(0,w2),m19=weakMul(19,{ench:[{k:'toxic',v:1}]}),m19b=weakMul(19,{ench:[{k:'bolt',v:2}]}),m1d=weakMul(0,{ench:[{k:'dark',v:3}]}),mn=weakMul(8,{ench:[null]});
     res.push(T('E11 舊附魔清空、v4.80 弱點與同屬性抗性：火焰騎兵（1-9）怕永凍之霜 ×1.1、滅世之焰抗性 ×0.9；索爾（2-10）怕蝕毒 ×1.03、雷鳴抗性 ×0.94；1-1 冰怪拿永凍之霜 ×0.9、拿暗屬性 ×1',!w.ench.some(Boolean)&&w2.ench[0].v===3&&!w3.ench[0]&&m9===1.1&&m9f===.9&&m0===.9&&m19===1.03&&m19b===.94&&m1d===1&&mn===1&&MON_EL.length===VILLAGES.length&&MON_EL.every(k=>ELEM[k]),`舊武器剩 ${w.ench.filter(Boolean).length} 個；1-9 冰×${m9} 火×${m9f}、1-1 冰×${m0} 暗×${m1d}、2-10 毒×${m19} 雷×${m19b}`))}
    // v4.43 祈願、旅行商人、殘渣兌換、舊道具與材料全部刪除
    const gone=['pullCore','slagTrade','buyMat','sellMat','buyItem'].filter(f=>typeof globalThis[f]==='function'||(()=>{try{return typeof eval(f)==='function'}catch(e){return false}})());
    res.push(T('E12 祈願、商人、殘渣兌換已刪除',!gone.length,gone.length?'還在：'+gone.join('、'):'都已拿掉'));
    // 收藏鎖定與容量
    S=fresh();S.gold=1e6;S.mats.iron=1e4;S.mats.oak=1e4;const lk=makeWeapon('t1_woodaxe',0,0,[]);lk.lock=true;const m1=meltCore(lk.id);
    while(S.weapons.length<CAP_WEAPONS)makeWeapon('t1_woodaxe',0,0,[]);const f1=forgeStart('t1_woodaxe',1,false);
    res.push(T('E14 收藏武器不能熔解、武器庫滿 200 把不能再鍛造',m1===null&&!!W(lk.id)&&typeof f1==='string',`收藏熔解${m1===null?'被擋下':'成功(錯誤)'}；滿倉鍛造：${typeof f1==='string'?f1:'成功(錯誤)'}`));
    // v4.54 新材料 8 種、道具＝4 種遺物＋強化石＋附魔石、每界村莊掉該界材料、開局武器只花金幣；獎勵只有金幣鑽石
    const rw=[...ACH.map(a=>a.r),...SIGN,...DAILY_BOX.map(x=>x[1]()),repBox(10)].every(r=>Object.keys(r).every(k=>k==='gold'||k==='gems'));
    res.push(T('E13 新材料 8 種、道具 7 種，每關掉該界材料，開局武器只花金幣，獎勵只剩金幣和鑽石',Object.keys(MATS).length===8&&Object.keys(ITEMS).join()==='relic_g,relic_b,relic_r,relic_y,estone,enstone,repair'&&RELICS.length===4&&VILLAGES.every((v,i)=>v.drops.filter(d=>d[1]===.5).map(d=>d[0]).join()===REALM_MAT[Math.floor(i/10)].join())&&BPS.filter(b=>!b.dev&&!b.unlock).every(b=>!Object.keys(recipe(b)).length)&&rw&&!GD_SHOP.length&&GD_DON.every(x=>x.k!=='iron'),
      `材料 ${Object.keys(MATS).length} 種；道具 ${Object.keys(ITEMS).map(itemName).join('、')}；獎勵${rw?'只有金幣鑽石':'還有舊道具(錯誤)'}`));
  });
  return res;
}

/* ---------- D. 經濟模擬 ---------- */
const PROFILES={
  casual:{n:'A 免費休閒（每天 2 次）',logins:[8,21],session:10,risk:.15},
  active:{n:'B 免費活躍（每天 5 次）',logins:[8,12,16,19,22],session:15,risk:.3},
  monthly:{n:'C 月卡（每天 3 次）',logins:[8,13,21],session:15,risk:.3,monthly:true},
  whale:{n:'D 高投入（每天 5 次＋大量鑽石）',logins:[8,12,16,19,22],session:20,risk:.6,monthly:true,whale:true}
};
function aiForgeFor(cat,M){
  const cands=BPS.filter(b=>b.cat===cat&&cleared()>=b.unlock&&b.t<3).sort((a,b)=>b.base*TIERS[b.t].mult-a.base*TIERS[a.t].mult);
  for(const b of cands){
    if(S.furnace<TIERS[b.t].furnace){const c=FURNACE_COST[S.furnace];if(S.gold>=c){S.gold-=c;S.furnace++}else continue}
    if(S.furnace<TIERS[b.t].furnace)continue;
    const c=recipe(b);if(b.t===0){for(const k in c){const lack=c[k]-S.mats[k];if(lack>0){const p=8;if(S.gold>=lack*p+TIERS[0].gold){S.gold-=lack*p;S.mats[k]+=lack}}}}
    if(!S.jobs.length&&hasMats(c)&&S.gold>=TIERS[b.t].gold){forgeStart(b.id,1,S.items.blueprint>0);M.forgedTry++;return true}
    if(b.t>0)return false;// 高階材料不足就等
  }
  return false;
}
function aiSession(P,M){
  // 收成、月卡、課金行為
  S.villages.forEach((st,i)=>collectCore(i));
  if(P.monthly){if(!monthlyOn()){S.monthly.until=NOW()+30*864e5;S.gems+=300;M.paid+=150}if(S.monthly.last!==today()){S.monthly.last=today();S.gems+=50}}
  if(P.whale){if(!M.paidToday[today()]){M.paidToday[today()]=1;S.gems+=1280;M.paid+=590}
    if(S.items.scroll<3&&S.gems>=30){S.gems-=30;S.items.scroll++}
    const hunting=S.villages.some(st=>st.weaponId!=null);if(hunting&&S.gems>=50){S.gems-=50;S.villages.forEach((st,i)=>{const w=st.weaponId!=null&&W(st.weaponId);if(w){const k=Math.min(capCycles(i,w)-st.bank.cycles,Math.max(1,Math.floor(1800000/gameDur(i,w))));for(let c=0;c<k;c++)rollCycle(i,w,st)}});S.villages.forEach((st,i)=>collectCore(i))}}
  else if(P.monthly&&S.items.scroll<1&&S.gems>=230){S.gems-=30;S.items.scroll++}
  ACH.forEach(a=>claimAch(a.id));
  // 目標關卡
  const i=S.villages.findIndex(v=>v.status==='open');
  if(i>=0){const v=VILLAGES[i];
    let ws=S.weapons.filter(w=>bpOf(w).cat===v.cat&&where(w)<0).sort((a,b)=>power(b)-power(a));
    const ok=ws.find(w=>eligible(i,w));if(ok){deliverCore(i,ok.id);M.clearDay[i]=M.day}
    else{
      let w=ws[0];
      // 先選有潛力的（安定區內能達標）
      const pot=ws.find(x=>power(x,Math.max(x.lv,stable(x)))>=v.req*(v.need?1:1));if(pot)w=pot;
      if(w&&power(w)<v.req){
        while(w&&W(w.id)&&power(w)<v.req){
          const next=w.lv+1,danger=next>stable(w),cost=enhCost(w);if(stones()<cost)break;
          if(danger){const canReach=power(w,Math.min(MAX_LV,stable(w)+2))>=v.req;if(!canReach)break;
            const useScroll=S.items.scroll>0;if(!useScroll&&Math.random()>P.risk)break;
            const r=enhanceCore(w.id,{scroll:useScroll,bless:P.whale&&S.items.bless>0});if(r.k==='broke'){M.breaks++;break}if(r.k!=='ok')break}
          else{const r=enhanceCore(w.id,{});if(r.err)break}
        }
      }
      const ok2=S.weapons.find(x=>eligible(i,x)&&where(x)<0);if(ok2){deliverCore(i,ok2.id);M.clearDay[i]=M.day}
      else{const hopeless=!w||!W(w.id)||power(w,Math.max(w.lv,stable(w)))<v.req;if(hopeless||ws.length<2)aiForgeFor(v.cat,M)}
      // 缺高階材料時改稀有追蹤
      const needScale=BPS.some(b=>b.cat===v.cat&&b.t===2&&cleared()>=b.unlock);
      S.villages.forEach((st,k)=>{if(st.weaponId==null)return;const hasRare=VILLAGES[k].drops.some(d=>d[1]<RARE_P&&['scale','rune','silver','fang'].includes(d[0]));
        const want=(needScale&&hasRare&&(S.mats.scale<2||S.mats.rune<2))?'rare':'normal';if(st.strat!==want)setStrategy(k,want)});
    }
  }
  // 用更強的閒置武器替換已收復村莊
  S.villages.forEach((st,k)=>{if(st.status!=='cleared')return;const cur=st.weaponId!=null&&W(st.weaponId);const better=S.weapons.filter(x=>where(x)<0&&eligible(k,x)&&(!cur||power(x)>power(cur)*1.15)).sort((a,b)=>power(b)-power(a))[0];if(better)deliverCore(k,better.id)});
  // 有餘裕時衝高已收復村莊的武器（收入、爆裝數據）
  if(S.gold>20000){const cand=S.weapons.filter(w=>where(w)<0&&w.lv<12).sort((a,b)=>power(b)-power(a))[0];
    if(cand){for(let n=0;n<6&&W(cand.id);n++){const next=cand.lv+1,danger=next>stable(cand);if(stones()<enhCost(cand))break;
      if(danger&&!(S.items.scroll>0)&&Math.random()>P.risk)break;const r=enhanceCore(cand.id,{scroll:danger&&S.items.scroll>0});if(r.k==='broke'){M.breaks++;break}}}}
  // 賣掉多餘的一階材料
  // 工坊投資（留下強化預算）
  const needF=cleared()>=5&&S.furnace<4?FURNACE_COST[S.furnace]:0;const reserve=(i>=0?600:0)+needF;
  if(needF&&S.gold>=needF){S.gold-=needF;S.furnace++}
  if(S.anvil<5&&S.gold>=ANVIL_COST[S.anvil]+reserve&&cleared()>=2){S.gold-=ANVIL_COST[S.anvil];S.anvil++}
  // 中後期：批量鍛造＋熔解雜兵（大量鍛造需求）
  if(bulkOn()&&S.gold>reserve+(i>=0?30000:5000)&&!S.jobs.length){const b=BPS.find(x=>x.id==='t1_woodaxe');forgeStart(b.id,5,false)}
  S.weapons.filter(w=>w.q<=1&&w.lv===0&&where(w)<0&&!(w.traits||[]).length).slice(0,-2).forEach(w=>meltCore(w.id));
}
function simulate(key,days=30,capH=12){
  return withSandbox(()=>{
    const P=PROFILES[key];S=fresh();S.speed=1;S.capH=capH;const base=Date.now();CLOCK.offset=0;
    const M={day:0,clearDay:{},breaks:0,forgedTry:0,paid:0,paidToday:{},snap:{}};const checkpoints=[1,3,7,14,30];let lastClear=0,stuck=0;
    const setT=ms=>{CLOCK.offset=base+ms-Date.now()};
    for(let d=0;d<days;d++){M.day=d+1;
      for(const h of P.logins){for(let s=0;s<P.session;s+=5){setT(((d*24)+(h-8))*3600000+s*60000);tick();aiSession(P,M)}}
      const c=cleared();if(c>lastClear){lastClear=c;stuck=0}else if(c<10)stuck++;M.maxStuck=Math.max(M.maxStuck||0,stuck);
      if(checkpoints.includes(d+1)){const f=S.stats.forged;M.snap[d+1]={cleared:c,goldIn:S.stats.goldIn,gold:S.gold,forged:f.slice(),forgedSum:f.reduce((a,b)=>a+b,0),enhTry:S.stats.enhTry,enhFail:S.stats.enhFail,breaks:S.stats.breaks,
        scrollUsed:S.stats.scrollUsed,maxLv:S.stats.maxLv,furnace:S.furnace,anvil:S.anvil,slots:S.slots,stuckDays:stuck,maxStuck:M.maxStuck=Math.max(M.maxStuck||0,stuck),mats:{...S.mats},paid:M.paid,harvest:S.stats.harvest}}
    }
    M.clearDays=Object.entries(M.clearDay).map(([i,d])=>'1-'+(+i+1)+':D'+d).join(' ');return M;
  });
}
function econReport(capH=12){
  const out={};for(const k in PROFILES)out[k]=simulate(k,30,capH);return out;
}

/* ---------- F. v3.2 強化規格驗證（固定隨機種子，可重現） ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const keep=Math.random;Math.random=mulberry32(seed);try{return fn()}finally{Math.random=keep}}
function specTests(seed=20261020,N=200000){
  const res=[],rows=[];
  withSandbox(()=>withSeed(seed,()=>{
    S=fresh();
    const cases=[['鐵製','t1_ironsword',6,false],['鐵製','t1_ironsword',9,false],['霜銀','t2_longsword',5,false],['龍鱗','t3_greatsword',3,false],['神器','m_firegiant',0,false],['神器','m_firegiant',9,false],['鐵製','t1_ironsword',9,true]];
    for(const[tn,bid,lv,bless] of cases){
      const w={b:bid,q:2,lv,traits:[],ench:[null,null,null,null]};const next=lv+1;
      const r=Math.min(1,RATE[next]+(bless?.1:0)),bc=breakChance(w,next),exp=(1-r)*bc;
      let ok=0,br=0;for(let n=0;n<N;n++){const o=rollEnhance(r,bc);if(o==='ok')ok++;else if(o==='break')br++}
      const tol=4.5*Math.sqrt(.25/N);const pass=near(ok/N,r,tol)&&near(br/N,exp,tol);
      rows.push(`${tn} +${lv}→+${next}${bless?'（祝福石）':''}：成功 ${(ok/N*100).toFixed(2)}%（設定 ${(r*100).toFixed(1)}%）、失敗後爆裝 ${(bc*100).toFixed(0)}%、單次爆裝 ${(br/N*100).toFixed(2)}%（設定 ${(exp*100).toFixed(2)}%）`);
      res.push(T(`F 機率 ${tn} +${lv}→+${next}${bless?' 祝福石':''}`,pass,rows[rows.length-1]));
    }
    // 安定區爆裝率必須為 0
    const safe=[['t1_ironsword',6],['t2_longsword',6],['t3_greatsword',6],['m_firegiant',6],['t4_sword',6]].every(([b,st])=>{for(let n=1;n<=st;n++)if(breakChance({b},n)!==0)return false;return breakChance({b},st+1)===1});
    res.push(T('F 安定值內爆裝率 0%，超過安定值失敗就爆（v4.50）',safe,'鐵製、霜銀、龍鱗、神器、巨人 安定值都是 +6，全部符合'));
    // 倍率表
    const tbl=[1,1.1,1.2,1.3,1.4,1.5,1.6,1.9,2.25,2.65,3.3,4,4.8];
    res.push(T('F 強化倍率（+0～+12 對照規格表）',tbl.every((x,i)=>near(enhMult(i),x,1e-9)),tbl.map((x,i)=>'+'+i+' '+enhMult(i).toFixed(2)).join('、')));
    // 費用一致；v4.43 祝福石、防爆卷刪除：勾了也不扣、不加成功率
    S=fresh();S.gold=1e7;const w=makeWeapon('t1_ironsword',0,9,[]);
    const c=enhCost(w),g0=S.gold,s0=stones();const r1=enhanceCore(w.id,{bless:true,scroll:true});
    const costOk=s0-stones()===c&&c===1&&S.gold===g0&&!r1.err&&!r1.usedBless&&!r1.usedScroll&&r1.k!=='saved';
    res.push(T('F 每次 1 顆強化石、不扣金幣、祝福石／防爆卷已刪除',costOk,`+9 用掉 ${s0-stones()} 顆；金幣${S.gold===g0?'沒變':'有變(錯誤)'}；結果 ${r1.k}；祝福 ${!!r1.usedBless}、防爆 ${!!r1.usedScroll}`));
    // 攻擊力同步
    S=fresh();S.gold=1e9;const y=makeWeapon('t2_longsword',3,5,[]);y.ench[0]={k:'fire',v:2};const pre=power(y,6);let o;do{o=enhanceCore(y.id,{scroll:true})}while(o.k!=='ok'&&W(y.id));
    res.push(T('F 強化介面預估攻擊力＝成功後實際攻擊力',!W(y.id)||power(y)===pre||y.lv!==6,`預估 ${pre}，實際 ${W(y.id)?power(y):'—'}`));
    // 測試武器與指定結果不動正式資源
    S=fresh();S.gold=500;const tw=makeWeapon('t3_greatsword',2,5,[]);tw.test=true;const snap=JSON.stringify([S.gold,S.items,S.stats]);
    const f1=enhanceCore(tw.id,{force:'saved'}),f2=enhanceCore(tw.id,{force:'fail'}),f3=enhanceCore(tw.id,{force:'ok',bless:true}),f4=enhanceCore(tw.id,{force:'break',scroll:true});
    res.push(T('F 開發工具指定結果只作用於測試武器，不扣正式資源',f1.k==='saved'&&f2.k==='fail'&&f3.k==='ok'&&f4.k==='broke'&&!W(tw.id)&&snap===JSON.stringify([S.gold,S.items,S.stats]),`指定 防爆→${f1.k}、失敗→${f2.k}、成功→${f3.k}、爆裝→${f4.k}；資源與統計${snap===JSON.stringify([S.gold,S.items,S.stats])?'完全沒變':'有變動(錯誤)'}`));
    S.gold=1e9;S.items[STONE]=1e6;let nb=0;for(let n=0;n<300;n++){const nw=makeWeapon('t1_ironsword',0,0,[]);if(enhanceCore(nw.id,{force:'break'}).k==='broke')nb++;S.weapons=[]}
    res.push(T('F 正式武器忽略指定結果',nb===0,'正式 +0 武器指定「爆裝」300 次，實際爆裝 '+nb+' 次（安定區照規則不會爆）'));
  }));
  return{res,rows};
}

/* ---------- I. v3.71 鐵匠聲望／天賦 ---------- */
function repTests(){const res=[];
  withSandbox(()=>{QUIET=false;repGain.mute=true;try{
    S=fresh();S=sanitize(S);const g0=S.gold;let need=0;for(let l=1;l<5;l++)need+=repNeed(l);const up=repGain(need);
    res.push(T('I1 聲望升級：經驗剛好升 4 級、天賦點 4、寶箱只給金幣',up===4&&S.rep.lv===5&&S.rep.xp===0&&repPts()===4&&S.gold===g0+100*(2+3+4+5),`Lv.${S.rep.lv}、點數 ${repPts()}、金幣 +${S.gold-g0}`));
    let e1='';for(let n=0;n<4;n++)e1=talentUp('gold')||e1;const e2=talentUp('gold');
    res.push(T('I2 天賦點用完不能再點、上限擋住',!e1&&e2==='天賦點不夠'&&S.rep.t.gold===4&&repPts()===0,`商隊議價 Lv${S.rep.t.gold}，第 5 次：${e2}`));
    S.rep.t.qual=20;const q=qualWeights(false,0),sum=q.reduce((a,b)=>a+b,0);
    res.push(T('I3 天賦拿掉：巨匠之手滿級也不影響品質權重（總和 1000）',Math.round(sum)===1000&&q[0]===QW[0],`權重 ${q.map(x=>Math.round(x)).join('/')}，總和 ${Math.round(sum)}`));
    {const s0=S;S=fresh();S.villages.forEach(v=>v.status='cleared');S.furnace=6;S.gold=1e9;S.slots=4;
      const big=BPS.filter(b=>b.t===4)[0];for(const k of new Set([...Object.keys(S.mats),...Object.keys(recipe(big))]))S.mats[k]=1e6;const j1=forgeStart(big.id,1,false),e1=forgeStart('t1_woodaxe',1,false);const d1=j1.end-j1.start;j1.end=0;tick();const j10=forgeStart('t1_woodaxe',10,false),d10=j10.end-j10.start;
      const o=sanitize(JSON.parse(JSON.stringify({...S,jobs:[{b:'t3_halberd',qty:1,start:1000,end:1000+240000}]})));S=s0;
      res.push(T('I4 鍛造一律 5 秒、一次一批，舊存檔的長鍛造縮成 5 秒',d1===FORGE_SEC*1000&&d10===FORGE_SEC*1000&&typeof e1==='string'&&o.jobs[0].end===1000+FORGE_SEC*1000&&!('forge' in TALENTS),
        `巨人武器 ${d1/1000} 秒、伐木斧 ×10 ${d10/1000} 秒；鍛造中再開：${e1}；舊存檔結束時間 ${(o.jobs[0].end-1000)/1000} 秒後`))}
    const x=sanitize(JSON.parse(JSON.stringify({...S,rep:{lv:'abc',xp:-5,t:{gold:999,forge:-3,zz:5}}})));
    res.push(T('I5 存檔修正：壞掉的聲望資料會被解咒',x.rep.lv===1&&x.rep.xp===0&&x.rep.t.gold===TALENTS.gold.max&&!('forge' in x.rep.t)&&!('zz' in x.rep.t),JSON.stringify(x.rep)));
  }finally{repGain.mute=false}});
  return res}

/* ---------- J. v3.72 每週限時活動 ---------- */
// v3.76 第二界約頓海姆＋巨人體重鍊
// v4.16 附魔與祈願隨關卡開放
function unlockTests(){return withSandbox(()=>{const res=[];S=sanitize(fresh());
  res.push(T('U1 屬性附魔開局就能用、不按關卡學會（舊符文詞條表已刪）',typeof affPool==='undefined'&&typeof AFFIX==='undefined'&&Object.keys(ELEM).length===6,'6 種屬性開局就抽得到'));
  return res})}
function realm2Tests(){const res=[];
  withSandbox(()=>{
    S=fresh();S.speed=1;
    const o=JSON.parse(JSON.stringify(S));o.villages=o.villages.slice(0,10);o.villages.forEach(v=>v.status='cleared');o.weapons=[{id:1,b:'t3_greataxe',q:2,lv:3,rf:9,traits:[],ench:[null,null,null,null]},{id:2,b:'t1_woodaxe',q:0,lv:0,rf:3,traits:[],ench:[]}];o.nextId=3;
    const s=sanitize(o);
    res.push(T('K1 舊存檔補上第二界、收復 1-10 後 2-1 自動開放',s.villages.length===20&&s.villages[10].status==='open'&&s.villages[11].status==='locked',`村莊 ${s.villages.length}；2-1 ${s.villages[10].status}`));
    res.push(T('K2 關卡編號 1-1／1-10／2-1／2-10',[0,9,10,19].map(vNo).join(',')==='1-1,1-10,2-1,2-10',[0,9,10,19].map(vNo).join(',')));
    S=s;const w=makeWeapon('t3_greataxe',2,3,[]),p0=power(w);w.rf=5;
    const h=sheetWeapon(w.id,'main');
    res.push(T('K3 巨人體重鍊已拿掉：舊的重鍊等級不加攻擊力、武器詳情沒有重鍊按鈕',power(w)===p0&&!/重鍊|data-m="rf"/.test(h),`攻擊力 ${p0}→${power(w)}`));
  });
  return res}
// v4.38 首領先關掉：照樣把首領邏輯測一遍（暫時打開），另外確認關掉時沒有入口、武器不會被首領佔住
function evtTests(){const b0=BOSS_OFF;let r;BOSS_OFF=false;try{r=evtTests0()}finally{BOSS_OFF=b0}
  const S0=S;S=fresh();const w=makeWeapon('t1_woodaxe',0,0,[]);S.evt={wk:evtNow().wk,dmg:0,gs:0,slots:[{id:w.id,at:NOW(),pw:10},null,null]};const off=BOSS_OFF&&evtBanner()===''&&bossSlotOf(w)<0&&!bossDot()&&evtSt().slots.every(x=>!x);S=S0;
  return[...r,T('J0 首領討伐關閉：村莊頁沒有橫幅、駐守的武器放回武器庫',!!off,off?'正常':'還看得到首領或武器被佔住')]}
function evtTests0(){const res=[];
  withSandbox(()=>{const keepW=EVT_WK;try{
    // v3.87 整週首領：台灣時間週日 00:00 換週；取消雙倍收成
    const sun=Date.UTC(2026,9,25,0,0)-TZ8,sat=sun-60e3,mon=sun+DAY,nsun=sun+7*DAY;
    res.push(T('J1 台灣時間週日 00:00 換週、首領整週開打',evtWeek(sat)+1===evtWeek(sun)&&evtWeek(mon)===evtWeek(sun)&&evtWeek(nsun)===evtWeek(sun)+1&&evtStart(evtWeek(sun))===sun&&evtNow().k==='boss',`週六 23:59＝${evtWeek(sat)}、週日 0 點＝${evtWeek(sun)}、週一＝${evtWeek(mon)}`));
    S=fresh();S.villages[5].strat='normal';const st=S.villages[5];const MR=Math.random;Math.random=()=>.5;rollCycle(5,null,st,mon);const g1=st.bank.gold;st.bank={cycles:0,gold:0,mats:{},events:0};rollCycle(5,null,st,mon+4*DAY);Math.random=MR;   // v4.69 每關金幣都是範圍隨機：固定亂數比較   // v4.66 1-1～1-5 金幣改範圍隨機，改用 1-6
   const g2=st.bank.gold;
    res.push(T('J2 取消雙倍收成：週一和週五收成金幣一樣',g1===g2&&g2===KILL_GOLD[5][0]+Math.floor(.5*(KILL_GOLD[5][1]-KILL_GOLD[5][0]+1)),`週一 ${g1}、週五 ${g2}`));
    S=fresh();S.gold=0;const w=makeWeapon('t3_greatsword',3,8,[]);const b=evtNow().boss,d0=bossDmgOf(w,b);
    // v3.85 駐守首領：最多 3 把、按時間累積、駐守中不能打村莊／強化／熔解、收回會結算；v3.87 換週武器留著、傷害歸零
    const w2=makeWeapon('t3_greatsword',2,5,[]),w3=makeWeapon('t2_longsword',1,3,[]),w4=makeWeapon('t2_longsword',1,2,[]);
    const iv=VILLAGES.findIndex(x=>x.cat===bpOf(w2).cat&&!x.need&&power(w2)>=x.req);S.villages[iv].status='open';const dv=deliverCore(iv,w2.id);
    const p1=bossPostCore(w.id),p2=bossPostCore(w2.id),p3=bossPostCore(w3.id),p4=bossPostCore(w4.id),p5=bossPostCore(w.id),v=S.evt;
    v.slots.forEach(x=>{if(x)x.at-=2*3600e3});const hrs=Math.min(2,(NOW()-evtNow().start)/3600e3),live=bossLive(),want=Math.floor(hrs*p1.pw)+Math.floor(hrs*p2.pw)+Math.floor(hrs*p3.pw);
    const blocked=!!dv&&!eligible(iv,w)&&enhanceCore(w.id).err&&!meltCore(w.id)&&where(w2)<0&&p2.vi===iv;
    const u=bossUnpostCore(0),freed=bossSlotOf(w)<0&&!v.slots[0]&&Math.abs(v.dmg-u.dmg)<1;
    EVT_WK++;const nw=bossSlotOf(w2)===1&&!eligible(iv,w2)&&evtSt().dmg===0&&evtSt().slots[1].pw===bossDmgOf(w2,evtNow().boss);EVT_WK--;
    res.push(T('J3 駐守首領：最多 3 把、2 小時傷害＝攻擊力×2、駐守中不能打村莊／強化／熔解、收回結算、換週武器留著',p1.pw===d0&&!p1.err&&!p3.err&&p4.err&&p5.err&&Math.abs(live-want)<=3&&blocked&&freed&&u.dmg>=Math.floor(hrs*d0)-1&&nw,
      `每小時 ${p1.pw}/${d0}；第 4 把：${p4.err||'沒擋住'}；重複：${p5.err||'沒擋住'}；2 小時 ${live}/${want}；擋住操作 ${!!blocked}；收回 ${u&&u.dmg}；換週 ${nw}`));
    S=fresh();S.gold=0;S.gems=0;const v4=evtSt(),kb=BOSS_G.b,kp=BOSS_G.prev;try{
      BOSS_G.b={week:v4.wk,hp:1000,total:600,mine:10,rank:1,players:1,top:[]};const n1=bossStageN(),g1=bossClaimStages(),n2=bossStageN();
      BOSS_G.b.total=1000;const n3=bossStageN();bossClaimStages();BOSS_G.b.mine=0;v4.gs=0;const n4=bossStageN();
      BOSS_G.prev={week:evtWeek()-1,hp:1000,total:1000,mine:50,rank:2,players:3,top:[]};const r1=bossClaimRank(),r2=bossClaimRank();
      res.push(T('J4 全服階段獎勵：60% 領 2 階、打倒再領 2 階、沒駐守不能領；上週第 2 名只能領一次',n1===2&&g1&&g1.gold===30000&&n2===0&&n3===2&&n4===0&&r1&&r1.t[1]==='第 2～3 名'&&!r2&&S.gems===200,`60%：${n1} 階（金幣 ${g1&&g1.gold}）；打倒：${n3} 階；沒駐守：${n4}；排名：${r1&&r1.t[1]}，鑽石 ${S.gems}，第二次 ${r2?'又領到':'擋住'}`));
    }finally{BOSS_G.b=kb;BOSS_G.prev=kp}
  }finally{EVT_WK=keepW}});
  return res}

/* ---------- 執行 ---------- */
function runAll(opts={}){
  const t0=Date.now();const lv=levelCheck();
  const res=[...lv.res,...forgeTests(opts.N||100000),...enhanceTests(opts.N||100000),...saveTests(),...dailyTests(),...chatTests(),...specTests(20261020,opts.N?Math.max(opts.N,100000):200000).res,...(typeof window!=='undefined'?repTests():[]),...evtTests(),...realm2Tests(),...unlockTests()];
  res.push(T('圖紙底圖：圖紙卡用統一圖紙底圖、不用品質外框',typeof document==='undefined'||wArt(BPS[0].id,{frame:'bp'}).includes('bp_paper2')&&!wArt(BPS[0].id,{frame:'bp'}).includes('wart-f'),'frame:bp'));
  return{res,lv,ms:Date.now()-t0};
}
function resHtml(res){return res.map(r=>`<div><b class="${r.pass?'p':'f'}">${r.pass?'通過':'未通過'}</b> ${r.name}<div class="muted">${r.detail}</div></div>`).join('')}
function econHtml(capH){const e=econReport(capH);let h=`<div><b>30 天經濟模擬（離線上限 ${capH} 小時，正式時間 1×）</b></div>`;
  for(const k in e){const m=e[k];h+=`<div style="margin-top:6px"><b>${PROFILES[k].n}</b>：收復時間 ${m.clearDays||'無'}</div>`;
    h+='<table class="tbl"><tr><th>天</th><th>村莊</th><th>金幣收入</th><th>鍛造</th><th>強化/失敗/爆</th><th>最高</th><th>熔爐/鐵砧</th></tr>'+Object.entries(m.snap).map(([d,s])=>`<tr><td>${d}</td><td>${s.cleared}</td><td>${fmt(s.goldIn)}</td><td>${s.forgedSum}</td><td>${s.enhTry}/${s.enhFail}/${s.breaks}</td><td>+${s.maxLv}</td><td>${s.furnace}/${s.anvil}</td></tr>`).join('')+'</table>'}
  return h}
// v3.62 版面檢查（只在瀏覽器）：把商城、武器庫、村莊、材料倉庫畫在 320～480px 寬的隱藏容器裡，
// 找出被擠成一個字寬、文字直排的欄位，以及字超出按鈕的情況（v3.61 旅行商人在 430 寬 iPhone 上直排就是這種）
// 只看文字本身有沒有跑出按鈕外框（紅點這類絕對定位的小圖示故意貼在框外，不算）
function textOut(b){const br=b.getBoundingClientRect(),w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(!n.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(n);for(const q of r.getClientRects())if(q.left<br.left-1||q.right>br.right+1)return true}return false}
function layoutTests(){if(typeof document==='undefined')return[];const res=[],keep=[ui.tab,ui.ftab,ui.atab];
  const views=[['商城',()=>viewShop()],['道具欄・武器',()=>{ui.atab='w';return viewArmory()}],['村莊',()=>viewVillage()],['道具欄・材料',()=>{ui.atab='m';return viewArmory()}],['每日任務',()=>{ui.qTab='d';return sheetAch()}],['七日簽到',()=>{ui.qTab='s';return sheetAch()}],['鐵匠天賦',()=>sheetTalent()]];
  const box=document.createElement('div');box.className='wrap';box.style.cssText='position:absolute;left:-10000px;top:0;visibility:hidden';document.body.appendChild(box);
  for(const[n,f]of views){const bad=[];
    for(const w of[320,360,375,393,414,430,480]){box.style.width=(w-24)+'px';box.innerHTML=f();
      box.querySelectorAll('*').forEach(el=>{const t=[...el.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent.trim()).join('');if(t.length<3)return;
        const r=el.getBoundingClientRect(),fs=parseFloat(getComputedStyle(el).fontSize)||14;if(!r.width)return;
        if(r.width<fs*2.2&&r.height>fs*3.5)bad.push(`${w}px「${t.slice(0,8)}」直排`)});
      box.querySelectorAll('button').forEach(b=>{if(b.textContent.trim().length>1&&b.offsetWidth&&textOut(b))bad.push(`${w}px 按鈕「${b.textContent.trim().slice(0,10)}」字超出`)})}
    res.push(T('G 版面 '+n+'（320～480px 寬）沒有直排或字超出按鈕',!bad.length,bad.length?[...new Set(bad)].slice(0,4).join('；'):'7 種寬度都正常'))}
  box.remove();[ui.tab,ui.ftab,ui.atab]=keep;ui.qTab=null;return res}
// v3.73 村莊怪物血條：每關都有怪物名稱，有武器的村莊卡顯示怪物縮圖與血條
function monTests(){if(typeof document==='undefined')return[];const box=document.createElement('div');box.innerHTML=viewVillage();
  const hunting=S.villages.filter(st=>st.status!=='locked'&&st.status!=='open'&&st.weaponId!=null&&W(st.weaponId)).length;
  const ok=MONS.length===VILLAGES.length&&box.querySelectorAll('[data-mon]').length===hunting&&box.querySelectorAll('[data-vhp]').length===hunting;
  return[T('H 村莊怪物：每關都有怪物，駐守中的村莊都有怪物圖和血條',ok,`怪物 ${MONS.length} 種／村莊 ${VILLAGES.length}；駐守 ${hunting} 座，怪物圖 ${box.querySelectorAll('[data-mon]').length}、血條 ${box.querySelectorAll('[data-vhp]').length}`)]}
// v4.04 神話怪物：每關都有短名（6 字內，血條放得下）、稱號、傳說；塵世巨蟒首領有自己的圖
function mythTests(){const n=VILLAGES.length,bad=MONS.filter(x=>x.length>6),j=EVT_BOSS.find(b=>b.id==='jorm');
  const nd=EVT_BOSS.find(b=>b.id==='nidhogg'),god=[9,19].every(i=>/神/.test(MON_T[i]));
  const ok=MONS.length===n&&MON_T.length===n&&MON_LORE.length===n&&!bad.length&&new Set(MONS).size===n&&j&&j.art==='boss_jorm'&&nd&&nd.art==='boss_nidhogg'&&god;
  return[T('H 神話怪物：20 隻都有名字（6 字內、不重複）、稱號、傳說，塵世巨蟒、尼德霍格首領用自己的圖，1-10、2-10 是神',ok,`名字 ${MONS.length}／稱號 ${MON_T.length}／傳說 ${MON_LORE.length}；太長：${bad.join('、')||'無'}；巨蟒圖 ${j&&j.art}、尼德霍格圖 ${nd&&nd.art}、最後一關是神 ${god}`)]}
// v4.12 村莊詳情的怪物大圖：20 座村莊都能顯示自己的怪物，‹ › 只在同一界 10 隻之間循環
function dexTests(){const sv=ui.sheet,bad=VILLAGES.map((v,i)=>i).filter(i=>{ui.sheet={t:'v',i};const h=monDex(i),r0=Math.floor(i/10)*10;
  return!h.includes(A('mon_'+(i+1)))||!h.includes(`data-k="${r0+(i-r0+9)%10}"`)||!h.includes(`data-k="${r0+(i-r0+1)%10}"`)});ui.sheet=sv;
  return[T('H 怪物大圖：20 座村莊詳情都有自己的怪物，左右翻只在同一界循環',!bad.length,bad.length?'錯：'+bad.map(vNo).join('、'):'20 座都正常')]}
// v4.06／v4.14 關卡跟故事一致：名稱、條件、掉落都要對得上怪物（打神要神聖、打龍要剋龍、火要霜寒）
function godReqTests(){const v=VILLAGES[9],u=VILLAGES[19],mk=e=>({id:-1,b:'t3_halberd',q:3,lv:15,traits:[],ench:[e,null,null,null]});
  const gods=VILLAGES.map((x,i)=>i).filter(i=>/神/.test(MON_T[i])),badGod=gods.filter(i=>VILLAGES[i].need!=='holy'),old=VILLAGES.filter(x=>/世界樹根穴|烏特加德城$|鐵爐村|鹿角堡|渡鴉灣|雪峰營地|冰川裂谷|雷鳴峽谷|霜晶礦坑|冰巨人王庭/.test(x.name)&&x!==VILLAGES[17]);
  const drag=VILLAGES[15],noScale=VILLAGES.filter((x,i)=>[7,9,12].includes(i)&&x.drops.some(d=>d[0]==='scale'));
  const ok=v.name==='彩虹橋頭'&&u.name==='維莫爾河渡口'&&u.cat==='hammer'&&!badGod.length&&!old.length&&VILLAGES[17].name==='烏特加德城'&&VILLAGES[8].need==='frost'&&drag.need==='dragon'&&TAGN[v.tag]&&TAGN[drag.tag];
  return[T('H 關卡跟故事一致：神的關卡都要神聖、2-10 要戰錘、1-9 要霜寒、2-6 蠕龍要剋龍、舊名稱都換掉（v4.43 掉落刪除，不再檢查）',!!ok,`沒要神聖的神：${badGod.map(vNo).join('、')||'無'}；舊名稱：${old.map(x=>x.name).join('、')||'無'}；不該掉龍鱗：${noScale.map(x=>x.name).join('、')||'無'}`)]}
// v4.24 第一、二界故事主線：1-8／2-9 對調、2-10 索爾、代名詞（神＝祂，怪物＝牠，不用他／她／它）
function storyTests(){const pr=[...MON_LORE,...VILLAGES.map(v=>v.txt)].map((t,i)=>[i,t]).filter(([i,t])=>/[他它]|(?<!巨人女巫放話：先打贏)她/.test(t.replace(/其他|試試它/g,'')));
  const ok=MONS[7]==='莫庫卡爾菲'&&MONS[18]==='赫朗格尼爾'&&MONS[19]==='索爾'&&MON_T[19]==='雷神'&&VILLAGES[18].name==='石籬原'&&!VILLAGES[18].drops.some(d=>d[0]==='fireheart')&&KN_FULL.includes(18)&&KN_FULL.includes(7)&&KN_FULL.includes(19)&&!Object.keys(ART_WAIT).some(k=>!/^dev_/.test(k)&&!BP_TMP[k.replace(/_disp$/,'')]);   // v4.51 新武器暫代圖例外   // v4.44 索爾之錘（神明武器）刪掉了，不再檢查
  return[T('H 故事主線：1-8 泥巨人、2-9 石籬原赫朗格尼爾（全身圖跟著搬）、2-10 雷神索爾',!!ok,`1-8 ${MONS[7]}、2-9 ${VILLAGES[18].name} ${MONS[18]}、2-10 ${MONS[19]}`),
    T('H 代名詞：怪物傳說和關卡說明不用他／她／它（指武器的「它」除外）',!pr.length,pr.length?'還有：'+pr.map(x=>x[0]).join('、'):'都改好了')]}
// v4.27 神明用「祂」：神的傳說、村莊文字不能用他／她／牠
function godWordTests(){const bad=VILLAGES.map((v,i)=>i).filter(i=>/神/.test(MON_T[i]||'')&&/[他她牠]/.test(MON_LORE[i]+VILLAGES[i].txt));
  return[T('H 神明用「祂」：神的傳說、村莊文字都不用他／她／牠',!bad.length,bad.length?'傳說：'+bad.map(vNo).join('、'):'都用祂')]}
// v4.38 駐守村莊不開詳情：點武器只出小卡（收回／換武器），沒有狩獵策略、沒有排行榜
// v4.39 卡片箭頭：駐守卡片有往下箭頭，展開後有戰鬥畫面、每輪掉落、已打到
function bsTglTests(){const S0=S,o=ui.bsOpen;S=fresh();const w=makeWeapon('t1_woodaxe',0,0,[]);const st=S.villages[0];st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW();st.bank={cycles:3,gold:30,mats:{},events:0};   // v4.43 舊材料刪除，只剩金幣
  ui.tab='village';ui.realm=0;ui.bsOpen=null;const c=viewVillage();ui.bsOpen=0;const op=viewVillage(),nD=VILLAGES[0].drops.length+8+wDrops(0).length;S=S0;ui.bsOpen=o;   // v4.70 金幣＋強化石＋附魔石＋4 遺物＋武器（v4.83 ＋解咒石）

  const ok=/class="bs-tgl "[^>]*data-act="bsopen"/.test(c)&&!/bs-more/.test(c)&&/class="bs-tgl up"[^>]*data-act="bsclose"/.test(op)&&/class="bs /.test(op)&&/bs-drops/.test(op)&&(op.match(/class="bs-d[ "]/g)||[]).length===nD&&!/新的掉落設計中/.test(op)&&/bs-got/.test(op)&&/×30/.test(op);
  return[T('H 村莊卡片箭頭：收起時往下、展開有戰鬥畫面＋每輪掉落＋已打到、再點收起',!!ok,ok?'正常':'內容不對')]}
function vPickTests(){const S0=S,sv=ui.sheet;S=fresh();const w=makeWeapon('t1_woodaxe',0,0,[]);const st=S.villages[0];st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW();
  const h=sheetVillage(0),card=(()=>{ui.tab='village';ui.realm=0;return typeof viewVillage==='function'?viewVillage():''})();S=S0;ui.sheet=sv;
  const ok=/data-act="recall"/.test(h)&&/data-act="vswap"/.test(h)&&!/data-act="strat"/.test(h)&&!/lbopen/.test(h)&&LB_OFF&&lbRank(0)==null&&!lbReward(0).length;
  return[T('H 駐守村莊小卡：只有看武器／換武器／收回，沒有策略和排行榜；排行榜關閉',!!ok,ok?'正常':'小卡內容不對')]}
// v4.14 村莊需求：每座村莊的需求面板都列得出同類圖紙
function vNeedTests(){const o=ui.sheet;let bad=[];VILLAGES.forEach((v,i)=>{if(S.villages[i].weaponId!=null)return;const h=sheetVillage(i);if(/vneed|需要的武器|data-act="vforge"/.test(h))bad.push(i)});ui.sheet=o;
  return[T('H 村莊詳情不再有「需要的武器」（v4.38 不限武器）',typeof vNeedPanel==='undefined'&&!bad.length,bad.length?'還有：'+bad.map(vNo).join('、'):'都拿掉了')]}
// v4.02 武器打法：每種還在的武器類別都有打法與說明，連擊間隔加起來比攻擊間隔短
function hitTests(){const cats=[...new Set(BPS.map(b=>b.cat))],miss=cats.filter(c=>!HIT[c]||!HIT_N[c]);
  const bad=Object.entries(HIT).filter(([k,h])=>{const z={};let sum=0;for(let n=0;n<400;n++){const p=h.plan(z);if(p.some(x=>x[0]>=h.iv*.85))return true;sum+=p.reduce((a,x)=>a+x[1],0)}return k!=='shield'&&Math.abs(sum/400/h.E-1)>.15});
  return[T('H 武器打法：每種武器類別都有打法，連擊在下一輪前打完、平均倍率和設定相符',!miss.length&&!bad.length,miss.length?'缺：'+miss.join('、'):bad.length?'不符：'+bad.map(x=>x[0]).join('、'):cats.length+' 種都有')]}
// v4.44 屬性附魔：三組互剋、弱點讓狩獵變快、村莊卡片有弱點標籤、首領弱點也用屬性
function enchTests(){let lv0=0;const mk=(e)=>({id:-1,b:'t3_greataxe',q:0,lv:lv0,traits:[],ench:[e||null,null,null,null]});while(lv0<15&&power(mk())<VILLAGES[8].req)lv0++;   // 攻擊力剛好過需求，弱點才看得出差別（狩獵時間最多縮到 60%）
  const pairOk=Object.entries(ELEM_OPP).every(([a,b])=>ELEM_OPP[b]===a)&&Object.keys(ELEM).length===6&&Object.entries(ELEM).every(([k,x])=>x.tn.length===3&&x.tn[2].length<=4&&x.n.length===3&&[...({fire:'焰火',ice:'霜冰',bolt:'雷',toxic:'毒',light:'聖光',dark:'影暗'}[k])].some(c=>x.tn[2].includes(c)));
  const i=8,d0=gameDur(i,mk(),'normal'),d1=gameDur(i,mk({k:'ice',v:3}),'normal'),d2=gameDur(i,mk({k:'fire',v:3}),'normal'),d3=gameDur(i,mk({k:'bolt',v:3}),'normal');
  const S0=S;S=fresh();const w=makeWeapon('t1_woodaxe',0,0,[],[{k:'fire',v:2},null,null,null]);const st=S.villages[0];st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW();ui.tab='village';ui.realm=0;const h=viewVillage(),sv=ui.sheet;S.villages[1].status='open';const hs=sheetVillage(1);ui.sheet=sv;S=S0;
  const bOk=EVT_BOSS.every(b=>b.weak&&ELEM[b.weak.el])&&bossWeak(mk({k:'ice',v:3}),EVT_BOSS[2])===1.1&&!bossWeak(mk({k:'fire',v:3}),EVT_BOSS[2])&&bossRes(mk({k:'fire',v:3}),EVT_BOSS[2])===.9&&!bossRes(mk({k:'ice',v:3}),EVT_BOSS[2]);
  const ok=pairOk&&d1<d0&&d2>d0&&d3===d0&&!/vweak|限時挑戰/.test(h)&&/弱點/.test(hs)&&bOk&&typeof AFFIX==='undefined';
  return[T('I 屬性附魔：6 種三組互剋、三級名稱 4 字內、打中弱點打得更快、同屬性打得更慢、弱點只在詳情顯示（卡片不顯示）、首領弱點用屬性、舊附魔表已刪',!!ok,`1-9 狩獵時間：無屬性 ${fmtT(d0)}、永凍之霜 ${fmtT(d1)}、滅世之焰 ${fmtT(d2)}、雷神之怒 ${fmtT(d3)}；互剋 ${pairOk}；首領 ${bOk}`)]}
// v3.90 工坊升級依關卡進度解鎖：沒收復到就不能升、扣不到錢；已經升上去的等級保留
function wsTests(){const S0=S;S=fresh();S.gold=1e6;const at=n=>S.villages.forEach((v,i)=>{if(i<n)v.status='cleared'});
  upgradeCore('anvil');upgradeCore('furnace');const a0=S.anvil===1&&S.furnace===1&&S.gold===1e6;
  at(2);upgradeCore('anvil');upgradeCore('anvil');const a1=S.anvil===2;at(4);upgradeCore('anvil');upgradeCore('anvil');const a2=S.anvil===3;
  at(7);for(let n=0;n<5;n++){upgradeCore('anvil');upgradeCore('furnace')}const a3=S.anvil===4&&S.furnace===5&&!!wsGate('anvil');
  S.anvil=5;S.villages.forEach(v=>v.status='open');const keep=S.anvil===5&&S.furnace===5;
  const gates=Object.entries(WS_GATE).map(([k,g])=>k+' '+g.slice(2).join('/')).join('；');S=S0;
  return[T('J 工坊升級依關卡解鎖（鐵砧 1-2/1-4/1-7/1-10、熔爐 1-3/1-5/1-6/1-7）',a0&&a1&&a2&&a3&&keep,`沒收復不能升 ${a0}；1-2→鐵砧 2 ${a1}；1-4→鐵砧 3 ${a2}；1-7→鐵砧 4、熔爐 5、鐵砧 5 還鎖 ${a3}；舊等級保留 ${keep}（${gates}）`)]}
// v4.07 難度曲線：每關需求不低於曲線、1-1 以外剛打好的普通武器不能直接交、需求數字和公告一致
function curveTests(){const rows=VILLAGES.map((v,i)=>diffRow(i)),low=rows.filter((d,i)=>i&&d.v.req<d.curve*.97),free=rows.filter((d,i)=>i&&d.need[0]===0),nw=NW_LOG.find(n=>n.v==='4.07'),txt=nw?nw.b.join(''):'';
  const want={1:14,4:44,5:55,7:155,9:310,10:280,13:545,14:420,15:420,18:900},miss=Object.entries(want).filter(([i,r])=>VILLAGES[i].req!==r||!txt.includes(({石籬原:'熔岩裂口'}[VILLAGES[i].name]||VILLAGES[i].name)+' '+r))   // v4.24 2-9 改名，4.07 公告裡還是舊名;
  return[   // v4.37 村莊不限攻擊力：N1 需求曲線、N2 +0 不能直接交付拿掉
    T('N3 10 關新需求和公告一致',!miss.length,miss.length?miss.map(([i])=>VILLAGES[i].name).join('、'):'一致')]}
function runTests(mode){const real=BPS.filter(b=>!b.dev);   // v4.44 舊武器刪除：要在放回測試資料前檢查
  const bd=[...cxTests(),...wdTests(),...newWpnTests(real),...chTests(),...matTests(real),...tutTests(),...mkCardTests(),...mkItemTests(),...fkTests(),...k2Tests(),T('BD1 舊圖紙沒有回來（只剩 v4.51 新武器和開發者測試圖紙）',!BP.t1_woodaxe&&BPS.every(b=>b.dev||b.t===0),`正式圖紙 ${real.length} 張`),
    T('BD2 神明材質階、神格覺醒拿掉',TIERS.length===5&&typeof GOD==='undefined'&&typeof awkN==='undefined',`材質 ${TIERS.length} 階`)];
  return withTestBps(()=>runTests0(mode,bd))}
// v4.44 正式圖紙全部刪掉了：快速測試期間暫時放回舊圖紙當測試資料（測完還原），新武器上線後再把測試改成新圖紙
const TEST_BPS=[
 ['t1_woodaxe','伐木斧','axe',0,14,0],['t1_handaxe','手斧','axe',0,12,0],
 ['t1_farmspear','農用長矛','polearm',0,11,1],['t1_shortspear','短矛','polearm',0,10,1],['t1_pickaxe','礦鎬','tool',0,11,1],
 ['t1_huntbow','獵弓','bow',0,10,2],['t1_sling','投石索','throw',0,7,2],['t1_huntknife','獵刀','dagger',0,9,2],
 ['t1_ironsword','鐵劍','sword',0,12,3],['t1_roundshield','圓盾','shield',0,10,3],['t1_crossbow','十字弩','crossbow',0,13,3],['t1_ironhammer','鐵錘','hammer',0,16,3],
 ['t2_wolfaxe','霜狼戰斧','axe',1,15],['t2_daneaxe','丹麥長斧','axe',1,14],['t2_longsword','霜銀長劍','sword',1,13],['t2_broadsword','霜銀闊劍','sword',1,14],
 ['t2_longbow','霜銀長弓','bow',1,11],['t2_crossbow','霜銀重弩','crossbow',1,13],['t2_warspear','霜銀戰矛','polearm',1,12],['t2_glaive','霜銀長柄刀','polearm',1,13],['t2_twindagger','霜銀雙匕','dagger',1,10],
 ['t2_seax','霜銀短刀','dagger',1,9],['t2_warhammer','霜獅戰錘','hammer',1,16],['t2_throwaxe','霜銀飛斧','throw',1,9],['t2_kiteshield','霜狼鳶盾','shield',1,11],
 ['t3_greataxe','龍首巨斧','axe',2,16],['t3_doubleaxe','龍鱗雙刃斧','axe',2,15],['t3_greatsword','龍鱗巨劍','sword',2,15],['t3_saber','龍鱗彎刀','sword',2,13],
 ['t3_bow','龍骨長弓','bow',2,12],['t3_crossbow','龍鱗重弩','crossbow',2,14],['t3_spear','龍鱗長矛','polearm',2,12],['t3_halberd','龍鱗戟','polearm',2,14],
 ['t3_scythe','龍鱗鐮刀','polearm',2,13],['t3_hammer','龍鱗戰錘','hammer',2,17],['t3_dagger','龍牙匕首','dagger',2,10],['t3_shield','龍鱗塔盾','shield',2,12],
 ['m_fenrir','芬里爾魔狼斧','axe',3,16,8,{fur:3,scale:3,rune:2},['swift',15]],
 ['m_frostgiant','霜巨人戰錘','hammer',3,17,8,{icecore:3,silver:4,rune:2},['giant',30]],
 ['m_firegiant','火巨人焰劍','sword',3,15,9,{fireheart:3,scale:3,rune:2},['flame',20]],
 ['m_nidhogg','尼德霍格龍矛','polearm',3,14,8,{scale:5,rune:3,fur:1},['dragon',35]],
 ['m_iceraven','冰鴉長弓','bow',3,12,8,{icecore:2,fang:6,rune:2},['frost',20]],
 ['m_serpent','海蛇三叉戟','polearm',3,13,8,{serpent:3,silver:4,rune:2},['loot',30]],
 ['t4_axe','霜巨人戰斧','axe',4,16,13,null,['giant',20]],['t4_sword','巨人王劍','sword',4,15],['t4_bow','風暴巨弓','bow',4,12],['t4_crossbow','雷鳴攻城弩','crossbow',4,14],
 ['t4_hammer','熔岩巨錘','hammer',4,17],['t4_polearm','狂風巨戟','polearm',4,14],['t4_dagger','霜晶獠刃','dagger',4,11],['t4_shield','巨骨塔盾','shield',4,12]
].map(([id,n,cat,t,base,unlock,r])=>({id,n,cat,t,base,unlock:unlock??TIERS[t].unlock,r:r||undefined,test:true}))   // v4.45 天生詞條不讀
 .filter(b=>!['t1_handaxe','t1_shortspear','t2_daneaxe','t2_broadsword','t2_warspear','t2_seax','t3_doubleaxe','t3_saber','t3_spear','t3_scythe','t1_pickaxe','t1_sling','t2_throwaxe','t1_roundshield','t2_kiteshield','t3_shield','t4_shield'].includes(b.id));
// v4.72 武器圖鑑：登錄會吃掉武器、加成算進攻擊力、駐守／鎖定不能登錄、套裝湊齊再加
function cxTests(){if(typeof cxRegCore==='undefined')return[];return withSandbox(()=>{try{S=fresh();
  const a=makeWeapon('w0_axe',0,0),p0=power(a),r1=cxRegCore('w0_axe',0),gone=!W(a.id),pct1=cxPct();
  const b=makeWeapon('w0_sword',0,6),p1=power(b);b.lock=true;const r2=cxRegCore('w0_sword',1);b.lock=false;
  const st=S.villages[0];st.weaponId=b.id;const r3=cxRegCore('w0_sword',1);st.weaponId=null;
  const c=makeWeapon('w0_sword',0,8),d=makeWeapon('w0_sword',0,6);const r4=cxRegCore('w0_sword',1);
  const dup=cxRegCore('w0_sword',1);
  CX_W0.filter(k=>k!=='w0_axe').forEach(k=>{makeWeapon(k,0,0);cxRegCore(k,0)});const set=cxSetOk(CX_SETS[0]),pctAll=cxPct();
  const ok1=r1.w&&gone&&pct1===.2&&power(makeWeapon('w0_axe',0,0))>=p0,ok2=!!r2.err&&!!r3.err,ok3=!!dup.err;
  return[T('CX1 圖鑑：登錄後武器消失、加成 +0.2%、攻擊力跟著變高',!!ok1,`消失 ${gone}・加成 ${pct1}%`),
   T('CX2 鎖定、駐守中的武器不能登錄；自動挑等級最低的那把；同一格不能登錄兩次',ok2&&ok3&&r4.w&&r4.w.lv===6,`鎖定 ${!!r2.err}・駐守 ${!!r3.err}・挑到 +${r4.w&&r4.w.lv}・重複 ${!!dup.err}`),
   T('CX3 套裝：鐵爐村 7 把 +0 湊齊再加 +2%',set&&Math.abs(pctAll-(7*.2+.6+2))<.01,`湊齊 ${set}・總加成 ${pctAll}%`)]}finally{CX_MEMO=null}})}
function withTestBps(f){const keep=BPS.slice(),add=TEST_BPS.filter(b=>!BP[b.id]),rq=VILLAGES.map(v=>v.req);BPS.length=0;BPS.push(...add,...keep.filter(b=>b.dev));add.forEach(b=>BP[b.id]=b);VILLAGES.forEach(v=>v.req=v.req0??v.req);VHP_OLD=true;   // v4.51 舊圖紙配舊需求（v4.71 血量也用舊公式）
  try{return f()}finally{VHP_OLD=false;BPS.length=0;BPS.push(...keep);VILLAGES.forEach((v,i)=>v.req=rq[i]);add.forEach(b=>delete BP[b.id]);S.weapons=S.weapons.filter(w=>BP[w.b]);S.jobs=S.jobs.filter(j=>BP[j.b])}}   // 測試留下的舊圖紙武器一起清掉
function runTests0(mode,bd){
  if(mode==='econ')return econHtml(12)+econHtml(8);
  const r=runAll({N:100000});r.res.push(...bd,...frameLvTests(),...layoutTests(),...monTests(),...mythTests(),...dexTests(),...godReqTests(),...storyTests(),...curveTests(),...vNeedTests(),...vPickTests(),...bsTglTests(),...godWordTests(),...hitTests(),...enchTests(),...wsTests(),...wpnTests(),...stackTests());const pass=r.res.filter(x=>x.pass).length;
  return `<div><b>${pass}/${r.res.length} 通過</b>（${r.ms} 毫秒）</div>`+resHtml(r.res);
}
// v4.34 武器框顏色看強化等級
function frameLvTests(){if(typeof FLV==='undefined')return[];const exp={0:0,1:1,6:1,7:2,8:2,9:3,10:6,11:4,12:5,15:5},bad=Object.entries(exp).filter(([lv,f])=>FLV(+lv)!==f);
  const nm=[0,3,7,9,10,11,12].map(lv=>FLV_T[FLV(lv)]).join('');return[T('FL2 品階名稱：凡鐵、精鍛、寒鋒、血刃、神鑄、星魂、永恆',nm==='凡鐵精鍛寒鋒血刃神鑄星魂永恆',nm),T('FL1 框色：+0 灰、+1～+6 綠、+7～+8 藍、+9 紅、+10 金、+11 紫、+12 鑽石',!bad.length,bad.length?'錯：'+bad.map(x=>'+'+x[0]).join('、'):'10 個等級都對')]}
// v4.40 新武器系統：每類每秒傷害一樣、單擊＝每秒傷害×攻速、附加效果機率、相剋形態
function wpnTests(){if(typeof CSPD==='undefined')return[];const cats=Object.keys(CSPD),one=c=>BPS.find(b=>b.cat===c);
  const ws=cats.filter(one).map(c=>{const b=one(c);return{b:b.id,q:4,lv:6,ench:[null,null,null,null],id:-1}});
  const qOk=ws.every(w=>power(w)===power({...w,q:0}));
  const hit=ws.every(w=>Math.abs(hitDmg(w)-power(w)*CSPD[bpOf(w).cat]/procE(6))<=1);
  const pr=[0,1,6,7,9,12].map(procP).map(x=>Math.round(x*100)).join('/');
  const rc=['man','beast','giant','undead'].every(r=>Object.values(CAT_RACE).includes(r))&&MON_RACE.length===VILLAGES.length;
  const sw=ws.find(w=>bpOf(w).cat==='sword'),hm=ws.find(w=>bpOf(w).cat==='hammer');
  const rm=sw&&hm?[raceMult(sw,0),raceMult(sw,6),raceMult(hm,4),raceMult({...hm,lv:15},4),raceMult({...hm,lv:0},4),raceMult(hm,6),raceMult({...hm,lv:9},4)].join('/'):'';
  return[T('WP1 攻擊力不看品質（暫時沒有稀有度）',qOk,ws.length+' 類'),T('WP2 單擊＝每秒傷害×攻速÷附加效果平均',hit,ws.map(w=>CATS[bpOf(w).cat]+hitDmg(w)).join(' ')),
    T('WP3 附加效果機率 +0/+1/+6/+7/+9/+12＝0/2/12/16/25/40%',pr==='0/2/12/16/25/40',pr),
    T('WP4 相剋：四種形態（人形／野獸／巨型／亡靈）都有武器剋、20 關都有形態',rc,MON_RACE.join(',')),
    T('WP5 劍打人形 +6 ×1.06、錘打亡靈（1-5）+6 ×1.06、+15 封頂 ×1.21、+0 沒有加成、錘打巨型沒加成、+9 ×1.12（v4.79 遞增）',rm==='1.06/1/1.06/1.21/1/1/1.12',rm)]}
if(typeof module!=='undefined')module.exports={runAll,econReport,simulate,levelCheck};

// v4.51 新武器 17 把（武器系統定案第 9 節）：開局 7 把、兩界一階數值、解鎖關卡、偏難需求、金幣配方、暫代圖
// v4.57 新手導覽：用的圖紙都是正式開局武器、每一步都有文字、提到的配方材料跟實際一樣
function tutTests(){const bad=TUT.map((x,i)=>x.t||x.tf?null:i+1).filter(Boolean),bpOk=BP[TUT_BP]&&!BP[TUT_BP].unlock&&BP.w0_sword&&!BP.w0_sword.unlock,r=recipe(BP.w1_spear),rOk=r.miron>0&&r.pine>0&&BP.w1_spear.unlock===2,end=TUT[TUT.length-1].end===1;
  return[T('TU1 新手導覽：'+TUT.length+' 步都有文字、用開局伐木斧／鐵劍、松林長矛配方提示正確、最後一步結束',!bad.length&&bpOk&&rOk&&end&&BPS.some(b=>!b.dev),bad.length?'沒文字：第 '+bad.join('、')+' 步':'正常')]}
// v4.54 新材料・附魔石・英靈遺物
function matTests(real){return withSandbox(()=>{const src=new Set(),bad=[];
  for(let i=0;i<=VILLAGES.length;i++){real.filter(b=>b.unlock===i).forEach(b=>{const ms=Object.keys(recipe(b)).filter(m=>!src.has(m));if(ms.length)bad.push(b.n)});if(VILLAGES[i])VILLAGES[i].drops.forEach(d=>src.add(d[0]))}
  const has=(i,k)=>VILLAGES[i].drops.some(d=>d[0]===k),dr=has(6,'troll')&&!has(5,'troll')&&has(9,'bifrost')&&has(17,'ubone')&&has(19,'thor')&&!has(0,'frost')&&has(10,'frost');
  const od=[0,9,10,19].map(relicOdds),sum=od.every(o=>Math.abs(Object.values(o).reduce((a,x)=>a+x,0)-100)<1e-9&&Object.values(o).every(x=>x>=0)),grow=od[1].relic_y>od[0].relic_y&&od[2].relic_r>od[0].relic_r&&od[3].relic_y>od[1].relic_y;
  S=fresh();S.villages.forEach((v,i)=>{if(i<12)v.status='cleared'});S.items.relic_y=200;S.items.relic_g=1;const m0=Object.values(S.mats).reduce((a,x)=>a+x,0),e0=S.items.estone,w0=S.weapons.length,g0=S.gold;
  const r=relicOpenCore('relic_y',0),r1=relicOpenCore('relic_g',1),r0=relicOpenCore('relic_g',1);const mats=Object.values(S.mats).reduce((a,x)=>a+x,0)-m0,ws=(r.got._w||[]).length,es=S.items.estone-e0;
  const open=r.n===200&&S.items.relic_y===0&&r1.n===1&&r0===null&&mats>0&&es>0&&S.weapons.length-w0===ws+((r1.got._w||[]).length)&&ws>0&&S.weapons.slice(w0).every(w=>bpOf(w).k!=='b')&&S.mats.miron+S.mats.pine===0;
  S=fresh();S.gold=1e6;S.villages.forEach((v,i)=>{if(i<2)v.status='cleared'});S.mats.miron=25;S.mats.pine=40;const f=forgeStart('w1_spear',1,false),fOk=typeof f!=='string'&&S.mats.miron===15&&S.mats.pine===25;
  S.mats.pine=0;const f2=forgeStart('w1_spear',1,false);
  return[T('MT1 新材料：每把圖紙解鎖時材料都已經有地方掉、部位／Boss 素材在對的關卡',!bad.length&&dr,bad.length?'缺來源：'+bad.join('、'):'正常'),
   T('MT2 英靈・遺物：機率加起來 100%、越後面的關卡、越後面的界好遺物越多',sum&&grow,`1-1 金光 ${r1x(od[0].relic_y)}%、1-10 ${r1x(od[1].relic_y)}%、2-10 ${r1x(od[3].relic_y)}%`),
   T('MT3 打開遺物：扣掉遺物、拿到材料（推到第二界給第二界材料）、強化石、武器（不含 Boss 武器），沒有就擋下',!!open,`金光 200 個：材料 ${mats}、強化石 +${es}、武器 ${ws} 把`),
   T('MT4 鍛造扣材料，不夠就擋下',fOk&&typeof f2==='string',fOk?'扣材料正常、不夠時「'+f2+'」':'扣材料不對')]})}
const r1x=x=>Math.round(x*10)/10;
// v4.52 限時挑戰：血量公式、需求剛好約 48 秒、60 秒內打倒才收復、收復只發一次獎勵、卡片不顯示弱點和「限時挑戰」
// v4.55 同款武器疊一格
function stackTests(){return withSandbox(()=>{const S0=S;S=fresh();const b=(BPS.find(x=>!x.dev)||BPS[0]).id,ek=Object.keys(ELEM)[0];
  for(let n=0;n<6;n++)makeWeapon(b,0,0);makeWeapon(b,0,3);const e=makeWeapon(b,0,0);e.ench[0]={k:ek,v:1};const lk=makeWeapon(b,0,0);lk.lock=true;
  const g=wStacks(S.weapons),six=g.find(x=>x.n===6),one=S.weapons[0];ui.tab='armory';ui.atab='w';ui.acat='all';ui.aq='all';ui.ast='all';
  const h=viewArmory(),tiles=(h.match(/data-act="wopen"/g)||[]).length,badge=/class="x">6</.test(h);
  ui.sheet={t:'w',id:one.id,m:'main'};const sh=sheetWeapon(one.id,'main');one.lv=1;const g2=wStacks(S.weapons);
  const two=S.weapons[1];one.lv=0;ui.sheet={t:'w',id:two.id,m:'main'};one.test=two.test=false;const k0=wKey(two);ui.stkNext={id:two.id,k:k0};two.lv=6;stkFollow();const fol=ui.sheet.id!==two.id&&wKey(W(ui.sheet.id))===k0;two.lv=0;ui.sheet=null;S=S0;
  return[T('ST1 同圖紙同等級同屬性才疊一格：6 把 +0 一格，+3、附魔、收藏各自一格',g.length===4&&!!six&&tiles===4&&badge,`${g.length} 格・畫面 ${tiles} 格`),
   T('ST2 點進去只動一把：強化其中一把就分出來，小卡寫「同款共 6 把」',/同款共 6 把/.test(sh)&&g2.length===5&&g2.find(x=>x.n===5),`強化後 ${g2.length} 格`),
   T('ST3 一鍵安定值後小卡換到下一把同款 +0，按鈕叫「一鍵安定值」',fol&&/一鍵安定值/.test(sh),fol?'有換':'沒換')]})}
function chTests(){return withSandbox(chTests0)}
function chTests0(){const mk=(id,lv)=>({id:-1,b:id,q:0,lv,ench:[null,null,null,null],traits:[]}),w0=mk('w0_sword',0);
  const P6=b=>b*enhMult(6)*procE(6),hpOk=VHP(0)===Math.round(P6(12)*HP_SEC)&&VHP(1)===VHP(0)&&VHP(2)===Math.round(P6(15)*HP_SEC)&&VHP(9)===Math.round(P6(15)*HP_SEC*Math.pow(1.025,7))&&VHP(19)===Math.round(P6(15)*HP_SEC*Math.pow(1.025,17));
  const w6=mk('w0_sword',6),sec=vSec(0,w6),durOk=Math.abs(sec-HP_SEC)<3&&Math.abs(gameDur(0,w6,'normal')-sec*1000*STRATS.normal.time)<1;
  let win=0,lose=0,gA=0;for(let n=0;n<100;n++){const q=chPlan(0,w6);if(q.win!=null){win++;if(grOf(q.win/1000)<=2)gA++}if(chPlan(9,w0).win!=null)lose++}
  const p=chPlan(0,w6),tOk=p.win!=null&&p.win<=CH_SEC*1000&&p.ev.every((e,k)=>!k||e[0]>=p.ev[k-1][0])&&p.ev.reduce((a,e)=>a+e[1],0)>=p.hp;
  const S0=S;S=fresh();S.villages[0].status='open';const g0=S.gold,r1=chWinCore(0),g1=S.gold,r2=chWinCore(0),g2=S.gold,once=r1.first&&!r2.first&&g1-g0===(FIRST_GOLD[0]||0)&&g2===g1&&S.villages[0].status==='cleared'&&S.villages[1].status==='open';
  S.villages[1].status='open';ui.tab='village';ui.realm=0;const h=viewVillage();S=S0;
  const cardOk=!/vweak|限時挑戰/.test(h)&&/data-act="vopen"/.test(h);
  const se=stoneE(0)===.002&&Math.abs(stoneE(89)-.002*1.89)<1e-12;
  // v4.71 評級：只記最好成績，首次收復獎勵 ×評級倍率，評級提升補差額；掛機金幣和掉落乘評級倍率
  S=fresh();S.villages[0].status='open';const F=FIRST_GOLD[0],q0=S.gold,a1=chWinCore(0,40),q1=S.gold,a2=chWinCore(0,15),q2=S.gold,a3=chWinCore(0,55),q3=S.gold;
  const grOk=a1.g===2&&q1-q0===F&&a2.better&&a2.g===0&&q2-q1===F*(GRADES[0].f-1)&&!a3.better&&q3===q2&&S.villages[0].gr===0&&grMul(0)===1.5&&grOf(18)===0&&grOf(18.1)===1&&grOf(60)===4&&grOf(60.1)==null;
  const gsum=()=>{const sb={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};for(let c=0;c<3000;c++)rollCycle(0,null,sb,NOW());return sb.bank.gold};const gSS=gsum();S.villages[0].gr=4;const gC=gsum();const dOk=dropChance(0,null,VILLAGES[0].drops[0],'normal')<VILLAGES[0].drops[0][1]+1e-9;S=S0;
  const ratio=gSS/gC,mulOk=Math.abs(ratio-1.5/.7)<.25&&dOk;
  return[T('CH1 v4.71 怪物血量＝最好一般武器 +6 × 38 秒，1-3 起每關 +2.5%',hpOk,`1-1 ${VHP(0)}、1-3 ${VHP(2)}、1-10 ${VHP(9)}、2-10 ${VHP(19)}`),
   T('CH2 +6 預估約 38 秒打倒（實際約 40 多秒，A），掛機一輪＝打倒一隻',durOk,`1-1 開局劍 +6 ${sec.toFixed(1)} 秒`),
   T('CH3 60 秒內打倒才收復：+6 幾乎都拿 A 以上，+0 打 1-10 一定輸，傷害照時間排',win>=98&&gA>=95&&lose===0&&tOk,`1-1 +6 贏 ${win}/100（A 以上 ${gA}）、1-10 +0 贏 ${lose}/100`),
   T('CH6 評級 SS/S/A/B/C：只記最好、首次獎勵 ×倍率、提升補差額；掛機收益 SS 比 C 多 1.5/0.7 倍',grOk&&mulOk,`補發 ${q2-q1}・SS/C 金幣比 ${ratio.toFixed(2)}`),
   T('CH4 收復獎勵只發一次、開下一關',!!once,`首次 ${r1&&r1.fg} 金幣、第二次 ${r2&&r2.first?'又發(錯誤)':'不再發'}`),
   T('CH5 村莊卡片不顯示弱點和「限時挑戰」，只有挑戰按鈕；強化石每隻 0.2% 往後遞增（v4.65 減半）',cardOk&&se,cardOk?'正常':'卡片還有弱點或限時挑戰')]}
// v4.66 打怪直接掉武器、1-1～1-5 每隻金幣範圍
function wdTests(){if(typeof wDrops==='undefined')return[];const S0=S;const res=[];
  try{S=JSON.parse(JSON.stringify(S0));S.villages.forEach(v=>v.status='open');const M=i=>Object.fromEntries(wDrops(i));
    const a0=M(0),a6=M(6),a9=M(9),a19=M(19);
    const ok1=a0._w0===.002&&!a0.w1_spear&&!a0.w1_troll&&a6.w1_troll===.003&&!a0.w1_troll&&a9.g_hofund===.001&&!a6.g_hofund&&a19.g_skadi===.001&&!a19._w0&&!a6.w1_spear;
    S.villages.forEach(v=>v.status='cleared');const all=M(9),a12=M(12);const ok2=all.w1_spear===.0015&&all.w1_sword===.0015&&all.w1_xbow===.0015&&!all.w2_axe&&a12.w2_axe===.0015&&a12.w2_dual===.0015&&!a12.w1_spear&&!a12.w2_utgard;
    res.push(T('WD1 掉武器：開局 0.2%（只第一界）、一般武器解鎖後 0.15%、怪物武器只在那關 0.3%、Boss 武器只在那關 0.1%',ok1&&ok2,JSON.stringify(a6)));
    const st=S.villages[0];st.bank={cycles:1,gold:10,mats:{'w:w0_axe':2},events:0};const n0=S.weapons.length;const r=collectCore(0);
    const ok3=S.weapons.length===n0+2&&S.weapons.slice(-2).every(w=>w.b==='w0_axe'&&w.lv===0);
    while(S.weapons.length<CAP_WEAPONS)S.weapons.push({id:-9,b:'w0_axe',q:0,lv:0,ench:[null,null,null,null],traits:[]});
    st.bank={cycles:1,gold:0,mats:{'w:w0_axe':1},events:0};const s0=S.items[STONE]|0,g0=S.gold;collectCore(0);
    const ok4=S.weapons.length===CAP_WEAPONS&&(S.items[STONE]|0)===s0+1&&S.gold>g0;
    res.push(T('WD2 收成時掉落武器放進道具欄；道具欄滿了自動熔解成金幣＋1 顆強化石',ok3&&ok4,`入帳 ${ok3?'正常':'錯誤'}、滿了 ${ok4?'熔解':'錯誤'}`));
    const sb={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};let mn=1e9,mx=0;for(let c=0;c<400;c++){const g0=sb.bank.gold;rollCycle(0,null,sb,NOW());const d=sb.bank.gold-g0;mn=Math.min(mn,d);mx=Math.max(mx,d)}
    res.push(T('KG1 1-1 每隻金幣 20～70 隨機（Mochi 填的範圍）、平均值給時薪用',mn>=20&&mx<=70&&mx-mn>30&&vKillGold(0)===45,`${mn}～${mx}`));
  }catch(e){res.push(T('WD 掉武器測試',false,e.message))}finally{S=S0}
  return res}
function newWpnTests(real){const mk=(id,lv)=>({id:-1,b:id,q:0,lv,ench:[null,null,null,null],traits:[]}),P=(id,lv)=>power(mk(id,lv));
  const st=real.filter(b=>b.unlock===0),cats=Object.keys(CSPD),ul=real.filter(b=>b.unlock).map(b=>b.unlock).join(',');
  const pw=[P('w0_sword',0),P('w1_sword',0),P('w2_axe',0),P('w1_troll',0),P('g_hofund',0)].join('/');
  const r1=P('w1_sword',6)<VILLAGES[9].req&&P('w1_sword',7)>=VILLAGES[9].req,r2=P('w2_axe',7)<VILLAGES[19].req&&P('w2_axe',8)>=VILLAGES[19].req;
  return[T('NW1 新武器 17 把：開局 7 種各 1 把，第一界 2/4/6/7/10、第二界 1/3/5/8/10 關解鎖',real.length===17&&st.length===7&&cats.every(c=>st.some(b=>b.cat===c))&&ul==='2,4,6,7,10,11,13,15,18,20',`${real.length} 把・解鎖 ${ul}`),
   T('NW2 數值兩界一階：開局 12、一般 15（第一二界一樣）、怪物主題 ×1.1、Boss 含專屬特效約 +20%',pw==='12/15/15/17/18'&&BP.g_hofund.fx&&BP.w1_troll.k==='m',pw),
   T('NW3 偏難需求：1-10 要 +7、2-10 要 +8（+6／+7 不夠）',r1&&r2&&VREQ.length===20&&VILLAGES[0].req===12,`1-10 需求 ${VILLAGES[9].req}・2-10 需求 ${VILLAGES[19].req}`),
   T('NW4 配方：開局 7 把只花金幣，其他要金幣＋該界材料，各圖紙有自己的金幣價',real.every(b=>goldOf(b)===b.gold&&b.gold>0&&(!b.unlock?!Object.keys(recipe(b)).length:Object.keys(recipe(b)).some(k=>REALM_MAT[Math.floor((b.unlock-1)/10)].includes(k))))&&goldOf(BP.g_skadi)===10000,real.map(goldOf).join(',')),
   T('NW5 17 把都用自己的圖（15 把新圖＋2 把 Boss 現有圖），不再借舊圖',real.every(b=>!ART_WAIT[b.id+'_disp']&&!ART_WAIT[b.id])&&real.filter(b=>!b.fx).every(b=>WFIT[b.id]===.6),Object.keys(BP_TMP).length+' 把暫代')]}

// v4.53 交易所：列表／詳情的武器名稱含屬性，詳情用武器小卡的四格數值
function mkCardTests(){const w={b:'w1_sword',q:0,lv:7,traits:[],ench:[{k:'ice',v:2},null,null,null]},r={id:-5,seller:'npc',seller_nick:'x',weapon:w,bp:'w1_sword',lv:7,q:0,cur:'gold',price:100,expires_at:new Date(Date.now()+864e5).toISOString()};
  const row=mkRow(r,'mkview'),box=mkWeaponBox(w),e=wElem(w);
  return [T('MKC1 交易所列表名稱有屬性',!!e&&row.includes(e.tn)&&row.includes('wn-el'),e?e.tn:'無屬性'),
    T('MKC2 商品詳情有攻速／附加效果／相剋／屬性四格',['攻速','附加效果','相剋','屬性'].every(k=>box.includes(k))&&box.includes('wp-g')&&!box.includes('可以重抽'))]}

// v4.56 交易所賣道具：列表、上架頁、購買頁、待領取筆數
function mkItemTests(){const r={id:-6,kind:'i',item:STONE,qty:30,left_qty:12,seller:'npc',seller_nick:'x',weapon:{item:STONE},bp:null,cur:'gold',price:300,expires_at:new Date(Date.now()+864e5).toISOString()};
  const row=mkRow(r,'mkview'),head=()=>'',sell=sheetMkSellItem(STONE,head),buy=sheetMkItem(r,head),ic=MK.iclaim;MK.iclaim=[{key:'f1',status:'sold',item:STONE,qty:3,cur:'gold',total:900,net:855}];
  const n=mkClaimN(),box=mkClaimBox();MK.iclaim=ic;
  return [T('MKI1 道具商品顯示名稱、剩餘數量、每個的價格',row.includes(itemName(STONE))&&row.includes('×12')&&row.includes('每個')&&mkCat(r)==='item'),
    T('MKI2 上架道具頁有單價、數量、全部按鈕',sell.includes('mkiprice')&&sell.includes('mkiqty')&&sell.includes('mkiqall')),
    T('MKI3 買道具頁可以填數量',buy.includes('mkbq')&&buy.includes('mkbuyi')),
    T('MKI4 道具賣出算進待領取',n===MK.claim.length+1&&box.includes('855'),`待領取 ${n}`)]}

// v4.73 秒殺榜：只留最快、四捨五入到 0.1 秒、王關＝每界第 9、10 關、榜和公告文字
function fkTests(){const S0=S;S=JSON.parse(JSON.stringify(S0));const mk0=FK.mock;
  try{const st=S.villages[0],w={id:-9,b:BPS.find(b=>!b.dev).id,q:0,lv:7,ench:[]};delete st.fk;
    const a=fkRec(0,23.46,w),b=fkRec(0,30,w),c=fkRec(0,18.04,w);
    const ok1=a.better&&a.sec===23.5&&!b.better&&st.fk===18&&c.prev===23.5&&st.fkw.lv===7;
    const boss=VILLAGES.map((v,i)=>i).filter(fkBoss).join(',');
    FK.mock=()=>({rows:[{rk:1,uid:'x',nick:'霜狼',sec:9.2,w:{b:w.b,q:0,lv:12,ench:[]}},{rk:2,uid:'me',nick:'我',sec:18,w:st.fkw,mine:true}],n:2,me:{rk:2},my:{rk:2,n:2,top:9.2},t:1});
    const h=sheetFk(0),row=fkRow(0),t1=fkAnnText({nick:'A',village:9,sec:12.4,kind:'first'}),t2=fkAnnText({nick:'B',village:19,sec:8.9,bp:w.b,lv:12,kind:'top'});
    return[T('FK1 秒殺紀錄只留最快一次、到 0.1 秒、記當時的武器',ok1,`最快 ${st.fk}`),
      T('FK2 跑馬燈只給每界第 9、10 關的王',boss==='8,9,18,19',boss),
      T('FK3 秒殺榜有名次、秒數、評級、我的名次；村莊詳情有我的最快和全服最快',h.includes('霜狼')&&h.includes('9.2')&&h.includes('lb-row me')&&h.includes('gr-')&&row.includes('18.0 秒')&&row.includes('第 2 名')&&row.includes('9.2')),
      T('FK4 公告文字：首殺、刷新紀錄都有怪物名字和秒數',t1.includes(MONS[9])&&t1.includes('12.4')&&t2.includes(MONS[19])&&t2.includes('+12')&&t2.includes('8.9'))]}
  catch(e){return[T('FK 秒殺榜測試',false,e.message)]}finally{S=S0;FK.mock=mk0}}

// v5.10 UI 母版延伸：武器小卡／強化／附魔都用道具欄素材（外框、格子品階框、按鈕），裡面不能再出現舊的 ui491 框
function k2Tests(){const S0=S,sh0=ui.sheet,r0=ui.result;S=JSON.parse(JSON.stringify(S0));
  try{const b=BPS.find(x=>!x.dev)||BPS[0],w=makeWeapon(b.id,0,10),out=[];
    for(const m of ['main','enh','ench']){ui.sheet={t:'w',id:w.id,m};ui.result=null;renderLayer();const sc=document.querySelector('#layer .sheet');
      const bi=sc?getComputedStyle(sc).borderImageSource:'',old=sc?[...sc.querySelectorAll('*')].filter(e=>/ui491_/.test(getComputedStyle(e).borderImageSource)).length:-1;
      const bt=sc?[...sc.querySelectorAll('.ui-btn.btn')].filter(e=>!/bag2_btn/.test(getComputedStyle(e).borderImageSource)).length:-1;
      out.push(T('K2-'+m+' 小卡用道具欄外框、按鈕，沒有舊框',!!sc&&sc.classList.contains('k2')&&/bag2_main_frame/.test(bi)&&old===0&&bt===0,`外框 ${/bag2_main_frame/.test(bi)?'bag2':bi.slice(-30)}；舊框 ${old} 個；非 bag2 按鈕 ${bt} 個`))
      // 標題列的返回／說明／X 按鈕要完整在外框裡、不壓到標題（v5.10 375 寬 X 被擠出去）
      const sr=sc?sc.getBoundingClientRect():null,hd=sc?[...sc.querySelectorAll('.sheet-head .icon-btn,.wp-top .icon-btn')].map(e=>e.getBoundingClientRect()).filter(r=>r.width):[],tt=sc&&sc.querySelector('.sheet-head h2'),tr=tt&&tt.getBoundingClientRect();
      const outB=hd.filter(r=>r.right>sr.right-12||r.left<sr.left+12).length,hit=tr?hd.filter(r=>r.left<tr.right&&r.right>tr.left&&r.top<tr.bottom&&r.bottom>tr.top).length:0;
      out.push(T('K2-'+m+' 標題列按鈕完整、不壓標題',!!sc&&hd.length>0&&outB===0&&hit===0,`寬 ${innerWidth}：按鈕 ${hd.length} 個，超出外框 ${outB}，壓到標題 ${hit}`))}
    const h=b2Show(w);out.push(T('K2-show 武器大圖用格子＋品階框，+9 以上有裂痕',h.includes('b2-slot')&&h.includes('bag2_rim9_l6')&&h.includes('bag2_crk_l6')&&b2Show({...w,lv:6}).includes('bag2_rim_l1')));
    return out}
  catch(e){return[T('K2 UI 母版延伸測試',false,e.message)]}finally{S=S0;ui.sheet=sh0;ui.result=r0;renderLayer()}}
