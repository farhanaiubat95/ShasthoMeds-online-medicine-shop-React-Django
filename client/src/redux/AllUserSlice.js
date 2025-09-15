// redux/allUserSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper to get token
const getToken = () => localStorage.getItem("access_token");

// ------------------ Thunks ------------------

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  "allUsers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const { data } = await axios.get(
        "https://shasthomeds-backend.onrender.com/users/",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("Users Data :", data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  },
);

// Update user
export const updateUser = createAsyncThunk(
  "allUsers/update",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const { data } = await axios.put(
        `https://shasthomeds-backend.onrender.com/users/${id}/`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("Users Data :", data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  },
);

// Delete user
export const deleteUser = createAsyncThunk(
  "allUsers/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      await axios.delete(
        `https://shasthomeds-backend.onrender.com/users/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  },
);

// ------------------ Slice ------------------
const allUserSlice = createSlice({
  name: "allUsers",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetAllUsers: (state) => {
      state.users = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllUsers
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.results; // store only the array
      })

      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u.id === action.payload.id || u._id === action.payload._id,
        );
        if (index !== -1) state.users[index] = action.payload;
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (u) => u.id !== action.payload && u._id !== action.payload,
        );
      });
  },
});

export const { resetAllUsers } = allUserSlice.actions;
export default allUserSlice.reducer;
