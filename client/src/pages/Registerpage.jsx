import React, { useState } from "react";
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import image1 from "../assets/images/reg-img.jpg";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const commonInputStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#0F918F" },
    "&:hover fieldset": { borderColor: "#0F918F" },
    "&.Mui-focused fieldset": { borderColor: "#0F918F" },
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  },
};

function Registerpage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    city: "",
    address: "",
    password: "",
    password2: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data Submitted:", formData);

    // Password match check
    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match!");
      return;
    }

    // Phone number validation (exactly 11 digits)
    const phonePattern = /^\d{11}$/; // only digits and exactly 11 characters
    if (!phonePattern.test(formData.phone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }

    const userData = {
      full_name: formData.full_name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      city: formData.city,
      address: formData.address,
      password: formData.password,
      password2: formData.password2,
    };

    try {
      const response = await axios.post(
        "https://shasthomeds-backend.onrender.com/api/register/",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      console.log("Response Data:", response.data);
      toast.success("Registration successful!");

      // Store email for OTP verification
      localStorage.setItem("otp_email", formData.email);
      setTimeout(() => navigate("/verify-otp"));

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Registration failed. Please check your input.";
      toast.error(message);
      setTimeout(() => navigate("/register"));
      throw error;
    }
  };

  return (
    <div className="flex bg-gray-100 my-5">
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

      <div className="w-full md:w-[60%] lg:w-1/2 flex items-center justify-center py-10 px-5">
        <div className="w-full px-5 space-y-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Registration
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-5">
              <TextField
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                fullWidth
                label="Full Name"
                variant="outlined"
                sx={commonInputStyle}
              />
              <TextField
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
                label="Username"
                variant="outlined"
                sx={commonInputStyle}
              />
            </div>
            <div className="flex space-x-4 gap-5">
              <TextField
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                label="Email"
                variant="outlined"
                placeholder="Enter your email"
                required
                sx={commonInputStyle}
              />

              <TextField
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                label="Phone Number"
                variant="outlined"
                placeholder="Enter your phone number"
                required
                sx={commonInputStyle}
              />
            </div>

            <div className="flex space-x-4 gap-5">
              <TextField
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                required
                sx={{
                  ...commonInputStyle,
                  width: "50%",
                }}
              />

              <div className="w-[50%]">
                <FormControl component="fieldset" className="mb-4">
                  <FormLabel component="legend" className="text-gray-700">
                    Gender
                  </FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="male"
                      control={
                        <Radio
                          sx={{
                            color: "#0F918F",
                            "&.Mui-checked": { color: "#0F918F" },
                          }}
                        />
                      }
                      label="Male"
                    />
                    <FormControlLabel
                      value="female"
                      control={
                        <Radio
                          sx={{
                            color: "#0F918F",
                            "&.Mui-checked": { color: "#0F918F" },
                          }}
                        />
                      }
                      label="Female"
                    />
                    <FormControlLabel
                      value="other"
                      control={
                        <Radio
                          sx={{
                            color: "#0F918F",
                            "&.Mui-checked": { color: "#0F918F" },
                          }}
                        />
                      }
                      label="Other"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            </div>

            <div className="flex space-x-4 gap-5">
              <TextField
                name="city"
                value={formData.city}
                onChange={handleChange}
                fullWidth
                label="City"
                variant="outlined"
                placeholder="Enter your city"
                sx={commonInputStyle}
              />

              <TextField
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                label="Address"
                variant="outlined"
                placeholder="Enter your address"
                multiline
                rows={1}
                sx={commonInputStyle}
              />
            </div>

            <div className="flex gap-5">
              <TextField
                name="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                required
                sx={commonInputStyle}
              />
              <TextField
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type="password"
                required
                sx={commonInputStyle}
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                backgroundColor: "#0F918F",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              Register
            </Button>

            <p className="text-center text-gray-600">
              Already have an account?{" "}
              {/* <Link to="/login" className="text-[#0F918F] hover:underline">
                Sign in
              </Link> */}
              <a href="/login" className="text-[#0F918F] hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registerpage;
