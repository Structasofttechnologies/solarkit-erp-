const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/settings/quote/QuoteSetting.jsx', 'utf-8');

content = content.replace(
  'const [isFrontPageModalOpen, setIsFrontPageModalOpen] = useState(false);',
  'const [isFrontPageModalOpen, setIsFrontPageModalOpen] = useState(false);\n  const [isFormModalOpen, setIsFormModalOpen] = useState(false);'
);

content = content.replace(
  /\n\s*\/\/\s*Scroll top\n\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);/g,
  '\n    setIsFormModalOpen(true);'
);

const tableRegex = /(            \{\/\* Quote Summary Table \*\/\}[\s\S]*?)(          <\/div>\n\n          \{\/\* Right Column - Preview \*\/\} )/;
const tableMatch = content.match(/(\s*\{\/\* Quote Summary Table \*\/\}[\s\S]*?)(          <\/div>\n\n          \{\/\* Right Column - Preview \*\/})/);
if (tableMatch) {
  const tableContent = tableMatch[1];
  content = content.replace(tableContent, '');
  
  const endRegex = /(        <\/div>\n      \)\}\n\n      \{\/\* Front Page Settings Modal)/;
  const endMatch = content.match(endRegex);
  if (endMatch) {
    content = content.replace(endMatch[1], `        </div>
              </div>
            </div>
          )}
        </>
      )}

      {!isFormModalOpen && selectedCountries.length > 0 && (
          <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
${tableContent.trimEnd()}
          </div>
      )}

      {/* Front Page Settings Modal`);
  } else {
    console.log("End match not found!");
  }
} else {
    console.log("Table match not found!");
}

const startRegex = /(      \) : \(\n        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">\n          \{\/\* Left Column - Settings \*\/\})/;
content = content.replace(startRegex, `      ) : (
        <>
          {!isFormModalOpen && (
            <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
              <div>
                 <h2 className="text-xl font-bold text-gray-800">Quote Settings Builder</h2>
                 <p className="text-sm text-gray-500">Manage and configure quote combinations</p>
              </div>
              <button onClick={() => { setEditingId(null); setIsFormModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition flex items-center gap-2">
                 + Create New Configuration
              </button>
            </div>
          )}

          {isFormModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 bg-gray-900/60 backdrop-blur-sm">
              <div className="bg-gray-50 w-full max-w-[1600px] h-[96vh] rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-gray-100 shrink-0">
                   <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Configuration' : 'Create Configuration'}</h2>
                   <button onClick={() => { setIsFormModalOpen(false); if(editingId) setEditingId(null); }} className="p-2.5 bg-gray-50 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                     <X size={20} className="shrink-0" />
                   </button>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                  {/* Left Column - Settings */}`);

fs.writeFileSync('src/admin/pages/settings/quote/QuoteSetting.jsx', content, 'utf-8');
console.log('Done');
