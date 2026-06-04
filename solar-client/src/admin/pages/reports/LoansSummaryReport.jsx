import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../../api/api';

export default function LoansSummaryReport() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getAll({});
      const list = res.data?.orders || res.data || [];
      // Assume loanType field or tag on orders; fallback to "Non-loan"
      setOrders(list);
    } catch (e) {
      setError(e?.message || 'Failed to load loans report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byLoanType = orders.reduce((acc, o) => {
    const loanType = o.loanType || 'Non-loan';
    if (!acc[loanType]) {
      acc[loanType] = { count: 0, amount: 0 };
    }
    acc[loanType].count += 1;
    acc[loanType].amount += o.totalAmount || 0;
    return acc;
  }, {});

  const types = Object.keys(byLoanType);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Loans Summary Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aggregated view of orders by loan type for finance reporting.
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
        <div className="text-base font-bold text-gray-900 mb-4">Summary by Loan Type</div>
        {!types.length ? (
          <div className="text-sm text-gray-500">No orders found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {types.map((type) => (
              <div key={type} className="border border-gray-200 rounded-md p-4">
                <div className="text-sm font-semibold text-gray-700">{type}</div>
                <div className="mt-2 text-xs text-gray-500">Orders</div>
                <div className="text-xl font-bold text-gray-900">
                  {byLoanType[type].count.toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-gray-500">Amount (₹)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {byLoanType[type].amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-base font-bold text-gray-900 mb-4">Order List</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="text-left py-2 px-3 font-semibold">Order</th>
                <th className="text-left py-2 px-3 font-semibold">Customer</th>
                <th className="text-left py-2 px-3 font-semibold">Loan Type</th>
                <th className="text-right py-2 px-3 font-semibold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900">
                    {o.orderNumber || `#${o._id?.slice(-6)}`}
                  </td>
                  <td className="py-2 px-3 text-gray-700">{o.customer?.name || '—'}</td>
                  <td className="py-2 px-3 text-gray-700">{o.loanType || 'Non-loan'}</td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {(o.totalAmount || 0).toLocaleString()}
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

