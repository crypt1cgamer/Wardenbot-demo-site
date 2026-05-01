const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve all frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Optional: fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🔥 OrderFlow running at http://localhost:${PORT}`);
});
