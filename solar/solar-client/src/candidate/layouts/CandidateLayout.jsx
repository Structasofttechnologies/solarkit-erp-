import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import candidateStore from '../../store/candidateStore';

const CandidateLayout = () => {
    const navigate = useNavigate();
    const logoutCandidate = candidateStore((state) => state.logoutCandidate);
    const candidate = candidateStore((state) => state.candidate);
    const candidateToken = candidateStore((state) => state.candidateToken);

    useEffect(() => {
        if (!candidateToken) {
            navigate('/candidate-login');
        }
    }, [candidateToken, navigate]);

    const handleLogout = () => {
        logoutCandidate();
        navigate('/candidate-login');
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top bar */}
                <header className="bg-white shadow relative z-20 flex h-16 items-center px-4 md:px-6 justify-between border-b">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">Candidate Portal</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 hidden md:block">Welcome, {candidate?.name || 'Candidate'}</span>
                        <button
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-600 font-medium cursor-pointer flex gap-2 items-center"
                        >
                            Sign out
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 relative p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CandidateLayout;
