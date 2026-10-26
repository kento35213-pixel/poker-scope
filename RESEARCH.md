# 公開教材の調査とv3への反映

調査日：2026年10月26日。一次資料としてGTO Wizardの公開記事29件を参照し、教材と条件付き数理問題を43から100パターンへ増やした。未公表のGTO頻度・EVを作るものではない。記事本文・有料問題集・ソルバーのデータベースの複製は含まない。

## 追加範囲

- プリフロップ：4ベットへの応答、オープン額の違い、IPでの3ベットディフェンス、短いスタックでのリジャム。
- フロップ：CBの役割別の比較、チェックレイズへの応答、3人ポットで後ろに相手が残る判断。
- ターン：ディレイCB、二発目のベットへの応答、チェックバック後のプローブ、ドローの継続。
- リバー：価値を得るベット、ショーダウンを選ぶチェック、チェックが続いたポット、異なるベット額へのブラフキャッチ。
- 6種類のボード・レンジに3条件ずつ追加した18種のリバー数理問題。従来の3種と合わせて21種。入力された価値とブラフのグループ比率は教育用の仮定で、実戦のGTO混合頻度ではない。

## 問題数の意味

100は構造・数理条件ごとの問題パターン数。単なるスート交換を別のパターンとして数えていない。各パターンで対応する人数、ポジション、スタック、レンジ内のハンド、同型スートを抽選する。全条件の完全ランダムと偽って未収録の構造を生成せず、対応外のフィルターは明示する。

| ストリート | パターン数 |
| --- | ---: |
| プリフロップ | 29 |
| フロップ | 27 |
| ターン | 19 |
| リバー | 25 |

## 抽選と合法性

直近の出題を最大12パターン避ける。対象が少ない場合は対象数−1まで避け、1件なら継続して練習できる。問題の難しさやGTO出現頻度を推定する処理ではない。主要テーマの重み1、例外0.06、追加リバー数理問題0.5。テーマ均等や特定ジャンルの指定では均等に選ぶ。

プリフロップは合法な一本道の履歴を先に構築する。新しい4ベット履歴はオープン→3ベット→4ベット、チェックレイズ問題はチェック→CB→レイズ。ディレイCBはフロップXX、継続ベットはフロップB-C、チェックダウン後のリバー問題はフロップXX・ターンXXを区別する。通常ポジションのリンプや連続した横コールを復活させない。3人ポットではCOのオープンにBTNとBBが継続する専用構造を使う。

## 採点と精度

教材の原則問題は複数の別解を認めるルーブリックで採点し、各コンボのGTO頻度・EVは表示しない。各問の条件を変えた教材への適用も含むため、元記事の完全に同一条件のソルバー解とは主張しない。リバー数理問題はレンジ内の全コンボについて実際の手役を比較し、指定価格・レーキでの条件付きEVを計算する。ICM問題は従来の30,000回の勝敗試行と厳密ICMを使う。自由入力のスポット解析は引き続き簡略モデル。

## 参照資料

- **Preflop Raise Sizing: Examining 2 Key Factors** — https://blog.gtowizard.com/preflop-raise-sizing-examining-2-key-factors/
  参加レンジ・位置・レーキを区別し、参加時はレイズで先手を取る。
- **Cold-Calling in Straddle + Ante Games** — https://blog.gtowizard.com/cold-calling-in-straddle-ante-games/
  通常のレーキありキャッシュではBTN・BB以外のコールドコールは限定的。ストラドル＋アンティは別条件。
- **How To Construct a Squeezing Range** — https://blog.gtowizard.com/how-to-construct-a-squeezing-range/
  オープンとコールが入った後のスクイーズ。通常の3ベットとはレンジとサイズが異なる。
- **Is Limping Pimping?** — https://blog.gtowizard.com/is-limping-pimping/
  SB、HU、短いスタック等のリンプを通常のポジションのリンプと区別する。
- **The Curious Case of Open-Limping Buttons** — https://blog.gtowizard.com/curious-case-of-open-limping-buttons/
  短いBTNではリンプ・小さなレイズ・ジャムが共存し、強いトラップもリンプに含む。
