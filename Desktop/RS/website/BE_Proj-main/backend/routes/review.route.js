import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addReview, getWorkerReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.route("/review").post(isAuthenticated,addReview);
router.route("/review/:id").get(getWorkerReviews);

export default router;