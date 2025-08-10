import React from "react";
import ProductCard from "../product/ProductCard";
import BannerCarousel from "./BannerCarousel";

const HomeMain = () => {
  return (
    <div>
      <div className="overflow-hidden border border-[#30C2C0] rounded-xl p-2">
        <BannerCarousel />
      </div>
      <div>
        <ProductCard />
      </div>
    </div>
  );
};

export default HomeMain;
