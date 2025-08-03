import React, { useState, useEffect } from "react";
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
import { getCsrfToken } from "../api/authAPI.js";
import { Link } from "react-router-dom";

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
    name: "",
    username: "",
    email: "",
    phone: "",
    dob: "",
    gender: "male",
    city: "",
    address: "",
    password: "",
    confirm_password: "",
  });
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    // Fetch CSRF token on mount to handle refreshes
    const fetchCsrfToken = async () => {
      try {
        const token = await getCsrfToken();
        setCsrfToken(token);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
        toast.error("Failed to initialize. Please refresh the page.");
      }
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data Submitted:", formData);

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!csrfToken) {
      toast.error("CSRF token not available. Please refresh the page.");
      return;
    }

    try {
      const response = await fetch(
        "https://shasthomeds-backend.onrender.com/api/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            gender: formData.gender,
            city: formData.city,
            address: formData.address,
            password: formData.password,
            confirm_password: formData.confirm_password,
          }),
        },
      );

      const data = await response.json();
      console.log("Response Data:", data);
      if (response.ok) {
        toast.success("Registration successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.message ||
          "Registration failed. Please check inputs or try again later.",
      );
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
                name="name"
                value={formData.name}
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
                fullWidth
                label="Email"
                variant="outlined"
                placeholder="Enter your email"
                required
                sx={commonInputStyle}
              />
              <TextField
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
                  <RadioGroup row name="gender" defaultValue="preferNotToSay">
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
                fullWidth
                label="City"
                variant="outlined"
                placeholder="Enter your city"
                sx={commonInputStyle}
              />
              <TextField
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
                name="confirm_password"
                value={formData.confirm_password}
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
              <Link to="/login" className="text-[#0F918F] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registerpage;
