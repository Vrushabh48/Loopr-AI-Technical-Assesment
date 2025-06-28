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
exports.getAnalytics = void 0;
const db_1 = require("../db");
const getAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.Transaction.aggregate([
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
        const { revenueExpenseTrend, transactionCountTrend, statusDistribution, topUsersExpense, summaryStats, } = results[0];
        res.json({
            revenueExpenseTrend,
            transactionCountTrend,
            statusDistribution,
            topUsersExpense,
            summaryStats: summaryStats[0] || {},
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load analytics' });
    }
});
exports.getAnalytics = getAnalytics;
