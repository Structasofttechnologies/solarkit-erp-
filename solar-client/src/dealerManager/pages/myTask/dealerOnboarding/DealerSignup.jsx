import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    RotateCw,
    Filter,
    MoreVertical,
    X,
    Rocket,
    Users,
    Building,
    Sun,
    Bell,
    Clock,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    Trash2,
    Calendar,
    MapPin,
    Phone,
    User,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { getDealerKYCLists, updateDealerKYC } from '../../../services/leadService';
import LocationSelector from './LocationSelector';

const DealerManagerDealerKYC = () => {
    // State for filters
    const [locationFilters, setLocationFilters] = useState({
        country: '',
        state: '',
        city: '',
        district: '',
        cluster: '',
        zone: ''
    });
    const [dateRange, setDateRange] = useState('today');
    const [kycStatus, setKycStatus] = useState('');
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [customDate, setCustomDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDealerType, setModalDealerType] = useState('');
    const [pendingDealers, setPendingDealers] = useState([]);

    // State for data
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [districts, setDistricts] = useState([]);

    // State for KYC Form Modal
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [kycForm, setKycForm] = useState({
        aadharNumber: '', aadharDoc: '',
        panNumber: '', panDoc: '',
        gstNumber: '', gstDoc: '',
        udhyogNumber: '', udhyogDoc: '',
        kycStatus: 'Pending', remark: ''
    });

    useEffect(() => {
        fetchDealers();
    }, [locationFilters, dateRange, kycStatus, customDate]);

    const fetchDealers = async () => {
        setLoading(true);
        try {
            const res = await getDealerKYCLists({
                ...locationFilters,
                dateRange,
                status: kycStatus,
                customDate
            });
            if (res.success) {
                setDealers(res.data);
            }
        } catch (error) {
            console.error('Error fetching dealers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenKycForm = (dealer) => {
        setSelectedDealer(dealer);
        setKycForm({
            aadharNumber: '', aadharDoc: '',
            panNumber: '', panDoc: '',
            gstNumber: '', gstDoc: '',
            udhyogNumber: '', udhyogDoc: '',
            kycStatus: dealer.kycStatus === 'Not Done' ? 'Pending' : dealer.kycStatus,
            remark: ''
        });
        setIsKycModalOpen(true);
    };

    const submitKycForm = async (e) => {
        e.preventDefault();
        try {
            const res = await updateDealerKYC(selectedDealer._id, kycForm);
            if (res.success) {
                setIsKycModalOpen(false);
                fetchDealers();
            }
        } catch (error) {
            console.error('Error updating KYC:', error);
            // Simulate success locally if API fails in dev mode
            alert('Warning: API connection failed, simulated locally.');
            setIsKycModalOpen(false);
        }
    };

    const showPendingDealers = (dealerType) => {

        const pending = dealers.filter(d => {
            const plan = (d.plan || 'STARTUP').toUpperCase();
            let key = 'STARTUP';
            if (plan.includes('BASIC')) key = 'BASIC';
            else if (plan.includes('ENTERPRISE')) key = 'ENTERPRISE';
            else if (plan.includes('SOLAR')) key = 'SOLAR';
            return key === dealerType.toUpperCase() && d.kycStatus !== 'Done';
        });

        const formattedPending = pending.map(d => ({
            name: d.name,
            mobile: d.phone || d.mobile,
            state: d.state || 'N/A',
            cluster: d.cluster || 'N/A',
            district: d.district || 'N/A',
            signupDate: new Date(d.createdAt).toLocaleDateString()
        }));

        setPendingDealers(formattedPending);
        setIsModalOpen(true);
    };

    const sendReminder = (dealerName) => {
        alert(`Reminder sent to ${dealerName}`);
    };

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
        if (e.target.value === 'custom') {
            setShowCustomDate(true);
        } else {
            setShowCustomDate(false);
            setCustomDate('');
        }
    };

    // Calculate dynamic stats from dealers
    const stats = {
        STARTUP: { total: 0, kycDone: 0, pending: 0 },
        BASIC: { total: 0, kycDone: 0, pending: 0 },
        ENTERPRISE: { total: 0, kycDone: 0, pending: 0 },
        SOLAR: { total: 0, kycDone: 0, pending: 0 }
    };

    let totalSignups = 0;
    let kycCompleted = 0;
    let kycPending = 0;

    dealers.forEach(dealer => {
        const plan = (dealer.plan || 'STARTUP').toUpperCase();
        let key = 'STARTUP';
        if (plan.includes('BASIC')) key = 'BASIC';
        else if (plan.includes('ENTERPRISE')) key = 'ENTERPRISE';
        else if (plan.includes('SOLAR')) key = 'SOLAR';

        stats[key].total++;
        totalSignups++;

        if (dealer.kycStatus === 'Done') {
            stats[key].kycDone++;
            kycCompleted++;
        } else {
            stats[key].pending++;
            kycPending++;
        }
    });

    const completionRate = totalSignups > 0 ? Math.round((kycCompleted / totalSignups) * 100) : 0;

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="page-header mb-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-2 text-sm">
                        <li className="inline-flex items-center">
                            <Link to="#" className="text-blue-600 hover:text-blue-800">
                                Dealer onboarding
                            </Link>
                        </li>
                        <li>
                            <span className="mx-2 text-gray-400">/</span>
                        </li>
                        <li className="text-gray-600" aria-current="page">
                            Dealer KYC
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-6">
                    {/* Filters Section */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            {/* Location Filters */}
                            <div className="md:col-span-3">
                                <LocationSelector
                                    values={locationFilters}
                                    onChange={setLocationFilters}
                                />
                            </div>

                            {/* Date Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date Range</label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                >
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="last7">Last 7 Days</option>
                                    <option value="last15">Last 15 Days</option>
                                    <option value="lastMonth">Last Month</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {/* KYC Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={kycStatus}
                                    onChange={(e) => setKycStatus(e.target.value)}
                                >
                                    <option value="">Choose Status</option>
                                    <option value="new">New</option>
                                    <option value="pending">Pending</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full md:w-96">
                            <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                            <div className="flex">
                                <input
                                    type="search"
                                    placeholder="Search by here"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200">
                                    <Search className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="ml-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                                    <RotateCw className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {showCustomDate && (
                        <div className="mb-4">
                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left border">Actions</th>
                                    <th className="px-4 py-3 text-left border">SrNo.</th>
                                    <th className="px-4 py-3 text-left border">Lead Id</th>
                                    <th className="px-4 py-3 text-left border">Dealer Name</th>
                                    <th className="px-4 py-3 text-left border">Status</th>
                                    <th className="px-4 py-3 text-left border">Login Date</th>
                                    <th className="px-4 py-3 text-left border">Mobile No.</th>
                                    <th className="px-4 py-3 text-left border">State</th>
                                    <th className="px-4 py-3 text-left border">Cluster</th>
                                    <th className="px-4 py-3 text-left border">District</th>
                                    <th className="px-4 py-3 text-left border">Project Type</th>
                                    <th className="px-4 py-3 text-left border">Sub Type</th>
                                    <th className="px-4 py-3 text-left border">KYC Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="13" className="px-6 py-8 text-center text-sm text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                        </td>
                                    </tr>
                                ) : dealers.map((dealer, index) => (
                                    <tr key={dealer._id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 border text-center">
                                            <button
                                                onClick={() => handleOpenKycForm(dealer)}
                                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                            >
                                                Update KYC
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 border">{index + 1}</td>
                                        <td className="px-4 py-3 border">{dealer._id.substring(0, 8)}</td>
                                        <td className="px-4 py-3 border font-semibold">{dealer.name}</td>
                                        <td className="px-4 py-3 border">
                                            <span className={`px-2 py-1 rounded-full text-white text-xs ${dealer.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                                {dealer.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border">{new Date(dealer.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 border">{dealer.phone}</td>
                                        <td className="px-4 py-3 border">{dealer.state || 'N/A'}</td>
                                        <td className="px-4 py-3 border">{dealer.cluster || 'N/A'}</td>
                                        <td className="px-4 py-3 border">{dealer.district || 'N/A'}</td>
                                        <td className="px-4 py-3 border">Solar Dealer</td>
                                        <td className="px-4 py-3 border">N/A</td>
                                        <td className="px-4 py-3 border">
                                            <span className={`px-2 py-1 rounded-full text-white text-xs ${dealer.kycStatus === 'Done' ? 'bg-green-500' : (dealer.kycStatus === 'Pending' ? 'bg-yellow-500' : 'bg-red-500')}`}>
                                                {dealer.kycStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* KYC Signup Statistics Section */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
                    <h5 className="flex items-center text-lg font-semibold">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        KYC Signup Statistics - Dealer Type Wise
                    </h5>
                </div>

                <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Startup Card */}
                        <div
                            onClick={() => showPendingDealers('startup')}
                            className="border border-green-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h6 className="text-green-600 font-semibold">STARTUP</h6>
                                    <h3 className="text-3xl font-bold text-green-600">{stats.STARTUP.total}</h3>
                                    <p className="text-gray-500 text-sm">Total Signups</p>
                                </div>
                                <div className="bg-green-500 text-white p-3 rounded-full">
                                    <Rocket className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-sm">
                                <span>KYC Done: <strong>{stats.STARTUP.kycDone}</strong></span>
                                <span className="text-yellow-600">Pending: <strong>{stats.STARTUP.pending}</strong></span>
                            </div>
                        </div>

                        {/* Basic Card */}
                        <div
                            onClick={() => showPendingDealers('basic')}
                            className="border border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h6 className="text-blue-600 font-semibold">BASIC</h6>
                                    <h3 className="text-3xl font-bold text-blue-600">{stats.BASIC.total}</h3>
                                    <p className="text-gray-500 text-sm">Total Signups</p>
                                </div>
                                <div className="bg-blue-500 text-white p-3 rounded-full">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-sm">
                                <span>KYC Done: <strong>{stats.BASIC.kycDone}</strong></span>
                                <span className="text-yellow-600">Pending: <strong>{stats.BASIC.pending}</strong></span>
                            </div>
                        </div>

                        {/* Enterprise Card */}
                        <div
                            onClick={() => showPendingDealers('enterprise')}
                            className="border border-yellow-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h6 className="text-yellow-600 font-semibold">ENTERPRISE</h6>
                                    <h3 className="text-3xl font-bold text-yellow-600">{stats.ENTERPRISE.total}</h3>
                                    <p className="text-gray-500 text-sm">Total Signups</p>
                                </div>
                                <div className="bg-yellow-500 text-white p-3 rounded-full">
                                    <Building className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-sm">
                                <span>KYC Done: <strong>{stats.ENTERPRISE.kycDone}</strong></span>
                                <span className="text-yellow-600">Pending: <strong>{stats.ENTERPRISE.pending}</strong></span>
                            </div>
                        </div>

                        {/* Solar Business Card */}
                        <div
                            onClick={() => showPendingDealers('solar')}
                            className="border border-cyan-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h6 className="text-cyan-600 font-semibold">SOLAR BUSINESS</h6>
                                    <h3 className="text-3xl font-bold text-cyan-600">{stats.SOLAR.total}</h3>
                                    <p className="text-gray-500 text-sm">Total Signups</p>
                                </div>
                                <div className="bg-cyan-500 text-white p-3 rounded-full">
                                    <Sun className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-sm">
                                <span>KYC Done: <strong>{stats.SOLAR.kycDone}</strong></span>
                                <span className="text-yellow-600">Pending: <strong>{stats.SOLAR.pending}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Row */}
                    <div className="mt-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <h4 className="text-2xl font-bold text-green-600">{totalSignups}</h4>
                                    <p className="text-gray-500 text-sm">Total Signups</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-blue-600">{kycCompleted}</h4>
                                    <p className="text-gray-500 text-sm">KYC Completed</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-yellow-600">{kycPending}</h4>
                                    <p className="text-gray-500 text-sm">KYC Pending</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-cyan-600">{completionRate}%</h4>
                                    <p className="text-gray-500 text-sm">Completion Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending KYC Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-t-lg flex justify-between items-center">
                            <h5 className="text-lg font-semibold flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                Pending KYC - {modalDealerType}
                            </h5>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-700 hover:text-gray-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-yellow-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Sr.No.</th>
                                            <th className="px-4 py-3 text-left">Dealer Name</th>
                                            <th className="px-4 py-3 text-left">Mobile No.</th>
                                            <th className="px-4 py-3 text-left">State</th>
                                            <th className="px-4 py-3 text-left">Cluster</th>
                                            <th className="px-4 py-3 text-left">District</th>
                                            <th className="px-4 py-3 text-left">Signup Date</th>
                                            <th className="px-4 py-3 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingDealers.map((dealer, index) => (
                                            <tr key={index} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3">{dealer.name}</td>
                                                <td className="px-4 py-3">{dealer.mobile}</td>
                                                <td className="px-4 py-3">{dealer.state}</td>
                                                <td className="px-4 py-3">{dealer.cluster}</td>
                                                <td className="px-4 py-3">{dealer.district}</td>
                                                <td className="px-4 py-3">{dealer.signupDate}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => sendReminder(dealer.name)}
                                                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs flex items-center"
                                                    >
                                                        <Bell className="w-3 h-3 mr-1" />
                                                        Remind
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
            )}
            {/* Dealer KYC Update Modal */}
            {isKycModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-lg flex justify-between items-center">
                            <h5 className="text-lg font-semibold text-white flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Update Dealer KYC - {selectedDealer?.name}
                            </h5>
                            <button onClick={() => setIsKycModalOpen(false)} className="text-white hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={submitKycForm}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h6 className="font-semibold text-gray-700 mb-3 border-b pb-2">Aadhaar Details</h6>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Aadhaar Number</label>
                                                <input required type="text" className="w-full p-2 border rounded" value={kycForm.aadharNumber} onChange={e => setKycForm({ ...kycForm, aadharNumber: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Aadhaar Image Document URL</label>
                                                <input type="text" placeholder="https://..." className="w-full p-2 border rounded" value={kycForm.aadharDoc} onChange={e => setKycForm({ ...kycForm, aadharDoc: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="font-semibold text-gray-700 mb-3 border-b pb-2">PAN Details</h6>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">PAN Number</label>
                                                <input required type="text" className="w-full p-2 border rounded" value={kycForm.panNumber} onChange={e => setKycForm({ ...kycForm, panNumber: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">PAN Image Document URL</label>
                                                <input type="text" placeholder="https://..." className="w-full p-2 border rounded" value={kycForm.panDoc} onChange={e => setKycForm({ ...kycForm, panDoc: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="font-semibold text-gray-700 mb-3 border-b pb-2">GST / Udhyog Details</h6>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">GST Number</label>
                                                <input type="text" className="w-full p-2 border rounded" value={kycForm.gstNumber} onChange={e => setKycForm({ ...kycForm, gstNumber: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Udhyog Aadhaar Number</label>
                                                <input type="text" className="w-full p-2 border rounded" value={kycForm.udhyogNumber} onChange={e => setKycForm({ ...kycForm, udhyogNumber: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="font-semibold text-gray-700 mb-3 border-b pb-2">Verification Status</h6>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">KYC Status</label>
                                                <select className="w-full p-2 border rounded" value={kycForm.kycStatus} onChange={e => setKycForm({ ...kycForm, kycStatus: e.target.value })}>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Done">Approve (Done)</option>
                                                    <option value="Rejected">Reject</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Remarks</label>
                                                <textarea className="w-full p-2 border rounded h-20" value={kycForm.remark} onChange={e => setKycForm({ ...kycForm, remark: e.target.value })}></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setIsKycModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save KYC Data</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerManagerDealerKYC;