// import { getRazorpay } from "../../config/razorpay.js";
// import PaymentGateway from "./PaymentGateway.js";

// class RazorpayGateway extends PaymentGateway {

//     async createOrder(data) {
//         const razorpay = getRazorpay();

//         const options = {

//            amount: Number(data.fees) * 100,

//             currency: "INR",

//             receipt: `POS4U_${Date.now()}`

//         };

//         const order = await razorpay.orders.create(options);

//         return {

//             gateway: "razorpay",

//             orderId: order.id,

//             amount: order.amount,

//             currency: order.currency,

//             receipt: order.receipt

//         };

//     }

// }

// export default RazorpayGateway;

import { getRazorpay } from "../../config/razorpay.js";
import PaymentGateway from "./PaymentGateway.js";

class RazorpayGateway extends PaymentGateway {

    async createOrder(data) {

        const razorpay = getRazorpay();

        const options = {
            amount: Number(data.fees) * 100,
            currency: "INR",
            receipt: `POS4U_${Date.now()}`,
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

export default RazorpayGateway;
