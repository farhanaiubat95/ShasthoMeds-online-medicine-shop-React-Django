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
import axios from "axios";
import axiosInstance from "../../axiosInstance";

const PrescriptionUpload = ({ open, onClose, product, token }) => {
  const [selectedImage, setSelectedImage] = useState(null);

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
    formData.append("product_id", product.id);

    // Use the correct field name for your serializer
    formData.append("uploaded_image", selectedImage);

    try {
      await axiosInstance.post("/prescriptions/requests/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Prescription uploaded successfully!");
      onClose();
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error);
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
        <div className="w-[500px] h-[600px] border-2 border-dashed border-[#0F918F] rounded-2xl flex flex-col items-center justify-center bg-gray-50 shadow-inner">
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionUpload;
