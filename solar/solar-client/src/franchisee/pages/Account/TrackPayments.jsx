// FranchiseAccountTrackPayment.jsx
import React, { useState } from 'react';
import {
    MapPin,
    Search,
    Building,
    Users,
    ArrowLeft,
    CreditCard,
    Calendar,
    IndianRupee,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { locationAPI } from '../../../api/api';

const FranchiseAccountTrackPayment = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showInfoCards, setShowInfoCards] = useState(false);
    const [currentView, setCurrentView] = useState('info'); // 'info', 'dealers', 'agents', 'dealerFilters', 'agentFilters'
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [filters, setFilters] = useState({
        paymentStatus: 'All',
        paymentType: 'All',
        projectCategory: 'All',
        projectSubCategory: 'All',
        projectType: 'All',
        projectSubType: 'All'
    });

    const [districts, setDistricts] = useState([
        { id: 'All', name: 'All' }
    ]);

    React.useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    const dynamicDistricts = response.data.data.map(d => ({
                        id: d.name, // matching existing logic where ID is name
                        name: d.name
                    }));
                    setDistricts([{ id: 'All', name: 'All' }, ...dynamicDistricts]);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    const dealers = [
        { name: 'Pardeepbhai', phone: '+91 9876543210' },
        { name: 'Rajeshbhai', phone: '+91 8765432109' },
        { name: 'Sunilbhai', phone: '+91 7654321098' }
    ];

    const agents = [
        { name: 'Rameshbhai', phone: '+91 9988776655' },
        { name: 'Maheshbhai', phone: '+91 8899776655' }
    ];

    const paymentData = [
        {
            customerName: 'John Doe',
            signupDate: '15-05-2023',
            projectSubCategory: 'Residential',
            kiloWatts: '5.2 kw',
            tokenAmount: '₹10,000',
            tokenDate: '16-05-2023',
            pendingPayments: '₹25,000',
            pendingDays: '5',
            paymentType: 'Cash',
            loanDownPayment: '-',
            loanAmount: '-',
            status: 'Pending'
        },
        {
            customerName: 'Jane Smith',
            signupDate: '01-06-2023',
            projectSubCategory: 'Residential',
            kiloWatts: '7.5 kw',
            tokenAmount: '₹15,000',
            tokenDate: '02-06-2023',
            pendingPayments: '-',
            pendingDays: '-',
            paymentType: 'Loan',
            loanDownPayment: '₹50,000',
            loanAmount: '₹2,00,000',
            status: 'Paid'
        }
    ];

    const handleDistrictClick = (district) => {
        setSelectedDistrict(district);
        setCurrentView('info');
        setSelectedDealer(null);
        setSelectedAgent(null);
        setShowInfoCards(district !== 'All');
    };

    const handleShowDetails = (type) => {
        setCurrentView(type);
    };

    const handleHideDetails = () => {
        setCurrentView('info');
    };

    const handleSelectDealer = (dealer) => {
        setSelectedDealer(dealer);
        setCurrentView('dealerFilters');
    };

    const handleSelectAgent = (agent) => {
        setSelectedAgent(agent);
        setCurrentView('agentFilters');
    };

    const handleBackToList = () => {
        setCurrentView('info');
        setSelectedDealer(null);
        setSelectedAgent(null);
    };

    const handleBackToDealerList = () => {
        setCurrentView('dealers');
    };

    const handleBackToAgentList = () => {
        setCurrentView('agents');
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200"><Clock size={12} className="mr-1" />Pending</span>;
            case 'paid':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200"><CheckCircle size={12} className="mr-1" />Paid</span>;
            case 'overdue':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200"><AlertCircle size={12} className="mr-1" />Overdue</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"><XCircle size={12} className="mr-1" />{status}</span>;
        }
    };

    const filteredPayments = paymentData.filter(payment =>
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-4 max-w-7xl">
            {/* Title Section */}
            <div className="bg-white rounded-lg shadow-sm mb-3 border-0">
                <div className="p-4">
                    <h4 className="text-xl font-bold text-blue-600 mb-0">Track Payments</h4>
                </div>
            </div>

            {/* Search Box */}
            <div className="mb-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by customer name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* District Cards */}
            <div className="flex overflow-x-auto mb-3 space-x-2 pb-1">
                {districts.map((district) => (
                    <div
                        key={district.id}
                        className={`min-w-[160px] cursor-pointer rounded-lg border transition-all duration-300 ${selectedDistrict === district.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:shadow-md'
                            }`}
                        onClick={() => handleDistrictClick(district.id)}
                    >
                        <div className="p-4 text-center">
                            <MapPin
                                size={18}
                                className={`mx-auto mb-1 ${selectedDistrict === district.id ? 'text-white' : 'text-gray-600'
                                    }`}
                            />
                            <div className="font-semibold text-sm">{district.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Cards (Dealers & Agents) */}
            {showInfoCards && currentView === 'info' && (
                <div className="flex justify-center mb-3 space-x-3">
                    {/* Dealers Card */}
                    <div
                        className="w-40 cursor-pointer bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
                        onClick={() => handleShowDetails('dealers')}
                    >
                        <div className="p-4 text-center">
                            <Building size={22} className="mx-auto mb-1 text-blue-600" />
                            <h6 className="text-blue-600 font-semibold text-sm mb-0">Dealers</h6>
                            <small className="text-gray-500 text-xs">3 dealers</small>
                        </div>
                    </div>

                    {/* Agents Card */}
                    <div
                        className="w-40 cursor-pointer bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
                        onClick={() => handleShowDetails('agents')}
                    >
                        <div className="p-4 text-center">
                            <Users size={22} className="mx-auto mb-1 text-blue-600" />
                            <h6 className="text-blue-600 font-semibold text-sm mb-0">Commission Agents</h6>
                            <small className="text-gray-500 text-xs">1 agent</small>
                        </div>
                    </div>
                </div>
            )}

            {/* Dealers List */}
            {currentView === 'dealers' && (
                <div className="bg-white rounded-lg shadow-sm border-0 mb-3">
                    <div className="p-4">
                        <div className="flex items-center mb-2">
                            <ArrowLeft
                                size={18}
                                className="mr-2 cursor-pointer text-gray-600 hover:text-gray-900"
                                onClick={handleHideDetails}
                            />
                            <h6 className="font-bold mb-0">Dealers in {selectedDistrict}</h6>
                        </div>
                        <hr className="my-2" />
                        <div className="space-y-2">
                            {dealers.map((dealer, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    onClick={() => handleSelectDealer(dealer)}
                                >
                                    <strong className="text-blue-600 block">{dealer.name}</strong>
                                    <small className="text-gray-500">{dealer.phone}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Agents List */}
            {currentView === 'agents' && (
                <div className="bg-white rounded-lg shadow-sm border-0 mb-3">
                    <div className="p-4">
                        <div className="flex items-center mb-2">
                            <ArrowLeft
                                size={18}
                                className="mr-2 cursor-pointer text-gray-600 hover:text-gray-900"
                                onClick={handleHideDetails}
                            />
                            <h6 className="font-bold mb-0">Commission Agents in {selectedDistrict}</h6>
                        </div>
                        <hr className="my-2" />
                        <div className="space-y-2">
                            {agents.map((agent, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    onClick={() => handleSelectAgent(agent)}
                                >
                                    <strong className="text-blue-600 block">{agent.name}</strong>
                                    <small className="text-gray-500">{agent.phone}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dealer Filters */}
            {currentView === 'dealerFilters' && selectedDealer && (
                <div className="bg-white rounded-lg shadow-sm border-0 mb-3">
                    <div className="p-4">
                        <div className="flex items-center mb-3">
                            <ArrowLeft
                                size={18}
                                className="mr-2 cursor-pointer text-gray-600 hover:text-gray-900"
                                onClick={handleBackToDealerList}
                            />
                            <h6 className="font-bold mb-0">Selected: <span className="text-blue-600">{selectedDealer.name}</span></h6>
                        </div>
                    </div>
                </div>
            )}

            {/* Agent Filters */}
            {currentView === 'agentFilters' && selectedAgent && (
                <div className="bg-white rounded-lg shadow-sm border-0 mb-3">
                    <div className="p-4">
                        <div className="flex items-center mb-3">
                            <ArrowLeft
                                size={18}
                                className="mr-2 cursor-pointer text-gray-600 hover:text-gray-900"
                                onClick={handleBackToAgentList}
                            />
                            <h6 className="font-bold mb-0">Selected: <span className="text-blue-600">{selectedAgent.name}</span></h6>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border-0 mb-3">
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">Payment Status</label>
                            <select
                                className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.paymentStatus}
                                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                            >
                                <option>All</option>
                                <option>Pending</option>
                                <option>Paid</option>
                                <option>Overdue</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">Payment Type</label>
                            <select
                                className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.paymentType}
                                onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                            >
                                <option>All</option>
                                <option>Cash</option>
                                <option>Loan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">Project Category</label>
                            <select
                                className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.projectCategory}
                                onChange={(e) => handleFilterChange('projectCategory', e.target.value)}
                            >
                                <option>All</option>
                                <option>SolarPump</option>
                                <option>SolarRooftop</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">Project Sub-Category</label>
                            <select
                                className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.projectSubCategory}
                                onChange={(e) => handleFilterChange('projectSubCategory', e.target.value)}
                            >
                                <option>All</option>
                                <option>Residential</option>
                                <option>Commercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">Project Type</label>
                            <select
                                className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.projectType}
                                onChange={(e) => handleFilterChange('projectType', e.target.value)}
                            >
                                <option>All</option>
                                <option>1KW</option>
                                <option>2KW</option>
                                <option>3KW</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">Project Sub-Type</label>
                            <select
                                className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.projectSubType}
                                onChange={(e) => handleFilterChange('projectSubType', e.target.value)}
                            >
                                <option>All</option>
                                <option>Hybrid</option>
                                <option>Off-Grid</option>
                                <option>On-Grid</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Payment Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="py-3 px-2 text-left whitespace-nowrap">Customer Name</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Project Signup Date</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Project Sub-Category</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">KiloWatts</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Token Amount</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Token Date</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Pending Payments</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Pending Days</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Payment Type</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Loan Down Payment</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Loan Amount</th>
                                <th className="py-3 px-2 text-left whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((payment, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-2">{payment.customerName}</td>
                                    <td className="py-2 px-2 whitespace-nowrap">{payment.signupDate}</td>
                                    <td className="py-2 px-2">{payment.projectSubCategory}</td>
                                    <td className="py-2 px-2">{payment.kiloWatts}</td>
                                    <td className="py-2 px-2">{payment.tokenAmount}</td>
                                    <td className="py-2 px-2 whitespace-nowrap">{payment.tokenDate}</td>
                                    <td className="py-2 px-2">{payment.pendingPayments}</td>
                                    <td className="py-2 px-2">{payment.pendingDays}</td>
                                    <td className="py-2 px-2">{payment.paymentType}</td>
                                    <td className="py-2 px-2">{payment.loanDownPayment}</td>
                                    <td className="py-2 px-2">{payment.loanAmount}</td>
                                    <td className="py-2 px-2">{getStatusBadge(payment.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FranchiseAccountTrackPayment;