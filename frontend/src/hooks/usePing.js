import { useState, useEffect } from 'react';
import api from '../instance/api';

export default function usePing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const res = await api.get('/api/ping');
        setData(res.data);
      } catch (err) {
        console.error("Ping error:", err);
        setData({ message: "Server is online but ping endpoint is not available" });
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPing();
  }, []);

  return { data, loading, error };
}
