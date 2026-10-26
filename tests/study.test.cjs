const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const P=require('../dist/engine.js'),S=require('../dist/study.js');
function seeded(fn){let old=Math.random,seed=20261026;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};try{return fn();}finally{Math.random=old;}}

test('each of 100 families has a reviewed source and produces legal decisions in supported modes/tables',()=>seeded(()=>{
 assert.equal(S.families.length,100);assert.equal(Object.keys(S.sources).length,29);let checks=0;
 for(let f of S.families){assert.ok(f.sources.length);for(let key of f.sources){assert.ok(S.sources[key]);assert.match(S.sources[key].url,/^https:\/\/blog\.gtowizard\.com\//);}
 for(let mode of f.modes)for(let n of [2,6,9]){if(!S.available({mode,table:n}).some(x=>x.id===f.id))continue;
  let q=P.generateQuestion({mode,table:n,familyId:f.id}),s=P.initialState(q),start=q.players.reduce((x,p)=>x+p.stack,0);
  for(let e of q.history){if(e.type==='deal')for(let p of s.players)if(!p.folded&&!p.allin)assert.equal(p.put,s.currentBet);P.applyEvent(s,e);assert.ok(Math.abs(s.pot+s.players.reduce((x,p)=>x+p.stack,0)-start)<.0011);}
  assert.equal(s.next,q.hero);assert.equal(s.street,q.street);assert.ok(P.unique(q.hand.concat(s.board)));assert.equal(q.generatorVersion,3);
  for(let a of S.actionsFor(q)){let st=P.stateAt(q);P.applyEvent(st,{type:'action',player:q.hero,action:a.kind,...(a.to?{to:a.to}:{})});}
  if(!f.math){let r=P.analyze(q);assert.equal(r.method,'lesson');assert.ok(r.actions.some(a=>a.rubric===100));assert.ok(r.actions.every(a=>a.frequency===null&&a.ev===null));let best=r.actions.find(a=>a.rubric===100);assert.equal(P.grade(q,r,best.id).score,100);}
  checks++;
 }}assert.ok(checks>150);
}));

test('normal curriculum has no unprompted field limps or chains of cold callers',()=>seeded(()=>{
 for(let mode of ['cash','mtt']){let total=3000,limped=0;
 for(let i=0;i<total;i++){let q=P.generateQuestion({mode,table:6,curriculum:'standard'}),s=P.initialState(q),cold=0,hasLimp=false;
  for(let e of q.history){if(e.type==='deal')break;if(e.action==='call'){if(s.currentBet<=1&&q.players[e.player].pos!=='BB'){assert.equal(q.players[e.player].pos,'SB');assert.equal(q.lesson.route,'vsLimp');hasLimp=true;}else if(s.players[e.player].put===0&&q.players[e.player].pos!=='BB'){cold++;assert.ok(['squeeze','coldCheck','multiCbet'].includes(q.lesson.route));}}P.applyEvent(s,e);}
  assert.ok(cold<=1);limped+=Number(hasLimp);
 }assert.ok(limped/total<.025);
 }
}));

test('check/call continuation, probes and donk decisions have different preceding histories',()=>{
 for(let familyId of ['turn-low-trips','probe-draw','turn-ip-value']){let mode=familyId==='probe-draw'?'cash':'mtt',q=P.generateQuestion({mode,table:6,familyId}),s=P.initialState(q),lastFlop=[];
 for(let e of q.history){if(e.type==='deal'&&e.street==='turn')break;P.applyEvent(s,e);if(s.street==='flop'&&e.type==='action')lastFlop.push(e);}
 if(familyId==='probe-draw')assert.ok(lastFlop.every(e=>e.action==='check'));
 else assert.deepEqual(lastFlop.map(e=>e.action),['check','bet','call']);
 if(familyId==='turn-ip-value')assert.notEqual(q.players[q.hero].pos,'BB');else assert.equal(q.players[q.hero].pos,'BB');
 }
});

test('heads-up BB acts first postflop independently of the generated history',()=>{
 let q={players:P.POS[2].map(pos=>({pos,stack:100})),ante:0},s=P.initialState(q);P.applyEvent(s,{type:'action',player:0,action:'raise',to:2.5});P.applyEvent(s,{type:'action',player:1,action:'call'});P.applyEvent(s,{type:'deal',street:'flop',cards:P.parseCards('As 7h 2c')});assert.equal(s.next,1);P.applyEvent(s,{type:'action',player:1,action:'check'});assert.equal(s.next,0);
});

test('river drills enumerate range combos: too few bluffs fold, excess bluffs call, equilibrium ratio mixes',()=>{
 for(let [familyId,sign] of [['river-low-bluff',-1],['river-many-bluffs',1],['river-indifferent',0]]){
 let q=P.generateQuestion({mode:'cash',table:6,familyId}),r=P.analyze(q),call=r.actions.find(a=>a.kind==='call'),fold=r.actions.find(a=>a.kind==='fold');assert.equal(r.method,'math');assert.equal(r.details.exact,true);assert.equal(fold.ev,0);assert.ok(r.actions.every(a=>a.frequency===null));
 if(sign===0){assert.ok(Math.abs(call.ev)<1e-10);assert.equal(P.grade(q,r,call.id).score,100);assert.equal(P.grade(q,r,fold.id).score,100);}else assert.equal(Math.sign(call.ev),sign);
 }
});

test('ICM drills state all payouts and stacks and calculate finite outcome values',()=>{
 for(let familyId of ['icm-bubble','icm-final']){let q=P.generateQuestion({mode:'mtt',table:6,familyId}),r=P.analyze(q);assert.equal(q.payouts.length,6);assert.ok(q.villainRange.length);assert.equal(r.unit,'prize');for(let k of ['foldEquity','winEquity','loseEquity','tieEquity','threshold','evError'])assert.ok(Number.isFinite(r.details[k]));assert.ok(r.actions.every(a=>Number.isFinite(a.ev)));assert.ok(r.details.winEquity>r.details.loseEquity);assert.ok(r.trials>10000);let d=r.details,zero=(d.threshold-d.tieProbability/2)*d.winEquity+d.tieProbability*d.tieEquity+(1-d.threshold-d.tieProbability/2)*d.loseEquity-d.foldEquity;assert.ok(Math.abs(zero)<1e-10);}
});

test('unsupported conditions are reported and never silently replaced with an unrelated street',()=>{
 assert.throws(()=>P.generateQuestion({mode:'cash',table:6,streets:['river'],genre:'rfi'}),/対応する教材問題がありません/);
 assert.throws(()=>P.generateQuestion({mode:'mtt',table:6,streets:['flop'],stage:'bubble'}),/対応する教材問題がありません/);
 for(let f of S.families){let mode=f.modes[0],q=P.generateQuestion({mode,table:6,streets:[f.street],familyId:f.id});assert.equal(q.street,f.street);}
});

test('the fixed-probability action simulator and forced-continuation generator are removed',()=>{
 const text=fs.readFileSync('dist/engine.js','utf8');assert.ok(!text.includes('chooseOpponentAction'));assert.ok(!text.includes('forceContinue'));
 const html=fs.readFileSync('dist/index.html','utf8'),worker=fs.readFileSync('dist/worker.js','utf8');assert.match(html,/study\.js\?v=3/);assert.match(worker,/study\.js\?v=3/);
});

test('legacy HU answers can replay their historical order but new solver imports require standard rules',()=>{
 let q={players:P.POS[2].map(pos=>({pos,stack:100})),hero:0,hand:P.parseCards('As Kh'),mode:'cash',history:[{type:'action',player:0,action:'raise',to:2.5},{type:'action',player:1,action:'call'},{type:'deal',street:'flop',cards:P.parseCards('Qc 7h 2d')}]};
 assert.equal(P.stateAt(q).next,1);q.legacyHUOrder=true;assert.equal(P.stateAt(q).next,0);assert.throws(()=>P.validateImported({schema:'poker-scope-solutions-v1',spots:[q]}),/標準ルール/);
});

test('new action paths preserve who raised and who is making the next decision',()=>{
 const get=id=>S.generate({mode:'cash',table:6,depth:100,familyId:id});
 let q=get('vs4bet-aces'),raises=q.history.filter(e=>e.action==='raise');
 assert.deepEqual(raises.map(e=>[q.players[e.player].pos,e.to]),[['BTN',2.5],['BB',9.2],['BTN',22]]);assert.equal(q.players[q.hero].pos,'BB');
 for(let id of ['face-xr-top','face-turn-top','delayed-value','river-nut-value','river-showdown','river-checked-value','multi-monster-check']){
  let q=get(id),s=P.initialState(q),byStreet={preflop:[],flop:[],turn:[],river:[]};
  for(let e of q.history){P.applyEvent(s,e);if(e.type==='action')byStreet[s.street].push(e);}
  assert.equal(s.next,q.hero);
  if(id==='face-xr-top'){assert.deepEqual(byStreet.flop.map(e=>e.action),['check','bet','raise']);assert.equal(q.players[q.hero].pos,'BTN');}
  if(id==='face-turn-top'){assert.deepEqual(byStreet.turn.map(e=>e.action),['check','bet']);assert.equal(q.players[q.hero].pos,'BB');}
  if(id==='delayed-value'||id==='river-checked-value')assert.ok(byStreet.flop.every(e=>e.action==='check'));
  if(id==='river-checked-value'||id==='river-showdown')assert.ok(byStreet.turn.every(e=>e.action==='check'));
  if(id==='river-nut-value')assert.deepEqual(byStreet.turn.map(e=>e.action),['check','bet','call']);
  if(id==='multi-monster-check'){assert.equal(s.players.filter(p=>!p.folded).length,3);assert.equal(q.players[q.hero].pos,'CO');assert.ok(s.pending.has(q.players.findIndex(p=>p.pos==='BTN')));}
 }
});

test('all new river ranges are genuinely polar and their exact EV matches an independent payoff sum',()=>seeded(()=>{
 let families=S.families.filter(f=>f.id.startsWith('river-math-'));assert.equal(families.length,18);
 for(let f of families)for(let attempt=0;attempt<4;attempt++){
  let q=S.generate({mode:'cash',table:6,depth:100,familyId:f.id,rake:attempt%2?10:0,rakeCap:4}),s=P.stateAt(q),hero=P.evaluate(q.hand.concat(s.board)),used=q.hand.concat(s.board),r=S.analyze(q);
  const values=P.rangeCombos(q.lesson.valueRange,used),bluffs=P.rangeCombos(q.lesson.bluffRange,used);
  assert.ok(values.every(c=>P.evaluate(c.hand.concat(s.board))>hero));assert.ok(bluffs.every(c=>P.evaluate(c.hand.concat(s.board))<hero));
  assert.ok(Math.abs(r.equity-f.bluffShare)<1e-10);assert.ok(q.lesson.setup.includes(q.lesson.valueRange));assert.ok(q.lesson.setup.includes(q.lesson.bluffRange));
  let cost=s.currentBet-s.players[q.hero].put,total=s.pot+cost,fee=Math.min(total*q.rake/100,q.rakeCap),payoff=0;
  for(let c of S.polarRange(q)){let cmp=Math.sign(hero-P.evaluate(c.hand.concat(s.board)));payoff+=c.weight*((cmp>0?total-fee:cmp===0?(total-fee)/2:0)-cost);}
  assert.ok(Math.abs(r.actions.find(a=>a.kind==='call').ev-payoff)<1e-9);assert.ok(Math.abs(r.details.threshold-cost/(total-fee))<1e-12);
 }
}));

test('recent families are excluded when alternatives exist and single-pattern filters remain usable',()=>seeded(()=>{
 let recent=[];for(let k=0;k<200;k++){let q=S.generate({mode:'cash',table:6,recentFamilies:recent});assert.ok(!recent.includes(q.lesson.id));recent.push(q.lesson.id);recent=recent.slice(-12);}
 let options={mode:'cash',table:6,depth:40,genre:'riverbet'},pool=S.available(options);assert.equal(pool.length,1);
 for(let i=0;i<3;i++)assert.equal(S.generate({...options,recentFamilies:[pool[0].id]}).lesson.id,pool[0].id);
 let two={mode:'mtt',table:6,genre:'coldcall',depth:40},a=S.generate(two),b=S.generate({...two,recentFamilies:[a.lesson.id]});assert.notEqual(a.lesson.id,b.lesson.id);
}));

test('short-stack alternatives do not mutate the rubric for subsequent deep-stack questions',()=>{
 let f=S.families.find(f=>f.id==='open-value'),before=JSON.stringify(f);
 let short=S.generate({mode:'mtt',table:6,depth:15,familyId:f.id});assert.ok(short.lesson.also.includes('jam'));
 let deep=S.generate({mode:'mtt',table:6,depth:80,familyId:f.id});assert.ok(!deep.lesson.also.includes('jam'));assert.equal(JSON.stringify(f),before);
});

test('every eligible depth and table combination supports a legal answer without falling back',()=>seeded(()=>{
 let checks=0;
 for(let f of S.families)for(let mode of f.modes)for(let table of [2,6,9])for(let depth of [10,12,14,15,20,25,30,40,60,80,100,150,200]){
  let o={mode,table,depth,familyId:f.id};if(!S.available(o).some(x=>x.id===f.id))continue;
  let q=S.generate(o),s=P.initialState(q),total=q.players.reduce((sum,p)=>sum+p.stack,0);
  for(let e of q.history){P.applyEvent(s,e);assert.ok(Math.abs(s.pot+s.players.reduce((sum,p)=>sum+p.stack,0)-total)<.0011);}
  assert.equal(q.lesson.id,f.id);assert.equal(s.next,q.hero);assert.equal(s.street,f.street);assert.ok(P.unique(q.hand.concat(s.board)));
  if(!f.math)assert.ok(S.analyze(q).actions.some(a=>a.rubric===100));checks++;
 }
 assert.ok(checks>2500);
}));
