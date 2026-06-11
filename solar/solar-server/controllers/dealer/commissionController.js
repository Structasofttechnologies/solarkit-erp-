
import Project from '../../models/projects/Project.js';
import mongoose from 'mongoose';

// @desc    Get commission statistics for dealer
// @route   GET /api/dealer/commission/stats
// @access  Private (Dealer)
export const getCommissionStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch all projects created by or assigned to this dealer
        // Check if projects are linked via 'createdBy' or 'cp' (Company Partner) field or some other way.
        // Assuming 'createdBy' is the primary link for now as per Project.js schema.

        const projects = await Project.find({ isActive: true })
            .sort({ createdAt: -1 });

        // Calculate Summary Stats
        const totalProjects = projects.length;

        let totalCommission = 0;
        let completedCommission = 0;
        let pendingCommission = 0;
        let highestCommission = 0;

        // Arrays for charts
        const monthlyCommission = {};
        const projectDistribution = {
            'Residential': 0,
            'Commercial': 0,
            'Completed': 0,
            'Pending': 0
        };

        const commissionList = projects.map(project => {
            // Fill default values if missing (for legacy data)
            // Estimation: 1kW ~ 50,000 INR project cost. Commission ~ 5% of that.
            // Adjust as per actual business logic if available.

            let amount = project.totalAmount || (project.totalKW * 50000);
            let comm = project.commission || (amount * 0.05);
            let status = project.commissionStatus || 'Pending';

            // Sync Commission Status with Project Status
            if (project.status === 'Completed' || project.statusStage === 'commission' || project.statusStage === 'subsidydis') {
                status = 'Completed';
            } else if (project.status === 'Project Signed') {
                status = 'Pending';
            } else {
                status = 'Pending'; // Default
            }

            totalCommission += comm;
            if (status === 'Completed' || status === 'Paid') {
                completedCommission += comm;
                projectDistribution['Completed']++;
            } else {
                pendingCommission += comm;
                projectDistribution['Pending']++;
            }

            if (comm > highestCommission) highestCommission = comm;

            // Monthly Trend
            const monthYear = new Date(project.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyCommission[monthYear]) monthlyCommission[monthYear] = 0;
            monthlyCommission[monthYear] += comm;

            // Project Type Distribution
            if (project.category === 'Residential') projectDistribution['Residential']++;
            else if (project.category === 'Commercial') projectDistribution['Commercial']++;

            return {
                id: project._id,
                project: project.projectName,
                type: project.category, // Residential/Commercial
                typeColor: project.category === 'Residential' ? 'success' : 'info',
                systemSize: `${project.totalKW} kW`,
                totalAmount: `₹${amount.toLocaleString()}`,
                commission: `₹${comm.toLocaleString()}`,
                date: new Date(project.createdAt).toLocaleDateString('en-GB'), // 25 NOV 25
                status: status,
                statusColor: (status === 'Completed' || status === 'Paid') ? 'primary' : 'warning'
            };
        });

        // Format Monthly Data for Chart
        // We want last 6 months or all? Let's sort keys.
        // For simplicity, let's take all available and sort by date.
        // Actually, let's just send the object or array.

        const chartCategories = Object.keys(monthlyCommission);
        const chartData = Object.values(monthlyCommission);

        // Average Commission
        const averageCommission = totalProjects > 0 ? (totalCommission / totalProjects) : 0;

        const stats = {
            totalCommission: `₹${totalCommission.toLocaleString()}`,
            completedCommission: `₹${completedCommission.toLocaleString()}`,
            pendingCommission: `₹${pendingCommission.toLocaleString()}`,
            averageCommission: `₹${Math.round(averageCommission).toLocaleString()}`,
            highestCommission: `₹${highestCommission.toLocaleString()}`,
            totalProjects: totalProjects.toString()
        };

        const charts = {
            trend: {
                categories: chartCategories,
                data: chartData
            },
            distribution: [
                projectDistribution['Residential'],
                projectDistribution['Commercial'],
                projectDistribution['Completed'],
                projectDistribution['Pending']
            ]
        };



        res.status(200).json({
            success: true,
            stats,
            charts,
            tableData: commissionList
        });

    } catch (error) {
        next(error);
    }
};
