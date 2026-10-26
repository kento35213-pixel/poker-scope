/* Poker Scope. No network dependencies. Card ids: rank * 4 + suit, 2..A / c d h s. */
(function(root){
'use strict';
const RANKS='23456789TJQKA', SUITS='cdhs', STREETS=['preflop','flop','turn','river'];
const STREET_NAMES={preflop:'プリフロップ',flop:'フロップ',turn:'ターン',river:'リバー'};
const POS={2:['SB','BB'],6:['UTG','HJ','CO','BTN','SB','BB'],9:['UTG','UTG+1','UTG+2','LJ','HJ','CO','BTN','SB','BB']};
const rand=(n)=>Math.floor(Math.random()*n), pick=(a)=>a[rand(a.length)], round=(n)=>Math.round(n*1000)/1000;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function cardStr(c){return RANKS[c>>2]+SUITS[c%4];}
function parseCard(s){if(typeof s==='number'&&Number.isInteger(s)&&s>=0&&s<52)return s;let m=String(s).trim().replace(/10/,'T').match(/^([2-9TJQKA])([cdhs♣♦♥♠])$/i);if(!m)throw Error('カードは As、Kh の形式で入力してください。');return RANKS.indexOf(m[1].toUpperCase())*4+'cdhs♣♦♥♠'.indexOf(m[2].toLowerCase())%4;}
function parseCards(s){if(Array.isArray(s))return s.map(parseCard);let t=String(s).trim();if(!t)return [];let a=t.replace(/10/gi,'T').match(/[2-9TJQKA][cdhs♣♦♥♠]/gi)||[];if(a.join('').toLowerCase()!==t.replace(/[\s,]/g,'').toLowerCase())throw Error('カードの入力形式を確認してください（例：As Kh）。');return a.map(parseCard);}
function unique(cards){return new Set(cards).size===cards.length;}
function handName(h){let a=h[0]>>2,b=h[1]>>2;if(a<b)[a,b]=[b,a];return RANKS[a]+RANKS[b]+(a===b?'':h[0]%4===h[1]%4?'s':'o');}
function pack(cat,ranks){let x=cat;for(let i=0;i<5;i++)x=x*15+(ranks[i]||0);return x;}
function straightHigh(mask){for(let r=14;r>=6;r--)if((mask & (31<<(r-6)))===(31<<(r-6)))return r;return (mask&4111)===4111?5:0;}
function evaluate(cards){
 if(cards.length<5||cards.length>7)throw Error('役判定には5〜7枚必要です。');
 const counts=new Int8Array(15), suits=[[],[],[],[]];let mask=0;
 for(let c of cards){let r=(c>>2)+2;counts[r]++;suits[c%4].push(r);mask|=1<<(r-2);}
 for(let s of suits)if(s.length>=5){let sm=0;for(let r of s)sm|=1<<(r-2);let sh=straightHigh(sm);if(sh)return pack(8,[sh]);}
 let fours=[],trips=[],pairs=[],singles=[];
 for(let r=14;r>=2;r--){if(counts[r]===4)fours.push(r);if(counts[r]===3)trips.push(r);if(counts[r]===2)pairs.push(r);if(counts[r])singles.push(r);}
 if(fours.length)return pack(7,[fours[0],singles.find(r=>r!==fours[0])]);
 if(trips.length&&(pairs.length||trips.length>1))return pack(6,[trips[0],Math.max(pairs[0]||0,trips[1]||0)]);
 for(let s of suits)if(s.length>=5)return pack(5,s.sort((a,b)=>b-a).slice(0,5));
 let sh=straightHigh(mask);if(sh)return pack(4,[sh]);
 if(trips.length)return pack(3,[trips[0],...singles.filter(r=>r!==trips[0]).slice(0,2)]);
 if(pairs.length>=2)return pack(2,[pairs[0],pairs[1],singles.find(r=>r!==pairs[0]&&r!==pairs[1])]);
 if(pairs.length)return pack(1,[pairs[0],...singles.filter(r=>r!==pairs[0]).slice(0,3)]);
 return pack(0,singles.slice(0,5));
}
function category(cards){if(cards.length<5)return handName(cards);return ['ハイカード','ワンペア','ツーペア','スリーカード','ストレート','フラッシュ','フルハウス','フォーカード','ストレートフラッシュ'][Math.floor(evaluate(cards)/759375)];}
function preStrength(h){let a=(h[0]>>2)+2,b=(h[1]>>2)+2;if(a<b)[a,b]=[b,a];let pair=a===b,suited=h[0]%4===h[1]%4;return clamp(pair?.44+(a-2)*.043:.10+(a-2)*.035+(b-2)*.022+(suited?.065:0)+(a-b===1?.035:0)-(a-b>4?.03:0),.08,.99);}
function allCombos(used=[]){const set=new Set(used),a=[];for(let i=0;i<52;i++)if(!set.has(i))for(let j=i+1;j<52;j++)if(!set.has(j))a.push({hand:[i,j],weight:1});return a;}
function rangeCombos(text,used=[]){
 text=String(text||'random').trim();let available=allCombos(used);if(/^(random|any|100%)$/i.test(text))return available;
 const map=new Map();for(let token of text.split(/[\s,;]+/).filter(Boolean)){
  let parts=token.split(':'),w=parts[1]===undefined?1:Number(parts[1]);if(!(w>0&&w<=1))throw Error('レンジの重みは0より大きく1以下です（例：AKs:0.5）。');
  let t=parts[0].replace(/10/gi,'T'),exact;
  if(/^[2-9TJQKA][cdhs][2-9TJQKA][cdhs]$/i.test(t)){exact=parseCards(t);if(!unique(exact))throw Error('レンジ内に同じカードがあります。');let k=exact.slice().sort((a,b)=>a-b).join(',');for(let c of available)if(c.hand.join(',')===k)map.set(k,{...c,weight:w});continue;}
  let m=t.match(/^([2-9TJQKA])([2-9TJQKA])([so]?)(\+)?$/i);if(!m)throw Error('レンジは AA,TT+,AKs,AJo+,AsKh:0.5 の形式です。区間表記は非対応です。');
  let a=RANKS.indexOf(m[1].toUpperCase()),b=RANKS.indexOf(m[2].toUpperCase()),s=m[3].toLowerCase(),plus=!!m[4];if(a<b)[a,b]=[b,a];if(a===b&&s)throw Error('ペアにはs/oを付けません。');
  for(let c of available){let x=c.hand[0]>>2,y=c.hand[1]>>2;if(x<y)[x,y]=[y,x];let suited=c.hand[0]%4===c.hand[1]%4;if((a===b?(x===y&&(plus?x>=a:x===a)):(x===a&&(plus?y>=b&&y<a:y===b)))&&(!s||(s==='s')===suited))map.set(c.hand.join(','),{...c,weight:w});}
 }
 if(!map.size)throw Error('指定レンジに、既知のカードと重複しないハンドがありません。');return [...map.values()];
}
function weightedPick(combos,blocked){let valid=combos.filter(x=>!x.hand.some(c=>blocked.has(c))),sum=valid.reduce((a,c)=>a+c.weight,0);if(!sum)return null;let t=Math.random()*sum;for(let x of valid){t-=x.weight;if(t<=0)return x.hand;}return valid[valid.length-1].hand;}
function equityFixed(hands,board,trials=20000,progress){
 if(hands.length<2||hands.length>6||hands.some(h=>h.length!==2))throw Error('2〜6人のハンドを各2枚指定してください。');
 if(board.length>5||!unique([...hands.flat(),...board]))throw Error('同じカードが重複しています。');
 let used=new Set([...hands.flat(),...board]),deck=Array.from({length:52},(_,i)=>i).filter(c=>!used.has(c)),missing=5-board.length;
 let wins=hands.map(()=>0),ties=hands.map(()=>0),shares=hands.map(()=>0),n=0;
 const assess=(run)=>{let vals=hands.map(h=>evaluate(h.concat(board,run))),best=Math.max(...vals),which=[];for(let j=0;j<vals.length;j++)if(vals[j]===best)which.push(j);for(let j of which){if(which.length===1)wins[j]++;else ties[j]++;shares[j]+=1/which.length;}n++;};
 let count=1;for(let i=0;i<missing;i++)count=count*(deck.length-i)/(i+1);
 let exact=count<=120000;
 if(exact){const rec=(start,run)=>{if(run.length===missing){assess(run);return;}for(let i=start;i<=deck.length-(missing-run.length);i++)rec(i+1,run.concat(deck[i]));};rec(0,[]);}
 else for(let i=0;i<trials;i++){let d=deck.slice(),r=[];for(let j=0;j<missing;j++){let k=j+rand(d.length-j);[d[j],d[k]]=[d[k],d[j]];r.push(d[j]);}assess(r);if(progress&&i%2000===0)progress(i/trials);}
 return {trials:n,exact,results:hands.map((h,i)=>({hand:h,win:wins[i]/n,tie:ties[i]/n,equity:shares[i]/n,error:exact?0:1.96*Math.sqrt((shares[i]/n)*(1-shares[i]/n)/n)}))};
}
function rangeEquity(hero,board,ranges,trials=3500){
 let shares=0,win=0,tie=0,n=0;
 for(let i=0;i<trials;i++){
  let blocked=new Set([...hero,...board]),hands=[hero],valid=true;
  // Rejection of the entire joint draw preserves independent range weights under card removal.
  for(let range of ranges){let total=range.reduce((s,x)=>s+x.weight,0),r=Math.random()*total,h;
   for(let c of range){r-=c.weight;if(r<=0){h=c.hand;break;}}h=h||range[range.length-1].hand;
   if(h.some(c=>blocked.has(c))){valid=false;break;}hands.push(h);h.forEach(c=>blocked.add(c));}
  if(!valid)continue;
  let deck=Array.from({length:52},(_,c)=>c).filter(c=>!blocked.has(c)),run=[];
  for(let j=0;j<5-board.length;j++){let k=j+rand(deck.length-j);[deck[j],deck[k]]=[deck[k],deck[j]];run.push(deck[j]);}
  let vals=hands.map(h=>evaluate(h.concat(board,run))),best=Math.max(...vals),cnt=vals.filter(v=>v===best).length;if(vals[0]===best){shares+=1/cnt;if(cnt===1)win++;else tie++;}n++;
 }
 if(n<30)throw Error('重複しないレンジの組合せが不足しています。レンジを広げてください。');
 return {equity:shares/n,win:win/n,tie:tie/n,trials:n,error:1.96*Math.sqrt((shares/n)*(1-shares/n)/n)};
}
function icm(stacks,payouts){
 if(stacks.some(s=>s<0)||stacks.length>9||!payouts.length)throw Error('ICMは0以上のスタックと賞金を入力し、9人以下にしてください。');
 const n=stacks.length,memo=new Map();function rec(mask,rank){let key=mask+':'+rank;if(memo.has(key))return memo.get(key);let out=Array(n).fill(0),sum=0,alive=[];for(let i=0;i<n;i++)if(mask&(1<<i)){alive.push(i);sum+=stacks[i];}if(!alive.length||rank>=payouts.length)return out;
  for(let i of alive){let p=sum>0?stacks[i]/sum:1/alive.length;if(!p)continue;out[i]+=p*(payouts[rank]||0);let next=rec(mask^(1<<i),rank+1);for(let j=0;j<n;j++)out[j]+=p*next[j];}memo.set(key,out);return out;}
 return rec((1<<n)-1,0);
}
function initialState(q){
 const n=q.players.length,s={players:q.players.map(p=>({pos:p.pos,stack:p.stack,start:p.stack,folded:false,allin:false,put:0,total:0,last:''})),pot:0,currentBet:0,minRaise:1,street:'preflop',board:[],order:[],next:null,done:false,legacyHUOrder:q.legacyHUOrder===true,actedAt:Array(n).fill(null)};
 const pay=(i,a,counts)=>{let p=s.players[i],b=Math.min(p.stack,a);p.stack=round(p.stack-b);p.total=round(p.total+b);if(counts)p.put=round(p.put+b);s.pot=round(s.pot+b);p.allin=p.stack<=0;};
 if(q.ante)for(let i=0;i<n;i++)pay(i,q.ante,false);
 pay(n-2,.5,true);pay(n-1,1,true);s.currentBet=Math.max(...s.players.map(p=>p.put));
 s.order=n===2?[0,1]:Array.from({length:n},(_,i)=>i);s.pending=new Set(s.order.filter(i=>!s.players[i].allin));s.next=s.order.find(i=>s.pending.has(i));return s;
}
function nextIndex(s,from){let n=s.players.length;for(let k=1;k<=n;k++){let i=(from+k)%n;if(s.pending.has(i)&&!s.players[i].folded&&!s.players[i].allin)return i;}return null;}
function applyEvent(s,e){
 if(e.type==='deal'){
  if(s.next!==null)throw Error('ベッティング完了前にはカードを配れません。');
  let idx=STREETS.indexOf(s.street)+1;if(e.street!==STREETS[idx])throw Error('ストリートの順序が不正です。');
  let expected=idx===1?3:1;if(!Array.isArray(e.cards)||e.cards.length!==expected)throw Error('配るカードの枚数が不正です。');
  s.street=e.street;s.board.push(...e.cards);s.currentBet=0;s.minRaise=1;
  s.players.forEach(p=>{p.put=0;p.last=p.folded?'フォールド':'';});s.actedAt=Array(s.players.length).fill(null);
  let n=s.players.length;s.order=n===2?(s.legacyHUOrder?[0,1]:[1,0]):Array.from({length:n},(_,j)=>(n-2+j)%n);s.pending=new Set(s.order.filter(i=>!s.players[i].folded&&!s.players[i].allin));if(s.pending.size===1)s.pending.clear();s.next=s.order.find(i=>s.pending.has(i))??null;return;
 }
 let i=e.player,p=s.players[i];if(s.next!==i)throw Error('アクション順が不正です。');if(!p||p.folded||p.allin)throw Error('アクションできないプレイヤーです。');
 let need=round(s.currentBet-p.put),target=e.to||0,delta=0;
 if(e.action==='fold'){if(need<=0)throw Error('チェックできる場面ではフォールドしません。');p.folded=true;p.last='フォールド';}
 else if(e.action==='check'){if(need>.001)throw Error('ベットに対してチェックはできません。');p.last='チェック';}
 else if(e.action==='call'){if(need<=0)throw Error('コールするベットがありません。');delta=Math.min(need,p.stack);p.last='コール '+round(delta);}
 else if(e.action==='raise'||e.action==='bet'){
  if(!Number.isFinite(target)||target<=s.currentBet||target>p.put+p.stack+.001)throw Error('ベット額が不正です。');
  if(s.actedAt?.[i]!==null&&s.actedAt?.[i]!==undefined&&s.currentBet-s.actedAt[i]<s.minRaise-.001&&s.actedAt[i]>0)throw Error('ショートオールインではレイズ権が再開していません。');
  if(!s.players.some((v,j)=>j!==i&&!v.folded&&!v.allin))throw Error('レイズを受けられる相手がいません。');
  if(e.action==='bet'&&s.currentBet>0)throw Error('ベットではなくレイズです。');
  if(e.action==='raise'&&s.currentBet===0)throw Error('レイズではなくベットです。');
  if(target-s.currentBet<s.minRaise-.001&&target<p.put+p.stack-.001)throw Error('最低レイズ幅を満たしていません。');
  delta=target-p.put;let raise=target-s.currentBet;if(raise>=s.minRaise-.001){s.minRaise=raise;s.actedAt=Array(s.players.length).fill(null);s.pending=new Set(s.players.map((p,j)=>j).filter(j=>j!==i&&!s.players[j].folded&&!s.players[j].allin));}else for(let j=0;j<s.players.length;j++)if(j!==i&&!s.players[j].folded&&!s.players[j].allin&&s.players[j].put<target)s.pending.add(j);
  s.currentBet=target;p.last=(e.action==='bet'?'ベット ':'レイズ ')+round(target);
 }else throw Error('不明なアクションです。');
 p.stack=round(p.stack-delta);p.put=round(p.put+delta);p.total=round(p.total+delta);s.pot=round(s.pot+delta);p.allin=p.stack<=0;if(p.allin)p.last='ALL IN '+round(p.put);
 if(!s.actedAt)s.actedAt=Array(s.players.length).fill(null);s.actedAt[i]=s.currentBet;s.pending.delete(i);let alive=s.players.filter(p=>!p.folded);if(alive.length<=1){s.next=null;s.done=true;s.pending.clear();}else{let able=s.players.map((p,j)=>j).filter(j=>!s.players[j].folded&&!s.players[j].allin);if(able.length===1&&s.players[able[0]].put>=s.currentBet)s.pending.clear();s.next=nextIndex(s,i);}
}
function stateAt(q,count=(q.history||[]).length){if(q.snapshot){let s=JSON.parse(JSON.stringify(q.snapshot));s.pending=new Set(s.players.map((p,i)=>i).filter(i=>!s.players[i].folded&&!s.players[i].allin));return s;}let s=initialState(q);for(let e of q.history.slice(0,count))applyEvent(s,e);return s;}
function legalActions(s,hero){
 let p=s.players[hero],need=round(Math.max(0,s.currentBet-p.put)),a=[];
 if(need>0){a.push({id:'fold',label:'フォールド',kind:'fold',cost:0});a.push({id:'call',label:p.stack<=need?'オールイン コール':'コール',kind:'call',cost:Math.min(need,p.stack)});}else a.push({id:'check',label:'チェック',kind:'check',cost:0});
 let max=p.stack+p.put,others=s.players.filter((v,i)=>i!==hero&&!v.folded&&!v.allin),min=s.currentBet+s.minRaise;
 let reopened=!s.actedAt||s.actedAt[hero]===null||s.actedAt[hero]===undefined||s.actedAt[hero]===0||s.currentBet-s.actedAt[hero]>=s.minRaise-.001;
 if(max>s.currentBet+.001&&others.length&&reopened){
  let isRaise=s.currentBet>0,sizes=isRaise?[Math.max(min,s.currentBet*2.5),max]:[Math.max(1,s.pot*.33),Math.max(1,s.pot*.75),max];
  let prev=[];for(let t of sizes){t=round(Math.min(max,t));if(t<s.currentBet+.001||prev.some(v=>Math.abs(v-t)<.1))continue;if(t<min-.001&&t<max-.001)continue;prev.push(t);let all=t>=max-.001;let kind=isRaise?'raise':'bet';a.push({id:all?'allin':kind+'_'+t,label:all?'オールイン':(kind==='raise'?'レイズ':'ベット'),kind,cost:round(t-p.put),to:t,pct:isRaise?null:Math.round(t/s.pot*100)});}
 }
 return a;
}
function actionText(e,q){if(e.type==='deal')return STREET_NAMES[e.street];let a={fold:'フォールド',check:'チェック',call:'コール',bet:'ベット',raise:'レイズ'}[e.action];return q.players[e.player].pos+' · '+a+(e.to?' '+e.to+' BB':'');}
function generateQuestion(opts={}){if(!root.PokerStudy)throw Error('教材データを読み込めませんでした。ページを再読み込みしてください。');return root.PokerStudy.generate(opts);}
function defaultRange(s,q,idx){
 let pos=q.players[idx].pos,events=q.history.filter(e=>e.player===idx&&e.type==='action'),aggression=events.filter(e=>['raise','bet'].includes(e.action)).length;
 if(aggression>=2)return 'TT+,AQs+,AKo';if(aggression===1)return ['BTN','SB','CO'].includes(pos)?'44+,A2s+,K8s+,Q9s+,JTs,ATo+,KJo+':'66+,ATs+,KQs,AJo+';
 if(events.some(e=>e.action==='call'))return '22+,A2s+,K8s+,Q9s+,J9s+,T9s,98s,87s,76s,ATo+,KJo+,QJo';return 'random';
}
function boardTexture(board){if(board.length<3)return 'プリフロップ';let suits=board.map(c=>c%4),ranks=board.map(c=>c>>2),flush=Math.max(...[0,1,2,3].map(s=>suits.filter(x=>x===s).length)),paired=new Set(ranks).size<ranks.length;return (paired?'ペアボード':flush>=3?'同スートが多い':flush===2?'ツートーン':'レインボー')+(Math.max(...ranks)-Math.min(...ranks)<=5?' / 連結寄り':'');}
function payoff(eq,pot,h,v,rake,cap){let total=pot+h+v,fee=Math.min(total*rake/100,cap);return eq*(total-fee)-h;}
function pairPayoff(s,hero,vil,eq,h,v,rake,cap){
 let totals=s.players.map(p=>p.total||0);totals[hero]+=h;totals[vil]+=v;
 // Snapshot pots carry a synthetic contribution ledger consistent with the current bet.
 let total=s.pot+h+v,eh=Math.min(total,totals.reduce((sum,t)=>sum+Math.min(t,totals[hero]),0)),ev=Math.min(total,totals.reduce((sum,t)=>sum+Math.min(t,totals[vil]),0));
 let contested=Math.min(eh,ev),fee=Math.min(contested*rake/100,cap);
 return [eq*(eh-fee)+(1-eq)*Math.max(0,total-ev)-h,(1-eq)*(ev-fee)+eq*Math.max(0,total-eh)-v];
}
// Counterfactual regret matching for a finite HU check-down abstraction. Not a full NLHE solver.
function solveCFR(q,s,actions,opponents,progress){
 let vil=opponents[0],hero=q.hero,board=s.board,hRange=rangeCombos(q.heroRange||defaultRange(s,q,hero),board),vRange=rangeCombos(q.villainRange||defaultRange(s,q,vil),board);
 if(!hRange.some(c=>c.hand.every(x=>q.hand.includes(x))))hRange.unshift({hand:q.hand,weight:1});
 let sample=(r,known)=>{let a=[{hand:known,weight:1}];if(!known)a=[];let rest=shuffle(r);for(let c of rest){if(a.length>=18)break;if(!a.some(x=>x.hand[0]===c.hand[0]&&x.hand[1]===c.hand[1]))a.push(c);}return a;};
 let hr=sample(hRange,q.hand),vr=sample(vRange,null),matrix=[],pairs=[];let missing=5-board.length;
 for(let h=0;h<hr.length;h++){matrix[h]=[];for(let v=0;v<vr.length;v++){
  if(!unique(hr[h].hand.concat(vr[v].hand,board)))continue;
  let er=equityFixed([hr[h].hand,vr[v].hand],board,missing>2?70:80);matrix[h][v]=er.results[0].equity;pairs.push([h,v,hr[h].weight*vr[v].weight]);
 }if(progress)progress(.1+.45*h/hr.length);}
 if(!pairs.length)throw Error('両者のレンジに有効な組合せがありません。');
 const nodes=new Map(),pot=s.pot,need=Math.min(s.players[hero].stack,s.currentBet-s.players[hero].put),max=Math.min(s.players[hero].stack,s.players[vil].stack+need),rake=q.rake||0,cap=q.rakeCap||0;
 let get=(key,n)=>{if(!nodes.has(key))nodes.set(key,{r:Array(n).fill(0),sum:Array(n).fill(0)});return nodes.get(key);};
 function strat(node){let r=node.r.map(x=>Math.max(0,x)),t=r.reduce((a,b)=>a+b,0);return r.map(x=>t?x/t:1/r.length);}
 function terminal(e,h,v){return pairPayoff(s,hero,vil,e,h,v,rake,cap);}
 function visit(key,player,n,fn,rh,rv,update){let node=get(key,n),pr=strat(node),vals=pr.map((_,a)=>fn(a,player===0?rh*pr[a]:rh,player===1?rv*pr[a]:rv)),u=[0,0];for(let i=0;i<n;i++){u[0]+=pr[i]*vals[i][0];u[1]+=pr[i]*vals[i][1];}if(update){let cf=player===0?rv:rh,self=player===0?rh:rv;for(let i=0;i<n;i++){node.r[i]+=cf*(vals[i][player]-u[player]);node.sum[i]+=self*pr[i];}}return u;}
 function traverse(h,v,rh=1,rv=1,update=true){let eq=matrix[h][v];return visit('h:'+h,0,actions.length,(a,ah,av)=>{
  let act=actions[a];if(act.kind==='fold')return [0,pot-(s.street==='preflop'?0:Math.min(pot*rake/100,cap))];
  if(act.kind==='call')return terminal(eq,act.cost,0);
  if(act.kind==='check'){
   let b=Math.min(s.players[vil].stack,s.players[hero].stack,Math.max(1,pot*.66));
   return visit('vc:'+v,1,2,(x,bh,bv)=>x===0?terminal(eq,0,0):visit('hc:'+h,0,2,(z)=>z===0?[0,pot-(s.street==='preflop'?0:Math.min(pot*rake/100,cap))]:terminal(eq,b,b),bh,bv,update),ah,av,update);
  }
  let cost=Math.min(act.cost,max),vCost=Math.max(0,cost-need);
  return visit('v:'+v+':'+a,1,2,(x)=>x===0?[pot-(s.street==='preflop'?0:Math.min(pot*rake/100,cap)),0]:terminal(eq,cost,vCost),ah,av,update);
 },rh,rv,update);}
 let total=pairs.reduce((s,p)=>s+p[2],0),cum=[],acc=0;for(let p of pairs){acc+=p[2];cum.push(acc);}
 for(let it=0;it<14000;it++){let r=Math.random()*total,lo=0,hi=cum.length-1;while(lo<hi){let mid=(lo+hi)>>1;if(cum[mid]<r)lo=mid+1;else hi=mid;}let [h,v]=pairs[lo];traverse(h,v);if(progress&&it%3500===0)progress(.55+.35*it/14000);}
 const avg=(key,n)=>{let nd=get(key,n),t=nd.sum.reduce((a,b)=>a+b,0);return t?nd.sum.map(x=>x/t):strat(nd);};
 function actionValue(act,a,v){let eq=matrix[0][v];if(act.kind==='fold')return 0;if(act.kind==='call')return terminal(eq,act.cost,0)[0];
  if(act.kind==='check'){let vp=avg('vc:'+v,2),hp=avg('hc:0',2),b=Math.min(s.players[vil].stack,s.players[hero].stack,Math.max(1,pot*.66));return vp[0]*terminal(eq,0,0)[0]+vp[1]*hp[1]*terminal(eq,b,b)[0];}
  let vp=avg('v:'+v+':'+a,2),cost=Math.min(act.cost,max);return vp[0]*(pot-(s.street==='preflop'?0:Math.min(pot*rake/100,cap)))+vp[1]*terminal(eq,cost,Math.max(0,cost-need))[0];}
 let valid=vr.map((v,i)=>({i,w:v.weight})).filter(v=>matrix[0][v.i]!==undefined),sum=valid.reduce((a,v)=>a+v.w,0),freq=avg('h:0',actions.length);
 return {actions:actions.map((a,i)=>({...a,frequency:freq[i],ev:valid.reduce((x,v)=>x+v.w*actionValue(a,i,v.i),0)/sum})),method:'cfr',sampledHands:[hr.length,vr.length],iterations:14000,equity:valid.reduce((x,v)=>x+v.w*matrix[0][v.i],0)/sum,range:q.villainRange||defaultRange(s,q,vil),sourceLabel:'簡略CFR・近似',limitations:'ヘッズアップ、各レンジ最大18コンボ、1ストリート、最大1回の応答。将来のカードはチェックダウンで評価。完全なGTO解ではありません。エクスプロイタビリティ未測定。'};
}
function analyze(q,progress){
 if(q.lesson){if(!root.PokerStudy)throw Error('教材データを読み込めませんでした。');return root.PokerStudy.analyze(q,progress);}
 const s=stateAt(q),actions=q.reference?q.reference.actions:legalActions(s,q.hero);if(s.next!==q.hero)throw Error('入力履歴の次の手番がHeroではありません。');
 if(q.reference)return {actions:q.reference.actions,method:'imported',sourceLabel:'取込ソルバー解',sourceName:q.reference.solver,limitations:'利用者提供データ。記載条件の解を参照します。アプリ側でソルバーの精度を検証したものではありません。',equity:null,range:q.villainRange||'取込データの設定',unit:q.reference.unit||'bb'};
 const opp=s.players.map((p,i)=>i).filter(i=>i!==q.hero&&!s.players[i].folded),ranges=opp.map(i=>rangeCombos(q.villainRange||defaultRange(s,q,i),[...q.hand,...s.board]));
 let result;
 if(opp.length===1&&(!q.stage||['cash','early'].includes(q.stage)))result=solveCFR(q,s,actions,opp,progress);
 else{
  let er=rangeEquity(q.hand,s.board,ranges,6500),eq=er.equity,need=Math.min(s.currentBet-s.players[q.hero].put,s.players[q.hero].stack),pot=s.pot,icmMode=q.mode==='mtt'&&q.payouts?.length;
  let icmMemo=new Map(),utility=(e,h,v)=>{if(!icmMode)return payoff(e,pot,h,v,q.rake||0,q.rakeCap||0,s.street==='preflop');
   // All-in outcomes, fixed stacks for other players. Not an equilibrium ICM solve.
   let key=h+':'+v;if(!icmMemo.has(key)){let base=s.players.map(p=>p.stack),hi=q.hero,vi=opp[0],win=base.slice(),lose=base.slice(),fold=base.slice();fold[vi]+=pot;win[hi]+=pot+v;win[vi]=Math.max(0,win[vi]-v);lose[hi]=Math.max(0,lose[hi]-h);lose[vi]+=pot+h;icmMemo.set(key,{w:icm(win,q.payouts)[hi],l:icm(lose,q.payouts)[hi],f:icm(fold,q.payouts)[hi]});}let z=icmMemo.get(key);return e*z.w+(1-e)*z.l-z.f;};
  let vals=actions.map(a=>{let ev=0;if(a.kind==='fold')ev=0;else if(a.kind==='check')ev=utility(eq,0,0);else if(a.kind==='call')ev=utility(eq,a.cost,0);else{
   let realCost=Math.min(a.cost,...opp.map(i=>s.players[i].stack+need)),fe=clamp((.18+.22*Math.min(realCost/pot,2))**opp.length,.03,.70),calledEq=clamp(eq-.08-.04*Math.max(0,opp.length-1),.01,.99),oppCost=Math.max(0,realCost-need);ev=fe*(icmMode?utility(1,0,0):pot)+(1-fe)*utility(calledEq,realCost,oppCost);
  }return {...a,ev};});
  let best=Math.max(...vals.map(a=>a.ev)),temperature=icmMode?.025:Math.max(.15,pot*.045),sum=vals.reduce((x,a)=>x+Math.exp((a.ev-best)/temperature),0);result={actions:vals.map(a=>({...a,frequency:Math.exp((a.ev-best)/temperature)/sum})),method:'estimate',sourceLabel:icmMode?'ICM参考モデル・近似':'レンジEVモデル・近似',equity:eq,range:q.villainRange||'履歴から推定した各相手のレンジ',limitations:icmMode?'賞金・全員のスタックからICMを計算し、フォールド／勝敗の結果を比較。ベット応答は推定、多人数の決着は主な相手1人との近似。トーナメントGTO解ではありません。':'履歴から推定したレンジに対する試行エクイティと、推定フォールド率・応答で評価。全員の将来の最適応答を解いたGTO解ではありません。',unit:icmMode?'prize':'bb',trials:er.trials};
 }
 result.unit=result.unit||'bb';result.texture=boardTexture(s.board);result.category=category(q.hand.concat(s.board));result.potOdds=(s.currentBet-s.players[q.hero].put)>0?(s.currentBet-s.players[q.hero].put)/(s.pot+s.currentBet-s.players[q.hero].put):null;return result;
}
function grade(q,result,id){if(result.method==='lesson')return root.PokerStudy.grade(q,result,id);let a=result.actions.find(a=>a.id===id);if(!a)throw Error('回答が見つかりません。');let hasEV=result.actions.every(a=>Number.isFinite(a.ev));let best=hasEV?Math.max(...result.actions.map(a=>a.ev)):null,loss=hasEV?Math.max(0,best-a.ev):null,pot=stateAt(q).pot,scale=result.unit==='prize'?Math.max(.02,(q.payouts||[1]).reduce((a,b)=>a+b,0)*.003):Math.max(.3,pot*.10),score=hasEV?Math.round(100*clamp(1-loss/scale,0,1)):Math.round(100*clamp(a.frequency/.5,0,1));let label=hasEV?(loss<=scale*.08?'最良の選択':loss<=scale*.30?'許容範囲':loss<=scale*.75?'改善の余地':'大きなミス'):(a.frequency>=.1?'ミックス候補':a.frequency>=.01?'低頻度の選択':'推奨外');let uncertain=result.method==='math'&&result.details?.evError>0&&loss>1e-10&&loss<=result.details.evError;if(uncertain){score=100;label='計算誤差内の選択';}return {score,label,loss,action:a,hasEV,mistake:uncertain?false:hasEV?loss>scale*.3:a.frequency<.01};}
function validateImported(data){
 if(!data||data.schema!=='poker-scope-solutions-v1'||!Array.isArray(data.spots)||!data.spots.length||data.spots.length>2000)throw Error('poker-scope-solutions-v1形式のspots（1〜2000件）が必要です。');
 return data.spots.map((q,i)=>{
  q=JSON.parse(JSON.stringify(q));if(q.legacyHUOrder)throw Error('取込解には標準ルールの履歴を指定してください。');q.generatorVersion=2;if(q.snapshot)throw Error('取り込みにはブラインドからのhistoryを指定してください。');if(!['cash','mtt'].includes(q.mode)||!Array.isArray(q.players)||![2,6,9].includes(q.players.length)||!Number.isInteger(q.hero)||!q.players[q.hero])throw Error((i+1)+'件目の人数・Hero・モードが不正です。');
  const expected=POS[q.players.length];q.players.forEach((p,j)=>{if(p.pos!==expected[j]||!Number.isFinite(p.stack)||p.stack<=0||p.stack>10000)throw Error('プレイヤーは標準ポジション順で、スタックをBBで指定してください。');});
  q.hand=parseCards(q.hand);if(q.hand.length!==2||!unique(q.hand))throw Error('Heroのハンドが不正です。');if(!Array.isArray(q.history)||q.history.length>150)throw Error('アクション履歴が必要です。');for(let e of q.history)if(e.type==='deal')e.cards=parseCards(e.cards);
  let known=q.hand.concat(q.history.filter(e=>e.type==='deal').flatMap(e=>e.cards));if(!unique(known))throw Error('ハンドとボードにカード重複があります。');if(q.ante!==undefined&&(!Number.isFinite(q.ante)||q.ante<0))throw Error('アンティが不正です。');
  let s=stateAt(q);if(s.next!==q.hero||s.done)throw Error('問題の手番がHeroになっていません。');let ref=q.reference;if(!ref||typeof ref.solver!=='string'||!ref.solver.trim()||ref.solver.length>150||!Array.isArray(ref.actions)||ref.actions.length<2||ref.actions.length>12)throw Error('ソルバー名と2〜12個の戦略アクションが必要です。');
  if(!['bb','prize',undefined].includes(ref.unit))throw Error('EV単位はbbかprizeです。');
  if(q.payouts!==undefined&&(!Array.isArray(q.payouts)||!q.payouts.length||q.payouts.length>q.players.length||q.payouts.some((p,j)=>!Number.isFinite(p)||p<0||(j>0&&p>q.payouts[j-1]))||!q.payouts.some(p=>p>0)))throw Error('賞金は人数以下の配列で、0以上・大きい順に指定してください。');
  if(ref.unit==='prize'&&!q.payouts)throw Error('賞金単位の解にはpayoutsも指定してください。');
  if(q.genre!==undefined&&(typeof q.genre!=='string'||q.genre.length>50))throw Error('genreは50文字以下の文字列です。');
  if(q.stage!==undefined&&!['cash','early','bubble','final'].includes(q.stage))throw Error('stageが不正です。');
  let legal=legalActions(s,q.hero),seen=new Set(),sum=0;
  ref.actions.forEach(a=>{if(typeof a.id!=='string'||seen.has(a.id))throw Error('アクションIDが重複しています。');seen.add(a.id);if(!Number.isFinite(a.frequency)||a.frequency<0||a.frequency>1)throw Error('頻度は0〜1で指定します。');sum+=a.frequency;
   let p=s.players[q.hero],need=s.currentBet-p.put;if(['fold','call','check'].includes(a.kind)){let base=legal.find(x=>x.kind===a.kind);if(!base)throw Error('履歴に対して選べないアクションです。');a.cost=base.cost;}
   else if(['bet','raise'].includes(a.kind)){if(!Number.isFinite(a.to))throw Error('ベットのto額が必要です。');let copy=stateAt(q);applyEvent(copy,{type:'action',player:q.hero,action:a.kind,to:a.to});a.cost=round(a.to-p.put);}
   else throw Error('kindはfold/check/call/bet/raiseです。');
   a.label=String(a.label||{fold:'フォールド',call:'コール',check:'チェック',bet:'ベット',raise:'レイズ'}[a.kind]).slice(0,60);if(a.ev!==undefined&&!Number.isFinite(a.ev))throw Error('EVは数値で入力します。');
  });
  if(Math.abs(sum-1)>.015)throw Error('アクション頻度の合計を1にしてください。');if(ref.actions.some(a=>a.ev!==undefined)&&!ref.actions.every(a=>Number.isFinite(a.ev)))throw Error('EVは全アクションに付けるか、すべて省略してください。');ref.actions.forEach(a=>a.frequency/=sum);
  q.id=uid();q.source='imported';q.street=s.street;q.genre=q.genre||'imported';q.depth=q.players[q.hero].stack;q.rake=Number(q.rake||0);q.rakeCap=Number(q.rakeCap||0);if(!Number.isFinite(q.rake)||q.rake<0||q.rake>100||!Number.isFinite(q.rakeCap)||q.rakeCap<0||q.rakeCap>10000)throw Error('レーキ・上限の値が不正です。');q.stage=q.stage||(q.mode==='mtt'?'early':'cash');q.created=Date.now();return q;
 });
}
const api={RANKS,SUITS,STREETS,STREET_NAMES,POS,rand,pick,round,clamp,uid,shuffle,cardStr,parseCard,parseCards,unique,handName,evaluate,category,preStrength,rangeCombos,equityFixed,rangeEquity,icm,initialState,applyEvent,stateAt,legalActions,actionText,generateQuestion,analyze,grade,validateImported,defaultRange,boardTexture,pairPayoff};
root.Poker=api;if(typeof module!=='undefined')module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
