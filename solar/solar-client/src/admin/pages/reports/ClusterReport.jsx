import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../../api/api';

export default function ClusterReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getAll({});
      const orders = res.data?.orders || res.data || [];

      const byCluster = orders.reduce((acc, o) => {
        const cluster = o.customer?.cluster || 'Unknown';
        if (!acc[cluster]) {
          acc[cluster] = { cluster, orders: 0, revenue: 0 };
        }
        acc[cluster].orders += 1;
        acc[cluster].revenue += o.totalAmount || 0;
        return acc;
      }, {});

      setRows(Object.values(byCluster));
    } catch (e) {
      setError(e?.message || 'Failed to load cluster report');
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
          <h1 className="text-2xl font-extrabold text-gray-900">Cluster Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            State-wise cluster summary based on order revenue.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-base font-bold text-gray-900 mb-4">Cluster-wise Summary</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="text-left py-2 px-3 font-semibold">Cluster</th>
                <th className="text-right py-2 px-3 font-semibold">Total Orders</th>
                <th className="text-right py-2 px-3 font-semibold">Total Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cluster} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-800">{r.cluster}</td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {r.orders.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {r.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && !rows.length ? (
                <tr>
                  <td className="py-8 px-3 text-center text-gray-500" colSpan={3}>
                    No orders yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

