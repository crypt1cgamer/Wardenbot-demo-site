function getStaffUsers() {
    return JSON.parse(localStorage.getItem("staffUsers")) || [];
  }
  
  function seedDemoManager() {
    let users = getStaffUsers();
  
    const hasAdmin = users.some(user => user.username === "admin");
  
    if (!hasAdmin) {
      users.push({
        username: "admin",
        password: "admin123",
        role: "manager",
        name: "Demo Manager"
      });
  
      localStorage.setItem("staffUsers", JSON.stringify(users));
    }
  }
  
  function staffLogin(event) {
    event.preventDefault();
  
    seedDemoManager();
  
    const username = document.getElementById("staffUsername").value.trim();
    const password = document.getElementById("staffPassword").value.trim();
  
    const users = getStaffUsers();
  
    const foundUser = users.find(user =>
      user.username === username &&
      user.password === password
    );
  
    if (!foundUser) {
      alert("Invalid username or password.");
      return;
    }
  
    localStorage.setItem("loggedInStaff", JSON.stringify({
      username: foundUser.username,
      role: foundUser.role,
      name: foundUser.name
    }));
  
    if (foundUser.role === "manager") {
      window.location.href = "manager.html";
    } else {
      window.location.href = "staff-order.html";
    }
  }
  
  seedDemoManager();
  