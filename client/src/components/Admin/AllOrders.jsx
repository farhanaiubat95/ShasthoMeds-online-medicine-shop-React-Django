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

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setStatusUpdate(order.status);
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
        `<li>${item.product_name} - ${item.quantity} x ${item.price} = ${item.subtotal}</li>`
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
      updateOrderStatus({ id: selectedOrder.id, data: { status: statusUpdate } })
    ).then(() => {
      dispatch(fetchOrders(token)); // auto-refresh
      handleClose();
    });
  };

  useEffect(() => {
    if (token) dispatch(fetchOrders(token));
  }, [dispatch, token]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">Error: {JSON.stringify(error)}</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 text-black overflow-x-auto">
      <h1 className="text-2xl font-semibold mb-4">All Orders</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">City</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Total Amount</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 text-center">{order.name}</td>
                <td className="px-6 py-4 text-center">{order.email}</td>
                <td className="px-6 py-4 text-center">{order.phone}</td>
                <td className="px-6 py-4 text-center">{order.city}</td>
                <td className="px-6 py-4 text-center">{order.total_amount}</td>
                <td className="px-6 py-4 text-center">{order.status}</td>
                <td className="px-6 py-4 text-center">
                  {order.payment_status === "paid" ? (
                    <Chip label="Paid" color="success" />
                  ) : (
                    <Select
                      size="small"
                      value={order.payment_status || "pending"}
                      onChange={(e) => {
                        dispatch(
                          updateOrderStatus({
                            id: order.id,
                            data: { payment_status: e.target.value },
                          })
                        ).then(() => dispatch(fetchOrders(token))); // auto-refresh
                      }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                  )}
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handlePrint(order)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => handleOpen(order)}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center px-6 py-4">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal for full order details */}
      <Modal open={open} onClose={handleClose}>
        <Box className="bg-white p-6 rounded-xl shadow-xl max-w-2xl mx-auto mt-24 relative outline-none">
          <IconButton
            className="absolute top-3 right-3"
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
          {selectedOrder && (
            <>
              <Typography variant="h5" className="font-bold mb-2">
                Order #{selectedOrder.id}
              </Typography>
              <Typography className="mb-1">Name: {selectedOrder.name}</Typography>
              <Typography className="mb-1">Email: {selectedOrder.email}</Typography>
              <Typography className="mb-1">Phone: {selectedOrder.phone}</Typography>
              <Typography className="mb-1">City: {selectedOrder.city}</Typography>
              <Typography className="mb-1">Address: {selectedOrder.address}</Typography>
              <Typography className="mb-1">Postal Code: {selectedOrder.postal_code}</Typography>
              <Divider className="my-2" />
              <Typography variant="subtitle1" className="font-semibold mb-1">
                Items:
              </Typography>
              {selectedOrder.items?.length > 0 ? (
                selectedOrder.items.map((item, idx) => (
                  <Typography key={idx} className="mb-1">
                    {item.product_name} × {item.quantity} = Tk {item.subtotal}
                  </Typography>
                ))
              ) : (
                <Typography>No items found</Typography>
              )}
              <Divider className="my-2" />
              <Typography className="font-semibold">
                Total Amount: Tk {selectedOrder.total_amount}
              </Typography>
              <Divider className="my-2" />
              {/* Status update inside modal */}
              <Box className="flex items-center gap-2 mt-2">
                <Typography>Status:</Typography>
                <Select
                  size="small"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                </Select>
                <Button variant="contained" size="small" onClick={handleStatusUpdate}>
                  Update
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AllOrders;
