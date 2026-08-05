import PaymentFactory from "../services/payment/PaymentFactory.js";

export const createOrder = async (req, res) => {

    try {

        console.log("Request Body:", req.body);

        const gateway = PaymentFactory.getGateway();

        const order = await gateway.createOrder(req.body);

        console.log("Order Created:", order);

        return res.json({
            success: true,
            data: order
        });

        console.log("Headers:", req.headers);
        console.log("Body:", req.body);

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