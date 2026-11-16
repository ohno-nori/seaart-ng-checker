# 出典・ライセンス・利用上の注意

調査日: 2026-11-16

## 外部収録元 1: The Obscenity List (Surge AI)
- URL: https://github.com/mod-tc/profanity
- データ: https://github.com/mod-tc/profanity/blob/main/profanity_en.csv
- ライセンス: MIT
- 原著権表示: Copyright (c) 2021 Surge AI
- 利用内容: CSVにある `sexual anatomy / sexual acts` の候補文字列を中心に抽出、編集・重複除去。

## 外部収録元 2: worldwide-sensitive-word-collection (SpaceGather)
- URL: https://github.com/SpaceGather/worldwide-sensitive-word-collection
- データ: `ja/pornography.csv`, `en/pornography.csv`
- ライセンス: MIT
- 原著権表示: Copyright (c) 2023 SpaceGather
- 利用内容: 日本語・英語の性的な語彙を抽出、編集・重複除去。

## 辞典・分類体系の参考
- Wiktionary English Sex: https://en.wiktionary.org/wiki/Category:en:Sex
- Wiktionary Japanese Sex: https://en.wiktionary.org/wiki/Category:ja:Sex
- Wiktionary English Genitalia: https://en.wiktionary.org/wiki/Category:en:Genitalia
- Wiktionary English Pornography: https://en.wiktionary.org/wiki/Category:en:Pornography
- Wiktionary English Masturbation: https://en.wiktionary.org/wiki/Category:en:Masturbation
- Wiktionary English Sex positions: https://en.wiktionary.org/wiki/Category:en:Sex_positions

Wiktionaryは調査の参考にしていますが、`editorial` 欄の語を一語ずつ確認済みという意味ではありません。また、Wiktionaryの記述・定義文や各カテゴリのデータベース全体をこの辞書に転載したものではありません。

## データ整理について
- `status=candidate` はSeaArtで禁止された証拠ではありません。
- `status=user_reported` は現時点で会話上の報告を反映したものです。内部仕様の確認ではありません。
- 収録単語そのものの使用が違法・不適切という判断ではありません。性的指向や性教育、保健、創作活動に関係する中立的な語もあります。

## MITライセンス原文

MIT License

Copyright (c) 2021 Surge AI
Copyright (c) 2023 SpaceGather

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## v2追加収録元
- LDNOOBW / List of Dirty, Naughty, Obscene, and Otherwise Bad Words
- URL: https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words
- 利用ファイル: en, ja, zh (master、2026-11-16取得)
- ライセンス: Creative Commons Attribution 4.0 International (CC BY 4.0)
- ライセンスURL: https://creativecommons.org/licenses/by/4.0/
- 変更: 抽出、NFKC・casefoldによる重複除去、短い包含語への整理、分類・出典の付与。著者によるSeaArt検閲辞書の承認を意味しません。
- 完全なライセンスを licenses/LDNOOBW_CC_BY_4.0.txt に同梱。

- SpaceGather / worldwide-sensitive-word-collection
- URL: https://github.com/SpaceGather/worldwide-sensitive-word-collection
- 追加利用ファイル: en/vulgar.csv, ja/vulgar.csv, zh-TW/vulgar.csv (main、2026-11-16取得)。violence.csv等の取得ファイルは空でした。
- MIT、Copyright (c) 2023 SpaceGather。ライセンス全文を同梱。

## v2編集追加候補・参考資料
- 編集追加は一般に用いられる固有名詞・政治社会語彙・侮辱語等を収録。個別のSeaArt判定や個別辞書項目を全件照合したものではありません。
- ユーザー報告「自由」を追加。
- Citizen Lab: https://github.com/citizenlab/chat-censorship （分類方針の参考のみ、データの一括取り込みなし）
- dablelv/dirty-cnwords: https://github.com/dablelv/dirty-cnwords （参考のみ、データの一括取り込みなし）

この配布物は異なる出典の集合です。v1/MITの帰属表示とLDNOOBW/CC BY 4.0の帰属・変更表示を維持してください。辞書全体を一律MITとは表示しないでください。
