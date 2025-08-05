import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const role = localStorage.getItem("user_role");

  if (role === "user" || role === "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
