import Form from "../models/Form.js";
import { parseGetePayResponse } from "../utils/getepayCrypto.js";
const credentials = () => ({ mid: process.env.GETEPAY_MID, terminalId: process.env.GETEPAY_TERMINAL_ID, key: process.env.GETEPAY_KEY, iv: process.env.GETEPAY_IV });
const frontendUrl = () => (process.env.FRONTEND_URL || "https://www.pos4you.co.in").replace(/\/$/, "");
const encryptedResponse = (body, query) => body?.response || body?.res || body?.data?.response || body?.data?.res || query?.response || query?.res || "";
const successStatus = (tx) => [tx?.txnStatus, tx?.paymentStatus].filter(Boolean).some(v => String(v).toUpperCase() === "SUCCESS");
const persistTransaction = async (tx) => {
    const orderId = String(tx?.merchantOrderNo || "").trim();
    if (!orderId) throw new Error("GetePay response does not contain merchantOrderNo.");
    const application = await Form.findOne({ orderId });
    if (!application) throw new Error("No POS4U application matches the GetePay order.");
    if (String(tx.mid) !== String(process.env.GETEPAY_MID)) throw new Error("GetePay MID does not match POS4U configuration.");
    const expected = Number(application.fees), received = Number(tx.txnAmount);
    if (!Number.isFinite(received) || Math.abs(received - expected) > 0.009) throw new Error("GetePay payment amount does not match the application fee.");
    const success = successStatus(tx);
    const update = { paymentGateway: "getepay", paymentId: tx.getepayTxnId || application.paymentId || "", orderId };
    if (success) { update.paymentStatus = "Paid"; update.paidAt = application.paidAt || new Date(); }
    else if (application.paymentStatus !== "Paid") update.paymentStatus = "Failed";
    const updated = await Form.findByIdAndUpdate(application._id, update, { new: true });
    return { application: updated, success, transaction: tx };
};
export const handleGetePayCallback = async (req, res) => {
    try {
        const encrypted = encryptedResponse(req.body, req.query);
        if (!encrypted) return res.status(400).json({ success: false, message: "GetePay encrypted response is missing." });
        const tx = parseGetePayResponse(encrypted, credentials());
        const result = await persistTransaction(tx);
        console.log("GetePay callback:", { orderId: tx.merchantOrderNo, txnId: tx.getepayTxnId, status: tx.txnStatus, amount: tx.txnAmount });
        return res.status(200).json({ success: result.success, message: result.success ? "Payment processed successfully." : "Payment received but was not successful." });
    } catch (error) { console.error("GetePay Callback Error:", error); return res.status(400).json({ success: false, message: error.message || "Unable to process GetePay callback." }); }
};
export const handleGetePayReturn = async (req, res) => {
    try {
        const encrypted = encryptedResponse(req.body, req.query);
        if (!encrypted) throw new Error("Payment response was not received.");
        const tx = parseGetePayResponse(encrypted, credentials());
        const result = await persistTransaction(tx);
        const target = new URL(`${frontendUrl()}/payment-result`);
        target.searchParams.set("status", result.success ? "success" : "failed");
        target.searchParams.set("applicationId", String(result.application._id));
        if (result.application.paymentId) target.searchParams.set("txnId", result.application.paymentId);
        return res.redirect(target.toString());
    } catch (error) {
        console.error("GetePay Return Error:", error);
        const target = new URL(`${frontendUrl()}/payment-result`);
        target.searchParams.set("status", "failed");
        target.searchParams.set("message", error.message || "Payment verification failed.");
        return res.redirect(target.toString());
    }
};
export const getGetePayHealth = async (req, res) => res.json({ success: true, gateway: "getepay", configured: Boolean(process.env.GETEPAY_MID && process.env.GETEPAY_TERMINAL_ID && process.env.GETEPAY_KEY && process.env.GETEPAY_IV && process.env.GETEPAY_URL), encryptionEncoding: process.env.GETEPAY_ENCRYPTION_ENCODING || "hex" });
