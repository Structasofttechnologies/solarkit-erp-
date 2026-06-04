import React, { useState, useEffect, useRef } from 'react';
import { getPartnerPlans, createPartnerPlan, updatePartnerPlan, deletePartnerPlan, getPartners } from '../../../../services/partner/partnerApi';
import { getStates, getCountries, getClustersHierarchy, getDistrictsHierarchy } from '../../../../services/core/locationApi';
import { getCategories, getSubCategories, getProjectTypes, getSubProjectTypes } from '../../../../services/core/masterApi';
import { productApi } from '../../../../api/productApi';
import { getQuoteSettings } from '../../../../services/quote/quoteApi';
import {
    Rocket,
    Layers,
    Building2,
    SolarPanel,
    Plus,
    Check,
    List,
    Save,
    Trash2,
    Loader,
    X,
    Users,
    BadgeCheck,
    CheckCircle2,
    MapPin,
    Settings,
    CreditCard,
    Target,
    Percent,
    Video,
    Monitor,
    Edit,
    Globe,
    Star,
    MessageSquare,
    ChevronDown,
    Truck,
    ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getVendorDeliveryPlans } from '../../../../services/delivery/deliveryApi';

const PlanPreview = ({ formData, getIcon }) => {
    const { config, ui, name, price, priceDescription, yearlyTargetKw, cashbackAmount, userDescription } = formData;
    const headerColor = ui?.headerColor || '#0078bd';
    const buttonColor = ui?.buttonColor || '#0078bd';

    return (
        <div className="w-full lg:w-[22%] sticky top-20 bg-white shadow-2xl flex flex-col rounded-2xl overflow-hidden self-start border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Section */}
            <div 
                className="w-full p-8 text-center text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]"
                style={{ backgroundColor: headerColor }}
            >
                <div className="absolute -top-4 -right-4 opacity-10 transform scale-150">
                    {getIcon(ui?.icon, "w-32 h-32 rotate-12")}
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md mb-3">
                        {getIcon(ui?.icon, "w-8 h-8 text-white")}
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-1 leading-tight">{name || 'Plan Name'}</h2>
                    <p className="text-xs font-bold opacity-80 tracking-widest uppercase">Premium Partner Access</p>
                </div>
            </div>

            <div className="p-6 space-y-6 bg-white">
                {/* Price Section */}
                <div className="text-center py-2">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl font-bold text-gray-300">₹</span>
                        <span className="text-5xl font-black text-gray-800 tracking-tighter tabular-nums">{price || 0}</span>
                    </div>
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] mt-2">{priceDescription || 'Subscription Fee'}</p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-50 text-center transition-all hover:bg-blue-50">
                        <p className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-tighter">Yearly Target</p>
                        <p className="text-xl font-black text-blue-700 tabular-nums">{config?.incentive?.yearlyTarget || yearlyTargetKw || 0}<span className="text-xs ml-0.5 opacity-60">kW</span></p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-50 text-center transition-all hover:bg-green-50">
                        <p className="text-[10px] font-black text-green-400 uppercase mb-1 tracking-tighter">Incentive</p>
                        <p className="text-xl font-black text-green-700 tabular-nums"><span className="text-xs mr-0.5 opacity-60">₹</span>{config?.incentive?.totalIncentive || cashbackAmount || 0}</p>
                    </div>
                </div>

                {/* Dynamic Features List */}
                <div className="space-y-5 pt-2">
                    <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-100 flex-1"></div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Plan Configuration</h4>
                        <div className="h-px bg-gray-100 flex-1"></div>
                    </div>
                    
                    <div className="space-y-3">
                        {/* KYC Section */}
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-600">KYC Required</span>
                            </div>
                            <div className="flex gap-1.5">
                                {config?.kyc?.aadhar && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200" title="Aadhar" />}
                                {config?.kyc?.pan && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-200" title="PAN" />}
                                {config?.kyc?.gst && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-200" title="GST" />}
                                {!config?.kyc?.aadhar && !config?.kyc?.pan && !config?.kyc?.gst && <span className="text-[10px] font-bold text-gray-300">None</span>}
                            </div>
                        </div>
                        
                        {/* Eligibility */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-600">Eligibility</span>
                            </div>
                            <span className="text-[10px] font-black text-gray-800 uppercase bg-gray-100 px-2 py-0.5 rounded">
                                {config?.eligibility?.kyc ? 'Verified' : 'Basic'}
                            </span>
                        </div>

                        {/* Coverage */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-600">Operation Area</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                                {config?.coverage?.area}
                            </span>
                        </div>

                        {/* GST Info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-600">GST Status</span>
                            </div>
                            <span className="text-[10px] font-black text-gray-800 uppercase">
                                {config?.eligibility?.gstRequired ? `₹${config.eligibility.gstAmount} Extra` : 'Inclusive'}
                            </span>
                        </div>

                        {/* Documents */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-600">Documents</span>
                            </div>
                            <span className="text-[10px] font-black text-gray-800 uppercase">
                                {formData.documents?.length > 0 ? `${formData.documents.length} Added` : 'Required'}
                            </span>
                        </div>
                    </div>

                    {/* Project Types Tag Cloud */}
                    {(config?.projectType?.length > 0 || config?.category?.length > 0) && (
                        <div className="pt-4 space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Project Access</p>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                {config?.projectType?.map(range => (
                                    <span key={range} className="text-[9px] font-bold bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg border border-gray-100 transition-all hover:border-blue-200 hover:text-blue-600">
                                        {range}
                                    </span>
                                ))}
                                {config?.category?.map(catId => {
                                    // This assumes masterCategories is available or we just show IDs if not
                                    // For preview we'll just show 'Active' if no mapping
                                    return null; 
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Upgrade Button */}
                <button 
                    className="w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 mt-6 group"
                    style={{ backgroundColor: buttonColor }}
                >
                    Upgrade Plan <Rocket className="w-4 h-4 group-hover:animate-bounce" />
                </button>
            </div>
            
            {/* Footer Status */}
            <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${formData.isActive ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-gray-400'}`}></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{formData.isActive ? 'Active Plan' : 'Draft'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                    <Users className="w-3.5 h-3.5" /> {userDescription || 'Standard Access'}
                </div>
            </div>
        </div>
    );
};

export default function PartnerPlans() {
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [selectedPartnerTypes, setSelectedPartnerTypes] = useState([]);
    const [selectedCountryIds, setSelectedCountryIds] = useState([]);
    const [selectedStateIds, setSelectedStateIds] = useState([]);
    const [selectedClusterIds, setSelectedClusterIds] = useState([]);
    const [selectedDistrictIds, setSelectedDistrictIds] = useState([]);

    const handleToggleSelection = (list, setList, id) => {
        if (list.includes(id)) {
            setList(list.filter(item => item !== id));
        } else {
            setList([...list, id]);
        }
    };
    const [plans, setPlans] = useState([]);
    const [globalPlans, setGlobalPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);

    // Initial Form State Template directly mapped to generic Schema
    const [masterCategories, setMasterCategories] = useState([]);
    const [masterSubCategories, setMasterSubCategories] = useState([]);
    const [masterProjectTypes, setMasterProjectTypes] = useState([]);
    const [masterSubProjectTypes, setMasterSubProjectTypes] = useState([]);
    const [masterMappings, setMasterMappings] = useState([]);
    const [masterQuoteSettings, setMasterQuoteSettings] = useState([]);
    const [masterDeliveryPlans, setMasterDeliveryPlans] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null); 

    const dropdownRef = useRef(null);

    // Close dropdown on outside click or ESC key
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    const initialFormState = {
        name: '',
        description: '',
        price: 0,
        priceDescription: 'signup fees',
        yearlyTargetKw: 0,
        cashbackAmount: 0,
        accessType: '',
        userLimit: 1,
        userDescription: '',
        projectTypes: [],
        features: [],
        documents: [],
        depositFees: 0,
        isActive: true,
        // Using config to store all other nested configurations
        config: {
            kyc: { aadhar: true, pan: true, gst: false, verifiedPartner: false, notVerifiedPartner: true },
            eligibility: { kyc: true, agreement: true, depositCheque: true, gstRequired: false, gstAmount: '', depositAmount: '', noCashback: false },
            coverage: { area: '1 District', city: false, district: true, cluster: false, state: false, accessApp: true, accessCrm: true },
            user: { 
                sales: true, salesLimit: 10,
                admin: true, adminLimit: 10,
                leadPartner: true, leadPartnerLimit: 10,
                service: true, serviceLimit: 10,
                noSublogin: false 
            },
            category: [],
            subCategory: [],
            projectType: [],
            subProjectType: [],
            features: { adminApp: true, adminCrm: false, userApp: true, leadPartner: true, districtManager: false, appSubUser: false, crmLeadManagement: true, assignLead: true, crmKnowMargin: true, crmSurveyBom: true, crmInstall: true, crmService: false, crmProjectManagement: false, crmAmcPlan: false },
            quote: { quickQuote: true, surveyQuote: true, generationGraph: false, addons: false, projectSignupLimit: '', deliveryType: '' },
            quoteSettings: [],
            deliveryPlans: [],
            fees: { signupFees: '', installerCharges: '', sdAmountCheque: '', upgradeFees: '', directUpgradeFees: '' },
            incentive: { yearlyTarget: '', cashbackPerKw: '', totalIncentive: '' },
            commissions: []
        },
        ui: { headerColor: '#0078bd', buttonColor: '#0078bd', icon: 'Rocket', iconColor: 'text-[#0078bd]', bgColor: 'bg-blue-50' }
    };

    const [formData, setFormData] = useState(initialFormState);

    // Initial Fetch for Partners and States
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [partnersData, countriesData, catData, subCatData, subTypeData, mappingRes, quoteRes, deliveryRes, allPlansRes] = await Promise.all([
                getPartners(),
                getCountries(),
                getCategories(),
                getSubCategories(),
                getSubProjectTypes(),
                productApi.getProjectCategoryMappings(),
                getQuoteSettings(),
                getVendorDeliveryPlans(),
                getPartnerPlans() // Fetch all plans initially for global counting
            ]);
            setPartners(partnersData);
            setCountries(countriesData);
            setMasterCategories(catData.data || catData);
            setMasterSubCategories(subCatData.data || subCatData);
            setMasterSubProjectTypes(subTypeData.data || subTypeData);
            setMasterQuoteSettings(quoteRes?.data || quoteRes || []);
            setMasterDeliveryPlans(deliveryRes?.data || deliveryRes || []);
            setGlobalPlans(allPlansRes || []);

            // Store raw mappings for dependent filtering
            const mappings = mappingRes?.data?.data || mappingRes?.data || [];
            setMasterMappings(mappings);

            // Process Mappings to get initial kW ranges (will be filtered later)
            const uniqueRanges = [];
            const seenRanges = new Set();
            mappings.forEach(m => {
                const rangeLabel = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
                if (!seenRanges.has(rangeLabel)) {
                    seenRanges.add(rangeLabel);
                    uniqueRanges.push({ _id: rangeLabel, name: rangeLabel });
                }
            });
            setMasterProjectTypes(uniqueRanges);

            if (partnersData.length > 0) {
                setSelectedPartnerTypes([partnersData[0].name]);
            }
            if (countriesData.length > 0) {
                setSelectedCountryIds([countriesData[0]._id]);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    // Cascading: Fetch States when Country changes
    useEffect(() => {
        if (selectedCountryIds.length > 0) {
            const fetchStatesForCountry = async () => {
                try {
                    const data = await getStates({ countryId: selectedCountryIds.join(',') });
                    setStates(data);
                    setSelectedStateIds([]);
                    setSelectedClusterIds([]);
                    setSelectedDistrictIds([]);
                } catch (error) {
                    console.error('Error fetching states:', error);
                }
            };
            fetchStatesForCountry();
        } else {
            setStates([]);
            setSelectedStateIds([]);
            setSelectedClusterIds([]);
            setSelectedDistrictIds([]);
        }
    }, [selectedCountryIds]);

    // Cascading: Fetch Clusters when State changes
    useEffect(() => {
        if (selectedStateIds.length > 0) {
            const fetchClustersForState = async () => {
                try {
                    const data = await getClustersHierarchy(selectedStateIds.join(','));
                    setClusters(data);
                    setSelectedClusterIds([]);
                    setSelectedDistrictIds([]);
                } catch (error) {
                    console.error('Error fetching clusters:', error);
                }
            };
            fetchClustersForState();
        } else {
            setClusters([]);
            setSelectedClusterIds([]);
            setSelectedDistrictIds([]);
        }
    }, [selectedStateIds]);

    // Cascading: Fetch Districts when Cluster changes
    useEffect(() => {
        if (selectedClusterIds.length > 0) {
            const fetchDistrictsForCluster = async () => {
                try {
                    const data = await getDistrictsHierarchy(selectedClusterIds.join(','));
                    setDistricts(data);
                    setSelectedDistrictIds([]);
                } catch (error) {
                    console.error('Error fetching districts:', error);
                }
            };
            fetchDistrictsForCluster();
        } else {
            setDistricts([]);
            setSelectedDistrictIds([]);
        }
    }, [selectedClusterIds]);

    // Fetch Plans when any filter changes
    useEffect(() => {
        if (selectedPartnerTypes.length > 0) {
            fetchPlans();
        } else {
            setPlans([]);
            setSelectedPlanId(null);
            setFormData(initialFormState);
        }
    }, [selectedPartnerTypes, selectedCountryIds, selectedStateIds, selectedClusterIds, selectedDistrictIds]);

    const getPlanCount = (category, value) => {
        // Filter global plans by OTHER categories to get context-aware count
        let filtered = globalPlans;
        
        if (category !== 'partnerType' && selectedPartnerTypes.length > 0) {
            filtered = filtered.filter(p => p.partnerType?.some(t => selectedPartnerTypes.includes(t)));
        }
        if (category !== 'country' && selectedCountryIds.length > 0) {
            filtered = filtered.filter(p => p.country?.some(id => selectedCountryIds.includes(id._id || id)));
        }
        if (category !== 'state' && selectedStateIds.length > 0) {
            filtered = filtered.filter(p => p.state?.some(id => selectedStateIds.includes(id._id || id)));
        }
        if (category !== 'cluster' && selectedClusterIds.length > 0) {
            filtered = filtered.filter(p => p.cluster?.some(id => selectedClusterIds.includes(id._id || id)));
        }
        if (category !== 'district' && selectedDistrictIds.length > 0) {
            filtered = filtered.filter(p => p.district?.some(id => selectedDistrictIds.includes(id._id || id)));
        }

        // Finally count occurrences of the current value
        return filtered.filter(p => {
            const field = p[category];
            if (!field) return false;
            if (Array.isArray(field)) {
                return field.some(v => (v._id || v) === value);
            }
            return (field._id || field) === value;
        }).length;
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            
            // Fetch both filtered and global plans
            const [filteredData, allPlansRes] = await Promise.all([
                getPartnerPlans(
                    selectedPartnerTypes.join(','), 
                    selectedStateIds.join(','), 
                    selectedCountryIds.join(','), 
                    selectedClusterIds.join(','), 
                    selectedDistrictIds.join(',')
                ),
                getPartnerPlans() // Refresh global list for counts
            ]);

            setGlobalPlans(allPlansRes || []);
            
            // Safety filter: Deduplicate by name if backend has legacy duplicates
            const uniqueData = [];
            const seenNames = new Set();
            (filteredData || []).forEach(plan => {
                if (!seenNames.has(plan.name)) {
                    seenNames.add(plan.name);
                    uniqueData.push(plan);
                }
            });

            setPlans(uniqueData);
            if (uniqueData.length > 0) {
                const firstPlanId = uniqueData[0]._id;
                setSelectedPlanId(firstPlanId);
                loadPlanData(uniqueData[0]);
            } else {
                setSelectedPlanId(null);
                setFormData(initialFormState);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to load plans for selected configuration');
        } finally {
            setLoading(false);
        }
    };

    const loadPlanData = (plan) => {
        setFormData({
            ...initialFormState,
            ...plan,
            config: {
                ...initialFormState.config,
                ...plan.config
            }
        });
    };

    const handlePlanSelect = (planId) => {
        setSelectedPlanId(planId);
        const plan = plans.find(p => p._id === planId);
        if (plan) {
            loadPlanData(plan);
        }
    };

    const handleRootInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleUiChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            ui: {
                ...(prev.ui || {}),
                [field]: value
            }
        }));
    };

    const handleAddCommissionRow = () => {
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                commissions: [...(prev.config.commissions || []), { category: '', subCategory: '', projectType: '', subProjectType: '', amount: '' }]
            }
        }));
    };

    const handleRemoveCommissionRow = (index) => {
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                commissions: prev.config.commissions.filter((_, i) => i !== index)
            }
        }));
    };

    const handleCommissionChange = (index, field, value) => {
        const newCommissions = [...formData.config.commissions];
        newCommissions[index][field] = value;
        handleInputChange('commissions', null, newCommissions);
    };

    const calculateIncentive = () => {
        const target = parseFloat(formData.config?.incentive?.yearlyTarget) || 0;
        const rate = parseFloat(formData.config?.incentive?.cashbackPerKw) || 0;
        const total = target * rate;
        handleInputChange('incentive', 'totalIncentive', total.toString());
        toast.success(`Calculated Total Incentive: ₹${total}`);
    };

    // Adjusted handleInputChange to support setting entire arrays/objects
    const handleInputChange = (section, field, value) => {
        setFormData(prev => {
            let updatedSectionData;
            if (field === null) {
                updatedSectionData = value;
            } else {
                updatedSectionData = {
                    ...(prev.config[section] || {}),
                    [field]: value
                };
            }

            const newState = {
                ...prev,
                config: {
                    ...prev.config,
                    [section]: updatedSectionData
                }
            };

            // Synchronize main price with Fees Amount (gstAmount) in Eligibility section
            if (section === 'eligibility' && field === 'gstAmount') {
                newState.price = value;
            }

            // Synchronize Yearly Target and Incentive root properties
            if (section === 'incentive' && field === 'yearlyTarget') {
                newState.yearlyTargetKw = value;
            }
            if (section === 'incentive' && field === 'totalIncentive') {
                newState.cashbackAmount = value;
            }

            return newState;
        });
    };

    const handleSave = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            setLoading(true);
            if (selectedPlanId) {
                await updatePartnerPlan(selectedPlanId, { 
                    ...formData, 
                    partnerType: selectedPartnerTypes, 
                    country: selectedCountryIds,
                    state: selectedStateIds,
                    cluster: selectedClusterIds,
                    district: selectedDistrictIds
                });
                toast.success('Plan updated successfully');
                fetchPlans(); // Refresh
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update plan');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        try {
            const newPlan = {
                ...initialFormState,
                name: formData.name || 'New Plan',
                price: parseFloat(formData.price) || 0,
                partnerType: selectedPartnerTypes,
                country: selectedCountryIds,
                state: selectedStateIds,
                cluster: selectedClusterIds,
                district: selectedDistrictIds
            };
            await createPartnerPlan(newPlan);
            toast.success('Plan created successfully');
            setShowAddPlanModal(false);
            fetchPlans();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create plan');
        }
    };

    const handleDeletePlan = async (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await deletePartnerPlan(id);
                toast.success('Plan deleted');
                fetchPlans();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete plan');
            }
        }
    };

    // Icons map for URI rendering
    const getIcon = (iconName, className) => {
        switch (iconName) {
            case 'Rocket': return <Rocket className={className} />;
            case 'Layers': return <Layers className={className} />;
            case 'Building2': return <Building2 className={className} />;
            case 'SolarPanel': return <SolarPanel className={className} />;
            default: return <Rocket className={className} />;
        }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100; // Account for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    if (loading && partners.length === 0) {
        return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #bbb; }
            `}</style>
            {/* Context Selectors */}
            <div className="mb-6 space-y-6">
                {/* 1. Partner Type Selection */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3 ml-1">Select Partner Type</h2>
                    <div className="flex flex-wrap gap-4">
                        {partners.map((partner) => {
                            const isSelected = selectedPartnerTypes.includes(partner.name);
                            const selectionIndex = selectedPartnerTypes.indexOf(partner.name);
                            return (
                                <div
                                    key={partner._id}
                                    onClick={() => setSelectedPartnerTypes([partner.name])}
                                    className={`relative cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[150px] transition-all bg-white border ${
                                        isSelected
                                            ? 'border-blue-500 text-blue-600 font-bold ring-1 ring-blue-500 bg-blue-50'
                                            : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                    }`}
                                >
                                    {getPlanCount('partnerType', partner.name) > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md z-10 animate-in zoom-in duration-200">
                                            {getPlanCount('partnerType', partner.name)}
                                        </div>
                                    )}
                                    {partner.name}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Location Cascade Selection */}
                {selectedPartnerTypes.length > 0 && (
                    <div className="pt-2 space-y-6">
                        {/* Country Selection */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-3 ml-1 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-600" /> Select Country
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {countries.map((country) => {
                                    const isSelected = selectedCountryIds.includes(country._id);
                                    const selectionIndex = selectedCountryIds.indexOf(country._id);
                                    return (
                                        <div
                                            key={country._id}
                                            onClick={() => setSelectedCountryIds([country._id])}
                                            className={`relative cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[180px] transition-all bg-white border ${
                                                isSelected
                                                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            {getPlanCount('country', country._id) > 0 && (
                                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 animate-in zoom-in duration-200">
                                                    {getPlanCount('country', country._id)}
                                                </div>
                                            )}
                                            <div className={`font-bold text-lg ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                                                {country.name}
                                            </div>
                                            <div className="text-gray-500 text-sm mt-1 uppercase tracking-wider">
                                                {country.code || country.name.substring(0, 3).toUpperCase()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* State Selection */}
                        {selectedCountryIds.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <h2 className="text-lg font-bold text-gray-800 mb-3 ml-1 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" /> Select State
                                </h2>
                                <div className="flex flex-wrap gap-4">
                                    {states.length > 0 ? (
                                        states.map((state) => {
                                            const isSelected = selectedStateIds.includes(state._id);
                                            const selectionIndex = selectedStateIds.indexOf(state._id);
                                            return (
                                                <div
                                                    key={state._id}
                                                    onClick={() => setSelectedStateIds([state._id])}
                                                    className={`relative cursor-pointer px-6 py-4 rounded-xl shadow-sm text-center min-w-[180px] transition-all bg-white border ${
                                                        isSelected
                                                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    {getPlanCount('state', state._id) > 0 && (
                                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 animate-in zoom-in duration-200">
                                                            {getPlanCount('state', state._id)}
                                                        </div>
                                                    )}
                                                    <div className={`font-bold text-lg ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                                                        {state.name}
                                                    </div>
                                                    <div className="text-gray-500 text-sm mt-1 uppercase">
                                                        {state.code || state.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="bg-gray-100/50 rounded-xl p-4 text-center text-gray-400 border border-dashed w-full max-w-sm">
                                            No states found for this country
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-6">
                            {/* Cluster Selection */}
                            {selectedStateIds.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h2 className="text-lg font-bold text-gray-800 mb-3 ml-1 flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-blue-600" /> Select Cluster
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {clusters.length > 0 ? (
                                            clusters.map((cluster) => {
                                                const isSelected = selectedClusterIds.includes(cluster._id);
                                                const selectionIndex = selectedClusterIds.indexOf(cluster._id);
                                                return (
                                                    <div
                                                        key={cluster._id}
                                                        onClick={() => setSelectedClusterIds([cluster._id])}
                                                        className={`relative cursor-pointer px-6 py-3 rounded-xl shadow-sm text-center min-w-[160px] transition-all bg-white border ${
                                                            isSelected
                                                                ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        {getPlanCount('cluster', cluster._id) > 0 && (
                                                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 animate-in zoom-in duration-200">
                                                                {getPlanCount('cluster', cluster._id)}
                                                            </div>
                                                        )}
                                                        <div className={`font-bold ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                                                            {cluster.name || cluster.clusterName || 'Unnamed'}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-gray-100/50 rounded-xl p-4 text-center text-gray-400 border border-dashed text-sm w-full max-w-sm">
                                                No clusters found for this state
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* District Selection */}
                            {selectedClusterIds.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h2 className="text-lg font-bold text-gray-800 mb-3 ml-1 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-600" /> Select District
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {districts.length > 0 ? (
                                            districts.map((district) => {
                                                const isSelected = selectedDistrictIds.includes(district._id);
                                                const selectionIndex = selectedDistrictIds.indexOf(district._id);
                                                return (
                                                    <div
                                                        key={district._id}
                                                        onClick={() => setSelectedDistrictIds([district._id])}
                                                        className={`relative cursor-pointer px-6 py-3 rounded-xl shadow-sm text-center min-w-[160px] transition-all bg-white border ${
                                                            isSelected
                                                                ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        {getPlanCount('district', district._id) > 0 && (
                                                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 animate-in zoom-in duration-200">
                                                                {getPlanCount('district', district._id)}
                                                            </div>
                                                        )}
                                                        <div className={`font-bold ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                                                            {district.name || district.districtName || 'Unnamed'}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-gray-100/50 rounded-xl p-4 text-center text-gray-400 border border-dashed text-sm w-full max-w-sm">
                                                No districts found for this cluster
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {selectedPartnerTypes.length > 0 && (
                    <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Selected Partner Type</p>
                            <p className="text-sm font-bold text-gray-700">{selectedPartnerTypes[0]}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8">
                {/* 3. Plans Selection and Configuration Section */}
                {loading && partners.length > 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold">Fetching Partner Plans...</p>
                    </div>
                ) : (selectedPartnerTypes.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm animate-in fade-in zoom-in">
                        <div className="bg-blue-50 p-6 rounded-full mb-6">
                            <Building2 className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Partner Type</h3>
                        <p className="text-gray-500 max-w-xs text-center">
                            Please choose a partner type from the top to view and configure their available plans.
                        </p>
                    </div>
                ) : (
                <div className="flex flex-col gap-6">
                    {/* Top Pill Navigation for Plans */}
                    <div className="flex flex-col lg:flex-row items-center justify-start gap-6 border-b border-gray-200 pb-2">
                        <div className="flex flex-wrap gap-2 overflow-visible w-auto pt-5 pb-3 px-3">
                            {plans.map(plan => {
                                let isSelected = selectedPlanId === plan._id;
                                let buttonClass = 'px-4 py-2 font-bold whitespace-nowrap transition-colors flex items-center gap-2 rounded-md';
                                let customStyle = {};
                                
                                // Safely resolve color, ignoring legacy tailwind classes
                                let safeColor = (plan.ui?.buttonColor && plan.ui.buttonColor.startsWith('#')) 
                                    ? plan.ui.buttonColor 
                                    : '#0078bd';
                                
                                if (isSelected) {
                                    buttonClass += ' text-white shadow-md';
                                    customStyle = {
                                        backgroundColor: safeColor,
                                        color: '#ffffff',
                                    };
                                } else {
                                    buttonClass += ' hover:bg-gray-50 border border-gray-200';
                                    customStyle = {
                                        color: safeColor,
                                        backgroundColor: 'transparent',
                                    };
                                }

                                return (
                                    <div key={plan._id} className="relative group">
                                        <button
                                            onClick={() => handlePlanSelect(plan._id)}
                                            className={buttonClass}
                                            style={customStyle}
                                        >
                                            {getIcon(plan.ui?.icon, "w-4 h-4")}
                                            {plan.name}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan._id); }}
                                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-30 hover:bg-red-600 hover:scale-110"
                                            title="Delete Plan"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex shrink-0 mt-2 lg:mt-0">
                            <button
                                onClick={() => {
                                    setFormData(initialFormState);
                                    setShowAddPlanModal(true);
                                }}
                                className="bg-[#343a40] hover:bg-[#23272b] text-white px-4 py-2 rounded-md flex items-center gap-2 font-bold transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add More Plan
                            </button>
                        </div>
                    </div>

                    {selectedPlanId && (
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Left Scroll Sidebar */}
                            <div className="w-full lg:w-[18%] sticky top-20 bg-white border border-gray-200 hidden lg:block rounded-md overflow-hidden text-sm self-start shadow-md">
                                <div className="bg-[#0078bd] text-white px-4 py-3 font-bold flex items-center gap-3 text-lg border-b border-[#006ba9]">
                                    <List className="w-6 h-6" /> Plan Sections
                                </div>
                                <div className="flex flex-col py-3 bg-white">
                                    {[
                                        { name: 'KYC Requirements', id: 'kyc-requirements' },
                                        { name: 'Eligibility', id: 'eligibility' },
                                        { name: 'Coverage & Project Types', id: 'coverage-&-project-types' },
                                        { name: 'User Management', id: 'user-management' },
                                        { name: 'Category Types', id: 'category-types' },
                                        { name: 'CRM Login Modules', id: 'features' },
                                        { name: 'Quote Settings', id: 'quote-settings' },
                                        { name: 'Delivery Plans', id: 'fees-&-charges' },
                                        { name: 'Incentive& Targets', id: 'incentive-&-targets' },
                                        { name: 'Training Videos', id: 'training-videos' }
                                    ].map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => scrollToSection(item.id)}
                                            className="px-5 py-3.5 text-left hover:bg-gray-50 text-[#555] flex items-start gap-3 font-medium transition-colors border-b border-gray-50 last:border-0 leading-tight"
                                        >
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> 
                                            <span className="text-[15px]">{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Center Content Form */}
                            <div className="w-full lg:w-[62%] bg-white rounded-lg shadow-md border border-gray-200 p-8 space-y-12" ref={dropdownRef}>
                                {/* Plan Header */}
                                <div className="border-b-2 border-blue-600 pb-4 mb-8 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <h1 className="text-3xl font-bold text-[#0078bd]">{formData.name}</h1>
                                        <div className="flex gap-6">
                                            <button className="text-blue-600 flex items-center gap-1.5 font-medium hover:underline text-sm">
                                                <Edit className="w-4 h-4" /> Edit Plan
                                            </button>
                                            <button className="text-blue-600 flex items-center gap-1.5 font-medium hover:underline text-sm">
                                                <MessageSquare className="w-4 h-4" /> Edit Msg
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[#777] font-medium">Configure settings for the {formData.name.toLowerCase()}</p>
                                    
                                    {/* CRM Card Branding - Moved from UI & Branding */}
                                    <div className="mt-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <label className="text-[10px] uppercase font-bold text-blue-700 mb-1">Card Theme Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="color" 
                                                        value={formData.ui?.headerColor?.startsWith('#') ? formData.ui.headerColor : '#0078bd'} 
                                                        onChange={(e) => handleUiChange('headerColor', e.target.value)} 
                                                        className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
                                                    />
                                                    <span className="text-xs font-mono text-gray-600">{formData.ui?.headerColor || '#0078bd'}</span>
                                                </div>
                                            </div>
                                            <div className="w-px h-10 bg-blue-200"></div>
                                            <div className="flex flex-col">
                                                <label className="text-[10px] uppercase font-bold text-blue-700 mb-1">Button Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="color" 
                                                        value={formData.ui?.buttonColor?.startsWith('#') ? formData.ui.buttonColor : '#0078bd'} 
                                                        onChange={(e) => handleUiChange('buttonColor', e.target.value)} 
                                                        className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
                                                    />
                                                    <span className="text-xs font-mono text-gray-600">{formData.ui?.buttonColor || '#0078bd'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1 max-w-[200px]">
                                            <label className="text-[10px] uppercase font-bold text-blue-700 mb-1">Card Icon (Lucide Name)</label>
                                            <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. Rocket"
                                                        value={formData.ui?.icon || ''} 
                                                        onChange={(e) => handleUiChange('icon', e.target.value)} 
                                                        className="w-full border-blue-200 border rounded px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-400 outline-none"
                                                    />
                                            </div>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-blue-100 flex items-center gap-2">
                                            <p className="text-[10px] text-gray-400 italic leading-tight">These colors and icons will be used for plan cards in the Partner CRM.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Sections mapping closely to UI screenshot design */}
                                
                                {/* KYC Requirements */}
                                <div id="kyc-requirements" className="border rounded-md border-gray-200 overflow-hidden shadow-sm">
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold flex justify-between items-center text-lg text-left">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-5 h-5" /> KYC Requirements
                                        </div>
                                        <span className="bg-white text-[#0078bd] text-[10px] uppercase font-bold px-2.5 py-1 rounded">Required</span>
                                    </div>
                                    <div className="p-5 grid grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3 text-base">KYC Documents</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.kyc?.aadhar} onChange={(e) => handleInputChange('kyc', 'aadhar', e.target.checked)} className="rounded" /> <span className="text-gray-700">Aadhar Card</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.kyc?.pan} onChange={(e) => handleInputChange('kyc', 'pan', e.target.checked)} className="rounded" /> <span className="text-gray-700">PAN Card</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.kyc?.gst} onChange={(e) => handleInputChange('kyc', 'gst', e.target.checked)} className="rounded" /> <span className="text-gray-700">GST Certificate</span></label>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3 text-base">Verification Status</h4>
                                            <div className="space-y-2 mb-4">
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.kyc?.verifiedPartner} onChange={(e) => handleInputChange('kyc', 'verifiedPartner', e.target.checked)} className="rounded" /> <span className="text-gray-700">Verified Dealer</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.kyc?.notVerifiedPartner} onChange={(e) => handleInputChange('kyc', 'notVerifiedPartner', e.target.checked)} className="rounded bg-blue-600" /> <span className="text-gray-700">Not Verified Dealer</span></label>
                                            </div>
                                            <h4 className="font-bold text-gray-800 mb-3 text-base">Additional Documents</h4>
                                            <input type="file" className="text-sm text-gray-600 border rounded p-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Eligibility */}
                                <div id="eligibility" className="border rounded-md border-gray-200 overflow-hidden shadow-sm">
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold flex items-center gap-2 text-lg text-left">
                                        <CheckCircle2 className="w-5 h-5" /> Eligibility Requirements
                                    </div>
                                    <div className="p-5 grid grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3 text-base text-left">Basic Requirements</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.eligibility?.kyc} onChange={(e) => handleInputChange('eligibility', 'kyc', e.target.checked)} className="rounded" /> <span className="text-gray-700">KYC Verified</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.eligibility?.agreement} onChange={(e) => handleInputChange('eligibility', 'agreement', e.target.checked)} className="rounded" /> <span className="text-gray-700">Agreement Signed</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.config?.eligibility?.depositCheque} onChange={(e) => handleInputChange('eligibility', 'depositCheque', e.target.checked)} className="rounded" /> <span className="text-gray-700">Security Deposit Cheque</span></label>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 mb-1 text-sm text-left">GST Requirements</h4>
                                                    <select value={formData.config?.eligibility?.gstRequired ? 'yes' : 'no'} onChange={(e) => handleInputChange('eligibility', 'gstRequired', e.target.value === 'yes')} className="w-full border rounded p-2 text-sm">
                                                        <option value="no">No</option>
                                                        <option value="yes">Yes</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 mb-1 text-sm text-left">Fees Amount</h4>
                                                    <input type="text" placeholder="₹ 0" value={formData.config?.eligibility?.gstAmount || ''} onChange={(e) => handleInputChange('eligibility', 'gstAmount', e.target.value)} className="w-full border rounded p-2 text-sm" />
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 pt-2"><input type="checkbox" checked={!!formData.config?.eligibility?.noCashback} onChange={(e) => handleInputChange('eligibility', 'noCashback', e.target.checked)} className="rounded" /> <span className="text-gray-700 font-bold">No Cashback for this plan</span></label>
                                        </div>
                                    </div>
                                </div>

                                {/* Coverage & Project Types */}
                                <div id="coverage-&-project-types" className="border rounded-md border-gray-200 overflow-hidden shadow-sm">
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold flex items-center gap-2 text-lg text-left">
                                        <Globe className="w-5 h-5" /> Coverage & Project Types
                                    </div>
                                    <div className="p-5 grid grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3 text-base text-left">Operation Area</h4>
                                            <select value={formData.config?.coverage?.area || ''} onChange={(e) => handleInputChange('coverage', 'area', e.target.value)} className="w-full border rounded p-3 mb-4 text-sm">
                                                <option value="1 District">1 District</option>
                                                <option value="Whole State">Whole State</option>
                                                <option value="Multiple Districts">Multiple Districts</option>
                                            </select>
                                            <div className="grid grid-cols-2 gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="coverageLevel"
                                                        checked={!!formData.config?.coverage?.city} 
                                                        onChange={() => handleInputChange('coverage', null, { ...formData.config.coverage, city: true, district: false, cluster: false, state: false })} 
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-gray-700 text-sm">City Level</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="coverageLevel"
                                                        checked={!!formData.config?.coverage?.district} 
                                                        onChange={() => handleInputChange('coverage', null, { ...formData.config.coverage, city: false, district: true, cluster: false, state: false })} 
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-gray-700 text-sm">District Level</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="coverageLevel"
                                                        checked={!!formData.config?.coverage?.cluster} 
                                                        onChange={() => handleInputChange('coverage', null, { ...formData.config.coverage, city: false, district: false, cluster: true, state: false })} 
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-gray-700 text-sm">Cluster Level</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="coverageLevel"
                                                        checked={!!formData.config?.coverage?.state} 
                                                        onChange={() => handleInputChange('coverage', null, { ...formData.config.coverage, city: false, district: false, cluster: false, state: true })} 
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-gray-700 text-sm">State Level</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3 text-base text-left">Access Types (Single Selection)</h4>
                                            <div className="flex flex-col gap-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="accessType"
                                                        checked={formData.config?.coverage?.accessApp && !formData.config?.coverage?.accessCrm} 
                                                        onChange={() => handleInputChange('coverage', null, { ...formData.config.coverage, accessApp: true, accessCrm: false })} 
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-gray-700 font-medium">App Access Only</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="accessType"
                                                        checked={!formData.config?.coverage?.accessApp && formData.config?.coverage?.accessCrm} 
                                                        onChange={() => handleInputChange('coverage', null, { ...formData.config.coverage, accessApp: false, accessCrm: true })} 
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-gray-700 font-medium">CRM Access Only</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="accessType"
                                                        checked={formData.config?.coverage?.accessApp && formData.config?.coverage?.accessCrm} 
                                                        onChange={() => handleInputChange('coverage', null, { ...formData.config.coverage, accessApp: true, accessCrm: true })} 
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-gray-700 font-medium">Both (App & CRM)</span>
                                                </label>
                                                <div className="mt-1 text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-full w-fit">
                                                    {formData.config?.coverage?.accessApp && formData.config?.coverage?.accessCrm ? 'Full Access' : 'Partial Access'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Management */}
                                <div id="user-management" className="border rounded-md border-gray-200 overflow-hidden shadow-sm">
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold flex items-center gap-2 text-lg text-left">
                                        <Users className="w-5 h-5" /> User Management
                                    </div>
                                    <div className="p-5 grid grid-cols-2 gap-8">
                                        <div className="col-span-2">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-gray-800 text-base">Access Controls & Sub-login Limits</h4>
                                                <label className="flex items-center gap-2 text-sm font-bold text-red-600">
                                                    <input type="checkbox" checked={!!formData.config?.user?.noSublogin} onChange={(e) => handleInputChange('user', 'noSublogin', e.target.checked)} className="rounded" /> 
                                                    Disable All Sub-logins
                                                </label>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                                {[
                                                    { id: 'sales', label: 'CRM sub login', limitKey: 'salesLimit' },
                                                    { id: 'admin', label: 'App sub login', limitKey: 'adminLimit' },
                                                    { id: 'leadPartner', label: 'Dealer app login', limitKey: 'leadPartnerLimit' },
                                                    { id: 'service', label: 'District manager CRM login', limitKey: 'serviceLimit' }
                                                ].map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between group">
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={!!formData.config?.user?.[item.id]} 
                                                                onChange={(e) => handleInputChange('user', item.id, e.target.checked)} 
                                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all" 
                                                            /> 
                                                            <span className={`text-[15px] font-semibold transition-colors ${formData.config?.user?.[item.id] ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                {item.label}
                                                            </span>
                                                        </label>
                                                        
                                                        <div className={`flex items-center gap-2 transition-all ${formData.config?.user?.[item.id] ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Max Limit</span>
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                value={formData.config?.user?.[item.limitKey] || 0} 
                                                                onChange={(e) => handleInputChange('user', item.limitKey, parseInt(e.target.value) || 0)} 
                                                                className="w-20 border border-gray-200 rounded-lg p-2 text-center text-sm font-bold bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-4 text-[11px] text-gray-500 italic">
                                                * Check the boxes to activate specific sub-login types and set their individual user limits.
                                            </p>
                                        </div>
                                    </div>
                                </div>


                                {/* Category Types (Dynamic Dropdowns) */}
                                <div id="category-types" className={`border rounded-md border-gray-200 shadow-sm relative ${activeDropdown && ['category', 'subCategory', 'projectType', 'subProjectType'].includes(activeDropdown) ? 'z-40' : 'z-20'}`}>
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold flex items-center gap-2 text-lg text-left rounded-t-md">
                                        <Layers className="w-5 h-5" /> Category & Project Configuration
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Categories - No dependent filter (Master list) */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 uppercase tracking-wider"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Categories</h4>
                                            <div className="relative">
                                                <div 
                                                    onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                                                    className="min-h-[45px] w-full border border-gray-200 rounded-lg p-2 bg-white flex flex-wrap gap-2 items-center cursor-pointer hover:border-blue-300 transition-colors"
                                                >
                                                    {Array.isArray(formData.config?.category) && formData.config.category.length > 0 ? (
                                                        formData.config.category.map(catId => {
                                                            const cat = masterCategories.find(c => c._id === catId);
                                                            return (
                                                                <span key={catId} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 flex items-center gap-1.5 animate-in zoom-in duration-200">
                                                                    {cat?.name || 'Unknown'}
                                                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newCats = formData.config.category.filter(id => id !== catId);
                                                                        handleInputChange('category', null, newCats);
                                                                        // Reset dependent fields
                                                                        handleInputChange('subCategory', null, []);
                                                                        handleInputChange('projectType', null, []);
                                                                        handleInputChange('subProjectType', null, []);
                                                                    }} />
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 text-sm ml-2 italic">Select categories...</span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto mr-1 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {activeDropdown === 'category' && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-thin animate-in slide-in-from-top-2 duration-200">
                                                        {masterCategories.map(cat => {
                                                            const isSelected = Array.isArray(formData.config?.category) && formData.config.category.includes(cat._id);
                                                            return (
                                                                <div 
                                                                    key={cat._id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const current = Array.isArray(formData.config?.category) ? formData.config.category : [];
                                                                        let newValues;
                                                                        if (!current.includes(cat._id)) {
                                                                            newValues = [...current, cat._id];
                                                                        } else {
                                                                            newValues = current.filter(id => id !== cat._id);
                                                                        }
                                                                        handleInputChange('category', null, newValues);
                                                                        // Reset dependent fields
                                                                        handleInputChange('subCategory', null, []);
                                                                        handleInputChange('projectType', null, []);
                                                                        handleInputChange('subProjectType', null, []);
                                                                    }}
                                                                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b border-gray-50 last:border-0 flex items-center justify-between ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                                                >
                                                                    {cat.name}
                                                                    {isSelected && <Check className="w-4 h-4" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sub-Categories (Filtered by Selected Categories) */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 uppercase tracking-wider"><Layers className="w-4 h-4 text-blue-600" /> Sub-Categories</h4>
                                            <div className="relative">
                                                <div 
                                                    onClick={() => {
                                                        if (!formData.config?.category?.length) {
                                                            toast.error("Please select a Category first");
                                                            return;
                                                        }
                                                        setActiveDropdown(activeDropdown === 'subCategory' ? null : 'subCategory');
                                                    }}
                                                    className={`min-h-[45px] w-full border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 items-center cursor-pointer transition-colors ${!formData.config?.category?.length ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white hover:border-green-300'}`}
                                                >
                                                    {Array.isArray(formData.config?.subCategory) && formData.config.subCategory.length > 0 ? (
                                                        formData.config.subCategory.map(subId => {
                                                            const sub = masterSubCategories.find(s => s._id === subId);
                                                            return (
                                                                <span key={subId} className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold border border-green-100 flex items-center gap-1.5 animate-in zoom-in duration-200">
                                                                    {sub?.name || 'Unknown'}
                                                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newSubs = formData.config.subCategory.filter(id => id !== subId);
                                                                        handleInputChange('subCategory', null, newSubs);
                                                                        // Reset children
                                                                        handleInputChange('projectType', null, []);
                                                                        handleInputChange('subProjectType', null, []);
                                                                    }} />
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 text-sm ml-2 italic">Select sub-categories...</span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto mr-1 transition-transform ${activeDropdown === 'subCategory' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {activeDropdown === 'subCategory' && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-thin animate-in slide-in-from-top-2 duration-200">
                                                        {masterSubCategories
                                                            .filter(sub => {
                                                                // Filter: Only show sub-categories that have mappings with selected categories
                                                                const selectedCats = formData.config?.category || [];
                                                                return masterMappings.some(m => 
                                                                    selectedCats.includes(m.categoryId?._id || m.categoryId) && 
                                                                    (m.subCategoryId?._id || m.subCategoryId) === sub._id
                                                                );
                                                            })
                                                            .map(sub => {
                                                                const isSelected = Array.isArray(formData.config?.subCategory) && formData.config.subCategory.includes(sub._id);
                                                                return (
                                                                    <div 
                                                                        key={sub._id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const current = Array.isArray(formData.config?.subCategory) ? formData.config.subCategory : [];
                                                                            let newValues;
                                                                            if (!current.includes(sub._id)) {
                                                                                newValues = [...current, sub._id];
                                                                            } else {
                                                                                newValues = current.filter(id => id !== sub._id);
                                                                            }
                                                                            handleInputChange('subCategory', null, newValues);
                                                                            // Reset children
                                                                            handleInputChange('projectType', null, []);
                                                                            handleInputChange('subProjectType', null, []);
                                                                        }}
                                                                        className={`px-4 py-2 hover:bg-green-50 cursor-pointer text-sm font-medium border-b border-gray-50 last:border-0 flex items-center justify-between ${isSelected ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                                                                    >
                                                                        {sub.name}
                                                                        {isSelected && <Check className="w-4 h-4" />}
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Project Types (Filtered by Selected Cat & SubCat) */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 uppercase tracking-wider"><Rocket className="w-4 h-4 text-blue-600" /> Project Types</h4>
                                            <div className="relative">
                                                <div 
                                                    onClick={() => {
                                                        if (!formData.config?.subCategory?.length) {
                                                            toast.error("Please select a Sub-Category first");
                                                            return;
                                                        }
                                                        setActiveDropdown(activeDropdown === 'projectType' ? null : 'projectType');
                                                    }}
                                                    className={`min-h-[45px] w-full border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 items-center cursor-pointer transition-colors ${!formData.config?.subCategory?.length ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white hover:border-purple-300'}`}
                                                >
                                                    {Array.isArray(formData.config?.projectType) && formData.config.projectType.length > 0 ? (
                                                        formData.config.projectType.map(rangeLabel => (
                                                            <span key={rangeLabel} className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-100 flex items-center gap-1.5 animate-in zoom-in duration-200">
                                                                {rangeLabel}
                                                                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newTypes = formData.config.projectType.filter(id => id !== rangeLabel);
                                                                    handleInputChange('projectType', null, newTypes);
                                                                    // Reset children
                                                                    handleInputChange('subProjectType', null, []);
                                                                }} />
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-sm ml-2 italic">Select project types...</span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto mr-1 transition-transform ${activeDropdown === 'projectType' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {activeDropdown === 'projectType' && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-thin animate-in slide-in-from-top-2 duration-200">
                                                        {masterProjectTypes
                                                            .filter(type => {
                                                                // Filter ranges that have mappings with selected Cats and SubCats
                                                                const selectedCats = formData.config?.category || [];
                                                                const selectedSubs = formData.config?.subCategory || [];
                                                                return masterMappings.some(m => {
                                                                    const mRange = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
                                                                    return selectedCats.includes(m.categoryId?._id || m.categoryId) && 
                                                                           selectedSubs.includes(m.subCategoryId?._id || m.subCategoryId) &&
                                                                           mRange === type.name;
                                                                });
                                                            })
                                                            .map(type => {
                                                                const isSelected = Array.isArray(formData.config?.projectType) && formData.config.projectType.includes(type.name);
                                                                return (
                                                                    <div 
                                                                        key={type.name}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const current = Array.isArray(formData.config?.projectType) ? formData.config.projectType : [];
                                                                            let newValues;
                                                                            if (!current.includes(type.name)) {
                                                                                newValues = [...current, type.name];
                                                                            } else {
                                                                                newValues = current.filter(id => id !== type.name);
                                                                            }
                                                                            handleInputChange('projectType', null, newValues);
                                                                            // Reset children
                                                                            handleInputChange('subProjectType', null, []);
                                                                        }}
                                                                        className={`px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm font-medium border-b border-gray-50 last:border-0 flex items-center justify-between ${isSelected ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
                                                                    >
                                                                        {type.name}
                                                                        {isSelected && <Check className="w-4 h-4" />}
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sub-Project Types (Filtered by All Above) */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 uppercase tracking-wider"><Target className="w-4 h-4 text-blue-600" /> Sub-Project Types</h4>
                                            <div className="relative">
                                                <div 
                                                    onClick={() => {
                                                        if (!formData.config?.projectType?.length) {
                                                            toast.error("Please select a Project Type first");
                                                            return;
                                                        }
                                                        setActiveDropdown(activeDropdown === 'subProjectType' ? null : 'subProjectType');
                                                    }}
                                                    className={`min-h-[45px] w-full border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 items-center cursor-pointer transition-colors ${!formData.config?.projectType?.length ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white hover:border-orange-300'}`}
                                                >
                                                    {Array.isArray(formData.config?.subProjectType) && formData.config.subProjectType.length > 0 ? (
                                                        formData.config.subProjectType.map(stId => {
                                                            const st = masterSubProjectTypes.find(s => s._id === stId);
                                                            return (
                                                                <span key={stId} className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-bold border border-orange-100 flex items-center gap-1.5 animate-in zoom-in duration-200">
                                                                    {st?.name || 'Unknown'}
                                                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newSTs = formData.config.subProjectType.filter(id => id !== stId);
                                                                        handleInputChange('subProjectType', null, newSTs);
                                                                    }} />
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 text-sm ml-2 italic">Select sub-project types...</span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto mr-1 transition-transform ${activeDropdown === 'subProjectType' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {activeDropdown === 'subProjectType' && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-thin animate-in slide-in-from-top-2 duration-200">
                                                        {masterSubProjectTypes
                                                            .filter(st => {
                                                                // Filter by Cat, SubCat, and Range
                                                                const selectedCats = formData.config?.category || [];
                                                                const selectedSubs = formData.config?.subCategory || [];
                                                                const selectedRanges = formData.config?.projectType || [];
                                                                return masterMappings.some(m => {
                                                                    const mRange = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
                                                                    return selectedCats.includes(m.categoryId?._id || m.categoryId) && 
                                                                           selectedSubs.includes(m.subCategoryId?._id || m.subCategoryId) &&
                                                                           selectedRanges.includes(mRange) &&
                                                                           (m.subProjectTypeId?._id || m.subProjectTypeId) === st._id;
                                                                });
                                                            })
                                                            .map(st => {
                                                                const isSelected = Array.isArray(formData.config?.subProjectType) && formData.config.subProjectType.includes(st._id);
                                                                return (
                                                                    <div 
                                                                        key={st._id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const current = Array.isArray(formData.config?.subProjectType) ? formData.config.subProjectType : [];
                                                                            let newValues;
                                                                            if (!current.includes(st._id)) {
                                                                                newValues = [...current, st._id];
                                                                            } else {
                                                                                newValues = current.filter(id => id !== st._id);
                                                                            }
                                                                            handleInputChange('subProjectType', null, newValues);
                                                                        }}
                                                                        className={`px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm font-medium border-b border-gray-50 last:border-0 flex items-center justify-between ${isSelected ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}
                                                                    >
                                                                        {st.name}
                                                                        {isSelected && <Check className="w-4 h-4" />}
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-t border-gray-100 text-[11px] text-gray-500 italic">
                                        * Hover over the dropdown fields to select multiple options for each category.
                                    </div>
                                </div>

                                {/* Quote Settings - Filtered by Location */}
                                <div id="quote-settings" className={`border rounded-md border-gray-200 shadow-sm text-left relative ${activeDropdown === 'quoteSettings' ? 'z-30' : 'z-10'}`}>
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold text-lg flex items-center gap-2 rounded-t-md">
                                        <Settings className="w-5 h-5" /> Quote Settings
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-2 max-w-xl">
                                            <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 uppercase tracking-wider">
                                                <Target className="w-4 h-4 text-blue-600" /> Available Quote Configurations
                                            </h4>
                                            <div className="relative">
                                                <div 
                                                    onClick={() => setActiveDropdown(activeDropdown === 'quoteSettings' ? null : 'quoteSettings')}
                                                    className="min-h-[45px] w-full border border-gray-200 rounded-lg p-2 bg-white flex flex-wrap gap-2 items-center cursor-pointer hover:border-blue-300 transition-colors"
                                                >
                                                    {Array.isArray(formData.config?.quoteSettings) && formData.config.quoteSettings.length > 0 ? (
                                                        formData.config.quoteSettings.map(qId => {
                                                            const quote = masterQuoteSettings.find(q => q._id === qId);
                                                            return (
                                                                <span key={qId} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 flex items-center gap-1.5 animate-in zoom-in duration-200">
                                                                    {quote?.proposalNo || 'Unnamed Config'}
                                                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newQuotes = formData.config.quoteSettings.filter(id => id !== qId);
                                                                        handleInputChange('quoteSettings', null, newQuotes);
                                                                    }} />
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 text-sm ml-2 italic">Select quote configurations...</span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto mr-1 transition-transform ${activeDropdown === 'quoteSettings' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {activeDropdown === 'quoteSettings' && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-60 overflow-y-auto scrollbar-thin animate-in slide-in-from-top-2 duration-200">
                                                        {masterQuoteSettings
                                                            .filter(q => {
                                                                // Filter by currently selected State or Cluster in the top tabs
                                                                const stateId = selectedStateIds[0];
                                                                const clusterId = selectedClusterIds[0];
                                                                
                                                                if (!stateId && !clusterId) return true; // Show all if no filter
                                                                
                                                                const inState = q.states?.some(s => (s._id || s) === stateId);
                                                                const inCluster = q.clusters?.some(c => (c._id || c) === clusterId);
                                                                
                                                                return inState || inCluster;
                                                            })
                                                            .map(quote => {
                                                                const isSelected = Array.isArray(formData.config?.quoteSettings) && formData.config.quoteSettings.includes(quote._id);
                                                                return (
                                                                    <div 
                                                                        key={quote._id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const current = Array.isArray(formData.config?.quoteSettings) ? formData.config.quoteSettings : [];
                                                                            let newValues;
                                                                            if (!current.includes(quote._id)) {
                                                                                newValues = [...current, quote._id];
                                                                            } else {
                                                                                newValues = current.filter(id => id !== quote._id);
                                                                            }
                                                                            handleInputChange('quoteSettings', null, newValues);
                                                                        }}
                                                                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex flex-col gap-1 ${isSelected ? 'bg-blue-50' : ''}`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{quote.proposalNo}</span>
                                                                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-500 flex gap-2 flex-wrap">
                                                                            <span className="bg-gray-100 px-1 rounded">Categories: {quote.categories?.join(', ') || 'All'}</span>
                                                                            <span className="bg-gray-100 px-1 rounded">Quote Types: {quote.quoteTypes?.join(', ') || 'All'}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        {masterQuoteSettings.filter(q => {
                                                            const stateId = selectedStateIds[0];
                                                            const clusterId = selectedClusterIds[0];
                                                            if (!stateId && !clusterId) return true;
                                                            return q.states?.some(s => (s._id || s) === stateId) || q.clusters?.some(c => (c._id || c) === clusterId);
                                                        }).length === 0 && (
                                                            <div className="p-4 text-center text-sm text-gray-500 italic">No quote settings found for this location</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 italic mt-1">
                                                * Only showing quote configurations available for the selected state/cluster.
                                            </p>

                                            {/* Rate Settings (Moved from Commission Setup) */}
                                            <div className="mt-10 pt-8 border-t border-gray-100">
                                                <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 uppercase tracking-wider mb-4">
                                                    <Percent className="w-4 h-4 text-blue-600" /> Rate Settings
                                                </h4>
                                                <div className="overflow-x-auto scrollbar-thin">
                                                    <table className="w-full text-sm border-collapse min-w-[800px]">
                                                        <thead>
                                                            <tr className="bg-gray-100 text-gray-700 text-left">
                                                                <th className="p-2 border">Category</th>
                                                                <th className="p-2 border">Sub-Category</th>
                                                                <th className="p-2 border">Project Type</th>
                                                                <th className="p-2 border">Sub-Project Type</th>
                                                                <th className="p-2 border">Commission (₹)</th>
                                                                <th className="p-2 border w-10">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(formData.config?.commissions || []).map((row, index) => (
                                                                <tr key={index}>
                                                                    <td className="p-2 border">
                                                                        <select 
                                                                            value={row.category || ''} 
                                                                            onChange={(e) => {
                                                                                handleCommissionChange(index, 'category', e.target.value);
                                                                                handleCommissionChange(index, 'subCategory', '');
                                                                                handleCommissionChange(index, 'projectType', '');
                                                                                handleCommissionChange(index, 'subProjectType', '');
                                                                            }}
                                                                            className="w-full border p-1 rounded text-sm"
                                                                        >
                                                                            <option value="">Select Category</option>
                                                                            {masterCategories.map(cat => (
                                                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <select 
                                                                            value={row.subCategory || ''} 
                                                                            onChange={(e) => {
                                                                                handleCommissionChange(index, 'subCategory', e.target.value);
                                                                                handleCommissionChange(index, 'projectType', '');
                                                                                handleCommissionChange(index, 'subProjectType', '');
                                                                            }}
                                                                            className="w-full border p-1 rounded text-sm"
                                                                            disabled={!row.category}
                                                                        >
                                                                            <option value="">Select Sub-Category</option>
                                                                            {masterSubCategories
                                                                                .filter(sub => {
                                                                                    if (!row.category) return false;
                                                                                    return masterMappings.some(m => 
                                                                                        (m.categoryId?._id || m.categoryId) === row.category && 
                                                                                        (m.subCategoryId?._id || m.subCategoryId) === sub._id
                                                                                    );
                                                                                })
                                                                                .map(sub => (
                                                                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                                                ))}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <select 
                                                                            value={row.projectType || ''} 
                                                                            onChange={(e) => {
                                                                                handleCommissionChange(index, 'projectType', e.target.value);
                                                                                handleCommissionChange(index, 'subProjectType', '');
                                                                            }}
                                                                            className="w-full border p-1 rounded text-sm"
                                                                            disabled={!row.subCategory}
                                                                        >
                                                                            <option value="">Select Project Type</option>
                                                                            {masterProjectTypes
                                                                                .filter(type => {
                                                                                    if (!row.category || !row.subCategory) return false;
                                                                                    return masterMappings.some(m => {
                                                                                        const mRange = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
                                                                                        return (m.categoryId?._id || m.categoryId) === row.category && 
                                                                                               (m.subCategoryId?._id || m.subCategoryId) === row.subCategory &&
                                                                                               mRange === type.name;
                                                                                    });
                                                                                })
                                                                                .map(type => (
                                                                                    <option key={type._id} value={type._id}>{type.name}</option>
                                                                                ))}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <select 
                                                                            value={row.subProjectType || ''} 
                                                                            onChange={(e) => handleCommissionChange(index, 'subProjectType', e.target.value)}
                                                                            className="w-full border p-1 rounded text-sm"
                                                                            disabled={!row.projectType}
                                                                        >
                                                                            <option value="">Select Sub-Project Type</option>
                                                                            {masterSubProjectTypes
                                                                                .filter(st => {
                                                                                    if (!row.category || !row.subCategory || !row.projectType) return false;
                                                                                    return masterMappings.some(m => {
                                                                                        const mRange = `${m.projectTypeFrom} to ${m.projectTypeTo} kW`;
                                                                                        return (m.categoryId?._id || m.categoryId) === row.category && 
                                                                                               (m.subCategoryId?._id || m.subCategoryId) === row.subCategory &&
                                                                                               mRange === row.projectType &&
                                                                                               (m.subProjectTypeId?._id || m.subProjectTypeId) === st._id;
                                                                                    });
                                                                                })
                                                                                .map(st => (
                                                                                    <option key={st._id} value={st._id}>{st.name}</option>
                                                                                ))}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <div className="flex items-center gap-1">
                                                                            <input 
                                                                                type="text" 
                                                                                value={row.amount || ''} 
                                                                                onChange={(e) => handleCommissionChange(index, 'amount', e.target.value)}
                                                                                className="w-full border p-1 rounded text-sm"
                                                                                placeholder="Enter amount"
                                                                            />
                                                                            <button className="p-1 border text-[10px] bg-white rounded flex items-center gap-1 hover:bg-gray-50 uppercase font-bold text-gray-500"><Settings size={10} /> Settings</button>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 border text-center">
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <button 
                                                                                onClick={() => handleSave()}
                                                                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                                title="Save All Changes"
                                                                            >
                                                                                <Save size={16} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleRemoveCommissionRow(index)}
                                                                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                                title="Remove Row"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <button 
                                                    onClick={handleAddCommissionRow}
                                                    className="mt-4 text-[#1e73be] font-bold text-sm flex items-center gap-1 hover:underline"
                                                >
                                                    <Plus size={16} /> Add Row
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Plans Selection */}
                                <div id="fees-&-charges" className={`border rounded-md border-gray-200 shadow-sm text-left relative ${activeDropdown === 'deliveryPlan' ? 'z-20' : 'z-10'}`}>
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold text-lg flex items-center gap-2 rounded-t-md">
                                        <Truck className="w-5 h-5" /> Delivery Plans Selection
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-2 max-w-xl">
                                            <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 uppercase tracking-wider">
                                                <Truck className="w-4 h-4 text-blue-600" /> Select Delivery Plans (Multiple)
                                            </h4>
                                            <div className="relative">
                                                <div 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === 'deliveryPlan' ? null : 'deliveryPlan');
                                                    }}
                                                    className="min-h-[45px] w-full border border-gray-200 rounded-lg p-2 bg-white flex flex-wrap gap-2 items-center cursor-pointer hover:border-blue-300 transition-colors"
                                                >
                                                    {Array.isArray(formData.config?.deliveryPlans) && formData.config.deliveryPlans.length > 0 ? (
                                                        formData.config.deliveryPlans.map(dpId => {
                                                            const plan = masterDeliveryPlans.find(p => p._id === dpId);
                                                            return (
                                                                <span key={dpId} className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-bold border border-orange-100 flex items-center gap-1.5 animate-in zoom-in duration-200">
                                                                    {plan ? `${plan.deliveryType?.name} - ${plan.vehicle?.name} (₹${plan.pricePerDelivery})` : 'Unnamed Plan'}
                                                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newPlans = formData.config.deliveryPlans.filter(id => id !== dpId);
                                                                        handleInputChange('deliveryPlans', null, newPlans);
                                                                    }} />
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 text-sm ml-2 italic">Select delivery plans...</span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto mr-1 transition-transform ${activeDropdown === 'deliveryPlan' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {activeDropdown === 'deliveryPlan' && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-60 overflow-y-auto scrollbar-thin animate-in slide-in-from-top-2 duration-200">
                                                        {masterDeliveryPlans.length > 0 ? (
                                                            masterDeliveryPlans.map(plan => {
                                                                const isSelected = Array.isArray(formData.config?.deliveryPlans) && formData.config.deliveryPlans.includes(plan._id);
                                                                return (
                                                                    <div 
                                                                        key={plan._id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const current = Array.isArray(formData.config?.deliveryPlans) ? formData.config.deliveryPlans : [];
                                                                            let newValues;
                                                                            if (!current.includes(plan._id)) {
                                                                                newValues = [...current, plan._id];
                                                                            } else {
                                                                                newValues = current.filter(id => id !== plan._id);
                                                                            }
                                                                            handleInputChange('deliveryPlans', null, newValues);
                                                                        }}
                                                                        className={`px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 flex flex-col gap-1 ${isSelected ? 'bg-orange-50' : ''}`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className={`text-sm font-bold ${isSelected ? 'text-orange-700' : 'text-gray-800'}`}>
                                                                                {plan.deliveryType?.name} - {plan.vehicle?.name}
                                                                            </span>
                                                                            {isSelected && <Check className="w-4 h-4 text-orange-600" />}
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-500 flex gap-2 flex-wrap">
                                                                            <span className="bg-gray-100 px-1 rounded">Vendor: {plan.vendor?.name}</span>
                                                                            <span className="bg-gray-100 px-1 rounded text-orange-600 font-bold">Rate: ₹{plan.pricePerDelivery}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="p-4 text-center text-sm text-gray-500 italic">No delivery plans available</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 italic mt-1">
                                                * Select multiple delivery plans available for this partner plan.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Incentive & Targets */}
                                <div id="incentive-&-targets" className="border rounded-md border-gray-200 overflow-hidden shadow-sm text-left">
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold text-lg flex items-center gap-2">
                                        <Target className="w-5 h-5" /> Incentive & Targets
                                    </div>
                                    <div className="p-5 flex flex-col gap-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <h4 className="font-bold text-gray-800 mb-1 text-sm">Yearly Target (kW)</h4>
                                                <input type="text" placeholder="Enter target in kW" value={formData.config?.incentive?.yearlyTarget || ''} onChange={(e) => handleInputChange('incentive', 'yearlyTarget', e.target.value)} className="w-full border rounded p-2 text-sm" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 mb-1 text-sm">Cashback per kW (₹)</h4>
                                                <input type="text" placeholder="Enter cashback per kW" value={formData.config?.incentive?.cashbackPerKw || ''} onChange={(e) => handleInputChange('incentive', 'cashbackPerKw', e.target.value)} className="w-full border rounded p-2 text-sm" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 mb-1 text-sm">Total Incentive (₹)</h4>
                                                <input type="text" readOnly placeholder="" value={formData.config?.incentive?.totalIncentive || ''} className="w-full border rounded p-2 text-sm bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={calculateIncentive}
                                                className="bg-[#0078bd] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold"
                                            >
                                                Calculate
                                            </button>
                                        </div>
                                    </div>
                                </div>





                                {/* Training Videos */}
                                <div id="training-videos" className="border rounded-md border-gray-200 overflow-hidden shadow-sm text-left">
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold text-lg flex items-center gap-2">
                                        <Video className="w-5 h-5" /> Training Videos
                                    </div>
                                    <div className="p-5">
                                        <p className="text-gray-500 italic">Training video configuration section...</p>
                                    </div>
                                </div>



                                {/* Features -> CRM Login Modules */}
                                <div id="features" className="border rounded-md border-gray-200 overflow-hidden shadow-sm text-left">
                                    <div className="bg-[#0078bd] text-white px-5 py-3 font-bold text-lg flex items-center gap-2">
                                        <Rocket className="w-5 h-5" /> CRM Login Modules
                                    </div>
                                    <div className="p-5">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3 text-base">List of all CRM modules</h4>
                                            <div className="space-y-2 grid grid-cols-2 gap-x-8">
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.crmLeadManagement} onChange={(e) => handleInputChange('features', 'crmLeadManagement', e.target.checked)} className="rounded" /> <span className="text-gray-700">Lead Management</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.assignLead} onChange={(e) => handleInputChange('features', 'assignLead', e.target.checked)} className="rounded" /> <span className="text-gray-700">Assign Lead</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.crmKnowMargin} onChange={(e) => handleInputChange('features', 'crmKnowMargin', e.target.checked)} className="rounded" /> <span className="text-gray-700">Know my margin</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.crmSurveyBom} onChange={(e) => handleInputChange('features', 'crmSurveyBom', e.target.checked)} className="rounded" /> <span className="text-gray-700">Survey BOM</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.crmInstall} onChange={(e) => handleInputChange('features', 'crmInstall', e.target.checked)} className="rounded" /> <span className="text-gray-700">Install</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.crmService} onChange={(e) => handleInputChange('features', 'crmService', e.target.checked)} className="rounded" /> <span className="text-gray-700">Service</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.crmProjectManagement} onChange={(e) => handleInputChange('features', 'crmProjectManagement', e.target.checked)} className="rounded" /> <span className="text-gray-700">Project Management</span></label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.config?.features?.crmAmcPlan} onChange={(e) => handleInputChange('features', 'crmAmcPlan', e.target.checked)} className="rounded" /> <span className="text-gray-700">AMC Plan</span></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex justify-end gap-4 mt-6">
                                     <button 
                                        onClick={() => handleDeletePlan(selectedPlanId)}
                                        className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 px-6 rounded border border-red-200 transition-colors"
                                     >
                                         Delete Plan
                                     </button>
                                     <button onClick={handleSave} className="bg-[#1e73be] hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                            
                            {/* Right Plan View Sidebar Widget */}
                            <PlanPreview formData={formData} getIcon={getIcon} />
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Add Plan Modal */}
            {showAddPlanModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 font-sans">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add New Plan</h3>
                            <button onClick={() => setShowAddPlanModal(false)}><X className="text-gray-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Plan Name"
                                    className="w-full border rounded p-2"
                                    value={formData.name || ''}
                                    onChange={(e) => handleRootInputChange('name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full border rounded p-2"
                                    value={formData.price || 0}
                                    onChange={(e) => handleRootInputChange('price', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Theme Color</label>
                                    <div className="flex border rounded p-1">
                                        <input 
                                            type="color" 
                                            value={formData.ui?.buttonColor?.startsWith('#') ? formData.ui.buttonColor : '#0078bd'} 
                                            onChange={(e) => handleUiChange('buttonColor', e.target.value)} 
                                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            value={formData.ui?.buttonColor?.startsWith('#') ? formData.ui.buttonColor : '#0078bd'}
                                            onChange={(e) => handleUiChange('buttonColor', e.target.value)}
                                            className="w-full border-none focus:ring-0 px-2 text-sm text-gray-600"
                                            placeholder="#0078bd"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Header Color</label>
                                    <div className="flex border rounded p-1">
                                        <input 
                                            type="color" 
                                            value={formData.ui?.headerColor?.startsWith('#') ? formData.ui.headerColor : '#0078bd'} 
                                            onChange={(e) => handleUiChange('headerColor', e.target.value)} 
                                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            value={formData.ui?.headerColor?.startsWith('#') ? formData.ui.headerColor : '#0078bd'}
                                            onChange={(e) => handleUiChange('headerColor', e.target.value)}
                                            className="w-full border-none focus:ring-0 px-2 text-sm text-gray-600"
                                            placeholder="#0078bd"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowAddPlanModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleCreatePlan} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Create Plan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
