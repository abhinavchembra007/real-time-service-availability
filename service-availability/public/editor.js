const facilityId = localStorage.getItem("facilityId");
const container = document.getElementById("services");

if (!facilityId) {
  alert("Login required");
  location.href = "login.html";
}

/* ---------------- LOAD SERVICES ---------------- */
async function loadServices() {
  const res = await fetch(`/api/services/${facilityId}`);
  const services = await res.json();

  container.innerHTML = "";

  services.forEach(s => {
    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <h3>${s.name}</h3>

      <label>Status</label>
      <select id="status-${s._id}">
        <option ${s.status === "Available" ? "selected" : ""}>Available</option>
        <option ${s.status === "Delayed" ? "selected" : ""}>Delayed</option>
        <option ${s.status === "Down" ? "selected" : ""}>Down</option>
      </select>

      <label>Reason</label>
      <input id="reason-${s._id}" placeholder="Reason"
        value="${s.reason || ""}">

      <label>Back in Minutes</label>
      <input id="back-${s._id}" type="number"
        placeholder="e.g. 10"
        value="${s.backInMinutes ?? ""}">

      <label>Contact</label>
      <input id="contact-${s._id}" placeholder="Contact"
        value="${s.contact || ""}">

      <button onclick="updateService('${s._id}')">
        Update
      </button>
    `;

    container.appendChild(div);
  });
}

/* ---------------- UPDATE SERVICE ---------------- */
async function updateService(id) {
  const status = document.getElementById(`status-${id}`).value;
  const reason = document.getElementById(`reason-${id}`).value;
  const backInput = document.getElementById(`back-${id}`).value;
  const contact = document.getElementById(`contact-${id}`).value;

  const backInMinutes =
    backInput === "" ? null : Number(backInput);

  await fetch(`/api/service/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      reason,
      backInMinutes,
      contact
    })
  });

  alert("Service updated");
  loadServices(); // refresh editor
}

/* ---------------- INIT ---------------- */
loadServices();