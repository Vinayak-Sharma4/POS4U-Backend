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