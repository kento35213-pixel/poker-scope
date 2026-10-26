const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const P=require('../dist/engine.js');
const S=require('../dist/study.js');
function app(){
 let files=[];let nodes={'#app':{innerHTML:''},'#toast':{textContent:'',classList:{add(){},remove(){}}}},events={},store=new Map();
 class LocalWorker{terminate(){this.stopped=true;}postMessage(m){setImmediate(()=>{if(this.stopped)return;try{let result=m.type==='equity'?P.equityFixed(m.payload.hands,m.payload.board,m.payload.trials):P.analyze(m.payload);this.onmessage({data:{id:m.id,result}});}catch(e){this.onmessage({data:{id:m.id,error:e.message}});}});}}
 let context={Poker:P,PokerStudy:S,location:{hash:''},document:{querySelector:s=>nodes[s]||null,addEventListener:(n,f)=>events[n]=f,body:{append(){}},createElement:tag=>({files:[],click(){if(tag==='input'&&files.length){let d=JSON.stringify(files.shift());this.files=[{size:d.length,text:async()=>d}];this.onchange?.();}},remove(){}})},window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},Worker:LocalWorker,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},Blob,URL,console};
 vm.runInNewContext(fs.readFileSync('dist/app.js','utf8'),context,{filename:'app.js'});
 const click=(action,data={})=>{let e={dataset:{action,...data},disabled:false};events.click({target:{closest:()=>e}});};
 const change=(id,value)=>events.change({target:{id,value}});
 return {html:()=>nodes['#app'].innerHTML,click,change,store,upload:d=>{files.push(d);click('restore');},wait:()=>new Promise(resolve=>setImmediate(resolve))};
}
test('all five routes render and quiz answers persist without exposing a solution beforehand',async()=>{
 let a=app();await a.wait();assert.match(a.html(),/トレーニングを開始/);assert.match(a.html(),/アクションの流れ/);
 for(let mode of ['mtt','spot','equity','records','cash']){a.click('nav',{mode});assert.match(a.html(),/<h1>/);assert.ok(!a.html().includes('undefined'));}
 a.click('start');a.click('skip');await a.wait();assert.match(a.html(),/あなたのアクションは/);assert.ok(!a.html().includes('判断のポイント'));
 let id=a.html().match(/data-action="answer" data-id="([^"]+)"/)[1];a.click('answer',{id});assert.match(a.html(),/判断のポイント/);assert.match(a.html(),/学習記録に追加済み/);assert.match(a.html(),/この問題の参照先/);
 let records=JSON.parse(a.store.get('poker-scope-answers'));assert.equal(records.length,1);
 a.click('answer',{id});assert.equal(JSON.parse(a.store.get('poker-scope-answers')).length,1);
 a.click('nav',{mode:'records'});assert.match(a.html(),/回答履歴/);assert.match(a.html(),/振り返る/);
});
test('equity UI supports adding players, choosing cards and displaying computed splits',async()=>{
 let a=app();await a.wait();a.click('nav',{mode:'equity'});a.click('calculate-equity');await a.wait();assert.match(a.html(),/エクイティ比較/);assert.match(a.html(),/モンテカルロ/);
 a.click('add-player');assert.match(a.html(),/3 \/ 6 人/);assert.ok(!a.html().includes('エクイティ比較'));
 a.click('pick',{target:'eqhand',i:'2',j:'0'});assert.match(a.html(),/カードを選択/);a.click('choose-card',{card:String(P.parseCard('Qs'))});
 a.click('pick',{target:'eqhand',i:'2',j:'1'});a.click('choose-card',{card:String(P.parseCard('Qh'))});a.click('calculate-equity');await a.wait();assert.match(a.html(),/エクイティ比較/);assert.match(a.html(),/QQ/);
});
test('custom spot inputs produce a finite strategy and changing the input invalidates it',async()=>{
 let a=app();await a.wait();a.click('nav',{mode:'spot'});a.click('analyze-spot');await a.wait();assert.match(a.html(),/この局面の戦略/);assert.match(a.html(),/簡略CFR/);
 a.change('spot-bet','2');assert.ok(!a.html().includes('この局面の戦略'));a.click('analyze-spot');await a.wait();assert.match(a.html(),/必要勝率/);assert.match(a.html(),/フォールド/);
});
test('genre settings keep compatible streets and short-stack filters',async()=>{
 let a=app();await a.wait();a.click('nav',{mode:'mtt'});a.change('quiz-genre','pushfold');assert.match(a.html(),/ショート \/ ジャム/);assert.ok(!a.html().includes('value="80"'));
 a.click('settings');assert.match(a.html(),/トレーニング設定/);a.click('close-modal');assert.ok(!a.html().includes('role="dialog"'));
});

