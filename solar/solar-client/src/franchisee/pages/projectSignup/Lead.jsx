import React, { useState } from 'react';
import {
    Plus,
    X,
    MapPin,
    Mail,
    Phone,
    Wifi,
    Zap,
    Battery,
    Sun,
    Home,
    Building2,
    DollarSign,
    ChevronDown
} from 'lucide-react';
import { locationAPI } from '../../../api/api';

const FranchiseLeads = () => {
    // State for modal visibility
    const [showModal, setShowModal] = useState(false);

    // State for selected district
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    // State for leads data organized by district
    const [leadsByDistrict, setLeadsByDistrict] = useState({});

    // State for districts and cities (clusters)
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);

    // Fetch districts on mount
    React.useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    setDistricts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    // State for form data
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        whatsapp: '',
        email: '',
        district: '',
        city: '',
        solarType: '',
        kw: '0 KW - Kilowatt',
        subType: '',
        billRange: 0
    });

    // Handle district card click
    const handleDistrictClick = (district) => {
        setSelectedDistrict(district.name); // keeping name for now to match leadsByDistrict key
    };

    // Update cities (clusters) when form district changes
    const [formCities, setFormCities] = useState([]);

    React.useEffect(() => {
        const fetchCities = async () => {
            if (formData.district) {
                const districtObj = districts.find(d => d.name === formData.district);
                if (districtObj) {
                    try {
                        const response = await locationAPI.getAllClusters({ districtId: districtObj._id, isActive: true });
                        if (response.data && response.data.data) {
                            setFormCities(response.data.data);
                        } else {
                            setFormCities([]);
                        }
                    } catch (error) {
                        console.error("Error fetching clusters:", error);
                        setFormCities([]);
                    }
                }
            } else {
                setFormCities([]);
            }
        };
        fetchCities();
    }, [formData.district, districts]);


    // Handle form input changes
    const handleInputChange = (e) => {
        const { id, value, type } = e.target;
        setFormData({
            ...formData,
            [id]: type === 'range' ? parseInt(value) : value
        });
    };

    // Handle radio button changes
    const handleRadioChange = (e) => {
        setFormData({
            ...formData,
            subType: e.target.id
        });
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        const { name, mobile, email, district, city, solarType, kw } = formData;

        // Check if district is selected
        if (!district) {
            alert('Please select a district');
            return;
        }

        // Create new lead
        const newLead = {
            name,
            mobile,
            email,
            city,
            solarType,
            kw,
            date: new Date().toLocaleDateString()
        };

        // Update leads for the district
        setLeadsByDistrict(prev => ({
            ...prev,
            [district]: [...(prev[district] || []), newLead]
        }));

        // Reset form
        setFormData({
            name: '',
            mobile: '',
            whatsapp: '',
            email: '',
            district: '',
            city: '',
            solarType: '',
            kw: '0 KW - Kilowatt',
            subType: '',
            billRange: 0
        });

        // Close modal
        setShowModal(false);
    };

    // Get current leads for selected district
    const currentLeads = selectedDistrict ? leadsByDistrict[selectedDistrict] || [] : [];

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-4">
                {/* Breadcrumb */}
                <div className="mb-4">
                    <nav className="bg-white rounded-lg shadow-sm p-4">
                        <ol className="flex items-center">
                            <li className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">CP Leads</h3>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* District Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {districts.map((district) => (
                        <div
                            key={district._id}
                            onClick={() => handleDistrictClick(district)}
                            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer ${selectedDistrict === district.name ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            <div className="p-6 text-center">
                                <MapPin className={`mx-auto mb-2 ${selectedDistrict === district.name ? 'text-blue-500' : 'text-gray-400'
                                    }`} size={24} />
                                <h5 className={`text-lg font-semibold ${selectedDistrict === district.name ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    {district.name}
                                </h5>
                                {leadsByDistrict[district.name] && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                        {leadsByDistrict[district.name].length} leads
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Leads Table Section */}
                <div id="leadsTableContainer" className="mt-6">
                    {selectedDistrict ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 bg-blue-50 border-b">
                                <h4 className="text-lg font-semibold text-blue-600">
                                    {selectedDistrict} Leads
                                </h4>
                            </div>

                            {currentLeads.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solar Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">kW</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentLeads.map((lead, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.mobile}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.city}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.solarType}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.kw}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">
                                        No leads added yet for <span className="font-semibold">{selectedDistrict}</span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <MapPin className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500">Select a district to view leads</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Lead Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
                <Plus size={24} />
            </button>

            {/* Lead Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h4 className="text-xl font-semibold text-gray-800">Create Lead</h4>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                {/* Name */}
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        id="name"
                                        placeholder="Person or Company Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {/* Mobile and WhatsApp */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            id="mobile"
                                            placeholder="Mobile"
                                            value={formData.mobile}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                            WhatsApp Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            id="whatsapp"
                                            placeholder="WhatsApp No"
                                            value={formData.whatsapp}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        id="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* District and City */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                                            District
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            id="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(district => (
                                                <option key={district._id} value={district.name}>{district.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            City/Cluster
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            id="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.district}
                                        >
                                            <option value="">Select City/Cluster</option>
                                            {formCities.map(city => (
                                                <option key={city._id} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Solar Type and KW */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="solarType" className="block text-sm font-medium text-gray-700 mb-1">
                                            Solar Type
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            id="solarType"
                                            value={formData.solarType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="kw" className="block text-sm font-medium text-gray-700 mb-1">
                                            Select KW
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            id="kw"
                                            value={formData.kw}
                                            onChange={handleInputChange}
                                        >
                                            <option>0 KW - Kilowatt</option>
                                            <option>1 KW</option>
                                            <option>2 KW</option>
                                            <option>5 KW</option>
                                            <option>10 KW</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Sub Type */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Sub Type
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-blue-600"
                                                name="subType"
                                                id="onGrid"
                                                checked={formData.subType === 'onGrid'}
                                                onChange={handleRadioChange}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">On Grid</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-blue-600"
                                                name="subType"
                                                id="offGrid"
                                                checked={formData.subType === 'offGrid'}
                                                onChange={handleRadioChange}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Off Grid</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-blue-600"
                                                name="subType"
                                                id="hybrid"
                                                checked={formData.subType === 'hybrid'}
                                                onChange={handleRadioChange}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Hybrid</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Electricity Bill */}
                                <div className="mb-6">
                                    <label htmlFor="bill" className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Electricity Bill Payment (Monthly): {formatCurrency(formData.billRange)}
                                    </label>
                                    <input
                                        type="range"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        id="bill"
                                        min="0"
                                        max="50000"
                                        step="500"
                                        value={formData.billRange}
                                        onChange={handleInputChange}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>₹0</span>
                                        <span>₹25,000</span>
                                        <span>₹50,000</span>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseLeads;