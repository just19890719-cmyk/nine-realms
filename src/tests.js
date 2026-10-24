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
  res.push(T('H3 七日簽到每天一次、第 7 天後回到第 1 天',got[3].gems===50&&got[6].gems===100&&got[7].gold===1000&&!dup&&S.gems===gems0+150,`第 4 天 ${rwText(got[3])}；第 7 天 ${rwText(got[6])}；第 8 次 ${rwText(got[7])}；同一天重領 ${dup?'可以（錯）':'擋下'}`));
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
    for(let lv=0;lv<=15;lv++){const p=Math.round(b.base*TIERS[b.t].mult*QUAL[q].m*enhMult(lv));if(p>=req){need=lv;break}}out.push(need)}return out}
function levelCheck(){
  const res=[],rows=[];const sources=new Set(['iron','oak','leather']);
  for(let i=0;i<10;i++){   // 第一界：不靠重鍊；1-10 才算神器；第二界另外在 A12 檢查
    const v=VILLAGES[i],c=i; // 交付第 i 關時已收復 i 關
    const avail=BPS.filter(b=>b.cat===v.cat&&c>=b.unlock&&(b.t<3||i>=9));   // v4.07 1-10 需求 310：要用神器長柄
    const affixOk=!v.need||[...sources].includes('shard');
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
    res.push(T(`A${i+1} ${vNo(i)} ${v.name}`,pass,best?`${best.b.n}（${TIERS[best.b.t].n}）${QUAL[best.q].n} +${best.lv}${best.safe?'（安定區內）':'（需危險強化 '+best.dsteps+' 階，連續成功率 '+(best.pReach*100).toFixed(0)+'%）'}；鐵砧Lv${anv} 期望鍛造 ${expForges.toFixed(1)} 次${v.need?'；需附魔「'+AFFIX[v.need].n+'」'+(affixOk?'，碎片可取得':'，碎片尚無來源'):''}`:'沒有可用武器或材料無來源'));
    v.drops.forEach(d=>sources.add(d[0]));
  }
  // 素材循環：每個圖紙的材料是否在其解鎖前就有來源
  const src2=new Set(['iron','oak','leather']);const bad=[];
  for(let i=0;i<=VILLAGES.length;i++){BPS.filter(b=>b.unlock===i).forEach(b=>{const ms=Object.keys(recipe(b)).filter(m=>!src2.has(m));if(ms.length)bad.push(b.n+'缺'+ms.map(m=>MATS[m]).join('、'))});if(VILLAGES[i])VILLAGES[i].drops.forEach(d=>src2.add(d[0]))}
  // v3.76 第二界：龍鱗／神器＋重鍊 5 級，每關找出最低品質和強化等級（安全標準：史詩以下 +8 內、或傳說 +6 內）
  const r2=[];let ok2=true;
  for(let i=10;i<VILLAGES.length;i++){const v=VILLAGES[i];let best=null;
    for(let q=0;q<5&&!(best&&best.good);q++)for(const b of BPS.filter(b=>b.cat===v.cat&&b.t>=2&&b.unlock<=i&&(b.t<3||q>=2)))for(let lv=0;lv<=15;lv++){
      if(Math.round(b.base*TIERS[b.t].mult*QUAL[q].m*enhMult(lv)*(1+RF_PER*RF_MAX))>=v.req){const good=q<=3?lv<=8:lv<=6;if(!best||(good&&!best.good)||(good===best.good&&lv<best.lv))best={b,q,lv,good};break}}
    const good=best&&best.good;ok2=ok2&&good;r2.push(`${vNo(i)} ${v.req}：${best?`${QUAL[best.q].n}${best.b.n}+${best.lv}`:'無'}${good?'':'（太難）'}`)}
  res.push(T('A12 第二界每關都打得過（龍鱗／神器／巨人＋重鍊 Lv5）',ok2,r2.join('；')));
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
    for(let q=0;q<5;q++)for(let n=0;n<perQ;n++){const t=rollTraits(q);tc[q][t.length]++;const ks=new Set(t.map(x=>x.k));if(ks.size!==t.length)dup++;
      t.forEach(x=>{const d=TRAITS[x.k],lo=Math.round(d.min*(1+.2*q)),hi=Math.round(d.max*(1+.2*q));if(x.v<lo||x.v>hi)outRange++})}
    res.push(T(`B6 先天特性數量與數值範圍（${(perQ*5).toLocaleString()} 次）`,!dup&&!outRange&&tc[0][0]>0&&tc[0][1]>0&&tc[4][3]>0&&!tc[0][2]&&!tc[4][1],
      tc.map((r,q)=>QUAL[q].n+'：'+r.map((c,k)=>c?k+'個 '+(c/perQ*100).toFixed(1)+'%':'').filter(Boolean).join(' ')).join('；')+`；重複特性 ${dup}、超出範圍 ${outRange}`));
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
    res.push(T('B8 批量鍛造扣料、取消全額退回、完成只發一次',used===recipe(BP.t1_woodaxe).iron*5&&usedOak===recipe(BP.t1_woodaxe).oak*5&&ug===goldOf(BP.t1_woodaxe)*5&&back&&n1-n0===10&&S.weapons.length===n1&&ids.size===S.weapons.length,
      `×5 扣鐵礦 ${used}、橡木 ${usedOak}、金幣 ${ug}；取消後${back?'完全退回':'沒有退回'}；×10 完成產出 ${n1-n0} 把，ID 不重複 ${ids.size===S.weapons.length}`));
  });
  return res;
}

