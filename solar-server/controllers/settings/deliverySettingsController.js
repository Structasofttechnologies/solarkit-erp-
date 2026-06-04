import DeliveryType from '../../models/orders/DeliveryType.js';
import DeliveryBenchmarkPrice from '../../models/orders/DeliveryBenchmarkPrice.js';
import Vehicle from '../../models/orders/Vehicle.js';
import VendorDeliveryConfig from '../../models/vendors/VendorDeliveryConfig.js';
import VendorDeliveryPlan from '../../models/vendors/VendorDeliveryPlan.js';

// ==========================================
// Delivery Types
// ==========================================

export const getDeliveryTypes = async (req, res) => {
    try {
        // Drop old unique index if it exists to allow location-specific delivery types
        try {
            await DeliveryType.collection.dropIndex('name_1');
        } catch (e) { }

        const { state, cluster, warehouse, district, status, includeGlobal } = req.query;
        let filter = {};
        if (status) filter.status = status;

        if (includeGlobal === 'true' && (state || cluster || warehouse || district)) {
            filter.$or = [
                // Global types (no specific location mapping)
                { state: null, cluster: null, warehouse: null, district: null },
                // Types matching current filters exactly for their hierarchy level
                {
                    $and: [
                        state ? { state } : {},
                        cluster ? { cluster } : {},
                        warehouse ? { warehouse } : {},
                        district ? { district } : {}
                    ].filter(c => Object.keys(c).length > 0)
                }
            ];
        } else {
            if (state) filter.state = state;
            if (cluster) filter.cluster = cluster;
            if (warehouse) filter.warehouse = warehouse;
            if (district) filter.district = district;
        }

        const types = await DeliveryType.find(filter)
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('warehouse', 'name')
            .populate('district', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: types.length, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDeliveryType = async (req, res) => {
    try {
        const type = await DeliveryType.create(req.body);
        await type.populate(['state', 'cluster', 'warehouse', 'district']);
        res.status(201).json({ success: true, data: type });
    } catch (error) {
        // Handle generic errors since unique constraint is removed
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDeliveryType = async (req, res) => {
    try {
        const type = await DeliveryType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate(['state', 'cluster', 'warehouse', 'district']);

        if (!type) {
            return res.status(404).json({ success: false, message: 'Delivery type not found' });
        }
        res.status(200).json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDeliveryType = async (req, res) => {
    try {
        const type = await DeliveryType.findByIdAndDelete(req.params.id);
        if (!type) {
            return res.status(404).json({ success: false, message: 'Delivery type not found' });
        }
        res.status(200).json({ success: true, message: 'Delivery type deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Delivery Benchmark Prices
// ==========================================

export const getBenchmarkPrices = async (req, res) => {
    try {
        // TEMP RUN: Drop the conflicting index safely
        try {
            await DeliveryBenchmarkPrice.collection.dropIndex('deliveryType_1');
        } catch (e) { }
        try {
            await DeliveryBenchmarkPrice.collection.dropIndex('deliveryType_1_location_1');
        } catch (e) { }

        const { state, cluster, district, category, projectType } = req.query;
        let filter = {};

        if (state) filter.state = state;
        if (cluster) filter.cluster = cluster;
        if (district) filter.district = district;
        if (category) filter.category = category;
        if (projectType) filter.projectType = projectType;

        const prices = await DeliveryBenchmarkPrice.find(filter)
            .populate('deliveryType')
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: prices.length, data: prices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBenchmarkPrice = async (req, res) => {
    try {
        const price = await DeliveryBenchmarkPrice.create(req.body);
        await price.populate(['deliveryType', 'state', 'cluster', 'district']);
        res.status(201).json({ success: true, data: price });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Benchmark price for this combination already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBenchmarkPrice = async (req, res) => {
    try {
        const price = await DeliveryBenchmarkPrice.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate(['deliveryType', 'state', 'cluster', 'district']);

        if (!price) {
            return res.status(404).json({ success: false, message: 'Benchmark price not found' });
        }
        res.status(200).json({ success: true, data: price });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBenchmarkPrice = async (req, res) => {
    try {
        const price = await DeliveryBenchmarkPrice.findByIdAndDelete(req.params.id);
        if (!price) {
            return res.status(404).json({ success: false, message: 'Benchmark price not found' });
        }
        res.status(200).json({ success: true, message: 'Benchmark price deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Vehicles
// ==========================================

export const getVehicles = async (req, res) => {
    try {
        const { state, cluster, warehouse, district, status } = req.query;
        let filter = {};
        if (state) filter.state = state;
        if (cluster) filter.cluster = cluster;
        if (warehouse) filter.warehouse = warehouse;
        if (district) filter.district = district;
        if (status) filter.status = status;

        const vehicles = await Vehicle.find(filter)
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('warehouse', 'name')
            .populate('district', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        await vehicle.populate(['state', 'cluster', 'warehouse', 'district']);
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Vehicle name already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate(['state', 'cluster', 'warehouse', 'district']);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.status(200).json({ success: true, message: 'Vehicle deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Vendor Delivery Config
// ==========================================

export const getVendorDeliveryConfig = async (req, res) => {
    try {
        let config = await VendorDeliveryConfig.findOne();
        if (!config) {
            // Return defaults if not created yet
            config = { distanceThreshold: 50, allowPickup: true, allowDelivery: true };
        }
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const upsertVendorDeliveryConfig = async (req, res) => {
    try {
        let config = await VendorDeliveryConfig.findOne();
        if (config) {
            config = await VendorDeliveryConfig.findByIdAndUpdate(config._id, req.body, { new: true, runValidators: true });
        } else {
            config = await VendorDeliveryConfig.create(req.body);
        }
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Vendor Delivery Plans (Legacy Individual Plans)
// ==========================================

export const getVendorDeliveryPlans = async (req, res) => {
    try {
        const plans = await VendorDeliveryPlan.find()
            .populate('vendor', 'name email phone')
            .populate('deliveryType')
            .populate('vehicle')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: plans.length, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createVendorDeliveryPlan = async (req, res) => {
    try {
        const plan = await VendorDeliveryPlan.create(req.body);
        await plan.populate(['vendor', 'deliveryType', 'vehicle']);
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Plan for this vendor, delivery type, and vehicle already exists',
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateVendorDeliveryPlan = async (req, res) => {
    try {
        const plan = await VendorDeliveryPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate(['vendor', 'deliveryType', 'vehicle']);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Vendor delivery plan not found' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteVendorDeliveryPlan = async (req, res) => {
    try {
        const plan = await VendorDeliveryPlan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Vendor delivery plan not found' });
        }
        res.status(200).json({ success: true, message: 'Vendor delivery plan deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ==========================================
// Applicable Categories (Nested)
// ==========================================

export const deleteApplicableCategory = async (req, res) => {
    try {
        const { id, categoryId } = req.params;
        const type = await DeliveryType.findByIdAndUpdate(
            id,
            { $pull: { applicableCategories: { _id: categoryId } } },
            { new: true }
        ).populate(['state', 'cluster', 'district']);

        if (!type) {
            return res.status(404).json({ success: false, message: 'Delivery type not found' });
        }
        res.status(200).json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addApplicableCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const type = await DeliveryType.findByIdAndUpdate(
            id,
            { $push: { applicableCategories: req.body } },
            { new: true }
        ).populate(['state', 'cluster', 'district']);

        if (!type) {
            return res.status(404).json({ success: false, message: 'Delivery type not found' });
        }
        res.status(200).json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateApplicableCategory = async (req, res) => {
    try {
        const { id, categoryId } = req.params;
        // Construct the $set object for the specific array element
        const updateObj = {};
        for (const [key, value] of Object.entries(req.body)) {
            updateObj[`applicableCategories.$.${key}`] = value;
        }

        const type = await DeliveryType.findOneAndUpdate(
            { _id: id, "applicableCategories._id": categoryId },
            { $set: updateObj },
            { new: true }
        ).populate(['state', 'cluster', 'district']);

        if (!type) {
            return res.status(404).json({ success: false, message: 'Delivery type or category not found' });
        }
        res.status(200).json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
