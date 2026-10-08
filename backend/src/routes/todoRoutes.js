const express = require("express");

const {
    createTodo,
    getMyTodos,
    updateTodo,
    deleteTodo,
    getEmployeeTodos
} = require("../controllers/todoController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Employee routes
router.post("/", authMiddleware, roleMiddleware("EMPLOYEE"), createTodo);
router.get("/my", authMiddleware, roleMiddleware("EMPLOYEE"), getMyTodos);
router.put("/:id", authMiddleware, roleMiddleware("EMPLOYEE"), updateTodo);
router.delete("/:id", authMiddleware, roleMiddleware("EMPLOYEE"), deleteTodo);

// Employer route — view todos of a specific employee in their workspace
router.get("/employee/:employeeId", authMiddleware, roleMiddleware("EMPLOYER"), getEmployeeTodos);

module.exports = router;
