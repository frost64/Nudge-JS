const Note = require("../models/Note");

const createNote = async (req, res) => {
  try {

    const {
      title,
      content,
      tags
    } = req.body;

    const note = await Note.create({
      title,
      content,
      tags,
      user: req.user.id
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

    const updatedNote =
      await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.status(200).json(updatedNote);

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