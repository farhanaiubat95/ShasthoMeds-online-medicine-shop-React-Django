import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctors } from "../redux/doctorSlice.js";
import {
  fetchAppointments,
  bookAppointment,
} from "../redux/appoinmentSlice.js";

export default function DoctorsAppoinment() {
  const dispatch = useDispatch();
  const { doctors } = useSelector((state) => state.doctors);
  const doctorsList = doctors?.results || [];

  const { appointments } = useSelector((state) => state.appointments);
  const appointmentsList = appointments?.results || [];

  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("access_token");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  // Load doctors
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Load all appointments for this user
  useEffect(() => {
    if (token) {
      dispatch(fetchAppointments({ token }));
    }
  }, [dispatch, token]);

  const handleBook = async (date, time) => {
    if (!selectedDoctor || !user) return;

    // Ask confirmation first
    const confirmBooking = window.confirm(
      `Are you sure you want to book an appointment with ${selectedDoctor.full_name} on ${date} at ${time}?`,
    );

    if (!confirmBooking) return; // stop if user cancels

    try {
      console.log("Selected Doctor:", selectedDoctor.id);
      console.log("User ID:", user.id);
      console.log("Date:", date);
      console.log("Time:", time);
      console.log("Token:", token);
      // Dispatch booking
      const resultAction = await dispatch(
        bookAppointment({
          doctor_id: selectedDoctor.id, // use doctor_id now
          date,
          time_slot: time,
          token: token,
        }),
      );

      if (bookAppointment.fulfilled.match(resultAction)) {
        alert("Appointment booked successfully!");

        // Auto-refresh appointment list
        dispatch(fetchAppointments({ token }));
      } else {
        console.error("Booking error:", resultAction.payload);
        alert("Failed to book appointment: ");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong while booking the appointment.");
    }
  };

  const getSlotStyle = (date, time) => {
    const slotBooked = appointmentsList.find(
      (a) => a.date === date && a.time_slot === time,
    );

    // If no one has booked this slot, it's available
    if (!slotBooked) {
      return {
        color: "success",
        disabled: false,
        icon: <FaClock className="animate-pulse" />,
      };
    }

    // If the current user has booked this slot
    if (slotBooked.patient.username === user.username) {
      if (slotBooked.status === "pending") {
        return { color: "secondary", disabled: true, icon: <FaClock /> };
      }
      if (slotBooked.status === "confirmed") {
        return { color: "warning", disabled: true, icon: <FaCheckCircle /> };
      }
    }

    // If another user has booked this slot
    return { color: "error", disabled: true, icon: <FaCheckCircle /> };
  };

  return (
    <Box className="p-4 md:p-8 bg-gray-50 min-h-screen w-full">
      <Typography
        variant="h4"
        sx={{ fontSize: { xs: "1.8rem", sm: "2rem", md: "2.5rem" } }}
        className="mb-6 pb-5 pt-2 font-bold text-[#0F918F]"
      >
        My Appointments
      </Typography>

      <Box className="mb-6 md:flex  align-center justify-center">
        {/* Left Section */}
        <Box className="md:w-[60%]">
          {/* Button to show booking */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowBooking((prev) => !prev)}
            className="mb-6 w-full"
          >
            Take Appointment
          </Button>

          {/* Booking Section */}
          {showBooking && (
            <Paper elevation={3} className="p-4 md:p-6 mb-8 w-full">
              <Typography
                variant="h4"
                className="font-bold mb-4 text-[#0F918F]"
              >
                Book Your Appointment
              </Typography>

              <Autocomplete
                options={doctorsList}
                getOptionLabel={(doc) =>
                  `${doc.full_name} - ${doc.specialization}`
                }
                onChange={(e, value) => setSelectedDoctor(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Doctor"
                    variant="outlined"
                  />
                )}
                className="mb-6"
              />

              {selectedDoctor &&
                Object.entries(selectedDoctor.availability || {}).map(
                  ([date, slots]) => {
                    const dayName = new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                    });
                    return (
                      <Box key={date} className="mt-6 w-[70%]">
                        <Typography
                          variant="h6"
                          className="mb-3 font-semibold text-gray-700"
                        >
                          {date} ({dayName})
                        </Typography>

                        <Grid container spacing={1}>
                          {slots.map((time) => {
                            const { color, disabled, icon } = getSlotStyle(
                              date,
                              time,
                            );
                            return (
                              <Grid item xs={4} sm={3} md={2} key={time}>
                                <Button
                                  variant="contained"
                                  color={color}
                                  startIcon={icon}
                                  onClick={() => handleBook(date, time)}
                                  disabled={disabled}
                                  sx={{
                                    width: "100%",
                                    fontSize: {
                                      xs: "0.65rem",
                                      sm: "0.8rem",
                                      md: "0.9rem",
                                    },
                                    py: { xs: 0.7, sm: 1, md: 1.2 },
                                  }}
                                >
                                  {time}
                                </Button>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    );
                  },
                )}
            </Paper>
          )}
        </Box>
        {/* Right Section */}
        <Box className="mb-6 md:w-[40%]">
          <div className="w-fit">
            {appointmentsList
              .filter((a) => a.patient.username === user.username) // compare username
              .map((a) => (
                <Paper key={a.id} className="p-4 mb-3">
                  <Typography variant="h6" className="font-semibold">
                    {a.doctor.full_name} ({a.doctor.specialization})
                  </Typography>
                  <Typography>
                    Date: {a.date} | Time: {a.time_slot}
                  </Typography>
                  <Typography>
                    Status:{" "}
                    <span
                      className={
                        a.status === "pending"
                          ? "text-blue-600"
                          : a.status === "confirmed"
                            ? "text-green-600"
                            : "text-red-600"
                      }
                    >
                      {a.status}
                    </span>
                  </Typography>
                </Paper>
              ))}
          </div>
        </Box>
      </Box>
    </Box>
  );
}
