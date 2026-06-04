import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Panel from '../models/users/Panel.js';
import Module from '../models/hr/Module.js';
import PanelPermission from '../models/users/PanelPermission.js';
import UserPanel from '../models/users/UserPanel.js';
import User from '../models/users/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const defaultPanels = [
  { name: 'Admin Panel', key: 'admin', description: 'Full access to everything in Solarkits ERP' },
  { name: 'Partner Manager Panel', key: 'partner_manager', description: 'Can manage partners, commissions, and reports' },
  { name: 'Partners Panel', key: 'partners', description: 'Limited access for external partners to view leads and earnings' },
  { name: 'Accounts Panel', key: 'accounts', description: 'Finance-related operations and reports' },
  { name: 'Delivery Panel', key: 'delivery', description: 'Operations & installation team updates' },
];

// Parents (Category Panels)
const parentModules = [
  { name: 'Partner Manager Panel', key: 'parent_partner_manager', route: '/partner-manager', icon: 'Users', description: 'Main module for Partner Manager controls' },
  { name: 'Partners Panel', key: 'parent_partners', route: '/partners', icon: 'Users', description: 'Main module for External Partners dashboard' },
  { name: 'Accounts Panel', key: 'parent_accounts', route: '/accounts', icon: 'FileText', description: 'Main module for Accounts & Billing controls' },
  { name: 'Delivery Panel', key: 'parent_delivery', route: '/delivery', icon: 'Layers', description: 'Main module for Delivery & Installation team' }
];

