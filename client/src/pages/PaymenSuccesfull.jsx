// src/pages/PaymentSuccess.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read transaction id from query param (if exists)
  const queryParams = new URLSearchParams(location.search);
  const tran_id = queryParams.get("tran_id");

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
      <Typography variant="h5" mb={2} color="green">
        Payment Successful
      </Typography>

      {tran_id && (
        <Typography mb={2}>
          Transaction ID: <strong>{tran_id}</strong>
        </Typography>
      )}

      <Button
        variant="contained"
        sx={{ backgroundColor: "#0F918F" }}
        onClick={() => navigate("/myaccount/orders")}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default PaymentSuccess;
