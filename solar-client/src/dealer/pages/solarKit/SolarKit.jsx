import React, { useState, useEffect } from 'react';
import {
    SolarPanel,
    Zap,
    Home,
    Building2,
    Factory,
    Globe,
    Briefcase,
    Info,
    Tag,
    Bolt,
    ChartLine,
    Power,
    Cpu,
    Check,
    X,
    Filter,
    XCircle,
    CheckCircle,
    Clock,
    AlertCircle,
    DollarSign,
    FileText,
    Table,
    Edit,
    Trash2,
    Plus,
    Save
} from 'lucide-react';
import { solarKitAPI } from '../../../api/api';

const DealerSolarKit = () => {
    // GST and company margin
    const GST = 18;
    const COMPANY_MARGIN = 15000;

    // State
    const [solarKits, setSolarKits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'All',
        type: 'All',
        kwRange: 'All',
        status: 'All',
        subCategory: 'All'
    });
    const [showFilters, setShowFilters] = useState(false);

    // Modal States
    const [selectedKitForDetails, setSelectedKitForDetails] = useState(null);
    const [selectedKitForPrice, setSelectedKitForPrice] = useState(null);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [editingKit, setEditingKit] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        kw: '',
        inverter: '',
        panels: '',
        price: '',
        warranty: '',
        efficiency: '',
        description: '',
        panelBrand: '',
        inverterBrand: '',
        status: 'In-Stock',
        type: 'Hybrid',
        category: 'Roof Top',
        subCategory: 'Residential',
        commissionRate: 0,
        panelWatt: '',
        technology: '',
        priceBreakdown: [] // Simplified for now, can be expanded
    });

    // Fetch Kits
    const fetchKits = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.category !== 'All') params.category = filters.category;
            if (filters.type !== 'All') params.type = filters.type;
            if (filters.status !== 'All') params.status = filters.status;
            if (filters.subCategory !== 'All') params.subCategory = filters.subCategory;
            if (filters.kwRange !== 'All') params.kwRange = filters.kwRange;

            const response = await solarKitAPI.getAll(params);
            setSolarKits(response.data);
        } catch (error) {
            console.error('Error fetching solar kits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKits();
    }, [filters]);

    // Handlers
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [filterName]: value };
            if (filterName === 'category') {
                newFilters.subCategory = 'All';
            }
            return newFilters;
        });
    };

    const clearFilters = () => {
        setFilters({
            category: 'All',
            type: 'All',
            kwRange: 'All',
            status: 'All',
            subCategory: 'All'
        });
    };

    const handleDeleteKit = async (id) => {
        if (window.confirm('Are you sure you want to delete this solar kit?')) {
            try {
                await solarKitAPI.delete(id);
                fetchKits();
            } catch (error) {
                console.error('Error deleting kit:', error);
                alert('Failed to delete kit');
            }
        }
    };

    const handleEditKit = (kit) => {
        setEditingKit(kit);
        setFormData({
            ...kit,
            priceBreakdown: kit.priceBreakdown || []
        });
        setShowAddEditModal(true);
    };

    const handleAddKit = () => {
        setEditingKit(null);
        setFormData({
            name: '',
            brand: 'Luminous', // Defaults
            kw: '5-10 kW',
            inverter: '',
            panels: '',
            price: 0,
            warranty: '10 years',
            efficiency: '20%',
            description: '',
            panelBrand: 'Adani',
            inverterBrand: 'Luminous',
            status: 'In-Stock',
            type: 'Hybrid',
            category: 'Roof Top',
            subCategory: 'Residential',
            commissionRate: 0,
            panelWatt: '500W',
            technology: 'Mono PERC',
            priceBreakdown: []
        });
        setShowAddEditModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingKit) {
                await solarKitAPI.update(editingKit._id, formData);
            } else {
                await solarKitAPI.create(formData);
            }
            setShowAddEditModal(false);
            fetchKits();
        } catch (error) {
            console.error('Error saving kit:', error);
            alert('Failed to save kit');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper functions (same as before)
    const formatPrice = (price) => {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const calculateFinalPrice = (kit) => {
        const calculatedPrice = Number(kit.price) + COMPANY_MARGIN;
        const gstAmount = (calculatedPrice / 100) * GST;
        return calculatedPrice + gstAmount;
    };

    // ... (rest of the helper functions from original file: getStatusClass, etc. converted to use new data structure if needed)
    const getStatusClass = (status) => status === 'In-Stock' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white';
    const getTypeClass = (type) => {
        switch (type) {
            case 'Hybrid': return 'bg-[#a855f7] text-white';
            case 'On-Grid': return 'bg-[#3b82f6] text-white';
            case 'Off-Grid': return 'bg-[#f59e0b] text-white';
            default: return 'bg-gray-500 text-white';
        }
    };
    const getSubCategoryClass = (subCat) => {
        switch (subCat) {
            case 'Commercial': return 'bg-[#f97316] text-white';
            case 'Residential': return 'bg-[#166534] text-white';
            case 'Industrial': return 'bg-[#7e22ce] text-white';
            case 'Mega': return 'bg-[#dc2626] text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    // Options (can be dynamic later)
    const categoryOptions = ['All', 'Roof Top', 'Ground Mount', 'Carport'];
    const typeOptions = ['All', 'On-Grid', 'Off-Grid', 'Hybrid'];
    const kwOptions = ['All', '1-5 kW', '5-10 kW', '10-15 kW', '15+ kW'];

    return (
        <div className="min-h-screen bg-gray-50 font-poppins">
            <div className="container-fluid px-4 py-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Solar Kits</h1>
                        <p className="text-gray-500">Browse and manage our premium solar kit collection</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleAddKit}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center shadow-sm"
                        >
                            <Plus size={18} className="mr-1" />
                            Add Kit
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-white border rounded-lg px-4 py-2 flex items-center hover:bg-gray-50"
                        >
                            <Filter size={18} className="mr-2" />
                            <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs ml-1">
                                {solarKits.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                {showFilters && (
                    <div className="bg-[#f8fafc] rounded-[16px] border border-gray-100 p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[17px] font-bold text-[#1e293b]">Advanced Filters</h3>
                            <div className="bg-[#0bd2c3] text-[#0f172a] text-[12px] font-bold px-3 py-1.5 rounded-[4px]">
                                {solarKits.length} kits match your filters
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="flex items-center space-x-3">
                                <label className="text-[13px] text-gray-500 whitespace-nowrap hidden lg:block">Category</label>
                                <select
                                    className="w-full border border-gray-200 rounded-[8px] p-2.5 text-[14px] focus:outline-none bg-white shadow-sm appearance-none"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center space-x-3">
                                <label className="text-[13px] text-gray-500 whitespace-nowrap hidden lg:block">System Type</label>
                                <select
                                    className="w-full border border-gray-200 rounded-[8px] p-2.5 text-[14px] focus:outline-none bg-white shadow-sm appearance-none"
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center space-x-3">
                                <label className="text-[13px] text-gray-500 whitespace-nowrap hidden lg:block">Capacity</label>
                                <select
                                    className="w-full border border-gray-200 rounded-[8px] p-2.5 text-[14px] focus:outline-none bg-white shadow-sm appearance-none"
                                    value={filters.kwRange}
                                    onChange={(e) => handleFilterChange('kwRange', e.target.value)}
                                >
                                    {kwOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center justify-end">
                                <button onClick={clearFilters} className="text-red-500 text-[13px] font-medium hover:text-red-600 transition-colors">
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] text-gray-500 mb-2">Stock Status</label>
                            <div className="flex bg-[#f1f5f9] rounded-[8px] p-1.5">
                                <button
                                    className={`flex-1 py-3 px-4 rounded-[6px] text-[15px] transition-colors flex flex-col justify-center items-center ${filters.status === 'All' ? 'bg-[#007bff] text-white shadow-sm font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                                    onClick={() => handleFilterChange('status', 'All')}
                                >
                                    <span className="mb-0.5">All</span>
                                    <span className="text-[12px] opacity-80">{solarKits.length}</span>
                                </button>
                                <button
                                    className={`flex-1 py-3 px-4 rounded-[6px] text-[15px] transition-colors flex flex-col justify-center items-center ${filters.status === 'In-Stock' ? 'bg-[#007bff] text-white shadow-sm font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                                    onClick={() => handleFilterChange('status', 'In-Stock')}
                                >
                                    <span className="flex items-center mb-0.5"><CheckCircle size={16} className="mr-1" /> In Stock</span>
                                    <span className="text-[12px] opacity-80">{solarKits.filter(k => k.status === 'In-Stock').length}</span>
                                </button>
                                <button
                                    className={`flex-1 py-3 px-4 rounded-[6px] text-[15px] transition-colors flex flex-col justify-center items-center ${filters.status === 'Out-of-Stock' ? 'bg-[#007bff] text-white shadow-sm font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                                    onClick={() => handleFilterChange('status', 'Out-of-Stock')}
                                >
                                    <span className="flex items-center mb-0.5"><XCircle size={16} className="mr-1" /> Out of Stock</span>
                                    <span className="text-[12px] opacity-80">{solarKits.filter(k => k.status === 'Out-of-Stock').length}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-20">Loading solar kits...</div>
                ) : (
                    /* Solar Kits Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {solarKits.map((kit) => {
                            const finalPrice = calculateFinalPrice(kit);

                            return (
                                <div key={kit._id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all relative group flex flex-col justify-between">
                                    {/* Edit/Delete Actions */}
                                    <div className="absolute top-2 right-2 flex space-x-1 opacity-100 z-10">
                                        <button
                                            onClick={() => handleEditKit(kit)}
                                            className="bg-white p-2 rounded-full shadow-sm text-blue-600 hover:bg-blue-50"
                                            title="Edit Kit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteKit(kit._id)}
                                            className="bg-white p-2 rounded-full shadow-sm text-red-600 hover:bg-red-50"
                                            title="Delete Kit"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="p-5 h-full flex flex-col" onClick={() => { setSelectedKitForDetails(kit); setShowDetailsModal(true); }}>
                                        {/* Image/Brand Section */}
                                        <div className="flex mb-6 mt-2">
                                            <div className="flex-1 relative">
                                                <div className="absolute top-0 left-0 bg-[#eff6ff] text-gray-700 rounded-[6px] p-2 flex items-center justify-center">
                                                    <Info size={16} />
                                                </div>
                                                <div className="text-center pt-8 text-[12px] font-semibold text-gray-800">{kit.panelBrand}</div>
                                            </div>
                                            <div className="flex-1 relative">
                                                <div className="absolute top-0 right-10 bg-[#f0fdf4] text-[#22c55e] rounded-[6px] p-2 flex items-center justify-center">
                                                    <Zap size={16} />
                                                </div>
                                                <div className="text-right pt-8 pr-8 text-[12px] font-semibold text-gray-800">{kit.inverterBrand}</div>
                                            </div>
                                        </div>

                                        {/* Status Badges */}
                                        <div className="flex justify-between items-center mb-5">
                                            <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold ${getStatusClass(kit.status)}`}>
                                                {kit.status}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold ${getTypeClass(kit.type)}`}>
                                                {kit.type}
                                            </span>
                                        </div>

                                        {/* Kit Info */}
                                        <h6 className="font-bold text-[16px] text-gray-900 mb-2 truncate" title={kit.name}>
                                            <span className={`${selectedKitForDetails?._id === kit._id ? 'bg-[#3b82f6] text-white px-1 mr-1' : ''}`}>{kit.name}</span>
                                        </h6>
                                        <div className="flex items-center mb-5 relative">
                                            <Zap size={14} className="text-[#eab308] mr-1.5" fill="currentColor" />
                                            <span className="text-[12px] text-gray-700 font-bold mr-2">{kit.brand}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-[4px] font-bold ${getSubCategoryClass(kit.subCategory)}`}>
                                                {kit.subCategory}
                                            </span>
                                        </div>

                                        {/* Specs Grid */}
                                        <div className="grid grid-cols-2 mt-auto mb-6">
                                            <div className="py-3 px-1 border-r border-b border-gray-100 flex flex-col justify-center">
                                                <div className="flex items-center text-[13px] font-bold text-gray-800 mb-1">
                                                    <Zap size={14} className="text-[#eab308] mr-1" />
                                                    ↑{kit.kw}
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-500">Capacity</span>
                                            </div>
                                            <div className="py-3 pl-4 border-b border-gray-100 flex flex-col justify-center">
                                                <div className="text-[13px] font-bold text-gray-800 mb-1">
                                                    {kit.efficiency}
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-500">Efficiency</span>
                                            </div>
                                            <div className="py-3 px-1 border-r border-gray-100 flex flex-col justify-center">
                                                <div className="flex items-center text-[13px] font-bold text-gray-800 mb-1">
                                                    <Power size={14} className="text-[#22c55e] mr-1" />
                                                    {kit.panelWatt}
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-500">Panel Watt</span>
                                            </div>
                                            <div className="py-3 pl-4 flex flex-col justify-center">
                                                <div className="flex items-center text-[13px] font-bold text-gray-800 mb-1">
                                                    <SolarPanel size={14} className="text-gray-800 mr-1" />
                                                    {kit.technology}
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-500">Technology</span>
                                            </div>
                                        </div>

                                        {/* Price Footer */}
                                        <div className="flex justify-between items-center mt-2">
                                            <div className={`text-[16px] font-bold ${kit.status === 'Out-of-Stock' ? 'text-[#22c55e]' : 'text-[#22c55e]'}`}>
                                                {kit.status === 'Out-of-Stock' ? 'Out of Stock' : `₹${formatPrice(finalPrice)}/kW`}
                                            </div>
                                            <div className="flex space-x-2">
                                                {kit.status === 'Out-of-Stock' ? (
                                                    <button className="bg-gray-400 text-white text-[11px] px-3.5 py-1.5 rounded-[4px] font-bold cursor-not-allowed">Not Available</button>
                                                ) : (
                                                    <>
                                                        <button className="bg-[#3b82f6] text-white text-[11px] px-3.5 py-1.5 rounded-[4px] font-bold hover:bg-blue-600 transition-colors shadow-sm">Price Details</button>
                                                        <button className="bg-[#f59e0b] text-white text-[11px] px-3.5 py-1.5 rounded-[4px] font-bold hover:bg-orange-600 transition-colors shadow-sm">Details</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showAddEditModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddEditModal(false)}></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                                <form onSubmit={handleFormSubmit}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                    {editingKit ? 'Edit Solar Kit' : 'Add New Solar Kit'}
                                                </h3>
                                                <div className="mt-4 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Brand</label>
                                                        <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Capacity (e.g. 5-10 kW)</label>
                                                        <input type="text" name="kw" value={formData.kw} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Price (Base)</label>
                                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Inverter</label>
                                                        <input type="text" name="inverter" value={formData.inverter} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Panels</label>
                                                        <input type="text" name="panels" value={formData.panels} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                                        <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                                            {categoryOptions.filter(o => o !== 'All').map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                                        <select name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                                            {typeOptions.filter(o => o !== 'All').map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                                        <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                                            <option value="In-Stock">In-Stock</option>
                                                            <option value="Out-of-Stock">Out-of-Stock</option>
                                                        </select>
                                                    </div>
                                                    {/* More fields as necessary */}
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                                        <textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="3"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowAddEditModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Simplified Check for Details Modal (placeholder) */}
                {showDetailsModal && selectedKitForDetails && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDetailsModal(false)}></div>
                            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto z-10 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">{selectedKitForDetails.name}</h2>
                                    <button onClick={() => setShowDetailsModal(false)}><X size={24} /></button>
                                </div>
                                <div className="space-y-2">
                                    <p><strong>Brand:</strong> {selectedKitForDetails.brand}</p>
                                    <p><strong>Type:</strong> {selectedKitForDetails.type}</p>
                                    <p><strong>Description:</strong> {selectedKitForDetails.description}</p>
                                    <p><strong>Warranty:</strong> {selectedKitForDetails.warranty}</p>
                                    <button onClick={() => { setShowDetailsModal(false); setShowPriceModal(true); setSelectedKitForPrice(selectedKitForDetails) }} className="text-blue-600 underline text-sm">View Price Breakdown</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Simplified Price Modal (placeholder) */}
                {showPriceModal && selectedKitForPrice && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowPriceModal(false)}></div>
                            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto z-10 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Price Details</h2>
                                    <button onClick={() => setShowPriceModal(false)}><X size={24} /></button>
                                </div>
                                <div className="space-y-2">
                                    {/* You can iterate over selectedKitForPrice.priceBreakdown if it exists */}
                                    <p>Base Price: ₹{selectedKitForPrice.price}</p>
                                    <p>+ Company Margin: ₹{COMPANY_MARGIN}</p>
                                    <p>+ GST ({GST}%): ₹{((selectedKitForPrice.price + COMPANY_MARGIN) * GST / 100)}</p>
                                    <hr />
                                    <p className="font-bold">Total: ₹{calculateFinalPrice(selectedKitForPrice)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealerSolarKit;