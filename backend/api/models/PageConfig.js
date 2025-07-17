/**
 * PageConfig.js
 *
 * @description :: Model for storing dynamic page configurations
 */

module.exports = {
  attributes: {
    title: {
      type: 'string',
      required: true,
      description: 'Title of the page'
    },

    slug: {
      type: 'string',
      required: true,
      unique: true,
      description: 'URL slug for the page (e.g., "products", "users")'
    },
    
    description: {
      type: 'string',
      allowNull: true,
      description: 'Description of the page'
    },
    
    isPublished: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Whether the page is published and visible to users'
    },
    
    layout: {
      type: 'string',
      defaultsTo: 'default',
      description: 'Layout template to use (e.g., "default", "wide", "sidebar")'
    },
    
    config: {
      type: 'json',
      description: 'JSON configuration for the page components'
    },
    
    version: {
      type: 'number',
      defaultsTo: 1,
      description: 'Version number of this page config, incremented on each update'
    },
    
    // Associations
    components: {
      collection: 'pagecomponent',
      via: 'page'
    },
    
    // Audit fields
    createdBy: {
      model: 'user',
      description: 'User who created this page configuration'
    },
    
    lastModifiedBy: {
      model: 'user',
      description: 'User who last modified this page configuration'
    }
  }
};
