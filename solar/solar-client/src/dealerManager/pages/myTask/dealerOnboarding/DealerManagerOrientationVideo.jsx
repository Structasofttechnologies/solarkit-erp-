import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Filter,
    X,
    ChevronDown,
    Video,
    Sun,
    Zap,
    Droplets,
    Home,
    Building2,
    Grid,
    Battery
} from 'lucide-react';

const DealerManagerOrientationVideo = () => {
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for selections
    const [solarCategory, setSolarCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [projectType, setProjectType] = useState('');
    const [projectTypeId, setProjectTypeId] = useState('');

    // State for table data
    const [tableData, setTableData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Sample data for different project types (simulating database response)
    const orientationData = {
        1: { // off grid
            title: "Off Grid Solar System Orientation",
            description: "Complete guide for off-grid solar installations",
            videos: [
                { id: 1, title: "Introduction to Off Grid Systems", duration: "10:30", url: "#" },
                { id: 2, title: "Battery Bank Configuration", duration: "15:45", url: "#" },
                { id: 3, title: "Inverter Setup and Maintenance", duration: "12:20", url: "#" },
                { id: 4, title: "Load Calculation and Management", duration: "18:10", url: "#" },
            ],
            documents: [
                { id: 1, name: "Off Grid Installation Manual", type: "PDF", size: "2.5 MB" },
                { id: 2, name: "Component Specification Sheet", type: "PDF", size: "1.8 MB" },
                { id: 3, name: "Wiring Diagram", type: "PDF", size: "0.9 MB" },
            ]
        },
        2: { // on grid
            title: "On Grid Solar System Orientation",
            description: "Complete guide for grid-tied solar installations",
            videos: [
                { id: 5, title: "Grid-Tied System Fundamentals", duration: "12:15", url: "#" },
                { id: 6, title: "Net Metering Process", duration: "14:30", url: "#" },
                { id: 7, title: "Inverter Selection and Installation", duration: "16:40", url: "#" },
                { id: 8, title: "Safety and Grid Compliance", duration: "11:25", url: "#" },
            ],
            documents: [
                { id: 4, name: "Grid-Tied Installation Guide", type: "PDF", size: "3.2 MB" },
                { id: 5, name: "Net Metering Application Process", type: "PDF", size: "1.2 MB" },
                { id: 6, name: "Grid Compliance Checklist", type: "PDF", size: "0.8 MB" },
            ]
        },
        3: { // hybrid
            title: "Hybrid Solar System Orientation",
            description: "Complete guide for hybrid solar installations with battery backup",
            videos: [
                { id: 9, title: "Hybrid System Architecture", duration: "13:20", url: "#" },
                { id: 10, title: "Battery Storage Integration", duration: "17:35", url: "#" },
                { id: 11, title: "Smart Energy Management", duration: "15:50", url: "#" },
                { id: 12, title: "Backup Power Configuration", duration: "14:15", url: "#" },
            ],
            documents: [
                { id: 7, name: "Hybrid System Design Guide", type: "PDF", size: "2.9 MB" },
                { id: 8, name: "Battery Maintenance Schedule", type: "PDF", size: "1.1 MB" },
                { id: 9, name: "Energy Management Settings", type: "PDF", size: "0.7 MB" },
            ]
        }
    };

    // Handle project type selection and fetch data
    const handleProjectTypeChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const typeId = selectedOption.getAttribute('data-id');
        const typeValue = e.target.value;

        setProjectType(typeValue);
        setProjectTypeId(typeId);

        if (typeId) {
            setIsLoading(true);

            // Simulate API fetch
            setTimeout(() => {
                setTableData(orientationData[typeId] || null);
                setIsLoading(false);
            }, 500);
        }
    };

    // Reset selections
    const resetSelections = () => {
        setSolarCategory('');
        setSubCategory('');
        setProjectType('');
        setProjectTypeId('');
        setTableData(null);
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    // Handle apply filters
    const handleApplyFilters = () => {
        if (projectTypeId) {
            setIsLoading(true);

            setTimeout(() => {
                setTableData(orientationData[projectTypeId] || null);
                setIsLoading(false);
            }, 500);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="page-header mb-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-2 text-sm">
                        <li className="inline-flex items-center">
                            <Link to="/dealer-manager/orientation" className="text-blue-600 hover:text-blue-800">
                                Dealer Orientation
                            </Link>
                        </li>
                        <li>
                            <span className="mx-2 text-gray-400">/</span>
                        </li>
                        <li className="text-gray-600" aria-current="page">
                            Orientation Video
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Back Button */}
            <div className="mb-4">
                <Link
                    to="/dealer-manager/orientation"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Orientation List
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Category Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm sticky top-4">
                        <div className="p-4 border-b">
                            <h5 className="font-semibold text-gray-800 flex items-center">
                                <Filter className="w-4 h-4 mr-2 text-blue-600" />
                                Select Orientation Type
                            </h5>
                        </div>

                        <div className="p-4">
                            {/* Solar Category */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Solar Category
                                </label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={solarCategory}
                                    onChange={(e) => setSolarCategory(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    <option value="rooftop">Solar Rooftop</option>
                                    <option value="pump">Solar Pump</option>
                                    <option value="streetlight">Solar Street Light</option>
                                </select>
                            </div>

                            {/* Sub Category */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sub Category
                                </label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={subCategory}
                                    onChange={(e) => setSubCategory(e.target.value)}
                                >
                                    <option value="">Select Sub Category</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>

                            {/* Project Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Type
                                </label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={projectType}
                                    onChange={handleProjectTypeChange}
                                >
                                    <option value="">Select Project type</option>
                                    <option value="offgrid" data-id="1">Off Grid</option>
                                    <option value="ongrid" data-id="2">On Grid</option>
                                    <option value="hybrid" data-id="3">Hybrid</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={handleApplyFilters}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={resetSelections}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Table/Video List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h5 className="font-semibold text-gray-800 flex items-center">
                                <Video className="w-5 h-5 mr-2 text-blue-600" />
                                Orientation Materials
                                {projectType && (
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        - {projectType === 'offgrid' ? 'Off Grid' : projectType === 'ongrid' ? 'On Grid' : 'Hybrid'} System
                                    </span>
                                )}
                            </h5>
                        </div>

                        <div className="p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Loading orientation materials...</span>
                                </div>
                            ) : tableData ? (
                                <div>
                                    {/* Title and Description */}
                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold text-gray-800">{tableData.title}</h6>
                                        <p className="text-sm text-gray-600 mt-1">{tableData.description}</p>
                                    </div>

                                    {/* Videos Section */}
                                    <div className="mb-8">
                                        <h6 className="text-md font-semibold text-blue-600 mb-3 flex items-center">
                                            <Video className="w-4 h-4 mr-2" />
                                            Training Videos
                                        </h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tableData.videos.map((video) => (
                                                <a
                                                    key={video.id}
                                                    href={video.url}
                                                    className="block p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="bg-blue-100 p-2 rounded-lg">
                                                            <Video className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <h6 className="font-medium text-gray-800">{video.title}</h6>
                                                            <p className="text-xs text-gray-500 mt-1">Duration: {video.duration}</p>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Documents Section */}
                                    <div>
                                        <h6 className="text-md font-semibold text-green-600 mb-3 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Reference Documents
                                        </h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tableData.documents.map((doc) => (
                                                <a
                                                    key={doc.id}
                                                    href="#"
                                                    className="block p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="bg-green-100 p-2 rounded-lg">
                                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <div className="ml-3">
                                                                <h6 className="font-medium text-gray-800">{doc.name}</h6>
                                                                <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                                                            </div>
                                                        </div>
                                                        <button className="text-blue-600 hover:text-blue-800">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Video className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h6 className="text-gray-600 font-medium">No Orientation Materials Selected</h6>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Please select a project type from the sidebar to view orientation materials
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Download icon component
const Download = ({ className }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
    </svg>
);

export default DealerManagerOrientationVideo;