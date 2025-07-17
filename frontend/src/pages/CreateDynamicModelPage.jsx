import { useNavigate } from 'react-router-dom';
import { useDynamicModels } from '../hooks/useDynamicModel';
import DynamicModelForm from '../components/DynamicModelForm';

export default function CreateDynamicModelPage() {
  const navigate = useNavigate();
  const { createModel, error } = useDynamicModels();
  
  const handleSubmit = async (modelData) => {
    try {
      await createModel(modelData);
      navigate('/admin/models');
    } catch (err) {
      console.error('Error creating model:', err);
      throw err;
    }
  };
  
  return (
    <div className="p-6 space-y-6 min-h-full bg-white dark:bg-gray-800 dark:text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold dark:text-white">Create New Model</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Define a new model with custom fields that will be available in the system.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <DynamicModelForm onSubmit={handleSubmit} />
    </div>
  );
}
