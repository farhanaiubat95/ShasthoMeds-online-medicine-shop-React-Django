import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const accessToken = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="*" />;
  }

  return children;
};

export default ProtectedRoute;
