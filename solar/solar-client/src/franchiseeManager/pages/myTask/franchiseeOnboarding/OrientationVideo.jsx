import React, { useState } from 'react';
import {
    ChevronRight,
    Filter,
    X,
    Video,
    PlayCircle,
    Download,
    Eye,
    BookOpen,
    Sun,
    Wind,
    Grid,
    Zap,
    Home,
    Building,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    MoreVertical,
    Trash2,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const FranchiseeManagerOrientationVideo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedProjectType, setSelectedProjectType] = useState('');
    const [showTable, setShowTable] = useState(false);
    const [tableData, setTableData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Sample data for different project types
    const orientationData = {
        offgrid: [
            { id: 1, title: 'Off-Grid Solar System Installation', duration: '15:30', views: 234, status: 'Completed' },
            { id: 2, title: 'Battery Bank Setup Guide', duration: '12:45', views: 189, status: 'Pending' },
            { id: 3, title: 'Off-Grid Inverter Configuration', duration: '18:20', views: 156, status: 'Completed' },
        ],
        ongrid: [
            { id: 1, title: 'Grid-Tie Solar System Basics', duration: '14:20', views: 345, status: 'Completed' },
            { id: 2, title: 'Net Metering Process Explained', duration: '10:15', views: 278, status: 'Completed' },
            { id: 3, title: 'On-Grid Inverter Setup', duration: '16:40', views: 198, status: 'Pending' },
        ],
        hybrid: [
            { id: 1, title: 'Hybrid Solar System Overview', duration: '17:30', views: 167, status: 'Completed' },
            { id: 2, title: 'Hybrid Inverter Programming', duration: '22:15', views: 143, status: 'Pending' },
            { id: 3, title: 'Backup Power Management', duration: '13:45', views: 121, status: 'Completed' },
        ]
    };

    const handleProjectTypeChange = (e) => {
        const value = e.target.value;
        setSelectedProjectType(value);

        if (value) {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                let data = [];
                switch (value) {
                    case 'offgrid':
                        data = orientationData.offgrid;
                        break;
                    case 'ongrid':
                        data = orientationData.ongrid;
                        break;
                    case 'hybrid':
                        data = orientationData.hybrid;
                        break;
                    default:
                        data = [];
                }
                setTableData(data);
                setShowTable(true);
                setLoading(false);
            }, 500);
        }
    };

    const resetFilters = () => {
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSelectedProjectType('');
        setShowTable(false);
        setTableData(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-semibold text-blue-600 flex items-center">
                                <Video className="mr-2" size={24} />
                                Franchisee Orientation Videos
                            </h4>
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="flex items-center space-x-2 text-sm">
                                    <li>
                                        <a href="/franchiseeManager" className="text-blue-600 hover:text-blue-800">
                                            Orientation
                                        </a>
                                    </li>
                                    <li>
                                        <ChevronRight size={16} className="text-gray-400" />
                                    </li>
                                    <li className="text-gray-500 font-medium" aria-current="page">
                                        Training Videos
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Category Selection Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-[#0f4e8d] text-white rounded-full text-sm font-semibold hover:bg-[#0d3e70] transition-colors flex items-center"
                    >
                        <Filter size={16} className="mr-2" />
                        Select Category
                    </button>
                </div>

                {/* Category Selection Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Select Video Category</h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Solar Category Dropdown */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Solar Category
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="rooftop">Solar Rooftop</option>
                                        <option value="pump">Solar Pump</option>
                                        <option value="streetlight">Solar Street Light</option>
                                    </select>
                                </div>

                                {/* Sub Category Dropdown */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sub Category
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedSubCategory}
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    >
                                        <option value="">Select Sub Category</option>
                                        <option value="residential">Residential</option>
                                        <option value="commercial">Commercial</option>
                                    </select>
                                </div>

                                {/* Project Type Dropdown */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Type
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedProjectType}
                                        onChange={handleProjectTypeChange}
                                    >
                                        <option value="">Select Project type</option>
                                        <option value="offgrid">Off Grid</option>
                                        <option value="ongrid">On Grid</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            if (selectedProjectType) {
                                                handleProjectTypeChange({ target: { value: selectedProjectType } });
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Selected Filters Display */}
                {(selectedCategory || selectedSubCategory || selectedProjectType) && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {selectedCategory && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                                        Category: {selectedCategory === 'rooftop' ? 'Solar Rooftop' :
                                            selectedCategory === 'pump' ? 'Solar Pump' : 'Solar Street Light'}
                                    </span>
                                )}
                                {selectedSubCategory && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                                        Sub Category: {selectedSubCategory === 'residential' ? 'Residential' : 'Commercial'}
                                    </span>
                                )}
                                {selectedProjectType && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                                        Project Type: {selectedProjectType === 'offgrid' ? 'Off Grid' :
                                            selectedProjectType === 'ongrid' ? 'On Grid' : 'Hybrid'}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={resetFilters}
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                            >
                                <X size={14} className="mr-1" />
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Video Cards/Table Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading videos...</p>
                        </div>
                    ) : showTable && tableData ? (
                        <div className="p-6">
                            <h5 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                <BookOpen size={20} className="text-blue-500 mr-2" />
                                {selectedProjectType === 'offgrid' ? 'Off-Grid' :
                                    selectedProjectType === 'ongrid' ? 'On-Grid' : 'Hybrid'} Training Videos
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tableData.map((video) => (
                                    <div key={video.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="aspect-video bg-gradient-to-r from-blue-500 to-blue-600 relative group cursor-pointer">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <PlayCircle size={48} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                {video.duration}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h6 className="font-semibold text-gray-800 mb-2">{video.title}</h6>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center text-gray-500">
                                                    <Eye size={14} className="mr-1" />
                                                    {video.views} views
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs ${video.status === 'Completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {video.status}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex space-x-2">
                                                <button className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center">
                                                    <PlayCircle size={14} className="mr-1" />
                                                    Watch
                                                </button>
                                                <button className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-md hover:bg-gray-100 transition-colors">
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                                <div className="bg-green-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Videos</p>
                                            <p className="text-xl font-bold text-green-600">{tableData.length}</p>
                                        </div>
                                        <Video size={20} className="text-green-600" />
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Views</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {tableData.reduce((sum, v) => sum + v.views, 0)}
                                            </p>
                                        </div>
                                        <Eye size={20} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Avg Duration</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {Math.round(tableData.reduce((sum, v) => {
                                                    const minutes = parseInt(v.duration.split(':')[0]);
                                                    const seconds = parseInt(v.duration.split(':')[1]);
                                                    return sum + minutes + (seconds / 60);
                                                }, 0) / tableData.length)} min
                                            </p>
                                        </div>
                                        <Clock size={20} className="text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Video size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Select a category to view training videos</p>
                            <p className="text-sm text-gray-400 mt-2">Choose project type to see relevant orientation content</p>
                        </div>
                    )}
                </div>

                {/* Quick Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                        <h5 className="font-semibold text-blue-700 mb-2 flex items-center">
                            <BookOpen size={18} className="mr-2" />
                            Orientation Tips
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                                <CheckCircle size={14} className="text-green-500 mr-2" />
                                Watch videos in sequence for better understanding
                            </li>
                            <li className="flex items-center">
                                <CheckCircle size={14} className="text-green-500 mr-2" />
                                Take notes during important sections
                            </li>
                            <li className="flex items-center">
                                <CheckCircle size={14} className="text-green-500 mr-2" />
                                Complete quiz after each module
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4">
                        <h5 className="font-semibold text-yellow-700 mb-2 flex items-center">
                            <AlertCircle size={18} className="mr-2" />
                            Next Steps
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                                <Clock size={14} className="text-orange-500 mr-2" />
                                Complete all orientation videos by 25th March
                            </li>
                            <li className="flex items-center">
                                <Clock size={14} className="text-orange-500 mr-2" />
                                Submit orientation feedback form
                            </li>
                            <li className="flex items-center">
                                <Clock size={14} className="text-orange-500 mr-2" />
                                Schedule follow-up call with mentor
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerOrientationVideo;