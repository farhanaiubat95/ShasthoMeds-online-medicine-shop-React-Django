import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointments,
  updateAppointmentStatus,
} from "../../redux/appoinmentSlice.js"; // adjust path
import {
  Button,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

const AllAppointments = ({ token }) => {
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const appointmentsList = appointments?.results || [];
  console.log("Appointments:", appointmentsList);

  // Load all appointments for this user
  useEffect(() => {
    if (token) {
      dispatch(fetchAppointments({ token }));
    }
  }, [dispatch, token]);

  // Group appointments by date
  const groupedByDate = {};
  appointmentsList.forEach((appt) => {
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

      // Auto refresh after successful update
      await dispatch(fetchAppointments({ token }));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating appointment. Please try again.");
    }
  };

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Appointments </h2>

      {appointmentsList.length === 0 && <p>No appointments found.</p>}

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
                      {appt.patient_name || `User ${appt.user}`}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Doctor:</strong>{" "}
                      {appt.doctor_name || `Doctor ${appt.doctor}`}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {appt.time_slot}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {appt.status}
                    </Typography>
                  </div>

                  {/* Status Update Dropdown */}
                  <Select
                    value={appt.status}
                    onChange={(e) =>
                      handleStatusChange(appt.id, e.target.value)
                    }
                    size="small"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
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
