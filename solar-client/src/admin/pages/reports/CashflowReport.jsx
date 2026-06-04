import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../../api/api';

export default function CashflowReport() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getAll({});
      setOrders(res.data?.orders || res.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load cashflow report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const received = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pending = orders
    .filter((o) => o.paymentStatus !== 'paid')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Cashflow Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track money received vs pending based on payment status.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-600">Received (paid)</div>
          <div className="mt-2 text-3xl font-bold text-emerald-700">
            ₹{received.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-600">Pending</div>
          <div className="mt-2 text-3xl font-bold text-amber-700">
            ₹{pending.toLocaleString()}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-base font-bold text-gray-900 mb-4">Order Payments</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="text-left py-2 px-3 font-semibold">Order</th>
                <th className="text-left py-2 px-3 font-semibold">Customer</th>
                <th className="text-right py-2 px-3 font-semibold">Amount (₹)</th>
                <th className="text-left py-2 px-3 font-semibold">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900">
                    {o.orderNumber || `#${o._id?.slice(-6)}`}
                  </td>
                  <td className="py-2 px-3 text-gray-700">{o.customer?.name || '—'}</td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {(o.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-gray-700 capitalize">
                    {o.paymentStatus || 'pending'}
                  </td>
                </tr>
              ))}
              {!loading && !orders.length ? (
                <tr>
                  <td className="py-8 px-3 text-center text-gray-500" colSpan={4}>
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

