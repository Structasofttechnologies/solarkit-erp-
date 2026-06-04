import React from 'react';
import { Outlet } from 'react-router-dom';
import DeliveryManagerSidebar from '../components/DeliveryManagerSidebar';
import DeliveryManagerHeader from '../components/DeliveryManagerHeader';
import { useEffect } from 'react';
import { useMasterStore } from '../../store/masterStore';

export default function DeliveryManagerLayout() {
  const fetchMasters = useMasterStore((state) => state.fetchMasters);

  useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);
  return (
    <div className="flex h-screen bg-gray-100">
      <DeliveryManagerSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DeliveryManagerHeader />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