/* ---------- C. 強化 ---------- */
function enhanceTests(N=100000){
  const res=[];
  // 純判定：各目標等級
  const rows=[];let ok=true;
  for(let next=1;next<=15;next++){const r=RATE[next],bc=next<=6?0:Math.min(.9,.5+.05*(next-7));let s=0,b=0;
    for(let n=0;n<N;n++){const o=rollEnhance(r,bc);if(o==='ok')s++;else if(o==='break')b++}
    const eb=(1-r)*bc;const tol=Math.max(.003,4.5*Math.sqrt(.25/N));const good=near(s/N,r,tol)&&near(b/N,eb,tol);if(!good)ok=false;rows.push(`+${next} 成功 ${(s/N*100).toFixed(1)}%/${Math.round(r*100)}%、爆 ${(b/N*100).toFixed(1)}%/${(eb*100).toFixed(1)}%`)}
  res.push(T(`C1 強化判定（每級 ${N.toLocaleString()} 次，鐵製安定 +6）`,ok,rows.join('；')));
  // 安定值與公式
  withSandbox(()=>{S=fresh();const mk=b=>makeWeapon(b,0,0,[]);
    const t1=mk('t1_woodaxe'),t2=mk('t2_wolfaxe'),t3=mk('t3_greataxe'),t4=mk('m_fenrir'),t5=mk('t4_sword');
    const st=[t1,t2,t3,t4,t5].map(stable).join('/');const b4=breakChance(t4,6)+breakChance(t5,6)+(breakChance(t4,7)===.5&&breakChance(t5,7)===.5?0:1),b1=breakChance(t1,6),b1b=breakChance(t1,7);
    const mul=[0,6,7,15].map(enhMult);
    res.push(T('C2 安定值全部 +6（v4.00）、神器／巨人 +6 不爆、+7 才判定爆裝、倍率加法',st==='6/6/6/6/6'&&b4===0&&b1===0&&b1b===.5&&near(breakChance(t1,15),.9,1e-9)&&near(RATE[7],.45,1e-9)&&near(RATE[15],.02,1e-9)&&near(mul[1],1.6,1e-9)&&near(mul[2],1.78,1e-9)&&near(mul[3],3.22,1e-9),
      `安定值 ${st}；神器／巨人 +6 爆裝 ${b4*100}%；鐵製 +6 ${b1*100}%、+7 ${b1b*100}%；倍率 +0 ${mul[0]}、+6 ${mul[1]}、+7 ${mul[2]}、+15 ${mul[3].toFixed(2)}`));
    // 防爆卷、殘渣、駐守保護
    S.gold=1e9;const w=mk('t1_ironsword');w.lv=14;S.items.scroll=100000;let saved=0,lost=0,broke=0;
    for(let n=0;n<3000;n++){const r=enhanceCore(w.id,{scroll:true});if(r.k==='saved')saved++;if(r.k==='broke')broke++;if(r.k==='ok'){w.lv=14}}
    S.items.scroll=0;const slag0=S.slag;let brokeOne=null;for(let n=0;n<200&&!brokeOne;n++){const x=mk('t3_greataxe');x.lv=10;const r=enhanceCore(x.id,{});if(r.k==='broke')brokeOne=r;else S.weapons.splice(S.weapons.indexOf(x),1)}
    const v=mk('t1_woodaxe');S.villages[0].weaponId=v.id;const g=S.gold;const r1=enhanceCore(v.id,{}),r2=meltCore(v.id),r3=enchantCore(v.id,0);
    res.push(T('C3 防爆卷保住武器、爆裝回收殘渣、駐守武器不能強化/熔解/附魔',!broke&&saved>0&&brokeOne&&S.slag-slag0===10&&!W(brokeOne.before?0:0)&&r1.err&&r2===null&&r3.err&&S.gold===g,
      `+14→+15 用防爆卷 3000 次：保住 ${saved}、爆裝 ${broke}；龍鱗爆裝回收殘渣 ${S.slag-slag0}；駐守武器：強化「${r1.err}」、熔解${r2===null?'被擋下':'成功(錯誤)'}、附魔「${r3.err}」`));
  });
  // 完整過程模擬
  const journey=(tier,target,runs=4000)=>{let tries=0,gold=0,reach=0,broke=0;const st=TIERS[tier].stable,mult=TIERS[tier].mult;
    for(let r=0;r<runs;r++){let lv=0;while(lv<target){tries++;gold+=Math.round(15*Math.pow(lv+1,1.8)*mult);const next=lv+1,bc=next<=st?0:Math.min(.9,.5+.05*(next-st-1));const o=rollEnhance(RATE[next],bc);
      if(o==='ok')lv++;else if(o==='break'){broke++;break}}if(lv>=target)reach++}
    return`${TIERS[tier].n} +0→+${target}：成功率 ${(reach/runs*100).toFixed(1)}%、平均嘗試 ${(tries/runs).toFixed(1)} 次、平均金幣 ${fmt(gold/runs)}`};
  const lines=[];for(const t of [0,3])for(const g of [6,9,12,15])lines.push(journey(t,g));
  res.push(T('C4 從 +0 衝到 +6/+9/+12/+15（不用防爆卷，每項 4,000 人）',true,lines.join('；')));
  return res;
}

