const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{

    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    avatar: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: ""
    },

    theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light"
    },

    passwordResetToken: {
        type: String,
    },

    passwordResetExpires: {
        type: Date,
    },

    favorites: {
        type: [String],
        default: []
    }
},
{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("User", userSchema);


