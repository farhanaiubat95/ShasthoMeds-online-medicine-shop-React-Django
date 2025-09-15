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
  const { items, error } = useSelector((state) => state.prescriptions);
  const token = localStorage.getItem("access_token");

  const [selectedImage, setSelectedImage] = useState(null);

  // useEffect(() => {
  //   if (token) dispatch(fetchPrescriptions(token));
  // }, [dispatch, token]);

  // 🔹 Handle status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      if (
        window.confirm(
          `Are you sure you want to ${newStatus} this prescription?`,
        )
      ) {
        await dispatch(
          updatePrescription({ id, data: { status: newStatus }, token }),
        ).unwrap();
        dispatch(fetchPrescriptions(token)); // refresh after update
      }
    } catch (err) {
      alert("Error updating status: " + (err.message || err));
    }
  };

  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Prescription Requests
      </Typography>

      <Table sx={{ border: "1px solid #ddd" }}>
        <TableHead sx={{ backgroundColor: "#9fced8" }}>
          <TableRow>
            <TableCell sx={{ textAlign: "center" }}>ID</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Product</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Notes</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Image</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Date</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Admin Comment</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items?.results && items.results.length > 0 ? (
            items.results.map((p) => (
              <TableRow key={p.id} sx={{ backgroundColor: "#8cc5a142" }}>
                <TableCell sx={{ textAlign: "center" }}>{p.id}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {p.product?.name || "N/A"}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {p.notes || "-"}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
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
                <TableCell sx={{ textAlign: "center" }}>
                  {new Date(p.created_at).toLocaleString() || ""}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {p.admin_comment || "-"}
                </TableCell>
                <TableCell sx={{ display: "flex", justifyContent: "center" }}>
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
                No notifications available.
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
              style={{ maxHeight: "80vh" }}
              className="w-[500px] xl:w-[1000px]"
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default AllNotification;
