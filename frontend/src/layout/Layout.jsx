import { Routers } from "../routes/Routers";
import useTheme from "../hooks/useTheme";
import useLastVisit from "../hooks/useLastVisit";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const lastVisit = useLastVisit();
    const { currentUser, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    
    const formattedLastVisit = lastVisit
    ? lastVisit.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";
    return (
        <div className="flex flex-col h-screen">
        <header className="bg-blue-600 text-white h-16 flex items-center px-6 justify-between">
            <h1 className="text-xl py-3">My CMS</h1>
            <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <Link to="/login" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                            Login
                        </Link>
                        <Link to="/register" className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                            Register
                        </Link>
                    </div>
                )}
                <button
                    onClick={toggleTheme}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-950"
                >
                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
            </div>
        </header>

        <div className="flex flex-1">
            {isAuthenticated && (
                <aside className="bg-gray-800 text-gray-200 p-4 ">
                <nav className="space-y-2">
                    <Link to="/" className="block px-3 py-2 rounded hover:bg-gray-700">Home</Link>
                    <Link to="/products" className="block px-3 py-2 rounded hover:bg-gray-700">Products</Link>
                </nav>
                </aside>
            )}
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 transition-all">
            <main className="min-h-[calc(100vh-7rem)]">
                <Routers/>
            </main>
            </div>
        </div>
        <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 h-12 flex items-center justify-center">
            <span>Lần truy cập trước:{" "}</span>
            <strong className="ml-1">{formattedLastVisit}</strong>
        </footer>
        </div>
    );
}
