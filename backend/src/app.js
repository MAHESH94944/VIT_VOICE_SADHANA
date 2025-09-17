const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

// trust proxy so secure cookies work behind Render/Vercel
app.set("trust proxy", 1);

// Build allowed origins from env + local dev
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // e.g. https://vit-voice-sadhana.vercel.app
  "https://vit-voice-sadhana.vercel.app",
].filter(Boolean);

// CORS options that allow credentials and handle preflight
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(
      new Error("CORS policy does not allow this origin."),
      false
    );
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// enable CORS (preflight handled by cors middleware)
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "VIT VOICE Sadhana API is working!" });
});

// --- Safe mount helper to avoid path-to-regexp crashes when a bad mount path is provided ---
function isValidMountPath(p) {
  // must be a string, start with '/', not be a full URL and not contain spaces or braces
  return (
    typeof p === "string" &&
    p.startsWith("/") &&
    !p.includes("://") &&
    !p.includes(" ") &&
    !p.includes("{") &&
    !p.includes("}")
  );
}

function safeMount(basePath, modulePath) {
  try {
    if (!isValidMountPath(basePath)) {
      console.error(`Skipping invalid mount path: "${basePath}"`);
      return;
    }
    // require the router lazily so any errors in the router file can be caught
    let router;
    try {
      router = require(modulePath);
    } catch (requireErr) {
      console.error(
        `Failed to load router module "${modulePath}":`,
        requireErr && requireErr.stack ? requireErr.stack : requireErr
      );
      return;
    }
    app.use(basePath, router);
    console.log(`Mounted router at ${basePath} -> ${modulePath}`);
  } catch (err) {
    // Log full error (do not rethrow so process doesn't crash on bad pattern)
    console.error(
      `Failed to mount router at ${basePath}:`,
      err && err.stack ? err.stack : err
    );
  }
}

// Use safeMount with module paths (relative to this file)
safeMount("/api/auth", "./routes/auth");
safeMount("/api/counsilli", "./routes/counsilli");
safeMount("/api/counsellor", "./routes/counsellor");

// JSON error handler so frontend never receives HTML error pages
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  // CORS errors come here too
  if (err && err.message && err.message.indexOf("CORS") !== -1) {
    return res.status(403).json({ message: err.message });
  }
  const status = (err && err.status) || 500;
  return res.status(status).json({
    message: err && err.message ? err.message : "Internal Server Error",
  });
});

module.exports = app;
