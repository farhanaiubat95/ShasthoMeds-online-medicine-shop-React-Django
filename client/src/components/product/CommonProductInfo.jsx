// src/components/CommonProductInfo.jsx
import React from "react";
import { Typography } from "@mui/material";
import NoteAltIcon from "@mui/icons-material/NoteAlt";

export default function CommonProductInfo({ product }) {
  return (
    <div className="common-product-info order-3 xl:order-2">
      {/* big promotional banner */}
      <div className="mt-6 border border-[#0F918F] rounded-lg p-4 bg-white ">
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

      {/* Medicine overview */}
      <div className="mt-6 border border-[#0F918F] rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2">
          <NoteAltIcon sx={{ color: "#0F918F", fontSize: 30 }} />
          <Typography
            variant="h6"
            sx={{ color: "#0F918F", fontWeight: 600 }}
          >
            Medicine Overview of {product.name} {product.weight_display}{" "}
            {product.unit}
          </Typography>
        </div>

        {/* Dynamic Sections */}
        {[
          ["Introduction", product.description],
          ["Indication", product.indication],
          ["Adult Dose", product.adult_dose],
          ["Child Dose", product.child_dose],
          ["Contraindication", product.contraindication],
          ["Precaution", product.precaution],
          ["Side Effect", product.side_effect],
        ].map(([title, value]) =>
          value ? (
            <div className="mt-4" key={title}>
              <Typography
                style={{ fontWeight: 500, fontSize: "18px" }}
                className="text-[#0F918F]"
              >
                {title}
              </Typography>
              <p>{value}</p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
