import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import SkuImageModal from './SkuImageModal';
import SkuPdfReportModal from './SkuPdfReportModal';
import AddParameterModal from './AddParameterModal';
import { masterApi } from '../../../../api/masterApi';
import { productApi } from '../../../../api/productApi';
import { toast } from 'react-hot-toast';

const ViewSkuModal = ({ isOpen, onClose, product, onUpdate }) => {
  const [showParamModal, setShowParamModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [imageMode, setImageMode] = useState('add');
  const [activeSkuCode, setActiveSkuCode] = useState('');
  const [skuObjects, setSkuObjects] = useState([]);
  const [fetchingSkus, setFetchingSkus] = useState(false);

  useEffect(() => {
    if (isOpen && product?._id) {
      fetchSkus();
    }
  }, [isOpen, product]);

  const fetchSkus = async () => {
    try {
      setFetchingSkus(true);
      const res = await productApi.getSkusByProduct(product._id);
      if (res.data.success) {
        setSkuObjects(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching SKUs:", error);
    } finally {
      setFetchingSkus(false);
    }
  };

  if (!isOpen || !product) return null;

  const openParamModal = (skuCode) => {
    setActiveSkuCode(skuCode);
    setShowParamModal(true);
  };

  const openImageModal = (skuCode, mode) => {
    setActiveSkuCode(skuCode);
    setImageMode(mode);
    setShowImageModal(true);
  };

  const openPdfModal = (skuCode) => {
    setActiveSkuCode(skuCode);
    setShowPdfModal(true);
  };

  const handleDeleteSku = async (sku) => {
    if (window.confirm(`Are you sure you want to delete SKU: ${sku.skuCode}?`)) {
      try {
        const res = await productApi.deleteSku(sku._id);
        if (res.data.success) {
          toast.success("SKU deleted successfully");
          fetchSkus();
          if (onUpdate) onUpdate(); // Refresh parent view if needed
        }
      } catch (error) {
        console.error("Error deleting SKU:", error);
        toast.error("Failed to delete SKU");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Generated SKUs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          {/* Product Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-700">Product Information</h3>
            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-5 grid grid-cols-2 gap-4 shadow-sm">
              <div className="flex gap-2 text-sm justify-start">
                <span className="text-gray-500 font-bold">Brand:</span>
                <span className="text-gray-800">{product.brandId?.name || product.brandId?.brand || product.brandId?.companyName || '-'}</span>
              </div>
              <div className="flex gap-2 text-sm justify-start">
                <span className="text-gray-500 font-bold">Product Name:</span>
                <span className="text-gray-800">{product.name || '-'}</span>
              </div>
              <div className="flex gap-2 text-sm italic justify-start">
                <span className="text-gray-500 font-bold not-italic">Technology:</span>
                <span className="text-gray-800">ongrid</span>
              </div>
              <div className="flex gap-2 text-sm justify-start">
                <span className="text-gray-500 font-bold">DCR Type:</span>
                <span className="text-gray-800 font-bold">{product.dcr || '-'}</span>
              </div>
            </div>
          </div>

          {/* Generated SKUs Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-700">Generated SKUs</h3>
              <span className="bg-[#0066cc] text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm uppercase">
                {skuObjects.length} {skuObjects.length === 1 ? 'SKU' : 'SKUs'}
              </span>
            </div>

            <div className="space-y-3">
              {fetchingSkus ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : skuObjects.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded border border-dashed">
                  No SKUs generated for this product yet.
                </div>
              ) : (
                skuObjects.map((sku, idx) => (
                  <div key={sku._id || idx} className="bg-white border-l-4 border-blue-500 border border-gray-100 rounded-r shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition duration-200">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-sm font-bold text-[#0066cc] tracking-tight">{sku.skuCode}</span>
                      <div className="flex gap-2 text-[10px] text-gray-500 font-medium">
                        <span>{sku.capacity}</span>
                        <span>•</span>
                        <span>{sku.phase}</span>
                        <span>•</span>
                        <span>{sku.wattage}W</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                      <button 
                        onClick={() => openParamModal(sku.skuCode)}
                        className="bg-[#0066cc] hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[10px] font-bold shadow-sm transition uppercase whitespace-nowrap"
                      >
                        Add Parameter Value
                      </button>
                      <button 
                        onClick={() => openImageModal(sku.skuCode, 'add')}
                        className="bg-[#28a745] hover:bg-green-700 text-white px-3 py-1.5 rounded text-[10px] font-bold shadow-sm transition uppercase whitespace-nowrap"
                      >
                        Add Image
                      </button>
                      <button 
                        onClick={() => openImageModal(sku.skuCode, 'view')}
                        className="bg-[#17a2b8] hover:bg-cyan-600 text-white px-3 py-1.5 rounded text-[10px] font-bold shadow-sm transition uppercase whitespace-nowrap"
                      >
                        View Image
                      </button>
                      <button 
                        onClick={() => openPdfModal(sku.skuCode)}
                        className="bg-[#009688] hover:bg-teal-700 text-white px-3 py-1.5 rounded text-[10px] font-bold shadow-sm transition uppercase whitespace-nowrap"
                      >
                        View PDF
                      </button>
                      <div className="flex gap-1 ml-2 border-l pl-2">
                        <button 
                          onClick={() => handleDeleteSku(sku)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                          title="Delete SKU"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-start">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600 transition shadow-md uppercase"
          >
            Close
          </button>
        </div>
      </div>

      <AddParameterModal
        isOpen={showParamModal}
        skuCode={activeSkuCode}
        onClose={() => setShowParamModal(false)}
        onSave={async (data) => {
          try {
            const response = await masterApi.saveSkuParameters({
              skuCode: activeSkuCode,
              parameters: data.map(section => ({
                title: section.title,
                rows: section.rows.map(row => ({
                  name: row.name,
                  value: row.value,
                  unit: row.unit
                }))
              }))
            });
            if (response.data.success) {
              toast.success("Parameters saved successfully");
              setShowParamModal(false);
            } else {
              toast.error(response.data.message || "Failed to save parameters");
            }
          } catch (error) {
            console.error("Error saving parameters:", error);
            toast.error("An error occurred while saving parameters");
          }
        }}
      />

      <SkuImageModal
        isOpen={showImageModal}
        skuCode={activeSkuCode}
        mode={imageMode}
        onClose={() => setShowImageModal(false)}
        onSave={async (image) => {
          try {
            const response = await masterApi.saveSkuImage({
              skuCode: activeSkuCode,
              image: image
            });
            if (response.data.success) {
              toast.success("Image saved successfully");
            } else {
              toast.error(response.data.message || "Failed to save image");
            }
          } catch (error) {
            console.error("Error saving image:", error);
            toast.error("An error occurred while saving image");
          }
        }}
      />

      <SkuPdfReportModal
        isOpen={showPdfModal}
        skuCode={activeSkuCode}
        product={product}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
};

export default ViewSkuModal;
