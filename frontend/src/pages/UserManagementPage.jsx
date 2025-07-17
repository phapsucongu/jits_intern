import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../instance/api';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../components/RBAC';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState('list'); // 'list', 'create', 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { hasPermission, currentUser: loggedInUser } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Fetch users and roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersResponse = await api.get('/api/auth/users');
        setUsers(usersResponse.data);

        // Fetch roles
        const rolesResponse = await api.get('/api/auth/roles');
        setRoles(rolesResponse.data);

        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
        console.error('Error fetching users/roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle edit user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEmail(user.email);
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPassword(''); // Don't set password for edit
    setActive(user.active !== false);
    setSelectedRoles(user.roles.map(r => r.id));
    setFormMode('edit');
  };

  // Handle create new user
  const handleCreateUser = () => {
    setCurrentUser(null);
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setActive(true);
    setSelectedRoles([]);
    setFormMode('create');
  };

  // Handle save user (create or update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        email,
        firstName,
        lastName,
        active
      };

      if (formMode === 'create' || (formMode === 'edit' && password)) {
        userData.password = password;
      }

      let userResponse;
      if (formMode === 'create') {
        userResponse = await api.post('/api/register', userData);
        // After registration, update roles
        if (userResponse.data.user && userResponse.data.user.id) {
          await api.put(`/api/auth/users/${userResponse.data.user.id}/roles`, {
            roles: selectedRoles
          });
        }
      } else {
        // Update user details
        await api.put(`/api/auth/users/${currentUser.id}`, userData);
        // Update roles separately
        await api.put(`/api/auth/users/${currentUser.id}/roles`, {
          roles: selectedRoles
        });
      }

      // Refresh users list
      const updatedUsersResponse = await api.get('/api/auth/users');
      setUsers(updatedUsersResponse.data);

      // Go back to list view
      setFormMode('list');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    // Prevent deleting yourself
    if (loggedInUser && loggedInUser.id === userId) {
      alert("You cannot delete your own account");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/auth/users/${userId}`);
      
      // Update users list
      const updatedUsersResponse = await api.get('/api/auth/users');
      setUsers(updatedUsersResponse.data);
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle role selection
  const toggleRole = (roleId) => {
    setSelectedRoles(prevSelected => 
      prevSelected.includes(roleId)
        ? prevSelected.filter(id => id !== roleId)
        : [...prevSelected, roleId]
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => setError(null)} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        {formMode === 'list' && (
          <Permission resource="user" action="create">
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New User
            </button>
          </Permission>
        )}
        {formMode !== 'list' && (
          <button
            onClick={() => setFormMode('list')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        )}
      </div>

      {/* User List View */}
      {formMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {user.firstName || ''} {user.lastName || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map(role => (
                        <span 
                          key={role.id} 
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {role.name}
                        </span>
                      ))}
                      {!user.roles?.length && (
                        <span className="text-gray-500 text-sm">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Permission resource="user" action="edit">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Edit
                        </button>
                      </Permission>
                      <Permission resource="user" action="delete">
                        {/* Don't allow deleting yourself */}
                        {(!loggedInUser || loggedInUser.id !== user.id) && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </Permission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Form (Create/Edit) */}
      {formMode !== 'list' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {formMode === 'create' ? 'Create New User' : 'Edit User'}
          </h2>
          <form onSubmit={handleSaveUser}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                {formMode === 'create' ? 'Password' : 'Password (leave blank to keep current)'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required={formMode === 'create'}
                minLength={formMode === 'create' ? 8 : 0}
              />
              {formMode === 'create' && (
                <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-700">Active</span>
              </label>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Roles
              </label>
              <div className="border rounded-md p-4 grid grid-cols-2 gap-2">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="mr-2"
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormMode('list')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
