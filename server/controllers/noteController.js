const Note = require("../models/Note");
const logActivity = require("../utils/activityLogger");
const User = require("../models/User");

const createNote = async (req, res) => {
  try {
    const {
      title,
      content,
      tags
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required."
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Description is required."
      });
    }

    if (
      !Array.isArray(tags) ||
      tags.filter(tag => tag.trim()).length === 0
    ) {
      return res.status(400).json({
        message: "Please add at least one tag."
      });
    }
    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      tags: tags.map(tag => tag.trim()).filter(Boolean),
      user: req.user.id
    });
    const user = await User.findById(req.user.id);
    await logActivity({
      type: "note_created",
      message: `${user.username} created a note`,
      user: req.user.id,
    });

    res.status(201).json(note);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getNotes = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const notes = await Note.find({
      user: req.user.id
    })
      .sort({
        pinned: -1,
        createdAt: -1
      })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({
      user: req.user.id
    });

    res.status(200).json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: notes
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const updateNote = async (req, res) => {
  try {

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    const {
      title,
      content,
      tags
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required."
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Description is required."
      });
    }

    if (
      !Array.isArray(tags) ||
      tags.filter(tag => tag.trim()).length === 0
    ) {
      return res.status(400).json({
        message: "Please add at least one tag."
      });
    }

    note.title = title.trim();
    note.content = content.trim();
    note.tags = tags.map(tag => tag.trim()).filter(Boolean);

    await note.save();
    const user = await User.findById(req.user.id);
    await logActivity({
      type: "note_updated",
      message: `${user.username} updated a note`,
      user: req.user.id,
    });

    res.status(200).json(note);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteNote = async (req, res) => {
  try {

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    await note.deleteOne();
    const user = await User.findById(req.user.id);
    await logActivity({
      type: "note_deleted",
      message: `${user.username} deleted a note`,
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Note deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const togglePinNote = async (req, res) => {
  try {

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    note.pinned = !note.pinned;

    await note.save();

    res.status(200).json(note);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const toggleFavoriteNote = async (req, res) => {
  try {

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    note.favorite = !note.favorite;

    await note.save();

    res.status(200).json(note);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleFavoriteNote
};