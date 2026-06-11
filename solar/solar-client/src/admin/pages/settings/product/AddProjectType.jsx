import React, { useState, useEffect } from 'react';
import { Search, Save, Edit2, Trash2, CheckCircle, AlertCircle, Loader2, Plus, X, Check } from 'lucide-react';
import { productApi } from '../../../../api/productApi';

const AddProjectType = () => {
    // Data States
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subProjectTypes, setSubProjectTypes] = useState([]);

    // Loading & UI States
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Form Inputs
    const [newCategoryName, setNewCategoryName] = useState('');

    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [selectedCategoryForSubCat, setSelectedCategoryForSubCat] = useState('');

    const [newSubProjectTypeName, setNewSubProjectTypeName] = useState('');
    const [selectedSubCategoryForSubPT, setSelectedSubCategoryForSubPT] = useState('');

    // Editing State
    const [editingItem, setEditingItem] = useState(null);

    const handleEditStart = (type, item) => {
        setEditingItem({ 
            id: item._id, 
            name: item.name, 
            type,
            ...(type === 'subCat' ? { categoryId: item.categoryId?._id || item.category?._id || item.categoryId || '' } : {}),
            ...(type === 'subPT' ? { subCategoryId: item.subCategoryId?._id || item.subCategory?._id || item.subCategoryId || '' } : {})
        });
    };

    const handleEditCancel = () => {
        setEditingItem(null);
    };

    const handleEditSave = async () => {
        if (!editingItem?.name.trim()) return showToast("Name is required", "error");
        
        try {
            if (editingItem.type === 'cat') {
                const item = categories.find(c => c._id === editingItem.id);
                await productApi.updateCategory(editingItem.id, { ...item, name: editingItem.name.trim() });
            } else if (editingItem.type === 'subCat') {
                const item = subCategories.find(c => c._id === editingItem.id);
                await productApi.updateSubCategory(editingItem.id, { 
                    ...item, 
                    name: editingItem.name.trim(),
                    categoryId: editingItem.categoryId 
                });
            } else if (editingItem.type === 'subPT') {
                const item = subProjectTypes.find(c => c._id === editingItem.id);
                await productApi.updateSubProjectType(editingItem.id, { 
                    ...item, 
                    name: editingItem.name.trim(),
                    subCategoryId: editingItem.subCategoryId 
                });
            }
            showToast("Updated successfully");
            setEditingItem(null);
            fetchInitialData();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update item", "error");
        }
    };

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [catRes, subPTypeRes, subCatRes] = await Promise.all([
                productApi.getCategories(),
                productApi.getSubProjectTypes(),
                productApi.getSubCategories()
            ]);

            const cats = catRes?.data?.data || [];
            const subCats = subCatRes?.data?.data || [];

            setCategories(cats);
            setSubProjectTypes(subPTypeRes?.data?.data || []);
            setSubCategories(subCats);

            // Set initial dropdown values if available
            if (cats.length > 0) {
                setSelectedCategoryForSubCat(cats[0]._id);
            }
            if (subCats.length > 0) {
                setSelectedSubCategoryForSubPT(subCats[0]._id);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch master data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return showToast("Category name is required", "error");
        try {
            await productApi.createCategory({
                name: newCategoryName.trim()
            });
            showToast("Category added");
            setNewCategoryName('');
            fetchInitialData();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to add category", "error");
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategoryName.trim()) return showToast("Sub Category name is required", "error");
        if (!selectedCategoryForSubCat) return showToast("Category selection is required", "error");

        try {
            await productApi.createSubCategory({
                name: newSubCategoryName.trim(),
                categoryId: selectedCategoryForSubCat
            });
            showToast("Sub Category added");
            setNewSubCategoryName('');
            fetchInitialData();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to add sub-category", "error");
        }
    };

    const handleAddSubProjectType = async () => {
        if (!newSubProjectTypeName.trim()) return showToast("Sub Project Type name is required", "error");
        if (!selectedSubCategoryForSubPT) return showToast("Sub Category selection is required", "error");

        try {
            await productApi.createSubProjectType({
                name: newSubProjectTypeName.trim(),
                subCategoryId: selectedSubCategoryForSubPT
            });
            showToast("Sub Project Type added");
            setNewSubProjectTypeName('');
            fetchInitialData();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to add sub-project type", "error");
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            if (type === 'cat') await productApi.deleteCategory(id);
            if (type === 'subCat') await productApi.deleteSubCategory(id);
            if (type === 'subPT') await productApi.deleteSubProjectType(id);
            showToast("Item deleted");
            fetchInitialData();
        } catch (err) {
            showToast("Delete failed", "error");
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl font-sans mt-4">
            {/* Toasts */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(t => (
                    <div key={t.id} className={`p-4 rounded-lg shadow-lg flex items-center gap-2 text-white transition-all animate-fadeIn ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {t.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {t.message}
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden mb-6 border border-gray-200">
                {/* Header */}
                <div className="bg-[#0073B7] py-3 text-center">
                    <h2 className="text-white font-semibold text-lg">Add Category Type</h2>
                </div>

                <div className="p-6">
                    {/* Input Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mb-8">
                        {/* Category */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[#0073B7] font-bold text-[15px]">Category</h3>
                            </div>
                            <div className="flex h-10">
                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-l px-3 w-full outline-none focus:border-[#0073B7] text-sm"
                                    placeholder="Enter Category Name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <button
                                    onClick={handleAddCategory}
                                    className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded-r flex items-center justify-center font-medium text-sm transition-colors"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>

                        {/* Sub Category */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[#0073B7] font-bold text-[15px]">Sub Category</h3>
                                <div className="flex gap-1">
                                    <select
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-500 bg-transparent"
                                        value={selectedCategoryForSubCat}
                                        onChange={(e) => setSelectedCategoryForSubCat(e.target.value)}
                                    >
                                        <option value="">Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex h-10">
                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-l px-3 w-full outline-none focus:border-[#0073B7] text-sm"
                                    placeholder="Enter Sub Category Name"
                                    value={newSubCategoryName}
                                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                                />
                                <button
                                    onClick={handleAddSubCategory}
                                    className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded-r flex items-center justify-center font-medium text-sm transition-colors"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>

                        {/* Sub Project Type */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[#0073B7] font-bold text-[15px]">Sub Project Type</h3>
                                <div className="flex gap-1">
                                    <select
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-500 bg-transparent"
                                        value={selectedSubCategoryForSubPT}
                                        onChange={(e) => setSelectedSubCategoryForSubPT(e.target.value)}
                                    >
                                        <option value="">Sub Category</option>
                                        {subCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex h-10">
                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-l px-3 w-full outline-none focus:border-[#0073B7] text-sm"
                                    placeholder="Enter Sub Project Type"
                                    value={newSubProjectTypeName}
                                    onChange={(e) => setNewSubProjectTypeName(e.target.value)}
                                />
                                <button
                                    onClick={handleAddSubProjectType}
                                    className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded-r flex items-center justify-center font-medium text-sm transition-colors"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Category Summary */}
                        <div className="border border-[#0073B7] rounded-md overflow-hidden bg-white">
                            <div className="bg-[#0073B7] text-white py-2 text-center font-semibold text-sm">
                                Category Summary
                            </div>
                            <div className="p-3 overflow-y-auto min-h-[150px] max-h-[300px]">
                                {categories.length === 0 ? (
                                    <div className="text-gray-400 text-center py-6 text-sm">No categories</div>
                                ) : (
                                    categories.map((item, idx) => (
                                        <div key={item._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 border-dashed">
                                            {editingItem?.id === item._id && editingItem?.type === 'cat' ? (
                                                <div className="flex-1 flex items-center gap-2 mr-4">
                                                    <span className="text-sm text-gray-800">{idx + 1}.</span>
                                                    <input 
                                                        type="text" 
                                                        className="flex-1 border border-blue-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                                                        value={editingItem.name}
                                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-800">{idx + 1}. {item.name}</span>
                                            )}
                                            
                                            <div className="flex items-center gap-4">
                                                {editingItem?.id === item._id && editingItem?.type === 'cat' ? (
                                                    <>
                                                        <button onClick={handleEditSave} className="text-green-500 flex items-center gap-1 text-[13px] font-medium hover:text-green-600 transition-colors">
                                                            <Check size={14} strokeWidth={2.5} /> Save
                                                        </button>
                                                        <button onClick={handleEditCancel} className="text-gray-500 flex items-center gap-1 text-[13px] font-medium hover:text-gray-600 transition-colors">
                                                            <X size={14} strokeWidth={2.5} /> Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditStart('cat', item)} className="text-orange-500 flex items-center gap-1 text-[13px] font-medium hover:text-orange-600 transition-colors">
                                                            <Edit2 size={12} strokeWidth={2.5} /> Edit
                                                        </button>
                                                        <button onClick={() => handleDelete('cat', item._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center justify-center">
                                                            <div className="w-[15px] h-[15px] rounded-full border-2 border-red-500 flex items-center justify-center">
                                                                <X size={10} strokeWidth={3} className="text-red-500" />
                                                            </div>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sub Category Summary */}
                        <div className="border border-[#28A745] rounded-md overflow-hidden bg-white">
                            <div className="bg-[#28A745] text-white py-2 text-center font-semibold text-sm">
                                Sub Category Summary
                            </div>
                            <div className="p-3 overflow-y-auto min-h-[150px] max-h-[300px]">
                                {subCategories.length === 0 ? (
                                    <div className="text-gray-400 text-center py-6 text-sm">No sub categories</div>
                                ) : (
                                    subCategories.map((item, idx) => (
                                        <div key={item._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 border-dashed">
                                            {editingItem?.id === item._id && editingItem?.type === 'subCat' ? (
                                                <div className="flex-1 flex flex-col gap-2 mr-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-800">{idx + 1}.</span>
                                                        <input 
                                                            type="text" 
                                                            className="flex-1 border border-[#28A745] rounded px-2 py-1 text-sm outline-none focus:border-[#218838]"
                                                            value={editingItem.name}
                                                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                            placeholder="Sub Category Name"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-4">
                                                        <select
                                                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#218838] bg-white"
                                                            value={editingItem.categoryId || ''}
                                                            onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                                                        >
                                                            <option value="">Select Category</option>
                                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-800">{idx + 1}. {item.name}</span>
                                                    {(item.categoryId?.name || item.category?.name) && (
                                                        <span className="text-[10px] text-gray-500 pl-4 bg-gray-50 rounded mt-0.5 max-w-max px-1 border border-gray-100">{item.categoryId?.name || item.category?.name}</span>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-4">
                                                {editingItem?.id === item._id && editingItem?.type === 'subCat' ? (
                                                    <>
                                                        <button onClick={handleEditSave} className="text-green-500 flex items-center gap-1 text-[13px] font-medium hover:text-green-600 transition-colors">
                                                            <Check size={14} strokeWidth={2.5} /> Save
                                                        </button>
                                                        <button onClick={handleEditCancel} className="text-gray-500 flex items-center gap-1 text-[13px] font-medium hover:text-gray-600 transition-colors">
                                                            <X size={14} strokeWidth={2.5} /> Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditStart('subCat', item)} className="text-orange-500 flex items-center gap-1 text-[13px] font-medium hover:text-orange-600 transition-colors">
                                                            <Edit2 size={12} strokeWidth={2.5} /> Edit
                                                        </button>
                                                        <button onClick={() => handleDelete('subCat', item._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center justify-center">
                                                            <div className="w-[15px] h-[15px] rounded-full border-2 border-red-500 flex items-center justify-center">
                                                                <X size={10} strokeWidth={3} className="text-red-500" />
                                                            </div>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sub Project Type Summary */}
                        <div className="border border-[#FFC107] rounded-md overflow-hidden bg-white">
                            <div className="bg-[#FFC107] text-[#333] py-2 text-center font-semibold text-sm">
                                Sub Project Type Summary
                            </div>
                            <div className="p-3 overflow-y-auto min-h-[150px] max-h-[300px]">
                                {subProjectTypes.length === 0 ? (
                                    <div className="text-gray-400 text-center py-6 text-sm">No sub project types</div>
                                ) : (
                                    subProjectTypes.map((item, idx) => (
                                        <div key={item._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 border-dashed">
                                            {editingItem?.id === item._id && editingItem?.type === 'subPT' ? (
                                                <div className="flex-1 flex flex-col gap-2 mr-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-800">{idx + 1}.</span>
                                                        <input 
                                                            type="text" 
                                                            className="flex-1 border border-[#FFC107] rounded px-2 py-1 text-sm outline-none focus:border-[#E0A800]"
                                                            value={editingItem.name}
                                                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                            placeholder="Sub Project Type Name"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-4">
                                                        <select
                                                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#E0A800] bg-white"
                                                            value={editingItem.subCategoryId || ''}
                                                            onChange={(e) => setEditingItem({ ...editingItem, subCategoryId: e.target.value })}
                                                        >
                                                            <option value="">Select Sub Category</option>
                                                            {subCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-800">{idx + 1}. {item.name}</span>
                                                    {(item.subCategoryId?.name || item.subCategory?.name) && (
                                                        <span className="text-[10px] text-gray-500 pl-4 bg-gray-50 rounded mt-0.5 max-w-max px-1 border border-gray-100">{item.subCategoryId?.name || item.subCategory?.name}</span>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-4">
                                                {editingItem?.id === item._id && editingItem?.type === 'subPT' ? (
                                                    <>
                                                        <button onClick={handleEditSave} className="text-green-500 flex items-center gap-1 text-[13px] font-medium hover:text-green-600 transition-colors">
                                                            <Check size={14} strokeWidth={2.5} /> Save
                                                        </button>
                                                        <button onClick={handleEditCancel} className="text-gray-500 flex items-center gap-1 text-[13px] font-medium hover:text-gray-600 transition-colors">
                                                            <X size={14} strokeWidth={2.5} /> Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditStart('subPT', item)} className="text-orange-500 flex items-center gap-1 text-[13px] font-medium hover:text-orange-600 transition-colors">
                                                            <Edit2 size={12} strokeWidth={2.5} /> Edit
                                                        </button>
                                                        <button onClick={() => handleDelete('subPT', item._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center justify-center">
                                                            <div className="w-[15px] h-[15px] rounded-full border-2 border-red-500 flex items-center justify-center">
                                                                <X size={10} strokeWidth={3} className="text-red-500" />
                                                            </div>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Copyright Footer */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 py-3 mb-6 text-center text-gray-700 text-sm font-medium">
                Copyright © 2025 Solarkits. All Rights Reserved.
            </div>
        </div>
    );
};

export default AddProjectType;
