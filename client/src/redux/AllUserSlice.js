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

      const { data } = await axios.get("https://shasthomeds-backend.onrender.com/users/", config); 
      return data; // list of users
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message
      );
    }
  }
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
      });
  },
});

// Export actions & reducer
export const { resetAllUsers } = allUserSlice.actions;
export default allUserSlice.reducer;