// Submodules strictly mapped to their respective Parents
const subModulesList = [
  // Submodules under 'Partner Manager Panel'
  { parentKey: 'parent_partner_manager', name: 'Add Partner', key: 'pm_add_partner', route: '/partner-manager/add-partner', icon: 'Users', description: 'Add new partner users' },
  { parentKey: 'parent_partner_manager', name: 'Approve Partner', key: 'pm_approve_partner', route: '/partner-manager/approve-partner', icon: 'Shield', description: 'Approve registered partners' },
  { parentKey: 'parent_partner_manager', name: 'Assign Leads', key: 'pm_assign_leads', route: '/partner-manager/assign-leads', icon: 'Layers', description: 'Assign sales leads to partners' },
  { parentKey: 'parent_partner_manager', name: 'Commission Tracking', key: 'pm_commission_tracking', route: '/partner-manager/commission', icon: 'Activity', description: 'Track commission structures' },
  { parentKey: 'parent_partner_manager', name: 'Performance Reports', key: 'pm_performance_reports', route: '/partner-manager/performance-reports', icon: 'FileText', description: 'View partner performance charts' },

  // Submodules under 'Partners Panel'
  { parentKey: 'parent_partners', name: 'View Own Leads', key: 'partner_own_leads', route: '/partners/own-leads', icon: 'Users', description: 'View and track assigned leads' },
  { parentKey: 'parent_partners', name: 'Upload Documents', key: 'partner_upload_docs', route: '/partners/upload-documents', icon: 'FileText', description: 'Upload project agreement documents' },
  { parentKey: 'parent_partners', name: 'Customer Status', key: 'partner_customer_status', route: '/partners/customer-status', icon: 'Activity', description: 'Check project onboarding status' },
  { parentKey: 'parent_partners', name: 'Earnings', key: 'partner_earnings', route: '/partners/earnings', icon: 'Activity', description: 'Track total commissions earned' },
  { parentKey: 'parent_partners', name: 'Support Tickets', key: 'partner_support_tickets', route: '/partners/support-tickets', icon: 'Shield', description: 'Open and manage service tickets' },

  // Submodules under 'Accounts Panel'
  { parentKey: 'parent_accounts', name: 'Dashboard', key: 'accounts_dashboard', route: '/account-manager/dashboard', icon: 'Home', description: 'Dashboard view' },
  { parentKey: 'parent_accounts', name: 'Solar Panel Bundle Plan', key: 'accounts_solar_panel_bundle_plan', route: '/account-manager/solar-panel-bundle-plan', icon: 'Settings', description: 'Bundle plans' },
  { parentKey: 'parent_accounts', name: 'Procurement Plan', key: 'accounts_procurement_plan', route: '/account-manager/procurement-plan', icon: 'FileText', description: 'Procurement details' },
  { parentKey: 'parent_accounts', name: 'Report', key: 'accounts_report', route: '/account-manager/report', icon: 'ClipboardList', description: 'Finance reports' },
  { parentKey: 'parent_accounts', name: 'Order Journey', key: 'accounts_order_journey', route: '/account-manager/my-task/order-journey', icon: 'Truck', description: 'Track orders' },
  { parentKey: 'parent_accounts', name: 'Replacement Order', key: 'accounts_replacement_order', route: '/account-manager/my-task/replacement-order', icon: 'RefreshCw', description: 'Returns management' },
  { parentKey: 'parent_accounts', name: 'Warehouse Vendor Pay', key: 'accounts_warehouse_vendor_pay', route: '/account-manager/my-task/warehouse-vendor-pay', icon: 'Minus', description: 'Pay warehouse vendor' },
  { parentKey: 'parent_accounts', name: 'Vendor Contract Pay', key: 'accounts_vendor_contract_pay', route: '/account-manager/my-task/vendor-contract-pay', icon: 'Minus', description: 'Pay vendor contract' },
  { parentKey: 'parent_accounts', name: 'Track CP Payments', key: 'accounts_track_cp_payments', route: '/account-manager/my-task/track-cp-payments', icon: 'Minus', description: 'CP payments tracking' },
  { parentKey: 'parent_accounts', name: 'Service', key: 'accounts_service', route: '/account-manager/my-task/service', icon: 'Minus', description: 'Accounts service' },

  // Submodules under 'Delivery Panel'
  { parentKey: 'parent_delivery', name: 'Dashboard', key: 'delivery_dashboard', route: '/delivery-manager/dashboard', icon: 'Home', description: 'Dashboard view' },
  { parentKey: 'parent_delivery', name: 'Delivery Management', key: 'delivery_delivery_management', route: '/delivery-manager/delivery-management', icon: 'Truck', description: 'Logistics updates' },
  { parentKey: 'parent_delivery', name: 'Replacement Order', key: 'delivery_replacement_order', route: '/delivery-manager/replacement-order', icon: 'RefreshCw', description: 'Return and replace' },
  { parentKey: 'parent_delivery', name: 'Report', key: 'delivery_report', route: '/delivery-manager/report', icon: 'ClipboardList', description: 'Delivery reports' },
  { parentKey: 'parent_delivery', name: 'InWard', key: 'delivery_inward_management', route: '/delivery-manager/my-task/inward-management', icon: 'Minus', description: 'Inward tasks' },
  { parentKey: 'parent_delivery', name: 'At Warehouse', key: 'delivery_at_warehouse', route: '/delivery-manager/my-task/at-warehouse', icon: 'Minus', description: 'Warehouse tasks' },
];

