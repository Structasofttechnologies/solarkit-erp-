import Installation from '../../models/projects/Installation.js';
import Order from '../../models/orders/Order.js';

const generateInstallationNumber = async () => {
  const count = await Installation.countDocuments();
  return `INST-${Date.now()}-${count + 1}`;
};

export const getAllInstallations = async (req, res) => {
  try {
    const { status, category, projectType } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (projectType) filter.projectType = projectType;

    const installations = await Installation.find(filter)
      .populate('order')
      .populate('installer', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, installations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstallationById = async (req, res) => {
  try {
    const installation = await Installation.findById(req.params.id)
      .populate('order')
      .populate('installer', 'name phone email');

    if (!installation) {
      return res.status(404).json({ message: 'Installation not found' });
    }

    res.status(200).json({ success: true, installation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInstallation = async (req, res) => {
  try {
    const { order, installer, delivery, scheduledDate, category, subCategory, projectType, timeline } =
      req.body;

    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const installation = new Installation({
      installationNumber: await generateInstallationNumber(),
      order,
      installer,
      delivery: delivery || null,
      scheduledDate,
      category,
      subCategory,
      projectType,
      timeline,
    });

    await installation.save();

    orderDoc.installationStatus = 'assigned';
    orderDoc.installerAssignedTo = installer;
    await orderDoc.save();

    res.status(201).json({
      success: true,
      message: 'Installation created successfully',
      installation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInstallation = async (req, res) => {
  try {
    let installation = await Installation.findById(req.params.id);

    if (!installation) {
      return res.status(404).json({ message: 'Installation not found' });
    }

    Object.assign(installation, req.body);
    await installation.save();

    res.status(200).json({
      success: true,
      message: 'Installation updated successfully',
      installation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInstallationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const installation = await Installation.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!installation) {
      return res.status(404).json({ message: 'Installation not found' });
    }

    if (status === 'completed') {
      installation.actualInstallationDate = new Date();
      installation.completionPercentage = 100;
      await installation.save();

      const order = await Order.findById(installation.order);
      if (order) {
        order.installationStatus = 'completed';
        await order.save();
      }
    }

    res.status(200).json({ success: true, message: 'Installation status updated', installation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInstallation = async (req, res) => {
  try {
    const installation = await Installation.findByIdAndDelete(req.params.id);

    if (!installation) {
      return res.status(404).json({ message: 'Installation not found' });
    }

    res.status(200).json({ success: true, message: 'Installation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstallationsByInstaller = async (req, res) => {
  try {
    const installations = await Installation.find({ installer: req.params.installerId })
      .populate('order')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, installations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeInstallation = async (req, res) => {
  try {
    const { rating, feedback, labourCost, additionalCharges } = req.body;

    const installation = await Installation.findById(req.params.id);

    if (!installation) {
      return res.status(404).json({ message: 'Installation not found' });
    }

    installation.status = 'completed';
    installation.actualInstallationDate = new Date();
    installation.completionPercentage = 100;
    installation.rating = rating || installation.rating;
    installation.feedback = feedback || installation.feedback;
    installation.labourCost = labourCost || installation.labourCost;
    installation.additionalCharges = additionalCharges || installation.additionalCharges;

    await installation.save();

    res.status(200).json({
      success: true,
      message: 'Installation completed successfully',
      installation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
