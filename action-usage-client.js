(() => {
  "use strict";

  const recordAction = (actionName) => {
    if (!actionName) return;

    fetch("/api/action-usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ actionName }),
      keepalive: true
    }).catch((error) => {
      console.warn("行動集計の記録に失敗しました。", error);
    });
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target.closest("[data-action-name]");
      if (!target) return;
      recordAction(target.dataset.actionName);
    },
    { capture: true }
  );

  if (window.location.pathname.includes("/stations/")) {
    const slug = window.location.pathname.split("/").filter(Boolean).pop()?.replace(/\.html$/, "") || "";
    const demandStyleStations = new Set([
      "tsuchiura",
      "mikawashima",
      "mito",
      "katsuta",
      "hitachi",
      "sendai",
      "kitasenju",
      "nagamachi",
      "tomobe",
      "tokai"
    ]);

    if (demandStyleStations.has(slug)) {
      const styleLink = document.createElement("link");
      styleLink.rel = "stylesheet";
      styleLink.href = "../station-demand-tokyo-ui.css";
      document.head.appendChild(styleLink);
    }

    ["../station-strong-details.js", "../station-demand-details.js"].forEach((src) => {
      const stationDetailsScript = document.createElement("script");
      stationDetailsScript.src = src;
      stationDetailsScript.defer = true;
      document.head.appendChild(stationDetailsScript);
    });
  }
})();
