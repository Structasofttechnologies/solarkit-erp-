import React, { useState, useEffect } from 'react';
import {
    Search,
    User,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    Image,
    Video,
    Send,
    ChevronDown,
    Home,
    Zap,
    AlertTriangle,
    Clock,
    Camera,
    FileText,
    Settings,
    Sun,
    Battery
} from 'lucide-react';
import api from '../../../api/api'; // Adjust import path if needed

const DealerRaiseTicket = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedInstallation, setSelectedInstallation] = useState('');
    const [issueType, setIssueType] = useState('');
    const [component, setComponent] = useState('');
    const [description, setDescription] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
                // response.data from axios contains the body.
                // projectController returns { success: true, data: [...] }
                const projectsData = response.data.data || [];

                // Filter for Completed projects only as per requirement
                const completedProjects = projectsData.filter(project => project.status === 'Completed');

                setProjects(completedProjects);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, []);

    // Filter projects based on search
    const filteredProjects = projects.filter(project => {
        const name = project.projectName || '';
        const id = project.projectId || '';
        const phone = project.mobile || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phone.includes(searchQuery);
    });

    // Select a project
    const handleSelectProject = (project) => {
        setSelectedProject(project);
        setSelectedInstallation(''); // Reset installation when project changes
    };

    // Installation options based on selected project
    // For now, assuming project ID or similar is the installation identifier, 
    // or if you have specific installation data inside project, map it here.
    // If no specific installation list, maybe just use the project ID itself as the only option?
    const installationOptions = selectedProject ? [
        { value: selectedProject._id, label: `${selectedProject.projectId}: ${selectedProject.address || 'Project Location'}` }
    ] : [];

    // Issue type options
    const issueTypeOptions = [
        { value: '', label: 'Select Issue Type' },
        { value: 'performance', label: 'Performance Issue' },
        { value: 'damage', label: 'Physical Damage' },
        { value: 'monitoring', label: 'Monitoring System Problem' },
        { value: 'billing', label: 'Billing Issue' },
        { value: 'other', label: 'Other' }
    ];

    // Component options
    const componentOptions = [
        { value: '', label: 'Select Component' },
        { value: 'panel', label: 'Solar Panel' },
        { value: 'bos', label: 'BOS Kit' },
        { value: 'inverter', label: 'Inverter' },
        { value: 'other', label: 'Other' }
    ];

    // Handle form submission
    const handleSubmitTicket = async () => {
        if (!selectedProject) {
            alert('Please select a project');
            return;
        }
        // if (!selectedInstallation) {
        //     alert('Please select an installation');
        //     return;
        // }
        if (!issueType) {
            alert('Please select issue type');
            return;
        }
        if (!component) {
            alert('Please select component');
            return;
        }
        if (description.length < 30) {
            alert('Please provide a detailed description (minimum 30 characters)');
            return;
        }

        try {
            setLoading(true);
            const ticketData = {
                projectId: selectedProject._id,
                issueType,
                component,
                description,
                priority: isUrgent ? 'Urgent' : 'Normal',
                // media: [] // Add media handling if implemented
            };

            await api.post('/tickets', ticketData);
            alert('Support ticket submitted successfully!');

            // Reset form
            setSelectedProject(null);
            setSelectedInstallation('');
            setIssueType('');
            setComponent('');
            setDescription('');
            setIsUrgent(false);

        } catch (error) {
            console.error('Error submitting ticket:', error);
            alert('Failed to submit ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header with Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-fluid px-6 py-4">
                    <h3 className="text-xl font-bold text-gray-800">Raise Ticket</h3>
                </div>
            </div>

            <div className="container-fluid px-6 py-6">
                <div className="flex flex-wrap">
                    {/* Left Side - Project List */}
                    <div className="w-full md:w-[30%] lg:w-[30%] pr-0 md:pr-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 h-[calc(100vh-140px)] flex flex-col">
                            <h3 className="font-bold text-[22px] mb-1">Project Signup</h3>
                            <p className="text-gray-400 text-[13px] mb-5">Complete the signup process for your solar project</p>

                            {/* Search */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-[6px] focus:outline-none text-sm placeholder-gray-400"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Project List */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {filteredProjects.map((project) => (
                                    <button
                                        key={project._id}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors border ${selectedProject?._id === project._id
                                            ? 'bg-blue-50 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                            : 'bg-white hover:bg-gray-50 border-gray-100'
                                            }`}
                                        onClick={() => handleSelectProject(project)}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden">
                                                <User className="text-blue-500 w-5 h-5 mt-1" />
                                            </div>
                                            <div className="text-left font-sans">
                                                <h4 className={`text-[15px] leading-tight mb-1 ${selectedProject?._id === project._id ? 'text-blue-700 font-bold' : 'text-gray-700 font-medium'}`}>
                                                    {project.projectName}
                                                </h4>
                                                <div className="text-[12.5px] text-gray-500 leading-tight">
                                                    Project: {project.projectId}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="bg-gray-600 text-white text-[11px] font-bold px-2 py-1 rounded-[4px]">
                                                {project.totalKW || 0} Panel
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                {filteredProjects.length === 0 && (
                                    <div className="text-center text-gray-500 py-4 text-sm">
                                        No projects found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Ticket Form */}
                    <div className="w-full md:w-[70%] lg:w-[70%]">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 h-[calc(100vh-140px)] overflow-y-auto">
                            {/* Customer Info Card */}
                            {selectedProject ? (
                                <div className="bg-[#f0f9ff]/40 rounded-lg p-5 mb-8 flex flex-col items-start border border-blue-50">
                                    <h4 className="text-[#0284c7] font-bold text-[19px] mb-1">{selectedProject.projectName}</h4>
                                    <div className="flex flex-col text-gray-500 text-[13.5px] font-medium leading-relaxed mb-4">
                                        <span>{selectedProject.mobile ? `+91 ${selectedProject.mobile}` : 'N/A'}</span>
                                        <span>{selectedProject.email || 'N/A'}</span>
                                    </div>
                                    <div className="bg-[#fb923c] text-white px-3 py-1 rounded-[6px] text-[12px] font-bold">
                                        {selectedProject.totalKW || 1} Installations
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-10 mb-8 text-center text-gray-500 flex flex-col items-center justify-center h-40">
                                    <User size={32} className="mb-3 text-gray-400 opacity-50" />
                                    <p className="text-[14px]">Select a project from the left to raise a ticket</p>
                                </div>
                            )}

                            {selectedProject && (
                                <div className="space-y-6">
                                    {/* Select Installation Component */}
                                    <div>
                                        <label className="block text-[13px] text-gray-600 mb-2">select solar Installations</label>
                                        <div className="relative">
                                            <select
                                                className="w-full border border-gray-300 rounded-[4px] p-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-gray-400 appearance-none bg-white"
                                                value={selectedInstallation}
                                                onChange={(e) => setSelectedInstallation(e.target.value)}
                                            >
                                                <option value="">select</option>
                                                {installationOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>

                                    {/* Issue Type and Component */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[13px] text-gray-600 mb-2">Issue Type</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full border border-gray-300 rounded-[4px] p-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-gray-400 appearance-none bg-white"
                                                    value={issueType}
                                                    onChange={(e) => setIssueType(e.target.value)}
                                                >
                                                    {issueTypeOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label === 'Select Issue Type' ? 'Select' : opt.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] text-gray-600 mb-2">Select Component</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full border border-gray-300 rounded-[4px] p-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-gray-400 appearance-none bg-white"
                                                    value={component}
                                                    onChange={(e) => setComponent(e.target.value)}
                                                >
                                                    {componentOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label === 'Select Component' ? 'Select' : opt.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Description */}
                                    <div>
                                        <label className="block text-[13px] text-gray-800 mb-0.5">Detailed Description</label>
                                        <small className="text-gray-400 text-[11px] block mb-2">please describe the issue in detail(minimum 30 character)</small>
                                        <textarea
                                            rows="2"
                                            className="w-full border border-gray-300 rounded-[4px] p-2 text-[14px] text-gray-600 focus:outline-none focus:border-gray-400 resize-none"
                                            placeholder="detailed description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>

                                    {/* Urgent Issue Card */}
                                    <div
                                        className={`p-4 rounded-[4px] border ${isUrgent
                                            ? 'bg-red-100 border-red-300'
                                            : 'bg-[#fce8e8] border-[#fbcfe8]'
                                            } cursor-pointer transition-colors mt-6`}
                                        onClick={() => setIsUrgent(!isUrgent)}
                                    >
                                        <h5 className="font-bold text-[15px] text-gray-800 mb-0.5">Urgent Issue</h5>
                                        <small className="text-gray-500 text-[12px]">24 hours response - additional charges apply*</small>
                                    </div>

                                    {/* Media Attachments */}
                                    <div className="mt-8 mb-6">
                                        <h4 className="font-bold text-[16px] text-gray-800 mb-0.5">Media Attachments</h4>
                                        <small className="text-gray-400 text-[12px] block mb-3">
                                            Upload clear photos/videos showing the problem for better understanding
                                        </small>

                                        <div className="flex space-x-3">
                                            <button className="flex items-center px-4 py-1.5 border border-[#0284c7] text-[#0284c7] font-semibold text-[13px] rounded-[4px] hover:bg-blue-50 transition-colors bg-white">
                                                Image
                                            </button>
                                            <button className="flex items-center px-4 py-1.5 border border-[#0284c7] text-[#0284c7] font-semibold text-[13px] rounded-[4px] hover:bg-blue-50 transition-colors bg-white">
                                                Video
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmitTicket}
                                        disabled={loading}
                                        className={`w-full bg-[#f59e0b] hover:bg-orange-500 text-white font-medium py-3 rounded-[4px] text-[16px] transition-colors flex items-center justify-center mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Support Ticket'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealerRaiseTicket;