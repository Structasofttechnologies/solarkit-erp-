import React, { useState, useEffect } from 'react';
import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  BarChart3,
  Clock,
  Loader,
  Save,
  X,
  Users
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import toast from 'react-hot-toast';
import { getPartnerGoals, createPartnerGoal, updatePartnerGoal, deletePartnerGoal, getPartners, getPartnerProfessions, getPartnerPlans } from '../../../../services/partner/partnerApi';

export default function PartnerOnboardingGoals() {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerType, setSelectedPartnerType] = useState('');
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [existingGoals, setExistingGoals] = useState([]);
  const [availableProfessions, setAvailableProfessions] = useState([]); // Fetched based on partnerType & state

  // Location Selection States
  const [activeLocationTab, setActiveLocationTab] = useState('State'); // State, District, Cluster

  // State management
  const [goalName, setGoalName] = useState('Partner Goal');
  const [formData, setFormData] = useState({
    state: '',
    cluster: '',
    targetCount: '',
    dueDate: '',
    deadlineDate: '',
    managerType: '',
    district: '',
    commission: ''
  });
  const [professions, setProfessions] = useState([
    { type: '', goal: '' }
  ]);
  const [showGoalNameModal, setShowGoalNameModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); // index of the active profession dropdown

  const { 
    countries, selectedCountry, setSelectedCountry,
    states, selectedState, setSelectedState,
    districts, selectedDistrict, setSelectedDistrict,
    clusters, selectedCluster, setSelectedCluster,
    fetchDistricts, fetchClusters 
  } = useLocations();

  // Initial Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const partnersData = await getPartners();
      setPartners(partnersData);

      if (partnersData.length > 0) {
        setSelectedPartnerType(partnersData[0].name);
        fetchPlans(partnersData[0].name);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load partner types');
    } finally {
      setLoading(false);
    }
  };

  // Set default country when loaded
  useEffect(() => {
    if (!selectedCountry && countries.length > 0) {
      setSelectedCountry(countries[0]._id);
    }
  }, [countries, selectedCountry, setSelectedCountry]);

  const fetchPlans = async (type) => {
    try {
      const data = await getPartnerPlans(type);
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlan(data[0].name);
      } else {
        setSelectedPlan('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Goals when Partner Type, Plan, or Location changes
  useEffect(() => {
    if (selectedPartnerType) {
      fetchGoals();
      setGoalName(`${selectedPartnerType}${selectedPlan ? ` - ${selectedPlan}` : ''} Goal`);
    } else {
      setExistingGoals([]);
    }
  }, [selectedPartnerType, selectedPlan, selectedState, selectedDistrict, selectedCluster]);

  // Fetch professions for dropdown when State or Partner Type changes
  useEffect(() => {
    if (selectedPartnerType && selectedState) {
      fetchAvailableProfessions();
    } else {
      setAvailableProfessions([]);
    }
  }, [selectedPartnerType, selectedState, selectedPlan]);


  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getPartnerGoals(selectedPartnerType);
      setExistingGoals(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }

  const fetchAvailableProfessions = async () => {
    try {
      const data = await getPartnerProfessions(selectedPartnerType, selectedState, selectedPlan);
      setAvailableProfessions(data.map(p => p.name));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load professions for this state');
    }
  }

  // Sync formData with useLocations
  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      state: selectedState, 
      district: selectedDistrict, 
      cluster: selectedCluster 
    }));
  }, [selectedState, selectedDistrict, selectedCluster]);

  const handleEdit = (goal) => {
    setIsEditing(true);
    setEditingGoalId(goal._id);
    setGoalName(goal.name);
    setSelectedPartnerType(goal.partnerType);
    setSelectedPlan(goal.plan || '');
    
    // Set location selection in hook
    setSelectedCountry(goal.state?.countryId || selectedCountry);
    setSelectedState(goal.state?._id || goal.state);
    setSelectedDistrict(goal.district?._id || goal.district);
    setSelectedCluster(goal.cluster?._id || goal.cluster);

    setFormData({
      state: goal.state?._id || goal.state,
      district: goal.district?._id || goal.district,
      cluster: goal.cluster?._id || goal.cluster,
      targetCount: goal.targetCount,
      dueDate: goal.dueDate,
      deadlineDate: goal.deadlineDate ? new Date(goal.deadlineDate).toISOString().split('T')[0] : '',
      managerType: goal.managerType,
      commission: goal.commission
    });

    setProfessions(goal.professions?.length > 0 ? goal.professions : [{ type: '', goal: '' }]);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingGoalId(null);
    setGoalName(`${selectedPartnerType} Goal`);
    setFormData({
      state: selectedState,
      district: selectedDistrict,
      cluster: selectedCluster,
      targetCount: '',
      dueDate: '',
      deadlineDate: '',
      managerType: '',
      commission: ''
    });
    setProfessions([{ type: '', goal: '' }]);
  };

  // Handle state selection
  const handleStateSelect = (stateId) => {
    setFormData((prev) => ({ ...prev, state: stateId, district: '', cluster: '' }));
  };

  useEffect(() => {
    if (formData.state) {
      fetchDistricts({ stateId: formData.state });
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.district) {
      fetchClusters({ districtId: formData.district });
    }
  }, [formData.district]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add new profession field
  const addProfession = () => {
    setProfessions([...professions, { type: '', goal: '' }]);
  };

  // Update profession field
  const updateProfession = (index, field, value) => {
    const updatedProfessions = [...professions];
    updatedProfessions[index][field] = value;
    setProfessions(updatedProfessions);
  };

  // Remove profession field
  const removeProfession = (index) => {
    if (professions.length > 1) {
      const updatedProfessions = professions.filter((_, i) => i !== index);
      setProfessions(updatedProfessions);
    }
  };

  // Calculate totals
  const totalTargetGoal = professions.reduce((sum, prof) => sum + (parseInt(prof.goal) || 0), 0);
  const professionTypesCount = professions.length;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartnerType) {
      toast.error('Please select a Partner Type');
      return;
    }
    if (!formData.state || !formData.district) {
      toast.error('Please select State and District');
      return;
    }

    try {
      const payload = {
        partnerType: selectedPartnerType,
        plan: selectedPlan,
        name: goalName,
        state: formData.state,
        district: formData.district,
        cluster: formData.cluster || undefined,
        targetCount: formData.targetCount,
        commission: formData.commission,
        dueDate: formData.dueDate,
        deadlineDate: formData.deadlineDate,
        managerType: formData.managerType,
        professions: professions.map(p => ({
          type: p.type,
          goal: parseInt(p.goal) || 0
        }))
      };

      if (isEditing) {
        await updatePartnerGoal(editingGoalId, payload);
        toast.success('Goal updated successfully');
      } else {
        await createPartnerGoal(payload);
        toast.success('Goal created successfully');
      }

      fetchGoals();
      if (isEditing) {
        cancelEdit();
      } else {
        // Reset form partially
        setFormData({ ...formData, targetCount: '', dueDate: '', deadlineDate: '', managerType: '', commission: '' });
        setProfessions([{ type: '', goal: '' }]);
      }
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? 'Failed to update goal' : 'Failed to save goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deletePartnerGoal(id);
        toast.success('Goal deleted');
        fetchGoals();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete goal');
      }
    }
  }


  if (loading && partners.length === 0) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header & Configuration Selectors */}
      <div className="mb-6 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Partner Onboarding Goals Setting</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Partner Type</label>
            <select
              value={selectedPartnerType}
              onChange={(e) => {
                setSelectedPartnerType(e.target.value);
                fetchPlans(e.target.value);
              }}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="">-- Select Partner Type --</option>
              {partners.map(partner => (
                <option key={partner._id} value={partner.name}>{partner.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              disabled={!selectedPartnerType || plans.length === 0}
            >
              <option value="">-- Select Plan --</option>
              {plans.map(plan => (
                <option key={plan._id} value={plan.name}>{plan.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedPartnerType ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-dashed flex flex-col items-center">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          Please select a Partner Type to configure onboarding goals.
        </div>
      ) : (
        <>
          {/* Location Selector Pattern */}
          <div className="bg-white rounded-xl shadow-sm p-4 my-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                {['Country', 'State', 'District', 'Cluster'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLocationTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeLocationTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 font-medium">Select location to set or view goals</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {activeLocationTab === 'Country' && countries.map(c => (
                <button
                  key={c._id}
                  onClick={() => { setSelectedCountry(c._id); setActiveLocationTab('State'); }}
                  className={`p-3 text-sm font-bold rounded-xl border transition-all ${selectedCountry === c._id ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100' : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200'}`}
                >
                  {c.name}
                </button>
              ))}
              {activeLocationTab === 'State' && states.map(s => (
                <button
                  key={s._id}
                  onClick={() => { setSelectedState(s._id); setActiveLocationTab('District'); }}
                  className={`p-3 text-sm font-bold rounded-xl border transition-all ${selectedState === s._id ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100' : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200'}`}
                >
                  {s.name}
                </button>
              ))}
              {activeLocationTab === 'District' && districts.map(d => (
                <button
                  key={d._id}
                  onClick={() => { setSelectedDistrict(d._id); setActiveLocationTab('Cluster'); }}
                  className={`p-3 text-sm font-bold rounded-xl border transition-all ${selectedDistrict === d._id ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100' : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200'}`}
                >
                  {d.name}
                </button>
              ))}
              {activeLocationTab === 'Cluster' && (clusters.length > 0 ? clusters.map(c => (
                <button
                  key={c._id}
                  onClick={() => setSelectedCluster(c._id)}
                  className={`p-3 text-sm font-bold rounded-xl border transition-all ${selectedCluster === c._id ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100' : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200'}`}
                >
                  {c.name}
                </button>
              )) : <p className="col-span-full text-center py-4 text-gray-400 text-sm">No clusters found for this district</p>)}
            </div>
          </div>

          <div className="space-y-8">
            {/* Goal Form Section */}
            <div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                {/* Card Header */}
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{isEditing ? 'Update' : 'Set'} {selectedPartnerType} Goal</h2>
                    {isEditing && <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Edit Mode</span>}
                  </div>
                  <div className="flex gap-2">
                    {isEditing && (
                      <button
                        type="button"
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-white/20"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      onClick={() => setShowGoalNameModal(true)}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Name
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <form id="goalForm" onSubmit={handleSubmit}>
                    {/* Goal Name Display */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Name: <span className="text-blue-600">{goalName}</span>
                      </h3>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Location Summary */}
                      <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <p><span className="text-blue-400 font-medium">Country:</span> <span className="text-blue-700 font-bold">{countries.find(c => c._id === selectedCountry)?.name || '-'}</span></p>
                        <p><span className="text-blue-400 font-medium">State:</span> <span className="text-blue-700 font-bold">{states.find(s => s._id === selectedState)?.name || '-'}</span></p>
                        <p><span className="text-blue-400 font-medium">District:</span> <span className="text-blue-700 font-bold">{districts.find(d => d._id === selectedDistrict)?.name || '-'}</span></p>
                        <p><span className="text-blue-400 font-medium">Cluster:</span> <span className="text-blue-700 font-bold">{clusters.find(c => c._id === selectedCluster)?.name || '-'}</span></p>
                      </div>

                      {/* Manager/Type */}
                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manager/Level Type</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          name="managerType"
                          value={formData.managerType}
                          onChange={handleInputChange}
                          placeholder="e.g. Cluster CPRM, Area Manager"
                          required
                        />
                      </div>

                      {/* Target Count */}
                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target monthly target KW</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                          name="targetCount"
                          value={formData.targetCount}
                          onChange={handleInputChange}
                          placeholder="e.g. 5"
                          required
                        />
                      </div>

                      {/* Commission */}
                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per kw Commission</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                          name="commission"
                          value={formData.commission}
                          onChange={handleInputChange}
                          placeholder="e.g. 1000"
                        />
                      </div>

                      {/* Due Date */}
                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Days)</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          placeholder="e.g. 90 Days"
                          required
                        />
                      </div>

                      {/* Deadline Date */}
                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select deadline date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                          name="deadlineDate"
                          value={formData.deadlineDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Profession Types Section */}
                    {formData.state && (
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">Targeted Professions</h3>
                          <button
                            type="button"
                            className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-600 transition-colors"
                            onClick={addProfession}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {professions.map((profession, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                              <div className="flex flex-col sm:flex-row gap-3 items-end">
                                {/* Profession Type */}
                                  <div className="flex-1 w-full relative">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Profession Type</label>
                                    <div className="relative">
                                      <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 text-sm"
                                        value={profession.type}
                                        onChange={(e) => updateProfession(index, 'type', e.target.value)}
                                        onFocus={() => setActiveDropdown(index)}
                                        placeholder="Type or select profession"
                                        required
                                      />
                                      {activeDropdown === index && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                                          {availableProfessions.filter(p => p.toLowerCase().includes(profession.type.toLowerCase())).length > 0 ? (
                                            availableProfessions
                                              .filter(p => p.toLowerCase().includes(profession.type.toLowerCase()))
                                              .map((type) => (
                                                <button
                                                  key={type}
                                                  type="button"
                                                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors border-b last:border-0 border-gray-50"
                                                  onClick={() => {
                                                    updateProfession(index, 'type', type);
                                                    setActiveDropdown(null);
                                                  }}
                                                >
                                                  {type}
                                                </button>
                                              ))
                                          ) : (
                                            <div className="px-3 py-2 text-xs text-gray-400 italic">No matching professions. Continue typing to add custom.</div>
                                          )}
                                        </div>
                                      )}
                                      {activeDropdown === index && (
                                        <div 
                                          className="fixed inset-0 z-0" 
                                          onClick={() => setActiveDropdown(null)} 
                                        />
                                      )}
                                    </div>
                                  </div>

                                {/* Goal */}
                                <div className="flex-1 w-full sm:w-1/3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                                  <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 text-sm"
                                    value={profession.goal}
                                    onChange={(e) => updateProfession(index, 'goal', e.target.value)}
                                    placeholder="e.g. 10"
                                    min="1"
                                    required
                                  />
                                </div>

                                {/* Remove Button */}
                                <div>
                                  <button
                                    type="button"
                                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors w-full sm:w-auto"
                                    onClick={() => removeProfession(index)}
                                    disabled={professions.length <= 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totals Summary */}
                        <div className="mt-4 bg-gray-50 text-sm rounded-lg p-3 border grid grid-cols-2 gap-4">
                          <div className="font-semibold text-gray-700">Total Proff Target: <span className="text-green-600 ml-1">{totalTargetGoal}</span></div>
                          <div className="text-right text-gray-600">Types Listed: <span className="font-semibold">{professionTypesCount}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-6 border-t pt-4 text-right">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 w-full md:w-auto ml-auto`}
                      >
                       <Save className="w-4 h-4" /> {isEditing ? 'Update Onboarding Goal' : 'Save Onboarding Goal'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Existing Goals List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Existing Goals
              </h2>
              {existingGoals.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-dashed text-center text-gray-500">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-300" />
                  No {selectedPartnerType} goals found for this location. Create one above to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {existingGoals.map(goal => (
                    <div key={goal._id} className="bg-white rounded-xl shadow-sm border p-6 relative hover:shadow-md transition-shadow group">
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title="Edit Goal"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="font-bold text-lg text-blue-600 mb-2">{goal.name}</h3>
                      <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 mb-4">
                        <p><span className="text-gray-500">Plan:</span> <span className="font-medium">{goal.plan || '-'}</span></p>
                        <p><span className="text-gray-500">Manager:</span> <span className="font-medium">{goal.managerType}</span></p>
                        <p><span className="text-gray-500">State:</span> <span className="font-medium">{goal.state?.name}</span></p>
                        <p><span className="text-gray-500">District:</span> <span className="font-medium">{goal.district?.name || '-'}</span></p>
                        <p><span className="text-gray-500">Cluster:</span> <span className="font-medium">{goal.cluster?.name || '-'}</span></p>
                        <p><span className="text-gray-500">Target (kW):</span> <span className="font-medium">{goal.targetCount}</span></p>
                        <p><span className="text-gray-500">Commission:</span> <span className="font-medium">{goal.commission || 0}</span></p>
                        <p><span className="text-gray-500">Timeline:</span> <span className="font-medium">{goal.dueDate}</span></p>
                        <p className="col-span-2"><span className="text-gray-500">Deadline:</span> <span className="font-medium">{goal.deadlineDate ? new Date(goal.deadlineDate).toLocaleDateString() : '-'}</span></p>
                      </div>
                      {goal.professions && goal.professions.length > 0 && (
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 uppercase">Target Professions</div>
                          <div className="divide-y divide-gray-100">
                            {goal.professions.map((p, i) => (
                              <div key={i} className="flex justify-between px-3 py-2 text-sm">
                                <span className="text-gray-800">{p.type}</span>
                                <span className="font-semibold text-blue-600">{p.goal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Goal Name Modal */}
      {showGoalNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Set Goal Name</h3>
              <button onClick={() => setShowGoalNameModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium" onClick={() => setShowGoalNameModal(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium" onClick={() => setShowGoalNameModal(false)}>Apply Name</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
