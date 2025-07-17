/**
 * Script to check if the admin user has the Admin role
 * Run with: node scripts/check-admin-role.js
 */

// Setup Sails programmatically
const sails = require('sails');

// Configuration for non-interactive script
sails.lift({
  hooks: { 
    grunt: false,
    views: false,
    sockets: false,
    pubsub: false,
    http: false
  },
  log: { level: 'info' }
}, async (err) => {
  if (err) {
    console.error('Failed to lift Sails:', err);
    return sails.lower(process.exit);
  }

  try {
    // Find admin user
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('Admin user not found!');
      return sails.lower(process.exit);
    }
    
    console.log(`Found user: ${admin.email} (ID: ${admin.id})`);
    
    // Get user with populated roles
    const adminWithRoles = await User.findOne({ id: admin.id })
      .populate('roles');
    
    if (!adminWithRoles.roles || adminWithRoles.roles.length === 0) {
      console.log('Admin user has no roles assigned!');
      
      // Try to assign the admin role
      const adminRole = await Role.findOne({ name: 'Admin' });
      if (adminRole) {
        console.log(`Found Admin role with ID: ${adminRole.id}`);
        await User.addToCollection(admin.id, 'roles', adminRole.id);
        console.log('Successfully assigned Admin role to user');
      } else {
        console.log('Admin role not found in the database!');
      }
    } else {
      console.log('Admin user has the following roles:');
      adminWithRoles.roles.forEach(role => {
        console.log(`- ${role.name} (ID: ${role.id})`);
      });
      
      // Check if user has Admin role
      const hasAdminRole = adminWithRoles.roles.some(r => r.name === 'Admin');
      if (!hasAdminRole) {
        console.log('User does NOT have the Admin role!');
        
        // Try to assign the admin role
        const adminRole = await Role.findOne({ name: 'Admin' });
        if (adminRole) {
          console.log(`Found Admin role with ID: ${adminRole.id}`);
          await User.addToCollection(admin.id, 'roles', adminRole.id);
          console.log('Successfully assigned Admin role to user');
        }
      } else {
        console.log('User has the Admin role ✓');
      }
    }
  } catch (error) {
    console.error('Error checking admin role:', error);
  }
  
  // Always lower Sails at the end of the script
  return sails.lower(process.exit);
});
