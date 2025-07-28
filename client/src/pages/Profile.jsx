import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
} from "@mui/material";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "Farhana Bente Islam",
    username: "shastho@91",
    email: "farhana@example.com",
    phone: "+8801XXXXXXXXX",
    dob: "2000-05-25",
    gender: "Female",
    city: "Dhaka",
    address: "House #123, Road #45, Dhanmondi",
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleToggleEdit = () => {
    setEditMode((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 px-4 py-10">
      <Card
        className="w-full max-w-3xl shadow-xl border"
        sx={{ borderColor: "#0F918F", borderWidth: 2 }}
      >
        <CardContent>
          <div className="flex justify-between items-center">
            <Typography variant="h4" gutterBottom sx={{ color: "#0F918F" }}>
              My Profile
            </Typography>
            <Button
              variant="contained"
              onClick={handleToggleEdit}
              sx={{
                backgroundColor: "#0F918F",
                "&:hover": { backgroundColor: "#0F918Fcc" },
              }}
            >
              {editMode ? "Cancel" : "Edit"}
            </Button>
          </div>

          <Divider className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            {Object.entries(userData).map(([field, value]) => (
              <div key={field}>
                <Typography variant="subtitle2" className="text-gray-500 mb-1 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </Typography>
                {editMode ? (
                  <TextField
                    name={field}
                    value={value}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    type={field === "dob" ? "date" : "text"}
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <Typography variant="body1" className="font-medium">
                    {value}
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
