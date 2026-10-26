# 公開教材の調査とv2への反映

調査日：2026年10月26日。一次資料としてGTO Wizardの公開記事17件を参照。原文・有料問題集・ソルバーデータの転載ではなく、局面の原則を使う自作問題43テーマに整理した。公開資料だけで全条件のコンボ別GTO頻度・EVが分かるとは扱わない。

## 主な判断

通常のレーキありキャッシュで、全席を同じコール確率で動かす根拠はない。BBの価格とアクションを閉じる利点は、未投資の位置のコールドコールと区別する。未参加ポットのオープンレイズと、オープンリンプも区別する。

フロップのドンクはボード・相手位置・スタックに依存する。低い連結ボードの例外を全ボードへ広げず、ターンのレンジ変化や、チェックバック後のプローブとも区別する。SB・短いBTNのリンプ等を一律に禁止する単純化も採用しない。

記事の戦略原則、特定の公開例を参考にした教材問題、相手レンジを固定する数理問題、取込ソルバー解を区別して表示する。記事にない数値をGTO頻度として作らない。

## 参照先

- [Preflop Raise Sizing: Examining 2 Key Factors](https://blog.gtowizard.com/preflop-raise-sizing-examining-2-key-factors/)：参加レンジ・位置・レーキを区別し、参加時はレイズで先手を取る。
- [Cold-Calling in Straddle + Ante Games](https://blog.gtowizard.com/cold-calling-in-straddle-ante-games/)：通常のレーキありキャッシュではBTN・BB以外のコールドコールは限定的。ストラドル＋アンティは別条件。
- [How To Construct a Squeezing Range](https://blog.gtowizard.com/how-to-construct-a-squeezing-range/)：オープンとコールが入った後のスクイーズ。通常の3ベットとはレンジとサイズが異なる。
- [Is Limping Pimping?](https://blog.gtowizard.com/is-limping-pimping/)：SB、HU、短いスタック等のリンプを通常のポジションのリンプと区別する。
- [The Curious Case of Open-Limping Buttons](https://blog.gtowizard.com/curious-case-of-open-limping-buttons/)：短いBTNではリンプ・小さなレイズ・ジャムが共存し、強いトラップもリンプに含む。
- [Playing Limped Pots as the BB in MTTs](https://blog.gtowizard.com/playing-limped-pots-as-the-bb-in-mtts/)：SBリンプに対するBBのチェックと、強いハンド等によるアイソレートを区別する。
- [Is Donk Betting for Donkeys?](https://blog.gtowizard.com/is-donk-betting-for-donkeys/)：フロップのドンクは通常限定的。低い連結ボード等の例外はスタックと相手位置に依存する。
- [How and Why You Should Use Turn Donk Bets](https://blog.gtowizard.com/how-and-why-you-should-use-turn-donk-bets/)：前街をコールしたレンジを強化する低いペアやドロー完成カードが、ターンのリード候補になる。
- [Flop Heuristics: IP C-Betting in MTTs](https://blog.gtowizard.com/flop-heuristics-ip-c-betting-in-mtts/)：PFRとBBのレンジ差、ボードの連結性、ペア・ドローの作りやすさを比較する。
- [Flop Heuristics: IP Cold Caller in MTTs](https://blog.gtowizard.com/flop-heuristics-ip-cold-caller-in-mtts/)：IPのコールドコーラーはBBより強い範囲。PFRのチェックを放棄と決めつけない。
- [C-Betting OOP in 3-Bet Pots](https://blog.gtowizard.com/c-betting-oop-in-3-bet-pots/)：3ベッターのレンジ優位とSPRを考慮。40bbのA64rでは小さく打てる一方、深い低い連結ボードは別。
- [Check-Raising a Single Pair](https://blog.gtowizard.com/check-raising-a-single-pair/)：大きなポットを作る価値とフォールドエクイティを考える。強いドローと単なるワンペアは区別する。
- [Maximizing Value on Monotone Flops](https://blog.gtowizard.com/maximizing-value-on-monotone-flops/)：モノトーンでも無条件に強い役ばかりとは限らない。小さいポットと後の大きいポットではレンジが違う。
- [Probe Betting](https://blog.gtowizard.com/probe-betting/)：前街のチェックバック後のベットはプローブ。前街がベット・コールのドンクと区別する。
- [The Art of Bluff Catching](https://blog.gtowizard.com/the-art-of-bluff-catching-2/)：ブラフキャッチはベット額と、実際の相手レンジの価値・ブラフの比率で判断する。
- [ICM Basics](https://blog.gtowizard.com/icm-basics/)：賞金と全員のスタックから勝敗後の価値を計算。チップEVの必要勝率だけでコールしない。
- [Donk Betting As the Covering Stack in MTTs](https://blog.gtowizard.com/donk-betting-as-the-covering-stack-in-mtts/)：カバーするスタックのICM圧力で、cEVとは異なるドンク戦略が生じる。ドンクを全面禁止しない。

## テーマ一覧

| ID | テーマ | モード | 街 | 評価 |
|---|---|---|---|---|
| open-value | 未参加ポットの参加判断 | cash / mtt | preflop | 公開教材の原則 |
| open-trash | 弱いオフスートの扱い | cash / mtt | preflop | 公開教材の原則 |
| open-late | レイトポジションの参加判断 | cash / mtt | preflop | 公開教材の原則 |
| threebet-value | オープンへの応答 | cash / mtt | preflop | 公開教材の原則 |
| coldcall-fold | フィールドからのコール判断 | cash | preflop | 公開教材の原則 |
| sb-threebet | SBからの応答 | cash | preflop | 公開教材の原則 |
| bb-defend | BBのディフェンス | cash / mtt | preflop | 公開教材の原則 |
| squeeze-value | オープンとコールの後 | cash / mtt | preflop | 公開教材の原則 |
| fourbet-value | 3ベットを受けた後 | cash | preflop | 公開教材の原則 |
| mtt-aa-trap | 40bb・3ベットへの応答 | mtt | preflop | 公開教材の原則 |
| mtt-btn-jam | 短いBTNの参加方法 | mtt | preflop | 公開教材の原則 |
| mtt-btn-trap | 短いBTNのトラップ | mtt | preflop | 公開教材の原則 |
| mtt-sb-limp | SBでフォールドが回った場面 | mtt | preflop | 公開教材の原則 |
| bb-isolate | SBリンプへの応答 | cash / mtt | preflop | 公開教材の原則 |
| bb-option | BBのチェック権 | mtt | preflop | 公開教材の原則 |
| bb-high-check | 通常ボードの最初の判断 | cash / mtt | flop | 公開教材の原則 |
| bb-jt9-check | 連結ボードでも一律にはリードしない | mtt | flop | 公開教材の原則 |
| bb-mono-check | モノトーンの最初の判断 | cash / mtt | flop | 公開教材の原則 |
| ip-small-cbet | IPでの小さいCB | cash / mtt | flop | 公開教材の原則 |
| ip-low-control | IPのベットを自動化しない | cash / mtt | flop | 公開教材の原則 |
| threebet-small | OOP・3ベットポットのCB | mtt | flop | 公開教材の原則 |
| deep-low-threebet | 深い3ベットポットの管理 | cash | flop | 公開教材の原則 |
| donk-top-pair | 低いフロップのリード例外 | mtt | flop | 公開教材の原則 |
| donk-air-check | ドンク用ボードでも手札を選ぶ | mtt | flop | 公開教材の原則 |
| defend-pair | 小さいCBへのディフェンス | cash / mtt | flop | 公開教材の原則 |
| defend-draw | 強いドローの応答 | cash / mtt | flop | 公開教材の原則 |
| cold-ip-control | IPコーラーのチェックバック | mtt | flop | 公開教材の原則 |
| cold-ip-protect | IPコーラーのプロテクション | mtt | flop | 公開教材の原則 |
| turn-low-trips | 下のカードがペアになったターン | mtt | turn | 公開教材の原則 |
| turn-trips-trap | 同じトリップスでもキッカーを見る | mtt | turn | 公開教材の原則 |
| turn-kq9-blank | ターンのリードを控える判断 | mtt | turn | 公開教材の原則 |
| turn-kq9-trips | レンジを強化する下のペア | mtt | turn | 公開教材の原則 |
| turn-straight | コール範囲のストレート完成 | mtt | turn | 公開教材の原則 |
| turn-flush | 二色フロップからのフラッシュ完成 | mtt | turn | 公開教材の原則 |
| probe-weak-check | チェックバック後の弱いハンド | cash | turn | 公開教材の原則 |
| probe-draw | チェックバック後のセミブラフ | cash | turn | 公開教材の原則 |
| turn-ip-value | IPで改善した強い手 | cash / mtt | turn | 公開教材の原則 |
| turn-ip-control | ターンのポット管理 | cash / mtt | turn | 公開教材の原則 |
| river-low-bluff | リバーのレンジと価格 | cash / mtt | river | 固定レンジの数理EV |
| river-many-bluffs | リバーのブラフ比率 | cash / mtt | river | 固定レンジの数理EV |
| river-indifferent | リバーの無差別条件 | cash / mtt | river | 固定レンジの数理EV |
| icm-bubble | バブルのオールイン応答 | mtt | preflop | 固定レンジの数理EV |
| icm-final | ファイナルのオールイン応答 | mtt | preflop | 固定レンジの数理EV |

## 標準練習の出題前履歴の監査

各モード10,000問、6-max、seed=20261026。問題の抽選を検証するもので、実戦のGTO頻度ではない。リンプの列は出題前履歴に既にリンプが含まれる問題数を数え、回答としてこれから選ぶアクションは数えない。

| モード | 問題数 | リンプ履歴 | SB以外のリンプ履歴 | コールドコール履歴 | 横コール2人以上の連鎖 |
|---|---:|---:|---:|---:|---:|
| cash | 10000 | 32 | 0 | 440 | 0 |
| mtt | 10000 | 46 | 0 | 1149 | 0 |
