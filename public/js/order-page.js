// js/order-page.js
// Customer ordering page logic for index.html

const TAX_RATE = 0.07;
let cart = [];
let currentCategory = "mains";

const imageMap = {
  "Classic Smash Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "Bacon BBQ Burger": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
  "Crispy Chicken Sandwich": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
  "Buffalo Chicken Wrap": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  "Loaded Street Tacos": "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80",
  "Philly Cheesesteak": "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
  "Pulled Pork Sandwich": "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80",
  "Loaded Nachos": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80",
  "Chicken Quesadilla": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80",
  "Foodtruck Combo Basket": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
  "Seasoned Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
  "Onion Rings": "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80",
  "Mozzarella Sticks": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
  "Mac Bites": "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=80",
  "Bottled Water": "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80",
  "Coca-Cola": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80",
  "Sprite": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80"
};

const fallbackImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

function initOrderPage(defaultCategory = "mains") {
  currentCategory = defaultCategory;
  loadCartFromStorage();
  openCategory(defaultCategory);
  updateCartDisplay();
}

function openCategory(category, clickedButton = null) {
  currentCategory = category;

  const categoryTitle = document.getElementById("categoryTitle");
  const categoryItems = document.getElementById("categoryItems");

  if (!categoryTitle || !categoryItems) return;

  const titles = {
    mains: "Main Items",
    drinks: "Drinks",
    sides: "Sides"
  };

  categoryTitle.textContent = titles[category] || "Menu";

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.remove("active");
  });

  if (clickedButton) {
    clickedButton.classList.add("active");
  } else {
    const matchingButton = Array.from(document.querySelectorAll(".tab-btn")).find(button =>
      button.textContent.trim().toLowerCase().includes((titles[category] || category).toLowerCase().split(" ")[0])
    );

    if (matchingButton) matchingButton.classList.add("active");
  }

  const items = menuData[category] || [];

  if (items.length === 0) {
    categoryItems.innerHTML = `<p class="cart-empty">No items found in this category.</p>`;
    return;
  }

  categoryItems.innerHTML = items.map(item => buildMenuCard(item)).join("");
}

function buildMenuCard(item) {
  const imageUrl = imageMap[item.name] || item.image || fallbackImage;
  const soldOut = item.available === false;
  const optionHtml = buildOptionHtml(item);

  return `
    <article class="menu-card ${soldOut ? "sold-out-card" : ""}">
      <div class="menu-image-wrap">
        <img
          class="menu-image"
          src="${imageUrl}"
          alt="${item.name}"
          onerror="this.src='${fallbackImage}'"
        />
        ${soldOut ? `<span class="sold-out-badge">Sold Out</span>` : ""}
      </div>

      <div class="menu-card-body">
        <div class="menu-card-header">
          <h3>${item.name}</h3>
          <strong>$${Number(item.price).toFixed(2)}</strong>
        </div>

        <p class="menu-description">${item.description || "Fresh made food truck favorite."}</p>

        ${optionHtml}

        <button
          class="add-btn ${soldOut ? "sold-out" : ""}"
          ${soldOut ? "disabled" : ""}
          onclick="addToCart('${item.id}')"
        >
          ${soldOut ? "Sold Out" : "Add to Order"}
        </button>
      </div>
    </article>
  `;
}

function buildOptionHtml(item) {
  if (!item.options || item.options.length === 0) return "";

  return `
    <div class="item-options">
      <p class="option-title">Options</p>
      ${item.options.map(option => `
        <label class="option-row">
          <span>${option}</span>
          <select id="option-${item.id}-${safeId(option)}">
            <option value="regular">Regular</option>
            <option value="extra">Extra</option>
            <option value="none">None</option>
          </select>
        </label>
      `).join("")}
    </div>
  `;
}

function addToCart(itemId) {
  const item = findMenuItemById(itemId);

  if (!item) {
    alert("Item not found.");
    return;
  }

  if (item.available === false) {
    alert("Sorry, this item is sold out.");
    return;
  }

  const selectedOptions = getSelectedOptions(item);

  const cartItem = {
    cartId: `${item.id}-${Date.now()}`,
    id: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: 1,
    options: selectedOptions
  };

  cart.push(cartItem);
  saveCartToStorage();
  updateCartDisplay();
}

function getSelectedOptions(item) {
  if (!item.options || item.options.length === 0) return [];

  return item.options.map(option => {
    const select = document.getElementById(`option-${item.id}-${safeId(option)}`);
    return {
      name: option,
      choice: select ? select.value : "regular"
    };
  });
}

function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTax = document.getElementById("cartTax");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartSubtotal || !cartTax || !cartTotal) return;

  if (cart.length === 0) {
    cartItems.className = "cart-empty";
    cartItems.innerHTML = "No items added yet.";
  } else {
    cartItems.className = "cart-items";
    cartItems.innerHTML = cart.map(item => buildCartItem(item)).join("");
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  cartSubtotal.textContent = formatMoney(subtotal);
  cartTax.textContent = formatMoney(tax);
  cartTotal.textContent = formatMoney(total);
}

function buildCartItem(item) {
  const optionText = item.options && item.options.length > 0
    ? item.options.map(option => `${option.name}: ${capitalize(option.choice)}`).join(", ")
    : "";

  return `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        ${optionText ? `<p class="cart-options">${optionText}</p>` : ""}
        <p>${formatMoney(item.price)} x ${item.quantity}</p>
      </div>

      <div class="cart-item-actions">
        <button onclick="decreaseQuantity('${item.cartId}')">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity('${item.cartId}')">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.cartId}')">Remove</button>
      </div>
    </div>
  `;
}

function increaseQuantity(cartId) {
  const item = cart.find(cartItem => cartItem.cartId === cartId);
  if (!item) return;

  item.quantity += 1;
  saveCartToStorage();
  updateCartDisplay();
}

function decreaseQuantity(cartId) {
  const item = cart.find(cartItem => cartItem.cartId === cartId);
  if (!item) return;

  item.quantity -= 1;

  if (item.quantity <= 0) {
    removeFromCart(cartId);
    return;
  }

  saveCartToStorage();
  updateCartDisplay();
}

function removeFromCart(cartId) {
  cart = cart.filter(item => item.cartId !== cartId);
  saveCartToStorage();
  updateCartDisplay();
}

function clearCart() {
  cart = [];
  saveCartToStorage();
  updateCartDisplay();
}

function goToCheckout() {
  if (cart.length === 0) {
    alert("Please add at least one item before checkout.");
    return;
  }

  saveCartToStorage();
  window.location.href = "checkout.html";
}

function saveCartToStorage() {
  localStorage.setItem("orderflowCart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem("orderflowCart");

  if (!savedCart) {
    cart = [];
    return;
  }

  try {
    cart = JSON.parse(savedCart) || [];
  } catch (error) {
    cart = [];
  }
}

function findMenuItemById(itemId) {
  const allItems = [
    ...(menuData.mains || []),
    ...(menuData.drinks || []),
    ...(menuData.sides || [])
  ];

  return allItems.find(item => item.id === itemId);
}

function formatMoney(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

function safeId(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
