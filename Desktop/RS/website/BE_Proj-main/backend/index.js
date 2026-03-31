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
const corsOption = {
    origin :["http://localhost:5173","http://localhost:8000"],
    credentials : true
}
app.use(cors(corsOption));

const PORT = process.env.PORT || 3000;

//api's
app.use("/api/v1/user",userRoute);
app.use("/api/v1/worker",workerRoute); 
app.use("/api/v1/job",jobRoute);
app.use("/api/v1/application",applicationRoute); 
app.use("/api/v1/admin",adminRoute);
app.use("/api/v1/review",reviewRoute);

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at PORT ${PORT}`);
})