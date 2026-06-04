import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle, XCircle, Layout, Globe, BarChart2, DollarSign } from 'lucide-react';
import { campaignAPI, locationAPI } from '../../../api/api';
import toast from 'react-hot-toast';

const CampaignManagement = () => {
    const [activeTab, setActiveTab] = useState('settings');
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        defaultNameFormat: '',
        campaignTypes: [],
        cprmConversion: 0,
        companyConversion: 0,
        defaultCompanyBudget: 0,
        defaultCprmBudget: 0
    });

    const [socialPlatforms, setSocialPlatforms] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [newType, setNewType] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [configRes, socialRes, clusterRes] = await Promise.all([
                campaignAPI.getConfig(),
                campaignAPI.getAllSocialPlatforms(),
                locationAPI.getAllClusters({ isActive: true })
            ]);

            if (configRes.data.success) setConfig(configRes.data.data);
            if (socialRes.data.success) setSocialPlatforms(socialRes.data.data);
            setClusters(clusterRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load campaign data');
        } finally {
            setLoading(false);
        }
    };

    const handleConfigSave = async () => {
        try {
            setLoading(true);
            const res = await campaignAPI.updateConfig(config);
            if (res.data.success) {
                toast.success('Campaign settings saved successfully');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleAddType = () => {
        if (!newType.trim()) return;
        if (config.campaignTypes.includes(newType.trim())) {
            toast.error('Type already exists');
            return;
        }
        setConfig({ ...config, campaignTypes: [...config.campaignTypes, newType.trim()] });
        setNewType('');
    };

    const handleRemoveType = (typeToRemove) => {
        setConfig({
            ...config,
            campaignTypes: config.campaignTypes.filter(t => t !== typeToRemove)
        });
    };

    const handleAddPlatform = async () => {
        const newPlatform = {
            platform: 'Facebook',
            cluster: clusters.length > 0 ? clusters[0]._id : '',
            status: 'Active',
            quarter: 'January-March',
            budget: 0
        };

        try {
            setLoading(true);
            const res = await campaignAPI.createSocialPlatform(newPlatform);
            if (res.data.success) {
                setSocialPlatforms([...socialPlatforms, res.data.data]);
                toast.success('Platform added');
            }
        } catch (error) {
            toast.error('Failed to add platform');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlatform = async (id, updates) => {
        try {
            const res = await campaignAPI.updateSocialPlatform(id, updates);
            if (res.data.success) {
                setSocialPlatforms(socialPlatforms.map(p => p._id === id ? res.data.data : p));
                toast.success('Platform updated');
            }
        } catch (error) {
            toast.error('Failed to update platform');
        }
    };

    const handleDeletePlatform = async (id) => {
        if (!window.confirm('Are you sure you want to delete this platform?')) return;
        try {
            const res = await campaignAPI.deleteSocialPlatform(id);
            if (res.data.success) {
                setSocialPlatforms(socialPlatforms.filter(p => p._id !== id));
                toast.success('Platform deleted');
            }
        } catch (error) {
            toast.error('Failed to delete platform');
        }
    };

    const calculateBudgetSummary = () => {
        const platformNames = [...new Set(socialPlatforms.map(p => p.platform))].join(', ');
        const clusterNames = [...new Set(socialPlatforms.map(p => p.cluster?.name).filter(Boolean))].join(', ');
        const totalBudget = socialPlatforms.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

        return { platformNames, clusterNames, totalBudget };
    };

    const TABS = [
        { id: 'settings', label: 'Campaign Settings', icon: Layout },
        { id: 'social', label: 'Social Media', icon: Globe },
        { id: 'budget', label: 'Budget Controls', icon: DollarSign },
    ];

    if (loading && config.campaignTypes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { platformNames, clusterNames, totalBudget } = calculateBudgetSummary();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Campaign Management</h1>
                <p className="text-gray-600">Configure global campaign parameters and manage social media marketing channels.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-all relative ${activeTab === tab.id
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Format */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Default Campaign Name Format</label>
                            <input
                                type="text"
                                value={config.defaultNameFormat}
                                onChange={(e) => setConfig({ ...config, defaultNameFormat: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Enter format (e.g. {Type}_{State}_{Date})"
                            />
                        </div>

                        {/* Types and Conversions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-700">Campaign Types</label>
                                <div className="space-y-3">
                                    {config.campaignTypes.map((type, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={type}
                                                readOnly
                                                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                                            />
                                            <button
                                                onClick={() => handleRemoveType(type)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input
                                            type="text"
                                            value={newType}
                                            onChange={(e) => setNewType(e.target.value)}
                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Add new type..."
                                        />
                                        <button
                                            onClick={handleAddType}
                                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
                                        >
                                            <Plus size={20} className="mr-1" /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-sm font-semibold text-gray-700">Default Conversion Settings</label>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between space-x-4">
                                        <label className="text-gray-600 flex-1">CPRM Conversion</label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                value={config.cprmConversion}
                                                onChange={(e) => setConfig({ ...config, cprmConversion: Number(e.target.value) })}
                                                className="w-24 p-3 border border-gray-300 rounded-lg pr-8 text-right"
                                            />
                                            <span className="absolute right-3 text-gray-400 font-bold">%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between space-x-4">
                                        <label className="text-gray-600 flex-1">Company Conversion</label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                value={config.companyConversion}
                                                onChange={(e) => setConfig({ ...config, companyConversion: Number(e.target.value) })}
                                                className="w-24 p-3 border border-gray-300 rounded-lg pr-8 text-right"
                                            />
                                            <span className="absolute right-3 text-gray-400 font-bold">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleConfigSave}
                                disabled={loading}
                                className="flex items-center space-x-2 py-3 px-8 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                <Save size={20} />
                                <span>Save Settings</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="space-y-10 animate-fadeIn">
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Platform</th>
                                        <th className="px-6 py-4">Cluster</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Quarter</th>
                                        <th className="px-6 py-4">Budget (₹)</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {socialPlatforms.map((p, idx) => (
                                        <tr key={p._id} className="hover:bg-gray-50/50 transition-all">
                                            <td className="px-6 py-4">
                                                <select
                                                    value={p.platform}
                                                    onChange={(e) => handleUpdatePlatform(p._id, { platform: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="Facebook">Facebook</option>
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="Twitter">Twitter</option>
                                                    <option value="LinkedIn">LinkedIn</option>
                                                    <option value="Google">Google</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={p.cluster?._id || p.cluster}
                                                    onChange={(e) => handleUpdatePlatform(p._id, { cluster: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm"
                                                >
                                                    {clusters.map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleUpdatePlatform(p._id, { status: p.status === 'Active' ? 'Inactive' : 'Active' })}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${p.status === 'Active'
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-red-100 text-red-700 border border-red-200'
                                                        }`}
                                                >
                                                    {p.status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={p.quarter}
                                                    onChange={(e) => handleUpdatePlatform(p._id, { quarter: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm"
                                                >
                                                    <option value="January-March">January-March</option>
                                                    <option value="April-June">April-June</option>
                                                    <option value="July-September">July-September</option>
                                                    <option value="October-December">October-December</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={p.budget}
                                                    onBlur={(e) => handleUpdatePlatform(p._id, { budget: Number(e.target.value) })}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        setSocialPlatforms(socialPlatforms.map(item =>
                                                            item._id === p._id ? { ...item, budget: newVal } : item
                                                        ));
                                                    }}
                                                    className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Enter Budget"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDeletePlatform(p._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-start">
                            <button
                                onClick={handleAddPlatform}
                                className="flex items-center space-x-2 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                            >
                                <Plus size={18} />
                                <span>Add New Platform</span>
                            </button>
                        </div>

                        {/* Budget Summary Section */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 space-y-6">
                            <div className="flex items-center space-x-3 mb-2">
                                <BarChart2 className="text-blue-600" size={24} />
                                <h3 className="text-xl font-bold text-gray-800 tracking-tight">Budget Summary</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</span>
                                    <span className="text-gray-700 font-medium">{platformNames || 'None'}</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clusters</span>
                                    <span className="text-gray-700 font-medium">{clusterNames || 'None'}</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                                    <span className="text-green-600 font-bold italic underline decoration-green-200 underline-offset-4">
                                        {socialPlatforms.some(p => p.status === 'Active') ? 'All Active' : 'None Active'}
                                    </span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Budget</span>
                                    <span className="text-2xl font-black text-blue-700">₹{totalBudget.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Platforms</span>
                                    <span className="text-xl font-bold text-gray-700">{socialPlatforms.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'budget' && (
                    <div className="space-y-12 animate-fadeIn py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Default Company Campaign Budget (₹)</label>
                                <input
                                    type="number"
                                    value={config.defaultCompanyBudget}
                                    onChange={(e) => setConfig({ ...config, defaultCompanyBudget: Number(e.target.value) })}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Default CPRM Campaign Budget (₹)</label>
                                <input
                                    type="number"
                                    value={config.defaultCprmBudget}
                                    onChange={(e) => setConfig({ ...config, defaultCprmBudget: Number(e.target.value) })}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    placeholder="e.g. 2500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <button
                                onClick={handleConfigSave}
                                disabled={loading}
                                className="flex items-center space-x-2 py-4 px-10 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                <Save size={20} />
                                <span>Save Budget Settings</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-100 pt-8">
                <p>© {new Date().getFullYear()} Solarkits. All Rights Reserved.</p>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CampaignManagement;
