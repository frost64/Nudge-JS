const Reminder = require("../models/Reminder");
const Birthday = require("../models/Birthday");
const Note = require("../models/Note");
const Link = require("../models/Link");

const getDashboard = async (req, res) => {
    try {

        const userId = req.user.id;

        const totalReminders = await Reminder.countDocuments({
            user: userId
        });

        const totalBirthdays = await Birthday.countDocuments({
            user: userId
        });

        const totalNotes = await Note.countDocuments({
            user: userId
        });

        const totalLinks = await Link.countDocuments({
            user: userId
        });

        const recentNotes = await Note.find({
            user: userId
        })
        .sort({ createdAt: -1 })
        .limit(5);

        const favoriteLinks = await Link.find({
            user: userId,
            favorite: true
        })
        .limit(5);

        const pendingReminders = await Reminder.find({
            user: userId,
            completed: false
        })
        .sort({ dueDate: 1 })
        .limit(5);

        const overdueReminders = await Reminder.find({
            user: userId,
            completed: false,
            dueDate: { $lt: new Date() }
        })
        .sort({ dueDate: 1 })
        .limit(5);

        const upcomingBirthdays = await Birthday.find({
            user: userId
        })
        .sort({ birthDate: 1 })
        .limit(5);

        res.status(200).json({
            stats: {
                totalReminders,
                totalBirthdays,
                totalNotes,
                totalLinks
            },
            recentNotes,
            favoriteLinks,
            pendingReminders,
            overdueReminders,
            upcomingBirthdays
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {getDashboard};