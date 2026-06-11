import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Eye, EyeOff, BarChart3, FileSpreadsheet, UserPlus,
  ListTodo, // Replaced Tasks with ListTodo
  Package, Settings, ArrowLeft, RefreshCw, List,
  Download, Calendar, Mail, Phone, MapPin,
  BadgeCheck, TrendingUp, Wrench, Users,
  Truck, Building, Zap, Battery, Home, Cable,
  Check, X,
  Box,
  HardHat,
  Store, Globe
} from 'lucide-react';
import { getApprovals, updateApprovalStatus } from "../../../services/approvals/approvalsApi";
import { useLocations } from '../../../hooks/useLocations';
import { fetchApprovalRules } from '../../../services/settings/settingsApi';

// Define table headers for each approval type
const tableHeaders = {
  recruitment: ['ID', 'Hiring Position', 'Position Name', 'Candidate Name', 'Mobile', 'Email', 'Salary Budget', 'Age Criteria', 'Gender', 'Education', 'Experience', 'Requested By', 'Date', 'Action'],
  driver: ['ID', 'Driver Name', 'License No', 'Mobile', 'Vehicle Type', 'Experience', 'Address', 'Requested By', 'Date', 'Action'],
  dealer: ['ID', 'Dealer Name', 'Business Name', 'Mobile', 'Email', 'Address', 'GST No', 'Requested By', 'Date', 'Action'],
  installer: ['ID', 'Installer Name', 'Business Name', 'Mobile', 'Email', 'Address', 'Certification', 'Experience', 'Requested By', 'Date', 'Action'],
  franchisee: ['ID', 'Franchisee Name', 'Business Name', 'Mobile', 'Email', 'Address', 'Investment', 'Requested By', 'Date', 'Action'],
  combokit: ['ID', 'ComboKit Name', 'Solar Panel Brand', 'SKU', 'Inverter', 'Inverter SKU', 'BOS Kit Brand', 'BOS Kit SKU', 'CP Type', 'District', 'Date', 'Action'],
  inventory: ['ID', 'Product Type', 'Product Name', 'Brand', 'SKU', 'Model No.', 'Quantity', 'Requested By', 'Date', 'Action'],
  ticket: ['ID', 'Issue Type', 'Ticket Name', 'Priority', 'Customer Name', 'Customer Phone', 'Assigned To', 'Est. Resolution', 'Modules', 'Timeline', 'Requested By', 'Date', 'Action'],
  standard: ['ID', 'ComboKit Name', 'Solar Panel Brand', 'SKU', 'Inverter', 'Inverter SKU', 'BOS Kit Brand', 'BOS Kit SKU', 'CP Type', 'District', 'Date', 'Action'],
  customize: ['ID', 'Kit Name', 'Solar Panel', 'Inverter', 'Battery', 'Mounting', 'Wiring', 'Accessories', 'Total Cost', 'Requested By', 'Date', 'Action'],
  leave: ['ID', 'Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Requested By', 'Date', 'Action'],
  resignation: ['ID', 'Employee Name', 'Reason', 'Notice Period', 'Last Working Day', 'Requested By', 'Date', 'Action']
};

// Field mappings for each approval type
const fieldMappings = {
  recruitment: ['id', 'hiringPosition', 'name', 'candidateName', 'candidateMobile', 'candidateEmail', 'salaryBudget', 'ageCriteria', 'gender', 'education', 'experience', 'requestedBy', 'date'],
  driver: ['id', 'driverName', 'licenseNo', 'mobile', 'vehicleType', 'experience', 'address', 'requestedBy', 'date'],
  dealer: ['id', 'dealerName', 'businessName', 'mobile', 'email', 'address', 'gstNo', 'requestedBy', 'date'],
  installer: ['id', 'installerName', 'businessName', 'mobile', 'email', 'address', 'certification', 'experience', 'requestedBy', 'date'],
  franchisee: ['id', 'franchiseeName', 'businessName', 'mobile', 'email', 'address', 'investment', 'requestedBy', 'date'],
  combokit: ['id', 'name', 'solarpanelbrand', 'panelsku', 'inverter', 'invertorsku', 'boskitbrand', 'boskitsku', 'cptype', 'district', 'date'],
  inventory: ['id', 'productType', 'name', 'brand', 'sku', 'modelNo', 'quantity', 'requestedBy', 'date'],
  ticket: ['id', 'issueType', 'name', 'priority', 'customerName', 'customerPhone', 'assignedTo', 'estimatedResolution', 'modules', 'timeline', 'requestedBy', 'date'],
  standard: ['id', 'name', 'solarpanelbrand', 'panelsku', 'inverter', 'invertorsku', 'boskitbrand', 'boskitsku', 'cptype', 'district', 'date'],
  customize: ['id', 'name', 'solarPanel', 'inverter', 'battery', 'mounting', 'wiring', 'accessories', 'totalCost', 'requestedBy', 'date'],
  leave: ['id', 'employeeName', 'leaveType', 'startDate', 'endDate', 'reason', 'requestedBy', 'date'],
  resignation: ['id', 'employeeName', 'reason', 'noticePeriod', 'lastWorkingDay', 'requestedBy', 'date']
};

