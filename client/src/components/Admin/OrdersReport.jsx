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

const OrdersReport = () => {
  const [filter, setFilter] = useState("daily");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);

  const fetchReport = async (filterType = filter) => {
    try {
      let url = `https://shasthomeds-backend.onrender.com/api/orders-report/?filter=${filterType}`;
      if (filterType === "custom" && startDate && endDate) {
        url += `&start_date=${startDate.format("YYYY-MM-DD")}&end_date=${endDate.format("YYYY-MM-DD")}`;
      }
      const res = await axios.get(url);
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    }
  };

  const downloadCSV = () => {
    let url = `https://shasthomeds-backend.onrender.com/api/orders-report/?filter=${filter}&export=csv`;
    if (filter === "custom" && startDate && endDate) {
      url += `&start_date=${startDate.format("YYYY-MM-DD")}&end_date=${endDate.format("YYYY-MM-DD")}`;
    }
    window.open(url, "_blank"); // trigger CSV download
  };

  useEffect(() => {
    fetchReport();
  }, [filter, startDate, endDate]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Orders Report
      </Typography>

      {/* Filter buttons */}
      <Box mb={2} display="flex" gap={1} flexWrap="wrap">
        {["daily", "weekly", "monthly", "yearly", "custom"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "contained" : "outlined"}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </Box>

      {/* Custom date pickers */}
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

      <Button variant="outlined" onClick={downloadCSV} sx={{ mb: 2 }}>
        Export CSV
      </Button>

      {/* Report table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
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
            {reportData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.quantity_sold}</TableCell>
                <TableCell>{row.income}</TableCell>
                <TableCell>{row.actual_cost}</TableCell>
                <TableCell>{row.profit}</TableCell>
                <TableCell>{row.stock_remaining}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrdersReport;
