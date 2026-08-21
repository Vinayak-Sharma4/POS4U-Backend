import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";
import { hashPassword } from "../utils/hashPassword.js";

dotenv.config();

await connectDB();

const exists = await User.findOne({
    username: "admin"
});

if (exists) {

    console.log("Admin already exists");

    process.exit();

}

const password = await hashPassword("Admin@123");

await User.create({

    username: "admin",

    fullName: "POS4U Administrator",

    email: "admin@pos4u.in",

    password,



});

console.log("Admin Created Successfully");

process.exit();