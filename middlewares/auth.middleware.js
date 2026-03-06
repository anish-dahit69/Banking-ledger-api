import { tokenBlackListedModel } from "../models/tokenBlackListed.model.js";
import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  //check if token is blacklisted

  const isBlackListed = await tokenBlackListedModel.findOne({
    token,
  });
  if (isBlackListed) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    req.user = user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized", error: error.message });
  }
};

/**
 * middleware to check if the user is a system user (admin)
 * only system users can access certain routes (e.g. user management, account management)
 */
export const systemUserMiddleware = async (req, res, next) => {
  try {
    //check if user is system user
    if (!req.user.systemUser) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Access is denied" });
    }
    next();
  } catch (error) {
    res
      .status(403)
      .json({ success: false, message: "Forbidden", error: error.message });
  }
};
