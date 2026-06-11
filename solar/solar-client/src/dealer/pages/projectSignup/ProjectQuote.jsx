import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Box,
    ArrowRight,
    X,
    Wrench,
    Zap,
    Minus,
    Plus,
    ChevronRight,
    Package,
    Award,
    Calendar,
    Home,
    TrendingUp,
    Search,
    Loader,
    Phone
} from 'lucide-react';

import { locationAPI, leadAPI } from '../../../api/api';

const DealerProjectQuote = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [districts, setDistricts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch districts on mount
    useEffect(() => {
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

    // Fetch leads
    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
                status: 'SurveyCompleted' // Usually we generate quote after survey
            };
            // For demo purposes, if no leads in SurveyCompleted, maybe show all or New
            // But let's stick to logic. If empty, user sees empty.
            // Or we can just fetch all and filter client side if API doesn't support complex OR queries easily yet
            const response = await leadAPI.getAllLeads(params);
            if (response.data && response.data.data) {
                setLeads(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLeads();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedDistrict]);


    // State for quantity counters in modal
    const [quantities, setQuantities] = useState({
        pipe60x40: 4,
        pipe50x40: 4,
        pipe40x40: 4,
        lAngle: 15,
        americanBolt: 12,
        dcWire: 25,
        acWire: 20
    });

    // State for commission and discount
    const [commission, setCommission] = useState(3000);
    const [discount, setDiscount] = useState(1000);

    // Handle quantity changes
    const increaseQuantity = (key) => {
        setQuantities(prev => ({ ...prev, [key]: prev[key] + 1 }));
    };

    const decreaseQuantity = (key) => {
        setQuantities(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
    };

    // Calculate totals - Dummy prices for now
    const pipeTotal = (quantities.pipe60x40 * 1200) + (quantities.pipe50x40 * 1000) + (quantities.pipe40x40 * 800);
    const accessoriesTotal = (quantities.lAngle * 150) + (quantities.americanBolt * 25);
    const wiresTotal = (quantities.dcWire * 45) + (quantities.acWire * 35);
    const subTotal = pipeTotal + accessoriesTotal + wiresTotal;
    const netAmount = subTotal + commission - discount;

    const handleCreateQuote = (lead) => {
        setSelectedLead(lead);
        setShowModal(true);
    };

    const handleSubmitQuote = async () => {
        if (!selectedLead) return;
        try {
            // Here we would typically save the Quote Details to a separate Quote model
            // For now, we update the Lead status to 'QuoteGenerated'
            // and maybe save the quote amount in billAmount or a new field if we added one (we didn't yet)

            await leadAPI.updateLead(selectedLead._id, {
                status: 'QuoteGenerated',
                quote: {
                    totalAmount: subTotal,
                    commission: commission,
                    discount: discount,
                    netAmount: netAmount,
                    systemSize: selectedLead.kw,
                    generatedAt: new Date()
                }
            });

            alert(`Quote generated successfully for ${selectedLead.name}!`);
            setShowModal(false);
            fetchLeads(); // Refresh list
        } catch (error) {
            console.error("Error generating quote:", error);
            alert("Failed to generate quote");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-6 bg-white shadow-sm border-b">
                <div className="container-fluid px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Project Quote</h2>
                </div>
            </div>

            <div className="container-fluid px-6 max-w-5xl mx-auto">
                {/* District Pills Filter */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => setSelectedDistrict('All')}
                        className={`py-3 px-4 rounded-sm text-center font-medium shadow-sm border transition-colors ${selectedDistrict === 'All' ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                    {/* Hardcoding explicit popular locations seen in mockup for aesthetic demonstration if districts array is empty */}
                    {districts.slice(0, 7).map(d => (
                        <button
                            key={d._id}
                            onClick={() => setSelectedDistrict(d._id)}
                            className={`py-3 px-4 rounded-sm text-center font-medium shadow-sm border transition-colors ${selectedDistrict === d._id ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {d.name}
                        </button>
                    ))}
                    {districts.length === 0 && (
                        <>
                            <button className="py-3 px-4 rounded-sm text-center font-medium bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50">Rajkot</button>
                            <button className="py-3 px-4 rounded-sm text-center font-medium bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50">Jamnagar</button>
                            <button className="py-3 px-4 rounded-sm text-center font-medium bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50">Ahmedabad</button>
                            <button className="py-3 px-4 rounded-sm text-center font-medium bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50">Surat</button>
                            <button className="py-3 px-4 rounded-sm text-center font-medium bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50">Vadodara</button>
                        </>
                    )}
                </div>

                {/* Lead List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : leads.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-sm">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-medium">No leads pending for quote</p>
                        <p className="text-sm mt-2">Leads with 'SurveyCompleted' status will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4 mb-8">
                        {leads.map((lead) => (
                            <div key={lead._id} className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden hover:border-[#0ea5e9] transition-colors relative">
                                {/* Completed Badge Top Right */}
                                <div className="absolute top-4 right-4">
                                    <span className="bg-[#22c55e] text-white text-[10px] font-bold px-3 py-1 rounded-sm tracking-wider">
                                        COMPLETED
                                    </span>
                                </div>

                                <div className="p-6">
                                    {/* Header Row */}
                                    <div className="flex items-center mb-5">
                                        <div className="hidden h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-3">
                                            {lead.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 overflow-hidden">
                                            <img src={`https://ui-avatars.com/api/?name=${lead.name.replace(' ', '+')}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{lead.name}</h3>
                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                <MapPin size={10} className="mr-1" />
                                                123 Main St, {lead.city?.name || lead.district?.name || 'Mumbai'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <div className="bg-[#facc15] text-black text-xs font-semibold px-3 py-1 rounded-sm shadow-sm border border-yellow-400">
                                            {lead.kw} kW Recommended
                                        </div>
                                        <div className="bg-[#0ea5e9] text-white text-xs font-semibold px-3 py-1 rounded-sm shadow-sm border border-blue-400">
                                            Survey: {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="bg-[#22c55e] text-white text-xs font-semibold px-3 py-1 rounded-sm shadow-sm border border-green-500">
                                            Roof: RCC
                                        </div>
                                    </div>

                                    {/* Footer Row */}
                                    <div className="flex justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-100">
                                        <div className="flex items-center text-sm font-semibold text-gray-700">
                                            <Package size={16} className="mr-2 text-gray-500" />
                                            Kit: {lead.kw}kW (Adani)
                                        </div>
                                        <button
                                            onClick={() => handleCreateQuote(lead)}
                                            className="bg-[#0ea5e9] hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-sm flex items-center transition-colors shadow-sm"
                                        >
                                            Calculate Survey Quotation <ArrowRight size={14} className="ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quote Modal */}
            {showModal && selectedLead && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900 z-10 bg-white rounded-full p-1 shadow-sm">
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="space-y-6">
                                {/* Standard Pipes Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                        <Wrench className="mr-2 text-gray-600" size={16} />
                                        Standard Pipes
                                    </h3>
                                    <div className="border border-gray-200 rounded-sm overflow-hidden">
                                        <table className="w-full text-sm text-center">
                                            <thead className="bg-[#7dd3fc] text-white">
                                                <tr>
                                                    <th className="py-2 px-4 font-semibold text-left">Item</th>
                                                    <th className="py-2 px-4 font-semibold">Qty</th>
                                                    <th className="py-2 px-4 font-semibold">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="py-3 px-4 text-left font-medium text-gray-700">60 x 40</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => decreaseQuantity('pipe60x40')} className="text-gray-400 hover:text-gray-700"><Minus size={12} /></button>
                                                            <span className="w-4">{quantities.pipe60x40}</span>
                                                            <button onClick={() => increaseQuantity('pipe60x40')} className="text-gray-400 hover:text-gray-700"><Plus size={12} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">₹{(quantities.pipe60x40 * 1200).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-left font-medium text-gray-700">50 x 40</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => decreaseQuantity('pipe50x40')} className="text-gray-400 hover:text-gray-700"><Minus size={12} /></button>
                                                            <span className="w-4">{quantities.pipe50x40}</span>
                                                            <button onClick={() => increaseQuantity('pipe50x40')} className="text-gray-400 hover:text-gray-700"><Plus size={12} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">₹{(quantities.pipe50x40 * 1000).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-left font-medium text-gray-700">40 x 40</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => decreaseQuantity('pipe40x40')} className="text-gray-400 hover:text-gray-700"><Minus size={12} /></button>
                                                            <span className="w-4">{quantities.pipe40x40}</span>
                                                            <button onClick={() => increaseQuantity('pipe40x40')} className="text-gray-400 hover:text-gray-700"><Plus size={12} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">₹{(quantities.pipe40x40 * 800).toLocaleString()}</td>
                                                </tr>
                                                <tr className="bg-[#e0f2fe] font-medium">
                                                    <td className="py-2 px-4 text-left text-gray-800">Total KG :</td>
                                                    <td className="py-2 px-4 text-gray-800">20</td>
                                                    <td className="py-2 px-4"></td>
                                                </tr>
                                                <tr className="bg-[#e0f2fe] font-medium border-t-0">
                                                    <td className="py-2 px-4 text-left text-gray-800">Total Rs :</td>
                                                    <td className="py-2 px-4"></td>
                                                    <td className="py-2 px-4 text-gray-800">₹{pipeTotal.toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Accessories Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                        <Package className="mr-2 text-gray-600" size={16} />
                                        Accessories
                                    </h3>
                                    <div className="border border-gray-200 rounded-sm overflow-hidden">
                                        <table className="w-full text-sm text-center">
                                            <thead className="bg-[#7dd3fc] text-white">
                                                <tr>
                                                    <th className="py-2 px-4 font-semibold text-left">Item</th>
                                                    <th className="py-2 px-4 font-semibold">Qty</th>
                                                    <th className="py-2 px-4 font-semibold">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="py-3 px-4 text-left font-medium text-gray-700">L-Angle</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => decreaseQuantity('lAngle')} className="text-gray-400 hover:text-gray-700"><Minus size={12} /></button>
                                                            <span className="w-4">{quantities.lAngle}</span>
                                                            <button onClick={() => increaseQuantity('lAngle')} className="text-gray-400 hover:text-gray-700"><Plus size={12} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">₹{(quantities.lAngle * 150).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-left font-medium text-gray-700">American Bolt</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => decreaseQuantity('americanBolt')} className="text-gray-400 hover:text-gray-700"><Minus size={12} /></button>
                                                            <span className="w-4">{quantities.americanBolt}</span>
                                                            <button onClick={() => increaseQuantity('americanBolt')} className="text-gray-400 hover:text-gray-700"><Plus size={12} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">₹{(quantities.americanBolt * 25).toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Wires Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                        <Zap className="mr-2 text-gray-600" size={16} />
                                        Wire
                                    </h3>
                                    <div className="border border-gray-200 rounded-sm overflow-hidden">
                                        <table className="w-full text-sm text-center">
                                            <thead className="bg-[#7dd3fc] text-white">
                                                <tr>
                                                    <th className="py-2 px-4 font-semibold text-left">Item</th>
                                                    <th className="py-2 px-4 font-semibold">Qty</th>
                                                    <th className="py-2 px-4 font-semibold">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="py-3 px-4 text-left font-medium text-gray-700">DC Wire</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => decreaseQuantity('dcWire')} className="text-gray-400 hover:text-gray-700"><Minus size={12} /></button>
                                                            <span className="w-4">{quantities.dcWire}</span>
                                                            <button onClick={() => increaseQuantity('dcWire')} className="text-gray-400 hover:text-gray-700"><Plus size={12} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">₹{(quantities.dcWire * 45).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4 text-left font-medium text-gray-700">AC Wire</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button onClick={() => decreaseQuantity('acWire')} className="text-gray-400 hover:text-gray-700"><Minus size={12} /></button>
                                                            <span className="w-4">{quantities.acWire}</span>
                                                            <button onClick={() => increaseQuantity('acWire')} className="text-gray-400 hover:text-gray-700"><Plus size={12} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">₹{(quantities.acWire * 35).toLocaleString()}</td>
                                                </tr>
                                                <tr className="bg-[#e0f2fe] font-medium">
                                                    <td className="py-2 px-4 text-left text-gray-800">Total KG :</td>
                                                    <td className="py-2 px-4 text-gray-800">45</td>
                                                    <td className="py-2 px-4"></td>
                                                </tr>
                                                <tr className="bg-[#e0f2fe] font-medium border-t-0">
                                                    <td className="py-2 px-4 text-left text-gray-800">Total Rs :</td>
                                                    <td className="py-2 px-4"></td>
                                                    <td className="py-2 px-4 text-gray-800">₹{wiresTotal.toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Additional Charges & Discounts */}
                                <div className="bg-[#bae6fd] p-6 rounded-sm">
                                    <h3 className="text-sm font-bold text-gray-800 mb-4">Additional Charges & Discounts</h3>
                                    <div className="grid grid-cols-2 gap-8 mb-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">Commission Amount (₹)</label>
                                            <input
                                                type="number"
                                                value={commission}
                                                onChange={(e) => setCommission(parseInt(e.target.value) || 0)}
                                                className="w-full p-2 text-sm border-none rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">Discount Amount (₹)</label>
                                            <input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                                                className="w-full p-2 text-sm border-none rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-4 rounded-sm shadow-sm">
                                        <div className="text-xs font-bold text-gray-800">
                                            <div className="text-green-600 mb-1">Commission : ₹{commission.toLocaleString()}</div>
                                            <div className="text-red-600">Discount : ₹{discount.toLocaleString()}</div>
                                        </div>
                                        <div className="text-sm font-bold text-green-600">
                                            Net Amount : ₹{netAmount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Final Total Summary Footer */}
                                <div className="bg-[#0284c7] text-white p-6 rounded-sm text-sm font-bold flex justify-between items-center shadow-md">
                                    <div className="space-y-1">
                                        <div>Sub Total :</div>
                                        <div>Commission :</div>
                                        <div>Discount :</div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div>₹{subTotal.toLocaleString()}</div>
                                        <div className="text-green-300">+ ₹{commission.toLocaleString()}</div>
                                        <div className="text-red-300">- ₹{discount.toLocaleString()}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmitQuote}
                                    className="w-full bg-[#0ea5e9] hover:bg-blue-600 text-white font-bold py-4 rounded-sm transition-colors shadow-sm"
                                >
                                    Calculate Final Survey Quotation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerProjectQuote;