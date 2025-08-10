import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const user = useSelector((state) => state.auth.user);

  const navigate = useNavigate();

//   useEffect(() => {
//     if (user && user.role !== 'admin') {
//       navigate("/login"); // Not an admin? Kick out to home
//     }
//   }, [user, navigate]);

  return (
    <div>
      <Outlet />
    </div>
  )
}

export default AdminLayout
