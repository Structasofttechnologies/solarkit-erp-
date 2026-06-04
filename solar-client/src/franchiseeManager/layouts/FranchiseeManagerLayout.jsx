import React from 'react';
import { Outlet } from 'react-router-dom';
import FranchiseeManagerSidebar from '../components/FranchiseeManagerSidebar';
import FranchiseeManagerHeader from '../components/FranchiseeManagerHeader';

export default function FranchiseeManagerLayout() {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <FranchiseeManagerSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <FranchiseeManagerHeader />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
