const loggedInStaff = JSON.parse(localStorage.getItem("loggedInStaff"));

if (!loggedInStaff) {
  window.location.href = "staff.html";
}