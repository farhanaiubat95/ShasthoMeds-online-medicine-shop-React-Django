// src/redux/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ---- 1. Async thunk to fetch products from backend ----
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://shasthomeds-backend.onrender.com/products/"
      ); // backend endpoint for products
      return response.data; // return array of products
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ---- 2. Product slice ----
const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],       // stores products list
    loading: false,     // loading state
    error: null,        // error message if fetch fails
  },
  reducers: {
    // Optional: add/update/remove products manually
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.products[index] = { ...state.products[index], ...action.payload };
    },
    removeProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Handle fetchProducts async states
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ---- 3. Export actions and reducer ----
export const { addProduct, updateProduct, removeProduct } = productSlice.actions;
export default productSlice.reducer;
