import React from 'react';

const cards = [
  { name: 'Sales', desc: 'Dealers, pricing, targets, commissions' },
  { name: 'Operations', desc: 'Orders, deliveries, installations' },
  { name: 'Inventory', desc: 'Stock, warehouses, purchase planning' },
  { name: 'HR', desc: 'Installers, delivery partners, onboarding' },
  { name: 'Marketing', desc: 'Leads, campaigns, offers (later)' },
];

export default function Departments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Departments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Admin quick access to department modules (we’ll expand these later).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((c) => (
          <div key={c.name} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="text-lg font-bold text-gray-900">{c.name}</div>
            <div className="mt-1 text-sm text-gray-600">{c.desc}</div>
            <div className="mt-4 text-xs text-gray-500">
              Demo view only. We’ll attach real flows and permissions later.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

