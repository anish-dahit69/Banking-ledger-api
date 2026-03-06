import express from "express";
import {
  authMiddleware,
  systemUserMiddleware,
} from "../middlewares/auth.middleware.js";
import { initialFundTransaction } from "../controllers/transaction/initialTransaction.controller.js";
import { createTransaction } from "../controllers/transaction/transaction.controller.js";

export const transactionRouter = express.Router();
transactionRouter.use(authMiddleware);

// Define transaction routes here
// only system users can access transaction routes
transactionRouter.post(
  "/system/initial-fund",
  systemUserMiddleware,
  initialFundTransaction,
); //dummy route to initialize fund for system user, can be removed later when we have a proper way to fund system user account

// Example route for creating a transaction
transactionRouter.post("/transfer", createTransaction);
