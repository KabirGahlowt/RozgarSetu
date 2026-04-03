import express from "express";
import { login, logout, register, getDashboard, getClientById } from "../controllers/admin.controller.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/dashboard").get(isAdminAuthenticated, getDashboard);
router.route("/client/:id").get(isAdminAuthenticated, getClientById);

export default router;