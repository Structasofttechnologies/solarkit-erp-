import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, Shield, Award, AlertCircle } from 'lucide-react';
import { getMyTraining, completeTraining } from '../../services/employee/trainingApi';
import authStore from '../../store/authStore';
import toast from 'react-hot-toast';

const OnboardingTraining = () => {
    const navigate = useNavigate();
    const { user, setUser } = authStore();
    const [training, setTraining] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [watchedVideos, setWatchedVideos] = useState(new Set());

    useEffect(() => {
        fetchTraining();
    }, []);

    const fetchTraining = async () => {
        try {
            setIsLoading(true);
            const res = await getMyTraining();
            if (res.data) {
                setTraining(res.data);
            } else {
                toast("No specific training assigned. You can proceed to the dashboard.", { icon: 'ℹ️' });
                // If no training, they can just "complete" it easily or we allow bypassing
            }
        } catch (error) {
            toast.error(error.message || "Failed to load training materials");
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        // Enforce watching all videos if training exists
        if (training) {
            let totalVideos = 0;
            training.sections.forEach(section => {
                totalVideos += section.videos.length;
            });
            if (watchedVideos.size < totalVideos) {
                toast.error("Please watch all training videos before completing.");
                return;
            }
        }

        try {
            setIsCompleting(true);
            await completeTraining();
            toast.success("Training completed! Welcome to the ERP.");

            // Update local user state
            setUser({ ...user, trainingCompleted: true });

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || "Failed to complete training");
        } finally {
            setIsCompleting(false);
        }
    };

    const markVideoWatched = (videoId) => {
        setWatchedVideos(prev => {
            const next = new Set(prev);
            next.add(videoId);
            return next;
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading Onboarding Training...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center text-white mr-3 shadow-md">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Solarkits ERP Onboarding</h1>
                            <p className="text-xs text-gray-500 font-medium">Required Training Orientation</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">Welcome to the Team, {user?.name}!</h2>
                    <p className="text-gray-600 text-lg">Before you get started with the ERP system, please complete your mandatory onboarding training below.</p>
                </div>

                {!training ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                        <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Training Assigned</h3>
                        <p className="text-gray-600 mb-6">It looks like there are no specific training modules assigned to your department right now. You can proceed directly to the ERP dashboard.</p>
                        <button
                            onClick={handleComplete}
                            disabled={isCompleting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                        >
                            {isCompleting ? 'Processing...' : 'Proceed to Dashboard'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {training.sections.map((section, sIndex) => (
                            <div key={`section-${sIndex}`} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                        <PlayCircle className="w-5 h-5 text-blue-600 mr-2" />
                                        {section.name || section.category}
                                    </h3>
                                </div>
                                <div className="p-6">
                                    {section.videos.length === 0 ? (
                                        <p className="text-gray-500 italic text-sm">No videos in this section.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {section.videos.map((vid, vIndex) => {
                                                const vidId = `${sIndex}-${vIndex}`;
                                                const isWatched = watchedVideos.has(vidId);
                                                return (
                                                    <div key={vidId} className={`border rounded-xl p-4 flex flex-col transition-colors ${isWatched ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                                            {vid.type === 'youtube' && vid.url ? (
                                                                <iframe
                                                                    className="w-full h-full"
                                                                    src={`https://www.youtube.com/embed/${vid.url.split('v=')[1] || vid.url.split('/').pop()}`}
                                                                    title="Training Video"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                ></iframe>
                                                            ) : vid.type === 'upload' && vid.url ? (
                                                                <video controls className="w-full h-full" onEnded={() => markVideoWatched(vidId)}>
                                                                    <source src={vid.url} type="video/mp4" />
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            ) : (
                                                                <PlayCircle className="w-10 h-10 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div className="mt-auto flex justify-between items-center">
                                                            <span className="text-sm font-semibold text-gray-700 truncate max-w-[70%]">Video {vIndex + 1}</span>
                                                            <button
                                                                onClick={() => markVideoWatched(vidId)}
                                                                className={`px-3 py-1 text-xs font-bold rounded-full border transition ${isWatched ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {isWatched ? 'Watched' : 'Mark Watched'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 shadow-xl text-center text-white mt-12 mb-8">
                            <Award className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
                            <p className="text-blue-100 mb-6 max-w-lg mx-auto">Once you have completed all mandatory training videos, you can finalize your onboarding and access the system.</p>
                            <button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center mx-auto"
                            >
                                {isCompleting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Complete Onboarding
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OnboardingTraining;