/* ---------- E. 存檔與漏洞 ---------- */
function saveTests(){
  const res=[];
  withSandbox(()=>{
    // 新存檔
    S=fresh();res.push(T('E1 新存檔結構完整',S.v===3&&S.villages.length===VILLAGES.length&&S.weapons.length===0&&S.stats&&S.items.scroll===1,'v'+S.v));
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
      ()=>setStrategy(rnd(0,9),['normal','material','rare'][rnd(0,2)]),()=>{CLOCK.offset+=rnd(0,600000)},()=>cancelJob(0),()=>{const w=S.weapons[0];if(w)enchantCore(w.id,rnd(0,3))},()=>slagTrade(rnd(0,2)),()=>pullCore(1)];
    for(let n=0;n<3000;n++){acts[rnd(0,acts.length-1)]();
      const neg=S.gold<0||S.gems<0||S.slag<0||Object.values(S.mats).some(x=>x<0)||Object.values(S.items).some(x=>x<0);
      const ids=S.weapons.map(w=>w.id),posts=S.villages.map(v=>v.weaponId).filter(x=>x!=null);
      if(neg||new Set(ids).size!==ids.length||new Set(posts).size!==posts.length||posts.some(id=>!W(id)))errs++}
    res.push(T('E9 3,000 次隨機操作：無負數、ID 不重複、同一把武器不會同時駐守兩村、熔解後真正消失',!errs,`異常 ${errs} 次；最終武器 ${S.weapons.length} 把`));
    // 附魔覆蓋與加成
    S=fresh();S.gold=1e6;S.mats.shard=100;S.anvil=5;const x=makeWeapon('t2_wolfaxe',2,0,[{k:'runic',v:20},{k:'light',v:5}]);
    for(let n=0;n<50;n++)enchantCore(x.id,rnd(0,3));const slots=x.ench.length,shard0=S.mats.shard,g1=S.gold;enchantCore(x.id,0);
    x.ench=[{k:'loot',v:30},{k:'loot',v:30},{k:'loot',v:30},{k:'swift',v:40}];const tr=timeReduction(0,x),lo=Math.min(CAP.loot,affixVal(x,'loot'));
    const y=makeWeapon('t3_greataxe',1,4,[]);y.ench[0]={k:'giant',v:20};const yOk=eligible(7,y),y2=makeWeapon('t3_greataxe',0,0,[]);
    res.push(T('E10 附魔覆蓋不重複、扣費正確、符文親和不重複計算、迅捷/掠奪有上限、剋巨人判定',slots===4&&shard0-S.mats.shard===1&&g1-S.gold===enchCost(x)&&x.ench.length===4&&tr===CAP.time/100&&lo===CAP.loot&&yOk===(power(y)>=VILLAGES[7].req)&&yOk&&!eligible(7,y2),
      `欄位數 ${slots}；隨機附魔扣碎片 ${shard0-S.mats.shard}、金幣 ${g1-S.gold}；迅捷堆疊後時間縮短 ${tr*100}%（上限 ${CAP.time}%）；掠奪 ${lo}%（上限 ${CAP.loot}%）；有剋巨人可交 1-8：${yOk}，沒有：${eligible(7,y2)}`));
    // 附魔欄位依鐵砧
    S=fresh();S.gold=1e6;S.mats.shard=10;const z=makeWeapon('t1_woodaxe',0,0,[]);const e2=enchantCore(z.id,2);S.anvil=3;const e3=enchantCore(z.id,2),e4=enchantCore(z.id,3);S.anvil=5;const e5=enchantCore(z.id,3);
    res.push(T('E11 附魔第 3 格鐵砧 Lv3、第 4 格鐵砧 Lv5 開放',e2.err&&!e3.err&&e4.err&&!e5.err,'Lv1 第3格擋下、Lv3 第3格可用第4格擋下、Lv5 第4格可用'));
    // 祈願
    const sum=GACHA.reduce((a,x)=>a+x[2],0);S=fresh();S.gems=1e7;let pityOk=true,nPity=0;for(let n=0;n<3000;n++){const r=pullCore(10);const hit9=r.slice(0,9).some(p=>p[2]<=PITY_MAX_W);if(!hit9){nPity++;if(r[9][2]>PITY_MAX_W)pityOk=false}}
    res.push(T('E12 祈願機率總和 100%、十連保底生效',sum===1000&&pityOk,`權重總和 ${sum}/1000；3,000 次十連中觸發保底 ${nPity} 次（理論約 ${(Math.pow(1-GACHA.filter(x=>x[2]<=PITY_MAX_W).reduce((a,x)=>a+x[2],0)/1000,9)*100).toFixed(2)}%）`));
    // 收藏鎖定與容量
    S=fresh();S.gold=1e6;S.mats.iron=1e4;S.mats.oak=1e4;const lk=makeWeapon('t1_woodaxe',0,0,[]);lk.lock=true;const m1=meltCore(lk.id);
    while(S.weapons.length<CAP_WEAPONS)makeWeapon('t1_woodaxe',0,0,[]);const f1=forgeStart('t1_woodaxe',1,false);
    res.push(T('E14 收藏武器不能熔解、武器庫滿 200 把不能再鍛造',m1===null&&!!W(lk.id)&&typeof f1==='string',`收藏熔解${m1===null?'被擋下':'成功(錯誤)'}；滿倉鍛造：${typeof f1==='string'?f1:'成功(錯誤)'}`));
    // 殘渣不能套利
    const cost1=Object.entries(recipe(BP.t1_woodaxe)).reduce((a,[k,n])=>a+n*(k==='iron'?8:6),0)+TIERS[0].gold,slagVal=TIERS[0].slag*(4*8/3);
    res.push(T('E13 爆裝殘渣價值低於武器成本（無法靠爆裝獲利）',slagVal<cost1*.3,`鐵製爆裝殘渣約值 ${slagVal.toFixed(1)} 金幣，鍛造成本約 ${cost1} 金幣（不含強化費）`));
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
    const c=recipe(b);if(b.t===0){for(const k in c){const lack=c[k]-S.mats[k];if(lack>0){const p=SHOP_MATS.find(x=>x[0]===k)[1];if(S.gold>=lack*p+TIERS[0].gold){S.gold-=lack*p;S.mats[k]+=lack}}}}
    if(!S.jobs.length&&hasMats(c)&&S.gold>=TIERS[b.t].gold){forgeStart(b.id,1,S.items.blueprint>0);M.forgedTry++;return true}
    if(b.t>0)return false;// 高階材料不足就等
  }
  return false;
}
function aiSession(P,M){
  // 收成、月卡、課金行為
  S.villages.forEach((st,i)=>collectCore(i));
  if(P.monthly){if(!monthlyOn()){S.monthly.until=NOW()+30*864e5;S.gems+=300;M.paid+=150}if(S.monthly.last!==today()){S.monthly.last=today();S.gems+=50}}
  if(P.whale){if(!M.paidToday[today()]){M.paidToday[today()]=1;S.gems+=1280;M.paid+=590;const r=pullCore(10);}
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
          const next=w.lv+1,danger=next>stable(w),cost=enhCost(w);if(S.gold<cost)break;
          if(danger){const canReach=power(w,Math.min(15,stable(w)+2))>=v.req;if(!canReach)break;
            const useScroll=S.items.scroll>0;if(!useScroll&&Math.random()>P.risk)break;
            const r=enhanceCore(w.id,{scroll:useScroll,bless:P.whale&&S.items.bless>0});if(r.k==='broke'){M.breaks++;break}if(r.k!=='ok')break}
          else{const r=enhanceCore(w.id,{});if(r.err)break}
        }
      }
      if(w&&W(w.id)&&power(w)>=v.req&&v.need&&!affixVal(w,v.need)){
        while(S.mats.shard>=1&&S.gold>=enchCost(w)&&!affixVal(w,v.need))enchantCore(w.id,0);   // v3.84 只能隨機：抽到為止
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
    if(cand){for(let n=0;n<6&&W(cand.id);n++){const next=cand.lv+1,danger=next>stable(cand);if(S.gold<enhCost(cand)+10000)break;
      if(danger&&!(S.items.scroll>0)&&Math.random()>P.risk)break;const r=enhanceCore(cand.id,{scroll:danger&&S.items.scroll>0});if(r.k==='broke'){M.breaks++;break}}}}
  // 賣掉多餘的一階材料
  for(const k in SELL_PRICE){if(S.mats[k]>60){const n=S.mats[k]-60;S.mats[k]-=n;S.gold+=n*SELL_PRICE[k]}}
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
    const safe=[['t1_ironsword',6],['t2_longsword',6],['t3_greatsword',6],['m_firegiant',6],['t4_sword',6]].every(([b,st])=>{for(let n=1;n<=st;n++)if(breakChance({b},n)!==0)return false;return breakChance({b},st+1)===.5});
    res.push(T('F 安定值內爆裝率 0%，超過安定值第一階為 50%（v4.00 難度 B）',safe,'鐵製、霜銀、龍鱗、神器、巨人 安定值都是 +6，全部符合'));
    // 倍率表
    const tbl=[1,1.1,1.2,1.3,1.4,1.5,1.6,1.78,1.96,2.14,2.32,2.5,2.68,2.86,3.04,3.22];
    res.push(T('F 強化倍率加法累積（+0～+15 對照規格表）',tbl.every((x,i)=>near(enhMult(i),x,1e-9)),tbl.map((x,i)=>'+'+i+' '+enhMult(i).toFixed(2)).join('、')));
    // 費用、祝福石、防爆卷、道具不足
    S=fresh();S.gold=1e7;S.items.bless=3;S.items.scroll=0;const w=makeWeapon('t1_ironsword',0,9,[]);
    const c=enhCost(w),g0=S.gold,b0=S.items.bless;const r1=enhanceCore(w.id,{bless:true});const bUsed=b0-S.items.bless;
    const costOk=g0-S.gold===c&&c===Math.round(ENH_COST[9]*1)&&bUsed===1;
    const w2=makeWeapon('t1_ironsword',0,9,[]);const r2=enhanceCore(w2.id,{scroll:true}),g1=S.gold;
    S.items.bless=0;const r3=enhanceCore(w2.id||0,{bless:true});
    res.push(T('F 費用一致、祝福石必定消耗、道具不足直接拒絕（不扣費）',costOk&&r2.need==='scroll'&&(!W(w2.id)||r3.need==='bless')&&S.gold===g1,`+9 費用 ${c}（表定 ${ENH_COST[9]}）；祝福石扣 ${bUsed}；防爆卷不足：${r2.err}；祝福石不足：${r3.err||'—'}`));
    // v3.14 規則：危險區勾選防爆卷，每次強化都消耗 1 張；判定爆裝時武器保留
    S=fresh();S.gold=1e9;S.items.scroll=1e6;let used=0,saved=0,okN=0,failN=0,broken=0;
    for(let n=0;n<20000;n++){const x=makeWeapon('t1_ironsword',0,9,[]);const s0=S.items.scroll;const o=enhanceCore(x.id,{scroll:true});used+=s0-S.items.scroll;
      if(o.k==='saved')saved++;else if(o.k==='ok')okN++;else if(o.k==='broke')broken++;else failN++;S.weapons=[]}
    let safeUsed=0;{const y=makeWeapon('t1_ironsword',0,0,[]);const s0=S.items.scroll;enhanceCore(y.id,{scroll:true});safeUsed=s0-S.items.scroll;S.weapons=[]}
    res.push(T('F 危險區勾選防爆卷每次都消耗 1 張、爆裝時武器保留；安定區不消耗',used===20000&&saved>0&&broken===0&&safeUsed===0,`20,000 次 +9→+10：消耗 ${used} 張；防爆生效 ${saved}、成功 ${okN}、普通失敗 ${failN}、爆裝 ${broken}；安定區強化消耗 ${safeUsed} 張`));
    // 攻擊力同步
    S=fresh();S.gold=1e9;const y=makeWeapon('t2_longsword',3,5,[]);y.ench[0]={k:'flame',v:10};const pre=power(y,6);let o;do{o=enhanceCore(y.id,{scroll:true})}while(o.k!=='ok'&&W(y.id));
    res.push(T('F 強化介面預估攻擊力＝成功後實際攻擊力',!W(y.id)||power(y)===pre||y.lv!==6,`預估 ${pre}，實際 ${W(y.id)?power(y):'—'}`));
    // 測試武器與指定結果不動正式資源
    S=fresh();S.gold=500;S.items.scroll=2;S.items.bless=2;const tw=makeWeapon('t3_greatsword',2,5,[]);tw.test=true;const snap=JSON.stringify([S.gold,S.items,S.stats]);
    const f1=enhanceCore(tw.id,{force:'saved'}),f2=enhanceCore(tw.id,{force:'fail'}),f3=enhanceCore(tw.id,{force:'ok',bless:true}),f4=enhanceCore(tw.id,{force:'break',scroll:true});
    res.push(T('F 開發工具指定結果只作用於測試武器，不扣正式資源',f1.k==='saved'&&f2.k==='fail'&&f3.k==='ok'&&f4.k==='broke'&&!W(tw.id)&&snap===JSON.stringify([S.gold,S.items,S.stats]),`指定 防爆→${f1.k}、失敗→${f2.k}、成功→${f3.k}、爆裝→${f4.k}；資源與統計${snap===JSON.stringify([S.gold,S.items,S.stats])?'完全沒變':'有變動(錯誤)'}`));
    S.gold=1e9;let nb=0;for(let n=0;n<300;n++){const nw=makeWeapon('t1_ironsword',0,0,[]);if(enhanceCore(nw.id,{force:'break'}).k==='broke')nb++;S.weapons=[]}
    res.push(T('F 正式武器忽略指定結果',nb===0,'正式 +0 武器指定「爆裝」300 次，實際爆裝 '+nb+' 次（安定區照規則不會爆）'));
  }));
  return{res,rows};
}

