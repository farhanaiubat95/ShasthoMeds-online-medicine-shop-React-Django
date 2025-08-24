// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ================== Thunks ================== //

// Fetch all items in cart
export const fetchCart = createAsyncThunk(
  "carts/fetchCart",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        "https://shasthomeds-backend.onrender.com/cart/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data; // backend cart items
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Add item to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product_id, quantity, token }, { rejectWithValue }) => {
    try {
      console.log("Product ID:", product_id, "Quantity:", quantity);
      const response = await axios.post(
        "https://shasthomeds-backend.onrender.com/cart/add/",
        { product_id, quantity }, // backend expects snake_case
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  "carts/removeFromCart",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `https://shasthomeds-backend.onrender.com/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return productId;
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
      // --- Fetch Cart ---
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Add To Cart ---
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item.productId === action.payload.productId,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Remove From Cart ---
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.productId !== action.payload,
        );
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
