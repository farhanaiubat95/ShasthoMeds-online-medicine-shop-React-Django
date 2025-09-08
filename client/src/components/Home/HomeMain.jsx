import React from "react";
import ProductCard from "../product/ProductCard";
import BannerCarousel from "./BannerCarousel";
import SlideBrand from "../Brand/SlideBrand";
import SlideCategory from "../Category/SlideCategory";

const HomeMain = () => {
  return (
    <div>
      <div className="overflow-hidden border border-[#30C2C0] rounded-xl p-2">
        <BannerCarousel />
      </div>
      <div>
        <ProductCard />
      </div>

      <div>
        <SlideBrand />
      </div>

      <div>
        <SlideCategory />
      </div>
    </div>
  );
};

export default HomeMain;