/* ---------- I. v3.71 鐵匠聲望／天賦 ---------- */
function repTests(){const res=[];
  withSandbox(()=>{QUIET=false;repGain.mute=true;try{
    S=fresh();S=sanitize(S);const g0=S.gold,b0=S.items.bless;let need=0;for(let l=1;l<5;l++)need+=repNeed(l);const up=repGain(need);
    res.push(T('I1 聲望升級：經驗剛好升 4 級、天賦點 4、Lv5 寶箱有祝福石',up===4&&S.rep.lv===5&&S.rep.xp===0&&repPts()===4&&S.items.bless===b0+1&&S.gold===g0+100*(2+3+4+5),`Lv.${S.rep.lv}、點數 ${repPts()}、金幣 +${S.gold-g0}、祝福石 +${S.items.bless-b0}`));
    let e1='';for(let n=0;n<4;n++)e1=talentUp('gold')||e1;const e2=talentUp('gold');
    res.push(T('I2 天賦點用完不能再點、上限擋住',!e1&&e2==='天賦點不夠'&&S.rep.t.gold===4&&repPts()===0,`商隊議價 Lv${S.rep.t.gold}，第 5 次：${e2}`));
    S.rep.t.qual=20;const q=qualWeights(false,0),sum=q.reduce((a,b)=>a+b,0);
    res.push(T('I3 巨匠之手滿級：品質權重總和仍 1000、普通減 10%',Math.round(sum)===1000&&q[0]===QW[0]-100,`權重 ${q.map(x=>Math.round(x)).join('/')}，總和 ${Math.round(sum)}`));
    {const s0=S;S=fresh();S.villages.forEach(v=>v.status='cleared');S.furnace=6;S.gold=1e9;S.slots=4;
      const big=BPS.filter(b=>b.t===4)[0];for(const k of new Set([...Object.keys(S.mats),...Object.keys(recipe(big))]))S.mats[k]=1e6;const j1=forgeStart(big.id,1,false),e1=forgeStart('t1_woodaxe',1,false);const d1=j1.end-j1.start;j1.end=0;tick();const j10=forgeStart('t1_woodaxe',10,false),d10=j10.end-j10.start;
      const o=sanitize(JSON.parse(JSON.stringify({...S,jobs:[{b:'t3_halberd',qty:1,start:1000,end:1000+240000}]})));S=s0;
      res.push(T('I4 鍛造一律 5 秒、一次一批，舊存檔的長鍛造縮成 5 秒',d1===FORGE_SEC*1000&&d10===FORGE_SEC*1000&&typeof e1==='string'&&o.jobs[0].end===1000+FORGE_SEC*1000&&!('forge' in TALENTS),
        `巨人武器 ${d1/1000} 秒、伐木斧 ×10 ${d10/1000} 秒；鍛造中再開：${e1}；舊存檔結束時間 ${(o.jobs[0].end-1000)/1000} 秒後`))}
    const x=sanitize(JSON.parse(JSON.stringify({...S,rep:{lv:'abc',xp:-5,t:{gold:999,forge:-3,zz:5}}})));
    res.push(T('I5 存檔修正：壞掉的聲望資料會被修好',x.rep.lv===1&&x.rep.xp===0&&x.rep.t.gold===TALENTS.gold.max&&!('forge' in x.rep.t)&&!('zz' in x.rep.t),JSON.stringify(x.rep)));
  }finally{repGain.mute=false}});
  return res}

