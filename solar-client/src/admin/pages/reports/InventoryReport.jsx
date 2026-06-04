import React, { useEffect, useState } from 'react';
import { productAPI } from '../../../api/api';

export default function InventoryReport() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productAPI.getAll({});
      setProducts(res.data?.products || res.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load inventory report');
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
          <h1 className="text-2xl font-extrabold text-gray-900">Inventory Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Summary of stock and valuation for all products.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-600">Total SKUs</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-600">Total Stock</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {products.reduce((acc, p) => acc + (p.stock || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-600">Total Valuation (₹)</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {products
              .reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0)
              .toLocaleString()}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-base font-bold text-gray-900 mb-4">Inventory Details</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="text-left py-2 px-3 font-semibold">SKU</th>
                <th className="text-left py-2 px-3 font-semibold">Name</th>
                <th className="text-left py-2 px-3 font-semibold">Category</th>
                <th className="text-right py-2 px-3 font-semibold">Stock</th>
                <th className="text-right py-2 px-3 font-semibold">Price (₹)</th>
                <th className="text-right py-2 px-3 font-semibold">Valuation (₹)</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const valuation = (p.stock || 0) * (p.price || 0);
                return (
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-900">{p.sku}</td>
                    <td className="py-2 px-3 text-gray-700">{p.name}</td>
                    <td className="py-2 px-3 text-gray-700">{p.category}</td>
                    <td className="py-2 px-3 text-right text-gray-900">{p.stock}</td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {(p.price || 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {valuation.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {!loading && !products.length ? (
                <tr>
                  <td className="py-8 px-3 text-center text-gray-500" colSpan={6}>
                    No products found.
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

