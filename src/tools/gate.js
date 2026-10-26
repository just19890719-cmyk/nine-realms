// 諸神鐵匠 強制驗收關卡（v5.12，Mochi 2026-10-25 決定）：一個指令跑完全部檢查，任何一項沒過就不能合併
//   node src/tools/gate.js [--base=origin/main] --files=src/game.js,src/style.css [--screens=強化小卡,附魔小卡] [--parts=按鈕] [--bug]
//   在 GitHub Actions 上：範圍從 PR 說明讀（「範圍檔案：…」「範圍畫面：…」「範圍元件：…」「類型：BUG」四行），不用帶參數
// 依序：
//   1. 工作區要乾淨（報告一定對應一個 commit，不能拿沒提交的東西當證明）
//   2. 統一測試 run_tests.js（靜態檢查、快速測試、核心流程冒煙、存讀檔、BUG 回歸、360／390／440 畫面）
//   3. 建置產物（index.html 等）要跟 src 一致；改到遊戲本體要升 BUILD_ID
//   4. 失敗項目只能是 known_failures.json 列出的 main 既有問題，而且這份清單只能變短
//   5. 類型是 BUG 時，BUG_HISTORY.md 一定要新增紀錄
//   6. 素材雜湊（已登記素材不能被偷改）、流程檔變更提醒
//   6b. 改到的檔案都要在「範圍檔案」內（Mochi 授權的範圍）；禁改區塊（強化率、爆裝、安全距離、符文時間軸…，見 locked.json）不能被改
//   7. 360／390／440 修改前後對照：範圍外的畫面或共用元件有變動就失敗
// 結果：test-out/gate-report.md（給人看）、test-out/gate-result.json；有任何失敗結束碼 1。
// 這個檔案沒有「跳過」開關，也不准加：沒跑到的項目一律算失敗。
const path=require('path'),fs=require('fs'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..','..'),OUT=path.join(ROOT,'test-out');
const arg=k=>{const a=process.argv.find(x=>x===('--'+k)||x.startsWith('--'+k+'='));return a?(a.includes('=')?a.slice(k.length+3):true):null};
const git=a=>cp.execFileSync('git',a,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const split=s=>String(s||'').split(/[,，、\s]+/).map(x=>x.trim()).filter(x=>x&&!/^(無|none)$/i.test(x));
const dirty=()=>git(['status','--porcelain']).split('\n').filter(l=>l&&!l.startsWith('??'));

// 範圍：參數優先，其次 GitHub PR 說明
function scope(){let body='',labels=[];try{const ev=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));body=(ev.pull_request&&ev.pull_request.body)||'';labels=((ev.pull_request&&ev.pull_request.labels)||[]).map(l=>l.name)}catch(e){}
  const line=k=>{const m=body.match(new RegExp(k+'\\s*[：:]\\s*(.*)'));return m?m[1]:''};
  return {files:split(arg('files')||line('範圍檔案')),screens:split(arg('screens')||line('範圍畫面')),parts:split(arg('parts')||line('範圍元件')),bug:!!arg('bug')||/BUG/i.test(line('類型'))||labels.includes('BUG'),fromPR:!!body}}

