/*import express from "express";
import { login, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/profile/update").post(isAuthenticated,updateProfile);

export default router;*/

import express from "express";
import { loginWorker, logoutWorker, registerWorker, updateWorkerProfile, getAllWorkers, getWorkerById } from "../controllers/worker.controller.js";
import isAuthenticated from "../middlewares/isWorkerAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload,registerWorker);
router.route("/login").post(loginWorker);
router.route("/profile/update").post(isAuthenticated, updateWorkerProfile);
router.route("/logout").get(logoutWorker);
router.route("/getAllWorkers").get(getAllWorkers);
router.route("/getWorkerById/:id").get(getWorkerById);

export default router;
