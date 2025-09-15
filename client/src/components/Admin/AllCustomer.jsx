import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  updateUser,
  deleteUser,
} from "../../redux/AllUserSlice";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PreviewIcon from "@mui/icons-material/Preview";
import EditSquareIcon from "@mui/icons-material/EditSquare";

const AllCustomer = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.allusers);
  console.log("users customer-> :", users);

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(""); // "view" | "edit" | "delete"
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    if (type === "edit") {
      setFormData({
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        is_verified: user.is_verified,
      });
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType("");
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await dispatch(
        updateUser({
          id: selectedUser.id || selectedUser._id,
          userData: formData,
        }),
      ).unwrap();
      showToast("User updated successfully!", "success");
      closeModal();
      dispatch(fetchAllUsers()); // refresh list
    } catch (err) {
      showToast(`Update failed: ${err}`, "error");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(selectedUser.id || selectedUser._id)).unwrap();
      showToast("User deleted successfully!", "success");
      closeModal();
      dispatch(fetchAllUsers()); // refresh list
    } catch (err) {
      showToast(`Delete failed: ${err}`, "error");
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 text-black overflow-x-auto relative">
      <h1 className="text-2xl font-semibold mb-4">
        All Customers ({users.length})
      </h1>

      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id || user._id}>
                <td className="px-6 py-4 text-center">{user.full_name}</td>
                <td className="px-6 py-4 text-center">{user.username}</td>
                <td className="px-6 py-4 text-center">{user.email}</td>
                <td className="px-6 py-4 text-center">{user.phone}</td>
                <td className="px-6 py-4 text-center">{user.address}</td>
                <td className="px-6 py-4 text-center">{user.role}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => openModal(user, "view")}
                    className="text-green-500"
                  >
                    <PreviewIcon />
                  </button>
                  <button
                    onClick={() => openModal(user, "edit")}
                    className="text-blue-500"
                  >
                    <EditSquareIcon />
                  </button>
                  <button
                    onClick={() => openModal(user, "delete")}
                    className="text-red-600"
                  >
                    <DeleteForeverIcon />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              onClick={closeModal}
            >
              X
            </button>

            {modalType === "view" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">User Details</h2>
                <p>
                  <strong>Name:</strong> {selectedUser.full_name}
                </p>
                <p>
                  <strong>Username:</strong> {selectedUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone}
                </p>
                <p>
                  <strong>Address:</strong> {selectedUser.address}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role}
                </p>
                <p>
                  <strong>Verified:</strong>{" "}
                  {selectedUser.is_verified ? "Yes" : "No"}
                </p>
              </div>
            )}

            {modalType === "edit" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="border p-2 w-full mb-2 rounded"
                />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className="border p-2 w-full mb-2 rounded"
                  disabled
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="border p-2 w-full mb-2 rounded"
                  disabled
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="border p-2 w-full mb-2 rounded"
                />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="border p-2 w-full mb-2 rounded"
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-2 rounded"
                  disabled
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="is_verified"
                    checked={formData.is_verified}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Verified
                </label>
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={handleUpdate}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}

            {modalType === "delete" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-red-600">
                  Delete User
                </h2>
                <p>Are you sure you want to delete {selectedUser.full_name}?</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-600 px-3 py-1 text-white rounded"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCustomer;
