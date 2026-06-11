import React from 'react';

export default function FranchiseeManagerOnboardingGoals() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Franchisee Manager Onboarding Goals</h2>

            {/* Target Progress Bar Cards */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 relative">
                <div className="absolute top-6 right-6 text-right">
                    <p className="text-sm font-medium text-gray-700">App Demo Approval Date: 11/02/2025</p>
                    <p className="text-sm font-bold text-red-500 mt-1">Due Date: 90 Days</p>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-indigo-900 mb-1">Assign company leads: 20</h3>
                    <p className="font-bold text-indigo-600 mb-2">Franchisee onboarded leads: 5</p>

                    <div className="relative pt-1 mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>0</span>
                            <span className="text-red-500 font-bold bg-white px-2 rounded border border-red-200 shadow-sm relative -top-3">10</span>
                            <span>30</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div style={{ width: "25%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-400"></div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Self leads: 10</h3>
                    <p className="font-bold text-indigo-600 mb-2">Franchisee onboarder self leads: 3</p>

                    <div className="relative pt-1 mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>0</span>
                            <span>15</span>
                            <span>23</span>
                            <span>30</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            {/* No progress shown in second bar on screenshot */}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 text-right">
                    <p className="text-sm font-bold text-gray-800">Total Franchisee Target: 30</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">Conversion in(%): 40%</p>
                </div>
            </div>

            <h2 className="text-xl font-semibold text-blue-500 mb-4">Franchisee Summary Table</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-blue-400 text-white text-sm">
                            <th className="px-4 py-3 text-left font-medium border border-blue-300">Franchisee Name</th>
                            <th className="px-4 py-3 text-left font-medium border border-blue-300">Order Payment Receipt</th>
                            <th className="px-4 py-3 text-left font-medium border border-blue-300">Franchisee Onboarding Date</th>
                            <th className="px-4 py-3 text-left font-medium border border-blue-300">Franchisee First Order Due Date</th>
                            <th className="px-4 py-3 text-left font-medium border border-blue-300">Order Status</th>
                            <th className="px-4 py-3 text-left font-medium border border-blue-300">Commission</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {/* Row 1 */}
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-4 text-gray-700">Sharad Savaliya</td>
                            <td className="px-4 py-4">
                                <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-gray-50 hover:file:bg-gray-100 cursor-pointer" />
                            </td>
                            <td className="px-4 py-4 text-gray-700">30/05/2025</td>
                            <td className="px-4 py-4 text-gray-700">30/06/2025</td>
                            <td className="px-4 py-4 text-amber-500 font-medium">Pending</td>
                            <td className="px-4 py-4 text-red-500 font-medium">Not Eligible</td>
                        </tr>
                        {/* Row 2 */}
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-4 text-gray-700">Darshit Ranpara</td>
                            <td className="px-4 py-4">
                                <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-gray-50 hover:file:bg-gray-100 cursor-pointer" />
                            </td>
                            <td className="px-4 py-4 text-gray-700">30/05/2025</td>
                            <td className="px-4 py-4 text-gray-700">30/06/2025</td>
                            <td className="px-4 py-4 text-emerald-500 font-medium">Completed</td>
                            <td className="px-4 py-4 text-emerald-500 font-medium font-semibold">₹2500</td>
                        </tr>
                        {/* Row 3 */}
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-4 text-gray-700">Sushil Piprotar</td>
                            <td className="px-4 py-4">
                                <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-gray-50 hover:file:bg-gray-100 cursor-pointer" />
                            </td>
                            <td className="px-4 py-4 text-gray-700">30/05/2025</td>
                            <td className="px-4 py-4 text-gray-700">30/06/2025</td>
                            <td className="px-4 py-4 text-amber-500 font-medium">Pending</td>
                            <td className="px-4 py-4 text-red-500 font-medium">Not Eligible</td>
                        </tr>
                        {/* Row 4 */}
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-4 text-gray-700">Varis Kadri</td>
                            <td className="px-4 py-4">
                                <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-gray-50 hover:file:bg-gray-100 cursor-pointer" />
                            </td>
                            <td className="px-4 py-4 text-gray-700">30/05/2025</td>
                            <td className="px-4 py-4 text-gray-700">30/06/2025</td>
                            <td className="px-4 py-4 text-emerald-500 font-medium">Completed</td>
                            <td className="px-4 py-4 text-emerald-500 font-medium font-semibold">₹2500</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
