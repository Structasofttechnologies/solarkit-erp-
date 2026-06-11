import React, { useState, useEffect } from 'react';
import {
  Eye, Trash2, Edit, X, Plus,
  Settings, FileText, Grid,
  BarChart3, Package, Building,
  Home, Layers, Cable, Wrench,
  ChevronDown, ChevronUp, GripVertical,
  Maximize2, Minimize2, Layout
} from 'lucide-react';
import {
  getQuoteSettings,
  createSurveyBOM,
  getSurveyBOMs,
  deleteSurveyBOM,
  updateSurveyBOM,
  getTerraceTypes,
  getBuildingTypes,
  getStructureTypes
} from '../../../../services/quote/quoteApi';
import { useLocations } from '../../../../hooks/useLocations';
import { MapPin, Globe, Map, Navigation } from 'lucide-react';
import { productApi } from '../../../../api/productApi';
import toast from 'react-hot-toast';

// Drag and Drop Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SurveyBomSetting() {
  const [projectTypes, setProjectTypes] = useState([]);
  const [surveyBoms, setSurveyBoms] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false); // Forced to false to prevent any background refreshing

  // Dynamic Option Lists
  const [terraceTypes, setTerraceTypes] = useState([]);
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Current BOM being viewed/edited
  const [currentBom, setCurrentBom] = useState(null);

  const [bomForm, setBomForm] = useState({
    terraceType: '',
    buildingType: '',
    structureType: '',
    floorCount: '1'
  });

  const [sections, setSections] = useState([
    { 
      id: 's1', 
      name: 'Standard Pipes', 
      productLabel: 'Product', 
      isCollapsed: false,
      rows: [{ id: Date.now() + 1, product: '', formulaItem: '', formulaQty: 1, price: 0 }] 
    },
    { 
      id: 's2', 
      name: 'Structure Accessories', 
      productLabel: 'Product', 
      isCollapsed: false,
      rows: [{ id: Date.now() + 2, product: '', formulaItem: '', formulaQty: 1, price: 0 }] 
    }
  ]);

  const [summaryData, setSummaryData] = useState({
    pipes: { items: 0, qty: 0, price: 0 },
    accessories: { items: 0, qty: 0, price: 0 },
    wires: { items: 0, qty: 0, price: 0 },
    total: { items: 0, qty: 0, price: 0 }
  });

  // These could be dynamic too, but for now we keep them static or fetch if available
  const [productOptions, setProductOptions] = useState([]);
  const formulaOptions = ['Solar panel', 'Inverter', 'Battery'];

  // Master Data Lists
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterMappings, setMasterMappings] = useState([]);

  // Location Hook
  const {
    countries, states, clusters, districts,
    selectedCountry, setSelectedCountry,
    selectedState, setSelectedState,
    selectedCluster, setSelectedCluster,
    selectedDistrict, setSelectedDistrict,
    loading: locationsLoading
  } = useLocations();

  const [loading, setLoading] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [viewAllData, setViewAllData] = useState([]);
  const [masterDataLoaded, setMasterDataLoaded] = useState(false);
  const [locationStats, setLocationStats] = useState({
    countries: {},
    states: {},
    clusters: {},
    districts: {},
    totalBoms: 0
  });

  // Fetch Master Data ONCE on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          allTerraces, allBuildings, allStructures,
          allCats, allSubCats, allPTypes, allSubPTypes,
          mappings, allProducts
        ] = await Promise.all([
          getTerraceTypes(),
          getBuildingTypes(),
          getStructureTypes(),
          productApi.getCategories(),
          productApi.getSubCategories(),
          productApi.getProjectTypes(),
          productApi.getSubProjectTypes(),
          productApi.getProjectCategoryMappings(),
          productApi.getAll()
        ]);

        const safeExtract = (data) => (data?.data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : (data?.data?.data ? data.data.data : []));
        
        setMasterCategories(safeExtract(allCats));
        setMasterMappings(safeExtract(mappings));
        setTerraceTypes(safeExtract(allTerraces).map(t => t.name || t));
        setBuildingTypes(safeExtract(allBuildings).map(b => b.name || b));
        setStructureTypes(safeExtract(allStructures).map(s => s.name || s));
        setProductOptions(safeExtract(allProducts).map(p => p.modelName || p.name || p));
        setMasterDataLoaded(true);
      } catch (error) {
        console.error("Master data load error:", error);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    // Debounce to prevent multiple refreshes when location hook resets children
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedCountry, selectedState, selectedCluster, selectedDistrict]);

  const fetchInitialData = async () => {
    const safeExtract = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.data?.data && Array.isArray(data.data.data)) return data.data.data;
      return [];
    };

    try {
      setLoading(true);
      
      const filterParams = {
        countryId: selectedCountry,
        stateId: selectedState,
        clusterId: selectedCluster,
        districtId: selectedDistrict
      };

      const [
        allQuotes, 
        allBoms, 
        fullQuotesRaw,
        fullBomsRaw
      ] = await Promise.all([
        getQuoteSettings(filterParams),
        getSurveyBOMs(filterParams),
        getQuoteSettings({}), // Global settings for stats
        getSurveyBOMs({})      // Global boms for stats
      ]);

      const quotesData = safeExtract(allQuotes);
      const bomsData = safeExtract(allBoms);
      const fullQuotes = safeExtract(fullQuotesRaw);
      const fullBoms = safeExtract(fullBomsRaw);

      // Calculate Location Stats
      const stats = { countries: {}, states: {}, clusters: {}, districts: {}, totalBoms: fullBoms.length };
      fullQuotes.forEach(q => {
          const cid = q.countryId || q.country;
          const sid = q.state?._id || q.state;
          const clid = q.cluster?._id || q.cluster;
          const did = q.district?._id || q.district;
          
          const bomCount = fullBoms.filter(b => b.quoteSettingsId === q._id).length;
          
          if (cid) stats.countries[cid] = (stats.countries[cid] || 0) + bomCount;
          if (sid) stats.states[sid] = (stats.states[sid] || 0) + bomCount;
          if (clid) stats.clusters[clid] = (stats.clusters[clid] || 0) + bomCount;
          if (did) stats.districts[did] = (stats.districts[did] || 0) + bomCount;
      });
      setLocationStats(stats);

      // Table Row Generation: Use QuoteSettings for index list
      const projectsWithCounts = quotesData.filter(q => q.isActive !== false).map(q => {
        const count = bomsData.filter(b => b.quoteSettingsId === q._id).length;
        return {
          id: q._id,
          category: q.category,
          subCategory: q.subCategory,
          projectType: q.projectType,
          subProjectType: q.subProjectType,
          totalBom: count
        };
      });

      setProjectTypes(projectsWithCounts);
      setSurveyBoms(bomsData);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load settings data");
    }
  };


  useEffect(() => {
    if (autoRefresh) {
      calculateSummary();
    }
  }, [sections, autoRefresh]);

  const calculateSummary = () => {
    const sectionSummaries = sections.map(section => {
      return {
        name: section.name,
        items: section.rows.filter(item => item.product && item.product.trim() !== '').length,
        qty: section.rows.reduce((sum, item) => sum + (parseFloat(item.formulaQty) || 0), 0),
        price: section.rows.reduce((sum, item) => sum + (parseFloat(item.price) || (parseFloat(item.formulaQty) || 0) * (item.unitPrice || 0)), 0)
      };
    });

    const totalSummary = {
      items: sectionSummaries.reduce((sum, s) => sum + s.items, 0),
      qty: sectionSummaries.reduce((sum, s) => sum + s.qty, 0),
      price: sectionSummaries.reduce((sum, s) => sum + s.price, 0)
    };

    setSummaryData({
      sections: sectionSummaries,
      total: totalSummary
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedProject(null);
    setEditingId(null);
  };

  const handleOpenCreateModal = (project) => {
    setSelectedProject(project);
    setShowCreateModal(true);
    // Reset form
    setBomForm({
      category: project ? project.category : '',
      subCategory: project ? project.subCategory : '',
      projectType: project ? project.projectType : '',
      subProjectType: project ? project.subProjectType : '',
      terraceType: '',
      buildingType: '',
      structureType: '',
      floorCount: '1'
    });
    setSections([
      { 
        id: 's1', 
        name: 'Standard Pipes', 
        productLabel: 'Product', 
        isCollapsed: false,
        rows: [{ id: Date.now() + 1, product: '', formulaItem: '', formulaQty: 1, price: 0 }] 
      },
      { 
        id: 's2', 
        name: 'Structure Accessories', 
        productLabel: 'Product', 
        isCollapsed: false,
        rows: [{ id: Date.now() + 2, product: '', formulaItem: '', formulaQty: 1, price: 0 }] 
      }
    ]);
  };


  const handleBomFormChange = (field, value) => {
    setBomForm({ ...bomForm, [field]: value });
  };

  const handleAddRow = (sectionId) => {
    const newRow = {
      id: Date.now(),
      product: '',
      formulaItem: '',
      formulaQty: 1,
      price: 0
    };

    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, rows: [...s.rows, newRow] };
      }
      return s;
    }));
  };

  const handleDeleteRow = (sectionId, rowId) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, rows: s.rows.filter(r => r.id !== rowId) };
      }
      return s;
    }));
  };

  const handleTableDataChange = (sectionId, rowId, field, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const updatedRows = s.rows.map(r => {
          if (r.id === rowId) {
            return { 
              ...r, 
              [field]: field === 'price' || field === 'formulaQty' ? parseFloat(value) || 0 : value 
            };
          }
          return r;
        });
        return { ...s, rows: updatedRows };
      }
      return s;
    }));
  };

  const handleAddSection = () => {
    const newSection = {
      id: `s${Date.now()}`,
      name: 'New Section',
      productLabel: 'Product',
      isCollapsed: false,
      rows: [{ id: Date.now() + 1, product: '', formulaItem: '', formulaQty: 1, price: 0 }]
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId) => {
    if (sections.length <= 1) {
      toast.error("At least one section is required");
      return;
    }
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleUpdateSection = (sectionId, field, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const toggleSectionCollapse = (sectionId) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, isCollapsed: !s.isCollapsed };
      }
      return s;
    }));
  };

  const handleEditSingleBom = (bom) => {
    setEditingId(bom._id);
    setSelectedProject({ id: bom.quoteSettingsId, category: bom.category, subCategory: bom.subCategory, projectType: bom.projectType, subProjectType: bom.subProjectType });
    setBomForm({
      category: bom.category,
      subCategory: bom.subCategory,
      projectType: bom.projectType,
      subProjectType: bom.subProjectType,
      terraceType: bom.terraceType,
      buildingType: bom.buildingType,
      structureType: bom.structureType,
      floorCount: bom.floorCount || '1'
    });
    // Convert sections from DB to state format
    setSections((bom.sections || []).map((s, idx) => ({
      ...s,
      id: s.id || `s-${idx}-${Date.now()}`,
      isCollapsed: false,
      rows: (s.rows || []).map((r, rIdx) => ({ ...r, id: r.id || r._id || `r-${rIdx}-${Date.now()}` }))
    })));
    setShowCreateModal(true);
  };

  const handleCreateBom = async () => {
    if (!bomForm.category || !bomForm.subCategory || !bomForm.projectType || !bomForm.subProjectType) {
      toast.error('Please select Category, SubCategory and Project Types');
      return;
    }

    if (!bomForm.terraceType || !bomForm.buildingType || !bomForm.structureType) {
      toast.error('Please fill all installation fields');
      return;
    }

    // Find the matching project ID from projectTypes if not provided
    let quoteSettingsId = selectedProject?.id;
    if (!quoteSettingsId) {
      const match = projectTypes.find(p => 
        p.category === bomForm.category && 
        p.subCategory === bomForm.subCategory && 
        p.projectType === bomForm.projectType && 
        p.subProjectType === bomForm.subProjectType
      );
      if (match) {
        quoteSettingsId = match.id;
      }
    }

    const payload = {
      quoteSettingsId,
      category: bomForm.category,
      subCategory: bomForm.subCategory,
      projectType: bomForm.projectType,
      subProjectType: bomForm.subProjectType,
      terraceType: bomForm.terraceType,
      buildingType: bomForm.buildingType,
      structureType: bomForm.structureType,
      floorCount: bomForm.buildingType === 'Flat' ? parseInt(bomForm.floorCount) : null,
      sections: sections.map(s => ({
        name: s.name,
        productLabel: s.productLabel,
        rows: s.rows.map(r => ({
          product: r.product,
          formulaItem: r.formulaItem,
          formulaQty: r.formulaQty,
          price: r.price
        }))
      }))
    };

    try {
      if (editingId) {
        await updateSurveyBOM(editingId, payload);
        toast.success("BOM updated successfully");
      } else {
        await createSurveyBOM(payload);
        toast.success("BOM created successfully");
      }
      setShowCreateModal(false);
      setEditingId(null);
      // Auto-refresh disabled to prevent UI disruption
      // if (autoRefresh) {
      //   fetchInitialData();
      // }
    } catch (error) {
      console.error("Error saving BOM:", error);
      toast.error("Failed to save BOM");
    }
  };

  const handleViewBomDetails = (project) => {
    setSelectedProject(project);
    const filteredBoms = surveyBoms.filter(b =>
      b.category === project.category &&
      b.subCategory === project.subCategory &&
      b.projectType === project.projectType &&
      b.subProjectType === project.subProjectType
    );
    setViewAllData(filteredBoms);
    setShowViewAllModal(true);
  };

    // Actually, "BOM Details" section in the original code showed ONE BOM details (staticBomData[selectedProject][0]).
    // I will show a list of configured BOMs for this project below.

  const handleCloseDetails = () => {
    setSelectedProject(null);
    setCurrentBom(null);
    setShowDetailedView(false);
  };

  const handleDeleteConfiguration = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteSurveyBOM(id);
        toast.success("BOM configuration deleted");
        // Update state locally
        setSurveyBoms(prev => prev.filter(b => b._id !== id));
        // Also update project counts (refresh or manual)
        // Auto-refresh disabled to prevent UI disruption
        // if (autoRefresh) {
        //     fetchInitialData();
        // }
        if (currentBom?._id === id) {
          setCurrentBom(null);
          setShowDetailedView(false);
        }
      } catch (error) {
        console.error("Error deleting BOM:", error);
        toast.error("Failed to delete BOM");
      }
    }
  };

  const handleViewSingleBom = (bom) => {
    setCurrentBom(bom);
    setShowDetailedView(true);
  };

  // Filter BOMs for the currently selected project for the list view
  const projectBoms = selectedProject ? surveyBoms.filter(b => b.quoteSettingsId === selectedProject.id) : [];

  const tableHeaderStyle = "px-6 py-4 text-xs font-black text-white uppercase tracking-widest text-center border-r border-[#4db2eb]/30 last:border-r-0";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
              <Settings size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Survey BOM Settings</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenCreateModal(null)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              CREATE NEW CONFIGURATION
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2" />
            {/* Auto Refresh toggle removed per user request to stop 25s auto-refresh behavior */}
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 opacity-50 cursor-not-allowed">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Manual Refresh Mode
              </span>
              <div className="w-12 h-6 bg-gray-300 rounded-full p-1 transition-all duration-300">
                <div className="w-4 h-4 bg-white rounded-full transition-all duration-300 ml-0" />
              </div>
            </div>
            
            <button 
              onClick={fetchInitialData}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-2xl text-xs font-black hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Settings size={14} className={autoRefresh ? 'animate-spin' : ''} />
              REFRESH DATA
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection Filters */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-100/30 border border-blue-50/50 p-8 mb-12">
        <div className="space-y-8">
          {/* Country Selection */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select Country</h3>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedCountry('')}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
                >
                  Select All
                </button>
                <button 
                  onClick={() => setSelectedCountry('')}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              </div>
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
                ALL COUNTRIES ({locationStats.totalBoms || 0})
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
                  {country.name} {locationStats.countries[country._id] ? `(${locationStats.countries[country._id]})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* State Selection */}
          <div className="pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-blue-500" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select State</h3>
              </div>
              <button 
                onClick={() => setSelectedState('')}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
              >
                Select All
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
                ALL STATES ({locationStats.totalBoms || 0})
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
                  {state.name} {locationStats.states[state._id] ? `(${locationStats.states[state._id]})` : ''}
                </button>
              ))}
              {states.length === 0 && <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2">No states found</p>}
            </div>
          </div>

          {/* Cluster Selection */}
          <div className="pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Map size={18} className="text-blue-500" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select Cluster</h3>
              </div>
              <button 
                onClick={() => setSelectedCluster('')}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
              >
                Select All
              </button>
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
                ALL CLUSTERS ({locationStats.totalBoms || 0})
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
                  {cluster.name} {locationStats.clusters[cluster._id] ? `(${locationStats.clusters[cluster._id]})` : ''}
                </button>
              ))}
              {clusters.length === 0 && <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2">No clusters found</p>}
            </div>
          </div>

          {/* District Selection */}
          <div className="pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Navigation size={18} className="text-blue-500" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Select District</h3>
              </div>
              <button 
                onClick={() => setSelectedDistrict('')}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
              >
                Select All
              </button>
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
                ALL DISTRICTS ({locationStats.totalBoms || 0})
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
                  {district.name} {locationStats.districts[district._id] ? `(${locationStats.districts[district._id]})` : ''}
                </button>
              ))}
              {districts.length === 0 && <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2">No districts found</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Project Type Table */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-100/30 border border-blue-50/50 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-6 text-white border-r border-slate-800">Create BOM</th>
                <th className="px-6 py-6 text-white border-r border-slate-800 text-center">Category</th>
                <th className="px-6 py-6 text-white border-r border-slate-800 text-center">Sub Category</th>
                <th className="px-6 py-6 text-white border-r border-slate-800 text-center">Project Type</th>
                <th className="px-6 py-6 text-white border-r border-slate-800 text-center">Sub Project Type</th>
                <th className="px-6 py-6 text-white border-r border-slate-800 text-center">Total BOM</th>
                <th className="px-6 py-6 text-white text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projectTypes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Package size={48} strokeWidth={1.5} />
                      <p className="font-bold">No project types found.</p>
                    </div>
                  </td>
                </tr>
              ) : projectTypes.map((project, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5 border-r border-gray-50">
                    <button
                      className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs shadow-md shadow-blue-100"
                      onClick={() => handleOpenCreateModal(project)}
                    >
                      <Plus size={16} strokeWidth={3} />
                      CREATE BOM
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-gray-600 text-sm border-r border-gray-50">{project.category}</td>
                  <td className="px-6 py-5 text-center font-bold text-gray-400 text-xs border-r border-gray-50">{project.subCategory}</td>
                  <td className="px-6 py-5 text-center font-bold text-gray-600 text-sm border-r border-gray-50">{project.projectType}</td>
                  <td className="px-6 py-5 text-center font-bold text-gray-400 text-xs border-r border-gray-50">{project.subProjectType}</td>
                  <td className="px-6 py-5 text-center border-r border-gray-50">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 bg-blue-100 text-blue-700 rounded-full text-xs font-black shadow-inner">
                      {project.totalBom}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${project.totalBom > 0
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                      onClick={() => project.totalBom > 0 && handleViewBomDetails(project)}
                      disabled={project.totalBom === 0}
                    >
                      <Eye size={16} strokeWidth={2.5} />
                      VIEW ALL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved BOM Templates Gallery */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Saved BOM Templates</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Review your active configurations</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm">
            <span className="text-sm font-black text-blue-600">{surveyBoms.length}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Configs</span>
          </div>
        </div>

        {surveyBoms.length === 0 ? (
          <div className="bg-blue-50/50 border-2 border-dashed border-blue-100 rounded-[2rem] p-16 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Plus size={32} className="text-blue-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No saved templates yet. Start creating above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {surveyBoms.map((bom) => (
              <div key={bom._id} className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-blue-100/20 hover:shadow-blue-200/40 hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                    <Layout size={24} className="text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewSingleBom(bom)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => handleEditSingleBom(bom)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm"
                      title="Edit Configuration"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteConfiguration(bom._id)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">{bom.category}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bom.subCategory}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                      <p className="text-xs font-black text-gray-700">{bom.projectType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Items</p>
                      <p className="text-xs font-black text-gray-700">{bom.sections?.reduce((acc, s) => acc + s.rows.length, 0) || 0} Products</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-[9px] font-black text-blue-600 rounded-lg uppercase tracking-tighter">{bom.terraceType}</span>
                    <span className="px-3 py-1 bg-slate-50 text-[9px] font-black text-gray-500 rounded-lg uppercase tracking-tighter">{bom.structureType}</span>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOM Configurations List */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              BOM Configurations for {selectedProject.category} - {selectedProject.projectType}
            </h2>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-2"
              onClick={handleCloseDetails}
            >
              <X size={18} />
              Close
            </button>
          </div>

          {projectBoms.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No BOMs found for this project.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projectBoms.map(bom => (
                <div key={bom._id} className="border border-gray-200 rounded p-4 flex justify-between items-center bg-gray-50">
                  <div>
                    <span className="font-semibold text-blue-800 block">{bom.terraceType} | {bom.buildingType} | {bom.structureType}</span>
                    <span className="text-sm text-gray-600 block">Items: {bom.pipes?.length || 0} Pipes, {bom.accessories?.length || 0} Acc, {bom.wires?.length || 0} Wires</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewSingleBom(bom)}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 text-sm flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => handleEditSingleBom(bom)}
                      className="bg-amber-100 text-amber-600 px-3 py-1 rounded hover:bg-amber-200 text-sm flex items-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfiguration(bom._id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed View Section */}
          {showDetailedView && currentBom && (() => {
            const allSections = currentBom.sections || [];
            const totalQty = allSections.reduce((acc, s) => acc + s.rows.reduce((rSum, r) => rSum + (r.formulaQty || 0), 0), 0);
            const grandTotal = allSections.reduce((acc, s) => acc + s.rows.reduce((rSum, r) => rSum + ((r.formulaQty || 0) * (r.price || 0)), 0), 0);

            return (
              <div className="bg-white rounded-3xl border border-gray-100 mt-8 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="bg-[#5e666d] px-8 py-5 flex justify-between items-center">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Detailed BOM View</h3>
                  <button
                      className="bg-white/10 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-white/20 transition-all shadow-md"
                      onClick={() => setShowDetailedView(false)}
                    >
                      Close View
                    </button>
                </div>

                <div className="p-8">
                  <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#72b5f1]">
                          <th className="px-6 py-5 text-sm font-black text-white border-r border-white/20">Category</th>
                          <th className="px-6 py-5 text-sm font-black text-white border-r border-white/20">Item Name</th>
                          <th className="px-6 py-5 text-sm font-black text-white text-center border-r border-white/20">Quantity</th>
                          <th className="px-6 py-5 text-sm font-black text-white text-center border-r border-white/20">Price</th>
                          <th className="px-6 py-5 text-sm font-black text-white text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {allSections.map((section) => (
                          <React.Fragment key={section._id || section.name}>
                            {section.rows.map((row, rIdx) => (
                              <tr key={row._id || rIdx} className="hover:bg-blue-50/10 transition-colors">
                                {rIdx === 0 && (
                                  <td rowSpan={section.rows.length} className="px-6 py-4 font-black text-blue-600 bg-blue-50/30 text-xs border-r border-gray-100 align-top">
                                    {section.name}
                                  </td>
                                )}
                                <td className="px-6 py-4 font-bold text-gray-700 text-sm border-r border-gray-50">{row.product || row.formulaItem}</td>
                                <td className="px-6 py-4 text-center font-bold text-gray-600 text-sm border-r border-gray-50">{row.formulaQty}</td>
                                <td className="px-6 py-4 text-center font-bold text-gray-600 text-sm border-r border-gray-50">₹{(row.price || 0).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-black text-blue-600 text-sm">₹{((row.formulaQty || 0) * (row.price || 0)).toFixed(2)}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#72b5f1]">
                          <td colSpan="2" className="px-6 py-6 font-black text-white uppercase tracking-widest">Grand Total</td>
                          <td className="px-6 py-6 text-center font-black text-white">{totalQty}</td>
                          <td></td>
                          <td className="px-6 py-6 text-right font-black text-white tracking-widest">₹{grandTotal.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Create BOM Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Create New BOM</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select
                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 font-bold text-gray-700 text-xs shadow-sm shadow-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={bomForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBomForm(prev => ({ ...prev, category: val, subCategory: '', projectType: '', subProjectType: '' }));
                    }}
                  >
                    <option value="">Select Category</option>
                    {[...new Set(masterMappings.map(m => m.categoryId?.name).filter(Boolean))].map((c, i) => <option key={`cat-${c}-${i}`} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 ml-1">Sub Category</label>
                  <select
                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 font-bold text-gray-700 text-xs shadow-sm shadow-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={bomForm.subCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBomForm(prev => ({ ...prev, subCategory: val, projectType: '', subProjectType: '' }));
                    }}
                  >
                    <option value="">Select Sub Category</option>
                    {[...new Set(masterMappings
                      .filter(m => !bomForm.category || m.categoryId?.name === bomForm.category)
                      .map(m => m.subCategoryId?.name)
                      .filter(Boolean)
                    )].map((s, i) => <option key={`sub-${s}-${i}`} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 ml-1">Project Type</label>
                  <select
                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 font-bold text-gray-700 text-xs shadow-sm shadow-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={bomForm.projectType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBomForm(prev => ({ ...prev, projectType: val, subProjectType: '' }));
                    }}
                  >
                    <option value="">Select Project Type</option>
                    {[...new Set(masterMappings
                      .filter(m => 
                        (!bomForm.category || m.categoryId?.name === bomForm.category) && 
                        (!bomForm.subCategory || m.subCategoryId?.name === bomForm.subCategory)
                      )
                      .map(m => m.projectTypeFrom && m.projectTypeTo ? `${m.projectTypeFrom} to ${m.projectTypeTo} kW` : (m.projectType?.name || m.projectType))
                      .filter(Boolean)
                    )].map((pt, i) => <option key={`pt-${pt}-${i}`} value={pt}>{pt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 ml-1">Sub Proj Type</label>
                  <select
                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 font-bold text-gray-700 text-xs shadow-sm shadow-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={bomForm.subProjectType}
                    onChange={(e) => handleBomFormChange('subProjectType', e.target.value)}
                  >
                    <option value="">Select Sub Proj Type</option>
                    {[...new Set(masterMappings
                      .filter(m => 
                        (!bomForm.category || m.categoryId?.name === bomForm.category) && 
                        (!bomForm.subCategory || m.subCategoryId?.name === bomForm.subCategory) &&
                        (!bomForm.projectType || (m.projectTypeFrom && m.projectTypeTo ? `${m.projectTypeFrom} to ${m.projectTypeTo} kW` : (m.projectType?.name || m.projectType)) === bomForm.projectType)
                      )
                      .map(m => m.subProjectTypeId?.name || m.subProjectType?.name || m.subProjectType)
                      .filter(Boolean)
                    )].map((spt, i) => <option key={`spt-${spt}-${i}`} value={spt}>{spt}</option>)}
                  </select>
                </div>
              </div>

              <form id="bomForm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terrace Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bomForm.terraceType}
                      onChange={(e) => handleBomFormChange('terraceType', e.target.value)}
                      required
                    >
                      <option value="">Select Terrace Type</option>
                      {terraceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Building Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bomForm.buildingType}
                      onChange={(e) => handleBomFormChange('buildingType', e.target.value)}
                      required
                    >
                      <option value="">Select Building Type</option>
                      {buildingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Structure Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bomForm.structureType}
                      onChange={(e) => handleBomFormChange('structureType', e.target.value)}
                      required
                    >
                      <option value="">Select Structure Type</option>
                      {structureTypes.map((type, i) => (
                        <option key={`st-${type}-${i}`} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {bomForm.buildingType === 'Flat' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Floors</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={bomForm.floorCount}
                        onChange={(e) => handleBomFormChange('floorCount', e.target.value)}
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Dynamic BOM Sections with Drag & Drop */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-8 mb-8">
                      {sections.map((section) => (
                        <SortableSection 
                          key={section.id} 
                          section={section}
                          handleUpdateSection={handleUpdateSection}
                          toggleSectionCollapse={toggleSectionCollapse}
                          handleDeleteSection={handleDeleteSection}
                          handleAddRow={handleAddRow}
                          handleDeleteRow={handleDeleteRow}
                          handleTableDataChange={handleTableDataChange}
                          productOptions={productOptions}
                          formulaOptions={formulaOptions}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Add Section Controller */}
                <div className="flex justify-center pb-8 border-b border-gray-100 mb-8">
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="group bg-blue-50 text-blue-600 px-10 py-4 rounded-3xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-3 active:scale-95"
                  >
                    <Plus className="group-hover:rotate-90 transition-transform duration-300" size={20} strokeWidth={3} />
                    ADD NEW CUSTOM SECTION
                  </button>
                </div>

                {/* BOM Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">BOM Configuration Summary</h4>
                    <button
                      type="button"
                      onClick={calculateSummary}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2"
                    >
                      <BarChart3 size={14} />
                      CALCULATE NOW
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Section</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Items</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Qty</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(summaryData.sections || []).map((s, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/10 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-gray-700">{s.name}</td>
                            <td className="px-6 py-4 text-xs font-bold text-gray-600 text-center">{s.items}</td>
                            <td className="px-6 py-4 text-xs font-bold text-gray-600 text-center">{s.qty}</td>
                            <td className="px-6 py-4 text-xs font-black text-blue-600 text-right">₹{(s.price || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="bg-blue-600">
                          <td className="px-6 py-5 text-sm font-black text-white uppercase tracking-widest">Grand Total</td>
                          <td className="px-6 py-5 text-sm font-black text-white text-center">{summaryData.total?.items || 0}</td>
                          <td className="px-6 py-5 text-sm font-black text-white text-center">{summaryData.total?.qty || 0}</td>
                          <td className="px-6 py-5 text-sm font-black text-white text-right">₹{(summaryData.total?.price || 0).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleCreateBom}
              >
                Create BOM
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View All BOMs Modal */}
      {showViewAllModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                  {/* Modal Header */}
                  <div className="px-10 py-8 bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
                              <Layout className="text-blue-400" size={24} />
                          </div>
                          <div>
                              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                                  Project Configurations
                              </h2>
                              <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">
                                  {selectedProject?.category} • {selectedProject?.projectType}
                              </p>
                          </div>
                      </div>
                      <button 
                          onClick={() => setShowViewAllModal(false)}
                          className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-red-500 hover:scale-110 transition-all active:scale-90"
                      >
                          <X size={24} />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
                      {viewAllData.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-4">
                              <Package size={64} strokeWidth={1} />
                              <p className="text-sm font-bold uppercase tracking-widest italic">No templates found for this project</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {viewAllData.map((bom, index) => (
                                  <div key={bom._id || index} className="group bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative overflow-hidden">
                                      {/* Action Icons Overlay */}
                                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                          <button 
                                              onClick={() => handleEditSingleBom(bom)}
                                              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 active:scale-95"
                                              title="Edit Configuration"
                                          >
                                              <Edit2 size={16} />
                                          </button>
                                          <button 
                                              className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                                              title="Quick View"
                                          >
                                              <Eye size={16} />
                                          </button>
                                      </div>

                                      <div className="flex items-center gap-4 mb-6">
                                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                                              <Layout size={28} />
                                          </div>
                                          <div>
                                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                                                  Template {index + 1}
                                              </p>
                                              <h4 className="text-sm font-black text-slate-800 uppercase leading-none">
                                                  {bom.buildingType}
                                              </h4>
                                          </div>
                                      </div>

                                      <div className="space-y-3 mb-6">
                                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                                              <span className="text-[10px] font-bold text-gray-400 uppercase">Structure</span>
                                              <span className="text-[11px] font-black text-slate-700">{bom.structureType}</span>
                                          </div>
                                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                                              <span className="text-[10px] font-bold text-gray-400 uppercase">Terrace</span>
                                              <span className="text-[11px] font-black text-slate-700">{bom.terraceType}</span>
                                          </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
                                          <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Template</span>
                                          </div>
                                          <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase">
                                              {bom.sections?.length || 0} Sections
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// --- Sortable Section Component ---
function SortableSection({ 
    section, 
    handleUpdateSection, 
    toggleSectionCollapse, 
    handleDeleteSection, 
    handleAddRow, 
    handleDeleteRow, 
    handleTableDataChange, 
    productOptions, 
    formulaOptions 
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 0
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
        >
            {/* Section Header */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded">
                        <GripVertical className="text-blue-200" size={20} />
                    </div>
                    <input 
                        type="text"
                        value={section.name}
                        onChange={(e) => handleUpdateSection(section.id, 'name', e.target.value)}
                        className="bg-transparent text-white font-black text-lg border-b border-white/20 focus:border-white focus:outline-none transition-all w-full max-w-sm"
                        placeholder="Section Name (e.g. Standard Pipes)"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => toggleSectionCollapse(section.id)}
                        className="p-2 hover:bg-white/10 rounded-xl text-white transition-all"
                    >
                        {section.isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 hover:bg-red-500 rounded-xl text-white transition-all"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {!section.isCollapsed && (
                <div className="p-6 bg-gray-50/30">
                    {/* Section Metadata Controls */}
                    <div className="flex flex-wrap items-center gap-6 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Row Label:</span>
                            <input 
                                type="text"
                                value={section.productLabel}
                                onChange={(e) => handleUpdateSection(section.id, 'productLabel', e.target.value)}
                                className="bg-white border rounded-xl px-4 py-2 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                placeholder="Edit 'Product' label..."
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleAddRow(section.id)}
                            className="bg-white text-blue-600 px-6 py-2 rounded-xl text-xs font-black shadow-sm border border-blue-50 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                        >
                            <Plus size={14} strokeWidth={3} />
                            ADD ROW
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-inner bg-white">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{section.productLabel}</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Quantity Formula</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Price (₹)</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {section.rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-6 py-3">
                                            <select
                                                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={row.product}
                                                onChange={(e) => handleTableDataChange(section.id, row.id, 'product', e.target.value)}
                                            >
                                                <option value="">Select Item</option>
                                                {productOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-center gap-3">
                                                <select
                                                    className="flex-1 max-w-[150px] bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={row.formulaItem}
                                                    onChange={(e) => handleTableDataChange(section.id, row.id, 'formulaItem', e.target.value)}
                                                >
                                                    <option value="">Base Unit</option>
                                                    {formulaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                <span className="text-gray-300 font-black">×</span>
                                                <input
                                                    type="number"
                                                    className="w-20 bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={row.formulaQty}
                                                    onChange={(e) => handleTableDataChange(section.id, row.id, 'formulaQty', e.target.value)}
                                                    min="0"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex justify-center">
                                                <input
                                                    type="number"
                                                    className="w-32 bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-600 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={row.price}
                                                    onChange={(e) => handleTableDataChange(section.id, row.id, 'price', e.target.value)}
                                                    step="0.01"
                                                    placeholder="₹0"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRow(section.id, row.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}