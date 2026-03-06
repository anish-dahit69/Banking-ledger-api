import mongoose from "mongoose";
import { accountModel } from "../../models/account.model.js";
import { transactionModel } from "../../models/transaction.model.js";
import { ledgerModel } from "../../models/ledger.model.js";
import { sendTransactionEmail } from "../../services/email.service.js";

export const createTransaction = async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  // Implement transaction logic here, including validation, balance checks, and database operations
  // Use idempotencyKey to ensure that duplicate transactions are not processed

  //validate request first
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  //validate  fromAccount and toAccount are not the same
  if (fromAccount === toAccount) {
    return res.status(400).json({
      success: false,
      message: "From and To accounts cannot be the same",
    });
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a number greater than 0",
    });
  }

  // Accept account id directly, and fall back to user id lookup for compatibility.
  const fromAccountData = await accountModel.findOne({
    $or: [{ _id: fromAccount }, { user: fromAccount }],
  });
  if (!fromAccountData)
    return res.status(404).json({
      success: false,
      message: "From account not found",
    });
  const toAccountData = await accountModel.findOne({
    $or: [{ _id: toAccount }, { user: toAccount }],
  });
  if (!toAccountData)
    return res.status(404).json({
      success: false,
      message: "To account not found",
    });

  // validate idempotencyKey
  const isTransactionExist = await transactionModel.findOne({ idempotencyKey });
  if (isTransactionExist) {
    switch (isTransactionExist.status) {
      case "PENDING":
        return res.status(200).json({
          message: "Transaction is still pending",
          transaction: isTransactionExist,
        });
      case "COMPLETED":
        return res.status(200).json({
          message: "Transaction has already been completed",
          transaction: isTransactionExist,
        });
      case "FAILED":
        return res.status(200).json({
          message: "Transaction has already failed",
          transaction: isTransactionExist,
        });
      case "REVERSED":
        return res.status(200).json({
          message: "Transaction has already been reversed",
          transaction: isTransactionExist,
        });
    }
  }

  //check account status
  if (
    fromAccountData.status !== "ACTIVE" ||
    toAccountData.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      success: false,
      message: "Both accounts must be active to perform a transaction",
    });
  }

  //derive sender balance from ledger

  const balance = await fromAccountData.getBalance();
  if (balance < parsedAmount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${parsedAmount}`,
    });
  }

  let session;
  try {
    //create transaction and ledger entries here
    session = await mongoose.startSession();
    session.startTransaction();
    const transaction = new transactionModel({
      fromAccount: fromAccountData._id,
      toAccount: toAccountData._id,
      amount: parsedAmount,
      idempotencyKey,
    });

    await ledgerModel.create(
      [
        {
          account: fromAccountData._id,
          amount: parsedAmount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: toAccountData._id,
          amount: parsedAmount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );
    transaction.status = "COMPLETED";
    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Transaction completed successfully",
      transaction,
    });

    //send email
    await sendTransactionEmail(
      req.user.email,
      req.user.name,
      parsedAmount,
      toAccountData._id,
    );
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the transaction",
      error: error.message,
    });
  }
};