- **Playing Limped Pots as the BB in MTTs** — https://blog.gtowizard.com/playing-limped-pots-as-the-bb-in-mtts/
  SBリンプに対するBBのチェックと、強いハンド等によるアイソレートを区別する。
- **Is Donk Betting for Donkeys?** — https://blog.gtowizard.com/is-donk-betting-for-donkeys/
  フロップのドンクは通常限定的。低い連結ボード等の例外はスタックと相手位置に依存する。
- **How and Why You Should Use Turn Donk Bets** — https://blog.gtowizard.com/how-and-why-you-should-use-turn-donk-bets/
  前街をコールしたレンジを強化する低いペアやドロー完成カードが、ターンのリード候補になる。
- **Flop Heuristics: IP C-Betting in MTTs** — https://blog.gtowizard.com/flop-heuristics-ip-c-betting-in-mtts/
  PFRとBBのレンジ差、ボードの連結性、ペア・ドローの作りやすさを比較する。
- **Flop Heuristics: IP Cold Caller in MTTs** — https://blog.gtowizard.com/flop-heuristics-ip-cold-caller-in-mtts/
  IPのコールドコーラーはBBより強い範囲。PFRのチェックを放棄と決めつけない。
- **C-Betting OOP in 3-Bet Pots** — https://blog.gtowizard.com/c-betting-oop-in-3-bet-pots/
  3ベッターのレンジ優位とSPRを考慮。40bbのA64rでは小さく打てる一方、深い低い連結ボードは別。
- **Check-Raising a Single Pair** — https://blog.gtowizard.com/check-raising-a-single-pair/
  大きなポットを作る価値とフォールドエクイティを考える。強いドローと単なるワンペアは区別する。
- **Maximizing Value on Monotone Flops** — https://blog.gtowizard.com/maximizing-value-on-monotone-flops/
  モノトーンでも無条件に強い役ばかりとは限らない。小さいポットと後の大きいポットではレンジが違う。
- **Probe Betting** — https://blog.gtowizard.com/probe-betting/
  前街のチェックバック後のベットはプローブ。前街がベット・コールのドンクと区別する。
- **The Art of Bluff Catching** — https://blog.gtowizard.com/the-art-of-bluff-catching-2/
  ブラフキャッチはベット額と、実際の相手レンジの価値・ブラフの比率で判断する。
- **ICM Basics** — https://blog.gtowizard.com/icm-basics/
  賞金と全員のスタックから勝敗後の価値を計算。チップEVの必要勝率だけでコールしない。
- **Donk Betting As the Covering Stack in MTTs** — https://blog.gtowizard.com/donk-betting-as-the-covering-stack-in-mtts/
  カバーするスタックのICM圧力で、cEVとは異なるドンク戦略が生じる。ドンクを全面禁止しない。
- **How to Respond to Large Preflop Raises in Poker** — https://blog.gtowizard.com/how-to-respond-to-large-preflop-raises-in-poker/
  オープン額が変わると、BBのコール価格と継続できるハンドも変わる。
- **IP 4-Betting in Deep-Stacked Cash Games** — https://blog.gtowizard.com/ip-4-betting-in-deep-stacked-cash-games/
  3ベット・4ベットへの応答では、位置・サイズ・残りスタックを区別する。
- **Mastering Three-Bet Pots In Position in MTTs** — https://blog.gtowizard.com/mastering-three-bet-pots-in-position-in-mtts/
  IPのコールには位置の価値がある。OOPと同じレイズ一辺倒にはしない。
- **Defending vs BB Check-Raise on Paired Flops** — https://blog.gtowizard.com/defending-vs-bb-check-raise-on-paired-flops/
  チェックレイズに対し、強い手のコールも重要。ペア・ドロー以外のディフェンスもサイズ次第。
- **Protect Equity and Prosper** — https://blog.gtowizard.com/protect-equity-and-prosper/
  中程度の手は、チェックによって弱い相手レンジを残し、エクイティを保てる。
