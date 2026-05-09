require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();

// Railway provides PORT, local falls back to 8080
const PORT = process.env.PORT || 8080;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// AUTH MIDDLEWARE
// ==========================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = user;
    next();
  });
}

// ==========================
// PAGE ROUTES
// ==========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// These pages still check login in the browser using auth.js.
// The API routes are protected on the server.
app.get("/staff.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "staff.html"));
});

app.get("/manager.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "manager.html"));
});

app.get("/kds.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "kds.html"));
});

// ==========================
// HEALTH CHECK
// ==========================
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      ok: true,
      server: "running",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({
      ok: false,
      server: "running",
      database: "error",
      error: err.message,
    });
  }
});

// ==========================
// AUTH ROUTES
// ==========================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await pool.query(
      `
      SELECT 
        id,
        business_id,
        name,
        email,
        role,
        password_hash,
        active
      FROM employees
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    if (!user.active) {
      return res.status(403).json({ error: "This account is inactive." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        business_id: user.business_id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        business_id: user.business_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

app.get("/api/auth/check", authenticateToken, (req, res) => {
  res.json({
    ok: true,
    user: req.user,
  });
});

// ==========================
// PUBLIC CUSTOMER ROUTES
// ==========================

// Load business by slug, example: /api/business/cali
app.get("/api/business/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM businesses
      WHERE slug = $1
        AND active = true
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Business not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to load business:", err);
    res.status(500).json({ error: "Failed to load business." });
  }
});

// Load public menu
app.get("/api/menu/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        mi.id,
        mi.business_id,
        mi.category_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.available,
        mi.sort_order,
        mc.name AS category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc
        ON mi.category_id = mc.id
      WHERE mi.business_id = $1
        AND mi.active = true
      ORDER BY mc.sort_order ASC, mi.sort_order ASC, mi.name ASC
      `,
      [businessId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load menu:", err);
    res.status(500).json({ error: "Failed to load menu." });
  }
});

// Customer places order
app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      business_id,
      customer_name,
      customer_phone,
      payment_method,
      payment_status,
      subtotal,
      tax,
      total,
      items,
    } = req.body;

    if (!business_id || !customer_name || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing required order information." });
    }

    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      INSERT INTO orders (
        business_id,
        customer_name,
        customer_phone,
        payment_method,
        payment_status,
        status,
        subtotal,
        tax,
        total
      )
      VALUES ($1, $2, $3, $4, $5, 'new', $6, $7, $8)
      RETURNING *
      `,
      [
        business_id,
        customer_name,
        customer_phone || null,
        payment_method || "pay-at-pickup",
        payment_status || "unpaid",
        subtotal || 0,
        tax || 0,
        total || 0,
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          menu_item_id,
          item_name,
          quantity,
          price,
          modifiers,
          line_total
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          order.id,
          item.menu_item_id || item.id || null,
          item.item_name || item.name,
          item.quantity || 1,
          item.price || 0,
          JSON.stringify(item.modifiers || {}),
          item.line_total || item.price || 0,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to create order:", err);
    res.status(500).json({ error: "Failed to create order." });
  } finally {
    client.release();
  }
});

// Customer order tracking
app.get("/api/track/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        id,
        customer_name,
        payment_method,
        payment_status,
        status,
        total,
        created_at,
        updated_at
      FROM orders
      WHERE id = $1
      LIMIT 1
      `,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to track order:", err);
    res.status(500).json({ error: "Failed to track order." });
  }
});

// ==========================
// PROTECTED STAFF ROUTES
// ==========================

// Load orders for logged-in staff/manager
app.get("/api/staff/orders", authenticateToken, async (req, res) => {
  try {
    const businessId = req.user.business_id;

    const result = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE business_id = $1
        AND status != 'completed'
      ORDER BY created_at ASC
      `,
      [businessId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load staff orders:", err);
    res.status(500).json({ error: "Failed to load orders." });
  }
});

// Load full order with items
app.get("/api/staff/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const businessId = req.user.business_id;

    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
        AND business_id = $2
      LIMIT 1
      `,
      [orderId, businessId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    const itemsResult = await pool.query(
      `
      SELECT *
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at ASC
      `,
      [orderId]
    );

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error("Failed to load order:", err);
    res.status(500).json({ error: "Failed to load order." });
  }
});

// Update order status
app.patch("/api/staff/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const businessId = req.user.business_id;

    const allowedStatuses = ["new", "preparing", "ready", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status." });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND business_id = $3
      RETURNING *
      `,
      [status, orderId, businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

// ==========================
// PROTECTED MANAGER ROUTES
// ==========================

function requireManager(req, res, next) {
  if (req.user.role !== "manager" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Manager access required." });
  }

  next();
}

// Manager loads menu
app.get("/api/manager/menu", authenticateToken, requireManager, async (req, res) => {
  try {
    const businessId = req.user.business_id;

    const result = await pool.query(
      `
      SELECT 
        mi.*,
        mc.name AS category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc
        ON mi.category_id = mc.id
      WHERE mi.business_id = $1
      ORDER BY mc.sort_order ASC, mi.sort_order ASC, mi.name ASC
      `,
      [businessId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load manager menu:", err);
    res.status(500).json({ error: "Failed to load menu." });
  }
});

// Manager marks item sold out / available
app.patch(
  "/api/manager/menu-items/:itemId/availability",
  authenticateToken,
  requireManager,
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const { available } = req.body;
      const businessId = req.user.business_id;

      const result = await pool.query(
        `
        UPDATE menu_items
        SET available = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND business_id = $3
        RETURNING *
        `,
        [available, itemId, businessId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found." });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Failed to update availability:", err);
      res.status(500).json({ error: "Failed to update availability." });
    }
  }
);

// Manager creates employee
app.post("/api/manager/employees", authenticateToken, requireManager, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const businessId = req.user.business_id;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }

    const allowedRoles = ["staff", "manager"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO employees (
        business_id,
        name,
        email,
        password_hash,
        role,
        active
      )
      VALUES ($1, $2, LOWER($3), $4, $5, true)
      RETURNING id, business_id, name, email, role, active, created_at
      `,
      [businessId, name, email, passwordHash, role]
    );

    res.json({
      success: true,
      employee: result.rows[0],
    });
  } catch (err) {
    console.error("Failed to create employee:", err);

    if (err.code === "23505") {
      return res.status(409).json({ error: "An employee with that email already exists." });
    }

    res.status(500).json({ error: "Failed to create employee." });
  }
});

// ==========================
// FALLBACK
// ==========================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OrderFlow running on port ${PORT}`);
});