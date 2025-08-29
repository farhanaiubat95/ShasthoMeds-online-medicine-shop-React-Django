// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../axiosInstance"; // your configured axios

const PaymenSuccesfull = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // SSLCommerz will usually send query params like ?tran_id=XXXX
  const queryParams = new URLSearchParams(location.search);
  const tran_id = queryParams.get("tran_id");

  useEffect(() => {
    if (!tran_id) {
      setMessage("Transaction ID not found.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await axiosInstance.post("/orders/sslcommerz-payment-verify/", {
          tran_id: tran_id,
          status: "VALID", // if SSLCommerz tells frontend it's successful
        });

        setMessage(res.data.message);
      } catch (err) {
        console.error(err);
        setMessage("Payment verification failed.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [tran_id]);

  return (
    <Box
      sx={{
        mt: 10,
        mx: "auto",
        p: 4,
        maxWidth: 500,
        textAlign: "center",
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {loading ? (
        <Typography variant="h6">Verifying your payment...</Typography>
      ) : (
        <>
          <Typography variant="h5" mb={2}>
            Payment Status
          </Typography>
          <Typography mb={3}>{message}</Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#0F918F" }}
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </>
      )}
    </Box>
  );
};


export default PaymenSuccesfull

