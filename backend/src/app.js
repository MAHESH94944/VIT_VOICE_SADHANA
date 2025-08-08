const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const counsilliRoutes = require("./routes/counsilli");
const counsellorRoutes = require("./routes/counsellor");
const app = express();

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL || "https://vit-voice-sadhana-1.onrender.com",
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
