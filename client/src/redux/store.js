import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import productReducer from './productSlice'; 
import brandReducer from './brandSlice';
import categoryReducer from './categorySlice';

// Configure Redux store with both reducers
export const store = configureStore({
  reducer: {
    auth: userReducer,        // Handles authentication state (login, logout, tokens)
    products: productReducer,  // Handles product state (list, add, update, remove)
    brands: brandReducer,
    categories: categoryReducer,

  },
});