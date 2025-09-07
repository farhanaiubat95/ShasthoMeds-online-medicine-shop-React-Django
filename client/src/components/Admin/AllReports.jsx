import React, { useEffect, useState } from "react";
import { Download, Search } from "@mui/icons-material";
import useMonthlyReports from "../../redux/useMonthlyReports.js";
import jsPDF from "jspdf";
import "jspdf-autotable"; // This is the crucial line

const AllReports = () => {
  const token = localStorage.getItem("access_token");
  const { reports, loading, error } = useMonthlyReports(token);

  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  useEffect(() => {
    if (reports) {
      setFilteredReports(reports);
    }
  }, [reports]);

  const handleSearch = () => {
    const filtered = reports.filter((report) => {
      const reportMonth = new Date(report.month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      return reportMonth.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredReports(filtered);
    setSelectedReport(null);
  };

  const downloadCSV = (data) => {
    const headers = [
      "Month",
      "Total Orders",
      "Total Profits",
      "Product Name",
      "Quantity Sold",
      "Product Profit",
    ];
    const csvRows = [];
    csvRows.push(headers.join(","));

    data.forEach((report) => {
      if (!report.products_details || report.products_details.length === 0) {
        const month = `"${new Date(report.month).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}"`;
        const orders = report.total_orders;
        const profits = Number(report.total_profit).toFixed(2);
        csvRows.push([month, orders, profits, "", "", ""].join(","));
        return;
      }
      report.products_details.forEach((product) => {
        const month = `"${new Date(report.month).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}"`;
        const orders = report.total_orders;
        const profits = Number(report.total_profit).toFixed(2);
        const productName = `"${product.product.replace(/"/g, '""')}"`;
        const productQuantity = product.quantity;
        const productProfit = Number(product.profit).toFixed(2);
        csvRows.push(
          [
            month,
            orders,
            profits,
            productName,
            productQuantity,
            productProfit,
          ].join(","),
        );
      });
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(22);
    doc.text("Sales Reports", 14, yPos);
    yPos += 10;

    // Add summary table
    doc.setFontSize(16);
    doc.text("Monthly Summaries", 14, yPos);
    yPos += 5;

    const summaryColumns = ["Month", "Total Orders", "Total Profits"];
    const summaryRows = data.map((report) => [
      new Date(report.month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      report.total_orders,
      Number(report.total_profit).toFixed(2),
    ]);

    doc.autoTable({
      startY: yPos,
      head: [summaryColumns],
      body: summaryRows,
      theme: "striped",
      headStyles: { fillColor: "#4ade80" }, // a shade of green
      margin: { top: yPos },
    });

    // Get the final Y position from the first table
    yPos = doc.autoTable.previous.finalY;

    // Add per-product details if a report is selected
    if (selectedReport && selectedReport.products_details) {
      yPos += 15;
      doc.setFontSize(16);
      doc.text(
        `Product Details for ${new Date(selectedReport.month).toLocaleString(
          "default",
          { month: "long", year: "numeric" },
        )}`,
        14,
        yPos,
      );
      yPos += 5;

      const productColumns = ["Product Name", "Quantity Sold", "Profit"];
      const productRows = selectedReport.products_details.map((product) => [
        product.product,
        product.quantity,
        Number(product.profit).toFixed(2),
      ]);

      doc.autoTable({
        startY: yPos,
        head: [productColumns],
        body: productRows,
        theme: "striped",
        headStyles: { fillColor: "#4ade80" },
        margin: { top: yPos },
      });
    }

    doc.save("sales_report.pdf");
  };

  const handleDownload = (format) => {
    if (filteredReports.length === 0) {
      alert("No data to download.");
      return;
    }

    if (format === "csv") {
      downloadCSV(filteredReports);
    } else if (format === "pdf") {
      downloadPDF(filteredReports);
    }

    setShowDownloadOptions(false);
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

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 relative">
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
        <div className="relative">
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="flex items-center justify-center bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            <Download className="mr-2" /> Download
          </button>
          {showDownloadOptions && (
            <div className="absolute top-12 sm:right-0 bg-white shadow-md rounded-md p-2 flex flex-col space-y-2 z-10 w-40">
              <button
                onClick={() => handleDownload("csv")}
                className="text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
              >
                Download CSV
              </button>
              <button
                onClick={() => handleDownload("pdf")}
                className="text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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