import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["Admin", "Operator"],
            default: "Operator",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLogin: {
            type: Date,
        },
        resetPasswordTokenHash: {
    type: String,
    default: null,
},

resetPasswordExpires: {
    type: Date,
    default: null,
},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);