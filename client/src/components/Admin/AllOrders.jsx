import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderStatus } from "../../redux/orderSlice";
import {
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  Modal,
  MenuItem,
  Select,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import PreviewIcon from "@mui/icons-material/Preview";

// ... imports remain same

const AllOrders = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");

  const ordersState = useSelector((state) => state.orders) || {};
  const orders = ordersState.orders?.results || [];
  const loading = ordersState.loading || false;
  const error = ordersState.error || null;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [paymentUpdate, setPaymentUpdate] = useState("");

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setStatusUpdate(order.status);
    setPaymentUpdate(order.payment_status);
    setOpen(true);
  };
  const handleClose = () => {
    setSelectedOrder(null);
    setOpen(false);
  };

  const handlePrint = (order) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<h1>Order #${order.id}</h1>`);
    printWindow.document.write(`<p>Name: ${order.name}</p>`);
    printWindow.document.write(`<p>Email: ${order.email}</p>`);
    printWindow.document.write(`<p>Phone: ${order.phone}</p>`);
    printWindow.document.write(`<p>City: ${order.city}</p>`);
    printWindow.document.write("<h3>Items:</h3>");
    printWindow.document.write("<ul>");
    order.items.forEach((item) => {
      printWindow.document.write(
        `<li>${item.product_name} - ${item.quantity} x ${item.price} = ${item.subtotal}</li>`,
      );
    });
    printWindow.document.write("</ul>");
    printWindow.document.write(`<p>Total Amount: ${order.total_amount}</p>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder) return;
    dispatch(
      updateOrderStatus({
        id: selectedOrder.id,
        data: { status: statusUpdate },
      }),
    ).then(() => {
      dispatch(fetchOrders(token));
      handleClose();
    });
  };

  const handlePaymentUpdate = () => {
    if (!selectedOrder) return;
    dispatch(
      updateOrderStatus({
        id: selectedOrder.id,
        data: { payment_status: paymentUpdate },
      }),
    ).then(() => {
      dispatch(fetchOrders(token));
      handleClose();
    });
  };

  // useEffect(() => {
  //   if (token) dispatch(fetchOrders(token));
  // }, [dispatch, token]);

  if (loading) return <p>Loading orders...</p>;
  if (error)
    return <p className="text-red-600">Error: {JSON.stringify(error)}</p>;

  // Allowed status transitions
  const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return ["processing", "cancelled", "delivered"];
      case "processing":
        return ["cancelled", "delivered"];
      default:
        return []; // cancelled/delivered → final
    }
  };

  // Allowed payment transitions
  const getAvailablePaymentOptions = (currentPayment) => {
    switch (currentPayment) {
      case "pending":
        return ["paid", "failed", "refunded"];
      case "failed":
        return ["refunded"];
      default:
        return []; // paid/refunded → final
    }
  };

  const statusLabels = {
    pending: "Pending",
    processing: "Processing",
    cancelled: "Cancelled",
    delivered: "Delivered",
  };

  const paymentLabels = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 text-black overflow-x-auto">
      <h1 className="text-2xl font-semibold mb-4">All Orders</h1>
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Products</th>
            <th className="px-4 py-3">Total Amount</th>
            <th className="px-4 py-3">Total New Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => {
              const availableStatus = getAvailableStatusOptions(order.status);
              const availablePayments = getAvailablePaymentOptions(
                order.payment_status,
              );

              return (
                <tr key={order.id}>
                  <td className="px-4 py-2">{order.name}</td>
                  <td className="px-4 py-2">{order.email}</td>
                  <td className="px-4 py-2">{order.phone}</td>
                  <td className="px-4 py-2">{order.city}</td>
                  <td className="px-4 py-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.product_name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2">{order.total_amount}</td>
                  <td className="px-4 py-2">{order.total_new_price}</td>
                  <td className="px-4 py-2">
                    {availableStatus.length > 0 ? (
                      <Select
                        size="small"
                        value={order.status}
                        onChange={(e) =>
                          dispatch(
                            updateOrderStatus({
                              id: order.id,
                              data: { status: e.target.value },
                            }),
                          ).then(() => dispatch(fetchOrders(token)))
                        }
                      >
                        <MenuItem value={order.status}>
                          {statusLabels[order.status]}
                        </MenuItem>
                        {availableStatus.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {statusLabels[opt]}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip label={statusLabels[order.status]} />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {availablePayments.length > 0 ? (
                      <Select
                        size="small"
                        value={order.payment_status}
                        onChange={(e) =>
                          dispatch(
                            updateOrderStatus({
                              id: order.id,
                              data: { payment_status: e.target.value },
                            }),
                          ).then(() => dispatch(fetchOrders(token)))
                        }
                      >
                        <MenuItem value={order.payment_status}>
                          {paymentLabels[order.payment_status]}
                        </MenuItem>
                        {availablePayments.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {paymentLabels[opt]}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip label={paymentLabels[order.payment_status]} />
                    )}
                  </td>
                  <td className="px-2 py-2 flex items-center justify-between">
                    <button
                      onClick={() => handleOpen(order)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      <PreviewIcon />
                    </button>
                    <button
                      onClick={() => handlePrint(order)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      <LocalPrintshopIcon />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="10" className="text-center py-4">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          className="bg-white p-6 rounded-xl shadow-xl max-w-3xl mx-auto relative outline-none"
          sx={{
            mt: "5%",
            maxHeight: "90vh", // max height relative to viewport
            overflowY: "auto", // enable vertical scroll
          }}
        >
          <IconButton className="absolute top-3 right-3" onClick={handleClose}>
            <CloseIcon />
          </IconButton>

          {selectedOrder && (
            <>
              <Typography variant="h5" className="font-bold mb-2">
                Order #{selectedOrder.id}
              </Typography>

              {/* Customer Info */}
              <Box className="mb-4">
                <Typography variant="subtitle1" fontWeight="bold">
                  Customer Info
                </Typography>
                <Typography>Name: {selectedOrder.name}</Typography>
                <Typography>Email: {selectedOrder.email}</Typography>
                <Typography>Phone: {selectedOrder.phone}</Typography>
                <Typography>City: {selectedOrder.city}</Typography>
                <Typography>
                  Postal Code: {selectedOrder.postal_code}
                </Typography>
                <Typography>Address: {selectedOrder.address}</Typography>
              </Box>

              {/* Payment Info */}
              <Box className="mb-4">
                <Typography variant="subtitle1" fontWeight="bold">
                  Payment Info
                </Typography>
                <Typography>
                  Payment Method: {selectedOrder.payment_method}
                </Typography>
                <Typography>
                  Payment Status: {selectedOrder.payment_status}
                </Typography>
                <Typography>Transaction ID: {selectedOrder.tran_id}</Typography>
              </Box>

              {/* Order Items */}
              <Box className="mb-4">
                <Typography variant="subtitle1" fontWeight="bold">
                  Products
                </Typography>
                {selectedOrder.items?.map((item, idx) => (
                  <Box key={idx} className="mb-1">
                    <Typography>Product ID: {item.product_id}</Typography>
                    <Typography>Product Name: {item.product_name}</Typography>
                    <Typography>Quantity: {item.quantity}</Typography>
                    <Typography>Price: {item.price}</Typography>
                    <Typography>Subtotal: {item.subtotal}</Typography>
                    <Divider className="my-1" />
                  </Box>
                ))}
              </Box>

              {/* Totals */}
              <Box className="mb-4">
                <Typography variant="subtitle1" fontWeight="bold">
                  Totals
                </Typography>
                <Typography>
                  Total Price: {selectedOrder.total_price}
                </Typography>
                <Typography>
                  Total Discount: {selectedOrder.total_discount}
                </Typography>
                <Typography>
                  Total New Price: {selectedOrder.total_new_price}
                </Typography>
                <Typography>
                  Total Amount: {selectedOrder.total_amount}
                </Typography>
              </Box>

              {/* Status Update */}
              <Box className="flex items-center gap-2 mt-2">
                <Typography>Status:</Typography>
                {["cancelled", "delivered"].includes(selectedOrder.status) ? (
                  <Chip label={statusLabels[selectedOrder.status]} />
                ) : (
                  <>
                    <Select
                      size="small"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                    >
                      <MenuItem value={selectedOrder.status}>
                        {statusLabels[selectedOrder.status]}
                      </MenuItem>
                      {getAvailableStatusOptions(selectedOrder.status).map(
                        (opt) => (
                          <MenuItem key={opt} value={opt}>
                            {statusLabels[opt]}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleStatusUpdate}
                    >
                      Update
                    </Button>
                  </>
                )}
              </Box>

              {/* Payment Update */}
              <Box className="flex items-center gap-2 mt-2">
                <Typography>Payment:</Typography>
                {["paid", "refunded"].includes(selectedOrder.payment_status) ? (
                  <Chip label={paymentLabels[selectedOrder.payment_status]} />
                ) : (
                  <>
                    <Select
                      size="small"
                      value={paymentUpdate}
                      onChange={(e) => setPaymentUpdate(e.target.value)}
                    >
                      <MenuItem value={selectedOrder.payment_status}>
                        {paymentLabels[selectedOrder.payment_status]}
                      </MenuItem>
                      {getAvailablePaymentOptions(
                        selectedOrder.payment_status,
                      ).map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {paymentLabels[opt]}
                        </MenuItem>
                      ))}
                    </Select>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handlePaymentUpdate}
                    >
                      Update
                    </Button>
                  </>
                )}
              </Box>

              {/* Created / Updated */}
              <Box className="mt-4">
                <Typography variant="caption">
                  Created At: {selectedOrder.created_at}
                </Typography>
                <Typography variant="caption">
                  Updated At: {selectedOrder.updated_at}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AllOrders;
