import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CreditCard,
    Menu,
    X,
    Home,
    ChevronDown,
    Gauge,
    Briefcase,
    Network,
    User,
    FileText,
    Settings,
    Wrench,
    ClipboardList,
    DollarSign,
    Users,
    Store,
    Handshake,
    Building2,
    Sun
} from 'lucide-react';

import authStore from '../../store/authStore';
import DynamicMenuRenderer from '../../components/Sidebar/DynamicMenuRenderer';

export default function FranchiseeSidebar() {
    const { user } = authStore();
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    // State for expanded sections
    const [expandedSections, setExpandedSections] = useState({
        dashboard: true,
        projectSignup: false,
        projectManagement: false,
        surveyBom: false,
        districtManager: false,
        dealerManager: false,
        leadPartner: false,
        myTeam: false,
        account: false,
        solarkits: false,
        settings: false,
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const menuItems = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            icon: Gauge,
            href: '/franchisee/dashboard',
            children: [
                { name: 'Franchise Dashboard', href: '/franchisee/dashboard', icon: LayoutDashboard },
                { name: 'District Manager', href: '/franchisee/district-manager', icon: Building2 },
                { name: 'Lead Assign Dashboard', href: '/franchisee/dashboard/lead-assign', icon: ClipboardList }
            ]
        },
        {
            id: 'projectSignup',
            name: 'Project Signup',
            icon: Briefcase,
            children: [
                { name: 'Lead', href: '/franchisee/project-signup/lead', icon: User },
                { name: 'Create Quotation', href: '/franchisee/project-signup/create-quotation', icon: FileText },
                { name: 'Project Signup', href: '/franchisee/project-signup/project-signup', icon: ClipboardList },
                { name: 'Loan', href: '/franchisee/project-signup/loan', icon: DollarSign }
            ]
        },
        {
            id: 'projectManagement',
            name: 'Project Management',
            icon: Network,
            children: [
                { name: 'Management', href: '/franchisee/project-management/management', icon: Settings },
                { name: 'Install', href: '/franchisee/project-management/install', icon: Wrench },
                { name: 'Service', href: '/franchisee/project-management/service', icon: Wrench },
                { name: 'Track Service', href: '/franchisee/project-management/track-service', icon: ClipboardList }
            ]
        },
        {
            id: 'surveyBom',
            name: 'Survey Bom',
            icon: FileText,
            children: [
                { name: 'Survey Bom', href: '/franchisee/survey-bom', icon: FileText }
            ]
        },
        {
            id: 'districtManager',
            name: 'District Manager',
            icon: Building2,
            children: [
                { name: 'District Manager', href: '/franchisee/district-manager', icon: Building2 }
            ]
        },
        {
            id: 'dealerManager',
            name: 'Dealer Manager',
            icon: Store,
            children: [
                { name: 'Dealer Manager', href: '/franchisee/dealer-manager', icon: Store }
            ]
        },
        {
            id: 'leadPartner',
            name: 'Lead Partner',
            icon: Handshake,
            children: [
                { name: 'Create Lead Partner', href: '/franchisee/lead-partner/create', icon: Handshake },
                { name: 'Lead Management', href: '/franchisee/lead-partner/management', icon: Users }
            ]
        },
        {
            id: 'myTeam',
            name: 'My Team',
            icon: Users,
            children: [
                { name: 'My Team', href: '/franchisee/my-team', icon: Users }
            ]
        },
        {
            id: 'account',
            name: 'Account',
            icon: User,
            children: [
                { name: 'Track Payments', href: '/franchisee/account/track-payments', icon: DollarSign }
            ]
        },
        {
            id: 'solarkits',
            name: 'Solarkits',
            icon: Sun,
            children: [
                { name: 'Solarkits', href: '/franchisee/solarkits', icon: Sun },
                { name: 'Bulk Order', href: '/franchisee/solarkits/bulk-order', icon: ClipboardList }
            ]
        },
        {
            id: 'settings',
            name: 'Settings',
            icon: Settings,
            children: [
                { name: 'Setting', href: '/franchisee/settings', icon: Settings }
            ]
        },
    ];

    // Extract all existing routes
    const existingRoutes = [];
    const extractRoutes = (items) => {
      if (!items) return;
      items.forEach(item => {
        if (item.href) existingRoutes.push(item.href);
        if (item.children) extractRoutes(item.children);
      });
    };
    extractRoutes(menuItems);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md lg:hidden"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside
                className={`${isOpen ? 'w-64' : 'w-0'
                    } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col lg:w-64 h-screen`}
            >
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <Home size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">SOLARKITS</h1>
                            <p className="text-xs text-gray-400">Franchisee Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {menuItems.map((item) => (
                        <div key={item.id} className="mb-1">
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleSection(item.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition mx-2 ${location.pathname.startsWith(item.href) || item.children.some(child => location.pathname === child.href) ? 'bg-gray-800' : ''}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <item.icon size={20} />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`transform transition ${expandedSections[item.id] ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {expandedSections[item.id] && (
                                        <div className="mt-1 ml-6">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    to={child.href}
                                                    className={`flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition ${location.pathname === child.href ? 'text-white bg-gray-800' : ''}`}
                                                >
                                                    {child.icon && <child.icon size={16} />}
                                                    <span>{child.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.href}
                                    className={`block px-4 py-3 mx-2 hover:bg-gray-800 rounded-lg transition flex items-center space-x-3 ${location.pathname === item.href ? 'bg-gray-800' : ''}`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                    
                    <DynamicMenuRenderer existingRoutes={existingRoutes} theme="dark" />
                </nav>
            </aside>
        </>
    );
}
