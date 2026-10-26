# GitHub / Cloudflare 公開手順

このZIPは POKER SCOPE v2 の配布版です。Node.js 22以上とnpmを使用します。
ゲーム本体は `dist/` の静的ファイルです。Cloudflare Workersの静的アセット配信で公開します。

## 1. GitHubに登録する

1. ZIPを展開します。
2. GitHubで新しいリポジトリを作成します。
3. 展開したフォルダの**中身**をリポジトリ直下へアップロードしてコミットします。
4. リポジトリ直下に `wrangler.jsonc`、`package.json`、`package-lock.json`、`dist/` が並んでいることを確認します。

ZIPそのものをアップロードするだけでは公開できません。`dist/` はビルド済みの本体なので、必ずGitに含めてください。`.gitignore` も同梱しています。

Gitを使う場合は、展開したフォルダで次を実行できます。URLは自分のリポジトリに置き換えます。

```sh
git init
git add .
git commit -m "Initial POKER SCOPE application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## 2. CloudflareとGitHubを連携して公開する

Cloudflareの **Workers & Pages** から新しいWorkerを作成し、GitHubリポジトリを接続します。画面の項目名は更新される場合があります。

| 項目 | 設定 |
| --- | --- |
| 種類 | Workers（静的アセット） |
| Worker名 | `poker-scope` |
| 本番ブランチ | `main` |
| ルートディレクトリ | リポジトリ直下（空欄または `.`） |
| ビルドコマンド | `npm run build` |
| デプロイコマンド | `npm run deploy` |
| Node.js | 22以上（例：ビルド変数 `NODE_VERSION=22`） |

`package-lock.json` によりWranglerのバージョンを固定しています。依存パッケージはCloudflare側でインストールされます。インストールコマンドを指定する画面がある場合は `npm ci` を指定します。

`npm run build` は `dist/` の必須ファイルを確認します。本体は静的ファイルなので、変換・コンパイルは不要です。

設定ファイルの `assets.directory` は `./dist` です。Workers方式では出力ディレクトリ欄を別途指定する必要はありません。公開後はCloudflareが表示する `workers.dev` URLを開いてください。以後、接続した本番ブランチへのコミットにより再デプロイされます。

Worker名を変える場合は、`wrangler.jsonc` の `name` も同じ名前へ変更してください。独自ドメインは公開後にCloudflare管理画面で追加できます。

## 3. 自分のPCから直接デプロイする方法

GitHub連携の代わりに、ZIPを展開したフォルダで実行できます。

```sh
npm ci
npm run check
npm test
npm run deploy:check
npx wrangler login
npm run deploy
```

`deploy:check` はアップロードしないドライランです。`wrangler login` で自分のCloudflareアカウントを認証してから公開します。

ローカルで動作を見る場合：

```sh
npm ci
npm run dev
```

ターミナルに表示されるHTTPアドレスをブラウザで開きます。`index.html` を直接ダブルクリックする方法ではWeb Workerなどが動かない場合があります。

## 4. Cloudflare Pagesを使いたい場合

同梱の `wrangler.jsonc` はWorkers用です。PagesのGit連携を使う場合は、そのコピーの `wrangler.jsonc` を削除してからリポジトリに登録し、フレームワーク「なし」、ビルドコマンド `npm run build`、出力ディレクトリ `dist` を指定してください。Pagesでは `npm run deploy` をデプロイコマンドに指定しません。

## 成績データの引き継ぎ

成績は各ブラウザ内のIndexedDB / localStorageに保存され、サーバーには送信しません。公開URLが変わると保存先も変わるため、旧URLの「記録」でJSONバックアップを出力し、新URLの「記録」で復元してください。

この配布版にはログイン認証・サーバー保存・端末間同期はありません。通常のCloudflare公開ではURLを知る人がアプリを利用できます。ソルバー用のAPIキーは不要です。教材採点・条件付きEV・簡略解析の違いはREADMEとアプリ内の説明を参照してください。

## 公式ドキュメント

- 静的アセット：https://developers.cloudflare.com/workers/static-assets/
- 設定：https://developers.cloudflare.com/workers/static-assets/binding/
- Git連携のビルド設定：https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

作成元：POKER SCOPE v2、ソースコミット `4144d00aa83e710db3a39d38b1faa816c75ab175`。