- **Delayed C-Betting** — https://blog.gtowizard.com/delayed-c-betting/
  フロップをチェックした攻撃者がターンで打つディレイCB。プローブと区別する。
- **The Four-Point Checklist for Calling Turn Barrels** — https://blog.gtowizard.com/the-four-point-checklist-for-calling-turn-barrels/
  ベット額、ボードとの接続、改善した役、ブロッカーからターンの継続を考える。
- **Betting Draws in Position: The Real Rules** — https://blog.gtowizard.com/betting-draws-in-position-the-real-rules/
  ドローも自動的にベットしない。レンジ全体とチェック後の展開を考える。
- **Probing in 3-Way Pots** — https://blog.gtowizard.com/probing-out-of-position-in-3-way-pots/
  後ろに相手を残す攻撃者は強い手もチェックする。HUのチェック後の推論をそのまま使わない。
- **Principles of River Play** — https://blog.gtowizard.com/principles-of-river-play/
  IPではチェックで手番を閉じられる。バリューベットはコールされる範囲への強さで判断する。
- **Mastering Thin Value Bets in Checked-Down Pots** — https://blog.gtowizard.com/mastering-thin-value-bets-in-checked-down-pots/
  チェックが続いた履歴と、リバーで改善したハンドを使って価値を見直す。
- **Stack-to-Pot Ratio** — https://blog.gtowizard.com/stack-to-pot-ratio/
  残りスタックとポットの比率で、オールインに必要な手の強さが変わる。

## 収録パターン一覧

