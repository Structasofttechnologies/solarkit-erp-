import React, { useEffect, useState } from 'react';
import { orderAPI, deliveryAPI, installationAPI, productAPI } from '../../../api/api';

function Card({ title, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="text-sm font-semibold text-gray-600">{title}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-gray-500">{sub}</div> : null}
    </div>
  );
}

export default function Operations() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, deliveriesRes, installationsRes, productsRes] = await Promise.all([
        orderAPI.getAll({ limit: 5 }),
        deliveryAPI.getAll({ limit: 5 }),
        installationAPI.getAll({ limit: 5 }),
        productAPI.getAll({ limit: 5 }),
      ]);

      setStats({
        ordersCount: ordersRes.data?.orders?.length ?? 0,
        deliveriesCount: deliveriesRes.data?.deliveries?.length ?? 0,
        installationsCount: installationsRes.data?.installations?.length ?? 0,
        productsCount: productsRes.data?.products?.length ?? 0,
      });
    } catch (e) {
      setError(e?.message || 'Failed to load operations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Operations</h1>
          <p className="text-sm text-gray-500 mt-1">Orders, deliveries, installations, inventory (demo).</p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card title="Recent Orders (preview)" value={stats ? stats.ordersCount : '—'} sub="Showing limited sample" />
        <Card title="Recent Deliveries (preview)" value={stats ? stats.deliveriesCount : '—'} sub="Showing limited sample" />
        <Card
          title="Recent Installations (preview)"
          value={stats ? stats.installationsCount : '—'}
          sub="Showing limited sample"
        />
        <Card title="Products (preview)" value={stats ? stats.productsCount : '—'} sub="Showing limited sample" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-base font-bold text-gray-900">Next</div>
        <div className="mt-2 text-sm text-gray-600">
          We’ll split Operations into separate pages (Orders / Delivery / Installations / Inventory) and connect filters + tables like the admin screenshots.
        </div>
      </div>
    </div>
  );
}

