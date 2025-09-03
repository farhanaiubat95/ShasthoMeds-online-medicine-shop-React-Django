import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Divider,
  Modal,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { createOrder } from "../redux/orderSlice.js";
import { clearCart } from "../redux/cartSlice.js";

const Checkout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const orderData = location.state; // Passed from Cart page
  const {
    items = [],
    totalPrice = 0,
    totalNewPrice = 0,
    totalDiscount = 0,
    totalAmount = 0,
    quantities,
  } = orderData || {};

  const authUser = useSelector((state) => state.auth.user); // Get real user data

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [openModal, setOpenModal] = useState(false);

  // Submit check
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize user info from auth.user
  const [userInfo, setUserInfo] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    city: authUser?.city || "",
    postalCode: authUser?.postalCode || "",
    address: authUser?.address || "",
  });

  useEffect(() => {
    // Update user info if authUser changes
    if (authUser) {
      setUserInfo({
        name: authUser.full_name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        city: authUser.city || "",
        postalCode: authUser.postalCode || "",
        address: authUser.address || "",
      });
    }
  }, [authUser]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = value.replace(/\D/g, "");
      if (value.length > 0 && value[0] !== "0") value = "0" + value;
      value = value.slice(0, 11);
    }

    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleConfirm = async () => {
    if (isSubmitting) return; // prevent double click

    // Validate postal code
    if (!userInfo.postalCode || userInfo.postalCode.trim() === "") {
      alert("Please fill in your postal code.");
      return;
    }

    setIsSubmitting(true); // disable button

    const orderPayload = {
      user: authUser?.id,
      payment_method: paymentMethod,
      status: "pending",
      payment_status: "pending",
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
      city: userInfo.city,
      postal_code: userInfo.postalCode,
      address: userInfo.address,
      items: orderData.items.map((i) => ({
        product_id: i.productId,
        product_name: i.productName,
        quantity: i.quantity,
        price: i.productPrice,
        subtotal: i.quantity * i.productPrice,
      })),
      total_price: orderData.totalPrice,
      total_new_price: orderData.totalNewPrice,
      total_discount: orderData.totalDiscount,
      total_amount: orderData.totalAmount,
    };

    const token = localStorage.getItem("access_token");

    try {
      const res = await dispatch(createOrder({ orderPayload, token }));

      dispatch(clearCart());

      if (paymentMethod === "cod") {
        // COD: show confirmation modal
        setOpenModal(true);
      } else {
        const data = res.payload;
        // Card payment: redirect to SSLCommerz gateway
        if (data && data.GatewayPageURL) {
          window.location.href = data.GatewayPageURL;
        } else {
          alert("Payment page not found!");
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        "Failed to place order: " + (err.response?.data?.detail || err.message),
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      maxWidth="1200px"
      mx="auto"
      mt={10}
      className="xl:h-[830px]"
      p={isMobile ? 2 : 4}
      bgcolor="#fff"
      borderRadius={2}
      sx={{
        boxShadow:
          "rgb(15 143 145) 0px 1px 3px 0px, rgb(73 198 200 / 55%) 0px 0px 0px 1px",
      }}
    >
      <Typography
        variant="h4"
        textAlign="center"
        mb={4}
        sx={{ color: "#0F918F" }}
      >
        Checkout
      </Typography>

      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={4}>
        {/* Left Section: Order Items */}
        <Box
          flex={1}
          p={2}
          border="1px solid #ccc"
          borderRadius={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Typography
            variant="h6"
            mb={2}
            sx={{
              position: "sticky",
              top: 0,
              bgcolor: "#fff",
              zIndex: 10,
              py: 1,
              borderBottom: "1px solid #ccc",
              color: "#0F918F",
            }}
          >
            Your Items ({items.length})
          </Typography>

          <Box sx={{ flexGrow: 1, maxHeight: "600px", overflowY: "auto" }}>
            {items.map((item, idx) => (
              <Box
                key={idx}
                mb={2}
                borderBottom="1px solid #eee"
                pb={1}
                display="flex"
                gap={2}
              >
                <Box className="font-bold px-3 w-[10%]">{idx + 1}</Box>
                <Box className="w-[90%]">
                  <Typography fontWeight="bold">{item.productName}</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Typography>Price: Tk {item.productPrice} each</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Section */}
        <Box
          flex={1.2}
          p={2}
          border="1px solid #ccc"
          borderRadius={2}
          sx={{
            height: isMobile ? "auto" : { xl: "700px", lg: "auto" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Address */}
          <Typography variant="h6" mb={2} sx={{ color: "#0F918F" }}>
            Shipping Address
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
            gap={2}
          >
            <TextField
              label="Full Name"
              name="name"
              value={userInfo.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Phone Number"
              name="phone"
              value={userInfo.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={userInfo.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="City"
              name="city"
              value={userInfo.city}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Postal Code"
              name="postalCode"
              value={userInfo.postalCode}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Address Line"
              name="address"
              value={userInfo.address}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Payment */}
          <Typography variant="h6" mb={2} sx={{ color: "#0F918F" }}>
            Payment Method
          </Typography>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            row
          >
            <FormControlLabel
              value="cod"
              control={<Radio />}
              label="Cash on Delivery"
            />
            <FormControlLabel
              value="card"
              control={<Radio />}
              label="Credit/Debit Card"
            />
          </RadioGroup>

          <Divider sx={{ my: 3 }} />

          {/* Summary */}
          <Typography variant="h6" mb={1} sx={{ color: "#0F918F" }}>
            Order Summary
          </Typography>
          <Typography>Regular Price: Tk {totalPrice.toFixed(2)}</Typography>
          <Typography>Offer price: Tk {totalNewPrice.toFixed(2)}</Typography>
          <Typography>Delivery Charges: Tk 40</Typography>
          <Typography variant="h6" mt={1}>
            Total: Tk {totalAmount.toFixed(2)}
          </Typography>
          <Typography color="green">
            You save Tk {totalDiscount.toFixed(2)}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#0F918F",
            }}
            onClick={handleConfirm}
            disabled={isSubmitting} // disables button
          >
            {isSubmitting ? "Processing..." : "Confirm Order"}
          </Button>
        </Box>
      </Box>

      {/* Confirmation Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          p={4}
          bgcolor="white"
          boxShadow={4}
          borderRadius={2}
          sx={{
            width: 400,
            mx: "auto",
            mt: "20vh",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" mb={2}>
            Order Confirmed!
          </Typography>
          <Typography mb={3}>
            Thank you! Your items will be delivered soon.
          </Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#0F918F" }}
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Checkout;
