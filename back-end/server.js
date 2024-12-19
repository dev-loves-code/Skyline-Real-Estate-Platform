const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
require("dotenv").config();

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservations");
const bookingRoutes = require("./routes/bookings");
const pool = require("./utils/database");

const app = express();
const PORT = process.env.PORT || 5000;

const sessionStore = new MySQLStore({}, pool);

app.use(
  session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET || "your_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
      httpOnly: true,
    },
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);

app.use("/", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/reservations", reservationRoutes);
app.use("/bookings", bookingRoutes);

(async () => {
  try {
    const [result] = await pool.query("SELECT 1");
    console.log("Database connection successful:", result);
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
