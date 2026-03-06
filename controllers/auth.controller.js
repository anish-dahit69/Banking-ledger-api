import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../services/email.service.js";
import { tokenBlackListedModel } from "./../models/tokenBlackListed.model.js";
/**
 * -user register controller
 * -post api/v1/auth/register
 */
export const registerUserController = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    //validate input
    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(422).json({
        success: false,
        message: "User already exists",
      });

    //create new user
    const newUser = await userModel.create({
      email,
      name,
      password,
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );

    //set token in httpOnly cookie
    res.cookie("token", token);

    //send response

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
    //send registration email
    await sendRegistrationEmail(newUser.email, newUser.name);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

/**
 * -user login controller
 * -post api/v1/auth/login
 */
export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //check if user exists
    const user = await userModel.findOne({ email }).select("+password");
    // console.log(user);
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    //comapre password
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );

    //set token in httpOnly cookie
    res.cookie("token", token);

    //send response
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};

/**
 * -user logout controller
 * -post api/v1/auth/logout
 */

export const logoutUserController = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(200).json({ message: "Already logged out" });
  }
  try {
    //store the token in blacklist
    await tokenBlackListedModel.create({ token });
    //clear the token cookie
    res.clearCookie("token");
    

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error logging out user",
      error: error.message,
    });
  }
};
