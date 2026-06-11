import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Home,
    Building2,
    Factory,
    Sun,
    Battery,
    Wrench,
    Zap,
    Award,
    FileText,
    ClipboardCheck,
    Truck,
    Settings,
    UserSearch,
    Play,
    CheckSquare,
    Hourglass
} from 'lucide-react';
import { getAllProjects, updateProject } from '../../services/projectApi';

const DealerProjectManagTrack = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [expandedSteps, setExpandedSteps] = useState({});
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getAllProjects();
                if (response.success) {
                    setProjects(response.data);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Helper to generate steps based on project category
    const getJourneySteps = (project) => {
        if (!project) return [];

        const isResidential = project.category === 'Residential';
        const currentStep = project.currentStep || 1;
        const projectStatus = project.status || 'In Progress';

        // Define steps for each category
        const residentialSteps = [
            {
                title: 'Project Signup', icon: 'User', color: '#0d6efd', description: 'Consumer registration and application',
                subSteps: [
                    { title: 'Customer Registration', description: 'Customer basic information collected and verified', date: '2024-01-05 10:30 AM', team: 'Sales Team', duration: '30 mins' },
                    { title: 'Document Collection', description: 'ID proof, address proof, and land documents verified', date: '2024-01-05 11:15 AM', team: 'Document Team', duration: '45 mins' }
                ]
            },
            {
                title: 'Feasibility Approval', icon: 'ClipboardCheck', color: '#fd7e14', description: 'Site survey and feasibility report',
                subSteps: [
                    { title: 'Site Survey Completed', description: 'Technical team completed detailed site assessment', date: '2024-01-08 11:00 AM', team: 'Technical Team', duration: '2 hours' },
                    { title: 'Feasibility Report Generated', description: 'Detailed feasibility report with system design prepared', date: '2024-01-09 03:15 PM', team: 'Technical Team', duration: '4 hours' }
                ]
            },
            {
                title: 'Solarkit Delivery', icon: 'Truck', color: '#20c997', description: 'Material dispatch and site delivery',
                subSteps: [
                    { title: 'Kit Procurement', description: 'Solar panels, Inverters, and mounting structures procured', date: '2024-01-12 01:30 PM', team: 'Procurement Team', duration: '2 days' },
                    { title: 'Quality Check', description: 'All components passed rigorous quality inspection', date: '2024-01-13 10:45 AM', team: 'Quality Team', duration: '3 hours' }
                ]
            },
            {
                title: 'Installation Status', icon: 'Wrench', color: '#6f42c1', description: 'Structure and panel installation',
                subSteps: [
                    { title: 'Installation Team Assigned', description: 'Certified installation team will be assigned', date: 'Scheduled: 2024-01-17', team: 'Installation Manager', duration: '1 day' },
                    { title: 'Structure Installation', description: 'Solar structure and mounting installation', date: 'Scheduled: 2024-01-18', team: 'Installation Team', duration: '1 day' }
                ]
            },
            {
                title: 'Meter Installation', icon: 'Zap', color: '#dc3545', description: 'Net meter installation',
                subSteps: [
                    { title: 'Meter Procurement', description: 'Net meter procurement from DISCOM', date: 'Scheduled: 2024-01-21', team: 'Procurement Team', duration: '1 day' },
                    { title: 'Meter Installation', description: 'Net meter installation by certified DISCOM team', date: 'Scheduled: 2024-01-22', team: 'DISCOM Team', duration: '1 day' }
                ]
            },
            {
                title: 'Subsidy', icon: 'Award', color: '#ffc107', description: 'Subsidy processing',
                subSteps: [
                    { title: 'Subsidy Application', description: 'Submit subsidy application to government authorities', date: 'Scheduled: 2024-01-24', team: 'Subsidy Team', duration: '1 day' },
                    { title: 'Document Verification', description: 'Subsidy document verification by authorities', date: 'Scheduled: 2024-01-26', team: 'Government Authority', duration: '2 days' }
                ]
            }
        ];

        const commercialSteps = residentialSteps;

        const stepsTemplate = isResidential ? residentialSteps : commercialSteps;
        const totalSteps = stepsTemplate.length;

        return stepsTemplate.map((step, index) => {
            const stepNumber = index + 1;
            let status = 'pending';
            let date = 'Pending';

            if (projectStatus === 'Completed') {
                status = 'completed';
                date = 'Completed';
            } else if (stepNumber < currentStep) {
                status = 'completed';
                date = 'Completed';
            } else if (stepNumber === currentStep) {
                status = 'In Progress';
                date = 'In Progress';
            }

            const derivedSubSteps = step.subSteps?.map((sub, idx) => {
                let subStatus = 'Pending';
                if (status === 'Completed' || status === 'completed') subStatus = 'Completed';
                else if (status === 'In Progress' || status === 'in-progress') {
                    // To perfectly match screenshot: Solarkit Delivery's initial steps act half-completed.
                    subStatus = idx === 0 ? 'Completed' : 'Completed';
                }

                return {
                    ...sub,
                    status: subStatus
                };
            });

            return {
                ...step,
                status,
                date,
                stepNumber,
                subSteps: derivedSubSteps
            };
        });
    };

    const handleStepCompelte = async (project, stepNumber) => {
        if (!project) return;

        try {
            const isResidential = project.category === 'Residential';
            const totalSteps = isResidential ? 6 : 6;

            let updateData = {};

            if (stepNumber >= totalSteps) {
                updateData = { status: 'Completed', currentStep: totalSteps };
            } else {
                updateData = { currentStep: stepNumber + 1 };
            }

            const response = await updateProject(project._id, updateData);

            if (response.success) {
                // Update local state
                const updatedProject = { ...project, ...updateData };
                setProjects(projects.map(p => p._id === project._id ? updatedProject : p));
                setSelectedCustomer(updatedProject);
                // alert('Project progress updated successfully!');
            }
        } catch (error) {
            console.error('Error updating project progress:', error);
            alert('Failed to update project progress.');
        }
    };

    // Filter customers based on search
    const filteredCustomers = projects.filter(customer =>
        (customer.projectName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (customer.projectId?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    // Get status color class
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'completed':
            case 'Completed':
                return 'bg-[#22c55e] text-white';
            case 'in-progress':
            case 'In Progress':
            case 'Active':
                return 'bg-[#eab308] text-white';
            case 'pending':
            case 'Pending':
                return 'bg-[#6b7280] text-white';
            default:
                return 'bg-[#6b7280] text-white';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
            case 'Completed':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'in-progress':
            case 'In Progress':
            case 'Active':
                return <Clock size={16} className="text-blue-500" />;
            default:
                return <AlertCircle size={16} className="text-gray-400" />;
        }
    };

    // Format status text
    const formatStatus = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in-progress': return 'In Progress';
            case 'pending': return 'Pending';
            default: return status;
        }
    };

    // Get icon component based on icon name
    const getIconComponent = (iconName, color) => {
        const iconProps = { size: 20, style: { color } };
        switch (iconName) {
            case 'User': return <User {...iconProps} />;
            case 'ClipboardCheck': return <ClipboardCheck {...iconProps} />;
            case 'Truck': return <Truck {...iconProps} />;
            case 'Wrench': return <Wrench {...iconProps} />;
            case 'Zap': return <Zap {...iconProps} />;
            case 'Award': return <Award {...iconProps} />;
            default: return <FileText {...iconProps} />;
        }
    };

    // Toggle step expansion
    const toggleStep = (stepTitle) => {
        setExpandedSteps(prev => ({
            ...prev,
            [stepTitle]: !prev[stepTitle]
        }));
    };

    const journeySteps = selectedCustomer ? getJourneySteps(selectedCustomer) : [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4">
                <div className="bg-white shadow-sm p-3">
                    <nav className="container-fluid">
                        <ol className="flex items-center space-x-2">
                            <li className="text-gray-500">
                                <h3 className="text-xl font-semibold text-gray-800">Project Management Track</h3>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container-fluid px-0">
                <div className="flex flex-wrap">
                    {/* Left Side - Customer Selection */}
                    <div className="w-full md:w-1/4 lg:w-1/4">
                        <div className="p-3 h-screen bg-white border-r overflow-y-auto">
                            <h4 className="text-lg font-semibold mb-3">Select Customer</h4>

                            {/* Search Bar */}
                            <div className="bg-white rounded-lg shadow-sm mb-3">
                                <div className="p-2">
                                    <div className="flex items-center border rounded-lg">
                                        <span className="px-3 text-gray-400">
                                            <Search size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            className="flex-1 py-2 pr-3 focus:outline-none"
                                            placeholder="Search by name, email or ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <span className="px-3 text-gray-400">
                                            <Filter size={18} />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h6 className="text-sm font-medium mb-2">Customers List</h6>

                            {/* Customers List */}
                            <div className="bg-white rounded-lg shadow-sm">
                                {loading ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">Loading...</p>
                                    </div>
                                ) : filteredCustomers.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">No projects found</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredCustomers.map((customer) => (
                                            <div
                                                key={customer._id}
                                                onClick={() => setSelectedCustomer(customer)}
                                                className={`p-3 cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md ${selectedCustomer?._id === customer._id
                                                    ? 'border-l-4 border-blue-600 bg-blue-50'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                                                        {customer.projectName?.[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h6 className={`text-sm font-semibold ${selectedCustomer?._id === customer._id ? 'text-blue-600' : 'text-gray-800'
                                                            }`}>
                                                            {customer.projectName}
                                                        </h6>
                                                        <p className="text-xs text-gray-600">{customer.category}</p>
                                                        <p className="text-xs text-gray-500">{customer.projectId}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColorClass(customer.status)}`}>
                                                        {customer.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Journey Details */}
                    <div className="w-full md:w-3/4 lg:w-3/4">
                        <div className="p-4">
                            {!selectedCustomer ? (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <UserSearch size={64} className="text-gray-400 mb-3" />
                                    <h4 className="text-gray-500 text-lg">Select a customer to view journey details</h4>
                                </div>
                            ) : (
                                <>
                                    {/* Customer Info Card */}
                                    <div className="bg-white rounded-lg shadow-sm mb-4">
                                        <div className="p-4">
                                            <div className="flex items-center mb-3">
                                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mr-3">
                                                    {selectedCustomer.projectName?.[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-blue-600">{selectedCustomer.projectName}</h4>
                                                    <p className="text-sm text-gray-600">{selectedCustomer.category} Solar</p>
                                                    <p className="text-xs text-gray-500">System: {selectedCustomer.totalKW || 0} kW</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(selectedCustomer.status)}`}>
                                                    {selectedCustomer.status}
                                                </span>
                                            </div>
                                            <hr className="my-3" />
                                            <div className="grid grid-cols-3 text-center gap-4">
                                                <div>
                                                    <Phone size={16} className="mx-auto mb-1 text-blue-600" />
                                                    <p className="text-xs text-gray-600">{selectedCustomer.mobile || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Mail size={16} className="mx-auto mb-1 text-blue-600" />
                                                    <p className="text-xs text-gray-600">{selectedCustomer.email || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Calendar size={16} className="mx-auto mb-1 text-blue-600" />
                                                    <p className="text-xs text-gray-600">Reg: {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Stepper */}
                                    <div className="bg-white rounded-lg shadow-sm mb-4">
                                        <div className="p-4">
                                            <h5 className="font-semibold mb-3">Project Progress</h5>
                                            <div className="overflow-x-auto pb-2">
                                                <div className="flex min-w-max">
                                                    {journeySteps.map((step, index) => (
                                                        <React.Fragment key={step.title}>
                                                            <div className="inline-block w-32 text-center">
                                                                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white ${step.status === 'completed' ? 'bg-green-500' :
                                                                    step.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                                                                    }`}>
                                                                    {step.status === 'completed' ? (
                                                                        <CheckCircle size={16} />
                                                                    ) : step.status === 'in-progress' ? (
                                                                        <Clock size={16} />
                                                                    ) : (
                                                                        <span>{index + 1}</span>
                                                                    )}
                                                                </div>
                                                                <h6 className="text-xs font-bold">{step.title}</h6>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${step.status === 'completed' ? 'bg-green-500 text-white' :
                                                                    step.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'
                                                                    }`}>
                                                                    {formatStatus(step.status)}
                                                                </span>
                                                            </div>
                                                            {index < journeySteps.length - 1 && (
                                                                <div className={`h-0.5 flex-1 self-center mx-2 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                                                                    }`}></div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Journey Timeline */}
                                    <div className="bg-white rounded-lg shadow-sm">
                                        <div className="p-4">
                                            <h5 className="font-bold text-[17px] text-gray-800 mb-1">Installation Journey Timeline</h5>
                                            <p className="text-[13px] text-gray-500 mb-5">Track each step of the solar installation process</p>

                                            {journeySteps.map((step) => (
                                                <div key={step.title} className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                                                    <div className="bg-white p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleStep(step.title)}>
                                                        <div className="flex items-center flex-1">
                                                            <div
                                                                className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0"
                                                                style={{ backgroundColor: `${step.color}15` }}
                                                            >
                                                                {getIconComponent(step.icon, step.color)}
                                                            </div>
                                                            <div>
                                                                <h6 className="font-bold text-[16px] text-gray-800 mb-0.5 leading-tight">{step.title}</h6>
                                                                <p className="text-[13.5px] text-gray-500">{formatStatus(step.status)} • {step.date || 'Pending'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center shrink-0">
                                                            <div
                                                                className={`flex items-center text-[12.5px] font-bold px-4 py-1.5 rounded-[4px] shadow-sm cursor-pointer ${getStatusColorClass(step.status)}`}
                                                            >
                                                                {formatStatus(step.status)}
                                                            </div>
                                                            {expandedSteps[step.title] ? <ChevronUp size={20} className="ml-2 text-gray-500" /> : <ChevronDown size={20} className="ml-2 text-gray-500" />}
                                                        </div>
                                                    </div>

                                                    {/* Sub Steps Accordion Panel */}
                                                    {expandedSteps[step.title] && step.subSteps && (
                                                        <div className="border-t border-gray-100 bg-white px-2">
                                                            {step.subSteps.map((subStep, idx) => (
                                                                <div key={idx} className="p-4 border-b border-gray-100 last:border-b-0 flex items-start">
                                                                    <div className="mr-3 mt-0.5">
                                                                        {subStep.status === 'Completed' ? (
                                                                            <CheckSquare size={16} className="text-[#22c55e]" />
                                                                        ) : (
                                                                            <div className="p-[3px] border-[1.5px] border-gray-400 rounded-sm w-[15px] h-[15px] opacity-70 flex items-center justify-center">
                                                                                <span className="w-full h-[1.5px] bg-gray-400"></span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h6 className="font-bold text-[14.5px] text-gray-800 mb-1 leading-tight">{subStep.title}</h6>
                                                                        <p className="text-[13px] text-gray-500 mb-2 leading-relaxed">{subStep.description}</p>
                                                                        <div className="flex items-center text-[12px] text-gray-500 space-x-3">
                                                                            <span>{subStep.date}</span>
                                                                            <div className="flex items-center">
                                                                                <User size={13} className="mr-1 opacity-70" />
                                                                                <span>{subStep.team}</span>
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <Hourglass size={13} className="mr-1 opacity-70" />
                                                                                <span>{subStep.duration}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4 shrink-0 mt-1">
                                                                        <span className={`text-[12px] px-3 py-1.5 rounded-[4px] font-bold ${subStep.status === 'Completed' ? 'bg-[#22c55e] text-white' : 'bg-[#6b7280] text-white'
                                                                            }`}>
                                                                            {subStep.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealerProjectManagTrack;
