'use client';

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    BriefcaseBusiness,
    MapPin,
    Ticket,
    Package,
    CreditCard,
    BarChart3,
    Menu,
    X,
    Home,
    ChevronDown,
    UserPlus,
    ClipboardList,
    FileCheck,
    Settings,
    Activity,
    PlusCircle,
    Clock
} from 'lucide-react';
import authStore from '../../store/authStore';
import DynamicMenuRenderer from '../../components/Sidebar/DynamicMenuRenderer';

export default function DealerSidebar() {
    const { user } = authStore();
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const [expandedSections, setExpandedSections] = useState({
        projectSignup: false,
        projectManagement: false,
        track: false,
        tickets: false,
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
            icon: LayoutDashboard,
            href: '/dealer/dashboard'
        },
        {
            id: 'projectSignup',
            name: 'Project Signup',
            icon: FileText,
            // href: '/dealer/project-signup', // Removed parent href to avoid confusion, though logic uses it for expansion
            children: [
                { name: 'Lead', href: '/dealer/project-signup/lead', icon: UserPlus },
                { name: 'Survey BOM', href: '/dealer/project-signup/survey-bom', icon: ClipboardList },
                { name: 'Project Quote', href: '/dealer/project-signup/project-quote', icon: FileText },
                { name: 'Project Signup', href: '/dealer/project-signup/project-signup', icon: FileCheck }
            ]
        },
        {
            id: 'projectManagement',
            name: 'Project Management',
            icon: BriefcaseBusiness,
            // href: '/dealer/project-management',
            children: [
                { name: 'Manage', href: '/dealer/project-management/manage', icon: Settings },
                { name: 'Track', href: '/dealer/project-management/track', icon: Activity }
            ]
        },
        {
            id: 'track',
            name: 'Track',
            icon: MapPin,
            // href: '/dealer/track',
            children: [
                { name: 'Project Progress', href: '/dealer/track/project-progress', icon: BarChart3 },
                { name: 'My Commission', href: '/dealer/track/my-commission', icon: CreditCard }
            ]
        },
        {
            id: 'tickets',
            name: 'Tickets',
            icon: Ticket,
            // href: '/dealer/tickets',
            children: [
                { name: 'Raise Ticket', href: '/dealer/tickets/raise-ticket', icon: PlusCircle },
                { name: 'Ticket Status', href: '/dealer/tickets/ticket-status', icon: Clock }
            ]
        },
        {
            id: 'solarKit',
            name: 'Solar Kit',
            icon: Package,
            href: '/dealer/solar-kit'
        },
        {
            id: 'loan',
            name: 'Loan',
            icon: CreditCard,
            href: '/dealer/loan'
        },
        {
            id: 'reports',
            name: 'Report',
            icon: BarChart3,
            href: '/dealer/reports'
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
                            <p className="text-xs text-gray-400">Dealer Portal</p>
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
                                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition mx-2 ${location.pathname.startsWith(item.href) ? 'bg-gray-800' : ''}`}
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
