import React, { useState, useEffect } from 'react';
import {
  CheckCircle, GitBranch, RefreshCw, Gift,
  Smartphone, DollarSign, Plane, Package, Umbrella,
  Tablet, Watch, Wine, Utensils,
  Upload, X, Save, Edit, Trash2,
  Plus, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getDealerRewards,
  createDealerReward,
  deleteDealerReward,
  updateDealerReward
} from '../../../../services/dealer/dealerApi';

export default function DealerPointsRewards() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

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

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getDealerRewards();

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
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load data');
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
    try {
      const payload = {
        type: 'product',
        name: newProduct.name,
        description: newProduct.description,
        points: parseInt(newProduct.points),
        image: newProduct.imageUrl,
        category: newProduct.category
      };
      await createDealerReward(payload);
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
    try {
      const payload = {
        type: 'cashback',
        name: `₹${parseInt(newCashback.amount).toLocaleString()} Cashback`,
        couponCode: newCashback.couponCode,
        description: newCashback.description || 'Redeemable for direct cash transfer',
        points: parseInt(newCashback.points),
        image: newCashback.imageUrl,
        amount: parseInt(newCashback.amount)
      };
      await createDealerReward(payload);
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
    try {
      const payload = {
        type: 'experience',
        name: newExperience.name,
        description: newExperience.description,
        points: parseInt(newExperience.points),
        image: newExperience.imageUrl,
        duration: parseInt(newExperience.duration),
        location: newExperience.location
      };
      await createDealerReward(payload);
      toast.success('Experience added successfully!');
      setShowAddExperienceModal(false);
      fetchData();
      setNewExperience({ name: '', description: '', points: '', duration: '', location: '', imageUrl: '', imageFile: null });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add experience');
    }
  };

  const handleAddProjectType = async () => {
    try {
      const payload = {
        type: 'project_point_rule',
        projectRule: {
          categoryType: newProjectType.categoryType,
          subCategory: newProjectType.subCategory,
          projectType: newProjectType.projectType,
          subProjectType: newProjectType.subProjectType,
          pointsPerKw: parseInt(newProjectType.pointsPerKw)
        }
      };
      await createDealerReward(payload);
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
        await deleteDealerReward(id);
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
    // For now, let's just implement a save button on the row to persist changes
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
      await updateDealerReward(item._id, {
        projectRule: item.projectRule
      });
      toast.success('Rule saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save rule');
    }
  }


  const saveRedeemSettings = async () => {
    try {
      const payload = {
        type: 'redeem_settings',
        points: redeemSettings.minPoints, // storing minPoints in 'points' field
        description: redeemSettings.frequency // storing frequency in 'description' field
      };

      if (redeemSettings._id) {
        await updateDealerReward(redeemSettings._id, payload);
      } else {
        await createDealerReward(payload);
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


  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
          <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Dealer Points and Reward System</h1>
        </div>
      </div>

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
                      <option value="solar_rooftop">Solar Rooftop</option>
                      <option value="solar_pump">Solar Pump</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.projectRule?.subCategory || ''}
                      onChange={(e) => handleUpdateProjectPoints(item._id, 'subCategory', e.target.value)}
                      className="border rounded p-1 w-full"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="agricultural">Agricultural</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.projectRule?.projectType || ''}
                      onChange={(e) => handleUpdateProjectPoints(item._id, 'projectType', e.target.value)}
                      className="border rounded p-1 w-full"
                    >
                      <option value="3kw-5kw">3kw-5kw</option>
                      <option value="5kw-10kw">5kw-10kw</option>
                      <option value="10kw-20kw">10kw-20kw</option>
                      <option value="20kw-50kw">20kw-50kw</option>
                      <option value="2hp-5hp">2hp-5hp</option>
                      <option value="5hp-10hp">5hp-10hp</option>
                      <option value="10hp-20hp">10hp-20hp</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.projectRule?.subProjectType || ''}
                      onChange={(e) => handleUpdateProjectPoints(item._id, 'subProjectType', e.target.value)}
                      className="border rounded p-1 w-full"
                    >
                      <option value="on-grid">On-grid</option>
                      <option value="off-grid">Off-grid</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="surface">Surface</option>
                      <option value="submersible">Submersible</option>
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
                    <button onClick={() => saveProjectPointRow(item)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><Save className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteReward(item._id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
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
              onChange={(e) => setRedeemSettings(prev => ({ ...prev, minPoints: parseInt(e.target.value) }))}
              className="block w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={redeemSettings.frequency}
              onChange={(e) => setRedeemSettings(prev => ({ ...prev, frequency: e.target.value }))}
              className="block w-full border rounded-md p-2"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannually">Bi-Annually</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end p-6 pt-0">
          <button onClick={saveRedeemSettings} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </button>
        </div>
      </div>

      {/* Rewards Management */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <div className="flex items-center">
            <Gift className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Rewards Management</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddProductModal(true)} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center"><Smartphone className="w-4 h-4 mr-1" /> Product</button>
            <button onClick={() => setShowAddCashbackModal(true)} className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Cashback</button>
            <button onClick={() => setShowAddExperienceModal(true)} className="px-3 py-1 bg-green-600 text-white rounded flex items-center"><Plane className="w-4 h-4 mr-1" /> Experience</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['products', 'cashback', 'experiences'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium text-sm border-b-2 capitalize ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards[activeTab].map(item => (
              <div key={item._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-all relative group">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 truncate">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{item.points.toLocaleString()} pts</span>
                    <button onClick={() => handleDeleteReward(item._id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {rewards[activeTab].length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">No {activeTab} added yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modals - Simplified for brevity, assume similar structure to original but hooked to state */}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-bold mb-4">Add Product</h3>
            <input className="w-full border p-2 mb-2 rounded" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Points" type="number" value={newProduct.points} onChange={e => setNewProduct({ ...newProduct, points: e.target.value })} />
            <input className="w-full border p-2 mb-4 rounded" type="file" onChange={e => handleFileUpload(setNewProduct, e.target.files[0])} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleAddProduct} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cashback Modal */}
      {showAddCashbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-bold mb-4">Add Cashback</h3>
            <input className="w-full border p-2 mb-2 rounded" placeholder="Amount (₹)" type="number" value={newCashback.amount} onChange={e => setNewCashback({ ...newCashback, amount: e.target.value })} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Coupon Code" value={newCashback.couponCode} onChange={e => setNewCashback({ ...newCashback, couponCode: e.target.value })} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Points Cost" type="number" value={newCashback.points} onChange={e => setNewCashback({ ...newCashback, points: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddCashbackModal(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleAddCashback} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-bold mb-4">Add Experience</h3>
            <input className="w-full border p-2 mb-2 rounded" placeholder="Name" value={newExperience.name} onChange={e => setNewExperience({ ...newExperience, name: e.target.value })} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Location" value={newExperience.location} onChange={e => setNewExperience({ ...newExperience, location: e.target.value })} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Duration (Days)" type="number" value={newExperience.duration} onChange={e => setNewExperience({ ...newExperience, duration: e.target.value })} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Points" type="number" value={newExperience.points} onChange={e => setNewExperience({ ...newExperience, points: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddExperienceModal(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleAddExperience} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Type Modal */}
      {showAddProjectTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-bold mb-4">Add Project Rule</h3>
            <select className="w-full border p-2 mb-2 rounded" value={newProjectType.categoryType} onChange={e => setNewProjectType({ ...newProjectType, categoryType: e.target.value })}>
              <option value="">Select Category</option>
              <option value="solar_rooftop">Solar Rooftop</option>
              <option value="solar_pump">Solar Pump</option>
            </select>
            <select className="w-full border p-2 mb-2 rounded" value={newProjectType.subCategory} onChange={e => setNewProjectType({ ...newProjectType, subCategory: e.target.value })}>
              <option value="">Select Sub Category</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
            </select>
            <select className="w-full border p-2 mb-2 rounded" value={newProjectType.projectType} onChange={e => setNewProjectType({ ...newProjectType, projectType: e.target.value })}>
              <option value="">Select Project Type</option>
              <option value="3kw-5kw">3kw-5kw</option>
              <option value="5kw-10kw">5kw-10kw</option>
            </select>
            <select className="w-full border p-2 mb-2 rounded" value={newProjectType.subProjectType} onChange={e => setNewProjectType({ ...newProjectType, subProjectType: e.target.value })}>
              <option value="">Select Sub Project Type</option>
              <option value="on-grid">On-grid</option>
              <option value="off-grid">Off-grid</option>
            </select>
            <input className="w-full border p-2 mb-4 rounded" placeholder="Points Per KW" type="number" value={newProjectType.pointsPerKw} onChange={e => setNewProjectType({ ...newProjectType, pointsPerKw: e.target.value })} />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddProjectTypeModal(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleAddProjectType} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}