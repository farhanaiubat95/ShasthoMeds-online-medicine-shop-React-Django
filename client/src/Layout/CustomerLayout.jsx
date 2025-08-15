import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';


const CustomerLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default CustomerLayout