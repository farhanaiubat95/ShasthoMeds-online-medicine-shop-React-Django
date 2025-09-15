// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";

import { Category, Notifications } from "@mui/icons-material";
import { useDispatch } from "react-redux";

import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AdminHeader from "../components/Admin/AdminHeader";
import { Link, Outlet } from "react-router-dom";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { useSelector } from "react-redux";
import { fetchPrescriptions } from "../redux/prescriptionSlice";
import { fetchOrders } from "../redux/orderSlice";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";

const drawerWidth = 240;

const sidebarItems = [
  {
    text: "All User",
    icon: <PeopleOutlineIcon />,
    path: "/admin-dashboard/all-users",
  },
  {
    text: "Add Categories",
    icon: <Category />,
    path: "/admin-dashboard/all-categories",
  },
  {
    text: "Add Brands",
    icon: <LibraryBooksIcon />,
    path: "/admin-dashboard/all-brands",
  },
  {
    text: "Add Product",
    icon: <AddShoppingCartIcon />,
    path: "/admin-dashboard/all-products",
  },
  {
    text: "All Reports",
    icon: <AssessmentIcon />,
    path: "/admin-dashboard/all-reports",
  },
  {
    text: "All Details Reports",
    icon: <AssessmentIcon />,
    path: "/admin-dashboard/all-reports-collection",
  },
  {
    text: "All Doctors",
    icon: <LocalHospitalIcon />,
    path: "/admin-dashboard/all-doctors",
  },
  {
    text: "All Appoinments",
    icon: <BookmarkAddedIcon />,
    path: "/admin-dashboard/all-appointments",
  },
  {
    text: "All Orders",
    icon: <WidgetsIcon />,
    path: "/admin-dashboard/all-orders",
  },
  {
    text: "Notification",
    icon: <Notifications />,
    path: "/admin-dashboard/all-notifications",
  },
];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token) dispatch(fetchPrescriptions(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (token) dispatch(fetchOrders(token));
  }, [dispatch, token]);

  const ordersCount = useSelector((state) => state.orders.orders?.length || 0);
  const notificationsCount = useSelector(
    (state) => state.prescriptions.items?.results?.length || 0,
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  // Sidebar drawer content
  const drawerContent = (
    <Box>
      <List>
        {sidebarItems.map(({ text, icon, path }) => (
          <ListItem disablePadding key={text}>
            <ListItemButton component={Link} to={path} sx={{ color: "white" }}>
              <ListItemIcon sx={{ color: "white" }}>
                {text === "All Orders" ? (
                  <Badge badgeContent={ordersCount} color="error">
                    {icon}
                  </Badge>
                ) : text === "Notification" ? (
                  <Badge badgeContent={notificationsCount} color="error">
                    {icon}
                  </Badge>
                ) : (
                  icon
                )}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Header */}
      <AdminHeader onMenuClick={handleDrawerToggle} isMdUp={isMdUp} />

      {/* Sidebar Drawer */}
      {!isMdUp && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              bgcolor: "#0a1e44",
              color: "white",
              py: mobileOpen ? 10 : 2,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {isMdUp && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              bgcolor: "#0a1e44",
              color: "white",
              pt: 2,
              marginTop: "64px",
              height: "calc(100vh - 64px)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f4f4f9",
          mt: "64px",
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
      >
        <div className="bg-[#0F918F] h-[40px] p-2">
          <Link
            to="/admin-dashboard"
            className="text-white hover:underline text-md lg:text-xl"
          >
            Home
          </Link>
        </div>
        <div className="w-full bg-[#dbe3e4] h-[83vh] overflow-hidden">
          <div className="w-full h-full overflow-y-scroll">
            <Outlet />
          </div>
        </div>
      </Box>
    </Box>
  );
}
