import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, User } from 'lucide-react';

const DealerManagerOnboardingLeads = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Page Header with Breadcrumb */}
                <div className="mb-6">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link
                                    to="#"
                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                                    </svg>
                                    Leads
                                </Link>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Lead Navigation Buttons */}
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                        {/* Company Lead Button */}
                        <Link
                            to="/dealer-manager/onboarding/company-lead"
                            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative p-8 text-center">
                                <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300 mb-2">
                                    Company Lead
                                </h3>
                                <p className="text-gray-600 group-hover:text-blue-100 transition-colors duration-300">
                                    View and manage company-wide leads
                                </p>
                                <div className="mt-6">
                                    <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-white group-hover:text-blue-600 transition-colors duration-300 font-semibold">
                                        Access Dashboard
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* My Lead Button */}
                        <Link
                            to="/dealer-manager/onboarding/my-lead"
                            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative p-8 text-center">
                                <User className="w-16 h-16 mx-auto mb-4 text-green-600 group-hover:text-white transition-colors duration-300" />
                                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300 mb-2">
                                    My Lead
                                </h3>
                                <p className="text-gray-600 group-hover:text-green-100 transition-colors duration-300">
                                    View and manage your personal leads
                                </p>
                                <div className="mt-6">
                                    <span className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg group-hover:bg-white group-hover:text-green-600 transition-colors duration-300 font-semibold">
                                        Access Dashboard
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealerManagerOnboardingLeads;