import Department from '../../models/hr/Department.js';
import Role from '../../models/users/Role.js';
import Module from '../../models/hr/Module.js';
import TemporaryIncharge from '../../models/hr/TemporaryIncharge.js';
import User from '../../models/users/User.js';
import Resignation from '../../models/hr/Resignation.js';

// --- Department Modules Logic ---

export const getAllModules = async (req, res, next) => {
    try {
        const modules = await Module.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, count: modules.length, data: modules });
    } catch (err) {
        next(err);
    }
};

export const createModule = async (req, res, next) => {
    try {
        const { name, key, description, defaultLevel, status } = req.body;

        // Basic validation
        if (!name || !key) {
            return res.status(400).json({ success: false, message: 'Module Name and Key are required.' });
        }

        // Check for duplicates
        const existing = await Module.findOne({ $or: [{ name }, { key }] });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Module with this name or key already exists.' });
        }

        const newModule = await Module.create({
            name,
            key,
            description,
            defaultLevel,
            status,
            isActive: true
        });

        res.status(201).json({ success: true, message: 'Module created successfully', data: newModule });
    } catch (err) {
        next(err);
    }
};

export const updateModule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedModule = await Module.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedModule) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        res.json({ success: true, message: 'Module updated successfully', data: updatedModule });
    } catch (err) {
        next(err);
    }
};

export const deleteModule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedModule = await Module.findByIdAndDelete(id);

        if (!deletedModule) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Wait, deleting a module might orphan department module assignments. 
        // We will also remove this module from all departments.
        await Department.updateMany(
            {},
            { $pull: { assignedModules: { module: id } } }
        );

        res.json({ success: true, message: 'Module deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const assignModulesToDepartment = async (req, res, next) => {
    try {
        const { departmentId, modules } = req.body; // modules: [{ moduleId, level, status }]

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        // Validate modules exist
        // This accepts an array of full assignments to REPLACE or MERGE. 
        // For simplicity in this "dynamic" requirement, let's assume we replace the list or merge.
        // The prompt says "Dynamic", so we likely want to save exactly what's sent.

        department.assignedModules = modules.map(m => ({
            module: m.moduleId,
            level: m.level || 'country',
            status: m.status || 'active'
        }));

        await department.save();

        // Populate for response
        await department.populate('assignedModules.module');

        res.json({ success: true, message: 'Modules assigned successfully', data: department });
    } catch (err) {
        next(err);
    }
};

export const getDepartmentModules = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const department = await Department.findById(departmentId).populate('assignedModules.module');

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.json({ success: true, data: department.assignedModules });
    } catch (err) {
        next(err);
    }
};


// --- Temporary Incharge Logic ---

export const createTemporaryIncharge = async (req, res, next) => {
    try {
        const { originalUser, tempInchargeUser, department, startDate, endDate, reason } = req.body;

        // Basic validations
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        // Check for overlaps (optional but good)
        const overlap = await TemporaryIncharge.findOne({
            originalUser,
            isActive: true,
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlap) {
            return res.status(409).json({ success: false, message: 'Temporary incharge overlap detected for this user.' });
        }

        const newIncharge = await TemporaryIncharge.create({
            originalUser,
            tempInchargeUser,
            department,
            startDate,
            endDate,
            reason,
            createdBy: req.user?.id
        });

        res.status(201).json({ success: true, message: 'Temporary Incharge assigned', data: newIncharge });
    } catch (err) {
        next(err);
    }
};

export const updateTemporaryIncharge = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tempInchargeUser, department, startDate, endDate, reason } = req.body;

        // Basic validations
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        const updatedIncharge = await TemporaryIncharge.findByIdAndUpdate(
            id,
            { tempInchargeUser, department, startDate, endDate, reason },
            { new: true, runValidators: true }
        );

        if (!updatedIncharge) {
            return res.status(404).json({ success: false, message: 'Temporary Incharge record not found' });
        }

        res.json({ success: true, message: 'Temporary Incharge updated successfully', data: updatedIncharge });
    } catch (err) {
        next(err);
    }
};

export const getTemporaryIncharges = async (req, res, next) => {
    try {
        // Can filter by department or user via query params
        const query = { isActive: true };
        if (req.query.department) query.department = req.query.department;

        const list = await TemporaryIncharge.find(query)
            .populate('originalUser', 'name email designation')
            .populate('tempInchargeUser', 'name email designation')
            .populate('department', 'name');

        res.json({ success: true, count: list.length, data: list });
    } catch (err) {
        next(err);
    }
};

