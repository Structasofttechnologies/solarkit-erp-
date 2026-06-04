import ProjectJourneyStage from '../../models/projects/ProjectJourneyStage.js';
import ProjectOverdueSetting from '../../models/projects/ProjectOverdueSetting.js';
import ProjectConfiguration from '../../models/projects/ProjectConfiguration.js';
import ProjectDocument from '../../models/projects/ProjectDocument.js';
import PlaceholderName from '../../models/projects/PlaceholderName.js';

// --- Journey Stages ---
export const getJourneyStages = async (req, res) => {
    try {
        const stages = await ProjectJourneyStage.find().sort({ order: 1 });
        res.status(200).json(stages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createJourneyStage = async (req, res) => {
    try {
        const stage = new ProjectJourneyStage(req.body);
        await stage.save();
        res.status(201).json(stage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateJourneyStage = async (req, res) => {
    try {
        const { id } = req.params;
        const stage = await ProjectJourneyStage.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(stage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteJourneyStage = async (req, res) => {
    try {
        const { id } = req.params;
        await ProjectJourneyStage.findByIdAndDelete(id);
        res.status(200).json({ message: 'Stage deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateJourneyStageOrder = async (req, res) => {
    try {
        const { stages } = req.body;
        // Expects array of { id, order }
        const promises = stages.map(item =>
            ProjectJourneyStage.findByIdAndUpdate(item.id, { order: item.order })
        );
        await Promise.all(promises);
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Overdue Settings ---
export const getOverdueSettings = async (req, res) => {
    try {
        const settings = await ProjectOverdueSetting.find();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createOrUpdateOverdueSetting = async (req, res) => {
    try {
        const { category, subCategory, projectType, subProjectType, processConfig } = req.body;
        const filter = { category, subCategory, projectType, subProjectType };

        const setting = await ProjectOverdueSetting.findOneAndUpdate(
            filter,
            { processConfig, status: 'Active' },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Project Configuration ---
export const getProjectConfigurations = async (req, res) => {
    try {
        const configs = await ProjectConfiguration.find();
        // Transform array to object for easier frontend consumption if needed
        // But returning array is standard REST
        res.status(200).json(configs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjectConfigurationByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const config = await ProjectConfiguration.findOne({ configKey: key }).sort({ createdAt: -1 });
        res.status(200).json(config ? config.configValue : null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveProjectConfiguration = async (req, res) => {
    try {
        const { configKey, configValue } = req.body;
        const config = new ProjectConfiguration({
            configKey,
            configValue,
            status: 'Active'
        });
        await config.save();
        res.status(200).json(config);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProjectConfigurationByKey = async (req, res) => {
    try {
        const { key } = req.params;
        await ProjectConfiguration.findOneAndDelete({ configKey: key });
        res.status(200).json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Project Documents ---
export const getProjectDocuments = async (req, res) => {
    try {
        const { category, subCategory, projectType, subProjectType } = req.query;
        let filter = {};
        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        if (projectType) filter.projectType = projectType;
        if (subProjectType) filter.subProjectType = subProjectType;

        const docs = await ProjectDocument.find(filter);
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProjectDocument = async (req, res) => {
    try {
        const doc = new ProjectDocument(req.body);
        await doc.save();
        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProjectDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await ProjectDocument.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(doc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProjectDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await ProjectDocument.findByIdAndDelete(id);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Placeholder Names ---
export const getPlaceholderNames = async (req, res) => {
    try {
        const placeholders = await PlaceholderName.find();
        res.status(200).json(placeholders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const savePlaceholderName = async (req, res) => {
    try {
        const { labelKey, labelValue, dbField, number } = req.body;
        const placeholder = await PlaceholderName.findOneAndUpdate(
            { labelKey },
            { labelValue, dbField, number, status: 'Active' },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json(placeholder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePlaceholderName = async (req, res) => {
    try {
        const { id } = req.params;
        // Alternative: delete by key string if ID not available in frontend easily
        // But ID is safer.
        await PlaceholderName.findByIdAndDelete(id);
        res.status(200).json({ message: 'Placeholder deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePlaceholderByKey = async (req, res) => {
    try {
        const { key } = req.params;
        await PlaceholderName.findOneAndDelete({ labelKey: key });
        res.status(200).json({ message: 'Placeholder deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
