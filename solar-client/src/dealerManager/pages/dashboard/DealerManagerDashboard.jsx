import React, { useEffect, useRef, useState } from 'react';
import {
    Gauge,
    Eye,
    PieChart,
    BarChart3,
    Crown,
    Zap,
    Loader2
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { getDashboardStats } from '../../services/dashboardService';
import { getClustersHierarchy, getDistricts } from '../../../services/core/locationApi';

const DealerManagerDashboard = () => {
    const mapRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({
        totalLeads: 0,
        activeTasks: 0,
        dealersOnboarded: 0,
        activeProjects: 0,
        completedProjects: 0,
        conversionRatio: 0,
        myCommission: 0,
        commissionSummary: [],
        performerInfo: [],
        dealerPerformance: [],
        brandKwDistribution: { labels: [], series: [] },
        brandSummary: {
            totalOrders: 0,
            topBrand: 'N/A',
            mostOrderedKW: 'N/A',
            avgOrderValue: '₹0',
            avgDailyOrder: 0
        },
        mapData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clusters, setClusters] = useState([]);
    const [districts, setDistricts] = useState([]);

    // Chart configurations
    const starterOptions = {
        series: [60, 40],
        chart: { type: 'donut', height: 300 },
        labels: ['Residential', 'Commercial'],
        colors: ['#2C599D', '#F98125'],
        legend: { position: 'bottom' }
    };

    const enterpriseOptions = {
        series: [45, 55],
        chart: { type: 'donut', height: 300 },
        labels: ['Residential', 'Commercial'],
        colors: ['#2C599D', '#F98125'],
        legend: { position: 'bottom' }
    };

    const solarOptions = {
        series: [70, 30],
        chart: { type: 'donut', height: 300 },
        labels: ['Residential', 'Commercial'],
        colors: ['#2C599D', '#F98125'],
        legend: { position: 'bottom' }
    };

    const partneredOptions = {
        series: [50, 50],
        chart: { type: 'donut', height: 300 },
        labels: ['Residential', 'Commercial'],
        colors: ['#2C599D', '#F98125'],
        legend: { position: 'bottom' }
    };

    const brandKwOptions = {
        series: [20, 15, 25, 10, 30],
        chart: { type: 'donut', height: 400 },
        labels: ['Tata - 3kW', 'Adani - 5kW', 'Luminous - 2kW', 'Vikram - 10kW', 'Waaree - 3kW'],
        colors: ['#1abc9c', '#f39c12', '#3498db', '#e74c3c', '#9b59b6'],
        legend: { position: 'bottom' },
        tooltip: {
            y: { formatter: (val) => val + " Orders" }
        },
        title: {
            text: 'Order Distribution by Brand & kW',
            align: 'center',
            style: { fontSize: '14px' }
        }
    };

    useEffect(() => {
        getClustersHierarchy().then(res => setClusters(res || [])).catch(console.error);
        getDistricts().then(res => setDistricts(res || [])).catch(console.error);

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await getDashboardStats();
                if (response.success) {
                    setStats(response.stats);
                    console.log("[Dashboard DB Connected] Dynamic stats received successfully!");
                }
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        const loadGoogleMaps = () => {
            if (window.google) {
                initMap();
                return;
            }

            // check if script already exists to avoid multiple loads
            if (document.querySelector('script[src*="maps.googleapis.com"]')) {
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCGt03YWLd6CUTWIZQlBDtdvrTAAIfSqlM&callback=initMap`;
            script.async = true;
            script.defer = true;
            window.initMap = initMap;
            document.head.appendChild(script);
        };

        loadGoogleMaps();
    }, []);

    // Effect to update map when data is ready or changes
    useEffect(() => {
        if (window.google && stats.mapData.length > 0) {
            initMap();
        }
    }, [stats.mapData]);

    const initMap = () => {
        if (!window.google || !mapRef.current) return;

        const map = new window.google.maps.Map(mapRef.current, {
            zoom: 7,
            center: { lat: 22.9734, lng: 72.5700 }
        });

        const locations = stats.mapData.length > 0 ? stats.mapData : [
            { name: "Gujarat", position: { lat: 22.9734, lng: 72.5700 } }
        ];

        locations.forEach(d => {
            const marker = new window.google.maps.Marker({
                position: d.position || { lat: d.lat, lng: d.lng },
                map,
                title: d.name
            });

            const info = new window.google.maps.InfoWindow({
                content: `<strong>${d.name}</strong><br><strong>Total CPs: ${d.count || 0}</strong>`
            });

            marker.addListener("click", () => {
                info.open(map, marker);
            });
        });
    };

    return (
        <div className="container-fluid px-4 py-4">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] text-white p-4 rounded-2xl mb-4 shadow-lg">
                <div className="flex items-center">
                    <Gauge className="w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold">Dealer Manager Dashboard</h2>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 text-center">
                    {error}
                </div>
            ) : (
                <>
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                        {/* Total Leads */}
                        <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                            <div className="text-2xl font-bold">{stats.totalLeads}</div>
                            <div className="text-gray-600">Total Leads</div>
                        </div>

                        {/* App Demo Sessions / Active Tasks */}
                        <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-purple-500">
                            <div className="text-2xl font-bold">{stats.activeTasks}</div>
                            <div className="text-gray-600">Active Tasks</div>
                        </div>

                        {/* Dealer Signups */}
                        <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-green-500">
                            <div className="text-2xl font-bold">{stats.dealersOnboarded}</div>
                            <div className="text-gray-600">Dealer Signups</div>
                        </div>

                        {/* Active Projects */}
                        <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-yellow-500">
                            <div className="text-2xl font-bold">{stats.activeProjects}</div>
                            <div className="text-gray-600">Active Projects</div>
                        </div>

                        {/* Conversion Ratio */}
                        <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-red-500">
                            <div className="text-2xl font-bold">{stats.conversionRatio}%</div>
                            <div className="text-gray-600">Conversion Ratio</div>
                        </div>

                        {/* My Commission */}
                        <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-teal-500">
                            <div className="flex justify-between items-start">
                                <div className="text-2xl font-bold">₹{stats.myCommission?.toLocaleString() || 0}</div>
                                <button onClick={() => setIsModalOpen(true)}>
                                    <Eye className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                                </button>
                            </div>
                            <div className="text-gray-600">My Commission</div>
                        </div>
                    </div>

                    {/* Commission Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg w-full max-w-4xl mx-4">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xl font-bold">Performer Commission Information</h4>
                                        <button onClick={() => setIsModalOpen(false)} className="text-2xl hover:text-gray-600">&times;</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-blue-100">
                                                <tr>
                                                    <th className="p-3 text-left border">CP Name</th>
                                                    <th className="p-3 text-left border">Performer Commission</th>
                                                    <th className="p-3 text-left border">Order(Kw)</th>
                                                    <th className="p-3 text-left border">Order Commission(Rs)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.performerInfo?.length > 0 ? (
                                                    stats.performerInfo.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className="p-3 border font-inter">{row.name}</td>
                                                            <td className="p-3 border font-inter font-medium text-blue-600">{row.status}</td>
                                                            <td className="p-3 border font-inter">{row.kw}</td>
                                                            <td className="p-3 border font-inter font-bold">{row.commission}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="p-4 text-center text-gray-500 font-inter">No commission data found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                        >
                                            Close
                                        </button>
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                            Save changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <hr className="my-4" />

                    {/* Filters Row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="" disabled>Select Dealer Type</option>
                            <option value="starter">Starter</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="solarbusiness">Solar Business</option>
                        </select>

                        <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="" disabled>Select Dealer</option>
                            <option value="performer">Performer</option>
                            <option value="active">Active</option>
                            <option value="inactive">In-Active</option>
                        </select>

                        <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="" disabled>Select Cluster</option>
                            {clusters.map(cluster => (
                                <option key={cluster._id} value={cluster.name}>{cluster.name}</option>
                            ))}
                        </select>

                        <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="" disabled>Select District</option>
                            {districts.map(district => (
                                <option key={district._id} value={district.name}>{district.name}</option>
                            ))}
                        </select>

                        <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="" disabled>Select Project Type</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                        </select>
                    </div>

                    {/* Map and Table Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {/* Map */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-blue-500 text-white p-3">
                                <h5 className="text-lg font-semibold">Gujarat District Map</h5>
                            </div>
                            <div ref={mapRef} className="h-[450px] w-full"></div>
                        </div>

                        {/* Dealer Commission Table */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-blue-500 text-white p-3">
                                <h5 className="text-lg font-semibold">Dealer Commission Summary</h5>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-center">#</th>
                                            <th className="p-3 text-center">Dealer Name</th>
                                            <th className="p-3 text-center">Location</th>
                                            <th className="p-3 text-center">Total Orders</th>
                                            <th className="p-3 text-center">Total KW</th>
                                            <th className="p-3 text-center">Commission</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.commissionSummary?.length > 0 ? (
                                            stats.commissionSummary.map((row, idx) => (
                                                <tr key={idx} className="border-t hover:bg-gray-50">
                                                    <td className="p-3 text-center font-inter">{idx + 1}</td>
                                                    <td className="p-3 text-center font-inter font-medium">{row.name}</td>
                                                    <td className="p-3 text-center font-inter">{row.location}</td>
                                                    <td className="p-3 text-center font-inter">{row.orders}</td>
                                                    <td className="p-3 text-center font-inter">{row.kw}</td>
                                                    <td className="p-3 text-center font-inter font-bold">{row.commission}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-white text-xs ${row.badge}`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center text-gray-500 font-inter">No dealer data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* Donut Charts Section */}
                    <div className="bg-white rounded-lg p-4 shadow-lg mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select District</option>
                                {districts.map(district => (
                                    <option key={district._id} value={district.name}>{district.name}</option>
                                ))}
                            </select>
                            <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select Dealer Type</option>
                                <option value="startup">StartUp</option>
                                <option value="enterprise">Enterprise</option>
                                <option value="solarbusiness">Solar Business</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.dealerPerformance?.length > 0 ? (
                                stats.dealerPerformance.map((dealer, idx) => (
                                    <div key={idx} className="bg-white rounded-lg shadow p-3 border-t-4 border-blue-500 hover:shadow-md transition-shadow">
                                        <h5 className="text-gray-800 font-bold mb-2 font-inter text-center">{dealer.name}</h5>
                                        <Chart
                                            options={{
                                                chart: { type: 'donut', height: 250 },
                                                labels: dealer.labels,
                                                colors: ['#2C599D', '#F98125'],
                                                legend: { position: 'bottom' }
                                            }}
                                            series={dealer.series}
                                            type="donut"
                                            height={250}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-gray-500 font-inter bg-gray-50 rounded-xl border-2 border-dashed">
                                    No dealer performance data found
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* Final Filters Row */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="w-full md:w-1/4">
                            <select defaultValue="" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select Project Type</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>
                        <div className="w-full md:w-2/4 flex gap-4">
                            <select defaultValue="" className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select Project Type</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                            </select>
                            <select defaultValue="" className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select Time Period</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Brand & kW Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Pie Chart */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-blue-500 text-white p-3 rounded-t-lg">
                                <h5 className="flex items-center text-lg font-semibold">
                                    <PieChart className="w-5 h-5 mr-2" />
                                    Orders by Brand & kW
                                </h5>
                            </div>
                            <div className="p-4">
                                {stats.brandKwDistribution?.series?.length > 0 ? (
                                    <Chart
                                        options={{
                                            ...brandKwOptions,
                                            labels: stats.brandKwDistribution.labels
                                        }}
                                        series={stats.brandKwDistribution.series}
                                        type="donut"
                                        height={300}
                                    />
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-gray-400 font-inter">No orders recorded yet</div>
                                )}
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-blue-500 text-white p-3 rounded-t-lg">
                                <h5 className="flex items-center text-lg font-semibold">
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    Brand & kW Order Summary
                                </h5>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {/* Total Orders */}
                                    <div className="bg-gray-100 p-3 rounded border-4 border-blue-500">
                                        <div className="text-blue-500 text-xs font-semibold mb-1">Total Orders</div>
                                        <div className="text-2xl font-bold">{stats.brandSummary.totalOrders}</div>
                                        <div className="text-xs text-gray-600 mt-1 font-inter">Across all dealers</div>
                                    </div>

                                    {/* Top Brand */}
                                    <div className="bg-gray-100 p-3 rounded border-4 border-blue-500">
                                        <div className="text-blue-500 text-xs font-semibold mb-1">Top Brand</div>
                                        <div className="text-lg font-bold text-green-600 flex items-center font-inter truncate">
                                            <Crown className="w-4 h-4 mr-1 flex-shrink-0" /> {stats.brandSummary.topBrand}
                                        </div>
                                        <div className="text-xs text-gray-500 font-inter">Highest order volume</div>
                                    </div>

                                    {/* Most Ordered kW */}
                                    <div className="bg-gray-100 p-3 rounded border-4 border-blue-500">
                                        <div className="text-blue-500 text-xs font-semibold mb-1">Most Ordered kW</div>
                                        <div className="text-lg font-bold text-yellow-600 flex items-center font-inter">
                                            <Zap className="w-4 h-4 mr-1" /> {stats.brandSummary.mostOrderedKW}
                                        </div>
                                        <div className="text-xs text-gray-500 font-inter">Standard preference</div>
                                    </div>

                                    {/* Avg Order Value */}
                                    <div className="bg-gray-100 p-3 rounded border-4 border-blue-500">
                                        <div className="text-blue-500 text-xs font-semibold mb-1">Avg Project Value</div>
                                        <div className="text-lg font-bold text-cyan-600 font-inter">{stats.brandSummary.avgOrderValue}</div>
                                        <div className="text-xs text-gray-500 font-inter">Per project avg</div>
                                    </div>

                                    {/* Peak Order Day */}
                                    <div className="bg-gray-100 p-3 rounded border-4 border-blue-500">
                                        <div className="text-blue-500 text-xs font-semibold mb-1">Avg Daily Velocity</div>
                                        <div className="text-lg font-bold text-green-600 font-inter">{stats.brandSummary.avgDailyOrder} Projects</div>
                                        <div className="text-xs text-gray-500 font-inter">Monthly forecast avg</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DealerManagerDashboard;