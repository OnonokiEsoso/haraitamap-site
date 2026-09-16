(() => {
  "use strict";

  const detailsBySlug = {
    tsuchiura: {
      routes: { "tsuchiura-toilet-1": "JR東日本の構内図は1F〜3Fを案内しています。改札内にいる場合は、改札階からホームへ向かう動線上のトイレ案内を優先して確認してください。" },
      urgent: "改札を出る前に、改札内の案内表示を確認するのが最短です。土浦駅は1F〜3Fにまたがるため、ホームから階段・エスカレーター・エレベーターで改札階へ上がる途中で表示を確認してください。",
      place: "JR東日本の公式構内図では土浦駅は1F〜3F構成で、駅にバリアフリートイレがあることも確認できます。",
      route: "ホームから改札階へ移動し、改札内のトイレ表示を確認してください。JR東日本は改札から各ホームまでバリアフリー経路を案内しています。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレ、点字運賃表を確認できます。",
      caution: "個室数・混雑度・清潔度の現在値は公式情報だけでは確認できないため、既存の星評価は参考値として扱ってください。",
      sources: [["JR東日本 土浦駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/1011.html"], ["JR東日本 土浦駅情報", "https://www.jreast.co.jp/estation/station/info.aspx?StationCd=1011"]]
    },
    mikawashima: {
      routes: { "mikawashima-toilet-1": "JR東日本の構内図では1F〜2F構成です。改札・ホーム間の移動時にトイレ案内を確認してください。" },
      urgent: "駅が1F〜2Fの比較的単純な構成なので、まず改札周辺の案内表示を確認してください。",
      place: "JR東日本の公式構内図で1F〜2F構成を確認でき、バリアフリートイレも設置されています。",
      route: "改札からホームへのバリアフリー経路が公式に案内されています。ホームからは改札方向へ進み、案内表示を確認してください。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレ、点字運賃表を確認できます。",
      caution: "三河島駅は常磐線快速・上野東京ラインの利用駅です。個室数や現在の混雑状況は公式資料では確認できません。",
      sources: [["JR東日本 三河島駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/1456.html"], ["JR東日本 三河島駅 時刻表・路線案内", "https://timetables.jreast.co.jp/timetable/list1456.html"]]
    },
    mito: {
      routes: { "mito-toilet-1": "JR東日本の構内図は1F・2Fに分かれています。在来線利用中は、改札・コンコース方向へ進みながらトイレ案内を確認してください。" },
      urgent: "常磐線・水戸線・水郡線が集まる駅なので、別ホームへ移動するより、現在いるホームから改札・コンコース方向の案内を確認するのを優先してください。",
      place: "JR東日本の公式構内図では水戸駅は1F・2F構成です。駅にはバリアフリートイレがあります。",
      route: "改札から各ホームへのバリアフリー経路が公式に案内されています。ホームから改札階へ向かい、案内表示を確認してください。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレ、点字運賃表を確認できます。",
      caution: "水戸駅は複数路線が集まるため、ホーム位置によって移動距離が変わります。個室数・混雑度は現時点で公式確認できません。",
      sources: [["JR東日本 水戸駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/1471.html"], ["JR東日本 水戸駅 時刻表・路線案内", "https://timetables.jreast.co.jp/timetable/list1471.html"]]
    },
    katsuta: {
      routes: { "katsuta-toilet-1": "JR東日本の構内図では1F〜2F構成です。ホームから改札階へ向かい、改札内のトイレ案内を確認してください。" },
      urgent: "ホーム上で迷うより、改札階へ上がりながら案内表示を確認してください。勝田駅は1F〜2F構成です。",
      place: "JR東日本の公式構内図で1F〜2F構成を確認できます。駅情報では改札に駅員が配置されているため、緊急時は改札で場所を尋ねる選択肢もあります。",
      route: "常磐線ホームから改札階へ移動し、トイレ表示を確認してください。",
      equipment: "JR東日本公式の構内図・バリアフリー情報で駅設備を確認できます。指定席券売機は改札内にも設置されています。",
      caution: "現在の個室数や混雑度は公式資料では確認できません。既存評価は参考値として扱ってください。",
      sources: [["JR東日本 勝田駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/451.html"], ["JR東日本 勝田駅情報", "https://www.jreast.co.jp/estation/station/info.aspx?StationCd=451"]]
    },
    hitachi: {
      routes: { "hitachi-toilet-1": "JR東日本の構内図では1F〜2F構成です。日立駅改札口または南改札へ向かう動線上でトイレ案内を確認してください。" },
      urgent: "現在位置に近い改札方向へ進みながら案内表示を確認してください。日立駅には通常の改札口に加えて南改札があります。",
      place: "JR東日本公式では1F〜2F構成で、日立駅改札口と南改札の2つが案内されています。バリアフリートイレも確認できます。",
      route: "ホームから改札階へ上がり、最寄りの改札方向の案内表示を確認してください。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレなどを確認できます。",
      caution: "南改札は駅員無配置でインターフォン対応です。個室数・混雑度の現在値は公式確認できません。",
      sources: [["JR東日本 日立駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/1315.html"], ["JR東日本 日立駅情報", "https://www.jreast.co.jp/estation/station/info.aspx?StationCd=1315"]]
    },
    sendai: {
      routes: { "sendai-toilet-1": "仙台駅はB2〜B1、1F、2F、3F〜4Fにまたがる大規模駅です。在来線利用中は在来線中央改札・在来線東口改札方面の案内を基準に、現在いる階で最寄りのトイレ表示を確認してください。" },
      urgent: "大規模駅なので『特定の1か所へ遠く移動する』より、現在いる階と改札を基準に最寄りのトイレ案内を探す方が実用的です。",
      place: "JR東日本の公式構内図はB2〜B1、1F、2F、3F〜4F、立体図に分かれています。在来線は中央改札・東口改札から各ホームへのバリアフリー経路が案内されています。",
      route: "在来線ホームからは在来線中央改札または東口改札方向へ。新幹線・仙石線・地下鉄からは階層移動が大きいため、乗換前に現在階の案内表示を確認してください。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレを確認できます。",
      caution: "仙台駅は非常に広く、現在のページにある1候補だけでは駅全体を代表しきれません。現地の階別案内を優先してください。",
      sources: [["JR東日本 仙台駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/913.html"], ["JR東日本 仙台駅 時刻表・路線案内", "https://timetables.jreast.co.jp/timetable/list0913.html"]]
    },
    kitasenju: {
      routes: { "kitasenju-toilet-1": "北千住駅はB2〜B1と1F〜3Fにまたがります。JR利用中は北改札口・南改札口のどちらに近いかを確認し、最寄りの案内表示を優先してください。" },
      urgent: "北改札・南改札のうち現在位置に近い方へ進み、トイレ案内を確認してください。複数事業者が乗り入れるため、遠い改札へ横断しない方が安全です。",
      place: "JR東日本公式の構内図ではB2〜B1、1F〜3F構成です。JRの改札は北改札口と南改札口が案内されています。",
      route: "JR常磐線利用中は北改札・南改札を基準に現在位置を把握してください。東京メトロ・東武・つくばエクスプレス側とは構内が異なるため、事業者の案内表示を確認してください。",
      equipment: "JR東日本公式で構内図・バリアフリー情報が提供されています。",
      caution: "北千住駅は複数社線が接続するため、『北千住駅のトイレ』だけでは場所を特定しにくい駅です。利用中の鉄道会社を確認してください。",
      sources: [["JR東日本 北千住駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/571.html"], ["JR東日本 北千住駅情報", "https://www.jreast.co.jp/estation/station/info.aspx?StationCd=571"]]
    },
    nagamachi: {
      routes: { "nagamachi-toilet-1": "JR長町駅は1F〜2F構成です。ホームから改札方向へ移動しながらトイレ案内を確認してください。" },
      urgent: "JR駅は1F〜2F構成なので、まず改札方向へ進みながら案内表示を確認してください。仙台市地下鉄側とは別施設として考えるのが安全です。",
      place: "JR東日本の公式構内図で1F〜2F構成、バリアフリートイレの設置を確認できます。",
      route: "JRホームから改札へ向かい、トイレ表示を確認してください。地下鉄利用時はJR側へ移動する前に地下鉄側の案内を確認してください。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレなどを確認できます。",
      caution: "JRと仙台市地下鉄は別の構内です。現在いる事業者側のトイレを先に確認してください。",
      sources: [["JR東日本 長町駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/1111.html"], ["JR東日本 長町駅 時刻表・路線案内", "https://timetables.jreast.co.jp/timetable/list1111.html"]]
    },
    tomobe: {
      routes: { "tomobe-toilet-1": "JR友部駅は1F〜2F構成です。常磐線・水戸線のホームから改札階へ向かい、案内表示を確認してください。" },
      urgent: "常磐線と水戸線の接続駅なので、別ホームへ移動する前に現在ホームから改札方向のトイレ案内を確認してください。",
      place: "JR東日本の公式構内図で1F〜2F構成、バリアフリートイレの設置を確認できます。",
      route: "ホームから改札階へ移動し、案内表示を確認してください。改札から各ホームへのバリアフリー経路も案内されています。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレなどを確認できます。",
      caution: "常磐線と水戸線の乗換駅です。乗換時間が短い場合でも、遠いホームへ移動する前にトイレ位置を確認するのがおすすめです。",
      sources: [["JR東日本 友部駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/1066.html"], ["JR東日本 友部駅 時刻表・路線案内", "https://timetables.jreast.co.jp/timetable/list1066.html"]]
    },
    tokai: {
      routes: { "tokai-toilet-1": "JR東海駅は1F〜2F構成です。ホームから改札方向へ移動しながらトイレ案内を確認してください。" },
      urgent: "駅は1F〜2F構成なので、まず改札方向の案内表示を確認してください。",
      place: "JR東日本の公式構内図で1F〜2F構成、バリアフリートイレの設置を確認できます。",
      route: "ホームから改札階へ向かい、案内表示を確認してください。改札から各ホームへのバリアフリー経路も案内されています。",
      equipment: "JR東日本公式でエレベーター、エスカレーター、バリアフリートイレなどを確認できます。",
      caution: "個室数・混雑度・清潔度の現在値は公式情報では確認できません。既存評価は参考値として扱ってください。",
      sources: [["JR東日本 東海駅 構内図・バリアフリー情報", "https://www.jreast.co.jp/estation/stations/1037.html"], ["JR東日本 東海駅 時刻表・路線案内", "https://timetables.jreast.co.jp/timetable/list1037.html"]]
    }
  };

  const slug = window.location.pathname.split("/").filter(Boolean).pop()?.replace(/\.html$/, "") || "";
  const details = detailsBySlug[slug];
  if (!details) return;

  Object.entries(details.routes).forEach(([cardId, routeText]) => {
    const card = document.getElementById(cardId);
    if (!card) return;
    const routeRow = Array.from(card.querySelectorAll(".kv > div")).find((row) => (row.querySelector("dt")?.textContent || "").replace(/\s+/g, "") === "行き方");
    const dd = routeRow?.querySelector("dd");
    if (dd && (!dd.textContent.trim() || dd.textContent.trim().startsWith("掲載場所は"))) dd.textContent = routeText;
  });

  if (document.getElementById("research-details")) return;
  const report = document.getElementById("station-report");
  if (!report) return;

  const sourceLinks = details.sources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`).join(" / ");
  const section = document.createElement("section");
  section.className = "station-research-details";
  section.id = "research-details";
  section.setAttribute("aria-label", "腹痛時の実用情報");
  section.innerHTML = `
    <div class="card"><div class="card-body"><h3>腹痛時の実用情報</h3><dl class="kv">
      <div><dt>急いでいる場合</dt><dd>${details.urgent}</dd></div>
      <div><dt>具体的な場所</dt><dd>${details.place}</dd></div>
      <div><dt>行き方</dt><dd>${details.route}</dd></div>
      <div><dt>設備・情報確度</dt><dd>${details.equipment}</dd></div>
      <div><dt>注意点</dt><dd>${details.caution}</dd></div>
      <div><dt>情報確認日</dt><dd>2026年9月17日</dd></div>
      <div><dt>主な情報源</dt><dd>${sourceLinks}</dd></div>
    </dl></div></div>`;
  report.insertAdjacentElement("beforebegin", section);
})();
