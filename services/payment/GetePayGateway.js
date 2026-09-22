import PaymentGateway from "./PaymentGateway.js";
import { encryptGetePay, parseGetePayResponse } from "../../utils/getepayCrypto.js";
const requiredEnv = (name) => { if (!process.env[name]) throw new Error(`Missing ${name} environment variable.`); return process.env[name]; };
const config = () => ({ mid: requiredEnv("GETEPAY_MID"), terminalId: requiredEnv("GETEPAY_TERMINAL_ID"), key: requiredEnv("GETEPAY_KEY"), iv: requiredEnv("GETEPAY_IV"), url: requiredEnv("GETEPAY_URL") });
const backendUrl = () => (process.env.BACKEND_PUBLIC_URL || "https://pos4u-backend.onrender.com").replace(/\/$/, "");
const getTransactionDate = () => {
    const parts = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
    const v = Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type, p.value]));
    return `${v.weekday} ${v.month} ${v.day} ${v.hour}:${v.minute}:${v.second} IST ${v.year}`;
};
class GetePayGateway extends PaymentGateway {
    async createOrder(data) {
        const c = config(), fees = Number(data.fees);
        if (!Number.isFinite(fees) || fees <= 0) throw new Error("Invalid payment amount.");
        const merchantTransactionId = `POS4U_${data.applicationId}_${Date.now()}`;
        const returnUrl = process.env.GETEPAY_RETURN_URL || `${backendUrl()}/api/payment/getepay/return`;
        const callbackUrl = process.env.GETEPAY_CALLBACK_URL || `${backendUrl()}/api/payment/getepay/callback`;
        const request = {
            mid: c.mid, amount: fees.toFixed(2), merchantTransactionId, transactionDate: getTransactionDate(), terminalId: c.terminalId,
            udf1: String(data.mobile || ""), udf2: String(data.email || ""), udf3: String(data.name || "POS4U Customer"),
            udf4: String(data.applicationId || ""), udf5: String(data.formName || ""), udf6: "", udf7: "", udf8: "", udf9: "web", udf10: "",
            ru: returnUrl, callbackUrl, currency: "INR", paymentMode: "ALL", bankId: "", txnType: "single", productType: "IPG",
            txnNote: `POS4U ${data.formName || "Service"}`, vpa: c.terminalId
        };
        const payload = { mid: c.mid, terminalId: c.terminalId, req: encryptGetePay(JSON.stringify(request), { iv: c.iv, key: c.key }) };
        const response = await fetch(c.url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
        const raw = await response.text();
        let gatewayResponse;
        try { gatewayResponse = JSON.parse(raw); } catch { throw new Error(`GetePay returned non-JSON response (HTTP ${response.status}).`); }
        if (!response.ok) throw new Error(gatewayResponse?.message || `GetePay invoice API failed with HTTP ${response.status}.`);
        if (gatewayResponse?.status && String(gatewayResponse.status).toUpperCase() !== "SUCCESS") throw new Error(gatewayResponse.message || "GetePay rejected the payment request.");
        const encryptedResponse = gatewayResponse.response || gatewayResponse.res;
        if (!encryptedResponse) throw new Error(gatewayResponse.message || "GetePay did not return an encrypted response.");
        const decrypted = parseGetePayResponse(encryptedResponse, { iv: c.iv, key: c.key });
        if (!decrypted?.paymentUrl) throw new Error("GetePay invoice was created but paymentUrl was not returned.");
        return { gateway: "getepay", orderId: merchantTransactionId, merchantTransactionId, paymentId: decrypted.paymentId || "", paymentUrl: decrypted.paymentUrl, token: decrypted.token || "", qrIntent: decrypted.qrIntent || "", qrPath: decrypted.qrPath || decrypted.qrpath || "", amount: Math.round(fees * 100), currency: "INR" };
    }
}
export default GetePayGateway;
