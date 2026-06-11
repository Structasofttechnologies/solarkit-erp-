import React, { useState } from 'react';
import {
    Gift,
    Tag,
    Calendar,
    Award,
    Zap,
    Sun,
    Cloud,
    Leaf,
    Sparkles,
    TrendingUp,
    Users,
    MapPin,
    X,
    ChevronRight,
    Clock,
    DollarSign,
    Home,
    Building,
    Star,
    Flame,
    Snowflake,
    Umbrella,
    PartyPopper,
    Eye // Add this missing import
} from 'lucide-react';

const FranchiseeManagerOffers = () => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Offer data organized by categories
    const offers = {
        solarBundles: [
            {
                id: 1,
                title: '5KW Solar Package',
                type: 'Bundle',
                badge: 'Bundle',
                category: 'solar',
                brand: 'Adani',
                projectType: 'Residential',
                cashback: '₹5,000',
                validUntil: '15 Nov 2025',
                color: 'orange',
                subscribers: [
                    { name: 'Mahesh Patel', taluka: 'Jasdan', totalKw: '25Kw', date: '15/07/2025' },
                    { name: 'Sanjay Vasani', taluka: 'Upleta', totalKw: '45Kw', date: '20/07/2025' },
                    { name: 'Umesh Yadav', taluka: 'Paddhari', totalKw: '20Kw', date: '15/07/2025' }
                ]
            },
            {
                id: 2,
                title: '10KW Commercial Package',
                type: 'Limited',
                badge: 'Limited',
                category: 'solar',
                brand: 'Adani',
                projectType: 'Commercial',
                cashback: '₹5,000',
                validUntil: '15 Nov 2025',
                color: 'red',
                subscribers: [
                    { name: 'Rajesh Kumar', taluka: 'Morbi', totalKw: '50Kw', date: '18/07/2025' },
                    { name: 'Amit Shah', taluka: 'Gondal', totalKw: '30Kw', date: '22/07/2025' }
                ]
            },
            {
                id: 3,
                title: '20KW Commercial Package',
                type: 'Limited',
                badge: 'Limited',
                category: 'solar',
                brand: 'Adani',
                projectType: 'Commercial',
                cashback: '₹5,000',
                validUntil: '15 Nov 2025',
                color: 'red',
                subscribers: [
                    { name: 'Vikram Singh', taluka: 'Rajkot', totalKw: '75Kw', date: '10/07/2025' }
                ]
            }
        ],
        festivalOffers: [
            {
                id: 4,
                title: 'Diwali Solar Special',
                type: 'Festival',
                badge: 'Diwali',
                category: 'festival',
                brand: 'Adani',
                projectType: 'Residential',
                cashback: '₹5,000',
                validUntil: '15 Nov 2025',
                color: 'purple',
                subscribers: [
                    { name: 'Paresh Raval', taluka: 'Tankara', totalKw: '15Kw', date: '05/07/2025' }
                ]
            },
            {
                id: 5,
                title: 'New Year Green Resolution',
                type: 'Festival',
                badge: 'New Year',
                category: 'festival',
                brand: 'Adani',
                projectType: 'Residential',
                cashback: '₹5,000',
                validUntil: '15 Nov 2025',
                color: 'purple',
                subscribers: [
                    { name: 'Darshan Mehta', taluka: 'Jasdan', totalKw: '22Kw', date: '12/07/2025' },
                    { name: 'Kiran Patel', taluka: 'Upleta', totalKw: '18Kw', date: '14/07/2025' }
                ]
            }
        ],
        seasonalOffers: [
            {
                id: 6,
                title: 'Monsoon Maintenance Pack',
                type: 'Seasonal',
                badge: 'Monsoon',
                category: 'seasonal',
                brand: 'Adani',
                projectType: 'Residential',
                cashback: '₹5,000',
                validUntil: '15 Nov 2025',
                color: 'green',
                subscribers: [
                    { name: 'Nilesh Parmar', taluka: 'Paddhari', totalKw: '12Kw', date: '08/07/2025' }
                ]
            },
            {
                id: 7,
                title: 'Summer Cooling Package',
                type: 'Seasonal',
                badge: 'Summer',
                category: 'seasonal',
                brand: 'Adani',
                projectType: 'Residential',
                cashback: '₹5,000',
                validUntil: '15 Nov 2025',
                color: 'green',
                subscribers: [
                    { name: 'Hitesh Vora', taluka: 'Gondal', totalKw: '28Kw', date: '19/07/2025' },
                    { name: 'Jayesh Dobariya', taluka: 'Morbi', totalKw: '32Kw', date: '21/07/2025' }
                ]
            }
        ]
    };

    const handleViewMore = (offer) => {
        setSelectedOffer(offer);
        setIsModalOpen(true);
    };

    // Get gradient based on offer color
    const getGradient = (color) => {
        switch (color) {
            case 'orange':
                return 'from-orange-500 to-red-500';
            case 'red':
                return 'from-red-500 to-red-700';
            case 'purple':
                return 'from-purple-500 to-purple-700';
            case 'green':
                return 'from-green-500 to-green-700';
            default:
                return 'from-blue-500 to-blue-700';
        }
    };

    // Get icon based on category
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'solar':
                return <Zap size={20} className="text-white" />;
            case 'festival':
                return <PartyPopper size={20} className="text-white" />;
            case 'seasonal':
                return <Umbrella size={20} className="text-white" />;
            default:
                return <Gift size={20} className="text-white" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header with Breadcrumb */}
                <div className="mb-6">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li className="text-gray-500 font-medium" aria-current="page">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <Gift className="mr-2 text-blue-500" size={28} />
                                    Current Offers
                                </h3>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* All Offers Tab */}
                <div className="space-y-8">
                    {/* Solar Panel Bundle Offers */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <Zap className="mr-2 text-orange-500" size={20} />
                            Solar Panel Bundle Offers
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offers.solarBundles.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                                >
                                    {/* Offer Header with Gradient */}
                                    <div className={`bg-gradient-to-r ${getGradient(offer.color)} p-4 relative`}>
                                        <span className="absolute top-2 right-2 bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                                            {offer.badge}
                                        </span>
                                        <h4 className="text-lg font-bold text-white pr-16">{offer.title}</h4>
                                    </div>

                                    {/* Offer Body */}
                                    <div className="p-4">
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Brand:</span> {offer.brand}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Project Type:</span> {offer.projectType}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Cashback:</span>
                                                <span className="text-green-600 font-bold ml-1">{offer.cashback}/Kw</span>
                                            </p>
                                        </div>

                                        {/* Offer Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar size={12} className="mr-1" />
                                                Valid until: {offer.validUntil}
                                            </div>
                                            <button
                                                onClick={() => handleViewMore(offer)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                            >
                                                <Eye size={12} className="mr-1" />
                                                View More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Festival Offers */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <PartyPopper className="mr-2 text-purple-500" size={20} />
                            Festival Offers
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offers.festivalOffers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                                >
                                    {/* Offer Header with Gradient */}
                                    <div className={`bg-gradient-to-r ${getGradient(offer.color)} p-4 relative`}>
                                        <span className="absolute top-2 right-2 bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                                            {offer.badge}
                                        </span>
                                        <h4 className="text-lg font-bold text-white pr-16">{offer.title}</h4>
                                    </div>

                                    {/* Offer Body */}
                                    <div className="p-4">
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Brand:</span> {offer.brand}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Project Type:</span> {offer.projectType}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Cashback:</span>
                                                <span className="text-green-600 font-bold ml-1">{offer.cashback}/Kw</span>
                                            </p>
                                        </div>

                                        {/* Offer Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar size={12} className="mr-1" />
                                                Valid until: {offer.validUntil}
                                            </div>
                                            <button
                                                onClick={() => handleViewMore(offer)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                            >
                                                <Eye size={12} className="mr-1" />
                                                View More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Seasonal Offers */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <Umbrella className="mr-2 text-green-500" size={20} />
                            Seasonal Offers
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offers.seasonalOffers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                                >
                                    {/* Offer Header with Gradient */}
                                    <div className={`bg-gradient-to-r ${getGradient(offer.color)} p-4 relative`}>
                                        <span className="absolute top-2 right-2 bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                                            {offer.badge}
                                        </span>
                                        <h4 className="text-lg font-bold text-white pr-16">{offer.title}</h4>
                                    </div>

                                    {/* Offer Body */}
                                    <div className="p-4">
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Brand:</span> {offer.brand}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Project Type:</span> {offer.projectType}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Cashback:</span>
                                                <span className="text-green-600 font-bold ml-1">{offer.cashback}/Kw</span>
                                            </p>
                                        </div>

                                        {/* Offer Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar size={12} className="mr-1" />
                                                Valid until: {offer.validUntil}
                                            </div>
                                            <button
                                                onClick={() => handleViewMore(offer)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                            >
                                                <Eye size={12} className="mr-1" />
                                                View More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subscriber Modal */}
                {isModalOpen && selectedOffer && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xl font-semibold text-gray-800">
                                        {selectedOffer.title} - Subscribers
                                    </h4>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Offer Summary */}
                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Brand</p>
                                            <p className="font-semibold">{selectedOffer.brand}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Project Type</p>
                                            <p className="font-semibold">{selectedOffer.projectType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Cashback</p>
                                            <p className="font-semibold text-green-600">{selectedOffer.cashback}/Kw</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Valid Until</p>
                                            <p className="font-semibold">{selectedOffer.validUntil}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Franchisee Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Taluka
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Total Kw
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedOffer.subscribers.map((subscriber, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{subscriber.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{subscriber.taluka}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{subscriber.totalKw}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{subscriber.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                        Export List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Offers</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {offers.solarBundles.length + offers.festivalOffers.length + offers.seasonalOffers.length}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Gift size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active Subscribers</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {[...offers.solarBundles, ...offers.festivalOffers, ...offers.seasonalOffers]
                                        .reduce((acc, offer) => acc + offer.subscribers.length, 0)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <Users size={20} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Kw Subscribed</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {[...offers.solarBundles, ...offers.festivalOffers, ...offers.seasonalOffers]
                                        .reduce((acc, offer) =>
                                            acc + offer.subscribers.reduce((sum, sub) =>
                                                sum + parseInt(sub.totalKw), 0), 0)} Kw
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <Zap size={20} className="text-orange-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Cashback</p>
                                <p className="text-2xl font-bold text-purple-600">₹4.5L</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <DollarSign size={20} className="text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerOffers;