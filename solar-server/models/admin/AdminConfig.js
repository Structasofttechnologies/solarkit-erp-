import mongoose from 'mongoose';

const adminConfigSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      // Sub-section or page identifier inside the section
      type: String,
      required: true,
      trim: true,
    },
    data: {
      // Flexible JSON payload per page
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

adminConfigSchema.index({ section: 1, key: 1 }, { unique: true });

export default mongoose.model('AdminConfig', adminConfigSchema);

