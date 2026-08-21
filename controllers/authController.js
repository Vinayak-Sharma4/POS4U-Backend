import {
    sendSignupRequestEmail,
    sendAccountCreatedEmail,
    sendPasswordResetEmail
} from "../services/signupService.js";

import crypto from "crypto";

import RegistrationRequest from "../models/RegistrationRequest.js";

import {
    hashPassword
} from "../utils/hashPassword.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
    comparePassword
} from "../utils/hashPassword.js";

export const login = async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({
            username
        });

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });

        }

        const matched = await comparePassword(
            password,
            user.password
        );

        if (!matched) {

            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });

        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );

        user.lastLogin = new Date();

        await user.save();

        res.json({

            success: true,

            token,

            user: {

                id: user._id,

                username: user.username,

                fullName: user.fullName,

                role: user.role

            }

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const signup = async (req, res) => {

    try {

        const {
            name,
            mobile,
            address,
            email,
            dateOfBirth,
            profession,
            city
        } = req.body;

        if (
            !name ||
            !mobile ||
            !address ||
            !email ||
            !dateOfBirth ||
            !profession ||
            !city
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        if (!/^\d{10}$/.test(mobile)) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10 digit mobile number."
            });

        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "An account already exists with this email."
            });

        }

        const existingRequest = await RegistrationRequest.findOne({
            email: email.toLowerCase(),
            status: "Pending"
        });

        if (existingRequest) {

            return res.status(400).json({
                success: false,
                message: "A registration request is already pending for this email."
            });

        }

        const approvalToken =
            crypto.randomBytes(32).toString("hex");

        const approvalTokenHash =
            crypto
                .createHash("sha256")
                .update(approvalToken)
                .digest("hex");

        const request = await RegistrationRequest.create({

            name,
            mobile,
            address,
            email: email.toLowerCase(),
            dateOfBirth,
            profession,
            city,

            status: "Pending",

            approvalTokenHash,

            approvalTokenExpires:
                new Date(
                    Date.now() + 48 * 60 * 60 * 1000
                )
        });

        await sendSignupRequestEmail(
            request,
            approvalToken
        );

        res.status(201).json({

            success: true,

            message:
                "Your application is received and under the observation once it will processed for success you will get the notification on your respected Email. Thanks"

        });

    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to submit registration request."

        });

    }

};
export const approveSignup = async (req, res) => {

    try {

        const { token } = req.params;

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        const request =
            await RegistrationRequest.findOne({
                approvalTokenHash: tokenHash
            });

        if (!request) {

            return res.status(404).send(`
                <h2>Invalid or expired approval request.</h2>
            `);

        }

        if (
            request.approvalTokenExpires &&
            request.approvalTokenExpires < new Date()
        ) {

            return res.status(400).send(`
                <h2>This approval link has expired.</h2>
            `);

        }

        if (request.status !== "Pending") {

            return res.status(400).send(`
                <h2>This registration request has already been processed.</h2>
            `);

        }

        const existingUser =
            await User.findOne({
                email: request.email
            });

        if (existingUser) {

            return res.status(400).send(`
                <h2>An account already exists for this email.</h2>
            `);

        }

        const username =
            `pos4u${request.mobile}`;

        const temporaryPassword =
            crypto
                .randomBytes(6)
                .toString("base64")
                .replace(/[^a-zA-Z0-9]/g, "")
                .slice(0, 10);

        const hashedPassword =
            await hashPassword(
                temporaryPassword
            );

        await User.create({

            username,

            fullName:
                request.name,

            email:
                request.email,

            password:
                hashedPassword,

            role:
                "Operator",

            isActive:
                true

        });

        request.status = "Approved";

        request.approvedAt = new Date();

        request.approvalTokenHash = "";

        request.approvalTokenExpires = null;

        await request.save();

        try {

            await sendAccountCreatedEmail({

                email:
                    request.email,

                name:
                    request.name,

                username,

                password:
                    temporaryPassword

            });

        } catch (emailError) {

            console.error(
                "Account email error:",
                emailError
            );

        }

        res.send(`
            <!DOCTYPE html>

            <html>

            <head>

                <title>POS4U Account Approved</title>

            </head>

            <body
                style="
                    font-family:Arial;
                    text-align:center;
                    padding:60px;
                    background:#f5f5f5;
                "
            >

                <div
                    style="
                        max-width:600px;
                        margin:auto;
                        background:white;
                        padding:40px;
                        border-radius:12px;
                        box-shadow:0 5px 25px rgba(0,0,0,.15);
                    "
                >

                    <h2 style="color:#198754;">
                        Account Approved Successfully
                    </h2>

                    <p>
                        The user account has been created successfully.
                    </p>

                    <p>
                        Login credentials have been sent to the applicant's email address.
                    </p>

                </div>

            </body>

            </html>
        `);

    } catch (error) {

        console.error(
            "Approve signup error:",
            error
        );

        res.status(500).send(`
            <h2>Unable to approve this registration request.</h2>
        `);

    }

};
export const rejectSignup = async (req, res) => {

    try {

        const { token } = req.params;

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        const request =
            await RegistrationRequest.findOne({
                approvalTokenHash: tokenHash
            });

        if (!request) {

            return res.status(404).send(`
                <h2>Invalid or expired request.</h2>
            `);

        }

        if (request.status !== "Pending") {

            return res.status(400).send(`
                <h2>This request has already been processed.</h2>
            `);

        }

        request.status = "Rejected";

        request.approvalTokenHash = "";

        request.approvalTokenExpires = null;

        await request.save();

        res.send(`
            <!DOCTYPE html>

            <html>

            <head>
                <title>POS4U Request Rejected</title>
            </head>

            <body
                style="
                    font-family:Arial;
                    text-align:center;
                    padding:60px;
                    background:#f5f5f5;
                "
            >

                <div
                    style="
                        max-width:600px;
                        margin:auto;
                        background:white;
                        padding:40px;
                        border-radius:12px;
                        box-shadow:0 5px 25px rgba(0,0,0,.15);
                    "
                >

                    <h2 style="color:#dc3545;">
                        Registration Request Rejected
                    </h2>

                    <p>
                        The registration request has been rejected.
                    </p>

                </div>

            </body>

            </html>
        `);

    } catch (error) {

        console.error(
            "Reject signup error:",
            error
        );

        res.status(500).send(`
            <h2>Unable to reject this request.</h2>
        `);

    }

};

// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email address is required."
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        /*
         * Important security rule:
         *
         * We do not reveal whether an email exists.
         * This prevents account/email enumeration.
         */

        if (!user) {

            return res.json({
                success: true,
                message:
                    "If an account exists with this email, a password reset link has been sent."
            });

        }

        // Generate secure random token
        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Hash token before storing in database
        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token valid for 15 minutes
        const resetTokenExpires =
            new Date(Date.now() + 15 * 60 * 1000);

        user.resetPasswordTokenHash = resetTokenHash;
        user.resetPasswordExpires = resetTokenExpires;

        await user.save();

        /*
         * Production frontend URL
         *
         * We will use environment variable so
         * localhost and production can have different URLs.
         */

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";

        const resetUrl =
            `${frontendUrl}/reset-password/${resetToken}`;

        // Send email
        await sendPasswordResetEmail({
            email: user.email,
            name: user.fullName,
            resetUrl
        });

        return res.json({
            success: true,
            message:
                "If an account exists with this email, a password reset link has been sent."
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to process password reset request."
        });

    }
};


// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = async (req, res) => {

    try {

        const { token } = req.params;

        const { password, confirmPassword } = req.body;

        if (!token) {

            return res.status(400).json({
                success: false,
                message: "Invalid password reset link."
            });

        }

        if (!password || !confirmPassword) {

            return res.status(400).json({
                success: false,
                message:
                    "Password and confirm password are required."
            });

        }

        if (password !== confirmPassword) {

            return res.status(400).json({
                success: false,
                message:
                    "Passwords do not match."
            });

        }

        /*
         * Basic password security
         */

        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters."
            });

        }

        // Hash token from URL
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordTokenHash: tokenHash,
            resetPasswordExpires: {
                $gt: new Date()
            }
        });

        if (!user) {

            return res.status(400).json({
                success: false,
                message:
                    "Password reset link is invalid or has expired."
            });

        }

        // Hash new password
        const hashedPassword =
            await hashPassword(password);

        user.password = hashedPassword;

        /*
         * Immediately invalidate reset token.
         * This makes the link single-use.
         */

        user.resetPasswordTokenHash = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.json({
            success: true,
            message:
                "Password reset successfully. You can now login with your new password."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to reset password."
        });

    }
};

export const changePassword = async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Current password and new password are required."
            });

        }

        // Basic password validation
        if (newPassword.length < 8) {

            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long."
            });

        }

        // User ID comes from JWT middleware
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        // Check current password
        const passwordMatched = await comparePassword(
            currentPassword,
            user.password
        );

        if (!passwordMatched) {

            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });

        }

        // Prevent same password
        const samePassword = await comparePassword(
            newPassword,
            user.password
        );

        if (samePassword) {

            return res.status(400).json({
                success: false,
                message: "New password must be different from your current password."
            });

        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;

        await user.save();

        return res.json({

            success: true,

            message: "Password changed successfully."

        });

    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Unable to change password."

        });

    }

};