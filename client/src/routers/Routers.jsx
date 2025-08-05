import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Registerpage from "../pages/Registerpage";
import Profile from "../pages/Profile";
import Cart from "../pages/Cart";
import VerifyOTP from "../pages/VerifyOTP";
import ProtectedRoute from "./ProtectedRoute";
import ErrorPage from "../components/ErrorPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Routers = () => {
  user = JSON.parse(localStorage.getItem("user"));
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="*" element={<ErrorPage />} />

        {/* =========== Public Routes ========== */}
        {!user && (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Registerpage />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
          </>
        )}

        {/* =========== Protected Routes =========== */}
        {/* My Profile */}
        <Route
          path="/myprofile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* =========== Admin Routes =========== */}
        {/* <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </>
  );
};

export default Routers;
