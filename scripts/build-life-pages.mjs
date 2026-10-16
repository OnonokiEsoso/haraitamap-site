import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  guideArticles,
  guideSources,
  mayutsubaArticles,
  mayutsubaSources,
  siteMeta
} from "../content/life-articles.mjs";

const root = resolve(import.meta.dirname, "..");
const siteName = "腹痛持ちのための駅トイレマップ";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const inlineGuideRefs = (value) => escapeHtml(value).replace(
  /\[(\d{2})\]/g,
  '<a class="reference-mark" href="#ref-$1" aria-label="参考文献 $1">[$1]</a>'
);

function jsonLd(data) {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

function head({ title, description, canonical, type = "website", structuredData = [] }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#173c31">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://haraitamap.com/brand-icon.png">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/life.css">
  ${structuredData.map((data) => `<script type="application/ld+json">${jsonLd(data)}</script>`).join("\n  ")}
</head>`;
}

function header() {
  return `<a class="skip-link" href="#main-content">本文へ移動</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/" aria-label="駅トイレマップのトップへ">
      <img class="brand-icon" src="/favicon-512x512.png" alt="" width="52" height="52">
      <span class="brand-copy"><small>HARAITA MAP / LIFE GUIDE</small><strong>${siteName}</strong></span>
    </a>
    <nav aria-label="主要メニュー">
      <a href="/#search-panel"><span>01</span>駅を探す</a>
      <a href="/guides/"><span>02</span>事前対策</a>
      <a class="nav-accent" href="/mayutsuba/"><span>03</span>眉唾知恵袋</a>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer>
  <div><strong>${siteName}</strong><span>LIFE GUIDE / 読みもの</span></div>
  <nav aria-label="補助メニュー">
    <a href="/">駅検索</a><a href="/life/">読みもの</a><a href="/about.html">このサイトについて</a><a href="/credits.html">クレジット</a><a href="/privacy.html">プライバシー</a>
  </nav>
</footer>`;
}

function shell(content) {
  return `<body class="life-page"><div class="site-shell">${header()}${content}${footer()}</div><script src="/life.js" defer></script></body></html>\n`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="パンくずリスト"><ol>${items.map((item, index) => `<li>${item.href ? `<a href="${item.href}">${escapeHtml(item.name)}</a>` : `<span aria-current="page">${escapeHtml(item.name)}</span>`}${index < items.length - 1 ? '<i aria-hidden="true">/</i>' : ""}</li>`).join("")}</ol></nav>`;
}

function breadcrumbData(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name,
      item: item.url
    }))
  };
}

function safetyNote(compact = false) {
  return `<aside class="safety-note" aria-labelledby="safety-title">
    <strong id="safety-title">${compact ? "体調が悪いときは" : "医療情報について"}</strong>
    <p>ここで紹介する内容は一般的な情報と生活上の工夫で、診断や治療の代わりではありません。突然の激しい腹痛、血便、意図しない体重減少、繰り返す嘔吐で水分が取れない、強い脱水症状などがあるときは、外出の工夫より医療機関・救急相談を優先してください。</p>
  </aside>`;
}

function hero({ eyebrow, title, lead, badge = "読" }) {
  return `<section class="life-hero"><div class="life-hero-title"><span class="life-section-mark">${badge}</span><div><p>${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1></div></div><p class="life-hero-lead">${escapeHtml(lead)}</p></section>`;
}

function card(article, base) {
  return `<a class="article-card" href="${base}${article.slug}/">
    <span class="article-number">${article.id}</span><div><small>${escapeHtml(article.category || article.credibility)}</small><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.summary)}</p></div><i aria-hidden="true">→</i>
  </a>`;
}

function pageStructuredData(name, description, url) {
  return [{ "@context":"https://schema.org", "@type":"CollectionPage", name, description, url, isPartOf:{"@type":"WebSite","name":siteName,"url":"https://haraitamap.com/"} }];
}

