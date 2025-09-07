import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// Load initial state from localStorage to persist login after refresh
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  access_token: localStorage.getItem("access_token") || null,
  refresh_token: localStorage.getItem("refresh_token") || null,

  // For admin: all users management
  users: [],
  loading: false,
  error: null,
};

// Fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers", // keep same slice namespace
  async (token, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.results || res.data; // handle pagination or direct list
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { user, access_token, refresh_token } = action.payload;
      state.user = user;
      state.access_token = access_token;
      state.refresh_token = refresh_token;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload.user };
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    logoutUser: (state) => {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      });
  },
});

// Export actions so they can be dispatched from components
export const { setUserData, logoutUser, updateUser } = userSlice.actions;

// Export reducer to include in store.js
export default userSlice.reducer;
