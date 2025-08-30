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
      return response.data; // { results: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch categories"
      );
    }
  }
);

// Add a category
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async ({ categoryData, token }, { rejectWithValue }) => {
    try {
      const res = await axios.post(API_URL, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to add category");
    }
  }
);

// Update a category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}${id}/`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // updated category
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update category"
      );
    }
  }
);

// Remove a category
export const removeCategory = createAsyncThunk(
  "categories/removeCategory",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to remove category"
      );
    }
  }
);

// ========== Slice ========== //
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: { results: [] }, // match backend
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
        state.items = action.payload; // { results: [...] }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addCategory
      .addCase(addCategory.fulfilled, (state, action) => {
        if (Array.isArray(state.items.results)) {
          state.items.results.push(action.payload);
        }
      })

      // updateCategory
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.results.findIndex(
          (c) => c.id === action.payload.id
        );
        if (idx !== -1) {
          state.items.results[idx] = action.payload;
        }
      })

      // removeCategory
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.items.results = state.items.results.filter(
          (c) => c.id !== action.payload
        );
      });
  },
});



export default categorySlice.reducer;
