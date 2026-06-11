import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import Chart from 'chart.js/auto';
import { Zap, Calculator, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function QuoteWebView() {
  const { quoteId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [template, setTemplate] = useState(null);
  const [searchParams] = useSearchParams();

  const isPdfUrl = quoteId && quoteId.endsWith('.pdf');
  const cleanQuoteId = isPdfUrl ? quoteId.slice(0, -4) : quoteId;
  const shouldDownload = searchParams.get('download') === 'true' || isPdfUrl;

  const generationChartRef = useRef(null);
  const roiChartRef = useRef(null);
  const generationChartInstance = useRef(null);
  const roiChartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/quote-web-view/${cleanQuoteId}`);
        if (res.data?.success) {
          const fetchedQuote = res.data.data.quote;
          setQuote(fetchedQuote);
          setTemplate(res.data.data.template);
          
          if (shouldDownload) {
            setTimeout(() => {
              const element = document.getElementById('pdf-content-wrapper');
              if (element) {
                const opt = {
                  margin: 0,
                  filename: `${fetchedQuote.quoteNumber || 'Quote'}.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2, useCORS: true },
                  jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
              } else {
                window.print();
              }
            }, 2500); // Give it time to render charts and images
          }
        } else {
          setError('Quote not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quote');
      } finally {
        setLoading(false);
      }
    };
    if (cleanQuoteId) fetchData();
  }, [cleanQuoteId]);

  // ===== Extract Template Settings (same as QuoteSetting.jsx admin preview) =====
  const colorSettings = template?.colorSettings || {};
  const fps = template?.frontPageSettings || {};
  const fieldSettings = template?.fieldSettings || {};
  const pricingData = template?.pricingData || { totalCost: 0, mnreSubsidy: 0, stateSubsidy: 0, additionalCharges: 0, netCost: 0 };
  const solarSettings = template?.solarSettings || { projectKW: 0, unitPerKW: 0 };
  const pageConfigs = template?.pageConfigs || {};
  const selectedPages = template?.selectedPages || ['Front Page', 'Commercial Page'];
  const bomData = template?.bomData || { items: [], pipes: [], heightNote: '' };
  const advancedOptions = template?.advancedOptions || [];
  const packageImage = template?.packageImage;

  // Theme colors
  const themeAccent = colorSettings.brandColor ? (fps?.styling?.themeColor || '#2563eb') : '#2563eb';
  const themeBgColor = colorSettings.backgroundColor ? (fps?.styling?.bgColor || '#ffffff') : '#ffffff';
  const headerFontSize = colorSettings.fontSize ? `${fps?.styling?.headerFontSize || 24}px` : '24px';
  const footerFontSize = colorSettings.fontSize ? `${fps?.styling?.footerFontSize || 10}px` : '10px';
  const sectionTitleFontSize = colorSettings.fontSize ? `${fps?.styling?.sectionTitleFontSize || 18}px` : '18px';
  const contentFontSize = colorSettings.fontSize ? `${fps?.styling?.contentFontSize || 12}px` : '12px';
  
  const themeBgLight = `${themeAccent}15`;
  const themeBgSemi = `${themeAccent}33`;
  const themeBgFaint = `${themeAccent}08`;
  const themeBgStrong = `${themeAccent}CC`;

  // Quote data
  const customerName = quote?.name || 'Valued Customer';
  const districtName = quote?.district?.name || 'District';
  const categoryName = quote?.category?.name || 'Residential';
  const subCategoryName = quote?.subCategory?.name || '';
  const subProjectName = quote?.subProjectType?.name || 'National Portal';
  const projectType = quote?.projectType ? `${quote.projectType.projectTypeFrom} To ${quote.projectType.projectTypeTo} KW` : '3 To 10 KW';
  const kilowatt = quote?.kilowatt || solarSettings.projectKW || 0;
  const quoteNumber = quote?.quoteNumber || '';
  const quoteDate = quote?.date || (quote ? new Date(quote.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  const paymentType = quote?.paymentType || 'Cash';
  const kitType = quote?.kitType || '';
  const kitImage = quote?.image;
  const grandTotal = quote?.grandTotal || 0;
  const advancedTotal = advancedOptions.filter(o => o.enabled).reduce((sum, o) => sum + (o.price || 0), 0);

  // Calculations
  const rawMonthlyData = quote?.monthlyIsolation || template?.monthlyIsolation || [];
  const isIsolationAllZero = rawMonthlyData.length === 0 || rawMonthlyData.every(m => !m.isolation);
  
  const defaultIsolationMap = {
    Jan: 4.5, Feb: 5.2, Mar: 6.0, Apr: 6.5, May: 6.8, Jun: 5.5,
    Jul: 4.5, Aug: 4.5, Sep: 5.0, Oct: 5.2, Nov: 4.8, Dec: 4.2
  };

  const monthlyData = rawMonthlyData.map(m => {
    const monthName = m.month;
    const isolationVal = isIsolationAllZero ? (defaultIsolationMap[monthName] || 5.0) : (m.isolation || 0);
    const calculatedTotalVal = parseFloat((isolationVal * kilowatt * 0.8).toFixed(2));
    return {
      ...m,
      isolation: isolationVal,
      total: calculatedTotalVal
    };
  });

  const annualTotal = monthlyData.reduce((sum, m) => sum + (parseFloat(m.total) || 0), 0);
  const unitPrice = template?.unitPrice || 7.5;
  const inflationRate = template?.inflationRate || 0.05;
  const degradationRate = template?.degradationRate || 0.005;
  const annualSavings = annualTotal * unitPrice;
  const paymentModesSelected = template?.paymentModes || ['Cash'];

  let total25YearSavings = 0;
  let currentYearSavings = annualSavings;
  let calculatedPayback = 0;
  let cumulative = 0;
  const netCost = quote?.grandTotal || pricingData.netCost || 0;

  for (let i = 1; i <= 25; i++) {
    cumulative += currentYearSavings;
    total25YearSavings += currentYearSavings;
    if (calculatedPayback === 0 && cumulative >= netCost) {
      calculatedPayback = i - 1 + (netCost - (cumulative - currentYearSavings)) / currentYearSavings;
    }
    currentYearSavings = currentYearSavings * (1 + inflationRate - degradationRate);
  }

  const paybackPeriod = calculatedPayback || (annualSavings > 0 ? (netCost / annualSavings) : 0);
  const savings25Year = total25YearSavings;

  // pageConfigs Map helper
  const getPageConfig = (pageName) => {
    if (!pageConfigs) return {};
    if (typeof pageConfigs.get === 'function') return pageConfigs.get(pageName) || {};
    return pageConfigs[pageName] || {};
  };

  const initializeCharts = () => {
    // Destroy existing charts
    if (generationChartInstance.current) {
      generationChartInstance.current.destroy();
    }
    if (roiChartInstance.current) {
      roiChartInstance.current.destroy();
    }

    // Generation Chart
    const generationCtx = generationChartRef.current;
    if (generationCtx) {
      generationChartInstance.current = new Chart(generationCtx, {
        type: 'bar',
        data: {
          labels: monthlyData.map(m => m.month),
          datasets: [{
            label: 'Units Generated (kWh)',
            data: monthlyData.map(m => m.total),
            backgroundColor: `${themeAccent}CC`,
            borderColor: themeAccent,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Units (kWh)'
              }
            }
          }
        }
      });
    }

    // ROI Chart
    const roiCtx = roiChartRef.current;
    if (roiCtx) {
      const years = Array.from({ length: 11 }, (_, i) => i);
      let cumulativeVal = 0;
      const cumulativeSavings = [];
      let yearlySavings = annualTotal * unitPrice;

      years.forEach(y => {
        if (y === 0) {
          cumulativeSavings.push(0);
        } else {
          cumulativeVal += yearlySavings;
          cumulativeSavings.push(cumulativeVal);
          yearlySavings = yearlySavings * (1 + inflationRate - degradationRate);
        }
      });

      roiChartInstance.current = new Chart(roiCtx, {
        type: 'line',
        data: {
          labels: years.map(y => `Yr ${y}`),
          datasets: [
            {
              label: 'Cumulative Savings',
              data: cumulativeSavings,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.3
            },
            {
              label: 'System Net Cost',
              data: years.map(() => netCost),
              borderColor: 'rgb(239, 68, 68)',
              borderDash: [5, 5],
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Rupees (Rs.)'
              }
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    if (!loading && quote && template) {
      const timer = setTimeout(() => {
        initializeCharts();
      }, 500);
      return () => {
        clearTimeout(timer);
        if (generationChartInstance.current) {
          generationChartInstance.current.destroy();
        }
        if (roiChartInstance.current) {
          roiChartInstance.current.destroy();
        }
      };
    }
  }, [loading, quote, template, selectedPages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading Quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-md border border-gray-200 max-w-md mx-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Quote Not Found</h2>
          <p className="text-gray-500 text-sm">{error || 'This quote does not exist or may have been deleted.'}</p>
        </div>
      </div>
    );
  }

  // Construct standard and custom pages list to respect page sequence and order
  const defaultPages = [
    { id: 'f1', label: 'Front Page', value: 'Front Page' },
    { id: 'f2', label: 'Commercial Page', value: 'Commercial Page' },
    { id: 'f3', label: 'Generation Graph', value: 'Generation Graph' },
    { id: 'f4', label: 'Add ons Settings', value: 'Advanced Settings' },
    { id: 'f5', label: 'BOM Survey Summary', value: 'Financial Summary' },
    { id: 'p_terms', label: 'Payment Terms', value: 'Payment Terms' }
  ];

  const pagesList = template?.allPages && template.allPages.length > 0 ? template.allPages : defaultPages;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4" style={{ fontFamily: fps?.styling?.fontFamily || 'Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <div id="pdf-content-wrapper" className="transform scale-100 origin-top">
          {pagesList.filter(p => selectedPages.includes(p.value)).map((page) => {
            const pageName = page.value;

            // ============ FRONT PAGE ============
            if (pageName === 'Front Page') {
              const frontPageConfig = getPageConfig('Front Page');
              return (
                <div key={page.id} className="pdf-page rounded-3xl overflow-hidden shadow-2xl mb-8 border border-gray-100" style={{ backgroundColor: themeBgColor }}>
                  {/* Hero Banner Section */}
                  <div className="relative h-64 w-full">
                    <img
                      src={frontPageConfig?.media || "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                      alt="Solar Roof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center text-center px-6">
                      <h2 className="font-black text-white mb-1 uppercase tracking-tighter drop-shadow-lg" style={{ fontSize: headerFontSize }}>
                        {frontPageConfig?.header || `${categoryName} ${projectType}`}
                      </h2>
                      <h3 className="text-2xl font-black text-yellow-400 mb-2 uppercase tracking-wide drop-shadow-md">
                        ({subProjectName})
                      </h3>
                      <h4 className="text-4xl font-extrabold text-white mb-2 tracking-[0.2em]">PROPOSAL</h4>
                      <p className="text-xs font-bold text-gray-200 tracking-widest uppercase border-t border-gray-400/50 pt-2">
                        {frontPageConfig?.footer || 'SOLAR ENERGY FOR A BETTER TOMORROW'}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info Section */}
                  <div className="p-10" style={{ backgroundColor: themeBgColor }}>
                    <div className="mb-10 text-center">
                      <h2 className="font-black text-gray-800 uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>
                        {categoryName} {projectType} ({subProjectName})
                        <span className="ml-2" style={{ color: themeAccent }}>Proposal</span>
                      </h2>
                      <div className="w-20 h-1 mx-auto mt-2" style={{ backgroundColor: themeAccent }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        {fieldSettings.proposalNo !== false && (
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proposal No</p>
                            <p className="text-sm font-black pb-1" style={{ color: themeAccent }}>{quoteNumber}</p>
                          </div>
                        )}
                        {fieldSettings.customerName !== false && (
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Name of Customer</p>
                            <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>{customerName}</p>
                          </div>
                        )}
                        {fieldSettings.kwRequired !== false && (
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">KW Required</p>
                            <div className="flex items-center gap-3">
                              <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>{kilowatt} KW</p>
                              {fieldSettings.paymentMode !== false && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md border" style={{ color: themeAccent, backgroundColor: themeBgLight, borderColor: themeBgSemi }}>
                                  {paymentType}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        {fieldSettings.residentialCommercial !== false && (
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Residential / Commercial</p>
                            <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>{categoryName} {projectType} ({subProjectName})</p>
                          </div>
                        )}
                        {fieldSettings.city !== false && (
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">City</p>
                            <p className="text-gray-700 font-bold" style={{ fontSize: contentFontSize }}>{districtName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats Section */}
                  <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50/50">
                    {fieldSettings.preparedBy !== false && (
                      <div className="p-8 border-r border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prepared by</p>
                        <p className="font-black text-gray-700 uppercase" style={{ fontSize: footerFontSize }}>Partner User</p>
                      </div>
                    )}
                    {fieldSettings.date !== false && (
                      <div className="p-8 border-r border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="font-black text-gray-700" style={{ fontSize: footerFontSize }}>{quoteDate}</p>
                      </div>
                    )}
                    {fieldSettings.validUpto !== false && (
                      <div className="p-8">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Valid Upto</p>
                        <p className="font-black text-red-600 bg-red-100 px-3 py-1 rounded-full w-fit" style={{ fontSize: footerFontSize }}>
                          {frontPageConfig?.validUptoValue || '15'} Days
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // ============ COMMERCIAL PAGE ============
            if (pageName === 'Commercial Page') {
              const commercialConfig = getPageConfig('Commercial Page');
              return (
                <div key={page.id} className="pdf-page mb-8 p-8 border-b border-gray-100 last:border-0 rounded-[2rem] shadow-xl" style={{ backgroundColor: themeBgColor }}>
                  <div className="flex justify-between items-center mb-6 border-b-4 pb-2" style={{ borderBottomColor: themeAccent }}>
                    <div>
                      <h5 className="font-black uppercase tracking-tighter" style={{ color: themeAccent, fontSize: sectionTitleFontSize }}>
                        {template?.quoteTypes?.join(', ') || 'Quote'}
                      </h5>
                      <p className="text-xs font-bold text-gray-500 uppercase">{kitType}</p>
                    </div>
                    {fieldSettings.kitType !== false && (
                      <div className="text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: themeAccent }}>
                        {kitType}
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto max-w-xl w-full" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)' }}>
                    <table className="w-full border-collapse">
                      <tbody>
                        {[
                          { key: 'showTotalCost', label: 'Total Cost', value: quote?.grandTotal || pricingData.totalCost },
                          { key: 'showMnreSubsidy', label: 'Govt MNRE Subsidy', value: pricingData.mnreSubsidy },
                          { key: 'showStateSubsidy', label: 'Govt State Subsidy', value: pricingData.stateSubsidy },
                          { key: 'showAdditionalCharges', label: 'Additional Charges', value: pricingData.additionalCharges }
                        ].map((row, i) => (commercialConfig?.visibility?.[row.key] !== false) && (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="p-4 font-black text-gray-400 uppercase tracking-widest" style={{ fontSize: `calc(${contentFontSize} - 4px)` }}>{row.label}</td>
                            <td className="p-4 font-black text-gray-700 text-right whitespace-nowrap leading-none" style={{ fontSize: contentFontSize }}>Rs. {(row.value || 0).toLocaleString()} /-</td>
                          </tr>
                        ))}
                        {(commercialConfig?.visibility?.showNetCost !== false) && (
                          <tr className="text-white shadow-inner" style={{ backgroundColor: themeAccent }}>
                            <td className="p-4 text-[11px] font-black uppercase tracking-widest">Net Cost</td>
                            <td className="p-4 text-xl font-black text-right whitespace-nowrap leading-none">Rs. {(grandTotal || pricingData.netCost || 0).toLocaleString()} /-</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Package Image */}
                  <div className="text-center flex flex-col items-center mt-10">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30" />
                      <img
                        src={kitImage || packageImage || "https://img.icons8.com/illustrations/external-flaticons-lineal-color-flat-icons/256/external-solar-energy-ecology-flaticons-lineal-color-flat-icons-2.png"}
                        alt=""
                        className="w-64 h-64 object-contain relative z-10"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            // ============ FINANCIAL SUMMARY ============
            if (pageName === 'Financial Summary') {
              const financialConfig = getPageConfig('Financial Summary');
              return (
                <div key={page.id} className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden shadow-xl mb-8">
                  <div className="px-8 py-4 text-white shadow-md" style={{ backgroundColor: themeAccent }}>
                    <h5 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Residential Solar BOM</h5>
                  </div>
                  <div className="p-8">
                    {(financialConfig?.visibility?.showBomTable !== false) && bomData.items.length > 0 && (
                      <table className="w-full border-collapse mb-8">
                        <tbody>
                          {bomData.items.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="py-3 font-black text-gray-400 uppercase tracking-widest" style={{ fontSize: `calc(${contentFontSize} - 2px)` }}>{row.label}</td>
                              <td className="py-3 font-bold text-gray-700 text-right" style={{ fontSize: contentFontSize }}>{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {(financialConfig?.visibility?.showPipesTable !== false) && bomData.pipes.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-6">
                        <table className="w-full text-[10px] text-center">
                          <thead className="text-white" style={{ backgroundColor: themeAccent }}>
                            <tr>
                              <th className="py-2 px-1 font-black uppercase" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>No. of Solar Panels</th>
                              <th className="py-2 px-1 font-black uppercase" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>DC K.W.</th>
                              <th className="py-2 px-1 font-black uppercase" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>GI pipe 2 mm 60x40</th>
                              <th className="py-2 px-1 font-black uppercase">GI pipe 2 mm 40x40</th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-gray-600">
                            {bomData.pipes.map((pipe, i) => (
                              <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-white'}`}>
                                <td className="py-2 border-r border-gray-100">{pipe.panels}</td>
                                <td className="py-2 border-r border-gray-100">{pipe.kw}</td>
                                <td className="py-2 border-r border-gray-100">{pipe.size1}</td>
                                <td className="py-2">{pipe.size2}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {bomData.heightNote && (
                      <p className="text-[9px] font-bold text-gray-400 italic mb-8">
                        <span className="text-red-500 font-black">*</span> {bomData.heightNote}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-8">
                      {(financialConfig?.visibility?.showNotes !== false) && (
                        <div>
                          <h6 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-3 border-b-2 pb-1 w-fit" style={{ borderBottomColor: themeAccent }}>Notes</h6>
                          <ul className="space-y-1.5">
                            {['Bi-directional meter charges as per GUVNL.', 'Extra DISCOM quotation charges to be paid by customer.', 'Civil work at site is customer\'s responsibility.', '25-year linear performance warranty in solar panel.'].map((note, i) => (
                              <li key={i} className="text-[9px] font-bold text-gray-500 flex items-start gap-1.5">
                                <div className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ backgroundColor: themeAccent }} />
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(financialConfig?.visibility?.showDocuments !== false) && (
                        <div>
                          <h6 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-3 border-b-2 pb-1 w-fit" style={{ borderBottomColor: themeAccent }}>Documents Required</h6>
                          <ul className="space-y-1.5">
                            {['Electricity Bill - Latest', 'House Location from Google Map', 'Cancelled Cheque / Passbook First Page', 'Email ID', 'Aadhaar Card', 'PAN Card (if Loan)'].map((doc, i) => (
                              <li key={i} className="text-[9px] font-bold text-gray-500 flex items-start gap-1.5">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1 shrink-0" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // ============ GENERATION GRAPH ============
            if (pageName === 'Generation Graph') {
              const generationConfig = getPageConfig('Generation Graph');
              return (
                <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                  <div className="px-8 py-6 text-white text-center transition-all" style={{ background: `linear-gradient(to right, ${themeAccent}, ${themeAccent}CC)` }}>
                    <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Performance Analysis</h3>
                    <p className="font-bold uppercase tracking-widest opacity-80" style={{ fontSize: `calc(${contentFontSize} - 4px)` }}>Projected Energy Generation & Financial Benefits</p>
                  </div>
                  
                  <div className="p-8" style={{ backgroundColor: themeBgColor }}>
                    {(generationConfig?.visibility?.showGenChart !== false) && (
                      <div className="mb-10">
                        <div className="flex items-center justify-between mb-4 px-1">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Monthly Generation (Units)</h5>
                          <div className="px-3 py-1.5 rounded-xl text-white shadow-lg transition-all flex items-center gap-2 border" style={{ backgroundColor: themeAccent, borderColor: themeAccent }}>
                            <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{annualTotal.toLocaleString()} Annual Units</span>
                          </div>
                        </div>
                        <div className="h-64 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4 relative">
                          <canvas ref={generationChartRef} />
                        </div>
                      </div>
                    )}

                    {(generationConfig?.visibility?.showRoiChart !== false) && (
                      <div className="mb-10">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ROI Analysis (Payback Period)</h5>
                        <div className="h-64 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
                          <canvas ref={roiChartRef} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {(generationConfig?.visibility?.showStatsTable !== false) && [
                        { label: 'Total System Cost', value: `Rs. ${netCost.toLocaleString()} /-`, color: 'blue' },
                        { label: 'Annual Generation', value: `${annualTotal.toLocaleString()} Units`, color: 'blue' },
                        { label: 'Annual Savings', value: `Rs. ${annualSavings.toLocaleString()} /-`, color: 'emerald' },
                        { label: 'Payback Period', value: `${paybackPeriod.toFixed(1)} Years`, color: 'amber' },
                        { label: '25-Year Savings', value: `Rs. ${savings25Year.toLocaleString()} /-`, color: 'blue', full: true }
                      ].map((stat, i) => (
                        <div key={i} className={`${stat.full ? 'col-span-2' : ''} p-5 rounded-2xl border border-gray-100 shadow-sm hover:scale-[1.02] transition-transform`} style={{ backgroundColor: stat.color === 'blue' ? themeBgLight : stat.color === 'emerald' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)' }}>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-lg font-black transition-colors" style={{ color: stat.color === 'blue' ? themeAccent : stat.color === 'emerald' ? 'rgb(5, 150, 105)' : 'rgb(217, 119, 6)' }}>{stat.value}</p>
                        </div>
                      ))}
                      {(generationConfig?.visibility?.showRoiBanner !== false) && (
                        <div className="col-span-2 p-6 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center mt-2 transition-all" style={{ backgroundColor: themeAccent }}>
                          <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Total Estimated ROI Benefits</p>
                          <p className="text-xl font-black text-white uppercase tracking-tighter">Over 25 Year Lifecycle</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // ============ ADVANCED SETTINGS ============
            if (pageName === 'Advanced Settings') {
              const advCfg = getPageConfig('Advanced Settings');
              const vis = advCfg.visibility || {};
              
              const activeSections = [
                ...(vis.showAccessories !== false ? [{ id: 'std_accessories', label: 'Inverter & Module Details' }] : []),
                ...(vis.showEarthing !== false ? [{ id: 'std_earthing', label: 'Earthing & Protection' }] : []),
                ...(vis.showInstallation !== false ? [{ id: 'std_installation', label: 'Installation Standard' }] : []),
                ...(vis.showAMC !== false ? [{ id: 'std_amc', label: 'AMC / Maintenance Offer' }] : []),
                ...(advCfg.customSections || []).filter(s => vis[`custom_${s.id}`] !== false)
              ];

              return (
                <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                  <div className="px-8 py-5 text-white" style={{ backgroundColor: themeAccent }}>
                    <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Advanced Options</h3>
                  </div>
                  <div className="p-8" style={{ backgroundColor: themeBgColor }}>
                    <div className="mb-8">
                      <label className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: themeAccent }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeAccent }} />
                        Selected Options Breakout
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {advancedOptions.filter(opt => opt.enabled).map((opt, idx) => (
                          <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest" style={{ backgroundColor: themeAccent }}>
                              {idx % 3 === 0 ? 'Premium' : idx % 3 === 1 ? 'Protection' : 'Add-on'}
                            </div>
                            <h6 className="text-[11px] font-black text-gray-800 uppercase mb-2">{opt.type}</h6>
                            <p className="text-[10px] font-black mb-3" style={{ color: themeAccent }}>₹{(opt.price || 0).toLocaleString()}{opt.key !== 'cleaningKit' ? '/year' : ''}</p>
                            <p className="text-[9px] font-bold text-gray-500 leading-relaxed uppercase">{opt.description}</p>
                          </div>
                        ))}
                        {advancedOptions.every(v => !v.enabled) && (
                          <div className="col-span-2 p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Advanced Options Selected</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grand Total Card */}
                    <div className="rounded-3xl p-8 flex flex-col gap-4 shadow-2xl" style={{ backgroundColor: '#111827', border: `1px solid ${themeAccent}33` }}>
                      <div className="flex justify-between items-center text-white/60">
                        <span className="text-[10px] font-black uppercase tracking-widest">Solar System Cost</span>
                        <span className="text-sm font-bold tracking-tighter text-white">Rs. {netCost.toLocaleString()} /-</span>
                      </div>
                      <div className="flex justify-between items-center text-white/60 border-b border-white/10 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest">Advanced Options Total</span>
                        <span className="text-sm font-bold tracking-tighter" style={{ color: themeAccent }}>Rs. {advancedTotal.toLocaleString()} /-</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-tighter" style={{ color: themeAccent }}>Grand Total</span>
                        <span className="text-2xl font-black text-white tracking-widest">Rs. {(netCost + advancedTotal).toLocaleString()} /-</span>
                      </div>
                      <p className="text-[9px] font-bold text-center text-white/40 uppercase tracking-widest mt-2 border-t border-white/5 pt-4">All Prices are inclusive of GST and Govt Incentives</p>
                    </div>

                    {activeSections.length > 0 && (
                      <div className="mt-8 space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Sections Provided</p>
                        {activeSections.map((s) => (
                          <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: themeAccent }} />
                              <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{s.label}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-all" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Included</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // ============ PAYMENT TERMS ============
            if (pageName === 'Payment Terms') {
              if (paymentModesSelected.length === 0) return null;
              return (
                <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                  <div className="px-8 py-6 text-white text-center transition-all" style={{ background: `linear-gradient(to right, ${themeAccent}, ${themeBgStrong})` }}>
                    <h3 className="font-black uppercase tracking-tighter" style={{ fontSize: sectionTitleFontSize }}>Payment Options</h3>
                    <p className="font-bold uppercase tracking-widest opacity-80" style={{ fontSize: `calc(${contentFontSize} - 4px)` }}>Flexible Financing & Secured Payment Methods</p>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid grid-cols-1 gap-6">
                      {paymentModesSelected.includes('Cash') && (
                        <div className="p-6 rounded-3xl border" style={{ borderColor: `${themeAccent}33`, backgroundColor: `${themeAccent}10` }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: themeAccent }}>
                              <Calculator size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Full Cash Payment</h4>
                              <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: themeAccent }}>Upfront Payment Benefit Available</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: `${themeAccent}20` }}>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lumpsum Amount</span>
                              <span className="text-base font-black text-gray-800">₹ {(netCost + advancedTotal).toLocaleString()} /-</span>
                            </div>
                            <div className="px-1">
                              <p className="text-[9px] font-bold text-gray-500 leading-relaxed uppercase">
                                • 100% payment before installation commissioning.<br/>
                                • Includes all standard warranties and support.<br/>
                                • No interest charges or hidden finance costs.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentModesSelected.includes('Loan') && (
                        <div className="p-6 rounded-3xl border" style={{ borderColor: `${themeAccent}33`, backgroundColor: `${themeAccent}10` }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: themeAccent }}>
                              <Shield size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Bank Finance / Loan</h4>
                              <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: themeAccent }}>Low Interest Solar Financing</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)', borderColor: `${themeAccent}20` }}>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Down Payment</p>
                              <p className="text-sm font-black text-gray-800">₹ {Math.round((netCost + advancedTotal) * 0.2).toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)', borderColor: `${themeAccent}20` }}>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Max tenure</p>
                              <p className="text-sm font-black text-gray-800">7 Years</p>
                            </div>
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 mt-4 leading-relaxed px-1 italic">
                            * Subject to bank approval and credit score. Standard interest rates apply as per bank norms. Processing fees may be applicable.
                          </p>
                        </div>
                      )}

                      {paymentModesSelected.includes('EMI') && (
                        <div className="p-6 rounded-3xl border" style={{ borderColor: `${themeAccent}33`, backgroundColor: `${themeAccent}10` }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: themeAccent }}>
                              <Zap size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Easy EMI Installments</h4>
                              <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: themeAccent }}>Monthly Payment Flexibility</p>
                            </div>
                          </div>
                          <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ backgroundColor: themeBgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.1)', borderColor: `${themeAccent}20` }}>
                            <table className="w-full text-[10px]">
                              <thead className="text-white font-black uppercase tracking-widest" style={{ backgroundColor: themeAccent }}>
                                <tr>
                                  <th className="py-3 px-4 text-left">Tenure Plan</th>
                                  <th className="py-3 px-4 text-right">Approx. EMI Plan</th>
                                </tr>
                              </thead>
                              <tbody className="font-bold text-gray-700">
                                <tr className="border-b" style={{ borderBottomColor: `${themeAccent}10` }}>
                                  <td className="py-3 px-4 uppercase tracking-tighter">12 Months (Standard)</td>
                                  <td className="py-3 px-4 text-right">₹ {Math.round((netCost + advancedTotal) / 12).toLocaleString()}</td>
                                </tr>
                                <tr className="border-b" style={{ backgroundColor: `${themeAccent}05`, borderBottomColor: `${themeAccent}10` }}>
                                  <td className="py-3 px-4 uppercase tracking-tighter">24 Months (Saver)</td>
                                  <td className="py-3 px-4 text-right">₹ {Math.round((netCost + advancedTotal) / 24).toLocaleString()}</td>
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 uppercase tracking-tighter font-black" style={{ color: themeAccent }}>36 Months (Budget)</td>
                                  <td className="py-3 px-4 text-right font-black" style={{ color: themeAccent }}>₹ {Math.round((netCost + advancedTotal) / 36).toLocaleString()}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 p-6 bg-gray-900 rounded-[2rem] text-center border-t-4 shadow-xl" style={{ borderColor: themeAccent }}>
                      <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3">Professional Terms of Payment</p>
                      <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">
                        Prices include site survey, installation, and commissioning. <br/>
                        Incentives are subject to DISCOM & MNRE guidelines at the time of installation.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // ============ DYNAMIC CUSTOM PAGES ============
            const thisCfg = getPageConfig(pageName);
            const customSections = (thisCfg?.customSections || []).filter(
              s => (thisCfg.visibility || {})[`custom_${s.id}`] !== false
            );

            return (
              <div key={page.id} className="pdf-page rounded-[2rem] overflow-hidden shadow-xl mb-8 border-2 border-gray-100" style={{ backgroundColor: themeBgColor }}>
                <div className="px-8 py-5 border-b flex justify-between items-center" style={{ backgroundColor: themeBgFaint, borderBottomColor: themeBgSemi }}>
                  <h3 className="text-xl font-black uppercase tracking-tighter" style={{ color: themeAccent }}>{pageName}</h3>
                  <div className="px-3 py-1 text-white text-[9px] font-black uppercase rounded-full shadow-sm" style={{ backgroundColor: themeAccent }}>Custom Page</div>
                </div>
                
                <div className="p-8">
                  {thisCfg?.media && (
                    <div className="mb-6 h-48 w-full rounded-2xl overflow-hidden shadow-inner">
                      <img src={thisCfg.media} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <div className="space-y-4">
                    {thisCfg?.header && (
                      <h4 className="text-sm font-black uppercase tracking-widest border-b pb-2 transition-colors" style={{ color: themeAccent, borderBottomColor: themeBgLight }}>{thisCfg.header}</h4>
                    )}
                    <p className="text-xs font-bold text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {thisCfg?.content || 'This page was dynamically added to the quote.'}
                    </p>
                    {thisCfg?.footer && (
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-6 border-t">{thisCfg.footer}</p>
                    )}

                    {customSections.length > 0 && (
                      <div className="mt-8 space-y-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">Sections Provided</p>
                        {customSections.map((s) => (
                          <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: themeAccent }} />
                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{s.label}</span>
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ color: themeAccent, backgroundColor: themeBgLight }}>Included</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by SOLARKITS ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
