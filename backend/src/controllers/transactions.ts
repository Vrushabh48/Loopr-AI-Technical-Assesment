import { Request, Response } from 'express';
import { Transaction } from '../db';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const {
      category,
      status,
      user_id,
      dateFrom,
      dateTo,
      amount,
      search,
      page = '1',
      limit = '10',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const filters: any = {};

    // Exact or partial match filters
    if (category) filters.category = new RegExp(category as string, 'i');
    if (status) filters.status = new RegExp(status as string, 'i');
    if (user_id) filters.user_id = user_id; // Assumes exact match

    // Date range
    if (dateFrom || dateTo) {
      filters.date = {};
      if (dateFrom) filters.date.$gte = new Date(dateFrom as string);
      if (dateTo) filters.date.$lte = new Date(dateTo as string);
    }

    // Amount filter
    if (amount) {
      filters.amount = { $gte: Number(amount) };
    }

    // Search logic
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filters.$or = [
        { category: searchRegex },
        { status: searchRegex },
        { user_id: searchRegex },
      ];
    }

    // Pagination & Sorting
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // limiting the fields if frontend does not needs it.
    const projection = {};

    // optimizing and sorting
    const [transactions, total] = await Promise.all([
      Transaction.find(filters, projection)
        .sort({ [sortBy as string]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Transaction.countDocuments(filters),
    ]);

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
