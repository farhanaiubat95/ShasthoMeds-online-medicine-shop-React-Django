import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance.js";

const Main = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");

  const [chartData, setChartData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        if (!token) return;

        const monthlyRes = await axiosInstance.get("/monthly/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let monthlyReports = monthlyRes.data;

        // Ensure we have an array
        if (!Array.isArray(monthlyReports)) {
          monthlyReports = Object.values(monthlyReports || {});
        }

        // Filter out null or invalid entries
        const reportsArray = (monthlyReports || []).filter(
          (m) => m && typeof m === "object"
        );

        // Safely reduce
        const totalOrders = reportsArray.reduce(
          (sum, m) => sum + (m.total_orders || 0),
          0
        );
        const totalProfit = reportsArray.reduce(
          (sum, m) => sum + Number(m.total_profit || 0),
          0
        );

        // Map for chart
        const chart = reportsArray.map((m) => ({
          name: m.month
            ? new Date(m.month).toLocaleString("default", { month: "short" })
            : "",
          income: Number(m.total_income || 0),
          profit: Number(m.total_profit || 0),
        }));

        setTotalOrders(totalOrders);
        setProfit(totalProfit);
        setChartData(chart);
      } catch (err) {
        console.error("Monthly fetch error:", err);
      }
    };

    fetchMonthly();
  }, [token]);

  const totalUser = 10;

  return (
    <div className="max-w-7xl mx-auto px-6 py-5">
      <h2 className="text-xl lg:text-2xl font-semibold text-[#586277] mb-10">
        Admin Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-purple-100 rounded-xl shadow-lg p-6">
          <p className="text-sm font-medium text-purple-700 uppercase">
            Total Users
          </p>
          <h3 className="text-4xl font-extrabold text-purple-900 mt-3">
            {totalUser}
          </h3>
        </div>

        <div className="bg-blue-100 rounded-xl shadow-lg p-6">
          <p className="text-sm font-medium text-blue-700 uppercase">
            Total Orders
          </p>
          <h3 className="text-4xl font-extrabold text-blue-900 mt-3">
            {totalOrders}
          </h3>
        </div>

        <div className="bg-green-100 rounded-xl shadow-lg p-6">
          <p className="text-sm font-medium text-green-700 uppercase">
            Total Profits
          </p>
          <h3 className="text-4xl font-extrabold text-green-900 mt-3">
            {profit}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-[270px]">
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Income vs Profit
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="profit" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Product Overview
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#a855f7" />
              <Bar dataKey="profit" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
};

export default Main;
