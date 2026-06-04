import SetPrice from '../../models/finance/SetPrice.js';
import SetPriceAmc from '../../models/finance/SetPriceAmc.js';
import Offer from '../../models/finance/Offer.js';
import SolarPanelBundle from '../../models/inventory/SolarPanelBundle.js';
import CompanyMargin from '../../models/finance/CompanyMargin.js';

// ==========================================
// Set Price Logic
// ==========================================
export const createSetPrice = async (req, res) => {
    try {
        const newPrice = new SetPrice(req.body);
        const savedPrice = await newPrice.save();
        res.status(201).json(savedPrice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSetPrices = async (req, res) => {
    try {
        const { country, state, district, cluster, category, subCategory, projectType, subProjectType, paymentType, kitType, role, partnerPlan } = req.query;
        const query = {};
        
        // Flexible matching for locations (support both singular field and plural array field)
        if (country) {
            const ids = country.includes(',') ? country.split(',') : [country];
            query.$or = query.$or || [];
            query.$or.push({ country: { $in: ids } }, { countries: { $in: ids } });
        }
        if (state) {
            const ids = state.includes(',') ? state.split(',') : [state];
            query.$or = query.$or || [];
            query.$or.push({ state: { $in: ids } }, { states: { $in: ids } });
        }
        if (district) {
            const ids = district.includes(',') ? district.split(',') : [district];
            query.$or = query.$or || [];
            query.$or.push({ district: { $in: ids } }, { districts: { $in: ids } });
        }
        if (cluster) {
            const ids = cluster.includes(',') ? cluster.split(',') : [cluster];
            query.$or = query.$or || [];
            query.$or.push({ cluster: { $in: ids } }, { clusters: { $in: ids } });
        }

        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;
        if (projectType) query.projectType = projectType;
        if (subProjectType) query.subProjectType = subProjectType;
        if (paymentType && paymentType !== 'All') query.paymentType = paymentType;
        if (kitType && kitType !== 'All') query.kitType = kitType;
        if (role) query.role = role;
        if (partnerPlan) query.partnerPlan = partnerPlan;

        const prices = await SetPrice.find(query)
            .populate('country', 'name')
            .populate('state', 'name')
            .populate('district', 'name')
            .populate('cluster', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(prices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSetPrice = async (req, res) => {
    try {
        const updatedPrice = await SetPrice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedPrice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteSetPrice = async (req, res) => {
    try {
        await SetPrice.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Price deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ==========================================
// Set Price AMC Logic
// ==========================================
export const createSetPriceAmc = async (req, res) => {
    try {
        const newAmc = new SetPriceAmc(req.body);
        const savedAmc = await newAmc.save();
        res.status(201).json(savedAmc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSetPricesAmc = async (req, res) => {
    try {
        const { state, district, cluster } = req.query;
        const query = {};
        if (state) query.state = state;
        if (district) query.district = district;
        if (cluster) query.cluster = cluster;

        const amcPrices = await SetPriceAmc.find(query)
            .populate('state', 'name')
            .populate('district', 'name')
            .populate('cluster', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(amcPrices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSetPriceAmc = async (req, res) => {
    try {
        const updatedAmc = await SetPriceAmc.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedAmc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteSetPriceAmc = async (req, res) => {
    try {
        await SetPriceAmc.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'AMC Price deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ==========================================
// Offers Logic
// ==========================================
export const createOffer = async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        const savedOffer = await newOffer.save();
        res.status(201).json(savedOffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getOffers = async (req, res) => {
    try {
        const { status, type } = req.query;
        const query = {};
        if (status) query.status = status;
        if (type) query.offerType = type;

        const offers = await Offer.find(query).sort({ createdAt: -1 });
        res.status(200).json(offers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateOffer = async (req, res) => {
    try {
        const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedOffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteOffer = async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==========================================
// Solar Bundle Logic
// ==========================================
export const createBundle = async (req, res) => {
    try {
        const newBundle = new SolarPanelBundle(req.body);
        const savedBundle = await newBundle.save();
        res.status(201).json(savedBundle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBundles = async (req, res) => {
    try {
        // Logic for filtering by location if needed
        const bundles = await SolarPanelBundle.find().sort({ createdAt: -1 });
        res.status(200).json(bundles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateBundle = async (req, res) => {
    try {
        const updatedBundle = await SolarPanelBundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBundle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const deleteBundle = async (req, res) => {
    try {
        await SolarPanelBundle.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Bundle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ==========================================
// Dashboard Aggregations (IMPORTANT)
// ==========================================
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Active Offers
        const activeOffersCount = await Offer.countDocuments({ status: 'Active' });

        // 2. Average Margin per Category in SetPrice
        // Simple average calculation
        const marginStats = await SetPrice.aggregate([
            {
                $group: {
                    _id: "$category",
                    avgMargin: { $avg: { $subtract: ["$marketPrice", "$benchmarkPrice"] } }
                }
            }
        ]);

        // 3. Bundle Plans Status
        const bundleStats = await SolarPanelBundle.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. AMC Price Revenue Potential (Mock calculation based on price)
        // Sum of all active AMC prices
        const totalAmcPotential = await SetPriceAmc.aggregate([
            { $match: { status: 'Active' } },
            { $group: { _id: null, total: { $sum: "$amcPrice" } } }
        ]);

        // 5. Total Escalated Prices (Buying Price > Benchmark)
        const escalatedPriceCount = await SetPrice.countDocuments({
            $expr: { $gt: ["$marketPrice", "$benchmarkPrice"] }
        });

        res.status(200).json({
            activeOffers: activeOffersCount,
            marginStats,
            bundleStats,
            amcRevenuePotential: totalAmcPotential[0]?.total || 0,
            escalatedPriceCount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==========================================
// Company Margin Logic
// ==========================================
export const getCompanyMargins = async (req, res) => {
    try {
        let margins = await CompanyMargin.find().sort({ type: 1 });
        
        // Seed default values if none exist
        if (margins.length === 0) {
            const defaults = [
                { type: 'Prime', cost: 500, margin: 1000, total: 1500, minOrders: 0, percentageMargin: 0 },
                { type: 'Regular', cost: 400, margin: 800, total: 1200, minOrders: 0, percentageMargin: 0 },
                { type: 'Other', cost: 300, margin: 500, total: 800, minOrders: 0, percentageMargin: 0 }
            ];
            margins = await CompanyMargin.insertMany(defaults);
        }
        
        res.status(200).json(margins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateCompanyMargin = async (req, res) => {
    try {
        const { type, cost, margin, minOrders, percentageMargin } = req.body;
        const total = (Number(cost) || 0) + (Number(margin) || 0);
        
        const updated = await CompanyMargin.findOneAndUpdate(
            { type },
            { cost, margin, total, minOrders, percentageMargin },
            { new: true, upsert: true }
        );
        
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
