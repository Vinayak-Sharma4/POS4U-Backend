import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        mobileNo: {
            type: String,
            required: true
        },

        fatherName: {
            type: String,
            required: true
        },

        formName: {
            type: String,
            required: true
        },

        fees: {
            type: Number,
            required: true
        },

        document: {
            type: String,
            required: true
        },

        paymentStatus: {
            type: String,
            default: "Pending"
        },

        paymentId: {
            type: String,
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Customer", customerSchema);