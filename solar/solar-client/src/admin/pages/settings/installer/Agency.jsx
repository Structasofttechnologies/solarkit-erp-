import { useState, useEffect } from 'react';
import { useLocations } from '../../../../hooks/useLocations';
import {
  getInstallerAgencies,
  createInstallerAgency,
  updateInstallerAgency,
  deleteInstallerAgency
} from '../../../../services/installer/installerApi';
import { getClustersHierarchy, getDistrictsHierarchy } from '../../../../services/core/locationApi';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit, Trash2, Search, Filter, Phone, MapPin, FileText, Save, X, Layers } from 'lucide-react';

const InstallerAgency = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentAgency, setCurrentAgency] = useState(null);

  const {
    states,
    clusters,
    districts,
    selectedState,
    setSelectedState,
    selectedCluster,
    setSelectedCluster,
    selectedDistrict,
    setSelectedDistrict,
    loading: locationsLoading
  } = useLocations();

  const [formData, setFormData] = useState({
    agencyName: '',
    contact: '',
    address: '',
    licenseNumber: '',
    state: '',
    cluster: '',
    district: '',
    status: 'Active'
  });

  const [formClusters, setFormClusters] = useState([]);
  const [formDistricts, setFormDistricts] = useState([]);

  useEffect(() => {
    fetchAgencies();
  }, [selectedState, selectedCluster, selectedDistrict]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const params = {
        state: selectedState,
        cluster: selectedCluster,
        district: selectedDistrict
      };
      const data = await getInstallerAgencies(params);
      setAgencies(data);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast.error('Failed to load agencies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormStateChange = async (e) => {
    const newStateId = e.target.value;
    setFormData(prev => ({ ...prev, state: newStateId, cluster: '', district: '' }));
    setFormClusters([]);
    setFormDistricts([]);

    if (newStateId) {
      try {
        const data = await getClustersHierarchy(newStateId);
        setFormClusters(data || []);
      } catch (error) {
        console.error('Error fetching clusters:', error);
        toast.error('Failed to load clusters');
      }
    }
  };

  const handleFormClusterChange = async (e) => {
    const newClusterId = e.target.value;
    setFormData(prev => ({ ...prev, cluster: newClusterId, district: '' }));
    setFormDistricts([]);

    if (newClusterId) {
      try {
        const data = await getDistrictsHierarchy(newClusterId);
        setFormDistricts(data || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
        toast.error('Failed to load districts');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agencyName || !formData.contact || !formData.state || !formData.cluster || !formData.district) {
      toast.error('Agency Name, Contact, and Location (S/C/D) are required');
      return;
    }

    try {
      if (currentAgency) {
        await updateInstallerAgency(currentAgency._id, formData);
        toast.success('Agency updated successfully');
      } else {
        await createInstallerAgency(formData);
        toast.success('Agency added successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchAgencies();
    } catch (error) {
      console.error('Error saving agency:', error);
      toast.error('Failed to save agency');
    }
  };

  const handleEdit = async (agency) => {
    setCurrentAgency(agency);
    setFormData({
      agencyName: agency.agencyName,
      contact: agency.contact,
      address: agency.address,
      licenseNumber: agency.licenseNumber || '',
      state: agency.state?._id || agency.state || '',
      cluster: agency.cluster?._id || agency.cluster || '',
      district: agency.district?._id || agency.district || '',
      status: agency.status
    });
    setIsModalOpen(true);

    // Fetch dependent data
    try {
      const stateId = agency.state?._id || agency.state;
      if (stateId) {
        const clustersData = await getClustersHierarchy(stateId);
        setFormClusters(clustersData || []);

        const clusterId = agency.cluster?._id || agency.cluster;
        if (clusterId) {
          const districtsData = await getDistrictsHierarchy(clusterId);
          setFormDistricts(districtsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dependent location data:', error);
      toast.error('Failed to load location data for editing');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      try {
        await deleteInstallerAgency(id);
        toast.success('Agency deleted successfully');
        fetchAgencies();
      } catch (error) {
        console.error('Error deleting agency:', error);
        toast.error('Failed to delete agency');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      agencyName: '',
      contact: '',
      address: '',
      licenseNumber: '',
      state: '',
      cluster: '',
      district: '',
      status: 'Active'
    });
    setCurrentAgency(null);
    setFormClusters([]);
    setFormDistricts([]);
  };

  const filteredAgencies = agencies.filter(agency => {
    const nameMatch = agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase());
    const contactMatch = agency.contact.includes(searchTerm);
    const licenseMatch = (agency.licenseNumber && agency.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSearch = nameMatch || contactMatch || licenseMatch;
    const matchesStatus = filterStatus === 'All' || agency.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-600" />
              Installer Agencies
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage installer agencies and partners</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-purple-200"
          >
            <Plus className="w-5 h-5" />
            Add New Agency
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, contact or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-40 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-gray-600 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> STATE
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-gray-600 cursor-pointer bg-white"
              >
                <option value="">All States</option>
                {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Layers className="w-3 h-3" /> CLUSTER
              </label>
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                disabled={!selectedState}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-gray-600 cursor-pointer bg-white disabled:bg-gray-50 text-sm"
              >
                <option value="">All Clusters</option>
                {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> DISTRICT
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedCluster}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-gray-600 cursor-pointer bg-white disabled:bg-gray-50 text-sm"
              >
                <option value="">All Districts</option>
                {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-500">Loading agencies...</div>
          ) : filteredAgencies.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-300 mb-2" />
                <p>No agencies found.</p>
              </div>
            </div>
          ) : (
            filteredAgencies.map((agency) => (
              <div key={agency._id} className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                      {agency.agencyName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${agency.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {agency.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{agency.agencyName}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">{agency.contact}</span>
                    </div>
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin className="w-4 h-4 text-purple-500 mt-1" />
                      <span className="text-sm line-clamp-2">{agency.address}</span>
                    </div>
                    {agency.licenseNumber && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{agency.licenseNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(agency)}
                    className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agency._id)}
                    className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {currentAgency ? 'Edit Agency' : 'Add New Agency'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter agency name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Optional License No."
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleFormStateChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s._id} value={s._id}>{s.name || s.stateName}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
                    <select
                      name="cluster"
                      value={formData.cluster}
                      onChange={handleFormClusterChange}
                      disabled={!formData.state}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
                      required
                    >
                      <option value="">Select Cluster</option>
                      {formClusters.map(c => <option key={c._id} value={c._id}>{c.name || c.clusterName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      disabled={!formData.cluster}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
                      required
                    >
                      <option value="">Select District</option>
                      {formDistricts.map(d => <option key={d._id} value={d._id}>{d.name || d.districtName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-purple-200"
                >
                  <Save className="w-4 h-4" />
                  {currentAgency ? 'Update Agency' : 'Save Agency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallerAgency;