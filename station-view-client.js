(() => {
  const stationPath = window.location.pathname.replace(/\/$/, "");

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
    countBox.style.padding = "18px 20px";

    count.style.margin = "0";
    count.style.fontSize = "1.15rem";
    count.style.lineHeight = "1.4";
    count.style.letterSpacing = "0.04em";
  };

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