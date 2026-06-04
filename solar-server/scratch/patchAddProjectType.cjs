const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../solar-client/src/admin/pages/settings/product/AddProjectType.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add States
const stateInjection = `
    const [technologies, setTechnologies] = useState([]);
    const [panelWatts, setPanelWatts] = useState([]);
    const [solarPanels, setSolarPanels] = useState([]);
    const [kilowatts, setKilowatts] = useState([]);

    const [newTechnologyName, setNewTechnologyName] = useState('');
    const [selectedSubProjectTypeForTech, setSelectedSubProjectTypeForTech] = useState('');

    const [newPanelWattName, setNewPanelWattName] = useState('');
    const [selectedTechnologyForPW, setSelectedTechnologyForPW] = useState('');

    const [newSolarPanelName, setNewSolarPanelName] = useState('');
    const [selectedPanelWattForSP, setSelectedPanelWattForSP] = useState('');

    const [newKilowattName, setNewKilowattName] = useState('');
    const [selectedSolarPanelForKW, setSelectedSolarPanelForKW] = useState('');
`;
content = content.replace('    // Editing State', stateInjection + '\n    // Editing State');

// 2. handleEditStart injections
const editStartPatch = `
            ...(type === 'tech' ? { subProjectTypeId: item.subProjectTypeId?._id || item.subProjectType?._id || item.subProjectTypeId || '' } : {}),
            ...(type === 'pw' ? { technologyId: item.technologyId?._id || item.technology?._id || item.technologyId || '' } : {}),
            ...(type === 'sp' ? { panelWattId: item.panelWattId?._id || item.panelWatt?._id || item.panelWattId || '' } : {}),
            ...(type === 'kw' ? { solarPanelId: item.solarPanelId?._id || item.solarPanel?._id || item.solarPanelId || '' } : {})
        });
`;
content = content.replace('        });\n    };\n\n    const handleEditCancel', editStartPatch + '    };\n\n    const handleEditCancel');

// 3. handleEditSave injections
const editSavePatch = `            } else if (editingItem.type === 'tech') {
                const item = technologies.find(c => c._id === editingItem.id);
                await productApi.updateTechnology(editingItem.id, { ...item, name: editingItem.name.trim(), subProjectTypeId: editingItem.subProjectTypeId });
            } else if (editingItem.type === 'pw') {
                const item = panelWatts.find(c => c._id === editingItem.id);
                await productApi.updatePanelWatt(editingItem.id, { ...item, name: editingItem.name.trim(), technologyId: editingItem.technologyId });
            } else if (editingItem.type === 'sp') {
                const item = solarPanels.find(c => c._id === editingItem.id);
                await productApi.updateSolarPanel(editingItem.id, { ...item, name: editingItem.name.trim(), panelWattId: editingItem.panelWattId });
            } else if (editingItem.type === 'kw') {
                const item = kilowatts.find(c => c._id === editingItem.id);
                await productApi.updateKilowatt(editingItem.id, { ...item, name: editingItem.name.trim(), solarPanelId: editingItem.solarPanelId });
`;
content = content.replace('            showToast("Item updated successfully");', editSavePatch + '            showToast("Item updated successfully");');

// 4. fetchInitialData
content = content.replace(
    'productApi.getSubProjectTypes()\n            ]);',
    `productApi.getSubProjectTypes(),
                productApi.getTechnologies(),
                productApi.getPanelWatts(),
                productApi.getSolarPanels(),
                productApi.getKilowatts()
            ]);`
);
content = content.replace(
    'setSubProjectTypes(subPTypeRes?.data?.data || []);',
    `setSubProjectTypes(subPTypeRes?.data?.data || []);
            const techs = arguments[0][4]?.data?.data || [];
            const pws = arguments[0][5]?.data?.data || [];
            const sps = arguments[0][6]?.data?.data || [];
            const kws = arguments[0][7]?.data?.data || [];
            setTechnologies(techs);
            setPanelWatts(pws);
            setSolarPanels(sps);
            setKilowatts(kws);
            if (subPTypeRes?.data?.data?.length > 0) setSelectedSubProjectTypeForTech(subPTypeRes.data.data[0]._id);
            if (techs.length > 0) setSelectedTechnologyForPW(techs[0]._id);
            if (pws.length > 0) setSelectedPanelWattForSP(pws[0]._id);
            if (sps.length > 0) setSelectedSolarPanelForKW(sps[0]._id);
`
).replace('arguments[0][4]', 'arguments[0]?.[4]') // dirty quick fix for promise.all results, let's fix it properly

content = content.replace(
    `const [catRes, subCatRes, pTypeRes, subPTypeRes] = await Promise.all([`,
    `const [catRes, subCatRes, pTypeRes, subPTypeRes, techRes, pwRes, spRes, kwRes] = await Promise.all([`
);

