const express = require("express");
const path = require("path");

const app = express();

// Railway provides PORT, local falls back to 8080
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OrderFlow running on port ${PORT}`);
});