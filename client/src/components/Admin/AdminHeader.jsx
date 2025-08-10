// AdminHeader.jsx
import React, { useState } from "react";
import {
  Typography,
  AppBar,
  TextField,
  InputAdornment,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import {
  Search,
  AccountCircle,
  Logout,
  KeyboardArrowDown,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Link, Navigate } from "react-router-dom";

const AdminHeader = ({ onMenuClick, isMdUp }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [hovered, setHovered] = useState(false);

  // Example username — replace with your user data
  const username = "AdminUser";

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

 

  const handleLogout = () => {
    alert("Logout clicked");
    handleClose();
  };

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "#0a1e44",
        height: 64,
        px: 3,
        width: "100%",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
      }}
    >
      <Box
        className="flex items-center justify-between w-full py-3"
      >
        {/* Left section */}
        <Box className="w-[50%] " sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Show menu icon only on mobile */}
          {!isMdUp && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
              className="w-[10%] flex items-center justify-center bg-[#0F918F] rounded-l-md"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            className="w-[90%] "
            sx={{
              color: "#0F918F",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
            
          >
            
            <span className="text-xl lg:text-2xl">Shasthomeds</span> <span className="hidden lg:inline">- Online Medicine Store</span>
          </Typography>
        </Box>

        {/* Right section */}
        <Box
          className="w-[50%] "
        >
          <div className="flex items-center gap-2 w-full justify-end">
            {/* Search */}
            <Box className="w-[60%] lg:w-[80%] flex items-center justify-end">
              <TextField
                placeholder="Search Medicine"
                variant="outlined"
                size="small"
            
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
                height: { xs: 30 , md: 40}, // responsive minHeight
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "#0F918F",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0F918F",
                  boxShadow: "0 0 5px #0F918F",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255,255,255,0.7)",
                opacity: 1,
              },
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

            </Box>
          {/* User icon + username + arrow */}
            <Box
              className="w-[40%] lg:w-[20%]  flex items-center justify-center"
            sx={{ 
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "white",
              userSelect: "none",
              gap: 0.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
              <AccountCircle
                sx={{
                  width: { xs: 20, md: 25 },
                  height: { xs: 20, md: 25 },
                }}
              />

            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: 100,
              }}
            >
              {username}
            </Typography>
            <KeyboardArrowDown
              sx={{
                transition: "transform 0.3s ease",
                transform: hovered || open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>
          </div>
        </Box>

        {/* Account menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 180,
              "& .MuiMenuItem-root": {
                display: "flex",
                alignItems: "center",
                gap: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          
            
          <Link to="/admin/dashboard/profile">
            <MenuItem >
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
              Profile
              </MenuItem>
          </Link>


          <MenuItem >
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </AppBar>
  );
};

export default AdminHeader;
