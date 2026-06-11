import mongoose from 'mongoose';

const panelPermissionSchema = new mongoose.Schema(
  {
    panelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Panel',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    can_view: {
      type: Boolean,
      default: false,
    },
    can_add: {
      type: Boolean,
      default: false,
    },
    can_edit: {
      type: Boolean,
      default: false,
    },
    can_delete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness per panel and module combination
panelPermissionSchema.index({ panelId: 1, moduleId: 1 }, { unique: true });

export default mongoose.model('PanelPermission', panelPermissionSchema);
