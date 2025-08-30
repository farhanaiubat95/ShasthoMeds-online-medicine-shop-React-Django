import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";
import axios from "axios";

// Create Order
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async ({ orderPayload, token }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/orders/", orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.detail || error.message,
        status: error.response?.status || 500,
      });
    }
  },
);

// Fetch Orders
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        "https://shasthomeds-backend.onrender.com/orders/",
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

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [], // <-- rename from orderlist to orders
    order: null, // single order (created)
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.orders = [];
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
        state.orders.push(action.payload); // add created order to orders list
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to place order";
        state.success = false;
      })
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload; // store fetched orders
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
