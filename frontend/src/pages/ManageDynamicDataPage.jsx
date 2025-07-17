import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDynamicData } from '../hooks/useDynamicModel';
import DynamicDataForm from '../components/DynamicDataForm';
import api from '../instance/api';

export default function ManageDynamicDataPage() {
  const { modelName, id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Capitalize model name for display
  const displayModelName = modelName ? 
    modelName.charAt(0).toUpperCase() + modelName.slice(1) : 
    '';
  
  const { modelInfo, createRecord, updateRecord } = useDynamicData(displayModelName);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [recordData, setRecordData] = useState(null);
  
  // If editing, fetch the current record
  useEffect(() => {
    if (isEditMode && id) {
      const fetchRecord = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await api.get(`/api/auth/dynamic-data/${displayModelName}/${id}`);
          setRecordData(res.data.record.data);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRecord();
    }
  }, [isEditMode, id, displayModelName]);
  
  const handleSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateRecord(id, data);
      } else {
        await createRecord(data);
      }
      navigate(`/${modelName}`);
    } catch (err) {
      setError(err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-full dark:bg-gray-800 dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 dark:bg-gray-800 min-h-full">
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 min-h-full bg-white dark:bg-gray-800 dark:text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold dark:text-white">
          {isEditMode ? 'Edit' : 'Add'} {modelInfo?.displayName || displayModelName}
        </h1>
      </div>
      
      <DynamicDataForm
        modelInfo={modelInfo}
        initialData={recordData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
