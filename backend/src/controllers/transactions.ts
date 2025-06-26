import { Request, Response } from 'express';
import { Transaction } from '../db';

//fetching the transactions
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const {
      category,
      status,
      user_id,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      search,
      page = '1',
      limit = '10',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const filters: any = {};

    if (category) {
      filters.category = { $regex: new RegExp(category as string, 'i') };
    }

    if (status) {
      filters.status = { $regex: new RegExp(status as string, 'i') };
    }

    if (user_id) {
      filters.user_id = { $regex: new RegExp(user_id as string, 'i') };
    }

    if (dateFrom || dateTo) {
      filters.date = {};
      if (dateFrom) filters.date.$gte = new Date(dateFrom as string);
      if (dateTo) filters.date.$lte = new Date(dateTo as string);
    }

    if (minAmount || maxAmount) {
      filters.amount = {};
      if (minAmount) filters.amount.$gte = parseFloat(minAmount as string);
      if (maxAmount) filters.amount.$lte = parseFloat(maxAmount as string);
    }

    if (search) {
      filters.$or = [
        { user_id: { $regex: search as string, $options: 'i' } },
        { category: { $regex: search as string, $options: 'i' } },
        { status: { $regex: search as string, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const transactions = await Transaction.find(filters)
      .sort({ [sortBy as string]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Transaction.countDocuments(filters);

    res.json({
      data: transactions,
      pagination: {
        total,
        page: parseInt(page as string),
        pageSize: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    console.error('❌ Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
