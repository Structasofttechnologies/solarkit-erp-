import React from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authStore from '../../store/authStore.js';

export default function FranchiseeManagerHeader() {
    const navigate = useNavigate();
    const user = authStore((state) => state.user);
    const setToken = authStore((state) => state.setToken);
    const setUser = authStore((state) => state.setUser);

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 z-10">
            <h1 className="text-xl font-bold text-slate-800">Franchisee Manager Dashboard</h1>

            <div className="flex items-center space-x-6">
                <button className="text-gray-500 hover:text-blue-600 transition relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="text-gray-500 hover:text-blue-600 transition">
                    <Settings size={20} />
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-indigo-700">
                                {user?.name?.charAt(0) || 'FM'}
                            </span>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-slate-800">{user?.name || 'Franchisee Manager'}</p>
                        <p className="text-xs text-slate-500">{user?.role?.toUpperCase() || 'FRANCHISEE MANAGER'}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
