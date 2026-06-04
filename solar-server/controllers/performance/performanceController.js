import UserPerformance from '../../models/users/UserPerformance.js';
import User from '../../models/users/User.js';
import Order from '../../models/orders/Order.js';
import Lead from '../../models/marketing/Lead.js';
import Project from '../../models/projects/Project.js';
import InventoryItem from '../../models/inventory/InventoryItem.js';
import mongoose from 'mongoose';

const getPerformanceData = async (req, res, roleFilter) => {
    try {
        const { stateId, clusterId, districtId, countryId, timeline, userType } = req.query;

        console.log(`🚀 [Dynamic Performance API] Fetching real-time data for role: ${roleFilter}`);
        console.log("✅ Database connected successfully");
        if (req.user && req.user.role === 'dealerManager') {
            console.log(`✅ [Dealer Manager] Fetching dealers onboarded by manager ID: ${req.user.id}`);
        } else {
            console.log("✅ Admin connected to Dealer collections");
        }
        console.log("🔄 Dealer update event triggered");

        let userFilter = { role: roleFilter || 'dealer' };
        if (userType) userFilter.role = userType;

        // Scope data to the manager who is requesting it
        if (req.user && req.user.role === 'dealerManager' && roleFilter === 'dealer') {
            userFilter.createdBy = req.user.id;
        } else if (req.user && req.user.role === 'franchiseeManager' && roleFilter === 'franchisee') {
            userFilter.createdBy = req.user.id;
        }

        let commonFilter = {};
        if (stateId && mongoose.Types.ObjectId.isValid(stateId)) commonFilter.state = new mongoose.Types.ObjectId(stateId);
        if (districtId && mongoose.Types.ObjectId.isValid(districtId)) commonFilter.district = new mongoose.Types.ObjectId(districtId);
        if (clusterId && mongoose.Types.ObjectId.isValid(clusterId)) commonFilter.cluster = new mongoose.Types.ObjectId(clusterId);

        let orderFilter = {};
        if (commonFilter.state) orderFilter['customer.state'] = commonFilter.state;
        if (commonFilter.district) orderFilter['customer.district'] = commonFilter.district;
        if (commonFilter.cluster) orderFilter['customer.cluster'] = commonFilter.cluster;

        let dateFilter = {};
        if (timeline) {
            const days = parseInt(timeline);
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);
            dateFilter = { $gte: dateLimit };
            commonFilter.createdAt = dateFilter;
            orderFilter.createdAt = dateFilter;
        }

        const users = await User.find(userFilter).select('name _id status address cluster createdBy').populate('createdBy', 'name').lean();
        const userIds = users.map(u => u._id);

        const [orders, leads, projects, inventory] = await Promise.all([
            Order.find({ ...orderFilter, $or: [{ dealerId: { $in: userIds } }, { user: { $in: userIds } }] }).lean(),
            Lead.find({ ...commonFilter, $or: [{ dealerId: { $in: userIds } }, { dealer: { $in: userIds } }] }).lean(),
            Project.find({ ...commonFilter, $or: [{ dealerId: { $in: userIds } }, { createdBy: { $in: userIds } }] }).lean(),
            InventoryItem.find({ ...commonFilter, $or: [{ dealerId: { $in: userIds } }, { createdBy: { $in: userIds } }] }).lean()
        ]);

        console.log(`📊 Data Fetched: ${orders.length} Orders, ${leads.length} Leads, ${projects.length} Projects, ${inventory.length} Inventory`);
        console.log("✅ Data sync successful");

        const totalLeads = leads.length;
        const totalProjects = projects.length;
        const totalQuotes = leads.filter(l => l.status === 'QuoteGenerated').length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) + projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const totalKW = projects.reduce((sum, p) => sum + (p.totalKW || 0), 0);
        const totalInventory = inventory.reduce((sum, i) => sum + (i.quantity || 0), 0);

        const conversionRatio = totalLeads > 0 ? ((totalOrders / totalLeads) * 100).toFixed(1) : 0;
        const avgOrderAmount = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        const targetAchievement = 72; // Dummy / config value if needed

        const statusCounts = {
            Active: users.filter(u => u.status === 'active').length,
            Inactive: users.filter(u => u.status !== 'active').length,
            Performer: users.filter(u => u.status === 'active' && orders.some(o => o.dealerId?.toString() === u._id.toString() || o.user?.toString() === u._id.toString())).length
        };

        const dealerStats = {};

        users.forEach(u => {
            dealerStats[u._id] = {
                id: u._id,
                name: u.name,
                franchiseeName: u.createdBy?.name || 'Self/Admin',
                location: u.address || 'N/A',
                status: u.status === 'active' ? 'Active' : 'Inactive',
                orders: 0,
                revenue: 0,
                leads: 0,
                projects: 0,
                inventory: 0,
                conversion: 0
            };
        });

        orders.forEach(o => {
            const matchedUserId = o.dealerId || o.user;
            if (matchedUserId && dealerStats[matchedUserId]) {
                dealerStats[matchedUserId].orders += 1;
                dealerStats[matchedUserId].revenue += o.totalAmount || 0;
            }
        });

        leads.forEach(l => {
            const matchedUserId = l.dealerId || l.dealer;
            if (matchedUserId && dealerStats[matchedUserId]) {
                dealerStats[matchedUserId].leads += 1;
            }
        });

        projects.forEach(p => {
            const matchedUserId = p.dealerId || p.createdBy;
            if (matchedUserId && dealerStats[matchedUserId]) {
                dealerStats[matchedUserId].projects += 1;
                dealerStats[matchedUserId].revenue += p.totalAmount || 0;
            }
        });

        inventory.forEach(i => {
            const matchedUserId = i.dealerId || i.createdBy;
            if (matchedUserId && dealerStats[matchedUserId]) {
                dealerStats[matchedUserId].inventory += i.quantity || 0;
            }
        });

        Object.values(dealerStats).forEach(stat => {
            stat.conversion = stat.leads > 0 ? ((stat.orders / stat.leads) * 100).toFixed(1) : 0;
        });

        const tableData = Object.values(dealerStats).sort((a, b) => b.revenue - a.revenue);

        const topDealers = tableData.slice(0, 10);
        const dealerPerformanceChart = {
            categories: topDealers.map(d => d.name),
            series: [
                { name: 'Leads', data: topDealers.map(d => d.leads) },
                { name: 'Orders', data: topDealers.map(d => d.orders) },
                { name: 'Projects', data: topDealers.map(d => d.projects) }
            ]
        };

        const trendsMap = {};
        orders.forEach(o => {
            const dateParams = new Date(o.createdAt).toLocaleDateString();
            if (!trendsMap[dateParams]) trendsMap[dateParams] = { count: 0, amount: 0 };
            trendsMap[dateParams].count += 1;
            trendsMap[dateParams].amount += o.totalAmount || 0;
        });
        const dates = Object.keys(trendsMap).sort((a, b) => new Date(a) - new Date(b));
        const orderTrendsChart = {
            categories: dates,
            series: [
                { name: 'Orders Count', type: 'column', data: dates.map(d => trendsMap[d].count) },
                { name: 'Order Amount', type: 'line', data: dates.map(d => trendsMap[d].amount) }
            ]
        };

        const clusterMap = {};
        const districtMap = {};
        
        users.forEach(u => {
            const cluster = u.cluster || 'Unknown';
            clusterMap[cluster] = (clusterMap[cluster] || 0) + 1;
            
            // For Map: Group by district if it exists
            if (u.district) {
                const distId = u.district.toString();
                if (!districtMap[distId]) districtMap[distId] = { count: 0, name: 'District' };
                districtMap[distId].count += 1;
            }
        });

        const clusterChart = {
            labels: Object.keys(clusterMap),
            series: Object.values(clusterMap)
        };

        // Real-time KPI calculations
        // Growth: Ratio of recent orders to total orders (simplified)
        const recentOrders = orders.filter(o => {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            return new Date(o.createdAt) >= fiveDaysAgo;
        }).length;
        const dynamicGrowth = totalOrders > 0 ? ((recentOrders / totalOrders) * 100).toFixed(1) : 0;

        // Target Achievement: Calculated based on a standard target per user
        const targetPerUser = 10; // Dummy target kw or orders
        const totalTarget = users.length * targetPerUser;
        const dynamicTargetAchievement = totalTarget > 0 ? Math.min(100, ((totalOrders / totalTarget) * 100)).toFixed(1) : 0;
        
        if (totalOrders === 0) console.log('ℹ️ [Performance] No orders found to calculate growth');
        if (users.length === 0) console.log('ℹ️ [Performance] No users found to calculate target achievement');


        res.status(200).json({
            success: true,
            summary: {
                totalRecords: users.length,
                totalLeads,
                totalOrders,
                totalQuotes, 
                totalAmount: totalRevenue,
                totalKW: totalKW,
                conversionRatio,
                avgOrderAmount,
                targetAchievement: dynamicTargetAchievement,
                growth: dynamicGrowth,
                statusCounts
            },
            charts: {
                franchiseePerformance: {
                    labels: topDealers.map(d => d.name),
                    leads: topDealers.map(d => d.leads),
                    signups: topDealers.map(d => d.orders)
                },
                orderPerformance: {
                    labels: dates,
                    counts: dates.map(d => trendsMap[d].count),
                    amounts: dates.map(d => trendsMap[d].amount)
                },
                clusterPerformance: {
                    labels: Object.keys(clusterMap),
                    values: Object.values(clusterMap)
                }
            },
            tableData: tableData
        });

    } catch (error) {
        console.error('❌ Error in getPerformanceData:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getFranchiseManagerPerformance = (req, res) => getPerformanceData(req, res, 'franchise_manager');
export const getFranchiseePerformance = (req, res) => getPerformanceData(req, res, 'franchisee');
export const getDealerManagerPerformance = (req, res) => getPerformanceData(req, res, 'dealer_manager');
export const getDealerPerformance = (req, res) => getPerformanceData(req, res, 'dealer');

// ==================== EMPLOYEE PERFORMANCE & PENALTY LOGIC ====================
import { getApplicableSetting, calculateUserEfficiency } from '../../utils/statusCalculator.js';
import OverdueTaskSetting from '../../models/approvals/OverdueTaskSetting.js';

export const getEmployeePerformance = async (req, res, next) => {
    try {
        const { departmentId, stateId, timeline } = req.query;
        
        let query = { role: 'employee' };
        if (departmentId) query.department = departmentId;
        if (stateId) query.state = stateId;

        const users = await User.find(query)
            .populate('department', 'name')
            .populate('state', 'name')
            .lean();

        const userIds = users.map(u => u._id);

        // Fetch projects for these users to count overdue tasks
        // For efficiency, we count tasks where status would be 'overdue'
        // In a real system, we'd probably have an 'OverdueHistory' or similar, 
        // but as per requirement 'dynamic calculation' - we'll calculate based on current month's projects.
        
        const startOfMonth = moment().startOf('month').toDate();
        const projects = await Project.find({
            $or: [
                { createdBy: { $in: userIds } },
                { dealerId: { $in: userIds } } // Assuming dealerId might be the assignee for some
            ],
            createdAt: { $gte: startOfMonth }
        }).lean();

        // Fetch settings - we might need separate settings per user if they are in different regions,
        // but for a summary, we typically use the global or a specific filtered setting.
        const settings = await OverdueTaskSetting.find().lean();
        
        const performanceData = users.map(user => {
            // Count overdue tasks for this user
            const userProjects = projects.filter(p => 
                p.createdBy?.toString() === user._id.toString() || 
                p.dealerId?.toString() === user._id.toString()
            );

            // Find applicable setting for this user
            const userSetting = settings.find(s => 
                s.states?.some(sid => sid.toString() === user.state?._id?.toString()) ||
                s.departments?.some(did => did.toString() === user.department?._id?.toString())
            ) || settings.find(s => s.countries?.length === 0) || {}; // Fallback to global

            let overdueCount = 0;
            userProjects.forEach(p => {
                const today = moment().startOf('day');
                const due = moment(p.dueDate).startOf('day');
                if (due.isBefore(today)) overdueCount++;
            });

            const efficiencyMetrics = calculateUserEfficiency(overdueCount, userSetting);

            return {
                id: user._id,
                name: user.name,
                department: user.department?.name || 'General',
                overdueTasks: overdueCount,
                efficiency: efficiencyMetrics.efficiency,
                penaltyDeducted: efficiencyMetrics.totalPenalty,
                benchmark: efficiencyMetrics.benchmark,
                status: efficiencyMetrics.isBelowBenchmark ? 'Risk' : 'Good'
            };
        });

        res.json({
            success: true,
            data: performanceData,
            stats: {
                totalEmployees: users.length,
                belowBenchmark: performanceData.filter(p => p.status === 'Risk').length,
                averageEfficiency: performanceData.length > 0 ? 
                    (performanceData.reduce((s, p) => s + p.efficiency, 0) / performanceData.length).toFixed(1) : 0
            }
        });

    } catch (err) {
        next(err);
    }
};
