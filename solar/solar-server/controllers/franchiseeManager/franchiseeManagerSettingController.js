
import FranchiseeManagerSetting from '../../models/franchisee/FranchiseeManagerSetting.js';

export const getFranchiseeManagerSettings = async (req, res) => {
    try {
        const { state, cluster, district } = req.query;

        if (!state || !cluster || !district) {
            return res.status(400).json({ message: 'State, Cluster, and District are required' });
        }

        let settings = await FranchiseeManagerSetting.findOne({
            state,
            cluster,
            district
        });

        if (!settings) {
            // Return empty/default structure if not found so frontend can render empty form
            return res.status(200).json({
                state,
                cluster,
                district,
                traineeSettings: {},
                managerSettings: {},
                videoSections: [{
                    category: 'solarrooftop',
                    name: '',
                    videos: [],
                    isExpanded: true
                }],
                examSettings: {
                    passingMarks: 1,
                    questions: [{
                        question: '',
                        options: { A: '', B: '', C: '', D: '' },
                        correctAnswer: 'A'
                    }]
                }
            });
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateFranchiseeManagerSettings = async (req, res) => {
    try {
        const { state, cluster, district, traineeSettings, managerSettings, videoSections, examSettings } = req.body;

        if (!state || !cluster || !district) {
            return res.status(400).json({ message: 'State, Cluster, and District are required' });
        }

        // Support both single values and arrays for multiselect
        const states = Array.isArray(state) ? state : [state];
        const clusters = Array.isArray(cluster) ? cluster : [cluster];
        const districts = Array.isArray(district) ? district : [district];

        const updatePromises = [];

        for (const s of states) {
            for (const c of clusters) {
                for (const d of districts) {
                    updatePromises.push(
                        FranchiseeManagerSetting.findOneAndUpdate(
                            { state: s, cluster: c, district: d },
                            {
                                state: s,
                                cluster: c,
                                district: d,
                                traineeSettings,
                                managerSettings,
                                videoSections,
                                examSettings
                            },
                            { new: true, upsert: true, setDefaultsOnInsert: true }
                        )
                    );
                }
            }
        }

        await Promise.all(updatePromises);
        res.status(200).json({ message: `Successfully updated settings for ${updatePromises.length} location combinations.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
