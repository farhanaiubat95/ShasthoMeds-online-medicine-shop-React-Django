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

// Update a category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData, token }, { rejectWithValue }) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `${API_URL}${id}/`,
        categoryData,
        config,
      );
      return response.data; // backend returns the updated category
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update category",
      );
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
        state.items = action.payload;
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

      // updateCategory
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.items)) state.items = [];
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload; // replace the old category
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
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
        if (Array.isArray(state.items)) {
          state.items = state.items.filter((c) => c.id !== action.payload);
        } else {
          state.items = [];
        }
      })
      .addCase(removeCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
