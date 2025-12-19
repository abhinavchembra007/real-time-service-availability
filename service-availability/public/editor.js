const facilityId = localStorage.getItem("facilityId");
const container = document.getElementById("services");

if (!facilityId) {
  alert("Login required");
  window.location.href = "login.html";
}

async function loadServices() {
  const res = await fetch(`/api/services/${facilityId}`);
  const services = await res.json();

  container.innerHTML = "";

  services.forEach(s => {
    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <h3>${s.name}</h3>

      <select id="status-${s._id}">
        <option ${s.status==="Available"?"selected":""}>Available</option>
        <option ${s.status==="Delayed"?"selected":""}>Delayed</option>
        <option ${s.status==="Unavailable"?"selected":""}>Unavailable</option>
      </select>

      <input id="reason-${s._id}" placeholder="Reason" value="${s.reason||""}">
      <input id="time-${s._id}" placeholder="Back At (e.g. 3 PM)" value="${s.expectedTime||""}">
      <input id="contact-${s._id}" placeholder="Contact" value="${s.contact||""}">

      <button onclick="updateService('${s._id}')">Update</button>
    `;

    container.appendChild(div);
  });
}

async function updateService(id) {
  await fetch(`/api/service/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: document.getElementById(`status-${id}`).value,
      reason: document.getElementById(`reason-${id}`).value,
      expectedTime: document.getElementById(`time-${id}`).value,
      contact: document.getElementById(`contact-${id}`).value
    })
  });

  alert("Updated");
}

loadServices();