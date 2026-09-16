"use strict";

(() => {
  const sortSelect = document.querySelector('.sort-controls select[id$="-sort"]');
  if (!sortSelect) return;

  const sortControls = sortSelect.closest(".sort-controls");
  const container = sortSelect.closest(".container");
  if (!container || !sortControls) return;

  const sortItems = [
    { value: "recommend", label: "おすすめ度順" },
    { value: "clean", label: "きれい度順" },
    { value: "big", label: "大期待値順" },
    { value: "small", label: "小期待度順" },
    { value: "newness", label: "新しさ順" }
  ];

  const cards = Array.from(container.querySelectorAll(":scope > .card"));
  const originalOrder = new Map(cards.map((card, index) => [card, index]));

  const sortLabel = sortControls.querySelector(`label[for="${sortSelect.id}"]`);
  if (sortLabel) {
    sortLabel.hidden = true;
  }
  sortSelect.hidden = true;

  const sortWrap = document.createElement("div");
  sortWrap.className = "sort-menu-wrap";
  const sortButton = document.createElement("button");
  sortButton.type = "button";
  sortButton.className = "btn small ghost sort-menu-button";
  sortButton.setAttribute("aria-haspopup", "true");
  sortButton.setAttribute("aria-expanded", "false");

  const sortMenu = document.createElement("div");
  sortMenu.className = "sort-menu-dropdown";
  sortMenu.setAttribute("role", "menu");
  sortMenu.hidden = true;

  sortItems.forEach((item) => {
    const itemButton = document.createElement("button");
    itemButton.type = "button";
    itemButton.textContent = item.label;
    itemButton.dataset.value = item.value;
    itemButton.setAttribute("role", "menuitemradio");
    itemButton.addEventListener("click", () => {
      sortSelect.value = item.value;
      syncSortMenu();
      animateSort(item.value);
      sortMenu.hidden = true;
      sortButton.setAttribute("aria-expanded", "false");
    });
    sortMenu.appendChild(itemButton);
  });

  sortWrap.append(sortButton, sortMenu);
  sortControls.insertBefore(sortWrap, sortControls.firstChild);

  const toStarCount = (text) => (text.match(/★/g) || []).length;
  const toNewnessScore = (text) => {
    if (text.includes("新しい") || text.includes("新")) return 3;
    if (text.includes("普通")) return 2;
    if (text.includes("旧")) return 1;
    return 0;
  };

  const getMetricValue = (card, label) => {
    const rows = Array.from(card.querySelectorAll(".kv div"));
    for (const row of rows) {
      const name = row.querySelector("dt")?.textContent?.replace(/\s+/g, "") || "";
      if (name === label) {
        return row.querySelector("dd")?.textContent?.trim() || "";
      }
    }
    return "";
  };

  const recommendScore = (card) => {
    const clean = toStarCount(getMetricValue(card, "トイレのきれい度"));
    const big = toStarCount(getMetricValue(card, "大期待値"));
    const small = toStarCount(getMetricValue(card, "小期待値"));
    const newness = toNewnessScore(getMetricValue(card, "トイレの新しさ"));
    let score = clean * 3 + big * 6 + small + newness * 3;
    if (clean === 1) score -= 8;
    if (big === 1) score -= 16;
    if (clean === 2) score -= 4;
    if (big === 2) score -= 9;
    if (big === 3) score -= 2;
    if (small === 1) score -= 3;
    if (small === 2) score -= 1;
    return score;
  };

  const scoreByMode = {
    recommend: recommendScore,
    clean: (card) => toStarCount(getMetricValue(card, "トイレのきれい度")),
    big: (card) => toStarCount(getMetricValue(card, "大期待値")),
    small: (card) => toStarCount(getMetricValue(card, "小期待値")),
    newness: (card) => toNewnessScore(getMetricValue(card, "トイレの新しさ"))
  };

  const sortCards = (mode) => {
    const getter = scoreByMode[mode] || recommendScore;
    const sorted = [...cards].sort((a, b) => {
      const difference = getter(b) - getter(a);
      return difference || originalOrder.get(a) - originalOrder.get(b);
    });
    const listEndAnchor = container.querySelector(
      ":scope > .station-report, :scope > .photo-credit"
    );
    sorted.forEach((card) => container.insertBefore(card, listEndAnchor));
  };

  let animationToken = 0;
  const animateSort = (mode) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sortCards(mode);
      return;
    }
    const token = ++animationToken;
    const visibleCards = cards.filter((card) => !card.hidden);
    visibleCards.forEach((card) => card.classList.add("is-sorting-out"));
    window.setTimeout(() => {
      if (token !== animationToken) return;
      sortCards(mode);
      visibleCards.forEach((card) => {
        card.classList.remove("is-sorting-out");
        card.classList.add("is-sorting-in");
      });
      window.setTimeout(() => {
        if (token !== animationToken) return;
        visibleCards.forEach((card) => card.classList.remove("is-sorting-in"));
      }, 130);
    }, 70);
  };

  function syncSortMenu() {
    sortMenu.querySelectorAll("button[data-value]").forEach((button) => {
      const isActive = button.dataset.value === sortSelect.value;
      button.setAttribute("aria-checked", String(isActive));
    });
    const activeItem = sortItems.find((item) => item.value === sortSelect.value);
    sortButton.textContent = `${activeItem?.label || "並び替え"} ▼`;
  }

  sortButton.addEventListener("click", () => {
    const willOpen = sortMenu.hidden;
    sortMenu.hidden = !willOpen;
    sortButton.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) syncSortMenu();
  });

  document.addEventListener("click", (event) => {
    if (!sortWrap.contains(event.target)) {
      sortMenu.hidden = true;
      sortButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      sortMenu.hidden = true;
      sortButton.setAttribute("aria-expanded", "false");
    }
  });

  sortSelect.addEventListener("change", () => {
    syncSortMenu();
    animateSort(sortSelect.value);
  });

  syncSortMenu();
  sortCards(sortSelect.value);
})();

