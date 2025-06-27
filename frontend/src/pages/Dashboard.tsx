import { useState } from "react";
import { FaChartBar, FaExchangeAlt, FaBars } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Analytics from "../components/Analytics";
import DashboardData from "../components/DashboardData";
import Transaction from "../components/Transactions";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#131417] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className={`w-full md:w-60 bg-[#1A1C22] p-6 space-y-6 z-50 md:static fixed top-0 left-0 h-screen items-center transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <h1 className="text-4xl font-bold font-serifDisplay md:ml-10">Penta</h1>
        <nav className="space-y-4">
          <NavItem
            icon={<FaChartBar />}
            label="Dashboard"
            active={activeTab === "Dashboard"}
            onClick={() => {
              setActiveTab("Dashboard");
              setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={<FaExchangeAlt />}
            label="Transactions"
            active={activeTab === "Transactions"}
            onClick={() => {
              setActiveTab("Transactions");
              setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={<FaChartBar />}
            label="Analytics"
            active={activeTab === "Analytics"}
            onClick={() => {
              setActiveTab("Analytics");
              setSidebarOpen(false);
            }}
          />
        </nav>
      </div>

      {/* Content */}
      <div className="bg-[#282C35] flex-1 p-4 sm:p-6 space-y-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 bg-[#1A1C22] rounded"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <FaBars />
            </button>
            <h2 className="text-2xl sm:text-4xl font-semibold font-oswald">
              {activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#1A1C22] px-3 py-1 rounded-full">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm ml-2 w-24 sm:w-auto"
              />
            </div>
            <div
              className="cursor-pointer text-2xl text-gray-300 hover:text-white"
              onClick={() => navigate("/profile")}
            >
              <FaUserCircle />
            </div>
          </div>
        </div>

        {/* Conditional Tabs */}
        {activeTab === "Dashboard" && <DashboardData />}
        {activeTab === "Transactions" && <Transaction />}
        {activeTab === "Analytics" && <Analytics />}
      </div>
    </div>
  );
}

// Properly typed NavItem component
type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium font-poppins ${
        active
          ? "bg-[#2D2F36] text-white"
          : "text-gray-400 hover:bg-[#2D2F36] hover:text-white"
      }`}
    >
      <div className="text-lg font-poppins">{icon}</div>
      {label}
    </div>
  );
}
