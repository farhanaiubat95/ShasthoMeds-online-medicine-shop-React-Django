import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://shasthomeds-backend.onrender.com";

// ---------------------------
// ASYNC THUNKS
// ---------------------------

// Fetch all doctors
export const fetchDoctors = createAsyncThunk(
  "doctors/fetchDoctors",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/doctors/`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Add a new doctor
export const addDoctor = createAsyncThunk(
  "doctors/addDoctor",
  async (doctorData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/doctors/`, doctorData);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Update a doctor
export const updateDoctor = createAsyncThunk(
  "doctors/updateDoctor",
  async ({ id, doctorData }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}/doctors/${id}/`, doctorData);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Delete a doctor
export const deleteDoctor = createAsyncThunk(
  "doctors/deleteDoctor",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/doctors/${id}/`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ---------------------------
// SLICE
// ---------------------------
const doctorSlice = createSlice({
  name: "doctors",
  initialState: {
    doctors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDoctor.fulfilled, (state, action) => {
        state.loading = false;
        if (state.doctors.results) {
          // pagination style response
          state.doctors.results.push(action.payload);
          state.doctors.count += 1;
        } else if (Array.isArray(state.doctors)) {
          // simple array
          state.doctors.push(action.payload);
        } else {
          // first doctor
          state.doctors = [action.payload];
        }
      })
      .addCase(addDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.loading = false;
        if (state.doctors.results) {
          state.doctors.results = state.doctors.results.map((doc) =>
            doc.id === action.payload.id ? action.payload : doc,
          );
        } else if (Array.isArray(state.doctors)) {
          state.doctors = state.doctors.map((doc) =>
            doc.id === action.payload.id ? action.payload : doc,
          );
        }
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.loading = false;
        if (state.doctors.results) {
          state.doctors.results = state.doctors.results.filter(
            (doc) => doc.id !== action.payload,
          );
          state.doctors.count -= 1;
        } else if (Array.isArray(state.doctors)) {
          state.doctors = state.doctors.filter(
            (doc) => doc.id !== action.payload,
          );
        }
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default doctorSlice.reducer;
