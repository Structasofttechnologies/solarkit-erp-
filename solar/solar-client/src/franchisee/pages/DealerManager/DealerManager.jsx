// FranchiseDealerManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    MoreVertical,
    Eye,
    RefreshCw,
    Ban,
    Trash2,
    Phone,
    Mail,
    Calendar,
    Activity,
    FileText,
    PenSquare,
    Wrench,
    Settings,
    Circle,
    Bolt,
    IndianRupee,
    UserPlus,
    X,
    Lock
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { locationAPI } from '../../../api/api';

const FranchiseDealerManager = () => {
    const navigate = useNavigate();
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [showProfileView, setShowProfileView] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [resetPasswordData, setResetPasswordData] = useState({
        managerName: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State for dropdown visibility
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdownIndex(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Sample Manager Data
    const [managers] = useState([
        {
            name: "Smith",
            role: "Dealer Manager",
            email: "john@example.com",
            phone: "+1234567890",
            district: "rajkot",
            projectType: "Residential (25 kW)",
            completed: 12,
            pending: 3,
            image: "https://cdn-icons-png.flaticon.com/512/219/219970.png",
            joinDate: "2023-01-15",
            performance: {
                leads: { total: 12, active: 10, completed: 75 },
                survey: { total: 5, active: 4, completed: 75 },
                quote: { total: 10, active: 8, completed: 60 },
                projectSignup: { total: 5, active: 3, completed: 50 },
                install: { total: 4, active: 3, completed: 80 },
                services: { total: 3, active: 2, completed: 66 }
            },
            projects: [
                {
                    name: "Solar Home Project",
                    size: "5 kW",
                    date: "2023-02-15",
                    amount: 45000,
                    status: "Completed"
                },
                {
                    name: "Commercial Solar",
                    size: "10 kW",
                    date: "2023-03-10",
                    amount: 80000,
                    status: "In Progress"
                }
            ]
        },
        {
            name: "Jay Kumar",
            role: "Dealer Manager",
            email: "jane@example.com",
            phone: "+9876543210",
            district: "ahmedabad",
            projectType: "Commercial (15 kW)",
            completed: 8,
            pending: 5,
            image: "https://cdn-icons-png.flaticon.com/512/219/219970.png",
            joinDate: "2023-02-20",
            performance: {
                leads: { total: 15, active: 8, completed: 53 },
                survey: { total: 7, active: 3, completed: 43 },
                quote: { total: 12, active: 6, completed: 50 },
                projectSignup: { total: 6, active: 2, completed: 33 },
                install: { total: 5, active: 2, completed: 40 },
                services: { total: 4, active: 1, completed: 25 }
            },
            projects: [
                {
                    name: "Industrial Solar",
                    size: "50 kW",
                    date: "2023-04-05",
                    amount: 250000,
                    status: "In Progress"
                }
            ]
        }
    ]);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedState, setSelectedState] = useState('');

    // Fetch initial data (States)
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await locationAPI.getAllStates({ isActive: true });
                if (response.data && response.data.data) {
                    setStates(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        };

        fetchStates();
    }, []);

    // Fetch districts when a state is selected
    const handleStateChange = async (e) => {
        const stateId = e.target.value;
        setSelectedState(stateId);
        setSelectedDistrict('all');

        if (stateId) {
            try {
                const response = await locationAPI.getAllDistricts({ stateId, isActive: true });
                if (response.data && response.data.data) {
                    setDistricts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
    };

    const performanceMetrics = {
        leads: { color: '#dc2626', lightColor: '#fecaca' },
        survey: { color: '#0891b2', lightColor: '#cffafe' },
        quote: { color: '#16a34a', lightColor: '#bbf7d0' },
        projectSignup: { color: '#f59e0b', lightColor: '#fef3c7' },
        installation: { color: '#8b5cf6', lightColor: '#ddd6fe' }
    };

    const chartOptions = {
        chart: {
            type: 'radialBar',
            toolbar: { show: false }
        },
        plotOptions: {
            radialBar: {
                hollow: { size: '55%' },
                dataLabels: {
                    name: { show: false },
                    value: { show: true, fontSize: '12px', offsetY: 5 }
                }
            }
        },
        colors: ['#dc2626'],
        labels: ['']
    };

    const renderManagerCards = () => {
        const filtered = selectedDistrict === 'all'
            ? managers
            : managers.filter(m => m.district === selectedDistrict || m.districtId === selectedDistrict);

        return filtered.map((manager, index) => (
            <div key={index} className="card rounded-xl shadow-sm border-0 mb-3 bg-white hover:translate-y-[-3px] transition-all duration-300">
                <div className="p-6">
                    <div className="relative">
                        <div className="absolute top-0 right-0">
                            <div className="relative">
                                <MoreVertical
                                    className="cursor-pointer text-gray-500 hover:text-gray-800"
                                    size={20}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                                    }}
                                />
                                {openDropdownIndex === index && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-100 z-50 py-1">
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                viewProfile(manager.name);
                                                setOpenDropdownIndex(null);
                                            }}
                                        >
                                            <Eye size={16} className="mr-2" /> View Profile
                                        </a>
                                        <div className="border-t my-1"></div>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setResetPasswordData({ ...resetPasswordData, managerName: manager.name });
                                                setShowResetPasswordModal(true);
                                                setOpenDropdownIndex(null);
                                            }}
                                        >
                                            <RefreshCw size={16} className="mr-2" /> Reset Password
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-2 hover:bg-gray-100"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                alert(`Freeze Account of ${manager.name}`);
                                                setOpenDropdownIndex(null);
                                            }}
                                        >
                                            <Ban size={16} className="mr-2" /> Freeze Account
                                        </a>
                                        <div className="border-t my-1"></div>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (window.confirm(`Are you sure you want to delete ${manager.name}?`)) {
                                                    alert(`${manager.name} has been deleted`);
                                                }
                                                setOpenDropdownIndex(null);
                                            }}
                                        >
                                            <Trash2 size={16} className="mr-2" /> Delete
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mb-4">
                        <img
                            src={manager.image}
                            className="w-[60px] h-[60px] rounded-full object-cover mr-4"
                            alt="avatar"
                        />
                        <div>
                            <h5 className="text-xl font-semibold mb-1">{manager.name}</h5>
                            <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">{manager.role}</span>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <strong className="text-gray-900 block mb-1">Projects</strong>
                            <span className="mr-3">
                                <Circle size={12} className="inline text-green-500 mr-1 fill-current" />
                                {manager.completed} Completed
                            </span>
                            <span>
                                <Circle size={12} className="inline text-yellow-500 mr-1 fill-current" />
                                {manager.pending} Pending
                            </span>
                        </div>

                        <div>
                            <strong className="text-gray-900 block mb-1">Email</strong>
                            <Mail size={14} className="inline text-red-500 mr-1" />
                            {manager.email}
                        </div>

                        <div>
                            <strong className="text-gray-900 block mb-1">Contact</strong>
                            <Phone size={14} className="inline text-blue-500 mr-1" />
                            {manager.phone}
                        </div>

                        <div>
                            <strong className="text-gray-900 block mb-1">Project Type</strong>
                            <Activity size={14} className="inline text-green-500 mr-1" />
                            {manager.projectType}
                        </div>

                        <div>
                            <strong className="text-gray-900 block mb-1">District</strong>
                            <MapPin size={14} className="inline text-red-500 mr-1" />
                            {manager.district.charAt(0).toUpperCase() + manager.district.slice(1)}
                        </div>
                    </div>
                </div>
            </div>
        ));
    };

    const viewProfile = (managerName) => {
        const manager = managers.find(m => m.name === managerName);
        if (manager) {
            setSelectedManager(manager);
            setShowProfileView(true);
        }
    };

    const closeProfile = () => {
        setShowProfileView(false);
        setSelectedManager(null);
    };

    const handlePasswordReset = () => {
        if (resetPasswordData.newPassword.length < 6) {
            alert("New password must be at least 6 characters long.");
            return;
        }
        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        alert(`Password for ${resetPasswordData.managerName} successfully reset!`);
        setShowResetPasswordModal(false);
        setResetPasswordData({ managerName: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="container mx-auto px-4 py-3 max-w-7xl">
            {/* Main Content */}
            <div className={showProfileView ? 'hidden' : ''}>
                <div className="bg-white rounded-lg shadow-sm mb-3 border-0">
                    <div className="p-6">
                        <h3 className="text-2xl mb-1 text-blue-600 font-semibold">Dealer Managers</h3>
                        <p className="text-gray-500 mb-0">Performance overview of your team</p>
                    </div>
                </div>

                <br />

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                            value={selectedState}
                            onChange={handleStateChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select State</option>
                            {states.map((state) => (
                                <option key={state._id} value={state._id}>{state.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* District Cards */}
                <div className="flex overflow-x-auto pb-3 mb-1 space-x-3">
                    <div
                        key="all"
                        className={`district-card min-w-[160px] cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-300 ${selectedDistrict === 'all' ? '!bg-[#35a5da] border-blue-500 text-white' : ''
                            }`}
                        onClick={() => setSelectedDistrict('all')}
                    >
                        <div className="p-4 text-center">
                            <MapPin className={`mx-auto mb-1 ${selectedDistrict === 'all' ? 'text-white' : 'text-blue-600'}`} size={20} />
                            <div className="text-sm font-semibold">All Districts</div>
                        </div>
                    </div>
                    {districts.map((district) => (
                        <div
                            key={district._id}
                            className={`district-card min-w-[160px] cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-300 ${selectedDistrict === district._id ? '!bg-[#35a5da] border-blue-500 text-white' : ''
                                }`}
                            onClick={() => setSelectedDistrict(district._id)}
                        >
                            <div className="p-4 text-center">
                                <MapPin className={`mx-auto mb-1 ${selectedDistrict === district._id ? 'text-white' : 'text-blue-600'}`} size={20} />
                                <div className="text-sm font-semibold">{district.name}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Manager Cards */}
                <div className="mt-3 space-y-3">
                    {renderManagerCards()}
                    {selectedDistrict !== 'all' && managers.filter(m => m.district === selectedDistrict).length === 0 && (
                        <div className="alert bg-gray-50 text-center p-4 rounded">
                            No managers found for this district.
                        </div>
                    )}
                </div>
            </div>

            {/* Profile View */}
            {selectedManager && (
                <div className={showProfileView ? '' : 'hidden'}>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-semibold mb-0">Dealer Manager Details</h4>
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={closeProfile}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow-sm mb-4 border-0 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-2xl mr-4 uppercase">
                                {selectedManager.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold mb-0">{selectedManager.name}</h4>
                                <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">{selectedManager.role}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                                <Phone size={16} className="text-blue-600 mr-2" />
                                <div>
                                    <div className="text-gray-500 uppercase text-xs font-medium">Contact</div>
                                    <strong className="text-gray-900">{selectedManager.phone}</strong>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Mail size={16} className="text-red-500 mr-2" />
                                <div>
                                    <div className="text-gray-500 uppercase text-xs font-medium">Email</div>
                                    <strong className="text-gray-900">{selectedManager.email}</strong>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Calendar size={16} className="text-green-600 mr-2" />
                                <div>
                                    <div className="text-gray-500 uppercase text-xs font-medium">Join Date</div>
                                    <strong className="text-gray-900">{selectedManager.joinDate}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h5 className="text-lg font-semibold mb-3">Performance Overview</h5>

                    {/* Performance Boxes */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                        <div className="border rounded-lg p-4 text-center shadow-sm">
                            <Activity className="mx-auto mb-2 text-blue-600" size={24} />
                            <h6 className="text-sm font-semibold mb-0">Leads</h6>
                            <p className="font-bold mb-0">{selectedManager.performance.leads.total}</p>
                        </div>
                        <div className="border rounded-lg p-4 text-center shadow-sm">
                            <FileText className="mx-auto mb-2 text-cyan-600" size={24} />
                            <h6 className="text-sm font-semibold mb-0">Survey</h6>
                            <p className="font-bold mb-0">{selectedManager.performance.survey.total}</p>
                        </div>
                        <div className="border rounded-lg p-4 text-center shadow-sm">
                            <FileText className="mx-auto mb-2 text-yellow-600" size={24} />
                            <h6 className="text-sm font-semibold mb-0">Quote</h6>
                            <p className="font-bold mb-0">{selectedManager.performance.quote.total}</p>
                        </div>
                        <div className="border rounded-lg p-4 text-center shadow-sm">
                            <PenSquare className="mx-auto mb-2 text-gray-600" size={24} />
                            <h6 className="text-sm font-semibold mb-0">Project Signup</h6>
                            <p className="font-bold mb-0">{selectedManager.performance.projectSignup.total}</p>
                        </div>
                        <div className="border rounded-lg p-4 text-center shadow-sm">
                            <Wrench className="mx-auto mb-2 text-gray-900" size={24} />
                            <h6 className="text-sm font-semibold mb-0">Install</h6>
                            <p className="font-bold mb-0">{selectedManager.performance.install.total}</p>
                        </div>
                        <div className="border rounded-lg p-4 text-center shadow-sm">
                            <Settings className="mx-auto mb-2 text-yellow-600" size={24} />
                            <h6 className="text-sm font-semibold mb-0">Services</h6>
                            <p className="font-bold mb-0">{selectedManager.performance.services.total}</p>
                        </div>
                    </div>

                    <h5 className="text-lg font-semibold mb-3">Performance Metrics</h5>

                    {/* Performance Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                        {/* Leads */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border-0">
                            <div className="flex justify-between items-start">
                                <div className="text-red-600 font-bold text-xl">75%</div>
                                <div className="w-12 h-12 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center">
                                    <Circle size={12} className="text-red-600 fill-current" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <h6 className="text-sm font-semibold mb-1">Leads</h6>
                                <small className="text-gray-500 block">
                                    <strong className="text-red-600">Active 10</strong>
                                </small>
                                <small className="text-gray-500">75% Completed</small>
                            </div>
                        </div>

                        {/* Survey */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border-0">
                            <div className="flex justify-between items-start">
                                <div className="text-cyan-600 font-bold text-xl">75%</div>
                                <div className="w-12 h-12 rounded-full bg-cyan-100 border-4 border-cyan-200 flex items-center justify-center">
                                    <Circle size={12} className="text-cyan-600 fill-current" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <h6 className="text-sm font-semibold mb-1">Survey</h6>
                                <small className="text-gray-500 block">
                                    <strong className="text-cyan-600">Active 4</strong>
                                </small>
                                <small className="text-gray-500">75% Completed</small>
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border-0">
                            <div className="flex justify-between items-start">
                                <div className="text-green-600 font-bold text-xl">60%</div>
                                <div className="w-12 h-12 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center">
                                    <Circle size={12} className="text-green-600 fill-current" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <h6 className="text-sm font-semibold mb-1">Quote</h6>
                                <small className="text-gray-500 block">
                                    <strong className="text-green-600">Active 8</strong>
                                </small>
                                <small className="text-gray-500">60% Completed</small>
                            </div>
                        </div>

                        {/* Project Signup */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border-0">
                            <div className="flex justify-between items-start">
                                <div className="text-yellow-500 font-bold text-xl">50%</div>
                                <div className="w-12 h-12 rounded-full bg-yellow-100 border-4 border-yellow-200 flex items-center justify-center">
                                    <Circle size={12} className="text-yellow-500 fill-current" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <h6 className="text-sm font-semibold mb-1">Project Signup</h6>
                                <small className="text-gray-500 block">
                                    <strong className="text-yellow-500">Active 3</strong>
                                </small>
                                <small className="text-gray-500">50% Completed</small>
                            </div>
                        </div>

                        {/* Installation */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border-0">
                            <div className="flex justify-between items-start">
                                <div className="text-purple-600 font-bold text-xl">80%</div>
                                <div className="w-12 h-12 rounded-full bg-purple-100 border-4 border-purple-200 flex items-center justify-center">
                                    <Circle size={12} className="text-purple-600 fill-current" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <h6 className="text-sm font-semibold mb-1">Installation</h6>
                                <small className="text-gray-500 block">
                                    <strong className="text-purple-600">Active 3</strong>
                                </small>
                                <small className="text-gray-500">80% Completed</small>
                            </div>
                        </div>
                    </div>

                    <h5 className="text-lg font-semibold mb-3">Projects ({selectedManager.projects.length})</h5>

                    {/* Projects List */}
                    {selectedManager.projects.map((project, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-sm mb-2 border-0">
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h6 className="text-base font-semibold mb-1">{project.name}</h6>
                                        <small className="text-gray-500">
                                            <Bolt size={12} className="inline text-yellow-500 mr-1" />
                                            {project.size}
                                            <Calendar size={12} className="inline ml-3 mr-1" />
                                            {project.date}
                                            <IndianRupee size={12} className="inline ml-3 mr-1" />
                                            {project.amount.toLocaleString()}
                                        </small>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${project.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create User Button */}
            <button
                type="button"
                className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full px-6 py-3 font-semibold shadow-lg flex items-center hover:translate-y-[-2px] transition-all duration-300 z-50"
                onClick={() => navigate('/franchisee/dealer-manager/create')}
            >
                <UserPlus size={20} className="mr-2" />
                Create User
            </button>

            {/* Reset Password Modal */}
            {showResetPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-xl font-bold">Reset Password</h5>
                            <button
                                onClick={() => setShowResetPasswordModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            You are resetting the password for <strong className="text-gray-900">{resetPasswordData.managerName}</strong>. Please enter and confirm the new password.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold block mb-1">New Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                                        placeholder="Enter at least 6 characters"
                                        value={resetPasswordData.newPassword}
                                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold block mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                                        placeholder="Re-enter the new password"
                                        value={resetPasswordData.confirmPassword}
                                        onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                onClick={() => setShowResetPasswordModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={handlePasswordReset}
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseDealerManager;