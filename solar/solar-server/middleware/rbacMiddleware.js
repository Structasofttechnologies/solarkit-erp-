import UserPanel from '../models/users/UserPanel.js';
import PanelPermission from '../models/users/PanelPermission.js';
import Module from '../models/hr/Module.js';

/**
 * Middleware to check dynamic RBAC permission for a given module key and action.
 * @param {string} moduleKey - The key of the module (e.g., 'leads', 'invoices')
 * @param {string} action - The action type ('view', 'add', 'edit', 'delete')
 */
export const checkPermission = (moduleKey, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request context' });
      }

      // 1. Super Admin bypasses all checks
      if (user.role === 'admin') {
        return next();
      }

      // 2. Fetch the module by standard key
      const moduleDoc = await Module.findOne({ key: moduleKey.toLowerCase() });
      if (!moduleDoc) {
        // Fallback: If module doesn't exist yet, we restrict access by default
        return res.status(403).json({
          success: false,
          message: `Access denied: Module '${moduleKey}' not registered in system registry.`
        });
      }

      // 3. Find the User-Panel mappings
      const userPanels = await UserPanel.find({ userId: user.id });
      if (!userPanels || userPanels.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No active panel workspace assigned to your account.'
        });
      }

      const permissionField = `can_${action.toLowerCase()}`;
      let authorized = false;

      // 4. Iterate over assigned panels to verify access
      for (const userPanel of userPanels) {
        // A. Check custom overrides first
        const customOverride = userPanel.customPermissions?.find(
          (cp) => cp.moduleId.toString() === moduleDoc._id.toString()
        );

        if (customOverride && customOverride[permissionField] !== undefined) {
          if (customOverride[permissionField] === true) {
            authorized = true;
            break;
          } else {
            // Explicitly set to false in custom override, move to check next panel if exists
            continue;
          }
        }

        // B. Check standard Panel Permission matrix defaults
        const defaultPerm = await PanelPermission.findOne({
          panelId: userPanel.panelId,
          moduleId: moduleDoc._id,
        });

        if (defaultPerm && defaultPerm[permissionField] === true) {
          authorized = true;
          break;
        }
      }

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You do not have permission to ${action} modules in '${moduleDoc.name}'.`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC Middleware Authorization Error:', error);
      res.status(500).json({ success: false, message: 'Server authorization error' });
    }
  };
};
