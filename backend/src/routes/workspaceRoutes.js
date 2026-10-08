const express = require("express");

const {
    createWorkspace,
    getMyWorkspace,
    updateWorkspace,
    deleteWorkspace
} = require("../controllers/workspaceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("EMPLOYER"));

router.post("/", createWorkspace);
router.get("/", getMyWorkspace);
router.get("/me", getMyWorkspace);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

module.exports = router;