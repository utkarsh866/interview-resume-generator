import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.js";
import cors from "cors";
import interviewRouter from "./routes/interview.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, curl) or if in allowed list
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
            return callback(null, true);
        }
        return callback(null, origin);
    },
    credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

export default app;
