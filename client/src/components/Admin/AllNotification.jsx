import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Modal,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPrescriptions,
  updatePrescription,
} from "../../redux/prescriptionSlice.js";

function AllNotification() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.prescriptions);
  const token = localStorage.getItem("access_token");

  const [selectedImage, setSelectedImage] = useState(null);

  // useEffect(() => {
  //   if (token) dispatch(fetchPrescriptions(token));
  // }, [dispatch, token]);

  // 🔹 Handle status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      alert("Are you sure you want to " + newStatus + " this prescription?");
      await dispatch(
        updatePrescription({ id, data: { status: newStatus } }),
      ).unwrap();
      dispatch(fetchPrescriptions()); // refresh after update
    } catch (err) {
      alert("Error updating status: " + (err.message || err));
    }
  };

  if (loading)
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Prescription Requests
      </Typography>

      <Table sx={{ border: "1px solid #ddd" }}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Admin Comment</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items?.results && items.results.length > 0 ? (
            items.results.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.product?.name || "N/A"}</TableCell>
                <TableCell>{p.notes || "-"}</TableCell>
                <TableCell>
                  {p.uploaded_image ? (
                    <img
                      src={p.uploaded_image}
                      alt="Prescription"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedImage(p.uploaded_image)}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{p.admin_comment || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleStatusChange(p.id, "approved")}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleStatusChange(p.id, "rejected")}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No prescriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 🔹 Image Modal */}
      <Modal open={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: "80%",
            maxHeight: "80%",
            overflow: "auto",
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Prescription"
              style={{ maxWidth: "100%", maxHeight: "80vh" }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default AllNotification;
