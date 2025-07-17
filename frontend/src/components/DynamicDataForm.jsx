import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DynamicDataForm({ modelInfo, initialData = null, onSubmit }) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;
  
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize form data when model info or initial data changes
  useEffect(() => {
    if (modelInfo && modelInfo.fields) {
      // If we have initial data, use it
      if (initialData) {
        setFormData(initialData);
      } else {
        // Otherwise create an empty form with default values
        const newFormData = {};
        modelInfo.fields.forEach(field => {
          // Set default values based on type
          switch (field.type) {
            case 'string':
              newFormData[field.name] = '';
              break;
            case 'number':
              newFormData[field.name] = 0;
              break;
            case 'boolean':
              newFormData[field.name] = false;
              break;
            case 'date':
              newFormData[field.name] = '';
              break;
            default:
              newFormData[field.name] = '';
          }
        });
        setFormData(newFormData);
      }
    }
  }, [modelInfo, initialData]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Get the field definition to determine proper conversion
    const fieldDef = modelInfo?.fields.find(field => field.name === name);
    
    // Handle different input types
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData({ ...formData, [name]: numValue });
    } else if (type === 'date' && fieldDef?.type === 'date') {
      // For date fields, ensure proper ISO string format
      const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
      setFormData({ ...formData, [name]: dateValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Basic validation
      const requiredFields = modelInfo.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => 
        formData[field.name] === undefined || 
        formData[field.name] === null || 
        (field.type !== 'boolean' && formData[field.name] === '') ||
        (field.type === 'number' && isNaN(formData[field.name]))
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.map(f => f.name).join(', ')}`);
      }
      
      await onSubmit(formData);
      navigate(`/${modelInfo.name.toLowerCase()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!modelInfo || !modelInfo.fields) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        Error: Model information is not available.
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {modelInfo.fields.map((field, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2">
              {field.name}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="sm:col-span-2">
              {renderFormField(field, formData, handleInputChange)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate(`/${modelInfo.name.toLowerCase()}`)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

function renderFormField(field, formData, handleInputChange) {
  const { name, type, required } = field;
  const value = formData[name] !== undefined ? formData[name] : '';
  
  switch (type) {
    case 'string':
      return (
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          required={required}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      );
    case 'number':
      // Convert to string for input display, handle empty values
      const displayValue = value === '' || value === null || value === undefined ? '' : String(value);
      
      return (
        <input
          type="number"
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          required={required}
          step="any"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      );
    case 'boolean':
      return (
        <div className="flex items-center h-full">
          <input
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600"
          />
          <label htmlFor={name} className="ml-2 text-gray-700 dark:text-gray-300">
            {value ? 'Yes' : 'No'}
          </label>
        </div>
      );
    case 'date':
      // Format the date value to YYYY-MM-DD for date input
      let formattedDate = '';
      if (value) {
        // Try to convert to YYYY-MM-DD format if value is a date string
        try {
          formattedDate = new Date(value).toISOString().split('T')[0];
        } catch (e) {
          formattedDate = value; // Use as is if conversion fails
        }
      }
      
      return (
        <input
          type="date"
          name={name}
          value={formattedDate}
          onChange={handleInputChange}
          required={required}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      );
    default:
      return (
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          required={required}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      );
  }
}
