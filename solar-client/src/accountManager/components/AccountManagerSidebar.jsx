import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, FileText, ClipboardList, ChevronDown, ChevronUp, Server, Truck, RefreshCw, Minus } from 'lucide-react';

import authStore from '../../store/authStore';
import DynamicMenuRenderer from '../../components/Sidebar/DynamicMenuRenderer';

export default function AccountManagerSidebar() {
  const { user } = authStore();
  const [isMyTaskOpen, setIsMyTaskOpen] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState({
    'Order Journey': false,
    'Replacement Order': false
  });
  
  const location = useLocation();

  const isMyTaskActive = location.pathname.includes('/account-manager/my-task');

  const toggleSubMenu = (label, e) => {
    e.preventDefault();
    setOpenSubMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const topMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/account-manager/dashboard' },
  ];

  const bottomMenuItems = [
    { icon: Settings, label: 'Solar Panel Bundle Plan', path: '/account-manager/solar-panel-bundle-plan' },
    { icon: FileText, label: 'Procurement Plan', path: '/account-manager/procurement-plan' },
    { icon: ClipboardList, label: 'Report', path: '/account-manager/report' },
  ];

  const myTaskItems = [
    { 
      icon: Truck, 
      label: 'Order Journey', 
      path: '/account-manager/my-task/order-journey', 
      hasDropdown: true,
      subItems: [
        { label: 'Create Order', path: '/account-manager/my-task/order-journey/create-order' },
        { label: 'Loan Orders', path: '/account-manager/my-task/order-journey/loan-orders' },
        { label: 'Delivery Plan', path: '/account-manager/my-task/order-journey/delivery-plan' },
        { label: 'Vendor Pay', path: '/account-manager/my-task/order-journey/vendor-pay' },
        { label: 'Channel Partner Pay', path: '/account-manager/my-task/order-journey/channel-partner-pay' },
        { label: 'Driver Pay', path: '/account-manager/my-task/order-journey/driver-pay' },
        { label: 'At Warehouse', path: '/account-manager/my-task/order-journey/at-warehouse' },
        { label: 'Delivery Management', path: '/account-manager/my-task/order-journey/delivery-management' },
      ]
    },
    { 
      icon: RefreshCw, 
      label: 'Replacement Order', 
      path: '/account-manager/my-task/replacement-order', 
      hasDropdown: true,
      subItems: [
        { label: 'Return Products', path: '/account-manager/my-task/replacement-order/return-products' },
        { label: 'Replace Products', path: '/account-manager/my-task/replacement-order/replace-products' }
      ]
    },
    { icon: Minus, label: 'Warehouse Vendor Pay', path: '/account-manager/my-task/warehouse-vendor-pay' },
    { icon: Minus, label: 'Vendor Contract Pay', path: '/account-manager/my-task/vendor-contract-pay' },
    { icon: Minus, label: 'Track CP Payments', path: '/account-manager/my-task/track-cp-payments' },
    { icon: Minus, label: 'Service', path: '/account-manager/my-task/service' },
  ];

  const existingRoutes = [
    ...topMenuItems.map(i => i.path),
    ...bottomMenuItems.map(i => i.path),
    ...myTaskItems.flatMap(i => [
      i.path,
      ...(i.subItems?.map(s => s.path) || []),
      ...(i.subItems?.flatMap(s => s.subItems?.map(ss => ss.path) || []) || [])
    ])
  ].filter(Boolean);

  const renderNavLink = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
        }`
      }
    >
      <item.icon size={20} />
      <span className="font-medium">{item.label}</span>
    </NavLink>
  );

  return (
    <div className="w-64 bg-[#f1f4f9] shadow-lg h-full flex flex-col transition-all duration-300 border-r border-gray-200">
      <div className="p-6 bg-white border-b border-gray-100">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          SOLARKITS
        </h2>
        <p className="text-[10px] text-gray-500 tracking-wider">A SOLAR MARKETPLACE</p>
      </div>
      <nav className="flex-1 overflow-y-auto mt-4 space-y-1 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="px-4 space-y-1">
          {topMenuItems.map(renderNavLink)}
        </div>

        {/* My Task Dropdown */}
        <div className="mt-1">
          <button
            onClick={() => setIsMyTaskOpen(!isMyTaskOpen)}
            className={`w-full flex items-center justify-between px-6 py-4 transition-all duration-200 ${
              isMyTaskOpen || isMyTaskActive
                ? 'bg-[#142340] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-4">
              <Server size={22} className={isMyTaskOpen || isMyTaskActive ? 'text-white' : 'text-gray-600'} />
              <span className="font-semibold text-[15px]">My Task</span>
            </div>
            {isMyTaskOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {isMyTaskOpen && (
            <div className="bg-[#e9eef5] py-2 flex flex-col space-y-1 shadow-inner">
              {myTaskItems.map((subItem) => (
                <div key={subItem.path}>
                  <NavLink
                    to={subItem.hasDropdown ? '#' : subItem.path}
                    onClick={subItem.hasDropdown ? (e) => toggleSubMenu(subItem.label, e) : undefined}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-8 py-3 transition-colors ${
                        (isActive && !subItem.hasDropdown) || openSubMenus[subItem.label]
                          ? 'bg-[#142340] text-white font-semibold' 
                          : 'text-[#142340] hover:bg-[#dce4ee]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <subItem.icon size={18} className={openSubMenus[subItem.label] ? 'text-white' : 'text-[#142340]'} />
                      <span className="text-[14.5px]">{subItem.label}</span>
                    </div>
                    {subItem.hasDropdown && (
                      openSubMenus[subItem.label] ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-[#142340]" />
                    )}
                  </NavLink>
                  
                  {/* Nested Sub-Menu items */}
                  {subItem.hasDropdown && openSubMenus[subItem.label] && subItem.subItems && (
                    <div className="bg-[#e9eef5] py-1 flex flex-col">
                      {subItem.subItems.map((nested) => (
                        <NavLink
                          key={nested.path}
                          to={nested.path}
                          className={({ isActive }) =>
                            `flex items-center space-x-4 px-8 py-3 mx-4 my-1 rounded-xl transition-colors text-[14.5px] ${
                              isActive ? 'bg-[#142340] text-white font-semibold' : 'text-[#142340] hover:bg-[#dce4ee]'
                            }`
                          }
                        >
                          <Minus size={18} className={location.pathname === nested.path ? 'text-white' : 'text-[#142340]'} />
                          <span>{nested.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 space-y-1 mt-1">
          {bottomMenuItems.map(renderNavLink)}
        </div>

        <DynamicMenuRenderer existingRoutes={existingRoutes} />
      </nav>
    </div>
  );
}
