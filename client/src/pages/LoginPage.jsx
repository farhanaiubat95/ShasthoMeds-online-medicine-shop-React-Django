import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showResendOTP, setShowResendOTP] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowResendOTP(false);
    setLoading(true);

    try {
      const res = await axios.post("https://shasthomeds-backend.onrender.com/login/", {
        email,
        password,
      });

      const { access, refresh, user } = res.data;

      // Save tokens and user info to localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch user data to Redux store
      dispatch(setUserData({ user, access, refresh }));

      // Show success message
      setSnackbar({ open: true, message: "Login successful!", severity: "success" });

      // Redirect after slight delay to allow Snackbar display
      setTimeout(() => {
        navigate("/myaccount");
      }, 500);
    } catch (error) {
      const errorMsg = error?.response?.data?.detail || "Invalid credentials.";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });

      if (errorMsg.toLowerCase().includes("not verified")) {
        setShowResendOTP(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await axios.post("https://shasthomeds-backend.onrender.com/resend-otp/", {
        email,
      });
      setSnackbar({ open: true, message: "OTP resent successfully!", severity: "info" });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Failed to resend OTP.",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box className="bg-white p-6 rounded shadow-md mt-10">
        <Typography variant="h4" gutterBottom align="center">
          Login to ShasthoMeds
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            variant="contained"
            fullWidth
            type="submit"
            size="large"
            className="mt-4"
            disabled={loading}
            sx={{
              backgroundColor: "#0F918F",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {showResendOTP && (
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Didn't receive OTP?{" "}
              <Link component="button" onClick={handleResendOTP}>
                Resend OTP
              </Link>
            </Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
