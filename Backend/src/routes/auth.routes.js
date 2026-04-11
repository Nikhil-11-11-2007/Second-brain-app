import express from "express";
import { register, login, getMe, refresh } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js"

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/get-me", auth, getMe);
authRouter.get("/refresh", refresh)

export default authRouter;