(() => {
  const RESEARCH_DATE = "2026年9月16日";
  const stationKey = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");

  const data = {
    ayase: {
      quick: "乗車位置から近い東西の改札側へ。設備の確認度は西改札側が高めです。",
      place: "西改札内広場にトイレ設備があります。東改札側にも一般トイレがあるとの補助情報があります。",
      route: "改札を出ず、乗車位置に応じて東西の近い方を目指してください。西側は西改札内広場が目印です。",
      equipment: "西側はオストメイト対応・乳幼児向け設備を公式情報で確認しています。東側を西側と同等設備とは断定できません。",
      caution: "東改札側の設備詳細は補助情報中心です。設備を優先する場合は西側の案内を確認してください。",
      sources: "東京メトロ公式（駅・バリアフリー情報）／補助：駅・トイレ調査資料"
    },
    higashitotsuka: {
      quick: "ホームから2階の改札内コンコースへ上がり、改札・駅事務室に近いトイレを目指してください。",
      place: "2階改札内コンコース。改札・駅事務室に近い位置です。",
      route: "島式ホームから階段・エスカレーター・エレベーター等で2階改札階へ上がり、改札を出ずトイレ表示を確認してください。",
      equipment: "JR公式で男女トイレとバリアフリートイレを確認。過去の個室数記録はありますが、現在数は未確認です。",
      caution: "古い個室数を現在値としては扱っていません。朝の混雑・昼の空き傾向も旧調査情報です。",
      sources: "JR東日本公式（駅構内図・バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    hodogaya: {
      quick: "ホームから2階へ上がり、改札・駅事務室付近の改札内トイレを目指してください。",
      place: "2階改札内コンコース。駅事務室・改札に近い位置です。",
      route: "島式ホームの1階から2階改札階へ上がり、改札を出ずにトイレ表示を確認してください。",
      equipment: "JR公式で男女トイレとバリアフリートイレを確認。現在の個室数は不明です。",
      caution: "駅構内の別トイレは確認できませんでした。駅前公園は公式情報でトイレなしのため第2候補にはしていません。",
      sources: "JR東日本公式（駅構内図・バリアフリー情報）／自治体公式"
    },
    itabashi: {
      quick: "1階改札階の駅事務室・改札付近を目指してください。",
      place: "1階改札階、駅事務室・改札付近です。",
      route: "ホームから改札階へ移動し、駅事務室・改札付近のトイレ表示を確認してください。ホームから大宮寄り側の動線という情報は補助情報です。",
      equipment: "JR公式でトイレとバリアフリートイレを確認。現在の一般個室数は不明です。",
      caution: "朝に混雑するという記録は旧情報です。過去の便器数・設備数を現在値としては表示していません。",
      sources: "JR東日本公式（駅構内図・バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    jujo: {
      quick: "北改札・1番ホーム側を目指してください。",
      place: "北改札・1番ホーム側のトイレが、今回確認できた主な候補です。",
      route: "駅構内では北改札・1番ホーム側を目印に進んでください。南改札側からは使いやすさが落ちます。",
      equipment: "多目的トイレは自治体情報で、段差なし・車いすスペース・電動ドア・オストメイト洗浄設備・ベビーシート・手すり等を確認しています。",
      caution: "古い一般便器構成は現在値に使用していません。朝の混雑傾向も旧情報です。",
      sources: "JR東日本公式／東京都・自治体公式（バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    kamakura: {
      quick: "JR利用中なら、まず改札内・東口側コンコースの駅内トイレを目指してください。",
      place: "JR改札内、東口側コンコースです。",
      route: "JR構内から改札を出ず、東口側コンコースのトイレ表示を確認してください。",
      equipment: "JR公式で男女トイレとバリアフリートイレを確認。現在の個室数は不明です。",
      caution: "西口側の代替候補は現況を確定できていません。観光地であることだけを根拠に混雑とは断定していません。",
      sources: "JR東日本公式（駅構内図・バリアフリー情報）／補助：過去の施設情報"
    },
    kitaakabane: {
      quick: "1階改札階側のトイレ案内を確認してください。どの改札側に独立トイレがあるかは現地案内を優先してください。",
      place: "1階改札階側にトイレ設備があることを確認しています。",
      route: "ホームから1階改札階へ下り、トイレ表示を確認してください。新宿寄り端側の昇降設備という具体位置は補助情報です。",
      equipment: "JR公式でバリアフリートイレを確認しています。",
      caution: "両改札それぞれに独立したトイレがあるかは未確定です。旧調査では朝に混む場合がある・昼は空きやすいとの記録があります。",
      sources: "JR東日本公式（バリアフリー情報）／補助：駅・トイレ調査資料"
    },
    kitakamakura: {
      quick: "現在の駅案内・バリアフリー経路を優先し、トイレ表示を確認してください。",
      place: "旧情報では西口側にトイレがあり、東口側にはないとの記録があります。現在の正確な位置は要確認です。",
      route: "現在のバリアフリー経路はJR公式案内を優先してください。古い踏切経由の案内は現行ルートとして扱いません。",
      equipment: "JR公式でエレベーターとバリアフリートイレを確認。エスカレーターは確認されていません。旧便器数は現在値にしていません。",
      caution: "西口側のみという位置情報は旧情報です。現地の案内表示を優先してください。",
      sources: "JR東日本公式（駅・バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    kitamiya: {
      quick: "駅構内のトイレ表示を目指してください。設備面は東武公式で確認できています。",
      place: "駅構内にトイレ設備があります。正確な位置は今回の調査では確定できませんでした。",
      route: "駅構内の案内表示を優先してください。",
      equipment: "東武鉄道公式で男女トイレ・バリアフリートイレのベビーチェア／ベビーシート設備を確認しています。",
      caution: "2024年末〜2025年初頭ごろの改修は補助情報です。比較的新しい可能性はありますが、改修時期を公式一次情報で確定できていません。",
      sources: "東武鉄道公式（駅設備情報）／補助：専門サイトの改修記録"
    },
    kitatoda: {
      quick: "バリアフリートイレの案内表示を確認し、正確な位置は現地案内を優先してください。",
      place: "JR公式でバリアフリートイレの存在を確認。現在の正確な左右位置は不足しています。",
      route: "ホームから改札階へ移動後、駅構内のトイレ表示を確認してください。方向は推測せず記載していません。",
      equipment: "バリアフリートイレあり。一般個室数などは不明です。",
      caution: "正確な位置情報が不足しているため、おすすめ候補とは断定していません。現地確認を推奨します。",
      sources: "JR東日本公式（駅構内図・バリアフリー情報）"
    },
    kitayono: {
      quick: "M2F改札階へ移動し、改札正面を確認してください。",
      place: "旧調査ではM2F改札階・改札正面です。",
      route: "ホームから改札階へ移動し、改札正面のトイレ表示を確認してください。具体位置は旧情報として扱っています。",
      equipment: "JR公式でバリアフリートイレを確認。旧調査では温水洗浄便座ありとの記録があります。",
      caution: "比較的混みにくいという情報と温水洗浄便座情報は旧調査です。現在の状態と異なる可能性があります。",
      sources: "JR東日本公式（バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    minamiyono: {
      quick: "1階改札階へ下り、エスカレーター左側という旧位置情報を目安に現地表示を確認してください。",
      place: "旧調査では1階改札階、エスカレーター左側です。",
      route: "ホームから1階改札階まで上下移動があります。改札階へ下り、トイレ表示を確認してください。",
      equipment: "JR公式でバリアフリートイレを確認。旧便器数は現在値にしていません。",
      caution: "ホームからの上下移動がやや長めです。朝に混みやすく昼は空きやすいという傾向は旧情報です。",
      sources: "JR東日本公式（バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    musashiurawa: {
      quick: "埼京線側コンコースのトイレを目指してください。武蔵野線ホームからは距離があります。",
      place: "埼京線側コンコースにトイレ設備があります。",
      route: "埼京線利用時は埼京線側コンコースへ。武蔵野線からは乗換通路を通って埼京線側へ移動するため距離があります。",
      equipment: "JR公式でエレベーター・エスカレーター・バリアフリートイレを確認。2014年に改修・拡張されたとの記録があります。",
      caution: "2014年改修を根拠に2026年現在『新しい』とは表示していません。古い個室数・混雑記録も現在値にはしていません。",
      sources: "JR東日本公式（駅・バリアフリー情報）／補助：2014年改修・過去のトイレ調査資料"
    },
    nakaurawa: {
      quick: "2階改札階へ移動し、改札・駅事務室付近のトイレを目指してください。",
      place: "2階改札内コンコース、改札・駅事務室に近い位置です。",
      route: "3階ホームから2階改札階へ下り、改札を出ずにトイレ表示を確認してください。",
      equipment: "JR公式構内図で男女トイレとバリアフリートイレを確認。個室数は不明です。",
      caution: "混雑状況は確認できていません。",
      sources: "JR東日本公式（駅構内図・バリアフリー情報）"
    },
    nanasato: {
      quick: "新しい橋上駅舎内のトイレ表示を確認してください。正確な左右位置は要確認です。",
      place: "現行の橋上駅舎にトイレ設備がありますが、正確な左右位置は今回の調査で確定できませんでした。",
      route: "2024年に使用開始した橋上駅舎内で、駅の案内表示を優先してください。",
      equipment: "東武公式でバリアフリートイレと男女・バリアフリートイレのベビーチェア／ベビーシート設備を確認しています。",
      caution: "橋上駅舎は2024年2月に使用開始していますが、トイレ単体の供用開始日とは断定していません。",
      sources: "さいたま市公式（橋上駅舎整備情報）／東武鉄道公式（駅設備情報）"
    },
    nishioi: {
      quick: "改札内にトイレがあるとは断定できません。急いでいる場合も現地の案内・駅係員確認を優先してください。",
      place: "補助情報では『改札内にトイレがない可能性が高い』とされていますが、JR一次情報で改札内外を確定できていません。",
      route: "現時点では改札内外を含め正確なルートを確定できないため、現地案内を優先してください。",
      equipment: "バリアフリー設備を含むトイレ位置の確定情報が不足しています。",
      caution: "要確認駅です。『改札内にない』を確定事実としては表示していません。混雑・個室数も不明です。",
      sources: "JR東日本公式／補助：駅・トイレ調査資料（改札内外は未確定）"
    },
    omiyakoen: {
      quick: "駅内のトイレ表示を確認してください。正確な位置は要確認です。",
      place: "東武公式でトイレ設備を確認していますが、駅構内の正確な位置は今回の調査で確定できませんでした。",
      route: "駅構内の案内表示を優先してください。",
      equipment: "東武公式でバリアフリートイレとベビーチェア／ベビーシート設備を確認しています。",
      caution: "大宮公園内にもトイレはありますが、駅から徒歩約10分のため腹痛時の緊急代替としては遠いです。",
      sources: "東武鉄道公式（駅設備情報）／埼玉県公式（大宮公園案内）"
    },
    owada: {
      quick: "駅構内のトイレ表示を確認してください。ホームからの距離は現時点で未確認です。",
      place: "東武公式でトイレ設備を確認していますが、正確な場所は今回の調査で確定できませんでした。",
      route: "駅構内の案内表示を優先してください。ホームからの具体的な距離・方向は推測していません。",
      equipment: "東武公式でバリアフリートイレと男女・バリアフリートイレのベビーチェア／ベビーシート設備を確認しています。",
      caution: "腹痛時に重要な『ホームからの距離』が未確認です。現地確認を推奨します。",
      sources: "東武鉄道公式（駅設備情報）"
    },
    shinkawasaki: {
      quick: "2階改札階へ上がり、改札に向かって左側という旧具体情報を目安にトイレ表示を確認してください。",
      place: "2階改札階。旧調査では改札に向かって左側です。",
      route: "旧調査ではホーム中央付近の階段・エスカレーターから2階へ上がる動線です。現在は現地表示を優先してください。",
      equipment: "JR公式でバリアフリートイレを確認。旧個室数は現在値にしていません。",
      caution: "位置の細部・朝混雑・昼の空き傾向は旧情報です。鹿島田駅は徒歩移動が必要な遠い第2候補です。",
      sources: "JR東日本公式（バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    toda: {
      quick: "改札階でバリアフリートイレ等の案内表示を確認してください。正確な左右位置は要確認です。",
      place: "JR公式でトイレ設備・バリアフリートイレを確認していますが、正確な左右位置は未確定です。",
      route: "ホームから改札階へ移動し、駅構内のトイレ表示を優先してください。",
      equipment: "バリアフリートイレあり。一般個室数等は不明です。",
      caution: "情報不足のため『おすすめ』とは断定していません。現地確認を推奨します。",
      sources: "JR東日本公式（駅構内図・バリアフリー情報）"
    },
    todakoen: {
      quick: "2階改札階へ移動し、エスカレーター横という旧位置情報を目安にトイレ表示を確認してください。",
      place: "旧調査では2階改札階、エスカレーター横です。",
      route: "3階ホームから2階改札階へ下り、トイレ表示を確認してください。",
      equipment: "JR公式でバリアフリートイレを確認。過去の調査では一般個室2室との記録がありますが、現在数は未確認です。",
      caution: "個室2室は旧情報であり現在値ではありません。イベント開催を理由に混雑するとは推測していません。",
      sources: "JR東日本公式（駅・バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    torisawa: {
      quick: "駅トイレの現在の有無・位置を確定できていません。現地案内または駅係員への確認を優先してください。",
      place: "一般トイレの現在の有無・位置は一次情報で確定できていません。",
      route: "トイレの存在自体が未確定のため、具体的な行き方を推測していません。",
      equipment: "JR公式でバリアフリートイレなしを確認。エレベーター・エスカレーターも確認されていません。",
      caution: "最重要の要確認駅です。『トイレあり』とは表示せず、情報不足を明示しています。",
      sources: "JR東日本公式（駅・バリアフリー情報）"
    },
    ukimafunado: {
      quick: "1階改札階へ下り、エスカレーター横という旧位置情報を目安にトイレ表示を確認してください。",
      place: "旧調査では1階改札階、エスカレーター横です。",
      route: "ホームから1階改札階へ移動し、現地のトイレ表示を確認してください。",
      equipment: "JR公式でバリアフリートイレを確認。旧便器数は現在値にしていません。",
      caution: "エスカレーター横という位置、朝に混みやすい・昼は空きやすいという傾向はいずれも旧情報です。",
      sources: "JR東日本公式（バリアフリー情報）／補助：過去のトイレ調査資料"
    },
    yonohonmachi: {
      quick: "1階改札階へ移動し、改札に向かって右側という旧位置情報を目安に確認してください。",
      place: "旧調査では1階改札階、改札に向かって右側です。",
      route: "ホームから1階改札階へ移動し、トイレ表示を確認してください。具体的な右側位置は旧情報として扱っています。",
      equipment: "JR公式でバリアフリートイレを確認。旧便器数は現在値にしていません。",
      caution: "比較的混みにくいという記録は旧情報です。現在の混雑を断定していません。",
      sources: "JR東日本公式（バリアフリー情報）／補助：過去のトイレ調査資料"
    }
  };

  const info = data[stationKey];
  if (!info) return;

  const container = document.querySelector("main .container");
  const report = container?.querySelector(":scope > .station-report");
  if (!container || !report || container.querySelector(".researched-station-guide")) return;

  const stationName = document.querySelector(".station-title h2")?.textContent?.trim() || "この駅";
  const section = document.createElement("section");
  section.className = "card researched-station-guide";
  section.setAttribute("aria-label", `${stationName}の調査済みトイレ案内`);
  section.style.marginTop = "18px";
  section.innerHTML = `
    <div class="card-body">
      <p class="muted" style="margin:0 0 6px;">RESEARCHED GUIDE</p>
      <h2 style="margin:0 0 14px;">腹痛時に役立つ確認済み情報</h2>
      <dl class="kv">
        <div><dt>急いでいる場合</dt><dd>${info.quick}</dd></div>
        <div><dt>場所</dt><dd>${info.place}</dd></div>
        <div><dt>行き方</dt><dd>${info.route}</dd></div>
        <div><dt>設備・確度</dt><dd>${info.equipment}</dd></div>
        <div><dt>注意点</dt><dd>${info.caution}</dd></div>
        <div><dt>情報確認</dt><dd>${RESEARCH_DATE}</dd></div>
        <div><dt>主な情報源</dt><dd>${info.sources}</dd></div>
      </dl>
      <p class="muted" style="margin:14px 0 0;">補助情報・旧調査を使っている箇所は、その旨を本文中に明記しています。確認できない内容は推測で補っていません。</p>
    </div>`;
  container.insertBefore(section, report);

  const overview = container.querySelector(".best-pick");
  if (overview) {
    const label = overview.querySelector(".best-pick-label span");
    const badge = overview.querySelector(".best-pick-label em");
    const title = overview.querySelector(".best-pick-main strong");
    const description = overview.querySelector(".best-pick-main p");
    if (label) label.textContent = "腹痛時の確認ポイント";
    if (badge) badge.textContent = "調査済み";
    if (title) title.textContent = info.quick;
    if (description) description.textContent = "2026年9月16日のWeb調査に基づき、公式情報を優先し、旧情報・補助情報は区別して表示しています。";
    overview.href = "#researched-guide-anchor";
    section.id = "researched-guide-anchor";
  }

  const cards = Array.from(container.querySelectorAll(":scope > .card:not(.researched-station-guide)"));
  cards.forEach((card) => {
    const recommendRow = Array.from(card.querySelectorAll(".kv > div")).find((row) =>
      (row.querySelector("dt")?.textContent || "").replace(/\s+/g, "") === "おすすめ度"
    );
    if (recommendRow?.querySelector("dd")?.textContent.trim() === "未評価") {
      recommendRow.querySelector("dd").textContent = info.caution.includes("要確認") || info.quick.includes("確定でき")
        ? "情報不足・要確認"
        : "調査情報を下記に追記";
    }
  });
})();
