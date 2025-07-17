import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * A component that renders its children only if the user has the specified permission
 * 
 * @param {Object} props
 * @param {string} props.resource - The resource to check permission for (e.g., 'product', 'user')
 * @param {string} props.action - The action to check permission for (e.g., 'view', 'create', 'edit', 'delete')
 * @param {React.ReactNode} props.children - The content to render if permission is granted
 * @param {React.ReactNode} [props.fallback] - Optional content to render if permission is denied
 */
export const Permission = ({ resource, action, children, fallback = null }) => {
  const { hasPermission, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return fallback;
  
  return hasPermission(resource, action) ? children : fallback;
};

/**
 * A component that renders its children only if the user has the specified role
 * 
 * @param {Object} props
 * @param {string|string[]} props.role - The role(s) to check for (e.g., 'Admin', 'Manager')
 * @param {React.ReactNode} props.children - The content to render if the user has the role
 * @param {React.ReactNode} [props.fallback] - Optional content to render if the user doesn't have the role
 */
export const Role = ({ role, children, fallback = null }) => {
  const { hasRole, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return fallback;
  
  // Check if user has at least one of the specified roles
  const roles = Array.isArray(role) ? role : [role];
  const hasAnyRole = roles.some(r => hasRole(r));
  
  return hasAnyRole ? children : fallback;
};

/**
 * A component that wraps links or buttons to protect navigation
 * Will hide the element if the user doesn't have permission
 * 
 * @param {Object} props
 * @param {string} props.resource - The resource to check permission for
 * @param {string} props.action - The action to check permission for
 * @param {React.ReactNode} props.children - The content to render
 */
export const ProtectedElement = ({ resource, action, ...props }) => {
  return (
    <Permission resource={resource} action={action}>
      {React.cloneElement(React.Children.only(props.children), props)}
    </Permission>
  );
};

export default { Permission, Role, ProtectedElement };
