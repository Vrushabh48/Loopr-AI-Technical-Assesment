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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const middleware_1 = require("./middleware");
const transactions_1 = require("./controllers/transactions");
const analytics_1 = require("./controllers/analytics");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
// CORS with credentials
app.use((0, cors_1.default)({
    origin: "https://penta-financial-analytics.vercel.app",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Connecting to MongoDB
mongoose_1.default
    .connect(process.env.DATABASE_URL, {
    dbName: "FinAppDB",
})
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
// Zod validation for signup
const signupBody = zod_1.default.object({
    name: zod_1.default.string().min(1),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8),
    designation: zod_1.default.string(),
    phone: zod_1.default.string().max(10),
});
// Signup route
app.post("/auth/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = signupBody.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid Input",
                errors: result.error.flatten(),
            });
        }
        const { name, email, password, designation, phone } = result.data;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10); //password hashing
        const user = yield db_1.UserModel.create({
            email,
            password: hashedPassword,
            name,
            designation,
            phone,
        });
        //generating the jwt token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        //setting the cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 1000,
        });
        return res.status(201).json({ message: "Signup Successful!" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
}));
// Zod validation for login
const loginBody = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8),
});
// Login route
app.post("/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = loginBody.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Invalid Input",
            errors: result.error.flatten(),
        });
    }
    const { email, password } = result.data;
    const user = yield db_1.UserModel.findOne({ email });
    if (!user || !user.password) {
        return res.status(404).json({ message: "User Not Found" });
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Login successful" });
}));
// Logout route
app.post("/auth/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "none",
    });
    res.json({ message: "Logged out" });
});
// Protected routes ------>
app.get("/dashboard", middleware_1.authMiddleware, (req, res) => {
    res.send("Middleware Working!");
});
// Transactions route
app.get("/transactions", middleware_1.authMiddleware, transactions_1.getTransactions);
//analytics route
app.get("/analytics", middleware_1.authMiddleware, analytics_1.getAnalytics);
app.get('/profile', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = yield db_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            name: user.name,
            email: user.email,
            designation: user.designation,
            phone: user.phone
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}));
// Start server
app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});
