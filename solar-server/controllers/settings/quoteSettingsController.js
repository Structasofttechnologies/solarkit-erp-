import QuoteSettings from '../../models/finance/QuoteSettings.js';
import SurveyBOM from '../../models/marketing/SurveyBOM.js';
import TerraceType from '../../models/projects/TerraceType.js';
import StructureType from '../../models/projects/StructureType.js';
import BuildingType from '../../models/projects/BuildingType.js';
import Discom from '../../models/finance/Discom.js';
import Counter from '../../models/core/Counter.js';
import District from '../../models/core/District.js';

// --- Quote Settings ---
export const createQuoteSetting = async (req, res) => {
    try {
        // --- PROPOSAL NUMBER GENERATION ---
        // 1. Get Sequence Number
        const counter = await Counter.findOneAndUpdate(
            { id: 'quoteProposalNo' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const sequence = counter.seq.toString().padStart(4, '0');

        // 2. Get City Code (3 chars from first district)
        let cityCode = 'GEN';
        if (req.body.districts && req.body.districts.length > 0) {
            const districtDoc = await District.findById(req.body.districts[0]);
            if (districtDoc) {
                cityCode = districtDoc.name.substring(0, 3).toUpperCase();
            }
        }

        // 3. Get Dealer/Franchise Code (Condensed)
        let partnerCode = 'DL';
        if (req.body.partnerTypes && req.body.partnerTypes.length > 0) {
            const pType = req.body.partnerTypes[0].toUpperCase();
            if (pType.includes('FRANCHISE')) partnerCode = 'FR';
            else if (pType.includes('DEALER')) partnerCode = 'DL';
            else if (pType.includes('CHANNEL')) partnerCode = 'CP';
        }

        // 4. Build Final Condensed Number: SK/{CITY}/{DL}{SEQ}
        const proposalNo = `SK/${cityCode}/${partnerCode}${sequence}`;
       
        const newSetting = new QuoteSettings({
            ...req.body,
            proposalNo: proposalNo
        });
        const savedSetting = await newSetting.save();
        res.status(201).json(savedSetting);
    } catch (error) {
        console.error('Create Quote Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getQuoteSettings = async (req, res) => {
    try {
        const settings = await QuoteSettings.find().populate(['countries', 'states', 'clusters', 'districts']);
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateQuoteSetting = async (req, res) => {
    try {
        // Prevent changing proposalNo if it exists
        if (req.body.proposalNo) {
            const existing = await QuoteSettings.findById(req.params.id);
            if (existing && existing.proposalNo) {
                delete req.body.proposalNo; // Force keep original
            }
        }
        
        const updatedSetting = await QuoteSettings.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedSetting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteQuoteSetting = async (req, res) => {
    try {
        await QuoteSettings.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Quote Setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Survey BOM ---
export const createSurveyBOM = async (req, res) => {
    try {
        const newBOM = new SurveyBOM(req.body);
        const savedBOM = await newBOM.save();
        res.status(201).json(savedBOM);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSurveyBOMs = async (req, res) => {
    try {
        const boms = await SurveyBOM.find();
        res.status(200).json(boms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSurveyBOM = async (req, res) => {
    try {
        const updatedBOM = await SurveyBOM.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBOM);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSurveyBOM = async (req, res) => {
    try {
        await SurveyBOM.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Survey BOM deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Terrace Types ---
export const createTerraceType = async (req, res) => {
    try {
        const newType = new TerraceType(req.body);
        const savedType = await newType.save();
        res.status(201).json(savedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTerraceTypes = async (req, res) => {
    try {
        const types = await TerraceType.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTerraceType = async (req, res) => {
    try {
        const updatedType = await TerraceType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteTerraceType = async (req, res) => {
    try {
        await TerraceType.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Terrace Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Structure Types ---
export const createStructureType = async (req, res) => {
    try {
        const newType = new StructureType(req.body);
        const savedType = await newType.save();
        res.status(201).json(savedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStructureTypes = async (req, res) => {
    try {
        const types = await StructureType.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStructureType = async (req, res) => {
    try {
        const updatedType = await StructureType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteStructureType = async (req, res) => {
    try {
        await StructureType.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Structure Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Building Types ---
export const createBuildingType = async (req, res) => {
    try {
        const newType = new BuildingType(req.body);
        const savedType = await newType.save();
        res.status(201).json(savedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBuildingTypes = async (req, res) => {
    try {
        const types = await BuildingType.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBuildingType = async (req, res) => {
    try {
        const updatedType = await BuildingType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBuildingType = async (req, res) => {
    try {
        await BuildingType.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Building Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Discoms ---
export const createDiscom = async (req, res) => {
    try {
        const newDiscom = new Discom(req.body);
        const savedDiscom = await newDiscom.save();
        res.status(201).json(savedDiscom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDiscoms = async (req, res) => {
    try {
        const filters = {};
        if (req.query.country) filters.country = req.query.country;
        if (req.query.state) filters.state = req.query.state;
        if (req.query.cluster) filters.cluster = req.query.cluster;
        if (req.query.district) filters.district = req.query.district;

        const discoms = await Discom.find(filters).populate(['country', 'state', 'cluster', 'district']);
        res.status(200).json(discoms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDiscomsByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const discoms = await Discom.find({ state: stateId }).populate(['country', 'state', 'cluster', 'district']);
        res.status(200).json(discoms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDiscom = async (req, res) => {
    try {
        const updatedDiscom = await Discom.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedDiscom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDiscom = async (req, res) => {
    try {
        await Discom.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Discom deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
