import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import AllReports from "./AllReports";

const OrdersReport = () => {
  const [allData, setAllData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch all items once
  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://shasthomeds-backend.onrender.com/orders-report-items/",
      );
      setAllData(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data
  useEffect(() => {
    let start, end;
    const today = dayjs();

    if (filter === "all") {
      // Show everything
      setFilteredData(
        [...allData].sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
      return;
    }

    switch (filter) {
      case "today":
        start = today.startOf("day");
        end = today.endOf("day");
        break;
      case "weekly":
        start = today.startOf("week");
        end = today.endOf("week");
        break;
      case "monthly":
        start = today.startOf("month");
        end = today.endOf("month");
        break;
      case "yearly":
        start = today.startOf("year");
        end = today.endOf("year");
        break;
      case "custom":
        if (startDate && endDate) {
          start = startDate.startOf("day");
          end = endDate.endOf("day");
        } else {
          setFilteredData([]);
          return;
        }
        break;
      default:
        setFilteredData(allData);
        return;
    }

    const filtered = allData.filter((item) => {
      const itemDate = dayjs(item.date);
      return (
        itemDate.isSame(start) ||
        itemDate.isSame(end) ||
        (itemDate.isAfter(start) && itemDate.isBefore(end))
      );
    });

    // Sort by recent first
    setFilteredData(
      [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)),
    );
  }, [allData, filter, startDate, endDate]);

  // Export CSV
  const exportCSV = () => {
    if (!filteredData.length) return;
    const csvRows = [];
    const headers = Object.keys(filteredData[0]);
    csvRows.push(headers.join(","));
    filteredData.forEach((row) =>
      csvRows.push(headers.map((h) => row[h]).join(",")),
    );
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders_report.csv";
    a.click();
  };

  return (
    <Box>
      <AllReports />

      {/* <AllReports /> */}
      <Box p={3}>
        <Typography variant="h5" mb={2}>
          All Sales Reports
        </Typography>

        <Box mb={2} display="flex" gap={1} flexWrap="wrap">
          {["all", "today", "weekly", "monthly", "yearly", "custom"].map(
            (f) => (
              <Button
                key={f}
                variant={filter === f ? "contained" : "outlined"}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ),
          )}
        </Box>

        {filter === "custom" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box mb={2} display="flex" gap={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Box>
          </LocalizationProvider>
        )}

        <Button variant="outlined" onClick={exportCSV} sx={{ mb: 2 }}>
          Export CSV
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity Sold</TableCell>
                <TableCell>Income</TableCell>
                <TableCell>Actual Cost</TableCell>
                <TableCell>Profit</TableCell>
                <TableCell>Stock Remaining</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      {dayjs(row.date).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.quantity_sold}</TableCell>
                    <TableCell>{row.income}</TableCell>
                    <TableCell>{row.actual_cost}</TableCell>
                    <TableCell>{row.profit}</TableCell>
                    <TableCell>{row.stock_remaining}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No selling
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default OrdersReport;
