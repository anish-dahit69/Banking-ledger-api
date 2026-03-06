import express from "express";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
} from "../controllers/auth.controller.js";

export const authRouter = express.Router();

/*post api/v1/auth/register*/
authRouter.post("/register", registerUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/logout", logoutUserController);