(async()=>{const t0=Date.now(),base=arg('base')||'origin/main',S=scope(),items=[],warn=[],notes=[];
  const add=(name,ok,detail='')=>{items.push({name,ok,detail});console.log(`${ok?'通過':'失敗'}  ${name}${detail?'  — '+detail.split('\n')[0]:''}`)};
  fs.mkdirSync(OUT,{recursive:true});
  let head='?',bsha='?';try{head=git(['rev-parse','--short','HEAD']);bsha=git(['rev-parse','--short',base])}catch(e){add('找得到比對基準 '+base,false,'先 git fetch origin main')}
  // 1. 工作區乾淨
  const d0=dirty();add('工作區沒有未提交的修改（報告要對應 commit '+head+'）',!d0.length,d0.slice(0,5).join('、'));
  // 2. 統一測試
  const rt=cp.spawnSync('node',[path.join(__dirname,'run_tests.js')],{cwd:ROOT,stdio:'inherit'});
  let res=null;try{res=JSON.parse(fs.readFileSync(path.join(OUT,'results.json'),'utf8'))}catch(e){}
  if(!res)add('統一測試 run_tests.js 有跑完',false,'沒有產生 test-out/results.json（結束碼 '+rt.status+'）');
  // 3. 建置產物一致、版本號
  const d1=dirty().filter(l=>!d0.includes(l));add('建置產物（index.html、tests.js、sw.js、version.json）跟 src 一致',!d1.length,d1.length?'跑 python3 src/build.py 後要一起提交：'+d1.slice(0,4).join('、'):'');
  try{const ch=git(['diff','--name-only',base+'...HEAD']).split('\n').filter(Boolean),game=ch.filter(f=>/^src\/(game\.js|style\.css|skin\.js|index\.template\.html|sw\.js)$/.test(f));
    const bid=s=>(s.match(/const BUILD_ID='([^']+)'/)||[])[1],v0=bid(git(['show',base+':src/game.js'])),v1=bid(fs.readFileSync(path.join(ROOT,'src/game.js'),'utf8'));
    if(game.length)add(`改到遊戲本體（${game.join('、')}）要升版本號`,v0!==v1,`main ${v0} → 這版 ${v1}`);else notes.push(`這次沒有改到遊戲本體（版本號維持 ${v1}）`)}catch(e){add('比對版本號',false,e.message.split('\n')[0])}
  // 4. 失敗項目只能是已知問題，而且清單只能變短
  const kf=f=>{try{return JSON.parse(f).items.map(x=>x.id)}catch(e){return null}};
  const mine=kf(fs.readFileSync(path.join(__dirname,'known_failures.json'),'utf8'))||[];let theirs=null;try{theirs=kf(git(['show',base+':src/tools/known_failures.json']))}catch(e){}
  if(theirs){const more=mine.filter(x=>!theirs.includes(x));add('已知問題清單沒有變長',!more.length,more.length?'新加的：'+more.join('、'):'')}else notes.push('main 上還沒有已知問題清單（第一次建立）');
  if(res){const fails=res.R.filter(r=>r.pass===false),known=fails.filter(f=>mine.includes(f.id)),bad=fails.filter(f=>!mine.includes(f.id)),fixed=mine.filter(id=>!fails.some(f=>f.id===id));
    add(`統一測試：${res.R.filter(r=>r.pass).length} 項通過，${fails.length} 項失敗（其中 ${known.length} 項是 main 既有問題）`,!bad.length,bad.map(f=>`${f.id} ${f.name}（${f.detail}）`).join('\n'));
    if(res.notRun&&res.notRun.length)add('五層測試全部有執行',false,'沒執行第 '+res.notRun.join('、')+' 層');
    if(known.length)warn.push(`main 既有問題仍未修好（${known.length} 項）：${known.map(f=>f.id).join('、')}，詳見 src/tools/known_failures.json`);
    if(fixed.length)notes.push(`這些已知問題這次已經通過，可以從 known_failures.json 刪掉：${fixed.join('、')}`)}
  // 5. BUG 紀錄
  if(S.bug){let ok=false;try{ok=git(['diff','--name-only',base+'...HEAD']).split('\n').includes('BUG_HISTORY.md')}catch(e){}add('類型是 BUG：BUG_HISTORY.md 有新增紀錄',ok)}
  // 6. 素材與流程檔
  const ig=require('./integrity.js').check(base);add('已登記素材沒有被偷改、新素材有登記',!ig.fail.length,ig.fail.slice(0,10).join('\n'));warn.push(...ig.warn);notes.push(...ig.info);
  // 6b. 檔案範圍、禁改區塊（Mochi 2026-10-26 選 B）
  {let ch=null;try{ch=git(['diff','--name-only',base+'...HEAD']).split('\n').filter(Boolean)}catch(e){add('比對改到的檔案',false,e.message.split('\n')[0])}
    if(ch){const BUILT=['index.html','version.json','tests.js','sw.js'];   // 建置產物：上面第 3 項已確認跟 src 一致
      const hit=(p,f)=>p.endsWith('/')?f.startsWith(p):p.includes('*')?new RegExp('^'+p.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*\*/g,'\0').replace(/\*/g,'[^/]*').replace(/\0/g,'.*')+'$').test(f):p===f;
      const out=ch.filter(f=>!BUILT.includes(f)&&!S.files.some(p=>hit(p,f)));
      add(S.files.length||!ch.length?'改到的檔案都在範圍檔案內':'有寫範圍檔案（PR 說明「範圍檔案：」或 --files=）',!out.length,out.length?'範圍外的檔案：'+out.slice(0,15).join('、')+(out.length>15?` 等 ${out.length} 個`:''):'')}}
  const lk=require('./locked.js').check(base);add('禁改區塊沒有被修改（強化率、爆裝、安定值、武器安全距離、符文時間軸）',!lk.fail.length,lk.fail.join('\n'));notes.push(...lk.info);
  // 7. 前後對照
  const sh=await require('./shots.js').run({base,screens:S.screens,parts:S.parts});
  add('360／390／440 前後對照：沒有範圍外的畫面或共用元件變動',!sh.fail.length,sh.fail.slice(0,12).join('\n'));warn.push(...sh.warn);notes.push(...sh.info);
  // 報告
  const ok=items.every(i=>i.ok),time=new Date().toISOString().slice(0,16).replace('T',' ')+' UTC';
  const vis=sh.changed.length?`等 Mochi 看對照圖（有變動的畫面 ${sh.changed.length} 張）`:'不需要（跟 main 比對畫面完全相同）';
  const md=`# 關卡報告：${ok?'✅ 通過':'❌ 未通過'}\n\ncommit \`${head}\`，比對 \`${base}@${bsha}\`，${time}，${Math.round((Date.now()-t0)/1000)} 秒\n\n`+
    `## 四個狀態\n| 狀態 | 結果 |\n|---|---|\n| 程式完成 | 看 PR 是否已從草稿改成可檢閱 |\n| 測試通過 | ${ok?'是（這份報告）':'**否**'} |\n| 視覺驗收通過 | ${vis} |\n| 正式合併完成 | 否：只有 Mochi 能在 GitHub 按合併 |\n\n`+
    (warn.length?`## 🔴 合併前請 Mochi 注意\n${warn.map(w=>'- 🔴 '+w).join('\n')}\n\n`:'')+
    `## 範圍\n- 檔案：${S.files.join('、')||'無'}\n- 畫面：${S.screens.join('、')||'無（畫面不應該有任何變動）'}\n- 共用元件：${S.parts.join('、')||'無'}\n- 類型：${S.bug?'BUG':'一般'}${S.fromPR?'（從 PR 說明讀取）':''}\n\n`+
    `## 檢查項目\n| 項目 | 結果 | 說明 |\n|---|---|---|\n${items.map(i=>`| ${i.name} | ${i.ok?'通過':'**失敗**'} | ${(i.detail||'').replace(/\|/g,'／').replace(/\n/g,'<br>').slice(0,1500)} |`).join('\n')}\n\n`+
    (sh.changed.length?`## 有變動的畫面（對照圖在 test-out/compare/，紅框＝不同的地方）\n${sh.changed.map(c=>`- ${c.screen} ${c.w}px：${c.boxes} 處`).join('\n')}\n\n`:'')+
    `## 其他紀錄\n${notes.map(n=>'- '+n).join('\n')}\n\n測試明細：test-out/report.md；截圖：test-out/shots/、test-out/compare/。\n`;
  fs.writeFileSync(path.join(OUT,'gate-report.md'),md);fs.writeFileSync(path.join(OUT,'gate-result.json'),JSON.stringify({ok,head,base:`${base}@${bsha}`,items,warn,notes,changed:sh.changed,scope:S},null,1));
  console.log(`\n關卡：${ok?'通過':'未通過'}（${items.filter(i=>!i.ok).length} 項失敗）；報告 test-out/gate-report.md`);process.exit(ok?0:1)})();
