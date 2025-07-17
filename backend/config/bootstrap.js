/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function() {

  try {
    sails.log.info('Initializing searchProducts service...');
    const searchProducts = require('../api/services/searchProducts');
    if (searchProducts.initialize) {
      await searchProducts.initialize();
      sails.log.info('searchProducts service initialized successfully');
    }
  } catch (error) {
    sails.log.error('Failed to initialize searchProducts service:', error);
  }
  try {
    sails.log.info('Initializing elasticsearchSync service for Products...');
    const elasticsearchSync = require('../api/services/elasticsearchSync');
    if (elasticsearchSync.initialize) {
      await elasticsearchSync.initialize();
      sails.log.info('elasticsearchSync service initialized successfully');
      
      setTimeout(async () => {
        try {
          sails.log.info('Performing initial sync of all products...');
          await elasticsearchSync.syncAll('Product');
        } catch (err) {
          sails.log.error('Initial product sync failed:', err);
        }
      }, 5000);
    }
  } catch (error) {
    sails.log.error('Failed to initialize elasticsearchSync service:', error);
  }
  
  // Initialize RBAC system
  try {
    sails.log.info('Initializing RBAC system...');
    
    // Initialize default permissions
    const PermissionController = require('../api/controllers/PermissionController');
    await PermissionController.initializeDefaultPermissions();
    
    // Create default roles
    const adminRole = await Role.findOrCreate(
      { name: 'Admin' },
      { name: 'Admin', description: 'Administrator with full access to all resources' }
    );
    
    const userRole = await Role.findOrCreate(
      { name: 'User' },
      { name: 'User', description: 'Regular user with basic access' }
    );
    
    const managerRole = await Role.findOrCreate(
      { name: 'Manager' },
      { name: 'Manager', description: 'Manager with access to manage products and categories' }
    );
    
    // Assign permissions to roles
    
    // For Admin role, assign the all-powerful permission
    const adminPermission = await Permission.findOne({ resource: '*', action: '*' });
    if (adminPermission && adminRole) {
      await Role.addToCollection(adminRole.id, 'permissions', adminPermission.id);
      sails.log.info('Assigned admin permission to Admin role');
    }
    
    // For User role, assign only view permissions
    const viewProductPerm = await Permission.findOne({ resource: 'product', action: 'view' });
    const viewCategoryPerm = await Permission.findOne({ resource: 'category', action: 'view' });
    
    if (userRole) {
      if (viewProductPerm) {
        await Role.addToCollection(userRole.id, 'permissions', viewProductPerm.id);
      }
      if (viewCategoryPerm) {
        await Role.addToCollection(userRole.id, 'permissions', viewCategoryPerm.id);
      }
      sails.log.info('Assigned view permissions to User role');
    }
    
    // For Manager role, assign product and category management permissions
    if (managerRole) {
      const productPermissions = await Permission.find({ 
        resource: 'product',
        action: { in: ['view', 'create', 'edit', 'delete'] }
      });
      
      const categoryPermissions = await Permission.find({ 
        resource: 'category',
        action: { in: ['view', 'create', 'edit', 'delete'] }
      });
      
      if (productPermissions && productPermissions.length > 0) {
        await Role.addToCollection(managerRole.id, 'permissions', productPermissions.map(p => p.id));
      }
      
      if (categoryPermissions && categoryPermissions.length > 0) {
        await Role.addToCollection(managerRole.id, 'permissions', categoryPermissions.map(p => p.id));
      }
      
      sails.log.info('Assigned product and category permissions to Manager role');
    }
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const adminUser = await User.create({
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        firstName: 'Admin',
        lastName: 'User',
        active: true
      }).fetch();
      
      if (adminUser && adminRole) {
        await User.addToCollection(adminUser.id, 'roles', adminRole.id);
      }
      
      sails.log.info('Created admin user with Admin role');
    }
    
    sails.log.info('RBAC system initialized successfully');
  } catch (error) {
    sails.log.error('Failed to initialize RBAC system:', error);
  }

};
