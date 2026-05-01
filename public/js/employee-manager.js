const employeeForm = document.getElementById("employeeForm");
const employeeList = document.getElementById("employeeList");
const employeeMessage = document.getElementById("employeeMessage");

function getStaffUsers() {
  return JSON.parse(localStorage.getItem("staffUsers")) || [];
}

function saveStaffUsers(users) {
  localStorage.setItem("staffUsers", JSON.stringify(users));
}

function renderEmployees() {
  const users = getStaffUsers();

  if (users.length === 0) {
    employeeList.innerHTML = `<p class="muted-text">No employees added yet.</p>`;
    return;
  }

  employeeList.innerHTML = users.map((user, index) => `
    <div class="employee-row">
      <div>
        <strong>${user.name || user.username}</strong>
        <p class="muted-text">Username: ${user.username} | Role: ${user.role}</p>
      </div>

      <button class="small-btn danger" onclick="deleteEmployee(${index})">
        Delete
      </button>
    </div>
  `).join("");
}

function addEmployee(event) {
  event.preventDefault();

  const name = document.getElementById("employeeName").value.trim();
  const username = document.getElementById("employeeUsername").value.trim();
  const password = document.getElementById("employeePassword").value.trim();
  const role = document.getElementById("employeeRole").value;

  let users = getStaffUsers();

  const usernameExists = users.some(user => user.username === username);

  if (usernameExists) {
    employeeMessage.textContent = "That username already exists.";
    return;
  }

  users.push({
    name,
    username,
    password,
    role
  });

  saveStaffUsers(users);

  employeeForm.reset();
  employeeMessage.textContent = "Employee added successfully.";

  renderEmployees();
}

function deleteEmployee(index) {
  let users = getStaffUsers();

  const confirmDelete = confirm(`Delete ${users[index].username}?`);

  if (!confirmDelete) return;

  users.splice(index, 1);
  saveStaffUsers(users);
  renderEmployees();
}

function logout() {
  localStorage.removeItem("loggedInStaff");
  window.location.href = "staff.html";
}

employeeForm.addEventListener("submit", addEmployee);
renderEmployees();