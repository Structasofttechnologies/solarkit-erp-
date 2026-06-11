import React, { useState, useEffect } from 'react';
import { Globe, MapPin, LayoutGrid, Building2, ChevronRight, Edit2, Trash2, CheckCircle, RotateCcw, Save, Loader2, AlertCircle, X, Plus } from 'lucide-react';
import Select from 'react-select';
import * as settingsApi from '../../../services/settings/settingsApi';
import * as masterApi from '../../../services/core/masterApi';
import * as combokitApi from '../../../services/combokit/combokitApi';
import { useLocations } from '../../../hooks/useLocations';

const LocationCard = ({ title, subtitle, icon: Icon, isSelected, onClick, colorClass = "blue", count = 0, selectionNumber = 0 }) => {
  const colors = {
    blue: 'border-blue-600 bg-blue-50/50 shadow-md',
    purple: 'border-purple-600 bg-purple-50/50 shadow-md',
    green: 'border-emerald-600 bg-emerald-50/50 shadow-md',
    orange: 'border-orange-600 bg-orange-50/50 shadow-md'
  };

  const activeBorder = colors[colorClass] || colors.blue;

  return (
    <div
      onClick={onClick}
      className={`relative min-w-[130px] p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-2 group ${
        isSelected 
          ? `${activeBorder} scale-[1.02]` 
          : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      {/* Selection Number Badge */}
      {isSelected && selectionNumber > 0 && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md z-10 animate-in zoom-in duration-200">
          {selectionNumber}
        </div>
      )}

      {/* Checkbox Icon in Top Right (fallback/decorative) */}
      <div className={`absolute top-2 right-2 transition-opacity duration-300 ${isSelected && selectionNumber === 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-4 h-4 rounded border-2 border-blue-600 flex items-center justify-center bg-white shadow-sm">
          <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
        </div>
      </div>

      <div className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'}`}>
        <Icon size={20} />
      </div>

      <div className={`font-black text-xs tracking-tight ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
        {title}
      </div>

      {count > 0 && (
        <div className={`mt-1 px-3 py-0.5 rounded-full text-[9px] font-extrabold transition-all ${
          isSelected 
            ? 'bg-blue-100 text-blue-700 shadow-inner' 
            : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          {count} Plans
        </div>
      )}
    </div>
  );
};

export default function LoanSetting() {
  const { countries, states, clusters, districts, fetchStates, fetchClusters, fetchDistricts } = useLocations();

  const [selectedLocation, setSelectedLocation] = useState({
    country: ['all'],
    state: [],
    cluster: [],
    district: []
  });

  const [loanRules, setLoanRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [combokits, setCombokits] = useState([]);
  const [customizedKits, setCustomizedKits] = useState([]);
  const [mappings, setMappings] = useState([]);

  // Selections
  const [loanProviderType, setLoanProviderType] = useState('NBFC');
  const [orderType, setOrderType] = useState('Combokit');
  const [selectedCombokits, setSelectedCombokits] = useState([]);
  const [selectedCustomizedKits, setSelectedCustomizedKits] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [selectedSubProjectTypes, setSelectedSubProjectTypes] = useState([]);

  // Loan Provider Management State
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [newProviderName, setNewProviderName] = useState('');
  const [editingProvider, setEditingProvider] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingRuleId, setCurrentEditingRuleId] = useState(null);

  const [formFields, setFormFields] = useState({});
  const [outcomes, setOutcomes] = useState([
    { status: 'approved', minScore: 80, maxScore: 100 },
    { status: 'pre-approved', minScore: 60, maxScore: 79 },
    { status: 'manual call', minScore: 40, maxScore: 59 },
    { status: 'rejected', minScore: 0, maxScore: 39 }
  ]);

  const addRange = (fieldId) => {
    setFormFields(prev => {
      const current = prev[fieldId] || { selected: true, ranges: [] };
      return {
        ...prev,
        [fieldId]: {
          ...current,
          selected: true,
          ranges: [...(current.ranges || []), { from: 0, to: 0, score: 0, secondaryFrom: 0, secondaryTo: 0 }]
        }
      };
    });
  };

  const removeRange = (fieldId, index) => {
    setFormFields(prev => {
      const current = prev[fieldId];
      if (!current) return prev;
      const newRanges = [...current.ranges];
      newRanges.splice(index, 1);
      return {
        ...prev,
        [fieldId]: { ...current, ranges: newRanges }
      };
    });
  };

  const updateRange = (fieldId, index, key, value) => {
    setFormFields(prev => {
      const current = prev[fieldId];
      if (!current) return prev;
      const newRanges = [...current.ranges];
      newRanges[index] = { ...newRanges[index], [key]: Number(value) };
      return {
        ...prev,
        [fieldId]: { ...current, ranges: newRanges }
      };
    });
  };

  const updateOutcome = (index, key, value) => {
    setOutcomes(prev => {
      const newOutcomes = [...prev];
      newOutcomes[index] = { ...newOutcomes[index], [key]: key === 'status' ? value : Number(value) };
      return newOutcomes;
    });
  };

  const fieldOptions = [
    { id: 'min_cibil', label: 'Minimum CIBIL Score' },
    { id: 'max_ltv', label: 'Max LTV (%)', secondaryLabel: 'Age' },
    { id: 'min_bank_balance', label: 'Min Avg Bank Balance' },
    { id: 'processing_fee', label: 'Processing Fee (%)', secondaryLabel: 'Downpayment' },
    { id: 'min_itr', label: 'Min Declared Income (ITR)' },
    { id: 'lockin_period', label: 'Lock-in Period (months)', secondaryLabel: 'LTV %' },
    { id: 'down_payment', label: 'Down Payment (%)' },
    { id: 'foreclosure_charges', label: 'Foreclosure Charges (%)' },
    { id: 'age_eligibility', label: 'Age Eligibility' },
    { id: 'emi_capacity', label: 'EMI Capacity (DTI Ratio)' },
    { id: 'identity_verification', label: 'Identity Verification (Aadhaar/PAN)' }
  ];

  useEffect(() => {
    loadMasterData();
    loadLoanRules();
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await settingsApi.fetchLoanProviders();
      setProviders(data || []);
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const loadMasterData = async () => {
    try {
      const [cats, kits, assignments] = await Promise.all([
        masterApi.getCategories(),
        combokitApi.getSolarKits(),
        combokitApi.getAssignments()
      ]);
      const categoryData = cats.data || cats || [];
      setCategories(categoryData);
      setCombokits(kits || []);
      setCustomizedKits(assignments.data || assignments || []);

      setCombokits(kits || []);
      setCustomizedKits(assignments.data || assignments || []);
    } catch (err) {
      console.error('Failed to load master data:', err);
    }
  };

  const handleProviderAction = async (e) => {
    if (e) e.preventDefault();
    if (!newProviderName.trim()) return;

    try {
      setSaving(true);
      if (editingProvider) {
        await settingsApi.updateLoanProvider(editingProvider._id, { name: newProviderName });
        setSuccess('Provider updated');
      } else {
        await settingsApi.createLoanProvider({ name: newProviderName });
        setSuccess('Provider added');
      }
      setNewProviderName('');
      setEditingProvider(null);
      loadProviders();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteProvider = async (id) => {
    if (!window.confirm('Delete this provider?')) return;
    try {
      await settingsApi.deleteLoanProvider(id);
      loadProviders();
      if (selectedProviderId === id) setSelectedProviderId('');
    } catch (err) {
      setError('Delete failed');
    }
  };

  useEffect(() => {
    if (selectedCategories.length > 0) {
      const promises = selectedCategories.map(cat => masterApi.getSubCategories({ categoryId: cat.value }));
      Promise.all(promises).then(results => {
        const allSubs = results.map(res => res.data || []).flat();
        const uniqueSubs = Array.from(new Map(allSubs.map(s => [s._id, s])).values());
        setSubCategories(uniqueSubs);
      });
    } else {
      setSubCategories([]);
    }
  }, [selectedCategories]);

  useEffect(() => {
    if (selectedCategories.length > 0 && selectedSubCategories.length > 0) {
      const promises = [];
      selectedCategories.forEach(cat => {
        selectedSubCategories.forEach(sub => {
          promises.push(masterApi.getProjectCategoryMappings({ categoryId: cat.value, subCategoryId: sub.value }));
        });
      });

      Promise.all(promises).then(results => {
        const data = results.map(res => res.data || []).flat();
        setMappings(data);

        const ranges = data.map(m => ({
          label: `${m.projectTypeFrom} to ${m.projectTypeTo} kW`,
          from: m.projectTypeFrom,
          to: m.projectTypeTo
        }));
        const uniqueRanges = [];
        const seen = new Set();
        ranges.forEach(r => {
          if (!seen.has(r.label)) {
            seen.add(r.label);
            uniqueRanges.push(r);
          }
        });
        setProjectTypes(uniqueRanges);
      });
    } else {
      setMappings([]);
      setProjectTypes([]);
    }
  }, [selectedCategories, selectedSubCategories]);

  useEffect(() => {
    if (selectedProjectTypes.length > 0) {
      const labels = selectedProjectTypes.map(pt => pt.value);
      const matching = mappings.filter(m => labels.includes(`${m.projectTypeFrom} to ${m.projectTypeTo} kW`));
      const subTypes = matching.filter(m => m.subProjectTypeId).map(m => m.subProjectTypeId);
      const uniqueSubTypes = [];
      const seenIds = new Set();
      subTypes.forEach(s => {
        if (!seenIds.has(s._id)) {
          seenIds.add(s._id);
          uniqueSubTypes.push(s);
        }
      });
      setSubProjectTypes(uniqueSubTypes);
    } else {
      setSubProjectTypes([]);
    }
  }, [selectedProjectTypes, mappings]);

  useEffect(() => {
    if (selectedLocation.country.length > 0 && !selectedLocation.country.includes('all')) {
      fetchStates({ countryId: selectedLocation.country[0] });
    } else {
      fetchStates();
    }
  }, [selectedLocation.country, fetchStates]);

  useEffect(() => {
    if (selectedLocation.state.length > 0 && !selectedLocation.state.includes('all')) {
      fetchClusters({ stateId: selectedLocation.state[0] });
    } else {
      fetchClusters();
    }
  }, [selectedLocation.state, fetchClusters]);

  useEffect(() => {
    if (selectedLocation.cluster.length > 0 && !selectedLocation.cluster.includes('all')) {
      fetchDistricts({ clusterId: selectedLocation.cluster[0] });
    } else {
      fetchDistricts();
    }
  }, [selectedLocation.cluster, fetchDistricts]);

  const getRuleCount = (type, id) => {
    return loanRules.filter(r => {
      const fieldArr = r[type === 'country' ? 'countries' : type === 'state' ? 'states' : type === 'cluster' ? 'clusters' : 'districts'] || [];
      if (id === 'all') return fieldArr.length === 0;
      return fieldArr.some(item => (item._id || item) === id);
    }).length;
  };

  const loadLoanRules = async () => {
    try {
      setLoading(true);
      const rules = await settingsApi.fetchLoanRules();
      setLoanRules(rules || []);
      updateFormFromCurrentConfig(rules || []);
    } catch (err) {
      setError('Failed to load loan settings');
    } finally {
      setLoading(false);
    }
  };

  const arraysEqual = (a, b) => {
    const arrA = (a || []).map(l => l._id || l).filter(x => x !== 'all');
    const arrB = (b || []).map(l => l._id || l).filter(x => x !== 'all');
    if (arrA.length === 0 && arrB.length === 0) return true;
    if (arrA.length !== arrB.length) return false;
    const sortedA = [...arrA].sort();
    const sortedB = [...arrB].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  const updateFormFromCurrentConfig = (rules = loanRules) => {
    const matchingRule = rules.find(r =>
      r.loanProviderType === loanProviderType &&
      r.orderType === orderType &&
      (r.loanProviderId?._id || r.loanProviderId) === (selectedProviderId || null) &&
      arraysEqual((r.countries || []), selectedLocation.country) &&
      arraysEqual((r.states || []), selectedLocation.state) &&
      arraysEqual((r.clusters || []), selectedLocation.cluster) &&
      arraysEqual((r.districts || []), selectedLocation.district) &&
      arraysEqual((r.districts || []), selectedLocation.district) &&
      (selectedCombokits.length === 0 || selectedCombokits.some(c => c.value === (r.combokitId?._id || r.combokitId))) &&
      (selectedCustomizedKits.length === 0 || selectedCustomizedKits.some(c => c.value === (r.customizedKitId?._id || r.customizedKitId))) &&
      (selectedCategories.length === 0 || selectedCategories.some(c => c.value === (r.categoryId?._id || r.categoryId))) &&
      (selectedSubCategories.length === 0 || selectedSubCategories.some(c => c.value === (r.subCategoryId?._id || r.subCategoryId))) &&
      (selectedProjectTypes.length === 0 || selectedProjectTypes.some(c => c.value === r.projectType)) &&
      (selectedSubProjectTypes.length === 0 || selectedSubProjectTypes.some(c => c.value === (r.subProjectTypeId?._id || r.subProjectTypeId)))
    );

    if (matchingRule && matchingRule.fields) {
      const fieldData = {};
      matchingRule.fields.forEach(f => {
        fieldData[f.name] = {
          selected: f.selected,
          ranges: f.ranges || []
        };
      });
      setFormFields(fieldData);
      if (matchingRule.outcomes) setOutcomes(matchingRule.outcomes);
    } else {
      setFormFields({});
      setOutcomes([
        { status: 'approved', minScore: 80, maxScore: 100 },
        { status: 'pre-approved', minScore: 60, maxScore: 79 },
        { status: 'manual call', minScore: 40, maxScore: 59 },
        { status: 'rejected', minScore: 0, maxScore: 39 }
      ]);
    }
  };

  useEffect(() => {
    updateFormFromCurrentConfig();
  }, [loanProviderType, orderType, selectedLocation, selectedCombokits, selectedCustomizedKits, selectedCategories, selectedSubCategories, selectedProjectTypes, selectedSubProjectTypes, loanRules]);

  const handleCheckboxChange = (fieldId) => {
    setFormFields(prev => {
      const current = prev[fieldId] || { selected: false, ranges: [] };
      const isSelecting = !current.selected;
      return {
        ...prev,
        [fieldId]: {
          ...current,
          selected: isSelecting,
          ranges: isSelecting && current.ranges.length === 0
            ? [{ from: 0, to: 0, score: 0, secondaryFrom: 0, secondaryTo: 0 }]
            : current.ranges
        }
      };
    });
  };

  const toggleLocation = (dim, id) => {
    setSelectedLocation(prev => {
      let newVals;
      const current = prev[dim] || [];
      if (id === 'all') {
        newVals = ['all'];
      } else {
        const filtered = current.filter(x => x !== 'all');
        if (filtered.includes(id)) {
          newVals = filtered.filter(x => x !== id);
          if (newVals.length === 0) newVals = ['all'];
        } else {
          newVals = [...filtered, id];
        }
      }

      const updates = { [dim]: newVals };
      if (dim === 'country') {
        updates.state = [];
        updates.cluster = [];
        updates.district = [];
      } else if (dim === 'state') {
        updates.cluster = [];
        updates.district = [];
      } else if (dim === 'cluster') {
        updates.district = [];
      }
      return { ...prev, ...updates };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const selectedFields = fieldOptions.map(opt => ({
        name: opt.id,
        selected: formFields[opt.id]?.selected || false,
        ranges: formFields[opt.id]?.selected ? (formFields[opt.id]?.ranges || []) : []
      }));

      const basePayload = {
        loanProviderType,
        orderType,
        loanProviderId: selectedProviderId || null,
        countries: selectedLocation.country.includes('all') ? [] : selectedLocation.country,
        states: selectedLocation.state.includes('all') ? [] : selectedLocation.state,
        clusters: selectedLocation.cluster.includes('all') ? [] : selectedLocation.cluster,
        districts: selectedLocation.district.includes('all') ? [] : selectedLocation.district,
        customizedKitIds: selectedCustomizedKits.map(c => c.value),
        categoryIds: selectedCategories.map(c => c.value),
        subCategoryIds: selectedSubCategories.map(c => c.value),
        projectType: selectedProjectTypes.length > 0 ? selectedProjectTypes[0].value : '',
        subProjectTypeIds: selectedSubProjectTypes.map(c => c.value),
        fields: selectedFields,
        outcomes,
        interestRate: 0,
        tenureMonths: 0,
        maxAmount: 0
      };

      if (isEditing && currentEditingRuleId) {
        await settingsApi.updateLoanRule(currentEditingRuleId, basePayload);
        setSuccess('Rule updated successfully');
      } else {
        const combokitIdsToSave = orderType === 'Combokit' && selectedCombokits.length > 0 
          ? selectedCombokits.map(c => c.value) 
          : [null];

        for (const combokitId of combokitIdsToSave) {
          const payload = { ...basePayload, combokitId };

          const existingRule = loanRules.find(r =>
            r.loanProviderType === loanProviderType &&
            r.orderType === orderType &&
            (r.loanProviderId?._id || r.loanProviderId) === (selectedProviderId || null) &&
            arraysEqual((r.countries || []), selectedLocation.country) &&
            arraysEqual((r.states || []), selectedLocation.state) &&
            arraysEqual((r.clusters || []), selectedLocation.cluster) &&
            arraysEqual((r.districts || []), selectedLocation.district) &&
            (r.combokitId?._id || r.combokitId) === (combokitId || null) &&
            (selectedCustomizedKits.length === 0 || selectedCustomizedKits.some(c => c.value === (r.customizedKitId?._id || r.customizedKitId))) &&
            (selectedCategories.length === 0 || selectedCategories.some(c => c.value === (r.categoryId?._id || r.categoryId))) &&
            (selectedSubCategories.length === 0 || selectedSubCategories.some(c => c.value === (r.subCategoryId?._id || r.subCategoryId))) &&
            (selectedProjectTypes.length === 0 || selectedProjectTypes.some(c => c.value === r.projectType)) &&
            (selectedSubProjectTypes.length === 0 || selectedSubProjectTypes.some(c => c.value === (r.subProjectTypeId?._id || r.subProjectTypeId)))
          );

          if (existingRule) {
            await settingsApi.updateLoanRule(existingRule._id, payload);
          } else {
            await settingsApi.createLoanRule(payload);
          }
        }
        setSuccess('Settings saved successfully');
      }

      handleReset();
      loadLoanRules();
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    setCurrentEditingRuleId(null);
    setSelectedProviderId('');
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedProjectTypes([]);
    setSelectedSubProjectTypes([]);
    setSelectedCombokits([]);
    setSelectedCustomizedKits([]);
    setFormFields({});
    setOutcomes([
      { status: 'approved', minScore: 80, maxScore: 100 },
      { status: 'pre-approved', minScore: 60, maxScore: 79 },
      { status: 'manual call', minScore: 40, maxScore: 59 },
      { status: 'rejected', minScore: 0, maxScore: 39 }
    ]);
    setSuccess('');
    setError('');
  };

  const getLabel = (id) => fieldOptions.find(opt => opt.id === id)?.label || id;

  const handleRemove = async (ruleId) => {
    if (!window.confirm(`Are you sure you want to remove this configuration?`)) return;
    try {
      setSaving(true);
      await settingsApi.deleteLoanRule(ruleId);
      setSuccess(`Configuration removed`);
      loadLoanRules();
    } catch (err) {
      setError('Failed to remove settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font text-[#003366] tracking-tight">Loan eligibility scoring</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Configure scoring rules and eligibility criteria for loan providers</p>
          </div>
          <div className="flex space-x-3">
            {isEditing && (
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all shadow-sm"
              >
                <X size={16} className="mr-2" />
                Cancel Edit
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <RotateCcw size={16} className="mr-2" />
              Reset Form
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
              {isEditing ? 'Update Configuration' : 'Save Settings'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-2" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded flex items-center shadow-sm">
            <CheckCircle className="w-5 h-5 mr-2" /> {success}
          </div>
        )}

        <div className="space-y-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <div className="flex items-center mb-4">
              <Globe className="text-blue-600 mr-2" size={20} />
              <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select Country</h4>
            </div>
            <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <LocationCard
                title="Select All"
                subtitle="COUNTRIES"
                icon={Globe}
                isSelected={selectedLocation.country?.includes('all')}
                onClick={() => toggleLocation('country', 'all')}
                count={getRuleCount('country', 'all')}
                selectionNumber={selectedLocation.country?.indexOf('all') + 1}
              />
              {countries.map(c => (
                <LocationCard
                  key={c._id}
                  title={c.name}
                  subtitle={c.code || 'COUNTRY'}
                  icon={Globe}
                  isSelected={selectedLocation.country?.includes(c._id)}
                  onClick={() => toggleLocation('country', c._id)}
                  count={getRuleCount('country', c._id)}
                  selectionNumber={selectedLocation.country?.indexOf(c._id) + 1}
                />
              ))}
            </div>
          </div>

          {selectedLocation.country.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-visible animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="text-blue-600 mr-2" size={20} />
                  <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select State</h4>
                </div>
                {selectedLocation.state.length > 0 && !selectedLocation.state.includes('all') && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">{selectedLocation.state.length} Selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <LocationCard
                  title="Select All"
                  subtitle="STATES"
                  icon={MapPin}
                  isSelected={selectedLocation.state?.includes('all')}
                  onClick={() => toggleLocation('state', 'all')}
                  count={getRuleCount('state', 'all')}
                  selectionNumber={selectedLocation.state?.indexOf('all') + 1}
                />
                {states.map(s => (
                  <LocationCard
                    key={s._id}
                    title={s.name}
                    subtitle="State"
                    icon={MapPin}
                    isSelected={selectedLocation.state?.includes(s._id)}
                    onClick={() => toggleLocation('state', s._id)}
                    count={getRuleCount('state', s._id)}
                    selectionNumber={selectedLocation.state?.indexOf(s._id) + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedLocation.state.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-visible animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <LayoutGrid className="text-purple-600 mr-2" size={20} />
                  <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select Cluster</h4>
                </div>
                {selectedLocation.cluster.length > 0 && !selectedLocation.cluster.includes('all') && (
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold border border-purple-100">{selectedLocation.cluster.length} Selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <LocationCard
                  title="Select All"
                  subtitle="CLUSTERS"
                  icon={LayoutGrid}
                  isSelected={selectedLocation.cluster?.includes('all')}
                  onClick={() => toggleLocation('cluster', 'all')}
                  colorClass="purple"
                  count={getRuleCount('cluster', 'all')}
                  selectionNumber={selectedLocation.cluster?.indexOf('all') + 1}
                />
                {clusters.map(cl => (
                  <LocationCard
                    key={cl._id}
                    title={cl.name}
                    subtitle="Cluster"
                    icon={LayoutGrid}
                    isSelected={selectedLocation.cluster?.includes(cl._id)}
                    onClick={() => toggleLocation('cluster', cl._id)}
                    colorClass="purple"
                    count={getRuleCount('cluster', cl._id)}
                    selectionNumber={selectedLocation.cluster?.indexOf(cl._id) + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedLocation.cluster.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-visible animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Building2 className="text-emerald-600 mr-2" size={20} />
                  <h4 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Select District</h4>
                </div>
                {selectedLocation.district.length > 0 && !selectedLocation.district.includes('all') && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">{selectedLocation.district.length} Selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <LocationCard
                  title="Select All"
                  subtitle="DISTRICTS"
                  icon={Building2}
                  isSelected={selectedLocation.district?.includes('all')}
                  onClick={() => toggleLocation('district', 'all')}
                  colorClass="green"
                  count={getRuleCount('district', 'all')}
                  selectionNumber={selectedLocation.district?.indexOf('all') + 1}
                />
                {districts.map(d => (
                  <LocationCard
                    key={d._id}
                    title={d.name}
                    subtitle="District"
                    icon={Building2}
                    isSelected={selectedLocation.district?.includes(d._id)}
                    onClick={() => toggleLocation('district', d._id)}
                    colorClass="green"
                    count={getRuleCount('district', d._id)}
                    selectionNumber={selectedLocation.district?.indexOf(d._id) + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Provider Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-end items-center">

            <div className="flex items-center space-x-3">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Add loan provider..."
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                  className="pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-64 shadow-inner"
                />
                <button
                  onClick={handleProviderAction}
                  disabled={saving || !newProviderName.trim()}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap gap-3 mb-8">
              {providers.map(p => (
                <div
                  key={p._id}
                  onClick={() => setSelectedProviderId(p._id)}
                  className={`group flex items-center px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${selectedProviderId === p._id
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-blue-200 text-gray-600'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg mr-3 ${selectedProviderId === p._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                    <Building2 size={14} />
                  </div>
                  <span className="text-xs font-bold tracking-tight">{p.name}</span>

                  <div className="ml-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProvider(p);
                        setNewProviderName(p.name);
                      }}
                      className="p-1 hover:bg-blue-200 rounded text-blue-600"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProvider(p._id);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {selectedProviderId === p._id && (
                    <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                      <CheckCircle size={10} />
                    </div>
                  )}
                </div>
              ))}
              {providers.length === 0 && (
                <div className="text-gray-400 text-xs font-medium italic py-2">No providers added yet. Use the input above to add one.</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-600 tracking-tight">Loan Provider Type <span className="text-red-500">*</span></label>
                <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200">
                  {['NBFC', 'BANK', 'EMI'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setLoanProviderType(type)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${loanProviderType === type
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-600">Order Type <span className="text-red-500">*</span></label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                >
                  <option value="Combokit">Combokit</option>
                  <option value="Customised kit">Customised kit</option>
                </select>
              </div>

              {orderType === 'Combokit' && (
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-bold text-gray-600">Select Combokit</label>
                  <Select
                    isMulti
                    value={selectedCombokits}
                    onChange={(selected) => setSelectedCombokits(selected)}
                    options={combokits.map(kit => ({ value: kit._id, label: kit.name }))}
                    className="text-xs font-bold shadow-sm"
                    classNamePrefix="select"
                    placeholder="Select Combokits..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        borderColor: '#e5e7eb',
                        padding: '2px',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#3b82f6'
                        }
                      })
                    }}
                  />
                </div>
              )}

              {orderType === 'Customised kit' && (
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-bold text-gray-600">Select Customised Kit</label>
                  <Select
                    isMulti
                    value={selectedCustomizedKits}
                    onChange={(selected) => setSelectedCustomizedKits(selected)}
                    options={customizedKits.map(kit => ({ value: kit._id, label: kit.solarkitName || kit.name }))}
                    className="text-xs font-bold shadow-sm"
                    classNamePrefix="select"
                    placeholder="Select Customised Kits..."
                  />
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-600">Category</label>
                <Select
                  isMulti
                  value={selectedCategories}
                  onChange={(selected) => setSelectedCategories(selected || [])}
                  options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                  className="text-xs font-bold shadow-sm"
                  placeholder="Select Categories..."
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-600">Sub Category</label>
                <Select
                  isMulti
                  value={selectedSubCategories}
                  onChange={(selected) => setSelectedSubCategories(selected || [])}
                  options={subCategories.map(sub => ({ value: sub._id, label: sub.name }))}
                  className="text-xs font-bold shadow-sm"
                  placeholder="Select Sub Categories..."
                  isDisabled={selectedCategories.length === 0}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-600">Project Type</label>
                <Select
                  isMulti
                  value={selectedProjectTypes}
                  onChange={(selected) => setSelectedProjectTypes(selected || [])}
                  options={projectTypes.map(pt => ({ value: pt.label, label: pt.label }))}
                  className="text-xs font-bold shadow-sm"
                  placeholder="Select Project Types..."
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-600">Sub Project Type</label>
                <Select
                  isMulti
                  value={selectedSubProjectTypes}
                  onChange={(selected) => setSelectedSubProjectTypes(selected || [])}
                  options={subProjectTypes.map(sub => ({ value: sub._id, label: sub.name }))}
                  className="text-xs font-bold shadow-sm"
                  placeholder="Select Sub Project Types..."
                  isDisabled={selectedProjectTypes.length === 0}
                />
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 mb-8 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                <h4 className="text-[#003366] font-bold text-md flex items-center">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></div>
                  Parameters Scoring Configuration (Total must be 100)
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font text-gray-500 uppercase tracking-widest">Total Configured Score:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm border-2 ${Object.values(formFields).reduce((acc, f) => acc + (f.ranges || []).reduce((ra, r) => ra + (r.score || 0), 0), 0) === 100
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                    : 'bg-red-50 border-red-500 text-red-600'
                    }`}>
                    {Object.values(formFields).reduce((acc, f) => acc + (f.ranges || []).reduce((ra, r) => ra + (r.score || 0), 0), 0)} / 100
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {fieldOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 ${formFields[opt.id]?.selected
                      ? 'border-blue-400 shadow-lg'
                      : 'border-gray-100 opacity-90'
                      }`}
                  >
                    <div
                      className={`p-4 flex items-center justify-between cursor-pointer ${formFields[opt.id]?.selected ? 'bg-blue-50' : ''}`}
                      onClick={() => handleCheckboxChange(opt.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formFields[opt.id]?.selected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-gray-200 text-transparent'
                          }`}>
                          <CheckCircle size={14} />
                        </div>
                        <div className="ml-4">
                          <span className={`text-sm font ${formFields[opt.id]?.selected ? 'text-blue-900' : 'text-gray-600'}`}>
                            {opt.label}
                          </span>
                          {opt.secondaryLabel && (
                            <span className="ml-2 text-[10px] font-bold text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              Linked to {opt.secondaryLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {formFields[opt.id]?.selected && (
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Total Score</span>
                            <div className="w-12 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-xs font-black text-blue-700 shadow-inner">
                              {(formFields[opt.id]?.ranges || []).reduce((sum, r) => sum + (r.score || 0), 0)}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); addRange(opt.id); }}
                            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all shadow-sm"
                          >
                            <Plus size={14} className="mr-1" /> ADD RANGE
                          </button>
                        </div>
                      )}
                    </div>

                    {formFields[opt.id]?.selected && (
                      <div className="p-4 pt-0">
                        <div className="space-y-3">
                          {(formFields[opt.id]?.ranges || []).map((range, bIdx) => (
                            <div key={bIdx} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">From Value</label>
                                  <input
                                    type="number"
                                    value={range.from}
                                    onChange={(e) => updateRange(opt.id, bIdx, 'from', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-700 shadow-inner"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">To Value</label>
                                  <input
                                    type="number"
                                    value={range.to}
                                    onChange={(e) => updateRange(opt.id, bIdx, 'to', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-700 shadow-inner"
                                  />
                                </div>
                                {opt.secondaryLabel && (
                                  <>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{opt.secondaryLabel} From</label>
                                      <input
                                        type="number"
                                        value={range.secondaryFrom}
                                        onChange={(e) => updateRange(opt.id, bIdx, 'secondaryFrom', e.target.value)}
                                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg text-xs font-bold text-blue-600 shadow-inner"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{opt.secondaryLabel} To</label>
                                      <input
                                        type="number"
                                        value={range.secondaryTo}
                                        onChange={(e) => updateRange(opt.id, bIdx, 'secondaryTo', e.target.value)}
                                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg text-xs font-bold text-blue-600 shadow-inner"
                                      />
                                    </div>
                                  </>
                                )}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Score Points</label>
                                  <input
                                    type="number"
                                    value={range.score}
                                    onChange={(e) => updateRange(opt.id, bIdx, 'score', e.target.value)}
                                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 shadow-inner"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => removeRange(opt.id, bIdx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-[#003366] font-bold text-md mb-6 flex items-center uppercase tracking-widest text-[11px]">
                  <ChevronRight className="mr-2 text-blue-500" size={18} />
                  Loan Score Outcome Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {outcomes.map((outcome, oIdx) => (
                    <div key={oIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${outcome.status === 'approved' ? 'bg-emerald-500' :
                          outcome.status === 'pre-approved' ? 'bg-blue-500' :
                            outcome.status === 'manual call' ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{outcome.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Min Score</label>
                          <input
                            type="number"
                            value={outcome.minScore}
                            onChange={(e) => updateOutcome(oIdx, 'minScore', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Max Score</label>
                          <input
                            type="number"
                            value={outcome.maxScore}
                            onChange={(e) => updateOutcome(oIdx, 'maxScore', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-gray-800 flex items-center text-sm">
                  <ChevronRight size={18} className="mr-2 text-blue-500" />
                  Loan Scoring Outcome Status
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hierarchy & Provider</th>
                      <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scoring Outcomes</th>
                      <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loanRules.length > 0 ? loanRules.map(rule => (
                      <tr key={rule._id} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase tracking-tighter">
                                {rule.loanProviderType}
                              </span>
                              {rule.loanProviderId && <span className="text-xs font-black text-gray-800">{rule.loanProviderId.name}</span>}
                            </div>
                            <div className="flex flex-col">
                              <div className="text-[10px] font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100 inline-block w-fit">
                                {rule.categoryIds?.length > 0 
                                  ? rule.categoryIds.map(c => c.name).join(', ') 
                                  : rule.categoryId?.name || 'All Categories'}
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold mt-1">
                                {rule.projectType ? `${rule.projectType}` : 'All Project Types'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center justify-center">
                            {(() => {
                              const totalScore = (rule.fields || []).reduce((acc, f) => 
                                acc + (f.ranges || []).reduce((ra, r) => ra + (r.score || 0), 0), 0
                              );
                              return (
                                <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border-2 transition-all shadow-sm ${
                                  totalScore === 100 
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                    : 'bg-red-50 border-red-500 text-red-700'
                                }`}>
                                  <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Total Score</span>
                                  <span className="text-sm font-black leading-none">{totalScore} / 100</span>
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setIsEditing(true);
                                setCurrentEditingRuleId(rule._id);

                                // Restore Main Hierarchy
                                setLoanProviderType(rule.loanProviderType);
                                setOrderType(rule.orderType);
                                setSelectedProviderId(rule.loanProviderId?._id || rule.loanProviderId || '');
                                
                                // Map plural IDs for multi-select
                                setSelectedCategories(rule.categoryIds?.length > 0 
                                  ? rule.categoryIds.map(c => ({ value: c._id || c, label: c.name || 'Category' })) 
                                  : rule.categoryId ? [{ value: rule.categoryId._id || rule.categoryId, label: rule.categoryId.name || 'Category' }] : []);
                                
                                setSelectedSubCategories(rule.subCategoryIds?.length > 0 
                                  ? rule.subCategoryIds.map(c => ({ value: c._id || c, label: c.name || 'Sub Category' })) 
                                  : rule.subCategoryId ? [{ value: rule.subCategoryId._id || rule.subCategoryId, label: rule.subCategoryId.name || 'Sub Category' }] : []);
                                
                                setSelectedProjectTypes(rule.projectType ? [{ value: rule.projectType, label: rule.projectType }] : []);
                                
                                setSelectedSubProjectTypes(rule.subProjectTypeIds?.length > 0 
                                  ? rule.subProjectTypeIds.map(c => ({ value: c._id || c, label: c.name || 'Sub Project Type' })) 
                                  : rule.subProjectTypeId ? [{ value: rule.subProjectTypeId._id || rule.subProjectTypeId, label: rule.subProjectTypeId.name || 'Sub Project Type' }] : []);
                                
                                setSelectedCombokits(rule.combokitId ? [{ value: rule.combokitId._id || rule.combokitId, label: rule.combokitId.name || 'Selected Combokit' }] : []);
                                setSelectedCustomizedKits(rule.customizedKitIds?.length > 0 
                                  ? rule.customizedKitIds.map(c => ({ value: c._id || c, label: c.solarkitName || c.name || 'Custom Kit' })) 
                                  : rule.customizedKitId ? [{ value: rule.customizedKitId._id || rule.customizedKitId, label: rule.customizedKitId.solarkitName || rule.customizedKitId.name || 'Custom Kit' }] : []);

                                // Restore Location Hierarchy
                                setSelectedLocation({
                                  country: (rule.countries || []).length > 0 ? (rule.countries || []).map(l => l._id || l) : ['all'],
                                  state: (rule.states || []).length > 0 ? (rule.states || []).map(l => l._id || l) : [],
                                  cluster: (rule.clusters || []).length > 0 ? (rule.clusters || []).map(l => l._id || l) : [],
                                  district: (rule.districts || []).length > 0 ? (rule.districts || []).map(l => l._id || l) : []
                                });

                                // Explicitly set form fields and outcomes for immediate feedback
                                if (rule.fields) {
                                  const fieldData = {};
                                  rule.fields.forEach(f => {
                                    fieldData[f.name] = { selected: f.selected, ranges: f.ranges || [] };
                                  });
                                  setFormFields(fieldData);
                                }
                                if (rule.outcomes) setOutcomes(rule.outcomes);

                                setSuccess(`Editing configuration for ${rule.loanProviderId?.name || rule.loanProviderType}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleRemove(rule._id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                          No loan configurations found for the current selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 mb-12 flex justify-end items-center space-x-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="mr-auto">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Finalize Configuration</h4>
            <p className="text-[10px] text-gray-500 font-medium">All changes will be applied to the selected hierarchy.</p>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset Form
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save All Settings
          </button>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center border border-gray-50">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <span className="mt-4 text-gray-700 font-bold tracking-wide">Syncing Configurations...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
