import CandidateTraining from '../../models/hr/CandidateTraining.js';
import User from '../../models/users/User.js';

export const getMyTraining = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('department');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch training based on user's department
        let query = { isActive: true };
        if (user.department) {
            query.department = user.department._id;
        } else {
            // If no department, maybe return empty or general training
            // For now, assume if no department, they don't have specific training
            return res.json({ success: true, data: null, message: "No training assigned" });
        }

        const training = await CandidateTraining.findOne(query).sort({ createdAt: -1 });

        res.json({ success: true, data: training });
    } catch (err) {
        next(err);
    }
};

export const completeTraining = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.trainingCompleted = true;
        await user.save();

        res.json({ success: true, message: 'Training completed successfully, full ERP access granted' });
    } catch (err) {
        next(err);
    }
};
