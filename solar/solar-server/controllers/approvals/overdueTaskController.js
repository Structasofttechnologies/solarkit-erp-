import OverdueTaskSetting from '../../models/approvals/OverdueTaskSetting.js';

export const getOverdueTaskSettings = async (req, res) => {
    try {
        const { countries, states, clusters, districts, departments } = req.query;
        const query = {};

        const parseArray = (input) => {
            if (!input) return [];
            if (Array.isArray(input)) return input[0] === 'all' ? [] : input;
            const arr = input.split(',').filter(x => x && x !== 'all');
            return arr;
        };

        const distArr = parseArray(districts);
        const clustArr = parseArray(clusters);
        const stateArr = parseArray(states);
        const countArr = parseArray(countries);
        const deptArr = parseArray(departments);

        if (distArr.length > 0) query.districts = { $all: distArr, $size: distArr.length };
        else query.districts = { $size: 0 };

        if (clustArr.length > 0) query.clusters = { $all: clustArr, $size: clustArr.length };
        else query.clusters = { $size: 0 };

        if (stateArr.length > 0) query.states = { $all: stateArr, $size: stateArr.length };
        else query.states = { $size: 0 };

        if (countArr.length > 0) query.countries = { $all: countArr, $size: countArr.length };
        else query.countries = { $size: 0 };

        if (deptArr.length > 0) query.departments = { $all: deptArr, $size: deptArr.length };
        else query.departments = { $size: 0 };

        let settings = await OverdueTaskSetting.findOne(query).populate('escalationLevels.escalateTo');
        
        if (!settings) {
            // Fallback to Global Default (All null/empty)
            settings = await OverdueTaskSetting.findOne({ 
                districts: { $size: 0 }, 
                clusters: { $size: 0 }, 
                states: { $size: 0 }, 
                countries: { $size: 0 }, 
                departments: { $size: 0 } 
            }).populate('escalationLevels.escalateTo');
        }

        if (!settings) {
            settings = {
                todayTasksDays: 0,
                todayPriority: 'medium',
                showTodayTasks: true,
                pendingMinDays: 1,
                pendingMaxDays: 7,
                sendPendingReminders: true,
                reminderFrequency: 'weekly',
                overdueDays: 1,
                escalationLevels: [],
                autoPenalty: true,
                penaltyPercentage: 2,
                overdueBenchmark: 70,
                departments: [],
                countries: [],
                states: [],
                clusters: [],
                districts: []
            };
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOverdueTaskSettings = async (req, res) => {
    try {
        const { countries, states, clusters, districts, departments } = req.body;
        
        const parse = (arr) => (Array.isArray(arr) && arr[0] !== 'all') ? arr : [];
        
        const countArr = parse(countries);
        const stateArr = parse(states);
        const clustArr = parse(clusters);
        const distArr = parse(districts);
        const deptArr = parse(departments);
        
        const query = {};
        if (countArr.length > 0) query.countries = { $all: countArr, $size: countArr.length };
        else query.countries = { $size: 0 };

        if (stateArr.length > 0) query.states = { $all: stateArr, $size: stateArr.length };
        else query.states = { $size: 0 };

        if (clustArr.length > 0) query.clusters = { $all: clustArr, $size: clustArr.length };
        else query.clusters = { $size: 0 };

        if (distArr.length > 0) query.districts = { $all: distArr, $size: distArr.length };
        else query.districts = { $size: 0 };

        if (deptArr.length > 0) query.departments = { $all: deptArr, $size: deptArr.length };
        else query.departments = { $size: 0 };
        
        const settings = await OverdueTaskSetting.findOneAndUpdate(query, { 
            ...req.body, 
            countries: countArr,
            states: stateArr,
            clusters: clustArr,
            districts: distArr,
            departments: deptArr 
        }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }).populate('escalationLevels.escalateTo');
        res.status(200).json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const getAllOverdueTaskSettings = async (req, res) => {
    try {
        const settings = await OverdueTaskSetting.find()
            .populate('countries', 'name')
            .populate('states', 'name')
            .populate('clusters', 'name')
            .populate('districts', 'name')
            .populate('departments', 'name')
            .populate('escalationLevels.escalateTo', 'name')
            .sort({ updatedAt: -1 });

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteOverdueTaskSettings = async (req, res) => {
    try {
        const { id } = req.params;
        await OverdueTaskSetting.findByIdAndDelete(id);
        res.status(200).json({ message: 'Setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
