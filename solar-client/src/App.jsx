'use client';

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api/api';
import authStore from './store/authStore';
import Login from './pages/Login';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminInventoryDashboard from './admin/pages/dashboard/InventoryDashboard';
import AdminDeliveryDashboard from './admin/pages/dashboard/DeliveryDashboard';
import AdminInstallerDashboard from './admin/pages/dashboard/InstallerDashboard';
import FranchiseManagerDashboard from './admin/pages/dashboard/userPerformance/FranchiseManagerDashboard';
import FranchisePerformanceDashboard from './admin/pages/dashboard/userPerformance/FranchiseDashboard';
import DealerManagerPerformanceDashboard from './admin/pages/dashboard/userPerformance/DealerManagerDashboard';
import DealerPerformanceDashboard from './admin/pages/dashboard/userPerformance/DealerDashboard';
import AdminOrdersDashboard from './admin/pages/dashboard/OrdersDashboard';
import AdminOrdersByLoanDashboard from './admin/pages/dashboard/OrdersByLoanDashboard';
import AdminVendorsDashboard from './admin/pages/dashboard/VendorsDashboard';
import AdminProjectReport from './admin/pages/dashboard/ProjectReport';
import AdminDepartments from './admin/pages/departments/Departments';
import AdminOrganizationChart from './admin/pages/departments/OrganizationChart';
import AdminApprovals from './admin/pages/approvals/Approvals';
import ManagementProjects from './admin/pages/project-management/management/Management';
import InstallProjects from './admin/pages/project-management/install/Install';
import ServiceProjects from './admin/pages/project-management/service/Service';
import TrackServiceProjects from './admin/pages/project-management/track-service/TrackService';
import AdminResidentialProject from './admin/pages/project-management/residential/AdminResidentialProject';
import AdminCommercialProject from './admin/pages/project-management/commercial/AdminCommercialProject';
import AdminWarehouse from './admin/pages/operations/Warehouse';
import AdminAddInventory from './admin/pages/operations/AddInventory';
import AdminInventoryManagement from './admin/pages/operations/InventoryManagement';
// Location Settings
import SetupLocations from './admin/pages/settings/location/SetupLocations';

// New Main Settings Sections (direct files)
import ApprovalOverdueSetting from './admin/pages/settings/ApprovalOverdueSetting';
import OverdueTaskSetting from './admin/pages/settings/OverdueTaskSetting';
import OverdueStatusSetting from './admin/pages/settings/OverdueStatusSetting';
import LoanSetting from './admin/pages/settings/LoanSetting';
import ChecklistSetting from './admin/pages/settings/ChecklistSetting';

// HR Settings
import RoleSettings from './admin/pages/settings/hr/RoleSettings';
import CreateDepartment from './admin/pages/settings/hr/CreateDepartment';
import ManageEmployees from './admin/pages/settings/hr/ManageEmployees';
import ManageModules from './admin/pages/settings/hr/ManageModules';
import DepartmentWiseModules from './admin/pages/settings/hr/DepartmentWiseModules';
import TemporaryInchargeSetting from './admin/pages/settings/hr/TemporaryInchargeSetting';
import LeaveApprovals from './admin/pages/settings/hr/LeaveApprovals';
import ResignApprovals from './admin/pages/settings/hr/ResignApprovals';
import PanelsLevelWise from './admin/pages/settings/hr/PanelsLevelWise';

// Vendor Settings
import InstallerVendors from './admin/pages/settings/vendor/InstallerVendors';
import SupplierType from './admin/pages/settings/vendor/SupplierType';
import SupplierVendors from './admin/pages/settings/vendor/SupplierVendors';

// Sales Settings
import SetPrice from './admin/pages/settings/sales/SetPrice';
import SetPriceAmc from './admin/pages/settings/sales/SetPriceAmc';
import Offers from './admin/pages/settings/sales/Offers';
import SolarPanelBundleSetting from './admin/pages/settings/sales/SolarPanelBundleSetting';

// Marketing Settings
import CampaignManagement from './admin/pages/settings/marketing/CampaignManagement';

// Delivery Settings
import DeliveryType from './admin/pages/settings/delivery/DeliveryType';
import VehicleSelection from './admin/pages/settings/delivery/VehicleSelection';
import VendorDeliveryPlan from './admin/pages/settings/delivery/VendorDeliveryPlan';



// Installer Settings
import SolarInstaller from './admin/pages/settings/installer/SolarInstaller';
import ToolRequirements from './admin/pages/settings/installer/ToolRequirements';
import RatingSetting from './admin/pages/settings/installer/RatingSetting';
import Agency from './admin/pages/settings/installer/Agency';
import AgencyPlan from './admin/pages/settings/installer/AgencyPlan';


// Inventory Settings
import InventoryOverview from './admin/pages/settings/inventory/InventoryOverview';
import RestockOrderLimit from './admin/pages/settings/inventory/RestockOrderLimit';
import CombokitBrandOverview from './admin/pages/settings/inventory/CombokitBrandOverview';

// Product Settings
import AddProjectType from './admin/pages/settings/product/AddProjectType';
import AddProjectCategory from './admin/pages/settings/product/AddProjectCategory';
import AddProduct from './admin/pages/settings/product/AddProduct';
import Sku from './admin/pages/settings/product/Sku';
import PriceMaster from './admin/pages/settings/product/PriceMaster';
import AddUnitManagement from './admin/pages/settings/product/AddUnitManagement';

