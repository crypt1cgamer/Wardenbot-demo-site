function getToken() {
    return localStorage.getItem("orderflow_token");
  }
  
  function requireLogin() {
    const token = getToken();
  
    if (!token) {
      window.location.href = "/login.html";
      return;
    }
  
    fetch("/api/auth/check", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem("orderflow_token");
          window.location.href = "/login.html";
        }
      })
      .catch(() => {
        localStorage.removeItem("orderflow_token");
        window.location.href = "/login.html";
      });
  }
  
  function logout() {
    localStorage.removeItem("orderflow_token");
    localStorage.removeItem("orderflow_user");
    window.location.href = "/login.html";
  }