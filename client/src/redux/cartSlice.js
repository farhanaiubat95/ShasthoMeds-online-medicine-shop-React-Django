// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ================== Thunks ================== //

// Add item to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://shasthomeds-backend.onrender.com/cart/add",
        { productId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data; // returns the new/updated cart item
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Fetch all items in cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://shasthomeds-backend.onrender.com/cart/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data; // should return array of items
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `https://shasthomeds-backend.onrender.com/cart/remove/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return { productId }; // we just need to update Redux
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================== Slice ================== //

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- Add to Cart ----
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        // update if already exists, else push
        const existingIndex = state.items.findIndex(
          (item) => item.productId === action.payload.productId,
        );
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---- Fetch Cart ----
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // replace with backend data
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---- Remove from Cart ----
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.productId !== action.payload.productId,
        );
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
