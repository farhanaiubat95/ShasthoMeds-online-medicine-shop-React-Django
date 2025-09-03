// redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import userReducer from "./userSlice";
import productReducer from "./productSlice"; 
import brandReducer from "./brandSlice";
import categoryReducer from "./categorySlice";
import cartReducer from "./cartSlice";
import orderReducer from "./orderSlice";
import prescriptionReducer from "./prescriptionSlice";

// Combine all slices
const rootReducer = combineReducers({
  auth: userReducer,
  products: productReducer,
  brands: brandReducer,
  categories: categoryReducer,
  carts: cartReducer,
  orders: orderReducer,
  prescriptions: prescriptionReducer
});

// Persist config: whitelist the reducers you want to persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "carts"] // you can persist auth and cart
};

// Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

// Create persistor
export const persistor = persistStore(store);
