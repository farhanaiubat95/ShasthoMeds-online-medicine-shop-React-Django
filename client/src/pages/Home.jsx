// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Typography, IconButton, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/Home/Sidebar";
import Navbar from "../components/Header/Navbar";
import { Outlet } from "react-router-dom"; // import Outlet for nested routing
import { fetchBrands } from "../redux/brandSlice";
import { useDispatch } from "react-redux";
import { fetchCategories } from "../redux/categorySlice";

export default function Home() {
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBrands()); // call the fetchBrands action
  }, [dispatch]);


   useEffect(() => {
    dispatch(fetchCategories()); // call the fetchCategories action
   }, [dispatch]);
  
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="pb-10">
      {/* Navbar */}
      <Navbar Title="Medicine Store" />

      <div className="flex min-h-screen relative w-full pt-15">
        {/* Mobile Menu Button */}
        <div className="md:hidden absolute top-15 left-4 z-50 ">
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </div>

        {/* Sidebar for md+ screens */}
        <div className="hidden md:block fixed z-10">
          <Typography variant="h6" className="pl-5 pb-2 text-gray-400">
            Store
          </Typography>
          <Sidebar />
        </div>

        {/* Drawer Sidebar for mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          className="block md:hidden"
        >
          <Typography variant="h6" className="pl-1 pb-2 pt-3 text-gray-400">
            Store
          </Typography>
          <Sidebar />
        </Drawer>

        {/* Main Content */}
        <main className="mt-11 md:ml-[270px] w-full flex-1 overflow-hidden">
          <div className="change-part">
            <Outlet /> {/* This will change only this part based on nested route */}
          </div>
        </main>
      </div>
    </div>
  );
}
