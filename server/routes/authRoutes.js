const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");



const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    deleteMyAccount
} = require("../controllers/authController");

router.post(
    "/register",

    [
        body("username")
            .notEmpty()
            .withMessage("Username is required"),

        body("email")
            .isEmail()
            .withMessage("Invalid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
    ],

    validate,

    registerUser
);


router.post(
    "/login",

    [
        body("email")
            .isEmail()
            .withMessage("Invalid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],

    validate,

    loginUser
);



router.get("/me", authMiddleware, getMe);   
router.put("/profile", authMiddleware, updateProfile);
router.delete("/delete-account",authMiddleware,deleteMyAccount);
module.exports = router;

