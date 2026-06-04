import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '../../api/candidateApi';
import candidateStore from '../../store/candidateStore';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const candidate = candidateStore((state) => state.candidate);
    const setCandidate = candidateStore((state) => state.setCandidate);
    const testSetting = candidateStore((state) => state.testSetting);
    const setTestSetting = candidateStore((state) => state.setTestSetting);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await candidateApi.getMe();
                if (data.success) {
                    setCandidate(data.candidate);
                    setTestSetting(data.testSetting);
                }
            } catch (error) {
                console.error('Failed to load profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [setCandidate, setTestSetting]);

    const handleStartTest = async () => {
        if (!testSetting) {
            alert('Test settings not configured for this vacancy. Please contact HR.');
            return;
        }
        setActionLoading(true);
        try {
            const { data } = await candidateApi.startTest();
            if (data.success) {
                // Update local candidate with new start time just in case, then navigate
                const updatedCandidate = { ...candidate, testStartedAt: data.testStartedAt };
                setCandidate(updatedCandidate);
                navigate('/candidate-portal/test');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to start test');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSignAgreement = async () => {
        setActionLoading(true);
        try {
            const { data } = await candidateApi.signAgreement();
            if (data.success) {
                setCandidate({ ...candidate, status: data.status, employmentAgreementSigned: true });
                alert('Agreement signed successfully!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to sign agreement');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center">Loading...</div>;
    }

    if (!candidate) {
        return <div className="p-8">Candidate data not available.</div>;
    }

    const { vacancy, status } = candidate;

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Application Tracking Status */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Application Status</h2>
                <div className="flex items-center">
                    <div className={`px-4 py-2 rounded-full font-medium ${status === 'Joined' ? 'bg-green-100 text-green-800' :
                        status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            status === 'Selected' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-blue-100 text-blue-800'
                        }`}>
                        {status}
                    </div>
                </div>
            </div>

            {/* Vacancy Details */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Vacancy Details</h2>
                {vacancy ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm border-b pb-1 text-gray-500">Position Name</p>
                            <p className="font-medium text-gray-800">{vacancy.position}</p>
                        </div>
                        <div>
                            <p className="text-sm border-b pb-1 text-gray-500">Job Type</p>
                            <p className="font-medium text-gray-800 capitalize">{vacancy.jobType}</p>
                        </div>
                        <div>
                            <p className="text-sm border-b pb-1 text-gray-500">Salary</p>
                            <p className="font-medium text-gray-800">{vacancy.salary || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm border-b pb-1 text-gray-500">Official Joining Date</p>
                            <p className="font-medium text-gray-800">
                                {vacancy.joiningDate ? new Date(vacancy.joiningDate).toLocaleDateString() : 'TBD'}
                            </p>
                        </div>
                        <div className="md:col-span-2 mt-4">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Detailed Job Description</p>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-[400px] overflow-y-auto shadow-inner">
                                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {vacancy.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-red-500">Vacancy details not found.</p>
                )}
            </div>

            {/* Action Area based on Status */}
            {status === 'Applied' && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Candidate Test</h3>
                    <p className="text-gray-600 mb-4">
                        You will be given {testSetting ? testSetting.duration : '___'} minutes to complete the test and select your preferred joining date at the end of the test.
                    </p>
                    <button
                        onClick={handleStartTest}
                        disabled={actionLoading}
                        className={`bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 transition ${actionLoading ? 'opacity-50' : ''}`}
                    >
                        {actionLoading ? 'Starting...' : 'Start Test'}
                    </button>
                </div>
            )}

            {status === 'Test Completed' && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Completed</h3>
                    <p className="text-gray-600 mb-4">You have successfully submitted your test. Please complete your application to proceed.</p>
                    <button
                        onClick={() => navigate('/candidate-portal/complete-application')}
                        className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition"
                    >
                        Complete Application
                    </button>
                </div>
            )}

            {status === 'Selected' && !candidate.employmentAgreementSigned && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 border-2">
                    <h3 className="text-lg font-semibold text-green-800 mb-2 whitespace-pre-wrap">Employment Agreement</h3>
                    <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 h-48 overflow-y-auto mb-4 border">
                        <p className="font-bold mb-2">EMPLOYMENT AGREEMENT</p>
                        <p>This is a standard employment agreement. By signing below, you agree to the terms of your employment for the position of {vacancy?.position || 'the specified role'} starting on your confirmed joining date.</p>
                        {/* Could be dynamically loaded if needed */}
                    </div>

                    <button
                        onClick={handleSignAgreement}
                        disabled={actionLoading}
                        className={`bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition ${actionLoading ? 'opacity-50' : ''}`}
                    >
                        {actionLoading ? 'Signing...' : 'Sign Employment Agreement'}
                    </button>
                </div>
            )}

            {status === 'Under Review' && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                    <p className="text-gray-700">Your application is currently under review by our HR team. We will notify you of any updates.</p>
                </div>
            )}

            {status === 'Joined' && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <p className="text-green-800 font-medium">Congratulations! You have accepted the offer and are confirmed to join our team.</p>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
