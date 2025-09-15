import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAppointments,
  updateAppointmentStatus,
} from "../../redux/appoinmentSlice.js";
import {
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

const AllAppointments = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("access_token");

  // Fetch only the allAppointments state for the admin view
  const { allAppointments, loading, error } = useSelector(
    (state) => state.appointments,
  );

  // Load ALL appointments on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchAllAppointments({ token }));
    }
  }, [dispatch, token]);

  // Group appointments by date
  const groupedByDate = {};
  allAppointments.forEach((appt) => {
    if (!groupedByDate[appt.date]) {
      groupedByDate[appt.date] = [];
    }
    groupedByDate[appt.date].push(appt);
  });

  const handleStatusChange = async (appointmentId, newStatus) => {
    const confirmed = window.confirm(
      "Are you sure you want to update the status?",
    );
    if (!confirmed) return;

    try {
      await dispatch(
        updateAppointmentStatus({ appointmentId, status: newStatus, token }),
      ).unwrap();

      // Auto-refresh after a successful update by fetching the new full list
      dispatch(fetchAllAppointments({ token }));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating appointment. Please try again.");
    }
  };

  // Render loading or error states
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
        Error: {error}
      </Typography>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Appointments</h2>
      {allAppointments.length === 0 && <p>No appointments found.</p>}
      {Object.keys(groupedByDate).map((date) => (
        <div key={date} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{date}</h3>
          <div className="grid gap-3">
            {groupedByDate[date].map((appt) => (
              <Card key={appt.id} className="shadow-md">
                <CardContent className="flex justify-between items-center">
                  <div>
                    <Typography variant="body1">
                      <strong>Patient:</strong>{" "}
                      {appt.patient?.full_name || `User ${appt.patient}`}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Doctor:</strong>{" "}
                      {appt.doctor?.full_name || `Doctor ${appt.doctor}`}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {appt.time_slot}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {appt.status}
                    </Typography>
                  </div>
                  <Select
                    value={appt.status}
                    onChange={(e) =>
                      handleStatusChange(appt.id, e.target.value)
                    }
                    size="small"
                    disabled={appt.status === "cancelled"} // disable if cancelled
                  >
                    {appt.status === "pending" && (
                      <>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </>
                    )}

                    {appt.status === "confirmed" && (
                      <MenuItem value="completed">Completed</MenuItem>
                    )}

                    {appt.status === "completed" && (
                      <MenuItem value="completed">Completed</MenuItem>
                    )}

                    {appt.status === "cancelled" && (
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    )}
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllAppointments;
