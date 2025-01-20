import React from "react";

interface SidebarProps {
  // Add props here if needed
}

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <div className="fixed right-0 top-0 h-screen w-64 bg-gray-800 text-white p-4 z-10">
      <h1 className="text-2xl font-bold mb-6">Menu</h1>

      <nav>
        <ul className="space-y-2">
          <li>
            <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
              Settings
            </a>
          </li>
          <li>
            <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
              Profile
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};
