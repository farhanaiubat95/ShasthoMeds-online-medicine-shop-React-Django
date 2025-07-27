import React, { useState } from "react";
import {
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import {
  AccountCircle,
  ShoppingCart,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// Components
import SearchBar from "./SearchBar.jsx";

// Styled Component for Rotating Arrow on Hover
const RotatingArrowIcon = styled(ArrowDropDownIcon)(({ theme }) => ({
  color: "#0F918F",
  fontSize: "35px",
  marginLeft: theme.spacing(1),
  transition: "transform 0.5s ease-in-out",
  // Rotate on hover of parent group
  ".group:hover &": {
    transform: "rotate(180deg)",
  },
}));

const LogCartIcon = () => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const open = Boolean(menuAnchor);

  const handleMenu = (event) => setMenuAnchor(event.currentTarget);
  const handleClose = () => setMenuAnchor(null);

  return (
    <Box className="flex items-center justify-end space-x-2 w-[67%] lg:w-[60%]">
      <div className="flex items-center justify-between space-x-2 w-full">
        {/* Search */}
        <div className="w-[60%] sm:w-[66%] lg:w-[76%] ml-5">
          <SearchBar />
        </div>

        {/* Login + Cart */}
        <div className="w-[40%] sm:w-[34%] ml-7 sm:ml-5 lg:ml-8 flex items-center justify-end">
          {/* Login Dropdown */}
          <div className="group cursor-pointer border-2 border-[#30C2C0] rounded h-[35px] sm:h-[40px] lg:h-[45px] flex items-center transition-all duration-300">
            <IconButton>
              <AccountCircle
                sx={{
                  color: "#0F918F",
                  fontSize: { xs: "25px", lg: "30px" },
                }}
              />
            </IconButton>

            {/* Menu Dropdown */}
            <Menu
              anchorEl={menuAnchor}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{
                sx: {
                  width: "200px",
                  mt: 1,
                  ml: "-63px",
                  borderRadius: "5px",
                  border: "2px solid #30C2C0",
                  color: "#0F918F",
                },
              }}
            >
              <MenuItem sx={{ fontSize: "18px" }} onClick={handleClose}>
                Login
              </MenuItem>
              <MenuItem sx={{ fontSize: "18px" }} onClick={handleClose}>
                Register
              </MenuItem>
              <MenuItem sx={{ fontSize: "18px" }} onClick={handleClose}>
                Profile
              </MenuItem>
            </Menu>

            {/* Hover-rotating arrow */}
            <RotatingArrowIcon onClick={handleMenu} />
          </div>

          {/* Cart Button */}
          <div className="cursor-pointer border-2 border-[#30C2C0] rounded md:p-3 ml-2 xl:ml-6 h-[35px] sm:h-[40px] lg:h-[45px] flex items-center">
            <IconButton>
              <Badge badgeContent={0} color="error">
                <ShoppingCart
                  sx={{
                    color: "#0F918F",
                    fontSize: { xs: "25px", lg: "30px" },
                  }}
                />
              </Badge>
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                color: "#0F918F",
                marginLeft: "10px",
                fontSize: "18px",
              }}
              className="hidden lg:flex"
            >
              Cart
            </Typography>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default LogCartIcon;
