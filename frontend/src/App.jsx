import { Layout } from './layout/Layout';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from 'react';

function App() {
  // Debug navigation events
  useEffect(() => {
    const handleNavigationEvent = () => {
      console.log('Navigation event detected', window.location.pathname, new Date().toISOString());
    };
    
    window.addEventListener('popstate', handleNavigationEvent);
    return () => window.removeEventListener('popstate', handleNavigationEvent);
  }, []);
  
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#1f2937';
    }
  }, []);
  
  return (
    <div className="h-full">
      <AuthProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AuthProvider>
    </div>
  )
}

export default App
