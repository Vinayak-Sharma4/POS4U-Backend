// import { PAYMENT_GATEWAY } from "../../config/paymentConfig.js";
// import RazorpayService from "./RazorpayService.js";

// class PaymentFactory {

//     static getGateway() {

//         switch (PAYMENT_GATEWAY) {

//             case "razorpay":
//                 return new RazorpayService();

//             default:
//                 throw new Error("Payment Gateway Not Configured");
//         }

//     }

// }

// export default PaymentFactory;

import RazorpayGateway from "./RazorpayGateway.js";

class PaymentFactory {

    static getGateway() {

        return new RazorpayGateway();

    }

}

export default PaymentFactory;