// src/routers/ProtectedRoute.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user.user);

  if (!user) {
    // Not logged in? ➔ redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in but wrong role ➔ redirect to Error Page
    return <Navigate to="*" replace />; 
  }

  // Logged in + correct role ➔ show content
  return <Outlet />;
};

export default ProtectedRoute;