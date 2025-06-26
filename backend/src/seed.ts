import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Transaction } from './db';

dotenv.config();

const DATABASE_URL = "db-URL";

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in .env');
  process.exit(1);
}

mongoose
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

const filePath = path.join(__dirname, 'transactions.json');
const transactionsRaw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const transactionsData = transactionsRaw.map((t: any) => ({
  amount: t.amount,
  category: t.category,
  status: t.status,
  user_id: t.user_id,
  user_profile: t.user_profile,
  date: new Date(t.date),
}));

async function seed() {
  try {
    await Transaction.insertMany(transactionsData);
    console.log('✅ Transactions seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
  } finally {
    await mongoose.disconnect();
  }
}
