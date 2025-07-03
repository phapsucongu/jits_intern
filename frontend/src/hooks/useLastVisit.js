import { useState, useEffect } from 'react';

export default function useLastVisit() {
  const [lastVisit, setLastVisit] = useState(() => {
    const saved = localStorage.getItem('lastVisit');
    return saved ? new Date(saved) : null;
  });

  useEffect(() => {
    const now = new Date();
    localStorage.setItem('lastVisit', now.toISOString());
    setLastVisit(now);
  }, []);

  return lastVisit;
}
