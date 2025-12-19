const facility = document.getElementById("facility");
const servicesDiv = document.getElementById("services");

/* ---------------- LOAD FACILITIES ---------------- */
async function loadFacilities() {
  const res = await fetch("/api/facilities");
  const data = await res.json();

  facility.innerHTML = data.map(f =>
    `<option value="${f._id}">${f.name} (${f.type})</option>`
  ).join("");

  loadServices();
}

/* ---------------- FORMAT TIME ---------------- */
function formatTime(ms) {
  if (ms <= 0) return "Any moment";

  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  return `${min}m ${sec}s`;
}

/* ---------------- LOAD SERVICES ---------------- */
async function loadServices() {
  if (!facility.value) return;

  const res = await fetch(`/api/services/${facility.value}`);
  const data = await res.json();

  const now = Date.now();

  servicesDiv.innerHTML = data.map(s => {
    let counterHTML = "";

    if (s.status !== "Available" && s.expectedTime && s.updatedAt) {
      const endTime =
        new Date(s.updatedAt).getTime() +
        parseInt(s.expectedTime) * 60000;

      const remaining = endTime - now;

      counterHTML = `
        <p>
          <b>Back In:</b>
          <span class="counter" data-end="${endTime}">
            ${formatTime(remaining)}
          </span>
        </p>
      `;
    }

    return `
      <div class="service-card ${s.status.toLowerCase()}">
        <h3>${s.name}</h3>
        <p><b>Status:</b> ${s.status}</p>
        ${s.reason ? `<p><b>Reason:</b> ${s.reason}</p>` : ""}
        ${counterHTML}
        ${s.contact ? `<p><b>Contact:</b> ${s.contact}</p>` : ""}
      </div>
    `;
  }).join("");
}

/* ---------------- LIVE COUNTER ---------------- */
setInterval(() => {
  document.querySelectorAll(".counter").forEach(el => {
    const end = parseInt(el.dataset.end);
    const remaining = end - Date.now();
    el.innerText = formatTime(remaining);
  });
}, 1000);

/* ---------------- EVENTS ---------------- */
facility.addEventListener("change", loadServices);

/* ---------------- INIT ---------------- */
loadFacilities();

/* 🔁 Auto refresh backend data */
setInterval(loadServices, 5000);