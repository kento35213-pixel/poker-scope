const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../dist/engine.js');
const S=require('../dist/study.js');
const cs=P.parseCards;
const makeQ=(n=6,stacks)=>({players:P.POS[n].map((pos,i)=>({pos,stack:stacks?.[i]??100})),ante:0,history:[],hero:0,hand:cs('As Kh'),mode:'cash'});

test('all 52 cards round-trip and range cardinalities respect blockers and weights',()=>{
 for(let i=0;i<52;i++)assert.equal(P.parseCard(P.cardStr(i)),i);
 for(let [r,n] of [['AA',6],['AKs',4],['AKo',12],['AK',16],['TT+',30],['AJs+',12],['random',1326]])assert.equal(P.rangeCombos(r).length,n,r);
 assert.equal(P.rangeCombos('AA',cs('As')).length,3);
 assert.equal(P.rangeCombos('AsKh:0.5')[0].weight,.5);
 assert.throws(()=>P.rangeCombos('ZZ'));
});

test('hand evaluator ranks wheel, flush, double trips, quads and kicker correctly',()=>{
 const fixtures=[['As Ks Qs Js Ts 2d 3d','ストレートフラッシュ'],['As Ad Ah Ac Ks Kh Qh','フォーカード'],['As Ad Ah Ks Kh Kd 2s','フルハウス'],['As Qs 9s 7s 3s 2d Kd','フラッシュ'],['As 2s 3d 4h 5c Kd Qd','ストレート'],['As Ah Ad Ks Qs 8h 2d','スリーカード'],['As Ah Ks Kh Qs Jd 2h','ツーペア']];
 for(let [s,c] of fixtures)assert.equal(P.category(cs(s)),c,s);
 assert.ok(P.evaluate(cs('2s 3s 4s 5s 6d'))>P.evaluate(cs('As 2h 3d 4c 5d')));
 assert.ok(P.evaluate(cs('As Ad Ah Ks Kh 2c 3c'))>P.evaluate(cs('Ks Kd Kh As Ah 2c 3c')));
 assert.ok(P.evaluate(cs('As Ah Kd Qc 9s 3c 2h'))>P.evaluate(cs('Ac Ad Kc Jh Ts 4d 2d')));
});

test('seven-card results agree with the maximum over every five-card subset',()=>{
 for(let it=0;it<600;it++){
  let cards=P.shuffle(Array.from({length:52},(_,i)=>i)).slice(0,7),best=0;
  for(let a=0;a<7;a++)for(let b=a+1;b<7;b++)best=Math.max(best,P.evaluate(cards.filter((_,i)=>i!==a&&i!==b)));
  assert.equal(P.evaluate(cards),best,cards.map(P.cardStr).join(' '));
 }
});

test('royal board splits a three-player pot equally, and a completed river is exact',()=>{
 let r=P.equityFixed([cs('2s 3s'),cs('4h 5h'),cs('6d 7d')],cs('Ac Kc Qc Jc Tc'));
 assert.equal(r.exact,true);assert.equal(r.trials,1);
 for(let x of r.results){assert.equal(x.win,0);assert.equal(x.tie,1);assert.equal(x.equity,1/3);}
 let winner=P.equityFixed([cs('As Ah'),cs('Ks Kh')],cs('Ac 2d 3h 7s 9d'));
 assert.equal(winner.results[0].equity,1);
 assert.throws(()=>P.equityFixed([cs('As Ah'),cs('As Kh')],[]));
});

test('turn and flop enumerate every legal remaining runout, equity sums to 1',()=>{
 for(let [b,n] of [['2s 3h 7c 9d',44],['2s 3h 7c',990]]){
  let r=P.equityFixed([cs('As Ah'),cs('Ks Kh')],cs(b));assert.equal(r.trials,n);assert.equal(r.exact,true);assert.ok(Math.abs(r.results.reduce((a,x)=>a+x.equity,0)-1)<1e-12);
 }
});

test('ICM conserves payouts and equal stacks have equal prize equity',()=>{
 for(let x of P.icm([10,10,10],[50,30,20]))assert.ok(Math.abs(x-100/3)<1e-10);
 assert.deepEqual(P.icm([90,10],[100,0]),[90,10]);
 let v=P.icm([8,12,20,60],[50,30,20,0]);assert.ok(Math.abs(v.reduce((a,b)=>a+b,0)-100)<1e-9);assert.ok(v[3]>v[2]);
 assert.equal(P.icm([0,100],[70,30])[0],30);
});

test('blind option is a check/raise, and short all-ins do not reopen an earlier raise',()=>{
 let q=makeQ(2),s=P.initialState(q);P.applyEvent(s,{type:'action',player:0,action:'call'});let legal=P.legalActions(s,1);assert.equal(legal[0].id,'check');assert.ok(legal.some(a=>a.kind==='raise'&&a.to===2.5));assert.ok(!legal.some(a=>a.kind==='bet'));
 let six=makeQ(6,[100,4,100,100,100,100]),t=P.initialState(six);
 P.applyEvent(t,{type:'action',player:0,action:'raise',to:3});
 P.applyEvent(t,{type:'action',player:1,action:'raise',to:4});
 for(let i of [2,3,4,5])P.applyEvent(t,{type:'action',player:i,action:'fold'});
 assert.equal(t.next,0);assert.ok(!P.legalActions(t,0).some(a=>a.kind==='raise'));assert.throws(()=>P.applyEvent(t,{type:'action',player:0,action:'raise',to:8}));
});

