import "dotenv/config";
import dotenv from "dotenv";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import connectDB from "./config/db.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import formRoutes from "./routes/formRoutes.js";

import paymentRoutes from "./routes/paymentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

console.log("Payment Routes Imported");

// dotenv.config();
// connectDB();
dotenv.config();

const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log(`Server running on ${PORT}`);

        });

    } catch (err) {

        console.log(err);

    }

};

const app = express();

// ==========================================
// SECURITY HEADERS
// ==========================================

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        },

        referrerPolicy: {
            policy: "strict-origin-when-cross-origin"
        }
    })
);


// ==========================================
// CORS POLICY
// ==========================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://www.pos4you.co.in",
    "https://pos4you.co.in"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header
            // such as server-to-server requests / health checks.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: false,

        optionsSuccessStatus: 204
    })
);


// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json());

console.log("=================================");
console.log("POS4U ENVIRONMENT CHECK");
console.log("=================================");

console.log(
    "GMAIL_USER:",
    process.env.GMAIL_USER || "MISSING"
);

console.log(
    "GMAIL_APP_PASSWORD:",
    process.env.GMAIL_APP_PASSWORD
        ? "LOADED"
        : "MISSING"
);

console.log(
    "CONTACT_EMAIL:",
    process.env.CONTACT_EMAIL || "MISSING"
);

console.log(
    "TWILIO_ACCOUNT_SID:",
    process.env.TWILIO_ACCOUNT_SID
        ? "LOADED"
        : "MISSING"
);

console.log(
    "TWILIO_AUTH_TOKEN:",
    process.env.TWILIO_AUTH_TOKEN
        ? "LOADED"
        : "MISSING"
);

console.log(
    "TWILIO_PHONE_NUMBER:",
    process.env.TWILIO_PHONE_NUMBER || "MISSING"
);

console.log("=================================");


/* =======================
   Global Middlewares
======================= */

app.use(express.json());


app.use(express.urlencoded({ extended: true }));


app.use(compression());

app.use(morgan("dev"));

/* =======================
   Routes
======================= */

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/forms", formRoutes);
console.log("Mounting Payment Routes");
app.use("/api/payment",paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "POS4U Backend Running Successfully"
    });
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on ${PORT}`);
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

startServer();