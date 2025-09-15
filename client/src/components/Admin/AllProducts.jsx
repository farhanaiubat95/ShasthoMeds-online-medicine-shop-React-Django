import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  createProduct,
  removeProductApi,
  updateProduct,
} from "../../redux/productSlice.js";
import { Tooltip } from "@mui/material";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PreviewIcon from "@mui/icons-material/Preview";
import EditSquareIcon from "@mui/icons-material/EditSquare";

export default function AllProducts() {
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const { products } = useSelector((state) => state.products);
  const categories =
    useSelector((state) => state.categories?.items?.results) || [];
  const brands = useSelector((state) =>
    Array.isArray(state.brands?.items?.results)
      ? state.brands.items.results
      : [],
  );

  const token = localStorage.getItem("access_token");

  const [formMode, setFormMode] = useState("add");
  const [viewProduct, setViewProduct] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const [product, setProduct] = useState({
    sku: "",
    name: "",
    description: "",
    generic_name: "",
    indication: "",
    adult_dose: "",
    child_dose: "",
    contraindication: "",
    precaution: "",
    side_effect: "",
    category: "",
    brand: "",
    actual_price: "",
    price: "",
    offer_price: "",
    stock: "",
    unit: "",
    unit_value: "",
    weight_value: "",
    weight_unit: "",
    package_quantity: "",
    prescription_required: false,
    image1: null,
    image2: null,
    image3: null,
    is_active: true,
  });

  const units = ["pcs", "tablet", "capsule", "bottle"];
  const weightUnits = ["mg", "g", "ml"];
  const packageQuantities = ["1 strip", "1 box", "1 pack"];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setFormMode("add");
    setProduct({
      sku: "",
      name: "",
      description: "",
      generic_name: "",
      indication: "",
      adult_dose: "",
      child_dose: "",
      contraindication: "",
      precaution: "",
      side_effect: "",
      category: "",
      brand: "",
      actual_price: "",
      price: "",
      offer_price: "",
      stock: "",
      unit: "",
      unit_value: "",
      weight_value: "",
      weight_unit: "",
      package_quantity: "",
      prescription_required: false,
      image1: null,
      image2: null,
      image3: null,
      is_active: true,
    });
    setEditIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Login required");
    const formData = new FormData();

    // convert empty string to null
    const category_id = product.category ? product.category : null;
    const brand_id = product.brand ? product.brand : null;

    if (!category_id) return alert("Category is required");
    if (!brand_id) return alert("Brand is required");

    // Append both foreign keys
    formData.append("category_id", category_id);
    formData.append("brand_id", brand_id);

    // Append the rest of the fields (skip category & brand to avoid conflicts)
    Object.entries(product).forEach(([key, value]) => {
      if (key === "category" || key === "brand") return;
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      if (formMode === "edit" && editIndex !== null) {
        const id = products[editIndex].id;

        await dispatch(
          updateProduct({ id, productData: formData, token }),
        ).unwrap();
        alert("Product updated successfully");
      } else {
        await dispatch(
          createProduct({ productData: formData, token }),
        ).unwrap();
        alert("Product added successfully");
      }

      dispatch(fetchProducts(token));
      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      alert(err?.message || "Something went wrong while saving product");
    }
  };

  const handleAdd = () => {
    if (formRef.current) {
      const topPos =
        formRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topPos, behavior: "smooth" });
    }
  };

  const handleEdit = (index) => {
    const p = products[index];

    setProduct({
      ...p,
      category: p.category?.id || "", // store ID, not object
      brand: p.brand?.id || "", // store ID, not object
      image1: null,
      image2: null,
      image3: null,
    });

    setFormMode("edit");
    setEditIndex(index);

    // scroll to form
    if (formRef.current) {
      const topPos =
        formRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topPos, behavior: "smooth" });
    }
  };

  const handleDelete = async (id) => {
    if (!token) return alert("Login required");
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await dispatch(removeProductApi({ id, token })).unwrap();
      alert("Product deleted successfully");

      // Auto refresh
      dispatch(fetchProducts(token));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err?.message || "Failed to delete product");
    }
  };

  const ProductField = ({ label, value }) => {
    const [expanded, setExpanded] = useState(false);

    if (!value) return null; // skip rendering if empty

    const toggleExpanded = () => setExpanded(!expanded);

    return (
      <Box width="100%" border="1px solid #ddd" borderRadius="8px" p={1} mb={1}>
        <Tooltip title={value} arrow placement="top-start">
          <Typography
            sx={{
              whiteSpace: expanded ? "normal" : "nowrap",
              overflow: "hidden",
              textOverflow: expanded ? "clip" : "ellipsis",
            }}
          >
            <strong>{label}:</strong> {value}
          </Typography>
        </Tooltip>

        {String(value).length > 50 && ( // toggle only if text is long
          <Button
            variant="text"
            size="small"
            onClick={toggleExpanded}
            sx={{ mt: 0.5, p: 0, textTransform: "none" }}
          >
            {expanded ? "See Less" : "See More"}
          </Button>
        )}
      </Box>
    );
  };

  const handleView = (index) => {
    setViewProduct(products[index]);
  };

  const handleCloseView = () => setViewProduct(null);

  return (
    <Box>
      {/* Summary */}
      <Box className="flex gap-6 py-2 px-4 bg-gray-100">
        <Typography>Total Products: {products.length}</Typography>
      </Box>

      <Box p={3}>
        <Typography variant="h5" mb={2}>
          {formMode === "add" ? "Add Product Form" : "Edit Product Form"}
        </Typography>

        <Box
          component="form"
          ref={formRef}
          onSubmit={handleSubmit}
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gap={2}
          mb={4}
        >
          {/* --- form fields same as before --- */}
          <TextField
            name="sku"
            label="SKU"
            value={product.sku}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="name"
            label="Name"
            value={product.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="description"
            label="Description"
            value={product.description}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="generic_name"
            label="Generic Name"
            value={product.generic_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="indication"
            label="Indication"
            value={product.indication}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="adult_dose"
            label="Adult Dose"
            value={product.adult_dose}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="child_dose"
            label="Child Dose"
            value={product.child_dose}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="contraindication"
            label="Contraindication"
            value={product.contraindication}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="precaution"
            label="Precaution"
            value={product.precaution}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="side_effect"
            label="Side Effect"
            value={product.side_effect}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Category"
            value={product.category} // this will be the ID
            onChange={(e) =>
              setProduct({ ...product, category: parseInt(e.target.value, 10) })
            }
            fullWidth
            margin="normal"
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Brand"
            value={product.brand} // this will be the ID
            onChange={(e) =>
              setProduct({ ...product, brand: parseInt(e.target.value, 10) })
            }
            fullWidth
            margin="normal"
          >
            {brands.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            label="Actual Price"
            name="actual_price"
            value={product.actual_price}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            fullWidth
          />

          <TextField
            name="price"
            label="Price"
            value={product.price}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            name="offer_price"
            label="Offer (%)"
            value={product.offer_price}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="stock"
            label="Stock"
            value={product.stock}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            name="package_quantity"
            label="Package Quantity"
            value={product.package_quantity}
            onChange={handleChange}
            fullWidth
          >
            {packageQuantities.map((pq) => (
              <MenuItem key={pq} value={pq}>
                {pq}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="unit_value"
            label="Unit Value"
            value={product.unit_value}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            name="unit"
            label="Unit"
            value={product.unit}
            onChange={handleChange}
            fullWidth
          >
            {units.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="weight_value"
            label="Weight Value"
            value={product.weight_value}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            name="weight_unit"
            label="Weight Unit"
            value={product.weight_unit}
            onChange={handleChange}
            fullWidth
          >
            {weightUnits.map((wu) => (
              <MenuItem key={wu} value={wu}>
                {wu}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                name="prescription_required"
                checked={product.prescription_required}
                onChange={handleChange}
              />
            }
            label="Prescription Required"
          />

          <Button variant="outlined" component="label">
            Upload Image 1
            <input type="file" hidden name="image1" onChange={handleChange} />
          </Button>
          <Button variant="outlined" component="label">
            Upload Image 2
            <input type="file" hidden name="image2" onChange={handleChange} />
          </Button>
          <Button variant="outlined" component="label">
            Upload Image 3
            <input type="file" hidden name="image3" onChange={handleChange} />
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                name="is_active"
                checked={product.is_active}
                onChange={handleChange}
              />
            }
            label="Is Active"
          />

          <Box gridColumn="span 2" display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "#246275" }}
            >
              {formMode === "add" ? "Submit" : "Update"}
            </Button>
            {formMode !== "add" && (
              <Button
                variant="contained"
                sx={{ backgroundColor: "#246275" }}
                onClick={resetForm}
              >
                Add Product
              </Button>
            )}
          </Box>
        </Box>

        {/* Table preview */}
        <Box sx={{ overflowX: "auto" }}>
          <Paper>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell className="text-center">SKU</TableCell>
                  <TableCell className="text-center">Name</TableCell>
                  <TableCell className="text-center">Buying Price</TableCell>
                  <TableCell className="text-center">Selling Price</TableCell>
                  <TableCell className="text-center">Stock</TableCell>
                  <TableCell className="text-center">Unit</TableCell>
                  <TableCell className="text-center">Prescription</TableCell>
                  <TableCell className="text-center">Date</TableCell>
                  <TableCell className="text-center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products?.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.sku || "-"}</TableCell>
                    <TableCell>{p.name || "-"}</TableCell>
                    <TableCell>Tk {p.actual_price || "-"}</TableCell>
                    <TableCell>Tk {p.price || "-"}</TableCell>
                    <TableCell>{p.stock || "-"}</TableCell>
                    <TableCell>
                      {p.unit_value} {p.unit}
                    </TableCell>
                    <TableCell>
                      {p.prescription_required ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                      {new Date(p.created_at).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} justifyContent="center">
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleView(i)}
                        >
                          <PreviewIcon />
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleEdit(i)}
                        >
                          <EditSquareIcon />
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(products[i].id)}
                        >
                          <DeleteForeverIcon />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        {/* View Dialog */}
        <Dialog
          open={!!viewProduct}
          onClose={handleCloseView}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Product Details</DialogTitle>
          <DialogContent dividers>
            {viewProduct && (
              <Box display={"flex"} gap={2} flexDirection={"column"}>
                {/* Product details 1*/}
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  {viewProduct.sku && (
                    <Typography>
                      <strong>SKU:</strong> {viewProduct.sku}
                    </Typography>
                  )}
                  {viewProduct.name && (
                    <Typography>
                      <strong>Name:</strong> {viewProduct.name}
                    </Typography>
                  )}
                  {viewProduct.generic_name && (
                    <Typography>
                      <strong>Generic Name:</strong> {viewProduct.generic_name}
                    </Typography>
                  )}
                  {viewProduct.stock && (
                    <Typography>
                      <strong>Stock:</strong> {viewProduct.stock}
                    </Typography>
                  )}
                  {viewProduct.category && (
                    <Typography>
                      <strong>Category:</strong> {viewProduct.category.name}
                    </Typography>
                  )}

                  {viewProduct.brand && (
                    <Typography>
                      <strong>Brand:</strong> {viewProduct.brand.name}
                    </Typography>
                  )}

                  {viewProduct.price && (
                    <Typography>
                      <strong>Price:</strong> {viewProduct.price}
                    </Typography>
                  )}
                  {viewProduct.offer_price && (
                    <Typography>
                      <strong>Offer:</strong> {viewProduct.offer_price}
                    </Typography>
                  )}

                  {(viewProduct.unit_value || viewProduct.unit) && (
                    <Typography>
                      <strong>Unit:</strong> {viewProduct.unit_value}{" "}
                      {viewProduct.unit}
                    </Typography>
                  )}
                  {(viewProduct.weight_value || viewProduct.weight_unit) && (
                    <Typography>
                      <strong>Weight:</strong> {viewProduct.weight_value}{" "}
                      {viewProduct.weight_unit}
                    </Typography>
                  )}
                  {viewProduct.package_quantity && (
                    <Typography>
                      <strong>Package Quantity:</strong>{" "}
                      {viewProduct.package_quantity}
                    </Typography>
                  )}
                  {"prescription_required" in viewProduct && (
                    <Typography>
                      <strong>Prescription Required:</strong>{" "}
                      {viewProduct.prescription_required ? "Yes" : "No"}
                    </Typography>
                  )}
                  {"is_active" in viewProduct && (
                    <Typography>
                      <strong>Active:</strong>{" "}
                      {viewProduct.is_active ? "Yes" : "No"}
                    </Typography>
                  )}
                </Box>
                {/* Images with correct condition + fixed variable */}
                <Box display="flex" gap={2}>
                  {viewProduct.image1 && (
                    <img
                      src={viewProduct.image1}
                      alt={viewProduct.image1}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "15%",
                      }}
                    />
                  )}
                  {viewProduct.image2 && (
                    <img
                      src={viewProduct.image2}
                      alt={viewProduct.image2}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "5%",
                      }}
                    />
                  )}
                  {viewProduct.image3 && (
                    <img
                      src={viewProduct.image3}
                      alt={viewProduct.image3}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "5%",
                      }}
                    />
                  )}
                </Box>

                {/* Product Details 2 */}
                <ProductField
                  label="Description"
                  value={viewProduct.description}
                />
                <ProductField
                  label="Indication"
                  value={viewProduct.indication}
                />
                <ProductField
                  label="Adult Dose"
                  value={viewProduct.adult_dose}
                />
                <ProductField
                  label="Child Dose"
                  value={viewProduct.child_dose}
                />
                <ProductField
                  label="Contraindication"
                  value={viewProduct.contraindication}
                />
                <ProductField
                  label="Precaution"
                  value={viewProduct.precaution}
                />
                <ProductField
                  label="Side Effect"
                  value={viewProduct.side_effect}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
