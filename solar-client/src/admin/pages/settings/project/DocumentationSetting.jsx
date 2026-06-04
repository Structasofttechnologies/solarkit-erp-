import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getProjects,
  getProjectStats
} from '../../../../services/project/projectService';
import toast from 'react-hot-toast';
import {
  FileText,
  Cog,
  ListChecks,
  File,
  Tag,
  Plus,
  Save,
  Edit,
  Trash2,
  X,
  Check,
  User,
  Calendar,
  Home,
  Phone,
  Building,
  UserCheck,
  Zap,
  DollarSign,
  Shield,
  Eye
} from 'lucide-react';
import { projectApi } from '../../../../services/project/projectApi';

const DocumentationSetting = () => {
  const navigate = useNavigate();
  // State for project settings (replaced with Config Selection)
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [allSavedConfigs, setAllSavedConfigs] = useState([]);
  const [configDetails, setConfigDetails] = useState(null);


  // Available suggestions - now strictly dynamic from the database (No hardcoded defaults)
  const [availableSuggestions, setAvailableSuggestions] = useState([]);

  const dbFields = [
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

  // State for workflow steps
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);

  // State for documents
  const [stepDocuments, setStepDocuments] = useState([]);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [isAddingDocument, setIsAddingDocument] = useState(false);

  // State for placeholders (Dynamic from API)
  const [selectedPlaceholder, setSelectedPlaceholder] = useState('');
  const [placeholders, setPlaceholders] = useState([]); // Array of objects { _id, labelKey, labelValue, number }
  const [allPlaceholders, setAllPlaceholders] = useState([]); // Global master list for filtering
  const [showModal, setShowModal] = useState(false);
  const [modalPlaceholder, setModalPlaceholder] = useState(null); // Object to edit
  const [modalValue, setModalValue] = useState('');
  const [modalNumber, setModalNumber] = useState(1);
  const [addingPlaceholderName, setAddingPlaceholderName] = useState(''); // For adding NEW placeholder keys
  const [stageCounts, setStageCounts] = useState({});
  const [allJourneyStages, setAllJourneyStages] = useState([]); // All available stages from DB
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [templateContent, setTemplateContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(true);
  const [selectedDbField, setSelectedDbField] = useState('');
  const [sampleProject, setSampleProject] = useState(null);
  const [isPreviewWithData, setIsPreviewWithData] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [allGenerationResults, setAllGenerationResults] = useState({}); // Map: stepName -> result
  const [stepDocCounts, setStepDocCounts] = useState({});
  const [generatedDocCounts, setGeneratedDocCounts] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isGeneratorEditing, setIsGeneratorEditing] = useState(false);
  const [activeEditRecord, setActiveEditRecord] = useState(null); // { key, index }

  const DEFAULT_TEMPLATE = `For {{project_type}} - {{sub_project_type}}

This agreement is made on {{date}} between {{company_name}} (hereinafter referred to as "the Company") and {{client_name}} (hereinafter referred to as "the Client").

The Client, residing at {{client_address}} with contact number {{client_mobile}}, agrees to following terms and conditions for installation of a solar power system at their premises located in {{cluster}}.

The project will be executed by {{vendor_name}} and supervised by {{supervisor_name}}. The estimated completion date is {{completion_date}}.

All necessary approvals from {{approval_authority}} have been obtained. The system capacity is {{system_capacity}} kW with an estimated annual production of {{annual_production}} kWh.

The total project cost is {{project_cost}}, with a subsidy amount of {{subsidy_amount}} approved by {{subsidy_authority}}.`;

  const DEFAULT_SAMPLE_PROJECT = {
    projectName: 'Raj Patel Solar House',
    authorizedPersonName: 'Raj Patel',
    consumerNumber: '1234567890',
    mobile: '9876543210',
    email: 'raj.patel@example.com',
    address: '205, Green Valley, Ahmedabad, Gujarat',
    installationDate: '25 Jan 2026',
    totalKW: '5.0',
    category: 'Solar Rooftop',
    projectType: 'On-Grid',
    subProjectType: 'Residential',
    totalAmount: '2,50,000',
    dueDate: '10 Feb 2026'
  };

  // Initialize data
  useEffect(() => {
    loadInitialData();

    // Restore generation history (counts)
    const savedHistory = localStorage.getItem('generationHistory');
    if (savedHistory) {
      try {
        setGeneratedDocCounts(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error loading generation history", e);
      }
    }

    // Restore generation results per step (the summary cards)
    const savedResults = localStorage.getItem('allGenerationResults');
    if (savedResults) {
      try {
        const raw = JSON.parse(savedResults);
        // Migrate legacy single-object format to new array-history format if needed
        const migrated = {};
        Object.keys(raw).forEach(key => {
          if (raw[key]) {
            migrated[key] = Array.isArray(raw[key]) ? raw[key] : [raw[key]];
          }
        });
        setAllGenerationResults(migrated);
      } catch (e) {
        console.error("Error loading all generation results", e);
      }
    }
  }, []);



  useEffect(() => {
    if (selectedConfigId) {
      updateDynamicData(selectedConfigId);
    }
  }, [selectedConfigId, allSavedConfigs]);

  // Derived state: Automatically update dropdown suggestions from ALL fetched placeholders
  useEffect(() => {
    const dbKeys = allPlaceholders ? [...new Set(allPlaceholders.map(p => p.labelKey))] : [];
    setAvailableSuggestions(dbKeys.sort());
  }, [allPlaceholders]);

  // Re-run placeholder filtering whenever selectedStep changes
  useEffect(() => {
    if (selectedStep && allPlaceholders.length > 0) {
      filterStepPlaceholders(allPlaceholders, selectedStep, selectedConfigId);
    }
  }, [selectedStep, selectedConfigId, allPlaceholders]);

  const filterStepPlaceholders = (data, step, configId) => {
    const stepName = step?.name || step?.title || '';
    const filtered = data.filter(p =>
      p.configId === configId && p.stepName === stepName
    );
    setPlaceholders(filtered);
  };

  const updateDynamicData = async (configId) => {
    try {
      setIsLoadingStats(true);

      // 1. Fetch current config details
      const configObj = allSavedConfigs.find(c => c.id === configId);
      const config = configObj?.value;
      setConfigDetails(config);

      // Update template counts for this config
      fetchDocCounts(configObj?.key);

      // 2. Update workflow steps based on config
      if (config && config.selectedSteps && config.selectedSteps.length > 0) {
        const activeSteps = config.selectedSteps.map(name => {
          const stage = allJourneyStages.find(s => s.name === name || s.title === name);
          return stage || { title: name, name: name };
        });
        setWorkflowSteps(activeSteps);

        // Auto-select first step if none selected or current not in new set
        const currentTitle = selectedStep?.title || selectedStep?.name || selectedStep;
        if (!(selectedStep && activeSteps.find(s => (s.title || s.name) === currentTitle))) {
          if (activeSteps.length > 0) setSelectedStep(activeSteps[0]);
        }
      } else {
        // No steps in config? show all stages as fallback
        setWorkflowSteps(allJourneyStages);
      }

      // 4. Update the actual placeholders list for the right sidebar
      const stepName = selectedStep?.name || selectedStep?.title || '';
      const allFetchedPlaceholders = await projectApi.getPlaceholders();
      setAllPlaceholders(allFetchedPlaceholders); // Keep a master copy
      filterStepPlaceholders(allFetchedPlaceholders, selectedStep, configId);

    } catch (error) {
      console.error("Error updating dynamic data", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchDocCounts = async (configKey) => {
    try {
      const filters = configKey ? { configKey } : {};
      const allDocs = await projectApi.getProjectDocuments(filters);
      const counts = {};
      allDocs.forEach(doc => {
        counts[doc.stage] = (counts[doc.stage] || 0) + 1;
      });
      setStepDocCounts(counts);
    } catch (e) {
      console.error("Error fetching doc counts:", e);
    }
  };

  const insertAtCursor = (text) => {
    const textarea = document.getElementById('template-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = templateContent;
    const newContent = currentText.substring(0, start) + text + currentText.substring(end);

    setTemplateContent(newContent);

    // Maintain focus and set cursor position after React update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const loadInitialData = async () => {
    try {
      const [stages, fetchedPlaceholders, allConfigs] = await Promise.all([
        projectApi.getJourneyStages(),
        projectApi.getPlaceholders(),
        projectApi.getConfigurations()
      ]);

      setAllJourneyStages(stages);
      setAllPlaceholders(fetchedPlaceholders);
      setPlaceholders(fetchedPlaceholders);

      // Fetch initial counts
      fetchDocCounts();

      // Group configurations to show unique entries by name in the dropdown
      if (allConfigs && Array.isArray(allConfigs)) {
        const uniqueConfigs = new Map();

        allConfigs.forEach(c => {
          if (!c.configKey) return;

          const name = c.configValue?.configName || c.configKey.replace('projectConfig_', '').replace(/_/g, ' ');

          // Use name as the key to ensure we don't show the same named config multiple times
          // If multiple configs share a name, the map will store the latest one
          uniqueConfigs.set(name, {
            id: c._id,
            key: c.configKey,
            name: name,
            value: c.configValue
          });
        });

        const configList = Array.from(uniqueConfigs.values());
        setAllSavedConfigs(configList);
      }

      // Initially show all stages as default
      setWorkflowSteps(stages);
      if (stages.length > 0) setSelectedStep(stages[0]);

      // Fetch a sample project for preview
      const sample = await getProjects({ limit: 1 });
      if (sample && sample.success && sample.data && sample.data.length > 0) {
        setSampleProject(sample.data[0]);
      }
    } catch (error) {
      console.error("Error loading data", error);
    }
  };

  const handleConfigChange = (id) => {
    setSelectedConfigId(id);
  };

  // Fetch documents when step changes
  useEffect(() => {
    if (selectedStep && selectedConfigId) {
      const stepName = selectedStep.name || selectedStep.title || selectedStep;
      fetchDocuments(stepName);

      // We don't necessarily need to set a single 'generationResult' state anymore
      // since we render all results for the step from allGenerationResults map
    }
  }, [selectedStep, selectedConfigId]);

  const fetchDocuments = async (stageName) => {
    try {
      const docs = await projectApi.getProjectDocuments({ stage: stageName });
      setStepDocuments(docs);
      if (docs && docs.length > 0) {
        const firstDoc = docs[0];
        setSelectedDocument(firstDoc);
        setTemplateContent(firstDoc.templateContent || DEFAULT_TEMPLATE);
      } else {
        setSelectedDocument(null);
        setTemplateContent(DEFAULT_TEMPLATE);
      }
      fetchDocCounts();
    } catch (error) { console.error(error); }
  };

  const handleSaveTemplate = async () => {
    if (!selectedDocument) return;
    try {
      await projectApi.updateProjectDocument(selectedDocument._id, {
        ...selectedDocument,
        templateContent
      });
      toast.success('Template saved successfully!');
    } catch (error) { console.error(error); toast.error('Failed to save template'); }
  };

  const handleAddDocument = async () => {
    if (!newDocumentName.trim() || !selectedStep) return;

    try {
      const currentConfig = allSavedConfigs.find(c => c.id === selectedConfigId);
      const newDoc = await projectApi.createProjectDocument({
        documentName: newDocumentName,
        stage: selectedStep.name || selectedStep.title,
        templateContent: DEFAULT_TEMPLATE,
        required: true,
        category: configDetails?.configCategory || '',
        configKey: currentConfig?.key || ''
      });
      const updatedDocs = [...stepDocuments, newDoc];
      setStepDocuments(updatedDocs);
      setSelectedDocument(newDoc);
      setTemplateContent(DEFAULT_TEMPLATE);
      setNewDocumentName('');
      setIsAddingDocument(false);
      fetchDocCounts(currentConfig?.key);
      toast.success('Document added successfully');
    } catch (error) { console.error(error); toast.error('Failed to add document'); }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await projectApi.deleteProjectDocument(id);
      const remainingDocs = stepDocuments.filter(d => d._id !== id);
      setStepDocuments(remainingDocs);
      if (selectedDocument?._id === id) {
        if (remainingDocs.length > 0) {
          setSelectedDocument(remainingDocs[0]);
          setTemplateContent(remainingDocs[0].templateContent || DEFAULT_TEMPLATE);
        } else {
          setSelectedDocument(null);
          setTemplateContent(DEFAULT_TEMPLATE);
        }
      }
      const currentConfig = allSavedConfigs.find(c => c.id === selectedConfigId);
      fetchDocCounts(currentConfig?.key);
      toast.success('Document deleted');
    } catch (error) { console.error(error); toast.error('Failed to delete document'); }
  };

  const handleAddPlaceholderKey = async () => {
    if (!selectedPlaceholder) return;

    try {
      const placeholder = `{{${selectedPlaceholder.replace(/\s+/g, '_').toLowerCase()}}}`;
      insertAtCursor(placeholder);

      const existing = placeholders.find(p => p.labelKey === selectedPlaceholder);
      if (!existing) {
        // Find matching DB field if any
        const matchingDbField = dbFields.find(f => f.label.toLowerCase() === selectedPlaceholder.toLowerCase())?.value || '';
        const matchingDbLabel = dbFields.find(f => f.label.toLowerCase() === selectedPlaceholder.toLowerCase())?.label || '';

        const newPlaceholder = {
          _id: Date.now().toString(),
          labelKey: selectedPlaceholder,
          dbField: matchingDbField,
          labelValue: matchingDbLabel || 'Not set',
          number: placeholders.length + 1
        };
        setPlaceholders([...placeholders, newPlaceholder]);
      }
      setSelectedPlaceholder('');
    } catch (e) { console.error(e); }
  };

  const handleEditPlaceholder = (placeholder) => {
    setModalPlaceholder(placeholder);
    setModalValue(placeholder.labelValue || '');
    setSelectedDbField(placeholder.dbField || '');
    setModalNumber(placeholder.number || 1);
    setShowModal(true);
  };

  const handleDeletePlaceholder = async (id) => {
    if (confirm('Delete this placeholder?')) {
      try {
        await projectApi.deletePlaceholder(id);
        setPlaceholders(placeholders.filter(p => p._id !== id));
      } catch (e) { console.error(e); }
    }
  };

  const savePlaceholderValue = async () => {
    if (!modalPlaceholder) return;
    try {
      const updated = await projectApi.savePlaceholder({
        labelKey: modalPlaceholder.labelKey,
        labelValue: modalValue,
        dbField: selectedDbField,
        number: parseInt(modalNumber)
      });

      setPlaceholders(placeholders.map(p => p.labelKey === updated.labelKey ? updated : p));
      closeModal();
    } catch (e) { console.error(e); }
  };

  // Generate Document Logic


  const handleGenerateDocument = () => {
    if (!templateContent) {
      toast.error("Please create a template first.");
      return;
    }

    // Use sampleProject if it exists, otherwise use DEFAULT_SAMPLE_PROJECT fallback
    const dataSource = sampleProject || DEFAULT_SAMPLE_PROJECT;

    let finalContent = templateContent;
    // Find all {{placeholder}} patterns
    const regex = /\{\{([^{}]+)\}\}/g;
    let match;
    const placeholderKeys = [];
    while ((match = regex.exec(templateContent)) !== null) {
      placeholderKeys.push({ full: match[0], key: match[1] });
    }

    placeholderKeys.forEach(item => {
      const phConfig = placeholders.find(p => p.labelKey.toLowerCase().replace(/\s+/g, '_') === item.key);
      let replacement = item.full;
      if (phConfig && phConfig.dbField && dataSource[phConfig.dbField]) {
        replacement = phConfig.dbField.toLowerCase().includes('date')
          ? new Date(dataSource[phConfig.dbField]).toLocaleDateString()
          : dataSource[phConfig.dbField];
      } else if (phConfig && phConfig.labelValue) {
        replacement = phConfig.labelValue;
      }
      finalContent = finalContent.split(item.full).join(replacement);
    });

    setGeneratedContent(finalContent);

    // Set generation result summary for the card
    const result = {
      name: selectedDocument?.documentName || 'Unnamed Document',

      date: new Date().toLocaleString(),
      client: dataSource.authorizedPersonName || 'Not Set',
      project: dataSource.projectName || 'Not Set',
      content: finalContent
    };
    const stepName = selectedStep.name || selectedStep.title;
    const compositeKey = `${selectedConfigId}_${stepName}`;

    // Update step results map (scoped to config, as an array of history)
    const existingResults = allGenerationResults[compositeKey] || [];
    const updatedResults = { ...allGenerationResults, [compositeKey]: [result, ...existingResults] };
    setAllGenerationResults(updatedResults);
    localStorage.setItem('allGenerationResults', JSON.stringify(updatedResults));

    setGenerationResult(result);

    // Update real-time generation counts for steps (scoped to config)
    const newDocCounts = { ...generatedDocCounts, [compositeKey]: (generatedDocCounts[compositeKey] || 0) + 1 };
    setGeneratedDocCounts(newDocCounts);
    localStorage.setItem('generationHistory', JSON.stringify(newDocCounts));

    // Open modal immediately for preview/edit
    setActiveEditRecord({ key: compositeKey, index: 0 }); // Newest is at index 0
    setIsGeneratorEditing(false);
    setShowGeneratorModal(true);

    toast.success('Document generated successfully!');
  };

  const saveGeneratedEdit = () => {
    if (!activeEditRecord) return;
    const { key, index } = activeEditRecord;
    const list = [...(allGenerationResults[key] || [])];
    if (list[index]) {
      list[index].content = generatedContent;
      const updated = { ...allGenerationResults, [key]: list };
      setAllGenerationResults(updated);
      localStorage.setItem('allGenerationResults', JSON.stringify(updated));
      setIsGeneratorEditing(false);
      toast.success('Document updated successfully!');
    }
  };

  const removeGenerationRecord = (compositeKey, index) => {
    const list = [...(allGenerationResults[compositeKey] || [])];
    list.splice(index, 1);
    const updated = { ...allGenerationResults, [compositeKey]: list };
    setAllGenerationResults(updated);
    localStorage.setItem('allGenerationResults', JSON.stringify(updated));

    // Update session counts
    const newDocCounts = { ...generatedDocCounts, [compositeKey]: list.length };
    setGeneratedDocCounts(newDocCounts);
    localStorage.setItem('generationHistory', JSON.stringify(newDocCounts));
    toast.success('Record removed');
  };

  const viewGeneratedDocument = () => {
    if (!generatedContent) return;

    const docWindow = window.open('', '_blank', 'width=900,height=800');
    docWindow.document.write(`
      <html>
        <head>
          <title>${generationResult?.name || 'Generated Document'}</title>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.8; color: #333; padding: 60px; max-width: 850px; margin: auto; background: #f4f7f6; }
            .content { background: white; padding: 60px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; min-height: 1000px; border-top: 5px solid #2563eb; }
            h1 { text-align: center; color: #111; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            p { margin-bottom: 25px; text-align: justify; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="content">
            <h1>${generationResult?.name || 'Document'}</h1>
            ${generatedContent.replace(/\n/g, '<br/>')}
            <div class="footer">Generated via Solarkits ERP System</div>
          </div>
        </body>
      </html>
    `);
    docWindow.document.close();
  };

  const closeModal = () => {
    setShowModal(false);
    setModalPlaceholder(null);
    setModalValue('');
    setSelectedDbField('');
  };

  // Helper to render placeholder item for the preview mode
  const renderPlaceholder = (key) => {
    // Check if key is a placeholder in our list
    const placeholderName = key.toLowerCase().replace(/\s+/g, '_');
    const phConfig = placeholders.find(p => p.labelKey.toLowerCase().replace(/\s+/g, '_') === placeholderName);

    let displayValue = `[${key}]`;
    let isReplaced = false;

    if (isPreviewWithData) {
      const dataSource = sampleProject || DEFAULT_SAMPLE_PROJECT;
      if (phConfig && phConfig.dbField && dataSource[phConfig.dbField]) {
        // Handle dates
        if (phConfig.dbField.toLowerCase().includes('date') && dataSource[phConfig.dbField]) {
          displayValue = new Date(dataSource[phConfig.dbField]).toLocaleDateString();
        } else {
          displayValue = dataSource[phConfig.dbField];
        }
        isReplaced = true;
      } else if (phConfig && phConfig.labelValue) {
        displayValue = phConfig.labelValue;
        isReplaced = true;
      }
    }

    return (
      <span className={`inline-flex items-center space-x-1 border border-solid rounded px-1.5 py-0.5 mx-1 shadow-sm
        ${isReplaced ? 'bg-green-100 border-green-300 text-green-800' : 'bg-yellow-100 border-yellow-300 text-yellow-800'}`}>
        <span className={`flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] font-bold
          ${isReplaced ? 'bg-green-500' : 'bg-blue-500'}`}>
          {isReplaced ? '✓' : 'i'}
        </span>
        <span className="font-bold tracking-tight">{displayValue}</span>
      </span>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <header className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Project Documentation Settings</h1>
              <p className="text-gray-600">Configure document templates and placeholders</p>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Project Configuration Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
            <Cog className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-[#1e3a8a]">Project Configuration</h2>
          </div>

          <div className="max-w-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project Journey Configuration</label>
            <select
              value={selectedConfigId}
              onChange={(e) => handleConfigChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">Select Configuration</option>
              {allSavedConfigs.map((cfg) => (
                <option key={cfg.id} value={cfg.id}>{cfg.name}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Select a configuration from 'Project Management Configuration' module to load its specific workflow steps.
            </p>
          </div>
        </div>

        {/* Workflow Steps Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
            <ListChecks className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-[#1e3a8a]">Project Management Steps</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {workflowSteps.map((step, index) => {
              // Get actual generation count for this step (scoped to active config)
              const stepName = step.name || step.title;
              const compositeKey = `${selectedConfigId}_${stepName}`;
              const count = generatedDocCounts[compositeKey] || 0;
              return (
                <div
                  key={step._id || step.title || index}
                  onClick={() => setSelectedStep(step)}
                  className={`rounded-xl p-3 text-center cursor-pointer transition-all duration-200 border-2 shadow-sm flex flex-col items-center justify-center min-h-[100px] w-full
                    ${(selectedStep?.title || selectedStep?.name || selectedStep) === (step.title || step.name)
                      ? 'border-[#0ea5e9] bg-[#f0f9ff] ring-1 ring-[#0ea5e9] ring-opacity-20'
                      : 'border-[#38bdf8] bg-white hover:border-[#0ea5e9] hover:bg-[#f0f9ff]'
                    }`}
                >
                  <div className="text-[12px] font-bold text-gray-700 leading-tight mb-2 flex-1 flex items-center justify-center w-full px-1">
                    {step.title || step.name}
                  </div>
                  <div
                    onClick={() => {
                      setSelectedStep(step);
                    }}
                    className="text-2xl font-black text-[#0ea5e9] hover:underline hover:scale-110 transition-transform"
                    title={`View all ${step.title || step.name} projects`}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document and Placeholder Side by Side */}        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Preview Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <File className="w-5 h-5 text-blue-500" />
                  <span>Document Template Editor</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsPreviewWithData(!isPreviewWithData)}
                    className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-all shadow-sm border
                      ${isPreviewWithData ? 'bg-green-100 border-green-300 text-green-700 font-bold' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                  >
                    {isPreviewWithData ? 'Using Sample Data' : 'Show Placeholders'}
                  </button>
                  <button
                    onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                    className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-all shadow-sm border
                      ${!isEditingTemplate ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                  >
                    {isEditingTemplate ? 'Preview Mode' : 'Editor Mode'}
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!selectedDocument}
                    className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center shadow-sm font-semibold transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </button>
                </div>
              </div>

              {/* Document Creation / Selection Information */}
              {selectedStep && (stepDocuments.length === 0 || isAddingDocument) && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-yellow-700">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Create New Template for {selectedStep.name || selectedStep.title}</p>
                      <p className="text-xs">Enter a unique name for this document template.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-yellow-400"
                      placeholder="Enter Document Name..."
                      value={newDocumentName}
                      onChange={(e) => setNewDocumentName(e.target.value)}
                    />
                    <button
                      onClick={handleAddDocument}
                      className="px-4 py-2 bg-[#0ea5e9] text-white rounded-lg text-sm font-bold hover:bg-[#0284c7] transition-colors"
                    >
                      Create
                    </button>
                    {isAddingDocument && (
                      <button onClick={() => setIsAddingDocument(false)} className="p-2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedDocument && !isAddingDocument && (
                <div className="mb-4 flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-600 uppercase font-black px-1 tracking-tighter">Current Context</p>
                      <h3 className="text-sm font-bold text-gray-800">
                        <span className="text-blue-600">Step:</span> {selectedStep?.name || selectedStep?.title || 'Unknown Step'}
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-blue-600">Editing:</span> {selectedDocument?.documentName || 'New Template'}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Document List for switching between multiple templates */}
              {selectedStep && stepDocuments.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="w-full text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 px-1">Templates for {selectedStep.name || selectedStep.title}</p>
                  {stepDocuments.map(doc => (
                    <div key={doc._id} className="relative group">
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setTemplateContent(doc.templateContent || DEFAULT_TEMPLATE);
                        }}
                        className={`px-4 py-2 pr-10 rounded-lg text-sm font-semibold transition-all relative
                                  ${selectedDocument?._id === doc._id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                      >
                        {doc.documentName}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc._id);
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all
                          ${selectedDocument?._id === doc._id 
                            ? 'text-blue-100 hover:text-white hover:bg-blue-500' 
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setIsAddingDocument(true)}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-blue-600 bg-white border border-dashed border-blue-300 hover:bg-blue-50 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    New Template
                  </button>
                </div>
              )}

              <div className="flex-1 min-h-[500px] flex flex-col">
                <div className="mb-2 text-xs text-gray-500 italic flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Note: Use placeholders like {"{{client_name}}"} which will be replaced during generation.
                </div>
                {isEditingTemplate ? (
                  <textarea
                    id="template-editor"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    className="w-full flex-1 p-8 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed shadow-inner"
                    placeholder="Enter document template content here..."
                  />
                ) : (
                  <div className="w-full flex-1 p-8 bg-gray-100 border border-gray-200 rounded-lg overflow-auto">
                    <div className="max-w-[800px] mx-auto bg-white p-12 shadow-md min-h-full whitespace-pre-wrap leading-loose text-sm text-gray-800 border-t-4 border-blue-500 relative">
                      <button
                        onClick={() => handleDeleteDocument(selectedDocument?._id)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mb-8 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
                          {selectedStep?.name || selectedStep?.title}
                        </p>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-gray-900">{selectedDocument?.documentName || 'Document Preview'}</h3>
                        <div className="w-16 h-1 bg-blue-500 mx-auto mt-2"></div>
                      </div>
                      {templateContent.split(/(\{\{[^{}]+\}\})/).map((part, i) => {
                        if (part.startsWith('{{') && part.endsWith('}}')) {
                          const keyName = part.slice(2, -2).toUpperCase().replace(/_/g, ' ');
                          return <React.Fragment key={`placeholder-${i}`}>{renderPlaceholder(keyName)}</React.Fragment>;
                        }
                        return <span key={`text-${i}`}>{part}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Placeholder Management Section */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2 mb-6 pb-4 border-b">
                <Tag className="w-5 h-5 text-blue-500" />
                <span>Placeholder Management</span>
              </h2>

              {/* Add Placeholder Form */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                    value={selectedPlaceholder}
                    onChange={(e) => setSelectedPlaceholder(e.target.value)}
                  >
                    <option value="">Select a placeholder</option>
                    {availableSuggestions.map((placeholder, index) => (
                      <option key={index} value={placeholder}>
                        {placeholder}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddPlaceholderKey}
                    className="px-5 py-2 bg-[#0284c7] text-white rounded-lg hover:bg-[#0369a1] transition-colors flex items-center shadow-sm text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1 stroke-[3]" />
                    Add
                  </button>
                </div>
              </div>

              {/* Placeholder List */}
              <div className="space-y-3 min-h-[300px] flex flex-col">
                {placeholders.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center p-8">
                    <p className="text-gray-500 text-sm">
                      No placeholders added yet. Use the form above to add placeholders.
                    </p>
                  </div>
                ) : (
                  placeholders.map((p) => (
                    <div
                      key={p._id}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">{p.labelKey}</div>
                        <div className="text-xs text-blue-600 truncate">
                          {p.dbField ? `Linked to: ${dbFields.find(f => f.value === p.dbField)?.label || p.dbField}` : (p.labelValue || 'Static Value')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Display Number */}
                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">{p.number}</span>

                        <button
                          onClick={() => handleEditPlaceholder(p)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlaceholder(p._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Button */}
              <div className="flex-1 mt-6 flex flex-col items-center justify-start space-y-4">
                <button
                  onClick={handleGenerateDocument}
                  disabled={!selectedStep || stepDocuments.length === 0}
                  className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all transform hover:scale-[1.02]
                    ${(!selectedStep || stepDocuments.length === 0)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'}`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Generate Final Document</span>
                </button>
                {/* Generation History Sidebar */}
                <div className="w-full space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {(selectedStep && selectedConfigId) && (() => {
                    const compositeKey = `${selectedConfigId}_${selectedStep.name || selectedStep.title}`;
                    const records = allGenerationResults[compositeKey];
                    const historyArray = Array.isArray(records) ? records : (records ? [records] : []);
                    return historyArray.map((res, idx) => (
                      <div key={idx} className="w-full bg-white border border-green-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex items-center justify-between">
                          <div className="flex items-center text-green-700 text-[11px] font-bold uppercase tracking-wider">
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            Generated Record #{(historyArray.length - idx)}
                          </div>
                          <button
                            onClick={() => removeGenerationRecord(compositeKey, idx)}
                            className="text-green-600 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Document</p>
                              <p className="text-sm font-semibold text-gray-800">{res.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Date</p>
                              <p className="text-xs text-gray-800">{res.date}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <p className="text-xs text-gray-600">Client: <span className="font-bold">{res.client}</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <p className="text-xs text-gray-600">Project: <span className="font-bold truncate max-w-[120px] inline-block align-bottom">{res.project}</span></p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setGenerationResult(res);
                                if (res.content) setGeneratedContent(res.content);
                                setActiveEditRecord({ key: compositeKey, index: idx });
                                setIsGeneratorEditing(true); // Direct to edit
                                setShowGeneratorModal(true);
                              }}
                              className="py-2 px-3 border border-blue-200 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setGenerationResult(res);
                                if (res.content) setGeneratedContent(res.content);
                                setActiveEditRecord({ key: compositeKey, index: idx });
                                setIsGeneratorEditing(false); // Just view
                                setShowGeneratorModal(true);
                              }}
                              className="py-2 px-3 border border-green-200 text-green-600 rounded-lg text-[10px] font-bold hover:bg-green-50 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => {
                                setGenerationResult(res);
                                if (res.content) setGeneratedContent(res.content);
                                viewGeneratedDocument();
                              }}
                              className="col-span-2 py-1 px-3 border border-gray-200 text-gray-500 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Print Original</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>

                <p className="text-xs text-gray-400 text-center px-4">
                  Note: Generating final document will replace all placeholders and open a printable view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for editing placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Edit Placeholder</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placeholder Key
                </label>
                <input
                  type="text"
                  value={modalPlaceholder?.labelKey || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database Field Mapping
                </label>
                <select
                  value={selectedDbField}
                  onChange={(e) => setSelectedDbField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">No mapping (Static Value)</option>
                  {dbFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select which database field this placeholder should automatically pull data from.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Value (If DB field empty)
                </label>
                <input
                  type="text"
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder="Enter fallback value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Number
                </label>
                <input
                  type="number"
                  value={modalNumber}
                  onChange={(e) => setModalNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-end">
              <button
                onClick={savePlaceholderValue}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Generator Preview Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center space-x-2">
                <FileText className={`w-6 h-6 ${isGeneratorEditing ? 'text-blue-500' : 'text-green-500'}`} />
                <h3 className="text-xl font-bold text-gray-800">
                  {isGeneratorEditing ? 'Edit Generated Document' : 'Generated Document Preview'}
                </h3>
              </div>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-gray-100 custom-scrollbar">
              {isGeneratorEditing ? (
                <div className="max-w-[800px] mx-auto bg-white shadow-lg min-h-full">
                   <textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="w-full min-h-[600px] p-12 border-none focus:ring-0 leading-relaxed text-gray-800 text-sm font-light leading-relaxed resize-none bg-yellow-50/10"
                    placeholder="Refine the generated document content here..."
                   />
                </div>
              ) : (
                <div className="max-w-[700px] mx-auto bg-white p-12 shadow-sm whitespace-pre-wrap leading-relaxed text-gray-800 border min-h-full animate-in zoom-in-95 duration-300">
                  {generatedContent}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-white flex justify-between items-center sm:px-12">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsGeneratorEditing(!isGeneratorEditing)}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isGeneratorEditing 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  {isGeneratorEditing ? <Eye size={18} /> : <Edit size={18} />}
                  {isGeneratorEditing ? 'Read Mode' : 'Edit Mode'}
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const docWindow = window.open('', '_blank', 'width=900,height=800');
                    docWindow.document.write(`
                      <html>
                        <head>
                          <title>${generationResult?.name || 'Document'}</title>
                          <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #111; padding: 50px; }
                            .doc-container { max-width: 800px; margin: auto; white-space: pre-wrap; }
                            h1 { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                          </style>
                        </head>
                        <body>
                          <h1>${generationResult?.name}</h1>
                          <div class="doc-container">${generatedContent}</div>
                        </body>
                      </html>
                    `);
                    docWindow.print();
                    docWindow.document.close();
                  }}
                  className="px-6 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-bold flex items-center gap-2"
                >
                  <FileText size={18} /> Print
                </button>
                {isGeneratorEditing ? (
                  <button
                    onClick={saveGeneratedEdit}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                  >
                    <Save size={18} /> Save & Finalize
                  </button>
                ) : (
                  <button
                    onClick={() => setShowGeneratorModal(false)}
                    className="px-8 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-bold"
                  >
                    Close Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationSetting;