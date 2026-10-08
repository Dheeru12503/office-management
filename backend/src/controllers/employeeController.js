const User = require("../models/Users");

const getEmployees = async (req, res) => {
    try {
        const employer = await User.findById(req.user.userId)
            .select("workspaceId")
            .lean();

        if (!employer) {
            return res.status(404).json({
                success: false,
                message: "Employer not found"
            });
        }

        if (!employer.workspaceId) {
            return res.status(400).json({
                success: false,
                message: "Create a workspace before viewing employees"
            });
        }

        const employees = await User.aggregate([
            {
                $match: {
                    role: "EMPLOYEE",
                    workspaceId: employer.workspaceId
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    workspaceId: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: {
                    name: 1
                }
            }
        ]);

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

module.exports = {
    getEmployees
};