// Brand Settings
import AddBrandManufacturer from './admin/pages/operations/brand/AddBrandManufacturer';
import SupplierOverview from './admin/pages/operations/brand/SupplierOverview';

// ComboKit Settings
import CreateSolarkit from './admin/pages/settings/combokit/CreateSolarkit';
import CreateAmc from './admin/pages/settings/combokit/CreateAmc';
import AmcServices from './admin/pages/settings/combokit/AmcServices';
import BundlePlans from './admin/pages/settings/combokit/BundlePlans';
import AddComboKit from './admin/pages/settings/combokit/AddComboKit';
import Customize from './admin/pages/settings/combokit/Customize';

// ComboKit Overview Settings (direct file)
import CombokitOverview from './admin/pages/settings/combokit-overview/CombokitOverview';

// Order Procurement Settings (direct file)
import OrderProcurement from './admin/pages/settings/order-procurement/OrderProcurement';



// Partner Settings (Unified)
import AddPartner from './admin/pages/settings/partner/AddPartner';
import PartnerPlans from './admin/pages/settings/partner/Plans';
import PartnerPointsRewards from './admin/pages/settings/partner/PointsRewards';
import PartnerOnboardingGoals from './admin/pages/settings/partner/OnboardingGoals';
import PartnerProfessionType from './admin/pages/settings/partner/ProfessionType';
import FranchiseeManagerSetting from './admin/pages/settings/partner/FranchiseeManagerSetting';
import FranchiseBuyLeadSetting from './admin/pages/settings/partner/FranchiseBuyLeadSetting';

// HRMS Settings
import HrmsSettings from './admin/pages/settings/hrms/Settings';
import CandidateList from './admin/pages/settings/hrms/CandidateList';
import CandidateTestSetting from './admin/pages/settings/hrms/CandidateTestSetting';
import CandidateTrainingSetting from './admin/pages/settings/hrms/CandidateTrainingSetting';
import VacancySetting from './admin/pages/settings/hrms/VacancySetting';

// Project Settings
import JourneyStageSetting from './admin/pages/settings/project/JourneyStageSetting';
import ProjectOverdueSetting from './admin/pages/settings/project/OverdueSetting';
import ConfigurationSetting from './admin/pages/settings/project/ConfigurationSetting';
import DocumentationSetting from './admin/pages/settings/project/DocumentationSetting';
import PlaceholderNameSetting from './admin/pages/settings/project/PlaceholderNameSetting';

// Quote Settings
import QuoteSetting from './admin/pages/settings/quote/QuoteSetting';
import SurveyBomSetting from './admin/pages/settings/quote/SurveyBomSetting';
import TerraceSetting from './admin/pages/settings/quote/TerraceSetting';
import StructureSetting from './admin/pages/settings/quote/StructureSetting';
import BuildingSetting from './admin/pages/settings/quote/BuildingSetting';
import DiscomMaster from './admin/pages/settings/quote/DiscomMaster';
import AdminFinancialPLReport from './admin/pages/reports/FinancialPLReport';
import AdminCashflowReport from './admin/pages/reports/CashflowReport';
import AdminInventoryReport from './admin/pages/reports/InventoryReport';
import AdminLoansSummaryReport from './admin/pages/reports/LoansSummaryReport';
import AdminCaptableReport from './admin/pages/reports/CaptableReport';
import AdminRevenueByCPTypesReport from './admin/pages/reports/RevenueByCPTypesReport';
import AdminClusterReport from './admin/pages/reports/ClusterReport';
import AdminDistrictReport from './admin/pages/reports/DistrictReport';
import AdminCityReport from './admin/pages/reports/CityReport';
import DealerDashboard from './dealer/pages/dashboard/Dashboard';

import DealerLayout from './dealer/layouts/DealerLayout';

// Dealer Manager Imports
import DealerManagerLayout from './dealerManager/layouts/DealerManagerLayout';
import DealerManagerDashboard from './dealerManager/pages/dashboard/DealerManagerDashboard';
import DealerManagerLeads from './dealerManager/pages/leads/Leads';
import DealerManagerOnboardingCompanyLead from './dealerManager/pages/leads/DealerManagerOnboardingCompanyLead';
import DealerManagerMyLeads from './dealerManager/pages/leads/DealerManagerMyLeads';
import DealerManagerSubLeads from './dealerManager/pages/leads/SubLeads';
import DealerManagerAppDemo from './dealerManager/pages/myTask/AppDemo';
import DealerManagerDealerSignup from './dealerManager/pages/myTask/dealerOnboarding/DealerSignup';
import DealerManagerDealerOrientation from './dealerManager/pages/myTask/dealerOnboarding/DealerOrientation';
import DealerManagerOrientationVideo from './dealerManager/pages/myTask/dealerOnboarding/DealerManagerOrientationVideo';
import DealerManagerProjectInProgress from './dealerManager/pages/myTask/projectManagement/ProjectInProgress';
import DealerManagerCompletedProjects from './dealerManager/pages/myTask/projectManagement/CompletedProjects';
import DealerManagerDealerPerformance from './dealerManager/pages/myTask/DealerPerformance';
import DealerManagerDealerPerformanceList from './dealerManager/pages/myTask/DealerPerformanceList';
import DealerManagerOnboardingGoals from './dealerManager/pages/onboardingGoals/OnboardingGoals';
import DealerManagerServiceTicket from './dealerManager/pages/tickets/Service';
import DealerManagerDisputeTicket from './dealerManager/pages/tickets/Dispute';
import DealerManagerReport from './dealerManager/pages/report/Report';

