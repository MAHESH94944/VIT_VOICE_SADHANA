const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const counsilliRoutes = require("./routes/counsilli");
const counsellorRoutes = require("./routes/counsellor");
const app = express();

const allowedOrigins = [
  "http://localhost:5173", // Local development
  process.env.FRONTEND_URL, // Production frontend
].filter(Boolean); // Filter out undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
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
