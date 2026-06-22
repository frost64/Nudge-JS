const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    content: {
        type: String,
        required: true
    },

    tags: {
        type: [String],
        default: []
    },

    pinned: {
        type: Boolean,
        default: false
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
    lastViewed: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("Note", noteSchema);