"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
const DATABASE_URL = "db-URL";
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
}
mongoose_1.default
    .connect(DATABASE_URL, {
    dbName: 'FinAppDB',
})
    .then(() => {
    console.log('✅ Connected to MongoDB');
    seed();
})
    .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
});
const filePath = path_1.default.join(__dirname, 'transactions.json');
const transactionsRaw = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
const transactionsData = transactionsRaw.map((t) => ({
    amount: t.amount,
    category: t.category,
    status: t.status,
    user_id: t.user_id,
    user_profile: t.user_profile,
    date: new Date(t.date),
}));
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.Transaction.insertMany(transactionsData);
            console.log('✅ Transactions seeded successfully.');
        }
        catch (error) {
            console.error('❌ Error seeding transactions:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
