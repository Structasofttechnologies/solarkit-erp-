import React from 'react';
import { Outlet } from 'react-router-dom';
import DealerManagerSidebar from '../components/DealerManagerSidebar';
import DealerManagerHeader from '../components/DealerManagerHeader';

export default function DealerManagerLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            <DealerManagerSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DealerManagerHeader />
                <main className="flex-1 overflow-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
