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

  const postJson = (url, payload) => {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch((error) => {
      console.warn("利用状況の記録に失敗しました。", error);
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

  const markStationEntrySource = (event) => {
    const link = event.target.closest('a[href*="stations/"]');
    if (!link) return;

    let source = "station_list";
    const query = document.getElementById("station-input")?.value.trim() || "";
    const line = document.getElementById("line-select")?.value || "";

    if (link.closest("#popular-station-list")) {
      source = "quick_select";
    } else if (query) {
      source = "search";
    } else if (line) {
      source = "line_filter";
    }

    try {
      sessionStorage.setItem("haraitaStationEntrySource", source);
    } catch (_) {}
  };

  const ensureHomeSupportStyles = () => {
    if (!document.getElementById("coping-links")) return;
    if (document.getElementById("home-support-links-style")) return;

    const style = document.createElement("style");
    style.id = "home-support-links-style";
    style.textContent = `
      .support-links-section {
        display: grid;
        width: min(1180px, calc(100% - 40px));
        margin: 0 auto 46px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        scroll-margin-top: 96px;
      }
      .support-card {
        position: relative;
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas:
          "label arrow"
          "title arrow"
          "copy arrow";
        align-items: center;
        gap: 3px 16px;
        min-height: 116px;
        border: 1px solid #8e958c;
        border-left: 6px solid var(--moss);
        background: rgba(255, 253, 247, 0.82);
        padding: 16px 18px;
        transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
      }
      .support-card:first-child { border-left-color: var(--seal); }
      .support-card:hover {
        border-color: var(--forest);
        background: rgba(255, 253, 247, 0.98);
        transform: translateY(-1px);
      }
      .support-card > span {
        grid-area: label;
        color: var(--muted);
        font-size: 0.7rem;
      }
      .support-card > strong {
        grid-area: title;
        color: var(--forest-dark);
        font-family: "Yu Mincho", "Hiragino Mincho ProN", serif;
        font-size: 1rem;
      }
      .support-card > small {
        grid-area: copy;
        color: var(--muted);
        font-size: 0.68rem;
        line-height: 1.5;
      }
      .support-card > i {
        grid-area: arrow;
        color: var(--forest);
        font-size: 1.3rem;
        font-style: normal;
      }
      .support-card:first-child > i { color: var(--seal); }
      @media (max-width: 680px) {
        .support-links-section {
          width: min(100% - 24px, 1180px);
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 28px;
        }
        .support-card {
          min-height: 0;
          padding: 13px 14px;
          grid-template-columns: 1fr auto;
        }
        .support-card > strong { font-size: 0.94rem; }
        .support-card > span,
        .support-card > small { font-size: 0.66rem; }
      }
    `;
    document.head.appendChild(style);
  };

  if (!window.location.pathname.includes("/stations/")) {
    document.addEventListener("click", markStationEntrySource, { capture: true });
    ensureHomeSupportStyles();
    return;
  }

  const stationPath = window.location.pathname.replace(/\/$/, "");
  const slug = stationPath.split("/").filter(Boolean).pop()?.replace(/\.html$/, "") || "";
  const stationName =
    document.querySelector(".station-plaque h2")?.textContent.trim() ||
    document.querySelector("h1")?.textContent.replace(/のトイレ案内.*/, "").trim() ||
    slug;

  const recordStationInteraction = (eventType, eventValue = "") => {
    postJson("/api/station-interaction", {
      stationPath,
      stationName,
      eventType,
      eventValue
    });
  };

  let entrySource = "";
  try {
    entrySource = sessionStorage.getItem("haraitaStationEntrySource") || "";
    sessionStorage.removeItem("haraitaStationEntrySource");
  } catch (_) {}

  if (!entrySource) {
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (!referrer) entrySource = "direct";
      else if (referrer.origin !== window.location.origin) entrySource = "external";
      else if (referrer.pathname.endsWith("/lines.html")) entrySource = "line_list";
      else entrySource = "internal";
    } catch (_) {
      entrySource = "unknown";
    }
  }
  recordStationInteraction("entry_source", entrySource);

  document.addEventListener("change", (event) => {
    const select = event.target.closest('select[id$="-sort"]');
    if (!select) return;
    recordStationInteraction("sort_change", select.value || "unknown");
  });

  document.addEventListener("click", (event) => {
    const reportLink = event.target.closest("#station-report .report-link");
    if (reportLink) {
      recordStationInteraction("report_click", "google_form");
      return;
    }

    const candidateLink = event.target.closest('.best-pick, a[href^="#"][href*="toilet"]');
    if (!candidateLink) return;

    const href = candidateLink.getAttribute("href") || "";
    const candidateId = href.startsWith("#") ? href.slice(1) : "best_pick";
    recordStationInteraction("candidate_click", candidateId.slice(0, 120));
  });

  const report = document.getElementById("station-report");
  if (report && !document.getElementById("location-unclear-feedback")) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "location-unclear-feedback";
    button.textContent = "場所が分からない";
    button.style.marginTop = "10px";
    button.style.border = "1px solid #617b5e";
    button.style.background = "transparent";
    button.style.color = "#173c31";
    button.style.padding = "8px 12px";
    button.style.fontWeight = "800";
    button.style.cursor = "pointer";

    button.addEventListener("click", () => {
      if (button.dataset.sent === "true") return;
      button.dataset.sent = "true";
      button.disabled = true;
      button.textContent = "送信しました";
      recordStationInteraction("feedback_location_unclear", "location_unclear");
    });

    const copy = report.querySelector(":scope > div") || report;
    copy.appendChild(button);
  }

  let activeStartedAt = document.visibilityState === "visible" ? performance.now() : null;
  let activeMs = 0;
  let engagementSent = false;

  const stopActiveTimer = () => {
    if (activeStartedAt === null) return;
    activeMs += performance.now() - activeStartedAt;
    activeStartedAt = null;
  };

  const startActiveTimer = () => {
    if (activeStartedAt !== null) return;
    activeStartedAt = performance.now();
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") startActiveTimer();
    else stopActiveTimer();
  });

  const sendEngagement = () => {
    if (engagementSent) return;
    engagementSent = true;
    stopActiveTimer();

    const activeSeconds = Math.max(0, Math.round(activeMs / 1000));
    postJson("/api/station-engagement", {
      stationPath,
      stationName,
      activeSeconds
    });
  };

  window.addEventListener("pagehide", sendEngagement, { once: true });

  const demandStyleStations = new Set([
    "tsuchiura",
    "higashitotsuka",
    "musashiurawa",
    "kamakura",
    "mikawashima",
    "kitayono",
    "shinkawasaki",
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
})();