/* ---------- J. v3.72 每週限時活動 ---------- */
// v3.76 第二界約頓海姆＋巨人體重鍊
// v4.16 附魔與祈願隨關卡開放
function unlockTests(){return withSandbox(()=>{const res=[];S=sanitize(fresh());
  const p0=affPool(),g0=gachaPool(),sum0=g0.reduce((a,x)=>a+x[2],0);
  res.push(T('U1 開局只會 5 種基本符文、祈願抽不到後面的素材',p0.length===5&&!p0.includes('giant')&&!p0.includes('holy')&&!g0.some(x=>x[0]==='icecore'||x[0]==='scale')&&Math.abs(sum0-1000)<1e-9&&g0.some(x=>x[2]<=PITY_MAX_W),`詞條 ${p0.join(',')}；祈願總和 ${sum0}`));
  S.villages[7].status='open';const p1=affPool();
  res.push(T('U2 1-8 開放就學會剋巨人',p1.includes('giant')&&!p1.includes('holy'),`詞條 ${p1.length} 種`));
  S.villages.forEach(v=>v.status='open');const p2=affPool(),g2=gachaPool();
  res.push(T('U3 全部開放後回到 12 種、祈願表跟原本一樣',p2.length===12&&g2.length===GACHA.length&&g2.every((x,i)=>x[2]===GACHA[i][2]),`詞條 ${p2.length}；祈願 ${g2.length} 項`));
  return res})}
