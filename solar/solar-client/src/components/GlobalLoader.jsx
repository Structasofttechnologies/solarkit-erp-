import React from 'react';
import useLoaderStore from '../store/loaderStore';

const GlobalLoader = () => {
    const activeRequests = useLoaderStore((state) => state.activeRequests);

    if (activeRequests === 0) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-in-up">
                {/* Modern Spinner */}
                <div className="relative flex justify-center items-center">
                    <div className="absolute animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
                    <div className="absolute animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 animation-delay-500"></div>
                </div>
                <p className="mt-8 text-slate-700 font-semibold tracking-wide animate-pulse">
                    Please Wait...
                </p>
                <p className="mt-1 text-slate-500 text-xs">
                    Processing your request
                </p>
            </div>
        </div>
    );
};

export default GlobalLoader;
