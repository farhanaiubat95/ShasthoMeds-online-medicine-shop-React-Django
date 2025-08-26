// src/components/product/Findpagecheck.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

const Findpagecheck = ({ open, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" >
      <DialogTitle className="flex justify-between items-center text-lg font-semibold text-[#0F918F]">
        Upload Prescription
        <IconButton onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="flex flex-col items-center justify-center mb-4">
        <div className="w-[500px] h-[600px] border-2 border-dashed border-[#0F918F] rounded-2xl flex flex-col items-center justify-center bg-gray-50 shadow-inner">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Prescription Preview"
              className="w-full h-full object-contain rounded-xl "
            />
          ) : (
            <label
              htmlFor="prescription-upload"
              className="flex flex-col items-center justify-center cursor-pointer "
            >
              <CloudUploadIcon className="text-gray-500 mb-2" fontSize="large" />
              <p className="text-[#0F918F]">Click to upload prescription</p>
              <p className="text-sm text-[#0F918F]">Only JPG, PNG</p>
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
            sx={{
              backgroundColor: "#0F918F",
              color: "white",
              marginTop: "1rem",
            }}
            className="mt-4 px-6 rounded-lg shadow-md bg-[#0F918F] hover:bg-[#30C2C0] text-white"
          >
            Submit Prescription
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Findpagecheck;
