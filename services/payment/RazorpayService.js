import { getRazorpay } from "../../config/razorpay.js";

class RazorpayService {

    async createOrder(data) {

        const razorpay = getRazorpay();

        const options = {

            amount: Number(data.amount) * 100,

            currency: "INR",

            receipt: "POS4U_" + Date.now(),

            payment_capture: 1

        };

        const order = await razorpay.orders.create(options);

        return {

            gateway: "razorpay",

            orderId: order.id,

            amount: order.amount,

            currency: order.currency,

            receipt: order.receipt

        };

    }

}

export default RazorpayService;