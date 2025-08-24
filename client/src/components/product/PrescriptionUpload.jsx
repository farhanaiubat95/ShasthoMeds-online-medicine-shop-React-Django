import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../axiosInstance";

const PrescriptionUpload = ({ open, onClose, product }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [notes, setNotes] = useState(""); // Added notes state

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    ) {
      setSelectedImage(file);
    } else {
      alert("Invalid file type. Only JPG, PNG, or PDF allowed.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("uploaded_image", selectedImage);
    formData.append("notes", notes); // append notes
    formData.append("auto_add_to_cart", "true");

    const items = [
      {
        product: product.id,
        quantity: 1,
        note: notes || "Optional note",
      },
    ];
    formData.append("items", JSON.stringify(items));

    try {
      const response = await axiosInstance.post("/prescriptions/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Prescription uploaded:", response.data);
      alert("Prescription uploaded successfully!");
      onClose(); // Close dialog after successful upload
    } catch (error) {
      console.error(
        "Upload failed:",
        error.response?.data || error.message || error,
      );
      alert("Failed to upload prescription.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle className="flex justify-between items-center text-lg font-semibold text-[#0F918F]">
        Upload Prescription
        <IconButton onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Show product name */}
      <Typography
        variant="subtitle1"
        className="text-center mb-2 text-[#0F918F]"
      >
        {product.name} requires a prescription
      </Typography>

      <DialogContent className="flex flex-col items-center justify-center mb-4">
        <div className="w-[500px] h-[500px] border-2 border-dashed border-[#0F918F] rounded-2xl flex flex-col items-center justify-center bg-gray-50 shadow-inner">
          {selectedImage ? (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Prescription Preview"
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <label
              htmlFor="prescription-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <CloudUploadIcon
                className="text-gray-500 mb-2"
                fontSize="large"
              />
              <p className="text-[#0F918F]">Click to upload prescription</p>
              <p className="text-sm text-[#0F918F]">Only JPG, PNG, PDF</p>
              <input
                id="prescription-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {selectedImage && (
          <>
            {/* Notes field */}
            <textarea
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="
    w-full
    h-24
    p-3
    mb-4
    rounded-2xl
    border-2
    border-[#0F918F]
    focus:outline-none
    focus:ring-2
    focus:ring-[#30C2C0]
    focus:border-[#30C2C0]
    bg-gray-50
    text-gray-700
    placeholder:text-gray-400
    resize-none
    shadow-inner
  "
            />

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: "#0F918F",
                color: "white",
                marginTop: "1rem",
              }}
              className="mt-4 px-6 rounded-lg shadow-md hover:bg-[#30C2C0]"
            >
              Submit Prescription
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionUpload;
