import { accountModel } from "../../models/account.model.js";

export const createAccountController = async (req, res) => {
  const user = req.user;
  // console.log(user);
  try {
    const account = await accountModel.create({
      user: user._id,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized", error: error.message });
  }
};

/**
 * get user account
 */

export const getUserAccountController = async (req, res) => {
  const user = req.user._id;
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  const account = await accountModel.findOne({
    user,
  });
  if (!account)
    return res
      .status(404)
      .json({ success: false, message: "Account not found" });

  res.status(200).json({
    success: true,
    message: "Account fetched successfully",
    account,
  });
};

//get all account

export const getAllAccount = async (req, res) => {
  const account = await accountModel.find();
  if (!account)
    return res.status(400).json({
      success: false,
      message: "No account found",
    });
  const totalAccount = account.length;
  res.status(200).json({
    success: true,
    message: "Account fetched sucessfully",
    total: totalAccount,
    account,
  });
};

//get balance

export const getBalanceController = async (req, res) => {
  const { accountId } = req.params;
  const account = await accountModel.findOne({
    _id: accountId,
  });
  if (!account)
    return res
      .status(404)
      .json({ success: false, message: "Account not found" });

  const balance = await account.getBalance();
  res.status(200).json({
    success: true,
    message: "Balance fetched successfully",
    balance,
  });
};
