import LoanRule from '../../models/finance/LoanRule.js';
import ModuleCompletion from '../../models/settings/ModuleCompletion.js';

export const getLoanRules = async (req, res) => {
    try {
        const { clusterId } = req.query;
        let query = {};
        if (clusterId && clusterId !== 'undefined') {
            query.clusterId = clusterId;
        }
        const rules = await LoanRule.find(query)
            .populate('categoryId', 'name')
            .populate('categoryIds', 'name')
            .populate('subCategoryId', 'name')
            .populate('subCategoryIds', 'name')
            .populate('projectTypeId', 'name')
            .populate('subProjectTypeId', 'name')
            .populate('subProjectTypeIds', 'name')
            .populate('combokitId', 'name')
            .populate('customizedKitId', 'solarkitName')
            .populate('customizedKitIds', 'solarkitName')
            .populate('loanProviderId', 'name')
            .populate('countries', 'name')
            .populate('states', 'name')
            .populate('clusters', 'name')
            .populate('districts', 'name');
        res.status(200).json(rules);
    } catch (error) {
        console.error('GET /api/loan Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createLoanRule = async (req, res) => {
    try {
        const {
            clusterId, loanProviderType, orderType, combokitId, customizedKitId, customizedKitIds,
            loanProviderId,
            categoryId, categoryIds, subCategoryId, subCategoryIds, projectTypeId, subProjectTypeId, subProjectTypeIds,
            projectTypeFrom, projectTypeTo,
            countries, states, clusters, districts,
            projectType, interestRate, tenureMonths, maxAmount, fields
        } = req.body;

        // Helper to get first ID for backward compatibility
        const toId = (val) => {
            if (!val) return null;
            if (Array.isArray(val)) return val.length > 0 ? (val[0]._id || val[0]) : null;
            return val._id || val;
        };

        const syncCategoryId = categoryId || toId(categoryIds);
        const syncSubCategoryId = subCategoryId || toId(subCategoryIds);
        const syncSubProjectTypeId = subProjectTypeId || toId(subProjectTypeIds);
        const syncCustomizedKitId = customizedKitId || toId(customizedKitIds);

        // Prevent duplicates for same configuration
        const query = {
            loanProviderType,
            orderType,
            combokitId: combokitId || null,
            customizedKitId: syncCustomizedKitId || null,
            loanProviderId: loanProviderId || null,
            categoryId: syncCategoryId || null,
            subCategoryId: syncSubCategoryId || null,
            projectTypeId: projectTypeId || null,
            subProjectTypeId: syncSubProjectTypeId || null,
            projectTypeFrom: projectTypeFrom || undefined,
            projectTypeTo: projectTypeTo || undefined,
            countries: { $all: countries || [], $size: (countries || []).length },
            states: { $all: states || [], $size: (states || []).length },
            clusters: { $all: clusters || [], $size: (clusters || []).length },
            districts: { $all: districts || [], $size: (districts || []).length }
        };

        if (clusterId && clusterId !== 'undefined') {
            query.clusterId = clusterId;
        }

        const existing = await LoanRule.findOne(query);
        if (existing) {
            existing.fields = fields;
            existing.outcomes = req.body.outcomes || [];
            existing.interestRate = interestRate || 0;
            existing.tenureMonths = tenureMonths || 0;
            existing.maxAmount = maxAmount || 0;
            await existing.save();
            return res.status(200).json(existing);
        }

        const newRule = new LoanRule({
            clusterId: clusterId && clusterId !== 'undefined' ? clusterId : null,
            loanProviderType,
            orderType,
            combokitId,
            customizedKitId: syncCustomizedKitId,
            customizedKitIds,
            loanProviderId,
            categoryId: syncCategoryId,
            categoryIds,
            subCategoryId: syncSubCategoryId,
            subCategoryIds,
            projectTypeId,
            subProjectTypeId: syncSubProjectTypeId,
            subProjectTypeIds,
            projectTypeFrom,
            projectTypeTo,
            countries,
            states,
            clusters,
            districts,
            projectType,
            interestRate: interestRate || 0,
            tenureMonths: tenureMonths || 0,
            maxAmount: maxAmount || 0,
            fields,
            outcomes: req.body.outcomes || [],
            status: 'active'
        });

        await newRule.save();
        if (newRule.clusterId) {
            await updateLoanCompletion(newRule.clusterId);
        }

        res.status(201).json(newRule);
    } catch (error) {
        console.error('POST /api/loan Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateLoanRule = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updatedRule = await LoanRule.findByIdAndUpdate(id, data, { new: true });

        if (!updatedRule) {
            return res.status(404).json({ message: 'Loan rule not found' });
        }
        if (updatedRule.clusterId) {
            await updateLoanCompletion(updatedRule.clusterId);
        }
        res.status(200).json(updatedRule);
    } catch (error) {
        console.error(`PUT /api/loan/${id} Error:`, error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteLoanRule = async (req, res) => {
    try {
        const { id } = req.params;
        const rule = await LoanRule.findById(id);
        if (!rule) {
            return res.status(404).json({ message: 'Loan rule not found' });
        }

        const clusterId = rule.clusterId;
        await LoanRule.findByIdAndDelete(id);
        await updateLoanCompletion(clusterId);

        res.status(200).json({ message: 'Loan rule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLoanCompletion = async (clusterId) => {
    try {
        const rules = await LoanRule.find({ clusterId });
        const activeRules = rules.filter(r => r.status === 'active');

        // Logic: Complete if at least 1 active rule exists
        const isCompleted = activeRules.length > 0;
        const progressPercent = isCompleted ? 100 : 0;

        await ModuleCompletion.findOneAndUpdate(
            { clusterId, moduleName: 'Loan Setting' },
            {
                completed: isCompleted,
                progressPercent,
                category: 'Location Setting', // Based on ChecklistSetting.jsx categories
                iconName: 'DollarSign'
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error updating loan module completion:', error);
    }
};

export const updateModuleCompletion = async (req, res) => {
    try {
        const { clusterId } = req.body;
        await updateLoanCompletion(clusterId);
        res.status(200).json({ message: 'Module completion updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
