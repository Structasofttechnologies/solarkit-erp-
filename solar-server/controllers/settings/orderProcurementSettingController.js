import OrderProcurementSetting from '../../models/orders/OrderProcurementSetting.js';

// @desc    Get all order procurement settings
// @route   GET /api/settings/order-procurement
// @access  Private
export const getAllSettings = async (req, res, next) => {
    try {
        const query = {};
        if (req.query.state) query.state = req.query.state;
        if (req.query.cluster) query.cluster = req.query.cluster;
        if (req.query.warehouse) query.warehouse = req.query.warehouse;

        const settings = await OrderProcurementSetting.find(query)
            .populate('product', 'name')
            .populate('brand', 'name')
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('warehouse', 'name')
            .populate('skuItems.supplierType', 'loginTypeName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: settings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single order procurement setting
// @route   GET /api/settings/order-procurement/:id
// @access  Private
export const getSettingById = async (req, res, next) => {
    try {
        const setting = await OrderProcurementSetting.findById(req.params.id)
            .populate('product', 'name')
            .populate('brand', 'name')
            .populate('skuItems.supplierType', 'loginTypeName');

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            data: setting
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new order procurement setting
// @route   POST /api/settings/order-procurement
// @access  Private
export const createSetting = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;

        const setting = await OrderProcurementSetting.create(req.body);

        await setting.populate([
            { path: 'product', select: 'name' },
            { path: 'brand', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Order Procurement Setting created successfully',
            data: setting
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update order procurement setting
// @route   PUT /api/settings/order-procurement/:id
// @access  Private
export const updateSetting = async (req, res, next) => {
    try {
        let setting = await OrderProcurementSetting.findById(req.params.id);

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        req.body.updatedBy = req.user.id;

        setting = await OrderProcurementSetting.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate([
            { path: 'product', select: 'name' },
            { path: 'brand', select: 'name' }
        ]);

        res.json({
            success: true,
            message: 'Order Procurement Setting updated successfully',
            data: setting
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete order procurement setting
// @route   DELETE /api/settings/order-procurement/:id
// @access  Private
export const deleteSetting = async (req, res, next) => {
    try {
        const setting = await OrderProcurementSetting.findByIdAndDelete(req.params.id);

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            message: 'Order Procurement Setting deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};