function lifeIndex() {
  const title = `読みもの・お役立ち情報｜${siteName}`;
  const description = "外出前の備えを整理する事前対策まとめと、腹痛にまつわる言い伝えを検証する眉唾知恵袋。";
  const body = `<main class="life-main" id="main-content">
    ${breadcrumbs([{name:"トップ",href:"/"},{name:"読みもの"}])}
    ${hero({ eyebrow:"LIFE GUIDE / INFORMATION", title:"腹痛の前に、読んで備える", lead:"急いで駅トイレを探すページとは分けて、外出前の準備と腹痛にまつわる読みものをまとめました。", badge:"読" })}
    <section class="collection-grid" aria-label="読みもののカテゴリ">
      <a class="collection-card" href="/guides/"><span>01 / PREPARATION</span><h2>腹痛持ちの事前対策まとめ</h2><p>交通機関、旅行、持ち物。外出前に確認できる9つの実践ガイドです。</p><strong>9記事を読む →</strong></a>
      <a class="collection-card mayutsuba-card" href="/mayutsuba/"><span>02 / MAYBE, MAYBE NOT</span><h2>眉唾知恵袋</h2><p>言い伝えや民間療法を、根拠の有無と注意点とともに眺める7つの読みものです。</p><strong>7記事を読む →</strong></a>
    </section>
    ${safetyNote(true)}
  </main>`;
  return head({title,description,canonical:"https://haraitamap.com/life/",structuredData:pageStructuredData("読みもの・お役立ち情報",description,"https://haraitamap.com/life/")}) + shell(body);
}

function guideIndex() {
  const title = `腹痛持ちの事前対策まとめ｜${siteName}`;
  const description = "電車、長距離移動、旅行、持ち物、通勤通学など、腹痛が心配な外出前に確認したい9つの準備ガイド。";
  const categories = [...new Set(guideArticles.map((article) => article.category))];
  const sections = categories.map((category) => `<section class="index-group"><header><span>${String(categories.indexOf(category)+1).padStart(2,"0")}</span><h2>${escapeHtml(category)}</h2></header><div class="article-list">${guideArticles.filter((article) => article.category === category).map((article) => card(article,"/guides/")).join("")}</div></section>`).join("");
  const body = `<main class="life-main" id="main-content">
    ${breadcrumbs([{name:"トップ",href:"/"},{name:"読みもの",href:"/life/"},{name:"事前対策まとめ"}])}
    ${hero({ eyebrow:"PREVENTION FIELD GUIDE", title:"腹痛持ちの事前対策まとめ", lead:"使えるトイレ、移動中の選択肢、自分の体調と持ち物。9つのテーマを、具体的な行動と根拠で整理しました。", badge:"備" })}
    <aside class="editorial-note"><strong>このガイドの読み方</strong><p>すべてを一度に実施する必要はありません。まずは「次のトイレ」「途中で降りられる地点」「手元の持ち物」を一つずつ確認してください。鉄道・施設の設備や運用は変わるため、利用当日の公式案内と現地表示を優先してください。</p><span>資料確認日：2026年10月14日</span></aside>
    ${sections}
    ${safetyNote()}
  </main>`;
  return head({title,description,canonical:"https://haraitamap.com/guides/",structuredData:pageStructuredData("腹痛持ちの事前対策まとめ",description,"https://haraitamap.com/guides/")}) + shell(body);
}

function articleSchema(article, canonical) {
  return {
    "@context":"https://schema.org", "@type":"Article", headline:article.title,
    description:article.summary, datePublished:siteMeta.published, dateModified:siteMeta.updated,
    mainEntityOfPage:canonical, author:{"@type":"Organization","name":siteName},
    publisher:{"@type":"Organization","name":siteName,"logo":{"@type":"ImageObject","url":"https://haraitamap.com/brand-icon.png"}}
  };
}

function relatedGuides(article) {
  const same = guideArticles.filter((item) => item.slug !== article.slug && item.category === article.category);
  const fallback = guideArticles.filter((item) => item.slug !== article.slug && !same.includes(item));
  return [...same, ...fallback].slice(0,3);
}

