import mongoose from "mongoose";

const transactionalSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account must be belong to a from account"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account must be belong to a to account"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount must be required"],
      min: [0, "Amount must be greater than or equal to 0"],
    },
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        messages:
          "Status must be either PENDING, COMPLETED, FAILED or REVERSED",
      },
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const transactionModel = mongoose.model(
  "Transaction",
  transactionalSchema,
);
