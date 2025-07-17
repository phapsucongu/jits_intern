/**
 * create-admin.js
 * 
 * A script to create an admin user with full permissions.
 * Run this script using: node create-admin.js
 */

const sails = require('sails');

// Ensure required packages are available
try {
  require('bcryptjs');
} catch (e) {
  console.error('bcryptjs package is required. Please run: npm install bcryptjs --save');
  process.exit(1);
}

// Start Sails in production mode with debug logging
sails.lift({
  log: { level: 'debug' }
}, async function(err) {
  
  if (err) {
    console.error('Failed to lift Sails app:', err);
    return process.exit(1);
  }

  try {
    console.log('Creating admin user...');
    
    // Create necessary permissions first
    console.log('Setting up basic permissions...');
    
    // Create basic permissions if they don't exist
    const basicPermissions = [
      { resource: 'product', action: 'view', description: 'View products' },
      { resource: 'product', action: 'create', description: 'Create products' },
      { resource: 'product', action: 'edit', description: 'Edit products' },
      { resource: 'product', action: 'delete', description: 'Delete products' },
      { resource: 'product', action: 'manage', description: 'Manage all product operations' }
    ];
    
    for (const perm of basicPermissions) {
      try {
        const exists = await Permission.findOne({ 
          resource: perm.resource, 
          action: perm.action 
        });
        
        if (!exists) {
          await Permission.create(perm);
          console.log(`Created permission: ${perm.resource}:${perm.action}`);
        }
      } catch (err) {
        console.warn(`Could not create permission ${perm.resource}:${perm.action}:`, err.message);
      }
    }
    
    // Get or create the Admin role
    console.log('Finding or creating Admin role...');
    let adminRole = await Role.findOne({ name: 'Admin' });
    
    if (!adminRole) {
      console.log('Admin role not found, creating it...');
      try {
        adminRole = await Role.create({
          name: 'Admin',
          description: 'Administrator with full access to all resources'
        }).fetch();
        
        console.log('Admin role created:', adminRole);
      } catch (err) {
        console.error('Error creating Admin role:', err);
        throw err;
      }
    }
    
    // Ensure the all-powerful permission exists
    let adminPermission = await Permission.findOne({ resource: '*', action: '*' });
    
    if (!adminPermission) {
      console.log('Admin permission not found, creating it...');
      
      try {
        // First check if the Permission model accepts '*' as an action
        const permissionModel = sails.models.permission;
        const actionValidator = permissionModel.attributes.action;
        
        if (actionValidator && 
            actionValidator.isIn && 
            !actionValidator.isIn.includes('*')) {
          console.log('Updating Permission model to allow "*" action...');
          // This is just for debugging - we've already updated the model file
        }
        
        adminPermission = await Permission.create({
          resource: '*',
          action: '*',
          description: 'Full access to all resources'
        }).fetch();
        
        console.log('Admin permission created successfully:', adminPermission);
      } catch (error) {
        console.error('Failed to create admin permission:', error);
        
        // If the error is about the action not being in the allowed values
        if (error.message && error.message.includes("action")) {
          console.error('Please update the Permission.js model to include "*" in the isIn property for action');
          process.exit(1);
        }
        throw error;
      }
    }
    
    // Check if the permission is already assigned to the role
    // We need to use a different approach since we can't query a plural association directly
    const roleWithPermissions = await Role.findOne({ id: adminRole.id }).populate('permissions');
    
    // Check if the permission is already in the role's permissions
    let hasPermission = false;
    if (roleWithPermissions && roleWithPermissions.permissions) {
      hasPermission = roleWithPermissions.permissions.some(p => p.id === adminPermission.id);
    }
    
    if (!hasPermission) {
      await Role.addToCollection(adminRole.id, 'permissions', adminPermission.id);
      console.log('Assigned admin permission to Admin role');
    } else {
      console.log('Admin role already has the admin permission');
    }
    
    // Create the admin user with custom credentials
    const email = 'sadmin@gmail.com'; // Change this to your preferred email
    const password = '123456'; // Change this to your preferred password
    
    // Check if the admin user already exists
    const existingAdmin = await User.findOne({ email });
    
    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists.`);
    } else {
      // Create the admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const adminUser = await User.create({
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        active: true
      }).fetch();
      
      try {
        // Assign the Admin role to the user
        await User.addToCollection(adminUser.id, 'roles', adminRole.id);
        
        console.log(`Admin user created successfully with email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('Please save these credentials securely!');
        
        // Verify the user was created properly
        const verifyUser = await User.findOne({ id: adminUser.id }).populate('roles');
        if (verifyUser) {
          console.log('User verification successful:');
          console.log(`- Email: ${verifyUser.email}`);
          console.log(`- Roles: ${verifyUser.roles.map(r => r.name).join(', ') || 'None'}`);
        }
      } catch (err) {
        console.error('Error assigning role to user:', err);
      }
    }
    
    console.log('Admin setup complete!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  
  // Lower Sails app
  console.log('Shutting down...');
  sails.lower(process.exit);
});
