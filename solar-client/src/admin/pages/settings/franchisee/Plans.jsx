import React, { useState, useEffect } from 'react';
import {
  Settings, Rocket, Layers, Building, Sun, Plus, Check, List, Globe, Users, Tags, Star, DollarSign, HandCoins, Percent, Video, History, Eye, Save, Calculator, FileText, Briefcase, Home, Store, ArrowUp, Clock, Trash2, CheckCircle, Image as ImageIcon, UserCircle, UserCog, Smartphone, Monitor, Server, Target, Award, ClipboardCheck, Grid, X, ChevronRight, Zap, Battery, Cpu, Package, Truck, Wrench, Box, Factory, Layers as LayersIcon, ShoppingCart, CreditCard, BookOpen
} from 'lucide-react';
import { getStates } from '../../../../services/core/locationApi';
import { getProPlans, createProPlan, updateProPlan } from '../../../../services/franchisee/franchiseeApi';
import toast from 'react-hot-toast';

// Helper for dynamic icon mapping
const IconMap = { Rocket, Layers, Building, Sun, Star, Check };

const FranchiseSettings = () => {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);

  const defaultFormData = {
    name: 'New Plan', description: 'Perfect for small businesses', price: 4999, priceDescription: 'signup fees', isActive: true,
    colorArgs: { buttonColor: 'from-blue-600 to-purple-600', headerColor: 'bg-blue-600', iconColor: 'text-blue-600', bgColor: 'bg-blue-600', iconName: 'Rocket' },
    configureSupplyType: { structureCost: false, installationCost: false, insurance: false },
    onboardingRequirements: { kycDocuments: [], verificationStatus: { verifiedDealer: false, notVerifiedDealer: false }, additionalDocuments: '' },
    coverageArea: '',
    userManagement: { subUserTypes: [], userLimits: 10, noSublogin: false },
    assignModule: { modules: [] },
    categoryTypes: [],
    featuresList: { platformFeatures: [], crmAppFeatures: [] },
    quoteSettings: { customerQuoteType: [], projectSignupLimit: 10000, deliveryType: 'Standard' },
    feesAndCharges: { applicableUpgradeFees: 2000, signupFeesIfDirectUpgrade: 3000 },
    discountPlanSetting: { bulkBuySetting: false, solarPanelBundleSetting: false, offers: false },
    dealerAssignSettings: { howManyDealerAssign: 0 },
    cashbackAndTargets: { yearlyTargetKw: 50, cashbackPerKw: 0, totalCashback: 20000 },
    leadBuySetting: '',
    cashbackSetup: [],
    royaltyChargesSetup: [],
    rewardsAndPointsSettings: { enabled: false },
    trainingVideos: []
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [showCashbackModal, setShowCashbackModal] = useState(false);
  const [activeSection, setActiveSection] = useState('configuresupplytype');

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) fetchPlans(selectedState);
    else { setPlans([]); setActivePlanId(null); }
  }, [selectedState]);

  useEffect(() => {
    const activePlan = plans.find(p => p._id === activePlanId);
    if (activePlan) {
      setFormData({ ...defaultFormData, ...activePlan });
    } else {
      setFormData(defaultFormData);
    }
  }, [activePlanId, plans]);

  const fetchStates = async () => {
    try { const data = await getStates(); setStates(data); } catch (e) { toast.error("Failed to load states"); }
  };

  const fetchPlans = async (stateId) => {
    try {
      const data = await getProPlans(stateId);
      setPlans(data);
      if (data.length > 0) setActivePlanId(data[0]._id);
      else setActivePlanId(null);
    } catch (e) { toast.error("Failed to load plans"); }
  };

  // Change handlers
  const handleTopLevelChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNestedChange = (section, key, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleMultiSelectArray = (section, arrayKey, item) => {
    setFormData(prev => {
      const currentArray = prev[section][arrayKey] || [];
      const newArray = currentArray.includes(item) ? currentArray.filter(i => i !== item) : [...currentArray, item];
      return { ...prev, [section]: { ...prev[section], [arrayKey]: newArray } };
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!selectedState) return toast.error("Select state first");
    try {
      const payload = { ...formData, state: selectedState };
      if (formData._id) {
        const updated = await updateProPlan(formData._id, payload);
        setPlans(prev => prev.map(p => p._id === updated._id ? updated : p));
        toast.success("Plan Updated Successfully");
      } else {
        const created = await createProPlan(payload);
        setPlans(prev => [...prev, created]);
        setActivePlanId(created._id);
        toast.success("New Plan Created Successfully");
      }
    } catch (err) { toast.error(err.message || "Failed to save plan"); }
  };

  // Navigation sections
  const navSections = [
    { id: 'configuresupplytype', name: 'Configure Supply Type', icon: Check },
    { id: 'kycSection', name: 'Onboarding Requirements', icon: Check },
    { id: 'coverageSection', name: 'Coverage Area', icon: Check },
    { id: 'userSection', name: 'User Management', icon: Check },
    { id: 'categorySection', name: 'Project Category', icon: Check },
    { id: 'featuresSection', name: 'Modules', icon: Check },
    { id: 'quoteSection', name: 'Quote Settings', icon: Check },
    { id: 'feesSection', name: 'Fees & Charges', icon: Check },
    { id: 'bulkbuysetting', name: 'Discount Plan Setting', icon: Check },
    { id: 'cashbackSection', name: 'Cashback & Targets', icon: Check },
    { id: 'leadBuySettingSection', name: 'Buy Lead Setting', icon: Check },
    { id: 'commissionSection', name: 'Cashback Setup', icon: Check },
    { id: 'royaltycharges', name: 'Royalty Charges', icon: Check },
    { id: 'rewardsPoints', name: 'Rewards And Points', icon: Check },
    { id: 'trainingSection', name: 'Training Videos', icon: Check }
  ];

  // Franchise settings sections
  const franchiseSections = [
    {
      title: 'Product Configuration',
      icon: Package,
      items: ['Product Configuration', 'Brand Manufacturer', 'Combokit', 'Combokit Overview']
    },
    {
      title: 'Delivery Settings',
      icon: Truck,
      items: ['Delivery Settings', 'Order Procurement']
    },
    {
      title: 'Installer Settings',
      icon: Wrench,
      items: ['Installer Settings']
    },
    {
      title: 'Inventory Management',
      icon: Box,
      items: ['Inventory Management']
    },
    {
      title: 'Franchise Settings',
      icon: Settings,
      items: [
        'Franchise Plans',
        'Franchise Points & Rewards',
        'Franchise Profession Type',
        'Order Catalog'
      ]
    }
  ];

  // Plan data for dynamic card
  const planData = {
    startup: {
      name: 'STARTUP',
      description: 'Perfect for small businesses',
      price: '₹4,999',
      priceDescription: 'signup fees',
      yearlyTarget: '50kw',
      cashback: '20,000',
      accessType: 'App Only Access',
      accessIcon: Smartphone,
      users: 'Single User',
      userDescription: '1 user account',
      userIcon: UserCircle,
      cashbackIcon: DollarSign,
      projectTypes: [
        { name: 'Residential' },
        { name: 'Commercial' }
      ],
      features: ['Leads', 'Quotes', 'Survey', 'Project Signup'],
      documents: ['ID Proof', 'Address Proof', 'Business PAN'],
      depositFees: '₹5,000',
      buttonColor: 'from-blue-600 to-purple-600',
      headerColor: 'bg-blue-600'
    },
    basic: {
      name: 'BASIC',
      description: 'Great for growing businesses',
      price: '₹9,999',
      priceDescription: 'signup fees',
      yearlyTarget: '60kw',
      cashback: '25,000',
      accessType: 'App & Web Access',
      accessIcon: Monitor,
      users: 'Up to 5 Users',
      userDescription: '5 user accounts',
      userIcon: Users,
      cashbackIcon: DollarSign,
      projectTypes: [
        { name: 'Residential' },
        { name: 'Commercial' }
      ],
      features: ['Leads', 'Quotes', 'Survey', 'Project Signup', 'CRM'],
      documents: ['ID Proof', 'Address Proof', 'Business PAN', 'GST Certificate'],
      depositFees: '₹10,000',
      buttonColor: 'from-green-600 to-teal-500',
      headerColor: 'bg-green-600'
    },
    enterprise: {
      name: 'ENTERPRISE',
      description: 'For large organizations',
      price: '₹19,999',
      priceDescription: 'signup fees',
      yearlyTarget: '70kw',
      cashback: '30,000',
      accessType: 'Full Platform Access',
      accessIcon: Server,
      users: 'Unlimited Users',
      userDescription: 'Unlimited user accounts',
      userIcon: UserCog,
      cashbackIcon: DollarSign,
      projectTypes: [
        { name: 'Residential' },
        { name: 'Commercial' }
      ],
      features: ['Leads', 'Quotes', 'Survey', 'Project Signup', 'CRM', 'Analytics', 'API Access'],
      documents: ['ID Proof', 'Address Proof', 'Business PAN', 'GST Certificate', 'Company Registration'],
      depositFees: '₹25,000',
      buttonColor: 'from-purple-600 to-pink-600',
      headerColor: 'bg-purple-600'
    },
    solar: {
      name: 'SOLAR BUSINESS',
      description: 'Specialized for solar companies',
      price: '₹14,999',
      priceDescription: 'signup fees',
      yearlyTarget: '100kw',
      cashback: '50,000',
      accessType: 'Solar Specialized Access',
      accessIcon: Sun,
      users: 'Up to 10 Users',
      userDescription: '10 user accounts',
      userIcon: Briefcase,
      cashbackIcon: DollarSign,
      projectTypes: [
        { name: 'Residential Solar' },
        { name: 'Commercial Solar' }
      ],
      features: ['Solar Leads', 'Quotes', 'Survey', 'Project Signup', 'Solar CRM', 'Energy Analytics'],
      documents: ['ID Proof', 'Address Proof', 'Business PAN', 'GST Certificate', 'Solar Certification'],
      depositFees: '₹15,000',
      buttonColor: 'from-yellow-500 to-orange-500',
      headerColor: 'bg-yellow-500'
    }
  };

  // Lead setting options
  const leadSettings = [
    'High Priority Leads',
    'Medium Priority Leads',
    'Low Cost Leads',
    'Exclusive Leads',
    'Bulk Leads'
  ];

  // Handle state selection
  const handleStateSelect = (state) => {
    setSelectedState(state);
    setShowPlanDetails(true);
    setActivePlan('startup');
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    setActivePlan(planId);
  };

  // Handle section navigation
  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate cashback
  const calculateCashback = () => {
    const target = parseFloat(yearlyTarget) || 0;
    const perKw = parseFloat(cashbackPerKw) || 0;
    const total = target * perKw;
    setTotalCashback(total.toFixed(2));
  };

  // Handle lead setting assignment
  const handleAssignLeadSetting = () => {
    setShowLeadSettingText(selectedLeadSetting);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <Settings className="w-6 h-6 mr-3 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-800">Franchise Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Two Column Layout (Form + Plan Card) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            {/* State Selection */}
            {!selectedState ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-center mb-6">Select State to Configure Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {states.map((state) => (
                    <div
                      key={state._id}
                      onClick={() => setSelectedState(state._id)}
                      className="bg-white border border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-300"
                    >
                      <h3 className="text-lg font-bold text-gray-800">{state.name}</h3>
                      <p className="text-gray-500 mt-1">{state.abbreviation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                {/* Back button and Save Header */}
                <div className="flex justify-between items-center mb-4">
                  <button type="button" onClick={() => setSelectedState(null)} className="text-blue-600 hover:text-blue-800 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                    Back to State Selection
                  </button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center shadow-sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>

                {/* Plan Selection Tabs */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-wrap gap-2 items-center">
                    {plans.map((plan) => {
                      const Icon = IconMap[plan.colorArgs?.iconName] || Rocket;
                      const isActive = activePlanId === plan._id;
                      return (
                        <button
                          key={plan._id}
                          type="button"
                          onClick={() => setActivePlanId(plan._id)}
                          className={`px-4 py-2 rounded-lg flex items-center transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {plan.name}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setActivePlanId(null)}
                      className={`px-4 py-2 rounded-lg flex items-center transition-colors border border-dashed border-gray-400 ${!activePlanId ? 'bg-green-50 text-green-700 border-green-500' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Plan
                    </button>
                  </div>
                </div>

                {/* Main Content with Sections */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Section Navigation */}
                  <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                    {navSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          onClick={(e) => handleSectionClick(e, section.id)}
                          className={`px-3 py-1.5 text-sm rounded-full flex items-center ${activeSection === section.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {section.name}
                        </a>
                      );
                    })}
                  </div>

                  {/* Basic Plan Settings */}
                  <div id="basicsettings" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Basic Plan Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleTopLevelChange} className="w-full rounded border-gray-300 p-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input type="number" name="price" value={formData.price || 0} onChange={handleTopLevelChange} className="w-full rounded border-gray-300 p-2" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input type="text" name="description" value={formData.description || ''} onChange={handleTopLevelChange} className="w-full rounded border-gray-300 p-2" />
                      </div>
                    </div>
                  </div>

                  {/* Configure Supply Type Section */}
                  <div id="configuresupplytype" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Configure Supply Type
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" checked={formData.configureSupplyType?.structureCost || false} onChange={(e) => handleNestedChange('configureSupplyType', 'structureCost', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                          <span className="text-gray-700">Structure Cost</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" checked={formData.configureSupplyType?.installationCost || false} onChange={(e) => handleNestedChange('configureSupplyType', 'installationCost', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                          <span className="text-gray-700">Installation Cost</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" checked={formData.configureSupplyType?.insurance || false} onChange={(e) => handleNestedChange('configureSupplyType', 'insurance', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                          <span className="text-gray-700">Insurance</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Onboarding Requirements Section */}
                  <div id="kycSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600" />
                      Onboarding Requirements
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">KYC Documents</h4>
                          <div className="space-y-2">
                            {['Aadhar Card', 'PAN Card', 'GST Certificate', 'Office Proof'].map((doc) => (
                              <label key={doc} className="flex items-center">
                                <input type="checkbox" checked={formData.onboardingRequirements?.kycDocuments?.includes(doc) || false} onChange={() => handleMultiSelectArray('onboardingRequirements', 'kycDocuments', doc)} className="rounded border-gray-300 text-blue-600 mr-2" />
                                <span>{doc}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Verification Status</h4>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input type="checkbox" checked={formData.onboardingRequirements?.verificationStatus?.verifiedDealer || false} onChange={(e) => setFormData(prev => ({ ...prev, onboardingRequirements: { ...prev.onboardingRequirements, verificationStatus: { ...prev.onboardingRequirements.verificationStatus, verifiedDealer: e.target.checked } } }))} className="rounded border-gray-300 text-blue-600 mr-2" />
                              <span>Verified Dealer</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" checked={formData.onboardingRequirements?.verificationStatus?.notVerifiedDealer || false} onChange={(e) => setFormData(prev => ({ ...prev, onboardingRequirements: { ...prev.onboardingRequirements, verificationStatus: { ...prev.onboardingRequirements.verificationStatus, notVerifiedDealer: e.target.checked } } }))} className="rounded border-gray-300 text-blue-600 mr-2" />
                              <span>Not Verified Dealer</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Area Section */}
                  <div id="coverageSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-blue-600" />
                      Coverage Area
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <select name="coverageArea" value={formData.coverageArea || ''} onChange={handleTopLevelChange} className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Coverage Area</option>
                        <option value="state">State</option>
                        <option value="cluster">Cluster</option>
                        <option value="district">District</option>
                        <option value="city">City</option>
                      </select>
                    </div>
                  </div>

                  {/* User Management Section */}
                  <div id="userSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      User Management
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Sub User Types</h4>
                          <div className="space-y-2">
                            {['Sales', 'Dealer', 'Lead Partner', 'Service'].map((type) => (
                              <label key={type} className="flex items-center">
                                <input type="checkbox" checked={formData.userManagement?.subUserTypes?.includes(type) || false} onChange={() => handleMultiSelectArray('userManagement', 'subUserTypes', type)} className="rounded border-gray-300 text-blue-600 mr-2" />
                                <span>{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">User Limits</h4>
                          <input type="number" value={formData.userManagement?.userLimits || 0} onChange={(e) => handleNestedChange('userManagement', 'userLimits', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <div className="mt-3">
                            <label className="flex items-center">
                              <input type="checkbox" checked={formData.userManagement?.noSublogin || false} onChange={(e) => handleNestedChange('userManagement', 'noSublogin', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                              <span>No Sublogin</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Category Section */}
                  <div id="categorySection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Tags className="w-5 h-5 mr-2 text-blue-600" />
                      Project Category
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sub-Category</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Project Type</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sub ProjectType</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { category: 'Solar Rooftop', subCategory: 'Residential', projectType: '3kw - 5kw', subProjectType: 'On-Grid' },
                              { category: 'Solar Rooftop', subCategory: 'Residential', projectType: '5kw - 15kw', subProjectType: 'Off-Grid' },
                              { category: 'Solar Rooftop', subCategory: 'Commercial', projectType: '10kw - 25kw', subProjectType: 'On-Grid' }
                            ].map((cat, idx) => {
                              const isSelected = formData.categoryTypes?.some(c => c.category === cat.category && c.subCategory === cat.subCategory && c.projectType === cat.projectType && c.subProjectType === cat.subProjectType);
                              return (
                                <tr key={idx} className="border-t border-gray-200">
                                  <td className="px-4 py-2">
                                    <input type="checkbox" checked={isSelected || false} onChange={(e) => {
                                      const newCategories = e.target.checked
                                        ? [...(formData.categoryTypes || []), cat]
                                        : (formData.categoryTypes || []).filter(c => !(c.category === cat.category && c.subCategory === cat.subCategory && c.projectType === cat.projectType && c.subProjectType === cat.subProjectType));
                                      setFormData(prev => ({ ...prev, categoryTypes: newCategories }));
                                    }} className="rounded border-gray-300 text-blue-600" />
                                  </td>
                                  <td className="px-4 py-2">{cat.category}</td>
                                  <td className="px-4 py-2">{cat.subCategory}</td>
                                  <td className="px-4 py-2">{cat.projectType}</td>
                                  <td className="px-4 py-2">{cat.subProjectType}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Modules Section */}
                  <div id="featuresSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Grid className="w-5 h-5 mr-2 text-blue-600" />
                      Modules
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Platform Features</h4>
                          <div className="space-y-2">
                            {['Lead', 'Loan', 'Quotes', 'Project Signup', 'Training Video'].map((feature) => (
                              <label key={feature} className="flex items-center">
                                <input type="checkbox" checked={formData.featuresList?.platformFeatures?.includes(feature) || false} onChange={() => handleMultiSelectArray('featuresList', 'platformFeatures', feature)} className="rounded border-gray-300 text-blue-600 mr-2" />
                                <span>{feature}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">CRM Features</h4>
                          <div className="space-y-2">
                            {['Lead Management', 'Assign Lead', 'Know my margin', 'Survey BOM'].map((feature) => (
                              <label key={feature} className="flex items-center">
                                <input type="checkbox" checked={formData.featuresList?.crmAppFeatures?.includes(feature) || false} onChange={() => handleMultiSelectArray('featuresList', 'crmAppFeatures', feature)} className="rounded border-gray-300 text-blue-600 mr-2" />
                                <span>{feature}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quote Settings Section */}
                  <div id="quoteSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Quote Settings
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Customer Quote Type</h4>
                          <div className="space-y-2">
                            {['Quick quote', 'Survey quote', 'Generation graph', 'Add ons'].map((quoteType) => (
                              <label key={quoteType} className="flex items-center">
                                <input type="checkbox" checked={formData.quoteSettings?.customerQuoteType?.includes(quoteType) || false} onChange={() => handleMultiSelectArray('quoteSettings', 'customerQuoteType', quoteType)} className="rounded border-gray-300 text-blue-600 mr-2" />
                                <span>{quoteType}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Project Signup Limit</h4>
                          <input type="number" value={formData.quoteSettings?.projectSignupLimit || 0} onChange={(e) => handleNestedChange('quoteSettings', 'projectSignupLimit', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 10000 kw" />
                          <h4 className="font-medium text-gray-700 mt-3 mb-2">Delivery Type</h4>
                          <input type="text" value={formData.quoteSettings?.deliveryType || ''} onChange={(e) => handleNestedChange('quoteSettings', 'deliveryType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Standard" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fees & Charges Section */}
                  <div id="feesSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Fees & Charges
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Signup Fees (Plan Price)</label>
                          <input type="number" value={formData.price || 0} onChange={(e) => handleTopLevelChange({ target: { name: 'price', value: parseFloat(e.target.value) || 0 } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 4999" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Upgrade Fees*</label>
                          <input type="number" value={formData.feesAndCharges?.applicableUpgradeFees || 0} onChange={(e) => handleNestedChange('feesAndCharges', 'applicableUpgradeFees', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2000" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Signup Fees if Direct Upgrade*</label>
                          <input type="number" value={formData.feesAndCharges?.signupFeesIfDirectUpgrade || 0} onChange={(e) => handleNestedChange('feesAndCharges', 'signupFeesIfDirectUpgrade', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 3000" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discount Plan Setting */}
                  <div id="bulkbuysetting" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Percent className="w-5 h-5 mr-2 text-blue-600" />
                      Discount Plan Setting
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" checked={formData.discountPlanSetting?.bulkBuySetting || false} onChange={(e) => handleNestedChange('discountPlanSetting', 'bulkBuySetting', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                          <span>Bulk Buy Setting</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" checked={formData.discountPlanSetting?.solarPanelBundleSetting || false} onChange={(e) => handleNestedChange('discountPlanSetting', 'solarPanelBundleSetting', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                          <span>Solar Panel Bundle Setting</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" checked={formData.discountPlanSetting?.offers || false} onChange={(e) => handleNestedChange('discountPlanSetting', 'offers', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                          <span>Offers</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cashback & Targets Section */}
                  <div id="cashbackSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-600" />
                      Cashback & Targets
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Target (kW)</label>
                          <input type="number" value={formData.cashbackAndTargets?.yearlyTargetKw || 0} onChange={(e) => handleNestedChange('cashbackAndTargets', 'yearlyTargetKw', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter target in kW" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cashback per kW (₹)</label>
                          <input type="number" value={formData.cashbackAndTargets?.cashbackPerKw || 0} onChange={(e) => handleNestedChange('cashbackAndTargets', 'cashbackPerKw', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter cashback per kW" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Cashback (₹)</label>
                          <input type="text" value={formData.cashbackAndTargets?.totalCashback || 0} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" />
                        </div>
                      </div>
                      <div className="mt-3 text-right">
                        <button type="button" onClick={() => handleNestedChange('cashbackAndTargets', 'totalCashback', (formData.cashbackAndTargets?.yearlyTargetKw || 0) * (formData.cashbackAndTargets?.cashbackPerKw || 0))} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center inline-flex">
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Buy Lead Setting */}
                  <div id="leadBuySettingSection" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                      Buy Lead Setting
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-wrap items-end gap-4">
                        <div className="w-full md:w-64">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Lead Setting</label>
                          <select value={formData.leadBuySetting || ''} onChange={(e) => handleTopLevelChange({ target: { name: 'leadBuySetting', value: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Lead Setting</option>
                            {['High Priority Leads', 'Medium Priority Leads', 'Low Cost Leads', 'Exclusive Leads', 'Bulk Leads'].map((setting, idx) => (
                              <option key={idx} value={setting}>{setting}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cashback Setup */}
                  <div id="commissionSection" className="mb-8 scroll-mt-20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                        Cashback Setup
                      </h3>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, cashbackSetup: [...(prev.cashbackSetup || []), { status: true, category: 'Solar Rooftop', subCategory: 'Residential', projectType: '', projectSubType: '', targetKw: 0, cashbackPerKw: 0, periodInMonth: 12, claimInMonth: 1, cashbackRedeemTo: '' }] }))} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Add Rule
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Category</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Sub-Category</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Project Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Target (kW)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Cashback/kW</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.cashbackSetup?.map((rule, idx) => (
                              <tr key={idx} className="border-t border-gray-200">
                                <td className="px-3 py-2">
                                  <input type="checkbox" checked={rule.status} onChange={(e) => { const arr = [...formData.cashbackSetup]; arr[idx].status = e.target.checked; setFormData(prev => ({ ...prev, cashbackSetup: arr })); }} className="rounded border-gray-300" />
                                </td>
                                <td className="px-3 py-2"><input type="text" value={rule.category} onChange={(e) => { const arr = [...formData.cashbackSetup]; arr[idx].category = e.target.value; setFormData(prev => ({ ...prev, cashbackSetup: arr })); }} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2"><input type="text" value={rule.subCategory} onChange={(e) => { const arr = [...formData.cashbackSetup]; arr[idx].subCategory = e.target.value; setFormData(prev => ({ ...prev, cashbackSetup: arr })); }} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2"><input type="text" value={rule.projectType || ''} onChange={(e) => { const arr = [...formData.cashbackSetup]; arr[idx].projectType = e.target.value; setFormData(prev => ({ ...prev, cashbackSetup: arr })); }} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2"><input type="number" value={rule.targetKw} onChange={(e) => { const arr = [...formData.cashbackSetup]; arr[idx].targetKw = parseFloat(e.target.value) || 0; setFormData(prev => ({ ...prev, cashbackSetup: arr })); }} className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2"><input type="number" value={rule.cashbackPerKw} onChange={(e) => { const arr = [...formData.cashbackSetup]; arr[idx].cashbackPerKw = parseFloat(e.target.value) || 0; setFormData(prev => ({ ...prev, cashbackSetup: arr })); }} className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2">
                                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, cashbackSetup: prev.cashbackSetup.filter((_, i) => i !== idx) }))} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            ))}
                            {(!formData.cashbackSetup || formData.cashbackSetup.length === 0) && (
                              <tr><td colSpan="7" className="px-3 py-4 text-center text-sm text-gray-500">No cashback rules defined. Click Add Rule.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Royalty Charges */}
                  <div id="royaltycharges" className="mb-8 scroll-mt-20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Percent className="w-5 h-5 mr-2 text-blue-600" />
                        Royalty Charges
                      </h3>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, royaltyChargesSetup: [...(prev.royaltyChargesSetup || []), { status: true, category: 'Solar Rooftop', subCategory: 'Residential', projectType: '', projectSubType: '', royaltyChargesPercent: 0 }] }))} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Add Rule
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Category</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Sub-Category</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Project Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Royalty (%)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.royaltyChargesSetup?.map((rule, idx) => (
                              <tr key={idx} className="border-t border-gray-200">
                                <td className="px-3 py-2">
                                  <input type="checkbox" checked={rule.status} onChange={(e) => { const arr = [...formData.royaltyChargesSetup]; arr[idx].status = e.target.checked; setFormData(prev => ({ ...prev, royaltyChargesSetup: arr })); }} className="rounded border-gray-300" />
                                </td>
                                <td className="px-3 py-2"><input type="text" value={rule.category} onChange={(e) => { const arr = [...formData.royaltyChargesSetup]; arr[idx].category = e.target.value; setFormData(prev => ({ ...prev, royaltyChargesSetup: arr })); }} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2"><input type="text" value={rule.subCategory} onChange={(e) => { const arr = [...formData.royaltyChargesSetup]; arr[idx].subCategory = e.target.value; setFormData(prev => ({ ...prev, royaltyChargesSetup: arr })); }} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2"><input type="text" value={rule.projectType || ''} onChange={(e) => { const arr = [...formData.royaltyChargesSetup]; arr[idx].projectType = e.target.value; setFormData(prev => ({ ...prev, royaltyChargesSetup: arr })); }} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2"><input type="number" value={rule.royaltyChargesPercent} onChange={(e) => { const arr = [...formData.royaltyChargesSetup]; arr[idx].royaltyChargesPercent = parseFloat(e.target.value) || 0; setFormData(prev => ({ ...prev, royaltyChargesSetup: arr })); }} className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                                <td className="px-3 py-2">
                                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, royaltyChargesSetup: prev.royaltyChargesSetup.filter((_, i) => i !== idx) }))} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            ))}
                            {(!formData.royaltyChargesSetup || formData.royaltyChargesSetup.length === 0) && (
                              <tr><td colSpan="6" className="px-3 py-4 text-center text-sm text-gray-500">No royalty rules defined. Click Add Rule.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Rewards And Points */}
                  <div id="rewardsPoints" className="mb-8 scroll-mt-20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-blue-600" />
                      Rewards And Points
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center">
                        <input type="checkbox" checked={formData.rewardsAndPointsSettings?.enabled || false} onChange={(e) => handleNestedChange('rewardsAndPointsSettings', 'enabled', e.target.checked)} className="rounded border-gray-300 text-blue-600 mr-2" />
                        <span>Enable Rewards And Points</span>
                      </label>
                    </div>
                  </div>

                  {/* Training Videos */}
                  <div id="trainingSection" className="mb-8 scroll-mt-20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Video className="w-5 h-5 mr-2 text-blue-600" />
                        Training Videos
                      </h3>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, trainingVideos: [...(prev.trainingVideos || []), { category: 'Solar Rooftop', sectionName: '', uploadVideo: '', youtubeLink: '' }] }))} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Add Video Section
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-4">
                        {formData.trainingVideos?.map((video, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, trainingVideos: prev.trainingVideos.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input type="text" value={video.category} onChange={(e) => { const arr = [...formData.trainingVideos]; arr[idx].category = e.target.value; setFormData(prev => ({ ...prev, trainingVideos: arr })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                                <input type="text" value={video.sectionName} onChange={(e) => { const arr = [...formData.trainingVideos]; arr[idx].sectionName = e.target.value; setFormData(prev => ({ ...prev, trainingVideos: arr })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Section Name" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Link</label>
                                <input type="url" value={video.youtubeLink} onChange={(e) => { const arr = [...formData.trainingVideos]; arr[idx].youtubeLink = e.target.value; setFormData(prev => ({ ...prev, trainingVideos: arr })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/xyz" />
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!formData.trainingVideos || formData.trainingVideos.length === 0) && (
                          <div className="text-gray-500 text-sm text-center">No videos added yet.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 text-right">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center inline-flex"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Right Sidebar - Plan Card */}
          {selectedState && formData && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm sticky top-20">
                <div className={`${formData.colorArgs?.headerColor || 'bg-blue-600'} text-white text-center py-4 rounded-t-lg`}>
                  <h3 className="text-xl font-bold">{formData.name || 'Plan Name'}</h3>
                  <p className="text-sm opacity-90">{formData.description || 'Plan Description'}</p>
                </div>
                <div className="p-4">
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-gray-800">₹{formData.price || 0}</span>
                    <p className="text-sm text-gray-500">{formData.priceDescription || 'signup fees'}</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-3 rounded-lg mb-4">
                    <div className="flex justify-between">
                      <span>Yearly Target:</span>
                      <span className="font-bold">{formData.cashbackAndTargets?.yearlyTargetKw || 0} kW</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Total Cashback:</span>
                      <span className="font-bold">₹{formData.cashbackAndTargets?.totalCashback || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm">Platform Access Included</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm">{formData.userManagement?.userLimits || 0} Users</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCashbackModal(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Cashback
                      </button>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.featuresList?.platformFeatures?.map((feature, idx) => (
                          <span key={`pf-${idx}`} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                        {formData.featuresList?.crmAppFeatures?.map((feature, idx) => (
                          <span key={`cf-${idx}`} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Required Documents:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {(formData.onboardingRequirements?.kycDocuments || []).map((doc, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg text-sm">
                      <span className="font-medium">Upgrade Fee: </span>
                      <span>₹{formData.feesAndCharges?.applicableUpgradeFees || 0}</span>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-3 text-white font-medium rounded-lg transition-opacity hover:opacity-90 bg-gradient-to-br ${formData.colorArgs?.buttonColor || 'from-blue-600 to-purple-600'}`}
                    >
                      UPGRADE PLAN <ArrowUp className="w-4 h-4 ml-2 inline pr-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cashback Details Modal */}
      {showCashbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Cashback Details</h3>
              <button onClick={() => setShowCashbackModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sub Category</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Project Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sub Project Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cashback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.cashbackSetup?.map((rule, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-4 py-2">{rule.category}</td>
                        <td className="px-4 py-2">{rule.subCategory}</td>
                        <td className="px-4 py-2">{rule.projectType || '-'}</td>
                        <td className="px-4 py-2">{rule.projectSubType || '-'}</td>
                        <td className="px-4 py-2">₹{rule.cashbackPerKw}</td>
                      </tr>
                    ))}
                    {(!formData.cashbackSetup || formData.cashbackSetup.length === 0) && (
                      <tr><td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">No cashback rules defined.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCashbackModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseSettings;