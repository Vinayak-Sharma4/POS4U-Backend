import crypto from "crypto";

import RegistrationRequest from "../models/RegistrationRequest.js";

import {
    sendSignupRequestEmail,
    sendAccountCreatedEmail
} from "../services/signupService.js";

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