// Project Signup
import Lead from './dealer/pages/projectSignup/Lead';
import SurveyBOM from './dealer/pages/projectSignup/SurveyBOM';
import ProjectQuote from './dealer/pages/projectSignup/ProjectQuote';
import ProjectSignupPage from './dealer/pages/projectSignup/ProjectSignup';

// Project Management

import Manage from './dealer/pages/projectManagement/Manage';
import TrackPM from './dealer/pages/projectManagement/Track';
import DealerResidentialProject from './dealer/pages/projectManagement/DealerResidentialProject';
import DealerCommercialProject from './dealer/pages/projectManagement/DealerCommercialProject';

// Track

import ProjectProgress from './dealer/pages/track/ProjectProgress';
import MyCommission from './dealer/pages/track/MyCommission';

// Tickets

import RaiseTicket from './dealer/pages/tickets/RaiseTicket';
import TicketStatus from './dealer/pages/tickets/TicketStatus';

import SolarKit from './dealer/pages/solarKit/SolarKit';
import Loan from './dealer/pages/loan/Loan';
import Reports from './dealer/pages/reports/Reports';

// Franchisee Imports
import FranchiseeLayout from './franchisee/layouts/FranchiseeLayout';
import FranchiseDashboard from './franchisee/pages/dashboard/FranchiseDashboard';
import DistrictManager from './franchisee/pages/DistrictManager/DistrictManager';
import LeadAssignDashboard from './franchisee/pages/dashboard/LeadAssignDashboard';
import SurveyBom from './franchisee/pages/SurveyBom/SurveyBom';
import DealerManager from './franchisee/pages/DealerManager/DealerManager';
import CreateLeadPartner from './franchisee/pages/LeadPartner/CreateLeadPartner';
import LeadManagement from './franchisee/pages/LeadPartner/LeadManagement';
import MyTeam from './franchisee/pages/MyTeam/MyTeam';
import TrackPayments from './franchisee/pages/Account/TrackPayments';
import Solarkits from './franchisee/pages/Solarkits/Solarkits';
import BulkOrder from './franchisee/pages/Solarkits/BulkOrder';
import Settings from './franchisee/pages/Settings/Settings';
import FranchiseeLead from './franchisee/pages/projectSignup/Lead';
import FranchiseeCreateQuotation from './franchisee/pages/projectSignup/CreateQuotation';
import FranchiseeProjectSignup from './franchisee/pages/projectSignup/ProjectSignup';
import FranchiseeLoan from './franchisee/pages/projectSignup/Loan';
import FranchiseeManagement from './franchisee/pages/projectManagement/Management';
import FranchiseeInstall from './franchisee/pages/projectManagement/Install';
import FranchiseeService from './franchisee/pages/projectManagement/Service';
import FranchiseeTrackService from './franchisee/pages/projectManagement/TrackService';

// Franchisee Manager Imports
import FranchiseeManagerLayout from './franchiseeManager/layouts/FranchiseeManagerLayout';
import FranchiseeManagerDashboard from './franchiseeManager/pages/dashboard/FranchiseeManagerDashboard';
import FranchiseeManagerLeads from './franchiseeManager/pages/leads/Leads';
import FranchiseeManagerLeadManagement from './franchiseeManager/pages/leadManagement/LeadManagement';
import FranchiseeManagerOnboardingGoals from './franchiseeManager/pages/onboardingGoals/OnboardingGoals';
import FranchiseeManagerFindResources from './franchiseeManager/pages/resources/FindResources';
import FranchiseeManagerReport from './franchiseeManager/pages/report/Report';

// My Task
import FMAppDemo from './franchiseeManager/pages/myTask/AppDemo';
import FMFranchiseeSignup from './franchiseeManager/pages/myTask/franchiseeOnboarding/FranchiseeSignup';
import FMFranchiseeOrientation from './franchiseeManager/pages/myTask/franchiseeOnboarding/FranchiseeOrientation';
import FMProjectInProgress from './franchiseeManager/pages/myTask/projectManagement/ProjectInProgress';
import FMFranchiseePerformance from './franchiseeManager/pages/myTask/FranchiseePerformance';

// Franchise Setting
import FMComboKitCustomization from './franchiseeManager/pages/franchiseSetting/ComboKitCustomization';
import FMOffers from './franchiseeManager/pages/franchiseSetting/Offers';
import FMTrackCashback from './franchiseeManager/pages/franchiseSetting/TrackCashback';

// Dealer Management
import FMAssignToFranchisee from './franchiseeManager/pages/dealerManagement/AssignToFranchisee';
import FMTrackDealer from './franchiseeManager/pages/dealerManagement/TrackDealer';
import FMReassignToCompany from './franchiseeManager/pages/dealerManagement/ReassignToCompany';

// Tickets
import FMServiceTicket from './franchiseeManager/pages/tickets/Service';
import FMDisputeTicket from './franchiseeManager/pages/tickets/Dispute';

