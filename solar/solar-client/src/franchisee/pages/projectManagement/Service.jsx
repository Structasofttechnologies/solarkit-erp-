import React, { useState, useEffect } from 'react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    CheckCircle,
    XCircle,
    ChevronRight,
    ChevronLeft,
    Search,
    Upload,
    Eye,
    Edit,
    Home,
    Building2,
    CreditCard,
    Calendar,
    AlertTriangle,
    AlertCircle,
    Check,
    X,
    Plus,
    Minus,
    Star,
    Download,
    Share2,
    Camera,
    Video,
    Image as ImageIcon,
    Wrench,
    Hammer,
    Settings2,
    Zap,
    Battery,
    Sun,
    Clock,
    Info
} from 'lucide-react';

const FranchiseProjectManagementService = () => {
    // State for selected customer
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // State for search term
    const [searchTerm, setSearchTerm] = useState('');

    // State for ticket form data
    const [ticketData, setTicketData] = useState({
        installation: '',
        issueType: '',
        component: '',
        description: ''
    });

    // State for showing success message
    const [showSuccess, setShowSuccess] = useState(false);

    // Customers data
    const customers = [
        {
            id: 1,
            name: 'Pardeep Singh',
            phone: '+91 9814812345',
            email: 'pardeep.singh@example.com',
            project: 'PRJ-001',
            consumer: 'CN-001',
            panel: '6 Panel (2.7 KW)',
            image: '../../assets/vendors/images/profile.png',
            installations: 2,
            installationsList: [
                { id: 'RES-1001', address: '12 Green Valley, Solar City' },
                { id: 'RES-2002', address: '45 Sun Light Apartment, Energy Nagar' }
            ]
        },
        {
            id: 2,
            name: 'Rahul Sharma',
            phone: '+91 9876543210',
            email: 'rahul.sharma@example.com',
            project: 'PRJ-002',
            consumer: 'CN-002',
            panel: '8 Panel (3.6 KW)',
            image: '../../assets/vendors/images/profile.png',
            installations: 1,
            installationsList: [
                { id: 'RES-3003', address: '78 Sunrise Avenue, Power City' }
            ]
        },
        {
            id: 3,
            name: 'Priya Patel',
            phone: '+91 8765432109',
            email: 'priya.patel@example.com',
            project: 'PRJ-003',
            consumer: 'CN-003',
            panel: '10 Panel (4.5 KW)',
            image: '../../assets/vendors/images/profile.png',
            installations: 2,
            installationsList: [
                { id: 'RES-4004', address: '123 Solar Heights, Green Park' },
                { id: 'RES-5005', address: '456 Energy Enclave, Power House Road' }
            ]
        },
        {
            id: 4,
            name: 'Amit Kumar',
            phone: '+91 9876543211',
            email: 'amit.kumar@example.com',
            project: 'PRJ-004',
            consumer: 'CN-004',
            panel: '6 Panel (2.7 KW)',
            image: '../../assets/vendors/images/profile.png',
            installations: 1,
            installationsList: [
                { id: 'RES-6006', address: '789 Renewable Residency, Eco City' }
            ]
        },
        {
            id: 5,
            name: 'Neha Gupta',
            phone: '+91 9876543212',
            email: 'neha.gupta@example.com',
            project: 'PRJ-005',
            consumer: 'CN-005',
            panel: '8 Panel (3.6 KW)',
            image: '../../assets/vendors/images/profile.png',
            installations: 2,
            installationsList: [
                { id: 'RES-7007', address: '321 Solar Street, Green Valley' },
                { id: 'RES-8008', address: '654 Power Lane, Energy Nagar' }
            ]
        }
    ];

    // Set default selected customer
    useEffect(() => {
        setSelectedCustomer(customers[0]);
    }, []);

    // Filter customers based on search term
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    // Handle customer selection
    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        // Reset form when customer changes
        setTicketData({
            installation: '',
            issueType: '',
            component: '',
            description: ''
        });
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTicketData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!ticketData.installation) {
            alert('Please select an installation');
            return;
        }
        if (!ticketData.issueType) {
            alert('Please select an issue type');
            return;
        }
        if (!ticketData.component) {
            alert('Please select a component');
            return;
        }
        if (!ticketData.description || ticketData.description.length < 30) {
            alert('Please provide a detailed description (minimum 30 characters)');
            return;
        }

        // In a real app, this would send the data to an API
        console.log('Submitting ticket:', {
            customer: selectedCustomer,
            ...ticketData
        });

        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Reset form
        setTicketData({
            installation: '',
            issueType: '',
            component: '',
            description: ''
        });
    };

    // Issue type options
    const issueTypes = [
        'Performance Issue',
        'Physical Damage',
        'Monitoring System Problem',
        'Billing Issue',
        'Other'
    ];

    // Component options
    const components = [
        'Solar Panel',
        'BOS Kit',
        'Inverter'
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4">
                <nav className="bg-white rounded-lg shadow-sm p-4">
                    <ol className="flex items-center">
                        <li className="flex-1">
                            <h3 className="text-xl font-bold text-blue-600">Raise Ticket</h3>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="flex flex-col lg:flex-row px-4">
                {/* Left Sidebar */}
                <div className="lg:w-1/4 pr-0 lg:pr-4 mb-4 lg:mb-0">
                    <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                        <h3 className="text-lg font-bold mb-2">Project Signup</h3>
                        <p className="text-sm text-gray-500 mb-4">Complete the signup process for your solar project</p>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Customer List */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {filteredCustomers.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => handleCustomerSelect(customer)}
                                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${selectedCustomer?.id === customer.id
                                            ? 'bg-blue-50 border border-blue-300'
                                            : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <img
                                        src={customer.image}
                                        alt={customer.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 text-left ml-3">
                                        <div className="font-semibold text-sm">{customer.name}</div>
                                        <div className="text-xs text-gray-500">Project: {customer.project}</div>
                                    </div>
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        {customer.panel.split(' ')[0]} {customer.panel.split(' ')[1]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content - Ticket Form */}
                <div className="lg:w-3/4">
                    {selectedCustomer && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            {/* Customer Info Card */}
                            <div className="bg-cyan-50 rounded-lg p-4 mb-4">
                                <h4 className="text-blue-600 font-semibold text-lg">{selectedCustomer.name}</h4>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center text-gray-600">
                                        <Phone size={16} className="mr-2" />
                                        <span>{selectedCustomer.phone}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Mail size={16} className="mr-2" />
                                        <span>{selectedCustomer.email}</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className="inline-block bg-orange-500 text-white text-sm px-3 py-1 rounded">
                                        {selectedCustomer.installations} Installation{selectedCustomer.installations > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Ticket Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Select Installation */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Solar Installations
                                    </label>
                                    <select
                                        name="installation"
                                        value={ticketData.installation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Installation</option>
                                        {selectedCustomer.installationsList.map((inst, index) => (
                                            <option key={index} value={inst.id}>
                                                {inst.id}: {inst.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Issue Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Issue Type
                                        </label>
                                        <select
                                            name="issueType"
                                            value={ticketData.issueType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Issue Type</option>
                                            {issueTypes.map((type, index) => (
                                                <option key={index} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Select Component */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Component
                                        </label>
                                        <select
                                            name="component"
                                            value={ticketData.component}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Component</option>
                                            {components.map((comp, index) => (
                                                <option key={index} value={comp}>{comp}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Detailed Description */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Detailed Description
                                    </label>
                                    <small className="text-gray-500 block mb-2">
                                        Please describe the issue in detail (minimum 30 characters)
                                    </small>
                                    <textarea
                                        name="description"
                                        value={ticketData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Detailed description..."
                                        required
                                        minLength="30"
                                    />
                                    {ticketData.description && ticketData.description.length < 30 && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Please enter at least {30 - ticketData.description.length} more characters
                                        </p>
                                    )}
                                </div>

                                {/* Urgent Issue Card */}
                                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                                    <h5 className="font-semibold text-red-700 flex items-center">
                                        <AlertCircle size={18} className="mr-2" />
                                        Urgent Issue
                                    </h5>
                                    <small className="text-gray-600 block mt-1">
                                        24 hours response - additional charges apply*
                                    </small>
                                </div>

                                {/* Media Attachments */}
                                <h4 className="font-semibold text-lg mb-1">Media Attachments</h4>
                                <small className="text-gray-500 block mb-3">
                                    Upload clear photos/videos showing the problem for better understanding
                                </small>

                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 flex items-center"
                                    >
                                        <Camera size={18} className="mr-2" />
                                        Image
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 flex items-center"
                                    >
                                        <Video size={18} className="mr-2" />
                                        Video
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-orange-500 text-white text-lg font-semibold rounded-md hover:bg-orange-600 transition-colors"
                                >
                                    Submit Support Ticket
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in">
                    <CheckCircle size={20} className="mr-2" />
                    Support ticket submitted successfully!
                </div>
            )}

            {/* Add custom animation styles */}
            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default FranchiseProjectManagementService;