import React, { useState, useEffect } from 'react';
import { projectApi } from '../../../../services/project/projectApi';
import {
  Tags,
  Search,
  Plus,
  Save,
  Edit,
  Trash2,
  CheckSquare,
  FileText,
  Home,
  Building,
  Filter,
  Calendar,
  User,
  MapPin,
  Phone,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  DollarSign,
  Settings,
  AlertCircle,
  Zap
} from 'lucide-react';

export default function PlaceholderNameSetting() {
  // State for placeholders
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaceholder, setSelectedPlaceholder] = useState('');
  const [placeholders, setPlaceholders] = useState([]); // Array of objects
  const [allPlaceholders, setAllPlaceholders] = useState([]); // All placeholders from DB
  const [editingPlaceholder, setEditingPlaceholder] = useState(null);
  const [placeholderKey, setPlaceholderKey] = useState('');
  const [placeholderValue, setPlaceholderValue] = useState('');
  const [placeholderNumber, setPlaceholderNumber] = useState(1);
  const [selectedDbField, setSelectedDbField] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Configuration and Step states (Mirrored from DocumentationSetting)
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [allSavedConfigs, setAllSavedConfigs] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [allJourneyStages, setAllJourneyStages] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // New controlled selection states
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [matchingSuggestions, setMatchingSuggestions] = useState([]);
  const [finalSelectedKey, setFinalSelectedKey] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');

  // Available suggestions - expanded with entity-specific variations
  const [availableSuggestions, setAvailableSuggestions] = useState([
    "Project Type", "Sub Project Type", "Date", "Company Name (Admin)", "Company Name (Client)",
    "Client Name", "Vendor Name", "Supervisor Name", "Authorized Person", "Partner Name",
    "Organization Name", "Firm Name", "Representative Name", "Entity Name", "Corporate Office Name",
    "Client Address", "Client Mobile", "Client Email", "Cluster", "Vendor Phone", "Supervisor Mobile",
    "Completion Date", "Approval Authority", "System Capacity", "Annual Production",
    "Project Cost", "Subsidy Amount", "Subsidy Authority", "Installation Date",
    "Warranty Period", "Maintenance Schedule", "Payment Terms", "Contract Duration",
    "Admin Phone", "Admin Email", "Admin Address", "Client City", "Client State", "Project ID", "Application Number"
  ]);

  const quickKeywords = [
    { label: 'Name', icon: <User className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: 'Mobile', icon: <Phone className="w-4 h-4" />, color: 'bg-green-50 text-green-600 border-green-200' },
    { label: 'Email', icon: <FileText className="w-4 h-4" />, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { label: 'Address', icon: <MapPin className="w-4 h-4" />, color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { label: 'Date', icon: <Calendar className="w-4 h-4" />, color: 'bg-red-50 text-red-600 border-red-200' },
    { label: 'Cost', icon: <DollarSign className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { label: 'Capacity', icon: <Zap className="w-4 h-4" />, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  ];

  const [dbFieldsList, setDbFieldsList] = useState([
    { label: 'Project ID', value: 'projectId' },
    { label: 'Project Name', value: 'projectName' },
    { label: 'Category', value: 'category' },
    { label: 'Project Type', value: 'projectType' },
    { label: 'Sub Project Type', value: 'subProjectType' },
    { label: 'Total KW (System Capacity)', value: 'totalKW' },
    { label: 'Client Name', value: 'authorizedPersonName' },
    { label: 'Client Mobile', value: 'mobile' },
    { label: 'Client Email', value: 'email' },
    { label: 'Client Address', value: 'address' },
    { label: 'Installation Date', value: 'installationDate' },
    { label: 'Consumer Number', value: 'consumerNumber' },
    { label: 'Due Date', value: 'dueDate' },
    { label: 'Project Cost', value: 'totalAmount' },
    { label: 'Commission', value: 'commission' },
    { label: 'Project Status', value: 'status' }
  ]);

  // Initialize data
  useEffect(() => {
    loadInitialData();
    fetchGlobalSuggestions();
  }, []);

  const loadInitialData = async () => {
    try {
      const [allConfigs, stages] = await Promise.all([
        projectApi.getConfigurations(),
        projectApi.getJourneyStages()
      ]);

      setAllJourneyStages(stages);

      // Dynamically build dbFields from static ones + stage fields
      const initialDbFields = [
        { label: 'Project ID', value: 'projectId' },
        { label: 'Project Name', value: 'projectName' },
        { label: 'Category', value: 'category' },
        { label: 'Project Type', value: 'projectType' },
        { label: 'Sub Project Type', value: 'subProjectType' },
        { label: 'Total KW (System Capacity)', value: 'totalKW' },
        { label: 'Client Name', value: 'authorizedPersonName' },
        { label: 'Client Mobile', value: 'mobile' },
        { label: 'Client Email', value: 'email' },
        { label: 'Client Address', value: 'address' },
        { label: 'Installation Date', value: 'installationDate' },
        { label: 'Consumer Number', value: 'consumerNumber' },
        { label: 'Due Date', value: 'dueDate' },
        { label: 'Project Cost', value: 'totalAmount' },
        { label: 'Commission', value: 'commission' },
        { label: 'Project Status', value: 'status' }
      ];

      const stageFields = [];
      stages.forEach(stage => {
        if (stage.fields && Array.isArray(stage.fields)) {
          stage.fields.forEach(field => {
            const fieldName = typeof field === 'object' ? (field.name || field.label) : field;
            if (fieldName && !initialDbFields.find(f => f.label === fieldName) && !stageFields.find(f => f.label === fieldName)) {
              stageFields.push({ label: fieldName, value: fieldName });
            }
          });
        }
      });
      
      setDbFieldsList([...initialDbFields, ...stageFields]);

      // Group configurations (same logic as DocumentationSetting) to prevent duplication in dropdown
      if (allConfigs && Array.isArray(allConfigs)) {
        const uniqueConfigs = new Map();

        allConfigs.forEach(c => {
          if (!c.configKey) return;
          const name = c.configValue?.configName || c.configKey.replace('projectConfig_', '').replace(/_/g, ' ');

          // Use name as key to ensure unique entries in the dropdown
          uniqueConfigs.set(name, {
            id: c._id,
            key: c.configKey,
            name: name,
            value: c.configValue
          });
        });

        const configList = Array.from(uniqueConfigs.values());
        setAllSavedConfigs(configList);

        // Auto-select first config if available
        if (configList.length > 0) setSelectedConfigId(configList[0].id);
      }

      // Initially show all stages as default
      setWorkflowSteps(stages);
      if (stages.length > 0) setSelectedStep(stages[0]);

      // Fetch all placeholders
      fetchPlaceholders();
    } catch (e) {
      console.error("Initialization error", e);
    }
  };

  const fetchPlaceholders = async () => {
    try {
      const data = await projectApi.getPlaceholders();
      setAllPlaceholders(data);
      updateVisiblePlaceholders(data, selectedStep);
    } catch (error) { console.error(error); }
  };

  const fetchGlobalSuggestions = async () => {
    try {
      const data = await projectApi.getPlaceholders(); // Assuming this fetches all placeholders
      const newSuggestions = data.map(p => p.labelKey);
      setAvailableSuggestions(prev => [...new Set([...prev, ...newSuggestions])]);
    } catch (error) {
      console.error("Error fetching global suggestions:", error);
    }
  };

  const updateVisiblePlaceholders = (all, step) => {
    if (!step) {
      setPlaceholders(all);
      return;
    }
    const stepName = step.name || step.title;
    // Filter placeholders by step if they are scoped, otherwise show all matching current config?
    // For now, let's keep it simple: show all added placeholders, or add 'step' field to them.
    setPlaceholders(all);
  };

  const handleConfigChange = (id) => {
    setSelectedConfigId(id);
  };

  useEffect(() => {
    if (selectedConfigId) {
      updateDynamicUI(selectedConfigId);
    }
  }, [selectedConfigId, allSavedConfigs]);

  const updateDynamicUI = (configId) => {
    const configObj = allSavedConfigs.find(c => c.id === configId);
    const config = configObj?.value;
    if (config && config.selectedSteps) {
      const activeSteps = config.selectedSteps.map(name => {
        const stage = allJourneyStages.find(s => s.name === name || s.title === name);
        return stage || { title: name, name: name };
      });
      setWorkflowSteps(activeSteps);
      if (activeSteps.length > 0) setSelectedStep(activeSteps[0]);
    } else {
      setWorkflowSteps(allJourneyStages);
    }
  };

  const handleAddPlaceholderByValue = (value) => {
    if (!value) return;
    processPlaceholderSearch(value);
  };

  const processPlaceholderSearch = (searchVal) => {
    const stepName = selectedStep?.name || selectedStep?.title || '';
    if (!stepName) {
      alert('Please select a project management step card first');
      return;
    }

    // --- ENHANCED SEMANTIC MATCHING LOGIC ---
    // 1. Extract the core keyword (last word)
    const words = searchVal.trim().toLowerCase().split(/\s+/);
    const primaryKeyword = words[words.length - 1];
    setCurrentKeyword(searchVal.split(' ').pop()); // For UI display

    // 2. Define deep semantic field-type synonyms for broader matching
    const semanticSynonyms = {
      "name": ["name", "organization", "firm", "person", "representative", "authorized", "corporate", "office", "head"],
      "cost": ["cost", "amount", "price", "payment", "total", "value", "balance", "rate", "tax", "fee", "expense", "budget", "billing"],
      "amount": ["amount", "cost", "price", "payment", "total", "value", "tax", "gst", "subsidy", "finance"],
      "capacity": ["capacity", "kw", "size", "production", "generation", "system", "power", "load", "panel", "module", "string", "ac", "dc"],
      "date": ["date", "schedule", "deadline", "timeline", "validity", "expiry", "time", "day", "month", "year", "duration", "period"],
      "mobile": ["mobile", "phone", "contact", "calling", "whatsapp", "tele", "number", "sms"],
      "phone": ["phone", "mobile", "contact", "calling", "tele", "whatsapp"],
      "number": ["number", "mobile", "phone", "contact", "tele", "pin", "id", "code", "reference", "application", "consumer"],
      "address": ["address", "location", "site", "premises", "area", "point", "landmark", "city", "state", "pincode", "village", "taluka", "district"]
    };

    // 3. Identify all related terms for this field type
    const lowerKey = primaryKeyword.toLowerCase();
    const relatedTerms = [lowerKey];
    if (semanticSynonyms[lowerKey]) {
      relatedTerms.push(...semanticSynonyms[lowerKey]);
    }

    // 4. Fetch all available fields that match the deep semantic cluster (Focus on Data Type ONLY)
    const matches = availableSuggestions.filter(s => {
      const suggestionLower = s.toLowerCase();
      // Match if the suggestion contains ANY of our related semantic terms deeply
      return relatedTerms.some(term => {
        return suggestionLower.includes(term);
      });
    });

    // Sort to keep perfect matches at the top for better UX
    matches.sort((a, b) => {
      const aContains = a.toLowerCase().includes(lowerKey);
      const bContains = b.toLowerCase().includes(lowerKey);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      return a.localeCompare(b);
    });

    // 5. Filter out duplicates specifically for the currently selected step
    const currentStepPlaceholders = placeholders.filter(p => p.stepName === stepName);
    const existingKeys = new Set(currentStepPlaceholders.map(p => p.labelKey));
    const uniqueMatches = matches.filter(m => !existingKeys.has(m));

    if (uniqueMatches.length === 0) {
      alert(`No additional placeholders found matching keyword Cluster "${primaryKeyword}" for this step. All relevant fields might already be added.`);
      return;
    }

    // Centered Selection flow
    setMatchingSuggestions(uniqueMatches);
    setFinalSelectedKey(uniqueMatches[0]);
    setShowSelectionModal(true);
  };

  const handleAddPlaceholder = async () => {
    if ((!selectedPlaceholder && !isAddingNew) || (isAddingNew && !placeholderKey)) {
      alert('Please enter or select a placeholder key');
      return;
    }

    const stepName = selectedStep?.name || selectedStep?.title || '';
    if (!stepName) {
      alert('Please select a project management step card first');
      return;
    }

    // If adding a NEW custom placeholder, keep the modal flow for detailed entry
    if (isAddingNew) {
      const exists = placeholders.find(p => p.labelKey === placeholderKey && p.stepName === stepName);
      if (exists) {
        alert('Placeholder key already exists for this step');
        return;
      }
      setEditingPlaceholder(null);
      setPlaceholderValue('');
      setPlaceholderNumber(placeholders.length + 1);
      setIsModalOpen(true);
      return;
    }

    processPlaceholderSearch(selectedPlaceholder);
  };

  const handleFinalAdd = async () => {
    if (!finalSelectedKey) return;

    const stepName = selectedStep?.name || selectedStep?.title || '';
    const matchingDbField = dbFieldsList.find(f => f.label.toLowerCase() === finalSelectedKey.toLowerCase())?.value || '';

    try {
      await projectApi.savePlaceholder({
        labelKey: finalSelectedKey,
        labelValue: finalSelectedKey,
        number: placeholders.length + 1,
        dbField: matchingDbField,
        configId: selectedConfigId,
        stepName: stepName
      });
      await fetchPlaceholders();
      setShowSelectionModal(false);
      setSelectedPlaceholder('');
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to add placeholder. Please try again.");
    }
  };

  const handleEditPlaceholder = (placeholder) => {
    setEditingPlaceholder(placeholder);
    setPlaceholderKey(placeholder.labelKey);
    setPlaceholderValue(placeholder.labelValue || '');
    setPlaceholderNumber(placeholder.number || 1);
    setIsModalOpen(true);
  };

  const handleDeletePlaceholder = async (id) => {
    if (window.confirm(`Are you sure you want to delete this placeholder?`)) {
      try {
        await projectApi.deletePlaceholder(id);
        setPlaceholders(placeholders.filter(p => p._id !== id));
      } catch (e) { console.error(e); }
    }
  };

  const handleSavePlaceholder = async () => {
    try {
      const payload = {
        labelKey: placeholderKey,
        labelValue: placeholderValue,
        number: parseInt(placeholderNumber),
        dbField: selectedDbField,
        configId: selectedConfigId,
        stepName: selectedStep?.name || selectedStep?.title || ''
      };

      await projectApi.savePlaceholder(payload);
      fetchPlaceholders();
      setIsModalOpen(false);
      resetModal();
    } catch (e) { console.error(e); }
  };

  const resetModal = () => {
    setEditingPlaceholder(null);
    setPlaceholderKey('');
    setPlaceholderValue('');
    setPlaceholderNumber(1);
    setSelectedDbField('');
    setIsAddingNew(false);
  };

  // Filtered placeholders (by search)
  const filteredPlaceholders = placeholders.filter(p =>
    p.labelKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header (Same Style as DocumentationSetting) */}
        <header className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Tags className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Placeholder Name Settings</h1>
                <p className="text-gray-600 font-medium">Manage placeholders used in project journey templates</p>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Project Configuration (Mirrored from DocumentationSetting) */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
              <Settings className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-[#1e3a8a]">Project Configuration</h2>
            </div>
            <div className="max-w-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">Select Project Journey Configuration</label>
              <select
                value={selectedConfigId}
                onChange={(e) => handleConfigChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              >
                <option value="">Select Configuration</option>
                {allSavedConfigs.map((cfg) => (
                  <option key={cfg.id} value={cfg.id}>{cfg.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Management Steps (Mirrored from DocumentationSetting) */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-[#1e3a8a]">Project Management Steps (Select to manage placeholders)</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {workflowSteps.map((step, index) => {
                const stepName = step.name || step.title;
                const isActive = (selectedStep?.name || selectedStep?.title) === stepName;
                return (
                  <div
                    key={step._id || stepName || index}
                    onClick={() => setSelectedStep(step)}
                    className={`cursor-pointer group relative p-5 rounded-2xl transition-all duration-300 transform h-full flex flex-col items-center justify-center border-2 
                      ${isActive
                        ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-200 scale-105'
                        : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-lg'}`}
                  >
                    <p className={`text-[11px] font-bold uppercase tracking-[0.1em] text-center mb-2 transition-colors duration-300
                      ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {stepName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placeholder Management Section (Modified to include Step info) */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Tags className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Manage Placeholders for: <span className="text-blue-600 font-black ml-1">{selectedStep?.name || selectedStep?.title || 'General'}</span>
                </h2>
              </div>
            </div>

            {/* Search Placeholders */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search placeholders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Add Placeholder Form */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col space-y-6">
                  {/* Quick Pick Keywords */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                      Quick Keyword Suggestion
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickKeywords.map((kw, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedPlaceholder(kw.label);
                            // Auto trigger search if selected
                            setTimeout(() => handleAddPlaceholderByValue(kw.label), 10);
                          }}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm ${kw.color}`}
                        >
                          {kw.icon}
                          <span>{kw.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search/Select Area */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setIsAddingNew(false)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all
                            ${!isAddingNew ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-400 border border-gray-100'}`}
                        >Search & Link</button>
                        <button
                          onClick={() => setIsAddingNew(true)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all
                            ${isAddingNew ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-400 border border-gray-100'}`}
                        >Create Custom</button>
                      </div>

                      {!isAddingNew ? (
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                          </div>
                          <select
                            className="block w-full pl-11 pr-10 py-4 border-2 border-gray-100 bg-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={selectedPlaceholder}
                            onChange={(e) => setSelectedPlaceholder(e.target.value)}
                          >
                            <option value="">Search or select placeholder context...</option>
                            {availableSuggestions.map((placeholder, index) => (
                              <option key={index} value={placeholder}>
                                {placeholder}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Plus className="h-4 w-4 text-blue-500" />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-4 border-2 border-gray-100 bg-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder-gray-300"
                            placeholder="Type custom placeholder name (e.g. Roof Direction)"
                            value={placeholderKey}
                            onChange={(e) => setPlaceholderKey(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={handleAddPlaceholder}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 focus:outline-none transition-all shadow-xl shadow-blue-200 group h-[56px]"
                      >
                        {isAddingNew ? <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> : <Search className="w-5 h-5 mr-2" />}
                        {isAddingNew ? 'Create' : 'Find Matches'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            {/* Placeholder List */}
            <div className="max-h-[500px] overflow-y-auto mb-6">
              {filteredPlaceholders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <Tags className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No placeholders found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'Add your first placeholder using the form above'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPlaceholders.map((p) => (
                    <div
                      key={p._id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{p.labelKey}</div>
                        <div className="text-sm text-blue-600">
                          Value: {p.labelValue || 'No value set'}
                        </div>
                      </div>
                      <div className="flex space-x-2 items-center">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded mx-2">Seq: {p.number}</span>
                        <button
                          onClick={() => handleEditPlaceholder(p)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlaceholder(p._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600 font-medium italic">
                {filteredPlaceholders.length} placeholder{filteredPlaceholders.length !== 1 ? 's' : ''} configured for this step
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Placeholder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Edit Placeholder</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placeholder Name
                    </label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                      value={placeholderKey}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">
                      Map to Database Field (Optional)
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                      value={selectedDbField}
                      onChange={(e) => setSelectedDbField(e.target.value)}
                    >
                      <option value="">Select database field to link</option>
                      {dbFieldsList.map((f, i) => (
                        <option key={i} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-gray-500 italic">If linked, this placeholder will be automatically replaced with real project data during document generation.</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-dashed border-blue-200">
                    <div className="text-sm font-bold text-blue-800 mb-2">Live Preview Example:</div>
                    <div className="text-sm text-gray-700 font-medium">
                      The template tag <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 tracking-tight">[{placeholderKey}]</span> will be converted to:
                      <span className="ml-2 font-black text-green-600">{placeholderValue || '[Value]'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSavePlaceholder}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Placeholder
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controlled Placeholder Selection Modal */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-60 backdrop-blur-sm"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-100">
              <div className="bg-white px-8 pt-8 pb-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                      <Filter className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 leading-none tracking-tight">Select Placeholder</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Refine your choice</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSelectionModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <Plus className="h-6 w-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                      Matching Keyword
                    </label>
                    <div className="px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 font-bold flex items-center group">
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black mr-3 shadow-lg shadow-blue-100">KEY</span>
                      <span className="text-lg">{currentKeyword}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                      Choose Field to Add
                    </label>
                    <select
                      className="block w-full px-5 py-4 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold bg-white appearance-none cursor-pointer"
                      value={finalSelectedKey}
                      onChange={(e) => setFinalSelectedKey(e.target.value)}
                    >
                      {matchingSuggestions.map((m, i) => (
                        <option key={i} value={m}>{m}</option>
                      ))}
                    </select>
                    <p className="mt-3 text-[10px] text-gray-400 font-medium italic px-1">
                      Only the selected field will be added to "{selectedStep?.name || selectedStep?.title}".
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-8 py-5 flex flex-row-reverse gap-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleFinalAdd}
                  className="flex-1 inline-flex justify-center items-center px-6 py-4 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 focus:outline-none transition-all shadow-xl shadow-blue-200"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Confirm Selection
                </button>
                <button
                  type="button"
                  onClick={() => setShowSelectionModal(false)}
                  className="flex-1 inline-flex justify-center items-center px-6 py-4 bg-white border-2 border-gray-200 text-gray-600 text-sm font-black rounded-2xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}