// Candidate Portal Imports
import CandidateLayout from './candidate/layouts/CandidateLayout';
import CandidateLogin from './candidate/pages/Login';
import CandidateDashboard from './candidate/pages/Dashboard';
import CandidateTest from './candidate/pages/Test';
import CandidateCompleteApplication from './candidate/pages/CompleteApplication';

// Employee Imports
import OnboardingTraining from './employee/pages/OnboardingTraining';
import EmployeeLogin from './employee/pages/EmployeeLogin';

// Components
import GlobalLoader from './components/GlobalLoader';

// Account Manager Imports
import AccountManagerLayout from './accountManager/layouts/AccountManagerLayout';
import AccountManagerDashboard from './accountManager/pages/Dashboard';
import SolarPanelBundlePlan from './accountManager/pages/SolarPanelBundlePlan';
import ProcurementPlan from './accountManager/pages/ProcurementPlan';
import Report from './accountManager/pages/Report';
import OrderJourney from './accountManager/pages/my-task/OrderJourney';
import CreateOrder from './accountManager/pages/my-task/order-journey/CreateOrder';
import LoanOrders from './accountManager/pages/my-task/order-journey/LoanOrders';
import DeliveryPlan from './accountManager/pages/my-task/order-journey/DeliveryPlan';
import VendorPay from './accountManager/pages/my-task/order-journey/VendorPay';
import ChannelPartnerPay from './accountManager/pages/my-task/order-journey/ChannelPartnerPay';
import DriverPay from './accountManager/pages/my-task/order-journey/DriverPay';
import AtWarehouse from './accountManager/pages/my-task/order-journey/AtWarehouse';
import DeliveryManagement from './accountManager/pages/my-task/order-journey/DeliveryManagement';
import ReplacementOrder from './accountManager/pages/my-task/ReplacementOrder';
import ReturnProducts from './accountManager/pages/my-task/ReturnProducts';
import ReplaceProducts from './accountManager/pages/my-task/ReplaceProducts';
import WarehouseVendorPay from './accountManager/pages/my-task/WarehouseVendorPay';
import VendorContractPay from './accountManager/pages/my-task/VendorContractPay';
import TrackCPPayments from './accountManager/pages/my-task/TrackCPPayments';
import Service from './accountManager/pages/my-task/Service';

// Delivery Manager Imports
import DeliveryManagerLayout from './deliveryManager/layouts/DeliveryManagerLayout';
import DeliveryManagerDashboard from './deliveryManager/pages/Dashboard';
import InwardManagement from './deliveryManager/pages/my-task/InwardManagement';
import DMAtWarehouse from './deliveryManager/pages/my-task/AtWarehouse';
import DMDeliveryManagement from './deliveryManager/pages/DeliveryManagement';
import DMReturnProduct from './deliveryManager/pages/replacement-order/ReturnProduct';
import DMReplaceProduct from './deliveryManager/pages/replacement-order/ReplaceProduct';
import DMServiceTicket from './deliveryManager/pages/replacement-order/ServiceTicket';
import DMReport from './deliveryManager/pages/Report';

