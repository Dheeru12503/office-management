const User = require("../models/Users");
const Workspace = require("../models/Workspace");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            workspaceId: user.workspaceId
                ? user.workspaceId.toString()
                : null
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
};

// ===============================
// SIGNUP
// ===============================

const signup = async (req, res) => {
    try {
        const { name, email, password, role, workspaceName } = req.body;

        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required"
            });
        }

        // Validate role
        if (!["EMPLOYER", "EMPLOYEE"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        let workspaceId = null;
        const normalizedWorkspaceName =
            typeof workspaceName === "string" ? workspaceName.trim() : "";

        if (role === "EMPLOYEE") {
            if (!normalizedWorkspaceName) {
                return res.status(400).json({
                    success: false,
                    message: "Workspace name is required for employees"
                });
            }

            const workspace = await Workspace.findOne({
                name: { $regex: new RegExp(`^${normalizedWorkspaceName}$`, "i") }
            }).select("_id");

            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    message: "Workspace not found"
                });
            }

            workspaceId = workspace._id.toString();
        } else if (!normalizedWorkspaceName) {
            return res.status(400).json({
                success: false,
                message: "Workspace name is required for employers"
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
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

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            workspaceId
        });

        if (role === "EMPLOYER") {
            let workspace;

            try {
                workspace = await Workspace.create({
                    name: normalizedWorkspaceName,
                    ownerId: user._id
                });

                user.workspaceId = workspace._id.toString();
                await user.save();
            } catch (error) {
                try {
                    if (workspace) {
                        await Workspace.findByIdAndDelete(workspace._id);
                    }
                    await User.findByIdAndDelete(user._id);
                } catch (cleanupError) {
                    console.error("Signup rollback error:", cleanupError);
                }

                throw error;
            }
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                workspaceId: user.workspaceId
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token
        const token = generateToken(user);

        // Store token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                workspaceId: user.workspaceId
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ===============================
// LOGOUT
// ===============================

const logout = (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};

module.exports = {
    signup,
    login,
    logout
};