import React from 'react';
import { Link } from 'react-router-dom';
import { Users, User, CheckCircle, ChevronRight } from 'lucide-react';

const FranchiseeManagerOnboardingLeads = () => {
    return (
        <div className="container mx-auto px-4 py-6">
            {/* Page Header with Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center text-sm text-gray-600">
                    <Link
                        to="/frenchiseManager/frenchiseManagerOnboarding_leads"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                        Leads
                    </Link>
                    <ChevronRight size={16} className="mx-2 text-gray-400" />
                    <span className="text-gray-500">Onboarding</span>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
                    {/* Company Lead Card */}
                    <Link
                        to="/frenchiseManager/frenchiseManager_onboardingCompanylead"
                        className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    >
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-8 h-48 flex flex-col items-center justify-center group">
                            <Users size={48} className="mb-4 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-xl font-bold text-center">Company Lead</span>
                        </div>
                    </Link>

                    {/* My Lead Card */}
                    <Link
                        to="/frenchiseManager/frenchiseManager_table"
                        className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    >
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-8 h-48 flex flex-col items-center justify-center group">
                            <User size={48} className="mb-4 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-xl font-bold text-center">My Lead</span>
                        </div>
                    </Link>

                    {/* Franchisee Qualified Card */}
                    <Link
                        to="/frenchiseManager/frenchiseManagerqualify_table"
                        className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    >
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-8 h-48 flex flex-col items-center justify-center group">
                            <CheckCircle size={48} className="mb-4 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-xl font-bold text-center">Franchisee Qualified</span>
                        </div>
                    </Link>
                </div>

                {/* Optional: Description Section */}
                <div className="mt-12 text-center text-gray-600">
                    <p className="text-sm">
                        Select a category to manage your leads and track franchisee onboarding progress
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerOnboardingLeads;