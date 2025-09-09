import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../redux/doctorSlice.js";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const AllDoctors = () => {
  const dispatch = useDispatch();
  const { doctors, loading, error } = useSelector((state) => state.doctors);
  const doctorsList = doctors?.results || doctors || [];

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    specialization: "",
    experience_years: "",
    max_patients_per_day: "",
    consultation_fee: "",
    available_days: [],
    available_time: [],
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // For available_time slot picker
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // For doctor details dialog
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch doctors initially
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDaysChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      available_days: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmMsg = editMode
      ? "Are you sure you want to update this doctor?"
      : "Are you sure you want to add this doctor?";
    if (!window.confirm(confirmMsg)) return;

    try {
      if (editMode) {
        await dispatch(updateDoctor({ id: editId, doctorData: formData }));
        setEditMode(false);
        setEditId(null);
      } else {
        await dispatch(addDoctor(formData));
      }

      // Refresh list after add/update
      dispatch(fetchDoctors());

      // Reset form
      setFormData({
        full_name: "",
        specialization: "",
        experience_years: "",
        max_patients_per_day: "",
        consultation_fee: "",
        available_days: [],
        available_time: [],
      });
    } catch (err) {
      console.error("Error submitting doctor:", err);
    }
  };

  const handleEdit = (doctor) => {
    setFormData({
      full_name: doctor.full_name,
      specialization: doctor.specialization,
      experience_years: doctor.experience_years,
      max_patients_per_day: doctor.max_patients_per_day,
      consultation_fee: doctor.consultation_fee,
      available_days: doctor.available_days || [],
      available_time: doctor.available_time || [],
    });
    setEditMode(true);
    setEditId(doctor.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await dispatch(deleteDoctor(id));
        dispatch(fetchDoctors());
      } catch (err) {
        console.error("Error deleting doctor:", err);
      }
    }
  };

  const handleAddTimeSlot = () => {
    if (startTime && endTime) {
      const slot = `${dayjs(startTime).format("HH:mm")}-${dayjs(endTime).format(
        "HH:mm",
      )}`;
      setFormData({
        ...formData,
        available_time: [...formData.available_time, slot],
      });
      setStartTime(null);
      setEndTime(null);
    }
  };

  const handleRemoveTimeSlot = (idx) => {
    setFormData({
      ...formData,
      available_time: formData.available_time.filter((_, i) => i !== idx),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* LEFT SIDE: Add/Edit Doctor */}
        <Card className="shadow-xl rounded-2xl border border-gray-200">
          <CardContent>
            <Typography variant="h6" gutterBottom className="font-semibold">
              {editMode ? "Edit Doctor" : "Add Doctor"}
            </Typography>
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Experience (years)"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Max Patients per Day"
                name="max_patients_per_day"
                value={formData.max_patients_per_day}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Consultation Fee"
                name="consultation_fee"
                value={formData.consultation_fee}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />

              {/* Available Days */}
              <FormControl fullWidth>
                <InputLabel>Available Days</InputLabel>
                <Select
                  multiple
                  value={formData.available_days}
                  onChange={handleDaysChange}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Available Time */}
              <div>
                <Typography variant="subtitle1" className="mb-2">
                  Available Time Slots
                </Typography>
                <div className="flex gap-2 items-center mb-2">
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    sx={{ flex: 1 }}
                  />
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" onClick={handleAddTimeSlot}>
                    Add
                  </Button>
                </div>

                {/* Show added slots */}
                <div className="flex flex-wrap gap-2">
                  {formData.available_time.map((slot, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {slot}
                      <button
                        type="button"
                        className="text-red-500 font-bold ml-1"
                        onClick={() => handleRemoveTimeSlot(idx)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {editMode ? "Update Doctor" : "Add Doctor"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RIGHT SIDE: Doctor List */}
        <Card className="shadow-xl rounded-2xl border border-gray-200 overflow-x-auto">
          <CardContent>
            <Typography variant="h6" gutterBottom className="font-semibold">
              Doctors List
            </Typography>
            {loading && <p>Loading doctors...</p>}
            {!loading && doctorsList.length === 0 && (
              <p className="text-gray-500">No doctors found.</p>
            )}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Specialization</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Experience</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Patients/Day</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fee</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctorsList.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell
                      sx={{
                        maxWidth: 150, // limit width
                        whiteSpace: "nowrap", // keep text in one line
                        overflow: "hidden", // hide overflow
                        textOverflow: "ellipsis", // show ...
                      }}
                    >
                      {doctor.full_name}
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 120,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doctor.specialization}
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 80,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doctor.experience_years} yrs
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 100,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doctor.max_patients_per_day}
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 100,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doctor.consultation_fee}
                    </TableCell>

                    <TableCell className="flex gap-1">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(doctor)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEdit(doctor)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Doctor Details Dialog */}
        <Dialog
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Doctor Details</DialogTitle>
          <DialogContent dividers>
            {selectedDoctor && (
              <div className="space-y-2">
                <Typography>
                  <strong>Name:</strong> {selectedDoctor.full_name}
                </Typography>
                <Typography>
                  <strong>Specialization:</strong>{" "}
                  {selectedDoctor.specialization}
                </Typography>
                <Typography>
                  <strong>Experience:</strong> {selectedDoctor.experience_years}{" "}
                  years
                </Typography>
                <Typography>
                  <strong>Max Patients/Day:</strong>{" "}
                  {selectedDoctor.max_patients_per_day}
                </Typography>
                <Typography>
                  <strong>Fee:</strong> {selectedDoctor.consultation_fee}
                </Typography>
                <Typography>
                  <strong>Available Days:</strong>{" "}
                  {selectedDoctor.available_days?.join(", ")}
                </Typography>
                <Typography>
                  <strong>Available Time:</strong>{" "}
                  {selectedDoctor.available_time?.join(", ")}
                </Typography>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default AllDoctors;
