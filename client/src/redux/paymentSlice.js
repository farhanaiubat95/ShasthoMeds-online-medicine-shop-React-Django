// src/redux/paymentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to initiate payment
export const initiatePayment = createAsyncThunk(
  "payment/initiate",
  async ({ order_id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://shasthomeds-backend.onrender.com/payment/initiate/${order_id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        return rejectWithValue(errData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    loading: false,
    error: null,
    gatewayURL: null,
  },
  reducers: {
    resetPayment: (state) => {
      state.loading = false;
      state.error = null;
      state.gatewayURL = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.gatewayURL = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.gatewayURL = action.payload.GatewayPageURL || null;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to initiate payment";
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