function ProtectedRoute({ children, requiredRole }) {
  const user = authStore((state) => state.user);
  const token = authStore((state) => state.token);

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  const setUser = authStore((state) => state.setUser);
  const user = authStore((state) => state.user);
  const token = authStore((state) => state.token);

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // If we have a token but no user, try to fetch the user
      if (token && !user) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user:', error);
          // If fetch fails (e.g. token expired), we might want to clear token
          // localStorage.removeItem('token'); // Optional: decided by auth logic
        }
      }
      // Finished initialization attempt
      setIsInitializing(false);
    };

    initAuth();
  }, [token, user, setUser]);

  if (isInitializing) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Redirect based on role
  if (user && token) {
    const redirectPath = () => {
      switch (user.role) {
        case 'admin':
          return '/admin/dashboard';
        case 'dealer':
          return '/dealer/dashboard';
        case 'franchisee':
          return '/franchisee/dashboard';
        case 'dealerManager':
          return '/dealer-manager/dashboard';
        case 'franchiseeManager':
          return '/franchisee-manager/dashboard';
        case 'accountManager':
          return '/account-manager/dashboard';
        case 'deliveryManager':
          return '/delivery-manager/dashboard';
        default:
          return '/login';
      }
    };

    const sharedAdminRoutes = (
      <>
              <Route path="departments" element={<AdminDepartments />} />
              <Route
                path="departments/organization-chart"
                element={<AdminOrganizationChart />}
              />
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="project-management/:entityType/management" element={<ManagementProjects />} />
              <Route path="project-management/:entityType/install" element={<InstallProjects />} />
              <Route path="project-management/:entityType/service" element={<ServiceProjects />} />
              <Route path="project-management/:entityType/track-service" element={<TrackServiceProjects />} />
              <Route path="residential-project" element={<AdminResidentialProject />} />
              <Route path="commercial-project" element={<AdminCommercialProject />} />
              <Route path="project-management" element={<Navigate to="company/management" />} />
              <Route path="operations/warehouse" element={<AdminWarehouse />} />
              <Route path="operations/add-inventory" element={<AdminAddInventory />} />
              <Route
                path="operations/inventory-management"
                element={<AdminInventoryManagement />}
              />
              {/* Settings section */}
              {/* Location Settings */}
              <Route path="settings/location/setup-locations" element={<SetupLocations />} />

              {/* HR Settings */}
              <Route path="settings/hr/role-settings" element={<RoleSettings />} />
              <Route path="settings/hr/create-department" element={<CreateDepartment />} />
              <Route path="settings/hr/manage-employees" element={<ManageEmployees />} />
              <Route path="settings/hr/manage-modules" element={<ManageModules />} />
              <Route path="settings/hr/department-wise-modules" element={<DepartmentWiseModules />} />
              <Route path="settings/hr/temporary-incharge-setting" element={<TemporaryInchargeSetting />} />
              <Route path="settings/hr/leave-approvals" element={<LeaveApprovals />} />
              <Route path="settings/hr/resign-approvals" element={<ResignApprovals />} />
              <Route path="settings/hr/panels-level-wise" element={<PanelsLevelWise />} />

              {/* Vendor Settings */}
              <Route path="settings/vendor/installer-vendors" element={<InstallerVendors />} />
              <Route path="settings/vendor/supplier-type" element={<SupplierType />} />
              <Route path="settings/vendor/supplier-vendors" element={<SupplierVendors />} />

              {/* Sales Settings */}
              <Route path="settings/sales/set-price" element={<SetPrice />} />
              <Route path="settings/sales/set-price-amc" element={<SetPriceAmc />} />
              <Route path="settings/sales/offers" element={<Offers />} />
              <Route path="settings/sales/solar-panel-bundle-setting" element={<SolarPanelBundleSetting />} />

              {/* Marketing Settings */}
              <Route path="settings/marketing/campaign-management" element={<CampaignManagement />} />

              {/* Delivery Settings */}
              <Route path="settings/delivery/delivery-type" element={<DeliveryType />} />
              <Route path="settings/delivery/delivery_type" element={<DeliveryType />} />
              <Route path="settings/delivery/vehicle-selection" element={<VehicleSelection />} />
              <Route path="settings/delivery/vehicle_selection" element={<VehicleSelection />} />
              <Route path="settings/delivery/vendor-delivery-plan" element={<VendorDeliveryPlan />} />
              <Route path="settings/delivery/vendor_delivery_plan" element={<VendorDeliveryPlan />} />

              {/* Installer Settings */}
              <Route path="settings/installer/solar-installer" element={<SolarInstaller />} />
              <Route path="settings/installer/tool-requirements" element={<ToolRequirements />} />
              <Route path="settings/installer/rating-setting" element={<RatingSetting />} />
              <Route path="settings/installer/agency" element={<Agency />} />
              <Route path="settings/installer/agency-plans" element={<AgencyPlan />} />

              {/* Inventory Settings */}
              <Route path="settings/inventory/inventory-overview" element={<InventoryOverview />} />
              <Route path="settings/inventory/restock-order-limit" element={<RestockOrderLimit />} />
              <Route path="settings/inventory/combokit-brand-overview" element={<CombokitBrandOverview />} />

              {/* Product Settings */}
              <Route path="settings/product/add-project-type" element={<AddProjectType />} />
              <Route path="settings/product/add-project-category" element={<AddProjectCategory />} />
              <Route path="settings/product/add-product" element={<AddProduct />} />
              <Route path="settings/product/sku" element={<Sku />} />
              <Route path="settings/product/price-master" element={<PriceMaster />} />
              <Route path="settings/product/add-unit-management" element={<AddUnitManagement />} />

              {/* Brand Settings */}
              <Route path="operations/brand/add-brand-manufacturer" element={<AddBrandManufacturer />} />
              <Route path="operations/brand/supplier-overview" element={<SupplierOverview />} />

              {/* ComboKit Settings */}
              <Route path="settings/combokit/create-solarkit" element={<CreateSolarkit />} />
              <Route path="settings/combokit/create-amc" element={<CreateAmc />} />
              <Route path="settings/combokit/amc-services" element={<AmcServices />} />
              <Route path="settings/combokit/bundle-plans" element={<BundlePlans />} />
              <Route path="settings/combokit/add-combokit" element={<AddComboKit />} />
              <Route path="settings/combokit/customize" element={<Customize />} />

              {/* ComboKit Overview Settings */}
              <Route path="settings/combokit-overview" element={<CombokitOverview />} />

              {/* Order Procurement Settings */}
              <Route path="settings/order-procurement" element={<OrderProcurement />} />

              {/* Partner Settings (Unified) */}
              <Route path="settings/partner/add-partner" element={<AddPartner />} />
              <Route path="settings/partner/plans" element={<PartnerPlans />} />
              <Route path="settings/partner/points-rewards" element={<PartnerPointsRewards />} />
              <Route path="settings/partner/onboarding-goals" element={<PartnerOnboardingGoals />} />
              <Route path="settings/partner/profession-type" element={<PartnerProfessionType />} />

              {/* HRMS Settings */}
              <Route path="settings/hrms/settings" element={<HrmsSettings />} />
              <Route path="settings/hrms/candidates" element={<CandidateList />} />
              <Route path="settings/hrms/candidate-test-setting" element={<CandidateTestSetting />} />
              <Route path="settings/hrms/candidate-training-setting" element={<CandidateTrainingSetting />} />
              <Route path="settings/hrms/vacancy-module" element={<VacancySetting />} />

              {/* Project Settings */}
              <Route path="settings/project/journey-stage-setting" element={<JourneyStageSetting />} />
              <Route path="settings/project/overdue-setting" element={<ProjectOverdueSetting />} />
              <Route path="settings/project/configuration-setting" element={<ConfigurationSetting />} />
              <Route path="settings/project/documentation-setting" element={<DocumentationSetting />} />
              <Route path="settings/project/placeholder-name-setting" element={<PlaceholderNameSetting />} />

              {/* Quote Settings */}
              <Route path="settings/quote/quote-setting" element={<QuoteSetting />} />
              <Route path="settings/quote/survey-bom-setting" element={<SurveyBomSetting />} />
              <Route path="settings/quote/terrace-setting" element={<TerraceSetting />} />
              <Route path="settings/quote/structure-setting" element={<StructureSetting />} />
              <Route path="settings/quote/building-setting" element={<BuildingSetting />} />
              <Route path="settings/quote/discom-master" element={<DiscomMaster />} />

              {/* New Main Settings Sections (at the bottom) */}
              <Route path="settings/approval-overdue" element={<ApprovalOverdueSetting />} />
              <Route path="settings/overdue-task" element={<OverdueTaskSetting />} />
              <Route path="settings/overdue-status" element={<OverdueStatusSetting />} />
              <Route path="settings/partner-manager" element={<FranchiseeManagerSetting />} />
              <Route path="settings/partner-buy-lead" element={<FranchiseBuyLeadSetting />} />
              <Route path="settings/loan" element={<LoanSetting />} />
              <Route path="settings/checklist" element={<ChecklistSetting />} />
              <Route path="reports/financial-pl" element={<AdminFinancialPLReport />} />
              <Route path="reports/cashflow" element={<AdminCashflowReport />} />
              <Route path="reports/inventory" element={<AdminInventoryReport />} />
              <Route path="reports/loans-summary" element={<AdminLoansSummaryReport />} />
              <Route path="reports/captable" element={<AdminCaptableReport />} />
              <Route
                path="reports/revenue-by-cp-types"
                element={<AdminRevenueByCPTypesReport />}
              />
              <Route path="reports/cluster" element={<AdminClusterReport />} />
              <Route path="reports/district" element={<AdminDistrictReport />} />
              <Route path="reports/city" element={<AdminCityReport />} />
      </>
    );

    return (
      <>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Candidate Portal Routes */}
            <Route path="/candidate-login" element={<CandidateLogin />} />
            <Route
              path="/candidate-portal/*"
              element={
                <CandidateLayout />
              }
            >
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="test" element={<CandidateTest />} />
              <Route path="complete-application" element={<CandidateCompleteApplication />} />
              <Route path="" element={<Navigate to="test" />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard section */}
              <Route path="dashboard" element={<AdminInventoryDashboard />} />
              <Route path="dashboard/inventory" element={<AdminInventoryDashboard />} />
              <Route path="dashboard/delivery" element={<AdminDeliveryDashboard />} />
              <Route path="dashboard/installer" element={<AdminInstallerDashboard />} />
              <Route path="dashboard/orders" element={<AdminOrdersDashboard />} />
              <Route path="dashboard/orders-by-loan" element={<AdminOrdersByLoanDashboard />} />
              <Route path="dashboard/vendors" element={<AdminVendorsDashboard />} />
              <Route path="dashboard/project-report" element={<AdminProjectReport />} />

              {/* User Performance sub-dashboards */}
              <Route
                path="dashboard/user-performance/partner-manager"
                element={<FranchiseManagerDashboard />}
              />
              <Route
                path="dashboard/user-performance/partner"
                element={<FranchisePerformanceDashboard />}
              />
              <Route
                path="dashboard/user-performance/dealer-manager"
                element={<DealerManagerPerformanceDashboard />}
              />
              <Route
                path="dashboard/user-performance/dealer"
                element={<DealerPerformanceDashboard />}
              />

              {sharedAdminRoutes}
            </Route>

            {/* Dealer Routes */}
            <Route
              path="/dealer/*"
              element={
                <ProtectedRoute requiredRole="dealer">
                  <DealerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DealerDashboard />} />

              {/* Project Signup */}
              <Route path="project-signup/lead" element={<Lead />} />
              <Route path="project-signup/survey-bom" element={<SurveyBOM />} />
              <Route path="project-signup/project-quote" element={<ProjectQuote />} />
              <Route path="project-signup/project-signup" element={<ProjectSignupPage />} />
              <Route path="project-signup" element={<Navigate to="project-signup/lead" />} />

              {/* Project Management */}
              <Route path="project-management/manage" element={<Manage />} />
              <Route path="project-management/track" element={<TrackPM />} />
              <Route path="residential-project" element={<DealerResidentialProject />} />
              <Route path="commercial-project" element={<DealerCommercialProject />} />
              <Route path="project-management" element={<Navigate to="project-management/manage" />} />

              {/* Track */}
              <Route path="track/project-progress" element={<ProjectProgress />} />
              <Route path="track/my-commission" element={<MyCommission />} />
              <Route path="track" element={<Navigate to="track/project-progress" />} />

              {/* Tickets */}
              <Route path="tickets/raise-ticket" element={<RaiseTicket />} />
              <Route path="tickets/ticket-status" element={<TicketStatus />} />
              <Route path="tickets" element={<Navigate to="tickets/raise-ticket" />} />

              <Route path="solar-kit" element={<SolarKit />} />
              <Route path="loan" element={<Loan />} />
              <Route path="reports" element={<Reports />} />
              
              {sharedAdminRoutes}
            </Route>

            {/* Franchisee Routes */}
            <Route
              path="/franchisee/*"
              element={
                <ProtectedRoute requiredRole="franchisee">
                  <FranchiseeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<FranchiseDashboard />} />
              <Route path="dashboard/lead-assign" element={<LeadAssignDashboard />} />

              <Route path="survey-bom" element={<SurveyBom />} />
              <Route path="district-manager" element={<DistrictManager />} />
              <Route path="dealer-manager" element={<DealerManager />} />
              <Route path="lead-partner/create" element={<CreateLeadPartner />} />
              <Route path="lead-partner/management" element={<LeadManagement />} />

              <Route path="my-team" element={<MyTeam />} />

              <Route path="account/track-payments" element={<TrackPayments />} />

              <Route path="solarkits" element={<Solarkits />} />
              <Route path="solarkits/bulk-order" element={<BulkOrder />} />

              <Route path="settings" element={<Settings />} />

              <Route path="project-signup/lead" element={<FranchiseeLead />} />
              <Route path="project-signup/create-quotation" element={<FranchiseeCreateQuotation />} />
              <Route path="project-signup/project-signup" element={<FranchiseeProjectSignup />} />
              <Route path="project-signup/loan" element={<FranchiseeLoan />} />

              <Route path="project-management/management" element={<FranchiseeManagement />} />
              <Route path="project-management/install" element={<FranchiseeInstall />} />
              <Route path="project-management/service" element={<FranchiseeService />} />
              <Route path="project-management/track-service" element={<FranchiseeTrackService />} />
              
              {sharedAdminRoutes}
            </Route>

            {/* Dealer Manager Routes */}
            <Route
              path="/dealer-manager/*"
              element={
                <ProtectedRoute requiredRole="dealerManager">
                  <DealerManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DealerManagerDashboard />} />
              <Route path="leads" element={<DealerManagerLeads />} />
              <Route path="onboarding/company-lead" element={<DealerManagerOnboardingCompanyLead />} />
              <Route path="onboarding/my-lead" element={<DealerManagerMyLeads />} />
              <Route path="onboarding/sub-leads/:id" element={<DealerManagerSubLeads />} />

              <Route path="my-task/app-demo" element={<DealerManagerAppDemo />} />

              {/* Dealer Onboarding Sub-menu */}
              <Route path="my-task/dealer-onboarding/dealer-signup" element={<DealerManagerDealerSignup />} />
              <Route path="my-task/dealer-onboarding/dealer-orientation" element={<DealerManagerDealerOrientation />} />
              <Route path="orientation/video" element={<DealerManagerOrientationVideo />} />
              <Route path="my-task/dealer-onboarding" element={<Navigate to="dealer-signup" />} />

              {/* Project Management Sub-menu */}
              <Route path="my-task/project-management/project-in-progress" element={<DealerManagerProjectInProgress />} />
              <Route path="my-task/project-management/completed-projects" element={<DealerManagerCompletedProjects />} />
              <Route path="my-task/project-management" element={<Navigate to="project-in-progress" />} />

              <Route path="my-task/dealer-performance" element={<DealerManagerDealerPerformance />} />
              <Route path="my-task/dealer-performance/:type" element={<DealerManagerDealerPerformanceList />} />
              <Route path="my-task" element={<Navigate to="app-demo" />} />

              <Route path="onboarding-goals" element={<DealerManagerOnboardingGoals />} />

              {/* Tickets */}
              <Route path="tickets/service" element={<DealerManagerServiceTicket />} />
              <Route path="tickets/dispute" element={<DealerManagerDisputeTicket />} />
              <Route path="tickets" element={<Navigate to="service" />} />

              <Route path="report" element={<DealerManagerReport />} />
              <Route path="" element={<Navigate to="dashboard" />} />
              
              {sharedAdminRoutes}
            </Route>

            {/* Franchisee Manager Routes */}
            <Route
              path="/franchisee-manager/*"
              element={
                <ProtectedRoute requiredRole="franchiseeManager">
                  <FranchiseeManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<FranchiseeManagerDashboard />} />
              <Route path="leads" element={<FranchiseeManagerLeads />} />
              <Route path="lead-management" element={<FranchiseeManagerLeadManagement />} />

              <Route path="onboarding-goals" element={<FranchiseeManagerOnboardingGoals />} />

              {/* My Task Sub-menu */}
              <Route path="my-task/app-demo" element={<FMAppDemo />} />
              <Route path="my-task/franchisee-onboarding/franchisee-signup" element={<FMFranchiseeSignup />} />
              <Route path="my-task/franchisee-onboarding/franchisee-orientation" element={<FMFranchiseeOrientation />} />
              <Route path="my-task/franchisee-onboarding" element={<Navigate to="franchisee-signup" />} />
              <Route path="my-task/project-management/project-in-progress" element={<FMProjectInProgress />} />
              <Route path="my-task/project-management" element={<Navigate to="project-in-progress" />} />
              <Route path="my-task/franchisee-performance" element={<FMFranchiseePerformance />} />
              <Route path="my-task" element={<Navigate to="app-demo" />} />

              {/* Franchise Setting Sub-menu */}
              <Route path="franchisee-setting/combokit-customization" element={<FMComboKitCustomization />} />
              <Route path="franchisee-setting/offers" element={<FMOffers />} />
              <Route path="franchisee-setting/track-cashback" element={<FMTrackCashback />} />
              <Route path="franchisee-setting" element={<Navigate to="combokit-customization" />} />

              {/* Dealer Management Sub-menu */}
              <Route path="dealer-management/assign-to-franchisee" element={<FMAssignToFranchisee />} />
              <Route path="dealer-management/track-dealer" element={<FMTrackDealer />} />
              <Route path="dealer-management/reasign-to-company" element={<FMReassignToCompany />} />
              <Route path="dealer-management" element={<Navigate to="assign-to-franchisee" />} />

              {/* Tickets */}
              <Route path="tickets/service" element={<FMServiceTicket />} />
              <Route path="tickets/dispute" element={<FMDisputeTicket />} />
              <Route path="tickets" element={<Navigate to="service" />} />

              <Route path="find-resources" element={<FranchiseeManagerFindResources />} />
              <Route path="report" element={<FranchiseeManagerReport />} />

              <Route path="" element={<Navigate to="dashboard" />} />
              
              {sharedAdminRoutes}
            </Route>

            {/* Employee Routes */}
            <Route
              path="/employee/*"
              element={
                <ProtectedRoute requiredRole="employee">
                  {/* A simple wrapper or straight rendering if we had an EmployeeLayout. For now we just route inline. */}
                  <Routes>
                    <Route path="training" element={<OnboardingTraining />} />
                    {/* Add an employee dashboard catch-all later, for now just redirect to root or show a placeholder */}
                    <Route path="dashboard" element={<div className="p-8 text-center text-xl font-bold">Employee Dashboard Integration Pending...</div>} />
                    <Route path="" element={<Navigate to="training" />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Account Manager Routes */}
            <Route
              path="/account-manager/*"
              element={
                <ProtectedRoute requiredRole="accountManager">
                  <AccountManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AccountManagerDashboard />} />
              <Route path="solar-panel-bundle-plan" element={<SolarPanelBundlePlan />} />
              <Route path="procurement-plan" element={<ProcurementPlan />} />
              <Route path="report" element={<Report />} />
              
              {/* My Task Sub-Modules */}
              <Route path="my-task/order-journey" element={<OrderJourney />} />
              <Route path="my-task/order-journey/create-order" element={<CreateOrder />} />
              <Route path="my-task/order-journey/loan-orders" element={<LoanOrders />} />
              <Route path="my-task/order-journey/delivery-plan" element={<DeliveryPlan />} />
              <Route path="my-task/order-journey/vendor-pay" element={<VendorPay />} />
              <Route path="my-task/order-journey/channel-partner-pay" element={<ChannelPartnerPay />} />
              <Route path="my-task/order-journey/driver-pay" element={<DriverPay />} />
              <Route path="my-task/order-journey/at-warehouse" element={<AtWarehouse />} />
              <Route path="my-task/order-journey/delivery-management" element={<DeliveryManagement />} />
              <Route path="my-task/replacement-order/return-products" element={<ReturnProducts />} />
              <Route path="my-task/replacement-order/replace-products" element={<ReplaceProducts />} />
              <Route path="my-task/warehouse-vendor-pay" element={<WarehouseVendorPay />} />
              <Route path="my-task/vendor-contract-pay" element={<VendorContractPay />} />
              <Route path="my-task/track-cp-payments" element={<TrackCPPayments />} />
              <Route path="my-task/service" element={<Service />} />
              
              {sharedAdminRoutes}
              <Route path="" element={<Navigate to="dashboard" />} />
            </Route>

            {/* Delivery Manager Routes */}
            <Route
              path="/delivery-manager/*"
              element={
                <ProtectedRoute requiredRole="deliveryManager">
                  <DeliveryManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DeliveryManagerDashboard />} />
              <Route path="delivery-management" element={<DMDeliveryManagement />} />
              <Route path="my-task/inward-management" element={<InwardManagement />} />
              <Route path="my-task/at-warehouse" element={<DMAtWarehouse />} />
              <Route path="replacement-order/return-products" element={<DMReturnProduct />} />
              <Route path="replacement-order/replace-product" element={<DMReplaceProduct />} />
              <Route path="replacement-order/service-ticket" element={<DMServiceTicket />} />
              <Route path="report" element={<DMReport />} />
              
              {sharedAdminRoutes}
              <Route path="" element={<Navigate to="dashboard" />} />
            </Route>

            <Route path="/" element={<Navigate to={redirectPath()} />} />
            <Route path="/dashboard" element={<Navigate to={redirectPath()} />} />
          </Routes>
        </Router>
        <GlobalLoader />
      </>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/candidate-login" element={<CandidateLogin />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />

          <Route path="/candidate-portal/*" element={<CandidateLayout />}>
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="test" element={<CandidateTest />} />
            <Route path="complete-application" element={<CandidateCompleteApplication />} />
            <Route path="" element={<Navigate to="test" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
      <GlobalLoader />
    </>
  );
}

export default App;