test('heads-up action EV excludes uncallable excess and returns it to the opponent',()=>{
 let q=makeQ(2,[10,100]),s=P.initialState(q); // SB 0.5, BB 1
 P.applyEvent(s,{type:'action',player:0,action:'raise',to:10});
 let call=P.pairPayoff(s,1,0,1,9,0,0,0);assert.equal(call[0],11); // win a 20BB pot after adding 9
 let t={players:[{total:10},{total:100}],pot:110};
 let out=P.pairPayoff(t,0,1,1,0,0,0,0);assert.equal(out[0],20);assert.equal(out[1],90);
 assert.equal(out[0]+out[1],110);
});

test('random histories preserve chips, betting-round completion, legal cards and action order',()=>{
 for(let mode of ['cash','mtt'])for(let n of [2,6,9])for(let it=0;it<120;it++){
  let q=P.generateQuestion({mode,table:n}),s=P.initialState(q),initial=q.players.reduce((a,p)=>a+p.stack,0);
  for(let e of q.history){
   if(e.type==='deal')for(let p of s.players)if(!p.folded&&!p.allin)assert.equal(p.put,s.currentBet);
   P.applyEvent(s,e);assert.ok(s.players.every(p=>p.stack>=0));assert.ok(Math.abs(initial-s.pot-s.players.reduce((a,p)=>a+p.stack,0))<.0011);
  }
  assert.equal(s.next,q.hero);assert.ok(P.legalActions(s,q.hero).length>=2);assert.ok(P.unique(q.hand.concat(s.board)));assert.equal(s.street,q.street);
 }
});

test('genre filters and fixed street/depth constraints hold across randomized samples',()=>{
 for(let genre of ['rfi','vsopen','3bet','cbet','facing'])for(let it=0;it<12;it++){
  let q=P.generateQuestion({mode:'cash',genre,table:6}),s=P.stateAt(q),first=q.history.findIndex(e=>e.type==='deal'),pre=q.history.slice(0,first<0?q.history.length:first),raises=pre.filter(e=>e.action==='raise').length;
  if(genre==='rfi'){assert.equal(q.street,'preflop');assert.ok(pre.every(e=>e.action==='fold'));}
  if(genre==='vsopen'){assert.equal(raises,1);assert.ok(s.currentBet>s.players[q.hero].put);}
  if(genre==='3bet')assert.ok(raises>=2);
  if(genre==='facing')assert.ok(s.currentBet>s.players[q.hero].put);
 }
 for(let st of P.STREETS){let q=P.generateQuestion({mode:'cash',streets:[st],depth:'100',table:6});assert.equal(q.street,st);assert.ok(q.players.every(p=>p.stack===100));}
 for(let i=0;i<6;i++){let q=P.generateQuestion({mode:'cash',table:2,genre:'3bet',streets:['preflop']});assert.ok(q.history.some(e=>e.player===q.hero));assert.ok(q.history.filter(e=>e.action==='raise').length>=2);}
});

test('model frequencies sum to one, EVs stay finite and every root action is legal',()=>{
 for(let [mode,n,stage] of [['cash',2,'cash'],['cash',6,'cash'],['mtt',6,'bubble'],['mtt',2,'early']]){
  let q=P.generateQuestion({mode,table:n,stage});delete q.lesson;let s=P.stateAt(q),r=P.analyze(q);
  assert.ok(Math.abs(r.actions.reduce((a,c)=>a+c.frequency,0)-1)<1e-9);
  for(let a of r.actions){assert.ok(Number.isFinite(a.ev));assert.ok(a.frequency>=0&&a.frequency<=1);let t=P.stateAt(q);P.applyEvent(t,{type:'action',player:q.hero,action:a.kind,...(a.to?{to:a.to}:{})});}
  let best=r.actions.reduce((a,b)=>a.ev>b.ev?a:b),g=P.grade(q,r,best.id);assert.equal(g.score,100);assert.equal(g.loss,0);
 }
});

test('solution import validates full conditions and rejects duplicated cards / wrong strategy totals',()=>{
 let q={mode:'cash',players:P.POS[2].map(pos=>({pos,stack:100})),hero:0,hand:'As Kh',ante:0,history:[],reference:{solver:'Local reference',unit:'bb',actions:[{id:'f',kind:'fold',frequency:0,ev:0},{id:'c',kind:'call',frequency:.2,ev:.3},{id:'r',kind:'raise',to:3,frequency:.8,ev:.3}]}};
 let wrap=x=>({schema:'poker-scope-solutions-v1',spots:[x]}),good=P.validateImported(wrap(q));assert.equal(good[0].source,'imported');assert.equal(P.analyze(good[0]).method,'imported');
 let bad=structuredClone(q);bad.hand='As As';assert.throws(()=>P.validateImported(wrap(bad)));
 bad=structuredClone(q);bad.reference.actions[1].frequency=.9;assert.throws(()=>P.validateImported(wrap(bad)));
 bad=structuredClone(q);bad.hero=1;assert.throws(()=>P.validateImported(wrap(bad)));
});
