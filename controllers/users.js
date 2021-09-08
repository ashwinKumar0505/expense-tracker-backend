import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser)
      return res
        .status(404)
        .json({ message: "No User Exists with this Email-id. Please Sign-up" });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect)
      return res
        .status(400)
        .json({ message: "Invalid password. Please Enter correct password" });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "accessToken",
      { expiresIn: "7d" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Error in signing in." });
  }
};

export const signUp = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser)
      return res.status(404).json({ message: "Email Id already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new UserModel({
      userName: name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      "accessToken",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Error in signing up." });
  }
};
