import React, { useState, useEffect } from 'react';
import { getProjects } from '../../../../services/project/projectService';
import { Search, ChevronDown, CheckCircle, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompletedProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All Types');
    const [selectedProjectType, setSelectedProjectType] = useState('All Type');
    const [selectedSubProjectType, setSelectedSubProjectType] = useState('All Type');
    const [selectedCP, setSelectedCP] = useState('All CPs/Installers');

    useEffect(() => {
        const fetchCompletedProjects = async () => {
            try {
                setLoading(true);
                // Fetch all projects for the dealer
                const response = await getProjects();
                const allProjects = response.data || [];

                // Filter projects to only include those that are "completed"
                const completedStatuses = ['commission', 'subsidydis', 'completed'];
                const filtered = allProjects.filter(p =>
                    completedStatuses.includes(p.statusStage?.toLowerCase()) ||
                    p.status?.toLowerCase().includes('complete') ||
                    p.status?.toLowerCase().includes('commission') ||
                    p.status?.toLowerCase().includes('disbursal')
                );

                setProjects(filtered);
            } catch (err) {
                console.error("Failed to fetch completed projects:", err);
                setError('Failed to fetch completed projects');
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedProjects();
    }, []);

    // Apply frontend filters
    const finalFilteredProjects = projects.filter(p => {
        if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) return false;
        if (selectedSubCategory !== 'All Types' && p.subCategory !== selectedSubCategory) return false;
        if (selectedProjectType !== 'All Type' && p.projectType !== selectedProjectType) return false;
        if (selectedSubProjectType !== 'All Type' && p.subProjectType !== selectedSubProjectType) return false;
        if (selectedCP !== 'All CPs/Installers' && p.cp !== selectedCP) return false;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                p.projectName?.toLowerCase().includes(searchLower) ||
                p.customer?.toLowerCase().includes(searchLower) ||
                p.projectId?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Completed Projects</h2>
                        <p className="text-gray-600 mt-1">
                            View all successfully completed solar projects.
                        </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Table</label>
                        <div className="relative border rounded focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex items-center bg-white px-3 py-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Project ID or Customer"
                                className="w-full focus:outline-none ml-2 text-sm bg-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 border rounded appearance-none focus:outline-none focus:border-blue-500 text-sm bg-white"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option>All Categories</option>
                                <option>Residential</option>
                                <option>Commercial</option>
                                <option>Industrial</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category Type</label>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 border rounded appearance-none focus:outline-none focus:border-blue-500 text-sm bg-white"
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                            >
                                <option>All Types</option>
                                <option>Solar Panel</option>
                                <option>Solar Rooftop</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 border rounded appearance-none focus:outline-none focus:border-blue-500 text-sm bg-white"
                                value={selectedProjectType}
                                onChange={(e) => setSelectedProjectType(e.target.value)}
                            >
                                <option>All Type</option>
                                <option>Above 100Kw</option>
                                <option>Above 200Kw</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project Type</label>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2 border rounded appearance-none focus:outline-none focus:border-blue-500 text-sm bg-white"
                                value={selectedSubProjectType}
                                onChange={(e) => setSelectedSubProjectType(e.target.value)}
                            >
                                <option>All Type</option>
                                <option>On-Grid</option>
                                <option>Off-Grid</option>
                                <option>Hybrid</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Customer Name</th>
                                <th className="px-4 py-3">Project ID</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Project Type</th>
                                <th className="px-4 py-3">Total kW</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">CP Name</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : finalFilteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="h-10 w-10 text-gray-300 mb-2" />
                                            <p>No completed projects found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (finalFilteredProjects.map((project, index) => (
                                <tr key={project._id || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-blue-600 font-medium">
                                        {project.projectName || project.customer || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {project.projectId || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {project.category || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {project.projectType || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 font-medium">
                                        {project.totalKW ? `${project.totalKW} kW` : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium inline-block whitespace-nowrap">
                                            {project.status || 'Completed'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {project.cp || 'Direct'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleNavigate(`/dealer-manager/my-task/project-management/project-details/${project.projectId}`)}
                                            className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-xs"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
