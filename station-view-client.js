(() => {
  const stationPath = window.location.pathname.replace(/\/$/, "");

  const compactOmiyaLayout = () => {
    if (!document.body.classList.contains("station-page-omiya")) {
      return;
    }

    const breadcrumb = document.querySelector(".breadcrumb");
    const title = document.querySelector(".section-head.station-title");
    const plaque = document.querySelector(".station-plaque");
    const plaqueTitle = plaque?.querySelector("h2");
    const titleCopy = document.querySelector(".station-title-copy");
    const titleHeading = titleCopy?.querySelector("h1");
    const stationLines = document.querySelector(".station-lines");
    const backToSearch = document.querySelector(".back-to-search");

    if (breadcrumb) {
      breadcrumb.style.minHeight = "32px";
    }

    if (title) {
      title.style.gridTemplateColumns = "112px minmax(0, 1fr) 150px";
      title.style.minHeight = "132px";
      title.style.marginBottom = "12px";
      title.style.borderTopWidth = "5px";
    }

    if (plaque) {
      plaque.style.padding = "10px 14px";
    }

    if (plaqueTitle) {
      plaqueTitle.style.fontSize = "1.55rem";
      plaqueTitle.style.lineHeight = "1.15";
    }

    if (titleCopy) {
      titleCopy.style.padding = "14px 20px";
    }

    if (titleHeading) {
      titleHeading.style.fontSize = "clamp(1.45rem, 3vw, 2.15rem)";
      titleHeading.style.lineHeight = "1.2";
    }

    if (stationLines) {
      stationLines.style.marginTop = "10px";
      stationLines.style.gap = "4px";
    }

    stationLines?.querySelectorAll("span").forEach((line) => {
      line.style.padding = "3px 7px";
      line.style.fontSize = "0.6rem";
    });

    if (backToSearch) {
      backToSearch.style.padding = "14px";
    }
  };

  const simplifyOmiyaCandidateCount = () => {
    if (!document.body.classList.contains("station-page-omiya")) {
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

  compactOmiyaLayout();
  simplifyOmiyaCandidateCount();

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