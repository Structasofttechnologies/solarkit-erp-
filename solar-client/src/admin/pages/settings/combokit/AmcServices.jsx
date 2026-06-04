import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Save, RefreshCw, Cog, List,
  Edit2, Trash2, CheckSquare, X,
  Search, Filter, MoreVertical, ChevronRight,
  AlertCircle, Info, Settings, Eye, Package,
  Loader, ChevronDown, ShieldAlert
} from 'lucide-react';
import {
  createAMCService,
  getAMCServices,
  updateAMCService,
  deleteAMCService
} from '../../../../services/combokit/combokitApi';
import toast from 'react-hot-toast';

const AmcServices = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceDescription: '',
    serviceType: 'regular',
    basePrice: ''
  });

  // Services data
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // State for edit form
  const [editFormData, setEditFormData] = useState({
    serviceName: '',
    serviceDescription: '',
    serviceType: 'regular',
    basePrice: ''
  });

  // Fetch Services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getAMCServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching AMC services:', error);
      toast.error('Failed to load AMC services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add new service
  const addService = async (e) => {
    e.preventDefault();

    if (!formData.serviceName.trim()) {
      alert('Please enter a service name');
      return;
    }

    const payload = {
      serviceName: formData.serviceName,
      description: formData.serviceDescription,
      serviceType: formData.serviceType,
      basePrice: parseInt(formData.basePrice) || 0
    };

    try {
      await createAMCService(payload);
      toast.success('Service added successfully!');
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      serviceName: '',
      serviceDescription: '',
      serviceType: 'regular',
      basePrice: ''
    });
  };

  // Edit service
  const editService = (id) => {
    const service = services.find(s => s._id === id);
    if (!service) return;

    setCurrentEditId(id);
    setEditFormData({
      serviceName: service.serviceName,
      serviceDescription: service.description || '',
      serviceType: service.serviceType || 'regular',
      basePrice: (service.basePrice || 0).toString()
    });
    setIsEditModalOpen(true);
  };

  // Update service
  const updateService = async () => {
    if (!currentEditId) return;

    const payload = {
      serviceName: editFormData.serviceName,
      description: editFormData.serviceDescription,
      serviceType: editFormData.serviceType,
      basePrice: parseInt(editFormData.basePrice) || 0
    };

    try {
      await updateAMCService(currentEditId, payload);
      toast.success('Service updated successfully!');
      setIsEditModalOpen(false);
      setCurrentEditId(null);
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  // Delete service
  const deleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteAMCService(id);
        toast.success('Service deleted successfully!');
        if (id === currentEditId) {
          setIsEditModalOpen(false);
          setCurrentEditId(null);
        }
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  // Get price text for display
  const getPriceText = (service) => {
    return `₹${service.basePrice || 0}`;
  };

  // Scroll to form
  const scrollToForm = () => {
    const formElement = document.getElementById('serviceForm');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('serviceNameInput').focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Premium Header */}
      <div className="bg-white px-6 py-6 mb-6">
        <div className="flex items-center gap-3">
          <Cog className="text-blue-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] tracking-tight">AMC Services Management</h1>
            <p className="text-sm text-slate-500 font-medium font-inter mt-1">Add and manage AMC services and visits</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Left Column: Add New Service Form */}
          <div className="w-full lg:w-[55%]">
            <div className="bg-white rounded border border-slate-200 overflow-hidden">
              <div className="bg-[#0c6baf] px-4 py-3 flex items-center gap-2">
                <PlusCircle size={18} className="text-slate-800 bg-[#0c6baf] text-slate-800 rounded-full bg-slate-800 text-[#0c6baf]" style={{ fill: "#1e293b", stroke: "#0c6baf" }}/>
                <h5 className="text-[#1e293b] font-bold text-lg">Add New AMC Service</h5>
              </div>
              <div className="p-6">
                <form id="serviceForm" onSubmit={addService}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Service Name</label>
                      <input
                        type="text"
                        id="serviceNameInput"
                        name="serviceName"
                        value={formData.serviceName}
                        onChange={handleInputChange}
                        placeholder="Enter service name (e.g., Cleaning, Maintenance)"
                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Service Description</label>
                      <textarea
                        name="serviceDescription"
                        value={formData.serviceDescription}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter service description"
                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Service Type</label>
                      <div className="relative">
                        <select
                          name="serviceType"
                          value={formData.serviceType}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none pr-10"
                        >
                          <option value="regular">Regular Service</option>
                          <option value="preventive">Preventive Maintenance</option>
                          <option value="emergency">Emergency Service</option>
                          <option value="special">Special Service</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Base Price (₹)</label>
                        <input
                          type="number"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                  </div>



                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-[#6c7b8e] text-white text-sm font-bold rounded hover:bg-[#5b6a7a] transition-all"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2 bg-[#0c6baf] text-white text-sm font-bold rounded shadow hover:bg-[#0a5890] transition-all"
                    >
                      <PlusCircle size={16} />
                      Add Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Services Summary */}
          <div className="w-full lg:w-[45%]">
            <div className="bg-white rounded border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="bg-[#28a745] px-4 py-3 flex items-center justify-between">
                <h5 className="text-white font-bold text-lg flex items-center gap-2">
                  <List size={20} />
                  AMC Services Summary
                </h5>
                <span className="text-sm font-bold text-slate-800 bg-white px-3 py-1 rounded">
                  {services.length} Services
                </span>
              </div>

              <div className="p-6 flex-1 overflow-y-auto no-scrollbar max-h-[700px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="animate-spin text-emerald-500 mb-4" size={40} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hydrating Summary...</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                      <Package className="text-slate-300" size={32} />
                    </div>
                    <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider">Inventory Empty</h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">No AMC services have been defined in the system yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service._id} className="bg-white border border-slate-200 rounded p-5 relative">
                        <div className="flex justify-between items-start mb-1">
                          <h6 className="text-lg font-bold text-[#1e293b]">{service.serviceName}</h6>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editService(service._id)}
                              className="text-[#ffc107] hover:text-yellow-600 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteService(service._id)}
                              className="text-[#dc3545] hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-3">
                          {service.description || 'Standard solar maintenance protocol.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="bg-[#6c7b8e] text-white text-xs font-bold px-2 py-1 rounded">
                            {service.serviceType}
                          </span>
                        </div>



                        <div className="flex items-baseline gap-1 text-slate-800 font-bold">
                          <span>₹{service.basePrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mt-6 mb-12 w-full overflow-hidden">
          <div className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
              <div className="flex items-center gap-2">
                <List size={20} className="text-slate-800" />
                <h5 className="text-lg font-bold text-slate-800">All AMC Services</h5>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-bold text-[#0c6baf] hover:text-[#0a5890] transition-colors"
                onClick={scrollToForm}
              >
                <PlusCircle size={16} />
                Add New Service
              </button>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">#</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">Service Name</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">Type</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">Price</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">Description</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {services.map((service, index) => (
                      <tr key={service._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-800">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <h6 className="text-sm font-bold text-slate-800">{service.serviceName}</h6>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 bg-[#6c7b8e] text-white text-xs font-bold rounded">
                            {service.serviceType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-800">₹{service.basePrice?.toLocaleString()}</span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px]">
                          {service.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <button
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#ffc107] text-white rounded text-xs font-bold hover:bg-yellow-500 transition-colors"
                              onClick={() => editService(service._id)}
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                            <button
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#dc3545] text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                              onClick={() => deleteService(service._id)}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Edit Service Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#f39c12] px-6 py-4 flex justify-between items-center shrink-0">
              <h3 className="text-white text-lg font-bold tracking-tight">SERVICE ITEM REFINEMENT</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded text-white hover:bg-black/10 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <form id="editForm">
                <input type="hidden" id="editServiceId" value={currentEditId || ''} />

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase">Service Identity</label>
                    <input
                      type="text"
                      name="serviceName"
                      value={editFormData.serviceName}
                      onChange={handleEditInputChange}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase">Service Scope Definition</label>
                    <textarea
                      name="serviceDescription"
                      value={editFormData.serviceDescription}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase">Service Classification</label>
                      <div className="relative">
                        <select
                          name="serviceType"
                          value={editFormData.serviceType}
                          onChange={handleEditInputChange}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 appearance-none pr-10"
                        >
                          <option value="regular">Regular Service</option>
                          <option value="preventive">Preventive Maintenance</option>
                          <option value="emergency">Emergency Service</option>
                          <option value="special">Special Service</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase">Base Price (₹)</label>
                      <input
                        type="number"
                        name="basePrice"
                        value={editFormData.basePrice}
                        onChange={handleEditInputChange}
                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                </div>



                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={updateService}
                    className="px-6 py-2 bg-[#f39c12] text-white text-sm font-bold rounded hover:bg-[#d68910] transition-colors uppercase tracking-wider"
                  >
                    Update Registry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmcServices;