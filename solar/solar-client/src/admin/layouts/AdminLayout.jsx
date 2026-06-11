import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

import { useEffect } from 'react';
import { useMasterStore } from '../../store/masterStore';

export default function AdminLayout() {
  const fetchMasters = useMasterStore((state) => state.fetchMasters);

  useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
