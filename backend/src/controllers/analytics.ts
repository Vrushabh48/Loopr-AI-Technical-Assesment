// --- BACKEND: Analytics Controller Function ---

import { Request, Response } from 'express';
import {Transaction} from '../db';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // 1. Revenue & Expense Trend by Date
    const revenueExpenseTrend = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Status Distribution
    const statusDistribution = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Top Users by Expense
    const topUsersExpense = await Transaction.aggregate([
      { $match: { category: 'Expense' } },
      {
        $group: {
          _id: '$user_id',
          totalSpent: { $sum: '$amount' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]);

    // 4. Daily Transaction Count
    const transactionCountTrend = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 5. Average, Max, Min Transaction Amounts
    const summaryStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
        },
      },
    ]);

    res.json({
      revenueExpenseTrend,
      statusDistribution,
      topUsersExpense,
      transactionCountTrend,
      summaryStats: summaryStats[0] || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};
