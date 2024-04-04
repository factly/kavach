import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </div>

        
        <div className="flex-grow text-center">
          <a href="https://kavach.factlylabs.com/docs/intro" className="text-red-500 text-xl hover:text-red-800 px-8 py-2">Docs</a>
          <a href="https://github.com/factly/kavach" className="text-red-500 text-xl hover:text-red-800 px-8 py-2">GitHub</a>
        </div>

        
        <div className="flex-shrink-0">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Login
          </button>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;