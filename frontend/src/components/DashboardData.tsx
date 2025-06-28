import { FaWallet } from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import { GiWallet } from "react-icons/gi";
import { IoCard } from "react-icons/io5";

type SummaryCardProps = {
  icon: React.ReactNode;
  title: string;
  amount: string;
};
import { Line } from "react-chartjs-2";
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

type AnalyticsData = {
  revenueExpenseTrend: RevenueExpensePoint[];
};

export default function DashboardData() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_REACT_APP_BASE_URL;
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${base_url}/analytics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
  }, [base_url, navigate]);
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<FaWallet />} title="Balance" amount="$41,210" />
        <SummaryCard icon={<GiWallet />} title="Revenue" amount="$41,210" />
        <SummaryCard icon={<IoCard />} title="Expense" amount="$41,210" />
        <SummaryCard
          icon={<AiFillDollarCircle />}
          title="Savings"
          amount="$41,210"
        />
      </div>

      {/* Overview */}
      <div className="bg-[#1A1C22] p-4 rounded-xl mt-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">Overview</h3>
        </div>
        {analytics ? (
          <>
            {/* 1. Revenue vs Expense Trend */}
            <div className="bg-[#1A1C22] p-4 rounded-xl overflow-x-auto">
              <h3 className="text-lg font-semibold mb-2">
                Revenue vs Expense Trend
              </h3>
              <div className="min-w-[300px]">
                <Line
                  data={{
                    labels: analytics.revenueExpenseTrend.map((d) => d._id),
                    datasets: [
                      {
                        label: "Revenue",
                        data: analytics.revenueExpenseTrend.map(
                          (d) => d.totalRevenue
                        ),
                        borderColor: "green",
                        tension: 0.3,
                      },
                      {
                        label: "Expense",
                        data: analytics.revenueExpenseTrend.map(
                          (d) => d.totalExpense
                        ),
                        borderColor: "orange",
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Loading analytics...</p>
        )}
      </div>
    </>
  );
}

function SummaryCard({ icon, title, amount }: SummaryCardProps) {
  return (
    <div className="bg-[#1A1C22] p-4 rounded-xl w-full font-poppins flex items-center justify-between shadow-md">
      {/* Icon box */}
      <div className="bg-[#2D2F36] p-3 rounded-lg flex items-center justify-center w-12 h-12 text-green-400 text-2xl">
        {icon}
      </div>

      {/* Text content */}
      <div className="text-right ml-4">
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-2xl font-semibold text-white">{amount}</div>
      </div>
    </div>
  );
}
