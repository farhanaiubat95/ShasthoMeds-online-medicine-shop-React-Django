import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";

const Products = () => {
  const [formMode, setFormMode] = useState("add");
  const categories = [
    { _id: 1, categoryName: "Electronics" },
    { _id: 2, categoryName: "Fashion" },
  ];

  const products = [
    {
      _id: 1,
      productName: "Sample Product",
      productTitle: "High quality sample",
      brand: "BrandX",
      productPrice: 1000,
      productOffer: 10,
      productDiscount: 100,
      productPriceAfterDiscount: 900,
      productDescription: "This is a sample product",
      productCategory: 1,
      productQuantity: 20,
      inStock: true,
      productRatings: 4.5,
      productReviews: [{ reviews: "Excellent!" }],
      createdBy: { name: "Admin" },
      createdAt: new Date(),
      productImage: [{ img: "sample.jpg" }],
    },
  ];

  return (
    <Box p={4}>
      {/* Form */}
      <Box className="form-container">
        <Typography variant="h5" gutterBottom>
          {formMode === "add" ? "Add New Product" : "Edit Product"}
        </Typography>

        <Box
          component={Paper}
          p={2}
          mb={4}
          display="grid"
          gap={2}
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        >
          <TextField label="Name" required />
          <TextField label="Title" required />
          <TextField label="Brand" required />
          <TextField label="Price" type="number" required />
          <TextField label="Offer (%)" type="number" />
          <TextField label="Quantity" type="number" required />
          <TextField label="Description" multiline rows={1} required />
          <TextField select label="Category" required>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.categoryName}
              </MenuItem>
            ))}
          </TextField>

          {/* Image Upload */}
          <Box>
            <TextField type="file" multiple accept="image/*" />
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ backgroundColor: "#246275", padding: "10px", flex: 1 }}
          >
            {formMode === "add" ? "SUBMIT" : "UPDATE"}
          </Button>
          {formMode === "edit" && (
            <Button
              variant="outlined"
              sx={{ padding: "10px", backgroundColor: "#5c5d3c", color: "white" }}
            >
              Add New Product
            </Button>
          )}
        </Box>
      </Box>

      {/* Product Table */}
      <Box className="table-container">
        <Typography variant="h5" gutterBottom mt={6}>
          All Products
        </Typography>

        <TableContainer component={Paper} sx={{ maxHeight: 350, overflow: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Actions",
                  "Images",
                  "Name",
                  "Title",
                  "Brand",
                  "Price",
                  "Offer (%)",
                  "Discount",
                  "After Discount",
                  "Description",
                  "Category",
                  "Quantity",
                  "In Stock",
                  "Rating",
                  "Reviews",
                  "Created By",
                  "Created At",
                ].map((header, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      backgroundColor: "#f5f5f5",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell align="center">
                    <Button sx={{ minWidth: "unset", mr: 1 }}>
                      <EditSquareIcon />
                    </Button>
                    <Button color="error" sx={{ minWidth: "unset" }}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Box position="relative" display="inline-block">
                      <Avatar
                        src={`http://localhost:5000/uploads/${product.productImage?.[0]?.img}`}
                        variant="square"
                        sx={{ width: 40, height: 40 }}
                      />
                      {product.productImage?.length > 1 && (
                        <Box
                          position="absolute"
                          top={0}
                          right={0}
                          bgcolor="rgba(0,0,0,0.6)"
                          color="white"
                          fontSize="10px"
                          px={0.5}
                          borderRadius="4px"
                        >
                          +{product.productImage.length - 1}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{product.productName}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 120,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    align="center"
                  >
                    {product.productTitle}
                  </TableCell>
                  <TableCell align="center">{product.brand}</TableCell>
                  <TableCell align="center">Tk{product.productPrice}</TableCell>
                  <TableCell align="center">{product.productOffer}%</TableCell>
                  <TableCell align="center">Tk{product.productDiscount}</TableCell>
                  <TableCell align="center">
                    Tk{product.productPriceAfterDiscount}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 120,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    align="center"
                  >
                    {product.productDescription}
                  </TableCell>
                  <TableCell align="center">
                    {categories.find((c) => c._id === product.productCategory)
                      ?.categoryName || product.productCategory}
                  </TableCell>
                  <TableCell align="center">{product.productQuantity}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={product.inStock ? "Yes" : "No"}
                      color={product.inStock ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{product.productRatings}/5</TableCell>
                  <TableCell align="center">
                    {product.productReviews?.length
                      ? product.productReviews.map((r, i) => (
                          <Typography key={i} variant="body2">
                            - {r.reviews}
                          </Typography>
                        ))
                      : "No reviews"}
                  </TableCell>
                  <TableCell align="center">{product.createdBy?.name}</TableCell>
                  <TableCell align="center">
                    {new Date(product.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Products;
