import mongoose from 'mongoose';
import QuickQuote from '../../models/finance/QuickQuote.js';
import SKU from '../../models/inventory/SKU.js';
import ComboKitAssignment from '../../models/inventory/ComboKitAssignment.js';
import BrandManufacturer from '../../models/inventory/BrandManufacturer.js';

// Helper for populating relations
const populateOptions = [
    { path: 'district', select: 'name' },
    { path: 'category', select: 'name' },
    { path: 'subCategory', select: 'name' },
    { path: 'projectType', model: 'ProjectCategoryMapping', select: 'projectTypeFrom projectTypeTo' },
    { path: 'subProjectType', select: 'name' },
    { path: 'brand', select: 'companyName name brand' }, // Depending on BrandManufacturer schema
    { path: 'technology', select: 'name' },
    { path: 'solarPanelWatt', select: 'name' },
    { path: 'kilowatt', select: 'name kw' },
    { path: 'comboKit', select: 'name solarkitName comboKits' },
    { path: 'terraceType', select: 'name' }
];

// Helper to construct full URL for images
const getFullUrl = (req, urlPath) => {
    if (!urlPath) return null;
    if (urlPath.startsWith('http')) return urlPath;
    if (urlPath.startsWith('/uploads/')) {
        return `${req.protocol}://${req.get('host')}${urlPath}`;
    }
    return `${req.protocol}://${req.get('host')}/${urlPath}`;
};

