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
    const navLinks = document.querySelectorAll(".nav a");
    const navNumbers = document.querySelectorAll(".nav a > span");

    if (!siteHeader || !headerInner) {
      return;
    }

    siteHeader.style.borderBottomWidth = "3px";
    headerInner.style.minHeight = "58px";
    headerInner.style.gap = "12px";

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

    navNumbers.forEach((number) => number.remove());

    if (nav) {
      nav.style.gap = "0";
    }

    navLinks.forEach((link) => {
      link.style.width = "96px";
      link.style.minWidth = "96px";
      link.style.gap = "0";
      link.style.padding = "0 8px";
      link.style.fontSize = "0.72rem";
      link.style.textAlign = "center";
      link.style.whiteSpace = "nowrap";
    });
  };

  simplifyOmiyaCandidateCount();
  compactOmiyaSiteHeader();

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