const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const birthdayRoutes = require("./routes/birthdayRoutes");
const noteRoutes = require("./routes/noteRoutes");
const linkRoutes = require("./routes/linkRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const searchRoutes = require("./routes/searchRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const userRoutes = require("./routes/userRoutes");
const limiter = require("./middleware/rateLimiter");
const adminRoutes = require("./routes/adminRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorMiddleware");
const weatherRoutes = require("./routes/weatherRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const path = require("path");

dotenv.config();
connectDB();
const app = express();


app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);
app.use(cors());
app.use(express.json());
app.use(limiter);

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/birthdays", birthdayRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/suggestions", suggestionRoutes);
/* Protected Test Route */
app.get(
    "/api/protected",
    authMiddleware,
    (req, res) => {
        res.json({
            success: true,
            message: "Protected Route Access Granted",
            user: req.user
        });
    }
);

/* Root Route */
app.get("/", (req, res) => {
    res.send("Nudge API Running");
});

/* 404 + Error Middleware (Always Last) */
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});