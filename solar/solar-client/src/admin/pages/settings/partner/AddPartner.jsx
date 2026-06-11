import React, { useState, useEffect } from 'react';
import {
    getPartners, createPartner, getPartnerUsers, createPartnerUser, deletePartnerUser,
    getPartnerUserCounts, getPartnerIndustryTypes, getPartnerProfessions,
    getBusinessTypes, createBusinessType, deleteBusinessType,
    getGSTPartnerConfigs, createGSTPartnerConfig, deleteGSTPartnerConfig
} from '../../../../services/partner/partnerApi';
import { useLocations } from '../../../../hooks/useLocations';
import {
    Users, Plus, CheckCircle2, Loader, Save, X, UserPlus, Trash2,
    Building2, Shield, Phone, Mail, MapPin, CreditCard, Factory, Briefcase, ChevronDown, ChevronUp, Settings, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPartner() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [typeFormData, setTypeFormData] = useState({ name: '', isActive: true });

    // Partner User State
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [partnerUsers, setPartnerUsers] = useState([]);
    const [userCounts, setUserCounts] = useState({});
    const [expandedPartner, setExpandedPartner] = useState(null);
    const [userLoading, setUserLoading] = useState(false);

    // Form State
    const [userForm, setUserForm] = useState({
        fullName: '', email: '', mobileNumber: '', state: '', district: '',
        aadhaarNumber: '', industryType: '', professionType: '',
        hasShopOffice: false, hasGST: false, businessType: '', gstPartnerType: '', gstNumber: ''
    });

    // Dropdown Data
    const [industryTypes, setIndustryTypes] = useState([]);
    const [professions, setProfessions] = useState([]);
    const [businessTypes, setBusinessTypes] = useState([]);
    const [gstConfigs, setGSTConfigs] = useState([]);

    // GST Config Modal
    const [showGSTConfigModal, setShowGSTConfigModal] = useState(false);
    const [newBusinessTypeName, setNewBusinessTypeName] = useState('');
    const [gstConfigForm, setGSTConfigForm] = useState({ businessType: '', partnerTypes: [] });

    // All Users List State
    const [allUsers, setAllUsers] = useState([]);
    const [allUsersLoading, setAllUsersLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        partnerType: '',
        state: '',
        district: ''
    });

    const {
        states, selectedState, setSelectedState,
        districts
    } = useLocations();

    useEffect(() => {
        fetchPartners();
        fetchCounts();
        fetchBusinessTypes();
        fetchGSTConfigs();
        fetchAllUsers();
    }, []);

    useEffect(() => {
        // Trigger fetch when location filters or partner type change
        fetchAllUsers();
    }, [filters.partnerType, filters.state, filters.district]);

    const fetchAllUsers = async () => {
        try {
            setAllUsersLoading(true);
            const data = await getPartnerUsers({
                partnerType: filters.partnerType,
                state: filters.state,
                district: filters.district
            });
            setAllUsers(data);
        } catch (error) {
            console.error("Failed to fetch all users", error);
        } finally {
            setAllUsersLoading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const data = await getPartners();
            setPartners(data);
        } catch (error) {
            toast.error('Failed to load partners');
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const data = await getPartnerUserCounts();
            setUserCounts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBusinessTypes = async () => {
        try {
            const data = await getBusinessTypes();
            setBusinessTypes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchGSTConfigs = async () => {
        try {
            const data = await getGSTPartnerConfigs();
            setGSTConfigs(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPartnerUsers = async (partnerTypeId) => {
        try {
            setUserLoading(true);
            const data = await getPartnerUsers({ partnerType: partnerTypeId });
            setPartnerUsers(data);
        } catch (error) {
            toast.error('Failed to load partner users');
        } finally {
            setUserLoading(false);
        }
    };

    const fetchIndustryTypes = async (partnerName) => {
        try {
            const data = await getPartnerIndustryTypes(partnerName);
            setIndustryTypes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProfessions = async (partnerName, industryTypeId) => {
        try {
            const data = await getPartnerProfessions(partnerName, undefined, undefined, industryTypeId);
            setProfessions(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Create Partner Type
    const handleSaveType = async (e) => {
        e.preventDefault();
        try {
            await createPartner(typeFormData);
            toast.success('Partner Type created');
            setShowTypeModal(false);
            setTypeFormData({ name: '', isActive: true });
            fetchPartners();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        }
    };

    // Open User Creation Modal
    const handleOpenUserModal = (partner) => {
        setSelectedPartner(partner);
        setUserForm({
            fullName: '', email: '', mobileNumber: '', state: '', district: '',
            aadhaarNumber: '', industryType: '', professionType: '',
            hasShopOffice: false, hasGST: false, businessType: '', gstPartnerType: '', gstNumber: ''
        });
        fetchIndustryTypes(partner.name);
        setShowUserModal(true);
    };

    // Toggle user list for a partner
    const handleToggleExpand = (partner) => {
        if (expandedPartner === partner._id) {
            setExpandedPartner(null);
            setPartnerUsers([]);
        } else {
            setExpandedPartner(partner._id);
            fetchPartnerUsers(partner._id);
        }
    };

    // Handle State Change
    const handleStateChange = (stateId) => {
        setUserForm(prev => ({ ...prev, state: stateId, district: '' }));
        setSelectedState(stateId);
    };

    // Handle Industry Type Change
    const handleIndustryTypeChange = (industryTypeId) => {
        setUserForm(prev => ({ ...prev, industryType: industryTypeId, professionType: '' }));
        if (industryTypeId && selectedPartner) {
            fetchProfessions(selectedPartner.name, industryTypeId);
        } else {
            setProfessions([]);
        }
    };

    // Handle GST toggle
    const handleGSTToggle = (checked) => {
        setUserForm(prev => ({
            ...prev,
            hasGST: checked,
            businessType: checked ? prev.businessType : '',
            gstPartnerType: checked ? prev.gstPartnerType : '',
            gstNumber: checked ? prev.gstNumber : ''
        }));
    };

    // Handle Business Type change → filter GST partner types
    const handleBusinessTypeChange = (businessTypeId) => {
        setUserForm(prev => ({ ...prev, businessType: businessTypeId, gstPartnerType: '' }));
    };

    // Get available partner types for selected business type from GST config
    const getGSTPartnerTypes = () => {
        if (!userForm.businessType) return [];
        const config = gstConfigs.find(c => c.businessType?._id === userForm.businessType);
        return config?.partnerTypes || [];
    };

    // Create Partner User
    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!userForm.fullName || !userForm.email || !userForm.mobileNumber || !userForm.state || !userForm.district) {
            toast.error('Please fill all required fields');
            return;
        }
        try {
            const payload = {
                ...userForm,
                partnerType: selectedPartner._id
            };
            // Remove empty optional fields
            if (!payload.businessType) delete payload.businessType;
            if (!payload.gstPartnerType) delete payload.gstPartnerType;
            if (!payload.industryType) delete payload.industryType;
            if (!payload.professionType) delete payload.professionType;

            await createPartnerUser(payload);
            toast.success('Partner User created successfully');
            setShowUserModal(false);
            fetchCounts();
            fetchAllUsers();
            if (expandedPartner === selectedPartner._id) {
                fetchPartnerUsers(selectedPartner._id);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    // Delete Partner User
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this partner user?')) {
            try {
                await deletePartnerUser(userId);
                toast.success('Partner User deleted');
                fetchCounts();
                fetchAllUsers();
                if (expandedPartner) fetchPartnerUsers(expandedPartner);
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    // Add Business Type
    const handleAddBusinessType = async () => {
        if (!newBusinessTypeName.trim()) { toast.error('Enter business type name'); return; }
        try {
            await createBusinessType({ name: newBusinessTypeName.trim() });
            toast.success('Business Type added');
            setNewBusinessTypeName('');
            fetchBusinessTypes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add');
        }
    };

    // Delete Business Type
    const handleDeleteBusinessType = async (id) => {
        if (window.confirm('Delete this business type?')) {
            try {
                await deleteBusinessType(id);
                toast.success('Business Type deleted');
                fetchBusinessTypes();
                fetchGSTConfigs();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    // Save GST Config
    const handleSaveGSTConfig = async () => {
        if (!gstConfigForm.businessType || gstConfigForm.partnerTypes.length === 0) {
            toast.error('Select business type and at least one partner type');
            return;
        }
        try {
            await createGSTPartnerConfig(gstConfigForm);
            toast.success('GST Config saved');
            setGSTConfigForm({ businessType: '', partnerTypes: [] });
            fetchGSTConfigs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save config');
        }
    };

    // Delete GST Config
    const handleDeleteGSTConfig = async (id) => {
        if (window.confirm('Delete this GST config?')) {
            try {
                await deleteGSTPartnerConfig(id);
                toast.success('GST Config deleted');
                fetchGSTConfigs();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    // Toggle partner type in GST config form
    const toggleGSTPartnerType = (partnerId) => {
        setGSTConfigForm(prev => ({
            ...prev,
            partnerTypes: prev.partnerTypes.includes(partnerId)
                ? prev.partnerTypes.filter(id => id !== partnerId)
                : [...prev.partnerTypes, partnerId]
        }));
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                    <Users className="text-blue-600 w-6 h-6" />
                    <h1 className="text-2xl font-bold text-gray-800">Partner Management</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowGSTConfigModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors">
                        <Settings size={18} /> GST Config
                    </button>
                    <button onClick={() => setShowTypeModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                        <Plus size={18} /> Add Partner Type
                    </button>
                </div>
            </div>

            {/* Partner Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {partners.map(partner => (
                    <div key={partner._id} className="bg-white rounded-xl shadow-sm border hover:border-blue-200 transition-all overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{partner.name}</h3>
                                    <div className={`mt-1 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${partner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {partner.isActive ? <CheckCircle2 size={12} /> : null}
                                        {partner.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                    {userCounts[partner._id] || 0} Users
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenUserModal(partner)}
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <UserPlus size={16} /> Create User
                                </button>
                                <button
                                    onClick={() => handleToggleExpand(partner)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    {expandedPartner === partner._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded User List */}
                        {expandedPartner === partner._id && (
                            <div className="border-t bg-gray-50 p-4 max-h-64 overflow-y-auto">
                                {userLoading ? (
                                    <div className="text-center py-4"><Loader className="animate-spin w-5 h-5 mx-auto text-blue-500" /></div>
                                ) : partnerUsers.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4 italic">No users created yet</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {partnerUsers.map(user => (
                                            <li key={user._id} className="bg-white rounded-lg p-3 shadow-sm flex justify-between items-center group">
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                                                    <p className="text-xs text-gray-500">{user.mobileNumber} • {user.district?.name || '-'}</p>
                                                </div>
                                                <button onClick={() => handleDeleteUser(user._id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 p-1 rounded transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ============== ALL PARTNER USERS DIRECTORY ============== */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Users className="text-blue-600" />
                            Partner Users Directory
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage all partner users across all types</p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search users..." 
                                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                                value={filters.search}
                                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <select 
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.partnerType}
                            onChange={e => setFilters(prev => ({ ...prev, partnerType: e.target.value }))}
                        >
                            <option value="">All Partner Types</option>
                            {partners.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <select 
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.state}
                            onChange={e => setFilters(prev => ({ ...prev, state: e.target.value, district: '' }))}
                        >
                            <option value="">All States</option>
                            {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <select 
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.district}
                            onChange={e => setFilters(prev => ({ ...prev, district: e.target.value }))}
                            disabled={!filters.state}
                        >
                            <option value="">All Districts</option>
                            {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Partner Type</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3 text-center">GST</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {allUsersLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <Loader className="animate-spin w-6 h-6 mx-auto text-blue-500" />
                                        <p className="mt-2 text-gray-500">Loading users...</p>
                                    </td>
                                </tr>
                            ) : allUsers.filter(u => 
                                u.fullName?.toLowerCase().includes(filters.search.toLowerCase()) || 
                                u.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                                u.mobileNumber?.includes(filters.search)
                            ).length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500 italic">
                                        No partner users found matching criteria
                                    </td>
                                </tr>
                            ) : (
                                allUsers.filter(u => 
                                    u.fullName?.toLowerCase().includes(filters.search.toLowerCase()) || 
                                    u.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                                    u.mobileNumber?.includes(filters.search)
                                ).map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-800">{user.fullName}</div>
                                            {user.industryType && <div className="text-xs text-gray-500">{user.industryType?.name} • {user.professionType?.name}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{user.mobileNumber}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                {user.partnerType?.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{user.district?.name}</div>
                                            <div className="text-xs text-gray-500">{user.state?.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.hasGST ? (
                                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-semibold" title={user.gstNumber}>
                                                    <Shield size={12} /> Yes
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)} 
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ============== ADD PARTNER TYPE MODAL ============== */}
            {showTypeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add Partner Type</h2>
                            <button onClick={() => setShowTypeModal(false)}><X className="text-gray-500 hover:text-gray-800" /></button>
                        </div>
                        <form onSubmit={handleSaveType} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Partner Name</label>
                                <input type="text" required placeholder="e.g., Dealer, Franchisee" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={typeFormData.name} onChange={e => setTypeFormData({ ...typeFormData, name: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setShowTypeModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <Save size={18} /> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============== CREATE USER MODAL ============== */}
            {showUserModal && selectedPartner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <UserPlus size={20} /> Create Partner User — {selectedPartner.name}
                            </h3>
                            <button onClick={() => setShowUserModal(false)} className="text-white hover:bg-blue-700 p-1.5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Users size={14} /> Full Name *</label>
                                    <input type="text" required placeholder="Enter full name" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Mail size={14} /> Email Address *</label>
                                    <input type="email" required placeholder="user@example.com" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone size={14} /> Mobile Number *</label>
                                    <input type="tel" required placeholder="9876543210" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.mobileNumber} onChange={e => setUserForm({ ...userForm, mobileNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><CreditCard size={14} /> Aadhaar Number</label>
                                    <input type="text" maxLength={12} placeholder="123456789012" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.aadhaarNumber} onChange={e => setUserForm({ ...userForm, aadhaarNumber: e.target.value.replace(/\D/g, '') })} />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14} /> State *</label>
                                    <select required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.state} onChange={e => handleStateChange(e.target.value)}>
                                        <option value="">-- Select State --</option>
                                        {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14} /> District *</label>
                                    <select required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.district} onChange={e => setUserForm({ ...userForm, district: e.target.value })}
                                        disabled={!userForm.state}>
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Industry & Profession */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Factory size={14} /> Industry Type</label>
                                    <select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.industryType} onChange={e => handleIndustryTypeChange(e.target.value)}>
                                        <option value="">-- Select Industry Type --</option>
                                        {industryTypes.map(it => <option key={it._id} value={it._id}>{it.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Briefcase size={14} /> Profession Type</label>
                                    <select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={userForm.professionType} onChange={e => setUserForm({ ...userForm, professionType: e.target.value })}
                                        disabled={!userForm.industryType || professions.length === 0}>
                                        <option value="">-- Select Profession --</option>
                                        {professions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Shop/Office & GST Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                            checked={userForm.hasShopOffice} onChange={e => setUserForm({ ...userForm, hasShopOffice: e.target.checked })} />
                                        <div>
                                            <span className="font-medium text-gray-800 flex items-center gap-1"><Building2 size={14} /> Shop / Office</span>
                                            <span className="text-xs text-gray-500 block">Does this partner have a shop/office?</span>
                                        </div>
                                    </label>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                            checked={userForm.hasGST} onChange={e => handleGSTToggle(e.target.checked)} />
                                        <div>
                                            <span className="font-medium text-gray-800 flex items-center gap-1"><Shield size={14} /> GST Registered</span>
                                            <span className="text-xs text-gray-500 block">Does this partner have GST?</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* GST Configuration Section (shown only when hasGST = true) */}
                            {userForm.hasGST && (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200 space-y-4">
                                    <h4 className="font-bold text-green-800 flex items-center gap-2"><Shield size={16} /> GST Configuration</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                                            <select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                                                value={userForm.businessType} onChange={e => handleBusinessTypeChange(e.target.value)}>
                                                <option value="">-- Select Business Type --</option>
                                                {businessTypes.map(bt => <option key={bt._id} value={bt._id}>{bt.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type</label>
                                            <select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                                                value={userForm.gstPartnerType} onChange={e => setUserForm({ ...userForm, gstPartnerType: e.target.value })}
                                                disabled={!userForm.businessType}>
                                                <option value="">-- Select Partner Type --</option>
                                                {getGSTPartnerTypes().map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                            <input type="text" placeholder="22AAAAA0000A1Z5" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                                                value={userForm.gstNumber} onChange={e => setUserForm({ ...userForm, gstNumber: e.target.value.toUpperCase() })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                                    <Save size={18} /> Create Partner User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============== GST CONFIG MODAL ============== */}
            {showGSTConfigModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                        <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Settings size={20} /> GST & Business Type Configuration
                            </h3>
                            <button onClick={() => setShowGSTConfigModal(false)} className="text-white hover:bg-purple-700 p-1.5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Business Types Management */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Building2 size={16} /> Business Types</h4>
                                <div className="flex gap-2 mb-3">
                                    <input type="text" placeholder="e.g., Private Limited, Public Limited" className="flex-1 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                                        value={newBusinessTypeName} onChange={e => setNewBusinessTypeName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddBusinessType()} />
                                    <button onClick={handleAddBusinessType} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {businessTypes.map(bt => (
                                        <span key={bt._id} className="bg-purple-50 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border border-purple-200">
                                            {bt.name}
                                            <button onClick={() => handleDeleteBusinessType(bt._id)} className="text-purple-400 hover:text-red-500"><X size={14} /></button>
                                        </span>
                                    ))}
                                    {businessTypes.length === 0 && <p className="text-gray-400 text-sm italic">No business types added yet</p>}
                                </div>
                            </div>

                            <hr />

                            {/* GST Config Mapping */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Shield size={16} /> GST → Partner Type Mapping</h4>
                                <p className="text-sm text-gray-500 mb-4">Map a Business Type to available Partner Types. When a user selects GST &amp; a Business Type, only mapped Partner Types will appear.</p>

                                <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                                        <select className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                                            value={gstConfigForm.businessType} onChange={e => setGSTConfigForm({ ...gstConfigForm, businessType: e.target.value })}>
                                            <option value="">-- Select Business Type --</option>
                                            {businessTypes.map(bt => <option key={bt._id} value={bt._id}>{bt.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Partner Types</label>
                                        <div className="flex flex-wrap gap-2">
                                            {partners.map(p => (
                                                <button key={p._id} type="button" onClick={() => toggleGSTPartnerType(p._id)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${gstConfigForm.partnerTypes.includes(p._id)
                                                        ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'}`}>
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={handleSaveGSTConfig} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                                        <Save size={16} /> Save Config
                                    </button>
                                </div>

                                {/* Existing Configs */}
                                <div className="space-y-2">
                                    {gstConfigs.map(config => (
                                        <div key={config._id} className="bg-white border rounded-lg p-3 flex justify-between items-center group">
                                            <div>
                                                <span className="font-semibold text-gray-800">{config.businessType?.name}</span>
                                                <span className="text-gray-400 mx-2">→</span>
                                                <span className="text-sm text-purple-700">{config.partnerTypes?.map(pt => pt.name).join(', ')}</span>
                                            </div>
                                            <button onClick={() => handleDeleteGSTConfig(config._id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {gstConfigs.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">No GST configs created yet</p>}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 text-right border-t flex-shrink-0">
                            <button onClick={() => setShowGSTConfigModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
