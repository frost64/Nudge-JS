const Birthday = require("../models/Birthday");

const createBirthday = async (req, res) => {
  try {

    const {
      name,
      birthDate,
      relationship,
      notes
    } = req.body;

    const birthday = await Birthday.create({
      name,
      birthDate,
      relationship,
      notes,
      user: req.user.id
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
        birthDate: 1
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

    const updatedBirthday =
      await Birthday.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.status(200).json(updatedBirthday);

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

        const upcoming = birthdays.map(birthday => {

            const nextBirthday = new Date(birthday.birthDate);

            nextBirthday.setFullYear(today.getFullYear());

            if (nextBirthday < today) {
                nextBirthday.setFullYear(today.getFullYear() + 1);
            }

            const diffTime =
                nextBirthday.getTime() - today.getTime();

            const daysRemaining =
                Math.ceil(
                    diffTime / (1000 * 60 * 60 * 24)
                );

            return {
                ...birthday.toObject(),
                daysRemaining
            };

        })
        .filter(birthday => birthday.daysRemaining <= 30  )
        .sort(
            (a, b) =>
                a.daysRemaining - b.daysRemaining
        );

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