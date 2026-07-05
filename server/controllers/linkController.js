const Link = require("../models/Link");

const createLink = async (req, res) => {
    try {

        const { title, url, category, notes } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                message: "Title is required."
            });
        }

        if (!url?.trim()) {
            return res.status(400).json({
                message: "URL is required."
            });
        }

        if (!category?.trim()) {
            return res.status(400).json({
                message: "Category is required."
            });
        }

        if (!notes?.trim()) {
            return res.status(400).json({
                message: "Description is required."
            });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                message: "Please enter a valid URL."
            });
        }

        const link = await Link.create({
            title: title.trim(),
            url: url.trim(),
            category: category.trim(),
            notes: notes.trim(),
            user: req.user.id
        });

        res.status(201).json(link);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getLinks = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const links = await Link.find({
      user: req.user.id
    })
      .sort({
        createdAt: -1
      })
      .skip(skip)
      .limit(limit);

    const total = await Link.countDocuments({
      user: req.user.id
    });

    res.status(200).json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: links
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const updateLink = async (req, res) => {
    try {

        const link = await Link.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!link) {
            return res.status(404).json({
                message: "Link not found"
            });
        }

        const {
            title,
            url,
            category,
            notes
        } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                message: "Title is required."
            });
        }

        if (!url?.trim()) {
            return res.status(400).json({
                message: "URL is required."
            });
        }

        if (!category?.trim()) {
            return res.status(400).json({
                message: "Category is required."
            });
        }

        if (!notes?.trim()) {
            return res.status(400).json({
                message: "Description is required."
            });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                message: "Please enter a valid URL."
            });
        }

        link.title = title.trim();
        link.url = url.trim();
        link.category = category.trim();
        link.notes = notes.trim();

        await link.save();

        res.status(200).json(link);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteLink = async (req, res) => {
    try {

        const link = await Link.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!link) {
            return res.status(404).json({
                message: "Link not found"
            });
        }

        await link.deleteOne();

        res.status(200).json({
            success: true,
            message: "Link deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const toggleFavoriteLink = async (req, res) => {
    try {

        const link = await Link.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!link) {
            return res.status(404).json({
                message: "Link not found"
            });
        }

        link.favorite = !link.favorite;

        await link.save();

        res.status(200).json(link);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    createLink,
    getLinks,
    updateLink,
    deleteLink,
    toggleFavoriteLink
};