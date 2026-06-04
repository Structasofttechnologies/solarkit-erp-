import React, { useState, useEffect } from 'react';
import { getPartners, createPartner, updatePartner, deletePartner } from '../../../../services/partner/partnerApi';
import { Users, Plus, Edit2, Trash2, CheckCircle2, Loader, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPartner() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [formData, setFormData] = useState({ name: '', isActive: true });

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const data = await getPartners();
            setPartners(data);
        } catch (error) {
            toast.error('Failed to load partners');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (partner = null) => {
        if (partner) {
            setEditingPartner(partner);
            setFormData({ name: partner.name, isActive: partner.isActive });
        } else {
            setEditingPartner(null);
            setFormData({ name: '', isActive: true });
        }
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingPartner) {
                await updatePartner(editingPartner._id, formData);
                toast.success('Partner updated fully');
            } else {
                await createPartner(formData);
                toast.success('Partner created structure mapped');
            }
            setShowModal(false);
            fetchPartners();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this partner type?')) {
            try {
                await deletePartner(id);
                toast.success('Deleted successfully');
                fetchPartners();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                    <Users className="text-blue-600 w-6 h-6" />
                    <h1 className="text-2xl font-bold text-gray-800">Partner Types</h1>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Add Partner Type
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map(partner => (
                    <div key={partner._id} className="bg-white rounded-xl shadow-sm p-6 border hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{partner.name}</h3>
                                <div className={`mt-1 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${partner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {partner.isActive ? <CheckCircle2 size={12} /> : null}
                                    {partner.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(partner)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(partner._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingPartner ? 'Edit Partner Type' : 'Add Partner Type'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="text-gray-500 hover:text-gray-800" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Partner Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Dealer, Franchisee, Channel Partner"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="rounded text-blue-600"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Active Status</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <Save size={18} /> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