export const getTemporaryInchargeDashboard = async (req, res, next) => {
    try {
        const today = new Date();

        // 1. Fetch upcoming or active temporary incharges
        // Omitting startDate <= today so that future assignments also appear in the table.
        const activeIncharges = await TemporaryIncharge.find({
            isActive: true,
            endDate: { $gte: today }
        })
            .sort({ startDate: 1 }) // Soonest first
            .populate({
                path: 'originalUser',
                populate: { path: 'state', select: 'name' }
            });

        const absentUserIds = activeIncharges.map(inc => inc.originalUser?._id?.toString()).filter(Boolean);

        // Calculate leave stats (State-wise and Cluster-wise)
        const stateStats = {};
        const clusterStats = {};
        let totalAbsent = 0;

        activeIncharges.forEach(inc => {
            const user = inc.originalUser;
            if (user) {
                totalAbsent++;
                // State stats
                const stateName = (user.state && (user.state.name || user.state)) || 'Gujarat';
                stateStats[stateName] = (stateStats[stateName] || 0) + 1;
                // Cluster stats
                if (user.cluster) {
                    clusterStats[user.cluster] = (clusterStats[user.cluster] || 0) + 1;
                }
            }
        });

        // 2. Fetch all employees to populate the list
        const users = await User.find({ role: { $in: ['admin', 'employee', 'dealerManager', 'franchiseeManager', 'delivery_manager', 'installer'] } })
            .populate('department', 'name')
            .populate('dynamicRole', 'name')
            .populate('state', 'name')
            .lean();

        // 3. Fetch active resignations for Notice Period logic
        const activeResignations = await Resignation.find({
            status: 'Approved'
        }).lean();

        const allStateStats = {
            absent: {},
            notice: {}
        };

        let totalNotice = 0;
        const noticeStateStats = {};

        // 3. Map users to table format and sync statuses
        const employeeList = await Promise.all(users.map(async (user, index) => {
            const stateName = (user.state && (user.state.name || user.state)) || 'Gujarat';

            // Check if user has an ACTIVE and VALID incharge record for TODAY
            const activeInchargeRecord = activeIncharges.find(inc =>
                inc.originalUser?._id?.toString() === user._id.toString() &&
                new Date(inc.startDate) <= today &&
                new Date(inc.endDate) >= today
            );

            const isCurrentlyAbsent = !!activeInchargeRecord;

            // Sync User.employeeStatus in DB if it's out of sync
            const expectedStatus = isCurrentlyAbsent ? 'Absent' : 'Present';
            if (user.employeeStatus !== expectedStatus) {
                await User.findByIdAndUpdate(user._id, {
                    employeeStatus: expectedStatus,
                    temporaryIncharge: isCurrentlyAbsent ? activeInchargeRecord.tempInchargeUser : null
                });
            }

            // Notice Period Logic
            let isNoticePeriod = user.status && user.status.toLowerCase() === 'notice period';
            let remainingNoticeDays = null;
            let empStatus = expectedStatus;

            const activeResignation = activeResignations.find(res => res.employee.toString() === user._id.toString());

            if (activeResignation) {
                const lwd = new Date(activeResignation.lastWorkingDate);
                // Reset time for accurate day comparison
                lwd.setHours(0, 0, 0, 0);
                const todayCurrent = new Date();
                todayCurrent.setHours(0, 0, 0, 0);

                if (todayCurrent > lwd) {
                    // Update user to Resigned if lwd has passed
                    await User.findByIdAndUpdate(user._id, { status: 'Resigned' });
                    empStatus = 'Resigned';
                    isNoticePeriod = false;

                    // Also mark resignation as completed
                    await Resignation.findByIdAndUpdate(activeResignation._id, { status: 'Completed' });
                } else {
                    isNoticePeriod = true;
                    empStatus = 'Notice Period';
                    const diffTime = lwd - todayCurrent;
                    remainingNoticeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (user.status !== 'Notice Period') {
                        await User.findByIdAndUpdate(user._id, { status: 'Notice Period' });
                    }
                }
            }

            if (isCurrentlyAbsent) {
                allStateStats.absent[stateName] = (allStateStats.absent[stateName] || 0) + 1;
            }
            if (isNoticePeriod) {
                totalNotice++;
                noticeStateStats[stateName] = (noticeStateStats[stateName] || 0) + 1;
                allStateStats.notice[stateName] = (allStateStats.notice[stateName] || 0) + 1;
            }

            // Use real data from the User model
            const absentDays = user.absentDays || 0;
            const pendingTask = user.pendingTasks || 0;
            const overdueTask = user.overdueTasks || 0;

            return {
                _id: user._id,
                employeeId: `EMP` + String(index + 1).padStart(3, '0'),
                name: user.name,
                email: user.email,
                department: user.department?.name || '-',
                position: user.dynamicRole?.name || user.role, // role fallback
                state: stateName,
                status: empStatus,
                isNoticePeriod: isNoticePeriod,
                isAbsent: isCurrentlyAbsent,
                absentDays: `${absentDays} days`,
                noticeStatus: isNoticePeriod ? `${remainingNoticeDays} Days` : 'N/A',
                remainingNoticeDays,
                pendingTask,
                overdueTask,
                tempInchargeId: activeInchargeRecord ? activeInchargeRecord.tempInchargeUser : null,
                inchargeRecordId: activeInchargeRecord ? activeInchargeRecord._id : null,
                startDate: activeInchargeRecord ? activeInchargeRecord.startDate : null,
                endDate: activeInchargeRecord ? activeInchargeRecord.endDate : null,
                action: activeInchargeRecord ? 'N/A' : 'Assign'
            };
        }));

        // Populate temp incharge names
        const tempInchargeIds = employeeList.map(e => e.tempInchargeId).filter(Boolean);
        if (tempInchargeIds.length > 0) {
            const tempUsers = await User.find({ _id: { $in: tempInchargeIds } }).select('name').lean();
            const tempUserMap = tempUsers.reduce((acc, u) => { acc[u._id.toString()] = u.name; return acc; }, {});

            employeeList.forEach(e => {
                if (e.tempInchargeId && tempUserMap[e.tempInchargeId.toString()]) {
                    e.tempInchargeName = tempUserMap[e.tempInchargeId.toString()];
                } else {
                    e.tempInchargeName = '-';
                }
            });
        } else {
            employeeList.forEach(e => e.tempInchargeName = '-');
        }

        res.json({
            success: true,
            data: {
                totalAbsent,
                stateStats, // Absent state stats
                totalNotice,
                noticeStateStats,
                clusterStats,
                allStateStats, // { absent: {}, notice: {} }
                employeeList: employeeList.filter(e => e.status !== 'Resigned')
            }
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        next(err);
    }
};

// --- Seed Modules (Helper to ensure we have modules to work with as per "Dynamic" rule, we need data in DB) ---
// This might be called manually or via a special endpoint to init the system.
export const seedSystemModules = async (req, res, next) => {
    try {
        const predefinedModules = [
            { name: "Recruitment Management", key: "recruitment_management", defaultLevel: "country" },
            { name: "Employee Onboarding", key: "employee_onboarding", defaultLevel: "state" },
            { name: "Performance Reviews", key: "performance_reviews", defaultLevel: "cluster" },
            { name: "Payroll Processing", key: "payroll_processing", defaultLevel: "district" },
            { name: "Accounts Payable", key: "accounts_payable", defaultLevel: "country" },
            { name: "Accounts Receivable", key: "accounts_receivable", defaultLevel: "state" },
            { name: "Budget Management", key: "budget_management", defaultLevel: "cluster" },
            // Sidebar Modules
            { name: "HR Settings", key: "settings_hr", defaultLevel: "country" },
            { name: "Vendor Settings", key: "settings_vendor", defaultLevel: "country" },
            { name: "Sales Settings", key: "settings_sales", defaultLevel: "country" },
            { name: "Marketing Settings", key: "settings_marketing", defaultLevel: "country" },
            { name: "Delivery Settings", key: "settings_delivery", defaultLevel: "country" },
            { name: "Installer Settings", key: "settings_installer", defaultLevel: "country" },
            { name: "Inventory Settings", key: "settings_inventory", defaultLevel: "country" },
            { name: "Product Settings", key: "settings_product", defaultLevel: "country" },
            { name: "Brand Settings", key: "settings_brand", defaultLevel: "country" },
            { name: "Combokit Settings", key: "settings_combokit", defaultLevel: "country" },
            { name: "Order Procurement", key: "settings_order_procurement", defaultLevel: "country" },
            { name: "Franchisee Settings", key: "settings_franchisee", defaultLevel: "country" },
            { name: "Dealer Settings", key: "settings_dealer", defaultLevel: "country" },
            { name: "HRMS Settings", key: "settings_hrms", defaultLevel: "country" },
            { name: "Project Settings", key: "settings_project", defaultLevel: "country" },
            { name: "Quote Settings", key: "settings_quote", defaultLevel: "country" },
            { name: "Reports", key: "reports", defaultLevel: "country" }
        ];

        for (const mod of predefinedModules) {
            await Module.findOneAndUpdate(
                { key: mod.key },
                mod,
                { upsert: true, new: true }
            );
        }

        res.json({ success: true, message: 'System modules seeded' });
    } catch (err) {
        next(err);
    }
};

// --- Employee Management Logic ---

export const getEmployees = async (req, res, next) => {
    try {
        const query = { role: { $in: ['admin', 'employee', 'dealerManager', 'franchiseeManager', 'delivery_manager', 'installer'] } };
        const employees = await User.find(query)
            .populate('department', 'name')
            .populate('dynamicRole', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: employees.length, data: employees });
    } catch (err) {
        next(err);
    }
};

export const createEmployee = async (req, res, next) => {
    try {
        const { name, email, phone, password, role, department, state, status } = req.body;

        if (!name || !email || !phone || !password || !state) {
            return res.status(400).json({ success: false, message: 'Name, email, phone, password, and state are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        const newEmployee = await User.create({
            name,
            email,
            phone,
            password,
            role: role || 'employee',
            department: department || null,
            state,
            status: status || 'active',
            createdBy: req.user?.id
        });

        const populatedEmployee = await User.findById(newEmployee._id)
            .populate('department', 'name')
            .populate('dynamicRole', 'name');

        res.status(201).json({ success: true, message: 'Employee created successfully', data: populatedEmployee });
    } catch (err) {
        next(err);
    }
};

export const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent password update through this route for security, unless specifically handled
        if (updates.password) {
            delete updates.password;
        }

        const updatedEmployee = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('department', 'name')
            .populate('dynamicRole', 'name');

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.json({ success: true, message: 'Employee updated successfully', data: updatedEmployee });
    } catch (err) {
        next(err);
    }
};

