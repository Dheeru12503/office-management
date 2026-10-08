const Workspace = require("../models/Workspace");
const User = require("../models/Users");

// ==========================================
// CREATE WORKSPACE
// ==========================================

const createWorkspace = async (req, res) => {
    try {
        const name = req.body?.name;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Workspace name is required"
            });
        }

        // Check whether employer already has a workspace
        const existingWorkspace = await Workspace.findOne({
            ownerId: req.user.userId
        });

        if (existingWorkspace) {
            return res.status(409).json({
                success: false,
                message: "You already have a workspace"
            });
        }

        // Create workspace
        const workspace = await Workspace.create({
            name: name.trim(),
            ownerId: req.user.userId
        });

        // Connect workspace to employer
        await User.findByIdAndUpdate(
            req.user.userId,
            {
                workspaceId: workspace._id
            }
        );

        return res.status(201).json({
            success: true,
            message: "Workspace created successfully",
            workspace
        });

    } catch (error) {
        console.error("Create workspace error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create workspace"
        });
    }
};

// ==========================================
// GET MY WORKSPACE
// ==========================================

const getMyWorkspace = async (req, res) => {
    try {
        let workspace = await Workspace.findOne({
            ownerId: req.user.userId
        });

        if (!workspace) {
            const user = await User.findById(req.user.userId)
                .select("workspaceId")
                .lean();

            if (typeof user?.workspaceId === "string" && user.workspaceId.trim()) {
                workspace = {
                    name: user.workspaceId,
                    ownerId: user._id
                };
            }
        }

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
        }

        return res.status(200).json({
            success: true,
            workspace
        });

    } catch (error) {
        console.error("Get workspace error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get workspace"
        });
    }
};

// ==========================================
// UPDATE WORKSPACE
// ==========================================

const updateWorkspace = async (req, res) => {
    try {
        const name = req.body?.name;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Workspace name is required"
            });
        }

        const workspace = await Workspace.findOneAndUpdate(
            {
                _id: req.params.id,
                ownerId: req.user.userId
            },
            {
                name: name.trim()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found or you are not the owner"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Workspace updated successfully",
            workspace
        });

    } catch (error) {
        console.error("Update workspace error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update workspace"
        });
    }
};

// ==========================================
// DELETE WORKSPACE
// ==========================================

const deleteWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({
            _id: req.params.id,
            ownerId: req.user.userId
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found or you are not the owner"
            });
        }

        // Remove workspace ID from users
        await User.updateMany(
            {
                workspaceId: workspace._id
            },
            {
                $set: {
                    workspaceId: null
                }
            }
        );

        await Workspace.findByIdAndDelete(workspace._id);

        return res.status(200).json({
            success: true,
            message: "Workspace deleted successfully"
        });

    } catch (error) {
        console.error("Delete workspace error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete workspace"
        });
    }
};

module.exports = {
    createWorkspace,
    getMyWorkspace,
    updateWorkspace,
    deleteWorkspace
};