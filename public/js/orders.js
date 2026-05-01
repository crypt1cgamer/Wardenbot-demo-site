const ordersContainer = document.getElementById("ordersContainer");

function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}

function renderOrders() {
  const orders = getOrders().sort((a, b) => b.id - a.id);

  if (orders.length === 0) {
    ordersContainer.innerHTML = `<p class="muted-text">No orders yet.</p>`;
    return;
  }

  ordersContainer.innerHTML = orders.map(order => `
    <div class="order-card">

      <div class="order-header">
        <strong>Order #${order.id}</strong>
        <span class="status ${order.status}">${order.status}</span>
      </div>

      <div class="order-body">
        ${order.items.map(item => {
            const options = item.options || item.selectedOptions || item.modifiers || [];

            let optionsText = "";

            if (Array.isArray(options) && options.length > 0) {
            optionsText = `<small class="muted-text">Options: ${options.join(", ")}</small>`;
            } else if (typeof options === "string" && options.trim() !== "") {
            optionsText = `<small class="muted-text">Options: ${options}</small>`;
            }

            return `
            <div class="order-item">
                <strong>${item.name}</strong>
                ${optionsText}
            </div>
            `;
        }).join("")}
        </div>

      <div class="order-footer">
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Payment:</strong> ${order.payment}</p>
      </div>

    </div>
  `).join("");
}

function logout() {
  localStorage.removeItem("loggedInStaff");
  window.location.href = "staff.html";
}

renderOrders();