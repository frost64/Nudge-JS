const Suggestion = require("../models/Suggestion");
const User = require("../models/User");
const logActivity = require("../utils/activityLogger");

/*
=========================================
Create Suggestion
=========================================
*/
exports.createSuggestion = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Please fill all fields.",
      });
    }

    const suggestion = await Suggestion.create({
      user: req.user._id,
      fullName: req.user.fullName,
      username: req.user.username,
      title,
      message,
    });
    const user = await User.findById(req.user.id);

    await logActivity({
      type: "suggestion_created",
      message: `${user.username} submitted a suggestion`,
      user: user._id,
    });

    res.status(201).json(suggestion);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create suggestion.",
    });
  }
};

/*
=========================================
Get Logged-in User Suggestions
=========================================
*/
exports.getMySuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch suggestions.",
    });
  }
};

/*
=========================================
Admin - Get All Suggestions
=========================================
*/
exports.getAllSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch suggestions.",
    });
  }
};

/*
=========================================
Admin - Mark As Read
=========================================
*/
exports.markSuggestionRead = async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      {
        status: "read",
      },
      {
        new: true,
      }
    );

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found.",
      });
    }

    res.json(suggestion);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update suggestion.",
    });
  }
};

/*
=========================================
Admin - Delete Suggestion
=========================================
*/
exports.deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndDelete(
      req.params.id
    );

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found.",
      });
    }

    res.json({
      message: "Suggestion deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete suggestion.",
    });
  }
};