export const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedEmployee = await User.findByIdAndDelete(id);

        if (!deletedEmployee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// --- Resignation Logic ---

export const createResignationRequest = async (req, res, next) => {
    try {
        const { employee, department, position, resignationDate, noticePeriodDays, lastWorkingDate, reason } = req.body;

        if (!employee || !resignationDate || noticePeriodDays == null || !lastWorkingDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields for resignation.' });
        }

        const newResignation = await Resignation.create({
            employee,
            department: department || null,
            position,
            resignationDate,
            noticePeriodDays,
            lastWorkingDate,
            reason,
            createdBy: req.user?.id
        });

        res.status(201).json({ success: true, message: 'Resignation request created successfully', data: newResignation });
    } catch (err) {
        next(err);
    }
};

export const getResignationRequests = async (req, res, next) => {
    try {
        const requests = await Resignation.find()
            .populate('employee', 'name userId phone role')
            .populate('department', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        next(err);
    }
};

export const approveResignation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resignation = await Resignation.findById(id);
        if (!resignation) {
            return res.status(404).json({ success: false, message: 'Resignation request not found' });
        }

        if (resignation.status !== 'Pending') {
            return res.status(400).json({ success: false, message: `Cannot approve request with status: ${resignation.status}` });
        }

        resignation.status = 'Approved';
        await resignation.save();

        // Update User Status to Notice Period
        await User.findByIdAndUpdate(resignation.employee, { status: 'Notice Period' });

        res.json({ success: true, message: 'Resignation approved successfully', data: resignation });
    } catch (err) {
        next(err);
    }
};

export const rejectResignation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const resignation = await Resignation.findById(id);
        if (!resignation) {
            return res.status(404).json({ success: false, message: 'Resignation request not found' });
        }

        if (resignation.status !== 'Pending') {
            return res.status(400).json({ success: false, message: `Cannot reject request with status: ${resignation.status}` });
        }

        resignation.status = 'Rejected';
        resignation.reason = reason ? `${resignation.reason}\nRejection Reason: ${reason}` : resignation.reason;

        await resignation.save();

        res.json({ success: true, message: 'Resignation rejected successfully', data: resignation });
    } catch (err) {
        next(err);
    }
};
