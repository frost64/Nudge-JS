const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    url: {
        type: String,
        required: true
    },

    category: {
        type: String,
        default: "General"
    },

    notes: {
        type: String,
        default: ""
    },

    favorite: {
        type: Boolean,
        default: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    clickCount: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("Link", linkSchema);