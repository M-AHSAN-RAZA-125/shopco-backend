
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""));

// CORS
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/$/, "");

      const isLocalDev =
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin || "");

      if (
        !origin ||
        isLocalDev ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Ensure public directories exist
const imagesDir = path.join(__dirname, "public", "images");
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Static Images & Uploads
app.use("/images", express.static(imagesDir));
app.use("/uploads", express.static(uploadsDir));

// Database connection cache
let dbConnection;

const connectDatabase = async () => {
  if (dbConnection && require("mongoose").connection.readyState === 1) {
    return dbConnection;
  }

  if (!dbConnection) {
    dbConnection = connectDB().catch((error) => {
      dbConnection = null;
      console.error("DB connection failed:", error.message);
      throw error;
    });
  }

  return dbConnection;
};

// IMPORTANT: Database middleware BEFORE API routes
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Root
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Shop.Co API is running",
    endpoints: [
      "/api/auth",
      "/api/products",
      "/api/categories",
      "/api/cart",
      "/api/wishlist",
      "/api/orders",
    ],
  });
});

// Health
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "OK",
    database: require("mongoose").connection.readyState === 1
      ? "Connected"
      : "Disconnected",
  });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/adminRoutes"));

// Upload Image Route
app.post("/api/upload", (req, res) => {
  try {
    const { image, name: originalName } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: "No image data provided" });
    }

    if (image.startsWith("data:image/")) {
      const matches = image.match(/^data:image\/([A-Za-z-+]+);base64,(.+)$/);
      const ext = (matches && matches[1] ? matches[1] : "png").replace(/[^a-zA-Z0-9]/g, "");
      const base64Data = matches && matches[2] ? matches[2] : image.replace(/^data:image\/[A-Za-z-+]+;base64,/, "");
      const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      return res.json({ success: true, url: `/uploads/${filename}` });
    }

    // If it's already a URL, return it
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/images/") || image.startsWith("/uploads/")) {
      return res.json({ success: true, url: image });
    }

    return res.status(400).json({ success: false, message: "Invalid image format" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error Handler
app.use(errorHandler);

// Local Development
const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Shop.Co backend running on port ${PORT}`);
  });
}

module.exports = app;
