import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { authAPI } from '../../api/api';
import authStore from '../../store/authStore';
import toast from 'react-hot-toast';

const EmployeeLogin = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setUser = authStore((state) => state.setUser);
    const setToken = authStore((state) => state.setToken);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginId || !password) {
            return toast.error("Please enter your Login ID and Password");
        }

        setLoading(true);

        try {
            const response = await authAPI.login({
                email: loginId,
                password
            });
            const { user, token } = response.data;
            setToken(token);
            setUser(user);

            // Navigate based on role & training
            if (user.role === 'employee') {
                if (!user.trainingCompleted) {
                    navigate('/employee/training');
                } else {
                    navigate('/employee/dashboard');
                }
            } else {
                toast.error("This portal is restricted to Employees only.");
                // clear auth maybe? For now let them error out on their routes or bounce back
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                        Employee Portal
                    </h1>
                    <p className="text-slate-500">
                        Sign in with your registered mobile number or email
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Login ID Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Mobile Number / Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={20} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50 focus:bg-white text-slate-900"
                                    placeholder="Enter mobile or email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50 focus:bg-white text-slate-900"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition transform ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition"
                        >
                            ← Back to Main Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
