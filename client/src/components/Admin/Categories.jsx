import React, { useState } from "react";
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

const Categories = () => {
  // Demo state
  const [categories, setCategories] = useState([
    {
      _id: "1",
      categoryName: "Electronics",
      categoryImage: "https://via.placeholder.com/50",
      parentId: null,
    },
    {
      _id: "2",
      categoryName: "Mobiles",
      categoryImage: "https://via.placeholder.com/50",
      parentId: "1",
    },
    {
      _id: "3",
      categoryName: "Laptops",
      categoryImage: "https://via.placeholder.com/50",
      parentId: "1",
    },
    {
      _id: "4",
      categoryName: "Fashion",
      categoryImage: "https://via.placeholder.com/50",
      parentId: null,
    },
  ]);

  const [categoryName, setCategoryName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);

  const createCategoryList = (categories, options = []) => {
    for (let category of categories) {
      options.push({ value: category._id, label: category.categoryName });
    }
    return options;
  };

  const handleFileChange = (e) => {
    setCategoryImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = () => {
    if (!categoryName || !categoryImage) return alert("Fill all fields");
    const newCategory = {
      _id: Date.now().toString(),
      categoryName,
      categoryImage,
      parentId: parentId || null,
    };
    setCategories([...categories, newCategory]);
    resetForm();
  };

  const handleUpdate = () => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat._id === editCategoryData._id
          ? { ...cat, categoryName, parentId, categoryImage: categoryImage || cat.categoryImage }
          : cat
      )
    );
    resetForm();
    setEditMode(false);
  };

  const handleEditClick = (category) => {
    setEditMode(true);
    setEditCategoryData(category);
    setCategoryName(category.categoryName);
    setParentId(category.parentId || "");
    setCategoryImage(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) {
      setCategories(categories.filter((cat) => cat._id !== id));
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setParentId("");
    setCategoryImage(null);
    setEditCategoryData(null);
  };

  const mainCategories = categories.filter((cat) => !cat.parentId);
  const getSubcategories = (parentId) =>
    categories.filter((cat) => cat.parentId === parentId);

  const handleToggle = (id) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategoryRow = (cat, level = 0) => {
    const subcategories = getSubcategories(cat._id);
    const hasSubs = subcategories.length > 0;

    return (
      <React.Fragment key={cat._id}>
        <TableRow>
          <TableCell>
            {hasSubs && (
              <IconButton size="small" onClick={() => handleToggle(cat._id)}>
                {openRows[cat._id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            )}
          </TableCell>
          <TableCell>
            <Typography sx={{ paddingLeft: `${level * 20}px` }}>
              {cat.categoryName}
            </Typography>
          </TableCell>
          <TableCell>
            <img
              src={cat.categoryImage}
              alt=""
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
          </TableCell>
          <TableCell>
            <Button size="small" onClick={() => handleEditClick(cat)}>
              Edit
            </Button>
            <Button size="small" color="error" onClick={() => handleDelete(cat._id)}>
              Delete
            </Button>
          </TableCell>
        </TableRow>

        {hasSubs &&
          openRows[cat._id] &&
          subcategories.map((sub) => renderCategoryRow(sub, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <Box>
      {/* Summary */}
      <Box className="flex gap-6 p-4 bg-gray-100">
        <Typography>Total Categories: {categories.length}</Typography>
        <Typography>Main Categories: {mainCategories.length}</Typography>
        <Typography>
          Subcategories: {categories.length - mainCategories.length}
        </Typography>
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
              onClick={editMode ? handleUpdate : handleSubmit}
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

export default Categories;
