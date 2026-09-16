(() => {
  "use strict";

  const detailsBySlug = {
    kasukabe: {
      routes: {
        "kasukabe-toilet-1": "西口側は高架化工事に伴い動線が変わる可能性があります。改札内のトイレ案内表示を優先してください。",
        "kasukabe-toilet-2": "東口側は2023年2月4日から新駅舎2階の旅客トイレを使用しています。東口新駅舎2階のトイレ表示を目印にしてください。",
        "kasukabe-toilet-3": "ララガーデン春日部は春日部駅から徒歩約4分です。駅から施設方面へ進み、館内のトイレ案内を確認してください。営業時間外は利用できません。"
      },
      urgent: "東口側にいる場合は、2023年に新設された東口新駅舎2階の旅客トイレをまず確認してください。高架化工事中のため、現地案内を優先します。",
      place: "東武鉄道の告知では、東口の旅客トイレは新駅舎2階に新設され、旧1番線ホームの旅客トイレは閉鎖されています。",
      route: "東口側は新駅舎2階の案内表示へ。西口側は現在の構内表示を確認してください。駅外の代案ララガーデン春日部は駅から徒歩約4分です。",
      equipment: "東武鉄道公式ではバリアフリートイレ、男性用・女性用・バリアフリートイレのベビーチェア／ベビーシートを確認できます。ララガーデン春日部にはみんなのトイレ（オストメイト対応）とキッズトイレがあります。",
      caution: "春日部駅は高架化工事が続いているため、過去の構内位置と現地が異なる可能性があります。",
      sources: [
        ["東武鉄道 春日部駅", "https://www.tobu.co.jp/railway/guide/station/info/1505/"],
        ["東口新駅舎・旅客トイレ新設のお知らせ", "https://www.tobu.co.jp/cms-pdf/news/20230120093023K3a5c6MpDFt1OVkg32q1aw.pdf"],
        ["ララガーデン春日部 施設・サービス", "https://mitsui-shopping-park.com/lalag-kasukabe/service/"]
      ]
    },
    musashikosugi: {
      routes: {
        "musashikosugi-toilet-1": "北改札側のトイレは位置情報の一次確認が十分でないため、改札内の案内表示を優先してください。",
        "musashikosugi-toilet-2": "JR横須賀線・湘南新宿ライン側では、新南改札（横須賀線口）内コンコースのトイレが公式情報で確認できます。新南改札を目印にしてください。",
        "musashikosugi-toilet-3": "グランツリー武蔵小杉はJR・東急の武蔵小杉駅から徒歩約4分です。館内は全フロアに多機能トイレがあります。"
      },
      urgent: "湘南新宿ライン・横須賀線側にいるなら、新南改札（横須賀線口）内コンコースのトイレが公式確認できる候補です。",
      place: "JR東日本の案内では、新南改札内コンコース（横須賀線口）にトイレ設備が確認できます。東急側にも改札内トイレがありますが、利用路線で位置が大きく変わります。",
      route: "JR横須賀線・湘南新宿ライン側は新南改札（横須賀線口）を目印にしてください。南武線・東急線側からは移動距離が長くなる場合があります。",
      equipment: "JR東日本は新南改札内コンコースの一般トイレにベビーチェア・ベビーシート等を案内しています。東急も武蔵小杉駅の改札内に車いす・オストメイト・ベビーシート対応トイレを案内しています。",
      caution: "JR南武線側、横須賀線側、東急線側で構内が分かれるため、『武蔵小杉駅のトイレ』だけでは位置を特定しにくい駅です。利用路線を確認してください。",
      sources: [
        ["JR東日本 武蔵小杉駅", "https://www.jreast.co.jp/estation/stations/1527.html"],
        ["JR東日本 赤ちゃん向け施設", "https://www.jreast.co.jp/baby/shisetsu/"],
        ["東急 武蔵小杉駅", "https://www.tokyu.co.jp/area/musashi-kosugi/station/"],
        ["グランツリー武蔵小杉 サービス", "https://grand-tree.jp/information/service/"]
      ]
    },
    totsuka: {
      routes: {
        "totsuka-toilet-1": "JRでは橋上改札内コンコースのトイレが公式確認できます。東側からでも、まず橋上改札内コンコースの案内表示を確認してください。",
        "totsuka-toilet-2": "JRでは橋上改札内コンコースのトイレが公式確認できます。西側からでも、まず橋上改札内コンコースの案内表示を確認してください。",
        "totsuka-toilet-3": "トツカーナは戸塚駅西口の駅連絡口から向かえます。館内フロアマップのトイレ表示を確認してください。"
      },
      urgent: "JR利用中なら、橋上改札内コンコースのトイレを優先して確認してください。改札を出る前に使える候補です。",
      place: "JR東日本は戸塚駅の橋上改札内コンコースにトイレ・バリアフリートイレがあることを案内しています。横浜市営地下鉄にもトイレ・多目的トイレがあります。",
      route: "JRホームからは橋上改札へ上がり、改札内コンコースのトイレ案内を確認してください。駅外の代案トツカーナは西口駅連絡口側です。",
      equipment: "JR東日本は橋上改札内の一般トイレ・バリアフリートイレにベビーチェア等を案内しています。横浜市営地下鉄の駅情報では多目的トイレ、オストメイト、ベビーシート等が案内されています。",
      caution: "このページの『改札内東側／西側』という表現より、一次情報で確認できる『橋上改札内コンコース』を優先して案内します。",
      sources: [
        ["JR東日本 戸塚駅", "https://www.jreast.co.jp/estation/stations/1057.html"],
        ["JR東日本 赤ちゃん向け施設", "https://www.jreast.co.jp/baby/shisetsu/"],
        ["横浜市交通局 戸塚駅", "https://navi.hamabus.city.yokohama.lg.jp/koutuu/pc/detail/Station?id=00002195"],
        ["トツカーナ・東急プラザ戸塚 フロアマップ", "https://tokyu-plaza.com/totsuka/theme/ttk/assets/js/pdfjs/web/viewer.html?file=%2Ftotsuka%2Ftheme%2Fttk%2Fassets%2Fpdf%2Ftotsuka_map.pdf"]
      ]
    }
  };

  const slug = window.location.pathname.split("/").filter(Boolean).pop()?.replace(/\.html$/, "") || "";
  const details = detailsBySlug[slug];
  if (!details) return;

  Object.entries(details.routes).forEach(([cardId, routeText]) => {
    const card = document.getElementById(cardId);
    if (!card) return;
    const routeRow = Array.from(card.querySelectorAll(".kv > div")).find((row) => {
      return (row.querySelector("dt")?.textContent || "").replace(/\s+/g, "") === "行き方";
    });
    const dd = routeRow?.querySelector("dd");
    if (dd && !dd.textContent.trim()) dd.textContent = routeText;
  });

  if (document.getElementById("research-details")) return;
  const report = document.getElementById("station-report");
  if (!report) return;

  const sourceLinks = details.sources
    .map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`)
    .join(" / ");

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
