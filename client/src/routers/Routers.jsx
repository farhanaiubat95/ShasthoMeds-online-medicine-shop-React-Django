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
import AuthProtectedRoute from "./AuthProtectedRoute";
import CustomerLayout from "../Layout/CustomerLayout";
import ProductDetail from "../components/product/ProductDetail";
import HomeMain from "../components/Home/HomeMain";

// import AdminLayout from "../Layout/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import Main from "../components/Admin/Main";
import AllCategories from "../components/Admin/AllCategories";
import AllCustomer from "../components/Admin/AllCustomer";
import AllBrand from "../components/Admin/AllBrand";
import AllOrders from "../components/Admin/AllOrders";
import AllProducts from "../components/Admin/AllProducts";
import AllNotification from "../components/Admin/AllNotification";
import AllReports from "../components/Admin/AllReports.jsx";

import Findpagecheck from "../components/product/Findpagecheck";
import Checkout from "../pages/CheckOut";
import Paymen_succesfull from "../pages/PaymenSuccesfull";
import Orders from "../pages/Orders";


const Routers = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Home with nested pages */}
        <Route path="/" element={<Home />}>
          <Route index element={<HomeMain />} />
          <Route path="productdetails/:id" element={<ProductDetail />} />
        </Route>

        {/* Public routes only for NON-logged-in users */}
        <Route element={<AuthProtectedRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Registerpage />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/myaccount" element={<CustomerLayout />}>
            <Route path="profile" element={<Profile />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route index element={<Main />} />
            <Route path="all-categories" element={<AllCategories />} />
            <Route path="all-brands" element={<AllBrand />} />
            <Route path="all-orders" element={<AllOrders />} />
            <Route path="all-products" element={<AllProducts/>} />
            <Route path="profile" element={<Profile />} />
            <Route path="all-users" element={<AllCustomer />} />
            <Route path="all-reports" element={<AllReports />} />
            <Route path="all-notifications" element={<AllNotification />} />
          </Route>
        </Route>

        {/* Catch-All */}
        <Route path="*" element={<ErrorPage />} />
        <Route path="/check" element={<Findpagecheck />} />
        <Route path="/payment-success" element={<Paymen_succesfull />} />
      </Routes>
    </>
  );
};

export default Routers;
