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

export const createOrder = async (req, res) => {

    try {

        const { applicationId } = req.body;

        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: "Application ID is required."
            });
        }

        const application = await Form.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        if (application.paymentStatus === "Paid") {
            return res.status(400).json({
                success: false,
                message: "This application has already been paid."
            });
        }

        const gateway = PaymentFactory.getGateway();

        // Amount is taken from MongoDB, not from the browser request.
        const order = await gateway.createOrder({
            applicationId: application._id.toString(),
            fees: application.fees
        });

        await Form.findByIdAndUpdate(application._id, {
            orderId: order.orderId,
            paymentGateway: "razorpay",
            paymentStatus: "Pending"
        });

        console.log("Order Created:", order);

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
            message: error.message
        });

    }

};