function guideArticle(article) {
  const canonical = `https://haraitamap.com/guides/${article.slug}/`;
  const title = `${article.title}｜腹痛持ちの事前対策まとめ`;
  const crumbs = [
    {name:"トップ",href:"/",url:"https://haraitamap.com/"},
    {name:"読みもの",href:"/life/",url:"https://haraitamap.com/life/"},
    {name:"事前対策まとめ",href:"/guides/",url:"https://haraitamap.com/guides/"},
    {name:article.title,url:canonical}
  ];
  const pointItems = article.points.map((point, index) => article.interactive
    ? `<li class="check-item"><input type="checkbox" id="point-${index}"><label for="point-${index}">${inlineGuideRefs(point)}</label></li>`
    : `<li>${inlineGuideRefs(point)}</li>`).join("");
  const sections = article.sections.map(([heading, paragraphs]) => `<section class="article-section"><h2>${escapeHtml(heading)}</h2>${paragraphs.map((paragraph) => `<p>${inlineGuideRefs(paragraph)}</p>`).join("")}</section>`).join("");
  const steps = article.steps.map((step, index) => article.interactive
    ? `<li class="check-item"><input type="checkbox" id="step-${index}"><label for="step-${index}"><span>${index+1}</span>${escapeHtml(step)}</label></li>`
    : `<li><span>${index+1}</span>${escapeHtml(step)}</li>`).join("");
  const refs = article.sources.map((id) => `<li id="ref-${id}"><span>[${id}]</span><a href="${guideSources[id][1]}" target="_blank" rel="noopener noreferrer">${escapeHtml(guideSources[id][0])}<i aria-hidden="true">↗</i></a></li>`).join("");
  const body = `<main class="article-main" id="main-content">
    ${breadcrumbs(crumbs)}
    <article>
      <header class="article-hero"><p class="article-category">${escapeHtml(article.category)} / ${article.id}</p><h1>${escapeHtml(article.title)}</h1><p class="article-subtitle">${escapeHtml(article.subtitle)}</p><p class="article-summary">${escapeHtml(article.summary)}</p><div class="article-dates"><span>公開・更新：2026年10月16日</span><span>資料確認日：2026年10月14日</span></div></header>
      <section class="key-points${article.interactive ? " interactive-points" : ""}" aria-labelledby="points-title"><div class="section-label">5 POINTS</div><h2 id="points-title">最初に確認しておきたい5項目</h2><ul>${pointItems}</ul>${article.interactive ? '<button class="check-reset" type="button">チェックをリセット</button>' : ""}</section>
      <div class="article-copy">${sections}</div>
      <section class="steps-section${article.interactive ? " interactive-points" : ""}"><div class="section-label">FLOW</div><h2>準備の流れ</h2><ol>${steps}</ol></section>
      <aside class="conclusion"><strong>まとめ</strong><p>${escapeHtml(article.conclusion)}</p></aside>
      ${safetyNote()}
      <section class="references" aria-labelledby="references-title"><h2 id="references-title">参考文献・出典</h2><p>外部サイトの内容や設備・制度は変更されることがあります。リンクは2026年10月16日に到達確認しています。</p><ol>${refs}</ol></section>
      <section class="related"><h2>関連記事</h2><div>${relatedGuides(article).map((item) => card(item,"/guides/")).join("")}</div></section>
    </article>
  </main>`;
  return head({title,description:article.summary,canonical,type:"article",structuredData:[articleSchema(article,canonical),breadcrumbData(crumbs)]}) + shell(body);
}

function credibilityInfo(label) {
  return {
    "根拠ほぼなし":"確かな裏付けが見当たらない",
    "効果未確立":"紹介例はあるが検証が不足している",
    "一部に理屈あり":"関連する仕組みや用途には説明がつく"
  }[label];
}

function mayutsubaWarning(position) {
  return `<aside class="mayutsuba-warning"><strong>${position === "top" ? "最初にお読みください" : "最後に、もう一度"}</strong><p>このコーナーは雑学として楽しむための情報です。効果を保証するものでも、医療機関の受診より優先するものでもありません。強い痛み、痛みの悪化、発熱、血便、繰り返す嘔吐などがあるときは、おまじないで様子を見ず、医療機関へ相談してください。</p></aside>`;
}

function mayutsubaIndex() {
  const title = `眉唾知恵袋｜腹痛の言い伝え・民間療法`;
  const description = "腹痛にまつわる言い伝え、民間療法、気休め、おまじない7選を、根拠の有無と注意点とともに紹介。";
  const body = `<main class="life-main" id="main-content">
    ${breadcrumbs([{name:"トップ",href:"/"},{name:"読みもの",href:"/life/"},{name:"眉唾知恵袋"}])}
    ${hero({eyebrow:"MAYBE, MAYBE NOT",title:"眉唾知恵袋",lead:"信じるか信じないかは、あなた次第。言い伝え・民間療法・ちょっと気になる小技を、根拠の有無と一緒に眺めます。",badge:"眉"})}
    ${mayutsubaWarning("top")}
    <section class="credibility-guide" aria-labelledby="credibility-title"><h2 id="credibility-title">信憑性の見方</h2><div>${["根拠ほぼなし","効果未確立","一部に理屈あり"].map((label) => `<p><strong data-credibility="${label}">${label}</strong><span>${credibilityInfo(label)}</span></p>`).join("")}</div><small>この分類は医学的な評価等級ではなく、情報を整理するための便宜的な目安です。</small></section>
    <section class="index-group"><header><span>07</span><h2>気になる対処法</h2></header><div class="article-list mayutsuba-list">${mayutsubaArticles.map((article) => card(article,"/mayutsuba/")).join("")}</div></section>
    ${mayutsubaWarning("bottom")}
  </main>`;
  return head({title,description,canonical:"https://haraitamap.com/mayutsuba/",structuredData:pageStructuredData("眉唾知恵袋",description,"https://haraitamap.com/mayutsuba/")}) + shell(body);
}

