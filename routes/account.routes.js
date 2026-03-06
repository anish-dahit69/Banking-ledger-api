import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createAccountController,
  getUserAccountController,
  getAllAccount,
  getBalanceController,
} from "../controllers/account/account.controller.js";

export const accountRouter = express.Router();

accountRouter.use(authMiddleware);

accountRouter.post("/create-account", createAccountController);
accountRouter.get("/getUserAccount", getUserAccountController);
accountRouter.get("/getAllAccounts", getAllAccount);
accountRouter.get("/balance/:accountId", getBalanceController);
