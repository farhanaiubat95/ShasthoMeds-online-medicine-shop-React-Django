import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user.user);             // Redux user
  const access = localStorage.getItem("access_token");              // ✅ Read access_token from localStorage

  // If user not logged in OR no access_token, redirect to login
  if (!access || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user role not allowed, redirect to 404 or any other page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="*" replace />;
  }

  // If everything is okay, render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
