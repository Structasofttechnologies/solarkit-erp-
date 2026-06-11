import React, { useState, useEffect } from 'react';
import {
  Save,
  Edit,
  Trash2,
  Plus,
  Package,
  Plane,
  Gift,
  Bike,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  Wine,
  Mountain,
  Umbrella,
  Utensils,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getFranchiseeRewards,
  createFranchiseeReward,
  updateFranchiseeReward,
  deleteFranchiseeReward,
  getRedeemSettings,
  saveRedeemSettings
} from '../../../../services/franchisee/franchiseeApi';

const PointsRewards = () => {
  const [activeTab, setActiveTab] = useState('product');
  const [projectPoints, setProjectPoints] = useState([]);
  const [products, setProducts] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [redeemSettings, setRedeemSettings] = useState({
    minRedeemPoints: 10000,
    redeemFrequency: 'quarterly',
    _id: null
  });

  const [loading, setLoading] = useState(false);

  // Modal States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Form States
  const [newProduct, setNewProduct] = useState({ name: '', description: '', points: '', category: 'electronics' });
  const [newExperience, setNewExperience] = useState({ name: '', description: '', points: '', duration: '' });
  const [newProjectPoint, setNewProjectPoint] = useState({
    categoryType: 'solar-rooftop',
    subCategory: 'residential',
    projectType: '',
    subProjectType: 'on-grid',
    kw: '',
    points: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projPoints, prods, exps, settings] = await Promise.all([
        getFranchiseeRewards('project_point'),
        getFranchiseeRewards('product'),
        getFranchiseeRewards('experience'),
        getRedeemSettings()
      ]);
      setProjectPoints(projPoints);
      setProducts(prods);
      setExperiences(exps);
      if (settings && settings._id) {
        setRedeemSettings(settings);
      }
    } catch (error) {
      console.error("Error fetching rewards data:", error);
      toast.error("Failed to load rewards data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRedeemSettings = async () => {
    try {
      const updated = await saveRedeemSettings({
        minRedeemPoints: redeemSettings.minRedeemPoints,
        redeemFrequency: redeemSettings.redeemFrequency
      });
      setRedeemSettings(updated);
      toast.success('Redeem settings saved successfully!');
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleDeleteReward = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    try {
      await deleteFranchiseeReward(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      setExperiences(prev => prev.filter(e => e._id !== id));
      setProjectPoints(prev => prev.filter(p => p._id !== id));
      toast.success('Reward deleted successfully');
    } catch (error) {
      toast.error('Failed to delete reward');
    }
  };

  // Project Point Handlers
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newProjectPoint, type: 'project_point' };
      const created = await createFranchiseeReward(payload);
      setProjectPoints([...projectPoints, created]);
      setShowAddProjectModal(false);
      setNewProjectPoint({ categoryType: 'solar-rooftop', subCategory: 'residential', projectType: '', subProjectType: 'on-grid', kw: '', points: '' });
      toast.success('Project type added successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add project type');
    }
  };

  const handleUpdateProjectPoint = async (id, field, value) => {
    // Optimistic update for UI input smoothness (optional, or just local state)
    // ideally we would have a save button for each row or auto-save on blur
    // For this demo, let's just update local state and have a save button per row
    setProjectPoints(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  const handleSaveProjectPointRow = async (id) => {
    const point = projectPoints.find(p => p._id === id);
    try {
      await updateFranchiseeReward(id, point);
      toast.success(`Project point configuration saved!`);
    } catch (error) {
      toast.error("Failed to save changes");
    }
  }

  // Product Handlers
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newProduct, type: 'product' };
      const created = await createFranchiseeReward(payload);
      setProducts([...products, created]);
      setShowAddProductModal(false);
      setNewProduct({ name: '', description: '', points: '', category: 'electronics' });
      toast.success('Product added successfully!');
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  // Experience Handlers
  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newExperience, type: 'experience' };
      const created = await createFranchiseeReward(payload);
      setExperiences([...experiences, created]);
      setShowAddExperienceModal(false);
      setNewExperience({ name: '', description: '', points: '', duration: '' });
      toast.success('Experience added successfully!');
    } catch (error) {
      toast.error('Failed to add experience');
    }
  };

  // Helper to get Icon (Static mapping for now since we can't store components in DB easily without mapping)
  // In a real app, we might store icon name string in DB and map here.
  const getIconForProduct = (category) => {
    switch (category) {
      case 'electronics': return Smartphone;
      case 'vehicles': return Bike;
      case 'home': return Package;
      default: return Gift;
    }
  };

  // Fallback icon
  const DefaultIcon = Gift;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-base">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">Franchisee Points and Reward System</h1>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading data...</div>}

      {/* Project Points Configuration */}
      <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Project Points Configuration</h2>
            </div>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project Type
            </button>
          </div>
          <p className="text-gray-600 mt-2 ml-13">Configure points for different project types based on kW capacity. Enter kW and points for each project type.</p>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Category Type</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Sub Category</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Project Type</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Sub Project Type</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">kW</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Points</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectPoints.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <select
                        value={item.categoryType}
                        onChange={(e) => handleUpdateProjectPoint(item._id, 'categoryType', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="solar-rooftop">Solar Rooftop</option>
                        <option value="solar-pump">Solar Pump</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={item.subCategory}
                        onChange={(e) => handleUpdateProjectPoint(item._id, 'subCategory', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={item.projectType || ''}
                        onChange={(e) => handleUpdateProjectPoint(item._id, 'projectType', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={item.subProjectType || 'on-grid'}
                        onChange={(e) => handleUpdateProjectPoint(item._id, 'subProjectType', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="on-grid">On-grid</option>
                        <option value="off-grid">Off-grid</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.kw || ''}
                          onChange={(e) => handleUpdateProjectPoint(item._id, 'kw', e.target.value)}
                          min="1"
                        />
                        <span className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg text-gray-600">kW</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.points || ''}
                          onChange={(e) => handleUpdateProjectPoint(item._id, 'points', e.target.value)}
                        />
                        <span className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg text-gray-600">pts</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveProjectPointRow(item._id)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="Save Changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReward(item._id)}
                          className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Redeem Settings */}
      <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <RefreshCw className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Redeem Settings</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Points to Redeem</label>
              <div className="flex">
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={redeemSettings.minPoints || ''}
                  onChange={(e) => setRedeemSettings({ ...redeemSettings, minPoints: e.target.value })}
                  min="1000"
                  step="500"
                />
                <span className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg text-gray-600">points</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Franchisees can only redeem when they reach this minimum points threshold.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redemption Frequency</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={redeemSettings.frequency || 'quarterly'}
                onChange={(e) => setRedeemSettings({ ...redeemSettings, frequency: e.target.value })}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannually">Bi-Annually</option>
                <option value="annually">Annually</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">How often Franchisee's can redeem their points.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveRedeemSettings}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Redeem Settings
            </button>
          </div>

          {/* Display Current Settings */}
          {redeemSettings._id && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Current Configuration</h4>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="text-gray-600 text-sm">Minimum Points Requirement:</span>
                  <p className="text-lg font-bold text-gray-800">{redeemSettings.minPoints ? Number(redeemSettings.minPoints).toLocaleString() : 0} points</p>
                </div>
                <div className="mt-3 md:mt-0">
                  <span className="text-gray-600 text-sm">Redemption Frequency:</span>
                  <p className="text-lg font-bold text-gray-800 capitalize">{redeemSettings.frequency || 'Quarterly'}</p>
                </div>
                <div className="mt-3 md:mt-0 flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rewards Management */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Rewards Management</h2>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Add Product
              </button>
              <button
                onClick={() => setShowAddExperienceModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plane className="w-4 h-4 mr-2" />
                Add Experience
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'product' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('product')}
              >
                <Package className="w-4 h-4 mr-2" />
                Products
              </button>
              <button
                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'experience' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('experience')}
              >
                <Umbrella className="w-4 h-4 mr-2" />
                Experiences
              </button>
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === 'product' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const Icon = getIconForProduct(product.category) || DefaultIcon;
                return (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-12 h-12 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                        {(product.points || 0).toLocaleString()} points
                      </span>
                      <div className="flex space-x-2">
                        {/* Edit function unimplemented for now in modal, but deletion works */}
                        <button
                          onClick={() => handleDeleteReward(product._id)}
                          className="p-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Experiences Tab */}
          {activeTab === 'experience' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((experience) => {
                return (
                  <div key={experience._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start mb-3">
                      <div className="w-12 h-12 flex items-center justify-center mr-3 bg-gray-100 rounded-lg">
                        <Plane className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{experience.name}</h3>
                        <p className="text-sm text-gray-600">{experience.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                        {(experience.points || 0).toLocaleString()} points
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteReward(experience._id)}
                          className="p-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Add Project Type Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Project Type Configuration</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-white hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddProject}>
                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category Type</label>
                    <select className="w-full p-2 border rounded-lg" value={newProjectPoint.categoryType} onChange={(e) => setNewProjectPoint({ ...newProjectPoint, categoryType: e.target.value })}>
                      <option value="solar-rooftop">Solar Rooftop</option>
                      <option value="solar-pump">Solar Pump</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sub Category</label>
                    <select className="w-full p-2 border rounded-lg" value={newProjectPoint.subCategory} onChange={(e) => setNewProjectPoint({ ...newProjectPoint, subCategory: e.target.value })}>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Type (e.g. 3kw-5kw)</label>
                    <input type="text" className="w-full p-2 border rounded-lg" value={newProjectPoint.projectType} onChange={(e) => setNewProjectPoint({ ...newProjectPoint, projectType: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sub Project Type</label>
                    <select className="w-full p-2 border rounded-lg" value={newProjectPoint.subProjectType} onChange={(e) => setNewProjectPoint({ ...newProjectPoint, subProjectType: e.target.value })}>
                      <option value="on-grid">On-grid</option>
                      <option value="off-grid">Off-grid</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">kW</label>
                    <input type="number" className="w-full p-2 border rounded-lg" value={newProjectPoint.kw} onChange={(e) => setNewProjectPoint({ ...newProjectPoint, kw: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Points</label>
                    <input type="number" className="w-full p-2 border rounded-lg" value={newProjectPoint.points} onChange={(e) => setNewProjectPoint({ ...newProjectPoint, points: e.target.value })} required />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowAddProjectModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Configuration</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Product Reward</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-white hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddProduct}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows="3" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points Required</label>
                  <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" value={newProduct.points} onChange={(e) => setNewProduct({ ...newProduct, points: e.target.value })} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option value="electronics">Electronics</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="home">Home Appliances</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddProductModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Experience Reward</h3>
              <button onClick={() => setShowAddExperienceModal(false)} className="text-white hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddExperience}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={newExperience.name} onChange={(e) => setNewExperience({ ...newExperience, name: e.target.value })} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows="3" value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points Required</label>
                  <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" value={newExperience.points} onChange={(e) => setNewExperience({ ...newExperience, points: e.target.value })} required />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddExperienceModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Experience</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsRewards;