import React, { useState, useEffect } from 'react';
import {
    Info,
    X,
    ChevronDown,
    Home,
    Building2,
    Sun,
    Zap,
    Battery,
    Wifi,
    Shield,
    Settings,
    Wrench,
    Star,
    Calendar,
    DollarSign,
    Plus,
    Minus,
    Check
} from 'lucide-react';

const FranchiseQuotes = () => {
    // State for system configuration
    const [systemConfig, setSystemConfig] = useState({
        technology: '',
        panelWattage: '',
        numberOfPanels: '',
        systemCapacity: '',
        location: '',
        kitType: ''
    });

    // State for pricing details
    const [pricing, setPricing] = useState({
        installationCharges: '',
        structureCharges: '',
        margin: '',
        discount: ''
    });

    // State for modals
    const [showComboKitModal, setShowComboKitModal] = useState(false);
    const [showCustomKitModal, setShowCustomKitModal] = useState(false);
    const [showProductDetailModal, setShowProductDetailModal] = useState(false);

    // State for selected products
    const [selectedProducts, setSelectedProducts] = useState([]);

    // State for custom kit selections
    const [customKit, setCustomKit] = useState({
        technology: 'TOPCON',
        panelWatt: '570',
        numberOfPanels: '8',
        kilowatt: '4.56 KW - (570 Wp / 8 Panel / TOPCON)',
        solarPanel: '',
        inverter: '',
        bosKit: ''
    });

    // State for showing result section
    const [showResult, setShowResult] = useState(false);

    // State for advanced options
    const [advancedOptions, setAdvancedOptions] = useState({
        cleaningKit: {
            selected: null,
            price: 100000,
            isFree: true,
            customPrice: ''
        },
        insurance: {
            selected: null,
            price: 0
        },
        amc: {
            selected: null,
            price: 0
        }
    });

    // State for product detail
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);

    // Combo kit products
    const comboKits = [
        {
            id: 'combo-101',
            name: 'Starter Combo Kit',
            price: 60000,
            oldPrice: 75000,
            rating: 4.5,
            image: '../../assets/vendors/images/solarpanel.png',
            description: 'Perfect for small residential installations',
            specifications: {
                type: 'combo',
                warranty: '10 years',
                efficiency: '90%'
            }
        },
        {
            id: 'combo-102',
            name: 'Professional Combo Kit',
            price: 85000,
            oldPrice: 100000,
            rating: 4.8,
            image: '../../assets/vendors/images/solarpanel.png',
            description: 'Ideal for medium-sized commercial projects',
            specifications: {
                type: 'combo',
                warranty: '12 years',
                efficiency: '92%'
            }
        },
        {
            id: 'combo-103',
            name: 'Enterprise Combo Kit',
            price: 120000,
            oldPrice: 140000,
            rating: 4.9,
            image: '../../assets/vendors/images/solarpanel.png',
            description: 'Complete solution for large-scale installations',
            specifications: {
                type: 'combo',
                warranty: '15 years',
                efficiency: '95%'
            }
        }
    ];

    // Cleaning kit options
    const cleaningKits = [
        {
            id: 'clean-1',
            name: 'Cleaning Brush',
            price: 100000,
            image: '../../assets/vendors/images/cleaning.jpg',
            description: 'Includes telescopic pole, brush and biodegradable cleaner'
        },
        {
            id: 'clean-2',
            name: 'Cleaning Brush Pro',
            price: 150000,
            image: '../../assets/vendors/images/cleaning.jpg',
            description: 'Professional grade cleaning kit with extended reach'
        },
        {
            id: 'clean-3',
            name: 'Cleaning Brush Premium',
            price: 200000,
            image: '../../assets/vendors/images/cleaning.jpg',
            description: 'Complete cleaning solution with automated features'
        }
    ];

    // Insurance options
    const insuranceOptions = [
        {
            id: 'ins-1',
            name: 'Basic Panel Protection',
            price: 3000,
            features: ['Covers damage from natural disasters', 'Theft protection', '10-year coverage option'],
            image: '../../assets/vendors/images/insurance-1.jpg'
        },
        {
            id: 'ins-2',
            name: 'Comprehensive System Insurance',
            price: 6000,
            features: ['Full system coverage', 'Performance guarantee', 'Rapid replacement service', '15-year coverage option'],
            image: '../../assets/vendors/images/insurance-2.jpg'
        }
    ];

    // AMC options
    const amcOptions = [
        {
            id: 'amc-1',
            name: 'Basic AMC Plan',
            price: 4000,
            features: ['Bi-annual system inspection', 'Basic cleaning (twice a year)', 'Performance report', 'Remote monitoring setup'],
            image: '../../assets/vendors/images/amc-1.jpg'
        },
        {
            id: 'amc-2',
            name: 'Premium AMC Plan',
            price: 7000,
            features: ['Quarterly system inspection', 'Professional cleaning (quarterly)', 'Detailed performance analytics', 'Priority service response', 'Includes minor repairs'],
            image: '../../assets/vendors/images/amc-2.jpg'
        },
        {
            id: 'amc-3',
            name: 'Comprehensive AMC Plan',
            price: 12000,
            features: ['Monthly system inspection', 'Advanced robotic cleaning', 'Real-time monitoring & alerts', '24/7 emergency support', 'Includes all parts replacement', 'Maximum efficiency guarantee'],
            image: '../../assets/vendors/images/amc-3.jpg'
        }
    ];

    // Handle input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setSystemConfig(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Handle pricing changes
    const handlePricingChange = (e) => {
        const { id, value } = e.target;
        setPricing(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Handle custom kit changes
    const handleCustomKitChange = (e) => {
        const { id, value } = e.target;
        setCustomKit(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Add product to selected products
    const addSelectedProduct = (product, type) => {
        setSelectedProducts(prev => {
            // Check if product already exists
            const exists = prev.some(p => p.id === product.id && p.type === type);
            if (!exists) {
                return [...prev, { ...product, type, quantity: 1 }];
            }
            return prev;
        });
    };

    // Remove product from selected products
    const removeProduct = (productId, type) => {
        setSelectedProducts(prev => prev.filter(p => !(p.id === productId && p.type === type)));

        // Also uncheck in advanced options if applicable
        if (type === 'cleaning') {
            setAdvancedOptions(prev => ({ ...prev, cleaningKit: { ...prev.cleaningKit, selected: null } }));
        } else if (type === 'insurance') {
            setAdvancedOptions(prev => ({ ...prev, insurance: { ...prev.insurance, selected: null } }));
        } else if (type === 'amc') {
            setAdvancedOptions(prev => ({ ...prev, amc: { ...prev.amc, selected: null } }));
        }
    };

    // Add selected products from combo kit modal
    const addComboKitProducts = () => {
        const selectedComboKits = comboKits.filter(kit =>
            document.getElementById(`product-${kit.id}`)?.checked
        );

        selectedComboKits.forEach(kit => {
            addSelectedProduct(kit, 'combo');
        });

        setShowComboKitModal(false);

        // Uncheck all checkboxes
        selectedComboKits.forEach(kit => {
            const checkbox = document.getElementById(`product-${kit.id}`);
            if (checkbox) checkbox.checked = false;
        });
    };

    // Handle cleaning kit selection
    const handleCleaningKitSelect = (kit) => {
        setAdvancedOptions(prev => ({
            ...prev,
            cleaningKit: {
                ...prev.cleaningKit,
                selected: kit.id,
                price: kit.price,
                isFree: true
            }
        }));

        addSelectedProduct({
            id: kit.id,
            name: kit.name,
            price: kit.price,
            image: kit.image
        }, 'cleaning');
    };

    // Handle insurance selection
    const handleInsuranceSelect = (insurance) => {
        setAdvancedOptions(prev => ({
            ...prev,
            insurance: {
                ...prev.insurance,
                selected: insurance.id,
                price: insurance.price
            }
        }));

        addSelectedProduct({
            id: insurance.id,
            name: insurance.name,
            price: insurance.price,
            image: insurance.image
        }, 'insurance');
    };

    // Handle AMC selection
    const handleAmcSelect = (amc) => {
        setAdvancedOptions(prev => ({
            ...prev,
            amc: {
                ...prev.amc,
                selected: amc.id,
                price: amc.price
            }
        }));

        addSelectedProduct({
            id: amc.id,
            name: amc.name,
            price: amc.price,
            image: amc.image
        }, 'amc');
    };

    // Handle free/chargeable toggle
    const handleCleaningKitOptionChange = (kitId, value) => {
        setAdvancedOptions(prev => ({
            ...prev,
            cleaningKit: {
                ...prev.cleaningKit,
                isFree: value === 'free'
            }
        }));

        // Update product in selected products
        setSelectedProducts(prev =>
            prev.map(p => {
                if (p.id === kitId && p.type === 'cleaning') {
                    return {
                        ...p,
                        isFree: value === 'free'
                    };
                }
                return p;
            })
        );
    };

    // Handle custom price input
    const handleCustomPriceChange = (kitId, price) => {
        setAdvancedOptions(prev => ({
            ...prev,
            cleaningKit: {
                ...prev.cleaningKit,
                customPrice: price
            }
        }));

        // Update product in selected products
        setSelectedProducts(prev =>
            prev.map(p => {
                if (p.id === kitId && p.type === 'cleaning') {
                    return {
                        ...p,
                        customPrice: price
                    };
                }
                return p;
            })
        );
    };

    // Show product detail
    const showProductDetail = (product) => {
        setSelectedProductDetail(product);
        setShowProductDetailModal(true);
    };

    // Calculate total price
    const calculateTotal = () => {
        let total = 0;

        // Add combo kit prices
        selectedProducts.forEach(product => {
            if (product.type === 'combo') {
                total += product.price;
            } else if (product.type === 'cleaning') {
                if (product.isFree) {
                    // Free, don't add to total
                } else if (product.customPrice) {
                    total += parseInt(product.customPrice);
                } else {
                    total += product.price;
                }
            } else if (product.type === 'insurance' || product.type === 'amc') {
                total += product.price;
            }
        });

        // Add pricing details
        total += parseInt(pricing.installationCharges || 0);
        total += parseInt(pricing.structureCharges || 0);
        total += parseInt(pricing.margin || 0);
        total -= parseInt(pricing.discount || 0);

        return total;
    };

    // Get star rating
    const getStarRating = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" size={16} />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="fill-yellow-400 text-yellow-400" size={16} style={{ clipPath: 'inset(0 50% 0 0)' }} />);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={16} />);
        }

        return stars;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-4">
                {/* Header */}
                <div className="mb-4">
                    <nav className="bg-white rounded-lg shadow-sm p-4">
                        <ol className="flex items-center">
                            <li className="flex-1">
                                <h3 className="text-xl font-bold text-blue-600">CP Quotes</h3>
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className="container mx-auto py-3">
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            {/* System Configuration */}
                            <h3 className="text-blue-600 text-lg font-semibold mb-4">System Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Technology</label>
                                    <select
                                        id="technology"
                                        value={systemConfig.technology}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>Select Technology</option>
                                        <option value="Mono PERC">Mono PERC</option>
                                        <option value="Poly">Poly</option>
                                        <option value="Thin Film">Thin Film</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Panel Wattage</label>
                                    <select
                                        id="panelWattage"
                                        value={systemConfig.panelWattage}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>Select Panel Wattage</option>
                                        <option value="250W">250W</option>
                                        <option value="300W">300W</option>
                                        <option value="400W">400W</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Panels</label>
                                    <input
                                        type="number"
                                        id="numberOfPanels"
                                        value={systemConfig.numberOfPanels}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter number of panels"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">System Capacity</label>
                                    <select
                                        id="systemCapacity"
                                        value={systemConfig.systemCapacity}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>Select System Capacity</option>
                                        <option value="1 KW">1 KW</option>
                                        <option value="2 KW">2 KW</option>
                                        <option value="5 KW">5 KW</option>
                                        <option value="10 KW">10 KW</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        id="location"
                                        value={systemConfig.location}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter Pincode"
                                    />
                                </div>
                            </div>

                            {/* Kit Type */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Kit Type</label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="kitType"
                                            value="combo"
                                            checked={systemConfig.kitType === 'combo'}
                                            onChange={() => {
                                                setSystemConfig(prev => ({ ...prev, kitType: 'combo' }));
                                                setShowComboKitModal(true);
                                            }}
                                            className="form-radio h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Combo Kits</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="kitType"
                                            value="custom"
                                            checked={systemConfig.kitType === 'custom'}
                                            onChange={() => {
                                                setSystemConfig(prev => ({ ...prev, kitType: 'custom' }));
                                                setShowCustomKitModal(true);
                                            }}
                                            className="form-radio h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Customized Kits</span>
                                    </label>
                                </div>

                                {/* Selected Products Display */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Products</label>
                                    <div className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        {selectedProducts.length === 0 ? (
                                            <p className="text-gray-400 text-center mt-4">No products selected yet</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProducts.map((product, index) => (
                                                    <div
                                                        key={`${product.id}-${index}`}
                                                        className="inline-flex items-center bg-gray-50 rounded-full px-3 py-1 border border-gray-200"
                                                    >
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-6 h-6 object-contain rounded-full mr-2"
                                                        />
                                                        <span className="text-sm">{product.name}</span>
                                                        {product.type === 'cleaning' && product.isFree && (
                                                            <span className="ml-2 text-xs text-green-600">Free</span>
                                                        )}
                                                        <button
                                                            onClick={() => removeProduct(product.id, product.type)}
                                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Details */}
                            <h5 className="text-blue-600 text-md font-semibold mt-8 mb-3">Pricing Details</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Installation Charges (₹)</label>
                                    <input
                                        type="number"
                                        id="installationCharges"
                                        value={pricing.installationCharges}
                                        onChange={handlePricingChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter installation charges"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Structure Charges (₹)</label>
                                    <input
                                        type="number"
                                        id="structureCharges"
                                        value={pricing.structureCharges}
                                        onChange={handlePricingChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter structure charges"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Margin (₹)</label>
                                    <input
                                        type="number"
                                        id="margin"
                                        value={pricing.margin}
                                        onChange={handlePricingChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter margin"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                                    <input
                                        type="number"
                                        id="discount"
                                        value={pricing.discount}
                                        onChange={handlePricingChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter discount"
                                    />
                                </div>
                            </div>

                            {/* Advanced Options Section */}
                            <div className="mt-8">
                                <h3 className="text-blue-600 text-lg font-semibold mb-4">Advanced Options</h3>

                                {/* Cleaning Kit */}
                                <div className="mb-6">
                                    <h5 className="text-md font-semibold mb-3">Cleaning Kit</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {cleaningKits.map((kit) => (
                                            <div
                                                key={kit.id}
                                                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all border ${advancedOptions.cleaningKit.selected === kit.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="p-4">
                                                    <img
                                                        src={kit.image}
                                                        alt={kit.name}
                                                        className="h-24 mx-auto object-contain mb-3"
                                                    />
                                                    <h6 className="font-semibold text-center mb-2">{kit.name}</h6>
                                                    <div className="text-center mb-2">
                                                        <span className="text-blue-600 font-bold">₹{kit.price.toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 text-center mb-3">{kit.description}</p>

                                                    <div className="mb-3">
                                                        <label className="inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={advancedOptions.cleaningKit.selected === kit.id}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        handleCleaningKitSelect(kit);
                                                                    } else {
                                                                        removeProduct(kit.id, 'cleaning');
                                                                    }
                                                                }}
                                                                className="form-checkbox h-4 w-4 text-blue-600"
                                                            />
                                                            <span className="ml-2 text-sm">Select</span>
                                                        </label>
                                                    </div>

                                                    {advancedOptions.cleaningKit.selected === kit.id && (
                                                        <>
                                                            <div className="mt-2 space-y-2">
                                                                <label className="inline-flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        name={`${kit.id}-option`}
                                                                        value="free"
                                                                        checked={advancedOptions.cleaningKit.isFree}
                                                                        onChange={() => handleCleaningKitOptionChange(kit.id, 'free')}
                                                                        className="form-radio h-3 w-3 text-blue-600"
                                                                    />
                                                                    <span className="ml-2 text-xs">Free</span>
                                                                </label>
                                                                <label className="inline-flex items-center ml-4">
                                                                    <input
                                                                        type="radio"
                                                                        name={`${kit.id}-option`}
                                                                        value="chargeable"
                                                                        checked={!advancedOptions.cleaningKit.isFree}
                                                                        onChange={() => handleCleaningKitOptionChange(kit.id, 'chargeable')}
                                                                        className="form-radio h-3 w-3 text-blue-600"
                                                                    />
                                                                    <span className="ml-2 text-xs">Chargeable</span>
                                                                </label>
                                                            </div>

                                                            {!advancedOptions.cleaningKit.isFree && (
                                                                <div className="mt-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Enter new price"
                                                                        value={advancedOptions.cleaningKit.customPrice}
                                                                        onChange={(e) => handleCustomPriceChange(kit.id, e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                                    />
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Insurance */}
                                <div className="mb-6">
                                    <h5 className="text-md font-semibold mb-3">Insurance</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {insuranceOptions.map((insurance) => (
                                            <div
                                                key={insurance.id}
                                                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all border ${advancedOptions.insurance.selected === insurance.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="p-4">
                                                    <h6 className="font-semibold mb-2">{insurance.name}</h6>
                                                    <p className="text-blue-600 font-bold mb-2">₹{insurance.price.toLocaleString()}/year</p>
                                                    <ul className="text-xs text-gray-600 mb-3 list-disc pl-4">
                                                        {insurance.features.map((feature, idx) => (
                                                            <li key={idx}>{feature}</li>
                                                        ))}
                                                    </ul>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={advancedOptions.insurance.selected === insurance.id}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    handleInsuranceSelect(insurance);
                                                                } else {
                                                                    removeProduct(insurance.id, 'insurance');
                                                                }
                                                            }}
                                                            className="form-checkbox h-4 w-4 text-blue-600"
                                                        />
                                                        <span className="ml-2 text-sm">Select</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AMC */}
                                <div className="mb-6">
                                    <h5 className="text-md font-semibold mb-3">Annual Maintenance Contract (AMC)</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {amcOptions.map((amc) => (
                                            <div
                                                key={amc.id}
                                                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500 ${advancedOptions.amc.selected === amc.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="p-4">
                                                    <h6 className="font-semibold mb-2">{amc.name}</h6>
                                                    <p className="text-blue-600 font-bold mb-2">₹{amc.price.toLocaleString()}/year</p>
                                                    <ul className="text-xs text-gray-600 mb-3 list-disc pl-4">
                                                        {amc.features.map((feature, idx) => (
                                                            <li key={idx}>{feature}</li>
                                                        ))}
                                                    </ul>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={advancedOptions.amc.selected === amc.id}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    handleAmcSelect(amc);
                                                                } else {
                                                                    removeProduct(amc.id, 'amc');
                                                                }
                                                            }}
                                                            className="form-checkbox h-4 w-4 text-blue-600"
                                                        />
                                                        <span className="ml-2 text-sm">Select</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Generate Quote Button */}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => {
                                        // In a real app, this would generate a PDF or navigate to quote page
                                        alert(`Total Quote Amount: ₹${calculateTotal().toLocaleString()}`);
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Generate Quote
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Combo Kit Modal */}
            {showComboKitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                            <h5 className="text-lg font-semibold">Select Combo Kit</h5>
                            <button onClick={() => setShowComboKitModal(false)} className="text-white hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {comboKits.map((kit) => (
                                    <div key={kit.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                        <div className="p-4 text-center relative">
                                            <button
                                                onClick={() => showProductDetail(kit)}
                                                className="absolute top-2 right-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                                            >
                                                <Info size={16} />
                                            </button>
                                            <img
                                                src={kit.image}
                                                alt={kit.name}
                                                className="h-24 mx-auto object-contain mb-3"
                                            />
                                            <h6 className="font-semibold mb-2">{kit.name}</h6>
                                            <p className="mb-2">
                                                <span className="text-blue-600 font-bold">₹{kit.price.toLocaleString()}</span>
                                                <span className="text-gray-400 line-through ml-2">₹{kit.oldPrice.toLocaleString()}</span>
                                            </p>
                                            <div className="flex justify-center mb-3">
                                                {getStarRating(kit.rating)}
                                            </div>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`product-${kit.id}`}
                                                    className="form-checkbox h-4 w-4 text-blue-600"
                                                />
                                                <span className="ml-2 text-sm">Select</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t px-6 py-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowComboKitModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={addComboKitProducts}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add Selected Products
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Kit Modal */}
            {showCustomKitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                            <h5 className="text-lg font-semibold">Select Customized Kit</h5>
                            <button onClick={() => setShowCustomKitModal(false)} className="text-white hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="solarForm">
                                {/* Select Technology */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Technology</label>
                                    <select
                                        id="technology"
                                        value={customKit.technology}
                                        onChange={handleCustomKitChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="TOPCON">TOPCON</option>
                                        <option value="Bifacial">Bifacial</option>
                                    </select>
                                </div>

                                {/* Solar Panel Watt */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Solar panel watt</label>
                                    <select
                                        id="panelWatt"
                                        value={customKit.panelWatt}
                                        onChange={handleCustomKitChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="570">570</option>
                                        <option value="540">540</option>
                                        <option value="500">500</option>
                                    </select>
                                </div>

                                {/* Number of Panels */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of solar Panels</label>
                                    <select
                                        id="numberOfPanels"
                                        value={customKit.numberOfPanels}
                                        onChange={handleCustomKitChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="8">8</option>
                                        <option value="10">10</option>
                                        <option value="12">12</option>
                                    </select>
                                </div>

                                {/* Kilowatt */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilowatt (KW)</label>
                                    <select
                                        id="kilowatt"
                                        value={customKit.kilowatt}
                                        onChange={handleCustomKitChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="4.56 KW - (570 Wp / 8 Panel / TOPCON)">4.56 KW - (570 Wp / 8 Panel / TOPCON)</option>
                                    </select>
                                </div>

                                {/* Customize Options */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Solar Panel</label>
                                        <select
                                            id="solarPanel"
                                            value={customKit.solarPanel}
                                            onChange={handleCustomKitChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Panel</option>
                                            <option value="Adani">Adani</option>
                                            <option value="Waaree">Waaree</option>
                                            <option value="Tata">Tata</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Inverter</label>
                                        <select
                                            id="inverter"
                                            value={customKit.inverter}
                                            onChange={handleCustomKitChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Inverter</option>
                                            <option value="Vsole">Vsole</option>
                                            <option value="Ksolar">Ksolar</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">BOS KIT</label>
                                        <select
                                            id="bosKit"
                                            value={customKit.bosKit}
                                            onChange={handleCustomKitChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select BOSkit</option>
                                            <option value="3-4 Kw BosKit">3-4 Kw BosKit</option>
                                            <option value="3-5 Kw BosKit">3-5 Kw BosKit</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Calculate Button */}
                                <div className="flex justify-end mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowResult(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Calculate
                                    </button>
                                </div>
                            </form>

                            {/* Results Section */}
                            {showResult && (
                                <div className="mt-4">
                                    <h6 className="font-semibold mb-3">Your Selection</h6>
                                    <div className="bg-white rounded-lg shadow-sm p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            {/* Solar Panel */}
                                            <div className="text-center">
                                                <img
                                                    src="../../assets/vendors/images/solarpanel.png"
                                                    className="h-16 mx-auto object-contain mb-2"
                                                    alt="Solar Panel"
                                                />
                                                <p className="text-sm font-medium">Adani Solar Panel</p>
                                            </div>

                                            {/* Inverter */}
                                            <div className="text-center">
                                                <img
                                                    src="../../assets/vendors/images/invertor.jpeg"
                                                    className="h-16 mx-auto object-contain mb-2"
                                                    alt="Inverter"
                                                />
                                                <p className="text-sm font-medium">Vsole Inverter</p>
                                            </div>

                                            {/* BOS Kit */}
                                            <div className="text-center">
                                                <img
                                                    src="../../assets/vendors/images/boskit.jpeg"
                                                    className="h-16 mx-auto object-contain mb-2"
                                                    alt="BOS Kit"
                                                />
                                                <p className="text-sm font-medium">Adani 3-4 KW BOS Kit</p>
                                            </div>
                                        </div>

                                        {/* Total Price */}
                                        <div className="text-right mt-3">
                                            <h6 className="text-green-600 font-bold">Total = ₹1,20,000</h6>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t px-6 py-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCustomKitModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    // Add custom kit products
                                    const customProduct = {
                                        id: 'custom-1',
                                        name: `Custom Kit - ${customKit.kilowatt}`,
                                        price: 120000,
                                        image: '../../assets/vendors/images/solarpanel.png'
                                    };
                                    addSelectedProduct(customProduct, 'custom');
                                    setShowCustomKitModal(false);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add Selected Products
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {showProductDetailModal && selectedProductDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                            <h5 className="text-lg font-semibold">Product Details</h5>
                            <button onClick={() => setShowProductDetailModal(false)} className="text-white hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center">
                                    <img
                                        src={selectedProductDetail.image}
                                        alt={selectedProductDetail.name}
                                        className="max-h-48 mx-auto object-contain"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2">{selectedProductDetail.name}</h4>
                                    <p className="text-blue-600 font-bold text-lg mb-1">Price: ₹{selectedProductDetail.price.toLocaleString()}</p>
                                    {selectedProductDetail.oldPrice && (
                                        <p className="text-gray-400 line-through mb-2">Original: ₹{selectedProductDetail.oldPrice.toLocaleString()}</p>
                                    )}
                                    <div className="flex text-yellow-400 mb-3">
                                        {selectedProductDetail.rating && getStarRating(selectedProductDetail.rating)}
                                    </div>
                                    <h6 className="font-semibold mb-2">Description</h6>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {selectedProductDetail.description || 'High-quality product with excellent efficiency and durability.'}
                                    </p>
                                    <h6 className="font-semibold mb-2">Specifications</h6>
                                    <ul className="text-sm border rounded-md divide-y">
                                        <li className="px-3 py-2">Type: {selectedProductDetail.specifications?.type || selectedProductDetail.type || 'Standard'}</li>
                                        <li className="px-3 py-2">Warranty: {selectedProductDetail.specifications?.warranty || '10 years'}</li>
                                        <li className="px-3 py-2">Efficiency: {selectedProductDetail.specifications?.efficiency || '90%'}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border-t px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setShowProductDetailModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
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

export default FranchiseQuotes;