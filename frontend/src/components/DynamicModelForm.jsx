import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DynamicModelForm({ onSubmit, initialData = null }) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    displayName: initialData?.displayName || '',
    fields: initialData?.fields || [{ name: '', type: 'string', required: false }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { name: '', type: 'string', required: false }]
    });
  };
  
  const handleRemoveField = (index) => {
    const newFields = [...formData.fields];
    newFields.splice(index, 1);
    setFormData({ ...formData, fields: newFields });
  };
  
  const handleFieldChange = (index, key, value) => {
    const newFields = [...formData.fields];
    newFields[index][key] = key === 'required' ? value === 'true' : value;
    setFormData({ ...formData, fields: newFields });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate model name
      if (!formData.name || !formData.displayName) {
        throw new Error('Model name and display name are required.');
      }
      
      // Validate fields
      if (formData.fields.length === 0) {
        throw new Error('At least one field is required.');
      }
      
      const invalidFields = formData.fields.filter(field => !field.name || !field.type);
      if (invalidFields.length > 0) {
        throw new Error('All fields must have a name and type.');
      }
      
      const duplicateNames = formData.fields
        .map(f => f.name.toLowerCase())
        .filter((name, index, self) => self.indexOf(name) !== index);
        
      if (duplicateNames.length > 0) {
        throw new Error(`Duplicate field name(s): ${duplicateNames.join(', ')}`);
      }
      
      await onSubmit(formData);
      navigate('/admin/models');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Model Name
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            (Will be used in API URLs. Starts with uppercase, only letters and numbers allowed)
          </p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isEditMode} // Can't change model name after creation
            placeholder="e.g. Customer"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Name
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            (User-friendly name that will be shown in the UI)
          </p>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            placeholder="e.g. Customer"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200 mb-4">
          Fields
        </h3>
        
        {formData.fields.map((field, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Field Name
                </label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  placeholder="e.g. firstName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={field.type}
                  onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Required
                </label>
                <select
                  value={field.required.toString()}
                  onChange={(e) => handleFieldChange(index, 'required', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                disabled={formData.fields.length <= 1}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50"
              >
                Remove Field
              </button>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleAddField}
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
        >
          Add Field
        </button>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/admin/models')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Model' : 'Create Model'}
        </button>
      </div>
    </form>
  );
}
