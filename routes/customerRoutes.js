import express from "express";
import upload from "../middleware/upload.js";
import { createCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.post(
    "/",
    upload.single("document"),
    createCustomer
);

export default router;