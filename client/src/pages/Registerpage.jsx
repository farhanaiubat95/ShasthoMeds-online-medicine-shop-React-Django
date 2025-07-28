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

function Registerpage() {
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
      <div className="w-full md:w-[60%]  lg:w-1/2 flex items-center justify-center py-10 px-5">
        <div className="w-full px-5 space-y-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Registration
          </h2>
          <form className="space-y-4">
            <div className="flex space-x-4 gap-5">
              <TextField
                required
                fullWidth
                label="Full Name"
                variant="outlined"
                placeholder="Enter your full name"
                sx={commonInputStyle}
              />
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                placeholder="shastho@91"
                required
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

            <div className="flex space-x-4 gap-5">
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                placeholder="Enter your password"
                sx={commonInputStyle}
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type="password"
                placeholder="Confirm your password"
                sx={commonInputStyle}
                required
              />
            </div>

            <Button
              variant="contained"
              fullWidth
              size="large"
              className="mt-4"
              sx={{
                backgroundColor: "#0F918F",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              Register
            </Button>

            <p className="text-center text-gray-600">
              Already have an account?{" "}
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
