import { Routers } from "../routes/Routers";
import useTheme from "../hooks/useTheme";
import useLastVisit from "../hooks/useLastVisit";
export const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const lastVisit = useLastVisit();
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
        <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 h-12 flex items-center justify-center">
            <span>Lần truy cập trước:{" "}</span>
            <strong className="ml-1">{formattedLastVisit}</strong>
        </footer>
        </div>
    );
}
