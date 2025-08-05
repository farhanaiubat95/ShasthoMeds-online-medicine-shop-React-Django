import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  // If role exists, redirect to home
  if (role === "user" || role === "admin") {
    return <Navigate to="/" replace />;
  }

  // Else allow access to public page
  return children;
};

export default PublicRoute;
