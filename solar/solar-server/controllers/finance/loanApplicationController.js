import LoanApplication from '../../models/finance/LoanApplication.js';
import User from '../../models/users/User.js';

export const getLoanApplications = async (req, res) => {
    try {
        const {
            loanType,
            state,
            cluster,
            district,
            status,
            franchiseeId,
            timeline,
            category,
            projectType,
            projectId,
            partnerType,
            plan
        } = req.query;

        let query = {};

        if (projectId) query.project = projectId;
        if (loanType) query.loanType = loanType;
        
        // Multi-select support
        if (state) query.state = { $in: state.split(',') };
        if (cluster) query.cluster = { $in: cluster.split(',') };
        if (district) query.district = { $in: district.split(',') };
        if (status) query.status = status;
        
        if (franchiseeId) {
            const ids = franchiseeId.split(',');
            query.franchisee = { $in: ids };
        }
        
        if (partnerType) {
            const types = partnerType.split(',');
            query.partnerType = { $in: types };
        }
        
        if (plan) {
            const plans = plan.split(',');
            query.plan = { $in: plans };
        }

        if (category) query.category = category;
        if (projectType) query.projectType = projectType;

        // Simple timeline filter
        if (timeline) {
            const now = new Date();
            if (timeline === 'lastweek') {
                query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
            } else if (timeline === 'lastmonth') {
                query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
            }
        }

        const applications = await LoanApplication.find(query)
            .populate('franchisee', 'name')
            .populate('state', 'name')
            .populate('district', 'name')
            .populate('cluster', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLoanStats = async (req, res) => {
    try {
        const { state, cluster, district } = req.query;
        let query = {};
        if (state) query.state = state;
        if (cluster) query.cluster = cluster;
        if (district) query.district = district;

        const allLoans = await LoanApplication.find(query);

        const stats = {
            totalFiles: allLoans.length,
            totalLoanAmount: allLoans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0),
            totalDisbursed: allLoans.reduce((sum, loan) => sum + (loan.disbursedAmount || 0), 0),
            overdue: allLoans.filter(loan => loan.status === 'Pending').length
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createLoanApplication = async (req, res) => {
    try {
        const loanData = {
            ...req.body,
            dealer: req.user?.id
        };

        const newLoan = new LoanApplication(loanData);
        await newLoan.save();

        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully',
            data: newLoan
        });
    } catch (error) {
        console.error('createLoanApplication Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLoanCountsByLocation = async (req, res) => {
    try {
        const counts = await LoanApplication.aggregate([
            {
                $facet: {
                    states: [{ $group: { _id: "$state", count: { $sum: 1 } } }],
                    clusters: [{ $group: { _id: "$cluster", count: { $sum: 1 } } }],
                    districts: [{ $group: { _id: "$district", count: { $sum: 1 } } }]
                }
            }
        ]);
        res.status(200).json({ success: true, data: counts[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
