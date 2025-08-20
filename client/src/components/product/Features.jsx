import { Card, CardContent, Typography } from "@mui/material";
import React from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import RegisterImage from "../../assets/images/reg-img.jpg";

const features_list = {
  features: [
    "Size 1900mm*900mm*500mm",
    "Framework of rectangular mild steel tube",
    "Backrest positions up to 75°",
    "Provision of telescopic IV rod",
    "Mounted on PVC stumps",
  ],
};

const Features = () => {
  return (
    <div>
      <aside className="hidden xl:flex xl:col-span-3">
        {/* FEATURE box */}
        <Card className="mt-6 border-2 border-[#0F918F] hidden md:flex">
          <CardContent>
            <Typography variant="h6" sx={{ color: "#0F918F", fontWeight: 700 }}>
              FEATURES
            </Typography>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-700">
              {features_list.features.map((f, i) => (
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
    </div>
  );
};

export default Features;