test('lesson records with no invented EV/frequencies restore and deduplicate correctly',async()=>{
 let a=app();await a.wait();a.change('quiz-genre','rfi');a.click('start');a.click('skip');await a.wait();let id=a.html().match(/data-action="answer" data-id="([^"]+)"/)[1];a.click('answer',{id});let records=JSON.parse(a.store.get('poker-scope-answers'));assert.equal(records[0].result.method,'lesson');assert.ok(records[0].result.actions.every(x=>x.frequency===null&&x.ev===null));
 let b=app();await b.wait();let backup={schema:'poker-scope-backup-v1',records,solutions:[],settings:{}};b.upload(backup);await b.wait();assert.equal(JSON.parse(b.store.get('poker-scope-answers')).length,1);b.upload(backup);await b.wait();assert.equal(JSON.parse(b.store.get('poker-scope-answers')).length,1);b.click('nav',{mode:'records'});assert.match(b.html(),/教材 v3/);
});

test('pre-answer topic headings do not disclose the intended CB answer',async()=>{
 let a=app();await a.wait();a.change('quiz-genre','cbet');a.change('quiz-depth','100');a.click('start');a.click('skip');await a.wait();assert.ok(!a.html().includes('IPでの小さいCB'));assert.ok(!a.html().includes('IPのベットを自動化しない'));assert.match(a.html(),/CBの判断 · フロップ/);assert.ok(!a.html().includes('判断のポイント'));
});

test('expanded categories align their streets and show the matching pool count',async()=>{
 let a=app();await a.wait();assert.match(a.html(),/収録 100 パターン/);
 for(let [genre,street] of [['4bet','preflop'],['multiway','flop'],['delayed','turn'],['riverbet','river']]){
  a.change('quiz-genre',genre);let settings=JSON.parse(a.store.get('poker-scope-settings')).cash;assert.deepEqual(settings.streets,[street]);
  let count=S.available({...settings,mode:'cash'}).length;assert.ok(count>0);assert.ok(a.html().includes('現在の条件 '+count+' パターン'));
  a.click('start');a.click('skip');await a.wait();assert.match(a.html(),/あなたのアクションは/);assert.ok(!a.html().includes('判断のポイント ·'));
 }
});

test('quiz sessions pass their recent patterns to the sampler and keep older lesson versions identifiable',async()=>{
 let a=app();await a.wait();let ids=[];
 for(let k=0;k<16;k++){
  a.click('start');a.click('skip');await a.wait();let id=a.html().match(/data-action="answer" data-id="([^"]+)"/)[1];a.click('answer',{id});
  let records=JSON.parse(a.store.get('poker-scope-answers')),last=records.at(-1);assert.ok(!ids.slice(-12).includes(last.q.lesson.id));ids.push(last.q.lesson.id);
 }
 let records=JSON.parse(a.store.get('poker-scope-answers'));records[0].q.generatorVersion=2;let b=app();await b.wait();b.upload({schema:'poker-scope-backup-v1',records,solutions:[],settings:{}});await b.wait();b.click('nav',{mode:'records'});assert.match(b.html(),/教材 v2/);assert.match(b.html(),/教材 v3/);
});
