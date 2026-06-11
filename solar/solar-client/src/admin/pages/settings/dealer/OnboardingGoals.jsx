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
  X
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import toast from 'react-hot-toast';
import { getDealerGoals, createDealerGoal, deleteDealerGoal } from '../../../../services/dealer/dealerApi';

export default function DealerOnboardingGoals() {
  const [loading, setLoading] = useState(false);
  const [existingGoals, setExistingGoals] = useState([]);

  // State management
  const [goalName, setGoalName] = useState('CP Goal');
  const [formData, setFormData] = useState({
    state: '',
    cluster: '',
    cprmCount: '',
    dueDate: '',
    cprmType: '',
    district: ''
  });
  const [professions, setProfessions] = useState([
    { type: '', goal: '' }
  ]);
  const [showGoalNameModal, setShowGoalNameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { states, districts, clusters, fetchDistricts, fetchClusters } = useLocations();
  const selectedState = states.find((s) => s._id === formData.state) || null;
  const selectedDistrict = districts.find((d) => d._id === formData.district) || null;
  const selectedCluster = clusters.find((c) => c._id === formData.cluster) || null;

  const professionTypes = [
    "Electrician", "Civil Engineer", "Contractor", "Doctor",
    "Engineer", "Lawyer", "Accountant", "Teacher"
  ];

  // Fetch Existing Goals
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getDealerGoals();
      setExistingGoals(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error('Failed to load goals');
    }
  }

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
  const totalCPGoal = professions.reduce((sum, prof) => sum + (parseInt(prof.goal) || 0), 0);
  const professionTypesCount = professions.length;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state || !formData.district) {
      toast.error('Please select State and District');
      return;
    }

    try {
      const payload = {
        name: goalName,
        state: formData.state,
        district: formData.district,
        cluster: formData.cluster || undefined,
        dealerCount: formData.cprmCount,
        dueDate: formData.dueDate,
        dealerType: formData.cprmType,
        professions: professions.map(p => ({
          type: p.type,
          goal: parseInt(p.goal)
        }))
      };

      await createDealerGoal(payload);
      toast.success('Goal created successfully');
      fetchGoals();
      // Reset form partially
      setFormData({ ...formData, cprmCount: '', dueDate: '', cprmType: '' });
      setProfessions([{ type: '', goal: '' }]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteDealerGoal(id);
        toast.success('Goal deleted');
        fetchGoals();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete goal');
      }
    }
  }

  // Save goal name
  const handleSaveGoalName = () => {
    setShowGoalNameModal(false);
  };

  if (loading && existingGoals.length === 0) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Breadcrumb */}
      <div className="container mx-auto px-4 mb-4">
        <nav className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Dealer Onboarding Goals Setting</h1>
        </nav>
      </div>

      <div className="container mx-auto px-4">
        {/* State Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 my-8">
          {states.length > 0 ? states.map((state) => (
            <div
              key={state._id}
              className={`card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${formData.state === state._id ? 'ring-2 ring-blue-500' : ''
                }`}
              onClick={() => handleStateSelect(state._id)}
            >
              <div className="p-6 text-center">
                <h3 className="font-bold text-lg text-gray-800">{state.name}</h3>
                <p className="text-gray-500 flex items-center justify-center gap-1 mt-2">
                  {state.code || '-'}
                  <Eye className="w-4 h-4 ml-1 cursor-help"
                    title="Select to load districts"
                  />
                </p>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
              No states available. Please add them in Settings → Location Management.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goal Form Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Set CP Goal</h2>
                <button
                  type="button"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  onClick={() => setShowGoalNameModal(true)}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Goal Name
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <form id="goalForm" onSubmit={handleSubmit}>
                  {/* Goal Name Display */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Goal: <span className="text-blue-600">{goalName}</span>
                    </h3>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* State */}
                    <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        value={selectedState?.name || ''}
                        readOnly
                      />
                    </div>

                    {/* District */}
                    <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select District
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        name="district"
                        value={formData.district}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, district: e.target.value, cluster: '' }))
                        }
                        required={!formData.state ? false : true}
                        disabled={!formData.state || districts.length === 0}
                      >
                        <option value="">
                          {districts.length === 0 ? 'No districts available' : '-- Select District --'}
                        </option>
                        {districts.map((d) => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cluster */}
                    <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Cluster
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        name="cluster"
                        value={formData.cluster}
                        onChange={handleInputChange}
                        disabled={!formData.district || clusters.length === 0}
                      >
                        <option value="">
                          {clusters.length === 0 ? 'No clusters available' : '-- Select Cluster --'}
                        </option>
                        {clusters.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dealer Type */}
                    <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dealer Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        name="cprmType"
                        value={formData.cprmType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Dealer Type</option>
                        <option value="Cluster CPRM">Cluster Dealer</option>
                        <option value="District CPRM">District Dealer</option>
                      </select>
                    </div>

                    {/* Dealer Count */}
                    <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dealer Count
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        name="cprmCount"
                        value={formData.cprmCount}
                        onChange={handleInputChange}
                        placeholder="e.g. 3"
                        required
                      />
                    </div>

                    {/* Due Date */}
                    <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        placeholder="e.g. 90 Days"
                        required
                      />
                    </div>

                  </div>

                  {/* Profession Types Section */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Profession Types</h3>
                      <button
                        type="button"
                        className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 transition-colors"
                        onClick={addProfession}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {professions.map((profession, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* Profession Type */}
                            <div className="md:col-span-5">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Profession Type
                              </label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={profession.type}
                                onChange={(e) => updateProfession(index, 'type', e.target.value)}
                                required
                              >
                                <option value="">Select Profession Type</option>
                                {professionTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Dealer Goal */}
                            <div className="md:col-span-5">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dealer Goal
                              </label>
                              <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={profession.goal}
                                onChange={(e) => updateProfession(index, 'goal', e.target.value)}
                                placeholder="e.g. 10"
                                min="1"
                                required
                              />
                            </div>

                            {/* Remove Button */}
                            <div className="md:col-span-2 text-center">
                              <button
                                type="button"
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
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
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">
                            Total Dealer Goal: <span className="text-green-600">{totalCPGoal}</span>
                          </h4>
                        </div>
                        <div className="text-right">
                          <h4 className="font-semibold">
                            Profession Types: <span>{professionTypesCount}</span>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6 text-right">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                      <Save className="w-4 h-4" /> Save Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Existing Goals List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Existing Goals</h2>
            {existingGoals.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">No goals found. Create one.</div>
            ) : (
              existingGoals.map(goal => (
                <div key={goal._id} className="bg-white rounded-xl shadow-md p-6 relative">
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">{goal.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                    <p><span className="font-semibold">State:</span> {goal.state?.name}</p>
                    <p><span className="font-semibold">District:</span> {goal.district?.name}</p>
                    <p><span className="font-semibold">Cluster:</span> {goal.cluster?.name || '-'}</p>
                    <p><span className="font-semibold">Type:</span> {goal.dealerType}</p>
                    <p><span className="font-semibold">Count:</span> {goal.dealerCount}</p>
                    <p><span className="font-semibold">Due:</span> {goal.dueDate}</p>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Professions</h4>
                    <div className="space-y-1">
                      {goal.professions.map((p, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{p.type}</span>
                          <span className="font-semibold">{p.goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Goal Name Modal */}
      {showGoalNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Set Goal Name</h3>
              <button
                onClick={() => setShowGoalNameModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowGoalNameModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={handleSaveGoalName}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}