content = content.replace(
    `setKilowatts(kws);`,
    `setTechnologies(techRes?.data?.data || []);
            setPanelWatts(pwRes?.data?.data || []);
            setSolarPanels(spRes?.data?.data || []);
            setKilowatts(kwRes?.data?.data || []);`
).replace(/const techs = arguments\[0\].*setKilowatts\(kws\);/s, '');


// 5. Add handlers
const handlersInjection = `
    const handleAddTechnology = async () => {
        if (!newTechnologyName.trim()) return showToast("Technology name is required", "error");
        try {
            await productApi.createTechnology({ name: newTechnologyName.trim(), subProjectTypeId: selectedSubProjectTypeForTech || null });
            showToast("Technology added");
            setNewTechnologyName('');
            fetchInitialData();
        } catch (err) { showToast(err.response?.data?.message || "Failed to add", "error"); }
    };

    const handleAddPanelWatt = async () => {
        if (!newPanelWattName.trim()) return showToast("Panel Watt name is required", "error");
        try {
            await productApi.createPanelWatt({ name: newPanelWattName.trim(), technologyId: selectedTechnologyForPW || null });
            showToast("Panel Watt added");
            setNewPanelWattName('');
            fetchInitialData();
        } catch (err) { showToast(err.response?.data?.message || "Failed to add", "error"); }
    };

    const handleAddSolarPanel = async () => {
        if (!newSolarPanelName.trim()) return showToast("Solar Panel name is required", "error");
        try {
            await productApi.createSolarPanel({ name: newSolarPanelName.trim(), panelWattId: selectedPanelWattForSP || null });
            showToast("Solar Panel added");
            setNewSolarPanelName('');
            fetchInitialData();
        } catch (err) { showToast(err.response?.data?.message || "Failed to add", "error"); }
    };

    const handleAddKilowatt = async () => {
        if (!newKilowattName.trim()) return showToast("Kilowatt name is required", "error");
        try {
            await productApi.createKilowatt({ name: newKilowattName.trim(), solarPanelId: selectedSolarPanelForKW || null });
            showToast("Kilowatt added");
            setNewKilowattName('');
            fetchInitialData();
        } catch (err) { showToast(err.response?.data?.message || "Failed to add", "error"); }
    };
`;

content = content.replace('    const handleDelete = async', handlersInjection + '\n    const handleDelete = async');

const deletePatch = `
            if (type === 'tech') await productApi.deleteTechnology(id);
            if (type === 'pw') await productApi.deletePanelWatt(id);
            if (type === 'sp') await productApi.deleteSolarPanel(id);
            if (type === 'kw') await productApi.deleteKilowatt(id);
`;
content = content.replace('            showToast("Item deleted");', deletePatch + '            showToast("Item deleted");');

// 6. UI Inputs
const inputsUI = `
                        {/* Technology */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[#0073B7] font-bold text-[15px]">Technology</h3>
                                <div className="flex gap-1">
                                    <select
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-500 bg-transparent"
                                        value={selectedSubProjectTypeForTech}
                                        onChange={(e) => setSelectedSubProjectTypeForTech(e.target.value)}
                                    >
                                        <option value="">Sub Project Type</option>
                                        {subProjectTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex h-10">
                                <input type="text" className="border border-gray-300 rounded-l px-3 w-full outline-none focus:border-[#0073B7] text-sm" placeholder="Enter Technology" value={newTechnologyName} onChange={(e) => setNewTechnologyName(e.target.value)} />
                                <button onClick={handleAddTechnology} className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded-r flex items-center justify-center font-medium text-sm transition-colors">+ Add</button>
                            </div>
                        </div>

                        {/* Panel Watt */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[#0073B7] font-bold text-[15px]">Panel Watt</h3>
                                <div className="flex gap-1">
                                    <select
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-500 bg-transparent"
                                        value={selectedTechnologyForPW}
                                        onChange={(e) => setSelectedTechnologyForPW(e.target.value)}
                                    >
                                        <option value="">Technology</option>
                                        {technologies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex h-10">
                                <input type="text" className="border border-gray-300 rounded-l px-3 w-full outline-none focus:border-[#0073B7] text-sm" placeholder="Enter Panel Watt" value={newPanelWattName} onChange={(e) => setNewPanelWattName(e.target.value)} />
                                <button onClick={handleAddPanelWatt} className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded-r flex items-center justify-center font-medium text-sm transition-colors">+ Add</button>
                            </div>
                        </div>

                        {/* Solar Panel */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[#0073B7] font-bold text-[15px]">Solar Panel</h3>
                                <div className="flex gap-1">
                                    <select
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-500 bg-transparent"
                                        value={selectedPanelWattForSP}
                                        onChange={(e) => setSelectedPanelWattForSP(e.target.value)}
                                    >
                                        <option value="">Panel Watt</option>
                                        {panelWatts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex h-10">
                                <input type="text" className="border border-gray-300 rounded-l px-3 w-full outline-none focus:border-[#0073B7] text-sm" placeholder="Enter Solar Panel" value={newSolarPanelName} onChange={(e) => setNewSolarPanelName(e.target.value)} />
                                <button onClick={handleAddSolarPanel} className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded-r flex items-center justify-center font-medium text-sm transition-colors">+ Add</button>
                            </div>
                        </div>

                        {/* Kilowatt */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[#0073B7] font-bold text-[15px]">Kilowatt (kw)</h3>
                                <div className="flex gap-1">
                                    <select
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-500 bg-transparent"
                                        value={selectedSolarPanelForKW}
                                        onChange={(e) => setSelectedSolarPanelForKW(e.target.value)}
                                    >
                                        <option value="">Solar Panel</option>
                                        {solarPanels.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex h-10">
                                <input type="text" className="border border-gray-300 rounded-l px-3 w-full outline-none focus:border-[#0073B7] text-sm" placeholder="Enter Kilowatt" value={newKilowattName} onChange={(e) => setNewKilowattName(e.target.value)} />
                                <button onClick={handleAddKilowatt} className="bg-[#28A745] hover:bg-[#218838] text-white px-5 rounded-r flex items-center justify-center font-medium text-sm transition-colors">+ Add</button>
                            </div>
                        </div>
`;
content = content.replace('                    </div>\n\n                    {/* Summary Cards Grid */}', inputsUI + '\n                    </div>\n\n                    {/* Summary Cards Grid */}');

