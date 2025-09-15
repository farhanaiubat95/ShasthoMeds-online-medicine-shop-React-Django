import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ------------------ Thunk ------------------
// Fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo }, // assuming JWT stored here
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.access}`, // JWT access token
        },
      };

      const { data } = await axios.get(
        "https://shasthomeds-backend.onrender.com/users/",
        config,
      );
      return data; // list of users
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
      );
    }
  },
);

// Update user details or toggle is_verified
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, userData }, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.access}`,
        },
      };

      const { data } = await axios.put(
        `https://shasthomeds-backend.onrender.com/users/${id}/`,
        userData,
        config,
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  },
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.access}`,
        },
      };

      await axios.delete(
        `https://shasthomeds-backend.onrender.com/users/${id}/`,
        config,
      );
      return id; // return deleted user id
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
    // optional: you can add reset state here
    resetAllUsers: (state) => {
      state.users = [];
      state.loading = false;
      state.error = null;
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
        state.error = action.payload;
      })
      // update user
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u.id === action.payload.id || u._id === action.payload._id,
        );
        if (index !== -1) state.users[index] = action.payload;
      })
      // delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (u) => u.id !== action.payload && u._id !== action.payload,
        );
      });
  },
});

// Export actions & reducer
export const { resetAllUsers } = allUserSlice.actions;
export default allUserSlice.reducer;
