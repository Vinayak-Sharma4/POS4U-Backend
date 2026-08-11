import express from "express";

import {
    login,
    signup,
    approveSignup,
    rejectSignup
} from "../controllers/authController.js";

const router = express.Router();

router.post(
    "/login",
    login
);

router.post(
    "/signup",
    signup
);

router.get(
    "/signup/approve/:token",
    approveSignup
);

router.get(
    "/signup/reject/:token",
    rejectSignup
);

export default router;