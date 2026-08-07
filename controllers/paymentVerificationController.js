import crypto from "crypto";
import Form from "../models/Form.js";

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

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {

            return res.status(400).json({

                success: false,

                message: "Invalid Payment Signature"

            });

        }

        await Form.findByIdAndUpdate(

            applicationId,

            {

                paymentStatus: "Paid",

                paymentId: razorpay_payment_id,

                orderId: razorpay_order_id,

                paymentGateway: "razorpay",

                paidAt: new Date()

            }

        );

        return res.json({

            success: true,

            message: "Payment Verified Successfully"

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};