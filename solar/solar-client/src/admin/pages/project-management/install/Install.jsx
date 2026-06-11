import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Home,
    Building2,
    MapPin,
    Users,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Filter,
    X,
    Plus,
    ChevronRight,
    ChevronLeft,
    Search,
    User,
    Phone,
    Mail,
    DollarSign,
    Zap,
    Battery,
    Sun,
    Info,
    Map,
    Layers,
    Grid,
    List,
    Trash2,
    Edit,
    Eye,
    Download,
    Upload,
    Settings,
    ArrowRight,
    ArrowLeft,
    Check,
    Minus,
    Award,
    CreditCard,
    FileText,
    Camera,
    ImageIcon,
    Wrench,
    Hammer,
    Settings2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { locationAPI } from '../../../../api/api';

const AdminProjectManagementInstall = () => {
    const { entityType } = useParams();
    const entityLabel = entityType ? entityType.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : 'Company';

    const groupsList = [
        { id: 1, name: "Group 1 - Rajkot Projects", projectCount: 4, capacity: "11.5 KW", installation: "₹12,500/-", district: "Rajkot", installer: "Amit Patel", created: "Mar 6, 2026" },
        { id: 2, name: "Group 2 - Ahmedabad Projects", projectCount: 2, capacity: "6.5 KW", installation: "₹4,500/-", district: "Ahmedabad", installer: "Vikram Sharma", created: "Mar 6, 2026" },
        { id: 3, name: "Group 3 - Surat Projects", projectCount: 2, capacity: "8 KW", installation: "₹7,500/-", district: "Surat", installer: "Not Assigned", created: "Mar 6, 2026" },
    ];

    const installersList = [
        { id: 1, name: "Rajesh Kumar", phone: "+91 9876543210", location: "Rajkot, Gujarat", exp: "5 years", rating: "4.5" },
        { id: 2, name: "Amit Patel", phone: "+91 9876543211", location: "Ahmedabad, Gujarat", exp: "3 years", rating: "4.2" },
        { id: 3, name: "Sanjay Singh", phone: "+91 9876543212", location: "Vadodara, Gujarat", exp: "7 years", rating: "4.8" },
        { id: 4, name: "Manoj Joshi", phone: "+91 9876543214", location: "Surat, Gujarat", exp: "6 years", rating: "4.6" },
    ];

    // State for map
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);

    // State for tabs
    const [activeTab, setActiveTab] = useState('makeGroup');

    // State for selected projects
    const [selectedIndices, setSelectedIndices] = useState(new Set());

    // State for filters
    const [filters, setFilters] = useState({
        category: '',
        projectType: '',
        subProjectType: ''
    });

    // State for district selection
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedDistrictType, setSelectedDistrictType] = useState('');

    // State for project type
    const [selectedProjectType, setSelectedProjectType] = useState('residential');

    // State for group creation
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');

    // State for selection types
    const [hasCommercialSelected, setHasCommercialSelected] = useState(false);
    const [hasResidentialSelected, setHasResidentialSelected] = useState(false);

    // Districts data
    const [districts, setDistricts] = useState([]);

    // Fetch districts on mount
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    setDistricts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    // Projects data
    const projects = [
        {
            name: 'Project 1',
            locationName: 'Sunovative solar1',
            position: { lat: 22.307859839396578, lng: 70.81857663628 },
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            installationDueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            leadNumber: '#54555',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543210',
            panelInfo: '5 Panel (3 KW) Mono',
            service: 'Residential Solar Installations',
            category: 'Rooftop Solar',
            district: 'Rajkot',
            capacity: '3 KW',
            installationCharge: '₹5,000/-',
            paymentAmount: '₹15,000/-'
        },
        {
            name: 'Project 2',
            locationName: 'Sunovative solar',
            position: { lat: 23.053016352478696, lng: 72.53234139666922 },
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            installationDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            leadNumber: '#54556',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543211',
            panelInfo: '6 Panel (3.5 KW) Mono',
            service: 'Commercial Solar Installations',
            category: 'Rooftop Solar',
            district: 'Ahmedabad',
            capacity: '3.5 KW',
            installationCharge: '₹2,500/-',
            paymentAmount: '₹17,500/-'
        },
        {
            name: 'Project 3',
            locationName: 'Bhakti Nagar',
            position: { lat: 22.2698, lng: 70.8056 },
            date: new Date(),
            installationDueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            leadNumber: '#54557',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543212',
            panelInfo: '4 Panel (2.5 KW) Mono',
            service: 'Residential Solar Installations',
            category: 'Solar Pump',
            district: 'Surat',
            capacity: '2.5 KW',
            installationCharge: '₹2,500/-',
            paymentAmount: '₹12,500/-'
        },
        {
            name: 'Project 4',
            locationName: 'Kothariya Gam',
            position: { lat: 22.28, lng: 70.86 },
            date: new Date(),
            installationDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            leadNumber: '#54557',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543213',
            panelInfo: '4 Panel (2.5 KW) Mono',
            service: 'Commercial Solar Installations',
            category: 'Solar Pump',
            district: 'Vadodara',
            capacity: '2.5 KW',
            installationCharge: '₹2,500/-',
            paymentAmount: '₹12,500/-'
        },
        {
            name: 'Project 5',
            locationName: 'Kotariya Chokedi',
            position: { lat: 22.2356, lng: 70.8157 },
            date: new Date(),
            installationDueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            leadNumber: '#54557',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543214',
            panelInfo: '4 Panel (2.5 KW) Mono',
            service: 'Residential Solar Installations',
            category: 'Solar Light',
            district: 'Gandhinagar',
            capacity: '2.5 KW',
            installationCharge: '₹2,500/-',
            paymentAmount: '₹12,500/-'
        },
        {
            name: 'Project 6',
            locationName: 'Mavdi Road',
            position: { lat: 22.2956, lng: 70.7957 },
            date: new Date(),
            installationDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            leadNumber: '#54558',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543215',
            panelInfo: '7 Panel (4 KW) Mono',
            service: 'Residential Solar Installations',
            category: 'Solar Light',
            district: 'Rajkot',
            capacity: '4 KW',
            installationCharge: '₹2,000/-',
            paymentAmount: '₹20,000/-'
        },
        {
            name: 'Project 7',
            locationName: 'Maninagar',
            position: { lat: 23.05301635247867, lng: 72.5323413966693 },
            date: new Date(),
            installationDueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            leadNumber: '#54559',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543216',
            panelInfo: '8 Panel (5 KW) Mono',
            service: 'Commercial Solar Installations',
            category: 'Rooftop Solar',
            district: 'Ahmedabad',
            capacity: '5 KW',
            installationCharge: '₹2,000/-',
            paymentAmount: '₹25,000/-'
        },
        {
            name: 'Project 8',
            locationName: 'Gandhinagar Sector 1',
            position: { lat: 23.2156, lng: 72.6366 },
            date: new Date(),
            installationDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            leadNumber: '#54560',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543217',
            panelInfo: '10 Panel (6 KW) Mono',
            service: 'Commercial Solar Installations',
            category: 'Rooftop Solar',
            district: 'Gandhinagar',
            capacity: '6 KW',
            installationCharge: '₹3,000/-',
            paymentAmount: '₹30,000/-'
        },
        {
            name: 'Project 9',
            locationName: 'SG Highway',
            position: { lat: 23.0753, lng: 72.5258 },
            date: new Date(),
            installationDueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            leadNumber: '#54561',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543218',
            panelInfo: '12 Panel (7 KW) Mono',
            service: 'Residential Solar Installations',
            category: 'Solar Pump',
            district: 'Ahmedabad',
            capacity: '7 KW',
            installationCharge: '₹3,000/-',
            paymentAmount: '₹35,000/-'
        },
        {
            name: 'Project 10',
            locationName: 'Paldi Area',
            position: { lat: 23.0453, lng: 72.5558 },
            date: new Date(),
            installationDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            leadNumber: '#54562',
            projectNumber: 'Consumer Number',
            contactNumber: '+91 9876543219',
            panelInfo: '9 Panel (5.5 KW) Mono',
            service: 'Commercial Solar Installations',
            category: 'Solar Pump',
            district: 'Ahmedabad',
            capacity: '5.5 KW',
            installationCharge: '₹7,500/-',
            paymentAmount: '₹27,500/-'
        }
    ];

    // Initialize map
    useEffect(() => {
        const loadGoogleMaps = () => {
            const scriptId = 'google-maps-script';

            // Check if google is already available
            if (window.google && window.google.maps) {
                initializeMap();
                return;
            }

            // Check if script is already in the document
            let script = document.getElementById(scriptId);

            if (!script) {
                script = document.createElement('script');
                script.id = scriptId;
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCGt03YWLd6CUTWIZQlBDtdvrTAAIfSqlM&callback=initMap`;
                script.async = true;
                script.defer = true;

                // Error handling for script load
                script.onerror = (err) => {
                    console.error("Google Maps script failed to load:", err);
                };

                document.head.appendChild(script);

                window.initMap = () => {
                    initializeMap();
                };
            } else {
                // Script is already loading, poll for window.google
                const pollInterval = setInterval(() => {
                    if (window.google && window.google.maps) {
                        initializeMap();
                        clearInterval(pollInterval);
                    }
                }, 100);

                // Timeout to prevent infinite polling
                setTimeout(() => clearInterval(pollInterval), 10000);
            }
        };

        loadGoogleMaps();

        return () => {
            // Clean up window.initMap to prevent memory leaks or multiple calls
            // window.initMap = null;
        };
    }, []);

    // Initialize map
    const initializeMap = () => {
        if (mapRef.current && !map) {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center: { lat: 22.3078, lng: 70.8185 },
                zoom: 12,
            });
            setMap(newMap);
        }
    };

    // Update markers when map or filters change
    useEffect(() => {
        if (map) {
            initializeMarkers();
        }
    }, [map, filters, selectedDistrict, selectedDistrictType, selectedProjectType, selectedIndices]);

    // Initialize markers
    const initializeMarkers = useCallback(() => {
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));

        // Get filtered projects
        const filteredProjects = getFilteredProjects();

        // Create new markers
        const newMarkers = filteredProjects.map((project, index) => {
            const originalIndex = projects.findIndex(p => p.name === project.name);
            const isSelected = selectedIndices.has(originalIndex);
            const isOverdue = isProjectOverdue(project);

            const marker = new window.google.maps.Marker({
                position: project.position,
                map: map,
                title: project.name,
                icon: {
                    url: isOverdue
                        ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        : isSelected
                            ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                            : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    scaledSize: isOverdue || !isSelected
                        ? new window.google.maps.Size(40, 40)
                        : new window.google.maps.Size(48, 48)
                }
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `<div><h3>${project.name}</h3><p>${project.locationName} - ${project.district}</p><p>${project.panelInfo}</p><p>Due Date: ${formatDate(project.installationDueDate)} ${isOverdue ? '<span style="color: red;">(Overdue)</span>' : ''}</p></div>`
            });

            marker.addListener('mouseover', () => {
                infoWindow.open(map, marker);
            });

            marker.addListener('mouseout', () => {
                infoWindow.close();
            });

            marker.addListener('click', () => {
                toggleSelection(originalIndex);
            });

            return marker;
        });

        setMarkers(newMarkers);
    }, [map, filters, selectedDistrict, selectedDistrictType, selectedProjectType, selectedIndices]);

    // Check if project is overdue
    const isProjectOverdue = (project) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(project.installationDueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Get filtered projects
    const getFilteredProjects = () => {
        let filtered = projects || [];

        // Filter by district card selection
        if (selectedDistrict !== '' && selectedDistrictType !== '') {
            filtered = filtered.filter(project => {
                if (!project) return false;
                return project.district === selectedDistrict &&
                    (selectedDistrictType === 'residential'
                        ? (project.service || '').includes('Residential')
                        : (project.service || '').includes('Commercial'))
            });
        }

        // Filter by category
        if (filters.category !== '') {
            filtered = filtered.filter(project => project && project.category === filters.category);
        }

        // Filter by project type (capacity)
        if (filters.projectType !== '') {
            filtered = filtered.filter(project => {
                if (!project || !project.capacity) return false;
                const capacityStr = String(project.capacity).split(' ')[0];
                const capacity = parseFloat(capacityStr) || 0;
                if (filters.projectType === '1KW to 5KW') {
                    return capacity >= 1 && capacity <= 5;
                } else if (filters.projectType === '5KW to 10KW') {
                    return capacity > 5 && capacity <= 10;
                } else if (filters.projectType === '11KW to 15KW') {
                    return capacity > 10 && capacity <= 15;
                }
                return true;
            });
        }

        // Filter by project type (residential/commercial)
        if (selectedProjectType === 'residential') {
            filtered = filtered.filter(project => project && (project.service || '').includes('Residential'));
        } else if (selectedProjectType === 'commercial') {
            filtered = filtered.filter(project => project && (project.service || '').includes('Commercial'));
        }

        return filtered;
    };

    // Toggle project selection
    const toggleSelection = (index) => {
        if (index === -1 || !projects[index]) return;

        const project = projects[index];
        const isCommercial = (project.service || '').includes('Commercial');
        const isResidential = (project.service || '').includes('Residential');

        setSelectedIndices(prev => {
            const newSet = new Set(prev);

            // If trying to select a commercial project
            if (isCommercial) {
                // If this commercial project is already selected, deselect it
                if (newSet.has(index)) {
                    newSet.delete(index);
                    setHasCommercialSelected(false);
                }
                // If no projects are selected, select this commercial project
                else if (newSet.size === 0) {
                    newSet.add(index);
                    setHasCommercialSelected(true);
                }
                // If a commercial project is already selected, replace it with this one
                else if (hasCommercialSelected) {
                    // Clear all selections and select this one
                    newSet.clear();
                    newSet.add(index);
                    setHasCommercialSelected(true);
                }
                // If residential projects are selected, don't allow selecting commercial
                else {
                    alert('You cannot mix residential and commercial projects in the same group. Please clear your selection first.');
                    return prev;
                }
            }
            // If trying to select a residential project
            else if (isResidential) {
                // If this residential project is already selected, deselect it
                if (newSet.has(index)) {
                    newSet.delete(index);
                    // Check if there are still residential projects selected
                    const hasResidential = Array.from(newSet).some(i =>
                        projects[i] && (projects[i].service || '').includes('Residential'));
                    setHasResidentialSelected(hasResidential);
                }
                // If no projects are selected or only residential projects are selected, check capacity
                else if (newSet.size === 0 || hasResidentialSelected) {
                    // Calculate current total capacity
                    let currentCapacity = 0;
                    newSet.forEach(i => {
                        if (projects[i] && projects[i].capacity) {
                            const capacityStr = String(projects[i].capacity).split(' ')[0];
                            const capacity = parseFloat(capacityStr) || 0;
                            currentCapacity += capacity;
                        }
                    });

                    // Add this project's capacity
                    const projectCapacityStr = String(project.capacity || '0').split(' ')[0];
                    const projectCapacity = parseFloat(projectCapacityStr) || 0;

                    // Check if adding this project would exceed 25 KW
                    if (currentCapacity + projectCapacity > 25) {
                        alert(`Cannot add this project. Total capacity would be ${(currentCapacity + projectCapacity).toFixed(1)} KW, which exceeds the 25 KW limit for residential groups.`);
                        return prev;
                    }

                    // If capacity is within limit, select this project
                    newSet.add(index);
                    setHasResidentialSelected(true);
                }
                // If a commercial project is selected, don't allow selecting residential
                else {
                    alert('You cannot mix residential and commercial projects in the same group. Please clear your selection first.');
                    return prev;
                }
            }

            return newSet;
        });
    };

    // Check if a project should be disabled
    const shouldDisableProject = (project) => {
        // If no projects are selected, none should be disabled
        if (selectedIndices.size === 0) {
            return false;
        }

        // If a commercial project is selected, disable all residential projects
        if (hasCommercialSelected && project.service.includes('Residential')) {
            return true;
        }

        // If residential projects are selected, disable all commercial projects
        if (hasResidentialSelected && project.service.includes('Commercial')) {
            return true;
        }

        // If a commercial project is already selected, disable other commercial projects
        if (hasCommercialSelected && project.service.includes('Commercial')) {
            // Check if this specific commercial project is already selected
            const originalIndex = projects.findIndex(p => p.name === project.name);
            return !selectedIndices.has(originalIndex);
        }

        // For residential projects, check if adding this project would exceed 25 KW
        if (hasResidentialSelected && project.service.includes('Residential')) {
            // Calculate current total capacity
            let currentCapacity = 0;
            selectedIndices.forEach(index => {
                const capacity = parseFloat(projects[index].capacity.split(' ')[0]);
                currentCapacity += capacity;
            });

            // Check if this project is already selected
            const originalIndex = projects.findIndex(p => p.name === project.name);
            if (!selectedIndices.has(originalIndex)) {
                // Add this project's capacity to check if it would exceed 25 KW
                const projectCapacity = parseFloat(project.capacity.split(' ')[0]);
                if (currentCapacity + projectCapacity > 25) {
                    return true;
                }
            }
        }

        return false;
    };

    // Calculate group summary
    const getGroupSummary = () => {
        const selectedProjects = Array.from(selectedIndices).map(index => projects[index]);

        let totalProjects = selectedProjects.length;
        let totalCapacity = 0;
        let totalInstallation = 0;
        let residentialCapacity = 0;
        let commercialCapacity = 0;
        let residentialCount = 0;
        let commercialCount = 0;

        selectedProjects.forEach(project => {
            if (!project) return;

            const capacityStr = String(project.capacity || '0').split(' ')[0];
            const capacityValue = parseFloat(capacityStr) || 0;
            totalCapacity += capacityValue;

            const instChargeStr = String(project.installationCharge || '0').replace(/[₹,/-]/g, '');
            const installationValue = parseInt(instChargeStr) || 0;
            totalInstallation += installationValue;

            if ((project.service || '').includes('Residential')) {
                residentialCapacity += capacityValue;
                residentialCount++;
            } else {
                commercialCapacity += capacityValue;
                commercialCount++;
            }
        });

        return {
            totalProjects,
            totalCapacity,
            totalInstallation,
            residentialCapacity,
            commercialCapacity,
            residentialCount,
            commercialCount
        };
    };

    // Create a new group
    const createGroup = () => {
        if (!groupName.trim()) {
            alert('Please enter a group name');
            return;
        }

        const selectedProjects = Array.from(selectedIndices).map(index => projects[index]);
        const summary = getGroupSummary();

        // Check if capacity exceeds 25 KW for residential projects
        if (summary.residentialCount > 0 && summary.residentialCapacity > 25) {
            alert(`Group capacity (${summary.residentialCapacity.toFixed(1)} KW) exceeds the maximum limit of 25 KW for residential projects. Please remove some projects to create a group.`);
            return;
        }

        // Check if more than one commercial project is selected
        if (summary.commercialCount > 1) {
            alert(`Only one commercial project can be selected for a group. Please remove ${summary.commercialCount - 1} commercial project(s) to create a group.`);
            return;
        }

        const newGroup = {
            id: Date.now(),
            name: groupName,
            projects: selectedProjects,
            totalCapacity: `${summary.totalCapacity.toFixed(1)} KW`,
            totalInstallation: `₹${summary.totalInstallation.toLocaleString('en-IN')}/-`,
            districts: [...new Set(selectedProjects.map(p => p.district))].join(', '),
            createdAt: new Date()
        };

        alert(`Group "${groupName}" has been created successfully with ${selectedProjects.length} projects and total capacity of ${newGroup.totalCapacity}.`);

        // Clear selection after creating group
        setSelectedIndices(new Set());
        setHasCommercialSelected(false);
        setHasResidentialSelected(false);
        setShowGroupModal(false);
        setGroupName('');
    };

    // Format date
    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get district short name
    const getDistrictShortName = (district) => {
        if (!district) return 'Unknown';
        const name = typeof district === 'string' ? district : (district.name || district.district || 'Unknown');
        return name.length <= 12 ? name : name.split(' ')[0];
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setSelectedIndices(new Set());
        setHasCommercialSelected(false);
        setHasResidentialSelected(false);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            category: '',
            projectType: '',
            subProjectType: ''
        });
        setSelectedDistrict('');
        setSelectedDistrictType('');
        setSelectedProjectType('residential');
        setSelectedIndices(new Set());
        setHasCommercialSelected(false);
        setHasResidentialSelected(false);
    };

    // Handle district card selection
    const selectDistrictCard = (district, type) => {
        if (selectedDistrict === district && selectedDistrictType === type) {
            setSelectedDistrict('');
            setSelectedDistrictType('');
        } else {
            setSelectedDistrict(district);
            setSelectedDistrictType(type);
        }
        setSelectedIndices(new Set());
        setHasCommercialSelected(false);
        setHasResidentialSelected(false);
    };

    const summary = getGroupSummary();
    const filteredProjects = getFilteredProjects();
    const canCreateGroup = selectedIndices.size > 0 &&
        !(summary.residentialCount > 0 && summary.residentialCapacity > 25) &&
        !(summary.commercialCount > 1);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-4">

                {/* Modern Navbar */}
                <nav className="bg-white rounded-lg shadow-sm mb-4">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <ul className="flex items-center space-x-6">
                            <li>
                                <button
                                    onClick={(e) => { e.preventDefault(); setActiveTab('makeGroup'); }}
                                    className={`flex items-center font-medium ${activeTab === 'makeGroup' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    <Users size={18} className="mr-2" />
                                    Make Group
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={(e) => { e.preventDefault(); setActiveTab('selectInstaller'); }}
                                    className={`flex items-center font-medium ${activeTab === 'selectInstaller' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    <Wrench size={18} className="mr-2" />
                                    Select Installer
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={(e) => { e.preventDefault(); setActiveTab('inProgress'); }}
                                    className={`flex items-center font-medium ${activeTab === 'inProgress' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    <FileText size={18} className="mr-2" />
                                    In Progress
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={(e) => { e.preventDefault(); setActiveTab('payment'); }}
                                    className={`flex items-center font-medium ${activeTab === 'payment' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    <CreditCard size={18} className="mr-2" />
                                    Payment
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="bg-white rounded-xl shadow-sm mb-4 border border-gray-100">
                    <div className="p-4">
                        <h4 className="text-blue-600 font-bold text-lg flex items-center gap-2">
                            <Wrench size={20} />
                            Project Install ({entityLabel})
                        </h4>
                    </div>
                </div>

                {activeTab === 'makeGroup' && (
                    <>
                        {/* Header */}
                        <div className="bg-white rounded-lg shadow-sm mb-4">
                            <div className="p-4">
                                <h4 className="text-blue-600 font-bold text-lg">Select Projects</h4>
                            </div>
                        </div>

                        {/* Filter Section */}
                        <div className="bg-white rounded-lg shadow-sm mb-4">
                            <div className="p-4">
                                {/* Row 1: Category, Project Type, Sub Project Type Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            value={filters.category}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Categories</option>
                                            <option value="Rooftop Solar">Rooftop Solar</option>
                                            <option value="Solar Pump">Solar Pump</option>
                                            <option value="Solar Light">Solar Light</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Project Type</label>
                                        <select
                                            name="projectType"
                                            value={filters.projectType}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Project Types</option>
                                            <option value="1KW to 5KW">1KW to 5KW</option>
                                            <option value="5KW to 10KW">5KW to 10KW</option>
                                            <option value="11KW to 15KW">11KW to 15KW</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Sub Project Type</label>
                                        <select
                                            name="subProjectType"
                                            value={filters.subProjectType}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Sub Project Types</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="Ongrid">Ongrid</option>
                                            <option value="Offgrid">Offgrid</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end space-x-2">
                                        <button
                                            onClick={() => {
                                                setSelectedIndices(new Set());
                                                setHasCommercialSelected(false);
                                                setHasResidentialSelected(false);
                                            }}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center"
                                        >
                                            <Filter size={14} className="mr-1" />
                                            Apply Filters
                                        </button>
                                        <button
                                            onClick={resetFilters}
                                            className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 flex items-center justify-center"
                                        >
                                            <X size={14} className="mr-1" />
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* District Summary Cards */}
                                <div className="flex overflow-x-auto gap-2 pb-2">
                                    {districts.map((district) => (
                                        <React.Fragment key={district.name}>
                                            {/* Residential Card */}
                                            <div
                                                onClick={() => selectDistrictCard(district.name, 'residential')}
                                                className={`flex-shrink-0 w-36 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm cursor-pointer transition-all ${selectedDistrict === district.name && selectedDistrictType === 'residential'
                                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                                    : 'hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="p-2 text-center">
                                                    <Home size={16} className="mx-auto text-blue-500 mb-1" />
                                                    <div className="text-xs font-semibold truncate" title={district.name}>
                                                        {getDistrictShortName(district.name)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Residential: {projects.filter(p => p.district === district.name && p.service.includes('Residential')).length}
                                                    </div>
                                                    <div className="text-xs text-red-500">
                                                        {projects.filter(p => p.district === district.name && p.service.includes('Residential') && isProjectOverdue(p)).length} Overdue
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Commercial Card */}
                                            <div
                                                onClick={() => selectDistrictCard(district.name, 'commercial')}
                                                className={`flex-shrink-0 w-36 bg-white border-l-4 border-yellow-500 rounded-lg shadow-sm cursor-pointer transition-all ${selectedDistrict === district.name && selectedDistrictType === 'commercial'
                                                    ? 'ring-2 ring-yellow-500 bg-yellow-50'
                                                    : 'hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="p-2 text-center">
                                                    <Building2 size={16} className="mx-auto text-yellow-500 mb-1" />
                                                    <div className="text-xs font-semibold truncate" title={district.name}>
                                                        {getDistrictShortName(district.name)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Commercial: {projects.filter(p => p.district === district.name && p.service.includes('Commercial')).length}
                                                    </div>
                                                    <div className="text-xs text-red-500">
                                                        {projects.filter(p => p.district === district.name && p.service.includes('Commercial') && isProjectOverdue(p)).length} Overdue
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Map and Projects Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                            {/* Projects Section */}
                            <div className="lg:col-span-5">
                                <div className="bg-white rounded-lg shadow-sm h-full">
                                    <div className="p-3 border-b flex justify-between items-center">
                                        <h5 className="font-semibold">Projects</h5>
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                            {filteredProjects.length} Projects
                                        </span>
                                    </div>
                                    <div className="p-2 overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                                        <div className="space-y-2">
                                            {filteredProjects.map((project, index) => {
                                                const originalIndex = projects.findIndex(p => p.name === project.name);
                                                const isSelected = selectedIndices.has(originalIndex);
                                                const isOverdue = isProjectOverdue(project);
                                                const isDisabled = shouldDisableProject(project);
                                                const isResidential = project.service.includes('Residential');

                                                return (
                                                    <div
                                                        key={originalIndex}
                                                        onClick={() => !isDisabled && toggleSelection(originalIndex)}
                                                        className={`bg-white rounded-lg shadow-sm border p-3 transition-all ${isSelected
                                                            ? 'border-orange-500 bg-orange-50'
                                                            : isDisabled
                                                                ? 'opacity-50 cursor-not-allowed border-gray-200'
                                                                : 'border-gray-200 hover:shadow-md cursor-pointer'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h6 className="font-semibold flex items-center">
                                                                {isResidential ? (
                                                                    <Home size={14} className="mr-1 text-blue-500" />
                                                                ) : (
                                                                    <Building2 size={14} className="mr-1 text-yellow-500" />
                                                                )}
                                                                {project.name}
                                                            </h6>
                                                            <div className="flex gap-1">
                                                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                                                                    {project.district}
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded ${isResidential
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {isResidential ? 'Residential' : 'Commercial'}
                                                                </span>
                                                                {isOverdue && (
                                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">
                                                                        Overdue
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-500 text-xs">Contact</span>
                                                                <div className="text-sm">{project.contactNumber}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 text-xs">Capacity</span>
                                                                <div className="text-sm">{project.capacity}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 text-xs">Panels</span>
                                                                <div className="text-sm">{project.panelInfo}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 text-xs">Installation</span>
                                                                <div className="text-sm">{project.installationCharge}</div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 pt-2 border-t text-xs flex justify-between">
                                                            <span className="text-gray-500">
                                                                {formatDate(project.date)}
                                                            </span>
                                                            <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                                                Due: {formatDate(project.installationDueDate)} {isOverdue && '(Overdue)'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="lg:col-span-7">
                                <div className="bg-white rounded-lg shadow-sm h-full">
                                    <div
                                        ref={mapRef}
                                        className="w-full rounded-lg"
                                        style={{ height: 'calc(100vh - 400px)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Create Group Section */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-4">
                                {/* Project Type Restriction Alert */}
                                {summary.commercialCount > 1 && (
                                    <div className="bg-red-100 border-l-4 border-red-500 p-2 mb-2 text-sm text-red-700">
                                        <AlertTriangle size={14} className="inline mr-1" />
                                        Only one commercial project can be selected for a group.
                                    </div>
                                )}

                                {/* Capacity Limit Alert */}
                                {summary.residentialCount > 0 && summary.residentialCapacity > 25 && (
                                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 mb-2 text-sm text-yellow-700">
                                        <AlertTriangle size={14} className="inline mr-1" />
                                        Group capacity cannot exceed 25 KW. Please remove some projects to create a group.
                                    </div>
                                )}

                                {/* Compact Group Summary */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {summary.totalProjects}
                                            </div>
                                            <div className="text-xs text-gray-600">Selected Projects</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {summary.totalCapacity.toFixed(1)} KW
                                            </div>
                                            <div className="text-xs text-gray-600">Total Capacity</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {formatCurrency(summary.totalInstallation)}
                                            </div>
                                            <div className="text-xs text-gray-600">Total Installation</div>
                                        </div>
                                        <div className="text-center">
                                            <button
                                                onClick={() => setShowGroupModal(true)}
                                                disabled={!canCreateGroup}
                                                className={`px-4 py-2 rounded-md text-sm flex items-center justify-center ${canCreateGroup
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Plus size={16} className="mr-1" />
                                                Create Group
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}


                {activeTab === 'selectInstaller' && (
                    <>
                        <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-200">
                            <div className="p-4 flex items-center justify-between">
                                <h4 className="text-blue-600 font-bold text-lg">Assign Installer to Group</h4>
                                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm">
                                    <ArrowLeft size={16} className="mr-2" /> Back to Groups
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex justify-between border-b border-gray-200 pb-4 mb-6">
                                <h5 className="font-bold text-gray-800 text-lg">Select a Group</h5>
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">3 Groups</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {groupsList.map(g => (
                                    <div key={g.id} className="border-l-4 border-blue-500 rounded-lg shadow-sm border-t border-r border-b border-gray-100 p-5 relative min-h-[220px]">
                                        <div className="flex justify-between items-start mb-5">
                                            <h6 className="font-bold text-gray-800 text-[15px] w-3/4">{g.name}</h6>
                                            <span className="bg-blue-500 text-white text-[11px] px-2.5 py-1 rounded font-bold">{g.projectCount} Projects</span>
                                        </div>

                                        <div className="space-y-2.5 text-[13px] text-gray-600 mb-8">
                                            <div className="flex justify-between">
                                                <span>Total Capacity:</span>
                                                <span className="font-bold text-gray-800">{g.capacity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Installation:</span>
                                                <span className="font-bold text-gray-800">{g.installation}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>District:</span>
                                                <span className="font-bold text-gray-800">{g.district}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Installer:</span>
                                                <span className="font-bold text-gray-800">{g.installer}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-3 mt-4 text-[11px] text-gray-400 absolute bottom-4 left-5 right-5">
                                            Created: {g.created}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'inProgress' && (
                    <>
                        <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-200">
                            <div className="p-4">
                                <h4 className="text-blue-600 font-bold text-lg">Project In Progress</h4>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Installers Column */}
                            <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] overflow-y-auto border border-gray-200">
                                <div className="flex justify-between border-b pb-3 mb-4">
                                    <h5 className="font-bold text-gray-800 text-[15px]">Installers</h5>
                                    <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">4 Installers</span>
                                </div>
                                <div className="space-y-4">
                                    {installersList.map(inst => (
                                        <div key={inst.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md cursor-pointer transition-all bg-white">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center font-bold text-sm text-gray-800">
                                                    <User size={14} className="mr-1.5 text-blue-600" /> {inst.name}
                                                </div>
                                                <div className="bg-yellow-400 text-[10px] px-1.5 py-0.5 rounded flex items-center font-bold">
                                                    <Star size={10} className="mr-1 fill-black" /> {inst.rating}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                                <div>
                                                    <div className="mb-0.5 text-gray-500">Phone</div>
                                                    <div className="font-medium text-gray-800">{inst.phone}</div>
                                                </div>
                                                <div>
                                                    <div className="mb-0.5 text-gray-500">Experience</div>
                                                    <div className="font-medium text-gray-800">{inst.exp}</div>
                                                </div>
                                                <div className="col-span-2 mt-1">
                                                    <div className="mb-0.5 text-gray-500">Location</div>
                                                    <div className="font-medium text-gray-800">{inst.location}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Groups Column */}
                            <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] border border-gray-200">
                                <div className="flex justify-between border-b pb-3 mb-4">
                                    <h5 className="font-bold text-gray-800 text-[15px]">Groups</h5>
                                    <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">0 Groups</span>
                                </div>
                                <div className="bg-[#e6f4f1] text-[#00665c] p-3 rounded-md flex items-center text-sm border border-[#b2e0d8]">
                                    <Info size={16} className="mr-2 flex-shrink-0" /> Select an installer to view assigned groups
                                </div>
                            </div>

                            {/* Projects Column */}
                            <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] border border-gray-200">
                                <div className="flex justify-between border-b pb-3 mb-4">
                                    <h5 className="font-bold text-gray-800 text-[15px]">Projects</h5>
                                    <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">0 Projects</span>
                                </div>
                                <div className="bg-[#e6f4f1] text-[#00665c] p-3 rounded-md flex items-center text-sm border border-[#b2e0d8]">
                                    <Info size={16} className="mr-2 flex-shrink-0" /> Select a group to view projects
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'payment' && (
                    <>
                        <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-200">
                            <div className="p-4">
                                <h4 className="text-blue-600 font-bold text-lg">Payment</h4>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Installers Column */}
                            <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] overflow-y-auto border border-gray-200">
                                <div className="flex justify-between border-b pb-3 mb-4">
                                    <h5 className="font-bold text-gray-800 text-[15px]">Installers</h5>
                                    <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">4 Installers</span>
                                </div>
                                <div className="space-y-4">
                                    {installersList.map(inst => (
                                        <div key={inst.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md cursor-pointer transition-all bg-white">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center font-bold text-sm text-gray-800">
                                                    <User size={14} className="mr-1.5 text-blue-600" /> {inst.name}
                                                </div>
                                                <div className="bg-yellow-400 text-[10px] px-1.5 py-0.5 rounded flex items-center font-bold">
                                                    <Star size={10} className="mr-1 fill-black" /> {inst.rating}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                                <div>
                                                    <div className="mb-0.5 text-gray-500">Phone</div>
                                                    <div className="font-medium text-gray-800">{inst.phone}</div>
                                                </div>
                                                <div>
                                                    <div className="mb-0.5 text-gray-500">Experience</div>
                                                    <div className="font-medium text-gray-800">{inst.exp}</div>
                                                </div>
                                                <div className="col-span-2 mt-1">
                                                    <div className="mb-0.5 text-gray-500">Location</div>
                                                    <div className="font-medium text-gray-800">{inst.location}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Groups Column */}
                            <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] border border-gray-200">
                                <div className="flex justify-between border-b pb-3 mb-4">
                                    <h5 className="font-bold text-gray-800 text-[15px]">Groups</h5>
                                    <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">0 Groups</span>
                                </div>
                                <div className="bg-[#e6f4f1] text-[#00665c] p-3 rounded-md flex items-center text-sm border border-[#b2e0d8]">
                                    <Info size={16} className="mr-2 flex-shrink-0" /> Select an installer to view assigned groups
                                </div>
                            </div>

                            {/* Projects Column */}
                            <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] border border-gray-200">
                                <div className="flex justify-between border-b pb-3 mb-4">
                                    <h5 className="font-bold text-gray-800 text-[15px]">Projects</h5>
                                    <span className="bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">0 Projects</span>
                                </div>
                                <div className="bg-[#e6f4f1] text-[#00665c] p-3 rounded-md flex items-center text-sm border border-[#b2e0d8]">
                                    <Info size={16} className="mr-2 flex-shrink-0" /> Select a group to view projects
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Create Group Modal */}
                {showGroupModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h5 className="text-lg font-semibold">Create New Group</h5>
                                <button
                                    onClick={() => setShowGroupModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <form>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Group Name
                                        </label>
                                        <input
                                            type="text"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter group name"
                                            required
                                        />
                                        <small className="text-gray-500 text-xs mt-1 block">
                                            Give a descriptive name for your group
                                        </small>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                        <h6 className="font-semibold text-blue-700 mb-2">Group Summary</h6>
                                        <div className="text-sm space-y-1">
                                            <div>Projects: <span className="font-medium">{summary.totalProjects}</span></div>
                                            <div>Total Capacity: <span className="font-medium">{summary.totalCapacity.toFixed(1)} KW</span></div>
                                            <div>Total Installation: <span className="font-medium">{formatCurrency(summary.totalInstallation)}</span></div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowGroupModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createGroup}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Group
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProjectManagementInstall;