// ==========================================
// Create Quick Quote
// ==========================================
export const createQuickQuote = async (req, res) => {
    try {
        // Map common frontend field names for combo kit to the schema field 'comboKit'
        if (req.body.kitId && !req.body.comboKit) {
            req.body.comboKit = req.body.kitId;
        } else if (req.body.comboKitId && !req.body.comboKit) {
            req.body.comboKit = req.body.comboKitId;
        }

        const quoteId = req.body.id || req.body._id;

        // Remove empty IDs to prevent Mongoose CastErrors
        if (!req.body.id) delete req.body.id;
        if (!req.body._id) delete req.body._id;

        // Map mobile's "Customize Kit" to the schema's "Customized Kit"
        if (req.body.kitType === 'Customize Kit') {
            req.body.kitType = 'Customize Kit';
        }

        // If the comboKit passed is actually a variant ID from comboKits array, find the parent ComboKitAssignment
        if (req.body.comboKit && mongoose.Types.ObjectId.isValid(req.body.comboKit)) {
            const parentExists = await ComboKitAssignment.exists({ _id: req.body.comboKit });
            if (!parentExists) {
                // Not a parent ID, check if it's a variant ID
                const matchingParent = await ComboKitAssignment.findOne({ "comboKits._id": req.body.comboKit }).lean();
                if (matchingParent) {
                    req.body.comboKit = matchingParent._id.toString();
                }
            }
        }

        let savedQuote;

        if (quoteId) {
            // Update existing quote
            await QuickQuote.findByIdAndUpdate(quoteId, req.body, { new: true, runValidators: true });
            savedQuote = await QuickQuote.findById(quoteId).populate(populateOptions).lean();
            if (!savedQuote) {
                return res.status(404).json({ success: false, message: 'Quick Quote not found for update' });
            }
        } else {
            // Create new quote
            const newQuote = new QuickQuote(req.body);
            await newQuote.save();
            savedQuote = await QuickQuote.findById(newQuote._id).populate(populateOptions).lean();
        }

        // Auto-fetch images and details for Combo Kit
        if (savedQuote.kitType === 'Combo Kit') {
            let img = savedQuote.image;
            let pBrand = null;
            let iBrand = null;

            if (!img && savedQuote.comboKit?.comboKits?.length > 0) {
                img = savedQuote.comboKit.comboKits[0].image;
            }

            if (savedQuote.comboKit?.comboKits?.length > 0) {
                const matchedKit = savedQuote.comboKit.comboKits.find(k => k.image === img);
                if (matchedKit) {
                    pBrand = matchedKit.panelBrand;
                    iBrand = matchedKit.inverterBrand;
                } else if (savedQuote.comboKit.comboKits[0]) {
                    pBrand = savedQuote.comboKit.comboKits[0].panelBrand;
                    iBrand = savedQuote.comboKit.comboKits[0].inverterBrand;
                }
            }

            if (!img && savedQuote.brand) {
                const brandId = savedQuote.brand._id || savedQuote.brand;
                const brandDoc = await BrandManufacturer.findById(brandId).lean();
                const brandName = brandDoc?.companyName || brandDoc?.brand;
                if (brandName) {
                    const fallbackKit = await ComboKitAssignment.findOne({
                        $or: [
                            { brandName: { $regex: new RegExp(brandName, 'i') } },
                            { 'comboKits.panelBrand': { $regex: new RegExp(brandName, 'i') } }
                        ]
                    }).lean();
                    if (fallbackKit && fallbackKit.comboKits && fallbackKit.comboKits.length > 0) {
                        img = fallbackKit.comboKits[0].image;
                        pBrand = fallbackKit.comboKits[0].panelBrand;
                        iBrand = fallbackKit.comboKits[0].inverterBrand;
                    }
                }
            }

            if (img && !savedQuote.image) {
                savedQuote.image = img;
                await QuickQuote.findByIdAndUpdate(savedQuote._id, { image: img });
            }

            savedQuote.image = getFullUrl(req, img);
            savedQuote.panelBrand = pBrand || null;
            savedQuote.inverterBrand = iBrand || null;

            // Fetch brand logo images
            let pLogo = null;
            let iLogo = null;
            if (pBrand) {
                const pBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                pLogo = pBrandDoc?.brandLogo;
            }
            if (iBrand) {
                const iBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                iLogo = iBrandDoc?.brandLogo;
            }
            savedQuote.panelBrandImage = getFullUrl(req, pLogo);
            savedQuote.inverterBrandImage = getFullUrl(req, iLogo);
        } else if (savedQuote.kitType === 'Customize Kit') {
            if (savedQuote.solarPanel && mongoose.Types.ObjectId.isValid(savedQuote.solarPanel)) {
                const panelSku = await SKU.findById(savedQuote.solarPanel).populate({ path: 'brand', model: 'BrandManufacturer' }).lean();
                savedQuote.solarPanelImage = getFullUrl(req, panelSku?.image || panelSku?.brand?.brandLogo);
            }
            if (savedQuote.solarInverter && mongoose.Types.ObjectId.isValid(savedQuote.solarInverter)) {
                const inverterSku = await SKU.findById(savedQuote.solarInverter).populate({ path: 'brand', model: 'BrandManufacturer' }).lean();
                savedQuote.solarInverterImage = getFullUrl(req, inverterSku?.image || inverterSku?.brand?.brandLogo);
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        savedQuote.webViewUrl = `${frontendUrl}/quote-view/${savedQuote._id}`;
        savedQuote.pdfDownloadUrl = `${frontendUrl}/quote-view/${savedQuote._id}.pdf`;

        res.status(quoteId ? 200 : 201).json({
            success: true,
            message: quoteId ? 'Quick Quote updated successfully' : 'Quick Quote created successfully',
            data: savedQuote
        });
    } catch (error) {
        console.error("Error creating quick quote:", error);
        res.status(500).json({ success: false, message: 'Failed to create Quick Quote', error: error.message });
    }
};

// ==========================================
// Get All Quick Quotes
// ==========================================
export const getAllQuickQuotes = async (req, res) => {
    try {
        const query = {};

        // Helper to parse comma-separated values for MongoDB $in query
        const buildFilter = (param) => {
            if (!param) return undefined;
            const values = param.split(',').map(v => v.trim()).filter(v => v);
            if (values.length === 0) return undefined;
            return values.length > 1 ? { $in: values } : values[0];
        };

        // Dynamic Filters
        if (req.query.userId) query.userId = req.query.userId;

        const districtFilter = buildFilter(req.query.district);
        if (districtFilter) query.district = districtFilter;

        const categoryFilter = buildFilter(req.query.category);
        if (categoryFilter) query.category = categoryFilter;

        const subCategoryFilter = buildFilter(req.query.subCategory);
        if (subCategoryFilter) query.subCategory = subCategoryFilter;

        const projectTypeFilter = buildFilter(req.query.projectType);
        if (projectTypeFilter) query.projectType = projectTypeFilter;

        const subProjectTypeFilter = buildFilter(req.query.subProjectType);
        if (subProjectTypeFilter) query.subProjectType = subProjectTypeFilter;

        const quotes = await QuickQuote.find(query).populate(populateOptions).sort({ createdAt: -1 }).lean();

        // Collect SKUs for Customized Kits
        const skuIdsToFetch = new Set();
        quotes.forEach(q => {
            if (q.kitType === 'Customized Kit') {
                if (q.solarPanel && mongoose.Types.ObjectId.isValid(q.solarPanel)) skuIdsToFetch.add(q.solarPanel);
                if (q.solarInverter && mongoose.Types.ObjectId.isValid(q.solarInverter)) skuIdsToFetch.add(q.solarInverter);
            }
        });

        const skus = await SKU.find({ _id: { $in: Array.from(skuIdsToFetch) } }).populate({ path: 'brand', model: 'BrandManufacturer' }).lean();
        const skuImageMap = {};
        skus.forEach(s => skuImageMap[s._id.toString()] = s.image || s.brand?.brandLogo);

        // Pre-fetch fallback combokit images and details by brand
        const fallbackBrands = new Set();
        quotes.forEach(q => {
            if (q.kitType === 'Combo Kit' && (!q.comboKit || !q.comboKit.comboKits)) {
                const brandId = q.brand?._id ? q.brand._id.toString() : (q.brand ? q.brand.toString() : null);
                if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
                    fallbackBrands.add(brandId);
                }
            }
        });
        const fallbackBrandMap = {};
        if (fallbackBrands.size > 0) {
            const brands = await BrandManufacturer.find({ _id: { $in: Array.from(fallbackBrands) } }).lean();
            for (const brand of brands) {
                const brandName = brand.companyName || brand.brand;
                if (brandName) {
                    const fallbackKit = await ComboKitAssignment.findOne({
                        $or: [
                            { brandName: { $regex: new RegExp(brandName, 'i') } },
                            { 'comboKits.panelBrand': { $regex: new RegExp(brandName, 'i') } }
                        ]
                    }).lean();
                    if (fallbackKit && fallbackKit.comboKits && fallbackKit.comboKits.length > 0) {
                        fallbackBrandMap[brand._id.toString()] = {
                            image: fallbackKit.comboKits[0].image,
                            panelBrand: fallbackKit.comboKits[0].panelBrand,
                            inverterBrand: fallbackKit.comboKits[0].inverterBrand
                        };
                    }
                }
            }
        }

        // Map full URLs and extract brand names
        const brandNamesToFetch = new Set();
        const formattedQuotes = quotes.map(quote => {
            const formatted = { ...quote };

            if (quote.kitType === 'Combo Kit') {
                let img = quote.image;
                let pBrand = null;
                let iBrand = null;

                if (!img && quote.comboKit?.comboKits?.length > 0) {
                    img = quote.comboKit.comboKits[0].image;
                }

                if (quote.comboKit?.comboKits?.length > 0) {
                    const matchedKit = quote.comboKit.comboKits.find(k => k.image === img);
                    if (matchedKit) {
                        pBrand = matchedKit.panelBrand;
                        iBrand = matchedKit.inverterBrand;
                    } else if (quote.comboKit.comboKits[0]) {
                        pBrand = quote.comboKit.comboKits[0].panelBrand;
                        iBrand = quote.comboKit.comboKits[0].inverterBrand;
                    }
                }

                if (!pBrand && quote.brand) {
                    const brandId = quote.brand._id?.toString() || quote.brand.toString();
                    const fallback = fallbackBrandMap[brandId];
                    if (fallback) {
                        if (!img) img = fallback.image;
                        pBrand = fallback.panelBrand;
                        iBrand = fallback.inverterBrand;
                    }
                }

                formatted.image = getFullUrl(req, img);
                formatted.panelBrand = pBrand || null;
                formatted.inverterBrand = iBrand || null;

                if (pBrand) brandNamesToFetch.add(pBrand.trim());
                if (iBrand) brandNamesToFetch.add(iBrand.trim());
            } else if (quote.kitType === 'Customized Kit') {
                const panelImg = quote.solarPanel ? skuImageMap[quote.solarPanel] : null;
                const inverterImg = quote.solarInverter ? skuImageMap[quote.solarInverter] : null;

                formatted.solarPanelImage = getFullUrl(req, panelImg);
                formatted.solarInverterImage = getFullUrl(req, inverterImg);
            }
            return formatted;
        });

        // Resolve brand logo URLs for the batch of quotes
        const brandLogoMap = {};
        if (brandNamesToFetch.size > 0) {
            const brandNamesArr = Array.from(brandNamesToFetch);
            const brandDocs = await BrandManufacturer.find({
                $or: [
                    { brand: { $in: brandNamesArr } },
                    { companyName: { $in: brandNamesArr } }
                ]
            }).lean();

            brandDocs.forEach(b => {
                const bName = (b.brand || b.companyName || '').toLowerCase().trim();
                brandLogoMap[bName] = b.brandLogo;
            });

            for (const bName of brandNamesArr) {
                const lowerName = bName.toLowerCase();
                if (!brandLogoMap[lowerName]) {
                    const matchedDoc = brandDocs.find(b =>
                        (b.brand || '').toLowerCase().trim() === lowerName ||
                        (b.companyName || '').toLowerCase().trim() === lowerName
                    );
                    if (matchedDoc) {
                        brandLogoMap[lowerName] = matchedDoc.brandLogo;
                    } else {
                        const regexDoc = await BrandManufacturer.findOne({
                            $or: [
                                { brand: { $regex: new RegExp(`^${bName}$`, 'i') } },
                                { companyName: { $regex: new RegExp(`^${bName}$`, 'i') } }
                            ]
                        }).lean();
                        if (regexDoc) {
                            brandLogoMap[lowerName] = regexDoc.brandLogo;
                        }
                    }
                }
            }
        }

        // Add panelBrandImage and inverterBrandImage to response objects
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        formattedQuotes.forEach(q => {
            q.webViewUrl = `${frontendUrl}/quote-view/${q._id}`;
            q.pdfDownloadUrl = `${frontendUrl}/quote-view/${q._id}.pdf`;

            if (q.kitType === 'Combo Kit') {
                const pLogo = q.panelBrand ? brandLogoMap[q.panelBrand.toLowerCase().trim()] : null;
                const iLogo = q.inverterBrand ? brandLogoMap[q.inverterBrand.toLowerCase().trim()] : null;
                q.panelBrandImage = getFullUrl(req, pLogo);
                q.inverterBrandImage = getFullUrl(req, iLogo);
            }
        });

        res.status(200).json({
            success: true,
            message: 'Quick Quotes fetched successfully',
            data: formattedQuotes
        });
    } catch (error) {
        console.error("Error fetching quick quotes:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch Quick Quotes', error: error.message });
    }
};

// ==========================================
// Get Quick Quote By ID
// ==========================================
export const getQuickQuoteById = async (req, res) => {
    try {
        const quote = await QuickQuote.findById(req.params.id).populate(populateOptions).lean();
        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quick Quote not found' });
        }

        if (quote.kitType === 'Combo Kit') {
            let img = quote.image;
            let pBrand = null;
            let iBrand = null;

            if (!img && quote.comboKit?.comboKits?.length > 0) {
                img = quote.comboKit.comboKits[0].image;
            }

            if (quote.comboKit?.comboKits?.length > 0) {
                const matchedKit = quote.comboKit.comboKits.find(k => k.image === img);
                if (matchedKit) {
                    pBrand = matchedKit.panelBrand;
                    iBrand = matchedKit.inverterBrand;
                } else if (quote.comboKit.comboKits[0]) {
                    pBrand = quote.comboKit.comboKits[0].panelBrand;
                    iBrand = quote.comboKit.comboKits[0].inverterBrand;
                }
            }

            if (!img && quote.brand) {
                const brandDoc = await BrandManufacturer.findById(quote.brand._id || quote.brand).lean();
                const brandName = brandDoc?.companyName || brandDoc?.brand;
                if (brandName) {
                    const fallbackKit = await ComboKitAssignment.findOne({
                        $or: [
                            { brandName: { $regex: new RegExp(brandName, 'i') } },
                            { 'comboKits.panelBrand': { $regex: new RegExp(brandName, 'i') } }
                        ]
                    }).lean();
                    if (fallbackKit && fallbackKit.comboKits && fallbackKit.comboKits.length > 0) {
                        img = fallbackKit.comboKits[0].image;
                        pBrand = fallbackKit.comboKits[0].panelBrand;
                        iBrand = fallbackKit.comboKits[0].inverterBrand;
                    }
                }
            }

            if (img && !quote.image) {
                quote.image = img;
                await QuickQuote.findByIdAndUpdate(quote._id, { image: img });
            }

            quote.image = getFullUrl(req, img);
            quote.panelBrand = pBrand || null;
            quote.inverterBrand = iBrand || null;

            // Fetch brand logo images
            let pLogo = null;
            let iLogo = null;
            if (pBrand) {
                const pBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                pLogo = pBrandDoc?.brandLogo;
            }
            if (iBrand) {
                const iBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                iLogo = iBrandDoc?.brandLogo;
            }
            quote.panelBrandImage = getFullUrl(req, pLogo);
            quote.inverterBrandImage = getFullUrl(req, iLogo);
        } else if (quote.kitType === 'Customized Kit') {
            if (quote.solarPanel && mongoose.Types.ObjectId.isValid(quote.solarPanel)) {
                const panelSku = await SKU.findById(quote.solarPanel).populate({ path: 'brand', model: 'BrandManufacturer' }).lean();
                quote.solarPanelImage = getFullUrl(req, panelSku?.image || panelSku?.brand?.brandLogo);
            }
            if (quote.solarInverter && mongoose.Types.ObjectId.isValid(quote.solarInverter)) {
                const inverterSku = await SKU.findById(quote.solarInverter).populate({ path: 'brand', model: 'BrandManufacturer' }).lean();
                quote.solarInverterImage = getFullUrl(req, inverterSku?.image || inverterSku?.brand?.brandLogo);
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        quote.webViewUrl = `${frontendUrl}/quote-view/${quote._id}`;
        quote.pdfDownloadUrl = `${frontendUrl}/quote-view/${quote._id}.pdf`;

        res.status(200).json({
            success: true,
            message: 'Quick Quote fetched successfully',
            data: quote
        });
    } catch (error) {
        console.error("Error fetching quick quote:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch Quick Quote', error: error.message });
    }
};

// ==========================================
// Update Quick Quote
// ==========================================
export const updateQuickQuote = async (req, res) => {
    try {
        // Map mobile's "Customize Kit" to the schema's "Customized Kit"
        if (req.body.kitType === 'Customize Kit') {
            req.body.kitType = 'Customize Kit';
        }

        const updatedQuote = await QuickQuote.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate(populateOptions);

        if (!updatedQuote) {
            return res.status(404).json({ success: false, message: 'Quick Quote not found' });
        }

        let quoteObj = updatedQuote.toObject();
        if (quoteObj.kitType === 'Combo Kit') {
            let img = quoteObj.image;
            let pBrand = null;
            let iBrand = null;

            if (!img && quoteObj.comboKit?.comboKits?.length > 0) {
                img = quoteObj.comboKit.comboKits[0].image;
            }

            if (quoteObj.comboKit?.comboKits?.length > 0) {
                const matchedKit = quoteObj.comboKit.comboKits.find(k => k.image === img);
                if (matchedKit) {
                    pBrand = matchedKit.panelBrand;
                    iBrand = matchedKit.inverterBrand;
                } else if (quoteObj.comboKit.comboKits[0]) {
                    pBrand = quoteObj.comboKit.comboKits[0].panelBrand;
                    iBrand = quoteObj.comboKit.comboKits[0].inverterBrand;
                }
            }

            if (!img && quoteObj.brand) {
                const brandDoc = await BrandManufacturer.findById(quoteObj.brand._id || quoteObj.brand).lean();
                const brandName = brandDoc?.companyName || brandDoc?.brand;
                if (brandName) {
                    const fallbackKit = await ComboKitAssignment.findOne({
                        $or: [
                            { brandName: { $regex: new RegExp(brandName, 'i') } },
                            { 'comboKits.panelBrand': { $regex: new RegExp(brandName, 'i') } }
                        ]
                    }).lean();
                    if (fallbackKit && fallbackKit.comboKits && fallbackKit.comboKits.length > 0) {
                        img = fallbackKit.comboKits[0].image;
                        pBrand = fallbackKit.comboKits[0].panelBrand;
                        iBrand = fallbackKit.comboKits[0].inverterBrand;
                    }
                }
            }

            if (img && !quoteObj.image) {
                quoteObj.image = img;
                await QuickQuote.findByIdAndUpdate(quoteObj._id, { image: img });
            }

            quoteObj.image = getFullUrl(req, img);
            quoteObj.panelBrand = pBrand || null;
            quoteObj.inverterBrand = iBrand || null;

            // Fetch brand logo images
            let pLogo = null;
            let iLogo = null;
            if (pBrand) {
                const pBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                pLogo = pBrandDoc?.brandLogo;
            }
            if (iBrand) {
                const iBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                iLogo = iBrandDoc?.brandLogo;
            }
            quoteObj.panelBrandImage = getFullUrl(req, pLogo);
            quoteObj.inverterBrandImage = getFullUrl(req, iLogo);
        } else if (quoteObj.kitType === 'Customized Kit') {
            if (quoteObj.solarPanel && mongoose.Types.ObjectId.isValid(quoteObj.solarPanel)) {
                const panelSku = await SKU.findById(quoteObj.solarPanel).lean();
                quoteObj.solarPanelImage = getFullUrl(req, panelSku?.image);
            }
            if (quoteObj.solarInverter && mongoose.Types.ObjectId.isValid(quoteObj.solarInverter)) {
                const inverterSku = await SKU.findById(quoteObj.solarInverter).lean();
                quoteObj.solarInverterImage = getFullUrl(req, inverterSku?.image);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Quick Quote updated successfully',
            data: quoteObj
        });
    } catch (error) {
        console.error("Error updating quick quote:", error);
        res.status(500).json({ success: false, message: 'Failed to update Quick Quote', error: error.message });
    }
};

// ==========================================
// Delete Quick Quote
// ==========================================
export const deleteQuickQuote = async (req, res) => {
    try {
        const deletedQuote = await QuickQuote.findByIdAndDelete(req.params.id);
        if (!deletedQuote) {
            return res.status(404).json({ success: false, message: 'Quick Quote not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Quick Quote deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting quick quote:", error);
        res.status(500).json({ success: false, message: 'Failed to delete Quick Quote', error: error.message });
    }
};
