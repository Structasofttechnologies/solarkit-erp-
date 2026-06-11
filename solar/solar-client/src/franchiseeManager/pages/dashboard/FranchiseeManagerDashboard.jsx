import React, { useEffect, useRef } from 'react';
import {
    Eye,
    Home,
    BarChart3,
    PieChart,
    Crown,
    Zap,
    IndianRupee,
    Calendar,
    TrendingUp,
    MapPin,
    Users,
    Building2,
    Briefcase,
    Sun,
    Wind,
    Grid3x3,
    Filter,
    X
} from 'lucide-react';
import Chart from 'react-apexcharts';

const FranchiseeManagerDashboard = () => {
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);

    // Chart configurations
    const donutChartOptions = {
        series: [60, 40],
        options: {
            chart: {
                type: 'donut',
                height: 300,
            },
            labels: ['Residential', 'Commercial'],
            colors: ['#2C599D', '#F98125'],
            legend: {
                position: 'bottom',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                    },
                },
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        height: 250,
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            }],
        },
    };

    const enterpriseOptions = {
        ...donutChartOptions,
        series: [45, 55],
    };

    const solarOptions = {
        ...donutChartOptions,
        series: [70, 30],
    };

    const partneredOptions = {
        ...donutChartOptions,
        series: [50, 50],
    };

    const brandKwOptions = {
        series: [20, 15, 25, 10, 30],
        options: {
            chart: {
                type: 'donut',
                height: 400,
            },
            labels: [
                'Tata - 3kW',
                'Adani - 5kW',
                'Luminous - 2kW',
                'Vikram - 10kW',
                'Waaree - 3kW',
            ],
            colors: ['#1abc9c', '#f39c12', '#3498db', '#e74c3c', '#9b59b6'],
            legend: {
                position: 'bottom',
                fontSize: '14px',
            },
            tooltip: {
                y: {
                    formatter: (val) => `${val} Orders`,
                },
            },
            title: {
                text: 'Order Distribution by Brand & kW',
                align: 'center',
                style: {
                    fontSize: '14px',
                    fontWeight: 500,
                },
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        height: 300,
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            }],
        },
    };

    useEffect(() => {
        // Load Google Maps API
        const loadGoogleMaps = () => {
            if (!window.google) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCGt03YWLd6CUTWIZQlBDtdvrTAAIfSqlM&callback=initMap`;
                script.async = true;
                script.defer = true;
                window.initMap = initMap;
                document.head.appendChild(script);
            } else {
                initMap();
            }
        };

        const initMap = () => {
            if (!mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 7,
                center: { lat: 22.9734, lng: 72.5700 }, // Center of Gujarat
            });

            const districts = [
                {
                    name: 'Rajkot',
                    message: '22',
                    position: { lat: 22.3039, lng: 70.8022 },
                },
                {
                    name: 'Surat',
                    message: '12',
                    position: { lat: 21.1702, lng: 72.8311 },
                },
                {
                    name: 'Vadodara',
                    message: '16',
                    position: { lat: 22.3072, lng: 73.1812 },
                },
                {
                    name: 'Ahmedabad',
                    message: '28',
                    position: { lat: 23.0225, lng: 72.5714 },
                },
                {
                    name: 'Bhavnagar',
                    message: '5',
                    position: { lat: 21.7645, lng: 72.1519 },
                },
            ];

            districts.forEach((d) => {
                const marker = new window.google.maps.Marker({
                    position: d.position,
                    map,
                    title: d.name,
                });

                const info = new window.google.maps.InfoWindow({
                    content: `<strong>${d.name}</strong><br><strong>Total CP: ${d.message}</strong>`,
                });

                marker.addListener('click', () => {
                    info.open(map, marker);
                });
            });
        };

        loadGoogleMaps();
    }, []);

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Dashboard Header */}
            <div
                className="text-white p-4 rounded-2xl mb-4 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)' }}
            >
                <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Home className="mr-2" size={28} />
                        Franchisee Manager Dashboard
                    </h2>
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {/* Total Leads */}
                <div className="bg-white rounded-lg p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 border-l-4 border-blue-500">
                    <div className="text-2xl font-bold">96</div>
                    <div className="text-gray-600 text-sm">Total Leads</div>
                </div>

                {/* App Demo Sessions */}
                <div className="bg-white rounded-lg p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 border-l-4 border-purple-500">
                    <div className="text-2xl font-bold">48</div>
                    <div className="text-gray-600 text-sm">App Demos</div>
                </div>

                {/* CP Signups */}
                <div className="bg-white rounded-lg p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 border-l-4 border-green-500">
                    <div className="text-2xl font-bold">22</div>
                    <div className="text-gray-600 text-sm">CP Signups</div>
                </div>

                {/* Active CPs */}
                <div className="bg-white rounded-lg p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 border-l-4 border-yellow-500">
                    <div className="text-2xl font-bold">22</div>
                    <div className="text-gray-600 text-sm">Active CPs</div>
                </div>

                {/* Conversion Ratio */}
                <div className="bg-white rounded-lg p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 border-l-4 border-red-500">
                    <div className="text-2xl font-bold">67%</div>
                    <div className="text-gray-600 text-sm">Conversion Ratio</div>
                </div>

                {/* My Commission */}
                <div className="bg-white rounded-lg p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 border-l-4 border-teal-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-2xl font-bold">₹24,500</div>
                            <div className="text-gray-600 text-sm">My Commission</div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Eye size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Commission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xl font-semibold">Performer Commission Information</h4>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Franchisee Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Performer Commission
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order(Kw)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order Commission(Rs)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap">Sharad Patel</td>
                                            <td className="px-6 py-4 whitespace-nowrap">Eligible</td>
                                            <td className="px-6 py-4 whitespace-nowrap">35Kw</td>
                                            <td className="px-6 py-4 whitespace-nowrap">₹55,000</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap">Kaushik Mehta</td>
                                            <td className="px-6 py-4 whitespace-nowrap">Eligible</td>
                                            <td className="px-6 py-4 whitespace-nowrap">55Kw</td>
                                            <td className="px-6 py-4 whitespace-nowrap">₹80,500</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap">Dhruv Shah</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-red-600">Not Eligible</td>
                                            <td className="px-6 py-4 whitespace-nowrap">-</td>
                                            <td className="px-6 py-4 whitespace-nowrap">-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <hr className="my-6 border-gray-200" />

            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Select Franchisee Type</option>
                    <option value="starter">Starter</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="solarbusiness">Solar Business</option>
                </select>

                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Select Franchisee</option>
                    <option value="performer">Performer</option>
                    <option value="active">Active</option>
                    <option value="inactive">In-Active</option>
                </select>

                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Select Cluster</option>
                    <option value="rajkot">Rajkot</option>
                    <option value="ahmedabad">Ahmedabad</option>
                    <option value="baroda">Baroda</option>
                </select>

                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Select District</option>
                    <option value="tankara">Tankara</option>
                    <option value="morbi">Morbi</option>
                    <option value="gondal">Gondal</option>
                    <option value="jasdan">Jasdan</option>
                </select>

                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Select Category</option>
                    <option value="solarrooftop">Solar Rooftop</option>
                    <option value="solarpump">Solar Pump</option>
                </select>

                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Select Sub Category</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                </select>

                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Project Type</option>
                    <option value="3-5kw">3kw - 5kw</option>
                    <option value="5-10kw">5kw - 10kw</option>
                    <option value="10-20kw">10kw - 20kw</option>
                </select>

                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option disabled selected>Select Sub type</option>
                    <option value="ongrid">Ongrid</option>
                    <option value="offgrid">Offgrid</option>
                    <option value="hybrid">Hybrid</option>
                </select>
            </div>

            {/* Map and Table Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Map */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-600 px-4 py-3">
                        <h5 className="text-white font-semibold flex items-center">
                            <MapPin className="mr-2" size={18} />
                            Gujarat District Map
                        </h5>
                    </div>
                    <div ref={mapRef} className="h-[450px] w-full" />
                </div>

                {/* Franchisee Commission Summary Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-600 px-4 py-3">
                        <h5 className="text-white font-semibold">Franchisee Commission Summary</h5>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Franchisee Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total KW</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[
                                    { id: 1, name: 'Rahul Sharma', location: 'Ahmedabad', orders: '35', kw: '10 KW', commission: '₹15,500', status: 'Active', statusClass: 'bg-yellow-100 text-yellow-800' },
                                    { id: 2, name: 'pankit Mehta', location: 'Surat', orders: '22', kw: '35 KW', commission: '₹9,800', status: 'Performer', statusClass: 'bg-green-100 text-green-800' },
                                    { id: 3, name: 'Vikram Patel', location: 'Vadodara', orders: '41', kw: '25 KW', commission: '₹19,200', status: 'Performer', statusClass: 'bg-green-100 text-green-800' },
                                    { id: 4, name: 'Naman Shah', location: 'Rajkot', orders: '18', kw: '8 KW', commission: '₹7,200', status: 'Active', statusClass: 'bg-yellow-100 text-yellow-800' },
                                    { id: 5, name: 'Vijay Patel', location: 'Vadodara', orders: '41', kw: '12 KW', commission: '₹19,200', status: 'Active', statusClass: 'bg-yellow-100 text-yellow-800' },
                                    { id: 6, name: 'Nishant Shah', location: 'Rajkot', orders: '18', kw: '48 KW', commission: '₹7,200', status: 'Performer', statusClass: 'bg-green-100 text-green-800' },
                                    { id: 7, name: 'Ganpat Shah', location: 'Rajkot', orders: '18', kw: '0 KW', commission: '₹7,200', status: 'Inactive', statusClass: 'bg-red-100 text-red-800' },
                                ].map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{row.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{row.location}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{row.orders}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{row.kw}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{row.commission}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.statusClass}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Donut Charts Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option disabled selected>Select District</option>
                        <option value="paddhari">Paddhari</option>
                        <option value="tankara">Tankara</option>
                        <option value="morbi">Morbi</option>
                    </select>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option disabled selected>Select Franchisee Type</option>
                        <option value="startup">StartUp</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="solarbusiness">Solar Business</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h5 className="text-blue-600 font-semibold mb-4">Franchisee - Paresh Raval</h5>
                        <Chart
                            options={donutChartOptions.options}
                            series={donutChartOptions.series}
                            type="donut"
                            height={250}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h5 className="text-green-600 font-semibold mb-4">Franchisee - Amit Gupta</h5>
                        <Chart
                            options={enterpriseOptions.options}
                            series={enterpriseOptions.series}
                            type="donut"
                            height={250}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h5 className="text-yellow-600 font-semibold mb-4">Franchisee - Rohit Sharma</h5>
                        <Chart
                            options={solarOptions.options}
                            series={solarOptions.series}
                            type="donut"
                            height={250}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h5 className="text-red-600 font-semibold mb-4">Franchisee - Jay Shah</h5>
                        <Chart
                            options={partneredOptions.options}
                            series={partneredOptions.series}
                            type="donut"
                            height={250}
                        />
                    </div>
                </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Bottom Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="w-full md:w-1/4">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option disabled selected>Select Project Type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option disabled selected>Select Project Type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option disabled selected>Select Time Period</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Bottom Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-600 px-4 py-3">
                        <h5 className="text-white font-semibold flex items-center">
                            <PieChart className="mr-2" size={18} />
                            Orders by Brand & kW
                        </h5>
                    </div>
                    <div className="p-4">
                        <Chart
                            options={brandKwOptions.options}
                            series={brandKwOptions.series}
                            type="donut"
                            height={300}
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-600 px-4 py-3">
                        <h5 className="text-white font-semibold flex items-center">
                            <BarChart3 className="mr-2" size={18} />
                            Brand & kW Order Summary
                        </h5>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <div className="text-blue-600 text-xs font-semibold mb-1">Total Orders</div>
                                <div className="text-2xl font-bold text-gray-900">120</div>
                                <div className="text-xs text-gray-500 mt-1">↑ 12%</div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                                <div className="text-blue-600 text-xs font-semibold mb-1">Top Brand</div>
                                <div className="text-lg font-bold text-green-600 flex items-center">
                                    <Crown className="mr-1" size={16} />
                                    Waaree
                                </div>
                                <div className="text-xs text-gray-500 mt-1">42 orders</div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                <div className="text-blue-600 text-xs font-semibold mb-1">Most Ordered kW</div>
                                <div className="text-lg font-bold text-yellow-600 flex items-center">
                                    <Zap className="mr-1" size={16} />
                                    3kW
                                </div>
                                <div className="text-xs text-gray-500 mt-1">35% of total</div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-teal-500">
                                <div className="text-blue-600 text-xs font-semibold mb-1">Avg Order Value</div>
                                <div className="text-lg font-bold text-teal-600 flex items-center">
                                    <IndianRupee className="mr-1" size={16} />
                                    18,200
                                </div>
                                <div className="text-xs text-gray-500 mt-1">± ₹2,400</div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                                <div className="text-blue-600 text-xs font-semibold mb-1">Total Avg Daily Order</div>
                                <div className="text-lg font-bold text-purple-600">4</div>
                                <div className="text-xs text-gray-500 mt-1">+28% weekly</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerDashboard;