import React, { useState, useEffect } from 'react';
import {
  Box,
  Settings,
  Check,
  X,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStates } from '../../../../services/core/locationApi';
import { getAssignments } from '../../../../services/combokit/combokitApi';
import {
  getFranchiseeOrderSettings,
  createFranchiseeOrderSetting,
  updateFranchiseeOrderSetting
} from '../../../../services/franchisee/franchiseeApi';

export default function OrderSetting() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [activeSection, setActiveSection] = useState('combokit');
  const [activePlan, setActivePlan] = useState('startup');
  const [activeCustomizePlan, setActiveCustomizePlan] = useState('customizeStartup');

  const [combokits, setCombokits] = useState([]); // Available Kits to configure
  const [settings, setSettings] = useState([]); // Saved configurations
  const [loading, setLoading] = useState(false);

  // Plan data
  const plans = [
    { id: 'startup', name: 'Startup Plan', color: 'primary' },
    { id: 'basic', name: 'Basic Plan', color: 'success' },
    { id: 'enterprise', name: 'Enterprise Plan', color: 'secondary' },
    { id: 'solar', name: 'Solar Business Plan', color: 'warning' }
  ];

  useEffect(() => {
    fetchStates();
    fetchKits();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchKits(selectedState._id);
      fetchSettings(selectedState._id);
    } else {
      setCombokits([]);
      setSettings([]);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    try {
      const data = await getStates();
      setStates(data);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchKits = async (stateId) => {
    setLoading(true);
    try {
      // Fetch available assigned kits for the selected state
      const data = await getAssignments({ state: stateId });
      setCombokits(data);
    } catch (error) {
      console.error("Error fetching kits:", error);
      toast.error("Failed to load kit data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async (stateId) => {
    try {
      const data = await getFranchiseeOrderSettings(stateId);
      setSettings(data);
    } catch (error) {
      console.error("Error fetching order settings:", error);
    }
  };

  const handleStateClick = (state) => {
    setSelectedState(state);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (section === 'combokit') {
      setActivePlan('startup');
    } else {
      setActiveCustomizePlan('customizeStartup');
    }
  };

  const handlePlanClick = (plan) => {
    if (activeSection === 'combokit') {
      setActivePlan(plan);
    } else {
      setActiveCustomizePlan(plan);
    }
  };

  // Helper to get or create setting for a specific item
  const getSettingForItem = (itemId) => {
    // Find setting matching state, section, plan, and itemId
    // Current active plan name needs to be normalized (e.g. 'startup' or 'customizeStartup')
    const currentPlanType = activeSection === 'combokit' ? activePlan : activeCustomizePlan;

    return settings.find(s =>
      s.itemId === itemId &&
      s.settingType === activeSection &&
      s.planType === currentPlanType
    ) || {};
  };

  const handleSettingChange = async (itemId, field, value, itemDetails) => {
    if (!selectedState) return;

    const currentPlanType = activeSection === 'combokit' ? activePlan : activeCustomizePlan;
    const existingSetting = getSettingForItem(itemId);

    const payload = {
      state: selectedState._id,
      settingType: activeSection,
      planType: currentPlanType,
      itemId: itemId,
      itemName: itemDetails.solarkitName || itemDetails.kitName || itemDetails.name || 'Unknown Kit',
      // Setup location info
      district: itemDetails.districts?.map(d => d.name).join(', ') || itemDetails.district,
      cluster: itemDetails.cluster?.name || itemDetails.cluster,
      category: itemDetails.category || 'Solar',
      subCategory: itemDetails.subCategory,
      projectType: itemDetails.projectType,
      subProjectType: itemDetails.subProjectType,
      // Update the specific field
      [field]: value,
      // Maintain other fields if updating
      orderQty: existingSetting.orderQty || 0,
      discountPerKw: existingSetting.discountPerKw || 0,
      isActive: existingSetting.isActive !== undefined ? existingSetting.isActive : false
    };

    // Override with new value proper
    payload[field] = value;

    try {
      let updatedSetting;
      if (existingSetting._id) {
        updatedSetting = await updateFranchiseeOrderSetting(existingSetting._id, payload);
      } else {
        updatedSetting = await createFranchiseeOrderSetting(payload);
      }

      // Update local state
      setSettings(prev => {
        const idx = prev.findIndex(s => s._id === updatedSetting._id);
        if (idx >= 0) {
          const newSettings = [...prev];
          newSettings[idx] = updatedSetting;
          return newSettings;
        } else {
          return [...prev, updatedSetting];
        }
      });

      toast.success("Setting saved", { id: 'setting-save', duration: 1000 }); // Short toast to avoid spam
    } catch (error) {
      console.error("Error saving setting:", error);
      toast.error("Failed to save setting");
    }
  };

  const ToggleSwitch = ({ active, onChange }) => (
    <div className="flex items-center justify-center">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={active}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${active ? 'peer-checked:bg-blue-600' : ''}`}></div>
      </label>
    </div>
  );

  const TableHeader = ({ headers }) => (
    <thead className={activeSection === 'combokit' ? 'bg-blue-50' : 'bg-blue-100'}>
      <tr className="text-center">
        {headers.map((header, index) => (
          <th
            key={index}
            className={`px-4 py-3 font-semibold ${activeSection === 'combokit' ? 'border-blue-200' : 'border-blue-300'} border`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="container mx-auto px-4 py-6 text-base">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">Order Setting</h1>
        </div>
      </div>

      {/* State Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 my-8">
        {states.map((state) => (
          <div
            key={state._id}
            className={`bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border ${selectedState?._id === state._id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent'}`}
            onClick={() => handleStateClick(state)}
          >
            <div className="p-6 flex flex-col justify-center items-center text-center">
              <h5 className="font-bold text-lg mb-2">{state.name}</h5>
              <p className="text-gray-500 text-sm">{state.code}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section Selection Buttons */}
      {selectedState && (
        <div className="row flex justify-center mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-1/3">
            <div
              className={`card p-4 border-2 rounded-lg text-center font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${activeSection === 'combokit'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-blue-200 hover:border-blue-400'
                }`}
              onClick={() => handleSectionClick('combokit')}
            >
              <Box size={20} />
              Combokit
            </div>
            <div
              className={`card p-4 border-2 rounded-lg text-center font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${activeSection === 'customize'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-blue-200 hover:border-blue-400'
                }`}
              onClick={() => handleSectionClick('customize')}
            >
              <Settings size={20} />
              Customize Kit
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {selectedState && (
        <div className="py-6">
          {/* Plan Selection Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {plans.map((plan) => {
              const planKey = activeSection === 'combokit' ? plan.id : `customize${plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}`;
              return (
                <button
                  key={plan.id}
                  className={`px-6 py-3 rounded-lg border-2 font-medium transition-all duration-300 ${(activeSection === 'combokit' ? activePlan : activeCustomizePlan) === planKey
                    ? `border-${plan.color}-600 bg-${plan.color}-50 text-${plan.color}-600`
                    : `border-${plan.color}-300 text-${plan.color}-600 hover:border-gray-500 hover:bg-gray-50`
                    }`}
                  onClick={() => handlePlanClick(planKey)}
                >
                  {plan.name}
                </button>
              );
            })}
          </div>

          {/* Table Area */}
          <div className={`bg-white border rounded-lg p-6 mb-8 shadow-sm ${(activeSection === 'combokit' ? activePlan : activeCustomizePlan).includes('solar') ? 'border-yellow-200' : 'border-blue-200'
            }`}>
            <div className="mb-4 text-xl font-bold text-gray-700 capitalize">
              {activeSection} Configuration - {(activeSection === 'combokit' ? activePlan : activeCustomizePlan).replace('customize', '')}
            </div>

            {loading ? <div className="p-8 text-center text-gray-500">Loading Kits...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <TableHeader headers={[
                    'Kit ID', 'Active', 'Name', 'State', 'District', 'Cluster', 'Category',
                    'Sub Category', 'Project Type', 'Sub Project Type', 'Order Qty', 'Discount/Kw (Rs)'
                  ]} />
                  <tbody>
                    {combokits.length === 0 && (
                      <tr><td colSpan="8" className="p-4 text-center text-gray-500">No Kits Available</td></tr>
                    )}
                    {combokits.map((item) => {
                      const setting = getSettingForItem(item._id);
                      return (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 border text-center font-mono text-sm">{item.kitId || item.jobWorkNo || 'N/A'}</td>
                          <td className="px-4 py-3 border">
                            <ToggleSwitch
                              active={setting.isActive || false}
                              onChange={(val) => handleSettingChange(item._id, 'isActive', val, item)}
                            />
                          </td>
                          <td className="px-4 py-3 border">{item.solarkitName || item.name || 'N/A'}</td>
                          <td className="px-4 py-3 border text-xs">{item.state?.name || 'N/A'}</td>
                          <td className="px-4 py-3 border text-xs">{item.districts?.map(d => d.name).join(', ') || 'N/A'}</td>
                          <td className="px-4 py-3 border text-xs">{item.cluster?.name || 'N/A'}</td>
                          <td className="px-4 py-3 border text-xs">{item.category}</td>
                          <td className="px-4 py-3 border text-xs">{item.subCategory}</td>
                          <td className="px-4 py-3 border text-xs">{item.projectType}</td>
                          <td className="px-4 py-3 border text-xs">{item.subProjectType || 'N/A'}</td>
                          <td className="px-4 py-3 border" style={{ width: '100px' }}>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="Qty"
                              value={setting.orderQty || ''}
                              onChange={(e) => handleSettingChange(item._id, 'orderQty', e.target.value, item)}
                            />
                          </td>
                          <td className="px-4 py-3 border" style={{ width: '140px' }}>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="Rs"
                              value={setting.discountPerKw || ''}
                              onChange={(e) => handleSettingChange(item._id, 'discountPerKw', e.target.value, item)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}