import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { UserModel } from "./db"; // assuming db.ts exports UserModel

const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://vrushabhpatil4801:Finappdb123@finappdb.gxyuw51.mongodb.net/", {
    dbName: "FinAppDB",
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send("Working!!");
});

app.post('/signup', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await UserModel.create({ email, password, name });

        return res.json({ message: "You are signed up" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});