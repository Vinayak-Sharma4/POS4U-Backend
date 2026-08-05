import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
        },

        razorpayOrderId: String,

        razorpayPaymentId: String,

        amount: Number,

        paymentStatus: {
            type: String,
            enum: ["Pending", "Success", "Failed"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Payment", paymentSchema);