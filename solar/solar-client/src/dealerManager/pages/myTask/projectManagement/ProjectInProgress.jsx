import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../../../../services/project/projectService';
import {
    Home,
    Building2,
    Filter,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Clock,
    Users,
    Sun,
    Zap,
    Droplets,
    Grid,
    Battery,
    ArrowRight
} from 'lucide-react';

const DealerManagerProjectInProgress = () => {
    // State for project type selection
    const [projectType, setProjectType] = useState('residential');
    const [activeProcess, setActiveProcess] = useState('consumerRegistered');

    // State for filters
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState([]);
    const [selectedProjectType, setSelectedProjectType] = useState([]);
    const [selectedSubProjectType, setSelectedSubProjectType] = useState([]);

    // State for CP filter
    const [selectedCP, setSelectedCP] = useState('all');

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch projects based on selected filters
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                // In future, you can pass filters here.
                // For now, fetch all projects to emulate the previous static behavior,
                // but you can add logic to pass `category` and other filters
                const data = await getProjects({
                    category: projectType === 'residential' ? 'Residential' : 'Commercial'
                });

                // Assuming data.data holds the array of projects from the API
                setProjects(data.data || []);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setError('Failed to fetch projects');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [projectType, selectedCategory, selectedSubCategory, selectedProjectType, selectedSubProjectType, selectedCP]);

    // Group projects by statusStage to mimic projectData structure
    const projectData = {
        consumerRegistered: projects.filter(p => p.statusStage === 'consumer'),
        applicationSubmission: projects.filter(p => p.statusStage === 'application'),
        feasibilityCheck: projects.filter(p => p.statusStage === 'feasibility'),
        meterCharge: projects.filter(p => p.statusStage === 'metercharge'),
        vendorSelection: projects.filter(p => p.statusStage === 'vendor'),
        workStart: projects.filter(p => p.statusStage === 'work'),
        solarInstallation: projects.filter(p => p.statusStage === 'install' || p.statusStage === 'solarInstallation'),
        pcr: projects.filter(p => p.statusStage === 'pcr'),
        commissioning: projects.filter(p => p.statusStage === 'commission'),
        meterchange: projects.filter(p => p.statusStage === 'meterchange'),
        inspection: projects.filter(p => p.statusStage === 'inspection'),
        subsidyrequest: projects.filter(p => p.statusStage === 'subsidyreq'),
        subsidydisbursal: projects.filter(p => p.statusStage === 'subsidydis'),
    };

    // Process definitions with counts
    const processes = {
        main: [
            { name: 'Project Signup', colspan: 2 },
            { name: 'Feasibility Approval', colspan: 2 },
            { name: 'Installation Status', colspan: 5 },
            { name: 'Meter Installation', colspan: 2 },
            { name: 'Subsidy', colspan: 2, showForResidential: true }
        ],
        sub: [
            // Project Signup
            { name: `Consumer Registered (${projectData.consumerRegistered.length})`, process: 'consumerRegistered', mainIndex: 0 },
            { name: `Application Submission (${projectData.applicationSubmission.length})`, process: 'applicationSubmission', mainIndex: 0 },
            // Feasibility Approval
            { name: `Feasibility Check (${projectData.feasibilityCheck.length})`, process: 'feasibilityCheck', mainIndex: 1 },
            { name: `Meter Charge (${projectData.meterCharge.length})`, process: 'meterCharge', mainIndex: 1 },
            // Installation Status
            { name: `Vendor Selection (${projectData.vendorSelection.length})`, process: 'vendorSelection', mainIndex: 2 },
            { name: `Work Start (${projectData.workStart.length})`, process: 'workStart', mainIndex: 2 },
            { name: `Solar Installation (${projectData.solarInstallation.length})`, process: 'solarInstallation', mainIndex: 2 },
            { name: `PCR (${projectData.pcr.length})`, process: 'pcr', mainIndex: 2 },
            { name: `Commissioning (${projectData.commissioning.length})`, process: 'commissioning', mainIndex: 2 },
            // Meter Installation
            { name: `Meter Change (${projectData.meterchange.length})`, process: 'meterchange', mainIndex: 3 },
            { name: `Meter Inspection (${projectData.inspection.length})`, process: 'inspection', mainIndex: 3 },
            // Subsidy
            { name: `Subsidy Request (${projectData.subsidyrequest.length})`, process: 'subsidyrequest', mainIndex: 4, residential: true },
            { name: `Subsidy Disbursal (${projectData.subsidydisbursal.length})`, process: 'subsidydisbursal', mainIndex: 4, residential: true },
        ]
    };

    // Initialize with residential selected
    useEffect(() => {
        setActiveProcess('consumerRegistered');
    }, []);

    // Handle process click
    const handleProcessClick = (process) => {
        // Skip subsidy processes for commercial
        if (projectType === 'commercial' && process.includes('subsidy')) {
            return;
        }
        setActiveProcess(process);
    };

    // Handle project type change
    const handleProjectTypeChange = (type) => {
        setProjectType(type);
        // If switching to commercial and current process is subsidy, switch to first non-subsidy process
        if (type === 'commercial' && activeProcess.includes('subsidy')) {
            setActiveProcess('consumerRegistered');
        }
    };

    // Handle navigation to detail pages
    const handleNavigate = (path) => {
        window.location.href = path;
    };

    // Filter projects by CP
    const filteredProjects = activeProcess && projectData[activeProcess]
        ? projectData[activeProcess].filter(project => selectedCP === 'all' || project.cp === selectedCP)
        : [];

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Sun className="w-6 h-6 mr-2 text-yellow-500" />
                Solar Project Management
            </h2>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-4 border-b">
                    <h5 className="font-semibold flex items-center">
                        <Filter className="w-4 h-4 mr-2 text-blue-600" />
                        Filters
                    </h5>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                multiple
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory([...e.target.selectedOptions].map(o => o.value))}
                            >
                                <option value="" disabled>All Categories</option>
                                <option value="solar-panel">Solar Panel</option>
                                <option value="solar-rooftop">Solar Rooftop</option>
                                <option value="solar-pump">Solar Pump</option>
                            </select>
                        </div>

                        {/* Sub Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub Category
                            </label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                multiple
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory([...e.target.selectedOptions].map(o => o.value))}
                            >
                                <option value="" disabled>Select Sub Category Type</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>

                        {/* Project Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project Type
                            </label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                multiple
                                value={selectedProjectType}
                                onChange={(e) => setSelectedProjectType([...e.target.selectedOptions].map(o => o.value))}
                            >
                                <option value="" disabled>Select Project Type</option>
                                <option value="3-5kw">3Kw-5Kw</option>
                                <option value="5-10kw">5Kw-10Kw</option>
                                <option value="10-20kw">10Kw-20Kw</option>
                            </select>
                        </div>

                        {/* Sub Project Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub Project Type
                            </label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                multiple
                                value={selectedSubProjectType}
                                onChange={(e) => setSelectedSubProjectType([...e.target.selectedOptions].map(o => o.value))}
                            >
                                <option value="" disabled>Select Sub Project Type</option>
                                <option value="on-grid">On-Grid</option>
                                <option value="off-grid">Off-grid</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        <Filter className="w-4 h-4 inline mr-2" />
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Project Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Residential Card */}
                <div
                    onClick={() => handleProjectTypeChange('residential')}
                    className={`bg-white rounded-lg shadow-sm p-6 text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md
            ${projectType === 'residential' ? 'border-2 border-blue-500 bg-blue-50' : 'border-2 border-transparent'}`}
                >
                    <Home className={`w-12 h-12 mx-auto mb-3 ${projectType === 'residential' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h4 className={`text-xl font-semibold ${projectType === 'residential' ? 'text-blue-600' : 'text-gray-700'}`}>
                        Residential
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">Manage residential solar projects</p>
                </div>

                {/* Commercial Card */}
                <div
                    onClick={() => handleProjectTypeChange('commercial')}
                    className={`bg-white rounded-lg shadow-sm p-6 text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md
            ${projectType === 'commercial' ? 'border-2 border-blue-500 bg-blue-50' : 'border-2 border-transparent'}`}
                >
                    <Building2 className={`w-12 h-12 mx-auto mb-3 ${projectType === 'commercial' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h4 className={`text-xl font-semibold ${projectType === 'commercial' ? 'text-blue-600' : 'text-gray-700'}`}>
                        Commercial
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">Manage commercial solar projects</p>
                </div>
            </div>

            {/* Process Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                    <h5 className="font-semibold">Project Processes</h5>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        {/* Main Process Row */}
                        <thead>
                            <tr className="bg-blue-100">
                                {processes.main.map((process, idx) => (
                                    (projectType === 'residential' || !process.showForResidential) && (
                                        <th
                                            key={idx}
                                            colSpan={process.colspan}
                                            className="px-4 py-3 text-center font-semibold border"
                                        >
                                            {process.name}
                                        </th>
                                    )
                                ))}
                            </tr>

                            {/* Sub Process Row */}
                            <tr className="bg-blue-600 text-white">
                                {processes.sub.map((process, idx) => (
                                    (projectType === 'residential' || !process.residential) && (
                                        <td
                                            key={idx}
                                            onClick={() => handleProcessClick(process.process)}
                                            className={`px-4 py-3 text-center border border-blue-400 cursor-pointer transition-colors
                        ${activeProcess === process.process ? 'bg-cyan-400' : 'hover:bg-blue-500'}`}
                                        >
                                            {process.name}
                                        </td>
                                    )
                                ))}
                            </tr>
                        </thead>

                        {/* Data Rows */}
                        <tbody>
                            {activeProcess && projectData[activeProcess] && (
                                <tr>
                                    <td colSpan="13" className="p-4">
                                        {/* CP Filter */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Filter by CP/Installer:
                                            </label>
                                            <select
                                                className="w-full md:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                value={selectedCP}
                                                onChange={(e) => setSelectedCP(e.target.value)}
                                            >
                                                <option value="all">All CPs/Installers</option>
                                                <option value="SolarTech Solutions">SolarTech Solutions</option>
                                                <option value="Green Energy">Green Energy</option>
                                                <option value="SunPower">SunPower</option>
                                            </select>
                                        </div>

                                        {/* Data Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full border">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left border">Customer Name</th>
                                                        <th className="px-4 py-2 text-left border">Project ID</th>
                                                        {activeProcess === 'feasibilityCheck' || activeProcess === 'meterCharge' ||
                                                            activeProcess === 'vendorSelection' || activeProcess === 'workStart' ? (
                                                            <>
                                                                <th className="px-4 py-2 text-left border" colSpan={activeProcess === 'feasibilityCheck' ? 2 :
                                                                    activeProcess === 'meterCharge' ? 3 :
                                                                        activeProcess === 'vendorSelection' ? 4 :
                                                                            activeProcess === 'workStart' ? 5 : 1}>Previous Task</th>
                                                            </>
                                                        ) : (
                                                            <th className="px-4 py-2 text-left border">Previous Task</th>
                                                        )}
                                                        <th className="px-4 py-2 text-left border">Completed In</th>
                                                        <th className="px-4 py-2 text-left border">Current Task</th>
                                                        <th className="px-4 py-2 text-left border">Overdue Days</th>
                                                        <th className="px-4 py-2 text-left border">CP Name</th>
                                                        <th className="px-4 py-2 text-left border">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                                <div className="flex justify-center items-center">
                                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                                    <span className="ml-2">Loading projects...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : filteredProjects.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                                No projects found for this stage.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredProjects.map((project) => (
                                                            <tr key={project._id || project.id} className="border-t hover:bg-gray-50">
                                                                <td className="px-4 py-2 border">{project.projectName || project.customer}</td>
                                                                <td className="px-4 py-2 border">{project.projectId}</td>

                                                                {/* Previous Tasks Column - Dynamic based on process */}
                                                                {activeProcess === 'feasibilityCheck' && (
                                                                    <>
                                                                        <td className="px-4 py-2 border">
                                                                            Consumer Registered <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Application Submission <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {activeProcess === 'meterCharge' && (
                                                                    <>
                                                                        <td className="px-4 py-2 border">
                                                                            Consumer Registered <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Application Submission <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Feasibility Check <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {activeProcess === 'vendorSelection' && (
                                                                    <>
                                                                        <td className="px-4 py-2 border">
                                                                            Consumer Registered <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Application Submission <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Feasibility Check <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Meter Charge <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {activeProcess === 'workStart' && (
                                                                    <>
                                                                        <td className="px-4 py-2 border">
                                                                            Consumer Registered <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Application Submission <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Feasibility Check <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Meter Charge <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                        <td className="px-4 py-2 border">
                                                                            Vendor Selection <CheckCircle className="w-4 h-4 inline ml-1 text-green-500" />
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {!['feasibilityCheck', 'meterCharge', 'vendorSelection', 'workStart'].includes(activeProcess) && (
                                                                    <td className="px-4 py-2 border">{project.previousTask || 'Initial Inquiry'}</td>
                                                                )}

                                                                <td className="px-4 py-2 border">
                                                                    <span className="text-green-600 font-semibold">{project.completedIn || '-'}</span>
                                                                </td>
                                                                <td className="px-4 py-2 border">{project.status || project.currentTask}</td>
                                                                <td className="px-4 py-2 border">
                                                                    <span className={project.overdueDays > 0 ? "text-red-600 font-semibold" : "text-gray-600 font-semibold"}>
                                                                        {project.overdueDays > 0 ? `${project.overdueDays} days` : '0 days'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 border">{project.cp || 'Direct'}</td>
                                                                <td className="px-4 py-2 border">
                                                                    {activeProcess === 'vendorSelection' && (
                                                                        <button
                                                                            onClick={() => handleNavigate(`/components/cprm/details.php?id=${project._id || 1}&task=vendorSelection`)}
                                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
                                                                        >
                                                                            Vendor Selection
                                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                                        </button>
                                                                    )}
                                                                    {activeProcess === 'workStart' && (
                                                                        <button
                                                                            onClick={() => handleNavigate(`/components/cprm/details.php?id=${project._id || 2}&task=workStart`)}
                                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
                                                                        >
                                                                            Work Start
                                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                                        </button>
                                                                    )}
                                                                    {activeProcess === 'solarInstallation' && (
                                                                        <button
                                                                            onClick={() => handleNavigate(`/components/cprm/details.php?id=${project._id || 4}&task=SolarInstallation`)}
                                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
                                                                        >
                                                                            Installation
                                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                                        </button>
                                                                    )}
                                                                    {activeProcess === 'pcr' && (
                                                                        <button
                                                                            onClick={() => handleNavigate(`/components/cprm/details.php?id=${project._id || 3}&task=PCR`)}
                                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
                                                                        >
                                                                            PCR
                                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                                        </button>
                                                                    )}
                                                                    {!['vendorSelection', 'workStart', 'solarInstallation', 'pcr'].includes(activeProcess) && (
                                                                        <button
                                                                            onClick={() => handleNavigate(`/dealer-manager/my-task/project-management/project-details/${project.projectId}`)}
                                                                            className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-xs"
                                                                        >
                                                                            View Details
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DealerManagerProjectInProgress;