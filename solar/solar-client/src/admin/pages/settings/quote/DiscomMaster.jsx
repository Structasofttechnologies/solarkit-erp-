import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Building2,
  CheckCircle,
  Edit2,
  Trash2,
  Save,
  X,
  Globe,
  Map,
  Navigation
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import {
  createDiscom,
  getDiscoms,
  updateDiscom,
  deleteDiscom,
  getQuoteSettings
} from '../../../../services/quote/quoteApi';
import { getProjectCategoryMappings } from '../../../../services/core/masterApi';
import toast from 'react-hot-toast';

export default function DiscomMaster() {
  const [discomName, setDiscomName] = useState('');
  const [discomId, setDiscomId] = useState(null); // For editing
  const [showDiscomSection, setShowDiscomSection] = useState(false);
  const [showProjectTable, setShowProjectTable] = useState(false);

  // Data for the Input Table (derived from QuoteSettings)
  const [projectData, setProjectData] = useState([]);

  // Existing Discoms for the selected filters
  const [existingDiscoms, setExistingDiscoms] = useState([]);
  const [editingDiscom, setEditingDiscom] = useState(null);

  const {
    countries, states, clusters, districts,
    selectedCountry, setSelectedCountry,
    selectedState, setSelectedState,
    selectedCluster, setSelectedCluster,
    selectedDistrict, setSelectedDistrict,
    loading: locationsLoading
  } = useLocations();

  const selectedStateName = states.find((s) => s._id === selectedState)?.name || '';

  // Fetch Project Category Mappings to populate Project Types
  const fetchProjectTemplates = async () => {
    try {
      const params = {
        stateId: selectedState,
        clusterId: selectedCluster,
        districtId: selectedDistrict
      };
      
      // Only fetch if at least state is selected
      if (!selectedState) {
        setProjectData([]);
        return;
      }

      const res = await getProjectCategoryMappings(params);
      const rawData = res?.data || [];
      
      // If we are editing, we might want to NOT overwrite, but the user requested dynamic from 2nd image.
      // So we fetch the mappings and create the template.
      const templates = rawData.map((m, index) => {
        const matchingProject = editingDiscom?.projects?.find(p => 
            p.category === (m.categoryId?.name || '-') &&
            p.subCategory === (m.subCategoryId?.name || '-') &&
            p.projectType === `${m.projectTypeFrom} to ${m.projectTypeTo} kW` &&
            p.subProjectType === (m.subProjectTypeId?.name || 'On-Grid')
        );

        return {
          id: m._id || index,
          category: m.categoryId?.name || '-',
          subCategory: m.subCategoryId?.name || '-',
          projectType: `${m.projectTypeFrom} to ${m.projectTypeTo} kW`,
          subProjectType: m.subProjectTypeId?.name || 'On-Grid',
          unitPrice: matchingProject ? matchingProject.unitPrice : '',
          billTariff: matchingProject ? matchingProject.billTariff : '',
          isEditing: false
        };
      });
      setProjectData(templates);
    } catch (error) {
      console.error("Error fetching project mappings:", error);
      toast.error("Failed to load dynamic project templates");
    }
  };

  useEffect(() => {
    fetchProjectTemplates();
  }, [selectedState, selectedCluster, selectedDistrict, editingDiscom]);

  // Fetch Existing Discoms when Filters change
  useEffect(() => {
    fetchDiscoms();
  }, [selectedCountry, selectedState, selectedCluster, selectedDistrict]);

  const fetchDiscoms = async () => {
    try {
      const params = {
        country: selectedCountry,
        state: selectedState,
        cluster: selectedCluster,
        district: selectedDistrict
      };

      // Filter out empty params
      const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));

      const data = await getDiscoms(cleanParams);
      // Backend returns array of Discoms
      setExistingDiscoms(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error("Error fetching discoms:", error);
      if (selectedState) toast.error("Failed to load existing discoms");
    }
  };

  // Handle Location selection update
  useEffect(() => {
    if (selectedState) {
        setShowDiscomSection(true);
    } else {
        setShowDiscomSection(false);
    }
  }, [selectedState]);

  // Handle show project table
  const handleShowProjectTable = () => {
    if (!discomName.trim()) {
      alert('Enter Discom Name');
      return;
    }
    setShowProjectTable(true);
  };

  // Handle project data change
  const handleProjectDataChange = (id, field, value) => {
    setProjectData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle Save Discom (Create or Update)
  const handleSaveDiscom = async () => {
    if (!discomName.trim()) {
      toast.error("Please enter Discom Name");
      return;
    }

    if (!selectedState) {
        toast.error("Please select a state first");
        return;
    }

    const payload = {
      state: selectedState,
      country: selectedCountry,
      cluster: selectedCluster,
      district: selectedDistrict,
      name: discomName,
      projects: projectData.map(item => ({
        category: item.category,
        subCategory: item.subCategory,
        projectType: item.projectType,
        subProjectType: item.subProjectType,
        unitPrice: parseFloat(item.unitPrice) || 0,
        billTariff: parseFloat(item.billTariff) || 0
      }))
    };

    try {
      if (discomId) {
        await updateDiscom(discomId, payload);
        toast.success("Discom updated successfully");
      } else {
        await createDiscom(payload);
        toast.success("Discom created successfully");
      }

      // Refresh list and reset form
      fetchDiscoms();
      setDiscomName('');
      setDiscomId(null);
      setEditingDiscom(null);
      setShowProjectTable(false);
      fetchProjectTemplates();

    } catch (error) {
      console.error("Error saving discom:", error);
      toast.error("Failed to save discom");
    }
  };

  // Edit Existing Discom
  const handleEditDiscom = (discom) => {
    setEditingDiscom(discom);
    setDiscomId(discom._id);
    setDiscomName(discom.name);
    setShowProjectTable(true);
    setShowDiscomSection(true);

    // Sync filters
    if (discom.country) setSelectedCountry(discom.country?._id || discom.country);
    if (discom.state) setSelectedState(discom.state?._id || discom.state);
    if (discom.cluster) setSelectedCluster(discom.cluster?._id || discom.cluster);
    if (discom.district) setSelectedDistrict(discom.district?._id || discom.district);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDiscom = async (id) => {
    if (window.confirm("Are you sure you want to delete this Discom?")) {
      try {
        await deleteDiscom(id);
        toast.success("Discom deleted successfully");
        fetchDiscoms();
        if (discomId === id) {
          setDiscomName('');
          setDiscomId(null);
          setEditingDiscom(null);
          setShowProjectTable(false);
        }
      } catch (error) {
        console.error("Error deleting discom:", error);
        toast.error("Failed to delete discom");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 w-full">
            <li className="inline-flex items-center w-full">
              <div className="inline-flex items-center bg-white p-4 shadow-sm rounded-lg w-full">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Building2 className="mr-3 text-blue-600" size={28} />
                  Discom Master
                </h3>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Hierarchy Selection Filters */}
      <div className="container mx-auto space-y-8 mb-12 bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-100/30 border border-blue-50/50">
        
        {/* Country Picker */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-blue-500" />
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select Country</h3>
            </div>
            <button 
              onClick={() => setSelectedCountry('')}
              className="text-[10px] font-bold text-gray-400 hover:text-blue-500 uppercase tracking-widest transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCountry('')}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                !selectedCountry 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
              }`}
            >
              ALL COUNTRIES
            </button>
            {countries.map(country => (
              <button
                key={country._id}
                onClick={() => setSelectedCountry(country._id)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                  selectedCountry === country._id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                  : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
                }`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </section>

        {/* State Picker */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-blue-500" />
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select State</h3>
            </div>
            <button 
              onClick={() => setSelectedState('')}
              className="text-[10px] font-bold text-gray-400 hover:text-blue-500 uppercase tracking-widest transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedState('')}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                !selectedState 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
              }`}
            >
              ALL STATES
            </button>
            {states.map(state => (
              <button
                key={state._id}
                onClick={() => setSelectedState(state._id)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                  selectedState === state._id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                  : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
                }`}
              >
                {state.name}
              </button>
            ))}
          </div>
        </section>

        {/* Cluster Picker */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Map size={18} className="text-blue-500" />
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select Cluster</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCluster('')}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                !selectedCluster 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
              }`}
            >
              ALL CLUSTERS
            </button>
            {clusters.map(cluster => (
              <button
                key={cluster._id}
                onClick={() => setSelectedCluster(cluster._id)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                  selectedCluster === cluster._id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                  : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
                }`}
              >
                {cluster.name}
              </button>
            ))}
          </div>
        </section>

        {/* District Picker */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-blue-500" />
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select District</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDistrict('')}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                !selectedDistrict 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
              }`}
            >
              ALL DISTRICTS
            </button>
            {districts.map(district => (
              <button
                key={district._id}
                onClick={() => setSelectedDistrict(district._id)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
                  selectedDistrict === district._id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105' 
                  : 'bg-white text-gray-400 border-gray-50 hover:border-blue-100 hover:text-gray-600'
                }`}
              >
                {district.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Discom Input Section */}
      {showDiscomSection && (
        <div className="container mx-auto mb-8 bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-xl font-bold text-gray-700 mb-4">
            {discomId ? 'Edit Discom' : 'Add New Discom'} for:
            <span className="ml-2 font-bold text-blue-600">{selectedStateName}</span>
          </h4>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Discom Name
            </label>
            <input
              type="text"
              value={discomName}
              onChange={(e) => setDiscomName(e.target.value)}
              placeholder="Enter Discom Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <button
            onClick={handleShowProjectTable}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition duration-200"
          >
            <CheckCircle className="mr-2" size={20} />
            {showProjectTable ? 'Refresh Project Types' : 'Save & project types'}
          </button>
        </div>
      )}

      {/* Project Type Table */}
      {showProjectTable && (
        <div className="container mx-auto mb-8 bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-xl font-bold text-gray-700 mb-6">Project Rate Configuration</h4>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="py-3 px-4 border-b text-left font-bold text-gray-700">Category</th>
                  <th className="py-3 px-4 border-b text-left font-bold text-gray-700">Sub Category</th>
                  <th className="py-3 px-4 border-b text-left font-bold text-gray-700">Project Type</th>
                  <th className="py-3 px-4 border-b text-left font-bold text-gray-700">Sub Project Type</th>
                  <th className="py-3 px-4 border-b text-left font-bold text-gray-700">Unit Price</th>
                  <th className="py-3 px-4 border-b text-left font-bold text-gray-700">Bill Tariff</th>
                </tr>
              </thead>
              <tbody>
                {projectData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="py-3 px-4 border-b">{item.category}</td>
                    <td className="py-3 px-4 border-b">{item.subCategory}</td>
                    <td className="py-3 px-4 border-b">{item.projectType}</td>
                    <td className="py-3 px-4 border-b">{item.subProjectType}</td>
                    <td className="py-3 px-4 border-b">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleProjectDataChange(item.id, 'unitPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-3 px-4 border-b">
                      <input
                        type="number"
                        value={item.billTariff}
                        onChange={(e) => handleProjectDataChange(item.id, 'billTariff', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveDiscom}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg mt-6 flex items-center"
          >
            <Save className="mr-2" size={20} />
            {discomId ? 'Update Discom' : 'Save Discom'}
          </button>
        </div>
      )}

      {/* Existing Discoms List - REVERTED TO IMAGE 2 STYLE */}
      {selectedState && (
        <div className="container mx-auto mb-8 bg-gray-50/50">
          <div className="flex flex-col space-y-4 mb-6">
            <button
              onClick={handleSaveDiscom}
              className="w-fit bg-[#1a202c] hover:bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200 text-sm"
            >
              Save Summary
            </button>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-bold text-[#1e293b]">Summary</h2>
              <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold mb-1">
                Found for {selectedStateName}: {existingDiscoms.length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#72b5f1]">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">#</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">Discom Name</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">Category</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">Sub Category</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">Project Type</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">Sub Project Type</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">Unit Price</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-blue-300/30">Bill Tariff</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-white uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {existingDiscoms.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-gray-500 italic">
                      No Discoms found for this selection.
                    </td>
                  </tr>
                ) : (
                  existingDiscoms.flatMap((discom, dIndex) => {
                    const projects = discom.projects && discom.projects.length > 0 ? discom.projects : [{}];
                    return projects.map((proj, pIndex) => (
                      <tr key={`${discom._id}-${pIndex}`} className="hover:bg-blue-50/30 transition-colors duration-200">
                        {pIndex === 0 ? (
                          <>
                            <td rowSpan={projects.length} className="px-4 py-5 whitespace-nowrap text-xs font-medium text-gray-600 border-r border-gray-100 align-top">
                              {dIndex + 1}
                            </td>
                            <td rowSpan={projects.length} className="px-4 py-5 whitespace-nowrap text-xs font-bold text-gray-800 border-r border-gray-100 align-top">
                              {discom.name}
                            </td>
                          </>
                        ) : null}
                        <td className="px-4 py-5 whitespace-nowrap text-xs font-medium text-gray-700 border-r border-gray-100">{proj.category || '-'}</td>
                        <td className="px-4 py-5 whitespace-nowrap text-xs font-medium text-gray-700 border-r border-gray-100">{proj.subCategory || '-'}</td>
                        <td className="px-4 py-5 whitespace-nowrap text-xs font-medium text-gray-700 border-r border-gray-100">{proj.projectType || '-'}</td>
                        <td className="px-4 py-5 whitespace-nowrap text-xs font-medium text-gray-700 border-r border-gray-100">{proj.subProjectType || '-'}</td>
                        <td className="px-4 py-5 whitespace-nowrap text-xs font-semibold text-gray-800 border-r border-gray-100">{proj.unitPrice || '-'}</td>
                        <td className="px-4 py-5 whitespace-nowrap text-xs font-semibold text-gray-800 border-r border-gray-100">{proj.billTariff || '-'}</td>
                        <td className="px-4 py-5 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center space-y-2">
                             <button
                               onClick={() => handleEditDiscom(discom)}
                               className="w-14 bg-[#ffc107] hover:bg-yellow-500 text-gray-800 text-[9px] font-bold py-1 px-1 rounded transition-colors shadow-sm"
                             >
                               Edit
                             </button>
                             <button
                               onClick={() => handleDeleteDiscom(discom._id)}
                               className="w-14 bg-[#dc3545] hover:bg-red-600 text-white text-[9px] font-bold py-1 px-1 rounded transition-colors shadow-sm"
                             >
                               Delete
                             </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}