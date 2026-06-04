import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2, Edit, Download, Printer,
  Save, Calculator, Eye, Upload, X,
  BarChart3, LineChart, Settings, CheckCircle,
  MapPin, GripVertical, FileText, Image, Zap, Shield,
  ChevronDown, ChevronUp, ChevronRight, Square, CheckSquare, Maximize2
} from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Chart from 'chart.js/auto';
import {
  getQuoteSettings,
  createQuoteSetting,
  updateQuoteSetting,
  deleteQuoteSetting
} from '../../../../services/quote/quoteApi';
import toast from 'react-hot-toast';
import { productApi } from '../../../../api/productApi';
import { getAMCServices, getSolarKits, getAssignments } from '../../../../services/combokit/combokitApi';
import salesSettingsService from '../../../../services/settings/salesSettingsApi';
import { useLocations } from '../../../../hooks/useLocations';

/**
 * AccordionSection Component
 * A reusable collapsible container for settings modules
 */
const AccordionSection = ({ title, section, isOpen, onToggle, children, icon: Icon, badge }) => (
  <div className={`bg-white border-2 rounded-3xl overflow-hidden transition-all duration-300 mb-4 ${isOpen ? 'border-blue-200 shadow-md' : 'border-gray-100 hover:border-blue-100'}`}>
    <button 
      onClick={() => onToggle(section)}
      className={`w-full flex items-center justify-between px-8 py-5 transition-all ${isOpen ? 'bg-blue-100/10' : 'bg-white'}`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-400'}`}>
            <Icon size={18} />
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${isOpen ? 'text-blue-700' : 'text-gray-500'}`}>{title}</span>
          {badge && <span className="text-[9px] font-bold text-gray-400 mt-0.5">{badge}</span>}
        </div>
      </div>
      <div className={`transition-all duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-300'}`}>
        <ChevronDown size={20} />
      </div>
    </button>
    <div 
      className={`transition-all duration-500 ease-in-out overflow-hidden`}
      style={{ maxHeight: isOpen ? '5000px' : '0', opacity: isOpen ? 1 : 0 }}
    >
      <div className="p-8 border-t border-gray-50 bg-white">
        {children}
      </div>
    </div>
  </div>
);

export default function QuoteSetting() {
  const PROTECTED_IDS = ['f1', 'f2', 'f3', 'f4', 'f5', 'p_terms'];
  const [dbAmcServices, setDbAmcServices] = useState([]);
  useEffect(() => {
    const fetchAmcServices = async () => {
      try {
        const res = await getAMCServices();
        // Handle both direct array response and { data: [...] } format
        const services = Array.isArray(res) ? res : (res?.data || []);
        setDbAmcServices(services);
        console.log('Fetched AMC Services:', services);
      } catch (e) { 
        console.error('Failed to fetch AMC services', e); 
        setDbAmcServices([]);
      }
    };
    fetchAmcServices();
  }, [getAMCServices]);


  const [filters, setFilters] = useState({
    categories: [],
    subCategories: [],
    projectTypes: [],
    subProjectTypes: []
  });

  const [quoteTypesSelected, setQuoteTypesSelected] = useState(['Survey Quote']);
  const [partnerTypesSelected, setPartnerTypesSelected] = useState([]);
  const [planTypesSelected, setPlanTypesSelected] = useState([]);
  const [kitTypesSelected, setKitTypesSelected] = useState(['Combo Kit']);
  const [paymentModesSelected, setPaymentModesSelected] = useState(['Cash']);
  const [selectedPages, setSelectedPages] = useState(['Front Page']);
  const [colorSettings, setColorSettings] = useState({
    brandColor: false,
    backgroundColor: false,
    fontSize: false,
    pageSequence: false
  });

  const [advancedOptions, setAdvancedOptions] = useState([
    { key: 'amc', enabled: false, type: 'Basic AMC Plan', price: 0, description: 'Bi-annual system inspection, Basic cleaning (twice a year), Performance report, Remote monitoring setup' },
    { key: 'insurance', enabled: false, type: 'Basic Panel Protection', price: 0, description: 'Covers damage from natural disasters, Theft protection, 10-year coverage option' },
    { key: 'cleaningKit', enabled: false, type: 'Basic Cleaning Kit', price: 0, description: 'Includes telescopic pole, brush and biodegradable cleaner' }
  ]);

  const [unitPrice, setUnitPrice] = useState(0);

  const [packageImage, setPackageImage] = useState(null);
  const [bomData, setBomData] = useState({
    items: [
      { label: 'Solar Structure', value: 'HOT DIP GALVANIZE' },
      { label: 'Solar DC Cable', value: 'Polycab 4 Sq mm' },
      { label: 'Solar AC Cable', value: 'Polycab 4 Sq mm' },
      { label: 'Earthing Kit + LA', value: 'Standard' },
      { label: 'Electrical Components', value: 'L & T / Similar' }
    ],
    pipes: [
      { panels: '4', kw: '2.16', size1: '3', size2: '2' },
      { panels: '6', kw: '3.24', size1: '3', size2: '3' },
      { panels: '10', kw: '5.4', size1: '5', size2: '4' },
      { panels: '12', kw: '6.48', size1: '5', size2: '5' }
    ],
    heightNote: 'Structure Height 6 x 8 Feet is included. Extra pipes beyond this will be paid by the customer.'
  });
  const [availableKits, setAvailableKits] = useState([]);
  const [selectedKitIds, setSelectedKitIds] = useState([]); // Multiple selection support
  const [kitLoading, setKitLoading] = useState(false);
  const [currentProposalNo, setCurrentProposalNo] = useState('');
  const [summarySearch, setSummarySearch] = useState('');

  useEffect(() => {
    const fetchAvailableKits = async () => {
      if (kitTypesSelected.length === 0) {
        setAvailableKits([]);
        setSelectedKitId(null);
        return;
      }

      setKitLoading(true);
      try {
        let allKits = [];
        if (kitTypesSelected.includes('Combo Kit')) {
           const kits = await getSolarKits();
           allKits = [...allKits, ...(kits || []).map(k => ({ 
             ...k, 
             name: k.name || 'Untitled Combo Kit',
             type: 'Combo Kit' 
           }))];
        }
        if (kitTypesSelected.includes('Customised Kit')) {
           const res = await getAssignments();
           const assignments = res?.data || (Array.isArray(res) ? res : []);
           allKits = [...allKits, ...assignments.map(a => ({ 
             ...a, 
             name: a.solarkitName || `Custom Kit - ${getCleanId(a.cluster) || 'Universal'}`,
             type: 'Customised Kit' 
           }))];
        }
        setAvailableKits(allKits);
      } catch (err) {
        console.error("Failed to fetch available kits", err);
      } finally {
        setKitLoading(false);
      }
    };

    fetchAvailableKits();
  }, [kitTypesSelected]);

  const handleKitSelect = (kit) => {
    setSelectedKitIds(prev => {
      const isSelected = prev.includes(kit._id);
      if (isSelected) {
        return prev.filter(id => id !== kit._id);
      } else {
        return [...prev, kit._id];
      }
    });
    
    // Load BOM from kit if available
    if (kit.type === 'Combo Kit' && kit.bom && kit.bom.length > 0) {
      const firstBom = kit.bom[0];
      const newItems = (firstBom.items || []).map(item => ({
        label: item.name || 'Component',
        value: `${item.qty || 'N/A'} ${item.unit || ''}`.trim()
      }));
      if (newItems.length > 0) {
        setBomData(prev => ({ ...prev, items: newItems }));
      }
    } else if (kit.type === 'Customised Kit') {
      // For customized kits, we might have panels/inverters/boskits arrays
      const items = [];
      if (kit.panels?.length) items.push({ label: 'Solar Panels', value: kit.panels.join(', ') });
      if (kit.inverters?.length) items.push({ label: 'Inverters', value: kit.inverters.join(', ') });
      if (kit.boskits?.length) items.push({ label: 'BOS Kits', value: kit.boskits.join(', ') });
      
      if (items.length > 0) {
        setBomData(prev => ({ ...prev, items }));
      }
    }
    toast.success(`Loaded configuration from ${kit.name}`);
  };

  const getCleanId = (v) => {
    if (!v) return "";
    if (typeof v === 'string') return v;
    return v._id || v.id || String(v);
  };

  const [fieldSettings, setFieldSettings] = useState({
    proposalNo: true,
    customerName: true,
    kwRequired: true,
    residentialCommercial: true,
    city: true,
    preparedBy: true,
    date: true,
    validUpto: true,
    quoteType: true,
    productImage: true,
    totalCost: true,
    govtMnreSubsidy: true,
    govtStateSubsidy: true,
    additionalCharges: true,
    finalTotal: true,
    kitType: true,
    paymentMode: true,
    generationSummary: true
  });
  const [pageConfigs, setPageConfigs] = useState({});
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [activeEditingPage, setActiveEditingPage] = useState(null);
  const [tempPageConfig, setTempPageConfig] = useState({
    header: '',
    footer: '',
    media: '',
    content: ''
  });

  const defaultFrontPageSettings = {
    header: {
      showLogo: true, showName: true, showTagline: true,
      showContact: true, showEmail: true, showWebsite: true,
      showAddress: true, logoUrl: '', alignment: 'Left',
      bgColor: '#ffffff', textColor: '#000000'
    },
    banner: {
      imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      overlayOpacity: 0.4, textColor: '#ffffff'
    },
    contentVisibility: {
      proposalTitle: true, customTitle: '', customerName: true,
      proposalNo: true, quoteDate: true, validUpto: true,
      city: true, systemSize: true, categoryType: true, partnerName: true
    },
    customText: {
      welcomeMsg: '', introDesc: '', promoText: '', notes: ''
    },
    footer: {
      showFooterLogo: true, showName: true, showAddress: true,
      showMobile: true, showEmail: true, showWebsite: true,
      showGst: true, showSocials: true, showCopyright: true,
      showPageNo: true, noteText: '', copyrightText: '© 2025 SolarKits ERP. All rights reserved.',
      bgColor: '#f8f9fa', textColor: '#6c757d', alignment: 'Center',
      layout: 'Center Align'
    },
    styling: {
      themeColor: '#2563eb', fontFamily: 'Inter', fontSize: '14px',
      bgColor: '#ffffff', spacing: '20px', alignment: 'Center',
      headerFontSize: 24, footerFontSize: 10, sectionTitleFontSize: 18, contentFontSize: 12
    }
  };

  const [pricingData, setPricingData] = useState({
    totalCost: 0,
    mnreSubsidy: 0,
    stateSubsidy: 0,
    additionalCharges: 0,
    netCost: 0
  });

  // Sync netCost dynamically whenever constituent parts change
  useEffect(() => {
    setPricingData(prev => ({
      ...prev,
      netCost: prev.totalCost - prev.mnreSubsidy - prev.stateSubsidy + prev.additionalCharges
    }));
  }, [pricingData.totalCost, pricingData.mnreSubsidy, pricingData.stateSubsidy, pricingData.additionalCharges]);

  const [frontPageSettings, setFrontPageSettings] = useState(defaultFrontPageSettings);
  
  // Dynamic Theme Color based on Brand Color selection
  const themeAccent = colorSettings.brandColor ? (frontPageSettings?.styling?.themeColor || '#2563eb') : '#2563eb';
  const themeBgColor = colorSettings.backgroundColor ? (frontPageSettings?.styling?.bgColor || '#ffffff') : '#ffffff';
  
  // Dynamic Font Sizes
  const headerFontSize = colorSettings.fontSize ? `${frontPageSettings?.styling?.headerFontSize || 24}px` : '24px';
  const footerFontSize = colorSettings.fontSize ? `${frontPageSettings?.styling?.footerFontSize || 10}px` : '10px';
  const sectionTitleFontSize = colorSettings.fontSize ? `${frontPageSettings?.styling?.sectionTitleFontSize || 18}px` : '18px';
  const contentFontSize = colorSettings.fontSize ? `${frontPageSettings?.styling?.contentFontSize || 12}px` : '12px';

  const themeBgLight = `${themeAccent}15`; // 8% opacity version
  const themeBgSemi = `${themeAccent}33`; // 20% opacity version
  const themeBgFaint = `${themeAccent}08`; // 5% opacity version
  const themeBgStrong = `${themeAccent}CC`; // 80% opacity version

  const [isFrontPageModalOpen, setIsFrontPageModalOpen] = useState(false);

  const [solarSettings, setSolarSettings] = useState({
    projectKW: 0
  });

  const [monthlyIsolation, setMonthlyIsolation] = useState(
    Array(12).fill(0).map((val, idx) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx],
      isolation: 0,
      total: 0
    }))
  );

  const [annualTotal, setAnnualTotal] = useState(0);
  const [inflationRate, setInflationRate] = useState(0); 
  const [degradationRate, setDegradationRate] = useState(0);
  const [quotes, setQuotes] = useState([]);
  // const [quoteCount, setQuoteCount] = useState(0); // Not needed with DB IDs
  const [editingId, setEditingId] = useState(null);
  const [downloadQuote, setDownloadQuote] = useState(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleDownloadQuote = (quote) => {
    let genImage = null;
    let roiImage = null;
    
    try {
      if (generationChartInstance.current && generationChartInstance.current.canvas) {
        genImage = generationChartInstance.current.toBase64Image();
      }
      if (roiChartInstance.current && roiChartInstance.current.canvas) {
        roiImage = roiChartInstance.current.toBase64Image();
      }
    } catch (err) {
      console.warn("Could not capture chart images for PDF:", err);
    }

    setDownloadQuote({ 
      ...quote, 
      chartImages: { gen: genImage, roi: roiImage } 
    });
    setIsDownloadModalOpen(true);
  };

  const generationChartRef = useRef(null);
  const roiChartRef = useRef(null);
  const generationChartInstance = useRef(null);
  const roiChartInstance = useRef(null);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const packageImageInputRef = useRef(null);

  const defaultPages = [
    { id: 'f1', label: 'Front Page', value: 'Front Page', description: 'Cover page with branding and customer details' },
    { id: 'f2', label: 'Commercial Page', value: 'Commercial Page', description: 'Pricing, payment and commercial details' },
    { id: 'f3', label: 'Generation Graph', value: 'Generation Graph', description: 'Energy generation chart page' },
    { id: 'f4', label: 'Add ons Settings', value: 'Advanced Settings', description: 'Extra accessories and feature list' },
    { id: 'f5', label: 'BOM Survey Summary', value: 'Financial Summary', description: 'Technical bill of materials and summary' },
    { id: 'p_terms', label: 'Payment Terms', value: 'Payment Terms', description: 'Selected payment options breakdown' }
  ];

  const [pagesOptions, setPagesOptions] = useState(() => {
    const savedCustomPages = localStorage.getItem('customQuotePages');
    if (savedCustomPages) {
      try {
        const parsed = JSON.parse(savedCustomPages);
        // Clean up specific unwanted pages requested by user
        const filtered = parsed.filter(p => !['EEEE', 'SWWSW', 'FOTTER', 'JJIIK'].includes(p.label?.toUpperCase()));
        if (filtered.length !== parsed.length) {
          localStorage.setItem('customQuotePages', JSON.stringify(filtered));
        }
        return [...defaultPages, ...filtered];
      } catch (e) {
        return defaultPages;
      }
    }
    return defaultPages;
  });
  const [newPageName, setNewPageName] = useState('');

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [subProjectTypes, setSubProjectTypes] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [planTypes, setPlanTypes] = useState([]);

  const [allSubCategories, setAllSubCategories] = useState([]);
  const [allSubProjectTypes, setAllSubProjectTypes] = useState([]);
  const [mappingsList, setMappingsList] = useState([]);
  const [activeTab, setActiveTab] = useState('Header');
  const [openSections, setOpenSections] = useState({
    targeting: true,
    media: false,
    bom: false,
    finance: false,
    pages: false,
    addons: false,
    fields: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const quoteTypes = ['Survey Quote', 'Quick Quote'];
  
  const {
    countries, states, clusters, districts,
    fetchStates, fetchClusters, fetchDistricts
  } = useLocations();

  // ── Multi-select location arrays ──────────────────────────────────────────
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  useEffect(() => {
    fetchQuotes();
    fetchDynamicFilters();

    // Restore state from localStorage if it exists
    const savedState = localStorage.getItem('activeQuoteSetup');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.filters) setFilters(parsed.filters);
        if (parsed.solarSettings) setSolarSettings(parsed.solarSettings);
        if (parsed.monthlyIsolation) setMonthlyIsolation(parsed.monthlyIsolation);
        if (parsed.bomData) setBomData(parsed.bomData);
        if (parsed.selectedKitIds) setSelectedKitIds(parsed.selectedKitIds);
        else if (parsed.selectedKitId) setSelectedKitIds([parsed.selectedKitId]); // Backward compatibility
        
        let restoredPages = parsed.selectedPages || [];
        if (!restoredPages.includes('Front Page')) {
          restoredPages = ['Front Page', ...restoredPages];
        }
        setSelectedPages(restoredPages);

        if (parsed.frontPageSettings) setFrontPageSettings(parsed.frontPageSettings);
        if (parsed.colorSettings) setColorSettings(parsed.colorSettings);
        if (parsed.advancedOptions) setAdvancedOptions(parsed.advancedOptions);
        if (parsed.unitPrice) setUnitPrice(parsed.unitPrice);
        if (parsed.inflationRate) setInflationRate(parsed.inflationRate);
        if (parsed.degradationRate) setDegradationRate(parsed.degradationRate);
        if (parsed.quoteTypesSelected) setQuoteTypesSelected(parsed.quoteTypesSelected);
        if (parsed.partnerTypesSelected) setPartnerTypesSelected(parsed.partnerTypesSelected);
        if (parsed.planTypesSelected) setPlanTypesSelected(parsed.planTypesSelected);
        if (parsed.kitTypesSelected) setKitTypesSelected(parsed.kitTypesSelected);
        if (parsed.paymentModesSelected) setPaymentModesSelected(parsed.paymentModesSelected);
        if (parsed.packageImage) setPackageImage(parsed.packageImage);
        if (parsed.fieldSettings) setFieldSettings(parsed.fieldSettings);
        
        // Restore locations
        if (parsed.selectedCountries) setSelectedCountries(parsed.selectedCountries);
        if (parsed.selectedStates) setSelectedStates(parsed.selectedStates);
        if (parsed.selectedClusters) setSelectedClusters(parsed.selectedClusters);
        if (parsed.selectedDistricts) setSelectedDistricts(parsed.selectedDistricts);
      } catch (e) {
        console.warn("Failed to restore saved quote setup:", e);
      }
    } else {
      // Default: Ensure Front Page is selected if no saved state
      setSelectedPages(['Front Page']);
    }

    // One-time cleanup for specific unwanted pages and potential duplicates
    const unwanted = ['EEEE', 'SWWSW', 'FOTTER', 'JJIIK'];
    setPagesOptions(prev => {
      // 1. Filter out unwanted labels
      const filtered = prev.filter(p => !p.label || !unwanted.includes(p.label.toUpperCase()));
      
      // 2. Ensure NO duplicates (especially p_terms which might have leaked into storage)
      const seenIds = new Set();
      const unique = filtered.filter(p => {
        if (!p.id || seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });

      if (unique.length !== prev.length) {
        const customOnly = unique.filter(p => !PROTECTED_IDS.includes(p.id));
        localStorage.setItem('customQuotePages', JSON.stringify(customOnly));
        return unique;
      }
      return prev;
    });
  }, []);

  // Auto-save state to localStorage on changes
  useEffect(() => {
    const setup = {
      filters, solarSettings, monthlyIsolation, bomData, selectedKitIds,
      selectedPages, frontPageSettings, colorSettings, advancedOptions,
      unitPrice, inflationRate, degradationRate, quoteTypesSelected,
      partnerTypesSelected, planTypesSelected, kitTypesSelected,
      paymentModesSelected, packageImage, fieldSettings,
      selectedCountries, selectedStates, selectedClusters, selectedDistricts
    };
    localStorage.setItem('activeQuoteSetup', JSON.stringify(setup));
  }, [
    filters, solarSettings, monthlyIsolation, bomData, selectedKitIds,
    selectedPages, frontPageSettings, colorSettings, advancedOptions,
    unitPrice, inflationRate, degradationRate, quoteTypesSelected,
    partnerTypesSelected, planTypesSelected, kitTypesSelected,
    paymentModesSelected, packageImage, fieldSettings,
    selectedCountries, selectedStates, selectedClusters, selectedDistricts
  ]);

  const handleDeletePage = (pageId) => {
    if (['f1', 'f2', 'f3', 'f4', 'f5'].includes(pageId)) {
      toast.error("Standard system pages cannot be deleted.");
      return;
    }

    const updatedPages = pagesOptions.filter(p => p.id !== pageId);
    setPagesOptions(updatedPages);

    const customOnly = updatedPages.filter(p => !['f1', 'f2', 'f3', 'f4', 'f5'].includes(p.id));
    localStorage.setItem('customQuotePages', JSON.stringify(customOnly));
    
    const pageToDelete = pagesOptions.find(p => p.id === pageId);
    if (pageToDelete) {
      setSelectedPages(prev => prev.filter(val => val !== pageToDelete.value));
    }

    toast.success("Page removed successfully.");
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPagesOptions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update localStorage for custom discovery too
        const customOnly = newOrder.filter(p => !PROTECTED_IDS.includes(p.id));
        localStorage.setItem('customQuotePages', JSON.stringify(customOnly));
        
        return newOrder;
      });
    }
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    setPagesOptions((items) => {
      const newOrder = arrayMove(items, index, index - 1);
      const customOnly = newOrder.filter(p => !PROTECTED_IDS.includes(p.id));
      localStorage.setItem('customQuotePages', JSON.stringify(customOnly));
      return newOrder;
    });
  };

  const handleMoveDown = (index) => {
    if (index >= pagesOptions.length - 1) return;
    setPagesOptions((items) => {
      const newOrder = arrayMove(items, index, index + 1);
      const customOnly = newOrder.filter(p => !PROTECTED_IDS.includes(p.id));
      localStorage.setItem('customQuotePages', JSON.stringify(customOnly));
      return newOrder;
    });
  };

  const SortablePageCard = ({ page, selectedPages, setSelectedPages, quoteType = quoteTypesSelected[0], setActiveEditingPage, setTempPageConfig, setIsPageModalOpen, pageConfigs, onDelete }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: page.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
    };

    const isSelected = selectedPages.includes(page.value);

    const toggleSelection = (e) => {
      e.stopPropagation();
      if (page.value === 'Front Page') return; // Cannot deselect Front Page
      if (isSelected) {
        setSelectedPages(selectedPages.filter(p => p !== page.value));
      } else {
        setSelectedPages([...selectedPages, page.value]);
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group bg-white border-2 rounded-3xl p-6 transition-all duration-300 flex items-start gap-5 mb-4 ${isSelected ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5' : 'border-gray-100 hover:border-blue-200'} ${isDragging ? 'shadow-2xl scale-[1.02] border-blue-400 z-50' : 'shadow-sm'}`}
      >
        <div 
          {...attributes} 
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-blue-500 transition-colors p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h5 className={`text-[13px] font-black uppercase tracking-tight ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
              {page.label}
            </h5>
            <button 
              onClick={toggleSelection}
              disabled={page.value === 'Front Page'}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'border-gray-200 bg-white hover:border-blue-400'} ${page.value === 'Front Page' ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {isSelected ? <CheckCircle size={14} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-100 group-hover:bg-blue-100" />}
            </button>
          </div>
          
          <p className="text-[10px] font-bold text-gray-400 leading-relaxed mb-5 uppercase tracking-wide">
            {page.description || 'Custom configured page content and components'}
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (page.value === 'Front Page') {
                  setIsFrontPageModalOpen(true);
                } else {
                  setActiveEditingPage(page);
                  setTempPageConfig(pageConfigs[page.value] || { header: '', footer: '', media: '', content: '' });
                  setIsPageModalOpen(true);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${isSelected ? 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white hover:shadow-blue-100'}`}
            >
              <Settings size={14} className={isSelected ? 'animate-spin-slow' : ''} />
              Settings
            </button>
            
            {isSelected && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest animate-in fade-in zoom-in-95">
                <FileText size={12} />
                Selected
              </div>
            )}

            {!PROTECTED_IDS.includes(page.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(page.id);
                }}
                className="ml-auto p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete page"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SortableSequenceCard = ({ page, index, total, selectedPages, setSelectedPages, onMoveUp, onMoveDown }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: page.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 20 : 1,
      opacity: isDragging ? 0.6 : 1,
    };

    const isSelected = selectedPages.includes(page.value);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-4 bg-white p-4 rounded-2xl border-2 transition-all duration-300 ${isDragging ? 'border-blue-500 shadow-xl' : isSelected ? 'border-blue-100 hover:border-blue-200' : 'border-gray-50 opacity-60'} mb-3`}
      >
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-blue-500 transition-colors shrink-0"
        >
          <GripVertical size={18} />
        </div>

        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-[10px] font-black text-gray-400 border border-gray-100 shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
           <h6 className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>
             {page.label}
           </h6>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => onMoveUp(index)}
             disabled={index === 0}
             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
           >
             <ChevronUp size={14} />
           </button>
           <button 
             onClick={() => onMoveDown(index)}
             disabled={index === total - 1}
             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
           >
             <ChevronDown size={14} />
           </button>
           
           <div className="w-px h-4 bg-gray-100 mx-1" />

           <button
             onClick={() => {
               if (page.value === 'Front Page') return;
               if (isSelected) {
                 setSelectedPages(selectedPages.filter(p => p !== page.value));
               } else {
                 setSelectedPages([...selectedPages, page.value]);
               }
             }}
             className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
           >
             {isSelected ? 'ON' : 'OFF'}
           </button>
        </div>
      </div>
    );
  };

  const fetchDynamicFilters = async () => {
    try {
      const results = await Promise.allSettled([
        productApi.getCategories(),
        productApi.getSubCategories(),
        productApi.getProjectTypes(),
        productApi.getSubProjectTypes(),
        productApi.getProjectCategoryMappings(),
        salesSettingsService.getPartnerTypes()
      ]);

      const safeExtract = (result) => {
        if (result.status !== 'fulfilled') return [];
        const val = result.value;
        if (Array.isArray(val)) return val;
        if (val && Array.isArray(val.data)) return val.data;
        if (val && val.data && Array.isArray(val.data.data)) return val.data.data;
        return [];
      };

      const cats = safeExtract(results[0]);
      const subCats = safeExtract(results[1]);
      const pTypes = safeExtract(results[2]);
      const subPTypes = safeExtract(results[3]);
      const mappings = safeExtract(results[4]);
      const partTypes = safeExtract(results[5]);

      setCategories(cats);
      setAllSubCategories(subCats);
      setAllSubProjectTypes(subPTypes);
      setMappingsList(mappings);
      setPartnerTypes(partTypes);

      // Merge project types from mappings and master project types
      const allProjectOptions = [
        ...new Set([
          ...mappings.map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`),
          ...pTypes.map(p => p.name || p)
        ])
      ];
      setProjectTypes(allProjectOptions.filter(Boolean));

    } catch (error) {
      console.error("Error fetching dynamic filters:", error);
    }
  };

  // Cascade: when countries change, reload states and clear lower levels
  useEffect(() => {
    const activeIds = selectedCountries.filter(id => id && id !== 'all');
    if (selectedCountries.includes('all') || activeIds.length === 0) {
      fetchStates();
    } else {
      fetchStates({ countryId: activeIds.join(',') });
    }
    setSelectedStates([]);
    setSelectedClusters([]);
    setSelectedDistricts([]);
  }, [selectedCountries]);

  // Cascade: when states change, reload clusters and clear lower levels
  useEffect(() => {
    const activeIds = selectedStates.filter(id => id && id !== 'all');
    if (selectedStates.includes('all') || activeIds.length === 0) {
      fetchClusters();
    } else {
      fetchClusters({ stateId: activeIds.join(',') });
    }
    setSelectedClusters([]);
    setSelectedDistricts([]);
  }, [selectedStates]);

  // Cascade: when clusters change, reload districts and clear lower level
  useEffect(() => {
    const activeIds = selectedClusters.filter(id => id && id !== 'all');
    if (selectedClusters.includes('all') || activeIds.length === 0) {
      fetchDistricts();
    } else {
      fetchDistricts({ clusterId: activeIds.join(',') });
    }
    setSelectedDistricts([]);
  }, [selectedClusters]);

  // Toggle helpers
  const toggleSelection = (setter, id, currentArray) => {
    const arr = Array.isArray(currentArray) ? currentArray : [];
    if (arr.includes(id)) {
      setter(arr.filter(item => item !== id));
    } else {
      setter([...arr, id]);
    }
  };

  const toggleLocation = (setter, id, allItems) => {
    setter(prev => {
      if (id === 'all') {
        if (prev.includes('all')) return [];
        return ['all', ...allItems.map(i => i._id)];
      }
      const activeIds = prev.filter(i => i !== 'all');
      if (activeIds.includes(id)) {
        return activeIds.filter(i => i !== id);
      } else {
        const next = [...activeIds, id];
        if (next.length === allItems.length) return ['all', ...next];
        return next;
      }
    });
  };

  const selectAllLocations = (setter, allItems) => {
    setter(prev => {
      const allIds = allItems.map(i => i._id);
      const allSelected = allIds.every(id => prev.includes(id));
      if (allSelected) return [];
      return ['all', ...allIds];
    });
  };

  // Reusable MultiSelectDropdown Component
  const MultiSelectDropdown = ({ label, options, selected, onToggle, placeholder = "Select Items", colorClass = "blue" }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Close dropdown on outside click
    useEffect(() => {
      if (!isOpen) return;
      const handleClick = () => setIsOpen(false);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }, [isOpen]);

    const colors = {
      blue: "text-blue-600 bg-blue-50 border-blue-100",
      indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
      amber: "text-amber-600 bg-amber-50 border-amber-100"
    };

    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-gray-300 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selected.length > 0 ? (
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${colors[colorClass] || colors.blue}`}>
                {selected.length} Selected
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-400">{placeholder}</span>
            )}
            <span className="text-xs font-bold text-gray-700 truncate">
              {selected.length > 0 ? selected.join(', ') : ''}
            </span>
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto">
            {options.length > 1 && (
                <button 
                  onClick={() => {
                    const allVals = options.map(o => o.name || o);
                    const isAllSelected = allVals.every(v => selected.includes(v));
                    if (isAllSelected) {
                      options.forEach(o => { if (selected.includes(o.name || o)) onToggle(o.name || o) });
                    } else {
                      options.forEach(o => { if (!selected.includes(o.name || o)) onToggle(o.name || o) });
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] font-black text-blue-600 uppercase hover:bg-blue-50 rounded-lg mb-1 flex items-center justify-between"
                >
                  {options.map(o => o.name || o).every(v => selected.includes(v)) ? "Deselect All" : "Select All"}
                  <CheckSquare size={14} />
                </button>
            )}
            {options.map((opt, idx) => {
              const name = opt.name || opt;
              const isSelected = selected.includes(name);
              return (
                <div
                  key={idx}
                  onClick={() => onToggle(name)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}>
                    {isSelected && <CheckSquare size={14} className="text-white" />}
                  </div>
                  <span className="text-xs font-bold">{name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Filter Sub Categories when Categories change
  useEffect(() => {
    if (filters.categories.length > 0) {
      const selectedCatObjs = categories.filter(c => filters.categories.includes(c.name) || filters.categories.includes(c._id));
      const filtered = allSubCategories.filter(sc =>
        selectedCatObjs.some(cat => 
          sc.categoryId === cat._id || 
          sc.categoryId?._id === cat._id || 
          sc.categoryId?.name === cat.name
        )
      );
      const uniqueSubs = [...new Set(filtered.map(s => s.name || s))];
      setSubcategories(uniqueSubs);
    } else {
      setSubcategories([]);
    }
  }, [filters.categories, categories, allSubCategories]);

  // Filter Sub Project Types when Project Types change
  useEffect(() => {
    const uniqueSubPTypes = [...new Set(allSubProjectTypes.map(s => s.name || s))];
    setSubProjectTypes(uniqueSubPTypes);
    
    // Trigger pricing fetch only when core filters are set (arbitrarily check firsts for preview)
    if (filters.categories.length > 0 && filters.projectTypes.length > 0 && !editingId) {
        fetchPricing();
    }
  }, [filters.categories, filters.projectTypes, allSubProjectTypes, editingId]);

  const fetchPricing = async () => {
    try {
        const response = await productApi.getProductPrices({
            category: filters.categories[0],
            subCategory: filters.subCategories[0],
            projectType: filters.projectTypes[0]
        });
        
        const data = response.data;
        if (data && data.length > 0) {
            const price = data[0]; // Take first match
            const total = price.basePrice || 0;
            const mnre = price.mnreSubsidy || 0;
            const state = price.stateSubsidy || 0;
            const add = price.additionalCharges || 0;
            
            setPricingData({
                totalCost: total,
                mnreSubsidy: mnre,
                stateSubsidy: state,
                additionalCharges: add,
                netCost: total - mnre - state + add
            });
        } else {
            // Fallback to zeros or defaults if no mapping found
            setPricingData({
                totalCost: 0, 
                mnreSubsidy: 0,
                stateSubsidy: 0,
                additionalCharges: 0,
                netCost: 0
            });
        }
    } catch (error) {
        console.error("Error fetching dynamic pricing:", error);
    }
  };

  // Filter Plan Types when Partner Type or Location changes
  useEffect(() => {
    const fetchPlans = async () => {
      if (partnerTypesSelected.length > 0) {
        try {
          const plans = await salesSettingsService.getPartnerPlans({
            partnerType: partnerTypesSelected.join(','),
            countryId: selectedCountries.filter(id => id !== 'all').join(',') || undefined,
            stateId: selectedStates.filter(id => id !== 'all').join(',') || undefined,
            clusterId: selectedClusters.filter(id => id !== 'all').join(',') || undefined,
            districtId: selectedDistricts.filter(id => id !== 'all').join(',') || undefined
          });
          const uniquePlans = [...new Set(plans.map(p => p.planName || p.name || p))];
          setPlanTypes(uniquePlans);
          
          // Re-validate selected plan types
          setPlanTypesSelected(prev => prev.filter(p => uniquePlans.includes(p)));
        } catch (err) {
          console.error("Error fetching partner plans:", err);
          setPlanTypes(['Startup', 'Basic', 'Enterprise', 'Solar Business']);
        }
      } else {
        setPlanTypes([]);
      }
    };
    fetchPlans();
  }, [partnerTypesSelected, selectedCountries, selectedStates, selectedClusters, selectedDistricts]);

  const fetchQuotes = async () => {
    try {
      const data = await getQuoteSettings();
      setQuotes(data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to load quote settings");
    }
  };

  const getQuoteCount = (type, id) => {
    if (!id) return 0;
    if (id === 'all') return quotes.length;
    
    return quotes.filter(q => {
        // 1. Check Location Match (Specific ID or 'All')
        const pluralType = type === 'country' ? 'countries' : (type === 'category' ? 'categories' : type + 's');
        const targetArray = q[pluralType] || (q[type] ? [q[type]] : []);
        
        const locationMatch = targetArray.some(item => {
          const targetId = (item._id || item).toString();
          return targetId === id.toString() || targetId === 'all';
        });

        if (!locationMatch) return false;

        // 2. Cross-filter by current Targeting Configuration (if any selected)
        const hasCategoryFilter = filters.categories.length > 0;
        const hasProjectTypeFilter = filters.projectTypes.length > 0;

        if (hasCategoryFilter) {
          const catMatch = filters.categories.some(cat => {
            // Check in array or single field
            const qCats = q.categories || (q.category ? [q.category] : []);
            return qCats.includes(cat);
          });
          if (!catMatch) return false;
        }

        if (hasProjectTypeFilter) {
          const typeMatch = filters.projectTypes.some(pt => {
             const qTypes = q.projectTypes || (q.projectType ? [q.projectType] : []);
             return qTypes.includes(pt);
          });
          if (!typeMatch) return false;
        }

        return true;
    }).length;
  };

  // Discovery logic removed to prevent deleted pages from returning.

  useEffect(() => {
    if (selectedPages.includes('Generation Graph') || selectedPages.includes('Financial Summary')) {
      // Auto-calculate annual total for reactive cards
      const { projectKW } = solarSettings;
      const calculatedTotal = monthlyIsolation.reduce((sum, m) => sum + (m.isolation * projectKW * 0.8), 0);
      setAnnualTotal(parseFloat(calculatedTotal.toFixed(2)));
      
      // Delay chart initialization to ensure DOM is ready
      // Use a slightly longer delay on first load/refresh
      setTimeout(initializeCharts, 800);
      // Double check after a bit longer to ensure charts render on refresh
      setTimeout(initializeCharts, 2000);
    }
  }, [selectedPages, monthlyIsolation, solarSettings, pricingData, advancedOptions, unitPrice, themeAccent]); 

  // Remove the old calculateGeneration duplicate that was here
  const calculateGeneration = () => {
    const { projectKW } = solarSettings;
    let total = 0;

    const updatedMonths = monthlyIsolation.map(month => {
      const monthTotal = month.isolation * projectKW * 0.8;
      total += monthTotal;
      return { ...month, total: parseFloat(monthTotal.toFixed(2)) };
    });

    // Only update state if values actually changed to avoid infinite loop if we were setting monthlyIsolation here directly
    // But since we are mapping, we are creating new objects.
    // Instead of setting monthlyIsolation which triggers effect, we just calculate for annualTotal
    // And for the chart.
    // However, we want 'total' property in monthlyIsolation to be updated.

    // To avoid infinite loop (Effect -> calculate -> setState -> Effect), we should separate the "input" isolation from "calculated" total.
    // BUT the original code did setMonthlyIsolation.
    // Let's just calculate total here for annualTotal state, and rely on the rendered values for display.

    setAnnualTotal(parseFloat(total.toFixed(2)));
    // Also update charts manually only when requested
    setTimeout(initializeCharts, 300);
  };

  const getCalculatedMonthlyData = () => {
    const { projectKW } = solarSettings;
    return monthlyIsolation.map(month => ({
      ...month,
      total: parseFloat((month.isolation * projectKW * 0.8).toFixed(2))
    }));
  };

  const getCurrentQuoteForExport = () => ({
    ...filters,
    countries: selectedCountries,
    states: selectedStates,
    clusters: selectedClusters,
    districts: selectedDistricts,
    quoteTypes: quoteTypesSelected,
    partnerTypes: partnerTypesSelected,
    planTypes: planTypesSelected,
    selectedPages,
    solarSettings,
    monthlyIsolation: getCalculatedMonthlyData(),
    pricingData,
    unitPrice,
    inflationRate,
    degradationRate,
    bomData,
    pageConfigs,
    frontPageSettings,
    colorSettings,
    kitTypes: kitTypesSelected,
    paymentModes: paymentModesSelected,
    fieldSettings,
    packageImage
  });

  // Re-initialize charts when project parameters or theme colors change
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeCharts();
    }, 300);
    return () => clearTimeout(timer);
  }, [themeAccent, annualTotal, pricingData.netCost, unitPrice, inflationRate, degradationRate, selectedPages]);

  const initializeCharts = () => {
    // Destroy existing charts
    if (generationChartInstance.current) {
      generationChartInstance.current.destroy();
    }
    if (roiChartInstance.current) {
      roiChartInstance.current.destroy();
    }

    const calculatedData = getCalculatedMonthlyData();

    // Generation Chart
    const generationCtx = generationChartRef.current;
    if (generationCtx) {
      generationChartInstance.current = new Chart(generationCtx, {
        type: 'bar',
        data: {
          labels: calculatedData.map(m => m.month),
          datasets: [{
            label: 'Units Generated (kWh)',
            data: calculatedData.map(m => m.total),
            backgroundColor: `${themeAccent}CC`,
            borderColor: themeAccent,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Units (kWh)'
              }
            }
          }
        }
      });
    }

    // ROI Chart (Dynamic calculation)
    const roiCtx = roiChartRef.current;
    if (roiCtx) {
      const years = Array.from({ length: 11 }, (_, i) => i);
      let cumulative = 0;
      const cumulativeSavings = [];
      const costBaseline = years.map(() => pricingData.netCost);
      
      let yearlySavings = annualTotal * unitPrice;
      
      years.forEach(y => {
        if (y === 0) {
          cumulativeSavings.push(0);
        } else {
          cumulative += yearlySavings;
          cumulativeSavings.push(cumulative);
          // Apply inflation and degradation for NEXT year
          yearlySavings = yearlySavings * (1 + inflationRate - degradationRate);
        }
      });

      roiChartInstance.current = new Chart(roiCtx, {
        type: 'line',
        data: {
          labels: years.map(y => `Year ${y}`),
          datasets: [{
            label: 'Cumulative Savings (₹)',
            data: cumulativeSavings,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointRadius: 4
          }, {
            label: 'System Cost (₹)',
            data: costBaseline,
            borderColor: themeAccent,
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount (₹)'
              }
            }
          }
        }
      });
    }
  };

  const handleSaveQuote = async () => {
    if (filters.categories.length === 0 || filters.subCategories.length === 0 || filters.projectTypes.length === 0 || filters.subProjectTypes.length === 0 || quoteTypesSelected.length === 0 || partnerTypesSelected.length === 0 || planTypesSelected.length === 0) {
      toast.error("Please fill all fields before saving the quote.");
      return;
    }

    const payload = {
      countries: selectedCountries,
      states: selectedStates,
      clusters: selectedClusters,
      districts: selectedDistricts,
      ...filters,
      quoteTypes: quoteTypesSelected,
      partnerTypes: partnerTypesSelected,
      planTypes: planTypesSelected,
      selectedPages,
      allPages: pagesOptions,
      solarSettings,
      monthlyIsolation: monthlyIsolation.map(m => ({
        month: m.month,
        isolation: m.isolation,
        total: parseFloat((m.isolation * solarSettings.projectKW * 0.8).toFixed(2))
      })),
      colorSettings,
      fieldSettings,
      kitTypes: kitTypesSelected,
      paymentModes: paymentModesSelected,
      pageConfigs,
      frontPageSettings,
      advancedOptions,
      unitPrice,
      inflationRate,
      degradationRate,
      packageImage,
      bomData,
      pricingData
    };

    try {
      if (editingId) {
        await updateQuoteSetting(editingId, payload);
        toast.success("Quote setting updated");
      } else {
        const res = await createQuoteSetting(payload);
        if (res?._id) {
            setEditingId(res._id);
            if (res.proposalNo) setCurrentProposalNo(res.proposalNo);
        }
        toast.success("Quote setting created");
      }

      fetchQuotes();
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    }
  };

  const handleAddPage = () => {
    if (!newPageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }
    const newId = `c${Date.now()}`;
    const newPage = { id: newId, label: newPageName, value: newPageName };
    const updatedOptions = [...pagesOptions, newPage];
    setPagesOptions(updatedOptions);

    // Save custom pages to localStorage
    const customPages = updatedOptions.filter(p => !PROTECTED_IDS.includes(p.id));
    localStorage.setItem('customQuotePages', JSON.stringify(customPages));

    setNewPageName('');
    toast.success(`Page "${newPageName}" added`);
  };

  const resetForm = () => {
    setFilters({
      categories: [],
      subCategories: [],
      projectTypes: [],
      subProjectTypes: []
    });
    setQuoteTypesSelected(['Survey Quote']);
    setPartnerTypesSelected([]);
    setPlanTypesSelected([]);
    setKitTypesSelected(['Combo Kit']);
    setPaymentModesSelected(['Cash']);
    setSelectedPages([]);
    // Clear multi-select location arrays
    setSelectedCountries([]);
    setSelectedStates([]);
    setSelectedClusters([]);
    setSelectedDistricts([]);
    setSolarSettings({
      projectKW: 0
    });
    setMonthlyIsolation(Array(12).fill(0).map((val, idx) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx],
      isolation: 0,
      total: 0
    })));
    setAdvancedOptions([
      { key: 'amc', enabled: false, type: 'Basic AMC Plan', price: 0, description: 'Bi-annual system inspection, Basic cleaning (twice a year), Performance report, Remote monitoring setup' },
      { key: 'insurance', enabled: false, type: 'Basic Panel Protection', price: 0, description: 'Covers damage from natural disasters, Theft protection, 10-year coverage option' },
      { key: 'cleaningKit', enabled: false, type: 'Basic Cleaning Kit', price: 0, description: 'Includes telescopic pole, brush and biodegradable cleaner' }
    ]);
    setUnitPrice(0);
    setInflationRate(0);
    setDegradationRate(0);
    setPackageImage(null);
    setBomData({
      items: [
        { label: 'Solar Structure', value: 'HOT DIP GALVANIZE' },
        { label: 'Solar DC Cable', value: 'Polycab 4 Sq mm' },
        { label: 'Solar AC Cable', value: 'Polycab 4 Sq mm' },
        { label: 'Earthing Kit + LA', value: 'Standard' },
        { label: 'Electrical Components', value: 'L & T / Similar' }
      ],
      pipes: [
        { panels: '4', kw: '2.16', size1: '3', size2: '2' },
        { panels: '6', kw: '3.24', size1: '3', size2: '3' },
        { panels: '10', kw: '5.4', size1: '5', size2: '4' },
        { panels: '12', kw: '6.48', size1: '5', size2: '5' }
      ],
      heightNote: 'Structure Height 6 x 8 Feet is included. Extra pipes beyond this will be paid by the customer.'
    });
    setFieldSettings({
      proposalNo: true,
      customerName: true,
      kwRequired: true,
      residentialCommercial: true,
      city: true,
      preparedBy: true,
      date: true,
      validUpto: true,
      quoteType: true,
      productImage: true,
      totalCost: true,
      govtMnreSubsidy: true,
      govtStateSubsidy: true,
      additionalCharges: true,
      finalTotal: true,
      kitType: true,
      paymentMode: true,
      generationSummary: true
    });
    setPageConfigs({});
    setFrontPageSettings(defaultFrontPageSettings);
    setPricingData({
        totalCost: 0,
        mnreSubsidy: 0,
        stateSubsidy: 0,
        additionalCharges: 0,
        netCost: 0
    });
    setCurrentProposalNo('');
  };

  const handleDeleteQuote = async (id) => {
    if (window.confirm("Are you sure you want to delete this quote setting?")) {
      try {
        await deleteQuoteSetting(id);
        toast.success("Quote setting deleted");
        fetchQuotes();
        if (editingId === id) {
          setEditingId(null);
          resetForm();
        }
      } catch (error) {
        console.error("Error deleting quote:", error);
        toast.error("Failed to delete quote");
      }
    }
  };

  const handleEditQuote = async (quote) => {
    setEditingId(quote._id);
    setCurrentProposalNo(quote.proposalNo || '');

    // Restore multi-select arrays from saved quote
    const savedCountries = (Array.isArray(quote.countries) ? quote.countries.map(c => c?._id || c)
      : (quote.country ? [quote.country?._id || quote.country] : [])).filter(Boolean);
    const savedStates = (Array.isArray(quote.states) ? quote.states.map(s => s?._id || s)
      : (quote.state ? [quote.state?._id || quote.state] : [])).filter(Boolean);
    const savedClusters = (Array.isArray(quote.clusters) ? quote.clusters.map(cl => cl?._id || cl)
      : (quote.cluster ? [quote.cluster?._id || quote.cluster] : [])).filter(Boolean);
    const savedDistricts = (Array.isArray(quote.districts) ? quote.districts.map(d => d?._id || d)
      : (quote.district ? [quote.district?._id || quote.district] : [])).filter(Boolean);

    try {
      const activeCountry = savedCountries.filter(id => id && id !== 'all')[0];
      if (activeCountry) await fetchStates({ countryId: activeCountry });
      setSelectedCountries(savedCountries);

      const activeState = savedStates.filter(id => id && id !== 'all')[0];
      if (activeState) await fetchClusters(activeState);
      setSelectedStates(savedStates);

      const activeCluster = savedClusters.filter(id => id && id !== 'all')[0];
      if (activeCluster) await fetchDistricts(activeCluster);
      setSelectedClusters(savedClusters);

      setSelectedDistricts(savedDistricts);
    } catch (err) {
      console.error("Error loading location hierarchy for edit:", err);
    }

    setFilters({
      categories: Array.isArray(quote.categories) ? quote.categories : (quote.category ? [quote.category] : []),
      subCategories: Array.isArray(quote.subCategories) ? quote.subCategories : (quote.subCategory ? [quote.subCategory] : []),
      projectTypes: Array.isArray(quote.projectTypes) ? quote.projectTypes : (quote.projectType ? [quote.projectType] : []),
      subProjectTypes: Array.isArray(quote.subProjectTypes) ? quote.subProjectTypes : (quote.subProjectType ? [quote.subProjectType] : [])
    });
    setQuoteTypesSelected(quote.quoteTypes || []);
    setPartnerTypesSelected(quote.partnerTypes || []);
    setPlanTypesSelected(quote.planTypes || []);
    setSelectedPages(quote.selectedPages || []);

    // Restore page sequence and persistence from allPages if available
    if (quote.allPages && quote.allPages.length > 0) {
      setPagesOptions(quote.allPages);
    } else {
      // Fallback: Add any pages from the saved quote that aren't in current options
      setPagesOptions(prev => {
        const existingValues = new Set(prev.map(p => p.value));
        const newOptions = [...prev];
        let added = false;
        (quote.selectedPages || []).forEach(pageVal => {
          if (!existingValues.has(pageVal)) {
            newOptions.push({
              id: `f${newOptions.length + 1}`,
              label: pageVal,
              value: pageVal
            });
            added = true;
          }
        });
        return added ? newOptions : prev;
      });
    }

    if (quote.solarSettings) {
      setSolarSettings(quote.solarSettings);
    }
    if (quote.pricingData) {
      setPricingData(quote.pricingData);
    } else {
      setPricingData({
        totalCost: 0,
        mnreSubsidy: 0,
        stateSubsidy: 0,
        additionalCharges: 0,
        netCost: 0
      });
    }
    if (quote.monthlyIsolation && quote.monthlyIsolation.length > 0) {
      setMonthlyIsolation(quote.monthlyIsolation);
    }
    if (quote.colorSettings) {
      setColorSettings(quote.colorSettings);
    }
    if (quote.advancedOptions) {
      setAdvancedOptions(quote.advancedOptions);
    }
    if (quote.unitPrice) {
      setUnitPrice(quote.unitPrice);
    }
    if (quote.inflationRate !== undefined) {
      setInflationRate(quote.inflationRate);
    }
    if (quote.degradationRate !== undefined) {
      setDegradationRate(quote.degradationRate);
    }
    if (quote.packageImage) {
      setPackageImage(quote.packageImage);
    } else {
      setPackageImage(null);
    }
    if (quote.bomData) {
      setBomData(quote.bomData);
    }
    if (quote.fieldSettings) {
      setFieldSettings(quote.fieldSettings);
    } else {
      // Fallback for old quotes
      setFieldSettings({
        proposalNo: true, customerName: true, kwRequired: true,
        residentialCommercial: true, city: true, preparedBy: true,
        date: true, validUpto: true, quoteType: true,
        productImage: true, totalCost: true, govtMnreSubsidy: true,
        govtStateSubsidy: true, additionalCharges: true, finalTotal: true,
        kitType: true, paymentMode: true, generationSummary: true
      });
    }

    if (quote.kitTypes) setKitTypesSelected(quote.kitTypes);
    if (quote.paymentModes) setPaymentModesSelected(quote.paymentModes);
    if (quote.pageConfigs) setPageConfigs(quote.pageConfigs);
    if (quote.frontPageSettings) setFrontPageSettings(quote.frontPageSettings);

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontPageSettings(prev => ({
          ...prev,
          header: { ...prev.header, logoUrl: reader.result }
        }));
        toast.success("Logo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Banner file size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontPageSettings(prev => ({
          ...prev,
          banner: { ...prev.banner, imageUrl: reader.result }
        }));
        toast.success("Banner uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };
 
  const handlePackageImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPackageImage(reader.result);
        toast.success("Package image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const isLocationSelected =
    selectedCountries.length > 0 &&
    selectedStates.length > 0 &&
    selectedClusters.length > 0 &&
    selectedDistricts.length > 0;

  const advancedTotal = advancedOptions.reduce((acc, opt) => acc + (opt.enabled ? (opt.price || 0) : 0), 0);
  const annualSavings = annualTotal * unitPrice;
  
  // Advanced Payback Calculation
  let total25YearSavings = 0;
  let currentYearSavings = annualSavings;
  let calculatedPayback = 0;
  let cumulative = 0;
  
  for (let i = 1; i <= 25; i++) {
    cumulative += currentYearSavings;
    total25YearSavings += currentYearSavings;
    if (calculatedPayback === 0 && cumulative >= pricingData.netCost) {
      // Linear interpolation for more accurate payback month if needed, but keeping it simple for now
      calculatedPayback = i - 1 + (pricingData.netCost - (cumulative - currentYearSavings)) / currentYearSavings;
    }
    currentYearSavings = currentYearSavings * (1 + inflationRate - degradationRate);
  }

  const paybackPeriod = calculatedPayback || (annualSavings > 0 ? (pricingData.netCost / annualSavings) : 0);
  const savings25Year = total25YearSavings;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <nav className="bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-bold text-gray-800">Quote Settings</h1>
        </nav>
      </div>

      {/* Location Selection Module */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-4 font-bold flex items-center gap-2">
          <MapPin size={20} />
          <span>Location Selection</span>
        </div>
        <div className="p-8 space-y-10">

          {/* ── Country Selection ────────────────────── */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                Select Country
                {selectedCountries.length > 0 && (
                  <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black">
                    {selectedCountries.includes('all') ? 'All' : selectedCountries.length} selected
                  </span>
                )}
              </h3>
              <button
                onClick={() => selectAllLocations(setSelectedCountries, countries)}
                className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
              >
                {countries.every(c => selectedCountries.includes(c._id)) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[{ _id: 'all', name: 'All Countries', code: 'ALL' }, ...countries].map((c, idx) => {
                const isActive = selectedCountries.includes(c._id);
                return (
                  <button
                    key={c._id || idx}
                    onClick={() => toggleLocation(setSelectedCountries, c._id, countries)}
                    className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100/50 ring-2 ring-blue-200'
                        : 'border-gray-100 bg-white hover:border-blue-200'
                    }`}
                  >
                    {getQuoteCount('country', c._id) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md z-10">
                        {getQuoteCount('country', c._id)} CFG
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute top-2 left-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow">
                        <CheckCircle size={10} className="text-white" />
                      </span>
                    )}
                    <span className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{c.name}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{c.code || (c._id === 'all' ? 'ALL' : 'IN')}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── State Selection ─────────────────────── */}
          {selectedCountries.length > 0 && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                  Select State
                  {selectedStates.length > 0 && (
                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black">
                      {selectedStates.includes('all') ? 'All' : selectedStates.length} selected
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => selectAllLocations(setSelectedStates, states)}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
                >
                  {states.every(s => selectedStates.includes(s._id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[{ _id: 'all', name: 'All States', code: 'ALL' }, ...states].map((s, idx) => {
                  const isActive = selectedStates.includes(s._id);
                  return (
                    <button
                      key={s._id || idx}
                      onClick={() => toggleLocation(setSelectedStates, s._id, states)}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100/50 ring-2 ring-blue-200'
                          : 'border-gray-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      {getQuoteCount('state', s._id) > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md z-10">
                          {getQuoteCount('state', s._id)} CFG
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute top-2 left-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow">
                          <CheckCircle size={10} className="text-white" />
                        </span>
                      )}
                      <span className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{s.name}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {s.code || (s._id === 'all' ? 'ALL' : (s.name ? s.name.substring(0, 2).toUpperCase() : 'ST'))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Cluster Selection ───────────────────── */}
          {selectedStates.length > 0 && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                  Select Cluster
                  {selectedClusters.length > 0 && (
                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black">
                      {selectedClusters.includes('all') ? 'All' : selectedClusters.length} selected
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => selectAllLocations(setSelectedClusters, clusters)}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
                >
                  {clusters.every(cl => selectedClusters.includes(cl._id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[{ _id: 'all', name: 'All Clusters', code: 'ALL' }, ...clusters].map((cl, idx) => {
                  const isActive = selectedClusters.includes(cl._id);
                  return (
                    <button
                      key={cl._id || idx}
                      onClick={() => toggleLocation(setSelectedClusters, cl._id, clusters)}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100/50 ring-2 ring-blue-200'
                          : 'border-gray-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      {getQuoteCount('cluster', cl._id) > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md z-10">
                          {getQuoteCount('cluster', cl._id)} CFG
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute top-2 left-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow">
                          <CheckCircle size={10} className="text-white" />
                        </span>
                      )}
                      <span className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{cl.name}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{cl.code || (cl._id === 'all' ? 'ALL' : 'CL')}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── District Selection ──────────────────── */}
          {selectedClusters.length > 0 && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                  Select District
                  {selectedDistricts.length > 0 && (
                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black">
                      {selectedDistricts.includes('all') ? 'All' : selectedDistricts.length} selected
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => selectAllLocations(setSelectedDistricts, districts)}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
                >
                  {districts.every(d => selectedDistricts.includes(d._id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[{ _id: 'all', name: 'All Districts', code: 'ALL' }, ...districts].map((d, idx) => {
                  const isActive = selectedDistricts.includes(d._id);
                  return (
                    <button
                      key={d._id || idx}
                      onClick={() => toggleLocation(setSelectedDistricts, d._id, districts)}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100/50 ring-2 ring-blue-200'
                          : 'border-gray-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      {getQuoteCount('district', d._id) > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md z-10">
                          {getQuoteCount('district', d._id)} CFG
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute top-2 left-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow">
                          <CheckCircle size={10} className="text-white" />
                        </span>
                      )}
                      <span className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{d.name}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{d.code || (d._id === 'all' ? 'ALL' : 'DT')}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {!isLocationSelected && (
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-200 text-sm font-bold animate-pulse justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              SELECT AT LEAST ONE COUNTRY · STATE · CLUSTER · DISTRICT TO UNLOCK
            </div>
          )}
        </div>
      </div>

      {!isLocationSelected ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-4 opacity-50 grayscale">
          <div className="p-6 bg-gray-50 rounded-full ring-8 ring-gray-50/50">
            <MapPin size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-400">Quote Settings Locked</h2>
          <p className="text-gray-400 max-w-xs leading-relaxed font-medium">Please complete the location selection above to unlock and configure quote settings for a specific region.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Left Column - Settings */}
          <div className="lg:w-7/12">
            {/* Targeting Configuration */}
            <AccordionSection
              title={editingId ? 'Updating Configuration' : 'Targeting Configuration'}
              section="targeting"
              isOpen={openSections.targeting}
              onToggle={toggleSection}
              icon={MapPin}
              badge={[
                selectedCountries.includes('all') ? 'All Countries' : countries.filter(c => selectedCountries.includes(c._id)).map(c => c.name).join(', ') || '-',
                selectedStates.includes('all') ? 'All States' : states.filter(s => selectedStates.includes(s._id)).map(s => s.name).join(', ') || '-',
                selectedClusters.includes('all') ? 'All Clusters' : clusters.filter(cl => selectedClusters.includes(cl._id)).map(cl => cl.name).join(', ') || '-',
                selectedDistricts.includes('all') ? 'All Districts' : districts.filter(d => selectedDistricts.includes(d._id)).map(d => d.name).join(', ') || '-'
              ].join(' / ')}
            >
               {editingId && (
                <div className="flex justify-end mb-6">
                   <button 
                     onClick={() => { setEditingId(null); resetForm(); }} 
                     className="text-[10px] bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black uppercase shadow-sm active:scale-95 transition-all flex items-center gap-2 border border-red-100 hover:bg-red-600 hover:text-white"
                   >
                     <X size={14} />
                     Cancel Edit Mode
                   </button>
                </div>
              )}
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <MultiSelectDropdown 
                    label="Categories"
                    options={categories}
                    selected={filters.categories}
                    onToggle={(val) => toggleSelection((newArr) => setFilters(prev => ({ ...prev, categories: newArr })), val, filters.categories)}
                    colorClass="blue"
                  />
                  <MultiSelectDropdown 
                    label="Sub Categories"
                    options={subcategories}
                    selected={filters.subCategories}
                    onToggle={(val) => toggleSelection((newArr) => setFilters(prev => ({ ...prev, subCategories: newArr })), val, filters.subCategories)}
                    colorClass="indigo"
                  />
                  <MultiSelectDropdown 
                    label="Project Types"
                    options={projectTypes}
                    selected={filters.projectTypes}
                    onToggle={(val) => toggleSelection((newArr) => setFilters(prev => ({ ...prev, projectTypes: newArr })), val, filters.projectTypes)}
                    colorClass="emerald"
                  />
                  <MultiSelectDropdown 
                    label="Sub Proj Types"
                    options={subProjectTypes}
                    selected={filters.subProjectTypes}
                    onToggle={(val) => toggleSelection((newArr) => setFilters(prev => ({ ...prev, subProjectTypes: newArr })), val, filters.subProjectTypes)}
                    colorClass="amber"
                  />
                </div>

                {/* Selections Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 items-stretch">
                  {/* Quote Type */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Quote Types</label>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {quoteTypes.map(type => (
                        <button
                          key={type}
                          className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all duration-200 text-[10px] font-bold shadow-sm ${quoteTypesSelected.includes(type) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'}`}
                          onClick={() => toggleSelection(setQuoteTypesSelected, type, quoteTypesSelected)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kit Type */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Solution Types</label>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {['Combo Kit', 'Customised Kit'].map(type => (
                        <button
                          key={type}
                          className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all duration-200 text-[10px] font-bold shadow-sm ${kitTypesSelected.includes(type) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'}`}
                          onClick={() => toggleSelection(setKitTypesSelected, type, kitTypesSelected)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Finance Mode */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Finance Modes</label>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {['Cash', 'Loan', 'EMI'].map(type => (
                        <button
                          key={type}
                          className={`flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-xl border-2 transition-all duration-200 text-[10px] font-bold shadow-sm ${paymentModesSelected.includes(type) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200'}`}
                          onClick={() => toggleSelection(setPaymentModesSelected, type, paymentModesSelected)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Partner Type */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Partner Types</label>
                    <div className="flex-1 flex flex-wrap gap-1 content-center justify-center">
                      {partnerTypes.map((type, idx) => {
                         const name = type.name || type;
                         return (
                           <button
                             key={idx}
                             onClick={() => toggleSelection(setPartnerTypesSelected, name, partnerTypesSelected)}
                             className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${partnerTypesSelected.includes(name) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-100'}`}
                           >
                             {name}
                           </button>
                         );
                       })}
                    </div>
                  </div>
                </div>

                {/* Specific Kit Selection */}
                {kitTypesSelected.length > 0 && (
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-8 overflow-hidden group">
                    <div className="flex items-center justify-between mb-5 px-1">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Step 2: Specific Selection</label>
                        <span className="text-xs font-black text-gray-800 uppercase tracking-tight">Available Configurations</span>
                      </div>
                      {kitLoading && (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Fetching Kits...</span>
                        </div>
                      )}
                    </div>
                    
                    {availableKits.length === 0 && !kitLoading ? (
                      <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Zap size={18} className="text-gray-300" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No kits found for selected solution types</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {availableKits.map(kit => {
                          const isSelected = selectedKitIds.includes(kit._id);
                          return (
                            <button
                              key={kit._id}
                              onClick={() => handleKitSelect(kit)}
                              className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50 shadow-indigo-100/50 shadow-lg ring-4 ring-indigo-50'
                                  : 'border-white bg-white hover:border-indigo-200 shadow-sm'
                              } group/kit h-full min-h-[90px]`}
                            >
                              <span className={`text-[11px] font-black text-center leading-tight mb-2 transition-colors ${isSelected ? 'text-indigo-700' : 'text-gray-700 group-hover/kit:text-indigo-600'}`}>
                                {kit.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                                  kit.type === 'Combo Kit' ? 'bg-blue-600/10 text-blue-600' : 'bg-emerald-600/10 text-emerald-600'
                                } shadow-sm`}>
                                  {kit.type}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 border-2 border-white animate-in zoom-in duration-300">
                                  <CheckCircle size={14} className="text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Plan Type Selection */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border-2 border-dashed border-gray-200 mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Select Plan Types
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {planTypes.map((type, idx) => (
                      <button
                        key={idx}
                        className={`relative px-4 py-5 rounded-xl border-2 transition-all duration-300 text-[11px] font-black flex flex-col items-center justify-center gap-2 shadow-sm uppercase tracking-wider ${planTypesSelected.includes(type) ? 'bg-blue-600 text-white border-blue-600 scale-[1.05] z-10 shadow-blue-200 shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-400 hover:bg-blue-50/50'}`}
                        onClick={() => toggleSelection(setPlanTypesSelected, type, planTypesSelected)}
                      >
                        {planTypesSelected.includes(type) && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

            </AccordionSection>

            {/* Package Media Configuration */}
            <AccordionSection
              title="Package Media Configuration"
              section="media"
              isOpen={openSections.media}
              onToggle={toggleSection}
              icon={Image}
              badge="Branding & Visual Assets"
            >
                  
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 group/img relative">
                      {packageImage ? (
                        <>
                          <img src={packageImage} alt="Preview" className="w-full h-full object-contain p-2" />
                          <button 
                            onClick={() => setPackageImage(null)}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <Image size={24} className="mb-1" />
                          <span className="text-[8px] font-black uppercase">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
                        Upload a professional product image to be displayed in the commercial preview section.
                      </p>
                      <input 
                        type="file" 
                        ref={packageImageInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handlePackageImageUpload}
                      />
                      <button 
                        onClick={() => packageImageInputRef.current.click()}
                        className="w-full bg-indigo-50 text-indigo-600 border-2 border-indigo-100 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Upload size={14} />
                        {packageImage ? 'Change Image' : 'Upload Package Image'}
                      </button>
                    </div>
                  </div>

            </AccordionSection>

            {/* Solar BOM Configuration */}
            <AccordionSection
              title="Solar BOM Configuration"
              section="bom"
              isOpen={openSections.bom}
              onToggle={toggleSection}
              icon={Settings}
              badge="Material Specifications & Tables"
            >

              {selectedKitIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                    <Settings size={32} className="text-gray-300" />
                  </div>
                  <h4 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-2">BOM Configuration Locked</h4>
                  <p className="text-xs font-bold text-gray-400 max-w-xs mx-auto mb-6">Please select a specific kit or configuration in the Targeting section to unlock and load material specifications.</p>
                  <button 
                    onClick={() => {
                      setOpenSections(prev => ({ ...prev, targeting: true }));
                      // Optional scroll to targeting
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Select Kit Now
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  {/* BOM Material Items */}
                  <div className="mb-8">
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Material Specifications</label>
                    <div className="space-y-4">
                      {bomData.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            className="bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:bg-white focus:border-blue-300 outline-none transition-all"
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...bomData.items];
                              newItems[idx].label = e.target.value;
                              setBomData({...bomData, items: newItems});
                            }}
                          />
                          <input 
                            type="text" 
                            className="bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:bg-white focus:border-blue-300 outline-none transition-all"
                            value={item.value}
                            onChange={(e) => {
                              const newItems = [...bomData.items];
                              newItems[idx].value = e.target.value;
                              setBomData({...bomData, items: newItems});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GI Pipe Configuration */}
                  <div className="mb-8">
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">GI Pipe Specifications Table</label>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-4 gap-2 text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <span>Panels</span>
                        <span>DC KW</span>
                        <span>60x40 Pipe</span>
                        <span>40x40 Pipe</span>
                      </div>
                      {bomData.pipes.map((pipe, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2">
                          <input 
                            type="text" 
                            className="bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-[10px] font-black text-gray-700 focus:border-blue-400 outline-none text-center"
                            value={pipe.panels}
                            onChange={(e) => {
                              const newPipes = [...bomData.pipes];
                              newPipes[idx].panels = e.target.value;
                              setBomData({...bomData, pipes: newPipes});
                            }}
                          />
                          <input 
                            type="text" 
                            className="bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-[10px] font-black text-gray-700 focus:border-blue-400 outline-none text-center"
                            value={pipe.kw}
                            onChange={(e) => {
                              const newPipes = [...bomData.pipes];
                              newPipes[idx].kw = e.target.value;
                              setBomData({...bomData, pipes: newPipes});
                            }}
                          />
                          <input 
                            type="text" 
                            className="bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-[10px] font-black text-gray-700 focus:border-blue-400 outline-none text-center"
                            value={pipe.size1}
                            onChange={(e) => {
                              const newPipes = [...bomData.pipes];
                              newPipes[idx].size1 = e.target.value;
                              setBomData({...bomData, pipes: newPipes});
                            }}
                          />
                          <input 
                            type="text" 
                            className="bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-[10px] font-black text-gray-700 focus:border-blue-400 outline-none text-center"
                            value={pipe.size2}
                            onChange={(e) => {
                              const newPipes = [...bomData.pipes];
                              newPipes[idx].size2 = e.target.value;
                              setBomData({...bomData, pipes: newPipes});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 px-1">Structure Height Note</label>
                    <textarea 
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-4 py-3 text-[10px] font-bold text-gray-600 focus:bg-white focus:border-blue-300 outline-none transition-all resize-none h-20"
                      value={bomData.heightNote}
                      onChange={(e) => setBomData({...bomData, heightNote: e.target.value})}
                    />
                  </div>
                </div>
              )}

            </AccordionSection>

            {/* Performance & ROI Management */}
            <AccordionSection
              title="Performance & ROI Management"
              section="finance"
              isOpen={openSections.finance}
              onToggle={toggleSection}
              icon={Calculator}
              badge="Financials & Generation Calculations"
            >
                <div className="bg-emerald-50/30 border-2 border-emerald-100 rounded-3xl p-8 mb-8 relative overflow-hidden group shadow-sm transition-all hover:border-emerald-200">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest group-hover:scale-110 transition-transform">ROI Settings</div>
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="text-sm font-black text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                       <Calculator size={16} className="text-emerald-600" />
                       Financial Performance Management
                    </h5>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 px-1">Unit Selling Price (₹/Unit)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                        <input 
                          type="number"
                          step="0.1"
                          className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl pl-8 pr-4 py-3.5 text-sm font-black text-gray-800 focus:bg-white focus:border-emerald-400 outline-none transition-all shadow-inner"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 px-1">Total System Cost Adjustment</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">₹</span>
                        <input 
                          type="number"
                          className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-8 pr-4 py-3.5 text-sm font-black text-gray-800 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-inner"
                          value={pricingData.totalCost}
                          onChange={(e) => setPricingData({...pricingData, totalCost: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 px-1">Electricity Inflation (% Yearly)</label>
                      <input 
                        type="number"
                        step="0.1"
                        className="w-full bg-amber-50/50 border border-amber-100 rounded-2xl px-4 py-3.5 text-sm font-black text-gray-800 focus:bg-white focus:border-amber-400 outline-none transition-all shadow-inner"
                        value={inflationRate * 100}
                        onChange={(e) => setInflationRate(parseFloat(e.target.value) / 100 || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 col-span-1 md:col-span-2 mt-4">
                    <div>
                      <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 px-1">MNRE Subsidy Adjustment</label>
                      <input 
                        type="number"
                        className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl px-4 py-3 text-sm font-black text-gray-800 focus:bg-white focus:border-emerald-400 outline-none transition-all"
                        value={pricingData.mnreSubsidy}
                        onChange={(e) => setPricingData({...pricingData, mnreSubsidy: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 px-1">State Subsidy Adjustment</label>
                      <input 
                        type="number"
                        className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl px-4 py-3 text-sm font-black text-gray-800 focus:bg-white focus:border-emerald-400 outline-none transition-all"
                        value={pricingData.stateSubsidy}
                        onChange={(e) => setPricingData({...pricingData, stateSubsidy: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 px-1">Additional Charges</label>
                      <input 
                        type="number"
                        className="w-full bg-red-50/30 border border-red-100 rounded-2xl px-4 py-3 text-sm font-black text-gray-800 focus:bg-white focus:border-red-400 outline-none transition-all"
                        value={pricingData.additionalCharges}
                        onChange={(e) => setPricingData({...pricingData, additionalCharges: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 px-1">Panel Degradation (% Yearly)</label>
                    <input 
                      type="number"
                        step="0.1"
                        className="w-full bg-red-50/50 border border-red-100 rounded-2xl px-4 py-3.5 text-sm font-black text-gray-800 focus:bg-white focus:border-red-400 outline-none transition-all shadow-inner"
                        value={degradationRate * 100}
                        onChange={(e) => setDegradationRate(parseFloat(e.target.value) / 100 || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-wide">Calculated Annual Generation</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Total Yearly Potential</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-blue-600">{annualTotal.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-blue-300 ml-1.5 uppercase">Units</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-between group overflow-hidden relative ring-4 ring-blue-50">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-100 transition-opacity duration-500" />
                      <div className="flex flex-col relative z-10 w-full">
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-2">Net Project Cost (Editable)</span>
                        <div className="flex items-center">
                          <span className="text-xl font-black text-white mr-1.5">₹</span>
                          <input 
                            type="number"
                            className="bg-transparent border-none outline-none text-xl font-black text-white w-full focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={pricingData.netCost}
                            onChange={(e) => setPricingData({...pricingData, netCost: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <span className="text-[8px] font-black text-white/40 uppercase mt-1 leading-none tracking-tight">Direct Manual Override Enabled</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/30 border-2 border-blue-100 rounded-3xl p-8 relative overflow-hidden group shadow-sm transition-all hover:border-blue-200">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest group-hover:scale-110 transition-transform">Generation Settings</div>
                    {/* Formula Note */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                         <p className="text-sm font-bold text-blue-700">
                           Monthly Units = kW × Solar Insolation × 0.8
                         </p>
                         <p className="text-xs text-blue-600 mt-1 uppercase font-black tracking-widest">
                           Core Generation Algorithm
                         </p>
                       </div>
                       
                       <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 px-1">System Capacity (Project kW)</label>
                          <div className="relative">
                             <input 
                               type="number"
                               step="0.1"
                               className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-2.5 text-sm font-black text-gray-800 focus:bg-white focus:border-blue-400 outline-none transition-all"
                               value={solarSettings.projectKW}
                               onChange={(e) => setSolarSettings({ ...solarSettings, projectKW: parseFloat(e.target.value) || 0 })}
                               placeholder="Enter kW (e.g. 5)"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase">kW</span>
                          </div>
                       </div>
                    </div>

                    {/* Monthly Inputs */}
                    <h5 className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-4 ml-1">Enter Monthly Solar Isolation</h5>

                    <div className="overflow-x-auto mb-4 bg-white rounded-2xl border border-blue-50 shadow-sm">
                      <table className="min-w-full">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Month</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Solar Isolation</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Generation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {getCalculatedMonthlyData().map((month, index) => (
                            <tr key={month.month} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-4 py-3 text-center text-xs font-black text-gray-500">{month.month}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  className="w-full bg-gray-50 border border-transparent rounded-lg px-2 py-1.5 text-xs font-black text-gray-700 text-center focus:bg-white focus:border-blue-300 outline-none transition-all"
                                  value={monthlyIsolation[index].isolation}
                                  onChange={(e) => {
                                    const newIsolation = [...monthlyIsolation];
                                    newIsolation[index] = {
                                      ...newIsolation[index],
                                      isolation: parseFloat(e.target.value) || 0
                                    };
                                    setMonthlyIsolation(newIsolation);
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-xs font-bold text-blue-600">{month.total.toLocaleString()} Units</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Monthly Multipliers / Isolation */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest">Monthly Isolation Multipliers</label>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Adjust graph curve</span>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {monthlyIsolation.map((m, idx) => (
                          <div key={m.month} className="group/iso">
                            <label className="block text-[8px] font-black text-gray-400 uppercase text-center mb-1 group-hover/iso:text-blue-500 transition-colors">{m.month.substring(0, 3)}</label>
                            <input 
                              type="number"
                              step="0.01"
                              className="w-full bg-gray-50 border border-transparent rounded-xl px-2 py-2 text-[10px] font-black text-gray-700 text-center focus:bg-white focus:border-blue-300 outline-none transition-all shadow-sm"
                              value={m.isolation}
                              onChange={(e) => {
                                const newIso = [...monthlyIsolation];
                                newIso[idx].isolation = parseFloat(e.target.value) || 0;
                                setMonthlyIsolation(newIso);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center mt-8">
                      <button
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-700 flex items-center gap-2 mx-auto text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
                        onClick={calculateGeneration}
                      >
                        <Calculator size={18} />
                        Trigger Recalculation
                      </button>
                    </div>
                </div>

            </AccordionSection>

            {/* Quote Configuration & Layout */}
            <AccordionSection
              title="Quote Layout & Visuals"
              section="pages"
              isOpen={openSections.pages}
              onToggle={toggleSection}
              icon={FileText}
              badge="Pages selection & Visual Appearance"
            >
                <div className="mb-10">
                                    <div className="flex flex-col mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h5 className="text-lg font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                           <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                           Prepare Quote Pages
                        </h5>
                        <p className="text-xs font-bold text-gray-400 ml-3.5 mt-0.5">
                          Select which pages you want to include in the final quote PDF.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedPages(pagesOptions.map(p => p.value))}
                          className="flex-1 md:flex-none text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest active:scale-95 shadow-sm"
                        >
                          Select All
                        </button>
                        <button 
                          onClick={() => setSelectedPages(['Front Page'])}
                          className="flex-1 md:flex-none text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest active:scale-95 shadow-sm"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={pagesOptions.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pagesOptions.map(page => (
                          <SortablePageCard
                            key={page.id}
                            page={page}
                            selectedPages={selectedPages}
                            setSelectedPages={setSelectedPages}
                            quoteType={quoteTypesSelected[0]}
                            setActiveEditingPage={setActiveEditingPage}
                            setTempPageConfig={setTempPageConfig}
                            setIsPageModalOpen={setIsPageModalOpen}
                            pageConfigs={pageConfigs}
                            onDelete={handleDeletePage}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add Page Input */}
                  <div className="flex gap-2 items-center bg-blue-50/30 p-4 rounded-2xl border-2 border-dashed border-blue-100 mt-6 group hover:border-blue-300 transition-all">
                    <div className="flex-1 relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-hover:scale-110 transition-transform">
                        <FileText size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Add dynamic custom page name..."
                        className="w-full bg-white border border-blue-100 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-bold text-gray-700 shadow-sm"
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPage()}
                      />
                    </div>
                    <button
                      onClick={handleAddPage}
                      className="bg-blue-600 text-white h-[50px] px-6 rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 uppercase tracking-wider"
                    >
                      <span>Add Page</span>
                    </button>
                  </div>
                </div>

            </AccordionSection>

            {/* Advanced Add-ons */}
            {/* Visual Overrides */}
            <AccordionSection
              title="Visual Appearance Priorities"
              section="addons"
              isOpen={openSections.addons}
              onToggle={toggleSection}
              icon={Zap}
              badge="Brand Colors and Sequence"
            >
                  <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl p-6 mt-2">
                  
                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Visual Appearance Overrides</h5>
                    <div className="flex flex-col gap-3">
                      {/* Brand Color Override */}
                      <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200 group">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="brandColorToggle"
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer"
                            checked={colorSettings.brandColor}
                            onChange={(e) => setColorSettings({ ...colorSettings, brandColor: e.target.checked })}
                          />
                          <label htmlFor="brandColorToggle" className="text-[10px] font-black text-gray-600 uppercase tracking-tight cursor-pointer group-hover:text-blue-600 transition-colors">Brand Color</label>
                        </div>
                        {colorSettings.brandColor && (
                          <div className="mt-4 pl-8 border-t border-gray-50 pt-4 animate-in slide-in-from-top-2 duration-300">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Brand Color</p>
                             <div className="flex flex-wrap gap-2.5 items-center">
                                {['#2563eb', '#dc2626', '#16a34a', '#8b5cf6', '#ea580c', '#000000'].map(c => (
                                  <button 
                                    key={c}
                                    onClick={() => setFrontPageSettings(prev => ({
                                      ...prev,
                                      styling: { ...prev.styling, themeColor: c }
                                    }))}
                                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${frontPageSettings.styling.themeColor === c ? 'border-white ring-2 ring-blue-500 shadow-lg' : 'border-transparent shadow-sm'}`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                <div className="relative group/color">
                                  <input 
                                    type="color" 
                                    value={frontPageSettings.styling.themeColor} 
                                    onChange={(e) => setFrontPageSettings(prev => ({
                                      ...prev,
                                      styling: { ...prev.styling, themeColor: e.target.value }
                                    }))}
                                    className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                                  />
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Custom Color</div>
                                </div>
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Background Color Override */}
                      <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200 group">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="bgColorToggle"
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer"
                            checked={colorSettings.backgroundColor}
                            onChange={(e) => setColorSettings({ ...colorSettings, backgroundColor: e.target.checked })}
                          />
                          <label htmlFor="bgColorToggle" className="text-[10px] font-black text-gray-600 uppercase tracking-tight cursor-pointer group-hover:text-blue-600 transition-colors">Background Color</label>
                        </div>
                        {colorSettings.backgroundColor && (
                          <div className="mt-4 pl-8 border-t border-gray-50 pt-4 animate-in slide-in-from-top-2 duration-300">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Background Color</p>
                             <div className="flex flex-wrap gap-2.5 items-center">
                                {['#ffffff', '#f8fafc', '#f1f5f9', '#eff6ff', '#fdf2f8', '#0f172a'].map(c => (
                                  <button 
                                    key={c}
                                    onClick={() => setFrontPageSettings(prev => ({
                                      ...prev,
                                      styling: { ...prev.styling, bgColor: c }
                                    }))}
                                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${frontPageSettings.styling.bgColor === c ? 'border-white ring-2 ring-blue-500 shadow-lg' : 'border-gray-200 shadow-sm'}`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                <div className="relative group/color">
                                  <input 
                                    type="color" 
                                    value={frontPageSettings.styling.bgColor || '#ffffff'} 
                                    onChange={(e) => setFrontPageSettings(prev => ({
                                      ...prev,
                                      styling: { ...prev.styling, bgColor: e.target.value }
                                    }))}
                                    className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                                  />
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Custom Color</div>
                                </div>
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Font Sizes Override */}
                      <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200 group">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="fontSizeToggle"
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer"
                            checked={colorSettings.fontSize}
                            onChange={(e) => setColorSettings({ ...colorSettings, fontSize: e.target.checked })}
                          />
                          <label htmlFor="fontSizeToggle" className="text-[10px] font-black text-gray-600 uppercase tracking-tight cursor-pointer group-hover:text-blue-600 transition-colors">Font Sizes</label>
                        </div>
                        {colorSettings.fontSize && (
                          <div className="mt-4 pl-8 border-t border-gray-50 pt-4 animate-in slide-in-from-top-2 duration-300">
                             <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {[
                                  { label: 'Header Size', key: 'headerFontSize', min: 12, max: 48 },
                                  { label: 'Footer Size', key: 'footerFontSize', min: 6, max: 20 },
                                  { label: 'Section Title', key: 'sectionTitleFontSize', min: 12, max: 36 },
                                  { label: 'Content Size', key: 'contentFontSize', min: 8, max: 24 }
                                ].map((item) => (
                                  <div key={item.key}>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">{item.label}</label>
                                    <div className="flex items-center gap-3">
                                      <input 
                                        type="range"
                                        min={item.min}
                                        max={item.max}
                                        value={frontPageSettings.styling[item.key] || item.min}
                                        onChange={(e) => setFrontPageSettings(prev => ({
                                          ...prev,
                                          styling: { ...prev.styling, [item.key]: parseInt(e.target.value) }
                                        }))}
                                        className="flex-1 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                      />
                                      <span className="text-[10px] font-black text-blue-600 w-7 text-right">{frontPageSettings.styling[item.key]}</span>
                                    </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Page Sequence Interactive Manager */}
                      <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200 group">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            id="pageSequenceToggle"
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer"
                            checked={colorSettings.pageSequence}
                            onChange={(e) => setColorSettings({ ...colorSettings, pageSequence: e.target.checked })}
                          />
                          <label htmlFor="pageSequenceToggle" className="text-[10px] font-black text-gray-600 uppercase tracking-tight cursor-pointer group-hover:text-blue-600 transition-colors">Page Sequence (Interactive)</label>
                          {colorSettings.pageSequence && (
                            <span className="ml-auto text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full animate-pulse">ACTIVE MANAGER</span>
                          )}
                        </div>

                        {colorSettings.pageSequence && (
                          <div className="mt-4 border-t border-gray-50 pt-6 animate-in slide-in-from-top-4 duration-500">
                             <div className="flex items-center justify-between mb-4 px-1">
                                <h6 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Manage Quote Sequence</h6>
                                <div className="flex gap-2">
                                   <button 
                                     onClick={() => setSelectedPages(pagesOptions.map(p => p.value))}
                                     className="text-[8px] font-black text-blue-600 hover:underline uppercase"
                                   >
                                     Enable All
                                   </button>
                                   <button 
                                     onClick={() => setSelectedPages(['Front Page'])}
                                     className="text-[8px] font-black text-gray-400 hover:underline uppercase"
                                   >
                                     Disable All
                                   </button>
                                </div>
                             </div>

                             <DndContext
                               sensors={sensors}
                               collisionDetection={closestCenter}
                               onDragEnd={handleDragEnd}
                             >
                               <SortableContext
                                 items={pagesOptions.map(p => p.id)}
                                 strategy={verticalListSortingStrategy}
                               >
                                 <div className="space-y-1">
                                   {pagesOptions.map((page, idx) => (
                                     <SortableSequenceCard
                                       key={page.id}
                                       page={page}
                                       index={idx}
                                       total={pagesOptions.length}
                                       selectedPages={selectedPages}
                                       setSelectedPages={setSelectedPages}
                                       onMoveUp={handleMoveUp}
                                       onMoveDown={handleMoveDown}
                                     />
                                   ))}
                                 </div>
                               </SortableContext>
                             </DndContext>

                             <p className="mt-4 text-[9px] font-bold text-gray-400 italic text-center leading-relaxed">
                               Drag cards or use arrows to reorder. Quote Preview will update in real-time.
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

            </AccordionSection>

            {/* Field Management */}
            <AccordionSection
              title="Quote Field Management"
              section="fields"
              isOpen={openSections.fields}
              onToggle={toggleSection}
              icon={CheckCircle}
              badge="Enable/Disable specific quote fields"
            >
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const allTrue = {};
                          Object.keys(fieldSettings).forEach(k => allTrue[k] = true);
                          setFieldSettings(allTrue);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors uppercase"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => {
                          const allFalse = {};
                          Object.keys(fieldSettings).forEach(k => allFalse[k] = false);
                          setFieldSettings(allFalse);
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:bg-gray-50 px-2 py-1 rounded transition-colors uppercase"
                      >
                        Deselect All
                      </button>
                    </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                    {[
                      { key: 'proposalNo', label: 'Proposal No' },
                      { key: 'customerName', label: 'Customer Name' },
                      { key: 'kwRequired', label: 'KW Required' },
                      { key: 'residentialCommercial', label: 'Residential / Commercial' },
                      { key: 'city', label: 'City' },
                      { key: 'preparedBy', label: 'Prepared By' },
                      { key: 'date', label: 'Date' },
                      { key: 'validUpto', label: 'Valid Upto' },
                      { key: 'quoteType', label: 'Quote Type' },
                      { key: 'productImage', label: 'Product Image' },
                      { key: 'totalCost', label: 'Total Cost' },
                      { key: 'govtMnreSubsidy', label: 'Govt MNRE Subsidy' },
                      { key: 'govtStateSubsidy', label: 'Govt State Subsidy' },
                      { key: 'additionalCharges', label: 'Additional Charges' },
                      { key: 'finalTotal', label: 'Final Total' },
                      { key: 'kitType', label: 'Solution Type' },
                      { key: 'paymentMode', label: 'Finance Mode' },
                      { key: 'generationSummary', label: 'Power Generation' }
                    ].map((field) => (
                      <label key={field.key} className="flex items-center group cursor-pointer">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                            checked={fieldSettings[field.key]}
                            onChange={(e) => setFieldSettings({ ...fieldSettings, [field.key]: e.target.checked })}
                          />
                          <div className={`h-5 w-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${fieldSettings[field.key] ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                            {fieldSettings[field.key] && <CheckCircle size={12} className="text-white" />}
                          </div>
                        </div>
                        <span className={`ml-3 text-xs font-bold transition-colors ${fieldSettings[field.key] ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}`}>
                          {field.label}
                        </span>
                      </label>
                    ))}
                  </div>
            </AccordionSection>

                {/* Save Button */}
                <div className="text-right">
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 ml-auto"
                    onClick={handleSaveQuote}
                  >
                    <Save size={18} />
                    {editingId ? 'Update & Save' : 'Save Quote'}
                  </button>
                </div>

            {/* Quote Summary Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 rounded-t-lg font-bold border-b">
                Quote Summary
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">#</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Proposal No</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Quote Type</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Category</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Sub Category</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Project Type</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Sub Project Type</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Partner Type</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Location</th>
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Plan Type</th>
                        {/* <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Quote Pages</th> */}
                        <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.filter(q => {
                        if (!summarySearch) return true;
                        const search = summarySearch.toLowerCase();
                        return (
                          (q.proposalNo || '').toLowerCase().includes(search) ||
                          (q.category || '').toLowerCase().includes(search) ||
                          (Array.isArray(q.categories) && q.categories.some(c => c.toLowerCase().includes(search))) ||
                          (q.district?.name || '').toLowerCase().includes(search) ||
                          (Array.isArray(q.districts) && q.districts.some(d => (d.name || d).toLowerCase().includes(search))) ||
                          (q.customerName || '').toLowerCase().includes(search)
                        );
                      }).map((quote, index) => (
                        <tr key={quote._id}>
                          <td className="border border-gray-300 px-4 py-3 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-[10px] font-black uppercase tracking-tighter" style={{ color: themeAccent }}>
                            {quote.proposalNo || '-'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${(quote.quoteTypes?.includes('Survey Quote') || quote.quoteType === 'Survey Quote') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {quote.quoteTypes?.join(', ') || quote.quoteType}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{quote.categories?.join(', ') || quote.category}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{quote.subCategories?.join(', ') || quote.subCategory}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{quote.projectTypes?.join(', ') || quote.projectType}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{quote.subProjectTypes?.join(', ') || quote.subProjectType}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-xs font-semibold text-blue-700">{quote.partnerTypes?.join(', ') || quote.partnerType}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                                {quote.states?.map(s => s.name || s).join(', ') || quote.state?.name || (states.find(s => s._id === (quote.state?._id || quote.state))?.name) || '-'}
                              </span>
                              <span className="text-[10px] font-bold text-gray-600">
                                {quote.districts?.map(d => d.name || d).join(', ') || quote.district?.name || (districts.find(d => d._id === (quote.district?._id || quote.district))?.name) || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                              {quote.planTypes?.join(', ') || quote.planType}
                            </span>
                          </td>
                          {/* <td className="border border-gray-300 px-4 py-3">{quote.pages || '-'}</td> */}
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                title="Download Quote PDF"
                                className="text-white p-1.5 rounded transition-colors"
                                style={{ backgroundColor: themeAccent }}
                                onClick={() => handleDownloadQuote(quote)}
                              >
                                <Download size={16} />
                              </button>
                              <button
                                title="Edit Quote"
                                className="bg-yellow-500 text-white p-1.5 rounded hover:bg-yellow-600 transition-colors"
                                onClick={() => handleEditQuote(quote)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                title="Delete Quote"
                                className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                                onClick={() => handleDeleteQuote(quote._id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {quotes.length === 0 && (
                        <tr>
                          <td colSpan="10" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                            {summarySearch ? 'No quotes matching your search' : 'No quotes saved yet'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:w-5/12">
            <div className="sticky top-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 font-bold border-b flex justify-between items-center">
                <span>Quote Preview</span>
                <button 
                  onClick={() => handleDownloadQuote(getCurrentQuoteForExport())}
                  className="text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  style={{ backgroundColor: themeAccent }}
                >
                  <Download size={14} /> PDF Preview
                </button>
              </div>

              <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                {/* Preview Content */}
                <div className="transform scale-90 origin-top">
                  {pagesOptions.filter(p => selectedPages.includes(p.value)).map((page, idx) => {
                    const pageName = page.value;
                    
                    if (pageName === 'Front Page') {
                      return (
                        <div key={page.id} className="pdf-page rounded-3xl overflow-hidden shadow-2xl mb-8 border border-gray-100" style={{ backgroundColor: themeBgColor }}>
                          {/* Hero Banner Section */}
                          <div className="relative h-64 w-full">
                            <img
                              src={pageConfigs['Front Page']?.media || "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                              alt="Solar Roof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center text-center px-6">
                              <h2 className="font-black text-white mb-1 uppercase tracking-tighter drop-shadow-lg" style={{ fontSize: headerFontSize }}>
                                {pageConfigs['Front Page']?.header || `${filters.category || 'Residential'} ${filters.projectType || '3 To 10 KW'}`}
                              </h2>
                              <h3 className="text-2xl font-black text-yellow-400 mb-2 uppercase tracking-wide drop-shadow-md">
                                ({filters.subProjectTypes?.join(', ') || filters.subProjectType || 'National Portal'})
                              </h3>
                              <h4 className="text-4xl font-extrabold text-white mb-2 tracking-[0.2em]">PROPOSAL</h4>
                              <p className="text-xs font-bold text-gray-200 tracking-widest uppercase border-t border-gray-400/50 pt-2 transition-all duration-300 hover:text-white">
                                {pageConfigs['Front Page']?.footer || 'SOLAR ENERGY FOR A BETTER TOMORROW'}
                              </p>
                            </div>
                          </div>

                          {/* Customer Info Section */}
                          <div className="p-10" style={{ backgroundColor: themeBgColor }}>
                            <div className="mb-10 text-center">
                               <h2 className="font-black text-gray-800 uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>
                                  {filters.category} {filters.projectType} ({filters.subProjectType}) 
                                  <span className="ml-2 transition-colors" style={{ color: themeAccent }}>Proposal</span>
                               </h2>
                                <div className="w-20 h-1 mx-auto mt-2 transition-all" style={{ backgroundColor: themeAccent }} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-6">
                                {fieldSettings.proposalNo && (
                                  <div className="group transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:opacity-80 transition-opacity">Proposal No</p>
                                    <p className="text-sm font-black border-b-2 border-transparent pb-1" style={{ color: themeAccent }}>
                                      {currentProposalNo || (
                                        `SK/${districts.find(d => selectedDistricts.includes(d._id))?.name?.substring(0, 3).toUpperCase() || 'GEN'}/${
                                          partnerTypesSelected[0]?.toUpperCase().includes('FRANCHISE') ? 'FR' : 
                                          partnerTypesSelected[0]?.toUpperCase().includes('CHANNEL') ? 'CP' : 'DL'
                                        }XXXX`
                                      )}
                                    </p>
                                  </div>
                                )}
                                {fieldSettings.customerName && (
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Name of Customer</p>
                                    <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>Valued Customer</p>
                                  </div>
                                )}
                                {fieldSettings.kwRequired && (
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">KW Required</p>
                                    <div className="flex items-center gap-3">
                                      <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>{solarSettings.projectKW} KW</p>
                                      {fieldSettings.paymentMode && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md border" style={{ color: themeAccent, backgroundColor: themeBgLight, borderColor: themeBgSemi }}>
                                          {paymentModesSelected.join(', ') || 'Cash'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-6">
                                 {fieldSettings.residentialCommercial && (
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Residential / Commercial</p>
                                    <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>{filters.category} {filters.projectType} ({filters.subProjectType})</p>
                                  </div>
                                )}
                                {fieldSettings.city && (
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">City</p>
                                    <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>
                                      {selectedDistricts.includes('all')
                                        ? 'All Districts'
                                        : districts.filter(d => selectedDistricts.includes(d._id)).map(d => d.name).join(', ') || 'District'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Footer Stats Section */}
                          <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50/50">
                            {fieldSettings.preparedBy && (
                              <div className="p-8 border-r border-gray-100">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prepared by</p>
                                 <p className="font-black text-gray-700 uppercase" style={{ fontSize: footerFontSize }}>{partnerTypesSelected.join(', ') || 'Demo'} User</p>
                              </div>
                            )}
                            {fieldSettings.date && (
                              <div className="p-8 border-r border-gray-100">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                 <p className="font-black text-gray-700" style={{ fontSize: footerFontSize }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              </div>
                            )}
                            {fieldSettings.validUpto && (
                              <div className="p-8">
                                 <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Valid Upto</p>
                                 <p className="font-black text-red-600 bg-red-100 px-3 py-1 rounded-full w-fit" style={{ fontSize: footerFontSize }}>
                                   {pageConfigs?.['Front Page']?.validUptoValue || '15'} Days
                                 </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (pageName === 'Commercial Page') {
                      return (
                        <div key={page.id} className="pdf-page mb-8 p-8 border-b border-gray-100 last:border-0 rounded-[2rem] shadow-xl" style={{ backgroundColor: themeBgColor }}>
                           <div className="flex justify-between items-center mb-6 border-b-4 pb-2" style={{ borderBottomColor: themeAccent }}>
                              <div>
                                 <h5 className="font-black uppercase tracking-tighter transition-colors" style={{ color: themeAccent, fontSize: sectionTitleFontSize }}>{quoteTypesSelected.join(', ') || 'Quote Type'}</h5>
                                 <p className="text-xs font-bold text-gray-500 uppercase">{kitTypesSelected.join(', ')}</p>
                              </div>
                              {fieldSettings.kitType && (
                                 <div className="text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all" style={{ backgroundColor: themeAccent }}>
                                    {kitTypesSelected.join(', ')}
                                 </div>
                              )}
                           </div>

                              <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto max-w-xl w-full" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)' }}>
                                 <table className="w-full border-collapse">
                                   <tbody>
                                     {[
                                       { key: 'showTotalCost', label: 'Total Cost', value: pricingData.totalCost },
                                       { key: 'showMnreSubsidy', label: 'Govt MNRE Subsidy', value: pricingData.mnreSubsidy },
                                       { key: 'showStateSubsidy', label: 'Govt State Subsidy', value: pricingData.stateSubsidy },
                                       { key: 'showAdditionalCharges', label: 'Additional Charges', value: pricingData.additionalCharges }
                                     ].map((row, i) => (pageConfigs['Commercial Page']?.visibility?.[row.key] !== false) && (
                                       <tr key={i} className="border-b border-gray-100 last:border-0">
                                         <td className="p-4 font-black text-gray-400 uppercase tracking-widest" style={{ fontSize: `calc(${contentFontSize} - 4px)` }}>{row.label}</td>
                                         <td className="p-4 font-black text-gray-700 text-right whitespace-nowrap leading-none" style={{ fontSize: contentFontSize }}>Rs. {row.value.toLocaleString()} /-</td>
                                       </tr>
                                     ))}
                                     {(pageConfigs['Commercial Page']?.visibility?.showNetCost !== false) && (
                                       <tr className="text-white transition-all shadow-inner" style={{ backgroundColor: themeAccent }}>
                                         <td className="p-4 text-[11px] font-black uppercase tracking-widest">Net Cost</td>
                                         <td className="p-4 text-xl font-black text-right whitespace-nowrap leading-none">Rs. {pricingData.netCost.toLocaleString()} /-</td>
                                       </tr>
                                     )}
                                   </tbody>
                                 </table>
                              </div>

                              {/* Package Image Below Pricing */}
                              <div className="text-center flex flex-col items-center mt-10 animate-in fade-in slide-in-from-top-4">
                                 <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-all" />
                                    <img
                                      src={packageImage || "https://img.icons8.com/illustrations/external-flaticons-lineal-color-flat-icons/256/external-solar-energy-ecology-flaticons-lineal-color-flat-icons-2.png"} 
                                      alt=""
                                      className="w-64 h-64 object-contain relative z-10 animate-fade-in"
                                    />
                                 </div>
                              </div>

                              {/* Live: Custom Sections from PageConfigDrawer */}
                              {(() => {
                                const commercialCfg = pageConfigs['Commercial Page'] || {};
                                const customSections = (commercialCfg.customSections || []).filter(
                                  s => (commercialCfg.visibility || {})[`custom_${s.id}`] !== false
                                );
                                if (customSections.length === 0) return null;
                                return (
                                  <div className="mt-8 space-y-3">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">Additional Sections</p>
                                    {customSections.map((s) => (
                                      <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{s.label}</span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                        <span className="text-[9px] font-black text-blue-400 bg-blue-50 px-2 py-0.5 rounded-full">Custom</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                        </div>
                      );
                    }

                    if (pageName === 'Financial Summary') {
                      return (
                        <div key={page.id} className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden shadow-xl mb-8 transition-colors">
                           <div className="px-8 py-4 text-white transition-all shadow-md" style={{ backgroundColor: themeAccent }}>
                              <h5 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Residential Solar BOM</h5>

                           </div>
                           <div className="p-8">
                               {(pageConfigs['Financial Summary']?.visibility?.showBomTable !== false) && (
                                 <table className="w-full border-collapse mb-8">
                                <tbody>
                                  {bomData.items.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                      <td className="py-3 font-black text-gray-400 uppercase tracking-widest" style={{ fontSize: `calc(${contentFontSize} - 2px)` }}>{row.label}</td>
                                      <td className="py-3 font-bold text-gray-700 text-right" style={{ fontSize: contentFontSize }}>{row.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                               </table>
                               )}

                               {(pageConfigs['Financial Summary']?.visibility?.showPipesTable !== false) && (
                               <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-6">
                                  <table className="w-full text-[10px] text-center">
                                     <thead className="text-white transition-all" style={{ backgroundColor: themeAccent }}>
                                        <tr>
                                           <th className="py-2 px-1 font-black uppercase" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>No. of Solar Panels</th>
                                           <th className="py-2 px-1 font-black uppercase" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>DC K.W.</th>
                                           <th className="py-2 px-1 font-black uppercase" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>GI pipe 2 mm 60x40</th>
                                           <th className="py-2 px-1 font-black uppercase">GI pipe 2 mm 40x40</th>
                                        </tr>
                                     </thead>
                                     <tbody className="font-bold text-gray-600">
                                        {bomData.pipes.map((pipe, i) => (
                                           <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-white'}`}>
                                              <td className="py-2 border-r border-gray-100">{pipe.panels}</td>
                                              <td className="py-2 border-r border-gray-100">{pipe.kw}</td>
                                              <td className="py-2 border-r border-gray-100">{pipe.size1}</td>
                                              <td className="py-2">{pipe.size2}</td>
                                           </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                               )}

                               <p className="text-[9px] font-bold text-gray-400 italic mb-8">
                                 <span className="text-red-500 font-black">*</span> {bomData.heightNote}
                               </p>

                               <div className="grid grid-cols-2 gap-8">
                                  {(pageConfigs['Financial Summary']?.visibility?.showNotes !== false) && (
                                  <div>
                                     <h6 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-3 border-b-2 pb-1 w-fit" style={{ borderBottomColor: themeAccent }}>Notes</h6>
                                     <ul className="space-y-1.5">
                                        {[
                                          'Bi-directional meter charges as per GUVNL.',
                                          'Extra DISCOM quotation charges to be paid by customer.',
                                          'Civil work at site is customer\'s responsibility.',
                                          '25-year linear performance warranty in solar panel.'
                                        ].map((note, i) => (
                                          <li key={i} className="text-[9px] font-bold text-gray-500 flex items-start gap-1.5">
                                             <div className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ backgroundColor: themeAccent }} />
                                             {note}
                                          </li>
                                        ))}
                                     </ul>
                                  </div>
                                  )}
                                  {(pageConfigs['Financial Summary']?.visibility?.showDocuments !== false) && (
                                  <div>
                                     <h6 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-3 border-b-2 pb-1 w-fit" style={{ borderBottomColor: themeAccent }}>Documents Required</h6>
                                     <ul className="space-y-1.5">
                                        {[
                                          'Electricity Bill - Latest',
                                          'House Location from Google Map',
                                          'Cancelled Cheque / Passbook First Page',
                                          'Email ID',
                                          'Aadhaar Card',
                                          'PAN Card (if Loan)'
                                        ].map((doc, i) => (
                                          <li key={i} className="text-[9px] font-bold text-gray-500 flex items-start gap-1.5">
                                             <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1 shrink-0" />
                                             {doc}
                                          </li>
                                        ))}
                                     </ul>
                                  </div>
                                  )}
                               </div>
                           </div>
                        </div>
                      );
                    }

                    if (pageName === 'Generation Graph') {
                      return (
                        <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                           <div className="px-8 py-6 text-white text-center transition-all" style={{ background: `linear-gradient(to right, ${themeAccent}, ${themeAccent}CC)` }}>
                              <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Performance Analysis</h3>
                              <p className="font-bold uppercase tracking-widest opacity-80" style={{ fontSize: `calc(${contentFontSize} - 4px)` }}>Projected Energy Generation & Financial Benefits</p>
                           </div>
                           
                           <div className="p-8" style={{ backgroundColor: themeBgColor }}>
                              {(pageConfigs['Generation Graph']?.visibility?.showGenChart !== false) && (
                              <div className="mb-10">
                                <div className="flex items-center justify-between mb-4 px-1">
                                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Monthly Generation (Units)</h5>
                                  <div className="px-3 py-1.5 rounded-xl text-white shadow-lg transition-all flex items-center gap-2 border" style={{ backgroundColor: themeAccent, borderSecondaryColor: themeAccent, shadowColor: `${themeAccent}33` }}>
                                    <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{annualTotal.toLocaleString()} Annual Units</span>
                                  </div>
                                </div>
                                <div className="h-64 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4 relative">
                                  <canvas ref={generationChartRef} />
                                </div>
                              </div>
                              )}

                              {(pageConfigs['Generation Graph']?.visibility?.showRoiChart !== false) && (
                              <div className="mb-10">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ROI Analysis (Payback Period)</h5>
                                <div className="h-64 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
                                  <canvas ref={roiChartRef} />
                                </div>
                              </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                 {(pageConfigs['Generation Graph']?.visibility?.showStatsTable !== false) && [
                                   { label: 'Total System Cost', value: `Rs. ${pricingData.totalCost.toLocaleString()} /-`, color: 'blue' },
                                   { label: 'Annual Generation', value: `${annualTotal.toLocaleString()} Units`, color: 'blue' },
                                   { label: 'Annual Savings', value: `Rs. ${annualSavings.toLocaleString()} /-`, color: 'emerald' },
                                   { label: 'Payback Period', value: `${paybackPeriod.toFixed(1)} Years`, color: 'amber' },
                                   { label: '25-Year Savings', value: `Rs. ${savings25Year.toLocaleString()} /-`, color: 'blue', full: true }
                                 ].map((stat, i) => (
                                   <div key={i} className={`${stat.full ? 'col-span-2' : ''} p-5 rounded-2xl border border-gray-100 shadow-sm hover:scale-[1.02] transition-transform`} style={{ backgroundColor: stat.color === 'blue' ? themeBgLight : stat.color === 'emerald' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)' }}>
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                      <p className="text-lg font-black transition-colors" style={{ color: stat.color === 'blue' ? themeAccent : stat.color === 'emerald' ? 'rgb(5, 150, 105)' : 'rgb(217, 119, 6)' }}>{stat.value}</p>
                                   </div>
                                 ))}
                                 {(pageConfigs['Generation Graph']?.visibility?.showRoiBanner !== false) && (
                                   <div className="col-span-2 p-6 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center mt-2 transition-all" style={{ backgroundColor: themeAccent, boxShadow: `0 20px 25px -5px ${themeAccent}33` }}>
                                      <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Total Estimated ROI Benefits</p>
                                      <p className="text-xl font-black text-white uppercase tracking-tighter">Over 25 Year Lifecycle</p>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      );
                    }

                    if (pageName === 'Advanced Settings') {
                      return (
                        <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                           <div className="bg-gray-800 px-8 py-5 text-white" style={{ backgroundColor: themeAccent }}>
                              <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Advanced Options</h3>
                           </div>
                           
                           <div className="p-8" style={{ backgroundColor: themeBgColor }}>
                              <div className="mb-8">
                                <label className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: themeAccent }}>
                                   <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeAccent }} />
                                   Selected Options Breakout
                                </label>

                                {(pageConfigs['Advanced Settings']?.visibility?.showAddonsGrid !== false) ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {advancedOptions.filter(opt => opt.enabled).map((opt, idx) => (
                                        <div key={opt.key ? `grid_${opt.key}_${idx}` : `grid_${idx}`} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative overflow-hidden group">
                                           <div className={`absolute top-0 right-0 ${idx % 3 === 0 ? 'bg-blue-600' : idx % 3 === 1 ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest`} style={{ backgroundColor: themeAccent }}>
                                              {idx % 3 === 0 ? 'Premium' : idx % 3 === 1 ? 'Protection' : 'Add-on'}
                                           </div>
                                           <h6 className="text-[11px] font-black text-gray-800 uppercase mb-2">{opt.type}</h6>
                                           <p className={`text-[10px] font-black mb-3`} style={{ color: themeAccent }}>₹{(opt.price || 0).toLocaleString()}{opt.key !== 'cleaningKit' ? '/year' : ''}</p>
                                           <p className="text-[9px] font-bold text-gray-500 leading-relaxed uppercase">
                                              {opt.description}
                                           </p>
                                        </div>
                                      ))}
                                      {advancedOptions.every(v => !v.enabled) && (
                                        <div className="col-span-2 p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Advanced Options Selected</p>
                                        </div>
                                      )}
                                   </div>
                                ) : (
                                  <div className="p-4 text-center text-[10px] font-black text-gray-400 uppercase italic">Add-ons Grid Hidden by Admin</div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-6 border-t border-gray-100">
                                 {advancedOptions.map((opt, idx) => (
                                   <div key={opt.key || idx} className="flex flex-col items-center text-center p-4 rounded-2xl transition-all" style={{ backgroundColor: opt.enabled ? themeBgLight : '#f9fafb', opacity: opt.enabled ? 1 : 0.4 }}>
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{opt.key?.toUpperCase() || 'SERVICE'}</p>
                                      <div className="bg-white p-2 rounded-lg mb-2 shadow-sm">
                                         {idx % 3 === 0 ? <Settings size={16} style={{ color: themeAccent }} /> : idx % 3 === 1 ? <Shield size={16} style={{ color: themeAccent }} /> : <Zap size={16} style={{ color: themeAccent }} />}
                                      </div>
                                      <p className="text-[10px] font-black text-gray-700 uppercase">{opt.type}</p>
                                      <p className="text-[9px] font-bold" style={{ color: themeAccent }}>
                                         ₹{opt.price.toLocaleString()}{opt.key !== 'cleaningKit' ? '/YR' : ''}
                                      </p>
                                   </div>
                                 ))}
                              </div>

                              <div className="rounded-3xl p-8 flex flex-col gap-4 shadow-2xl transition-all" style={{ backgroundColor: '#111827', boxShadow: `0 20px 25px -5px ${themeAccent}22`, border: `1px solid ${themeAccent}33` }}>
                                 <div className="flex justify-between items-center text-white/60">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Solar System Cost</span>
                                    <span className="text-sm font-bold tracking-tighter text-white">Rs. {pricingData.totalCost.toLocaleString()} /-</span>
                                 </div>
                                 <div className="flex justify-between items-center text-white/60 border-b border-white/10 pb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Advanced Options Total</span>
                                    <span className="text-sm font-bold tracking-tighter" style={{ color: themeAccent }}>Rs. {advancedTotal.toLocaleString()} /-</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-tighter" style={{ color: themeAccent }}>Grand Total</span>
                                    <span className="text-2xl font-black text-white tracking-widest">Rs. {(pricingData.totalCost + advancedTotal).toLocaleString()} /-</span>
                                 </div>
                                 <p className="text-[9px] font-bold text-center text-white/40 uppercase tracking-widest mt-2 border-t border-white/5 pt-4">All Prices are inclusive of GST and Govt Incentives</p>
                              </div>

                              {/* Dynamic Standard & Custom Sections for Advanced Pages */}
                              {(() => {
                                const advCfg = pageConfigs['Advanced Settings'] || {};
                                const vis = advCfg.visibility || {};
                                
                                const activeSections = [
                                  ...(vis.showAccessories !== false ? [{ id: 'std_accessories', label: 'Inverter & Module Details' }] : []),
                                  ...(vis.showEarthing !== false ? [{ id: 'std_earthing', label: 'Earthing & Protection' }] : []),
                                  ...(vis.showInstallation !== false ? [{ id: 'std_installation', label: 'Installation Standard' }] : []),
                                  ...(vis.showAMC !== false ? [{ id: 'std_amc', label: 'AMC / Maintenance Offer' }] : []),
                                  ...(advCfg.customSections || []).filter(s => vis[`custom_${s.id}`] !== false)
                                ];

                                if (activeSections.length === 0) return null;
                                return (
                                  <div className="mt-8 space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Sections Provided</p>
                                    {activeSections.map((s) => (
                                      <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                                         <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: themeAccent }} />
                                            <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{s.label}</span>
                                         </div>
                                         <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-all" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Included</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                            })()}
                         </div>
                      </div>
                    );
                  }

                  if (pageName === 'Payment Terms') {
                    if (paymentModesSelected.length === 0) return null;
                    return (
                      <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                         <div className="px-8 py-6 text-white text-center transition-all" style={{ background: `linear-gradient(to right, ${themeAccent}, ${themeBgStrong})` }}>
                            <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Payment Options</h3>
                            <p className="font-bold uppercase tracking-widest opacity-80" style={{ fontSize: `calc(${contentFontSize} - 4px)` }}>Flexible Financing & Secured Payment Methods</p>
                         </div>
                         
                         <div className="p-8">
                            <div className="grid grid-cols-1 gap-6">
                               {paymentModesSelected.includes('Cash') && (
                                 <div className="p-6 rounded-3xl border animate-in zoom-in-95 duration-500" style={{ borderColor: `${themeAccent}33`, backgroundColor: `${themeAccent}10` }}>
                                    <div className="flex items-center gap-3 mb-4">
                                       <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: themeAccent }}>
                                          <Calculator size={18} />
                                       </div>
                                       <div>
                                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Full Cash Payment</h4>
                                          <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: themeAccent }}>Upfront Payment Benefit Available</p>
                                       </div>
                                    </div>
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: `${themeAccent}20` }}>
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lumpsum Amount</span>
                                          <span className="text-base font-black text-gray-800">₹ {(pricingData.netCost + advancedTotal).toLocaleString()} /-</span>
                                       </div>
                                       <div className="px-1">
                                          <p className="text-[9px] font-bold text-gray-500 leading-relaxed uppercase">
                                             • 100% payment before installation commissioning.<br/>
                                             • Includes all standard warranties and support.<br/>
                                             • No interest charges or hidden finance costs.
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                               )}

                               {/* Loan Section */}
                               {paymentModesSelected.includes('Loan') && (
                                 <div className="p-6 rounded-3xl border animate-in zoom-in-95 duration-500 delay-75" style={{ borderColor: `${themeAccent}33`, backgroundColor: `${themeAccent}10` }}>
                                    <div className="flex items-center gap-3 mb-4">
                                       <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: themeAccent }}>
                                          <Shield size={18} />
                                       </div>
                                       <div>
                                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Bank Finance / Loan</h4>
                                          <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: themeAccent }}>Low Interest Solar Financing</p>
                                       </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                       <div className="p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)', borderColor: `${themeAccent}20` }}>
                                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Down Payment</p>
                                          <p className="text-sm font-black text-gray-800">₹ {Math.round((pricingData.netCost + advancedTotal) * 0.2).toLocaleString()}</p>
                                       </div>
                                       <div className="p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)', borderColor: `${themeAccent}20` }}>
                                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Max tenure</p>
                                          <p className="text-sm font-black text-gray-800">7 Years</p>
                                       </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 mt-4 leading-relaxed px-1 italic">
                                       * Subject to bank approval and credit score. Standard interest rates apply as per bank norms. Processing fees may be applicable.
                                    </p>
                                 </div>
                               )}

                               {/* EMI Section */}
                               {paymentModesSelected.includes('EMI') && (
                                 <div className="p-6 rounded-3xl border animate-in zoom-in-95 duration-500 delay-150" style={{ borderColor: `${themeAccent}33`, backgroundColor: `${themeAccent}10` }}>
                                    <div className="flex items-center gap-3 mb-4">
                                       <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: themeAccent }}>
                                          <Zap size={18} />
                                       </div>
                                       <div>
                                          <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Easy EMI Installments</h4>
                                          <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: themeAccent }}>Monthly Payment Flexibility</p>
                                       </div>
                                    </div>
                                    <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: `${themeAccent}20` }}>
                                       <table className="w-full text-[10px]">
                                          <thead className="text-white font-black uppercase tracking-widest" style={{ backgroundColor: themeAccent }}>
                                             <tr>
                                                <th className="py-3 px-4 text-left">Tenure Plan</th>
                                                <th className="py-3 px-4 text-right">Approx. EMI Plan</th>
                                             </tr>
                                          </thead>
                                          <tbody className="font-bold text-gray-700">
                                             <tr className="border-b" style={{ borderBottomColor: `${themeAccent}10` }}>
                                                <td className="py-3 px-4 uppercase tracking-tighter">12 Months (Standard)</td>
                                                <td className="py-3 px-4 text-right">₹ {Math.round((pricingData.netCost + advancedTotal) / 12).toLocaleString()}</td>
                                             </tr>
                                             <tr className="border-b" style={{ backgroundColor: `${themeAccent}05`, borderBottomColor: `${themeAccent}10` }}>
                                                <td className="py-3 px-4 uppercase tracking-tighter">24 Months (Saver)</td>
                                                <td className="py-3 px-4 text-right">₹ {Math.round((pricingData.netCost + advancedTotal) / 24).toLocaleString()}</td>
                                             </tr>
                                             <tr>
                                                <td className="py-3 px-4 uppercase tracking-tighter font-black" style={{ color: themeAccent }}>36 Months (Budget)</td>
                                                <td className="py-3 px-4 text-right font-black" style={{ color: themeAccent }}>₹ {Math.round((pricingData.netCost + advancedTotal) / 36).toLocaleString()}</td>
                                             </tr>
                                          </tbody>
                                       </table>
                                    </div>
                                 </div>
                               )}
                            </div>

                            <div className="mt-8 p-6 bg-gray-900 rounded-[2rem] text-center border-t-4 shadow-xl" style={{ borderColor: themeAccent }}>
                               <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Professional Terms of Payment</p>
                               <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">
                                  Prices include site survey, installation, and commissioning. <br/>
                                  Incentives are subject to DISCOM & MNRE guidelines at the time of installation.
                               </p>
                            </div>
                         </div>
                      </div>
                    );
                  }

                    // Dynamic Custom Pages Preview
                    return (
                      <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                         <div className="px-8 py-5 border-b flex justify-between items-center" style={{ backgroundColor: themeBgFaint, borderBottomColor: themeBgSemi }}>
                            <h3 className="text-xl font-black uppercase tracking-tighter" style={{ color: themeAccent }}>{pageName}</h3>
                            <div className="px-3 py-1 text-white text-[9px] font-black uppercase rounded-full shadow-sm" style={{ backgroundColor: themeAccent }}>Custom Page</div>
                         </div>
                         
                         <div className="p-8">
                            {pageConfigs[pageName]?.media && (
                               <div className="mb-6 h-48 w-full rounded-2xl overflow-hidden shadow-inner">
                                  <img src={pageConfigs[pageName].media} className="w-full h-full object-cover" />
                               </div>
                            )}
                            <div className="space-y-4">
                               {pageConfigs[pageName]?.header && (
                                  <h4 className="text-sm font-black uppercase tracking-widest border-b pb-2 transition-colors" style={{ color: themeAccent, borderBottomColor: themeBgLight }}>{pageConfigs[pageName].header}</h4>
                               )}
                               <p className="text-xs font-bold text-gray-600 leading-relaxed whitespace-pre-wrap">
                                  {pageConfigs[pageName]?.content || 'This page was dynamically added to the quote. You can configure its content in the Settings panel above.'}
                               </p>
                               {pageConfigs[pageName]?.footer && (
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-6 border-t">{pageConfigs[pageName].footer}</p>
                               )}

                               {/* Dynamic Custom Sections for Custom Page Preview */}
                               {(() => {
                                 const thisCfg = pageConfigs[pageName] || {};
                                 const customSections = (thisCfg.customSections || []).filter(
                                   s => (thisCfg.visibility || {})[`custom_${s.id}`] !== false
                                 );
                                 if (customSections.length === 0) return null;
                                 return (
                                   <div className="mt-8 space-y-3">
                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">Sections Provided</p>
                                     {customSections.map((s) => (
                                       <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                         <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: themeAccent }} />
                                         <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{s.label}</span>
                                         <div className="flex-1 h-px bg-gray-200" />
                                         <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Included</span>
                                       </div>
                                     ))}
                                   </div>
                                 );
                               })()}
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Action Buttons at bottom of Preview column */}
                <div className="flex flex-col gap-3 mt-10 pb-10 border-t pt-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <div className="text-center mb-4">
                      <div className="inline-block px-4 py-1.5 rounded-full mb-2 border" style={{ backgroundColor: themeBgFaint, borderColor: themeBgSemi }}>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: themeAccent }}>Proposal Ready</p>
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Final layout is synchronized with your settings</p>
                   </div>
                   
                   <button 
                      onClick={() => handleDownloadQuote(getCurrentQuoteForExport())}
                      className="w-full text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl"
                      style={{ backgroundColor: themeAccent, boxShadow: `0 10px 15px -3px ${themeAccent}44` }}
                   >
                      <Download size={18} /> Download Generated PDF
                   </button>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                         onClick={() => handleDownloadQuote(getCurrentQuoteForExport())}
                         className="bg-white border-2 border-gray-100 text-gray-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                      >
                         <Printer size={16} /> Print View
                      </button>
                      <button 
                         onClick={() => {
                            const quote = getCurrentQuoteForExport();
                            handleDownloadQuote(quote);
                            // Auto trigger print in modal logic if possible, 
                            // but our modal has its own print button which is safer.
                         }}
                         className="bg-gray-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
                      >
                         <Maximize2 size={16} /> Full Preview
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Front Page Settings Modal (Localized State) */}
      <FrontPageSettingsDrawer 
        isOpen={isFrontPageModalOpen}
        onClose={() => setIsFrontPageModalOpen(false)}
        initialSettings={frontPageSettings}
        onSave={(settings) => {
          setFrontPageSettings(settings);
          toast.success("Settings updated!");
        }}
        selectedStates={selectedStates}
        selectedDistricts={selectedDistricts}
        states={states}
        districts={districts}
        quoteCount={quotes.length}
        solarSettings={solarSettings}
        filters={filters}
        quotes={quotes}
      />



      {/* Professional Page Configuration Modal (Localized State to prevent main refresh) */}
      <PageConfigDrawer 
        isOpen={isPageModalOpen}
        onClose={() => setIsPageModalOpen(false)}
        activePage={activeEditingPage}
        initialConfig={tempPageConfig}
        onSave={(config) => {
          setPageConfigs({ ...pageConfigs, [activeEditingPage.value]: config });
        }}
        onLiveChange={(config) => {
          setPageConfigs({ ...pageConfigs, [activeEditingPage.value]: config });
        }}
        quoteType={quoteTypesSelected[0]}
        advancedOptions={advancedOptions}
        setAdvancedOptions={setAdvancedOptions}
        dbAmcServices={dbAmcServices}
      />

      {/* Quote Download / Print Modal */}
      <QuoteDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => { setIsDownloadModalOpen(false); setDownloadQuote(null); }}
        quote={downloadQuote}
      />
    </div>
  );
}

// Quote Download / PDF Print Modal
const QuoteDownloadModal = ({ isOpen, onClose, quote }) => {
  if (!isOpen || !quote) return null;


  const handlePrint = () => {
    const printArea = document.getElementById('quote-print-area');
    if (!printArea) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups for this site to download the PDF.');
      return;
    }

    // Collect all existing stylesheet links from the main document
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => `<link rel="stylesheet" href="${link.href}" />`)
      .join('\n');
    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map(style => `<style>${style.innerHTML}</style>`)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Solar Quote — ${quote.category || ''} ${quote.projectType || ''}</title>
        ${styleLinks}
        ${inlineStyles}
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            box-sizing: border-box;
          }
          
          body { 
            background: white; 
            margin: 0; 
            padding: 0; 
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
          }

          .pdf-page {
            width: 100%;
            min-height: 297mm; /* A4 Height */
            padding: 40px;
            background: white;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            page-break-after: always;
            break-after: page;
          }

          @media print {
            body { background: none; }
            .no-print { display: none !important; }
            .pdf-page {
              padding: 0;
              margin: 0;
              min-height: auto;
              height: 100vh;
              page-break-after: always;
              break-after: page;
            }
            .print-shadow-none { box-shadow: none !important; }
            .print-border-none { border: none !important; }
            .print-rounded-none { border-radius: 0 !important; }
            
            /* Force new page for each section */
            .section-break {
              page-break-before: always;
              break-before: page;
            }
          }

          /* Premium Typography */
          h1, h2, h3, h4, h5, h6 {
            letter-spacing: -0.02em;
          }

          .gradient-overlay {
            background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
          }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for resources (images, fonts) to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 800);
    };
  };


  const pages = quote.selectedPages || [];
  const chartImages = quote.chartImages || {};
  
  // Brand Color Logic for Export
  const themeAccent = (quote.colorSettings?.brandColor) ? (quote.frontPageSettings?.styling?.themeColor || '#2563eb') : '#2563eb';
  const themeBgColor = (quote.colorSettings?.backgroundColor) ? (quote.frontPageSettings?.styling?.bgColor || '#ffffff') : '#ffffff';
  
  // Dynamic Font Sizes for Export
  const headerFS = (quote.colorSettings?.fontSize) ? `${quote.frontPageSettings?.styling?.headerFontSize || 24}px` : '24px';
  const footerFS = (quote.colorSettings?.fontSize) ? `${quote.frontPageSettings?.styling?.footerFontSize || 10}px` : '10px';
  const sectionTitleFS = (quote.colorSettings?.fontSize) ? `${quote.frontPageSettings?.styling?.sectionTitleFontSize || 18}px` : '18px';
  const contentFS = (quote.colorSettings?.fontSize) ? `${quote.frontPageSettings?.styling?.contentFontSize || 12}px` : '12px';

  const themeBgLight = `${themeAccent}15`;
  const themeBgSemi = `${themeAccent}33`;
  const themeBgFaint = `${themeAccent}08`;
  const themeBgStrong = `${themeAccent}CC`;

  // Performance calculations
  const kw = quote.solarSettings?.projectKW || 0;
  const annTotal = (quote.monthlyIsolation || []).reduce((sum, m) => sum + (m.total || 0), 0);
  const uPrice = quote.unitPrice || 0;
  const annSavings = annTotal * uPrice;
  const netC = quote.pricingData?.netCost || 0;
  const payP = annSavings > 0 ? (netC / annSavings) : 0;
  
  // 25 year savings with inflation and degradation like the main UI
  let total25YearSavings = 0;
  let currentYearSavings = annSavings;
  const infl = quote.inflationRate || 0;
  const degra = quote.degradationRate || 0;
  
  for (let i = 1; i <= 25; i++) {
    total25YearSavings += currentYearSavings;
    currentYearSavings = currentYearSavings * (1 + infl - degra);
  }
  const sav25 = total25YearSavings;

  const pricing = {
    totalCost: quote.pricingData?.totalCost || 0,
    mnreSubsidy: quote.pricingData?.mnreSubsidy || 0,
    stateSubsidy: quote.pricingData?.stateSubsidy || 0,
    additionalCharges: quote.pricingData?.additionalCharges || 0,
    netCost: quote.pricingData?.netCost || 0,
  };
  const bom = quote.bomData || { items: [], pipes: [], heightNote: '' };
  const fieldSettings = quote.fieldSettings || {};
  const pageConfigs = quote.pageConfigs || {};
  const advancedOptions = quote.advancedOptions || [];
  const solarSettings = quote.solarSettings || { projectKW: 0 };
  const advancedTotal = advancedOptions.reduce((acc, opt) => acc + (opt.enabled ? (opt.price || 0) : 0), 0);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300 print:hidden-outer">
      {/* Top Utility Bar - hidden when printing */}
      <div className="fixed top-0 left-0 right-0 z-[210] bg-gray-900 px-8 py-3 flex items-center justify-between shadow-2xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-white text-sm font-black uppercase tracking-widest">Quote Preview</h3>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">
              {(quote.categories?.join?.(', ') || quote.category)} · {(quote.projectTypes?.join?.(', ') || quote.projectType)} · {(quote.partnerTypes?.join?.(', ') || quote.partnerType)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95"
          >
            <Download size={15} />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-700 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
          >
            <X size={15} />
            Close
          </button>
        </div>
      </div>

      {/* Scrollable Print Area */}
      <div className="w-full max-w-4xl bg-gray-200 rounded-2xl overflow-y-auto mt-14 max-h-[88vh] shadow-2xl" id="quote-print-area">

        <div className="p-0">

          {/* ── FRONT PAGE ── */}
          {pages.includes('Front Page') && (
            <div className="pdf-page rounded-3xl overflow-hidden shadow-2xl border border-gray-100 print:rounded-none print:shadow-none print:border-0" style={{ backgroundColor: themeBgColor }}>
              <div className="relative h-56 w-full">
                <img
                  src={pageConfigs['Front Page']?.media || "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                  alt="Solar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 gradient-overlay flex flex-col items-center justify-center text-center px-6">
                  <h2 className="font-black text-white mb-2 uppercase tracking-tighter drop-shadow-2xl" style={{ fontSize: headerFS }}>
                    {pageConfigs['Front Page']?.header || `${quote.category || 'Residential'} ${quote.projectType || ''}`}
                  </h2>
                  <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-lg">
                    {quote.subProjectType || 'National Portal'}
                  </div>
                  <h4 className="text-5xl font-black text-white mb-3 tracking-[0.3em] opacity-90">PROPOSAL</h4>
                  <div className="w-20 h-1.5 bg-white/30 rounded-full mb-4"></div>
                  <p className="text-[10px] font-black text-gray-200 tracking-[0.2em] uppercase">
                    {pageConfigs['Front Page']?.footer || 'SOLAR ENERGY FOR A BETTER TOMORROW'}
                  </p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div className="space-y-4">
                    {fieldSettings.proposalNo && (
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Proposal No</p>
                        <p className="text-[10px] font-black" style={{ color: themeAccent }}>{quote.proposalNo || 'SK/GEN/DL0001'}</p>
                      </div>
                    )}
                    {fieldSettings.customerName && (
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Customer Name</p>
                        <p className="text-xs font-bold text-gray-700">{quote.customerName || 'Valued Customer'}</p>
                      </div>
                    )}
                    {fieldSettings.kwRequired && (
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">KW Required</p>
                        <p className="text-xs font-bold text-gray-700">{solarSettings.projectKW} KW</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {fieldSettings.residentialCommercial && (
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Category</p>
                        <p className="text-xs font-bold text-gray-700">{(quote.categories?.join(', ') || quote.category)} {(quote.projectTypes?.join(', ') || quote.projectType)}</p>
                      </div>
                    )}
                    {fieldSettings.city && (
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">City</p>
                        <p className="text-xs font-bold text-gray-700">
                          {quote.districts?.map(d => d.name || d).join(', ') || quote.district?.name || 'Location Not Set'}
                        </p>
                      </div>
                    )}
                    {fieldSettings.quoteType && (
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Quote Type</p>
                        <p className="text-xs font-bold text-gray-700">{quote.quoteTypes?.join(', ') || quote.quoteType}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-gray-100 pt-4">
                  {fieldSettings.preparedBy && (
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Prepared By</p>
                      <p className="text-xs font-black text-gray-700 uppercase">
                        {quote.partnerTypes?.join(', ') || quote.partnerType || 'Partner'}
                      </p>
                    </div>
                  )}
                  {fieldSettings.date && (
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-xs font-black text-gray-700">
                        {new Date(quote.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {fieldSettings.validUpto && (
                    <div>
                      <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Valid Upto</p>
                      <p className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit">
                        {quote.frontPageSettings?.contentVisibility?.validUptoValue || '15'} Days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── COMMERCIAL PAGE ── */}
          {pages.includes('Commercial Page') && (
            <div className="pdf-page rounded-3xl overflow-hidden shadow-xl border border-gray-100 p-8 print:rounded-none print:shadow-none" style={{ backgroundColor: themeBgColor }}>
              <div className="flex justify-between items-center mb-6 border-b-4 pb-2" style={{ borderBottomColor: themeAccent }}>
                <div>
                  <h5 className="text-xl font-black uppercase tracking-tighter" style={{ color: themeAccent }}>{quote.quoteTypes?.join(', ') || quote.quoteType}</h5>
                  <p className="text-xs font-bold text-gray-500 uppercase">{quote.kitTypes?.join(', ') || quote.kitType || 'Combo Kit'}</p>
                </div>
                {fieldSettings.kitType && (
                  <div className="text-white px-4 py-1 rounded-full text-[10px] font-black uppercase" style={{ backgroundColor: themeAccent }}>{quote.kitTypes?.join(', ') || quote.kitType || 'Combo Kit'}</div>
                )}
              </div>
              <div className="border border-gray-100 rounded-3xl overflow-hidden mx-auto max-w-lg shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)' }}>
                <table className="w-full border-collapse">
                  <tbody>
                    {[
                      { key: 'showTotalCost', label: 'Total Project Cost', value: pricing.totalCost },
                      { key: 'showMnreSubsidy', label: 'Expected MNRE Subsidy', value: pricing.mnreSubsidy },
                      { key: 'showStateSubsidy', label: 'Expected State Subsidy', value: pricing.stateSubsidy },
                      { key: 'showAdditionalCharges', label: 'Additional Service Charges', value: pricing.additionalCharges },
                    ].map((row, i) => (pageConfigs['Commercial Page']?.visibility?.[row.key] !== false) && (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-5">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{row.label}</p>
                          <p className="text-[11px] font-bold text-gray-500 italic uppercase">Based on standard system sizing</p>
                        </td>
                        <td className="p-5 text-lg font-black text-gray-800 text-right">₹ {(row.value || 0).toLocaleString()} /-</td>
                      </tr>
                    ))}
                    {(pageConfigs['Commercial Page']?.visibility?.showNetCost !== false) && (
                      <tr className="text-white" style={{ backgroundColor: themeAccent }}>
                        <td className="p-6">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Investment</p>
                            <p className="text-xl font-black uppercase tracking-tight">Net Payable Cost</p>
                        </td>
                        <td className="p-6 text-3xl font-black text-right tracking-tighter">₹ {pricing.netCost.toLocaleString()} /-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Custom Sections for PDF */}
              {(() => {
                const commercialCfg = pageConfigs['Commercial Page'] || {};
                const customSections = (commercialCfg.customSections || []).filter(
                  s => (commercialCfg.visibility || {})[`custom_${s.id}`] !== false
                );
                if (customSections.length === 0) return null;
                return (
                  <div className="mt-8 space-y-3 print:break-inside-avoid">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Additional Sections</p>
                    {customSections.map((s) => (
                      <div key={s.id} className="border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeAccent }} />
                            <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{s.label}</span>
                         </div>
                         <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Included</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── GENERATION GRAPH ── */}
          {pages.includes('Generation Graph') && (
            <div className="pdf-page rounded-3xl overflow-hidden shadow-xl border border-gray-100 print:rounded-none print:shadow-none" style={{ backgroundColor: themeBgColor }}>
               <div className="px-8 py-5 text-white" style={{ backgroundColor: themeAccent }}>
                  <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFS }}>Performance Analysis</h3>
               </div>
               <div className="p-8">
                  {chartImages.gen && (
                    <div className="mb-8">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Monthly Generation (Units)</p>
                      <img src={chartImages.gen} className="w-full h-auto max-h-[300px] object-contain rounded-2xl" />
                    </div>
                  )}
                  {chartImages.roi && (
                    <div className="mb-8">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ROI Analysis (Payback Period)</p>
                      <img src={chartImages.roi} className="w-full h-auto max-h-[300px] object-contain rounded-2xl" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-6 mt-8">
                      {(pageConfigs['Generation Graph']?.visibility?.showStatsTable !== false) && [
                        { label: 'Total System Cost', value: `₹ ${pricing.totalCost.toLocaleString()} /-` },
                        { label: 'Annual Generation', value: `${annTotal.toLocaleString()} Units` },
                        { label: 'Annual Savings', value: `₹ ${annSavings.toLocaleString()} /-` },
                        { label: 'Payback Period', value: `${payP.toFixed(1)} Years` }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-center" style={{ backgroundColor: themeBgLight }}>
                           <p className="font-black text-gray-400 uppercase tracking-widest mb-2 text-center" style={{ fontSize: `calc(${contentFS} - 2px)` }}>{stat.label}</p>

                           <p className="font-black text-center" style={{ color: themeAccent, fontSize: sectionTitleFS }}>{stat.value}</p>

                        </div>
                      ))}
                      {(pageConfigs['Generation Graph']?.visibility?.showRoiBanner !== false) && (
                        <div className="col-span-2 p-8 rounded-[2rem] text-center shadow-lg shadow-blue-500/20" style={{ backgroundColor: themeAccent }}>
                           <p className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">Total Estimated ROI Benefits</p>
                           <p className="font-black text-white uppercase tracking-tighter" style={{ fontSize: `calc(${sectionTitleFS} + 8px)` }}>₹ {sav25.toLocaleString()} /- Over 25 years</p>

                           <div className="mt-4 w-12 h-1 bg-white/30 mx-auto rounded-full"></div>
                        </div>
                      )}
                  </div>
               </div>
            </div>
          )}

          {/* ── BOM SURVEY SUMMARY ── */}
          {pages.includes('Financial Summary') && (
            <div className="pdf-page rounded-3xl overflow-hidden shadow-xl border border-gray-100 print:rounded-none print:shadow-none" style={{ backgroundColor: themeBgColor }}>
              <div className="px-8 py-4 text-white" style={{ backgroundColor: themeAccent }}>
                <h5 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFS }}>Residential Solar BOM</h5>
              </div>
              <div className="p-8">
                <table className="w-full border-collapse mb-6">
                  <tbody>
                    {bom.items.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 font-black text-gray-400 uppercase tracking-widest" style={{ fontSize: `calc(${contentFS} - 2px)` }}>{row.label}</td>
                        <td className="py-3 text-sm font-bold text-gray-700 text-right">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bom.heightNote && (
                  <p className="text-[9px] font-bold text-gray-400 italic mt-4">
                    <span className="text-red-500">*</span> {bom.heightNote}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── ADVANCED OPTIONS ── */}
          {pages.includes('Advanced Settings') && (
            <div className="pdf-page rounded-3xl overflow-hidden shadow-xl border border-gray-100 print:rounded-none print:shadow-none" style={{ backgroundColor: themeBgColor }}>
              <div className="px-8 py-4 text-white" style={{ backgroundColor: themeAccent }}>
                <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFS }}>Advanced Options</h3>
              </div>
              <div className="p-8">
                 {(pageConfigs['Advanced Settings']?.visibility?.showAddonsGrid !== false) && (
                   <div className="grid grid-cols-2 gap-4 mb-6">
                     {advancedOptions.filter(opt => opt.enabled).map((opt, idx) => (
                                               <div key={opt.key ? `pdf_${opt.key}_${idx}` : `pdf_${idx}`} className="p-4 rounded-2xl border border-gray-100" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#f9fafb' : 'rgba(255,255,255,0.05)' }}>


                         <h6 className="text-[11px] font-black text-gray-800 uppercase mb-1">{opt.type}</h6>
                         <p className="text-[10px] font-black mb-2" style={{ color: themeAccent }}>₹{(opt.price || 0).toLocaleString()}</p>
                         <p className="text-[9px] font-bold text-gray-500 leading-relaxed">{opt.description}</p>
                       </div>
                     ))}
                   </div>
                 )}
                 {(pageConfigs['Advanced Settings']?.visibility?.showAddonsTotal !== false) && (
                   <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-3" style={{ border: `1px solid ${themeAccent}33` }}>
                     <div className="flex justify-between items-center text-white/60 text-xs font-bold">
                       <span>Solar System Cost</span>
                       <span className="text-white">Rs. {pricing.totalCost.toLocaleString()} /-</span>
                     </div>
                     <div className="flex justify-between items-center text-white/60 text-xs font-bold border-b border-white/10 pb-3">
                       <span>Advanced Options Total</span>
                       <span style={{ color: themeAccent }}>Rs. {advancedTotal.toLocaleString()} /-</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-black uppercase" style={{ color: themeAccent }}>Grand Total</span>
                       <span className="text-xl font-black text-white">Rs. {(pricing.totalCost + advancedTotal).toLocaleString()} /-</span>
                     </div>
                   </div>
                 )}

                {/* Dynamic Standard & Custom Sections for Advanced Pages Download */}
                {(() => {
                  const advCfg = pageConfigs['Advanced Settings'] || {};
                  const vis = advCfg.visibility || {};
                  
                  const activeSections = [
                    ...(vis.showAccessories !== false ? [{ id: 'std_accessories', label: 'Inverter & Module Details' }] : []),
                    ...(vis.showEarthing !== false ? [{ id: 'std_earthing', label: 'Earthing & Protection' }] : []),
                    ...(vis.showInstallation !== false ? [{ id: 'std_installation', label: 'Installation Standard' }] : []),
                    ...(vis.showAMC !== false ? [{ id: 'std_amc', label: 'AMC / Maintenance Offer' }] : []),
                    ...(advCfg.customSections || []).filter(s => vis[`custom_${s.id}`] !== false)
                  ];

                  if (activeSections.length === 0) return null;
                  return (
                    <div className="mt-8 space-y-3 print:break-inside-avoid">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Sections Provided</p>
                      {activeSections.map((s) => (
                        <div key={s.id} className="border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: themeAccent }} />
                              <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{s.label}</span>
                           </div>
                           <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Included</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>
            </div>
          )}

          {/* ── PAYMENT TERMS ── */}
          {pages.includes('Payment Terms') && quote.paymentModes && quote.paymentModes.length > 0 && (
            <div className="pdf-page rounded-3xl overflow-hidden shadow-xl border border-gray-100 print:rounded-none print:shadow-none" style={{ backgroundColor: themeBgColor }}>
              <div className="px-8 py-4 text-white text-center" style={{ backgroundColor: themeAccent }}>
                <h5 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFS }}>Payment Options</h5>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-80" style={{ fontSize: `calc(${contentFS} - 4px)` }}>Flexible Financing & Secured Payment Methods</p>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                   {quote.paymentModes.includes('Cash') && (
                     <div className="p-6 rounded-2xl border" style={{ borderColor: themeBgSemi, backgroundColor: themeBgFaint }}>
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Full Cash Payment</h4>
                           <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Benefit Applied</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl border" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: themeBgSemi }}>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lumpsum Amount</span>
                           <span className="text-base font-black text-gray-800">₹ {(pricing.netCost + advancedTotal).toLocaleString()} /-</span>
                        </div>
                        <div className="mt-3 px-1">
                           <p className="text-[9px] font-bold text-gray-500 leading-relaxed uppercase">
                              • 100% payment before installation commissioning.<br/>
                              • Includes all standard warranties and support.<br/>
                              • No interest charges or hidden finance costs.
                           </p>
                        </div>
                     </div>
                   )}

                   {quote.paymentModes.includes('Loan') && (
                     <div className="p-6 rounded-2xl border" style={{ borderColor: themeBgSemi, backgroundColor: themeBgFaint }}>
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4">Bank Finance / Loan</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 rounded-xl border" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: themeBgSemi }}>
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Down Payment</p>
                              <p className="text-sm font-black text-gray-800">₹ {Math.round((pricing.netCost + advancedTotal) * 0.2).toLocaleString()}</p>
                           </div>
                           <div className="p-4 rounded-xl border" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: themeBgSemi }}>
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Max tenure</p>
                              <p className="text-sm font-black text-gray-800">7 Years</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {quote.paymentModes.includes('EMI') && (
                     <div className="p-6 rounded-2xl border" style={{ borderColor: themeBgSemi, backgroundColor: themeBgFaint }}>
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4">Easy EMI Installments</h4>
                        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: themeBgSemi }}>
                           <table className="w-full text-[10px]">
                              <thead className="text-white font-black uppercase" style={{ backgroundColor: themeAccent }}>
                                 <tr>
                                    <th className="py-2 px-4 text-left">Tenure</th>
                                    <th className="py-2 px-4 text-right">Approx. EMI Content</th>
                                 </tr>
                              </thead>
                              <tbody className="font-bold text-gray-700">
                                 <tr className="border-b" style={{ borderBottomColor: themeBgSemi }}>
                                    <td className="py-2 px-4 uppercase">12 Months</td>
                                    <td className="py-2 px-4 text-right">₹ {Math.round((pricing.netCost + advancedTotal) / 12).toLocaleString()}</td>
                                 </tr>
                                 <tr className="border-b" style={{ borderBottomColor: themeBgSemi }}>
                                    <td className="py-2 px-4 uppercase">24 Months</td>
                                    <td className="py-2 px-4 text-right">₹ {Math.round((pricing.netCost + advancedTotal) / 24).toLocaleString()}</td>
                                 </tr>
                                 <tr>
                                    <td className="py-2 px-4 uppercase font-black" style={{ color: themeAccent }}>36 Months</td>
                                    <td className="py-2 px-4 text-right font-black" style={{ color: themeAccent }}>₹ {Math.round((pricing.netCost + advancedTotal) / 36).toLocaleString()}</td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}
                </div>

                <div className="mt-8 p-6 bg-gray-900 rounded-2xl text-center" style={{ borderTop: `4px solid ${themeAccent}` }}>
                   <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">Notice & Terms</p>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      Prices include site survey, installation, and commissioning. <br/>
                      Incentives are subject to DISCOM & MNRE guidelines.
                   </p>
                </div>
              </div>
            </div>
          )}

          {/* ── CUSTOM PAGES ── */}
          {pages.filter(p => !['Front Page', 'Commercial Page', 'Generation Graph', 'Advanced Settings', 'Financial Summary', 'Payment Terms'].includes(p)).map((pageName, idx) => (
            <div key={idx} className="pdf-page rounded-3xl overflow-hidden shadow-xl border border-gray-100 print:rounded-none print:shadow-none" style={{ backgroundColor: themeBgColor }}>
              <div className="px-8 py-4 flex justify-between items-center border-b" style={{ backgroundColor: themeBgFaint, borderBottomColor: themeBgSemi }}>
                <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFS, color: themeAccent }}>{pageName}</h3>
                <div className="px-3 py-1 text-white text-[9px] font-black uppercase rounded-full" style={{ backgroundColor: themeAccent }}>Custom</div>
              </div>
              <div className="p-8">
                {pageConfigs[pageName]?.media && (
                  <img src={pageConfigs[pageName].media} className="w-full h-40 object-cover rounded-xl mb-6" alt="" />
                )}
                {pageConfigs[pageName]?.header && (
                  <h4 className="font-black uppercase tracking-widest border-b pb-2 mb-4" style={{ color: themeAccent, borderBottomColor: themeBgLight, fontSize: `calc(${sectionTitleFS} - 4px)` }}>{pageConfigs[pageName].header}</h4>
                )}
                <p className="font-bold text-gray-600 leading-relaxed whitespace-pre-wrap" style={{ fontSize: contentFS }}>
                  {pageConfigs[pageName]?.content || 'Custom page content. Configure in Settings panel.'}
                </p>
                {pageConfigs[pageName]?.footer && (
                  <p className="font-black text-gray-400 uppercase tracking-[0.2em] pt-4 border-t mt-4" style={{ fontSize: footerFS }}>{pageConfigs[pageName].footer}</p>
                )}

                {/* Dynamic Custom Sections for Custom Page Download */}
                {(() => {
                  const thisCfg = pageConfigs[pageName] || {};
                  const customSections = (thisCfg.customSections || []).filter(
                    s => (thisCfg.visibility || {})[`custom_${s.id}`] !== false
                  );
                  if (customSections.length === 0) return null;
                  return (
                    <div className="mt-8 space-y-3 print:break-inside-avoid">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Sections Provided</p>
                      {customSections.map((s) => (
                        <div key={s.id} className="border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeAccent }} />
                              <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{s.label}</span>
                           </div>
                           <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Included</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sub-component to prevent main component re-renders
const PageConfigDrawer = ({ isOpen, onClose, activePage, initialConfig, onSave, onLiveChange, quoteType, advancedOptions, setAdvancedOptions, dbAmcServices }) => {
  const [config, setConfig] = React.useState(initialConfig);
  const [showAddInput, setShowAddInput] = React.useState(false);
  const [newSectionName, setNewSectionName] = React.useState('');
  const addInputRef = React.useRef(null);

  // Wrapper that updates local state AND fires live preview
  const updateConfig = (next) => {
    setConfig(next);
    if (onLiveChange) onLiveChange(next);
  };

  React.useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig);
      setShowAddInput(false);
      setNewSectionName('');
    }
  }, [isOpen, initialConfig]);

  React.useEffect(() => {
    if (showAddInput && addInputRef.current) addInputRef.current.focus();
  }, [showAddInput]);

  if (!isOpen) return null;

  const pageType = activePage?.value;

  const builtInItemsMap = {
    'Commercial Page': [
      { key: 'showTotalCost',         label: 'Total Cost' },
      { key: 'showMnreSubsidy',       label: 'Govt MNRE Subsidy' },
      { key: 'showStateSubsidy',      label: 'Govt State Subsidy' },
      { key: 'showAdditionalCharges', label: 'Additional Charges' },
      { key: 'showNetCost',           label: 'Net Cost' },
    ],
    'Advanced Settings': [
      { key: 'showAddonsGrid',        label: 'Add-ons Price Grid' },
      { key: 'showAddonsList',        label: 'Add-ons Summary List' },
      { key: 'showAddonsTotal',       label: 'Add-ons Total Costing' },
      { key: 'showAccessories',       label: 'Inverter & Module Details' },
      { key: 'showEarthing',          label: 'Earthing & Protection' },
      { key: 'showInstallation',      label: 'Installation Standard' },
      { key: 'showAMC',               label: 'AMC / Maintenance Offer' },
    ],
    'Generation Graph': [
      { key: 'showGenChart',          label: 'Monthly Generation Chart' },
      { key: 'showRoiChart',          label: 'ROI Payback Chart' },
      { key: 'showStatsTable',        label: 'Performance Stats Table' },
      { key: 'showRoiBanner',         label: 'Total ROI Benefit Banner' },
    ],
    'Financial Summary': [
      { key: 'showBomTable',          label: 'Solar BOM Table' },
      { key: 'showPipesTable',        label: 'Structure GI Pipes Table' },
      { key: 'showNotes',             label: 'Important Notes' },
      { key: 'showDocuments',         label: 'Documents Required' },
    ]
  };

  const builtInItems = builtInItemsMap[pageType] || [];
  const customSections = config.customSections || [];

  const toggleItem = (key) => {
    const current = (config.visibility || {})[key] !== false;
    updateConfig({ ...config, visibility: { ...config.visibility, [key]: !current } });
  };

  const addCustomSection = () => {
    const trimmed = newSectionName.trim();
    if (!trimmed) return;
    const id = `cs_${Date.now()}`;
    updateConfig({
      ...config,
      customSections: [...customSections, { id, label: trimmed }],
      visibility: { ...config.visibility, [`custom_${id}`]: true },
    });
    setNewSectionName('');
    setShowAddInput(false);
  };

  const removeCustomSection = (id) => {
    const updatedVisibility = { ...config.visibility };
    delete updatedVisibility[`custom_${id}`];
    updateConfig({
      ...config,
      customSections: customSections.filter((s) => s.id !== id),
      visibility: updatedVisibility,
    });
  };

  const ToggleRow = ({ itemKey, label, isCustom = false, customId = null }) => {
    const checked = (config.visibility || {})[itemKey] !== false;
    return (
      <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 border-2 group ${checked ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-100'}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => toggleItem(itemKey)}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <span className={`text-[12px] font-bold transition-colors truncate ${checked ? 'text-blue-800' : 'text-gray-500'}`}>{label}</span>
          {isCustom && (
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">Custom</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div onClick={() => toggleItem(itemKey)} className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${checked ? 'bg-blue-600 shadow-md shadow-blue-200' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${checked ? 'left-6' : 'left-1'}`} />
          </div>
          {isCustom && customId && (
            <button
              onClick={() => removeCustomSection(customId)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50 ml-0.5"
              title="Remove section"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-7 py-5 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-white text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Settings size={17} />
              Configure: {activePage?.label}
            </h3>
            <p className="text-blue-200 text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-80">
              Choose which sections appear on this page
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/15 p-2 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">


          {pageType === 'Advanced Settings' && advancedOptions && setAdvancedOptions && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Service & Add-On Pricing</p>
              </div>
              <div className="space-y-4">
                {advancedOptions.map((opt, idx) => {
                  // Optimization: If multiple AMC plans are selected, we only want to show ONE configuration card 
                  // that handles all of them as a "Multi-Select" category. 
                  const firstAmcIdx = advancedOptions.findIndex(o => o.key === 'amc');
                  if (opt.key === 'amc' && idx !== firstAmcIdx) return null;

                  return (
                    <div key={opt.key ? `${opt.key}_${idx}` : idx} className={`p-4 rounded-xl border-2 transition-all ${opt.enabled ? 'border-blue-100 bg-blue-50/30' : 'border-gray-50 bg-white opacity-80'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={opt.enabled}
                          onChange={(e) => {
                            const newOpts = [...advancedOptions];
                            newOpts[idx].enabled = e.target.checked;
                            setAdvancedOptions(newOpts);
                          }}
                        />
                        <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{opt.key?.toUpperCase() || 'CUSTOM'} Service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {opt.enabled && <span className="text-[8px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">Active</span>}
                        <button onClick={() => setAdvancedOptions(advancedOptions.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                    {opt.enabled && (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="col-span-2">
                          <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan Title</label>
                          {opt.key === 'amc' ? (
                            <div className="space-y-4">
                               <div className="flex flex-wrap gap-2 p-1">
                                  {(dbAmcServices || []).map(service => {
                                     const isSelected = advancedOptions.some(o => o.key === 'amc' && o.type === service.serviceName && o.enabled);
                                     return (
                                       <button
                                         key={service._id}
                                         type="button"
                                         onClick={() => {
                                            const newOpts = [...advancedOptions];
                                            const existingIdx = newOpts.findIndex(o => o.key === 'amc' && o.type === service.serviceName);
                                            
                                            if (isSelected && existingIdx !== -1) {
                                               newOpts[existingIdx].enabled = false;
                                            } else if (existingIdx !== -1) {
                                               newOpts[existingIdx].enabled = true;
                                            } else {
                                               newOpts.push({
                                                  key: 'amc',
                                                  enabled: true,
                                                  type: service.serviceName,
                                                  price: Number(service.basePrice || 0),
                                                  description: service.description || service.serviceDescription || ''
                                               });
                                            }
                                            setAdvancedOptions(newOpts);
                                         }}
                                         className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 border-2 ${
                                            isSelected 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                                         }`}
                                       >
                                         <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
                                         {service.serviceName}
                                         <span className={`ml-1 opacity-60 text-[8px]`}>₹{service.basePrice}</span>
                                       </button>
                                     );
                                  })}
                               </div>
                               
                               {/* Individual Price/Description editors for selected AMC plans */}
                               <div className="space-y-3 mt-4 pt-4 border-t border-blue-100/50">
                                  {advancedOptions.filter(o => o.key === 'amc' && o.enabled).map((amcOpt, amcIdx) => {
                                     // Find original index in advancedOptions to update correctly
                                     const origIdx = advancedOptions.findIndex(o => o === amcOpt);
                                     return (
                                       <div key={amcIdx} className="bg-white/60 p-3 rounded-xl border border-blue-50">
                                          <div className="flex justify-between items-center mb-2">
                                             <span className="text-[9px] font-black text-blue-700 uppercase tracking-tighter">{amcOpt.type} Configuration</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                             <div>
                                                <label className="text-[7px] font-black text-gray-400 uppercase">Price</label>
                                                <input 
                                                  type="number" 
                                                  className="w-full bg-white border border-gray-100 rounded-lg px-2 py-1 text-[10px] font-bold text-blue-600 focus:border-blue-300 outline-none" 
                                                  value={amcOpt.price} 
                                                  onChange={(e) => {
                                                     const newOpts = [...advancedOptions];
                                                     newOpts[origIdx].price = parseFloat(e.target.value) || 0;
                                                     setAdvancedOptions(newOpts);
                                                  }}
                                                />
                                             </div>
                                             <div className="col-span-2">
                                                <label className="text-[7px] font-black text-gray-400 uppercase">Notes</label>
                                                <textarea 
                                                  className="w-full bg-white border border-gray-100 rounded-lg px-2 py-1 text-[9px] font-bold text-gray-500 h-8 resize-none focus:border-blue-300 outline-none" 
                                                  value={amcOpt.description} 
                                                  onChange={(e) => {
                                                     const newOpts = [...advancedOptions];
                                                     newOpts[origIdx].description = e.target.value;
                                                     setAdvancedOptions(newOpts);
                                                  }}
                                                />
                                             </div>
                                          </div>
                                       </div>
                                     );
                                  })}
                               </div>
                            </div>
                          ) : (
                            <input type="text" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-bold text-gray-700 outline-none focus:border-blue-300 transition-all focus:ring-2 focus:ring-blue-100" value={opt.type} onChange={(e) => { const newOpts = [...advancedOptions]; newOpts[idx].type = e.target.value; setAdvancedOptions(newOpts); }} />
                          )}
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Price (₹)</label>
                          <input type="number" className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-bold text-blue-600 outline-none focus:border-blue-300 transition-all focus:ring-2 focus:ring-blue-100" value={opt.price} onChange={(e) => { const newOpts = [...advancedOptions]; newOpts[idx].price = parseFloat(e.target.value) || 0; setAdvancedOptions(newOpts); }} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Description / Notes</label>
                          <textarea className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-[9px] font-bold text-gray-500 outline-none focus:border-blue-300 transition-all h-12 resize-none focus:ring-2 focus:ring-blue-100" value={opt.description} onChange={(e) => { const newOpts = [...advancedOptions]; newOpts[idx].description = e.target.value; setAdvancedOptions(newOpts); }} />
                        </div>
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section header row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Visible Sections</p>
            <button
              onClick={() => { setShowAddInput(!showAddInput); setNewSectionName(''); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                showAddInput ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95'
              }`}
            >
              {showAddInput
                ? <><X size={10} /> Cancel</>
                : <><span className="text-sm leading-none">+</span> Add New Section</>
              }
            </button>
          </div>

          {/* Inline add input */}
          {showAddInput && (
            <div className="mb-4 flex gap-2">
              <input
                ref={addInputRef}
                type="text"
                value={newSectionName}
                maxLength={50}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomSection();
                  if (e.key === 'Escape') { setShowAddInput(false); setNewSectionName(''); }
                }}
                placeholder="e.g. Delivery Timeline, Installation Process..."
                className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-800 placeholder:text-blue-300 focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                onClick={addCustomSection}
                disabled={!newSectionName.trim()}
                className="bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-blue-700 transition-all active:scale-95 flex-shrink-0"
              >
                Add
              </button>
            </div>
          )}

          {/* All section rows */}
          <div className="space-y-2">
            {builtInItems.map((item) => (
              <ToggleRow key={item.key} itemKey={item.key} label={item.label} />
            ))}

            {customSections.length > 0 && builtInItems.length > 0 && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Custom Sections</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}

            {customSections.map((s) => (
              <ToggleRow key={`custom_${s.id}`} itemKey={`custom_${s.id}`} label={s.label} isCustom customId={s.id} />
            ))}

            {builtInItems.length === 0 && customSections.length === 0 && (
              <div className="text-center py-10">
                <Settings size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No sections yet</p>
                <p className="text-[10px] font-bold text-gray-300 mt-1">Click "Add New Section" above to start</p>
              </div>
            )}
          </div>

          {builtInItems.length > 0 && customSections.length === 0 && !showAddInput && (
            <p className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-5">
              Use "+ Add New Section" to add custom sections
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-end border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-all hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={() => { onSave(config); onClose(); }}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            Apply Config
          </button>
        </div>

      </div>
    </div>
  );
};

const FrontPageSettingsDrawer = ({ 
  isOpen, 
  onClose, 
  initialSettings, 
  onSave, 
  selectedStates, 
  selectedDistricts, 
  states, 
  districts, 
  quoteCount, 
  solarSettings, 
  filters, 
  quotes 
}) => {
  const [settings, setSettings] = React.useState(initialSettings);
  const [activeTab, setActiveTab] = React.useState('layout');

  React.useEffect(() => {
    if (isOpen) setSettings(initialSettings);
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const update = (path, value) => {
    const keys = path.split('.');
    const next = { ...settings };
    let current = next;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setSettings(next);
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-300">
        
        {/* Left Column: Settings Panel */}
        <div className="w-[400px] border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <Layout size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 text-lg font-black uppercase tracking-tight">Front Page</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Custom Branding & Content</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <TabButton id="layout" label="Layout" icon={Layout} />
              <TabButton id="header" label="Header" icon={Type} />
              <TabButton id="banner" label="Banner" icon={Image} />
              <TabButton id="content" label="Content" icon={CheckCircle} />
              <TabButton id="styling" label="Style" icon={Zap} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
            {activeTab === 'layout' && (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 leading-none">Global Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['left', 'center', 'right'].map(align => (
                         <button
                           key={align}
                           onClick={() => update('styling.alignment', align)}
                           className={`py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${settings.styling.alignment === align ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                         >
                           {align}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Full Width Layout</span>
                       <input 
                         type="checkbox" 
                         checked={settings.styling.spacing === 'wide'} 
                         onChange={(e) => update('styling.spacing', e.target.checked ? 'wide' : 'compact')}
                         className="h-5 w-5 text-blue-600 rounded-lg"
                       />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'header' && (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'showLogo', label: 'Company Logo' },
                      { key: 'showName', label: 'Company Name' },
                      { key: 'showTagline', label: 'Tagline' },
                      { key: 'showContact', label: 'Contact Info' }
                    ].map(item => (
                      <div key={item.key} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
                         <input 
                           type="checkbox" 
                           checked={settings.header[item.key]} 
                           onChange={(e) => update(`header.${item.key}`, e.target.checked)}
                           className="h-4 w-4 text-blue-600 rounded"
                         />
                         <span className="text-[9px] font-black text-gray-600 uppercase">{item.label}</span>
                      </div>
                    ))}
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Logo URL</label>
                    <input 
                      type="text" 
                      value={settings.header.logoUrl} 
                      onChange={(e) => update('header.logoUrl', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-700"
                      placeholder="https://..."
                    />
                 </div>
              </div>
            )}

            {activeTab === 'banner' && (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Banner Image URL</label>
                    <input 
                      type="text" 
                      value={settings.banner.imageUrl} 
                      onChange={(e) => update('banner.imageUrl', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-700"
                    />
                 </div>
                 <div>
                    <div className="flex justify-between mb-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Overlay Opacity</label>
                       <span className="text-[10px] font-black text-blue-600">{Math.round(settings.banner.overlayOpacity * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={settings.banner.overlayOpacity} 
                      onChange={(e) => update('banner.overlayOpacity', parseFloat(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                 </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                 {[
                   { key: 'proposalTitle', label: 'Proposal Title' },
                   { key: 'customerName', label: 'Customer Name' },
                   { key: 'proposalNo', label: 'Proposal Serial No' },
                   { key: 'city', label: 'Installation City' },
                   { key: 'systemSize', label: 'System kW Output' },
                   { key: 'validUpto', label: 'Validity Period' }
                 ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                       <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight">{item.label}</span>
                       <input 
                         type="checkbox" 
                         checked={settings.contentVisibility[item.key]} 
                         onChange={(e) => update(`contentVisibility.${item.key}`, e.target.checked)}
                         className="h-5 w-5 text-blue-600 rounded-lg"
                       />
                    </div>
                 ))}
              </div>
            )}

            {activeTab === 'styling' && (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 leading-none">Theme Accent Color</label>
                    <div className="flex gap-3">
                       {['#2563eb', '#dc2626', '#16a34a', '#8b5cf6', '#ea580c'].map(c => (
                         <button 
                           key={c}
                           onClick={() => update('styling.themeColor', c)}
                           className={`w-10 h-10 rounded-full border-4 transition-all ${settings.styling.themeColor === c ? 'border-white ring-4 ring-blue-100 scale-110' : 'border-transparent opacity-60'}`}
                           style={{ backgroundColor: c }}
                         />
                       ))}
                       <input 
                         type="color" 
                         value={settings.styling.themeColor} 
                         onChange={(e) => update('styling.themeColor', e.target.value)}
                         className="w-10 h-10 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Font Family</label>
                    <select 
                      value={settings.styling.fontFamily} 
                      onChange={(e) => update('styling.fontFamily', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
                    >
                       <option value="Inter">Inter (Sans)</option>
                       <option value="Poppins">Poppins (Geometric)</option>
                       <option value="Montserrat">Montserrat (Modern)</option>
                    </select>
                 </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-2xl text-[11px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-all hover:bg-white"
            >
              Cancel
            </button>
            <button
              onClick={() => { onSave(settings); onClose(); }}
              className="flex-[2] bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all"
            >
              Save Brand Policy
            </button>
          </div>
        </div>

        {/* Right Column: Live Preview Area */}
        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 delay-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Live WYSIWYG Preview</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-100" />
              </div>
            </div>

            {/* Simulated Page Frame */}
            <div className="rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500" style={{ fontFamily: settings.styling.fontFamily, backgroundColor: settings.styling.bgColor || '#ffffff' }}>
              
              {/* Preview Banner */}
              <div className="relative h-64 w-full">
                <img src={settings.banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 transition-opacity duration-500" style={{ backgroundColor: `rgba(0,0,0,${settings.banner.overlayOpacity})` }} />
                <div className={`absolute inset-0 flex flex-col justify-center p-12 ${settings.styling.alignment === 'center' ? 'items-center text-center' : settings.styling.alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                  {settings.header.showLogo && <img src={settings.header.logoUrl} className="h-12 w-auto mb-6 bg-white/20 p-2 rounded-lg backdrop-blur-sm" alt="Logo" />}
                  {settings.contentVisibility.proposalTitle && (
                    <h4 className="text-white text-3xl font-black uppercase tracking-tight mb-2 drop-shadow-md">Solar Power Proposal</h4>
                  )}
                  <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: settings.styling.themeColor }} />
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-12 space-y-10" style={{ backgroundColor: settings.styling.bgColor || '#ffffff' }}>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    {settings.contentVisibility.proposalNo && (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proposal No</p>
                        <p className="text-sm font-black text-blue-600">
                          # QUA/{filters?.category?.substring(0,3)?.toUpperCase() || 'PRD'}/{states?.find(s => selectedStates?.includes(s._id))?.code || 'ST'}/26/001
                        </p>
                      </div>
                    )}
                    {settings.contentVisibility.customerName && (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</p>
                        <p className="text-sm font-black text-gray-800">Pradip Sharma</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    {settings.contentVisibility.city && (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Installation City</p>
                        <p className="text-sm font-black text-gray-800">
                          {selectedDistricts?.includes('all') 
                            ? 'All Districts' 
                            : districts?.filter(d => selectedDistricts?.includes(d._id))?.map(d => d.name)?.join(', ') || 'Select District'}
                        </p>
                      </div>
                    )}
                    {settings.contentVisibility.systemSize && (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proposed System</p>
                        <p className="text-sm font-black text-gray-800">{solarSettings?.projectKW || 10} kW Solar Plant</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulated Footer */}
                <div className="pt-10 border-t border-gray-100 flex justify-between items-center opacity-40">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Project Authorized</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Page 01 — Front Matter</span>
                </div>
              </div>
            </div>

            {/* Notification Tip */}
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Zap size={16} />
              </div>
              <p className="text-[10px] font-bold text-yellow-800 leading-normal">
                Changes made here reflect across all Generated PDF proposals for this configuration set.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
