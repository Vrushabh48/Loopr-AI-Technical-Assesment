import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  designation: String,
  phone: String
});

export const UserModel = mongoose.model("User", userSchema);
