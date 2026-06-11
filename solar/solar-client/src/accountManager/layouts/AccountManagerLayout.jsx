import React from 'react';
import { Outlet } from 'react-router-dom';
import AccountManagerSidebar from '../components/AccountManagerSidebar';
import AccountManagerHeader from '../components/AccountManagerHeader';
import { useEffect } from 'react';
import { useMasterStore } from '../../store/masterStore';

export default function AccountManagerLayout() {
  const fetchMasters = useMasterStore((state) => state.fetchMasters);

  useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);
  return (
    <div className="flex h-screen bg-gray-100">
      <AccountManagerSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AccountManagerHeader />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
