const User = require("../models/User");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");
const Birthday = require("../models/Birthday");
const Link = require("../models/Link");

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

        // Finally delete the user
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

module.exports = {
    getStats,
    getUsers,
    deleteUser
};  
