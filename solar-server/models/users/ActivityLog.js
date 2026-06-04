import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "Create Panel", "Update Permissions", "Clone Role"
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: 'Default Company',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', activityLogSchema);
