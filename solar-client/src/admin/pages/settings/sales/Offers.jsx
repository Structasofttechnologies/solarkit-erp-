import React, { useState, useEffect } from 'react';
import { useLocations } from '../../../../hooks/useLocations';
import salesSettingsService from '../../../../services/settings/salesSettingsApi';
import axiosInstance from '../../../../api/axios';
import { getBundlePlans } from '../../../../services/combokit/combokitApi';
import { EyeOff, Eye, MapPin, Layers, Trash2, Edit, Upload, Image as ImageIcon, Plus, X } from 'lucide-react';

const LocationCard = ({ title, subtitle, isSelected, onClick, isState }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-md transition-all cursor-pointer flex flex-col items-center justify-center text-center h-20 shadow-sm hover:shadow-md ${
      isSelected
      ? isState ? 'border-2 border-[#007bff] bg-[#8ccdfa]' : 'border-2 border-[#007bff] bg-[#eef6ff]'
      : 'border border-gray-200 bg-white'
      }`}
  >
    <div className="font-bold text-[14px] text-[#2c3e50] mb-0">{title}</div>
    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">{subtitle}</div>
  </div>
);

export default function AdminOffers() {
  const [showLocationCards, setShowLocationCards] = useState(true);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');

  const [activeTab, setActiveTab] = useState('solar');
  const [offers, setOffers] = useState([]);
  const [customTabs, setCustomTabs] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);

  const { countries, states, districts, clusters, fetchCountries, fetchStates, fetchDistricts, fetchClusters } = useLocations();
  const selectedCountryObj = countries.find((c) => c._id === selectedCountryId) || null;
  const selectedStateObj = states.find((s) => s._id === selectedStateId) || null;
  const selectedClusterObj = clusters.find((c) => c._id === selectedClusterId) || null;
  const selectedDistrictObj = districts.find((d) => d._id === selectedDistrictId) || null;

  // Global Location Logic
  useEffect(() => {
    fetchCountries();
  }, []);

  // Form States (Solar Panel Bundle Cashback)
  const [solarForm, setSolarForm] = useState({
    cpTypes: [], 
    selectedPlans: [], 
    product: '',
    category: 'All Categories',
    subCategory: 'All Sub Categories',
    brand: 'Adani', 
    kwSelection: '1-3 kW', 
    targetKw: 5,
    cashbackDetails: 1500, 
    startDate: '', 
    endDate: '', 
    autoRenew: false,
    description: '',
    offerImage: ''
  });

  const [loyaltyForm, setLoyaltyForm] = useState({
    partnerType: '', 
    projectType: 'All', 
    cluster: 'All',
    brand: 'All', 
    kwSelection: '1-3 kW',
    yearCashbacks: [{ years: 1, cashback: 1500 }, { years: 3, cashback: 3000 }, { years: 5, cashback: 5000 }],
    description: '',
    offerImage: ''
  });

  const [stockForm, setStockForm] = useState({
    cluster: 'All', 
    bundlePlan: '', 
    currentStock: 50,
    product: '', 
    deadline: '', 
    brand: 'All', 
    cashbackValue: 1000,
    description: '',
    offerImage: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    description: '',
    images: []
  });

  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [pendingOfferName, setPendingOfferName] = useState('');
  const [newOfferForm, setNewOfferForm] = useState({
    offerName: '', 
    offerType: 'Cashback Offer',
    details: {}
  });

  // Dynamic filter lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [partnerTypesList, setPartnerTypesList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [bundlePlansList, setBundlePlansList] = useState([]);

  // Global Location Logic
  useEffect(() => {
    if (selectedCountryId) {
       setSelectedStateId('');
       setSelectedClusterId('');
       setSelectedDistrictId('');
       if (selectedCountryId !== 'all') {
         fetchStates({ countryId: selectedCountryId });
       } else {
         fetchStates(); 
       }
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId) {
      setSelectedClusterId('');
      setSelectedDistrictId('');
      if (selectedStateId !== 'all') {
        fetchClusters({ stateId: selectedStateId }); 
      } else {
        fetchClusters(); 
      }
    }
  }, [selectedStateId]);
 
  useEffect(() => {
    if (selectedClusterId) {
       setSelectedDistrictId('');
       if (selectedClusterId !== 'all') {
         fetchDistricts({ clusterId: selectedClusterId }); 
       } else {
         fetchDistricts(); 
       }
    }
  }, [selectedClusterId]);

  // Fetch Filter Data
  const fetchFilterData = async () => {
    try {
      const { productApi } = await import('../../../../api/productApi');
      const results = await Promise.allSettled([
        productApi.getCategories(),
        productApi.getSubCategories(),
        productApi.getBrands(),
        productApi.getAll(),
        axiosInstance.get('/partner-settings/types'),
        getBundlePlans()
      ]);
      
      const safeExtract = (result) => {
          if (result.status !== 'fulfilled') return [];
          const val = result.value;
          const data = Array.isArray(val) ? val : (val && Array.isArray(val.data)) ? val.data : (val && val.data && Array.isArray(val.data.data)) ? val.data.data : (val?.results || []);
          return data;
      };
      
      setCategoriesList(safeExtract(results[0]));
      setSubCategoriesList(safeExtract(results[1]));
      setBrandsList(safeExtract(results[2]));
      setProductsList(safeExtract(results[3]));
      setPartnerTypesList(safeExtract(results[4]));

      const rawBundles = safeExtract(results[5]);
      const uniqueBundles = Array.from(new Map(rawBundles.filter(b => b.bundleName).map(b => [b.bundleName, b])).values());
      setBundlePlansList(uniqueBundles);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchFilterData();
  }, []);

  // Fetch Dynamic Plans based on Location & Partner Type
  const fetchDynamicPlans = async () => {
    if (!solarForm.cpTypes || solarForm.cpTypes.length === 0) {
      setPlansList([]);
      return;
    }

    try {
      const promises = solarForm.cpTypes.map(async (pType) => {
        const params = { partnerType: pType };
        if (selectedCountryId && selectedCountryId !== 'all') params.countryId = selectedCountryId;
        if (selectedStateId && selectedStateId !== 'all') params.stateId = selectedStateId;
        if (selectedClusterId && selectedClusterId !== 'all') params.clusterId = selectedClusterId;
        if (selectedDistrictId && selectedDistrictId !== 'all') params.districtId = selectedDistrictId;

        const res = await axiosInstance.get('/partner-settings/plans', { params });
        return res.data || [];
      });

      const results = await Promise.all(promises);
      const uniquePlans = [];
      const seenNames = new Set();
      
      results.forEach(plans => {
        plans.forEach(p => {
          if (!seenNames.has(p.name)) {
            seenNames.add(p.name);
            uniquePlans.push({ id: p._id, name: p.name });
          }
        });
      });

      setPlansList(uniquePlans);
    } catch (error) {
       console.error("Error fetching dynamic plans:", error);
    }
  };

  useEffect(() => {
    fetchDynamicPlans();
  }, [selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId, solarForm.cpTypes]);

  // Sync selectedPlans with plansList
  useEffect(() => {
    const validPlanNames = plansList.map(p => p.name);
    const newSelected = solarForm.selectedPlans.filter(p => validPlanNames.includes(p));
    if (newSelected.length !== solarForm.selectedPlans.length) {
       setSolarForm(prev => ({...prev, selectedPlans: newSelected}));
    }
  }, [plansList]);

  useEffect(() => {
    fetchOffers();
  }, [selectedCountryId, selectedStateId, selectedClusterId, selectedDistrictId, activeTab]);

  const handleEdit = (offer) => {
    setEditingOfferId(offer._id);
    const type = offer.offerType;

    if (type === 'Solar Cashback') {
       setActiveTab('solar');
       setSolarForm({
          cpTypes: Array.isArray(offer.cpTypes) ? offer.cpTypes : (offer.cpType ? [offer.cpType] : []),
          selectedPlans: offer.plans || [],
          product: offer.product || '',
          category: offer.category || 'All Categories',
          subCategory: offer.subCategory || 'All Sub Categories',
          brand: offer.brand || 'Adani',
          kwSelection: offer.kwSelection || '1-3 kW',
          targetKw: offer.targetKw || 5,
          cashbackDetails: offer.cashbackAmount || 1500,
          startDate: offer.startDate ? offer.startDate.split('T')[0] : '',
          endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
          autoRenew: offer.autoRenew || false,
          description: offer.description || '',
          offerImage: offer.offerImage || ''
       });
    } else if (type === 'Loyalty Program') {
       setActiveTab('loyalty');
       setLoyaltyForm({
          partnerType: offer.cpType || '',
          projectType: offer.projectType || 'All',
          brand: offer.brand || 'All',
          kwSelection: offer.kwSelection || '1-3 kW',
          yearCashbacks: offer.yearCashbacks || [{years: 1, cashback: 1000}, {years: 5, cashback: 5000}],
          cluster: offer.location?.cluster || 'All',
          description: offer.description || '',
          offerImage: offer.offerImage || ''
       });
    } else if (type === 'Limited Stock') {
       setActiveTab('limited');
       setStockForm({
          cluster: offer.location?.cluster || 'Ahmedabad',
          bundlePlan: offer.bundlePlan || 'Basic Solar Bundle',
          currentStock: offer.currentStock || 10,
          product: offer.product || 'Solar Panel',
          deadline: offer.deadline ? offer.deadline.split('T')[0] : '',
          brand: offer.brand || 'All',
          cashbackValue: offer.cashbackValue || 1500,
          description: offer.description || '',
          offerImage: offer.offerImage || ''
       });
    } else if (type === 'Global Announcement') {
       setActiveTab('announcement');
       setAnnouncementForm({
          title: offer.offerName || '',
          description: offer.description || '',
          images: offer.images || (offer.offerImage ? [offer.offerImage] : [])
       });
    } else {
       // For any other types, we default to solar or just don't switch tabs
       setPendingOfferName(offer.offerName);
       // Add logic if there are more types, otherwise just show it
    }

    setPendingOfferName(offer.offerName);
    if (offer.location) {
       setSelectedCountryId(offer.location.country || 'All');
       setSelectedStateId(offer.location.state || 'All');
       setSelectedDistrictId(offer.location.district || 'All');
       setSelectedClusterId(offer.location.cluster || 'All');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert("Please upload only JPG or PNG images.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSolarForm(prev => ({ ...prev, offerImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isWithinTimeline = (start, end) => {
    if (!start || !end) return false;
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    return now >= startDate && now <= endDate;
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await salesSettingsService.getOffers({});
      const allOffers = res || [];
      const mainOfferNames = ["Solar Panel Bundle Cashback", "Loyalty Program", "Limited Stock Offer"];
      const uniqueNames = [...new Set(allOffers.map(o => o.offerName))].filter(n => n && !mainOfferNames.includes(n));
      setCustomTabs(uniqueNames);

      let filtered = allOffers;
      // We removed the activeTab filtering here so the table shows ALL saved offers
      // but we still apply location filters if a specific state/cluster/district is chosen in the cards

      if (selectedStateId && selectedStateId !== 'all') {
         filtered = filtered.filter(o => !o.location || o.location.state === selectedStateId || o.location.state === 'All' || !o.location.state);
      }
      if (selectedClusterId && selectedClusterId !== 'all') {
         filtered = filtered.filter(o => !o.location || o.location.cluster === selectedClusterId || o.location.cluster === 'All' || !o.location.cluster);
      }
      if (selectedDistrictId && selectedDistrictId !== 'all') {
         filtered = filtered.filter(o => !o.location || o.location.district === selectedDistrictId || o.location.district === 'All' || !o.location.district);
      }
      setOffers(filtered);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await salesSettingsService.deleteOffer(id);
        fetchOffers();
      } catch (error) {
        console.error("Error deleting offer:", error);
      }
    }
  };

  const handleSolarSubmit = async () => {
    if (solarForm.startDate && solarForm.endDate) {
      if (new Date(solarForm.endDate) < new Date(solarForm.startDate)) {
        alert("End Date cannot be earlier than Start Date");
        return;
      }
    }
    try {
      const payload = {
        offerName: pendingOfferName || "Solar Panel Bundle Cashback",
        offerType: 'Solar Cashback',
        cpTypes: solarForm.cpTypes,
        plans: solarForm.selectedPlans,
        product: solarForm.product,
        category: solarForm.category,
        subCategory: solarForm.subCategory,
        brand: solarForm.brand,
        kwSelection: solarForm.kwSelection,
        targetKw: Number(solarForm.targetKw),
        cashbackAmount: Number(solarForm.cashbackDetails),
        startDate: solarForm.startDate,
        endDate: solarForm.endDate,
        autoRenew: solarForm.autoRenew,
        description: solarForm.description,
        offerImage: solarForm.offerImage,
        location: {
          country: selectedCountryId || 'All',
          state: selectedStateId || 'All',
          district: selectedDistrictId || 'All',
          cluster: selectedClusterId || 'All'
        },
        status: 'Active'
      };
      
      if (editingOfferId) {
         await salesSettingsService.updateOffer(editingOfferId, payload);
         alert("Solar Cashback Offer Updated!");
      } else {
         await salesSettingsService.createOffer(payload);
         alert("Solar Cashback Offer Saved!");
      }
      setEditingOfferId(null);
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      alert("Failed to save offer");
    }
  };

  const handleLoyaltySubmit = async () => {
    try {
      const payload = {
        offerName: pendingOfferName || "Loyalty Cashback",
        offerType: 'Loyalty Program',
        cpType: loyaltyForm.partnerType,
        projectType: loyaltyForm.projectType,
        brand: loyaltyForm.brand,
        kwSelection: loyaltyForm.kwSelection,
        yearCashbacks: loyaltyForm.yearCashbacks,
        description: loyaltyForm.description,
        offerImage: loyaltyForm.offerImage,
        location: {
          country: selectedCountryId || 'All',
          state: selectedStateId || 'All',
          district: selectedDistrictId || 'All',
          cluster: loyaltyForm.cluster === 'All' ? 'All' : loyaltyForm.cluster
        },
        status: 'Active'
      };
      if (editingOfferId) { await salesSettingsService.updateOffer(editingOfferId, payload); alert("Loyalty Program Updated!"); }
      else { await salesSettingsService.createOffer(payload); alert("Loyalty Program Saved!"); }
      setEditingOfferId(null); fetchOffers();
    } catch (error) { console.error("Error saving loyalty offer:", error); alert("Failed to save offer"); }
  };

  const handleStockSubmit = async () => {
    try {
      const payload = {
        offerName: pendingOfferName || "Limited Stock Offer",
        offerType: 'Limited Stock',
        bundlePlan: stockForm.bundlePlan,
        currentStock: Number(stockForm.currentStock),
        product: stockForm.product,
        deadline: stockForm.deadline,
        brand: stockForm.brand,
        cashbackValue: Number(stockForm.cashbackValue),
        description: stockForm.description,
        offerImage: stockForm.offerImage,
        location: {
          country: selectedCountryId || 'All',
          state: selectedStateId || 'All',
          district: selectedDistrictId || 'All',
          cluster: stockForm.cluster === 'All' ? 'All' : stockForm.cluster
        },
        status: 'Active'
      };
      if (editingOfferId) { await salesSettingsService.updateOffer(editingOfferId, payload); alert("Limited Stock Offer Updated!"); }
      else { await salesSettingsService.createOffer(payload); alert("Limited Stock Offer Saved!"); }
      setEditingOfferId(null); fetchOffers();
    } catch (error) { console.error("Error saving stock offer:", error); alert("Failed to save offer"); }
  };

  const handleAnnouncementSubmit = async () => {
    if (!announcementForm.title || !announcementForm.description) {
      alert("Title and Description are required");
      return;
    }
    try {
      const payload = {
        offerName: announcementForm.title,
        offerType: 'Global Announcement',
        description: announcementForm.description,
        images: announcementForm.images,
        offerImage: announcementForm.images[0] || '', // Primary image
        location: {
          country: selectedCountryId || 'All',
          state: selectedStateId || 'All',
          district: selectedDistrictId || 'All',
          cluster: selectedClusterId || 'All'
        },
        status: 'Active'
      };
      if (editingOfferId) {
        await salesSettingsService.updateOffer(editingOfferId, payload);
        alert("Announcement Updated!");
      } else {
        await salesSettingsService.createOffer(payload);
        alert("Announcement Posted!");
      }
      setEditingOfferId(null);
      setAnnouncementForm({ title: '', description: '', images: [] });
      fetchOffers();
      setActiveTab('solar');
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Failed to save announcement");
    }
  };

  const handleOfferContinue = () => {
    if (!newOfferForm.offerName) {
      alert("Please enter an offer name");
      return;
    }
    
    setPendingOfferName(newOfferForm.offerName);
    
    if (newOfferForm.offerType === 'Cashback Offer' || newOfferForm.offerType === 'Solar Cashback') {
       setActiveTab('solar');
    } else if (newOfferForm.offerType === 'Loyalty Program') {
       setActiveTab('loyalty');
    } else if (newOfferForm.offerType === 'Limited Stock' || newOfferForm.offerType === 'Limited Stock Offer') {
       setActiveTab('limited');
    } else if (newOfferForm.offerType === 'Global Announcement') {
       setActiveTab('announcement');
       setAnnouncementForm({ ...announcementForm, title: newOfferForm.offerName });
    }
    
    setShowNewOfferModal(false);
    // We don't reset newOfferForm here because we might need it for editing
  };

  const handleNewOfferSubmit = async () => {
    // This is now used for 'Quick' or 'Generic' offers that don't use the big forms
    if (!newOfferForm.offerName) {
      alert("Please enter an offer name");
      return;
    }
    
    setLoading(true);
    try {
      await salesSettingsService.createOffer({
        offerName: newOfferForm.offerName,
        offerType: newOfferForm.offerType,
        ...newOfferForm.details,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        isActive: true,
        location: {
          country: selectedCountryId || 'All',
          state: selectedStateId || 'All',
          cluster: selectedClusterId || 'All',
          district: selectedDistrictId || 'All'
        }
      });
      setShowNewOfferModal(false);
      setNewOfferForm({ offerName: '', offerType: 'Cashback Offer', details: {} });
      fetchOffers();
      alert("Offer created successfully!");
    } catch (error) {
      console.error("Error creating new offer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans">
      <div className="bg-white p-6 border-b border-gray-200 mb-8 px-12">
        <h1 className="text-[22px] font-bold text-[#14233c] mb-2">Offers Management</h1>
        <button
          onClick={() => setShowLocationCards(!showLocationCards)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0076a8] text-white rounded text-xs font-bold shadow-sm hover:bg-blue-800 transition-all"
        >
          {showLocationCards ? <EyeOff size={14} /> : <Eye size={14} />}
          {showLocationCards ? 'Hide Location Cards' : 'Show Location Cards'}
        </button>
      </div>

      <div className="px-12 pb-12">
        {selectedStateObj && !showLocationCards && (
           <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
             <MapPin size={14} className="text-gray-400" />
             Filtering by: 
             {selectedCountryObj && <><span className="font-bold text-[#14233c]">{selectedCountryObj.name}</span> <span className="text-gray-400">&gt;</span></>}
             <span className="font-bold text-[#14233c]">{selectedStateObj?.name}</span>
             {selectedClusterObj && <><span className="text-gray-400">&gt;</span><span className="font-bold text-[#14233c]">{selectedClusterObj.name}</span></>}
             {selectedDistrictObj && <><span className="text-gray-400">&gt;</span><span className="font-bold text-[#14233c]">{selectedDistrictObj.name}</span></>}
           </div>
        )}

        {showLocationCards && (
          <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-[16px] font-bold text-[#14233c] flex items-center gap-2">
                    <MapPin className="text-[#007bff]" size={16} /> Select Country
                  </h2>
                  <button onClick={() => { setSelectedCountryId('all'); setSelectedStateId(''); setSelectedClusterId(''); setSelectedDistrictId(''); }} className="text-xs font-bold text-[#0076a8] hover:underline uppercase tracking-wider">Select All</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <LocationCard title="All Countries" subtitle="ALL" isSelected={selectedCountryId === 'all' || selectedCountryId === ''} onClick={() => { setSelectedCountryId('all'); setSelectedStateId(''); setSelectedClusterId(''); setSelectedDistrictId(''); }} />
                    {countries.map((c) => (
                      <LocationCard key={c._id} title={c.name} subtitle={c.code || c.name.substring(0,2).toUpperCase()} isSelected={selectedCountryId === c._id} onClick={() => setSelectedCountryId(c._id)} />
                    ))}
                </div>
             </div>
             {selectedCountryId && (
              <div className="mb-6 border-t border-gray-100 pt-6 animate-in slide-in-from-left duration-300">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-[16px] font-bold text-[#14233c] flex items-center gap-2">
                    <MapPin className="text-[#007bff]" size={16} /> Select State
                  </h2>
                  <button onClick={() => { setSelectedStateId('all'); setSelectedClusterId(''); setSelectedDistrictId(''); }} className="text-xs font-bold text-[#0076a8] hover:underline uppercase tracking-wider">Select All</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <LocationCard title="All States" subtitle="ALL" isSelected={selectedStateId === 'all' || (selectedCountryId && selectedStateId === '')} isState={true} onClick={() => { setSelectedStateId('all'); setSelectedClusterId(''); setSelectedDistrictId(''); }} />
                    {states.map((s) => (
                      <LocationCard key={s._id} title={s.name} subtitle={s.code || s.name.substring(0,2).toUpperCase()} isSelected={selectedStateId === s._id} isState={true} onClick={() => setSelectedStateId(s._id)} />
                    ))}
                </div>
              </div>
             )}
             {selectedStateId && (
                <div className="mb-6 border-t border-gray-100 pt-6 animate-in slide-in-from-left duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[16px] font-bold text-[#14233c] flex items-center gap-2">
                      <Layers className="text-[#007bff]" size={16} /> Select Cluster
                    </h2>
                    <button onClick={() => { setSelectedClusterId('all'); setSelectedDistrictId(''); }} className="text-xs font-bold text-[#0076a8] hover:underline uppercase tracking-wider">Select All</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                     <LocationCard title="All Clusters" subtitle="ALL" isSelected={selectedClusterId === 'all' || selectedClusterId === ''} onClick={() => { setSelectedClusterId('all'); setSelectedDistrictId(''); }} />
                     {clusters.map((c) => (
                        <LocationCard key={c._id} title={c.name} subtitle={selectedStateObj?.name || 'State'} isSelected={selectedClusterId === c._id} onClick={() => setSelectedClusterId(c._id)} />
                     ))}
                  </div>
                </div>
             )}
             {selectedClusterId && (
                <div className="border-t border-gray-100 pt-6 animate-in slide-in-from-left duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[16px] font-bold text-[#14233c] flex items-center gap-2">
                      <MapPin className="text-[#007bff]" size={16} /> Select District
                    </h2>
                    <button onClick={() => setSelectedDistrictId('all')} className="text-xs font-bold text-[#0076a8] hover:underline uppercase tracking-wider">Select All</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                     <LocationCard title="All Districts" subtitle="ALL" isSelected={selectedDistrictId === 'all' || selectedDistrictId === ''} onClick={() => setSelectedDistrictId('all')} />
                     {districts.map((d) => (
                        <LocationCard key={d._id} title={d.name} subtitle={selectedClusterObj?.name || 'Cluster'} isSelected={selectedDistrictId === d._id} onClick={() => setSelectedDistrictId(d._id)} />
                     ))}
                  </div>
                </div>
             )}
          </div>
        )}

        <div className="flex gap-4 mb-6 mt-4 overflow-x-auto pb-2">
          <button className={`px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'solar' ? 'bg-[#28a745] text-white' : 'bg-[#e5f5ea] text-[#28a745] hover:bg-[#d4eddb]'}`} onClick={() => setActiveTab('solar')}>
             Solar Cashback <span className="bg-white text-[#28a745] px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">Active</span>
          </button>
          <button className={`px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'loyalty' ? 'bg-[#ffc107] text-[#343a40]' : 'bg-[#fff8e5] text-[#d39e00] hover:bg-[#ffefc2]'}`} onClick={() => setActiveTab('loyalty')}>
             Loyalty Program <span className="bg-white text-[#ffc107] px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-sm">New</span>
          </button>
          <button className={`px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'limited' ? 'bg-[#dc3545] text-white' : 'bg-[#fceeed] text-[#dc3545] hover:bg-[#fadbd8]'}`} onClick={() => setActiveTab('limited')}>
             Limited Stock <span className="bg-white text-[#dc3545] px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-sm">Hurry!</span>
          </button>
          <button className={`px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'announcement' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} onClick={() => setActiveTab('announcement')}>
             Announcement <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-sm">Global</span>
          </button>
          <button onClick={() => setShowSelectionModal(true)} className="px-5 py-2.5 rounded font-bold text-sm bg-[#343a40] text-white hover:bg-black transition-colors shadow-sm ml-2 shrink-0 flex items-center gap-2">
             <Plus size={16} /> New Offer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            {activeTab === 'solar' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <h2 className="text-2xl font-bold text-[#28a745]">{pendingOfferName || "Solar Panel Bundle Cashback"}</h2>
                  <div className="flex items-center gap-3">
                    {pendingOfferName && (
                      <button onClick={() => setPendingOfferName('')} className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-200 transition-colors">Discard Custom Session</button>
                    )}
                    <span className="bg-[#28a745] text-white text-xs font-bold px-3 py-1.5 rounded">
                      Active Until: {solarForm.endDate ? new Date(solarForm.endDate).toLocaleDateString() : '31 Dec 2025'}
                    </span>
                  </div>
                </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-[#14233c] mb-2">Partner's type</label>
                    <div className="border border-gray-200 rounded p-2 h-[120px] overflow-y-auto bg-white">
                        {partnerTypesList.map(type => (
                           <div key={type._id} className="flex items-center gap-2 mb-1 px-1">
                              <input type="checkbox" id={`ptype-${type._id}`} checked={solarForm.cpTypes.includes(type.name)} onChange={(e) => {
                                   const newTypes = e.target.checked ? [...solarForm.cpTypes, type.name] : solarForm.cpTypes.filter(t => t !== type.name);
                                   setSolarForm({...solarForm, cpTypes: newTypes});
                                }} />
                              <label htmlFor={`ptype-${type._id}`} className="text-xs text-gray-700 cursor-pointer">{type.name}</label>
                           </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-[#14233c] mb-2">Select Plans</label>
                    <div className="border border-gray-200 rounded p-2 h-[120px] overflow-y-auto bg-white">
                        {plansList.map(plan => (
                           <div key={plan.id} className="flex items-center gap-2 mb-1 px-1">
                              <input type="checkbox" id={`plan-${plan.id}`} checked={solarForm.selectedPlans.includes(plan.name)} onChange={(e) => {
                                   const newPlans = e.target.checked ? [...solarForm.selectedPlans, plan.name] : solarForm.selectedPlans.filter(p => p !== plan.name);
                                   setSolarForm({...solarForm, selectedPlans: newPlans});
                                }} />
                              <label htmlFor={`plan-${plan.id}`} className="text-xs text-gray-700 cursor-pointer">{plan.name}</label>
                           </div>
                        ))}
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-[#14233c] mb-2">Product Selection</label>
                    <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={solarForm.product} onChange={e => setSolarForm({...solarForm, product: e.target.value})}>
                      <option value="">Select Product</option>
                      {productsList.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-[#14233c] mb-2">Brand-wise Selection</label>
                    <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={solarForm.brand} onChange={e => setSolarForm({...solarForm, brand: e.target.value})}>
                      <option value="">Select Brand</option>
                      {brandsList.map(b => {
                        const brandName = b.brand || b.name || b.companyName;
                        return <option key={b._id} value={brandName}>{brandName}</option>;
                      })}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-full">
                       <label className="block text-sm font-bold text-[#14233c] mb-3">Project Type Selection</label>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Category</label>
                            <select className="w-full border border-gray-200 rounded p-2 text-sm bg-white" value={solarForm.category} onChange={e => setSolarForm({...solarForm, category: e.target.value, subCategory: 'All Sub Categories'})}>
                               <option>All Categories</option>
                               {categoriesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Sub Category</label>
                            <select className="w-full border border-gray-200 rounded p-2 text-sm bg-white" value={solarForm.subCategory} onChange={e => setSolarForm({...solarForm, subCategory: e.target.value})} disabled={solarForm.category === 'All Categories'}>
                               <option>All Sub Categories</option>
                               {subCategoriesList.filter(sc => solarForm.category === 'All Categories' || sc.categoryId?.name === solarForm.category).map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-[#14233c] mb-2">kW-wise Selection</label>
                    <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={solarForm.kwSelection} onChange={e => setSolarForm({...solarForm, kwSelection: e.target.value})}>
                      <option>1-3 kW</option><option>3-5 kW</option><option>5-10 kW</option><option>10+ kW</option>
                    </select>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-[#14233c] mb-2">Target Kw</label>
                    <input type="number" className="w-full border border-gray-200 rounded p-2.5 text-sm" value={solarForm.targetKw} onChange={e => setSolarForm({...solarForm, targetKw: e.target.value})} />
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-[#14233c] mb-2">Cashback Details</label>
                    <div className="flex items-center gap-3">
                       <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>
                          <input type="number" className="w-full border border-gray-200 rounded p-2.5 pl-8 text-sm" value={solarForm.cashbackDetails} onChange={e => setSolarForm({...solarForm, cashbackDetails: e.target.value})} />
                       </div>
                       <span className="text-sm text-gray-500 w-16">per kW</span>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-6">
                     <div className="flex flex-col md:flex-row gap-6 md:items-end">
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-2">
                             <label className="text-sm font-bold text-[#14233c]">Offer Duration</label>
                             <p className="text-[10px] text-red-500 font-bold italic">"dates can not be edited during the timeline of selected dates"</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex-1">
                                <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase">Start Date</label>
                                <input type="date" className={`w-full border border-gray-200 rounded p-2.5 text-sm ${editingOfferId && isWithinTimeline(solarForm.startDate, solarForm.endDate) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} value={solarForm.startDate} disabled={editingOfferId && isWithinTimeline(solarForm.startDate, solarForm.endDate)} onChange={e => setSolarForm({...solarForm, startDate: e.target.value})} />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase">End Date</label>
                                <input type="date" className={`w-full border border-gray-200 rounded p-2.5 text-sm ${editingOfferId && isWithinTimeline(solarForm.startDate, solarForm.endDate) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} value={solarForm.endDate} disabled={editingOfferId && isWithinTimeline(solarForm.startDate, solarForm.endDate)} onChange={e => setSolarForm({...solarForm, endDate: e.target.value})} />
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2 cursor-pointer pb-2" onClick={() => setSolarForm({...solarForm, autoRenew: !solarForm.autoRenew})}>
                           <div className={`w-4 h-4 border rounded flex items-center justify-center ${solarForm.autoRenew ? 'bg-[#0076a8] border-[#0076a8]' : 'border-gray-400'}`}>
                              {solarForm.autoRenew && <div className="w-2 h-2 bg-white shrink-0" />}
                           </div>
                           <span className="text-sm text-gray-700 font-bold">Auto-renew Offer</span>
                        </div>
                     </div>
                  </div>

                  {/* New Fields Section */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-bold text-[#14233c]">Offer Description</label>
                    <textarea 
                      className="w-full border border-gray-200 rounded p-3 text-sm h-32 focus:ring-1 focus:ring-[#28a745] outline-none transition-all"
                      placeholder="Enter detailed description of the offer..."
                      value={solarForm.description}
                      onChange={e => setSolarForm({...solarForm, description: e.target.value})}
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-bold text-[#14233c]">Offer Image Upload</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-[#28a745] transition-all relative group h-32">
                       <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                       {!solarForm.offerImage ? (
                         <>
                           <Upload className="text-gray-400 mb-2 group-hover:text-[#28a745]" size={24} />
                           <span className="text-xs text-gray-500 font-medium">Click or drag to upload (JPG/PNG)</span>
                         </>
                       ) : (
                         <div className="flex items-center gap-4 w-full h-full px-4">
                            <div className="w-20 h-20 bg-white border rounded shadow-sm overflow-hidden flex-shrink-0">
                               <img src={solarForm.offerImage} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                               <p className="text-xs font-bold text-gray-700 truncate">Image Selected</p>
                               <button onClick={(e) => { e.stopPropagation(); setSolarForm({...solarForm, offerImage: ''}); }} className="text-[10px] text-red-500 font-bold hover:underline mt-1">Remove Image</button>
                            </div>
                            <ImageIcon className="text-[#28a745]" size={20} />
                         </div>
                       )}
                    </div>
                  </div>

               </div>
               
               <div className="flex justify-end mt-10">
                 <button onClick={handleSolarSubmit} className="bg-[#28a745] text-white px-10 py-3 rounded-lg font-bold shadow-lg hover:bg-green-600 transition-all text-sm uppercase tracking-wider">
                   {editingOfferId ? 'Update Solar Offer' : 'Save Solar Offer'}
                 </button>
               </div>
             </div>
           )}

           {activeTab === 'loyalty' && (
             <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-bold text-[#ffc107]">Loyalty Cashback</h2>
                 <span className="bg-[#ffc107] text-[#343a40] text-xs font-bold px-3 py-1.5 rounded">Ongoing</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Partner Type</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={loyaltyForm.partnerType} onChange={e => setLoyaltyForm({...loyaltyForm, partnerType: e.target.value})}>
                        <option value="">Select Partner Type</option>
                        {partnerTypesList.map(type => (
                          <option key={type._id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Project Type (Category)</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={loyaltyForm.projectType} onChange={e => setLoyaltyForm({...loyaltyForm, projectType: e.target.value})}>
                        <option>All</option>
                        {categoriesList.map(c => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Cluster</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={loyaltyForm.cluster} onChange={e => setLoyaltyForm({...loyaltyForm, cluster: e.target.value})}>
                         <option>All</option>
                         {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Brand Selection</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={loyaltyForm.brand} onChange={e => setLoyaltyForm({...loyaltyForm, brand: e.target.value})}>
                        <option>All</option>
                        {brandsList.map(b => {
                          const name = b.brand || b.name || b.companyName;
                          return <option key={b._id} value={name}>{name}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">kW Selection</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={loyaltyForm.kwSelection} onChange={e => setLoyaltyForm({...loyaltyForm, kwSelection: e.target.value})}>
                        <option>1-3 kW</option>
                        <option>3-5 kW</option>
                        <option>5-10 kW</option>
                        <option>10+ kW</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="bg-[#f0f9ff] rounded-lg p-5 border border-blue-50 h-full">
                       <h3 className="font-bold text-[#14233c] mb-6 flex items-center gap-2 text-base"><span className="text-[#007bff]">📅</span> Year-wise Cashback</h3>
                       <div className="grid grid-cols-2 gap-4 mb-3"><span className="text-xs font-bold text-gray-400">Years</span><span className="text-xs font-bold text-gray-400">Cashback (₹)</span></div>
                       {loyaltyForm.yearCashbacks.map((yc, idx) => (
                          <div key={idx} className="grid grid-cols-2 gap-4 mb-4">
                            <input type="number" className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={yc.years} onChange={e => { const newArr = [...loyaltyForm.yearCashbacks]; newArr[idx].years = Number(e.target.value); setLoyaltyForm({...loyaltyForm, yearCashbacks: newArr}); }} />
                            <input type="number" className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={yc.cashback} onChange={e => { const newArr = [...loyaltyForm.yearCashbacks]; newArr[idx].cashback = Number(e.target.value); setLoyaltyForm({...loyaltyForm, yearCashbacks: newArr}); }} />
                          </div>
                       ))}
                       <button className="text-xs font-bold text-[#007bff] hover:underline" onClick={() => setLoyaltyForm({...loyaltyForm, yearCashbacks: [...loyaltyForm.yearCashbacks, {years: 0, cashback: 0}]})}>+ Add Year</button>
                    </div>
                  </div>
               </div>

                {/* New Fields for Loyalty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-100">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#14233c]">Program Description</label>
                        <textarea 
                          className="w-full border border-gray-200 rounded p-3 text-sm h-32 focus:ring-1 focus:ring-[#ffc107] outline-none transition-all"
                          placeholder="Enter detailed description of the loyalty program..."
                          value={loyaltyForm.description}
                          onChange={e => setLoyaltyForm({...loyaltyForm, description: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#14233c]">Program Image Upload</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-[#ffc107] transition-all relative group h-32">
                           <input type="file" accept="image/png, image/jpeg" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (!['image/jpeg', 'image/png'].includes(file.type)) { alert("Please upload only JPG or PNG images."); return; }
                                  const reader = new FileReader();
                                  reader.onloadend = () => { setLoyaltyForm(prev => ({ ...prev, offerImage: reader.result })); };
                                  reader.readAsDataURL(file);
                                }
                           }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                           {!loyaltyForm.offerImage ? (
                             <>
                               <Upload className="text-gray-400 mb-2 group-hover:text-[#ffc107]" size={24} />
                               <span className="text-xs text-gray-500 font-medium">Upload Banner (JPG/PNG)</span>
                             </>
                           ) : (
                             <div className="flex items-center gap-4 w-full h-full px-4">
                                <div className="w-20 h-20 bg-white border rounded shadow-sm overflow-hidden flex-shrink-0">
                                   <img src={loyaltyForm.offerImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                   <p className="text-xs font-bold text-gray-700 truncate">Image Selected</p>
                                   <button onClick={(e) => { e.stopPropagation(); setLoyaltyForm({...loyaltyForm, offerImage: ''}); }} className="text-[10px] text-red-500 font-bold hover:underline mt-1">Remove Image</button>
                                </div>
                             </div>
                           )}
                        </div>
                    </div>
                </div>

               <div className="flex justify-center mt-8">
                 <button onClick={handleLoyaltySubmit} className="bg-[#ffc107] text-[#343a40] px-8 py-2.5 rounded font-bold shadow hover:bg-yellow-500 transition-colors text-sm">{editingOfferId ? 'Update Loyalty Program' : 'Save Program'}</button>
               </div>
             </div>
           )}

           {activeTab === 'limited' && (
             <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-bold text-[#dc3545]">Limited Stock Offer</h2>
                 <span className="bg-[#dc3545] text-white text-xs font-bold px-3 py-1.5 rounded">Limited Time</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Cluster</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={stockForm.cluster} onChange={e => setStockForm({...stockForm, cluster: e.target.value})}>
                         <option>All</option>
                         {clusters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Bundle Plan</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={stockForm.bundlePlan} onChange={e => setStockForm({...stockForm, bundlePlan: e.target.value})}>
                        <option value="">Select Bundle Plan</option>
                        {bundlePlansList.map(plan => (
                          <option key={plan._id} value={plan.bundleName}>{plan.bundleName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Current Stock</label>
                      <input type="number" className="w-full border border-gray-200 rounded p-2.5 text-sm" value={stockForm.currentStock} onChange={e => setStockForm({...stockForm, currentStock: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Product</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={stockForm.product} onChange={e => setStockForm({...stockForm, product: e.target.value})}>
                        <option value="">Select Product</option>
                        {productsList.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Deadline</label>
                      <input type="date" className="w-full border border-gray-200 rounded p-2.5 text-sm" value={stockForm.deadline} onChange={e => setStockForm({...stockForm, deadline: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#14233c] mb-2">Brand</label>
                      <select className="w-full border border-gray-200 rounded p-2.5 text-sm bg-white" value={stockForm.brand} onChange={e => setStockForm({...stockForm, brand: e.target.value})}>
                        <option>All</option>
                        {brandsList.map(b => {
                          const name = b.brand || b.name || b.companyName;
                          return <option key={b._id} value={name}>{name}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-[#14233c] mb-2">Cashback Value</label>
                       <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                             <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>
                             <input type="number" className="w-full border border-gray-200 rounded p-2.5 pl-8 text-sm" value={stockForm.cashbackValue} onChange={e => setStockForm({...stockForm, cashbackValue: e.target.value})} />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               {/* New Fields for Limited Stock */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-100">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#14233c]">Offer Description</label>
                        <textarea 
                          className="w-full border border-gray-200 rounded p-3 text-sm h-32 focus:ring-1 focus:ring-[#dc3545] outline-none transition-all"
                          placeholder="Describe the limited stock offer details..."
                          value={stockForm.description}
                          onChange={e => setStockForm({...stockForm, description: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#14233c]">Offer Image Upload</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-[#dc3545] transition-all relative group h-32">
                           <input type="file" accept="image/png, image/jpeg" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (!['image/jpeg', 'image/png'].includes(file.type)) { alert("Please upload only JPG or PNG images."); return; }
                                  const reader = new FileReader();
                                  reader.onloadend = () => { setStockForm(prev => ({ ...prev, offerImage: reader.result })); };
                                  reader.readAsDataURL(file);
                                }
                           }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                           {!stockForm.offerImage ? (
                             <>
                               <Upload className="text-gray-400 mb-2 group-hover:text-[#dc3545]" size={24} />
                               <span className="text-xs text-gray-500 font-medium">Upload Offer Image (JPG/PNG)</span>
                             </>
                           ) : (
                             <div className="flex items-center gap-4 w-full h-full px-4">
                                <div className="w-20 h-20 bg-white border rounded shadow-sm overflow-hidden flex-shrink-0">
                                   <img src={stockForm.offerImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                   <p className="text-xs font-bold text-gray-700 truncate">Image Selected</p>
                                   <button onClick={(e) => { e.stopPropagation(); setStockForm({...stockForm, offerImage: ''}); }} className="text-[10px] text-red-500 font-bold hover:underline mt-1">Remove Image</button>
                                </div>
                             </div>
                           )}
                        </div>
                    </div>
                </div>
               <div className="flex justify-center mt-8">
                 <button onClick={handleStockSubmit} className="bg-[#dc3545] text-white px-8 py-2.5 rounded font-bold shadow hover:bg-red-700 transition-colors text-sm">{editingOfferId ? 'Update Limited Stock Offer' : 'Save Offer'}</button>
               </div>
             </div>
           )}

           {activeTab === 'announcement' && (
             <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-8 border-b pb-4">
                 <h2 className="text-2xl font-bold text-blue-600">Post Global Announcement</h2>
                 <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2">
                   <Upload size={14} /> Global Broadcast
                 </span>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {/* Left Side: Details */}
                 <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-bold text-[#14233c] mb-2 flex items-center justify-between">
                       Announcement Title <span className="text-red-500">*</span>
                     </label>
                     <input 
                       type="text" 
                       className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                       placeholder="Enter announcement title"
                       value={announcementForm.title}
                       onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-[#14233c] mb-2 flex items-center justify-between">
                       Description <span className="text-red-500">*</span>
                       <span className={`text-[10px] font-bold ${announcementForm.description.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                         {announcementForm.description.length} / 500
                       </span>
                     </label>
                     <textarea 
                       className="w-full border border-gray-200 rounded-xl p-4 text-sm h-48 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm resize-none"
                       placeholder="Enter detailed announcement description..."
                       maxLength={500}
                       value={announcementForm.description}
                       onChange={e => setAnnouncementForm({...announcementForm, description: e.target.value})}
                     />
                   </div>
                 </div>

                 {/* Right Side: Images */}
                 <div>
                   <label className="block text-sm font-bold text-[#14233c] mb-2">
                     Announcement Images <span className="text-gray-400 font-normal">(Max 5 images)</span>
                   </label>
                   
                   <div className="grid grid-cols-3 gap-3 mb-4">
                      {announcementForm.images.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-xl border border-gray-200 bg-gray-50 relative overflow-hidden group shadow-sm">
                           <img src={img} className="w-full h-full object-cover" />
                           <button 
                             onClick={() => {
                               const newImgs = [...announcementForm.images];
                               newImgs.splice(idx, 1);
                               setAnnouncementForm({...announcementForm, images: newImgs});
                             }}
                             className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <X size={12} />
                           </button>
                        </div>
                      ))}
                      
                      {announcementForm.images.length < 5 && (
                        <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center relative hover:bg-white hover:border-blue-400 transition-all group cursor-pointer">
                           <input 
                             type="file" 
                             accept="image/png, image/jpeg" 
                             multiple 
                             className="absolute inset-0 opacity-0 cursor-pointer" 
                             onChange={(e) => {
                               const files = Array.from(e.target.files);
                               const remaining = 5 - announcementForm.images.length;
                               const toProcess = files.slice(0, remaining);
                               
                               toProcess.forEach(file => {
                                  if (!['image/jpeg', 'image/png'].includes(file.type)) {
                                    alert(`File ${file.name} is not a valid JPG/PNG`);
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setAnnouncementForm(prev => ({
                                      ...prev,
                                      images: [...prev.images, reader.result]
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                               });
                             }}
                           />
                           <Plus className="text-gray-400 group-hover:text-blue-500 mb-1" size={24} />
                           <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 uppercase">Upload</span>
                        </div>
                      )}
                   </div>
                   
                   <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                      <h4 className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Guidelines</h4>
                      <ul className="text-[11px] text-blue-600/80 space-y-1">
                        <li>• JPG or PNG formats only</li>
                        <li>• Recommended aspect ratio: 16:9 or 1:1</li>
                        <li>• Max 5 images per announcement</li>
                      </ul>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end mt-12 gap-4">
                  <button 
                    onClick={() => {
                      setAnnouncementForm({title: '', description: '', images: []});
                      setActiveTab('solar');
                    }}
                    className="px-8 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleAnnouncementSubmit}
                    className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-sm uppercase tracking-wider translate-y-0 active:scale-95 flex items-center gap-2"
                  >
                    <Upload size={18} />
                    {editingOfferId ? 'Update Announcement' : 'Post Announcement'}
                  </button>
               </div>
             </div>
           )}
         </div>

        {/* Marketing Offers Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
             <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                   <h3 className="text-lg font-bold text-[#14233c] mb-1">Marketing Campaign Board</h3>
                   <p className="text-xs text-gray-500">Manage and view all targeted promotional offers.</p>
                </div>
                <div className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest leading-none">
                  {offers.filter(o => o.offerType !== 'Global Announcement').length} Active Campaigns
                </div>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[1200px]">
                      <thead><tr className="bg-[#14233c] text-white text-[11px] uppercase tracking-wider"><th className="p-3 border-r border-white/20">Offer Name</th><th className="p-3 border-r border-white/20">Category/Sub</th><th className="p-3 border-r border-white/20">Product/Brand</th><th className="p-3 border-r border-white/20">Plans</th><th className="p-3 border-r border-white/20">kW Info</th><th className="p-3 border-r border-white/20">Cashback</th><th className="p-3 border-r border-white/20">Location (S/C/D)</th><th className="p-3 border-r border-white/20">Duration</th><th className="p-3 text-center">Actions</th></tr></thead>
                      <tbody>
                          {loading ? (<tr><td colSpan="9" className="text-center p-6 text-gray-500">Loading offers...</td></tr>) : offers.filter(o => o.offerType !== 'Global Announcement').length === 0 ? (<tr><td colSpan="9" className="text-center p-6 text-gray-500 italic">No marketing offers found. Click "New Offer" to start.</td></tr>) : (
                               offers.filter(o => o.offerType !== 'Global Announcement').map(offer => (
                                   <tr key={offer._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-[13px]">
                                       <td className="p-3 border-r border-gray-100 font-bold text-[#0076a8]">
                                          <div className="flex items-center gap-2">
                                            {offer.offerImage && <div className="w-8 h-8 rounded border overflow-hidden shrink-0 shadow-sm"><img src={offer.offerImage} className="w-full h-full object-cover" /></div>}
                                            <div>
                                              <div>{offer.offerName}</div>
                                              <div className="text-[10px] text-gray-400 font-normal">{offer.offerType}</div>
                                            </div>
                                          </div>
                                       </td>
                                       <td className="p-3 border-r border-gray-100"><div>{offer.category || 'All'}</div><div className="text-[11px] text-gray-500">{offer.subCategory || 'All'}</div></td>
                                       <td className="p-3 border-r border-gray-100"><div>{offer.product || offer.bundlePlan || 'N/A'}</div><div className="text-[11px] text-gray-500 italic">{offer.brand || 'No Brand'}</div></td>
                                       <td className="p-3 border-r border-gray-100 max-w-[150px]"><div className="flex flex-wrap gap-1">{offer.plans?.length > 0 ? offer.plans.map((p, i) => (<span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{p}</span>)) : <span className="text-gray-400 italic">None</span>}</div></td>
                                       <td className="p-3 border-r border-gray-100"><div>{offer.kwSelection || 'N/A'}</div><div className="text-[10px] text-gray-500">Target: {offer.targetKw || '0'} kW</div></td>
                                       <td className="p-3 border-r border-gray-100 text-center font-bold text-green-600">
                                          {offer.cashbackAmount ? `₹${offer.cashbackAmount}` : 
                                           offer.cashbackValue ? `₹${offer.cashbackValue}` :
                                           offer.yearCashbacks?.length ? `${offer.yearCashbacks.length} Tiers` : '-'}
                                       </td>
                                       <td className="p-3 border-r border-gray-100">
                                          <div className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Coverage</div>
                                          <div className="flex flex-wrap gap-1">
                                             <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{states.find(s => s._id === offer.location?.state)?.name || 'All States'}</span>
                                             <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{clusters.find(cl => cl._id === offer.location?.cluster)?.name || 'All Clusters'}</span>
                                          </div>
                                       </td>
                                       <td className="p-3 border-r border-gray-100 text-center text-[11px]">
                                          {offer.deadline ? (
                                            <div className="text-red-500 font-bold uppercase tracking-tighter">Deadline: {new Date(offer.deadline).toLocaleDateString()}</div>
                                          ) : (
                                            <>
                                              <div className="font-bold">{offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'N/A'}</div>
                                              <div className="text-gray-400">to</div>
                                              <div className="text-red-500 font-bold">{offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'N/A'}</div>
                                            </>
                                          )}
                                       </td>
                                       <td className="p-3 text-center"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(offer)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-colors"><Edit size={16} /></button><button onClick={() => handleDelete(offer._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full transition-colors"><Trash2 size={16} /></button></div></td>
                                   </tr>
                               ))
                          )}
                      </tbody>
                 </table>
             </div>
        </div>

        {/* Global Announcements Board */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
             <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                   <h3 className="text-lg font-bold text-[#14233c] mb-1">Global Announcements Board</h3>
                   <p className="text-xs text-gray-500">Public updates and broadcast messages across the platform.</p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest leading-none">
                  {offers.filter(o => o.offerType === 'Global Announcement').length} Active Posts
                </div>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-[#14233c] text-white text-[11px] uppercase tracking-wider">
                          <th className="p-3 border-r border-white/20">Announcement Title</th>
                          <th className="p-3 border-r border-white/20">Description</th>
                          <th className="p-3 border-r border-white/20">Gallery</th>
                          <th className="p-3 border-r border-white/20">Coverage</th>
                          <th className="p-3 border-r border-white/20">Published Date</th>
                          <th className="p-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                          {loading ? (
                            <tr><td colSpan="6" className="text-center p-6 text-gray-500">Loading announcements...</td></tr>
                          ) : offers.filter(o => o.offerType === 'Global Announcement').length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-6 text-gray-500 italic">No announcements found.</td></tr>
                          ) : (
                               offers.filter(o => o.offerType === 'Global Announcement').map(ann => (
                                  <tr key={ann._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-[13px]">
                                      <td className="p-3 border-r border-gray-100 font-bold text-blue-600">
                                         <div className="flex items-center gap-2">
                                           {ann.offerImage && <div className="w-10 h-10 rounded border overflow-hidden shrink-0 shadow-sm"><img src={ann.offerImage} className="w-full h-full object-cover" /></div>}
                                           {ann.offerName}
                                         </div>
                                      </td>
                                      <td className="p-3 border-r border-gray-100 max-w-[300px]">
                                         <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{ann.description || "No description provided."}</div>
                                      </td>
                                      <td className="p-3 border-r border-gray-100">
                                         <div className="flex gap-1.5 flex-wrap">
                                           {ann.images?.slice(0, 4).map((img, i) => (
                                             <div key={i} className="w-7 h-7 rounded border border-gray-200 overflow-hidden shadow-sm"><img src={img} className="w-full h-full object-cover" /></div>
                                           ))}
                                           {ann.images?.length > 4 && (
                                             <div className="w-7 h-7 rounded border border-gray-100 bg-gray-50 flex items-center justify-center text-[9px] font-bold text-gray-400">+{ann.images.length - 4}</div>
                                           )}
                                         </div>
                                      </td>
                                      <td className="p-3 border-r border-gray-100">
                                         <div className="flex flex-wrap gap-1">
                                            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-medium">{states.find(s => s._id === ann.location?.state)?.name || 'Global'}</span>
                                            {ann.location?.cluster && ann.location.cluster !== 'All' && <span className="bg-gray-50 text-gray-500 border border-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">{clusters.find(cl => cl._id === ann.location?.cluster)?.name || 'Cluster'}</span>}
                                         </div>
                                      </td>
                                      <td className="p-3 border-r border-gray-100 text-[11px] font-medium text-gray-400">
                                         {new Date(ann.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="p-3 text-center">
                                         <div className="flex justify-center gap-2">
                                           <button onClick={() => handleEdit(ann)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-colors"><Edit size={16} /></button>
                                           <button onClick={() => handleDelete(ann._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full transition-colors"><Trash2 size={16} /></button>
                                         </div>
                                      </td>
                                  </tr>
                               ))
                          )}
                      </tbody>
                 </table>
             </div>
        </div>
      </div>

      {/* Selection Modal: Offer vs Announcement */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                     <h2 className="text-2xl font-black text-[#14233c]">Create New</h2>
                     <p className="text-gray-500 text-sm mt-1">What would you like to set up today?</p>
                  </div>
                  <button onClick={() => setShowSelectionModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"><X size={24} /></button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1: Special Offer */}
                  <div 
                    onClick={() => { setShowSelectionModal(false); setShowNewOfferModal(true); }}
                    className="group cursor-pointer border-2 border-gray-100 rounded-2xl p-6 hover:border-[#ffc107] hover:bg-yellow-50/30 transition-all text-center relative overflow-hidden"
                  >
                     <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="text-[#ffc107]" size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-[#14233c] mb-2">Special Offer</h3>
                     <p className="text-sm text-gray-500 leading-relaxed">Create targeted cashback, referral bonus or limited stock deals with specific plans.</p>
                     <div className="mt-4 text-xs font-bold text-[#ffc107] opacity-0 group-hover:opacity-100 transition-opacity">Launch Offer →</div>
                  </div>

                  {/* Option 2: Announcement */}
                  <div 
                    onClick={() => { 
                       setShowSelectionModal(false); 
                       setPendingOfferName('New Announcement');
                       setActiveTab('announcement');
                       setAnnouncementForm({ title: '', description: '', images: [] });
                       setEditingOfferId(null);
                    }}
                    className="group cursor-pointer border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-center relative overflow-hidden"
                  >
                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-blue-500" size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-[#14233c] mb-2">Announcement</h3>
                     <p className="text-sm text-gray-500 leading-relaxed">Broadcast a general message, big update or festival wish to all users globally.</p>
                     <div className="mt-4 text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Post Update →</div>
                  </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button onClick={() => setShowSelectionModal(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {showNewOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-xl font-black text-[#14233c]">Configure Offer</h2>
                  <button onClick={() => setShowNewOfferModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="mb-4">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Offer Identity</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Diwali Mega Sale" 
                          className="w-full border-2 border-white rounded-xl p-3.5 text-sm shadow-sm focus:border-blue-500 focus:ring-0 transition-all bg-white" 
                          value={newOfferForm.offerName} 
                          onChange={(e) => setNewOfferForm({...newOfferForm, offerName: e.target.value})} 
                        />
                    </div>
                    <div className="">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Campaign Type</label>
                        <select 
                          className="w-full border-2 border-white rounded-xl p-3.5 text-sm shadow-sm focus:border-blue-500 bg-white" 
                          value={newOfferForm.offerType} 
                          onChange={(e) => setNewOfferForm({...newOfferForm, offerType: e.target.value, details: {}})}
                        >
                           <option>Cashback Offer</option>
                           <option>Loyalty Program</option>
                           <option>Limited Stock</option>
                           <option>Referral Bonus</option>
                           <option>Seasonal Discount</option>
                        </select>
                    </div>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="text-sm font-black text-[#14233c] mb-6 flex items-center gap-2">
                         <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Layers size={16} /></span>
                         {newOfferForm.offerType} Parameters
                      </h3>

                      {newOfferForm.offerType === 'Cashback Offer' && (
                         <div className="space-y-4">
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-1.5">Cashback Percentage (%)</label>
                               <input type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm" placeholder="e.g., 10" onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, percentage: e.target.value}})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Min Purchase (₹)</label>
                                  <input type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm" placeholder="1000" onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, minAmount: e.target.value}})} />
                               </div>
                               <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Max Cashback (₹)</label>
                                  <input type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm" placeholder="5000" onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, maxCashback: e.target.value}})} />
                               </div>
                            </div>
                         </div>
                      )}

                      {newOfferForm.offerType === 'Loyalty Program' && (
                         <div className="space-y-4">
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-1.5">Reward Points per ₹100</label>
                               <input type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm" placeholder="5" onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, rewardPoints: e.target.value}})} />
                            </div>
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-1.5">Redemption Rules</label>
                               <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm h-24" placeholder="Points can be redeemed after 1000 balance..." onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, rules: e.target.value}})} />
                            </div>
                         </div>
                      )}

                      {newOfferForm.offerType === 'Limited Stock' && (
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Quantity</label>
                                  <input type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm" placeholder="50" onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, quantity: e.target.value}})} />
                               </div>
                               <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry Date</label>
                                  <input type="date" className="w-full border border-gray-200 rounded-lg p-3 text-sm" onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, expiry: e.target.value}})} />
                               </div>
                            </div>
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-1.5">Urgency Tag</label>
                               <select className="w-full border border-gray-200 rounded-lg p-3 text-sm" onChange={e => setNewOfferForm({...newOfferForm, details: {...newOfferForm.details, tag: e.target.value}})}>
                                  <option>Selling Fast!</option>
                                  <option>Last Few Left!</option>
                                  <option>Limited Edition</option>
                               </select>
                            </div>
                         </div>
                      )}

                      {/* Fallback for other types */}
                      {!['Cashback Offer', 'Loyalty Program', 'Limited Stock'].includes(newOfferForm.offerType) && (
                         <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                            <Layers className="mx-auto text-gray-300 mb-3" size={40} />
                            <p className="text-gray-400 text-sm italic font-medium">Extra parameters not required for this type.</p>
                         </div>
                      )}
                  </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                  <button onClick={() => setShowNewOfferModal(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Close</button>
                  <button onClick={handleOfferContinue} className="px-8 py-2.5 bg-[#007bff] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all translate-y-0 active:scale-95">Continue to Form</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}