function relatedMayutsuba(article) {
  const index = mayutsubaArticles.findIndex((item) => item.slug === article.slug);
  return [mayutsubaArticles[(index + 1) % mayutsubaArticles.length], mayutsubaArticles[(index + 2) % mayutsubaArticles.length]];
}

function mayutsubaArticle(article) {
  const canonical = `https://haraitamap.com/mayutsuba/${article.slug}/`;
  const title = `${article.title}｜眉唾知恵袋`;
  const crumbs = [
    {name:"トップ",href:"/",url:"https://haraitamap.com/"},
    {name:"読みもの",href:"/life/",url:"https://haraitamap.com/life/"},
    {name:"眉唾知恵袋",href:"/mayutsuba/",url:"https://haraitamap.com/mayutsuba/"},
    {name:article.title,url:canonical}
  ];
  const refs = article.sources.map((id) => `<li id="ref-${id}"><span>[${id}]</span><a href="${mayutsubaSources[id][1]}" target="_blank" rel="noopener noreferrer">${escapeHtml(mayutsubaSources[id][0])}<i aria-hidden="true">↗</i></a></li>`).join("");
  const body = `<main class="article-main mayutsuba-article" id="main-content">
    ${breadcrumbs(crumbs)}
    <article>
      <header class="article-hero"><p class="article-category">MAYBE, MAYBE NOT / ${article.id}</p><h1>${escapeHtml(article.title)}</h1><p class="article-summary">${escapeHtml(article.summary)}</p><div class="credibility-badge"><span>信憑性</span><strong data-credibility="${escapeHtml(article.credibility)}">${escapeHtml(article.credibility)}</strong><small>${escapeHtml(credibilityInfo(article.credibility))}</small></div><div class="article-dates"><span>公開・更新：2026年10月16日</span><span>資料確認日：2026年10月14日</span></div></header>
      ${mayutsubaWarning("top")}
      <div class="article-copy">
        <section class="article-section"><h2>どのような言い伝え・方法？</h2><p>${escapeHtml(article.method)}</p></section>
        <section class="article-section"><h2>効果について分かっていること</h2><p>${escapeHtml(article.evidence)}</p><p class="plain-note">「紹介されていること」と「科学的に効果が確認されていること」は別です。</p></section>
        <section class="article-section caution-section"><h2>試す前の注意点</h2><p>${escapeHtml(article.caution)}</p></section>
      </div>
      <section class="references" aria-labelledby="references-title"><h2 id="references-title">出典</h2><p>PDFの調査資料に記載された参考リンクです。リンクは2026年10月16日に到達確認しています。</p><ol>${refs}</ol></section>
      <section class="related"><h2>関連する眉唾記事</h2><div>${relatedMayutsuba(article).map((item) => card(item,"/mayutsuba/")).join("")}</div></section>
      ${mayutsubaWarning("bottom")}
    </article>
  </main>`;
  return head({title,description:article.summary,canonical,type:"article",structuredData:[articleSchema(article,canonical),breadcrumbData(crumbs)]}) + shell(body);
}

async function output(path, content) {
  const destination = resolve(root, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content, "utf8");
}

await output("life/index.html", lifeIndex());
await output("guides/index.html", guideIndex());
await output("mayutsuba/index.html", mayutsubaIndex());
for (const article of guideArticles) await output(`guides/${article.slug}/index.html`, guideArticle(article));
for (const article of mayutsubaArticles) await output(`mayutsuba/${article.slug}/index.html`, mayutsubaArticle(article));

console.log(`Generated ${3 + guideArticles.length + mayutsubaArticles.length} life content pages.`);