function realm2Tests(){const res=[];
  withSandbox(()=>{
    S=fresh();S.speed=1;
    const o=JSON.parse(JSON.stringify(S));o.villages=o.villages.slice(0,10);o.villages.forEach(v=>v.status='cleared');o.weapons=[{id:1,b:'t3_greataxe',q:2,lv:3,rf:9,traits:[],ench:[null,null,null,null]},{id:2,b:'t1_woodaxe',q:0,lv:0,rf:3,traits:[],ench:[]}];o.nextId=3;
    const s=sanitize(o);
    res.push(T('K1 舊存檔補上第二界、收復 1-10 後 2-1 自動開放、重鍊等級夾在 0～5',s.villages.length===20&&s.villages[10].status==='open'&&s.villages[11].status==='locked'&&s.weapons[0].rf===5&&s.weapons[1].rf===0,`村莊 ${s.villages.length}；2-1 ${s.villages[10].status}；龍鱗 rf ${s.weapons[0].rf}、鐵製 rf ${s.weapons[1].rf}`));
    res.push(T('K2 關卡編號 1-1／1-10／2-1／2-10',[0,9,10,19].map(vNo).join(',')==='1-1,1-10,2-1,2-10',[0,9,10,19].map(vNo).join(',')));
    S=s;S.gold=100000;for(const k of ['giantbone','permafrost','thunderiron','elderroot'])S.mats[k]=100;
    const w=makeWeapon('t3_greataxe',2,3,[]),p0=power(w),g0=S.gold,b0=S.mats.giantbone;
    const r1=reforgeCore(w.id);
    const okCost=r1&&S.gold===g0-5000&&S.mats.giantbone===b0-2&&Math.abs(power(w)-p0*1.12)<=1;
    for(let k=0;k<6;k++)reforgeCore(w.id);
    const iron=makeWeapon('t1_woodaxe',0,0,[]);deliverCore(10,w.id);
    res.push(T('K3 重鍊扣材料金幣、攻擊力 +12%、最高 Lv5、鐵製不能重鍊',okCost&&w.rf===5&&Math.abs(power(w)-p0*1.6)<=1&&!reforgeCore(iron.id),`Lv1 攻擊力 ${p0}→${r1&&r1.p1}；滿級 Lv${w.rf} 攻擊力 ${power(w)}（×${(power(w)/p0).toFixed(2)}）`));
    S.villages.forEach(v=>v.status=v===S.villages[0]?'open':'locked');
    res.push(T('K4 第二界沒開放時不能重鍊',!reforgeCore(makeWeapon('t3_greataxe',2,0,[]).id)&&!rfOpen(),'1-10 未收復'));
  });
  return res}
