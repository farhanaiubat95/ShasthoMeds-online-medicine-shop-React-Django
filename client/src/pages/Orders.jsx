import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CancelIcon from "@mui/icons-material/Cancel";

import { useSelector, useDispatch } from "react-redux";
import { fetchOrders } from "../redux/orderSlice";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders); // Redux orders

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box className="p-4 sm:p-8 bg-gray-100 min-h-[93vh]">
      <Typography variant="h4" className="font-bold pb-6 text-center">
        My Orders
      </Typography>

      {loading ? (
        <Typography className="text-center text-gray-600">
          Loading orders...
        </Typography>
      ) : orders?.length === 0 ? (
        <Typography className="text-center text-gray-600">
          No orders found.
        </Typography>
      ) : (
        orders.map((order) => (
          <Box
            key={order.id}
            className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6 border border-gray-200 xl:w-[800px] mx-auto"
          >
            {/* Order Header */}
            <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <Box className="flex items-center gap-2 mb-2 sm:mb-0">
                <Typography className="text-sm sm:text-base font-medium text-gray-700">
                  Order ID:{" "}
                  <span className="text-blue-700 font-semibold">
                    #{order.id}
                  </span>
                </Typography>
                <Tooltip title="Copy Order ID">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(order.id)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Chip
                icon={<LocalShippingIcon />}
                label="Regular Delivery"
                size="small"
                sx={{
                  backgroundColor: "#064232",
                  color: "#fff",
                  fontWeight: 500,
                  borderRadius: "6px",
                }}
              />
            </Box>

            {/* Address */}
            <Box className="flex justify-between items-center mb-4">
              <Box className="flex gap-2 mb-3 text-sm text-gray-800">
                <HomeIcon fontSize="small" className="text-gray-600 mt-0.5" />
                <Box>
                  <div className="font-semibold">{order.name}</div>
                  <div>{order.phone}</div>
                  <div>
                    {order.address}, {order.city}, {order.postal_code}
                  </div>
                </Box>
              </Box>
              <Box>
                <Chip
                  label={order.payment_status === "paid" ? "Paid" : "Unpaid"}
                  size="small"
                  sx={{
                    backgroundColor:
                      order.payment_status === "paid" ? "#102E50" : "#C5172E",
                    color: "#fff",
                    fontWeight: 500,
                    borderRadius: "6px",
                  }}
                />
              </Box>
            </Box>

            <Divider className="my-3" />

            {/* Order Details */}
            <Box className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
              <div>
                <strong>Date:</strong>
                <br /> {new Date(order.created_at).toLocaleString()}
              </div>
              <div>
                <strong>Status:</strong>
                <br />
                <Chip
                  icon={
                    order.status === "delivered" ? (
                      <CheckCircleIcon />
                    ) : order.status === "pending" ? (
                      <HourglassBottomIcon />
                    ) : order.status === "cancelled" ? (
                      <CancelIcon />
                    ) : (
                      <LocalShippingIcon />
                    )
                  }
                  label={order.status}
                  size="small"
                  color={
                    order.status === "delivered"
                      ? "success"
                      : order.status === "pending"
                        ? "warning"
                        : order.status === "cancelled"
                          ? "error"
                          : "default"
                  }
                />
              </div>
              <div>
                <strong>Amount Payable:</strong>
                <br /> Tk {order.total_amount}
              </div>
            </Box>

            {/* Ordered Items */}
            <Divider className="my-3" />
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Ordered Items
            </Typography>
            {order.items.map((item, idx) => (
              <Box
                key={idx}
                className="flex justify-between text-sm text-gray-700 mb-1"
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>Tk {item.subtotal}</span>
              </Box>
            ))}
          </Box>
        ))
      )}
    </Box>
  );
};

export default Orders;
