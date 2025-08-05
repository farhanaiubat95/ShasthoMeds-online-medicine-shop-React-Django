import { TextField, Button, Snackbar, Alert } from "@mui/material";
import image1 from "../assets/images/reg-img.jpg";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// ✅ Redux
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice"; // update the path if different

const commonInputStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#0F918F" },
    "&:hover fieldset": { borderColor: "#0F918F" },
    "&.Mui-focused fieldset": { borderColor: "#0F918F" },
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  },
};

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ Redux dispatch

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [showResendOTP, setShowResendOTP] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowResendOTP(false);

    try {
      const res = await axios.post(
        "https://shasthomeds-backend.onrender.com/login/",
        { email, password }
      );

      const { access, refresh, user } = res.data;

      // Save to localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user_role", response.data.user.role);

      // Dispatch to Redux
      dispatch(setUserData({ user, access, refresh }));

      // Navigate
      navigate("/");

      // Show success message
      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error?.response?.data?.detail || "Invalid credentials.";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });

      if (errorMsg.toLowerCase().includes("not verified")) {
        setShowResendOTP(true);
      }
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setSnackbar({
        open: true,
        message: "Please enter your email first.",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://shasthomeds-backend.onrender.com/resend-otp/",
        { email }
      );

      setSnackbar({
        open: true,
        message: response.data.message || "OTP sent!",
        severity: "success",
      });
    } catch (error) {
      const errMsg = error?.response?.data?.detail || "Failed to resend OTP.";
      setSnackbar({ open: true, message: errMsg, severity: "error" });
    }
  };

  return (
    <div className="flex bg-gray-100 my-5">
      {/* Left Side image */}
      <div className="hidden md:flex md:w-[40%] lg:w-1/2 items-center justify-center shadow-lg">
        <div className="relative w-full h-full">
          <img
            src={image1}
            alt="Registration Illustration"
            className="w-full h-full"
          />
          <div className="bg-black opacity-50 absolute inset-0">
            <div className="absolute top-20 left-2 lg:left-10">
              <h2 className="text-xl lg:text-3xl font-semibold text-white">
                Welcome to Shasthomeds
              </h2>
              <p className="text-white pt-5">
                “Let food be thy medicine and medicine be thy food.” ―
                Hippocrates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-[60%] lg:w-1/2 py-12 px-5">
        <div className="w-full px-5">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Login</h2>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={commonInputStyle}
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={commonInputStyle}
              style={{ margin: "16px 0" }}
            />
            <Button
              variant="contained"
              fullWidth
              type="submit"
              size="large"
              className="mt-4"
              sx={{
                backgroundColor: "#0F918F",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              Login
            </Button>

            {showResendOTP && (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleResendOTP}
                className="mt-4"
                sx={{
                  borderColor: "#0F918F",
                  color: "#0F918F",
                  marginTop: "16px",
                }}
              >
                Resend OTP
              </Button>
            )}

            <p className="text-center text-gray-600 mt-4">
              Don't have any account?{" "}
              <Link to="/register" className="text-[#0F918F] hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default LoginPage;
