import React, { forwardRef } from "react";
import Image from "../../assets/images/logo.png";

const InvoiceTemplate = forwardRef(({ order }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#333",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            {order.company_name || "<Your Company Name>"}
          </h2>
          <p>{order.company_address || "<Shasthomeds>"}</p>
          <p>{order.company_contact || "<Contact no: +91 1234567890>"}</p>
        </div>
        <div>
          <img src={Image} alt="Logo" style={{ width: "80px" }} />
        </div>
      </div>

      <h1 style={{ marginTop: "30px", borderBottom: "2px solid #555" }}>
        INVOICE
      </h1>

      {/* Invoice Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div>
          <h4>Bill To:</h4>
          <p>Name : {order.name}</p>
          <p>Phone no: {order.phone}</p>
          <p>Email: {order.email}</p>
          <p>Address: {order.address}</p>
        </div>
        <div>
          <h4>Ship To:</h4>
          <p>Name:{order.name}</p>
          <p>
            Addressh: {order.city} - {order.postal_code}
          </p>
          <p>Phone no: {order.phone}</p>
        </div>
        <div>
          <p>
            <strong>DATE:</strong>{" "}
            {new Date(order.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Invoice No:</strong> #{order.id}
          </p>
          <p>
            <strong>Transaction:</strong> {order.tran_id}
          </p>
        </div>
      </div>

      {/* Table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead style={{ background: "#eee" }}>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Description
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Qty</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Unit Price
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total (TK)</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {item.product_name}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                ${item.price}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                ${item.subtotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <p>Subtotal: TK ${order.total_new_price}</p>
        <p>Discount: TK ${order.total_discount}</p>
        <p>
          Delivery charge: TK 40
        </p>
        <p>
          Grand Total: <strong>TK ${order.total_amount}</strong>
        </p>
      </div>

      <div style={{ marginTop: "40px", fontSize: "12px" }}>
        <p>
          <em>Remarks / Payment Instructions: Thank you for your business.</em>
        </p>
      </div>
    </div>
  );
});

export default InvoiceTemplate;
