// 諸神鐵匠 禁改區塊指紋檢查（Mochi 2026-10-26 選 B：三道關卡「執行前」的自動檢查）
//   node src/tools/locked.js [--base=origin/main]    有被改到的禁改區塊就印出來，結束碼 1
// 清單在 src/tools/locked.json；比對時用 main 上的清單（main 還沒有時才用這個分支的），所以在分支裡改清單也蓋不掉。
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..','..'),LIST='src/tools/locked.json';
const git=a=>cp.execFileSync('git',a,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64<<20});
const show=(ref,f)=>{try{return ref?git(['show',ref+':'+f]):fs.readFileSync(path.join(ROOT,f),'utf8')}catch(e){return null}};
const strip=s=>s.split('\n').map(l=>l.replace(/\s+\/\/[^'"`]*$/,'')).join('\n').trim();
// 回傳每個正規表示式抓到的內容（陣列的陣列）；抓不到的那一格是 null
function grab(src,it){return [].concat(it.re).map(r=>{const m=src.match(new RegExp(r,it.all?'g':''));return m?(it.all?m.map(strip):[strip(m[0])]):null})}

function check(base='origin/main'){const fail=[],info=[];
  let def=null;try{def=JSON.parse(show(base,LIST))}catch(e){}
  if(!def){try{def=JSON.parse(show(null,LIST));info.push(`${base} 上還沒有禁改區塊清單（第一次建立），這次用分支的清單`)}catch(e){fail.push(`找不到禁改區塊清單 ${LIST}`);return {fail,info}}}
  const cache={};const src=(ref,f)=>{const k=ref+'|'+f;return k in cache?cache[k]:(cache[k]=show(ref,f))};
  for(const it of def.items){const a=src(base,it.file),b=src(null,it.file);
    if(a==null){info.push(`${it.name}：${base} 沒有 ${it.file}，略過`);continue}
    if(b==null){fail.push(`${it.name}：${it.file} 被刪除`);continue}
    const ga=grab(a,it),gb=grab(b,it);
    ga.forEach((x,i)=>{const y=gb[i];
      if(x==null)info.push(`${it.name}：${base} 找不到第 ${i+1} 段（清單要更新）`);
      else if(y==null)fail.push(`${it.name}（${it.file}）：找不到原本的程式，被改寫或刪除了`);
      else if(JSON.stringify(x)!==JSON.stringify(y))fail.push(`${it.name}（${it.file}）被修改：「${x.join(' ').slice(0,120)}」→「${y.join(' ').slice(0,120)}」`)})}
  info.push(`禁改區塊 ${def.items.length} 項（${def.items.map(i=>i.name).join('、')}），比對基準 ${base}`);
  return {fail,info}}

module.exports={check,LIST};
if(require.main===module){const a=process.argv.find(x=>x.startsWith('--base='));const r=check(a?a.slice(7):'origin/main');
  for(const x of r.fail)console.log('FAIL  '+x);for(const x of r.info)console.log('      '+x);process.exit(r.fail.length?1:0)}
