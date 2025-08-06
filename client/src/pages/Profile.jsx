import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import { updateUser } from "../redux/userSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const readOnlyFields = ["email", "username"]; // Fields not editable
  const visibleFields = [
    "full_name",
    "username",
    "email",
    "phone",
    "gender",
    "date_of_birth",
    "city",
    "address",
  ];

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleToggleEdit = () => {
    setEditMode((prev) => !prev);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const res = await axios.put(
        "https://shasthomeds-backend.onrender.com/update-profile/",
        userData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      dispatch(updateUser(res.data));
      setEditMode(false);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <p>Loading...</p>;

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
            <div className="space-x-2">
              {editMode && (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    backgroundColor: "#0F918F",
                    "&:hover": { backgroundColor: "#0F918Fcc" },
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              )}
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
          </div>

          <Divider className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            {visibleFields.map((field) => (
              <div key={field}>
                <Typography
                  variant="subtitle2"
                  className="text-gray-500 mb-1 capitalize"
                >
                  {field.replace(/_/g, " ")}
                </Typography>
                {editMode && !readOnlyFields.includes(field) ? (
                  <TextField
                    name={field}
                    value={userData[field] || ""}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    type={field === "date_of_birth" ? "date" : "text"}
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <Typography variant="body1" className="font-medium">
                    {userData[field]}
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
