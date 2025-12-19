async function updateService(id) {
  const status = document.getElementById(`status-${id}`).value;
  const reason = document.getElementById(`reason-${id}`).value;
  const time = document.getElementById(`time-${id}`).value;
  const contact = document.getElementById(`contact-${id}`).value;

  await fetch(`/api/service/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      reason,
      expectedTime: time,
      contact
    })
  });

  alert("Updated!");
}