(() => {
  "use strict";

  // 駅ページ以外では計測しない。
  const stationPath = location.pathname
    .replace(/\.html$/i, "")
    .replace(/\/$/, "");
  if (!/^\/stations\/[a-z0-9-]+$/i.test(stationPath)) return;

  const API_URL = "/api/station-analytics";
  const SESSION_KEY = "haraita-analytics-session-v1";
  const SESSION_LAST_KEY = "haraita-analytics-last-v1";
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  const UPDATE_INTERVAL_MS = 15000;

  const makeId = () => {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    // UUIDが利用できない古いブラウザでは計測しない（弱いIDを作らない）。
    return null;
  };

  const visitId = makeId();
  if (!visitId) return;

  let sessionId = null;
  const now = Date.now();
  try {
    const previousId = sessionStorage.getItem(SESSION_KEY);
    const previousTime = Number(sessionStorage.getItem(SESSION_LAST_KEY));
    sessionId = previousId && previousTime > 0 && now - previousTime < SESSION_TIMEOUT_MS
      ? previousId
      : makeId();
    if (!sessionId) return;
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(SESSION_LAST_KEY, String(now));
  } catch (_) {
    // ストレージを利用できない場合でもページ閲覧の計測は継続する。
    sessionId = makeId();
  }

  const stationName = (
    document.querySelector(".station-title h2")?.textContent ||
    document.querySelector(".station-plaque h2")?.textContent ||
    stationPath.split("/").pop()
  ).trim().slice(0, 50);

  let maxScrollPercent = 0;
  let activeMs = 0;
  let activeStartedAt = document.visibilityState === "visible" ? performance.now() : null;
  let nextPageType = "unknown";
  let finalized = false;

  function updateScroll() {
    const doc = document.documentElement;
    const body = document.body;
    const pageHeight = Math.max(doc.scrollHeight, body?.scrollHeight || 0);
    const viewportHeight = window.innerHeight;
    const scrollableHeight = Math.max(0, pageHeight - viewportHeight);
    const position = Math.max(0, window.scrollY || doc.scrollTop || 0);
    const percent = scrollableHeight === 0
      ? 100
      : Math.min(100, Math.max(0, Math.round(position * 100 / scrollableHeight)));
    maxScrollPercent = Math.max(maxScrollPercent, percent);
  }

  function pauseTimer() {
    if (activeStartedAt === null) return;
    activeMs += Math.max(0, performance.now() - activeStartedAt);
    activeStartedAt = null;
  }

  function resumeTimer() {
    if (activeStartedAt === null && !finalized) activeStartedAt = performance.now();
  }

  function getSeconds() {
    const running = activeStartedAt === null ? 0 : performance.now() - activeStartedAt;
    return Math.min(1800, Math.max(0, Math.round((activeMs + running) / 1000)));
  }

  function payload(eventType) {
    updateScroll();
    return {
      eventType,
      visitId,
      sessionId,
      stationPath,
      stationName,
      maxScrollPercent,
      activeSeconds: getSeconds(),
      nextPageType
    };
  }

  function post(eventType, useBeacon = false) {
    const json = JSON.stringify(payload(eventType));
    if (useBeacon && navigator.sendBeacon) {
      try {
        if (navigator.sendBeacon(API_URL, new Blob([json], { type: "application/json" }))) return;
      } catch (_) { /* fetchにフォールバック */ }
    }
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
      credentials: "same-origin"
    }).catch(() => { /* 計測失敗がページ操作を妨げないようにする */ });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link || !link.href) return;
    try {
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin && url.pathname !== location.pathname) {
        nextPageType = "internal";
      } else if (url.origin !== location.origin) {
        nextPageType = "external";
      }
    } catch (_) { /* リンクの解析失敗は無視 */ }
  }, { capture: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pauseTimer();
      post("update", true);
    } else {
      resumeTimer();
    }
  });

  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll, { passive: true });

  // ページの初回表示を1回として記録する。
  updateScroll();
  post("start");

  const intervalId = window.setInterval(() => {
    if (finalized || document.visibilityState !== "visible") return;
    try { sessionStorage.setItem(SESSION_LAST_KEY, String(Date.now())); } catch (_) {}
    post("update");
  }, UPDATE_INTERVAL_MS);

  window.addEventListener("pagehide", () => {
    if (finalized) return;
    pauseTimer();
    finalized = true;
    clearInterval(intervalId);
    post("end", true);
  }, { once: true });
})();
