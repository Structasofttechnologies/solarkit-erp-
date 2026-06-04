import User from '../../models/users/User.js';
import Project from '../../models/projects/Project.js';
import OverdueTaskSetting from '../../models/approvals/OverdueTaskSetting.js';
import { calculateStageStatus, calculateTimelineDelay } from '../../utils/statusCalculator.js';

export const getMyOverdueTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Fetch user's assigned projects/tasks
        const projects = await Project.find({
            $or: [
                { assignedTo: userId },
                { surveyor: userId },
                { installer: userId }
            ],
            status: { $nin: ['Completed', 'Cancelled'] }
        }).lean();

        // 2. Fetch global/applicable overdue settings
        const settings = await OverdueTaskSetting.findOne({ 
            districts: { $size: 0 }, 
            clusters: { $size: 0 } 
        }) || {};

        // 3. Filter for overdue tasks
        const overdueTasks = projects.map(p => {
            const timeline = calculateTimelineDelay(p.createdAt, settings);
            const stageStatus = calculateStageStatus(p.updatedAt, p.status, settings);
            
            return {
                id: p._id,
                projectName: p.projectName,
                currentStage: p.status,
                startDate: p.createdAt,
                delayDays: timeline.delayDays,
                isOverdue: timeline.isOverdue || stageStatus === 'overdue',
                priority: timeline.status === 'critical' ? 'High' : 'Medium'
            };
        }).filter(t => t.isOverdue);

        res.status(200).json({
            success: true,
            data: {
                totalOverdue: overdueTasks.length,
                tasks: overdueTasks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const projects = await Project.find({ assignedTo: userId });
        
        const stats = {
            totalAssigned: projects.length,
            completed: projects.filter(p => p.status === 'Completed').length,
            pending: projects.filter(p => p.status !== 'Completed').length
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
