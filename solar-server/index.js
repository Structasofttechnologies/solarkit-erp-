import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth/auth.js';
import userRoutes from './routes/users/users.js';
import productRoutes from './routes/inventory/products.js';
import orderRoutes from './routes/orders/orders.js';
import deliveryRoutes from './routes/orders/deliveries.js';
import installationRoutes from './routes/projects/installations.js';
import dashboardRoutes from './routes/dashboard/dashboard.js';
import adminConfigRoutes from './routes/admin/adminConfig.js';
import locationRoutes from './routes/core/locations.js';
import masterRoutes from './routes/core/masters.js';
import hrRoutes from './routes/hr/hrRoutes.js';
import vendorRoutes from './routes/vendors/vendorRoutes.js';
import salesSettingsRoutes from './routes/settings/salesSettingsRoutes.js';
import procurementRoutes from './routes/orders/procurementRoutes.js';
import campaignRoutes from './routes/marketing/campaignRoutes.js';
import departmentModuleRoutes from './routes/hr/departmentModuleRoutes.js';
import deliverySettingsRoutes from './routes/settings/deliverySettingsRoutes.js';
import installerRoutes from './routes/vendors/installerRoutes.js';
import inventoryRoutes from './routes/inventory/inventoryRoutes.js';
import brandRoutes from './routes/inventory/brandRoutes.js';
import combokitRoutes from './routes/inventory/combokitRoutes.js';
import franchiseeRoutes from './routes/franchisee/franchiseeRoutes.js';
import dealerSettingsRoutes from './routes/dealer/dealerSettingsRoutes.js';
import partnerSettingsRoutes from './routes/partner/partnerSettingsRoutes.js';
import hrmsSettingsRoutes from './routes/settings/hrmsSettingsRoutes.js';
import projectSettingsRoutes from './routes/settings/projectSettingsRoutes.js';
import quoteSettingsRoutes from './routes/settings/quoteSettingsRoutes.js';
import approvalOverdueRoutes from './routes/approvals/approvalOverdueRoutes.js';
import overdueTaskRoutes from './routes/approvals/overdueTaskRoutes.js';
import overdueStatusRoutes from './routes/approvals/overdueStatusRoutes.js';
import franchiseeManagerSettingRoutes from './routes/franchiseeManager/franchiseeManagerSettingRoutes.js';
import buyLeadSettingRoutes from './routes/settings/buyLeadSettingRoutes.js';
import checklistRoutes from './routes/settings/checklistRoutes.js';
import loanRoutes from './routes/finance/loanRoutes.js';
import loanProviderRoutes from './routes/finance/loanProviderRoutes.js';
import performanceRoutes from './routes/performance/performanceRoutes.js';
import loanApplicationRoutes from './routes/finance/loanApplicationRoutes.js';
import statisticsRoutes from './routes/performance/statisticsRoutes.js';
import organizationRoutes from './routes/hr/organizationRoutes.js';
import approvalsRoutes from './routes/approvals/approvalsRoutes.js';
import projectRoutes from './routes/projects/projectRoutes.js';
import leadRoutes from './routes/marketing/leadRoutes.js';
import surveyRoutes from './routes/marketing/surveyRoutes.js';
import commissionRoutes from './routes/dealer/commissionRoutes.js';
import ticketRoutes from './routes/tickets/ticketRoutes.js';
import solarKitRoutes from './routes/projects/solarKitRoutes.js';
import dealerManagerRoutes from './routes/dealerManager/dealerManagerRoutes.js';
import disputeRoutes from './routes/tickets/disputeRoutes.js';
import orderProcurementSettingRoutes from './routes/settings/orderProcurementSettingRoutes.js';
import candidatePortalRoutes from './routes/hr/candidatePortalRoutes.js';
import employeeTrainingRoutes from './routes/hr/employeeTrainingRoutes.js';
import leaveApprovalRoutes from './routes/hr/leaveApprovalRoutes.js';
import rbacRoutes from './routes/admin/rbacRoutes.js';
// import companyUserAuthRoutes from './routes/mobile/companyUserAuthRoutes.js';
// import addCompanyUserRoutes from './routes/mobile/addCompanyUserRoutes.js';
import mobileMetadataRoutes from './routes/mobile/mobileMetadataRoutes.js';
import companyUserRoutes from './routes/mobile/companyUserRoutes.js';
import { getSupplierTypes } from './controllers/vendors/vendorController.js';
import { getAllModules } from './controllers/hr/hrController.js';

