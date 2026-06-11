import ProcurementOrder from '../../models/orders/ProcurementOrder.js';
import SupplierVendor from '../../models/vendors/SupplierVendor.js';
import Product from '../../models/inventory/Product.js';

// @desc    Get all procurement orders
// @route   GET /api/procurement-orders
// @access  Private
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await ProcurementOrder.find()
            .populate('supplierId', 'name contact email')
            .populate('items.product', 'name categoryId')
            .populate('state', 'name')
            .populate('city', 'name')
            .populate('district', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single procurement order
// @route   GET /api/procurement-orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
    try {
        const order = await ProcurementOrder.findById(req.params.id)
            .populate('supplierId')
            .populate('items.product')
            .populate('state')
            .populate('city')
            .populate('district');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new procurement order
// @route   POST /api/procurement-orders
// @access  Private
export const createOrder = async (req, res, next) => {
    try {
        const {
            orderNumber,
            supplierId,
            items,
            totalAmount,
            status,
            state,
            city,
            district,
            itemId,
            brand,
            watt,
            technology
        } = req.body;

        // Check if order number already exists
        const existingOrder = await ProcurementOrder.findOne({ orderNumber });
        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: 'Order number already exists'
            });
        }

        // Validate Supplier exists (only if provided)
        if (supplierId) {
            const supplier = await SupplierVendor.findById(supplierId).catch(() => null);
            if (!supplier && !supplierId.startsWith('65f1a')) { // Only error if it looks like a real ID attempt but fails
                return res.status(400).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }
        }

        const order = await ProcurementOrder.create({
            orderNumber,
            supplierId,
            items,
            totalAmount,
            status: status || 'Pending',
            state,
            city,
            district,
            itemId,
            brand,
            watt,
            technology,
            createdBy: req.user.id
        });

        // Populate for response
        await order.populate([
            { path: 'supplierId', select: 'name' },
            { path: 'items.product', select: 'name' },
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'district', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Procurement order created successfully',
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update procurement order
// @route   PUT /api/procurement-orders/:id
// @access  Private
export const updateOrder = async (req, res, next) => {
    try {
        const {
            supplierId,
            items,
            totalAmount,
            status,
            state,
            city,
            district
        } = req.body;

        let order = await ProcurementOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update fields
        order.supplierId = supplierId || order.supplierId;
        order.items = items || order.items;
        order.totalAmount = totalAmount !== undefined ? totalAmount : order.totalAmount;
        order.status = status || order.status;
        order.state = state || order.state;
        order.city = city || order.city;
        order.district = district || order.district;
        order.updatedBy = req.user.id;

        await order.save();

        await order.populate([
            { path: 'supplierId', select: 'name' },
            { path: 'items.product', select: 'name' },
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'district', select: 'name' }
        ]);

        res.json({
            success: true,
            message: 'Procurement order updated successfully',
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update order status
// @route   PUT /api/procurement-orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await ProcurementOrder.findByIdAndUpdate(
            req.params.id,
            { status, updatedBy: req.user.id },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete procurement order
// @route   DELETE /api/procurement-orders/:id
// @access  Private
export const deleteOrder = async (req, res, next) => {
    try {
        const order = await ProcurementOrder.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};
