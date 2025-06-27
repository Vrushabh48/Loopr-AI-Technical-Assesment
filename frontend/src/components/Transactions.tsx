import axios from "axios";
import { useEffect, useState } from "react";
import { exportToCSV } from "../utils/exportCSV";
import debounce from "lodash.debounce";
import { DateRange, type Range } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useNavigate } from "react-router-dom";

type Transaction = {
  _id: string;
  user_id: string;
  date: string;
  amount: number;
  category: "Expense" | "Revenue";
  status: "Paid" | "Pending";
};

export default function Transaction() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    amount: "",
    category: "",
    status: "",
    user_id: "",
  });

  const [showDateRange, setShowDateRange] = useState(false);
  const [range, setRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", "1");
      queryParams.append("limit", "1000");

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      if (sortBy) {
        queryParams.append("sortBy", sortBy);
        queryParams.append("sortOrder", sortOrder);
      }

      if (search) queryParams.append("search", search);

      const res = await axios.get(
        `http://localhost:3000/transactions?${queryParams.toString()}`,
        { withCredentials: true }
      );

      const allData: Transaction[] = res.data.data || [];

      const selectedColumns: (keyof Transaction)[] = [
        "user_id",
        "date",
        "amount",
        "category",
        "status",
      ];

      exportToCSV(allData, selectedColumns, "transactions_report.csv");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("limit", "10");

        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        if (sortBy) {
          queryParams.append("sortBy", sortBy);
          queryParams.append("sortOrder", sortOrder);
        }

        if (search) queryParams.append("search", search);

        const res = await axios.get(
          `http://localhost:3000/transactions?${queryParams.toString()}`,
          { withCredentials: true }
        );

        setTransactions(res.data.data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          navigate("/login");
        } else {
          console.error("Failed to fetch analytics", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters, page, sortBy, sortOrder, search, navigate]);

  const handleSearchChange = debounce((text: string) => {
    setSearch(text);
  }, 500);

  const applyDateRange = () => {
    const start = range[0].startDate
      ? format(range[0].startDate!, "yyyy-MM-dd")
      : "";
    const end = range[0].endDate
      ? format(range[0].endDate!, "yyyy-MM-dd")
      : "";

    setFilters((prev) => ({
      ...prev,
      dateFrom: start,
      dateTo: end,
    }));
    setShowDateRange(false);
  };

  const displayRange =
    filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} → ${filters.dateTo}`
      : "Select Date Range";

  return (
    <div className="bg-[#1A1C22] p-4 rounded-xl overflow-hidden w-full font-poppins">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 font-poppins">Transactions</h3>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search user/category/status"
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-[#131417] px-2 py-1 rounded text-sm w-full sm:w-auto"
          />

          {/* Date Range Picker */}
          <div className="relative z-20">
            <button
              onClick={() => setShowDateRange((p) => !p)}
              className="bg-[#131417] px-3 py-1 rounded text-sm w-full sm:w-auto"
            >
              {displayRange}
            </button>

            {showDateRange && (
              <div className="absolute mt-2 shadow-lg bg-[#1A1C22] p-2 rounded-md">
                <DateRange
                  editableDateInputs
                  onChange={(item) => setRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={range}
                  rangeColors={["#4ade80"]}
                />
                <button
                  onClick={applyDateRange}
                  className="bg-green-600 text-white mt-2 px-3 py-1 rounded text-sm w-full"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Amount"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, amount: e.target.value }))
            }
            className="bg-[#131417] px-2 py-1 rounded text-sm w-full sm:w-auto"
          />
          <input
            type="text"
            placeholder="User ID"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, user_id: e.target.value }))
            }
            className="bg-[#131417] px-2 py-1 rounded text-sm w-full sm:w-auto"
          />
          <select
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="bg-[#131417] px-2 py-1 rounded text-sm w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
          <select
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="bg-[#131417] px-2 py-1 rounded text-sm w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#131417] px-2 py-1 rounded text-sm w-full sm:w-auto"
          >
            <option value="">Sort By</option>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-gray-400 text-left">
              <tr>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("user_id")}>
                  User {sortBy === "user_id" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("date")}>
                  Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("amount")}>
                  Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="p-2 cursor-pointer">
                  Category {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-t border-gray-700">
                  <td className="p-2">{tx.user_id}</td>
                  <td className="p-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td
                    className={`p-2 ${
                      tx.category === "Expense" ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {tx.category === "Expense"
                      ? `- $${tx.amount}`
                      : `+ $${tx.amount}`}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === "Paid" ? "bg-green-700" : "bg-yellow-600"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-2">{tx.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-between flex-wrap gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="bg-[#2D2F36] px-3 py-1 rounded text-sm"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="bg-[#2D2F36] px-3 py-1 rounded text-sm"
        >
          Next
        </button>
        <button
          onClick={handleExport}
          className="bg-green-600 px-3 py-1 rounded text-sm text-white ml-auto"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
