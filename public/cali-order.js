// cali-order.js

let cart = [];

const TAX_RATE = 0.07;

function addItem(name, price) {

  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name,
      price,
      qty: 1
    });
  }

  renderCart();
}

function removeItem(index) {

  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1);
  }

  renderCart();
}

function renderCart() {

  const cartItems = document.getElementById("cartItems");

  cartItems.innerHTML = "";

  let subtotal = 0;

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="empty-cart">
        Your cart is empty.
      </div>
    `;

  }

  cart.forEach((item, index) => {

    const lineTotal = item.price * item.qty;

    subtotal += lineTotal;

    const itemDiv = document.createElement("div");

    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>
          Qty: ${item.qty}
        </p>
      </div>

      <div class="cart-item-right">
        <span>$${lineTotal.toFixed(2)}</span>

        <button onclick="removeItem(${index})">
          Remove
        </button>
      </div>
    `;

    cartItems.appendChild(itemDiv);

  });

  const tax = subtotal * TAX_RATE;

  const total = subtotal + tax;

  document.getElementById("subtotal").textContent =
    subtotal.toFixed(2);

  document.getElementById("tax").textContent =
    tax.toFixed(2);

  document.getElementById("total").textContent =
    total.toFixed(2);

}

function placeOrder() {

  const customerName =
    document.getElementById("customerName").value.trim();

  const paymentMethod =
    document.getElementById("paymentMethod").value;

  if (!customerName) {

    alert("Please enter a pickup name.");

    return;
  }

  if (cart.length === 0) {

    alert("Please add items to your order.");

    return;
  }

  const subtotal =
    parseFloat(document.getElementById("subtotal").textContent);

  const tax =
    parseFloat(document.getElementById("tax").textContent);

  const total =
    parseFloat(document.getElementById("total").textContent);

  const order = {

    id: Date.now(),

    customerName,

    paymentMethod,

    items: cart,

    subtotal,

    tax,

    total,

    status: "new",

    createdAt: new Date().toLocaleString()

  };

  const existingOrders =
    JSON.parse(localStorage.getItem("orders")) || [];

  existingOrders.push(order);

  localStorage.setItem(
    "orders",
    JSON.stringify(existingOrders)
  );

  alert(
    `Order placed successfully!\n\nOrder #${order.id}`
  );

  cart = [];

  document.getElementById("customerName").value = "";

  renderCart();

}

renderCart();
