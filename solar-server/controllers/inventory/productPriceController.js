import ProductPrice from '../../models/inventory/ProductPrice.js';

export const createProductPriceHandler = {
    // Get prices for a specific cluster (and optionally product)
    getAll: async (req, res, next) => {
        try {
            const { clusterId, productId } = req.query;
            const query = {};
            if (clusterId) query.cluster = clusterId;
            if (productId) query.product = productId;

            const prices = await ProductPrice.find(query).populate('product').populate('sku');
            res.json({ success: true, count: prices.length, data: prices });
        } catch (err) {
            next(err);
        }
    },

    // Create or Update Price (Upsert)
    upsert: async (req, res, next) => {
        try {
            const { product, sku, cluster, state, price, gst } = req.body;

            // Calculate base price if needed
            const basePrice = price && gst ? (price / (1 + gst / 100)) : (req.body.basePrice || 0);

            const item = await ProductPrice.findOneAndUpdate(
                { sku, cluster },
                {
                    product, sku, cluster, state, price, gst, basePrice,
                    updatedBy: req.user?.id,
                    $setOnInsert: { createdBy: req.user?.id }
                },
                { new: true, upsert: true, runValidators: true }
            );

            res.json({ success: true, message: 'Price saved successfully', data: item });
        } catch (err) {
            next(err);
        }
    },

    bulkUpsert: async (req, res, next) => {
        try {
            const { prices } = req.body;
            if (!Array.isArray(prices)) return res.status(400).json({ success: false, message: 'Prices array is required' });

            const results = [];
            for (const p of prices) {
                const { sku, cluster, product, state, price, gst } = p;
                const basePrice = price && gst ? (price / (1 + gst / 100)) : (p.basePrice || 0);

                const item = await ProductPrice.findOneAndUpdate(
                    { sku, cluster },
                    {
                        sku, product, cluster, state, price, gst, basePrice,
                        updatedBy: req.user?.id,
                        $setOnInsert: { createdBy: req.user?.id }
                    },
                    { new: true, upsert: true, runValidators: true }
                );
                results.push(item);
            }

            res.json({ success: true, message: `${results.length} Prices saved successfully`, data: results });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            await ProductPrice.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Price deleted' });
        } catch (err) {
            next(err);
        }
    }
};
