const Reminder = require("../models/Reminder");
const { createEvent } = require("ics");

const exportReminder = async (req, res) => {
    try {

        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!reminder) {
            return res.status(404).json({
                message: "Reminder not found"
            });
        }

        const dueDate = new Date(reminder.dueDate);
        const [hours, minutes] =
            reminder.reminderTime
                .split(":")
                .map(Number);


        const event = {
            title: reminder.title,
            description: reminder.description || "",
            start: [
                dueDate.getFullYear(),
                dueDate.getMonth() + 1,
                dueDate.getDate(),
                hours,
                minutes
            ],

            startOutputType: "local",
            duration: {
                hours: 1
            }
        };

        createEvent(event, (error, value) => {

            if (error) {
                return res.status(500).json(error);
            }

            res.setHeader(
                "Content-Type",
                "text/calendar"
            );

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${reminder.title}.ics"`
            );

            res.send(value);
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    exportReminder
};