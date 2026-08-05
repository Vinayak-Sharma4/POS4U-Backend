import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        applicationId: {
            type: String,
            unique: true,
        },

        applicantName: {
            type: String,
            required: true,
            trim: true,
        },

        fatherName: {
            type: String,
            required: true,
            trim: true,
        },

        mobileNumber: {
            type: String,
            required: true,
        },

        serviceName: {
            type: String,
            required: true,
        },

        fees: {
            type: Number,
            required: true,
        },

        uploadedDocument: {
            type: String,
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Success", "Failed"],
            default: "Pending",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Application", applicationSchema);