async function seed() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully.');

    // Cleanup: Delete any previously seeded panel, permission matrix, and user panel entries
    console.log('🧹 Purging previous seeds for a clean slate...');
    await Panel.deleteMany({});
    await PanelPermission.deleteMany({});
    await UserPanel.deleteMany({});
    
    // Clean delete all modules we created based on parent keys and submodule keys
    const allKeysToDelete = [
      ...parentModules.map(p => p.key),
      ...subModulesList.map(s => s.key)
    ];
    await Module.deleteMany({ key: { $in: allKeysToDelete } });
    
    console.log('✅ Clean slate successfully established.');

    // 1. Seed Panels
    console.log('🔄 Seeding Workspace Panels...');
    const panelDocs = [];
    for (const p of defaultPanels) {
      const panel = await Panel.create(p);
      console.log(`  + Created Panel: ${panel.name}`);
      panelDocs.push(panel);
    }

    // 2. Seed Parent Modules
    console.log('🔄 Seeding Parent Modules...');
    const parentDocs = {};
    const seededModules = [];

    for (const pm of parentModules) {
      const mod = await Module.create({
        ...pm,
        defaultLevel: 'country',
        status: 'active',
        isActive: true,
        parentModule: null
      });
      console.log(`  + Created Parent Module: ${mod.name}`);
      parentDocs[pm.key] = mod;
      seededModules.push(mod);
    }

    // 3. Seed Submodules linked to their respective Parent Modules
    console.log('🔄 Seeding Submodules...');
    for (const sm of subModulesList) {
      const parentDoc = parentDocs[sm.parentKey];
      if (!parentDoc) continue;

      const mod = await Module.create({
        name: sm.name,
        key: sm.key,
        route: sm.route,
        icon: sm.icon,
        description: sm.description,
        defaultLevel: 'country',
        status: 'active',
        isActive: true,
        parentModule: parentDoc._id
      });
      console.log(`  + Created Submodule: ${mod.name} ↳ (Parent: ${parentDoc.name})`);
      seededModules.push(mod);
    }

    // 4. Seed PanelPermission Matrix mapping
    console.log('🔄 Seeding default Permission Matrix limits...');
    const permsToInsert = [];

    const adminPanel = panelDocs.find(p => p.key === 'admin');
    const partnerMgrPanel = panelDocs.find(p => p.key === 'partner_manager');
    const partnersPanel = panelDocs.find(p => p.key === 'partners');
    const accountsPanel = panelDocs.find(p => p.key === 'accounts');
    const deliveryPanel = panelDocs.find(p => p.key === 'delivery');

    seededModules.forEach(mod => {
      // Admin always gets full rights
      permsToInsert.push({
        panelId: adminPanel._id,
        moduleId: mod._id,
        can_view: true,
        can_add: true,
        can_edit: true,
        can_delete: true
      });

      // Mapping for Partner Manager Panel
      if (mod.key === 'parent_partner_manager' || mod.key.startsWith('pm_')) {
        permsToInsert.push({
          panelId: partnerMgrPanel._id,
          moduleId: mod._id,
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: false
        });
      } else {
        permsToInsert.push({
          panelId: partnerMgrPanel._id,
          moduleId: mod._id,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false
        });
      }

      // Mapping for Partners Panel
      if (mod.key === 'parent_partners' || mod.key.startsWith('partner_')) {
        permsToInsert.push({
          panelId: partnersPanel._id,
          moduleId: mod._id,
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: false
        });
      } else {
        permsToInsert.push({
          panelId: partnersPanel._id,
          moduleId: mod._id,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false
        });
      }

      // Mapping for Accounts Panel
      if (mod.key === 'parent_accounts' || mod.key.startsWith('accounts_')) {
        permsToInsert.push({
          panelId: accountsPanel._id,
          moduleId: mod._id,
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: false
        });
      } else {
        permsToInsert.push({
          panelId: accountsPanel._id,
          moduleId: mod._id,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false
        });
      }

      // Mapping for Delivery Panel
      if (mod.key === 'parent_delivery' || mod.key.startsWith('delivery_')) {
        permsToInsert.push({
          panelId: deliveryPanel._id,
          moduleId: mod._id,
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: false
        });
      } else {
        permsToInsert.push({
          panelId: deliveryPanel._id,
          moduleId: mod._id,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false
        });
      }
    });

    if (permsToInsert.length > 0) {
      await PanelPermission.insertMany(permsToInsert);
      console.log(`  + Seeded ${permsToInsert.length} Permission Matrix rules.`);
    }

    // 5. Map existing users for testing
    console.log('🔄 Mapping users to workspace panels...');
    const allUsers = await User.find({});
    for (const u of allUsers) {
      let targetPanel = null;
      if (u.role === 'admin') {
        targetPanel = adminPanel;
      } else if (u.role === 'accountManager') {
        targetPanel = accountsPanel;
      } else if (u.role === 'deliveryManager') {
        targetPanel = deliveryPanel;
      } else if (u.role === 'franchiseeManager' || u.role === 'dealerManager') {
        targetPanel = partnerMgrPanel;
      }

      if (targetPanel) {
        await UserPanel.create({
          userId: u._id,
          panelId: targetPanel._id,
          branchId: 'Main Branch',
          customPermissions: []
        });
        console.log(`  + Assigned user '${u.name}' (${u.role}) to '${targetPanel.name}'`);
      }
    }

    console.log('🏁 Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
}

seed();
