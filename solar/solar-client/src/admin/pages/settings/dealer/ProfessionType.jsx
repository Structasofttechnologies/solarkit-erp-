import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Plus,
  Trash2,
  X,
  Search,
  Loader,
  Save
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import toast from 'react-hot-toast';
import { getDealerProfessions, createDealerProfession, deleteDealerProfession } from '../../../../services/dealer/dealerApi';

export default function DealerProfessionType() {
  const [loading, setLoading] = useState(false);
  const [professions, setProfessions] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfession, setNewProfession] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { states } = useLocations();

  // Fetch Professions
  useEffect(() => {
    fetchProfessions();
  }, []);

  const fetchProfessions = async () => {
    try {
      setLoading(true);
      const data = await getDealerProfessions();
      setProfessions(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error('Failed to load professions');
    }
  }

  const handleStateClick = (state) => {
    setSelectedState(state);
    setShowAddModal(true);
  };

  const handleAddProfession = async () => {
    if (!newProfession.trim()) {
      toast.error('Please enter a profession name');
      return;
    }
    try {
      const payload = {
        state: selectedState._id,
        name: newProfession
      };
      await createDealerProfession(payload);
      toast.success('Profession added');
      setNewProfession('');
      fetchProfessions(); // Refresh list to update counts/summary
    } catch (error) {
      console.error(error);
      toast.error('Failed to add profession');
    }
  };

  const handleDeleteProfession = async (id) => {
    if (window.confirm('Delete this profession?')) {
      try {
        await deleteDealerProfession(id);
        toast.success('Profession deleted');
        fetchProfessions();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete profession');
      }
    }
  }

  // Filter states based on search
  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group professions by state for display count
  const getProfessionCount = (stateId) => {
    return professions.filter(p => p.state && p.state._id === stateId).length;
  };

  if (loading && professions.length === 0) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Dealer Profession Types</h1>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search State..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* States Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {filteredStates.map(state => {
          const count = getProfessionCount(state._id);
          return (
            <div
              key={state._id}
              onClick={() => handleStateClick(state)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border border-transparent hover:border-blue-200 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {count} Professions
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{state.name}</h3>
              <p className="text-sm text-gray-500">Click to manage</p>
            </div>
          );
        })}
        {filteredStates.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl">
            No states found matching your search.
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Profession Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create a visual summary grouped by state */}
            {states.filter(s => getProfessionCount(s._id) > 0).map(state => (
              <div key={state._id} className="border rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-2 border-b pb-2 flex justify-between items-center">
                  {state.name}
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{getProfessionCount(state._id)}</span>
                </h3>
                <ul className="space-y-1">
                  {professions.filter(p => p.state && p.state._id === state._id).map(p => (
                    <li key={p._id} className="text-sm text-gray-600 flex justify-between items-center group">
                      <span>• {p.name}</span>
                      <button onClick={() => handleDeleteProfession(p._id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {professions.length === 0 && (
              <p className="text-gray-500 italic col-span-full text-center">No professions added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add/Manage Modal */}
      {showAddModal && selectedState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Manage Professions: {selectedState.name}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:bg-blue-700 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Add New Input */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter Profession Name (e.g. Electrician)"
                  value={newProfession}
                  onChange={(e) => setNewProfession(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProfession()}
                />
                <button
                  onClick={handleAddProfession}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Current List for this State */}
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Current Professions</h4>
                <ul className="space-y-2">
                  {professions.filter(p => p.state && p.state._id === selectedState._id).map(p => (
                    <li key={p._id} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                      <span className="text-gray-800">{p.name}</span>
                      <button onClick={() => handleDeleteProfession(p._id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                  {professions.filter(p => p.state && p.state._id === selectedState._id).length === 0 && (
                    <li className="text-center text-gray-400 py-4 italic">No professions added for {selectedState.name}</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 text-right border-t">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}