import React from 'react';
import { Link } from 'react-router-dom';
import { List, ArrowDownCircle, ArrowUpCircle, Smartphone, Loader2 } from 'lucide-react';
import { getCompanyLeadsSummary } from '../../services/leadService';

const DealerManagerOnboardingCompanyLead = () => {
    // Lead type configurations
    const leadTypes = [
        {
            id: 1,
            title: 'In',
            subtitle: 'Bound',
            icon: ArrowDownCircle,
            color: 'from-cyan-400 to-cyan-600',
            bgColor: 'bg-cyan-50',
            borderColor: 'border-cyan-200',
            iconColor: 'text-cyan-500',
            path: '/dealer-manager/onboarding/sub-leads/1'
        },
        {
            id: 2,
            title: 'Out',
            subtitle: 'Bound',
            icon: ArrowUpCircle,
            color: 'from-orange-400 to-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            iconColor: 'text-orange-500',
            path: '/dealer-manager/onboarding/sub-leads/2'
        },
        {
            id: 3,
            title: 'App',
            subtitle: 'Lead',
            icon: Smartphone,
            color: 'from-purple-400 to-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            iconColor: 'text-purple-500',
            path: '/dealer-manager/onboarding/sub-leads/3'
        }
    ];

    const [summary, setSummary] = React.useState({ inbound: 0, outbound: 0, applead: 0 });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await getCompanyLeadsSummary();
                if (res.success) setSummary(res.data);
            } catch (error) {
                console.error('Error fetching summary:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    return (
        <div className="container-fluid px-4 py-4">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-800">Company Lead Management</h4>
                        <p className="text-sm text-gray-500 mt-1">Manage and track all company leads</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full">
                        <List className="w-6 h-6 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Lead Type Cards */}
            <div className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leadTypes.map((lead) => (
                        <div key={lead.id} className="col-span-1">
                            <Link
                                to={lead.path}
                                className="block group"
                            >
                                <div className={`
                  bg-white rounded-xl shadow-md hover:shadow-xl 
                  transition-all duration-300 transform hover:-translate-y-1
                  border ${lead.borderColor} overflow-hidden
                `}>
                                    {/* Gradient Top Bar */}
                                    <div className={`h-2 bg-gradient-to-r ${lead.color}`}></div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-baseline">
                                                    <span className="text-3xl font-bold text-gray-800">{lead.title}</span>
                                                    <span className="text-2xl font-semibold text-gray-600 ml-1">{lead.subtitle}</span>
                                                </div>

                                                {/* Stats or additional info can go here */}
                                                <div className="mt-4 flex items-center space-x-2">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Click to manage
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Icon Container */}
                                            <div className={`
                        ${lead.bgColor} p-4 rounded-full 
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                                                <lead.icon className={`w-8 h-8 ${lead.iconColor}`} />
                                            </div>
                                        </div>

                                        {/* Bottom Indicator */}
                                        <div className="mt-4 flex items-center justify-end">
                                            <span className={`
                        text-sm font-medium
                        ${lead.id === 1 ? 'text-cyan-600' : ''}
                        ${lead.id === 2 ? 'text-orange-600' : ''}
                        ${lead.id === 3 ? 'text-purple-600' : ''}
                      `}>
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optional: Summary Section */}
            {loading ? (
                <div className="flex justify-center my-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* In Bound Summary */}
                    <div className="bg-gradient-to-br from-cyan-50 to-white rounded-lg p-4 border border-cyan-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-600 font-medium">In Bound Leads</p>
                                <p className="text-2xl font-bold text-gray-800">{summary.inbound}</p>
                            </div>
                            <ArrowDownCircle className="w-8 h-8 text-cyan-500" />
                        </div>
                    </div>

                    {/* Out Bound Summary */}
                    <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-4 border border-orange-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-medium">Out Bound Leads</p>
                                <p className="text-2xl font-bold text-gray-800">{summary.outbound}</p>
                            </div>
                            <ArrowUpCircle className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>

                    {/* App Lead Summary */}
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">App Leads</p>
                                <p className="text-2xl font-bold text-gray-800">{summary.applead}</p>
                            </div>
                            <Smartphone className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerManagerOnboardingCompanyLead;