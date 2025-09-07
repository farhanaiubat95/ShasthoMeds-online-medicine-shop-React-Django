import React, { useEffect, useState } from "react";
import { Download, Search } from "@mui/icons-material";
import useMonthlyReports from "../../redux/useMonthlyReports.js"; // Correct path

const AllReports = () => {
  const token = localStorage.getItem("access_token");

  // Use the custom hook to get data, loading, and error states
  const { reports, loading, error } = useMonthlyReports(token);

  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Use useEffect to update filteredReports whenever reports change
  // This ensures the initial data is displayed and reflects any data changes
  useEffect(() => {
    if (reports) {
      setFilteredReports(reports);
    }
  }, [reports]);

  const handleSearch = () => {
    const filtered = reports.filter((report) => {
      // Use 'reports' from the hook as the data source
      const reportMonth = new Date(report.month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      return reportMonth.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredReports(filtered);
    setSelectedReport(null); // Reset selection
  };

  const handleDownload = () => {
    // Implement your download logic here
    console.log("Downloading data...");
  };

  if (loading) {
    return <div className="text-center py-10">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error fetching data. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Sales Reports</h1>

      {/* Search & Download Section */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          placeholder="Search by month (e.g., 'September 2025')"
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-1/2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Search className="mr-2" /> Search
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          <Download className="mr-2" /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Reports Section */}
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Monthly Summaries</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Total Profits
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {new Date(report.month).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {report.total_orders}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      Tk {Number(report.total_profit).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No reports found for this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Per-Product Details Section */}
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">
            Per-Product Details
            {selectedReport &&
              ` for ${new Date(selectedReport.month).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}`}
          </h2>
          {selectedReport ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedReport.products_details.length > 0 ? (
                  selectedReport.products_details.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {product.product}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        Tk {Number(product.profit).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No product details found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Select a monthly report to view product details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllReports;