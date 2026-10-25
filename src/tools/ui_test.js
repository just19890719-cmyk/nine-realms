const BASE=process.env.BASE||'http://localhost:8765/index.html'; // 先在 repo 根目錄跑：python3 -m http.server 8765
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();const out=[];const errs=[];
 for(const vp of (process.env.VPS?JSON.parse(process.env.VPS):[{w:390,h:844,n:'390×844'}])){
  const ctx=await browser.newContext({viewport:{width:vp.w,height:vp.h},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(vp.n+' '+e.message));
  await p.goto(''+BASE+'');await p.waitForTimeout(500);
  const R=(ok,t)=>out.push((ok?'PASS ':'FAIL ')+vp.n+' '+t);
  { // v3.20 登入畫面與開場故事
    const g=await ctx.newPage();await g.goto(''+BASE+'#gate');await g.waitForTimeout(600);
    const a=await g.evaluate(()=>{const gt=document.getElementById('gate');const r=document.querySelector('.gt-box').getBoundingClientRect();return [!!gt,r.bottom<=innerHeight+1&&r.top>=0,getComputedStyle(document.body).overflow==='hidden']});
    R(a[0]&&a[1]&&a[2],'登入畫面一頁放得下、不用捲動');
    await g.evaluate(()=>{S.introSeen=0});await g.click('[data-gt=guest]');await g.waitForTimeout(700);
    const s=await g.evaluate(()=>!!document.querySelector('.st-scene'));R(s,'訪客進入後播放開場故事');
    await g.click('.st-skip');await g.waitForTimeout(600);
    const d=await g.evaluate(()=>[!document.getElementById('gate'),S.introSeen===1]);R(d[0]&&d[1],'略過故事後進入遊戲、記住已看過');await g.close()}
  const ov=async t=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(o>1)R(false,t+' 水平溢出 '+o+'px')};
  const closeAll=async()=>{await p.evaluate(()=>{if(ui.busy&&ui.fxDone)ui.fxDone()});await p.evaluate(()=>{document.getElementById('toasts').innerHTML=''});await p.evaluate(()=>{ui.sheet=null;ui.result=null;ui.enhLast=null;render()});await p.waitForTimeout(60)};
  await ov('鐵匠鋪');
  // 觸控目標
  const small=await p.evaluate(()=>[...document.querySelectorAll('.btn,.nav button,.subtabs button,.icon-btn,.stepper button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.height<43.5||r.width<43.5)}).map(e=>e.textContent.trim().slice(0,8)));
  R(!small.length,'主要按鈕觸控尺寸 ≥44px'+(small.length?'：'+small.join(','):''));
  // 鍛造
  await p.click('[data-act=forge]');const q=await p.evaluate(()=>S.jobs.length);R(q===1,'開始鍛造（切到鍛造佇列）');
  const qtab=await p.evaluate(()=>ui.ftab);R(qtab==='queue','鍛造後顯示佇列分頁');
  await p.evaluate(()=>devdo('forge'));await p.waitForTimeout(150);
  await p.click('[data-act=tab][data-k=armory]');await ov('武器庫');
  await p.click('.b2-grid [data-act=wopen]');await p.waitForTimeout(150);await ov('武器詳情');
  const hasSec=await p.evaluate(()=>!!document.querySelector('.sheet.wpop')&&['攻速','附加效果','相剋','屬性'].every(t=>document.querySelector('.sheet').textContent.includes(t)));R(hasSec,'點武器跳出小卡，有攻速／附加效果／相剋／屬性（v4.40）');
  await p.click('[data-act=wmode][data-m=give]');await p.click('[data-act=deliver]');await p.waitForTimeout(100);
  R(await p.evaluate(()=>S.villages[0].status==='cleared'),'交付 1-1');
  // 村莊收成
  await p.click('[data-act=tab][data-k=village]');await ov('村莊');
  await p.evaluate(()=>devdo('hunt'));await closeAll();
  const ready=await p.$('.vcard.ready');R(!!ready,'可收成村莊有醒目標示');
  await p.click('.vcard [data-act=collect]');await p.waitForTimeout(100);const m=await p.$('.modal');R(!!m,'收成後顯示收成獎勵視窗');
  const g1=await p.evaluate(()=>S.gold);await p.click('.modal-card [data-act=rclose]');
  const dis=await p.$eval('[data-act=collectAll]',b=>b.disabled);R(dis,'收成後全部收成按鈕變成停用（不會重複結算）');
  await p.click('[data-act=vopen][data-i="0"]');await ov('村莊詳情');await p.click('[data-act=strat][data-k=material]');R(await p.evaluate(()=>S.villages[0].strat==='material'),'切換狩獵策略');
  await closeAll();
  // 強化：危險區、動畫中不能重複送出
  await p.evaluate(()=>{devdo('gold');devdo('items');devdo('w6')});await closeAll();
  const id=await p.evaluate(()=>S.weapons.find(w=>w.b==='t2_longsword').id);
  await p.evaluate(id=>{ui.sheet={t:'w',id,m:'enh'};render()},id);await ov('強化頁');
  R(!!(await p.$('.enh-stage.danger')),'危險區有不同視覺氛圍');R(!!(await p.$('.warn,.guardline')),'危險強化警告或防爆保護提示');
  const tries0=await p.evaluate(()=>S.stats.enhTry);await p.click('[data-act=enhance]');R(!!(await p.$('.sheet #enhStage.playing')),'動畫在強化頁內播放（沒有切到全黑畫面）');
  await p.evaluate(id=>{enhance(id);enhance(id)},id);const tries1=await p.evaluate(()=>S.stats.enhTry);R(tries1-tries0===1,'動畫播放中不能重複強化（只送出 1 次）');
  await p.waitForTimeout(5400);const shown=await p.$('.enh-ribbon.show');R(!!shown,'動畫結束後結果文字顯示在武器下方');
  const kind=await p.evaluate(()=>ui.enhLast&&ui.enhLast.k);const again=await p.evaluate(()=>{const b=document.querySelector('.sheet [data-act=enhance],.sheet [data-act=backArmory]');return b?b.textContent:''});
  R(await p.evaluate(()=>ui.busy===false)&&/再次強化|回武器庫|確認強化/.test(again),'結果出現後可直接再強化（結果：'+kind+'，按鈕：'+again+'）');
  await closeAll();
  // 略過動畫
  await p.evaluate(()=>{devdo('items');devdo('w6')});await closeAll();const id3=await p.evaluate(()=>S.weapons.filter(w=>w.b==='t2_longsword').pop().id);
  await p.evaluate(id=>{ui.enhLast=null;ui.sheet={t:'w',id,m:'enh'};render()},id3);await p.click('[data-act=enhance]');await p.waitForTimeout(200);await p.click('#enhStage');await p.waitForTimeout(100);
  R(await p.evaluate(()=>!ui.busy&&!!document.querySelector('.enh-ribbon.show')),'點畫面可略過動畫');await closeAll();
  // 四種測試動畫
  for(const k of ['ok','fail','broke','saved']){await p.evaluate(k=>devdo('fx_'+k),k);await p.waitForTimeout(5400);R(await p.evaluate(()=>!ui.busy&&!!document.querySelector('.enh-ribbon.show')),'測試動畫 '+k+' 播完');}
  await closeAll();
  // v3.2：道具不足擋下、未保護危險強化確認一次、測試武器指定結果、動畫中切頁
  const g0=await p.evaluate(()=>{S.items.scroll=0;ui.useScroll=true;devdo('w6');return S.gold});await closeAll();
  const id4=await p.evaluate(()=>S.weapons.filter(w=>w.b==='t2_longsword').pop().id);
  await p.evaluate(id=>{ui.enhLast=null;ui.riskArm=ui.riskOk=null;ui.sheet={t:'w',id,m:'enh'};render()},id4);
  const sc4=await p.$eval('#usescroll',b=>[b.checked,b.disabled]);R(!sc4[0]&&sc4[1]&&await p.evaluate(g=>S.gold===g,g0),'防爆卷用完時不能勾選（v3.20 規則）');
  const t0=await p.evaluate(()=>S.stats.enhTry);await p.click('[data-act=enhance]');
  const armTxt=await p.$eval('[data-act=enhance]',b=>b.textContent);R(/確認強化/.test(armTxt)&&await p.evaluate(t=>S.stats.enhTry===t,t0),'沒有防爆卷的危險強化：第一次只要求確認（'+armTxt+'）');
  await p.click('[data-act=enhance]');R(await p.evaluate(t=>S.stats.enhTry===t+1,t0),'第二次才真正強化');await p.evaluate(()=>{ui.fxDone&&ui.fxDone()});await p.waitForTimeout(400);
  const again2=await p.evaluate(()=>{const b=document.querySelector('.sheet [data-act=enhance]');return b?b.textContent:'(武器已損毀)'});R(!/確認/.test(again2),'同一次進入強化頁不會再問（'+again2+'）');
  await closeAll();
  await p.evaluate(()=>{ui.devTier=3;ui.devLv=0;devdo('testw')});const tid=await p.evaluate(()=>ui.sheet&&ui.sheet.id);const snap=await p.evaluate(()=>JSON.stringify([S.gold,S.items,S.stats.enhTry]));
  for(const [f,exp] of [['saved','saved'],['fail','fail'],['ok','ok'],['break','broke']]){await p.evaluate(f=>{DEV.force=f;render()},f);await p.click('[data-act=enhance]');await p.evaluate(()=>{ui.fxDone&&ui.fxDone()});await p.waitForTimeout(400);
    R(await p.evaluate(e=>ui.enhLast&&ui.enhLast.k===e,exp),'測試武器指定結果「'+f+'」→ '+exp)}
  R(await p.evaluate(s=>JSON.stringify([S.gold,S.items,S.stats.enhTry])===s,snap)&&await p.evaluate(id=>!W(id),tid),'測試武器的指定結果不動正式資源，爆裝後正確刪除');
  await closeAll();
  await p.evaluate(()=>{devdo('items');devdo('w6')});await closeAll();const id5=await p.evaluate(()=>S.weapons.filter(w=>w.b==='t2_longsword').pop().id);
  await p.evaluate(id=>{ui.useScroll=true;ui.sheet={t:'w',id,m:'enh'};render()},id5);await p.click('[data-act=enhance]');await p.evaluate(()=>document.querySelector('[data-act=tab][data-k=village]').click());await p.waitForTimeout(200);
  R(await p.evaluate(()=>!ui.busy&&ui.tab==='village'&&!document.querySelector('#enhStage')),'動畫中切換分頁：動畫立即結束、不會殘留或重複判定');
  await closeAll();
  // 附魔欄位依鐵砧
  const wl=await p.evaluate(()=>{devdo('wt');return S.weapons[S.weapons.length-1].id});await closeAll();
  await p.evaluate(id=>{ui.sheet={t:'w',id,m:'ench'};render()},wl);await ov('附魔頁');
  const locked=await p.$$eval('.eslot',b=>b.map(x=>x.classList.contains('locked')));R(locked.join()==='false,false,true,true','附魔第 3、4 格依鐵砧鎖定');
  // 收藏鎖定擋熔解
  await p.evaluate(id=>{ui.sheet={t:'w',id,m:'main'};render()},wl);await p.click('[data-act=lock]');const mdis=await p.$eval('[data-act=melt]',b=>b.disabled);R(mdis,'收藏後熔解按鈕停用');
  await p.click('[data-act=lock]');await p.click('[data-act=melt]');R(await p.evaluate(id=>!!W(id),wl),'熔解第一次只要求確認');await p.click('[data-act=melt]');R(await p.evaluate(id=>!W(id),wl),'第二次才真正熔解');
  await closeAll();
  // 容量
  await p.evaluate(()=>{devdo('fill');devdo('t1');QUIET=true;while(S.weapons.length<200)makeWeapon('t1_woodaxe',0,0,[]);QUIET=false;save()});await closeAll();await p.evaluate(()=>{ui.tab='forge';ui.ftab='bp';ui.bp='t1_woodaxe';ui.qty=10;ui.sheet={t:'bp'};render()});
  const ftxt=await p.$eval('.sel-bp',b=>b.textContent+'|'+b.querySelector('[data-act=forge]').classList.contains('is-disabled'));R(/已滿/.test(ftxt)&&/true$/.test(ftxt),'武器庫容量上限擋下鍛造（'+ftxt+'）');
  // 商店 & 工坊入口
  await p.click('[data-act=tab][data-k=shop]');await ov('商店');R(!(await p.evaluate(()=>document.getElementById('view').textContent.includes('升級熔爐'))),'工坊升級已移出商店');
  await p.click('[data-act=tab][data-k=forge]');await p.click('[data-act=sheetW]');R(await p.evaluate(()=>document.querySelector('.sheet').textContent.includes('熔爐')),'鐵匠鋪內的工坊升級入口');await closeAll();
  // 重整
  const before=await p.evaluate(()=>JSON.stringify([S.weapons.length,S.gold,S.villages[0].strat]));await p.reload();await p.waitForTimeout(400);
  const after=await p.evaluate(()=>JSON.stringify([S.weapons.length,S.gold,S.villages[0].strat]));R(before===after,'重整網頁後狀態恢復 '+before+' → '+after);
  if(vp.w===390){await p.evaluate(()=>{ui.tab='forge';ui.sheet=null;document.getElementById('toasts').innerHTML='';render()});await p.waitForTimeout(300);await p.screenshot({path:'/home/claude/art/final_forge.png'})}
  await ctx.close();
 }
 await browser.close();console.log(out.join('\n'));console.log('ERRORS',errs.length?errs.join('\n'):'無');
})();
