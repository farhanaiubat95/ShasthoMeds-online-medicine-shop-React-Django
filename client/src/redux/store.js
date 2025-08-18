import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import productReducer from './productSlice'; 

// Configure Redux store with both reducers
export const store = configureStore({
  reducer: {
    auth: userReducer,        // Handles authentication state (login, logout, tokens)
    products: productReducer,  // Handles product state (list, add, update, remove)
  },
});