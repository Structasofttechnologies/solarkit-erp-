'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Truck,
  Package,
  Store,
  Building2,
  CheckCircle2,
  BriefcaseBusiness,
  Workflow,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  UserCog,
  Building,
  Store as StoreIcon,
  FileBarChart,
  UserCheck,
  TrendingUp,
  Activity,
  Home,
  MapPin,
  ClipboardList,
  Wrench,
  Layers,
} from 'lucide-react';

import authStore from '../../store/authStore';
import salesSettingsService from '../../services/settings/salesSettingsApi';
import DynamicMenuRenderer from '../../components/Sidebar/DynamicMenuRenderer';

export default function AdminSidebar() {
  const { user } = authStore();
  const [isOpen, setIsOpen] = useState(true);
  const [escalatedCount, setEscalatedCount] = useState(0);

  // Real-time stats fetching
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await salesSettingsService.getDashboardStats({ silent: true });
        setEscalatedCount(stats.escalatedPriceCount || 0);
      } catch (err) {
        console.error("Error fetching sidebar stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every 60 seconds (silent)
    return () => clearInterval(interval);
  }, []);

  // Mapping of Sidebar IDs to System Module Keys
  const moduleMapping = {
    // Settings Sub-groups
    'settingsHr': 'settings_hr',
    'settingsVendor': 'settings_vendor',
    'settingsSales': 'settings_sales',
    'settingsMarketing': 'settings_marketing',
    'settingsDelivery': 'settings_delivery',
    'settingsInstaller': 'settings_installer',
    'settingsInventory': 'settings_inventory',
    'settingsProduct': 'settings_product',
    'settingsBrand': 'settings_brand',
    'settingsCombokit': 'settings_combokit',
    'settingsOrderProcurement': 'settings_order_procurement',
    'settingsPartner': 'settings_partner',
    'settingsHrms': 'settings_hrms',
    'settingsProject': 'settings_project',
    'settingsQuote': 'settings_quote',
    'settingsOverdue': 'settings_overdue',
    'settingsLoan': 'settings_loan',
    'settingsChecklist': 'settings_checklist',
    'reports': 'reports'
  };

  const hasAccess = (sectionId, href) => {
    // 1. Admin always has access
    if (user?.role === 'admin') return true;

    // 2. Map standard sectionId or href to module key
    let moduleKey = moduleMapping[sectionId];
    if (!moduleKey && href) {
      const pathParts = href.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      moduleKey = lastPart.toLowerCase().replace(/-/g, '_');
    }

    if (!moduleKey) return true;

    // 3. First check new Dynamic RBAC panel permissions if available
    if (user?.panelPermissions) {
      const dynamicPerm = user.panelPermissions[moduleKey];
      if (dynamicPerm !== undefined) {
        return dynamicPerm.view;
      }
    }

    // 4. Fallback: Check old Department Modules (Own + Delegated)
    const assignedModules = user?.department?.assignedModules || [];
    const delegatedModules = user?.delegatedDepartments?.flatMap(dept => dept.assignedModules || []) || [];
    const allModules = [...assignedModules, ...delegatedModules];

    const hasModule = allModules.some(m =>
      m.module?.key === moduleKey && m.status === 'active'
    );

    return hasModule;
  };

  const [expandedSections, setExpandedSections] = useState({
    dashboard: false,
    userPerformance: false,
    departments: false,
    operations: false,
    settings: false,
    reports: false,
    projectManagement: false,
    // Settings nested groups
    settingsLocation: false,
    settingsHr: false,
    settingsVendor: false,
    settingsSales: false,
    settingsMarketing: false,
    settingsDelivery: false,
    settingsInstaller: false,
    settingsInventory: false,
    settingsProduct: false,
    settingsBrand: false,
    settingsCombokit: false,
    settingsOrderProcurement: false,
    settingsPartner: false,
    settingsHrms: false,
    settingsProject: false,
    settingsQuote: false,
    settingsOperations: false,
    settingsOverdue: false,
    settingsLoan: false,
    settingsChecklist: false,
    pmCompany: false,
    pmPartners: false,
    pmInstallerAgency: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Seven main sections as per requirements
  const mainSections = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      isExpanded: expandedSections.dashboard,
      children: [
        {
          id: 'userPerformance',
          name: 'User Performance',
          icon: BarChart3,
          isGroup: true,
          isExpanded: expandedSections.userPerformance,
            children: [
              { name: '- Partner Manager Dashboard', href: '/admin/dashboard/user-performance/partner-manager', icon: UserCog },
              { name: '- Partner Dashboard', href: '/admin/dashboard/user-performance/partner', icon: Building },
            ]
        },
        { name: 'Orders', icon: ShoppingCart, href: '/admin/dashboard/orders' },
        { name: 'Orders by Loan', icon: FileBarChart, href: '/admin/dashboard/orders-by-loan' },
        { name: 'Installer', icon: Users, href: '/admin/dashboard/installer' },
        { name: 'Delivery', icon: Truck, href: '/admin/dashboard/delivery' },
        { name: 'Inventory', icon: Package, href: '/admin/dashboard' },
        { name: 'Vendors', icon: Store, href: '/admin/dashboard/vendors' },
        { name: 'Project Report', icon: FileBarChart, href: '/admin/dashboard/project-report' },
      ]
    },
    {
      id: 'departments',
      name: 'Departments',
      icon: Building2,
      isExpanded: expandedSections.departments,
      children: [
        {
          name: 'Organization chart',
          icon: Users,
          href: '/admin/departments/organization-chart',
        },
      ],
    },
    { id: 'approvals', name: 'Approvals', icon: CheckCircle2, href: '/admin/approvals' },
    {
      id: 'projectManagement',
      name: 'Project Management',
      icon: BriefcaseBusiness,
      isExpanded: expandedSections.projectManagement,
      children: [
        {
          id: 'pmCompany',
          name: 'Company',
          icon: Building2,
          isGroup: true,
          isExpanded: expandedSections.pmCompany,
          children: [
            { name: '- Management', href: '/admin/project-management/company/management', icon: Settings },
            { name: '- Install', href: '/admin/project-management/company/install', icon: Wrench },
            { name: '- Service', href: '/admin/project-management/company/service', icon: Wrench },
            { name: '- Track Service', href: '/admin/project-management/company/track-service', icon: ClipboardList },
          ]
        },
        {
          id: 'pmPartners',
          name: 'Partners',
          icon: Users,
          isGroup: true,
          isExpanded: expandedSections.pmPartners,
          children: [
            { name: '- Management', href: '/admin/project-management/partners/management', icon: Settings },
            { name: '- Install', href: '/admin/project-management/partners/install', icon: Wrench },
            { name: '- Service', href: '/admin/project-management/partners/service', icon: Wrench },
            { name: '- Track Service', href: '/admin/project-management/partners/track-service', icon: ClipboardList },
          ]
        },
        {
          id: 'pmInstallerAgency',
          name: 'Installer Agency',
          icon: Store,
          isGroup: true,
          isExpanded: expandedSections.pmInstallerAgency,
          children: [
            { name: '- Management', href: '/admin/project-management/installer-agency/management', icon: Settings },
            { name: '- Install', href: '/admin/project-management/installer-agency/install', icon: Wrench },
            { name: '- Service', href: '/admin/project-management/installer-agency/service', icon: Wrench },
            { name: '- Track Service', href: '/admin/project-management/installer-agency/track-service', icon: ClipboardList },
          ]
        },
      ],
    },
    {
      id: 'operations',
      name: 'Operations',
      icon: Workflow,
      isExpanded: expandedSections.operations,
      children: [
        { name: 'Our Warehouse', icon: Building, href: '/admin/operations/warehouse' },
        { name: 'Add Inventory Request', icon: Package, href: '/admin/operations/add-inventory' },
        {
          name: 'Inventory Management',
          icon: Store,
          href: '/admin/operations/inventory-management',
        },
        {
          id: 'settingsBrand',
          name: 'Brand Manufacturer',
          icon: StoreIcon,
          isGroup: true,
          isExpanded: expandedSections.settingsBrand,
          children: [
            { name: '- Add Brand Manufacturer', href: '/admin/operations/brand/add-brand-manufacturer', icon: StoreIcon },
            { name: '- Brand Supplier Overview', href: '/admin/operations/brand/supplier-overview', icon: FileBarChart },
          ],
        },
      ],
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      isExpanded: expandedSections.settings,
      children: [
        {
          id: 'settingsLocation',
          name: 'Location Settings',
          icon: MapPin,
          isGroup: true,
          isExpanded: expandedSections.settingsLocation,
          children: [
            { name: '- Setup Locations', href: '/admin/settings/location/setup-locations', icon: MapPin },
          ],
        },
        {
          id: 'settingsHr',
          name: 'HR Settings',
          icon: UserCog,
          isGroup: true,
          isExpanded: expandedSections.settingsHr,
          children: [
            { name: '- Role Settings', href: '/admin/settings/hr/role-settings', icon: UserCog },
            { name: '- Create Department', href: '/admin/settings/hr/create-department', icon: Building2 },

            { name: '- Department-wise Modules', href: '/admin/settings/hr/department-wise-modules', icon: LayoutDashboard },
            { name: '- Panels - select level wise panels', href: '/admin/settings/hr/panels-level-wise', icon: Layers },
            { name: '- Temporary Incharge Setting', href: '/admin/settings/hr/temporary-incharge-setting', icon: Users },
            { name: '- Leave Approvals', href: '/admin/settings/hr/leave-approvals', icon: CheckCircle2 },
            { name: '- Resign Approvals', href: '/admin/settings/hr/resign-approvals', icon: CheckCircle2 },
          ],
        },
        {
          id: 'settingsVendor',
          name: 'Vendor Settings',
          icon: Store,
          isGroup: true,
          isExpanded: expandedSections.settingsVendor,
          children: [
            { name: '- Installer Vendors', href: '/admin/settings/vendor/installer-vendors', icon: Users },
            { name: '- Supplier Type', href: '/admin/settings/vendor/supplier-type', icon: LayoutDashboard },
            { name: '- Supplier Vendors', href: '/admin/settings/vendor/supplier-vendors', icon: StoreIcon },
          ],
        },
        {
          id: 'settingsSales',
          name: 'Sales Settings',
          icon: TrendingUp,
          isGroup: true,
          isExpanded: expandedSections.settingsSales,
          children: [
            { 
              name: '- Set Price', 
              href: '/admin/settings/sales/set-price', 
              icon: FileBarChart,
              badge: escalatedCount > 0 ? escalatedCount : null,
              badgeColor: 'bg-red-500'
            },
            { name: '- Set Price For AMC', href: '/admin/settings/sales/set-price-amc', icon: FileBarChart },
            { name: '- Offers', href: '/admin/settings/sales/offers', icon: FileText },
            { name: '- Solar Panel Bundle Setting', href: '/admin/settings/sales/solar-panel-bundle-setting', icon: Package },
          ],
        },
        {
          id: 'settingsMarketing',
          name: 'Marketing Settings',
          icon: BriefcaseBusiness,
          isGroup: true,
          isExpanded: expandedSections.settingsMarketing,
          children: [
            { name: '- Campaign Management', href: '/admin/settings/marketing/campaign-management', icon: BriefcaseBusiness },
          ],
        },
        {
          id: 'settingsOperations',
          name: 'Settings Operations',
          icon: Workflow,
          isGroup: true,
          isExpanded: expandedSections.settingsOperations,
          children: [
            {
              id: 'settingsDelivery',
              name: 'Delivery Settings',
              icon: Truck,
              isGroup: true,
              isExpanded: expandedSections.settingsDelivery,
              children: [
                { name: '- Delivery Type', href: '/admin/settings/delivery/delivery-type', icon: Truck },
                { name: '- Vehicle Selection', href: '/admin/settings/delivery/vehicle-selection', icon: Truck },
                { name: '- Vendor Delivery Plan', href: '/admin/settings/delivery/vendor-delivery-plan', icon: StoreIcon },
              ],
            },
            {
              id: 'settingsInventory',
              name: 'Inventory Management',
              icon: Package,
              isGroup: true,
              isExpanded: expandedSections.settingsInventory,
              children: [
                { name: '- Inventory Overview', href: '/admin/settings/inventory/inventory-overview', icon: Package },
                { name: '- Restock Order Limit', href: '/admin/settings/inventory/restock-order-limit', icon: ClipboardList },
                { name: '- Combokit Brand Overview', href: '/admin/settings/inventory/combokit-brand-overview', icon: StoreIcon },
              ],
            },
            {
              id: 'settingsOrderProcurement',
              name: 'Order Procurement',
              icon: ShoppingCart,
              isGroup: true,
              isExpanded: expandedSections.settingsOrderProcurement,
              children: [
                { name: '- Order Procurement', href: '/admin/settings/order-procurement', icon: ShoppingCart },
              ],
            },
          ],
        },
        {
          id: 'settingsInstaller',
          name: 'Installer Settings',
          icon: Users,
          isGroup: true,
          isExpanded: expandedSections.settingsInstaller,
          children: [
            { name: '- Solar Installer', href: '/admin/settings/installer/solar-installer', icon: Users },
            { name: '- Installer Tool Requirements', href: '/admin/settings/installer/tool-requirements', icon: Wrench },
            { name: '- Rating Setting', href: '/admin/settings/installer/rating-setting', icon: FileBarChart },
            { name: '- Installer Agency Plans', href: '/admin/settings/installer/agency-plans', icon: FileText },
          ],
        },
        {
          id: 'settingsProduct',
          name: 'Product Configuration',
          icon: LayoutDashboard,
          isGroup: true,
          isExpanded: expandedSections.settingsProduct,
          children: [
            { name: '- Add Project Type', href: '/admin/settings/product/add-project-type', icon: LayoutDashboard },
            { name: '- Add Project Category', href: '/admin/settings/product/add-project-category', icon: LayoutDashboard },
            { name: '- Add Product', href: '/admin/settings/product/add-product', icon: Package },
            { name: '- SKU', href: '/admin/settings/product/sku', icon: FileText },
            { name: '- Price Master', href: '/admin/settings/product/price-master', icon: FileBarChart },
            { name: '- Add Unit Management', href: '/admin/settings/product/add-unit-management', icon: ClipboardList },
          ],
        },

        {
          id: 'settingsCombokit',
          name: 'ComboKit',
          icon: Package,
          isGroup: true,
          isExpanded: expandedSections.settingsCombokit,
          children: [
            { name: '- Create Solarkit', href: '/admin/settings/combokit/create-solarkit', icon: Package },
            { name: '- Create AMC Plans', href: '/admin/settings/combokit/create-amc', icon: FileText },
            { name: '- AMC Services', href: '/admin/settings/combokit/amc-services', icon: ClipboardList },
            { name: '- Solarkit Bundle Plans', href: '/admin/settings/combokit/bundle-plans', icon: Package },
            { name: '- Add ComboKit', href: '/admin/settings/combokit/add-combokit', icon: Building },
            { name: '- Customize Combokit', href: '/admin/settings/combokit/customize', icon: LayoutDashboard },
            { name: '- Combokit Overview', href: '/admin/settings/combokit-overview', icon: Package },
          ],
        },
        {
          id: 'settingsPartner',
          name: 'Partner Settings',
          icon: Users,
          isGroup: true,
          isExpanded: expandedSections.settingsPartner,
          children: [
            { name: '- Partner Plans', href: '/admin/settings/partner/plans', icon: LayoutDashboard },
            { name: '- Partner Points & Reward Setting', href: '/admin/settings/partner/points-rewards', icon: FileBarChart },
            { name: '- Partner Onboarding Goals', href: '/admin/settings/partner/onboarding-goals', icon: ClipboardList },
            { name: '- Partner Profession Type', href: '/admin/settings/partner/profession-type', icon: BriefcaseBusiness },
            { name: '- Add Partner', href: '/admin/settings/partner/add-partner', icon: Users },
            { name: '- Partner Manager Setting', href: '/admin/settings/partner-manager', icon: BriefcaseBusiness },
            { name: '- Partner Buy Lead Setting', href: '/admin/settings/partner-buy-lead', icon: BriefcaseBusiness },
          ],
        },
        {
          id: 'settingsHrms',
          name: 'HRMS Settings',
          icon: UserCog,
          isGroup: true,
          isExpanded: expandedSections.settingsHrms,
          children: [
            { name: '- HRMS Settings', href: '/admin/settings/hrms/settings', icon: UserCog },
            { name: '- Vacancy Module', href: '/admin/settings/hrms/vacancy-module', icon: BriefcaseBusiness },
            { name: '- Candidates List', href: '/admin/settings/hrms/candidates', icon: Users },
            { name: '- Candidate Test Setting', href: '/admin/settings/hrms/candidate-test-setting', icon: ClipboardList },
            { name: '- Candidate Training Setting', href: '/admin/settings/hrms/candidate-training-setting', icon: ClipboardList },
          ],
        },
        {
          id: 'settingsProject',
          name: 'Project Management Settings',
          icon: BriefcaseBusiness,
          isGroup: true,
          isExpanded: expandedSections.settingsProject,
          children: [
            { name: '- Project Journey Stage Setting', href: '/admin/settings/project/journey-stage-setting', icon: LayoutDashboard },
            { name: '- Project Management Overdue Setting', href: '/admin/settings/project/overdue-setting', icon: ClipboardList },
            { name: '- Project Management Configuration', href: '/admin/settings/project/configuration-setting', icon: FileText },
            { name: '- Project Documentation Setting', href: '/admin/settings/project/documentation-setting', icon: FileText },
            { name: '- Placeholder Name Setting', href: '/admin/settings/project/placeholder-name-setting', icon: FileText },
          ],
        },
        {
          id: 'settingsQuote',
          name: 'Quote',
          icon: FileText,
          isGroup: true,
          isExpanded: expandedSections.settingsQuote,
          children: [
            { name: '- Quote Setting', href: '/admin/settings/quote/quote-setting', icon: FileText },
            { name: '- Survey BOM Setting', href: '/admin/settings/quote/survey-bom-setting', icon: ClipboardList },
            { name: '- Terrace Setting', href: '/admin/settings/quote/terrace-setting', icon: Building2 },
            { name: '- Structure Setting', href: '/admin/settings/quote/structure-setting', icon: Building },
            { name: '- Building Setting', href: '/admin/settings/quote/building-setting', icon: Building },
            { name: '- Discom Master', href: '/admin/settings/quote/discom-master', icon: FileBarChart },

          ],
        },
        {
          id: 'settingsOverdue',
          name: 'Overdue Setting',
          icon: CheckCircle2,
          isGroup: true,
          isExpanded: expandedSections.settingsOverdue,
          children: [
            { name: '- Approval Overdue Setting', href: '/admin/settings/approval-overdue', icon: CheckCircle2 },
            { name: '- Overdue Task Setting', href: '/admin/settings/overdue-task', icon: ClipboardList },
            { name: '- Overdue Status Setting', href: '/admin/settings/overdue-status', icon: ClipboardList },
          ],
        },
        {
          id: 'settingsLoan',
          name: 'Loan Setting',
          icon: FileBarChart,
          href: '/admin/settings/loan'
        },
        {
          id: 'settingsChecklist',
          name: 'Checklist Setting',
          icon: ClipboardList,
          href: '/admin/settings/checklist'
        },
      ],
    },
    {
      id: 'reports',
      name: 'Report',
      icon: FileText,
      isExpanded: expandedSections.reports,
      children: [
        { name: 'Financial & P&L', icon: FileBarChart, href: '/admin/reports/financial-pl' },
        { name: 'Cashflow', icon: FileBarChart, href: '/admin/reports/cashflow' },
        { name: 'Inventory', icon: Package, href: '/admin/reports/inventory' },
        {
          name: 'Loans',
          icon: FileBarChart,
          href: '/admin/reports/loans-summary',
        },
        { name: 'Captable', icon: FileBarChart, href: '/admin/reports/captable' },
        { name: 'Revenue By CP Types', icon: FileBarChart, href: '/admin/reports/revenue-by-cp-types' },
        { name: 'Cluster', icon: FileBarChart, href: '/admin/reports/cluster' },
        { name: 'District', icon: FileBarChart, href: '/admin/reports/district' },
        { name: 'City', icon: FileBarChart, href: '/admin/reports/city' },
      ],
    },
  ];

  // Extract all existing routes
  const existingRoutes = [];
  const extractRoutes = (items) => {
    if (!items) return;
    items.forEach(item => {
      if (item.href) existingRoutes.push(item.href);
      if (item.children) extractRoutes(item.children);
    });
  };
  extractRoutes(mainSections);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`${isOpen ? 'w-64' : 'w-0'
          } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col lg:w-64`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Home size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">SOLARKITS</h1>
              <p className="text-xs text-gray-400">ERP System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {mainSections.filter(section => hasAccess(section.id, section.href)).map((section) => (
            <div key={section.id} className="mb-1">
              {/* Main Section Header */}
              {section.children ? (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition mx-2"
                >
                  <div className="flex items-center space-x-3">
                    <section.icon size={20} />
                    <span className="font-medium">{section.name}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transform transition ${section.isExpanded ? 'rotate-180' : ''
                      }`}
                  />
                </button>
              ) : (
                <Link
                  to={section.href}
                  className="block px-4 py-3 mx-2 hover:bg-gray-800 rounded-lg transition flex items-center space-x-3"
                >
                  <section.icon size={20} />
                  <span className="font-medium">{section.name}</span>
                </Link>
              )}

              {/* Children Sections */}
              {section.children && section.isExpanded && (
                <div className="mt-1 ml-6">
                  {section.children.map((child) => {
                    const renderChild = (item, depth = 1) => {
                      if (!hasAccess(item.id, item.href)) return null;

                      if (item.isGroup) {
                        return (
                          <div key={item.id} className="mt-2">
                            <button
                              onClick={() => toggleSection(item.id)}
                              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition"
                            >
                              <div className="flex items-center space-x-2">
                                <item.icon size={16} />
                                <span>{item.name}</span>
                              </div>
                              <ChevronRight
                                size={14}
                                className={`transform transition ${item.isExpanded ? 'rotate-90' : ''
                                  }`}
                              />
                            </button>

                            {/* Sub-children of nested groups */}
                            {item.isExpanded && item.children && (
                              <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
                                {item.children.map((subChild) => renderChild(subChild, depth + 1))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.href || item.name}
                          to={item.href}
                          className={`flex items-center justify-between px-3 py-2 text-sm hover:text-white hover:bg-gray-800 rounded-lg transition ${depth > 1 ? 'text-gray-300' : 'text-gray-200'
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                             {item.icon && <item.icon size={depth > 1 ? 14 : 16} />}
                             <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-red-500'} animate-pulse`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    };

                    return renderChild(child);
                  })}
                </div>
              )}
            </div>
          ))}

          <DynamicMenuRenderer existingRoutes={existingRoutes} theme="dark" />
        </nav>
      </aside>
    </>
  );
}