import { getRazorpay } from "../../config/razorpay.js";
import PaymentGateway from "./PaymentGateway.js";

class RazorpayGateway extends PaymentGateway {

    async createOrder(data) {

        console.log("========== RAZORPAY GATEWAY ==========");
        console.log("Gateway Data:", data);

        const razorpay = getRazorpay();

        const fees = Number(data.fees);

        console.log("Fees Received:", fees);

        if (!fees || fees <= 0) {
            throw new Error("Invalid payment amount.");
        }

        const amount = Math.round(fees * 100);

        console.log("Razorpay Amount:", amount);

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `POS4U_${Date.now()}`,
            payment_capture: 1
        };

        console.log("Razorpay Order Options:", options);

        const order = await razorpay.orders.create(options);

        console.log("Razorpay Order Response:", order);

        return {
            gateway: "razorpay",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt
        };
    }
}

export default RazorpayGateway;