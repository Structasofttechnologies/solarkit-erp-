'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api.js';
import authStore from '../store/authStore.js';
import { Mail, Lock, Eye, EyeOff, Shield, Building2, Store } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPartnerSelect, setShowPartnerSelect] = useState(false);
  const [showManagerSelect, setShowManagerSelect] = useState(false);

  const setUser = authStore((state) => state.setUser);
  const setToken = authStore((state) => state.setToken);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      setToken(response.data.token);
      setUser(response.data.user);

      if (response.data.user.role === 'admin') {
        navigate('/dashboard');
      } else if (response.data.user.role === 'dealer') {
        navigate('/dealer/dashboard');
      } else if (response.data.user.role === 'franchisee') {
        navigate('/franchisee/dashboard');
      } else if (response.data.user.role === 'dealerManager') {
        navigate('/dealer-manager/dashboard');
      } else if (response.data.user.role === 'franchiseeManager') {
        navigate('/franchisee-manager/dashboard');
      } else if (response.data.user.role === 'accountManager') {
        navigate('/account-manager/dashboard');
      } else if (response.data.user.role === 'deliveryManager') {
        navigate('/delivery-manager/dashboard');
      } else if (response.data.user.role === 'employee') {
        if (!response.data.user.trainingCompleted) {
          navigate('/employee/training');
        } else {
          navigate('/dashboard'); // Assuming employee goes to main dashboard or a specific one based on dynamic role later
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      // FIX: Prevent page refresh and show error properly
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      setLoading(false); // Stop loading on error
      // Don't throw or reload the page
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 p-6">
      {/* Main container with proper spacing */}
      <div className="w-full max-w-md mx-auto">
        {/* Card with top and bottom spacing */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200 my-10">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              SOLARKITS
            </h1>
            <p className="text-slate-600 mt-2">A Solar Marketplace Platform</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              {/* Email/Mobile Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address / Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter email or mobile number"
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
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
            <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-700 p-1 rounded mr-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              Demo Credentials (Click to auto-fill)
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleDemoLogin('admin@solarkits.com', '123456')}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-red-50 rounded-lg border border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield size={16} className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 group-hover:text-red-700">Admin</p>
                    <p className="text-xs text-slate-500">admin@solarkits.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-red-600">Click to use</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPartnerSelect(true)}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-emerald-50 rounded-lg border border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <Store size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 group-hover:text-emerald-700">Partner</p>
                    <p className="text-[10px] text-slate-400 mb-0.5">(e.g., Franchise, Dealer)</p>
                    <p className="text-xs text-slate-500">Click to choose role</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-600">Click to select</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManagerSelect(true)}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield size={16} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 group-hover:text-blue-700">Partner Manager</p>
                    <p className="text-[10px] text-slate-400 mb-0.5">(e.g., Franchise Mgr, Dealer Mgr)</p>
                    <p className="text-xs text-slate-500">Click to choose role</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600">Click to select</span>
              </button>

              <button
                onClick={() => handleDemoLogin('accountmanager@solarkits.com', 'password123')}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-purple-50 rounded-lg border border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Building2 size={16} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 group-hover:text-purple-700">Account Manager</p>
                    <p className="text-xs text-slate-500">accountmanager@solarkits.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-purple-600">Click to use</span>
              </button>

              <button
                onClick={() => handleDemoLogin('deliverymanager@solarkits.com', 'password123')}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-orange-50 rounded-lg border border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Store size={16} className="text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 group-hover:text-orange-700">Delivery Manager</p>
                    <p className="text-xs text-slate-500">deliverymanager@solarkits.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-orange-600">Click to use</span>
              </button>
            </div>
          </div>

          {/* Alternative Portals */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
              Other Portals
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Employee Portal Link */}
              <button
                type="button"
                onClick={() => navigate('/employee-login')}
                className="w-full flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-all duration-200 group text-center"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:shadow text-emerald-600">
                  <Shield size={20} />
                </div>
                <p className="font-semibold text-emerald-800 text-sm">Employee</p>
                <p className="text-xs text-emerald-600/70 mt-0.5">Login</p>
              </button>

              {/* Candidate Portal Link */}
              <button
                type="button"
                onClick={() => navigate('/candidate-login')}
                className="w-full flex flex-col items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-all duration-200 group text-center"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:shadow text-indigo-600">
                  <Store size={20} />
                </div>
                <p className="font-semibold text-indigo-800 text-sm">Candidate</p>
                <p className="text-xs text-indigo-600/70 mt-0.5">Portal</p>
              </button>
            </div>
          </div>

          {/* All Login IDs Reference */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">
              Available Test Login IDs
            </h3>
            <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong className="text-slate-700">Admin:</strong> admin@solarkits.com</div>
              <div><strong className="text-slate-700">Dealer:</strong> dealer@solarkits.com</div>
              <div><strong className="text-slate-700">Franchise:</strong> franchise@solarkits.com</div>
              <div><strong className="text-slate-700">Dealer Mgr:</strong> dealermanager@solarkits.com</div>
              <div><strong className="text-slate-700">Franchise Mgr:</strong> franchisemanager@example.com</div>
              <div><strong className="text-slate-700">Account Mgr:</strong> accountmanager@solarkits.com</div>
              <div><strong className="text-slate-700">Delivery Mgr:</strong> deliverymanager@solarkits.com</div>
              <div className="md:col-span-2 text-center mt-2 pt-2 border-t border-slate-200 italic">
                (Passwords are usually '123456' or 'password123')
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © 2024 SOLARKITS ERP System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Partner Selection Modal */}
      {showPartnerSelect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">Select Login Type</h3>
              <button 
                onClick={() => setShowPartnerSelect(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleDemoLogin('franchise@solarkits.com', '123456');
                  setShowPartnerSelect(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm text-blue-600">
                    <Building2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-blue-800">Franchise Login</p>
                    <p className="text-xs text-blue-600/70">franchise@solarkits.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-700 bg-white px-2 py-1 rounded">Select</span>
              </button>

              <button
                onClick={() => {
                  handleDemoLogin('dealer@solarkits.com', '123456');
                  setShowPartnerSelect(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm text-emerald-600">
                    <Store size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-emerald-800">Dealer Login</p>
                    <p className="text-xs text-emerald-600/70">dealer@solarkits.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-white px-2 py-1 rounded">Select</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Selection Modal */}
      {showManagerSelect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">Select Manager Type</h3>
              <button 
                onClick={() => setShowManagerSelect(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleDemoLogin('franchisemanager@example.com', 'password123');
                  setShowManagerSelect(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm text-indigo-600">
                    <Building2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-indigo-800">Franchise Manager</p>
                    <p className="text-xs text-indigo-600/70">franchisemanager@example.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-indigo-700 bg-white px-2 py-1 rounded">Select</span>
              </button>

              <button
                onClick={() => {
                  handleDemoLogin('dealermanager@solarkits.com', 'password123');
                  setShowManagerSelect(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm text-teal-600">
                    <Store size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-teal-800">Dealer Manager</p>
                    <p className="text-xs text-teal-600/70">dealermanager@solarkits.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-teal-700 bg-white px-2 py-1 rounded">Select</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}