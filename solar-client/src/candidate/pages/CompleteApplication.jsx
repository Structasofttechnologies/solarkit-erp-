import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '../../api/candidateApi';
import candidateStore from '../../store/candidateStore';
import { Briefcase, FileText, CheckCircle } from 'lucide-react';

const CompleteApplication = () => {
    const navigate = useNavigate();
    const candidate = candidateStore((state) => state.candidate);
    const setCandidate = candidateStore((state) => state.setCandidate);

    const [preferredJoiningDate, setPreferredJoiningDate] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if eligible
        if (!candidate || candidate.status !== 'Test Completed') {
            navigate('/candidate-portal/dashboard');
        }
    }, [candidate, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!preferredJoiningDate) {
            setError("Please select a preferred joining date.");
            return;
        }
        if (!agreedToTerms) {
            setError("You must agree to the terms.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await candidateApi.submitApplication({ preferredJoiningDate, agreedToTerms });
            if (data.success) {
                setCandidate({
                    ...candidate,
                    status: data.status,
                    preferredJoiningDate,
                    agreedToTerms
                });
                alert('Application submitted successfully!');
                navigate('/candidate-portal/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const officialDate = candidate?.vacancy?.joiningDate
        ? new Date(candidate.vacancy.joiningDate).toISOString().split('T')[0]
        : '';

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Application</h2>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Preferred Date of Joining <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        value={preferredJoiningDate}
                        max={officialDate}
                        onChange={(e) => setPreferredJoiningDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                    {officialDate && (
                        <p className="text-sm text-gray-500 mt-1">
                            Must be on or before the official joining date: {new Date(officialDate).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-bold text-gray-800 tracking-tight">Job Role & Responsibilities</h4>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 max-h-[600px] overflow-y-auto text-base text-gray-700 leading-relaxed shadow-inner border-l-8 border-l-indigo-500">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 border-b-2 border-indigo-50 pb-4">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                            <span className="font-extrabold uppercase tracking-widest text-sm">Full Job Description & Responsibilities</span>
                        </div>

                        <div className="prose prose-indigo max-w-none">
                            <p className="whitespace-pre-line mb-8 text-gray-700 font-medium text-lg leading-relaxed">
                                {candidate?.vacancy?.description || "No description provided."}
                            </p>

                            {candidate?.vacancy?.responsibilities && (
                                <div className="mt-10 pt-8 border-t-2 border-indigo-50">
                                    <h5 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                                        Key Responsibilities:
                                    </h5>
                                    <div className="text-gray-600 whitespace-pre-line pl-6 border-l-4 border-indigo-100 italic bg-indigo-50/30 p-4 rounded-r-xl">
                                        {candidate?.vacancy?.responsibilities}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-lg">
                        <label className="flex items-start space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 h-5 w-5 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500 transition-all cursor-pointer"
                                required
                            />
                            <span className="text-sm text-gray-700 group-hover:text-indigo-900 transition-colors">
                                I confirm that I have read the complete job description above and I am willing to join on the selected date if selected.
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-indigo-600 text-white font-medium py-3 rounded hover:bg-indigo-700 transition ${loading ? 'opacity-50' : ''}`}
                >
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </form>
        </div>
    );
};

export default CompleteApplication;
