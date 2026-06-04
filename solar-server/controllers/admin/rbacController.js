import Panel from '../../models/users/Panel.js';
import Module from '../../models/hr/Module.js';
import PanelPermission from '../../models/users/PanelPermission.js';
import UserPanel from '../../models/users/UserPanel.js';
import User from '../../models/users/User.js';
import CompanyUser from '../../models/users/CompanyUser.js';
import ActivityLog from '../../models/users/ActivityLog.js';

// Helper to log activities
const logAction = async (userId, userName, action, details, ip = '') => {
  try {
    await ActivityLog.create({
      userId,
      userName,
      action,
      details,
      ipAddress: ip || '127.0.0.1',
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};

/* ==========================================================================
   PANEL CONTROLLERS
   ========================================================================== */

export const getPanels = async (req, res) => {
  try {
    const panels = await Panel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, panels });
  } catch (error) {
    console.error('getPanels error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching panels' });
  }
};

export const createPanel = async (req, res) => {
  try {
    const { name, level, companyId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Panel name is required' });
    }

    const key = name.toLowerCase().replace(/\s+/g, '_');
    const existing = await Panel.findOne({ key });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A panel with this name/key already exists' });
    }

    const panel = await Panel.create({
      name,
      key,
      level: level || 'Country',
      companyId: companyId || 'Default Company',
    });

    // Automatically seed PanelPermission entries for all existing modules as false
    const modules = await Module.find({ isActive: true });
    const permsToInsert = modules.map((mod) => ({
      panelId: panel._id,
      moduleId: mod._id,
      can_view: false,
      can_add: false,
      can_edit: false,
      can_delete: false,
    }));

    if (permsToInsert.length > 0) {
      await PanelPermission.insertMany(permsToInsert);
    }

    await logAction(req.user.id, req.user.name || 'Admin', 'Create Panel', `Created panel '${name}'`);

    res.status(201).json({ success: true, panel });
  } catch (error) {
    console.error('createPanel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePanel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, isActive } = req.body;

    const panel = await Panel.findById(id);
    if (!panel) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }

    if (name) {
      panel.name = name;
      panel.key = name.toLowerCase().replace(/\s+/g, '_');
    }
    if (level !== undefined) panel.level = level;
    if (isActive !== undefined) panel.isActive = isActive;

    await panel.save();

    await logAction(req.user.id, req.user.name || 'Admin', 'Update Panel', `Updated panel '${panel.name}'`);

    res.status(200).json({ success: true, panel });
  } catch (error) {
    console.error('updatePanel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePanel = async (req, res) => {
  try {
    const { id } = req.params;
    const panel = await Panel.findById(id);
    if (!panel) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }

    // Clean up associations
    await PanelPermission.deleteMany({ panelId: id });
    await UserPanel.deleteMany({ panelId: id });
    await panel.deleteOne();

    await logAction(req.user.id, req.user.name || 'Admin', 'Delete Panel', `Deleted panel '${panel.name}'`);

    res.status(200).json({ success: true, message: 'Panel deleted successfully along with associated permissions' });
  } catch (error) {
    console.error('deletePanel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clonePanel = async (req, res) => {
  try {
    const { sourcePanelId, targetName, targetLevel } = req.body;
    if (!sourcePanelId || !targetName) {
      return res.status(400).json({ success: false, message: 'Source panel and target name are required' });
    }

    const sourcePanel = await Panel.findById(sourcePanelId);
    if (!sourcePanel) {
      return res.status(404).json({ success: false, message: 'Source panel not found' });
    }

    const targetKey = targetName.toLowerCase().replace(/\s+/g, '_');
    const existing = await Panel.findOne({ key: targetKey });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A panel with this target name/key already exists' });
    }

    // 1. Create the cloned panel
    const newPanel = await Panel.create({
      name: targetName,
      key: targetKey,
      level: targetLevel || sourcePanel.level || 'Country',
    });

    // 2. Fetch all permissions from the source panel
    const sourcePerms = await PanelPermission.find({ panelId: sourcePanelId });

    // 3. Duplicate permissions mapped to the new panel
    const clonedPerms = sourcePerms.map((sp) => ({
      panelId: newPanel._id,
      moduleId: sp.moduleId,
      can_view: sp.can_view,
      can_add: sp.can_add,
      can_edit: sp.can_edit,
      can_delete: sp.can_delete,
    }));

    if (clonedPerms.length > 0) {
      await PanelPermission.insertMany(clonedPerms);
    }

    await logAction(
      req.user.id,
      req.user.name || 'Admin',
      'Clone Panel',
      `Cloned panel '${sourcePanel.name}' into new panel '${targetName}'`
    );

    res.status(201).json({ success: true, panel: newPanel });
  } catch (error) {
    console.error('clonePanel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   MODULE CONTROLLERS
   ========================================================================== */

export const getModules = async (req, res) => {
  try {
    const modules = await Module.find().populate('parentModule', 'name key').sort({ name: 1 });
    res.status(200).json({ success: true, modules });
  } catch (error) {
    console.error('getModules error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching modules' });
  }
};

export const createModule = async (req, res) => {
  try {
    const { name, key, description, route, icon, parentModule, panelId } = req.body;
    if (!name || !key || !route) {
      return res.status(400).json({ success: false, message: 'Name, standardised key, and route are required' });
    }

    const standardKey = key.toLowerCase().replace(/\s+/g, '_');
    const existing = await Module.findOne({ key: standardKey });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A module with this key already exists' });
    }

    const mod = await Module.create({
      name,
      key: standardKey,
      description: description || '',
      route,
      icon: icon || 'Layers',
      parentModule: parentModule || null,
      isActive: true,
      status: 'active',
    });

    // Seed default permission mappings as false for all existing panels
    const panels = await Panel.find();
    const permsToInsert = panels.map((p) => {
      const isSelected = panelId && String(p._id) === String(panelId);
      return {
        panelId: p._id,
        moduleId: mod._id,
        can_view: isSelected,
        can_add: isSelected,
        can_edit: isSelected,
        can_delete: isSelected,
      };
    });

    if (permsToInsert.length > 0) {
      await PanelPermission.insertMany(permsToInsert);
    }

    await logAction(req.user.id, req.user.name || 'Admin', 'Create Module', `Created dynamic module '${name}'`);

    res.status(201).json({ success: true, module: mod });
  } catch (error) {
    console.error('createModule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, route, icon, description, isActive, parentModule } = req.body;

    const mod = await Module.findById(id);
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    if (name) mod.name = name;
    if (route) mod.route = route;
    if (icon) mod.icon = icon;
    if (description !== undefined) mod.description = description;
    if (isActive !== undefined) mod.isActive = isActive;
    mod.parentModule = parentModule || null;

    await mod.save();

    await logAction(req.user.id, req.user.name || 'Admin', 'Update Module', `Updated module '${mod.name}'`);

    res.status(200).json({ success: true, module: mod });
  } catch (error) {
    console.error('updateModule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const mod = await Module.findById(id);
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Delete associated entries
    await PanelPermission.deleteMany({ moduleId: id });
    await mod.deleteOne();

    await logAction(req.user.id, req.user.name || 'Admin', 'Delete Module', `Deleted module '${mod.name}'`);

    res.status(200).json({ success: true, message: 'Module and associated matrix mappings deleted successfully' });
  } catch (error) {
    console.error('deleteModule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncModules = async (req, res) => {
  try {
    const { modulesList } = req.body;
    if (!modulesList || !Array.isArray(modulesList)) {
      return res.status(400).json({ success: false, message: 'modulesList array is required' });
    }

    // Deduplicate the modulesList by key to prevent multiple inserts/updates of the same key in a single transaction
    const uniqueModulesList = [];
    const seenModuleKeys = new Set();
    for (const m of modulesList) {
      if (!seenModuleKeys.has(m.key)) {
        seenModuleKeys.add(m.key);
        uniqueModulesList.push(m);
      }
    }

    const existingModules = await Module.find();
    
    // Performance Optimization: Check if count and keys match exactly. If yes, skip all DB writes!
    const existingKeys = new Set(existingModules.map(m => m.key));
    const incomingKeys = new Set(uniqueModulesList.map(m => m.key));
    
    let isIdentical = existingModules.length === uniqueModulesList.length;
    if (isIdentical) {
      for (const k of incomingKeys) {
        if (!existingKeys.has(k)) {
          isIdentical = false;
          break;
        }
      }
    }

    if (isIdentical) {
      return res.status(200).json({ success: true, message: 'Modules already synchronized' });
    }

    // Drop the unique constraint index on name field to prevent duplicate display name conflicts
    try {
      await Module.collection.dropIndex('name_1');
      console.log('✅ Successfully dropped unique index on Module name field');
    } catch (indexError) {
      // Index might not exist or is already dropped, which is fine
    }

    const existingMap = new Map(existingModules.map(m => [m.key, m]));
    const activeKeys = new Set(uniqueModulesList.map(m => m.key));

    // 1. Skip deleting modules not in active keys to prevent wiping out dynamically created modules
    // for (const ext of existingModules) {
    //   if (!activeKeys.has(ext.key)) {
    //     await PanelPermission.deleteMany({ moduleId: ext._id });
    //     await ext.deleteOne();
    //   }
    // }

    // Refresh existing map
    const refreshedExisting = await Module.find();
    const refreshedMap = new Map(refreshedExisting.map(m => [m.key, m]));

    // 2. Sync parent modules first
    const parentModules = uniqueModulesList.filter(m => !m.parentKey);
    const parentDocsMap = new Map();

    for (const p of parentModules) {
      let doc = refreshedMap.get(p.key);
      if (doc) {
        doc.name = p.name;
        doc.route = p.route || '';
        doc.icon = p.icon || 'Layers';
        doc.description = p.description || '';
        doc.parentModule = null;
        doc.isActive = true;
        doc.status = 'active';
        await doc.save();
      } else {
        doc = await Module.create({
          name: p.name,
          key: p.key,
          route: p.route || '',
          icon: p.icon || 'Layers',
          description: p.description || '',
          parentModule: null,
          isActive: true,
          status: 'active'
        });
      }
      refreshedMap.set(doc.key, doc);
      parentDocsMap.set(p.key, doc._id);
    }

    // 3. Sync child modules (submodules)
    const childModules = uniqueModulesList.filter(m => m.parentKey);
    for (const c of childModules) {
      const parentId = parentDocsMap.get(c.parentKey);
      let doc = refreshedMap.get(c.key);
      if (doc) {
        doc.name = c.name;
        doc.route = c.route || '';
        doc.icon = c.icon || 'Layers';
        doc.description = c.description || '';
        doc.parentModule = parentId || null;
        doc.isActive = true;
        doc.status = 'active';
        await doc.save();
      } else {
        doc = await Module.create({
          name: c.name,
          key: c.key,
          route: c.route || '',
          icon: c.icon || 'Layers',
          description: c.description || '',
          parentModule: parentId || null,
          isActive: true,
          status: 'active'
        });
      }
      refreshedMap.set(doc.key, doc);
    }

    // 4. Update PanelPermission for all existing panels to have entries for all synced modules
    const allModules = await Module.find({ isActive: true });
    const panels = await Panel.find();

    const existingPerms = await PanelPermission.find();
    const permKeys = new Set(existingPerms.map(p => `${p.panelId}_${p.moduleId}`));

    const newPerms = [];
    for (const panel of panels) {
      const isAdmin = panel.key === 'admin';
      for (const mod of allModules) {
        const key = `${panel._id}_${mod._id}`;
        if (!permKeys.has(key)) {
          newPerms.push({
            panelId: panel._id,
            moduleId: mod._id,
            can_view: isAdmin,
            can_add: isAdmin,
            can_edit: isAdmin,
            can_delete: isAdmin
          });
        }
      }
    }

    if (newPerms.length > 0) {
      await PanelPermission.insertMany(newPerms);
    }

    await logAction(req.user.id, req.user.name || 'Admin', 'Sync Sidebar Modules', `Synchronized ${modulesList.length} modules from Admin Sidebar`);

    res.status(200).json({ success: true, message: 'Modules synced successfully with sidebar' });
  } catch (error) {
    console.error('syncModules error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   PERMISSION MATRIX CONTROLLERS
   ========================================================================== */

export const getPermissionMatrix = async (req, res) => {
  try {
    const panels = await Panel.find({ isActive: true }).sort({ name: 1 });
    const modules = await Module.find({ isActive: true }).sort({ name: 1 });
    const permissions = await PanelPermission.find();

    res.status(200).json({
      success: true,
      panels,
      modules,
      permissions,
    });
  } catch (error) {
    console.error('getPermissionMatrix error:', error);
    res.status(500).json({ success: false, message: 'Server error loading permission matrix' });
  }
};

export const updatePermissionMatrix = async (req, res) => {
  try {
    const { updates } = req.body; // updates = [{ panelId, moduleId, can_view, can_add, can_edit, can_delete }]
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Updates array is required' });
    }

    const operations = updates.map((up) => ({
      updateOne: {
        filter: { panelId: up.panelId, moduleId: up.moduleId },
        update: {
          $set: {
            can_view: !!up.can_view,
            can_add: !!up.can_add,
            can_edit: !!up.can_edit,
            can_delete: !!up.can_delete,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await PanelPermission.bulkWrite(operations);
    }

    await logAction(req.user.id, req.user.name || 'Admin', 'Update Permissions', 'Updated the default Permission Matrix grid settings');

    res.status(200).json({ success: true, message: 'Permission matrix updated successfully' });
  } catch (error) {
    console.error('updatePermissionMatrix error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   USER-PANEL MAPPING CONTROLLERS
   ========================================================================== */

export const getUsersAndPanels = async (req, res) => {
  try {
    const users = await User.find({}, 'name email phone role status country state cluster district').sort({ name: 1 }).lean();
    
    const companyUsers = await CompanyUser.find({}, 'fullName emailAddress mobileNumber role status district').sort({ fullName: 1 }).lean();
    const formattedCompanyUsers = companyUsers.map(cu => ({
      _id: cu._id,
      name: cu.fullName,
      email: cu.emailAddress,
      phone: cu.mobileNumber,
      role: cu.role || 'company_user',
      status: cu.status,
      district: cu.district,
      isCompanyUser: true
    }));

    const allUsers = [...users, ...formattedCompanyUsers];

    const userPanels = await UserPanel.find()
      .populate('panelId', 'name key')
      .populate('customPermissions.moduleId', 'name key');

    res.status(200).json({
      success: true,
      users: allUsers,
      userPanels,
    });
  } catch (error) {
    console.error('getUsersAndPanels error:', error);
    res.status(500).json({ success: false, message: 'Server error loading users and panels' });
  }
};

export const assignUserPanel = async (req, res) => {
  try {
    const { userId, panelId, branchId, customPermissions } = req.body;
    if (!userId || !panelId) {
      return res.status(400).json({ success: false, message: 'User ID and Panel ID are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const panel = await Panel.findById(panelId);
    if (!panel) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }

    // Upsert UserPanel assignment
    const userPanel = await UserPanel.findOneAndUpdate(
      { userId, panelId },
      {
        $set: {
          branchId: branchId || 'Main Branch',
          customPermissions: customPermissions || [],
        },
      },
      { upsert: true, new: true }
    );

    // Also link back in the User table if desired (e.g. update user's role to match panel)
    if (user.role !== 'admin' && panel.key !== 'admin') {
      // Set secondary indicators if required, but let's keep core user.role safe
    }

    await logAction(
      req.user.id,
      req.user.name || 'Admin',
      'Assign User Panel',
      `Assigned user '${user.name}' to panel '${panel.name}'`
    );

    res.status(200).json({ success: true, userPanel });
  } catch (error) {
    console.error('assignUserPanel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeUserPanel = async (req, res) => {
  try {
    const { id } = req.params;
    const userPanel = await UserPanel.findById(id).populate('userId', 'name').populate('panelId', 'name');
    if (!userPanel) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const userName = userPanel.userId?.name || 'User';
    const panelName = userPanel.panelId?.name || 'Panel';

    await userPanel.deleteOne();

    await logAction(
      req.user.id,
      req.user.name || 'Admin',
      'Remove User Panel',
      `Revoked user '${userName}' access to panel '${panelName}'`
    );

    res.status(200).json({ success: true, message: 'User panel access revoked successfully' });
  } catch (error) {
    console.error('removeUserPanel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   ACTIVITY LOG CONTROLLERS
   ========================================================================== */

export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('getActivityLogs error:', error);
    res.status(500).json({ success: false, message: 'Server error loading activity audit trail' });
  }
};
