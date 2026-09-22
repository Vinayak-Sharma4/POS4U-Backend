import PaymentGateway from "./PaymentGateway.js";
import { encryptGetePay, parseGetePayResponse } from "../../utils/getepayCrypto.js";
const requiredEnv = (name) => { if (!process.env[name]) throw new Error(`Missing ${name} environment variable.`); return process.env[name]; };
const config = () => ({ mid: requiredEnv("GETEPAY_MID"), terminalId: requiredEnv("GETEPAY_TERMINAL_ID"), key: requiredEnv("GETEPAY_KEY"), iv: requiredEnv("GETEPAY_IV"), url: requiredEnv("GETEPAY_URL") });
const backendUrl = () => (process.env.BACKEND_PUBLIC_URL || "https://pos4u-backend.onrender.com").replace(/\/$/, "");
const getTransactionDate = () => {
    // GetePay's documented format uses English 3-letter month names (e.g. Sep, Oct).
    // en-IN can emit "Sept", which is not the documented format.
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
    const v = Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type, p.value]));
    return `${v.weekday} ${v.month} ${v.day} ${v.hour}:${v.minute}:${v.second} IST ${v.year}`;
};
class GetePayGateway extends PaymentGateway {
    async createOrder(data) {
        const c = config(), fees = Number(data.fees);
        if (!Number.isFinite(fees) || fees <= 0) throw new Error("Invalid payment amount.");
        // Keep the gateway order number short and gateway-safe (letters/numbers only).
        const merchantTransactionId = `POS4U${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
        const returnUrl = process.env.GETEPAY_RETURN_URL || `${backendUrl()}/api/payment/getepay/return`;
        const callbackUrl = process.env.GETEPAY_CALLBACK_URL || `${backendUrl()}/api/payment/getepay/callback`;
        const request = {
            mid: c.mid, amount: fees.toFixed(2), merchantTransactionId, transactionDate: getTransactionDate(), terminalId: c.terminalId,
            udf1: String(data.mobile || ""),
            udf2: String(data.email || process.env.GETEPAY_MERCHANT_EMAIL || process.env.CONTACT_EMAIL || ""),
            udf3: String(data.name || "POS4U Customer"),
            // Keep optional UDFs empty until the bank confirms a field mapping.
            // udf6 is reserved by GetePay for split payments.
            udf4: "", udf5: "", udf6: "", udf7: "", udf8: "", udf9: "", udf10: "",
            ru: returnUrl, callbackUrl, currency: "INR", paymentMode: "ALL", bankId: "", txnType: "single", productType: "IPG",
            txnNote: `POS4U ${data.formName || "Service"}`, vpa: c.terminalId
        };
        if (!request.udf1) throw new Error("GetePay requires a mobile number (udf1).");
        if (!request.udf2) throw new Error("GetePay requires an email value (udf2). Configure GETEPAY_MERCHANT_EMAIL or CONTACT_EMAIL.");
        if (!request.ru) throw new Error("GetePay return URL is not configured.");
        if (!request.callbackUrl) throw new Error("GetePay callback URL is not configured.");
        const requestJson = JSON.stringify(request);
        const encryptedRequest = encryptGetePay(requestJson, { iv: c.iv, key: c.key });
        const payload = { mid: c.mid, terminalId: c.terminalId, req: encryptedRequest };

        console.log("GetePay request metadata:", {
            url: c.url,
            midConfigured: Boolean(c.mid),
            terminalConfigured: Boolean(c.terminalId),
            amount: request.amount,
            merchantTransactionId,
            transactionDate: request.transactionDate,
            udf1Present: Boolean(request.udf1),
            udf2Present: Boolean(request.udf2),
            udf3Present: Boolean(request.udf3),
            ru: request.ru,
            callbackUrl: request.callbackUrl,
            paymentMode: request.paymentMode,
            txnType: request.txnType,
            productType: request.productType,
            encryptedRequestLength: encryptedRequest.length
        });

        const response = await fetch(c.url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
        const raw = await response.text();
        let gatewayResponse;
        try { gatewayResponse = JSON.parse(raw); } catch { throw new Error(`GetePay returned non-JSON response (HTTP ${response.status}).`); }
        console.log("GetePay response metadata:", {
            httpStatus: response.status,
            status: gatewayResponse?.status ?? null,
            message: gatewayResponse?.message ?? null,
            mid: gatewayResponse?.mid ?? null,
            terminalIdPresent: Boolean(gatewayResponse?.terminalId),
            responsePresent: Boolean(gatewayResponse?.response || gatewayResponse?.res)
        });

        if (!response.ok) throw new Error(gatewayResponse?.message || `GetePay invoice API failed with HTTP ${response.status}.`);
        if (gatewayResponse?.status && String(gatewayResponse.status).toUpperCase() !== "SUCCESS") {
            const statusText = String(gatewayResponse.status);
            const messageText = gatewayResponse.message || "GetePay rejected the payment request.";
            throw new Error(`GetePay rejected the payment request (${statusText}): ${messageText}`);
        }
        const encryptedResponse = gatewayResponse.response || gatewayResponse.res;
        if (!encryptedResponse) throw new Error(gatewayResponse.message || "GetePay did not return an encrypted response.");
        const decrypted = parseGetePayResponse(encryptedResponse, { iv: c.iv, key: c.key });
        if (!decrypted?.paymentUrl) throw new Error("GetePay invoice was created but paymentUrl was not returned.");
        return { gateway: "getepay", orderId: merchantTransactionId, merchantTransactionId, paymentId: decrypted.paymentId || "", paymentUrl: decrypted.paymentUrl, token: decrypted.token || "", qrIntent: decrypted.qrIntent || "", qrPath: decrypted.qrPath || decrypted.qrpath || "", amount: Math.round(fees * 100), currency: "INR" };
    }
}
export default GetePayGateway;
