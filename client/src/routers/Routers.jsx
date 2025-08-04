import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Registerpage from "../pages/Registerpage";
import Profile from "../pages/Profile";
import Cart from "../pages/Cart";
import VerifyOTP from "../pages/VerifyOTP";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Routers = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/myprofile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </>
  );
};

export default Routers;
