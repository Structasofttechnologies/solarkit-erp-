import OverdueStatusSetting from '../../models/approvals/OverdueStatusSetting.js';

// Predefined data from the frontend to serve as initial seed
const DEFAULT_DEPARTMENT_DATA = {
    "Cluster Department": {
        modules: [{
            id: 1,
            name: "Recruitment",
            overdueDays: 7,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Recruit",
                overdueDays: 2,
                status: "Active"
            },
            {
                id: 2,
                name: "Selection",
                overdueDays: 3,
                status: "Active"
            },
            {
                id: 3,
                name: "Onboarding",
                overdueDays: 2,
                status: "Active"
            }]
        },
        {
            id: 2,
            name: "Supplier vendor Onboarding",
            overdueDays: 3,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Installer",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Supplier",
                overdueDays: 2,
                status: "Active"
            }]
        },
        {
            id: 3,
            name: "Payroll",
            overdueDays: 5,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Leave Request",
                overdueDays: 2,
                status: "Active"
            },
            {
                id: 2,
                name: "Performance/Appraisal",
                overdueDays: 2,
                status: "Active"
            },
            {
                id: 3,
                name: "Generate Salary Report",
                overdueDays: 1,
                status: "Active"
            }]
        }]
    },
    "CPRM Department": {
        modules: [{
            id: 1,
            name: "Leads",
            overdueDays: 2,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Lead Generation",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Lead Qualification",
                overdueDays: 1,
                status: "Active"
            }]
        },
        {
            id: 2,
            name: "App Demo",
            overdueDays: 3,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Scheduling",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Presentation",
                overdueDays: 2,
                status: "Active"
            }]
        },
        {
            id: 3,
            name: "CP Setting",
            overdueDays: 3,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Combokit Customization",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Offers",
                overdueDays: 2,
                status: "Active"
            },
            {
                id: 3,
                name: "Track Cashback",
                overdueDays: 2,
                status: "Active"
            }]
        }]
    },
    "Marketing Department": {
        modules: [{
            id: 1,
            name: "Lead Management",
            overdueDays: 10,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Lead Capture",
                overdueDays: 2,
                status: "Active"
            },
            {
                id: 2,
                name: "Lead Nurturing",
                overdueDays: 5,
                status: "Active"
            },
            {
                id: 3,
                name: "Lead Distribution",
                overdueDays: 3,
                status: "Active"
            }]
        }]
    },
    "Account Manager": {
        modules: [{
            id: 1,
            name: "Order Journey",
            overdueDays: 1,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Create Order",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Delivery Plan",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 3,
                name: "Vendor Pay",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 4,
                name: "Driver Pay",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 5,
                name: "At Warehouse",
                overdueDays: 1,
                status: "Active"
            }]
        },
        {
            id: 2,
            name: "Payment",
            overdueDays: 3,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Warehouse Vendor Pay",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Vendor Contract Pay",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 3,
                name: "Track CP Payment",
                overdueDays: 1,
                status: "Active"
            }]
        }]
    },
    "Operation Manager": {
        modules: [{
            id: 1,
            name: "Inventory Management",
            overdueDays: 3,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Stock Check",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Reorder",
                overdueDays: 2,
                status: "Active"
            }]
        }]
    },
    "Supplier Department": {
        modules: [{
            id: 1,
            name: "Order Management",
            overdueDays: 5,
            status: "Active",
            tasks: [{
                id: 1,
                name: "Order Receiving",
                overdueDays: 1,
                status: "Active"
            },
            {
                id: 2,
                name: "Order Processing",
                overdueDays: 2,
                status: "Active"
            },
            {
                id: 3,
                name: "Order Fulfillment",
                overdueDays: 2,
                status: "Active"
            }]
        }]
    }
};

export const getOverdueStatusSettings = async (req, res) => {
    try {
        const { country, state, cluster, district, departments, positions } = req.query;

        const query = {};
        if (country) query.countries = { $in: country.split(',') };
        if (state) query.states = { $in: state.split(',') };
        if (cluster) query.clusters = { $in: cluster.split(',') };
        if (district) query.districts = { $in: district.split(',') };
        if (departments) query.departments = { $in: departments.split(',') };
        if (positions) query.positions = { $in: positions.split(',') };

        // Try to find specific settings
        let settings = await OverdueStatusSetting.findOne(query);

        // If not found, use default structure
        if (!settings) {
            // Find just by first department for legacy defaults if needed
            const deptName = departments ? departments.split(',')[0] : null;
            const defaultData = DEFAULT_DEPARTMENT_DATA[deptName];
            
            return res.status(200).json(defaultData || {
                modules: [{
                    id: 'gen_module',
                    name: "General Module",
                    overdueDays: 5,
                    status: "Active",
                    tasks: [{
                        id: 'gen_task',
                        name: "General Task",
                        overdueDays: 2,
                        status: "Active"
                    }]
                }]
            });
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOverdueStatusSettings = async (req, res) => {
    try {
        const { location, modules } = req.body;
        const { countries, states, clusters, districts, departments, positions } = location || {};

        // Find existing setting for this exact location combination if it exists, or create new
        // For simplicity in this complex multi-select, we'll use a match logic
        const settings = await OverdueStatusSetting.findOneAndUpdate(
            { 
                countries: { $all: countries || [] },
                states: { $all: states || [] },
                clusters: { $all: clusters || [] },
                districts: { $all: districts || [] },
                departments: { $all: departments || [] },
                positions: { $all: positions || [] }
            },
            { 
               countries, states, clusters, districts, departments, positions,
               modules 
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(settings);
    } catch (error) {
        console.error("Update error:", error);
        res.status(400).json({ message: error.message });
    }
};

export const getAllOverdueStatusSettings = async (req, res) => {
    try {
        const settings = await OverdueStatusSetting.find()
            .populate('countries', 'name')
            .populate('states', 'name')
            .populate('clusters', 'name')
            .populate('districts', 'name')
            .populate('departments', 'name')
            .populate('positions', 'name');
            
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const seedDefaultSettings = async (req, res) => {
    try {
        // This is a placeholder if we want to mass-populate defaults in DB
        // currently not strictly needed as GET returns default structure
        res.status(200).json({ message: 'Seed not implemented yet' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
