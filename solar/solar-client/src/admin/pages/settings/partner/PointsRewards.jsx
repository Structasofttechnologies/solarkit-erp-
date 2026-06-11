import React, { useState, useEffect } from 'react';
import {
  CheckCircle, GitBranch, RefreshCw, Gift,
  Smartphone, DollarSign, Plane, Package, Umbrella,
  Tablet, Watch, Wine, Utensils,
  Upload, X, Save, Edit, Trash2,
  Plus, Loader, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPartnerRewards,
  createPartnerReward,
  deletePartnerReward,
  updatePartnerReward,
  getPartners,
  getPartnerPlans
} from '../../../../services/partner/partnerApi';
import {
  getCategories,
  getSubCategories,
  getProjectCategoryMappings,
  getSubProjectTypes
} from '../../../../services/settings/orderProcurementSettingApi';

export default function PartnerPointsRewards() {
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerType, setSelectedPartnerType] = useState('');
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plansLoading, setPlansLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Master Data States for Dynamic Dropdowns
  const [masterCategories, setMasterCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [projectMappings, setProjectMappings] = useState([]);
  const [allSubProjectTypes, setAllSubProjectTypes] = useState([]);

  // Filter Options for Modal
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [availableProjectTypes, setAvailableProjectTypes] = useState([]);
  const [availableSubProjectTypes, setAvailableSubProjectTypes] = useState([]);

  // Dynamic Data States
  const [projectPoints, setProjectPoints] = useState([]);
  const [rewards, setRewards] = useState({
    products: [],
    cashback: [],
    experiences: []
  });
  const [redeemSettings, setRedeemSettings] = useState({
    minPoints: 10000,
    frequency: 'quarterly',
    _id: null // Store ID if it exists
  });

  // Modal States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCashbackModal, setShowAddCashbackModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showAddProjectTypeModal, setShowAddProjectTypeModal] = useState(false);

  // Form States
  const [newProduct, setNewProduct] = useState({ name: '', description: '', points: '', category: '', imageUrl: '', imageFile: null });
  const [newCashback, setNewCashback] = useState({ amount: '', couponCode: '', points: '', redemptionMethod: '', description: '', imageUrl: '', imageFile: null });
  const [newExperience, setNewExperience] = useState({ name: '', description: '', points: '', duration: '', location: '', imageUrl: '', imageFile: null });
  const [newProjectType, setNewProjectType] = useState({ categoryType: '', subCategory: '', projectType: '', subProjectType: '', pointsPerKw: '' });

  // Initial Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [partnersData, cats, mappings, subPTs, subCats] = await Promise.all([
        getPartners(),
        getCategories(),
        getProjectCategoryMappings(),
        getSubProjectTypes(),
        getSubCategories()
      ]);

      setPartners(partnersData);
      setMasterCategories(cats?.data || []);
      setProjectMappings(mappings?.data || []);
      setAllSubProjectTypes(subPTs?.data || []);
      setAllSubCategories(subCats?.data || []);

      if (partnersData.length > 0) {
        setSelectedPartnerType(partnersData[0].name);
        fetchPlans(partnersData[0].name);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Plans when Partner Type changes
  const fetchPlans = async (type) => {
    try {
      setPlansLoading(true);
      const plansData = await getPartnerPlans(type);
      setPlans(plansData);
      if (plansData.length > 0) {
        setSelectedPlan(plansData[0].name);
      } else {
        setSelectedPlan('');
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setPlansLoading(false);
    }
  };

  // Fetch Data when Partner Type or Plan changes
  useEffect(() => {
    if (selectedPartnerType && selectedPlan) {
      fetchData();
    } else {
      // Clear data if either is missing
      setProjectPoints([]);
      setRewards({ products: [], cashback: [], experiences: [] });
      setRedeemSettings({ minPoints: 10000, frequency: 'quarterly', _id: null });
    }
  }, [selectedPartnerType, selectedPlan]);


  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPartnerRewards(selectedPartnerType, selectedPlan);

      // Separate data by type
      const points = data.filter(item => item.type === 'project_point_rule');
      const prods = data.filter(item => item.type === 'product');
      const cash = data.filter(item => item.type === 'cashback');
      const exps = data.filter(item => item.type === 'experience');
      const settings = data.find(item => item.type === 'redeem_settings');

      setProjectPoints(points);
      setRewards({
        products: prods,
        cashback: cash,
        experiences: exps
      });

      if (settings) {
        setRedeemSettings({
          minPoints: settings.points || 10000, // Reuse points field for minPoints
          frequency: settings.description || 'quarterly', // Reuse description for frequency
          _id: settings._id
        });
      } else {
         setRedeemSettings({ minPoints: 10000, frequency: 'quarterly', _id: null });
      }

    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load data for selected partner');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleFileUpload = (setter, file, previewField = 'imageUrl') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(prev => ({
        ...prev,
        [previewField]: e.target.result,
        imageFile: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async () => {
    if(!selectedPartnerType) return toast.error("Select Partner Type");
    try {
      const payload = {
        partnerType: selectedPartnerType,
        plan: selectedPlan,
        type: 'product',
        name: newProduct.name,
        description: newProduct.description,
        points: parseInt(newProduct.points),
        image: newProduct.imageUrl,
        category: newProduct.category
      };
      await createPartnerReward(payload);
      toast.success('Product added successfully!');
      setShowAddProductModal(false);
      fetchData();
      setNewProduct({ name: '', description: '', points: '', category: '', imageUrl: '', imageFile: null });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add product');
    }
  };

  const handleAddCashback = async () => {
    if(!selectedPartnerType) return toast.error("Select Partner Type");
    try {
      const payload = {
        partnerType: selectedPartnerType,
        plan: selectedPlan,
        type: 'cashback',
        name: `₹${parseInt(newCashback.amount).toLocaleString()} Cashback`,
        couponCode: newCashback.couponCode,
        description: newCashback.description || 'Redeemable for direct cash transfer',
        points: parseInt(newCashback.points),
        image: newCashback.imageUrl,
        amount: parseInt(newCashback.amount)
      };
      await createPartnerReward(payload);
      toast.success('Cashback added successfully!');
      setShowAddCashbackModal(false);
      fetchData();
      setNewCashback({ amount: '', couponCode: '', points: '', redemptionMethod: '', description: '', imageUrl: '', imageFile: null });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add cashback');
    }
  };

  const handleAddExperience = async () => {
    if(!selectedPartnerType) return toast.error("Select Partner Type");
    try {
      const payload = {
        partnerType: selectedPartnerType,
        plan: selectedPlan,
        type: 'experience',
        name: newExperience.name,
        description: newExperience.description,
        points: parseInt(newExperience.points),
        image: newExperience.imageUrl,
        duration: parseInt(newExperience.duration),
        location: newExperience.location
      };
      await createPartnerReward(payload);
      toast.success('Experience added successfully!');
      setShowAddExperienceModal(false);
      fetchData();
      setNewExperience({ name: '', description: '', points: '', duration: '', location: '', imageUrl: '', imageFile: null });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add experience');
    }
  };

  // Hierarchical Filter Handlers for Add Project Type Modal
  const handleModalCategoryChange = async (catName) => {
    setNewProjectType(prev => ({ ...prev, categoryType: catName, subCategory: '', projectType: '', subProjectType: '' }));
    setAvailableSubCategories([]);
    setAvailableProjectTypes([]);
    setAvailableSubProjectTypes([]);

    if (catName) {
      const selCat = masterCategories.find(c => c.name === catName);
      if (selCat) {
        try {
          const res = await getSubCategories(selCat._id);
          setAvailableSubCategories(res.data || []);
        } catch (err) {
          console.error("Error loading sub categories:", err);
        }
      }
    }
  };

  const handleModalSubCategoryChange = (subCatName) => {
    setNewProjectType(prev => ({ ...prev, subCategory: subCatName, projectType: '', subProjectType: '' }));
    setAvailableProjectTypes([]);
    setAvailableSubProjectTypes([]);

    if (newProjectType.categoryType && subCatName) {
      const selCat = masterCategories.find(c => c.name === newProjectType.categoryType);
      const selSubCat = allSubCategories.find(sc => sc.name === subCatName);

      if (selCat && selSubCat) {
        const ranges = projectMappings
          .filter(m =>
            (m.categoryId?._id || m.categoryId) === selCat._id &&
            (m.subCategoryId?._id || m.subCategoryId) === selSubCat._id
          )
          .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
          .filter((v, i, a) => a.indexOf(v) === i);
        setAvailableProjectTypes(ranges);
      }
    }
  };

  const handleModalProjectTypeChange = (ptName) => {
    setNewProjectType(prev => ({ ...prev, projectType: ptName, subProjectType: '' }));
    setAvailableSubProjectTypes([]);

    if (ptName) {
      setAvailableSubProjectTypes(allSubProjectTypes);
    }
  };

  const handleAddProjectType = async () => {
    if(!selectedPartnerType) return toast.error("Select Partner Type");
    try {
      const payload = {
        partnerType: selectedPartnerType,
        plan: selectedPlan,
        type: 'project_point_rule',
        projectRule: {
          categoryType: newProjectType.categoryType,
          subCategory: newProjectType.subCategory,
          projectType: newProjectType.projectType,
          subProjectType: newProjectType.subProjectType,
          pointsPerKw: parseInt(newProjectType.pointsPerKw)
        }
      };
      await createPartnerReward(payload);
      toast.success('Project type added successfully!');
      setShowAddProjectTypeModal(false);
      fetchData();
      setNewProjectType({ categoryType: '', subCategory: '', projectType: '', subProjectType: '', pointsPerKw: '' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add project type');
    }
  };

  const handleDeleteReward = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deletePartnerReward(id);
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete');
      }
    }
  };

  const handleUpdateProjectPoints = async (id, field, value) => {
    // Optimistic update for UI smoothness, but typically we'd save on blur or a save button
    setProjectPoints(prev => prev.map(p => {
      if (p._id === id) {
        return {
          ...p,
          projectRule: {
            ...p.projectRule,
            [field]: value
          }
        }
      }
      return p;
    }));
  };

  const saveProjectPointRow = async (item) => {
    try {
      await updatePartnerReward(item._id, {
        partnerType: selectedPartnerType,
        plan: selectedPlan,
        projectRule: item.projectRule
      });
      toast.success('Rule saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save rule');
    }
  }


  const saveRedeemSettings = async () => {
    if(!selectedPartnerType) return toast.error("Select Partner Type");
    try {
      const payload = {
        partnerType: selectedPartnerType,
        plan: selectedPlan,
        type: 'redeem_settings',
        points: redeemSettings.minPoints, // storing minPoints in 'points' field
        description: redeemSettings.frequency // storing frequency in 'description' field
      };

      if (redeemSettings._id) {
        await updatePartnerReward(redeemSettings._id, payload);
      } else {
        await createPartnerReward(payload);
      }
      toast.success('Redeem settings saved!');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    }
  };

  const calculateExamplePoints = (projectType, pointsPerKw) => {
    const examples = {
      '3kw-5kw': { kw: 5, text: 'Example: 5kW ×' },
      '5kw-10kw': { kw: 40, text: 'Example: 40kW ×' },
      '10kw-20kw': { kw: 20, text: 'Example: 20kW ×' },
      '20kw-50kw': { kw: 35, text: 'Example: 35kW ×' },
      '2hp-5hp': { kw: 7.5, text: 'Example: 7.5kW ×' },
      '5hp-10hp': { kw: 15, text: 'Example: 15kW ×' },
      '10hp-20hp': { kw: 25, text: 'Example: 25kW ×' }
    };

    const example = examples[projectType] || examples['3kw-5kw'] || { kw: 10, text: 'Example: 10kW x' };
    const totalPoints = example.kw * (pointsPerKw || 0);
    return `${example.text} ${pointsPerKw || 0} = ${totalPoints.toLocaleString()} points`;
  };


  if (loading && partners.length === 0) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header & Configuration Selectors */}
      <div className="mb-6 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
          <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Partner Points and Reward System</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Partner Type</label>
            <select
              value={selectedPartnerType}
              onChange={(e) => {
                setSelectedPartnerType(e.target.value);
                fetchPlans(e.target.value);
              }}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="">-- Select Partner Type --</option>
              {partners.map(partner => (
                <option key={partner._id} value={partner.name}>{partner.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              disabled={plansLoading || !selectedPartnerType}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border disabled:bg-gray-100"
            >
              <option value="">{plansLoading ? 'Loading Plans...' : '-- Select Plan --'}</option>
              {plans.map(plan => (
                <option key={plan._id} value={plan.name}>{plan.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {(!selectedPartnerType || !selectedPlan) ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-dashed flex flex-col items-center">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          Please select a Partner Type and Plan to configure points and rewards.
        </div>
      ) : (
        <>
          {/* Project Points Configuration */}
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
              <div className="flex items-center">
                <GitBranch className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Project Points Configuration</h2>
              </div>
              <button
                onClick={() => setShowAddProjectTypeModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Project Type
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points/kW</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectPoints.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.projectRule?.categoryType || ''}
                          onChange={(e) => handleUpdateProjectPoints(item._id, 'categoryType', e.target.value)}
                          className="border rounded p-1 w-full"
                        >
                          <option value="">Select Category</option>
                          {masterCategories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.projectRule?.subCategory || ''}
                          onChange={(e) => handleUpdateProjectPoints(item._id, 'subCategory', e.target.value)}
                          className="border rounded p-1 w-full"
                        >
                          <option value="">Select Sub Category</option>
                          {allSubCategories
                            .filter(sc => {
                              const selCat = masterCategories.find(c => c.name === item.projectRule?.categoryType);
                              return !selCat || (sc.categoryId?._id || sc.categoryId) === selCat._id;
                            })
                            .map(sc => (
                              <option key={sc._id} value={sc.name}>{sc.name}</option>
                            ))
                          }
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.projectRule?.projectType || ''}
                          onChange={(e) => handleUpdateProjectPoints(item._id, 'projectType', e.target.value)}
                          className="border rounded p-1 w-full"
                        >
                          <option value="">Select Capacity</option>
                          {projectMappings
                            .filter(m => {
                              const selCat = masterCategories.find(c => c.name === item.projectRule?.categoryType);
                              const selSubCat = allSubCategories.find(sc => sc.name === item.projectRule?.subCategory);
                              return (!selCat || (m.categoryId?._id || m.categoryId) === selCat._id) &&
                                     (!selSubCat || (m.subCategoryId?._id || m.subCategoryId) === selSubCat._id);
                            })
                            .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .map((range, idx) => (
                              <option key={idx} value={range}>{range}</option>
                            ))
                          }
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.projectRule?.subProjectType || ''}
                          onChange={(e) => handleUpdateProjectPoints(item._id, 'subProjectType', e.target.value)}
                          className="border rounded p-1 w-full"
                        >
                          <option value="">Select Connection</option>
                          {allSubProjectTypes.map(st => (
                            <option key={st._id} value={st.name}>{st.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.projectRule?.pointsPerKw || 0}
                          onChange={(e) => handleUpdateProjectPoints(item._id, 'pointsPerKw', parseInt(e.target.value))}
                          className="border rounded p-1 w-20"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {calculateExamplePoints(item.projectRule?.projectType, item.projectRule?.pointsPerKw)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                        <button onClick={() => saveProjectPointRow(item)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors" title="Save changes"><Save className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteReward(item._id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors" title="Delete rule"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {projectPoints.length === 0 && (
                     <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">No project points configured yet.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Redeem Settings */}
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center">
              <RefreshCw className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Redeem Settings</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Points</label>
                <input
                  type="number"
                  value={redeemSettings.minPoints}
                  onChange={(e) => setRedeemSettings(prev => ({ ...prev, minPoints: parseInt(e.target.value) || 0 }))}
                  className="block w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={redeemSettings.frequency}
                  onChange={(e) => setRedeemSettings(prev => ({ ...prev, frequency: e.target.value }))}
                  className="block w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="biannually">Bi-Annually</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end p-6 pt-0">
              <button onClick={saveRedeemSettings} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center shadow-sm">
                <Save className="w-4 h-4 mr-2" /> Save Settings
              </button>
            </div>
          </div>

          {/* Rewards Management */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center">
                <Gift className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Rewards Management</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowAddProductModal(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center shadow text-sm hover:bg-blue-700"><Smartphone className="w-4 h-4 mr-1" /> Product</button>
                <button onClick={() => setShowAddCashbackModal(true)} className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg flex items-center shadow text-sm hover:bg-yellow-600"><DollarSign className="w-4 h-4 mr-1" /> Cashback</button>
                <button onClick={() => setShowAddExperienceModal(true)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg flex items-center shadow text-sm hover:bg-green-700"><Plane className="w-4 h-4 mr-1" /> Experience</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {['products', 'cashback', 'experiences'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 font-medium text-sm border-b-2 capitalize whitespace-nowrap ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards[activeTab].map(item => (
                  <div key={item._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all relative group flex flex-col">
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                       {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Gift className="w-12 h-12 text-gray-300" />
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={() => handleDeleteReward(item._id)} className="bg-white text-red-500 p-1.5 rounded-full shadow hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                      <div className="mt-auto flex justify-between items-center pt-2 border-t">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{item.points.toLocaleString()} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
                {rewards[activeTab].length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-gray-50 text-gray-500">
                    <Gift className="w-12 h-12 mb-3 text-gray-300" />
                    <p>No {activeTab} added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Modals --- */}
      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Add Product Reward</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:bg-gray-100 rounded-full p-1"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <input className="w-full border p-2 rounded-lg" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              <textarea className="w-full border p-2 rounded-lg" placeholder="Description" rows="2" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
              <input className="w-full border p-2 rounded-lg" placeholder="Points Required" type="number" value={newProduct.points} onChange={e => setNewProduct({ ...newProduct, points: e.target.value })} />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Product Image</label>
                <input className="w-full border p-1 rounded-lg text-sm" type="file" accept="image/*" onChange={e => handleFileUpload(setNewProduct, e.target.files[0])} />
                {newProduct.imageUrl && <img src={newProduct.imageUrl} alt="Preview" className="mt-2 h-20 w-auto rounded border" />}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Cancel</button>
              <button onClick={handleAddProduct} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Add Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cashback Modal */}
      {showAddCashbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Add Cashback Reward</h3>
               <button onClick={() => setShowAddCashbackModal(false)} className="text-gray-400 hover:bg-gray-100 rounded-full p-1"><X className="w-5 h-5"/></button>
            </div>
             <div className="space-y-3">
              <input className="w-full border p-2 rounded-lg" placeholder="Amount (₹)" type="number" value={newCashback.amount} onChange={e => setNewCashback({ ...newCashback, amount: e.target.value })} />
              <input className="w-full border p-2 rounded-lg" placeholder="Coupon Code (Optional)" value={newCashback.couponCode} onChange={e => setNewCashback({ ...newCashback, couponCode: e.target.value })} />
              <input className="w-full border p-2 rounded-lg" placeholder="Points Cost" type="number" value={newCashback.points} onChange={e => setNewCashback({ ...newCashback, points: e.target.value })} />
              <textarea className="w-full border p-2 rounded-lg" placeholder="Description" rows="2" value={newCashback.description} onChange={e => setNewCashback({ ...newCashback, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddCashbackModal(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Cancel</button>
              <button onClick={handleAddCashback} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Add Cashback</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Add Experience Reward</h3>
               <button onClick={() => setShowAddExperienceModal(false)} className="text-gray-400 hover:bg-gray-100 rounded-full p-1"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <input className="w-full border p-2 rounded-lg" placeholder="Experience Name (e.g. Goa Trip)" value={newExperience.name} onChange={e => setNewExperience({ ...newExperience, name: e.target.value })} />
              <input className="w-full border p-2 rounded-lg" placeholder="Location" value={newExperience.location} onChange={e => setNewExperience({ ...newExperience, location: e.target.value })} />
              <div className="flex gap-2">
                 <input className="w-1/2 border p-2 rounded-lg" placeholder="Duration (Days)" type="number" value={newExperience.duration} onChange={e => setNewExperience({ ...newExperience, duration: e.target.value })} />
                 <input className="w-1/2 border p-2 rounded-lg" placeholder="Points Req." type="number" value={newExperience.points} onChange={e => setNewExperience({ ...newExperience, points: e.target.value })} />
              </div>
              <textarea className="w-full border p-2 rounded-lg" placeholder="Description" rows="2" value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} />
               <div>
                <label className="block text-sm text-gray-600 mb-1">Cover Image</label>
                <input className="w-full border p-1 rounded-lg text-sm" type="file" accept="image/*" onChange={e => handleFileUpload(setNewExperience, e.target.files[0])} />
                {newExperience.imageUrl && <img src={newExperience.imageUrl} alt="Preview" className="mt-2 h-20 w-auto rounded border" />}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddExperienceModal(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Cancel</button>
              <button onClick={handleAddExperience} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Add Experience</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Type Modal */}
      {showAddProjectTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Add Project Rule</h3>
               <button onClick={() => setShowAddProjectTypeModal(false)} className="text-gray-400 hover:bg-gray-100 rounded-full p-1"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <select className="w-full border p-2 rounded-lg" value={newProjectType.categoryType} onChange={e => handleModalCategoryChange(e.target.value)}>
                <option value="">Select Category</option>
                {masterCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <select 
                className="w-full border p-2 rounded-lg disabled:bg-gray-50" 
                value={newProjectType.subCategory} 
                onChange={e => handleModalSubCategoryChange(e.target.value)}
                disabled={!newProjectType.categoryType}
              >
                <option value="">Select Sub Category</option>
                {availableSubCategories.map(sc => (
                  <option key={sc._id} value={sc.name}>{sc.name}</option>
                ))}
              </select>
              <select 
                className="w-full border p-2 rounded-lg disabled:bg-gray-50" 
                value={newProjectType.projectType} 
                onChange={e => handleModalProjectTypeChange(e.target.value)}
                disabled={!newProjectType.subCategory}
              >
                <option value="">Select Capacity Range</option>
                {availableProjectTypes.map((range, idx) => (
                  <option key={idx} value={range}>{range}</option>
                ))}
              </select>
              <select 
                className="w-full border p-2 rounded-lg disabled:bg-gray-50" 
                value={newProjectType.subProjectType} 
                onChange={e => setNewProjectType({ ...newProjectType, subProjectType: e.target.value })}
                disabled={!newProjectType.projectType}
              >
                <option value="">Select Connection Type</option>
                {availableSubProjectTypes.map(st => (
                  <option key={st._id} value={st.name}>{st.name}</option>
                ))}
              </select>
              <input className="w-full border p-2 rounded-lg" placeholder="Points Per kW" type="number" value={newProjectType.pointsPerKw} onChange={e => setNewProjectType({ ...newProjectType, pointsPerKw: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddProjectTypeModal(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">Cancel</button>
              <button onClick={handleAddProjectType} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Add Rule</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
