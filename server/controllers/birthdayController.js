const Birthday = require("../models/Birthday");
const User = require("../models/User");
const logActivity = require("../utils/activityLogger");

const createBirthday = async (req, res) => {
  try {

    const {
      name,
      birthDay,
      birthMonth,
      birthYear,
      relationship,
      notes
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Name is required."
      });
    }

    if (!birthDay) {
      return res.status(400).json({
        message: "Birth day is required."
      });
    }

    if (!birthMonth) {
      return res.status(400).json({
        message: "Birth Month is required."
      });
    }

    if (!relationship?.trim()) {
      return res.status(400).json({
        message: "Relationship is required."
      });
    }

    if (!notes?.trim()) {
      return res.status(400).json({
        message: "Birthday Note is required."
      });
    }

    const birthday = await Birthday.create({
      name: name.trim(),
      birthDay,
      birthMonth,
      birthYear,
      relationship: relationship.trim(),
      notes: notes?.trim(),
      user: req.user.id
    });
    const user = await User.findById(req.user.id);

    await logActivity({
      type: "birthday_created",
      message: `${user.username} created a birthday`,
      user: user._id,
    });

    res.status(201).json(birthday);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getBirthdays = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const birthdays = await Birthday.find({
      user: req.user.id
    })
      .sort({
        birthMonth: 1,
        birthDay: 1
      })
      .skip(skip)
      .limit(limit);

    const total = await Birthday.countDocuments({
      user: req.user.id
    });

    res.status(200).json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: birthdays
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const updateBirthday = async (req, res) => {
  try {

    const birthday = await Birthday.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!birthday) {
      return res.status(404).json({
        message: "Birthday not found"
      });
    }

    const {
      name,
      birthDay,
      birthMonth,
      birthYear,
      relationship,
      notes
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Name is required."
      });
    }

    if (!birthDay) {
      return res.status(400).json({
        message: "Birth Day is required."
      });
    }

    if (!birthMonth) {
      return res.status(400).json({
        message: "Birth Month is required."
      });
    }

    if (!relationship?.trim()) {
      return res.status(400).json({
        message: "Relationship is required."
      });
    }

    if (!notes?.trim()) {
      return res.status(400).json({
        message: "Birthday Note is required."
      });
    }

    birthday.name = name.trim();
    birthday.birthDay = birthDay;
    birthday.birthMonth = birthMonth;
    birthday.birthYear = birthYear || null;
    birthday.relationship = relationship.trim();
    birthday.notes = notes?.trim();

    await birthday.save();
    const user = await User.findById(req.user.id);

    await logActivity({
      type: "birthday_updated",
      message: `${user.username} updated a birthday`,
      user: user._id,
    });

    res.status(200).json(birthday);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const deleteBirthday = async (req, res) => {
  try {

    const birthday = await Birthday.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!birthday) {
      return res.status(404).json({
        message: "Birthday not found"
      });
    }
    const user = await User.findById(req.user.id);

    await logActivity({
      type: "birthday_deleted",
      message: `${user.username} deleted a birthday`,
      user: user._id,
    });
    await birthday.deleteOne();

    res.status(200).json({
      success: true,
      message: "Birthday deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const getUpcomingBirthdays = async (req, res) => {
    try {

        const birthdays = await Birthday.find({
            user: req.user.id
        });

        const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcoming = birthdays.map((birthday) => {
              const nextBirthday = new Date(
                today.getFullYear(),
                birthday.birthMonth - 1,
                birthday.birthDay
            );

              nextBirthday.setFullYear(today.getFullYear());
              nextBirthday.setHours(0, 0, 0, 0);

              if (nextBirthday < today) {
                  nextBirthday.setFullYear(today.getFullYear() + 1);
              }

              const diffTime = nextBirthday - today;

              const daysRemaining = Math.round(
                  diffTime / (1000 * 60 * 60 * 24)
              );

              return {
                  ...birthday.toObject(),
                  daysRemaining,
              };
          })
          .filter((birthday) => birthday.daysRemaining <= 30)
          .sort((a, b) => a.daysRemaining - b.daysRemaining);
        res.status(200).json(upcoming);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
  createBirthday,
  getBirthdays,
  updateBirthday,
  deleteBirthday,
  getUpcomingBirthdays
};