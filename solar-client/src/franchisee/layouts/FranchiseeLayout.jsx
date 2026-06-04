import React from 'react';
import { Outlet } from 'react-router-dom';
import FranchiseeSidebar from '../components/FranchiseeSidebar';
import FranchiseeHeader from '../components/FranchiseeHeader';

export default function FranchiseeLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            <FranchiseeSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <FranchiseeHeader />
                <main className="flex-1 overflow-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
