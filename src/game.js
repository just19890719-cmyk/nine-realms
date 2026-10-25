/* ===================== 九界鐵匠 v3 ===================== */
/* ---------- 資料表 ---------- */
const VERSION=3;
const ART_V='?v=3';  // 武器顯示圖改過透明度：加版本號，避免瀏覽器沿用舊快取
// v3.76 第二界的 AI 圖還沒到：先借第一界的圖顯示，圖到了刪掉對應那一項就好
const ART_WAIT={};
const ART_NEW=/^(mat_srelic)$/;   // v4.30 斯卡蒂之弓的舊圖換成索爾之錘、雷神錘柄：檔名沒變，加版本號避免沿用快取
const A=n=>(n=ART_WAIT[n]||n,(typeof UI_ART!=='undefined'&&UI_ART[n])||'art/'+n+'.webp'+(n.endsWith('_disp')?ART_V:/^(mon|boss|bg)_|^v\d+$/.test(n)?'?m=4.30':'')+(ART_NEW.test(n)?(n.endsWith('_disp')?'&':'?')+'g=4.30':''));  // UI_ART（skin.js）可把既有圖示換成新素材路徑；預設空白＝不變
// v4.54 新材料（Mochi 選：跟該界怪物故事有關、配方量加倍）：每一界 2 種一般材料（每打倒一隻 50%），怪物主題武器那關掉怪物部位（5%），第 10 關掉 Boss 素材（10%）
const MAT_DEF=[['miron','中庭鐵礦','人類之境的鐵，鐵爐村鍛造的基本金屬。'],['pine','松林硬木','松林哨站一帶的硬木，做槍桿、弓身和握柄。'],['troll','巨魔石皮','山怪特羅爾照到陽光會變成石頭，這是牠半石化的外皮。'],['bifrost','彩虹橋碎晶','海姆達爾守護的彩虹橋碎片，霍夫德之劍的彩虹聖光就來自這裡。'],
 ['frost','約頓霜鐵','巨人國度永凍土層裡的冷鐵。'],['gwood','約頓巨木','巨人森林的古木，比人間的木頭大上十倍。'],['ubone','幻術巨人王骨','幻術巨人王烏特加德洛基的骨頭，摸起來會一直變形。'],['thor','索爾雷晶','雷神落雷打過的岩石結晶，裡面還有雷電在跑。']];
const MATS=Object.fromEntries(MAT_DEF.map(x=>[x[0],x[1]])),MAT_D=Object.fromEntries(MAT_DEF.map(x=>[x[0],x[2]]));
const MATART=Object.fromEntries(MAT_DEF.map(x=>[x[0],x[0]==='miron'?'mat_miron':'mat_'+x[0]]));
const CATS={axe:'斧',sword:'劍',dagger:'雙刀',polearm:'長柄',hammer:'錘',bow:'弓',crossbow:'弩',shield:'盾',throw:'投擲',tool:'工具'};
// sec = 正式版 1× 秒數；試玩可在測試工具調整時間流速
const TIERS=[
  {n:'鐵製',mult:1,stable:6,sec:6,gold:10,furnace:1,unlock:0,slag:1},   // v4.00 安定值全部改成 +6（原本 6/5/3/0/0）
  {n:'霜銀',mult:2.5,stable:6,sec:30,gold:60,furnace:2,unlock:4,slag:4},
  {n:'龍鱗',mult:6,stable:6,sec:90,gold:250,furnace:4,unlock:7,slag:10},
  {n:'神器',mult:11,stable:6,sec:240,gold:800,furnace:5,unlock:8,slag:25},
  {n:'巨人',mult:16,stable:6,sec:600,gold:2500,furnace:6,unlock:13,slag:40},   // v3.76 第五階：收復 2-3、熔爐 Lv6
];
// v4.51 新武器（Mochi 武器規劃＋武器系統定案第 9 節）：開局 7 把＋每界 3 把一般＋1 把怪物主題＋1 把 Boss；兩界一階、同階強度相同
// base＝每秒傷害（七種一樣，單擊照攻速換算）：開局 12、第一階（第一、二界）15；怪物主題 ×1.1；Boss 17＋專屬特效（20% 觸發、該下 +30%，平均 +6%）
// [id,名稱,類別,材質階,基礎攻擊,解鎖關卡(收復幾座),鍛造金幣,種類 k:'m'怪物主題/'b'Boss,專屬特效]；v4.54 配方＝金幣＋材料（BP_R），開局 7 把只花金幣
const BPS=[
 ['w0_sword','鐵爐村鐵劍','sword',0,12,0,10],['w0_axe','鐵爐村伐木斧','axe',0,12,0,10],['w0_hammer','鐵爐村鍛錘','hammer',0,12,0,10],['w0_dual','鐵爐村雙刀','dagger',0,12,0,10],
 ['w0_spear','鐵爐村長矛','polearm',0,12,0,10],['w0_bow','鐵爐村獵弓','bow',0,12,0,10],['w0_xbow','鐵爐村手弩','crossbow',0,12,0,10],
 ['w1_spear','松林長矛','polearm',0,15,2,60],['w1_sword','霜溪鋼劍','sword',0,15,4,150],['w1_xbow','巨怪灣重弩','crossbow',0,15,6,300],
 ['w1_troll','巨魔石皮錘','hammer',0,16.5,7,600,'m'],['g_hofund','霍夫德之劍','sword',0,17,10,2000,'b','彩虹聖光斬'],
 ['w2_axe','約頓巨木斧','axe',0,15,11,1500],['w2_bow','巨鷹崖風弓','bow',0,15,13,2000],['w2_dual','永凍雙刀','dagger',0,15,15,2500],
 ['w2_utgard','幻術巨人王骨戟','polearm',0,16.5,18,5000,'m'],['g_skadi','索爾之錘','hammer',0,17,20,10000,'b','雷神落雷'],
].map(([id,n,cat,t,base,unlock,gold,k,fx])=>({id,n,cat,t,base,unlock:unlock??TIERS[t].unlock,gold,k,fx}));
// v4.54 配方材料（Mochi：量照草案正常就好，要顧及玩家大量衝裝的爽感）：一般武器約在解鎖那關掛機 30 分鐘；近戰金屬多、遠程木頭多；怪物部位 5、Boss 素材 10
const BP_R={w1_spear:{miron:10,pine:15},w1_sword:{miron:18,pine:7},w1_xbow:{miron:10,pine:15},w1_troll:{miron:32,pine:18,troll:5},g_hofund:{miron:50,pine:25,bifrost:10},
 w2_axe:{frost:12,gwood:13},w2_bow:{frost:8,gwood:17},w2_dual:{frost:18,gwood:7},w2_utgard:{frost:20,gwood:30,ubone:5},g_skadi:{frost:50,gwood:25,thor:10}};
for(const b of BPS)if(BP_R[b.id])b.r=BP_R[b.id];
// v4.72 武器圖鑑（Mochi 選，像天堂W 的收藏）：把武器「登錄」進圖鑑，那把武器會消失，換全帳號所有武器攻擊力 %。
// 每把武器 3 格（+0／+6／+9，強化等級達標就能登錄，自動挑最低等級、沒駐守、沒鎖定的那把），另外 6 個套裝湊齊再加。兩界全收最多 +57.1%
const CX_LV=[0,6,9],CX_V=[.2,.6,1.5];
const CX_GRP=[['鐵爐村起始武器',b=>!b.unlock],['米德加德',b=>b.unlock>=1&&b.unlock<=10],['約頓海姆',b=>b.unlock>=11&&b.unlock<=20]];
const CX_W0=['w0_sword','w0_axe','w0_hammer','w0_dual','w0_spear','w0_bow','w0_xbow'];
const CX_SETS=[
 {n:'鐵爐村的七把兵器',d:'鐵爐村 7 把起始武器都登錄 +0',ks:CX_W0,j:0,v:2},
 {n:'鐵爐村名匠',d:'鐵爐村 7 把起始武器都登錄 +9',ks:CX_W0,j:2,v:4},
 {n:'米德加德守衛',d:'松林長矛、霜溪鋼劍、巨怪灣重弩都登錄 +6',ks:['w1_spear','w1_sword','w1_xbow'],j:1,v:2},
 {n:'約頓海姆遠征',d:'約頓巨木斧、巨鷹崖風弓、永凍雙刀都登錄 +6',ks:['w2_axe','w2_bow','w2_dual'],j:1,v:2},
 {n:'巨人的戰利品',d:'巨魔石皮錘、幻術巨人王骨戟都登錄 +9',ks:['w1_troll','w2_utgard'],j:2,v:3},
 {n:'諸神之器',d:'霍夫德之劍、索爾之錘都登錄 +9',ks:['g_hofund','g_skadi'],j:2,v:5}];
const cxBps=()=>BPS.filter(b=>!b.dev);
const cxHas=(k,j)=>!!(S.codex&&S.codex[k]&&S.codex[k][j]);
const cxSetOk=x=>x.ks.every(k=>cxHas(k,x.j));
let CX_MEMO=null;   // 加成快取：S.codex 換了（讀檔）或登錄時重算
function cxPct(){if(!S||!S.codex)return 0;if(CX_MEMO&&CX_MEMO.o===S.codex)return CX_MEMO.p;let p=0;for(const k in S.codex)CX_V.forEach((v,j)=>{if(S.codex[k][j])p+=v});for(const x of CX_SETS)if(cxSetOk(x))p+=x.v;p=Math.round(p*10)/10;CX_MEMO={o:S.codex,p};return p}
const cxN=()=>S.codex?Object.values(S.codex).reduce((a,r)=>a+r.filter(Boolean).length,0):0;
const cxCands=(k,j)=>S.weapons.filter(w=>w.b===k&&w.lv>=CX_LV[j]&&!busyW(w)&&!w.lock).sort((a,b)=>a.lv-b.lv||!!a.ench[0]-!!b.ench[0]||a.id-b.id);
const cxCan=(k,j)=>!cxHas(k,j)&&cxCands(k,j).length>0;
const cxAny=()=>S.weapons.some(w=>BP[w.b]&&!BP[w.b].dev&&!busyW(w)&&!w.lock&&CX_LV.some((L,j)=>w.lv>=L&&!cxHas(w.b,j)));
function cxRegCore(k,j){if(cxHas(k,j))return{err:'這格已經登錄過了'};const w=cxCands(k,j)[0];if(!w)return{err:`道具欄沒有可以登錄的 +${CX_LV[j]} 以上${BP[k]?BP[k].n:''}（駐守中、鎖定的不能登錄）`};
  const before=CX_SETS.filter(cxSetOk);S.codex=S.codex||{};const r=S.codex[k]=S.codex[k]||[0,0,0];r[j]=1;CX_MEMO=null;S.weapons.splice(S.weapons.indexOf(w),1);save();
  return{w,sets:CX_SETS.filter(x=>cxSetOk(x)&&!before.includes(x))}}
// v4.51 武器圖（Mochi 生 4 張合圖、切成 15 張）已放進 art/；之後還沒生圖的武器放這裡借舊圖：{id:'舊圖檔名'}
const BP_TMP={};
for(const k in BP_TMP){ART_WAIT[k]=BP_TMP[k]+'_disp';ART_WAIT[k+'_disp']=BP_TMP[k]+'_disp'}
const BOSS_FX={p:.2,m:.3},bossE=b=>b&&b.fx?1+BOSS_FX.p*BOSS_FX.m:1;   // Boss 專屬特效的平均加成（算進攻擊力）
const kindN=b=>b.k==='b'?'Boss 專屬':b.k==='m'?'怪物主題':b.unlock?'一般':'開局';
const BP=Object.fromEntries(BPS.map(b=>[b.id,b]));
// v4.40 開發者模式的測試圖紙：每類一把、借舊武器圖顯示，只在開發者模式和快速測試時放進 BPS，正式玩家看不到
const DEV_BPS=[['dev_axe','測試斧','axe',14,'t1_woodaxe'],['dev_sword','測試劍','sword',12,'t1_ironsword'],['dev_dagger','測試雙刀','dagger',9,'t1_huntknife'],['dev_polearm','測試長柄','polearm',11,'t1_farmspear'],
 ['dev_hammer','測試錘','hammer',16,'t1_ironhammer'],['dev_bow','測試弓','bow',10,'t1_huntbow'],['dev_crossbow','測試弩','crossbow',13,'t1_crossbow']].map(([id,n,cat,base,art])=>({id,n,cat,t:0,base,unlock:0,art,dev:true}));
function devBps(){for(const b of DEV_BPS)if(!BP[b.id]){BPS.push(b);BP[b.id]=b;ART_WAIT[b.id]=b.art;ART_WAIT[b.id+'_disp']=b.art+'_disp'}}
const bpId=id=>id;   // v4.40 舊圖紙別名拿掉（舊武器全部刪除），留著給各處呼叫
const goldOf=b=>b.gold??TIERS[b.t].gold;

function recipe(b){return b.r||{}}   // v4.54 新材料配方（BP_R）；開局武器沒有材料
// v4.34 武器框顏色看強化等級（Mochi 選）：+0 灰、+1～+6 綠、+7～+8 藍、+9 紅、+10 金、+11 紫、+12 鑽石；框圖 art/frame_lv0～6（AI 細雷電框，3＝紅、6＝金），+9 以上有一道電流繞著框跑（v4.36）
const FLV=lv=>(lv|=0)<=0?0:lv<=6?1:lv<=8?2:lv===9?3:lv===10?6:lv===11?4:5,FLV_N=['灰','綠','藍','紅','紫','鑽石','金'],FLV_T=['凡鐵','精鍛','寒鋒','血刃','星魂','永恆','神鑄'],FLV_ORD=[0,1,2,3,6,4,5];const tn=w=>FLV_T[FLV(w.lv)];   // v4.36 品階名稱（Mochi 選 B），取代武器上顯示的品質；FLV_ORD＝由低到高
const fq=w=>'_lv'+FLV(w.lv),lc=w=>'l'+FLV(w.lv);
const QUAL=[{n:'普通',m:1},{n:'精良',m:1.2},{n:'稀有',m:1.45},{n:'史詩',m:1.8},{n:'傳說',m:2.3}];
// 品質權重用整數（千分比），每級鐵砧位移加總為 0，總和恆為 1000
const QW=[550,280,120,40,10],QSHIFT=[-70,30,25,11,4];
// v4.44 屬性附魔（Mochi 2026-10-24，舊 12 種附魔、按關卡學會、圖紙天生詞條全部刪除）：每把武器只有 1 個屬性欄 ench[0]={k,v}，v＝等級 1～3，ench[1..3] 固定 null（陣列長度 4 給伺服器相容）
// 鍛造出來一律無屬性，只能花金幣隨機附魔；屬性不加攻擊力。v4.80 Mochi：打中怪物弱點 ×1.03／1.06／1.1，拿跟怪物同屬性的武器（怪物有抗性）×0.97／0.94／0.9（看附魔等級），其他 ×1.0
// 相剋＝三組互剋（三對宿敵）：火⇄冰、雷⇄毒、聖⇄暗；機率：6 種屬性平均，等級 一級 70%、二級 25%、三級 5%
const ELEM={fire:{n:'火屬性',tn:['餘燼','烈焰','滅世之焰']},ice:{n:'冰屬性',tn:['寒霜','冰封','永凍之霜']},
 bolt:{n:'雷屬性',tn:['雷光','雷鳴','雷神之怒']},toxic:{n:'毒屬性',tn:['蝕毒','蛇毒','巨蟒之毒']},
 light:{n:'聖屬性',tn:['微光','聖光','光神聖輝']},dark:{n:'暗屬性',tn:['幽影','暗夜','盲神之影']}};   // v4.76 Mochi：屬性名稱全部統一「火屬性」三個字（怪物、弱點、附魔都一樣）
const ELEM_OPP={fire:'ice',ice:'fire',bolt:'toxic',toxic:'bolt',light:'dark',dark:'light'};
const ELEM_MULT=[1,1.03,1.06,1.1],ELEM_RES=[1,.97,.94,.9],ELEM_TW=[0,70,25,5];   // 打中弱點／同屬性抗性 的倍率（看附魔等級）
const ELEM_PAIR=[['fire','ice','火之國穆斯貝爾海姆和霧之國尼福爾海姆在金倫加鴻溝相撞，才生出世界'],['bolt','toxic','諸神黃昏時，索爾用雷錘打死塵世巨蟒，自己也被蛇毒毒死'],['light','dark','光明之神巴德爾被盲眼的黑暗之神霍德爾殺死']];
function elemOf(w){const e=w&&(w.ench||[])[0];if(!e||!ELEM[e.k])return null;const t=Math.max(1,Math.min(3,e.v|0)),x=ELEM[e.k];return{k:e.k,t,n:x.n,tn:x.tn[t-1],m:ELEM_MULT[t],r:ELEM_RES[t]}}
const elemTag=(w,cls='')=>{const e=elemOf(w);return e?`<span class="el-tag elc-${e.k} el-t${e.t} ${cls}">${e.tn}</span>`:''};
const elemP=t=>ELEM_TW[t]/6;   // 每一項（某屬性某等級）的機率 %
const elemCleanW=w=>{const e=(w.ench||[])[0];w.ench=[e&&ELEM[e.k]&&e.v>=1&&e.v<=3?{k:e.k,v:e.v|0}:null,null,null,null]};   // 舊附魔全部清掉
// v4.37 鍛造特性刪除（武器系統定案）：武器只看材質、品質、強化、附魔；舊武器的 traits 欄位留著但不再計算、不顯示
const CAP={time:50,loot:60,treasure:50,runic:50,greed:40,harvest:50}; // v3.84 受襲機制刪除：堅固改成每輪金幣（和貪婪共用上限） // 加成上限（%）
const STRATS={
  normal:{n:'一般狩獵',gold:1,common:1,rare:1,time:1,bonus:0,d:'金幣、材料、時間都正常'},
  material:{n:'素材追獵',gold:.6,common:1.5,rare:1,time:1,bonus:.5,d:'金幣 −40%，一般材料 ×1.5，50% 機率多 1 個'},
  rare:{n:'稀有追蹤',gold:.7,common:.8,rare:1.8,time:1.4,bonus:0,d:'時間 ×1.4、金幣 −30%，稀有素材機率 ×1.8'}
};
const RARE_P=.3;
const PITY_FORGE=10;
const CAP_WEAPONS=200; // 道具欄容量
const POWER_FLOOR=.6; // 攻擊力超過需求時，狩獵時間最多縮短到 60% // 基礎機率低於 30% 的掉落視為稀有素材
const SLOT_ANVIL=[1,1,3,5]; // 附魔第 1~4 格需要的鐵砧等級
const REALMS=['米德加德','約頓','尼福爾','亞爾夫','瓦納','斯瓦塔','穆斯貝','赫爾','阿斯嘉'];
// v4.07 九界難度曲線（Mochi 選中度）：需求 ≈ 該關剛開放時最強普通武器 +0 攻擊力 × DIFF_CURVE[位置]（X-9、X-10 神明關最陡）
// 第一界是新手界（中途會換 3 次材質）用比較緩的 DIFF_R1、1-1 固定 10；已上線的第一、二界只升不降（max(舊需求, 曲線)）；第三界起新材質只在 X-1 開放
const DIFF_CURVE=[1.6,1.7,1.8,2.0,2.2,2.4,2.6,2.9,3.3,3.8],DIFF_R1=[1,1.3,1.45,1.6,1.6,1.7,1.8,1.6,1.8,2.0];
const VILLAGES=[
 {name:'魅影林場',who:'村民・伐木工',cat:'axe',req:10,sec:120,gold:12,danger:0,tag:'labor',drops:[['iron',.8,1,1],['oak',.6,1,1]],txt:'諸神熄了鐵匠的爐火後，九界的門跟著打開，林中魅妖第一個鑽進鐵爐村後山，把伐木工引進林場深處。斧頭全鈍了，冬天前得砍夠柴火。林場旁的老礦坑還挖得到鐵礦。'},
 {name:'松林哨站',who:'村民・守林人',cat:'polearm',req:14,sec:180,gold:24,danger:.02,tag:'beast',drops:[['oak',.8,1,1],['leather',.5,1,1]],txt:'英靈殿的不死野豬趁神界的門打開逃到人間，守林人要長矛擋住牠。'},
 {name:'狼嚎谷',who:'村民・獵人',cat:'bow',req:15,sec:270,gold:45,danger:.04,tag:'beast',drops:[['leather',.8,1,1],['iron',.4,1,1],['fang',.15,1,1],['fur',.03,1,1]],txt:'追月之狼哈提追著月亮跑進狼嚎谷，整夜對月長嚎，獵人要一把射得到山頂的好弓。'},
 {name:'霜溪鎮',who:'鎮民自衛隊',cat:'sword',req:22,sec:360,gold:70,danger:.05,tag:'beast',drops:[['iron',.6,1,1],['silver',.35,1,1],['fang',.35,1,1]],txt:'哈提的兄弟斯庫爾咬住了太陽，霜溪鎮整天不見日光，溪水全結冰，自衛隊要換新劍。'},
 {name:'鴉巢堡',who:'軍隊・堡壘守衛',cat:'shield',req:44,sec:720,gold:100,danger:.06,tag:'beast',drops:[['silver',.5,1,2],['fang',.4,1,2],['shard',.25,1,1]],txt:'人間打起仗來，戰場鴉魔吃飽了戰死者的心臟，在堡頂築巢，成群俯衝城牆，守衛需要打得下鴉群的好武器。'},
 {name:'巨怪灣',who:'軍隊・港口衛兵',cat:'crossbow',req:55,sec:1080,gold:170,danger:.08,tag:'beast',drops:[['silver',.5,1,2],['shard',.3,1,1],['serpent',.12,1,1]],txt:'克拉肯從北海游進巨怪灣，在港外拖沉運糧的長船，衛兵要能遠射的弩。'},
 {name:'巨魔山口',who:'軍隊・山地軍團',cat:'hammer',req:75,sec:1440,gold:280,danger:.1,tag:'beast',drops:[['silver',.6,1,2],['fang',.6,1,2],['scale',.15,1,1],['rune',.15,1,1],['fur',.1,1,1],['shard',.15,1,1]],txt:'山怪特羅爾堵住山口，身上披著撿來的龍鱗，軍團要能砸碎石皮的戰錘。山口後面，就是巨人走下山的路。'},
 {name:'巨人足跡',who:'軍隊・王國先鋒',cat:'axe',req:155,sec:2160,gold:450,danger:.12,tag:'giant',need:'giant',drops:[['rune',.45,1,1],['shard',.5,1,2],['icecore',.15,1,1]],txt:'山口一破，地上出現一排排泥巴大腳印：巨人們用黏土捏出的泥巨人莫庫卡爾菲，被派到人間探路。'},
 {name:'灰燼要塞',who:'軍隊・要塞騎士',cat:'sword',req:160,sec:2880,gold:700,danger:.14,tag:'giant',need:'frost',drops:[['scale',.3,1,1],['rune',.3,1,1],['shard',.3,1,1],['fireheart',.15,1,1]],txt:'九界的門也通到火之國，穆斯貝爾的火焰騎兵騎著披龍鱗馬鎧的戰馬燒毀外牆。火要用霜壓。'},
 {name:'彩虹橋頭',who:'軍隊・登橋先鋒',cat:'polearm',req:310,sec:3600,gold:1000,danger:.16,tag:'god',need:'holy',drops:[['rainbow',.35,1,2],['rune',.3,1,1],['shard',.5,1,2],['hrelic',.2,1,1]],txt:'守望之神海姆達爾擋在彩虹橋頭，奉奧丁之命把凡人擋在神界門外。'},
 // v3.76 第二界約頓海姆（收復 1-10 後開放）
 {name:'霜巨人前哨',who:'遠征軍・斥候隊',cat:'axe',req:280,sec:3600,gold:1100,danger:.16,tag:'giant',drops:[['giantbone',.4,1,1],['silver',.6,1,2],['shard',.5,1,2]],txt:'彩虹橋被封，遠征軍只能繞進約頓海姆找巨人結盟。九頭巨人守著入口的哨站，不打贏牠，沒有巨人會聽凡人說話。斥候隊要劈得開巨木柵欄的斧。'},
 {name:'鐵森林',who:'遠征軍・獵兵隊',cat:'bow',req:280,sec:4200,gold:1250,danger:.16,tag:'beast',drops:[['permafrost',.4,1,1],['fang',.6,1,2],['icecore',.15,1,1]],txt:'鐵森林的狼王帶著狼群在黑鐵色的枯林裡出沒，巨人女巫放話：先打贏我養的狼，再來談結盟。獵兵要能遠射的長弓。'},
 {name:'巨鷹之崖',who:'遠征軍・弩兵團',cat:'crossbow',req:260,sec:4800,gold:1400,danger:.17,tag:'beast',drops:[['thunderiron',.5,1,1],['rune',.35,1,1]],txt:'吞屍巨鷹赫拉斯瓦爾格坐在崖頂拍翅，颳起雷暴，弩兵團要射得穿風暴的重弩。'},
 {name:'巨骨墓場',who:'遠征軍・重裝隊',cat:'hammer',req:545,sec:5400,gold:1550,danger:.17,tag:'giant',drops:[['giantbone',.5,1,2],['rune',.4,1,1],['shard',.5,1,2]],txt:'巨人屍鬼守著先祖的陪葬寶物爬出了墳墓，得用戰錘把牠們砸回土裡。'},
 {name:'永凍湖',who:'湖畔漁村・守衛',cat:'shield',req:420,sec:6000,gold:1700,danger:.18,tag:'beast',drops:[['permafrost',.5,1,2],['icecore',.2,1,1],['serpent',.15,1,1]],txt:'冰湖水妖用琴聲引人上冰，再從冰下射出冰刺，漁村守衛需要敲得碎冰刺的好武器。'},
 {name:'蠕龍礦坑',who:'礦工公會・護衛',cat:'dagger',req:420,sec:6000,gold:1800,danger:.18,tag:'dragon',need:'dragon',drops:[['permafrost',.45,1,1],['thunderiron',.35,1,1],['scale',.3,1,1]],txt:'洞穴蠕龍林德蟲盤在礦坑窄道裡，長兵器揮不開。牠是龍，全身都是硬鱗。'},
 {name:'狂風高原',who:'遠征軍・長槍陣',cat:'polearm',req:600,sec:6600,gold:2000,danger:.19,tag:'giant',drops:[['thunderiron',.45,1,1],['giantbone',.45,1,1]],txt:'風之巨人卡瑞一吐氣就是暴風雪，擋住通往烏特加德城的路，長槍陣要能刺穿巨人的長柄武器。'},
 {name:'烏特加德城',who:'遠征軍・王家騎士',cat:'sword',req:720,sec:7200,gold:2300,danger:.2,tag:'giant',drops:[['elderroot',.25,1,1],['icecore',.25,1,1]],txt:'幻術巨人王烏特加德洛基坐在王座大廳，說只要贏得過牠的幻術，就肯聽凡人說話。騎士們要最鋒利的劍。'},
 {name:'石籬原',who:'遠征軍・攻城隊',cat:'axe',req:900,sec:7200,gold:2600,danger:.2,tag:'giant',drops:[['elderroot',.3,1,1],['giantbone',.3,1,1],['thunderiron',.45,1,1]],txt:'巨人王認輸後說：最強的巨人赫朗格尼爾住在石籬原，只要牠點頭，全約頓海姆都會跟你走。攻城隊的斧要劈得開牠的石盾。'},
 {name:'維莫爾河渡口',who:'遠征軍・總指揮',cat:'hammer',req:1040,sec:7200,gold:3000,danger:.2,tag:'god',need:'holy',drops:[['elderroot',.35,1,1],['giantbone',.5,1,2],['rune',.4,1,1],['srelic',.2,1,1]],txt:'巨人們終於願意和凡人結盟，雷神索爾卻駕著山羊戰車渡過維莫爾河，要親手拆散這個聯盟。'}
];
const REALM_N=[['米德加德','人類之境','v4'],['約頓海姆','巨人之境','v20']];   // [名稱, 副標, 背景圖]
const vRealm=i=>i<10?0:1,vNo=i=>(vRealm(i)+1)+'-'+(i%10+1);   // 關卡編號：0→1-1，10→2-1
// v4.37 巨人體重鍊刪除（武器系統定案）：舊武器的 rf 欄位留著（伺服器不准往下改），但不再計算、不顯示；rfOpen＝第二界已開放
const rfOpen=()=>S.villages.length>10&&S.villages[10].status!=='locked';
const TAGN={labor:'勞務',beast:'野獸',giant:'巨人',dragon:'龍族',god:'神明'};
const FURNACE_COST=[0,3000,6000,15000,40000,150000],ANVIL_COST=[0,2000,8000,25000,50000],SLOT_COST=[0,3000,15000,40000];
// v3.90 工坊升級依關卡進度解鎖（Mochi 選方案 A）：要升到 Lv(i) 需要收復 WS_GATE[kind][i] 座村莊；已經升上去的等級保留
const WS_GATE={furnace:[0,0,3,5,6,7,10],anvil:[0,0,2,4,7,10]};
// v4.54 掉落（武器系統定案 9-2）：該界 2 種一般材料各 50%；怪物主題武器那關多掉怪物部位 5%；第 10 關多掉 Boss 素材 10%（強化石、附魔石、遺物另外算）
const REALM_MAT=[['miron','pine'],['frost','gwood']],MAT_EXTRA={6:['troll',.05],9:['bifrost',.1],17:['ubone',.05],19:['thor',.1]};
VILLAGES.forEach((v,i)=>{const rm=REALM_MAT[Math.floor(i/10)]||[];v.drops=rm.map(k=>[k,.5,1,1]);const x=MAT_EXTRA[i];if(x)v.drops.push([x[0],x[1],1,1])});
// v4.51 村莊需求改成新武器的數值（Mochi 選「偏難」，武器系統定案 9-5）：需求每秒傷害＝該階武器 × 預期強化倍率，一界最後一關要 +7、二界 +8；舊需求留在 req0 給快速測試的舊圖紙用
const VREQ=[12,14,15,17,19,22,25,28,31,35, 35,36,37,38,39,40,41,42,43,44];
VILLAGES.forEach((v,i)=>{v.req0=v.req;v.req=VREQ[i]??v.req});
// v4.52 限時挑戰（武器系統定案第 6 節）：怪物血量＝需求每秒傷害 × 60 秒 × 0.8（第 9、10 關 ×1.0）；需求剛好的武器約 48 秒打倒（神明關 60 秒）
// 收復後駐守掛機：每打倒一隻＝收成一輪（金幣、強化石機率）；每小時金幣跟以前差不多，武器越強殺越快、拿越多
const CH_SEC=60,VHP_K=i=>i%10>=8?1:.8;   // VHP_K 只剩 5 關以後每隻金幣的舊公式在用
// v4.71 評級挑戰（Mochi 選方案二）：血量＝該關能做的最好一般武器 +6（沒附魔、沒相剋）預估 38 秒打倒（實際打要多 3～5 秒攻擊節奏，七種武器都穩拿 A）；從那一階武器解鎖的關卡起，每關血量多 2.5%（1-10 要 +7、2-10 要 +8 才 A）
const HP_SEC=38,HP_STEP=.025;
function vHpBase(i){const ns=BPS.filter(b=>!b.dev&&!b.k&&b.unlock&&b.unlock<=i),top=ns.reduce((a,b)=>Math.max(a,b.base),0);
  if(!top)return{base:Math.max(...BPS.filter(b=>!b.dev&&!b.unlock).map(b=>b.base),12),s0:i};
  return{base:top,s0:Math.min(...ns.filter(b=>b.base===top).map(b=>b.unlock))}}
let VHP_OLD=false;   // 快速測試換成舊圖紙時（withTestBps）照舊公式：需求 × 60 秒 × 0.8
const VHP=i=>{if(VHP_OLD)return Math.round(VILLAGES[i].req*CH_SEC*VHP_K(i));const h=vHpBase(i);return Math.round(h.base*enhMult(6)*procE(6)*HP_SEC*Math.pow(1+HP_STEP,Math.max(0,i-h.s0)))};
// 評級：照打倒秒數，記這一關挑戰過的最好成績（S.villages[i].gr＝GRADES 的索引），掛機每隻的金幣和掉落機率 ×m，首次收復獎勵 ×f（之後打到更高評級補差額）
const GRADES=[{n:'SS',t:18,m:1.5,f:2},{n:'S',t:30,m:1.25,f:1.5},{n:'A',t:45,m:1,f:1},{n:'B',t:52,m:.85,f:1},{n:'C',t:60,m:.7,f:1}];
const grOf=sec=>{const g=GRADES.findIndex(x=>sec<=x.t);return g<0?null:g};
const vGr=i=>{const g=S.villages[i]&&S.villages[i].gr;return g==null||!GRADES[g]?null:GRADES[g]};
const grMul=i=>{const g=vGr(i);return g?g.m:1};
// 預估挑戰秒數（評級用）：實際戰鬥有出手節奏和觸發機率，比 vSec 慢一點，所以照 chPlan 模擬 15 場取中位數（快取）
const CH_EST={};
function chEst(i,w){const k=[i,w.b,w.lv,JSON.stringify(w.ench||[]),VHP(i)].join('|');if(CH_EST[k]!=null)return CH_EST[k];
  const ts=[];for(let n=0;n<15;n++){const q=chPlan(i,w);ts.push(q.win==null?CH_SEC+1:q.win/1000)}ts.sort((a,b)=>a-b);return CH_EST[k]=ts[7]}
const grChip=(g,cls='')=>g?`<span class="gr gr-${g.n} ${cls}">${g.n}</span>`:'';
const vSec=(i,w)=>VHP(i)/Math.max(1e-9,vPow(i,w));   // 預估幾秒打倒一隻（已算攻速、強化、附加效果、弱點、相剋）
// v4.66 Mochi 在「填寫：各關掉落」填的每隻金幣範圍（沒填的關照舊公式）；vKillGold 回傳平均值（時薪、遺物金幣用），rollCycle 每隻在範圍內隨機
const KILL_GOLD={0:[20,70],1:[10,15],2:[10,30],3:[10,40],4:[20,50],
  5:[20,50],6:[25,50],7:[25,55],8:[30,60],9:[35,65],   // v4.69 Mochi 選 B 溫和：1-6 以後接著 1-5 慢慢往上（第一界後半平均 35～50、第二界 55～90）
  10:[35,75],11:[40,75],12:[40,80],13:[45,85],14:[45,90],15:[50,90],16:[50,100],17:[55,105],18:[60,110],19:[60,120]};
const vKillGold=i=>KILL_GOLD[i]?Math.round((KILL_GOLD[i][0]+KILL_GOLD[i][1])/2):Math.max(1,Math.round(VILLAGES[i].gold*CH_SEC*VHP_K(i)/VILLAGES[i].sec));
const killGoldTxt=i=>KILL_GOLD[i]?KILL_GOLD[i].map(fmt).join('～'):fmt(vKillGold(i));   // 每打倒一隻的金幣   // v4.43 舊材料刪除：村莊暫時只掉金幣（新的掉落等 Mochi 重新設計）
// v4.43 舊道具（防爆卷、祝福石、傳說圖紙、殘渣）全部刪除。新道具：英靈・遺物（打開內容等 Mochi 設定，圖待生成）
// [名稱, 圖示（null＝還沒有圖）, 說明, 光芒, 光芒顏色]；v4.43 英靈・遺物分綠／藍／紅／金四種光芒（圖 art/it_relic_g/b/r/y，Mochi AI 生圖），之後各放不同等級的內容（Mochi）
const RELIC_DESC='英靈留在戰場上的遺物，光芒越亮，裡面的東西越好。打倒怪物有機率掉，越後面的關卡越容易掉到好的。';
const ITEMS={relic_g:['英靈・遺物','it_relic_g',RELIC_DESC,'綠光','#5fd36a'],relic_b:['英靈・遺物','it_relic_b',RELIC_DESC,'藍光','#4fa3ff'],relic_r:['英靈・遺物','it_relic_r',RELIC_DESC,'紅光','#ff5a4a'],relic_y:['英靈・遺物','it_relic_y',RELIC_DESC,'金光','#ffc940'],estone:['強化石','it_estone','強化武器用，每次強化消耗 1 顆（成功或失敗都會用掉）。打怪收成、熔解武器可以拿到，越後面的關卡掉越多。','','']};   // v4.50 強化石（圖待 Mochi 生成）
ITEMS.enstone=['附魔石','it_ench','附魔用，每次附魔消耗 1 顆加金幣（重抽也一樣）。打倒怪物有機率掉、英靈・遺物也開得到，越後面的關卡掉越多。','',''];   // v4.54 附魔石（Mochi 選：附魔花 1 顆＋金幣）
const RELICS=Object.keys(ITEMS).filter(k=>k.startsWith('relic_'));
const ENSTONE='enstone',enStones=()=>S.items[ENSTONE]|0;
const RATE=[0,1,1,1,1,1,1,.35,.325,.3,.01,.01,.01];   // v4.50 武器系統定案第 3 節（Mochi 05:10 修訂）：+1～+6 必成功，+7～+9 35／32.5／30%，+10～+12 各 1%；上限 +12
const MAX_LV=12,STONE='estone',stones=()=>S.items[STONE]|0;
const ACH=[
  {id:'c3',n:'收復 1-3 狼嚎谷',g:'v',ic:'v3',p:()=>[cleared(),3],test:()=>cleared()>=3,r:{gems:50}},
  {id:'c6',n:'收復 1-6 巨怪灣',g:'v',ic:'v6',p:()=>[cleared(),6],test:()=>cleared()>=6,r:{gems:50}},
  {id:'c9',n:'收復 1-9 灰燼要塞',g:'v',ic:'v9',p:()=>[cleared(),9],test:()=>cleared()>=9,r:{gems:100}},
  {id:'h100',n:'累積收成 100 輪',g:'h',ic:'it_gold',p:()=>[S.stats.harvest,100],test:()=>S.stats.harvest>=100,r:{gems:50}},
  {id:'h300',n:'累積收成 300 輪',g:'h',ic:'it_gold',p:()=>[S.stats.harvest,300],test:()=>S.stats.harvest>=300,r:{gems:100}},
  {id:'e50',n:'強化成功 50 次',g:'f',ic:'mat_rune',p:()=>[S.stats.enhOk,50],test:()=>S.stats.enhOk>=50,r:{gems:50}},
  {id:'m30',n:'熔解 30 把武器',g:'f',ic:'mat_shard',p:()=>[S.stats.melted,30],test:()=>S.stats.melted>=30,r:{gems:50}},
  {id:'f50',n:'鍛造 50 把武器',g:'f',ic:'nav_forge',p:()=>[S.stats.forged.reduce((a,b)=>a+b,0),50],test:()=>S.stats.forged.reduce((a,b)=>a+b,0)>=50,r:{gems:50}}
];   // v4.43 成就獎勵的防爆卷、祝福石、符文碎片改成鑽石
// v3.71 鐵匠聲望與天賦（不封頂長線養成）：收成、鍛造、強化成功、收復村莊、熔解都累積聲望；每升 1 級得 1 天賦點和聲望寶箱，等級沒有上限
const REP_XP={harvest:1,forge:[1,3,8,20,40,80,120],first:50,melt:1};   // 強化成功：經驗＝強化後等級
const repNeed=l=>Math.round(30*Math.pow(l,1.4));   // Lv.l 升到 Lv.l+1 需要的經驗
const TALENTS={
  gold:{n:'商隊議價',ic:'it_gold',per:1,max:50,l:'村莊收成金幣',sg:'+'},
  mats:{n:'拾荒專家',ic:'mat_iron',per:1,max:30,l:'一般材料掉落率',sg:'+'},
  rare:{n:'尋寶直覺',ic:'mat_rune',per:1,max:20,l:'稀有素材掉落率',sg:'+'},
  qual:{n:'巨匠之手',ic:'ic_star',per:.5,max:20,l:'精良以上品質機率',sg:'+'},
  melt:{n:'熔解大師',ic:'mat_shard',per:3,max:20,l:'熔解回收材料',sg:'+'}
};
const tal=k=>0;   // v4.36 Mochi：鐵匠天賦拿掉，效果也不保留（大改版，玩家會重新開始）
const repUsed=()=>Object.values(S.rep.t).reduce((a,b)=>a+b,0);
const repPts=()=>S.rep?Math.max(0,S.rep.lv-1-repUsed()):0;
const repBox=l=>({gold:100*l});   // 升到 Lv.l 的聲望寶箱
// v3.72 每週首領討伐（台灣時間）；v3.87 改成整週開打、每週日 00:00 結算換下一隻（Mochi 選），取消週一～四雙倍收成；首領每週輪替
// 首領圖用 v3.73 的怪物圖（art/mon_N），背景用對應的村莊圖；v4.44 弱點改成屬性（el＝首領自己的屬性，弱點＝對手屬性，倍率看附魔等級；伺服器 boss_weak 同順序）
const EVT_BOSS=[
 {id:'fenrir',n:'魔狼芬里爾',art:'mon_4',bg:'bg_fenrir',el:'dark',mat:'fur'},
 {id:'thrym',n:'霜巨人王索列姆',art:'mon_8',bg:'bg_thrym',el:'ice',mat:'icecore'},
 {id:'surtr',n:'火巨人蘇爾特',art:'mon_9',bg:'bg_surtr',el:'fire',mat:'fireheart'},
 {id:'jorm',n:'塵世巨蟒耶夢加得',art:'boss_jorm',bg:'bg_jorm',el:'toxic',mat:'serpent'},
 {id:'nidhogg',n:'尼德霍格',art:'boss_nidhogg',bg:'bg_nidhogg',el:'dark',mat:'scale'}
];
for(const b of EVT_BOSS){b.weak={el:ELEM_OPP[b.el]};b.wn='帶「'+ELEM[ELEM_OPP[b.el]].n+'」的武器'}
// v3.85 首領改成「派武器駐守」（Mochi 選）：最多 3 把武器駐守首領，每小時傷害＝攻擊力（弱點 ×1.5），離線也會繼續打；
// 駐守首領的武器不能同時打村莊、強化、附魔、熔解、上架；週日 0 點結算後武器留著，自動繼續打下一隻。登入時傷害由伺服器用時間計算（sql/10）
const BOSS_SLOTS=3;
// 全服血量打到 25／50／75／100% 時，本週有駐守過的人都能領；M＝本週首領的怪物素材
const BOSS_GSTAGE=[[.25,{gold:10000,shard:5}],[.5,{gold:20000,bless:2,M:3}],[.75,{gold:30000,scroll:2,M:5}],[1,{gold:50000,scroll:3,bless:3,M:8}]];
// 上週個人傷害排名獎勵：週日 0 點結算後可以領（領到下一次換週前）；[名次上限, 名稱, 獎勵]
const BOSS_RANK=[[1,'第 1 名',{gems:300,scroll:5,M:10}],[3,'第 2～3 名',{gems:200,scroll:3,M:6}],[10,'第 4～10 名',{gems:100,scroll:2,M:4}],[Infinity,'有參加',{gold:10000,M:2}]];
const DAY=86400e3,TZ8=8*3600e3;
const evtWeek=t=>Math.floor(((t??NOW())+TZ8+4*DAY)/(7*DAY));   // v3.87 週日 00:00（台灣）換週（伺服器 boss_week 相同）
const evtStart=wk=>wk*7*DAY-4*DAY-TZ8;
const twDay=t=>(new Date((t??NOW())+TZ8).getUTCDay()+6)%7;      // 週一＝0 … 週日＝6
let EVT_WK=0;   // 開發者工具：換下一隻首領（不存檔）
function evtNow(){const t=NOW(),w0=evtWeek(t),wk=w0+EVT_WK,start=evtStart(w0);
  return{k:'boss',wk,start,end:start+7*DAY,boss:EVT_BOSS[((wk%EVT_BOSS.length)+EVT_BOSS.length)%EVT_BOSS.length]}}
const bossWeak=(w,b)=>{const e=elemOf(w);return e&&e.k===b.weak.el?e.m:0};   // 打中弱點＝倍率，沒打中＝0
const bossRes=(w,b)=>{const e=elemOf(w);return e&&e.k===b.el?e.r:0};   // v4.77 跟首領同屬性＝首領有抗性，扣傷倍率；不同＝0
const bossDmgOf=(w,b)=>Math.round(power(w)*(bossWeak(w,b)||bossRes(w,b)||1)*(1+gdBoss()/100));    // v3.98 公會首領傷害加成（伺服器 boss_pw 也一樣算）
const stageGift=(g,b)=>Object.fromEntries(Object.entries(g).map(([k,v])=>[k==='M'?b.mat:k,v]));
// 換週：傷害、全服階段歸零；駐守的武器留著，每小時傷害改用新首領的弱點重算
// v4.38 全服首領討伐先拿掉（Mochi）：沒有入口、駐守的武器全部放回道具欄；資料和伺服器表留著，BOSS_OFF 改 false 就能恢復
let BOSS_OFF=true;
function evtSt(){const e=evtNow();let v=S.evt;
  if(!v||v.wk!==e.wk){const old=v&&Array.isArray(v.slots)?v.slots:[];v=S.evt={wk:e.wk,dmg:0,gs:0,slots:old.map(x=>x&&W(x.id)?{...x,pw:bossDmgOf(W(x.id),e.boss)}:null)}}v.gs=v.gs|0;v.dmg=+v.dmg||0;
  if(!Array.isArray(v.slots))v.slots=[];v.slots=[0,1,2].map(i=>{const x=v.slots[i];return !BOSS_OFF&&x&&W(x.id)?x:null});delete v.hits;delete v.day;return v}
// 駐守首領：第幾格（-1＝沒有）；換週也不會收回
const bossSlotOf=w=>{const v=S.evt;return !BOSS_OFF&&v&&Array.isArray(v.slots)?v.slots.findIndex(x=>x&&x.id===w.id):-1};
const busyW=w=>where(w)>=0||bossSlotOf(w)>=0;
// 本機估算的本週傷害（已收回的＋駐守中按時間累積，只算本週日 0 點以後）
const bossAcc=(x,e=evtNow())=>x?Math.max(0,Math.floor(x.pw*(Math.min(NOW(),e.end)-Math.max(x.at,e.start))/3600e3)):0;
const bossLive=()=>{const v=evtSt(),e=evtNow();return v.dmg+v.slots.reduce((a,x)=>a+bossAcc(x,e),0)};
const bossRate=()=>evtSt().slots.reduce((a,x)=>a+(x?x.pw:0),0);
const bossCands=()=>S.weapons.filter(w=>!w.test&&bossSlotOf(w)<0);
const bossDot=()=>!BOSS_OFF&&(evtSt().slots.some(x=>!x)&&bossCands().length>0||bossStageN()>0||!!bossRankTier());
// v3.70 每日任務（每天 0 點換日，進度＝今天的統計增加量）＋活躍度寶箱＋7 日簽到
const DAILY=[
  {id:'login',n:'今天登入遊戲',pt:10,m:1,ic:'ic_check',p:()=>1},
  {id:'harv',n:'村莊收成 5 輪',pt:20,m:5,ic:'it_gold',p:()=>S.stats.harvest-S.daily.b.harvest},
  {id:'forge',n:'鍛造 3 把武器',pt:20,m:3,ic:'nav_forge',p:()=>forgedN()-S.daily.b.forged},
  {id:'enh',n:'強化武器 5 次',pt:25,m:5,ic:'mat_rune',p:()=>S.stats.enhTry-S.daily.b.enhTry},
  {id:'melt',n:'熔解 1 把武器',pt:25,m:1,ic:'mat_shard',p:()=>S.stats.melted-S.daily.b.melted}
];
const DAILY_BOX=[[40,()=>({gold:200+200*cleared()})],[70,()=>({gold:500+300*cleared()})],[100,()=>({gems:30})]];   // v4.43 舊道具、材料刪除，改金幣和鑽石
const SIGN=[{gold:1000},{gold:1500},{gems:30},{gems:50},{gold:3000},{gems:50},{gems:100}];

/* ---------- 工具 ---------- */
let QUIET=false;
const CLOCK={offset:0};
const NOW=()=>Date.now()+CLOCK.offset;
function add(a,b){const o={...a};for(const k in b)o[k]=(o[k]||0)+b[k];return o}
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const fmt=n=>Math.floor(n).toLocaleString('zh-TW');
const fmtLeft=ms=>ms>=DAY?Math.floor(ms/DAY)+' 天 '+Math.floor(ms%DAY/3600e3)+' 小時':fmtT(ms);
const pct=x=>Math.round(x*1000)/10+'%';
function fmtT(ms){const s=Math.max(0,Math.ceil(ms/1000));if(s>=3600)return Math.floor(s/3600)+'時'+Math.floor(s%3600/60)+'分';if(s>=60)return Math.floor(s/60)+'分'+String(s%60).padStart(2,'0')+'秒';return s+'秒'}
const today=()=>new Date(NOW()).toLocaleDateString('sv');
function weighted(list,wf){const tot=list.reduce((s,x)=>s+wf(x),0);let r=Math.random()*tot;for(const x of list){r-=wf(x);if(r<0)return x}return list[list.length-1]}
const itemName=k=>k.startsWith('w:')?(BP[k.slice(2)]||{n:'武器'}).n:MATS[k]||(ITEMS[k]?ITEMS[k][0]+(ITEMS[k][3]?'（'+ITEMS[k][3]+'）':''):k);
const itemIco=(k,cls='')=>{if(k.startsWith('w:'))return wArt(k.slice(2),{cls});const a=k==='gold'?'it_gold':k==='gems'?'it_gems':MATS[k]?MATART[k]:ITEMS[k]&&ITEMS[k][1];const gl=ITEMS[k]&&ITEMS[k][4];return a?img(a,cls):`<span class="ph-ico ${cls}" ${gl?`style="--gl:${gl}"`:''}>待生圖</span>`};

/* ---------- 狀態與存檔 ---------- */
const KEY='nine-realms-smith-v3',KEY_V2='nine-realms-smith-v2';
function freshStats(){return{harvest:0,forged:[0,0,0,0,0],enhTry:0,enhOk:0,enhFail:0,breaks:0,scrollUsed:0,maxLv:0,melted:0,goldIn:0,events:0}}
function freshVillage(i){return{status:i===0?'open':'locked',weaponId:null,cycleStart:null,strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}}}
const GAME_SPEED=1;    // v3.69 原本的封測 10 倍速已直接寫進狩獵／鍛造時間，畫面上的時間都是真實時間
const OFFLINE_H=12;    // v3.69 離線累積上限（真實時間 12 小時）
function fresh(){return{v:VERSION,gold:500,fcRw:true,gems:100,speed:GAME_SPEED,capH:OFFLINE_H,pity:0,
  mats:Object.fromEntries(Object.keys(MATS).map(k=>[k,0])),items:{relic_g:0,relic_b:0,relic_r:0,relic_y:0,estone:10,enstone:3},furnace:1,anvil:1,slots:1,weapons:[],nextId:1,jobs:[],
  villages:VILLAGES.map((v,i)=>freshVillage(i)),monthly:{until:0,last:''},daily:null,sign:{n:0,last:''},stats:freshStats(),ach:{},best:{},lbRw:{},rep:{lv:1,xp:0,t:{}},lastSeen:NOW(),clockWarn:false}}
function migrateV2(o){
  const s=fresh();s.gold=o.gold||0;s.gems=o.gems||0;Object.assign(s.mats,o.mats||{});Object.assign(s.items,o.items||{});
  s.mute=!!o.mute;s.furnace=o.furnace||1;s.anvil=o.anvil||1;s.slots=o.slots||1;s.monthly=o.monthly||s.monthly;
  s.weapons=(o.weapons||[]).filter(w=>BP[w.b]).map(w=>({id:w.id,b:w.b,q:w.q||0,lv:w.lv||0,traits:[],ench:[0,1,2,3].map(i=>(w.ench||[])[i]||null),created:NOW()}));
  s.jobs=(o.jobs||[]).filter(j=>BP[j.b]).map(j=>({...j,qty:j.qty||1,cost:null}));
  s.villages=VILLAGES.map((v,i)=>{const ov=(o.villages||[])[i]||{},nv=freshVillage(i);nv.status=ov.status||nv.status;nv.weaponId=ov.weaponId??null;nv.cycleStart=ov.cycleStart??null;nv._pending=ov.pending||0;return nv});
  return s;
}
function sanitize(s){
  {const m=s.mats||{},it=s.items||{};s.mats={};s.items={};for(const k in MATS)s.mats[k]=Math.max(0,Math.floor(+m[k]||0));for(const k in ITEMS)s.items[k]=Math.max(0,Math.floor(+it[k]||0))}   // v4.43 舊材料、道具直接丟掉
  s.gold=Math.max(0,Math.floor(+s.gold||0));s.gems=Math.max(0,Math.floor(+s.gems||0));delete s.slag;
  {const c=s.codex&&typeof s.codex==='object'?s.codex:{};s.codex={};for(const k in c)if(BP[k]&&Array.isArray(c[k]))s.codex[k]=[0,1,2].map(j=>c[k][j]?1:0)}   // v4.72 武器圖鑑
  s.stats=Object.assign(freshStats(),s.stats||{});s.ach=s.ach||{};s.sign=s.sign&&typeof s.sign==='object'?{n:Math.max(0,Math.min(SIGN.length,s.sign.n|0)),last:String(s.sign.last||'')}:{n:0,last:''};if(s.daily&&!(s.daily.b&&Array.isArray(s.daily.box)))s.daily=null;s.best=s.best||{};s.lbRw=s.lbRw||{};s.speed=GAME_SPEED;s.capH=OFFLINE_H;s.pity=s.pity||0;
  {const r=s.rep||{};s.rep={lv:Math.max(1,Math.floor(+r.lv||1)),xp:Math.max(0,Math.floor(+r.xp||0)),t:{}};for(const k in TALENTS)s.rep.t[k]=Math.max(0,Math.min(TALENTS[k].max,Math.floor(+(r.t||{})[k]||0)))}
  s.weapons.forEach(w=>w.b=bpId(w.b));(s.jobs||[]).forEach(j=>{j.b=bpId(j.b);j.end=Math.min(j.end,j.start+FORGE_SEC*1000)});for(const k in (s.best||{}))if(s.best[k])s.best[k].b=bpId(s.best[k].b);   // v3.78 舊存檔鍛造中的武器（j.end）改成 5 秒內完成
  const seen=new Set();s.weapons=s.weapons.filter(w=>BP[w.b]);let maxId=0;
  for(const w of s.weapons){if(seen.has(w.id))w.id=null;else seen.add(w.id);maxId=Math.max(maxId,w.id||0);w.lock=!!w.lock;w.test=!!w.test;w.traits=w.traits||[];elemCleanW(w);w.created=w.created||NOW()}
  for(const w of s.weapons)if(w.id==null)w.id=++maxId;
  s.nextId=Math.max(s.nextId||1,maxId+1);
  s.villages=(s.villages||[]).slice(0,VILLAGES.length);while(s.villages.length<VILLAGES.length)s.villages.push(freshVillage(s.villages.length));   // v3.76 舊存檔補上第二界
  s.villages.forEach((v,i)=>{if(i&&v.status==='locked'&&s.villages[i-1].status==='cleared')v.status='open'});
  const used=new Set();
  // v4.38 狩獵策略拿掉（Mochi），舊存檔一律改回一般狩獵
  s.villages.forEach(v=>{if(v.weaponId!=null&&(!s.weapons.some(w=>w.id===v.weaponId)||used.has(v.weaponId))){v.weaponId=null;v.cycleStart=null}if(v.weaponId!=null)used.add(v.weaponId);
    v.strat='normal';v.bank=v.bank||{cycles:0,gold:0,mats:{},events:0}});
  s.villages.forEach((v,i)=>{const w=v.weaponId!=null&&s.weapons.find(x=>x.id===v.weaponId);if(w)lbRecord(s,i,w)});
  if(!s.fcRw){s.fcRw=true;const g=s.villages.reduce((a,v,i)=>a+(v.status==='cleared'?FIRST_GOLD[i]||0:0),0);if(g){s.gold+=g;s._fcMsg=g}}   // v3.50 補發已收復村莊的首破獎勵
  return s;
}
let S;
// v3.43 正式網站（github.io）一律雲端存檔：不讀寫本機存檔、沒有訪客模式。Claude 測試版連不到伺服器，保留本機模式方便看畫面。
const CLOUD_ONLY=typeof location!=='undefined'&&(/github\.io$/.test(location.hostname)||/cloudonly/.test(location.hash));
function loadState(){
  let s=null,migrated=false;
  if(CLOUD_ONLY){try{localStorage.removeItem(KEY);localStorage.removeItem(KEY_V2)}catch(e){}S=sanitize(fresh());return false}
  try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!s){try{const o=JSON.parse(localStorage.getItem(KEY_V2));if(o&&o.villages){s=migrateV2(o);migrated=true}}catch(e){}}
  if(typeof window!=='undefined'&&window.claude?.hot?.data?.S)s=window.claude.hot.data.S;
  if(!s||!s.villages)s=fresh();
  S=sanitize(s);
  if(migrated){S.villages.forEach((st,i)=>{const n=st._pending||0;delete st._pending;if(!n)return;const w=st.weaponId!=null&&W(st.weaponId);for(let c=0;c<n;c++)rollCycle(i,w,st)});}
  return migrated;
}
function save(){if(QUIET)return;S.savedAt=Date.now();CLOUD.dirty=true;if(CLOUD_ONLY)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- v3.34 雲端帳號與存檔（Supabase：Email＋密碼；本機照常存，定時與離開時同步到雲端） ---------- */
const BUILD_ID='4.81';const BUILD='v'+BUILD_ID+' 封測';const BETA=true;
const MAINT=true;   // v4.18 封測暫停：開遊戲只看到維護公告，一般玩家進不去；只有管理員（admins 表）登入後能進。重新開放：改成 false 並更新 BUILD_ID
const SB_URL='https://bzvilstgpjkztrydjwlt.supabase.co',SB_KEY='sb_publishable_CMSLltB8qKwMU3nUFezthw_HRm3EBN4',AUTH_KEY='nrs-auth';
const CLOUD={dirty:false,busy:false,last:0,err:'',state:'off',ready:false,kicked:false};let SID=null;
let AUTH=null;try{AUTH=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch(e){}
function authSave(a){AUTH=a;try{a?localStorage.setItem(AUTH_KEY,JSON.stringify(a)):localStorage.removeItem(AUTH_KEY)}catch(e){}}
function authFrom(r){return{access_token:r.access_token,refresh_token:r.refresh_token,expires_at:Date.now()+((r.expires_in||3600)-60)*1000,user:{id:r.user?.id,email:r.user?.email}}}
const SB_ERR=m=>{m=String(m||'');return /signups? (are )?(not allowed|disabled)/i.test(m)?'目前暫停開放註冊，請聯絡遊戲管理員':/duplicate key|unique|23505/i.test(m)?'這個暱稱已經有人用了，換一個吧':/invalid login/i.test(m)?'Email 或密碼錯誤':/already registered|already exists/i.test(m)?'這個 Email 已經註冊過，請直接登入':/at least 6|password should/i.test(m)?'密碼至少要 6 碼':/invalid.*email|email.*invalid|unable to validate email/i.test(m)?'Email 格式不正確':/rate limit|too many/i.test(m)?'嘗試太多次，請稍後再試':/failed to fetch|network/i.test(m)?'連不上伺服器，請檢查網路':m||'發生錯誤，請再試一次'};
async function sbAuth(path,body){const r=await fetch(SB_URL+'/auth/v1/'+path,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.msg||j.error_description||j.message||j.error||('HTTP '+r.status));return j}
async function sbToken(){if(!AUTH)return null;if(Date.now()<AUTH.expires_at)return AUTH.access_token;
  try{const st=JSON.parse(localStorage.getItem(AUTH_KEY)||'null');if(st&&st.user&&st.user.id===AUTH.user.id&&st.expires_at>Date.now()){AUTH=st;return AUTH.access_token}}catch(e){}   // v3.47 同瀏覽器另一個分頁已經換過新憑證，直接沿用，避免兩邊同時換憑證互相作廢
  try{const j=await sbAuth('token?grant_type=refresh_token',{refresh_token:AUTH.refresh_token});authSave({...authFrom(j),user:AUTH.user});return AUTH.access_token}
  catch(e){CLOUD.err='登入已過期，請重新登入';if(!/fetch|network/i.test(e.message)&&CLOUD.ready&&!CLOUD.kicked){CLOUD.reauth=true;CLOUD.ready=false;authSave(null);if(typeof showLogin==='function')showLogin('登入已過期，請重新登入（目前的進度會保留）')}return null}}
async function sbRest(path,opt={}){const t=await sbToken();if(!t)throw new Error('尚未登入');
  const r=await fetch(SB_URL+'/rest/v1/'+path,{...opt,headers:{apikey:SB_KEY,Authorization:'Bearer '+t,'Content-Type':'application/json',...(opt.headers||{})}});
  if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||('HTTP '+r.status))}const tx=await r.text();if(!tx)return null;try{return JSON.parse(tx)}catch(e){return null}}
async function cloudSignup(email,pw){const j=await sbAuth('signup',{email,password:pw});
  if(!j.access_token){const k=await sbAuth('token?grant_type=password',{email,password:pw});authSave(authFrom(k))}else authSave(authFrom(j));return cloudAfterLogin()}
async function cloudLogin(email,pw){authSave(authFrom(await sbAuth('token?grant_type=password',{email,password:pw})));return cloudAfterLogin()}
function cloudLogout(){cloudPush(true).finally(()=>{authSave(null);CLOUD.ready=false;CLOUD.state='off';CLOUD.admin=false;
  if(CLOUD_ONLY){S=sanitize(fresh());ui.sheet=null;ui.result=null;render();showLogin()}else{toast('已登出。');render()}})}
// 登入後：讀雲端存檔（雲端為準）；新帳號建立全新進度。並登記這支手機的連線代碼（同帳號只能一支手機）
async function cloudAfterLogin(){const uid=AUTH.user.id;SID=Math.random().toString(36).slice(2)+Date.now().toString(36);CLOUD.kicked=false;
  LBR.rows={};LBR.t=0;MK.rows=[];MK.mine=[];MK.t=0;Object.assign(CHAT,{rows:[],last:0,g:[],glast:0,gunread:0,sys:[],sysLast:0,unread:0,t:0,err:''});Object.assign(GD,{d:null,list:null,t:0,mk:false,edit:false});Object.assign(FR,{d:null,find:null,t:0});
  // 先登記這支手機、同一個請求拿回存檔：避免「讀完存檔、還沒登記前，舊手機又存了一次」被蓋掉
  let row=null;try{const r=await sbRest('rpc/claim_session',{method:'POST',body:JSON.stringify({p_sid:SID})});row=Array.isArray(r)?r[0]:r;if(row&&!row.data&&!row.updated_at)row=null}catch(e){CLOUD.err=SB_ERR(e.message);throw e}
  const keepMem=CLOUD.reauth&&S.uid===uid&&row&&Date.parse(row.updated_at)<=(CLOUD.pushAt||0)+3000;   // 登入過期重登：雲端沒被別台改過 → 保留目前畫面上的進度
  if(keepMem){}else if(row&&row.data&&row.data.villages){S=sanitize(row.data);if(row.nickname&&!S.nick)S.nick=row.nickname}else if(CLOUD_ONLY)S=sanitize(fresh());
  S.uid=uid;CLOUD.reauth=false;
  if(S.tut==null)S.tut=(!S.weapons.length&&!S.jobs.length&&cleared()===0)?0:99;   // v3.51 登入後換成雲端存檔，新帳號要重新判斷是否開始新手導覽
  if(!row)await sbRest('rpc/create_save',{method:'POST',body:JSON.stringify({p_sid:SID,p_data:S})});
  try{localStorage.setItem('nrs-sid',SID)}catch(e){}
  CLOUD.ready=true;CLOUD.dirty=!!keepMem;CLOUD.last=Date.now();CLOUD.state='ok';CLOUD.err='';if(!CLOUD_ONLY)try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  if(keepMem)cloudPush(true);syncClock();adminCheck();render();return row?'cloud':'new'}
// v3.63 向伺服器確認是不是管理員（admins 表）；查不到或伺服器還沒更新 → 當作一般玩家
function adminCheck(){CLOUD.admin=false;if(!AUTH)return Promise.resolve(false);return sbRest('rpc/is_admin',{method:'POST',body:'{}'}).then(r=>{CLOUD.admin=r===true;render();return CLOUD.admin}).catch(()=>false)}
// 伺服器時間：所有狩獵／鍛造計時都用伺服器時間，換手機、手機時間不準都不會出錯
async function syncClock(){if(!AUTH)return;try{const t0=Date.now(),r=await sbRest('rpc/server_now',{method:'POST',body:'{}'}),t1=Date.now();const sv=Date.parse(typeof r==='string'?r:(r&&r.server_now)||'');
  if(sv)CLOCK.offset=sv+(t1-t0)/2-t1}catch(e){}}
// 存檔上傳：只有「目前登記的這支手機」寫得進去；寫不進去代表帳號已在別的手機登入
async function cloudPush(force,leaving){if(!AUTH||!CLOUD.ready||CLOUD.busy||CLOUD.kicked||CLOUD.outdated||(!force&&!CLOUD.dirty))return;CLOUD.busy=true;CLOUD.dirty=false;
  try{const body=JSON.stringify({p_sid:SID,p_data:S,p_nick:S.nick||null});
    const r=await sbRest('rpc/save_game',{method:'POST',keepalive:!!leaving&&body.length<60000,body});   // v3.49 存檔一律經過伺服器檢查
    if(typeof r==='string'&&r.startsWith('cheat')){CLOUD.busy=false;return cloudCheat(r)}
    CLOUD.last=CLOUD.pushAt=Date.now();CLOUD.err='';CLOUD.state='ok';if(NEWS.out.length)setTimeout(newsFlush,0)}
  catch(e){if(/session/i.test(e.message)){CLOUD.busy=false;return cloudKicked()}CLOUD.dirty=true;CLOUD.err=SB_ERR(e.message);CLOUD.state='err'}finally{CLOUD.busy=false}}
// 伺服器判定存檔異常（數值增加超過合理範圍）：還原到雲端上最後一次正常的進度
async function cloudCheat(r){console.warn('save rejected',r);CLOUD.dirty=false;try{const x=await sbRest('saves?select=data&user_id=eq.'+AUTH.user.id);if(x&&x[0]&&x[0].data&&x[0].data.villages){S=sanitize(x[0].data);S.uid=AUTH.user.id}}catch(e){}
  ui.sheet=null;ui.result=null;render();toast('⚠ 存檔資料異常，已還原到上一次正常的進度。若你沒有修改遊戲資料，請截圖回報給管理員。','bad')}
function cloudKicked(){if(CLOUD.kicked||CLOUD.leaving)return;   // 頁面正在關閉／重新整理：不處理（避免舊頁面把新頁面的登入清掉）
  CLOUD.kicked=true;CLOUD.ready=false;CLOUD.admin=false;
  let tab=false;try{const ls=localStorage.getItem('nrs-sid');tab=!!ls&&ls!==SID&&!!localStorage.getItem(AUTH_KEY)}catch(e){}
  if(tab)AUTH=null;else authSave(null);   // v3.47 同瀏覽器另一個分頁接手：不清共用憑證；別台裝置接手：清掉這裡的憑證，避免重新整理又把對方擠掉
  if(CLOUD_ONLY){S=sanitize(fresh());ui.sheet=null;ui.result=null;render()}
  if(tab)return showKickTab();showLogin('這個帳號已經在其他裝置登入，這裡已自動登出。')}
function showKickTab(){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-loading';g.onclick=e=>{if(e.target.closest('[data-gk]'))location.reload()};
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key2_bg')}" alt=""><div class="gt-vig"></div></div><img class="gt-logo" src="${LG('logo2')}" alt="諸神鐵匠"><div class="gt-box gt-load"><div class="gt-ttl">遊戲已在另一個分頁開啟</div><div class="small muted center">同一個帳號一次只能在一個地方玩。要在這裡繼續，請按下方按鈕（另一個分頁會自動停止）。</div><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gk="1">在這裡繼續玩</button></div>`}
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key==='nrs-sid'&&CLOUD.ready&&e.newValue&&e.newValue!==SID)cloudKicked()});
async function cloudCheckSession(){if(!AUTH||!CLOUD.ready||CLOUD.kicked)return;try{const r=await sbRest('saves?select=session_id&user_id=eq.'+AUTH.user.id);if(r&&r[0]&&r[0].session_id&&r[0].session_id!==SID)cloudKicked()}catch(e){}}
/* ---------- v3.70 全服強化跑馬燈：+10 以上成功或爆裝 → 存檔上傳後交給伺服器核對再公告；每 30 秒拿別人的公告 ---------- */
const NEWS={out:[],q:[],busy:false,last:0,t:0,on:false};
const NEWS_MIN=10;
function newsQueue(b,lv,ok){if(QUIET||lv<NEWS_MIN)return;NEWS.out.push({b,lv,ok});setTimeout(()=>newsShow({nick:S.nick||'你',bp:b,lv,ok,me:true}),2500)}
async function newsFlush(){if(!AUTH||!CLOUD.ready||NEWS.busy)return;NEWS.busy=true;
  try{while(NEWS.out.length){const n=NEWS.out.shift();try{await sbRest('rpc/news_post',{method:'POST',body:JSON.stringify({p_sid:SID,p_bp:n.b,p_lv:n.lv,p_ok:n.ok})})}catch(e){}
    if(NEWS.out.length)await new Promise(r=>setTimeout(r,2100))}}finally{NEWS.busy=false}}
async function newsFetch(){if(!AUTH||!CLOUD.ready||document.hidden)return;NEWS.t=Date.now();
  try{const r=await sbRest('rpc/news_list',{method:'POST',body:JSON.stringify({p_after:NEWS.last})});if(!Array.isArray(r))return;
    for(const x of r){NEWS.last=Math.max(NEWS.last,+x.id||0);if(!x.mine)newsShow(x)}}catch(e){}}
function newsText(n){const b=BP[bpId(n.bp)];if(!b)return'';const nm=esc(n.nick||'無名鐵匠'),w=`<b class="nw-w">${esc(b.n)}</b>`;
  return n.ok?`恭喜 <b>${nm}</b> 把 ${w} 強化到 <b class="nw-lv">+${n.lv}</b>！`:`<b>${nm}</b> 的 ${w} 衝 <b>+${n.lv}</b> 失敗，武器化為殘渣……`}
function newsShow(n){const h=n.h||newsText(n);if(!h)return;NEWS.q.push({h,ok:n.ok});if(NEWS.q.length>5)NEWS.q.shift();if(!NEWS.on)newsNext()}
function newsNext(){const el=typeof document!=='undefined'&&document.getElementById('news');if(!el)return;const n=NEWS.q.shift();
  if(!n){NEWS.on=false;el.classList.remove('on');return}NEWS.on=true;
  if(typeof tutOn==='function'&&tutOn()){NEWS.q.length=0;NEWS.on=false;el.classList.remove('on');return}   // 新手導覽中不打擾
  el.innerHTML=`<span class="nw-tx ${n.ok?'ok':'bad'}">${n.h}</span>`;el.classList.add('on');const tx=el.firstChild,W=el.clientWidth,dist=W+tx.offsetWidth;
  tx.style.setProperty('--nw-from',W+'px');tx.style.setProperty('--nw-to',-tx.offsetWidth+'px');tx.style.animationDuration=Math.max(6,dist/70)+'s';
  tx.addEventListener('animationend',()=>setTimeout(newsNext,400),{once:true})}
if(typeof window!=='undefined')setInterval(()=>{if(Date.now()-NEWS.t>30000)newsFetch()},5000);
/* ---------- v4.73 秒殺榜（Mochi 選：只做評價＋排行、20 關都有榜、稱號先不用）：60 秒挑戰打贏記最快秒數（0.1 秒）和當時的武器，
   上傳 fk_submit（伺服器核對雲端存檔：這關已收復、武器在存檔裡），fk_board 讀前 50 名；4 隻王（每界第 9、10 關）首殺／刷新第 1 名上跑馬燈（20 SQL） ---------- */
const FK={b:{},feed:0,t:0,busy:false,mock:null};
const fkBoss=i=>i%10>=8;
const fkSec=sec=>Math.max(1,Math.round(sec*10)/10);
// 本機紀錄：只留最快那次（st.fk＝秒數、st.fkw＝當時的武器、st.fku＝已上傳的秒數）
function fkRec(i,sec,w){const st=S.villages[i];if(!st||sec==null||!w)return null;const s=fkSec(sec),prev=st.fk??null,better=prev==null||s<prev;
  if(better){st.fk=s;st.fkw={id:w.id,b:w.b,q:w.q|0,lv:w.lv|0,ench:w.ench||[]};save()}return{sec:s,prev,better}}
const fkMine=i=>{const st=S.villages[i];return st&&st.fk!=null?{sec:st.fk,w:st.fkw}:null};
const fkErr=r=>({login:'請先登入',session:'帳號已在別的裝置登入',nope:'雲端存檔還沒收復這一關，稍後會自動重傳',weapon:'這把武器還沒存到雲端，稍後會自動重傳',slow:'上傳太快，稍後會自動重傳',bad:'紀錄異常'}[r]||'上傳失敗');
// 上傳沒傳過的紀錄：先把存檔推上雲端（伺服器用雲端存檔核對收復和武器），再一關一關傳
async function fkSync(){if(!AUTH||!CLOUD.ready||FK.busy)return;const todo=S.villages.map((v,i)=>i).filter(i=>{const v=S.villages[i];return v.fk!=null&&v.fku!==v.fk&&v.fkw&&W(v.fkw.id)});if(!todo.length)return;
  FK.busy=true;try{if(CLOUD.dirty||CLOUD.busy){await cloudPush(true);if(CLOUD.dirty)return}
    for(const i of todo){const v=S.villages[i];let r;try{r=await sbRest('rpc/fk_submit',{method:'POST',body:JSON.stringify({p_sid:SID,p_village:i,p_sec:v.fk,p_wid:v.fkw.id})})}catch(e){FK.b[i]={...(FK.b[i]||{}),err:SB_ERR(e.message)};break}
      if(r&&(r.r==='ok'||r.r==='kept')){v.fku=v.fk;save();FK.b[i]={...(FK.b[i]||{}),my:{rk:r.rank,n:r.n,top:+r.top},t:0,err:''};if(r.kind)fkAnn({nick:S.nick||'你',village:i,sec:v.fk,bp:v.fkw.b,lv:v.fkw.lv,kind:r.kind})}
      else{FK.b[i]={...(FK.b[i]||{}),err:fkErr(r&&r.r)};if(r&&r.r==='bad'){v.fku=v.fk;save()}if(r&&r.r==='session')return cloudKicked();break}
      if(todo.length>1)await new Promise(z=>setTimeout(z,3100))}}finally{FK.busy=false;if(ui.sheet&&/^(chr|fk|v)$/.test(ui.sheet.t))render()}}
async function fkLoad(i,force){const c=FK.b[i]||{};if(FK.mock||!AUTH||c.loading||(!force&&c.t&&Date.now()-c.t<30000))return;FK.b[i]={...c,loading:true};
  try{const r=await sbRest('rpc/fk_board',{method:'POST',body:JSON.stringify({p_village:i})});FK.b[i]={rows:(r&&r.rows)||[],n:(r&&r.n)|0,me:r&&r.me,my:r&&r.me?{rk:r.me.rk,n:r.n|0,top:r.rows&&r.rows[0]?+r.rows[0].sec:null}:c.my,t:Date.now(),err:''}}
  catch(e){FK.b[i]={...c,loading:false,t:Date.now(),err:SB_ERR(e.message)}}if(ui.sheet&&/^(fk|v)$/.test(ui.sheet.t))render()}
const fkBoard=i=>FK.mock?FK.mock(i):FK.b[i]||{};
function fkAnnText(n){const i=+n.village,b=BP[bpId(n.bp)],nm=esc(n.nick||'無名鐵匠'),m=`<b class="nw-w">${esc(MONS[i]||'')}</b>`,s=`<b class="nw-lv">${(+n.sec).toFixed(1)} 秒</b>`;
  return n.kind==='first'?`<b>${nm}</b> 成為全服第一個擊敗 ${m} 的鐵匠！（${s}）`:`<b>${nm}</b> 用 ${b?`<b class="nw-w">${esc(b.n)} +${n.lv|0}</b>`:'武器'} ${s} 擊敗 ${m}，刷新全服紀錄！`}
function fkAnn(n){if(QUIET)return;newsShow({h:fkAnnText(n),ok:true})}
async function fkFeed(){if(!AUTH||!CLOUD.ready||document.hidden)return;FK.t=Date.now();
  try{const r=await sbRest('rpc/fk_feed_list',{method:'POST',body:JSON.stringify({p_after:FK.feed})});if(!Array.isArray(r))return;for(const x of r){FK.feed=Math.max(FK.feed,+x.id||0);if(!x.mine)fkAnn(x)}}catch(e){}}
if(typeof window!=='undefined')setInterval(()=>{if(Date.now()-FK.t>30000)fkFeed();if(AUTH&&CLOUD.ready&&!document.hidden)fkSync()},5000);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- v3.88 世界聊天＋玩家名片：全部經過伺服器函式（chat_send 檢查冷卻、禁言、等級、髒話）；聊天開著每 4 秒、關著每 30 秒拿新訊息 ---------- */
const CHAT={rows:[],last:0,g:[],glast:0,gunread:0,sys:[],sysLast:0,unread:0,sysUnread:0,t:0,busy:false,cd:0,draft:'',err:'',tab:'w',sending:false,mockN:0};
// v3.89 稱號（條件要和 SQL chat_titles 一致；屠龍者、人氣鐵匠只有伺服器算得出來）
const TITLES=[{k:'smith12',n:'百鍛名匠',d:'把武器強化到 +12'},{k:'legend',n:'傳說鍛造師',d:'鍛造出傳說品質的武器'},{k:'guard',n:'九界守護者',d:'收復 10 座村莊'},{k:'giant',n:'巨人剋星',d:'收復約頓海姆 2-1'},{k:'dragon',n:'屠龍者',d:'首領週排名前 3 名'},{k:'pop',n:'人氣鐵匠',d:'累積 30 個讚'}];
const titleLocal=k=>k==='smith12'?S.stats.maxLv>=12:k==='legend'?(S.stats.forged[4]||0)>0:k==='guard'?cleared()>=10:k==='giant'?!!(S.villages[10]&&S.villages[10].status==='cleared'):false;
const titleOn=k=>!!k&&(titleLocal(k)||(PC.mine||[]).includes(k));
const CHAT_MAX=60,CHAT_CD=5000,CHAT_LV=3,CHAT_QUICK=['恭喜！','節哀…','求帶','收武器','謝謝','哈哈'];
const chatOn=()=>!!(AUTH&&CLOUD.ready);
const chatMock=()=>!AUTH&&!CLOUD_ONLY;   // 本機未登入：離線模擬，用來看畫面
const chatOpen=()=>!!(ui.sheet&&ui.sheet.t==='chat');
const chatBlk=()=>(S.cbl=Array.isArray(S.cbl)?S.cbl:[]);
const chatBlocked=u=>chatBlk().some(x=>x.u===u);
const chatAgo=t=>{const s=Math.max(0,(Date.now()-Date.parse(t))/1000);return s<60?'剛剛':s<3600?Math.floor(s/60)+' 分鐘前':s<86400?Math.floor(s/3600)+' 小時前':Math.floor(s/86400)+' 天前'};
// 畫面上先擋明顯不行的內容（伺服器還會再檢查一次）
function chatPre(t){t=String(t||'').replace(/\s+/g,' ').trim();const n=Array.from(t).length;
  if(!n)return'請先輸入內容';if(n>CHAT_MAX)return`最多 ${CHAT_MAX} 個字`;
  if(/(https?:\/\/|www\.|\.(com|net|org|tw|cc|io|me|gg)\b|line\s*(id|:|：)|09\d{2}[\s-]?\d{3}[\s-]?\d{3}|\d{8,})/i.test(t))return'不能貼網址、電話號碼或 LINE ID';return''}
const CHAT_MSG={slow:'太快了，{n} 秒後才能再發言',many:'發言太頻繁，請等一分鐘再說',dup:'不要重複發一樣的訊息',link:'不能貼網址、電話號碼或 LINE ID',len:`訊息要 1～${CHAT_MAX} 個字`,lv:`鐵匠等級 Lv.${CHAT_LV} 才能在世界頻道發言`,nonick:'請先取暱稱',login:'請先登入',ch:'這個頻道還沒開放',noguild:'你還沒有加入公會'};
function chatErrText(r){r=String(r||'');if(r.startsWith('muted:'))return`你被禁言到 ${r.slice(6)}`;if(r.startsWith('slow:'))return CHAT_MSG.slow.replace('{n}',r.slice(5));return CHAT_MSG[r]||'發送失敗，請再試一次'}
const chatSrvErr=e=>/function|not find|schema cache|404/i.test(e&&e.message||'')?'聊天功能還沒開通（伺服器還沒更新）':SB_ERR(e&&e.message);
// 離線模擬資料
const CHAT_MOCK_ROWS=[['雷霆之錘',18,'有人要 +10 戰斧嗎？交易所掛 3,000 金幣'],['冰原少女',9,'新手問一下，防爆卷什麼時候用比較好？'],['霜狼',22,'高等級再用，前面先省著'],['渡鴉',25,'剛衝上 +12，手還在抖'],['北境小鐵',14,'這把真的＊＊心痛']];
function chatMockInit(){if(CHAT.rows.length)return;const t=Date.now();CHAT.rows=CHAT_MOCK_ROWS.map(([n,lv,b],k)=>({id:k+1,uid:'mock-'+k,nick:n,lv,body:b,mine:false,at:new Date(t-(5-k)*60000).toISOString(),title:k===2?'smith12':k===3?'legend':null,w:k===3?{b:'dev_sword',q:3,lv:12,rf:0,traits:[],ench:[]}:null}));CHAT.last=CHAT.rows.length;
  CHAT.sys=[{id:1,uid:'mock-2',nick:'霜狼',bp:'dev_sword',lv:12,ok:true,at:new Date(t-300000).toISOString(),cheers:4,cheered:false},{id:3,uid:'me',mine:true,nick:S.nick||'我',bp:'dev_axe',lv:10,ok:true,at:new Date(t-200000).toISOString(),cheers:2},{id:2,uid:'mock-4',nick:'北境小鐵',bp:'dev_bow',lv:11,ok:false,at:new Date(t-120000).toISOString()}];CHAT.sysLast=2;
  CHAT.g=[{id:1001,uid:'mock-2',nick:'霜狼',lv:22,body:'這週目標：公會升到 Lv.4！',mine:false,at:new Date(t-900000).toISOString(),title:'dragon'},{id:1002,uid:'mock-1',nick:'冰原少女',lv:9,body:'今天的 3 次捐獻捐完了～',mine:false,at:new Date(t-240000).toISOString()}];CHAT.glast=1002}
function chatAdd(rows,g){const L=g?CHAT.g:CHAT.rows,lk=g?'glast':'last';let n=0;for(const x of rows){if(L.some(r=>r.id===x.id))continue;L.push(x);CHAT[lk]=Math.max(CHAT[lk],+x.id||0);if(!x.mine&&!chatBlocked(x.uid))n++}
  if(L.length>120)L.splice(0,L.length-120);return n}
async function chatFetch(force){if(CHAT.busy||!chatOn()||document.hidden)return;CHAT.busy=true;CHAT.t=Date.now();const first=!CHAT.last;
  try{const r=await sbRest('rpc/chat_list',{method:'POST',body:JSON.stringify({p_ch:'w',p_after:CHAT.last})});CHAT.err='';
    if(Array.isArray(r)){const n=chatAdd(r);if(!first&&!(chatOpen()&&CHAT.tab==='w'))CHAT.unread=Math.min(99,CHAT.unread+n)}
    if(gdIn()){const g1=!CHAT.glast,q=await sbRest('rpc/chat_list',{method:'POST',body:JSON.stringify({p_ch:'g',p_after:CHAT.glast})});if(Array.isArray(q)){const n=chatAdd(q,1);if(!g1&&!(chatOpen()&&CHAT.tab==='g'))CHAT.gunread=Math.min(99,CHAT.gunread+n)}}
    if(chatOpen()&&CHAT.tab==='s'||force){const s=await sbRest('rpc/chat_sys',{method:'POST',body:JSON.stringify({p_after:CHAT.sysLast})});
      if(Array.isArray(s))for(const x of s){if(CHAT.sys.some(y=>y.id===x.id))continue;CHAT.sys.push(x);CHAT.sysLast=Math.max(CHAT.sysLast,+x.id||0)}if(CHAT.sys.length>60)CHAT.sys.splice(0,CHAT.sys.length-60)}}
  catch(e){CHAT.err=chatSrvErr(e)}finally{CHAT.busy=false}chatPaint();cheerInbox()}
if(typeof window!=='undefined')setInterval(()=>{if(!chatOn())return;const gap=chatOpen()?4000:30000;if(Date.now()-CHAT.t>=gap)chatFetch()},1000);
async function chatSend(wid){const el=document.getElementById('cxIn');let t=(el?el.value:CHAT.draft).replace(/\s+/g,' ').trim();const sw=wid!=null&&S.weapons.find(w=>w.id===wid&&!w.test);
  if(wid!=null&&!sw)return toast('找不到這把武器','bad');if(sw&&!t)t='分享了一把武器';
  if(CHAT.sending)return;const pre=chatPre(t);if(pre)return toast(pre,'bad');
  const left=CHAT.cd-Date.now();if(left>0)return toast(chatErrText('slow:'+Math.ceil(left/1000)),'bad');
  const gch=CHAT.tab==='g';if(gch&&!gdIn())return toast(CHAT_MSG.noguild,'bad');
  if(chatMock()){chatMockInit();chatAdd([{id:gch?++CHAT.glast:++CHAT.last,uid:'me',nick:S.nick||'我',lv:smithLv(),body:t,mine:true,at:new Date().toISOString(),title:titleOn(S.title)?S.title:null,w:sw?{b:sw.b,q:sw.q,lv:sw.lv,rf:sw.rf||0,traits:sw.traits,ench:sw.ench,p:power(sw)}:null}],gch)}
  else{if(!chatOn())return toast('請先登入','bad');if(!S.nick)return toast(CHAT_MSG.nonick,'bad');CHAT.sending=true;
    try{const r=await sbRest('rpc/chat_send',{method:'POST',body:JSON.stringify(sw?{p_sid:SID,p_ch:gch?'g':'w',p_body:t,p_wid:sw.id}:{p_sid:SID,p_ch:gch?'g':'w',p_body:t})});
      if(r==='session')return cloudKicked();if(r!=='ok')return toast(chatErrText(r),'bad')}
    catch(e){return toast(chatSrvErr(e),'bad')}finally{CHAT.sending=false}}
  CHAT.cd=Date.now()+CHAT_CD;CHAT.draft='';CHAT.pick=false;if(el)el.value='';snd('ui_click');if(sw)render();if(!chatMock())await chatFetch();chatPaint(true)}
function chatRowHtml(x){const u=esc(x.uid||''),nm=esc(x.nick||'無名鐵匠');
  const T=TITLES.find(t=>t.k===x.title),w=x.w&&BP[bpId(x.w.b)]?x.w:null,b=w&&BP[bpId(w.b)];
  return `<div class="cx-m">${T?`<span class="tt">${T.n}</span>`:''}<span class="lv">Lv${x.lv|0}</span><button class="who ${x.mine?'me':''}" data-act="pcard" data-u="${u}" data-n="${nm}" data-m="${x.mine?'':+x.id||''}">${x.mine?'我':nm}</button>${esc(x.body)}<span class="tm">${chatAgo(x.at)}</span>${w?`<button class="cx-card" data-act="chatw" data-m="${+x.id||0}"><span class="ca">${wArt(b.id,{frame:fq(w)})}</span><span class="grow"><b class="${lc(w)}">${esc(b.n)} <span class="lvt">+${w.lv|0}</span></b><span class="small muted">攻擊力 ${fmt(w.p||power({...w,b:b.id}))}</span></span><span class="go">查看</span></button>`:''}</div>`}
function chatSysHtml(x){const b=BP[bpId(x.bp)];if(!b)return'';const nm=esc(x.nick||'無名鐵匠'),who=`<button class="who" data-act="pcard" data-u="${esc(x.uid||'')}" data-n="${nm}">${nm}</button>`,mine=x.mine||!!(AUTH&&x.uid===AUTH.user.id),n=x.cheers|0;
  const ch=!x.ok?'':mine?(n?`<span class="cx-chn">${n} 位鐵匠恭喜你</span>`:''):`<button class="cx-ch ${x.cheered?'on':''}" data-act="cheer" data-id="${+x.id||0}" ${x.cheered?'disabled':''}>${x.cheered?'已恭喜':'恭喜'}${n?' '+n:''}</button>`;
  return `<div class="cx-sys ${x.ok?'':'brk'}"><div class="cx-st">${x.ok?`恭喜 ${who} 把 <b>${esc(b.n)}</b> 強化到 <b>+${x.lv}</b>！`:`${who} 的 <b>${esc(b.n)}</b> 衝 <b>+${x.lv}</b> 失敗，武器化為殘渣……`}<span class="tm">${chatAgo(x.at)}</span></div>${ch}</div>`}
// v3.89 恭喜：別人恭喜我的紀錄，每 30 秒看一次，合併成一則提示
async function cheerAdd(id){const x=CHAT.sys.find(r=>r.id===id);if(!x||x.cheered)return;
  if(!chatMock()){try{const r=await sbRest('rpc/news_cheer_add',{method:'POST',body:JSON.stringify({p_id:id})});if(r!=='ok'&&r!=='done')return toast({self:'不能恭喜自己',gone:'這則公告已經過期了',many:'今天恭喜太多次了，明天再來',login:'請先登入'}[r]||'恭喜失敗','bad')}catch(e){return toast(chatSrvErr(e),'bad')}}
  x.cheered=true;x.cheers=(x.cheers|0)+1;snd('deliver');toast(`已恭喜 ${esc(x.nick)}！`,'ok');chatPaint()}
async function cheerInbox(){if(!chatOn()||Date.now()-(CHAT.ci||0)<30000)return;CHAT.ci=Date.now();
  try{const r=await sbRest('rpc/news_cheer_inbox',{method:'POST',body:JSON.stringify({p_after:S.cheerLast||0})});if(!Array.isArray(r)||!r.length)return;cheerShow(r)}catch(e){}}
function cheerShow(r){const g={};for(const x of r){S.cheerLast=Math.max(S.cheerLast||0,+x.id||0);(g[x.news_id]=g[x.news_id]||{bp:x.bp,lv:x.lv,n:[]}).n.push(x.from_nick||'無名鐵匠')}save();
  Object.values(g).forEach((v,i)=>{const b=BP[bpId(v.bp)],who=v.n.slice(0,2).map(esc).join('、')+(v.n.length>2?` 等 ${v.n.length} 位鐵匠`:'');setTimeout(()=>{snd('deliver');toast(`🎉 ${who} 恭喜你${b?`把 <b>${esc(b.n)}</b> 強化到 +${v.lv|0}`:''}！`,'ok')},i*2800)})}
function chatPickHtml(){const ws=S.weapons.filter(w=>!w.test).sort((a,b)=>power(b)-power(a)).slice(0,40);
  return `<div class="small muted cx-pk-h">選一把武器貼到${CHAT.tab==='g'?'公會':'世界'}頻道（輸入框的文字會一起送出）</div>`+(ws.length?ws.map(w=>{const b=BP[w.b];return `<button class="cx-card cx-pk" data-act="chatsendw" data-id="${w.id}"><span class="ca">${wArt(b.id,{frame:fq(w)})}</span><span class="grow"><b class="${lc(w)}">${esc(b.n)} <span class="lvt">+${w.lv}</span></b><span class="small muted">攻擊力 ${fmt(power(w))}</span></span><span class="go">貼上</span></button>`}).join(''):'<div class="small muted center cx-empty">道具欄是空的</div>')}
function chatListHtml(){if(CHAT.pick&&(CHAT.tab==='w'||CHAT.tab==='g'&&gdIn()))return chatPickHtml();
  if(CHAT.tab==='g'){if(!gdIn())return `<div class="cx-empty cx-gd0"><div class="small muted center">加入公會後，這裡就是公會成員專用的聊天室</div>${btn('找公會／建立公會','gdopen',{cls:'btn-primary'})}</div>`;const r=CHAT.g.filter(x=>!chatBlocked(x.uid));return `<button class="cx-gdh" data-act="gdopen">${gdEmb(S.gd.emb,'sm')}<b>${esc(S.gd.name)}</b><span class="small muted">公會 Lv.${S.gd.lv|0}</span><span class="go">公會主頁</span></button>`+(r.length?r.map(chatRowHtml).join(''):`<div class="small muted center cx-empty">${CHAT.err||'公會頻道還沒有人說話'}</div>`)}if(CHAT.tab==='s'){const r=CHAT.sys.filter(x=>!chatBlocked(x.uid));return r.length?r.map(chatSysHtml).join(''):`<div class="small muted center cx-empty">${CHAT.err||'最近一天還沒有 +10 以上的強化公告'}</div>`}
  const r=CHAT.rows.filter(x=>!chatBlocked(x.uid));return r.length?r.map(chatRowHtml).join(''):`<div class="small muted center cx-empty">${CHAT.err||(chatOn()&&!CHAT.t?'讀取中…':'還沒有人說話，來打聲招呼吧！')}</div>`}
function sheetChat(){const cd=Math.max(0,Math.ceil((CHAT.cd-Date.now())/1000)),canLv=smithLv()>=CHAT_LV||CLOUD.admin;
  const tb=(k,n,b,lk)=>`<button class="cx-tab ${CHAT.tab===k?'on':''} ${lk?'lk':''}" data-act="chattab" data-k="${k}">${n}${lk?img('ic_lock','cx-lk'):''}${b?`<i class="ui-badge badge">${b}</i>`:''}</button>`;
  return `<div class="sheet-head"><span class="cx-hb">${btn('好友'+(FR.d&&FR.d.in.length?`<i class="ui-badge badge">${FR.d.in.length}</i>`:''),'fropen',{cls:'btn-sec gd-hb'})}${btn('公會','gdopen',{cls:'btn-sec gd-hb'})}</span><h2>聊天</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
  <div class="cx-tabs">${tb('w','世界',0)}${tb('g','公會',CHAT.gunread,!gdIn())}${tb('s','系統',CHAT.sysUnread)}</div>
  <div class="cx-list" id="cxList">${chatListHtml()}</div>
  ${CHAT.tab==='w'||CHAT.tab==='g'&&gdIn()?(canLv?`<div class="cx-quick">${CHAT_QUICK.map(q=>`<button class="cx-q" data-act="chatq" data-k="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  <div class="cx-in"><button class="cx-wb ${CHAT.pick?'on':''}" data-act="chatpick" aria-label="分享武器">${CHAT.pick?'取消':'武器'}</button><input id="cxIn" type="text" maxlength="${CHAT_MAX}" autocomplete="off" enterkeyhint="send" placeholder="${CHAT.tab==='g'?'跟公會成員說…':'說點什麼…'}" value="${esc(CHAT.draft)}"><button class="ui-btn ui-btn--primary btn btn-primary cx-send" data-act="chatsend">送出</button></div>
  <div class="cx-note"><span id="cxCd">${cd?cd+' 秒後可以再發言':`最多 ${CHAT_MAX} 字`}</span><span>點名字可以看名片、檢舉、封鎖</span></div>`
  :`<div class="cx-note cx-lvneed">鐵匠等級 Lv.${CHAT_LV} 才能發言（目前 Lv.${smithLv()}），先去收復村莊吧！</div>`)
  :`<div class="cx-note">${CHAT.tab==='s'?'強化 +10 以上成功或爆裝，都會出現在這裡':''}</div>`}`}
// 只更新訊息列表（不重畫整個視窗，打字中的輸入框不會被清掉）
function chatPaint(toEnd){chatBarPaint();if(!chatOpen())return;const L=document.getElementById('cxList');if(!L)return;
  const near=L.scrollHeight-L.scrollTop-L.clientHeight<60;L.innerHTML=chatListHtml();if(near||toEnd)L.scrollTop=L.scrollHeight;
  if(CHAT.tab==='w')CHAT.unread=0;if(CHAT.tab==='g')CHAT.gunread=0}
function chatOpenSheet(tab){if(chatMock())chatMockInit();CHAT.tab=tab||'w';if(CHAT.tab==='w')CHAT.unread=0;if(CHAT.tab==='g')CHAT.gunread=0;if(CHAT.tab==='s')CHAT.sysUnread=0;ui.sheet={t:'chat'};render();if(Date.now()-FR.t>60000)frLoad(true);
  const L=document.getElementById('cxList');if(L)L.scrollTop=L.scrollHeight;if(chatOn())chatFetch(true)}
// 底部聊天條（v3.88 方案 A）：顯示世界頻道最新一則
const chatBarShow=()=>S.chatBar!==false&&(chatOn()||chatMock())&&!(typeof tutOn==='function'&&tutOn());
function chatBarPaint(){if(typeof document==='undefined')return;const el=document.getElementById('cbar');if(!el)return;const on=chatBarShow();document.body.classList.toggle('cbar-on',on);
  if(!on){if(el.innerHTML)el.innerHTML='';return}if(chatMock())chatMockInit();
  const x=[...CHAT.rows].reverse().find(r=>!chatBlocked(r.uid));
  const h=`<button class="cbar-in" data-act="chatopen"><span class="cbar-ch">世界</span><span class="cbar-tx">${x?`<b class="${x.mine?'me':''}">${x.mine?'我':esc(x.nick)}</b>：${esc(x.body)}`:'<span class="muted">世界頻道：來打聲招呼吧！</span>'}</span>${CHAT.unread?`<i class="ui-badge badge">${CHAT.unread>99?'99+':CHAT.unread}</i>`:''}</button>`;
  if(el.innerHTML!==h)el.innerHTML=h}
if(typeof window!=='undefined')setInterval(()=>{const c=document.getElementById('cxCd');if(!c)return;const s=Math.ceil((CHAT.cd-Date.now())/1000);c.textContent=s>0?s+' 秒後可以再發言':`最多 ${CHAT_MAX} 字`},500);
if(typeof document!=='undefined'){document.addEventListener('input',e=>{if(e.target&&e.target.id==='cxIn')CHAT.draft=e.target.value});
  document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='cxIn'&&e.key==='Enter'&&!e.isComposing){e.preventDefault();chatSend()}})}

/* 玩家名片：點聊天或排行榜的名字 */
const PC={u:null,n:'',m:null,d:null,err:'',busy:false,mine:[],arm:null};
async function pcOpen(u,n,m){PC.u=u;PC.n=n||'';PC.m=m||null;PC.d=null;PC.err='';PC.arm=null;pcShow();
  if(chatMock()||String(u).startsWith('mock')||u==='me'){const k=+String(u).slice(5)||0;PC.d=u==='me'?pcSelf():{uid:u,nick:n,lv:[18,9,22,25,14][k]||10,cleared:[8,3,10,12,6][k]||5,maxlv:[10,6,13,12,11][k]||8,likes:[12,1,30,44,5][k]||0,liked:false,left:3,me:false,w:{b:['dev_axe','dev_axe','dev_sword','dev_sword','dev_bow'][k]||'dev_axe',q:[2,0,3,3,2][k]||1,lv:[10,6,13,12,11][k]||8,traits:[],ench:[]}};if(PC.d.w&&!BP[PC.d.w.b])PC.d.w.b='dev_axe';if(u!=='me'){PC.d.fr=FR.d&&FR.d.f.some(x=>x.uid===u)?'friend':FR.d&&FR.d.in.some(x=>x.uid===u)?'got':FR.d&&FR.d.out.includes(u)?'sent':null;const gm=GD.d&&GD.d.g&&(GD.d.mem||[]).find(x=>x.uid===u);PC.d.guild=gm?GD.d.g.name:k===2||k===3?'霜狼鍛造會':null}if(PC.d.w)PC.d.w.p=power({...PC.d.w,b:bpId(PC.d.w.b)});return pcShow()}
  try{PC.d=await sbRest('rpc/pc_card',{method:'POST',body:JSON.stringify({p_uid:u})});if(!PC.d)PC.err='找不到這位玩家';else if(PC.d.me&&Array.isArray(PC.d.titles))PC.mine=PC.d.titles}catch(e){PC.err=chatSrvErr(e)}if(PC.u===u)pcShow()}
function pcSelf(){const best=[...S.weapons].filter(w=>!w.test).sort((a,b)=>power(b)-power(a))[0];return{uid:'me',nick:S.nick||'我',lv:smithLv(),cleared:cleared(),maxlv:S.weapons.reduce((a,w)=>w.test?a:Math.max(a,w.lv),0),likes:0,liked:false,left:3,me:true,guild:gdIn()?S.gd.name:null,title:titleOn(S.title)?S.title:null,titles:TITLES.filter(t=>titleLocal(t.k)).map(t=>t.k),w:best?{...best,p:power(best)}:null}}
function pcShow(){if(!ui.result||ui.result.k!=='pc'){ui.result={t:'info',k:'pc',icon:'ui_player_emblem',title:'',html:''}}const d=PC.d,blk=chatBlocked(PC.u);
  ui.result.title=esc(d?d.nick:PC.n||'玩家');
  if(!d){ui.result.html=`<div class="small muted center">${PC.err||'讀取中…'}</div>`;return render()}
  const w=d.w&&BP[bpId(d.w.b)]?d.w:null,b=w&&BP[bpId(w.b)];
  const T=TITLES.find(t=>t.k===d.title),has=d.me?(Array.isArray(d.titles)?d.titles:[]):[];
  ui.result.html=`<div class="pc-top">${T?`<span class="tt">${T.n}</span>`:''}<span class="small muted">鐵匠 Lv.${d.lv|0}</span>${d.me?'<span class="small t-gold">這是你</span>':''}${d.guild?`<span class="small muted">公會：${esc(d.guild)}</span>`:''}</div>
   <div class="pc-st"><div><b>${d.cleared|0}</b>收復村莊</div><div><b>+${d.maxlv|0}</b>最高強化</div><div><b>${fmt(d.likes|0)}</b>獲得的讚</div></div>
   <div class="small muted pc-lb">最強武器</div>${w?`<div class="pc-w">${wArt(b.id,{frame:fq(w)})}<div class="grow"><b class="${lc(w)}">${esc(b.n)} <span class="lvt">+${w.lv|0}</span></b><div class="small muted">攻擊力 ${fmt(w.p||power({...w,b:b.id}))}</div></div></div>`:'<div class="small muted">還沒有武器</div>'}
   ${d.me?`<div class="small muted pc-lb">稱號（點一下戴上，會顯示在聊天名字前面）</div><div class="pc-tts">${TITLES.map(t=>{const ok=has.includes(t.k)||titleLocal(t.k),on=S.title===t.k&&ok;return `<button class="pc-tt ${on?'on':''} ${ok?'':'lk'}" data-act="pctitle" data-k="${t.k}" ${ok?'':'disabled'}><b>${t.n}</b><span>${ok?(on?'戴著':'已解鎖'):t.d}</span></button>`}).join('')}</div>`:''}
   ${d.me?'':`<div class="pc-bt">${btn(d.liked?'今天已讚':`讚（今天剩 ${d.left|0} 次）`,'pclike',{cls:'btn-primary',dis:d.liked||!(d.left>0)})}${pcFrBtn(d)}${btn(blk?'解除封鎖':'封鎖','pcblock')}${PC.m?btn('檢舉這則訊息','pcreport',{cls:'btn-danger'}):''}</div>
   ${blk?'<div class="small muted center">已封鎖：聊天裡看不到他的訊息</div>':''}${pcSocialHtml(d)}`}
   ${CLOUD.admin&&!d.me?`<div class="label">管理員</div><div class="pc-adm">${btn('禁言 1 小時','pcmute',{attrs:'data-h="1"'})}${btn('禁言 1 天','pcmute',{attrs:'data-h="24"'})}${btn('永久禁言','pcmute',{attrs:'data-h="876000"',cls:'btn-danger'})}${btn('解除禁言','pcmute',{attrs:'data-h="0"'})}${PC.m?btn('刪除這則訊息','pchide',{cls:'btn-danger'}):''}</div>`:''}`;render()}
async function pcLike(){const d=PC.d;if(!d||d.liked)return;if(chatMock()||String(PC.u).startsWith('mock')){d.liked=true;d.likes++;d.left--;toast(`已幫 ${esc(d.nick)} 按讚`,'ok');return pcShow()}
  try{const r=await sbRest('rpc/pc_like',{method:'POST',body:JSON.stringify({p_uid:PC.u})});
    if(r==='ok'){d.liked=true;d.likes++;d.left=Math.max(0,d.left-1);snd('deliver');toast(`已幫 ${esc(d.nick)} 按讚`,'ok')}
    else toast({done:'今天已經讚過他了',max:'今天 3 次讚都用完了，明天再來',self:'不能讚自己'}[r]||'按讚失敗','bad')}catch(e){toast(chatSrvErr(e),'bad')}pcShow()}
function pcBlock(){const L=chatBlk(),i=L.findIndex(x=>x.u===PC.u);if(i>=0){L.splice(i,1);toast(`已解除封鎖 ${esc(PC.n)}`)}else{if(L.length>=50)L.shift();L.push({u:PC.u,n:PC.n});toast(`已封鎖 ${esc(PC.n)}，聊天裡不會再看到他的訊息`)}
  save();chatPaint();pcShow()}
async function pcReport(){if(!PC.m)return;if(chatMock()||String(PC.u).startsWith('mock')){toast('已檢舉（離線模擬）','ok');PC.m=null;return pcShow()}
  try{const r=await sbRest('rpc/chat_report',{method:'POST',body:JSON.stringify({p_id:+PC.m})});
    if(r==='hidden'){CHAT.rows=CHAT.rows.filter(x=>x.id!==+PC.m);CHAT.g=CHAT.g.filter(x=>x.id!==+PC.m);toast('已檢舉，這則訊息已隱藏','ok')}else if(r==='ok')toast('已檢舉，謝謝回報。3 位玩家檢舉同一則會自動隱藏','ok');else toast({self:'不能檢舉自己',gone:'這則訊息已經不在了',many:'今天檢舉次數太多了'}[r]||'檢舉失敗','bad');PC.m=null}
  catch(e){toast(chatSrvErr(e),'bad')}chatPaint();pcShow()}
async function pcAdmin(fn,arg){try{const r=await sbRest('rpc/'+fn,{method:'POST',body:JSON.stringify(arg)});toast(r==='ok'||r==='unmuted'?'完成':'失敗：'+esc(r),r==='ok'||r==='unmuted'?'ok':'bad');if(fn==='chat_hide'&&r==='ok'){CHAT.rows=CHAT.rows.filter(x=>x.id!==+PC.m);PC.m=null;chatPaint();pcShow()}}catch(e){toast(chatSrvErr(e),'bad')}}

/* v3.94 公會＋好友（13 SQL）：數值要和 SQL gd_lv／gd_gold／gd_boss／gd_cap、guild_donate、guild_shop 一致 */
const GD_LV=[0,1000,3000,6000,10000,16000,24000,35000,50000,70000],GD_GOLD=[0,2,2,4,4,4,6,6,8,8],GD_BOSS=[0,0,3,3,3,5,5,5,5,8];
const gdLvOf=x=>GD_LV.filter(t=>t<=(x||0)).length,gdCap=l=>l>=8?40:l>=5?30:20;
const GD_COST=50000,GD_MK_LV=5,GD_DAY=3,GD_CD_H=12,FR_MAX=30;
const GD_DON=[{k:'gold',n:'5,000 金幣',ic:'it_gold',c:5000,p:50},{k:'gems',n:'20 鑽石',ic:'it_gems',c:20,p:150}];
const GD_SHOP=[];   // v4.43 舊道具刪除：貢獻商店先空著，等新道具設計好再上架
const GD_PERK=[[2,'狩獵金幣 +2%'],[3,'首領傷害 +3%'],[4,'狩獵金幣 +4%'],[5,'成員上限 30'],[6,'首領傷害 +5%'],[7,'狩獵金幣 +6%'],[8,'成員上限 40'],[9,'狩獵金幣 +8%'],[10,'首領傷害 +8%']];
const GD_ROLE={lead:'會長',vice:'副會長'};
const GD_MSG={in:'你已經在公會裡了',lv:`鐵匠等級 Lv.${GD_MK_LV} 才能建立公會（加入公會要 Lv.${CHAT_LV}）`,lvj:`鐵匠等級 Lv.${CHAT_LV} 才能加入公會`,cd:`離開公會後 ${GD_CD_H} 小時內不能加入或建立公會`,name:'公會名稱要 2～8 個字，不能有空白、網址或不雅字',dup:'這個公會名稱已經有人用了',gold:`金幣不足：建立公會要 ${fmt(GD_COST)} 金幣`,
  gone:'找不到（可能已經解散或取消了）',full:'公會人數已滿',applied:'已送出申請，等會長或副會長同意',apps:'最多同時申請 5 個公會',none:'你不在公會裡',lead:'會長要先把會長轉讓給別人，才能離開公會',role:'只有會長或副會長可以這樣做',max:'次數已經用完了',lack:'材料不夠',pts:'個人貢獻不夠',len:'公告最多 40 個字',link:'公告不能有網址、電話或 LINE ID',login:'請先登入'};
const gdErr=(r,k)=>(k&&GD_MSG[k+r])||GD_MSG[r]||'操作失敗，請再試一次';
const GD={d:null,list:null,t:0,busy:false,err:'',tab:'mem',q:'',name:'',join:'open',mk:false,edit:false,note:'',noteJoin:'open',arm:null,mock:null};
const gdIn=()=>!!(S.gd&&S.gd.id);
const gdGold=()=>gdIn()?Math.min(GD_GOLD[9],Math.max(0,S.gd.gold|0)):0,gdBoss=()=>gdIn()?Math.min(GD_BOSS[9],Math.max(0,S.gd.boss|0)):0;   // 由伺服器 guild_mine 更新
const gdBal=k=>S[k]||0;
const gdOnline=t=>t&&Date.now()-Date.parse(t)<600000;
const gdApi=(fn,body)=>sbRest('rpc/'+fn,{method:'POST',body:JSON.stringify(body||{})});
// 伺服器扣款／發道具前先把存檔傳上去，回來之前暫停自動存檔（和交易所買武器一樣）
async function gdServer(fn,body,apply){if(!await mkSaved())return toast('雲端存檔還沒同步，請稍後再試','bad'),null;CLOUD.busy=true;let r;
  try{r=await gdApi(fn,body);if(r==='session'||(r&&r.r==='session')){CLOUD.busy=false;cloudKicked();return null}if(apply)apply(r)}catch(e){toast(chatSrvErr(e),'bad');return null}finally{CLOUD.busy=false}
  save();CLOUD.dirty=true;cloudPush(true);return r}
// 離線模擬（本機未登入時看畫面用）
function gdMockInit(){if(GD.mock)return;const t=Date.now(),ago=m=>new Date(t-m*60000).toISOString();
  GD.mock={g:null,role:'mem',me:{pts:230,don:GD_DAY,shop:{},cd:null,apps:[]},mem:[{uid:'mock-2',nick:'霜狼',lv:22,role:'lead',wk:1240,tot:5200,at:ago(5)},{uid:'mock-3',nick:'渡鴉',lv:25,role:'vice',wk:980,tot:4100,at:ago(1)},{uid:'mock-0',nick:'雷霆之錘',lv:18,role:'mem',wk:760,tot:2300,at:ago(120)},{uid:'mock-1',nick:'冰原少女',lv:9,role:'mem',wk:320,tot:900,at:ago(2)},{uid:'mock-4',nick:'北境小鐵',lv:14,role:'mem',wk:150,tot:400,at:ago(1500)}],
    apps:[{uid:'mock-9',nick:'雪原新手',lv:4,at:ago(30)}],list:[{id:1,name:'霜狼鍛造會',emb:'霜',lv:3,n:12,cap:20,join_mode:'open'},{id:2,name:'渡鴉之巢',emb:'渡',lv:5,n:28,cap:30,join_mode:'apply'},{id:3,name:'雷神鐵砧',emb:'雷',lv:1,n:4,cap:20,join_mode:'open'},{id:4,name:'世界樹守望',emb:'世',lv:2,n:20,cap:20,join_mode:'open'}]}}
function gdMockD(){const m=GD.mock,g=m.g;if(!g)return{g:null,me:m.me};const lv=gdLvOf(g.exp),me={uid:'me',nick:S.nick||'我',lv:smithLv(),role:m.role,wk:m.wk||0,tot:m.wk||0,at:new Date().toISOString()};
  return{g:{...g,lv,gold:GD_GOLD[lv-1],boss:GD_BOSS[lv-1],cap:gdCap(lv),n:m.mem.length+1,rank:2,wk:m.mem.reduce((a,x)=>a+x.wk,0)+(m.wk||0)},role:m.role,me:m.me,mem:[...m.mem.filter(x=>x.role!=='mem'),me,...m.mem.filter(x=>x.role==='mem')].sort((a,b)=>(a.role==='lead'?0:a.role==='vice'?1:2)-(b.role==='lead'?0:b.role==='vice'?1:2)||b.wk-a.wk),apps:m.role==='mem'?[]:m.apps}}
function gdSync(){const g=GD.d&&GD.d.g;const v=g?{id:g.id,name:g.name,emb:g.emb,lv:g.lv,gold:g.gold|0,boss:g.boss|0}:null;if(JSON.stringify(v)!==JSON.stringify(S.gd||null)){S.gd=v;save();CLOUD.dirty=true}}
async function gdLoad(quiet){if(GD.busy)return;if(chatMock()){gdMockInit();GD.d=gdMockD();if(!GD.d.g)GD.list=GD.mock.list.filter(x=>!GD.q||x.name.includes(GD.q)).map(x=>({...x,applied:GD.mock.me.apps.includes(x.id)}));gdSync();GD.t=Date.now();if(!quiet)render();return}
  if(!chatOn())return;GD.busy=true;
  try{GD.d=await gdApi('guild_mine');if(!GD.d.g)GD.list=await gdApi('guild_list',{p_q:GD.q||null});GD.err='';gdSync()}catch(e){GD.err=chatSrvErr(e)}finally{GD.busy=false;GD.t=Date.now()}
  if(!quiet&&ui.sheet&&(ui.sheet.t==='gd'||ui.sheet.t==='chat'))render()}
if(typeof window!=='undefined')setInterval(()=>{if(chatOn()&&!document.hidden&&Date.now()-GD.t>(ui.sheet&&ui.sheet.t==='gd'?20000:300000))gdLoad(!(ui.sheet&&ui.sheet.t==='gd'))},5000);
function gdOpen(tab){if(tab)GD.tab=tab;GD.arm=null;ui.sheet={t:'gd',k:GD.tab};render();gdLoad()}
// ---- 動作 ----
async function gdCreate(){const nm=String(GD.name||'').trim(),n=Array.from(nm).length;
  if(smithLv()<GD_MK_LV&&!CLOUD.admin)return toast(GD_MSG.lv,'bad');if(n<2||n>8||/\s/.test(nm)||chatPre(nm))return toast(GD_MSG.name,'bad');if(S.gold<GD_COST)return toast(GD_MSG.gold,'bad');
  if(chatMock()){gdMockInit();S.gold-=GD_COST;GD.mock.g={id:9,name:nm,emb:Array.from(nm)[0],notice:'',join:GD.join,exp:0};GD.mock.role='lead';GD.mock.mem=GD.mock.mem.slice(0,0);GD.mock.wk=0}
  else{const r=await gdServer('guild_create',{p_sid:SID,p_name:nm,p_join:GD.join},r=>{if(r==='ok')S.gold=Math.max(0,S.gold-GD_COST)});if(r==null)return;if(r!=='ok')return toast(gdErr(r),'bad')}
  GD.mk=false;GD.name='';GD.tab='mem';snd('unlock');toast(`公會「${esc(nm)}」建立完成！`,'ok');await gdLoad()}
async function gdJoin(id){if(chatMock()){gdMockInit();const x=GD.mock.list.find(y=>y.id===id);if(!x)return;if(GD.mock.me.cd&&Date.parse(GD.mock.me.cd)>Date.now())return toast(GD_MSG.cd,'bad');if(x.n>=x.cap)return toast(GD_MSG.full,'bad');
    if(x.join_mode==='apply'){if(!GD.mock.me.apps.includes(id))GD.mock.me.apps.push(id);toast(GD_MSG.applied,'ok')}else{GD.mock.g={id:x.id,name:x.name,emb:x.emb,notice:'每週日晚上一起衝首領，記得捐獻！',join:'open',exp:GD_LV[x.lv-1]+400};GD.mock.role='mem';snd('unlock');toast(`已加入「${esc(x.name)}」`,'ok')}return gdLoad()}
  try{const r=await gdApi('guild_join',{p_sid:SID,p_gid:id});if(r==='session')return cloudKicked();if(r==='ok'){snd('unlock');toast('已加入公會！','ok')}else toast(gdErr(r,r==='lv'?'':''),r==='applied'?'ok':'bad')}catch(e){toast(chatSrvErr(e),'bad')}gdLoad()}
async function gdUnapply(id){if(chatMock()){GD.mock.me.apps=GD.mock.me.apps.filter(x=>x!==id)}else{try{await gdApi('guild_unapply',{p_gid:id})}catch(e){return toast(chatSrvErr(e),'bad')}}toast('已取消申請');gdLoad()}
async function gdLeave(){if(GD.arm!=='leave'){GD.arm='leave';render();return toast(GD.d&&GD.d.role==='lead'&&GD.d.g&&GD.d.g.n<=1?'再按一次：你是最後一個人，公會會解散':`再按一次確認離開（${GD_CD_H} 小時內不能加入別的公會）`)}GD.arm=null;
  if(chatMock()){if(GD.mock.role==='lead'&&GD.mock.mem.length)return toast(GD_MSG.lead,'bad');GD.mock.g=null;GD.mock.me.cd=new Date(Date.now()+GD_CD_H*3600e3).toISOString();CHAT.g=[];toast('已離開公會');return gdLoad()}
  try{const r=await gdApi('guild_leave',{p_sid:SID});if(r==='session')return cloudKicked();if(r==='ok'||r==='disband'){CHAT.g=[];CHAT.glast=0;toast(r==='disband'?'公會已解散':'已離開公會')}else toast(gdErr(r),'bad')}catch(e){toast(chatSrvErr(e),'bad')}gdLoad()}
async function gdSet(){const nt=String(GD.note||'').replace(/\s+/g,' ').trim();if(Array.from(nt).length>40)return toast(GD_MSG.len,'bad');if(nt&&chatPre(nt))return toast(GD_MSG.link,'bad');
  if(chatMock()){GD.mock.g.notice=nt;GD.mock.g.join=GD.noteJoin}else{try{const r=await gdApi('guild_set',{p_sid:SID,p_notice:nt,p_join:GD.noteJoin});if(r==='session')return cloudKicked();if(r!=='ok')return toast(gdErr(r),'bad')}catch(e){return toast(chatSrvErr(e),'bad')}}
  GD.edit=false;toast('公會設定已儲存','ok');gdLoad()}
async function gdAppAns(uid,ok){if(chatMock()){const a=GD.mock.apps.find(x=>x.uid===uid);GD.mock.apps=GD.mock.apps.filter(x=>x.uid!==uid);if(ok&&a)GD.mock.mem.push({...a,role:'mem',wk:0,tot:0,at:new Date().toISOString()});toast(ok?'已同意入會':'已拒絕');return gdLoad()}
  try{const r=await gdApi('guild_app_ans',{p_sid:SID,p_uid:uid,p_ok:!!ok});if(r==='session')return cloudKicked();if(r==='ok')toast('已同意入會','ok');else if(r==='no')toast('已拒絕');else toast(r==='in'?'他已經加入別的公會了':gdErr(r),'bad')}catch(e){toast(chatSrvErr(e),'bad')}gdLoad()}
async function gdMemAct(uid,act){const nm=(GD.d&&(GD.d.mem||[]).find(x=>x.uid===uid)||{}).nick||'';const k=act+uid;
  if((act==='kick'||act==='lead')&&PC.arm!==k){PC.arm=k;pcShow();return toast(act==='kick'?`再按一次把 ${esc(nm)} 踢出公會`:`再按一次把會長轉讓給 ${esc(nm)}（你會變成副會長）`)}PC.arm=null;
  if(chatMock()){const m=GD.mock,x=m.mem.find(y=>y.uid===uid);if(!x)return;if(act==='kick')m.mem=m.mem.filter(y=>y!==x);else if(act==='vice')x.role='vice';else if(act==='unvice')x.role='mem';else if(act==='lead'){m.mem.forEach(y=>{if(y.role==='lead')y.role='mem'});x.role='lead';m.role='vice'}}
  else{try{const r=await gdApi('guild_mem_act',{p_sid:SID,p_uid:uid,p_act:act});if(r==='session')return cloudKicked();if(r!=='ok'){toast(r==='max'?'副會長最多 2 位':gdErr(r),'bad');return pcShow()}}catch(e){toast(chatSrvErr(e),'bad');return pcShow()}}
  toast({kick:`已把 ${esc(nm)} 踢出公會`,vice:`${esc(nm)} 升為副會長`,unvice:`已取消 ${esc(nm)} 的副會長`,lead:`會長已轉讓給 ${esc(nm)}`}[act]||'完成','ok');await gdLoad(true);if(act==='kick')ui.result=null;else pcShow();render()}
async function gdDonate(k){const x=GD_DON.find(y=>y.k===k),me=GD.d&&GD.d.me;if(!x||!me)return;if(me.don<=0)return toast(`今天 ${GD_DAY} 次捐獻都用完了，明天再來`,'bad');if(gdBal(k)<x.c)return toast(`${x.n.replace(/^\d[\d,]* ?個?/,'')}不夠`,'bad');
  const pay=()=>{S[k]-=x.c};let up=false;
  if(chatMock()){pay();const g=GD.mock.g,l0=gdLvOf(g.exp);g.exp+=x.p;up=gdLvOf(g.exp)>l0;GD.mock.me.don--;GD.mock.me.pts+=x.p;GD.mock.wk=(GD.mock.wk||0)+x.p}
  else{const r=await gdServer('guild_donate',{p_sid:SID,p_kind:k},r=>{if(r&&r.r==='ok')pay()});if(r==null)return;if(r.r!=='ok')return toast(r.r==='max'?`今天 ${GD_DAY} 次捐獻都用完了，明天再來`:r.r==='lack'?'雲端存檔的數量不夠，請稍後再試':gdErr(r.r),'bad');up=!!r.up}
  snd(up?'unlock':'deliver');toast(`捐獻 ${x.n}：公會經驗 +${x.p}、個人貢獻 +${x.p}`,'ok');await gdLoad(true);if(up&&GD.d&&GD.d.g)toast(`公會升到 Lv.${GD.d.g.lv}！`,'ok');render()}
async function gdShop(k){const x=GD_SHOP.find(y=>y.k===k),me=GD.d&&GD.d.me;if(!x||!me)return;const n=(me.shop&&me.shop[k])|0;if(n>=x.lim)return toast('這週這個道具已經換完了','bad');if((me.pts|0)<x.p)return toast(GD_MSG.pts,'bad');
  const give=()=>{S.items[k]=(S.items[k]||0)+x.x};
  if(chatMock()){give();me.pts-=x.p;me.shop={...me.shop,[k]:n+1}}
  else{const r=await gdServer('guild_shop',{p_sid:SID,p_item:k},r=>{if(r==='ok')give()});if(r==null)return;if(r!=='ok')return toast(r==='max'?'這週這個道具已經換完了':gdErr(r),'bad')}
  snd('deliver');toast(`兌換 ${x.n} ×${x.x}`,'ok');await gdLoad(true);render()}
// ---- 畫面 ----
const gdEmb=(e,c='')=>`<div class="gd-emb ${c}">${esc(Array.from(String(e||'？'))[0]||'？')}</div>`;
function gdListHtml(){const me=GD.d.me||{},cd=me.cd&&Date.parse(me.cd)>Date.now();
  if(GD.mk)return `<div class="gd-mk"><div class="label">建立公會</div>
    <input id="gdName" class="gx-in" type="text" maxlength="8" autocomplete="off" placeholder="公會名稱（2～8 個字）" value="${esc(GD.name)}">
    <div class="gd-jm"><button class="${GD.join==='open'?'on':''}" data-act="gdjm" data-k="open"><b>自由加入</b><span>按加入就進來</span></button><button class="${GD.join==='apply'?'on':''}" data-act="gdjm" data-k="apply"><b>需要審核</b><span>會長／副會長同意</span></button></div>
    <div class="small muted">徽章會用名稱的第一個字。需要鐵匠 Lv.${GD_MK_LV}（目前 Lv.${smithLv()}）、${fmt(GD_COST)} 金幣（目前 ${fmt(S.gold)}）。</div>
    <div class="gd-act">${btn('建立公會','gdmk2',{cls:'btn-primary',dis:S.gold<GD_COST})}${btn('取消','gdmk0')}</div></div>`;
  const L=GD.list;
  return `<div class="small muted">你還沒有加入公會。加入後可以跟會員聊天、一起捐獻升級，拿狩獵金幣和首領傷害加成。</div>
   ${cd?`<div class="gd-cd small t-danger">剛離開公會：${new Date(me.cd).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})} 之後才能加入或建立公會</div>`:''}
   <div class="gd-search"><input id="gdQ" class="gx-in" type="search" maxlength="8" autocomplete="off" enterkeyhint="search" placeholder="搜尋公會名稱" value="${esc(GD.q)}"><button data-act="gdfind">搜尋</button></div>
   ${!L?'<div class="small muted center">讀取中…</div>':L.length?L.map(x=>{const full=x.n>=x.cap,ap=x.applied;
     return `<div class="gd-l">${gdEmb(x.emb)}<div class="grow"><b>${esc(x.name)}</b><span class="small muted">Lv.${x.lv}・${x.n}／${x.cap} 人・${x.join_mode==='apply'?'需要審核':'自由加入'}</span></div>${ap?`<button class="off" data-act="gdunap" data-id="${+x.id}">取消申請</button>`:full?'<button class="off" disabled>已滿</button>':`<button data-act="gdjoin" data-id="${+x.id}">${x.join_mode==='apply'?'申請':'加入'}</button>`}</div>`}).join(''):`<div class="small muted center cx-empty">${GD.q?'找不到這個名稱的公會':'還沒有任何公會，來建立第一個吧！'}</div>`}
   <button class="gd-create" data-act="gdmk">建立公會（${fmt(GD_COST)} 金幣）</button>`}
function gdHomeHtml(){const d=GD.d,g=d.g,me=d.me||{},lv=g.lv,nx=GD_LV[lv],off=d.role==='lead'||d.role==='vice',lead=(d.mem||[]).find(x=>x.role==='lead');
  const tb=(k,n,b)=>`<button class="${GD.tab===k?'on':''}" data-act="gdtab" data-k="${k}">${n}${b?`<i class="ui-badge badge">${b}</i>`:''}</button>`;
  const head=`<div class="gd-head">${gdEmb(g.emb)}<div class="grow"><h3>${esc(g.name)}</h3><span class="small muted">公會 Lv.${lv}・成員 ${g.n}／${g.cap}・排名 #${g.rank}</span><span class="small muted">會長：${esc(lead?lead.nick:'—')}${g.join==='apply'?'・需要審核':'・自由加入'}</span></div></div>`;
  if(GD.edit)return head+`<div class="gd-mk"><div class="label">公會公告（最多 40 字）</div><input id="gdNote" class="gx-in" type="text" maxlength="40" autocomplete="off" placeholder="例如：每週日晚上一起衝首領" value="${esc(GD.note)}">
    <div class="label">入會方式</div><div class="gd-jm"><button class="${GD.noteJoin==='open'?'on':''}" data-act="gdnj" data-k="open"><b>自由加入</b><span>按加入就進來</span></button><button class="${GD.noteJoin==='apply'?'on':''}" data-act="gdnj" data-k="apply"><b>需要審核</b><span>會長／副會長同意</span></button></div>
    <div class="gd-act">${btn('儲存','gdset',{cls:'btn-primary'})}${btn('取消','gded0')}</div></div>`;
  let body='';
  if(GD.tab==='don'){body=`<div class="small muted">每天可以捐 ${GD_DAY} 次（今天剩 <b class="t-gold">${me.don|0}</b> 次），捐獻會變成公會經驗和你的個人貢獻。</div>`+GD_DON.map(x=>{const lack=gdBal(x.k)<x.c;
      return `<div class="gd-l">${img(x.ic,'gd-ic')}<div class="grow"><b>捐 ${x.n}</b><span class="small ${lack?'t-danger':'muted'}">${lack?`不夠（目前 ${fmt(gdBal(x.k))}）`:`公會經驗、個人貢獻各 +${x.p}`}</span></div><button data-act="gddon" data-k="${x.k}" ${lack||!(me.don>0)?'class="off"':''}>捐獻</button></div>`}).join('')
     +`<div class="label">公會等級加成</div><div class="gd-don">${GD_PERK.map(([l,t])=>`<div class="${lv>=l?'on':''}"><b>Lv.${l}</b>${t}</div>`).join('')}</div>`}
  else if(GD.tab==='shop'){body=`<div class="gd-pts"><span>個人貢獻</span><b>${fmt(me.pts|0)}</b><span class="small muted">離開公會也會保留・每週日 00:00 重置兌換次數</span></div>`+GD_SHOP.map(x=>{const n=(me.shop&&me.shop[x.k])|0,left=x.lim-n,can=left>0&&(me.pts|0)>=x.p;
      return `<div class="gd-l">${img(x.ic,'gd-ic')}<div class="grow"><b>${x.n} ×${x.x}</b><span class="small muted">${x.p} 點・這週剩 ${left}／${x.lim}</span></div><button data-act="gdshop" data-k="${x.k}" ${can?'':'class="off"'}>${left>0?'兌換':'換完了'}</button></div>`}).join('')}
  else{const apps=off?(d.apps||[]):[];
    body=(apps.length?`<div class="label">入會申請 ${apps.length}</div>`+apps.map(a=>`<div class="gd-l gd-ap"><div class="grow"><button class="who" data-act="pcard" data-u="${esc(a.uid)}" data-n="${esc(a.nick)}">${esc(a.nick)}</button><span class="small muted">Lv${a.lv|0}・${chatAgo(a.at)}申請</span></div><button data-act="gdapp" data-u="${esc(a.uid)}" data-k="1">同意</button><button class="off" data-act="gdapp" data-u="${esc(a.uid)}" data-k="0">拒絕</button></div>`).join('')+'<div class="label">成員</div>':'')
     +(d.mem||[]).map(x=>{const mine=x.uid==='me'||!!(AUTH&&x.uid===AUTH.user.id);
      return `<div class="gd-m"><i class="${gdOnline(x.at)?'on':'off'}"></i><div class="grow">${GD_ROLE[x.role]?`<b class="r">${GD_ROLE[x.role]}</b>`:''}<button class="who ${mine?'me':''}" data-act="pcard" data-u="${esc(mine?'me':x.uid)}" data-n="${esc(x.nick)}">${mine?'我':esc(x.nick)}</button><span class="small muted">Lv${x.lv|0}・${gdOnline(x.at)?'在線上':chatAgo(x.at)}</span></div><span class="v">${fmt(x.wk|0)}<span>本週貢獻</span></span></div>`}).join('')
     +`<div class="gd-act">${btn('捐獻','gdtab',{cls:'btn-primary',attrs:'data-k="don"'})}${btn(GD.arm==='leave'?'再按一次確認':d.role==='lead'&&g.n>1?'離開（要先轉讓會長）':'離開公會','gdleave',{cls:GD.arm==='leave'?'btn-danger':'btn-sec'})}</div>`}
  return head+`<div class="gd-note">${g.notice?'公告：'+esc(g.notice):'<span class="muted">'+(off?'還沒有公告，點右上角「設定」寫一則吧':'會長還沒寫公告')+'</span>'}</div>
   <div class="gd-row"><span>公會經驗 ${fmt(g.exp)}${nx?'／'+fmt(nx):''}</span><span>${nx?`升到 Lv.${lv+1} 還差 ${fmt(nx-g.exp)}`:'已經是最高等級'}</span></div><div class="gd-bar"><i style="width:${nx?Math.min(100,Math.round((g.exp-GD_LV[lv-1])/(nx-GD_LV[lv-1])*100)):100}%"></i></div>
   <div class="gd-buff">${g.gold||g.boss?`${g.gold?`<span>狩獵金幣 +${g.gold}%</span>`:''}${g.boss?`<span>首領傷害 +${g.boss}%</span>`:''}`:'<span class="off">Lv.2 開始有加成</span>'}</div>
   <div class="gd-tabs">${tb('mem','成員',off?(d.apps||[]).length:0)}${tb('don','捐獻',me.don>0?me.don:0)}${tb('shop','商店')}<button data-act="gdchat">聊天${CHAT.gunread?`<i class="ui-badge badge">${CHAT.gunread}</i>`:''}</button></div>`+body}
function sheetGuild(){const d=GD.d,off=d&&d.g&&(d.role==='lead'||d.role==='vice');
  return `<div class="sheet-head">${off&&!GD.edit?btn('設定','gded',{cls:'btn-sec gd-hb'}):'<span style="width:44px"></span>'}<h2>鐵匠公會</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
  ${!d?`<div class="small muted center cx-empty">${GD.err||(chatOn()||chatMock()?'讀取中…':'請先登入')}</div>`:d.g?gdHomeHtml():gdListHtml()}`}

/* 好友（不送禮） */
const FR={d:null,find:null,q:'',tab:'f',t:0,busy:false,err:''};
const FR_MOCK=()=>({f:[{uid:'mock-2',nick:'霜狼',lv:22,at:new Date(Date.now()-60000).toISOString(),g:'霜狼鍛造會'},{uid:'mock-3',nick:'渡鴉',lv:25,at:new Date(Date.now()-300000).toISOString(),g:null},{uid:'mock-1',nick:'冰原少女',lv:9,at:new Date(Date.now()-3600e3).toISOString(),g:'霜狼鍛造會'},{uid:'mock-0',nick:'雷霆之錘',lv:18,at:new Date(Date.now()-3*86400e3).toISOString(),g:null}],in:[{uid:'mock-4',nick:'北境小鐵',lv:14,at:new Date(Date.now()-7200e3).toISOString()},{uid:'mock-9',nick:'雪原新手',lv:4,at:new Date(Date.now()-600e3).toISOString()}],out:[]});
async function frLoad(quiet){if(chatMock()){if(!FR.d)FR.d=FR_MOCK();FR.t=Date.now();if(!quiet)render();return}if(!chatOn()||FR.busy)return;FR.busy=true;
  try{FR.d=await gdApi('friend_list');FR.err=''}catch(e){FR.err=chatSrvErr(e)}finally{FR.busy=false;FR.t=Date.now()}if(!quiet||(ui.sheet&&(ui.sheet.t==='fr'||ui.sheet.t==='chat')))render()}
function frOpen(tab){if(tab)FR.tab=tab;ui.sheet={t:'fr',k:FR.tab};render();frLoad()}
const FR_MSG={self:'不能加自己',gone:'找不到這位玩家',already:'你們已經是好友了',full:`好友最多 ${FR_MAX} 位`,full2:'對方的好友已經滿了',many:'今天送出的好友申請太多了，明天再試',sent:'已送出好友申請',ok:'你們成為好友了！',no:'已拒絕',login:'請先登入'};
async function frAct(fn,uid,arg){if(chatMock()){if(!FR.d)FR.d=FR_MOCK();const L=FR.d;let r='ok';
    if(fn==='friend_add'){if(L.f.some(x=>x.uid===uid))r='already';else{const i=L.in.findIndex(x=>x.uid===uid);if(i>=0){L.f.unshift({...L.in[i],at:new Date().toISOString()});L.in.splice(i,1)}else{r='sent';L.out.push(uid)}}}
    else if(fn==='friend_ans'){const i=L.in.findIndex(x=>x.uid===uid);if(i<0)r='gone';else{if(arg)L.f.unshift({...L.in[i],at:new Date().toISOString()});else r='no';L.in.splice(i,1)}}
    else if(fn==='friend_del')L.f=L.f.filter(x=>x.uid!==uid);
    if(FR.find)FR.find.forEach(x=>{if(x.uid===uid)x.fr=r==='sent'?'sent':r==='ok'&&fn!=='friend_del'?'friend':x.fr});return r}
  try{return await gdApi(fn,fn==='friend_ans'?{p_uid:uid,p_ok:!!arg}:{p_uid:uid})}catch(e){toast(chatSrvErr(e),'bad');return null}}
async function frAdd(uid){const r=await frAct('friend_add',uid);if(r==null)return;toast(fn2txt(r,'friend_add'),r==='ok'||r==='sent'?'ok':'bad');if(r==='ok')snd('unlock');if(PC.d&&PC.u===uid){PC.d.fr=r==='ok'||r==='already'?'friend':r==='sent'?'sent':PC.d.fr;pcShow()}if(FR.find)FR.find.forEach(x=>{if(x.uid===uid)x.fr=r==='ok'||r==='already'?'friend':r==='sent'?'sent':x.fr});frLoad(true)}
const fn2txt=(r,fn)=>r==='ok'&&fn==='friend_del'?'已刪除好友':FR_MSG[r]||'操作失敗，請再試一次';
async function frAns(uid,ok){const r=await frAct('friend_ans',uid,ok);if(r==null)return;toast(fn2txt(r),r==='ok'?'ok':r==='no'?'':'bad');if(r==='ok')snd('unlock');if(PC.d&&PC.u===uid){PC.d.fr=r==='ok'?'friend':null;pcShow()}frLoad()}
async function frDel(uid){if(PC.arm!=='fdel'+uid){PC.arm='fdel'+uid;pcShow();return toast('再按一次確認刪除好友')}PC.arm=null;const r=await frAct('friend_del',uid);if(r==null)return;toast('已刪除好友');if(PC.d&&PC.u===uid){PC.d.fr=null;pcShow()}frLoad(true)}
async function frFind(){const q=String(FR.q||'').trim();if(!q)return toast('請輸入暱稱','bad');
  if(chatMock()){FR.find=[{uid:'mock-7',nick:q+'鐵匠',lv:7,fr:null},{uid:'mock-2',nick:'霜狼',lv:22,fr:'friend'}];return render()}
  try{FR.find=await gdApi('friend_find',{p_nick:q})}catch(e){return toast(chatSrvErr(e),'bad')}render()}
function sheetFriend(){const d=FR.d,inN=d?d.in.length:0;
  const tb=(k,n,b)=>`<button class="${FR.tab===k?'on':''}" data-act="frtab" data-k="${k}">${n}${b?`<i class="ui-badge badge">${b}</i>`:''}</button>`;
  const who=x=>`<button class="who" data-act="pcard" data-u="${esc(x.uid)}" data-n="${esc(x.nick)}">${esc(x.nick)}</button>`;
  let body='';
  if(!d)body=`<div class="small muted center cx-empty">${FR.err||(chatOn()||chatMock()?'讀取中…':'請先登入')}</div>`;
  else if(FR.tab==='in')body=d.in.length?d.in.map(x=>`<div class="gd-l gd-ap"><div class="grow">${who(x)}<span class="small muted">Lv${x.lv|0}・${chatAgo(x.at)}申請</span></div><button data-act="frans" data-u="${esc(x.uid)}" data-k="1">同意</button><button class="off" data-act="frans" data-u="${esc(x.uid)}" data-k="0">拒絕</button></div>`).join(''):'<div class="small muted center cx-empty">沒有新的好友申請</div>';
  else if(FR.tab==='find')body=`<div class="gd-search"><input id="frQ" class="gx-in" type="search" maxlength="8" autocomplete="off" enterkeyhint="search" placeholder="輸入暱稱（開頭幾個字也可以）" value="${esc(FR.q)}"><button data-act="frfind">搜尋</button></div>`
    +(FR.find?FR.find.length?FR.find.map(x=>`<div class="gd-l"><div class="grow">${who(x)}<span class="small muted">Lv${x.lv|0}</span></div>${x.fr==='friend'?'<button class="off" disabled>已是好友</button>':x.fr==='sent'?'<button class="off" disabled>已申請</button>':x.fr==='got'?`<button data-act="frans" data-u="${esc(x.uid)}" data-k="1">同意</button>`:`<button data-act="fradd" data-u="${esc(x.uid)}">加好友</button>`}</div>`).join(''):'<div class="small muted center cx-empty">找不到這個暱稱</div>':'<div class="small muted center">也可以在聊天點別人的名字，從名片加好友</div>');
  else body=d.f.length?d.f.map(x=>`<div class="gd-l"><i class="gdot ${gdOnline(x.at)?'on':'off'}"></i><div class="grow">${who(x)}<span class="small muted">Lv${x.lv|0}・${gdOnline(x.at)?'在線上':chatAgo(x.at).replace('剛剛','剛剛')+'上線'}${x.g?'・'+esc(x.g):''}</span></div><button class="off" data-act="pcard" data-u="${esc(x.uid)}" data-n="${esc(x.nick)}">名片</button></div>`).join('')+`<div class="small muted center gd-ft">點名字可以看名片、刪除好友</div>`
    :'<div class="small muted center cx-empty">還沒有好友。<br>在聊天點別人的名字，名片上就能加好友</div>';
  return `<div class="sheet-head"><span style="width:44px"></span><h2>好友</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
  <div class="gd-tabs">${tb('f',`好友 ${d?d.f.length:0}／${FR_MAX}`)}${tb('in','申請',inN)}${tb('find','搜尋')}</div>${body}`}
if(typeof document!=='undefined'){document.addEventListener('input',e=>{const t=e.target;if(!t||!t.id)return;if(t.id==='gdQ')GD.q=t.value;else if(t.id==='gdName')GD.name=t.value;else if(t.id==='gdNote')GD.note=t.value;else if(t.id==='frQ')FR.q=t.value});
  document.addEventListener('keydown',e=>{const t=e.target;if(!t||e.key!=='Enter'||e.isComposing)return;if(t.id==='gdQ'){e.preventDefault();GD.list=null;gdLoad()}else if(t.id==='frQ'){e.preventDefault();frFind()}})}
function pcFrBtn(d){const u=PC.u,fr=d.fr,arm=PC.arm,ua=`data-u="${esc(u)}"`;
  return fr==='friend'?btn(arm==='fdel'+u?'再按一次刪除':'刪除好友','frdel',{cls:arm==='fdel'+u?'btn-danger':'btn-sec',attrs:ua}):fr==='sent'?btn('已申請好友','fradd',{dis:true}):fr==='got'?btn('同意好友','frans',{cls:'btn-primary',attrs:ua+' data-k="1"'}):btn('加好友','fradd',{cls:'btn-primary',attrs:ua})}
function pcSocialHtml(d){const u=PC.u,arm=PC.arm,ua=`data-u="${esc(u)}"`;
  const gm=GD.d&&GD.d.g&&(GD.d.mem||[]).find(x=>x.uid===u),my=GD.d&&GD.d.role;let ga='';
  if(gm&&(my==='lead'||(my==='vice'&&gm.role==='mem'))){const k=a=>btn(arm===a+u?'再按一次確認':{kick:'踢出公會',vice:'升副會長',unvice:'取消副會長',lead:'轉讓會長'}[a],'gdmem',{cls:a==='kick'||arm===a+u?'btn-danger':'btn-sec',attrs:ua+` data-k="${a}"`});
    ga=`<div class="label">公會管理（${esc(gm.nick)} 是${GD_ROLE[gm.role]||'成員'}）</div><div class="pc-adm">${my==='lead'?(gm.role==='vice'?k('unvice'):k('vice'))+k('lead'):''}${k('kick')}</div>`}
  return ga}
const NICK_OK=n=>{const c=Array.from(n);return c.length<2?'暱稱至少 2 個字':c.length>8?'暱稱最多 8 個字':/^[\p{L}\p{N}_]+$/u.test(n)?'':'暱稱只能用中文、英文、數字或底線'};
async function cloudSetNick(n){const old=S.nick;S.nick=n;
  try{const r=await sbRest('rpc/save_game',{method:'POST',body:JSON.stringify({p_sid:SID,p_data:S,p_nick:n})});if(typeof r==='string'&&r.startsWith('cheat')){S.nick=old;cloudCheat(r);throw new Error('存檔資料異常')}save();CLOUD.dirty=false;CLOUD.last=Date.now()}
  catch(e){S.nick=old;if(/session/i.test(e.message)){cloudKicked();throw new Error('這個帳號已經在其他手機登入')}throw e}}
// 取暱稱畫面（註冊後、或之前沒取過暱稱時出現；頭像→鐵匠等級可改名）
function showName(first,preview){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-name';
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key2_bg')}" alt=""><img class="gt-ly gt-glow" src="${LG('key2_glow')}" alt=""><div class="gt-fog"></div><div class="gt-embers">${gEmb(10)}</div><div class="gt-vig"></div></div>
   <img class="gt-logo" src="${LG('logo2')}" alt="諸神鐵匠">
   <form class="gt-box" onsubmit="return false"><div class="gt-ttl">${first?'為你的鐵匠取個名字':'修改暱稱'}</div>
    <input id="gtNick" type="text" maxlength="16" autocomplete="off" placeholder="2～8 個字，不能和別人重複" value="${first?'':(S.nick||'')}">
    <div class="gt-msg small"></div>
    <div class="gt-row"><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gn="ok">確定</button>${first?'':'<button type="button" class="ui-btn ui-btn--secondary btn btn-sec big" data-gn="cancel">取消</button>'}</div></form>`;
  const msg=g.querySelector('.gt-msg'),say=(t,bad)=>{msg.textContent=t;msg.className='gt-msg small'+(bad?' bad':'')};
  g.onclick=e=>{const b=e.target.closest('[data-gn]');if(!b)return;snd('ui_click');
    if(b.dataset.gn==='cancel'){gateClose();return}
    const n=(g.querySelector('#gtNick').value||'').trim(),bad=NICK_OK(n);if(bad)return say(bad,1);if(n===S.nick){gateClose();return}
    if(preview){if(n==='冰脊'||n==='測試重複')return say('這個暱稱已經有人用了，換一個吧（預覽：模擬重複）',1);toast(`（預覽）歡迎，${n}！實際登入時會存到雲端`,'ok');showStory();return}
    if(g.dataset.busy)return;g.dataset.busy='1';b.disabled=true;say('確認中…');
    cloudSetNick(n).then(()=>{if(AUTH)sbRest('rpc/lb_rename',{method:'POST',body:JSON.stringify({p_nick:n})}).then(()=>lbFetch(true)).catch(()=>{});toast(first?`歡迎，${n}！`:`暱稱已改為「${n}」`,'ok');render();if(first&&!S.introSeen)showStory();else gateClose()})
      .catch(e=>say(SB_ERR(e.message),1)).finally(()=>{delete g.dataset.busy;b.disabled=false})}}
function afterAuthEnter(){if(MAINT&&!CLOUD.admin){adminCheck().then(a=>{if(a)return afterAuthEnter();CLOUD.ready=false;showMaint('這個帳號不是管理員，改版期間無法進入。')});return}   // v4.18 維護中只有管理員能進
  setTimeout(()=>mkSettle(true),1500);setTimeout(()=>{lbSync().finally(()=>lbFetch(true))},2000);if(AUTH&&!S.nick)return showName(true);if(!S.introSeen)return showStory();gateClose()}   // v3.51 直接從登入畫面切到故事，不先露出遊戲畫面
async function cloudPull(){const r=await sbRest('saves?select=data,updated_at&user_id=eq.'+AUTH.user.id);if(!r||!r[0])throw new Error('雲端還沒有存檔');S=sanitize(r[0].data);S.uid=AUTH.user.id;if(!CLOUD_ONLY)try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}CLOUD.last=Date.now();render()}
if(typeof window!=='undefined'){setInterval(()=>{if(AUTH&&CLOUD.dirty)cloudPush()},10000);setInterval(()=>{if(AUTH&&!document.hidden)syncClock()},600000);
  // 雲端存檔連續失敗超過 30 秒：畫面上方顯示紅色提示（避免玩家玩了很久卻沒存到）
  setInterval(()=>{let b=document.getElementById('cloudbar');const bad=AUTH&&CLOUD.ready&&CLOUD.err&&CLOUD.dirty&&Date.now()-CLOUD.last>30000;
    if(!bad){if(b)b.remove();return}if(!b){b=document.createElement('button');b.id='cloudbar';b.onclick=()=>{CLOUD.last=Date.now()-25000;cloudPush(true)};document.body.appendChild(b)}
    b.textContent='⚠ 雲端存檔失敗：'+CLOUD.err+'（點這裡重試）'},2000);setInterval(()=>{if(!document.hidden)cloudCheckSession()},30000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&AUTH){save();cloudPush(true,true)}else if(AUTH)cloudCheckSession()})}

/* ---------- v3.41 交易所（玩家之間買賣武器；伺服器 Supabase：market 表＋market_* 函式；v4.56 道具也能賣：kind 'i'＋market_fill） ---------- */
const MK_FEE=.05,MK_MAX=10,MK_DAYS=3,MK_CUR={gold:['it_gold','金幣'],gems:['it_gems','鑽石']};
const MK={rows:[],mine:[],claim:[],iclaim:[],seen:[],loading:false,err:'',t:0,tab:'buy',cat:'all',cur:'all',sort:'new',sellCur:'gold'};
const mkMock=()=>!AUTH&&devMode();   // 未登入但開了開發者模式 → 用本機「離線模擬」市場，方便測試畫面
const MK_ERR=m=>{m=String(m||'');return /not enough items/i.test(m)?'道具數量不夠（以雲端存檔為準）':/bad qty/i.test(m)?'數量不正確':/not owned/i.test(m)?'伺服器上找不到這個東西（請稍等幾秒再試）':/bad price/i.test(m)?`價格不正確（最低 ${MK_MIN}）`:/session/i.test(m)?'這個帳號已經在其他手機登入':/not available/i.test(m)?'這件商品已經賣出或下架了':/listing limit/i.test(m)?`同時最多上架 ${MK_MAX} 件`:/not enough/i.test(m)?'錢不夠（以雲端存檔為準，請稍後再試）':/bad price/i.test(m)?'價格不正確':/self/i.test(m)?'不能買自己上架的武器':/could not find the function|PGRST202|relation .*market/i.test(m)?'交易所尚未啟用（伺服器還沒設定好）｜'+m.slice(0,140):SB_ERR(m)};
const mkLeft=r=>Math.max(0,Date.parse(r.expires_at)-Date.now());
const mkGarrison=id=>S.villages.some(v=>v.weaponId===id)||(()=>{const w=W(id);return !!w&&bossSlotOf(w)>=0})();
const mkSellable=w=>!w.lock&&!w.test&&!mkGarrison(w.id)&&!(S.jobs||[]).some(j=>j.wid===w.id);
// v4.56 道具（強化石、附魔石、遺物、材料）：賣家填單價＋數量，買家可以只買一部分；上架／購買／下架／領取都由伺服器直接改雲端存檔
const mkIsItem=r=>r&&r.kind==='i',mkItemOk=k=>!!(ITEMS[k]||MATS[k]),mkHave=k=>MATS[k]?S.mats[k]|0:S.items[k]|0;
const mkCat=r=>mkIsItem(r)?'item':BP[bpId(r.bp)].cat,mkClaimN=()=>MK.claim.length+MK.iclaim.length;
const mkRowOk=r=>mkIsItem(r)?mkItemOk(r.item):!!BP[bpId(r.bp)];
const mkItemAdd=(k,n)=>{if(MATS[k])S.mats[k]=Math.max(0,(S.mats[k]|0)+n);else S.items[k]=Math.max(0,(S.items[k]|0)+n)};
// ---- 帳本（v3.48）：每筆交易只處理一次。伺服器保留「待處理」直到這邊的存檔確定上傳，才回報完成 ----
const MK_MIN=10,MK_MAXP={gold:99999999,gems:999999};
const mkLedger=()=>{S.mk=S.mk||{};for(const k of ['done','got','listed'])S.mk[k]=S.mk[k]||[];return S.mk};
// v3.63 伺服器成交時已經從雲端存檔扣款，並記在 mk.paid；這支手機是從雲端讀檔的話就不要再扣一次
const mkPaid=id=>{const p=(S.mk&&S.mk.paid)||[],ix=p.indexOf(id);if(ix<0)return false;p.splice(ix,1);return true};
const mkMark=(k,id)=>{const L=mkLedger();if(!L[k].includes(id)){L[k].push(id);if(L[k].length>300)L[k].splice(0,L[k].length-300)}};
const mkClean=w=>{const o=JSON.parse(JSON.stringify(w));o.oid=w.id;o.ocr=w.created||0;delete o.id;delete o.lock;delete o.test;return o};
// 把上架中的武器從背包拿掉（用原本的武器編號＋建立時間辨認，避免拿錯）
const mkTake=r=>{const w=r.weapon||{};const ix=S.weapons.findIndex(x=>x.id===w.oid&&(x.created||0)===(w.ocr||0)&&x.b===bpId(r.bp));if(ix>=0)S.weapons.splice(ix,1);return ix>=0};
// ---- 離線模擬（只在開發者模式、沒登入時使用）----
function mkMockDB(){let d=null;try{d=JSON.parse(localStorage.getItem('nrs-mkmock')||'null')}catch(e){}
  if(!d){d={seq:1,rows:[]};const bps=BPS.filter(b=>b.t<=1);for(let k=0;k<12;k++){const b=bps[(k*7)%bps.length],q=Math.min(4,(k*3)%5),lv=(k*5)%10,cur=k%3?'gold':'gems';
    d.rows.push({id:d.seq++,seller:'npc',seller_nick:LB_NAMES[k%LB_NAMES.length].split('・')[0],weapon:{b:b.id,q,lv,traits:[],ench:[null,null,null,null]},bp:b.id,lv,q,cur,price:cur==='gold'?(300+k*137)*(lv+1):20+k*9,status:'open',created_at:new Date(Date.now()-k*36e5).toISOString(),expires_at:new Date(Date.now()+(MK_DAYS*24-k*5)*36e5).toISOString(),settled:false,buyer_ack:false})}}
  if(!d.fills){d.fills=[];d.fseq=1;const ks=[STONE,'relic_g',ENSTONE,...Object.keys(MATS).slice(0,2)].filter(mkItemOk);ks.forEach((k,j)=>{const q=[30,4,12,200,150][j]||20;   // v4.56 道具商品
    d.rows.push({id:d.seq++,kind:'i',item:k,qty:q,left_qty:q,seller:'npc',seller_nick:LB_NAMES[(j+3)%LB_NAMES.length].split('・')[0],weapon:{item:k},bp:null,lv:0,q:0,cur:j%2?'gems':'gold',price:j%2?3+j:[400,0,250,30,25][j]||50,status:'open',created_at:new Date(Date.now()-j*25e5).toISOString(),expires_at:new Date(Date.now()+(MK_DAYS*24-j*3)*36e5).toISOString(),settled:false,buyer_ack:true})})}
  return d}
const mkMockSave=d=>{try{localStorage.setItem('nrs-mkmock',JSON.stringify(d))}catch(e){}};
async function mkMockApi(fn,a){const d=mkMockDB(),now=Date.now(),me='me';let out=null;
  if(fn==='browse')out=d.rows.filter(r=>r.status==='open'&&Date.parse(r.expires_at)>now);
  else if(fn==='mine')out=d.rows.filter(r=>r.seller===me&&r.status==='open');
  else if(fn==='list'){if(!(a.p_price>=MK_MIN))throw new Error('bad price');if(d.rows.filter(r=>r.seller===me&&r.status==='open'&&Date.parse(r.expires_at)>now).length>=MK_MAX)throw new Error('listing limit');
    out=d.seq;d.rows.unshift({id:d.seq++,seller:me,seller_nick:S.nick||'我',weapon:a.p_weapon,bp:a.p_bp,lv:a.p_lv,q:a.p_q,cur:a.p_cur,price:a.p_price,status:'open',created_at:new Date().toISOString(),expires_at:new Date(now+MK_DAYS*864e5).toISOString(),settled:false,buyer_ack:false})}
  else if(fn==='buy'){const r=d.rows.find(r=>r.id===a.p_id&&r.status==='open'&&Date.parse(r.expires_at)>now);if(!r||r.seller===me)throw new Error('not available');r.status='sold';r.buyer=me;out=r}
  else if(fn==='cancel'){const r=d.rows.find(r=>r.id===a.p_id&&r.seller===me&&r.status==='open');if(!r)throw new Error('not available');r.status='cancelled';out=r}
  else if(fn==='pending'){d.rows.forEach(r=>{if(r.seller===me&&r.status==='open'&&Date.parse(r.expires_at)<=now)r.status='expired'});out=d.rows.filter(r=>(r.seller===me&&!r.settled&&r.status!=='open')||(r.buyer===me&&!r.buyer_ack))}
  else if(fn==='ack'){d.rows.forEach(r=>{if(!a.p_ids.includes(r.id))return;if(r.seller===me)r.settled=true;if(r.buyer===me)r.buyer_ack=true})}
  // v4.56 道具：模擬伺服器直接改存檔（這裡直接改 S）
  else if(fn==='list_item'){const k=a.p_item,q=a.p_qty|0;if(!(a.p_price>=MK_MIN))throw new Error('bad price');if(!(q>=1))throw new Error('bad qty');if(mkHave(k)<q)throw new Error('not enough items');
    if(d.rows.filter(r=>r.seller===me&&r.status==='open'&&Date.parse(r.expires_at)>now).length>=MK_MAX)throw new Error('listing limit');
    mkItemAdd(k,-q);out=d.seq;d.rows.unshift({id:d.seq++,kind:'i',item:k,qty:q,left_qty:q,seller:me,seller_nick:S.nick||'我',weapon:{item:k},bp:null,lv:0,q:0,cur:a.p_cur,price:a.p_price,status:'open',created_at:new Date().toISOString(),expires_at:new Date(now+MK_DAYS*864e5).toISOString(),settled:false,buyer_ack:true})}
  else if(fn==='buy_item'){const r=d.rows.find(r=>r.id===a.p_id&&r.kind==='i'&&r.status==='open'&&Date.parse(r.expires_at)>now);if(!r||r.seller===me)throw new Error('not available');const q=a.p_qty|0;if(!(q>=1&&q<=r.left_qty))throw new Error('bad qty');
    const tot=r.price*q;if(S[r.cur]<tot)throw new Error('not enough');S[r.cur]-=tot;mkItemAdd(r.item,q);r.left_qty-=q;if(r.left_qty<=0)r.status='sold';out={id:d.fseq++,listing:r.id,seller:r.seller,buyer:me,item:r.item,qty:q,cur:r.cur,total:tot,settled:false};d.fills.push(out)}
  else if(fn==='cancel_item'){const r=d.rows.find(r=>r.id===a.p_id&&r.kind==='i'&&r.seller===me&&r.status==='open');if(!r)throw new Error('not available');mkItemAdd(r.item,r.left_qty);r.left_qty=0;r.status='cancelled';r.settled=true;out=r}
  else if(fn==='item_pending'||fn==='item_claim'){d.rows.forEach(r=>{if(r.seller===me&&r.status==='open'&&Date.parse(r.expires_at)<=now)r.status='expired'});
    const fs=d.fills.filter(f=>f.seller===me&&!f.settled),bs=d.rows.filter(r=>r.kind==='i'&&r.seller===me&&r.status==='expired'&&!r.settled&&r.left_qty>0);
    if(fn==='item_pending')out=[...fs.map(f=>({key:'f'+f.id,status:'sold',item:f.item,qty:f.qty,cur:f.cur,total:f.total,net:Math.floor(f.total*.95)})),...bs.map(r=>({key:'b'+r.id,status:'expired',item:r.item,qty:r.left_qty,cur:r.cur,total:0,net:0}))];
    else{out={gold:0,gems:0,back:0};fs.forEach(f=>{const n=Math.floor(f.total*.95);S[f.cur]+=n;out[f.cur]+=n;f.settled=true});
      d.rows.forEach(r=>{if(r.kind==='i'&&r.seller===me&&(r.status==='expired'||r.status==='sold')&&!r.settled){if(r.status==='expired'&&r.left_qty>0){mkItemAdd(r.item,r.left_qty);out.back+=r.left_qty}r.left_qty=0;r.settled=true}})}}
  else if(fn==='sim_sell'){const r=d.rows.find(r=>r.kind==='i'&&r.seller===me&&r.status==='open');if(!r)throw new Error('先上架一個道具');const q=Math.max(1,Math.ceil(r.left_qty/2));   // 開發者測試：假裝有人買走一半
    r.left_qty-=q;if(r.left_qty<=0)r.status='sold';d.fills.push({id:d.fseq++,listing:r.id,seller:me,buyer:'npc',item:r.item,qty:q,cur:r.cur,total:r.price*q,settled:false});out=q}
  mkMockSave(d);return JSON.parse(JSON.stringify(out))}
// ---- 伺服器 ----
async function mkApi(fn,a={}){if(mkMock())return mkMockApi(fn,a);if(!AUTH)throw new Error('尚未登入');
  if(fn==='browse')return sbRest('market?select=id,seller,seller_nick,weapon,bp,lv,q,cur,price,expires_at,created_at,kind,item,qty,left_qty&status=eq.open&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&order=created_at.desc&limit=80');
  if(fn==='mine')return sbRest('market?select=id,seller,seller_nick,weapon,bp,lv,q,cur,price,expires_at,created_at,kind,item,qty,left_qty&seller=eq.'+AUTH.user.id+'&status=eq.open&order=created_at.desc');
  return sbRest('rpc/market_'+fn,{method:'POST',body:JSON.stringify({...a,p_sid:SID})})}
const mkMe=r=>mkMock()?r.seller==='me':AUTH&&r.seller===AUTH.user.id;
const mkMeBuyer=r=>mkMock()?r.buyer==='me':AUTH&&r.buyer===AUTH.user.id;
// 確定存檔已上傳雲端（離線模擬視為成功）
async function mkSaved(){save();if(!AUTH)return true;for(let k=0;k<20&&CLOUD.busy;k++)await new Promise(r=>setTimeout(r,150));await cloudPush(true);return !CLOUD.dirty&&!CLOUD.err&&!CLOUD.kicked}
async function mkLoad(){if(MK.loading)return MK.p;MK.loading=true;MK.err='';mkRender();return MK.p=(async()=>{
  try{const [a,b]=await Promise.all([mkApi('browse'),mkApi('mine')]);MK.rows=(a||[]).filter(mkRowOk);MK.mine=(b||[]).filter(mkRowOk);MK.t=Date.now();await mkReconcile(true)}
  catch(e){MK.err=MK_ERR(e.message);console.warn('market',e.message)}finally{MK.loading=false;mkRender()}})()}
const mkRender=()=>{if(ui.tab==='market'||ui.sheet&&/^mk/.test(ui.sheet.t))render()};
function mkGive(w){const o={...JSON.parse(JSON.stringify(w)),id:S.nextId++,lock:false,test:false,created:NOW()};delete o.oid;delete o.ocr;o.b=bpId(o.b);o.traits=o.traits||[];elemCleanW(o);S.weapons.push(o);return o}
// 對帳：成交入帳、過期／下架退回、我買到的武器、我上架但背包還在的武器；全部只處理一次，存檔上傳成功才回報伺服器
let MK_REC=false;
async function mkReconcile(quiet){if((!AUTH||!CLOUD.ready)&&!mkMock())return;if(MK_REC)return;MK_REC=true;
  try{const L=mkLedger();let changed=false,g=0,m=0,back=0,got=[],ack=[];
    for(const r of MK.mine||[])if(!mkIsItem(r)&&!L.listed.includes(r.id)){mkTake(r);mkMark('listed',r.id);changed=true}   // 上架成功但當時沒存到檔
    const rs=(await mkApi('pending')||[]).filter(r=>!mkIsItem(r));
    let ip=[];try{ip=await mkApi('item_pending')||[]}catch(e){console.warn('market items',e.message)}   // v4.56 伺服器還沒跑 sql/19 時，武器照常運作
    const ifresh=ip.filter(r=>!MK.seen.includes(r.key));MK.iclaim=ip;MK.seen.push(...ifresh.map(r=>r.key));
    const claim=[];
    for(const r of rs){
      if(mkMe(r)){if(!L.listed.includes(r.id)){mkTake(r);mkMark('listed',r.id);changed=true}
        if(!L.done.includes(r.id)){if(r.status!=='cancelled'){claim.push(r);continue}   // v4.08 賣出／過期：留著等玩家在交易所按「領取」才入帳，伺服器也先不回報
          mkGive(r.weapon);back++;mkMark('done',r.id);changed=true}}
      else if(mkMeBuyer(r)){if(!L.got.includes(r.id)){if(!mkPaid(r.id))S[r.cur]=Math.max(0,S[r.cur]-r.price);const w=mkGive(r.weapon);got.push(BP[w.b].n+' +'+w.lv);mkMark('got',r.id);changed=true}}
      ack.push(r.id)}
    const fresh=[...claim.filter(r=>!MK.seen.includes(r.id)),...ifresh];MK.claim=claim.concat(MK.claim.filter(r=>r.fake));MK.seen.push(...fresh.filter(r=>r.id).map(r=>r.id));
    if(fresh.length&&ui.tab!=='market')MK.tab='claim';   // v4.56 有新的賣出／退回：下次進交易所直接看到待領取
    if(fresh.length)toast(`交易所有 ${fresh.length} 筆${fresh.some(r=>r.status==='sold')?'賣出':'退回'}，到交易所領取`,'ok');
    if(changed&&!(await mkSaved()))return;   // 存檔沒上傳成功：先不回報，下次再對一次（帳本保證不會重複）
    if(ack.length)await mkApi('ack',{p_ids:ack});
    const msg=[g||m?`交易所成交入帳：${g?fmt(g)+' 金幣':''}${g&&m?'、':''}${m?fmt(m)+' 鑽':''}（已扣 5% 手續費）`:'',back?`${back} 件武器已退回道具欄（下架或 ${MK_DAYS} 天未售出）`:'',got.length&&!quiet?'':got.length?'已補發購買的武器：'+got.join('、'):''].filter(Boolean);
    if(g||m||back||got.length){S.mkNew=(S.mkNew||0)+1;save()}   // v3.64 交易所紅點
    if(msg.length)toast(msg.join('<br>'),'ok');if(changed||fresh.length||ui.tab==='market'||ip.length)render()}
  catch(e){if(!quiet)toast('交易所對帳失敗：'+MK_ERR(e.message),'bad')}finally{MK_REC=false}}
const mkSettle=q=>mkReconcile(q);
// v4.08 交易所待領取：按「全部領取」才把賣出的錢／過期的武器入帳，存檔上傳成功才回報伺服器（帳本保證只入帳一次）
const mkNet=r=>Math.floor(r.price*(1-MK_FEE));
// v4.56 道具交易由伺服器直接改雲端存檔：先把存檔推上去、暫停自動存檔、呼叫伺服器，最後把雲端存檔讀回來（成功失敗都讀，雲端為準）
async function mkItemTx(fn){if(!(await mkSaved()))throw new Error('存檔還沒上傳成功，請稍後再試');if(mkMock())return fn();
  CLOUD.busy=true;try{return await fn()}finally{try{await cloudPull()}catch(e){console.warn('market pull',e.message)}CLOUD.busy=false}}
async function mkClaim(){if(ui.mkBusy||!mkClaimN())return;ui.mkBusy=true;render();
  try{const L=mkLedger(),rs=MK.claim.slice(),real=rs.filter(r=>!r.fake),hadI=MK.iclaim.length>0;let g=0,m=0,back=0,iback=0;
    if(hadI){const x=await mkItemTx(()=>mkApi('item_claim'))||{};g+=x.gold|0;m+=x.gems|0;iback+=x.back|0;MK.iclaim=[]}
    for(const r of real){if(L.done.includes(r.id))continue;if(r.status==='sold'){const n=mkNet(r);if(r.cur==='gems'){S.gems+=n;m+=n}else{S.gold+=n;g+=n}}else{mkGive(r.weapon);back++}mkMark('done',r.id)}
    MK.claim=[];
    if(real.length){if(!(await mkSaved()))throw new Error('存檔還沒上傳成功，已入帳，稍後會自動回報');await mkApi('ack',{p_ids:real.map(r=>r.id)})}
    const fk=rs.filter(r=>r.fake);fk.forEach(r=>{if(r.status==='sold'){const n=mkNet(r);r.cur==='gems'?m+=n:g+=n}else back++});
    snd('coin');toast(`${fk.length&&!real.length&&!hadI?'（測試，不會真的入帳）<br>':''}已領取${g?'：'+fmt(g)+' 金幣':''}${m?(g?'、':'：')+fmt(m)+' 鑽石':''}${back?`<br>${back} 件武器已放回道具欄`:''}${iback?`<br>${fmt(iback)} 個道具已放回道具欄`:''}`,'ok')}
  catch(e){toast('領取：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;render()}}
function mkClaimBox(){if(!mkClaimN())return '';const rs=MK.claim,is=MK.iclaim.filter(r=>mkItemOk(r.item)),sum=c=>rs.filter(r=>r.status==='sold'&&(r.cur==='gems')===(c==='gems')).reduce((a,r)=>a+mkNet(r),0)+is.filter(r=>r.status==='sold'&&(r.cur==='gems')===(c==='gems')).reduce((a,r)=>a+(r.net|0),0),g=sum('gold'),m=sum('gems');
  const irow=r=>{const sold=r.status==='sold';return `<div class="ui-card ui-card--row mk-row mk-cl-row"><div class="mk-art mk-iart">${itemIco(r.item)}</div><div class="grow mk-mid"><b class="mk-nm">${itemName(r.item)} <span class="lvt">×${fmt(r.qty)}</span></b><span class="small muted">${sold?`賣出 ${fmt(r.qty)} 個・共 ${fmt(r.total)}`:`${MK_DAYS} 天沒賣完`}</span></div>${sold?mkPrice(r.cur,r.net|0):'<span class="small muted mk-cl-back">退回道具欄</span>'}</div>`};
  const row=r=>{const w=r.weapon||{},b=BP[bpId(r.bp)];if(!b)return '';const sold=r.status==='sold';
    return `<div class="ui-card ui-card--row mk-row mk-cl-row"><div class="mk-art">${wArt(b.id,{frame:fq(w)})}</div><div class="grow mk-mid"><b class="mk-nm">${wName({...w,b:b.id})}</b><span class="small muted">${sold?`售價 ${fmt(r.price)}`:`${MK_DAYS} 天未售出`}</span></div>${sold?mkPrice(r.cur,mkNet(r)):'<span class="small muted mk-cl-back">退回道具欄</span>'}</div>`};
  return `<div class="mk-claim"><div class="mk-cl-head"><b class="t-gold grow">待領取 ${rs.length+is.length} 筆</b>${btn(ui.mkBusy?'領取中…':'全部領取','mkclaim',{cls:'btn-primary sm',dis:ui.mkBusy})}</div>
   <div class="mk-list">${rs.map(row).join('')}${is.map(irow).join('')}</div>${g||m?`<div class="mk-cl-sum"><span class="small muted grow">實收（扣 ${MK_FEE*100}%）</span>${g?mkPrice('gold',g):''}${m?mkPrice('gems',m):''}</div>`:''}</div>`}
async function mkList(id,cur,price){const w=S.weapons.find(x=>x.id===id);if(!w)return toast('找不到這把武器','bad');if(!mkSellable(w))return toast('上鎖或駐守村莊中的武器不能上架','bad');
  price=Math.floor(+price);if(!(price>=MK_MIN))return toast(`最低售價 ${MK_MIN}`,'bad');if(price>MK_MAXP[cur])return toast(`最高售價 ${fmt(MK_MAXP[cur])}`,'bad');
  if(MK.mine.length>=MK_MAX)return toast(`同時最多上架 ${MK_MAX} 件`,'bad');if(ui.mkBusy)return;ui.mkBusy=true;
  try{if(!(await mkSaved()))throw new Error('存檔還沒上傳成功，請稍後再試');const nid=await mkApi('list',{p_weapon:mkClean(w),p_bp:w.b,p_lv:w.lv,p_q:w.q,p_cur:cur,p_price:price,p_nick:S.nick||'無名鐵匠'});
    const ix=S.weapons.indexOf(w);if(ix>=0)S.weapons.splice(ix,1);if(nid)mkMark('listed',+nid);await mkSaved();
    toast(`已上架：${BP[w.b].n} +${w.lv}，${fmt(price)} ${MK_CUR[cur][1]}`,'ok');ui.sheet=null;MK.tab='mine';snd('deliver')}
  catch(e){toast('上架失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;mkLoad()}}   // 失敗時武器沒動過；若其實上架成功，mkLoad 對帳會自動移出背包
async function mkBuy(id){const r=MK.rows.find(x=>x.id===id);if(!r)return;if(mkMe(r))return toast('不能買自己上架的武器','bad');
  if(S[r.cur]<r.price)return toast(`${MK_CUR[r.cur][1]}不足`,'bad');if(ui.mkBusy)return;ui.mkBusy=true;
  try{if(!(await mkSaved()))throw new Error('存檔還沒上傳成功，請稍後再試');   // v3.63 伺服器用雲端存檔的錢判斷夠不夠，先存檔
    CLOUD.busy=true;let row,w;   // 成交到本機扣款之間暫停自動存檔，避免把還沒扣款的金額存上去
    try{const x=await mkApi('buy',{p_id:id});row=x&&x.id?x:r;mkPaid(row.id);S[row.cur]=Math.max(0,S[row.cur]-row.price);w=mkGive(row.weapon);mkMark('got',row.id)}finally{CLOUD.busy=false}
    if(await mkSaved())await mkApi('ack',{p_ids:[row.id]}).catch(()=>{});snd('coin');toast(`購買成功：${BP[w.b].n} +${w.lv} 已放進道具欄`,'ok');ui.sheet=null}
  catch(e){toast('購買失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;mkLoad()}}   // 若其實已成交，mkLoad 對帳會補發武器並扣款
async function mkCancel(id){if(ui.mkBusy)return;ui.mkBusy=true;const r=MK.mine.find(x=>x.id===id)||MK.rows.find(x=>x.id===id);
  try{if(mkIsItem(r)){await mkItemTx(()=>mkApi('cancel_item',{p_id:id}));toast(`已下架，剩下的 ${fmt(r.left_qty)} 個${itemName(r.item)}退回道具欄`,'ok');ui.sheet=null}
    else{await mkApi('cancel',{p_id:id});toast('已下架，武器退回道具欄','ok')}}
  catch(e){toast('下架失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;await mkLoad()}}   // 退回武器統一由對帳處理（只會退一次）
// v4.56 上架道具：單價＋數量，上架時伺服器直接從雲端存檔扣掉
async function mkListItem(k,cur,price,qty){if(!mkItemOk(k))return toast('這個東西不能上架','bad');
  price=Math.floor(+price);qty=Math.floor(+qty);if(!(price>=MK_MIN))return toast(`單價最低 ${MK_MIN}`,'bad');if(price>MK_MAXP[cur])return toast(`單價最高 ${fmt(MK_MAXP[cur])}`,'bad');
  if(!(qty>=1))return toast('數量至少 1 個','bad');if(qty>mkHave(k))return toast(`你只有 ${fmt(mkHave(k))} 個`,'bad');
  if(MK.mine.length>=MK_MAX)return toast(`同時最多上架 ${MK_MAX} 件`,'bad');if(ui.mkBusy)return;ui.mkBusy=true;render();
  try{await mkItemTx(()=>mkApi('list_item',{p_item:k,p_qty:qty,p_cur:cur,p_price:price,p_nick:S.nick||'無名鐵匠'}));
    toast(`已上架：${itemName(k)} ×${fmt(qty)}，每個 ${fmt(price)} ${MK_CUR[cur][1]}`,'ok');ui.sheet=null;ui.result=null;MK.tab='mine';snd('deliver')}
  catch(e){toast('上架失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;mkLoad()}}
// v4.56 買道具：可以只買一部分
async function mkBuyItem(id,qty){const r=MK.rows.find(x=>x.id===id);if(!r)return;if(mkMe(r))return toast('不能買自己上架的東西','bad');qty=Math.floor(+qty);
  if(!(qty>=1&&qty<=r.left_qty))return toast(`數量要在 1～${fmt(r.left_qty)} 之間`,'bad');if(S[r.cur]<r.price*qty)return toast(`${MK_CUR[r.cur][1]}不足`,'bad');if(ui.mkBusy)return;ui.mkBusy=true;render();
  try{await mkItemTx(()=>mkApi('buy_item',{p_id:id,p_qty:qty}));snd('coin');toast(`購買成功：${itemName(r.item)} ×${fmt(qty)} 已放進道具欄`,'ok');ui.sheet=null}
  catch(e){toast('購買失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;mkLoad()}}
if(typeof window!=='undefined')setInterval(()=>{if(AUTH&&CLOUD.ready&&!document.hidden)mkReconcile(true)},60000);
// ---- 畫面 ----
const mkPrice=(cur,p,cls='')=>`<span class="mk-price ${cls}">${img(MK_CUR[cur][0])}<b>${fmt(p)}</b></span>`;
const mkWho=r=>mkMe(r)?'<span class="t-gold">我的上架</span>':esc(r.seller_nick||'無名鐵匠');
function mkItemRow(r,act){return `<button class="ui-card ui-card--row mk-row ${mkMe(r)?'me':''}" data-act="${act}" data-id="${r.id}"><div class="mk-art mk-iart">${itemIco(r.item)}</div>
   <div class="grow mk-mid"><b class="mk-nm">${itemName(r.item)} <span class="lvt">×${fmt(r.left_qty)}</span></b><span class="small muted">${MATS[r.item]?'材料':'道具'}・標價是一個的價格</span>
   <span class="small muted">${mkWho(r)}・剩 ${fmtT(mkLeft(r))}</span></div><span class="mk-pu">${mkPrice(r.cur,r.price)}<i>每個</i></span></button>`}
function mkRow(r,act){if(mkIsItem(r))return mkItemRow(r,act);const w=r.weapon,b=BP[bpId(r.bp)],me=mkMe(r);
  return `<button class="ui-card ui-card--row mk-row ${me?'me':''}" data-act="${act}" data-id="${r.id}"><div class="mk-art">${wArt(b.id,{frame:fq(w)})}</div>
   <div class="grow mk-mid"><b class="mk-nm">${wName({...w,b:b.id})}</b><span class="small muted">${CATS[b.cat]}・攻擊力 ${fmt(power({...w,b:b.id}))}</span>
   <span class="small muted">${me?'<span class="t-gold">我的上架</span>':esc(r.seller_nick||'無名鐵匠')}・剩 ${fmtT(mkLeft(r))}</span></div>${mkPrice(r.cur,r.price)}</button>`}
function viewMarketPage(){if(!MK.t&&!MK.loading&&(AUTH||mkMock()))setTimeout(mkLoad,0);return `<div class="pagehead"><h2>交易所</h2></div>`+viewMarket()}
function viewMarket(){
  if(!AUTH&&!mkMock())return `<div class="ui-panel panel mk-gate">${ptitle('交易所')}<div class="small muted center">交易所需要登入帳號才能使用，訪客進度只存在這支手機，無法和其他玩家交易。</div>${btn('登入／註冊','mklogin',{cls:'btn-primary big'})}</div>`;
  if(!MK.t&&!MK.loading&&!MK.err)setTimeout(mkLoad,0);
  if(MK.tab==='sell')MK.tab='claim';   // v4.56 「上架武器」分頁改成「待領取」，上架改從道具欄點武器
  const tabs=[['buy','購買'],['mine',`我的上架 ${MK.mine.length}/${MK_MAX}`],['claim',`待領取${mkClaimN()?' '+mkClaimN()+'<i class="dot mk-dot"></i>':''}`]].map(([k,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${MK.tab===k?'on':''}" data-act="mktab" data-k="${k}">${n}</button>`).join('');
  let body='';
  if(MK.tab==='buy'){const cats=['all',...new Set(MK.rows.map(mkCat))];
    let rows=MK.rows.filter(r=>(MK.cat==='all'||mkCat(r)===MK.cat)&&(MK.cur==='all'||r.cur===MK.cur));
    if(MK.sort==='low')rows=[...rows].sort((a,b)=>(a.cur===b.cur?a.price-b.price:a.cur==='gold'?-1:1));if(MK.sort==='pow'){const P=r=>mkIsItem(r)?-1:power({...r.weapon,b:bpId(r.bp)});rows=[...rows].sort((a,b)=>P(b)-P(a))}
    const chip=(act,k,n,on)=>`<button class="ui-btn ui-btn--chip chipbtn ${on?'on':''}" data-act="${act}" data-k="${k}">${n}</button>`;
    body=`<div class="mk-filter"><div class="hscroll mk-chips">${cats.map(c=>chip('mkcat',c,c==='all'?'全部':c==='item'?'道具':CATS[c],MK.cat===c)).join('')}</div>
      <div class="mk-chips row">${chip('mkcur','all','全部',MK.cur==='all')}${chip('mkcur','gold','金幣',MK.cur==='gold')}${chip('mkcur','gems','鑽石',MK.cur==='gems')}<span class="grow"></span>${chip('mksort','new','最新',MK.sort==='new')}${chip('mksort','low','價低',MK.sort==='low')}${chip('mksort','pow','攻擊力',MK.sort==='pow')}</div></div>
      <div class="mk-list">${rows.length?rows.map(r=>mkRow(r,'mkview')).join(''):`<div class="small muted center mk-empty">${MK.loading?'讀取中…':'目前沒有符合條件的商品'}</div>`}</div>`}
  else if(MK.tab==='mine'){body=`<div class="mk-list">${MK.mine.length?MK.mine.map(r=>`<div class="mk-mine">${mkRow(r,'mkview')}${btn('下架','mkcancel',{cls:'btn-sec sm',attrs:`data-id="${r.id}"`})}</div>`).join(''):`<div class="small muted center mk-empty">${MK.loading?'讀取中…':'你目前沒有上架中的東西'}</div>`}</div>
      <div class="small muted mk-note">要上架：到道具欄點武器或道具，按「上架」（道具可以填單價和數量）。成交後收入會放在「待領取」，按「全部領取」入帳（扣 ${MK_FEE*100}% 手續費）；上架 ${MK_DAYS} 天沒賣出也會放在待領取，領取後回到道具欄。</div>`}
  else body=mkClaimN()?mkClaimBox():`<div class="small muted center mk-empty">${MK.loading?'讀取中…':'目前沒有要領取的東西'}</div><div class="small muted mk-note">賣出的收入、${MK_DAYS} 天沒賣出退回的武器和道具都會放在這裡，按「全部領取」才入帳。</div>`;
  return `<div class="ui-panel panel mk">${ptitle(mkMock()?'離線模擬市場':'玩家交易')}<div class="mk-tabs">${tabs}<button class="ui-iconbtn mk-ref" data-act="mkref" aria-label="重新整理">${MK.loading?'…':'⟳'}</button></div>
   ${MK.err?`<div class="small t-danger center mk-err">${MK.err}</div>`:''}${body}</div>`}
function mkWeaponBox(w){w={...w,b:bpId(w.b)};const b=BP[w.b];   // v4.53 跟武器小卡同一套：名稱含屬性、攻擊力、四格數值
  return `<div class="ui-panel panel mk-wp"><div class="wp-top">${wArt(b.id,{frame:fq(w)})}<div class="grow"><div class="wp-nm">${wName(w)}</div>
    <div class="wp-sub"><span>${CATS[b.cat]}・${kindN(b)}</span></div><div class="wp-pow"><b>${fmt(power(w))}</b><span>攻擊力（每秒傷害）</span></div></div></div>${wpGrid(w)}</div>`}
function sheetMk(s){const head=t=>`<div class="sheet-head"><span></span><h2>${t}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  if(s.t==='mksi')return sheetMkSellItem(s.k,head);
  if(s.t==='mkw'){const r=MK.rows.find(x=>x.id===s.id)||MK.mine.find(x=>x.id===s.id);if(!r)return head('交易所')+'<div class="small muted center">這件商品已經不在架上了</div>';
    if(mkIsItem(r))return sheetMkItem(r,head);
    const me=mkMe(r),have=S[r.cur],lack=have<r.price;
    return head('交易所商品')+`<div class="lbw-owner"><div class="grow"><b>${me?'我的上架':esc(r.seller_nick||'無名鐵匠')}</b><div class="small muted">剩 ${fmtT(mkLeft(r))} 自動下架</div></div>${mkPrice(r.cur,r.price,'big')}</div>${mkWeaponBox({...r.weapon,b:bpId(r.bp)})}
     ${me?btn('下架','mkcancel',{cls:'btn-sec big',attrs:`data-id="${r.id}"`}):`<div class="small muted center mk-have">持有 ${img(MK_CUR[r.cur][0])} ${fmt(have)}${lack?'<span class="t-danger">（不足）</span>':''}</div>${btn(`購買　${fmt(r.price)} ${MK_CUR[r.cur][1]}`,'mkbuy',{cls:'btn-primary big',attrs:`data-id="${r.id}"`,dis:lack||ui.mkBusy})}`}`}
  const w=S.weapons.find(x=>x.id===s.id);if(!w)return head('上架武器')+'<div class="small muted center">找不到這把武器</div>';
  const cur=MK.sellCur,p=Math.max(0,Math.floor(+(ui.mkPrice||0))),net=Math.floor(p*(1-MK_FEE));
  return head('上架武器')+mkWeaponBox(w)+`<div class="ui-panel panel mk-form">
    <div class="kv"><span>收取貨幣</span><b class="row">${['gold','gems'].map(c=>`<button class="ui-btn ui-btn--chip chipbtn ${cur===c?'on':''}" data-act="mkscur" data-k="${c}">${img(MK_CUR[c][0])}${MK_CUR[c][1]}</button>`).join('')}</b></div>
    <div class="kv"><span>售價</span><b><input id="mkprice" type="number" inputmode="numeric" min="10" step="1" placeholder="最低 10" value="${ui.mkPrice||''}"></b></div>
    <div class="kv"><span>手續費 ${MK_FEE*100}%</span><b class="mk-fee">${p?'-'+fmt(p-net):'—'}</b></div>
    <div class="kv"><span>成交後實收</span><b class="mk-net t-gold">${p?fmt(net)+' '+MK_CUR[cur][1]:'—'}</b></div>
    <div class="small muted">上架期間武器會先從道具欄移出；${MK_DAYS} 天沒賣出自動退回，也可以隨時下架。</div></div>
   ${btn('確認上架','mksell',{cls:'btn-primary big',attrs:`data-id="${w.id}"`,dis:p<MK_MIN||ui.mkBusy})}`}

// v4.56 道具商品詳情：買家填要買幾個
const mkItemBox=(k,sub)=>`<div class="ui-panel panel mk-ibox"><div class="mk-ib-top"><div class="mk-ib-ico">${itemIco(k)}</div><div class="grow"><div class="wp-nm">${itemName(k)}</div><div class="small muted">${sub}</div></div></div><div class="small muted mk-ib-d">${MATS[k]?MAT_D[k]||'':ITEMS[k][2]}</div></div>`;
function sheetMkItem(r,head){const me=mkMe(r),q=Math.max(1,Math.min(r.left_qty,Math.floor(+(ui.mkBq||1))||1)),tot=r.price*q,have=S[r.cur],lack=have<tot;
  return head('交易所商品')+`<div class="lbw-owner"><div class="grow"><b>${me?'我的上架':esc(r.seller_nick||'無名鐵匠')}</b><div class="small muted">剩 ${fmtT(mkLeft(r))} 自動下架</div></div><span class="mk-pu">${mkPrice(r.cur,r.price,'big')}<i>每個</i></span></div>
   ${mkItemBox(r.item,`還剩 <b>${fmt(r.left_qty)}</b> 個・你持有 ${fmt(mkHave(r.item))} 個`)}
   ${me?btn('下架（剩下的退回道具欄）','mkcancel',{cls:'btn-sec big',attrs:`data-id="${r.id}"`}):`<div class="ui-panel panel mk-form">
    <div class="kv"><span>購買數量</span><b class="row mk-qrow"><input id="mkbq" class="mk-in" type="number" inputmode="numeric" min="1" max="${r.left_qty}" step="1" value="${q}"><button class="ui-btn ui-btn--chip chipbtn" data-act="mkbqall" data-id="${r.id}">全部</button></b></div>
    <div class="kv"><span>總價</span><b class="mk-btot t-gold">${fmt(tot)} ${MK_CUR[r.cur][1]}</b></div>
    <div class="small muted center mk-have">持有 ${img(MK_CUR[r.cur][0])} ${fmt(have)}<span class="t-danger mk-lack">${lack?'（不足）':''}</span></div></div>
    ${btn(`購買`,'mkbuyi',{cls:'btn-primary big',attrs:`data-id="${r.id}"`,dis:lack||ui.mkBusy})}`}`}
// v4.56 上架道具：收取貨幣、單價、數量
function sheetMkSellItem(k,head){if(!mkItemOk(k))return head('上架道具')+'<div class="small muted center">這個東西不能上架</div>';
  const cur=MK.sellCur,have=mkHave(k),p=Math.max(0,Math.floor(+(ui.mkPrice||0))),q=Math.max(0,Math.min(have,Math.floor(+(ui.mkQty??1)||0))),tot=p*q,net=Math.floor(tot*(1-MK_FEE));
  return head('上架道具')+mkItemBox(k,`持有 <b>${fmt(have)}</b> 個`)+`<div class="ui-panel panel mk-form">
    <div class="kv"><span>收取貨幣</span><b class="row">${['gold','gems'].map(c=>`<button class="ui-btn ui-btn--chip chipbtn ${cur===c?'on':''}" data-act="mkscur" data-k="${c}">${img(MK_CUR[c][0])}${MK_CUR[c][1]}</button>`).join('')}</b></div>
    <div class="kv"><span>單價（一個）</span><b><input id="mkiprice" class="mk-in" type="number" inputmode="numeric" min="10" step="1" placeholder="最低 10" value="${ui.mkPrice||''}"></b></div>
    <div class="kv"><span>數量</span><b class="row mk-qrow"><input id="mkiqty" class="mk-in" type="number" inputmode="numeric" min="1" max="${have}" step="1" value="${q||''}"><button class="ui-btn ui-btn--chip chipbtn" data-act="mkiqall" data-k="${k}">全部</button></b></div>
    <div class="kv"><span>總價</span><b class="mk-itot">${tot?fmt(tot):'—'}</b></div>
    <div class="kv"><span>手續費 ${MK_FEE*100}%</span><b class="mk-fee">${tot?'-'+fmt(tot-net):'—'}</b></div>
    <div class="kv"><span>全部賣出實收</span><b class="mk-net t-gold">${tot?fmt(net)+' '+MK_CUR[cur][1]:'—'}</b></div>
    <div class="small muted">上架期間這些道具會先從道具欄移出；買家可以只買一部分，賣掉的錢放在交易所「待領取」。${MK_DAYS} 天沒賣完的會退回，也可以隨時下架。</div></div>
   ${btn('確認上架','mkselli',{cls:'btn-primary big',attrs:`data-k="${k}"`,dis:p<MK_MIN||q<1||ui.mkBusy})}`}
const mkSellBtn=k=>(AUTH||mkMock())&&mkItemOk(k)&&mkHave(k)>0?btn('上架交易所','mksellit',{cls:'btn-sec big mk-sellit',attrs:`data-k="${k}"`}):'';

/* ---------- 排行榜（v3.16 電腦對手版：虛構的北境鐵匠；上架前改接真人資料，畫面沿用） ---------- */
const LB_NAMES=['霜錘・埃里克','鐵顎・博格','灰燼・西格麗','渡鴉・烏爾夫','熔心・托爾芬','狼牙・英格麗','寒鋼・哈康','冰脊・阿斯特麗','雷砧・比約恩','黑爐・古納',
 '火鬃・芙蕾雅','鹿角・奧拉夫','碎岩・斯凱','鷹眼・希爾達','北風・拉格納','銀鬚・瓦爾德','血斧・凱爾','霧峽・露恩','石心・哈爾德','星鐵・伊娃'];
const LB_RW=[[10,{gems:30},'前 10 名'],[3,{gems:50},'前 3 名'],[1,{gems:100},'第 1 名']];
// v3.46 真人排行榜：伺服器 lb 表（每位玩家每座村莊一筆最佳紀錄）；電腦對手已移除
const LBR={rows:{},t:0,loading:false,err:''};
// v4.38 排行榜先全部關掉（Mochi）：不讀不傳、不發獎勵、沒有入口；資料和伺服器表都留著，LB_OFF 改 false 就能恢復
const LB_OFF=true;
async function lbFetch(force){if(LB_OFF||!AUTH||LBR.loading||(!force&&Date.now()-LBR.t<60000))return;LBR.loading=true;
  try{const r=await sbRest('lb?select=user_id,village,nick,p,w,updated_at&order=p.desc,updated_at.asc&limit=1000');const g={};
    (r||[]).forEach(x=>{if(!VILLAGES[x.village]||!x.w||!BP[bpId(x.w.b)])return;x.w.b=bpId(x.w.b);(g[x.village]=g[x.village]||[]).push(x)});LBR.rows=g;LBR.t=Date.now();LBR.err=''}
  catch(e){LBR.err=/relation|lb/.test(e.message)?'排行榜尚未啟用（伺服器還沒設定好）':SB_ERR(e.message)}finally{LBR.loading=false}
  const pend=[];VILLAGES.forEach((v,i)=>{const r=lbReward(i);if(r.length)pend.push(`${v.name}：${r.join('、')}`)});if(pend.length)toast('排行榜獎勵：<br>'+pend.join('<br>'),'ok');render()}
// 其他玩家（不含自己），攻擊力高到低
// v3.58 同攻擊力：先達成者（伺服器 updated_at 較早）排前面；t 是達成時間
const lbOthers=i=>(LBR.rows[i]||[]).filter(x=>!AUTH||x.user_id!==AUTH.user.id).map(x=>({u:x.user_id,n:x.nick||'無名鐵匠',p:x.p,t:Date.parse(x.updated_at)||Infinity,w:{traits:[],ench:[],...x.w}}));
// 自己紀錄的達成時間：伺服器上那筆攻擊力相同才算；還沒上傳就當作最晚
const lbMyT=i=>{const b=S.best[i],r=AUTH&&(LBR.rows[i]||[]).find(x=>x.user_id===AUTH.user.id);return b&&r&&r.p===b.p&&Date.parse(r.updated_at)||Infinity};
const lbAhead=(x,p,t)=>x.p>p||(x.p===p&&x.t<t);
async function lbSync(){if(LB_OFF||!AUTH||!CLOUD.ready)return;let n=0;for(const k in S.best){const b=S.best[k];if(!b||b.sub)continue;
  try{const p=await sbRest('rpc/lb_submit',{method:'POST',body:JSON.stringify({p_village:+k,p_p:b.p,p_w:{b:b.b,q:b.q,lv:b.lv,rf:b.rf||0,traits:b.traits||[],ench:b.ench||[]},p_nick:S.nick||'無名鐵匠'})});if(typeof p==='number')b.p=p;b.sub=true;n++}
    // v3.65 伺服器自己算攻擊力，武器要先存進雲端；還沒存到就等下一輪，10 分鐘都找不到（已熔解）或類別不符就放棄
    catch(e){if(/weapon not saved/.test(e.message)){if(Date.now()-(b.at||0)>6e5)b.sub=true;continue}if(/bad weapon|bad village/.test(e.message)){b.sub=true;continue}return}}
  if(n){save();lbFetch(true)}}
if(typeof window!=='undefined')setInterval(()=>{if(AUTH&&CLOUD.ready&&!document.hidden){lbSync();if(ui.sheet&&/^lb/.test(ui.sheet.t))lbFetch()}},30000);
function lbRecord(s,i,w){const p=power(w),b=s.best[i];if(!b||p>b.p){s.best[i]={p,b:w.b,q:w.q,lv:w.lv,rf:w.rf||0,traits:JSON.parse(JSON.stringify(w.traits||[])),ench:JSON.parse(JSON.stringify(w.ench||[])),sub:false,at:Date.now()};if(typeof window!=='undefined'&&s===S)setTimeout(lbSync,500)}}   // 存一份當時的武器內容，排行榜可以點開看
const lbRank=i=>{const b=S.best[i];if(LB_OFF||!b||(AUTH&&!LBR.t))return null;const t=lbMyT(i);return lbOthers(i).filter(x=>lbAhead(x,b.p,t)).length+1};
// 第一次衝進前 10／前 3／第 1 名各領一次
function lbReward(i){if(LB_OFF||!AUTH||!LBR.t)return[];const rk=lbRank(i);if(!rk)return[];const got=S.lbRw[i]=S.lbRw[i]||[];const out=[];
  for(const [t,r,n] of LB_RW)if(rk<=t&&!got.includes(t)){got.push(t);giveRw(r);out.push(n+'：'+Object.entries(r).map(([k,c])=>itemName(k)+' ×'+c).join('、'))}
  if(out.length)save();return out}

/* ---------- 規則 ---------- */
const W=id=>S.weapons.find(w=>w.id===id);
const cleared=()=>S.villages.filter(v=>v.status==='cleared').length;
const bpOf=w=>BP[w.b];
const ENH_MULT=[1,1.1,1.2,1.3,1.4,1.5,1.6,1.9,2.25,2.65,3.3,4,4.8];   // v4.50 規格表：+6 ×1.6、+7 ×1.9 … +12 ×4.8
function enhMult(lv){return ENH_MULT[Math.max(0,Math.min(MAX_LV,lv|0))]}
// v4.44 舊附魔刪除：狩獵時間、掉落、金幣類詞條一律 0（保留函式名，呼叫的地方不用全改）；屬性附魔不加攻擊力
const affixVal=()=>0,powAff=()=>0;
// 打中弱點的倍率：i＝村莊索引，怪物屬性的對手屬性＝弱點
const vWeak=i=>ELEM_OPP[MON_EL[i]],vRes=i=>MON_EL[i];   // v4.77 抗性＝怪物自己的屬性（拿同屬性會扣傷）
const weakMul=(i,w)=>{const e=elemOf(w);return !e?1:e.k===vWeak(i)?e.m:e.k===vRes(i)?e.r:1};
const vPow=(i,w)=>power(w)*weakMul(i,w)*raceMult(w,i);   // 在這座村莊的實際傷害（攻擊力 × 弱點／抗性倍率 × v4.46 相剋）
const weakChip=(i,w)=>{const k=vWeak(i),hit=w&&weakMul(i,w)>1;return k?`<span class="vweak ${hit?'hit':''}" title="弱點${hit?'（已打中）':''}"><i>弱點</i><span class="elc-${k}">${ELEM[k].n}</span></span>`:''};   // v4.44 村莊卡片的弱點提示
// v4.40 新武器系統（武器系統定案 §1、§5、§8）：攻擊力＝每秒傷害，已含附加效果平均（每次觸發多打 1.5 擊）；拿掉品質倍率（暫時沒有稀有度）
const CSPD={sword:1,axe:1.3,hammer:1.8,dagger:.6,polearm:1.2,bow:1.1,crossbow:1.6};   // 每幾秒攻擊 1 次
const PROC={sword:['會心','這一下 ×2.5'],axe:['流血','之後再掉 3 次血'],hammer:['震碎','之後 3 下各 +50%'],dagger:['中毒','之後再掉 5 次血'],
  polearm:['貫穿','追加一次 ×1.5'],bow:['穿心','這一下 ×2.5'],crossbow:['破甲','之後 6 下各 +25%']};
const procP=lv=>lv<=0?0:lv<=6?lv*.02:[.16,.2,.25,.3,.35,.4][Math.min(5,lv-7)];   // 附加效果觸發機率：+1～+6 每級 2%，+7 起 16/20/25/30/35/40%
const procE=lv=>1+1.5*procP(lv);
function power(w,lv){const b=bpOf(w);lv=lv??w.lv;return Math.round(b.base*TIERS[b.t].mult*enhMult(lv)*procE(lv)*bossE(b)*(1+powAff(w)/100)*(1+cxPct()/100))}   // v4.72 圖鑑加成
const hitDmg=(w,lv)=>Math.round(power(w,lv)*(CSPD[bpOf(w).cat]||1)/procE(lv??w.lv)/bossE(bpOf(w)));   // 單擊傷害（沒觸發附加效果時）
// 相剋（Mochi 選）：怪物分人形／野獸／巨型／亡靈（v4.78 飛行改亡靈：錘剋亡靈、弓改剋巨型），武器剋對應形態時傷害加成看強化等級（v4.79 Mochi 選中等遞增：+1～6 每級 1%、+7～9 每級 2%、+10～12 每級 3%，+12 為 21%），跟屬性弱點相乘
const RACE_N={man:'人形',beast:'野獸',giant:'巨型',undead:'亡靈'};
const CAT_RACE={sword:'man',dagger:'man',polearm:'beast',axe:'beast',hammer:'undead',crossbow:'giant',bow:'giant'};
const raceOf=w=>CAT_RACE[bpOf(w).cat]||null;
const RACE_PCT=[0,1,2,3,4,5,6,8,10,12,15,18,21];   // v4.79 強化 +0～+12 的相剋加成 %
const raceBonus=(w,lv)=>raceOf(w)?RACE_PCT[Math.min(12,Math.max(0,lv??w.lv|0))]:0;   // %
const raceMult=(w,i)=>raceOf(w)&&MON_RACE[i]===raceOf(w)?1+raceBonus(w)/100:1;
// 武器名稱「+7 寒霜 鐵劍」（Mochi：強化階段／附魔名稱／武器名稱）；屬性附魔由屬性那一版提供 elemOf(w)，還沒有時當作無屬性
const wElem=w=>typeof elemOf==='function'?elemOf(w):null;
const wName=w=>{const e=wElem(w);return `<span class="lvt">+${w.lv|0}</span> ${e?`<span class="wn-el e-${e.k} t${e.t}">${e.tn}</span> `:''}<span class="${lc(w)}">${esc(bpOf(w).n)}</span>`};
const stable=w=>TIERS[bpOf(w).t].stable;
const where=w=>S.villages.findIndex(v=>v.weaponId===w.id);
function timeReduction(i,w){const v=VILLAGES[i];let r=affixVal(w,'swift');return Math.min(CAP.time,r)/100}
// v3.84 每輪金幣倍率：巨人獵手（巨人村莊）×（貪婪＋堅固，上限 40%）× 剋巨人／剋龍（對應村莊，數值＝金幣 %）
function goldMul(i,w){if(!w)return 1;const v=VILLAGES[i];let g=Math.min(CAP.greed,affixVal(w,'greed'));if(v.tag==='giant'||v.tag==='dragon')g+=affixVal(w,v.tag);
  return 1+g/100}
function gameDur(i,w,strat){return vSec(i,w)*1000*STRATS[strat||S.villages[i].strat].time}   // v4.52 一輪＝打倒一隻怪物的時間
const dur=(i,w,strat)=>gameDur(i,w,strat)/S.speed;
const capCycles=(i,w)=>Math.max(1,Math.floor(S.capH*3600000/gameDur(i,w)));
// v4.37 村莊不限武器（Mochi：不限類別、不限攻擊力、不限附魔）：任何武器都能交；v.req 只留給狩獵時間計算，v.cat／v.need 只留給故事和難度曲線
function eligible(i,w){return !w.test&&bossSlotOf(w)<0}
// v3.64 紅點提醒：只在「有事可以做」時亮
// 可交付：未解鎖以外的村莊，「等待交付／沒有駐守」門檻 -1；v3.79 已有駐守就不亮紅點（道具欄有更強的只在村莊卡顯示「可以換」標籤，玩家可能要留給別的村莊）
const giveMin=()=>S.villages.map(st=>{if(st.status==='locked')return null;const c=st.weaponId!=null&&W(st.weaponId);return c?null:-1});
function canGive(w,gm=giveMin()){return where(w)<0&&gm.some((m,i)=>m!=null&&eligible(i,w)&&power(w)>m)}
const vGiveDot=(i,gm=giveMin())=>gm[i]!=null&&S.weapons.some(w=>where(w)<0&&eligible(i,w)&&power(w)>gm[i]);
const anyGive=()=>{const gm=giveMin();return S.weapons.some(w=>canGive(w,gm))};
// 新武器（鍛造完成、交易所買到）：離開道具欄才算看過
const wNew=w=>!w.test&&w.id>(S.seenW??(S.seenW=S.nextId-1));
// 新圖紙：點選過才算看過（舊存檔第一次讀取時，已解鎖的都算看過）
const bpSeen=()=>S.bpSeen||(S.bpSeen=BPS.filter(b=>!bpLock(b)).map(b=>b.id));
const bpNew=b=>!bpLock(b)&&!bpSeen().includes(b.id);
// 學徒有空、有圖紙材料夠打
const forgeIdle=()=>!S.jobs.length&&S.weapons.length+queuedQty()<CAP_WEAPONS&&BPS.some(b=>!bpLock(b)&&!lackList(recipe(b),goldOf(b)).length);
const monthlyDot=()=>monthlyOn()?S.monthly.last!==today():BETA;
const achReadyN=()=>ACH.filter(a=>!S.ach[a.id]&&a.test()).length;
const forgedN=()=>S.stats.forged.reduce((a,b)=>a+b,0);
function dailyRoll(){if(S.daily&&S.daily.d===today())return;S.daily={d:today(),b:{harvest:S.stats.harvest,forged:forgedN(),enhTry:S.stats.enhTry,melted:S.stats.melted},box:[]}}
const dailyP=q=>{dailyRoll();return Math.max(0,Math.min(q.m,q.p()))};
const dailyPts=()=>DAILY.reduce((a,q)=>a+(dailyP(q)>=q.m?q.pt:0),0);
const boxReady=i=>dailyPts()>=DAILY_BOX[i][0]&&!S.daily.box.includes(i);
const boxReadyN=()=>DAILY_BOX.filter((b,i)=>boxReady(i)).length;
const signReady=()=>S.sign.last!==today();
const questDotN=()=>achReadyN()+boxReadyN();   // v4.59 七日簽到搬到商城
function giveRw(r){for(const k in r){if(k==='gold')S.gold+=r[k];else if(k==='gems')S.gems+=r[k];else if(MATS[k])S.mats[k]+=r[k];else if(ITEMS[k])S.items[k]=(S.items[k]||0)+r[k]}}
const rwName=k=>k==='gold'?'金幣':k==='gems'?'鑽石':itemName(k);
const rwIcon=k=>k==='gold'?'it_gold':k==='gems'?'it_gems':MATS[k]?MATART[k]:(ITEMS[k]&&ITEMS[k][1])||'it_gold';
const rwText=r=>Object.entries(r).map(([k,n])=>rwName(k)+' ×'+fmt(n)).join('、');
function claimBox(i){if(!boxReady(i))return null;const r=DAILY_BOX[i][1]();S.daily.box.push(i);giveRw(r);save();return r}
function claimSign(){if(!signReady())return null;const r=SIGN[S.sign.n%SIGN.length];S.sign.n=S.sign.n%SIGN.length+1;S.sign.last=today();giveRw(r);save();return r}
function breakChance(w,next){const s=stable(w);return next<=s?0:next<=9?1:2/3}   // v4.50 失敗後爆裝：+7～+9 失敗就爆；+10～+12 失敗 1/3 維持、2/3 爆（整體 33%／66%）
// v3.50 平衡：安全區（+1～+6）便宜好衝，危險區有代價，高等級是長期目標；再乘材質倍率
function enhCost(w){return 1}   // v4.50 每次強化 1 顆強化石，不花金幣
function enchCost(w,directed){return 40*TIERS[bpOf(w).t].mult*(directed?3:1)}
function qualWeights(useBp,t){if(useBp)return[0,0,0,0,1000];const s=0;   // v4.36 鐵砧拿掉：品質機率固定 Lv1
  const q=QW.map((x,i)=>x+QSHIFT[i]*s);
  const x=Math.round(tal('qual')*10);if(x){q[0]-=x;q[1]+=x*.6;q[2]+=x*.3;q[3]+=x*.1}   // 天賦「巨匠之手」：普通的權重移給精良以上，總和不變
  if(t>=3){q[0]=0;q[1]=0}return q}
const FORGE_SEC=5;   // v3.78 拿掉武器學徒：鍛造一律 5 秒、一次一批（批量也是 5 秒）；舊存檔的 S.slots 只留著算鐵匠等級
const forgeSec=b=>FORGE_SEC;
const hasMats=c=>Object.entries(c).every(([k,n])=>S.mats[k]>=n);
// v3.59 列出缺少的材料／金幣（鍛造按鈕、提示共用）
// v4.07 難度曲線：第 i 關剛開放時（已收復 i 座）能做的最強同類圖紙、普通 +0 攻擊力、曲線需求、各品質要強化幾級
function diffRow(i){const v=VILLAGES[i],fz=WS_GATE.furnace.reduce((m,g,L)=>L&&i>=g?L:m,1);
  const b=BPS.filter(x=>x.unlock<=i&&TIERS[x.t].furnace<=fz).sort((x,y)=>y.base*TIERS[y.t].mult-x.base*TIERS[x.t].mult)[0];
  const p=b?b.base*TIERS[b.t].mult:0,r=i%10,f=(i<10?DIFF_R1:DIFF_CURVE)[r],curve=i?Math.round(p*f):v.req;
  const need=QUAL.map(q=>{for(let lv=0;lv<=MAX_LV;lv++)if(Math.round(p*q.m*enhMult(lv))>=v.req)return lv;return null});
  return{v,b,p,f,curve,need}}
let DEV_LACK=0;   // 開發者工具「缺料提示測試」：暫時當作材料全部不夠（不動存檔）
const lackList=(need,g)=>{const hv=k=>DEV_LACK>Date.now()?0:S.mats[k]||0;const l=Object.entries(need).filter(([k,n])=>!(hv(k)>=n)).map(([k,n])=>[k,n-hv(k)]);if(S.gold<g)l.push(['gold',g-S.gold]);return l};
const lackStr=l=>l.map(([k,n])=>(k==='gold'?'金幣':MATS[k])+' ×'+fmt(n)).join('、');
const monthlyOn=()=>S.monthly.until>NOW();
const slotOpen=s=>s===0;   // v4.44 屬性附魔只有 1 欄
function bpLock(b){if(cleared()<b.unlock)return'收復 '+vNo(b.unlock-1)+' 解鎖';return''}   // v4.36 熔爐拿掉：圖紙只看收復關卡
const bulkOn=()=>cleared()>=5;
function dropChance(i,w,d,strat){const st=STRATS[strat];const loot=w?Math.min(CAP.loot,affixVal(w,'loot'))/100:0;const rare=d[1]<RARE_P;
  let p=d[1]*(1+loot)*(rare?st.rare*(1+(w?Math.min(CAP.treasure,affixVal(w,'seek')):0)/100)*(1+tal('rare')/100):st.common*(1+tal('mats')/100))*grMul(i);return Math.min(rare?.6:1,p)}   // v4.71 乘評級倍率
function eventChance(){return 0}   // v3.84 受襲機制刪除（Mochi 2026-10-22）；VILLAGES 的 danger 欄位留著不用

/* 純函式：方便測試 */
function rollQuality(useBp,t){const qs=qualWeights(useBp,t);return weighted([0,1,2,3,4],x=>qs[x])}
function rollEnhance(r,bc){const ok=Math.random()<r;if(ok)return'ok';return Math.random()<bc?'break':'fail'}

/* ---------- 行動（核心，不碰畫面） ---------- */
function makeWeapon(b,q,lv=0,traits,ench){b=bpId(b);const w={id:S.nextId++,b,q,lv,traits:traits||[],ench:ench||[null,null,null,null],created:NOW()};S.weapons.push(w);return w}
function rollCycle(i,w,st,t){
  const v=VILLAGES[i],s=STRATS[st.strat],b=st.bank;b.cycles++;const x2=1;   // v3.87 取消雙倍收成（首領改整週）
  const gm=grMul(i),gs=goldMul(i,w)*gm,kg=KILL_GOLD[i]?rnd(...KILL_GOLD[i]):vKillGold(i);b.gold+=Math.round(kg*s.gold*gs*(1+(tal('gold')+gdGold())/100))*x2;   // v4.71 gm＝評級倍率（金幣和下面所有掉落機率）   // v3.98 加上公會加成
  for(const d of v.drops){if(Math.random()<dropChance(i,w,d,st.strat)){let n=rnd(d[2],d[3]);if(d[1]>=RARE_P&&s.bonus&&Math.random()<s.bonus)n++;if(d[1]>=RARE_P&&w&&Math.random()<Math.min(CAP.harvest,affixVal(w,'harvest'))/100)n++;if(d[1]>=RARE_P)n*=x2;b.mats[d[0]]=(b.mats[d[0]]||0)+n}}
  const se=stoneE(i)*gm,sn=Math.floor(se)+(Math.random()<se%1?1:0);if(sn)b.mats[STONE]=(b.mats[STONE]||0)+sn;
  if(Math.random()<enchE(i)*gm)b.mats[ENSTONE]=(b.mats[ENSTONE]||0)+1;   // v4.54 附魔石
  if(Math.random()<RELIC_P*gm){const k=relicTier(i);b.mats[k]=(b.mats[k]||0)+1}   // v4.54 英靈・遺物
  for(const [k,p] of wDrops(i))if(Math.random()<p*gm){const id=k==='_w0'?WD_START[rnd(0,WD_START.length-1)]:k;b.mats['w:'+id]=(b.mats['w:'+id]||0)+1}   // v4.66 直接掉武器
}
// v4.66 Mochi 選「照建議值」（填寫：各關掉落）：每打倒一隻直接掉武器。開局 7 種（第一界，隨機一把）0.2%；該界一般武器圖紙解鎖後每種 0.15%；怪物專屬武器在那一關 0.3%；Boss 武器在那一關 0.1%
// 收成時放進道具欄（存在 bank.mats 的 'w:圖紙 id'）；道具欄滿了就照熔解換成金幣＋1 顆強化石
const WDROP={start:.002,normal:.0015,m:.003,b:.001},WD_START=BPS.filter(b=>!b.dev&&!b.unlock).map(b=>b.id);
function wDrops(i){const r=Math.floor(i/10),out=r===0&&WD_START.length?[['_w0',WDROP.start]]:[];
  for(const b of BPS){if(b.dev||!b.unlock)continue;if(b.k==='m'||b.k==='b'){if(b.unlock-1===i)out.push([b.id,WDROP[b.k]])}else if(Math.floor((b.unlock-1)/10)===r&&!bpLock(b))out.push([b.id,WDROP.normal])}
  return out}
const enchE=i=>.003*(1+.01*i);   // v4.54 每打倒一隻掉附魔石的機率：1-1 0.3%，每往後一關多 1%（跟強化石同一個公式）
// v4.54 英靈・遺物（武器系統定案 9-5，Mochi 選「每關都掉 4 種，後面關好箱多」）：每打倒一隻 2% 掉 1 個，等級照關卡在該界的位置（第 1→10 關）平均變化，每往後一界紅光 +1%、金光 +0.5%（從綠光扣）
const RELIC_P=.02;
function relicOdds(i){const p=(i%10)/9,r=Math.floor(i/10),L=(a,b)=>a+(b-a)*p;const red=L(5,18)+r,gold=L(1,7)+r*.5,blue=L(24,35);return{relic_g:100-blue-red-gold,relic_b:blue,relic_r:red,relic_y:gold}}
const relicTier=i=>{const o=relicOdds(i);return weighted(RELICS,k=>o[k])};
// 開出內容（定案 9-5 的表）：[金幣, 材料, 強化石, 附魔石, Boss 素材, 武器] 機率（%）；數量看打開時已收復的最遠關卡（材料、Boss 素材用那一界的）
const RELIC_TAB={relic_g:[50,35,12,2,0,1],relic_b:[30,35,25,6,0,4],relic_r:[15,25,35,12,5,8],relic_y:[0,10,30,20,15,25]};
const RELIC_K=['gold','mat','estone','enstone','boss','weapon'],RELIC_KN=['金幣','材料','強化石','附魔石','Boss 素材','武器'];
const RELIC_N={relic_g:{gold:20,mat:[4,6],estone:[1,1],enstone:[1,1],boss:[1,1]},relic_b:{gold:50,mat:[8,12],estone:[2,3],enstone:[1,2],boss:[1,1]},relic_r:{gold:120,mat:[15,25],estone:[4,6],enstone:[2,3],boss:[1,2]},relic_y:{gold:300,mat:[30,50],estone:[8,12],enstone:[3,5],boss:[2,4]}};
const relicTop=()=>Math.max(0,cleared()-1);   // 已收復的最遠關卡（還沒收復任何村莊就當 1-1）
function relicRoll(k,got){const top=relicTop(),r=Math.floor(top/10),N=RELIC_N[k],tab=RELIC_TAB[k];let c=weighted([0,1,2,3,4,5],x=>tab[x]);
  const bossK=MAT_EXTRA[r*10+9]&&MAT_EXTRA[r*10+9][0],pool=BPS.filter(b=>!b.dev&&b.k!=='b'&&b.unlock>0&&!bpLock(b)&&Math.floor((b.unlock-1)/10)===r);
  if(c===4&&!bossK)c=1;if(c===5&&(!pool.length||S.weapons.length>=CAP_WEAPONS))c=1;   // 這一界沒有 Boss 素材／沒有可開的武器或道具欄滿了 → 改給材料
  const add=(x,n)=>got[x]=(got[x]||0)+n;
  if(c===0)add('gold',vKillGold(top)*N.gold);
  else if(c===1){const rm=REALM_MAT[r]||REALM_MAT[0];add(rm[rnd(0,rm.length-1)],rnd(...N.mat))}
  else if(c===2)add(STONE,rnd(...N.estone));else if(c===3)add(ENSTONE,rnd(...N.enstone));else if(c===4)add(bossK,rnd(...N.boss));
  else{const b=pool[rnd(0,pool.length-1)],w=makeWeapon(b.id,0,0,[]);(got._w=got._w||[]).push(w.id)}
  return c}
// 打開 n 個（0＝全部）：直接入帳，回傳開到的東西（_w＝武器 id）
function relicOpenCore(k,n){const have=S.items[k]|0;if(!RELICS.includes(k)||!have)return null;n=n?Math.min(n,have):have;const got={};
  for(let x=0;x<n;x++){S.items[k]--;relicRoll(k,got)}
  for(const x in got){if(x==='_w')continue;if(x==='gold')S.gold+=got[x];else if(ITEMS[x])S.items[x]=(S.items[x]||0)+got[x];else S.mats[x]=(S.mats[x]||0)+got[x]}
  save();return{n,got}}
const stoneE=i=>.002*(1+.01*i);   // v4.65 Mochi 選 C：全部村莊都掉、機率減半（武器系統定案 9-7）：1-1 0.2%，每往後一關多 1%（9-10 約 0.38%）
function tick(){
  const t=NOW();let changed=false;
  if(t<S.lastSeen-5000){if(!S.clockWarn){S.clockWarn=true;toast('偵測到裝置時間倒退，狩獵與鍛造會暫停，直到時間恢復。')}}
  else if(S.clockWarn&&t>=S.lastSeen){S.clockWarn=false}
  S.lastSeen=Math.max(S.lastSeen||0,t);
  S.villages.forEach((st,i)=>{
    if(st.weaponId==null||st.cycleStart==null)return;const w=W(st.weaponId);if(!w){st.weaponId=null;st.cycleStart=null;return}
    const d=dur(i,w),cap=capCycles(i,w);if(st.bank.cycles>=cap){st.cycleStart=Math.max(st.cycleStart,t);return}
    const k=Math.floor((t-st.cycleStart)/d);if(k<=0)return;
    const n=Math.min(k,cap-st.bank.cycles);for(let c=0;c<n;c++)rollCycle(i,w,st,st.cycleStart+(c+1)*d);
    st.cycleStart+=k*d;if(st.bank.cycles>=cap)st.cycleStart=t;changed=true;
  });
  for(const j of [...S.jobs])if(t>=j.end){finishJob(j);changed=true}
  return changed;
}
function finishJob(j){
  const ix=S.jobs.indexOf(j);if(ix<0)return;S.jobs.splice(ix,1);const b=BP[j.b];let best=null;
  for(let n=0;n<(j.qty||1);n++){let q=rollQuality(j.bp&&n===0,b.t);
    if(b.t>=1){if(q>=2)S.pity=0;else if(++S.pity>=PITY_FORGE){q=2;S.pity=0}} /* 霜銀以上：連續 9 把低於稀有，第 10 把保證稀有 */
    S.stats.forged[q]++;const w=makeWeapon(b.id,q);if(!best||q>best.q)best=w}
  repGain(REP_XP.forge[b.t]*(j.qty||1));
  snd('forge_done');toast(`鍛造完成：${j.qty>1?j.qty+' 把 '+b.n+'，最佳 ':''}<b class="${lc(best)}">${b.n}</b>（攻擊力 ${power(best)}）`);save();return best;
}
function forgeStart(bid,qty,useBp){
  const b=BP[bid];if(!b)return'沒有這張圖紙';if(bpLock(b))return bpLock(b);qty=bulkOn()?Math.max(1,Math.min(10,Math.floor(qty)||1)):1;
  const c=recipe(b),need={};for(const k in c)need[k]=c[k]*qty;const g=goldOf(b)*qty;
  if(S.jobs.length)return'正在鍛造中，稍等幾秒';{const ls=lackList(need,g);if(ls.length)return'缺少：'+lackStr(ls)}
  if(S.weapons.length+S.jobs.reduce((a,j)=>a+(j.qty||1),0)+qty>CAP_WEAPONS)return'道具欄已滿（'+CAP_WEAPONS+' 把），先熔解一些武器';
  for(const k in need)S.mats[k]-=need[k];S.gold-=g;
  const bp=false;
  const s=NOW(),len=forgeSec(b)*1000/S.speed;
  const j={b:b.id,qty,start:s,end:s+len,bp,cost:{mats:need,gold:g}};S.jobs.push(j);save();return j;
}
function cancelJob(ix){const j=S.jobs[ix];if(!j)return false;S.jobs.splice(ix,1);
  if(j.cost){for(const k in j.cost.mats)S.mats[k]+=j.cost.mats[k];S.gold+=j.cost.gold}save();return true}
function collectCore(i){const st=S.villages[i],b=st.bank;if(!b.cycles)return null;
  const got={gold:b.gold,...b.mats},n=b.cycles,ev=b.events;
  S.gold+=b.gold;for(const k in b.mats){if(k.startsWith('w:')){const id=k.slice(2);for(let x=0;x<b.mats[k];x++){if(S.weapons.length<CAP_WEAPONS&&BP[id])makeWeapon(id,0,0,[]);else{const g=BP[id]?Math.round(goldOf(BP[id])*.5):0;S.gold+=g;got.gold+=g;got[k]--;S.items[STONE]=stones()+1;got[STONE]=(got[STONE]||0)+1}}continue}if(ITEMS[k])S.items[k]=(S.items[k]||0)+b.mats[k];else S.mats[k]=(S.mats[k]||0)+b.mats[k]}S.stats.harvest+=n;S.stats.goldIn+=b.gold;S.stats.events+=ev;repGain(n*REP_XP.harvest);
  st.bank={cycles:0,gold:0,mats:{},events:0};
  if(st.weaponId!=null&&st.cycleStart!=null){const w=W(st.weaponId);if(w&&n>=capCycles(i,w))st.cycleStart=NOW()}
  save();return{got,n,ev}}
function setStrategy(i,k){const st=S.villages[i];if(!STRATS[k]||st.strat===k)return false;tick();st.strat=k;if(st.cycleStart!=null)st.cycleStart=NOW();save();return true}
// v3.50 第一次收復村莊的金幣獎勵（伺服器存檔檢查有同一張表）
const FIRST_GOLD=[300,500,800,1200,2000,3000,5000,8000,12000,0,15000,18000,21000,24000,27000,30000,35000,40000,45000,50000];
function deliverCore(i,id){
  const w=W(id);if(!w||!eligible(i,w)||S.villages[i].status==='locked')return null;
  const old=where(w);if(old>=0&&old!==i){tick();S.villages[old].weaponId=null;S.villages[old].cycleStart=null}
  const st=S.villages[i];tick();st.weaponId=id;st.cycleStart=NOW();let first=false;lbRecord(S,i,w);
  let fg=0;if(st.status!=='cleared'){st.status='cleared';first=true;fg=FIRST_GOLD[i]||0;S.gold+=fg;repGain(REP_XP.first*(i+1));const nx=S.villages[i+1];if(nx&&nx.status==='locked')nx.status='open'}
  save();return{first,fg};
}
// v4.52 限時挑戰（核心，不碰畫面）：事先排好每一下的時間和傷害（跟戰鬥畫面騎士打中那一格對齊），60 秒內累積傷害 ≥ 血量就收復
function chPlan(i,w,t0=0){const hs=knHit(w)||hitOf(w),b=bpOf(w),hp=VHP(i),unit=hitDmg(w)*weakMul(i,w)*raceMult(w,i),st={},ev=[];
  const first=hs.ph!=null?knNext(hs,t0)-t0:hs.iv*.5;
  for(let k=0;first+k*hs.iv<=CH_SEC*1000;k++){const ta=first+k*hs.iv;
    for(const [d,m,kind,lab] of hs.plan(st)){let dm=unit*m,lb=lab;const dot=kind==='bleed'||kind==='poison';
      if(b.fx&&!dot&&Math.random()<BOSS_FX.p){dm*=1+BOSS_FX.m;lb=b.fx}   // Boss 武器專屬特效
      ev.push([ta+d,Math.max(1,Math.round(dm)),kind||'hit',lb||''])}}
  ev.sort((x,y)=>x[0]-y[0]);let sum=0,win=null;const out=[];
  for(const e of ev){if(e[0]>CH_SEC*1000)break;out.push(e);sum+=e[1];if(sum>=hp){win=e[0];break}}
  return{hp,ev:out,win}}
// v4.71 sec＝打倒秒數，給評級；只記最好成績，首次收復獎勵 ×評級倍率，之後打到倍率更高的評級補差額（st.fgm＝已發的倍率）
function chWinCore(i,sec){const st=S.villages[i];if(!st||st.status==='locked')return null;let first=false,fg=0;
  const g=sec==null?2:grOf(sec)??GRADES.length-1,prev=st.gr??null,better=prev==null||g<prev,fm=GRADES[g].f,F=FIRST_GOLD[i]||0;if(better)st.gr=g;
  if(st.status!=='cleared'){st.status='cleared';first=true;fg=Math.round(F*fm);st.fgm=fm;repGain(REP_XP.first*(i+1));const nx=S.villages[i+1];if(nx&&nx.status==='locked')nx.status='open'}
  else if(fm>(st.fgm||1)){fg=Math.round(F*(fm-(st.fgm||1)));st.fgm=fm}
  S.gold+=fg;save();return{first,fg,g,prev,better,bps:first?BPS.filter(b=>!b.dev&&b.unlock===i+1):[]}}
// 聲望經驗：升級時發天賦點（由等級推算）和聲望寶箱，升級提示延後顯示，避免被收成／鍛造的提示蓋掉
function repGain(n){const r=S.rep;if(!r||!(n>0)||QUIET)return 0;   // 快速測試（QUIET）不加聲望，避免寶箱道具干擾其他測試的計數
  r.xp+=Math.floor(n);let up=0;const got={};
  while(r.xp>=repNeed(r.lv)){r.xp-=repNeed(r.lv);r.lv++;up++;const bx=repBox(r.lv);for(const k in bx){S.gold+=bx[k];got[k]=(got[k]||0)+bx[k]}}
  if(up&&!repGain.mute&&typeof toast==='function')setTimeout(()=>{toast(`鐵匠聲望升到 Lv.${r.lv}！獲得 ${up} 天賦點<br>聲望寶箱：${Object.entries(got).map(([k,v])=>(k==='gold'?'金幣':itemName(k))+' ×'+fmt(v)).join('、')}`,'ok');if(typeof snd==='function')snd('unlock')},600);
  return up}
function talentUp(k){const T=TALENTS[k];if(!T)return'沒有這個天賦';if(repPts()<1)return'天賦點不夠';if(S.rep.t[k]>=T.max)return'已經滿級';S.rep.t[k]++;save();return''}
// v3.85 駐守首領（本機核心）：空位才能派；村莊駐守中的武器會先收回
function bossPostCore(id,slot){const e=evtNow(),v=evtSt(),w=W(id);if(!w||w.test)return{err:'找不到這把武器'};
  if(bossSlotOf(w)>=0)return{err:'這把武器已經在打首領了'};if(slot==null)slot=v.slots.findIndex(x=>!x);if(slot<0||slot>=BOSS_SLOTS||v.slots[slot])return{err:'首領駐守位已滿，先收回一把'};
  const vi=where(w);if(vi>=0)recallCore(vi);v.slots[slot]={id,at:NOW(),pw:bossDmgOf(w,e.boss)};save();return{slot,pw:v.slots[slot].pw,weak:bossWeak(w,e.boss),vi}}
function bossUnpostCore(slot){const v=evtSt(),x=v.slots[slot];if(!x)return null;const d=bossAcc(x);v.dmg+=d;v.slots[slot]=null;save();return{dmg:d}}


function giveGift(g){giveRw(g);return g}
const giftTxt=g=>Object.entries(g).map(([k,n])=>(k==='gold'?'金幣':k==='gems'?'鑽石':itemName(k))+' ×'+fmt(n)).join('、');
// v3.72 全服血條（Supabase boss 表）；v3.85 駐守首領由 boss_post／boss_unpost 記錄，傷害由伺服器按時間算（10 SQL）
const BOSS_G={t:0,b:null,prev:null,loading:false,err:''};
const bossErr=m=>/weapon busy/.test(m)?'這把武器正在村莊或首領駐守中':/weapon not saved/.test(m)?'這把武器還沒存到雲端，請稍後再試':/session/.test(m)?'帳號已在別的裝置登入':'操作失敗：'+SB_ERR(m);
async function bossBoard(force){if(!AUTH||BOSS_G.loading||(!force&&Date.now()-BOSS_G.t<30000))return;BOSS_G.loading=true;
  try{const wk=evtWeek();BOSS_G.b=await sbRest('rpc/boss_board',{method:'POST',body:JSON.stringify({p_week:wk})});
    if(S.evtRk!==wk-1&&(!BOSS_G.prev||BOSS_G.prev.week!==wk-1))BOSS_G.prev=await sbRest('rpc/boss_board',{method:'POST',body:JSON.stringify({p_week:wk-1})});BOSS_G.err=''}catch(e){BOSS_G.err=SB_ERR(e.message)}
  BOSS_G.loading=false;BOSS_G.t=Date.now();render()}
const bossW=w=>({id:w.id,b:w.b,q:w.q,lv:w.lv,rf:w.rf||0,traits:w.traits||[],ench:w.ench||[]});
// 登入時：先在本機派遣（村莊的會先收回），存檔上傳後再通知伺服器；伺服器失敗就退回本機的派遣
async function bossPostCloud(id){const r=bossPostCore(id);if(r.err)return r;const w=W(id);
  const call=()=>sbRest('rpc/boss_post',{method:'POST',body:JSON.stringify({p_sid:SID,p_slot:r.slot,p_w:bossW(w),p_nick:S.nick||'無名鐵匠'})});
  let sv=null;try{if(r.vi>=0)await cloudPush(true);sv=await call()}catch(x){const m=String(x.message||'');let ok=false;
    if(/weapon not saved|weapon busy/.test(m)){try{await cloudPush(true);sv=await call();ok=true}catch(y){x=y}}
    if(!ok){const v=evtSt();v.slots[r.slot]=null;save();return{err:bossErr(String(x.message||''))}}}
  const x=evtSt().slots[r.slot];if(sv&&sv.pw>0&&x){x.pw=r.pw=sv.pw;save()}   // 以伺服器算的每小時傷害為準
  bossBoard(true);return r}
async function bossUnpostCloud(slot){try{await sbRest('rpc/boss_unpost',{method:'POST',body:JSON.stringify({p_sid:SID,p_slot:slot})})}catch(x){const m=String(x.message||'');if(!/no post/.test(m))return{err:bossErr(m)}}
  const r=bossUnpostCore(slot);bossBoard(true);return r||{dmg:0}}





// 全服階段：本週有駐守過（伺服器有我的傷害）才能領，一次領完所有已達成的階段
const bossBoardNow=()=>{const g=BOSS_G.b;return g&&g.week===evtSt().wk?g:null};
const bossStageN=()=>{const g=bossBoardNow(),v=S.evt;if(!g||!g.mine||!v)return 0;return BOSS_GSTAGE.filter(([f])=>g.total>=g.hp*f).length-(v.gs|0)};
function bossClaimStages(){const n=bossStageN();if(n<=0)return null;const v=evtSt(),b=evtNow().boss,got={};
  for(let k=v.gs;k<v.gs+n;k++){const g=stageGift(BOSS_GSTAGE[k][1],b);for(const x in g)got[x]=(got[x]||0)+g[x]}v.gs+=n;giveGift(got);save();return got}
// 上週排名獎勵：上週的首領素材；S.evtRk＝已領過的週次
function bossRankTier(){const g=BOSS_G.prev;if(!g||!g.mine||S.evtRk===g.week||g.week!==evtWeek()-1)return null;const t=BOSS_RANK.find(([m])=>g.rank<=m);
  const b=EVT_BOSS[((g.week%EVT_BOSS.length)+EVT_BOSS.length)%EVT_BOSS.length];return{t,b,g,gift:stageGift(t[2],b)}}
function bossClaimRank(){const r=bossRankTier();if(!r)return null;S.evtRk=r.g.week;giveGift(r.gift);save();return r}
function recallCore(i){const st=S.villages[i];if(st.weaponId==null)return false;tick();st.weaponId=null;st.cycleStart=null;save();return true}
function meltCore(id){const w=W(id);if(!w||busyW(w)||w.lock)return null;if(w.test){S.weapons.splice(S.weapons.indexOf(w),1);save();return{}}const b=bpOf(w),c=recipe(b),got={gold:Math.round(goldOf(b)*.5),[STONE]:1};   // v4.50 熔解退 1 顆強化石
  S.gold+=got.gold;S.items[STONE]=stones()+1;S.weapons.splice(S.weapons.indexOf(w),1);S.stats.melted++;repGain(REP_XP.melt);save();return got}
// 強化判定（唯一入口）。所有費用都用 enhCost；道具不足時直接拒絕，不會默默改成無保護強化。
// 測試武器（w.test）：不扣任何資源、不計入統計，可接受開發工具指定的結果，避免動到正式資料。
function enhanceCore(id,opt={}){
  const w=W(id);if(!w)return{err:'找不到武器'};if(busyW(w))return{err:'駐守中的武器要先收回'};if(w.lv>=MAX_LV)return{err:'已經是最高等級 +'+MAX_LV};
  const next=w.lv+1,cost=enhCost(w),danger=next>stable(w),test=!!w.test;
  if(!test&&stones()<cost)return{err:'強化石不夠',need:STONE};
  if(!test){S.items[STONE]-=cost;S.stats.enhTry++}
  // v3.14：危險區勾選防爆卷，每次強化都消耗 1 張（不論成功、失敗或爆裝）
  const usedScroll=!!(opt.scroll&&danger&&test);   // v4.43 防爆卷刪除，只剩測試武器的開發選項
  let r=RATE[next];const bc=breakChance(w,next);
  let usedBless=false;if(opt.bless&&test){r=Math.min(1,r+.1);usedBless=true}
  const f=test?opt.force:null;
  const out=f==='ok'?'ok':f==='fail'?'fail':(f==='break'||f==='saved')?'break':rollEnhance(r,bc),before={art:A(w.b),name:bpOf(w).n,q:w.q,from:w.lv,tier:bpOf(w).t};
  if(out==='ok'){w.lv=next;if(!test){S.stats.enhOk++;S.stats.maxLv=Math.max(S.stats.maxLv,next);newsQueue(w.b,next,true);repGain(next)}save();return{k:'ok',next,danger,before,usedBless,usedScroll,w,test}}
  if(!test)S.stats.enhFail++;
  if(out==='break'){
    if(f==='saved'||(f!=='break'&&usedScroll)){save();return{k:'saved',next,danger,before,usedBless,usedScroll,test}}
    S.weapons.splice(S.weapons.indexOf(w),1);if(!test){S.stats.breaks++;newsQueue(w.b,next,false)}save();return{k:'broke',next,danger,before,usedBless,test}}
  save();return{k:'fail',next,danger,before,usedBless,usedScroll,test};
}
function enchantCore(id,slot=0){   // v4.44 屬性附魔：只有 1 欄，隨機出 6 種屬性（平均）× 3 個等級（70：25：5），重抽會蓋掉舊的
  const w=W(id);if(!w)return{err:'找不到武器'};if(busyW(w))return{err:'駐守中的武器要先收回'};if(!slotOpen(slot))return{err:'這一格暫不開放'};
  const c=enchCost(w);   // v4.54 附魔＝1 顆附魔石＋金幣（Mochi 選）
  if(enStones()<1)return{err:'附魔石不夠'};if(S.gold<c)return{err:`需要 ${c} 金幣`};
  S.gold-=c;S.items[ENSTONE]--;const f=DEV.elForce;DEV.elForce=null;
  const k=f?f[0]:Object.keys(ELEM)[rnd(0,5)],v=f?f[1]:weighted([1,2,3],t=>ELEM_TW[t]);
  w.ench=[{k,v},null,null,null];save();return{k,v};
}
function claimAch(id){const a=ACH.find(x=>x.id===id);if(!a||S.ach[id]||!a.test())return false;S.ach[id]=true;
  giveRw(a.r);save();return true}
function spendGems(n){if(S.gems<n){toast('鑽石不夠，可以先用「儲值測試」補充。');return false}S.gems-=n;return true}

/* ---------- 行動（介面包裝） ---------- */
const DEV_KEY='nrs-dev';
try{if(localStorage.getItem(DEV_KEY)==='1'||/dev/.test(location.hash))devBps()}catch(e){}   // v4.40 開發者模式才有測試圖紙（要在讀存檔前放進去）
function devMode(){if(CLOUD_ONLY&&!CLOUD.admin)return false;   // v3.63 正式網站：只有管理員帳號（伺服器 admins 表）能開開發者工具
  try{return localStorage.getItem(DEV_KEY)==='1'||/dev/.test(location.hash)}catch(e){return false}}
function setDev(on){if(on)devBps();try{on?localStorage.setItem(DEV_KEY,'1'):localStorage.removeItem(DEV_KEY)}catch(e){};if(!on&&ui.sheet&&ui.sheet.t==='d')ui.sheet=null;render()}
const ui={tab:'forge',sheet:null,ftab:'bp',cat:'all',acat:'all',asort:'power',aidle:false,alock:false,bp:'',qty:1,useScroll:false,useBless:false,useBp:false,confirmReset:false,meltArm:null,enchSlot:0,testOut:'',busy:false,result:null};
const CAT_ICON=Object.fromEntries(['axe','sword','dagger','polearm','hammer','bow','crossbow','shield','throw','tool'].map(k=>[k,'cat_'+k]));
const STRAT_ICON={normal:'it_gold',material:'mat_iron',rare:'mat_scale'};
const TIER_FRAME=[0,2,3,4,4]; // 各材質對應的外框顏色（v3.77 起圖紙改用統一的圖紙底圖 frame:'bp'，這裡留給其他地方參考）
// v3.40 音效設定：喇叭圖示打開，可開關音效、調整音量
// v4.03 音效設定也放進齒輪設定頁：設定頁開著時只重畫設定頁
const sndHtml=()=>{const v=Math.round((S.vol??1)*100);return `<div class="snd-set"><div class="kv"><span>音效</span><b><button class="ui-btn ui-btn--chip chipbtn ${S.mute?'':'on'}" data-act="sndmute">${S.mute?'關閉':'開啟'}</button></b></div>
   <div class="kv"><span>音量</span><b class="snd-v">${v}%</b></div><input id="sndvol" type="range" min="0" max="100" step="5" value="${v}" ${S.mute?'disabled':''}>
   <div class="kv"><span>沒有聲音？</span><b><button class="ui-btn ui-btn--chip chipbtn" data-act="sndfix">修復音效</button></b></div>
   <div class="small muted">iPhone 切成靜音時，音效也會靜音。</div></div>`};
function sndSettings(){if(ui.sheet&&ui.sheet.t==='set')return render();ui.result={t:'info',k:'snd',title:'音效設定',html:sndHtml()};render()}
// v4.03 遊戲內公告＋玩法說明（Mochi 選：右上角齒輪取代喇叭、內容寫在程式裡、不自動跳出只亮紅點）
// 每次更新：在 NW_LOG 最上面加一則（g＝這次改到的玩法 key），並把 GUIDE 裡對應項目的內容和 v 改成新版本 → 沒看過的玩家會看到 NEW、齒輪亮紅點
const NW_LOG=[
 {v:'4.81',d:'10/25',t:'附魔防誤點',b:['武器已經是<b>三級屬性</b>時再按附魔，按鈕會先變成紅色的「<b>確定重抽</b>」，再按一次才會重抽，避免一直按不小心蓋掉','附魔後不再跳「附魔結果」提示，結果直接顯示在武器名稱','附魔小卡的武器名稱往下移一些，不會貼著標題'],g:['ench']},
 {v:'4.80',d:'10/25',t:'屬性加成調整',b:['打中怪物弱點改為 <b>+3%／+6%／+10%</b>（看附魔等級）','同屬性抗性改為 <b>−3%／−6%／−10%</b>','三對互剋、每一關的弱點都不變'],g:['ench']},
 {v:'4.79',d:'10/25',t:'型態相剋加成遞增',b:['武器剋怪物型態的加成改成<b>遞增</b>：+1～+6 每級 +1%、+7～+9 每級 +2%、+10～+12 每級 +3%','+6 為 6%（不變）、+9 為 12%、+12 為 <b>21%</b>（原本 12%），越敢衝強化回報越大'],g:['wpn']},
 {v:'4.78',d:'10/25',t:'飛行改成亡靈',b:['怪物型態的「飛行」改成<b>亡靈</b>：人形、野獸、巨型、亡靈','<b>錘剋亡靈</b>（雷神之錘聖化亡者），<b>弓改剋巨型</b>（跟弩一起）；劍、雙刀剋人形，長柄、斧剋野獸不變','亡靈關卡：1-2 不死野豬、1-5 戰場鴉魔、2-4 巨人屍鬼；2-3 吞屍巨鷹是巨人化身，改成巨型；1-6 克拉肯是海中巨獸，改成野獸','前 20 關：人形 4、野獸 5、巨型 8、亡靈 3'],g:['wpn']},
 {v:'4.77',d:'10/25',t:'同屬性抗性',b:['打中弱點改為 <b>+10%／+20%／+30%</b>（看附魔等級）','新增<b>同屬性抗性</b>：拿跟怪物一樣屬性的武器去打，傷害 −10%／−20%／−30%，附魔等級越高扣越多（例如火屬性打火焰騎兵）','三對互剋和每一關的弱點都不變；村莊詳情、附魔說明會寫出哪些關卡有抗性'],g:['ench']},
 {v:'4.76',d:'10/25',t:'屬性名稱統一',b:['屬性名稱全部統一成<b>火屬性、冰屬性、雷屬性、毒屬性、聖屬性、暗屬性</b>：附魔表、說明小卡、武器、村莊和怪物的弱點、首領都一樣','屬性說明小卡上方的大方塊拿掉，只留文字','村莊詳情除了弱點，也顯示<b>怪物本身的屬性</b>和<b>型態</b>（人形／野獸／巨型／飛行，武器相剋看這個）','附魔名稱（例如雷神之怒）不變'],g:['ench','hp']},
 {v:'4.75',d:'10/25',t:'武器小卡屬性更清楚',b:['武器小卡的「屬性」改叫「<b>附魔屬性</b>」，直接寫附魔名稱（例如<b>雷神之怒</b>），不再寫「雷霆 三級」，也不發光'],g:['ench']},
 {v:'4.74',d:'10/25',t:'附魔說明更好懂',b:['附魔表左邊的屬性改叫<b>火屬、冰屬、雷屬、毒屬、聖屬、暗屬</b>','附魔表上方只寫一級、二級、三級','加成一律寫成「<b>打中弱點傷害 +20%</b>」（二級 +40%、三級 +60%），不再用 ×1.2','點屬性跳出的說明小卡拿掉機率（附魔表上已經有），也不會再隔幾秒像重新打開一樣閃一下'],g:['ench']},
 {v:'4.73',d:'10/25',t:'秒殺榜',b:['60 秒挑戰打倒怪物會記下<b>最快秒數</b>（到 0.1 秒）和當時用的武器，只留最快那一次','20 關都有<b>全服秒殺榜</b>：前 50 名的秒數、評級和武器，還有自己的名次','打完挑戰的結算畫面和村莊詳情的「挑戰評級」都會顯示我的最快和全服最快，點一下打開秒殺榜','每一界第 9、10 關的王（穆斯貝爾騎兵、海姆達爾、赫朗格尼爾、索爾）：全服首殺和刷新第 1 名會上<b>跑馬燈</b>'],g:['vil']},
 {v:'4.72',d:'10/25',t:'武器圖鑑',b:['道具欄新增「<b>圖鑑</b>」分頁：把武器登錄進圖鑑，<b>那把武器會消失</b>，換到全帳號<b>所有武器攻擊力</b>永久加成','每把武器 3 格：+0 格 +0.2%、+6 格 +0.6%、+9 格 +1.5%（強化到那個等級以上就能登錄，自動挑等級最低的那把）','6 個套裝湊齊再加 +2%～+5%，例如「諸神之器」：霍夫德之劍、索爾之錘都登錄 +9 再 +5%','駐守中、鎖定的武器不能登錄；原本的「收藏」改叫「<b>鎖定</b>」'],g:['codex','bag','melt']},
 {v:'4.71',d:'10/25',t:'限時挑戰加上評級',b:['60 秒挑戰照打倒秒數給<b>評級</b>：SS 18 秒內、S 30 秒內、A 45 秒內、B 52 秒內、C 60 秒內','評級連動那一關的<b>掛機收益</b>：SS ×1.5、S ×1.25、A ×1、B ×0.85、C ×0.7（金幣和強化石、附魔石、遺物、武器的掉落機率）','SS、S 首次收復獎勵 ×2／×1.5；收復後可以按「挑戰評級」再打，只記最好成績，評級提升會補發獎勵差額','怪物血量重新調整：該關能做的一般武器 +6 大約剛好拿 A，越後面的關卡血量越多（1-10 約要 +7、2-10 約要 +8 才拿得到 A）'],g:['vil','hp']},
 {v:'4.70',d:'10/25',t:'村莊掉落一眼看完',b:['村莊詳情「每打倒一隻可能掉」：金幣、強化石、附魔石、四種遺物和武器，都跟材料一樣用格子顯示圖和機率','點強化石、附魔石、遺物的格子可以看說明'],g:['vil']},
 {v:'4.69',d:'10/25',t:'1-6 以後每隻金幣調高',b:['1-6 以後每打倒一隻的金幣改成範圍隨機，接著 1-5 慢慢往上：1-6 20～50、1-10 35～65 金幣','第二界 2-1 35～75 金幣，到 2-10 60～120 金幣'],g:['vil']},
 {v:'4.67',d:'10/24',t:'附魔小卡更清楚',b:['附魔結果直接顯示在<b>武器名稱</b>裡（例如 +6 雷神之怒 霜溪鋼劍），不再另外放「目前屬性」欄','隨機屬性池直接列出<b>18 種</b>（6 屬性 × 3 級）各自的機率：一級 11.67%、二級 4.17%、三級 0.83%','道具欄的武器名稱，屬性和名稱中間加了空格'],g:['ench']},
 {v:'4.66',d:'10/24',t:'打怪會直接掉武器',b:['村莊每打倒一隻都有機會直接掉武器：第一界開局武器 0.2%、這一界已解鎖的一般武器每種 0.15%','怪物專屬武器（1-7、2-8）0.3%、Boss 武器（1-10、2-10）0.1%，只在牠那一關掉','1-1～1-5 每隻金幣改成範圍隨機（例如 1-1 20～70 金幣）','掉落機率都寫在村莊詳情最下面'],g:['vil']},
 {v:'4.65',d:'10/24',t:'強化石掉落調整',b:['村莊打倒怪物掉強化石的機率減半：1-1 0.2%，越後面的關卡越高（9-10 約 0.38%）','照「慢」的推關速度，第一界約可拿到 75 顆、第二界約 300 顆'],g:['enh']},
 {v:'4.64',d:'10/24',t:'強化特效顏色統一',b:['+7 以上強化時，武器的光暈也改成外框顏色（+7 藍光裡不再混黃光）','成功時不再跳「升階 +N」大字，下方已經有「強化成功 +N」','開發者工具拿掉用不到的「安全區失敗」和「防爆」按鈕'],g:['enh']},
 {v:'4.63',d:'10/24',t:'商城購買小卡更順',b:['商城買材料時，調數量或按購買只會更新數字和價格，小卡<b>不會再整張重新跳出</b>'],g:['shop']},
 {v:'4.62',d:'10/24',t:'開發者工具整理',b:['管理員用的開發者工具改成<b>依版本</b>排列，新的在最上面；拿掉已刪除系統的測試按鈕','一般玩家的遊戲內容沒有改變']},
 {v:'4.61',d:'10/24',t:'強化時石碑不再晃動・新閃電',b:['+7 以上強化失敗時，符文能量會聚起來又熄滅散掉、冒一縷灰煙','爆裝的黑煙換成新圖：武器被一團帶紫光餘燼的黑煙吞掉後散去','強化動畫播放時，符文石碑固定不動（不再推近、震動），只有光、閃電和武器有動作','+10 換成新的<b>金色閃電</b>、+12 換成新的<b>鑽石閃電</b>（水晶碎片和稜鏡光）']},
 {v:'4.60',d:'10/24',t:'一鍵安定值・同款連按',b:['武器小卡的「一鍵 +6」改名<b>「一鍵安定值」</b>','同款武器疊在一格時，按一鍵安定值後小卡會自動換到<b>下一把同款</b>，可以一直按下去，不用回道具欄重點'],g:['enh','bag']},
 {v:'4.59',d:'10/24',t:'商城整理：簽到搬家・材料可以買',b:['<b>七日簽到</b>從任務搬到<b>商城</b>，每天第一次進遊戲會自動打開商城簽到（簽到獎勵之後會換新）','商城可以用<b>金幣或鑽石</b>買 8 種材料，點材料選數量購買','<b>狩獵號角</b>拿掉了','其他商品等正式上線再補齊'],g:['shop','quest']},
 {v:'4.58',d:'10/24',t:'強化特效加強',b:['<b>一鍵強化</b>改成連續演出：每升一級跳出大數字、符文一道道亮起綠光、音調越來越高，最後一下爆出光芒（點畫面可以略過）','+1～+6 單按強化不再播動畫，按下去直接出結果，石碑亮一下綠光；強化頁改成小卡，顯示強化石剩幾顆','<b>+7 以上</b>強化時，整塊符文石碑的燈光改成外框顏色：+7～+8 藍、+9 紅、+10 金、+11 紫、+12 鑽石；成功換到新顏色時跳出「升階」','+7 起石碑上會打閃電，等級越高閃電越多越強，+12 最華麗','強化成功率、爆裝率都沒有改']},
 {v:'4.57',d:'10/24',t:'新手導覽重做',b:['新玩家的<b>新手導覽</b>重新開放，照現在的玩法一步一步教','流程：打造鐵爐村伐木斧 → 60 秒挑戰 1-1 → 留下來掛機 → 收成 → 看材料和遺物 → 打鐵劍練強化 → 附魔 → 新圖紙 → 領月卡','挑戰輸了導覽會提示再挑戰，不會卡住','完成導覽一樣送 <b>50 鑽石</b>'],g:[]},
 {v:'4.56',d:'10/24',t:'交易所可以賣道具',b:['強化石、附魔石、英靈・遺物和所有材料都能上架：在道具欄點道具，按「上架交易所」，填<b>單價</b>和<b>數量</b>','買家可以只買一部分，填要買幾個就好，買剩的繼續掛著','交易所的「上架武器」分頁改成<b>待領取</b>：賣出的錢、沒賣出退回的武器和道具都放這裡，有東西時亮紅點','上架武器改成在道具欄點武器，按「上架」'],g:['mk']},
 {v:'4.55',d:'10/24',t:'同款武器疊一格',b:['道具欄的武器頁：<b>一模一樣的武器</b>（同一把、同強化等級、同屬性）放在同一格，右下角顯示數量','點進去強化、附魔、駐守、上架、熔解都只會動其中一把，動過的會自己分出來一格','駐守中的武器還是一把一格；道具欄上限 200 把照算每一把'],g:['bag']},
 {v:'4.54',d:'10/24',t:'新材料・附魔石・英靈遺物',b:['新增 <b>8 種材料</b>，名字都跟怪物故事有關：第一界每關掉中庭鐵礦、松林硬木，第二界掉約頓霜鐵、約頓巨木；1-7 石皮巨魔掉巨魔石皮、2-8 幻術巨人王掉骨頭、1-10 海姆達爾掉彩虹橋碎晶、2-10 索爾掉索爾雷晶','新武器的配方改成<b>金幣＋材料</b>（開局 7 把還是只花金幣），一般武器大約掛機 30 分鐘就湊得齊','新道具<b>附魔石</b>：附魔一次花 1 顆加金幣，打倒怪物有機率掉','<b>英靈・遺物</b>開始會掉了：每打倒一隻 2% 掉 1 個，越後面的關卡越容易掉紅光、金光','遺物可以打開：金幣、材料、強化石、附魔石、Boss 素材，運氣好還會開到武器','強化石、附魔石有新圖示了；村莊詳情會列出每打倒一隻可能掉的東西'],g:['forge','ench','bag']},
 {v:'4.53',d:'10/24',t:'交易所武器資訊',b:['交易所列表、上架清單、待領取的武器名稱會顯示<b>屬性</b>（例如「+7 冰封 霜溪鋼劍」）','點商品看到的詳情改成跟武器小卡一樣：攻擊力、攻速、附加效果、相剋、屬性弱點倍率都看得到'],g:['mk']},
 {v:'4.52',d:'10/24',t:'60 秒限時挑戰',b:['還沒收復的村莊改成<b>限時挑戰</b>：選一把武器，60 秒內打倒怪物就收復','整場戰鬥都看得到：血條、倒數計時、每一下的傷害，沒有快轉，打倒或時間到才出結果','輸了可以馬上再挑戰或換武器，沒有任何懲罰；選武器時會先顯示<b>預估秒數</b>','攻擊力剛好等於需求約 48 秒打倒，每一界最後兩關（神明關）剛好 60 秒，要再強一點才穩','收復後可以<b>留下來掛機</b>：每打倒一隻收成一次，卡片顯示每小時約打倒幾隻、多少金幣','強化石改成每打倒一隻有機率掉（1-1 約 0.4%，越後面越高）','弱點、時間限制、血量都在點開村莊的詳情裡看，卡片上不再顯示弱點標籤'],g:['vil','hp']},
 {v:'4.51',d:'10/24',t:'新武器 17 把',b:['鐵匠鋪有新圖紙了：開局就能打 <b>7 種</b>武器（鐵爐村鐵劍、伐木斧、鍛錘、雙刀、長矛、獵弓、手弩）','第一界收復 1-2、1-4、1-6 解鎖松林長矛、霜溪鋼劍、巨怪灣重弩，1-7 解鎖怪物武器<b>巨魔石皮錘</b>，1-10 解鎖 Boss 武器<b>霍夫德之劍</b>','第二界收復 2-1、2-3、2-5 解鎖約頓巨木斧、巨鷹崖風弓、永凍雙刀，2-8 解鎖<b>幻術巨人王骨戟</b>，2-10 解鎖<b>索爾之錘</b>','數值兩界一階：開局武器攻擊力 12，第一、二界新武器 15，怪物武器多 10%，Boss 武器還有專屬特效（20% 觸發、該下 +30%）','村莊需求改成新數值：第一界最後要強化到約 +7，第二界約 +8','新材料還在設計，配方暫時只花金幣']},
 {v:'4.50',d:'10/24',t:'強化石・最高 +12',b:['強化改用<b>強化石</b>：每次 1 顆，不花金幣（成功或失敗都會用掉）','強化石來源：村莊收成會掉（越後面的關卡掉越多），熔解武器退 1 顆','最高等級改成 <b>+12</b>','成功率：+1～+6 一定成功；+7 35%、+8 32.5%、+9 30%（失敗就爆裝）；+10～+12 各 1%（失敗時 1/3 維持、2/3 爆裝）','攻擊倍率：+6 ×1.6、+7 ×1.9、+8 ×2.25、+9 ×2.65、+10 ×3.3、+11 ×4、+12 ×4.8'],g:['enh']},
 {v:'4.49',d:'10/24',t:'修正鐵匠動作重疊',b:['修正鐵匠做動作時會出現兩個頭、兩隻手的問題，現在每一瞬間只會顯示一個姿勢']},
 {v:'4.48',d:'10/24',t:'鐵匠的動作變自然了',b:['鐵匠鋪的鐵匠大部分時間站著不動，每隔一段時間才<b>慢慢</b>呼吸、調整握鎚、轉頭看爐火，動作之間會淡入淡出']},
 {v:'4.47',d:'10/24',t:'鐵匠換上新樣貌・鐵匠鋪更有電影感',b:['鐵匠鋪和導覽頭像的鐵匠，換成跟開場故事、封面<b>同一個人</b>，而且會動了：呼吸、調整握鎚、轉頭看爐火','鐵匠身上會被爐火照亮、跟著火光閃動，畫面加上電影色調和景深，傾斜手機時前後景立體感更明顯']},
 {v:'4.46',d:'10/24',t:'新武器系統：攻速、附加效果、相剋',b:['<b>點武器跳出武器小卡</b>，不再蓋滿整個畫面：攻速、單擊、附加效果、相剋、屬性集中在四格，下面的進度條看得到強化到下一級會變多少','武器名稱改成「<b>+7 寒霜 鐵劍</b>」（強化／附魔／武器名），附魔名稱會依屬性發光，等級越高越亮','<b>攻擊力＝每秒傷害</b>，已經算進附加效果的平均；七類武器攻速不同，強化越高越常觸發附加效果','新增<b>相剋</b>：怪物分人形、野獸、巨型、飛行；劍、雙刀剋人形，長柄、斧剋野獸，錘、弩剋巨型，弓剋飛行，強化每一級多 1%（+12 為 +12%）','拿掉<b>品質倍率</b>和<b>品階名稱</b>，強化等級和框色就是武器的階段；「短刃」改名「雙刀」'],g:['wpn']},
 {v:'4.45',d:'10/24',t:'屬性附魔與怪物弱點',b:['屬性一律用<b>文字和顏色</b>標示，附魔改成跟武器詳情一樣的<b>小卡</b>','舊的 12 種附魔（迅捷、掠奪、剋巨人…）和圖紙天生詞條<b>全部拿掉</b>，武器身上的舊附魔已清空','新的<b>屬性附魔</b>：每把武器 1 欄，隨機出烈焰、霜寒、雷霆、劇毒、神聖、暗影其中一種，分三級（一級 70%、二級 25%、三級 5%），三級叫滅世之焰、雷神之怒這類名字','每隻怪物都有屬性，<b>三對宿敵互剋</b>：烈焰⇄霜寒、雷霆⇄劇毒、神聖⇄暗影','村莊卡片多了「<b>弱點</b>」標籤；武器打中弱點傷害 ×1.2／1.4／1.6，標籤變綠，狩獵更快','鍛造出來的武器一律無屬性；屬性不加攻擊力，沒打中也不扣傷害'],g:['ench','hp']},
 {v:'4.44',d:'10/24',t:'舊武器全部收起，準備全新武器',b:['為了從第一界重新設計全新武器，<b>舊武器、舊圖紙、神明武器和神格覺醒</b>全部拿掉','鐵匠鋪「圖紙」暫時是空的，新武器做好會陸續加入','新手導覽等新武器上線後再開放'],g:['forge']},
 {v:'4.43',d:'10/24',t:'舊道具和材料全部刪除・新道具欄',b:['舊的<b>防爆卷、祝福石、傳說圖紙、殘渣</b>和<b>所有材料</b>全部刪除，新的道具和材料重新設計中','鍛造、附魔暫時<b>只花金幣</b>；村莊暫時只掉金幣','商城拿掉旅行商人、符文祈願、殘渣兌換；任務、簽到、成就的獎勵改成金幣和鑽石','下方的「武器庫」改名「<b>道具欄</b>」，分「武器／材料」兩頁；材料頁的道具同一種疊一格，右下角是數量，沒有上限（鐵匠鋪的材料分頁拿掉）','新道具<b>英靈・遺物</b>：分綠光、藍光、紅光、金光四種，光芒越亮內容越好，打開會得到什麼還在設計中'],g:['bag','forge','shop','quest']},
 {v:'4.39',d:'10/24',t:'村莊卡片可以展開戰鬥畫面',b:['駐守中的村莊卡片下方多了<b>往下的箭頭</b>，點一下展開騎士打怪物的戰鬥畫面，再點一次收起','展開後還看得到這隻怪物<b>每輪會掉什麼</b>（附機率，點材料看用途）和<b>已經打到、還沒收成</b>的東西'],g:['hit']},
 {v:'4.38',d:'10/24',t:'畫面精簡：拿掉用不到的功能',b:['駐守中的村莊不再開詳情頁：掉落直接看卡片，<b>點卡片上的武器</b>跳出小卡，可以看武器、換武器、收回武器','村莊詳情的「需要的武器」拿掉（已經不限武器）','<b>狩獵策略</b>拿掉，一律一般狩獵','<b>排行榜</b>先全部關掉','鐵匠鋪的「<b>鍛造中</b>」分頁拿掉，進度條直接顯示在「開始鍛造」下方','<b>全服首領討伐</b>先拿掉，駐守首領的武器放回武器庫'],g:['vil','forge']},
 {v:'4.37',d:'10/24',t:'村莊不限武器・拿掉特性、重鍊和盾',b:['村莊委託<b>不限武器</b>：不指定類別、不看攻擊力、不用特定附魔，任何武器都能交（武器越強狩獵越快）','鍛造不再帶<b>先天特性</b>（鋒利、堅固、輕巧、尋寶、巨人獵手、符文親和）','<b>巨人體重鍊</b>拿掉了，第二界材料用來鍛造巨人武器','<b>盾</b>拿掉了：4 張盾圖紙不再出現；1-5 鴉巢堡、2-5 永凍湖的故事跟著改寫'],g:['vil','qual','realm']},
 {v:'4.36',d:'10/24',t:'武器品階與框的電流',b:['+9 以上的武器框改成<b>一道電流繞著框打轉</b>（原本是整框一明一暗）','武器上原本的品質名稱改成看強化等級的<b>品階</b>，顏色跟框一樣：+0 凡鐵、+1～+6 精鍛、+7～+8 寒鋒、+9 血刃、+10 神鑄、+11 星魂、+12 永恆','武器庫的「品質」篩選改成「品階」','武器格只留武器圖和名稱','鐵匠鋪的<b>工坊升級、熔解回收、鐵匠天賦</b>拿掉了（遊戲大改版中），效果也一起拿掉：圖紙只看收復的關卡就解鎖，附魔固定 2 格；單把武器還是可以在武器詳情裡熔解'],g:['enh','melt','ench']},
 {v:'4.35',d:'10/24',t:'第二界 8 隻怪物有全身圖了',b:['2-1 九頭巨人斯里瓦爾迪、2-2 鐵森林狼王、2-3 吞屍巨鷹赫拉斯瓦爾格、2-4 巨人屍鬼德勞格','2-5 冰湖水妖諾克（拉著琴把你引上冰面）、2-6 洞穴蠕龍林德蟲、2-7 風之巨人卡瑞、2-8 幻術巨人王烏特加德洛基','20 關都有全身圖了：點怪物小圖展開戰鬥畫面，就能看到牠們待機和攻擊的動作','怪物被打中時的閃光跟著當下的動作走，不會再出現跟身體對不上的白影'],g:['hit']},
 {v:'4.35',d:'10/24',t:'戰鬥畫面不再出現兩隻怪物',b:['1-2、1-9、1-10 和第二界的村莊背景本來就畫了怪物，展開戰鬥畫面時會跟前面的怪物重複','現在戰鬥畫面只取背景裡沒有怪物的那一段（例如瞭望塔、燃燒的城堡、巨人營地、極光），卡片和詳情頁的背景不變'],g:['hit']},
 {v:'4.34',d:'10/24',t:'武器框顏色看強化等級',b:['武器框改成新的細雷電框，顏色看<b>強化等級</b>：+0 灰、+1～+6 綠、+7～+8 藍、+9 紅、+10 金、+11 紫、+12 鑽石；+9 以上的框會微微閃亮','武器庫、交易所、排行榜、聊天武器卡都一樣，一眼就看得出哪幾把是賭過的','品質（普通～傳說）改成只看名稱下方的小字'],g:['enh']},
 {v:'4.32',d:'10/24',t:'戰鬥畫面怪物不再被切到・打法統一',b:['展開戰鬥畫面時，怪物整隻都在框內（之前野豬、霜狼、海怪等體型寬的怪物左邊會被切掉）','怪物被重擊打退時也不會超出框','戰鬥畫面收起時，卡片上的小怪物也用一樣的打法：長柄是<b>貫穿</b>（之前小怪物還是舊的流血），攻速和附加效果都跟戰鬥畫面相同'],g:['hit']},
 {v:'4.30',d:'10/24',t:'雷神索爾登場',b:['2-10 換上<b>雷神索爾</b>的頭像、全身圖和維莫爾河渡口新背景（之前暫時用斯卡蒂的圖）','1-8 泥巨人莫庫卡爾菲有全身圖了，2-9 石籬原換上新背景（巨石牆和赫朗格尼爾）','<b>索爾之錘</b>和<b>雷神錘柄</b>換上自己的圖'],g:['hp','god']},
 {v:'4.29',d:'10/24',t:'村莊詳情小修正',b:['「首次收復獎勵」改成佔一整列，小螢幕不會再折成兩行','2-10 維莫爾河渡口改成要戰錘後，攻擊力需求照難度曲線調成 1040'],g:[]},
 {v:'4.28',d:'10/24',t:'符文一關一關學會',b:['附魔不再一開始就抽得到全部 12 種：開局會<b>烈焰、霜寒、迅捷、掠奪、豐收</b>，之後 1-3 學會尋珍、1-6 貪婪、1-7 雷霆、1-8 剋巨人、1-10 神聖、2-6 劇毒和剋龍','還沒學會的詞條在附魔頁會鎖住並寫出哪一關開放，剩下的詞條機率變高，卡關時比較好抽到剋巨人、神聖','已經附在武器上的詞條全部保留','符文祈願只會給你去過的土地上的寶物：還沒開放的關卡素材抽不到，那份機率平分給霜銀和狼牙'],g:['ench','shop']},
 {v:'4.27',d:'10/24',t:'神明用「祂」',b:['稱呼神明一律用「祂」，怪物用「牠」','村莊詳情的怪物大圖，打神的關卡會寫「本村要打的神明」'],g:['hp']},
 {v:'4.26',d:'10/24',t:'第一、二界的故事串起來了',b:['20 關的說明和怪物傳說改寫成一條主線：諸神打開九界的門讓怪物湧進人間，打敗海姆達爾後去約頓海姆拉攏巨人','2-10 換成<b>雷神索爾</b>（維莫爾河渡口），要<b>戰錘＋神聖</b>；神明武器斯卡蒂之弓改成<b>索爾之錘</b>（天生雷霆），遺物改成雷神錘柄','1-8 和 2-9 對調：1-8 泥巨人莫庫卡爾菲、2-9 赫朗格尼爾（改名<b>石籬原</b>，要斧，掉巨人骨）','已經打好的斯卡蒂之弓和弓臂會自動變成索爾之錘和雷神錘柄，強化等級不變'],g:['god','hp']},
 {v:'4.25',d:'10/24',t:'1-2～1-4 怪物全身圖重新繪製',b:['1-2 賽赫利姆尼爾：身上多了英靈殿每晚被宰殺留下的傷疤','1-3 哈提：披著符文鎖鏈馬具的巨狼','1-4 斯庫爾：背上的冰刺更完整，撲擊動作更有力'],g:['hit']},
 {v:'4.23',d:'10/24',t:'第一界 10 隻怪物都有全身圖了',b:['1-5 瓦爾拉文（戰場鴉魔）：半鴉半狼，爪子抓著撕破的戰旗','1-6 克拉肯（深海巨怪）、1-7 山怪特羅爾（披著龍鱗的石皮巨魔）','1-8 石心巨人赫朗格尼爾（扛著磨刀石巨棒）、1-9 穆斯貝爾騎兵（騎著火鬃戰馬）、1-10 守望之神海姆達爾','點怪物小圖展開戰鬥畫面，就能看到待機和攻擊的動作'],g:['hit']},
 {v:'4.22',d:'10/24',t:'戰鬥畫面新增 3 隻全身怪物',b:['1-2 賽赫利姆尼爾（不死野豬）、1-3 哈提（追月之狼）、1-4 斯庫爾（追日之狼）換成全身圖','點怪物小圖展開戰鬥畫面，就會看到牠們待機和撲上來攻擊的動作'],g:['hit']},
 {v:'4.32',d:'10/24',t:'戰鬥畫面改成點了才展開',b:['村莊卡片平常維持原本的怪物小圖動畫','<b>點怪物小圖</b>才會展開騎士與怪物的戰鬥畫面，一次只會開一個；點戰鬥畫面就收起來','戰鬥畫面裡兩下連續傷害的數字分開一點，不再疊在一起'],g:['hit']},
 {v:'4.20',d:'10/24',t:'村莊戰鬥條（管理員試玩）',b:['村莊卡片上方新增<b>戰鬥條</b>：怪物在左、騎士在右，騎士拿著駐守的武器打怪物','7 類武器各有不同的雙手攻擊動作，攻速照新武器系統：劍 1.0、斧 1.3、錘 1.8、短刃 0.6、長柄 1.2、弓 1.1、弩 1.6 秒','打中時怪物閃白、停頓後被打退；強化越高越常觸發<b>附加效果</b>（會心、流血、震碎、中毒、貫穿、穿心、破甲）','1-1 是全身怪物圖，其他關卡的全身圖還在製作，先用頭像'],g:['hit']},
 {v:'4.19',d:'10/24',t:'遊戲改名「諸神鐵匠」＋全新開場',b:['遊戲正式改名為<b>諸神鐵匠</b>，換上新 Logo','登入畫面換成新封面：鐵匠站在崖邊，直視天上的<b>奧丁（眾神之父）</b>','開場故事改成 6 張：諸神逼鐵匠為祂們鍛造神兵，鐵匠拒絕，被奪走一切後在鐵爐村重燃熔爐，<b>武裝九界的勇士向諸神宣戰</b>','登入畫面下方可以按「重看開場故事」']},
 {v:'4.18',d:'10/24',t:'封測暫停・全面改版中',b:['感謝各位鐵匠這幾天參與封測！','遊戲還缺少許多機制，我們決定<b>全面改版</b>玩法，改版期間暫停開放遊玩','重新開放時，<b>所有進度都會清除</b>，大家從頭開始','改版很快就會完成，敬請期待，再次感謝大家的測試與回饋！']},
 {v:'4.15',d:'10/24',t:'神明武器與神格覺醒',b:['打倒神的關卡會掉<b>神的遺物</b>：1-10 掉霍夫德劍柄、2-10 掉斯卡蒂弓臂（每輪 20%）','收集 6 個遺物就能鍛造<b>霍夫德之劍</b>、<b>斯卡蒂之弓</b>，是那一界最強的武器','神明武器強化到 +7／+9／+11／+13／+15 會逐段<b>神格覺醒</b>，+15 有專屬稱號、全服公告和金色光環','強化成功率和爆裝規則都不變'],g:['god']},
 {v:'4.14',d:'10/24',t:'每一關都跟故事對得上',b:['關卡改名：1-1 魅影林場、1-5 鴉巢堡、1-6 巨怪灣、1-7 巨魔山口、2-2 鐵森林、2-3 巨鷹之崖、2-6 蠕龍礦坑、2-8 烏特加德城','條件跟著故事走：打神一定要<b>神聖</b>（2-10 斯卡蒂改成<b>弓＋神聖</b>）、2-6 蠕龍要<b>剋龍</b>、1-9 火焰騎兵要<b>霜寒</b>','掉落也對得上：1-10 掉新材料<b>虹橋碎晶</b>，2-6 蠕龍掉龍鱗；1-3 是對月長嚎的哈提、1-4 是咬住太陽的斯庫爾','村莊詳情多了「需要的武器」：列出這類所有圖紙，點一下直接跳到那把的鍛造頁','已經駐守的武器不會被收回，換武器時才看新條件'],g:['vil','hp','ench']},
 {v:'4.12',d:'10/24',t:'怪物大圖改到村莊詳情',b:['村莊卡片的縮圖不再翻頁，換回村莊圖','點開村莊，上方有這裡要打的<b>怪物大圖</b>、稱號、需要的武器和傳說','按 ‹ › 或下方小圖可以翻看這一界 10 隻，還沒解鎖的只顯示黑影'],g:['hp']},
 {v:'4.09',d:'10/24',t:'還沒駐守也看得到怪物',b:['還沒交付或沒有駐守武器的村莊卡，縮圖每 3 秒在<b>村莊</b>和<b>怪物</b>之間翻一次','先看清楚下一關要打誰，再去鍛造'],g:['hp']},
 {v:'4.08',d:'10/24',t:'交易所新增「待領取」',b:['武器賣出或 3 天沒賣出時，交易所分頁會亮紅點','進交易所，最上面列出<b>賣出了哪幾把、各賣多少</b>，以及退回的武器','按「<b>全部領取</b>」金幣、鑽石才會入帳（已扣 5% 手續費），退回的武器放回武器庫','沒領也不會消失，下次上線還在'],g:['mk']},
 {v:'4.07',d:'10/24',t:'村莊需求調整（要衝裝了）',b:['新材質剛開放的那幾關太簡單，打出來就能交：調高 10 座村莊的需求攻擊力','1-2 松林哨站 14、1-5 鴉巢堡 44、1-6 巨怪灣 55、1-8 巨人足跡 155、1-10 彩虹橋頭 310','2-1 霜巨人前哨 280、2-4 巨骨墓場 545、2-5 永凍湖 420、2-6 蠕龍礦坑 420、2-9 熔岩裂口 900','已經收復的村莊和駐守中的武器不受影響，只有新交付才看新需求'],g:['vil']},
 {v:'4.06',d:'10/24',t:'神的關卡改名，條件跟著劇情走',b:['1-10 改名<b>彩虹橋頭</b>：海姆達爾守在通往神界的橋上，凡鐵傷不了神，長柄武器改成要<b>神聖</b>附魔','2-10 改名<b>索列姆海姆</b>（斯卡蒂的雪山宮殿），她是巨人出身，仍要剋巨人','剋龍改成專門打每週首領尼德霍格','已經駐守在 1-10 的武器不會被收回，換武器時才要神聖'],g:['hp','ench']},
 {v:'4.05',d:'10/24',t:'每一界的最後一關都是神',b:['1-10 換成<b>守望之神海姆達爾</b>，尼德霍格回去當每週首領','2-10 換成<b>雪山女神斯卡蒂</b>，烏特加德洛基移到 2-8 冰巨人王庭','委託條件（剋龍、剋巨人）和獎勵都不變'],g:['hp']},
 {v:'4.04',d:'10/24',t:'北歐神話怪物',b:['20 座村莊的怪物換成北歐神話裡的角色，例如克拉肯、山怪特羅爾、九頭巨人、雪山女獵手斯卡蒂','點村莊看詳情，血條下方有怪物的稱號和傳說','9 隻怪物和每週首領塵世巨蟒換上新圖'],g:['hp']},
 {v:'4.03',d:'10/23',t:'遊戲內公告與玩法說明',b:['右上角喇叭換成<b>齒輪</b>：裡面有更新公告、玩法說明和音效設定','每次更新的新玩法都會寫在這裡，沒看過的會標 <b>NEW</b>，看過就消失'],g:['set']},
 {v:'4.02',d:'10/23',t:'武器打法各有特色・戰力改名攻擊力',b:['8 類武器在村莊有各自的打法：劍連斬、短刃爆擊、錘重擊、斧旋風斬、弓三連射、弩破甲、長柄流血、盾越打越痛','狩獵時間和收成都不變，只是打法不同','「戰力」全部改叫「攻擊力」，數值不變'],g:['hit']},
 {v:'4.00',d:'10/23',t:'安定值 +6・強化難度調整',b:['所有材質安定值都是 <b>+6</b>，+1～+6 失敗不會爆裝','+7～+15 成功率改成 45／35／25／18／12／8／5／3／2%','危險區失敗時爆裝機率 50% 起，每級 +5%，最高 90%','2-3 雷鳴峽谷需求攻擊力 320 → 260'],g:['enh']},
 {v:'3.99',d:'10/23',t:'全部收成只收目前這一界',b:['「全部收成」只收和計算目前在看的這一界'],g:['vil']},
 {v:'3.98',d:'10/23',t:'好友與公會',b:['可以加好友（最多 30 人）','建立或加入公會：捐獻、公會等級加成、貢獻商店、公會聊天'],g:['gd']},
 {v:'3.95',d:'10/23',t:'另一界可收成時亮紅點',b:['另一界有村莊可以收成時，上方地圖列的圖示會亮紅點'],g:['vil']},
 {v:'3.93',d:'10/23',t:'聊天武器卡・稱號・恭喜',b:['聊天可以貼出自己的武器卡','可以戴稱號','跑馬燈的強化公告可以按「恭喜」'],g:['chat']},
 {v:'3.90',d:'10/23',t:'工坊升級依進度解鎖',b:['熔爐、鐵砧升級前要先收復足夠的村莊','已經升上去的等級會保留'],g:['ws']},
 {v:'3.88',d:'10/23',t:'世界聊天與玩家名片',b:['世界頻道、系統頻道（全服強化公告）','點名字可以看玩家名片','畫面底部有聊天條'],g:['chat']},
 {v:'3.87',d:'10/23',t:'首領改成整週駐守',b:['首領整週開打，每週日 00:00 結算換下一隻','最多 3 把武器駐守，結算後武器留著繼續打','取消週一～週四雙倍收成','傷害排名可以看玩家用的武器'],g:['boss']},
 {v:'3.86',d:'10/23',t:'拿掉工具、投擲類武器',b:['礦鎬、投石索、霜銀飛斧不再出現在鍛造頁','舊的武器保留，可以熔解、上架、打首領'],g:['forge']},
 {v:'3.84',d:'10/23',t:'附魔改版',b:['附魔只能隨機，共 12 種詞條（攻擊力 5 種、狩獵 5 種、剋制 2 種）','拿掉指定附魔和「受襲」'],g:['ench']},
 {v:'3.78',d:'10/23',t:'鍛造一律 5 秒',b:['拿掉武器學徒，一次一批、不管幾把都是 5 秒完成'],g:['forge']},
 {v:'3.76',d:'10/23',t:'天賦・首領・第二界',b:['鐵匠聲望與天賦','全服首領討伐','第二界約頓海姆：10 座村莊、4 種新材料、巨人武器、巨人體重鍊'],g:['tal','boss','realm']},
 {v:'3.74',d:'10/22',t:'每日任務・簽到・跑馬燈',b:['每日任務＋活躍度寶箱','七日簽到','全服強化跑馬燈（+10 以上成功或爆裝）'],g:['quest']},
 {v:'3.69',d:'10/22',t:'畫面時間＝真實時間',b:['封測 10 倍速直接寫進遊戲時間','離線最多累積 12 小時'],g:['vil']}
];
const GUIDE=[
 ['基礎',[
  {k:'forge',ic:'t1_ironhammer_disp',n:'鍛造',s:'選圖紙、付金幣和材料，5 秒打好一批',v:'4.54',h:'在鐵匠鋪「圖紙」選一張圖紙，金幣和材料夠就能按「開始鍛造」。開局 7 把只花金幣；之後的武器要用打怪掉的材料：第一界用<b>中庭鐵礦、松林硬木</b>，第二界用<b>約頓霜鐵、約頓巨木</b>，怪物主題武器另外要怪物部位（1-7 巨魔石皮、2-8 幻術巨人王骨），Boss 武器要 Boss 素材（1-10 彩虹橋碎晶、2-10 索爾雷晶）。<br>開局就有 7 種武器的圖紙；收復第一界 1-2、1-4、1-6、1-7、1-10，第二界 2-1、2-3、2-5、2-8、2-10 會解鎖新圖紙。第 7／8 關是<b>怪物主題武器</b>（攻擊力多 10%），第 10 關是 <b>Boss 武器</b>（帶專屬特效）。兩界為一階，同一階的武器一樣強，想變強就要強化。<br>一次一批（最多 10 把），不管幾把都是 <b>5 秒</b>完成，進度條就在「開始鍛造」下方，可以取消（金幣全退）。'},
  {k:'wpn',ic:'cat_sword',n:'武器數值與相剋',s:'攻速、附加效果、相剋，點武器看小卡',v:'4.79',h:'點武器會跳出小卡。<b>攻擊力＝每秒傷害</b>，已經算進附加效果的平均。<br>七類武器攻速：雙刀 0.6 秒、劍 1.0、弓 1.1、長柄 1.2、斧 1.3、弩 1.6、錘 1.8 秒；每秒傷害都差不多，攻速慢的單擊比較重。<br><b>附加效果</b>：劍會心、斧流血、錘震碎、雙刀中毒、長柄貫穿、弓穿心、弩破甲；+1～+6 每級觸發率 2%，+7 起 16／20／25／30／35／40%。<br><b>相剋</b>：怪物分人形、野獸、巨型、亡靈。劍、雙刀剋人形，長柄、斧剋野獸，弩、弓剋巨型，錘剋亡靈；打被剋的怪物傷害會增加，強化越高加越多：+1～+6 每級 +1%、+7～+9 每級 +2%、+10～+12 每級 +3%（+6 為 6%、+9 為 12%、+12 為 21%），跟屬性弱點一起算。<br>武器名稱是「+7 寒霜 鐵劍」：強化等級、附魔、武器名。'},
  {k:'enh',ic:'it_bless',n:'強化',s:'每次 1 顆強化石，最高 +12',v:'4.65',h:'每次強化用 <b>1 顆強化石</b>，不花金幣，成功或失敗都會用掉。強化石從村莊收成拿（越後面的關卡掉越多），熔解武器也會退 1 顆。<br>+1～+6 一定成功。+7 起是危險區：+7 35%、+8 32.5%、+9 30%，失敗就爆裝；+10～+12 每級 1%，失敗時 1/3 維持原樣、2/3 爆裝。最高 <b>+12</b>。<br>攻擊倍率：+6 ×1.6、+7 ×1.9、+8 ×2.25、+9 ×2.65、+10 ×3.3、+11 ×4、+12 ×4.8。<br>武器的框色看強化等級：+0 灰、+1～+6 綠、+7～+8 藍、+9 紅、+10 金、+11 紫、+12 鑽石，+9 以上的框有電流繞著跑。<br>+1～+6 按強化直接出結果；+7 起符文石碑的燈光和武器光暈就是那一級外框的顏色。「一鍵強化」會一級一級連擊播放，點畫面可以略過。'},
  {k:'ench',ic:'mat_shard',n:'屬性附魔',s:'6 種屬性三對互剋，打中弱點加傷害、同屬性扣傷害',v:'4.81',h:'鍛造出來的武器一律<b>無屬性</b>。每次附魔花 <b>1 顆附魔石</b>加金幣，隨機附魔，得到 1 種屬性（每把武器只有 1 欄，重抽會蓋掉舊的；已經是三級時要再按一次確認才會重抽）。<br>屬性 6 種：<b>火屬性、冰屬性、雷屬性、毒屬性、聖屬性、暗屬性</b>，機率一樣。等級越高越難抽：一級 70%、二級 25%、三級 5%。<br>名稱：火屬性 餘燼／烈焰／滅世之焰；冰屬性 寒霜／冰封／永凍之霜；雷屬性 雷光／雷鳴／雷神之怒；毒屬性 蝕毒／蛇毒／巨蟒之毒；聖屬性 微光／聖光／光神聖輝；暗屬性 幽影／暗夜／盲神之影。<br><b>相剋（三對宿敵）</b>：火屬性⇄冰屬性、雷屬性⇄毒屬性、聖屬性⇄暗屬性。每隻怪物都有屬性，弱點就是對手屬性。<br>打中弱點：一級 +3%、二級 +6%、三級 +10%，狩獵更快、收成更多。<br><b>同屬性抗性</b>：拿跟怪物一樣屬性的武器（例如火屬性打火屬性的怪物）：一級 −3%、二級 −6%、三級 −10%。等級越高加越多、也扣越多，附魔前先看清楚怪物屬性。<br>其他屬性或無屬性都是正常傷害。屬性不加攻擊力。'},
  {k:'bag',ic:'nav_forge',n:'道具欄',s:'同一種道具疊一格，沒有上限',v:'4.72',h:'下方導覽的「<b>道具欄</b>」（原本的武器庫）分「武器／材料／圖鑑」三頁，道具在「材料」頁。<br>武器頁：一模一樣的武器（同一把、同強化等級、同屬性）疊在同一格，右下角是數量；點進去的操作只動其中一把；按「一鍵安定值」後小卡會換到下一把同款，可以一直按。上限 200 把照算每一把。同一種道具放在同一格，右下角顯示數量，沒有上限。<br>道具：<b>強化石</b>（強化用）、<b>附魔石</b>（附魔用）、<b>英靈・遺物</b>（綠光、藍光、紅光、金光四種，光芒越亮內容越好）。三種都是打倒怪物有機率掉，越後面的關卡掉越多、好遺物越多。<br>點遺物可以看開出機率，按「打開 1 個」或「全部打開」：可能開到金幣、材料、強化石、附魔石、Boss 素材或武器。<br>材料：每一界 2 種一般材料，加上怪物部位和 Boss 素材，點一下看哪裡掉、哪把武器會用到。'},
  {k:'codex',ic:'nav_armory',n:'武器圖鑑',s:'登錄武器換全帳號攻擊力，武器會消失',v:'4.72',h:'道具欄的「<b>圖鑑</b>」分頁。每把武器有 3 格：<b>+0</b>（+0.2%）、<b>+6</b>（+0.6%）、<b>+9</b>（+1.5%），道具欄有強化到那個等級以上的同款武器就能登錄（格子會發亮），自動挑等級最低、沒駐守、沒鎖定的那把。<br><b>登錄後那把武器會消失</b>，換到所有武器攻擊力的永久加成。<br>「套裝」分頁：6 個套裝湊齊再加 +2%～+5%。兩界全部收滿最多 +57.1%。'},
  {k:'melt',ic:'mat_iron',n:'熔解',s:'不要的武器換回金幣',v:'4.72',h:'在武器詳情按「熔解」：退回一半鍛造金幣。<br>鎖定（上鎖）的武器不能熔解，也不能登錄圖鑑。'}]],
 ['村莊與戰鬥',[
  {k:'vil',ic:'nav_village',n:'村莊委託與收成',s:'交武器收復村莊、自動狩獵收成',v:'4.73',h:'還沒收復的村莊要<b>限時挑戰</b>：任何武器都能上（駐守中的也可以），<b>60 秒內打倒怪物</b>就收復，解鎖下一座村莊和新圖紙，第一次收復有金幣獎勵。<br>打倒的秒數決定<b>評級</b>：SS 18 秒內、S 30 秒內、A 45 秒內、B 52 秒內、C 60 秒內。評級越高，這一關掛機的金幣和掉落機率越高（SS ×1.5、S ×1.25、A ×1、B ×0.85、C ×0.7），SS／S 的首次收復獎勵 ×2／×1.5。收復後在村莊詳情按「<b>挑戰評級</b>」可以再打，只記最好成績，評級提升會補發獎勵差額。每一關也會記下<b>最快打倒秒數</b>，上傳到全服<b>秒殺榜</b>（前 50 名，只記每人最快一次），在結算畫面或村莊詳情點「秒殺榜」就能看；每一界第 9、10 關的王，全服首殺和刷新第 1 名會上跑馬燈。整場戰鬥看得到血條和倒數，輸了馬上再試、沒有懲罰；選武器時會顯示預估秒數。<br>收復後可以讓武器駐守掛機，<b>每打倒一隻收成一次</b>，自動帶回金幣，<b>離線最多累積 12 小時</b>。每隻還有機會<b>直接掉武器</b>：第一界的開局武器、這一界已解鎖圖紙的一般武器，怪物專屬武器和 Boss 武器只在牠那一關掉（機率在村莊詳情最下面）；道具欄滿了會自動熔解成金幣和強化石。換上更強的武器打得更快。<br>每輪會掉什麼直接看村莊卡片右邊。<b>點卡片上的武器</b>會跳出小卡，可以看武器詳情、換武器或收回武器。<br>「全部收成」只收目前在看的這一界；另一界可以收成時，地圖圖示會亮紅點。'},
  {k:'hp',ic:'mon_1',n:'怪物血條',s:'打中才扣血，扣多少＝傷害',v:'4.76',h:'村莊卡上的怪物有血條，武器打中才會扣血，扣多少就是造成的傷害。<br>還沒交付或沒有駐守武器的村莊，點開詳情上方有怪物大圖，按 ‹ › 翻看這一界 10 隻（還沒解鎖的只顯示黑影）。<br>怪物被打倒就完成一輪狩獵，換下一隻。<br>點村莊看詳情，血條同步顯示，下方還有這隻北歐神話怪物的稱號和傳說。每一界的最後一關都是神，每一關的名稱、掉落都跟那隻怪物或神的故事有關。<br>怪物血量＝這一關能做的最好一般武器 +6（沒附魔、沒相剋）大約 40 多秒打倒，穩穩拿到 A 評級；越後面的關卡每關血量多 2.5%，在村莊詳情裡看得到。<br>每隻怪物都有<b>屬性</b>，點開村莊詳情的「弱點」是牠怕的屬性（例如火焰騎兵怕冰屬性、索爾死於蛇毒所以怕毒屬性）；武器的屬性附魔打中弱點時，血條扣得更快。'},
  {k:'hit',ic:'cat_sword',n:'武器打法',s:'攻速不同、強化越高越常觸發附加效果',v:'4.39',h:'點村莊卡片下方的<b>往下箭頭</b>（或怪物小圖），會展開戰鬥畫面（一次一個，再點一下收起），下面還列出每輪掉落和已經打到、還沒收成的東西：騎士拿著駐守的武器打怪物，打中時怪物閃一下、停頓後被打退，跳出的數字就是傷害。戰鬥畫面收起時，卡片上的小怪物也是同樣的攻速和附加效果。<br>攻速：<b>劍</b> 1.0 秒、<b>斧</b> 1.3 秒（兩連斬）、<b>錘</b> 1.8 秒、<b>短刃</b> 0.6 秒、<b>長柄</b> 1.2 秒、<b>弓</b> 1.1 秒、<b>弩</b> 1.6 秒。<br>強化越高越常觸發附加效果（+1～+6 每級 2%，+7 起 16%～40%）：劍<b>會心</b>、斧<b>流血</b>、錘<b>震碎</b>、短刃<b>中毒</b>、長柄<b>貫穿</b>、弓<b>穿心</b>、弩<b>破甲</b>。狩獵時間和收成不受影響。'},
  {k:'realm',ic:'realm_2',n:'第二界 約頓海姆',s:'收復 1-10 後開放',v:'4.37',h:'收復 1-10 彩虹橋頭、打倒海姆達爾後開放第二界，用上方地圖列切換。<br>10 座新村莊、4 種新材料（巨人骨、永凍霜晶、雷鳴鐵、世界樹古根），第五階巨人武器要熔爐 Lv6。<br>v4.37 起巨人體重鍊已經拿掉，第二界材料用來鍛造巨人武器。'}]],
 ['成長與獎勵',[
  {k:'quest',ic:'ic_check',n:'每日任務・成就',s:'每天領活躍度寶箱',v:'4.59',h:'<b>每日任務</b>：完成登入、收成、鍛造、強化、熔解累積活躍度，40／70／100 點各開一個寶箱。<br><b>委託成就</b>：免費拿鑽石。<br>v4.59 起<b>七日簽到</b>搬到商城。'},
  {k:'shop',ic:'nav_shop',n:'商城',s:'月卡、七日簽到、材料',v:'4.63',h:'封測期間<b>月卡免費</b>：立得鑽石，之後每天再領。<br><b>七日簽到</b>：漏簽不會歸零，第 7 天領完從第 1 天重新開始；每天第一次進遊戲會自動打開。<br><b>材料</b>：8 種材料都可以用金幣或鑽石買，點材料跳出小卡選數量。<br>狩獵號角已拿掉，其他商品正式上線再補。'}]],
 ['玩家互動',[
  {k:'mk',ic:'nav_market',n:'交易所',s:'金幣或鑽石買賣武器和道具',v:'4.56',h:'用金幣或鑽石買賣，最低 10，成交收 5% 手續費。任何武器、道具都能買賣，不限關卡進度。<br><b>上架武器</b>：在道具欄點武器，按「上架」，填售價。鎖定（上鎖）或駐守中的武器不能上架。<br><b>上架道具</b>：在道具欄點道具或材料，按「上架交易所」，填一個的單價和數量。買家可以只買一部分，買剩的繼續掛著。<br>賣出的錢、上架 3 天沒賣出退回的東西，都放在交易所的「待領取」分頁（有東西會亮紅點），按「全部領取」才入帳。<br>最多同時上架 10 件（一筆道具算一件）。'},
  {k:'chat',ic:'it_horn',n:'聊天與跑馬燈',s:'世界頻道、系統公告、武器卡',v:'3.93',h:'世界頻道可以和全服玩家聊天（鐵匠 Lv3 以上可以發言），系統頻道會顯示全服 +10 以上的強化公告。<br>點名字可以看玩家名片；聊天可以貼出自己的武器卡、戴稱號。<br>跑馬燈出現強化公告時可以按「恭喜」。'},
  {k:'gd',ic:'ui_player_emblem',n:'好友與公會',s:'捐獻升級、公會加成、貢獻商店',v:'4.43',h:'好友最多 30 人。<br>鐵匠 Lv5 可以建立公會（50,000 金幣），Lv3 可以加入。<br>捐獻金幣或鑽石增加公會經驗和個人貢獻；公會升級會加狩獵金幣、首領傷害和成員上限。<br>貢獻商店的舊道具已拿掉，新道具設計中。離開公會後 12 小時內不能再加入。'},
  {k:'set',ic:'ic_gear',n:'設定與公告',s:'右上角齒輪',v:'4.03',h:'右上角齒輪裡有更新公告、玩法說明和音效設定。<br>有新的公告或玩法時，齒輪會亮紅點；沒看過的項目標 <b>NEW</b>，看過就消失。'}]]
];
const GUIDE_ALL=GUIDE.flatMap(x=>x[1]);
// 已讀：S.nwSeen＝看過的公告版本、S.glSeen＝{玩法 key: 看過的版本}。第一次（舊玩家或新帳號）只把最近 5 則公告和它們改到的玩法算成 NEW
function nwInit(){if(S.nwSeen&&S.glSeen)return;const recent=NW_LOG.slice(0,5).map(n=>n.v);S.nwSeen=NW_LOG.filter(n=>!recent.includes(n.v)).map(n=>n.v);S.glSeen={};for(const g of GUIDE_ALL)if(!recent.includes(g.v))S.glSeen[g.k]=g.v}
const nwNew=n=>{nwInit();return!S.nwSeen.includes(n.v)},glNew=g=>{nwInit();return parseFloat(S.glSeen[g.k]||0)<parseFloat(g.v)};
const nwNewN=()=>NW_LOG.filter(nwNew).length,glNewN=()=>GUIDE_ALL.filter(glNew).length,setDotN=()=>S?nwNewN()+glNewN():0;
function nwMarkAll(){nwInit();let ch=false;for(const n of NW_LOG)if(!S.nwSeen.includes(n.v)){S.nwSeen.push(n.v);ch=true}if(ch)save()}
function glMark(k){const g=GUIDE_ALL.find(x=>x.k===k);if(g&&glNew(g)){S.glSeen[k]=g.v;save()}}
const newB=n=>`<i class="newb">NEW${n>1?' '+n:''}</i>`;
function sheetSet(k){const back=k?btn(img('ic_back'),'setk',{cls:'icon-btn img',attrs:'data-k="" aria-label="返回設定"'}):'<span style="width:44px"></span>';
  const head=t=>`<div class="sheet-head">${back}<h2>${t}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  if(k==='n'){ui.nwOn=true;return head('更新公告')+`<div class="small muted st-hint">沒看過的公告標 NEW，離開這頁後就會消失</div>`+NW_LOG.map((n,i)=>{const nw=nwNew(n),open=nw||i===0||ui.nwOpen===n.v;
    return `<button class="nwc ${nw?'new':''} ${open?'open':''}" data-act="nwtog" data-k="${n.v}"><span class="nwc-h"><span class="nwc-t">${nw?newB(1):''}<b>v${n.v}・${n.t}</b></span>${open?'':'<span class="nwc-go">展開 ›</span>'}</span><span class="nwc-d">2026/${n.d}</span>${open?`<ul>${n.b.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}</button>`}).join('')}
  if(k==='g')return head('玩法說明')+`<div class="small muted st-hint">點一項看說明；標 NEW 的是最近更新過的玩法</div>`+GUIDE.map(([s,rows])=>`<div class="st-sec">${s}</div>`+rows.map(g=>{const o=ui.glOpen===g.k,nw=glNew(g);
    return `<div class="glr ${o?'open':''}"><button class="glr-h" data-act="gltog" data-k="${g.k}">${img(g.ic)}<span class="grow"><b>${g.n}</b>${nw?newB(1):''}<span class="s">${g.s}</span></span><span class="go">${o?'收起':'›'}</span></button>${o?`<div class="glr-b">${g.h}<div class="glr-v">v${g.v} 更新</div></div>`:''}</div>`}).join('')).join('');
  const nn=nwNewN(),gn=glNewN(),row=(act,ic,t,s,n,attrs='')=>`<button class="st-row" data-act="${act}" ${attrs}>${img(ic)}<span class="grow"><b>${t}</b><span class="s">${s}</span></span>${n?newB(n):''}<span class="go">›</span></button>`;
  return head('設定')+`<div class="st-sec">遊戲資訊</div>`+row('setk','ic_news','更新公告',`最新 v${NW_LOG[0].v}・${NW_LOG[0].t}`,nn,'data-k="n"')+row('setk','ic_guide','玩法說明','每個系統怎麼玩，一次看懂',gn,'data-k="g"')
   +`<div class="st-sec">音效</div><div class="ui-panel panel st-snd">${sndHtml()}</div>`+(devMode()?`<div class="st-sec">開發者</div>`+row('dev','ic_gear','開發者工具','只有開發者模式看得到',0):'')}
function showLevel(){const c=cleared(),lv=smithLv();
  const row=(k,v,m)=>`<div class="kv"><span>${k}</span><b>${v}${m?` <span class="small muted">／${m}</span>`:''}</b></div>`;
  const nb=BPS.filter(b=>b.unlock===c+1),nx=VILLAGES[c],nt=TIERS.find(t=>t.furnace>S.furnace);
  const next=[nx?`收復 ${vNo(c)} ${nx.name}${nb.length?`：解鎖 ${nb.length} 張新圖紙`:''}`:'',c<5?`收復 5 座村莊：開放批量鍛造`:''].filter(Boolean);
  ui.result={t:'info',icon:'ui_player_emblem',title:`鐵匠等級 Lv.${lv}`,html:`${AUTH?`<div class="kv nick-row"><span>暱稱</span><b>${S.nick||'（尚未取名）'} <button class="ui-btn ui-btn--chip chipbtn" data-act="rename">改名</button></b></div>`:''}<div class="small muted">等級代表你的整體進度，收復村莊會讓等級 +1。</div>
   <div class="lv-rows">${row('收復村莊',c,VILLAGES.length)}</div>
   <div class="label">下一步可以做</div><ul class="lv-next">${next.map(t=>`<li>${t}</li>`).join('')}</ul>
   <div class="label">聊天</div><div class="kv"><span>底部聊天條</span><b><button class="ui-btn ui-btn--chip chipbtn ${S.chatBar===false?'':'on'}" data-act="cbarset">${S.chatBar===false?'隱藏':'顯示'}</button></b></div>
   ${chatBlk().length?`<div class="small muted">封鎖名單（點名字解除）</div><div class="cbl-row">${chatBlk().map(x=>`<button class="ui-btn ui-btn--chip chipbtn" data-act="cblun" data-u="${esc(x.u)}">${esc(x.n)} ✕</button>`).join('')}</div>`:''}`};render()}
const smithLv=()=>1+cleared()+(S.slots-1);   // v4.36 熔爐、鐵砧不再算等級
const queuedQty=()=>S.jobs.reduce((a,j)=>a+(j.qty||1),0);

/* ---------- 行動（介面包裝） ---------- */
function startForge(){const r=forgeStart(ui.bp,ui.qty,ui.useBp);if(typeof r==='string'){const el=document.querySelector('.sel-bp .lack-line,.sel-bp .goal');if(el)el.scrollIntoView({behavior:'smooth',block:'center'});return toast(r,'bad')}snd('forge_start');
  ui.useBp=false;toast(`開始鍛造 ${BP[ui.bp].n}${r.qty>1?' ×'+r.qty:''}，完成需要 ${fmtT(r.end-r.start)}`,'ok');render()}
function maxQty(){const b=BP[ui.bp];if(!bulkOn()||bpLock(b))return 1;const c=recipe(b);let n=10;
  for(const k in c)n=Math.min(n,Math.floor(S.mats[k]/c[k]));n=Math.min(n,Math.floor(S.gold/goldOf(b)),CAP_WEAPONS-S.weapons.length-queuedQty());return Math.max(1,n)}
function collect(i,silent){const r=collectCore(i);if(!r){if(!silent)toast('還沒有可收成的狩獵。');return null}
  if(!silent){snd('coin');showHarvest(`${VILLAGES[i].name} 收成 ${r.n} 輪`,r.got,r.ev)}return r}
const gotText=g=>Object.entries(g).filter(([k,n])=>n).map(([k,n])=>`${k==='gold'?'金幣':itemName(k)} +${fmt(n)}`).join('、')||'無';
// v3.99 全部收成只收目前這一界（另一界由地圖列圖示紅點提醒）
function collectAll(){tick();let tot={},cnt=0,ev=0;const r0=realmNow()*10;S.villages.forEach((st,i)=>{if(i<r0||i>=r0+10)return;const r=collect(i,true);if(r){cnt+=r.n;ev+=r.ev;tot=add(tot,r.got)}});
  if(!cnt)return toast('這一界目前沒有可收成的村莊。');snd('coin');showHarvest(`全部收成 ${cnt} 輪`,tot,ev);render()}
function showHarvest(title,got,ev){ui.result={t:'h',title,got,ev};render()}
function deliver(i,id){const r=deliverCore(i,id);if(!r)return toast('這把武器不符合委託條件。','bad');const lbr=lbReward(i);if(lbr.length)setTimeout(()=>toast(`${VILLAGES[i].name}排行榜 第 ${lbRank(i)} 名！<br>`+lbr.join('<br>'),'ok'),400);snd(r.first?'unlock':'deliver');if(r.fg)setTimeout(()=>toast(`首次收復 ${VILLAGES[i].name}：獲得 ${fmt(r.fg)} 金幣`,'ok'),200);
  if(r.first){const nb=BPS.filter(b=>b.unlock===cleared()).map(b=>b.n);const nx=VILLAGES[i+1];
    toast(nx?`委託完成！解鎖 ${vNo(i+1)} ${nx.name}`+(nb.length?`，新圖紙：${nb.slice(0,4).join('、')}${nb.length>4?' 等 '+nb.length+' 張':''}`:''):'約頓海姆全部收復！','ok');if(i===9){ui.realm=1;setTimeout(()=>toast('米德加德全部收復！第二界「約頓海姆」開放了','ok'),700)}}
  else toast(`${bpOf(W(id)).n} 已駐守 ${VILLAGES[i].name}`,'ok');ui.sheet=null;render()}
function recall(i){if(recallCore(i))toast(`武器已收回，${VILLAGES[i].name} 暫停狩獵。`);render()}
const cheapList=()=>S.weapons.filter(w=>w.q<=1&&w.lv===0&&!busyW(w)&&!w.lock);
function meltCheap(){snd('melt');const list=cheapList();if(!list.length)return toast('沒有可一鍵熔解的武器。');
  let tot={};list.forEach(w=>tot=add(tot,meltCore(w.id)));toast(`熔解 ${list.length} 把：`+gotText(tot),'ok');ui.sheet=null;render()}
// 一鍵強化到安定值：安定區失敗不降級、不爆裝，連續強化到安定值為止（不使用祝福石、防爆卷；金幣不夠就停）
function autoEnhCost(w){let g=0;for(let lv=w.lv;lv<stable(w);lv++)g+=enhCost(w)/RATE[lv+1];return Math.ceil(g)}   // v4.50 算強化石顆數（+1～+6 必成功＝差幾級就幾顆）
function autoEnhance(id){if(ui.busy)return;const w=W(id);if(!w)return;const s=stable(w);
  if(busyW(w))return toast('駐守中的武器要先收回。','bad');if(w.lv>=s)return toast(`已經達到安定值 +${s}。`);
  const from=w.lv,g0=stones();let tries=0,fails=0,err='';const nx=wSame(w)>1?{id,k:wKey(w)}:null;   // v4.60 同款疊一格：動畫播完小卡換到下一把同款，可以一直按（Mochi）
  const steps=[];while(w.lv<s&&tries<500){const r=enhanceCore(id,{});if(r.err){err=r.err;break}tries++;if(r.k!=='ok')fails++;steps.push({k:r.k,lv:w.lv})}
  if(!tries){toast(err||'無法強化。','bad');return render()}
  ui.enhLast=null;if(err)toast(`${err}，一鍵強化停在 +${w.lv}`,'bad');
  // v4.58 一鍵強化改成逐級連擊演出（結果上面已經算好）
  ui.sheet={t:'w',id,m:'enh'};ui.riskArm=ui.riskOk=null;ui.stkNext=null;render();ui.stkNext=nx;
  playCombo(id,from,steps,{id,k:'ok',t:`一鍵強化 +${from} → +${w.lv}`,d:`強化 ${tries} 次、失敗 ${fails} 次${w.test?'（測試武器免費）':'，用掉 '+fmt(g0-stones())+' 顆強化石'}`})}
const DEV={force:null};
function enhance(id){
  if(ui.busy)return;                          // 動畫播放中鎖定，只能點舞台略過
  if(Date.now()<(ui.lockUntil||0))return;     // 結果剛出現時防止連點誤觸
  const w=W(id);if(!w)return;
  const useSc=false,useBl=false;   // v4.43 防爆卷、祝福石刪除
  const next=w.lv+1,danger=next>stable(w),guarded=danger&&useSc;
  // 沒有防爆卷保護的危險強化：同一次進入強化頁只需要確認一次
  if(danger&&!guarded&&!w.test&&ui.riskOk!==id){if(ui.riskArm===id){ui.riskOk=id}else{ui.riskArm=id;renderLayer();return}}
  const force=w.test?DEV.force:null;
  const r=enhanceCore(id,{bless:useBl,scroll:useSc,force});if(r.err){toast(r.err,'bad');return renderLayer()}
  if(force)DEV.force=null;ui.busy=true;ui.enhLast=null;
  const res=r.k==='ok'?{k:'ok',t:`強化成功 +${r.next}`,d:`攻擊力提升到 ${fmt(power(r.w))}`}:r.k==='saved'?{k:'saved',t:'防爆卷生效',d:'武器完整保留，等級維持 +'+r.before.from+(r.test?'（測試）':'')}
   :r.k==='broke'?{k:'broke',t:'武器已損毀',d:`${r.before.name} 化成一團黑煙消失了${r.test?'（測試武器）':''}`}:{k:'fail',t:'強化失敗',d:'等級維持 +'+r.before.from+'，武器沒有受損'};
  res.id=id;res.guarded=!!r.usedScroll;
  if(!r.danger){ui.busy=false;ui.lockUntil=Date.now()+150;ui.enhLast={id,k:res.k,t:res.t,d:res.d,test:false};snd(ENH_SND[res.k],1,.7);renderLayer();return greenFlash()}   // v4.58 +1～+6 不播動畫，直接出結果（Mochi）
  playFx(r.danger,r.before,r.next,res)}
function enchant(id,slot){const r=enchantCore(id,slot);if(r.err)return toast(r.err,'bad');snd(r.v>=3?'enh_ok':'enchant');render()}   // v4.81 Mochi：不跳「附魔結果」提示，結果直接看武器名稱
const furnaceMax=()=>rfOpen()?6:5;   // v3.76 熔爐 Lv6（巨人武器）在第二界開放後才能升
const wsGate=k=>{const n=WS_GATE[k][S[k]+1]||0;return cleared()<n?'收復 '+vNo(n-1)+' 後開放':''};
function upgradeCore(kind){const lv=S[kind],tbl=kind==='furnace'?FURNACE_COST:ANVIL_COST;if(lv>=(kind==='furnace'?furnaceMax():5))return'已滿級';const g=wsGate(kind);if(g)return(kind==='furnace'?'熔爐':'鐵砧')+' Lv'+(lv+1)+'：'+g;const c=tbl[lv];if(S.gold<c)return'金幣不夠。';
  S.gold-=c;S[kind]++;return''}
function upgrade(kind){const e=upgradeCore(kind);if(e)return e==='已滿級'?void 0:toast(e,'bad');
  snd('upgrade');toast((kind==='furnace'?'熔爐':'鐵砧')+' 升到 Lv'+S[kind]+(kind==='anvil'&&(S.anvil===3||S.anvil===5)?'，開放新的附魔欄位':''),'ok');save();render()}
function monthly(){S.monthly.until=Math.max(NOW(),S.monthly.until)+30*864e5;S.gems+=300;toast('月卡啟用 30 天，立即獲得 300 鑽石。','ok');save();render()}
function claimMonthly(){if(!monthlyOn())return;if(S.monthly.last===today())return toast('今天已經領過了。');S.monthly.last=today();S.gems+=50;toast('月卡每日領取 50 鑽石。','ok');save();render()}

/* ---------- 強化動畫 v2：真實武器＋特效 PNG 疊加＋程式補間與粒子 ----------
   結果在 enhanceCore 已經決定，這裡只負責呈現，不會改任何數值。 */
const VFX={
  // N=畫格數、peak=最亮那一格（程式的閃光、碎裂、粒子都對齊這一格）、rest=結果畫面保留的那一格
  ok:{set:'success_gold',T:1200,color:'255,200,90',label:'成功',N:16,peak:10,rest:12},
  fail:{set:'failure_blue',T:900,color:'120,190,255',label:'失敗',N:16,peak:9,rest:12},
  broke:{set:'destroy_red',T:1700,color:'255,70,50',label:'爆裝',N:16,peak:8,rest:11},
  saved:{set:'protect_purple',T:1300,color:'190,120,255',label:'防爆',N:16,peak:9,rest:13}
};
const LOW_END=(typeof navigator!=='undefined'&&(navigator.hardwareConcurrency||8)<=4)||(typeof matchMedia!=='undefined'&&matchMedia('(max-width:380px)').matches);
let fxState=null;
const vfxSrc=(v,i)=>A(`vfx16_${v.set}_${String(i).padStart(2,'0')}`);
const FX_START=.03,FX_END=.97,peakAt=v=>FX_START+(v.peak-.5)*(FX_END-FX_START)/v.N;
// 統一武器顯示元件：武器圖已裁到實際可見範圍；有品質框時用逐把計算的比例（離框 10%、四角花飾額外避讓、離卡片外緣 10%），武器與框是獨立圖層
const WFIT={"t1_woodaxe":0.615,"t1_huntbow":0.595,"t1_huntknife":0.61,"t1_farmspear":0.615,"t1_ironsword":0.605,"t1_roundshield":0.635,"t1_ironhammer":0.635,"t1_handaxe":0.645,"t1_shortspear":0.615,"t1_sling":0.625,"t1_crossbow":0.63,"t1_pickaxe":0.605,"t2_wolfaxe":0.62,"t2_longsword":0.59,"t2_daneaxe":0.595,"t2_longbow":0.595,"t2_warspear":0.615,"t2_twindagger":0.61,"t2_broadsword":0.585,"t2_warhammer":0.615,"t2_glaive":0.615,"t2_throwaxe":0.635,"t2_seax":0.625,"t2_kiteshield":0.575,"t3_greataxe":0.595,"t3_greatsword":0.565,"t3_bow":0.595,"t3_spear":0.615,"t3_hammer":0.64,"t3_dagger":0.59,"t3_halberd":0.615,"t3_saber":0.62,"t3_crossbow":0.625,"t3_shield":0.565,"t3_doubleaxe":0.57,"t3_scythe":0.605,"m_fenrir":0.605,"m_frostgiant":0.575,"m_firegiant":0.565,"m_nidhogg":0.615,"m_iceraven":0.595,"m_serpent":0.62,"t2_crossbow":0.66};
Object.assign(WFIT,{t4_axe:.595,t4_sword:.565,t4_bow:.595,t4_crossbow:.625,t4_hammer:.6,t4_polearm:.615,t4_dagger:.59,t4_shield:.565});   // v3.76 巨人武器：沿用同類龍鱗武器的安全距離
for(const b of BPS)if(/^w\d_/.test(b.id)&&WFIT[b.id]==null)WFIT[b.id]=.6;   // v4.51 新武器圖的安全距離
for(const k in ART_WAIT)if(k.endsWith('_disp')){const id=k.slice(0,-5),src=ART_WAIT[k].slice(0,-5);if(WFIT[id]==null&&WFIT[src]!=null)WFIT[id]=WFIT[src]}   // v3.76 借圖的武器沿用原圖的安全距離
// 2026-10-20 已換成單張重新生成的完整圖（原本柄尾被截斷的 10 把）
// 開發工具：一次產生指定武器的測試版（品質、等級可輪替），並切到道具欄只看測試武器
function devAllWeapons(ids){const L=[0,1,6,7,9,10,15],q=ui.devAllQ??-1,lv=ui.devAllLv??-1;
  S.weapons=S.weapons.filter(w=>!w.test||where(w)>=0);
  ids.forEach((id,i)=>{const w=makeWeapon(id,q<0?i%5:q,lv<0?L[i%L.length]:lv,[]);w.lv=lv<0?L[i%L.length]:lv;w.test=true});
  ui.sheet=null;ui.tab='armory';ui.acat='all';ui.aq='all';ui.ast='test';scrollTo(0,0);toast('已產生 '+ids.length+' 把測試武器（道具欄已篩選「測試」）')}
function wArt(id,{frame=null,cls=''}={}){const bp=frame==='bp',k=(frame!=null?(WFIT[ART_WAIT[id]||id]||.65):.8)*100,o=(100-k)/2;   // frame:'bp'＝圖紙底圖（墊在武器下面，安全距離同外框）
  return `<span class="wart ${cls}">${bp?`<img class="wart-bg" src="${A('bp_paper2')}" alt="">`:''}<img class="wart-w" src="${A(id+'_disp')}" alt="" style="left:${o}%;top:${o}%;width:${k}%;height:${k}%">${frame!=null&&!bp?`<img class="wart-f" src="${A('frame'+frame)}" alt="">${/^_lv[3-6]$/.test(frame)?`<span class="wart-run"><img src="${A('frame'+frame)}" alt=""></span>`:''}`:''}</span>`}
const cutArt=src=>src.replace(/\.webp$/,'_disp.webp'+ART_V); // 去背版武器圖（暗色底轉透明），特效才能包住武器
// 預先載入特效圖，避免第一次播放時閃白
function preloadVfx(){setTimeout(()=>{for(const k in VFX)for(let i=1;i<=VFX[k].N;i++){const im=new Image();im.src=vfxSrc(VFX[k],i)}},1500)}
// 音效：放入 art/sfx_*.mp3 後把檔名加進 SFX_READY 就會播放（目前沒有正式音效檔，先保持安靜）
// 音效（v3.9）：sfx/*.mp3；暫用 Kenney Interface Sounds（CC0，真實錄音），之後換 ElevenLabs 只要覆蓋同名檔案
const SFX_VER='?v=9';const SFXV={ui_click:.3,ui_tab:.45,ui_open:.5,ui_close:.45,ui_error:.6,ui_buy:.7,coin:.75,forge_start:.8,forge_done:.75,deliver:.8,upgrade:.75,enchant:.8,melt:.7,enh_start:.6,enh_spoke:.7,enh_warn:.8,enh_ok:.9,enh_fail:.8,enh_break:.95,enh_saved:.85,unlock:.85};
const sfxPool={};let sfxPreloaded=false;
function sfxPreload(){sfxLoadAll();if(sfxPreloaded||typeof Audio==='undefined')return;sfxPreloaded=true;Object.keys(SFXV).forEach(n=>{try{const a=new Audio(sfxUrl(n));a.preload='auto';sfxPool[n]=a}catch(e){}})}
// v3.20 音效改用 Web Audio：音檔先解碼放進記憶體，點擊瞬間就能播放（舊方式手機上會慢 0.1～0.3 秒）
let PTR_DOWN=false,PTR_PEND=false;
// v3.27 音效試用：開發工具可替每個音效切換 A/B/C 試聽版（只存在這台裝置，不改正式音效）
const SFX_NAME={ui_click:'點擊',ui_tab:'分頁',ui_open:'開視窗',ui_close:'關視窗',ui_error:'錯誤',ui_buy:'購買',coin:'金幣／收成',forge_start:'開始鍛造',forge_done:'鍛造完成',deliver:'交付',upgrade:'升級',enchant:'附魔',melt:'熔解',enh_start:'強化開始',enh_spoke:'符文亮起',enh_warn:'危險警告',enh_ok:'強化成功',enh_fail:'強化失敗',enh_break:'爆裝',enh_saved:'防爆生效',unlock:'解鎖村莊'};
const SFX_VAR_KEYS=[],SFX_VARS={},SFX_NO={unlock:11,enchant:13,enh_spoke:16,enh_warn:17,enh_ok:18,enh_fail:19,enh_break:20,enh_saved:21};
let SFX_ALT={};try{SFX_ALT=JSON.parse(localStorage.getItem('nrs-sfxalt')||'{}')||{}}catch(e){}
const sfxUrl=n=>SFX_VAR_KEYS.includes(n)&&SFX_VARS[n].includes(SFX_ALT[n])&&SFX_ALT[n]?`sfx/var/${n}_${SFX_ALT[n]}.mp3?v=1`:'sfx/'+n+'.mp3'+SFX_VER;
function sfxSetAlt(n,v){if(v)SFX_ALT[n]=v;else delete SFX_ALT[n];try{localStorage.setItem('nrs-sfxalt',JSON.stringify(SFX_ALT))}catch(e){}delete SFXBUF[n];delete sfxPool[n];sfxLoadAll()}let ACX=null;const SFXBUF={};
// v3.83 iPhone 切到背景再回來，AudioContext 會變成 interrupted／suspended，甚至顯示 running 卻沒聲音：
// 回前景後標記 ACX_DIRTY，下一次觸控時關掉舊的、重建新的（已解碼的音檔可以直接沿用）
// v3.92 加強：只在觸控（手勢）裡重建；app 切換器／通知中心等沒有 visibilitychange 的中斷也標記；
// 偵測「顯示 running 但時間不走」；固定 iOS 音訊模式（SFX_SESSION），不再忽有忽無；記錄最近 20 筆音效事件給開發者工具看
const SFX_SESSION='ambient';let ACX_DIRTY=false,ACX_N=0,ACX_CK=null;const SFX_LOG=[];
function sfxLog(m){SFX_LOG.push(new Date().toTimeString().slice(0,8)+' '+m+(ACX?'（'+ACX.state+'）':''));if(SFX_LOG.length>20)SFX_LOG.shift()}
function sfxSession(){try{if(navigator.audioSession&&navigator.audioSession.type!==SFX_SESSION)navigator.audioSession.type=SFX_SESSION}catch(e){}}
function sfxCtx(){if(!ACX){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;sfxSession();try{ACX=new C()}catch(e){return null}ACX_N++;ACX_CK=null;sfxLog('建立音效引擎 #'+ACX_N);
    const me=ACX;ACX.onstatechange=()=>{if(ACX!==me)return;sfxLog('狀態改變');if(me.state!=='running'&&me.state!=='closed')ACX_DIRTY=true}}
  if(ACX.state!=='running'&&ACX.state!=='closed'){try{const r=ACX.resume();r&&r.catch&&r.catch(()=>{})}catch(e){}}return ACX}
const sfxReady=()=>ACX&&!ACX_DIRTY&&ACX.state==='running';
// 在觸控（使用者手勢）裡喚醒：需要時重建、resume＋播一段無聲音，iOS 才會真的放行
function sfxWake(force){const now=performance.now();
  if(ACX&&!ACX_DIRTY&&ACX.state==='running'&&ACX_CK&&now-ACX_CK.t>1500&&ACX.currentTime-ACX_CK.ct<0.05){ACX_DIRTY=true;sfxLog('時間沒在走，判定卡住')}
  if(ACX&&(ACX_DIRTY||force)){try{ACX.close()}catch(e){}ACX=null;sfxLog(force?'手動修復':'重建')}ACX_DIRTY=false;
  const c=sfxCtx();if(!c)return;try{const s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0)}catch(e){}
  ACX_CK={t:now,ct:c.currentTime}}
function sfxLoadAll(){const c=sfxCtx();if(!c)return;Object.keys(SFXV).forEach(n=>{if(SFXBUF[n])return;SFXBUF[n]='loading';
  const u=sfxUrl(n);fetch(u).then(r=>r.arrayBuffer()).then(ab=>new Promise((ok,no)=>c.decodeAudioData(ab,ok,no))).then(buf=>{if(sfxUrl(n)===u)SFXBUF[n]=sfxTrim(buf)}).catch(()=>{if(sfxUrl(n)===u)SFXBUF[n]=null})})}
// 去掉 MP3 開頭的靜音（編碼器會補一小段空白）
function sfxTrim(buf){const d=buf.getChannelData(0);let i=0;while(i<d.length&&Math.abs(d[i])<0.004)i++;return{buf,off:Math.max(0,i-32)/buf.sampleRate}}
function snd(n,rate=1,vol){if(QUIET||S.mute||!(n in SFXV))return;vol=(vol??1)*(S.vol??1);if(vol<=0)return;try{const c=ACX_DIRTY?ACX:sfxCtx(),b=SFXBUF[n];
  if(c&&b&&b!=='loading'&&sfxReady()){const s=c.createBufferSource(),g=c.createGain();s.buffer=b.buf;s.playbackRate.value=rate;g.gain.value=Math.min(1,(vol??1)*SFXV[n]);s.connect(g).connect(c.destination);s.start(0,b.off);return}
  if(typeof Audio==='undefined')return;const base=sfxPool[n]||(sfxPool[n]=new Audio(sfxUrl(n)));const a=base.cloneNode();a.volume=Math.min(1,(vol??1)*SFXV[n]);a.preservesPitch=false;a.playbackRate=rate;a.play().catch(()=>{})}catch(e){}}
const ENH_SND={ok:'enh_ok',fail:'enh_fail',broke:'enh_break',saved:'enh_saved'};
function playSfx(n){if(n==='sfx_enh_charge')return snd('enh_start');const k=n.replace('sfx_enh_','');snd(ENH_SND[k]||n)}
// 強化舞台（強化頁與動畫測試共用）：固定正方形中心點，所有特效畫格與武器都對齊這個中心
// v3.6 符文石碑強化過場：玩家武器＋程式運鏡；特效素材可替換（RUNE_FX 指向的畫格）
const ENH='art/enh/',VF=(n,i)=>`art/vfx16_${n}_${String(i).padStart(2,'0')}.webp`,rng=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
// 暫代：新素材（rune_*）到之前先用現有 16 格特效；換成新素材只要改這張表
const RN='art/rune/',RS=(n,a,b)=>rng(a,b).map(i=>`${RN}${n}_${i}.webp`);
const RUNE_FX={light:RS('lightning',1,8),eclipse:RS('eclipse',1,8),climax:RS('climax',1,8),ok:RS('success',1,8),broke:RS('shatter',1,8),spark:RS('success',1,3),boltGold:RS('bolt_gold',1,8),boltDia:RS('bolt_dia',1,8),fail:RS('fail',1,8),smoke:RS('smoke',1,8)};   // v4.61 +10 金色、+12 鑽石閃電（Mochi AI 圖）
const RUNE_HAS_STONE=true;
const seqHtml=(k,cls)=>`<div class="ly seq ${cls}" data-seq="${k}">${RUNE_FX[k].map(src=>`<img src="${src}" alt="">`).join('')}</div>`;
function stageHtml(o){return `<div class="enh-stage rune ${o.danger?'danger':'safe tier'} ${o.cls||''}" id="enhStage"${o.danger?'':` style="--tf:${TIER_FLT[1]}"`}><img class="dp dp-sback" src="${A('dp/rune_back')}" alt=""><div class="stage-sq" id="enhSq">
   <div class="ly rn-cam" id="enhCam">
    ${RUNE_HAS_STONE?`<img class="ly rn-stone" src="${RN}stone_dark.webp" alt=""><img class="ly rn-stone glow" id="rnGlow" src="${RN}stone_glow.webp" alt=""><div class="ly rn-spokes" id="rnSpokes">${rng(1,8).map(i=>`<img class="ly rn-stone sp" src="${RN}spoke_${i}.webp" alt="">`).join('')}</div>`:'<div class="ly rn-stone ph"></div><div class="ly rn-stone glow ph" id="rnGlow"></div>'}
    ${seqHtml('light','rn-light')}
    ${o.art?`<div class="ly rn-shadow" id="rnShadow"><img src="${cutArt(o.art)}" alt=""></div>`:''}
    <div class="ly rn-wpn" id="fxW">${o.art?`<img class="wimg" src="${cutArt(o.art)}" alt="">`:''}<div class="fx2-shards" id="fxShards"></div>
      <div class="rn-climb" id="rnClimb"><img src="${RN}climb.webp" alt=""></div></div>
    ${seqHtml('eclipse','rn-eclipse')}${seqHtml('spark','rn-spark')}</div>
   <div class="dp dp-sfog"></div><div class="dp dp-smotes">${[0,1,2,3,4,5].map(k=>`<img class="m${k} gold" src="${A('dp/'+['fx_mote_gold','fx_dust_gold','fx_rune_gold','fx_mote_gold','fx_shard_gold','fx_mote_gold'][k])}" alt=""><img class="m${k} blue" src="${A('dp/'+['fx_mote_blue','fx_mote_blue','fx_rune_blue','fx_mote_blue','fx_mote_blue','fx_mote_blue'][k])}" alt="">`).join('')}</div>
   ${seqHtml('climax','rn-climax')}${seqHtml('ok','rn-res')}${seqHtml('broke','rn-res rn-shatter')}
   <div class="fx2-flash" id="fxFlash"></div></div>
   <div class="enh-top"><span class="enh-zone">${o.zone}</span>${o.from==null?'':`<span class="enh-lv"><span class="lvt">+${o.from}</span><span class="arrow">${ic('arrow-next')}</span><span class="lvt big">+${o.to}</span></span>`}</div>
   <div class="enh-ribbon k-${o.rk||''} ${o.ribbon?'show':''}" id="enhRibbon">${o.ribbon||''}</div>
   <div class="enh-hint" id="enhHint">點畫面略過</div></div>`}
// 每個圖層只用一條時間軸：stops=[[毫秒,樣式,緩動]]
function tl(el,T,stops){if(!el)return;const kf=stops.map(([t,st,e])=>({...st,offset:Math.min(1,Math.max(0,t/T)),easing:e||'linear'}));
  if(kf[0].offset>0)kf.unshift({...stops[0][1],offset:0});if(kf[kf.length-1].offset<1)kf.push({...stops[stops.length-1][1],offset:1});
  for(let i=1;i<kf.length;i++)if(kf[i].offset<kf[i-1].offset)kf[i].offset=kf[i-1].offset;
  const a=el.animate(kf.map((k,i)=>({...k,easing:(kf[i+1]&&kf[i+1].easing)||'linear'})),{duration:T,fill:'forwards'});fxState.anims.push(a);return a}
function playSeq(k,T,t0,t1,o={}){const box=document.querySelector(`#enhStage [data-seq="${k}"]`);if(!box)return;box.style.visibility='visible';cutImgs([...box.children],T,t0,t1,o)}
// v4.58 畫格硬切：同一瞬間只亮一格，不交叉淡化（時間點跟原本一樣）；只有第一格淡入、最後一格淡出
function cutImgs(im,T,t0,t1,{hold=t1,X=60,peak=1}={}){const span=(t1-t0)/im.length,last=im.length-1;
  im.forEach((el,i)=>{const a=t0+span*i,end=i===last?hold:a+span;
    tl(el,T,[[0,{opacity:0}],...(i?[[a,{opacity:0}],[a,{opacity:peak}]]:[[Math.max(0,a-X/2),{opacity:0}],[a+X/2,{opacity:peak}]]),[end,{opacity:peak}],[i<last?end:end+X,{opacity:0}]])})}
// 武器預設斜放（圖本身就是左下到右上）；直立＝轉 -45°
const CAM=(s,x=0,y=0,r=0)=>({transform:`translate(${x}%,${y}%) scale(${s}) rotate(${r}deg)`});
function runRune(k,danger){
  const sq=document.getElementById('enhSq'),cam=document.getElementById('enhCam'),W=document.getElementById('fxW'),wi=W.querySelector('.wimg'),glow=document.getElementById('rnGlow'),climb=document.getElementById('rnClimb'),fl=document.getElementById('fxFlash'),rb=document.getElementById('enhRibbon'),hint=document.getElementById('enhHint');
  const N='brightness(1)',shake=(t,p)=>[[t,{transform:'none'}],[t+40,{transform:`translate(${-p}px,${p/2}px)`}],[t+90,{transform:`translate(${p}px,${-p/2}px)`}],[t+140,{transform:`translate(${-p/2}px,0)`}],[t+200,{transform:'none'}]];
  let T,REV;
  if(!danger){ // 安全區約 0.8 秒：符文一閃 → 小星芒 → 結果
    T=800;REV=320;
    tl(cam,T,[[0,CAM(1)],[REV,CAM(1.08),'ease-out'],[T,CAM(1),'ease-in-out']]);
    tl(glow,T,[[0,{opacity:0}],[150,{opacity:1}],[REV+200,{opacity:k==='fail'?.85:.2}],[T,{opacity:0}]]);
    if(k==='fail')later(REV-40,()=>{const st=document.getElementById('enhStage');if(st)st.classList.add('rn-red')});   // 安定區強化失敗：揭曉時石碑由黃光轉紅光
    tl(wi,T,[[0,{filter:N}],[REV-60,{filter:'brightness(1.6) drop-shadow(0 0 12px rgba(255,210,120,.95))'}],[k==='ok'?REV+220:REV+120,{filter:k==='ok'?'brightness(1.9) drop-shadow(0 0 16px rgba(255,220,140,1))':'brightness(.8)'}],[T,{filter:N}]]);
    if(k==='ok')playSeq('spark',T,REV-40,REV+260,{X:50,peak:.9});
    fl.style.background='radial-gradient(closest-side,rgba(255,240,210,.5),rgba(255,240,210,0))';tl(fl,T,[[0,{opacity:0}],[REV-40,{opacity:0}],[REV,{opacity:1}],[REV+200,{opacity:0}]]);
  }else{ // 危險區：八道符文依序亮起（每道 170ms），全亮＝成功；爆裝／失敗／防爆在中途某一道停下
    const S0=520,DT=250,SP=[...document.querySelectorAll('#rnSpokes .sp')];
    const lit=k==='ok'?8:(ui.devStop!=null&&ui.devStop>=0?ui.devStop:2+Math.floor(Math.random()*5));   // 失敗類停在第 3～7 道
    const ts=S0+lit*DT;let C;
    for(let i=0;i<lit;i++)later(S0+i*DT,()=>snd('enh_spoke',.85+i*.09));if(k!=='ok')later(ts,()=>snd('enh_warn'));
    if(k==='ok'){REV=ts+380;T=REV+1150}else{C=ts+300;REV=k==='fail'?ts+220:C;T=REV+(k==='fail'?900:1150)}
    // 鏡頭：暗中推近，符文亮起時慢慢壓近
    tl(cam,T,[[0,{...CAM(.86),filter:'brightness(0)'}],[S0-20,{...CAM(1),filter:'brightness(1)'},'ease-out'],[ts,{...CAM(1.1,0,6),filter:'brightness(1)'}],[REV,{...CAM(1.16,0,8),filter:k==='fail'?'brightness(.8)':'brightness(1.15)'},'ease-out'],[T-150,{...CAM(1.05,0,4),filter:'brightness(1)'},'ease-out']]);
    tl(W,T,[[0,{transform:'rotate(22.5deg)'}]]);
    // 每道符文：一亮（帶一下過曝）就保持；結果揭曉後依結果處理
    SP.forEach((el,i)=>{if(i<lit){const t=S0+i*DT,end=k==='ok'?[[T,{opacity:1,filter:'brightness(1)'}]]:[[REV,{opacity:1,filter:k==='saved'?'brightness(1)':'brightness(1.3)'}],[REV+280,{opacity:k==='saved'?.5:0,filter:'brightness(1)'}]];
        tl(el,T,[[0,{opacity:0,filter:'brightness(1)'}],[t,{opacity:0,filter:'brightness(2.2)'}],[t+50,{opacity:1,filter:'brightness(2.2)'}],[t+160,{opacity:1,filter:'brightness(1)'}],...end])}
      else tl(el,T,[[0,{opacity:0}]])});
    // 每亮一道，舞台輕震一下
    const shk=[[0,{transform:'none'}]];for(let i=0;i<lit;i++){const t=S0+i*DT;shk.push([t,{transform:'none'}],[t+30,{transform:'translate(-1.5px,1px)'}],[t+70,{transform:'none'}])}
    // 武器：越亮越多
    // 防爆卷保護中：武器光暈改藍色（跟石碑一致）
    const GD=!!(fxState&&fxState.res&&fxState.res.guarded),TR=fxState&&fxState.res&&fxState.res.rgb,GC=GD?'110,185,255':TR||'255,200,90',GC2=GD?'150,210,255':TR||'255,220,150';   // v4.64 +7 起武器光暈也用外框顏色（Mochi：藍光裡不要有黃光）
    const wpre=[[0,{filter:N,opacity:1}],[S0,{filter:N,opacity:1}],[ts,{filter:`brightness(${1+lit*.08}) drop-shadow(0 0 ${4+lit*1.5}px rgba(${GC},.9))`,opacity:1}]];
    fl.style.background='radial-gradient(closest-side,rgba(255,250,235,.95),rgba(255,250,235,0))';
    if(k==='ok'){ // 全亮：整塊石碑亮起、雷擊、閃光、星芒
      tl(glow,T,[[0,{opacity:0}],[ts,{opacity:0}],[ts+120,{opacity:1}],[T,{opacity:.7}]]);
      playSeq('light',T,ts,ts+420,{X:40});playSeq('climax',T,REV-120,REV+300,{X:50});playSeq('ok',T,REV+60,T-120,{X:100});
      tl(wi,T,[...wpre,[REV,{filter:'brightness(2.4)',opacity:1}],[REV+300,{filter:`brightness(1.8) drop-shadow(0 0 18px rgba(${GC2},1))`,opacity:1}],[T,{filter:`brightness(1.15) drop-shadow(0 0 8px rgba(${GC2},.7))`,opacity:1}]]);
      tl(fl,T,[[0,{opacity:0,transform:'scale(.5)'}],[REV-60,{opacity:0,transform:'scale(.5)'}],[REV,{opacity:1,transform:'scale(1.3)'}],[REV+260,{opacity:0,transform:'scale(1.8)'}]]);
      shk.push(...shake(ts+60,4),...shake(REV,6));
    }else{
      // 防爆生效：武器差點碎裂的瞬間，整塊石碑閃一下藍光把它護住（取代舊的紫色護盾動畫）
      if(k==='saved'&&GD)tl(glow,T,[[0,{opacity:0}],[C-20,{opacity:0}],[C+60,{opacity:1}],[C+500,{opacity:.55}],[T,{opacity:.3}]]);else tl(glow,T,[[0,{opacity:0}]]);
      if(k==='fail'){tl(wi,T,[...wpre,[ts+260,{filter:'brightness(.55) saturate(.6)',opacity:1}],[T,{filter:N,opacity:1}]]);shk.push(...shake(ts+60,2))}
      else{ // 爆裝、防爆：下一道閃紅、武器發紅抖動
        tl(W,T,[[0,{transform:'rotate(22.5deg)'}],[ts,{transform:'rotate(22.5deg)'}],[ts+60,{transform:'rotate(22.5deg) translate(-3px,2px)'}],[ts+120,{transform:'rotate(22.5deg) translate(3px,-2px)'}],[ts+180,{transform:'rotate(22.5deg) translate(-3px,1px)'}],[ts+240,{transform:'rotate(22.5deg) translate(2px,-1px)'}],[C,{transform:'rotate(22.5deg)'}]]);
        const redw='sepia(1) hue-rotate(-45deg) saturate(4) brightness(1.8)';
        if(k==='broke'){
          // v4.58 爆裝改成武器化成一團黑煙消失（Mochi）：不再碎片、紅光、白閃
          tl(wi,T,[...wpre,[C-60,{filter:'brightness(.15)',opacity:1}],[C+220,{filter:'brightness(0)',opacity:0}]]);
          {const shd=document.getElementById('rnShadow');if(shd)tl(shd,T,[[0,{opacity:.6}],[C,{opacity:.6}],[C+200,{opacity:0}],[T,{opacity:0}]])}
          {const m=document.createElement('div');m.className='ly ex-smoke';m.innerHTML=RUNE_FX.smoke.map(src=>`<img src="${src}" alt="">`).join('');sq.appendChild(m);cutImgs([...m.children],T,C-80,T-60,{X:60,peak:1})}   // v4.61 黑煙改用 Mochi AI 圖（8 格硬切）
          tl(sq,T,[[0,{filter:'none'}],[C+400,{filter:'none'}],[T-200,{filter:'brightness(.5)'}],[T,{filter:'brightness(.6)'}]]);shk.push(...shake(C,5));
        }else{
          tl(wi,T,[...wpre,[C-10,{filter:redw,opacity:1}],[C+200,{filter:`brightness(1.3) drop-shadow(0 0 16px rgba(${GC2},1))`,opacity:1}],[T,{filter:`brightness(1.05) drop-shadow(0 0 8px rgba(${GC2},.6))`,opacity:1}]]);
          fl.style.background=`radial-gradient(closest-side,rgba(${GC2},.85),rgba(${GC2},0))`;tl(fl,T,[[0,{opacity:0,transform:'scale(.5)'}],[C-30,{opacity:0,transform:'scale(.5)'}],[C+20,{opacity:.85,transform:'scale(1.15)'}],[C+320,{opacity:0,transform:'scale(1.6)'}]]);shk.push(...shake(C,5));
        }
      }
    }
    shk.sort((a,b)=>a[0]-b[0]);tl(sq.parentNode,T,shk);
  }
  const R0=REV+(danger?280:80);tl(rb,T,[[0,{opacity:0,transform:'translateY(10px)'}],[R0,{opacity:0,transform:'translateY(10px)'}],[R0+200,{opacity:1,transform:'none'}]]);
  if(hint)tl(hint,T,[[0,{opacity:.75}],[REV-200,{opacity:.75}],[REV,{opacity:0}]]);
  snd('enh_start');later(REV,()=>snd(ENH_SND[k],1,danger?1:.7));
  fxState.timer=setTimeout(finishFx,T+60);return{T,REV};
}
function playFx(danger,w,next,res){
  stopFx();let stage=document.getElementById('enhStage');
  if(!stage){ui.sheet={t:'fxt',k:res.k,art:w.art,next,danger};renderLayer();stage=document.getElementById('enhStage')}
  stage.classList.add('playing');stage.dataset.act='fxskip';stage.classList.toggle('danger',!!danger);stage.classList.toggle('safe',!danger);
  stage.classList.toggle('guarded',!!res.guarded);stage.classList.remove('rn-red');   // 防爆卷保護中：石碑亮藍光
  {const sh=document.querySelector('#rnShadow img');if(sh)sh.src=cutArt(w.art)}
  const W0=document.getElementById('fxW');W0.innerHTML=`<img class="wimg" src="${cutArt(w.art)}" alt=""><div class="fx2-shards" id="fxShards">${[0,1,2,3,4].map(i=>`<img class="sh s${i}" src="${cutArt(w.art)}" alt="">`).join('')}</div>`;
  const rb=document.getElementById('enhRibbon');rb.className='enh-ribbon k-'+res.k;rb.innerHTML=`<b>${res.t}</b><span>${res.d}</span>`;rb.style.opacity=0;
  document.querySelectorAll('.sheet [data-act="enhance"]').forEach(b=>{b.disabled=true;b.textContent='強化中…'});
  fxState={res,w,anims:[],raf:0,done:false,timer:0};ui.fxDone=finishFx;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return finishFx();
  {const fl=FLV(next);stage.classList.toggle('tier',!!danger);stage.style.setProperty('--tf',TIER_FLT[fl]);res.hue=danger?TIER_HUE[fl]:0;res.rgb=danger?TIER_RGB[fl]:null;
   const own=danger&&(fl===6?RUNE_FX.boltGold:fl===5?RUNE_FX.boltDia:null);stage.classList.toggle('ownbolt',!!own);   // v4.61 金、鑽石：成功時那道主閃電也換成專屬圖
   document.querySelectorAll('#enhStage [data-seq="light"] img').forEach((im,i)=>{const src=(own||RUNE_FX.light)[i];if(im.getAttribute('src')!==src)im.src=src})}   // v4.58 危險區整塊石碑的燈光用外框顏色（+7～+8 藍、+9 紅…）
  const tm=runRune(res.k,!!danger);if(danger)enhBolts(next,res.k,tm);if(danger&&res.k==='fail')enhFailFx(tm);if(res.k==='ok')enhExtra(!!danger,next,tm,res.id);
}
/* v4.58 強化演出加強（Mochi 選 B）：疊在符文動畫上面的額外圖層，不改符文時間軸、不改任何數值
   +1～+6 單按不播動畫；+7～+12 整場石碑燈光用外框顏色，成功時：光效換成新外框顏色，進到新顏色時跳「升階」；一鍵強化：逐級連擊播放 */
const TIER_RGB=['200,200,200','120,220,120','110,170,255','255,70,60','190,110,255','170,235,255','255,205,90'];   // 依 FLV：灰、綠、藍、紅、紫、鑽石、金
const TIER_HUE=[0,75,180,-40,235,173,5];   // TIER_FLT 裡的色相旋轉，下一道符文的紅色警告要轉回來
const TIER_FLT=['grayscale(1)','hue-rotate(75deg) saturate(1.7) brightness(1.3)','hue-rotate(180deg) saturate(1.5)','hue-rotate(-40deg) saturate(2.4)','hue-rotate(235deg) saturate(1.6)','hue-rotate(173deg) saturate(.35) brightness(1.5)','hue-rotate(5deg) saturate(1.05) brightness(1.3)'];   // v4.61 金、鑽石對齊新閃電圖的顏色（Mochi：燈光要跟閃電同色）   // 現有金色特效圖換色
const exNum=(t,cls='',st='')=>{const e=document.createElement('div');e.className='ex-num '+cls;e.innerHTML=t;if(st)e.style.cssText=st;return e};
const POP=(s=1)=>({transform:`translate(-50%,-50%) scale(${s})`});
function exOv(){const st=document.getElementById('enhStage');if(!st)return null;st.querySelectorAll('.ex-ov').forEach(e=>e.remove());const ov=document.createElement('div');ov.className='ex-ov';st.appendChild(ov);return ov}
function enhExtra(danger,next,{T,REV},id){const ov=exOv();if(!ov)return;
  if(!danger)return;
  if(next<7)return;
  const fl=FLV(next),up=fl!==FLV(next-1),rgb=TIER_RGB[fl];
  const k=1+(next-7)*.06,sq=document.getElementById('enhSq'),st=document.getElementById('enhStage'),W=document.getElementById('fxW');
  // 換色的高潮特效：沿用 climax 畫格（AI 圖）＋色彩濾鏡，硬切播放
  const box=document.createElement('div');box.className='ly ex-seq';box.style.filter=TIER_FLT[fl];box.style.transform=`scale(${k})`;box.innerHTML=RUNE_FX.climax.map(src=>`<img src="${src}" alt="">`).join('');sq.appendChild(box);
  cutImgs([...box.children],T,REV-60,REV+(up?520:360),{X:80,peak:up?1:.8});
  const f=document.createElement('div');f.className='ex-fl';f.style.background=`radial-gradient(closest-side,rgba(${rgb},.9),rgba(${rgb},0))`;sq.appendChild(f);
  tl(f,T,[[0,{opacity:0,transform:'scale(.5)'}],[REV-20,{opacity:0,transform:'scale(.5)'}],[REV+40,{opacity:up?1:.7,transform:`scale(${1.2*k})`}],[REV+(up?520:340),{opacity:0,transform:`scale(${1.8*k})`}]]);
  if(W)tl(W,T,[[0,{filter:'none'}],[REV,{filter:'none'}],[REV+200,{filter:`drop-shadow(0 0 ${14*k}px rgba(${rgb},1))`}],[T,{filter:`drop-shadow(0 0 ${9*k}px rgba(${rgb},.85))`}]]);
  if(st)tl(st,T,[[0,{boxShadow:'inset 0 0 0 rgba(0,0,0,0)'}],[REV,{boxShadow:'inset 0 0 0 rgba(0,0,0,0)'}],[REV+120,{boxShadow:`inset 0 0 ${40*k}px rgba(${rgb},.85)`}],[T,{boxShadow:`inset 0 0 ${26*k}px rgba(${rgb},.55)`}]]);
  // v4.64 拿掉「升階 +N」大字（Mochi：下面已經有強化成功 +N）
  if(up)later(REV+160,()=>snd('unlock',1,.75));
}
// 一鍵強化：結果已經在 autoEnhance 算好，這裡只逐級播放（每級約 0.3 秒，越後面越快），點畫面略過
// v4.58 +1～+6 單按：不播動畫，只讓石碑亮一下綠光（不鎖按鈕，可以一直連點）
function greenFlash(){const st=document.getElementById('enhStage');if(!st||matchMedia('(prefers-reduced-motion: reduce)').matches)return;st.classList.add('tier');st.style.setProperty('--tf',TIER_FLT[1]);
  const o={duration:520,easing:'ease-out'},g=document.getElementById('rnGlow');if(g)g.animate([{opacity:1},{opacity:1,offset:.25},{opacity:0}],o);
  document.querySelectorAll('#rnSpokes .sp').forEach(e=>e.animate([{opacity:1,filter:'brightness(1.6)'},{opacity:1,filter:'brightness(1.6)',offset:.25},{opacity:0,filter:'brightness(1)'}],o));
  const wi=document.querySelector('#fxW .wimg');if(wi)wi.animate([{filter:`brightness(1.6) drop-shadow(0 0 12px rgba(${TIER_RGB[1]},1))`},{filter:'brightness(1)'}],o)}
// v4.58 +7 起符文亮起時加打閃電（外框顏色）：+7 一道、每高一級多一道，+10 起成功後再補打，+12 最多；只加圖層，不改符文時間軸
// v4.61 危險區強化失敗：符文能量聚起來又熄滅、冒一縷灰煙（Mochi AI 圖），硬切播放
function enhFailFx({T,REV}){const sq=document.getElementById('enhSq');if(!sq)return;const b=document.createElement('div');b.className='ly ex-fail';b.innerHTML=RUNE_FX.fail.map(src=>`<img src="${src}" alt="">`).join('');sq.appendChild(b);
  cutImgs([...b.children],T,REV-200,T-120,{X:60,peak:1})}
function enhBolts(next,k,{T,REV}){const sq=document.getElementById('enhSq');if(!sq||next<7)return;const fl=FLV(next),rgb=TIER_RGB[fl],n=next-6,after=k==='ok'?Math.max(0,next-9):0,P=[[18.7,-.2,1,0],[2,6,-1,-14],[40,4,1,16],[10,-6,-1,8],[34,-8,1,-10],[24,2,-1,4]];
  const end=REV-160,t0=620,gap=Math.max(140,(end-t0)/n),jolt=[[0,{transform:'none'}]];
  const bolt=(t,i,big)=>{const[x,y,fx,r]=P[i%P.length],s=(big?1.25:1)*(1+(next-7)*.05),b=document.createElement('div');b.className='ly ex-bolt';
    const own=fl===6?RUNE_FX.boltGold:fl===5?RUNE_FX.boltDia:null;   // 金、鑽石用專屬閃電圖，其他用原本閃電換色
    b.style.cssText=`left:${x}%;top:${y}%;filter:${own?'':TIER_FLT[fl]} brightness(${1+(next-7)*.12});transform:scaleX(${fx}) rotate(${r}deg) scale(${s})`;b.innerHTML=(own||RUNE_FX.light).map(src=>`<img src="${src}" alt="">`).join('');sq.appendChild(b);
    cutImgs([...b.children],T,t,t+300,{X:30,peak:1});const f=document.createElement('div');f.className='ex-fl';f.style.background=`radial-gradient(closest-side,rgba(${rgb},.55),rgba(${rgb},0))`;sq.appendChild(f);
    tl(f,T,[[0,{opacity:0}],[t,{opacity:0}],[t+40,{opacity:big?.9:.6}],[t+220,{opacity:0}]]);const p=1+(next-7)*.6;jolt.push([t,{transform:'none'}],[t+30,{transform:`translate(${p}px,${-p}px)`}],[t+70,{transform:`translate(${-p}px,${p/2}px)`}],[t+110,{transform:'none'}])};
  for(let i=0;i<n;i++)bolt(t0+gap*i,i,false);for(let i=0;i<after;i++)bolt(REV+260+i*190,n+i,true);
  tl(sq,T,jolt)}
function playCombo(id,from,steps,res){
  stopFx();const st=document.getElementById('enhStage'),w=W(id);if(!st||!w||matchMedia('(prefers-reduced-motion: reduce)').matches){ui.enhLast={...res,test:false};return render()}
  st.classList.add('playing');st.dataset.act='fxskip';st.classList.remove('danger','rn-red','guarded');st.classList.add('safe','tier');st.style.setProperty('--tf',TIER_FLT[1]);{const z=st.querySelector('.enh-zone');if(z)z.textContent='安定區';const L=st.querySelectorAll('.enh-lv .lvt');if(L.length>1){L[0].textContent='+'+from;L[1].textContent='+'+(from+1)}}
  const rb=document.getElementById('enhRibbon');rb.className='enh-ribbon k-ok';rb.innerHTML=`<b>${res.t}</b><span>${res.d}</span>`;rb.style.opacity=0;
  document.querySelectorAll('.sheet [data-act="enhance"],.sheet [data-act="autoEnh"]').forEach(b=>{b.disabled=true});
  fxState={res,w,anims:[],raf:0,done:false,timer:0};ui.fxDone=finishFx;ui.busy=true;
  const ov=exOv(),sq=document.getElementById('enhSq'),cam=document.getElementById('enhCam'),Wp=document.getElementById('fxW'),wi=Wp&&Wp.querySelector('.wimg'),glow=document.getElementById('rnGlow'),hint=document.getElementById('enhHint'),fl=document.getElementById('fxFlash'),SP=[...document.querySelectorAll('#rnSpokes .sp')],lvt=st.querySelectorAll('.enh-lv .lvt');
  const n=steps.length,ts=[];let t=380;for(let i=0;i<n;i++){ts.push(t);t+=Math.max(170,Math.min(420,2600/n)-i*22)}
  const tF=ts[n-1]+120,T=tF+1100;
  tl(cam,T,[[0,CAM(1)],[tF,CAM(1.1,0,4),'ease-in'],[tF+300,CAM(1.02),'ease-out'],[T,CAM(1)]]);
  const shk=[[0,{transform:'none'}]],wst=[[0,{filter:'brightness(1)'}]],gst=[[0,{opacity:0}]];
  steps.forEach((s,i)=>{const a=ts[i],ok=s.k==='ok',p=1+i*1.2/Math.max(1,n-1),b=i+1<n?ts[i+1]:T-120,last=i===n-1;
    later(a,()=>{snd(ok?'enh_spoke':'ui_error',ok?.85+i*.1:1);lvt.forEach((e,j)=>e.textContent='+'+(s.lv-(ok?1:0)+j))});
    if(ok){shk.push([a,{transform:'none'}],[a+30,{transform:`translate(${-p*1.6}px,${p}px)`}],[a+70,{transform:`translate(${p*1.6}px,${-p}px)`}],[a+110,{transform:'none'}]);
      wst.push([a,{filter:`brightness(${1.1+i*.08})`}],[a+40,{filter:`brightness(${1.8+i*.1}) drop-shadow(0 0 ${8+i*2}px rgba(255,210,120,1))`}],[a+200,{filter:`brightness(${1.15+i*.08}) drop-shadow(0 0 ${4+i*1.5}px rgba(255,200,90,.9))`}]);
      gst.push([a,{opacity:.1+.6*i/n}],[a+50,{opacity:.4+.6*(i+1)/n}],[a+220,{opacity:.15+.6*(i+1)/n}])}
    const e=ov.appendChild(exNum(ok?'+'+s.lv:`+${s.lv}<small>失敗</small>`,ok?'':'fail'));
    tl(e,T,[[0,{opacity:0,...POP(1.8)}],[a,{opacity:0,...POP(1.8)}],[a,{opacity:1,...POP(1.8)}],[a+120,{opacity:1,...POP(1)},'ease-out'],...(last?[[tF,{opacity:1,...POP(1)}],[tF+160,{opacity:1,...POP(1.25)},'ease-out'],[tF+400,{opacity:1,transform:'translate(-50%,-78%) scale(.95)'},'ease-out'],[T,{opacity:1,transform:'translate(-50%,-78%) scale(.95)'}]]:[[b,{opacity:1,...POP(1)}],[b,{opacity:0,...POP(1)}]])]);});
  // 八道符文跟著等級一道道亮起，最後一下全亮
  const okIdx=steps.map((s,i)=>s.k==='ok'?i:-1).filter(i=>i>=0);
  SP.forEach((el,j)=>{const i=okIdx[Math.min(okIdx.length-1,Math.floor(j*okIdx.length/SP.length))];if(i==null)return tl(el,T,[[0,{opacity:0}]]);const a=j>=SP.length-1?tF:ts[i];
    tl(el,T,[[0,{opacity:0,filter:'brightness(1)'}],[a,{opacity:0,filter:'brightness(2.2)'}],[a+50,{opacity:1,filter:'brightness(2.2)'}],[a+160,{opacity:1,filter:'brightness(1)'}],[T,{opacity:1,filter:'brightness(1)'}]])});
  shk.push([tF,{transform:'none'}],[tF+40,{transform:'translate(-5px,3px)'}],[tF+90,{transform:'translate(5px,-3px)'}],[tF+140,{transform:'translate(-2px,0)'}],[tF+200,{transform:'none'}]);
  wst.push([tF,{filter:'brightness(2.4)'}],[tF+300,{filter:'brightness(1.8) drop-shadow(0 0 18px rgba(255,220,150,1))'}],[T,{filter:'brightness(1.15) drop-shadow(0 0 8px rgba(255,220,150,.7))'}]);
  gst.push([tF,{opacity:1}],[T,{opacity:.7}]);
  tl(st,T,shk);if(wi)tl(wi,T,wst);if(glow)tl(glow,T,gst);
  playSeq('spark',T,tF-40,tF+260,{X:50,peak:.95});playSeq('ok',T,tF+40,T-150,{X:100});
  fl.style.background='radial-gradient(closest-side,rgba(255,240,210,.95),rgba(255,240,210,0))';tl(fl,T,[[0,{opacity:0,transform:'scale(.5)'}],[tF-40,{opacity:0,transform:'scale(.5)'}],[tF,{opacity:1,transform:'scale(1.3)'}],[tF+280,{opacity:0,transform:'scale(1.8)'}]]);
  tl(rb,T,[[0,{opacity:0,transform:'translateY(10px)'}],[tF+300,{opacity:0,transform:'translateY(10px)'}],[tF+500,{opacity:1,transform:'none'}]]);
  if(hint)tl(hint,T,[[0,{opacity:.75}],[tF-200,{opacity:.75}],[tF,{opacity:0}]]);
  snd('enh_start');later(tF,()=>snd('enh_ok'));fxState.timer=setTimeout(finishFx,T+60);
}
function anim(el,kf,opt){const a=el.animate(kf,{fill:'forwards',easing:'ease-out',...opt});fxState.anims.push(a);return a}
function runTimeline(k,v){
  const T=v.T,W=document.getElementById('fxW'),F=[...document.querySelectorAll('#fxF .vf')],FF=[...document.querySelectorAll('#fxFF .vf')],fl=document.getElementById('fxFlash'),stage=document.querySelector('#enhStage .stage-sq'),aura=stage.querySelector('.fx2-aura'),rb=document.getElementById('enhRibbon');
  // 16 格連續畫格：相鄰兩格透明度交疊（交叉淡化），補足 AI 畫格之間的小落差
  const span=(FX_END-FX_START)/v.N,ov=span*.6,P=peakAt(v);
  F.forEach((f,i)=>{const a=FX_START+span*i,b=a+span;const o=[Math.max(0,a-ov),a,b,Math.min(1,b+ov)];
    const kf=m=>[{opacity:0,offset:0},{opacity:0,offset:o[0]},{opacity:m,transform:'scale(1)',offset:o[1]},{opacity:m,transform:'scale(1.015)',offset:o[2]},{opacity:0,transform:'scale(1.03)',offset:o[3]},{opacity:0,offset:1}];
    anim(f,kf(1),{duration:T,easing:'linear'});if(FF[i])anim(FF[i],kf(k==='fail'?.55:.9),{duration:T,easing:'linear'})});
  // 聚能：所有結果開頭都有能量往武器中心收攏
  burst(v.color,LOW_END?14:28,'in');
  // 衝擊：關鍵瞬間整個舞台頓一下（hit-stop）再彈開，增加重量感
  const punch=k==='ok'?1.05:k==='fail'?1.015:k==='saved'?1.035:1;
  if(punch>1)anim(stage,[{transform:'scale(1)',offset:0},{transform:'scale(1)',offset:Math.max(0,P-.03)},{transform:`scale(${punch})`,offset:P},{transform:`scale(${punch})`,offset:Math.min(.99,P+.04)},{transform:'scale(1)',offset:Math.min(.995,P+.14)},{transform:'scale(1)'}],{duration:T,easing:'linear'});
  anim(aura,[{opacity:0},{opacity:.9,offset:.35},{opacity:.6,offset:.8},{opacity:0}],{duration:T});
  aura.style.background=`radial-gradient(closest-side,rgba(${v.color},.55),transparent)`;
  // 結果文字在關鍵瞬間之後才出現，位置在武器下方
  anim(rb,[{opacity:0,transform:'translateY(10px)',offset:0},{opacity:0,transform:'translateY(10px)',offset:Math.min(.95,P+.1)},{opacity:1,transform:'none',offset:Math.min(.99,P+.2)},{opacity:1,transform:'none'}],{duration:T});
  later(T*P,()=>playSfx('sfx_enh_'+k));
  const hint=document.getElementById('enhHint');if(hint)anim(hint,[{opacity:.75},{opacity:.75,offset:Math.min(.9,P+.05)},{opacity:0,offset:Math.min(.95,P+.1)},{opacity:0}],{duration:T});
  if(k==='ok'){
    anim(W,[{transform:'translateY(6px) scale(.92)',filter:'brightness(1)'},{transform:'translateY(-4px) scale(1.06)',filter:'brightness(1.5) drop-shadow(0 0 14px rgba(255,200,90,.9))',offset:P-.06},{transform:'translateY(-6px) scale(1.1)',filter:'brightness(1.9) drop-shadow(0 0 26px rgba(255,210,120,1))',offset:P},{transform:'translateY(-2px) scale(1.04)',filter:'brightness(1.2) drop-shadow(0 0 16px rgba(255,200,90,.8))'}],{duration:T});
    flash(fl,P,T,'255,236,190',.85);later(T*P,()=>burst(v.color,LOW_END?26:48,'up'));
  }else if(k==='fail'){
    anim(W,[{transform:'translateX(0)'},{transform:'translateX(-4px)',offset:.1},{transform:'translateX(4px)',offset:.2},{transform:'translateX(-3px)',offset:.3},{transform:'translateX(0) scale(.97)',filter:'brightness(.55) saturate(.6)',offset:P+.05},{transform:'scale(1)',filter:'brightness(.85)'}],{duration:T});
    flash(fl,P,T,'140,200,255',.35);later(T*P,()=>burst(v.color,LOW_END?14:26,'fall'));
  }else if(k==='broke'){
    const crack=P; // 對齊爆炸最亮那一格
    anim(W,[{transform:'scale(1)',filter:'brightness(1)'},{transform:'translate(-3px,1px) scale(1.04)',filter:'brightness(1.2) sepia(.4) hue-rotate(-30deg)',offset:.12},{transform:'translate(4px,-2px) scale(1.06)',offset:.2},{transform:'translate(-5px,2px) scale(1.08)',filter:'brightness(1.6) sepia(.8) hue-rotate(-40deg) saturate(2)',offset:.3},{transform:'translate(6px,-3px) scale(1.12)',offset:.38},{transform:'translate(-6px,3px) scale(1.14)',filter:'brightness(2.4) sepia(1) hue-rotate(-45deg) saturate(3)',offset:crack-.01},{opacity:1,offset:crack},{opacity:0,offset:crack+.005},{opacity:0}],{duration:T,easing:'linear'});
    // 關鍵瞬間：武器碎成五塊飛散後消失
    const S=[...document.querySelectorAll('#fxShards .sh')],dir=[[-70,-60,-35],[60,-70,40],[-80,40,-60],[75,50,55],[0,90,20]];
    S.forEach((s,i)=>{const[dx,dy,r]=dir[i];anim(s,[{opacity:0,transform:'translate(0,0) rotate(0)',offset:0},{opacity:0,offset:crack},{opacity:1,transform:'translate(0,0) rotate(0)',offset:crack+.005},{opacity:.9,transform:`translate(${dx*.6}px,${dy*.6}px) rotate(${r*.6}deg)`,offset:crack+.2},{opacity:0,transform:`translate(${dx}px,${dy+40}px) rotate(${r}deg)`}],{duration:T,easing:'cubic-bezier(.2,.7,.4,1)'})});
    flash(fl,crack,T,'255,120,90',.95);later(T*crack,()=>{burst(v.color,LOW_END?36:70,'out');burst('60,30,25',LOW_END?10:20,'out')});
    anim(stage,[{transform:'none',offset:0},{transform:'none',offset:crack},{transform:'translate(-9px,4px)',offset:crack+.03},{transform:'translate(8px,-4px)',offset:crack+.06},{transform:'translate(-5px,2px)',offset:crack+.1},{transform:'none',offset:crack+.15},{transform:'none'}],{duration:T,easing:'linear'});
  }else if(k==='saved'){
    const hit=P; // 對齊紅光撞上護盾那一格
    anim(W,[{transform:'scale(1)',filter:'brightness(1)'},{transform:'translate(-3px,1px) scale(1.04)',filter:'sepia(.5) hue-rotate(-30deg) brightness(1.3)',offset:.15},{transform:'translate(4px,-2px) scale(1.07)',offset:.25},{transform:'translate(-5px,2px) scale(1.09)',filter:'sepia(.9) hue-rotate(-40deg) brightness(1.8) saturate(2)',offset:hit-.02},{transform:'scale(1.02)',filter:'brightness(1.4) drop-shadow(0 0 20px rgba(190,120,255,1))',offset:hit+.04},{transform:'scale(1)',filter:'brightness(1.1) drop-shadow(0 0 10px rgba(190,120,255,.7))'}],{duration:T});
    flash(fl,hit,T,'200,150,255',.8);later(T*hit,()=>{burst('255,80,60',LOW_END?14:26,'deflect');burst(v.color,LOW_END?14:26,'ring')});
  }
  fxState.timer=setTimeout(finishFx,T+60);
}
function later(ms,fn){const id=setTimeout(()=>{if(fxState&&!fxState.done)fn()},ms);fxState.anims.push({cancel:()=>clearTimeout(id),finish:()=>{}})}
function flash(el,at,T,rgb,peak){el.style.background=`radial-gradient(closest-side,rgba(${rgb},${peak}),rgba(${rgb},0))`;anim(el,[{opacity:0,transform:'scale(.6)',offset:0},{opacity:0,transform:'scale(.6)',offset:Math.max(0,at-.02)},{opacity:1,transform:'scale(1.1)',offset:at},{opacity:0,transform:'scale(1.5)',offset:Math.min(1,at+.18)},{opacity:0}],{duration:T,easing:'linear'})}
// 粒子：canvas 繪製，數量依裝置調整，動畫結束自動停止
function burst(rgb,n,mode){
  const cv=document.getElementById('fxCanvas');if(!cv)return;const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H*.48;
  const P=fxState.parts||(fxState.parts=[]);
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=mode==='fall'?1+Math.random()*1.5:2+Math.random()*4.5;
    let vx=Math.cos(a)*sp,vy=Math.sin(a)*sp;if(mode==='up'){vy=-Math.abs(vy)-1.5;vx*=.7}if(mode==='fall'){vy=-1.2-Math.random();vx*=.8}
    if(mode==='in'){const r=120+Math.random()*50;P.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,vx:-Math.cos(a)*r/34,vy:-Math.sin(a)*r/34,life:1,decay:.03,size:1.5+Math.random()*2,rgb,g:0});continue}
    if(mode==='ring'){vx=Math.cos(a)*3.2;vy=Math.sin(a)*3.2}
    const r0=mode==='deflect'?62:mode==='ring'?40:14;
    P.push({x:cx+Math.cos(a)*r0*(mode==='deflect'?1.6:1),y:cy+Math.sin(a)*r0*(mode==='deflect'?1.6:1),vx:mode==='deflect'?-vx*.6:vx,vy:mode==='deflect'?-vy*.6:vy,life:1,decay:.012+Math.random()*.02,size:1.5+Math.random()*(mode==='out'?3.5:2.5),rgb,g:mode==='fall'||mode==='out'?.12:mode==='up'?-.02:0,bounce:mode==='deflect'})}
  if(!fxState.raf){const step=()=>{if(!fxState||fxState.done)return;ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life-=p.decay;
      if(p.bounce&&Math.hypot(p.x-cx,p.y-cy)<64){p.vx*=-1.2;p.vy*=-1.2}
      if(p.life<=0){P.splice(i,1);continue}ctx.fillStyle=`rgba(${p.rgb},${p.life})`;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(.5+p.life*.5),0,7);ctx.fill()}
    fxState.raf=P.length?requestAnimationFrame(step):0};fxState.raf=requestAnimationFrame(step)}
}
function stopFx(){if(!fxState)return;fxState.done=true;clearTimeout(fxState.timer);cancelAnimationFrame(fxState.raf);fxState.anims.forEach(a=>{try{a.cancel()}catch(e){}})}
function finishFx(){if(!fxState||fxState.resultShown)return;const{res}=fxState;stopFx();fxState.resultShown=true;ui.fxDone=null;
  const cv=document.getElementById('fxCanvas');if(cv)cv.getContext('2d').clearRect(0,0,cv.width,cv.height); // 不留殘影
  ui.busy=false;ui.lockUntil=Date.now()+350;ui.enhLast={id:res.id,k:res.k,t:res.t,d:res.d,test:!res.id};renderLayer()}
const FXW={axe:['t2_wolfaxe','霜狼戰斧'],sword:['t2_longsword','霜銀長劍'],spear:['t3_halberd','龍鱗戟'],bow:['t2_longbow','霜銀長弓']};
function testFx(k,safe,guarded,lv=8){const f=FXW[ui.devFxW||'axe'];const art=A(f[0]),name=f[1];
  const t={ok:['強化成功 +'+lv,'只播放特效，不影響存檔'],fail:['強化失敗','只播放特效，不影響存檔'],broke:['武器已損毀','只播放特效，武器沒有真的消失'],saved:['防爆卷生效','只播放特效，不影響存檔']}[k];
  const danger=!safe;ui.enhLast=null;ui.sheet={t:'fxt',k,art,next:lv,danger};renderLayer();ui.busy=true;playFx(danger,{art,name},lv,{k,t:t[0],d:t[1],guarded:!!guarded||(k==='saved'&&!safe)})}   // 防爆生效一定是有勾防爆卷，所以一律藍光
function sheetFxTest(o){const last=ui.enhLast&&ui.enhLast.test?ui.enhLast:null;
  return `<div class="sheet-head"><span style="width:44px"></span><h2>強化動畫測試</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
  ${stageHtml({art:last&&last.k==='broke'?null:o.art,danger:o.danger,from:(o.next||8)-1,to:o.next||8,zone:o.danger?'危險區':'安定區',ribbon:last?`<b>${last.t}</b><span>${last.d}</span>`:'',rk:last&&last.k})}
  <div class="small muted center">使用道具欄裡攻擊力最高的武器播放，不會改動存檔。動畫中點畫面或按按鈕都能略過。</div>
  <div class="fxt-btns">${[['fx_green','+1～+6 綠光'],['fx_ok','危險成功'],['fx_fail','危險失敗'],['fx_broke','爆裝'],['autoenh','一鍵強化到安定值（新增 +0 鐵錘）'],['fxt_7','升階 +7（藍）'],['fxt_8','+8（藍、不升階）'],['fxt_9','升階 +9（紅）'],['fxt_10','升階 +10（金）'],['fxt_11','升階 +11（紫）'],['fxt_12','升階 +12（鑽石）']].map(([k,n])=>btn(n,'devdo',{cls:'btn-sec',attrs:`data-k="${k}"`})).join('')}</div>`}

/* ---------- 共用元件 ---------- */

// ===================== UI 皮膚系統（v4.0）=====================
// 皮膚設定在 skin.js（UI_SKIN、UI_ICON）。槽位全部 null 時不產生任何樣式，外觀與 v3.9 相同。
const SKIN_SLOTS=[
 ['btn-primary','主要按鈕','.ui-btn--primary:not(.sm):not(.big)'],['btn-secondary','次要按鈕','.ui-btn--secondary:not(.sm):not(.big):not(.side-btn)'],['btn-danger','危險按鈕（熔解、重置、無保護強化）','.ui-btn--danger:not(.sm):not(.big)'],
 ['btn-primary-big','主要大按鈕（.big：強化、交付等整排按鈕）','.ui-btn--primary.big'],['btn-secondary-big','次要大按鈕（.big）','.ui-btn--secondary.big'],['btn-danger-big','危險大按鈕（.big：無保護強化）','.ui-btn--danger.big'],
 ['btn-primary-compact','主要小按鈕（.sm）','.ui-btn--primary.sm'],['btn-secondary-compact','次要小按鈕（.sm）','.ui-btn--secondary.sm'],['btn-danger-compact','危險小按鈕（.sm）','.ui-btn--danger.sm'],
 ['btn-chip','篩選／數量小鈕','.ui-btn--chip'],['btn-toggle','分類圖示鈕','.ui-btn--toggle'],['btn-accent','收成鈕','.ui-btn--accent'],['btn-icon','圓形圖示鈕（關閉、說明、＋、齒輪、音效）','.ui-iconbtn'],
 ['tab','分頁鈕（鐵匠鋪子分頁、開發工具分頁）','.ui-tab'],
 ['panel','面板','.ui-panel'],['title','面板標題','.ui-title'],['card','卡片（村莊、商品、委託、已選擇圖紙）','.ui-card:not([class*="ui-card--"]):not(.gemcard)'],['card-compact','小卡片（附魔欄位、鑽石商品）','.ui-card--slot,.gemcard'],['card-feature','展示卡（武器詳情）','.ui-card--feature'],
 ['card-option','選項卡（狩獵策略、附魔詞條）','.ui-card--option'],['card-row','清單列（商人、交付、鍛造佇列）','.ui-card--row'],['badge','標籤','.ui-badge'],
 ['prog','進度條底','.ui-prog'],['prog-fill','進度條填滿','.ui-prog>i'],
 ['sheet','底部抽屜','.ui-sheet'],['modal','置中彈窗','.ui-modal'],['toast','提示訊息','.ui-toast'],
 ['topbar','頂部資源列','.ui-topbar'],['navbar','底部分頁列','.ui-navbar'],['navtab','底部分頁按鈕','.ui-navtab'],['page-bg','頁面背景','body']];
const SKIN_STATE={pressed:s=>`${s}:active:not(:disabled),${s}.is-pressed`,disabled:s=>`${s}:disabled,${s}.is-disabled`,on:s=>`${s}.on,${s}.is-on`};
const UI_ICON_GLYPH={'info':'ⓘ','arrow-next':'➜','arrow-left':'‹','arrow-right':'›','clear':'✕','sound-on':'🔊','sound-off':'🔇'};
// 介面圖示：skin.js 有設定圖片就用圖片，否則輸出原本的文字符號
function ic(n){const src=typeof UI_ICON!=='undefined'&&UI_ICON[n];return src?`<img class="ui-ic" src="${src}" alt="">`:UI_ICON_GLYPH[n]}
// 皮膚規則加上 :not(#_)（ID 等級權重），確保蓋過原本樣式（例如 .nav button），但不使用 !important
const boostSel=sel=>sel.split(',').map(x=>x.trim()+':not(#_)').join(',');
function skinCss(){if(typeof UI_SKIN==='undefined')return'';const out=[];
  for(const [key,cfg] of Object.entries(UI_SKIN)){if(!cfg||(!cfg.src&&cfg.mode!=='clear'))continue;const [vslot,state]=key.split(':'),slot=vslot.split('|')[0];const def=SKIN_SLOTS.find(x=>x[0]===slot);if(!def)continue;
    const base=Object.assign({},UI_SKIN[vslot]||{},cfg),sel=boostSel(state?(SKIN_STATE[state]||(x=>x))(def[2]):def[2]);
    if(state&&UI_SKIN[vslot]&&UI_SKIN[vslot].src&&!cfg.slice&&(base.mode||'9slice')==='9slice'){out.push(`${sel}{border-image-source:url("${cfg.src}")${cfg.css?';'+cfg.css:''}}`);continue}
    const ex=`${base.shadow?'':';box-shadow:none'}${base.css?';'+base.css:''}`;
    // clear：拿掉原本的 CSS 外框與背景（素材本身已經含外框時用，例如圓形圖示按鈕）
    if(base.mode==='clear'){out.push(`${sel}{background:none;border-color:transparent${ex}}`);continue}
    if((base.mode||'9slice')==='bg'){out.push(`${sel}{background:url("${cfg.src}") center/100% 100% no-repeat;border-color:transparent${ex}}`);continue}
    // fit：整張等比縮放置中（旗幟、徽章、稀有度框等不能伸縮的素材）
    if(base.mode==='fit'){out.push(`${sel}{background:url("${cfg.src}") center/contain no-repeat;border-color:transparent${ex}}`);continue}
    // width：只設定圖框的繪製寬度（border-image-width），不改元件原本的邊框寬度，所以版面尺寸完全不變。
    //   上下寬度相加 ≥ 元件高度時，瀏覽器會把四邊等比例縮小 → 只能橫向伸縮的素材（3-slice）用這個方式，四角不會變形。
    if(base.width){const sl=(base.slice||[24,24,24,24]).join(' '),iw=base.width.map(v=>typeof v==='number'?v+'px':v).join(' ');
      out.push(`${sel}{border-color:transparent;border-image:url("${cfg.src}") ${sl}${base.fill===false?'':' fill'} / ${iw} / ${base.outset||0} ${base.repeat||'stretch'};background:none${ex}}`);
      // overlay：不能被拉伸的中央裝飾（例如導航列中間的鑽飾）另外疊一層，固定比例置中，不跟著元件寬度變形
      if(base.overlay){const ov=base.overlay;out.push(`${sel.split(',').map(x=>x+'::before').join(',')}{content:"";position:absolute;left:50%;top:0;height:100%;aspect-ratio:${ov.ratio};transform:translateX(-50%);background:url("${ov.src}") center/100% 100% no-repeat;pointer-events:none}`)}
      continue}
    const sl=(base.slice||[24,24,24,24]).join(' '),bw=(base.border||(base.slice||[24,24,24,24]).map(v=>Math.round(v/3))).map(v=>v+'px').join(' ');
    out.push(`${sel}{border-style:solid;border-color:transparent;border-width:${bw};border-image:url("${cfg.src}") ${sl}${base.fill===false?'':' fill'} / ${bw} ${base.repeat||'stretch'};background:none${base.shadow?'':';box-shadow:none'}${base.css?';'+base.css:''}}`)}
  return out.join('\n')}
// minWidth：某些素材在窄螢幕不合用時，只在畫面寬度 ≥ minWidth 才套用（較窄時維持原外觀，同一寬度下所有同類元件仍一致）
// 同一槽位可以有寬度變體：鍵名寫成 'btn-primary|narrow'，並用 maxWidth 指定只在窄螢幕套用（例：maxWidth:360）
function skinCssWrapped(){if(typeof UI_SKIN==='undefined')return'';const groups={};
  for(const [key,cfg] of Object.entries(UI_SKIN)){const vs=key.split(':')[0],b=UI_SKIN[vs]||{},c=cfg||{};const mn=c.minWidth||b.minWidth||0,mx=c.maxWidth||b.maxWidth||0;
    const mq=[mn?`(min-width:${mn}px)`:'',mx?`(max-width:${mx}px)`:''].filter(Boolean).join(' and ');(groups[mq]=groups[mq]||{})[key]=cfg}
  const all=UI_SKIN,out=[];
  for(const [mw,g] of Object.entries(groups)){const saved={};for(const k of Object.keys(all)){saved[k]=all[k];if(!(k in g))all[k]=null}
    // 狀態槽需要知道一般狀態有沒有圖：把同組的一般狀態留著
    for(const k of Object.keys(g)){const sl=k.split(':')[0];if(saved[sl])all[sl]=saved[sl]}
    const css=skinCss();Object.assign(all,saved);if(!css)continue;out.push(mw?`@media ${mw}{\n${css}\n}`:css)}
  return out.join('\n')}
function applySkin(){if(typeof document==='undefined')return;let el=document.getElementById('ui-skin');const css=skinCssWrapped();
  if(!css){if(el)el.remove();return}if(!el){el=document.createElement('style');el.id='ui-skin';document.head.appendChild(el)}el.textContent=css}
// UI 元件總覽（開發工具 → UI 元件）：逐一檢視所有元件與狀態，換上美術後在這裡驗收
// 第二階段候選皮膚預覽：暫時把 UI_SKIN_PREVIEW 等套上，再按一次還原（不存檔）
let P2_BAK=null;
function p2Toggle(){if(typeof UI_SKIN_PREVIEW==='undefined')return;
  if(P2_BAK){for(const k of Object.keys(UI_SKIN))if(!(k in P2_BAK.s))delete UI_SKIN[k];Object.assign(UI_SKIN,P2_BAK.s);Object.assign(UI_ICON,P2_BAK.i);for(const k of Object.keys(UI_ART))delete UI_ART[k];Object.assign(UI_ART,P2_BAK.a);P2_BAK=null}
  else{P2_BAK={s:{...UI_SKIN},i:{...UI_ICON},a:{...UI_ART}};Object.assign(UI_SKIN,UI_SKIN_PREVIEW);Object.assign(UI_ICON,UI_ICON_PREVIEW);Object.assign(UI_ART,UI_ART_PREVIEW)}
  applySkin();render()}
function uiGallery(){
  const st=['一般','按下','停用'],stc=['','is-pressed','is-disabled'];
  const row=(title,html)=>`<div class="uig-row"><div class="uig-k">${title}</div><div class="uig-v">${html}</div></div>`;
  const B3=(v,cls)=>stc.map((c,i)=>`<button class="ui-btn ui-btn--${v} btn ${cls} ${c}" ${c==='is-disabled'?'disabled':''}>${st[i]}</button>`).join('');
  const slots=SKIN_SLOTS.map(([k,n,sel])=>{const on=typeof UI_SKIN!=='undefined'&&UI_SKIN[k]&&(UI_SKIN[k].src||UI_SKIN[k].mode==='clear');const states=Object.keys(UI_SKIN||{}).filter(x=>x.startsWith(k+':')).map(x=>`${x.split(':')[1]}${UI_SKIN[x]&&UI_SKIN[x].src?'✔':''}`).join(' ');
    return `<tr><td>${k}</td><td>${n}</td><td><code>${sel}</code></td><td class="${on?'t-ok':'muted'}">${on?(UI_SKIN[k].src?`<img class="uig-thumb" src="${UI_SKIN[k].src}" alt="">已套用`:'已套用（拿掉外框）'):'未設定（原外觀）'}</td><td class="small">${states}</td></tr>`}).join('');
  const icons=Object.keys(UI_ICON_GLYPH).map(k=>`<span class="uig-ico">${ic(k)}<small>${k}</small></span>`).join('')+['ic_close','ic_back','ic_gear','ic_plus','ic_lock','ic_unlock','ic_check','ic_star'].map(n=>`<span class="uig-ico">${img(n)}<small>${n}</small></span>`).join('');
  const test=typeof UI_SKIN!=='undefined'&&UI_SKIN['btn-primary']&&UI_SKIN['btn-primary']._test;
  return `<div class="uig">
   <div class="label">皮膚系統狀態（skin.js）</div>
   <div class="small muted">槽位 null＝使用目前 CSS 外觀。填入 src 後全遊戲同步更新。狀態欄的 ✔ 表示該狀態已設定圖片。</div>
   <div class="uig-scroll"><table class="uig-tbl"><tr><th>槽位</th><th>元件</th><th>選擇器</th><th>目前</th><th>狀態槽</th></tr>${slots}</table></div>
   <div class="row" style="margin:8px 0">${btn(test?'還原 9-slice 試套':'用現有木紋按鈕圖試套 9-slice','uiskintest',{cls:'btn-sec sm'})}<span class="small muted">只影響畫面，不存檔；重新整理即恢復</span></div>
   ${typeof UI_SKIN_PREVIEW!=='undefined'?`<div class="row" style="margin:0 0 8px">${btn(P2_BAK?'還原原本外觀':'預覽第二階段候選皮膚','uiskinp2',{cls:(P2_BAK?'btn-sec':'btn-primary')+' sm'})}<span class="small muted">套用 skin.js 的 UI_SKIN_PREVIEW（已驗證素材），不存檔</span></div>`:''}
   <div class="row" style="margin:0 0 8px"><span class="small muted">村莊詳細頁</span>${['O','1','2'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.villV||'2')===k?'on':''}" data-act="villv" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}<span class="small muted">成就</span>${['O','1','2'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.achV2||'O')===k?'on':''}" data-act="achv2" data-k="${k}">${k==='O'?'目前':k}</button>`).join('')}<span class="small muted">鐵匠鋪內容</span>${['O','1','2'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.forgeV||'O')===k?'on':''}" data-act="forgev" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>
   <div class="row" style="margin:0 0 8px"><span class="small muted">強化頁版型</span>${['O','1','2','3'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.enhV||'2')===k?'on':''}" data-act="enhv" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>
   <div class="row" style="margin:0 0 8px"><span class="small muted">鐵匠鋪版型</span>${['O','A','B','C','D','E','F'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.heroV||'O')===k?'on':''}" data-act="herov" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>
   <div class="row" style="margin:0 0 8px">${btn(document.body.classList.contains('dpv')?'關閉景深圖層（比較用）':'開啟景深圖層','uidpv',{cls:(document.body.classList.contains('dpv')?'btn-sec':'btn-primary')+' sm'})}<span class="small muted">鐵匠鋪、強化石碑的前後景圖層與視差（預設開啟）</span></div>
   <div class="row" style="margin:0 0 8px">${btn(document.body.classList.contains('fpv')?'還原原本外觀（武器框）':'預覽武器框風格','uifpv',{cls:(document.body.classList.contains('fpv')?'btn-sec':'btn-primary')+' sm'})}<span class="small muted">全部框線改成武器框風格（現有武器框換色試套），不存檔</span></div>
   <div class="label">按鈕（一般／按下／停用）</div>
   ${row('主要 btn-primary',B3('primary','btn-primary'))}${row('次要 btn-secondary',B3('secondary','btn-sec'))}${row('危險 btn-danger',B3('danger','btn-danger'))}
   ${row('尺寸',`<button class="ui-btn ui-btn--primary btn btn-primary sm">小 sm</button><button class="ui-btn ui-btn--primary btn btn-primary">一般</button><button class="ui-btn ui-btn--primary btn btn-primary big">大 big</button>`)}
   ${row('小鈕 btn-chip',`<button class="ui-btn ui-btn--chip chipbtn">一般</button><button class="ui-btn ui-btn--chip chipbtn on">選中</button><button class="ui-btn ui-btn--chip qchip">×5</button><button class="ui-btn ui-btn--chip qchip on">×10</button>`)}
   ${row('分類鈕 btn-toggle',`<button class="ui-btn ui-btn--toggle cat">${img('cat_axe')}<span>斧</span></button><button class="ui-btn ui-btn--toggle cat on">${img('cat_sword')}<span>劍</span></button>`)}
   ${row('收成鈕 btn-accent',`<button class="ui-btn ui-btn--accent harvest-btn"><span>收成</span><b>×12</b></button><button class="ui-btn ui-btn--accent harvest-btn is-pressed"><span>收成</span><b>×12</b></button>`)}
   ${row('圖示鈕 btn-icon',`${btn(img('ic_close'),'',{cls:'icon-btn img'})}<span class="uig-ib"><button class="ui-iconbtn info-btn">${ic('info')}</button></span><button class="ui-iconbtn plus">${img('ic_plus')}</button><button class="ui-iconbtn gear">${img('ic_gear')}</button><button class="ui-iconbtn mute">${ic('sound-on')}</button>`)}
   ${row('分頁 tab',`<div class="subtabs uig-inline"><button class="ui-tab on">圖紙</button><button class="ui-tab">材料</button><button class="ui-tab">鍛造中</button></div>`)}
   <div class="label">面板、標題、卡片</div>
   <div class="ui-panel panel">${ptitle('面板標題 ptitle')}${kv('數值列 kv','1,234')}<div class="ui-prog prog"><i style="width:62%"></i></div><span class="ui-badge badge">標籤</span></div>
   <div class="uig-grid"><div class="ui-card pcard"><b>商品卡 card</b><span class="small muted">說明文字</span></div><div class="ui-card ui-card--option strat"><b>選項卡</b><span class="small">一般</span></div><div class="ui-card ui-card--option strat on"><b>選項卡</b><span class="small">選中</span></div></div>
   <div class="ui-card ui-card--row mrow">${img('mat_iron')}<div class="grow"><b>清單列 card-row</b><span class="small muted">商人、交付、佇列</span></div></div>
   <div class="label">武器格與強化等級框</div>
   <div class="wgrid uig-wgrid">${[0,3,7,9,10,11,12].map(lv=>`<div class="wt ${lc({lv})}b"><span class="wt-art">${wArt('t2_longsword',{frame:fq({lv})})}</span><span class="wt-name ${lc({lv})}"><span class="wt-lv">+${lv}</span>${FLV_T[FLV(lv)]}</span></div>`).join('')}</div>
   <div class="label">視窗</div>
   <div class="uig-demo"><div class="ui-sheet sheet uig-static"><div class="sheet-head"><span style="width:44px"></span><h2>底部抽屜 sheet</h2>${btn(img('ic_close'),'',{cls:'icon-btn img'})}</div><div class="small">內容區</div></div></div>
   <div class="uig-demo"><div class="ui-modal modal-card uig-static">${ptitle('置中彈窗 modal')}<div class="small center">說明文字</div>${btn('確定','',{cls:'btn-primary big'})}</div></div>
   <div class="uig-demo"><div class="ui-toast toast uig-static">提示訊息 toast</div><div class="ui-toast toast bad uig-static">錯誤提示 toast.bad</div></div>
   <div class="label">頂部列與底部分頁</div>
   <div class="uig-demo"><div class="ui-topbar bar uig-static"><div class="bar-in"><div class="res">${document.getElementById('res')?document.getElementById('res').innerHTML:''}</div></div></div></div>
   <div class="uig-demo"><nav class="ui-navbar nav uig-static"><div class="nav-in">${document.getElementById('nav')?document.getElementById('nav').innerHTML:''}</div></nav></div>
   <div class="label">介面圖示（文字符號槽位＋現有圖片）</div><div class="uig-icons">${icons}</div>
   <div class="label">品質色與主色</div><div class="uig-icons">${['--q0','--q1','--q2','--q3','--q4','--gold','--gold-hi','--ember','--frost','--ok','--danger','--bone','--ash','--line2'].map(v=>`<span class="uig-sw"><i style="background:var(${v})"></i><small>${v}</small></span>`).join('')}</div>
   <div class="label">字級</div><div>${[12,13,15,17,20,24,32].map(z=>`<div style="font-size:${z}px;line-height:1.3">${z}px 諸神鐵匠 Nine Realms</div>`).join('')}</div>
  </div>`}

const img=(n,cls='',alt='')=>`<img class="${cls}" src="${A(n)}" alt="${alt}">`;
const btnVariant=cls=>/btn-primary/.test(cls)?'primary':/btn-danger|btn-risk/.test(cls)?'danger':/icon-btn/.test(cls)?'icon':'secondary';
const btn=(label,act,{cls='btn-sec',attrs='',dis=false}={})=>`<button class="ui-btn ui-btn--${btnVariant(cls)} btn ${cls}" data-act="${act}" ${attrs} ${dis?'disabled':''}>${label}</button>`;
const ptitle=t=>`<div class="ui-title ptitle"><span>${t}</span></div>`;
const kv=(k,v)=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`;
// v4.55 同款武器疊一格（Mochi）：同圖紙、同強化等級、同屬性、同收藏／測試狀態，而且閒置中才疊；駐守中的一把一格
const wKey=w=>[w.b,w.lv|0,(e=>e?e.k+e.t:'')(wElem(w)),w.lock?1:0,w.test?1:0].join('|');
const wStackable=w=>where(w)<0&&bossSlotOf(w)<0;
function wStacks(ws){const m=new Map(),out=[];ws.forEach(w=>{if(!wStackable(w))return out.push({w,n:1,nw:wNew(w)});const k=wKey(w);let g=m.get(k);if(!g){g={w,n:0,nw:false};m.set(k,g);out.push(g)}g.n++;g.nw=g.nw||wNew(w)});return out}
// v4.60 一鍵安定值後：小卡留在同款那一格（換成下一把還沒強化的同款），動畫播完才換
function stkFollow(){const n=ui.stkNext,s=ui.sheet;if(!n||ui.busy)return;ui.stkNext=null;if(!s||s.t!=='w'||s.id!==n.id)return;
  const w=W(n.id);if(w&&wStackable(w)&&wKey(w)===n.k)return;const x=S.weapons.find(v=>v.id!==n.id&&wStackable(v)&&wKey(v)===n.k);if(!x)return;
  const r=ui.enhLast&&ui.enhLast.id===n.id?ui.enhLast:null;s.id=x.id;s.m='main';ui.enhLast=null;if(r)toast(`${r.t}<br>${r.d}`,'ok')}
const wSame=w=>wStackable(w)?S.weapons.filter(x=>wStackable(x)&&wKey(x)===wKey(w)).length:1;
function wTile(w,act,dot,n=1,nw=wNew(w)){const b=bpOf(w),i=where(w);
  return `<button class="wt ${lc(w)}b ${i>=0?'posted':''} ${w.lock?'locked-fav':''}" ${act}>${dot?'<i class="dot give-dot" title="可以交付村莊"></i>':''}<span class="wt-art">${wArt(b.id,{frame:fq(w)})}
   ${i>=0?`<span class="wt-post">駐守 ${vNo(i)}</span>`:bossSlotOf(w)>=0?'<span class="wt-post boss">討伐首領</span>':''}${nw?'<span class="new-tag">NEW</span>':''}${n>1?`<i class="ib-x wt-x">×${fmt(n)}</i>`:''}</span>
   <span class="wt-name ${lc(w)}"><span class="wt-lv">+${w.lv}</span>${(e=>e?`<span class="wn-el e-${e.k} t${e.t}">${e.tn}</span> `:'')(wElem(w))}${b.n}${w.lock?img('ic_lock','wt-lk','已鎖定'):''}</span></button>`}
function bpTile(b,on){const l=bpLock(b);return `<button class="wt bp ${on?'on':''} ${l?'locked':''}" data-act="bp" data-k="${b.id}"><span class="wt-art">${wArt(b.id,{frame:'bp'})}${l?`<span class="wt-lock">${img('ic_lock')}</span>`:''}${bpNew(b)?'<span class="new-tag">NEW</span>':''}</span><span class="wt-name">${b.n}</span>${l?`<span class="wt-pow wt-lockline">${l}</span>`:`<span class="wt-pow">${kindN(b)}・${CATS[b.cat]}</span>`}</button>`}
const matBox=(k,need)=>need==null?`<button class="matbox mb-tap" data-act="matinfo" data-k="${k}">${img(MATART[k])}<span class="mb-n">${MATS[k]}</span><span class="mb-c">${fmt(S.mats[k])}</span></button>`
  :`<div class="matbox need ${S.mats[k]<need?'lack':'ok'}">${img(MATART[k])}<span class="mb-n">${MATS[k]}</span><span class="mb-have">持有 ${fmt(S.mats[k])}</span><span class="mb-need">需要 ${fmt(need)}</span></div>`;
// v4.43 道具欄：同一種道具疊在同一格，右下角是數量（Mochi 選），沒有上限
// v4.43 下方導覽「武器庫」改成「道具欄」，分「武器／材料」兩頁（Mochi）；材料頁放道具（英靈・遺物）和材料
const atabs=()=>`<div class="subtabs atabs">${[['w','武器'],['m','材料'],['c','圖鑑']].map(([k,n])=>`<button class="ui-tab ${(ui.atab||'w')===k?'on':''}" data-act="atab" data-k="${k}">${n}${k==='c'&&cxAny()?'<i class="dot give-dot"></i>':''}</button>`).join('')}</div>`;
// v4.72 武器圖鑑頁：上方總加成，下面分「武器（每把 3 格）／套裝」
function viewCodex(){const p=cxPct(),n=cxN(),tot=cxBps().length*3,sub=ui.cxs||'w';
  const head=`<div class="arm-head"><div class="pagehead"><h2>道具欄</h2><span class="num">${S.weapons.length}/${CAP_WEAPONS}</span></div>${atabs()}</div>
  <div class="cx-sum">${img('nav_armory')}<div class="grow"><div class="small muted">圖鑑加成・所有武器攻擊力</div><b class="cx-big">+${p}%</b><div class="small muted">已登錄 ${n}／${tot} 格・登錄後武器會消失</div><div class="cx-bar"><i style="width:${tot?n/tot*100:0}%"></i></div></div></div>
  <div class="cx-sub">${[['w','武器（每把 3 格）'],['s',`套裝 ${CX_SETS.filter(cxSetOk).length}／${CX_SETS.length}`]].map(([k,t])=>`<button class="${sub===k?'on':''}" data-act="cxsub" data-k="${k}">${t}</button>`).join('')}</div>`;
  if(sub==='s')return head+CX_SETS.map(x=>{const ok=cxSetOk(x),c=x.ks.filter(k=>cxHas(k,x.j)).length,L=CX_LV[x.j];
    return `<div class="cx-set ${ok?'ok':''}"><h4>${x.n}<span>${ok?'✓ ':''}攻擊力 +${x.v}%</span></h4><div class="small muted">${x.d}（${c}／${x.ks.length}）</div><div class="cx-mem">${x.ks.filter(k=>BP[k]).map(k=>`<div class="m ${cxHas(k,x.j)?'y l'+FLV(L):'no'}">${wArt(k,{frame:'_lv'+FLV(L)})}+${L}</div>`).join('')}</div></div>`}).join('');
  return head+CX_GRP.map(([g,f])=>{const bs=cxBps().filter(f);if(!bs.length)return'';
    return `<div class="cx-grp">${g}<span>${bs.reduce((a,b)=>a+CX_LV.filter((L,j)=>cxHas(b.id,j)).length,0)}／${bs.length*3}</span></div>`+bs.map(b=>{const top=[2,1,0].find(j=>cxHas(b.id,j));
      return `<div class="cx-row">${wArt(b.id,{frame:'_lv'+(top==null?0:FLV(CX_LV[top]))})}<div class="cx-nm">${b.n}</div><div class="cx-sl">${CX_LV.map((L,j)=>{const d=cxHas(b.id,j),c=!d&&cxCan(b.id,j);
        return `<button class="cx-s ${d?'done l'+FLV(L)+'b':c?'can':''}" data-act="cxreg" data-k="${b.id}" data-j="${j}"><b>+${L}</b>${d?'✓ '+CX_V[j]+'%':c?'可登錄':'+'+CX_V[j]+'%'}</button>`}).join('')}</div></div>`}).join('')}).join('')}
// 點格子：已登錄／沒有武器就說明，有武器就跳確認（登錄後武器消失）
function cxAsk(k,j){const b=BP[k],L=CX_LV[j];if(!b)return;
  if(cxHas(k,j))return toast(`${b.n} +${L} 已登錄：所有武器攻擊力 +${CX_V[j]}%`,'ok');
  const w=cxCands(k,j)[0];if(!w)return toast(`道具欄沒有可以登錄的 +${L} 以上${b.n}（駐守中、鎖定的不能登錄）`,'bad');
  const sets=CX_SETS.filter(x=>x.j===j&&x.ks.includes(k)).map(x=>`<div class="cx-gain"><span>套裝「${x.n}」</span><b>${x.ks.filter(q=>cxHas(q,x.j)).length}／${x.ks.length} → ${x.ks.filter(q=>q===k||cxHas(q,x.j)).length}／${x.ks.length}</b></div>`).join('');
  ui.result={t:'info',title:'登錄圖鑑',html:`<div class="cx-pw">${wArt(k,{frame:fq(w)})}</div><div class="cx-pn ${lc(w)}">${wName(w)}</div><div class="small muted cx-pick">自動選：+${L} 以上、等級最低、沒駐守、沒鎖定的那把</div><div class="cx-gain"><span>這格加成</span><b>所有武器攻擊力 +${CX_V[j]}%</b></div>${sets}<div class="cx-warn">登錄後這把武器會消失，不能拿回來。</div>`,
    acts:btn('登錄','cxdo',{cls:'btn-primary big',attrs:`data-k="${k}" data-j="${j}"`}),ok:'取消'};render()}

function viewBag(){const mk=Object.keys(MATS);
  return `<div class="pagehead"><h2>道具欄</h2></div>${atabs()}<div class="ui-panel panel"><div class="small muted">同一種東西放同一格，右下角是數量，沒有上限。點一下看說明。</div>
   <div class="ib-h"><b>道具</b><span>${Object.keys(ITEMS).length} 種</span></div><div class="matgrid">${Object.keys(ITEMS).map(itemBox).join('')}</div>
   <div class="ib-h"><b>材料</b><span>${mk.length} 種</span></div>${mk.length?`<div class="matgrid">${mk.map(k=>matBox(k)).join('')}</div>`:'<div class="small muted">新的材料設計中。</div>'}</div>`}
const itemBox=k=>`<button class="matbox mb-tap ib" data-act="iteminfo" data-k="${k}"><span class="ib-ico">${itemIco(k)}${S.items[k]?`<i class="ib-x">×${fmt(S.items[k])}</i>`:''}</span><span class="mb-n">${ITEMS[k][0]}</span>${ITEMS[k][3]?`<span class="ib-gl" style="color:${ITEMS[k][4]}">${ITEMS[k][3]}</span>`:''}</button>`;
function itemInfo(k){const n=S.items[k]|0;
  if(RELICS.includes(k)){const tab=RELIC_TAB[k],o=relicOdds(relicTop());   // v4.54 遺物：顯示開出機率表＋打開按鈕
    const t=`<div class="rl-tab">${RELIC_K.map((x,j)=>tab[j]?`<span>${RELIC_KN[j]}</span><b>${tab[j]}%</b>`:'').join('')}</div><div class="small muted">材料、Boss 素材是你目前推到的那一界的；武器是那一界已解鎖的一般或怪物武器。目前每打倒一隻 ${RELIC_P*100}% 掉遺物，其中${ITEMS[k][3]} ${r1(o[k])}%。</div>`;
    return {ico:itemIco(k),title:itemName(k),html:`持有 <b>${fmt(n)}</b> 個<br><br>${ITEMS[k][2]}<br><br><b>打開可能得到</b>${t}`,acts:n?`<div class="rl-acts">${btn('打開 1 個','relicopen',{cls:'btn-sec big',attrs:`data-k="${k}" data-n="1"`})}${n>1?btn(`全部打開（${fmt(n)}）`,'relicopen',{cls:'btn-primary big',attrs:`data-k="${k}" data-n="0"`}):''}</div>`:''}}
  return {ico:itemIco(k),title:itemName(k),html:`持有 <b>${fmt(n)}</b> 個<br><br>${ITEMS[k][2]}`}}
// v4.54 材料在哪裡掉（鍛造缺材料時提示）
const matWhere=k=>{const r=REALM_MAT.findIndex(x=>x.includes(k));if(r>=0)return '第'+'一二三四五六七八九'[r]+'界每一關';const e=Object.entries(MAT_EXTRA).find(([i,x])=>x[0]===k);return e?vNo(+e[0])+' '+VILLAGES[e[0]].name:''};
const relicGot=g=>Object.entries(g).filter(([k,n])=>n).map(([k,n])=>`<div class="hico">${itemIco(k)}<span class="num">×${fmt(n)}</span><span class="hn">${k==='gold'?'金幣':itemName(k)}</span></div>`).join('');
// v4.54 打開遺物的結果
function relicOpen(k,n){const r=relicOpenCore(k,n);if(!r)return toast('沒有這個遺物','bad');const ws=(r.got._w||[]).map(id=>W(id)).filter(Boolean);delete r.got._w;snd('unlock');
  ui.result={t:'info',ico:itemIco(k),title:`打開 ${r.n} 個${ITEMS[k][3]}遺物`,html:`<div class="mats rl-got">${relicGot(r.got)}</div>${ws.length?`<div class="rl-w"><b>開到武器</b>${ws.map(w=>`<span class="${lc(w)}">${bpOf(w).n} +${w.lv}</span>`).join('、')}（已放進道具欄）</div>`:''}`,acts:(S.items[k]|0)?btn(`繼續打開（剩 ${fmt(S.items[k])}）`,'relicopen',{cls:'btn-sec big',attrs:`data-k="${k}" data-n="0"`}):''};render()}
// v3.61 材料倉庫：點材料顯示用途（哪些材質的圖紙會用到）與取得方式，直接從圖紙配方、村莊掉落、商店資料算出來
function matInfo(k,vp){const tiers=[...new Set(BPS.filter(b=>recipe(b)[k]).map(b=>TIERS[b.t].n))],named=BPS.filter(b=>b.r&&b.r[k]).map(b=>b.n);
  const use=[];if(named.length)use.push(`鍛造 <b>${named.join('、')}</b>`);   // v4.54 新材料：列出用到的圖紙
  const src=[];
  const vs=VILLAGES.map((v,i)=>v.drops.some(d=>d[0]===k)?vNo(i)+' '+v.name:null).filter(Boolean);if(vs.length)src.push('村莊狩獵：'+vs.join('、'));if(RELIC_N&&Object.values(REALM_MAT).flat().includes(k))src.push('英靈・遺物');
  return {icon:MATART[k],title:MATS[k],html:`持有 <b>${fmt(S.mats[k])}</b> 個${vp?`・本村每打倒一隻 <b>${vp}</b>`:''}${MAT_D[k]?`<br><br>${MAT_D[k]}`:''}<br><br><b>用途</b>：${use.join('；')||'—'}<br><br><b>取得</b>：${src.join('；')||'—'}`}}
// 上方資源列：10 萬以上縮寫成「12.3萬」，避免手機上擠到玩家暱稱
const fmtS=n=>n>=1e5?(Math.floor(n/1e3)/10).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'萬':fmt(n);
let RES_H='';function renderRes(){const el=document.getElementById('res');if(!el)return;
  const h=`<button class="player" data-act="player" aria-label="鐵匠等級 Lv.${smithLv()}">${img('ui_player_emblem','emblem')}<i class="lvb">Lv${smithLv()}</i><span class="pname"><span class="small muted">Lv.${smithLv()}</span><b>${esc(S.nick||(AUTH?'未命名鐵匠':'訪客鐵匠'))}</b></span></button>
  <span class="chip">${img('it_gold')}<b class="num">${fmtS(S.gold)}</b></span><span class="chip">${img('it_gems')}<b class="num">${fmtS(S.gems)}</b><button class="ui-iconbtn plus" data-act="tab" data-k="shop" aria-label="儲值">${img('ic_plus')}</button></span><button class="ui-iconbtn mute st-gear" data-act="set" aria-label="設定、公告與玩法說明">${img('ic_gear')}${setDotN()?'<i class="st-dot"></i>':''}</button>`;if(h!==RES_H||!el.firstChild){RES_H=h;el.innerHTML=h}}
const ART_HAS_NAV_MARKET=true;    // 交易所分頁圖示（AI 美術）到位後改 true
const TABS=[['village','村莊','nav_village'],['forge','鐵匠鋪','nav_forge'],['armory','道具欄','nav_armory'],['market','交易所',ART_HAS_NAV_MARKET?'nav_market':'it_gold'],['shop','商城','nav_shop']];
let NAV_H='';function renderNav(){const N=document.getElementById('nav'),h=TABS.map(([k,n,ic])=>{const dot=k==='village'?bossDot()||S.villages.some(v=>v.bank.cycles)||anyGive()||questDotN()>0:k==='armory'?anyGive()||cxAny()||ui.tab!=='armory'&&S.weapons.some(wNew)
    :k==='forge'?forgeIdle()||BPS.some(bpNew):k==='market'?(S.mkNew>0||mkClaimN()>0)&&ui.tab!=='market':k==='shop'?monthlyDot()||signReady():false,hot=k==='village'&&S.villages.some((st,i)=>vState(i)[0]==='full');
  return `<button data-act="tab" data-k="${k}" class="ui-navtab ${ui.tab===k?'on':''}">${img(ic)}<span>${n}</span>${dot||hot?`<i class="dot give-dot${hot?' hot':''}"></i>`:''}</button>`}).join('');if(h!==NAV_H||!N.firstChild){NAV_H=h;N.innerHTML=h}}

/* ---------- 鐵匠鋪 ---------- */
function commissionCard(){const i=S.villages.findIndex(v=>v.status==='open');
  if(i<0)return `<div class="ui-card comm">${ptitle('目前委託')}<div class="small center">所有村莊都已收復</div></div>`;
  const v=VILLAGES[i],best=S.weapons.reduce((m,w)=>Math.max(m,power(w)),0);
  return `<div class="ui-card comm">${ptitle('目前委託')}<div class="comm-in">${img('v'+(i+1),'comm-img')}<div><b>${vNo(i)} ${v.name}</b><div class="small muted">任何武器都能交付</div></div></div>
   ${btn('前往村莊 »','tab',{cls:'btn-sec sm',attrs:'data-k="village"'})}</div>`}
// 版型 E 場景互動：場景裡的物件本身就是按鈕（炭火桶＝熔解、鐵砧＝工坊升級、工具架＝鐵匠天賦），委託做成用鐵鍊吊著的告示牌
// v4.47 鐵匠待機動作：8 格 AI 動作圖疊在一起，只切 opacity 輪播（style.css .smf）
const smFr=(cls,alt)=>`<div class="${cls} smf"${alt?` role="img" aria-label="${alt}"`:''}>${[1,2,3,4,5,6,7,8].map(k=>`<img class="f${k}" src="${A('sm_'+k)}" alt="">`).join('')}</div>`;
function heroScene(){const i=S.villages.findIndex(v=>v.status==='open'),D=n=>A('dp/'+n);
  const obj=(cls,src,act,label,ic)=>`<button class="hs-obj ${cls}" data-act="${act}" aria-label="${label}"><img class="hs-img" src="${D(src)}" alt=""><span class="hs-tag">${img(ic)}${label}</span></button>`;
  let board='';if(i>=0){const v=VILLAGES[i],f=S.weapons.some(w=>eligible(i,w))?1:0;
    board=`<button class="hs-board ${f>=1?'ok':''}" data-act="tab" data-k="village"><img class="hs-chain l" src="${D('prop_chains')}" alt=""><img class="hs-chain r" src="${D('prop_chains')}" alt=""><span class="hs-bin"><span class="hs-bt">目前委託</span>${img('v'+(i+1),'hs-vimg')}<b>${vNo(i)} ${v.name}</b><span class="small">${f>=1?'可以交付了 ›':'先去鍛造一把武器'}</span></span></button>`}
  return board}   // v4.36 工坊／熔解／天賦入口拿掉
// 版型 F 上橫幅＋下工具列：委託一行橫幅貼在上緣，三顆功能鈕排在下緣霧氣上
function heroRibbon(){const i=S.villages.findIndex(v=>v.status==='open');let rb='';
  if(i>=0){const v=VILLAGES[i],f=S.weapons.some(w=>eligible(i,w))?1:0;
    rb=`<button class="hf-rib ${f>=1?'ok':''}" data-act="tab" data-k="village">${img('v'+(i+1),'hf-img')}<span class="hf-t"><span class="small">目前委託</span><b>${vNo(i)} ${v.name}</b></span><span class="hf-go">前往 ›</span></button>`}
  return rb}   // v4.36 Mochi：工坊升級、熔解回收、鐵匠天賦先拿掉（大改版中）
// 委託縮小成徽章（版型 B）：村莊縮圖＋進度，點一下前往村莊
function commBadge(){const i=S.villages.findIndex(v=>v.status==='open');if(i<0)return '';const v=VILLAGES[i],f=S.weapons.some(w=>eligible(i,w))?1:0;
  return `<button class="comm-badge ${f>=1?'ok':''}" data-act="tab" data-k="village">${img('v'+(i+1),'cb-img')}<span class="cb-t"><b>${vNo(i)} ${v.name}</b><span class="small">${f>=1?'可以交付了':'先去鍛造一把武器'}</span></span></button>`}
// v3.82 點圖紙後自動往下捲，讓詳情（品質機率、材料、開始鍛造鈕）露出來；只往下捲、不超過圖紙列頂端
function bpReveal(){requestAnimationFrame(()=>{const sel=document.querySelector('.sel-bp'),row=document.querySelector('.hscroll'),nav=document.getElementById('nav');if(!sel||!row)return;
  const top=(document.getElementById('res')?.getBoundingClientRect().bottom||0)+6,bot=(nav?nav.getBoundingClientRect().top:innerHeight)-10,goal=(sel.querySelector('.forge-go')||sel.querySelector('.bp-qual')||sel).getBoundingClientRect().bottom;
  const dy=Math.min(goal-bot,row.getBoundingClientRect().top-top);if(dy>4)scrollBy({top:dy,behavior:'smooth'})})}
function viewForge(){
  const done=S.jobs.filter(j=>NOW()>=j.end).length;
  if(ui.ftab==='queue'||ui.ftab==='mat')ui.ftab='bp';   // v4.38 「鍛造中」分頁拿掉（Mochi）：進度條改放在圖紙頁的開始鍛造下面
  const tabs=[['bp','圖紙']];   // v4.43 材料搬到下方「道具欄」頁（原武器庫）的「材料」分頁
  let body='';
  if(!BP[ui.bp]&&BPS.length)ui.bp=BPS[0].id;
  if(ui.ftab==='bp'&&!BPS.length)body=`<div class="ui-panel panel center bp-empty"><b>新武器鍛造中</b><div class="small muted">舊武器和圖紙已全部收起，諸神鐵匠的全新武器即將登場。</div></div>`;   // v4.44 舊圖紙全部刪掉，新圖紙還沒加
  else if(ui.ftab==='bp'){
    const cats=['all',...Object.keys(CATS).filter(c=>BPS.some(b=>b.cat===c&&cleared()>=b.unlock))];
    const list=BPS.filter(b=>(ui.cat==='all'||b.cat===ui.cat)&&(cleared()+1>=b.unlock||b.unlock===0));
    const b=BP[ui.bp],lock=bpLock(b),qty=bulkOn()?Math.min(ui.qty,10):1,c=recipe(b),g=goldOf(b)*qty,free=!S.jobs.length;
    const need={};for(const k in c)need[k]=c[k]*qty;const full=S.weapons.length+queuedQty()+qty>CAP_WEAPONS;
    const lacks=lackList(need,g),ok=!lock&&free&&!lacks.length&&!full;const est=Math.round(b.base*TIERS[b.t].mult*bossE(b));
    const why=lock||(!free?'正在鍛造中，稍等幾秒':full?'道具欄已滿':lacks.length?'缺 '+lackStr(lacks):'');
    const lackTxt=lacks.map(([k,n])=>`<b>${k==='gold'?'金幣':MATS[k]} ×${fmt(n)}</b>${matWhere(k)?`<span class="small muted">（${matWhere(k)}掉）</span>`:''}`).join('、'),lackT1=lacks.some(([k])=>MATS[k]);   // v4.59 缺材料可以到商城買
    body=`<div class="catbar">${cats.map(k=>`<button class="ui-btn ui-btn--toggle cat ${ui.cat===k?'on':''}" data-act="cat" data-k="${k}">${img(k==='all'?'nav_armory':CAT_ICON[k])}<span>${k==='all'?'全部':CATS[k]}</span></button>`).join('')}</div>
     <div class="hscroll">${list.map(x=>bpTile(x,x.id===ui.bp)).join('')}</div>
     <div class="ui-panel panel sel-bp">
      <div class="ui-card sel-head"><div class="sel-art">${wArt(b.id,{frame:'bp'})}</div>
       <div class="grow"><div class="label">已選擇</div><h3>${b.n}</h3><div class="small muted">${kindN(b)}・${CATS[b.cat]}類</div>${b.fx?`<div class="small bp-fx">專屬特效 <b>${b.fx}</b><br>${BOSS_FX.p*100}% 觸發・該下 +${BOSS_FX.m*100}%</div>`:''}<div class="small">安定值 <b class="${TIERS[b.t].stable?'t-ok':'t-danger'}">+${TIERS[b.t].stable}</b></div>
        <div class="powbox inline"><span class="small muted">基礎攻擊力</span><b>${est}</b></div></div></div>
      ${lock?`<div class="goal">${lock}</div>`:`
      <!-- v4.51 沒有稀有度了（武器系統定案），鍛造品質機率拿掉 -->
      <div class="label">費用（×${qty}）</div><div class="mats">${Object.entries(need).map(([k,n])=>matBox(k,n)).join('')}<div class="matbox need ${S.gold<g?'lack':'ok'}">${img('it_gold')}<span class="mb-n">金幣</span><span class="mb-have">持有 ${fmt(S.gold)}</span><span class="mb-need">需要 ${fmt(g)}</span></div></div>
      <div class="qtyrow"><span class="label">數量</span>${bulkOn()?[1,5,10].map(n=>`<button class="ui-btn ui-btn--chip qchip ${qty===n?'on':''}" data-act="qty" data-k="${n}">×${n}</button>`).join(''):'<span class="small muted qhint">收復 1-5 後開放批量鍛造</span>'}
       <button class="ui-btn ui-btn--primary btn btn-primary forge-go ${ok?'':'is-disabled'}" data-act="forge" ${ok?'':'aria-disabled="true"'}><span class="fg-t">開始鍛造</span><span class="fg-s">${fmt(g)} 金幣・${fmtT(forgeSec(b)*1000*(qty>1?qty*.6:1)/S.speed)}</span></button></div>
      ${S.jobs.length?S.jobs.map((j,n)=>`<div class="ui-card ui-card--row qrow">${wArt(j.b,{cls:'qimg'})}<div class="grow"><div class="row small"><b class="grow">${BP[j.b].n}${j.qty>1?' ×'+j.qty:''}${j.bp?'・傳說圖紙':''}</b><span class="num" data-jtime="${n}">${NOW()>=j.end?'完成':'剩 '+fmtT(j.end-NOW())}</span></div><div class="ui-prog prog"><i data-jprog="${n}" style="width:${Math.max(0,Math.min(100,(NOW()-j.start)/(j.end-j.start)*100))}%"></i></div></div>${btn('取消','cancelJob',{cls:'btn-sec sm',attrs:`data-i="${n}"`})}</div>`).join(''):!ok&&!lacks.length?`<div class="small t-danger forge-why">${why}</div>`:''}
      ${lackTxt?`<div class="lack-line">缺少：${lackTxt}${lackT1?` ${btn('去商城買','tab',{cls:'btn-sec sm',attrs:'data-k="shop"'})}`:''}</div>`:''}
      `}</div>
`;
  }else{
    body=`<div class="ui-panel panel">${ptitle('鍛造中')}${S.jobs.length?S.jobs.map((j,n)=>`<div class="ui-card ui-card--row qrow">${wArt(j.b,{cls:'qimg'})}<div class="grow"><div class="row small"><b class="grow">${BP[j.b].n}${j.qty>1?' ×'+j.qty:''}${j.bp?'・傳說圖紙':''}</b><span class="num" data-jtime="${n}">${NOW()>=j.end?'完成':'剩 '+fmtT(j.end-NOW())}</span></div><div class="ui-prog prog"><i data-jprog="${n}" style="width:${Math.max(0,Math.min(100,(NOW()-j.start)/(j.end-j.start)*100))}%"></i></div></div>${btn('取消','cancelJob',{cls:'btn-sec sm',attrs:`data-i="${n}"`})}</div>`).join('')+'<div class="small muted">每次鍛造 5 秒，取消會全額退回材料與金幣。完成後自動放進道具欄。</div>'
      :'<div class="empty">鐵砧空著。到「圖紙」挑一把開始鍛造。</div>'}
     </div>`;
  }
  // v3.17 景深圖層（AI 分層素材 art/dp/）：遠景 → 爐火光暈 → 中景淬火桶＋蒸氣 → 鐵匠 → 地面霧 → 火星 → 前景鐵鍊／炭火桶／鎚子（模糊）
  const D=n=>A('dp/'+n),dpEmb=[0,1,2,3,4,5,6,7].map(k=>`<img class="dp-em e${k}" src="${D(['fx_ember1','fx_ember_trail','fx_ember1','fx_ember_big','fx_ember1','fx_ember_trail','fx_ember_cluster','fx_ember1'][k])}" alt="">`).join('');
  const hv=ui.heroV||'F';   // v3.18 主畫面版型：正式採用 F（上橫幅＋下工具列）；開發模式可切換 O/A～E 比較
  const sideH='';   // v4.36 工坊／熔解入口拿掉
  const fv=ui.forgeV||'O';   // v3.19 鐵匠鋪內容頁預覽：O 原版／1 主畫面縮成橫條／2 主畫面收起（只在鍛造中分頁顯示）
  return `<section class="hero hv-${hv} fv-${fv} ft-${ui.ftab}"><img class="dp dp-far" src="${D('forge_far')}" alt=""><img class="dp dp-glow" src="${D('forge_fireglow')}" alt=""><img class="dp dp-glow g2" src="${D('forge_fireglow')}" alt=""><img class="dp dp-barrel" src="${D('prop_barrel')}" alt=""><img class="dp dp-steam" src="${D('fx_smoke_wisp')}" alt="">${smFr('smith','鐵匠')}<div class="dp dp-firelit"></div><div class="dp dp-fog"></div><div class="dp dp-embers">${dpEmb}</div><div class="dp dp-grade"></div><img class="dp dp-fg dp-chains" src="${D('prop_chains')}" alt=""><img class="dp dp-fg dp-coal" src="${D('prop_coal')}" alt=""><img class="dp dp-fg dp-hammer" src="${D('prop_hammer')}" alt="">
   ${hv==='C'||hv==='E'||hv==='F'?'':sideH}${hv==='C'||hv==='E'||hv==='F'?'':hv==='B'?commBadge():commissionCard()}${hv==='E'?heroScene():''}${hv==='F'?heroRibbon():''}</section>${hv==='C'?`<div class="hero-info">${sideH}${commissionCard()}</div>`:''}
  ${tabs.length<2?'':`<div class="subtabs">${tabs.map(([k,n])=>`<button class="ui-tab ${ui.ftab===k?'on':''}" data-act="ftab" data-k="${k}">${n}${k==='queue'&&done||k==='bp'&&BPS.some(bpNew)?'<i class="dot"></i>':''}</button>`).join('')}</div>`}${body}`;
}
function sheetWorkshop(kind){
  const head=t=>`<div class="sheet-head"><h2>${t}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  if(kind==='t')return head('鐵匠天賦')+sheetTalent();
  if(kind==='m'){const l=cheapList();return head('熔解回收')+`<div class="ui-panel panel"><div class="small">一鍵熔解只會處理：+0、普通或精良、沒有鎖定、閒置中的武器。</div>
    <div class="kv"><span>符合條件</span><b>${l.length} 把</b></div>${btn(l.length?`熔解 ${l.length} 把`:'沒有可熔解的武器','meltCheap',{cls:'btn-danger',dis:!l.length})}
    <div class="small muted">熔解可回收一半鍛造金幣。單把熔解請到武器詳細頁。</div></div>`}
  return head('工坊升級')+`<div class="ui-panel panel"><div class="row">${img('nav_forge','big-ico')}<div class="grow"><b>熔爐 Lv${S.furnace}</b><div class="small muted">Lv2 霜銀、Lv4 龍鱗、Lv5 神器${rfOpen()?'、Lv6 巨人':''}</div></div></div>
    ${S.furnace<furnaceMax()?(wsGate('furnace')?btn(`熔爐 Lv${S.furnace+1}：${wsGate('furnace')}`,'up',{cls:'btn-primary',attrs:'data-k="furnace"',dis:true}):btn(`升級熔爐（${fmt(FURNACE_COST[S.furnace])} 金幣）`,'up',{cls:'btn-primary',attrs:'data-k="furnace"',dis:S.gold<FURNACE_COST[S.furnace]})):'<div class="small t-ok">已滿級</div>'}</div>
   <div class="ui-panel panel"><div class="row">${img('nav_armory','big-ico')}<div class="grow"><b>鐵砧 Lv${S.anvil}</b><div class="small muted">提高高品質機率；Lv3 開附魔第 3 格、Lv5 開第 4 格</div></div></div>
    <div class="qbar">${qualWeights(false,0).map((x,i)=>`<span class="q${i}" style="flex:1">${QUAL[i].n}<br>${x/10}%</span>`).join('')}</div>
    ${S.anvil<5?(wsGate('anvil')?btn(`鐵砧 Lv${S.anvil+1}：${wsGate('anvil')}`,'up',{cls:'btn-primary',attrs:'data-k="anvil"',dis:true}):btn(`升級鐵砧（${fmt(ANVIL_COST[S.anvil])} 金幣）`,'up',{cls:'btn-primary',attrs:'data-k="anvil"',dis:S.gold<ANVIL_COST[S.anvil]})):'<div class="small t-ok">已滿級</div>'}</div>`;
}
// v3.71 鐵匠天賦視窗：上方聲望等級與經驗條，下方 6 條天賦（每條可升到上限；聲望等級本身不封頂）
function sheetTalent(){const r=S.rep,need=repNeed(r.lv),pts=repPts(),bx=repBox(r.lv+1),allMax=Object.keys(TALENTS).every(k=>r.t[k]>=TALENTS[k].max);
  const boxTxt=Object.entries(bx).map(([k,v])=>(k==='gold'?'金幣':itemName(k))+' ×'+fmt(v)).join('、');
  return `<div class="ui-panel panel tal-head"><div class="row">${img('ui_player_emblem','big-ico')}<div class="grow"><b>鐵匠聲望 Lv.${r.lv}</b><div class="ui-prog prog"><i style="width:${Math.min(100,r.xp/need*100)}%"></i></div><div class="small muted">經驗 ${fmt(r.xp)}／${fmt(need)}・下一級寶箱：${boxTxt}</div></div></div>
    <div class="tal-pts ${pts?'on':''}">可用天賦點 <b>${pts}</b></div>
    <div class="small muted">收成、鍛造、強化成功、收復村莊、熔解都會累積聲望。每升 1 級得到 1 天賦點和聲望寶箱，聲望等級沒有上限。</div></div>
   <div class="tal-list">${Object.entries(TALENTS).map(([k,T])=>{const lv=r.t[k],mx=lv>=T.max;
     return `<div class="ui-card ui-card--row tal-row">${img(T.ic,'tal-ic')}<div class="grow"><div class="row small"><b class="grow">${T.n}</b><span class="num muted">Lv ${lv}/${T.max}</span></div>
      <div class="small">${T.l} <span class="nobr">${lv?T.sg+(+(lv*T.per).toFixed(1))+'%':'<span class="muted">0%</span>'}${mx?'':`<span class="muted"> → </span><span class="t-ok">${T.sg}${+((lv+1)*T.per).toFixed(1)}%</span>`}</span></div></div>
      ${mx?'<span class="small t-ok tal-max">已滿</span>':btn('+1','talup',{cls:'btn-primary sm tal-btn',attrs:`data-k="${k}"`,dis:!pts})}</div>`}).join('')}</div>
   ${allMax?'<div class="small t-ok center">天賦全部滿級！之後每升一級仍然會拿到聲望寶箱。</div>':''}`}
// v3.72 每週限時活動：村莊頁橫幅與首領討伐視窗
function evtBanner(){if(BOSS_OFF)return'';const e=evtNow(),left=fmtLeft(e.end-NOW());if(AUTH&&Date.now()-BOSS_G.t>60000)setTimeout(()=>bossBoard(),0);
  const rk=bossRankTier(),rkLine=rk?`<button class="evt-rk" data-act="evtopen">${img('it_gems','evt-rk-ic')}<span class="grow">上週討伐 ${rk.b.n}：你排第 ${rk.g.rank} 名，排名獎勵可以領了</span><span class="evt-go">領取 ›</span><i class="dot"></i></button>`:'';
  const v=evtSt(),g=bossBoardNow(),f=g?Math.min(1,g.total/g.hp):0;
  return `<button class="evt-ban boss" data-act="evtopen">${img(e.boss.art,'evt-boss')}<div class="grow"><b>全服首領討伐</b><div class="small"><span class="nobr">${e.boss.n}</span>・<span class="nobr">駐守 ${v.slots.filter(Boolean).length}/${BOSS_SLOTS}</span>${bossRate()?`・<span class="nobr">每小時 ${fmt(bossRate())}</span>`:''}</div>${g?`<i class="cb-bar hp"><i style="width:${(1-f)*100}%"></i></i>`:''}<div class="small muted">${g?`<span class="nobr">全服血量 ${Math.round((1-f)*100)}%</span>・`:''}<span class="nobr">剩 ${left} 結算</span></div></div><span class="evt-go">${v.slots.some(x=>!x)?'派遣':'查看'} ›</span>${bossDot()?'<i class="dot"></i>':''}</button>${rkLine}`}
function bossGlobalPanel(b,v){
  if(!AUTH&&!ui.bossSim)return `<div class="ui-panel panel"><div class="small muted">登入雲端帳號後會顯示全服血條，大家一起打。</div></div>`;
  if(AUTH&&Date.now()-BOSS_G.t>30000)setTimeout(()=>bossBoard(),0);const g=bossBoardNow();
  if(!g)return `<div class="ui-panel panel"><div class="small muted">${BOSS_G.err?'全服血條讀取失敗：'+esc(BOSS_G.err):'讀取全服血條中…'}</div></div>`;
  const f=Math.min(1,g.total/g.hp),dead=g.total>=g.hp,n=bossStageN();
  return `<div class="ui-panel panel evt-global"><div class="row small"><b class="grow">全服血條</b><span class="muted">${g.players} 位鐵匠參加</span></div>
    <div class="evt-hp ${dead?'dead':''}"><i style="width:${(1-f)*100}%"></i><span>${dead?'首領已被打倒！':`首領血量 ${fmt(g.hp-g.total)}／${fmt(g.hp)}`}</span></div>
    <div class="evt-stages">${BOSS_GSTAGE.map(([sf,sg],k)=>{const ok=g.total>=g.hp*sf,got=k<v.gs;return `<div class="evt-st ${got?'done':''}"><span class="num">${Math.round(sf*100)}%</span><span class="small grow">${giftTxt(stageGift(sg,b))}</span>${got?img('ic_check','evt-ck'):ok?'':'<span class="small muted nobr">未達成</span>'}</div>`}).join('')}</div>
    ${n>0?btn(`領取 ${n} 個全服獎勵`,'bossgift',{cls:'btn-primary'}):g.mine?'':'<div class="small muted">本週派武器駐守過，就能領全服血量的獎勵。</div>'}</div>
   <div class="ui-panel panel evt-global"><div class="row small"><b class="grow">本週傷害排名</b>${g.mine?`<span class="muted">我第 ${g.rank} 名・${fmt(g.mine)}</span>`:''}</div>
    ${g.top.length?g.top.map((x,k)=>{const ws=(x.ws||[]).filter(w=>BP[bpId(w.b)]);return `<div class="evt-top ${x.me?'me':''}"><div class="kv"><span>${k+1}. ${esc(x.nick)}</span><b>${fmt(x.dmg)}</b></div>${ws.length?`<div class="evt-tws">${ws.map((w,j)=>`<button class="evt-tw ${lc(w)}b" data-act="bossw" data-r="${k}" data-j="${j}" aria-label="看武器">${wArt(bpId(w.b),{cls:'qimg'})}<span>+${w.lv|0}</span></button>`).join('')}</div>`:''}</div>`}).join(''):'<div class="small muted">還沒有人派武器，第一個就是你。</div>'}
    <div class="small muted">點武器可以看詳情。每週日 0 點結算，依名次領：${BOSS_RANK.map(([m,nm,rg])=>`${nm} ${giftTxt(stageGift(rg,b))}`).join('；')}</div></div>`}
function bossRankPanel(){const r=bossRankTier();if(!r)return'';return `<div class="ui-panel panel evt-global"><div class="row small"><b class="grow">上週排名獎勵</b><span class="muted">${r.b.n}</span></div>
  <div class="small">你上週造成 ${fmt(r.g.mine)} 傷害，排第 ${r.g.rank} 名（${r.t[1]}）</div>${btn('領取：'+giftTxt(r.gift),'bossrank',{cls:'btn-primary'})}</div>`}
function sheetEvt(){const e=evtNow(),b=e.boss,v=evtSt();
  const head=`<div class="sheet-head"><h2>首領討伐</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  const nPost=v.slots.filter(Boolean).length,full=nPost>=BOSS_SLOTS;
  const ws=bossCands().sort((x,y)=>bossDmgOf(y,b)-bossDmgOf(x,b)).slice(0,6);
  const slot=(x,k)=>{if(!x)return `<div class="ui-card ui-card--row evt-w evt-slot empty"><span class="evt-sn">${k+1}</span><div class="grow small muted">空位：從下面挑一把武器派過來</div></div>`;
    const w=W(x.id),acc=bossAcc(x,e);
    return `<div class="ui-card ui-card--row evt-w evt-slot">${wArt(w.b,{cls:'qimg'})}<div class="grow"><b class="${lc(w)}">${bpOf(w).n}${w.lv?' +'+w.lv:''}</b><div class="small muted"><span class="nobr">每小時 ${fmt(x.pw)}${bossWeak(w,b)?' <span class="t-ok">弱點</span>':bossRes(w,b)?' <span class="t-danger">抗性</span>':''}</span>・<span class="nobr">本週已打 ${fmt(acc)}</span></div></div>${btn('收回','bossout',{cls:'btn-sec sm',attrs:`data-s="${k}"`})}</div>`};
  return head+`<div class="evt-hero" style="background-image:url(${A(b.bg)})">${img(b.art,'evt-mon')}<div class="evt-hero-in"><b>${b.n}</b><span class="small">弱點：${b.wn}<span class="nobr">（傷害 +3%～10%）</span>・<span class="nobr">同屬性<span class="elc-${b.el}">${ELEM[b.el].n}</span>有抗性（−3%～10%）</span></span></div></div>
   ${bossRankPanel()}<div class="ui-panel panel"><div class="kv"><span>本週我的傷害</span><b>${fmt(bossLive())}</b></div><div class="kv"><span>目前每小時傷害</span><b>${fmt(bossRate())}</b></div><div class="small muted">派武器駐守首領，每小時造成「攻擊力」的傷害（打中弱點依屬性等級傷害 +3%～10%，同屬性 −3%～10%），離線也會繼續打，最多 ${BOSS_SLOTS} 把。駐守首領的武器不能同時打村莊、強化或熔解。每週日 0 點結算換下一隻首領，武器會留著繼續打。距離結算 ${fmtLeft(e.end-NOW())}。</div></div>
   <div class="label evt-lb">首領駐守位（${nPost}/${BOSS_SLOTS}）</div><div class="evt-ws">${v.slots.map(slot).join('')}</div>
   <div class="label evt-lb">挑武器派遣（攻擊力高的在前）</div><div class="evt-ws">${ws.length?ws.map(w=>{const vi=where(w);return `<div class="ui-card ui-card--row evt-w">${wArt(w.b,{cls:'qimg'})}<div class="grow"><b class="${lc(w)}">${bpOf(w).n}${w.lv?' +'+w.lv:''}</b><div class="small muted"><span class="nobr">每小時 ${fmt(bossDmgOf(w,b))}${bossWeak(w,b)?' <span class="t-ok">弱點</span>':''}</span>${vi>=0?`・<span class="nobr t-gold">會從 ${vNo(vi)} 收回</span>`:''}</div></div>${btn('派遣','bosspost',{cls:'btn-primary sm',attrs:`data-id="${w.id}"`,dis:full})}</div>`}).join(''):'<div class="small muted">道具欄沒有可以派的武器，先去鍛造一把。</div>'}</div>
   ${full&&ws.length?'<div class="small muted center">駐守位滿了，想換武器先收回一把。</div>':''}
   <div class="evt-lb"></div>${bossGlobalPanel(b,v)}`}

// v3.87 排名裡其他玩家駐守的武器（唯讀）
function sheetBossW(r,j){const g=bossBoardNow(),x=g&&g.top[r],ws=x?(x.ws||[]).filter(w=>BP[bpId(w.b)]):[],w=ws[j],b=evtNow().boss;
  const head=`<div class="sheet-head">${btn(img('ic_back'),'evtopen',{cls:'icon-btn img',attrs:'aria-label="返回首領討伐"'})}<h2>${x&&x.me?'我的駐守武器':'玩家駐守武器'}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  if(!w)return head+'<div class="small muted center">這把武器已經不在首領駐守了</div>';const ww={traits:[],ench:[],...w,b:bpId(w.b)};
  return head+`<div class="lbw-owner"><span class="lb-no r${Math.min(r+1,4)}">${r+1}</span><div class="grow"><b>${esc(x.nick)}</b><div class="small muted">本週傷害 ${fmt(x.dmg)}・第 ${r+1} 名</div></div></div>
   ${ws.length>1?`<div class="evt-tws center">${ws.map((v,k)=>`<button class="evt-tw ${lc(v)}b ${k===j?'on':''}" data-act="bossw" data-r="${r}" data-j="${k}">${wArt(bpId(v.b),{cls:'qimg'})}<span>+${v.lv|0}</span></button>`).join('')}</div>`:''}
   ${mkWeaponBox(ww)}<div class="ui-panel panel"><div class="kv"><span>打 ${b.n} 每小時</span><b>${fmt(w.pw||bossDmgOf(ww,b))}${bossWeak(ww,b)?' <span class="t-ok small">弱點</span>':bossRes(ww,b)?' <span class="t-danger small">抗性</span>':''}</b></div></div>`}

/* ---------- 道具欄 ---------- */
const SORTS={power:['攻擊力',(a,b)=>power(b)-power(a)],lv:['強化等級',(a,b)=>b.lv-a.lv||power(b)-power(a)],
  cat:['類別',(a,b)=>bpOf(a).cat.localeCompare(bpOf(b).cat)||power(b)-power(a)],post:['駐守優先',(a,b)=>busyW(b)-busyW(a)||power(b)-power(a)],recent:['取得時間',(a,b)=>b.created-a.created||b.id-a.id]};
function viewArmory(){
  if(ui.pickV!=null){const r=viewPick(ui.pickV);if(r)return r;ui.pickV=null}
  if(ui.atab==='m')return viewBag();
  if(ui.atab==='c')return viewCodex();
  const aq=ui.aq||'all',ast=ui.ast||'all';
  const stOk=w=>ast==='all'||(ast==='idle'&&!busyW(w))||(ast==='post'&&busyW(w))||(ast==='lock'&&w.lock)||(ast==='test'&&w.test);
  const ws=S.weapons.filter(w=>(ui.acat==='all'||bpOf(w).cat===ui.acat)&&(aq==='all'||FLV(w.lv)===+aq)&&stOk(w)).sort((SORTS[ui.asort]||SORTS.power)[1]);
  const filtered=ui.acat!=='all'||aq!=='all'||ast!=='all';
  return `<div class="arm-head"><div class="pagehead"><h2>道具欄</h2><span class="num ${S.weapons.length>=CAP_WEAPONS?'t-danger':''}">${S.weapons.length}/${CAP_WEAPONS}</span></div>${atabs()}
  <div class="catbar">${['all',...Object.keys(CATS).filter(k=>BPS.some(b=>b.cat===k)||S.weapons.some(w=>bpOf(w).cat===k))].map(k=>`<button class="ui-btn ui-btn--toggle cat ${ui.acat===k?'on':''}" data-act="acat" data-k="${k}">${img(k==='all'?'nav_armory':CAT_ICON[k])}<span>${k==='all'?'全部':CATS[k]}</span></button>`).join('')}</div>
  <div class="filters3"><label class="sel"><span>排序</span><select id="asort">${Object.entries(SORTS).map(([k,[n]])=>`<option value="${k}" ${ui.asort===k?'selected':''}>${n}</option>`).join('')}</select></label>
   
   <label class="sel"><span>狀態</span><select id="ast">${[['all','全部'],['idle','閒置'],['post','駐守'],['lock','鎖定'],['test','測試']].map(([k,n])=>`<option value="${k}" ${ast===k?'selected':''}>${n}</option>`).join('')}</select></label></div>
  ${filtered?`<div class="filterbar"><span>顯示 ${ws.length}／${S.weapons.length} 把</span><button class="ui-btn ui-btn--chip chipbtn on" data-act="aclear">${ic('clear')} 清除篩選，顯示全部</button></div>`:''}</div>
  <div class="wlist">${ws.length?`<div class="wgrid">${(gm=>wStacks(ws).map(({w,n,nw})=>wTile(w,`data-act="wopen" data-id="${w.id}"`,canGive(w,gm),n,nw)).join(''))(giveMin())}</div>`
   :S.weapons.length?`<div class="empty-state">${img(ui.acat==='all'?'nav_armory':CAT_ICON[ui.acat])}<b>${ui.acat!=='all'?`目前沒有此類武器（${CATS[ui.acat]}）`:'目前沒有符合條件的武器'}</b><span class="small muted">可以返回全部武器，或直接去鍛造。</span>${btn('顯示全部武器','aclear',{cls:'btn-primary'})}${ui.acat!=='all'?btn(`去鍛造${CATS[ui.acat]}`,'forgeCat',{attrs:`data-k="${ui.acat}"`}):''}</div>`
   :`<div class="empty-state">${img('nav_forge')}<b>道具欄是空的</b><span class="small muted">先到鐵匠鋪鍛造第一把武器。</span>${btn('前往鐵匠鋪','tab',{cls:'btn-primary',attrs:'data-k="forge"'})}</div>`}</div>`;
}
// v3.79 村莊卡「道具欄有更強的可以換」：跳到道具欄，只列這座村莊能用的閒置武器（強的在前），點一把就換上，原本的回道具欄
function viewPick(i){const v=VILLAGES[i],st=S.villages[i],cur=st&&st.weaponId!=null&&W(st.weaponId);if(!v||!cur)return null;
  const ws=S.weapons.filter(x=>where(x)<0&&eligible(i,x)).sort((a,b)=>power(b)-power(a));
  return `<div class="arm-head"><div class="pagehead"><h2>幫 ${vNo(i)} ${v.name} 換武器</h2>${btn('取消','vpickx',{cls:'btn-sec sm'})}</div>
  <div class="pick-cur small"><span class="muted">目前駐守</span><span class="wchip ${lc(cur)}b">${wArt(cur.b,{cls:'wmini'})}<span class="${lc(cur)}">${bpOf(cur).n} +${cur.lv}</span></span><span class="grow right">攻擊力 <b>${fmt(power(cur))}</b></span></div>
  <div class="small muted">只顯示可以駐守這裡的閒置武器（攻擊力夠就行）。點一把就換上，原本的武器會回到道具欄。</div></div>
  <div class="wlist">${ws.length?`<div class="wgrid">${ws.map(w=>wTile(w,`data-act="vpick" data-i="${i}" data-id="${w.id}"`)).join('')}</div>`:`<div class="empty-state">${img('nav_armory')}<b>沒有可以換的閒置武器</b>${btn('返回村莊','vpickx',{cls:'btn-primary'})}</div>`}</div>`}
// v4.53 武器小卡的四格數值（攻速／附加效果／相剋／屬性），交易所商品詳情也用同一套
function wpGrid(w){const c=bpOf(w).cat,pr=PROC[c],sp=CSPD[c],rc=raceOf(w),e=wElem(w),cell=(k,v,sub)=>`<div><span>${k}</span><b>${v}</b>${sub?`<em>${sub}</em>`:''}</div>`;
  return `<div class="wp-g">${cell('攻速',sp?sp.toFixed(1)+' 秒':'—',sp?'單擊 '+fmt(hitDmg(w)):'')}
      ${cell('附加效果',pr?`${pr[0]} <i>${pct(procP(w.lv))}</i>`:'—',pr?pr[1]:'')}
      ${cell('相剋',rc?`${RACE_N[rc]} <i>+${raceBonus(w)}%</i>`:'—')}
      ${e?`<div class="el"><span>附魔屬性</span><b class="elc-${e.k}">${e.tn}</b><em>打中弱點傷害 +${Math.round((e.m-1)*100)}%</em></div>`:cell('附魔屬性','<span class="muted">無</span>','附魔可獲得')}</div>`}
function sheetWeapon(id,mode){
  const w=W(id);if(!w){const last=ui.enhLast&&ui.enhLast.id===id&&ui.enhLast.k==='broke'?ui.enhLast:null;
    if(last)return `<div class="sheet-head"><span style="width:44px"></span><h2>強化</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`
      +stageHtml({art:null,danger:true,from:null,to:null,zone:'武器已消失',ribbon:`<b>${last.t}</b><span>${last.d}</span>`,rk:'broke'})
      +`<div class="acts3">${btn('回道具欄','backArmory',{cls:'btn-primary big'})}${btn('去鐵匠鋪','tab',{cls:'btn-sec big',attrs:'data-k="forge"'})}</div>`;
    return`<div class="sheet-head"><h2>武器詳情</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img'})}</div><div class="empty">這把武器已經不在了。</div>`}
  const b=bpOf(w),i=where(w),bs=bossSlotOf(w),busy=i>=0||bs>=0,highValue=w.lock||w.q>=2||w.lv>=3||b.t>=2;
  const title={main:'武器詳情',enh:'強化',ench:'附魔',give:'交給村莊'}[mode];
  const head=`<div class="sheet-head">${mode==='main'?'<span style="width:44px"></span>':btn(img('ic_back'),'wmode',{cls:'icon-btn img',attrs:`data-m="main" data-id="${id}" aria-label="返回"`})}<h2>${title}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  const showcase=(extra='')=>`<div class="ui-card ui-card--feature showcase ${lc(w)}b ${extra}">
   <div class="sc-top"><div><h2 class="${lc(w)}">${b.n} <span class="lvt">+${w.lv}</span></h2></div>
    <button class="ui-iconbtn icon-btn img" data-act="lock" data-id="${id}" aria-label="${w.lock?'取消鎖定':'鎖定'}">${img(w.lock?'ic_lock':'ic_unlock')}</button></div>
   <div class="sc-art">${wArt(b.id,{cls:'sc-w'})}</div>
   <div class="sc-bot"><span class="small">${kindN(b)}・${CATS[b.cat]}・安定值 <b class="${stable(w)?'t-ok':'t-danger'}">+${stable(w)}</b>${i>=0?`・<span class="t-ok">駐守 ${vNo(i)}</span>`:''}</span><div class="powbox"><span class="small muted">攻擊力</span><b>${fmt(power(w))}</b></div></div></div>`;
  if(mode==='main'){
    // v4.40 武器小卡（Mochi 選 B 數值表＋點武器跳小卡，不蓋滿畫面）：名稱「+7 寒霜 鐵劍」、四格數值、強化進度條、四個按鈕
    const c=b.cat,pr=PROC[c],sp=CSPD[c],rc=raceOf(w),e=wElem(w),nx=Math.min(12,w.lv+1),max=w.lv>=12;
    const cell=(k,v,sub)=>`<div><span>${k}</span><b>${v}</b>${sub?`<em>${sub}</em>`:''}</div>`;
    return `<div class="wp-in"><button class="ui-iconbtn wp-x" data-act="close" aria-label="關閉">${img('ic_close')}</button>
     <div class="wp-top">${wArt(b.id,{frame:fq(w)})}<div class="grow"><div class="wp-nm">${wName(w)}</div>
      <div class="wp-sub"><span>${CATS[c]}・${kindN(b)}</span>${i>=0?`<span class="t-ok">駐守 ${vNo(i)}</span>`:bs>=0?'<span class="t-ok">討伐首領中</span>':''}${w.test?'<span class="testtag">測試</span>':''}</div>
       <button class="ui-iconbtn icon-btn img wp-lk" data-act="lock" data-id="${id}" aria-label="${w.lock?'取消鎖定':'鎖定'}">${img(w.lock?'ic_lock':'ic_unlock')}</button>
      <div class="wp-pow"><b>${fmt(power(w))}</b><span>攻擊力（每秒傷害）</span></div></div></div>
     ${wpGrid(w)}
     <div class="wp-lv"><div class="wp-bar">${Array.from({length:13},(_,k)=>`<i class="${k<=w.lv?'on':''} ${k===w.lv?'cur':''}" style="--c:var(--l${FLV(k)})"></i>`).join('')}</div>
      <div class="rw"><span>+0</span><span>${max?'已達 +12':`下一級 +${nx}：${pr?pr[0]+' <b>'+pct(procP(nx))+'</b>・':''}${rc?'相剋 <b>+'+raceBonus(w,nx)+'%</b>・':''}攻擊力 <b>${fmt(power(w,nx))}</b>`}</span><span>+12</span></div></div>
     <div class="wp-a">${btn('強化','wmode',{cls:'btn-primary',attrs:`data-m="enh" data-id="${id}"`,dis:busy})}${btn(w.lv>=stable(w)?`已 +${stable(w)}`:'一鍵安定值','autoEnh',{cls:'btn-primary',attrs:`data-id="${id}"`,dis:busy||w.lv>=stable(w)||(!w.test&&stones()<enhCost(w))})}${btn('附魔','wmode',{cls:'btn-primary',attrs:`data-m="ench" data-id="${id}"`,dis:busy})}
      ${i>=0?btn('收回','recall',{attrs:`data-i="${i}"`}):bs>=0?btn('收回','bossout',{attrs:`data-s="${bs}"`}):btn('駐守'+(canGive(w)?'<i class="dot give-dot"></i>':''),'wmode',{attrs:`data-m="give" data-id="${id}"`})}
      ${btn('上架','mksellw',{attrs:`data-id="${id}"`,dis:w.test||!mkSellable(w)})}${btn(ui.meltArm===id?'確認':'熔解','melt',{cls:'btn-danger',attrs:`data-id="${id}"`,dis:busy||w.lock})}</div>
     ${(n=>n>1?`<div class="small muted center wp-note wp-stk">同款共 ${n} 把，強化、附魔、駐守、上架、熔解只會動這一把</div>`:'')(wSame(w))}${ui.meltArm===id?'<div class="small t-danger center wp-note">再按一次確認熔解，熔解後無法復原。</div>':busy?'<div class="small muted center wp-note">駐守中的武器要先收回，才能強化、附魔或熔解。</div>':w.lv<stable(w)?`<div class="small muted center wp-note">一鍵安定值 +${stable(w)}：${w.test?'測試武器免費':'要 '+fmt(autoEnhCost(w))+' 顆強化石・持有 '+fmt(stones())}，不會爆裝</div>`:''}</div>`;
  }
  if(bs>=0)return head+showcase()+`<div class="goal">這把武器正在討伐首領，要先收回。</div>${btn('從首領收回','bossout',{cls:'btn-primary big',attrs:`data-s="${bs}"`})}`;
  if(i>=0&&mode!=='give')return head+showcase()+`<div class="goal">這把武器正在 ${VILLAGES[i].name} 駐守，要先收回。</div>${btn('從村莊收回','recall',{cls:'btn-primary big',attrs:`data-i="${i}"`})}`;
  if(mode==='enh'){
    const last=ui.enhLast&&ui.enhLast.id===id?ui.enhLast:null,rib=last?`<b>${last.t}</b><span>${last.d}</span>`:'';
    const nameRow=`<div class="enh-name"><b class="${lc(w)}">${b.n}</b>${w.test?'<span class="testtag">測試</span>':''}</div>`;
    if(w.lv>=MAX_LV)return head+nameRow+stageHtml({art:A(b.id),from:MAX_LV,to:MAX_LV,zone:'已達最高等級',ribbon:rib,rk:last&&last.k})+'<div class="goal">已達最高等級 +'+MAX_LV+'。</div>';
    const hasBl=false,hasSc=false;   // v4.43 防爆卷、祝福石刪除
    const next=w.lv+1,danger=next>stable(w),bl=ui.useBless&&hasBl,sc=ui.useScroll&&danger&&hasSc;
    const r=Math.min(1,RATE[next]+(bl?.1:0)),bc=breakChance(w,next),total=(1-r)*bc,cost=enhCost(w),free=!!w.test;
    const lackGold=!free&&stones()<cost,lackBless=false,lackScroll=false;   // v4.50 lackGold＝強化石不夠（沿用變數名）
    const unguarded=danger&&!sc,armed=unguarded&&!w.test&&ui.riskArm===id&&ui.riskOk!==id;
    const label=ui.busy?'強化中…':lackGold?'強化石不足':lackBless?'祝福石不足':lackScroll?'防爆卷不足':armed?`確認強化（可能爆裝 ${pct(total)}）`:`${last?'再次強化':'強化'} +${w.lv} → +${next}`;
    const el=powAff(w);
    const ev=ui.enhV||'2';   // v3.19 強化頁版型預覽：O 原版／1 壓縮／2 資訊疊在石碑上／3 左右分欄
    if(ev!=='O'){
      const canAuto=!danger&&w.lv<stable(w),stage=stageHtml({art:A(b.id),danger,from:w.lv,to:next,zone:danger?`危險區`:`安定區`,ribbon:rib,rk:last&&last.k});
      const st=[['成功率',`<b class="t-ok">${pct(r)}</b>`,bl?'含祝福 +10%':''],['爆裝率',`<b class="${danger&&!sc?'t-danger':'t-ok'}">${danger?(sc?'0%':pct(total)):'0%'}</b>`,danger?(sc?'防爆保護':'失敗 '+pct(bc)):'安定區'],
        ['攻擊力',`<b>${fmt(power(w))}<small>→</small><span class="t-gold">${fmt(power(w,next))}</span></b>`,''],['強化石',`<b class="${lackGold?'t-danger':''}">${free?'免費':fmt(cost)+' 顆'}</b>`,`剩 ${fmt(stones())} 顆`]]   // v4.58 小卡顯示強化石剩幾顆（Mochi）;
      const stats=cls=>`<div class="ev-stats ${cls}">${st.map(([k,v,s])=>`<div class="ev-st ${k==='爆裝率'&&danger?(sc?'guard':'risk'):''} ${k==='強化石'?'stone':''}"><span>${k}</span>${v}${s?`<i>${s}</i>`:''}</div>`).join('')}</div>`;
      const tg='';
      const warn=danger?(sc?`<div class="ev-warn guard guardline">${img('it_scroll')}防爆卷保護中：爆裝時武器保留</div>`:`<div class="ev-warn risk warn"><span class="grow"><b>危險區</b>：失敗時可能爆裝，武器會永久消失（${pct(total)}）</span></div>`):'';
      const lack=lackGold?`<div class="lack-line">強化石用完了：村莊收成（越後面的關卡掉越多）、熔解武器可以拿到。</div>`:lackScroll||lackBless?`<div class="lack-line">${lackScroll?'防爆卷用完了。':'祝福石用完了。'}${btn(lackScroll?'取消防爆卷':'取消祝福石','noItem',{cls:'btn-sec sm',attrs:`data-k="${lackScroll?'useScroll':'useBless'}"`})}${btn('去商城','tab',{cls:'btn-sec sm',attrs:'data-k="shop"'})}</div>`:'';
      const lab=ui.busy?'強化中…':lackGold?'強化石不足':lackBless?'祝福石不足':lackScroll?'防爆卷不足':armed?`確認強化（${pct(total)} 爆裝）`:`${last?'再次強化':'強化'} +${w.lv}→+${next}`;
      const bar=`<div class="ev-bar ${canAuto?'two':''}"><button class="ui-btn ${unguarded?'ui-btn--danger':'ui-btn--primary'} btn ${unguarded?'btn-risk':'btn-primary'} big" data-act="enhance" data-id="${id}" ${ui.busy||lackGold||lackBless||lackScroll?'disabled':''}>${lab}</button>
        ${canAuto?`<button class="ui-btn ui-btn--accent btn wd-auto ev-auto" data-act="autoEnh" data-id="${id}" ${ui.busy||lackGold?'disabled':''}><span>${lackGold?'強化石不足':'一鍵到 <b>+'+stable(w)+'</b>'}</span><span class="small">${free?'測試免費':'要 '+fmt(autoEnhCost(w))+' 顆強化石'}</span></button>`:''}</div>
        ${armed?'<div class="small t-danger center">危險區強化，再按一次確認。</div>':''}`;
      const info=`<details class="enh-more ev-more"><summary>ⓘ 規則與攻擊力明細</summary><div class="kvgrid">${kv('安定值','+'+stable(w)+'（'+kindN(b)+'）')}${kv('失敗後爆裝率',danger?pct(bc):'0%')}${kv('基礎成功率',pct(RATE[next]))}${kv('失敗率',pct(1-r))}</div>
        <div class="small"><b>規則</b>：每次強化用 1 顆強化石，成功或失敗都會用掉。失敗不會降級。+1～+6 一定成功；+7～+9 失敗就爆裝；+10～+12 成功 1%，失敗時 1/3 維持原樣、2/3 爆裝。最高 +${MAX_LV}。</div></details>`;
      if(ev==='1')return head+`<div class="ev ev1">`+nameRow+stage+stats('row4')+tg+warn+lack+info+bar+`</div>`;
      if(ev==='2')return head+`<div class="ev ev2">`+nameRow+`<div class="ev2-wrap">${stage}${stats('over')}</div>`+tg+warn+lack+info+bar+`</div>`;
      if(ev==='3')return head+`<div class="ev ev3">`+nameRow+`<div class="ev3-grid">${stage}${stats('col')}</div>`+tg+warn+lack+info+bar+`</div>`;
    }
    return head+nameRow+stageHtml({art:A(b.id),danger,from:w.lv,to:next,zone:danger?`危險區`:`安定區`,ribbon:rib,rk:last&&last.k})
     +`<div class="enh-core"><div><span>成功率</span><b class="t-ok">${pct(r)}</b>${bl?'<i>含祝福石 +10%</i>':''}</div>
       <div class="${danger?(sc?'guard':'risk'):''}"><span>本次爆裝機率</span><b class="${danger&&!sc?'t-danger':'t-ok'}">${danger?(sc?'0%':pct(total)):'0%'}</b><i>${danger?(sc?'防爆卷保護中':'失敗時 '+pct(bc)+' 爆裝'):'安定區不會爆裝'}</i></div>
       <div><span>成功後攻擊力</span><b>${fmt(power(w))} → <span class="t-gold">${fmt(power(w,next))}</span></b></div>
       <div><span>強化石</span><b class="${lackGold?'t-danger':''}">${free?'測試免費':fmt(cost)+' 顆'}</b><i>持有 ${fmt(stones())}</i></div></div>
     ${danger?(sc?`<div class="guardline">${img('it_scroll')}本次已受防爆卷保護：強化會消耗 1 張防爆卷，若判定爆裝，武器保留。</div>`
       :`<div class="warn"><b>武器可能永久消失</b>：本次爆裝機率 ${pct(total)}。</div>`):''}
     <button class="ui-btn ${unguarded?'ui-btn--danger':'ui-btn--primary'} btn ${unguarded?'btn-risk':'btn-primary'} big" data-act="enhance" data-id="${id}" ${ui.busy||lackGold||lackBless||lackScroll?'disabled':''}>${label}</button>
     ${!danger&&w.lv<stable(w)?`<button class="ui-btn ui-btn--accent btn wd-auto" data-act="autoEnh" data-id="${id}" ${ui.busy||lackGold?'disabled':''}><span>${lackGold?'強化石不足，無法一鍵強化':'一鍵強化到安定值 <b>+'+stable(w)+'</b>'}</span><span class="small">${free?'測試武器免費':'要 '+fmt(autoEnhCost(w))+' 顆強化石・持有 '+fmt(stones())}${lackGold?'':'・不會爆裝'}</span></button>`:''}
     ${lackScroll||lackBless?`<div class="lack-line">${lackScroll?'勾選了防爆卷，但已經用完。':'勾選了祝福石，但已經用完。'}${btn(lackScroll?'取消防爆卷':'取消祝福石','noItem',{cls:'btn-sec sm',attrs:`data-k="${lackScroll?'useScroll':'useBless'}"`})}${btn('去商城補充','tab',{cls:'btn-sec sm',attrs:'data-k="shop"'})}</div>`:''}
     ${armed?'<div class="small t-danger center">危險區強化。再按一次確認，本次進入強化頁之後不會再問。</div>':''}
     <details class="enh-more"><summary>詳細說明</summary>
      <div class="kvgrid">${kv('安定值','+'+stable(w)+'（'+kindN(b)+'）')}${kv('失敗後爆裝率',danger?pct(bc):'0%')}${kv('基礎成功率',pct(RATE[next]))}${kv('失敗率',pct(1-r))}</div>
      <div class="small"><b>攻擊力組成</b>：基礎 ${b.base} × 材質 ${TIERS[b.t].mult} × 品質 ${QUAL[w.q].m} × 強化 ${enhMult(w.lv).toFixed(2)}${el?` × 元素 ${(1+el/100).toFixed(3)}`:''} ＝ ${fmt(power(w))}</div>
      <div class="small"><b>強化倍率</b>：+0～+6 每級 +10%（+6 ×1.6）；+7 ×1.9、+8 ×2.25、+9 ×2.65、+10 ×3.3、+11 ×4、+12 ×4.8。+${next} 倍率 ${enhMult(next).toFixed(2)}。</div>
      <div class="small"><b>規則</b>：每次強化用 1 顆強化石，成功或失敗都會用掉。失敗不會降級。+1～+6 一定成功；+7～+9 失敗就爆裝；+10～+12 成功 1%，失敗時 1/3 維持原樣、2/3 爆裝。最高 +${MAX_LV}。</div></details>`;
  }
  if(mode==='ench'){   // v4.44 屬性附魔小卡：目前屬性 → 屬性池（6 種、等級機率）→ 按鈕；只有 1 欄
    const c1=enchCost(w),e=elemOf(w);
    const mini=`<div class="nv-head">${wArt(b.id,{frame:fq(w),cls:'nv-art'})}<div class="grow"><b class="ec-nm">${wName(w)}</b><span class="small muted">${e?`打中弱點 +${Math.round((e.m-1)*100)}%・同屬性 −${Math.round((1-e.r)*100)}%・重抽會覆蓋`:'無屬性・附魔隨機獲得 1 種'}</span><div class="ec-have">${img('it_gold')}<b>${fmt(S.gold)}</b>${img('it_ench')}<b>${fmt(enStones())}</b></div></div></div>`;   // v4.67 Mochi：附魔結果直接顯示在武器名稱裡，不另外放目前屬性欄
    const pool=`<div class="ec-18"><span></span>${[1,2,3].map(t=>`<span class="ec-th">${['','一','二','三'][t]}級</span>`).join('')}
      ${Object.entries(ELEM).map(([k,x])=>`<button class="ec-en elc-${k}" data-act="affinfo" data-k="${k}">${x.n}</button>${[1,2,3].map(t=>`<button class="ec-c18 elc-${k} t${t} ${e&&e.k===k&&e.t===t?'on':''}" data-act="affinfo" data-k="${k}"><b>${x.tn[t-1]}</b><span>${elemP(t).toFixed(2)}%</span></button>`).join('')}`).join('')}</div>
     <div class="small muted ec-pair">18 種合計 100%。相剋：${ELEM_PAIR.map(([x,y])=>`<span class="nobr">${ELEM[x].n}⇄${ELEM[y].n}</span>`).join('・')}。打中怪物弱點加傷害；拿跟怪物同屬性的武器會扣傷害，附魔等級越高加越多、也扣越多。</div>`;
    const lack=enStones()<1?'附魔石不夠（打倒怪物、打開英靈・遺物可以拿到）':S.gold<c1?'金幣不足':'';
    const arm=!lack&&e&&e.t>=3&&ui.enchArm&&ui.enchArm.id===id&&ui.enchArm.s===ui.sheet;   // 關掉小卡再打開就重新要求確認   // v4.81 已經是三級還要重抽：先按一次變紅色確認鍵，再按一次才附魔（Mochi：避免一直按誤點）
    const bar=`<div class="ev-bar">${btn(arm?`確定重抽<span class="small">會蓋掉三級「${e.tn}」</span>`:`${e?'重新附魔':'附魔'}<span class="small">附魔石 1・${fmt(c1)} 金幣</span>`,'enchant',{cls:`${arm?'btn-danger':'btn-primary'} big nv-b`,attrs:`data-id="${id}" data-s="0"`,dis:!!lack})}${lack?`<div class="small t-danger center">${lack}</div>`:arm?'<div class="small t-danger center">這把已經是三級屬性，再按一次才會重抽</div>':''}</div>`;
    return head+`<div class="ev ec ec-pop">${mini}<div class="ec-ph"><b>✦ 隨機屬性池</b><span class="small muted">點屬性看說明</span></div>${pool}${bar}</div>`;   // v4.44 Mochi：附魔改成跟武器詳情一樣的小卡彈窗
  }
  if(mode==='give'){const vs=VILLAGES.map((v,k)=>[v,k]).filter(([v,k])=>S.villages[k].status!=='locked');
    return head+showcase('mini')+`<div class="ui-panel panel">${ptitle('可交付的村莊')}${vs.length?vs.map(([v,k])=>{const ok=eligible(k,w),st=S.villages[k],cur=st.weaponId!=null&&W(st.weaponId);
      return `<button class="ui-card ui-card--row vrow ${ok?'':'dim'}" data-act="deliver" data-i="${k}" data-id="${id}" ${ok?'':'disabled'}>${img('v'+(k+1),'vthumb')}<div class="grow"><b>${vNo(k)} ${v.name}</b>
      <div class="small ${ok?'muted':'t-danger'}">${ok?(cur?'替換 '+bpOf(cur).n+'（'+power(cur)+'）':'可以交付')+'・每輪 '+fmtT(gameDur(k,w,st.strat)):'不能交付'}</div></div><span class="pill ${ok?'gold':''}">${ok?'交付':'不符'}</span></button>`}).join(''):'<div class="empty">目前沒有開放的村莊。</div>'}</div>`;
  }
}

/* ---------- 村莊 ---------- */
function betterIdle(i){const st=S.villages[i],cur=st.weaponId!=null&&W(st.weaponId);return S.weapons.some(x=>where(x)<0&&eligible(i,x)&&(!cur||vPow(i,x)>vPow(i,cur)))}   // v4.44 算進弱點倍率
function vState(i){const st=S.villages[i];if(st.status==='locked')return['locked','未解鎖'];if(st.status==='open')return['open',''];
  if(st.weaponId==null)return st.bank.cycles?['ready','可收成']:['pause','暫停・無武器'];const w=W(st.weaponId);if(w&&st.bank.cycles>=capCycles(i,w))return['full','倉庫滿'];if(st.bank.cycles)return['ready','可收成'];return['hunt','狩獵中']}
/* v3.73 村莊怪物血條：狩獵一輪＝打倒一隻怪物（純畫面效果，狩獵時間與收成都不變） */
// v4.05 每一界第 10 關都是神（Mochi 選）：1-10 海姆達爾、2-10 斯卡蒂、烏特加德洛基移到 2-8；尼德霍格只當每週首領
// v4.04 神話怪物（Mochi 選 B）：MONS＝血條上的短名（6 字內），MON_T＝稱號，MON_LORE＝村莊詳情頁的傳說小字
const MONS=['斯寇格拉','賽赫利姆尼爾','哈提','斯庫爾','瓦爾拉文','克拉肯','山怪特羅爾','莫庫卡爾菲','穆斯貝爾騎兵','海姆達爾','斯里瓦爾迪','鐵森林狼王','赫拉斯瓦爾格','德勞格','諾克','林德蟲','卡瑞','烏特加德洛基','赫朗格尼爾','索爾'];
const MON_T=['林中魅妖','不死野豬','追月之狼','追日之狼','戰場鴉魔','深海巨怪','石皮巨魔','泥巨人','火焰騎兵','守望之神','九頭巨人','狼群首領','吞屍巨鷹','巨人屍鬼','冰湖水妖','洞穴蠕龍','風之巨人','幻術巨人王','石心巨人','雷神'];
// v4.44 怪物屬性（Mochi 選三組互剋）：弱點＝對手屬性（ELEM_OPP）；以後新的怪物都要帶一種，跟牠（祂）的故事對得上
const MON_EL=['ice','ice','dark','ice','dark','toxic','dark','toxic','fire','light','toxic','ice','bolt','dark','ice','toxic','ice','dark','toxic','bolt'];
// v4.40 怪物形態（武器系統定案 §8）：1-1 魅妖、1-9 騎兵、1-10 海姆達爾、2-10 索爾＝人形；諾克傳說化成馬＝野獸；v4.78 亡靈＝1-2 每天復活的野豬、1-5 戰死者怨魂化的鴉魔、2-4 屍鬼，2-3 巨鷹是巨人化身＝巨型、1-6 克拉肯是海中巨獸＝野獸
const MON_RACE=['man','undead','beast','beast','undead','beast','giant','giant','man','man','giant','beast','giant','undead','beast','giant','giant','giant','giant','man'];
const MON_LORE=['前面是美女，背後卻是空心的樹幹，專騙伐木工走進深林。','英靈殿每晚殺來吃、隔天又復活的野豬，這次逃到了人間。','斯庫爾的兄弟，永遠追趕月亮；月圓的夜裡在狼嚎谷對月長嚎，獵人不敢出門。','永遠追趕太陽的巨狼，一口咬住太陽，霜溪鎮整天不見日光，溪水全結成冰。','戰死者的怨魂附在渡鴉身上，吃了自己的心臟，半鳥半狼、死不了，成群俯衝城牆。','大到水手誤以為是島，觸手一捲就拖沉整艘長船。','皮硬得像岩石，還把尼德霍格蛻下的龍鱗披在身上；只怕陽光，照到就會變成石頭。','約頓海姆的巨人為赫朗格尼爾捏出的黏土戰士，高得頭碰得到雲，胸口卻只裝著一顆母馬的心，膽子很小；打輸了會哭著逃回約頓海姆。','火之國的前鋒，戰馬披著龍鱗馬鎧；身上的火要等諸神黃昏才會燃盡，只有冰屬性壓得住。','看得見九界一切的守望之神，守在通往神界的彩虹橋頭；祂第一個發現你鍛出了能傷神的武器，要親自試試它。落敗前，祂吹響加拉爾號角，封住了彩虹橋。',
 '九顆頭輪流睡覺，所以哨站永遠有人醒著；九顆頭最恨的都是索爾。','鐵森林的巨人女巫養大的狼群首領，芬里爾的遠親。','坐在世界盡頭的巨人化身成鷹，拍一下翅膀，九界就起風；牠在崖頂看著，想知道凡人有多少本事。','守著陪葬寶物不肯死去的屍鬼，越打越大。','用琴聲把人引到冰面上，再從冰洞裡伸手把人拖下去。','沒有翅膀的毒龍，盤在礦脈裡守著霜晶，蛻下的龍鱗散落在礦道裡，只有短刃鑽得進去。','北風的化身，牠一吐氣，高原上就颳三天暴風雪。','曾讓索爾喝不乾的牛角杯，其實杯底連著大海；牠捉弄過雷神，現在要捉弄你。','心臟、頭顱都是石頭，手拿磨刀石、背著石盾，是約頓海姆最強的巨人；牠一直想跟雷神索爾單挑。','奧丁之子、九界最強的神。祂的雷神之錘是矮人兄弟鍛的，錘柄卻因為洛基搗蛋短了一截；祂想看看凡人鐵匠鍛出的錘，接不接得住雷霆。'];
const monLore=i=>MON_LORE[i]?`<div class="mon-lore"><b>${MON_T[i]}・${MONS[i]}</b><span>${MON_LORE[i]}</span></div>`:'';
const MON_ART=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];   // 已有 AI 怪物圖的關卡（0 起算，圖在 art/mon_N.webp）；沒圖的先用村莊圖
const MONFX={kills:{},next:{},hp:{}};
const hpBar=i=>`<div class="ui-prog prog hpbar"><i class="hp-g"></i><i data-vhp="${i}"></i><span class="hp-t"><b class="hp-n">${MONS[i]}</b><b data-vhpt="${i}"></b></span></div>`;   // v4.01 卡片和詳情頁共用
// v4.12 村莊詳情的怪物大圖（Mochi 選 C，取代 v4.09 卡片循環翻頁）：‹ › 或下方小圖翻看同一界 10 隻，還沒解鎖的只顯示黑影
function monDex(i){const r0=Math.floor(i/10)*10,sm=ui.sheet&&ui.sheet.m,m=sm!=null&&sm>=r0&&sm<r0+10?sm:i,lk=S.villages[m].status==='locked',v=VILLAGES[m],go=k=>r0+(k-r0+10)%10;
  return `<div class="mon-dex"><div class="md-stage"><button class="md-arr" data-act="mondex" data-k="${go(m-1)}" aria-label="上一隻">${ic('arrow-left')}</button>${img('mon_'+(m+1),'md-big'+(lk?' lk':''),lk?'':MONS[m])}<button class="md-arr" data-act="mondex" data-k="${go(m+1)}" aria-label="下一隻">${ic('arrow-right')}</button></div>
   <div class="md-nm">${lk?'？？？':MON_T[m]+'・'+MONS[m]}</div><div class="md-sub">${vNo(m)} ${lk?'未解鎖的村莊':v.name}${m===i?(/神/.test(MON_T[m])?'・本村要打的神明':'・本村要打的怪物'):''}</div>
   ${lk?`<div class="md-req">完成 ${vNo(m-1)} ${VILLAGES[m-1].name} 後解鎖</div>`:`<div class="md-req">任何武器都能挑戰${/神/.test(MON_T[m])?"祂":"牠"}</div><div class="md-el"><span>屬性 <b class="elc-${MON_EL[m]}">${ELEM[MON_EL[m]].n}</b></span>・<span>弱點 <b class="elc-${vWeak(m)}">${ELEM[vWeak(m)].n}</b></span>・<span>型態 <b>${RACE_N[MON_RACE[m]]}</b></span> <span class="muted nobr">（弱點 +3%～10%・同屬性 −3%～10%）</span></div><div class="md-lore">${MON_LORE[m]}</div>`}
   <div class="md-strip">${Array.from({length:10},(_,k)=>{const j=r0+k,l=S.villages[j].status==='locked';return `<button class="${j===m?'on':''} ${l?'lk':''}" data-act="mondex" data-k="${j}" aria-label="${vNo(j)}">${img('mon_'+(j+1))}</button>`}).join('')}</div></div>`}
function vMon(i,k,bs){const art=MON_ART.includes(i);return `<div class="vmon ${k} ${art?'has-art':''} ${bs?'bs-tap':''}" data-mon="${i}" ${bs?`data-act="bsopen" data-i="${i}" role="button" aria-label="展開戰鬥畫面"`:''}>${art?img('mon_'+(i+1),'vthumb vmon-m',MONS[i]):img('v'+(i+1),'vthumb vmon-bg')}</div>`}
function monPop(el,kind,txt,dx){if(!(el.classList.contains('bs-mon')&&/bleed|poison/.test(kind))){el.classList.remove('hit','kill');void el.offsetWidth;el.classList.add(kind==='kill'?'kill':'hit')}   // v4.20 戰鬥條：流血／中毒的小傷害不播受擊
  const n=document.createElement('span');n.className='mon-pop '+kind;n.innerHTML=txt;if(dx)n.style.marginLeft=dx+'px';el.appendChild(n);setTimeout(()=>n.remove(),kind==='kill'?1100:kind==='crit'?1000:800);
  if(kind!=='kill'){const sl=document.createElement('i');sl.className='mon-slash';el.appendChild(sl);setTimeout(()=>sl.remove(),350)}}
// v4.02 各類武器打法：iv＝每輪攻擊間隔（毫秒）、E＝每輪平均倍率合計、plan(h)＝這一輪的每一下 [延遲毫秒, 倍率, 種類, 字]
// 種類：hit 一般、crit 大黃字、bleed 紫色小字；hv＝重擊（怪物和血條晃比較大）
// 總血量照舊＝攻擊力×本輪時間÷1.7 秒，只改「多久打一下、一下多少」，狩獵時間與收成不變
const HIT={
  sword:{iv:1700,E:1.125,plan:h=>(h.c=(h.c||0)+1)%4?[[0,1]]:[[0,.75,'crit','連斬'],[180,.75]]},
  dagger:{iv:600,E:1.25,plan:()=>Math.random()<.25?[[0,2,'crit','爆擊！']]:[[0,1]]},
  hammer:{iv:4500,E:1,hv:1,plan:()=>[[0,1,'crit','重擊！']]},
  axe:{iv:2500,E:1.42,plan:()=>Math.random()<.3?[[0,.8,'crit','旋風斬'],[150,.8],[300,.8]]:[[0,1]]},
  bow:{iv:3000,E:3.9,plan:()=>[0,160,320].map(t=>Math.random()<.15?[t,3,'crit','穿心']:[t,1])},
  crossbow:{iv:2600,E:1.5,plan:h=>(h.c=(h.c||0)+1)%3?[[0,1]]:[[0,2.5,'crit','破甲！']]},
  polearm:{iv:2000,E:1.75,plan:()=>[[0,1],[500,.25,'bleed'],[1000,.25,'bleed'],[1500,.25,'bleed']]}};
// v4.15 神格覺醒面板（武器詳情）：五段，已覺醒的亮起來
const HIT_N={sword:'每 1.0 秒 1 下，附加效果「會心」：這一下 ×2.5',dagger:'每 0.6 秒 1 下，附加效果「中毒」：之後再掉 5 次血',hammer:'每 1.8 秒 1 下，附加效果「震碎」：之後 3 下各 +50%',axe:'每 1.3 秒兩連斬，附加效果「流血」：之後再掉 3 次血',
  bow:'每 1.1 秒 1 箭，附加效果「穿心」：這一下 ×2.5',crossbow:'每 1.6 秒 1 發，附加效果「破甲」：之後 6 下各 +25%',polearm:'每 1.2 秒突刺 1 下，附加效果「貫穿」：追加一次 ×1.5'};
const hitOf=w=>HIT[bpOf(w).cat]||HIT.sword;
// v4.20 村莊卡片戰鬥條（武器系統定案）：騎士 12 格動作依類別（art/kn_類別_格.webp），攻速 K 毫秒、ph＝打中那一格的時間點
// 強化越高越常觸發附加效果（每次都是額外約 1.5 擊）：劍會心、斧流血、錘震碎、雙刀中毒、長柄貫穿、弓穿心、弩破甲
const KN={sword:{k:'sw',K:1000,ph:450,n:3},axe:{k:'ax',K:1300,ph:100,n:2},hammer:{k:'hm',K:1800,ph:910,n:2,hv:1},dagger:{k:'dg',K:600,ph:240,n:4},
  polearm:{k:'sp',K:1200,ph:680,n:2},bow:{k:'bw',K:1100,ph:600,n:3},crossbow:{k:'cb',K:1600,ph:800,n:2}};
const BS_BGP={1:'top',8:'top',9:'bot',10:'bot',11:'bot2',12:'bot',13:'bl',14:'top',15:'bl',16:'bot',17:'bot2',18:'bot',19:'bot2'};   // v4.35 背景本身畫了怪物的關卡（1-2、1-9、1-10、整個第二界）：戰鬥畫面只取沒有怪物的那一段（Mochi 選）
const KN_FULL=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];   // 已有全身怪物圖（art/mon_N_idle／mon_N_atk）的關卡；其他關卡先用怪物頭像。v4.30 補上 1-8、2-10；v4.35 補上第二界 2-1～2-8，20 關全部都有
const knProc=lv=>ui.bsProc?1:procP(lv);
const KHIT={};
function knHit(w){const c=bpOf(w).cat,kn=KN[c];if(!kn)return null;const p=knProc(w.lv),key=c+p;if(KHIT[key])return KHIT[key];
  const one=lab=>h=>Math.random()<p?[[0,2.5,'crit',lab]]:[[0,1]];
  const amp=(lab,blab,n,m)=>h=>{if(h.amp>0){h.amp--;return[[0,m,'buff',blab]]}if(Math.random()<p){h.amp=n;return[[0,1,'crit',lab]]}return[[0,1]]};
  const dot=(lab,kind,n,v,first)=>(t0)=>Array.from({length:n},(_,j)=>[t0+(j+1)*300,v,kind,j?'':lab]);
  const plan={sword:one('會心'),bow:one('穿心'),hammer:amp('震碎','+50%',3,1.5),crossbow:amp('破甲','+25%',6,1.25),
    axe:()=>Math.random()<p?[[0,.43],[500,.57],...dot('流血','bleed',3,.5)(500)]:[[0,.43],[500,.57]],
    dagger:()=>Math.random()<p?[[0,1],...dot('中毒','poison',5,.3)(0)]:[[0,1]],
    polearm:()=>Math.random()<p?[[0,1],[150,1.5,'crit','貫穿']]:[[0,1]]}[c];
  return KHIT[key]={iv:kn.K,E:1+1.5*p,ph:kn.ph,hv:kn.hv,plan,kn:1}}
const knOn=w=>!!(w&&KN[bpOf(w).cat]);
const knNext=(hs,t)=>{let n=t-t%hs.iv+hs.ph;if(n<t)n+=hs.iv;return n};
// v4.39 戰鬥畫面展開時的下半部：這隻怪物每輪會掉什麼、已經打到還沒收成的東西
// v4.70 戰鬥畫面展開的掉落也一樣：強化石、附魔石、遺物、武器跟材料同一種格子
const bsExtra=i=>{const o=relicOdds(i);return [[STONE,stoneE(i)],[ENSTONE,enchE(i)],...RELICS.map(k=>[k,RELIC_P*o[k]/100])].map(([k,p])=>`<button class="bs-d" data-act="iteminfo" data-k="${k}">${itemIco(k)}<span>${RELICS.includes(k)?ITEMS[k][3]+'遺物':itemName(k)}</span><b>${pctS(p)}</b></button>`).join('')
  +wDrops(i).map(([k,p])=>`<div class="bs-d">${wArt(k==='_w0'?'w0_sword':k,{cls:'bs-w'})}<span>${k==='_w0'?'鐵爐村武器':BP[k].n}</span><b>${pctS(p)}</b></div>`).join('')};
function bsMore(i,w){const v=VILLAGES[i],bk=S.villages[i].bank;
  return `<div class="bs-more"><div class="bs-k">每打倒一隻</div><div class="bs-drops"><div class="bs-d">${img('it_gold')}<span>金幣</span><b>${killGoldTxt(i)}</b></div>${v.drops.map(d=>`<button class="bs-d ${d[1]<RARE_P?'rare':''}" data-act="matinfo" data-k="${d[0]}" data-v="${pct(dropChance(i,w,d,'normal'))}">${img(MATART[d[0]])}<span>${MATS[d[0]]}</span><b>${pct(dropChance(i,w,d,'normal'))}</b></button>`).join('')}${bsExtra(i)}</div>
   <div class="bs-k">已經打到${bk.cycles?`（${bk.cycles} 輪，還沒收成）`:''}</div>${bk.cycles?`<div class="bs-got">${harvestIcons({gold:bk.gold,...bk.mats})}</div>`:'<div class="small muted">這輪打完就會有收穫。</div>'}</div>`}
function vStrip(i,w){const kn=KN[bpOf(w).cat],t=performance.now(),full=KN_FULL.includes(i),m='mon_'+(i+1);
  return `<div class="bs c-${kn.k}" data-act="bsclose" role="button" aria-label="收起戰鬥畫面" style="--n:${kn.n};--d:-${Math.round(t%kn.K)}ms;--dp:-${Math.round(t%(kn.K*kn.n))}ms">${img('v'+(i+1),'bs-bg'+(BS_BGP[i]?' bgp-'+BS_BGP[i]:''))}<i class="bs-gd"></i>
   <div class="bs-mon ${full?'':'pt'}" data-mon="${i}"><div class="bs-br"><div class="bs-hb">${full?img(m+'_idle','idle',MONS[i])+img(m+'_atk','atk'):img(m,'idle',MONS[i])}${full?['tn','fl'].map(c=>`<i class="${c}">${img(m+'_idle','idle')}${img(m+'_atk','atk')}</i>`).join(''):img(m,'tn')+img(m,'fl')}</div></div></div>
   <div class="bs-kn">${Array.from({length:12},(_,f)=>img(`kn_${kn.k}_${f}`,'k'+f)).join('')}</div></div>`}
// 打中才扣血，扣掉的量＝跳出的傷害數字；每輪開始時依「血條落後時間多少」算倍率 f（0.6～1.6），爆擊多扣的會在之後幾輪少扣補回；
// 血條最多只能比時間超前一點點，所以最後一下剛好打倒；看不到時直接對齊剩餘時間
function monShot(i,sh,f,dx){const h=MONFX.hp[i];if(!h||h.refill||h.full||document.hidden)return;const m=document.querySelector(`#view [data-mon="${i}"]`),[,mul,kind='hit',lab]=sh;
  let dm=Math.round(h.unit*mul*f*(.92+Math.random()*.16));dm=Math.min(dm,h.cur-Math.max(1,h.live-h.unit*h.hs.E*2));if(dm<1)return;h.cur-=dm;
  h.hit=h.hs.hv||kind==='crit'?2:1;if(m){monPop(m,kind,(lab?`<i>${lab}</i>`:kind==='bleed'&&!h.hs.kn?'流血 ':'')+'-'+fmt(dm),dx);if(kind==='bleed'||kind==='poison')monTint(m,kind);if(h.hs.hv){m.classList.remove('heavy');void m.offsetWidth;m.classList.add('heavy')}}monPaint(i,h)}
function monTint(m,k){m.classList.add('t-'+k);clearTimeout(m._tn);m._tn=setTimeout(()=>m.classList.remove('t-'+k),450)}
function monVolley(i,h){const sh=h.hs.plan(h),f=Math.max(.6,Math.min(1.6,(h.cur-h.live)/(h.unit*h.hs.E))),n=sh.filter(x=>!/bleed|poison/.test(x[2])).length;let k=0;
  sh.forEach(x=>{const dx=/bleed|poison/.test(x[2])?22:n>1?(k++-(n-1)/2)*(h.hs.kn&&ui.bsOpen===i?48:18):0;x[0]?setTimeout(()=>monShot(i,x,f,dx),x[0]):monShot(i,x,f,dx)})}
function monFx(i,st,w,full,d,el){const max=Math.max(1,Math.round(vPow(i,w)*d/1700)),live=full?max:Math.max(0,Math.ceil(max*(1-Math.min(1,el/d))));
  const c=st.bank.cycles,pk=MONFX.kills[i];MONFX.kills[i]=c;const now=performance.now(),m=document.querySelector(`#view [data-mon="${i}"]`),hs=knHit(w)||hitOf(w);   // v4.32 戰鬥畫面收起時，卡片小怪物也用同一套打法（長柄貫穿等）
  let h=MONFX.hp[i];if(!h||h.max!==max||h.hs!==hs)h=MONFX.hp[i]={max,cur:live};h.live=live;h.full=full;h.hs=hs;h.unit=max*hs.iv/d/hs.E;
  if(document.hidden||S.clockWarn||!document.querySelector(`[data-vhp="${i}"]`)){h.cur=live;h.refill=0}
  else if(pk!=null&&c>pk){if(m)monPop(m,'kill','擊倒！');h.cur=0;h.ramp=0;h.refill=now+1100;MONFX.next[i]=now+1500}
  else if(h.refill){if(now>=h.refill){h.refill=0;h.cur=live}}
  else if(full||live>h.cur+max*.05)h.cur=live;   // 倉庫滿、換策略重新計時
  else if(hs.kn){if(h.nx==null||h.nx<now-hs.iv)h.nx=knNext(hs,now);   // v4.20 戰鬥條：在騎士打中那一格出傷害（每 250 毫秒檢查一次，提早排好計時）
    if(now>=h.nx-260){const t=h.nx;h.nx=t+hs.iv;setTimeout(()=>monVolley(i,h),Math.max(0,t-now))}}
  else{if(MONFX.next[i]==null)MONFX.next[i]=now+Math.random()*hs.iv;
    if(now>=MONFX.next[i]){MONFX.next[i]=now+hs.iv*(.85+Math.random()*.3);monVolley(i,h)}}
  return h}
function monPaint(i,h){const hp=h.cur/h.max*100;
  document.querySelectorAll(`[data-vhp="${i}"]`).forEach(e=>{const g=e.previousElementSibling,up=hp>(parseFloat(e.style.width)||0)+5;e.style.transition=up?'none':'';e.style.width=hp+'%';e.classList.toggle('full',!!h.full);
    if(g){g.style.transition=up?'none':'';g.style.width=hp+'%'}if(h.hit){const b=e.parentNode;b.classList.remove('shake','shake2');void b.offsetWidth;b.classList.add(h.hit>1?'shake2':'shake')}});
  document.querySelectorAll(`[data-vhpt="${i}"]`).forEach(e=>e.textContent=h.full?'暫停':Math.ceil(hp)+'%');h.hit=0}
const clock=(ms,ref)=>{const s=Math.max(0,Math.ceil(ms/1000)),long=(ref??ms)>=3600000;return(long?[Math.floor(s/3600),Math.floor(s%3600/60),s%60]:[Math.floor(s/60),s%60]).map(x=>String(x).padStart(2,'0')).join(':')};
// v3.76 地圖切換：沒選過就顯示目前進度所在的那一界
// v3.95 另一界有村莊可以收成：地圖列那一界的圖示亮紅點
const realmHarvest=k=>(k===0||k===1&&rfOpen())&&S.villages.slice(k*10,k*10+10).some(v=>v.bank.cycles>0);
const realmNow=()=>Math.max(0,Math.min(rfOpen()?1:0,ui.realm??(rfOpen()?1:0)));
function viewVillage(){
  const achReady=ACH.filter(a=>!S.ach[a.id]&&a.test()).length,ready=S.villages.slice(realmNow()*10,realmNow()*10+10).filter(v=>v.bank.cycles).length;
  const rm=realmNow(),[rn,rs,rbg]=REALM_N[rm],r0=rm*10,r1=r0+10,rOk=i=>i===0||(i===1&&rfOpen());
  return `<section class="realm" style="background-image:url(${A(rbg)})"><div class="realm-in"><button class="arr ${rm>0?'':'off'}" data-act="realm" data-k="${rm-1}" aria-label="上一界">${ic('arrow-left')}</button><div class="center"><h1>${rn}</h1><div class="small">${rs}</div></div><button class="arr ${rm<1&&rfOpen()?'':'off'}" data-act="realm" data-k="${rm+1}" aria-label="下一界">${ic('arrow-right')}</button></div>
   <div class="realms">${REALMS.map((r,i)=>`<div class="rlm ${rOk(i)?'on':'off'} ${i===rm?'cur':''}" ${i<2?`data-act="realm" data-k="${i}" role="button"`:''}>${img('realm_'+(i+1),rOk(i)?'':'locked')}${rOk(i)?'':img('ic_lock','rl')}${i!==rm&&realmHarvest(i)?'<i class="dot give-dot rdot" title="這一界有村莊可以收成"></i>':''}<span>${r}</span></div>`).join('')}</div></section>${evtBanner()}
  <div class="row vbar ${LB_OFF?'two':''}">${btn(`全部收成${ready?` <span class="ui-badge badge">${ready}</span>`:''}`,'collectAll',{cls:'btn-primary grow',dis:!ready})}${btn(`任務${questDotN()?` <span class="ui-badge badge">${questDotN()}</span>`:''}`,'achopen')}${LB_OFF?'':btn('排行榜','lbopen',{attrs:`data-i="${Math.max(0,cleared()-1)}"`})}</div>
  <div class="vlist">${VILLAGES.map((v,i)=>{if(i<r0||i>=r1)return'';const[k,lab]=vState(i),st=S.villages[i],w=st.weaponId!=null&&W(st.weaponId);
   if(k==='locked'){const first=S.villages.findIndex(x=>x.status==='locked')===i;if(!first)return '';const left=S.villages.slice(r0,r1).filter(x=>x.status==='locked').length;
     return `<div class="vlocked">${img('ic_lock','lk')}<div class="grow"><b>${vNo(i)} ${v.name}</b>${left>1?` 等 ${left} 座村莊`:''}<div class="small muted">完成 ${vNo(i-1)} ${VILLAGES[i-1].name} 的委託後解鎖</div></div></div>`}
   const drops=v.drops.slice(0,3).map(d=>img(MATART[d[0]],'dico')).join('');
   if(k==='open'){const has=S.weapons.filter(x=>eligible(i,x)).sort((a,b)=>vPow(i,b)-vPow(i,a))[0]||null,sec=has&&chEst(i,has);   // v4.52 限時挑戰：駐守中的武器也能挑戰；卡片不顯示弱點（Mochi：點開詳情才看）
     return `<div class="ui-card vcard open next" data-act="vopen" data-i="${i}" role="button" tabindex="0"><span class="next-tag">下一個挑戰</span>${has&&sec<=CH_SEC?'<i class="dot give-dot"></i>':''}${img('v'+(i+1),'vthumb')}<div class="grow"><div class="row nowrap"><b class="grow">${vNo(i)} ${v.name}</b></div>
      <div class="small vwho">${MONS[i]}・血量 ${fmt(VHP(i))}</div>${FIRST_GOLD[i]?`<div class="small t-gold">首次收復獎勵 ${img('it_gold','fg-ic')} ${fmt(FIRST_GOLD[i])} 金幣</div>`:''}
      <div class="small ${has?sec<=CH_SEC?'t-ok':'t-danger':'muted'}">${has?`<span class="nobr">最強 ${bpOf(has).n} +${has.lv}</span><span class="nobr">・預估 ${Math.round(sec)} 秒${sec<=CH_SEC?' '+grChip(GRADES[grOf(sec)],'sm'):'（超過）'}</span>`:'道具欄還沒有武器'}</div></div>
      <div class="vside">${has?btn('挑戰','vopen',{cls:'btn-primary sm',attrs:`data-i="${i}"`}):btn('去鍛造','forgeCat',{cls:'btn-sec sm',attrs:'data-k="all"'})}</div></div>`}
   const bs=knOn(w)&&ui.bsOpen===i;   // v4.21 點怪物小圖才展開戰鬥畫面，一次只開一個
   // v4.39 卡片下方的箭頭也能展開／收起戰鬥畫面；展開時下方多列每輪掉落和已經打到還沒收成的東西（Mochi）
   return `<div class="ui-card vcard ${k} ${bs?'bt':''} ${knOn(w)?'tgl':''}" ${w?'':`data-act="vopen" data-i="${i}" role="button" tabindex="0"`}>${vGiveDot(i)||st.bank.cycles?'<i class="dot give-dot"></i>':''}${bs?vStrip(i,w):w?vMon(i,k,knOn(w)):img('v'+(i+1),'vthumb')}<div class="grow"><div class="row nowrap"><b class="grow">${vNo(i)} ${v.name}</b>${grChip(vGr(i),'sm')}<span class="vst ${k}">${lab}</span></div>
    ${w?`<div class="row nowrap small"><span class="wchip ${lc(w)}b" data-act="vopen" data-i="${i}" role="button" aria-label="武器：收回或更換">${wArt(w.b,{cls:'wmini'})}<span class="${lc(w)}">${bpOf(w).n} +${w.lv}</span></span><span class="num grow right" data-vclock="${i}"></span></div>${hpBar(i)}
     ${k==='full'?`<div class="small t-danger">已達離線上限 ${S.capH} 小時，暫停累積，請收成</div>`:st.bank.cycles&&!bs?`<div class="vbank">${harvestMini({gold:st.bank.gold,...st.bank.mats})}</div>`:bs?'':`<div class="small muted">每小時約打倒 ${fmt(kph(i,w))} 隻・${fmt(gph(i,w))} 金幣</div>`}${betterIdle(i)?`<button class="tag-up" data-act="vswap" data-i="${i}">道具欄有更強的可以換 ›</button>`:''}`
     :`<div class="small muted">沒有駐守武器，狩獵暫停。點開指派武器。</div>`}</div>
    <div class="vside vside-c">${st.bank.cycles?`<button class="ui-btn ui-btn--accent harvest-btn" data-act="collect" data-i="${i}"><span>收成</span><b>×<span data-vpend="${i}">${st.bank.cycles}</span></b></button>`:`<div class="drops">${drops}</div>`}</div>${bs?bsMore(i,w):''}${knOn(w)?`<button class="bs-tgl ${bs?'up':''}" data-act="${bs?'bsclose':'bsopen'}" data-i="${i}" aria-label="${bs?'收起':'展開'}戰鬥畫面"><i></i></button>`:''}</div>`}).join('')}</div>`;
}
// v3.61 從別頁點進村莊：自動捲到目前待交付的關卡（已經看得到就不動，保留上方地圖）
function scrollToNextVillage(){const el=document.querySelector('#view .vcard.next');scrollTo(0,0);if(!el)return;const r=el.getBoundingClientRect(),nav=document.querySelector('.nav'),bar=document.querySelector('.bar');
  if(r.bottom<=innerHeight-(nav?nav.offsetHeight:0))return;scrollTo(0,Math.max(0,r.top-(bar?bar.offsetHeight:0)-12))}
// v4.52 限時挑戰畫面：看完整場戰鬥（Mochi：不給快轉），怪物倒下或 60 秒到才出結果；關掉＝放棄
function chStart(i,id){const w=W(id);if(!w||!eligible(i,w)||S.villages[i].status==='locked')return toast('這把武器現在不能挑戰','bad');   // v4.71 收復後也能再挑戰刷評級
  const t0=performance.now()+300,pl=chPlan(i,w,t0);ui.ch={i,id,t0,...pl,cur:pl.hp,n:0,done:0};ui.chr=null;ui.sheet={t:'ch'};snd('ui_open');render()}
function chTick(){const c=ui.ch;if(!c)return;if(!ui.sheet||ui.sheet.t!=='ch'){ui.ch=null;return}if(c.done)return;
  const el=performance.now()-c.t0;while(c.n<c.ev.length&&c.ev[c.n][0]<=el+260){const e=c.ev[c.n++];setTimeout(()=>chHit(c,e),Math.max(0,e[0]-el))}
  if(c.win==null&&el>=CH_SEC*1000){c.done=1;setTimeout(()=>chEnd(c,false),400)}chPaint(c,el)}
function chHit(c,e){if(ui.ch!==c||c.done&&c.cur<=0)return;c.cur=Math.max(0,c.cur-e[1]);const m=document.querySelector('.ch-fight [data-mon]');
  if(m){const dot=e[2]==='bleed'||e[2]==='poison';monPop(m,e[2],(e[3]?`<i>${e[3]}</i>`:'')+'-'+fmt(e[1]),dot?22:0);if(dot)monTint(m,e[2])}
  const b=document.querySelector('.ch-hp');if(b){b.classList.remove('shake','shake2');void b.offsetWidth;b.classList.add(e[2]==='crit'?'shake2':'shake')}
  chPaint(c);if(c.cur<=0&&!c.done){c.done=1;setTimeout(()=>{if(m)monPop(m,'kill','擊倒！')},120);setTimeout(()=>chEnd(c,true),1300)}}
function chPaint(c,el=performance.now()-c.t0){const hp=c.cur/c.hp*100,left=Math.max(0,CH_SEC-el/1000);
  document.querySelectorAll('.ch-hp i').forEach(e=>e.style.width=hp+'%');document.querySelectorAll('.ch-hpt').forEach(e=>e.textContent=fmt(Math.ceil(c.cur))+' / '+fmt(c.hp));
  document.querySelectorAll('.ch-t').forEach(e=>{e.textContent=Math.ceil(c.done&&c.cur<=0?Math.max(0,CH_SEC-c.win/1000):left)+' 秒';e.classList.toggle('t-danger',left<=10)});
  const gs=(c.done&&c.cur<=0?c.win:el)/1000,g=GRADES[grOf(gs)],gn=g?g.n:'-';document.querySelectorAll('.ch-g').forEach(e=>{if(e.dataset.g!==gn){e.dataset.g=gn;e.innerHTML=g?'現在打倒 '+grChip(g):'<span class="t-danger">超過時間</span>'}});   // v4.71 現在打倒會拿到的評級
  document.querySelectorAll('.ch-tf').forEach(e=>e.style.width=(c.done&&c.cur<=0?Math.max(0,1-c.win/1000/CH_SEC):left/CH_SEC)*100+'%')}
// v4.73 打贏同時記秒殺榜紀錄（fkRec），有新紀錄就上傳
function chEnd(c,win){if(ui.ch!==c)return;const r=win?chWinCore(c.i,c.win/1000):null,fk=win?fkRec(c.i,c.win/1000,W(c.id)):null;ui.chr={i:c.i,id:c.id,win,sec:win?c.win/1000:null,left:c.cur/c.hp,r,fk};if(fk&&fk.better)setTimeout(fkSync,300);ui.ch=null;ui.sheet={t:'chr'};snd(win?'unlock':'ui_error');render()}
const vClose=btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'});
function sheetCh(){const c=ui.ch,i=c.i,v=VILLAGES[i],w=W(c.id);if(!w)return'';const el=weakMul(i,w)>1?elemOf(w):null;
  return `<div class="sheet-head"><span style="width:44px"></span><h2>${vNo(i)} ${v.name}・挑戰中</h2>${vClose}</div>
   <div class="ui-card vcard bt ch-fight">${vStrip(i,w)}</div>
   <div class="ui-panel panel ch-pan"><div class="ui-prog prog hpbar ch-hp"><i class="hp-g" style="width:${c.cur/c.hp*100}%"></i><i data-vhp="ch" style="width:${c.cur/c.hp*100}%"></i><span class="hp-t"><b class="hp-n">${MONS[i]}</b><b class="ch-hpt">${fmt(Math.ceil(c.cur))} / ${fmt(c.hp)}</b></span></div>
    <div class="row nowrap ch-trow"><b class="grow">剩餘時間</b><span class="ch-g small"></span><b class="t-gold ch-t">${CH_SEC} 秒</b></div><div class="ui-prog prog ch-tbar"><i class="ch-tf" style="width:100%"></i></div>
    <div class="small muted ch-w">${bpOf(w).n} +${w.lv}・攻擊力 ${fmt(power(w))}${el?`・<span class="elc-${el.k}">${el.n}</span>打中弱點 +${Math.round((el.m-1)*100)}%`:weakMul(i,w)<1?`・<span class="t-danger"><span class="elc-${elemOf(w).k}">${elemOf(w).n}</span>同屬性 −${Math.round((1-weakMul(i,w))*100)}%</span>`:''}・預估 ${Math.round(chEst(i,w))} 秒</div></div>
   <div class="vw-acts">${btn('放棄','close',{cls:'btn-sec big'})}</div>`}
// 強化到幾級才能在 60 秒內打倒（時間到的建議用）
const chNeedLv=(i,w)=>{for(let lv=w.lv+1;lv<=MAX_LV;lv++)if(chEst(i,{...w,lv})<=CH_SEC)return lv;return null};
// v4.73 秒殺榜畫面：結算一行、村莊詳情評級區一行、秒殺榜（每關前 50 名）
function fkResLine(i,f){if(!f)return'';const c=fkBoard(i),my=c.my,st=S.villages[i],up=st.fku!==st.fk;
  const pos=!AUTH&&!FK.mock?'登入後會上傳到全服秒殺榜':up&&!c.err?'上傳秒殺榜中…':c.err&&up?'⚠ '+esc(c.err):my?`全服第 <b class="t-gold">${my.rk}</b> 名／${my.n} 人${my.top!=null?`・全服最快 ${(+my.top).toFixed(1)} 秒`:''}`:'';
  return `<button class="ui-panel panel fk-res" data-act="fkopen" data-i="${i}"><div class="grow"><b>${f.better?(f.prev==null?'秒殺紀錄 ':'新紀錄！ ')+f.sec.toFixed(1)+' 秒':'這次 '+f.sec.toFixed(1)+' 秒・最快 '+st.fk.toFixed(1)+' 秒'}</b><div class="small muted">${pos}</div></div><span class="go">秒殺榜 ›</span></button>`}
function fkRow(i){const m=fkMine(i);if(!m&&S.villages[i].status!=='cleared')return'';if(AUTH)setTimeout(()=>fkLoad(i),0);const c=fkBoard(i),my=c.my;
  return `<button class="fk-row" data-act="fkopen" data-i="${i}"><span class="grow small">${m?`我的最快 <b class="t-gold">${m.sec.toFixed(1)} 秒</b>${my?`（第 ${my.rk} 名）`:''}`:'還沒有秒殺紀錄'}${my&&my.top!=null?`・全服最快 ${(+my.top).toFixed(1)} 秒`:''}</span><span class="go">秒殺榜 ›</span></button>`}
function sheetFk(i){i=Math.max(0,Math.min(VILLAGES.length-1,i|0));if(AUTH)setTimeout(()=>fkLoad(i),0);const v=VILLAGES[i],c=fkBoard(i),m=fkMine(i),rows=c.rows||[];
  const head=`<div class="sheet-head">${btn('‹','vopen',{cls:'icon-btn',attrs:`data-i="${i}" aria-label="回村莊"`})}<h2>秒殺榜</h2>${vClose}</div>`;
  const tabs=`<div class="lb-tabs">${VILLAGES.map((x,k)=>{if(k>=10&&!rfOpen())return'';const lk=S.villages[k].status==='locked';return `<button class="lb-tab ${k===i?'on':''} ${lk?'lk':''}" data-act="fkopen" data-i="${k}" ${lk?'disabled':''}><img src="${A('v'+(k+1))}" alt=""><span>${vNo(k)}</span>${fkBoss(k)?'<i class="fk-k">王</i>':''}${lk?img('ic_lock','lb-lk'):''}</button>`}).join('')}</div>`;
  const g=x=>grChip(GRADES[grOf(+x)],'sm');
  const me=m?`<div class="lb-me fk-me">${wArt(m.w.b,{frame:fq(m.w)})}<div class="grow"><div class="small muted">我的最快</div><b class="t-gold fk-s">${m.sec.toFixed(1)} 秒</b> ${g(m.sec)}<div class="small ${lc(m.w)}">${BP[m.w.b]?BP[m.w.b].n:''} +${m.w.lv|0}</div></div><div class="lb-mypos"><span class="small muted">名次</span><b>${c.my?c.my.rk:'…'}</b><span class="small muted">／${c.my?c.my.n:'…'}</span></div></div>`
    :`<div class="lb-me empty"><div class="grow"><b>還沒有秒殺紀錄</b><div class="small muted">${S.villages[i].status==='cleared'?'在村莊詳情按「挑戰評級」再打一次就會上榜':'60 秒挑戰打倒'+esc(MONS[i])+'就會上榜'}</div></div></div>`;
  const row=x=>{const w=x.w||{},b=BP[bpId(w.b)];return `<div class="lb-row ${x.mine?'me':''}"><span class="lb-no r${Math.min(x.rk,4)}">${x.rk}</span>${b?wArt(b.id,{frame:fq(w),cls:'lb-art'}):''}<div class="grow"><button class="who fk-who" data-act="pcard" data-u="${esc(x.uid||'')}" data-n="${esc(x.nick||'')}">${esc(x.nick||'無名鐵匠')}</button><div class="small ${lc(w)}">${b?esc(b.n):'？'} +${w.lv|0}</div></div><span class="fk-t"><b class="lb-p">${(+x.sec).toFixed(1)}</b><span class="small muted">秒</span>${g(x.sec)}</span></div>`};
  const note=!AUTH&&!FK.mock?'登入後才會顯示其他玩家':c.err?'⚠ '+esc(c.err):c.loading&&!c.t?'讀取中…':`共 ${c.n|0} 位鐵匠打倒過${esc(MONS[i])}・只記每人最快一次`;
  return head+tabs+`<div class="lb-vh"><b>${vNo(i)} ${esc(MONS[i])}</b>${fkBoss(i)?' <span class="small t-gold">王關・刷新第 1 名會上跑馬燈</span>':''}</div>`+me
    +(rows.length?`<div class="ui-panel panel lb-list">${rows.map(row).join('')}</div>`:'')+`<div class="small muted center">${note}</div>`}
function sheetChr(){const r=ui.chr,i=r.i,v=VILLAGES[i],w=W(r.id);
  if(r.win){const nx=VILLAGES[i+1],st=S.villages[i],free=w&&where(w)!==i;
    const R=r.r||{},g=GRADES[R.g??2],up=R.g>0?GRADES[R.g-1]:null,best=st.gr!=null?GRADES[st.gr]:g;
    return `<div class="sheet-head"><span style="width:44px"></span><h2>${R.first?'收復成功！':'挑戰完成'}</h2>${vClose}</div>
     <div class="banner" style="background-image:url(${A('v'+(i+1))})"><span class="small">${vNo(i)} ${v.name}</span><span>用時 <b class="t-gold">${r.sec.toFixed(1)} 秒</b>（限時 ${CH_SEC} 秒）打倒${MONS[i]}</span></div>
     <div class="ui-panel panel gr-res">${grChip(g,'big')}<div class="grow"><b>${R.first?'評級 '+g.n:R.better?'新紀錄！評級 '+g.n:'這次 '+g.n+'・最好成績 '+best.n}</b><div class="small muted">掛機收益 ×${best.m}${up?`・再快 ${Math.max(.1,r.sec-up.t).toFixed(1)} 秒就是 ${up.n}`:''}</div></div></div>
     ${fkResLine(i,r.fk)}
     ${R.first||R.fg?`<div class="ui-panel panel">${ptitle(R.first?'獎勵':'評級提升補發')}${r.r.fg?`<div class="mats">${harvestIcons({gold:r.r.fg})}</div>`:''}<div class="small t-ok">${R.first&&nx?`解鎖 ${vNo(i+1)} ${nx.name}`:''}${r.r.bps.length?`${nx?'・':''}新圖紙「${r.r.bps.map(b=>b.n).join('」「')}」`:''}</div></div>`:''}
     ${w&&st.weaponId==null?`<div class="ui-panel panel"><div class="small">要讓 ${bpOf(w).n} +${w.lv} 留下來掛機嗎？每小時約打倒 ${fmt(kph(i,w))} 隻，掉金幣和強化石。${where(w)>=0?`（會從 ${vNo(where(w))} 移過來）`:''}</div></div>
      <div class="vw-acts">${btn('留下來掛機','chstay',{cls:'btn-primary big',attrs:`data-i="${i}" data-id="${w.id}"`})}${btn('回村莊','close',{cls:'btn-sec big'})}</div>`:`<div class="vw-acts">${w&&up?btn('再挑戰','chgo',{cls:'btn-sec big',attrs:`data-i="${i}" data-id="${w.id}"`}):''}${btn('回村莊','close',{cls:'btn-primary big'})}</div>`}`}
  const nl=w&&chNeedLv(i,w),wk=vWeak(i);
  return `<div class="sheet-head"><span style="width:44px"></span><h2>時間到</h2>${vClose}</div>
   <div class="banner" style="background-image:url(${A('v'+(i+1))})"><span class="small">${vNo(i)} ${v.name}</span><span>${MONS[i]}還剩 <b class="t-danger">${Math.max(1,Math.round(r.left*100))}%</b> 血量。沒有任何損失，可以馬上再試。</span></div>
   <div class="ui-panel panel">${ptitle('怎麼變強')}<div class="small ch-tips">${w&&nl?`・強化 ${bpOf(w).n} 到 +${nl}：預估 ${Math.round(chEst(i,{...w,lv:nl}))} 秒<br>`:''}${wk?`・附魔抽到<span class="elc-${wk}">${ELEM[wk].n}</span>（${MONS[i]}的弱點）：傷害 +3%～10%；別用<span class="elc-${vRes(i)}">${ELEM[vRes(i)].n}</span>，同屬性有抗性（−3%～10%）<br>`:''}・換一把攻擊力更高的武器<br>・駐守前面的村莊掛機，刷強化石</div></div>
   <div class="vw-acts">${w?btn('再挑戰','chgo',{cls:'btn-primary big',attrs:`data-i="${i}" data-id="${w.id}"`}):''}${btn('換武器','vopen',{cls:'btn-sec big',attrs:`data-i="${i}"`})}</div>`}
function sheetVillage(i){
  const v=VILLAGES[i],st=S.villages[i],w=st.weaponId!=null&&W(st.weaponId),bk=st.bank;
  const head=`<div class="sheet-head"><span style="width:44px"></span><h2>${vNo(i)} ${v.name}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
   <div class="banner" style="background-image:url(${A('v'+(i+1))})"><span class="small">${v.who}</span><span>${v.txt}</span></div>${monDex(i)}
`;
  const drops=s=>`<div class="mats vx-mats">${dropGold(i)}${v.drops.map(d=>`<button class="matbox mb-tap" data-act="matinfo" data-k="${d[0]}" data-v="${pct(dropChance(i,w||null,d,s))}">${img(MATART[d[0]])}<span class="mb-n">${MATS[d[0]]}${d[1]<RARE_P?' <span class="ui-badge badge">稀有</span>':''}</span><span class="mb-c">${pct(dropChance(i,w||null,d,s))}</span></button>`).join('')}${dropBoxes(i)}</div>`;
  const bank=bk.cycles?`<div class="ui-panel panel">${ptitle(`已累積 ${bk.cycles} 輪${bk.events?`（受襲 ${bk.events} 次）`:''}`)}<div class="mats">${harvestIcons({gold:bk.gold,...bk.mats})}</div>${btn('收成','collect',{cls:'btn-primary big',attrs:`data-i="${i}"`})}</div>`:'';
  // v4.38 駐守中的村莊不再開詳情（Mochi）：掉落看卡片，點卡片上的武器只跳出這張小卡（看武器、換武器、收回武器）
  const chm=!!(ui.sheet&&ui.sheet.ch)&&st.status==='cleared';   // v4.71 已收復的村莊再挑戰刷評級
  if(w&&!chm)return `<div class="sheet-head"><span style="width:44px"></span><h2>${vNo(i)} ${v.name}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
   <div class="ui-panel panel vw-pick"><div class="tilebox">${wTile(w,`data-act="wopen" data-id="${w.id}"`)}</div><div class="grow"><b class="${lc(w)}">${bpOf(w).n} +${w.lv}</b><div class="small muted">攻擊力 ${fmt(power(w))}・駐守狩獵中</div></div></div>${grPanel(i,1)}
   <div class="vw-acts">${btn('看武器詳情','wopen',{cls:'btn-sec big',attrs:`data-id="${w.id}"`})}${btn('換武器','vswap',{cls:'btn-sec big',attrs:`data-i="${i}"`})}${btn('收回武器','recall',{cls:'btn-primary big',attrs:`data-i="${i}"`})}</div>`;
  // v4.52 還沒收復＝選武器限時挑戰（駐守中的也能挑戰）；已收復＝指派駐守掛機。預估秒數已算攻速、強化、附加效果、弱點、相剋
  const open=st.status==='open'||chm,ok=S.weapons.filter(x=>eligible(i,x)&&(open||where(x)<0)).sort((a,b)=>vPow(i,b)-vPow(i,a)),wk=vWeak(i);
  const tile=x=>{const sec=open?chEst(i,x):vSec(i,x),g=GRADES[grOf(sec)];return `<div class="ch-pick">${wTile(x,`data-act="${open?'chgo':'deliver'}" data-i="${i}" data-id="${x.id}"`)}<div class="small ${!open||sec<=CH_SEC?'t-ok':'t-danger'}">${open?`預估 ${Math.round(sec)} 秒${g?' '+grChip(g,'sm'):''}`:`${fmt(kph(i,x))} 隻／小時`}</div></div>`};
  return head+`<div class="ui-panel panel"><div class="kvgrid">${kv('怪物',MONS[i])}${kv('血量',fmt(VHP(i)))}${kv('屬性',MON_EL[i]?`<span class="elc-${MON_EL[i]}">${ELEM[MON_EL[i]].n}</span>`:'—')}${kv('弱點',wk?`<span class="elc-${wk}">${ELEM[wk].n}</span>`:'—')}${kv('型態',RACE_N[MON_RACE[i]]||'—')}${open?kv('時間限制',CH_SEC+' 秒'):kv('每隻金幣',killGoldTxt(i)+(grMul(i)!==1?` <span class="muted">×${grMul(i)}</span>`:''))}${FIRST_GOLD[i]?kv('首次收復獎勵',st.status==='cleared'?'<span class="muted">已領取</span>':'<span class="t-gold">'+fmt(FIRST_GOLD[i])+' 金幣</span>').replace('class="kv"','class="kv kv-wide"'):''}</div></div>
   ${v.drops.length?`<div class="ui-panel panel">${ptitle('每打倒一隻可能掉')}${drops('normal')}${grMul(i)!==1?`<div class="small muted vx-drop">機率已含評級 ×${grMul(i)}</div>`:''}</div>`:''}${bank}${grPanel(i,st.status==='cleared'&&!chm)}
   <div class="ui-panel panel">${ptitle(chm?'選一把武器挑戰評級':open?'選一把武器挑戰':'指派駐守武器')}${ok.length?`<div class="wgrid">${ok.map(tile).join('')}</div><div class="small muted">${chm?'只記最好成績，打輸或評級比較低都不會變差。':open?`${CH_SEC} 秒內打倒就收復，輸了可以馬上再試，沒有任何懲罰。`:'點武器即可駐守，每打倒一隻就收成一次。'}</div>`:`<div class="empty">道具欄沒有${open?'':'閒置的'}武器，先到鐵匠鋪鍛造一把。</div>`}</div>`;
}
// v4.71 評級表：打倒秒數 → 評級 → 掛機收益倍率，目前的最好成績亮起來
function grPanel(i,go){const cur=S.villages[i].gr;return `<div class="ui-panel panel">${ptitle('挑戰評級'+(cur!=null?`・最好成績 ${grChip(GRADES[cur])}`:''))}<div class="gr-tab">${GRADES.map((g,k)=>`<div class="gr-c ${k===cur?'on':''}">${grChip(g)}<span class="small">${g.t} 秒內</span><span class="small ${g.m>1?'t-ok':g.m<1?'t-danger':'muted'}">收益 ×${g.m}</span></div>`).join('')}</div><div class="small muted">評級越高，掛機每打倒一隻的金幣和各種掉落機率越高；SS、S 的首次收復獎勵 ×${GRADES[0].f}／×${GRADES[1].f}。收復後可以隨時再挑戰，只記最好成績。</div>${fkRow(i)}${go?btn('挑戰評級','chmode',{cls:'btn-primary big gr-go',attrs:`data-i="${i}"`}):''}</div>`}
// v4.38 「需要的武器」整段拿掉（Mochi：不限武器了就多餘）
// v4.70 Mochi：金幣、強化石、附魔石、遺物、武器都跟材料一樣用格子顯示（圖＋名稱＋機率）
const dropGold=i=>`<div class="matbox">${img('it_gold')}<span class="mb-n">金幣</span><span class="mb-c">${killGoldTxt(i)}${grMul(i)!==1?' ×'+grMul(i):''}</span></div>`;
const pctS=x=>+(x*100).toFixed(x<.01?2:1)+'%';
function dropBoxes(i){const o=relicOdds(i),gm=grMul(i),box=(ico,n,c,act='')=>`<${act?'button':'div'} class="matbox ${act?'mb-tap':''}" ${act}>${ico}<span class="mb-n">${n}</span><span class="mb-c">${c}</span></${act?'button':'div'}>`;
  return [[STONE,stoneE(i)*gm],[ENSTONE,enchE(i)*gm],...RELICS.map(k=>[k,RELIC_P*gm*o[k]/100])].map(([k,p])=>box(itemIco(k),RELICS.includes(k)?ITEMS[k][3]+'遺物':itemName(k),pctS(p),`data-act="iteminfo" data-k="${k}"`)).join('')
   +wDrops(i).map(([k,p])=>box(wArt(k==='_w0'?'w0_sword':k,{cls:'mb-w'}),k==='_w0'?'鐵爐村武器<br><span class="small">隨機一把</span>':BP[k].n,pctS(p*gm))).join('')}   // v4.71 機率乘評級倍率
const gph=(i,w)=>{const v=VILLAGES[i],st=S.villages[i],gs=goldMul(i,w)*grMul(i);return Math.round(3600000/gameDur(i,w)*vKillGold(i)*STRATS[st.strat].gold*gs*(1+(tal('gold')+gdGold())/100))};
const kph=(i,w)=>Math.round(3600000/gameDur(i,w));   // v4.52 每小時擊殺數
const harvestMini=g=>Object.entries(g).filter(([k,n])=>n).slice(0,4).map(([k,n])=>`<span class="hm">${itemIco(k)}${fmt(n)}</span>`).join('');
const harvestIcons=g=>Object.entries(g).filter(([k,n])=>n).map(([k,n])=>`<div class="hico">${itemIco(k)}<span class="num">×${fmt(n)}</span></div>`).join('')||'<div class="small muted">沒有獎勵</div>';
function lbRows(i){const b=S.best[i];return [...lbOthers(i).map(x=>({...x,me:false})),...(b?[{n:S.nick||'你',p:b.p,t:lbMyT(i),w:{b:b.b,q:b.q,lv:b.lv,traits:b.traits||[],ench:b.ench||[]},me:true}]:[])].sort((x,y)=>y.p-x.p||(x.t<y.t?-1:x.t>y.t?1:y.me-x.me)).map((x,k)=>({...x,k}))}
// 排行榜武器詳情（唯讀）：對手或你的紀錄，內容跟武器詳情頁同一套排版
function sheetLbW(i,k){const x=lbRows(i)[k];if(!x)return sheetLb(i);const w=x.w,b=BP[w.b],v=VILLAGES[i],el=powAff(w);
  const head=`<div class="sheet-head">${btn(img('ic_back'),'lbopen',{cls:'icon-btn img',attrs:`data-i="${i}" aria-label="返回排行榜"`})}<h2>${x.me?'你的紀錄':'對手武器'}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  return head+`<div class="lbw-owner"><span class="lb-no r${Math.min(k+1,4)}">${k+1}</span><div class="grow"><b>${x.n}</b><div class="small muted">${vNo(i)} ${v.name}排行榜・第 ${k+1} 名</div></div>${!x.me&&x.u?btn('名片','pcard',{cls:'btn-sec sm',attrs:`data-u="${esc(x.u)}" data-n="${esc(x.n)}"`}):''}</div>
   <div class="ui-card ui-card--feature wd-head ${lc(w)}b"><div class="wd-art">${wArt(b.id,{frame:fq(w)})}</div>
    <div class="wd-info"><h2 class="${lc(w)}">${b.n} <span class="lvt">+${w.lv}</span></h2><div class="wd-tags"></div>
     <div class="small muted">${kindN(b)}・${CATS[b.cat]}・<span class="nw">安定值 <b class="${TIERS[b.t].stable?'t-ok':'t-danger'}">+${TIERS[b.t].stable}</b></span></div>
     <div class="wd-pow"><span class="small muted">攻擊力</span><b>${fmt(x.p)}</b></div></div></div>
   <div class="ui-panel panel wd-sub">${effRows(w)}
    <div class="kvgrid">${kv('基礎攻擊力',b.base)}${kv('品質倍率','×'+QUAL[w.q].m)}${kv('材質階級',TIERS[b.t].n+' ×'+TIERS[b.t].mult)}${kv('強化倍率','×'+enhMult(w.lv).toFixed(2))}${kv('元素加成',el?'+'+Math.round(el*10)/10+'%':'—')}${kv('最終攻擊力','<span class="t-gold">'+fmt(x.p)+'</span>')}</div></div>
   ${x.me?'':`<div class="small muted center">${S.best[i]?(x.p>S.best[i].p?`比你的紀錄高 <b class="t-gold">${fmt(x.p-S.best[i].p)}</b> 攻擊力`:`你的紀錄比他高 <b class="t-ok">${fmt(S.best[i].p-x.p)}</b> 攻擊力`):'你還沒有交付武器給這座村莊'}</div>`}
   ${btn('回排行榜','lbopen',{cls:'btn-sec big',attrs:`data-i="${i}"`})}`}
// v3.16 排行榜：每個村莊（委託）一個榜，比的是你交付過最高攻擊力的武器
function sheetLb(i){i=Math.max(0,Math.min(VILLAGES.length-1,i));const pend=lbReward(i);if(pend.length)setTimeout(()=>toast('上榜獎勵：<br>'+pend.join('<br>'),'ok'),50);   // 舊存檔已駐守的武器：打開排行榜時補發
  if(AUTH)setTimeout(()=>lbFetch(),0);const v=VILLAGES[i],st=S.villages[i],b=S.best[i],rk=lbRank(i),npc=lbOthers(i),got=S.lbRw[i]||[];
  const rows=lbRows(i);
  const head=`<div class="sheet-head"><span style="width:44px"></span><h2>排行榜</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  const tabs=`<div class="lb-tabs">${VILLAGES.map((x,k)=>{if(k>=10&&!rfOpen())return'';const lk=S.villages[k].status==='locked',r=lbRank(k);return `<button class="lb-tab ${k===i?'on':''} ${lk?'lk':''}" data-act="lbopen" data-i="${k}" ${lk?'disabled':''}><img src="${A('v'+(k+1))}" alt=""><span>${vNo(k)}</span>${r&&r<=10?`<i class="lb-rk r${Math.min(r,4)}">${r}</i>`:''}${lk?img('ic_lock','lb-lk'):''}</button>`}).join('')}</div>`;
  const me=b?`<div class="lb-me" data-act="lbw" data-i="${i}" data-k="${rows.findIndex(x=>x.me)}" role="button">${wArt(b.b,{frame:fq(b)})}<div class="grow"><div class="small muted">你的最佳紀錄</div><b class="${lc(b)}">${BP[b.b].n} +${b.lv}</b><div class="small">攻擊力 <b class="t-gold">${fmt(b.p)}</b></div></div><div class="lb-mypos"><span class="small muted">名次</span><b>${rk||'…'}</b><span class="small muted">／${npc.length+1}</span></div></div>`
    :`<div class="lb-me empty"><div class="grow"><b>還沒有交付武器</b><div class="small muted">交付武器就會上榜</div></div></div>`;
  const nxt=b&&rk>1?npc.filter(x=>x.p>b.p).slice(-1)[0]:null;
  const goal=AUTH&&!LBR.t?'<div class="small muted center lb-goal">讀取排行榜中…</div>':nxt?`<div class="small muted center lb-goal">再提升 <b class="t-gold">${fmt(nxt.p-b.p+1)}</b> 攻擊力就能超越第 ${rk-1} 名 ${nxt.n}</div>`:b?'<div class="small t-ok center lb-goal">你是這座村莊最強的鐵匠！</div>':'';
  const rws=`<div class="lb-rws">${LB_RW.map(([t,r,n])=>{const ok=got.includes(t);return `<div class="lb-rw ${ok?'ok':''}"><span class="small">${n}</span>${Object.entries(r).map(([k,c])=>`${itemIco(k)}<b>×${c}</b>`).join('')}<span class="small ${ok?'t-ok':'muted'}">${ok?'已領取':'未達成'}</span></div>`}).join('')}</div>`;
  const myIx=rows.findIndex(x=>x.me),show=rows.map((x,k)=>({...x,k})).filter(x=>x.k<10||x.me);
  const row=x=>`<button class="lb-row ${x.me?'me':''} ${x.k<3?'top':''}" data-act="lbw" data-i="${i}" data-k="${x.k}"><span class="lb-no r${Math.min(x.k+1,4)}">${x.k+1}</span>${wArt(x.w.b,{frame:fq(x.w),cls:'lb-art'})}<div class="grow"><b>${x.n}</b><div class="small ${lc(x.w)}">${BP[x.w.b].n} +${x.w.lv}</div></div><b class="lb-p">${fmt(x.p)}</b><span class="muted lb-more">›</span></button>`;
  return head+tabs+`<div class="lb-vh"><b>${vNo(i)} ${v.name}</b></div>`+me+goal+rws
    +`<div class="ui-panel panel lb-list">${show.map((x,k)=>(k>0&&x.k-show[k-1].k>1?'<div class="lb-gap">⋯</div>':'')+row(x)).join('')}</div>
    <div class="small muted center">${!AUTH?'登入後才會顯示其他玩家（測試版）':LBR.err?'⚠ '+LBR.err:LBR.loading&&!LBR.t?'讀取中…':'封測玩家真實紀錄，每分鐘更新'}</div>`}
// v3.15 委託成就：正式版型 A（進度清單）；開發模式下可切換原版／B／C／D 比較
const ACH_G={v:['收復村莊','nav_village'],h:['村莊收成','it_gold'],f:['鍛造與強化','nav_forge']};
const achSt=a=>S.ach[a.id]?'done':a.test()?'ready':'todo';
const achP=a=>{const[c,m]=a.p();return{c:Math.min(c,m),m,f:Math.min(1,c/m)}};
const achRw=(a,cls='')=>Object.entries(a.r).map(([k,n])=>`<span class="ach-rw ${cls}">${itemIco(k)}<b>×${n}</b></span>`).join('');
const achBtn=(a,st,cls='sm')=>btn(st==='done'?'已領取':st==='ready'?'領取':'未達成','ach',{cls:(st==='ready'?'btn-primary ':'btn-sec ')+cls,attrs:`data-k="${a.id}"`,dis:st!=='ready'});
const achOrder=list=>[...list].sort((x,y)=>({ready:0,todo:1,done:2}[achSt(x)]-{ready:0,todo:1,done:2}[achSt(y)]));
function claimAllAch(){let n=0,got={};ACH.forEach(a=>{if(!S.ach[a.id]&&a.test()&&claimAch(a.id)){n++;for(const k in a.r)got[k]=(got[k]||0)+a.r[k]}});
  if(!n)return toast('目前沒有可領取的成就。');snd('coin');toast(`領取 ${n} 項：`+Object.entries(got).map(([k,v])=>itemName(k)+' ×'+v).join('、'),'ok');render()}
// v3.70 每日任務（活躍度寶箱）與七日簽到
function viewDaily(){const pts=dailyPts();
  const box=DAILY_BOX.map(([need,rf],i)=>{const got=S.daily.box.includes(i),rd=boxReady(i),r=rf();
    return `<div class="dq-box ${got?'done':rd?'ready':''}"><div class="dq-need">活躍 ${need}</div><div class="dq-rws">${Object.entries(r).map(([k,n])=>`<span class="ach-rw">${img(rwIcon(k))}<b>×${fmtS(n)}</b></span>`).join('')}</div>${btn(got?'已領取':rd?'領取':'未達成','qbox',{cls:(rd?'btn-primary':'btn-sec')+' sm',attrs:`data-i="${i}"`,dis:!rd})}</div>`}).join('');
  return `<div class="dq-sum"><div class="dq-pts"><span class="small muted">今日活躍度</span><b>${pts}</b><span class="small muted">／100</span></div><div class="dq-track"><div class="prog ui-prog"><i style="width:${pts}%"></i></div>${DAILY_BOX.map(([n])=>`<span class="dq-mk ${pts>=n?'on':''}" style="left:${n}%"></span>`).join('')}</div></div>
   <div class="dq-boxes">${box}</div>
   <div class="dq-list">${DAILY.map(q=>{const c=dailyP(q),ok=c>=q.m;return `<div class="dq-row ${ok?'done':''}">${img(q.ic,'dq-ic')}<div class="grow"><div class="dq-t"><b>${q.n}</b><span class="small">${ok?'完成':c+'／'+q.m}</span></div><i class="cb-bar"><i style="width:${c/q.m*100}%"></i></i></div><span class="dq-pt">+${q.pt}</span></div>`}).join('')}</div>
   <div class="small muted center">任務每天 0 點重置，完成後自動加活躍度。</div>`}
function viewSign(){const rd=signReady(),cur=rd?S.sign.n%SIGN.length:S.sign.n-1;
  return `<div class="sg-grid">${SIGN.map((r,i)=>{const st=i<cur||(!rd&&i===cur)?'done':i===cur?'today':'';
    return `<div class="sg-day ${st} ${i===SIGN.length-1?'big':''}"><span class="sg-n">第 ${i+1} 天</span><span class="sg-rws">${Object.entries(r).map(([k,n])=>`<span class="ach-rw">${img(rwIcon(k))}<b>×${fmtS(n)}</b></span>`).join('')}</span>${st==='done'?img('ic_check','sg-ok'):''}</div>`}).join('')}</div>
   ${btn(rd?`簽到領取第 ${cur+1} 天獎勵`:'今天已簽到，明天再來','qsign',{cls:(rd?'btn-primary':'btn-sec')+' big',dis:!rd})}
   <div class="small muted center">漏簽不會歸零；第 7 天領完後從第 1 天重新開始。</div>`}
function sheetAch(){const v=ui.achV||'A',nDone=ACH.filter(a=>S.ach[a.id]).length,nReady=ACH.filter(a=>achSt(a)==='ready').length;
  const qd=(n)=>n?`<i class="dot">${n}</i>`:'',qt=ui.qTab||'d';
  const head=`<div class="sheet-head"><span style="width:44px"></span><h2>任務</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img'})}</div>
   <div class="subtabs ach-tabs q-tabs">${[['d','每日任務',boxReadyN()],['o','委託成就',nReady]].map(([k,n,c])=>`<button class="ui-tab ${qt===k?'on':''}" data-act="qtab" data-k="${k}">${n}${qd(c)}</button>`).join('')}</div>`;
  if(qt==='d')return head+viewDaily();
  const pick=devMode()?`<div class="ach-vpick"><span class="small muted">版型預覽</span>${['O','A','B','C','D'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${v===k?'on':''}" data-act="achv" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>`:'';
  const sum=`<div class="ach-sum"><div><b>${nDone}</b><span class="small muted">／${ACH.length} 已領取</span></div><div class="grow small muted">免費鑽石</div>${btn(nReady?`一鍵領取（${nReady}）`:'沒有可領取','achAll',{cls:(nReady?'btn-primary':'btn-sec')+' sm',dis:!nReady})}</div>`;
  const bar=(a,cls='')=>{const p=achP(a);return `<div class="ach-bar ${cls}"><div class="prog sm ui-prog"><i style="width:${p.f*100}%"></i></div><span class="small">${fmt(p.c)}／${fmt(p.m)}</span></div>`};
  if(v==='O')return head+pick+`<div class="small muted">完成委託成就可以免費領鑽石。</div>`+ACH.map(a=>{const done=S.ach[a.id],ready=!done&&a.test();return `<div class="ui-panel panel row nowrap"><div class="grow"><b>${a.n}</b><div class="small muted">獎勵：${Object.entries(a.r).map(([k,n])=>itemName(k)+' ×'+n).join('、')}</div></div>
  ${btn(done?'已領取':ready?'領取':'未達成','ach',{cls:ready?'btn-primary sm':'btn-sec sm',attrs:`data-k="${a.id}"`,dis:!ready})}</div>`}).join('');
  // A：進度清單（可領取排最上、已領取沉到最下）
  const v2=ui.achV2||'O';   // v3.19 成就精簡預覽：O 目前 A 版／1 一行一項／2 分類摺疊
  if(v==='A'&&v2==='1')return head+pick+sum+`<div class="ach-1">${achOrder(ACH).map(a=>{const st=achSt(a),p=achP(a);return `<div class="ach1 ${st}">${img(a.ic,'ach1-ic')}<div class="grow"><div class="ach1-t"><b>${a.n}</b><span class="small">${st==='done'?'已完成':fmt(p.c)+'／'+fmt(p.m)}</span></div><i class="cb-bar"><i style="width:${st==='done'?100:p.f*100}%"></i></i></div><span class="ach1-rw">${achRw(a)}</span>${st==='ready'?btn('領取','ach',{cls:'btn-primary sm',attrs:`data-k="${a.id}"`}):''}</div>`}).join('')}</div>`;
  if(v==='A'&&v2==='2')return head+pick+sum+Object.entries(ACH_G).map(([k,[n,ic]])=>{const list=achOrder(ACH.filter(a=>a.g===k)),rd=list.filter(a=>achSt(a)==='ready').length,dn=list.filter(a=>achSt(a)==='done').length,op=(ui.achOpen??Object.keys(ACH_G).find(x=>ACH.some(a=>a.g===x&&achSt(a)==='ready'))??'v')===k;
    return `<div class="ach2 ${op?'open':''}"><button class="ach2-h" data-act="achgrp" data-k="${k}">${img(ic)}<b class="grow">${n}</b><span class="small muted">${dn}/${list.length}</span>${rd?`<i class="ach2-dot">${rd}</i>`:''}<span class="muted">${op?'－':'＋'}</span></button>${op?`<div class="ach2-b">${list.map(a=>{const st=achSt(a),p=achP(a);return `<div class="ach1 ${st}"><div class="grow"><div class="ach1-t"><b>${a.n}</b><span class="small">${st==='done'?'已完成':fmt(p.c)+'／'+fmt(p.m)}</span></div><i class="cb-bar"><i style="width:${st==='done'?100:p.f*100}%"></i></i></div><span class="ach1-rw">${achRw(a)}</span>${st==='ready'?btn('領取','ach',{cls:'btn-primary sm',attrs:`data-k="${a.id}"`}):''}</div>`}).join('')}</div>`:''}</div>`}).join('');
  if(v==='A')return head+pick+sum+`<div class="ach-list">${achOrder(ACH).map(a=>{const st=achSt(a);return `<div class="ach-a ${st}">${img(a.ic,'ach-ic')}<div class="grow"><b>${a.n}</b>${st==='done'?'<div class="small t-ok">已完成</div>':bar(a)}<div class="ach-rws">${achRw(a)}</div></div>${achBtn(a,st)}</div>`}).join('')}</div>`;
  // B：分類分頁（村莊／收成／鍛造），兩欄卡片
  if(v==='B'){const tab=ui.achTab||'v';return head+pick+sum+`<div class="subtabs ach-tabs">${Object.entries(ACH_G).map(([k,[n,ic]])=>{const r=ACH.filter(a=>a.g===k&&achSt(a)==='ready').length;return `<button class="ui-tab ${tab===k?'on':''}" data-act="achtab" data-k="${k}">${n}${r?`<i class="dot">${r}</i>`:''}</button>`}).join('')}</div>
    <div class="ach-grid">${achOrder(ACH.filter(a=>a.g===tab)).map(a=>{const st=achSt(a);return `<div class="ach-b ${st}"><div class="ach-b-top">${img(a.ic,'ach-ic')}<b>${a.n}</b></div>${st==='done'?'<div class="small t-ok center">已完成</div>':bar(a)}<div class="ach-rws center">${achRw(a)}</div>${achBtn(a,st,'ach-fullbtn')}</div>`}).join('')}</div>`}
  // C：里程碑路線（同一類成就串成一條路，下一個目標發亮）
  if(v==='C')return head+pick+sum+Object.entries(ACH_G).map(([k,[n,ic]])=>{const list=ACH.filter(a=>a.g===k);const cur=list.find(a=>achSt(a)!=='done');
    return `<div class="ui-panel panel ach-c">${ptitle(n)}<div class="ach-road">${list.map(a=>{const st=achSt(a);return `<div class="ach-node ${st} ${a===cur?'cur':''}"><div class="ach-dot">${st==='done'?img('ic_check'):img(a.ic)}</div><div class="grow"><b>${a.n}</b>${st==='done'?'':bar(a)}<div class="ach-rws">${achRw(a)}</div></div>${st==='todo'?'':achBtn(a,st)}</div>`}).join('')}</div></div>`}).join('');
  // D：獎勵為主（兩欄大獎勵圖，條件寫在下面）
  if(v==='D')return head+pick+sum+`<div class="ach-grid">${achOrder(ACH).map(a=>{const st=achSt(a),[k,n]=Object.entries(a.r)[0],more=Object.entries(a.r).slice(1);
    return `<div class="ach-d ${st}"><div class="ach-d-rw">${itemIco(k)}<b>×${n}</b>${more.length?`<span class="ach-d-more">${achRw({r:Object.fromEntries(more)})}</span>`:''}</div><div class="ach-d-name">${itemName(k)}</div><div class="small">${a.n}</div>${st==='done'?'<div class="small t-ok">已領取</div>':bar(a)}${achBtn(a,st,'ach-fullbtn')}</div>`}).join('')}</div>`;
}

/* ---------- 商城 ---------- */
// v4.59 商城（Mochi：只留免費月卡＋七日簽到＋材料，其餘正式上線再補）：材料可用金幣或鑽石買，單價 [金幣, 鑽石]，鑽石總價無條件進位
const MAT_COST={miron:[10,.5],pine:[10,.5],troll:[100,5],bifrost:[150,8],frost:[40,2],gwood:[40,2],ubone:[400,20],thor:[600,30]},MS_MAX=9999;
const matCost=(k,n)=>{const c=MAT_COST[k]||[0,0];return[c[0]*n,Math.ceil(c[1]*n)]};
// 點材料跳出購買小卡：數量用 −／＋ 和快捷鍵調整
function shopMatCard(k,live){const n=Math.max(1,Math.min(MS_MAX,ui.shopN|0||1)),[g,m]=matCost(k,n),qb=(v,t)=>`<button class="ui-btn ui-btn--chip chipbtn" data-act="shopN" data-k="${k}" data-v="${v}">${t}</button>`;
  ui.result={t:'info',k:'shopmat',ok:'關閉',ico:img(MATART[k]),title:MATS[k],html:`<div class="small muted center">持有 ${fmt(S.mats[k]|0)}・單價 ${fmt(MAT_COST[k][0])} 金幣或 ${MAT_COST[k][1]} 鑽石</div>
   <div class="ms-step">${qb(-10,'−10')}${qb(-1,'−')}<b class="ms-n">${fmt(n)}</b>${qb(1,'＋')}${qb(10,'+10')}</div>
   <div class="ms-quick">${[1,10,50,100].map(v=>`<button class="ui-btn ui-btn--chip chipbtn ${n===v?'on':''}" data-act="shopN" data-k="${k}" data-v="=${v}">×${v}</button>`).join('')}</div>
   <div class="ms-btns"><button class="ui-btn ui-btn--primary btn btn-primary ms-buy" data-act="buyMat" data-k="${k}" data-v="gold" ${S.gold<g?'disabled':''}>${img('it_gold')}${fmt(g)} 金幣</button><button class="ui-btn ui-btn--primary btn btn-primary ms-buy" data-act="buyMat" data-k="${k}" data-v="gems" ${S.gems<m?'disabled':''}>${img('it_gems')}${fmt(m)} 鑽石</button></div>`};
  const body=live&&document.querySelector('.modal-card .info-body');if(body&&body.querySelector('.ms-step')){body.innerHTML=ui.result.html;renderRes()}else render()}   // v4.63 調數量、購買只換小卡內容，不整張重新跳出
function shopBuyMat(k,cur,n){if(!MATS[k])return;n=Math.max(1,Math.min(MS_MAX,n|0||1));const [g,m]=matCost(k,n);
  if(cur==='gems'){if(!spendGems(m))return}else{if(S.gold<g)return toast('金幣不夠','bad');S.gold-=g}
  S.mats[k]=(S.mats[k]|0)+n;snd('coin');toast(`購買 ${MATS[k]} ×${n}`,'ok');save();if(ui.result&&ui.result.k==='shopmat')shopMatCard(k,true);else render()}
// v4.44 屬性說明：三個等級（倍率、機率）、相剋、哪些關卡的弱點是這個屬性
function affInfo(k){const x=ELEM[k];if(!x)return{title:'附魔',html:''};const pr=ELEM_PAIR.find(p=>p.includes(k)),opp=ELEM_OPP[k],vs=VILLAGES.map((v,i)=>i).filter(i=>vWeak(i)===k),vr=VILLAGES.map((v,i)=>i).filter(i=>vRes(i)===k);
  return{title:x.n,html:`${[1,2,3].map(t=>`<div class="kv"><span>${['','一','二','三'][t]}級・${x.tn[t-1]}</span><b>弱點 +${Math.round((ELEM_MULT[t]-1)*100)}%・同屬性 −${Math.round((1-ELEM_RES[t])*100)}%</b></div>`).join('')}
   <br>${x.n}⇄${ELEM[opp].n}：${pr[2]}。屬性是${ELEM[opp].n}的怪物，弱點就是${x.n}；屬性是${x.n}的怪物對${x.n}有抗性。<br><br>${vs.length?`弱點是${x.n}的關卡（加傷害）：${vs.map(i=>vNo(i)+' '+MONS[i]).join('、')}`:'目前開放的關卡沒有怪物弱點是'+x.n+'，之後的界會出現。'}${vr.length?`<br>對${x.n}有抗性的關卡（扣傷害）：${vr.map(i=>vNo(i)+' '+MONS[i]).join('、')}`:''}
   <br><br><span class="small muted">屬性不會加攻擊力：打到怕這個屬性的怪物傷害變高，打到同屬性的怪物傷害變低，其他怪物正常傷害。</span>`}}   // v4.74 Mochi：機率在附魔表已經有，這裡不再顯示
const r1=x=>Math.round(x*10)/10;
function effRows(w,mine){const e=elemOf(w);   // v4.44 武器詳情的附魔欄：只顯示屬性附魔（1 欄）
  return `<div class="eff-h"><b>屬性附魔</b><span class="small muted">花金幣隨機・可以重抽</span></div>
   ${e?`<button class="eff-row" data-act="affinfo" data-k="${e.k}"><span class="grow"><b class="elc-${e.k}">${e.tn}</b><span class="small muted">打中弱點傷害 +${Math.round((e.m-1)*100)}%</span></span><em>ⓘ</em></button>`
     :`<div class="small muted">${mine?'無屬性。按「附魔」隨機獲得火、冰、雷、毒、聖、暗其中一種屬性。':'無屬性'}</div>`}`}
const INFO={
  sign:()=>({icon:'ic_check',title:'七日簽到',html:'每天可以簽到一次，漏簽不會歸零；第 7 天領完後從第 1 天重新開始。<br><br>每天第一次進遊戲會自動打開商城的簽到。'}),
  monthly:()=>({icon:'it_monthly',title:'北境月卡（免費）',html:'領取後立即獲得 300 鑽石，30 天內每天可以領 50 鑽石。<br><br>封測期間免費。'}),
};
function viewShop(){
  const on=monthlyOn(),days=Math.ceil((S.monthly.until-NOW())/864e5);
  const info=k=>`<button class="ui-iconbtn info-btn" data-act="info" data-k="${k}" aria-label="說明">${ic('info')}</button>`;
  const card=(ic,name,sub,price,act,attrs,ik,dis)=>`<div class="ui-card pcard">${info(ik)}${img(ic,'pc-ico')}<b>${name}</b><span class="small muted">${sub}</span><button class="ui-btn ui-btn--secondary btn btn-sec sm pc-buy" data-act="${act}" ${attrs} ${dis?'disabled':''}>${price}</button></div>`;
  return `<div class="pagehead"><h2>商城</h2></div>
  ${BETA?'':`<div class="ui-panel panel">\${ptitle('鑽石（試玩版不扣款）')}<div class="gems3">\${[[60,'NT$30'],[330,'NT$150'],[1280,'NT$590']].map(([g,p])=>\`<button class="ui-card gemcard" data-act="topup" data-n="\${g}">\${img('it_gems')}<b>\${g} 鑽</b><span class="price">\${p}</span></button>\`).join('')}</div></div>`}
  <div class="ui-panel panel month ${on?'on':''}">${info('monthly')}<div class="item">${img('it_monthly')}<div class="grow"><b>北境月卡<span class="nobr">（免費）</span></b><div class="small muted">${on?`剩餘 ${days} 天`:'<span class="nobr">立得 300 鑽</span><span class="nobr">＋每天 50 鑽</span>'}</div></div>
   ${on?btn(S.monthly.last===today()?'今日已領':'領 50 鑽<i class="dot give-dot"></i>','claim',{cls:'btn-primary sm',dis:S.monthly.last===today()}):btn(BETA?'免費領取<i class="dot give-dot"></i>':'NT$150','monthly',{cls:'btn-primary sm'})}</div></div>
  <div class="ui-panel panel sg-panel">${info('sign')}${ptitle('七日簽到')}${viewSign()}</div>
  <div class="ui-panel panel">${ptitle('材料')}<div class="matgrid">${MAT_DEF.map(([k])=>`<button class="matbox mb-tap ms-box" data-act="shopmat" data-k="${k}">${img(MATART[k])}<span class="mb-n">${MATS[k]}</span><span class="ms-p">${img('it_gold')}${fmtS(MAT_COST[k][0])}</span></button>`).join('')}</div>
   <div class="small muted center ms-tip">點材料選數量，用金幣或鑽石購買</div></div>
`;
}
// v4.62 開發者工具「依版本」分頁（Mochi）：新版本一律加在最上面，一個版本一段。
// v＝版本、t＝這版改了什麼（一句話）、b＝[按鈕代碼, 按鈕文字]；按鈕代碼就是 devdo(k) 的 k，文字可以是函式（會變的狀態）
const DEV_LOG=[
 {v:'4.81',t:'已是三級屬性時重抽要再按一次確認',b:[['ench81','給 1 把三級火屬性測試劍＋附魔石，打開附魔（第一次按會變紅色確認鍵）']]},
 {v:'4.80',t:'屬性加成 +3／6／10%、同屬性 −3／6／10%',b:[['res77','給 1-9 用的三級冰／火屬性武器（應 ×1.1／×0.9）、打開附魔表'],['res77i','開火屬性說明小卡（+3%～10%）']]},
 {v:'4.79',t:'型態相剋加成遞增（+12 為 21%）',b:[['race79','列出 +0～+12 相剋加成，並打開 +9 測試劍小卡（相剋應為 12%、下一級 15%）']]},
 {v:'4.78',t:'飛行改亡靈：錘剋亡靈、弓剋巨型',b:[['race78','列出 7 種武器剋的型態＋20 關型態，並打開 1-5 村莊詳情']]},
 {v:'4.76',t:'屬性名稱統一「火屬性」三個字、說明小卡拿掉大方塊',b:[['elpop','給 1 把雷屬性三級測試劍，打開附魔＋雷屬性說明'],['elall','給 6 把不同屬性的武器（去村莊看弱點）']]},
 {v:'4.73',t:'秒殺榜：20 關記最快秒數、全服前 50 名，王關首殺／刷新第 1 名上跑馬燈',b:[['fkfake','秒殺榜塞 20 筆假資料（含我）並打開'],['fkann','跑馬燈：王關首殺＋刷新紀錄各一則'],['fkwin','用 +12 最強武器挑戰最後一座開放的村莊（看結算的秒殺紀錄）'],['fkclr','清掉假資料和我的秒殺紀錄']]},
 {v:'4.72',t:'武器圖鑑：登錄武器（武器會消失）換全帳號攻擊力 %，每把 3 格＋6 個套裝',b:[['cxgive','17 種武器各給 +0／+6／+9 一把，打開圖鑑'],['cxmost','圖鑑登錄到快滿（每把留 +9 沒登），看套裝'],['cxreset','清空圖鑑']]},
 {v:'4.71',t:'60 秒挑戰評級 SS～C，評級連動掛機收益；怪物血量改成 +6 剛好 A、每關 +2.5%',b:[['grsim','評級模擬表（每關 +6 打 30 場的評級、各評級要強化到幾級）'],['grre','用 +8 一般武器重新挑戰第一座已收復村莊（看 S 和補發）'],['grcyc','第一座已收復村莊的評級 SS→S→A→B→C 輪換（看卡片和收益倍率）']]},
 {v:'4.70',t:'村莊詳情掉落全部改成格子',b:[['dropbox7','打開 1-7 詳情（有怪物武器）'],['dropbox20','打開 2-10 詳情（有 Boss 武器）']]},
 {v:'4.69',t:'1-6 以後每隻金幣調高（B 溫和）',b:[['goldtab','列出 1-1～2-10 每隻金幣範圍和平均時薪']]},
 {v:'4.67',t:'附魔小卡：結果顯示在武器名稱、列出 18 種機率',b:[['ec18','打開附魔小卡（名稱前面是雷神之怒，18 格裡那格有框）'],['affopen','屬性附魔機率：模擬 6000 次']]},
 {v:'4.66',t:'打怪直接掉武器、1-1～1-5 金幣範圍',b:[['wdropsim','模擬 1-1／1-7／1-10／2-10 各打倒 10,000 隻，看掉幾把武器和金幣'],['wdrop1','1-1 駐守中的村莊塞 3 把掉落武器（按收成看）']]},
 {v:'4.65',t:'強化石掉落機率減半（全部村莊都掉）',b:[['stonedrop','模擬 1-1／1-10／2-10 各打倒 1000 隻，看掉幾顆強化石']]},
 {v:'4.64',t:'+7 起武器光暈用外框顏色、拿掉升階大字；拿掉安全區失敗和防爆按鈕',b:[['fxt_7','強化 +7（藍，看有沒有黃光）'],['fxt_10','強化 +10（金）'],['fx_green','+1～+6 綠光']]},
 {v:'4.63',t:'商城購買小卡：調數量、購買不再重新跳出',b:[['shopcard','打開松林硬木購買小卡（給 5,000 金幣）']]},
 {v:'4.61',t:'強化特效：石碑不動、金／鑽石閃電、燈光同色、失敗與爆裝新特效',b:[['fx_ok','危險區・成功'],['fx_fail','危險區・失敗'],['fx_broke','危險區・爆裝'],['fxt_10','升階 +10（金閃電）'],['fxt_12','升階 +12（鑽石閃電）']]},
 {v:'4.60',t:'同款武器疊一格・一鍵安定值連按',b:[['wstack','產生同款武器（6 把 +0、3 把 +3、2 把附魔）並打開道具欄']]},
 {v:'4.59',t:'商城整理：七日簽到搬進商城、材料可以買、拿掉狩獵號角',b:[['shopsg','簽到可再領並打開商城'],['sg_d7','簽到：跳到第 7 天'],['sg_reset','簽到：今天可再領'],['shopbroke','金幣鑽石歸零（看買不起）']]},
 {v:'4.58',t:'強化特效：綠光、外框色石碑、閃電、黑煙爆裝、強化小卡',b:[['autoenh','一鍵強化到安定值（每級綠光連續演出）'],['fxt_7','升階 +7（藍）'],['fxt_8','+8（藍、不升階）'],['fxt_9','升階 +9（紅）'],['fxt_10','升階 +10（金）'],['fxt_11','升階 +11（紫）'],['fxt_12','升階 +12（鑽石）'],['fx_broke','爆裝（黑煙）'],['fx_green','+1～+6 綠光']]},
 {v:'4.57',t:'新手導覽重做（22 步：伐木斧 → 挑戰 1-1 → 收成 → 強化 → 附魔 → 月卡 → 任務）',b:[['tutnew','用新存檔從頭跑導覽（會清空目前進度）'],['tutch','跳到導覽「挑戰 1-1」那一步（給伐木斧）'],['tutrestart','保留存檔，從第 1 步重看'],['tutnext','導覽跳下一步']]},
 {v:'4.56',t:'交易所可以賣道具（單價＋數量、買家可買一部分）',b:[['mkisell','上架道具（補 50 顆強化石）'],['mkisim','假裝有人買走我上架的道具一半（離線模擬）'],['mkopen','開啟交易所']]},
 {v:'4.54',t:'8 種新材料、附魔石、英靈・遺物掉落',b:[['matall','材料各 +100、附魔石 +20'],['dropsim','打倒 1000 隻的掉落'],['relicsim','遺物掉落機率＋開箱 1000 次統計'],['relic5','四種英靈・遺物各 +5'],['relic0','英靈・遺物全部歸零'],['relicbag','打開道具欄'],['relicinfo','點英靈・遺物看說明']]},
 {v:'4.53',t:'交易所商品詳情改用武器小卡',b:[['mkcard','商品詳情新版（+7 冰封武器）']]},
 {v:'4.52',t:'60 秒限時挑戰村莊，收復後照擊殺掛機',b:[['chwin','給最強武器 +12 直接挑戰下一關（看贏）'],['chlose','用開局劍 +0 挑戰下一關（看輸）'],['chsim','限時挑戰模擬表（每關 +0／+6／+7／+8 勝率）']]},
 {v:'4.51',t:'17 把新武器（開局 7 把＋第一、二界圖紙）',b:[['nw17','給 17 把新武器（各 1 把 +0）'],['nwtab','新武器數值與村莊需求表']]},
 {v:'4.50',t:'強化石：每次 1 顆、最高 +12',b:[['stone50','強化石 +50'],['stone0','強化石歸零'],['stonereal','給一把真的 +6 劍，開強化頁（真的會爆）'],['stonedrop','模擬 1-1／1-10／2-10 各打 1000 隻掉幾顆強化石'],['odds','強化機率表']]},
 {v:'4.46',t:'新武器系統：武器小卡、攻速、附加效果、怪物形態相剋',b:[['wpntest','七類各一把 +6，看攻速／單擊／附加效果／相剋']]},
 {v:'4.45',t:'屬性附魔與怪物弱點',b:[['elall','給 6 把不同屬性的武器（看弱點提示）'],['elforce','下一次附魔必定三級'],['affopen','屬性附魔機率：模擬 6000 次'],['godreq','海姆達爾弱點暗屬性：給暗屬性／聖屬性長戟各 1 把'],['storyreq','給打中 1-9／2-6／2-10 弱點的武器']]},
 {v:'4.39',t:'村莊卡片箭頭展開戰鬥畫面＋掉落＋已打到',b:[['gwbstgl','展開 1-2 的戰鬥畫面和掉落']]},
 {v:'4.38',t:'駐守村莊點武器跳小卡（收回／換武器）',b:[['gwvpick','駐守村莊點武器的小卡']]},
 {v:'4.35',t:'戰鬥背景取景',b:[['bsbg','依序打開背景有怪物的關卡']]},
 {v:'4.34',t:'武器框顏色看強化等級',b:[['flvtest','產生 +0～+12 九把，看框的顏色']]},
 {v:'4.32',t:'卡片小怪物打法統一、怪物不再被切到',b:[['bsthumb','7 種武器各駐守 1-1～1-7、收起戰鬥畫面、附加效果必定觸發'],['bsmon','依序展開每隻全身怪物（看有沒有被切到）']]},
 {v:'4.26',t:'第一、二界故事串成主線（1-8／2-9 對調、2-10 索爾）',b:[['gwstory','看 1-8、2-9、2-10 新故事（開村莊詳情）']]},
 {v:'4.20',t:'村莊卡片戰鬥條',b:[['bsall','7 種武器各駐守 1-1～1-7'],['bs11','1-1 換下一種武器'],['bsproc',()=>`附加效果必定觸發：${ui.bsProc?'開':'關'}`]]},
 {v:'4.19',t:'改名諸神鐵匠＋新開場故事與登入封面',b:[['gtstory','播放開場故事'],['gtlogin','顯示登入畫面'],['gtreset','重設「已看過開場」']]},
 {v:'4.18',t:'封測暫停公告',b:[['maintprev',()=>`預覽維護公告畫面（目前 MAINT=${MAINT}）`]]},
 {v:'4.12',t:'怪物大圖改到村莊詳情',b:[['mondex','打開下一個挑戰的村莊詳情']]},
 {v:'4.08',t:'交易所「待領取」：賣出／過期按全部領取才入帳',b:[['mkclaimt','待領取測試（2 賣出＋1 退回）'],['mksettle','立即結算我的成交／過期']]},
 {v:'4.04',t:'北歐神話怪物與傳說',b:[['monlore','依序打開村莊詳情看傳說']]},
 {v:'4.03',t:'遊戲內公告與玩法說明（右上角齒輪）',b:[['nw_open','打開齒輪設定'],['nw_new1','模擬新版本：最新一則變 NEW'],['nw_all','全部公告和玩法變 NEW'],['nw_seen','全部標成已讀']]},
 {v:'4.01',t:'村莊怪物血條：打中才扣血',b:[['monhp','怪物血條：本輪剩 10 秒'],['tmon','3 秒後擊倒一隻']]},
 {v:'3.98',t:'好友＋公會',b:[['gdopen','打開公會'],['gdnone','模擬：還沒加入公會'],['gdlead','模擬：我是會長（有入會申請）'],['gdmem','模擬：我是一般成員'],['gdlv5','模擬：公會升到 Lv.5'],['gdchat','打開公會聊天'],['fropen','打開好友（有 2 個申請）']]},
 {v:'3.95',t:'另一界可收成時地圖列亮紅點',b:[['rdot1','米德加德 1-1 可收成，切到約頓海姆看'],['rdot2','約頓海姆 2-1 可收成，切到米德加德看']]},
 {v:'3.89',t:'聊天武器卡、稱號、恭喜',b:[['chwcard','模擬別人貼一張武器卡'],['chtitle','解鎖本機 4 個稱號'],['chtitle0','卸下稱號'],['chcheer','模擬收到 3 位鐵匠恭喜'],['chsys','打開系統頻道（按恭喜）']]},
 {v:'3.88',t:'世界聊天＋玩家名片',b:[['chopen','打開聊天視窗'],['chnew','模擬收到 3 則新訊息'],['chlong','模擬一則 60 字長訊息'],['chcd','模擬發言冷卻 5 秒'],['chbar',()=>'底部聊天條：'+(S.chatBar===false?'目前隱藏':'目前顯示')],['pcme','看自己的名片'],['pcother','看別人的名片（模擬）'],['chunblk',()=>'清空封鎖名單（'+chatBlk().length+' 人）'],['chfilter','測試輸入檢查（網址、電話、字數）']]},
 {v:'3.76',t:'第二界約頓海姆',b:[['r2open','開放第二界（收復 1-1～1-10）'],['r2all','第二界全部收復'],['r2lock','第二界改回未開放']]},
 {v:'3.74',t:'每日任務、跑馬燈',b:[['qopen','打開任務視窗'],['dq_all','每日任務全部達成'],['dq_reset','每日任務換日重置'],['news_ok','跑馬燈：模擬 +12 成功'],['news_brk','跑馬燈：模擬 +11 爆裝']]},
 {v:'3.64',t:'紅點提醒',b:[['uidot_st','目前哪些紅點會亮'],['uidot_w','道具欄：最新一把標 NEW'],['uidot_bp','鐵匠鋪：最新圖紙標 NEW'],['uidot_mk','交易所：模擬有成交'],['uidot_mon','商城：月卡今天可領']]},
 {v:'3.41',t:'交易所（未登入時是離線模擬）',b:[['mksold','模擬：我最新的上架被買走'],['mkexp','模擬：我的上架全部過期'],['mkreset','重設模擬市場']]},
 {v:'3.38',t:'註冊後取暱稱',b:[['cnameprev','預覽取名流程（輸入「冰脊」看重複提示）']]},
];
const DEV_NEW=8;   // 前 8 個版本直接展開，更早的收在「更早的版本」
const DEV_TABS=[['ver','依版本'],['res','資源・武器'],['prog','時間・村莊'],['enh','強化動畫'],['test','自動測試'],['save','存檔'],['ui','UI 元件']];
function devVer(B){const g=(x,i)=>`<div class="dv-h"><b>v${x.v}</b>${x.v===BUILD_ID?'<span class="dv-now">本版</span>':i===0?'<span class="dv-now">最新</span>':''}<span class="grow">${x.t}</span></div><div class="devgrid">${x.b.map(([k,t,c])=>B(k,typeof t==='function'?t():t,c)).join('')}</div>${ui.testOut&&x.b.some(y=>y[0]===ui.devLast)?`<div class="test-out">${ui.testOut}</div>`:''}`;
  const old=DEV_LOG.length-DEV_NEW;
  return `<div class="small muted">新的版本在最上面；每段是那一版改的東西和可以測的按鈕。一般工具（金幣、時間、存檔…）在其他分頁。</div>`+DEV_LOG.slice(0,DEV_NEW).map(g).join('')
   +(old>0?`<button class="ui-btn ui-btn--secondary btn btn-sec sm dv-more" data-act="devset" data-k="devOld" data-v="${ui.devOld?0:1}">${ui.devOld?'收起更早的版本':'展開更早的版本（'+old+' 個）'}</button>`+(ui.devOld?DEV_LOG.slice(DEV_NEW).map((x,i)=>g(x,i+DEV_NEW)).join(''):''):'')}
function sheetDev(){
  const B=(k,t,c='btn-sec')=>`<button class="ui-btn ui-btn--${btnVariant(c)} btn ${c} sm" data-act="devdo" data-k="${k}">${t}</button>`,tab=DEV_TABS.some(x=>x[0]===ui.devTab)?ui.devTab:'ver';
  const body={
   ver:tab==='ver'?devVer(B):'',
   res:`<div class="label">貨幣</div><div class="devgrid">${B('gold','金幣 +5,000')}${B('gems','鑽石 +1,000')}${B('r2mats','金幣 +20 萬')}</div>
     <div class="label">道具</div><div class="devgrid">${B('matall','材料各 +100、附魔石 +20')}${B('stone50','強化石 +50')}${B('stone0','強化石歸零')}${B('relic5','四種英靈・遺物各 +5')}</div>
     <div class="label">測試武器（不扣資源、不能交付村莊）</div>
     <div class="small muted">強化等級</div><div class="row">${[[-1,'輪替'],[0,'+0'],[6,'+6'],[7,'+7'],[10,'+10'],[12,'+12']].map(([v,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devAllLv??-1)===v?'on':''}" data-act="devset" data-k="devAllLv" data-v="${v}">${n}</button>`).join('')}</div>
     <div class="devgrid">${B('allw','產生全部 '+BPS.length+' 把測試圖紙武器','btn-primary')}${B('cleartest','清除所有測試武器')}${B('nw17','給 17 把新武器（各 1 把 +0）')}${B('w6','+6 測試劍（剛好到安定值）')}${B('fill','道具欄塞到 195 把')}</div>`,
   prog:`<div class="label">時間流速（正式版 1×）</div><div class="row">${[1,10,30,60].map(n=>`<button class="ui-btn ui-btn--chip chipbtn ${S.speed===n?'on':''}" data-act="speed" data-k="${n}">${n}×</button>`).join('')}</div>
     <div class="label">離線累積上限</div><div class="row">${[1,OFFLINE_H].map(n=>`<button class="ui-btn ui-btn--chip chipbtn ${S.capH===n?'on':''}" data-act="cap" data-k="${n}">${n} 小時</button>`).join('')}</div>
     <div class="label">村莊與鍛造</div><div class="devgrid">${B('offline',`模擬離線 ${OFFLINE_H} 小時`)}${B('unlock','解鎖全部村莊與圖紙')}${B('forge','鍛造立即完成')}${B('f5','鍛造 5 秒測試（最高階可打的圖紙）')}${B('tlack','缺料鍛造提示（獵弓）')}${B('tbprev','點圖紙自動捲到詳情')}${B('achall','達成全部成就條件')}${B('daily','重置月卡今日領取')}${B('tipreset','重設各系統第一次說明')}</div>
     <div class="label">時間防作弊</div><div class="devgrid">${B('back','裝置時間倒退 1 小時')}${B('fwd','裝置時間恢復')}</div>`,
   enh:`<div class="label">1. 送出測試武器（標示「測試」，強化不扣資源、不能交付村莊）</div>
     <div class="row">${['鐵製','霜銀','龍鱗','神器'].map((n,t)=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devTier??0)===t?'on':''}" data-act="devset" data-k="devTier" data-v="${t}">${n}</button>`).join('')}</div>
     <div class="row">${[0,3,5,6,9,12,14].map(l=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devLv??0)===l?'on':''}" data-act="devset" data-k="devLv" data-v="${l}">+${l}</button>`).join('')}</div>
     <div class="devgrid">${B('testw','送出並開啟強化頁','btn-primary')}${B('cleartest','清除所有測試武器')}</div>
     <div class="devgrid">${B('autoenh','一鍵強化到安定值（新增 +0 測試錘並執行）')}</div>
     <div class="label">音效試聽（目前正式音效）</div><div class="row" style="flex-wrap:wrap;gap:6px">${Object.keys(SFXV).map(n=>`<button class="ui-btn ui-btn--chip chipbtn" data-act="sndtest" data-k="${n}">${SFX_NAME[n]||n}</button>`).join('')}<button class="ui-btn ui-btn--chip chipbtn" data-act="sndtest" data-k="_spokes">8 道符文連續</button></div>
     <div class="label">切回遊戲音效（v3.92）：目前狀態 ${ACX?ACX.state:'尚未啟動'}${ACX_DIRTY?'（待重建）':''}，已建立 ${ACX_N} 次，iOS 音訊模式 ${navigator.audioSession?navigator.audioSession.type:'不支援'}</div><div class="row" style="flex-wrap:wrap;gap:6px"><button class="ui-btn ui-btn--chip chipbtn" data-act="devdo" data-k="sfxbg">模擬切到背景再回來</button><button class="ui-btn ui-btn--chip chipbtn" data-act="devdo" data-k="sfxstall">模擬卡住（假 running）</button><button class="ui-btn ui-btn--chip chipbtn" data-act="sndtest" data-k="coin">試播金幣聲</button><button class="ui-btn ui-btn--chip chipbtn" data-act="devsets" data-k="sfxlog" data-v="1">更新紀錄</button></div>
     <div class="small muted" style="white-space:pre-wrap;max-height:160px;overflow:auto">${SFX_LOG.slice().reverse().join('\n')||'（還沒有紀錄）'}</div>
     ${SFX_VAR_KEYS.length?`<div class="label">音效試用（v3.32，只是試聽，選定後再正式換）</div><div class="sfxalt">${SFX_VAR_KEYS.map(n=>`<div class="sfxalt-r"><span>${SFX_NO[n]}. ${SFX_NAME[n]}</span>${SFX_VARS[n].map(v=>`<button class="ui-btn ui-btn--chip chipbtn ${(SFX_VARS[n].includes(SFX_ALT[n])?SFX_ALT[n]||'':'')===v?'on':''}" data-act="sfxalt" data-k="${n}" data-v="${v}">${v||'原'}</button>`).join('')}</div>`).join('')}</div>
     <div class="devgrid">${B('sfxaltclr','全部切回原版')}</div>`:''}
     <div class="label">2. 指定下一次強化結果（只對測試武器有效）</div>
     <div class="row">${[['ok','成功'],['fail','普通失敗'],['break','爆裝'],['','不指定']].map(([k,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(DEV.force||'')===k?'on':''}" data-act="devforce" data-k="${k}">${n}</button>`).join('')}</div>
     <div class="small muted">目前：${DEV.force?{ok:'成功',fail:'普通失敗',break:'爆裝'}[DEV.force]:'不指定（照正常機率）'}</div>
     <div class="label">3. 只播放強化動畫（不做任何判定）</div><div class="small muted">爆裝／失敗時停在第幾道符文</div><div class="row">${[[-1,'隨機'],[0,'第 1 道'],[2,'第 3 道'],[4,'第 5 道'],[6,'第 7 道']].map(([v,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devStop??-1)===v?'on':''}" data-act="devset" data-k="devStop" data-v="${v}">${n}</button>`).join('')}</div><div class="small muted">武器類型</div><div class="row">${Object.entries({axe:'斧',sword:'劍',spear:'長矛',bow:'弓'}).map(([k,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devFxW||'axe')===k?'on':''}" data-act="devsets" data-k="devFxW" data-v="${k}">${n}</button>`).join('')}</div><div class="small muted">安定區 +1～+6（一定成功，不播動畫）</div><div class="devgrid">${B('fx_green','綠光')}</div>
     <div class="small muted">危險區（約 2.8 秒）</div><div class="devgrid">${B('fx_ok','危險區・成功')}${B('fx_fail','危險區・失敗')}${B('fx_broke','危險區・爆裝')}</div>`,
   test:`<div class="devgrid">${B('tsec','安全設定檢查（v3.65）','btn-primary')}${B('tquick','執行快速測試')}${B('odds','強化機率表')}${B('curve','難度曲線：每關需求')}${B('tecon','執行 30 天經濟模擬')}${B('ticon','檢查 App icon')}</div>${ui.testOut?`<div class="test-out">${ui.testOut}</div>`:''}`,
   ui:tab==='ui'?uiGallery():'',
   save:`<div class="label">雲端存檔</div><div class="small" style="margin-bottom:6px">${AUTH?`帳號：${AUTH.user.email}<br>狀態：${CLOUD.busy?'同步中…':CLOUD.err?'⚠ '+CLOUD.err:CLOUD.last?'已同步 '+new Date(CLOUD.last).toLocaleTimeString():'尚未同步'}${CLOUD.dirty?'（有未上傳的變更）':''}`:'目前是訪客（只存在這支手機）'}</div>
     <div class="devgrid">${AUTH?B('cpush','立即上傳到雲端')+B('cpull','從雲端下載（覆蓋本機）')+B('clogout','登出')+B('cname','開啟取名畫面'):B('gtlogin','開啟登入畫面')}</div>
     <div class="devgrid">${B('v2','載入 v2 測試存檔（遷移）')}${B('reset',ui.confirmReset?'再按一次確認重置':'重置存檔','btn-danger')}</div>
     <div class="label">開發者模式</div><div class="devgrid"><button class="ui-btn ui-btn--secondary btn btn-sec sm" data-act="devoff">關閉開發者模式</button></div><div class="small muted">再次開啟：連點左上角鐵匠徽章 20 下（正式網站只限管理員帳號）。</div>`}[tab];
  return `<div class="sheet-head"><span style="width:44px"></span><h2>開發工具</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img'})}</div>
  <div class="devtabs">${DEV_TABS.map(([k,n])=>`<button class="ui-tab ${tab===k?'on':''}" data-act="devtab" data-k="${k}">${n}</button>`).join('')}</div><div class="dev">${body}</div>`;
}


function devdo(k){if(k.startsWith('gd')||k==='fropen'){ui.sheet=null;   // v3.98 好友＋公會測試
    const mk=['gdnone','gdlead','gdmem','gdlv5'].includes(k);if(mk&&!chatMock()){ui.sheet={t:'d'};render();return toast('模擬按鈕只在本機未登入時可用','bad')}
    if(mk){if(k!=='gdlv5')GD.mock=null;gdMockInit();const m=GD.mock;if(k==='gdnone'){m.g=null;m.me.cd=null}else{m.g=m.g||{id:1,name:'霜狼鍛造會',emb:'霜',notice:'每週日晚上一起衝首領，記得捐獻！',join:'open',exp:3860};m.role=k==='gdlead'?'lead':'mem';if(k==='gdlead')m.mem.forEach(x=>{if(x.role==='lead')x.role='mem'});else if(!m.mem.some(x=>x.role==='lead'))m.mem[0].role='lead';if(k==='gdlv5')m.g.exp=Math.max(m.g.exp,GD_LV[4])}GD.mk=false;GD.edit=false;GD.tab='mem';return gdOpen()}
    if(k==='gdopen')return gdOpen();if(k==='gdchat'){if(chatMock())chatMockInit();return chatOpenSheet('g')}if(k==='fropen'){FR.tab='in';return frOpen()}
    if(k==='gdbonus'){const o=S.gd,i=S.villages.findIndex(v=>v.status==='cleared'&&v.weaponId!=null),w=i>=0?W(S.villages[i].weaponId):S.weapons.find(x=>!x.test),b=evtNow().boss;const res=[];
      const chk=(n,ok)=>res.push((ok?'✓ ':'✗ ')+n);
      S.gd=null;const g0=i>=0?gph(i,w):0,d0=w?bossDmgOf(w,b):0;S.gd={id:1,name:'測試',lv:10,gold:8,boss:8};const g1=i>=0?gph(i,w):0,d1=w?bossDmgOf(w,b):0;S.gd=o;
      chk(`等級表：Lv.1～10 金幣 ${GD_GOLD.join('/')}，首領 ${GD_BOSS.join('/')}`,gdLvOf(0)===1&&gdLvOf(999)===1&&gdLvOf(1000)===2&&gdLvOf(70000)===10&&gdCap(4)===20&&gdCap(5)===30&&gdCap(8)===40);
      chk(i>=0?`狩獵金幣：每小時 ${fmt(g0)} → ${fmt(g1)}（+8%）`:'狩獵金幣：沒有駐守中的村莊，略過',i<0||Math.abs(g1/Math.max(1,g0)-(1+(tal('gold')+8)/100)/(1+tal('gold')/100))<.02);
      chk(w?`首領傷害：每小時 ${fmt(d0)} → ${fmt(d1)}（+8%）`:'首領傷害：沒有武器，略過',!w||Math.abs(d1-Math.round(d0*1.08))<=2);
      chk(`目前公會：${gdIn()?esc(S.gd.name)+'（Lv.'+S.gd.lv+'，金幣 +'+gdGold()+'%、首領 +'+gdBoss()+'%）':'沒有加入'}`,true);
      ui.result={t:'info',title:'公會加成檢查',html:`<div class="small" style="text-align:left;line-height:1.8">${res.join('<br>')}</div>`};ui.sheet={t:'d'};return render()}}
  if(k.startsWith('ch')||k.startsWith('pc')){ui.sheet=null;   // v3.88 聊天測試
    if(chatMock())chatMockInit();
    if(k==='chopen')return chatOpenSheet('w');if(k==='chsys')return chatOpenSheet('s');
    if(k==='chnew'){const t=new Date().toISOString();chatAdd([0,1,2].map(i=>({id:CHAT.last+1+i,uid:'mock-'+i,nick:['雷霆之錘','冰原少女','霜狼'][i],lv:[18,9,22][i],body:['測試訊息 A：有人在嗎？','測試訊息 B：剛剛爆了一把…','測試訊息 C：恭喜恭喜'][i],mine:false,at:t})));CHAT.unread=Math.min(99,CHAT.unread+3);render();return toast('底部聊天條應該出現紅色 3','ok')}
    if(k==='chlong'){chatAdd([{id:CHAT.last+1,uid:'mock-3',nick:'渡鴉',lv:25,body:'這是一則六十個字的長訊息測試，用來看聊天視窗和底部聊天條會不會被撐破，文字應該要正常換行，聊天條則是用刪節號收尾，不能超出畫面。'.slice(0,CHAT_MAX),mine:false,at:new Date().toISOString()}]);return chatOpenSheet('w')}
    if(k==='chcd'){CHAT.cd=Date.now()+CHAT_CD;return chatOpenSheet('w')}
    if(k==='chbar'){S.chatBar=S.chatBar===false;save();ui.sheet={t:'d'};render();return toast('底部聊天條：'+(S.chatBar===false?'隱藏':'顯示'))}
    if(k==='pcme'){render();return pcOpen('me',S.nick||'我')}
    if(k==='pcother'){render();return pcOpen('mock-2','霜狼',chatOn()?null:3)}
    if(k==='chwcard'){chatAdd([{id:CHAT.last+1,uid:'mock-1',nick:'冰原少女',lv:9,body:'剛打出來的，大家看看',mine:false,at:new Date().toISOString(),title:'guard',w:{b:'dev_hammer',q:4,lv:11,rf:0,traits:[],ench:[]}}]);return chatOpenSheet('w')}
    if(k==='chtitle'){S.stats.maxLv=Math.max(12,S.stats.maxLv);S.stats.forged[4]=Math.max(1,S.stats.forged[4]||0);S.villages.forEach((v,i)=>{if(i<=10)v.status='cleared'});if(S.villages[11]&&S.villages[11].status==='locked')S.villages[11].status='open';save();render();return pcOpen('me',S.nick||'我')}
    if(k==='chtitle0'){S.title=null;save();ui.sheet={t:'d'};render();return toast('已卸下稱號')}
    if(k==='chcheer'){cheerShow([{id:(S.cheerLast||0)+1,news_id:-1,from_nick:'霜狼',bp:'dev_sword',lv:12},{id:(S.cheerLast||0)+2,news_id:-1,from_nick:'渡鴉',bp:'dev_sword',lv:12},{id:(S.cheerLast||0)+3,news_id:-1,from_nick:'雷霆之錘',bp:'dev_sword',lv:12}]);ui.sheet={t:'d'};return render()}
    if(k==='chunblk'){S.cbl=[];save();ui.sheet={t:'d'};render();return toast('封鎖名單已清空','ok')}
    if(k==='chfilter'){const cs=[['大家好',''],['https://abc.com',1],['加我 line id abc',1],['0912 345 678',1],['12345678',1],['   ',1],['字'.repeat(61),1],['字'.repeat(60),'']];
      const bad=cs.filter(([t,e])=>!!chatPre(t)!==!!e);ui.sheet={t:'d'};render();return toast(bad.length?'失敗：'+bad.map(x=>esc(x[0].slice(0,10))).join('、'):'輸入檢查 8 項全部通過',bad.length?'bad':'ok')}
    ui.sheet={t:'d'}}
if(k==='sfxstall'){if(ACX)ACX_CK={t:performance.now()-5000,ct:ACX.currentTime+99};sfxLog('模擬卡住');toast('已模擬音效卡住，按「試播金幣聲」應該會自動重建並出聲');return render()}
  if(k==='sfxbg'){if(ACX){try{ACX.suspend()}catch(e){}ACX_DIRTY=true}toast('已模擬切到背景（音效暫停），按「試播金幣聲」應該要有聲音');return render()}
  if(k==='rdot1'||k==='rdot2'){S.villages.forEach((st,i)=>{if(i<10)st.status='cleared'});if(S.villages[10].status==='locked')S.villages[10].status='open';const st=S.villages[k==='rdot1'?0:10];st.bank.cycles+=2;st.bank.gold+=100;ui.realm=k==='rdot1'?1:0;ui.tab='village';save();render();return toast('完成，看地圖列另一界的圖示有沒有紅點','ok')}
  if(k.startsWith('r2')){
    if(k==='r2open'||k==='r2all'){S.villages.forEach((st,i)=>{if(i<10||k==='r2all')st.status='cleared'});if(S.villages[10].status==='locked')S.villages[10].status='open';ui.realm=1}
    else if(k==='r2lock'){S.villages.forEach((st,i)=>{if(i>=10){if(st.weaponId!=null)recallCore(i);st.status='locked'}});ui.realm=0}
    else if(k==='r2fur'){S.furnace=6;S.gold+=0}
    else if(k==='r2t4'){devAllWeapons(BPS.filter(b=>b.t===4).map(b=>b.id));return render()}
    else if(k==='r2mats'){S.gold+=200000}
    else if(k==='r2wpn'){const w=makeWeapon('dev_axe',3,6,[]);w.ench[0]={k:'ice',v:2};ui.sheet={t:'w',id:w.id,m:'main'};save();render();return toast('已送出','ok')}
    save();if(k!=='r2wpn'){ui.sheet=null;ui.tab='village'}render();return toast('完成','ok')}
if(k.startsWith('evt')){const v=evtSt();
    if(k==='evtnext')EVT_WK++;
    else if(k==='evtfast'){if(!v.slots.some(Boolean))return toast('先派一把武器駐守首領','bad');v.slots.forEach(x=>{if(x)x.at-=10*3600e3});save();ui.tab='village';ui.sheet={t:'evt'};toast('駐守時間已往前 10 小時（只改本機；登入時伺服器傷害不會變）','ok');return render()}else if(k==='evtdmg'){v.dmg+=5000}
    else if(k==='evtgrank'){ui.bossSim=true;BOSS_G.t=Date.now()+600000;S.evtRk=null;BOSS_G.prev={week:evtWeek()-1,hp:300000,total:300000,players:12,mine:8800,rank:2,top:[]}}
    else if(k==='evtgdead'||k==='evtgalive'){ui.bossSim=true;const hp=300000;BOSS_G.t=Date.now()+600000;BOSS_G.b={week:v.wk,hp,total:k==='evtgdead'?hp+1234:hp*.55,players:12,mine:Math.max(1,bossLive()),rank:3,top:[{nick:'測試鐵匠甲',dmg:90000,ws:S.weapons.slice(0,3).map(w=>({...bossW(w),pw:bossDmgOf(w,evtNow().boss)}))},{nick:'測試鐵匠乙',dmg:60000,ws:S.weapons.slice(3,4).map(w=>({...bossW(w),pw:power(w)}))},{nick:S.nick||'我',dmg:Math.max(1,bossLive()),me:true,ws:v.slots.filter(Boolean).map(x=>({...bossW(W(x.id)),pw:x.pw}))}]};v.gs=0;save();ui.tab='village';ui.sheet={t:'evt'};return render()}else if(k==='evtreset'){S.evt=null}
    save();toast('已模擬換週：'+evtNow().boss.n,'ok');ui.sheet=null;ui.tab='village';scrollTo(0,0);return render()}
  if(k==='rep1'||k==='rep10'){let n=0;for(let c=0;c<(k==='rep1'?1:10);c++)n+=repNeed(S.rep.lv+c);repGain(n-S.rep.xp+0);save();return render()}
  if(k==='represet'){for(const t in S.rep.t)S.rep.t[t]=0;save();toast('天賦點已全部退回','ok');return render()}
  if(k==='repzero'){S.rep={lv:1,xp:0,t:Object.fromEntries(Object.keys(TALENTS).map(t=>[t,0]))};save();toast('聲望已歸零','ok');return render()}
  if(k==='repopen'){ui.tab='forge';ui.sheet={t:'ws',k:'t'};return render()}
if(k==='cpush'){toast('上傳中…');cloudPush(true).then(()=>{toast(CLOUD.err?'上傳失敗：'+CLOUD.err:'已上傳到雲端',CLOUD.err?'bad':'ok');render()});return}
  if(k==='cpull'){cloudPull().then(()=>toast('已從雲端下載','ok')).catch(e=>toast('下載失敗：'+SB_ERR(e.message),'bad'));return}
  if(k==='clogout'){ui.sheet=null;return cloudLogout()}
  if(k==='maintprev'){ui.sheet=null;render();return showMaint(null,true)}
  if(k==='mkopen'){ui.sheet=null;ui.tab='market';mkLoad();return render()}
  if(k==='mksettle'){mkSettle(false).then(()=>mkLoad());return}
  if(k==='mkisell'){S.items[STONE]=stones()+50;save();ui.mkPrice='';ui.mkQty=1;ui.sheet={t:'mksi',k:STONE};render();return toast('強化石 +50；填單價和數量後按確認上架','ok')}
  if(k==='mkisim'){if(!mkMock())return toast('這是離線模擬專用（請先登出）','bad');mkMockApi('sim_sell').then(q=>{ui.sheet=null;ui.tab='market';MK.t=0;mkLoad();toast(`已模擬賣出 ${q} 個，到「待領取」看看`,'ok')}).catch(e=>toast(e.message,'bad'));return}
  if(k==='mkcard'){const b=BPS.find(x=>x.cat==='sword')||BPS[0],w={b:b.id,q:0,lv:7,traits:[],ench:[{k:'ice',v:2},null,null,null]},id=-777;   // v4.53 假商品，只用來看詳情排版
    MK.rows=MK.rows.filter(r=>r.id!==id);MK.rows.unshift({id,seller:'npc',seller_nick:'測試賣家',weapon:w,bp:b.id,lv:7,q:0,cur:'gold',price:12345,expires_at:new Date(Date.now()+2*864e5).toISOString(),created_at:new Date().toISOString()});
    if(!MK.t)MK.t=Date.now();ui.tab='market';MK.tab='buy';ui.sheet={t:'mkw',id};render();return toast('列表最上面也有這件（名稱應該有「冰封」）；這是假商品，不能真的買')}
  if(k==='mkclaimt'){const bps=BPS.filter(b=>b.t<=1),mk=(n,st,cur,price,q,lv)=>{const b=bps[n%bps.length];return {id:-(Date.now()%1e6)-n,fake:!mkMock(),seller:'me',bp:b.id,weapon:{b:b.id,q,lv,traits:[],ench:[null,null,null,null]},lv,q,cur,price,status:st,settled:false,buyer_ack:true,created_at:new Date().toISOString(),expires_at:new Date().toISOString()}};   // v4.08 待領取測試：離線模擬市場走真流程，登入中只是預覽（領取不入帳）
    const rs=[mk(3,'sold','gold',3200,2,7),mk(5,'sold','gems',120,4,10),mk(6,'expired','gold',500,1,4)];ui.sheet=null;ui.tab='market';MK.tab='claim';
    if(mkMock()){const d=mkMockDB();rs.forEach(r=>{r.id=d.seq++;delete r.fake;d.rows.unshift(r)});mkMockSave(d);rs.forEach(r=>mkMark('listed',r.id));mkReconcile(true).then(()=>{render();scrollTo(0,0)})}
    else{MK.claim=MK.claim.filter(r=>!r.fake).concat(rs);render();scrollTo(0,0);toast('登入中：這是預覽，按領取不會真的入帳')}return}
  if(k==='mksold'||k==='mkexp'||k==='mkreset'){if(AUTH)return toast('這是離線模擬專用（請先登出）','bad');if(k==='mkreset'){try{localStorage.removeItem('nrs-mkmock')}catch(e){}MK.t=0;return toast('模擬市場已重設','ok')}
    const db=mkMockDB(),mine=db.rows.filter(r=>r.seller==='me'&&r.status==='open');if(!mine.length)return toast('你目前沒有上架中的武器','bad');
    if(k==='mksold'){mine[0].status='sold';mine[0].buyer='npc'}else mine.forEach(r=>r.expires_at=new Date(Date.now()-1000).toISOString());mkMockSave(db);toast(k==='mksold'?'已模擬被買走，按「立即結算」或重新開啟交易所入帳':'已模擬過期','ok');return}
  if(k.startsWith('uidot_')){const t=k.slice(6);ui.sheet=null;ui.result=null;   // v3.64 紅點提醒測試
    if(t==='w'){const w=S.weapons.filter(x=>!x.test).sort((a,c)=>c.id-a.id)[0];if(!w)return toast('道具欄沒有武器','bad');S.seenW=w.id-1;ui.tab='forge';render();return toast('道具欄分頁應該亮紅點；點進去最新那把有 NEW，離開道具欄後消失')}
    if(t==='bp'){const b=BPS.filter(x=>!bpLock(x)).pop();bpSeen();S.bpSeen=S.bpSeen.filter(x=>x!==b.id);ui.tab='village';render();return toast(`鐵匠鋪分頁和「圖紙」小分頁應該亮紅點；${b.n} 有 NEW，點選後消失`)}
    if(t==='full'){const i=S.villages.findIndex(st=>st.weaponId!=null&&W(st.weaponId));if(i<0)return toast('先交付一把武器到村莊','bad');const st=S.villages[i],w=W(st.weaponId);
      st.cycleStart=NOW()-dur(i,w)*(capCycles(i,w)+1);tick();ui.tab='forge';render();return toast('村莊分頁的紅點應該變大、更醒目；收成後恢復')}
    if(t==='mk'){S.mkNew=1;ui.tab='forge';render();return toast('交易所分頁應該亮紅點，點進去後消失')}
    if(t==='mon'){if(!monthlyOn())S.monthly.until=NOW()+30*864e5;S.monthly.last='';ui.tab='forge';render();return toast('商城分頁和「領 50 鑽」按鈕應該亮紅點')}
    const L=[['村莊：可收成',S.villages.some(v=>v.bank.cycles)],['村莊：倉庫滿',S.villages.some((x,i)=>vState(i)[0]==='full')],['村莊／道具欄：可交付（沒有駐守的村莊）',anyGive()],['村莊：成就可領 '+achReadyN(),achReadyN()>0],
      ['道具欄：新武器',S.weapons.some(wNew)],['鐵匠鋪：沒在鍛造、可開工',forgeIdle()],['鐵匠鋪：新圖紙',BPS.some(bpNew)],['交易所：有成交／退回',S.mkNew>0],['商城：月卡可領',monthlyDot()]];
    ui.result={t:'info',title:'目前的紅點',html:L.map(([n,v])=>`<div class="kv"><span>${n}</span><b class="${v?'t-danger':'muted'}">${v?'亮':'—'}</b></div>`).join('')};return render()}
  if(k==='uiwarm'){const L=[...WARM.values()],ok=L.filter(i=>i.complete&&i.naturalWidth).length;   // v3.67 分頁美術預熱測試
    ui.result={t:'info',title:'分頁美術預熱',html:`<div class="kv"><span>已預熱圖片</span><b>${L.length} 張</b></div><div class="kv"><span>已載入完成</span><b class="${ok===L.length?'t-ok':'t-danger'}">${ok} 張</b></div><div class="kv"><span>鐵匠鋪大背景暫存</span><b>${HERO_KEEP||document.querySelector('#view > section.hero')?'有':'—'}</b></div>`};return render()}
  if(k==='uiwarmrun'){ui.sheet=null;ui.result=null;const back=ui.tab,out=[];(async()=>{for(const t of ['armory','village','shop','market','forge',back]){ui.tab=t;const t0=performance.now();render();
      await new Promise(r=>requestAnimationFrame(()=>r()));const ims=[...document.querySelectorAll('#view img')],miss=ims.filter(i=>!(i.complete&&i.naturalWidth)).length;
      let ms=0;if(miss){await Promise.all(ims.map(i=>i.decode?i.decode().catch(()=>{}):0));ms=Math.round(performance.now()-t0)}out.push([t,ims.length,miss,ms])}
    out.pop();const N={forge:'鐵匠鋪',armory:'道具欄',village:'村莊',shop:'商城',market:'交易所'};
    ui.result={t:'info',title:'切分頁出圖測試',html:out.map(([t,n,m,ms])=>`<div class="kv"><span>${N[t]}（${n} 張圖）</span><b class="${m?'t-danger':'t-ok'}">${m?`${m} 張晚 ${ms}ms`:'全部立刻顯示'}</b></div>`).join('')};render()})();return}
  if(k==='uiswap'||k==='uidropinfo'){const i=S.villages.findIndex(st=>st.weaponId!=null&&W(st.weaponId));if(i<0)return toast('目前沒有村莊有駐守武器，先交付一把','bad');   // v3.79 村莊換武器測試
    if(k==='uidropinfo'){ui.tab='village';ui.result=null;ui.sheet={t:'v',i};render();return toast('點「每輪掉落」的材料，應該會跳出材料說明（含本村機率）')}
    const v=VILLAGES[i],cur=W(S.villages[i].weaponId),w=makeWeapon(cur.b,cur.q,0,[],cur.ench.map(e=>e&&{...e}));w.lv=cur.lv;while(power(w)<=power(cur)&&w.lv<MAX_LV)w.lv++;
    ui.sheet=null;ui.result=null;ui.tab='village';save();render();const el=document.querySelector(`#view .vcard [data-act=vswap][data-i="${i}"]`);if(el)el.scrollIntoView({block:'center'});
    return toast(`已送出 ${bpOf(w).n} +${w.lv}，${vNo(i)} ${v.name} 應顯示「道具欄有更強的可以換」但不亮紅點；點標籤會跳到道具欄選武器`,'ok')}
  if(k==='uigive'){const gm=giveMin(),nv=gm.map((m,i)=>m===-1?i:-1).filter(i=>i>=0);if(!nv.length)return toast('目前沒有村莊在等武器（全部都有駐守）','bad');   // v3.64 可交付紅點測試
    const i=nv[0],v=VILLAGES[i],b=Object.values(BP).filter(x=>x.cat===v.cat).sort((a,c)=>c.t-a.t)[0],w=makeWeapon(b.id,4,0,[],[{k:vWeak(i),v:3},null,null,null]);
    while(!eligible(i,w)&&w.lv<MAX_LV)w.lv++;ui.sheet=null;ui.result=null;ui.tab='armory';ui.acat='all';ui.aq=ui.ast='all';save();render();scrollTo(0,0);
    return toast(`已送出 ${b.n} +${w.lv}（可交付 ${vNo(i)} ${v.name}），武器卡、道具欄和村莊分頁應該都有紅點`,'ok')}
  if(/^ui(v|arm|forge|mat|shop)$/.test(k)){ui.sheet=null;ui.result=null;   // v3.61 介面修正的測試按鈕
    if(k==='uiv'){ui.tab='village';render();return scrollToNextVillage()}
    if(k==='uiarm'){ui.tab='armory';render();return scrollTo(0,500)}
    if(k==='uiforge'){ui.tab='forge';ui.ftab='bp';render();const h=document.querySelector('#view .hscroll');if(h)scrollTo(0,h.getBoundingClientRect().top+scrollY-200);return toast('手指放在圖紙列上直接上下滑，整頁應該會跟著捲')}
    if(k==='uimat'){ui.tab='armory';ui.atab='m';ui.result={t:'info',...itemInfo('relic_y')};return render()}
    ui.tab='shop';render();const m=document.querySelector('#view .mlist');if(m)scrollTo(0,m.getBoundingClientRect().top+scrollY-160);return}
  if(k==='cnameprev'){ui.sheet=null;render();return showName(true,true)}
  if(k==='cname'){ui.sheet=null;render();return showName(!S.nick)}if(k==='sfxaltclr'){SFX_VAR_KEYS.forEach(n=>{if(SFX_ALT[n])sfxSetAlt(n,'')});toast('音效已全部切回原版');return render()}
  const m=S.mats,give=(b,q,lv,ench,traits)=>{makeWeapon(b,q,lv,traits,ench);toast('已放入道具欄')};
  if(k.startsWith('fxt_')){if(ui.busy)return;return testFx('ok',false,false,+k.slice(4))}   // v4.58 升階演出
  if(k==='fx_green'){const f=FXW[ui.devFxW||'axe'];ui.enhLast=null;ui.sheet={t:'fxt',k:'ok',art:A(f[0]),next:3,danger:false};renderLayer();return greenFlash()}   // v4.64 安定區一定成功，只測綠光
  if(k.startsWith('fx_')){if(ui.busy)return;return testFx(k.slice(3))}
  if(k==='lbtie'){if(!AUTH)return toast('要先登入才能測試','bad');const R=LBR.rows,T=LBR.t,B0=S.best[0],me=AUTH.user.id,w={b:Object.keys(BP)[0],q:0,lv:0};
    S.best[0]={p:5000,...w,traits:[],ench:[],sub:true};LBR.t=1;LBR.rows={0:[{user_id:'a',nick:'早到',p:5000,w,updated_at:'2026-01-01T00:00:00Z'},{user_id:me,nick:'我',p:5000,w,updated_at:'2026-01-02T00:00:00Z'},{user_id:'b',nick:'晚到',p:5000,w,updated_at:'2026-01-03T00:00:00Z'}]};
    const r1=lbRank(0),o1=lbRows(0).map(x=>x.n).join('>');LBR.rows[0][1].p=4000;const r2=lbRank(0);   // 伺服器還沒更新到 5000 → 自己當作最晚
    LBR.rows=R;LBR.t=T;if(B0)S.best[0]=B0;else delete S.best[0];
    const ok=r1===2&&o1==='早到>'+(S.nick||'你')+'>晚到'&&r2===3;return toast(`同攻擊力測試${ok?'通過':'失敗'}：名次 ${r1}（應為 2）、未上傳 ${r2}（應為 3）<br>${o1}`,ok?'ok':'bad')}
  if(k==='lbtop'||k==='lbmid'){if(k==='lbtop'){lbSync().then(()=>lbFetch(true));toast('已上傳我的紀錄並重新讀取')}else{lbFetch(true);toast('重新讀取排行榜')}ui.sheet={t:'lb',i:0};return render()}
  if(k==='lbreset'){S.best={};S.lbRw={};save();toast('排行榜紀錄已清除');ui.sheet={t:'lb',i:0};return render()}
  if(k==='tutnew'){localStorage.removeItem(KEY);S=fresh();S.tut=0;save();ui.sheet=null;ui.tab='forge';ui.ftab='bp';render();return toast('已換成新存檔，從第 1 步開始導覽')}
  if(k==='tutch'){S.villages[0].status='open';S.villages[0].weaponId=null;if(!S.weapons.some(w=>w.b===TUT_BP&&!busyW(w)))makeWeapon(TUT_BP,0,0,[]);ui.sheet=null;ui.result=null;ui.tab='forge';tutStep(2);render();return}
  if(k==='tutrestart'){S.tut=0;save();ui.sheet=null;ui.tab='forge';ui.ftab='bp';render();return}
  if(k==='tipreset'){S.tips={};save();return toast('各系統說明已重設，第一次打開時會再出現')}
  if(k==='tutnext'){if(typeof S.tut==='number'&&S.tut<TUT.length)tutStep(S.tut+1);return}
  if(k==='gtlogin'){ui.sheet=null;render();return showLogin()}
  if(k==='gtstory'){ui.sheet=null;render();return showStory()}
  if(k==='gtreset'){S.introSeen=0;save();return toast('下次登入後會再播放開場故事')}
  if(k==='tbprev'){ui.sheet=null;ui.tab='forge';ui.ftab='bp';ui.cat='all';render();scrollTo(0,0);setTimeout(()=>{const t=document.querySelectorAll('[data-act=bp]')[1];t&&t.click()},500);return toast('測試：回到頂端後自動點第 2 張圖紙，畫面應該往下捲到詳情')}   // v3.80
  if(k==='tlack'){DEV_LACK=Date.now()+15000;ui.sheet=null;ui.tab='forge';ui.ftab='bp';ui.cat='all';ui.bp='dev_bow';ui.qty=1;render();setTimeout(()=>{startForge();setTimeout(render,15100)},400);return toast('測試：15 秒內當作材料不夠，按「開始鍛造」會顯示缺什麼')}   // v3.59
  if(k==='tharvest'){const i=S.villages.findIndex(st=>st.weaponId!=null&&st.cycleStart!=null&&W(st.weaponId));if(i<0)return toast('先交付一把武器到村莊','bad');const w=W(S.villages[i].weaponId);
    S.villages[i].cycleStart=NOW()-dur(i,w)+2000;ui.sheet=null;ui.tab='village';render();return toast(`${vNo(i)} 兩秒後完成一輪，停在這頁看「收成」按鈕會不會自己出現`)}   // v3.59
  if(k==='storyreq'){makeWeapon('dev_sword',3,8,[],[{k:'ice',v:3},null,null,null]);makeWeapon('dev_dagger',3,10,[],[{k:'bolt',v:3},null,null,null]);makeWeapon('dev_bow',3,10,[],[{k:'toxic',v:3},null,null,null]);ui.sheet=null;ui.tab='armory';render();return toast('已給永凍之霜劍、雷神之怒雙刀、巨蟒之毒弓：分別打中 1-9、2-6、2-10 的弱點','ok')}   // v4.44 改成屬性
  if(k==='godreq'){makeWeapon('dev_polearm',3,8,[],[{k:'dark',v:3},null,null,null]);makeWeapon('dev_polearm',3,8,[],[{k:'light',v:3},null,null,null]);ui.sheet={t:'v',i:9};render();return toast('已給 2 把 +8 長戟：暗屬性、聖屬性。1-10 海姆達爾弱點是暗影','ok')}
  if(k==='mondex'){const n=Math.max(0,S.villages.findIndex(v=>v.status==='open'));ui.tab='village';ui.sheet={t:'v',i:n};render();return toast(`${vNo(n)} 上方是怪物大圖，按 ‹ › 或小圖翻看這一界 10 隻`)}   // v4.12
  if(k==='affopen'){const c={},t=[0,0,0,0];for(let i=0;i<6000;i++){const x=Object.keys(ELEM)[rnd(0,5)],v=weighted([1,2,3],y=>ELEM_TW[y]);c[x]=(c[x]||0)+1;t[v]++}   // v4.44 屬性附魔
    return toast(`附魔 6000 次：${Object.entries(c).map(([x,n])=>ELEM[x].n+' '+n).join('、')}<br>等級：一級 ${t[1]}、二級 ${t[2]}、三級 ${t[3]}（應約 4200／1500／300）`,'ok')}
  if(k==='res77'){const wi=makeWeapon('dev_sword',2,6,[],[{k:'ice',v:3},null,null,null]),wf=makeWeapon('dev_sword',2,6,[],[{k:'fire',v:3},null,null,null]);save();ui.sheet={t:'w',id:wf.id,m:'ench'};render();return toast(`1-9 火焰騎兵：永凍之霜 ×${weakMul(8,wi)}（應 1.1）、滅世之焰 ×${weakMul(8,wf)}（應 0.9）`)}
  if(k==='ench81'){const w=makeWeapon('dev_sword',2,6,[],[{k:'fire',v:3},null,null,null]);S.items[ENSTONE]=(S.items[ENSTONE]|0)+5;S.gold+=5000;ui.enchArm=null;save();ui.sheet={t:'w',id:w.id,m:'ench'};render();return}
  if(k==='res77i'){ui.result=Object.assign({t:'info'},affInfo('fire'));render();return}
  if(k==='race78'){S.villages.forEach((v,i)=>{if(i<4)v.status='cleared'});if(S.villages[4].status==='locked')S.villages[4].status='open';ui.testOut='<b>v4.78 武器剋制</b><br>'+Object.entries(CAT_RACE).map(([c,r])=>CATS[c]+'→'+RACE_N[r]).join('、')+'<br><b>20 關型態</b><br>'+MON_RACE.map((r,i)=>vNo(i)+' '+RACE_N[r]).join('、');ui.sheet={t:'v',i:4};render();return toast('1-5 戰場鴉魔應該是亡靈')}
  if(k==='race79'){ui.testOut='<b>v4.79 相剋加成</b><br>'+RACE_PCT.map((p,l)=>'+'+l+' '+p+'%').join('、');const w=makeWeapon('dev_sword',2,9,[]);save();ui.sheet={t:'w',id:w.id,m:'main'};render();return toast('+9 相剋應為 12%，下一級 +10 為 15%')}
  if(k==='elpop'){const w=makeWeapon('dev_sword',2,6,[],[{k:'bolt',v:3},null,null,null]);save();ui.sheet={t:'w',id:w.id,m:'ench'};ui.result=Object.assign({t:'info'},affInfo('bolt'));render();return}
  if(k==='elall'){const ks=Object.keys(ELEM);ks.forEach((x,j)=>makeWeapon('dev_sword',2,6,[],[{k:x,v:1+j%3},null,null,null]));save();ui.sheet=null;ui.tab='armory';render();return toast('已給 6 把 +6 測試劍：火屬性一級、冰屬性二級、雷屬性三級、毒屬性一級、聖屬性二級、暗屬性三級。拿去駐守看卡片的弱點提示會不會變綠','ok')}
  if(k==='ec18'){const w=S.weapons.find(x=>where(x)<0)||S.weapons[0];if(!w)return toast('道具欄沒有武器','bad');w.ench=[{k:'bolt',v:3},null,null,null];ui.sheet={t:'w',id:w.id,m:'ench'};save();render();return toast('名稱前面應該是「雷神之怒」，下面 18 格裡雷神之怒那格有框','ok')}   // v4.67
  if(k==='elforce'){DEV.elForce=[Object.keys(ELEM)[rnd(0,5)],3];return toast(`下一次附魔必定三級：${ELEM[DEV.elForce[0]].tn[2]}`,'ok')}
  if(k.startsWith('gw')){
    if(k==='gwbstgl'){devdo('bsall');const st=S.villages[1];st.bank={cycles:12,gold:340,mats:Object.fromEntries(VILLAGES[1].drops.map(d=>[d[0],5])),events:0};ui.sheet=null;ui.bsOpen=1;save();render();setTimeout(()=>document.querySelectorAll('#view .vcard')[1]?.scrollIntoView({block:'start'}),50);return toast('1-2 已展開：上面戰鬥畫面、下面每輪掉落和已經打到的東西；點卡片下方的箭頭收起','ok')}
    if(k==='gwvpick'){const st=S.villages[0];if(st.weaponId==null||!W(st.weaponId)){const w=makeWeapon('dev_axe',0,0,[]);st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW()}ui.tab='village';ui.realm=0;ui.sheet={t:'v',i:0};save();render();return toast('1-1 駐守中：點卡片上的武器就是這張小卡','ok')}
    if(k==='gwstory'){S.villages.forEach((v,i)=>{if(i<20&&v.status==='locked')v.status='open'});ui.tab='village';ui.sheet={t:'v',i:19};save();render();return toast('2-10 索爾詳情：用 ‹ › 翻到 2-9 赫朗格尼爾；1-8 莫庫卡爾菲在第一界','ok')}}
  if(k==='bpdel'){const real=BPS.filter(b=>!b.dev),old=S.weapons.filter(w=>!BP[w.b]||!BP[w.b].dev).length;ui.sheet=null;ui.tab='forge';ui.ftab='bp';render();   // v4.44
    return toast(`正式圖紙 ${real.length} 張（應該 0）、測試圖紙 ${BPS.length-real.length} 張、非測試武器 ${old} 把<br>${real.length?'還有：'+real.map(b=>b.n).join('、'):'舊圖紙已全部刪除'}`,real.length?'bad':'ok')}
  if(k==='monlore'){const n=((ui.monLoreI==null?-1:ui.monLoreI)+1)%VILLAGES.length;ui.monLoreI=n;ui.sheet={t:'v',i:n};render();return toast(`${vNo(n)} ${MON_T[n]}・${MONS[n]}（再按一次看下一隻）`)}   // v4.04
  if(k==='tmon'){const i=S.villages.findIndex(st=>st.weaponId!=null&&st.cycleStart!=null&&W(st.weaponId));if(i<0)return toast('先交付一把武器到村莊','bad');const w=W(S.villages[i].weaponId);   // v3.73
    S.villages[i].cycleStart=NOW()-dur(i,w)+3000;ui.sheet=null;ui.tab='village';render();setTimeout(()=>{const c=document.querySelector(`#view .vcard[data-i="${i}"]`);if(c)c.scrollIntoView({block:'center'})},50);
    return toast(`${vNo(i)} ${MONS[i]}剩一點血，3 秒後擊倒（看血條歸零、「擊倒！」和收成按鈕）`)}
  if(k==='autoenh'){const w=makeWeapon('dev_hammer',1,0);w.test=true;S.gold=Math.max(S.gold,5000);ui.sheet={t:'w',id:w.id,m:'main'};autoEnhance(w.id);return}   // 測試一鍵強化：放一把 +0 鐵錘、補到 5000 金後執行
  
  if(k==='tsec'){ui.testOut='檢查中…';render();   // v3.63 確認開發者工具、伺服器防作弊已更新
    const row=(ok,t)=>`<div>${ok?'✓':'✗'} ${t}</div>`;
    Promise.all([AUTH?adminCheck():Promise.resolve(false),fetch(SB_URL+'/rest/v1/rpc/ac_version',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:'{}'}).then(r=>r.ok?r.json():null).catch(()=>null),fetch(SB_URL+'/rest/v1/rpc/chat_version',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:'{}'}).then(r=>r.ok?r.json():null).catch(()=>null)]).then(([adm,ver,cver])=>{
      ui.testOut=`<div><b>安全設定檢查</b></div>`+row(true,'網站模式：'+(CLOUD_ONLY?'正式（只能雲端存檔）':'測試版（本機）'))+row(!!AUTH,'登入帳號：'+(AUTH?esc(AUTH.user.email):'未登入'))
        +row(adm||!CLOUD_ONLY,'管理員：'+(adm?'是（可以使用開發者工具）':CLOUD_ONLY?'否（正式網站不能開開發者工具）':'否（測試版不限制）'))
        +row(parseFloat(ver)>=3.63,'伺服器防作弊版本：'+(ver||'讀不到（v3.63 的 SQL 還沒執行）'))+row(parseFloat(ver)>=3.65,'排行榜攻擊力由伺服器計算：'+(parseFloat(ver)>=3.65?'是':'否（04_leaderboard_v3.65.sql 還沒執行）'))+row(parseFloat(ver)>=3.69,'伺服器離線上限 12 小時：'+(parseFloat(ver)>=3.69?'是':'否（05_offline12h_v3.69.sql 還沒執行）'))+row(parseFloat(ver)>=3.70,'全服跑馬燈：'+(parseFloat(ver)>=3.70?'已啟用':'否（06_news_v3.70.sql 還沒執行）'))+row(parseFloat(ver)>=3.72,'首領討伐全服血條：'+(parseFloat(ver)>=3.72?'是':'否（07_boss_v3.72.sql 還沒執行）'))+row(parseFloat(ver)>=3.87,'派武器駐守首領：'+(parseFloat(ver)>=3.87?'是':'否（10_boss_post_v3.87.sql 還沒執行）'))+row(parseFloat(cver)>=3.88,'世界聊天＋玩家名片：'+(parseFloat(cver)>=3.88?'已啟用（'+cver+'）':'否（11_chat_v3.88.sql 還沒執行）'))+row(parseFloat(cver)>=3.98,'好友＋公會：'+(parseFloat(cver)>=3.98?'已啟用':'否（14_guild_v3.98.sql 還沒執行）'))+row(parseFloat(ver)>=4.45,'屬性附魔（攻擊力不算附魔、首領屬性弱點）：'+(parseFloat(ver)>=4.45?'是':'否（18_element_v4.45.sql 還沒執行）'))
        +row(true,'一般玩家連點頭像 20 下：'+(CLOUD_ONLY?'不會開啟開發者工具':'測試版會開啟'));render()});return}
  if(k==='tlbsv'){ui.testOut='檢查中…';render();   // v3.65 每座村莊：本機最佳攻擊力、是否已上傳、伺服器上的攻擊力
    (async()=>{if(AUTH){await lbSync();LBR.t=0;await lbFetch(true)}
      const me=AUTH&&AUTH.user.id,rows=VILLAGES.map((v,i)=>{const b=S.best[i],r=me&&(LBR.rows[i]||[]).find(x=>x.user_id===me);if(!b&&!r)return'';
        const ok=b&&r&&r.p===b.p;return`<div>${ok?'✓':b&&!b.sub?'…':'✗'} ${esc(v.name)}：本機 ${b?b.p:'—'}${b&&!b.sub?'（等待上傳）':''}・伺服器 ${r?r.p:'—'}</div>`}).join('');
      ui.testOut='<div><b>排行榜上傳檢查</b></div>'+(AUTH?'':'<div>未登入，只顯示本機紀錄</div>')+(rows||'<div>還沒有任何交付紀錄</div>');render()})();return}
  if(k==='ticon'){const ls=[...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')];
    ui.testOut='<div><b>App icon 設定（'+ls.length+'/4）</b></div>'+ls.map(l=>`<div style="display:flex;align-items:center;gap:8px;margin:4px 0">${l.rel==='manifest'?'':`<img src="${l.getAttribute('href')}" style="width:${l.sizes&&l.sizes.value?parseInt(l.sizes.value):48}px;max-width:64px;border-radius:12px">`}<span>${l.rel} ${l.sizes&&l.sizes.value||''} → ${l.getAttribute('href')}</span></div>`).join('');
    fetch('manifest.webmanifest').then(r=>r.json()).then(m=>{ui.testOut+=`<div>manifest：${m.name}，icons ${m.icons.length} 個 ✓</div>`;render()}).catch(()=>{ui.testOut+='<div>manifest 讀取失敗 ✗</div>';render()});render();return}
  if(k==='tquick'||k==='tecon'){if(typeof runTests!=='function'){ui.testOut='載入測試程式中…';render();const sc=document.createElement('script');sc.src='tests.js?v='+BUILD_ID;sc.charset='utf-8';sc.onload=()=>devdo(k);sc.onerror=()=>{ui.testOut='測試程式沒有載入。';render()};document.head.appendChild(sc);return}
    ui.testOut='執行中…';render();setTimeout(()=>{ui.testOut=k==='tquick'?runTests('quick'):runTests('econ');render()},30);return}
  ({gold:()=>S.gold+=5000,gems:()=>S.gems+=1000,relic5:()=>RELICS.forEach(k=>S.items[k]=(S.items[k]||0)+5),
   matall:()=>{for(const k in MATS)S.mats[k]+=100;S.items[ENSTONE]=(S.items[ENSTONE]|0)+20;toast('8 種材料各 +100、附魔石 +20','ok')},
   relicsim:()=>{const tops=[0,9,19];ui.testOut='<b>v4.54 英靈・遺物</b><br>'+tops.map(i=>{const o=relicOdds(i);return `${vNo(i)} 掉到：`+RELICS.map(k=>ITEMS[k][3]+' '+r1(o[k])+'%').join('、')}).join('<br>')+'<br><b>各開 1000 個（不入帳，用目前進度）</b><br>'+RELICS.map(k=>{const S0=S;S=JSON.parse(JSON.stringify(S0));S.weapons=[];const c=[0,0,0,0,0,0],got={};for(let n=0;n<1000;n++)c[relicRoll(k,got)]++;S=S0;return ITEMS[k][3]+'：'+RELIC_KN.map((x,j)=>x+' '+c[j]/10+'%').join('、')}).join('<br>')},
   wstack:()=>{const b=(BPS.find(x=>!x.dev&&!x.unlock)||BPS[0]).id,ek=Object.keys(ELEM)[0];for(let n=0;n<11;n++){const w=makeWeapon(b,0,n<6?0:3);if(n>=9)w.ench[0]={k:ek,v:1}}S.seenW=S.nextId-4;save();ui.sheet=null;ui.tab='armory';ui.atab='w';ui.acat='all';ui.aq='all';ui.ast='all';ui.asort='recent';scrollTo(0,0);toast('已產生 11 把：應該只多 3 格（×6、×3、×2）','ok')},
   dropsim:()=>{const out=[0,6,9,19].map(i=>{const st={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};for(let c=0;c<1000;c++)rollCycle(i,null,st,NOW());return vNo(i)+'：'+Object.entries(st.bank.mats).map(([k,n])=>itemName(k)+' '+n).join('、')});ui.testOut='<b>v4.54 打倒 1000 隻掉的東西</b><br>'+out.join('<br>')},relic0:()=>RELICS.forEach(k=>S.items[k]=0),relicbag:()=>{ui.sheet=null;ui.tab='armory';ui.atab='m'},relicinfo:()=>{ui.sheet=null;ui.tab='armory';ui.atab='m';ui.result={t:'info',...itemInfo('relic_y')}},
   bsall:()=>{Object.keys(KN).forEach((c,i)=>{const b=BPS.filter(x=>x.cat===c).sort((x,y)=>x.t-y.t)[0];if(!b)return;const st=S.villages[i];
       const w=makeWeapon(b.id,2,6);if(st.status!=='cleared')st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW()-dur(i,w)*.3;delete MONFX.hp[i]});
     ui.sheet=null;ui.tab='village';ui.realm=0;ui.bsOpen=0;toast('1-1～1-7 各駐守一種武器（+6）：劍、斧、錘、雙刀、長柄、弓、弩。點怪物小圖展開戰鬥畫面（1-1 是全身怪物，其他先用頭像）','ok')},
   bsthumb:()=>{devdo('bsall');ui.bsOpen=null;ui.bsProc=1;Object.keys(KHIT).forEach(k=>delete KHIT[k]);toast('1-1～1-7 收起戰鬥畫面，看卡片小怪物：長柄 1-5 應該跳「貫穿」（附加效果必定觸發，可再按一次「附加效果必定觸發」關掉）','ok');render()},
   bsmon:()=>{const n=KN_FULL.length,k=ui.bsMonK=((ui.bsMonK??-1)+1)%n,i=KN_FULL[k],st=S.villages[i],b=BPS.filter(x=>x.cat==='hammer').sort((x,y)=>x.t-y.t)[0];   // v4.32 用錘（打退最大）看最壞情況
     S.villages.forEach((v,j)=>{if(j<=i&&v.status!=='cleared')v.status='cleared'});const w=makeWeapon(b.id,2,6);st.weaponId=w.id;st.cycleStart=NOW()-dur(i,w)*.3;delete MONFX.hp[i];
     ui.sheet=null;ui.tab='village';ui.realm=i>=10?1:0;ui.bsOpen=i;toast(`${k+1}/${n}：${Math.floor(i/10)+1}-${i%10+1} ${MONS[i]}（錘 +6）`,'ok');render();setTimeout(()=>document.querySelector('.bs')?.scrollIntoView({block:'center'}),50)},
   bs11:()=>{const ks=Object.keys(KN),st=S.villages[0],cur=st.weaponId!=null&&W(st.weaponId),c=ks[(ks.indexOf(cur?bpOf(cur).cat:'')+1)%ks.length],b=BPS.filter(x=>x.cat===c).sort((x,y)=>x.t-y.t)[0];
     const w=makeWeapon(b.id,2,6);if(st.status!=='cleared')st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW()-dur(0,w)*.3;delete MONFX.hp[0];
     ui.sheet=null;ui.tab='village';ui.realm=0;ui.bsOpen=0;toast('1-1 換成 '+CATS[c]+'（+6）','ok')},
   bsbg:()=>{const ks=Object.keys(BS_BGP).map(Number),i=ks[(ks.indexOf(ui.bsOpen)+1)%ks.length],st=S.villages[i],w=makeWeapon(BPS.filter(x=>x.cat==='sword').sort((x,y)=>x.t-y.t)[0].id,2,6);   // v4.35
     if(i>=10)S.villages.forEach((v,j)=>{if(j<=10&&v.status==='locked'||j<10)v.status=j<10?'cleared':'open'});if(st.status!=='cleared')st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW()-dur(i,w)*.3;delete MONFX.hp[i];ui.sheet=null;ui.tab='village';ui.realm=i<10?0:1;ui.bsOpen=i;
     setTimeout(()=>{const c=document.querySelector(`#view .vcard[data-i="${i}"]`);if(c)c.scrollIntoView({block:'center'})},60);toast(vNo(i)+' 戰鬥畫面：背景不該再看到怪物（再按一次換下一關）','ok')},
   bsproc:()=>{ui.bsProc=!ui.bsProc;Object.keys(KHIT).forEach(k=>delete KHIT[k]);toast('附加效果必定觸發：'+(ui.bsProc?'開':'關'),'ok')},
   monall:()=>{const cs=Object.keys(HIT);cs.forEach((c,i)=>{const b=BPS.filter(x=>x.cat===c).sort((x,y)=>x.t-y.t)[0];if(!b)return;const st=S.villages[i],old=st.weaponId;
       const w=makeWeapon(b.id,2,6);if(st.status!=='cleared')st.status='cleared';st.weaponId=w.id;st.cycleStart=NOW()-dur(i,w)*.3;delete MONFX.hp[i]});
     ui.sheet=null;ui.tab='village';ui.realm=0;toast('1-1～1-7 各換一種武器：劍、短刃、錘、斧、弓、弩、長柄','ok')},
   monhp:()=>{let n=0;S.villages.forEach((st,i)=>{const w=st.weaponId!=null&&W(st.weaponId);if(!w||st.bank.cycles>=capCycles(i,w))return;st.cycleStart=NOW()-Math.max(0,dur(i,w)-10000);delete MONFX.hp[i];n++});
     ui.sheet=null;ui.tab='village';toast(n?`${n} 座村莊的怪物剩 10 秒：看血條是不是每跳一次傷害才扣，最後擊倒`:'沒有正在狩獵的村莊','ok')},
   hunt:()=>{tick();S.villages.forEach((st,i)=>{const w=st.weaponId!=null&&W(st.weaponId);if(w)for(let c=0;c<10;c++)rollCycle(i,w,st)})},
   offline:()=>S.villages.forEach(st=>{if(st.cycleStart!=null)st.cycleStart-=OFFLINE_H*3600000/S.speed}),
   forge:()=>S.jobs.forEach(j=>j.end=NOW()),unlock:()=>S.villages.forEach(st=>{if(st.status!=='cleared')st.status='cleared'}),
   maxup:()=>{S.furnace=5;S.anvil=5},wsgate:()=>{S.furnace=1;S.anvil=1;S.gold+=200000;ui.sheet={t:'ws',k:'w'};toast(`工坊改回 Lv1。目前收復 ${cleared()} 座，按升級看哪一級會鎖住`,'ok')},f5:()=>{if(S.jobs.length)return toast('還有武器在鍛造中','bad');const b=BPS.filter(x=>!bpLock(x)).sort((x,y)=>y.t-x.t)[0],c=recipe(b);for(const k in c)S.mats[k]=(S.mats[k]||0)+c[k];S.gold+=goldOf(b);const j=forgeStart(b.id,1,false);if(typeof j==='string')return toast(j,'bad');ui.sheet=null;ui.tab='forge';ui.ftab='queue';toast(`開始鍛造 ${b.n}：應該 ${Math.round((j.end-j.start)/1000)} 秒後完成`,'ok')},w6:()=>give('dev_sword',2,6),nw17:()=>{BPS.filter(b=>!b.dev).forEach(b=>give(b.id,0,0));toast('已給 17 把新武器（+0），到道具欄看','ok')},
   grsim:()=>{const mk=(id,lv)=>({id:-1,b:id,q:0,lv,ench:[null,null,null,null],traits:[]});ui.testOut='<b>v4.71 評級模擬（每關用能做的最好一般武器，+6 各打 30 場）</b><br>'+VILLAGES.map((v,i)=>{const h=vHpBase(i),b=BPS.find(x=>!x.dev&&!x.k&&x.base===h.base&&(x.unlock?x.unlock<=i:!h.s0||h.s0===i))||BP.w0_sword,w6=mk(b.id,6),cnt={};
     for(let k=0;k<30;k++){const p=chPlan(i,w6),g=p.win==null?'輸':GRADES[grOf(p.win/1000)].n;cnt[g]=(cnt[g]||0)+1}
     const need=GRADES.map(g=>{for(let lv=0;lv<=MAX_LV;lv++)if(chEst(i,mk(b.id,lv))<=g.t)return g.n+' +'+lv;return g.n+' —'}).join(' ');
     return `${vNo(i)} 血量 ${fmt(VHP(i))}・${b.n} +6 預估 ${chEst(i,w6).toFixed(1)} 秒：${Object.entries(cnt).map(([g,n])=>g+' '+n).join('、')}<br><span class="muted">　${need}</span>`}).join('<br>')},
   grre:()=>{const i=S.villages.findIndex(v=>v.status==='cleared');if(i<0)return toast('還沒有收復的村莊，先按「解鎖全部村莊」或打一關','bad');const b=BPS.find(x=>!x.dev&&!x.k&&x.unlock&&x.unlock<=Math.max(2,i))||BP.w1_spear;const w=makeWeapon(b.id,0,8,[]);ui.tab='village';ui.realm=Math.floor(i/10);chStart(i,w.id)},
   grcyc:()=>{const i=S.villages.findIndex(v=>v.status==='cleared');if(i<0)return toast('還沒有收復的村莊','bad');const st=S.villages[i];st.gr=st.gr==null?0:(st.gr+1)%GRADES.length;save();ui.tab='village';ui.realm=Math.floor(i/10);ui.sheet=null;const w=st.weaponId!=null&&W(st.weaponId);toast(`${vNo(i)} 評級改成 ${GRADES[st.gr].n}：收益 ×${GRADES[st.gr].m}${w?`、每小時約 ${fmt(gph(i,w))} 金幣`:''}`,'ok')},
   chsim:()=>{const mk=b=>lv=>({id:-1,b:b.id,q:0,lv,ench:[null,null,null,null],traits:[]});ui.testOut='<b>v4.52 限時挑戰模擬（每關用當界一般武器，各打 50 場）</b><br>'+VILLAGES.map((v,i)=>{const b=BPS.find(x=>!x.dev&&!x.k&&x.unlock<=i&&x.unlock>(i<10?0:10))||BP.w0_sword;const r=[0,6,7,8].map(lv=>{const w=mk(b)(lv);let n=0;for(let k=0;k<50;k++)if(chPlan(i,w).win!=null)n++;return `+${lv} ${Math.round(vSec(i,w))}秒 ${n*2}%`});return `${vNo(i)} 血量 ${fmt(VHP(i))}・${b.n}：${r.join('／')}`}).join('<br>')},
   fkfake:()=>{const i=Math.max(0,S.villages.map(v=>v.status).lastIndexOf('cleared'));const nm=['霜狼','北境小鐵','雷鳴','烏鴉','鐵爐之子','冰原獵人','灰燼','老鐵匠','矮人學徒','巨木'],bs=BPS.filter(b=>!b.dev);
     FK.mock=k=>{const m=fkMine(k),rows=[];let t=Math.max(3,VHP(k)/40000);for(let n=0;n<20;n++){t+=.3+n*.4;rows.push({rk:0,uid:'mock-'+n,nick:nm[n%10]+(n>9?n:''),sec:Math.round(t*10)/10,w:{b:bs[n%bs.length].id,q:0,lv:12-Math.floor(n/3),ench:[]},mine:false})}
       if(m)rows.push({rk:0,uid:'me',nick:S.nick||'我',sec:m.sec,w:m.w,mine:true});rows.sort((a,b)=>a.sec-b.sec).forEach((x,n)=>x.rk=n+1);const me=rows.find(x=>x.mine);return{rows:rows.slice(0,50),n:rows.length,me,my:me?{rk:me.rk,n:rows.length,top:rows[0].sec}:null,t:1}};
     ui.sheet={t:'fk',i};render();toast('秒殺榜換成假資料（「清掉假資料」可以還原）')},
   fkann:()=>{fkAnn({nick:'霜狼',village:9,sec:12.4,kind:'first'});fkAnn({nick:S.nick||'測試鐵匠',village:19,sec:8.9,bp:BPS.filter(b=>!b.dev).slice(-1)[0].id,lv:12,kind:'top'});toast('跑馬燈應該依序出現首殺和刷新紀錄')},
   fkwin:()=>{const i=S.villages.map(v=>v.status).lastIndexOf('cleared');const j=i>=0?i:S.villages.findIndex(v=>v.status==='open');if(j<0)return toast('沒有可以挑戰的村莊','bad');const b=BPS.filter(x=>!x.dev).sort((x,y)=>y.base-x.base)[0];const w=makeWeapon(b.id,0,12,[]);ui.tab='village';ui.realm=Math.floor(j/10);chStart(j,w.id)},
   fkclr:()=>{FK.mock=null;FK.b={};S.villages.forEach(v=>{delete v.fk;delete v.fkw;delete v.fku});save();if(ui.sheet&&ui.sheet.t==='fk')render();toast('秒殺紀錄已清除')},
   chwin:()=>{const i=S.villages.findIndex(v=>v.status==='open');if(i<0)return toast('沒有可以挑戰的村莊','bad');const b=BPS.filter(x=>!x.dev).sort((x,y)=>y.base-x.base)[0];const w=makeWeapon(b.id,0,12,[]);ui.tab='village';ui.realm=Math.floor(i/10);chStart(i,w.id)},
   chlose:()=>{const i=S.villages.findIndex(v=>v.status==='open');if(i<0)return toast('沒有可以挑戰的村莊','bad');const w=makeWeapon('w0_sword',0,0,[]);ui.tab='village';ui.realm=Math.floor(i/10);chStart(i,w.id)},
   nwtab:()=>{const P=(b,lv)=>power({id:-1,b:b.id,q:0,lv,ench:[null,null,null,null],traits:[]});ui.testOut='<b>v4.51 新武器（攻擊力＝每秒傷害：+0／+6／+7／+8）</b><br>'+BPS.filter(b=>!b.dev).map(b=>`${b.unlock?vNo(b.unlock-1):'開局'} ${b.n}（${kindN(b)}・${CATS[b.cat]}）：${[0,6,7,8].map(l=>P(b,l)).join('／')}・${fmt(goldOf(b))} 金幣`).join('<br>')+'<br><b>村莊需求（偏難）</b><br>'+VILLAGES.map((v,i)=>`${vNo(i)} ${v.name}：${v.req}`).join('、')},wm:()=>give('dev_polearm',3,0),curve:()=>{ui.testOut='<b>v4.07 難度曲線（中度）</b><br>各品質要強化到幾級（普通／精良／稀有／史詩／傳說），不算附魔<br>'+VILLAGES.map((v,i)=>{const d=diffRow(i);return `${vNo(i)} ${v.name}：需求 ${v.req}（曲線 ${d.curve}）・${d.b?d.b.n:'—'}・${d.need.map(n=>n==null?'✕':'+'+n).join('／')}`}).join('<br>')},odds:()=>{const w={b:'dev_sword'};ui.testOut='<b>v4.00 強化機率（安定值 +6）</b><br>'+[7,8,9,10,11,12,13,14,15].map(n=>{const r=RATE[n],b=breakChance(w,n);return `+${n}：成功 ${pct(r)}・失敗時爆裝 ${pct(b)}・單次爆裝 ${pct((1-r)*b)}`}).join('<br>')+'<br>2-3 雷鳴峽谷需求攻擊力 '+VILLAGES[12].req},wg6:()=>{give('dev_sword',2,6);toast('已給 +6 巨人王劍：下一次 +7 是危險區，前面 +1～+6 都不會爆裝','ok')},w8:()=>give('dev_polearm',3,8,[{k:'dragon',v:30},null,null,null]),wench:()=>{S.anvil=Math.max(S.anvil,5);give('dev_axe',3,6,[{k:'thunder',v:12},{k:'greed',v:15},{k:'harvest',v:25},{k:'giant',v:40}],[{k:'sturdy',v:20},{k:'runic',v:18},{k:'treasure',v:15}])},wench2:()=>{S.anvil=Math.max(S.anvil,5);give('dev_polearm',2,4,[{k:'holy',v:15},{k:'venom',v:12},{k:'seek',v:20},{k:'dragon',v:40}],[{k:'sharp',v:9}])},
   rmold:()=>{const a=makeWeapon('dev_axe',3,6,[{k:'light',v:20},{k:'runic',v:30}]);a.rf=5;ui.sheet={t:'w',id:a.id,m:'main'};toast('已放入：帶舊特性＋重鍊 Lv5 的龍首巨斧（應該看不到特性和重鍊）、一面舊龍鱗塔盾（道具欄看得到、鍛造頁沒有盾）','ok')},
   wt:()=>{['dev_sword','dev_hammer','dev_polearm'].forEach(b=>makeWeapon(b,4,0));toast('已放入 3 把傳說武器')},
   back:()=>{CLOCK.offset-=3600000;toast('模擬裝置時間倒退 1 小時')},fwd:()=>{CLOCK.offset=0;toast('裝置時間已恢復')},
   v2:()=>{const o={gold:999,gems:50,mats:{iron:5,oak:5,leather:5,silver:2,fang:1,scale:0,rune:0,shard:3},items:{scroll:2,bless:0,blueprint:0},furnace:2,anvil:1,slots:1,nextId:4,
     weapons:[{id:1,b:'dev_axe',q:1,lv:3,ench:[{k:'swift',v:8}]},{id:2,b:'dev_polearm',q:0,lv:2,ench:[]},{id:3,b:'dev_sword',q:2,lv:6,ench:[]}],jobs:[],
     villages:VILLAGES.map((v,i)=>({status:i<2?'cleared':i===2?'open':'locked',weaponId:i===0?1:i===1?2:null,cycleStart:i<2?NOW()-60000:null,pending:i===0?5:0})),monthly:{until:0,last:''}};
     S=sanitize(migrateV2(o));S.villages.forEach((st,i)=>{const n=st._pending||0;delete st._pending;const w=st.weaponId!=null&&W(st.weaponId);for(let c=0;c<n;c++)rollCycle(i,w,st)});ui.sheet=null;toast('已載入 v2 測試存檔並遷移成 v3（1-1 累積 5 輪）')},
   dq_all:()=>{dailyRoll();const b=S.daily.b;b.harvest=S.stats.harvest-5;b.forged=forgedN()-3;b.enhTry=S.stats.enhTry-5;b.melted=S.stats.melted-1;toast('今天的每日任務已全部達成，活躍度 100')},
   dq_reset:()=>{S.daily=null;dailyRoll();toast('每日任務已重置（像剛換日）')},
   sg_reset:()=>{S.sign.last='';toast('今天可以再簽到一次')},shopcard:()=>{S.gold+=5000;ui.sheet=null;ui.tab='shop';ui.shopN=1;shopMatCard('pine');toast('連按數量和購買，小卡不應該重新跳出')},shopsg:()=>{S.sign.last='';ui.sheet=null;ui.tab='shop';render();scrollTo(0,0);toast('商城的簽到應該可以領、商城分頁亮紅點')},shopbroke:()=>{S.gold=0;S.gems=0;ui.sheet=null;ui.tab='shop';render();toast('材料的購買按鈕應該全部變暗')},sg_d7:()=>{S.sign.n=6;S.sign.last='';toast('下一次簽到是第 7 天')},
   nw_open:()=>{ui.sheet={t:'set'};toast('齒輪設定已打開：有 NEW 時齒輪會亮紅點')},
   nw_new1:()=>{nwInit();const n=NW_LOG[0];S.nwSeen=S.nwSeen.filter(v=>v!==n.v);for(const k of n.g)delete S.glSeen[k];ui.sheet=null;toast(`v${n.v} 公告和它改到的玩法變成 NEW：齒輪應該亮紅點`,'ok')},
   nw_all:()=>{S.nwSeen=[];S.glSeen={};ui.sheet=null;toast(`公告 ${NW_LOG.length} 則、玩法 ${GUIDE_ALL.length} 項全部變 NEW`,'ok')},
   nw_seen:()=>{S.nwSeen=NW_LOG.map(n=>n.v);S.glSeen=Object.fromEntries(GUIDE_ALL.map(g=>[g.k,g.v]));ui.sheet=null;toast('全部標成已讀：齒輪紅點應該消失','ok')},
   news_ok:()=>{newsShow({nick:S.nick||'測試鐵匠',bp:'dev_sword',lv:12,ok:true});toast('跑馬燈應該出現一則 +12 成功公告')},
   news_brk:()=>{newsShow({nick:S.nick||'測試鐵匠',bp:'dev_polearm',lv:11,ok:false});toast('跑馬燈應該出現一則爆裝公告')},
   qopen:()=>{ui.qTab='d';ui.sheet={t:'a'};ui.tab='village'},
   achall:()=>{S.stats.harvest=Math.max(S.stats.harvest,300);S.stats.enhOk=Math.max(S.stats.enhOk,50);S.stats.melted=Math.max(S.stats.melted,30);S.stats.forged[0]+=50},
   testw:()=>{const bp=['dev_sword','dev_sword','dev_sword','dev_sword'][ui.devTier??0];const w=makeWeapon(bp,ui.devTier===3?3:2,ui.devLv??0,[]);w.test=true;ui.enhLast=null;ui.riskArm=ui.riskOk=null;ui.sheet={t:'w',id:w.id,m:'enh'};toast('已送出測試武器')},
   stone50:()=>S.items[STONE]=stones()+50,stone0:()=>S.items[STONE]=0,
   stonereal:()=>{const bp=BPS.find(x=>x.cat==='sword');if(!bp)return toast('沒有劍的圖紙（開發者模式才有測試圖紙）','bad');const w=makeWeapon(bp.id,0,6,[]);S.items[STONE]=Math.max(stones(),20);ui.sheet={t:'w',id:w.id,m:'enh'};toast('真的 +6 劍：強化會用掉強化石，+7 起失敗就爆裝','ok')},
   dropbox7:()=>{S.villages.forEach((v,i)=>{if(i<7&&v.status==='locked')v.status='open'});ui.tab='village';ui.realm=0;ui.sheet={t:'v',i:6};render()},
   dropbox20:()=>{S.villages.forEach((v,i)=>{if(i<20&&v.status==='locked')v.status='open'});ui.tab='village';ui.realm=1;ui.sheet={t:'v',i:19};render()},
   goldtab:()=>{ui.testOut='<b>每隻金幣（每小時約 75 隻）</b><br>'+VILLAGES.map((v,i)=>`${vNo(i)} ${killGoldTxt(i)}・平均 ${vKillGold(i)}・約 ${fmt(vKillGold(i)*75)}／小時`).join('<br>')},
   wdropsim:()=>{const out=[0,6,9,19].map(i=>{const st={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};for(let c=0;c<10000;c++)rollCycle(i,null,st,NOW());const ws=Object.entries(st.bank.mats).filter(([k])=>k.startsWith('w:')).map(([k,n])=>itemName(k)+' '+n).join('、')||'沒有';return `<b>${vNo(i)}</b> 每隻金幣 ${killGoldTxt(i)}（平均 ${fmt(Math.round(st.bank.gold/10000))}）・武器：${ws}`});ui.testOut='<div><b>打倒 10,000 隻</b>（約 133 小時）</div>'+out.join('<br>')},
   cxgive:()=>{cxBps().forEach(b=>CX_LV.forEach(L=>makeWeapon(b.id,0,L)));save();ui.sheet=null;ui.tab='armory';ui.atab='c';ui.cxs='w';scrollTo(0,0);toast(`已給 ${cxBps().length*3} 把武器：圖鑑格子應該都發亮`,'ok')},
   cxmost:()=>{S.codex={};cxBps().forEach(b=>S.codex[b.id]=[1,1,b.id==='g_skadi'?0:1]);CX_MEMO=null;save();ui.sheet=null;ui.tab='armory';ui.atab='c';ui.cxs='s';scrollTo(0,0);toast(`圖鑑加成 +${cxPct()}%（只差索爾之錘 +9）`,'ok')},
   cxreset:()=>{S.codex={};CX_MEMO=null;save();toast('圖鑑已清空','ok')},
   wdrop1:()=>{const st=S.villages[0];st.bank.cycles=Math.max(1,st.bank.cycles);['w:w0_axe','w:w0_bow','w:'+(BP.w1_spear?'w1_spear':'w0_sword')].forEach(k=>st.bank.mats[k]=(st.bank.mats[k]||0)+1);toast('1-1 收成裡多了 3 把武器，按「全部收成」看');ui.tab='village';ui.realm=0},
   stonedrop:()=>{const out=[0,9,19].map(i=>{const st={strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}};for(let c=0;c<1000;c++)rollCycle(i,null,st,NOW());return vNo(i)+' '+(st.bank.mats[STONE]|0)+' 顆'});ui.testOut='<div><b>打倒 1000 隻掉的強化石</b>（每隻機率 '+[0,9,19].map(i=>(stoneE(i)*100).toFixed(2)+'%').join('／')+'）</div><div>'+out.join('、')+'</div>'},
   allw:()=>devAllWeapons(BPS.map(b=>b.id)),wpntest:()=>{S.weapons=S.weapons.filter(w=>!w.test||where(w)>=0);let f=null;for(const c of Object.keys(CSPD)){const b=BPS.find(x=>x.cat===c);if(!b)continue;const w=makeWeapon(b.id,0,6,[]);w.test=true;f=f||w}
    if(!f)return toast('目前沒有可用的圖紙');ui.tab='armory';ui.acat='all';ui.ast='test';ui.sheet={t:'w',id:f.id,m:'main'};render();toast('已產生七類 +6 測試武器，詳情頁看攻速、單擊、附加效果、相剋')},flvtest:()=>{S.weapons=S.weapons.filter(w=>!w.test||where(w)>=0);[12,11,10,9,8,7,6,1,0].forEach(lv=>{const w=makeWeapon('dev_sword',0,lv,[]);w.test=true});ui.sheet=null;ui.tab='armory';ui.acat='all';ui.aq='all';ui.ast='test';ui.asort='lv';render();scrollTo(0,0);toast('已產生 +0～+12 測試武器：灰、綠、藍、紅、金、紫、鑽石框')},
   cleartest:()=>{const n=S.weapons.filter(w=>w.test&&where(w)<0).length;S.weapons=S.weapons.filter(w=>!w.test||where(w)>=0);toast('已清除 '+n+' 把測試武器')},
   daily:()=>S.monthly.last='',fill:()=>{while(S.weapons.length<195)makeWeapon('dev_axe',0,0,[]);toast('道具欄已塞到 195 把，試試容量上限')},
   reset:()=>{if(!ui.confirmReset){ui.confirmReset=true;return}S=fresh();ui.confirmReset=false;ui.sheet=null;toast('存檔已重置。')}})[k]();
  if(k!=='reset')ui.confirmReset=false;tick();save();if(k==='testw')ui._lastSheet=null;render();
}

// v3.67 分頁美術預熱：各分頁會用到的圖先下載＋解碼並留在記憶體，切換分頁時不用再等（iPhone 主畫面 App 常晚 1 秒才出圖）
let HERO_KEEP=null;const WARM=new Map();
function warmArt(html){(String(html).match(/art\/[\w\/.-]+?\.(?:webp|png)(?:\?v=\d+)?/g)||[]).forEach(u=>{if(WARM.has(u)||WARM.size>=400)return;const im=new Image();im.src=u;WARM.set(u,im);if(im.decode)im.decode().catch(()=>{})})}
let WARM_T=0;function warmTabs(){clearTimeout(WARM_T);WARM_T=setTimeout(()=>{if(QUIET)return;const ft=ui.ftab;
  [['bp'],['mat']].forEach(([f])=>{ui.ftab=f;try{warmArt(viewForge())}catch(e){}});ui.ftab=ft;
  [viewArmory,viewVillage,viewShop].forEach(f=>{try{warmArt(f())}catch(e){}});warmArt('art/dp/fog_band.webp art/bg_forge.webp')},400)}
function render(){
  if(QUIET)return;if(ui.nwOn&&!(ui.sheet&&ui.sheet.t==='set'&&ui.sheet.k==='n')){ui.nwOn=false;nwMarkAll()}   // v4.03 離開更新公告頁才把 NEW 消掉
  renderRes();renderNav();
  const hs=[...document.querySelectorAll('#view .hscroll,#view .catbar')].map(e=>e.scrollLeft);   // 保留橫向捲動位置（點圖紙不會跳回最前面）
  const V=document.getElementById('view'),y=scrollY,html=({forge:viewForge,armory:viewArmory,village:viewVillage,shop:viewShop,market:viewMarketPage})[ui.tab]();
  // v3.67 離開鐵匠鋪時把上方 hero（大背景、鐵匠、道具圖）整塊收起來，回來直接放回去，不用重新載入和解碼圖片
  let oldHero=V.querySelector(':scope > section.hero');if(oldHero&&ui.tab!=='forge'){HERO_KEEP=oldHero;oldHero.remove();oldHero=null}
  else if(!oldHero&&ui.tab==='forge'&&HERO_KEEP){V.prepend(HERO_KEEP);oldHero=HERO_KEEP;HERO_KEEP=null}
  // v3.26 鐵匠鋪上方區塊整塊留在原地（搬動節點也會讓動畫重跑），只更新裡面的委託橫條、工具列等
  let kept=false;if(oldHero){const T=document.createElement('div');T.innerHTML=html;const nh=T.querySelector(':scope > section.hero');
    if(nh){kept=true;oldHero.className=nh.className;[...oldHero.children].forEach(c=>{if(!c.matches('.dp,.smith'))c.remove()});[...nh.children].forEach(c=>{if(!c.matches('.dp,.smith'))oldHero.appendChild(c)});
      [...V.childNodes].forEach(c=>{if(c!==oldHero)c.remove()});let before=true;[...T.childNodes].forEach(c=>{if(c===nh){before=false;return}before?V.insertBefore(c,oldHero):V.appendChild(c)})}}
  if(!kept)V.innerHTML=html;
  if(ui.tab==='armory'){const b=document.querySelector('.bar');if(b)document.documentElement.style.setProperty('--barh',b.offsetHeight+'px')}   // v3.61 道具欄分類列貼在上方資源列下面
  document.body.classList.toggle('bpc',!!V.querySelector(':scope > section.hero.ft-bp.fv-1,:scope > section.hero.ft-bp.fv-2'));   // v3.56 取代 CSS :has()（:has 掛在 body 上，每次 DOM 變動都要整頁重算）
  if(Math.abs(scrollY-y)>2)scrollTo(0,y); // 切換篩選時保持捲動位置
  {const els=[...document.querySelectorAll('#view .hscroll,#view .catbar')];if(els.length===hs.length)els.forEach((e,i)=>e.scrollLeft=hs[i])}
  if(!ui.busy)renderLayer();updateLive();fitNames();chatBarPaint();
}
// 武器名稱過長時逐步縮小字級（最小 11px），讓 +N 與完整名稱都顯示，不用「…」截斷
// v3.56 效能：先全部讀、再全部寫（舊版每個名稱各自觸發好幾次版面重算，道具欄一多就卡）
function fitNames(){const els=[...document.querySelectorAll('.wt-name')];if(!els.length)return;els.forEach(el=>{if(el.style.fontSize)el.style.fontSize=''});
  const m=els.map(el=>el.scrollWidth>el.clientWidth+.5?[el,el.clientWidth/el.scrollWidth]:null).filter(Boolean);if(!m.length)return;
  const base=parseFloat(getComputedStyle(m[0][0]).fontSize)||14;m.forEach(([el,r])=>{el.style.fontSize=Math.max(11,Math.floor(base*r*2)/2)+'px'});
  m.forEach(([el])=>{let f=parseFloat(el.style.fontSize);if(el.scrollWidth>el.clientWidth+.5&&f>11)el.style.fontSize=Math.max(11,f-1)+'px'})}
if(typeof window!=='undefined')window.addEventListener('resize',()=>fitNames());
function renderLayer(){stkFollow();
  const L=document.getElementById('layer');const s=ui.sheet;let h='';
  const sc=document.querySelector('.sheet'),st=sc?sc.scrollTop:0,same=sc&&ui._lastSheet===JSON.stringify(s);
  if(s){const pop=s.t==='w'&&((s.m==='main'||s.m==='ench')&&!!W(s.id)||s.m==='enh'),full=!pop&&(s.t==='w'||s.t==='fxt');h+=`<div class="scrim ${pop?'wpopc':''} ${same?'still':''}" data-act="scrim"><div class="ui-sheet sheet ${full?'full':''} ${pop?'wpop':''} ${s.t==='chat'?'cx-sheet':''} ${same?'still':''}">${s.t==='w'?sheetWeapon(s.id,s.m):s.t==='v'?sheetVillage(s.i):s.t==='ch'&&ui.ch?sheetCh():s.t==='chr'&&ui.chr?sheetChr():s.t==='a'?sheetAch():s.t==='fk'?sheetFk(s.i):s.t==='lb'?sheetLb(s.i):s.t==='lbw'?sheetLbW(s.i,s.k):s.t==='ws'?sheetWorkshop(s.k):s.t==='evt'?sheetEvt():s.t==='chat'?sheetChat():s.t==='gd'?sheetGuild():s.t==='fr'?sheetFriend():s.t==='bw'?sheetBossW(s.r,s.j):s.t==='fxt'?sheetFxTest(s):s.t==='set'?sheetSet(s.k):/^mk/.test(s.t)?sheetMk(s):sheetDev()}</div></div>`}
  const r=ui.result;
  if(r&&r.t==='h')h+=`<div class="modal" data-act="rclose"><div class="ui-modal modal-card">${ptitle(r.title)}${r.ev?`<div class="small t-danger center">其中 ${r.ev} 輪受襲：沒有材料、金幣減半</div>`:''}<div class="hgrid">${harvestIcons(r.got)}</div>${btn('確定','rclose',{cls:'btn-primary big'})}</div></div>`;
  if(r&&r.t==='info')h+=`<div class="modal" data-act="rclose"><div class="ui-modal modal-card">${r.ico?`<div class="info-ico">${r.ico}</div>`:r.icon?`<div class="info-ico">${img(r.icon)}</div>`:''}${ptitle(r.title)}<div class="info-body">${r.html}</div>${r.acts||''}${btn(r.ok||'知道了','rclose',{cls:r.ok?'btn-sec big':'btn-primary big'})}</div></div>`;
  {const rk=r?JSON.stringify([r.t,r.title,r.html]):'';if(r&&rk===ui._lastRes)h=h.replace('<div class="ui-modal modal-card">','<div class="ui-modal modal-card still">');ui._lastRes=rk}   // v4.74 小卡內容沒變就不重播彈出動畫（每 250ms 的 render 會讓小卡像一直重新打開）
  const fa=document.activeElement,fid=fa&&fa.id&&L.contains(fa)?fa.id:null,cxl=document.getElementById('cxList'),cxs=cxl?cxl.scrollTop:null;   // v3.88 重畫時保留聊天輸入框焦點與訊息捲動位置
  L.innerHTML=h;ui._lastSheet=JSON.stringify(s);{const n=fid&&document.getElementById(fid);if(n)n.focus({preventScroll:true});const c=document.getElementById('cxList');if(c)c.scrollTop=cxs==null?c.scrollHeight:cxs}document.documentElement.classList.toggle('scrimmed',!!s);
  if(same){const n=document.querySelector('.sheet');if(n)n.scrollTop=st};fitNames()
}
function updateLive(){
  if(QUIET)return;const t=NOW();renderRes();chTick();
  S.villages.forEach((st,i)=>{const w=st.weaponId!=null&&W(st.weaponId);if(!w)return;const d=dur(i,w),full=st.bank.cycles>=capCycles(i,w),el=Math.max(0,t-st.cycleStart);
    monPaint(i,monFx(i,st,w,full,d,el));   // v4.01 怪物血量只在打中時扣（見 monFx）
    document.querySelectorAll(`[data-vtime="${i}"]`).forEach(e=>e.textContent=full?'倉庫已滿，請收成':S.clockWarn?'時間倒退，暫停中':'剩 '+fmtT(d-el));
    document.querySelectorAll(`[data-vclock="${i}"]`).forEach(e=>e.innerHTML=full?'':`剩 ${clock(d-el,d)}`);
    document.querySelectorAll(`[data-vpend="${i}"]`).forEach(e=>e.textContent=st.bank.cycles)});
  S.jobs.forEach((j,n)=>{document.querySelectorAll(`[data-jprog="${n}"]`).forEach(e=>e.style.width=Math.max(0,Math.min(100,(t-j.start)/(j.end-j.start)*100))+'%');
    document.querySelectorAll(`[data-jtime="${n}"]`).forEach(e=>e.textContent=t>=j.end?'完成':'剩 '+fmtT(j.end-t))});
}
function toast(html,kind){if(QUIET)return;if(kind==='bad')snd('ui_error');const box=document.getElementById('toasts');if(!box)return;const d=document.createElement('div');d.className='ui-toast toast '+(kind||'');d.innerHTML=html;box.appendChild(d);setTimeout(()=>d.remove(),2600);while(box.children.length>2)box.firstChild.remove()}

function bindUI(){
['pointerdown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{sfxPreload()},{passive:true,once:false}));
['touchend','click'].forEach(ev=>document.addEventListener(ev,()=>{if(ACX)sfxWake()},{passive:true,capture:true}));
const sfxAway=m=>{if(ACX){ACX_DIRTY=true;sfxLog(m)}};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')sfxAway('切到背景');else sfxLog('回到前景')});
window.addEventListener('pagehide',()=>sfxAway('離開頁面'));window.addEventListener('blur',()=>sfxAway('失去焦點'));
window.addEventListener('pageshow',e=>{if(e.persisted)sfxAway('從快取回來')});
const uiSndOf=a=>a==='tab'||a==='ftab'||a==='cat'||a==='acat'?'ui_tab':['close','scrim','rclose','backArmory'].includes(a)?'ui_close':['wopen','vopen','sheetW','sheetM','sheetT','evtopen','dev','set','achopen','wmode','player'].includes(a)?'ui_open':'ui_click';
let PD_SND=0;
// v3.25 橫向捲動列（圖紙、分類）在 iPhone 上：慣性滑動中的第一下、或手指微晃，系統會把點擊吃掉 → 自己判斷「點一下」
let TAP0=null,TAP_EL=null,TAP_T=0,TAP_XY=[0,0];
const TAP_SEL='.hscroll [data-act],.catbar [data-act],#nav [data-act],#res [data-act]';
document.addEventListener('touchstart',e=>{const b=e.target.closest(TAP_SEL);const t=e.touches[0];TAP0=b&&e.touches.length===1?{b,x:t.clientX,y:t.clientY,t:Date.now()}:null},{passive:true,capture:true});
document.addEventListener('touchend',e=>{const o=TAP0;TAP0=null;if(!o||o.b.disabled||!o.b.isConnected)return;const t=e.changedTouches[0];
  if(Math.abs(t.clientX-o.x)<12&&Math.abs(t.clientY-o.y)<12&&Date.now()-o.t<600){if(e.cancelable)e.preventDefault();TAP_EL=o.b;TAP_T=Date.now();TAP_XY=[t.clientX,t.clientY];o.b.click()}},{passive:false,capture:true});
// v3.23 手指按住按鈕的期間暫停定時重畫，避免按鈕在按下與放開之間被換掉而吃掉點擊（需要按兩次的原因）
document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-act],button,input,select,label'))PTR_DOWN=true},{passive:true,capture:true});
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>{if(!PTR_DOWN)return;setTimeout(()=>{PTR_DOWN=false;if(PTR_PEND){PTR_PEND=false;render()}},60)},{passive:true,capture:true}));   // 介面音效在手指按下的瞬間就播放，不等放開
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act;if(['enhance','fxskip','devdo','mute','sndtest','sndfix','sfxalt','scrim','sndvol'].includes(a)||b.closest('.hscroll,.catbar')||(a==='rclose'&&e.target!==b))return;snd(uiSndOf(a));PD_SND=Date.now()},{passive:true});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;if(e.isTrusted&&TAP_EL&&Date.now()-TAP_T<700&&(b===TAP_EL||Math.abs(e.clientX-TAP_XY[0])<30&&Math.abs(e.clientY-TAP_XY[1])<30))return;const a=b.dataset.act,d=b.dataset;sfxPreload();
  if(!['enhance','fxskip','devdo','mute','sndtest','sndfix','sfxalt'].includes(a)&&Date.now()-PD_SND>700)snd(uiSndOf(a));
  if((a==='scrim'||a==='rclose')&&e.target!==b&&!e.target.matches('button'))return;
  if(a!=='melt')ui.meltArm=null;
  ({tab:()=>{if(ui.busy&&ui.fxDone)ui.fxDone();ui.pickV=null;if(ui.tab==='armory'&&d.k!=='armory'&&S.weapons.some(wNew)){S.seenW=S.nextId-1;save()}if(d.k==='market'&&S.mkNew){S.mkNew=0;save()}ui.tab=d.k;if(d.k==='market'&&(AUTH||mkMock())&&Date.now()-MK.t>20000)setTimeout(mkLoad,0);ui.sheet=null;ui.enhLast=null;render();warmTabs();d.k==='village'?scrollToNextVillage():scrollTo(0,0)},close:()=>{if(ui.busy)return;ui.sheet=null;ui.enhLast=null;ui.riskArm=null;ui.riskOk=null;render()},scrim:()=>{if(ui.busy||ui.ch)return;ui.sheet=null;ui.enhLast=null;render()},dev:()=>{ui.sheet={t:'d'};render()},achopen:()=>{ui.qTab=boxReadyN()||!achReadyN()?'d':'o';ui.sheet={t:'a'};render()},
   set:()=>{ui.result=null;ui.sheet={t:'set'};render()},setk:()=>{ui.sheet={t:'set',k:d.k||null};ui.glOpen=null;render();const sc=document.querySelector('.sheet');if(sc)sc.scrollTop=0},
   nwtog:()=>{ui.nwOpen=ui.nwOpen===d.k?null:d.k;render()},gltog:()=>{ui.glOpen=ui.glOpen===d.k?null:d.k;if(ui.glOpen)glMark(d.k);render()},
   sheetW:()=>{ui.sheet={t:'ws',k:'w'};render()},sheetM:()=>{ui.sheet={t:'ws',k:'m'};render()},sheetT:()=>{ui.sheet={t:'ws',k:'t'};render()},evtopen:()=>{if(BOSS_OFF)return;ui.sheet={t:'evt'};render()},bossw:()=>{ui.sheet={t:'bw',r:+d.r,j:+d.j};render()},
   chatopen:()=>chatOpenSheet(),chattab:()=>{CHAT.tab=d.k;CHAT.pick=false;if(d.k==='s')CHAT.sysUnread=0;else if(d.k==='g')CHAT.gunread=0;else CHAT.unread=0;render();const L=document.getElementById('cxList');if(L)L.scrollTop=L.scrollHeight;if(chatOn())chatFetch(true)},
   chatq:()=>{const el=document.getElementById('cxIn');if(!el)return;const v=(el.value+(el.value&&!/\s$/.test(el.value)?' ':'')+d.k);el.value=Array.from(v).slice(0,CHAT_MAX).join('');CHAT.draft=el.value;el.focus()},chatsend:()=>chatSend(),cheer:()=>cheerAdd(+d.id),chatsys:()=>{if(chatOn()||chatMock())chatOpenSheet('s')},chatpick:()=>{CHAT.pick=!CHAT.pick;chatPaint(!CHAT.pick);const L=document.getElementById('cxList');if(L&&CHAT.pick)L.scrollTop=0;const b=document.querySelector('.cx-wb');if(b){b.textContent=CHAT.pick?'取消':'武器';b.classList.toggle('on',CHAT.pick)}},chatsendw:()=>chatSend(+d.id),
   chatw:()=>{const x=[...CHAT.rows,...CHAT.g].find(r=>r.id===+d.m);if(!x||!x.w||!BP[bpId(x.w.b)])return;ui.result={t:'info',title:x.mine?'我的武器':`${esc(x.nick)}的武器`,html:mkWeaponBox(x.w)};render()},
   pctitle:()=>{S.title=S.title===d.k?null:d.k;save();CLOUD.dirty=true;toast(S.title?`已戴上「${TITLES.find(t=>t.k===d.k).n}」，下一則聊天開始顯示`:'已卸下稱號');if(PC.d){PC.d.title=S.title}pcShow()},
   gdopen:()=>gdOpen(),gdtab:()=>{GD.tab=d.k;GD.arm=null;ui.sheet={t:'gd',k:d.k};render()},gdjm:()=>{GD.join=d.k;render()},gdnj:()=>{GD.noteJoin=d.k;render()},gdmk:()=>{GD.mk=true;render()},gdmk0:()=>{GD.mk=false;render()},gdmk2:()=>gdCreate(),
   gdfind:()=>{GD.list=null;render();gdLoad()},gdjoin:()=>gdJoin(+d.id),gdunap:()=>gdUnapply(+d.id),gdleave:()=>gdLeave(),gded:()=>{const g=GD.d&&GD.d.g;if(!g)return;GD.edit=true;GD.note=g.notice||'';GD.noteJoin=g.join;render()},gded0:()=>{GD.edit=false;render()},gdset:()=>gdSet(),
   gdapp:()=>gdAppAns(d.u,d.k==='1'),gddon:()=>gdDonate(d.k),gdshop:()=>gdShop(d.k),gdchat:()=>chatOpenSheet('g'),gdmem:()=>gdMemAct(d.u,d.k),
   fropen:()=>frOpen(),frtab:()=>{FR.tab=d.k;ui.sheet={t:'fr',k:d.k};render()},frfind:()=>frFind(),fradd:()=>frAdd(d.u),frans:()=>frAns(d.u,d.k==='1'),frdel:()=>frDel(d.u),
   pcard:()=>{if(!d.u)return;pcOpen(d.u,d.n,d.m)},pclike:()=>pcLike(),pcblock:()=>pcBlock(),pcreport:()=>pcReport(),pcmute:()=>pcAdmin('chat_mute',{p_uid:PC.u,p_hours:+d.h}),pchide:()=>pcAdmin('chat_hide',{p_id:+PC.m}),
   cbarset:()=>{S.chatBar=S.chatBar===false;save();chatBarPaint();showLevel()},cblun:()=>{const L=chatBlk(),i=L.findIndex(x=>x.u===d.u);if(i>=0)L.splice(i,1);save();chatPaint();showLevel()},
   bossgift:()=>{const g=bossClaimStages();if(!g)return toast('現在還不能領','bad');snd('unlock');toast('全服獎勵：'+giftTxt(g),'ok');render()},
   bossrank:()=>{const r=bossClaimRank();if(!r)return toast('現在還不能領','bad');snd('unlock');toast(`上週排名第 ${r.g.rank} 名：`+giftTxt(r.gift),'ok');render()},
   bosspost:async()=>{if(ui.bossBusy)return;ui.bossBusy=true;let r;try{r=AUTH?await bossPostCloud(+d.id):bossPostCore(+d.id)}finally{ui.bossBusy=false}if(r.err){render();return toast(r.err,'bad')}snd(r.weak?'enh_ok':'deliver');toast(`已派去討伐 ${evtNow().boss.n}，每小時 <b>${fmt(r.pw)}</b> 傷害${r.weak?'（打中弱點！）':''}${r.vi>=0?`<br>已從 ${vNo(r.vi)} 收回`:''}`,'ok');render()},
   bossout:async()=>{if(ui.bossBusy)return;ui.bossBusy=true;let r;try{r=AUTH?await bossUnpostCloud(+d.s):bossUnpostCore(+d.s)}finally{ui.bossBusy=false}if(!r)return render();if(r.err)return toast(r.err,'bad');snd('deliver');toast(`已收回，這把武器這次打了 <b>${fmt(r.dmg)}</b> 傷害`,'ok');render()},
   talup:()=>{const e=talentUp(d.k);if(e)return toast(e,'bad');snd('upgrade');render()},
   devdo:()=>{ui.devLast=d.k;ui.testOut='';devdo(d.k)},speed:()=>{tick();const t=NOW(),old=S.speed,nw=+d.k;
     S.villages.forEach(st=>{if(st.cycleStart!=null)st.cycleStart=t-(t-st.cycleStart)*old/nw});S.jobs.forEach(j=>{j.start=t-(t-j.start)*old/nw;j.end=t+(j.end-t)*old/nw});S.speed=nw;save();render()},
   cap:()=>{S.capH=+d.k;save();render()},ftab:()=>{ui.tab='forge';ui.ftab=d.k;ui.sheet=null;render()},atab:()=>{ui.tab='armory';ui.atab=d.k;ui.sheet=null;scrollTo(0,0);render()},cat:()=>{ui.cat=d.k;render()},acat:()=>{ui.acat=d.k;render()},
   aidle:()=>{ui.aidle=!ui.aidle;render()},alock:()=>{ui.alock=!ui.alock;render()},bp:()=>{ui.bp=d.k;ui.qty=1;if(!bpSeen().includes(d.k)){S.bpSeen.push(d.k);save()}render();bpReveal()},qty:()=>{ui.qty=Math.max(1,Math.min(10,+d.k));render()},forge:startForge,
   cancelJob:()=>{if(cancelJob(+d.i))toast('已取消，材料與金幣全額退回。');render()},
   cxsub:()=>{ui.cxs=d.k;render()},cxreg:()=>cxAsk(d.k,+d.j),cxdo:()=>{const r=cxRegCore(d.k,+d.j);ui.result=null;if(r.err){toast(r.err,'bad');return render()}snd('enh_ok');toast(`登錄完成：所有武器攻擊力 +${CX_V[+d.j]}%`+r.sets.map(x=>`<br>套裝「${x.n}」湊齊！再 +${x.v}%`).join(''),'good');render()},
   wopen:()=>{ui.sheet={t:'w',id:+d.id,m:'main'};render()},wmode:()=>{if(ui.busy)return;ui.enhLast=null;ui.riskArm=null;ui.riskOk=null;ui.sheet={t:'w',id:+d.id,m:d.m};render()},vopen:()=>{ui.sheet={t:'v',i:+d.i};render()},chmode:()=>{ui.sheet={t:'v',i:+d.i,ch:1};render()},chgo:()=>chStart(+d.i,+d.id),chstay:()=>{ui.sheet=null;ui.chr=null;deliver(+d.i,+d.id)},bsopen:()=>{ui.bsOpen=+d.i;render()},bsclose:()=>{ui.bsOpen=null;render()},vswap:()=>{ui.pickV=+d.i;ui.sheet=null;ui.tab='armory';render();scrollTo(0,0)},vpick:()=>{const i=+d.i;ui.pickV=null;ui.tab='village';deliver(i,+d.id)},vpickx:()=>{const i=ui.pickV;ui.pickV=null;ui.tab='village';ui.sheet=i!=null?{t:'v',i}:null;render()},
   lock:()=>{const w=W(+d.id);if(w){w.lock=!w.lock;save();toast(w.lock?'已鎖定，這把武器不會被熔解，也不會被登錄圖鑑。':'已取消鎖定。')}render()},eslot:()=>{ui.enchSlot=+d.k;render()},
   collect:()=>{tick();collect(+d.i);render()},collectAll,deliver:()=>deliver(+d.i,+d.id),recall:()=>recall(+d.i),strat:()=>{if(setStrategy(+d.i,d.k))toast('已切換為「'+STRATS[d.k].n+'」');render()},
   melt:()=>{const id=+d.id;if(ui.meltArm!==id){ui.meltArm=id;return render()}ui.meltArm=null;const g=meltCore(id);if(g){snd('melt');toast('熔解完成：'+gotText(g),'ok');ui.sheet=null}render()},meltCheap,
   enhance:()=>enhance(+d.id),achv:()=>{ui.achV=d.k;render()},lbw:()=>{ui.sheet={t:'lbw',i:+d.i,k:+d.k};render()},fkopen:()=>{ui.sheet={t:'fk',i:+d.i};render();const L=document.querySelector('.lb-tab.on');if(L)L.scrollIntoView({block:'nearest',inline:'center'})},realm:()=>{const k=+d.k;if(k<0||k>1)return;if(k===1&&!rfOpen())return toast(`收復 ${vNo(9)} ${VILLAGES[9].name}後開放約頓海姆`);ui.realm=k;render();scrollTo(0,0)},lbopen:()=>{if(LB_OFF)return;ui.sheet={t:'lb',i:+(d.i??S.villages.findIndex(v=>v.status!=='cleared')-1)};render()},achtab:()=>{ui.achTab=d.k;render()},qtab:()=>{ui.qTab=d.k;render()},qbox:()=>{const r=claimBox(+d.i);if(r){snd('coin');toast('活躍度寶箱：'+rwText(r),'ok')}render()},qsign:()=>{const r=claimSign();if(r){snd('coin');toast('簽到獎勵：'+rwText(r),'ok')}render()},achAll:claimAllAch,autoEnh:()=>autoEnhance(+d.id),enchant:()=>{const w=W(+d.id),e=w&&elemOf(w);if(e&&e.t>=3&&!(ui.enchArm&&ui.enchArm.id===+d.id&&ui.enchArm.s===ui.sheet)){ui.enchArm={id:+d.id,s:ui.sheet};snd('enh_warn');return render()}ui.enchArm=null;enchant(+d.id,+d.s)},
   ach:()=>{if(claimAch(d.k))toast('成就獎勵已領取','ok');render()},rclose:()=>{ui.result=null;render()},
   fxskip:()=>{ui.fxDone&&ui.fxDone()},fxclose:()=>{ui.busy=false;render()},backArmory:()=>{ui.sheet=null;ui.enhLast=null;ui.tab='armory';render()},
   uiskinp2:()=>p2Toggle(),
   affinfo:()=>{ui.result=Object.assign({t:'info'},affInfo(d.k));render()},
   sfxalt:()=>{sfxSetAlt(d.k,d.v);const was=S.mute;S.mute=false;setTimeout(()=>{d.k==='enh_spoke'?[0,1,2,3].forEach(i=>setTimeout(()=>snd('enh_spoke',.85+i*.09),i*250)):snd(d.k);S.mute=was},250);render()},
   sndtest:()=>{const was=S.mute;S.mute=false;if(d.k==='_spokes'){for(let i=0;i<8;i++)setTimeout(()=>snd('enh_spoke',.85+i*.09),i*250)}else snd(d.k);S.mute=was},
   herov:()=>{ui.heroV=d.k;render()},villv:()=>{ui.villV=d.k;render()},villtab:()=>{ui.villTab=d.k;render()},mondex:()=>{if(ui.sheet)ui.sheet.m=+d.k;render()},achv2:()=>{ui.achV2=d.k;render()},forgev:()=>{ui.forgeV=d.k;render()},achgrp:()=>{ui.achOpen=ui.achOpen===d.k?null:d.k;render()},enhv:()=>{ui.enhV=d.k;render()},enchv:()=>{ui.enchV=d.k;render()},enchmode:()=>{ui.enchMode=d.k;render()},
   uidpv:()=>{const on=document.body.classList.toggle('dpv');try{localStorage.setItem('nrs-dpv',on?'1':'0')}catch(e){}render()},
   uifpv:()=>{document.body.classList.toggle('fpv');render()},
   uiskintest:()=>{if(UI_SKIN['btn-primary']&&UI_SKIN['btn-primary']._test){UI_SKIN['btn-primary']=null}else{UI_SKIN['btn-primary']={src:'art/ui_btn_wood.webp',slice:[40,70,40,70],border:[12,24,12,24],css:'padding:2px 10px',_test:true}}applySkin();render()},
   devoff:()=>setDev(false),mute:()=>sndSettings(),sndfix:()=>{sfxWake(true);const was=S.mute;S.mute=false;snd('coin');S.mute=was;toast(was?'音效已重新啟動（目前音效是關閉的）':'音效已重新啟動')},sndmute:()=>{S.mute=!S.mute;save();if(!S.mute)snd('ui_click');sndSettings()},devset:()=>{ui[d.k]=+d.v;render()},devsets:()=>{ui[d.k]=d.v;render()},noItem:()=>{ui[d.k]=false;ui.riskArm=null;render()},devforce:()=>{DEV.force=d.k||null;toast(DEV.force?'下一次強化測試武器時會套用指定結果':'已取消指定');render()},vforge:()=>{const b=BP[d.k];if(!b)return;const l=bpLock(b);ui.sheet=null;ui.tab='forge';ui.ftab='bp';ui.cat=b.cat;ui.bp=b.id;ui.qty=1;render();const t=document.querySelector(`#view [data-act="bp"][data-k="${b.id}"]`);scrollTo(0,t?t.getBoundingClientRect().top+scrollY-140:0);for(const e of [document.querySelector('#view [data-act="cat"].on'),t]){const h=e&&e.closest('.hscroll,.cats,[class*=scroll]');if(h)h.scrollLeft+=e.getBoundingClientRect().left-h.getBoundingClientRect().left-(h.clientWidth-e.offsetWidth)/2}if(l)toast(`${b.n}還沒解鎖：${l}`,'bad')},forgeCat:()=>{ui.tab='forge';ui.ftab='bp';ui.cat=d.k;const f=d.k==='all'?BPS.filter(b=>!bpLock(b)).sort((x,y)=>y.base*TIERS[y.t].mult-x.base*TIERS[x.t].mult)[0]:BPS.find(b=>b.cat===d.k&&!bpLock(b));if(f)ui.bp=f.id;render();scrollTo(0,0)},iteminfo:()=>{const r=itemInfo(d.k);ui.result={t:'info',...r,acts:(r.acts||'')+mkSellBtn(d.k)};render()},relicopen:()=>relicOpen(d.k,+d.n||0),matinfo:()=>{const r=matInfo(d.k,d.v);ui.result={t:'info',...r,acts:d.v?r.acts:(r.acts||'')+mkSellBtn(d.k)};render()},aclear:()=>{ui.acat='all';ui.aq='all';ui.ast='all';render()},info:()=>{ui.result={t:'info',...INFO[d.k]()};render()},devtab:()=>{ui.devTab=d.k;render()},
   shoptab:()=>{ui.shopTab=d.k;if(d.k==='mk'&&(AUTH||mkMock()))mkLoad();render()},mktab:()=>{MK.tab=d.k;render()},mkcat:()=>{MK.cat=d.k;render()},mkcur:()=>{MK.cur=d.k;render()},mksort:()=>{MK.sort=d.k;render()},mkref:()=>mkLoad(),
   mkview:()=>{ui.mkBq=1;ui.sheet={t:'mkw',id:+d.id};render()},mkbuy:()=>mkBuy(+d.id),mkcancel:()=>mkCancel(+d.id),mkclaim:()=>mkClaim(),mksellw:()=>{ui.mkPrice='';ui.sheet={t:'mks',id:+d.id};render()},mkscur:()=>{MK.sellCur=d.k;render()},
   mksell:()=>{const v=document.getElementById('mkprice');if(v)ui.mkPrice=v.value;mkList(+d.id,MK.sellCur,ui.mkPrice)},mklogin:()=>showLogin(),
   mksellit:()=>{ui.result=null;ui.mkPrice='';ui.mkQty=1;ui.sheet={t:'mksi',k:d.k};render()},mkiqall:()=>{ui.mkQty=mkHave(d.k);render()},mkbqall:()=>{const r=MK.rows.find(x=>x.id===+d.id);if(r)ui.mkBq=r.left_qty;render()},
   mkselli:()=>{const v=id=>{const e=document.getElementById(id);return e?e.value:''};ui.mkPrice=v('mkiprice');ui.mkQty=v('mkiqty');mkListItem(d.k,MK.sellCur,ui.mkPrice,ui.mkQty)},mkbuyi:()=>{const e=document.getElementById('mkbq');mkBuyItem(+d.id,e?e.value:1)},
   rename:()=>{ui.result=null;render();showName(!S.nick)},
   player:()=>{const t=Date.now();ui.tapN=(t-(ui.tapT||0)<1500?(ui.tapN||0):0)+1;ui.tapT=t;if(ui.tapN>=20&&(!CLOUD_ONLY||CLOUD.admin)){ui.tapN=0;clearTimeout(ui.lvT);ui.result=null;setDev(!devMode());toast(devMode()?'已開啟開發者模式：右上角齒輪裡多了「開發者工具」。':'已關閉開發者模式。')}else{clearTimeout(ui.lvT);const n=ui.tapN;ui.lvT=setTimeout(()=>{if(ui.tapN===n)showLevel()},300)}},
   up:()=>upgrade(d.k),topup:()=>{S.gems+=+d.n;toast('測試儲值：鑽石 +'+d.n,'ok');save();render()},
   monthly,claim:claimMonthly,buyMat:()=>shopBuyMat(d.k,d.v,ui.shopN),shopmat:()=>{ui.shopN=1;shopMatCard(d.k)},shopN:()=>{const v=String(d.v);ui.shopN=v[0]==='='?+v.slice(1):Math.max(1,Math.min(MS_MAX,(ui.shopN|0||1)+(+v)));shopMatCard(d.k,true)}
  })[a]?.();
});
document.addEventListener('wheel',e=>{const h=e.target.closest('.hscroll,.catbar,.realms,.devtabs');if(h&&Math.abs(e.deltaY)>Math.abs(e.deltaX)&&h.scrollWidth>h.clientWidth){h.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-act]')){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{if(e.target.id!=='mkprice')return;ui.mkPrice=e.target.value;const p=Math.max(0,Math.floor(+e.target.value||0)),net=Math.floor(p*(1-MK_FEE)),q=x=>document.querySelector(x);
  if(q('.mk-fee'))q('.mk-fee').textContent=p?'-'+fmt(p-net):'—';if(q('.mk-net'))q('.mk-net').textContent=p?fmt(net)+' '+MK_CUR[MK.sellCur][1]:'—';const bt=q('[data-act=mksell]');if(bt)bt.disabled=p<MK_MIN});
document.addEventListener('input',e=>{const id=e.target.id,q=x=>document.querySelector(x),set=(x,t)=>{const o=q(x);if(o)o.textContent=t};   // v4.56 道具上架／購買：總價即時更新
  if(id==='mkiprice'||id==='mkiqty'){if(id==='mkiprice')ui.mkPrice=e.target.value;else ui.mkQty=e.target.value;const s=ui.sheet;if(!s||s.t!=='mksi')return;
    const p=Math.max(0,Math.floor(+ui.mkPrice||0)),n=Math.max(0,Math.min(mkHave(s.k),Math.floor(+ui.mkQty||0))),t=p*n,net=Math.floor(t*(1-MK_FEE));
    set('.mk-itot',t?fmt(t):'—');set('.mk-fee',t?'-'+fmt(t-net):'—');set('.mk-net',t?fmt(net)+' '+MK_CUR[MK.sellCur][1]:'—');const bt=q('[data-act=mkselli]');if(bt)bt.disabled=p<MK_MIN||n<1}
  if(id==='mkbq'){ui.mkBq=e.target.value;const s=ui.sheet,r=s&&MK.rows.find(x=>x.id===s.id);if(!r)return;const n=Math.floor(+ui.mkBq||0),t=r.price*Math.max(0,n),lack=S[r.cur]<t;
    set('.mk-btot',fmt(t)+' '+MK_CUR[r.cur][1]);set('.mk-lack',lack?'（不足）':'');const bt=q('[data-act=mkbuyi]');if(bt)bt.disabled=lack||n<1||n>r.left_qty}});
document.addEventListener('input',e=>{if(e.target.id!=='sndvol')return;S.vol=+e.target.value/100;const o=document.querySelector('.snd-v');if(o)o.textContent=e.target.value+'%'});
document.addEventListener('change',e=>{const id=e.target.id;if(id==='mkprice'||e.target.classList.contains('mk-in')||id==='cxIn'||e.target.classList.contains('gx-in'))return;
if(id==='sndvol'){save();snd('ui_click');return sndSettings()}if(id==='aq')ui.aq=e.target.value;if(id==='ast')ui.ast=e.target.value;if(id==='asort')ui.asort=e.target.value;render()});
}

// v3.17 景深視差：把指標位置／手機傾斜換成 -1～1 的 --mx --my，前後景依深度反向位移
// v3.56 只在正式網站註冊快取（Claude 測試版是沙盒，不用）
if(typeof navigator!=='undefined'&&'serviceWorker' in navigator&&/github\.io$/.test(location.hostname))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
function dpInit(){if(typeof window==='undefined'||window._dpOn)return;window._dpOn=1;const R=document.documentElement;let tx=0,ty=0,x=0,y=0;
  let set=(a,b)=>{tx=Math.max(-1,Math.min(1,a));ty=Math.max(-1,Math.min(1,b))};
  addEventListener('pointermove',e=>set(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1),{passive:true});
  addEventListener('deviceorientation',e=>{if(e.gamma!=null)set(e.gamma/25,(e.beta-40)/25)},{passive:true});
  // v3.56 省電：數值收斂後停掉 rAF，只在指標／陀螺儀有變化時才重新啟動；數值沒變就不寫 CSS 變數（避免整頁重算樣式）
  let run=0,lx='',ly='';const loop=()=>{const b=document.body.classList;if(!b.contains('dpv')&&!b.contains('gating')||document.hidden){run=0;return}
    x+=(tx-x)*.06;y+=(ty-y)*.06;const sx=x.toFixed(2),sy=y.toFixed(2);if(sx!==lx){R.style.setProperty('--mx',sx);lx=sx}if(sy!==ly){R.style.setProperty('--my',sy);ly=sy}
    if(Math.abs(tx-x)<.005&&Math.abs(ty-y)<.005){run=0;return}requestAnimationFrame(loop)};
  window._dpKick=()=>{if(!run){run=1;requestAnimationFrame(loop)}};const _set=set;set=(a,b)=>{_set(a,b);window._dpKick()}}

/* ---------- v3.20 登入畫面＋開場故事（景深圖層；雲端帳號尚未接上前，登入／註冊先提示，用訪客進入） ---------- */
// v4.19 新主線開場（6 張）：諸神逼鐵匠鍛造神兵 → 拒絕 → 懲罰 → 重燃熔爐 → 向諸神宣戰
const STORY=[['op_1','諸神黃昏將至，眾神之父奧丁召集九界的神，準備最後一戰。','s1'],
 ['op_2','祂們找上世間手藝最好的鐵匠：<br>「為諸神鍛造神兵，否則人類滅亡。」','s2'],
 ['op_3','鐵匠放下鐵鎚：<br>「我的爐火，不為屠戮凡人而燃。」','s3'],
 ['op_4','諸神降下懲罰，熔爐被熄、故鄉被焚，祂們的爪牙湧入米德加德。','s4'],
 ['op_5','鐵匠逃到邊境的鐵爐村，重新點燃熔爐。','s5'],
 ['op_6','「我要武裝九界的勇士，向諸神宣戰。」<br>從這一鎚開始。','s6']];
const STORY_HAS={op_1:1,op_2:1,op_3:1,op_4:1,op_5:1,op_6:1};
const LG=n=>'art/login/'+n+'.webp';
function gateEl(){let g=document.getElementById('gate');if(!g){g=document.createElement('div');g.id='gate';document.body.appendChild(g)}return g}
function gateClose(){const g=document.getElementById('gate');if(g){g.classList.add('out');setTimeout(()=>{if(g.classList.contains('out'))g.remove()},450)}document.body.classList.remove('gating')}
const gEmb=(n,cls)=>Array.from({length:n},(_,k)=>`<img class="gt-em e${k} ${cls||''}" src="${A('dp/'+['fx_ember1','fx_ember_trail','fx_ember1','fx_ember_big','fx_ember_cluster','fx_ember1','fx_ember_trail','fx_ember1','fx_ember1','fx_ember_big'][k%10])}" alt="">`).join('');
// v3.47 只允許玩最新版：網站上的 version.json 跟遊戲版本不同 → 先把進度存到雲端，再擋住畫面要求更新
async function verCheck(){if(!CLOUD_ONLY||CLOUD.outdated)return false;try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return false;const j=await r.json();
  if(j&&j.v&&j.v!==BUILD_ID){if(CLOUD.ready)await cloudPush(true).catch(()=>{});CLOUD.outdated=j.v;showUpdate(j.v);return true}}catch(e){}return false}
function showUpdate(v){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-loading';g.onclick=e=>{if(e.target.closest('[data-gu]'))location.replace(location.pathname+'?v='+encodeURIComponent(v)+'&t='+Date.now())};
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key2_bg')}" alt=""><div class="gt-vig"></div></div><img class="gt-logo" src="${LG('logo2')}" alt="諸神鐵匠"><div class="gt-box gt-load"><div class="gt-ttl">有新版本 v${esc(v)}</div><div class="small muted center">目前是 v${BUILD_ID}，需要更新才能繼續玩。你的進度已存到雲端，不會遺失。</div><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gu="1">立即更新</button></div>`}
if(typeof window!=='undefined'){setInterval(()=>{if(!document.hidden)verCheck()},60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')verCheck()});
  window.addEventListener('pagehide',()=>{if(AUTH&&CLOUD.ready){save();cloudPush(true,true)}CLOUD.leaving=true});window.addEventListener('pageshow',e=>{if(e.persisted)CLOUD.leaving=false})}
// v4.18 封測暫停公告（全畫面擋住）；preview=開發者工具預覽，可關閉
const MAINT_TXT=['感謝各位鐵匠這幾天參與封測！','目前遊戲還缺少許多機制，我們決定進行<b>全面改版</b>，重新打造玩法。改版期間暫停開放遊玩。','<b class="mt-warn">重新開放時，所有進度都會清除，大家將從頭開始。</b>','改版很快就會完成，敬請期待。再次感謝大家的測試與回饋！'];
function showMaint(msg,preview){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-maint';
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key2_bg')}" alt=""><img class="gt-ly gt-glow" src="${LG('key2_glow')}" alt=""><div class="gt-fog"></div><div class="gt-embers">${gEmb(10)}</div><div class="gt-vig"></div></div><img class="gt-logo" src="${LG('logo2')}" alt="諸神鐵匠">
   <div class="gt-box mt-box"><div class="gt-ttl">封測暫停・全面改版中</div><div class="mt-body">${MAINT_TXT.map(t=>`<p>${t}</p>`).join('')}<p class="mt-sign">— 諸神鐵匠 開發團隊</p></div>
    ${msg?`<div class="gt-msg small bad">${esc(msg)}</div>`:''}${preview?'<button type="button" class="ui-btn ui-btn--secondary btn btn-sec" data-mt="close">關閉預覽</button>':''}
    <div class="gt-ver small"><button type="button" class="gt-replay" data-mt="admin">管理員登入</button>・${BUILD}</div></div>`;
  g.onclick=e=>{const b=e.target.closest('[data-mt]');if(!b)return;snd('ui_click');if(b.dataset.mt==='close')return gateClose();if(b.dataset.mt==='admin')showLogin()}}
function showLoading(t){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-loading';g.onclick=null;
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key2_bg')}" alt=""><img class="gt-ly gt-glow" src="${LG('key2_glow')}" alt=""><div class="gt-fog"></div><div class="gt-embers">${gEmb(10)}</div><div class="gt-vig"></div></div><img class="gt-logo" src="${LG('logo2')}" alt="諸神鐵匠"><div class="gt-box gt-load"><div class="gt-ttl">${t}</div></div>`}
function showLogin(msg){document.body.classList.add('gating');const g=gateEl();g.className='gate-login';
  g.innerHTML=`<div class="gt-scene">
    <img class="gt-ly gt-bg" src="${LG('key2_bg')}" alt=""><img class="gt-ly gt-glow" src="${LG('key2_glow')}" alt="">
    <img class="gt-fg" src="${LG('key2_fg')}" alt="">
    <div class="gt-fog"></div><div class="gt-embers">${gEmb(10)}</div><div class="gt-vig"></div></div>
   <img class="gt-logo" src="${LG('logo2')}" alt="諸神鐵匠">
   <form class="gt-box" onsubmit="return false">
    <input id="gtMail" type="email" inputmode="email" autocomplete="username" placeholder="Email">
    <input id="gtPw" type="password" autocomplete="current-password" placeholder="密碼">
    <div class="gt-row"><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gt="login">登入</button><button type="button" class="ui-btn ui-btn--secondary btn btn-sec big" data-gt="signup">註冊</button></div>
    <div class="gt-msg small ${msg?'bad':''}">${msg?esc(msg):''}</div>${CLOUD_ONLY?'':'<button type="button" class="gt-guest" data-gt="guest">訪客進入（測試版，存檔只在這支手機）</button>'}
    <div class="gt-ver small">${MAINT?'<button type="button" class="gt-replay" data-gt="maint">‹ 返回公告</button>':'<button type="button" class="gt-replay" data-gt="story">重看開場故事</button>'}・${typeof BUILD!=='undefined'?BUILD:'v3.20'}</div></form>`;
  g.onclick=e=>{const b=e.target.closest('[data-gt]');if(!b)return;const k=b.dataset.gt;snd('ui_click');
    if(k==='guest'){if(!S.introSeen)return showStory();gateClose();return}
    if(k==='story'){return showStory()}
    if(k==='maint'){return showMaint()}
    if(k==='login'||k==='signup'){const em=(g.querySelector('#gtMail').value||'').trim(),pw=g.querySelector('#gtPw').value||'',msg=g.querySelector('.gt-msg');
      const say=(t,bad)=>{if(msg){msg.textContent=t;msg.className='gt-msg'+(bad?' bad':'')}};
      if(!/^\S+@\S+\.\S+$/.test(em))return say('請輸入正確的 Email',1);if(pw.length<6)return say('密碼至少要 6 碼',1);
      if(g.dataset.busy)return;g.dataset.busy='1';g.querySelectorAll('[data-gt]').forEach(x=>x.disabled=true);say(k==='login'?'登入中…':'建立帳號中…');verCheck();
      (k==='login'?cloudLogin(em,pw):cloudSignup(em,pw)).then(r=>{toast(r==='cloud'?'已讀取雲端進度，歡迎回來！':k==='signup'?'帳號建立完成，進度會自動存到雲端。':'登入成功，進度會自動存到雲端。','ok');afterAuthEnter()})
        .catch(e=>{say(SB_ERR(e.message),1)}).finally(()=>{delete g.dataset.busy;g.querySelectorAll('[data-gt]').forEach(x=>x.disabled=false)});return}}}
function showStory(){document.body.classList.add('gating');const list=STORY.filter(s=>STORY_HAS[s[0]]);let i=0;const g=gateEl();g.className='gate-story';
  const draw=()=>{const [img,txt,cls]=list[i];
    g.innerHTML=`<div class="st-scene ${cls}" data-gt="next"><img class="st-bg" src="${LG(img)}" alt=""><div class="st-fx">${cls==='s4'||cls==='s6'?gEmb(10,'big'):cls==='s5'?gEmb(8):cls==='s1'?[0,1,2,3,4,5].map(k=>`<img class="st-mote m${k}" src="${A('dp/'+(k%2?'fx_mote_gold':'fx_dust_gold'))}" alt="">`).join(''):[0,1,2,3,4,5].map(k=>`<img class="st-mote m${k}" src="${A('dp/fx_mote_gold')}" alt="">`).join('')}</div><div class="st-fog"></div><div class="gt-vig"></div>
     <div class="st-txt"><p>${txt}</p><div class="st-dots">${list.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div><span class="small">點畫面繼續</span></div></div>
     <button class="st-skip" data-gt="skip">略過 ›</button>`};
  draw();g.onclick=e=>{const b=e.target.closest('[data-gt]');if(!b)return;if(b.dataset.gt==='skip'||i>=list.length-1){S.introSeen=1;save();gateClose();return}i++;snd('ui_click');draw()}}

/* ---------- v3.20 新手導覽：光圈框住要點的地方＋鐵匠提示；不擋操作，條件達成自動下一步 ---------- */
const tutW=()=>S.weapons.filter(w=>!w.test&&!busyW(w)).sort((a,b)=>a.id-b.id)[0];   // 導覽用：第一把沒有駐守的武器
// v4.57 新手導覽照新流程重做（Mochi 選）：鍛造開局武器 → 60 秒挑戰 1-1 → 留下來掛機 → 收成 → 材料 → 強化 → 附魔 → 新圖紙
const TUT_BP='w0_axe';   // 1-1 林中魅妖專騙伐木工，第一把打伐木斧最貼故事
const tutCh=()=>ui.chr&&ui.sheet&&ui.sheet.t==='chr'?ui.chr:null;   // 挑戰結果畫面
const TUT=[
 // 一、鍛造
 {t:'諸神熄了鐵匠的爐火，九界的門跟著打開了。先幫鐵爐村的伐木工打一把<b>鐵爐村伐木斧</b>：點圖紙，再按「開始鍛造」。',sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.sheet?'.sheet [data-act=close]':ui.tab!=='forge'?'.nav [data-act=tab][data-k=forge]':ui.bp!==TUT_BP?`[data-act=bp][data-k=${TUT_BP}]`:'[data-act=forge]',done:()=>S.jobs.length>0||S.weapons.some(w=>!w.test)},
 {t:'鍛造只要 <b>5 秒</b>，打好會自動放進<b>道具欄</b>。',tf:()=>{const j=S.jobs[0];return j?`鍛造中…剩 <b>${Math.max(0,Math.ceil((j.end-NOW())/1000))} 秒</b>，打好會自動放進<b>道具欄</b>。`:'打好了！'},sel:()=>S.jobs.length&&ui.tab==='forge'?'.qrow .prog':null,done:()=>S.weapons.some(w=>!w.test)},
 // 二、60 秒挑戰
 {t:'武器打好了！到<b>村莊</b>去，林中魅妖正把伐木工騙進森林深處。',sel:()=>ui.sheet?'.sheet [data-act=close]':'.nav [data-act=tab][data-k=village]',done:()=>ui.tab==='village'||S.villages[0].status==='cleared'},
 {t:'還沒收復的村莊要<b>限時挑戰</b>：<b>60 秒內</b>打倒怪物就收復。按 1-1 的「<b>挑戰</b>」。',sel:()=>ui.tab!=='village'?'.nav [data-act=tab][data-k=village]':'.vcard [data-act=vopen][data-i="0"]',done:()=>(ui.sheet&&['v','ch','chr'].includes(ui.sheet.t))||S.villages[0].status==='cleared'},
 {t:'這裡看得到怪物的<b>血量</b>、<b>弱點</b>，每把武器下方是<b>預估幾秒打倒</b>。點伐木斧開始挑戰！',sel:()=>ui.sheet&&ui.sheet.t==='v'?'.sheet .ch-pick':ui.tab!=='village'?'.nav [data-act=tab][data-k=village]':'.vcard [data-act=vopen][data-i="0"]',done:()=>!!ui.ch||!!tutCh()||S.villages[0].status==='cleared'},
 {t:'戰鬥開始！上方是<b>血條</b>和每一下的傷害，下方是<b>倒數</b>。看騎士把牠打倒吧。',tf:()=>{const c=tutCh();return c&&!c.win?'時間到了，差一點！輸了<b>沒有任何損失</b>，按「<b>再挑戰</b>」再打一次。':'戰鬥開始！上方是<b>血條</b>和每一下的傷害，下方是<b>倒數</b>。看騎士把牠打倒吧。'},sel:()=>{const c=tutCh();return c&&!c.win?'.sheet [data-act=chgo]':null},top:1,done:()=>S.villages[0].status==='cleared'},
 {t:'收復成功！按「<b>留下來掛機</b>」，讓伐木斧駐守這裡繼續打怪。',sel:()=>tutCh()?'.sheet [data-act=chstay]':ui.sheet&&ui.sheet.t==='v'?'.sheet [data-act=deliver]':ui.tab!=='village'?'.nav [data-act=tab][data-k=village]':'.vcard [data-act=vopen][data-i="0"]',done:()=>S.villages[0].weaponId!=null},
 // 三、掛機與收成
 {t:'駐守的武器會<b>一直打怪</b>，每打倒一隻就收成一次。導覽先幫你打了幾隻，按「<b>全部收成</b>」領取！',go:()=>{const st=S.villages[0],w=st.weaponId!=null&&W(st.weaponId);if(w&&st.cycleStart!=null&&!st.bank.cycles){st.cycleStart=NOW()-dur(0,w)*5-500;tick()}},sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.sheet?'.sheet [data-act=close]':ui.tab!=='village'?'.nav [data-act=tab][data-k=village]':'[data-act=collectAll]',done:()=>S.stats.harvest>0},
 {t:'每打倒一隻會掉<b>金幣、材料</b>，有機率掉<b>強化石、附魔石、英靈・遺物</b>。<b>離線</b>也照樣打（最多 '+OFFLINE_H+' 小時），記得常回來收成。',sel:()=>null,ok:'知道了'},
 {t:'打開<b>道具欄</b>的「<b>材料</b>」頁看看收成到的東西。',sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.sheet?'.sheet [data-act=close]':ui.tab!=='armory'?'.nav [data-act=tab][data-k=armory]':'[data-act=atab][data-k=m]',done:()=>ui.tab==='armory'&&ui.atab==='m'},
 {t:'<b>材料</b>用來打造新武器，每一界有自己的材料；<b>英靈・遺物</b>點一下就能打開，可能開出強化石、附魔石甚至武器。',sel:()=>null,ok:'知道了'},
 // 四、強化
 {t:'再打一把<b>鐵爐村鐵劍</b>拿來練習<b>強化</b>（伐木斧正在駐守，不能強化）。',sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.sheet?'.sheet [data-act=close]':ui.tab!=='forge'?'.nav [data-act=tab][data-k=forge]':ui.bp!=='w0_sword'?'[data-act=bp][data-k=w0_sword]':'[data-act=forge]',done:()=>S.jobs.length>0||!!tutW()},
 {t:'鍛造中…',tf:()=>{const j=S.jobs[0];return j&&!tutW()?`鍛造中…剩 <b>${Math.max(0,Math.ceil((j.end-NOW())/1000))} 秒</b>。`:'打好了！打開<b>道具欄</b>的「<b>武器</b>」頁。'},
  sel:()=>{if(!tutW()&&!S.jobs.length&&tutOn()){setTimeout(()=>{if(!tutW()&&!S.jobs.length)tutStep(S.tut-1)},0);return null}return !tutW()?(ui.tab==='forge'?'.qrow .prog':null):ui.tab!=='armory'?'.nav [data-act=tab][data-k=armory]':'[data-act=atab][data-k=w]'},done:()=>!!tutW()&&ui.tab==='armory'&&(ui.atab||'w')==='w'},
 {t:'點這把<b>鐵爐村鐵劍</b>打開武器小卡。',sel:()=>ui.tab!=='armory'?'.nav [data-act=tab][data-k=armory]':tutW()?`[data-act=wopen][data-id="${tutW().id}"]`:null,done:()=>ui.sheet&&ui.sheet.t==='w'},
 {t:'小卡上有武器的<b>攻擊力</b>和<b>屬性</b>。按「<b>強化</b>」。',sel:()=>ui.sheet&&ui.sheet.t==='w'?'.sheet [data-act=wmode][data-m=enh]':null,done:()=>ui.sheet&&ui.sheet.t==='w'&&ui.sheet.m==='enh'},
 {t:'每次強化用 <b>1 顆強化石</b>。<b>+6 以內一定成功</b>，按下強化試試看！',sel:()=>ui.sheet&&ui.sheet.m==='enh'?'.sheet [data-act=enhance]':null,done:()=>S.stats.enhTry>0},
 {t:'+7 以上是<b>危險區</b>，失敗會<b>爆裝</b>（武器消失）。所以多打幾把武器來衝裝吧！強化等級越高，武器框的顏色也越亮。',sel:()=>ui.busy?null:'.sheet .ev-stats',ok:'知道了'},
 {t:'<b>附魔</b>花 1 顆<b>附魔石</b>加金幣，隨機幫武器加一種<b>屬性</b>。打中怪物弱點（點村莊看詳情）傷害 +3%～10%，跟怪物同屬性會 −3%～10%。',go:()=>{const w=tutW();if(w){ui.enhLast=null;ui.sheet={t:'w',id:w.id,m:'main'}}},sel:()=>'.sheet [data-act=wmode][data-m=ench]',ok:'知道了'},
 // 五、新圖紙與其他系統
 {t:'收復村莊會<b>解鎖新圖紙</b>：收復 1-2 就能打<b>松林長矛</b>，要用中庭鐵礦和松林硬木。缺材料時鐵匠鋪會告訴你去哪一關刷。',go:()=>{ui.sheet=null;ui.tab='forge';scrollTo(0,0)},ok:'知道了'},
 {t:'封測期間<b>北境月卡免費</b>！按「<b>免費領取</b>」立刻拿 <b>300 鑽石</b>，之後 30 天每天回來還能再領 50 鑽。',go:()=>{ui.sheet=null;ui.result=null;ui.tab='shop';scrollTo(0,0)},sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.tab!=='shop'?'.nav [data-act=tab][data-k=shop]':monthlyOn()?null:'[data-act=monthly]',done:()=>monthlyOn()},
 {t:'商城每天可以<b>七日簽到</b>領獎勵，材料不夠也能用<b>金幣或鑽石</b>買。',go:()=>{ui.sheet=null;ui.result=null;ui.tab='shop'},sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.tab!=='shop'?'.nav [data-act=tab][data-k=shop]':'.sg-panel',ok:'知道了'},   // v4.59 簽到搬到商城
 {t:'村莊頁的<b>任務</b>有每日任務和成就，可以免費領金幣和鑽石。',go:()=>{ui.sheet=null;ui.result=null;ui.tab='village';scrollTo(0,0)},sel:()=>'.vbar',ok:'知道了'},
 {go:()=>{ui.sheet=null;ui.tab='forge';scrollTo(0,0)},t:'基本就是這樣：<b>鍛造 → 挑戰 → 掛機收成 → 強化 → 附魔</b>，一路收復九界、向諸神討回爐火！送你 <b>50 鑽石</b>當開工禮。',sel:()=>null,ok:'開始冒險',end:1}];
// 各系統第一次打開時的說明（導覽結束後才會出現，每個只出現一次）
const TIPS={
 mat:['道具欄','同一種道具放在同一格，右下角是數量，沒有上限。點一下看說明。'],
 armory:['道具欄','點武器看詳情、強化、附魔。上方可依類別篩選與排序；點鎖頭「鎖定」的武器不會被熔解。'],
 shop:['商城','封測期間月卡免費；每天在這裡簽到；材料可以用金幣或鑽石買。'],
 danger:['危險區','這次強化超過安定值：失敗會有機率爆裝，武器會永久消失。按下強化前會要你再確認一次。'],
 ench:['屬性附魔','按附魔會隨機得到一種屬性和等級（機率列在下方）。可以重抽，但舊的屬性會被覆蓋。打中怪物弱點才有加成。'],
 vdetail:['駐守中的武器','收成和每輪掉落直接看村莊卡片。這張小卡可以看武器詳情、換更強的武器，或把武器收回。'],   // v4.38 狩獵策略拿掉
 lb:['排行榜','比的是你交給這座村莊「最強的那把武器」。第一次衝進前 10、前 3、第 1 名各有一次獎勵。'],
 ach:['任務','每日任務每天 0 點重置，集滿活躍度開寶箱；委託成就達成就能領鑽石。'],
 ws_w:['工坊升級','熔爐：解鎖更高階材質的圖紙。鐵砧：提高打出高品質的機率，並開放更多附魔欄。'],
 ws_t:['鐵匠天賦','收成、鍛造、強化成功、收復村莊、熔解都會累積聲望。每升 1 級得到 1 天賦點和聲望寶箱，可以點在 6 種天賦上；聲望等級沒有上限。'],
 evt:['首領討伐','全服一起打同一隻首領。首領整週開打，每週日 0 點結算換下一隻。最多派 3 把武器駐守，每小時造成攻擊力的傷害（打中弱點依屬性等級傷害 +3%～10%，同屬性 −3%～10%），離線也會繼續打，結算後武器留著繼續打；駐守首領的武器不能同時打村莊。全服血量打到 25／50／75／100% 時，本週有駐守的人都能領獎；結算後再依上週個人傷害排名領獎。'],
 ws_m:['熔解回收','不要的武器可以熔解，退回部分材料和一半鍛造金幣。一鍵熔解只會熔掉普通、精良、+0、沒有鎖定的閒置武器。'],
};
function tipKey(){const s=ui.sheet;if(s){if(s.t==='w'&&s.m==='enh'){const w=W(s.id);return w&&w.lv+1>stable(w)&&w.lv<MAX_LV?'danger':null}if(s.t==='w'&&s.m==='ench')return'ench';if(s.t==='v'){return S.villages[s.i].weaponId!=null?'vdetail':null}
  if(s.t==='lb')return'lb';if(s.t==='a')return'ach';if(s.t==='ws')return'ws_'+s.k;if(s.t==='evt')return'evt';return null}
  return ui.tab==='armory'&&ui.atab==='m'?'mat':ui.tab==='armory'&&S.weapons.length?'armory':ui.tab==='shop'?'shop':null}
// v3.70 每天第一次進遊戲（導覽結束後）自動打開簽到（v4.59 起在商城）
function signAuto(){if(ui.signAuto||!S||!signReady()||!(S.tut>=TUT.length)||ui.sheet||ui.result||ui.busy||document.body.classList.contains('gating')||(CLOUD_ONLY&&!CLOUD.ready))return;
  ui.signAuto=true;ui.tab='shop';render();scrollTo(0,0)}   // v4.59 簽到搬到商城：每天第一次進遊戲切到商城
function tipDraw(){let o=document.getElementById('tip');const k=!document.body.classList.contains('gating')&&!ui.busy&&!ui.result&&S.tut>=TUT.length?tipKey():null;
  if(!k||(S.tips||{})[k]){if(o&&(!k||o.dataset.k!==k))o.remove();return}
  if(o&&o.dataset.k===k)return;if(o)o.remove();
  o=document.createElement('div');o.id='tip';o.dataset.k=k;o.innerHTML=`<div class="tut-box tip-box"><img class="tut-face" src="${A('sm_1')}" alt=""><div class="tut-body"><div class="tut-txt"><b>${TIPS[k][0]}</b>｜${TIPS[k][1]}</div><div class="tut-btns"><button class="ui-btn ui-btn--primary btn btn-primary sm" data-tip="ok">知道了</button></div></div></div>`;
  o.addEventListener('click',e=>{if(!e.target.closest('[data-tip]'))return;e.stopPropagation();S.tips=S.tips||{};S.tips[k]=1;save();o.remove();snd('ui_click')});document.body.appendChild(o)}
const tutOn=()=>typeof S.tut==='number'&&S.tut<TUT.length&&BPS.some(b=>!b.dev)&&!document.body.classList.contains('gating');   // v4.44 沒有正式圖紙（只有開發者測試圖紙）時先不跑新手導覽
function tutStep(n){S.tut=n;const nx=TUT[n];if(nx&&nx.go&&!ui.busy){nx.go();render()}if(n>=TUT.length&&!S.tutRw){S.tutRw=1;S.gems+=50;toast('新手導覽完成：鑽石 +50','ok')}save();tutDraw(true)}
function tutDraw(force){let o=document.getElementById('tut');document.body.classList.toggle('tutoring',tutOn());
  if(!tutOn()){if(o)o.remove();return}
  const st=TUT[S.tut];if(!st.ok&&st.done&&st.done()){return tutStep(S.tut+1)}
  if(!o){o=document.createElement('div');o.id='tut';o.innerHTML='<div class="tut-ring"></div><div class="tut-box"><img class="tut-face" src="'+A('sm_1')+'" alt=""><div class="tut-body"><div class="tut-txt"></div><div class="tut-btns"></div></div></div>';document.body.appendChild(o);
    o.addEventListener('click',e=>{const b=e.target.closest('[data-tut]');if(!b)return;e.stopPropagation();snd('ui_click');if(b.dataset.tut==='skip'){S.tut=99;save();tutDraw()}else tutStep(S.tut+1)})}
  if(force||o.dataset.k!==String(S.tut)){o.dataset.k=S.tut;o.querySelector('.tut-txt').innerHTML=st.t;
    o.querySelector('.tut-btns').innerHTML=`<span class="small muted">${S.tut+1}／${TUT.length}</span>${st.ok?`<button class="ui-btn ui-btn--primary btn btn-primary sm" data-tut="next">${st.ok}</button>`:''}${st.end?'':'<button class="tut-skip" data-tut="skip">略過導覽</button>'}`}
  if(st.tf){const x=st.tf();if(o.dataset.tx!==x){o.dataset.tx=x;o.querySelector('.tut-txt').innerHTML=x}}   // v3.52 動態說明（例如鍛造倒數）
  const sel=st.sel&&st.sel(),el=sel&&[...document.querySelectorAll(sel)].find(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0}),ring=o.querySelector('.tut-ring'),box=o.querySelector('.tut-box');
  if(el&&!el.closest('nav,.nav,#res,.ui-topbar,.sheet,.modal,#gate')){   // v3.54 要框的東西被上方資源列或底部分頁列擋住 → 捲到畫面中間（矮螢幕手機）；每個目標只捲一次，避免來回跳
    const r0=el.getBoundingClientRect(),nv=document.querySelector('nav.nav'),navTop=nv?nv.getBoundingClientRect().top:innerHeight,rs=document.getElementById('res'),topLim=(rs?rs.getBoundingClientRect().bottom:60)+8,key=S.tut+'|'+sel;
    if((r0.bottom>navTop-50||r0.top<topLim)&&o.dataset.sc!==key){o.dataset.sc=key;el.scrollIntoView({block:'center'})}}
  else if(el&&el.closest('.sheet')){   // v3.55 彈出視窗裡的目標：沒有完整露出就捲到視窗中間（每個目標只捲一次）
    const sh=el.closest('.sheet'),r0=el.getBoundingClientRect(),rs=sh.getBoundingClientRect(),key=S.tut+'|'+sel;
    if((r0.top<rs.top+60||r0.bottom>rs.bottom-20)&&o.dataset.sc!==key){o.dataset.sc=key;el.scrollIntoView({block:'center'})}}
  if(el){const r=el.getBoundingClientRect(),p=6;Object.assign(ring.style,{display:'block',left:r.left-p+'px',top:r.top-p+'px',width:r.width+p*2+'px',height:r.height+p*2+'px'});
    const below=r.top+r.height/2<innerHeight/2;box.style.top=below?Math.min(innerHeight-170,r.bottom+14)+'px':'auto';box.style.bottom=below?'auto':Math.max(90,innerHeight-r.top+14)+'px';o.classList.remove('nohole')}
  else{ring.style.display='none';box.style.top=st.top?'64px':'auto';box.style.bottom=st.top?'auto':'120px';o.classList.add('nohole')}o.classList.toggle('clear',!el&&!!st.top)}   // v4.57 top：說明放上方、不加暗幕（看戰鬥用）
// v3.55 捲動時金框立即跟著移動
if(typeof window!=='undefined')document.addEventListener('scroll',()=>{if(tutOn()&&!tutDraw._raf)tutDraw._raf=requestAnimationFrame(()=>{tutDraw._raf=0;tutDraw()})},{passive:true,capture:true});
function tutInit(){if(S.tut==null)S.tut=(!S.weapons.length&&!S.jobs.length&&cleared()===0)?0:99;
  if(navigator.webdriver&&!/tut/.test(location.hash)){if(S.tut<TUT.length)S.tut=99;S.tips=Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))}   // 自動測試預設不跑導覽，網址加 #tut 才顯示
  setInterval(()=>{nickGuard();tutDraw();tipDraw();signAuto()},250)}
// v3.37 保險：只要是登入帳號、還沒取暱稱、目前沒有其他全螢幕畫面，就跳出取名（不管是從哪條路徑進遊戲）
let NICK_ASK=0;function nickGuard(){if(S._fcMsg&&!document.body.classList.contains('gating')){toast(`改版補發：已收復村莊的首次收復獎勵 ${fmt(S._fcMsg)} 金幣`,'ok');delete S._fcMsg;save()}if(!AUTH||!AUTH.user||S.nick||document.body.classList.contains('gating')||Date.now()-NICK_ASK<4000)return;NICK_ASK=Date.now();showName(true)}
function start(){try{if(localStorage.getItem('nrs-dpv')!=='0')document.body.classList.add('dpv')}catch(e){document.body.classList.add('dpv')}dpInit();
  const migrated=loadState();applySkin();
  if(typeof window!=='undefined')window.claude?.hot?.snapshot?.(()=>({S}));
  const before=S.villages.reduce((s,v)=>s+v.bank.cycles,0);tick();const after=S.villages.reduce((s,v)=>s+v.bank.cycles,0);
  bindUI();preloadVfx();render();save();warmTabs();
  tutInit();
  try{if(/gate/.test(location.hash)||!(navigator.webdriver||/nogate/.test(location.hash))){   // 自動測試（webdriver）預設跳過登入，網址加 #gate 才顯示
    showLoading('檢查版本…');verCheck().then(old=>{if(old)return;
    if(MAINT){if(!(AUTH&&AUTH.user))return showMaint();showLoading('檢查帳號…');return adminCheck().then(a=>{if(!a)return showMaint();showLoading('讀取雲端存檔…');cloudAfterLogin().then(()=>afterAuthEnter()).catch(e=>showLogin('讀取雲端存檔失敗：'+SB_ERR(e.message)+'，請重新登入'))})}   // v4.18 維護中：不讀一般玩家的存檔，直接顯示公告
    if(AUTH&&AUTH.user&&!/forcelogin/.test(location.hash)){showLoading('讀取雲端存檔…');cloudAfterLogin().then(()=>afterAuthEnter()).catch(e=>showLogin('讀取雲端存檔失敗：'+SB_ERR(e.message)+'，請重新登入'))}
    else showLogin()})}}catch(e){}
  if(migrated)toast('已把 v2 存檔升級成 v3。');
  if(after>before)toast(`離線期間村莊狩獵了 ${after-before} 輪，記得收成！`);
  else if(!S.weapons.length&&!S.jobs.length&&!(S.tut<TUT.length))toast('歡迎來到米德加德。先鍛造一把鐵爐村伐木斧，去挑戰 1-1 魅影林場。');
  // v3.59 村莊分頁也要重畫：以前停在村莊分頁時，狩獵完成一輪不會出現「收成」按鈕（要切分頁才看得到）
  setInterval(()=>{if(tick()){if(PTR_DOWN)PTR_PEND=true;else render()}updateLive()},250);setInterval(save,3000);
  try{if(/dev-ui/.test(location.hash)&&devMode()){ui.sheet={t:'d'};ui.devTab='ui';render()}}catch(e){}  // 網址加 #dev-ui 直接開啟 UI 元件總覽
}
