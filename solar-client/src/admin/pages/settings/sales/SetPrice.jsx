import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Filter, CheckCircle, RefreshCw, MapPin, Layers, Tag, Save, X, Plus, Trash2, Edit, Settings } from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import salesSettingsService from '../../../../services/settings/salesSettingsApi';
import { productApi } from '../../../../api/productApi';

const LocationCard = ({ title, subtitle, isSelected, onClick, isState, count }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-md transition-all cursor-pointer flex flex-col items-center justify-center text-center h-20 shadow-sm relative hover:shadow-md ${
      isSelected
      ? isState ? 'border-2 border-[#007bff] bg-[#8ccdfa]' : 'border-2 border-[#007bff] bg-white'
      : 'border border-gray-200 bg-white'
      }`}
  >
    {count > 0 && (
      <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white shadow-sm z-10">
        {count}
      </span>
    )}
    <div className="font-bold text-[14px] text-[#2c3e50] mb-0">{title}</div>
    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">{subtitle}</div>
  </div>
);

const extractBrand = (itemName, brandsList) => {
  if (!itemName) return 'Generic';
  const found = brandsList.find(b => {
    const bName = (b.brand || b.name || b.companyName || '').toLowerCase();
    return bName && itemName.toLowerCase().includes(bName);
  });
  return found ? (found.brand || found.name || found.companyName) : itemName.split(' ')[0];
};

export default function SetPrice() {
  const [showLocationCards, setShowLocationCards] = useState(true);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState('');
  
  // Dynamic filter lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [projectTypesList, setProjectTypesList] = useState([]);
  const [subProjectTypesList, setSubProjectTypesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  
  // Modal specific filtered lists
  const [filteredModalSubCategories, setFilteredModalSubCategories] = useState([]);
  const [filteredModalSubProjectTypes, setFilteredModalSubProjectTypes] = useState([]);

  const [kitType, setKitType] = useState('All'); // Custom Kit, Combo Kit, or All
  const [paymentType, setPaymentType] = useState('All'); // Cash, Loan, EMI, or All

  const [filters, setFilters] = useState({
    category: 'All Categories',
    subCategory: 'All Sub Categories',
    projectType: 'All Project Types',
    subProjectType: 'All Sub Types',
    brand: 'All Brands',
    productType: 'All Products'
  });

  const [tableData, setTableData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [solarKitsList, setSolarKitsList] = useState([]);
  const [filteredSolarKits, setFilteredSolarKits] = useState([]);
  const [mappingsList, setMappingsList] = useState([]);
  const [allPricesForCount, setAllPricesForCount] = useState([]);
  
  // Margin & History internal states for the mock modals
  const [historyFilter, setHistoryFilter] = useState('Last 3 Months');
  const [marginFilter, setMarginFilter] = useState('All');
  
  const [marginData, setMarginData] = useState([
     { type: 'Prime', cost: 500, margin: 1000, total: 1500, minOrders: 0, percentageMargin: 0 },
     { type: 'Regular', cost: 400, margin: 800, total: 1200, minOrders: 0, percentageMargin: 0 },
     { type: 'Other', cost: 300, margin: 500, total: 800, minOrders: 0, percentageMargin: 0 }
  ]);

  const [newPriceForm, setNewPriceForm] = useState({
    productType: 'Solar Panel',
    brand: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    benchmarkPrice: 0,
    marketPrice: 0,
    gst: 18,
    status: 'Active',
    comboKit: '',
    kitType: 'All',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: ''
  });

  const [configurationsList, setConfigurationsList] = useState([]);
  const [selectedComboKitId, setSelectedComboKitId] = useState('');
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [combokitsFromAddModule, setCombokitsFromAddModule] = useState([]);
  const [customizedCombokits, setCustomizedCombokits] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('All');
  const [editingPriceId, setEditingPriceId] = useState(null);
  
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [selectedPartnerType, setSelectedPartnerType] = useState('all');
  const [partnerPlans, setPartnerPlans] = useState([]);
  const [selectedPartnerPlanId, setSelectedPartnerPlanId] = useState('all');

  const { countries, states, districts, clusters, fetchStates, fetchDistricts, fetchClusters } = useLocations();

  // --- Persistence Logic: Load from LocalStorage ---
  useEffect(() => {
    const savedState = localStorage.getItem('solar_setprice_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.countryId) {
          setSelectedCountryId(parsed.countryId);
          fetchStates({ countryId: parsed.countryId });
        }
        if (parsed.stateId) {
          setSelectedStateId(parsed.stateId);
          fetchClusters({ stateId: parsed.stateId });
        }
        if (parsed.clusterId) {
          setSelectedClusterId(parsed.clusterId);
          fetchDistricts({ clusterId: parsed.clusterId });
        }
        if (parsed.districtId) setSelectedDistrictId(parsed.districtId);
        if (parsed.filters) setFilters(parsed.filters);
        if (parsed.kitType) setKitType(parsed.kitType);
        if (parsed.paymentType) setPaymentType(parsed.paymentType);
        if (parsed.partnerType) setSelectedPartnerType(parsed.partnerType);
        if (parsed.partnerPlanId) setSelectedPartnerPlanId(parsed.partnerPlanId);
        if (parsed.selectedComboKitId) setSelectedComboKitId(parsed.selectedComboKitId);
        if (parsed.selectedConfigId) setSelectedConfigId(parsed.selectedConfigId);
      } catch (e) {
        console.error("Failed to load persisted Pricing state", e);
      }
    }
  }, []);

  // --- Persistence Logic: Save to LocalStorage ---
  useEffect(() => {
    const stateToSave = {
      countryId: selectedCountryId,
      stateId: selectedStateId,
      clusterId: selectedClusterId,
      districtId: selectedDistrictId,
      filters,
      kitType,
      paymentType,
      partnerType: selectedPartnerType,
      partnerPlanId: selectedPartnerPlanId,
      selectedComboKitId,
      selectedConfigId
    };
    localStorage.setItem('solar_setprice_state', JSON.stringify(stateToSave));
  }, [selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId, filters, kitType, paymentType, selectedPartnerType, selectedPartnerPlanId, selectedComboKitId, selectedConfigId]);
  const selectedCountryObj = countries.find((c) => c._id === selectedCountryId) || null;
  const selectedStateObj = states.find((s) => s._id === selectedStateId) || null;
  const selectedClusterObj = clusters.find((c) => c._id === selectedClusterId) || null;
  const selectedDistrictObj = districts.find((d) => d._id === selectedDistrictId) || null;

  // 1. Fetch Dynamic Filter Data on Mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const results = await Promise.allSettled([
          productApi.getCategories(),
          productApi.getSubCategories(),
          productApi.getProjectTypes(),
          productApi.getSubProjectTypes(),
          productApi.getBrands(),
          productApi.getAll(),
          salesSettingsService.getSolarKits(),
          productApi.getProjectCategoryMappings(),
          salesSettingsService.getSetPrices({})
        ]);
        
        const safeExtract = (result) => {
            if (result.status !== 'fulfilled') return [];
            const val = result.value;
            if (Array.isArray(val)) return val;
            if (val && Array.isArray(val.data)) return val.data;
            if (val && val.data && Array.isArray(val.data.data)) return val.data.data;
            return [];
        };
        
        setCategoriesList(safeExtract(results[0]));
        setSubCategoriesList(safeExtract(results[1]));
        setProjectTypesList(safeExtract(results[2]));
        setSubProjectTypesList(safeExtract(results[3]));
        setBrandsList(safeExtract(results[4]));
        setProductsList(safeExtract(results[5]));
        setSolarKitsList(safeExtract(results[6]));
        setMappingsList(safeExtract(results[7]));
        setAllPricesForCount(safeExtract(results[8]));

        // Fetch dedicated Combokits from Add Module
        try {
           const cbData = await salesSettingsService.getAllCombokits();
           setCombokitsFromAddModule(cbData || []);
        } catch (err) {
           console.error("Error fetching module kits:", err);
        }

        // Fetch Customized Combokits from Customize Module
         try {
            const customData = await salesSettingsService.getAllCustomizedCombokits();
            setCustomizedCombokits(customData || []);
         } catch (err) {
            console.error("Error fetching customized kits:", err);
         }
         // Fetch Partner Types
         try {
            const pTypes = await salesSettingsService.getPartnerTypes();
            setPartnerTypes(pTypes || []);
         } catch (err) {
            console.error("Error fetching partner types:", err);
         }

         // Fetch Dynamic Company Margins
         try {
            const mData = await salesSettingsService.getCompanyMargins();
            if (mData && mData.length > 0) setMarginData(mData.map(m => ({
              ...m,
              id: m._id // Standardizing ID for consistency if needed
            })));
         } catch (err) {
            console.error("Error fetching margins:", err);
         }

      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  // 2. Location Selection Handlers (Hierarchy)
  const handleCountrySelect = (countryId) => {
    setSelectedCountryId(countryId);
    setSelectedStateId('');
    setSelectedClusterId('');
    setSelectedDistrictId('');
    if (countryId && countryId !== 'all') {
      fetchStates({ countryId });
    }
  };

  const handleStateSelect = (stateId) => {
    setSelectedStateId(stateId);
    setSelectedClusterId('');
    setSelectedDistrictId('');
    if (stateId && stateId !== 'all') {
      fetchClusters({ stateId });
    }
  };

  const handleClusterSelect = (clusterId) => {
    setSelectedClusterId(clusterId);
    setSelectedDistrictId('');
    if (clusterId && clusterId !== 'all') {
      fetchDistricts({ clusterId });
    }
  };

  const handleDistrictSelect = (districtId) => {
    setSelectedDistrictId(districtId);
  };

  // 2.5 Partner Plan Fetching
  useEffect(() => {
    const fetchPlans = async () => {
      if (selectedPartnerType && selectedPartnerType !== 'all') {
        try {
          const params = { partnerType: selectedPartnerType };
          if (selectedCountryId && selectedCountryId !== 'all') params.countryId = selectedCountryId;
          if (selectedStateId && selectedStateId !== 'all') params.stateId = selectedStateId;
          if (selectedClusterId && selectedClusterId !== 'all') params.clusterId = selectedClusterId;
          if (selectedDistrictId && selectedDistrictId !== 'all') params.districtId = selectedDistrictId;
          const plans = await salesSettingsService.getPartnerPlans(params);
          setPartnerPlans(plans || []);
        } catch (err) {
          console.error("Error fetching partner plans:", err);
        }
      } else {
        setPartnerPlans([]);
      }
    };
    fetchPlans();
  }, [selectedPartnerType, selectedStateId]);

  useEffect(() => {
    fetchPrices();
  }, [selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId, kitType, paymentType, filters, selectedPartnerType, selectedPartnerPlanId, selectedComboKitId, selectedConfigId]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const query = {};
      if (selectedCountryId && selectedCountryId !== 'all') query.country = selectedCountryId;
      if (selectedStateId && selectedStateId !== 'all') query.state = selectedStateId;
      if (selectedClusterId && selectedClusterId !== 'all') query.cluster = selectedClusterId;
      if (selectedDistrictId && selectedDistrictId !== 'all') query.district = selectedDistrictId;
      
      if (selectedPartnerType && selectedPartnerType !== 'all') query.role = selectedPartnerType;
      if (selectedPartnerPlanId && selectedPartnerPlanId !== 'all') query.partnerPlan = selectedPartnerPlanId;

      if (filters.category !== 'All Categories') query.category = filters.category;
      if (filters.subCategory !== 'All Sub Categories') query.subCategory = filters.subCategory;
      if (filters.projectType !== 'All Project Types') query.projectType = filters.projectType;
      if (filters.subProjectType !== 'All Sub Types') query.subProjectType = filters.subProjectType;
      
      if (filters.brand !== 'All Brands') query.brand = filters.brand;
      if (filters.productType !== 'All Products') query.productType = filters.productType;
      
      if (kitType !== 'All') query.kitType = kitType;
      if (paymentType !== 'All') query.paymentType = paymentType;

      const data = await salesSettingsService.getSetPrices(query);
      
      // All items matching the project configuration go to the summary table
      const savedPrices = data.map(item => ({
        ...item,
        id: item._id,
        comboKit: item.comboKit || `${item.brand} Kit`,
        isEditing: false,
        isGenerated: false
      }));

      // Items that are being newly generated go to the top working table
      let workingData = [];

      if (kitType === 'Combo Kit' && 
          filters.category !== 'All Categories' && 
          filters.projectType !== 'All Project Types') {
        
        let matchingKit = null;
        
        // Priority 1: Match by name if a specific kit is selected in the dropdown
        if (selectedComboKitId) {
          const selectedKit = combokitsFromAddModule.find(k => k.id === selectedComboKitId || k._id === selectedComboKitId);
          if (selectedKit) {
            matchingKit = solarKitsList.find(k => k.name === selectedKit.name);
            if (!matchingKit) matchingKit = selectedKit; // Fallback to dropdown kit object
          }
        }

        // Priority 2: Fallback to current filter-based matching (existing logic)
        if (!matchingKit) {
          matchingKit = solarKitsList.find(kit => {
            const catMatch = filters.category === 'All Categories' || kit.category === filters.category;
            const subCatMatch = filters.subCategory === 'All Sub Categories' || kit.subCategory === filters.subCategory;
            const projMatch = filters.projectType === 'All Project Types' || kit.projectType === filters.projectType;
            const subProjMatch = filters.subProjectType === 'All Sub Types' || kit.subProjectType === filters.subProjectType;
            return catMatch && subCatMatch && projMatch && subProjMatch;
          });
        }

        if (matchingKit && matchingKit.bom) {
          matchingKit.bom.forEach(section => {
            if (section.items && Array.isArray(section.items)) {
              section.items.forEach(item => {
                const brandName = extractBrand(item.name, brandsList);
                const itemType = item.itemType || 'Solar Panel';
                
                const brandMatch = filters.brand === 'All Brands' || 
                                   brandName.toLowerCase() === filters.brand.toLowerCase();
                
                const productMatch = filters.productType === 'All Products' || 
                                     itemType.toLowerCase() === filters.productType.toLowerCase() ||
                                     (itemType.toLowerCase().includes('panel') && filters.productType.toLowerCase().includes('panel')) ||
                                     (itemType.toLowerCase().includes('inverter') && filters.productType.toLowerCase().includes('inverter'));
                
                if (brandMatch && productMatch) {
                  const alreadyExists = savedPrices.find(d => 
                    d.comboKit === matchingKit.name && 
                    d.productType === itemType &&
                    d.brand === brandName &&
                    (selectedPartnerType === 'all' || d.role === selectedPartnerType)
                  );
                  
                  if (!alreadyExists) {
                    workingData.push({
                      id: `gen-${matchingKit._id}-${item.name}-${Math.random().toString(36).substr(2, 5)}`,
                      comboKit: matchingKit.name,
                      brand: brandName,
                      role: selectedPartnerType !== 'all' ? selectedPartnerType : '',
                      productType: itemType,
                      category: filters.category,
                      subCategory: filters.subCategory,
                      projectType: filters.projectType,
                      subProjectType: filters.subProjectType,
                      benchmarkPrice: 0,
                      marketPrice: 0,
                      gst: 18,
                      isEditing: true,
                      isGenerated: true,
                      paymentType: paymentType !== 'All' ? paymentType : 'Cash'
                    });
                  }
                }
              });
            }
          });
        }

        // Fallback: If filters specify a Brand/Product but it's not in the BOM (or no BOM found), 
        // still allow generating a row if the kit is selected. This matches "Custom Kit" behavior.
        if (filters.brand !== 'All Brands' && filters.productType !== 'All Products') {
          const kitNameForTable = matchingKit?.name || 'Selected Kit';
          
          const alrSaved = savedPrices.find(d => 
            d.comboKit === kitNameForTable && 
            d.productType === filters.productType &&
            d.brand === filters.brand &&
            (selectedPartnerType === 'all' || d.role === selectedPartnerType)
          );

          const alrWorking = workingData.find(w => 
            w.comboKit === kitNameForTable && 
            w.productType === filters.productType && 
            w.brand === filters.brand
          );

          if (!alrSaved && !alrWorking) {
            workingData.push({
              id: `gen-combo-fb-${Date.now()}`,
              comboKit: kitNameForTable,
              brand: filters.brand,
              productType: filters.productType,
              category: filters.category,
              subCategory: filters.subCategory,
              projectType: filters.projectType,
              subProjectType: filters.subProjectType,
              role: selectedPartnerType !== 'all' ? selectedPartnerType : '',
              benchmarkPrice: 0,
              marketPrice: 0,
              gst: 18,
              isEditing: true,
              isGenerated: true,
              paymentType: paymentType !== 'All' ? paymentType : 'Cash'
            });
          }
        }
      }

      if (kitType === 'Custom Kit' && 
          filters.brand !== 'All Brands' && 
          filters.productType !== 'All Products' && 
          filters.category !== 'All Categories') {
          
          // Check if this specific kit component is already saved
          const alreadyExists = savedPrices.find(d => 
            d.productType === filters.productType &&
            d.brand === filters.brand
          );

          if (!alreadyExists) {
            workingData.push({
              id: `gen-custom-${Date.now()}`,
              comboKit: filters.brand + ' Kit',
              brand: filters.brand,
              productType: filters.productType,
              category: filters.category,
              subCategory: filters.subCategory,
              projectType: filters.projectType,
              subProjectType: filters.subProjectType,
              benchmarkPrice: 0,
              marketPrice: 0,
              gst: 18,
              isEditing: true,
              isGenerated: true,
              paymentType: paymentType !== 'All' ? paymentType : 'Cash'
            });
          }
      }

      const latestHistoryPrice = 24500; // Mock latest purchase price

      setTableData(prev => {
        // Merge workingData with current tableData to preserve active edits
        return workingData.map(newRow => {
          const existingRow = prev.find(p => 
            p.brand === newRow.brand && 
            p.productType === newRow.productType && 
            p.comboKit === newRow.comboKit
          );
          
          if (existingRow && existingRow.isEditing) {
            return {
              ...newRow,
              benchmarkPrice: existingRow.benchmarkPrice,
              marketPrice: existingRow.marketPrice,
              gst: existingRow.gst,
              isEditing: true
            };
          }
          
          return {
            ...newRow,
            marketPrice: newRow.marketPrice || latestHistoryPrice
          };
        });
      });
      setSummaryData(savedPrices);
    } catch (error) {
      console.error("Error fetching prices:", error);
      alert("Error loading prices: " + (error.error || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // 3. Configuration Logic
  useEffect(() => {
    if (selectedComboKitId && kitType === 'Combo Kit') {
      const fetchConfigs = async () => {
        try {
          const kit = combokitsFromAddModule.find(k => k.id === selectedComboKitId);
          if (kit) {
            const res = await salesSettingsService.getAssignments({ kitName: kit.name });
            setConfigurationsList(res?.data || res || []);
          }
        } catch (err) {
          console.error("Error fetching configs:", err);
        }
      };
      fetchConfigs();
    } else if (kitType === 'Custom Kit') {
      setConfigurationsList(customizedCombokits);
    } else {
      setConfigurationsList([]);
      setSelectedConfigId('');
    }
  }, [selectedComboKitId, combokitsFromAddModule, kitType, customizedCombokits]);

  const handleConfigSelect = (configId) => {
    setSelectedConfigId(configId);
    const config = configurationsList.find(c => c._id === configId);
    if (config) {
      // Auto-populate filters
      setFilters({
        category: config.category || 'All Categories',
        subCategory: config.subCategory || 'All Sub Categories',
        projectType: config.projectType || 'All Project Types',
        subProjectType: config.subProjectType || 'All Sub Types',
        brand: kitType === 'Custom Kit' 
          ? (config.panels && config.panels.length > 0 ? config.panels[0] : (config.brand || 'All Brands'))
          : 'All Brands',
        productType: kitType === 'Custom Kit' ? 'Solar Panel' : 'All Products'
      });

      // Auto-fill Location & Partner
      if (config.state) handleStateSelect(config.state?._id || config.state);
      if (config.cluster) handleClusterSelect(config.cluster?._id || config.cluster);
      if (config.districts?.length > 0) handleDistrictSelect(config.districts[0]?._id || config.districts[0]);
      
      if (config.role) {
        setSelectedPartner(config.role);
        setSelectedPartnerType(config.role);
      }
      
      console.log(`Details populated for ${config.solarkitName || config.panels?.[0] || 'Configuration'}`);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      if (filterName === 'category') newFilters.subCategory = 'All Sub Categories';
      if (filterName === 'projectType') newFilters.subProjectType = 'All Sub Types';
      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    fetchPrices();
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All Categories',
      subCategory: 'All Sub Categories',
      projectType: 'All Project Types',
      subProjectType: 'All Sub Types',
      brand: 'All Brands',
      productType: 'All Products'
    });
    setKitType('All');
    setPaymentType('All');
    setSelectedPartnerType('all');
    setSelectedPartnerPlanId('all');
    setTimeout(() => {
      fetchPrices();
    }, 0);
  };

  const handleTableInputChange = (id, field, value) => {
    setTableData(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleRowEdit = async (id) => {
    const item = tableData.find(i => i.id === id);
    if (!item) return;

    if (item.isEditing) {
      try {
        if (item.isGenerated) {
          const payload = {
            productType: item.productType,
            brand: item.brand,
            category: item.category,
            subCategory: item.subCategory,
            projectType: item.projectType,
            subProjectType: item.subProjectType,
            benchmarkPrice: item.benchmarkPrice,
            marketPrice: item.marketPrice,
            gst: item.gst,
            kitType: item.kitType || (item.id.includes('custom') ? 'Custom Kit' : 'Combo Kit'),
            paymentType: item.paymentType || (paymentType !== 'All' ? paymentType : 'Cash'),
            comboKit: item.comboKit,
            state: (selectedStateId && selectedStateId !== 'all') ? selectedStateId : undefined,
            cluster: (selectedClusterId && selectedClusterId !== 'all') ? selectedClusterId : undefined,
            district: (selectedDistrictId && selectedDistrictId !== 'all') ? selectedDistrictId : undefined,
            country: (selectedCountryId && selectedCountryId !== 'all') ? selectedCountryId : undefined,
            role: (selectedPartnerType && selectedPartnerType !== 'all') ? selectedPartnerType : undefined,
            partnerPlan: (selectedPartnerPlanId && selectedPartnerPlanId !== 'all') ? selectedPartnerPlanId : undefined,
            partnerPlanModel: selectedPartnerType === 'Dealer' ? 'DealerPlan' : selectedPartnerType === 'Franchisee' ? 'FranchiseePlan' : selectedPartnerType === 'Channel Partner' ? 'ChannelPartnerPlan' : undefined,
            status: 'Active'
          };
          const response = await salesSettingsService.createSetPrice(payload);
          // Move from working table to summary table
          const savedItem = {
            ...item,
            _id: response._id || response.data?._id,
            id: response._id || response.data?._id,
            isEditing: false,
            isGenerated: false
          };
          setSummaryData(prev => [...prev, savedItem]);
          setTableData(prev => prev.filter(row => row.id !== id));
          return;
        } else {
          await salesSettingsService.updateSetPrice(id, {
            benchmarkPrice: item.benchmarkPrice,
            marketPrice: item.marketPrice,
            gst: item.gst
          });
          // Update in summary table
          setSummaryData(prev => prev.map(row => row.id === id ? { ...row, isEditing: false } : row));
        }
      } catch (error) {
        console.error("Error updating price details:", error);
        alert(`Failed to update price: ${error.error || error.message || "Check fields and try again"}`);
        return; 
      }
    }

    setTableData(prev => prev.map(row => {
      if (row.id === id) return { ...row, isEditing: !row.isEditing };
      return row;
    }));
  };

  const handleEditExisting = (item) => {
    // Open modal with pre-filled data instead of moving between tables
    setEditingPriceId(item.id || item._id);
    
    // Prepare a clean copy of the data
    const rawCategory = (item.category || '').toString().trim();
    const rawSubCategory = (item.subCategory || '').toString().trim();
    const rawProjectType = (item.projectType || '').toString().trim();
    const rawProductType = (item.productType || 'Solar Panel').toString().trim();
    const rawBrand = (item.brand || '').toString().trim();
    const rawPartnerType = (item.role || item.partnerType || 'All').toString().trim();
    const rawPaymentType = (item.paymentType || 'Cash').toString().trim();

    const currentForm = {
      productType: rawProductType,
      brand: rawBrand,
      category: rawCategory,
      subCategory: rawSubCategory,
      projectType: rawProjectType,
      subProjectType: (item.subProjectType || '').toString().trim(),
      benchmarkPrice: typeof item.benchmarkPrice === 'number' ? item.benchmarkPrice : 0,
      marketPrice: typeof item.marketPrice === 'number' ? item.marketPrice : 0,
      gst: item.gst || 18,
      status: item.status || 'Active',
      comboKit: item.comboKit || '',
      paymentType: rawPaymentType,
      role: rawPartnerType === 'All' ? '' : rawPartnerType,
      kitType: item.kitType || 'All',
      validFrom: item.validFrom ? new Date(item.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validTo: item.validTo ? new Date(item.validTo).toISOString().split('T')[0] : ''
    };

    // 1. Sync Product Type
    const matchedProduct = productsList.find(p => p.name && p.name.toLowerCase() === rawProductType.toLowerCase());
    if (matchedProduct) currentForm.productType = matchedProduct.name;

    // 2. Sync Category & Sub-Category
    const catObj = categoriesList.find(c => 
      (c.name && c.name.toLowerCase() === rawCategory.toLowerCase()) || 
      c._id === rawCategory
    );
    
    if (catObj) {
      currentForm.category = catObj.name;
      const filteredSubs = subCategoriesList.filter(sc => 
        (sc.categoryId === catObj._id || sc.categoryId?._id === catObj._id || sc.categoryId?.name === catObj.name)
      );
      setFilteredModalSubCategories(filteredSubs);

      const subObj = filteredSubs.find(s => 
        s.name && s.name.toLowerCase() === rawSubCategory.toLowerCase()
      );
      if (subObj) currentForm.subCategory = subObj.name;
    }

    // 3. Sync Partner Type
    const partnerOptions = ['Dealer', 'Franchise', 'test', 'All Partners'];
    const matchedPartner = partnerOptions.find(p => p.toLowerCase() === rawPartnerType.toLowerCase());
    if (matchedPartner) currentForm.role = matchedPartner === 'All Partners' ? '' : matchedPartner;

    // 4. Sync Payment Type
    const paymentOptions = ['Cash', 'Loan', 'EMI'];
    const matchedPayment = paymentOptions.find(p => p.toLowerCase() === rawPaymentType.toLowerCase());
    if (matchedPayment) currentForm.paymentType = matchedPayment;

    // 5. Sync Project Type
    const allProjectOptions = [
      ...mappingsList.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`),
      ...projectTypesList.map(p => p.name)
    ];
    const matchedProj = allProjectOptions.find(opt => 
      opt && opt.toLowerCase() === rawProjectType.toLowerCase()
    );
    if (matchedProj) currentForm.projectType = matchedProj;

    // Finally set the state and show modal
    const margin = (typeof item.marketPrice === 'number' && typeof item.benchmarkPrice === 'number') 
      ? item.marketPrice - item.benchmarkPrice 
      : 0;

    setNewPriceForm({ ...currentForm, margin });
    setFilteredModalSubProjectTypes(subProjectTypesList);
    setShowAddModal(true);
  };

  const handleDeletePrice = async (id) => {
    // Look in both lists to find the item metadata
    const item = tableData.find(i => i.id === id) || summaryData.find(i => i.id === id);
    if (!item) {
       console.warn("Item not found for deletion:", id);
       return;
    }

    if (window.confirm("Are you sure you want to delete this price setting?")) {
      try {
        if (!item.isGenerated) {
          await salesSettingsService.deleteSetPrice(id);
        }
        setTableData(prev => prev.filter(item => item.id !== id));
        setSummaryData(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting price:", error);
        alert("Failed to delete price");
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingPriceId(null);
    // 1. Get current kit and config context
    const activeConfig = configurationsList.find(c => c._id === selectedConfigId);
    let kitName = '';
    if (kitType === 'Combo Kit') {
      const selectedKit = combokitsFromAddModule.find(k => k.id === selectedComboKitId || k._id === selectedComboKitId);
      if (selectedKit) kitName = selectedKit.name;
    } else if (kitType === 'Custom Kit') {
      if (activeConfig) kitName = activeConfig.solarkitName || `${activeConfig.panels?.[0] || 'adani'} Kit`;
    }

    const latestHistoryPrice = 24500;
    
    // 2. Try to pre-fill from the first row in tableData or the active config
    const firstRow = tableData.length > 0 ? tableData[0] : null;

    const modalCategory = firstRow?.category || activeConfig?.category || (filters.category !== 'All Categories' ? filters.category : '');
    const modalSubCategory = firstRow?.subCategory || activeConfig?.subCategory || (filters.subCategory !== 'All Sub Categories' ? filters.subCategory : '');
    const modalProjectType = firstRow?.projectType || activeConfig?.projectType || (filters.projectType !== 'All Project Types' ? filters.projectType : '');
    const modalSubProjectType = firstRow?.subProjectType || activeConfig?.subProjectType || (filters.subProjectType !== 'All Sub Types' ? filters.subProjectType : '');
    const modalProductType = firstRow?.productType || (filters.productType !== 'All Products' ? filters.productType : 'Solar Panel');
    const modalBrand = firstRow?.brand || activeConfig?.brand || (filters.brand !== 'All Brands' ? filters.brand : '');

    setNewPriceForm({
      productType: modalProductType,
      brand: modalBrand,
      category: modalCategory,
      subCategory: modalSubCategory,
      projectType: modalProjectType,
      subProjectType: modalSubProjectType,
      benchmarkPrice: firstRow?.benchmarkPrice || 0,
      marketPrice: firstRow?.marketPrice || latestHistoryPrice,
      margin: (firstRow?.marketPrice || latestHistoryPrice) - (firstRow?.benchmarkPrice || 0),
      gst: firstRow?.gst || 18,
      status: 'Active',
      comboKit: firstRow?.comboKit || kitName,
      paymentType: firstRow?.paymentType || (paymentType !== 'All' ? paymentType : 'Cash'),
      role: firstRow?.role || (selectedPartnerType !== 'all' ? selectedPartnerType : ''),
      kitType: kitType
    });

    // 3. Update modal-specific filtered lists for correct dropdown state
    const currentCat = modalCategory;
    if (currentCat && currentCat !== 'All Categories') {
      const catObj = categoriesList.find(c => c.name === currentCat);
      if (catObj) {
        setFilteredModalSubCategories(subCategoriesList.filter(sc => 
          (sc.categoryId === catObj._id || sc.categoryId?._id === catObj._id)
        ));
      }
    } else {
      setFilteredModalSubCategories([]);
    }

    setFilteredModalSubProjectTypes(subProjectTypesList);
    setShowAddModal(true);
  };

  const handleAddNewSubmit = async (e) => {
    e.preventDefault();
    if (!newPriceForm.brand || !newPriceForm.category || !newPriceForm.subCategory || !newPriceForm.projectType || !newPriceForm.subProjectType) {
      alert("Please fill in all dropdown fields before saving.");
      return;
    }
    try {
      const payload = {
        ...newPriceForm,
        kitType: newPriceForm.kitType,
        paymentType: newPriceForm.paymentType,
        role: newPriceForm.role || (selectedPartnerType !== 'all' ? selectedPartnerType : undefined),
        state: (selectedStateId && selectedStateId !== 'all') ? selectedStateId : undefined,
        cluster: (selectedClusterId && selectedClusterId !== 'all') ? selectedClusterId : undefined,
        district: (selectedDistrictId && selectedDistrictId !== 'all') ? selectedDistrictId : undefined,
        country: (selectedCountryId && selectedCountryId !== 'all') ? selectedCountryId : undefined
      };
      
      if (editingPriceId) {
        await salesSettingsService.updateSetPrice(editingPriceId, payload);
        alert("Price updated successfully!");
      } else {
        await salesSettingsService.createSetPrice(payload);
        alert("Price added successfully!");
      }
      
      setShowAddModal(false);
      setEditingPriceId(null);
      fetchPrices(); 
    } catch (error) {
      console.error("Error saving price:", error);
      alert("Failed to save price. Please verify all fields.");
    }
  };

  const handleSaveMargins = async () => {
    try {
      setLoading(true);
      await Promise.all(marginData.map(item => 
        salesSettingsService.updateCompanyMargin(item)
      ));
      alert("Marginal settings updated successfully!");
      setShowMarginModal(false);
    } catch (err) {
      console.error("Error saving margins:", err);
      alert("Failed to save margins.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans">
      <div className="bg-white p-6 border-b border-gray-200 mb-8 px-12">
        <h1 className="text-[22px] font-bold text-[#14233c] mb-2">Set Price for Solarkit</h1>
        <button
          onClick={() => setShowLocationCards(!showLocationCards)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0076a8] text-white rounded text-xs font-bold shadow-sm hover:bg-blue-800 transition-all"
        >
          {showLocationCards ? <EyeOff size={14} /> : <Eye size={14} />} {showLocationCards ? 'Hide Location Cards' : 'Show Location Cards'}
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-12 pb-20">
        {showLocationCards && (
          <div className="space-y-10 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#14233c] mb-4">Select Country</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <LocationCard title="All Countries" subtitle="ALL" isSelected={selectedCountryId === 'all' || selectedCountryId === ''} onClick={() => handleCountrySelect('all')} />
                {countries.map(c => {
                  const filteredCount = allPricesForCount.filter(p => {
                    const locMatch = (p.country?._id || p.country) === c._id || (p.countries?.includes?.(c._id));
                    const roleMatch = selectedPartnerType === 'all' || (p.role === selectedPartnerType);
                    const paymentMatch = paymentType === 'All' || (p.paymentType === paymentType);
                    const kitMatch = kitType === 'All' || (p.kitType === kitType);
                    const catMatch = filters.category === 'All Categories' || p.category === filters.category;
                    const subCatMatch = filters.subCategory === 'All Sub Categories' || p.subCategory === filters.subCategory;
                    const brandMatch = filters.brand === 'All Brands' || p.brand === filters.brand;
                    const prodMatch = filters.productType === 'All Products' || p.productType === filters.productType;
                    
                    return locMatch && roleMatch && paymentMatch && kitMatch && catMatch && subCatMatch && brandMatch && prodMatch;
                  }).length;
                  return <LocationCard key={c._id} title={c.name} subtitle={c.code || c.name.substring(0, 2).toUpperCase()} isSelected={selectedCountryId === c._id} onClick={() => handleCountrySelect(c._id)} count={filteredCount} />;
                })}
              </div>
            </div>
            {(selectedCountryId && selectedCountryId !== 'all') && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#14233c] mb-4">Select State</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LocationCard title="All States" subtitle="ALL" isSelected={selectedStateId === 'all' || selectedStateId === ''} onClick={() => handleStateSelect('all')} />
                  {states.map(s => {
                    const filteredCount = allPricesForCount.filter(p => {
                      const locMatch = (p.state?._id || p.state) === s._id || (p.states?.includes?.(s._id));
                      const roleMatch = selectedPartnerType === 'all' || (p.role === selectedPartnerType);
                      const paymentMatch = paymentType === 'All' || (p.paymentType === paymentType);
                      const kitMatch = kitType === 'All' || (p.kitType === kitType);
                      const catMatch = filters.category === 'All Categories' || p.category === filters.category;
                      const subCatMatch = filters.subCategory === 'All Sub Categories' || p.subCategory === filters.subCategory;
                      const brandMatch = filters.brand === 'All Brands' || p.brand === filters.brand;
                      const prodMatch = filters.productType === 'All Products' || p.productType === filters.productType;
                      
                      return locMatch && roleMatch && paymentMatch && kitMatch && catMatch && subCatMatch && brandMatch && prodMatch;
                    }).length;
                    return <LocationCard key={s._id} title={s.name} subtitle={s.code || s.name.substring(0, 2).toUpperCase()} isSelected={selectedStateId === s._id} onClick={() => handleStateSelect(s._id)} isState={true} count={filteredCount} />;
                  })}
                </div>
              </div>
            )}
            {(selectedStateId && selectedStateId !== 'all') && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#14233c] mb-4">Select Cluster</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LocationCard title="All Clusters" subtitle="ALL" isSelected={selectedClusterId === 'all' || selectedClusterId === ''} onClick={() => handleClusterSelect('all')} />
                  {clusters.map(c => {
                    const parentState = states.find(s => s._id === c.state || s._id === c.state?._id) || selectedStateObj;
                    const filteredCount = allPricesForCount.filter(p => {
                      // Direct match by Cluster ID
                      let locMatch = (p.cluster?._id || p.cluster) === c._id || (p.clusters?.includes?.(c._id)) || (p.cluster === c.name);
                      
                      // Aggregation match: if item has a district, check if that district belongs to this cluster
                      if (!locMatch && (p.district || p.districts)) {
                        const distId = p.district?._id || p.district || (p.districts?.[0]);
                        const distObj = districts.find(d => d._id === distId);
                        if (distObj && (distObj.clusterId === c._id || distObj.cluster === c._id)) {
                           locMatch = true;
                        }
                      }

                      const roleMatch = selectedPartnerType === 'all' || (p.role === selectedPartnerType);
                      const paymentMatch = paymentType === 'All' || (p.paymentType === paymentType);
                      const kitMatch = kitType === 'All' || (p.kitType === kitType);
                      const catMatch = filters.category === 'All Categories' || p.category === filters.category;
                      const subCatMatch = filters.subCategory === 'All Sub Categories' || p.subCategory === filters.subCategory;
                      const brandMatch = filters.brand === 'All Brands' || p.brand === filters.brand;
                      const prodMatch = filters.productType === 'All Products' || p.productType === filters.productType;
                      
                      return locMatch && roleMatch && paymentMatch && kitMatch && catMatch && subCatMatch && brandMatch && prodMatch;
                    }).length;
                    return <LocationCard key={c._id} title={c.name} subtitle={parentState ? (parentState.code || parentState.name.substring(0,2).toUpperCase()) : 'CL'} isSelected={selectedClusterId === c._id} onClick={() => handleClusterSelect(c._id)} count={filteredCount} />;
                  })}
                </div>
              </div>
            )}
            {(selectedClusterId && selectedClusterId !== 'all') && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#14233c] mb-4">Select District</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LocationCard title="All Districts" subtitle="ALL" isSelected={selectedDistrictId === 'all' || selectedDistrictId === ''} onClick={() => handleDistrictSelect('all')} />
                  {districts.map(d => {
                    const filteredCount = allPricesForCount.filter(p => {
                      const locMatch = (p.district?._id || p.district) === d._id || (p.districts?.some(dist => (dist._id || dist) === d._id));
                      const roleMatch = selectedPartnerType === 'all' || (p.role === selectedPartnerType);
                      const paymentMatch = paymentType === 'All' || (p.paymentType === paymentType);
                      const kitMatch = kitType === 'All' || (p.kitType === kitType);
                      const catMatch = filters.category === 'All Categories' || p.category === filters.category;
                      const subCatMatch = filters.subCategory === 'All Sub Categories' || p.subCategory === filters.subCategory;
                      const brandMatch = filters.brand === 'All Brands' || p.brand === filters.brand;
                      const prodMatch = filters.productType === 'All Products' || p.productType === filters.productType;
                      
                      return locMatch && roleMatch && paymentMatch && kitMatch && catMatch && subCatMatch && brandMatch && prodMatch;
                    }).length;
                    return <LocationCard key={d._id} title={d.name} subtitle={'DT'} isSelected={selectedDistrictId === d._id} onClick={() => handleDistrictSelect(d._id)} count={filteredCount} />;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedDistrictId && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6 border border-gray-100">
            <h5 className="mb-4 text-xl font-bold text-gray-800">Selected Location</h5>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="inline-flex items-center bg-[#0076a8] text-white px-4 py-2 rounded font-bold text-sm shadow-sm">State: {selectedStateObj?.name || 'All'}</span>
              <span className="inline-flex items-center bg-[#0d6efd] text-white px-4 py-2 rounded font-bold text-sm shadow-sm"><Layers size={14} className="mr-1" />Cluster: {selectedClusterObj?.name || 'All'}</span>
              <span className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded font-bold text-sm shadow-sm"><MapPin size={14} className="mr-1" />District: {selectedDistrictObj?.name || 'All'}</span>
            </div>
          </div>
        )}

        {showLocationCards && (selectedDistrictId || selectedStateId) && (
          <div className="mb-10 animate-in fade-in duration-500">
            <div className="mb-8">
               <h2 className="text-xl font-bold text-[#14233c] mb-4">Select Partner Type</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <LocationCard title="All Partners" subtitle="ALL" isSelected={selectedPartnerType === 'all'} onClick={() => setSelectedPartnerType('all')} />
                  {partnerTypes?.filter((type, index, self) => 
                    index === self.findIndex((t) => t.name === type.name)
                  ).map(p => {
                    const filteredCount = allPricesForCount.filter(item => {
                      const locMatch = (!selectedDistrictId || selectedDistrictId === 'all') 
                        ? true 
                        : ((item.district?._id || item.district) === selectedDistrictId || item.districts?.includes?.(selectedDistrictId));
                      
                      const roleMatch = item.role === p.name;
                      const paymentMatch = paymentType === 'All' || (item.paymentType === paymentType);
                      const kitMatch = kitType === 'All' || (item.kitType === kitType);
                      
                      return locMatch && roleMatch && paymentMatch && kitMatch;
                    }).length;
                    
                    return (
                      <LocationCard 
                        key={p._id} 
                        title={p.name} 
                        subtitle={p.name.substring(0, 2).toUpperCase()} 
                        isSelected={selectedPartnerType === p.name} 
                        onClick={() => setSelectedPartnerType(p.name)} 
                        count={filteredCount}
                      />
                    );
                  })}
               </div>
            </div>

            {selectedPartnerType !== 'all' && partnerPlans.length > 0 && (
              <div className="mb-8">
                 <h2 className="text-xl font-bold text-[#14233c] mb-4">Select Partner Plan</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <LocationCard title="All Plans" subtitle="ALL" isSelected={selectedPartnerPlanId === 'all'} onClick={() => setSelectedPartnerPlanId('all')} />
                    {partnerPlans?.filter((plan, index, self) => 
                        index === self.findIndex((p) => p.name === plan.name)
                    ).map(p => {
                      const filteredCount = allPricesForCount.filter(item => {
                        const locMatch = (!selectedDistrictId || selectedDistrictId === 'all') 
                           ? true 
                           : ((item.district?._id || item.district) === selectedDistrictId || item.districts?.includes?.(selectedDistrictId));
                        
                        const planMatch = (item.partnerPlan?._id || item.partnerPlan) === p._id;
                        return locMatch && planMatch;
                      }).length;

                      return (
                        <LocationCard 
                          key={p._id} 
                          title={p.planName || p.name} 
                          subtitle="PLAN" 
                          isSelected={selectedPartnerPlanId === p._id} 
                          onClick={() => setSelectedPartnerPlanId(p._id)} 
                          count={filteredCount}
                        />
                      );
                    })}
                 </div>
              </div>
            )}
          </div>
        )}

        {selectedDistrictId && (
          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col xl:flex-row p-0 overflow-hidden">
               <div className="flex-[2] p-5 border-b xl:border-b-0 xl:border-r border-gray-100 xl:min-w-[600px]">
                  <h5 className="font-bold text-[#14233c] mb-4 text-[15px]">Project Type Filters</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[13px] text-gray-600 mb-1.5">Category</label>
                      <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0076a8]" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                        <option>All Categories</option>
                        {categoriesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] text-gray-600 mb-1.5">Sub Category</label>
                      <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0076a8]" value={filters.subCategory} onChange={(e) => handleFilterChange('subCategory', e.target.value)} disabled={filters.category === 'All Categories'}>
                        <option>All Sub Categories</option>
                        {subCategoriesList.filter(sc => filters.category === 'All Categories' || sc.categoryId?.name === filters.category).map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] text-gray-600 mb-1.5">Project Type</label>
                      <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0076a8]" value={filters.projectType} onChange={(e) => handleFilterChange('projectType', e.target.value)}>
                        <option>All Project Types</option>
                        {mappingsList.filter(m => (filters.category === 'All Categories' || m.categoryId?.name === filters.category) && (filters.subCategory === 'All Sub Categories' || m.subCategoryId?.name === filters.subCategory)).map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`).filter((v, i, a) => a.indexOf(v) === i).map((range, i) => <option key={i} value={range}>{range}</option>)}
                        {projectTypesList.length > 0 && <option disabled>──────────</option>}
                        {projectTypesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] text-gray-600 mb-1.5">Sub Project Type</label>
                      <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0076a8]" value={filters.subProjectType} onChange={(e) => handleFilterChange('subProjectType', e.target.value)} disabled={filters.projectType === 'All Project Types'}>
                        <option>All Sub Types</option>
                        {subProjectTypesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
               </div>
               <div className="xl:w-[350px] shrink-0 p-5">
                   <h5 className="font-bold text-[#14233c] mb-4 text-[15px]">Select Kit Type</h5>
                    <div className="flex gap-4 mt-2 mb-6">
                      <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setKitType('All')}>
                         <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${kitType === 'All' ? 'border-[#0076a8]' : 'border-gray-300'}`}>{kitType === 'All' && <div className="w-2.5 h-2.5 rounded-full bg-[#0076a8]"></div>}</div>
                         <div className="flex flex-col"><span className={`text-[13px] font-bold tracking-tight ${kitType === 'All' ? 'text-[#0076a8]' : 'text-gray-500'}`}>All Kits</span><span className="text-[10px] text-gray-400">Show all kit types</span></div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setKitType('Custom Kit')}>
                         <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${kitType === 'Custom Kit' ? 'border-[#0076a8]' : 'border-gray-300'}`}>{kitType === 'Custom Kit' && <div className="w-2.5 h-2.5 rounded-full bg-[#0076a8]"></div>}</div>
                         <div className="flex flex-col"><span className={`text-[13px] font-bold tracking-tight ${kitType === 'Custom Kit' ? 'text-[#0076a8]' : 'text-gray-500'}`}>Custom Kit</span><span className="text-[10px] text-gray-400">Build your own kit</span></div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setKitType('Combo Kit')}>
                         <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${kitType === 'Combo Kit' ? 'border-[#0076a8]' : 'border-gray-300'}`}>{kitType === 'Combo Kit' && <div className="w-2.5 h-2.5 rounded-full bg-[#0076a8]"></div>}</div>
                         <div className="flex flex-col"><span className={`text-[13px] font-bold tracking-tight ${kitType === 'Combo Kit' ? 'text-[#14233c]' : 'text-gray-500'}`}>Combo Kit</span><span className="text-[10px] text-gray-400">Pre-configured kits</span></div>
                      </label>
                    </div>

                    {/* Combo Kit Selection (2-step) */}
                    {kitType === 'Combo Kit' && (
                      <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Combokit</label>
                            <select 
                               value={selectedComboKitId}
                               onChange={(e) => setSelectedComboKitId(e.target.value)}
                               className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 transition-all text-xs bg-white"
                            >
                               <option value="">-- Choose Combokit --</option>
                                {combokitsFromAddModule.map(kit => (
                                  <option key={kit._id || kit.id} value={kit._id || kit.id}>{kit.name}</option>
                               ))}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Configuration</label>
                            <select 
                               value={selectedConfigId}
                               onChange={(e) => handleConfigSelect(e.target.value)}
                               className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 transition-all text-xs bg-white"
                               disabled={!selectedComboKitId}
                            >
                               <option value="">{selectedComboKitId ? "-- Choose Configuration --" : "Select a kit first"}</option>
                               {configurationsList.map(config => (
                                  <option key={config._id} value={config._id}>
                                     {config.solarkitName} - {config.category} ({config.projectType}) | {config.state?.name || config.state || 'Local'}
                                  </option>
                               ))}
                            </select>
                         </div>
                      </div>
                    )}

                    {/* Custom Kit Selection (Direct) */}
                    {kitType === 'Custom Kit' && (
                      <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                         <div>
                            <label className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1.5 ml-1">Select Customized Kit</label>
                            <select 
                               value={selectedConfigId}
                               onChange={(e) => handleConfigSelect(e.target.value)}
                               className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:border-orange-500 transition-all text-xs bg-white"
                            >
                               <option value="">-- Choose Customized Kit --</option>
                               {configurationsList.map(config => (
                                  <option key={config._id} value={config._id}>
                                      {config.panels?.[0] || 'adani'} | {config.state?.name || config.state || 'Gujarat'} | {config.districts?.[0]?.name || (config.districts?.[0]) || 'Ahmedabad'} | {config.role || 'Dealer'}
                                  </option>
                               ))}
                            </select>
                         </div>
                      </div>
                    )}

                    <h5 className="font-bold text-[#14233c] mb-3 text-[14px]">Payment Type</h5>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setPaymentType('All')}>
                         <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentType === 'All' ? 'border-[#0076a8]' : 'border-gray-300'}`}>{paymentType === 'All' && <div className="w-2 h-2 rounded-full bg-[#0076a8]"></div>}</div>
                         <span className={`text-[12px] font-bold ${paymentType === 'All' ? 'text-[#0076a8]' : 'text-gray-500'}`}>All</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setPaymentType('Cash')}>
                         <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentType === 'Cash' ? 'border-[#0076a8]' : 'border-gray-300'}`}>{paymentType === 'Cash' && <div className="w-2 h-2 rounded-full bg-[#0076a8]"></div>}</div>
                         <span className={`text-[12px] font-bold ${paymentType === 'Cash' ? 'text-[#0076a8]' : 'text-gray-500'}`}>Cash</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setPaymentType('Loan')}>
                         <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentType === 'Loan' ? 'border-[#0076a8]' : 'border-gray-300'}`}>{paymentType === 'Loan' && <div className="w-2 h-2 rounded-full bg-[#0076a8]"></div>}</div>
                         <span className={`text-[12px] font-bold ${paymentType === 'Loan' ? 'text-[#14233c]' : 'text-gray-500'}`}>Loan</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer group" onClick={() => setPaymentType('EMI')}>
                         <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentType === 'EMI' ? 'border-[#0076a8]' : 'border-gray-300'}`}>{paymentType === 'EMI' && <div className="w-2 h-2 rounded-full bg-[#0076a8]"></div>}</div>
                         <span className={`text-[12px] font-bold ${paymentType === 'EMI' ? 'text-[#14233c]' : 'text-gray-500'}`}>EMI</span>
                      </label>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 xl:w-[500px] max-w-full">
               <h5 className="font-bold text-[#14233c] mb-4 text-[15px]">Product & Brand Filters</h5>
               <div className="flex flex-col sm:flex-row items-end gap-3">
                 <div className="flex-1 w-full">
                    <label className="block text-[13px] text-gray-600 mb-1.5">Brand</label>
                    <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0076a8]" value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)}>
                      <option>All Brands</option>
                      {brandsList.map(b => <option key={b._id} value={b.brand || b.name || b.companyName}>{b.brand || b.name || b.companyName}</option>)}
                    </select>
                 </div>
                 <div className="flex-1 w-full">
                    <label className="block text-[13px] text-gray-600 mb-1.5">Product Type</label>
                    <select className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0076a8]" value={filters.productType} onChange={(e) => handleFilterChange('productType', e.target.value)}>
                      <option>All Products</option>
                      {productsList.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                    </select>
                 </div>
                 <button onClick={handleApplyFilters} className="flex items-center justify-center gap-1.5 text-[13px] text-gray-500 hover:text-[#0076a8] font-bold py-1.5 sm:mb-0 w-full sm:w-auto mt-2 sm:mt-0"><Filter size={14} /> Apply Filters</button>
               </div>
            </div>
          </div>
        )}

        {selectedDistrictId && (
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[1200px]">
                  <thead className="bg-[#343a40] text-white">
                    <tr>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight">Partner</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight">Combo Kit</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight">Brand</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-20">Product Type</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-20">Payment Type</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight">Category</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-24">Sub Category</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-20">Project Type</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-24">Sub Project Type</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-28">Solar Panel BenchMark Price (Per Kw)</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-28">Latest Buying Price (per Kw)</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-24">Purchase History</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-28">Company Margin (per KW)</th>
                      <th className="p-3 border-r border-white/20 text-center text-xs font-bold leading-tight w-20">GST (%)</th>
                      <th className="p-3 text-center text-xs font-bold leading-tight">Actions</th>
                      <th className="p-3 text-center text-xs font-bold leading-tight w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       <tr><td colSpan="15" className="text-center py-6 text-gray-500">Loading prices...</td></tr>
                    ) : tableData.length === 0 ? (
                       <tr><td colSpan="15" className="text-center py-10 text-gray-500 font-bold bg-gray-50/30">
                          {summaryData.length > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                               <CheckCircle className="text-green-500" size={24} />
                               <span>All selected components are already configured and shown in the summary below.</span>
                            </div>
                          ) : (
                            "No data found. Please select Brand and Product Type to add new price."
                          )}
                       </td></tr>
                    ) : (
                       tableData.map((row) => (
                           <tr key={row.id} className={`border-b border-gray-100 transition-all duration-300 ${row.marketPrice > row.benchmarkPrice ? 'bg-red-50 hover:bg-red-100/80 border-l-4 border-red-500' : 'hover:bg-gray-50'}`}>
                              <td className="p-2 border-r border-gray-100 text-center text-blue-600 text-[10px] font-bold">
                                {row.role ? row.role : (selectedPartnerType !== 'all' ? selectedPartnerType : 'All')}
                              </td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-[11px] font-medium">{row.comboKit}</td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-xs">{row.brand}</td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-xs">{row.productType}</td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-[10px] font-bold">
                                 <span className={`px-2 py-0.5 rounded-full ${row.paymentType === 'Cash' ? 'bg-green-50 text-green-600' : row.paymentType === 'Loan' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {row.paymentType || 'Cash'}
                                 </span>
                              </td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-xs">{row.category}</td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-xs">{row.subCategory}</td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-xs">{row.projectType}</td>
                              <td className="p-2 border-r border-gray-100 text-center text-gray-600 text-xs">{row.subProjectType}</td>
                              <td className="p-2 border-r border-gray-100 text-center relative group">
                                  <input 
                                    type="number" 
                                    className={`w-28 px-2 py-1.5 border rounded-full text-center text-xs mx-auto focus:outline-none transition-all ${
                                      row.isEditing 
                                      ? (row.benchmarkPrice < row.marketPrice ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-blue-400 bg-white') 
                                      : (row.benchmarkPrice < row.marketPrice ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50')
                                    }`} 
                                    value={row.benchmarkPrice} 
                                    onChange={(e) => handleTableInputChange(row.id, 'benchmarkPrice', Number(e.target.value) || 0)} 
                                    disabled={!row.isEditing} 
                                  />
                                  {row.benchmarkPrice < row.marketPrice && (
                                    <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow-sm transform scale-75 animate-pulse" title="Outdated Benchmark! Real cost is higher.">
                                      <RefreshCw size={10} />
                                    </div>
                                  )}
                               </td>
                              <td className="p-2 border-r border-gray-100 text-center">
                                  <div className="w-28 px-2 py-1.5 border border-gray-200 bg-gray-100 rounded-full text-center text-xs mx-auto text-gray-500 font-bold select-none cursor-not-allowed">
                                     {row.marketPrice}
                                  </div>
                               </td>
                              <td className="p-2 border-r border-gray-100 text-center"><button onClick={() => setShowHistoryModal(true)} className="bg-[#17a2b8] text-white px-3 py-1 rounded font-bold text-[10px] hover:bg-[#138496]">View</button></td>
                              <td className="p-2 border-r border-gray-100 text-center">
                                 <button onClick={() => setShowMarginModal(true)} className={`px-3 py-1 rounded font-bold text-[10px] transition-all ${
                                    row.benchmarkPrice < row.marketPrice ? 'bg-orange-500 hover:bg-orange-600 text-white animate-bounce' : 'bg-[#ffc107] text-[#212529] hover:bg-[#e0a800]'
                                  }`}>
                                    {row.benchmarkPrice < row.marketPrice ? 'Update Margin' : 'Set Margin'}
                                  </button>
                              </td>
                              <td className="p-2 border-r border-gray-100 text-center">
                                 <input type="number" className={`w-16 px-2 py-1.5 border rounded-full text-center text-xs mx-auto focus:outline-none ${row.isEditing ? 'border-blue-400 bg-white' : 'border-gray-200 bg-gray-50'}`} value={row.gst} onChange={(e) => handleTableInputChange(row.id, 'gst', Number(e.target.value) || 0)} disabled={!row.isEditing} />
                              </td>
                              <td className="p-2 text-center border-r border-gray-100">
                                 <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => toggleRowEdit(row.id)} className={`px-3 py-1.5 rounded font-bold text-[10px] text-white shadow-sm transition-all min-w-[60px] ${row.isEditing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#28a745] hover:bg-green-600'}`}>{row.isEditing ? 'Save' : 'Edit'}</button>
                                    <button onClick={() => handleDeletePrice(row.id)} className="px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 shadow-sm" title="Delete"><Trash2 size={13} /></button>
                                 </div>
                              </td>
                              <td className="p-2 text-center">
                                 {row.isGenerated ? (
                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Unsaved</span>
                                 ) : (
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Database</span>
                                 )}
                              </td>
                          </tr>
                       ))
                    )}
                  </tbody>
                </table>
             </div>
             <div className="p-4 border-t border-gray-100 flex gap-2">
                 <button className="bg-gray-500 text-white px-5 py-2 rounded shadow text-sm font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors" onClick={handleResetFilters}><RefreshCw size={16} /> Reset Filters</button>
             </div>
          </div>
        )}

        {summaryData.length > 0 && (
          <div className="mt-16 animate-in slide-in-from-bottom-10 duration-700">
             <div className="flex items-center gap-3 mb-5 px-1">
                <Tag className="text-[#0076a8]" size={22} />
                <h3 className="text-xl font-black text-[#14233c] tracking-tight">Pricing Summary Overview</h3>
                <div className="h-px flex-1 bg-gray-200 ml-4"></div>
             </div>
             <div className="bg-white rounded-xl shadow-xl border-t-4 border-[#14233c] overflow-hidden">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-[#f8fafc] border-b border-gray-200">
                       <tr>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider w-[6%]">Partner</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider w-[10%]">Component</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider w-[10%]">Category</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider w-[10%]">Sub Category</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider w-[11%]">Project Info</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider w-[8%] text-center">Brand</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider w-[6%] text-center">Payment</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider text-right w-[8%]">Benchmark (₹)</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider text-right w-[12%]">Latest Buying Price (per Kw)</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider text-right w-[8%]">Margin</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider text-center w-[10%]">Validity</th>
                          <th className="p-3 font-bold text-[#0076a8] text-[10px] uppercase tracking-widest text-right w-[10%] bg-blue-50/50">Final (₹)</th>
                          <th className="p-3 font-bold text-[#14233c] text-[10px] uppercase tracking-wider text-center w-[5%]">Action</th>
                       </tr>
                    </thead>
                   <tbody className="divide-y divide-gray-100">
                      {summaryData.map((row, i) => {
                         const marginValue = (row.marketPrice || 0) - (row.benchmarkPrice || 0);
                         const gstAmount = (row.marketPrice || 0) * (row.gst || 0) / 100;
                         const finalCompTotal = (row.marketPrice || 0) + gstAmount;
                         return (
                             <tr key={i} className={`transition-all duration-300 ${row.marketPrice > row.benchmarkPrice ? 'bg-red-50 hover:bg-red-100/80 border-l-4 border-red-500' : 'hover:bg-gray-50/50'}`}>
                               <td className="p-3 border-r border-gray-50 font-bold text-blue-600 text-[10px]">
                                  {row.role ? row.role : (selectedPartnerType !== 'all' ? selectedPartnerType : 'All')}
                                </td>
                                <td className="p-3 border-r border-gray-50">
                                   <div className="font-bold text-gray-800 text-[11px] leading-tight">{row.productType}</div>
                                </td>
                                <td className="p-3 border-r border-gray-50">
                                   <div className="text-[10px] text-gray-600 font-medium">{row.category || '-'}</div>
                                </td>
                                <td className="p-3 border-r border-gray-50">
                                   <div className="text-[10px] text-gray-500">{row.subCategory || '-'}</div>
                                </td>
                                <td className="p-3 border-r border-gray-50">
                                   <div className="text-[10px] font-bold text-gray-700 leading-none mb-1">{row.projectType || '-'}</div>
                                   <div className="text-[8px] text-indigo-500 font-black uppercase tracking-tighter">{row.subProjectType || '-'}</div>
                                </td>
                                <td className="p-3 font-bold text-gray-600 border-r border-gray-50 uppercase text-[10px] text-center">{row.brand}</td>
                                <td className="p-3 border-r border-gray-50 text-center">
                                   <span className={`px-1 rounded text-[8px] font-black uppercase tracking-tighter ${row.paymentType === 'Cash' ? 'bg-green-100 text-green-700' : row.paymentType === 'Loan' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                      {row.paymentType || 'Cash'}
                                   </span>
                                </td>
                                <td className="p-3 text-right text-gray-500 font-mono text-[11px] border-r border-gray-50">{(row.benchmarkPrice || 0).toLocaleString()}</td>
                                <td className="p-3 text-right text-gray-900 font-black font-mono text-[11px] border-r border-gray-50">{(row.marketPrice || 0).toLocaleString()}</td>
                                <td className={`p-3 text-right font-black font-mono text-[11px] border-r border-gray-50 ${marginValue >= 0 ? 'text-green-600' : 'text-red-500'}`}>{marginValue.toLocaleString()}</td>
                                <td className="p-3 text-center border-r border-gray-50">
                                   <div className="text-[9px] font-bold text-gray-600">{row.validFrom ? new Date(row.validFrom).toLocaleDateString() : 'N/A'}</div>
                                   <div className="text-[8px] text-gray-400">to {row.validTo ? new Date(row.validTo).toLocaleDateString() : '∞'}</div>
                                </td>
                                <td className="p-3 text-right bg-blue-50/30 font-black font-mono text-[12px] text-[#0076a8] border-r border-gray-50">{finalCompTotal.toLocaleString()}</td>
                                <td className="p-3 text-center">
                                   <div className="flex items-center justify-center gap-1">
                                      <button onClick={() => handleEditExisting(row)} className="p-1.5 text-[#0076a8] hover:bg-blue-50 rounded-full transition-colors" title="Edit Price">
                                         <Edit size={14} />
                                      </button>
                                      <button onClick={() => handleDeletePrice(row.id || row._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete Price">
                                         <Trash2 size={14} />
                                      </button>
                                   </div>
                               </td>
                            </tr>
                         );
                      })}
                    </tbody>
                    <tfoot className="bg-[#f8fafc] border-t-2 border-gray-200">
                       <tr>
                          <td colSpan="9" className="p-4">
                             <div className="flex justify-between items-center px-2">
                                <div className="flex gap-8">
                                   <div className="flex flex-col">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">Total Components</span>
                                      <span className="text-xl font-black text-[#14233c]">{summaryData.length} Items</span>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">Unique Brands</span>
                                      <span className="text-xl font-black text-[#14233c]">{[...new Set(summaryData.map(d => d.brand))].length} Brands</span>
                                   </div>
                                </div>
                             </div>
                          </td>
                       </tr>
                    </tfoot>
                </table>
             </div>
          </div>
        )}
      </div>
      
      {/* Modals follow ... */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-none">
              <h3 className="text-xl font-bold text-[#0b386a]">{editingPriceId ? 'Edit Price Details' : 'Add New Price'}</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pointer-events-auto">
                {(newPriceForm.kitType === 'Combo Kit' || newPriceForm.kitType === 'Custom Kit') && (
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${newPriceForm.kitType === 'Custom Kit' ? 'text-orange-500' : 'text-gray-500'}`}>
                        {newPriceForm.kitType === 'Custom Kit' ? 'Select Customized Kit' : 'Combo Kit Name'}
                    </label>
                    <select className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all text-sm font-bold ${newPriceForm.kitType === 'Custom Kit' ? 'border-orange-200 focus:ring-orange-500 text-orange-800 bg-orange-50/50' : 'border-gray-200 focus:ring-blue-500 text-blue-800 bg-blue-50/50'}`} value={newPriceForm.comboKit} onChange={e => setNewPriceForm({ ...newPriceForm, comboKit: e.target.value })}>
                       <option value="">{newPriceForm.kitType === 'Custom Kit' ? 'Select Customized Kit' : 'Select Combo Kit'}</option>
                       {(newPriceForm.kitType === 'Custom Kit' ? customizedCombokits : combokitsFromAddModule).map((kit, i) => (
                           <option key={i} value={kit.name || kit.solarkitName}>
                               {kit.name || `${kit.panels?.[0] || 'adani'} | ${kit.state?.name || 'Gujarat'} | ${kit.districts?.[0]?.name || 'Ahmedabad'}`}
                           </option>
                       ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Type</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.productType} onChange={e => setNewPriceForm({ ...newPriceForm, productType: e.target.value })}>
                     <option value="">Select Product Type</option>
                     {productsList.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Partner Type</label>
                   <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.role} onChange={e => setNewPriceForm({ ...newPriceForm, role: e.target.value })}>
                      <option value="">All Partners</option>
                      {partnerTypes?.filter((type, index, self) => 
                        index === self.findIndex((t) => t.name === type.name)
                      ).map(p => (
                        <option key={p._id} value={p.name}>{p.name}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Payment Type</label>
                   <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.paymentType} onChange={e => setNewPriceForm({ ...newPriceForm, paymentType: e.target.value })}>
                      <option value="Cash">Cash</option>
                      <option value="Loan">Loan</option>
                      <option value="EMI">EMI</option>
                   </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Brand</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.brand} onChange={e => setNewPriceForm({ ...newPriceForm, brand: e.target.value })}>
                      <option value="">Select Brand</option>
                      {brandsList.map(b => <option key={b._id} value={b.brand || b.name || b.companyName}>{b.brand || b.name || b.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.category} onChange={e => { const catName = e.target.value; setNewPriceForm({ ...newPriceForm, category: catName, subCategory: '' }); const catObj = categoriesList.find(c => c.name === catName); setFilteredModalSubCategories(catObj ? subCategoriesList.filter(sc => sc.categoryId === catObj._id || sc.categoryId?._id === catObj._id) : []); }}>
                       <option value="">Select Category</option>
                       {categoriesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sub Category</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.subCategory} onChange={e => setNewPriceForm({ ...newPriceForm, subCategory: e.target.value })} disabled={!newPriceForm.category}>
                       <option value="">Select Sub Category</option>
                       {filteredModalSubCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Project Type</label>
                   <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.projectType} onChange={e => { const projName = e.target.value; setNewPriceForm({ ...newPriceForm, projectType: projName, subProjectType: '' }); }}>
                        <option value="">Select Project Type</option>
                        {mappingsList
                          .filter(m => {
                            const catMatch = !newPriceForm.category || 
                              (m.categoryId?.name === newPriceForm.category) || 
                              (m.categoryId?._id === newPriceForm.category) || 
                              (m.categoryId === newPriceForm.category);
                            
                            const subMatch = !newPriceForm.subCategory || 
                              (m.subCategoryId?.name === newPriceForm.subCategory) || 
                              (m.subCategoryId?._id === newPriceForm.subCategory) || 
                              (m.subCategoryId === newPriceForm.subCategory);
                            
                            return catMatch && subMatch;
                          })
                          .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .map((range, i) => <option key={i} value={range}>{range}</option>)}
                        
                        {projectTypesList.length > 0 && <option disabled>──────────</option>}
                        {projectTypesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                   </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sub Project Type</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.subProjectType} onChange={e => setNewPriceForm({ ...newPriceForm, subProjectType: e.target.value })} disabled={!newPriceForm.projectType}>
                       <option value="">Select Sub Project Type</option>
                       {filteredModalSubProjectTypes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Benchmark Price</label><input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.benchmarkPrice} onChange={e => {
                  const bench = Number(e.target.value);
                  setNewPriceForm({ ...newPriceForm, benchmarkPrice: bench, margin: newPriceForm.marketPrice - bench });
                }} /></div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     Latest Buying Price <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded font-black italic">History Locked</span>
                   </label>
                   <input 
                     type="number" 
                     className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg outline-none text-sm font-bold text-gray-500 cursor-not-allowed" 
                     value={newPriceForm.marketPrice} 
                     readOnly 
                   />
                 </div>
                <div className="md:col-span-2">
                   <div className="flex justify-between items-end mb-2">
                      <label className="block text-xs font-bold text-orange-600 uppercase tracking-widest">Company Margin (per KW)</label>
                      <button 
                        type="button" 
                        onClick={() => setShowMarginModal(true)}
                        className="text-[10px] bg-[#ffc107] hover:bg-yellow-500 text-black font-black px-2 py-0.5 rounded shadow-sm transition-all flex items-center gap-1 uppercase"
                      >
                        <Settings size={10} /> View Detailed Margin
                      </button>
                   </div>
                   <div className="relative">
                      <input type="number" className="w-full px-4 py-3 border border-orange-200 bg-orange-50/30 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-orange-900" value={newPriceForm.margin || 0} onChange={e => {
                        const mgn = Number(e.target.value);
                        setNewPriceForm({ ...newPriceForm, margin: mgn, marketPrice: (newPriceForm.benchmarkPrice || 0) + mgn });
                      }} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-400 uppercase">Margin</div>
                   </div>
                </div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">GST (%)</label><input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.gst} onChange={e => setNewPriceForm({ ...newPriceForm, gst: Number(e.target.value) })} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Valid From</label><input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.validFrom} onChange={e => setNewPriceForm({ ...newPriceForm, validFrom: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Valid To (Optional)</label><input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newPriceForm.validTo} onChange={e => setNewPriceForm({ ...newPriceForm, validTo: e.target.value })} /></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-white flex-none">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                <button type="button" onClick={handleAddNewSubmit} className="flex-1 px-4 py-3 bg-[#0d6efd] text-white font-bold rounded-lg shadow hover:bg-blue-600 transition-all text-sm">{editingPriceId ? 'Update Price' : 'Save Price'}</button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 bg-[#17a2b8] flex justify-between items-center text-white"><h3 className="text-lg font-bold">Purchase History</h3><button type="button" onClick={() => setShowHistoryModal(false)}><X size={20} /></button></div>
             <div className="p-6">
                <div className="mb-4"><select className="px-3 py-1.5 border border-gray-300 rounded text-sm" value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}><option>Last 3 Months</option><option>Last 6 Months</option><option>Last Year</option></select></div>
                <div className="border border-gray-200 rounded overflow-hidden">
                   <table className="w-full text-left text-sm"><thead className="bg-[#6db3f2] text-white"><tr><th className="p-3">Date</th><th className="p-3">Price</th><th className="p-3">Change</th><th className="p-3">Vendor</th></tr></thead><tbody><tr className="border-b"><td className="p-3">2023-10-15</td><td className="p-3 font-bold">₹24,500</td><td className="p-3 text-green-500">+300</td><td className="p-3">SolarTech Inc</td></tr></tbody></table>
                </div>
             </div>
             <div className="p-4 flex justify-end"><button type="button" onClick={() => setShowHistoryModal(false)} className="px-5 py-2 bg-gray-500 text-white rounded text-sm font-bold">Close</button></div>
          </div>
        </div>
      )}

      {showMarginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 bg-[#ffc107] flex justify-between items-center"><h3 className="text-lg font-bold">Set Company Margin</h3><button type="button" onClick={() => setShowMarginModal(false)}><X size={20} /></button></div>
             <div className="p-6">
                <div className="border border-gray-200 rounded overflow-hidden">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-[#6db3f2] text-white">
                         <tr>
                            <th className="p-3">Delivery Type</th>
                            <th className="p-3 text-center">Min orders</th>
                            <th className="p-3 text-center">Cost (₹)</th>
                            <th className="p-3 text-center">Margin (₹)</th>
                            <th className="p-3 text-center">
                               <div className="flex flex-col items-center">
                                  <span className="text-[10px] text-red-500 font-bold mb-0.5">% margin</span>
                                  <span>Margin (%)</span>
                               </div>
                            </th>
                            <th className="p-3 text-center">Total (₹)</th>
                         </tr>
                      </thead>
                      <tbody>
                         {marginData.map((row, idx) => (
                            <tr key={idx} className="border-b">
                               <td className="p-3">{row.type}</td>
                               <td className="p-3 text-center">
                                  <input 
                                     type="number" 
                                     value={row.minOrders || 0} 
                                     onChange={e => { 
                                        const n = [...marginData]; 
                                        n[idx].minOrders = Number(e.target.value); 
                                        setMarginData(n); 
                                     }} 
                                     className="w-20 border rounded px-2 py-1 text-center border-gray-300" 
                                  />
                               </td>
                               <td className="p-3 text-center">
                                  <input 
                                     type="number" 
                                     value={row.cost} 
                                     onChange={e => { 
                                        const n = [...marginData]; 
                                        n[idx].cost = Number(e.target.value); 
                                        n[idx].total = n[idx].cost + n[idx].margin; 
                                        setMarginData(n); 
                                     }} 
                                     className="w-20 border rounded px-2 py-1 text-center border-gray-300" 
                                  />
                               </td>
                               <td className="p-3 text-center">
                                  <input 
                                     type="number" 
                                     value={row.margin} 
                                     onChange={e => { 
                                        const n = [...marginData]; 
                                        n[idx].margin = Number(e.target.value); 
                                        n[idx].total = n[idx].cost + n[idx].margin; 
                                        setMarginData(n); 
                                     }} 
                                     className="w-20 border rounded px-2 py-1 text-center border-gray-300" 
                                  />
                               </td>
                               <td className="p-3 text-center">
                                  <input 
                                     type="number" 
                                     value={row.percentageMargin || 0} 
                                     onChange={e => { 
                                        const n = [...marginData]; 
                                        n[idx].percentageMargin = Number(e.target.value); 
                                        setMarginData(n); 
                                     }} 
                                     className="w-20 border rounded px-2 py-1 text-center border-gray-300" 
                                  />
                               </td>
                               <td className="p-3 text-center font-bold">₹{row.total}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
             <div className="p-4 flex justify-end gap-2"><button type="button" onClick={() => setShowMarginModal(false)} className="px-5 py-2 bg-gray-500 text-white rounded font-bold text-sm">Close</button><button type="button" onClick={handleSaveMargins} className="px-5 py-2 bg-blue-600 text-white rounded font-bold text-sm" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button></div>
          </div>
        </div>
      )}
      
      <div className="py-10 border-t border-gray-200 text-center"><p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Copyright © 2025, Solarkits. All Rights Reserved.</p></div>
    </div>
  );
}