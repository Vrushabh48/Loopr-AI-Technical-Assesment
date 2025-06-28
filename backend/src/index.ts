import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./db";
import zod from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware";
import { getTransactions } from "./controllers/transactions";
import { getAnalytics } from "./controllers/analytics";

dotenv.config();
const app = express();
const port = 3000;

// Enable CORS with credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
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

app.get("/", (req: Request, res: Response) => {
  res.json("Working!!");
});

// Zod validation for signup
const signupBody = zod.object({
  name: zod.string().min(1),
  email: zod.string().email(),
  password: zod.string().min(8),
  designation: zod.string(),
  phone: zod.string().max(10),
});

// Signup route
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
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({ message: "Signup Successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Zod validation for login
const loginBody = zod.object({
  email: zod.string().email(),
  password: zod.string().min(8),
});

// Login route
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

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ message: "Login successful" });
});

// Logout route
app.post("/auth/logout", (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ message: "Logged out" });
});

// Protected route
app.get("/dashboard", authMiddleware, (req: Request, res: Response) => {
  res.send("Middleware Working!");
});

// Transactions route
app.get("/transactions", authMiddleware, getTransactions);

//analytics route
app.get("/analytics", authMiddleware, getAnalytics);

app.get('/profile', authMiddleware, async (req: Request, res: Response): Promise<any> => {
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
      phone: user.phone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
})
// Start server
app.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
