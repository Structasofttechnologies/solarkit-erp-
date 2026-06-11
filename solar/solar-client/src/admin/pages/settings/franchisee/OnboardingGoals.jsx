import React, { useState, useEffect } from 'react';
import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  MapPin,
  CalendarCheck,
  BarChart3,
  Clock,
  Save,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStates, getCities, getDistricts } from '../../../../services/core/locationApi';
import { getOnboardingGoals, createOnboardingGoal, updateOnboardingGoal } from '../../../../services/franchisee/franchiseeApi';

export default function FranchiseeOnboardingGoals() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  // Dependent Dropdown Data
  // "Cluster" in the UI often refers to a grouping of districts or a City level. 
  // Given the previous static code had "StateClusters" mapping to Cities (Rajkot, Ahmedabad), 
  // I will treat "Cluster" as City for now to map to standard hierarchy, but label it Cluster/City.
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [existingGoals, setExistingGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null); // The goal being edited/viewed

  const [formData, setFormData] = useState({
    goalName: 'Franchisee Goal',
    state: '',
    cluster: '',
    district: '',
    franchiseManagerCount: '',
    dueDateDays: '',
    cprmType: '',
    professions: [{ type: '', goal: '' }]
  });

  const [loading, setLoading] = useState(false);
  const [showGoalNameModal, setShowGoalNameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const professionTypes = [
    "Electrician", "Civil Engineer", "Contractor", "Doctor",
    "Engineer", "Lawyer", "Accountant", "Architect", "Solar Installer"
  ];

  const cprmTypes = ["Cluster CPRM", "District CPRM"];

  // Fetch initial states
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch goals when state changes
  useEffect(() => {
    if (selectedState) {
      fetchGoals(selectedState._id);
      // Reset form partially when switching state
      setFormData(prev => ({
        ...prev,
        state: selectedState._id,
        cluster: '',
        district: '',
        // keep other defaults or reset? keeping for now
      }));
      // Fetch cities for this state (mapping "Cluster" to City)
      fetchCities(selectedState._id);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    try {
      const data = await getStates();
      // Filter only active if needed, usually API handles it
      setStates(data);
    } catch (error) {
      toast.error("Failed to load states");
    }
  };

  const fetchGoals = async (stateId) => {
    setLoading(true);
    try {
      const data = await getOnboardingGoals(stateId);
      setExistingGoals(data);
      // If a goal exists for this state, maybe pre-fill? 
      // For now, let's treat it as "Create New" or "Select from List"
      // The UI design implies setting a goal for a Cluster/District combo.
    } catch (error) {
      console.error("Error fetching goals", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const data = await getCities(stateId);
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  const handleCityChange = async (cityId) => {
    setFormData(prev => ({ ...prev, cluster: cityId, district: '' }));
    try {
      const data = await getDistricts(cityId);
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

  // Helper to find name from ID
  const getCityName = (id) => cities.find(c => c._id === id)?.name || id;
  const getDistrictName = (id) => districts.find(d => d._id === id)?.name || id;
  const getStateName = (id) => states.find(s => s._id === id)?.name || id;


  const handleAddProfession = () => {
    setFormData(prev => ({
      ...prev,
      professions: [...prev.professions, { type: '', goal: '' }]
    }));
  };

  const handleRemoveProfession = (index) => {
    if (formData.professions.length > 1) {
      const newProfessions = [...formData.professions];
      newProfessions.splice(index, 1);
      setFormData(prev => ({ ...prev, professions: newProfessions }));
    }
  };

  const handleProfessionChange = (index, field, value) => {
    const newProfessions = [...formData.professions];
    newProfessions[index][field] = value;
    setFormData(prev => ({ ...prev, professions: newProfessions }));
  };

  const calculateTotalGoal = (profs) => {
    return (profs || formData.professions).reduce((total, prof) => total + (parseInt(prof.goal) || 0), 0);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.state || !formData.cluster || !formData.district) {
      toast.error("Please select State, Cluster and District");
      return;
    }

    try {
      let savedGoal;
      // Check if we are updating an existing one (logic could be refined based on requirement)
      // For now, let's assume we are creating a new configuration or updating if ID exists in a hidden field
      if (currentGoal && currentGoal._id) {
        savedGoal = await updateOnboardingGoal(currentGoal._id, formData);
        toast.success("Goal updated successfully");
      } else {
        savedGoal = await createOnboardingGoal(formData);
        toast.success("Goal created successfully");
      }

      setCurrentGoal(savedGoal);
      setShowSummary(true);

      // Refresh list
      fetchGoals(formData.state);

      // Scroll
      setTimeout(() => {
        const summaryElement = document.getElementById('summary');
        if (summaryElement) {
          summaryElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error(error.message || "Failed to save goal");
    }
  };

  const handleEditGoal = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      state: goal.state,
      cluster: goal.cluster, // ID
      district: goal.district, // ID
      franchiseManagerCount: goal.franchiseManagerCount,
      dueDateDays: goal.dueDateDays,
      cprmType: goal.cprmType,
      professions: goal.professions,
      goalName: goal.goalName
    });
    // Need to fetch districts for the selected city (cluster) so dropdown works
    handleCityChange(goal.cluster);
  }

  // Visualization Component
  const ProgressBar = ({ percentage }) => (
    <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden relative">
      <div
        className="bg-blue-400 h-5 rounded-full relative"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          {percentage}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-base">
      <div className="container mx-auto px-4 py-4">
        <nav className="bg-white p-4 rounded-lg shadow flex items-center">
          <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Franchisee Onboarding Goals Setting</h1>
        </nav>
      </div>

      <div className="container mx-auto px-4">
        {/* State Selection */}
        <div className="mb-6">
          {!selectedState ? (
            <>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Select State</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {states.map((state) => (
                  <div
                    key={state._id}
                    className="bg-white shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer p-6 text-center border border-transparent hover:border-blue-500"
                    onClick={() => setSelectedState(state)}
                  >
                    <h5 className="font-bold text-lg mb-2">{state.name}</h5>
                    <p className="text-gray-500 text-sm">
                      {state.code}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <button onClick={() => { setSelectedState(null); setShowSummary(false); setCurrentGoal(null); }} className="text-blue-600 hover:underline flex items-center mb-4">
              &larr; Back to State Selection
            </button>
          )}
        </div>

        {selectedState && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Form */}
            <div className="flex-grow">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                  <h5 className="text-lg font-semibold">{currentGoal ? 'Edit Goal' : 'Set New Franchisee Goal'} - {selectedState.name}</h5>
                  <button
                    type="button"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    onClick={() => setShowGoalNameModal(true)}
                  >
                    <Pencil size={16} />
                    Edit Goal Name
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={handleFormSubmit}>
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold border-b pb-2">
                        Goal Name: <span className="text-blue-600">{formData.goalName}</span>
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" value={selectedState.name} readOnly />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Cluster (City)</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.cluster}
                          onChange={(e) => handleCityChange(e.target.value)}
                          required
                        >
                          <option value="">-- Select --</option>
                          {cities.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select District</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          required
                        >
                          <option value="">-- Select --</option>
                          {districts.map(d => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Franchise Manager Count</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          value={formData.franchiseManagerCount}
                          onChange={(e) => setFormData({ ...formData, franchiseManagerCount: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Days)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          value={formData.dueDateDays}
                          onChange={(e) => setFormData({ ...formData, dueDateDays: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPRM Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          value={formData.cprmType}
                          onChange={(e) => setFormData({ ...formData, cprmType: e.target.value })}
                          required
                        >
                          <option value="">Select Type</option>
                          {cprmTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Profession Types Section */}
                    <div className="mt-8 border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-lg font-semibold">Profession Types</h5>
                        <button
                          type="button"
                          className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                          onClick={handleAddProfession}
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formData.professions.map((profession, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500 flex flex-wrap md:flex-nowrap items-center gap-3">
                            <div className="flex-grow">
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={profession.type}
                                onChange={(e) => handleProfessionChange(index, 'type', e.target.value)}
                                required
                              >
                                <option value="">Select Profession</option>
                                {professionTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-grow">
                              <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Goal Count"
                                min="1"
                                value={profession.goal}
                                onChange={(e) => handleProfessionChange(index, 'goal', e.target.value)}
                                required
                              />
                            </div>
                            <button
                              type="button"
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                              onClick={() => handleRemoveProfession(index)}
                              disabled={formData.professions.length === 1}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                        <h6 className="font-semibold text-gray-700"> Total Goal: <span className="text-green-600 text-xl">{calculateTotalGoal()}</span></h6>
                        <h6 className="font-semibold text-gray-700"> Types: <span className="text-blue-600 text-xl">{formData.professions.length}</span></h6>
                      </div>
                    </div>

                    <div className="text-right mt-6">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md flex items-center gap-2 ml-auto"
                      >
                        <Save size={18} />
                        {currentGoal ? 'Update Goal' : 'Save Goal'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar List of Existing Goals */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h4 className="text-lg font-bold mb-4 border-b pb-2">Existing Goals for {selectedState.name}</h4>
                {existingGoals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No goals found. Create one!</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {existingGoals.map(goal => (
                      <div key={goal._id} className={`p-3 rounded-lg border cursor-pointer hover:bg-blue-50 ${currentGoal?._id === goal._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => handleEditGoal(goal)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-gray-800">{goal.goalName}</h5>
                            <div className="text-sm text-gray-500 mt-1">
                              <MapPin size={12} className="inline mr-1" />
                              {getCityName(goal.cluster)}, {getDistrictName(goal.district)}
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                            {goal.professions.reduce((a, b) => a + (b.goal || 0), 0)} Targets
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {showSummary && currentGoal && (
          <div id="summary" className="mt-8">
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-white shadow-xl rounded-2xl border-0 my-4 overflow-hidden">
                <div className="p-6">
                  <h5 className="font-bold mb-4 text-blue-600 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" /> Goal Summary Saved
                  </h5>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className="font-semibold text-gray-600">Goal Name:</span> <br />{currentGoal.goalName}</div>
                    <div><span className="font-semibold text-gray-600">Location:</span> <br />{getCityName(currentGoal.cluster)}, {getDistrictName(currentGoal.district)}</div>
                    <div><span className="font-semibold text-gray-600">Due Date:</span> <br />{currentGoal.dueDateDays} Days</div>
                    <div><span className="font-semibold text-gray-600">Manager Count:</span> <br />{currentGoal.franchiseManagerCount}</div>
                  </div>

                  <div className="mb-4 pt-4 border-t">
                    <h6 className="font-semibold mb-2">Targets Breakdown</h6>
                    <div className="grid grid-cols-2 gap-2">
                      {currentGoal.professions.map((profession, index) => (
                        <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                          <span>{profession.type}</span>
                          <span className="font-bold text-blue-600">{profession.goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goal Name Modal */}
      {showGoalNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold">Edit Goal Name</h5>
                <button
                  onClick={() => setShowGoalNameModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.goalName}
                  onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowGoalNameModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowGoalNameModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}