| ID | 内容 | 街 | モード | 判定 | 参照キー |
| --- | --- | --- | --- | --- | --- |
| open-value | 未参加ポットの参加判断 | プリフロップ | cash / mtt | 教材の原則 | rfi |
| open-trash | 弱いオフスートの扱い | プリフロップ | cash / mtt | 教材の原則 | rfi |
| open-late | レイトポジションの参加判断 | プリフロップ | cash / mtt | 教材の原則 | rfi |
| threebet-value | オープンへの応答 | プリフロップ | cash / mtt | 教材の原則 | cold |
| coldcall-fold | フィールドからのコール判断 | プリフロップ | cash | 教材の原則 | cold |
| sb-threebet | SBからの応答 | プリフロップ | cash | 教材の原則 | cold |
| bb-defend | BBのディフェンス | プリフロップ | cash / mtt | 教材の原則 | rfi |
| squeeze-value | オープンとコールの後 | プリフロップ | cash / mtt | 教材の原則 | squeeze |
| fourbet-value | 3ベットを受けた後 | プリフロップ | cash | 教材の原則 | threebet |
| mtt-aa-trap | 40bb・3ベットへの応答 | プリフロップ | mtt | 教材の原則 | threebet |
| mtt-btn-jam | 短いBTNの参加方法 | プリフロップ | mtt | 教材の原則 | btnlimp |
| mtt-btn-trap | 短いBTNのトラップ | プリフロップ | mtt | 教材の原則 | btnlimp |
| mtt-sb-limp | SBでフォールドが回った場面 | プリフロップ | mtt | 教材の原則 | limp, sb |
| bb-isolate | SBリンプへの応答 | プリフロップ | cash / mtt | 教材の原則 | sb |
| bb-option | BBのチェック権 | プリフロップ | mtt | 教材の原則 | sb |
| bb-high-check | 通常ボードの最初の判断 | フロップ | cash / mtt | 教材の原則 | donk |
| bb-jt9-check | 連結ボードでも一律にはリードしない | フロップ | mtt | 教材の原則 | donk |
| bb-mono-check | モノトーンの最初の判断 | フロップ | cash / mtt | 教材の原則 | mono |
| ip-small-cbet | IPでの小さいCB | フロップ | cash / mtt | 教材の原則 | ip |
| ip-low-control | IPのベットを自動化しない | フロップ | cash / mtt | 教材の原則 | ip |
| threebet-small | OOP・3ベットポットのCB | フロップ | mtt | 教材の原則 | threebet |
| deep-low-threebet | 深い3ベットポットの管理 | フロップ | cash | 教材の原則 | threebet |
| donk-top-pair | 低いフロップのリード例外 | フロップ | mtt | 教材の原則 | donk |
| donk-air-check | ドンク用ボードでも手札を選ぶ | フロップ | mtt | 教材の原則 | donk |
| defend-pair | 小さいCBへのディフェンス | フロップ | cash / mtt | 教材の原則 | ip, draw |
| defend-draw | 強いドローの応答 | フロップ | cash / mtt | 教材の原則 | draw |
| cold-ip-control | IPコーラーのチェックバック | フロップ | mtt | 教材の原則 | coldflop |
| cold-ip-protect | IPコーラーのプロテクション | フロップ | mtt | 教材の原則 | coldflop |
| turn-low-trips | 下のカードがペアになったターン | ターン | mtt | 教材の原則 | turn |
| turn-trips-trap | 同じトリップスでもキッカーを見る | ターン | mtt | 教材の原則 | turn |
| turn-kq9-blank | ターンのリードを控える判断 | ターン | mtt | 教材の原則 | turn |
| turn-kq9-trips | レンジを強化する下のペア | ターン | mtt | 教材の原則 | turn |
| turn-straight | コール範囲のストレート完成 | ターン | mtt | 教材の原則 | turn |
| turn-flush | 二色フロップからのフラッシュ完成 | ターン | mtt | 教材の原則 | turn |
| probe-weak-check | チェックバック後の弱いハンド | ターン | cash | 教材の原則 | probe |
| probe-draw | チェックバック後のセミブラフ | ターン | cash | 教材の原則 | probe |
| turn-ip-value | IPで改善した強い手 | ターン | cash / mtt | 教材の原則 | mono |
| turn-ip-control | ターンのポット管理 | ターン | cash / mtt | 教材の原則 | draw |
| river-low-bluff | リバーのレンジと価格 | リバー | cash / mtt | 条件付きEV | bluff |
| river-many-bluffs | リバーのブラフ比率 | リバー | cash / mtt | 条件付きEV | bluff |
| river-indifferent | リバーの無差別条件 | リバー | cash / mtt | 条件付きEV | bluff |
| icm-bubble | バブルのオールイン応答 | プリフロップ | mtt | 条件付きEV | icm |
| icm-final | ファイナルのオールイン応答 | プリフロップ | mtt | 条件付きEV | icm |
| early-select | アーリーからの参加範囲 | プリフロップ | cash / mtt | 教材の原則 | rfi, cold |
| btn-wheel | BTNのスーテッドA | プリフロップ | cash / mtt | 教材の原則 | rfi |
| co-middle-pairs | COの中程度のペア | プリフロップ | cash / mtt | 教材の原則 | rfi |
| bb-minopen | ミニマムオープンへの応答 | プリフロップ | cash / mtt | 教材の原則 | bigopen, ipdef |
| bb-bigopen | 大きいオープンへの応答 | プリフロップ | cash / mtt | 教材の原則 | bigopen |
| mtt-btn-flat | MTT・IPの継続候補 | プリフロップ | mtt | 教材の原則 | coldflop, ipdef |
| vs3bet-fold | オープン後の継続範囲 | プリフロップ | cash / mtt | 教材の原則 | ipdef, fourbet |
| vs3bet-ip-call | 位置を保った3ベットディフェンス | プリフロップ | cash / mtt | 教材の原則 | ipdef, fourbet |
| vs4bet-aces | 4ベットへの強い手の応答 | プリフロップ | cash | 教材の原則 | fourbet, spr |
| vs4bet-bluff | 3ベット後に4ベットされた場面 | プリフロップ | cash | 教材の原則 | fourbet |
| mtt-rejam | ショートでオープンに直面 | プリフロップ | mtt | 教材の原則 | spr, ipdef |
| mtt-vs-jam-weak | ブラインド間のジャム応答 | プリフロップ | mtt | 教材の原則 | spr |
| cbet-set | セットでポットを作る | フロップ | cash / mtt | 教材の原則 | ip, preserve |
| cbet-top-value | トップペアの価値 | フロップ | cash / mtt | 教材の原則 | ip, preserve |
| cbet-middle-pair | 中程度の役を保つ | フロップ | cash / mtt | 教材の原則 | preserve |
| cbet-nut-draw | ナッツを作るドロー | フロップ | cash / mtt | 教材の原則 | drawsip, preserve |
| cbet-air-control | 改善しにくい手のCB | フロップ | cash / mtt | 教材の原則 | preserve, delayed |
| face-cbet-set | 強い役でCBを受ける | フロップ | cash / mtt | 教材の原則 | draw, spr |
| face-cbet-air | CBに対して何を手放すか | フロップ | cash / mtt | 教材の原則 | turncall, preserve |
| face-cbet-bottom | 小さいベットへのペアの応答 | フロップ | cash / mtt | 教材の原則 | draw, turncall |
| checkraise-combo | 複数の改善先を持つドロー | フロップ | cash / mtt | 教材の原則 | draw, spr |
| face-xr-top | ペアボードのチェックレイズ応答 | フロップ | cash / mtt | 教材の原則 | paired |
| face-xr-air | チェックレイズで継続を見直す | フロップ | cash / mtt | 教材の原則 | paired, preserve |
| multi-middle-check | 3人ポットで後ろに相手が残る | フロップ | cash / mtt | 教材の原則 | multiway, preserve |
| multi-monster-check | 3人ポットの強いチェック | フロップ | cash / mtt | 教材の原則 | multiway |
| threebet-overpair | 3ベットポットのオーバーペア | フロップ | cash / mtt | 教材の原則 | threebet, preserve |
| delayed-value | チェック後の価値の取り方 | ターン | cash / mtt | 教材の原則 | delayed |
| delayed-control | 二度目のチェックを見た後 | ターン | cash / mtt | 教材の原則 | delayed, preserve |
| delayed-draw | チェック後に得たドロー | ターン | cash / mtt | 教材の原則 | delayed, drawsip |
| face-turn-top | 二発目のベットへの応答 | ターン | cash / mtt | 教材の原則 | turncall |
| face-turn-air | 改善しなかったバックドア | ターン | cash / mtt | 教材の原則 | turncall |
| face-turn-nut | 完成したフラッシュで受ける | ターン | cash / mtt | 教材の原則 | turncall, mono |
| probe-two-pair | チェックバック後に改善した手 | ターン | cash / mtt | 教材の原則 | probe, preserve |
| probe-medium | ショーダウン価値を持つプローブ候補 | ターン | cash / mtt | 教材の原則 | probe, preserve |
| barrel-combo | ターンにも残った強いドロー | ターン | cash / mtt | 教材の原則 | drawsip, spr |
| river-nut-value | リバーで完成した強い役 | リバー | cash / mtt | 教材の原則 | riverplay |
| river-top-two | 二組のバリューを検討 | リバー | cash / mtt | 教材の原則 | riverplay, preserve |
| river-showdown | IPでショーダウンを選ぶ | リバー | cash / mtt | 教材の原則 | riverplay, preserve |
| river-checked-value | チェックが続いたポットのリバー | リバー | cash / mtt | 教材の原則 | checked, riverplay |
| river-math-ace-high-small | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-ace-high-medium | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-ace-high-over | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-queen-paired-small | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-queen-paired-medium | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-queen-paired-over | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-jack-high-small | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-jack-high-medium | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-jack-high-over | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-king-high-small | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-king-high-medium | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-king-high-over | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-ten-paired-small | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-ten-paired-medium | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-ten-paired-over | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-nine-paired-small | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-nine-paired-medium | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |
| river-math-nine-paired-over | リバーの価格と指定レンジ | リバー | cash / mtt | 条件付きEV | bluff, riverplay |

## 検証

全パターンの人数・深さ・モードの対応組合せで、カード重複、手番、チップ保存、合法な正答を検査する。追加リバー問題は価値群がHeroに勝ち、ブラフ群がHeroに負けることを全コンボで検査し、独立した損益の総和とEVを照合する。抽選の診断は tests/sampling-v3.json を参照。通常のGTO発生率を示すものではない。
