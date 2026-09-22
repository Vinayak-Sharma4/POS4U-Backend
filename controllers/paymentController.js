import PaymentFactory from "../services/payment/PaymentFactory.js";
import Form from "../models/Form.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {

    try {

        console.log("========== CREATE ORDER ==========");
        console.log("Request Body:", req.body);

        const { applicationId } = req.body;

        if (!applicationId) {

            return res.status(400).json({
                success: false,
                message: "Application ID is required."
            });

        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid Application ID."
            });

        }

        const application = await Form.findById(applicationId);

        console.log("Application Found:", application);

        if (!application) {

            return res.status(404).json({
                success: false,
                message: "Application not found."
            });

        }

        console.log("Application Fees:", application.fees);

        const fees = Number(application.fees);

        if (!fees || fees <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid application fees."
            });

        }

        if (application.paymentStatus === "Paid") {

            return res.status(400).json({
                success: false,
                message: "This application has already been paid."
            });

        }

        const gateway = PaymentFactory.getGateway();

        console.log("Calling Payment Gateway with:", {
            applicationId: application._id.toString(),
            fees: fees
        });

        const order = await gateway.createOrder({

            applicationId: application._id.toString(),

            fees: fees,

            mobile: application.mobile,

            name: application.name,

            formName: application.formName

        });

        await Form.findByIdAndUpdate(
            application._id,
            {
                orderId: order.orderId,
                paymentGateway: order.gateway || process.env.PAYMENT_GATEWAY || "razorpay",
                paymentStatus: "Pending"
            }
        );

        console.log("Order Created:", order);

        console.log("=================================");

        return res.json({

            success: true,

            data: order

        });

    } catch (error) {

        console.error("========== PAYMENT ERROR ==========");

        console.error(error);

        console.error("===================================");

        return res.status(500).json({

            success: false,

            message: error.message || "Payment order creation failed."

        });

    }
};