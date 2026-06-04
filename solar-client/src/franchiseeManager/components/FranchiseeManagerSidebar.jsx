'use client';

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Filter,
    Layers,
    CheckSquare,
    TrendingUp,
    Settings,
    Users,
    Ticket,
    Search,
    ClipboardList,
    Menu,
    X,
    Home,
    ChevronDown,
    ChevronRight,
    Smartphone,
    UserPlus,
    BookOpen,
    Clock,
    BarChart,
    Package,
    Tag,
    DollarSign,
    UserCheck,
    Activity,
    RefreshCw,
    Wrench,
    ShieldAlert,
} from 'lucide-react';

import authStore from '../../store/authStore';
import DynamicMenuRenderer from '../../components/Sidebar/DynamicMenuRenderer';

export default function FranchiseeManagerSidebar() {
    const { user } = authStore();
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const [expandedSections, setExpandedSections] = useState({
        myTask: false,
        franchiseeOnboarding: false,
        projectManagement: false,
        franchiseeSetting: false,
        dealerManagement: false,
        tickets: false,
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const mainSections = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            icon: LayoutDashboard,
            href: '/franchisee-manager/dashboard'
        },
        {
            id: 'leads',
            name: 'Leads',
            icon: Filter,
            href: '/franchisee-manager/leads'
        },
        {
            id: 'leadManagement',
            name: 'Lead Management',
            icon: Layers,
            href: '/franchisee-manager/lead-management'
        },
        {
            id: 'myTask',
            name: 'My Task',
            icon: CheckSquare,
            isExpanded: expandedSections.myTask,
            children: [
                { name: 'App Demo', href: '/franchisee-manager/my-task/app-demo', icon: Smartphone },
                {
                    id: 'franchiseeOnboarding',
                    name: 'Franchisee onboarding',
                    icon: UserPlus,
                    isGroup: true,
                    isExpanded: expandedSections.franchiseeOnboarding,
                    children: [
                        { name: 'Franchisee Signup', href: '/franchisee-manager/my-task/franchisee-onboarding/franchisee-signup', icon: UserPlus },
                        { name: 'Franchisee Orientation', href: '/franchisee-manager/my-task/franchisee-onboarding/franchisee-orientation', icon: BookOpen },
                    ]
                },
                {
                    id: 'projectManagement',
                    name: 'ProjectManagement',
                    icon: Clock,
                    isGroup: true,
                    isExpanded: expandedSections.projectManagement,
                    children: [
                        { name: 'Project In Progress', href: '/franchisee-manager/my-task/project-management/project-in-progress', icon: Clock },
                    ]
                },
                { name: 'Franchisee Performance', href: '/franchisee-manager/my-task/franchisee-performance', icon: BarChart },
            ]
        },
        {
            id: 'onboardingGoals',
            name: 'Franchisee Onboarding Goals',
            icon: TrendingUp,
            href: '/franchisee-manager/onboarding-goals'
        },
        {
            id: 'franchiseeSetting',
            name: 'Franchisee setting',
            icon: Settings,
            isExpanded: expandedSections.franchiseeSetting,
            children: [
                { name: 'ComboKit Customization', href: '/franchisee-manager/franchisee-setting/combokit-customization', icon: Package },
                { name: 'Offers', href: '/franchisee-manager/franchisee-setting/offers', icon: Tag },
                { name: 'Track Cashback', href: '/franchisee-manager/franchisee-setting/track-cashback', icon: DollarSign },
            ]
        },
        {
            id: 'dealerManagement',
            name: 'Dealer Management',
            icon: Users,
            isExpanded: expandedSections.dealerManagement,
            children: [
                { name: 'Assign To Franchisee', href: '/franchisee-manager/dealer-management/assign-to-franchisee', icon: UserCheck },
                { name: 'Track Dealer', href: '/franchisee-manager/dealer-management/track-dealer', icon: Activity },
                { name: 'Reasign To Company', href: '/franchisee-manager/dealer-management/reasign-to-company', icon: RefreshCw },
            ]
        },
        {
            id: 'tickets',
            name: 'Raise Ticket',
            icon: Ticket,
            isExpanded: expandedSections.tickets,
            children: [
                { name: 'Service', href: '/franchisee-manager/tickets/service', icon: Wrench },
                { name: 'Dispute', href: '/franchisee-manager/tickets/dispute', icon: ShieldAlert }
            ]
        },
        {
            id: 'findResources',
            name: 'Find Resources',
            icon: Search,
            href: '/franchisee-manager/find-resources'
        },
        {
            id: 'report',
            name: 'Report',
            icon: ClipboardList,
            href: '/franchisee-manager/report'
        }
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
    extractRoutes(mainSections);

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
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Home size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">SOLARKITS</h1>
                            <p className="text-xs text-gray-400">Franchisee Manager</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {mainSections.map((section) => (
                        <div key={section.id} className="mb-1">
                            {section.children ? (
                                <>
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 mx-2 text-left hover:bg-gray-800 rounded-lg transition ${location.pathname.startsWith(section.href || `/${section.id}`) ? 'bg-gray-800' : ''}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <section.icon size={20} />
                                            <span className="font-medium text-sm">{section.name}</span>
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`transform transition-transform ${section.isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {section.isExpanded && (
                                        <div className="mt-1 ml-6">
                                            {section.children.map((child) => {
                                                if (child.isGroup) {
                                                    return (
                                                        <div key={child.id} className="mt-2">
                                                            <button
                                                                 onClick={() => toggleSection(child.id)}
                                                                 className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition ${child.isExpanded ? 'bg-gray-800 text-white' : ''}`}
                                                             >
                                                                 <div className="flex items-center space-x-2">
                                                                     {child.icon && <child.icon size={16} />}
                                                                     <span>{child.name}</span>
                                                                 </div>
                                                                 <ChevronRight
                                                                     size={14}
                                                                     className={`transform transition ${child.isExpanded ? 'rotate-90' : ''}`}
                                                                 />
                                                             </button>

                                                             {child.isExpanded && child.children && (
                                                                 <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
                                                                     {child.children.map((subChild) => (
                                                                         <Link
                                                                             key={subChild.href}
                                                                             to={subChild.href}
                                                                             className={`flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition ${location.pathname === subChild.href ? 'text-white bg-gray-800 font-medium' : ''}`}
                                                                         >
                                                                             <span className="mr-2">−</span>
                                                                             {subChild.icon && <subChild.icon size={14} />}
                                                                             <span>{subChild.name}</span>
                                                                         </Link>
                                                                     ))}
                                                                 </div>
                                                             )}
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={child.href}
                                                        to={child.href}
                                                        className={`flex items-center space-x-2 px-3 py-2 text-sm text-gray-200 hover:text-white hover:bg-gray-800 rounded-lg transition ${location.pathname === child.href ? 'text-white bg-gray-800 font-medium' : ''}`}
                                                    >
                                                        {child.icon && <child.icon size={16} />}
                                                        <span>{child.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={section.href}
                                    className={`block px-4 py-3 mx-2 hover:bg-gray-800 rounded-lg transition flex items-center space-x-3 ${location.pathname === section.href ? 'bg-gray-800' : ''}`}
                                >
                                    <section.icon size={20} />
                                    <span className="font-medium text-sm">{section.name}</span>
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
