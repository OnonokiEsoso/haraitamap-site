/* 路線図の表示と切り替え。スコア・駅順は station-route-data.js、
 * リンク先は既存の stations-data.js の HARAITA_STATIONS を参照します。
 */
(() => {
  "use strict";
  const mount = document.querySelector("#station-route-nav");
  const data = window.HARAITA_ROUTE_DATA;
  if (!mount || !data || !data.lines || !data.scores) return;

  const normalizeName = (name) => String(name || "").trim().replace(/駅$/, "");
  const currentName = normalizeName(document.querySelector(".station-plaque h2")?.textContent);
  if (!currentName) return;

  const candidates = Object.entries(data.lines).filter(([, names]) =>
    Array.isArray(names) && names.some((name) => normalizeName(name) === currentName)
  );
  if (!candidates.length) {
    mount.hidden = true;
    return;
  }

  const scores = data.scores;
  const allStations = Array.isArray(window.HARAITA_STATIONS) ? window.HARAITA_STATIONS : [];
  const linkMap = new Map();
  allStations.forEach((station) => {
    if (!station || !station.name || !station.link) return;
    // 既存の駅データに登録されている相対パスだけを許可。駅名からURLを推測しない。
    const link = String(station.link).replace(/^\.\//, "");
    if (!/^stations\/[a-z0-9-]+\.html$/i.test(link)) return;
    linkMap.set(normalizeName(station.name), "../" + link);
  });

  const selectWrap = mount.querySelector(".srn-line-select-wrap");
  const dropdown = mount.querySelector(".srn-dropdown");
  const trigger = mount.querySelector("#srn-line-button");
  const selectedLabel = mount.querySelector(".srn-line-current");
  const menu = mount.querySelector("#srn-line-menu");
  const track = mount.querySelector("#srn-track");
  if (!selectWrap || !dropdown || !trigger || !selectedLabel || !menu || !track) return;

  selectWrap.hidden = candidates.length === 1;
  let selectedLine = candidates[0][0];
  let pointerOnTrigger = false;

  const syncSelection = () => {
    selectedLabel.textContent = selectedLine;
    menu.querySelectorAll(".srn-line-option").forEach((option) => {
      option.setAttribute("aria-checked", String(option.dataset.line === selectedLine));
    });
  };

  const closeMenu = (restoreFocus = false) => {
    if (menu.hidden) return;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  };

  const openMenu = (focusOption = false) => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    if (focusOption) {
      const currentOption = Array.from(menu.querySelectorAll(".srn-line-option"))
        .find((option) => option.dataset.line === selectedLine);
      currentOption?.focus();
    }
  };

  const render = () => {
    const lineName = selectedLine;
    const stations = data.lines[lineName];
    if (!Array.isArray(stations)) return;
    const currentIndex = stations.findIndex((name) => normalizeName(name) === currentName);
    if (currentIndex === -1) return;

    track.replaceChildren();
    const start = Math.max(0, currentIndex - 2);
    const end = Math.min(stations.length, currentIndex + 3);
    const visibleStations = stations.slice(start, end);

    // 表示範囲の外にも駅が続く場合は、線路を左右に伸ばす。
    const hasPrev = start > 0;
    const hasNext = end < stations.length;
    track.classList.toggle("has-prev", hasPrev);
    track.classList.toggle("has-next", hasNext);

    visibleStations.forEach((stationName) => {
      const name = normalizeName(stationName);
      const isCurrent = name === currentName;
      const rating = Number(scores[name]);
      const validRating = Number.isInteger(rating) && rating >= 1 && rating <= 5;
      const href = isCurrent ? window.location.href : linkMap.get(name);

      const item = document.createElement("div");
      item.className = "srn-station";
      if (isCurrent) item.classList.add("is-current");
      if (!href) item.classList.add("is-unlinked");

      const bubble = document.createElement(href ? "a" : "div");
      bubble.className = "srn-bubble";
      if (href) {
        bubble.href = href;
        bubble.setAttribute("aria-label", `${stationName}、${validRating ? `おすすめ度 星${rating}つ` : "未評価"}、駅ページを開く`);
      } else {
        bubble.setAttribute("aria-label", `${stationName}、駅ページのリンク先が確認できません`);
        bubble.title = "駅ページのリンク先を確認できません";
      }

      const stars = document.createElement("span");
      stars.className = validRating ? "srn-stars" : "srn-unrated";
      stars.textContent = validRating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "未評価";

      const label = document.createElement("span");
      label.className = "srn-name";
      label.textContent = stationName;
      bubble.append(stars, label);

      const dot = document.createElement("span");
      dot.className = "srn-dot";
      dot.setAttribute("aria-hidden", "true");

      const tag = document.createElement("span");
      tag.className = "srn-tag";
      tag.textContent = isCurrent ? "現在の駅" : (!href ? "ページ未確認" : "");
      item.append(bubble, dot, tag);
      track.append(item);
    });

    // 駅が5件ある場合も、切替直後は「現在の駅」が見える位置にする。
    const scroll = track.closest(".srn-scroll");
    const currentItem = track.querySelector(".srn-station.is-current");
    if (scroll && currentItem) {
      scroll.scrollLeft = Math.max(0,
        currentItem.offsetLeft + currentItem.offsetWidth / 2 - scroll.clientWidth / 2
      );
    }
  };

  // native <select> ではなく、各候補をボタンにした独自メニュー。
  candidates.forEach(([lineName]) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "srn-line-option";
    option.dataset.line = lineName;
    option.textContent = lineName;
    option.setAttribute("role", "menuitemradio");
    option.setAttribute("aria-checked", "false");
    option.addEventListener("click", (event) => {
      selectedLine = lineName;
      syncSelection();
      render();
      // キーボードで選択した場合だけトリガーへ戻す。
      const keyboard = event.detail === 0;
      closeMenu(keyboard);
      if (!keyboard) option.blur();
    });
    menu.appendChild(option);
  });

  trigger.addEventListener("pointerdown", () => {
    pointerOnTrigger = true;
  });
  trigger.addEventListener("keydown", (event) => {
    pointerOnTrigger = false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(true);
    } else if (event.key === "Escape") {
      closeMenu();
    }
  });
  trigger.addEventListener("click", () => {
    if (menu.hidden) openMenu();
    else closeMenu();
    if (pointerOnTrigger) trigger.blur();
    pointerOnTrigger = false;
  });

  menu.addEventListener("keydown", (event) => {
    const options = Array.from(menu.querySelectorAll(".srn-line-option"));
    const index = options.indexOf(document.activeElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % options.length;
    if (event.key === "ArrowUp") next = (index + options.length - 1) % options.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    if (next >= 0) {
      event.preventDefault();
      options[next].focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === "Tab") {
      closeMenu();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!dropdown.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) closeMenu(true);
  });

  syncSelection();
  render();
})();
