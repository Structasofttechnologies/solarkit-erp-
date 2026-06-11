// FranchiseDistrictManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { locationAPI } from '../../../api/api';

const FranchiseDistrictManager = () => {
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
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [districts, setDistricts] = useState([]);

    // Sample Manager Data
    const [managers] = useState([
        {
            name: "Smith",
            role: "District Manager",
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
            role: "District Manager",
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

    // Fetch districts on mount
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    setDistricts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

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

    const renderManagerCards = () => {
        const filtered = selectedDistrict === 'all'
            ? managers
            : managers.filter(m => m.district === selectedDistrict);

        return filtered.map((manager, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border-0 mb-3 hover:translate-y-[-3px] transition-all duration-300">
                <div className="p-6">
                    <div className="relative">
                        <div className="absolute top-0 right-0">
                            <div className="relative">
                                <MoreVertical
                                    className="cursor-pointer text-gray-600 hover:text-gray-900"
                                    size={20}
                                    onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                                />
                                {activeDropdown === index && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
                                            <button
                                                className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    viewProfile(manager.name);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <Eye size={16} className="mr-2" /> View Profile
                                            </button>
                                            <div className="border-t my-1"></div>
                                            <button
                                                className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    setResetPasswordData({ ...resetPasswordData, managerName: manager.name });
                                                    setShowResetPasswordModal(true);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <RefreshCw size={16} className="mr-2" /> Reset Password
                                            </button>
                                            <button
                                                className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    alert(`Freeze Account of ${manager.name}`);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <Ban size={16} className="mr-2" /> Freeze Account
                                            </button>
                                            <div className="border-t my-1"></div>
                                            <button
                                                className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-gray-100"
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete ${manager.name}?`)) {
                                                        alert(`${manager.name} has been deleted`);
                                                    }
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <Trash2 size={16} className="mr-2" /> Delete
                                            </button>
                                        </div>
                                    </>
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

    return (
        <div className="container mx-auto px-4 py-3 max-w-7xl">
            {/* Main Content */}
            {!showProfileView && (
                <div>
                    <div className="bg-white rounded-lg shadow-sm mb-3 border-0">
                        <div className="p-6">
                            <h3 className="text-2xl mb-1 text-blue-600 font-semibold">District Managers</h3>
                            <p className="text-gray-500 mb-0">Performance overview of your team</p>
                        </div>
                    </div>

                    {/* District Cards */}
                    <div className="flex overflow-x-auto pb-3 mb-1 space-x-3">
                        <div
                            className={`min-w-[160px] cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-300 ${selectedDistrict === 'all' ? 'bg-blue-500 border-blue-500 text-white' : 'hover:border-blue-300'
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
                                className={`min-w-[160px] cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-300 ${selectedDistrict === district.name.toLowerCase() ? 'bg-blue-500 border-blue-500 text-white' : 'hover:border-blue-300'
                                    }`}
                                onClick={() => setSelectedDistrict(district.name.toLowerCase())}
                            >
                                <div className="p-4 text-center">
                                    <MapPin className={`mx-auto mb-1 ${selectedDistrict === district.name.toLowerCase() ? 'text-white' : 'text-blue-600'}`} size={20} />
                                    <div className="text-sm font-semibold">{district.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Manager Cards */}
                    <div className="mt-3 space-y-3">
                        {renderManagerCards()}
                        {selectedDistrict !== 'all' && managers.filter(m => m.district === selectedDistrict).length === 0 && (
                            <div className="bg-white text-center p-8 rounded-xl shadow-sm border border-dashed border-gray-300">
                                <p className="text-gray-500">No managers found for this district.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Profile View */}
            {showProfileView && selectedManager && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <button onClick={closeProfile} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                            <h4 className="text-2xl font-bold text-gray-800 mb-0">District Manager Details</h4>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <img src={selectedManager.image} className="w-20 h-20 rounded-full mr-6 border-4 border-blue-50" alt="profile" />
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-1">{selectedManager.name}</h2>
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                        {selectedManager.role}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <Phone size={20} className="text-blue-600 mr-4" />
                                    <div>
                                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Contact</div>
                                        <div className="font-semibold">{selectedManager.phone}</div>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <Mail size={20} className="text-red-500 mr-4" />
                                    <div>
                                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Email</div>
                                        <div className="font-semibold">{selectedManager.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <Calendar size={20} className="text-green-600 mr-4" />
                                    <div>
                                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Join Date</div>
                                        <div className="font-semibold">{selectedManager.joinDate}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h5 className="text-xl font-bold text-gray-800 mb-4">Performance Insights</h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {Object.entries(selectedManager.performance).map(([key, data]) => (
                            <div key={key} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3">
                                    {key === 'leads' && <Activity size={24} />}
                                    {key === 'survey' && <FileText size={24} />}
                                    {key === 'quote' && <IndianRupee size={24} />}
                                    {key === 'projectSignup' && <PenSquare size={24} />}
                                    {key === 'install' && <Wrench size={24} />}
                                    {key === 'services' && <Settings size={24} />}
                                </div>
                                <h6 className="text-sm font-semibold capitalize text-gray-600 mb-1">{key}</h6>
                                <div className="text-2xl font-bold text-gray-800">{data.total}</div>
                                <div className="text-xs text-green-600 font-medium mt-1">{data.completed}% Efficiency</div>
                            </div>
                        ))}
                    </div>

                    <h5 className="text-xl font-bold text-gray-800 mb-4">Active Projects</h5>
                    <div className="grid grid-cols-1 gap-4">
                        {selectedManager.projects.map((project, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-hover hover:shadow-md">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center mr-4">
                                        <Bolt className="text-yellow-600" size={24} />
                                    </div>
                                    <div>
                                        <h6 className="text-lg font-bold text-gray-800 mb-1">{project.name}</h6>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="mr-4">{project.size}</span>
                                            <span className="flex items-center">
                                                <IndianRupee size={14} className="mr-1" />
                                                {project.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                type="button"
                className="fixed bottom-10 right-10 bg-blue-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50 group"
                onClick={() => navigate('/franchisee/district-manager/create')}
                title="Create New District Manager"
            >
                <UserPlus size={28} />
                <span className="absolute right-full mr-4 bg-gray-800 text-white px-3 py-1.5 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
                    Create New Manager
                </span>
            </button>

            {/* Reset Password Modal */}
            {showResetPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                            <h5 className="text-xl font-bold">Secure Reset</h5>
                            <button onClick={() => setShowResetPasswordModal(false)} className="hover:rotate-90 transition-transform duration-300">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-600 mb-6">Resetting password for <span className="font-bold text-gray-800">{resetPasswordData.managerName}</span>. Please use a strong password.</p>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter strong password"
                                            value={resetPasswordData.newPassword}
                                            onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Repeat password"
                                            value={resetPasswordData.confirmPassword}
                                            onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => setShowResetPasswordModal(false)} className="px-6 py-2 text-gray-600 font-bold hover:text-gray-800 transition-colors">Cancel</button>
                            <button onClick={handlePasswordReset} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Update Password</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseDistrictManager;