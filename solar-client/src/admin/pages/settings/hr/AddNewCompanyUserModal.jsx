import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Target, Calendar, Plus, Users, FileText, IndianRupee, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../api/axios.js';

export default function AddNewCompanyUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    district: '',
    partnerGoalsEnabled: false,
    partnerMonthlyTargetKw: '',
    partnerPerKwCommission: '',
    partnerQuoteCreate: true,
    partnerQuoteEdit: false,
    partnerQuoteDelete: false,
    projectGoalEnabled: false,
    projectMonthlyTargetKw: '',
    projectPerKwCommission: '',
  });

  const [partnerTypeForm, setPartnerTypeForm] = useState({ type: '', count: '', deadline: '' });
  const [addedPartnerTypes, setAddedPartnerTypes] = useState([]);

  const [projectTypeForm, setProjectTypeForm] = useState({ type: '', count: '', deadline: '' });
  const [addedProjectTypes, setAddedProjectTypes] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddPartnerType = () => {
    if (!partnerTypeForm.type || !partnerTypeForm.count || !partnerTypeForm.deadline) return;
    setAddedPartnerTypes(prev => [...prev, { ...partnerTypeForm, id: Date.now() }]);
    setPartnerTypeForm({ type: '', count: '', deadline: '' });
  };

  const handleRemovePartnerType = (id) => {
    setAddedPartnerTypes(prev => prev.filter(pt => pt.id !== id));
  };

  const handleAddProjectType = () => {
    if (!projectTypeForm.type || !projectTypeForm.count || !projectTypeForm.deadline) return;
    setAddedProjectTypes(prev => [...prev, { ...projectTypeForm, id: Date.now() }]);
    setProjectTypeForm({ type: '', count: '', deadline: '' });
  };

  const handleRemoveProjectType = (id) => {
    setAddedProjectTypes(prev => prev.filter(pt => pt.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName.trim() || !formData.mobileNumber.trim() || !formData.emailAddress.trim() || !formData.district.trim()) {
      toast.error('Please fill all required fields.');
      return;
    }

    if (formData.mobileNumber.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        district: formData.district.trim(),

        // Partner Goals
        partnerGoalsEnabled: formData.partnerGoalsEnabled,
        partnerMonthlyTargetKw: formData.partnerGoalsEnabled ? Number(formData.partnerMonthlyTargetKw) || 0 : 0,
        partnerPerKwCommission: formData.partnerGoalsEnabled ? Number(formData.partnerPerKwCommission) || 0 : 0,
        partnerQuotePermissions: {
          create: formData.partnerQuoteCreate,
          edit: formData.partnerQuoteEdit,
          delete: formData.partnerQuoteDelete,
        },
        partnerTypes: addedPartnerTypes.map(({ type, count, deadline }) => ({ type, count: Number(count), deadline })),

        // Project Goals
        projectGoalEnabled: formData.projectGoalEnabled,
        projectMonthlyTargetKw: formData.projectGoalEnabled ? Number(formData.projectMonthlyTargetKw) || 0 : 0,
        projectPerKwCommission: formData.projectGoalEnabled ? Number(formData.projectPerKwCommission) || 0 : 0,
        projectTypes: addedProjectTypes.map(({ type, count, deadline }) => ({ type, count: Number(count), deadline })),
      };

      const response = await api.post('/company-users', payload);

      if (response.data.success) {
        toast.success('Company user created successfully! 🎉\nLogin password = Mobile Number');
        if (onSuccess) onSuccess(response.data.data);
        onClose();
        // Reset form
        setFormData({
          fullName: '', mobileNumber: '', emailAddress: '', district: '',
          partnerGoalsEnabled: false, partnerMonthlyTargetKw: '', partnerPerKwCommission: '',
          partnerQuoteCreate: true, partnerQuoteEdit: false, partnerQuoteDelete: false,
          projectGoalEnabled: false, projectMonthlyTargetKw: '', projectPerKwCommission: '',
        });
        setAddedPartnerTypes([]);
        setAddedProjectTypes([]);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create company user. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Fixed Header */}
        <div className="bg-[#2e7d32] p-6 text-white shrink-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">Add New Company User</h2>
            <p className="text-[#a5d6a7] text-sm">Create a new Company user with specific permissions</p>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors focus:outline-none disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="text-[#2e7d32] font-bold text-lg mb-4">Personal Information</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={16} className="text-gray-400" />
                </div>
                <input 
                  type="tel" 
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] outline-none transition-all"
                  required
                />
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">ℹ️ User will log in to the mobile app using this mobile number — no password needed.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input 
                  type="email" 
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">District *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={16} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Enter district name"
                  className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Partner Goals */}
          <div className="bg-white rounded-xl border border-[#e8f5e9] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="text-[#2e7d32]" size={20} />
                <h3 className="text-[#2e7d32] font-bold text-lg">Partner Goals</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="partnerGoalsEnabled"
                  checked={formData.partnerGoalsEnabled}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4caf50]"></div>
              </label>
            </div>

            {formData.partnerGoalsEnabled && (
              <div className="pt-4 border-t border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Target KW *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">⚡</span>
                      </div>
                      <input 
                        type="number"
                        name="partnerMonthlyTargetKw"
                        value={formData.partnerMonthlyTargetKw}
                        onChange={handleInputChange}
                        className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Per KW Commission *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="number"
                        name="partnerPerKwCommission"
                        value={formData.partnerPerKwCommission}
                        onChange={handleInputChange}
                        className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Partners Types Can Create *</label>
                  <div className="flex gap-3">
                    <select 
                      className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none bg-white text-gray-700"
                      value={partnerTypeForm.type}
                      onChange={(e) => setPartnerTypeForm({...partnerTypeForm, type: e.target.value})}
                    >
                      <option value="">Select Partner</option>
                      <option value="Channel Partner">Channel Partner</option>
                      <option value="Dealer Partner">Dealer Partner</option>
                    </select>
                    <div className="relative w-28">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="number"
                        placeholder="Qty"
                        value={partnerTypeForm.count}
                        onChange={(e) => setPartnerTypeForm({...partnerTypeForm, count: e.target.value})}
                        className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-[#4caf50]" />
                    </div>
                    <input 
                      type="date"
                      value={partnerTypeForm.deadline}
                      onChange={(e) => setPartnerTypeForm({...partnerTypeForm, deadline: e.target.value})}
                      className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none text-gray-500"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddPartnerType}
                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg transition-colors"
                  >
                    <Plus size={18} /> Add Partner Type
                  </button>
                  
                  {addedPartnerTypes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Added Partner Types:</p>
                      <div className="space-y-2">
                        {addedPartnerTypes.map(pt => (
                          <div key={pt.id} className="flex justify-between items-center bg-[#e8f5e9] p-3 rounded-lg border border-[#c8e6c9]">
                            <div>
                              <p className="text-sm font-bold text-[#2e7d32]">{pt.type}</p>
                              <p className="text-xs text-[#4caf50]">Target: {pt.count} Users | Deadline: {pt.deadline}</p>
                            </div>
                            <button type="button" onClick={() => handleRemovePartnerType(pt.id)} className="text-[#2e7d32] hover:bg-[#c8e6c9] p-1 rounded-full">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-[#2e7d32]" size={18} />
                    <h4 className="text-[#2e7d32] font-bold">Quote Permissions</h4>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="partnerQuoteCreate"
                        checked={formData.partnerQuoteCreate}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#4caf50] focus:ring-[#4caf50]" 
                      />
                      <span className="text-sm font-semibold text-gray-700">Quote Create</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="partnerQuoteEdit"
                        checked={formData.partnerQuoteEdit}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#4caf50] focus:ring-[#4caf50]" 
                      />
                      <span className="text-sm font-semibold text-gray-700">Quote Edit</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="partnerQuoteDelete"
                        checked={formData.partnerQuoteDelete}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#4caf50] focus:ring-[#4caf50]" 
                      />
                      <span className="text-sm font-semibold text-gray-700">Quote Delete</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Goal */}
          <div className="bg-white rounded-xl border border-[#e8f5e9] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#2e7d32]">💼</span>
                <h3 className="text-[#2e7d32] font-bold text-lg">Project Goal</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="projectGoalEnabled"
                  checked={formData.projectGoalEnabled}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4caf50]"></div>
              </label>
            </div>

            {formData.projectGoalEnabled && (
              <div className="pt-4 border-t border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Target KW *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">⚡</span>
                      </div>
                      <input 
                        type="number"
                        name="projectMonthlyTargetKw"
                        value={formData.projectMonthlyTargetKw}
                        onChange={handleInputChange}
                        className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Per KW Commission *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="number"
                        name="projectPerKwCommission"
                        value={formData.projectPerKwCommission}
                        onChange={handleInputChange}
                        className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Select Project Type *</label>
                  <div className="flex gap-3">
                    <select 
                      className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none bg-white text-gray-700"
                      value={projectTypeForm.type}
                      onChange={(e) => setProjectTypeForm({...projectTypeForm, type: e.target.value})}
                    >
                      <option value="">Select Project</option>
                      <option value="Residential 3 to 10 kw">Residential 3 to 10 kw</option>
                      <option value="Commercial 10 to 50 kw">Commercial 10 to 50 kw</option>
                    </select>
                    <div className="relative w-28">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="number"
                        placeholder="Qty"
                        value={projectTypeForm.count}
                        onChange={(e) => setProjectTypeForm({...projectTypeForm, count: e.target.value})}
                        className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-[#4caf50]" />
                    </div>
                    <input 
                      type="date"
                      value={projectTypeForm.deadline}
                      onChange={(e) => setProjectTypeForm({...projectTypeForm, deadline: e.target.value})}
                      className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#2e7d32] outline-none text-gray-500"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddProjectType}
                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg transition-colors"
                  >
                    <Plus size={18} /> Add Project Type
                  </button>
                  
                  {addedProjectTypes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Added Project Types:</p>
                      <div className="space-y-2">
                        {addedProjectTypes.map(pt => (
                          <div key={pt.id} className="flex justify-between items-center bg-[#e8f5e9] p-3 rounded-lg border border-[#c8e6c9]">
                            <div>
                              <p className="text-sm font-bold text-[#2e7d32]">{pt.type}</p>
                              <p className="text-xs text-[#4caf50]">Goal: {pt.count} Quotes | Deadline: {pt.deadline}</p>
                            </div>
                            <button type="button" onClick={() => handleRemoveProjectType(pt.id)} className="text-[#2e7d32] hover:bg-[#c8e6c9] p-1 rounded-full">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 italic mt-2">Note: These goals are in addition to partner goals</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="bg-[#e3f2fd] border border-[#90caf9] text-[#1565c0] p-4 rounded-xl flex gap-3 items-start">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">
              📱 The company user can log in to the mobile app using <strong>only their mobile number</strong> — no password required.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#43a047] hover:bg-[#388e3c] disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-xl font-bold text-lg shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating...
              </>
            ) : (
              'Create Company User'
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
