import React from 'react';
import { Routes, Route } from "react-router-dom";
// import { Toaster } from 'react-hot-toast';
import Home from '../pages/Home';


const Routers = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
  )
}

export default Routers
