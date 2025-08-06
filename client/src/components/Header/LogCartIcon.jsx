import React, { useState } from "react";
import {
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { AccountCircle, ShoppingCart } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link, useNavigate } from "react-router-dom";

// Icons
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import Person2Icon from "@mui/icons-material/Person2";

import SearchBar from "./SearchBar.jsx";

import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/userSlice"; // Adjust path to your slice

// Styled rotating arrow
const RotatingArrowIcon = styled(ArrowDropDownIcon)(({ theme }) => ({
  color: "#0F918F",
  fontSize: "35px",
  marginLeft: theme.spacing(1),
  transition: "transform 0.5s ease-in-out",
  ".group:hover &": {
    transform: "rotate(180deg)",
  },
}));

const LogCartIcon = () => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const open = Boolean(menuAnchor);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user from Redux store
  const user = useSelector((state) => state.auth.user);

  const handleMenu = (event) => setMenuAnchor(event.currentTarget);
  const handleClose = () => setMenuAnchor(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    handleClose();
    navigate("/");
  };

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
            <IconButton onClick={handleMenu}>
              <AccountCircle
                sx={{
                  color: user ? "#007bff" : "#0F918F",
                  fontSize: { xs: "25px", lg: "30px" },
                }}
              />
              {user && (
                <Typography
                  sx={{
                    marginLeft: "5px",
                    color: "#007bff",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  {user.username}
                </Typography>
              )}
              <RotatingArrowIcon />
            </IconButton>

            {/* Menu Dropdown */}
            <Menu
              anchorEl={menuAnchor}
              open={open}
              onClose={handleClose}
              disableAutoFocusItem
              disableEnforceFocus
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
              {!user ? (
                // Not Logged In
                <>
                  <MenuItem onClick={handleClose} sx={{ fontSize: "18px" }}>
                    <Link to="/login" className="w-full block">
                      <LoginIcon /> <span className="ml-2">Login</span>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose} sx={{ fontSize: "18px" }}>
                    <Link to="/register" className="w-full block">
                      <HowToRegIcon /> <span className="ml-2">Register</span>
                    </Link>
                  </MenuItem>
                </>
              ) : (
                // Logged In
                <>
                  <MenuItem onClick={handleClose} sx={{ fontSize: "18px" }}>
                    <Link to="/profile" className="w-full block">
                      <Person2Icon /> <span className="ml-2">Profile</span>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ fontSize: "18px" }}>
                    <LogoutIcon /> <span className="ml-2">Logout</span>
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>

          {/* Cart Button */}
          <Link to="/cart" className="cursor-pointer">
            <div className="border-2 border-[#30C2C0] rounded md:p-3 ml-2 xl:ml-6 h-[35px] sm:h-[40px] lg:h-[45px] flex items-center">
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
          </Link>
        </div>
      </div>
    </Box>
  );
};

export default LogCartIcon;
