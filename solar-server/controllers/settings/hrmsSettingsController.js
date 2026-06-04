import HRMSSettings from '../../models/hr/HRMSSettings.js';
import CandidateTest from '../../models/hr/CandidateTest.js';
import CandidateTraining from '../../models/hr/CandidateTraining.js';
import Vacancy from '../../models/hr/Vacancy.js';
import Candidate from '../../models/hr/Candidate.js';
import User from '../../models/users/User.js';
import bcryptjs from 'bcryptjs';

// --- HRMS Settings ---

export const getHRMSSettings = async (req, res, next) => {
    try {
        const { department, position, country, state, cluster, district } = req.query;
        const query = { isActive: true };

        if (department) query.department = department; // ID
        if (position) query.position = position;
        if (country) query.country = country;
        if (state) query.state = state;
        if (cluster) query.cluster = cluster;
        if (district) query.district = district;

        const settings = await HRMSSettings.find(query)
            .populate('department', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: settings.length, data: settings });
    } catch (err) {
        next(err);
    }
};

export const createOrUpdateHRMSSettings = async (req, res, next) => {
    try {
        const { department, position, country, state, cluster, district } = req.body;

        // Check for duplicate
        const existingSettings = await HRMSSettings.findOne({
            department,
            position,
            country,
            state,
            cluster,
            district,
            isActive: true
        });

        if (existingSettings) {
            return res.status(400).json({
                success: false,
                message: 'Configuration already exists for this location. Duplicate configuration is not allowed.'
            });
        }

        const { payroll, recruitment, performance, vacancy, test } = req.body;

        // Always create a new record instead of updating an existing one
        const settings = await HRMSSettings.create({
            department,
            position,
            country,
            state,
            cluster,
            district,
            payroll,
            recruitment,
            performance,
            vacancy,
            test,
            createdBy: req.user?.id
        });

        res.json({ success: true, message: 'Settings saved successfully', data: settings });
    } catch (err) {
        next(err);
    }
};

export const updateHRMSSettings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { department, position, payroll, recruitment, performance, vacancy, test } = req.body;

        const updateData = {
            ...req.body,
            updatedBy: req.user?.id
        };

        const settings = await HRMSSettings.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!settings) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }

        res.json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (err) {
        next(err);
    }
};

export const deleteHRMSSettings = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Soft delete
        const settings = await HRMSSettings.findByIdAndUpdate(
            id,
            { isActive: false, updatedBy: req.user?.id },
            { new: true }
        );

        if (!settings) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }

        res.json({ success: true, message: 'Settings deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// --- Candidate Tests ---

export const getCandidateTests = async (req, res, next) => {
    try {
        const { department } = req.query;
        const query = { isActive: true };

        if (department) query.department = department;
        if (req.query.country) query.country = req.query.country;
        if (req.query.state) query.state = req.query.state;
        if (req.query.cluster) query.cluster = req.query.cluster;
        if (req.query.district) query.district = req.query.district;

        const tests = await CandidateTest.find(query)
            .populate('department', 'name')
            .populate('country', 'name')
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('cities', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: tests.length, data: tests });
    } catch (err) {
        next(err);
    }
};

export const createCandidateTest = async (req, res, next) => {
    try {
        const { department, country, state, cluster, district } = req.body;

        // Check for duplicate
        const existingTest = await CandidateTest.findOne({
            department,
            country,
            state,
            cluster,
            district,
            isActive: true
        });

        if (existingTest) {
            return res.status(400).json({
                success: false,
                message: 'Configuration already exists for this location. Duplicate configuration is not allowed.'
            });
        }

        const test = await CandidateTest.create({
            ...req.body,
            createdBy: req.user?.id
        });
        res.status(201).json({ success: true, message: 'Test created successfully', data: test });
    } catch (err) {
        next(err);
    }
};

export const updateCandidateTest = async (req, res, next) => {
    try {
        const test = await CandidateTest.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user?.id },
            { new: true }
        );
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.json({ success: true, message: 'Test updated successfully', data: test });
    } catch (err) {
        next(err);
    }
};

export const deleteCandidateTest = async (req, res, next) => {
    try {
        const test = await CandidateTest.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedBy: req.user?.id },
            { new: true }
        ); // Soft delete
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.json({ success: true, message: 'Test deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// --- Candidate Trainings ---

export const getCandidateTrainings = async (req, res, next) => {
    try {
        const { department, position } = req.query;
        const query = { isActive: true };

        if (department) query.department = department;
        if (position) query.position = position;
        if (req.query.country) query.country = req.query.country;
        if (req.query.state) query.state = req.query.state;
        if (req.query.cluster) query.cluster = req.query.cluster;
        if (req.query.district) query.district = req.query.district;

        const trainings = await CandidateTraining.find(query)
            .populate('department', 'name')
            .populate('country', 'name')
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('cities', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: trainings.length, data: trainings });
    } catch (err) {
        next(err);
    }
};

export const createCandidateTraining = async (req, res, next) => {
    try {
        const { department, position, country, state, cluster, district } = req.body;

        // Check for duplicate
        const existingTraining = await CandidateTraining.findOne({
            department,
            position,
            country,
            state,
            cluster,
            district,
            isActive: true
        });

        if (existingTraining) {
            return res.status(400).json({
                success: false,
                message: 'Configuration already exists for this location. Duplicate configuration is not allowed.'
            });
        }

        const training = await CandidateTraining.create({
            ...req.body,
            createdBy: req.user?.id
        });
        res.status(201).json({ success: true, message: 'Training created successfully', data: training });
    } catch (err) {
        next(err);
    }
};

export const updateCandidateTraining = async (req, res, next) => {
    try {
        const training = await CandidateTraining.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user?.id },
            { new: true }
        );
        if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
        res.json({ success: true, message: 'Training updated successfully', data: training });
    } catch (err) {
        next(err);
    }
};

export const deleteCandidateTraining = async (req, res, next) => {
    try {
        const training = await CandidateTraining.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedBy: req.user?.id },
            { new: true }
        ); // Soft delete
        if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
        res.json({ success: true, message: 'Training deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// --- Vacancies ---

export const getVacancies = async (req, res, next) => {
    try {
        const { department, state, position } = req.query;
        const query = { isActive: true };

        if (department) query.department = department;
        if (req.query.country) query.country = req.query.country;
        if (req.query.state) query.state = req.query.state;
        if (req.query.cluster) query.cluster = req.query.cluster;
        if (req.query.district) query.district = req.query.district;
        if (position) query.position = position;

        const vacancies = await Vacancy.find(query)
            .populate('department', 'name')
            .populate('country', 'name')
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('cities', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: vacancies.length, data: vacancies });
    } catch (err) {
        next(err);
    }
};

export const createVacancy = async (req, res, next) => {
    try {
        const { department, position, country, state, cluster, district } = req.body;

        // Check for duplicate
        const existingVacancy = await Vacancy.findOne({
            department,
            position,
            country,
            state,
            cluster,
            district,
            isActive: true
        });

        if (existingVacancy) {
            return res.status(400).json({
                success: false,
                message: 'Configuration already exists for this location. Duplicate configuration is not allowed.'
            });
        }

        const vacancy = await Vacancy.create({
            ...req.body,
            createdBy: req.user?.id
        });
        res.status(201).json({ success: true, message: 'Vacancy created successfully', data: vacancy });
    } catch (err) {
        next(err);
    }
};

export const updateVacancy = async (req, res, next) => {
    try {
        const vacancy = await Vacancy.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user?.id },
            { new: true }
        );
        if (!vacancy) return res.status(404).json({ success: false, message: 'Vacancy not found' });
        res.json({ success: true, message: 'Vacancy updated successfully', data: vacancy });
    } catch (err) {
        next(err);
    }
};