dotenv.config();

const app = express();

// connectDB(); // Removed top-level call for serverless compatibility

// Configure CORS
const allowedOrigins = [];

// Production Frontend URL (from Env)
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Local Development URL (from Env)
if (process.env.DEV_FRONTEND_URL) {
  allowedOrigins.push(process.env.DEV_FRONTEND_URL);
}

// Additional Allowed Origins (Comma separated)
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(origin => {
    allowedOrigins.push(origin.trim());
  });
}

// Fallback for local development if env vars are missing (optional security net)
if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
  console.log('No CORS origins configured in Env, defaulting to common local ports.');
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://localhost:3000');
}

// Keep production Netlify URL explicitly allowed as a safety fallback.
allowedOrigins.push('https://solarkits.netlify.app');

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    return (
      protocol === 'https:' &&
      (hostname === 'solarkits.netlify.app' ||
        hostname.endsWith('--solarkits.netlify.app'))
    );
  } catch {
    return false;
  }
};

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/installations', installationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin-config', adminConfigRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/sales-settings', salesSettingsRoutes);
app.use('/api/procurement-orders', procurementRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/department-modules', departmentModuleRoutes);
app.use('/api/delivery-settings', deliverySettingsRoutes);
app.use('/api/installer', installerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/combokit', combokitRoutes);
app.use('/api/franchisee', franchiseeRoutes);
app.use('/api/dealer-settings', dealerSettingsRoutes);
app.use('/api/partner-settings', partnerSettingsRoutes);
app.use('/api/hrms-settings', hrmsSettingsRoutes);
app.use('/api/project-settings', projectSettingsRoutes);
app.use('/api/quote-settings', quoteSettingsRoutes);
app.use('/api/approval-overdue', approvalOverdueRoutes);
app.use('/api/overdue-task-settings', overdueTaskRoutes);
app.use('/api/overdue-status-settings', overdueStatusRoutes);
app.use('/api/franchisee-manager-settings', franchiseeManagerSettingRoutes);
app.use('/api/buy-lead-settings', buyLeadSettingRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/loan-providers', loanProviderRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/loan-applications', loanApplicationRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/dealer/commission', commissionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/solar-kits', solarKitRoutes);
app.use('/api/dealer-manager', dealerManagerRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/settings/order-procurement', orderProcurementSettingRoutes);
app.use('/api/candidate-portal', candidatePortalRoutes);
app.use('/api/employee/training', employeeTrainingRoutes);
app.use('/api/leave-approvals', leaveApprovalRoutes);
app.use('/api/rbac', rbacRoutes);

// Mobile App Routes
// app.use('/api/company-user-auth', companyUserAuthRoutes);
// app.use('/api/company-users', addCompanyUserRoutes);
app.use('/api/mobile-metadata', mobileMetadataRoutes);
app.use('/api/company-users', companyUserRoutes);

// Root level aliases for specific master data as per requirement
app.get('/api/supplier-types', getSupplierTypes);
app.get('/api/modules', getAllModules);

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({
    message: 'Welcome to Solar ERP API',
    status: 'Running',
    database: dbStatus
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => {
      // If it's a cast error inside validation, make it friendly
      if (val.name === 'CastError') {
        return `Please select a valid ${val.path || 'option'}`;
      }
      return val.message;
    });
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Handle Mongoose Cast Error (e.g., invalid ObjectID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid selection for ${err.path}. Please fill in this field correctly.`
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Choose a different name.`,
      error: err.message
    });
  }

  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
const isServerlessRuntime = Boolean(process.env.VERCEL);

if (!isServerlessRuntime) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

export default app;
