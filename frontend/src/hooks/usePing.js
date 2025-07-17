import { useState, useEffect } from 'react';
import api from '../instance/api';

// This is a simplified version of the ping hook that doesn't rely on the backend ping endpoint
export default function usePing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // We'll just check if the server responds at all, without a specific ping endpoint
        await api.get('/');
        setData({ status: 'success', message: 'Server is online' });
      } catch (err) {
        console.error("Server connection error:", err);
        setData({ status: 'error', message: "Can't connect to the server" });
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkServerStatus();
  }, []);

  return { data, loading, error };
}
