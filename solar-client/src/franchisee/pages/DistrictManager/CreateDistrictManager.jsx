import React, { useState, useEffect } from 'react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    ArrowLeft,
    Save,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { locationAPI } from '../../../api/api';

const CreateDistrictManager = () => {
    const navigate = useNavigate();
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        role: 'District Manager',
        district: '',
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => {
                navigate('/franchisee/district-manager');
            }, 2000);
        }, 1500);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">District Manager Created!</h2>
                <p className="text-gray-600">The new district manager has been successfully created and added to your region.</p>
                <p className="text-sm text-gray-500 mt-4">Redirecting back...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/franchisee/district-manager')}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Create New District Manager</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-blue-600 flex items-center">
                                <User size={20} className="mr-2" />
                                Basic Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assignment Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-blue-600 flex items-center">
                                <Briefcase size={20} className="mr-2" />
                                Assignment
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none"
                                    value="District Manager"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="district"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.district}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(d => (
                                            <option key={d._id} value={d.name.toLowerCase()}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/franchisee/district-manager')}
                        className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold flex items-center shadow-lg hover:bg-blue-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                Create Manager
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDistrictManager;
