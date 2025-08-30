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
} from "../../redux/categorySlice.js";

const AllCategories = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.categories);
  const categories = useSelector(
    (state) => state.categories?.items?.results || []
  );

  const [categoryName, setCategoryName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [openRows, setOpenRows] = useState({});

  const token = localStorage.getItem("accessToken");

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
    setCategoryImage(e.target.files[0]);
  };

  const resetForm = () => {
    setCategoryName("");
    setParentId("");
    setCategoryImage(null);
    setEditCategoryData(null);
    setEditMode(false);
  };

  const handleSubmit = () => {
    if (!categoryName) return alert("Category Name is required");

    const formData = new FormData();
    formData.append("name", categoryName);
    if (parentId) formData.append("parent", parentId);
    if (categoryImage) formData.append("image", categoryImage);

    dispatch(addCategory({ categoryData: formData, token }));
    resetForm();
  };

  const handleEditClick = (category) => {
    setEditMode(true);
    setEditCategoryData(category);
    setCategoryName(category.name);
    setParentId(category.parent || "");
    setCategoryImage(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) {
      dispatch(removeCategory({ id, token }));
    }
  };

  // Fix property names to match your backend response
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
              {cat.name}
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
      {/* Summary */}
      <Box className="flex gap-6 p-4 bg-gray-100">
        <Typography>Total Categories: {categories.length}</Typography>
        <Typography>Main Categories: {mainCategories.length}</Typography>
        <Typography>Subcategories: {allSubcategories.length}</Typography>
      </Box>

      {/* Form */}
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

            <TextField type="file" fullWidth onChange={handleFileChange} />

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

        {/* Table */}
        <Box sx={{ flex: "2 1 500px" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Expand</TableCell>
                  <TableCell>Category Name</TableCell>
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
