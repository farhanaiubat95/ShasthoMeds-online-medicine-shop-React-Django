import React, { useState } from "react";
import { ChevronRight, ExpandMore } from "@mui/icons-material";

const sidebarData = [
  {
    category: "Accessories",
    items: ["Stethoscope", "Thermometer", "BP Machine"],
  },
  {
    category: "Brands",
    items: ["Axis", "Aqua", "Contec"],
  },
  {
    category: "Devices",
    items: ["ECG Machine", "Head Lamp", "Nebulizer"],
  },
  {
    category: "ECG Channel",
    items: ["Single Channel", "3 Channel", "12 Channel"],
  },
];

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (category) => {
    setOpenSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <aside className="w-[250px] bg-[#0F918F] text-white p-4 overflow-y-auto h-screen z-10 md:rounded-xl">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>

      <nav className="space-y-2">
        {sidebarData.map(({ category, items }) => {
          const isOpen = openSections[category];
          return (
            <div
              key={category}
              className={`rounded transition-all duration-200 ${
                isOpen ? "bg-[#39dbd9d1]" : "bg-[#5dcac8b7]"
                }`}
             
            >
              <button
                onClick={() => toggleSection(category)}
                className="w-full text-left px-3 py-2 flex justify-between items-center font-semibold cursor-pointer"
              >
                <span>{category}</span>
                {isOpen ? <ExpandMore /> : <ChevronRight />}
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isOpen ? "max-h-40 py-2" : "max-h-0"
                } bg-[#0F918F] text-sm px-4 space-y-1`}
              >
                {items.map((item) => (
                  <li key={item} className="hover:underline cursor-pointer list-none">
                    {item}
                  </li>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
