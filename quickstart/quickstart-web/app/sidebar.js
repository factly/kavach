'use-client'
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData } from './redux/actions';



const Sidebar = () => {
  const dispatch = useDispatch();
  const { titles, loading, error } = useSelector((state) => state.data);

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  const handleDelete = (id) => {
    
    dispatch(deleteOrganization(id));
    
  };

  return (
    <div className="sidebar bg-gray-100 p-4 shadow-lg fixed top-40 left-0 h-full w-1/6 z-50"> 
      <div className="sidebar-header mb-4">
        
      </div>
      <div className="sidebar-content">
        <p className="text-xl mb-16 ml-4 text-red-500">Welcome to Kavach</p>
        <ul>
          <li className="text-2xl flex ml-4 items-center mb-2 text-blue-500">
            Overview</li>
          
          
        </ul>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <ul>
            {titles.map((title) => (
              <li > <p key={title.id} className="text-2xl flex ml-4 items-center mb-2 text-blue-500">
                {title.title} </p>
                <button
                  className="text-red-500 bg-transparent border border-solid border-red-500 hover:bg-red-500 hover:text-white active:bg-red-600 font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => handleDelete(title.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
