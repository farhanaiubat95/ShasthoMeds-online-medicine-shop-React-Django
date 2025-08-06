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

const Routers = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Catch All */}
        <Route path="*" element={<ErrorPage />} />
        {/* <Route path="/product/:id" element={<DetailView />} /> */}

        {/* ==> Public Routes protected for logged-in users */}
        <Route element={<AuthProtectedRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Registerpage />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
        </Route>

        {/* =========== Protected Routes =========== */}
        {/* My Profile */}

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/myaccount" element={<Home />}>
            <Route path="profile" element={<Profile />} />
            <Route path="cart" element={<Cart />} />
            {/* <Route path="checkout" element={<Checkout />} />
            <Route
              path="payment-success/:tran_id"
              element={<PaymentSuccess />}
            />
            <Route path="AllOrders" element={<AllOrders />} /> */}
          </Route>
        </Route>

        {/* Admin */}
        {/* <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />}>
              <Route index element={<Main />} />
              <Route path="alladmin" element={<AllAdmin />} />

              <Route path="allcustomer" element={<AllCustomer />} />
              <Route path="allseller" element={<AllSeller />} />
              <Route path="edit-admin/:id" element={<Edit />} />
              <Route path="category" element={<Category />} />
              <Route path="payment" element={<Payment />} />
              <Route path="notification" element={<Notification />} />
            </Route>
          </Route>
        </Route> */}
      </Routes>
    </>
  );
};

export default Routers;