// Sample data for different approval types
// Static approvalData removed


// Cluster and District data
// Static location data removed


// Helper function to get display name for types
const getTypeDisplayName = (type) => {
  const typeMap = {
    'recruitment': 'Recruitment',
    'driver': 'Driver Onboarding',
    'dealer': 'Dealer Onboarding',
    'installer': 'Installer Onboarding',
    'franchisee': 'Franchisee Onboarding',
    'combokit': 'ComboKit',
    'inventory': 'Inventory',
    'ticket': 'Ticket',
    'standard': 'Standard ComboKit',
    'customize': 'Customize Kit',
    'leave': 'Leave Approval',
    'resignation': 'Resignation Approval'
  };
  return typeMap[type] || type;
};

const TimelineItem = ({ step, date, status }) => {
  return (
    <div className={`timeline-item ${status}`}>
      <div className="flex justify-between">
        <strong>{step}</strong>
        <span className="text-gray-500">{date || 'Pending'}</span>
      </div>
    </div>
  );
};

const TimelineModal = ({ ticket, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Ticket Timeline - {ticket.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h6 className="font-semibold mb-2">Ticket Details:</h6>
            <div className="space-y-1">
              <p><strong>Name:</strong> {ticket?.data?.name}</p>
              <p><strong>Priority:</strong>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${ticket?.data?.priority === 'High' ? 'bg-red-100 text-red-800' :
                  ticket?.data?.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                  {ticket?.data?.priority}
                </span>
              </p>
              <p><strong>Customer:</strong> {ticket?.data?.customerName} ({ticket?.data?.customerPhone})</p>
              <p><strong>Assigned To:</strong> {ticket?.data?.assignedTo}</p>
            </div>
          </div>
          <div className="mb-6">
            <h6 className="font-semibold mb-2">Modules:</h6>
            <div className="flex flex-wrap gap-2">
              {ticket?.data?.modules?.map((module, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {module}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Timeline:</h6>
            <div className="ticket-timeline">
              {ticket?.data?.timeline?.map((step, index) => (
                <TimelineItem key={index} {...step} />
              ))}
            </div>
          </div>
        </div>
        <div className="border-t px-6 py-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminApproval() {
  const [locationCardsVisible, setLocationCardsVisible] = useState(true);

  // useLocations hook
  const {
    countries, states, clusters, districts,
    selectedCountry, setSelectedCountry,
    selectedState, setSelectedState,
    selectedCluster, setSelectedCluster,
    selectedDistrict, setSelectedDistrict,
    fetchStates, fetchClusters, fetchDistricts
  } = useLocations();

  const [currentApprovalType, setCurrentApprovalType] = useState('');
  const [currentComboKitType, setCurrentComboKitType] = useState('');
  const [currentSelectedCardType, setCurrentSelectedCardType] = useState('');
  const [showSelectedCardApproved, setShowSelectedCardApproved] = useState(true);

  const [data, setData] = useState({
    recruitment: [], driver: [], dealer: [], installer: [], franchisee: [],
    combokit: [], inventory: [], ticket: [], standard: [], customize: [],
    leave: [], resignation: []
  });

  const [approvedItems, setApprovedItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]); // Kept for local tracking if needed, but main source is DB
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // For manual refresh
  const [overdueRules, setOverdueRules] = useState([]);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const rulesData = await fetchApprovalRules();
        setOverdueRules(rulesData);
      } catch (err) {
        console.error("Error fetching approval rules:", err);
      }
    };
    fetchRules();
  }, [refreshKey]);

  // Cascade Effects
  useEffect(() => {
    if (selectedCountry) fetchStates({ countryId: selectedCountry });
  }, [selectedCountry, fetchStates]);

  useEffect(() => {
    if (selectedState) fetchClusters({ stateId: selectedState });
  }, [selectedState, fetchClusters]);

  useEffect(() => {
    if (selectedCluster) fetchDistricts({ clusterId: selectedCluster });
  }, [selectedCluster, fetchDistricts]);

  // Handle Card Click Helpers
  const findName = (list, id) => {
    if (id === 'all') return 'All';
    return list.find(item => item._id === id)?.name || '';
  };

  // 4. Fetch Approvals
  useEffect(() => {
    const fetchApprovalData = async () => {
      setLoading(true);
      try {
        const filters = {
          country: selectedCountry,
          state: findName(states, selectedState),
          cluster: findName(clusters, selectedCluster),
          district: findName(districts, selectedDistrict)
        };
        console.log("APPROV_FILTERS", filters, "SelectedState:", selectedState, "States:", states);

        const response = await getApprovals(filters);
        console.log("📊 Approval data fetched from database", response.length);

        if (response.length === 0) {
          console.log("⚠️ No approval data found in DB");
        }

        // Organize data by type
        const newData = {
          recruitment: [], driver: [], dealer: [], installer: [], franchisee: [],
          combokit: [], inventory: [], ticket: [], standard: [], customize: [],
          leave: [], resignation: []
        };
        const newApproved = [];
        const newRejected = [];

        response.forEach(item => {
          if (item.status === 'Approved') {
            newApproved.push({
              _mongoId: item._id,   // MongoDB ObjectId — never overwritten by data spread
              ...item.data,
              type: item.type,
              status: item.status,
              approvedDate: item.approvedDate ? new Date(item.approvedDate).toLocaleDateString() : 'N/A',
              approvedBy: item.approvedBy,
              requestedBy: item.requestedBy,
              date: new Date(item.requestDate).toLocaleDateString()
            });
          } else if (item.status === 'Rejected') {
            newRejected.push({
              _mongoId: item._id,   // MongoDB ObjectId — never overwritten by data spread
              ...item.data,
              type: item.type,
              status: item.status,
              rejectedDate: item.rejectedDate ? new Date(item.rejectedDate).toLocaleDateString() : 'N/A',
              rejectedBy: item.rejectedBy,
              requestedBy: item.requestedBy,
              date: new Date(item.requestDate).toLocaleDateString()
            });
          } else {
            if (newData[item.type]) {
              newData[item.type].push({
                _mongoId: item._id,   // MongoDB ObjectId — never overwritten by data spread
                ...item.data,
                type: item.type,
                status: item.status,
                requestedBy: item.requestedBy,
                date: new Date(item.requestDate).toLocaleDateString(),
                requestDate: item.requestDate || item.createdAt
              });
            }
          }
        });

        setData(newData);
        setApprovedItems(newApproved);
        setRejectedItems(newRejected);

      } catch (error) {
        console.error("Error fetching approvals:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch if at least state is selected, or fetches all if nothing selected (optional)
    // The prompt says "When user clicks state -> load its child locations dynamically"
    // And "Fetch approval records... Render dynamically based on selected location"
    fetchApprovalData();

  }, [selectedCountry, selectedState, selectedCluster, selectedDistrict, refreshKey, states, clusters, districts]);

  // Helper functions for overdue logic
  const isItemOverdue = (item) => {
    if (item.status !== 'Pending') return false;
    const rule = overdueRules.find(r => r.key === item.type);
    if (!rule || rule.status !== 'Active') return false;

    const reqDate = new Date(item.requestDate);
    if (isNaN(reqDate.getTime())) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((today - reqDay) / msPerDay);

    return diffDays > rule.overdueDays;
  };

  const getOverdueCount = (type) => {
    const items = data[type] || [];
    return items.filter(isItemOverdue).length;
  };

  // Calculate summary data
  const totalPending = Object.values(data).reduce((sum, items) => sum + items.length, 0);
  const totalOverdue = Object.keys(data).reduce((sum, type) => sum + getOverdueCount(type), 0);

  const onboardingPending = ['driver', 'dealer', 'installer', 'franchisee'].reduce(
    (sum, type) => sum + (data[type]?.length || 0), 0
  );
  const onboardingOverdue = ['driver', 'dealer', 'installer', 'franchisee'].reduce(
    (sum, type) => sum + getOverdueCount(type), 0
  );

  const companyPending = ['recruitment', 'combokit', 'inventory', 'ticket', 'standard', 'customize', 'leave', 'resignation'].reduce(
    (sum, type) => sum + (data[type]?.length || 0), 0
  );
  const companyOverdue = ['recruitment', 'combokit', 'inventory', 'ticket', 'standard', 'customize', 'leave', 'resignation'].reduce(
    (sum, type) => sum + getOverdueCount(type), 0
  );

  const onboardingApproved = approvedItems.filter(
    item => ['driver', 'dealer', 'installer', 'franchisee'].includes(item.type)
  ).length;

  const companyApproved = approvedItems.filter(
    item => ['recruitment', 'combokit', 'inventory', 'ticket', 'standard', 'customize', 'leave', 'resignation'].includes(item.type)
  ).length;

  const approvedToday = approvedItems.filter(item => {
    const today = new Date().toLocaleDateString();
    return item.approvedDate === today;
  }).length;

  // Individual counts
  const counts = {
    installer: data.installer?.length || 0,
    driver: data.driver?.length || 0,
    dealer: data.dealer?.length || 0,
    franchisee: data.franchisee?.length || 0,
    recruitment: data.recruitment?.length || 0,
    combokit: data.combokit?.length || 0,
    inventory: data.inventory?.length || 0,
    ticket: data.ticket?.length || 0,
    standard: data.standard?.length || 0,
    customize: data.customize?.length || 0,
    leave: data.leave?.length || 0,
    resignation: data.resignation?.length || 0
  };

  const overdueCounts = {
    installer: getOverdueCount('installer'),
    driver: getOverdueCount('driver'),
    dealer: getOverdueCount('dealer'),
    franchisee: getOverdueCount('franchisee'),
    recruitment: getOverdueCount('recruitment'),
    combokit: getOverdueCount('combokit') + getOverdueCount('standard') + getOverdueCount('customize'),
    inventory: getOverdueCount('inventory'),
    ticket: getOverdueCount('ticket'),
    standard: getOverdueCount('standard'),
    customize: getOverdueCount('customize'),
    leave: getOverdueCount('leave'),
    resignation: getOverdueCount('resignation')
  };


  const approveItem = async (_mongoId, type) => {
    try {
      await updateApprovalStatus(_mongoId, 'Approved');
      alert('Item approved successfully!');
      const item = data[type].find(i => i._mongoId === _mongoId);
      if (item) {
        const approvedItem = {
          ...item,
          status: 'Approved',
          approvedDate: new Date().toLocaleDateString(),
          approvedBy: 'Admin'
        };
        setApprovedItems(prev => [...prev, approvedItem]);
        setData(prev => ({
          ...prev,
          [type]: prev[type].filter(i => i._mongoId !== _mongoId)
        }));
      }
    } catch (error) {
      console.error("Error approving item:", error);
      alert('Failed to approve item');
    }
  };

  const rejectItem = async (_mongoId, type) => {
    try {
      await updateApprovalStatus(_mongoId, 'Rejected', 'Rejected by Admin');
      alert('Item rejected!');
      const item = data[type].find(i => i._mongoId === _mongoId);
      if (item) {
        const rejectedItem = {
          ...item,
          status: 'Rejected',
          rejectedDate: new Date().toLocaleDateString(),
          rejectedBy: 'Admin'
        };
        setRejectedItems(prev => [...prev, rejectedItem]);
        setData(prev => ({
          ...prev,
          [type]: prev[type].filter(i => i._mongoId !== _mongoId)
        }));
      }
    } catch (error) {
      console.error("Error rejecting item:", error);
      alert('Failed to reject item');
    }
  };

  const handleApprovalTypeSelect = (type) => {
    setCurrentApprovalType(type);
    setCurrentComboKitType('');
    if (type === 'onboarding') {
      setCurrentSelectedCardType('installer');
    } else if (type === 'company') {
      setCurrentSelectedCardType('recruitment');
    }
  };

  const handleCardSelect = (type) => {
    setCurrentSelectedCardType(type);
    if (type === 'combokit') {
      setCurrentComboKitType('');
    }
  };

  const handleComboKitTypeSelect = (type) => {
    setCurrentComboKitType(type);
    setCurrentSelectedCardType(type);
  };

  const downloadExcel = () => {
    let csvContent = "Request ID,Type,Name,Status,Requested By,Date,Location\n";
    const loc = findName(districts, selectedDistrict) || findName(clusters, selectedCluster) || findName(states, selectedState) || 'All';

    // Add pending items
    Object.keys(data).forEach(type => {
      data[type].forEach(item => {
        csvContent += `${item.id},${getTypeDisplayName(item.type)},${item.name || item.driverName || item.dealerName || item.installerName || item.franchiseeName || item.candidateName},${item.status},${item.requestedBy},${item.date},${loc}\n`;
      });
    });

    // Add approved items
    approvedItems.forEach(item => {
      csvContent += `${item.id},${getTypeDisplayName(item.type)},${item.name || item.driverName || item.dealerName || item.installerName || item.franchiseeName || item.candidateName},Approved,${item.requestedBy},${item.approvedDate || item.date},${loc}\n`;
    });

    // Add rejected items
    rejectedItems.forEach(item => {
      csvContent += `${item.id},${getTypeDisplayName(item.type)},${item.name || item.driverName || item.dealerName || item.installerName || item.franchiseeName || item.candidateName},Rejected,${item.requestedBy},${item.rejectedDate || item.date},${loc}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `approval_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Excel file downloaded successfully!');
  };

  const viewTimeline = (ticket) => {
    setSelectedTicket(ticket);
    setShowTimelineModal(true);
  };

  // Render table for selected type
  const renderTable = (type) => {
    const items = data[type] || [];

    return (
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {tableHeaders[type]?.map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders[type]?.length || 10} className="px-6 py-8 text-center text-gray-500">
                  No pending requests found
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const overdue = isItemOverdue(item);
                return (
                  <tr key={index} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50/80 border-l-4 border-red-500' : ''}`}>
                    {fieldMappings[type]?.map((field, idx) => (
                      <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {idx === 0 ? (
                          <div className="flex items-center gap-2 font-mono font-medium">
                            <span>{item[field] || 'N/A'}</span>
                            {overdue && (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold border border-red-200 shadow-sm flex items-center gap-1 animate-pulse">
                                <span>⚠</span> Overdue
                              </span>
                            )}
                          </div>
                        ) : field === 'modules' && item[field] ? (
                          <div className="flex flex-wrap gap-1">
                            {item[field].map((module, modIdx) => (
                              <span key={modIdx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {module}
                              </span>
                            ))}
                          </div>
                        ) : field === 'timeline' && item[field] ? (
                          <button
                            onClick={() => viewTimeline(item)}
                            className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm"
                          >
                            View Timeline
                          </button>
                        ) : (
                          item[field] || 'N/A'
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveItem(item._mongoId, type)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectItem(item._mongoId, type)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Render final summary table
  const renderFinalSummary = () => {
    let itemsToShow = [];

    if (showSelectedCardApproved && currentSelectedCardType) {
      itemsToShow = approvedItems.filter(item => item.type === currentSelectedCardType);
    } else {
      itemsToShow = approvedItems;
    }

    const currentType = currentSelectedCardType;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              {tableHeaders[currentType]?.map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itemsToShow.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {fieldMappings[item.type]?.map((field, idx) => (
                  <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {field === 'modules' && item[field] ? (
                      <div className="flex flex-wrap gap-1">
                        {item[field].map((module, modIdx) => (
                          <span key={modIdx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {module}
                          </span>
                        ))}
                      </div>
                    ) : field === 'timeline' && item[field] ? (
                      <button
                        onClick={() => viewTimeline(item)}
                        className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm"
                      >
                        View Timeline
                      </button>
                    ) : (
                      item[field] || 'N/A'
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">Approved</span>
                  </div>
                </td>
              </tr>
            ))}
            {itemsToShow.length === 0 && (
              <tr>
                <td colSpan={tableHeaders[currentType]?.length || 8} className="px-6 py-8 text-center text-gray-500">
                  No approved requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <style>{`
        .clickable-card, .clickable-cluster, .clickable-district,
        .approval-type-card, .approval-card, .combokit-type-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clickable-card:hover, .clickable-cluster:hover, .clickable-district:hover,
        .approval-type-card:hover, .approval-card:hover, .combokit-type-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .clickable-card.selected, .clickable-cluster.selected, .clickable-district.selected,
        .approval-card.selected, .combokit-type-card.selected {
          border: 3px solid #3b82f6;
        }

        .location-section {
          transition: all 0.5s ease;
          overflow: hidden;
        }

        .location-section.collapsed {
          max-height: 0;
          opacity: 0;
          margin: 0;
          padding: 0;
        }

        .location-section.expanded {
          max-height: 2000px;
          opacity: 1;
        }

        .ticket-timeline {
          position: relative;
          padding-left: 20px;
        }

        .ticket-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #e5e7eb;
          border-radius: 2px;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 15px;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 6px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #3b82f6;
          z-index: 1;
        }

        .timeline-item.completed::before {
          background-color: #10b981;
        }

        .timeline-item.current::before {
          background-color: #f59e0b;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-blue-600">Admin Approval</h1>
            </div>
            <button
              onClick={() => setLocationCardsVisible(!locationCardsVisible)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
            >
              {locationCardsVisible ? (
                <>
                  <EyeOff size={16} />
                  Hide Location Cards
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Show Location Cards
                </>
              )}
            </button>
            <button
              onClick={() => setRefreshKey(old => old + 1)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 ml-2"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection Section */}
      <div className={`location-section ${locationCardsVisible ? 'expanded' : 'collapsed'} mb-6`}>
        {/* Country Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Select Country</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              className={`clickable-card bg-white rounded-lg shadow-sm p-4 text-center border-2 border-dashed ${selectedCountry === 'all' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200 opacity-80'
                }`}
              onClick={() => {
                setSelectedCountry('all');
                setSelectedState('');
                setSelectedCluster('');
                setSelectedDistrict('');
              }}
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-gray-600" size={24} />
              </div>
              <h5 className="font-bold text-lg italic">All Countries</h5>
              <p className="text-gray-400 text-xs">Global Overview</p>
            </div>
            {countries.map((country) => (
              <div
                key={country._id}
                className={`clickable-card bg-white rounded-lg shadow-sm p-4 text-center border-2 ${selectedCountry === country._id ? 'selected border-blue-500' : 'border-transparent'
                  }`}
                onClick={() => setSelectedCountry(country._id)}
              >
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="text-blue-600" size={24} />
                </div>
                <h5 className="font-bold text-lg">{country.name}</h5>
                <p className="text-gray-500 text-sm mt-1">{country.code}</p>
              </div>
            ))}
          </div>
        </div>

        {/* State Selection */}
        {(selectedCountry || selectedCountry === 'all') && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Select State</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`clickable-card bg-white rounded-lg shadow-sm p-4 text-center border-2 border-dashed ${selectedState === 'all' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200 opacity-80'
                  }`}
                onClick={() => {
                  setSelectedState('all');
                  setSelectedCluster('');
                  setSelectedDistrict('');
                }}
              >
                <h5 className="font-bold text-lg italic">All States</h5>
                <p className="text-gray-400 text-xs text-sm mt-1">National View</p>
              </div>
              {states.map((state) => (
                <div
                  key={state._id}
                  className={`clickable-card bg-white rounded-lg shadow-sm p-4 text-center border-2 ${selectedState === state._id ? 'selected border-blue-500' : 'border-transparent'
                    }`}
                  onClick={() => setSelectedState(state._id)}
                >
                  <h5 className="font-bold text-lg">{state.name}</h5>
                  <p className="text-gray-500 text-sm mt-1">
                    {state.code || state.name.substring(0, 2).toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cluster Selection */}
        {(selectedState || selectedState === 'all') && clusters.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Select Cluster</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`clickable-cluster bg-white rounded-lg shadow-sm p-4 text-center border-2 border-dashed ${selectedCluster === 'all' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200 opacity-80'
                  }`}
                onClick={() => {
                  setSelectedCluster('all');
                  setSelectedDistrict('');
                }}
              >
                <h6 className="font-bold italic text-gray-500">All Clusters</h6>
              </div>
              {clusters.map((cluster) => (
                <div
                  key={cluster._id}
                  className={`clickable-cluster bg-white rounded-lg shadow-sm p-4 text-center border-2 ${selectedCluster === cluster._id ? 'selected border-blue-500' : 'border-transparent'
                    }`}
                  onClick={() => setSelectedCluster(cluster._id)}
                >
                  <h6 className="font-bold">{cluster.name}</h6>
                  <p className="text-gray-500 text-sm mt-1">Cluster</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* District Selection */}
        {(selectedCluster || selectedCluster === 'all') && districts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Select District</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`clickable-district bg-white rounded-lg shadow-sm p-4 text-center border-2 border-dashed ${selectedDistrict === 'all' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200 opacity-80'
                  }`}
                onClick={() => setSelectedDistrict('all')}
              >
                <h6 className="font-bold italic text-gray-500">All Districts</h6>
              </div>
              {districts.map((district) => (
                <div
                  key={district._id}
                  className={`clickable-district bg-white rounded-lg shadow-sm p-4 text-center border-2 ${selectedDistrict === district._id ? 'selected border-blue-500' : 'border-transparent'
                    }`}
                  onClick={() => setSelectedDistrict(district._id)}
                >
                  <h6 className="font-bold">{district.name}</h6>
                  <p className="text-gray-500 text-sm mt-1">District</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Container - Show when any category is selected, or Global view */}
      {(selectedCountry || selectedCountry === 'all') && (
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h5 className="text-lg font-semibold text-blue-600">Approval Summary</h5>
              </div>
              <button
                onClick={downloadExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FileSpreadsheet size={16} />
                Download Excel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 border rounded-lg p-4 text-center relative overflow-hidden shadow-sm">
                <h6 className="text-sm font-medium text-gray-600">Total Pending</h6>
                <h3 className="text-2xl font-bold text-yellow-600 mt-2">{totalPending}</h3>
                {totalOverdue > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-300 shadow-sm animate-pulse">
                    <span>⚠</span> {totalOverdue} Overdue
                  </div>
                )}
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <h6 className="text-sm font-medium text-gray-600">Onboarding Approved</h6>
                <h3 className="text-2xl font-bold text-green-600 mt-2">{onboardingApproved}</h3>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <h6 className="text-sm font-medium text-gray-600">Company User Approved</h6>
                <h3 className="text-2xl font-bold text-blue-600 mt-2">{companyApproved}</h3>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <h6 className="text-sm font-medium text-gray-600">Approved Today</h6>
                <h3 className="text-2xl font-bold text-cyan-600 mt-2">{approvedToday}</h3>
              </div>
            </div>
          </div>

          {/* Approval Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`approval-type-card bg-blue-600 text-white rounded-lg shadow-sm p-6 text-center cursor-pointer border-2 relative ${currentApprovalType === 'onboarding' ? 'selected border-white' : 'border-transparent'
                }`}
              onClick={() => handleApprovalTypeSelect('onboarding')}
            >
              {onboardingOverdue > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md border-2 border-white animate-pulse min-w-[24px]">
                  {onboardingOverdue}
                </div>
              )}
              <UserPlus className="w-8 h-8 mx-auto mb-3" />
              <h5 className="text-lg font-semibold">Onboarding Approvals</h5>
              <h2 className="text-3xl font-bold my-2">{onboardingPending}</h2>
              <p className="text-blue-100">Pending Approval</p>
              {onboardingOverdue > 0 && (
                <div className="mt-3 inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
                  ⚠ {onboardingOverdue} Overdue Approvals
                </div>
              )}
            </div>
            <div
              className={`approval-type-card bg-green-600 text-white rounded-lg shadow-sm p-6 text-center cursor-pointer border-2 relative ${currentApprovalType === 'company' ? 'selected border-white' : 'border-transparent'
                }`}
              onClick={() => handleApprovalTypeSelect('company')}
            >
              {companyOverdue > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md border-2 border-white animate-pulse min-w-[24px]">
                  {companyOverdue}
                </div>
              )}
              <ListTodo className="w-8 h-8 mx-auto mb-3" />
              <h5 className="text-lg font-semibold">Company User Approvals</h5>
              <h2 className="text-3xl font-bold my-2">{companyPending}</h2>
              <p className="text-green-100">Pending Approval</p>
              {companyOverdue > 0 && (
                <div className="mt-3 inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
                  ⚠ {companyOverdue} Overdue Approvals
                </div>
              )}
            </div>
          </div>

          {/* Onboarding Approval Cards */}
          {currentApprovalType === 'onboarding' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'installer', color: 'bg-cyan-600', icon: HardHat, count: counts.installer, overdue: overdueCounts.installer, label: 'Installer Onboarding' },
                { type: 'driver', color: 'bg-yellow-600', icon: Truck, count: counts.driver, overdue: overdueCounts.driver, label: 'Driver Onboarding' },
                { type: 'dealer', color: 'bg-gray-600', icon: Store, count: counts.dealer, overdue: overdueCounts.dealer, label: 'Dealer Onboarding' },
                { type: 'franchisee', color: 'bg-gray-800', icon: Home, count: counts.franchisee, overdue: overdueCounts.franchisee, label: 'Franchisee Onboarding' }
              ].map((card) => (
                <div
                  key={card.type}
                  className={`approval-card ${card.color} text-white rounded-lg shadow-sm p-4 text-center cursor-pointer border-2 relative ${currentSelectedCardType === card.type ? 'selected border-white' : 'border-transparent'
                    }`}
                  onClick={() => handleCardSelect(card.type)}
                >
                  {card.overdue > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md border border-white animate-pulse min-w-[20px]">
                      {card.overdue}
                    </div>
                  )}
                  <h5 className="font-semibold">{card.label}</h5>
                  <h2 className="text-2xl font-bold my-2">{card.count}</h2>
                  <p className="text-opacity-90">Pending Approval</p>
                  {card.overdue > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      ⚠ {card.overdue} Overdue
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Company User Approval Cards */}
          {currentApprovalType === 'company' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'recruitment', color: 'bg-blue-600', icon: Users, count: counts.recruitment, overdue: overdueCounts.recruitment, label: 'Recruitment' },
                { type: 'leave', color: 'bg-indigo-600', icon: Calendar, count: counts.leave, overdue: overdueCounts.leave, label: 'Leave Approval' },
                { type: 'resignation', color: 'bg-red-600', icon: FileSpreadsheet, count: counts.resignation, overdue: overdueCounts.resignation, label: 'Resignation Approval' },
                { type: 'combokit', color: 'bg-green-600', icon: Package, count: counts.combokit, overdue: overdueCounts.combokit, label: 'ComboKit Approvals' },
                { type: 'inventory', color: 'bg-yellow-600', icon: Box, count: counts.inventory, overdue: overdueCounts.inventory, label: 'Inventory Approvals' },
                { type: 'ticket', color: 'bg-cyan-600', icon: Wrench, count: counts.ticket, overdue: overdueCounts.ticket, label: 'Ticket Approvals' }
              ].map((card) => (
                <div
                  key={card.type}
                  className={`approval-card ${card.color} text-white rounded-lg shadow-sm p-4 text-center cursor-pointer border-2 relative ${currentSelectedCardType === card.type ? 'selected border-white' : 'border-transparent'
                    }`}
                  onClick={() => handleCardSelect(card.type)}
                >
                  {card.overdue > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md border border-white animate-pulse min-w-[20px]">
                      {card.overdue}
                    </div>
                  )}
                  <h5 className="font-semibold">{card.label}</h5>
                  <h2 className="text-2xl font-bold my-2">{card.count}</h2>
                  <p className="text-opacity-90">Pending Approval</p>
                  {card.overdue > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      ⚠ {card.overdue} Overdue
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ComboKit Type Selection */}
          {currentSelectedCardType === 'combokit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`combokit-type-card bg-blue-600 text-white rounded-lg shadow-sm p-6 text-center cursor-pointer border-2 relative ${currentComboKitType === 'standard' ? 'selected border-white' : 'border-transparent'
                  }`}
                onClick={() => handleComboKitTypeSelect('standard')}
              >
                <Box className="w-8 h-8 mx-auto mb-3" />
                <h5 className="text-lg font-semibold">Standard ComboKit</h5>
                <h2 className="text-3xl font-bold my-2">{counts.standard}</h2>
                <p className="text-blue-100">Pending Approval</p>
                {overdueCounts.standard > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    ⚠ {overdueCounts.standard} Overdue Approvals
                  </div>
                )}
              </div>
              <div
                className={`combokit-type-card bg-cyan-600 text-white rounded-lg shadow-sm p-6 text-center cursor-pointer border-2 relative ${currentComboKitType === 'customize' ? 'selected border-white' : 'border-transparent'
                  }`}
                onClick={() => handleComboKitTypeSelect('customize')}
              >
                <Settings className="w-8 h-8 mx-auto mb-3" />
                <h5 className="text-lg font-semibold">Customize Kit</h5>
                <h2 className="text-3xl font-bold my-2">{counts.customize}</h2>
                <p className="text-cyan-100">Pending Approval</p>
                {overdueCounts.customize > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    ⚠ {overdueCounts.customize} Overdue Approvals
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Table Section */}
          {(currentSelectedCardType && currentSelectedCardType !== 'combokit') ||
            (currentSelectedCardType === 'combokit' && currentComboKitType) ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h5 className="text-lg font-semibold mb-4 md:mb-0">
                  {currentSelectedCardType === 'combokit'
                    ? (currentComboKitType === 'standard' ? 'Standard ComboKit' : 'Customize Kit')
                    : getTypeDisplayName(currentSelectedCardType)} Approval Requests
                </h5>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentSelectedCardType('');
                      setCurrentComboKitType('');
                    }}
                    className="px-4 py-2 border border-gray-600 text-gray-600 rounded hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back to Cards
                  </button>
                  <button
                    onClick={() => {
                      // Refresh the data
                      setData({ ...data });
                    }}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>
              {renderTable(currentSelectedCardType === 'combokit' ? currentComboKitType : currentSelectedCardType)}
            </div>
          ) : null}

          {/* Final Summary Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <List className="w-5 h-5 text-blue-600" />
              <h5 className="text-lg font-semibold text-blue-600">Summary</h5>
            </div>
            {renderFinalSummary()}
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      <TimelineModal
        ticket={selectedTicket}
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
      />
    </div>
  );
}