// FranchiseSolarkits.jsx
import React, { useState } from 'react';
import {
    Zap,
    Funnel,
    RotateCcw,
    Package,
    Zap as LightningIcon,
    CheckCircle,
    XCircle,
    DollarSign,
    Gauge,
    Sun,
    Battery,
    Cpu
} from 'lucide-react';

const FranchiseSolarkits = () => {
    const [filters, setFilters] = useState({
        category: '',
        subCategory: '',
        subProjectType: '',
        projectType: '',
        panelBrand: '',
        inverterBrand: '',
        technology: '',
        stockStatus: '',
        priceRange: '',
        wattsRange: ''
    });

    const [data] = useState([
        {
            combokit: "Adani",
            category: "Rooftop Solar",
            subCategory: "Residential",
            subProjectType: "Hybrid",
            projectType: "1KW to 5KW",
            watts: 550,
            pricePerKW: 45000,
            panelBrand: "Adani",
            inverterBrand: "Luminous",
            technology: "Bifacial",
            stockStatus: "In Stock",
            image: "https://m.media-amazon.com/images/I/71qsYaba9EL.jpg",
            panelLogo: "https://i.pinimg.com/736x/20/3d/8e/203d8e6de718b5a5f34295533e6f808b.jpg",
            inverterLogo: "https://lumprodsta.blob.core.windows.net/prodcontainer/Images/2499e3e7-22b8-4382-9707-4c55b1a3d070_NXG_850_1.png"
        },
        {
            combokit: "Waree",
            category: "Solar Pump",
            subCategory: "Commercial",
            subProjectType: "Ongrid",
            projectType: "5KW to 10KW",
            watts: 610,
            pricePerKW: 48000,
            panelBrand: "Waree",
            inverterBrand: "Growatt",
            technology: "TopCon",
            stockStatus: "Out of Stock",
            image: "https://m.media-amazon.com/images/I/71qsYaba9EL.jpg",
            panelLogo: "https://i.pinimg.com/736x/20/3d/8e/203d8e6de718b5a5f34295533e6f808b.jpg",
            inverterLogo: "https://lumprodsta.blob.core.windows.net/prodcontainer/Images/2499e3e7-22b8-4382-9707-4c55b1a3d070_NXG_850_1.png"
        },
        {
            combokit: "Tata",
            category: "Solar Light",
            subCategory: "Commercial",
            subProjectType: "Offgrid",
            projectType: "11KW to 15KW",
            watts: 570,
            pricePerKW: 52000,
            panelBrand: "Tata",
            inverterBrand: "ABB",
            technology: "Mono PERC",
            stockStatus: "In Stock",
            image: "https://m.media-amazon.com/images/I/71qsYaba9EL.jpg",
            panelLogo: "https://i.pinimg.com/736x/20/3d/8e/203d8e6de718b5a5f34295533e6f808b.jpg",
            inverterLogo: "https://lumprodsta.blob.core.windows.net/prodcontainer/Images/2499e3e7-22b8-4382-9707-4c55b1a3d070_NXG_850_1.png"
        }
    ]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const applyFilters = () => {
        // Filtering is handled by the filteredData derived state
        // This just triggers a re-render
    };

    const resetFilters = () => {
        setFilters({
            category: '',
            subCategory: '',
            subProjectType: '',
            projectType: '',
            panelBrand: '',
            inverterBrand: '',
            technology: '',
            stockStatus: '',
            priceRange: '',
            wattsRange: ''
        });
    };

    const filteredData = data.filter(item => {
        const categoryMatch = !filters.category || item.category === filters.category;
        const subCategoryMatch = !filters.subCategory || item.subCategory === filters.subCategory;
        const subProjectTypeMatch = !filters.subProjectType || item.subProjectType === filters.subProjectType;
        const projectTypeMatch = !filters.projectType || item.projectType === filters.projectType;
        const panelBrandMatch = !filters.panelBrand || item.panelBrand === filters.panelBrand;
        const inverterBrandMatch = !filters.inverterBrand || item.inverterBrand === filters.inverterBrand;
        const techMatch = !filters.technology || item.technology === filters.technology;
        const stockMatch = !filters.stockStatus || item.stockStatus === filters.stockStatus;

        // Price range
        let priceMatch = true;
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-');
            if (max === '+') {
                priceMatch = item.pricePerKW >= parseInt(min);
            } else {
                priceMatch = item.pricePerKW >= parseInt(min) && item.pricePerKW <= parseInt(max);
            }
        }

        // Watts range
        let wattsMatch = true;
        if (filters.wattsRange) {
            const [min, max] = filters.wattsRange.split('-');
            if (max === '+') {
                wattsMatch = item.watts >= parseInt(min);
            } else {
                wattsMatch = item.watts >= parseInt(min) && item.watts <= parseInt(max);
            }
        }

        return categoryMatch && subCategoryMatch && subProjectTypeMatch && projectTypeMatch &&
            panelBrandMatch && inverterBrandMatch && techMatch && stockMatch &&
            priceMatch && wattsMatch;
    });

    return (
        <div className="container mx-auto px-4 py-4 max-w-7xl">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm mb-3 border-0">
                <div className="p-4">
                    <h3 className="text-2xl font-bold text-blue-600 flex items-center">
                        <Zap size={24} className="mr-2 text-yellow-500 fill-current" />
                        Solarkits
                    </h3>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm mb-3 border-0">
                <div className="p-4">
                    {/* Row 1: Category Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Category</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="Rooftop Solar">Rooftop Solar</option>
                                <option value="Solar Pump">Solar Pump</option>
                                <option value="Solar Light">Solar Light</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Sub Category</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.subCategory}
                                onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                            >
                                <option value="">All Sub Categories</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Sub Project Type</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.subProjectType}
                                onChange={(e) => handleFilterChange('subProjectType', e.target.value)}
                            >
                                <option value="">All Sub Project Types</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Ongrid">Ongrid</option>
                                <option value="Offgrid">Offgrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Project Type</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.projectType}
                                onChange={(e) => handleFilterChange('projectType', e.target.value)}
                            >
                                <option value="">All Project Types</option>
                                <option value="1KW to 5KW">1KW to 5KW</option>
                                <option value="5KW to 10KW">5KW to 10KW</option>
                                <option value="11KW to 15KW">11KW to 15KW</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: New Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Solar Panel Brand</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.panelBrand}
                                onChange={(e) => handleFilterChange('panelBrand', e.target.value)}
                            >
                                <option value="">All Panel Brands</option>
                                <option value="Adani">Adani</option>
                                <option value="Waree">Waree</option>
                                <option value="Tata">Tata</option>
                                <option value="Vikram">Vikram</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Inverter Brand</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.inverterBrand}
                                onChange={(e) => handleFilterChange('inverterBrand', e.target.value)}
                            >
                                <option value="">All Inverter Brands</option>
                                <option value="Luminous">Luminous</option>
                                <option value="Growatt">Growatt</option>
                                <option value="SMA">SMA</option>
                                <option value="ABB">ABB</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Solar Panel Technology</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.technology}
                                onChange={(e) => handleFilterChange('technology', e.target.value)}
                            >
                                <option value="">All Technologies</option>
                                <option value="Bifacial">Bifacial</option>
                                <option value="TopCon">TopCon</option>
                                <option value="Mono PERC">Mono PERC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Stock Status</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.stockStatus}
                                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Range Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Price Range (₹)</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.priceRange}
                                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="0-40000">Below 40,000</option>
                                <option value="40000-50000">40,000 - 50,000</option>
                                <option value="50000-60000">50,000 - 60,000</option>
                                <option value="60000+">Above 60,000</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold text-gray-600">Solar Panel Watts Range</label>
                            <select
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.wattsRange}
                                onChange={(e) => handleFilterChange('wattsRange', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="0-550">Below 550W</option>
                                <option value="550-600">550W - 600W</option>
                                <option value="600+">Above 600W</option>
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition-colors"
                            onClick={applyFilters}
                        >
                            <Funnel size={14} className="mr-1" />
                            Apply
                        </button>
                        <button
                            className="px-4 py-1.5 bg-gray-500 text-white rounded-md text-sm font-medium flex items-center hover:bg-gray-600 transition-colors"
                            onClick={resetFilters}
                        >
                            <RotateCcw size={14} className="mr-1" />
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* ComboKit Cards */}
            {filteredData.length === 0 ? (
                <div className="text-center text-gray-500 py-4 text-sm">
                    No matching Combokits found
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300 cursor-pointer relative flex flex-col h-full"
                        >
                            {/* Stock Badge */}
                            <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${item.stockStatus === 'In Stock'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                {item.stockStatus === 'In Stock' ? (
                                    <CheckCircle size={10} className="inline mr-1" />
                                ) : (
                                    <XCircle size={10} className="inline mr-1" />
                                )}
                                {item.stockStatus}
                            </span>

                            <div className="p-4 text-center flex flex-col h-full">
                                <h6 className="font-bold text-blue-600 mb-3">{item.combokit} ComboKit</h6>

                                <img
                                    src={item.image}
                                    alt="ComboKit"
                                    className="max-w-[220px] mx-auto rounded mb-3"
                                />

                                <div className="flex justify-center items-center space-x-3 mb-3">
                                    <img src={item.panelLogo} alt="Panel" className="h-8" />
                                    <img src={item.inverterLogo} alt="Inverter" className="h-8" />
                                </div>

                                <div className="text-sm space-y-1 mb-3">
                                    <div className="flex items-center justify-center">
                                        <Sun size={14} className="mr-1 text-yellow-500" />
                                        <span><b>Panel:</b> {item.panelBrand}</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Battery size={14} className="mr-1 text-blue-500" />
                                        <span><b>Inverter:</b> {item.inverterBrand}</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Cpu size={14} className="mr-1 text-purple-500" />
                                        <span><b>Tech:</b> {item.technology}</span>
                                    </div>
                                </div>

                                <div className="mt-auto border-t pt-3">
                                    <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                        <LightningIcon size={12} className="mr-1" />
                                        {item.watts}W
                                    </span>
                                    <br />
                                    <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        <DollarSign size={12} className="mr-1" />
                                        ₹ {item.pricePerKW.toLocaleString()} / KW
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FranchiseSolarkits;