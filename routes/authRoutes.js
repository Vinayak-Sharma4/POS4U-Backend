import express from "express";

import {
    login,
    signup,
    approveSignup,
    rejectSignup,
    forgotPassword,
    resetPassword,
    changePassword
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

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

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/reset-password/:token",
    resetPassword
);

/*
========================================
CHANGE PASSWORD
========================================
*/

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);

export default router;