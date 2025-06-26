import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  designation: String,
  phone: String
});

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['Revenue', 'Expense'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  user_profile: {
    type: String,
  }
});

export const UserModel = mongoose.model("User", userSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);