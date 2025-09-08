import React, { useEffect, useState } from "react";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/categorySlice.js";

const Sidebar = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");

  const categories = useSelector(
    (state) => state.categories?.items?.results || []
  );

  const [openSections, setOpenSections] = useState({});

  // Fetch categories on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchCategories(token));
    }
  }, [dispatch, token]);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Top-level categories (parent = null)
  const mainCategories = categories.filter((cat) => !cat.parent);

  // Helper to get subcategories
  const getSubcategories = (parentId) =>
    categories.filter((cat) => cat.parent === parentId);

  return (
    <aside className="w-[250px] bg-[#0F918F] text-white p-4 overflow-y-auto h-screen z-10 md:rounded-xl">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>

      <nav className="space-y-2">
        {mainCategories.map((cat) => {
          const subs = getSubcategories(cat.id);
          const isOpen = openSections[cat.id];

          return (
            <div
              key={cat.id}
              className={`rounded transition-all duration-200 ${
                isOpen ? "bg-[#39dbd9d1]" : "bg-[#5dcac8b7]"
              }`}
            >
              {/* Main Category Button */}
              <button
                onClick={() => subs.length > 0 && toggleSection(cat.id)}
                className="w-full text-left px-3 py-2 flex justify-between items-center font-semibold cursor-pointer"
              >
                <span>{cat.name}</span>
                {subs.length > 0 &&
                  (isOpen ? <ExpandMore /> : <ChevronRight />)}
              </button>

              {/* Subcategories */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isOpen ? "max-h-40 py-2" : "max-h-0"
                } bg-[#0F918F] text-sm px-4 space-y-1`}
              >
                {subs.map((sub) => (
                  <li
                    key={sub.id}
                    className="hover:underline cursor-pointer list-none"
                  >
                    {sub.name}
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
