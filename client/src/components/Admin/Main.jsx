import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart, // <-- Import PieChart
  Pie, // <-- Import Pie
  Cell, // <-- Import Cell for colors
} from "recharts";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance.js";

const Main = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");

  const [chartData, setChartData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [profit, setProfit] = useState(0);
  const [topProductsData, setTopProductsData] = useState([]); // New state for pie chart

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        if (!token) return;

        const monthlyRes = await axiosInstance.get("/monthly/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // The correct way to get the array
        const monthlyReports = monthlyRes.data.results || [];

        // Aggregate data for total orders, profit, and chart
        const totalOrders = monthlyReports.reduce(
          (sum, m) => sum + (m.total_orders || 0),
          0,
        );
        const totalProfit = monthlyReports.reduce(
          (sum, m) => sum + Number(m.total_profit || 0),
          0,
        );
        const chart = monthlyReports.map((m) => ({
          name: m.month
            ? new Date(m.month).toLocaleString("default", { month: "short" })
            : "",
          income: Number(m.total_income || 0),
          profit: Number(m.total_profit || 0),
        }));

        setTotalOrders(totalOrders);
        setProfit(totalProfit);
        setChartData(chart);

        // --- New Logic for Top 5 Products Pie Chart ---

        const allProducts = [];
        monthlyReports.forEach((report) => {
          if (report.products_details && Array.isArray(report.products_details)) {
            allProducts.push(...report.products_details);
          }
        });

        const aggregatedProducts = allProducts.reduce((acc, product) => {
          const productName = product.product.trim();
          const quantity = product.quantity || 0;
          if (acc[productName]) {
            acc[productName] += quantity;
          } else {
            acc[productName] = quantity;
          }
          return acc;
        }, {});

        const sortedProducts = Object.entries(aggregatedProducts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5); // Get top 5

        const totalProductsSold = sortedProducts.reduce(
          (sum, [, quantity]) => sum + quantity,
          0,
        );

        const topFiveProductsData = sortedProducts.map(([name, quantity]) => ({
          name,
          value: quantity,
          percentage: ((quantity / totalProductsSold) * 100).toFixed(1),
        }));

        setTopProductsData(topFiveProductsData); // Set the new state
        
      } catch (err) {
        console.error("Monthly fetch error:", err);
      }
    };

    fetchMonthly();
  }, [token]);

  const totalUser = 10;
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const renderCustomizedLabel = ({ name, percent }) => {
    return `${name} - ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-5">
      <h2 className="text-xl lg:text-2xl font-semibold text-[#586277] mb-10">
        Admin Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* ... (Your existing dashboard cards) ... */}
        <div className="bg-purple-100 rounded-sm shadow-lg p-6">
          <p className="text-sm font-medium text-purple-700 uppercase">
            Total Users
          </p>
          <h3 className="text-4xl font-bold text-purple-900 mt-3">
            {totalUser}
          </h3>
        </div>
        <div className="bg-blue-100 rounded-sm shadow-lg p-6">
          <p className="text-sm font-medium text-blue-700 uppercase">
            Total Orders
          </p>
          <h3 className="text-4xl font-bold text-blue-900 mt-3">
            {totalOrders}
          </h3>
        </div>
        <div className="bg-green-100 rounded-sm shadow-lg p-6">
          <p className="text-sm font-medium text-green-700 uppercase">
            Total Profits
          </p>
          <h3 className="text-4xl font-bold text-green-900 mt-3">
            <span className="text-2xl">Tk</span> {profit}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-[270px]">
        <section className="bg-white rounded-sm shadow-lg p-6">
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

        {/* --- Replace Bar Chart with Pie Chart --- */}
        <section className="bg-white rounded-sm shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Top Products by Sales
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={topProductsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
};

export default Main;