const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const P=require('../dist/engine.js'),S=require('../dist/study.js');
function seeded(fn){let old=Math.random,seed=20261026;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};try{return fn();}finally{Math.random=old;}}

test('each of 43 families has a reviewed source and produces legal decisions in supported modes/tables',()=>seeded(()=>{
 assert.equal(S.families.length,43);assert.equal(Object.keys(S.sources).length,17);let checks=0;
 for(let f of S.families){assert.ok(f.sources.length);for(let key of f.sources){assert.ok(S.sources[key]);assert.match(S.sources[key].url,/^https:\/\/blog\.gtowizard\.com\//);}
 for(let mode of f.modes)for(let n of [2,6,9]){if(!S.available({mode,table:n}).some(x=>x.id===f.id))continue;
  let q=P.generateQuestion({mode,table:n,familyId:f.id}),s=P.initialState(q),start=q.players.reduce((x,p)=>x+p.stack,0);
  for(let e of q.history){if(e.type==='deal')for(let p of s.players)if(!p.folded&&!p.allin)assert.equal(p.put,s.currentBet);P.applyEvent(s,e);assert.ok(Math.abs(s.pot+s.players.reduce((x,p)=>x+p.stack,0)-start)<.0011);}
  assert.equal(s.next,q.hero);assert.equal(s.street,q.street);assert.ok(P.unique(q.hand.concat(s.board)));assert.equal(q.generatorVersion,2);
  for(let a of S.actionsFor(q)){let st=P.stateAt(q);P.applyEvent(st,{type:'action',player:q.hero,action:a.kind,...(a.to?{to:a.to}:{})});}
  if(!f.math){let r=P.analyze(q);assert.equal(r.method,'lesson');assert.ok(r.actions.some(a=>a.rubric===100));assert.ok(r.actions.every(a=>a.frequency===null&&a.ev===null));let best=r.actions.find(a=>a.rubric===100);assert.equal(P.grade(q,r,best.id).score,100);}
  checks++;
 }}assert.ok(checks>150);
}));

test('normal curriculum has no unprompted field limps or chains of cold callers',()=>seeded(()=>{
 for(let mode of ['cash','mtt']){let total=3000,limped=0;
 for(let i=0;i<total;i++){let q=P.generateQuestion({mode,table:6,curriculum:'standard'}),s=P.initialState(q),cold=0,hasLimp=false;
  for(let e of q.history){if(e.type==='deal')break;if(e.action==='call'){if(s.currentBet<=1&&q.players[e.player].pos!=='BB'){assert.equal(q.players[e.player].pos,'SB');assert.equal(q.lesson.route,'vsLimp');hasLimp=true;}else if(s.players[e.player].put===0&&q.players[e.player].pos!=='BB'){cold++;assert.ok(['squeeze','coldCheck'].includes(q.lesson.route));}}P.applyEvent(s,e);}
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
 const html=fs.readFileSync('dist/index.html','utf8'),worker=fs.readFileSync('dist/worker.js','utf8');assert.match(html,/study\.js\?v=2/);assert.match(worker,/study\.js\?v=2/);
});

test('legacy HU answers can replay their historical order but new solver imports require standard rules',()=>{
 let q={players:P.POS[2].map(pos=>({pos,stack:100})),hero:0,hand:P.parseCards('As Kh'),mode:'cash',history:[{type:'action',player:0,action:'raise',to:2.5},{type:'action',player:1,action:'call'},{type:'deal',street:'flop',cards:P.parseCards('Qc 7h 2d')}]};
 assert.equal(P.stateAt(q).next,1);q.legacyHUOrder=true;assert.equal(P.stateAt(q).next,0);assert.throws(()=>P.validateImported({schema:'poker-scope-solutions-v1',spots:[q]}),/標準ルール/);
});
