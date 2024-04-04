import React from 'react';


const Sidebar = () => {
  return (
    <div className="sidebar bg-gray-100 p-4 shadow-lg fixed top-40 left-0 h-full w-1/6 z-50"> {/* Fixed positioning, 1/4 screen width */}
      <div className="sidebar-header mb-4">
        
      </div>
      <div className="sidebar-content">
        <p className="text-xl mb-16 ml-4 text-red-500">Welcome to Kavach</p>
        <ul>
          <li className="text-2xl flex ml-4 items-center mb-2 text-blue-500">
            Overview</li>
          
          
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
