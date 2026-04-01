/*import express from "express";
import { login, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/profile/update").post(isAuthenticated,updateProfile);

export default router;*/

import express from "express";
import { loginWorker, logoutWorker, registerWorker, updateWorkerProfile, getAllWorkers, getWorkerById, updateWorkerById, getAllWorkersForBrowse } from "../controllers/worker.controller.js";
import isAuthenticated from "../middlewares/isWorkerAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";
import isWorkerAuthenticated from "../middlewares/isWorkerAuthenticated.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

router.route("/register").post(singleUpload,registerWorker);
router.route("/login").post(loginWorker);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateWorkerProfile);
router.route("/logout").get(logoutWorker);
router.route("/getAllWorkers").get(getAllWorkers);
router.route("/getWorkerById/:id").get(optionalAuth, getWorkerById);
router.route("/profile/update/:id").put(isAdminAuthenticated,singleUpload,updateWorkerById);
router.route("/getAllWorkersForBrowse").get(isAuthenticated,getAllWorkersForBrowse);

export default router;
