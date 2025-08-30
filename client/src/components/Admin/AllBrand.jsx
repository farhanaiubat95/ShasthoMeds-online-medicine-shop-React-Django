import React, { useState, useEffect } from "react";
import {
  TextField,
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
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBrands,
  addBrand,
  updateBrand,
  removeBrand,
} from "../../redux/brandSlice.js";

const AllBrand = () => {
  const dispatch = useDispatch();

  // Redux state
  const { items, loading, error } = useSelector((state) => state.brands || {});
  const brands = Array.isArray(items?.results) ? items.results : items || [];

  // Local state
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editBrandId, setEditBrandId] = useState(null);

  // Fetch brands on mount
  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  // Handle file input
  const handleFileChange = (e) => {
    setBrandImage(e.target.files[0]);
  };

  // Reset form
  const resetForm = () => {
    setBrandName("");
    setBrandImage(null);
    setEditMode(false);
    setEditBrandId(null);
  };

  // Handle Add / Update submission
  const handleSubmit = async () => {
    if (!brandName) return alert("Brand Name is required");

    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("name", brandName);
    if (brandImage) formData.append("image", brandImage);

    try {
      if (editMode) {
        await dispatch(updateBrand({ id: editBrandId, brandData: formData, token })).unwrap();
        alert("Brand updated successfully");
      } else {
        await dispatch(addBrand({ brandData: formData, token })).unwrap();
        alert("Brand added successfully");
      }
      resetForm();
      dispatch(fetchBrands()); // auto-refresh after add/update
    } catch (err) {
      alert(err?.message || "Something went wrong");
    }
  };

  // Handle Edit button click
  const handleEditClick = (brand) => {
    setEditMode(true);
    setEditBrandId(brand.id);
    setBrandName(brand.name);
    setBrandImage(null); // keep current image until new file uploaded
  };

  // Handle Delete button
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand?")) return;

    const token = localStorage.getItem("access_token");
    try {
      await dispatch(removeBrand({ id, token })).unwrap();
      alert("Brand deleted successfully");
      dispatch(fetchBrands()); // auto-refresh after delete
    } catch (err) {
      alert(err?.message || "Failed to delete brand");
    }
  };

  return (
    <Box>
      {/* Summary */}
      <Box className="flex gap-6 p-4 bg-gray-100">
        <Typography>Total Brands: {brands.length}</Typography>
      </Box>

      {/* Form and Table */}
      <Box className="flex gap-6 p-6 flex-wrap">
        {/* Form */}
        <Card sx={{ flex: "1 1 300px" }}>
          <CardContent>
            <Typography variant="h6" className="pb-4">
              {editMode ? "Edit Brand" : "Add New Brand"}
            </Typography>

            <TextField
              fullWidth
              label="Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              type="file"
              fullWidth
              onChange={handleFileChange}
              sx={{ mb: 2 }}
            />

            <Button fullWidth variant="contained" onClick={handleSubmit}>
              {editMode ? "Update" : "Submit"}
            </Button>

            {/* Cancel Edit */}
            {editMode && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{ mt: 1 }}
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Box sx={{ flex: "2 1 500px" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>{brand.id}</TableCell>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>
                      {brand.image && (
                        <img
                          src={brand.image}
                          alt=""
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEditClick(brand)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(brand.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Loading and Error */}
      {loading && <Typography>Loading brands...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default AllBrand;
