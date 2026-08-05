import express from "express";
console.log("paymentRoutes Loaded");

import { createOrder }
from "../controllers/paymentController.js";



const router = express.Router();

router.post("/create-order", createOrder);

router.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Payment Route Working"

    });

});

export default router;