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
})();
