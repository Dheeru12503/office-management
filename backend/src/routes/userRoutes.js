const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

module.exports = router;