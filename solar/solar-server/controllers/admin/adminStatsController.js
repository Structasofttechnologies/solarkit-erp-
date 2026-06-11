import User from '../../models/users/User.js';
import Order from '../../models/orders/Order.js';
import Delivery from '../../models/orders/Delivery.js';
import Installation from '../../models/projects/Installation.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'shipped'] } });
    const pendingDeliveries = await Delivery.countDocuments({ status: { $in: ['pending', 'in_transit'] } });
    const completedInstallations = await Installation.countDocuments({ status: 'completed' });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const orderStats = {
      completed: await Order.countDocuments({ status: 'delivered' }),
      inProgress: await Order.countDocuments({ status: { $in: ['confirmed', 'shipped'] } }),
      pending: await Order.countDocuments({ status: 'pending' }),
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeOrders,
        pendingDeliveries,
        completedInstallations,
        recentOrders,
        orderStats,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin stats',
      error: error.message,
    });
  }
};

export const getInstallerStats = async (req, res) => {
  try {
    const { state, cluster, district, timeline } = req.query;

    let filter = {};
    if (state && state !== 'all') filter.state = state;
    if (cluster && cluster !== 'all') filter.cluster = cluster;
    if (district && district !== 'all') filter.district = district;

    const installers = await User.find({ role: 'installer', ...filter })
      .select('name email state cluster completionRate rating')
      .lean();

    const totalInstallers = installers.length;
    const assignedInstallations = await Installation.countDocuments({ status: { $ne: 'pending' } });
    const inProgressInstallations = await Installation.countDocuments({ status: 'in_progress' });
    const completedInstallations = await Installation.countDocuments({ status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalInstallers,
          assignedInstallations,
          inProgressInstallations,
          completedInstallations,
        },
        installers: installers.map((inst) => ({
          _id: inst._id,
          name: inst.name,
          email: inst.email,
          state: inst.state,
          cluster: inst.cluster,
          completionRate: inst.completionRate || '80%',
          rating: inst.rating || 4.5,
          totalAssigned: 15,
          inProgress: 3,
          overdue: 2,
          completed: 10,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching installer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching installer stats',
      error: error.message,
    });
  }
};
