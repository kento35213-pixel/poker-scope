const P=require('../dist/engine.js');require('../dist/study.js');
let seed=20261026;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const report={version:3,seed:20261026,note:'直近最大12パターンを避ける標準練習を抽選し、出題前履歴を検査。実戦のGTO行動頻度ではありません。',modes:[]};
for(let mode of ['cash','mtt']){let recent=[],seen=new Set(),row={mode,samples:10000,immediateRepeats:0,limpHistories:0,nonSbLimpHistories:0,coldCallHistories:0,chainsOf2ColdCallers:0,exceptionThemes:0};
 for(let k=0;k<row.samples;k++){let q=P.generateQuestion({mode,table:6,curriculum:'standard',recentFamilies:recent}),s=P.initialState(q),limped=false,field=false,cold=0;row.immediateRepeats+=Number(recent.at(-1)===q.lesson.id);seen.add(q.lesson.id);recent.push(q.lesson.id);recent=recent.slice(-12);row.exceptionThemes+=Number(q.lesson.exception);
 for(let e of q.history){if(e.type==='deal')break;if(e.action==='call'){if(s.currentBet<=1&&q.players[e.player].pos!=='BB'){limped=true;if(q.players[e.player].pos!=='SB')field=true;}else if(s.players[e.player].put===0&&q.players[e.player].pos!=='BB')cold++;}P.applyEvent(s,e);}
 row.limpHistories+=Number(limped);row.nonSbLimpHistories+=Number(field);row.coldCallHistories+=Number(cold>0);row.chainsOf2ColdCallers+=Number(cold>=2);
 }row.uniqueFamilies=seen.size;report.modes.push(row);
}
console.log(JSON.stringify(report,null,2));
