import React, { useState } from 'react';
import {
    PlusCircle,
    X,
    Eye,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronRight,
    Filter,
    Users,
    Calendar,
    FileText,
    Activity
} from 'lucide-react';

const ServiceTicket = () => {
    const [selectedCp, setSelectedCp] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        cp: '',
        customer: '',
        product: '',
        installDate: '',
        faultType: '',
        serviceType: '',
        description: '',
        priority: ''
    });

    // Filter states
    const [filters, setFilters] = useState({
        categoryType: '',
        subCategoryType: '',
        projectType: '',
        subProjectType: ''
    });

    // Sample customer data for each CP
    const customerData = {
        "cp1": [
            {
                name: "Rajesh Patel",
                product: "Solar Panel 5KW",
                installDate: "15/03/2023",
                fault: "Inverter Failure",
                serviceType: "",
                status: "Active",
                lastService: "10/05/2023"
            },
            {
                name: "Mehta Industries",
                product: "Solar System 10KW",
                installDate: "22/01/2023",
                fault: "Panel Efficiency Drop",
                serviceType: "",
                status: "Active",
                lastService: "18/06/2023"
            }
        ],
        "cp2": [
            {
                name: "Amit Shah",
                product: "Solar Panel 3KW",
                installDate: "05/04/2023",
                fault: "Wiring Issue",
                serviceType: "",
                status: "Active",
                lastService: "25/05/2023"
            }
        ],
        "cp3": [
            {
                name: "Priya Desai",
                product: "Solar System 7KW",
                installDate: "12/02/2023",
                fault: "Battery Malfunction",
                serviceType: "",
                status: "Active",
                lastService: "30/04/2023"
            },
            {
                name: "Vijay Kumar",
                product: "Solar Panel 5KW",
                installDate: "08/03/2023",
                fault: "Mounting Damage",
                serviceType: "",
                status: "Active",
                lastService: "15/06/2023"
            }
        ],
        "cp4": [
            {
                name: "Geeta Sharma",
                product: "Solar System 8KW",
                installDate: "19/01/2023",
                fault: "Controller Failure",
                serviceType: "",
                status: "Active",
                lastService: "22/05/2023"
            }
        ]
    };

    // Sample ticket data
    const [tickets] = useState([
        {
            id: "TCK-00125",
            raisedDate: "2025-08-05",
            customer: "Rajesh Patel",
            franchisee: "Royal Solar Pvt Ltd",
            product: "5kW Solar Panel",
            faultType: "Panel Not Charging",
            serviceType: "On-Site Repair",
            status: "Pending",
            statusClass: "bg-yellow-100 text-yellow-800"
        },
        {
            id: "TCK-00126",
            raisedDate: "2025-08-06",
            customer: "Anita Mehta",
            franchisee: "Manav Solar Pvt Ltd",
            product: "3kW Inverter",
            faultType: "Inverter Failure",
            serviceType: "Replacement",
            status: "In Progress",
            statusClass: "bg-blue-100 text-blue-800"
        },
        {
            id: "TCK-00127",
            raisedDate: "2025-08-07",
            customer: "Vikas Shah",
            franchisee: "Shiv Solar Pvt Ltd",
            product: "2kW Solar Panel",
            faultType: "Loose Wiring",
            serviceType: "Maintenance",
            status: "Resolved",
            statusClass: "bg-green-100 text-green-800"
        }
    ]);

    const channelPartners = [
        { id: "cp1", name: "Sunshine Solar (Rajkot)" },
        { id: "cp2", name: "Green Energy (Ahmedabad)" },
        { id: "cp3", name: "Eco Power (Surat)" },
        { id: "cp4", name: "Solar Tech (Vadodara)" }
    ];

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCpChange = (e) => {
        setSelectedCp(e.target.value);
    };

    const handleRaiseTicket = (customer) => {
        setFormData({
            ...formData,
            customer: customer.name,
            product: customer.product
        });
        setShowModal(true);
    };

    const submitTicket = () => {
        console.log('Ticket raised:', formData);
        setShowModal(false);
        setFormData({
            cp: '',
            customer: '',
            product: '',
            installDate: '',
            faultType: '',
            serviceType: '',
            description: '',
            priority: ''
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
        }
    };

    const getTicketStatusBadge = (status, statusClass) => {
        const classes = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Resolved': 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-4">
                    <nav className="bg-white rounded-lg shadow-sm p-4">
                        <ol className="flex items-center">
                            <li className="flex items-center text-gray-700 w-full">
                                <h3 className="text-xl font-semibold text-gray-800">Raise Service Ticket</h3>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* CP Selection Card */}
                <div className="bg-white rounded-lg shadow-sm mb-4">
                    <div className="p-6">
                        <h5 className="text-lg font-semibold text-gray-800 mb-4">Select Franchisee</h5>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Type</label>
                                <select
                                    name="categoryType"
                                    value={filters.categoryType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Category Types</option>
                                    <option value="solarpanel">Solar Panel</option>
                                    <option value="solarrooftop">Solar RoofTop</option>
                                    <option value="solarpump">Solar Pump</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category Type</label>
                                <select
                                    name="subCategoryType"
                                    value={filters.subCategoryType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Sub category Types</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                                <select
                                    name="projectType"
                                    value={filters.projectType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Project Types</option>
                                    <option value="3-5KW">3kW - 5kW</option>
                                    <option value="5-10KW">5kW - 10kW</option>
                                    <option value="10-20KW">10kW - 20KW</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project Type</label>
                                <select
                                    name="subProjectType"
                                    value={filters.subProjectType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Sub Project Types</option>
                                    <option value="ongrid">On-Grid</option>
                                    <option value="offgrid">Off-grid</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Channel Partner</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedCp}
                                    onChange={handleCpChange}
                                >
                                    <option value="">-- Select CP --</option>
                                    {channelPartners.map(cp => (
                                        <option key={cp.id} value={cp.id}>{cp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-5 mt-2">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                                >
                                    <PlusCircle size={18} className="mr-2" />
                                    Raise New Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Table */}
                <div className="bg-white rounded-lg shadow-sm mb-4">
                    <div className="p-6">
                        <h5 className="text-lg font-semibold text-gray-800 mb-4">Customer Service Requests</h5>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Installation Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fault Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Service Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Last Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {selectedCp && customerData[selectedCp]?.map((customer, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">{customer.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{customer.product}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{customer.installDate}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{customer.fault}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{customer.serviceType || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{getStatusBadge(customer.status)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{customer.lastService}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <button
                                                    onClick={() => handleRaiseTicket(customer)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-150"
                                                >
                                                    Raise Ticket
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!selectedCp || !customerData[selectedCp]?.length) && (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                <Users className="mx-auto mb-2 text-gray-400" size={32} />
                                                {selectedCp ? 'No customers found for this CP' : 'Select a Channel Partner to view customers'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Raise Ticket Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h5 className="text-lg font-semibold text-gray-800">Raise New Service Ticket</h5>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Channel Partner <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="cp"
                                                    value={formData.cp}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="">Select CP</option>
                                                    {channelPartners.map(cp => (
                                                        <option key={cp.id} value={cp.id}>{cp.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Customer <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="customer"
                                                    value={formData.customer}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Customer name"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Product <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="product"
                                                    value={formData.product}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date</label>
                                                <input
                                                    type="date"
                                                    name="installDate"
                                                    value={formData.installDate}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Fault Type <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="faultType"
                                                    value={formData.faultType}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Fault Type</option>
                                                    <option value="mechanical">Mechanical</option>
                                                    <option value="electrical">Electrical</option>
                                                    <option value="performance">Performance Issue</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Service Type <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="serviceType"
                                                    value={formData.serviceType}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Service Type</option>
                                                    <option value="repair">Repair</option>
                                                    <option value="replace">Replace</option>
                                                    <option value="maintenance">Maintenance</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleFormChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Priority <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Priority</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-150"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitTicket}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                                    >
                                        Raise Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ticket Tracking Table */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        <h5 className="text-lg font-semibold text-gray-800 mb-4">Ticket Tracking</h5>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Ticket ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Raised Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Franchisee Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fault Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Service Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Current Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Proof</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-700">{ticket.id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{ticket.raisedDate}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{ticket.customer}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{ticket.franchisee}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{ticket.product}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{ticket.faultType}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{ticket.serviceType}</td>
                                            <td className="px-4 py-3 text-sm">{getTicketStatusBadge(ticket.status)}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-150">
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceTicket;