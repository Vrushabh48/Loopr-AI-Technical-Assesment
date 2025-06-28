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

type CSVExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (columns: (keyof Transaction)[], fileName: string) => void;
  defaultColumns: (keyof Transaction)[];
};

const CSVExportModal = ({ isOpen, onClose, onExport, defaultColumns }: CSVExportModalProps) => {
  const [fileName, setFileName] = useState("transactions_report");
  const [selectedColumns, setSelectedColumns] = useState<(keyof Transaction)[]>(defaultColumns);

  const columnOptions: { id: keyof Transaction; label: string }[] = [
    { id: "user_id", label: "User ID" },
    { id: "date", label: "Date" },
    { id: "amount", label: "Amount" },
    { id: "category", label: "Category" },
    { id: "status", label: "Status" },
  ];

  const toggleColumn = (column: keyof Transaction) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleExport = () => {
    onExport(selectedColumns, `${fileName}.csv`);
    onClose();
  };

  if (!isOpen) return null;
  //exportCSV config window
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1F25] rounded-xl p-6 w-full max-w-md border border-[#2D2F36]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Export Configuration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-2">File Name</label>
          <div className="flex">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-[#2D2F36] px-3 py-2 rounded-l text-sm w-full border-r border-[#1A1C22]"
            />
            <span className="bg-[#2D2F36] px-3 py-2 rounded-r text-sm text-gray-400 flex items-center">
              .csv
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-3">Columns to Export</label>
          <div className="grid grid-cols-2 gap-2">
            {columnOptions.map((column) => (
              <div key={column.id} className="flex items-center">
                <button
                  onClick={() => toggleColumn(column.id)}
                  className={`w-5 h-5 rounded mr-2 flex items-center justify-center ${selectedColumns.includes(column.id) ? 'bg-green-500' : 'bg-[#2D2F36] border border-[#3E4046]'}`}
                >
                  {selectedColumns.includes(column.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm">{column.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm bg-[#2D2F36] hover:bg-[#3E4046] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded text-sm bg-green-600 hover:bg-green-700 text-white transition"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
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
  const base_url = import.meta.env.VITE_REACT_APP_BASE_URL;
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
  const [showExportModal, setShowExportModal] = useState(false);

  //sorting the data
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = async (columns: (keyof Transaction)[], fileName: string) => {
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
        `${base_url}/transactions?${queryParams.toString()}`,
        { withCredentials: true }
      );

      const allData: Transaction[] = res.data.data || [];
      exportToCSV(allData, columns, fileName);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }
  };

  useEffect(() => {
    //fetching transactions data
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

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg border border-[#2D2F36]">
      <table className="w-full text-sm">
        <thead className="text-gray-400 bg-[#1E1F25]">
          <tr>
            <th 
              className="p-3 cursor-pointer hover:bg-[#2D2F36] transition"
              onClick={() => handleSort("user_id")}
            >
              <div className="flex items-center">
                User
                {sortBy === "user_id" && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th 
              className="p-3 cursor-pointer hover:bg-[#2D2F36] transition"
              onClick={() => handleSort("date")}
            >
              <div className="flex items-center">
                Date
                {sortBy === "date" && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th 
              className="p-3 cursor-pointer hover:bg-[#2D2F36] transition"
              onClick={() => handleSort("amount")}
            >
              <div className="flex items-center">
                Amount
                {sortBy === "amount" && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th 
              className="p-3 cursor-pointer hover:bg-[#2D2F36] transition"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortBy === "status" && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th className="p-3 hover:bg-[#2D2F36] transition">
              Category
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2D2F36]">
          {transactions.map((tx) => (
            <tr key={tx._id} className="hover:bg-[#1E1F25] transition">
              <td className="p-3">{tx.user_id}</td>
              <td className="p-3">{new Date(tx.date).toLocaleDateString()}</td>
              <td className={`p-3 font-medium ${tx.category === "Expense" ? "text-red-400" : "text-green-400"}`}>
                {tx.category === "Expense" ? `- $${tx.amount}` : `+ $${tx.amount}`}
              </td>
              <td className="p-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tx.status === "Paid" 
                    ? "bg-green-900 text-green-300" 
                    : "bg-yellow-900 text-yellow-300"
                }`}>
                  {tx.status}
                </span>
              </td>
              <td className="p-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tx.category === "Revenue" 
                    ? "bg-blue-900 text-blue-300" 
                    : "bg-purple-900 text-purple-300"
                }`}>
                  {tx.category}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        renderTable()
      )}

      <div className="mt-4 flex justify-between flex-wrap gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded text-sm ${page === 1 ? 'bg-[#2D2F36] text-gray-500 cursor-not-allowed' : 'bg-[#2D2F36] hover:bg-[#3E4046]'}`}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={transactions.length < 10}
          className={`px-4 py-2 rounded text-sm ${transactions.length < 10 ? 'bg-[#2D2F36] text-gray-500 cursor-not-allowed' : 'bg-[#2D2F36] hover:bg-[#3E4046]'}`}
        >
          Next
        </button>
        <button
          onClick={handleExportClick}
          className="px-4 py-2 rounded text-sm bg-green-600 hover:bg-green-700 text-white ml-auto"
        >
          Export CSV
        </button>
      </div>

      <CSVExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportConfirm}
        defaultColumns={["user_id", "date", "amount", "category", "status"]}
      />
    </div>
  );
}