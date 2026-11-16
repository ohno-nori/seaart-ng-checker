# SeaArt NGワードチェッカー 初期辞書 v1.0

- 作成日: 2026-11-16
- 収録: **2,363語**（日本語702、英語1,661）
- 用途: 日本語・英語の投稿文を**部分一致**で走査し、検閲原因になりそうな文字列を候補として示す。
- 重要: **SeaArt公式NGワード一覧ではありません**。収録=検閲確定ではありません。単語の安全性・違反性・適切性も判定しません。

## ファイル

| ファイル | 用途 |
|---|---|
| `seaart_ng_dictionary_v1.csv` | Excel / Googleスプレッドシートで編集できる完全辞書。UTF-8 BOM付き。 |
| `seaart_ng_dictionary_v1.json` | 全メタデータ入り完全JSON。`entries` 配列を読み込む。 |
| `seaart_ng_dictionary_web.json` | フロントエンド用軽量JSON。表示・部分一致に必要なフィールドへ縮小。 |
| `seaart_ng_dictionary_stats.json` | 言語別・カテゴリ別・誤検出リスク別集計。 |
| `seaart_ng_dictionary_ATTRIBUTION.md` | 参考資料、原著者、MITライセンス帰属表示。 |

## CSV列

| 列名 | 意味 |
|---|---|
| `id` | 一意なID |
| `term` | 検出対象の原文の表記 |
| `normalized` | Unicode NFKC + Python `casefold` の正規化済み表記 |
| `language` | `ja` / `en` |
| `category` | 大分類。推定分類のため誤りを含み得ます。 |
| `false_positive_risk` | `high`, `medium`, `low`。語長・一般語との衝突可能性に基づく機械的な参考指標で、実測FPRではありません。 |
| `status` | `candidate` / `user_reported`。候補語か、ユーザーから検閲経験を聞いた語か。 |
| `observed_in_seaart` | この会話でSeaArt上の観測結果が報告されたものだけ `true`。 |
| `source_ids` | `surge_en`, `space_ja`, `space_en`, `editorial`, `user_report` の組み合わせ。複数ある場合はセミコロン区切り。 |
| `source_url` | 個々の語が出典データセットに含まれることを確認できる場合の元データURL。`editorial`だけの項目では空欄。 |
| `notes` | 補足。編集追加候補は、単語ごとの外部辞典の確認が未完了であることを明記。 |

## カテゴリ一覧

- `sexual_act`: 性行為、性的行動、自慰など
- `anatomy`: 身体部位、性器、生理的な語彙など
- `adult_media`: 成人向け媒体、出版、コンテンツ名など
- `sexual_expression`: 性的表現、形容、欲望、官能表現など
- `fetish_bondage`: フェティッシュ、BDSM、性具など
- `nudity_clothing`: 裸体、下着、露出に関する用語など
- `adult_commerce`: 成人向けサービスに関連する用語など
- `sexual_violence`: 性犯罪などの用語（記録用途のみ）
- `sexual_slang_or_context`: それ以外の性的スラング、表記違い、広義の文脈候補。ここは収録数が多く、分類精度の改善余地が大きい。

## データ収集と品質方針

1. MITライセンスの英語モデレーション語彙データセット（Surge AI）から、`sexual anatomy / sexual acts` の項目を抽出。
2. MITライセンスの多言語センシティブワード集（SpaceGather）から日本語・英語の `pornography` 語彙を統合。
3. Wiktionaryの英語・日本語のSex、Pornography、Masturbation、Genitalia、Sex positions等のカテゴリを調査の参考に使用し、一般的な語彙、業界用語、略語、画像生成タグ、表記揺れを**編集候補**として追加。編集候補のすべてについて個別の辞典記事と突合したわけではありません。
4. 同一言語かつ大文字小文字だけが異なる重複を除外。一方、平仮名・片仮名・漢字、空白やハイフンなどの表記差は保持。
5. 性的語彙の収集という目的から逸脱する差別的罵倒語や、明らかに無関係な混入語の一部を除外。
6. この会話で観測された「リミング」「口」「くち」「添い寝」「口でするやつ」「口を使うやつ」を `user_reported` として保存。
7. SeaArtでの単語単体NGの実測を網羅的に行っていません。**SeaArtの判定を予測する精度指標はありません**。

注意: 性的指向・身体・性的健康に関係する言葉が含まれます。語彙の一致だけで不適切・違反・性的コンテンツだと断定しないでください。日常用語も多数検出されます。チェック対象の文章はブラウザ内にとどめ、本人の送信操作なしに外部送信しないUIを推奨します。

## JavaScriptでの簡易部分一致チェック

```js
// web.json: { version, entries: [{ t: 表記, n: 正規化語, l: 言語, c: カテゴリ, r: リスク }] }
const dictionary = await fetch('./seaart_ng_dictionary_web.json').then(r => r.json());
const input = '画像をトリミングして、ピエロを描く';
const normalized = input.normalize('NFKC').toLowerCase();
const hits = dictionary.entries.filter(item => normalized.includes(item.n));
console.log(hits.filter(x => ['リミング', 'エロ'].includes(x.t)));
// => リミング, エロ
```

入力文章内の文字位置をハイライトするときは、NFKCによる長さの変化（全角英数等）に注意してください。正規化前の文字インデックスと正規化後のインデックスは必ずしも一致しません。必要なら元文字位置を保持する対応表を作ってください。

## 現実的なチェッカーUI

全文を自動照合し、**原因候補文字列**だけハイライトする。`false_positive_risk=high` は色を薄くするなど見分けられるようにし、怪しい順の精度を過信しない。表示には `term` を使い、候補の長い語を先に提示する。NG判定そのものを返すのではなく「この部分が原因かも」と明示する。ユーザーが報告を追加できるGoogleフォームへのリンクを設ける。

## 今後の改善余地

- 編集追加語の個別出典照合（現時点で未実施）。
- 語義ごとの誤検出例の収集。特に短い日本語語彙。
- SeaArtの投稿場所（通常投稿、アプリタイトル、アプリ概要）および表示段階ごとの実測結果を別テーブルとして蓄積。
- 運用初期は「怪しさ表示」が目的。`検証済み/未検証`を必須UIにはしない設計が使いやすい。
