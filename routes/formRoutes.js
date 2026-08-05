import express from "express";

import upload from "../middleware/upload.js";

import { createForm } from "../controllers/formController.js";

const router = express.Router();

router.post(
    "/",
    upload.single("document"),
    createForm
);

export default router;