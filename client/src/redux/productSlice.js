// src/redux/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ---- 1. Async thunk to fetch products ----
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://shasthomeds-backend.onrender.com/products/",
      );
      // Handle paginated or plain array response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.results) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ---- 2. Async thunk to create product ----
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async ({ productData, token }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axios.post(
        "https://shasthomeds-backend.onrender.com/products/",
        productData,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ---- 2.1 Async thunk to update product ----
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, productData, token }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // keep if file upload, else use application/json
        },
      };
      const response = await axios.put(
        `https://shasthomeds-backend.onrender.com/products/${id}/`,
        productData,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ---- 3. Async thunk to remove product ----
export const removeProductApi = createAsyncThunk(
  "product/removeProduct",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(
        `https://shasthomeds-backend.onrender.com/products/${id}/`,
        config,
      );
      return id; // return the deleted product ID
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ---- 4. Product slice ----
const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProducts
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
      })

      // createProduct
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id,
        );
        if (index !== -1) {
          state.products[index] = action.payload; // update the product in place
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeProduct
      .addCase(removeProductApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProductApi.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(removeProductApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ---- 5. Export reducer ----
export default productSlice.reducer;
