const Todo = require("../models/todo");
const User = require("../models/Users");

// ==========================================
// CREATE TODO (Employee only — own todos)
// ==========================================

const createTodo = async (req, res) => {
    try {
        const { title, description, priority, weekStart, weekEnd } = req.body;

        if (!title || !weekStart || !weekEnd) {
            return res.status(400).json({
                success: false,
                message: "Title, weekStart and weekEnd are required"
            });
        }

        if (!req.user.workspaceId) {
            return res.status(400).json({
                success: false,
                message: "You are not assigned to a workspace"
            });
        }

        const todo = await Todo.create({
            title: title.trim(),
            description: description?.trim() || "",
            priority: priority || "MEDIUM",
            assignedTo: req.user.userId,
            workspaceId: req.user.workspaceId,
            createdBy: req.user.userId,
            weekStart: new Date(weekStart),
            weekEnd: new Date(weekEnd)
        });

        return res.status(201).json({
            success: true,
            message: "Todo created successfully",
            todo
        });

    } catch (error) {
        console.error("Create todo error:", error);
        return res.status(500).json({ success: false, message: "Failed to create todo" });
    }
};

// ==========================================
// GET MY TODOS (Employee — own todos)
// ==========================================

const getMyTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ assignedTo: req.user.userId })
            .sort({ weekStart: -1, createdAt: -1 });

        return res.status(200).json({ success: true, todos });

    } catch (error) {
        console.error("Get todos error:", error);
        return res.status(500).json({ success: false, message: "Failed to get todos" });
    }
};

// ==========================================
// UPDATE TODO (Employee — only their own)
// ==========================================

const updateTodo = async (req, res) => {
    try {
        const { title, description, status, priority, weekStart, weekEnd } = req.body;

        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, assignedTo: req.user.userId },
            {
                ...(title && { title: title.trim() }),
                ...(description !== undefined && { description: description.trim() }),
                ...(status && { status }),
                ...(priority && { priority }),
                ...(weekStart && { weekStart: new Date(weekStart) }),
                ...(weekEnd && { weekEnd: new Date(weekEnd) })
            },
            { new: true, runValidators: true }
        );

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Todo not found or you are not the owner"
            });
        }

        return res.status(200).json({ success: true, message: "Todo updated successfully", todo });

    } catch (error) {
        console.error("Update todo error:", error);
        return res.status(500).json({ success: false, message: "Failed to update todo" });
    }
};

// ==========================================
// DELETE TODO (Employee — only their own)
// ==========================================

const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({
            _id: req.params.id,
            assignedTo: req.user.userId
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Todo not found or you are not the owner"
            });
        }

        return res.status(200).json({ success: true, message: "Todo deleted successfully" });

    } catch (error) {
        console.error("Delete todo error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete todo" });
    }
};

// ==========================================
// GET EMPLOYEE TODOS (Employer — view any employee's todos in their workspace)
// ==========================================

const getEmployeeTodos = async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.employeeId,
            workspaceId: req.user.workspaceId,
            role: "EMPLOYEE"
        }).select("_id").lean();

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found in your workspace"
            });
        }

        const todos = await Todo.find({ assignedTo: req.params.employeeId })
            .sort({ weekStart: -1, createdAt: -1 });

        return res.status(200).json({ success: true, todos });

    } catch (error) {
        console.error("Get employee todos error:", error);
        return res.status(500).json({ success: false, message: "Failed to get employee todos" });
    }
};

module.exports = {
    createTodo,
    getMyTodos,
    updateTodo,
    deleteTodo,
    getEmployeeTodos
};
