// cali-menu.js

function renderCaliMenu() {
  const menuWrap = document.getElementById("menu");

  menuWrap.innerHTML = "";

  caliMenu.forEach(category => {
    const section = document.createElement("section");
    section.className = "menu-section";

    section.innerHTML = `
      <h2>${category.category}</h2>
      <div class="menu-grid">
        ${category.items.map(item => `
          <div class="menu-card">
            <img src="${item.image}" alt="${item.name}" class="menu-img">
            <div class="menu-card-body">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <span>$${item.price.toFixed(2)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    menuWrap.appendChild(section);
  });
}

renderCaliMenu();
