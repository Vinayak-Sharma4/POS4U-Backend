import crypto from "crypto";
const getMasterKey = (iv, ivKey) => {
    if (!iv || !ivKey) throw new Error("GetePay encryption key/IV is not configured.");
    return crypto.createHash("sha256").update(`${ivKey}${iv}`, "utf8").digest("base64");
};
export const encryptGetePay = (plainText, { iv, key }) => {
    const masterKey = getMasterKey(iv, key);
    const salt = crypto.randomBytes(16);
    const cipherIv = crypto.randomBytes(12);
    const derivedKey = crypto.pbkdf2Sync(masterKey, salt, 65535, 32, "sha512");
    const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, cipherIv);
    const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const combined = Buffer.concat([salt, cipherIv, ciphertext, cipher.getAuthTag()]);
    return String(process.env.GETEPAY_ENCRYPTION_ENCODING || "hex").toLowerCase() === "base64"
        ? combined.toString("base64") : combined.toString("hex").toUpperCase();
};
export const decryptGetePay = (cipherText, { iv, key }) => {
    if (!cipherText) throw new Error("GetePay encrypted response is empty.");
    const masterKey = getMasterKey(iv, key);
    const normalized = String(cipherText).trim();
    const combined = /^[0-9a-fA-F]+$/.test(normalized) && normalized.length % 2 === 0
        ? Buffer.from(normalized, "hex") : Buffer.from(normalized, "base64");
    if (combined.length < 44) throw new Error("Invalid GetePay encrypted response length.");
    const salt = combined.subarray(0, 16), cipherIv = combined.subarray(16, 28);
    const ciphertextAndTag = combined.subarray(28);
    const authTag = ciphertextAndTag.subarray(-16), ciphertext = ciphertextAndTag.subarray(0, -16);
    const derivedKey = crypto.pbkdf2Sync(masterKey, salt, 65535, 32, "sha512");
    const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, cipherIv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
};
export const parseGetePayResponse = (encryptedResponse, credentials) => {
    const plaintext = decryptGetePay(encryptedResponse, credentials);
    try { return JSON.parse(plaintext); }
    catch { throw new Error("GetePay response decrypted but is not valid JSON."); }
};
