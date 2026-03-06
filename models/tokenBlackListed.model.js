import mongoose from "mongoose";

const tokenBlackListedSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required to blackListed"],
      unique: [true, "Token is already blackListed"],
    },
  },
  { timestamps: true },
);

tokenBlackListedSchema.index({
  createdAt: 1,
  expireAfterSeconds: 60 * 60 * 24 * 3, //3 days
});

export const tokenBlackListedModel = mongoose.model(
  "TokenBlackListed",
  tokenBlackListedSchema,
);
