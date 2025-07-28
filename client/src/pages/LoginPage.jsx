import React from "react";
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

const commonInputStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#0F918F",
    },
    "&:hover fieldset": {
      borderColor: "#0F918F",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0F918F",
    },
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  },
};

function LoginPage() {
  return (
    <div className="flex  bg-gray-100 my-5">
      {/* Left Side Illustration */}
      <div className="hidden  md:flex md:w-[40%] lg:w-1/2 items-center justify-center  shadow-lg">
        <div className="relative w-full h-full ">
          <img
            src={image1}
            alt="Registration Illustration"
            className="w-full h-full "
          />
          <div className="bg-black opacity-50 absolute  left-0 right-0 top-0 bottom-0">
            <div className="absolute top-20 left-2 lg:left-10 w-70 lg:w-100 ">
              <h2 className="text-xl lg:text-3xl font-semibold text-white ">
                Welcome to Shasthomeds
              </h2>
              <p className="text-white  pt-5">
                “Let food be thy medicine and medicine be thy food.” ―
                Hippocrates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-[60%]  lg:w-1/2  py-12 px-5">
        <div className="w-full px-5 ">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Login</h2>
          <form className="space-y-4">
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
              margin="normal"
              label="Password"
              variant="outlined"
              type="password"
              placeholder="Enter your password"
              sx={commonInputStyle}
              required
            />

            <Button
              variant="contained"
              fullWidth
              margin="normal"
              size="large"
              className="mt-4"
              sx={{
                backgroundColor: "#0F918F",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              Login
            </Button>

            <p className="text-center text-gray-600">
              Don't have any account?{" "}
              <a href="/register" className="text-[#0F918F] hover:underline">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
