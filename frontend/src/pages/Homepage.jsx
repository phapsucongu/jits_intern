import usePing from '../hooks/usePing';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const { data, loading, error } = usePing();
    const { isAuthenticated } = useAuth();
    
    if (loading) return <div className="flex justify-center items-center h-48">Loading...</div>;
    
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Welcome to My CMS
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    A simple content management system for product management.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-300">
                        {error 
                            ? "Server status: Error connecting to server" 
                            : `Server status: ${data?.message || "Online"}`
                        }
                    </p>
                </div>
            </div>

            {!isAuthenticated ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                        Get Started
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Please log in or register to manage your products.
                    </p>
                    <div className="flex space-x-4">
                        <Link 
                            to="/login"
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Login
                        </Link>
                        <Link 
                            to="/register"
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                        Manage Products
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        You're logged in! Go to the products page to start managing your products.
                    </p>
                    <Link 
                        to="/products"
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        View Products
                    </Link>
                </div>
            )}
        </div>
    );
}