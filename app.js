import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { accountRouter } from "./routes/account.routes.js";
import { transactionRouter } from "./routes/transaction.routes.js";

export const app = express();

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */

//dummy routes
app.get("/", (req, res) => {
  res.send("Welcome to the Banking ledger API services");
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/account", accountRouter);

app.use("/api/v1/transactions", transactionRouter);
