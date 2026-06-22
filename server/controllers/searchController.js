const Reminder = require("../models/Reminder");
const Birthday = require("../models/Birthday");
const Note = require("../models/Note");
const Link = require("../models/Link");

const globalSearch = async (req, res) => {
    try {

        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                message: "Search query required"
            });
        }

        const userId = req.user.id;

        const reminders = await Reminder.find({
            user: userId,
            title: {
                $regex: q,
                $options: "i"
            }
        });

        const birthdays = await Birthday.find({
            user: userId,
            name: {
                $regex: q,
                $options: "i"
            }
        });

        const notes = await Note.find({
            user: userId,
            $or: [
                {
                    title: {
                        $regex: q,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: q,
                        $options: "i"
                    }
                }
            ]
        });

        const links = await Link.find({
            user: userId,
            title: {
                $regex: q,
                $options: "i"
            }
        });

        res.status(200).json({
            reminders,
            birthdays,
            notes,
            links
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};



const getSuggestions = async (req, res) => {  
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json([]);
        }
        const userId = req.user.id;
        const reminders =
            await Reminder.find({
                user: userId,
                title: {
                    $regex: q,
                    $options: "i"
                }
            })
            .limit(3);

        const notes =
            await Note.find({
                user: userId,
                title: {
                    $regex: q,
                    $options: "i"
                }
            })
            .limit(3);

        const birthdays =
            await Birthday.find({
                user: userId,
                name: {
                    $regex: q,
                    $options: "i"
                }
            })
            .limit(3);

        const links =
            await Link.find({
                user: userId,
                title: {
                    $regex: q,
                    $options: "i"
                }
            })
            .limit(3);

        const suggestions = [

            ...reminders.map(item => ({
                type: "reminder",
                id: item._id,
                label: item.title
            })),

            ...notes.map(item => ({
                type: "note",
                id: item._id,
                label: item.title
            })),

            ...birthdays.map(item => ({
                type: "birthday",
                id: item._id,
                label: item.name
            })),

            ...links.map(item => ({
                type: "link",
                id: item._id,
                label: item.title
            }))

        ];

        res.json(
            suggestions.slice(0, 8)
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
  

};


module.exports = {
    globalSearch,
    getSuggestions
};