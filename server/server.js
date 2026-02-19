const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("dotenv").config();


const connectDB = require("./config/db");
const passport = require("./config/passport"); // ✅ load passport config

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize()); // ✅ initialize passport

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/auth", require("./routes/googleAuthRoutes"));

// Connect Database
connectDB();

// Other Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/predict", require("./routes/predictRoutes"));

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
