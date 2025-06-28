import { Request, Response } from 'express';
import {Transaction} from '../db';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const results = await Transaction.aggregate([
      {
        $facet: {
          revenueExpenseTrend: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                //calculating total of amount with category
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
          ],

          transactionCountTrend: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],

          //data for pie chart
          statusDistribution: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],

          //data for bar chart
          topUsersExpense: [
            { $match: { category: 'Expense' } },
            {
              $group: {
                _id: '$user_id',
                totalSpent: { $sum: '$amount' },
              },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
          ],

          summaryStats: [
            {
              $group: {
                _id: null,
                avgAmount: { $avg: '$amount' },
                maxAmount: { $max: '$amount' },
                minAmount: { $min: '$amount' },
              },
            },
          ],
        },
      },
    ]);

    const {
      revenueExpenseTrend,
      transactionCountTrend,
      statusDistribution,
      topUsersExpense,
      summaryStats,
    } = results[0];

    res.json({
      revenueExpenseTrend,
      transactionCountTrend,
      statusDistribution,
      topUsersExpense,
      summaryStats: summaryStats[0] || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};
