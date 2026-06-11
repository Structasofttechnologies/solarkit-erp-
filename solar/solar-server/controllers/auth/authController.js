import User from '../../models/users/User.js';
import TemporaryIncharge from '../../models/hr/TemporaryIncharge.js';
import jwt from 'jsonwebtoken';
import UserPanel from '../../models/users/UserPanel.js';
import PanelPermission from '../../models/users/PanelPermission.js';

const buildMenuTree = (modules) => {
  const tree = [];
  const map = {};

  // Sort modules to ensure parents are processed before children if necessary
  modules.forEach(mod => {
    map[mod._id.toString()] = { ...mod.toObject(), subItems: [], hasDropdown: false };
  });

  modules.forEach(mod => {
    const node = map[mod._id.toString()];
    if (mod.parentModule && map[mod.parentModule.toString()]) {
      map[mod.parentModule.toString()].subItems.push(node);
      map[mod.parentModule.toString()].hasDropdown = true;
    } else {
      tree.push(node);
    }
  });

  return tree;
};

const getUserPermissions = async (userId) => {
  const permMap = {};
  const authorizedModules = [];

  try {
    const userPanels = await UserPanel.find({ userId });
    if (!userPanels || userPanels.length === 0) return { permMap, dynamicMenuTree: [] };

    for (const up of userPanels) {
      const defaultPerms = await PanelPermission.find({ panelId: up.panelId }).populate('moduleId');
      
      defaultPerms.forEach(dp => {
        if (dp.moduleId && dp.moduleId.key) {
          const key = dp.moduleId.key.toLowerCase();
          permMap[key] = {
            view: dp.can_view,
            add: dp.can_add,
            edit: dp.can_edit,
            delete: dp.can_delete
          };
          if (dp.can_view) {
             if (!authorizedModules.find(m => m.key.toLowerCase() === key)) {
                authorizedModules.push(dp.moduleId);
             }
          }
        }
      });

      if (up.customPermissions && up.customPermissions.length > 0) {
        const populatedUp = await UserPanel.findById(up._id).populate('customPermissions.moduleId');
        populatedUp.customPermissions.forEach(cp => {
          if (cp.moduleId && cp.moduleId.key) {
            const key = cp.moduleId.key.toLowerCase();
            if (!permMap[key]) {
              permMap[key] = { view: false, add: false, edit: false, delete: false };
            }
            if (cp.can_view !== undefined) permMap[key].view = cp.can_view;
            if (cp.can_add !== undefined) permMap[key].add = cp.can_add;
            if (cp.can_edit !== undefined) permMap[key].edit = cp.can_edit;
            if (cp.can_delete !== undefined) permMap[key].delete = cp.can_delete;

            if (permMap[key].view) {
               if (!authorizedModules.find(m => m.key.toLowerCase() === key)) {
                  authorizedModules.push(cp.moduleId);
               }
            } else {
               const idx = authorizedModules.findIndex(m => m.key.toLowerCase() === key);
               if (idx !== -1) authorizedModules.splice(idx, 1);
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching user permissions for auth payload:', error);
  }
  
  const dynamicMenuTree = buildMenuTree(authorizedModules);
  return { permMap, dynamicMenuTree };
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, state, role } = req.body;

    if (!name || !email || !password || !phone || !state) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phone,
      state,
      role: role || 'dealer',
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Log in with either email or phone (since we pass the mobile number in the 'email' field from the frontend login form)
    const user = await User.findOne({
      $or: [
        { email: email },
        { phone: email }
      ]
    }).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    }).populate('dynamicRole');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    // Check for active Temporary In-charge assignments
    const today = new Date();
    const activeAssignments = await TemporaryIncharge.find({
      tempInchargeUser: user._id,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    });

    const delegatedDepartments = activeAssignments.map(a => a.department);

    const token = generateToken(user._id, user.role);
    const { permMap, dynamicMenuTree } = await getUserPermissions(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        delegatedDepartments, // Add this
        dynamicRole: user.dynamicRole,
        status: user.status,
        state: user.state,
        panelPermissions: permMap,
        dynamicMenuTree,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    }).populate('dynamicRole');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for active Temporary In-charge assignments
    const today = new Date();
    const activeAssignments = await TemporaryIncharge.find({
      tempInchargeUser: user._id,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    });

    const delegatedDepartments = activeAssignments.map(a => a.department);

    // Return user object with delegatedDepartments merged or as separate field
    // We'll attach it to the user object we send back
    const userObj = user.toObject();
    userObj.delegatedDepartments = delegatedDepartments;
    const { permMap, dynamicMenuTree } = await getUserPermissions(user._id);
    userObj.panelPermissions = permMap;
    userObj.dynamicMenuTree = dynamicMenuTree;

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
