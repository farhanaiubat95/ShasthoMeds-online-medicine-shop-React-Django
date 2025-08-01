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
import { registerUser } from "../api/authAPI.js"; // API call
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
toast.configure();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration failed. Please check inputs.");
      console.error(error);
      toast.error("Registration failed. Please check inputs.");
    }
  };

  return (
    <div className="flex bg-gray-100 my-5">
      <div className="hidden md:flex md:w-[40%] lg:w-1/2 items-center justify-center shadow-lg">
        <div className="relative w-full h-full">
          <img src={image1} alt="Registration Illustration" className="w-full h-full" />
          <div className="bg-black opacity-50 absolute inset-0">
            <div className="absolute top-20 left-2 lg:left-10">
              <h2 className="text-xl lg:text-3xl font-semibold text-white">Welcome to Shasthomeds</h2>
              <p className="text-white pt-5">
                “Let food be thy medicine and medicine be thy food.” ― Hippocrates
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[60%] lg:w-1/2 flex items-center justify-center py-10 px-5">
        <div className="w-full px-5 space-y-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Registration</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-5">
              <TextField name="name" value={formData.name} onChange={handleChange} required fullWidth label="Full Name" variant="outlined" sx={commonInputStyle} />
              <TextField name="username" value={formData.username} onChange={handleChange} required fullWidth label="Username" variant="outlined" sx={commonInputStyle} />
            </div>

            <div className="flex gap-5">
              <TextField name="email" value={formData.email} onChange={handleChange} required fullWidth label="Email" variant="outlined" sx={commonInputStyle} />
              <TextField name="phone" value={formData.phone} onChange={handleChange} required fullWidth label="Phone Number" variant="outlined" sx={commonInputStyle} />
            </div>

            <div className="flex gap-5">
              <TextField name="dob" value={formData.dob} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} variant="outlined" required sx={{ ...commonInputStyle, width: "50%" }} />
              <div className="w-[50%]">
                <FormControl component="fieldset" className="mb-4">
                  <FormLabel className="text-gray-700">Gender</FormLabel>
                  <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                    {["male", "female", "other"].map((val) => (
                      <FormControlLabel key={val} value={val} control={<Radio sx={{ color: "#0F918F", "&.Mui-checked": { color: "#0F918F" } }} />} label={val.charAt(0).toUpperCase() + val.slice(1)} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </div>
            </div>

            <div className="flex gap-5">
              <TextField name="city" value={formData.city} onChange={handleChange} fullWidth label="City" variant="outlined" sx={commonInputStyle} />
              <TextField name="address" value={formData.address} onChange={handleChange} fullWidth label="Address" variant="outlined" multiline rows={1} sx={commonInputStyle} />
            </div>

            <div className="flex gap-5">
              <TextField name="password" value={formData.password} onChange={handleChange} fullWidth label="Password" variant="outlined" type="password" required sx={commonInputStyle} />
              <TextField name="confirm_password" value={formData.confirm_password} onChange={handleChange} fullWidth label="Confirm Password" variant="outlined" type="password" required sx={commonInputStyle} />
            </div>

            <Button type="submit" variant="contained" fullWidth size="large" sx={{ backgroundColor: "#0F918F", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
              Register
            </Button>

            <p className="text-center text-gray-600">
              Already have an account? <a href="/login" className="text-[#0F918F] hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registerpage;
