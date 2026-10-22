# 駅ページの新レイアウト

新レイアウトの共通表示は `station-view-client.js` が作る。大宮など既存の対象駅は同ファイルの駅リストで有効化されている。今後移行する駅は、HTML の `body` に `data-station-layout="modern"` を付け、`station-page-garden-v3.css` の後に `station-modern-layout.css` を読み込む。

```html
<link rel="stylesheet" href="../station-page-garden-v3.css" />
<link rel="stylesheet" href="../station-modern-layout.css" />
<body class="station-page-tokyo station-page-駅slug" data-station-layout="modern">
```

駅ページには既存の `.section-head.station-title`、`.station-plaque h2`、`.station-overview`、`.overview-count`、`.best-pick`、`.card` を残す。共通スクリプトは読み込み後に駅名部分を横長のバーへ変え、再検索リンクを作り、候補数と1件推奨の表示を整える。駅名ボックスの白い部分はスクリプトが削除するため、駅ごとに別の見出しHTMLやCSSを作らない。

複数候補を選ぶ駅では `.best-pick` の代わりに専用の `location-picker` を使う。路線ナビは必要な駅だけに追加する。これらは新レイアウトの必須部分ではない。

移行時は駅名・候補数・候補へのリンク・評価・設備情報を確認し、スマートフォン幅で駅名バー、再検索、候補数、推奨欄の順に表示されることを確認する。
