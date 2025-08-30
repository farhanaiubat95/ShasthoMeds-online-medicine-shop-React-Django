import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://shasthomeds-backend.onrender.com/categories/";

// ========== Async Thunks ========== //

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch categories",
      );
    }
  },
);

// Add a category
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async ({ categoryData, token }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.post(API_URL, categoryData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add category");
    }
  },
);

// Remove a category
export const removeCategory = createAsyncThunk(
  "categories/removeCategory",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}${id}/`, config);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to remove category",
      );
    }
  },
);

// ========== Slice ========== //
const categorySlice = createSlice({
  name: "category",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addCategory
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        // ensure items is always an array
        if (!Array.isArray(state.items)) state.items = [];
        state.items.push(action.payload);
      })

      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeCategory
      .addCase(removeCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(removeCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
