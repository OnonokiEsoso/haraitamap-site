(() => {
  if (window.__siteActionUsageInitialized) {
    return;
  }
  window.__siteActionUsageInitialized = true;

  const endpoint = "/api/action-usage";
  const allowedActions = new Set([
    "sort:recommended",
    "sort:cleanliness",
    "sort:congestion",
    "sort:newness",
    "emergency:clicked",
    "distraction:clicked",
    "distraction:page_view"
  ]);
  const sortActions = {
    recommend: "sort:recommended",
    clean: "sort:cleanliness",
    big: "sort:congestion",
    small: "sort:congestion",
    newness: "sort:newness"
  };

  const recordAction = (actionName) => {
    if (!allowedActions.has(actionName)) {
      return;
    }

    try {
      void fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action_name: actionName }),
        keepalive: true,
        cache: "no-store",
        credentials: "same-origin"
      }).catch(() => {});
    } catch {
      // 集計の失敗で、クリックや画面遷移などの既存機能を止めない。
    }
  };

  document.addEventListener("click", (event) => {
    const clickedElement = event.target instanceof Element
      ? event.target
      : null;

    if (!clickedElement) {
      return;
    }

    const explicitAction = clickedElement.closest("[data-action-name]");
    if (explicitAction) {
      recordAction(explicitAction.dataset.actionName || "");
      return;
    }

    const sortButton = clickedElement.closest(
      ".sort-menu-dropdown button[data-value]"
    );
    if (sortButton) {
      recordAction(sortActions[sortButton.dataset.value] || "");
    }
  });

  document.addEventListener("change", (event) => {
    const sortSelect = event.target instanceof HTMLSelectElement
      ? event.target.closest('.sort-controls select[id$="-sort"]')
      : null;

    if (sortSelect) {
      recordAction(sortActions[sortSelect.value] || "");
    }
  });

  if (document.body.classList.contains("games-page")) {
    recordAction("distraction:page_view");
  }
})();
