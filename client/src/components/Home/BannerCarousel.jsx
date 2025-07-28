// src/components/MUIBannerCarousel.jsx
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
// images
import banner1 from "../../assets/images/banner-1.jpg"
import banner2 from "../../assets/images/banner-2.jpg";
import banner3 from "../../assets/images/banner-3.jpg";
import banner4 from "../../assets/images/banner-4.jpg";

const images = [
  banner1,
  banner2,
  banner3,
  banner4
];


export default function BannerCarousel() {
  const [index, setIndex] = useState(0);

  // Auto slide every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="relative overflow-hidden rounded-xl ">
      <img
        src={images[index]}
        alt={`Banner ${index + 1}`}
        className="w-full h-[300px] object-cover transition-all duration-700 ease-in-out"
      />
    </Box>
  );
}
