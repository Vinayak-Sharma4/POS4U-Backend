import mongoose from "mongoose";

const registrationRequestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        profession: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected"
            ],
            default: "Pending"
        },

        approvalTokenHash: {
            type: String,
            default: ""
        },

        approvalTokenExpires: {
            type: Date,
            default: null
        },

        approvedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "RegistrationRequest",
    registrationRequestSchema
);