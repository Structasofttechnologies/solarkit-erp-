import Delivery from '../../models/orders/Delivery.js';
import Order from '../../models/orders/Order.js';

const generateDeliveryNumber = async () => {
  const count = await Delivery.countDocuments();
  return `DEL-${Date.now()}-${count + 1}`;
};

export const getAllDeliveries = async (req, res) => {
  try {
    const { status, state, cluster, district, deliveryType } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (state) filter.state = state;
    if (cluster) filter.cluster = cluster;
    if (district) filter.district = district;
    if (deliveryType) filter.deliveryType = deliveryType;

    const deliveries = await Delivery.find(filter)
      .populate('order')
      .populate('deliveryPartner', 'name phone')
      .populate('state', 'name')
      .populate('cluster', 'name')
      .populate('district', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('order')
      .populate('deliveryPartner', 'name phone email');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDelivery = async (req, res) => {
  try {
    const {
      order,
      deliveryPartner,
      installer,
      deliveryType,
      scheduledDate,
      state,
      cluster,
      district,
      category,
      subCategory,
      projectType,
      timeline,
    } = req.body;

    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const delivery = new Delivery({
      deliveryNumber: await generateDeliveryNumber(),
      order,
      deliveryPartner,
      installer: installer || null,
      deliveryType: deliveryType || 'regular',
      scheduledDate,
      state,
      cluster,
      district,
      category,
      subCategory,
      projectType,
      timeline,
    });

    await delivery.save();

    orderDoc.deliveryStatus = 'assigned';
    orderDoc.deliveryAssignedTo = deliveryPartner;
    await orderDoc.save();

    res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDelivery = async (req, res) => {
  try {
    let delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    Object.assign(delivery, req.body);
    await delivery.save();

    res.status(200).json({
      success: true,
      message: 'Delivery updated successfully',
      delivery,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (status === 'delivered') {
      delivery.actualDeliveryDate = new Date();
      await delivery.save();

      const order = await Order.findById(delivery.order);
      if (order) {
        order.deliveryStatus = 'delivered';
        await order.save();
      }
    }

    res.status(200).json({ success: true, message: 'Delivery status updated', delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ success: true, message: 'Delivery deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveriesByPartner = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPartner: req.params.partnerId })
      .populate('order')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
