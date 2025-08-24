import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";

// Components
import LogCartIcon from "./LogCartIcon.jsx";
// import Navbar from "./Navbar.jsx";

import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCart } from "../../redux/cartSlice.js";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const user = useSelector((state) => state.auth.user);


  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0} //removes default shadow
        sx={{ borderBottom: "none", boxShadow: "none", paddingY: "15px" }} // removes border and shadow
      >
        <Toolbar
          disableGutters
          sx={{ px: 0, py: 0 }}
          className="justify-between"
        >
          {/* Left - Mobile Menu */}
          <Box className="flex items-center w-[33%] lg:w-[40%] ">
            <IconButton
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{
                mr: 2,
                display: { xs: "block", lg: "none" },
                marginBottom: "5px",
              }}
            >
              <MenuIcon sx={{ color: "#0F918F" }} />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: "#0F918F",
                fontSize: { xs: "16px", sm: "20px", md: "25px", lg: "30px" },
              }}
            >
              {/* <Navbar /> */}
              <Link
                to="/"
                sx={{
                  color: "#0F918F",
                  fontSize: {
                    xs: "16px",
                    sm: "20px",
                    md: "25px",
                    lg: "30px",
                  },
                  textDecoration: "none",
                }}
              >
                Shasthomeds
              </Link>
            </Typography>
          </Box>

          {/* Right - Icons */}
          <LogCartIcon />
        </Toolbar>
      </AppBar>

      {/* Responsive Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 240 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {["HOME", "MEDICINE STORE", "ABOUT", "CONTACT"].map((text) => (
              <ListItem button key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
