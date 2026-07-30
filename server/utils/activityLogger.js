const Activity = require("../models/Activity");

const activityConfig = {
  user_registered: {
    icon: "FaUserPlus",
    color: "#22c55e",
  },

  user_deleted: {
    icon: "FaUserMinus",
    color: "#ef4444",
  },

  note_created: {
    icon: "FaStickyNote",
    color: "#38bdf8",
  },

  note_updated: {
    icon: "FaStickyNote",
    color: "#f59e0b",
  },

  note_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  reminder_created: {
    icon: "FaBell",
    color: "#22c55e",
  },

  reminder_updated: {
    icon: "FaBell",
    color: "#f59e0b",
  },

  reminder_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  birthday_created: {
    icon: "FaBirthdayCake",
    color: "#ec4899",
  },

  birthday_updated: {
    icon: "FaBirthdayCake",
    color: "#f59e0b",
  },

  birthday_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  link_created: {
    icon: "FaLink",
    color: "#0ea5e9",
  },

  link_updated: {
    icon: "FaLink",
    color: "#f59e0b",
  },

  link_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  suggestion_submitted: {
    icon: "FaLightbulb",
    color: "#fbbf24",
  },
};

const logActivity = async ({
  type,
  message,
  user = null,
  performedBy = "",
}) => {
  try {
    const config = activityConfig[type] || {
      icon: "FaCircle",
      color: "#38bdf8",
    };

    await Activity.create({
      type,
      message,
      icon: config.icon,
      color: config.color,
      user,
      performedBy,
    });
  } catch (error) {
    console.error("Activity Log Error:", error.message);
  }
};

module.exports = logActivity;