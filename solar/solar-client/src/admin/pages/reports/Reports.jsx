import React from 'react';

const reports = [
  { name: 'Sales Report', desc: 'Revenue, orders, dealer performance' },
  { name: 'Inventory Report', desc: 'Stock, valuation, low stock, turnover' },
  { name: 'Delivery Report', desc: 'On-time, cost/km, partner performance' },
  { name: 'Installation Report', desc: 'Completion, SLA, installer ratings' },
  { name: 'Approvals Report', desc: 'Pending/approved/rejected trends' },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Report</h1>
        <p className="text-sm text-gray-500 mt-1">Downloadable and filterable reports (demo).</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="text-base font-bold text-gray-900">Available Reports</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r.name} className="border border-gray-200 rounded-md p-4">
              <div className="font-semibold text-gray-900">{r.name}</div>
              <div className="mt-1 text-sm text-gray-600">{r.desc}</div>
              <button className="mt-3 px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-black">
                Export (coming soon)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

