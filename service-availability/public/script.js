const facilitySelect = document.getElementById("facility");
const servicesGrid = document.getElementById("services");

/* AI Review Elements */
const reviewCard = document.getElementById("reviewCard");
const ratingEl = document.getElementById("rating");
const badgeEl = document.getElementById("badge");
const summaryEl = document.getElementById("summary");
const availableEl = document.getElementById("available");
const delayedEl = document.getElementById("delayed");
const downEl = document.getElementById("down");
const facilityTitle = document.getElementById("facilityTitle");

/* ---------------- HELPERS ---------------- */
function getRemainingTime(time) {
  if (!time) return "";
  const diff = new Date(time) - new Date();
  if (diff <= 0) return "Now";

  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}m ${secs}s`;
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
  const services = await res.json();

  servicesGrid.innerHTML = services.map(s => `
    <div class="service-card">
      <h3>${s.name}</h3>
      <p>Status: <b>${s.status}</b></p>
      ${s.reason ? `<p>Reason: ${s.reason}</p>` : ""}
      ${s.expectedTime ? `<p>Back In: ${getRemainingTime(s.expectedTime)}</p>` : ""}
      ${s.contact ? `<p>Contact: ${s.contact}</p>` : ""}
    </div>
  `).join("");
}

/* ---------------- LOAD AI REVIEW ---------------- */
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

/* ---------------- AUTO REFRESH ---------------- */
setInterval(() => {
  loadServices();
  loadReview();
}, 5000);

/* ---------------- INIT ---------------- */
loadFacilities();