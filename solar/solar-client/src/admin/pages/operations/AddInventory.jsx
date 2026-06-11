// Location data
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Eye, EyeOff, ClipboardList, Layers, Zap } from 'lucide-react';
import Chart from 'chart.js/auto';
import { useLocations } from '../../../hooks/useLocations';
import inventoryApi from '../../../services/inventory/inventoryApi';
import { productAPI } from '../../../api/api';
import { getProjectTypes, getCategories, getSKUs, getSubCategories, getSubProjectTypes, getProjectCategoryMappings } from '../../../services/core/masterApi';
import { getAllManufacturers } from '../../../services/brand/brandApi';

export default function AddInventory() {
  // Location hook
  const {
    countries,
    states,
    clusters,
    districts,
    cities,
    selectedCountry,
    setSelectedCountry,
    selectedState,
    setSelectedState,
    selectedCluster,
    setSelectedCluster,
    selectedDistrict,
    setSelectedDistrict,
    selectedCity,
    setSelectedCity,
  } = useLocations();

  const [locationCardsVisible, setLocationCardsVisible] = useState(true);

  // Dynamic Data State
  const [warehousesList, setWarehousesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [mappingsList, setMappingsList] = useState([]);
  const [projectTypesList, setProjectTypesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [subProjectTypesList, setSubProjectTypesList] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Derived Options
  const [techOptions, setTechOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [wattOptions, setWattOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [filteredSkus, setFilteredSkus] = useState([]);
  const [summary, setSummary] = useState({ totalItems: 0, totalPanels: 0, totalKw: 0 });

  // Form state
  // ... existing form state ...
  const [form, setForm] = useState({
    warehouse: '',
    category: '',
    subCategory: '',
    projectType: '',
    subProjectType: '',
    productType: '',
    brand: '',
    technology: '',
    watt: '',
    sku: '',
    panels: '',
    kw: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Data state
  const [recentAdditions, setRecentAdditions] = useState([]);
  const [chartData, setChartData] = useState({});
  const [productFilters, setProductFilters] = useState({});
  const [productTypeFilters, setProductTypeFilters] = useState({
    solarpanel: true,
    invertor: true,
    battery: true,
    boskit: true
  });

  // All Inventory Table State
  const [allInventory, setAllInventory] = useState([]);
  const [allInventoryLoading, setAllInventoryLoading] = useState(false);
  const [allInventoryPage, setAllInventoryPage] = useState(1);
  const [allInventoryTotal, setAllInventoryTotal] = useState(0);
  const [allInventorySearch, setAllInventorySearch] = useState('');
  const ALL_INV_PAGE_SIZE = 10;

  const productTypes = [
    { value: 'solarpanel', label: 'Solar Panels' },
    { value: 'invertor', label: 'Inverters' },
    { value: 'battery', label: 'Batteries' },
    { value: 'boskit', label: 'BOS Kits' }
  ];
  const [filterAllProducts, setFilterAllProducts] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [chartVisible, setChartVisible] = useState(false);

  // Refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- Compute Warehouse Counts by Location ---
  const warehouseCounts = useMemo(() => {
    const counts = {
      countries: {},
      states: {},
      clusters: {},
      districts: {},
      cities: {}
    };

    if (!Array.isArray(warehousesList)) return counts;

    warehousesList.forEach(w => {
      // Safely handle both populated and ID forms
      const countryId = w.state?.country?._id || w.state?.country;
      const stateId = w.state?._id || w.state;
      const clusterId = w.cluster?._id || w.cluster;
      const districtId = w.district?._id || w.district;
      const cityId = w.city?._id || w.city;

      if (countryId) counts.countries[String(countryId)] = (counts.countries[String(countryId)] || 0) + 1;
      if (stateId) counts.states[String(stateId)] = (counts.states[String(stateId)] || 0) + 1;
      if (clusterId) counts.clusters[String(clusterId)] = (counts.clusters[String(clusterId)] || 0) + 1;
      if (districtId) counts.districts[String(districtId)] = (counts.districts[String(districtId)] || 0) + 1;
      if (cityId) counts.cities[String(cityId)] = (counts.cities[String(cityId)] || 0) + 1;
    });

    return counts;
  }, [warehousesList]);

  // Fetch Initial Data
  useEffect(() => {
    fetchDynamicData();
    fetchAllInventory(1, '');
  }, []);

  const fetchDynamicData = async () => {
    try {
      const results = await Promise.allSettled([
        inventoryApi.getAllWarehouses(),
        getAllManufacturers(),
        getCategories(),
        getProjectTypes(),
        getSKUs(),
        getSubCategories(),
        getSubProjectTypes(),
        getProjectCategoryMappings(),
        productAPI.getAll()
      ]);

      const safeExtract = (result) => {
        if (result.status !== 'fulfilled') return [];
        const val = result.value;
        if (Array.isArray(val)) return val;
        if (val && Array.isArray(val.data)) return val.data;
        if (val && val.data && Array.isArray(val.data.data)) return val.data.data;
        return [];
      };

      setWarehousesList(safeExtract(results[0]));
      setBrandsList(safeExtract(results[1]));
      setCategoriesList(safeExtract(results[2]));
      setProjectTypesList(safeExtract(results[3]));
      setSkuList(safeExtract(results[4]));
      setSubCategoriesList(safeExtract(results[5]));
      setSubProjectTypesList(safeExtract(results[6]));
      setMappingsList(safeExtract(results[7]));
      setProductsList(safeExtract(results[8]));

    } catch (error) {
      console.error("Error fetching dynamic data", error);
    }
  };

  const fetchRecentInventory = async () => {
    try {
      const res = await inventoryApi.getItems({ page: 1, limit: 5, sort: '-createdAt' });
      // Transform data to match table structure if needed or directly use
      // The table expects: date, productType, sku, projectType, brand, technology, watt, panels, kw
      // Backend returns items with populated fields.
      if (res.data?.items) {
        setRecentAdditions(res.data.items.map(item => ({
          id: item._id,
          date: new Date(item.createdAt).toLocaleDateString('en-GB'), // Or item.date which might be just string
          productType: item.productType || item.category,
          sku: item.sku,
          projectType: item.projectType,
          brand: item.brand?.brand || item.brand?.companyName || item.brand?.brandName || 'N/A',
          technology: item.technology,
          watt: item.wattage,
          panels: item.quantity,
          kw: ((item.quantity * (item.wattage || 0)) / 1000).toFixed(2)
        })));
      }
    } catch (error) {
      console.error("Error fetching recent inventory", error);
    }
  };

  const fetchAllInventory = async (page = 1, search = '') => {
    try {
      setAllInventoryLoading(true);
      const params = { page, limit: ALL_INV_PAGE_SIZE, sort: '-createdAt' };
      if (search) params.search = search;
      const res = await inventoryApi.getItems(params);
      if (res.data?.items) {
        setAllInventory(res.data.items.map(item => ({
          id: item._id,
          date: new Date(item.createdAt).toLocaleDateString('en-GB'),
          productType: item.productType || item.category || '–',
          sku: item.sku || '–',
          projectType: item.projectType || '–',
          brand: item.brand?.brand || item.brand?.companyName || item.brand?.brandName || '–',
          technology: item.technology || '–',
          watt: item.wattage || '–',
          panels: item.quantity || 0,
          kw: ((item.quantity * (item.wattage || 0)) / 1000).toFixed(2)
        })));
        setAllInventoryTotal(res.data.totalItems || 0);
      }
    } catch (error) {
      console.error('Error fetching all inventory', error);
    } finally {
      setAllInventoryLoading(false);
    }
  };
  
  const fetchSummary = async () => {
    try {
      const res = await inventoryApi.getSummary();
      if (res.data) {
        setSummary({
          totalItems: res.data.totalProducts || 0,
          totalPanels: res.data.totalQuantity || 0,
          totalKw: (res.data.totalValue / 100) || 0
        });
      } else {
        const allRes = await inventoryApi.getItems({ limit: 1000 });
        const items = allRes.data?.items || [];
        const totalPanels = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const totalKw = items.reduce((acc, curr) => acc + ((curr.quantity * (curr.wattage || 0)) / 1000), 0);
        setSummary({
          totalItems: items.length,
          totalPanels: totalPanels,
          totalKw: totalKw.toFixed(2)
        });
      }
    } catch (error) {
      console.error("Error fetching summary", error);
    }
  };

  useEffect(() => {
    fetchRecentInventory();
    fetchSummary();
  }, []);

  useEffect(() => {
    console.log("AddInventory Data State:", {
      warehouses: Array.isArray(warehousesList) ? warehousesList.length : typeof warehousesList,
      brands: Array.isArray(brandsList) ? brandsList.length : typeof brandsList,
      categories: Array.isArray(categoriesList) ? categoriesList.length : typeof categoriesList,
      projectTypes: Array.isArray(projectTypesList) ? projectTypesList.length : typeof projectTypesList,
      skus: Array.isArray(skuList) ? skuList.length : typeof skuList,
      subCategories: Array.isArray(subCategoriesList) ? subCategoriesList.length : typeof subCategoriesList,
      subProjectTypes: Array.isArray(subProjectTypesList) ? subProjectTypesList.length : typeof subProjectTypesList,
      skuListPreview: Array.isArray(skuList) ? skuList.slice(0, 3) : []
    });
  }, [warehousesList, brandsList, categoriesList, projectTypesList, skuList, subCategoriesList, subProjectTypesList]);

  // Update derived options when filters change
  useEffect(() => {
    let activeSkus = skuList;

    // Filter logic based on form selections to narrow down derived options (Tech, Watt, SKUs)
    if (form.brand) {
      const brandObj = brandsList.find(b => b._id === form.brand);
      const brandName = brandObj ? (brandObj.brand || brandObj.brandName || brandObj.name) : '';

      activeSkus = activeSkus.filter(s => {
        const sBrandId = String(s.brand?._id || s.brand || '');
        const sBrandName = String(s.brandName || '').toLowerCase();
        const targetId = String(form.brand);
        const targetName = brandName.toLowerCase();

        return sBrandId === targetId || (targetName && sBrandName.includes(targetName)) || (sBrandName && targetName.includes(sBrandName));
      });
    }

    if (form.category) {
      const catObj = categoriesList.find(c => c._id === form.category);
      if (catObj) {
        activeSkus = activeSkus.filter(s => {
          const sCat = (s.category || s.productType || s.categoryType || '').toLowerCase();
          const target = catObj.name.toLowerCase();
          return sCat.includes(target) || target.includes(sCat) || (s.category?.id === catObj._id);
        });
      }
    }

    if (form.subCategory) {
      const subCatObj = subCategoriesList.find(sc => sc._id === form.subCategory);
      if (subCatObj) {
        activeSkus = activeSkus.filter(s => {
          const sSub = (s.subCategory || s.subCategoryType || '').toLowerCase();
          const target = subCatObj.name.toLowerCase();
          return sSub.includes(target) || target.includes(sSub) || (s.subCategoryId === subCatObj._id);
        });
      }
    }

    // Extract unique product types after category/sub filters 
    // We combine types from active SKUs and the Master Product List
    const skuProdTypes = activeSkus.map(s => s.productType).filter(Boolean);
    const masterProdTypes = productsList
      .filter(p => !form.category || (p.categoryId?._id || p.categoryId) === form.category || (p.categoryId?.name === categoriesList.find(c => c._id === form.category)?.name))
      .filter(p => !form.subCategory || (p.subCategoryId?._id || p.subCategoryId) === form.subCategory || (p.subCategoryId?.name === subCategoriesList.find(sc => sc._id === form.subCategory)?.name))
      .map(p => p.name);

    const uniqueProductTypes = [...new Set([...skuProdTypes, ...masterProdTypes])];

    if (form.productType) {
      const directMatch = activeSkus.filter(s => s.productType === form.productType || s.itemName === form.productType);
      // If we find direct matches (by type or name), use them. 
      // Otherwise, we keep the previous list (category/sub/brand) to allow tech selection for mapping.
      if (directMatch.length > 0) activeSkus = directMatch;
    }

    // Note: Removed projectType filter for Tech/Watt derivation 
    // because kW ranges (e.g. "3 to 30 kW") are mapping rules, NOT SKU properties.

    // Combine values from narrowed SKUs and the selected Product Master entry
    const skuTechs = activeSkus.map(s => s.technology).filter(Boolean);
    const skuWatts = activeSkus.map(s => s.wattage).filter(Boolean);

    const masterTechs = productsList
      .filter(p => !form.productType || p.name === form.productType)
      .map(p => p.technology)
      .filter(Boolean);

    const uniqueTechs = [...new Set([...skuTechs, ...masterTechs])];
    const uniqueWatts = [...new Set([...skuWatts])]; // Watts typically only in SKUs

    // Final list for SKU dropdown includes tech/watt filters
    let filteredForSkus = activeSkus;
    if (form.technology) filteredForSkus = filteredForSkus.filter(s => s.technology === form.technology);
    if (form.watt) filteredForSkus = filteredForSkus.filter(s => s.wattage == form.watt);

    setSkuOptions(filteredForSkus.map(s => ({ value: s.skuCode || s.name, label: s.name || s.skuCode, original: s })));
    setTechOptions(uniqueTechs.map(t => ({ value: t, label: t })));
    setWattOptions(uniqueWatts.map(w => ({ value: w, label: `${w}W` })));
    setProductTypeOptions(uniqueProductTypes.map(pt => ({ value: pt, label: pt })));

  }, [skuList, productsList, form, categoriesList, subCategoriesList, projectTypesList, mappingsList]);


  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-fill fields when SKU is selected
      if (name === 'sku') {
        const selectedSku = skuList.find(s => s.skuCode === value || s.name === value);
        if (selectedSku) {
          updated.brand = selectedSku.brand?._id || selectedSku.brand || '';
          updated.technology = selectedSku.technology || '';
          updated.watt = selectedSku.wattage || '';

          // Only update productType if SKU has it, otherwise try to keep current or match by name
          if (selectedSku.productType) {
            updated.productType = selectedSku.productType;
          } else {
            // Check if SKU name matches any Master Product name
            const masterProd = productsList.find(p =>
              p.name === selectedSku.name ||
              p.name === selectedSku.productType ||
              (selectedSku.skuCode && selectedSku.skuCode.toLowerCase().includes(p.name.toLowerCase()))
            );
            if (masterProd) updated.productType = masterProd.name;
            // if no match found, we KEEP the previous updated.productType (which is the current selection)
          }

          // Try to match Category 
          const matchedCat = categoriesList.find(c => c.name === selectedSku.category || c.name === selectedSku.categoryType);
          if (matchedCat) updated.category = matchedCat._id;

          // Try to match Sub Category
          const matchedSubCat = subCategoriesList.find(sc => sc.name === selectedSku.subCategory || sc.name === selectedSku.subCategoryType);
          if (matchedSubCat) updated.subCategory = matchedSubCat._id;

          // Try to match Project Type
          if (selectedSku.projectType) {
            if (selectedSku.projectType.includes('to')) {
              updated.projectType = selectedSku.projectType;
            } else {
              const matchedPT = projectTypesList.find(pt => pt.name === selectedSku.projectType);
              if (matchedPT) updated.projectType = matchedPT._id;
            }
          }

          // Try to match Sub Project Type
          const matchedSPT = subProjectTypesList.find(spt => spt.name === selectedSku.subProjectType);
          if (matchedSPT) updated.subProjectType = matchedSPT._id;
        }
      }

      // Calculate KW when panels or wattage changes
      if (name === 'panels' || (name === 'watt' && value) || (name === 'sku' && updated.watt)) {
        const panels = parseFloat(updated.panels) || 0;
        const watt = parseFloat(updated.watt) || 0;
        updated.kw = ((panels * watt) / 1000).toFixed(2);
      }

      if (name === 'warehouse') {
        const warehouse = warehousesList.find(w => w._id === value);
        if (warehouse) {
          setSelectedState(warehouse.state?._id || warehouse.state);
          setTimeout(() => setSelectedCluster(warehouse.cluster?._id || warehouse.cluster), 100);
          setTimeout(() => setSelectedDistrict(warehouse.district?._id || warehouse.district), 200);
          setTimeout(() => setSelectedCity(warehouse.city?._id || warehouse.city), 300);
        }
      }
      if (name === 'category') {
        updated.subCategory = '';
        updated.productType = '';
        updated.brand = '';
        updated.technology = '';
        updated.watt = '';
        updated.sku = '';
      }
      if (name === 'subCategory') {
        updated.productType = '';
        updated.brand = '';
        updated.technology = '';
        updated.watt = '';
        updated.sku = '';
      }
      if (name === 'productType') {
        updated.brand = '';
        updated.technology = '';
        updated.watt = '';
        updated.sku = '';
      }
      return updated;
    });
  };

  // Reset location selection
  const handleResetLocation = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCluster('');
    setSelectedDistrict('');
    setSelectedCity('');
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.sku || !form.warehouse || !form.panels || !form.date) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (!selectedCountry || !selectedState || !selectedCluster || !selectedDistrict || !selectedCity) {
      showToast('Please select a valid location (Country, State, Cluster, District, City)', 'error');
      return;
    }

    const panels = parseFloat(form.panels);
    const kw = parseFloat(form.kw);

    if (isNaN(panels) || panels <= 0 || isNaN(kw) || kw <= 0) {
      showToast('Please enter valid number of panels', 'error');
      return;
    }

    const catObj = categoriesList.find(c => c._id === form.category);
    const subCatObj = subCategoriesList.find(sc => sc._id === form.subCategory);
    const ptObj = projectTypesList.find(p => p._id === form.projectType);
    const sptObj = subProjectTypesList.find(s => s._id === form.subProjectType);
    const skuObj = skuList.find(s => s.skuCode === form.sku || s.name === form.sku);

    const payload = {
      warehouse: form.warehouse,
      country: selectedCountry,
      state: selectedState,
      cluster: selectedCluster,
      district: selectedDistrict,
      city: selectedCity,
      itemName: skuObj?.description || form.sku,
      category: catObj?.name || skuObj?.category || 'General',
      subCategory: subCatObj?.name || skuObj?.subCategory,
      projectType: ptObj?.name || form.projectType || skuObj?.projectType,
      subProjectType: sptObj?.name || skuObj?.subProjectType,
      brand: form.brand || skuObj?.brand?._id || skuObj?.brand,
      technology: form.technology || skuObj?.technology,
      wattage: form.watt || skuObj?.wattage,
      productType: form.productType || skuObj?.productType || catObj?.name,
      sku: form.sku,
      quantity: panels,
      price: 0,
      date: form.date,
    };

    try {
      await inventoryApi.createItem(payload);

      // Refresh recent additions list
      fetchRecentInventory();
      fetchSummary();

      // Logic to update charts... (omitted for brevity, keep existing logic if needed or fetch updated stats)
      // Ideally should fetch updated stats, but for UI responsiveness we can update local state

      showToast('Inventory added successfully', 'success');

      // Reset
      setForm(prev => ({
        ...prev,
        sku: '',
        panels: '',
        kw: ''
      }));
    } catch (err) {
      console.error(err);
      showToast('Failed to add inventory', 'error');
    }
  };

  // Update chart
  useEffect(() => {
    if (!chartRef.current || Object.keys(chartData).length === 0) return;

    // Filter data based on product type filters
    const visibleProductTypes = Object.entries(productTypeFilters)
      .filter(([type, visible]) => visible)
      .map(([type]) => type);

    const filteredData = Object.values(chartData).filter(item =>
      item.visible && visibleProductTypes.includes(item.productType) && productFilters[`${item.productType}|${item.brand}|${item.technology}|${item.watt}`] !== false
    );

    // Group by brand
    const brandsList = [...new Set(filteredData.map(item => item.brand))];

    // Prepare datasets by product type
    const productGroups = {};
    filteredData.forEach(data => {
      if (!productGroups[data.productType]) {
        productGroups[data.productType] = {
          label: data.productTypeText,
          productType: data.productType,
          technology: data.technology,
          watt: data.watt,
          data: new Array(brandsList.length).fill(0),
          backgroundColor: data.color,
          borderColor: data.color.replace('0.7', '1'),
          borderWidth: 1
        };
      }
      const brandIndex = brandsList.indexOf(data.brand);
      productGroups[data.productType].data[brandIndex] += data.value;
    });

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: brandsList,
        datasets: Object.values(productGroups)
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        barThickness: 20,
        maxBarThickness: 30,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function (context) {
                return context[0].label;
              },
              beforeBody: function (context) {
                const datasetIndex = context[0].datasetIndex;
                const dataset = chartInstance.current.data.datasets[datasetIndex];
                return [
                  `Product: ${dataset.label}`,
                  `Technology: ${dataset.technology}`,
                  `Watt: ${dataset.watt}`
                ];
              },
              label: function (context) {
                return `Quantity: ${context.raw} Kw`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Kilowatt (Kw)'
            },
            grid: {
              display: false
            }
          },
          y: {
            grid: {
              display: false
            },
            stacked: true
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, productTypeFilters, productFilters]);

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle filter all toggle
  const handleFilterAllToggle = () => {
    const newValue = !filterAllProducts;
    setFilterAllProducts(newValue);

    // Update all product type filters
    const newProductTypeFilters = {};
    Object.keys(productTypeFilters).forEach(key => {
      newProductTypeFilters[key] = newValue;
    });
    setProductTypeFilters(newProductTypeFilters);

    // Update all individual product filters
    const newProductFilters = {};
    Object.keys(productFilters).forEach(key => {
      newProductFilters[key] = newValue;
    });
    setProductFilters(newProductFilters);
  };

  // Handle product type filter toggle
  const handleProductTypeFilterToggle = (type) => {
    const newProductTypeFilters = {
      ...productTypeFilters,
      [type]: !productTypeFilters[type]
    };
    setProductTypeFilters(newProductTypeFilters);

    // Update individual product filters for this type
    const newProductFilters = { ...productFilters };
    Object.keys(chartData).forEach(key => {
      if (key.startsWith(`${type}|`)) {
        newProductFilters[key] = newProductTypeFilters[type];
      }
    });
    setProductFilters(newProductFilters);

    // Update "All Products" checkbox if needed
    const allChecked = Object.values(newProductTypeFilters).every(v => v);
    setFilterAllProducts(allChecked);
  };

  // Handle individual product filter toggle
  const handleProductFilterToggle = (key) => {
    const newProductFilters = {
      ...productFilters,
      [key]: !productFilters[key]
    };
    setProductFilters(newProductFilters);

    // Update chart data visibility
    setChartData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        visible: newProductFilters[key]
      }
    }));

    // Update product type filter checkbox
    const productType = key.split('|')[0];
    const productTypeKeys = Object.keys(chartData).filter(k => k.startsWith(`${productType}|`));
    const allOfTypeChecked = productTypeKeys.every(k => newProductFilters[k] !== false);
    const anyOfTypeChecked = productTypeKeys.some(k => newProductFilters[k] !== false);

    setProductTypeFilters(prev => ({
      ...prev,
      [productType]: anyOfTypeChecked
    }));

    // Update "All Products" checkbox
    const allChecked = Object.keys(newProductFilters).every(k => newProductFilters[k] !== false);
    setFilterAllProducts(allChecked);
  };

  // Add product filter checkbox
  const addProductFilterCheckbox = (key, productType, brand, tech, watt) => {
    const checkboxId = `filter-${key.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className="form-check form-check-inline" key={key}>
        <input
          className="form-check-input product-filter"
          type="checkbox"
          id={checkboxId}
          checked={productFilters[key] !== false}
          onChange={() => handleProductFilterToggle(key)}
          data-key={key}
          data-product-type={productType}
        />
        <label className="form-check-label" htmlFor={checkboxId}>
          {productType} - {brand} ({tech}, {watt})
        </label>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 mt-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast show fixed bottom-5 right-5 m-3 z-50 flex items-center text-white ${toastMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } rounded-lg shadow-lg`}>
          <div className="flex p-3">
            <div className="toast-body">
              {toastMessage.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white ml-2 self-center"
              onClick={() => setToastMessage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}



      {/* Location Cards Visibility Toggle */}
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-outline-primary flex items-center border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded transition-colors"
          onClick={() => setLocationCardsVisible(!locationCardsVisible)}
        >
          {locationCardsVisible ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Selection Cards
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Selection Cards
            </>
          )}
        </button>
      </div>

      {/* Location Selection Section */}
      <div className={`location-section transition-all duration-500 overflow-hidden ${locationCardsVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 m-0 p-0'
        }`}>
        {/* Country Selection */}
        <div className="mb-4">
          <h4 className="mb-3 text-lg font-medium">Select Country</h4>
          <div className="row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
            {countries.map((country) => (
              <div className="col mb-3" key={country._id}>
                <div
                  className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${selectedCountry === country._id
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                  onClick={() => setSelectedCountry(country._id)}
                >
                  <div className="card-body p-4 text-center relative">
                    {warehouseCounts.countries[country._id] > 0 && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 shadow-sm">
                        {warehouseCounts.countries[country._id]} Warehouse
                      </span>
                    )}
                    <h5 className="card-title font-bold text-lg">{country.name}</h5>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{country.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Selection */}
        {selectedCountry && (
          <div className="mb-4 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-medium">Select State</h4>
              <button
                onClick={handleResetLocation}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-wider"
              >
                Reset All Selection
              </button>
            </div>
            <div className="row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
              {states.map((state) => (
                <div className="col mb-3" key={state._id}>
                  <div
                    className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${selectedState === state._id
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => setSelectedState(state._id)}
                  >
                    <div className="card-body p-4 relative">
                      {warehouseCounts.states[state._id] > 0 && (
                        <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-200 shadow-sm">
                          {warehouseCounts.states[state._id]} Warehouse
                        </span>
                      )}
                      <h5 className="card-title font-bold text-lg">{state.name}</h5>
                      <p className="text-gray-600 mb-0">{state.code}</p>
                    </div>
                  </div>
                </div>
              ))}
              {states.length === 0 && <p className="col-span-4 text-center py-8 text-gray-400 italic">No states found for selected country.</p>}
            </div>
          </div>
        )}

        {/* Cluster Selection */}
        {selectedState && (
          <div className={`cluster-section transition-all duration-500 overflow-hidden`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-medium">Select Cluster</h4>
            </div>
            <div className="row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
              {clusters.map((cluster) => (
                <div className="col mb-3" key={cluster._id}>
                  <div
                    className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${selectedCluster === cluster._id
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => setSelectedCluster(cluster._id)}
                  >
                    <div className="card-body p-4 relative">
                      {warehouseCounts.clusters[cluster._id] > 0 && (
                        <span className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-purple-200 shadow-sm">
                          {warehouseCounts.clusters[cluster._id]} Warehouse
                        </span>
                      )}
                      <h6 className="card-title font-bold">{cluster.name}</h6>
                      {/* <p className="text-gray-600 mb-0">{currentState}</p> */}
                    </div>
                  </div>
                </div>
              ))}
              {clusters.length === 0 && <p className="col-span-4 text-center py-8 text-gray-400 italic">No clusters found for selected state.</p>}
            </div>
          </div>
        )}

        {/* District Selection */}
        {selectedCluster && (
          <div className={`district-section transition-all duration-500 overflow-hidden`}>
            <h4 className="mb-3 text-lg font-medium">Select District</h4>
            <div className="row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
              {districts.map((district) => (
                <div className="col mb-3" key={district._id}>
                  <div
                    className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${selectedDistrict === district._id
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => setSelectedDistrict(district._id)}
                  >
                    <div className="card-body p-4 relative">
                      {warehouseCounts.districts[district._id] > 0 && (
                        <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-orange-200 shadow-sm">
                          {warehouseCounts.districts[district._id]} Warehouse
                        </span>
                      )}
                      <h6 className="card-title font-bold">{district.name}</h6>
                    </div>
                  </div>
                </div>
              ))}
              {districts.length === 0 && <p className="col-span-4 text-center py-8 text-gray-400 italic">No districts found for selected cluster.</p>}
            </div>
          </div>
        )}

        {/* City Selection */}
        {selectedDistrict && (
          <div className={`city-section transition-all duration-500 overflow-hidden`}>
            <h4 className="mb-3 text-lg font-medium">Select City</h4>
            <div className="row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
              {cities.map((city) => (
                <div className="col mb-3" key={city._id}>
                  <div
                    className={`card h-full shadow text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border rounded-lg ${selectedCity === city._id
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                    onClick={() => setSelectedCity(city._id)}
                  >
                    <div className="card-body p-4 relative">
                      {warehouseCounts.cities[city._id] > 0 && (
                        <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-200 shadow-sm">
                          {warehouseCounts.cities[city._id]} Warehouse
                        </span>
                      )}
                      <h6 className="card-title font-bold">{city.name}</h6>
                    </div>
                  </div>
                </div>
              ))}
              {cities.length === 0 && <p className="col-span-4 text-center py-8 text-gray-400 italic">No cities found for selected district.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="row">
        <div className="col-md-3 w-full md:w-1/4">
          <label htmlFor="warehouse-select" className="form-label block mb-2">Select Warehouse</label>
          <select
            className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
            id="warehouse-select"
            name="warehouse"
            value={form.warehouse}
            onChange={handleChange}
          >
            <option value="">-- Select Warehouse --</option>
            {warehousesList.map((warehouse) => (
              <option key={warehouse._id} value={warehouse._id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mt-5 flex flex-col lg:flex-row gap-6">
        {/* Map Section */}
        <div className="lg:w-5/12">
          <div className="card p-3 shadow-sm h-full border rounded-lg">
            <h5 className="mb-3 text-lg font-medium">Location Map</h5>
            <div className="w-full rounded-lg overflow-hidden" style={{ height: '550px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3777314.4013896515!2d68.68610173519345!3d22.399514157136505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959051f5f0ef795%3A0x861bd887ed54522e!2sGujarat!5e0!3m2!1sen!2sin!4v1746007377622!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          </div>
        </div>

        {/* Add Inventory Section */}
        <div className="lg:w-7/12">
          <div className="card mb-4 border rounded-lg">
            <div className="card-header bg-blue-600 text-white p-3 rounded-t-lg">
              <h5 className="mb-0 text-white font-medium">Add New Inventory Request</h5>
            </div>
            <div className="card-body p-4">
              <form id="add-inventory-form" onSubmit={handleSubmit}>
                <div className="row grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label block mb-2">Category</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Category --</option>
                      {categoriesList.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sub-category" className="form-label block mb-2">Sub Category</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="sub-category"
                      name="subCategory"
                      value={form.subCategory}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Sub Category --</option>
                      {subCategoriesList
                        .filter(sc => !form.category || (sc.categoryId?._id || sc.categoryId) === form.category)
                        .map((sc) => (
                          <option key={sc._id} value={sc._id}>{sc.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="project-type" className="form-label block mb-2">Project Type</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="project-type"
                      name="projectType"
                      value={form.projectType}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Project Type --</option>
                      {mappingsList
                        .filter(m =>
                          (!selectedState || (m.stateId?._id || m.stateId) === selectedState) &&
                          (!selectedCluster || (m.clusterId?._id || m.clusterId) === selectedCluster) &&
                          (!form.category || (m.categoryId?._id || m.categoryId) === form.category) &&
                          (!form.subCategory || (m.subCategoryId?._id || m.subCategoryId) === form.subCategory)
                        )
                        .map(m => `${m.projectTypeFrom} to ${m.projectTypeTo} kW`)
                        .filter((v, i, a) => v && a.indexOf(v) === i)
                        .map((label) => (
                          <option key={label} value={label}>{label}</option>
                        ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sub-project-type" className="form-label block mb-2">Sub Project Type</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="sub-project-type"
                      name="subProjectType"
                      value={form.subProjectType}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Sub Project Type --</option>
                      {mappingsList
                        .filter(m =>
                          (!selectedState || (m.stateId?._id || m.stateId) === selectedState) &&
                          (!selectedCluster || (m.clusterId?._id || m.clusterId) === selectedCluster) &&
                          (!form.category || (m.categoryId?._id || m.categoryId) === form.category) &&
                          (!form.subCategory || (m.subCategoryId?._id || m.subCategoryId) === form.subCategory) &&
                          (!form.projectType || `${m.projectTypeFrom} to ${m.projectTypeTo} kW` === form.projectType)
                        )
                        .map(m => m.subProjectTypeId)
                        .filter(Boolean)
                        .filter((v, i, a) => a.findIndex(t => t?._id === v?._id) === i)
                        .map((spt) => (
                          <option key={spt._id} value={spt._id}>{spt.name}</option>
                        ))}
                      {/* Fallback to full list if no mappings match categories yet */}
                      {form.subProjectType === '' && mappingsList.length === 0 && subProjectTypesList.map((spt) => (
                        <option key={spt._id} value={spt._id}>{spt.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Type Row (Reference Image alignment) */}
                  <div className="col-span-full mb-3">
                    <label htmlFor="product-type" className="form-label block mb-2">Product Type</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full max-w-md"
                      id="product-type"
                      name="productType"
                      value={form.productType}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Product Type --</option>
                      {productTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="brand-filter" className="form-label block mb-2">Brand</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="brand-filter"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Brand --</option>
                      {brandsList.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.brand || brand.brandName || brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="tech-filter" className="form-label block mb-2">Technology</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="tech-filter"
                      name="technology"
                      value={form.technology}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Technology --</option>
                      {techOptions.map((tech) => (
                        <option key={tech.value} value={tech.value}>
                          {tech.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="watt-filter" className="form-label block mb-2">Watt</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="watt-filter"
                      name="watt"
                      value={form.watt}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Watt --</option>
                      {wattOptions.map((watt) => (
                        <option key={watt.value} value={watt.value}>
                          {watt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 md:col-span-3">
                    <label htmlFor="sku-select" className="form-label block mb-2">SKU</label>
                    <select
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="sku-select"
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select SKU --</option>
                      {skuOptions.map((sku) => (
                        <option key={sku.value} value={sku.value}>
                          {sku.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="panel" className="form-label block mb-2">No of Panels</label>
                    <input
                      type="number"
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="panel"
                      name="panels"
                      value={form.panels}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="kw" className="form-label block mb-2">KW</label>
                    <input
                      type="text"
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full bg-gray-50"
                      id="kw"
                      name="kw"
                      value={form.kw}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label block mb-2">Date</label>
                    <input
                      type="date"
                      className="form-control border border-gray-300 rounded-lg px-3 py-2 w-full"
                      id="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Inventory Request
                </button>
              </form>
            </div>
          </div>

          {/* Recent Additions Table */}
          <div className="card border rounded-lg">
            <div className="card-header bg-blue-500 text-white p-3 rounded-t-lg">
              <h5 className="mb-0 text-white font-medium">Recent Inventory Additions</h5>
            </div>
            <div className="card-body p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Product Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">SKU Number</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Project Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Brand</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Technology</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Watt</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">No of Panels</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">KW</th>
                    </tr>
                  </thead>
                  <tbody id="recent-additions">
                    {recentAdditions.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                          No recent inventory additions
                        </td>
                      </tr>
                    ) : (
                      recentAdditions.map((item) => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.productType}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.sku}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.projectType}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.brand}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.technology}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.watt}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.panels}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.kw}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Filter Checkboxes */}
      <div className="card mt-4 border rounded-lg">
        <div className="card-header bg-blue-500 text-white p-3 rounded-t-lg">
          <h6 className="mb-0 font-medium">Filter Products for Graph</h6>
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-12 mb-3">
              <div className="form-check form-check-inline mr-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="filter-all-products"
                  checked={filterAllProducts}
                  onChange={handleFilterAllToggle}
                />
                <label className="form-check-label ml-2" htmlFor="filter-all-products">
                  All Products
                </label>
              </div>
              {Object.entries(productTypeFilters).map(([type, checked]) => (
                <div className="form-check form-check-inline mr-4" key={type}>
                  <input
                    className="form-check-input product-type-filter"
                    type="checkbox"
                    id={`filter-${type}`}
                    value={type}
                    checked={checked}
                    onChange={() => handleProductTypeFilterToggle(type)}
                  />
                  <label className="form-check-label ml-2" htmlFor={`filter-${type}`}>
                    {productTypes.find(p => p.value === type)?.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="row" id="product-filters">
            {Object.entries(chartData).map(([key, data]) => (
              addProductFilterCheckbox(key, data.productTypeText, data.brand, data.technology, data.watt)
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {chartVisible && (
        <div className="card mt-4 border rounded-lg">
          <div className="card-header bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h6 className="mb-0 font-medium">Inventory Overview (Kw)</h6>
            <div className="chart-legend flex">
              <span className="mr-3">
                <i className="fas fa-square text-blue-500 mr-1"></i> Solar Panels
              </span>
              <span className="mr-3">
                <i className="fas fa-square text-green-500 mr-1"></i> Invertors
              </span>
              <span className="mr-3">
                <i className="fas fa-square text-yellow-500 mr-1"></i> Batteries
              </span>
              <span>
                <i className="fas fa-square text-red-500 mr-1"></i> BosKits
              </span>
            </div>
          </div>
          <div className="card-body p-4">
            <canvas id="inventoryChart" ref={chartRef} height="100"></canvas>
          </div>
        </div>
      )}

      {/* ===== ALL INVENTORY RECORDS TABLE ===== */}
      <div className="mt-8 mb-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-blue-500 rounded-full"></span>
            All Inventory Records
            <span className="text-sm font-normal text-gray-400 ml-2">({allInventoryTotal} total)</span>
          </h5>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search SKU, Brand, Technology..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
              value={allInventorySearch}
              onChange={e => {
                setAllInventorySearch(e.target.value);
                setAllInventoryPage(1);
                fetchAllInventory(1, e.target.value);
              }}
            />
            <button
              onClick={() => fetchAllInventory(allInventoryPage, allInventorySearch)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#56B2D1] text-white">
                  {['Date','Product Type','SKU Number','Project Type','Brand','Technology','Watt','No. of Panels','KW'].map(col => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-white/20 last:border-r-0 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allInventoryLoading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span className="text-sm">Loading inventory records...</span>
                      </div>
                    </td>
                  </tr>
                ) : allInventory.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="font-medium">No inventory records found</p>
                        <p className="text-xs">Add your first inventory item using the form above</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allInventory.map((item, idx) => (
                    <tr key={item.id} className={`hover:bg-blue-50/40 transition-colors text-sm text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-5 py-3 whitespace-nowrap">{item.date}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{item.productType}</td>
                      <td className="px-5 py-3 whitespace-nowrap font-mono text-xs">{item.sku}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{item.projectType}</td>
                      <td className="px-5 py-3 whitespace-nowrap font-medium">{item.brand}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{item.technology}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{item.watt}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-center font-semibold text-blue-700">{item.panels}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-center font-semibold text-green-600">{item.kw}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!allInventoryLoading && allInventoryTotal > ALL_INV_PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing {((allInventoryPage - 1) * ALL_INV_PAGE_SIZE) + 1}–{Math.min(allInventoryPage * ALL_INV_PAGE_SIZE, allInventoryTotal)} of {allInventoryTotal} records
              </p>
              <div className="flex gap-2">
                <button
                  disabled={allInventoryPage === 1}
                  onClick={() => { const p = allInventoryPage - 1; setAllInventoryPage(p); fetchAllInventory(p, allInventorySearch); }}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                {Array.from({ length: Math.ceil(allInventoryTotal / ALL_INV_PAGE_SIZE) }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === Math.ceil(allInventoryTotal / ALL_INV_PAGE_SIZE) || Math.abs(p - allInventoryPage) <= 2)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 py-1.5 text-gray-400 text-xs">…</span>}
                      <button
                        onClick={() => { setAllInventoryPage(p); fetchAllInventory(p, allInventorySearch); }}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                          p === allInventoryPage
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-200 bg-white hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))
                }
                <button
                  disabled={allInventoryPage >= Math.ceil(allInventoryTotal / ALL_INV_PAGE_SIZE)}
                  onClick={() => { const p = allInventoryPage + 1; setAllInventoryPage(p); fetchAllInventory(p, allInventorySearch); }}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}