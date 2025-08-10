// AdminDashboard.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  ListItemButton,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import {
  Person,
  Category,
  Payment,
  Notifications,
  Layers,
  Settings,
} from "@mui/icons-material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AdminHeader from "../components/Admin/AdminHeader";
import { Link, Outlet } from "react-router-dom";

const drawerWidth = 240;

const sidebarItems = [
  { text: "All User", icon: <PeopleOutlineIcon />, path: "/admin/dashboard/all-user" },
  { text: "Add Categories", icon: <Category />, path: "/admin/dashboard/category" },
  { text: "Add Product", icon: <AddShoppingCartIcon />, path: "/admin/dashboard/product" },
  { text: "Payment", icon: <Payment />, path: "/admin/dashboard/payment" },
  { text: "Order Notification", icon: <Notifications />, path: "/admin/dashboard/notification" },
];

const costData = [
  { name: "Page A", pv: 2400, uv: 1200 },
  { name: "Page B", pv: 1398, uv: 2210 },
  { name: "Page C", pv: 9800, uv: 2290 },
  { name: "Page D", pv: 3908, uv: 2000 },
  { name: "Page E", pv: 4800, uv: 2181 },
  { name: "Page F", pv: 3800, uv: 2500 },
  { name: "Page G", pv: 4300, uv: 2100 },
];

const productData = [
  { name: "Page A", pv: 2400, uv: 1200 },
  { name: "Page B", pv: 1398, uv: 2210 },
  { name: "Page C", pv: 9800, uv: 3900 },
  { name: "Page D", pv: 3908, uv: 4300 },
  { name: "Page E", pv: 4800, uv: 4900 },
  { name: "Page F", pv: 3800, uv: 4200 },
  { name: "Page G", pv: 4300, uv: 3900 },
];

export default function AdminDashboard() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

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
            <ListItemIcon sx={{ color: "white" }}>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        </ListItem>

      ))}
    </List>
  </Box>
);
  return (
    <Box sx={{
      display: "flex",

    }}>
      {/* Header with menu toggle */}
      <AdminHeader onMenuClick={handleDrawerToggle} isMdUp={isMdUp} />

      {/* Sidebar Drawer */}
      {/* Temporary drawer for mobile */}
      {!isMdUp && (
  <Drawer
    variant="temporary"
    open={mobileOpen}
    onClose={handleDrawerToggle}
    ModalProps={{
      keepMounted: true, // Better open performance on mobile.
    }}
    sx={{
      "& .MuiDrawer-paper": {
        width: drawerWidth,
        bgcolor: "#0a1e44",
        color: "white",
        py: mobileOpen ? 10 : 2, // paddingY changes based on open state
      },
    }}
  >
    {drawerContent}
  </Drawer>
)}


      {/* Permanent drawer for desktop */}
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

          mt: "64px", // header height
          width: {
            xs: "100%",
            md: `calc(100% - ${drawerWidth}px)`,
          },
          minHeight: "calc(100vh - 64px)",
          overflowY: "auto",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <div className="bg-[#0F918F] h-[40px] p-2">
         <Link to="/admin/dashboard" className="text-white hover:underline text-md lg:text-xl">Home</Link>
        </div>
        <div className="w-full bg-[#bad8db] h-[83vh] overflow-hidden">
          <div className="w-full h-full overflow-y-scroll ">
            <Outlet />
         </div>
        </div>
       
      </Box>
    </Box>
  );
}
