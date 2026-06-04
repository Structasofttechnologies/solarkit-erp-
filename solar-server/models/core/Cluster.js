import mongoose from 'mongoose';

const clusterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    districts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    }],
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// Compound index for unique cluster name within a state (since it can span multiple districts)
clusterSchema.index({ name: 1, state: 1 }, { unique: true });

export default mongoose.model('Cluster', clusterSchema);
