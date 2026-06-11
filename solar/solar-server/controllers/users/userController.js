import User from '../../models/users/User.js';
import Statistics from '../../models/admin/Statistics.js';

export const getAllUsers = async (req, res) => {
  try {
    const { role, status, state } = req.query;
    let filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (state) filter.state = state;

    const users = await User.find(filter)
      .select('-password')
      .populate('dynamicRole')
      .populate('department');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('dynamicRole')
      .populate('department');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, state, cluster, district, department, dynamicRole } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phone,
      role,
      state,
      cluster: cluster || null,
      district: district || null,
      department: department || null,
      dynamicRole: dynamicRole || null,
      status: 'pending',
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user.toObject({ virtuals: true, getters: true }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, state, cluster, district, companyName, address, gstin, status, department, dynamicRole, role } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (state) user.state = state;
    if (cluster) user.cluster = cluster;
    if (district) user.district = district;
    if (companyName) user.companyName = companyName;
    if (address) user.address = address;
    if (gstin) user.gstin = gstin;
    if (status) user.status = status;
    if (role) user.role = role;
    if (department) user.department = department;
    if (dynamicRole) user.dynamicRole = dynamicRole;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User approved', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User rejected', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstallerDashboard = async (req, res) => {
  try {
    const { state, cluster, district, category, timeline } = req.query;

    let filter = { role: 'installer' };
    if (state) filter.state = state;
    if (cluster) filter.cluster = cluster;
    if (district) filter.district = district;

    const totalInstallers = await User.countDocuments(filter);

    const statsFilter = {
      ...filter,
      role: 'installer',
    };

    const statistics = await Statistics.find(statsFilter);

    const totalAssigned = statistics.reduce((sum, stat) => sum + stat.totalAssigned, 0);
    const inProgress = statistics.reduce((sum, stat) => sum + stat.inProgress, 0);
    const completed = statistics.reduce((sum, stat) => sum + stat.completed, 0);

    const installers = await User.find(filter).select('-password');

    const installerPerformance = await Promise.all(
      installers.map(async (installer) => {
        const stats = await Statistics.findOne({ user: installer._id });
        return {
          _id: installer._id,
          name: installer.name,
          totalAssigned: stats?.totalAssigned || 0,
          inProgress: stats?.inProgress || 0,
          overdue: stats?.overdue || 0,
          completed: stats?.completed || 0,
          completionRate: stats?.completionRate || 0,
          rating: stats?.rating || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      totalInstallers,
      assignedInstallations: totalAssigned,
      inProgressInstallations: inProgress,
      completedInstallations: completed,
      performance: installerPerformance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryDashboard = async (req, res) => {
  try {
    const { state, cluster, district, deliveryType, category, timeline } = req.query;

    let filter = { role: 'delivery_manager' };
    if (state) filter.state = state;
    if (cluster) filter.cluster = cluster;
    if (district) filter.district = district;

    const totalDeliveryPartners = await User.countDocuments(filter);

    const deliveryPartners = await User.find(filter).select('-password');

    const deliveryPerformance = await Promise.all(
      deliveryPartners.map(async (partner) => {
        const stats = await Statistics.findOne({ user: partner._id });
        return {
          _id: partner._id,
          name: partner.name,
          totalAssigned: stats?.totalAssigned || 0,
          inProgress: stats?.inProgress || 0,
          overdue: stats?.overdue || 0,
          completed: stats?.completed || 0,
          totalDistance: stats?.totalDistance || 0,
          avgCostPerKm: stats?.avgCostPerKm || 0,
          completionRate: stats?.completionRate || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      totalDeliveryPartners,
      performance: deliveryPerformance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
