import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../instance/api';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../components/RBACComponents';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState('list'); // 'list', 'create', 'edit'
  const [currentRole, setCurrentRole] = useState(null);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // Form state
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Fetch roles and permissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch roles
        const rolesResponse = await api.get('/api/auth/roles');
        setRoles(rolesResponse.data);

        // Fetch permissions
        const permissionsResponse = await api.get('/api/auth/permissions');
        setPermissions(permissionsResponse.data);

        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
        console.error('Error fetching roles/permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle edit role
  const handleEditRole = (role) => {
    setCurrentRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissions(role.permissions.map(p => p.id));
    setFormMode('edit');
  };

  // Handle create new role
  const handleCreateRole = () => {
    setCurrentRole(null);
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setFormMode('create');
  };

  // Handle save role (create or update)
  const handleSaveRole = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roleData = {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions
      };

      let response;
      if (formMode === 'create') {
        response = await api.post('/api/auth/roles', roleData);
      } else {
        response = await api.put(`/api/auth/roles/${currentRole.id}`, roleData);
      }

      // Update roles list with new data
      const updatedRolesResponse = await api.get('/api/auth/roles');
      setRoles(updatedRolesResponse.data);

      // Go back to list view
      setFormMode('list');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save role');
      console.error('Error saving role:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/auth/roles/${roleId}`);
      
      // Update roles list
      const updatedRolesResponse = await api.get('/api/auth/roles');
      setRoles(updatedRolesResponse.data);
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete role');
      console.error('Error deleting role:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle permission selection
  const togglePermission = (permissionId) => {
    setSelectedPermissions(prevSelected => 
      prevSelected.includes(permissionId)
        ? prevSelected.filter(id => id !== permissionId)
        : [...prevSelected, permissionId]
    );
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  if (loading && roles.length === 0) {
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
        <h1 className="text-2xl font-semibold">Role Management</h1>
        {formMode === 'list' && (
          <Permission resource="role" action="create">
            <button
              onClick={handleCreateRole}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Role
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

      {/* Role List View */}
      {formMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map(role => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{role.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500">{role.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.slice(0, 3).map(perm => (
                        <span 
                          key={perm.id} 
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {perm.action} {perm.resource}
                        </span>
                      ))}
                      {role.permissions?.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Permission resource="role" action="edit">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Edit
                        </button>
                      </Permission>
                      <Permission resource="role" action="delete">
                        {/* Don't allow deleting system roles */}
                        {!['Admin', 'SuperAdmin'].includes(role.name) && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
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

      {/* Role Form (Create/Edit) */}
      {formMode !== 'list' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {formMode === 'create' ? 'Create New Role' : 'Edit Role'}
          </h2>
          <form onSubmit={handleSaveRole}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="roleName">
                Role Name
              </label>
              <input
                id="roleName"
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="roleDescription">
                Description
              </label>
              <textarea
                id="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="2"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Permissions
              </label>
              <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="mb-4">
                    <h3 className="text-md font-medium text-gray-700 mb-2 capitalize">{resource}</h3>
                    <div className="ml-4 grid grid-cols-2 gap-2">
                      {perms.map(permission => (
                        <label key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mr-2"
                          />
                          <span className="text-sm">{permission.action} {permission.resource}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
                {loading ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
