import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Layers,
  Building2,
  SolarPanel,
  SlidersHorizontal,
  Plus,
  Check,
  MapPin,
  Users,
  FileText,
  Save,
  Trash2,
  Edit,
  X,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDealerPlans, createDealerPlan, updateDealerPlan, deleteDealerPlan } from '../../../../services/dealer/dealerApi';

export default function DealerPlans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  // Initial Form State Template
  const initialFormState = {
    name: '',
    message: '',
    yearlyTarget: '',
    incentive: '',
    price: '',
    features: [],
    documents: [],
    depositFees: '',
    config: {
      kyc: { aadhar: true, pan: true, gst: false, verifiedDealer: false, notVerifiedDealer: true },
      eligibility: { kyc: true, agreement: true, depositCheque: true, gstRequired: false, gstAmount: '', depositAmount: '', noCashback: false },
      coverage: { area: '1 District', city: true, district: true, cluster: false, state: false },
      user: { sales: true, dealer: true, leadPartner: true, service: true, userLimit: 10, noSublogin: false },
      module: { lead: true, loan: true, quotes: true, projectSignup: true, trainingVideo: true },
      category: { solarPanel: true, solarRooftop: true, solarPump: false, solarWater: false, upto100kw: true, upto200kw: true, above100kw: false, above200kw: false, residential: true, commercial: true, onGrid: true, offGrid: true, hybrid: false },
      features: { adminApp: true, adminCrm: false, dealerUser: true, leadPartner: true, districtManager: false, appSubUser: false, crmLeadManagement: true, crmAssignLead: false, crmKnowMargin: true, crmSurveyBom: true, crmInstall: true, crmService: false, crmProjectManagement: false, crmAmcPlan: false },
      quote: { quickQuote: true, surveyQuote: true, generationGraph: false, addons: false, projectSignupLimit: '', deliveryType: '' },
      fees: { signupFees: '', installerCharges: '', sdAmountCheque: '', upgradeFees: '', directUpgradeFees: '' },
      incentive: { yearlyTarget: '', cashbackPerKw: '', totalIncentive: '' }
    },
    ui: { headerColor: 'bg-blue-600', buttonColor: 'from-blue-500 to-blue-600', icon: 'Rocket', accessType: 'App Only Access', userDescription: 'Single User' }
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Plans
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getDealerPlans();
      setPlans(data);
      if (data.length > 0 && !selectedPlanId) {
        setSelectedPlanId(data[0]._id);
        const plan = data[0];
        // Ensure config structure exists even if partial data comes back
        setFormData({
          ...initialFormState,
          ...plan,
          config: {
            ...initialFormState.config,
            ...plan.config
          }
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    if (planId === 'settings') return; // Special case if we keep settings separate

    const plan = plans.find(p => p._id === planId);
    if (plan) {
      setFormData({
        ...initialFormState,
        ...plan,
        config: {
          ...initialFormState.config,
          ...plan.config
        }
      });
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [section]: {
          ...prev.config[section],
          [field]: value
        }
      }
    }));
  };

  const handleRootInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlanId) {
        await updateDealerPlan(selectedPlanId, formData);
        toast.success('Plan updated successfully');
        fetchPlans();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update plan');
    }
  };

  const handleCreatePlan = async () => {
    try {
      const newPlan = { ...initialFormState, name: formData.name || 'New Plan', price: formData.price || '0' }; // Ensure minimal fields
      await createDealerPlan(newPlan);
      toast.success('Plan created successfully');
      setShowAddPlanModal(false);
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create plan');
    }
  }

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteDealerPlan(id);
        toast.success('Plan deleted');
        // If deleted selected plan, select another one
        if (selectedPlanId === id) {
          setSelectedPlanId(null);
        }
        fetchPlans();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete plan');
      }
    }
  }

  // Icons map for URI rendering
  const getIcon = (iconName, className) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'SolarPanel': return <SolarPanel className={className} />;
      default: return <Rocket className={className} />;
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Dealer Plans Configuration</h1>
          </div>
          <button
            onClick={() => {
              setFormData(initialFormState); // Reset form for new plan
              setShowAddPlanModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Plan List */}
        <div className="w-full lg:w-1/4 space-y-4">
          {plans.map(plan => (
            <div
              key={plan._id}
              onClick={() => handlePlanSelect(plan._id)}
              className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 transition-all ${selectedPlanId === plan._id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${plan.ui?.headerColor?.replace('bg-', 'text-') || 'text-blue-600'} bg-opacity-10`}>
                    {getIcon(plan.ui?.icon, "w-5 h-5")}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.price}</p>
                  </div>
                </div>
                {selectedPlanId === plan._id && <Check className="w-5 h-5 text-blue-500" />}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Form */}
        <div className="w-full lg:w-3/4">
          {selectedPlanId && (
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-8">
              {/* Plan Header Info */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleRootInputChange('name', e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                    ) : formData.name}
                    <span className="text-sm font-normal text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </h2>
                  <p className="text-gray-500">{formData.price}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleDeletePlan(selectedPlanId)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>

              {/* Basic Info Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input type="text" value={formData.name} onChange={(e) => handleRootInputChange('name', e.target.value)} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="text" value={formData.price} onChange={(e) => handleRootInputChange('price', e.target.value)} className="w-full border rounded-lg p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description / Message</label>
                  <input type="text" value={formData.message} onChange={(e) => handleRootInputChange('message', e.target.value)} className="w-full border rounded-lg p-2" />
                </div>
              </div>

              {/* Config Sections */}

              {/* KYC */}
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3 font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> KYC Requirements
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.config.kyc).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleInputChange('kyc', key, e.target.checked)}
                        className="rounded text-blue-600 mr-2"
                      />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility */}
              <div className="border border-green-200 rounded-xl overflow-hidden">
                <div className="bg-green-600 text-white px-4 py-3 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Eligibility
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Checkboxes */}
                  <div className="space-y-2">
                    {['kyc', 'agreement', 'depositCheque', 'gstRequired', 'noCashback'].map(key => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.config.eligibility[key]}
                          onChange={(e) => handleInputChange('eligibility', key, e.target.checked)}
                          className="rounded text-green-600 mr-2"
                        />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">GST Amount</label>
                      <input type="text" value={formData.config.eligibility.gstAmount} onChange={(e) => handleInputChange('eligibility', 'gstAmount', e.target.value)} className="w-full border rounded p-1" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Deposit Amount</label>
                      <input type="text" value={formData.config.eligibility.depositAmount} onChange={(e) => handleInputChange('eligibility', 'depositAmount', e.target.value)} className="w-full border rounded p-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage */}
              <div className="border border-purple-200 rounded-xl overflow-hidden">
                <div className="bg-purple-600 text-white px-4 py-3 font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Coverage
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area Title</label>
                    <input type="text" value={formData.config.coverage.area} onChange={(e) => handleInputChange('coverage', 'area', e.target.value)} className="w-full border rounded p-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['city', 'district', 'cluster', 'state'].map(key => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.config.coverage[key]}
                          onChange={(e) => handleInputChange('coverage', key, e.target.checked)}
                          className="rounded text-purple-600 mr-2"
                        />
                        <span className="capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Management */}
              <div className="border border-orange-200 rounded-xl overflow-hidden">
                <div className="bg-orange-500 text-white px-4 py-3 font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" /> User Management
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {['sales', 'dealer', 'leadPartner', 'service', 'noSublogin'].map(key => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.config.user[key]}
                          onChange={(e) => handleInputChange('user', key, e.target.checked)}
                          className="rounded text-orange-600 mr-2"
                        />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Limit</label>
                    <input type="number" value={formData.config.user.userLimit} onChange={(e) => handleInputChange('user', 'userLimit', parseInt(e.target.value))} className="border rounded p-2 w-32" />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-700 text-white px-4 py-3 font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Features & Access
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(formData.config.features).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleInputChange('features', key, e.target.checked)}
                        className="rounded text-gray-700 mr-2"
                      />
                      <span className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </form>
          )}
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Plan</h3>
            <input
              type="text"
              placeholder="Plan Name"
              className="w-full border rounded p-2 mb-4"
              value={formData.name}
              onChange={(e) => handleRootInputChange('name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Price"
              className="w-full border rounded p-2 mb-4"
              value={formData.price}
              onChange={(e) => handleRootInputChange('price', e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddPlanModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={handleCreatePlan} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}