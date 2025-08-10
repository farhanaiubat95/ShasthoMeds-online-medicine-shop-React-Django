import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const xLabels = ["Page A", "Page B", "Page C", "Page D", "Page E", "Page F", "Page G"];

const Main = () => {
  const totalUser = 4;
  const totalCustomer = 2;
  const totalSeller = 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-5 ">
      {/* Header */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-10">
        Admin Dashboard
      </h2>

          <div>
              {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-purple-100 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
          <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">
            Total Members
          </p>
          <h3 className="text-4xl font-extrabold text-purple-900 mt-3">{totalUser}</h3>
          <h5 className="mt-6 text-sm text-purple-600 cursor-pointer">
            More Details
          </h5>
        </div>

        <div className="bg-blue-100 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
          <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">
            Total Customers
          </p>
          <h3 className="text-4xl font-extrabold text-blue-900 mt-3">{totalCustomer}</h3>
          <h5 className="mt-6 text-sm text-blue-600 cursor-pointer">
            More Details
          </h5>
        </div>

        <div className="bg-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
          <p className="text-sm font-medium text-green-700 uppercase tracking-wide">
            Total Sellers
          </p>
          <h3 className="text-4xl font-extrabold text-green-900 mt-3">{totalSeller}</h3>
          <h5 className="mt-6 text-sm text-green-600 cursor-pointer">
            More Details
          </h5>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10  h-[270px]">
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Cost Overview</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={xLabels.map((x, i) => ({ name: x, uv: uData[i], pv: pData[i] }))}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#10b981" />
              <Bar dataKey="uv" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6 h-[270px]">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Overview</h3>
          <ResponsiveContainer width="100%" height={180} >
            <BarChart data={xLabels.map((x, i) => ({ name: x, uv: uData[i], pv: pData[i] }))}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#a855f7" />
              <Bar dataKey="uv" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
      </div>
    </div>
  );
};


export default Main;