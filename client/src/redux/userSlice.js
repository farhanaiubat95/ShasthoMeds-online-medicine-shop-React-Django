import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage to persist login after refresh
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,        // Changed: read from localStorage
  access_token: localStorage.getItem("access_token") || null,    // Changed: read from localStorage
  refresh_token: localStorage.getItem("refresh_token") || null,  // Changed: read from localStorage
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Store user + tokens in Redux AND localStorage
    setUserData: (state, action) => {
      const { user, access, refresh } = action.payload;
      state.user = user;
      state.access_token = access;      // Changed: store access_token
      state.refresh_token = refresh;    // Changed: store refresh_token

      localStorage.setItem("user", JSON.stringify(user));               // Persist user
      localStorage.setItem("access_token", access);                     // Persist access_token
      localStorage.setItem("refresh_token", refresh);                   // Persist refresh_token
    },

    // Update user info and sync with localStorage
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload.user };
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    // Logout: clear Redux state AND localStorage
    logoutUser: (state) => {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");   // Changed: remove access_token
      localStorage.removeItem("refresh_token");  // Changed: remove refresh_token
    },
  },
});


// Export actions so they can be dispatched from components
export const { setUserData, logoutUser, updateUser } = userSlice.actions;

// Export reducer to include in store.js
export default userSlice.reducer;

