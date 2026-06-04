import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Shield,
  Trash2,
  Copy,
  Users,
  Settings,
  FileText,
  Activity,
  Check,
  X,
  Edit2,
  ChevronRight,
  RefreshCw,
  Search,
  CheckSquare,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as rbacApi from '../../../../services/settings/rbacApi';
import { locationAPI } from '../../../../api/api';
import { SIDEBAR_NAVIGATION, ACCOUNT_MANAGER_NAVIGATION } from '../../../constants/navigation';
import AddNewCompanyUserModal from './AddNewCompanyUserModal';

const AVAILABLE_ICONS = [
  { name: 'Layers', component: Layers },
  { name: 'Users', component: Users },
  { name: 'Settings', component: Settings },
  { name: 'FileText', component: FileText },
  { name: 'Activity', component: Activity },
  { name: 'Shield', component: Shield },
];

const toSnakeCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '');
};

const parseSidebarModules = (navigationList) => {
  const list = [];
  navigationList.forEach((section) => {
    const sectionKey = section.id ? toSnakeCase(section.id) : toSnakeCase(section.name.toLowerCase().replace(/\s+/g, '_'));
    const sectionIconName = section.icon?.name || section.icon?.displayName || 'Layers';

    list.push({
      name: section.name,
      key: sectionKey,
      route: section.href || '',
      icon: sectionIconName,
      description: `${section.name} Main Section`,
      parentKey: null,
    });

    if (section.children && section.children.length > 0) {
      section.children.forEach((child) => {
        const childIconName = child.icon?.name || child.icon?.displayName || 'Layers';

        if (child.isGroup) {
          const groupKey = child.id ? toSnakeCase(child.id) : toSnakeCase(child.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''));
          list.push({
            name: child.name,
            key: groupKey,
            route: child.href || '',
            icon: childIconName,
            description: `${child.name} Group Section`,
            parentKey: null,
          });

          if (child.children && child.children.length > 0) {
            child.children.forEach((subChild) => {
              const subChildIconName = subChild.icon?.name || subChild.icon?.displayName || 'Layers';
              let subChildKey = '';
              if (subChild.href) {
                const parts = subChild.href.split('/');
                subChildKey = parts[parts.length - 1].toLowerCase().replace(/-/g, '_');
              } else {
                subChildKey = toSnakeCase(subChild.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''));
              }

              list.push({
                name: subChild.name,
                key: subChildKey,
                route: subChild.href || '',
                icon: subChildIconName,
                description: `${subChild.name} Submodule`,
                parentKey: groupKey,
              });
            });
          }
        } else {
          let childKey = '';
          if (child.href) {
            const parts = child.href.split('/');
            childKey = parts[parts.length - 1].toLowerCase().replace(/-/g, '_');
          } else {
            childKey = toSnakeCase(child.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''));
          }

          list.push({
            name: child.name,
            key: childKey,
            route: child.href || '',
            icon: childIconName,
            description: `${child.name} Submodule`,
            parentKey: sectionKey,
          });
        }
      });
    }
  });
  return list;
};

const formatPanelName = (name) => {
  if (name === 'Accounts Panel') return 'Account Manager';
  if (name === 'Delivery Panel') return 'Delivery Manager';
  return name;
};

const getStaticModulesForPanelName = (pName) => {
  if (!pName) return [];
  pName = pName.toLowerCase();
  
  if (pName.includes('account')) {
    return [
      { _id: 'am_1', name: 'Dashboard' },
      { _id: 'am_2', name: 'My Task' },
      { _id: 'am_3', name: 'Order Journey', parentModule: 'am_2' },
      { _id: 'am_4', name: 'Replacement Order', parentModule: 'am_2' },
      { _id: 'am_5', name: 'Warehouse Vendor Pay', parentModule: 'am_2' },
      { _id: 'am_6', name: 'Vendor Contract Pay', parentModule: 'am_2' },
      { _id: 'am_7', name: 'Track CP Payments', parentModule: 'am_2' },
      { _id: 'am_8', name: 'Service', parentModule: 'am_2' },
      { _id: 'am_9', name: 'Solar Panel Bundle Plan' },
      { _id: 'am_10', name: 'Procurement Plan' },
      { _id: 'am_11', name: 'Report' },
    ];
  } else if (pName.includes('delivery')) {
    return [
      { _id: 'del_1', name: 'Dashboard' },
      { _id: 'del_2', name: 'My Task' },
      { _id: 'del_3', name: 'InWard', parentModule: 'del_2' },
      { _id: 'del_4', name: 'At Warehouse', parentModule: 'del_2' },
      { _id: 'del_5', name: 'Delivery Management' },
      { _id: 'del_6', name: 'Replacement Order' },
      { _id: 'del_7', name: 'Return Products', parentModule: 'del_6' },
      { _id: 'del_8', name: 'Replace Products', parentModule: 'del_6' },
      { _id: 'del_9', name: 'Service Ticket', parentModule: 'del_6' },
      { _id: 'del_10', name: 'Report' },
    ];
  } else if (pName.includes('partner manager') || pName.includes('franchisee manager')) {
    return [
      { _id: 'pm_1', name: 'Dashboard' },
      { _id: 'pm_2', name: 'Leads' },
      { _id: 'pm_3', name: 'Lead Management' },
      { _id: 'pm_4', name: 'My Task' },
      { _id: 'pm_4_1', name: 'App Demo', parentModule: 'pm_4' },
      { _id: 'pm_4_2', name: 'Franchisee Onboarding', parentModule: 'pm_4' },
      { _id: 'pm_4_3', name: 'Project Management', parentModule: 'pm_4' },
      { _id: 'pm_4_4', name: 'Franchisee Performance', parentModule: 'pm_4' },
      { _id: 'pm_5', name: 'Franchisee Onboarding Goals' },
      { _id: 'pm_6', name: 'Franchisee Setting' },
      { _id: 'pm_7', name: 'Dealer Management' },
      { _id: 'pm_8', name: 'Raise Ticket' },
      { _id: 'pm_9', name: 'Find Resources' },
      { _id: 'pm_10', name: 'Report' },
    ];
  } else if (pName.includes('partner') || pName.includes('franchisee')) {
    return [
      { _id: 'pt_1', name: 'Dashboard' },
      { _id: 'pt_2', name: 'Project Signup' },
      { _id: 'pt_3', name: 'Project Management' },
      { _id: 'pt_4', name: 'Survey Bom' },
      { _id: 'pt_5', name: 'District Manager' },
      { _id: 'pt_6', name: 'Dealer Manager' },
      { _id: 'pt_7', name: 'Lead Partner' },
      { _id: 'pt_8', name: 'My Team' },
      { _id: 'pt_9', name: 'Account' },
      { _id: 'pt_10', name: 'Solarkits' },
      { _id: 'pt_11', name: 'Settings' },
    ];
  } else if (pName.includes('admin')) {
    return [
      { _id: 'ad_1', name: 'Dashboard' },
      { _id: 'ad_1_1', name: 'User Performance', parentModule: 'ad_1' },
      { _id: 'ad_1_1_1', name: 'Partner Manager Dashboard', parentModule: 'ad_1_1' },
      { _id: 'ad_1_1_2', name: 'Partner Dashboard', parentModule: 'ad_1_1' },
      { _id: 'ad_1_2', name: 'Orders', parentModule: 'ad_1' },
      { _id: 'ad_1_3', name: 'Orders by Loan', parentModule: 'ad_1' },
      { _id: 'ad_1_4', name: 'Installer', parentModule: 'ad_1' },
      { _id: 'ad_1_5', name: 'Delivery', parentModule: 'ad_1' },
      { _id: 'ad_1_6', name: 'Inventory', parentModule: 'ad_1' },
      { _id: 'ad_1_7', name: 'Vendors', parentModule: 'ad_1' },
      { _id: 'ad_1_8', name: 'Project Report', parentModule: 'ad_1' },
      
      { _id: 'ad_2', name: 'Departments' },
      { _id: 'ad_2_1', name: 'Organization chart', parentModule: 'ad_2' },
      
      { _id: 'ad_3', name: 'Approvals' },
      
      { _id: 'ad_4', name: 'Project Management' },
      { _id: 'ad_4_1', name: 'Company', parentModule: 'ad_4' },
      { _id: 'ad_4_1_1', name: 'Management', parentModule: 'ad_4_1' },
      { _id: 'ad_4_1_2', name: 'Install', parentModule: 'ad_4_1' },
      { _id: 'ad_4_1_3', name: 'Service', parentModule: 'ad_4_1' },
      { _id: 'ad_4_1_4', name: 'Track Service', parentModule: 'ad_4_1' },
      { _id: 'ad_4_2', name: 'Partners', parentModule: 'ad_4' },
      { _id: 'ad_4_2_1', name: 'Management', parentModule: 'ad_4_2' },
      { _id: 'ad_4_2_2', name: 'Install', parentModule: 'ad_4_2' },
      { _id: 'ad_4_2_3', name: 'Service', parentModule: 'ad_4_2' },
      { _id: 'ad_4_2_4', name: 'Track Service', parentModule: 'ad_4_2' },
      { _id: 'ad_4_3', name: 'Installer Agency', parentModule: 'ad_4' },
      { _id: 'ad_4_3_1', name: 'Management', parentModule: 'ad_4_3' },
      { _id: 'ad_4_3_2', name: 'Install', parentModule: 'ad_4_3' },
      { _id: 'ad_4_3_3', name: 'Service', parentModule: 'ad_4_3' },
      { _id: 'ad_4_3_4', name: 'Track Service', parentModule: 'ad_4_3' },

      { _id: 'ad_5', name: 'Operations' },
      { _id: 'ad_5_1', name: 'Our Warehouse', parentModule: 'ad_5' },
      { _id: 'ad_5_2', name: 'Add Inventory Request', parentModule: 'ad_5' },
      { _id: 'ad_5_3', name: 'Inventory Management', parentModule: 'ad_5' },
      { _id: 'ad_5_4', name: 'Brand Manufacturer', parentModule: 'ad_5' },
      { _id: 'ad_5_4_1', name: 'Add Brand Manufacturer', parentModule: 'ad_5_4' },
      { _id: 'ad_5_4_2', name: 'Brand Supplier Overview', parentModule: 'ad_5_4' },

      { _id: 'ad_6', name: 'Settings' },
      { _id: 'ad_6_1', name: 'Location Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_1_1', name: 'Setup Locations', parentModule: 'ad_6_1' },
      
      { _id: 'ad_6_2', name: 'HR Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_2_1', name: 'Role Settings', parentModule: 'ad_6_2' },
      { _id: 'ad_6_2_2', name: 'Create Department', parentModule: 'ad_6_2' },
      { _id: 'ad_6_2_3', name: 'Department-wise Modules', parentModule: 'ad_6_2' },
      { _id: 'ad_6_2_4', name: 'Panels - select level wise panels', parentModule: 'ad_6_2' },
      { _id: 'ad_6_2_5', name: 'Temporary Incharge Setting', parentModule: 'ad_6_2' },
      { _id: 'ad_6_2_6', name: 'Leave Approvals', parentModule: 'ad_6_2' },
      { _id: 'ad_6_2_7', name: 'Resign Approvals', parentModule: 'ad_6_2' },
      
      { _id: 'ad_6_3', name: 'Vendor Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_3_1', name: 'Installer Vendors', parentModule: 'ad_6_3' },
      { _id: 'ad_6_3_2', name: 'Supplier Type', parentModule: 'ad_6_3' },
      { _id: 'ad_6_3_3', name: 'Supplier Vendors', parentModule: 'ad_6_3' },
      
      { _id: 'ad_6_4', name: 'Sales Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_4_1', name: 'Set Price', parentModule: 'ad_6_4' },
      { _id: 'ad_6_4_2', name: 'Set Price For AMC', parentModule: 'ad_6_4' },
      { _id: 'ad_6_4_3', name: 'Offers', parentModule: 'ad_6_4' },
      { _id: 'ad_6_4_4', name: 'Solar Panel Bundle Setting', parentModule: 'ad_6_4' },
      
      { _id: 'ad_6_5', name: 'Marketing Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_5_1', name: 'Campaign Management', parentModule: 'ad_6_5' },
      
      { _id: 'ad_6_6', name: 'Settings Operations', parentModule: 'ad_6' },
      { _id: 'ad_6_6_1', name: 'Delivery Settings', parentModule: 'ad_6_6' },
      { _id: 'ad_6_6_1_1', name: 'Delivery Type', parentModule: 'ad_6_6_1' },
      { _id: 'ad_6_6_1_2', name: 'Vehicle Selection', parentModule: 'ad_6_6_1' },
      { _id: 'ad_6_6_1_3', name: 'Vendor Delivery Plan', parentModule: 'ad_6_6_1' },
      { _id: 'ad_6_6_2', name: 'Inventory Management', parentModule: 'ad_6_6' },
      { _id: 'ad_6_6_2_1', name: 'Inventory Overview', parentModule: 'ad_6_6_2' },
      { _id: 'ad_6_6_2_2', name: 'Restock Order Limit', parentModule: 'ad_6_6_2' },
      { _id: 'ad_6_6_2_3', name: 'Combokit Brand Overview', parentModule: 'ad_6_6_2' },
      { _id: 'ad_6_6_3', name: 'Order Procurement', parentModule: 'ad_6_6' },
      { _id: 'ad_6_6_3_1', name: 'Order Procurement', parentModule: 'ad_6_6_3' },
      
      { _id: 'ad_6_7', name: 'Installer Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_7_1', name: 'Solar Installer', parentModule: 'ad_6_7' },
      { _id: 'ad_6_7_2', name: 'Installer Tool Requirements', parentModule: 'ad_6_7' },
      { _id: 'ad_6_7_3', name: 'Rating Setting', parentModule: 'ad_6_7' },
      { _id: 'ad_6_7_4', name: 'Installer Agency Plans', parentModule: 'ad_6_7' },
      
      { _id: 'ad_6_8', name: 'Product Configuration', parentModule: 'ad_6' },
      { _id: 'ad_6_8_1', name: 'Add Project Type', parentModule: 'ad_6_8' },
      { _id: 'ad_6_8_2', name: 'Add Project Category', parentModule: 'ad_6_8' },
      { _id: 'ad_6_8_3', name: 'Add Product', parentModule: 'ad_6_8' },
      { _id: 'ad_6_8_4', name: 'SKU', parentModule: 'ad_6_8' },
      { _id: 'ad_6_8_5', name: 'Price Master', parentModule: 'ad_6_8' },
      { _id: 'ad_6_8_6', name: 'Add Unit Management', parentModule: 'ad_6_8' },
      
      { _id: 'ad_6_9', name: 'ComboKit', parentModule: 'ad_6' },
      { _id: 'ad_6_9_1', name: 'Create Solarkit', parentModule: 'ad_6_9' },
      { _id: 'ad_6_9_2', name: 'Create AMC Plans', parentModule: 'ad_6_9' },
      { _id: 'ad_6_9_3', name: 'AMC Services', parentModule: 'ad_6_9' },
      { _id: 'ad_6_9_4', name: 'Solarkit Bundle Plans', parentModule: 'ad_6_9' },
      { _id: 'ad_6_9_5', name: 'Add ComboKit', parentModule: 'ad_6_9' },
      { _id: 'ad_6_9_6', name: 'Customize Combokit', parentModule: 'ad_6_9' },
      { _id: 'ad_6_9_7', name: 'Combokit Overview', parentModule: 'ad_6_9' },
      
      { _id: 'ad_6_10', name: 'Partner Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_10_1', name: 'Partner Plans', parentModule: 'ad_6_10' },
      { _id: 'ad_6_10_2', name: 'Partner Points & Reward Setting', parentModule: 'ad_6_10' },
      { _id: 'ad_6_10_3', name: 'Partner Onboarding Goals', parentModule: 'ad_6_10' },
      { _id: 'ad_6_10_4', name: 'Partner Profession Type', parentModule: 'ad_6_10' },
      { _id: 'ad_6_10_5', name: 'Add Partner', parentModule: 'ad_6_10' },
      { _id: 'ad_6_10_6', name: 'Partner Manager Setting', parentModule: 'ad_6_10' },
      { _id: 'ad_6_10_7', name: 'Partner Buy Lead Setting', parentModule: 'ad_6_10' },
      
      { _id: 'ad_6_11', name: 'HRMS Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_11_1', name: 'HRMS Settings', parentModule: 'ad_6_11' },
      { _id: 'ad_6_11_2', name: 'Vacancy Module', parentModule: 'ad_6_11' },
      { _id: 'ad_6_11_3', name: 'Candidates List', parentModule: 'ad_6_11' },
      { _id: 'ad_6_11_4', name: 'Candidate Test Setting', parentModule: 'ad_6_11' },
      { _id: 'ad_6_11_5', name: 'Candidate Training Setting', parentModule: 'ad_6_11' },
      
      { _id: 'ad_6_12', name: 'Project Management Settings', parentModule: 'ad_6' },
      { _id: 'ad_6_12_1', name: 'Project Journey Stage Setting', parentModule: 'ad_6_12' },
      { _id: 'ad_6_12_2', name: 'Project Management Overdue Setting', parentModule: 'ad_6_12' },
      { _id: 'ad_6_12_3', name: 'Project Management Configuration', parentModule: 'ad_6_12' },
      { _id: 'ad_6_12_4', name: 'Project Documentation Setting', parentModule: 'ad_6_12' },
      { _id: 'ad_6_12_5', name: 'Placeholder Name Setting', parentModule: 'ad_6_12' },
      
      { _id: 'ad_6_13', name: 'Quote', parentModule: 'ad_6' },
      { _id: 'ad_6_13_1', name: 'Quote Setting', parentModule: 'ad_6_13' },
      { _id: 'ad_6_13_2', name: 'Survey BOM Setting', parentModule: 'ad_6_13' },
      { _id: 'ad_6_13_3', name: 'Terrace Setting', parentModule: 'ad_6_13' },
      { _id: 'ad_6_13_4', name: 'Structure Setting', parentModule: 'ad_6_13' },
      { _id: 'ad_6_13_5', name: 'Building Setting', parentModule: 'ad_6_13' },
      { _id: 'ad_6_13_6', name: 'Discom Master', parentModule: 'ad_6_13' },
      
      { _id: 'ad_6_14', name: 'Overdue Setting', parentModule: 'ad_6' },
      { _id: 'ad_6_14_1', name: 'Approval Overdue Setting', parentModule: 'ad_6_14' },
      { _id: 'ad_6_14_2', name: 'Overdue Task Setting', parentModule: 'ad_6_14' },
      { _id: 'ad_6_14_3', name: 'Overdue Status Setting', parentModule: 'ad_6_14' },
      
      { _id: 'ad_6_15', name: 'Loan Setting', parentModule: 'ad_6' },
      { _id: 'ad_6_16', name: 'Checklist Setting', parentModule: 'ad_6' },

      { _id: 'ad_7', name: 'Report' },
      { _id: 'ad_7_1', name: 'Financial & P&L', parentModule: 'ad_7' },
      { _id: 'ad_7_2', name: 'Cashflow', parentModule: 'ad_7' },
      { _id: 'ad_7_3', name: 'Inventory', parentModule: 'ad_7' },
      { _id: 'ad_7_4', name: 'Loans', parentModule: 'ad_7' },
      { _id: 'ad_7_5', name: 'Captable', parentModule: 'ad_7' },
      { _id: 'ad_7_6', name: 'Revenue By CP Types', parentModule: 'ad_7' },
      { _id: 'ad_7_7', name: 'Cluster', parentModule: 'ad_7' },
      { _id: 'ad_7_8', name: 'District', parentModule: 'ad_7' },
      { _id: 'ad_7_9', name: 'City', parentModule: 'ad_7' },
    ];
  }
  return [];
};


