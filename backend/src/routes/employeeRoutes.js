const express = require("express");

const { getEmployees } = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("EMPLOYER"), getEmployees);

module.exports = router;