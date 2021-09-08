import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

export const UserModel = mongoose.model("user", UserSchema);
