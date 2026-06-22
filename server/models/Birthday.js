const mongoose = require("mongoose");

const birthdaySchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    birthDate: {
        type: Date,
        required: true
    },

    relationship: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        default: ""
    },
    favorites: {
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

module.exports = mongoose.model(
    "Birthday",
    birthdaySchema
);