// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk for adding item to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://shasthomeds-backend.onrender.com/cart/",
        { product_id: productId, quantity: 1 }, // send product_id + quantity
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // this gets pushed into items[]
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

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
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload); // add new cart item
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
