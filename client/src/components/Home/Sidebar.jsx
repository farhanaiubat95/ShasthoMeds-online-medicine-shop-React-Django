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

  // Recursive renderer for categories
  const renderCategory = (category, level = 0) => {
    const isOpen = openSections[category.id];
    const subcategories = categories.filter((cat) => cat.parent === category.id);

    return (
      <div
        key={category.id}
        className={`rounded transition-all duration-200 ml-${level * 2}`}
      >
        {/* Main / Sub category button */}
        <button
          onClick={() => subcategories.length > 0 && toggleSection(category.id)}
          className="w-full text-left px-3 py-2 flex justify-between items-center font-semibold cursor-pointer bg-[#5dcac8b7] hover:bg-[#39dbd9d1]"
        >
          <span>{category.name}</span>
          {subcategories.length > 0 &&
            (isOpen ? <ExpandMore /> : <ChevronRight />)}
        </button>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isOpen ? "max-h-96 py-2" : "max-h-0"
            } bg-[#0F918F] text-sm px-4 space-y-1`}
          >
            {subcategories.map((sub) => renderCategory(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Top-level categories (no parent)
  const mainCategories = categories.filter((cat) => !cat.parent);

  return (
    <aside className="w-[250px] bg-[#0F918F] text-white p-4 overflow-y-auto h-screen z-10 md:rounded-xl">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>

      <nav className="space-y-2">
        {mainCategories.map((cat) => renderCategory(cat))}
      </nav>
    </aside>
  );
};

export default Sidebar;
