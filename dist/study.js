/* Original practice scenarios informed by the cited public teaching articles.
   This is a curriculum, not an export of a commercial solver database. */
(function(root){
'use strict';
const P=root.Poker||(typeof require==='function'?require('./engine.js'):null);
const SOURCES={
 rfi:{title:'Preflop Raise Sizing: Examining 2 Key Factors',url:'https://blog.gtowizard.com/preflop-raise-sizing-examining-2-key-factors/',note:'参加レンジ・位置・レーキを区別し、参加時はレイズで先手を取る。'},
 cold:{title:'Cold-Calling in Straddle + Ante Games',url:'https://blog.gtowizard.com/cold-calling-in-straddle-ante-games/',note:'通常のレーキありキャッシュではBTN・BB以外のコールドコールは限定的。ストラドル＋アンティは別条件。'},
 squeeze:{title:'How To Construct a Squeezing Range',url:'https://blog.gtowizard.com/how-to-construct-a-squeezing-range/',note:'オープンとコールが入った後のスクイーズ。通常の3ベットとはレンジとサイズが異なる。'},
 limp:{title:'Is Limping Pimping?',url:'https://blog.gtowizard.com/is-limping-pimping/',note:'SB、HU、短いスタック等のリンプを通常のポジションのリンプと区別する。'},
 btnlimp:{title:'The Curious Case of Open-Limping Buttons',url:'https://blog.gtowizard.com/curious-case-of-open-limping-buttons/',note:'短いBTNではリンプ・小さなレイズ・ジャムが共存し、強いトラップもリンプに含む。'},
 sb:{title:'Playing Limped Pots as the BB in MTTs',url:'https://blog.gtowizard.com/playing-limped-pots-as-the-bb-in-mtts/',note:'SBリンプに対するBBのチェックと、強いハンド等によるアイソレートを区別する。'},
 donk:{title:'Is Donk Betting for Donkeys?',url:'https://blog.gtowizard.com/is-donk-betting-for-donkeys/',note:'フロップのドンクは通常限定的。低い連結ボード等の例外はスタックと相手位置に依存する。'},
 turn:{title:'How and Why You Should Use Turn Donk Bets',url:'https://blog.gtowizard.com/how-and-why-you-should-use-turn-donk-bets/',note:'前街をコールしたレンジを強化する低いペアやドロー完成カードが、ターンのリード候補になる。'},
 ip:{title:'Flop Heuristics: IP C-Betting in MTTs',url:'https://blog.gtowizard.com/flop-heuristics-ip-c-betting-in-mtts/',note:'PFRとBBのレンジ差、ボードの連結性、ペア・ドローの作りやすさを比較する。'},
 coldflop:{title:'Flop Heuristics: IP Cold Caller in MTTs',url:'https://blog.gtowizard.com/flop-heuristics-ip-cold-caller-in-mtts/',note:'IPのコールドコーラーはBBより強い範囲。PFRのチェックを放棄と決めつけない。'},
 threebet:{title:'C-Betting OOP in 3-Bet Pots',url:'https://blog.gtowizard.com/c-betting-oop-in-3-bet-pots/',note:'3ベッターのレンジ優位とSPRを考慮。40bbのA64rでは小さく打てる一方、深い低い連結ボードは別。'},
 draw:{title:'Check-Raising a Single Pair',url:'https://blog.gtowizard.com/check-raising-a-single-pair/',note:'大きなポットを作る価値とフォールドエクイティを考える。強いドローと単なるワンペアは区別する。'},
 mono:{title:'Maximizing Value on Monotone Flops',url:'https://blog.gtowizard.com/maximizing-value-on-monotone-flops/',note:'モノトーンでも無条件に強い役ばかりとは限らない。小さいポットと後の大きいポットではレンジが違う。'},
 probe:{title:'Probe Betting',url:'https://blog.gtowizard.com/probe-betting/',note:'前街のチェックバック後のベットはプローブ。前街がベット・コールのドンクと区別する。'},
 bluff:{title:'The Art of Bluff Catching',url:'https://blog.gtowizard.com/the-art-of-bluff-catching-2/',note:'ブラフキャッチはベット額と、実際の相手レンジの価値・ブラフの比率で判断する。'},
 icm:{title:'ICM Basics',url:'https://blog.gtowizard.com/icm-basics/',note:'賞金と全員のスタックから勝敗後の価値を計算。チップEVの必要勝率だけでコールしない。'},
 cover:{title:'Donk Betting As the Covering Stack in MTTs',url:'https://blog.gtowizard.com/donk-betting-as-the-covering-stack-in-mtts/',note:'カバーするスタックのICM圧力で、cEVとは異なるドンク戦略が生じる。ドンクを全面禁止しない。'},
 bigopen:{title:'How to Respond to Large Preflop Raises in Poker',url:'https://blog.gtowizard.com/how-to-respond-to-large-preflop-raises-in-poker/',note:'オープン額が変わると、BBのコール価格と継続できるハンドも変わる。'},
 fourbet:{title:'IP 4-Betting in Deep-Stacked Cash Games',url:'https://blog.gtowizard.com/ip-4-betting-in-deep-stacked-cash-games/',note:'3ベット・4ベットへの応答では、位置・サイズ・残りスタックを区別する。'},
 ipdef:{title:'Mastering Three-Bet Pots In Position in MTTs',url:'https://blog.gtowizard.com/mastering-three-bet-pots-in-position-in-mtts/',note:'IPのコールには位置の価値がある。OOPと同じレイズ一辺倒にはしない。'},
 paired:{title:'Defending vs BB Check-Raise on Paired Flops',url:'https://blog.gtowizard.com/defending-vs-bb-check-raise-on-paired-flops/',note:'チェックレイズに対し、強い手のコールも重要。ペア・ドロー以外のディフェンスもサイズ次第。'},
 preserve:{title:'Protect Equity and Prosper',url:'https://blog.gtowizard.com/protect-equity-and-prosper/',note:'中程度の手は、チェックによって弱い相手レンジを残し、エクイティを保てる。'},
 delayed:{title:'Delayed C-Betting',url:'https://blog.gtowizard.com/delayed-c-betting/',note:'フロップをチェックした攻撃者がターンで打つディレイCB。プローブと区別する。'},
 turncall:{title:'The Four-Point Checklist for Calling Turn Barrels',url:'https://blog.gtowizard.com/the-four-point-checklist-for-calling-turn-barrels/',note:'ベット額、ボードとの接続、改善した役、ブロッカーからターンの継続を考える。'},
 drawsip:{title:'Betting Draws in Position: The Real Rules',url:'https://blog.gtowizard.com/betting-draws-in-position-the-real-rules/',note:'ドローも自動的にベットしない。レンジ全体とチェック後の展開を考える。'},
 multiway:{title:'Probing in 3-Way Pots',url:'https://blog.gtowizard.com/probing-out-of-position-in-3-way-pots/',note:'後ろに相手を残す攻撃者は強い手もチェックする。HUのチェック後の推論をそのまま使わない。'},
 riverplay:{title:'Principles of River Play',url:'https://blog.gtowizard.com/principles-of-river-play/',note:'IPではチェックで手番を閉じられる。バリューベットはコールされる範囲への強さで判断する。'},
 checked:{title:'Mastering Thin Value Bets in Checked-Down Pots',url:'https://blog.gtowizard.com/mastering-thin-value-bets-in-checked-down-pots/',note:'チェックが続いた履歴と、リバーで改善したハンドを使って価値を見直す。'},
 spr:{title:'Stack-to-Pot Ratio',url:'https://blog.gtowizard.com/stack-to-pot-ratio/',note:'残りスタックとポットの比率で、オールインに必要な手の強さが変わる。'}
};
const F=[];
function add(id,title,modes,street,genre,route,extra){F.push({id,title,modes,street,genre,route,weight:1,scope:'principle',...extra});}
const BOTH=['cash','mtt'];
add('open-value','未参加ポットの参加判断',BOTH,'preflop','rfi','rfi',{hands:'TT+,AQs+,AKo',answer:'open',sources:['rfi'],why:'強いハンドはレイズでポットを作り、後ろのプレイヤーに無料のエクイティ実現を許さない。リンプを標準の入口にしない。'});
add('open-trash','弱いオフスートの扱い',BOTH,'preflop','rfi','rfi',{hands:'72o,83o,92o,T2o,J3o',answer:'fold',sources:['rfi'],why:'後ろに複数の相手がいる場面で、弱く連結しないオフスートは参加を見送る。ランダムなハンドでも必ずプレーする必要はない。',noSB:true});
add('open-late','レイトポジションの参加判断',BOTH,'preflop','rfi','rfi',{hands:'KQs,KJs,QJs,JTs,ATs,AJs,AJo,KQo',answer:'open',sources:['rfi'],late:true,why:'CO・BTNでは残る人数とポジションの価値が変わる。ここで選ぶプレーしやすいハンド群は、レイズで参加する教材例。'});
add('threebet-value','オープンへの応答',BOTH,'preflop','vsopen','vsopen',{minDepth:15,hands:'AA,KK,AKs',answer:'raise',sources:['cold'],why:'強いレンジは3ベットで価値を取り、後ろの参加も抑える。全ポジションを同じコール確率にしない。'});
add('coldcall-fold','フィールドからのコール判断',['cash'],'preflop','vsopen','vsopen',{hands:'KTo,QTo,JTo,A8o,A9o',answer:'fold',sources:['cold'],field:true,why:'早い位置からのオープンに対し、未投資の位置から弱いオフスートを横コールすると、支配される危険とスクイーズの負担を抱える。'});
add('sb-threebet','SBからの応答',['cash'],'preflop','vsopen','vsopen',{minDepth:15,hands:'AA,KK,QQ,AKs,AQs',answer:'raise',sources:['cold'],hero:'SB',opener:'BTN',why:'SBはBBを残し、フロップ後も位置が悪い。ここでは強いハンドで3ベットし、受け身のコールドコールを増やさない。'});
add('bb-defend','BBのディフェンス',BOTH,'preflop','vsopen','vsopen',{hands:'JTs,T9s,98s,QJs,KTs',answer:'call',also:['raise'],sources:['rfi'],hero:'BB',opener:'BTN',why:'BBは既投資があり、コールでアクションを閉じられる。通常の横コールより価格が良い。スーテッドの連結ハンドはコール候補で、3ベットの別解も否定しない。'});
add('squeeze-value','オープンとコールの後',BOTH,'preflop','squeeze','squeeze',{hands:'AA,KK,AKs',answer:'raise',sources:['squeeze'],minDepth:30,why:'既にコーラーがいるため、これはスクイーズ。強いハンドで大きめにレイズし、デッドマネーとマルチウェイになる危険を意識する。'});
add('fourbet-value','3ベットを受けた後',['cash'],'preflop','3bet','vs3bet',{hands:'AA,KK',answer:'raise',also:['call'],sources:['threebet'],minDepth:60,why:'強いペアは4ベットで価値を取り得る。一部の条件ではトラップのコールもあるため、教材判定ではコールも別解として扱う。厳密な配分は元の解で確認する。'});
add('mtt-aa-trap','40bb・3ベットへの応答',['mtt'],'preflop','3bet','vs3bet',{hands:'AA',answer:'call',sources:['threebet'],depths:[40],opener:'UTG',threebettor:'BB',scope:'example',why:'記事の40bb UTG対BBの例では、AAをコールに残す。強いハンドを常に4ベットする単純化では、トラップの役割を失う。アンティやツリーを含む完全一致の解を転記したものではない。'});
add('mtt-btn-jam','短いBTNの参加方法',['mtt'],'preflop','pushfold','rfi',{hands:'AKo,AQo',answer:'jam',sources:['btnlimp'],hero:'BTN',depths:[12,14],maxDepth:15,exception:true,why:'公開例の短いBTNでは、AKo・AQoのような強いオフスートもジャムに入る。スーテッドと同じリンプ戦略にまとめず、フォールドエクイティとポストフロップの性質を考える。'});
add('mtt-btn-trap','短いBTNのトラップ',['mtt'],'preflop','limped','rfi',{hands:'AA,KK',answer:'limp',also:['jam'],sources:['btnlimp'],hero:'BTN',depths:[12,14],exception:true,why:'短いBTNのリンプには強いペアのトラップも必要になる。弱いハンドだけをリンプすると、ブラインド側に攻撃される。ジャムも教材上の別解として残す。'});
add('mtt-sb-limp','SBでフォールドが回った場面',['mtt'],'preflop','limped','rfi',{hands:'J8s,T8s,98s,87s,76s',answer:'limp',also:['open'],sources:['limp','sb'],hero:'SB',depths:[20,25,30],exception:true,why:'MTTのSBはリンプを含めて参加できる重要な例外。フィールドのオープンリンプと区別する。レイズも別解に残し、ここでの厳密な混合比率は採点しない。'});
add('bb-isolate','SBリンプへの応答',BOTH,'preflop','limped','vsLimp',{hands:'AA,KK,QQ,AKs',answer:'raise',sources:['sb'],hero:'BB',exception:true,minDepth:15,why:'SBのリンプを見て常にチェックすると、強いハンドで価値を取る機会を逃す。アイソレートでポットを作る。通常の未オープンポットと区別する。'});
add('bb-option','BBのチェック権',['mtt'],'preflop','limped','vsLimp',{hands:'J8o,T8o,97o,86o',answer:'check',also:['raise'],sources:['sb'],hero:'BB',exception:true,why:'SBリンプに対し、BBには追加投入なしのチェックがある。弱いハンドもポラライズされたレイズに含まれ得るので、レイズを一律に誤答にしない。'});
add('bb-high-check','通常ボードの最初の判断',BOTH,'flop','donk','srpLead',{hands:'QJs,JTs,88,77,KTs,A9s',board:'As Kd 7c',answer:'check',sources:['donk'],why:'高いカードの多いボードではPFRの強い範囲が保たれやすい。BBはまずチェックし、相手のベットに対する応答を用意する。'});
add('bb-jt9-check','連結ボードでも一律にはリードしない',['mtt'],'flop','donk','srpLead',{hands:'Q9s,J8s,T8s,87s,A6s,77',board:'Js Td 9c',answer:'check',sources:['donk'],opener:'UTG',depths:[20],scope:'example',why:'記事の20bb・UTG対BBでは、JT9rは654rと異なりBBがリードしない例。連結しているだけでドンクを選ばない。'});
add('bb-mono-check','モノトーンの最初の判断',BOTH,'flop','donk','srpLead',{hands:'KQs,QJs,JTs,88,76s,65s',board:'Kh 9h 5h',answer:'check',sources:['mono'],depths:[40,100],why:'モノトーンでもBBが無条件にリードする理由にはならない。強い役を含めたチェックで、相手のベットへの応答を組み立てる。'});
add('ip-small-cbet','IPでの小さいCB',BOTH,'flop','cbet','srpCbet',{hands:'AQo,KQs,QJs,JTs,99,88',board:'Ks Kd 4c',answer:'small',also:['check'],sources:['ip'],opener:'BTN',depths:[40,100],why:'ペアでレインボーのボードはBBがヒットできる種類が少なく、小さいCBでエクイティを奪いやすい。チェックも別解に残し、コンボ単位の頻度は推測しない。'});
add('ip-low-control','IPのベットを自動化しない',BOTH,'flop','cbet','srpCbet',{hands:'AQo,KJo,AJs,KQs',board:'9s 8d 7c',answer:'check',also:['large'],sources:['ip'],opener:'BTN',depths:[40,100],why:'中位の連結ボードはBBにペアや強いドローを多く作る。弱いオーバーカードを自動的に小さく打たない。ポラライズした大きいベットの別解も区別する。'});
add('threebet-small','OOP・3ベットポットのCB',['mtt'],'flop','3bet','threebetCbet',{hands:'KK,QQ,JJ,TT,KQs,AKs',board:'As 6d 4c',answer:'small',sources:['threebet'],depths:[40],opener:'UTG',scope:'example',why:'記事の40bb・A64rの3ベットポットでは、OOP側は小さいベットを広く使える。SRPでBBがリードするドンクとは、前街の攻撃者が異なる。'});
add('deep-low-threebet','深い3ベットポットの管理',['cash'],'flop','3bet','threebetCbet',{hands:'AKo,AQs,KQs',board:'6s 5d 4c',answer:'check',also:['tiny'],sources:['threebet'],depths:[100,150,200],why:'深い低い連結ボードでは、3ベッターでも無条件に大きく打てない。チェックやごく小さいベットで、OOPからポットを膨らませる負担を管理する。'});
add('donk-top-pair','低いフロップのリード例外',['mtt'],'flop','donk','srpLead',{hands:'T7s,97s,Q7s,K7s',board:'7s 6d 4c',answer:'small',also:['check'],sources:['donk'],depths:[20],opener:'UTG',exception:true,scope:'example',why:'20bb UTG対BBの764rは、小さいドンクが活きる公開例。脆いトップペアは価値とプロテクションを得る。通常の全ボードへ広げず、チェックもEV不明の別解に残す。'});
add('donk-air-check','ドンク用ボードでも手札を選ぶ',['mtt'],'flop','donk','srpLead',{hands:'QJo,K2o,A2o',board:'7s 6d 4c',answer:'check',sources:['donk'],depths:[20],opener:'UTG',exception:true,scope:'example',why:'同じ低いボードでも、弱いオフスートのオーバーカードを何でも打つわけではない。公開例でチェック側に残るハンド群を使い、役割の違いを練習する。'});
add('defend-pair','小さいCBへのディフェンス',BOTH,'flop','facing','faceCbet',{hands:'KQs,KJs,KTs',board:'Ks 8d 3c',answer:'call',also:['raise'],sources:['ip','draw'],why:'小さいCBに対し、トップペアは継続する価値を持つ。コールで弱いベットを残せる。コンボによるレイズも一律には否定しない。'});
add('defend-draw','強いドローの応答',BOTH,'flop','checkraise','faceCbet',{exactHands:['8d6d','AdJd'],board:'Qh 7d 5d',answer:'raise',also:['call'],sources:['draw'],why:'強いドローはフォールドエクイティを取りながら、コールされても改善できる。チェックレイズとコールの両方を正答とし、未公表の配分を作らない。'});
add('cold-ip-control','IPコーラーのチェックバック',['mtt'],'flop','coldcall','coldCheck',{hands:'A9s,A8s,TT,99,88,JJ',board:'As Jd 6c',answer:'check',sources:['coldflop'],depths:[40],opener:'UTG',why:'PFRのチェックは弱さを保証しない。静的なAJ6rでは中程度の役の多くがチェックバックし、JJも相手の継続範囲をブロックする。'});
add('cold-ip-protect','IPコーラーのプロテクション',['mtt'],'flop','coldcall','coldCheck',{hands:'QQ,JJ,TT',board:'9d 8d 6c',answer:'small',also:['check'],sources:['coldflop'],depths:[40],opener:'UTG',why:'動的な986ttでは、強いが脆いオーバーペアは小さく打つ価値を持つ。前の静的なボードと同じチェック方針に固定しない。'});
add('turn-low-trips','下のカードがペアになったターン',['mtt'],'turn','donk','turnLead',{hands:'73s,63s,43s',board:'Js 5c 3d 3h',answer:'small',also:['check'],sources:['turn'],depths:[40],opener:'BTN',exception:true,scope:'example',why:'フロップのコール範囲にある低いペアが強化されるターン。弱いキッカーのトリップスは、小さいリードで価値を取りやすい教材例。'});
add('turn-trips-trap','同じトリップスでもキッカーを見る',['mtt'],'turn','donk','turnLead',{hands:'A3s,K3s',board:'Js 5c 3d 3h',answer:'check',also:['small'],sources:['turn'],depths:[40],opener:'BTN',exception:true,scope:'example',why:'強いキッカーの3xは、相手のブラフを残すチェック候補。手役名が同じでも、相手のフォールド範囲との関係で役割が変わる。'});
add('turn-kq9-blank','ターンのリードを控える判断',['mtt'],'turn','donk','turnLead',{hands:'K8s,K7s,Q8s,Q7s',board:'Ks Qh 9d Jc',answer:'check',sources:['turn'],depths:[40],opener:'UTG',why:'KQ9からのJは、UTGにも強いブロードウェイを作る。ドローが完成したという見た目だけで、BBのナッツ優位と決めつけない。'});
add('turn-kq9-trips','レンジを強化する下のペア',['mtt'],'turn','donk','turnLead',{hands:'98s,97s,T9s',board:'Ks Qh 9d 9c',answer:'small',also:['check'],sources:['turn'],depths:[40],opener:'UTG',exception:true,why:'下の9がペアになると、BBが持つ9xの重要性が増す。小さいリードで価値を取る例として出題し、通常ターンと分けて扱う。'});
add('turn-straight','コール範囲のストレート完成',['mtt'],'turn','donk','turnLead',{hands:'98o,98s',board:'Ks 7d 5h 6c',answer:'small',also:['check','large'],sources:['turn'],depths:[40],opener:'UTG',exception:true,why:'BBの98がストレートになる6は、単に相手の強いカードが出たターンと異なる。BBのコール範囲が強化される理由を確認する。'});
add('turn-flush','二色フロップからのフラッシュ完成',['mtt'],'turn','donk','turnLead',{exactHands:['9h8h','Th8h'],board:'Ks Qh 5h 2h',answer:'small',also:['check','large'],sources:['turn'],depths:[40],opener:'UTG',exception:true,why:'フロップをコールしたドローが完成し、BBのレンジの一部が強化される。小さくリードする方針を学ぶが、原文の各コンボの頻度を転記した問題ではない。'});
add('probe-weak-check','チェックバック後の弱いハンド',['cash'],'turn','probe','probe',{exactHands:['9s7s','Ts9s','Qc9c'],board:'Ad Kh 8h 4s',answer:'check',sources:['probe'],depths:[100,150,200],why:'強いPFRのチェックバック範囲にはショーダウン価値が残る。BBのノードローに近い弱い手で、チェックを見ただけのプローブを連発しない。'});
add('probe-draw','チェックバック後のセミブラフ',['cash'],'turn','probe','probe',{exactHands:['7h6h','6h5h'],board:'Ad Kh 8h 4s',answer:'large',also:['check'],sources:['probe'],depths:[100,150,200],why:'BBのプローブは、ナッツ側と改善可能なブラフを組み合わせる。ここではフラッシュとストレートの可能性を持つドローで、大きいサイズの候補を考える。'});
add('turn-ip-value','IPで改善した強い手',BOTH,'turn','barrel','turnCbet',{exactHands:['AsJs','AsTs'],board:'Ks 7s 2d 4s',answer:'large',also:['small'],sources:['mono'],minDepth:40,why:'強い完成役を得たら、相手の弱い継続範囲から価値を取る。フラッシュ完成を理由にチェック一辺倒にせず、後の街のポットも意識する。'});
add('turn-ip-control','ターンのポット管理',BOTH,'turn','barrel','turnCbet',{hands:'QQ,JJ,TT',board:'Ks 8d 3c 2h',answer:'check',sources:['draw'],minDepth:40,why:'トップカードより下の中程度のペアを、連続して大きく打って強い範囲だけにコールされる形へ変えない。チェックしてショーダウン価値を保つ教材例。'});
add('river-low-bluff','リバーのレンジと価格',BOTH,'river','bluffcatch','riverMath',{hands:'KQo',board:'Kc 9d 5h 2c 3s',math:'river',bluffShare:.15,sources:['bluff'],minDepth:40,scope:'conditional',why:'相手のレンジを問題文で固定し、コールとフォールドのEVを比較する数理問題。ブラフの少ない範囲には、トップペアという理由だけでコールしない。'});
add('river-many-bluffs','リバーのブラフ比率',BOTH,'river','bluffcatch','riverMath',{hands:'KQo',board:'Kc 9d 5h 2c 3s',math:'river',bluffShare:.50,sources:['bluff'],minDepth:40,scope:'conditional',why:'同じハンド・ボード・サイズでも、相手レンジのブラフ比率が変わればコールEVは変わる。手役の強さだけで決めない。'});
add('river-indifferent','リバーの無差別条件',BOTH,'river','bluffcatch','riverMath',{hands:'KQo',board:'Kc 9d 5h 2c 3s',math:'river',bluffShare:1/3,sources:['bluff'],depths:[100],scope:'conditional',why:'レーキ0・ポットベット・価値2にブラフ1という固定条件では、純粋なブラフキャッチャーのコールとフォールドが同じEVになる。両方を正答とする。'});
add('icm-bubble','バブルのオールイン応答',['mtt'],'preflop','icm','icm',{hands:'TT,99,88,AQs,AJs,AQo',math:'icm',sources:['icm'],stage:'bubble',scope:'conditional',minDepth:12,maxDepth:40,why:'相手のジャムレンジを固定して、勝ち・負け・同点・フォールド後の全員のスタックをICMに変換する。将来の全ゲームを解いたGTO戦略ではない。'});
add('icm-final','ファイナルのオールイン応答',['mtt'],'preflop','icm','icm',{hands:'TT,99,88,AQs,AJs,AQo',math:'icm',sources:['icm'],stage:'final',scope:'conditional',minDepth:12,maxDepth:40,why:'同じチップ数の増減でも賞金価値は対称ではない。賞金配分と短いスタックの存在を使い、指定レンジへのコールEVを計算する。'});

// Additional authored situations. Sizes and accepted alternatives are teaching
// choices, not unpublished GTO Wizard combo frequencies.
add('early-select','アーリーからの参加範囲',BOTH,'preflop','rfi','rfi',{hero:'UTG',noHU:true,hands:'A8o,K9o,QTo,JTo',answer:'fold',minDepth:40,sources:['rfi','cold'],why:'後ろに多くの相手が残るため、弱いオフスートを無理に参加させない。レイトのオープンレンジをアーリーへそのまま移さない練習。'});
add('btn-wheel','BTNのスーテッドA',BOTH,'preflop','rfi','rfi',{hero:'BTN',hands:'A5s,A4s,A3s',answer:'open',minDepth:40,sources:['rfi'],why:'BTNでは残る相手がブラインドだけになる。スーテッドAのナッツ可能性と位置の価値を活かしてレイズで参加する教材例。'});
add('co-middle-pairs','COの中程度のペア',BOTH,'preflop','rfi','rfi',{hero:'CO',hands:'66,77,88,99',answer:'open',minDepth:40,sources:['rfi'],why:'フォールドが回ったCOで中程度のペアを扱う。セットになるまで受け身にリンプするのではなく、レイズで先手を取る。'});
add('bb-minopen','ミニマムオープンへの応答',BOTH,'preflop','vsopen','vsopen',{hero:'BB',opener:'BTN',openSize:2,hands:'T9s,98s,87s,76s',answer:'call',also:['raise'],minDepth:20,sources:['bigopen','ipdef'],why:'BBの既投資と、小さいオープンが与える価格を確認する。スーテッドの連結ハンドはコールで継続でき、3ベットの候補も含めて学ぶ。'});
add('bb-bigopen','大きいオープンへの応答',BOTH,'preflop','vsopen','vsopen',{hero:'BB',opener:'CO',openSize:4,hands:'J3o,T3o,94o,84o',answer:'fold',minDepth:40,sources:['bigopen'],why:'4BBへの追加コールはミニマムオープンより高い。弱く連結しないオフスートを、BBだからという理由だけで守らない。'});
add('mtt-btn-flat','MTT・IPの継続候補',['mtt'],'preflop','vsopen','vsopen',{hero:'BTN',opener:'CO',hands:'KQs,QJs,JTs',answer:'call',also:['raise'],minDepth:40,sources:['coldflop','ipdef'],why:'MTTのBTNは位置を活かしたコールドコールも持つ。レーキありキャッシュのフィールドと一括りにせず、ここではプレーしやすいスーテッド・ブロードウェイを扱う。'});
add('vs3bet-fold','オープン後の継続範囲',BOTH,'preflop','3bet','vs3bet',{opener:'BTN',threebettor:'BB',hands:'KTo,QTo,JTo',answer:'fold',minDepth:60,sources:['ipdef','fourbet'],why:'レイトからオープンできたハンドでも、BBの大きい3ベットにすべて継続する必要はない。弱いオフスートは支配される危険と残りの投入額を考える。'});
add('vs3bet-ip-call','位置を保った3ベットディフェンス',BOTH,'preflop','3bet','vs3bet',{opener:'BTN',threebettor:'BB',hands:'JJ,TT,AQs',answer:'call',also:['raise'],minDepth:60,sources:['ipdef','fourbet'],why:'IPにはコールして位置の価値を残す選択がある。強いが常にスタックを入れ切るとは限らない手を、すべて4ベットへ回さない。配分や相手レンジ次第の4ベットも別解に残す。'});
add('vs4bet-aces','4ベットへの強い手の応答',['cash'],'preflop','4bet','vs4bet',{hands:'AA',answer:'jam',also:['call','raise'],depths:[60,80,100],sources:['fourbet','spr'],why:'BTNのオープン、BBの3ベット、BTNの4ベットを追った後の判断。AAは強く継続できる。ジャム・小さい5ベット・トラップの配分は公開解のない教材では断定しない。'});
add('vs4bet-bluff','3ベット後に4ベットされた場面',['cash'],'preflop','4bet','vs4bet',{hands:'A5s,A4s',answer:'fold',also:['jam'],depths:[80,100],sources:['fourbet'],why:'3ベットのブラフ候補でも、4ベットへ全レンジをコールする必要はない。Aのブロッカーを使う5ベット・ジャムも条件次第の別解とし、コールの自動継続を避ける。'});
add('mtt-rejam','ショートでオープンに直面',['mtt'],'preflop','pushfold','vsopen',{hero:'BB',opener:'BTN',openSize:2,hands:'QQ,KK,AKs',answer:'jam',also:['call'],depths:[12,15],sources:['spr','ipdef'],why:'短い実効スタックでは、小さな3ベットよりジャムで圧力をかける選択が重要。強い手のトラップ・コールもあるので、頻度を作らず別解として扱う。'});
add('mtt-vs-jam-weak','ブラインド間のジャム応答',['mtt'],'preflop','pushfold','vsJam',{hero:'BB',opener:'SB',hands:'T3o,92o,83o',answer:'fold',depths:[10,12,15],sources:['spr'],why:'SBが全額を投入した後は、BBの既投資だけを理由に弱いハンドでコールしない。ジャム額と獲得できるポットを確認し、弱いオフスートを見送る。'});

add('cbet-set','セットでポットを作る',BOTH,'flop','cbet','srpCbet',{hands:'77,22',board:'Ks 7d 2c',answer:'large',also:['small','check'],minDepth:40,sources:['ip','preserve'],why:'セットは弱い継続ハンドから価値を得られる。ベットでポットを作る方針に加え、相手の範囲を残すチェックも別解とし、強い役を機械的な同一サイズに固定しない。'});
add('cbet-top-value','トップペアの価値',BOTH,'flop','cbet','srpCbet',{hands:'AKo,AQs',board:'As 7d 2c',answer:'small',also:['check','large'],minDepth:40,sources:['ip','preserve'],why:'トップペアは価値を得られるが、弱い相手ハンドを残す意味もある。小さいCBを出発点に、チェックや別サイズも含む継続方針を学ぶ。厳密なサイズ比率の問題ではない。'});
add('cbet-middle-pair','中程度の役を保つ',BOTH,'flop','cbet','srpCbet',{hands:'QQ,JJ,TT',board:'Kh 9h 4c',answer:'check',also:['small'],minDepth:60,sources:['preserve'],why:'トップカードより下のペアは、弱い範囲には強くても大きいベットにコールする範囲には弱い。チェックによるエクイティの保持を考え、小さいベットも別解に残す。'});
add('cbet-nut-draw','ナッツを作るドロー',BOTH,'flop','cbet','srpCbet',{exactHands:['AdQd','AdTd'],board:'Jd 7d 2c',answer:'small',also:['check','large'],minDepth:40,sources:['drawsip','preserve'],why:'ナッツフラッシュの可能性はブラフを支えるが、すべてのドローを必ず打つ必要はない。ベットとチェックの両方に役割があり、ここでは過剰なジャムを避ける方針を学ぶ。'});
add('cbet-air-control','改善しにくい手のCB',BOTH,'flop','cbet','srpCbet',{exactHands:['9h8h','8h7h'],board:'As Kd 2c',answer:'check',also:['small'],minDepth:40,sources:['preserve','delayed'],why:'弱い手のブラフをすべてフロップで使い切る必要はない。チェックで残して後街のカードと相手の行動を見られる。レンジ優位を使う小さいCBも別解。'});
add('face-cbet-set','強い役でCBを受ける',BOTH,'flop','checkraise','faceCbet',{hands:'77,22',board:'Ks 7d 2c',answer:'raise',also:['call'],minDepth:40,sources:['draw','spr'],why:'セットはチェックレイズでポットを作る価値がある。相手のブラフを残すコールも機能するため、強い役での継続方法を複数認める。'});
add('face-cbet-air','CBに対して何を手放すか',BOTH,'flop','facing','faceCbet',{exactHands:['KdJh','QdJh'],board:'As 8s 4c',answer:'fold',minDepth:40,sources:['turncall','preserve'],why:'ペアも直接のドローもなく、フラッシュへのバックドアもない。すべての小さいCBをコールするのではなく、改善性と後の街の負担を考えて見送る教材例。'});
add('face-cbet-bottom','小さいベットへのペアの応答',BOTH,'flop','facing','faceCbet',{hands:'85s,75s,65s',board:'Ks 8d 5c',opener:'BTN',answer:'call',also:['raise'],minDepth:40,sources:['draw','turncall'],why:'小さいCBには、弱いペアや二組も含めた応答を残す。このハンド群の中でも85は二組、75・65は下のペアで、強さと改善性の違いを意識する。レイズもコンボ次第の別解。'});
add('checkraise-combo','複数の改善先を持つドロー',BOTH,'flop','checkraise','faceCbet',{exactHands:['Ad4d','6d4d'],board:'Kd 5c 3d',answer:'raise',also:['call'],minDepth:40,sources:['draw','spr'],why:'フラッシュとストレートの両方を狙えるドロー。レイズによるフォールドエクイティと、コールで改善を待つ価値を比べる。強いドローでも自動的な全額投入にはしない。'});
add('face-xr-top','ペアボードのチェックレイズ応答',BOTH,'flop','facing','faceCheckraise',{hands:'AKo,KQs',board:'Ks 2d 2c',opener:'BTN',answer:'call',also:['raise'],minDepth:60,sources:['paired'],why:'チェックレイズを受けてもトップペア以上をすべて降ろしてはいけない。IPのコールでブラフを残し、後街に位置を活かす。再レイズはレンジ・サイズ次第の別解。'});
add('face-xr-air','チェックレイズで継続を見直す',BOTH,'flop','facing','faceCheckraise',{exactHands:['QhJh','QhTh'],board:'Kc 8d 5s',opener:'BTN',answer:'fold',minDepth:60,sources:['paired','preserve'],why:'小さいCBを打てたハンドでも、レイズ後は別の価格とレンジに向き合う。ペアや直接のドローを持たない手をすべてコールせず、継続の候補を選ぶ。'});
add('multi-middle-check','3人ポットで後ろに相手が残る',BOTH,'flop','multiway','multiCbet',{hands:'JJ,TT',board:'As Kd 8c',answer:'check',noHU:true,minDepth:60,sources:['multiway','preserve'],why:'BBの後にもBTNが残るCOの判断。2人の相手を一度に相手にするため、HUの自動CBを流用せず、中程度の役でチェックする。'});
add('multi-monster-check','3人ポットの強いチェック',BOTH,'flop','multiway','multiCbet',{hands:'KK',board:'Ks 7d 7c',answer:'check',noHU:true,minDepth:60,sources:['multiway'],why:'COはBTNの行動を残しており、強い手をチェック範囲にも置く。トップのフルハウスを持っているからといって、必ず自分からベットするとは限らないことを学ぶ教材例。'});
add('threebet-overpair','3ベットポットのオーバーペア',BOTH,'flop','3bet','threebetCbet',{hands:'AA,KK',board:'Qs 7d 2c',answer:'small',also:['check'],minDepth:40,sources:['threebet','preserve'],why:'OOPの3ベッターとして強いペアで小さく価値を取り得る。ベットを自動化せず、相手のベットを引き出すチェックも別解として保持する。'});

add('delayed-value','チェック後の価値の取り方',BOTH,'turn','delayed','delayed',{hands:'AKo',board:'Ks 7d 2c Ah',answer:'large',also:['small'],minDepth:40,sources:['delayed'],why:'フロップをチェックバックしたPFRが、ターンで二組に改善した局面。再びチェックされたらディレイCBで価値を取る。BB側から打つプローブとは異なる。'});
add('delayed-control','二度目のチェックを見た後',BOTH,'turn','delayed','delayed',{hands:'QQ,JJ,TT',board:'Ad Kh 8h 4d',answer:'check',minDepth:60,sources:['delayed','preserve'],why:'相手の二度目のチェックは、すべての中程度の手でベットする合図ではない。弱い範囲を残し、ショーダウン価値を保つ。'});
add('delayed-draw','チェック後に得たドロー',BOTH,'turn','delayed','delayed',{exactHands:['QhJh','JhTh'],board:'Ks 7h 2d 4h',answer:'large',also:['small','check'],minDepth:40,sources:['delayed','drawsip'],why:'チェックバックした手がターンでフラッシュドローを得た。新しい改善性を使ってベット候補にできるが、すべてのドローを打ち切らずチェックにも残す。'});
add('face-turn-top','二発目のベットへの応答',BOTH,'turn','facing','faceTurn',{hands:'KQs,KJs',board:'Ks 7d 2c 4h',opener:'BTN',turnBet:.75,answer:'call',also:['raise'],minDepth:40,sources:['turncall'],why:'ブランクのターンでも、ベット額と相手の継続範囲を再評価する。強いトップペアはコールでブラフを残せる。特定コンボのレイズも別解として扱う。'});
add('face-turn-air','改善しなかったバックドア',BOTH,'turn','facing','faceTurn',{exactHands:['Ad5d','Kd5d'],board:'Qs 7d 2c 9h',opener:'BTN',turnBet:.75,answer:'fold',minDepth:40,sources:['turncall'],why:'フロップでバックドアを持っていても、ターンでペアや直接のドローを得なければ継続範囲の下側になりやすい。前街をコールしたことを理由に二発目も自動コールしない。'});
add('face-turn-nut','完成したフラッシュで受ける',BOTH,'turn','facing','faceTurn',{exactHands:['AsJs','AsTs'],board:'Ks 7s 2d 4s',opener:'BTN',turnBet:.75,answer:'raise',also:['call'],minDepth:40,sources:['turncall','mono'],why:'フロップのドローがナッツフラッシュへ改善した。強い継続範囲から価値を得るレイズと、相手のブラフを残すコールを比較する。'});
add('probe-two-pair','チェックバック後に改善した手',BOTH,'turn','probe','probe',{hands:'T8s',board:'Ts 7d 2c 8h',answer:'large',also:['small','check'],minDepth:40,sources:['probe','preserve'],why:'BBの手が二組に改善したターン。フロップがチェックで回ったので、今のリードはプローブ。価値を取るベットと、強いチェックの両方を学ぶ。'});
add('probe-medium','ショーダウン価値を持つプローブ候補',BOTH,'turn','probe','probe',{hands:'TT,99',board:'Ks 7d 2c 4h',answer:'check',minDepth:40,sources:['probe','preserve'],why:'相手がフロップでチェックしても、BBの中程度のペアが大きいポットを望むとは限らない。弱い相手ハンドを残すチェックを練習する。'});
add('barrel-combo','ターンにも残った強いドロー',BOTH,'turn','barrel','turnCbet',{exactHands:['8d6d','Ad4d'],board:'Qh 7d 5d 2c',answer:'large',also:['check'],minDepth:40,sources:['drawsip','spr'],why:'フロップのCB後にも複数の改善先を持つ。二発目で圧力をかける候補だが、レンジ全体のブラフ量を考えチェックにもドローを残す。'});

add('river-nut-value','リバーで完成した強い役',BOTH,'river','riverbet','riverValue',{exactHands:['AsJs','AsTs'],board:'Ks 7s 2d 4h 3s',answer:'large',also:['small','jam'],minDepth:60,sources:['riverplay'],why:'最後のカードでナッツフラッシュが完成したIPの判断。相手がコールできる範囲から価値を取り、残りスタックとベット額を意識する。厳密な最適サイズは断定しない。'});
add('river-top-two','二組のバリューを検討',BOTH,'river','riverbet','riverValue',{hands:'AKo',board:'Ac Kd 7h 4s 2c',answer:'large',also:['small','check'],minDepth:60,sources:['riverplay','preserve'],why:'強い二組でも、相手がコールするのはどのハンドかを考える。ベットで価値を取る方針を中心に、ブロッカーや相手範囲によるチェックも別解に残す。'});
add('river-showdown','IPでショーダウンを選ぶ',BOTH,'river','riverbet','riverValue',{hands:'QQ,JJ,TT',board:'As Kd 7h 4s 2c',turnChecks:true,answer:'check',minDepth:60,sources:['riverplay','preserve'],why:'IPはチェックすれば追加投入なしでショーダウンできる。弱い相手には勝てても、ベットにコールする範囲に勝てない中程度のペアを無理にバリューへ変えない。'});
add('river-checked-value','チェックが続いたポットのリバー',BOTH,'river','riverbet','riverStab',{hands:'KQs,KJs',board:'Td 8s 5c 2c Kh',answer:'large',also:['small'],minDepth:40,sources:['checked','riverplay'],why:'フロップとターンがチェックで回り、リバーで強いトップペアになった。前街のチェックと新しいカードを合わせて、弱いペアから価値を得る最後の機会を考える。'});

// Six actual board/range matchups, each with three different wager/mixture
// conditions. These are conditional arithmetic drills, not solver exports.
const riverCases=[
 {id:'ace-high',board:'Ac 9d 5h 2c 3s',hands:'AJo',value:'AA,99,55,AK,AQ',bluffs:'KQ,KJ,QT,JT,KT'},
 {id:'queen-paired',board:'Qc 8d 4h 2s 2c',hands:'QJs',value:'AA,KK,QQ,88,44,AQ,KQ',bluffs:'AK,AJ,KT,JT,T9'},
 {id:'jack-high',board:'Jc 7d 3h 2s 9c',hands:'JTs',value:'AA,KK,QQ,JJ,99,77,AJ,KJ,QJ',bluffs:'AK,AQ,KQ,QT,KT'},
 {id:'king-high',board:'Kd 8c 4h 2s 7d',hands:'KQo',value:'AA,KK,88,77,44,AK',bluffs:'AQ,AJ,QJ,QT,JT'},
 {id:'ten-paired',board:'Tc 6d 3h 2s 2c',hands:'ATo',value:'AA,KK,QQ,JJ,TT,66,33',bluffs:'AK,AQ,KQ,KJ,QJ'},
 {id:'nine-paired',board:'9c 7d 3h 2s 2c',hands:'A9s',value:'AA,KK,QQ,JJ,TT,99,77,33',bluffs:'AK,AQ,KQ,KJ,QJ'}
];
for(let c of riverCases)for(let [tag,size,share] of [['small',1/3,.10],['medium',.75,.40],['over',1.5,.50]])add('river-math-'+c.id+'-'+tag,'リバーの価格と指定レンジ',BOTH,'river','bluffcatch','riverMath',{hands:c.hands,board:c.board,math:'river',riverBet:size,bluffShare:share,valueRange:c.value,bluffRange:c.bluffs,minDepth:60,weight:.5,scope:'conditional',sources:['bluff','riverplay'],why:'ベット額・ボード・Heroのブロッカー・指定された価値とブラフの比率から、コール／フォールドのEVを全コンボで比較する。これらの比率は計算練習の入力で、GTO Wizardの戦略頻度ではない。'});

const GENRES={random:'すべてのテーマ',rfi:'未参加ポット / RFI',vsopen:'vs オープン',squeeze:'スクイーズ','3bet':'3ベット / 4ベット','4bet':'4ベットへの応答',cbet:'CBの判断',facing:'ベットへの応答',checkraise:'チェックレイズ',coldcall:'IPコールドコーラー',multiway:'3人ポット',donk:'ドンクの判断',probe:'プローブ',delayed:'ディレイCB',barrel:'ターンの継続',riverbet:'リバーのベット判断',bluffcatch:'リバーのブラフキャッチ',limped:'リンプの例外',pushfold:'ショート / ジャム',icm:'ICM・オールイン'};
function chooseWeighted(a,weights){let sum=weights.reduce((s,w)=>s+w,0),r=Math.random()*sum;for(let i=0;i<a.length;i++){r-=weights[i];if(r<=0)return a[i];}return a[a.length-1];}
function isEligible(f,o){let n=Number(o.table)||6,depth=o.depth&&o.depth!=='random'?Number(o.depth):null;
 if(!f.modes.includes(o.mode||'cash'))return false;if(o.streets?.length&&!o.streets.includes(f.street))return false;
 if(o.genre&&o.genre!=='random'&&f.genre!==o.genre&&!(o.genre==='facing'&&['faceCbet','faceCheckraise','faceTurn','riverMath','icm','vsopen','vs3bet','vs4bet','vsJam','squeeze'].includes(f.route)))return false;
 if(depth&&((f.depths&&!f.depths.includes(depth))||(f.minDepth&&depth<f.minDepth)||(f.maxDepth&&depth>f.maxDepth)))return false;
 if(o.mode==='mtt'&&o.stage&&o.stage!=='random'){if(f.stage&&f.stage!==o.stage)return false;if(!f.stage&&o.stage!=='early')return false;}
 if(n===2&&(f.noHU||f.noSB||(f.opener&&f.opener!=='SB'&&f.opener!=='BB'&&f.scope==='example')))return false;
 if(n===2&&((f.hero&&f.hero!=='SB'&&f.hero!=='BB')||f.field||['squeeze','coldCheck'].includes(f.route)||f.stage))return false;
 if(o.curriculum==='exceptions'&&!f.exception)return false;return true;
}
function available(o={}){return F.filter(f=>isEligible(f,o));}
function makeHand(f,board){if(f.exactHands)return P.parseCards(P.pick(f.exactHands));let c=P.rangeCombos(f.hands,board);return P.pick(c).hand;}
function generate(opts={}){
 let mode=opts.mode||'cash',n=Number(opts.table)||P.pick(mode==='cash'?[2,6,6,9]:[6,9]),o={...opts,mode,table:n},pool=available(o);
 if(!pool.length)throw Error('この条件に対応する教材問題がありません。ストリート・テーマ・スタック・段階の条件を広げてください。');
 // Avoid the most recently seen families without changing the available pool.
 // A one-family filter remains usable; direct family selection bypasses this.
 const recent=(opts.recentFamilies||[]).slice(-Math.min(12,pool.length-1)),fresh=pool.filter(x=>!recent.includes(x.id)),drawPool=fresh.length?fresh:pool;
 const f=opts.familyId?pool.find(x=>x.id===opts.familyId):chooseWeighted(drawPool,drawPool.map(x=>opts.curriculum==='balanced'||opts.genre&&opts.genre!=='random'?1:x.exception?.06:x.weight));
 if(!f)throw Error('指定されたテーマは現在の条件に一致しません。');
 let depth=opts.depth&&opts.depth!=='random'?Number(opts.depth):f.depths?P.pick(f.depths):P.pick((mode==='cash'?[40,60,80,100,150,200]:[15,20,25,30,40,60,80]).filter(d=>(!f.minDepth||d>=f.minDepth)&&(!f.maxDepth||d<=f.maxDepth)));
 const pos=P.POS[n],name=p=>pos.includes(p)?p:(p==='BB'?'BB':'SB'),BB=n-1,SB=n-2,BTN=n===2?SB:n-3;
 let pfr=name(f.opener||(n===2?'SB':P.pick(['UTG','HJ','CO','BTN'].filter(p=>pos.includes(p))))),caller='BB',hero=f.hero?name(f.hero):null,three=name(f.threebettor||'BB');
 if(f.route==='rfi'){hero=hero||(f.late?(n===2?'SB':P.pick(['CO','BTN'])):P.pick(pos.filter(p=>p!=='BB'&&(!f.noSB||p!=='SB'))));pfr=hero;}
 if(f.route==='vsopen'){if(f.field){pfr='UTG';hero=P.pick(pos.filter((p,i)=>i>pos.indexOf(pfr)&&i<BTN));}else if(!hero){if(n===2){pfr='SB';hero='BB';}else{pfr=P.pick(['UTG','HJ','CO'].filter(p=>pos.includes(p)));hero=P.pick(pos.filter((p,i)=>i>pos.indexOf(pfr)&&p!=='BB'));}}}
 if(f.route==='squeeze'){pfr='CO';caller='BTN';hero='BB';}
 if(f.route==='vs3bet'){pfr=f.opener?name(f.opener):n===2?'SB':P.pick(['UTG','CO','BTN']);hero=pfr;caller=three;}
 if(f.route==='vs4bet'){pfr=n===2?'SB':'BTN';caller='BB';hero='BB';}
 if(f.route==='vsJam'){pfr='SB';caller='BB';hero='BB';}
 if(f.route==='vsLimp'){pfr='SB';caller='BB';hero='BB';}
 if(['srpLead','faceCbet','faceTurn','turnLead','probe','riverMath'].includes(f.route))hero='BB';
 if(['srpCbet','turnCbet','delayed','faceCheckraise','riverValue','riverStab'].includes(f.route)){pfr=n===2?'SB':f.opener||'BTN';hero=pfr;}
 if(f.route==='multiCbet'){pfr='CO';caller='BTN';hero='CO';}
 if(f.route==='threebetCbet'){pfr=n===2?'SB':f.opener||'UTG';caller=n===2?'BB':P.pick(['SB','BB']);hero=caller;}
 if(f.route==='coldCheck'){pfr='UTG';caller='BTN';hero='BTN';}
 if(f.route==='icm'){pfr='SB';hero='BB';}
 if(f.route==='riverMath')pfr=n===2?'SB':'BTN';
 if(f.route==='probe')pfr=n===2?'SB':pos.includes('LJ')?'LJ':'HJ';
 let q={id:P.uid(),mode,players:pos.map(p=>({pos:p,stack:depth})),hero:pos.indexOf(hero),hand:[],history:[],ante:mode==='mtt'?.125:0,stage:mode==='cash'?'cash':f.stage||'early',rake:mode==='cash'?Number(opts.rake??5):0,rakeCap:mode==='cash'?Number(opts.rakeCap??3):0,source:'study',generatorVersion:3,created:Date.now(),depth,genre:f.genre,street:f.street};
 if(f.math==='river'&&f.bluffShare===1/3){q.rake=0;q.rakeCap=0;}
 if(f.math==='icm'){q.players.forEach((p,i)=>p.stack=i===BB?depth:i===SB?depth*2:i===0?2:P.round(depth*P.pick([.6,.9,1.5])));q.payouts=f.stage==='bubble'?Array.from({length:n},(_,i)=>i<n-1?1:0):[50,25,15,7,3,0,0,0,0].slice(0,n);}
 let board=P.parseCards(f.board||''),hand=makeHand(f,board);if(!P.unique(hand.concat(board)))throw Error('教材のカード構成が不正です。');let suits=P.shuffle([0,1,2,3]);const perm=c=>(c>>2)*4+suits[c%4];q.hand=hand.map(perm);board=board.map(perm);
 let s=P.initialState(q),pfi=pos.indexOf(pfr),ci=pos.indexOf(caller),hi=q.hero,preHeroActed=false;
 const act=(i,action,to)=>{let e={type:'action',player:i,action,...(to!==undefined?{to:P.round(to)}:{})};P.applyEvent(s,e);q.history.push(e);};
 const raiseTo=(i,to)=>Math.min(s.players[i].put+s.players[i].stack,Math.max(s.currentBet+s.minRaise,to));
 const deal=(st,cards)=>{let e={type:'deal',street:st,cards};P.applyEvent(s,e);q.history.push(e);};
 const pass=(i)=>act(i,s.currentBet>s.players[i].put?'fold':'check');
 let open=f.openSize||(mode==='cash'?2.5:2.3);if(f.route==='vsLimp')open=1;
 for(let guard=0;s.next!==null&&guard<60;guard++){
  let i=s.next;
  if(f.street==='preflop'&&i===hi){
   if(f.route==='vs3bet'&&!preHeroActed){act(i,'raise',raiseTo(i,open));preHeroActed=true;continue;}
   if(f.route==='vs4bet'&&!preHeroActed){act(i,'raise',raiseTo(i,9.2));preHeroActed=true;continue;}
   break;
  }
  if(i===pfi){if(f.route==='icm'||f.route==='vsJam')act(i,'raise',s.players[i].put+s.players[i].stack);else if(s.currentBet<=1){if(f.route==='vsLimp')act(i,'call');else act(i,'raise',raiseTo(i,open));}else if(f.route==='vs4bet')act(i,'raise',raiseTo(i,22));else act(i,'call');}
  else if(i===ci){if(['vs3bet','threebetCbet'].includes(f.route)&&s.currentBet<=open+.001){act(i,'raise',raiseTo(i,n===2?open*3.5:9.2));}else act(i,s.currentBet>s.players[i].put?'call':'check');}
  else if(f.route==='multiCbet'&&i===BB)act(i,'call');else pass(i);
 }
 if(f.street!=='preflop'){
  if(s.next!==null)throw Error('教材のプリフロップ履歴が完了していません。');deal('flop',board.slice(0,3));
  const bet=(i,fraction)=>{let amount=Math.min(s.players[i].stack,Math.max(1,P.round(s.pot*fraction)));act(i,'bet',amount);};
  const checkToHero=()=>{let g=0;while(s.next!==hi&&s.next!==null&&g++<10)act(s.next,'check');};
  const flopCall=()=>{let defender=BB,aggressor=pfi;act(defender,'check');bet(aggressor,1/3);act(defender,'call');};
  if(f.street==='flop'){
   if(f.route==='faceCbet'||f.route==='faceCheckraise'){act(BB,'check');bet(pfi,1/3);if(f.route==='faceCheckraise')act(BB,'raise',raiseTo(BB,s.currentBet*3.3));}
   else checkToHero();
  }else{
   if(['probe','delayed','riverStab'].includes(f.route)){while(s.next!==null)act(s.next,'check');}
   else flopCall();
   deal('turn',board.slice(3,4));
   if(f.street==='turn'){if(f.route==='faceTurn'){act(BB,'check');bet(pfi,f.turnBet||.75);}else checkToHero();}
   else{if(f.route==='riverStab'||f.turnChecks){while(s.next!==null)act(s.next,'check');}else{act(BB,'check');bet(pfi,.5);act(BB,'call');}deal('river',board.slice(4,5));act(BB,'check');if(f.route==='riverMath')bet(pfi,f.riverBet||1);}
  }
 }
 if(s.next!==hi||s.done||s.players[hi].allin)throw Error('教材の出題位置が不正です。');
 q.lesson={id:f.id,title:f.title,answer:f.answer,also:[...(f.also||[])],sources:f.sources,why:f.why,scope:f.scope,exception:!!f.exception,route:f.route,math:f.math||null,bluffShare:f.bluffShare??null,valueRange:f.valueRange||'AA,KK,99,55,AK',bluffRange:f.bluffRange||'AQ,AJ,QJ,QT,JT',opener:pfr,caller,coverage:'資料の戦略原則を使う自作問題。コンボ単位のGTO頻度・EVの転載ではありません。'};
 if(q.lesson.answer==='open'&&depth<=20)q.lesson.also.push('jam');
 if(f.math==='river')q.lesson.setup=`この問題はコール／フォールド比較。相手は価値ハンドを${((1-f.bluffShare)*100).toFixed(1)}%、ミスしたブラフを${(f.bluffShare*100).toFixed(1)}%含むと仮定。価値候補 ${q.lesson.valueRange}、ブラフ候補 ${q.lesson.bluffRange}。既知カードを除いた各グループ内は等確率。ベット額・ポットは履歴で確認。GTOの比率ではなく、指定レンジへの計算問題です。`;
 if(f.math==='icm'){q.villainRange='22+,A2s+,K5s+,Q8s+,J8s+,T8s,98s,A8o+,KTo+,QJo';q.lesson.setup='相手のジャムレンジを '+q.villainRange+' に固定したICMのコール／フォールド比較。賞金と全員のスタックは下で確認できます。全残り選手がこのテーブルにいる設定。';}
 q.lesson.audit={preflop:'状況別の合法な履歴を先に構築。リンプ・横コールは該当テーマのみに限定。',sampling:'教材の抽選比率は練習用。実戦のGTOアクション頻度を表すものではない。'};
 return q;
}

function actionsFor(q){let s=P.stateAt(q),base=P.legalActions(s,q.hero),a=base.filter(x=>['fold','call','check'].includes(x.kind));
 if(q.lesson.math)return a.filter(x=>x.kind==='fold'||x.kind==='call');
 let h=s.players[q.hero],max=h.stack+h.put,need=s.currentBet-h.put,raise=s.currentBet>0,others=s.players.some((p,i)=>i!==q.hero&&!p.folded&&!p.allin),targets=[];
 if(others){
  if(s.street==='preflop'){let multiplier=s.currentBet<=1?(q.lesson.route==='vsLimp'?3:2.5):q.lesson.route==='squeeze'?4.5:q.lesson.route==='vs4bet'?2.2:q.lesson.route==='vs3bet'?2.4:['SB','BB'].includes(s.players[q.hero].pos)?4:3;targets=raise?[Math.max(s.currentBet+s.minRaise,s.currentBet*multiplier),max]:[2.5,max];}
  else targets=raise?[Math.max(s.currentBet+s.minRaise,s.currentBet*3.3),max]:[Math.max(1,s.pot*.10),Math.max(1,s.pot/3),Math.max(1,s.pot*.75),max];
  for(let raw of targets){let to=P.round(Math.min(max,raw)),kind=raise?'raise':'bet';if(a.some(x=>x.to!==undefined&&Math.abs(x.to-to)<.05))continue;let test=P.stateAt(q);try{P.applyEvent(test,{type:'action',player:q.hero,action:kind,to});}catch{continue;}let jam=to>=max-.001,pct=raise?null:Math.round(to/s.pot*100);a.push({id:jam?'allin':kind+'_'+to,kind,label:jam?'オールイン':kind==='raise'?'レイズ':'ベット',to,cost:P.round(to-h.put),pct});}
 }
 for(let x of a)if(x.kind==='call'&&s.street==='preflop'&&s.currentBet<=1)x.label='リンプ';return a;
}
function keyFor(a,q){let s=P.stateAt(q);if(a.id==='allin')return 'jam';if(a.kind==='raise'&&s.street==='preflop'&&s.currentBet<=1&&q.lesson.route==='rfi')return 'open';if(a.kind==='call'&&s.street==='preflop'&&s.currentBet<=1)return 'limp';if(a.kind==='bet'){let ratio=a.to/s.pot;return ratio<=.16?'tiny':ratio<=.40?'small':'large';}return a.kind;}
function analyze(q,progress){
 if(q.lesson.math)return math(q,progress);
 let accepted=[q.lesson.answer,...q.lesson.also],actions=actionsFor(q).map(a=>{let key=keyFor(a,q),score=accepted.includes(key)?100:q.lesson.answer==='small'&&key==='tiny'?80:q.lesson.answer==='tiny'&&key==='small'?80:0;return {...a,frequency:null,ev:null,rubric:score,recommendation:score===100?(key===q.lesson.answer?'教材の主眼':'許容する別解'):score>=70?'近い方針':'教材の狙いと異なる'};});
 if(!actions.some(a=>a.rubric===100))throw Error('教材の正答に対応する合法アクションがありません。');
 return {method:'lesson',sourceLabel:'公開教材に基づく問題',sources:q.lesson.sources.map(k=>({id:k,...SOURCES[k]})),sourceName:'GTO Wizard 公開教材',actions,unit:'none',explanation:q.lesson.why,scope:q.lesson.scope,limitations:q.lesson.coverage,range:null,equity:null};
}
function grade(q,r,id){let a=r.actions.find(x=>x.id===id);if(!a)throw Error('回答が見つかりません。');let score=a.rubric;return {score,label:score===100?'教材の方針に一致':score>=70?'近い方針':'この局面を見直そう',loss:null,action:a,hasEV:false,mistake:score<70,basis:'lesson-rubric'};}
function polarRange(q){let s=P.stateAt(q),used=q.hand.concat(s.board),value=P.rangeCombos(q.lesson.valueRange||'AA,KK,99,55,AK',used),bluff=P.rangeCombos(q.lesson.bluffRange||'AQ,AJ,QJ,QT,JT',used),p=q.lesson.bluffShare;return value.map(c=>({...c,weight:(1-p)/value.length})).concat(bluff.map(c=>({...c,weight:p/bluff.length})));}
function exactRiver(q,range){let board=P.stateAt(q).board,vh=P.evaluate(q.hand.concat(board)),w=0,t=0,sum=0;for(let r of range){let val=P.evaluate(r.hand.concat(board));if(vh>val)w+=r.weight;if(vh===val)t+=r.weight;sum+=r.weight;}return {win:w/sum,tie:t/sum,equity:(w+t/2)/sum,trials:range.length,error:0,exact:true};}
function math(q,progress){
 let s=P.stateAt(q),h=s.players[q.hero],ci=s.players.findIndex((p,i)=>i!==q.hero&&!p.folded),cost=Math.min(h.stack,s.currentBet-h.put),actions=actionsFor(q),eq,ev,unit='bb',details={};
 if(q.lesson.math==='river'){let range=polarRange(q);eq=exactRiver(q,range);let total=s.pot+cost,fee=Math.min(total*q.rake/100,q.rakeCap);ev=eq.equity*(total-fee)-cost;details={threshold:cost/(total-fee),fee,bluffShare:q.lesson.bluffShare,opponentRange:'価値：'+(q.lesson.valueRange||'AA,KK,99,55,AK')+' / ブラフ：'+(q.lesson.bluffRange||'AQ,AJ,QJ,QT,JT'),exact:true};}
 else{
  let range=P.rangeCombos(q.villainRange,q.hand.concat(s.board));eq=P.rangeEquity(q.hand,s.board,[range],30000);unit='prize';let current=s.players.map(p=>p.stack),fold=current.slice();fold[ci]+=s.pot;let totals=s.players.map(p=>p.total);totals[q.hero]+=cost;let pot=s.pot+cost,eligible=totals.reduce((x,c)=>x+Math.min(c,totals[q.hero]),0),over=pot-eligible;
  let win=current.slice(),lose=current.slice(),tie=current.slice();win[q.hero]+=eligible-cost;win[ci]+=over;lose[q.hero]-=cost;lose[ci]+=pot;tie[q.hero]+=eligible/2-cost;tie[ci]+=eligible/2+over;
  let uf=P.icm(fold,q.payouts)[q.hero],uw=P.icm(win,q.payouts)[q.hero],ul=P.icm(lose,q.payouts)[q.hero],ut=P.icm(tie,q.payouts)[q.hero];ev=eq.win*uw+eq.tie*ut+(1-eq.win-eq.tie)*ul-uf;let threshold=(uf-ul-eq.tie*(ut-ul-(uw-ul)/2))/(uw-ul),mean=ev+uf,variance=eq.win*(uw-mean)**2+eq.tie*(ut-mean)**2+(1-eq.win-eq.tie)*(ul-mean)**2;details={threshold,foldEquity:uf,winEquity:uw,loseEquity:ul,tieEquity:ut,tieProbability:eq.tie,stacks:current,payouts:q.payouts,exact:false,opponentRange:q.villainRange,evError:1.96*Math.sqrt(variance/eq.trials)};
 }
 return {method:'math',sourceLabel:q.lesson.math==='river'?'固定レンジ・厳密EV':'固定レンジ・ICM EV',sourceName:'公開教材を使う数理ドリル',sources:q.lesson.sources.map(k=>({id:k,...SOURCES[k]})),actions:actions.map(a=>({...a,frequency:null,ev:a.kind==='fold'?0:ev})),unit,equity:eq.equity,range:details.opponentRange,trials:eq.trials,details,equityError:eq.error,explanation:q.lesson.why,limitations:'相手レンジと応答を問題文で固定した条件付きEV。フルゲームのGTO解ではありません。'+(details.exact?'リバーは全コンボを列挙。':'カードの勝敗は試行計算、各結果の賞金価値はICMで計算。'),texture:P.boardTexture(s.board),category:P.category(q.hand.concat(s.board))};
}
const api={version:3,sources:SOURCES,families:F,genres:GENRES,available,generate,analyze,grade,actionsFor,keyFor,polarRange,exactRiver};root.PokerStudy=api;if(typeof module!=='undefined')module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
