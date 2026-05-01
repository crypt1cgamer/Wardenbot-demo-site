const kdsOrders = document.getElementById("kdsOrders");

let lastOrdersSnapshot = "";

function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

function refreshOrders() {
  const orders = getOrders();
  const activeOrders = orders.filter(order => order.status !== "completed");

  const currentSnapshot = JSON.stringify(activeOrders);

  if (currentSnapshot === lastOrdersSnapshot) {
    return;
  }

  lastOrdersSnapshot = currentSnapshot;
  renderOrders(activeOrders);
}

function renderOrders(activeOrders) {
  if (activeOrders.length === 0) {
    kdsOrders.innerHTML = `<p class="cart-empty">No active orders.</p>`;
    return;
  }

  const columns = {
    pending: [],
    preparing: [],
    ready: []
  };

  activeOrders.forEach(order => {
    if (columns[order.status]) {
      columns[order.status].push(order);
    } else {
      columns.pending.push(order);
    }
  });

  kdsOrders.innerHTML = `
    <div class="kds-column pending-column">
      <div class="kds-column-header">
        <h3>OPEN</h3>
        <span>${columns.pending.length}</span>
      </div>
      <div id="kdsPending"></div>
    </div>

    <div class="kds-column preparing-column">
      <div class="kds-column-header">
        <h3>PREPARING</h3>
        <span>${columns.preparing.length}</span>
      </div>
      <div id="kdsPreparing"></div>
    </div>

    <div class="kds-column ready-column">
      <div class="kds-column-header">
        <h3>READY</h3>
        <span>${columns.ready.length}</span>
      </div>
      <div id="kdsReady"></div>
    </div>
  `;

  renderColumn("kdsPending", columns.pending, "pending");
  renderColumn("kdsPreparing", columns.preparing, "preparing");
  renderColumn("kdsReady", columns.ready, "ready");
}

function renderColumn(containerId, orders, status) {
  const container = document.getElementById(containerId);

  if (!orders.length) {
    container.innerHTML = `<p class="kds-empty-column">No orders</p>`;
    return;
  }

  orders
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .forEach(order => {
      const card = document.createElement("div");

      const paymentClass =
        order.payment === "pay-at-pickup" ? "needs-payment" : "paid-online";

      card.className = `kds-card ${status} ${paymentClass}`;

      const itemsHtml = order.items.map(item => {
        const modText =
          item.modifier && Object.keys(item.modifier).length
            ? Object.entries(item.modifier)
                .map(([key, value]) => `<small>${key}: ${value}</small>`)
                .join("")
            : "";

        const drinkText = item.drink
          ? `<small>Drink: ${item.drink}</small>`
          : "";

        const notesText = item.notes
          ? `<small>Notes: ${item.notes}</small>`
          : "";

        return `
          <li>
            <div>
              <strong>${item.qty}x</strong> ${item.name}
            </div>
            <div class="kds-item-options">
              ${modText}
              ${drinkText}
              ${notesText}
            </div>
          </li>
        `;
      }).join("");

      card.innerHTML = `
        <div class="kds-ticket-top">
          <div>
            <h3>#${order.id}</h3>
            <p>${order.name || "Customer"}</p>
          </div>
          <span>${order.time || ""}</span>
        </div>

        <div class="payment-banner ${paymentClass}">
          ${order.payment === "pay-at-pickup" ? "PAYMENT DUE" : "PAID"}
        </div>

        <div class="kds-info">
          <p><strong>Phone:</strong> ${order.phone || ""}</p>
          <p><strong>Payment:</strong> ${formatPayment(order.payment)}</p>
        </div>

        <ul class="kds-items">
          ${itemsHtml}
        </ul>

        ${order.notes ? `<p class="kds-notes"><strong>Order Notes:</strong> ${order.notes}</p>` : ""}

        <div class="kds-actions">
          ${status !== "pending" ? `<button onclick="updateStatus('${order.id}', 'pending')">Open</button>` : ""}
          ${status !== "preparing" ? `<button onclick="updateStatus('${order.id}', 'preparing')">Preparing</button>` : ""}
          ${status !== "ready" ? `<button onclick="updateStatus('${order.id}', 'ready')">Ready</button>` : ""}
          <button onclick="updateStatus('${order.id}', 'completed')">Complete</button>
        </div>
      `;

      container.appendChild(card);
    });
}

function updateStatus(orderId, newStatus) {
  const orders = getOrders();

  const updatedOrders = orders.map(order => {
    if (String(order.id) === String(orderId)) {
      return {
        ...order,
        status: newStatus
      };
    }

    return order;
  });

  saveOrders(updatedOrders);

  lastOrdersSnapshot = "";
  refreshOrders();
}

function formatPayment(payment) {
  if (payment === "pay-at-pickup") return "Pay at Pickup";
  if (payment === "paypal") return "PayPal Demo";
  return payment || "Unknown";
}

refreshOrders();

setInterval(refreshOrders, 3000);