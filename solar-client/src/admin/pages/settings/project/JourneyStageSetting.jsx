import React, { useState, useEffect } from 'react';
import {
  SolarPanel,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  List,
  Layout,
  FileText,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  AlertCircle
} from 'lucide-react';
import { projectApi } from '../../../../services/project/projectApi';

const JourneyStageSetting = () => {
  // State for project steps
  const [projectSteps, setProjectSteps] = useState([]);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(null);

  // Form states
  const [stepName, setStepName] = useState('');
  const [fieldName, setFieldName] = useState(''); // This is Form Name
  const [formInputs, setFormInputs] = useState([]); // Array of { label, type, required, options, order }

  // Modal states
  const [showEditStepModal, setShowEditStepModal] = useState(false);
  const [showEditFieldModal, setShowEditFieldModal] = useState(false);
  const [editStepName, setEditStepName] = useState('');
  const [editFieldName, setEditFieldName] = useState('');

  // Initialize with API data
  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const data = await projectApi.getJourneyStages();
      setProjectSteps(data);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  // Add a new step
  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!stepName.trim()) return;

    try {
      const newStepData = {
        name: stepName,
        fields: [],
        order: projectSteps.length + 1
      };
      const savedStep = await projectApi.createJourneyStage(newStepData);
      setProjectSteps([...projectSteps, savedStep]);
      setStepName('');
      selectStep(savedStep._id);
    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  // Select a step to manage its forms
  const selectStep = (stepId) => {
    setCurrentStepId(stepId);
  };

  // Get current step
  const getCurrentStep = () => {
    return projectSteps.find(step => step._id === currentStepId);
  };

  // Add a form to the current step
  const handleAddField = async () => {
    if (!fieldName.trim() || !currentStepId) return;

    const currentStep = getCurrentStep();
    if (!currentStep) return;

    const newForm = {
      name: fieldName,
      inputs: [],
      order: (currentStep.fields || []).length
    };

    const updatedFields = [...(currentStep.fields || []), newForm];

    try {
      const updatedStep = await projectApi.updateJourneyStage(currentStepId, { fields: updatedFields });
      const updatedSteps = projectSteps.map(step =>
        step._id === currentStepId ? updatedStep : step
      );
      setProjectSteps(updatedSteps);
      setFieldName('');
    } catch (error) {
      console.error('Error adding form:', error);
    }
  };

  // Open edit step modal
  const openEditStepModal = (step) => {
    setCurrentStepId(step._id);
    setEditStepName(step.name);
    setShowEditStepModal(true);
  };

  // Update a step
  const handleUpdateStep = async () => {
    if (!editStepName.trim() || !currentStepId) return;

    try {
      const updatedStep = await projectApi.updateJourneyStage(currentStepId, { name: editStepName });
      const updatedSteps = projectSteps.map(step =>
        step._id === currentStepId ? updatedStep : step
      );
      setProjectSteps(updatedSteps);
      setShowEditStepModal(false);
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  // Delete a step
  const handleDeleteStep = async () => {
    if (!currentStepId) return;

    try {
      await projectApi.deleteJourneyStage(currentStepId);
      const updatedSteps = projectSteps.filter(step => step._id !== currentStepId);
      setProjectSteps(updatedSteps);
      setCurrentStepId(null);
      setShowEditStepModal(false);
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  // Open edit form modal
  const openEditFieldModal = (form, index) => {
    setEditFieldName(form.name);
    setFormInputs(form.inputs || []);
    setCurrentFieldIndex(index);
    setShowEditFieldModal(true);
  };

  // Update a form and its inputs
  const handleUpdateField = async () => {
    if (!editFieldName.trim() || !currentStepId || currentFieldIndex === null) return;

    const currentStep = getCurrentStep();
    if (!currentStep) return;

    const updatedFields = [...(currentStep.fields || [])];
    updatedFields[currentFieldIndex] = { 
      ...updatedFields[currentFieldIndex], 
      name: editFieldName,
      inputs: formInputs 
    };

    try {
      const updatedStep = await projectApi.updateJourneyStage(currentStepId, { fields: updatedFields });
      const updatedSteps = projectSteps.map(step =>
        step._id === currentStepId ? updatedStep : step
      );
      setProjectSteps(updatedSteps);
      setShowEditFieldModal(false);
      setCurrentFieldIndex(null);
    } catch (error) {
      console.error('Error updating form:', error);
    }
  };

  // Delete a form
  const handleDeleteField = async () => {
    if (!currentStepId || currentFieldIndex === null) return;

    const currentStep = getCurrentStep();
    if (!currentStep) return;

    const updatedFields = currentStep.fields.filter((_, index) => index !== currentFieldIndex);

    try {
      const updatedStep = await projectApi.updateJourneyStage(currentStepId, { fields: updatedFields });
      const updatedSteps = projectSteps.map(step =>
        step._id === currentStepId ? updatedStep : step
      );
      setProjectSteps(updatedSteps);
      setShowEditFieldModal(false);
      setCurrentFieldIndex(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  // Render step item
  const renderStepItem = (step) => {
    const isActive = currentStepId === step._id;
    return (
      <div
        key={step._id}
        onClick={() => selectStep(step._id)}
        className={`bg-white rounded-lg p-4 mb-3 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 ${isActive
          ? 'border-green-400 bg-green-50'
          : 'border-blue-500'
          }`}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800 flex-1">{step.name}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditStepModal(step);
            }}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {(step.fields || []).length} Form{(step.fields || []).length !== 1 ? 's' : ''}
        </div>
      </div>
    );
  };

  // Render form item
  const renderFieldItem = (form, index) => {
    return (
      <div
        key={index}
        className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-4 mb-2 border border-transparent hover:border-blue-200 transition-all"
      >
        <div className="flex items-center space-x-3">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <div>
            <span className="font-bold text-gray-800">{form.name}</span>
            <div className="text-xs text-gray-400">
              {form.inputs?.length || 0} Dynamic Inputs
            </div>
          </div>
        </div>
        <button
          onClick={() => openEditFieldModal(form, index)}
          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg mb-8 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SolarPanel className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Project Journey Stage Management</h1>
              <p className="text-blue-100">Configure project workflow steps and forms</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Step</h2>
            <form onSubmit={handleAddStep}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Step Name</label>
                <input
                  type="text"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="Enter step name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Project Steps</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {projectSteps.length}
              </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {projectSteps.map(renderStepItem)}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Step Details</h2>
              <span className="text-gray-600">
                {currentStep ? currentStep.name : 'Select a step to manage forms'}
              </span>
            </div>

            {!currentStep ? (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">No Step Selected</h3>
                <p className="text-gray-400">Select a step from the list to manage its forms</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      placeholder="Enter form name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddField}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Form</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Forms ({(currentStep.fields || []).length})
                  </h3>
                  <div className="space-y-2">
                    {(currentStep.fields || []).map(renderFieldItem)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Step Modal */}
      {showEditStepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Edit Step</h3>
                <button onClick={() => setShowEditStepModal(false)}><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Step Name</label>
              <input
                type="text"
                value={editStepName}
                onChange={(e) => setEditStepName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="p-6 pt-0 flex justify-end space-x-3">
              <button onClick={handleDeleteStep} className="px-4 py-2 bg-red-500 text-white rounded-lg">Delete Step</button>
              <button onClick={handleUpdateStep} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Update Step</button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Form Modal */}
      {showEditFieldModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Layout className="w-6 h-6 text-blue-200" />
                  <h3 className="text-xl font-bold">Dynamic Form Configurator</h3>
                </div>
                <button onClick={() => setShowEditFieldModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Form Name</label>
                <input
                  type="text"
                  value={editFieldName}
                  onChange={(e) => setEditFieldName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="e.g. Agreement Upload"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-gray-700 uppercase tracking-tight text-sm">Form Inputs ({formInputs.length})</h4>
                  <button
                    onClick={() => setFormInputs([...formInputs, { label: '', type: 'text', required: false, options: [], order: formInputs.length }])}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-blue-700"
                  >
                    <Plus size={14} /> Add Dynamic Field
                  </button>
                </div>

                {formInputs.length === 0 ? (
                  <div className="py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                    <p>No dynamic fields configured yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formInputs.map((input, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                        <button 
                          onClick={() => setFormInputs(formInputs.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Field Label</label>
                            <input
                              type="text"
                              value={input.label}
                              onChange={(e) => {
                                const newInputs = [...formInputs];
                                newInputs[idx].label = e.target.value;
                                setFormInputs(newInputs);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                              placeholder="e.g. Customer Signature"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Field Type</label>
                            <select
                              value={input.type}
                              onChange={(e) => {
                                const newInputs = [...formInputs];
                                newInputs[idx].type = e.target.value;
                                setFormInputs(newInputs);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
                            >
                              <option value="text">Text Input</option>
                              <option value="textarea">Textarea</option>
                              <option value="upload">File Upload</option>
                              <option value="download">Download Document</option>
                              <option value="select">Dropdown / Select</option>
                              <option value="date">Date Picker</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={input.required}
                              onChange={(e) => {
                                const newInputs = [...formInputs];
                                newInputs[idx].required = e.target.checked;
                                setFormInputs(newInputs);
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-gray-600">Required Field</span>
                          </label>
                          {input.type === 'select' && (
                            <div className="flex-1 ml-4">
                              <input
                                type="text"
                                placeholder="Options (comma separated)"
                                value={input.options?.join(', ') || ''}
                                onChange={(e) => {
                                  const newInputs = [...formInputs];
                                  newInputs[idx].options = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                  setFormInputs(newInputs);
                                }}
                                className="w-full px-3 py-1.5 text-xs border border-blue-200 rounded-md focus:border-blue-500 outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
              <button
                onClick={handleDeleteField}
                className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <Trash2 size={18} /> Delete Form
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditFieldModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateField}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md"
                >
                  <Save size={18} className="inline mr-2" /> Save Form Config
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyStageSetting;