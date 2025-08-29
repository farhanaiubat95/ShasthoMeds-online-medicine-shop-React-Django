import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ===================
// Async Thunk: Create Order
// ===================
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async ({ orderPayload, token }, { rejectWithValue }) => {
    try {
      console.log("orderData:", orderPayload);
      const res = await axiosInstance.post("/orders/", orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`, // add token if protected
        },
      });

      return res.data; // axios parses JSON automatically
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.detail || error.message,
        status: error.response?.status || 500,
      });
    }
  },
);

// ===================
// Slice
// ===================
const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to place order";
        state.success = false;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
