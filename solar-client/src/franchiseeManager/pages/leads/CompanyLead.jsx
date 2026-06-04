import React from 'react';
import { Link } from 'react-router-dom';
import { List, ArrowDownToLine, ArrowUpFromLine, Smartphone } from 'lucide-react';

const FranchiseeManagerOnboardingCompanyLead = () => {
    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h4 className="text-xl font-semibold text-blue-600">
                    Company Lead Management
                </h4>
            </div>

            {/* Lead Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* In Bound Card */}
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <Link
                        to="/frenchiseManager/frenchiseManager_onboardingsubleads?id=1"
                        className="block p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-gray-800 leading-tight">
                                    In<br />Bound
                                </div>
                            </div>
                            <div className="bg-teal-50 p-4 rounded-full">
                                <ArrowDownToLine size={32} className="text-teal-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                            <List size={16} className="mr-1" />
                            <span>View Inbound Leads</span>
                        </div>
                    </Link>
                </div>

                {/* Out Bound Card */}
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <Link
                        to="/frenchiseManager/frenchiseManager_onboardingsubleads?id=2"
                        className="block p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-gray-800 leading-tight">
                                    Out<br />Bound
                                </div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-full">
                                <ArrowUpFromLine size={32} className="text-orange-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                            <List size={16} className="mr-1" />
                            <span>View Outbound Leads</span>
                        </div>
                    </Link>
                </div>

                {/* App Lead Card */}
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <Link
                        to="/frenchiseManager/frenchiseManager_onboardingsubleads?id=3"
                        className="block p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-gray-800 leading-tight">
                                    App<br />Lead
                                </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-full">
                                <Smartphone size={32} className="text-purple-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                            <List size={16} className="mr-1" />
                            <span>View App Leads</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Optional: Description or Stats Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 rounded-lg p-4">
                    <div className="text-teal-600 font-semibold">Inbound Leads</div>
                    <div className="text-2xl font-bold text-teal-700">24</div>
                    <div className="text-sm text-teal-600">Active this month</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-orange-600 font-semibold">Outbound Leads</div>
                    <div className="text-2xl font-bold text-orange-700">18</div>
                    <div className="text-sm text-orange-600">Active this month</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-purple-600 font-semibold">App Leads</div>
                    <div className="text-2xl font-bold text-purple-700">32</div>
                    <div className="text-sm text-purple-600">Active this month</div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerOnboardingCompanyLead;