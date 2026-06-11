import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search, Filter, Eye, FileEdit, Trash2, ArrowDownCircle, ArrowUpCircle, Smartphone, Loader2 } from 'lucide-react';
import { getLeads } from '../../services/leadService';

const SubLeads = () => {
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            try {
                const res = await getLeads({ leadType: id, search: searchTerm });
                if (res.success) {
                    setLeads(res.data);
                }
            } catch (err) {
                console.error('Error fetching leads:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, [id, searchTerm]);

    // Lead type mappings based on ID
    const leadTypeConfig = {
        '1': { title: 'In Bound Leads', icon: ArrowDownCircle, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        '2': { title: 'Out Bound Leads', icon: ArrowUpCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        '3': { title: 'App Leads', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' },
    };

    const config = leadTypeConfig[id] || { title: 'Sub Leads', icon: Search, color: 'text-gray-600', bg: 'bg-gray-50' };
    const Icon = config.icon;

    const filteredLeads = leads; // Already filtered by server search if implemented, or we can leave client search


    return (
        <div className="container-fluid px-4 py-4 min-h-screen bg-gray-50">
            {/* Header / Breadcrumb */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-2 text-sm">
                        <li className="inline-flex items-center">
                            <Link to="/dealer-manager/onboarding/company-lead" className="text-blue-600 hover:text-blue-800 flex items-center">
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Company Leads
                            </Link>
                        </li>
                        <li>
                            <span className="mx-2 text-gray-400">/</span>
                        </li>
                        <li className="text-gray-600" aria-current="page">
                            {config.title}
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Title Section */}
            <div className={`bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className={`text-xl font-semibold text-gray-800 flex items-center gap-2`}>
                            {config.title}
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{leads.length} Total</span>
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">Review and manage leads of this specific category.</p>
                    </div>
                    <div className={`${config.bg} p-3 rounded-full`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="bg-white p-4 rounded-t-lg shadow-sm border-b flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </button>
                </div>

                <div className="relative max-w-md w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-b-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#0f4e8d] text-white">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Lead ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                </td>
                            </tr>
                        ) : filteredLeads.map((lead) => (
                            <tr key={lead._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {lead._id?.substring(0, 8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{lead.mobile}</div>
                                    <div className="text-sm text-gray-500">{lead.email || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${lead.status === 'Converted' ? 'bg-green-100 text-green-800' : ''}
                                        ${lead.status === 'SurveyPending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                                    `}>
                                        {lead.status || 'New'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md" title="View details">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md" title="Edit">
                                            <FileEdit className="w-4 h-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                    No leads found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination placeholder */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLeads.length}</span> of <span className="font-medium">{leads.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100">
                                    1
                                </button>
                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubLeads;
