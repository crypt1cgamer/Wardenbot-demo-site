const TAX_RATE = 0.07;

const menuItems = document.getElementById("menuItems");
const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTax = document.getElementById("cartTax");
const cartTip = document.getElementById("cartTip");
const cartTotal = document.getElementById("cartTotal");

const paymentMethod = document.getElementById("paymentMethod");
const tipBox = document.getElementById("tipBox");
const tipDisplay = document.getElementById("tipDisplay");
const tipTotalRow = document.getElementById("tipTotalRow");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentTip = 0;

function getAllMenuItems() {
  return [
    ...(menuData.mains || []),
    ...(menuData.sides || []),
    ...(menuData.drinks || [])
  ];
}

function renderMenu() {
  const items = getAllMenuItems();
  menuItems.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";

    const modsHtml = (item.mods || []).map(mod => `
      <div class="modifier" data-mod="${mod}">
        <label>${mod}</label>
        <div class="touch-options">
          <button type="button" class="touch-option active" onclick="selectMod(this)">Regular</button>
          <button type="button" class="touch-option" onclick="selectMod(this)">Extra</button>
          <button type="button" class="touch-option" onclick="selectMod(this)">None</button>
        </div>
      </div>
    `).join("");

    const drinkHtml = item.type === "drink" || item.name.toLowerCase().includes("combo")
      ? `
        <label class="form-label">
          Drink Choice
          <select class="card-drink">
            ${drinkOptions.map(drink => `<option value="${drink}">${drink}</option>`).join("")}
          </select>
        </label>
      `
      : "";

    card.innerHTML = `
      <img class="menu-img" src="${imageMap[item.name] || "images/placeholder.jpg"}" alt="${item.name}" />

      <div class="menu-card-body">
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <strong>$${item.price.toFixed(2)}</strong>

        <div class="card-mods">
          ${modsHtml}
          ${drinkHtml}
        </div>
      </div>

      <div class="menu-card-action">
        <button class="add-btn" onclick="addToCartWithOptions('${item.name}', this)">Add</button>
      </div>
    `;

    menuItems.appendChild(card);
  });
}

function selectMod(button) {
  const group = button.closest(".touch-options");

  group.querySelectorAll(".touch-option").forEach(btn => {
    btn.classList.remove("active");
  });

  button.classList.add("active");
}

function addToCartWithOptions(itemName, button) {
  const item = getAllMenuItems().find(i => i.name === itemName);
  if (!item) return;

  const card = button.closest(".menu-card");

  const modifier = {};

  card.querySelectorAll(".modifier").forEach(modRow => {
    const modName = modRow.getAttribute("data-mod");
    const selected = modRow.querySelector(".touch-option.active");
    modifier[modName] = selected ? selected.textContent : "Regular";
  });

  const drinkSelect = card.querySelector(".card-drink");
  const drink = drinkSelect ? drinkSelect.value : "";

  const customKey = `${item.name}|${JSON.stringify(modifier)}|${drink}`;

  const existing = cart.find(i => i.customKey === customKey);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      customKey,
      name: item.name,
      price: item.price,
      qty: 1,
      modifier,
      drink
    });
  }

  saveCart();
  renderCart();
}

function removeFromCart(customKey) {
  cart = cart.filter(item => item.customKey !== customKey);
  saveCart();
  renderCart();
}

function changeQty(customKey, amount) {
  const item = cart.find(i => i.customKey === customKey);
  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    removeFromCart(customKey);
    return;
  }

  saveCart();
  renderCart();
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = "No items added yet.";
    cartItems.className = "cart-empty";
    currentTip = 0;
    updateTotals();
    return;
  }

  cartItems.className = "";
  cartItems.innerHTML = "";

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;

    const modDisplay = item.modifier
      ? Object.entries(item.modifier).map(([key, value]) => `
        <br><small>${key}: ${value}</small>
      `).join("")
      : "";

    const div = document.createElement("div");
    div.className = "cart-line";

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <br>
        <small>$${item.price.toFixed(2)} each</small>
        ${modDisplay}
        ${item.drink ? `<br><small>Drink: ${item.drink}</small>` : ""}
      </div>

      <div class="qty-controls">
        <button type="button" onclick="changeQty('${item.customKey}', -1)">-</button>
        <span>${item.qty}</span>
        <button type="button" onclick="changeQty('${item.customKey}', 1)">+</button>
      </div>

      <strong>$${itemTotal.toFixed(2)}</strong>
    `;

    cartItems.appendChild(div);
  });

  updateTotals();
}

function updateTotals() {
  const subtotal = getSubtotal();
  const tax = subtotal * TAX_RATE;
  const isPaypal = paymentMethod.value === "paypal";
  const tip = isPaypal ? currentTip : 0;
  const total = subtotal + tax + tip;

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartTax.textContent = `$${tax.toFixed(2)}`;
  cartTotal.textContent = `$${total.toFixed(2)}`;

  if (cartTip) {
    cartTip.textContent = `$${tip.toFixed(2)}`;
  }

  if (tipDisplay && isPaypal) {
    tipDisplay.textContent = `Tip: $${tip.toFixed(2)}`;
  }

  if (tipTotalRow) {
    tipTotalRow.style.display = isPaypal ? "flex" : "none";
  }
}

function setTipPercent(percent) {
  const subtotal = getSubtotal();

  if (subtotal <= 0) {
    currentTip = 0;
  } else {
    currentTip = subtotal * (percent / 100);
  }

  updateTotals();
}

function handlePaymentChange() {
  const isPaypal = paymentMethod.value === "paypal";

  tipBox.style.display = isPaypal ? "block" : "none";

  if (!isPaypal) {
    currentTip = 0;

    if (tipDisplay) {
      tipDisplay.textContent = "";
    }
  }

  updateTotals();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function clearCart() {
  cart = [];
  currentTip = 0;
  localStorage.removeItem("cart");
  renderCart();
}

function generateTicket() {
  const today = new Date().toISOString().split("T")[0];

  const storedDate = localStorage.getItem("ticketDate");
  let last = parseInt(localStorage.getItem("lastTicket") || "0", 10);

  if (storedDate !== today) {
    last = 0;
    localStorage.setItem("ticketDate", today);
  }

  const next = last + 1;
  localStorage.setItem("lastTicket", next);

  return next.toString().padStart(4, "0");
}

function submitOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Please add at least one item.");
    return;
  }

  const subtotal = getSubtotal();
  const tax = subtotal * TAX_RATE;
  const tip = paymentMethod.value === "paypal" ? currentTip : 0;
  const total = subtotal + tax + tip;

  const order = {
    id: generateTicket(),
    name: document.getElementById("pickupName").value,
    phone: document.getElementById("phoneNumber").value,
    payment: paymentMethod.value,
    notes: document.getElementById("orderNotes").value,
    items: cart,
    subtotal,
    tax,
    tip,
    total,
    status: "pending",
    time: new Date().toLocaleTimeString()
  };

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(order);

  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  localStorage.removeItem("cart");

  window.location.href = `confirmation.html?id=${order.id}`;
}

paymentMethod.addEventListener("change", handlePaymentChange);

renderMenu();
renderCart();
handlePaymentChange();