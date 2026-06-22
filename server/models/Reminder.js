const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    dueDate: {
        type: Date,
        required: true
    },

    reminderTime: {
        type: String,
        default: "09:00"
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },

    category: {
        type: String,
        default: "General"
    },

    completed: {
        type: Boolean,
        default: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("Reminder", reminderSchema);