import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authStore from '../../store/authStore';

export default function AccountManagerHeader() {
  const navigate = useNavigate();
  const user = authStore((state) => state.user);
  const logout = authStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 z-10">
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Account Operations Portal
        </h1>
        <div className="flex items-center space-x-6">
          <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                <User size={20} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'Account Manager'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'account@solarkits.com'}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