export default function PanelsLevelWise() {
  // Navigation & Tabs state
  const [activeTab, setActiveTab] = useState('panels'); // matrix | panels | modules | users | logs

  // Data states
  const [panels, setPanels] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [userPanels, setUserPanels] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [panelForm, setPanelForm] = useState({ name: '', level: 'Country' });
  const [moduleForm, setModuleForm] = useState({
    name: '',
    key: '',
    route: '',
    icon: 'Layers',
    description: '',
    moduleType: 'parent', // 'parent' | 'submodule'
    parentModule: '',
    panelId: '',
  });
  const [userAssignForm, setUserAssignForm] = useState({ userId: '', panelId: '', branchId: 'Main Branch', customPermissions: [] });

  // Modal / Editing states
  const [editingPanel, setEditingPanel] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [cloningPanel, setCloningPanel] = useState(null); // { sourcePanelId, targetName: '', targetLevel: 'Country' }
  const [configuringUser, setConfiguringUser] = useState(null); // User object currently undergoing permission overrides

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');

  // Add User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Location filter states
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    clusters: [],
    districts: []
  });
  const [selectedLocation, setSelectedLocation] = useState({
    country: 'all',
    state: 'all',
    cluster: '',
    district: ''
  });
  const [showLocationCards, setShowLocationCards] = useState(true);

  // Local state for modified permissions matrix
  const [matrixState, setMatrixState] = useState({}); // key: panelId_moduleId, value: { can_view, can_add, can_edit, can_delete }
  const [isMatrixDirty, setIsMatrixDirty] = useState(false);
  const [expandedMatrixRows, setExpandedMatrixRows] = useState({});

  const toggleMatrixRow = (parentId) => {
    setExpandedMatrixRows((prev) => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await locationAPI.getAllCountries({ isActive: true });
        if (res.data && res.data.data) {
          setLocationData(prev => ({ ...prev, countries: res.data.data }));
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const params = { isActive: true };
        if (selectedLocation.country && selectedLocation.country !== 'all') {
          params.countryId = selectedLocation.country;
        }
        const res = await locationAPI.getAllStates(params);
        if (res.data && res.data.data) {
          setLocationData(prev => ({ ...prev, states: res.data.data }));
        }
      } catch (error) {
        console.error('Failed to fetch states:', error);
        setLocationData(prev => ({ ...prev, states: [] }));
      }
    };
    fetchStates();
  }, [selectedLocation.country]);

  useEffect(() => {
    const fetchClusters = async () => {
      if (selectedLocation.state) {
        try {
          const params = { isActive: true };
          if (selectedLocation.state !== 'all') {
            params.stateId = selectedLocation.state;
          }
          const res = await locationAPI.getAllClusters(params);
          setLocationData(prev => ({ ...prev, clusters: res.data?.data || [] }));
        } catch (error) {
          console.error('Failed to fetch clusters:', error);
          setLocationData(prev => ({ ...prev, clusters: [] }));
        }
      } else {
        setLocationData(prev => ({ ...prev, clusters: [] }));
      }
    };
    fetchClusters();
  }, [selectedLocation.state]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedLocation.cluster) {
        try {
          if (selectedLocation.cluster !== 'all') {
            const res = await locationAPI.getClusterById(selectedLocation.cluster);
            if (res.data?.data?.districts) {
              setLocationData(prev => ({ ...prev, districts: res.data.data.districts }));
            } else {
              setLocationData(prev => ({ ...prev, districts: [] }));
            }
          } else {
            const params = { isActive: true };
            if (selectedLocation.state && selectedLocation.state !== 'all') {
              params.stateId = selectedLocation.state;
            }
            const res = await locationAPI.getAllDistricts(params);
            setLocationData(prev => ({ ...prev, districts: res.data?.data || [] }));
          }
        } catch (error) {
          console.error('Failed to fetch districts:', error);
          setLocationData(prev => ({ ...prev, districts: [] }));
        }
      } else {
        setLocationData(prev => ({ ...prev, districts: [] }));
      }
    };
    fetchDistricts();
  }, [selectedLocation.cluster, selectedLocation.state]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Auto-sync modules from the SIDEBAR_NAVIGATION and ACCOUNT_MANAGER_NAVIGATION structures!
      const combinedNavigation = [...SIDEBAR_NAVIGATION, ...ACCOUNT_MANAGER_NAVIGATION];
      const parsedModules = parseSidebarModules(combinedNavigation);
      await rbacApi.syncModules(parsedModules);

      const [matrixRes, usersRes, logsRes] = await Promise.all([
        rbacApi.getPermissionMatrix(),
        rbacApi.getUsersAndPanels(),
        rbacApi.getActivityLogs(),
      ]);

      if (matrixRes.success) {
        setPanels(matrixRes.panels || []);
        setModules(matrixRes.modules || []);
        setPermissions(matrixRes.permissions || []);

        // Reconstruct matrixState
        const mState = {};
        matrixRes.permissions.forEach((perm) => {
          mState[`${perm.panelId}_${perm.moduleId}`] = {
            can_view: perm.can_view,
            can_add: perm.can_add,
            can_edit: perm.can_edit,
            can_delete: perm.can_delete,
          };
        });
        setMatrixState(mState);
        setIsMatrixDirty(false);
      }

      if (usersRes.success) {
        setUsers(usersRes.users || []);
        setUserPanels(usersRes.userPanels || []);
      }

      if (logsRes.success) {
        setActivityLogs(logsRes.logs || []);
      }
    } catch (error) {
      console.error('Failed to load RBAC data:', error);
      toast.error('Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     HIERARCHY GROUPING HELPER
     ========================================================================== */

  const getGroupedModules = () => {
    // Filter parent modules (modules that have no parentModule field set)
    const parents = modules.filter((m) => !m.parentModule);
    const grouped = [];

    parents.forEach((p) => {
      // Add parent to flat list
      grouped.push(p);

      // Find children belonging to this parent module
      const children = modules.filter((m) => {
        if (!m.parentModule) return false;
        const parentId = m.parentModule._id || m.parentModule;
        return String(parentId) === String(p._id);
      });

      children.forEach((c) => {
        grouped.push({
          ...c,
          isSubmodule: true,
          parentName: p.name,
        });
      });
    });

    // Handle orphan submodules (where parent module is not found)
    modules.forEach((m) => {
      if (m.parentModule) {
        const parentId = m.parentModule._id || m.parentModule;
        const parentExists = parents.some((p) => String(p._id) === String(parentId));
        if (!parentExists) {
          grouped.push({
            ...m,
            isSubmodule: true,
            parentName: 'Orphan Submodule',
          });
        }
      }
    });

    return grouped;
  };

  /* ==========================================================================
     PERMISSION MATRIX OPERATIONS
     ========================================================================== */

  const handleMatrixCellChange = (panelId, moduleId, actionField, value) => {
    const key = `${panelId}_${moduleId}`;
    setMatrixState((prev) => {
      const current = prev[key] || { can_view: false, can_add: false, can_edit: false, can_delete: false };
      const updated = { ...current, [actionField]: value };
      return { ...prev, [key]: updated };
    });
    setIsMatrixDirty(true);
  };

  const handleSaveMatrix = async () => {
    try {
      const updates = [];
      Object.keys(matrixState).forEach((key) => {
        const [panelId, moduleId] = key.split('_');
        updates.push({
          panelId,
          moduleId,
          ...matrixState[key],
        });
      });

      const res = await rbacApi.updatePermissionMatrix(updates);
      if (res.success) {
        toast.success('Permission Matrix saved successfully!');
        setIsMatrixDirty(false);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save matrix');
    }
  };

  const handleApplyTemplate = (panelId, templateType) => {
    const mState = { ...matrixState };
    modules.forEach((mod) => {
      const key = `${panelId}_${mod._id}`;
      if (templateType === 'view_only') {
        mState[key] = { can_view: true, can_add: false, can_edit: false, can_delete: false };
      } else if (templateType === 'manager') {
        mState[key] = { can_view: true, can_add: true, can_edit: true, can_delete: false };
      } else if (templateType === 'full_access') {
        mState[key] = { can_view: true, can_add: true, can_edit: true, can_delete: true };
      } else if (templateType === 'clear') {
        mState[key] = { can_view: false, can_add: false, can_edit: false, can_delete: false };
      }
    });
    setMatrixState(mState);
    setIsMatrixDirty(true);
    toast.success(`Applied template to panel!`);
  };

  /* ==========================================================================
     PANEL OPERATIONS
     ========================================================================== */

  const handleCreatePanel = async (e) => {
    e.preventDefault();
    try {
      const res = await rbacApi.createPanel(panelForm);
      if (res.success) {
        toast.success(`Panel '${res.panel.name}' created successfully`);
        setPanelForm({ name: '', level: 'Country' });
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create panel');
    }
  };

  const handleUpdatePanel = async (e) => {
    e.preventDefault();
    try {
      const res = await rbacApi.updatePanel(editingPanel._id, editingPanel);
      if (res.success) {
        toast.success('Panel updated successfully');
        setEditingPanel(null);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update panel');
    }
  };

  const handleDeletePanel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this panel? This will delete all permissions and assignments associated with it.')) return;
    try {
      const res = await rbacApi.deletePanel(id);
      if (res.success) {
        toast.success(res.message);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete panel');
    }
  };

  const handleClonePanel = async (e) => {
    e.preventDefault();
    try {
      const res = await rbacApi.clonePanel({
        sourcePanelId: cloningPanel.sourcePanelId,
        targetName: cloningPanel.targetName,
        targetDescription: cloningPanel.targetDescription,
      });
      if (res.success) {
        toast.success(`Panel cloned successfully!`);
        setCloningPanel(null);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clone panel');
    }
  };

  /* ==========================================================================
     MODULE OPERATIONS
     ========================================================================== */

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      let actualParentModuleId = moduleForm.moduleType === 'submodule' ? moduleForm.parentModule : null;

      if (moduleForm.moduleType === 'submodule' && !actualParentModuleId) {
        toast.error('Please select a parent module for this submodule');
        return;
      }

      // If the parent module selected is a static placeholder, create it in the DB first
      if (actualParentModuleId && actualParentModuleId.startsWith('STATIC_')) {
        const parentName = actualParentModuleId.replace('STATIC_', '');
        const parentPayload = {
          name: parentName,
          key: parentName.toLowerCase().replace(/\s+/g, '_'),
          route: `/${parentName.toLowerCase().replace(/\s+/g, '-')}`,
          icon: 'Layers',
          description: `Main module for ${parentName}`,
          parentModule: null,
          panelId: moduleForm.panelId,
        };
        const parentRes = await rbacApi.createModule(parentPayload);
        if (parentRes.success) {
          actualParentModuleId = parentRes.module._id;
        } else {
          toast.error(`Failed to dynamically create missing parent module: ${parentName}`);
          return;
        }
      }

      const payload = {
        name: moduleForm.name,
        key: moduleForm.key,
        route: moduleForm.route,
        icon: moduleForm.icon,
        description: moduleForm.description,
        parentModule: actualParentModuleId,
        panelId: moduleForm.panelId,
      };

      const res = await rbacApi.createModule(payload);
      if (res.success) {
        toast.success(`Dynamic module '${res.module.name}' registered successfully!`);
        setModuleForm({
          name: '',
          key: '',
          route: '',
          icon: 'Layers',
          description: '',
          moduleType: 'parent',
          parentModule: '',
          panelId: '',
        });
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create module');
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingModule,
        parentModule: editingModule.moduleType === 'submodule' ? editingModule.parentModule : null,
      };

      const res = await rbacApi.updateModule(editingModule._id, payload);
      if (res.success) {
        toast.success('Module changes saved successfully');
        setEditingModule(null);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update module');
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module? This will remove it from all panels and permission matrices.')) return;
    try {
      const res = await rbacApi.deleteModule(id);
      if (res.success) {
        toast.success(res.message);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete module');
    }
  };

  /* ==========================================================================
     USER MAPPING OPERATIONS
     ========================================================================== */

  const handleUserConfigureClick = (user) => {
    const existingMapping = userPanels.find((up) => up.userId?._id === user._id || up.userId === user._id);
    setConfiguringUser(user);
    setUserAssignForm({
      userId: user._id,
      panelId: existingMapping ? existingMapping.panelId?._id || existingMapping.panelId : '',
      branchId: existingMapping ? existingMapping.branchId || 'Main Branch' : 'Main Branch',
      customPermissions: existingMapping ? existingMapping.customPermissions || [] : [],
    });
  };

  const handleToggleUserOverride = (moduleId, actionField, currentValue) => {
    setUserAssignForm((prev) => {
      const cPerms = [...prev.customPermissions];
      const existingIdx = cPerms.findIndex((cp) => cp.moduleId === moduleId || cp.moduleId?._id === moduleId);

      const targetVal = currentValue === undefined ? true : currentValue === true ? false : undefined;

      if (existingIdx >= 0) {
        const item = { ...cPerms[existingIdx] };
        item[actionField] = targetVal;

        if (item.can_view === undefined && item.can_add === undefined && item.can_edit === undefined && item.can_delete === undefined) {
          cPerms.splice(existingIdx, 1);
        } else {
          cPerms[existingIdx] = item;
        }
      } else if (targetVal !== undefined) {
        cPerms.push({
          moduleId,
          [actionField]: targetVal,
        });
      }

      return { ...prev, customPermissions: cPerms };
    });
  };

  const handleSaveUserAssignment = async (e) => {
    e.preventDefault();
    if (!userAssignForm.panelId) {
      toast.error('Please assign a workspace panel first');
      return;
    }
    
    // DUMMY FUNCTIONALITY FOR NOW
    toast.success(`Access settings saved for '${configuringUser.name}' (Dummy mode)`);
    setConfiguringUser(null);
    
    /* ORIGINAL API CALL
    try {
      const res = await rbacApi.assignUserPanel(userAssignForm);
      if (res.success) {
        toast.success(`Access settings saved for '${configuringUser.name}'`);
        setConfiguringUser(null);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign user access');
    }
    */
  };

  const handleRevokeUserAccess = async (id) => {
    if (!window.confirm('Are you sure you want to revoke all panel and override permissions for this user?')) return;
    try {
      const res = await rbacApi.removeUserPanel(id);
      if (res.success) {
        toast.success(res.message);
        await loadAllData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke user access');
    }
  };

  const renderIcon = (iconName) => {
    const matched = AVAILABLE_ICONS.find((i) => i.name === iconName);
    const IconComp = matched ? matched.component : Layers;
    return <IconComp size={16} className="inline mr-1" />;
  };

  // Filters
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(userSearch.toLowerCase());

    let matchLocation = true;
    if (selectedLocation.state && selectedLocation.state !== 'all') {
      if (selectedLocation.district && selectedLocation.district !== 'all') {
        matchLocation = u.district === selectedLocation.district;
      } else if (selectedLocation.cluster && selectedLocation.cluster !== 'all') {
        matchLocation = u.cluster === selectedLocation.cluster;
      } else {
        matchLocation = u.state === selectedLocation.state;
      }
    } else if (selectedLocation.country && selectedLocation.country !== 'all') {
      matchLocation = u.country === selectedLocation.country;
    }

    let matchType = true;
    if (userTypeFilter === 'system') {
      matchType = !u.isCompanyUser;
    } else if (userTypeFilter === 'company') {
      matchType = !!u.isCompanyUser;
    }

    return matchSearch && matchLocation && matchType;
  });

  const LocationCard = ({ title, subtitle, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${isSelected
        ? 'bg-[#82c5fa] border-blue-400 shadow-md text-gray-900'
        : 'bg-white border-gray-200 hover:border-[#82c5fa] hover:shadow-sm text-gray-800'
        }`}
    >
      <div className="font-bold mb-1 text-sm">{title}</div>
      <div className={`text-xs ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>{subtitle}</div>
    </div>
  );

  const filteredLogs = activityLogs.filter(
    (l) =>
      l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(logSearch.toLowerCase())
  );

  // Grouped modules for tree matrices
  const groupedModules = getGroupedModules();

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header Widget */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="text-blue-600" size={32} />
            Role-Based Access Control
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Dynamically configure workspace panels, routes, hierarchical modules, permission matrix, and user-level overrides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition text-sm font-semibold text-slate-600 shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync System
          </button>
          {isMatrixDirty && (
            <button
              onClick={handleSaveMatrix}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-sm font-semibold text-white shadow-md shadow-emerald-100"
            >
              <Check size={16} />
              Save Matrix Changes
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher Widget */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-2">
        {[
          // { id: 'matrix', label: 'Permission Matrix Grid', icon: Shield },
          { id: 'panels', label: 'Panel Roles Registry', icon: Layers },
          { id: 'modules', label: 'Dynamic Module registry', icon: Settings },
          { id: 'users', label: 'User Workspace Mapping', icon: Users },
          // { id: 'logs', label: 'Audit Log Viewer', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700 bg-white font-extrabold shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      {loading && panels.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-center">
            <RefreshCw className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
            <p className="text-slate-500 font-medium">Syncing system database configurations...</p>
          </div>
        </div>
      ) : (
        <div className="transition-all duration-300">
          {/* TAB 1: PERMISSION MATRIX */}
          {/* SECTION COMMENTED OUT: To enable, remove "false &&" below */}
          {false && activeTab === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center flex-wrap gap-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold">Dynamic Hierarchical Permission Matrix</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Assign global module and submodule access rules. Submodules are visually grouped under their respective parents.
                  </p>
                </div>
                {isMatrixDirty && (
                  <div className="text-amber-400 text-sm font-semibold flex items-center gap-1.5 animate-pulse">
                    <CheckSquare size={16} />
                    Unsaved permissions matrix changes detected!
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {/* Sticky left column for Panel Name */}
                      <th className="py-4 px-6 font-bold text-slate-700 text-sm sticky left-0 z-20 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[250px] w-[250px]">
                        Panel Roles
                      </th>
                      
                      {/* Module Columns */}
                      {groupedModules.map((mod) => {
                        if (mod.isSubmodule) {
                          const pId = mod.parentModule?._id || mod.parentModule;
                          if (!expandedMatrixRows[pId]) {
                            return null;
                          }
                        }

                        const isExpanded = !!expandedMatrixRows[mod._id];
                        const hasChildren = !mod.isSubmodule && groupedModules.some(c => c.isSubmodule && (c.parentModule === mod._id || c.parentModule?._id === mod._id));

                        return (
                          <th 
                            key={mod._id} 
                            className={`py-3 px-4 border-l border-slate-200 text-center min-w-[170px] max-w-[200px] ${mod.isSubmodule ? 'bg-slate-100/50' : 'bg-slate-50'} ${!mod.isSubmodule && hasChildren ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''}`}
                            onClick={() => {
                              if (!mod.isSubmodule && hasChildren) toggleMatrixRow(mod._id);
                            }}
                          >
                            <div className="flex items-center justify-center gap-1.5 select-none">
                              {!mod.isSubmodule && hasChildren && (
                                <span className={`text-slate-400 text-[10px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                              )}
                              {mod.isSubmodule && <span className="text-slate-400">↳</span>}
                              {renderIcon(mod.icon)}
                              <span className="font-extrabold text-slate-800 text-sm truncate" title={mod.name}>{mod.name}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {panels.map((panel) => (
                      <tr key={panel._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors bg-white">
                        <td className="py-4 px-6 text-slate-800 flex flex-col justify-center sticky left-0 z-10 bg-inherit border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="font-extrabold text-blue-900 text-sm uppercase tracking-wide">{formatPanelName(panel.name)}</div>
                          <div className="text-xs text-slate-400 font-normal lowercase mb-1.5">{panel.key}</div>
                          <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider w-fit">
                            {panel.level || 'Country'} Level
                          </span>
                        </td>
                        
                        {groupedModules.map((mod) => {
                          if (mod.isSubmodule) {
                            const pId = mod.parentModule?._id || mod.parentModule;
                            if (!expandedMatrixRows[pId]) {
                              return null;
                            }
                          }

                          const matrixKey = `${panel._id}_${mod._id}`;
                          const permState = matrixState[matrixKey] || {
                            can_view: false,
                            can_add: false,
                            can_edit: false,
                            can_delete: false,
                          };

                          return (
                            <td key={mod._id} className={`py-3 px-4 border-l border-slate-100 text-center ${mod.isSubmodule ? 'bg-slate-50/50' : ''}`}>
                              <div className="grid grid-cols-4 gap-1 select-none w-[160px] mx-auto">
                                {/* View */}
                                {/* <label className="flex flex-col items-center cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition">
                                  <input
                                    type="checkbox"
                                    checked={permState.can_view}
                                    onChange={(e) => handleMatrixCellChange(panel._id, mod._id, 'can_view', e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                  />
                                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">View</span>
                                </label> */}

                                {/* Add */}
                                {/* <label className="flex flex-col items-center cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition">
                                  <input
                                    type="checkbox"
                                    checked={permState.can_add}
                                    onChange={(e) => handleMatrixCellChange(panel._id, mod._id, 'can_add', e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                  />
                                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Add</span>
                                </label> */}

                                {/* Edit */}
                                {/* <label className="flex flex-col items-center cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition">
                                  <input
                                    type="checkbox"
                                    checked={permState.can_edit}
                                    onChange={(e) => handleMatrixCellChange(panel._id, mod._id, 'can_edit', e.target.checked)}
                                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                                  />
                                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Edit</span>
                                </label> */}

                                {/* Delete */}
                                {/* <label className="flex flex-col items-center cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition">
                                  <input
                                    type="checkbox"
                                    checked={permState.can_delete}
                                    onChange={(e) => handleMatrixCellChange(panel._id, mod._id, 'can_delete', e.target.checked)}
                                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                                  />
                                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Del</span>
                                </label> */}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PANELS LIST & BUILDER */}
          {activeTab === 'panels' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Creator Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus className="text-blue-600" size={20} />
                  Add Workspace Panel
                </h3>
                <form onSubmit={handleCreatePanel} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Panel/Role Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                      placeholder="e.g. Account Manager, Partner Manager"
                      value={panelForm.name}
                      onChange={(e) => setPanelForm({ ...panelForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Level</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                      value={panelForm.level}
                      onChange={(e) => setPanelForm({ ...panelForm, level: e.target.value })}
                    >
                      <option value="Country">Country</option>
                      <option value="State">State</option>
                      <option value="Cluster">Cluster</option>
                      <option value="District">District</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-100"
                  >
                    Add Panel & Initialize Defaults
                  </button>
                </form>
              </div>

              {/* List Card */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Workspace Panels Registry</h3>
                {panels.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No panels registered yet.</div>
                ) : (
                  <div className="space-y-3">
                    {panels.map((panel) => {
                      let displayModules = [];
                      const pName = panel.name.toLowerCase();
                      
                      if (pName.includes('account')) {
                        displayModules = [
                          { _id: 'am_1', name: 'Dashboard' },
                          { _id: 'am_2', name: 'My Task' },
                          { _id: 'am_3', name: 'Order Journey', parentModule: 'am_2' },
                          { _id: 'am_4', name: 'Replacement Order', parentModule: 'am_2' },
                          { _id: 'am_5', name: 'Warehouse Vendor Pay', parentModule: 'am_2' },
                          { _id: 'am_6', name: 'Vendor Contract Pay', parentModule: 'am_2' },
                          { _id: 'am_7', name: 'Track CP Payments', parentModule: 'am_2' },
                          { _id: 'am_8', name: 'Service', parentModule: 'am_2' },
                          { _id: 'am_9', name: 'Solar Panel Bundle Plan' },
                          { _id: 'am_10', name: 'Procurement Plan' },
                          { _id: 'am_11', name: 'Report' },
                        ];
                      } else if (pName.includes('delivery')) {
                        displayModules = [
                          { _id: 'del_1', name: 'Dashboard' },
                          { _id: 'del_2', name: 'My Task' },
                          { _id: 'del_3', name: 'InWard', parentModule: 'del_2' },
                          { _id: 'del_4', name: 'At Warehouse', parentModule: 'del_2' },
                          { _id: 'del_5', name: 'Delivery Management' },
                          { _id: 'del_6', name: 'Replacement Order' },
                          { _id: 'del_7', name: 'Return Products', parentModule: 'del_6' },
                          { _id: 'del_8', name: 'Replace Products', parentModule: 'del_6' },
                          { _id: 'del_9', name: 'Service Ticket', parentModule: 'del_6' },
                          { _id: 'del_10', name: 'Report' },
                        ];
                      } else if (pName.includes('partner manager') || pName.includes('franchisee manager')) {
                        displayModules = [
                          { _id: 'pm_1', name: 'Dashboard' },
                          { _id: 'pm_2', name: 'Leads' },
                          { _id: 'pm_3', name: 'Lead Management' },
                          { _id: 'pm_4', name: 'My Task' },
                          { _id: 'pm_4_1', name: 'App Demo', parentModule: 'pm_4' },
                          { _id: 'pm_4_2', name: 'Franchisee Onboarding', parentModule: 'pm_4' },
                          { _id: 'pm_4_3', name: 'Project Management', parentModule: 'pm_4' },
                          { _id: 'pm_4_4', name: 'Franchisee Performance', parentModule: 'pm_4' },
                          { _id: 'pm_5', name: 'Franchisee Onboarding Goals' },
                          { _id: 'pm_6', name: 'Franchisee Setting' },
                          { _id: 'pm_7', name: 'Dealer Management' },
                          { _id: 'pm_8', name: 'Raise Ticket' },
                          { _id: 'pm_9', name: 'Find Resources' },
                          { _id: 'pm_10', name: 'Report' },
                        ];
                      } else if (pName.includes('partner') || pName.includes('franchisee')) {
                        displayModules = [
                          { _id: 'pt_1', name: 'Dashboard' },
                          { _id: 'pt_2', name: 'Project Signup' },
                          { _id: 'pt_3', name: 'Project Management' },
                          { _id: 'pt_4', name: 'Survey Bom' },
                          { _id: 'pt_5', name: 'District Manager' },
                          { _id: 'pt_6', name: 'Dealer Manager' },
                          { _id: 'pt_7', name: 'Lead Partner' },
                          { _id: 'pt_8', name: 'My Team' },
                          { _id: 'pt_9', name: 'Account' },
                          { _id: 'pt_10', name: 'Solarkits' },
                          { _id: 'pt_11', name: 'Settings' },
                        ];
                      } else if (pName.includes('admin')) {
                        displayModules = [
                          { _id: 'ad_1', name: 'Dashboard' },
                          { _id: 'ad_1_1', name: 'User Performance', parentModule: 'ad_1' },
                          { _id: 'ad_1_1_1', name: 'Partner Manager Dashboard', parentModule: 'ad_1_1' },
                          { _id: 'ad_1_1_2', name: 'Partner Dashboard', parentModule: 'ad_1_1' },
                          { _id: 'ad_1_2', name: 'Orders', parentModule: 'ad_1' },
                          { _id: 'ad_1_3', name: 'Orders by Loan', parentModule: 'ad_1' },
                          { _id: 'ad_1_4', name: 'Installer', parentModule: 'ad_1' },
                          { _id: 'ad_1_5', name: 'Delivery', parentModule: 'ad_1' },
                          { _id: 'ad_1_6', name: 'Inventory', parentModule: 'ad_1' },
                          { _id: 'ad_1_7', name: 'Vendors', parentModule: 'ad_1' },
                          { _id: 'ad_1_8', name: 'Project Report', parentModule: 'ad_1' },
                          
                          { _id: 'ad_2', name: 'Departments' },
                          { _id: 'ad_2_1', name: 'Organization chart', parentModule: 'ad_2' },
                          
                          { _id: 'ad_3', name: 'Approvals' },
                          
                          { _id: 'ad_4', name: 'Project Management' },
                          { _id: 'ad_4_1', name: 'Company', parentModule: 'ad_4' },
                          { _id: 'ad_4_1_1', name: 'Management', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_1_2', name: 'Install', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_1_3', name: 'Service', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_1_4', name: 'Track Service', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_2', name: 'Partners', parentModule: 'ad_4' },
                          { _id: 'ad_4_2_1', name: 'Management', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_2_2', name: 'Install', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_2_3', name: 'Service', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_2_4', name: 'Track Service', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_3', name: 'Installer Agency', parentModule: 'ad_4' },
                          { _id: 'ad_4_3_1', name: 'Management', parentModule: 'ad_4_3' },
                          { _id: 'ad_4_3_2', name: 'Install', parentModule: 'ad_4_3' },
                          { _id: 'ad_4_3_3', name: 'Service', parentModule: 'ad_4_3' },
                          { _id: 'ad_4_3_4', name: 'Track Service', parentModule: 'ad_4_3' },

                          { _id: 'ad_5', name: 'Operations' },
                          { _id: 'ad_5_1', name: 'Our Warehouse', parentModule: 'ad_5' },
                          { _id: 'ad_5_2', name: 'Add Inventory Request', parentModule: 'ad_5' },
                          { _id: 'ad_5_3', name: 'Inventory Management', parentModule: 'ad_5' },
                          { _id: 'ad_5_4', name: 'Brand Manufacturer', parentModule: 'ad_5' },
                          { _id: 'ad_5_4_1', name: 'Add Brand Manufacturer', parentModule: 'ad_5_4' },
                          { _id: 'ad_5_4_2', name: 'Brand Supplier Overview', parentModule: 'ad_5_4' },

                          { _id: 'ad_6', name: 'Settings' },
                          { _id: 'ad_6_1', name: 'Location Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_1_1', name: 'Setup Locations', parentModule: 'ad_6_1' },
                          
                          { _id: 'ad_6_2', name: 'HR Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_2_1', name: 'Role Settings', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_2', name: 'Create Department', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_3', name: 'Department-wise Modules', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_4', name: 'Panels - select level wise panels', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_5', name: 'Temporary Incharge Setting', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_6', name: 'Leave Approvals', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_7', name: 'Resign Approvals', parentModule: 'ad_6_2' },
                          
                          { _id: 'ad_6_3', name: 'Vendor Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_3_1', name: 'Installer Vendors', parentModule: 'ad_6_3' },
                          { _id: 'ad_6_3_2', name: 'Supplier Type', parentModule: 'ad_6_3' },
                          { _id: 'ad_6_3_3', name: 'Supplier Vendors', parentModule: 'ad_6_3' },
                          
                          { _id: 'ad_6_4', name: 'Sales Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_4_1', name: 'Set Price', parentModule: 'ad_6_4' },
                          { _id: 'ad_6_4_2', name: 'Set Price For AMC', parentModule: 'ad_6_4' },
                          { _id: 'ad_6_4_3', name: 'Offers', parentModule: 'ad_6_4' },
                          { _id: 'ad_6_4_4', name: 'Solar Panel Bundle Setting', parentModule: 'ad_6_4' },
                          
                          { _id: 'ad_6_5', name: 'Marketing Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_5_1', name: 'Campaign Management', parentModule: 'ad_6_5' },
                          
                          { _id: 'ad_6_6', name: 'Settings Operations', parentModule: 'ad_6' },
                          { _id: 'ad_6_6_1', name: 'Delivery Settings', parentModule: 'ad_6_6' },
                          { _id: 'ad_6_6_1_1', name: 'Delivery Type', parentModule: 'ad_6_6_1' },
                          { _id: 'ad_6_6_1_2', name: 'Vehicle Selection', parentModule: 'ad_6_6_1' },
                          { _id: 'ad_6_6_1_3', name: 'Vendor Delivery Plan', parentModule: 'ad_6_6_1' },
                          { _id: 'ad_6_6_2', name: 'Inventory Management', parentModule: 'ad_6_6' },
                          { _id: 'ad_6_6_2_1', name: 'Inventory Overview', parentModule: 'ad_6_6_2' },
                          { _id: 'ad_6_6_2_2', name: 'Restock Order Limit', parentModule: 'ad_6_6_2' },
                          { _id: 'ad_6_6_2_3', name: 'Combokit Brand Overview', parentModule: 'ad_6_6_2' },
                          { _id: 'ad_6_6_3', name: 'Order Procurement', parentModule: 'ad_6_6' },
                          { _id: 'ad_6_6_3_1', name: 'Order Procurement', parentModule: 'ad_6_6_3' },
                          
                          { _id: 'ad_6_7', name: 'Installer Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_7_1', name: 'Solar Installer', parentModule: 'ad_6_7' },
                          { _id: 'ad_6_7_2', name: 'Installer Tool Requirements', parentModule: 'ad_6_7' },
                          { _id: 'ad_6_7_3', name: 'Rating Setting', parentModule: 'ad_6_7' },
                          { _id: 'ad_6_7_4', name: 'Installer Agency Plans', parentModule: 'ad_6_7' },
                          
                          { _id: 'ad_6_8', name: 'Product Configuration', parentModule: 'ad_6' },
                          { _id: 'ad_6_8_1', name: 'Add Project Type', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_2', name: 'Add Project Category', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_3', name: 'Add Product', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_4', name: 'SKU', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_5', name: 'Price Master', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_6', name: 'Add Unit Management', parentModule: 'ad_6_8' },
                          
                          { _id: 'ad_6_9', name: 'ComboKit', parentModule: 'ad_6' },
                          { _id: 'ad_6_9_1', name: 'Create Solarkit', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_2', name: 'Create AMC Plans', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_3', name: 'AMC Services', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_4', name: 'Solarkit Bundle Plans', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_5', name: 'Add ComboKit', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_6', name: 'Customize Combokit', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_7', name: 'Combokit Overview', parentModule: 'ad_6_9' },
                          
                          { _id: 'ad_6_10', name: 'Partner Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_10_1', name: 'Partner Plans', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_2', name: 'Partner Points & Reward Setting', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_3', name: 'Partner Onboarding Goals', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_4', name: 'Partner Profession Type', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_5', name: 'Add Partner', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_6', name: 'Partner Manager Setting', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_7', name: 'Partner Buy Lead Setting', parentModule: 'ad_6_10' },
                          
                          { _id: 'ad_6_11', name: 'HRMS Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_11_1', name: 'HRMS Settings', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_2', name: 'Vacancy Module', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_3', name: 'Candidates List', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_4', name: 'Candidate Test Setting', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_5', name: 'Candidate Training Setting', parentModule: 'ad_6_11' },
                          
                          { _id: 'ad_6_12', name: 'Project Management Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_12_1', name: 'Project Journey Stage Setting', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_2', name: 'Project Management Overdue Setting', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_3', name: 'Project Management Configuration', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_4', name: 'Project Documentation Setting', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_5', name: 'Placeholder Name Setting', parentModule: 'ad_6_12' },
                          
                          { _id: 'ad_6_13', name: 'Quote', parentModule: 'ad_6' },
                          { _id: 'ad_6_13_1', name: 'Quote Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_2', name: 'Survey BOM Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_3', name: 'Terrace Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_4', name: 'Structure Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_5', name: 'Building Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_6', name: 'Discom Master', parentModule: 'ad_6_13' },
                          
                          { _id: 'ad_6_14', name: 'Overdue Setting', parentModule: 'ad_6' },
                          { _id: 'ad_6_14_1', name: 'Approval Overdue Setting', parentModule: 'ad_6_14' },
                          { _id: 'ad_6_14_2', name: 'Overdue Task Setting', parentModule: 'ad_6_14' },
                          { _id: 'ad_6_14_3', name: 'Overdue Status Setting', parentModule: 'ad_6_14' },
                          
                          { _id: 'ad_6_15', name: 'Loan Setting', parentModule: 'ad_6' },
                          { _id: 'ad_6_16', name: 'Checklist Setting', parentModule: 'ad_6' },

                          { _id: 'ad_7', name: 'Report' },
                          { _id: 'ad_7_1', name: 'Financial & P&L', parentModule: 'ad_7' },
                          { _id: 'ad_7_2', name: 'Cashflow', parentModule: 'ad_7' },
                          { _id: 'ad_7_3', name: 'Inventory', parentModule: 'ad_7' },
                          { _id: 'ad_7_4', name: 'Loans', parentModule: 'ad_7' },
                          { _id: 'ad_7_5', name: 'Captable', parentModule: 'ad_7' },
                          { _id: 'ad_7_6', name: 'Revenue By CP Types', parentModule: 'ad_7' },
                          { _id: 'ad_7_7', name: 'Cluster', parentModule: 'ad_7' },
                          { _id: 'ad_7_8', name: 'District', parentModule: 'ad_7' },
                          { _id: 'ad_7_9', name: 'City', parentModule: 'ad_7' },
                        ];
                      } else {
                        displayModules = modules.filter(mod => {
                          const perm = matrixState[`${panel._id}_${mod._id}`];
                          return perm && (perm.can_view || perm.can_add || perm.can_edit || perm.can_delete);
                        });
                      }

                      return (
                      <div
                        key={panel._id}
                        className="flex flex-col sm:flex-row justify-between items-start p-4 rounded-xl border border-slate-150 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition gap-4"
                      >
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 text-base">{formatPanelName(panel.name)}</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">
                              {panel.key}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">
                              {panel.level || 'Country'} Level
                            </span>
                          </div>
                          <div className="mt-4">
                            <p className="text-xs font-bold text-slate-600 mb-2">Modules Overview:</p>
                            <div className="w-full">
                              {(() => {
                                if (displayModules.length === 0) {
                                  return <span className="text-xs text-slate-400 italic">No modules assigned</span>;
                                }

                                const moduleIds = new Set(displayModules.map(m => m._id));
                                const roots = [];
                                const childrenMap = {};
                                
                                displayModules.forEach(m => {
                                  let parentId = m.parentModule;
                                  if (typeof parentId === 'object' && parentId !== null) {
                                    parentId = parentId._id;
                                  }
                                  
                                  if (parentId && moduleIds.has(parentId)) {
                                    if (!childrenMap[parentId]) childrenMap[parentId] = [];
                                    childrenMap[parentId].push(m);
                                  } else {
                                    roots.push(m);
                                  }
                                });

                                const renderTree = (nodes) => {
                                  return nodes.map(node => {
                                    const children = childrenMap[node._id];
                                    const hasChildren = children && children.length > 0;
                                    
                                    if (!hasChildren) {
                                      return (
                                        <div key={node._id} className="text-[11px] font-semibold text-slate-600 py-0.5 flex items-center before:content-[''] before:w-1 before:h-1 before:bg-slate-400 before:rounded-full before:mr-2">
                                          {node.name}
                                        </div>
                                      );
                                    }

                                    return (
                                      <details key={node._id} className="group/sub mb-1 mt-1 first:mt-0 last:mb-0">
                                        <summary className="flex items-center gap-1.5 cursor-pointer py-0.5 list-none [&::-webkit-details-marker]:hidden select-none hover:text-blue-600">
                                          <span className="text-slate-400 group-open/sub:rotate-90 transition-transform text-[8px] mt-[1px]">▶</span>
                                          <span className="text-[11px] font-bold text-slate-700 group-hover/sub:text-blue-600 transition-colors">{node.name}</span>
                                          <span className="text-[9px] bg-blue-100/50 text-blue-600 px-1 rounded-sm ml-auto font-bold">{children.length}</span>
                                        </summary>
                                        <div className="pl-3.5 ml-1 border-l border-slate-200 flex flex-col gap-0.5 mt-1 mb-1">
                                          {renderTree(children)}
                                        </div>
                                      </details>
                                    );
                                  });
                                };

                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {roots.map(root => {
                                      const hasChildren = childrenMap[root._id] && childrenMap[root._id].length > 0;
                                      
                                      if (!hasChildren) {
                                        return (
                                          <div key={root._id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                            <span className="font-bold text-xs text-slate-700">{root.name}</span>
                                          </div>
                                        );
                                      }

                                      return (
                                        <details key={root._id} className="group bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-fit">
                                          <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 transition-colors list-none [&::-webkit-details-marker]:hidden select-none">
                                            <div className="flex items-center gap-2">
                                              <span className="text-slate-400 group-open:rotate-90 transition-transform text-[10px]">▶</span>
                                              <span className="font-bold text-xs text-slate-700">{root.name}</span>
                                            </div>
                                            <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                              {childrenMap[root._id].length} sub
                                            </span>
                                          </summary>
                                          <div className="p-2 border-t border-slate-100 bg-slate-50 flex flex-col gap-1 pl-4">
                                            {renderTree(childrenMap[root._id])}
                                          </div>
                                        </details>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:self-center">
                          {/* Clone Button */}
                          <button
                            onClick={() =>
                              setCloningPanel({
                                sourcePanelId: panel._id,
                                targetName: '',
                                targetLevel: panel.level || 'Country',
                              })
                            }
                            className="p-2 hover:bg-white text-blue-600 rounded-lg hover:shadow-sm border border-transparent hover:border-slate-200 transition"
                            title="Clone Panel Rights"
                          >
                            <Copy size={16} />
                          </button>
                          {/* Edit Trigger */}
                          <button
                            onClick={() => setEditingPanel(panel)}
                            className="p-2 hover:bg-white text-amber-600 rounded-lg hover:shadow-sm border border-transparent hover:border-slate-200 transition"
                            title="Edit Details"
                          >
                            <Edit2 size={16} />
                          </button>
                          {/* Delete Trigger */}
                          {panel.key !== 'admin' && (
                            <button
                              onClick={() => handleDeletePanel(panel._id)}
                              className="p-2 hover:bg-white text-rose-600 rounded-lg hover:shadow-sm border border-transparent hover:border-slate-200 transition"
                              title="Delete Panel"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC MODULE REGISTRY */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Builder Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus className="text-blue-600" size={20} />
                  Register Module
                </h3>
                <form onSubmit={handleCreateModule} className="space-y-4">
                  {/* Module Type Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Module Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModuleForm({ ...moduleForm, moduleType: 'parent', parentModule: '' })}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          moduleForm.moduleType === 'parent'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Main Module (Parent)
                      </button>
                      <button
                        type="button"
                        onClick={() => setModuleForm({ ...moduleForm, moduleType: 'submodule' })}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          moduleForm.moduleType === 'submodule'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Submodule (Child)
                      </button>
                    </div>
                  </div>

                  {/* Select Panel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Panel <span className="text-rose-500">*</span></label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                      value={moduleForm.panelId || ''}
                      onChange={(e) => setModuleForm({ ...moduleForm, panelId: e.target.value, parentModule: '' })}
                      required
                    >
                      <option value="">-- Choose Panel --</option>
                      {panels.map((p) => (
                        <option key={p._id} value={p._id}>
                          {formatPanelName(p.name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Parent Module Selection Dropdown (Only shown if submodule is selected) */}
                  {moduleForm.moduleType === 'submodule' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Select Parent Module <span className="text-rose-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                        value={moduleForm.parentModule}
                        onChange={(e) => setModuleForm({ ...moduleForm, parentModule: e.target.value })}
                        required
                        disabled={!moduleForm.panelId}
                      >
                        <option value="">
                          {!moduleForm.panelId ? '-- Select a Panel First --' : '-- Choose Parent Module --'}
                        </option>
                        {(() => {
                          if (!moduleForm.panelId) return null;
                          const selectedPanel = panels.find(p => p._id === moduleForm.panelId);
                          const staticList = selectedPanel ? getStaticModulesForPanelName(selectedPanel.name).filter(sm => !sm.parentModule) : [];
                          
                          const options = [];
                          
                          // Add static modules for the selected panel, checking if they exist in DB
                          staticList.forEach(sm => {
                            const dbModule = modules.find(m => !m.parentModule && m.name === sm.name);
                            if (dbModule) {
                              options.push(dbModule);
                            } else {
                              options.push({ _id: `STATIC_${sm.name}`, name: sm.name });
                            }
                          });

                          // Add DB modules that aren't in staticList but have explicit permissions
                          modules.filter(m => !m.parentModule).forEach(m => {
                            const perm = matrixState[`${moduleForm.panelId}_${m._id}`];
                            const hasExplicitPerm = perm && (perm.can_view || perm.can_add || perm.can_edit || perm.can_delete);
                            const isAlreadyInOptions = options.some(opt => opt.name === m.name);
                            
                            if (hasExplicitPerm && !isAlreadyInOptions) {
                              options.push(m);
                            }
                          });

                          return options.map((p) => (
                            <option key={p._id} value={p._id}>
                              {formatPanelName(p.name)}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Module Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                      placeholder="e.g. Invoices, Earnings"
                      value={moduleForm.name}
                      onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Standardised Key</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold font-mono"
                      placeholder="e.g. invoices, earnings"
                      value={moduleForm.key}
                      onChange={(e) => setModuleForm({ ...moduleForm, key: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Route Path</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                      placeholder="e.g. /account-manager/invoices"
                      value={moduleForm.route}
                      onChange={(e) => setModuleForm({ ...moduleForm, route: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sidebar Icon</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm"
                      value={moduleForm.icon}
                      onChange={(e) => setModuleForm({ ...moduleForm, icon: e.target.value })}
                    >
                      {AVAILABLE_ICONS.map((ico) => (
                        <option key={ico.name} value={ico.name}>
                          {ico.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm"
                      placeholder="Module description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-100"
                  >
                    Register Dynamic Module
                  </button>
                </form>
              </div>

              {/* Module List Directory */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Modules Directory</h3>
                    <p className="text-xs text-slate-400 mt-1">Hierarchical tree representation of all system sections and sub-modules.</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold rounded-lg border border-blue-100">
                    {modules.filter(m => !m.parentModule).length} Modules | {modules.filter(m => m.parentModule).length} Submodules
                  </span>
                </div>

                {panels.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    No panels registered yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
                    {panels.map((panel) => {
                      let displayModules = [];
                      const pName = panel.name.toLowerCase();
                      
                      if (pName.includes('account')) {
                        displayModules = [
                          { _id: 'am_1', name: 'Dashboard' },
                          { _id: 'am_2', name: 'My Task' },
                          { _id: 'am_3', name: 'Order Journey', parentModule: 'am_2' },
                          { _id: 'am_4', name: 'Replacement Order', parentModule: 'am_2' },
                          { _id: 'am_5', name: 'Warehouse Vendor Pay', parentModule: 'am_2' },
                          { _id: 'am_6', name: 'Vendor Contract Pay', parentModule: 'am_2' },
                          { _id: 'am_7', name: 'Track CP Payments', parentModule: 'am_2' },
                          { _id: 'am_8', name: 'Service', parentModule: 'am_2' },
                          { _id: 'am_9', name: 'Solar Panel Bundle Plan' },
                          { _id: 'am_10', name: 'Procurement Plan' },
                          { _id: 'am_11', name: 'Report' },
                        ];
                      } else if (pName.includes('delivery')) {
                        displayModules = [
                          { _id: 'del_1', name: 'Dashboard' },
                          { _id: 'del_2', name: 'My Task' },
                          { _id: 'del_3', name: 'InWard', parentModule: 'del_2' },
                          { _id: 'del_4', name: 'At Warehouse', parentModule: 'del_2' },
                          { _id: 'del_5', name: 'Delivery Management' },
                          { _id: 'del_6', name: 'Replacement Order' },
                          { _id: 'del_7', name: 'Return Products', parentModule: 'del_6' },
                          { _id: 'del_8', name: 'Replace Products', parentModule: 'del_6' },
                          { _id: 'del_9', name: 'Service Ticket', parentModule: 'del_6' },
                          { _id: 'del_10', name: 'Report' },
                        ];
                      } else if (pName.includes('partner manager') || pName.includes('franchisee manager')) {
                        displayModules = [
                          { _id: 'pm_1', name: 'Dashboard' },
                          { _id: 'pm_2', name: 'Leads' },
                          { _id: 'pm_3', name: 'Lead Management' },
                          { _id: 'pm_4', name: 'My Task' },
                          { _id: 'pm_4_1', name: 'App Demo', parentModule: 'pm_4' },
                          { _id: 'pm_4_2', name: 'Franchisee Onboarding', parentModule: 'pm_4' },
                          { _id: 'pm_4_3', name: 'Project Management', parentModule: 'pm_4' },
                          { _id: 'pm_4_4', name: 'Franchisee Performance', parentModule: 'pm_4' },
                          { _id: 'pm_5', name: 'Franchisee Onboarding Goals' },
                          { _id: 'pm_6', name: 'Franchisee Setting' },
                          { _id: 'pm_7', name: 'Dealer Management' },
                          { _id: 'pm_8', name: 'Raise Ticket' },
                          { _id: 'pm_9', name: 'Find Resources' },
                          { _id: 'pm_10', name: 'Report' },
                        ];
                      } else if (pName.includes('partner') || pName.includes('franchisee')) {
                        displayModules = [
                          { _id: 'pt_1', name: 'Dashboard' },
                          { _id: 'pt_2', name: 'Project Signup' },
                          { _id: 'pt_3', name: 'Project Management' },
                          { _id: 'pt_4', name: 'Survey Bom' },
                          { _id: 'pt_5', name: 'District Manager' },
                          { _id: 'pt_6', name: 'Dealer Manager' },
                          { _id: 'pt_7', name: 'Lead Partner' },
                          { _id: 'pt_8', name: 'My Team' },
                          { _id: 'pt_9', name: 'Account' },
                          { _id: 'pt_10', name: 'Solarkits' },
                          { _id: 'pt_11', name: 'Settings' },
                        ];
                      } else if (pName.includes('admin')) {
                        displayModules = [
                          { _id: 'ad_1', name: 'Dashboard' },
                          { _id: 'ad_1_1', name: 'User Performance', parentModule: 'ad_1' },
                          { _id: 'ad_1_1_1', name: 'Partner Manager Dashboard', parentModule: 'ad_1_1' },
                          { _id: 'ad_1_1_2', name: 'Partner Dashboard', parentModule: 'ad_1_1' },
                          { _id: 'ad_1_2', name: 'Orders', parentModule: 'ad_1' },
                          { _id: 'ad_1_3', name: 'Orders by Loan', parentModule: 'ad_1' },
                          { _id: 'ad_1_4', name: 'Installer', parentModule: 'ad_1' },
                          { _id: 'ad_1_5', name: 'Delivery', parentModule: 'ad_1' },
                          { _id: 'ad_1_6', name: 'Inventory', parentModule: 'ad_1' },
                          { _id: 'ad_1_7', name: 'Vendors', parentModule: 'ad_1' },
                          { _id: 'ad_1_8', name: 'Project Report', parentModule: 'ad_1' },
                          
                          { _id: 'ad_2', name: 'Departments' },
                          { _id: 'ad_2_1', name: 'Organization chart', parentModule: 'ad_2' },
                          
                          { _id: 'ad_3', name: 'Approvals' },
                          
                          { _id: 'ad_4', name: 'Project Management' },
                          { _id: 'ad_4_1', name: 'Company', parentModule: 'ad_4' },
                          { _id: 'ad_4_1_1', name: 'Management', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_1_2', name: 'Install', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_1_3', name: 'Service', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_1_4', name: 'Track Service', parentModule: 'ad_4_1' },
                          { _id: 'ad_4_2', name: 'Partners', parentModule: 'ad_4' },
                          { _id: 'ad_4_2_1', name: 'Management', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_2_2', name: 'Install', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_2_3', name: 'Service', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_2_4', name: 'Track Service', parentModule: 'ad_4_2' },
                          { _id: 'ad_4_3', name: 'Installer Agency', parentModule: 'ad_4' },
                          { _id: 'ad_4_3_1', name: 'Management', parentModule: 'ad_4_3' },
                          { _id: 'ad_4_3_2', name: 'Install', parentModule: 'ad_4_3' },
                          { _id: 'ad_4_3_3', name: 'Service', parentModule: 'ad_4_3' },
                          { _id: 'ad_4_3_4', name: 'Track Service', parentModule: 'ad_4_3' },

                          { _id: 'ad_5', name: 'Operations' },
                          { _id: 'ad_5_1', name: 'Our Warehouse', parentModule: 'ad_5' },
                          { _id: 'ad_5_2', name: 'Add Inventory Request', parentModule: 'ad_5' },
                          { _id: 'ad_5_3', name: 'Inventory Management', parentModule: 'ad_5' },
                          { _id: 'ad_5_4', name: 'Brand Manufacturer', parentModule: 'ad_5' },
                          { _id: 'ad_5_4_1', name: 'Add Brand Manufacturer', parentModule: 'ad_5_4' },
                          { _id: 'ad_5_4_2', name: 'Brand Supplier Overview', parentModule: 'ad_5_4' },

                          { _id: 'ad_6', name: 'Settings' },
                          { _id: 'ad_6_1', name: 'Location Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_1_1', name: 'Setup Locations', parentModule: 'ad_6_1' },
                          
                          { _id: 'ad_6_2', name: 'HR Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_2_1', name: 'Role Settings', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_2', name: 'Create Department', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_3', name: 'Department-wise Modules', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_4', name: 'Panels - select level wise panels', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_5', name: 'Temporary Incharge Setting', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_6', name: 'Leave Approvals', parentModule: 'ad_6_2' },
                          { _id: 'ad_6_2_7', name: 'Resign Approvals', parentModule: 'ad_6_2' },
                          
                          { _id: 'ad_6_3', name: 'Vendor Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_3_1', name: 'Installer Vendors', parentModule: 'ad_6_3' },
                          { _id: 'ad_6_3_2', name: 'Supplier Type', parentModule: 'ad_6_3' },
                          { _id: 'ad_6_3_3', name: 'Supplier Vendors', parentModule: 'ad_6_3' },
                          
                          { _id: 'ad_6_4', name: 'Sales Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_4_1', name: 'Set Price', parentModule: 'ad_6_4' },
                          { _id: 'ad_6_4_2', name: 'Set Price For AMC', parentModule: 'ad_6_4' },
                          { _id: 'ad_6_4_3', name: 'Offers', parentModule: 'ad_6_4' },
                          { _id: 'ad_6_4_4', name: 'Solar Panel Bundle Setting', parentModule: 'ad_6_4' },
                          
                          { _id: 'ad_6_5', name: 'Marketing Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_5_1', name: 'Campaign Management', parentModule: 'ad_6_5' },
                          
                          { _id: 'ad_6_6', name: 'Settings Operations', parentModule: 'ad_6' },
                          { _id: 'ad_6_6_1', name: 'Delivery Settings', parentModule: 'ad_6_6' },
                          { _id: 'ad_6_6_1_1', name: 'Delivery Type', parentModule: 'ad_6_6_1' },
                          { _id: 'ad_6_6_1_2', name: 'Vehicle Selection', parentModule: 'ad_6_6_1' },
                          { _id: 'ad_6_6_1_3', name: 'Vendor Delivery Plan', parentModule: 'ad_6_6_1' },
                          { _id: 'ad_6_6_2', name: 'Inventory Management', parentModule: 'ad_6_6' },
                          { _id: 'ad_6_6_2_1', name: 'Inventory Overview', parentModule: 'ad_6_6_2' },
                          { _id: 'ad_6_6_2_2', name: 'Restock Order Limit', parentModule: 'ad_6_6_2' },
                          { _id: 'ad_6_6_2_3', name: 'Combokit Brand Overview', parentModule: 'ad_6_6_2' },
                          { _id: 'ad_6_6_3', name: 'Order Procurement', parentModule: 'ad_6_6' },
                          { _id: 'ad_6_6_3_1', name: 'Order Procurement', parentModule: 'ad_6_6_3' },
                          
                          { _id: 'ad_6_7', name: 'Installer Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_7_1', name: 'Solar Installer', parentModule: 'ad_6_7' },
                          { _id: 'ad_6_7_2', name: 'Installer Tool Requirements', parentModule: 'ad_6_7' },
                          { _id: 'ad_6_7_3', name: 'Rating Setting', parentModule: 'ad_6_7' },
                          { _id: 'ad_6_7_4', name: 'Installer Agency Plans', parentModule: 'ad_6_7' },
                          
                          { _id: 'ad_6_8', name: 'Product Configuration', parentModule: 'ad_6' },
                          { _id: 'ad_6_8_1', name: 'Add Project Type', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_2', name: 'Add Project Category', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_3', name: 'Add Product', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_4', name: 'SKU', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_5', name: 'Price Master', parentModule: 'ad_6_8' },
                          { _id: 'ad_6_8_6', name: 'Add Unit Management', parentModule: 'ad_6_8' },
                          
                          { _id: 'ad_6_9', name: 'ComboKit', parentModule: 'ad_6' },
                          { _id: 'ad_6_9_1', name: 'Create Solarkit', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_2', name: 'Create AMC Plans', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_3', name: 'AMC Services', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_4', name: 'Solarkit Bundle Plans', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_5', name: 'Add ComboKit', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_6', name: 'Customize Combokit', parentModule: 'ad_6_9' },
                          { _id: 'ad_6_9_7', name: 'Combokit Overview', parentModule: 'ad_6_9' },
                          
                          { _id: 'ad_6_10', name: 'Partner Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_10_1', name: 'Partner Plans', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_2', name: 'Partner Points & Reward Setting', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_3', name: 'Partner Onboarding Goals', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_4', name: 'Partner Profession Type', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_5', name: 'Add Partner', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_6', name: 'Partner Manager Setting', parentModule: 'ad_6_10' },
                          { _id: 'ad_6_10_7', name: 'Partner Buy Lead Setting', parentModule: 'ad_6_10' },
                          
                          { _id: 'ad_6_11', name: 'HRMS Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_11_1', name: 'HRMS Settings', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_2', name: 'Vacancy Module', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_3', name: 'Candidates List', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_4', name: 'Candidate Test Setting', parentModule: 'ad_6_11' },
                          { _id: 'ad_6_11_5', name: 'Candidate Training Setting', parentModule: 'ad_6_11' },
                          
                          { _id: 'ad_6_12', name: 'Project Management Settings', parentModule: 'ad_6' },
                          { _id: 'ad_6_12_1', name: 'Project Journey Stage Setting', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_2', name: 'Project Management Overdue Setting', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_3', name: 'Project Management Configuration', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_4', name: 'Project Documentation Setting', parentModule: 'ad_6_12' },
                          { _id: 'ad_6_12_5', name: 'Placeholder Name Setting', parentModule: 'ad_6_12' },
                          
                          { _id: 'ad_6_13', name: 'Quote', parentModule: 'ad_6' },
                          { _id: 'ad_6_13_1', name: 'Quote Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_2', name: 'Survey BOM Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_3', name: 'Terrace Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_4', name: 'Structure Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_5', name: 'Building Setting', parentModule: 'ad_6_13' },
                          { _id: 'ad_6_13_6', name: 'Discom Master', parentModule: 'ad_6_13' },
                          
                          { _id: 'ad_6_14', name: 'Overdue Setting', parentModule: 'ad_6' },
                          { _id: 'ad_6_14_1', name: 'Approval Overdue Setting', parentModule: 'ad_6_14' },
                          { _id: 'ad_6_14_2', name: 'Overdue Task Setting', parentModule: 'ad_6_14' },
                          { _id: 'ad_6_14_3', name: 'Overdue Status Setting', parentModule: 'ad_6_14' },
                          
                          { _id: 'ad_6_15', name: 'Loan Setting', parentModule: 'ad_6' },
                          { _id: 'ad_6_16', name: 'Checklist Setting', parentModule: 'ad_6' },

                          { _id: 'ad_7', name: 'Report' },
                          { _id: 'ad_7_1', name: 'Financial & P&L', parentModule: 'ad_7' },
                          { _id: 'ad_7_2', name: 'Cashflow', parentModule: 'ad_7' },
                          { _id: 'ad_7_3', name: 'Inventory', parentModule: 'ad_7' },
                          { _id: 'ad_7_4', name: 'Loans', parentModule: 'ad_7' },
                          { _id: 'ad_7_5', name: 'Captable', parentModule: 'ad_7' },
                          { _id: 'ad_7_6', name: 'Revenue By CP Types', parentModule: 'ad_7' },
                          { _id: 'ad_7_7', name: 'Cluster', parentModule: 'ad_7' },
                          { _id: 'ad_7_8', name: 'District', parentModule: 'ad_7' },
                          { _id: 'ad_7_9', name: 'City', parentModule: 'ad_7' },
                        ];
                      }
                      
                      // Merge actual DB modules assigned to this panel
                      const dynamicModules = modules.filter(mod => {
                        const perm = matrixState[`${panel._id}_${mod._id}`];
                        return perm && (perm.can_view || perm.can_add || perm.can_edit || perm.can_delete);
                      });
                      
                      const allDisplayModules = [...displayModules];
                      dynamicModules.forEach(dm => {
                        if (!allDisplayModules.find(am => am._id === dm._id)) {
                          allDisplayModules.push(dm);
                        }
                      });
                      
                      if (allDisplayModules.length === 0) return null;

                      // Tree Processing
                      const moduleIds = new Set(allDisplayModules.map(m => m._id));
                      const roots = [];
                      const childrenMap = {};
                      
                      allDisplayModules.forEach(m => {
                        let parentId = m.parentModule;
                        if (typeof parentId === 'object' && parentId !== null) parentId = parentId._id;
                        
                        if (parentId && moduleIds.has(parentId)) {
                          if (!childrenMap[parentId]) childrenMap[parentId] = [];
                          childrenMap[parentId].push(m);
                        } else {
                          roots.push(m);
                        }
                      });

                      const renderTree = (nodes) => {
                        return nodes.map(node => {
                          const children = childrenMap[node._id];
                          const hasChildren = children && children.length > 0;
                          
                          // Only modules from the database have a key field
                          const isRealModule = !!node.key; 

                          const actionButtons = isRealModule ? (
                            <div className="flex gap-1 ml-auto mr-1 relative z-10">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingModule({
                                    ...node,
                                    moduleType: node.parentModule ? 'submodule' : 'parent',
                                    parentModule: node.parentModule && typeof node.parentModule === 'object' ? node.parentModule._id : node.parentModule || ''
                                  });
                                }}
                                className="p-1 hover:bg-slate-200 text-amber-600 rounded-lg transition"
                                title="Edit Module"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteModule(node._id);
                                }}
                                className="p-1 hover:bg-slate-200 text-rose-600 rounded-lg transition"
                                title="Delete Module"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : null;

                          if (!hasChildren) {
                            return (
                              <div key={node._id} className="text-[11px] font-semibold text-slate-600 py-0.5 flex items-center justify-between group/item hover:bg-slate-50/80 rounded pr-1 transition-colors">
                                <div className="flex items-center before:content-[''] before:w-1 before:h-1 before:bg-slate-400 before:rounded-full before:mr-2">
                                  {node.name}
                                </div>
                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  {actionButtons}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <details key={node._id} className="group/sub mb-1 mt-1 first:mt-0 last:mb-0">
                              <summary className="flex items-center gap-1.5 cursor-pointer py-0.5 list-none [&::-webkit-details-marker]:hidden select-none hover:bg-slate-50/80 rounded pr-1 group/item transition-colors">
                                <span className="text-slate-400 group-open/sub:rotate-90 transition-transform text-[8px] mt-[1px]">▶</span>
                                <span className="text-[11px] font-bold text-slate-700 group-hover/sub:text-blue-600 transition-colors">{node.name}</span>
                                <span className="text-[9px] bg-blue-100/50 text-blue-600 px-1 rounded-sm font-bold ml-1">{children.length}</span>
                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity ml-auto">
                                  {actionButtons}
                                </div>
                              </summary>
                              <div className="pl-3.5 ml-1 border-l border-slate-200 flex flex-col gap-0.5 mt-1 mb-1">
                                {renderTree(children)}
                              </div>
                            </details>
                          );
                        });
                      };

                      return (
                        <div key={panel._id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition duration-200 mb-4">
                          <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                                <Layers size={18} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800 text-base">{formatPanelName(panel.name)}</span>
                                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">
                                    {panel.key}
                                  </span>
                                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">
                                    {panel.level || 'Country'} Level
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                              {roots.length} Root Modules
                            </span>
                          </div>

                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {roots.map(root => {
                                const hasChildren = childrenMap[root._id] && childrenMap[root._id].length > 0;
                                const isRealRoot = !!root.key;

                                const actionButtons = isRealRoot ? (
                                  <div className="flex gap-1 ml-auto mr-1 relative z-10">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingModule({
                                          ...root,
                                          moduleType: 'parent',
                                          parentModule: '',
                                        });
                                      }}
                                      className="p-1 hover:bg-slate-200 text-amber-600 rounded-lg transition"
                                      title="Edit Module"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteModule(root._id);
                                      }}
                                      className="p-1 hover:bg-slate-200 text-rose-600 rounded-lg transition"
                                      title="Delete Module"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ) : null;

                                if (!hasChildren) {
                                  return (
                                    <div key={root._id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm group/root hover:border-slate-300">
                                      <span className="font-bold text-xs text-slate-700">{root.name}</span>
                                      <div className="opacity-0 group-hover/root:opacity-100 transition-opacity">
                                        {actionButtons}
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <details key={root._id} className="group bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-fit relative">
                                    <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 transition-colors list-none [&::-webkit-details-marker]:hidden select-none group/root">
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400 group-open:rotate-90 transition-transform text-[10px]">▶</span>
                                        <span className="font-bold text-xs text-slate-700">{root.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                          {childrenMap[root._id].length} sub
                                        </span>
                                        <div className="opacity-0 group-hover/root:opacity-100 transition-opacity">
                                          {actionButtons}
                                        </div>
                                      </div>
                                    </summary>
                                    <div className="p-2 border-t border-slate-100 bg-slate-50 flex flex-col gap-1 pl-4">
                                      {renderTree(childrenMap[root._id])}
                                    </div>
                                  </details>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: USER WORKSPACE MAPPING */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">User Workspace Assignments</h3>
                  <p className="text-xs text-slate-400">Manage user panel mappings and individual overrides.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold bg-white"
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="system">System Users</option>
                    <option value="company">Company Users</option>
                  </select>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded-xl text-sm font-bold shadow-sm transition"
                  >
                    <Plus size={16} />
                    Fill Form
                  </button>
                </div>
              </div>

              {/* Location Filter Section */}
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">Location Filter</h4>
                  <button
                    onClick={() => setShowLocationCards(!showLocationCards)}
                    className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-xs font-semibold"
                  >
                    {showLocationCards ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showLocationCards ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {showLocationCards && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Country Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Select Country</label>
                      <select
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
                        value={selectedLocation.country}
                        onChange={(e) => setSelectedLocation({ country: e.target.value, state: 'all', cluster: '', district: '' })}
                      >
                        <option value="all">All Countries</option>
                        {locationData.countries.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* State Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Select State</label>
                      <select
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
                        value={selectedLocation.state}
                        onChange={(e) => setSelectedLocation(prev => ({ ...prev, state: e.target.value, cluster: 'all', district: 'all' }))}
                        disabled={selectedLocation.country === 'all'}
                      >
                        <option value="all">All States</option>
                        {locationData.states.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cluster Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Select Cluster</label>
                      <select
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
                        value={selectedLocation.cluster}
                        onChange={(e) => setSelectedLocation(prev => ({ ...prev, cluster: e.target.value, district: 'all' }))}
                        disabled={selectedLocation.state === 'all' || !selectedLocation.state}
                      >
                        <option value="all">All Clusters</option>
                        {locationData.clusters.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* District Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Select District</label>
                      <select
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
                        value={selectedLocation.district}
                        onChange={(e) => setSelectedLocation(prev => ({ ...prev, district: e.target.value }))}
                        disabled={selectedLocation.state === 'all' || !selectedLocation.state}
                      >
                        <option value="all">All Districts</option>
                        {locationData.districts.map(d => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-3.5 px-4 font-bold text-slate-600 text-xs uppercase">User Account</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 text-xs uppercase">System Role</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 text-xs uppercase">Assigned Panel Workspace</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 text-xs uppercase">Branch Access</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 text-xs uppercase">Overrides</th>
                      <th className="py-3.5 px-4 font-bold text-slate-600 text-xs uppercase text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const userMap = userPanels.find((up) => up.userId?._id === user._id || up.userId === user._id);
                      return (
                        <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-4">
                            <div className="font-extrabold text-slate-800 text-sm">{user.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{user.email}</div>
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-slate-600">
                            {user.role}
                          </td>
                          <td className="py-4 px-4">
                            {userMap?.panelId ? (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-extrabold rounded-lg shadow-sm">
                                {userMap.panelId?.name || 'Assigned'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Not assigned</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-500 font-semibold">
                            {userMap?.branchId || '-'}
                          </td>
                          <td className="py-4 px-4">
                            {userMap?.customPermissions?.length > 0 ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold rounded">
                                {userMap.customPermissions.length} Active Overrides
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleUserConfigureClick(user)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center"
                              >
                                Configure Access
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {/* SECTION COMMENTED OUT: To enable, remove "false &&" below */}
          {false && activeTab === 'logs' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-blue-600 animate-pulse" size={22} />
                    Audit Logs Log Viewer
                  </h3>
                  <p className="text-xs text-slate-400">View real-time records of administrative adjustments.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                    placeholder="Search logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No activity matching filter found.</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4"
                    >
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Activity size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="font-extrabold text-sm text-slate-800">{log.action}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{log.details}</p>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-mono">
                          <span>Operator: {log.userName}</span>
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLONE PANEL MODAL */}
      {cloningPanel && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Copy className="text-blue-600" size={18} />
                Clone Panel Rights
              </h2>
              <button onClick={() => setCloningPanel(null)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleClonePanel} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Cloned Panel Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  placeholder="e.g. Finance Assistant"
                  value={cloningPanel.targetName}
                  onChange={(e) => setCloningPanel({ ...cloningPanel, targetName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Level</label>
                <select
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  value={cloningPanel.targetLevel}
                  onChange={(e) => setCloningPanel({ ...cloningPanel, targetLevel: e.target.value })}
                >
                  <option value="Country">Country</option>
                  <option value="State">State</option>
                  <option value="Cluster">Cluster</option>
                  <option value="District">District</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCloningPanel(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition"
                >
                  Confirm Clone Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PANEL MODAL */}
      {editingPanel && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col border border-slate-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">Edit Panel Details</h2>
              <button onClick={() => setEditingPanel(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdatePanel} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Panel Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  value={editingPanel.name}
                  onChange={(e) => setEditingPanel({ ...editingPanel, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Level</label>
                <select
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  value={editingPanel.level || 'Country'}
                  onChange={(e) => setEditingPanel({ ...editingPanel, level: e.target.value })}
                >
                  <option value="Country">Country</option>
                  <option value="State">State</option>
                  <option value="Cluster">Cluster</option>
                  <option value="District">District</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="panel-active"
                  checked={editingPanel.isActive}
                  onChange={(e) => setEditingPanel({ ...editingPanel, isActive: e.target.checked })}
                  className="rounded border-slate-350 text-blue-600 h-4 w-4"
                />
                <label htmlFor="panel-active" className="text-xs font-bold text-slate-600">
                  Panel Active Status
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPanel(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
                >
                  Save Panel Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODULE MODAL */}
      {editingModule && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col border border-slate-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">Edit Module/Submodule</h2>
              <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateModule} className="p-5 space-y-4">
              {/* Module Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Module Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingModule({ ...editingModule, moduleType: 'parent', parentModule: '' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      editingModule.moduleType === 'parent'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Main Module (Parent)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingModule({ ...editingModule, moduleType: 'submodule' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      editingModule.moduleType === 'submodule'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Submodule (Child)
                  </button>
                </div>
              </div>

              {/* Parent Module Selection Dropdown (Only shown if submodule is selected) */}
              {editingModule.moduleType === 'submodule' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Select Parent Module <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                    value={editingModule.parentModule}
                    onChange={(e) => setEditingModule({ ...editingModule, parentModule: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Parent Module --</option>
                    {modules
                      .filter((m) => !m.parentModule && m._id !== editingModule._id)
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Module Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  value={editingModule.name}
                  onChange={(e) => setEditingModule({ ...editingModule, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Route Path</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  value={editingModule.route}
                  onChange={(e) => setEditingModule({ ...editingModule, route: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sidebar Icon</label>
                <select
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  value={editingModule.icon}
                  onChange={(e) => setEditingModule({ ...editingModule, icon: e.target.value })}
                >
                  {AVAILABLE_ICONS.map((ico) => (
                    <option key={ico.name} value={ico.name}>
                      {ico.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm"
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingModule(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
                >
                  Save Module Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE USER ACCESS SLIDING MODAL */}
      {configuringUser && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-end p-0 backdrop-blur-sm">
          <div className="bg-white shadow-2xl w-full max-w-xl h-full flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Configure User Access</h2>
                <p className="text-xs text-slate-400 mt-0.5">Define workspace panel mappings and custom override permissions.</p>
              </div>
              <button onClick={() => setConfiguringUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveUserAssignment} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">{configuringUser.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{configuringUser.email}</p>
                </div>
              </div>

              {/* Panel Select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Workspace Panel Assignment</label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  value={userAssignForm.panelId}
                  onChange={(e) => setUserAssignForm({ ...userAssignForm, panelId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Workspace Panel --</option>
                  {panels.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Settings */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Branch / Territory Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  placeholder="e.g. Main Branch, North Zone"
                  value={userAssignForm.branchId}
                  onChange={(e) => setUserAssignForm({ ...userAssignForm, branchId: e.target.value })}
                />
              </div>

              {/* User Overrides Matrix */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  User-Specific Override Permissions (Fine-Tuning)
                </label>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Toggle cells to enforce explicit overrides (Checked = Allow, Unchecked = Deny, Dash = Default panel permissions).
                </p>

                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="py-2.5 px-4 font-bold text-slate-700 text-xs">Module Hierarchy</th>
                        <th className="py-2.5 px-2 font-bold text-slate-700 text-xs text-center">View</th>
                        <th className="py-2.5 px-2 font-bold text-slate-700 text-xs text-center">Add</th>
                        <th className="py-2.5 px-2 font-bold text-slate-700 text-xs text-center">Edit</th>
                        <th className="py-2.5 px-2 font-bold text-slate-700 text-xs text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedModules.map((mod) => {
                        const override = userAssignForm.customPermissions.find(
                          (cp) => cp.moduleId === mod._id || cp.moduleId?._id === mod._id
                        );

                        return (
                          <tr
                            key={mod._id}
                            className={`border-b border-slate-150 hover:bg-slate-50/70 transition ${
                              mod.isSubmodule ? 'bg-slate-50/40 font-normal' : 'bg-slate-100/50 font-bold'
                            }`}
                          >
                            <td className="py-3 px-4 text-slate-800 text-xs">
                              {mod.isSubmodule && <span className="text-slate-400 mr-1.5">↳</span>}
                              {mod.name}
                            </td>
                            {['view', 'add', 'edit', 'delete'].map((act) => {
                              const actField = `can_${act}`;
                              const val = override ? override[actField] : undefined;

                              return (
                                <td key={act} className="py-2 px-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserOverride(mod._id, actField, val)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center border font-extrabold text-xs transition-all ${
                                      val === true
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                        : val === false
                                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'
                                    }`}
                                  >
                                    {val === true ? '✓' : val === false ? '✗' : '-'}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConfiguringUser(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition shadow-md shadow-blue-100 flex items-center gap-1.5"
                >
                  <Lock size={14} />
                  Save Dynamic Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddNewCompanyUserModal 
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
      />
    </div>
  );
}
