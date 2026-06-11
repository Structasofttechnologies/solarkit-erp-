import SKU from '../../models/inventory/SKU.js';
import Product from '../../models/inventory/Product.js';

export const getAllSKUs = async (req, res, next) => {
    try {
        const { status, brand, product, category, projectType, productType, technology, wattage, productName } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';
        if (brand) query.brand = brand;
        if (product) query.product = product;
        if (projectType) query.projectType = projectType;
        if (productType) query.productType = productType;
        if (technology) query.technology = technology;
        if (wattage) query.wattage = wattage;

        // Filter by category — with fallback to product names containing the category name (e.g. 'BOS', 'Inverter', 'Panel')
        if (category) {
            const cleanCat = category.trim();
            let regexPattern = cleanCat;
            if (cleanCat.toUpperCase() === 'BOS') {
                regexPattern = 'BOS';
            } else if (cleanCat.toLowerCase().includes('inverter') || cleanCat.toLowerCase().includes('invertor')) {
                regexPattern = 'Invert';
            } else if (cleanCat.toLowerCase().includes('panel')) {
                regexPattern = 'Panel';
            }

            const matchingProducts = await Product.find({ name: { $regex: new RegExp(regexPattern, 'i') } }).select('_id');
            const productIds = matchingProducts.map(p => p._id);
            query.$or = [
                { category: { $regex: new RegExp(cleanCat, 'i') } },
                { product: { $in: productIds } }
            ];
        }

        // Filter by product name — find matching product IDs first, then filter SKUs
        if (productName) {
            const matchingProducts = await Product.find({ name: { $regex: new RegExp(productName, 'i') } }).select('_id');
            const productIds = matchingProducts.map(p => p._id);
            query.product = { $in: productIds };
        }


        const skus = await SKU.find(query)
            .populate({
                path: 'product',
                select: 'name brandId',
                populate: {
                    path: 'brandId',
                    select: 'companyName brand brandLogo'
                }
            })
            .populate({
                path: 'brand',
                model: 'BrandManufacturer',
                select: 'companyName brand brandLogo'
            })
            .sort({ createdAt: -1 });

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const buildLogoUrl = (logo) => logo
            ? (logo.startsWith('http') || logo.startsWith('data:image') ? logo : `${baseUrl}${logo}`)
            : null;

        const formatted = skus.map(sku => {
            const s = sku.toJSON ? sku.toJSON() : sku;

            // Priority 1: brand from linked Product — flatten to root
            if (s.product?.brandId) {
                const b = s.product.brandId;
                s.productId = s.product._id;
                s.productName = s.product.name;
                s.companyName = b.companyName || null;
                s.brandName = b.brand || null;
                s.brandLogo = b.brandLogo || null;
                s.brandLogoUrl = buildLogoUrl(b.brandLogo);
            }
            // Priority 2: direct 'brand' field on SKU (older SKUs without product link)
            else if (s.brand && typeof s.brand === 'object') {
                const b = s.brand;
                s.productId = null;
                s.productName = null;
                s.companyName = b.companyName || null;
                s.brandName = b.brand || null;
                s.brandLogo = b.brandLogo || null;
                s.brandLogoUrl = buildLogoUrl(b.brandLogo);
            }

            // Always add name and skuName (since frontend dropdowns and quick quote look for name/skuName)
            s.name = s.description || s.skuCode;
            s.skuName = s.skuCode;
            s.productName = s.productName || s.description || s.skuCode;

            // Override for BOS Kits: remove manufacturer brand info and use the specialized BOS kit image
            const isBos = (s.category && s.category.toUpperCase() === 'BOS') ||
                          (s.productName && s.productName.toUpperCase().includes('BOS')) ||
                          (s.skuCode && s.skuCode.toUpperCase().includes('BOS'));

            if (isBos) {
                s.companyName = null;
                s.brandName = null;
                s.brandLogo = null;
                s.brandLogoUrl = null;
                s.image = "/uploads/images/boskit.png";
                s.imageUrl = buildLogoUrl("/uploads/images/boskit.png");
            } else {
                s.imageUrl = buildLogoUrl(s.image);
            }

            // Remove nested product object
            delete s.product;

            return s;
        });

        res.json({ success: true, count: formatted.length, data: formatted });
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
