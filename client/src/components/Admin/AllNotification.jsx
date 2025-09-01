import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPrescriptions,
  updatePrescription,
} from "../../redux/prescriptionSlice.js";

function AllNotification() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.prescriptions);

  useEffect(() => {
    dispatch(fetchPrescriptions());
  }, [dispatch]);

  const handleApprove = async (id) => {
    try {
      alert("Are you sure you want to approve this prescription?");
      await dispatch(
        updatePrescription({ id, data: { status: "approved" } }),
      ).unwrap();
      // Refetch list after successful update
      dispatch(fetchPrescriptions());
    } catch (err) {
      alert("Error approving prescription: " + (err.message || err));
    }
  };

  const handleReject = async (id) => {
    try {
      alert("Are you sure you want to reject this prescription?");
      await dispatch(
        updatePrescription({
          id,
          data: { status: "rejected", admin_comment: "Invalid prescription" },
        }),
      ).unwrap();
      // Refetch list after successful update
      dispatch(fetchPrescriptions());
    } catch (err) {
      alert("Error rejecting prescription: " + (err.message || err));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Prescription Requests</h2>
      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>ID</th>
            <th>Product</th>
            <th>Status</th>
            <th>Admin Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.product?.name || "N/A"}</td>
              <td>{p.status}</td>
              <td>{p.admin_comment || "-"}</td>
              <td>
                <button
                  onClick={() => handleApprove(p.id)}
                  style={{ marginRight: "8px" }}
                >
                  Approve
                </button>
                <button onClick={() => handleReject(p.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllNotification;
