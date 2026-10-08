const User = require("../models/Users");
const bcrypt = require("bcryptjs");

// ==========================================
// CREATE EMPLOYEE
// ==========================================

const createEmployee = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Employer must have a workspace
        if (!req.user.workspaceId) {
            return res.status(400).json({
                success: false,
                message: "You must create a workspace first"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check email
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create employee
        const employee = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "EMPLOYEE",
            workspaceId: req.user.workspaceId
        });

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                workspaceId: employee.workspaceId
            }
        });

    } catch (error) {
        console.error("Create employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create employee"
        });
    }
};


// ==========================================
// GET EMPLOYEES
// ==========================================

const getEmployees = async (req, res) => {
    try {
        if (!req.user.workspaceId) {
            return res.status(400).json({
                success: false,
                message: "You do not have a workspace"
            });
        }

        const employees = await User.find({
            workspaceId: req.user.workspaceId,
            role: "EMPLOYEE"
        })
            .select("_id name email role workspaceId createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            employees
        });

    } catch (error) {
        console.error("Get employees error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get employees"
        });
    }
};


// ==========================================
// UPDATE EMPLOYEE
// ==========================================

const updateEmployee = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        if (!req.user.workspaceId) {
            return res.status(400).json({
                success: false,
                message: "You do not have a workspace"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Make sure email is not used by another user
        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.params.id }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Workspace check prevents cross-workspace modification
        const employee = await User.findOneAndUpdate(
            {
                _id: req.params.id,
                workspaceId: req.user.workspaceId,
                role: "EMPLOYEE"
            },
            {
                name: name.trim(),
                email: normalizedEmail
            },
            {
                new: true,
                runValidators: true
            }
        ).select("_id name email role workspaceId createdAt");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            employee
        });

    } catch (error) {
        console.error("Update employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update employee"
        });
    }
};


// ==========================================
// DELETE EMPLOYEE
// ==========================================

const deleteEmployee = async (req, res) => {
    try {
        if (!req.user.workspaceId) {
            return res.status(400).json({
                success: false,
                message: "You do not have a workspace"
            });
        }

        // Workspace check prevents cross-workspace deletion
        const employee = await User.findOneAndDelete({
            _id: req.params.id,
            workspaceId: req.user.workspaceId,
            role: "EMPLOYEE"
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully"
        });

    } catch (error) {
        console.error("Delete employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete employee"
        });
    }
};


module.exports = {
    createEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee
};