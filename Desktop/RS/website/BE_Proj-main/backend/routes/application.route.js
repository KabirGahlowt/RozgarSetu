import express from "express";
import { applyJobs, getAppliedJobs, getApplicants, updateStatus, hireWorker, getHireRequestsForWorker, getHiredWorkersForClient, updateHireStatus } from "../controllers/application.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isWorkerAuthenticated from "../middlewares/isWorkerAuthenticated.js";

const router = express.Router();

router.route("/applyJob/:id").get(isWorkerAuthenticated,applyJobs);
router.route("/getAppliedJobs").get(isWorkerAuthenticated,getAppliedJobs);
router.route("/getApplicants/:id").get(isAuthenticated,getApplicants);
router.route("/status/:id/update").post(isAuthenticated,updateStatus);
router.route("/hireWorker/:id").post(isAuthenticated,hireWorker);
router.route("/worker/requests").get(isWorkerAuthenticated,getHireRequestsForWorker);
router.route("/client/hires").get(isAuthenticated,getHiredWorkersForClient);
router.route("/hire/status/:id").post(isWorkerAuthenticated,updateHireStatus);
//status is required that needs to be inputted, it can be "Pending" or "Completed" 

export default router;
