import {
  FaWallet,
} from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import { GiWallet } from "react-icons/gi";
import { IoCard } from "react-icons/io5";

type SummaryCardProps = {
  icon: React.ReactNode;
  title: string;
  amount: string;
};

export default function DashboardData() {
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
          <select className="bg-[#131417] px-3 py-2 rounded text-sm w-full sm:w-auto">
            <option>Monthly</option>
            <option>Weekly</option>
          </select>
        </div>
        {/* Add future graph/chart/overview content here */}
        <p className="text-gray-400 text-sm">Overview content will go here.</p>
      </div>
    </>
  );
}

function SummaryCard({ icon, title, amount }: SummaryCardProps) {
  return (
    <div className="bg-[#1A1C22] p-4 rounded-xl w-full">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-xl font-bold mt-1">{amount}</div>
    </div>
  );
}
