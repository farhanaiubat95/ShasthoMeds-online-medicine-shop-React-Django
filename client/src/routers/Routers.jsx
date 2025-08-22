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
import CustomerHome from "../pages/CustomerHome";
import ProductDetail from "../components/product/ProductDetail";
import HomeMain from "../components/Home/HomeMain";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../Layout/AdminLayout";
import Main from "../components/Admin/Main";
import Categories from "../components/Admin/Categories";
import Products from "../components/Admin/Products";
import AllCustomer from "../components/Admin/AllCustomer";
import Notification from "../components/Admin/Notification";
import Payment from "../components/Admin/Payment";
import Findpagecheck from "../components/product/Findpagecheck";

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
            {/* <Route index element={<CustomerHome />}>
              <Route index element={<HomeMain />} />
              <Route path="productdetails/:id" element={<ProductDetail />} />
            </Route> */}

            <Route path="profile" element={<Profile />} />
            <Route path="cart" element={<Cart />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="category" element={<Categories />} />
            <Route path="product" element={<Products />} />
            <Route path="profile" element={<Profile />} />
            <Route path="all-user" element={<AllCustomer />} />
            <Route path="payment" element={<Payment />} />
            <Route path="notification" element={<Notification />} />
          </Route>
        </Route>

        {/* Catch-All */}
        <Route path="*" element={<ErrorPage />} />
        <Route path="/check" element={<Findpagecheck />} />
      </Routes>
    </>
  );
};

export default Routers;
