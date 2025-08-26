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
      return res.data; // backend returns full cart object
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
      const response = await axios.post(
        "https://shasthomeds-backend.onrender.com/cart/add/",
        { product_id, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data; // backend returns updated cart object
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Remove item from cart
// Remove item from cart
export const removeFromCart = createAsyncThunk(
  "carts/removeFromCart",
  async ({ cartItemId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `https://shasthomeds-backend.onrender.com/cart/remove/${cartItemId}/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log(response.data);
      return response.data; // backend should return updated cart
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ================== Slice ================== //
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null, // full cart object
    items: [], // array of cart items
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
        state.cart = action.payload;
        state.items = action.payload.items || [];
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
        state.cart = action.payload;
        state.items = action.payload.items || [];
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Remove From Cart ---
      // --- Remove From Cart ---
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.items) {
          state.cart = action.payload;
          state.items = action.payload.items;
        } else {
          state.items = state.items.filter(
            (item) => item.id !== action.meta.arg.cartItemId,
          );
        }
      }) // close this before next case
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
