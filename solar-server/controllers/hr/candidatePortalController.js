import Candidate from '../../models/hr/Candidate.js';
import Vacancy from '../../models/hr/Vacancy.js';
import CandidateTest from '../../models/hr/CandidateTest.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/users/User.js';

const generateToken = (id) => {
    return jwt.sign({ id, role: 'candidate' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Candidate login
// @route   POST /api/candidate-portal/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({ success: false, message: 'Please provide mobile number and password' });
        }

        const candidate = await Candidate.findOne({ mobile }).populate({
            path: 'vacancy',
            populate: [
                { path: 'department', select: 'name' }
            ]
        });

        if (!candidate) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcryptjs.compare(password, candidate.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(candidate._id);

        res.json({
            success: true,
            token,
            candidate: {
                id: candidate._id,
                name: candidate.name,
                mobile: candidate.mobile,
                email: candidate.email,
                status: candidate.status,
                vacancy: candidate.vacancy
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get candidate profile
// @route   GET /api/candidate-portal/me
// @access  Private (Candidate)
export const getMe = async (req, res, next) => {
    try {
        const candidate = await Candidate.findById(req.user.id).populate({
            path: 'vacancy',
            populate: [
                { path: 'department', select: 'name' }
            ]
        });

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        // Also fetch the candidate test settings for this vacancy's department
        let testSetting = null;
        if (candidate.vacancy && candidate.vacancy.department) {
            testSetting = await CandidateTest.findOne({
                department: candidate.vacancy.department._id || candidate.vacancy.department,
                isActive: true
            }).sort({ createdAt: -1 });
        }

        res.json({
            success: true,
            candidate,
            testSetting
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Start test
// @route   POST /api/candidate-portal/start-test
// @access  Private (Candidate)
export const startTest = async (req, res, next) => {
    try {
        const candidate = await Candidate.findById(req.user.id);

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (candidate.status !== 'Applied') {
            return res.status(400).json({ success: false, message: 'Test already started or completed' });
        }

        candidate.testStartedAt = new Date();
        await candidate.save();

        res.json({ success: true, message: 'Test started successfully', testStartedAt: candidate.testStartedAt });
    } catch (err) {
        next(err);
    }
}

// @desc    Submit test
// @route   POST /api/candidate-portal/submit-test
// @access  Private (Candidate)
export const submitTest = async (req, res, next) => {
    try {
        const candidate = await Candidate.findById(req.user.id).populate('vacancy');

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        const { answers } = req.body || {};
        let testScore = 0;
        let totalMarks = 0;

        // Fetch test setting to map correct answers
        if (candidate.vacancy && candidate.vacancy.department) {
            const testSetting = await CandidateTest.findOne({
                department: candidate.vacancy.department._id || candidate.vacancy.department,
                isActive: true
            }).sort({ createdAt: -1 });

            if (testSetting && testSetting.questions && answers) {
                testSetting.questions.forEach(question => {
                    const qId = question._id.toString();
                    const candidateAnswer = answers[qId];
                    if (candidateAnswer) {
                        totalMarks += question.marks || 1;
                        if (question.type === 'multiple') {
                            // Arrays must match (ignoring order)
                            const correctArr = question.correctAnswer || [];
                            const candArr = Array.isArray(candidateAnswer) ? candidateAnswer : [];
                            if (correctArr.length === candArr.length && correctArr.every(ans => candArr.includes(ans))) {
                                testScore += question.marks || 1;
                            } else if (testSetting.negativeMarking) {
                                testScore -= testSetting.negativeMarkValue || 0;
                            }
                        } else if (question.type === 'single') {
                            const correctAns = question.correctAnswer && question.correctAnswer.length > 0 ? question.correctAnswer[0] : null;
                            if (correctAns === candidateAnswer) {
                                testScore += question.marks || 1;
                            } else if (testSetting.negativeMarking) {
                                testScore -= testSetting.negativeMarkValue || 0;
                            }
                        } else if (question.type === 'text') {
                            // Text evaluation might need human review, but we'll exact match if exists
                            const correctAns = question.correctAnswer && question.correctAnswer.length > 0 ? question.correctAnswer[0] : null;
                            if (correctAns && correctAns.toLowerCase().trim() === candidateAnswer.toLowerCase().trim()) {
                                testScore += question.marks || 1;
                            }
                        }
                    }
                });
            }
        }

        candidate.testCompletedAt = new Date();
        candidate.status = 'Test Completed';
        candidate.testScore = testScore; // Assume testScore field exists in standard schema or use candidate.testScore
        await candidate.save();

        res.json({ success: true, message: 'Test submitted successfully', status: candidate.status, score: testScore });
    } catch (err) {
        next(err);
    }
}

// @desc    Submit Application
// @route   POST /api/candidate-portal/submit-application
// @access  Private (Candidate)
export const submitApplication = async (req, res, next) => {
    try {
        const { preferredJoiningDate, agreedToTerms } = req.body;
        const candidate = await Candidate.findById(req.user.id).populate('vacancy');

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (!agreedToTerms) {
            return res.status(400).json({ success: false, message: 'You must agree to the terms to proceed' });
        }

        if (!preferredJoiningDate) {
            return res.status(400).json({ success: false, message: 'Preferred joining date is required' });
        }

        const prefDate = new Date(preferredJoiningDate);
        const officialDate = new Date(candidate.vacancy.joiningDate);

        if (prefDate > officialDate) {
            return res.status(400).json({ success: false, message: 'Preferred joining date cannot be after the official joining date' });
        }

        candidate.preferredJoiningDate = prefDate;
        candidate.agreedToTerms = agreedToTerms;
        candidate.status = 'Under Review';
        await candidate.save();

        res.json({ success: true, message: 'Application submitted successfully', status: candidate.status });
    } catch (err) {
        next(err);
    }
}

// @desc    Sign Agreement
// @route   POST /api/candidate-portal/sign-agreement
// @access  Private (Candidate)
export const signAgreement = async (req, res, next) => {
    try {
        const candidate = await Candidate.findById(req.user.id).populate('vacancy');

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (candidate.status !== 'Selected') {
            return res.status(400).json({ success: false, message: 'Not eligible to sign agreement at this stage' });
        }

        candidate.employmentAgreementSigned = true;
        candidate.status = 'Joined';
        await candidate.save();

        // Create ERP User if not already exists
        let user = null;
        if (candidate.email) {
            user = await User.findOne({ email: candidate.email });
        }
        if (!user && candidate.mobile) {
            user = await User.findOne({ phone: candidate.mobile });
        }

        if (!user) {
            const rawPassword = candidate.mobile || 'password123';
            await User.create({
                name: candidate.name,
                email: candidate.email || `${candidate.mobile}@temp.com`,
                phone: candidate.mobile,
                password: rawPassword,
                role: 'employee',
                trainingCompleted: false,
                department: candidate.vacancy?.department,
                state: candidate.vacancy?.state || '69aa2a5d476790c4ac681ceba', // Fallback Gujarat
                isActive: true
            });
        }

        res.json({ success: true, message: 'Agreement signed successfully', status: candidate.status });
    } catch (err) {
        next(err);
    }
}
