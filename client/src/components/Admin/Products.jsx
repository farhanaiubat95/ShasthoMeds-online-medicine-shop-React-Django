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
} from "../../redux/productSlice.js";
import { fetchCategories } from "../../redux/categorySlice.js";
import { fetchBrands } from "../../redux/brandSlice.js";

export default function Products() {
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const { products, loading } = useSelector((state) => state.products);
  const categories =
    useSelector((state) => state.categories?.items?.results) || [];
  const brands = useSelector((state) =>
    Array.isArray(state.brands?.items?.results)
      ? state.brands.items.results
      : [],
  );

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

  const units = ["Tablet", "Capsule", "Bottle", "Syrup"];
  const weightUnits = ["mg", "g", "ml", "kg"];
  const packageQuantities = ["1 Strip", "1 Box", "1 Bottle"];

  // fetch products, categories, brands on mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token"); // JWT token

    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });

    dispatch(createProduct({ productData: formData, token }));
    resetForm();
  };

  const handleAdd = () => {
    if (formRef.current) {
      const topPos =
        formRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topPos, behavior: "smooth" });
    }
  };

  const handleEdit = (index) => {
    setProduct(products[index]);
    setFormMode("edit");
    setEditIndex(index);

    if (formRef.current) {
      const topPos =
        formRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topPos, behavior: "smooth" });
    }
  };

  const handleDelete = (index) => {
    const token = localStorage.getItem("accessToken");
    dispatch(removeProductApi({ id: products[index].id, token }));
  };

  const handleView = (index) => {
    setViewProduct(products[index]);
  };

  const handleCloseView = () => setViewProduct(null);

  return (
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
          name="category"
          label="Category"
          value={product.category}
          onChange={handleChange}
          fullWidth
        >
          {categories?.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          name="brand"
          label="Brand"
          value={product.brand}
          onChange={handleChange}
          fullWidth
        >
          {brands?.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="price"
          label="Price"
          value={product.price}
          onChange={handleChange}
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
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Prescription</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products?.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.sku || "-"}</TableCell>
                  <TableCell>{p.name || "-"}</TableCell>
                  <TableCell>{p.price || "-"}</TableCell>
                  <TableCell>{p.stock || "-"}</TableCell>
                  <TableCell>
                    {p.unit_value} {p.unit}
                  </TableCell>
                  <TableCell>
                    {p.prescription_required ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleView(i)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleEdit(i)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(i)}
                    >
                      Delete
                    </Button>
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
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Typography>
                <strong>SKU:</strong> {viewProduct.sku}
              </Typography>
              <Typography>
                <strong>Name:</strong> {viewProduct.name}
              </Typography>
              <Typography>
                <strong>Description:</strong> {viewProduct.description}
              </Typography>
              <Typography>
                <strong>Generic Name:</strong> {viewProduct.generic_name}
              </Typography>
              <Typography>
                <strong>Indication:</strong> {viewProduct.indication}
              </Typography>
              <Typography>
                <strong>Adult Dose:</strong> {viewProduct.adult_dose}
              </Typography>
              <Typography>
                <strong>Child Dose:</strong> {viewProduct.child_dose}
              </Typography>
              <Typography>
                <strong>Contraindication:</strong>{" "}
                {viewProduct.contraindication}
              </Typography>
              <Typography>
                <strong>Precaution:</strong> {viewProduct.precaution}
              </Typography>
              <Typography>
                <strong>Side Effect:</strong> {viewProduct.side_effect}
              </Typography>
              <Typography>
                <strong>Category:</strong>{" "}
                {categories.find((c) => c.id === viewProduct.category)?.name ||
                  "-"}
              </Typography>
              <Typography>
                <strong>Brand:</strong>{" "}
                {brands.find((b) => b.id === viewProduct.brand)?.name || "-"}
              </Typography>
              <Typography>
                <strong>Price:</strong> {viewProduct.price}
              </Typography>
              <Typography>
                <strong>Offer:</strong> {viewProduct.offer_price}
              </Typography>
              <Typography>
                <strong>Stock:</strong> {viewProduct.stock}
              </Typography>
              <Typography>
                <strong>Unit:</strong> {viewProduct.unit_value}{" "}
                {viewProduct.unit}
              </Typography>
              <Typography>
                <strong>Weight:</strong> {viewProduct.weight_value}{" "}
                {viewProduct.weight_unit}
              </Typography>
              <Typography>
                <strong>Package Quantity:</strong>{" "}
                {viewProduct.package_quantity}
              </Typography>
              <Typography>
                <strong>Prescription Required:</strong>{" "}
                {viewProduct.prescription_required ? "Yes" : "No"}
              </Typography>
              <Typography>
                <strong>Active:</strong> {viewProduct.is_active ? "Yes" : "No"}
              </Typography>

              {viewProduct.image1 && (
                <img
                  src={
                    product.image1 instanceof File ||
                    product.image1 instanceof Blob
                      ? URL.createObjectURL(product.image1)
                      : product.image1
                  }
                  alt={product.name}
                  style={{
                    maxWidth: "100%",
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
              )}
              {viewProduct.image2 && (
                <img
                  src={
                    product.image2 instanceof File ||
                    product.image2 instanceof Blob
                      ? URL.createObjectURL(product.image2)
                      : product.image2
                  }
                  alt={product.name}
                  style={{
                    maxWidth: "100%",
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
              )}
              {viewProduct.image3 && (
                <img
                  src={
                    product.image3 instanceof File ||
                    product.image3 instanceof Blob
                      ? URL.createObjectURL(product.image3)
                      : product.image3
                  }
                  alt={product.name}
                  style={{
                    maxWidth: "100%",
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
              )}
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
  );
}
