// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Typography,
  Divider,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import RegisterImage from "../../assets/images/reg-img.jpg";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import CommonProductInfo from "./CommonProductInfo";
import { useParams } from "react-router-dom";
import axios from "axios";


export default function ProductDetail1() {
  const { id } = useParams(); // 👈 get product id from URL
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-1">
      {/* Top area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar (Categories / small info) */}
        <aside className="hidden xl:flex xl:col-span-3">
          {/* FEATURE box */}
          <Card className="mt-6 border-2 border-[#0F918F] hidden md:flex">
            <CardContent>
              <Typography
                variant="h6"
                sx={{ color: "#0F918F", fontWeight: 700 }}
              >
                FEATURES
              </Typography>
              <ul className="mt-3 space-y-2 list-disc list-inside text-gray-700">
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <LocalShippingIcon sx={{ color: "#ef4444" }} />
                  <span className="text-sm">FAST SHIPPING</span>
                </div>
                <div className="flex items-center gap-2">
                  <VerifiedIcon sx={{ color: "#f59e0b" }} />
                  <span className="text-sm">100% AUTHENTIC PRODUCTS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCardIcon sx={{ color: "#06b6d4" }} />
                  <span className="text-sm">COD AVAILABLE</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main image / gallery */}
        <main className="xl:col-span-5 order-1 xl:order-2">
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
              {product.images.map((src, i) => (
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
        <aside className="xl:col-span-4 common-right-sidebar order-2 xl:order-3">
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
              <img
                src={product.brandIMG}
                className="h-10 w-10 rounded-full border-2 border-[#FFC900]"
                alt=""
              />
              <Typography className="mt-2 text-[#FF9B00] text-[25px]">
                {product.brandNAME}
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
              <div className="text-sm text-green-600 mt-1">{product.stock}</div>
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
                <b>Category:</b> {product.category}
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
                {product.shipping}
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
                {product.refund}
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
                {product.cancellation}
              </Typography>
            </div>
          </div>

          {/* Product info */}
          <div className=" xl:hidden">
            <CommonProductInfo product={product} />
          </div>
        </aside>
      </div>
    </div>
  );
}
