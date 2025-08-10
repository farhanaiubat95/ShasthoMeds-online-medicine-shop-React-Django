import React, { useEffect, useState } from 'react';

const Payment = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulate fetching users from a backend
    const mockUsers = [
      {
        _id: "1",
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        phone: "123-456-7890",
        address: "123 Main St",
        role: "Customer",
        activity: true
      },
      {
        _id: "2",
        firstname: "Jane",
        lastname: "Smith",
        username: "janesmith",
        email: "jane@example.com",
        phone: "987-654-3210",
        address: "456 Oak Ave",
        role: "Customer",
        activity: false
      }
    ];

    setUsers(mockUsers);
  }, []);

  const handleToggleActivity = (userId, currentStatus) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, activity: !currentStatus } : user
      )
    );
  };

  const handleDelete = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 text-black overflow-x-auto">
      <h1 className="text-2xl font-semibold mb-4">Payments</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Address</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 text-center whitespace-nowrap">{user.firstname} {user.lastname}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">{user.phone}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">{user.address}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleToggleActivity(user._id, user.activity)}
                    className={`${user.activity ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-700 hover:bg-green-800'} text-white px-4 py-1 rounded cursor-pointer`}
                  >
                    {user.activity ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center px-6 py-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


export default Payment