// We should also adjust the grid columns since we added 4 new cards.
content = content.replace('grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6');

const summaryUIPart2 = `
                        {/* Technology Summary */}
                        <div className="border border-[#6610f2] rounded-md overflow-hidden bg-white">
                            <div className="bg-[#6610f2] text-white py-2 text-center font-semibold text-sm">Technology Summary</div>
                            <div className="p-3 overflow-y-auto min-h-[150px] max-h-[300px]">
                                {technologies.length === 0 ? <div className="text-gray-400 text-center py-6 text-sm">No technologies</div> : technologies.map((item, idx) => (
                                    <div key={item._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 border-dashed">
                                        <div className="flex flex-col"><span className="text-sm text-gray-800">{idx + 1}. {item.name}</span></div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleDelete('tech', item._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center justify-center"><X size={14} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Panel Watt Summary */}
                        <div className="border border-[#fd7e14] rounded-md overflow-hidden bg-white">
                            <div className="bg-[#fd7e14] text-white py-2 text-center font-semibold text-sm">Panel Watt Summary</div>
                            <div className="p-3 overflow-y-auto min-h-[150px] max-h-[300px]">
                                {panelWatts.length === 0 ? <div className="text-gray-400 text-center py-6 text-sm">No panel watts</div> : panelWatts.map((item, idx) => (
                                    <div key={item._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 border-dashed">
                                        <div className="flex flex-col"><span className="text-sm text-gray-800">{idx + 1}. {item.name}</span></div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleDelete('pw', item._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center justify-center"><X size={14} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Solar Panel Summary */}
                        <div className="border border-[#e83e8c] rounded-md overflow-hidden bg-white">
                            <div className="bg-[#e83e8c] text-white py-2 text-center font-semibold text-sm">Solar Panel Summary</div>
                            <div className="p-3 overflow-y-auto min-h-[150px] max-h-[300px]">
                                {solarPanels.length === 0 ? <div className="text-gray-400 text-center py-6 text-sm">No solar panels</div> : solarPanels.map((item, idx) => (
                                    <div key={item._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 border-dashed">
                                        <div className="flex flex-col"><span className="text-sm text-gray-800">{idx + 1}. {item.name}</span></div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleDelete('sp', item._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center justify-center"><X size={14} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Kilowatt Summary */}
                        <div className="border border-[#20c997] rounded-md overflow-hidden bg-white">
                            <div className="bg-[#20c997] text-white py-2 text-center font-semibold text-sm">Kilowatt Summary</div>
                            <div className="p-3 overflow-y-auto min-h-[150px] max-h-[300px]">
                                {kilowatts.length === 0 ? <div className="text-gray-400 text-center py-6 text-sm">No kilowatts</div> : kilowatts.map((item, idx) => (
                                    <div key={item._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 border-dashed">
                                        <div className="flex flex-col"><span className="text-sm text-gray-800">{idx + 1}. {item.name}</span></div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleDelete('kw', item._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center justify-center"><X size={14} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
`;
content = content.replace('                    </div>\n                </div>', '                    </div>\n\n                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">\n' + summaryUIPart2 + '\n                    </div>\n                </div>');

fs.writeFileSync(targetFile, content);
console.log('Patched AddProjectType.jsx successfully');
