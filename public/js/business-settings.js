const form = document.getElementById("businessSettingsForm");
const message = document.getElementById("settingsMessage");

function getDefaultBusinessSettings() {
  return {
    businessName: "CALI Street Tacos",
    paypalEmail: "",
    taxRate: 6.5,
    allowPayAtPickup: true,
    allowPayPal: false
  };
}

function loadBusinessSettings() {
  const saved = JSON.parse(localStorage.getItem("businessSettings"));
  const settings = saved || getDefaultBusinessSettings();

  document.getElementById("businessName").value = settings.businessName || "";
  document.getElementById("paypalEmail").value = settings.paypalEmail || "";
  document.getElementById("taxRate").value = settings.taxRate ?? 0;
  document.getElementById("allowPayAtPickup").checked = !!settings.allowPayAtPickup;
  document.getElementById("allowPayPal").checked = !!settings.allowPayPal;
}

function saveBusinessSettings(event) {
  event.preventDefault();

  const settings = {
    businessName: document.getElementById("businessName").value.trim(),
    paypalEmail: document.getElementById("paypalEmail").value.trim(),
    taxRate: Number(document.getElementById("taxRate").value),
    allowPayAtPickup: document.getElementById("allowPayAtPickup").checked,
    allowPayPal: document.getElementById("allowPayPal").checked
  };

  localStorage.setItem("businessSettings", JSON.stringify(settings));

  message.textContent = "Settings saved successfully.";
}

function logout() {
  localStorage.removeItem("loggedInStaff");
  window.location.href = "staff.html";
}

form.addEventListener("submit", saveBusinessSettings);
loadBusinessSettings();