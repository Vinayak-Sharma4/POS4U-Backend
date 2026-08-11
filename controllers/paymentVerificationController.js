// import crypto from "crypto";
// import Form from "../models/Form.js";

// export const verifyPayment = async (req, res) => {

//     try {

//         const {

//             applicationId,

//             razorpay_order_id,

//             razorpay_payment_id,

//             razorpay_signature

//         } = req.body;

//         if (
//             !applicationId ||
//             !razorpay_order_id ||
//             !razorpay_payment_id ||
//             !razorpay_signature
//         ) {

//             return res.status(400).json({

//                 success: false,

//                 message: "Missing payment details"

//             });

//         }

//         const generatedSignature = crypto
//             .createHmac(
//                 "sha256",
//                 process.env.RAZORPAY_KEY_SECRET
//             )
//             .update(
//                 `${razorpay_order_id}|${razorpay_payment_id}`
//             )
//             .digest("hex");

//         if (generatedSignature !== razorpay_signature) {

//             return res.status(400).json({

//                 success: false,

//                 message: "Invalid Payment Signature"

//             });

//         }

//         await Form.findByIdAndUpdate(

//             applicationId,

//             {

//                 paymentStatus: "Paid",

//                 paymentId: razorpay_payment_id,

//                 orderId: razorpay_order_id,

//                 paymentGateway: "razorpay",

//                 paidAt: new Date()

//             }

//         );

//         return res.json({

//             success: true,

//             message: "Payment Verified Successfully"

//         });

//     }

//     catch (error) {

//         return res.status(500).json({

//             success: false,

//             message: error.message

//         });

//     }

// };

import crypto from "crypto";
import Form from "../models/Form.js";
import { getRazorpay } from "../config/razorpay.js";

export const verifyPayment = async (req, res) => {

    try {

        const {
            applicationId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !applicationId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing payment details"
            });
        }

        const application = await Form.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        // IMPORTANT: use the order ID stored on our server, not the one
        // supplied by the browser, when generating the signature.
        if (application.orderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Payment order does not match the application."
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${application.orderId}|${razorpay_payment_id}`)
            .digest("hex");

        const signaturesMatch =
            generatedSignature.length === razorpay_signature.length &&
            crypto.timingSafeEqual(
                Buffer.from(generatedSignature),
                Buffer.from(razorpay_signature)
            );

        if (!signaturesMatch) {
            await Form.findByIdAndUpdate(applicationId, {
                paymentStatus: "Failed"
            });

            return res.status(400).json({
                success: false,
                message: "Invalid Payment Signature"
            });
        }

        // Confirm the payment status directly with Razorpay.
        const razorpay = getRazorpay();
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.order_id !== application.orderId) {
            return res.status(400).json({
                success: false,
                message: "Payment is linked to a different order."
            });
        }

        if (payment.status !== "captured") {
            return res.status(400).json({
                success: false,
                message: `Payment is not captured yet. Current status: ${payment.status}`
            });
        }

        await Form.findByIdAndUpdate(applicationId, {
            paymentStatus: "Paid",
            paymentId: razorpay_payment_id,
            orderId: application.orderId,
            paymentGateway: "razorpay",
            paidAt: new Date()
        });

        return res.json({
            success: true,
            message: "Payment Verified Successfully",
            data: {
                applicationId,
                paymentId: razorpay_payment_id,
                orderId: application.orderId,
                paymentStatus: "Paid"
            }
        });

    } catch (error) {

        console.error("Payment Verification Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
