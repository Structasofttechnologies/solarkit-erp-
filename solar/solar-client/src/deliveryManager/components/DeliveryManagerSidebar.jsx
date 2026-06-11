import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, FileText, ClipboardList, ChevronDown, ChevronUp, Server, Truck, RefreshCw, Minus, CheckSquare } from 'lucide-react';

import authStore from '../../store/authStore';
import DynamicMenuRenderer from '../../components/Sidebar/DynamicMenuRenderer';

export default function DeliveryManagerSidebar() {
  const { user } = authStore();
  const [isMyTaskOpen, setIsMyTaskOpen] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState({
    'Replacement Order': true
  });
  
  const location = useLocation();
  const isMyTaskActive = location.pathname.includes('/delivery-manager/my-task');

  const toggleSubMenu = (label, e) => {
    e.preventDefault();
    setOpenSubMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const topMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/delivery-manager/dashboard' },
  ];

  const bottomMenuItems = [
    { icon: Truck, label: 'Delivery Management', path: '/delivery-manager/delivery-management' },
    { 
      icon: RefreshCw, 
      label: 'Replacement Order', 
      path: '/delivery-manager/replacement-order',
      hasDropdown: true,
      subItems: [
        { icon: Minus, label: 'Return Products', path: '/delivery-manager/replacement-order/return-products' },
        { icon: Minus, label: 'Replace Products', path: '/delivery-manager/replacement-order/replace-products' },
        { icon: Minus, label: 'Service Ticket', path: '/delivery-manager/replacement-order/service-ticket' }
      ]
    },
    { icon: ClipboardList, label: 'Report', path: '/delivery-manager/report' },
  ];

  const myTaskItems = [
    { icon: Minus, label: 'InWard', path: '/delivery-manager/my-task/inward-management' },
    { icon: Minus, label: 'At Warehouse', path: '/delivery-manager/my-task/at-warehouse' },
  ];

  const existingRoutes = [
    ...topMenuItems.map(i => i.path),
    ...bottomMenuItems.map(i => i.path),
    ...bottomMenuItems.flatMap(i => i.subItems?.map(s => s.path) || []),
    ...myTaskItems.map(i => i.path)
  ].filter(Boolean);

  const renderNavLink = (item) => {
    if (item.hasDropdown) {
        const isAnySubItemActive = item.subItems?.some(subItem => location.pathname.includes(subItem.path));
        const isOpen = openSubMenus[item.label] || isAnySubItemActive;

        return (
            <div key={item.path} className="mt-1">
              <button
                onClick={(e) => toggleSubMenu(item.label, e)}
                className={`w-[calc(100%-1rem)] mx-2 flex items-center justify-between px-4 py-4 transition-all duration-200 rounded ${
                  isOpen
                    ? 'bg-[#142340] text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <item.icon size={22} className={isOpen ? 'text-white' : 'text-gray-600'} />
                  <span className="font-semibold text-[15px]">{item.label}</span>
                </div>
                {isOpen ? <ChevronUp size={20} className={isOpen ? 'text-white' : 'text-gray-600'} /> : <ChevronDown size={20} className={isOpen ? 'text-white' : 'text-gray-600'} />}
              </button>
              
              {isOpen && item.subItems && (
                <div className="bg-[#e9eef5] py-2 flex flex-col space-y-1 mt-1">
                  {item.subItems.map((subItem) => (
                    <div key={subItem.path}>
                      <NavLink
                        to={subItem.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-8 py-3 transition-colors ${
                            isActive
                              ? 'bg-[#142340] text-white font-semibold mx-2 rounded' 
                              : 'text-gray-600 hover:bg-[#dce4ee]'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <subItem.icon size={18} className={location.pathname === subItem.path ? 'text-white' : 'text-[#142340]'} />
                          <span className={`text-[14.5px] ${location.pathname === subItem.path ? 'text-white' : 'text-[#142340]'}`}>{subItem.label}</span>
                        </div>
                      </NavLink>
                    </div>
                  ))}
                </div>
              )}
            </div>
        )
    }

    return (
        <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
            `flex items-center space-x-3 px-6 py-4 transition-all duration-200 rounded mx-2 ${
            isActive
                ? 'bg-[#142340] text-white font-semibold'
                : 'text-gray-700 hover:bg-gray-200'
            }`
        }
        >
        <item.icon size={22} className={location.pathname === item.path ? 'text-white' : 'text-gray-600'} />
        <span className="font-semibold text-[15px]">{item.label}</span>
        </NavLink>
    );
  };

  return (
    <div className="w-64 bg-[#f1f4f9] shadow-lg h-full flex flex-col transition-all duration-300 border-r border-gray-200">
      <div className="p-6 bg-white border-b border-gray-100">
        <h2 className="text-2xl font-bold text-blue-600">
          SOLARKITS
        </h2>
        <p className="text-[10px] text-gray-500 tracking-wider">A SOLAR MARKETPLACE</p>
      </div>
      <nav className="flex-1 overflow-y-auto mt-4 space-y-1 pb-4">
        <div className="space-y-1">
          {topMenuItems.map(renderNavLink)}
        </div>

        {/* My Task Dropdown */}
        <div className="mt-1">
          <button
            onClick={() => setIsMyTaskOpen(!isMyTaskOpen)}
            className={`w-[calc(100%-1rem)] mx-2 flex items-center justify-between px-4 py-4 transition-all duration-200 rounded ${
              isMyTaskOpen || isMyTaskActive
                ? 'bg-[#142340] text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-4">
              <CheckSquare size={22} className={isMyTaskOpen || isMyTaskActive ? 'text-white' : 'text-gray-600'} />
              <span className="font-semibold text-[15px]">My Task</span>
            </div>
            {isMyTaskOpen ? <ChevronUp size={20} className={isMyTaskOpen || isMyTaskActive ? 'text-white' : 'text-gray-600'} /> : <ChevronDown size={20} className={isMyTaskOpen || isMyTaskActive ? 'text-white' : 'text-gray-600'} />}
          </button>
          
          {isMyTaskOpen && (
            <div className="bg-[#e9eef5] py-2 flex flex-col space-y-1 mt-1">
              {myTaskItems.map((subItem) => (
                <div key={subItem.path}>
                  <NavLink
                    to={subItem.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-8 py-3 transition-colors ${
                        isActive
                          ? 'text-[#142340] font-semibold' 
                          : 'text-gray-600 hover:bg-[#dce4ee]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <subItem.icon size={18} className={location.pathname === subItem.path ? 'text-blue-600' : 'text-[#142340]'} />
                      <span className={`text-[14.5px] ${location.pathname === subItem.path ? 'text-blue-600' : 'text-[#142340]'}`}>{subItem.label}</span>
                    </div>
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1 mt-1">
          {bottomMenuItems.map(renderNavLink)}
        </div>

        <DynamicMenuRenderer existingRoutes={existingRoutes} />
      </nav>
    </div>
  );
}
