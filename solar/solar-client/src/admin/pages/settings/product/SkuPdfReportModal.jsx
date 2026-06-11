import React from 'react';
import { Download, ArrowLeft, FileText, Printer } from 'lucide-react';

const SkuPdfReportModal = ({ isOpen, onClose, skuCode, product }) => {
  if (!isOpen) return null;

  const currentDateTime = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(',', '');

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-gray-100/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden relative border border-gray-200">
        
        {/* Top Utility Bar */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm z-10">
          <h3 className="text-[#0066cc] font-bold text-lg flex items-center gap-2">
            <FileText size={20} /> View Parameters
          </h3>
          <div className="flex gap-2">
            <button 
              className="bg-[#007bff] hover:bg-blue-700 text-white px-4 py-1.5 rounded flex items-center gap-2 text-xs font-bold transition shadow-md uppercase tracking-tight"
              onClick={() => window.print()}
            >
              <Download size={14} /> Download PDF
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-1.5 rounded flex items-center gap-2 text-xs font-bold transition shadow-md uppercase tracking-tight"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Report Content - Replicating the Image Design */}
        <div className="flex-1 overflow-y-auto bg-gray-200/30 p-8 flex flex-col items-center print:bg-white print:p-0">
          <div className="w-full max-w-[800px] bg-white shadow-lg rounded-sm border border-gray-300 min-h-[1000px] flex flex-col print:shadow-none print:border-none">
            
            {/* Report Box */}
            <div className="m-8 border border-gray-200 flex-1 flex flex-col">
              
              {/* Report Header Title */}
              <div className="py-4 border-b border-gray-100 flex justify-center items-center">
                <h1 className="text-xl font-bold text-gray-800 tracking-wide">SKU Parameters Report</h1>
              </div>

              {/* SKU Info Strip */}
              <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center">
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-gray-800">SKU:</span>
                  <span className="text-[#0066cc] font-mono font-bold tracking-tight">{skuCode}</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="space-y-4 opacity-40">
                  <FileText size={64} className="mx-auto text-gray-300" />
                  <p className="text-lg text-gray-400 font-medium">No parameters found</p>
                </div>
              </div>

              {/* Report Footer */}
              <div className="p-6 border-t border-gray-100 bg-white text-center space-y-1">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                  Generated on: {currentDateTime}
                </div>
                <div className="text-[11px] text-[#0066cc] font-bold uppercase tracking-tighter">
                  SKU Generator System
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SkuPdfReportModal;
