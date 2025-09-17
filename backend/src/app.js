const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const counsilliRoutes = require("./routes/counsilli");
const counsellorRoutes = require("./routes/counsellor");
const app = express();

// Only allow the Vercel frontend (or FRONTEND_URL from env) and local dev
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://vit-voice-sadhana.vercel.app",
  "http://localhost:5173", // added local dev origin
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "VIT VOICE Sadhana API is working!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/counsilli", counsilliRoutes);
app.use("/api/counsellor", counsellorRoutes);

module.exports = app;
