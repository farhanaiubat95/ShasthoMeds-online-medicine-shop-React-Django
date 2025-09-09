import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://shasthomeds-backend.onrender.com";

// Fetch all appointments for logged-in user
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async ({ token }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/appointments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch all appointments for an admin
export const fetchAllAppointments = createAsyncThunk(
  "appointments/fetchAllAppointments",
  async ({ token }, thunkAPI) => {
    try {
      // Use the appropriate backend endpoint for all appointments
      const res = await axios.get(`${API_URL}/appointments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Book an appointment
export const bookAppointment = createAsyncThunk(
  "appointments/bookAppointment",
  async ({ doctor_id, date, time_slot, token }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${API_URL}/appointments/`,
        { doctor_id, date, time_slot },
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

// Update appointment status (PATCH)
export const updateAppointmentStatus = createAsyncThunk(
  "appointments/updateStatus",
  async ({ appointmentId, status, token }, thunkAPI) => {
    try {
      const res = await axios.patch(
        `${API_URL}/appointments/${appointmentId}/`,
        { status },
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
    allAppointments: [],
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
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = Array.isArray(action.payload)
          ? { results: action.payload } // normalize to always have results
          : action.payload;
      })

      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.allAppointments = action.payload?.results || action.payload;
      })
      .addCase(fetchAllAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Book appointment
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.appointments.results) {
          state.appointments.results.push(action.payload); // pagination style
        } else {
          state.appointments.push(action.payload); // simple array style
        }
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;

        // Update in list
        if (state.appointments.results) {
          const index = state.appointments.results.findIndex(
            (appt) => appt.id === action.payload.id,
          );
          if (index !== -1) {
            state.appointments.results[index] = action.payload;
          }
        } else {
          const index = state.appointments.findIndex(
            (appt) => appt.id === action.payload.id,
          );
          if (index !== -1) {
            state.appointments[index] = action.payload;
          }
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;
