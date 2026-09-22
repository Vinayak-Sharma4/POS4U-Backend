import RazorpayGateway from "./RazorpayGateway.js";
import GetePayGateway from "./GetePayGateway.js";
class PaymentFactory {
    static getGateway() {
        const gateway = String(process.env.PAYMENT_GATEWAY || "razorpay").toLowerCase();
        if (gateway === "getepay") return new GetePayGateway();
        if (gateway === "razorpay") return new RazorpayGateway();
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
}
export default PaymentFactory;
