import React from "react";
import { Routes, Route } from "react-router-dom";
// import { Toaster } from 'react-hot-toast';
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Registerpage from "../pages/Registerpage";
import Profile from "../pages/Profile";
import Cart from "../pages/Cart";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Registerpage />} />
      <Route path="/myprofile" element={<Profile />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
};

export default Routers;
