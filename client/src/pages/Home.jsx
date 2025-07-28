// src/pages/Home.jsx
import React, { useState } from "react";
import { Typography, IconButton, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/Home/Sidebar";
import ProductCard from "../components/product/ProductCard";
import BannerCarousel from "../components/Home/BannerCarousel";
import Navbar from "../components/Header/Navbar";

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <main className="mt-11 md:ml-[270px] w-full flex-1 ">
          <div className="border border-[#30C2C0] rounded-xl p-2">
            <BannerCarousel />
          </div>

          <ProductCard />
        </main>
      </div>
    </div>
  );
}
