import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "POS4U API Working",
        serverTime: new Date(),
    });
});

export default router;