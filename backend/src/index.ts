import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./db";
import zod from 'zod';
import bcrypt from 'bcrypt';
import jwt, { sign } from 'jsonwebtoken'
import { authMiddleware } from "./middleware";
import { getTransactions } from "./controllers/transactions";

dotenv.config();
const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json());

// Connecting to MongoDB
mongoose.connect(process.env.DATABASE_URL!, {
    dbName: "FinAppDB",
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});


app.get('/', (req: Request, res: Response) => {
    res.json("Working!!");
});

//signup data validation with zod
const signupBody = zod.object({
    name: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(8),
    designation: zod.string(),
    phone: zod.string().max(10),
});

//signup route
app.post('/auth/signup', async (req: Request, res: Response): Promise<any> => {
    try {
        const result = signupBody.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ message: "Invalid Input", errors: result.error.flatten() });
        }

        const { name, email, password, designation, phone } = result.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!email || !hashedPassword || !name || !designation || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await UserModel.create({ email, password: hashedPassword, name, designation, phone });

        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET!);

        return res.json({ message: "Signup Successfull!", token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
});

//login data validation with zod
const loginBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8),
});

//login route
app.post('/auth/login', async (req: Request, res: Response): Promise<any> => {
  const result = loginBody.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid Input", errors: result.error.flatten() });
  }

  const { email, password } = result.data;

  const user = await UserModel.findOne({ email });

  if (!user || !user.password) {
    return res.status(404).json({ message: "User Not Found" });
  }

  // ✅ CORRECT: Compare plain password to stored hash
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const jwtToken = await sign({ id: user._id }, process.env.JWT_SECRET!);

  return res.status(200).json({ message: "Login successful", token: jwtToken });
});


app.get('/dashboard', authMiddleware, (req: Request, res: Response) => {
    res.send('Middleware Working!')
})

//get transactions data
app.get('/transactions', authMiddleware, getTransactions);

// Start server
app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});