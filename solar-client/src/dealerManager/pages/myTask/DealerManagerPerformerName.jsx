import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Gauge,
    MapPin,
    Store,
    Users,
    Bolt,
    ArrowLeft,
    City,
    LayerGroup,
    Building2,
    Briefcase,
    Sun,
    Zap,
    ChevronRight,
    Home,
    TrendingUp,
    Award,
    Star
} from 'lucide-react';

const DealerManagerPerformerName = () => {
    // State for navigation
    const [currentState, setCurrentState] = useState(null);
    const [currentCluster, setCurrentCluster] = useState(null);
    const [currentDistrict, setCurrentDistrict] = useState(null);
    const [currentDealerType, setCurrentDealerType] = useState(null);
    const [currentLocation, setCurrentLocation] = useState('India');

    // Sample data structure
    const data = {
        gujarat: {
            name: "Gujarat",
            clusters: {
                north_gujarat: {
                    name: "North Gujarat",
                    districts: {
                        ahmedabad: {
                            name: "Ahmedabad",
                            dealerTypes: {
                                startup: {
                                    name: "Startup",
                                    totalDealers: 15,
                                    totalKW: 320,
                                    dealers: [
                                        { name: "Ahmedabad Solar Co", kw: 52 },
                                        { name: "Green Energy Ahmedabad", kw: 48 },
                                        { name: "Sun Power Ahmedabad", kw: 45 },
                                        { name: "Eco Solutions", kw: 38 }
                                    ]
                                },
                                basic: {
                                    name: "Basic",
                                    totalDealers: 22,
                                    totalKW: 510,
                                    dealers: [
                                        { name: "Ahmedabad Power Solutions", kw: 75 },
                                        { name: "Reliable Energy", kw: 68 },
                                        { name: "City Solar Works", kw: 62 }
                                    ]
                                },
                                enterprise: {
                                    name: "Enterprise",
                                    totalDealers: 8,
                                    totalKW: 315,
                                    dealers: [
                                        { name: "MegaSolar Corp", kw: 98 },
                                        { name: "PowerMax Solutions", kw: 87 }
                                    ]
                                },
                                solarBusiness: {
                                    name: "Solar Business",
                                    totalDealers: 14,
                                    totalKW: 380,
                                    dealers: [
                                        { name: "SunPower Ventures", kw: 68 },
                                        { name: "SolarWorks Ltd", kw: 59 }
                                    ]
                                }
                            }
                        },
                        rajkot: {
                            name: "Rajkot",
                            dealerTypes: {
                                startup: {
                                    name: "Startup",
                                    totalDealers: 12,
                                    totalKW: 285,
                                    dealers: [
                                        { name: "SunTech Energy", kw: 45 },
                                        { name: "GreenVolt Solutions", kw: 38 },
                                        { name: "EcoPower Innovations", kw: 52 }
                                    ]
                                },
                                basic: {
                                    name: "Basic",
                                    totalDealers: 18,
                                    totalKW: 420,
                                    dealers: [
                                        { name: "DC Energy", kw: 67 },
                                        { name: "Ctron Energy", kw: 58 },
                                        { name: "PowerGrid Solutions", kw: 72 }
                                    ]
                                }
                            }
                        }
                    }
                },
                south_gujarat: {
                    name: "South Gujarat",
                    districts: {
                        surat: {
                            name: "Surat",
                            dealerTypes: {
                                startup: {
                                    name: "Startup",
                                    totalDealers: 10,
                                    totalKW: 240,
                                    dealers: [
                                        { name: "Surat Solar Solutions", kw: 55 },
                                        { name: "Diamond Energy", kw: 42 }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },
        maharashtra: {
            name: "Maharashtra",
            clusters: {
                western_mh: {
                    name: "Western Maharashtra",
                    districts: {
                        mumbai: {
                            name: "Mumbai",
                            dealerTypes: {
                                startup: {
                                    name: "Startup",
                                    totalDealers: 20,
                                    totalKW: 450,
                                    dealers: [
                                        { name: "Mumbai Solar Solutions", kw: 65 }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },
        rajasthan: {
            name: "Rajasthan",
            clusters: {
                central_rj: {
                    name: "Central Rajasthan",
                    districts: {
                        jaipur: {
                            name: "Jaipur",
                            dealerTypes: {
                                startup: {
                                    name: "Startup",
                                    totalDealers: 18,
                                    totalKW: 380,
                                    dealers: [
                                        { name: "Jaipur Solar Energy", kw: 72 },
                                        { name: "Pink City Solar", kw: 58 }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    // Helper functions
    const getTotalDealersInCluster = (cluster) => {
        let total = 0;
        for (const districtId in cluster.districts) {
            total += getTotalDealersInDistrict(cluster.districts[districtId]);
        }
        return total;
    };

    const getTotalKWInCluster = (cluster) => {
        let total = 0;
        for (const districtId in cluster.districts) {
            total += getTotalKWInDistrict(cluster.districts[districtId]);
        }
        return total;
    };

    const getTotalDealersInDistrict = (district) => {
        return Object.values(district.dealerTypes).reduce((sum, type) => sum + type.totalDealers, 0);
    };

    const getTotalKWInDistrict = (district) => {
        return Object.values(district.dealerTypes).reduce((sum, type) => sum + type.totalKW, 0);
    };

    // Navigation handlers
    const selectState = (stateId) => {
        setCurrentState(stateId);
        setCurrentCluster(null);
        setCurrentDistrict(null);
        setCurrentDealerType(null);
        setCurrentLocation(data[stateId].name);
    };

    const selectCluster = (clusterId) => {
        setCurrentCluster(clusterId);
        setCurrentDistrict(null);
        setCurrentDealerType(null);
        setCurrentLocation(`${data[currentState].name} - ${data[currentState].clusters[clusterId].name}`);
    };

    const selectDistrict = (districtId) => {
        setCurrentDistrict(districtId);
        setCurrentDealerType(null);
        setCurrentLocation(
            `${data[currentState].name} - ${data[currentState].clusters[currentCluster].name} - ${data[currentState].clusters[currentCluster].districts[districtId].name}`
        );
    };

    const selectDealerType = (typeId) => {
        setCurrentDealerType(typeId);
        setCurrentLocation(
            `${data[currentState].name} - ${data[currentState].clusters[currentCluster].name} - ${data[currentState].clusters[currentCluster].districts[currentDistrict].name} - ${data[currentState].clusters[currentCluster].districts[currentDistrict].dealerTypes[typeId].name}`
        );
    };

    const backToStates = () => {
        setCurrentState(null);
        setCurrentCluster(null);
        setCurrentDistrict(null);
        setCurrentDealerType(null);
        setCurrentLocation('India');
    };

    const backToClusters = () => {
        setCurrentCluster(null);
        setCurrentDistrict(null);
        setCurrentDealerType(null);
        setCurrentLocation(data[currentState].name);
    };

    const backToDistricts = () => {
        setCurrentDistrict(null);
        setCurrentDealerType(null);
        setCurrentLocation(`${data[currentState].name} - ${data[currentState].clusters[currentCluster].name}`);
    };

    const backToDealerTypes = () => {
        setCurrentDealerType(null);
        setCurrentLocation(
            `${data[currentState].name} - ${data[currentState].clusters[currentCluster].name} - ${data[currentState].clusters[currentCluster].districts[currentDistrict].name}`
        );
    };

    // Breadcrumb items
    const getBreadcrumbItems = () => {
        const items = [];

        // States link
        items.push({
            text: 'States',
            action: backToStates
        });

        if (currentState) {
            items.push({
                text: data[currentState].name,
                action: currentCluster ? backToClusters : null
            });
        }

        if (currentCluster) {
            items.push({
                text: data[currentState].clusters[currentCluster].name,
                action: currentDistrict ? backToDistricts : null
            });
        }

        if (currentDistrict) {
            items.push({
                text: data[currentState].clusters[currentCluster].districts[currentDistrict].name,
                action: currentDealerType ? backToDealerTypes : null
            });
        }

        if (currentDealerType) {
            items.push({
                text: data[currentState].clusters[currentCluster].districts[currentDistrict].dealerTypes[currentDealerType].name,
                action: null
            });
        }

        return items;
    };

    return (
        <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-xl mb-6 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center">
                            <Gauge className="w-6 h-6 mr-2" />
                            Dealer Management System
                        </h2>
                        <p className="text-blue-100 mt-1">Manage dealers across regions and types</p>
                    </div>
                    <div className="text-end bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <h4 className="text-lg font-semibold">Current: {currentLocation}</h4>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <nav className="mb-6" aria-label="breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                    {getBreadcrumbItems().map((item, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <li className={index === getBreadcrumbItems().length - 1 ? 'text-gray-600' : ''}>
                                {item.action ? (
                                    <button
                                        onClick={item.action}
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {item.text}
                                    </button>
                                ) : (
                                    <span className="text-gray-600">{item.text}</span>
                                )}
                            </li>
                        </React.Fragment>
                    ))}
                </ol>
            </nav>

            {/* Main Content */}
            <div className="space-y-6">
                {/* States Section */}
                {!currentState && (
                    <div>
                        <h3 className="text-xl font-semibold text-blue-600 mb-4">Select State / Cluster</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Gujarat Card */}
                            <div
                                onClick={() => selectState('gujarat')}
                                className="bg-green-600 text-white rounded-lg shadow-md p-5 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="text-lg font-bold">Gujarat</h5>
                                        <p className="text-green-100">Clusters: 2</p>
                                    </div>
                                    <MapPin className="w-8 h-8 text-green-200" />
                                </div>
                                <div className="mt-3 text-sm text-green-100">
                                    Dealers: 84 | KW: 1,950
                                </div>
                            </div>

                            {/* Maharashtra Card */}
                            <div
                                onClick={() => selectState('maharashtra')}
                                className="bg-green-600 text-white rounded-lg shadow-md p-5 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="text-lg font-bold">Maharashtra</h5>
                                        <p className="text-green-100">Clusters: 1</p>
                                    </div>
                                    <MapPin className="w-8 h-8 text-green-200" />
                                </div>
                                <div className="mt-3 text-sm text-green-100">
                                    Dealers: 20 | KW: 450
                                </div>
                            </div>

                            {/* Rajasthan Card */}
                            <div
                                onClick={() => selectState('rajasthan')}
                                className="bg-green-600 text-white rounded-lg shadow-md p-5 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="text-lg font-bold">Rajasthan</h5>
                                        <p className="text-green-100">Clusters: 1</p>
                                    </div>
                                    <MapPin className="w-8 h-8 text-green-200" />
                                </div>
                                <div className="mt-3 text-sm text-green-100">
                                    Dealers: 18 | KW: 380
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Clusters Section */}
                {currentState && !currentCluster && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-blue-600">Select Cluster</h3>
                            <button
                                onClick={backToStates}
                                className="flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to States
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(data[currentState].clusters).map(([clusterId, cluster]) => {
                                const totalDealers = getTotalDealersInCluster(cluster);
                                const totalKW = getTotalKWInCluster(cluster);

                                return (
                                    <div
                                        key={clusterId}
                                        onClick={() => selectCluster(clusterId)}
                                        className="bg-blue-600 text-white rounded-lg shadow-md p-5 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="text-lg font-bold">{cluster.name}</h5>
                                                <p className="text-blue-100">Districts: {Object.keys(cluster.districts).length}</p>
                                            </div>
                                            <LayerGroup className="w-8 h-8 text-blue-200" />
                                        </div>
                                        <div className="mt-3 text-sm text-blue-100">
                                            Dealers: {totalDealers} | KW: {totalKW}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Districts Section */}
                {currentState && currentCluster && !currentDistrict && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-blue-600">Select District</h3>
                            <button
                                onClick={backToClusters}
                                className="flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Clusters
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(data[currentState].clusters[currentCluster].districts).map(([districtId, district]) => {
                                const totalDealers = getTotalDealersInDistrict(district);
                                const totalKW = getTotalKWInDistrict(district);

                                return (
                                    <div
                                        key={districtId}
                                        onClick={() => selectDistrict(districtId)}
                                        className="bg-purple-600 text-white rounded-lg shadow-md p-5 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="text-lg font-bold">{district.name}</h5>
                                                <p className="text-purple-100">Dealer Types: {Object.keys(district.dealerTypes).length}</p>
                                            </div>
                                            <City className="w-8 h-8 text-purple-200" />
                                        </div>
                                        <div className="mt-3 text-sm text-purple-100">
                                            Dealers: {totalDealers} | KW: {totalKW}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Dealer Types Section */}
                {currentState && currentCluster && currentDistrict && !currentDealerType && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-blue-600">Select Dealer Type</h3>
                            <button
                                onClick={backToDistricts}
                                className="flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Districts
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(data[currentState].clusters[currentCluster].districts[currentDistrict].dealerTypes).map(([typeId, dealerType]) => (
                                <div
                                    key={typeId}
                                    onClick={() => selectDealerType(typeId)}
                                    className="bg-green-600 text-white rounded-lg shadow-md p-5 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="text-lg font-bold">{dealerType.name}</h5>
                                            <p className="text-green-100">Dealers: {dealerType.totalDealers}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-green-200" />
                                    </div>
                                    <div className="mt-3 text-sm text-green-100">
                                        KW Orders: {dealerType.totalKW}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dealers List Section */}
                {currentState && currentCluster && currentDistrict && currentDealerType && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-blue-600">Dealers List</h3>
                            <button
                                onClick={backToDealerTypes}
                                className="flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Types
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-cyan-500 text-white rounded-lg shadow-md p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h6 className="text-cyan-100">Total Dealers</h6>
                                        <h4 className="text-2xl font-bold">
                                            {data[currentState].clusters[currentCluster].districts[currentDistrict].dealerTypes[currentDealerType].totalDealers}
                                        </h4>
                                    </div>
                                    <Store className="w-8 h-8 text-cyan-200" />
                                </div>
                            </div>

                            <div className="bg-yellow-500 text-white rounded-lg shadow-md p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h6 className="text-yellow-100">Total KW Orders</h6>
                                        <h4 className="text-2xl font-bold">
                                            {data[currentState].clusters[currentCluster].districts[currentDistrict].dealerTypes[currentDealerType].totalKW}
                                        </h4>
                                    </div>
                                    <Bolt className="w-8 h-8 text-yellow-200" />
                                </div>
                            </div>
                        </div>

                        {/* Dealers Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data[currentState].clusters[currentCluster].districts[currentDistrict].dealerTypes[currentDealerType].dealers.map((dealer, index) => (
                                <Link
                                    key={index}
                                    to="/dealer-manager/dealer-dashboard"
                                    className="block transform transition-all hover:-translate-y-1"
                                >
                                    <div className="bg-cyan-500 text-white rounded-lg shadow-md p-5 h-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="text-lg font-bold">{dealer.name}</h5>
                                                <p className="text-cyan-100 mt-1">KW: {dealer.kw}</p>
                                            </div>
                                            <Store className="w-8 h-8 text-cyan-200" />
                                        </div>
                                        <div className="mt-4 text-right text-sm text-cyan-100">
                                            Click to view details <ChevronRight className="w-4 h-4 inline" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealerManagerPerformerName;