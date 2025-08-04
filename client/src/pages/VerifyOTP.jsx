import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // ✅ Load email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("otp_email");
    if (!storedEmail) {
      toast.error("No email found. Please register again.");
      navigate("/register");
    } else {
      setEmail(storedEmail);
    }
  }, []);

  const handleChange = (index, value) => {
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next box automatically
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      toast.error("Please enter the full 6-digit OTP.");
      return;
    }

    try {
      const response = await axios.post(`https://shasthomeds-backend.onrender.com/verify-otp/`, {
        email,
        otp: finalOtp,
      });

      toast.success(response.data.message || "OTP verified successfully.");
      localStorage.removeItem("otp_email"); // Clean up
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "OTP verification failed.");
    }
  };

  const handleResend = () => {
    toast.info("Resending OTP...");
    
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 px-4">
      <div className="my-24 bg-white p-8 rounded-2xl shadow-xl shadow-[#63b1af] w-full max-w-xl">
        <h2 className="text-2xl font-semibold text-center text-[#63b1af]">Verify OTP</h2>
        <p className="text-center text-gray-600 mt-2">Enter the 6-digit code sent to <strong>{email}</strong></p>

        <div className="flex justify-center gap-2 mt-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              maxLength="1"
              className="w-12 h-12 border border-[#63b1af] text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F918F]"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="cursor-pointer w-full mt-6 bg-[#0F918F] text-white py-2 rounded-md hover:bg-[#63b1af] transition"
        >
          Verify OTP
        </button>

        <div className="text-center mt-4 text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            className="text-[#0F918F] hover:underline font-medium cursor-pointer"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
