# SeaArt NG Checker

SeaArtの投稿で規制される可能性のあるワードを幅広く抽出し、表現内容を検討するための非公式ツールです。実際に規制されるかどうかは保証しません。

This unofficial tool highlights a broad range of words that may be restricted in SeaArt posts to help you review your wording. It does not guarantee whether SeaArt will restrict a post.

v2.0.1：v2辞書2,583語に「着替え」を追加した2,584語を使用します。日英併記UI。すべて部分一致で検出し、辞書候補は黄色、別ファイルで指定した規制報告済みの語は赤色です。意味・カテゴリ・リスクは判定に使用しません。

## 規制報告の赤表示を後から追加

`dictionary/reported_terms.json` を次の形式で更新して公開します。

```json
{"version":"1.0.0","terms":["着替え","確認済みの語"]}
```

初期状態は `terms: []` で全語黄色です。詳細辞書の既存 `user_reported` 属性を自動的に赤へ移すことはしません。現場確認済みリストを受け取ってから反映します。「着替え」も現在は黄色です。報告リストだけにある語も検出でき、NFKC・英字大小を同一視した表記は同じ報告状態になります。赤は危険度ではなく報告の有無を示します。

赤と黄色が重なると、その部分だけ赤になります。候補語の残りは黄色のままです。結果一覧はすべての語・件数・状態を保持します。報告リストの取得失敗・不正形式ではチェック不可を表示します。

現在の候補ファイルは `dictionary/v2/seaart_ng_dictionary_web.json`。このJSONだけを更新すれば候補を追加できます。v2のCSV・詳細JSON・集計は添付時の2,583語の資料として維持しています。Web JSONへの「着替え」追加のみアプリ側の編集です。v1資料は回帰テスト・履歴用に保持し、画面では読み込みません。

出典は [v2 ATTRIBUTION](dictionary/v2/ATTRIBUTION.md) と [licenses](dictionary/v2/licenses/) を参照してください。MITとCC BY 4.0が混在します。変更：Web JSONに「着替え」を追加（2026-11-16）。

更新版の検証：**33自動テスト成功・失敗0**。v1回帰28件に、v2全候補、報告リスト、重複色分割、正規化位置の5件を追加。Edgeでデスクトップ・モバイル幅・ダークモード・赤リスト差し込み・辞書取得失敗の5シナリオ成功。実機Safariは未検証です。

本ツールは非公式の検閲ワード候補チェッカーです。検出された文字列が実際にSeaArtで規制されることを保証するものではありません。

## ローカル実行

Node.js 20以上で、このフォルダーを開きます。アプリ本体・エンジンテストに依存パッケージはありません。

```sh
npm start
```

ブラウザで http://127.0.0.1:4173 を開いてください。終了は Ctrl+C。ES ModulesとJSONのfetchを使用するため、index.htmlのダブルクリック（file://）では実行できません。

## GitHub Pagesへの公開

1. このアプリ専用のGitHubリポジトリを作成します。
2. このフォルダーの**中身**をリポジトリのルートへ追加し、mainへpushします。`index.html`、`styles.css`、`app.js`、`engine.js`、`config.js`、`dictionary/`、`.nojekyll`が必要です。`test-results/`、`node_modules/`は公開不要です。
3. リポジトリの Settings → Pages → Build and deployment で「Deploy from a branch」を選びます。
4. Branchを `main`、フォルダーを `/ (root)` にして保存します。
5. デプロイ完了後に表示される `https://<ユーザー名>.github.io/<リポジトリ名>/` を開きます。

ビルド・バックエンド・APIキーは不要です。すべて相対パスなのでサブディレクトリでも動作します。公開サイト：https://ohno-nori.github.io/seaart-ng-checker/ 。リポジトリ：https://github.com/ohno-nori/seaart-ng-checker 。mainブランチのルートから配信します。

## Googleフォームの設定

`config.js` の `reportFormUrl` にフォームのHTTPS URLを記入し、再公開します。

```js
reportFormUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform',
```

空文字列（初期状態）・不正URL・HTTPS以外ではリンクを表示しません。入力文をURLに付加することはありません。

## 辞書の追加・更新

ブラウザが読むファイルは `dictionary/v2/seaart_ng_dictionary_web.json` だけです。`entries` に `{ "t": "追加したい語", "n": "正規化表記" }` を追加し、必要に応じて `version` を更新して再公開してください。既存の `l`、`c`、`r` 等は保持できます。アプリコードの変更は不要です。

