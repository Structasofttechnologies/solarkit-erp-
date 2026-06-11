import React from 'react';
import { Outlet } from 'react-router-dom';
import DealerSidebar from '../components/DealerSidebar';
import DealerHeader from '../components/DealerHeader';

export default function DealerLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            <DealerSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DealerHeader />
                <main className="flex-1 overflow-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
