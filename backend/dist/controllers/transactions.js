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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = void 0;
const db_1 = require("../db");
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, status, user_id, dateFrom, dateTo, amount, search, page = '1', limit = '10', sortBy = 'date', sortOrder = 'desc', } = req.query;
        const filters = {};
        // Exact or partial match filters
        if (category)
            filters.category = new RegExp(category, 'i');
        if (status)
            filters.status = new RegExp(status, 'i');
        if (user_id)
            filters.user_id = user_id; // Assumes exact match
        // Date range
        if (dateFrom || dateTo) {
            filters.date = {};
            if (dateFrom)
                filters.date.$gte = new Date(dateFrom);
            if (dateTo)
                filters.date.$lte = new Date(dateTo);
        }
        // Amount filter
        if (amount) {
            filters.amount = { $gte: Number(amount) };
        }
        // Search logic
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filters.$or = [
                { category: searchRegex },
                { status: searchRegex },
                { user_id: searchRegex },
            ];
        }
        // Pagination & Sorting
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        // limiting the fields if frontend does not needs it.
        const projection = {};
        // optimizing and sorting
        const [transactions, total] = yield Promise.all([
            db_1.Transaction.find(filters, projection)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(parseInt(limit)),
            db_1.Transaction.countDocuments(filters),
        ]);
        res.json({
            data: transactions,
            pagination: {
                total,
                page: parseInt(page),
                pageSize: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (err) {
        console.error('❌ Error fetching transactions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getTransactions = getTransactions;
