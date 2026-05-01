const trackResult = document.getElementById("trackResult");
const trackOrderId = document.getElementById("trackOrderId");

function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}

function trackOrder() {
  const orderId = trackOrderId.value.trim();

  if (!orderId) {
    trackResult.innerHTML = `<p class="error-text">Please enter your order number.</p>`;
    return;
  }

  const orders = getOrders();
  const order = orders.find(o => String(o.id) === orderId);

  if (!order) {
    trackResult.innerHTML = `<p class="error-text">Order not found.</p>`;
    return;
  }

  renderTrackedOrder(order);
}

function renderTrackedOrder(order) {
  const itemsHtml = order.items.map(item => `
    <li>${item.qty}x ${item.name}</li>
  `).join("");

  trackResult.innerHTML = `
    <div class="tracked-order">
      <h3>Order #${order.id}</h3>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Status:</strong> <span class="status-pill">${formatStatus(order.status)}</span></p>
      <p><strong>Payment:</strong> ${formatPayment(order.payment)}</p>

      <ul class="confirmation-items">
        ${itemsHtml}
      </ul>

      <p class="track-message">${getStatusMessage(order.status)}</p>
    </div>
  `;
}

function formatStatus(status) {
  if (status === "pending") return "Pending";
  if (status === "preparing") return "Preparing";
  if (status === "ready") return "Ready";
  if (status === "completed") return "Completed";
  return status;
}

function getStatusMessage(status) {
  if (status === "pending") return "Your order was received and is waiting to be started.";
  if (status === "preparing") return "Your order is being prepared now.";
  if (status === "ready") return "Your order is ready for pickup.";
  if (status === "completed") return "Your order has been completed. Thank you!";
  return "Order status unavailable.";
}

function formatPayment(payment) {
  if (payment === "pay-at-pickup") return "Pay at Pickup";
  if (payment === "paypal") return "PayPal Demo";
  return payment;
}

// Auto-fill from URL: track.html?id=123
const params = new URLSearchParams(window.location.search);
const orderIdFromUrl = params.get("id");

if (orderIdFromUrl) {
  trackOrderId.value = orderIdFromUrl;
  trackOrder();
}

// Quiet auto-refresh every 3 seconds
setInterval(() => {
  if (trackOrderId.value.trim()) {
    trackOrder();
  }
}, 3000);