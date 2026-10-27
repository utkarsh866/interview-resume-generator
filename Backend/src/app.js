import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.js";
import cors from "cors";
import interviewRouter from "./routes/interview.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const rawFrontendUrl = process.env.FRONTEND_URL;
const frontendUrl = rawFrontendUrl ? rawFrontendUrl.replace(/\/+$/, "") : null;

const allowedOrigins = [
    "http://localhost:5173",
    frontendUrl
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman, curl) or matching allowed origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
            return callback(null, true);
        }
        // Automatically allow any onrender.com origin
        if (origin.endsWith(".onrender.com")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

export default app;
