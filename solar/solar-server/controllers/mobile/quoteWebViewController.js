import mongoose from 'mongoose';
import QuickQuote from '../../models/finance/QuickQuote.js';
import QuoteSettings from '../../models/finance/QuoteSettings.js';
import BrandManufacturer from '../../models/inventory/BrandManufacturer.js';
import ComboKitAssignment from '../../models/inventory/ComboKitAssignment.js';
import AdminConfig from '../../models/admin/AdminConfig.js';

// Helper to construct full URL for images
const getFullUrl = (req, urlPath) => {
    if (!urlPath) return null;
    if (urlPath.startsWith('http')) return urlPath;
    if (urlPath.startsWith('/uploads/')) {
        return `${req.protocol}://${req.get('host')}${urlPath}`;
    }
    return `${req.protocol}://${req.get('host')}/${urlPath}`;
};

// Helper for populating relations
const populateOptions = [
    { path: 'district', select: 'name' },
    { path: 'category', select: 'name' },
    { path: 'subCategory', select: 'name' },
    { path: 'projectType', model: 'ProjectCategoryMapping', select: 'projectTypeFrom projectTypeTo' },
    { path: 'subProjectType', select: 'name' },
    { path: 'brand', select: 'companyName name brand' },
    { path: 'technology', select: 'name' },
    { path: 'solarPanelWatt', select: 'name' },
    { path: 'comboKit', select: 'name solarkitName comboKits' },
    { path: 'terraceType', select: 'name' }
];

/**
 * GET /api/quote-web-view/:quoteId
 * 
 * Returns the Quick Quote data along with the best-matching QuoteSettings template.
 * This is a PUBLIC endpoint (no auth required) so mobile apps can open it in a WebView.
 */
export const getQuoteWebViewData = async (req, res) => {
    try {
        const { quoteId } = req.params;
        let cleanQuoteId = quoteId;
        if (cleanQuoteId && cleanQuoteId.endsWith('.pdf')) {
            cleanQuoteId = cleanQuoteId.slice(0, -4);
        }

        if (!mongoose.Types.ObjectId.isValid(cleanQuoteId)) {
            return res.status(400).json({ success: false, message: 'Invalid quote ID' });
        }

        // 1. Fetch the Quick Quote with populated references
        const quote = await QuickQuote.findById(cleanQuoteId).populate(populateOptions).lean();
        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        // 2. Resolve images for the quote
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

            quote.image = getFullUrl(req, img);
            quote.panelBrand = pBrand || null;
            quote.inverterBrand = iBrand || null;

            // Fetch brand logos
            if (pBrand) {
                const pBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${pBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                quote.panelBrandImage = getFullUrl(req, pBrandDoc?.brandLogo);
            }
            if (iBrand) {
                const iBrandDoc = await BrandManufacturer.findOne({
                    $or: [
                        { brand: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } },
                        { companyName: { $regex: new RegExp(`^${iBrand.trim()}$`, 'i') } }
                    ]
                }).lean();
                quote.inverterBrandImage = getFullUrl(req, iBrandDoc?.brandLogo);
            }
        }

        // 3. Find the best matching QuoteSettings template
        //    Priority: Match by district + category, then just district, then just category, then any active
        let template = null;
        const districtId = quote.district?._id || quote.district;

        if (districtId) {
            // Try exact district match first
            template = await QuoteSettings.findOne({
                districts: districtId,
                isActive: true
            }).populate(['countries', 'states', 'clusters', 'districts']).lean();
        }

        // Fallback: find any active template
        if (!template) {
            template = await QuoteSettings.findOne({ isActive: true })
                .populate(['countries', 'states', 'clusters', 'districts']).lean();
        }

        // 4. Fetch company info from AdminConfig
        let companyInfo = null;
        try {
            const adminConfig = await AdminConfig.findOne({ section: 'company', key: 'profile' }).lean();
            companyInfo = adminConfig?.data || null;
        } catch (e) {
            // Company info is optional
        }

        res.status(200).json({
            success: true,
            message: 'Quote web view data fetched successfully',
            data: {
                quote,
                template,
                companyInfo
            }
        });
    } catch (error) {
        console.error('Error fetching quote web view data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch quote web view data', error: error.message });
    }
};
