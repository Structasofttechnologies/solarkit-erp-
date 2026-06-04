import SKU from '../../models/inventory/SKU.js';
import Product from '../../models/inventory/Product.js';

export const getAllSKUs = async (req, res, next) => {
    try {
        const { status, brand, product, category, projectType, productType, technology, wattage } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';
        if (brand) query.brand = brand;
        if (product) query.product = product;
        if (category) query.category = category;
        if (projectType) query.projectType = projectType;
        if (productType) query.productType = productType;
        if (technology) query.technology = technology;
        if (wattage) query.wattage = wattage;

        const skus = await SKU.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: skus.length, data: skus });
    } catch (err) {
        next(err);
    }
};

export const createSKU = async (req, res, next) => {
    try {
        const { skuCode, description, brand, category, projectType, productType, technology, wattage } = req.body;

        if (!skuCode) return res.status(400).json({ success: false, message: 'SKU Code is required' });

        // Check if SKU already exists
        const existingSKU = await SKU.findOne({ skuCode });
        if (existingSKU) {
            return res.status(200).json({ 
                success: true, 
                message: 'SKU already exists', 
                data: existingSKU 
            });
        }

        const sku = await SKU.create({
            skuCode,
            description,
            brand,
            category,
            projectType,
            productType,
            technology,
            wattage,
            createdBy: req.user?.id
        });

        res.status(201).json({ success: true, message: 'SKU created successfully', data: sku });
    } catch (err) {
        next(err);
    }
};

export const updateSKU = async (req, res, next) => {
    try {
        const { skuCode, description, status, brand, category, projectType, productType, technology, wattage, phase, capacity } = req.body;

        const sku = await SKU.findByIdAndUpdate(
            req.params.id,
            { skuCode, description, status, brand, category, projectType, productType, technology, wattage, phase, capacity, updatedBy: req.user?.id },
            { new: true, runValidators: true }
        );

        if (!sku) return res.status(404).json({ success: false, message: 'SKU not found' });

        res.json({ success: true, message: 'SKU updated successfully', data: sku });
    } catch (err) {
        next(err);
    }
};

export const deleteSKU = async (req, res, next) => {
    try {
        const sku = await SKU.findById(req.params.id);
        if (!sku) return res.status(404).json({ success: false, message: 'SKU not found' });

        const skuCode = sku.skuCode;
        const productId = sku.product;

        // Delete the SKU document
        await SKU.findByIdAndDelete(req.params.id);

        // Remove from Product's additionalSkus if associated
        if (productId) {
            await Product.findByIdAndUpdate(productId, {
                $pull: { additionalSkus: skuCode }
            });
        }

        res.json({ success: true, message: 'SKU deleted successfully' });
    } catch (err) {
        next(err);
    }
}

export const saveSKUParameters = async (req, res, next) => {
    try {
        const { skuCode, parameters } = req.body;

        if (!skuCode) return res.status(400).json({ success: false, message: 'SKU Code is required' });

        const sku = await SKU.findOneAndUpdate(
            { skuCode },
            { parameters, updatedBy: req.user?.id },
            { new: true, upsert: true } // Create if doesn't exist? Maybe just update.
        );

        res.json({ success: true, message: 'Parameters saved successfully', data: sku });
    } catch (err) {
        next(err);
    }
};

export const getSKUParameters = async (req, res, next) => {
    try {
        const { skuCode } = req.params;
        const sku = await SKU.findOne({ skuCode });

        if (!sku) {
            return res.status(404).json({ success: false, message: 'SKU not found' });
        }

        res.json({ success: true, data: sku.parameters || [] });
    } catch (err) {
        next(err);
    }
};

export const saveSKUImage = async (req, res, next) => {
    try {
        const { skuCode, image } = req.body;

        if (!skuCode) return res.status(400).json({ success: false, message: 'SKU Code is required' });

        const sku = await SKU.findOneAndUpdate(
            { skuCode },
            { image, updatedBy: req.user?.id },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Image saved successfully', data: sku });
    } catch (err) {
        next(err);
    }
};

export const getSKUImage = async (req, res, next) => {
    try {
        const { skuCode } = req.params;
        const sku = await SKU.findOne({ skuCode });

        if (!sku) {
            return res.status(404).json({ success: false, message: 'SKU not found' });
        }

        res.json({ success: true, data: sku.image || null });
    } catch (err) {
        next(err);
    }
};

export const bulkCreateSKUs = async (req, res, next) => {
    try {
        const { skus } = req.body;
        if (!Array.isArray(skus)) return res.status(400).json({ success: false, message: 'SKUs array is required' });

        const results = [];
        for (const skuData of skus) {
            const { skuCode } = skuData;
            const sku = await SKU.findOneAndUpdate(
                { skuCode },
                { ...skuData, updatedBy: req.user?.id },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            results.push(sku);
        }

        res.json({ success: true, message: `${results.length} SKUs processed`, data: results });
    } catch (err) {
        next(err);
    }
};

export const getSKUsByProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const skus = await SKU.find({ product: productId }).sort({ capacity: 1 });
        res.json({ success: true, data: skus });
    } catch (err) {
        next(err);
    }
};
