import { Routers } from "../routes/Routers";
import useTheme from "../hooks/useTheme";
import React from "react";
export const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="flex flex-col h-screen">
        <header className="bg-blue-600 text-white h-16 flex items-center px-6 justify-between">
            <h1 className="text-xl">My CMS</h1>
            <button
            onClick={toggleTheme}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-950"
            >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
        </header>

        <div className="flex flex-1">

            <aside className="bg-gray-800 text-gray-200 p-4 ">
            <nav className="space-y-2">
                <a href="/" className="block px-3 py-2 rounded hover:bg-gray-700">Home</a>
                <a href="/products" className="block px-3 py-2 rounded hover:bg-gray-700">Product</a>
            </nav>
            </aside>
            <div className="flex-1 bg-amber-50 p-6 ">
            <main>
                <Routers/>
            </main>
            </div>
        </div>
        </div>
    );
}
