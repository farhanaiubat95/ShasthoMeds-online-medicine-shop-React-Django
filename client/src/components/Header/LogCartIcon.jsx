import React, { useState, useEffect } from "react";
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

import MedicalServicesIcon from "@mui/icons-material/MedicalServices"; // add import
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import Person2Icon from "@mui/icons-material/Person2";
import { Dashboard } from "@mui/icons-material";

import SearchBar from "./SearchBar.jsx";
import ArchiveIcon from "@mui/icons-material/Archive";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/userSlice";
import { fetchCart } from "../../redux/cartSlice";

// Styled rotating arrow
const RotatingArrowIcon = styled(ArrowDropDownIcon)(({ theme }) => ({
  color: "#0F918F",
  fontSize: "35px",
  marginLeft: theme.spacing(1),
  transition: "transform 0.5s ease-in-out",
  ".group:hover &": { transform: "rotate(180deg)" },
}));

const LogCartIcon = () => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const open = Boolean(menuAnchor);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.access_token);
  const cartitems = useSelector((state) => state.carts.items);

  // Fetch cart after login or page reload if token exists
  useEffect(() => {
    const savedToken = token || localStorage.getItem("access_token");
    if (savedToken) {
      dispatch(fetchCart(savedToken));
    }
  }, [token, dispatch]);

  const cartCount = cartitems.length;

  const handleMenu = (event) => setMenuAnchor(event.currentTarget);
  const handleClose = () => setMenuAnchor(null);
  const handleLogout = () => {
    dispatch(logoutUser());
    handleClose();
    navigate("/login");
  };

  return (
    <Box className="flex items-center justify-end space-x-2 w-[67%] lg:w-[60%]">
      <div className="flex items-center justify-between space-x-2 w-full">
        <div className="flex-2 ml-5">
          <SearchBar />
        </div>

        <div className=" flex items-center justify-end">
          {/* Login Dropdown */}
          <div className="group cursor-pointer border-2 border-[#30C2C0] rounded h-[35px] sm:h-[40px] lg:h-[45px] flex items-center transition-all duration-300">
            <IconButton onClick={handleMenu}>
              <AccountCircle
                sx={{
                  color: user ? "#007bff" : "#0F918F",
                  fontSize: { xs: "25px", lg: "30px" },
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              />
              {user && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "#08CB00",
                    marginLeft: "10px",
                    fontSize: { xs: "12px", lg: "16px" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                    maxWidth: {
                      xs: "40px", // small screen
                      sm: "50px", // medium screen
                      md: "80px", // medium screen
                    },
                  }}
                >
                  {user.username}
                </Typography>
              )}
              <RotatingArrowIcon />
            </IconButton>

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
                <>
                  <MenuItem onClick={handleClose} sx={{ fontSize: "18px" }}>
                    <Link to="/myaccount/profile" className="w-full block">
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
          {user?.role === "user" && (
            <>
              <Link to="/myaccount/orders" className="cursor-pointer">
                <div className="border-2 border-[#30C2C0] rounded md:p-3 ml-2 h-[35px] sm:h-[40px] lg:h-[45px] flex items-center">
                  <IconButton>
                    <ArchiveIcon
                      sx={{
                        color: "#0F918F",
                        fontSize: { xs: "25px", lg: "30px" },
                      }}
                    />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#0F918F",
                      fontSize: "18px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: {
                        sm: "40px", // small screen
                        md: "50px", // medium screen
                        lg: "100px", // large screen
                      },
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                    }}
                  >
                    Order Details
                  </Typography>
                </div>
              </Link>
            </>
          )}

          {/* Cart / Dashboard Button */}
          {user?.role === "user" ? (
            <Link to="/myaccount/cart" className="cursor-pointer">
              <div className="border-2 border-[#30C2C0] rounded md:p-3 ml-2  xl:ml-2 h-[35px] sm:h-[40px] lg:h-[45px] flex items-center">
                <IconButton>
                  <Badge badgeContent={cartCount} color="error">
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
          ) : user?.role === "admin" ? (
            <Link to="/admin-dashboard" className="cursor-pointer">
              <div className="border-2 border-[#30C2C0] rounded md:p-3 ml-2 xl:ml-2 h-[35px] sm:h-[40px] lg:h-[45px] flex items-center">
                <IconButton>
                  <Badge badgeContent={0} color="error">
                    {" "}
                    {/* replace 0 with actual count if needed */}
                    <Dashboard
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
                  Dashboard
                </Typography>
              </div>
            </Link>
          ) : null}
        </div>

        <div className="flex items-center justify-end">
          <Link to="/doctor-appointment" className="cursor-pointer">
            <div className="border-2 border-[#30C2C0] rounded md:p-3  h-[35px] sm:h-[40px] lg:h-[45px] flex items-center">
              <IconButton>
                <MedicalServicesIcon
                  sx={{
                    color: "#0F918F",
                    fontSize: { xs: "25px", lg: "30px" },
                  }}
                />
              </IconButton>
              <Typography
                variant="body1"
                sx={{
                  color: "#0F918F",
                  fontSize: "18px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: {
                    sm: "30px", // small screen
                    md: "50px", // medium screen
                    lg: "120px", // large screen
                    xl: "130px", // extra large screen
                  },
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                Doctor's Appointment
              </Typography>
            </div>
          </Link>
        </div>
      </div>
    </Box>
  );
};

export default LogCartIcon;
