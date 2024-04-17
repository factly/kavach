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
          <Link href="http://127.0.0.1:4455/.ory/kratos/public/self-service/login/browser?return_to=http://localhost:3000" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Login
          </Link>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;