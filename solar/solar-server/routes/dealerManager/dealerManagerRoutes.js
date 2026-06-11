import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
    getDashboardStats,
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    scheduleFollowUp,
    getFollowUps,
    convertLead,
    getCompanyLeadsSummary,
    getAppDemoLeads,
    scheduleAppDemo,
    getDealerKYCLists,
    updateDealerKYC,
    getOnboardingGoals,
    getMyDealers,
    getDealerCustomers,
    getReportStats
} from '../../controllers/dealerManager/dealerManagerController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('dealerManager')); // only dealer managers

router.get('/dashboard', getDashboardStats);

// Lead Routes
router.get('/leads/company-summary', getCompanyLeadsSummary);
router.get('/leads', getLeads);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);
router.post('/leads/:id/convert', convertLead);

// Follow-up Routes
router.get('/follow-ups', getFollowUps);
router.post('/follow-ups', scheduleFollowUp);

// App Demo Routes
router.get('/app-demos', getAppDemoLeads);
router.post('/app-demos', scheduleAppDemo);

// Dealer KYC Routes
router.get('/dealer-kyc', getDealerKYCLists);
router.put('/dealer-kyc/:dealerId', updateDealerKYC);

// Onboarding Goals Route
router.get('/onboarding-goals', getOnboardingGoals);

// Service Ticket Routes
router.get('/my-dealers', getMyDealers);
router.get('/my-dealers/:dealerId/customers', getDealerCustomers);

// Report Route
router.get('/report-stats', getReportStats);

export default router;
