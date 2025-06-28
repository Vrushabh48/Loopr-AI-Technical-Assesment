import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./db";
import zod from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import { authMiddleware } from "./middleware";
import { getTransactions } from "./controllers/transactions";
import { getAnalytics } from "./controllers/analytics";

dotenv.config();
const app = express();
const port = 3000;

// This should come BEFORE any routes
app.use(
  cors({
    origin: "https://penta-financial-analytics.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());


app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.DATABASE_URL!, {
    dbName: "FinAppDB",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Zod validation schema
const signupBody = zod.object({
  name: zod.string().min(1),
  email: zod.string().email(),
  password: zod.string().min(8),
  designation: zod.string(),
  phone: zod.string().max(10),
});

const loginBody = zod.object({
  email: zod.string().email(),
  password: zod.string().min(8),
});

// Signup
app.post("/auth/signup", async (req: Request, res: Response): Promise<any> => {
  try {
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Input",
        errors: result.error.flatten(),
      });
    }

    const { name, email, password, designation, phone } = result.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      designation,
      phone,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      message: "Signup Successful!",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Login
app.post("/auth/login", async (req: Request, res: Response): Promise<any> => {
  const result = loginBody.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid Input",
      errors: result.error.flatten(),
    });
  }

  const { email, password } = result.data;
  const user = await UserModel.findOne({ email });

  if (!user || !user.password) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    message: "Login successful",
    token,
  });
});

// Logout (no-op without cookies)
app.post("/auth/logout", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Logged out (client should discard token)" });
});

// Protected Routes
app.get("/dashboard", authMiddleware, (req: Request, res: Response) => {
  res.send("Middleware Working!");
});

app.get("/transactions", authMiddleware, getTransactions);
app.get("/analytics", authMiddleware, getAnalytics);

// Profile
app.get("/profile", authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      designation: user.designation,
      phone: user.phone,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Server Start
app.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
