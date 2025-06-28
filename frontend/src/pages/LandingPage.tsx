// src/pages/Landing.tsx
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-white shadow">
        <div className="text-2xl font-bold text-indigo-600">Penta</div>
        <button
          onClick={() => navigate("/signup")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Sign Up
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-between p-12 md:p-24">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Financial Insights Made Simple
          </h1>
          <p className="text-lg text-gray-600">
            Track revenue, expenses, and transactions in real-time with advanced filtering and visualizations.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Placeholder for image or chart preview */}
        <div className="md:w-1/2 mt-10 md:mt-0">
          <img
            src="https://media.istockphoto.com/id/1488294044/photo/businessman-works-on-laptop-showing-business-analytics-dashboard-with-charts-metrics-and-kpi.jpg?s=612x612&w=0&k=20&c=AcxzQAe1LY4lGp0C6EQ6reI7ZkFC2ftS09yw_3BVkpk="
            alt="Dashboard preview"
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              title: "Secure Login",
              desc: "JWT-based authentication keeps your data safe.",
            },
            {
              title: "Dynamic Dashboard",
              desc: "Interactive charts and analytics for fast decision-making.",
            },
            {
              title: "Smart Exports",
              desc: "Download customized CSVs directly from the browser.",
            },
          ].map((f) => (
            <div key={f.title}>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-gray-100 text-sm text-gray-500">
        © 2025 Penta Financial Analytics. Built for Assignment.
      </footer>
    </div>
  );
}
