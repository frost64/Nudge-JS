const User = require("../models/User");

const getProfile = async (req, res) => {
    try {

        const user = await User.findById(
            req.user.id
        ).select("-password");

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const updateProfile = async (req, res) => {
    try {

        const {
            username,
            email,
            bio,
            avatar,
            theme
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                username,
                email,
                bio,
                avatar,
                theme
            },
            {
                new: true
            }
        ).select("-password");

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};



module.exports = {
    getProfile,
    updateProfile
};