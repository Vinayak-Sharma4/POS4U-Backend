// import express from "express";
// console.log("paymentRoutes Loaded");

// import { createOrder }
// from "../controllers/paymentController.js";

// import { verifyPayment } from "../controllers/paymentVerificationController.js";



// const router = express.Router();

// router.post("/create-order", createOrder);

// router.post("/verify", verifyPayment);

// router.get("/", (req, res) => {

//     res.json({

//         success: true,

//         message: "Payment Route Working"

//     });

// });

// export default router;

import express from "express";
console.log("paymentRoutes Loaded");

import { createOrder } from "../controllers/paymentController.js";
import { verifyPayment } from "../controllers/paymentVerificationController.js";
import { handleRazorpayWebhook } from "../controllers/paymentWebhookController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", handleRazorpayWebhook);

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Payment Route Working"
    });
});

export default router;
