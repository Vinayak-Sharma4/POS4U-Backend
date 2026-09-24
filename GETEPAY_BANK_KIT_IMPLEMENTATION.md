# POS4U GetePay Bank-Kit Implementation

This backend uses the encryption/decryption implementation supplied in the GetePay React PG Kit provided by the bank.

## Generate Invoice

Request plaintext is JSON-stringified and encrypted with:

1. `SHA-256(ivKey + iv)`
2. Base64 encoding of the SHA-256 digest to form `mKey`
3. Random 16-byte salt
4. Random 12-byte AES-GCM IV
5. PBKDF2-HMAC-SHA512, 65,535 iterations, 32-byte derived key, using UTF-8 bytes of `mKey`
6. AES-256-GCM with 128-bit authentication tag
7. Concatenate `salt + iv + ciphertext + tag`
8. Base64 encode the final bytes for the `req`/`res` transport value

The supplied runnable React/Node kit returns Base64 from `bytesToBase64()`. The supplied requery sample is also Base64. Therefore the implementation does not use the previous POS4U hex transport mode.

## Response

The backend accepts either `response` or `res` from GetePay and decrypts it using the same bank-kit algorithm.

## Frontend

The POS4U frontend does not contain the GetePay key/IV and does not perform encryption. It submits the application ID to the backend. The backend remains responsible for the GetePay request, encryption, response decryption, and payment validation.

## Environment

Required GetePay variables:

- `GETEPAY_MID`
- `GETEPAY_TERMINAL_ID`
- `GETEPAY_KEY`
- `GETEPAY_IV`
- `GETEPAY_URL`
- `GETEPAY_RETURN_URL`
- `GETEPAY_CALLBACK_URL`

`GETEPAY_ENCRYPTION_ENCODING` is obsolete in this implementation and is not read by the code.
