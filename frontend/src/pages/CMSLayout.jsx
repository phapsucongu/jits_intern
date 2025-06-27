import React from 'react';

export const CMSLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white h-16 flex items-center px-6">
        <h1 className="text-xl">My CMS</h1>
      </header>

      <div className="flex flex-1">

        <aside className="bg-gray-800 text-gray-200 p-4 ">
          <nav className="space-y-2">
            <a href="/" className="block px-3 py-2 rounded hover:bg-gray-700">Home</a>
            <a href="/product" className="block px-3 py-2 rounded hover:bg-gray-700">Product</a>
          </nav>
        </aside>
        <div className="flex-1 bg-amber-50 p-6 ">
          {children}
        </div>
      </div>
    </div>
  );
}
