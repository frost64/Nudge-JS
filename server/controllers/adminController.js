const User = require("../models/User");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");
const Birthday = require("../models/Birthday");
const Link = require("../models/Link");
const Suggestion = require("../models/Suggestion");
const logActivity = require("../utils/activityLogger");
const Activity = require("../models/Activity");
const SystemLog = require("../models/SystemLog");

const getStats = async (req, res) => {
    try {
      
        const users =
            await User.countDocuments();

        const notes =
            await Note.countDocuments();

        const reminders =
            await Reminder.countDocuments();

        const birthdays =
            await Birthday.countDocuments();

        const links =
            await Link.countDocuments();

        res.json({
            users,
            notes,
            reminders,
            birthdays,
            links
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getSystemLogs = async (req, res) => {
  try {
    const logs = await SystemLog.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const clearSystemLogs = async (req, res) => {
  try {
    const { level } = req.query;

    let result;

    if (level && level !== "all") {
      result = await SystemLog.deleteMany({
        level,
      });
    } else {
      result = await SystemLog.deleteMany({});
    }

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message:
        level && level !== "all"
          ? `${level} logs cleared successfully`
          : "All logs cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
    try {

        const users = await User.find({
            role: "user"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


const deleteUser = async (req, res) => {
    try {

        const user = await User.findById(
            req.params.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        // Delete all data belonging to the user
        await Note.deleteMany({ user: user._id });
        await Reminder.deleteMany({ user: user._id });
        await Birthday.deleteMany({ user: user._id });
        await Link.deleteMany({ user: user._id });
        await Suggestion.deleteMany({ user: user._id });
        await Activity.deleteMany({ user: user._id });

        // Finally delete the user
        await logActivity({
            type: "user_deleted",
            message: `Admin deleted ${user.username}`,
            user: user._id,
        });
        await user.deleteOne();

        res.json({
            success: true,
            message: "User deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const getSystemStatus = async (req, res) => {
  try {
    const services = [
      {
        name: "Database",
        status:
          mongoose.connection.readyState === 1
            ? "Operational"
            : "Offline",
      },
      {
        name: "API Server",
        status: "Operational",
      },
      {
        name: "Authentication",
        status: process.env.JWT_SECRET
          ? "Operational"
          : "Offline",
      },
      {
        name: "Notes",
        status: fs.existsSync(
          path.join(__dirname, "../models/Note.js")
        )
          ? "Operational"
          : "Offline",
      },
      {
        name: "Links",
        status: fs.existsSync(
          path.join(__dirname, "../models/Link.js")
        )
          ? "Operational"
          : "Offline",
      },
      {
        name: "Reminders",
        status: fs.existsSync(
          path.join(__dirname, "../models/Reminder.js")
        )
          ? "Operational"
          : "Offline",
      },
      {
        name: "Birthdays",
        status: fs.existsSync(
          path.join(__dirname, "../models/Birthday.js")
        )
          ? "Operational"
          : "Offline",
      },
    ];

    res.json(services);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load system status.",
    });
  }
};

const getRecentSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUserGrowth = async (req, res) => {
  try {
    const users = await User.find().select("createdAt");

    const today = new Date();

    const months = [];
    const monthMap = {};

    for (let i = 11; i >= 0; i--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      months.push({
        month: d.toLocaleString("default", {
          month: "short",
        }),
        year: d.getFullYear(),
        users: 0,
      });

      monthMap[key] = months.length - 1;
    }

    users.forEach((user) => {
      const d = new Date(user.createdAt);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (monthMap[key] !== undefined) {
        months[monthMap[key]].users++;
      }
    });

    let total = 0;

    const growth = months.map((m) => {
      total += m.users;

      return {
        month: m.month,
        users: total,
      };
    });

    res.json(growth);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(activities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 });

    const formatted = activities.map((activity) => {
    const created = new Date(activity.createdAt);
    const now = new Date();

    const diffMinutes = Math.floor(
      (now - created) / (1000 * 60)
    );

    let time;

    if (diffMinutes < 60) {
      time = `${diffMinutes}m ago`;
    } else {
      const formattedTime = created.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      const formattedDate = created.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      time = `${formattedTime} • ${formattedDate}`;
    }

      return {
        ...activity.toObject(),
        time,
        timestamp: activity.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
    getStats,
    getUsers,
    deleteUser,
    getSystemStatus,
    getRecentSuggestions,
    getUserGrowth,
    getRecentActivities,
    getActivities,
    getSystemLogs,
    clearSystemLogs,
};
