import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

type RevenueExpensePoint = {
  _id: string;
  totalRevenue: number;
  totalExpense: number;
};

type StatusDistribution = {
  _id: "Paid" | "Pending";
  count: number;
};

type TopUserExpense = {
  _id: string;
  totalSpent: number;
};

type TransactionCount = {
  _id: string;
  count: number;
};

type SummaryStats = {
  avgAmount: number;
  maxAmount: number;
  minAmount: number;
};

type AnalyticsData = {
  revenueExpenseTrend: RevenueExpensePoint[];
  statusDistribution: StatusDistribution[];
  topUsersExpense: TopUserExpense[];
  transactionCountTrend: TransactionCount[];
  summaryStats: SummaryStats;
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null); //analytics data
  const navigate = useNavigate();
  useEffect(() => {
    //fetching the data
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:3000/analytics", {
          withCredentials: true,
        });
        setAnalytics(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          navigate("/login");
        } else {
          console.error("Failed to fetch analytics", err);
        }
      }
    };
    fetchAnalytics();
  }, [navigate]);

  return (
    <div className="space-y-8">
      {analytics ? (
        <>
          {/* 1. Revenue vs Expense Trend */}
          <div className="bg-[#1A1C22] p-4 rounded-xl overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2">Revenue vs Expense Trend</h3>
            <div className="min-w-[300px]">
              <Line
                data={{
                  labels: analytics.revenueExpenseTrend.map((d) => d._id),
                  datasets: [
                    {
                      label: "Revenue",
                      data: analytics.revenueExpenseTrend.map((d) => d.totalRevenue),
                      borderColor: "green",
                      tension: 0.3,
                    },
                    {
                      label: "Expense",
                      data: analytics.revenueExpenseTrend.map((d) => d.totalExpense),
                      borderColor: "orange",
                      tension: 0.3,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          {/* 2. Status Distribution */}
          <div className="bg-[#1A1C22] p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Status Distribution</h3>
            <div className="w-full flex justify-center">
              <div className="w-[200px] sm:w-[250px] h-[200px] sm:h-[250px]">
                <Pie
                  data={{
                    labels: analytics.statusDistribution.map((s) => s._id),
                    datasets: [
                      {
                        data: analytics.statusDistribution.map((s) => s.count),
                        backgroundColor: ["#34D399", "#FBBF24"],
                      },
                    ],
                  }}
                  options={{ responsive: true }}
                />
              </div>
            </div>
          </div>

          {/* 3. Top Users by Expense */}
          <div className="bg-[#1A1C22] p-4 rounded-xl overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2">Top Users by Expense</h3>
            <div className="min-w-[300px]">
              <Bar
                data={{
                  labels: analytics.topUsersExpense.map((u) => u._id),
                  datasets: [
                    {
                      label: "Total Spent",
                      data: analytics.topUsersExpense.map((u) => u.totalSpent),
                      backgroundColor: "#F87171",
                      barThickness: 20,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          {/* 4. Transaction Count Trend */}
          <div className="bg-[#1A1C22] p-4 rounded-xl overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2">Monthly Transaction Count</h3>
            <div className="min-w-[300px]">
              <Line
                data={{
                  labels: analytics.transactionCountTrend.map((d) => d._id),
                  datasets: [
                    {
                      label: "Transactions",
                      data: analytics.transactionCountTrend.map((d) => d.count),
                      borderColor: "#60A5FA",
                      tension: 0.3,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          {/* 5. Summary Stats */}
          <div className="bg-[#1A1C22] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400">Average Amount</p>
              <p className="text-xl font-bold">
                ${analytics.summaryStats.avgAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Maximum Amount</p>
              <p className="text-xl font-bold">
                ${analytics.summaryStats.maxAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Minimum Amount</p>
              <p className="text-xl font-bold">
                ${analytics.summaryStats.minAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Loading analytics...</p>
      )}
    </div>
  );
}
