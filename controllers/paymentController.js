// import PaymentFactory from "../services/payment/PaymentFactory.js";

// export const createOrder = async (req, res) => {

//     try {

//         console.log("Request Body:", req.body);

//         const gateway = PaymentFactory.getGateway();

//         const order = await gateway.createOrder(req.body);

//         console.log("Order Created:", order);

//         return res.json({
//             success: true,
//             data: order
//         });

//         console.log("Headers:", req.headers);
//         console.log("Body:", req.body);

//     } catch (error) {

//         console.error("========== PAYMENT ERROR ==========");
//         console.error(error);
//         console.error("===================================");

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }

// };
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

        if (!application.fees || Number(application.fees) <= 0) {

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

        const order = await gateway.createOrder({

            applicationId: application._id.toString(),

            fees: Number(application.fees)

        });

        await Form.findByIdAndUpdate(

            application._id,

            {
                orderId: order.orderId,

                paymentGateway: "razorpay",

                paymentStatus: "Pending"
            }

        );

        console.log("Order Created:", order);

        console.log(
            "Application ID:",
            application._id.toString()
        );

        console.log(
            "Application Fees:",
            application.fees
        );

        console.log(
            "Razorpay Order ID:",
            order.orderId
        );

        console.log("=================================");

        return res.json({

            success: true,

            data: order

        });

    } catch (error) {

        console.error("========== PAYMENT ERROR ==========");

        console.error("Message:", error.message);

        console.error("Stack:", error.stack);

        console.error("===================================");

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }
};