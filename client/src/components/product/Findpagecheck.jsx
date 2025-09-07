import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { BarChart2, TrendingUp, CreditCard, Package } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, BarChart, Bar } from "recharts";

// Example data (replace with API later)
const monthlyData = [
  { month: "Jan", revenue: 120000, orders: 320 },
  { month: "Feb", revenue: 150000, orders: 400 },
  { month: "Mar", revenue: 180000, orders: 450 },
  { month: "Apr", revenue: 200000, orders: 500 },
];

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="rounded-2xl shadow-md hover:shadow-xl transition w-full">
      <CardContent className="flex items-center gap-4">
        <div
          className={`p-3 rounded-xl text-white`}
          style={{ backgroundColor: color }}
        >
          <Icon size={28} />
        </div>
        <div>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h6" className="font-bold">
            {value}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FindPageCheck() {
  const [chartType, setChartType] = useState("revenue");

  return (
    <div className="space-y-6 mt-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="This Month's Revenue"
          value="৳200,000"
          icon={BarChart2}
          color="#4f46e5"
        />
        <StatCard
          title="This Month's Orders"
          value="500"
          icon={Package}
          color="#10b981"
        />
        <StatCard
          title="This Year's Revenue"
          value="৳1,450,000"
          icon={TrendingUp}
          color="#f59e0b"
        />
        <StatCard
          title="Total Paid Orders"
          value="5,200"
          icon={CreditCard}
          color="#9333ea"
        />
      </div>

      {/* Chart Section */}
      <Card className="rounded-2xl shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="font-bold">
            {chartType === "revenue" ? "Monthly Revenue" : "Monthly Orders"}
          </Typography>
          <div className="flex gap-2">
            <Tooltip title="Show Revenue">
              <IconButton
                onClick={() => setChartType("revenue")}
                color={chartType === "revenue" ? "primary" : "default"}
              >
                <BarChart2 />
              </IconButton>
            </Tooltip>
            <Tooltip title="Show Orders">
              <IconButton
                onClick={() => setChartType("orders")}
                color={chartType === "orders" ? "primary" : "default"}
              >
                <Package />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartType === "revenue" ? (
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ReTooltip />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ReTooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={3}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
