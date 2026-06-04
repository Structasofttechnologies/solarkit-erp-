import React, { useState, useEffect } from 'react';
import {
  Plus,
  MapPin,
  Users,
  Briefcase,
  Edit,
  Trash2,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStates } from '../../../../services/core/locationApi';
import { getProfessionTypes, createProfessionType, deleteProfessionType } from '../../../../services/franchisee/franchiseeApi';

export default function ProfessionType() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [profession, setProfession] = useState('');
  const [entries, setEntries] = useState([]); // All fetched profession types
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates();
    fetchAllProfessions();
  }, []);

  const fetchStates = async () => {
    try {
      const data = await getStates();
      setStates(data);
    } catch (error) {
      toast.error("Failed to load states");
    }
  };

  // Fetch all professions (or filter by state if API supported it, but controller seems to support optional state query)
  // For summary table, we might want all.
  const fetchAllProfessions = async () => {
    setLoading(true);
    try {
      const data = await getProfessionTypes();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching professions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateClick = (state) => {
    setSelectedState(state);
    setShowForm(true);
    // Optionally filter entries in UI or fetch specific
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedState && profession.trim()) {
      try {
        const newEntry = await createProfessionType({
          state: selectedState._id,
          name: profession.trim()
        });

        // Optimistically update or re-fetch
        // We need state name for display, response usually contains populated state or just ID.
        // Let's manually add state name for UI if not populated
        const entryWithStateName = {
          ...newEntry,
          state: selectedState // assuming API returns object or we substitute
        };

        setEntries([...entries, entryWithStateName]);
        setProfession('');
        toast.success("Profession type added successfully");
      } catch (error) {
        toast.error(error.message || "Failed to add profession");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this profession type?")) return;
    try {
      await deleteProfessionType(id);
      setEntries(entries.filter(e => e._id !== id));
      toast.success("Profession type deleted");
    } catch (error) {
      toast.error("Failed to delete profession");
    }
  };

  // Associate state name with entries if they only have ID
  // The API response for populate might vary. 
  // Assuming `getProfessionTypes` returns populated state. If not, we map.
  const getDisplayEntries = () => {
    return entries.map(entry => {
      if (entry.state && typeof entry.state === 'object') return entry;
      const foundState = states.find(s => s._id === entry.state);
      return { ...entry, state: foundState || { name: 'Unknown', _id: entry.state } };
    });
  };

  const displayEntries = getDisplayEntries();

  // Filter if state selected? Or show all. 
  // The original design showed "Summary of Entries", implying all.
  // But maybe it's better to filter by selected state if one is selected.
  // Let's show all for now as per "Summary" implies global list.

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">Franchisee Profession Type</h1>
            </div>
          </div>
        </div>
      </div>

      {/* State Selection Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Select State to Add Profession</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {states.map((state) => (
            <div
              key={state._id}
              onClick={() => handleStateClick(state)}
              className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${selectedState?._id === state._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{state.name}</h3>
                <p className="text-gray-600">{state.code}</p>
              </div>
            </div>
          ))}
          {states.length === 0 && <p>No states found.</p>}
        </div>
      </div>

      {/* Input Form */}
      {showForm && selectedState && (
        <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-200 animate-fade-in">
          <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Add Profession Type for {selectedState.name}
            </h2>
            <button onClick={() => { setShowForm(false); setSelectedState(null); }} className="text-white hover:text-gray-200"><X size={20} /></button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession Type
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter profession type (e.g. Electrician)"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Profession
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-2" />
            <h2 className="text-lg font-semibold">Summary of Entries</h2>
          </div>
        </div>
        <div className="p-6">
          {loading ? <p className="text-center py-4">Loading...</p> : (
            displayEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">State</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Profession Type</th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayEntries.map((entry, index) => (
                      <tr key={entry._id || index} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium text-gray-800">{entry.state?.name || 'All'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-700 font-medium">{entry.name}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="p-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No profession types added yet. Click on a state card to add one.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}