import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addReview, getWorkerReviews, updateReview } from "../controllers/review.controller.js";

const router = express.Router();

router.route("/review").post(isAuthenticated,addReview);
router.route("/review").put(isAuthenticated,updateReview);
router.route("/review/:id").get(getWorkerReviews);

export default router;