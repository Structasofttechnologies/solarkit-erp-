import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Image as ImageIcon, Save, Trash2, Loader2 } from 'lucide-react';
import { masterApi } from '../../../../api/masterApi';

const SkuImageModal = ({ isOpen, onClose, skuCode, mode = 'add', initialImage = null, onSave }) => {
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && skuCode) {
      fetchImage();
    }
  }, [isOpen, skuCode]);

  const fetchImage = async () => {
    setLoading(true);
    try {
      const response = await masterApi.getSkuImage(skuCode);
      if (response.success && response.data) {
        setSelectedImage(response.data);
        setPreviewUrl(response.data);
      } else {
        setSelectedImage(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (onSave) {
      // Pass the previewUrl (base64) to onSave
      onSave(previewUrl);
    }
    onClose();
  };

  const renderContent = () => {
    if (mode === 'view') {
      return (
        <div className="p-6 space-y-4">
          <div className="flex border rounded overflow-hidden">
            <span className="bg-gray-50 px-4 py-2 text-sm font-bold text-gray-500 border-r">SKU</span>
            <input type="text" readOnly value={skuCode} className="flex-1 px-4 py-2 text-sm font-mono text-gray-600 bg-gray-50/50 outline-none" />
          </div>
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg min-h-[300px] flex flex-col items-center justify-center p-4">
            {previewUrl ? (
              <img src={previewUrl} alt="SKU Parameter" className="max-w-full max-h-[400px] object-contain rounded shadow-sm" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <p className="text-sm italic">No image available for this SKU</p>
              </div>
            )}
          </div>
          <div className="flex justify-start">
            <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600 transition shadow-sm uppercase">
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-4">
        <div className="flex border rounded overflow-hidden shadow-sm">
          <span className="bg-gray-50 px-4 py-2 text-sm font-bold text-gray-500 border-r">SKU</span>
          <input type="text" readOnly value={skuCode} className="flex-1 px-4 py-2 text-sm font-mono text-gray-600 bg-gray-50/50 outline-none" />
        </div>
        
        <div className="relative group">
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg min-h-[250px] flex flex-col items-center justify-center p-4 transition-colors group-hover:border-blue-200">
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded shadow-md" />
                <button 
                  onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No image selected</p>
              </div>
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 bg-gray-500 hover:bg-gray-600 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110"
              title="Click to upload image"
            >
              <Camera size={20} />
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600 transition shadow-sm uppercase">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-[#0066cc] text-white rounded text-sm font-bold hover:bg-blue-700 transition shadow-sm uppercase disabled:opacity-50"
            disabled={!selectedImage}
          >
            Save Image
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === 'view' ? 'View Parameter Image' : 'Parameter Image'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 size={40} className="animate-spin text-[#0066cc]" />
            <p className="text-sm font-medium text-gray-500">Loading image...</p>
          </div>
        ) : renderContent()}
      </div>
    </div>
  );
};

export default SkuImageModal;
