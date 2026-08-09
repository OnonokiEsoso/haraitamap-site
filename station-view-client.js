(() => {
  const stationPath = window.location.pathname.replace(/\/$/, "");

  const isOmiyaPage = () =>
    document.body.classList.contains("station-page-omiya");

  const simplifyOmiyaCandidateCount = () => {
    if (!isOmiyaPage()) {
      return;
    }

    const countBox = document.querySelector(".overview-count");
    const count = countBox?.querySelector("strong");

    if (!countBox || !count) {
      return;
    }

    countBox.querySelector("span")?.remove();
    countBox.querySelector("p")?.remove();
    count.textContent = "7ヶ所";

    countBox.style.display = "flex";
    countBox.style.alignItems = "center";
    countBox.style.justifyContent = "center";
    countBox.style.minHeight = "0";
    countBox.style.padding = "8px 14px";

    count.style.margin = "0";
    count.style.fontSize = "0.9rem";
    count.style.lineHeight = "1.2";
    count.style.letterSpacing = "0.02em";
  };

  const compactOmiyaSiteHeader = () => {
    if (!isOmiyaPage()) {
      return;
    }

    const siteHeader = document.querySelector(".site-header");
    const headerInner = document.querySelector(".header-inner");
    const brand = document.querySelector(".brand");
    const brandIcon = document.querySelector(".brand-icon");
    const brandSmall = document.querySelector(".brand-copy small");
    const brandTitle = document.querySelector(".brand-copy strong");
    const nav = document.querySelector(".nav");

    if (!siteHeader || !headerInner) {
      return;
    }

    nav?.remove();

    siteHeader.style.borderBottomWidth = "3px";
    headerInner.style.minHeight = "58px";
    headerInner.style.gap = "0";
    headerInner.style.justifyContent = "flex-start";

    if (brand) {
      brand.style.gap = "9px";
    }

    if (brandIcon) {
      brandIcon.style.width = "38px";
      brandIcon.style.height = "38px";
      brandIcon.style.flexBasis = "38px";
    }

    if (brandSmall) {
      brandSmall.style.fontSize = "0.48rem";
      brandSmall.style.letterSpacing = "0.12em";
    }

    if (brandTitle) {
      brandTitle.style.fontSize = "0.82rem";
      brandTitle.style.letterSpacing = "0.04em";
    }
  };

  const simplifyOmiyaStationTitle = () => {
    if (!isOmiyaPage()) {
      return;
    }

    const title = document.querySelector(".section-head.station-title");
    const plaque = title?.querySelector(".station-plaque");
    const label = plaque?.querySelector(":scope > span");
    const stationName = plaque?.querySelector("h2");
    const code = plaque?.querySelector("b");

    if (!title || !plaque || !stationName) {
      return;
    }

    document.querySelector(".breadcrumb")?.remove();
    title.querySelector(".station-title-copy")?.remove();
    title.querySelector(".back-to-search")?.remove();

    title.style.display = "block";
    title.style.minHeight = "0";
    title.style.marginTop = "0";
    title.style.marginBottom = "0";
    title.style.borderTopWidth = "0";

    plaque.style.display = "grid";
    plaque.style.gridTemplateColumns = "auto 1fr auto";
    plaque.style.alignItems = "center";
    plaque.style.gap = "14px";
    plaque.style.minHeight = "64px";
    plaque.style.padding = "10px 16px";

    if (label) {
      label.style.fontSize = "0.52rem";
      label.style.letterSpacing = "0.14em";
      label.style.whiteSpace = "nowrap";
    }

    stationName.style.margin = "0";
    stationName.style.fontSize = "1.35rem";
    stationName.style.lineHeight = "1.2";
    stationName.style.writingMode = "horizontal-tb";
    stationName.style.letterSpacing = "0.08em";
    stationName.style.textAlign = "center";

    if (code) {
      code.style.fontSize = "0.78rem";
      code.style.letterSpacing = "0.12em";
      code.style.whiteSpace = "nowrap";
    }

    let reSearch = title.nextElementSibling;
    if (!reSearch || !reSearch.classList.contains("omiya-research")) {
      reSearch = document.createElement("a");
      reSearch.className = "omiya-research";
      reSearch.href = "../index.html";
      reSearch.innerHTML = '<span>再検索</span><b aria-hidden="true">→</b>';
      title.insertAdjacentElement("afterend", reSearch);
    }

    reSearch.style.display = "flex";
    reSearch.style.alignItems = "center";
    reSearch.style.justifyContent = "space-between";
    reSearch.style.minHeight = "44px";
    reSearch.style.margin = "0 0 14px";
    reSearch.style.border = "1px solid #858b81";
    reSearch.style.borderTop = "0";
    reSearch.style.background = "rgba(255, 253, 247, 0.84)";
    reSearch.style.color = "#173c31";
    reSearch.style.padding = "0 16px";
    reSearch.style.fontSize = "0.78rem";
    reSearch.style.fontWeight = "900";
  };

  const removeOmiyaSectionNumbers = () => {
    if (!isOmiyaPage()) {
      return;
    }

    document
      .querySelectorAll(".list-number, .section-number")
      .forEach((number) => number.remove());

    document.querySelectorAll(".list-heading").forEach((heading) => {
      heading.style.gap = "0";
    });
  };

  simplifyOmiyaCandidateCount();
  compactOmiyaSiteHeader();
  simplifyOmiyaStationTitle();
  removeOmiyaSectionNumbers();

  const stationName =
    document.querySelector(".station-title h2")?.textContent.trim();

  if (!stationName) {
    return;
  }

  const sessionKey = `station-viewed:${stationPath}`;

  if (sessionStorage.getItem(sessionKey)) {
    return;
  }

  fetch("/api/station-view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      stationPath,
      stationName
    }),
    keepalive: true
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`閲覧数APIエラー: ${response.status}`);
      }

      sessionStorage.setItem(sessionKey, "1");
    })
    .catch((error) => {
      console.warn("閲覧数の記録に失敗しました。", error);
    });
})();