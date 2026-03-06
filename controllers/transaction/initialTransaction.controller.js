import mongoose from "mongoose";
import { transactionModel } from "../../models/transaction.model.js";
import { ledgerModel } from "../../models/ledger.model.js";
import { accountModel } from "../../models/account.model.js";


//create initial fund transaction from the system to the user's account

export const initialFundTransaction = async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  // Step 1: Validate the request body
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      message: "Missing either toAccount, amount or idempotencyKey",
    });
  }

  // Step 2: Check if the toAccount exists
  const isExistToAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!isExistToAccount) {
    return res.status(404).json({
      success: false,
      message: "To account not found",
    });
  }

  // Step 3: assume the system account
  const systemAccount = await accountModel.findOne({
    user: req.user._id,
  });
  if (!systemAccount) {
    return res.status(404).json({
      success: false,
      message: "System account not found",
    });
  }

  // Step 4: Create a transaction record with status "pending"
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //create a transaction record with status "pending" and use new keyword to save it in memory so that transaction get id otherwise it won't.
    const transaction = new transactionModel({
      fromAccount: systemAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    //create debit ledger entries for the transaction

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: systemAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    //create credit ledger entries for the transaction

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
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
      message: "Initial fund transaction successful",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the transaction",
      error: error.message,
    });
  }
};
