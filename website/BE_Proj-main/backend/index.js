import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import workerRoute from "./routes/worker.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import adminRoute from "./routes/admin.route.js";
import reviewRoute from "./routes/review.route.js";

dotenv.config({});

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const defaultOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
];
const extraOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Allow Vite dev from LAN IPs (e.g. phone) when not using proxy */
function isAllowedCorsOrigin(origin) {
    if (!origin) return true;
    const merged = [...defaultOrigins, ...extraOrigins];
    if (merged.includes(origin)) return true;
    try {
        const u = new URL(origin);
        const port = u.port || (u.protocol === "https:" ? "443" : "80");
        if (port !== "5173" && port !== "5174") return false;
        const h = u.hostname;
        if (h === "localhost" || h === "127.0.0.1") return true;
        if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
        if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
        if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    } catch {
        return false;
    }
    return false;
}

const corsOption = {
    origin: (origin, callback) => {
        callback(null, isAllowedCorsOrigin(origin));
    },
    credentials: true,
};
app.use(cors(corsOption));

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

//api's
app.use("/api/v1/user",userRoute);
app.use("/api/v1/worker",workerRoute); 
app.use("/api/v1/job",jobRoute);
app.use("/api/v1/application",applicationRoute); 
app.use("/api/v1/admin",adminRoute);
app.use("/api/v1/review",reviewRoute);

app.listen(PORT, HOST, () => {
    connectDB();
    console.log(`Server running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT} (listening on ${HOST})`);
});