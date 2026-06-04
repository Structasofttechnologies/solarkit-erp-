'use client';

import React from 'react';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authStore from '../../store/authStore';

export default function DealerHeader() {
    const navigate = useNavigate();
    const { user, logout } = authStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">Dealer Dashboard</h2>
            </div>

            <div className="flex items-center space-x-6">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Bell size={20} className="text-gray-600" />
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Settings size={20} className="text-gray-600" />
                </button>

                <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-emerald-600" />
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-gray-800">{user?.name || 'Dealer'}</p>
                        <p className="text-gray-500 text-xs uppercase">{user?.role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Logout"
                    >
                        <LogOut size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>
        </header>
    );
}
