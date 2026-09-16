"use strict";

(() => {
  const sortSelect = document.querySelector('.sort-controls select[id$="-sort"]');
  if (!sortSelect) return;

  const sortControls = sortSelect.closest(".sort-controls");
  const container = sortSelect.closest(".container");
  if (!container || !sortControls) return;

  const sortItems = [
    { value: "recommend", label: "おすすめ度順" },
    { value: "clean", label: "きれい度順" },
    { value: "big", label: "大期待値順" },
    { value: "small", label: "小期待度順" },
    { value: "newness", label: "新しさ順" }
  ];

  const cards = Array.from(container.querySelectorAll(":scope > .card"));
  const originalOrder = new Map(cards.map((card, index) => [card, index]));

  const sortLabel = sortControls.querySelector(`label[for="${sortSelect.id}"]`);
  if (sortLabel) {
    sortLabel.hidden = true;
  }
  sortSelect.hidden = true;

  const sortWrap = document.createElement("div");
  sortWrap.className = "sort-menu-wrap";
  const sortButton = document.createElement("button");
  sortButton.type = "button";
  sortButton.className = "btn small ghost sort-menu-button";
  sortButton.setAttribute("aria-haspopup", "true");
  sortButton.setAttribute("aria-expanded", "false");

  const sortMenu = document.createElement("div");
  sortMenu.className = "sort-menu-dropdown";
  sortMenu.setAttribute("role", "menu");
  sortMenu.hidden = true;

  sortItems.forEach((item) => {
    const itemButton = document.createElement("button");
    itemButton.type = "button";
    itemButton.textContent = item.label;
    itemButton.dataset.value = item.value;
    itemButton.setAttribute("role", "menuitemradio");
    itemButton.addEventListener("click", () => {
      sortSelect.value = item.value;
      syncSortMenu();
      animateSort(item.value);
      sortMenu.hidden = true;
      sortButton.setAttribute("aria-expanded", "false");
    });
    sortMenu.appendChild(itemButton);
  });

  sortWrap.append(sortButton, sortMenu);
  sortControls.insertBefore(sortWrap, sortControls.firstChild);

  const toStarCount = (text) => (text.match(/★/g) || []).length;
  const toNewnessScore = (text) => {
    if (text.includes("新しい") || text.includes("新")) return 3;
    if (text.includes("普通")) return 2;
    if (text.includes("旧")) return 1;
    return 0;
  };

  const getMetricValue = (card, label) => {
    const rows = Array.from(card.querySelectorAll(".kv div"));
    for (const row of rows) {
      const name = row.querySelector("dt")?.textContent?.replace(/\s+/g, "") || "";
      if (name === label) {
        return row.querySelector("dd")?.textContent?.trim() || "";
      }
    }
    return "";
  };

  const recommendScore = (card) => {
    const clean = toStarCount(getMetricValue(card, "トイレのきれい度"));
    const big = toStarCount(getMetricValue(card, "大期待値"));
    const small = toStarCount(getMetricValue(card, "小期待値"));
    const newness = toNewnessScore(getMetricValue(card, "トイレの新しさ"));
    let score = clean * 3 + big * 6 + small + newness * 3;
    if (clean === 1) score -= 8;
    if (big === 1) score -= 16;
    if (clean === 2) score -= 4;
    if (big === 2) score -= 9;
    if (big === 3) score -= 2;
    if (small === 1) score -= 3;
    if (small === 2) score -= 1;
    return score;
  };

  const scoreByMode = {
    recommend: recommendScore,
    clean: (card) => toStarCount(getMetricValue(card, "トイレのきれい度")),
    big: (card) => toStarCount(getMetricValue(card, "大期待値")),
    small: (card) => toStarCount(getMetricValue(card, "小期待値")),
    newness: (card) => toNewnessScore(getMetricValue(card, "トイレの新しさ"))
  };

  const sortCards = (mode) => {
    const getter = scoreByMode[mode] || recommendScore;
    const sorted = [...cards].sort((a, b) => {
      const difference = getter(b) - getter(a);
      return difference || originalOrder.get(a) - originalOrder.get(b);
    });
    const listEndAnchor = container.querySelector(
      ":scope > .station-report, :scope > .photo-credit"
    );
    sorted.forEach((card) => container.insertBefore(card, listEndAnchor));
  };

  let animationToken = 0;
  const animateSort = (mode) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sortCards(mode);
      return;
    }
    const token = ++animationToken;
    const visibleCards = cards.filter((card) => !card.hidden);
    visibleCards.forEach((card) => card.classList.add("is-sorting-out"));
    window.setTimeout(() => {
      if (token !== animationToken) return;
      sortCards(mode);
      visibleCards.forEach((card) => {
        card.classList.remove("is-sorting-out");
        card.classList.add("is-sorting-in");
      });
      window.setTimeout(() => {
        if (token !== animationToken) return;
        visibleCards.forEach((card) => card.classList.remove("is-sorting-in"));
      }, 130);
    }, 70);
  };

  function syncSortMenu() {
    sortMenu.querySelectorAll("button[data-value]").forEach((button) => {
      const isActive = button.dataset.value === sortSelect.value;
      button.setAttribute("aria-checked", String(isActive));
    });
    const activeItem = sortItems.find((item) => item.value === sortSelect.value);
    sortButton.textContent = `${activeItem?.label || "並び替え"} ▼`;
  }

  sortButton.addEventListener("click", () => {
    const willOpen = sortMenu.hidden;
    sortMenu.hidden = !willOpen;
    sortButton.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) syncSortMenu();
  });

  document.addEventListener("click", (event) => {
    if (!sortWrap.contains(event.target)) {
      sortMenu.hidden = true;
      sortButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      sortMenu.hidden = true;
      sortButton.setAttribute("aria-expanded", "false");
    }
  });

  sortSelect.addEventListener("change", () => {
    syncSortMenu();
    animateSort(sortSelect.value);
  });

  syncSortMenu();
  sortCards(sortSelect.value);
})();