- `t` は必須の空でない文字列です。空・不正エントリや空辞書は読み込みエラーにし、黙って除外しません。
- 照合用文字列は **tをブラウザ側で再正規化** します。Pythonで生成された `n` は照合に使用しません。新規追加時の `n` は省略可能です。
- 同じ `t` の重複だけを統合します。異なる表記が正規化後に同じになっても、一覧にはそれぞれ表示します。
- 1文字語・空白を含む語も照合対象です。トリミング・語境界判定・フィルタリングはしません。
- 初期のCSV、完全JSON、統計、README、ATTRIBUTIONも `dictionary/` に原本のまま保存しています。Web JSONを更新しても、これらは自動更新されません。
- 出典を追加する場合は帰属情報も更新してください。元の [出典・MITライセンス](dictionary/seaart_ng_dictionary_ATTRIBUTION.md) を削除しないでください。

## 検出と文字位置

入力文と各登録語にUnicode NFKCを適用し、その後UnicodeコードポイントごとにJavaScriptの `toLowerCase()` を適用します。双方で同じ方式を使うため、Python casefoldとの差による辞書と本文の不整合はありません。英字の大小・全角半角は同一視します。Python casefoldそのものではないので、例えば `Straße` と `STRASSE` は同一視しません。

`Intl.Segmenter` で書記素を区切り、正規化後の各UTF-16位置から元文の開始・終了位置への対応表を作成します。通常はコードポイント単位で位置を保持し、濁点合成や結合文字の並べ替えなど分離できない部分のみ元の書記素全体に対応させます。例：`ｶﾞ` → `ガ`、`㍿` → `株式会社`。絵文字によるUTF-16位置のずれも考慮しています。

全登録語を `indexOf` で探索し、次の検索を1位置だけ進めることで重なった出現もすべて保持します。各結果には元文位置と正規化後位置が残り、ハイライト描画範囲だけを結合します。総件数は登録語ごとの一致の総和です。例えば `ﬃ` に登録語 `f` が一致すると正規化後の2か所を2件として記録し、原文では1文字をハイライトします。

入力文字数はUnicodeコードポイント数です。描画には `textContent` とテキストノードのみ使用し、入力をHTMLとして実行しません。候補は黄色、報告リストの一致は赤色です。

## プライバシー・対応環境

辞書取得後の検索はブラウザ内で完結します。入力文の送信・自動保存・解析・アクセス解析はありません。外部フォント、外部スクリプト、ログイン、AI APIも使用しません。

ES Modules、Unicode正規化、`Intl.Segmenter` に対応したモダンブラウザを対象とします。非対応ブラウザではチェック不可のメッセージを出します。iPhone向けに16px入力文字、44pxボタン、1列レイアウトを用意し、OSのダークモードに追従します。実機iPhone/Safariでの確認は未実施です。

## テストと実行結果

```sh
npm test
```

v1時点の記録（回帰テストとして維持）：2026-11-16 / Windows / Node.js 24.13.0：28テスト成功、失敗0。

| 入力 | 登録語 | 結果 |
| --- | --- | --- |
| トリミング | リミング | 1件・成功 |
| ピエロ | エロ | 1件・成功 |
| 人口減少 | 口 | 1件・成功 |
| 入口 | 口 | 1件・成功 |
| 口口口 | 口 | 3件・成功 |
| 口でするやつ | 口、口でするやつ | 両方検出・成功 |
| SEX | sex | 1件・成功 |
| ＳＥＸ | sex | 1件・成功 |
| 画像を切り抜く | リミング | 0件・成功 |

追加確認：連続一致、包含・重複一致、1文字語、日英混在、絵文字、改行、空入力、NFKCの展開・合成、位置対応、重複辞書、属性不使用、辞書取得成功・HTTP失敗・ネットワーク失敗・JSON破損・不正構造、256パターンの部分一致総当たりをすべて確認済みです。

実辞書2,363語・6,000 UTF-16単位の文章を約17.2msで照合（この環境の単回測定。端末によって変動）。

ブラウザ確認用の任意テスト：

```sh
npm install --no-save playwright
npx playwright install chromium
npm start
# 別ターミナルで
node tests/browser.mjs
```

インストール済みEdgeを使う場合は、PowerShellで `$env:BROWSER_CHANNEL='msedge'` を設定してください。`PLAYWRIGHT_MODULE_PATH` で既存Playwrightの場所も指定できます。

Edge（Chromium）で次の4シナリオが成功しました：デスクトップ1280px、スマートフォン幅390px、390pxダークモード、辞書HTTP 404。入力・クリア・一致なし表示・原文保持・XSS無害化・外部送信なし・再読み込みで入力を保存しないこと・横はみ出しなし・読み込み失敗表示を検証しています。これは画面幅のエミュレーションであり実機Safari検証ではありません。スクリーンショットは実行時に `test-results/` へ生成します。

## ファイル構成

```text
index.html / styles.css    画面とレスポンシブ・ダークモード
app.js                    入力イベント・安全なDOM描画
engine.js                 辞書取得・正規化・位置対応・全件照合
config.js                 辞書パス・報告フォームURL
dictionary/               添付辞書6ファイル・帰属情報
scripts/serve.mjs         ローカル確認サーバー
tests/                    エンジン・ブラウザ自動テスト
```
