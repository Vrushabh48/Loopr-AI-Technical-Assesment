import { useRef, useState } from "react";
import { FaChartBar, FaExchangeAlt, FaBars } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Analytics from "../components/Analytics";
import DashboardData from "../components/DashboardData";
import Transaction from "../components/Transactions";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_REACT_APP_BASE_URL;

  const handleLogout = async () => {
    try {
      await axios.post(
        `${base_url}/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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
            <div className="relative" ref={menuRef}>
              <button
                aria-label="User menu"
                aria-expanded={open}
                aria-haspopup="true"
                className="cursor-pointer text-2xl text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                onClick={() => setOpen((prev) => !prev)}
              >
                <FaUserCircle />
              </button>

              {open && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="py-1" role="none">
                    <button
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      role="menuitem"
                      onClick={() => {
                        navigate("/profile");
                        setOpen(false);
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
                      role="menuitem"
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
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

//NavItem component
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
