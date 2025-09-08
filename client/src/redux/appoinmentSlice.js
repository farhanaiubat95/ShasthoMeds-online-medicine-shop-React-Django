import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://shasthomeds-backend.onrender.com";

// Fetch appointments for a doctor
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async ({ token }, thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_URL}/appointments/?doctor=${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Book an appointment
export const bookAppointment = createAsyncThunk(
  "appointments/bookAppointment",
  async ({ doctorId, date, time_slot, token }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${API_URL}/appointments/`,
        { doctor: doctorId, date, time_slot },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const appointmentSlice = createSlice({
  name: "appointments",
  initialState: {
    appointments: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetAppointments: (state) => {
      state.appointments = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;
