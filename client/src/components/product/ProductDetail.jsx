// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { Button, Typography, Divider } from "@mui/material";

import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import CommonProductInfo from "./CommonProductInfo";
import { useParams } from "react-router-dom";
import axios from "axios";
import Features from "./Features";

export default function ProductDetail1() {
  const { id } = useParams(); // get product id from URL
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `https://shasthomeds-backend.onrender.com/products/${id}/`,
        );
        setProduct(res.data);
        setMainImage(res.data.image1); // set first image as default
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <p className="text-center mt-6">Loading product...</p>;
  }

  // collect images (some may be null)
  const images = [product.image1, product.image2, product.image3].filter(
    Boolean,
  );

  const features_list = {
    shipping:
      "Delivery normally within 2-5 business days. Charges may vary by area.",
    refund:
      "Refund allowed within 7 days for unopened items — subject to verification.",
    cancellation: "Orders can be cancelled within 1 hour of placement.",
    badges: ["Fast Shipping", "100% Authentic", "Cash on Delivery"],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-1">
      {/* Top area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main image / gallery */}
        <main className="xl:col-span-7 order-1 xl:order-2">
          <div className="bg-white rounded-md shadow p-4">
            <div className="border border-[#0F918F] rounded-lg p-2">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-[360px] object-contain rounded"
              />
            </div>

            {/* thumbnails */}
            <div className="mt-4 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(src)}
                  className={`w-20 h-20 rounded overflow-hidden border ${
                    mainImage === src
                      ? "border-[#0F918F] ring-2 ring-[#0F918F]/30"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={src}
                    alt={`thumb-${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="hidden xl:block">
            <CommonProductInfo product={product} />
          </div>
        </main>

        {/* Right product info */}
        <aside className="xl:col-span-5 common-right-sidebar order-2 xl:order-3">
          <div className="bg-white rounded-md shadow p-5 border border-gray-100">
            {/* product Name */}
            <div>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#0F918F" }}
              >
                {product.name}
              </Typography>
              <Typography variant="body2" className="font-semibold mt-1">
                <span className="text-[#718096] font-thin text-[18px]">
                  {product.unit}
                </span>
                <span className="text-[#718096] font-semibold text-[18px]">
                  - ({product.weight_display})
                </span>
              </Typography>
            </div>

            {/* Brand Name */}
            <div className="mt-4 flex items-center gap-2 border-b-1 pb-3 border-gray-200">
              <div className="h-10 w-10 rounded-full border-2 border-[#FFC900]">
                <img
                  src={product.brand?.image}
                  className="w-full "
                  alt=""
                />
              </div>
              <Typography className="mt-2 text-[#FF9B00] text-[25px]">
                {product.brand?.name}
              </Typography>
              <ArrowRightIcon className="text-[#FFC900]" />
            </div>

            {/* Generic Name */}
            <div className="mt-4 flex items-center gap-2 border-b-1 pb-3 border-gray-200">
              <GpsFixedIcon className="text-[#0F918F]" />
              <Typography variant="body2" className="mt-2">
                <span className="text-[#718096] text-[17px]">Generic :</span>{" "}
                <span className="text-[#0F918F] text-[18px]">
                  {product.generic_name}
                </span>
              </Typography>
            </div>

            {/* Price */}
            <div className="mt-4">
              <div>
                <Typography style={{ fontSize: "17px", fontWeight: "400" }}>
                  {product.unit_display} ({product.package_quantity})
                </Typography>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-bold text-[25px] text-[#ba2b21]">
                  ৳ {product.new_price}
                </span>
                <span className="text-sm text-[18px] text-gray-600 line-through mr-3">
                  ৳ {product.price}
                </span>
                {/* Discount Badge */}
                <div className="relative inline-block">
                  <span className="absolute top-0 left-[-9px] w-0 h-0 border-t-[14px] border-b-[14px] border-r-[10px] border-t-transparent border-b-transparent border-r-red-400"></span>
                  <span className="bg-red-400 text-white text-xs font-bold px-3 py-1 rounded-r-md">
                    {product.offer_price}% OFF
                  </span>
                </div>
              </div>
              <div className="text-sm text-green-600 mt-1">
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <div className="mt-5 mb-2 space-y-3">
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#CA7842",
                  "&:hover": { backgroundColor: "#FF9B45" },
                }}
              >
                Add To Cart
              </Button>
            </div>

            <Divider className="my-4" />

            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <b>Category:</b> {product.category?.name}
              </div>
            </div>
          </div>

          {/* Shipping / policy cards */}
          <div className="mt-4 space-y-3">
            <div className="border rounded p-3">
              <Typography
                variant="subtitle1"
                sx={{ color: "#0F918F", fontWeight: 700 }}
              >
                SHIPPING POLICY
              </Typography>
              <Typography variant="body2" className="text-gray-600 mt-2">
                {features_list.shipping}
              </Typography>
            </div>

            <div className="border rounded p-3">
              <Typography
                variant="subtitle1"
                sx={{ color: "#0F918F", fontWeight: 700 }}
              >
                REFUND POLICY
              </Typography>
              <Typography variant="body2" className="text-gray-600 mt-2">
                {features_list.refund}
              </Typography>
            </div>

            <div className="border rounded p-3">
              <Typography
                variant="subtitle1"
                sx={{ color: "#0F918F", fontWeight: 700 }}
              >
                CANCELLATION / RETURN
              </Typography>
              <Typography variant="body2" className="text-gray-600 mt-2">
                {features_list.cancellation}
              </Typography>
            </div>
          </div>

          {/* Left sidebar (Categories / small info) */}
          <div className="hidden xl:block ">
            <Features />
          </div>

          {/* Product info  mobile*/}
          <div className=" xl:hidden">
            <CommonProductInfo product={product} />
          </div>

          {/* Left sidebar (Categories / small info) mobile*/}
          <div className="block xl:hidden ">
            <Features />
          </div>
        </aside>
      </div>
    </div>
  );
}
