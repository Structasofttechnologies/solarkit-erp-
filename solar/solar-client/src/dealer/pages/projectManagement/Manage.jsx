import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home,
    Building2,
    ArrowRight,
    X,
    Filter,
    ChevronDown,
    Factory,
    Zap,
    Sun,
    Battery,
    Wind
} from 'lucide-react';

const DealerProjectManagement = () => {
    const navigate = useNavigate();

    // Filter states
    const [filters, setFilters] = useState({
        category: '',
        subCategory: '',
        projectType: '',
        subProjectType: ''
    });

    // Customer type selection
    const [selectedType, setSelectedType] = useState(null);

    // Filter options
    const categoryOptions = [
        { value: '', label: 'Filter by Category' },
        { value: 'Rooftop Solar', label: 'Rooftop Solar' },
        { value: 'Solar Pump', label: 'Solar Pump' }
    ];

    const subCategoryOptions = [
        { value: '', label: 'Filter by Sub-Category' },
        { value: 'Residential', label: 'Residential' },
        { value: 'Commercial', label: 'Commercial' }
    ];

    const projectTypeOptions = [
        { value: '', label: 'Filter by Project Type' },
        { value: '1 to 10 kW', label: '1 to 10 kW' },
        { value: '11 to 20 kW', label: '11 to 20 kW' }
    ];

    const subProjectTypeOptions = [
        { value: '', label: 'Filter by Sub Project Type' },
        { value: 'On-Grid', label: 'On-Grid' },
        { value: 'Off-Grid', label: 'Off-Grid' },
        { value: 'Hybrid', label: 'Hybrid' }
    ];

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));

        // Auto-filter customer type based on subCategory
        if (name === 'subCategory') {
            if (value === 'Residential') {
                setSelectedType('Residential');
            } else if (value === 'Commercial') {
                setSelectedType('Commercial');
            } else {
                setSelectedType(null);
            }
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setFilters({
            category: '',
            subCategory: '',
            projectType: '',
            subProjectType: ''
        });
        setSelectedType(null);
    };

    // Handle card selection
    const handleCardSelect = (type) => {
        setSelectedType(type);
    };

    // Handle continue button
    const handleContinue = () => {
        if (selectedType === 'Residential') {
            navigate('/dealer/residential-project');
        } else if (selectedType === 'Commercial') {
            navigate('/dealer/commercial-project');
        }
    };

    // Check if continue button should be enabled
    const isContinueEnabled = selectedType !== null;

    // Determine if cards should be hidden based on subCategory filter
    const showResidential = filters.subCategory === '' || filters.subCategory === 'Residential';
    const showCommercial = filters.subCategory === '' || filters.subCategory === 'Commercial';

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm mb-4">
                <div className="px-4 py-3">
                    <h4 className="text-blue-600 font-bold text-lg mb-0">Project Management</h4>
                </div>
            </div>

            <div className="container-fluid px-0">
                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-sm border-0 mb-4">
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Filter by Category */}
                            <div className="mb-3">
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                >
                                    {categoryOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter by Sub-Category */}
                            <div className="mb-3">
                                <select
                                    name="subCategory"
                                    value={filters.subCategory}
                                    onChange={handleFilterChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                >
                                    {subCategoryOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter by Project Type */}
                            <div className="mb-3">
                                <select
                                    name="projectType"
                                    value={filters.projectType}
                                    onChange={handleFilterChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                >
                                    {projectTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter by Sub Project Type */}
                            <div className="mb-3">
                                <select
                                    name="subProjectType"
                                    value={filters.subProjectType}
                                    onChange={handleFilterChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                >
                                    {subProjectTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center px-3 py-1 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                            >
                                <X size={16} className="mr-1" />
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customer Type Selection */}
                <div className="text-center mt-4">
                    <h3 className="text-blue-600 font-bold text-xl">Select Customer Type</h3>
                    <p className="text-gray-500 mb-4">Choose one to continue</p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {/* Residential Card */}
                        {showResidential && (
                            <div className="w-full sm:w-72 mb-4">
                                <div
                                    onClick={() => handleCardSelect('Residential')}
                                    className={`cursor-pointer border rounded-lg shadow-sm text-center py-6 px-4 transition-all ${selectedType === 'Residential'
                                        ? 'border-blue-600 shadow-lg ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:shadow-md'
                                        }`}
                                >
                                    <Home
                                        size={48}
                                        className={`mx-auto mb-2 ${selectedType === 'Residential' ? 'text-blue-600' : 'text-blue-500'
                                            }`}
                                    />
                                    <h4 className={`font-bold text-lg ${selectedType === 'Residential' ? 'text-blue-600' : 'text-gray-800'
                                        }`}>
                                        Residential
                                    </h4>
                                    <p className="text-gray-500 text-sm mb-0">For personal, non-commercial use</p>
                                </div>
                            </div>
                        )}

                        {/* Commercial Card */}
                        {showCommercial && (
                            <div className="w-full sm:w-72 mb-4">
                                <div
                                    onClick={() => handleCardSelect('Commercial')}
                                    className={`cursor-pointer border rounded-lg shadow-sm text-center py-6 px-4 transition-all ${selectedType === 'Commercial'
                                        ? 'border-blue-600 shadow-lg ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:shadow-md'
                                        }`}
                                >
                                    <Building2
                                        size={48}
                                        className={`mx-auto mb-2 ${selectedType === 'Commercial' ? 'text-blue-600' : 'text-blue-500'
                                            }`}
                                    />
                                    <h4 className={`font-bold text-lg ${selectedType === 'Commercial' ? 'text-blue-600' : 'text-gray-800'
                                        }`}>
                                        Commercial
                                    </h4>
                                    <p className="text-gray-500 text-sm mb-0">For business and commercial purposes</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        disabled={!isContinueEnabled}
                        className={`mt-3 px-6 py-3 rounded-lg text-white font-medium text-lg inline-flex items-center transition-all ${isContinueEnabled
                            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed opacity-50'
                            }`}
                    >
                        Continue
                        <ArrowRight className="ml-2" size={20} />
                    </button>
                </div>

                {/* Alternative icons for sub categories (for visual interest) */}
                <div className="mt-8 flex justify-center space-x-4 text-gray-400">
                    <Zap size={20} />
                    <Sun size={20} />
                    <Battery size={20} />
                    <Wind size={20} />
                    <Factory size={20} />
                </div>
            </div>
        </div>
    );
};

export default DealerProjectManagement;