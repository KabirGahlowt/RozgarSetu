import express from "express";
import { postJob, getAllJobs, getJobById } from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isWorkerAuthenticated from "../middlewares/isWorkerAuthenticated.js";

const router = express.Router();

router.route("/postJob").post(isAuthenticated,postJob);
router.route("/getAllJobs").get(isWorkerAuthenticated,getAllJobs);
router.route("/getJobById/:id").get(isWorkerAuthenticated,getJobById);

export default router;