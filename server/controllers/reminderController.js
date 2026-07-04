const Reminder = require("../models/Reminder");

const toggleReminder =
  async (req, res) => {
    try {
      const reminder =
        await Reminder.findOne({
          _id: req.params.id,
          user: req.user.id
        });

      if (!reminder) {
        return res.status(404).json({
          message:
            "Reminder not found"
        });
      }

      reminder.completed =
        !reminder.completed;

      await reminder.save();

      res.status(200).json(
        reminder
      );

    } catch (error) {

      res.status(500).json({
        message:
          error.message
      });

    }

  };

const createReminder = async (req, res) => {
  try {

    const { title, description, dueDate, reminderTime, priority, category} = req.body;

    const reminder = await Reminder.create({
      title,
      description,
      dueDate,
      reminderTime,
      priority,
      category,
      user: req.user.id
    });

    res.status(201).json(reminder);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};



const getReminders = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const reminders = await Reminder.find({
      user: req.user.id
    })
      .sort({
        dueDate: 1
      })
      .skip(skip)
      .limit(limit);

    const total = await Reminder.countDocuments({
      user: req.user.id
    });

    res.status(200).json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: reminders
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


const updateReminder = async (req, res) => {
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

    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedReminder);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteReminder = async (req, res) => {
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

    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      message: "Reminder deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const completeReminder = async (req, res) => {
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

    reminder.completed = true;

    await reminder.save();

    res.status(200).json(reminder);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const getUpcomingReminders = async (req, res) => {
    try {

        const today = new Date();

        const nextMonth = new Date(today);

        nextMonth.setDate(today.getDate() + 30);

        const reminders = await Reminder.find({
            user: req.user.id,
            completed: false,
            dueDate: {
                $gte: today,
                $lte: nextMonth
            }
        })
        .sort({ dueDate: 1 });

        const upcoming = reminders.map(reminder => {

            const diffTime =
                reminder.dueDate.getTime() -
                today.getTime();

            const daysRemaining =
                Math.ceil(
                    diffTime / (1000 * 60 * 60 * 24)
                );

            return {
                ...reminder.toObject(),
                daysRemaining
            };
        });

        res.status(200).json(upcoming);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  completeReminder,
  getUpcomingReminders,
  toggleReminder
};