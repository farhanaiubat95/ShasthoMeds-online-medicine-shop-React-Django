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
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";

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
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch doctors initially
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    });
    setEditMode(true);
    setEditId(doctor.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await dispatch(deleteDoctor(id));

        // Refresh list after delete
        dispatch(fetchDoctors());
      } catch (err) {
        console.error("Error deleting doctor:", err);
      }
    }
  };

  return (
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
            />
            <TextField
              fullWidth
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Experience (years)"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Max Patients per Day"
              name="max_patients_per_day"
              value={formData.max_patients_per_day}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Consultation Fee"
              name="consultation_fee"
              value={formData.consultation_fee}
              onChange={handleChange}
              required
            />
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
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Specialization</strong></TableCell>
                <TableCell><strong>Experience</strong></TableCell>
                <TableCell><strong>Patients/Day</strong></TableCell>
                <TableCell><strong>Fee</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctorsList.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.full_name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.experience_years} yrs</TableCell>
                  <TableCell>{doctor.max_patients_per_day}</TableCell>
                  <TableCell>{doctor.consultation_fee}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => alert(JSON.stringify(doctor, null, 2))}
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
    </div>
  );
};

export default AllDoctors;
