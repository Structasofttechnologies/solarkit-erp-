import React, { useState, useEffect } from 'react';
import { X, Loader2, Edit2, Trash2, Check, Plus } from 'lucide-react';
import { productApi } from '../../../../api/productApi';

const ManageTechnologyModal = ({ isOpen, onClose, onSuccess, showToast }) => {
    const [technologies, setTechnologies] = useState([]);
    const [brands, setBrands] = useState([]);
    const [subProjectTypes, setSubProjectTypes] = useState([]);
    
    const [loading, setLoading] = useState(false);
    
    // Add form
    const [newTechnologyName, setNewTechnologyName] = useState('');
    const [selectedBrandForTech, setSelectedBrandForTech] = useState('');
    const [selectedSubProjectTypeForTech, setSelectedSubProjectTypeForTech] = useState('');

    // Edit form
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [techRes, brandRes, subPTRes] = await Promise.all([
                productApi.getTechnologies(),
                productApi.getBrands(),
                productApi.getSubProjectTypes()
            ]);
            
            setTechnologies(techRes?.data?.data || []);
            setBrands(Array.isArray(brandRes?.data) ? brandRes.data : brandRes?.data?.data || []);
            setSubProjectTypes(subPTRes?.data?.data || []);
        } catch (error) {
            console.error("Error fetching technology data:", error);
            showToast("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newTechnologyName.trim()) return showToast("Technology name is required", "error");

        try {
            await productApi.createTechnology({
                name: newTechnologyName.trim(),
                brandId: selectedBrandForTech || null,
                subProjectTypeId: selectedSubProjectTypeForTech || null
            });
            showToast("Technology added");
            setNewTechnologyName('');
            fetchData();
            if (onSuccess) onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to add technology", "error");
        }
    };

    const handleEditStart = (item) => {
        setEditingItem({
            id: item._id,
            name: item.name,
            brandId: item.brandId?._id || item.brandId || '',
            subProjectTypeId: item.subProjectTypeId?._id || item.subProjectTypeId || ''
        });
    };

    const handleEditSave = async () => {
        if (!editingItem?.name.trim()) return showToast("Name is required", "error");
        
        try {
            const item = technologies.find(c => c._id === editingItem.id);
            await productApi.updateTechnology(editingItem.id, { 
                ...item, 
                name: editingItem.name.trim(),
                brandId: editingItem.brandId,
                subProjectTypeId: editingItem.subProjectTypeId
            });
            showToast("Technology updated");
            setEditingItem(null);
            fetchData();
            if (onSuccess) onSuccess();
        } catch (err) {
            showToast("Failed to update", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this technology?")) return;
        try {
            await productApi.deleteTechnology(id);
            showToast("Technology deleted");
            fetchData();
            if (onSuccess) onSuccess();
        } catch (err) {
            showToast("Delete failed", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-blue-600">Manage Product Technology</h2>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {/* Add Section */}
                    <div className="bg-white p-4 rounded shadow-sm border border-gray-100 mb-6">
                        <h3 className="text-[#0073B7] font-bold text-[15px] mb-3">Add New Technology</h3>
                        <div className="flex flex-col md:flex-row gap-2">
                            <select
                                className="border border-gray-300 rounded px-2 py-2 outline-none text-sm focus:border-[#0073B7] flex-1 md:max-w-[150px]"
                                value={selectedBrandForTech}
                                onChange={(e) => setSelectedBrandForTech(e.target.value)}
                            >
                                <option value="">Select Brand</option>
                                {brands.map(c => <option key={c._id} value={c._id}>{c.brand || c.companyName || c.name}</option>)}
                            </select>
                            
                            <select
                                className="border border-gray-300 rounded px-2 py-2 outline-none text-sm focus:border-[#0073B7] flex-1 md:max-w-[150px]"
                                value={selectedSubProjectTypeForTech}
                                onChange={(e) => setSelectedSubProjectTypeForTech(e.target.value)}
                            >
                                <option value="">Select Sub PT</option>
                                {subProjectTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>

                            <input
                                type="text"
                                className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#0073B7] text-sm flex-1"
                                placeholder="Technology Name"
                                value={newTechnologyName}
                                onChange={(e) => setNewTechnologyName(e.target.value)}
                            />
                            <button
                                onClick={handleAdd}
                                className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded py-2 flex items-center justify-center font-medium text-sm transition-colors whitespace-nowrap"
                            >
                                <Plus size={16} className="mr-1" /> Add
                            </button>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="bg-white rounded shadow-sm border border-gray-100">
                        <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                            <h4 className="font-semibold text-gray-700 text-sm">Existing Technologies</h4>
                            {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
                        </div>
                        <div className="p-0">
                            {technologies.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm italic">
                                    No technologies found.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
                                    {technologies.map((item, idx) => (
                                        <div key={item._id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition">
                                            {editingItem?.id === item._id ? (
                                                <div className="flex-1 flex flex-col md:flex-row gap-2 mr-4">
                                                    <input 
                                                        type="text" 
                                                        className="flex-1 border border-[#6F42C1] rounded px-2 py-1.5 text-sm outline-none focus:border-[#5a32a3]"
                                                        value={editingItem.name}
                                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                        autoFocus
                                                        placeholder="Name"
                                                    />
                                                    <select
                                                        className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-[#5a32a3]"
                                                        value={editingItem.brandId || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, brandId: e.target.value })}
                                                    >
                                                        <option value="">Select Brand</option>
                                                        {brands.map(c => <option key={c._id} value={c._id}>{c.brand || c.companyName || c.name}</option>)}
                                                    </select>
                                                    <select
                                                        className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-[#5a32a3]"
                                                        value={editingItem.subProjectTypeId || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, subProjectTypeId: e.target.value })}
                                                    >
                                                        <option value="">Select Sub PT</option>
                                                        {subProjectTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-800">{idx + 1}. {item.name}</span>
                                                    {(item.brandId?.brand || item.brandId?.companyName || item.brandId?.name || item.subProjectTypeId?.name) && (
                                                        <div className="flex gap-2 mt-1 flex-wrap">
                                                            {(item.brandId?.brand || item.brandId?.companyName || item.brandId?.name) && (
                                                                <span className="text-[10px] text-gray-600 bg-gray-100 rounded px-2 py-0.5 border border-gray-200">Brand: {item.brandId.brand || item.brandId.companyName || item.brandId.name}</span>
                                                            )}
                                                            {item.subProjectTypeId?.name && (
                                                                <span className="text-[10px] text-gray-600 bg-gray-100 rounded px-2 py-0.5 border border-gray-200">Sub PT: {item.subProjectTypeId.name}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                {editingItem?.id === item._id ? (
                                                    <>
                                                        <button onClick={handleEditSave} className="text-green-600 hover:bg-green-50 p-1.5 rounded"><Check size={16} /></button>
                                                        <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded"><X size={16} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditStart(item)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>
                                                        <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTechnologyModal;
