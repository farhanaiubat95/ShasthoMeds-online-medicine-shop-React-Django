import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for your backend
const API_URL = "https://shasthomeds-backend.onrender.com/brands/";

// ================= Async Thunks ================= //

// Fetch all brands
export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data; // expected array
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch brands");
    }
  }
);

// Add new brand
export const addBrand = createAsyncThunk(
  "brands/addBrand",
  async ({ brandData, token }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // if uploading image
        },
      };
      const response = await axios.post(API_URL, brandData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add brand");
    }
  }
);

// Update brand
export const updateBrand = createAsyncThunk(
  "brands/updateBrand",
  async ({ id, brandData, token }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axios.patch(`${API_URL}${id}/`, brandData, config);
      return response.data; // updated brand
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update brand");
    }
  }
);

// Remove brand
export const removeBrand = createAsyncThunk(
  "brands/removeBrand",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}${id}/`, config);
      return id; // deleted brand ID
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete brand");
    }
  }
);

// ================= Slice ================= //
const brandSlice = createSlice({
  name: "brands",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchBrands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addBrand
      .addCase(addBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.items)) state.items = [];
        state.items.push(action.payload);
      })
      .addCase(addBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateBrand
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeBrand
      .addCase(removeBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((b) => b.id !== action.payload);
      })
      .addCase(removeBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default brandSlice.reducer;
