/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  register: async function (req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.badRequest({ error: 'Email and password are required.' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ email, password: hashedPassword }).fetch();
      return res.status(201).json({ message: 'User created successfully.', user });
    } catch (error) {
      sails.log.error('User registration error:', error);
      return res.serverError({ error: 'Error creating user.', details: error.message });
    }
  },

  login: async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.badRequest({ error: 'Email and password are required.' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.notFound({ error: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.forbidden({ error: 'Invalid credentials.' });
      }

      const jwtSecret = sails.config.custom.JWT_SECRET;
      if (!jwtSecret) {
        sails.log.error('JWT_SECRET is not configured');
        return res.serverError({ error: 'Authentication configuration error' });
      }

      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
      return res.ok({ message: 'Login successful.', token });
    } catch (error) {
      sails.log.error('Login error:', error);
      return res.serverError({ error: 'Error logging in.', details: error.message });
    }
  },

  validate: async function (req, res) {
    try {
      // If the request reaches here through the isAuthenticated policy,
      // the token is valid and we can return user details with roles and permissions
      
      // Check if req.user exists to avoid the TypeError
      if (!req.user) {
        sails.log.error('User validation error: req.user is undefined');
        return res.forbidden({ error: 'Authentication required' });
      }
      
      const userId = req.user.id;
      
      // Get the user with their roles
      const user = await User.findOne({ id: userId })
        .populate('roles');
        
      if (!user) {
        return res.notFound({ error: 'User not found' });
      }
      
      // Update last login time
      await User.updateOne({ id: userId })
        .set({ lastLogin: Date.now() });
      
      // Get all permissions for this user's roles
      const roleIds = user.roles.map(role => role.id);
      let permissions = [];
      
      if (roleIds.length > 0) {
        const roles = await Role.find({ id: { in: roleIds } })
          .populate('permissions');
          
        // Collect all unique permissions
        const permissionSet = new Set();
        roles.forEach(role => {
          role.permissions.forEach(perm => {
            permissionSet.add(`${perm.resource}:${perm.action}`);
          });
        });
        
        permissions = Array.from(permissionSet);
      }
      
      // Return user data without sensitive fields
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roles: user.roles.map(role => ({ id: role.id, name: role.name })),
        permissions,
        lastLogin: user.lastLogin
      };
      
      return res.ok({ 
        message: 'Token is valid', 
        user: userData
      });
    } catch (error) {
      sails.log.error('User validation error:', error);
      return res.serverError({ error: 'Error validating user', details: error.message });
    }
  },
  
  /**
   * Get all users
   */
  find: async function(req, res) {
    try {
      const users = await User.find()
        .populate('roles');
      
      // Remove sensitive information
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        active: user.active,
        lastLogin: user.lastLogin,
        roles: user.roles.map(role => ({ id: role.id, name: role.name }))
      }));
      
      return res.json(sanitizedUsers);
    } catch (err) {
      sails.log.error('Error finding users:', err);
      return res.serverError({
        error: 'Failed to retrieve users',
        details: err.message
      });
    }
  },
  
  /**
   * Find a specific user by ID
   */
  findOne: async function(req, res) {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.badRequest({error: 'User ID is required'});
      }
      
      const user = await User.findOne({id: userId})
        .populate('roles');
      
      if (!user) {
        return res.notFound({error: 'User not found'});
      }
      
      // Remove sensitive information
      const sanitizedUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        active: user.active,
        lastLogin: user.lastLogin,
        roles: user.roles.map(role => ({ id: role.id, name: role.name }))
      };
      
      return res.json(sanitizedUser);
    } catch (err) {
      sails.log.error('Error finding user:', err);
      return res.serverError({
        error: 'Failed to retrieve user',
        details: err.message
      });
    }
  },
  
  /**
   * Update a user
   */
  update: async function(req, res) {
    try {
      const userId = req.params.id;
      const { email, firstName, lastName, active, password } = req.body;
      
      if (!userId) {
        return res.badRequest({error: 'User ID is required'});
      }
      
      // Check if user exists
      const existingUser = await User.findOne({id: userId});
      if (!existingUser) {
        return res.notFound({error: 'User not found'});
      }
      
      // Build update object
      const updates = {};
      if (email) updates.email = email;
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (active !== undefined) updates.active = active;
      
      // Handle password update separately to hash it
      if (password && password.length >= 8) {
        updates.password = await bcrypt.hash(password, 10);
      }
      
      // Update the user
      await User.updateOne({id: userId}).set(updates);
      
      // Get updated user
      const updatedUser = await User.findOne({id: userId})
        .populate('roles');
      
      // Return sanitized user
      const sanitizedUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        active: updatedUser.active,
        lastLogin: updatedUser.lastLogin,
        roles: updatedUser.roles.map(role => ({ id: role.id, name: role.name }))
      };
      
      return res.json(sanitizedUser);
    } catch (err) {
      sails.log.error('Error updating user:', err);
      return res.serverError({
        error: 'Failed to update user',
        details: err.message
      });
    }
  },
  
  /**
   * Delete a user
   */
  delete: async function(req, res) {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.badRequest({error: 'User ID is required'});
      }
      
      // Don't allow a user to delete themselves
      if (req.user && req.user.id === userId) {
        return res.forbidden({error: 'Cannot delete your own account'});
      }
      
      // Check if user exists
      const existingUser = await User.findOne({id: userId});
      if (!existingUser) {
        return res.notFound({error: 'User not found'});
      }
      
      // Delete the user
      await User.destroyOne({id: userId});
      
      return res.json({
        message: `User deleted successfully`
      });
    } catch (err) {
      sails.log.error('Error deleting user:', err);
      return res.serverError({
        error: 'Failed to delete user',
        details: err.message
      });
    }
  },
  
  /**
   * Update user roles
   */
  updateRoles: async function(req, res) {
    try {
      const userId = req.params.id;
      const { roles } = req.body;
      
      if (!userId) {
        return res.badRequest({error: 'User ID is required'});
      }
      
      if (!roles || !Array.isArray(roles)) {
        return res.badRequest({error: 'Roles array is required'});
      }
      
      // Check if user exists
      const existingUser = await User.findOne({id: userId});
      if (!existingUser) {
        return res.notFound({error: 'User not found'});
      }
      
      // Remove existing roles and add new ones
      await User.replaceCollection(userId, 'roles').members(roles);
      
      // Get updated user
      const updatedUser = await User.findOne({id: userId})
        .populate('roles');
      
      // Return sanitized user
      const sanitizedUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        active: updatedUser.active,
        roles: updatedUser.roles.map(role => ({ id: role.id, name: role.name }))
      };
      
      return res.json(sanitizedUser);
    } catch (err) {
      sails.log.error('Error updating user roles:', err);
      return res.serverError({
        error: 'Failed to update user roles',
        details: err.message
      });
    }
  },
  
  /**
   * Get user permissions
   */
  getPermissions: async function(req, res) {
    try {
      const userId = req.params.id || req.user.id;
      
      // Get user with roles
      const user = await User.findOne({ id: userId })
        .populate('roles');
        
      if (!user) {
        return res.notFound({ error: 'User not found' });
      }
      
      // Get permissions for each role
      const roleIds = user.roles.map(role => role.id);
      let permissions = [];
      
      if (roleIds.length > 0) {
        const roles = await Role.find({ id: { in: roleIds } })
          .populate('permissions');
          
        // Create a flat array of permission objects
        const permissionObjects = [];
        roles.forEach(role => {
          role.permissions.forEach(perm => {
            permissionObjects.push({
              resource: perm.resource,
              action: perm.action,
              description: perm.description
            });
          });
        });
        
        // Create a unique list using resource:action as key
        const uniquePermissions = {};
        permissionObjects.forEach(perm => {
          const key = `${perm.resource}:${perm.action}`;
          uniquePermissions[key] = perm;
        });
        
        permissions = Object.values(uniquePermissions);
      }
      
      return res.json({ permissions });
    } catch (err) {
      sails.log.error('Error getting user permissions:', err);
      return res.serverError({
        error: 'Failed to get user permissions',
        details: err.message
      });
    }
  }
};

