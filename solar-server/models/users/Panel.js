import mongoose from 'mongoose';

const panelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    }, // e.g., 'admin', 'partner_manager', 'partners', 'accounts', 'delivery'
    level: {
      type: String,
      enum: ['Country', 'State', 'Cluster', 'District'],
      default: 'Country',
    },
    companyId: {
      type: String,
      default: 'Default Company',
    }, // Multi-company support
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Panel', panelSchema);
