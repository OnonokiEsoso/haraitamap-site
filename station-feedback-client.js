(() => {
  const stationTitle =
    document.querySelector(".station-title h2") ||
    document.querySelector("h1") ||
    document.querySelector("h2");

  const stationName = stationTitle?.textContent.trim();
  const stationPath = window.location.pathname.replace(/\/$/, "");

  if (!stationName || !stationPath.startsWith("/stations/")) {
    return;
  }

  const feedbackKey = `station-feedback:${stationPath}`;

  const feedback = document.createElement("div");
  feedback.className = "station-feedback";
  feedback.setAttribute("aria-label", "駅情報の評価");

  feedback.innerHTML = `
    <p class="station-feedback-label">
      この情報は役に立ちましたか？
    </p>

    <div class="station-feedback-actions">
      <button
        type="button"
        class="station-feedback-button"
        data-feedback="helpful"
      >
        役に立った
      </button>

      <button
        type="button"
        class="station-feedback-button"
        data-feedback="outdated"
      >
        情報が古い
      </button>
    </div>

    <p
      class="station-feedback-status"
      aria-live="polite"
    ></p>
  `;

  const insertTarget =
    document.querySelector("main .container") ||
    document.querySelector("main");

  if (!insertTarget) {
    return;
  }

  insertTarget.appendChild(feedback);

  const buttons = feedback.querySelectorAll(
    ".station-feedback-button"
  );

  const status = feedback.querySelector(
    ".station-feedback-status"
  );

  const disableButtons = () => {
    buttons.forEach((button) => {
      button.disabled = true;
    });
  };

  if (sessionStorage.getItem(feedbackKey)) {
    disableButtons();
    status.textContent = "評価済みです。";
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const feedbackType = button.dataset.feedback;

      disableButtons();
      status.textContent = "送信中です……";

      try {
        const response = await fetch("/api/station-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            stationPath,
            stationName,
            feedbackType
          })
        });

        if (!response.ok) {
          throw new Error(`評価APIエラー: ${response.status}`);
        }

        sessionStorage.setItem(feedbackKey, feedbackType);
        status.textContent = "ありがとうございます。";
      } catch (error) {
        console.warn("駅情報の評価に失敗しました。", error);

        buttons.forEach((feedbackButton) => {
          feedbackButton.disabled = false;
        });

        status.textContent =
          "送信できませんでした。時間を置いてお試しください。";
      }
    });
  });
})();