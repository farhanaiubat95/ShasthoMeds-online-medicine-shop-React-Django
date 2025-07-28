import { Box, Typography } from "@mui/material";
import React from "react";

const Navbar = ({ Title }) => {
  return (
    <div className="fixed w-full z-50">
      <Box
        className="flex items-center rounded-md  mb-4 mr-10 sm:mr-20 lg:mr-30  xl:mr-60"
        sx={{
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
        }}
      >
        <div className="w-[20%] md:w-[10%] flex items-center justify-center bg-[#0F918F] rounded-l-md">
          <Typography className="p-2 text-white">Home</Typography>
        </div>
        <div className="w-[80%] md:w-[90%] bg-[#30C2C0] text-white rounded-r-md">
          <Typography className="pl-5 md:pl-10 py-2">{Title}</Typography>
        </div>
      </Box>
    </div>
  );
};

export default Navbar;
