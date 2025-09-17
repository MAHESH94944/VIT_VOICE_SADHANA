const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const counsilliRoutes = require("./routes/counsilli");
const counsellorRoutes = require("./routes/counsellor");
const app = express();

// trust proxy so secure cookies work behind Render/Vercel
app.set("trust proxy", 1);

// Build allowed origins from env + local dev
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
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

// enable CORS and preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "VIT VOICE Sadhana API is working!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/counsilli", counsilliRoutes);
app.use("/api/counsellor", counsellorRoutes);

// JSON error handler so frontend never receives HTML error pages
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  // CORS errors come here too
  if (err && err.message && err.message.indexOf("CORS") !== -1) {
    return res.status(403).json({ message: err.message });
  }
  const status = (err && err.status) || 500;
  return res
    .status(status)
    .json({
      message: err && err.message ? err.message : "Internal Server Error",
    });
});

module.exports = app;
