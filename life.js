"use strict";

document.querySelectorAll(".interactive-points").forEach((group) => {
  const checkboxes = [...group.querySelectorAll('input[type="checkbox"]')];
  const resetButton = group.querySelector(".check-reset");

  if (!resetButton) return;

  resetButton.addEventListener("click", () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    checkboxes[0]?.focus();
  });
});