export const deleteVacancy = async (req, res, next) => {
    try {
        const vacancy = await Vacancy.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedBy: req.user?.id },
            { new: true }
        ); // Soft delete
        if (!vacancy) return res.status(404).json({ success: false, message: 'Vacancy not found' });
        res.json({ success: true, message: 'Vacancy deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// --- Candidates (Vacancy Applicants) ---

export const addCandidateToVacancy = async (req, res, next) => {
    try {
        const { vacancyId } = req.params;
        const { name, mobile, email } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({ success: false, message: 'Name and Mobile Number are required' });
        }

        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({ mobile });
        if (existingCandidate) {
            return res.status(400).json({ success: false, message: 'Candidate with this mobile number already exists' });
        }

        // Verify vacancy exists
        const vacancy = await Vacancy.findById(vacancyId);
        if (!vacancy) {
            return res.status(404).json({ success: false, message: 'Vacancy not found' });
        }

        // Generate a random 6-character alphanumeric password
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let rawPassword = '';
        for (let i = 0; i < 6; i++) {
            rawPassword += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Hash the password securely
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(rawPassword, salt);

        // Save Candidate
        const candidate = await Candidate.create({
            name,
            mobile,
            email,
            password: hashedPassword,
            vacancy: vacancyId
        });

        // Determine BaseAppURL
        const frontendUrl = process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL
            : process.env.DEV_FRONTEND_URL || 'http://localhost:3000';

        const loginLink = `${frontendUrl}/candidate-login`;
        res.status(201).json({
            success: true,
            message: 'Candidate created successfully',
            credentials: {
                loginId: mobile,
                password: rawPassword,
                loginLink
            },
            data: candidate
        });

    } catch (err) {
        next(err);
    }
};

export const getCandidatesByVacancy = async (req, res, next) => {
    try {
        const { vacancyId } = req.params;
        const candidates = await Candidate.find({ vacancy: vacancyId }).sort({ createdAt: -1 });
        res.json({ success: true, count: candidates.length, data: candidates });
    } catch (err) {
        next(err);
    }
};

export const updateCandidateStatus = async (req, res, next) => {
    try {
        const { candidateId } = req.params;
        const { status } = req.body;

        const candidate = await Candidate.findByIdAndUpdate(
            candidateId,
            { status },
            { new: true, runValidators: true }
        );

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }
        res.json({ success: true, message: 'Status updated successfully', data: candidate });
    } catch (err) {
        next(err);
    }
};

export const recruitCandidate = async (req, res, next) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate.findById(candidateId).populate('vacancy');

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        candidate.status = 'Joined';
        const joiningDate = req.body.joiningDate || new Date();
        candidate.preferredJoiningDate = joiningDate;
        await candidate.save();

        let user = null;
        if (candidate.email) {
            user = await User.findOne({ email: candidate.email });
        }
        if (!user && candidate.mobile) {
            user = await User.findOne({ phone: candidate.mobile });
        }

        const rawPassword = candidate.mobile || 'password123';

        if (!user) {
            user = await User.create({
                name: candidate.name,
                email: candidate.email || `${candidate.mobile}@temp.com`,
                phone: candidate.mobile,
                password: rawPassword,
                role: 'employee',
                trainingCompleted: false,
                department: candidate.vacancy?.department,
                state: candidate.vacancy?.state || '69aa2a5d476790c4ac681ceba', // Fallback to Gujarat ID
                isActive: true
            });
        }

        res.json({
            success: true,
            message: 'Candidate recruited successfully',
            credentials: {
                loginId: user.phone || user.email,
                password: rawPassword
            }
        });

    } catch (err) {
        next(err);
    }
};

export const getAllCandidates = async (req, res, next) => {
    try {
        const query = {};

        // Optional filters
        if (req.query.status) query.status = req.query.status;
        if (req.query.mobile) query.mobile = new RegExp(req.query.mobile, 'i');

        const candidates = await Candidate.find(query)
            .populate({
                path: 'vacancy',
                select: 'title department joiningDate state cluster',
                populate: [
                    { path: 'department', select: 'name' },
                    { path: 'state', select: 'name' },
                    { path: 'cluster', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: candidates.length, data: candidates });
    } catch (err) {
        next(err);
    }
};

export const deleteCandidate = async (req, res, next) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate.findByIdAndDelete(candidateId);

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        res.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (err) {
        next(err);
    }
};
