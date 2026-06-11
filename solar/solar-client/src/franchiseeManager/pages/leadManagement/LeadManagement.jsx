import React, { useState, useEffect } from 'react';
import {
    Users,
    MapPin,
    Layers,
    User,
    UserCircle,
    BarChart3,
    PieChart,
    Check,
    RotateCcw,
    Plus,
    Info,
    X,
    Search,
    TrendingUp,
    DollarSign,
    Home,
    CheckCircle,
    AlertCircle,
    Loader,
    Filter,
    Clock,
    CreditCard,
    Package,
    Crown,
    Award,
    Activity
} from 'lucide-react';

const FranchiseeManagerLeadManagement = () => {
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedLeadPlan, setSelectedLeadPlan] = useState(null);
    const [franchisees, setFranchisees] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [currentFranchiseeId, setCurrentFranchiseeId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [leadCount, setLeadCount] = useState(5);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Data
    const districts = [
        { id: 1, name: "Ahmedabad", leads: 350, franchisees: 12, color: "#17a2b8" },
        { id: 2, name: "Surat", leads: 280, franchisees: 9, color: "#20c997" },
        { id: 3, name: "Vadodara", leads: 190, franchisees: 7, color: "#6f42c1" },
        { id: 4, name: "Rajkot", leads: 150, franchisees: 5, color: "#fd7e14" }
    ];

    const [leadPlans, setLeadPlans] = useState([
        { id: 1, name: "High Priority", type: "high-priority", total: 50, assigned: 20, cost: 500, color: "#e74c3c", icon: AlertCircle },
        { id: 2, name: "Medium Priority", type: "medium-priority", total: 100, assigned: 45, cost: 300, color: "#f39c12", icon: Clock },
        { id: 3, name: "Low Cost", type: "low-cost", total: 200, assigned: 120, cost: 150, color: "#3498db", icon: CreditCard },
        { id: 4, name: "Exclusive", type: "exclusive", total: 25, assigned: 10, cost: 800, color: "#9b59b6", icon: Crown },
        { id: 5, name: "Bulk", type: "bulk", total: 300, assigned: 180, cost: 80, color: "#2ecc71", icon: Package }
    ]);

    // Load franchisees when district changes
    useEffect(() => {
        if (selectedDistrict) {
            loadFranchisees();
        } else {
            setFranchisees([]);
        }
    }, [selectedDistrict]);

    // Load franchisees
    const loadFranchisees = () => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            const franchiseeCount = selectedDistrict ? selectedDistrict.franchisees : 8;
            const newFranchisees = [];

            for (let i = 1; i <= franchiseeCount; i++) {
                const assigned = Math.floor(Math.random() * 15);
                const capacity = 30 - assigned;

                newFranchisees.push({
                    id: i,
                    name: `Franchisee ${i}`,
                    location: `${selectedDistrict ? selectedDistrict.name : 'District'} - Area ${String.fromCharCode(64 + i)}`,
                    assigned: assigned,
                    capacity: capacity > 0 ? capacity : 0,
                    performance: (70 + Math.random() * 25).toFixed(1) + '%',
                    status: capacity > 0 ? 'available' : 'full'
                });
            }

            setFranchisees(newFranchisees);
            setLoading(false);
        }, 500);
    };

    // Select district
    const handleSelectDistrict = (districtId) => {
        const district = districts.find(d => d.id === districtId);
        setSelectedDistrict(district);
    };

    // Select lead plan
    const handleSelectLeadPlan = (planId) => {
        const plan = leadPlans.find(p => p.id === planId);
        setSelectedLeadPlan(plan);
    };

    // Open assignment modal
    const handleOpenAssignmentModal = (franchiseeId) => {
        if (!selectedDistrict || !selectedLeadPlan) {
            showSuccessMessage('Please select a district and lead plan first', 'error');
            return;
        }

        const franchisee = franchisees.find(f => f.id === franchiseeId);
        const availableLeads = selectedLeadPlan.total - selectedLeadPlan.assigned;
        const maxLeads = Math.min(availableLeads, franchisee.capacity);

        if (maxLeads <= 0) {
            showSuccessMessage('No leads available or franchisee capacity full', 'error');
            return;
        }

        setCurrentFranchiseeId(franchiseeId);
        setLeadCount(Math.min(5, maxLeads));
        setShowAssignmentModal(true);
    };

    // Confirm assignment
    const handleConfirmAssignment = () => {
        const franchisee = franchisees.find(f => f.id === currentFranchiseeId);
        const availableLeads = selectedLeadPlan.total - selectedLeadPlan.assigned;

        // Validation
        if (leadCount > availableLeads) {
            showSuccessMessage(`Only ${availableLeads} leads available in this plan`, 'error');
            return;
        }

        if (leadCount > franchisee.capacity) {
            showSuccessMessage(`Franchisee capacity is ${franchisee.capacity} leads`, 'error');
            return;
        }

        // Update lead plan
        const updatedLeadPlans = leadPlans.map(plan =>
            plan.id === selectedLeadPlan.id
                ? { ...plan, assigned: plan.assigned + leadCount }
                : plan
        );
        setLeadPlans(updatedLeadPlans);
        setSelectedLeadPlan(updatedLeadPlans.find(p => p.id === selectedLeadPlan.id));

        // Update franchisee
        const updatedFranchisees = franchisees.map(f =>
            f.id === currentFranchiseeId
                ? {
                    ...f,
                    assigned: f.assigned + leadCount,
                    capacity: f.capacity - leadCount,
                    status: f.capacity - leadCount <= 0 ? 'full' : f.status
                }
                : f
        );
        setFranchisees(updatedFranchisees);

        // Record assignment
        setAssignments([...assignments, {
            franchiseeId: currentFranchiseeId,
            franchiseeName: franchisee.name,
            leadPlanId: selectedLeadPlan.id,
            leadCount: leadCount,
            date: new Date().toLocaleDateString()
        }]);

        // Show success
        showSuccessMessage(`${leadCount} leads assigned to ${franchisee.name}`, 'success');

        // Close modal
        setShowAssignmentModal(false);
    };

    // Show success/error message
    const showSuccessMessage = (message, type = 'success') => {
        setToastMessage(message);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    // Reset selection
    const handleResetSelection = () => {
        setSelectedDistrict(null);
        setSelectedLeadPlan(null);
        setFranchisees([]);
    };

    // Finalize all assignments
    const handleFinalizeAllAssignments = () => {
        if (!selectedDistrict || !selectedLeadPlan) {
            showSuccessMessage('Please select a district and lead plan first', 'error');
            return;
        }

        if (assignments.length === 0) {
            showSuccessMessage('No assignments to finalize', 'error');
            return;
        }

        if (window.confirm(`Finalize ${assignments.length} assignment(s) to franchisees?`)) {
            showSuccessMessage(`${assignments.length} assignments finalized successfully!`, 'success');
            setAssignments([]);
        }
    };

    // Filter franchisees based on search
    const filteredFranchisees = franchisees.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get remaining leads for selected plan
    const getRemainingLeads = () => {
        if (!selectedLeadPlan) return 0;
        return selectedLeadPlan.total - selectedLeadPlan.assigned;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto px-4 py-4">
                {/* Header */}
                <div className="mb-4">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                            <Users className="text-blue-500 mr-2" size={20} />
                            Lead Management System
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">Assign leads to franchisees across districts</p>
                    </div>
                </div>

                {/* Toast Notification */}
                {showToast && (
                    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
                        <div className={`rounded-lg shadow-lg p-4 ${toastMessage.includes('error') ? 'bg-red-500' : 'bg-blue-500'
                            } text-white`}>
                            <div className="flex items-center">
                                {toastMessage.includes('error') ? (
                                    <AlertCircle size={18} className="mr-2" />
                                ) : (
                                    <CheckCircle size={18} className="mr-2" />
                                )}
                                <p className="text-sm">{toastMessage}</p>
                                <button onClick={() => setShowToast(false)} className="ml-4">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Selected Information Row */}
                {(selectedDistrict || selectedLeadPlan) && (
                    <div className="mb-4 animate-fade-in">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-col md:flex-row md:space-x-6">
                                    <h6 className="text-sm font-medium text-gray-700 flex items-center mb-2 md:mb-0">
                                        <MapPin className="text-blue-500 mr-1" size={16} />
                                        District: <span className="font-bold ml-1">{selectedDistrict?.name || 'None'}</span>
                                    </h6>
                                    <h6 className="text-sm font-medium text-gray-700 flex items-center">
                                        <Layers className="text-blue-500 mr-1" size={16} />
                                        Lead Plan: <span className="font-bold ml-1">{selectedLeadPlan?.name || 'None'}</span>
                                    </h6>
                                </div>
                                <button
                                    onClick={handleResetSelection}
                                    className="mt-2 md:mt-0 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                                >
                                    <RotateCcw size={14} className="mr-1" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* District Section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h6 className="font-semibold text-gray-700 flex items-center">
                                    <MapPin className="text-blue-500 mr-2" size={16} />
                                    Select District
                                </h6>
                            </div>
                            <div className="p-3">
                                <div className="space-y-2">
                                    {districts.map(district => (
                                        <div
                                            key={district.id}
                                            onClick={() => handleSelectDistrict(district.id)}
                                            className={`cursor-pointer rounded-lg p-3 transition-all ${selectedDistrict?.id === district.id
                                                ? 'border-2 border-blue-500 bg-blue-50'
                                                : 'border border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 mr-3">
                                                    <MapPin size={20} style={{ color: district.color }} />
                                                </div>
                                                <div className="flex-1">
                                                    <h6 className="font-medium text-gray-800">{district.name}</h6>
                                                    <p className="text-xs text-gray-500">
                                                        {district.leads} leads • {district.franchisees} franchisees
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                        Select
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-lg shadow-sm mt-4 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h6 className="font-semibold text-gray-700 flex items-center">
                                    <BarChart3 className="text-blue-500 mr-2" size={16} />
                                    Today's Stats
                                </h6>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-700">4</div>
                                        <p className="text-xs text-gray-500">Districts</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-700">1,250</div>
                                        <p className="text-xs text-gray-500">Total Leads</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-700">42</div>
                                        <p className="text-xs text-gray-500">Assignments</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-700">₹85K</div>
                                        <p className="text-xs text-gray-500">Revenue</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lead Plans Section */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h6 className="font-semibold text-gray-700 flex items-center">
                                    <Layers className="text-blue-500 mr-2" size={16} />
                                    Available Lead Plans
                                </h6>
                            </div>
                            <div className="p-3 max-h-[500px] overflow-y-auto">
                                <div className="space-y-2">
                                    {leadPlans.map(plan => {
                                        const remaining = plan.total - plan.assigned;
                                        const percent = Math.round((plan.assigned / plan.total) * 100);
                                        const Icon = plan.icon;

                                        return (
                                            <div
                                                key={plan.id}
                                                onClick={() => handleSelectLeadPlan(plan.id)}
                                                className={`cursor-pointer rounded-lg border-t-4 transition-all hover:shadow-md ${selectedLeadPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
                                                    }`}
                                                style={{ borderTopColor: plan.color }}
                                            >
                                                <div className="p-3">
                                                    <div className="flex items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center mb-1">
                                                                <Icon size={16} style={{ color: plan.color }} className="mr-1" />
                                                                <h6 className="font-medium text-gray-800">{plan.name}</h6>
                                                            </div>
                                                            <div className="flex items-center mt-1">
                                                                <div className="flex-1 h-1 bg-gray-200 rounded-full mr-2">
                                                                    <div
                                                                        className="h-1 rounded-full"
                                                                        style={{ width: `${percent}%`, backgroundColor: plan.color }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-gray-500">{percent}%</span>
                                                            </div>
                                                            <div className="flex justify-between mt-1">
                                                                <span className="text-xs text-gray-500">₹{plan.cost}/lead</span>
                                                                <span className="text-xs text-gray-500">{remaining} available</span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-2">
                                                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                                {plan.total}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Franchisee Section */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <h6 className="font-semibold text-gray-700 flex items-center mb-2 md:mb-0">
                                        <User className="text-blue-500 mr-2" size={16} />
                                        Franchisees for Assignment
                                    </h6>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search franchisee..."
                                            className="w-full md:w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Search size={14} className="absolute right-3 top-2 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 max-h-[400px] overflow-y-auto">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <Loader className="animate-spin text-gray-400 mx-auto mb-2" size={24} />
                                        <p className="text-sm text-gray-500">Loading franchisees...</p>
                                    </div>
                                ) : !selectedDistrict ? (
                                    <div className="text-center py-8">
                                        <Users className="text-gray-300 mx-auto mb-2" size={32} />
                                        <p className="text-sm text-gray-500">Select a district to view franchisees</p>
                                    </div>
                                ) : filteredFranchisees.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="text-gray-300 mx-auto mb-2" size={32} />
                                        <p className="text-sm text-gray-500">No franchisees found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredFranchisees.map(franchisee => (
                                            <div
                                                key={franchisee.id}
                                                className="border-l-4 border-blue-400 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="p-3">
                                                    <div className="flex items-start">
                                                        <div className="flex-1">
                                                            <h6 className="font-medium text-gray-800">{franchisee.name}</h6>
                                                            <p className="text-xs text-gray-500 mb-2">{franchisee.location}</p>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                                                                    <TrendingUp size={10} className="mr-1" />
                                                                    {franchisee.performance}
                                                                </span>
                                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                                                                    <Users size={10} className="mr-1" />
                                                                    {franchisee.assigned} assigned
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {franchisee.status === 'available' ? (
                                                                <button
                                                                    onClick={() => handleOpenAssignmentModal(franchisee.id)}
                                                                    className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors flex items-center"
                                                                >
                                                                    <Plus size={12} className="mr-1" />
                                                                    Assign
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full">
                                                                    Full
                                                                </span>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Capacity: {franchisee.capacity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Box */}
                        {selectedLeadPlan && (
                            <div className="bg-white rounded-lg shadow-sm mt-4 p-4 border border-gray-200 animate-fade-in">
                                <h6 className="font-semibold text-gray-700 flex items-center mb-3">
                                    <PieChart className="text-blue-500 mr-2" size={16} />
                                    Assignment Summary
                                </h6>
                                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-700">{selectedLeadPlan.total}</div>
                                        <p className="text-xs text-gray-500">Total Leads</p>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-700">{selectedLeadPlan.assigned}</div>
                                        <p className="text-xs text-gray-500">Assigned</p>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-700">{getRemainingLeads()}</div>
                                        <p className="text-xs text-gray-500">Remaining</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleFinalizeAllAssignments}
                                    className="w-full bg-blue-500 text-white text-sm py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                                >
                                    <Check size={16} className="mr-1" />
                                    Finalize All Assignments
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h6 className="font-semibold text-gray-700">Assign Leads</h6>
                        </div>
                        <div className="p-4">
                            <p className="text-sm mb-3">
                                Assigning to: <span className="font-bold">
                                    {franchisees.find(f => f.id === currentFranchiseeId)?.name}
                                </span>
                            </p>
                            <div className="mb-3">
                                <label className="block text-xs text-gray-600 mb-1">Number of Leads</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={leadCount}
                                    onChange={(e) => setLeadCount(parseInt(e.target.value))}
                                    min="1"
                                    max={Math.min(
                                        selectedLeadPlan?.total - selectedLeadPlan?.assigned,
                                        franchisees.find(f => f.id === currentFranchiseeId)?.capacity
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Max available: {Math.min(
                                        selectedLeadPlan?.total - selectedLeadPlan?.assigned,
                                        franchisees.find(f => f.id === currentFranchiseeId)?.capacity
                                    )}
                                </p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 flex items-start">
                                <Info size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                                <span>Leads will be assigned immediately</span>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowAssignmentModal(false)}
                                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAssignment}
                                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default FranchiseeManagerLeadManagement;