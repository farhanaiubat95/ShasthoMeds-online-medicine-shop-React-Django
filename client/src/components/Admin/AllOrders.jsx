import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../redux/orderSlice";

const AllOrders = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");

  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (token) dispatch(fetchOrders(token));
  }, [dispatch, token]);

  // Print a single order
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
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handlePrint(order)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Print
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center px-6 py-4">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllOrders;
