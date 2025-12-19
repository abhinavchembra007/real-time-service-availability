/* ===============================
   EXTRA FEATURES (NON-BREAKING)
   =============================== */

/* Format countdown */
function formatTime(ms) {
  if (ms <= 0) return "Any moment";
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  return `${min}m ${sec % 60}s`;
}

/* Enhance service cards AFTER your code renders them */
function enhanceServiceCards() {
  document.querySelectorAll(".service-card").forEach(card => {
    const endTime = card.dataset.end;
    if (!endTime) return;

    const counter = card.querySelector(".counter");
    if (!counter) return;

    const remaining = endTime - Date.now();
    counter.innerText = formatTime(remaining);
  });
}

/* Live counter tick */
setInterval(enhanceServiceCards, 1000);