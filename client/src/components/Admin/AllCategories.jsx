import React, { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  addCategory,
  removeCategory,
  updateCategory,
} from "../../redux/categorySlice.js";

const AllCategories = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.categories);
  const categories = useSelector(
    (state) => state.categories?.items?.results || []
  );
  const token = localStorage.getItem("access_token");

  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [parentId, setParentId] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [openRows, setOpenRows] = useState({});

  // Slug generator
  const makeSlug = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  // Auto-update slug when name changes (unless manually edited)
  useEffect(() => {
    if (!slugEditedManually) {
      setCategorySlug(makeSlug(categoryName));
    }
  }, [categoryName, slugEditedManually]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const createCategoryList = (categories, options = []) => {
    for (let category of categories) {
      options.push({ value: category.id, label: category.name });
    }
    return options;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    ) {
      setCategoryImage(file);
    } else {
      alert("Invalid file type. Only JPG, PNG, or PDF allowed.");
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategorySlug("");
    setSlugEditedManually(false);
    setParentId("");
    setCategoryImage(null);
    setEditCategoryData(null);
    setEditMode(false);
  };

  const handleSubmit = async () => {
    if (!categoryName) return alert("Category Name is required");
    if (!categorySlug) return alert("Slug is required");
    if (!token) return alert("Login required");

    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("slug", categorySlug);
    if (parentId) formData.append("parent", parentId);
    if (categoryImage) formData.append("image", categoryImage);
    formData.append("is_active", true);

    try {
      if (editMode && editCategoryData) {
        const resultAction = await dispatch(
          updateCategory({
            id: editCategoryData.id,
            categoryData: formData,
            token,
          })
        );

        if (updateCategory.fulfilled.match(resultAction)) {
          alert("Category updated successfully!");
          dispatch(fetchCategories());
          resetForm();
        } else {
          alert(
            resultAction.payload?.detail ||
              "Failed to update category. Please try again."
          );
        }
      } else {
        const resultAction = await dispatch(
          addCategory({ categoryData: formData, token })
        );

        if (addCategory.fulfilled.match(resultAction)) {
          alert("Category added successfully!");
          dispatch(fetchCategories());
          resetForm();
        } else {
          alert(
            resultAction.payload?.detail ||
              "Failed to add category. Please try again."
          );
        }
      }
    } catch (err) {
      console.error("Error submitting category:", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleEditClick = (category) => {
    setEditMode(true);
    setEditCategoryData(category);
    setCategoryName(category.name);
    setCategorySlug(category.slug || makeSlug(category.name));
    setSlugEditedManually(false);
    setParentId(category.parent || "");
    setCategoryImage(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await dispatch(removeCategory({ id, token }));
      await dispatch(fetchCategories());
    }
  };

  const mainCategories = Array.isArray(categories)
    ? categories.filter((cat) => !cat.parent)
    : [];

  const getSubcategories = (parentId) =>
    Array.isArray(categories)
      ? categories.filter((cat) => cat.parent === parentId)
      : [];

  const handleToggle = (id) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategoryRow = (cat, level = 0) => {
    const subcategories = getSubcategories(cat.id);
    const hasSubs = subcategories.length > 0;

    return (
      <React.Fragment key={cat.id}>
        <TableRow>
          <TableCell>
            {hasSubs && (
              <IconButton size="small" onClick={() => handleToggle(cat.id)}>
                {openRows[cat.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            )}
          </TableCell>
          <TableCell>
            <Typography sx={{ paddingLeft: `${level * 20}px` }}>
              {cat.id}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography sx={{ paddingLeft: `${level * 20}px` }}>
              {cat.name}
            </Typography>
            <Typography sx={{ paddingLeft: `${level * 20}px` }} variant="caption" color="textSecondary">
              Slug: {cat.slug || "-"}
            </Typography>
          </TableCell>
          <TableCell>
            {cat.image && (
              <img
                src={cat.image}
                alt={cat.name}
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
            )}
          </TableCell>
          <TableCell>
            <Button size="small" onClick={() => handleEditClick(cat)}>
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => handleDelete(cat.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>

        {hasSubs &&
          openRows[cat.id] &&
          subcategories.map((sub) => renderCategoryRow(sub, level + 1))}
      </React.Fragment>
    );
  };

  const allSubcategories = categories.filter((cat) => cat.parent);

  return (
    <Box>
      <Box className="flex gap-6 p-4 bg-gray-100">
        <Typography>Total Categories: {categories.length}</Typography>
        <Typography>Main Categories: {mainCategories.length}</Typography>
        <Typography>Subcategories: {allSubcategories.length}</Typography>
      </Box>

      <Box className="flex gap-6 p-6 flex-wrap">
        <Card sx={{ flex: "1 1 300px" }}>
          <CardContent>
            <Typography variant="h6" className="pb-4">
              {editMode ? "Edit Category" : "Add New Category"}
            </Typography>

            <TextField
              fullWidth
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Slug"
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                setSlugEditedManually(true);
              }}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                {createCategoryList(mainCategories).map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <label htmlFor="category-image-upload">
              <Button variant="outlined" component="span">
                {categoryImage ? "Change Image" : "Upload Image"}
              </Button>
            </label>
            <input
              id="category-image-upload"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {categoryImage && <Typography>{categoryImage.name}</Typography>}

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleSubmit}
            >
              {editMode ? "Update" : "Submit"}
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ flex: "2 1 500px" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Expand</TableCell>
                  <TableCell>Category ID</TableCell>
                  <TableCell>Category Name / Slug</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mainCategories.map((cat) => renderCategoryRow(cat))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default AllCategories;
