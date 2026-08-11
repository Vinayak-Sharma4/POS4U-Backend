import crypto from "crypto";
import Form from "../models/Form.js";

export const handleRazorpayWebhook = async (req, res) => {

    try {

        const signature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is missing.");
            return res.sendStatus(500);
        }

        if (!signature || !Buffer.isBuffer(req.body)) {
            return res.sendStatus(400);
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        const signaturesMatch =
            expectedSignature.length === signature.length &&
            crypto.timingSafeEqual(
                Buffer.from(expectedSignature),
                Buffer.from(signature)
            );

        if (!signaturesMatch) {
            console.error("Invalid Razorpay webhook signature.");
            return res.sendStatus(400);
        }

        const event = JSON.parse(req.body.toString("utf8"));

        const paymentEntity = event.payload?.payment?.entity;
        const orderEntity = event.payload?.order?.entity;

        const orderId =
            paymentEntity?.order_id ||
            orderEntity?.id;

        if (!orderId) {
            // Acknowledge unrelated/unsupported events after signature validation.
            return res.sendStatus(200);
        }

        if (
            event.event === "payment.captured" ||
            event.event === "order.paid"
        ) {

            await Form.findOneAndUpdate(
                { orderId },
                {
                    paymentStatus: "Paid",
                    ...(paymentEntity?.id
                        ? { paymentId: paymentEntity.id }
                        : {}),
                    paymentGateway: "razorpay",
                    paidAt: new Date()
                }
            );

        } else if (event.event === "payment.failed") {

            await Form.findOneAndUpdate(
                { orderId },
                {
                    paymentStatus: "Failed",
                    paymentGateway: "razorpay"
                }
            );

        }

        // Razorpay expects a quick 2xx response.
        return res.sendStatus(200);

    } catch (error) {

        console.error("Razorpay Webhook Error:", error);
        return res.sendStatus(500);

    }
};