function evtTests(){const res=[];
  withSandbox(()=>{const keepW=EVT_WK;try{
    // v3.87 整週首領：台灣時間週日 00:00 換週；取消雙倍收成
    const sun=Date.UTC(2026,9,25,0,0)-TZ8,sat=sun-60e3,mon=sun+DAY,nsun=sun+7*DAY;
    res.push(T('J1 台灣時間週日 00:00 換週、首領整週開打',evtWeek(sat)+1===evtWeek(sun)&&evtWeek(mon)===evtWeek(sun)&&evtWeek(nsun)===evtWeek(sun)+1&&evtStart(evtWeek(sun))===sun&&evtNow().k==='boss',`週六 23:59＝${evtWeek(sat)}、週日 0 點＝${evtWeek(sun)}、週一＝${evtWeek(mon)}`));
    S=fresh();S.villages[0].strat='normal';const st=S.villages[0];rollCycle(0,null,st,mon);const g1=st.bank.gold;st.bank={cycles:0,gold:0,mats:{},events:0};rollCycle(0,null,st,mon+4*DAY);const g2=st.bank.gold;
    res.push(T('J2 取消雙倍收成：週一和週五收成金幣一樣',g1===g2&&g2===VILLAGES[0].gold,`週一 ${g1}、週五 ${g2}`));
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
function layoutTests(){if(typeof document==='undefined')return[];const res=[],keep=[ui.tab,ui.ftab];
  const views=[['商城',()=>viewShop()],['武器庫',()=>viewArmory()],['村莊',()=>viewVillage()],['材料倉庫',()=>{ui.ftab='mat';return viewForge()}],['每日任務',()=>{ui.qTab='d';return sheetAch()}],['七日簽到',()=>{ui.qTab='s';return sheetAch()}],['鐵匠天賦',()=>sheetTalent()]];
  const box=document.createElement('div');box.className='wrap';box.style.cssText='position:absolute;left:-10000px;top:0;visibility:hidden';document.body.appendChild(box);
  for(const[n,f]of views){const bad=[];
    for(const w of[320,360,375,393,414,430,480]){box.style.width=(w-24)+'px';box.innerHTML=f();
      box.querySelectorAll('*').forEach(el=>{const t=[...el.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent.trim()).join('');if(t.length<3)return;
        const r=el.getBoundingClientRect(),fs=parseFloat(getComputedStyle(el).fontSize)||14;if(!r.width)return;
        if(r.width<fs*2.2&&r.height>fs*3.5)bad.push(`${w}px「${t.slice(0,8)}」直排`)});
      box.querySelectorAll('button').forEach(b=>{if(b.textContent.trim().length>1&&b.offsetWidth&&textOut(b))bad.push(`${w}px 按鈕「${b.textContent.trim().slice(0,10)}」字超出`)})}
    res.push(T('G 版面 '+n+'（320～480px 寬）沒有直排或字超出按鈕',!bad.length,bad.length?[...new Set(bad)].slice(0,4).join('；'):'7 種寬度都正常'))}
  box.remove();[ui.tab,ui.ftab]=keep;ui.qTab=null;return res}
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
  const ok=v.name==='彩虹橋頭'&&u.name==='維莫爾河渡口'&&u.cat==='hammer'&&!badGod.length&&!old.length&&VILLAGES[17].name==='烏特加德城'&&VILLAGES[8].need==='frost'&&drag.need==='dragon'&&drag.drops.some(d=>d[0]==='scale')&&!noScale.length&&v.drops.some(d=>d[0]==='rainbow')&&MATS.rainbow&&eligible(9,mk({k:'holy',v:15}))&&!eligible(9,mk({k:'dragon',v:40}))&&TAGN[v.tag]&&TAGN[drag.tag];
  return[T('H 關卡跟故事一致：神的關卡都要神聖、2-10 要戰錘、1-9 要霜寒、2-6 蠕龍要剋龍且掉龍鱗、舊名稱都換掉、1-10 掉虹橋碎晶',!!ok,`沒要神聖的神：${badGod.map(vNo).join('、')||'無'}；舊名稱：${old.map(x=>x.name).join('、')||'無'}；不該掉龍鱗：${noScale.map(x=>x.name).join('、')||'無'}`)]}
// v4.24 第一、二界故事主線：1-8／2-9 對調、2-10 索爾、代名詞（神＝祂，怪物＝牠，不用他／她／它）
function storyTests(){const pr=[...MON_LORE,...VILLAGES.map(v=>v.txt)].map((t,i)=>[i,t]).filter(([i,t])=>/[他它]|(?<!巨人女巫放話：先打贏)她/.test(t.replace(/其他|試試它/g,'')));
  const ok=MONS[7]==='莫庫卡爾菲'&&MONS[18]==='赫朗格尼爾'&&MONS[19]==='索爾'&&MON_T[19]==='雷神'&&VILLAGES[18].name==='石籬原'&&!VILLAGES[18].drops.some(d=>d[0]==='fireheart')&&KN_FULL.includes(18)&&KN_FULL.includes(7)&&KN_FULL.includes(19)&&!Object.keys(ART_WAIT).length&&BP.g_skadi.n==='索爾之錘'&&BP.g_skadi.cat==='hammer'&&BP.g_skadi.inn[0]==='thunder'&&GOD.g_skadi.god==='索爾'&&MATS.srelic==='雷神錘柄';
  return[T('H 故事主線：1-8 泥巨人、2-9 石籬原赫朗格尼爾（全身圖跟著搬）、2-10 雷神索爾＋索爾之錘',!!ok,`1-8 ${MONS[7]}、2-9 ${VILLAGES[18].name} ${MONS[18]}、2-10 ${MONS[19]}`),
    T('H 代名詞：怪物傳說和關卡說明不用他／她／它（指武器的「它」除外）',!pr.length,pr.length?'還有：'+pr.map(x=>x[0]).join('、'):'都改好了')]}
// v4.27 神明用「祂」：神的傳說、村莊文字不能用他／她／牠
function godWordTests(){const bad=VILLAGES.map((v,i)=>i).filter(i=>/神/.test(MON_T[i]||'')&&/[他她牠]/.test(MON_LORE[i]+VILLAGES[i].txt));
  return[T('H 神明用「祂」：神的傳說、村莊文字都不用他／她／牠',!bad.length,bad.length?'傳說：'+bad.map(vNo).join('、'):'都用祂')]}
// v4.14 村莊需求：每座村莊的需求面板都列得出同類圖紙
function vNeedTests(){const bad=VILLAGES.map((v,i)=>i).filter(i=>{const h=vNeedPanel(i);return !/data-act="vforge"/.test(h)||/data-act="bp"/.test(h)});
  return[T('H 村莊需求：每座村莊都列出可點的同類圖紙（點了跳到鍛造頁）',!bad.length,bad.length?'沒有圖紙：'+bad.map(vNo).join('、'):VILLAGES.length+' 座都有')]}
// v4.02 武器打法：每種還在的武器類別都有打法與說明，連擊間隔加起來比攻擊間隔短
function hitTests(){const cats=[...new Set(BPS.map(b=>b.cat))],miss=cats.filter(c=>!HIT[c]||!HIT_N[c]);
  const bad=Object.entries(HIT).filter(([k,h])=>{const z={};let sum=0;for(let n=0;n<400;n++){const p=h.plan(z);if(p.some(x=>x[0]>=h.iv*.85))return true;sum+=p.reduce((a,x)=>a+x[1],0)}return k!=='shield'&&Math.abs(sum/400/h.E-1)>.15});
  return[T('H 武器打法：每種武器類別都有打法，連擊在下一輪前打完、平均倍率和設定相符',!miss.length&&!bad.length,miss.length?'缺：'+miss.join('、'):bad.length?'不符：'+bad.map(x=>x[0]).join('、'):cats.length+' 種都有')]}
// v3.84 附魔 12 種：只能隨機、攻擊力／狩獵各 5 種、受襲機制刪除（堅固改成每輪金幣）
function enchTests(){const mk=(e,t)=>({id:-1,b:'t3_greataxe',q:0,lv:0,traits:t||[],ench:[...e,null,null,null,null].slice(0,4)});const gi=VILLAGES.findIndex(v=>v.tag==='giant'),bi=VILLAGES.findIndex(v=>v.tag==='beast'&&v.danger>0&&v.drops.some(d=>d[1]<RARE_P));
  const a=goldMul(bi,mk([{k:'greed',v:15}])),b=goldMul(gi,mk([{k:'giant',v:40}])),st=goldMul(bi,mk([],[{k:'sturdy',v:20}])),g=goldMul(bi,mk([{k:'greed',v:15},{k:'greed',v:15}],[{k:'sturdy',v:45}]));
  const rd=VILLAGES[bi].drops.find(d=>d[1]<RARE_P),sk=dropChance(bi,mk([{k:'seek',v:20}]),rd,'normal')/dropChance(bi,mk([]),rd,'normal');
  const p0=power(mk([])),pw=power(mk([{k:'thunder',v:10},{k:'holy',v:10}])),gp=Object.entries(AFFIX).reduce((o,[k,x])=>(o[x.g]=(o[x.g]||0)+1,o),{}),tw=Object.values(AFFIX).reduce((x,y)=>x+y.w,0);
  const S0=S;S=fresh();S.gold=1e6;S.mats.shard=500;S.anvil=5;S.villages.forEach(v=>v.status='open');const z=makeWeapon('t1_woodaxe',0,0,[]);const cnt={};for(let n=0;n<400;n++){enchantCore(z.id,0);cnt[z.ench[0].k]=1}const used=500-S.mats.shard;S=S0;
  let hv=0;{const st2={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};const w0=mk([{k:'harvest',v:25},{k:'harvest',v:25}]);for(let n=0;n<4000;n++)rollCycle(0,w0,st2,Date.UTC(2026,9,23,4));hv=st2.bank.events}
  const ok=Object.keys(AFFIX).length===12&&gp.pow===5&&gp.hunt===5&&tw===100&&Math.abs(a-1.15)<1e-9&&Math.abs(b-1.4)<1e-9&&Math.abs(st-1.2)<1e-9&&Math.abs(g-1.4)<1e-9&&Math.abs(sk-1.2)<1e-6&&Math.abs(pw/p0-1.2)<.02&&eventChance(bi,mk([]))===0&&hv===0&&used===400&&Object.keys(cnt).length>=10&&Object.values(AFFIX).every(x=>x.max<=40);
  return[T('I 附魔 12 種：只能隨機（1 碎片）、攻擊力／狩獵各 5、貪婪＋堅固上限 40%、剋巨人金幣、尋珍、受襲刪除',ok,`攻擊力 ${gp.pow}／狩獵 ${gp.hunt}；權重 ${tw}；貪婪×${a.toFixed(2)}、堅固×${st.toFixed(2)}、上限×${g.toFixed(2)}、剋巨人×${b.toFixed(2)}、尋珍×${sk.toFixed(2)}、雷霆＋神聖攻擊力×${(pw/p0).toFixed(2)}；400 次附魔用 ${used} 碎片、出現 ${Object.keys(cnt).length} 種；受襲 ${hv} 次`)]}
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
  return[T('N1 每關需求不低於難度曲線（中度）',!low.length,low.length?low.map(d=>d.v.name+' '+d.v.req+'<'+d.curve).join('、'):'20 關都 ≥ 曲線'),
    T('N2 1-1 以外普通 +0 不能直接交付',!free.length,free.length?free.map(d=>d.v.name).join('、'):'都要強化'),
    T('N3 10 關新需求和公告一致',!miss.length,miss.length?miss.map(([i])=>VILLAGES[i].name).join('、'):'一致')]}
// v4.15 神明武器：滿加成弱於下一界、遺物只在神的關卡掉、覺醒等級和效果、稱號
function gwTests(){const ck=godCheck(),bad=ck.filter(x=>!x.ok);
  const rel=VILLAGES.map((v,i)=>[i,v.drops.filter(d=>d[0]==='hrelic'||d[0]==='srelic').map(d=>d[0])]).filter(x=>x[1].length),relOk=rel.length===2&&rel[0][0]===9&&rel[0][1][0]==='hrelic'&&rel[1][0]===19&&rel[1][1][0]==='srelic';
  const S0=S;S=fresh();const lk0=!!bpLock(BP.g_hofund);S.villages.forEach((v,i)=>{if(i<10)v.status='cleared'});S.furnace=5;const lk1=!bpLock(BP.g_hofund)&&!!bpLock(BP.g_skadi);
  const w=makeWeapon('g_hofund',0,6,[]),n6=awkN(w),p10=power(w,10),p11=power(w,11),b10=Math.round(15*12*1.15*enhMult(10)),b11=Math.round(15*12*1.15*enhMult(11)*1.1);
  w.lv=7;const tr=timeReduction(9,w);w.lv=13;const n13=awkN(w);const t0=titleLocal('watcher');w.lv=15;const t1=titleLocal('watcher');S=S0;
  return[T('GW1 神明武器滿加成弱於下一界的新材質',!bad.length,ck.map(x=>x.n+' ×'+x.max.toFixed(1)+'＜×'+x.next).join('；')),
    T('GW2 遺物只在 1-10、2-10 掉，鍛造要 6 個',relOk&&BP.g_hofund.r.hrelic===6&&BP.g_skadi.r.srelic===6,rel.map(x=>vNo(x[0])+' '+x[1]).join('、')),
    T('GW3 圖紙解鎖：收復 1-10 才能打霍夫德、索爾之錘要 2-10',lk0&&lk1,`收復前鎖 ${lk0}；收復 1-10 後 ${lk1}`),
    T('GW4 覺醒：+6 沒有、+7 狩獵 −3%、+11 攻擊力 ×1.1、+13 四段、+15 稱號',n6===0&&Math.abs(tr-.03)<1e-9&&p10===b10&&p11===b11&&n13===4&&!t0&&t1,`+6 段數 ${n6}；+7 縮短 ${tr}；+10 ${p10}/${b10}；+11 ${p11}/${b11}；+13 段數 ${n13}；稱號 ${t0}→${t1}`)]}
function runTests(mode){
  if(mode==='econ')return econHtml(12)+econHtml(8);
  const r=runAll({N:100000});r.res.push(...frameLvTests(),...layoutTests(),...monTests(),...mythTests(),...dexTests(),...godReqTests(),...storyTests(),...curveTests(),...vNeedTests(),...godWordTests(),...hitTests(),...enchTests(),...wsTests(),...gwTests());const pass=r.res.filter(x=>x.pass).length;
  return `<div><b>${pass}/${r.res.length} 通過</b>（${r.ms} 毫秒）</div>`+resHtml(r.res);
}
// v4.34 武器框顏色看強化等級
function frameLvTests(){if(typeof FLV==='undefined')return[];const exp={0:0,1:1,6:1,7:2,8:2,9:3,10:3,11:4,12:5,15:5},bad=Object.entries(exp).filter(([lv,f])=>FLV(+lv)!==f);
  return[T('FL1 框色：+0 灰、+1～+6 綠、+7～+8 藍、+9～+10 紅、+11 紫、+12 鑽石',!bad.length,bad.length?'錯：'+bad.map(x=>'+'+x[0]).join('、'):'10 個等級都對')]}
if(typeof module!=='undefined')module.exports={runAll,econReport,simulate,levelCheck};
