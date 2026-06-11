import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '../../api/candidateApi';
import candidateStore from '../../store/candidateStore';

const Test = () => {
    const navigate = useNavigate();
    const candidate = candidateStore((state) => state.candidate);
    const setCandidate = candidateStore((state) => state.setCandidate);
    const testSetting = candidateStore((state) => state.testSetting);

    const [timeLeft, setTimeLeft] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (questionId, option) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    useEffect(() => {
        if (!candidate || candidate.status !== 'Applied' || !candidate.testStartedAt) {
            navigate('/candidate-portal/dashboard');
            return;
        }

        if (!testSetting || !testSetting.duration) {
            alert("Test configuration missing duration. Please contact admin.");
            navigate('/candidate-portal/dashboard');
            return;
        }

        const durationMs = testSetting.duration * 60 * 1000;
        const startTime = new Date(candidate.testStartedAt).getTime();
        const endTime = startTime + durationMs;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = endTime - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                handleAutoSubmit();
            } else {
                setTimeLeft(difference);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [candidate, testSetting, navigate]);

    const handleAutoSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const { data } = await candidateApi.submitTest({ answers });
            if (data.success) {
                setCandidate({ ...candidate, status: data.status, testCompletedAt: new Date() });
                alert('Test submitted automatically as time expired.');
                navigate('/candidate-portal/complete-application');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit test automatically');
            navigate('/candidate-portal/dashboard');
        }
    };

    const ManualSubmit = async () => {
        if (submitting) return;
        if (!window.confirm("Are you sure you want to submit your test early?")) return;

        setSubmitting(true);
        try {
            const { data } = await candidateApi.submitTest({ answers });
            if (data.success) {
                setCandidate({ ...candidate, status: data.status, testCompletedAt: new Date() });
                // Re-fetch profile just in case, or just rely on state update
                navigate('/candidate-portal/complete-application');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit test');
            setSubmitting(false);
        }
    }

    const formatTime = (ms) => {
        if (ms === null) return 'Calculating...';
        if (ms <= 0) return '00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center border-b-4 border-indigo-500">
                <h2 className="text-xl font-bold text-gray-800">Candidate Assessment</h2>
                <div className="text-2xl font-mono bg-gray-100 px-4 py-2 rounded text-red-600 font-bold">
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-8 min-h-[400px]">
                <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">Please answer the following questions:</h3>

                {testSetting?.questions && testSetting.questions.length > 0 ? (
                    <div className="space-y-8">
                        {testSetting.questions.map((question, index) => (
                            <div key={question._id || index} className="p-6 bg-gray-50 border border-gray-100 rounded-lg">
                                <div className="flex gap-4 mb-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                        {index + 1}
                                    </span>
                                    <h4 className="text-lg font-medium text-gray-800 pt-1">{question.text}</h4>
                                </div>

                                {question.options && question.options.length > 0 && (
                                    <div className="ml-12 space-y-3">
                                        {question.options.map((option, optIdx) => (
                                            <label
                                                key={optIdx}
                                                className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${answers[question._id] === option ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                <input
                                                    type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                                                    name={`question-${question._id}`}
                                                    value={option}
                                                    checked={
                                                        question.type === 'multiple'
                                                            ? (answers[question._id] || []).includes(option)
                                                            : answers[question._id] === option
                                                    }
                                                    onChange={() => {
                                                        if (question.type === 'multiple') {
                                                            const currentAnswers = answers[question._id] || [];
                                                            if (currentAnswers.includes(option)) {
                                                                handleAnswerChange(question._id, currentAnswers.filter(a => a !== option));
                                                            } else {
                                                                handleAnswerChange(question._id, [...currentAnswers, option]);
                                                            }
                                                        } else {
                                                            handleAnswerChange(question._id, option);
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <span className="ml-3 text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'text' && (
                                    <div className="ml-12 mt-3">
                                        <textarea
                                            rows="4"
                                            placeholder="Write your answer here..."
                                            value={answers[question._id] || ''}
                                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="prose max-w-none text-gray-600">
                        <p>No questions have been configured for this test yet.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={ManualSubmit}
                    disabled={submitting}
                    className={`px-8 py-3 bg-indigo-600 text-white font-medium rounded shadow hover:bg-indigo-700 transition ${submitting ? 'opacity-50' : ''}`}
                >
                    {submitting ? 'Submitting...' : 'Complete & Submit Test'}
                </button>
            </div>

        </div>
    );
};

export default Test;
