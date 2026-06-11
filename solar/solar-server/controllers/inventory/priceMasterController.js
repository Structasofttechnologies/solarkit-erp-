import PriceMaster from '../../models/finance/PriceMaster.js';

export const getAllPriceMasters = async (req, res, next) => {
    try {
        const { productId, stateId, clusterId, technology, status } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';
        if (productId) query.productId = productId;
        if (stateId) query.stateId = stateId;
        if (clusterId) query.clusterId = clusterId;
        if (technology !== undefined) query.technology = technology;

        const prices = await PriceMaster.find(query).populate('productId stateId clusterId').sort({ createdAt: -1 });
        res.json({ success: true, count: prices.length, data: prices });
    } catch (err) {
        next(err);
    }
};

export const createPriceMaster = async (req, res, next) => {
    try {
        const { productId, stateId, clusterId, technology, basePrice, tax, discount, finalPrice } = req.body;

        if (!productId || !stateId || !clusterId || basePrice === undefined || tax === undefined || finalPrice === undefined) {
            return res.status(400).json({ success: false, message: 'Product, State, Cluster, Base Price, Tax, and Final Price are required' });
        }

        // Check if price exists for product in this specific state and cluster and technology
        const existing = await PriceMaster.findOne({ productId, stateId, clusterId, technology: technology || '' });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Price already exists for this product in the selected cluster and technology. Use update.' });
        }

        const price = await PriceMaster.create({
            productId,
            stateId,
            clusterId,
            technology: technology || '',
            basePrice,
            tax,
            discount,
            finalPrice,
            createdBy: req.user?.id
        });

        await price.populate('productId stateId clusterId');

        res.status(201).json({ success: true, message: 'Price set successfully', data: price });
    } catch (err) {
        next(err);
    }
};

export const updatePriceMaster = async (req, res, next) => {
    try {
        const { productId, stateId, clusterId, technology, basePrice, tax, discount, finalPrice, status } = req.body;

        // If updating by ID (req.params.id is PriceMaster ID)
        let price;
        if (req.params.id) {
            price = await PriceMaster.findByIdAndUpdate(
                req.params.id,
                { productId, stateId, clusterId, technology: technology || '', basePrice, tax, discount, finalPrice, status, updatedBy: req.user?.id },
                { new: true, runValidators: true }
            );
        } else if (productId && stateId && clusterId) {
            // Fallback if needed: update by product/state/cluster combo
            price = await PriceMaster.findOneAndUpdate(
                { productId, stateId, clusterId, technology: technology || '' },
                { basePrice, tax, discount, finalPrice, status, updatedBy: req.user?.id },
                { new: true, runValidators: true }
            );
        }

        if (!price) return res.status(404).json({ success: false, message: 'Price Master not found' });
        await price.populate('productId stateId clusterId');

        res.json({ success: true, message: 'Price updated successfully', data: price });
    } catch (err) {
        next(err);
    }
};

export const deletePriceMaster = async (req, res, next) => {
    try {
        const price = await PriceMaster.findByIdAndDelete(req.params.id);
        if (!price) return res.status(404).json({ success: false, message: 'Price Master not found' });
        res.json({ success: true, message: 'Price deleted successfully' });
    } catch (err) {
        next(err);
    }
}
