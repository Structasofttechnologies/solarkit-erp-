import mongoose from 'mongoose';

const userPanelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    panelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Panel',
      required: true,
    },
    branchId: {
      type: String,
      default: 'Main Branch',
    }, // Branch-wise access
    customPermissions: [
      {
        moduleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Module',
        },
        can_view: {
          type: Boolean,
        },
        can_add: {
          type: Boolean,
        },
        can_edit: {
          type: Boolean,
        },
        can_delete: {
          type: Boolean,
        },
      },
    ],
  },
  { timestamps: true }
);

// One user mapping per panel
userPanelSchema.index({ userId: 1, panelId: 1 }, { unique: true });

export default mongoose.model('UserPanel', userPanelSchema);
