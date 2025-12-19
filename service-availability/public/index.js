const facilitySelect = document.getElementById("facility");
const servicesGrid = document.getElementById("services");
const searchInput = document.getElementById("search");

/* AI Review Elements */
const reviewCard = document.getElementById("reviewCard");
const ratingEl = document.getElementById("rating");
const badgeEl = document.getElementById("badge");
const summaryEl = document.getElementById("summary");
const availableEl = document.getElementById("available");
const delayedEl = document.getElementById("delayed");
const downEl = document.getElementById("down");
const facilityTitle = document.getElementById("facilityTitle");

let servicesCache = [];

/* ---------------- TIME HELPERS ---------------- */
function remaining(backInMinutes, updatedAt) {
  if (backInMinutes == null || !updatedAt) return "";

  const end =
    new Date(updatedAt).getTime() + backInMinutes * 60000;
  const diff = end - Date.now();

  if (diff <= 0) return "Now";

  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m}m ${s}s`;
}

/* ---------------- LOAD FACILITIES ---------------- */
async function loadFacilities() {
  const res = await fetch("/api/facilities");
  const facilities = await res.json();

  facilitySelect.innerHTML = "";
  facilities.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f._id;
    opt.textContent = `${f.name} (${f.type})`;
    facilitySelect.appendChild(opt);
  });

  loadServices();
  loadReview();
}

/* ---------------- LOAD SERVICES ---------------- */
async function loadServices() {
  const res = await fetch(`/api/services/${facilitySelect.value}`);
  servicesCache = await res.json();
  renderServices(servicesCache);
}

/* ---------------- RENDER SERVICES ---------------- */
function renderServices(services) {
  servicesGrid.innerHTML = services.map(s => `
    <div class="service-card">
      <h3>${s.name}</h3>
      <p>Status: <b>${s.status}</b></p>

      ${s.reason ? `<p>Reason: ${s.reason}</p>` : ""}

      ${
        s.backInMinutes != null
          ? `<p>⏳ Back In:
              <span class="timer"
                data-min="${s.backInMinutes}"
                data-updated="${s.updatedAt}">
              </span>
            </p>`
          : ""
      }

      ${s.contact ? `<p>Contact: ${s.contact}</p>` : ""}
    </div>
  `).join("");
}

/* ---------------- SEARCH ---------------- */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  renderServices(
    servicesCache.filter(s =>
      s.name.toLowerCase().includes(q)
    )
  );
});

/* ---------------- AI REVIEW ---------------- */
async function loadReview() {
  const res = await fetch(`/api/review/${facilitySelect.value}`);
  const data = await res.json();
  if (!data) return;

  reviewCard.style.display = "block";
  ratingEl.innerText = data.rating;
  badgeEl.innerText = data.badge;
  summaryEl.innerText = `"${data.summary}"`;

  availableEl.innerText = data.counts.available;
  delayedEl.innerText = data.counts.delayed;
  downEl.innerText = data.counts.down;

  facilityTitle.innerText =
    facilitySelect.options[facilitySelect.selectedIndex].text;
}

/* ---------------- EVENTS ---------------- */
facilitySelect.addEventListener("change", () => {
  loadServices();
  loadReview();
});

/* ---------------- REAL COUNTDOWN (EVERY SECOND) ---------------- */
setInterval(() => {
  document.querySelectorAll(".timer").forEach(el => {
    el.innerText = remaining(
      Number(el.dataset.min),
      el.dataset.updated
    );
  });
}, 1000);

/* ---------------- AUTO REFRESH (DATA) ---------------- */
setInterval(() => {
  loadServices();
  loadReview();
}, 5000);

/* ---------------- INIT ---------------- */
loadFacilities();