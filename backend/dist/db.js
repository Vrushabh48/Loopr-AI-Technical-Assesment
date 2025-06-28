"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, unique: true },
    password: String,
    name: String,
    designation: String,
    phone: String
});
const transactionSchema = new mongoose_1.default.Schema({
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
exports.UserModel = mongoose_1.default.model("User", userSchema);
exports.Transaction = mongoose_1.default.model('Transaction', transactionSchema);
