import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPrescriptions,
  updatePrescription,
} from "../../redux/prescriptionSlice.js";

function AllNotification() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.prescriptions);
   const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token) dispatch(fetchPrescriptions(token));
  }, [dispatch, token]);

  const handleApprove = async (id) => {
    try {
      if (
        window.confirm("Are you sure you want to approve this prescription?")
      ) {
        await dispatch(
          updatePrescription({ id, data: { status: "approved" } }),
        ).unwrap();
        dispatch(fetchPrescriptions()); // refresh list
      }
    } catch (err) {
      alert("Error approving prescription: " + (err.message || err));
    }
  };

  const handleReject = async (id) => {
    try {
      if (
        window.confirm("Are you sure you want to reject this prescription?")
      ) {
        await dispatch(
          updatePrescription({
            id,
            data: { status: "rejected", admin_comment: "Invalid prescription" },
          }),
        ).unwrap();
        dispatch(fetchPrescriptions()); // refresh list
      }
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
            <th>Notes</th>
            <th>Status</th>
            <th>Admin Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items?.results && items?.results?.length > 0 ? (
            items.results.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.product?.name || "N/A"}</td>
                <td>{p.notes || "-"}</td>
                <td>{p.status}</td>
                <td>{p.admin_comment || "-"}</td>
                <td>
                  {p.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(p.id)}
                        style={{ marginRight: "8px" }}
                      >
                        Approve
                      </button>
                      <button onClick={() => handleReject(p.id)}>Reject</button>
                    </>
                  )}
                  {p.status !== "pending" && <span>No Actions</span>}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No prescriptions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AllNotification;
