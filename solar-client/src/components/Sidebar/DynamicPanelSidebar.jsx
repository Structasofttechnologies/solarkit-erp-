import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import authStore from '../../store/authStore';

const DynamicPanelSidebar = ({ panelTitle = "SOLARKITS", panelSubtitle = "A SOLAR MARKETPLACE" }) => {
  const { user } = authStore();
  const [openSubMenus, setOpenSubMenus] = useState({});
  const location = useLocation();

  const toggleSubMenu = (label, e) => {
    if (e) e.preventDefault();
    setOpenSubMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getDynamicIcon = (iconName) => {
    const IconComponent = Icons[iconName] || Icons.Layers;
    return IconComponent;
  };

  const getPanelBasePath = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'dealer': return '/dealer';
      case 'franchisee': return '/franchisee';
      case 'dealerManager': return '/dealer-manager';
      case 'franchiseeManager': return '/franchisee-manager';
      case 'accountManager': return '/account-manager';
      case 'deliveryManager': return '/delivery-manager';
      default: return '';
    }
  };

  const getDynamicRoute = (route) => {
    if (!route || route === '#') return '#';
    const basePath = getPanelBasePath(user?.role);
    
    // If it's a hardcoded route that matches the old base path, we should replace it
    if (route.startsWith('/admin')) {
      return route.replace(/^\/admin/, basePath);
    }
    if (route.startsWith('/dealer') && !route.startsWith(basePath)) {
        return route.replace(/^\/dealer/, basePath);
    }
    
    return route;
  };

  const renderNavLink = (item, isNested = false) => {
    const IconComponent = getDynamicIcon(item.icon);
    return (
      <NavLink
        key={item._id || item.key || item.name}
        to={getDynamicRoute(item.path || item.route)}
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive && !item.hasDropdown
              ? 'bg-blue-50 text-blue-700 shadow-sm'
              : isNested 
                ? 'text-[#142340] hover:bg-[#dce4ee]' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
          }`
        }
      >
        <IconComponent size={20} />
        <span className="font-medium">{item.name}</span>
      </NavLink>
    );
  };

  const getFallbackMenu = (role) => {
    switch (role) {
      case 'dealer':
        return [
          { name: 'Dashboard', route: '/dealer/dashboard', icon: 'LayoutDashboard' },
          {
            name: 'Project Signup',
            icon: 'FileText',
            hasDropdown: true,
            subItems: [
              { name: 'Lead', route: '/dealer/project-signup/lead', icon: 'UserPlus' },
              { name: 'Survey BOM', route: '/dealer/project-signup/survey-bom', icon: 'ClipboardList' },
              { name: 'Project Quote', route: '/dealer/project-signup/project-quote', icon: 'FileText' },
              { name: 'Project Signup', route: '/dealer/project-signup/project-signup', icon: 'FileCheck' }
            ]
          },
          {
            name: 'Project Management',
            icon: 'Briefcase',
            hasDropdown: true,
            subItems: [
              { name: 'Manage', route: '/dealer/project-management/manage', icon: 'Settings' },
              { name: 'Track', route: '/dealer/project-management/track', icon: 'Activity' }
            ]
          },
          {
            name: 'Track',
            icon: 'MapPin',
            hasDropdown: true,
            subItems: [
              { name: 'Project Progress', route: '/dealer/track/project-progress', icon: 'BarChart3' },
              { name: 'My Commission', route: '/dealer/track/my-commission', icon: 'CreditCard' }
            ]
          },
          {
            name: 'Tickets',
            icon: 'Ticket',
            hasDropdown: true,
            subItems: [
              { name: 'Raise Ticket', route: '/dealer/tickets/raise-ticket', icon: 'PlusCircle' },
              { name: 'Ticket Status', route: '/dealer/tickets/ticket-status', icon: 'Clock' }
            ]
          },
          { name: 'Solar Kit', route: '/dealer/solar-kit', icon: 'Package' },
          { name: 'Loan', route: '/dealer/loan', icon: 'CreditCard' },
          { name: 'Report', route: '/dealer/reports', icon: 'BarChart3' }
        ];
      case 'franchisee':
        return [
          {
            name: 'Dashboard',
            icon: 'Gauge',
            hasDropdown: true,
            subItems: [
              { name: 'Franchise Dashboard', route: '/franchisee/dashboard', icon: 'LayoutDashboard' },
              { name: 'District Manager', route: '/franchisee/district-manager', icon: 'Building2' },
              { name: 'Lead Assign Dashboard', route: '/franchisee/dashboard/lead-assign', icon: 'ClipboardList' }
            ]
          },
          {
            name: 'Project Signup',
            icon: 'Briefcase',
            hasDropdown: true,
            subItems: [
              { name: 'Lead', route: '/franchisee/project-signup/lead', icon: 'User' },
              { name: 'Create Quotation', route: '/franchisee/project-signup/create-quotation', icon: 'FileText' },
              { name: 'Project Signup', route: '/franchisee/project-signup/project-signup', icon: 'ClipboardList' },
              { name: 'Loan', route: '/franchisee/project-signup/loan', icon: 'DollarSign' }
            ]
          },
          {
            name: 'Project Management',
            icon: 'Network',
            hasDropdown: true,
            subItems: [
              { name: 'Management', route: '/franchisee/project-management/management', icon: 'Settings' },
              { name: 'Install', route: '/franchisee/project-management/install', icon: 'Wrench' },
              { name: 'Service', route: '/franchisee/project-management/service', icon: 'Wrench' },
              { name: 'Track Service', route: '/franchisee/project-management/track-service', icon: 'ClipboardList' }
            ]
          },
          {
            name: 'Survey Bom',
            icon: 'FileText',
            hasDropdown: true,
            subItems: [
              { name: 'Survey Bom', route: '/franchisee/survey-bom', icon: 'FileText' }
            ]
          },
          {
            name: 'District Manager',
            icon: 'Building2',
            hasDropdown: true,
            subItems: [
              { name: 'District Manager', route: '/franchisee/district-manager', icon: 'Building2' }
            ]
          },
          {
            name: 'Dealer Manager',
            icon: 'Store',
            hasDropdown: true,
            subItems: [
              { name: 'Dealer Manager', route: '/franchisee/dealer-manager', icon: 'Store' }
            ]
          },
          {
            name: 'Lead Partner',
            icon: 'Handshake',
            hasDropdown: true,
            subItems: [
              { name: 'Create Lead Partner', route: '/franchisee/lead-partner/create', icon: 'Handshake' },
              { name: 'Lead Management', route: '/franchisee/lead-partner/management', icon: 'Users' }
            ]
          },
          {
            name: 'My Team',
            icon: 'Users',
            hasDropdown: true,
            subItems: [
              { name: 'My Team', route: '/franchisee/my-team', icon: 'Users' }
            ]
          },
          {
            name: 'Account',
            icon: 'User',
            hasDropdown: true,
            subItems: [
              { name: 'Track Payments', route: '/franchisee/account/track-payments', icon: 'DollarSign' }
            ]
          },
          {
            name: 'Solarkits',
            icon: 'Sun',
            hasDropdown: true,
            subItems: [
              { name: 'Solarkits', route: '/franchisee/solarkits', icon: 'Sun' },
              { name: 'Bulk Order', route: '/franchisee/solarkits/bulk-order', icon: 'ClipboardList' }
            ]
          },
          {
            name: 'Settings',
            icon: 'Settings',
            hasDropdown: true,
            subItems: [
              { name: 'Setting', route: '/franchisee/settings', icon: 'Settings' }
            ]
          }
        ];
      case 'dealerManager':
        return [
          { name: 'Dashboard', route: '/dealer-manager/dashboard', icon: 'LayoutDashboard' },
          { name: 'Leads', route: '/dealer-manager/leads', icon: 'Filter' },
          {
            name: 'My Task',
            icon: 'CheckSquare',
            hasDropdown: true,
            subItems: [
              { name: 'App Demo', route: '/dealer-manager/my-task/app-demo', icon: 'Smartphone' },
              { name: 'Dealer Signup', route: '/dealer-manager/my-task/dealer-onboarding/dealer-signup', icon: 'UserPlus' },
              { name: 'Dealer Orientation', route: '/dealer-manager/my-task/dealer-onboarding/dealer-orientation', icon: 'BookOpen' },
              { name: 'Project In Progress', route: '/dealer-manager/my-task/project-management/project-in-progress', icon: 'Clock' },
              { name: 'Completed Projects', route: '/dealer-manager/my-task/project-management/completed-projects', icon: 'CheckCircle' },
              { name: 'Dealer Performance', route: '/dealer-manager/my-task/dealer-performance', icon: 'BarChart' }
            ]
          },
          { name: 'Dealer Onboarding Goals', route: '/dealer-manager/onboarding-goals', icon: 'TrendingUp' },
          {
            name: 'Raise Ticket',
            icon: 'Ticket',
            hasDropdown: true,
            subItems: [
              { name: 'Service', route: '/dealer-manager/tickets/service', icon: 'Wrench' },
              { name: 'Dispute', route: '/dealer-manager/tickets/dispute', icon: 'ShieldAlert' }
            ]
          },
          { name: 'Report', route: '/dealer-manager/report', icon: 'ClipboardList' }
        ];
      case 'franchiseeManager':
        return [
          { name: 'Dashboard', route: '/franchisee-manager/dashboard', icon: 'LayoutDashboard' },
          { name: 'Leads', route: '/franchisee-manager/leads', icon: 'Filter' },
          { name: 'Lead Management', route: '/franchisee-manager/lead-management', icon: 'Layers' },
          {
            name: 'My Task',
            icon: 'CheckSquare',
            hasDropdown: true,
            subItems: [
              { name: 'App Demo', route: '/franchisee-manager/my-task/app-demo', icon: 'Smartphone' },
              { name: 'Franchisee Signup', route: '/franchisee-manager/my-task/franchisee-onboarding/franchisee-signup', icon: 'UserPlus' },
              { name: 'Franchisee Orientation', route: '/franchisee-manager/my-task/franchisee-onboarding/franchisee-orientation', icon: 'BookOpen' },
              { name: 'Project In Progress', route: '/franchisee-manager/my-task/project-management/project-in-progress', icon: 'Clock' },
              { name: 'Franchisee Performance', route: '/franchisee-manager/my-task/franchisee-performance', icon: 'BarChart' }
            ]
          },
          { name: 'Franchisee Onboarding Goals', route: '/franchisee-manager/onboarding-goals', icon: 'TrendingUp' },
          {
            name: 'Franchisee Setting',
            icon: 'Settings',
            hasDropdown: true,
            subItems: [
              { name: 'ComboKit Customization', route: '/franchisee-manager/franchisee-setting/combokit-customization', icon: 'Package' },
              { name: 'Offers', route: '/franchisee-manager/franchisee-setting/offers', icon: 'Tag' },
              { name: 'Track Cashback', route: '/franchisee-manager/franchisee-setting/track-cashback', icon: 'DollarSign' }
            ]
          },
          {
            name: 'Dealer Management',
            icon: 'Users',
            hasDropdown: true,
            subItems: [
              { name: 'Assign To Franchisee', route: '/franchisee-manager/dealer-management/assign-to-franchisee', icon: 'UserCheck' },
              { name: 'Track Dealer', route: '/franchisee-manager/dealer-management/track-dealer', icon: 'Activity' },
              { name: 'Reassign To Company', route: '/franchisee-manager/dealer-management/reasign-to-company', icon: 'RefreshCw' }
            ]
          },
          {
            name: 'Raise Ticket',
            icon: 'Ticket',
            hasDropdown: true,
            subItems: [
              { name: 'Service', route: '/franchisee-manager/tickets/service', icon: 'Wrench' },
              { name: 'Dispute', route: '/franchisee-manager/tickets/dispute', icon: 'ShieldAlert' }
            ]
          },
          { name: 'Find Resources', route: '/franchisee-manager/find-resources', icon: 'Search' },
          { name: 'Report', route: '/franchisee-manager/report', icon: 'ClipboardList' }
        ];
      case 'deliveryManager':
        return [
          { name: 'Dashboard', route: '/delivery-manager/dashboard', icon: 'Home' },
          {
            name: 'My Task',
            icon: 'CheckSquare',
            hasDropdown: true,
            subItems: [
              { name: 'Inward', route: '/delivery-manager/my-task/inward-management', icon: 'Minus' },
              { name: 'At Warehouse', route: '/delivery-manager/my-task/at-warehouse', icon: 'Minus' }
            ]
          },
          { name: 'Delivery Management', route: '/delivery-manager/delivery-management', icon: 'Truck' },
          {
            name: 'Replacement Order',
            icon: 'RefreshCw',
            hasDropdown: true,
            subItems: [
              { name: 'Return Products', route: '/delivery-manager/replacement-order/return-products', icon: 'Minus' },
              { name: 'Replace Products', route: '/delivery-manager/replacement-order/replace-products', icon: 'Minus' },
              { name: 'Service Ticket', route: '/delivery-manager/replacement-order/service-ticket', icon: 'Minus' }
            ]
          },
          { name: 'Report', route: '/delivery-manager/report', icon: 'ClipboardList' }
        ];
      case 'accountManager':
        return [
          { name: 'Dashboard', route: '/account-manager/dashboard', icon: 'Home' },
          {
            name: 'My Task',
            icon: 'Server',
            hasDropdown: true,
            subItems: [
              { name: 'Create Order', route: '/account-manager/my-task/order-journey/create-order', icon: 'Minus' },
              { name: 'Loan Orders', route: '/account-manager/my-task/order-journey/loan-orders', icon: 'Minus' },
              { name: 'Delivery Plan', route: '/account-manager/my-task/order-journey/delivery-plan', icon: 'Minus' },
              { name: 'Vendor Pay', route: '/account-manager/my-task/order-journey/vendor-pay', icon: 'Minus' },
              { name: 'Channel Partner Pay', route: '/account-manager/my-task/order-journey/channel-partner-pay', icon: 'Minus' },
              { name: 'Driver Pay', route: '/account-manager/my-task/order-journey/driver-pay', icon: 'Minus' },
              { name: 'At Warehouse', route: '/account-manager/my-task/order-journey/at-warehouse', icon: 'Minus' },
              { name: 'Delivery Management', route: '/account-manager/my-task/order-journey/delivery-management', icon: 'Minus' },
              { name: 'Return Products', route: '/account-manager/my-task/replacement-order/return-products', icon: 'Minus' },
              { name: 'Replace Products', route: '/account-manager/my-task/replacement-order/replace-products', icon: 'Minus' },
              { name: 'Warehouse Vendor Pay', route: '/account-manager/my-task/warehouse-vendor-pay', icon: 'Minus' },
              { name: 'Vendor Contract Pay', route: '/account-manager/my-task/vendor-contract-pay', icon: 'Minus' },
              { name: 'Track CP Payments', route: '/account-manager/my-task/track-cp-payments', icon: 'Minus' },
              { name: 'Service', route: '/account-manager/my-task/service', icon: 'Minus' }
            ]
          },
          { name: 'Solar Panel Bundle Plan', route: '/account-manager/solar-panel-bundle-plan', icon: 'Settings' },
          { name: 'Procurement Plan', route: '/account-manager/procurement-plan', icon: 'FileText' },
          { name: 'Report', route: '/account-manager/report', icon: 'ClipboardList' }
        ];
      default:
        return [];
    }
  };

  let menuTree = user?.dynamicMenuTree || [];
  if (menuTree.length === 0 && user?.role) {
    menuTree = getFallbackMenu(user.role);
  }

  return (
    <div className="w-64 bg-[#f1f4f9] shadow-lg h-full flex flex-col transition-all duration-300 border-r border-gray-200">
      <div className="p-6 bg-white border-b border-gray-100">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {panelTitle}
        </h2>
        <p className="text-[10px] text-gray-500 tracking-wider">{panelSubtitle}</p>
      </div>
      <nav className="flex-1 overflow-y-auto mt-4 space-y-1 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="px-4 space-y-1">
          {menuTree.map((item) => {
            if (item.hasDropdown && item.subItems?.length > 0) {
              const isOpen = openSubMenus[item.name];
              const IconComponent = getDynamicIcon(item.icon);
              return (
                <div key={item._id} className="mt-1">
                  <button
                    onClick={(e) => toggleSubMenu(item.name, e)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isOpen
                        ? 'bg-[#142340] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent size={20} className={isOpen ? 'text-white' : 'text-gray-600'} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {isOpen ? <Icons.ChevronUp size={20} /> : <Icons.ChevronDown size={20} />}
                  </button>
                  
                  {isOpen && (
                    <div className="bg-[#e9eef5] py-2 mt-1 rounded-xl flex flex-col space-y-1 shadow-inner">
                      {item.subItems.map((subItem, index) => {
                        const SubIcon = getDynamicIcon(subItem.icon);
                        return (
                          <NavLink
                            key={subItem._id || subItem.key || subItem.name || index}
                            to={getDynamicRoute(subItem.route || subItem.path)}
                            className={({ isActive }) =>
                              `flex items-center space-x-3 px-8 py-2 mx-2 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-[#142340] text-white font-semibold' 
                                  : 'text-[#142340] hover:bg-[#dce4ee]'
                              }`
                            }
                          >
                            <SubIcon size={18} />
                            <span className="text-[14.5px]">{subItem.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              return renderNavLink(item);
            }
          })}
        </div>
      </nav>
    </div>
  );
};

export default DynamicPanelSidebar;
