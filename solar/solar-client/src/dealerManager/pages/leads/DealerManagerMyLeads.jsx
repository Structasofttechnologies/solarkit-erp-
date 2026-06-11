import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    RotateCw,
    Filter,
    Plus,
    Upload,
    MoreVertical,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    X,
    Phone,
    User,
    MapPin,
    CheckCircle,
    Clock as ClockIcon,
    Loader2
} from 'lucide-react';
import { getLeads, createLead, getFollowUps, scheduleFollowUp, convertLeadToDealer } from '../../services/leadService';
import {
    getStatesHierarchy,
    getClustersHierarchy,
    getDistrictsHierarchy,
    getCitiesHierarchy,
    getDistricts
} from '../../../services/core/locationApi';
const DealerManagerMyLeads = () => {
    // State for modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
    const [isAddFollowupModalOpen, setIsAddFollowupModalOpen] = useState(false);

    // State for filters
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [dateRange, setDateRange] = useState('today');
    const [customDate, setCustomDate] = useState('');
    const [showCustomDate, setShowCustomDate] = useState(false);

    // State for follow-up section
    const [activeDay, setActiveDay] = useState('today');
    const [activeTimeSlot, setActiveTimeSlot] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');

    // State for data
    const [leads, setLeads] = useState([]);
    const [followups, setFollowups] = useState({
        today: [], tomorrow: [], thisWeek: [], nextWeek: [], overdue: []
    });
    const [loading, setLoading] = useState(true);

    // Form state for creating Lead
    const [formData, setFormData] = useState({
        name: '', mobile: '', state: '', cluster: '', district: '', city: '', rural: '', sourceOfMedia: '', profession: ''
    });

    // Location States
    const [states, setStates] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [filterDistricts, setFilterDistricts] = useState([]);

    useEffect(() => {
        getDistricts().then(res => setFilterDistricts(res || [])).catch(console.error);
    }, []);

    useEffect(() => {
        if (isAddModalOpen && states.length === 0) {
            getStatesHierarchy().then(res => setStates(res || [])).catch(console.error);
        }
    }, [isAddModalOpen]);

    const handleStateChange = async (e) => {
        const stateId = e.target.value;
        setFormData({ ...formData, state: stateId, cluster: '', district: '', city: '' });
        setClusters([]); setDistricts([]); setCities([]);
        if (stateId) {
            try {
                const res = await getClustersHierarchy(stateId);
                setClusters(res || []);
            } catch (error) { console.error(error); }
        }
    };

    const handleClusterChange = async (e) => {
        const clusterId = e.target.value;
        setFormData({ ...formData, cluster: clusterId, district: '', city: '' });
        setDistricts([]); setCities([]);
        if (clusterId) {
            try {
                const res = await getDistrictsHierarchy(clusterId);
                setDistricts(res || []);
            } catch (error) { console.error(error); }
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setFormData({ ...formData, district: districtId, city: '' });
        setCities([]);
        if (districtId) {
            try {
                const res = await getCitiesHierarchy(districtId);
                setCities(res || []);
            } catch (error) { console.error(error); }
        }
    };

    // Filter State
    const [filterParams, setFilterParams] = useState({ district: '', status: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadsData, followUpsData] = await Promise.all([
                getLeads({ search: searchTerm, ...filterParams }),
                getFollowUps()
            ]);
            if (leadsData.success) {
                setLeads(leadsData.data);
            }
            if (followUpsData.success) {
                // Simplistic bucket sorting based on date logic could go here
                // For now, mapping everything to 'today' just to show integration and avoid breaking UI
                setFollowups({
                    today: followUpsData.data.map(t => ({
                        id: t._id, name: t.linkedLead?.name, leadId: t.linkedLead?._id?.substring(0, 6), mobile: t.linkedLead?.mobile, time: new Date(t.deadline).toLocaleTimeString(), status: t.status === 'Completed' ? 'border-green-500' : 'border-blue-500'
                    })),
                    tomorrow: [],
                    thisWeek: [],
                    nextWeek: [],
                    overdue: []
                });
            }
        } catch (err) {
            console.error("Error fetching leads/followups", err);
        } finally {
            setLoading(false);
        }
    };

    // Time slots for today/tomorrow
    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '01:00 PM', '02:00 PM',
        '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    const handleDateRangeChange = (e) => {
        const value = e.target.value;
        setDateRange(value);
        setShowCustomDate(value === 'custom');
    };

    const openFollowupModal = (lead) => {
        setSelectedLead(lead);
        setIsAddFollowupModalOpen(true);
    };

    const handleAddFollowup = async (e) => {
        e.preventDefault();
        try {
            await scheduleFollowUp({ leadId: selectedLead._id, date: document.getElementById('fu-date').value, time: document.getElementById('fu-time').value, notes: document.getElementById('fu-notes').value });
            alert('New follow-up scheduled successfully!');
            setIsAddFollowupModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to schedule follow up');
        }
    };

    const markAsCompleted = (followupId) => {
        alert('Follow-up marked as completed!');
    };

    const handleConvertLead = async (id) => {
        if (!window.confirm("Convert this lead into a Dealer?")) return;
        try {
            await convertLeadToDealer(id);
            alert("Lead converted successfully");
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Conversion failed');
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveLead = async () => {
        try {
            await createLead(formData);
            alert("Lead created successfully");
            setIsAddModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to create lead');
        }
    };

    const filterFollowupsByTime = (timeSlot) => {
        setActiveTimeSlot(timeSlot);
        alert(`${timeSlot} followup's`);
    };

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="page-header mb-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-2 text-sm">
                        <li className="inline-flex items-center">
                            <Link to="/dealer-manager/leads" className="text-blue-600 hover:text-blue-800">
                                Leads
                            </Link>
                        </li>
                        <li>
                            <span className="mx-2 text-gray-400">/</span>
                        </li>
                        <li className="text-gray-600" aria-current="page">
                            MY Leads
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                {/* Actions Bar */}
                <div className="p-4 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {/* Add Button */}
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-[#0f4e8d] text-white rounded-full hover:bg-[#0a3a6b] transition-colors text-sm font-semibold"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                ADD
                            </button>

                            {/* Filter Button */}
                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-[#0f4e8d] text-white rounded-full hover:bg-[#0a3a6b] transition-colors text-sm font-semibold"
                            >
                                <Filter className="w-4 h-4 mr-1" />
                                Filter
                            </button>

                            {/* Import Lead Button */}
                            <button className="inline-flex items-center px-4 py-2 bg-[#0f4e8d] text-white rounded-full hover:bg-[#0a3a6b] transition-colors text-sm font-semibold">
                                <Upload className="w-4 h-4 mr-1" />
                                Import Lead
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md">
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
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#0f4e8d] text-white">
                            <tr>
                                <th className="px-4 py-3 text-center font-medium">Actions</th>
                                <th className="px-4 py-3 text-center font-medium">SrNo.</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-center font-medium">Lead Id</th>
                                <th className="px-4 py-3 text-center font-medium">Name</th>
                                <th className="px-4 py-3 text-center font-medium">Mobile No.</th>
                                <th className="px-4 py-3 text-center font-medium">Designation</th>
                                <th className="px-4 py-3 text-center font-medium">Follow-up</th>
                                <th className="px-4 py-3 text-center font-medium">Confirm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : leads.map((lead, index) => (
                                <tr key={lead._id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center">
                                        <div className="relative">
                                            <button className="p-1 hover:bg-gray-100 rounded-full">
                                                <MoreVertical className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs">{index + 1}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block px-3 py-1 ${lead.status === 'Converted' ? 'bg-green-500' : 'bg-pink-500'} text-white text-xs rounded-full`}>
                                            {lead.status || 'New'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">{lead._id?.substring(0, 8)}</td>
                                    <td className="px-4 py-3 text-center">{lead.name}</td>
                                    <td className="px-4 py-3 text-center">{lead.mobile}</td>
                                    <td className="px-4 py-3 text-center">{lead.profession || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => openFollowupModal(lead)}
                                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                                        >
                                            Follow-up
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {lead.status !== 'Converted' && (
                                            <button onClick={() => handleConvertLead(lead._id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">
                                                convert
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">1-10 of 14 entries</div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">1</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Follow-up Schedule Section */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
                    <h5 className="flex items-center text-lg font-semibold">
                        <Calendar className="w-5 h-5 mr-2" />
                        Follow-up Schedule
                    </h5>
                </div>

                <div className="p-4">
                    {/* Day Navigation */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setActiveDay('overdue')}
                            className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center ${activeDay === 'overdue'
                                ? 'bg-red-500 text-white'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                        >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Overdue <span className="ml-1 bg-white bg-opacity-20 px-2 rounded-full">3</span>
                        </button>
                        <button
                            onClick={() => setActiveDay('today')}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeDay === 'today'
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setActiveDay('tomorrow')}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeDay === 'tomorrow'
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                        >
                            Tomorrow
                        </button>
                        <button
                            onClick={() => setActiveDay('thisWeek')}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeDay === 'thisWeek'
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setActiveDay('nextWeek')}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeDay === 'nextWeek'
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                        >
                            Next Week
                        </button>
                    </div>

                    {/* Time Slots - Show for today/tomorrow */}
                    {(activeDay === 'today' || activeDay === 'tomorrow') && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => filterFollowupsByTime(slot)}
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${activeTimeSlot === slot
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Follow-up Content */}
                    <div>
                        {activeDay === 'overdue' && (
                            <div>
                                <h6 className="text-red-500 font-semibold mb-3 flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Overdue Follow-ups
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {followups.overdue.map((item) => (
                                        <div key={item.id} className={`border-l-4 border-red-500 bg-white rounded-lg shadow-sm p-3`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h6 className="font-semibold">{item.name}</h6>
                                                    <p className="text-xs text-gray-500">Lead ID: {item.leadId}</p>
                                                    <p className="text-xs text-gray-500">Mobile: {item.mobile}</p>
                                                    <p className="text-xs text-red-500 mt-1">Overdue: {item.overdue}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={() => markAsCompleted(item.id)}
                                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    Mark Done
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeDay === 'today' && (
                            <div>
                                <h6 className="text-blue-500 font-semibold mb-3 flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-2" />
                                    Today's Follow-ups
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {followups.today.map((item) => (
                                        <div key={item.id} className={`border-l-4 ${item.status} bg-white rounded-lg shadow-sm p-3`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h6 className="font-semibold">{item.name}</h6>
                                                    <p className="text-xs text-gray-500">Lead ID: {item.leadId}</p>
                                                    <p className="text-xs text-gray-500">Mobile: {item.mobile}</p>
                                                    <p className="text-xs text-gray-500">Time: {item.time}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={() => markAsCompleted(item.id)}
                                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    Mark Done
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeDay === 'tomorrow' && (
                            <div>
                                <h6 className="text-blue-500 font-semibold mb-3 flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-2" />
                                    Tomorrow's Follow-ups
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {followups.tomorrow.map((item) => (
                                        <div key={item.id} className={`border-l-4 ${item.status} bg-white rounded-lg shadow-sm p-3`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h6 className="font-semibold">{item.name}</h6>
                                                    <p className="text-xs text-gray-500">Lead ID: {item.leadId}</p>
                                                    <p className="text-xs text-gray-500">Mobile: {item.mobile}</p>
                                                    <p className="text-xs text-gray-500">Time: {item.time}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={() => markAsCompleted(item.id)}
                                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    Mark Done
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeDay === 'thisWeek' && (
                            <div>
                                <h6 className="text-blue-500 font-semibold mb-3 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    This Week's Follow-ups
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {followups.thisWeek.map((item) => (
                                        <div key={item.id} className={`border-l-4 ${item.status} bg-white rounded-lg shadow-sm p-3`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h6 className="font-semibold">{item.name}</h6>
                                                    <p className="text-xs text-gray-500">Lead ID: {item.leadId}</p>
                                                    <p className="text-xs text-gray-500">Mobile: {item.mobile}</p>
                                                    <p className="text-xs text-gray-500">Date: {item.date}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={() => markAsCompleted(item.id)}
                                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    Mark Done
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeDay === 'nextWeek' && (
                            <div>
                                <h6 className="text-blue-500 font-semibold mb-3 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Next Week's Follow-ups
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {followups.nextWeek.map((item) => (
                                        <div key={item.id} className={`border-l-4 ${item.status} bg-white rounded-lg shadow-sm p-3`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h6 className="font-semibold">{item.name}</h6>
                                                    <p className="text-xs text-gray-500">Lead ID: {item.leadId}</p>
                                                    <p className="text-xs text-gray-500">Mobile: {item.mobile}</p>
                                                    <p className="text-xs text-gray-500">Date: {item.date}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={() => markAsCompleted(item.id)}
                                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    Mark Done
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Lead Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xl font-bold text-gray-800">Add Lead</h4>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-2xl hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form>
                                <div className="mb-4">
                                    <h6 className="text-[#0f4e8d] font-semibold flex items-center">
                                        <span className="mr-2">▶</span> Lead
                                    </h6>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Channel Partner Lead No.</label>
                                        <input type="text" className="w-full p-2 border rounded bg-gray-100" value="CP/24-25/013" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date:</label>
                                        <input type="date" className="w-full p-2 border rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input type="text" name="name" className="w-full p-2 border rounded" value={formData.name} onChange={handleFormChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone No.</label>
                                        <input type="text" name="mobile" className="w-full p-2 border rounded" value={formData.mobile} onChange={handleFormChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <select name="state" className="w-full p-2 border rounded" value={formData.state} onChange={handleStateChange}>
                                            <option value="">Select State</option>
                                            {states.map(state => (
                                                <option key={state._id} value={state._id}>{state.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
                                        <select name="cluster" className="w-full p-2 border rounded" value={formData.cluster} onChange={handleClusterChange} disabled={!formData.state}>
                                            <option value="">Select Cluster</option>
                                            {clusters.map(cluster => (
                                                <option key={cluster._id} value={cluster._id}>{cluster.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                        <select name="district" className="w-full p-2 border rounded" value={formData.district} onChange={handleDistrictChange} disabled={!formData.cluster}>
                                            <option value="">Select District</option>
                                            {districts.map(district => (
                                                <option key={district._id} value={district._id}>{district.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <select name="city" className="w-full p-2 border rounded" value={formData.city} onChange={handleFormChange} disabled={!formData.district}>
                                            <option value="">Select City</option>
                                            {cities.map(city => (
                                                <option key={city._id} value={city._id}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rural</label>
                                        <input type="text" name="rural" className="w-full p-2 border rounded" value={formData.rural} onChange={handleFormChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Of Media</label>
                                        <select name="sourceOfMedia" className="w-full p-2 border rounded" value={formData.sourceOfMedia} onChange={handleFormChange}>
                                            <option value="">Select Source Of Media</option>
                                            <option value="website">Website</option>
                                            <option value="applead">Application Lead</option>
                                            <option value="leadpartener">Lead Partner</option>
                                            <option value="fb">Facebook</option>
                                            <option value="whatsappmarketing">WhatsApp Marketing</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                                        <select name="profession" className="w-full p-2 border rounded" value={formData.profession} onChange={handleFormChange}>
                                            <option value="">Select Profession</option>
                                            <option value="solardealer">Solar Dealer</option>
                                            <option value="electrician">Electrician</option>
                                            <option value="elecshop">Electrician shop</option>
                                        </select>
                                    </div>
                                </div>
                            </form>

                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                    Close
                                </button>
                                <button onClick={handleSaveLead} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold">Filter Leads</h4>
                                <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* District Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select District</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                    >
                                        <option value="">Choose district</option>
                                        {filterDistricts.map(district => (
                                            <option key={district._id} value={district.name}>{district.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date Range</label>
                                    <select
                                        className="w-full p-2 border rounded"
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

                                {/* Custom Date Picker */}
                                {showCustomDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Custom Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded"
                                            value={customDate}
                                            onChange={(e) => setCustomDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Follow-up Modal */}
            {isAddFollowupModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold">Schedule Follow-up</h4>
                                <button onClick={() => setIsAddFollowupModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form id="followupForm">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Information</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded bg-gray-100"
                                            value={`${selectedLead.name} (${selectedLead.leadId}) - ${selectedLead.mobile}`}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                                        <input type="date" id="fu-date" className="w-full p-2 border rounded" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Time</label>
                                        <input type="time" id="fu-time" className="w-full p-2 border rounded" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            id="fu-notes"
                                            className="w-full p-2 border rounded"
                                            rows="3"
                                            placeholder="Add any notes for the follow-up..."
                                        ></textarea>
                                    </div>
                                </div>
                            </form>

                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setIsAddFollowupModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                    Close
                                </button>
                                <button onClick={handleAddFollowup} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Schedule Follow-up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerManagerMyLeads;