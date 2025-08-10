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
} from "@mui/material";

import {
  Search,
  AccountCircle,
  Logout,
  KeyboardArrowDown,
} from "@mui/icons-material";

const AdminHeader = () => {
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

  const handleProfile = () => {
    alert("Go to profile");
    handleClose();
  };

  const handleLogout = () => {
    alert("Logout clicked");
    handleClose();
  };

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
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          py: 2,
        }}
      >
        {/* Title */}
        <div className="w-[50%]">
          <Typography
            variant="h5"
            sx={{
              color: "#0F918F",
              fontWeight: 700,
            }}
          >
            Shasthomeds - Online Medicine Store
          </Typography>
        </div>

        <div className="flex items-center gap-4 w-[50%]">
          {/* Search */}

          <TextField
            placeholder="Search Medicine"
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
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

          {/* User icon + username + arrow */}
          <Box
            sx={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "white",
              userSelect: "none",
              gap: 0.5,
              fontWeight: 600,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <AccountCircle sx={{ fontSize: 30 }} />
            <Typography>{username}</Typography>
            <KeyboardArrowDown
              sx={{
                transition: "transform 0.3s ease",
                transform: hovered || open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>
        </div>

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
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>

          <MenuItem onClick={handleLogout}>
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
