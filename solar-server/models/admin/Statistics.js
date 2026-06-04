import mongoose from 'mongoose';

const statisticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['dealer', 'franchisee', 'installer', 'delivery_partner'],
    },
    totalAssigned: {
      type: Number,
      default: 0,
    },
    inProgress: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Number,
      default: 0,
    },
    overdue: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    avgDeliveryTime: {
      type: Number,
      default: 0,
    },
    avgCostPerKm: {
      type: Number,
      default: 0,
    },
    totalDistance: {
      type: Number,
      default: 0,
    },
    state: String,
    cluster: String,
    district: String,
    month: String,
    year: String,
  },
  { timestamps: true }
);

export default mongoose.model('Statistics', statisticsSchema);
