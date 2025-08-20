// src/pages/ProductDetail.jsx
import React, { useState } from "react";
import {
  Button,
  IconButton,
  Typography,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import CreditCardIcon from "@mui/icons-material/CreditCard";


const product = {
  id: 1,
  name: "A-MYCIN Lotion 25 ml",
  subtitle: "Erythromycin 2% | External Use Only",
  price: "৳ 120.00",
  availability: "In stock",
  unit: "Tablat",
  display_unit: "10 tablets",
  package_quantity: "1 strip",
  images: [
    "/images/amycine-main.jpg", // main image
    "/images/amycine-1.jpg",
    "/images/amycine-2.jpg",
    "/images/amycine-3.jpg",
  ],
  features: [
    "Size 1900mm*900mm*500mm",
    "Framework of rectangular mild steel tube",
    "Backrest positions up to 75°",
    "Provision of telescopic IV rod",
    "Mounted on PVC stumps",
  ],
  shipping:
    "Delivery normally within 2-5 business days. Charges may vary by area.",
  refund:
    "Refund allowed within 7 days for unopened items — subject to verification.",
  cancellation:
    "Orders can be cancelled within 1 hour of placement. See full policy page for details.",
  badges: ["Fast Shipping", "100% Authentic", "Cash on Delivery"],
};

export default function ProductDetail1() {
  const [mainImage, setMainImage] = useState(product.images[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-1">
      {/* Top area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar (Categories / small info) */}
        <aside className="lg:col-span-3">
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
        <main className="lg:col-span-6">
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

          {/* big promotional banner under image (like screenshot) */}
          <div className="mt-6 border border-[#0F918F] rounded-lg p-4 bg-white">
            <div className="bg-gradient-to-r from-pink-400 to-orange-400 rounded p-6 text-center text-white">
              <h3 className="text-2xl font-bold">FLASH SALE</h3>
              <p className="mt-2 text-sm">
                UNBELIEVABLE DISCOUNT ON WIDE RANGE OF PRODUCTS
              </p>
              <button className="mt-4 px-6 py-2 bg-white text-[#ff4d4d] rounded font-semibold">
                ORDER NOW
              </button>
            </div>
          </div>
        </main>

        {/* Right product info */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-md shadow p-5 border border-gray-100">
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F918F" }}>
              {product.name}
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-1">
              {product.subtitle}
            </Typography>

            <div className="mt-4">
              <span className="text-lg font-bold text-rose-600">
                {product.price}
              </span>
              <div className="text-sm text-green-600 mt-1">
                {product.availability}
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
                <b>Brand:</b> Astropharma
              </div>
              <div>
                <b>Category:</b> Antibiotic
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
        </aside>
      </div>
    </div>
  );
}
