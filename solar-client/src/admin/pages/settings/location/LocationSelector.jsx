'use client';

import React, { useState, useEffect } from 'react';
import { locationAPI } from '../../../../api/api';

/**
 * LocationSelector Component
 * 
 * Manages the hierarchy: Country -> State -> City -> District -> Cluster -> Zone
 * 
 * Props:
 * - values: { country: '', state: '', city: '', district: '', cluster: '', zone: '' }
 * - onChange: (updatedValues) => void
 * - errors: {} // Optional error messages
 * - layout: 'grid' | 'stack' // Optional layout preference
 * - showLevels: string[] // Optional, e.g., ['country', 'state', 'city']
 */
const LocationSelector = ({
    values = {},
    onChange,
    errors = {},
    layout = 'grid',
    showLevels: showLevelsProp,
    upto, // optional: 'country', 'state', 'district', 'cluster', 'zone', 'city'
    multiple = {}, // e.g. { district: true, cluster: true, zone: true }
    isZoneMode = false // true when activeTab === 'zones'
}) => {
    const levels = isZoneMode
        ? ['country', 'state', 'cluster', 'district', 'zone', 'city']
        : ['country', 'state', 'district', 'cluster', 'zone', 'city'];
    const showLevels = showLevelsProp || (upto ? levels.slice(0, levels.indexOf(upto) + 1) : levels);
    const [data, setData] = useState({
        countries: [],
        states: [],
        cities: [],
        districts: [],
        clusters: [],
        zones: []
    });

    const [loading, setLoading] = useState({
        countries: false,
        states: false,
        cities: false,
        districts: false,
        clusters: false,
        zones: false
    });

    // Load countries on mount
    useEffect(() => {
        if (showLevels.includes('country')) {
            fetchCountries();
        }
    }, []);

    // Fetch functions
    const fetchCountries = async () => {
        try {
            setLoading(prev => ({ ...prev, countries: true }));
            const res = await locationAPI.getAllCountries({ isActive: true });
            setData(prev => ({ ...prev, countries: res.data.data || [] }));
        } catch (err) {
            console.error('Failed to load countries', err);
        } finally {
            setLoading(prev => ({ ...prev, countries: false }));
        }
    };

    const fetchStates = async (countryId) => {
        if (!countryId) return;
        try {
            setLoading(prev => ({ ...prev, states: true }));
            const res = await locationAPI.getAllStates({ countryId, isActive: true });
            setData(prev => ({ ...prev, states: res.data.data || [] }));
        } catch (err) {
            console.error('Failed to load states', err);
        } finally {
            setLoading(prev => ({ ...prev, states: false }));
        }
    };

    const fetchDistricts = async (parentId, isCluster = false) => {
        if (!parentId) return;
        try {
            setLoading(prev => ({ ...prev, districts: true }));
            const params = { isActive: true };
            if (isCluster) params.clusterId = parentId;
            else params.stateId = parentId;
            const res = await locationAPI.getAllDistricts(params);
            setData(prev => ({ ...prev, districts: res.data.data || [] }));
        } catch (err) {
            console.error('Failed to load districts', err);
        } finally {
            setLoading(prev => ({ ...prev, districts: false }));
        }
    };

    const fetchClusters = async (parentId, isState = false) => {
        if (!parentId) return;
        try {
            setLoading(prev => ({ ...prev, clusters: true }));
            const params = { isActive: true };
            if (isState) params.stateId = parentId;
            else params.districtId = parentId;
            const res = await locationAPI.getAllClusters(params);
            setData(prev => ({ ...prev, clusters: res.data.data || [] }));
        } catch (err) {
            console.error('Failed to load clusters', err);
        } finally {
            setLoading(prev => ({ ...prev, clusters: false }));
        }
    };

    const fetchZones = async (clusterId) => {
        if (!clusterId) return;
        try {
            setLoading(prev => ({ ...prev, zones: true }));
            const res = await locationAPI.getAllZones({ clusterId, isActive: true });
            setData(prev => ({ ...prev, zones: res.data.data || [] }));
        } catch (err) {
            console.error('Failed to load zones', err);
        } finally {
            setLoading(prev => ({ ...prev, zones: false }));
        }
    };

    const fetchCities = async (zoneId) => {
        if (!zoneId) return;
        try {
            setLoading(prev => ({ ...prev, cities: true }));
            const res = await locationAPI.getAllCities({ zoneId, isActive: true });
            setData(prev => ({ ...prev, cities: res.data.data || [] }));
        } catch (err) {
            console.error('Failed to load cities', err);
        } finally {
            setLoading(prev => ({ ...prev, cities: false }));
        }
    };

    // Hierarchy management
    useEffect(() => {
        if (values.country && showLevels.includes('state')) fetchStates(values.country);
        else setData(prev => ({ ...prev, states: [] }));
    }, [values.country]);

    useEffect(() => {
        if (values.state) {
            if (isZoneMode && showLevels.includes('cluster')) fetchClusters(values.state, true);
            else if (!isZoneMode && showLevels.includes('district')) fetchDistricts(values.state, false);
            else {
                setData(prev => ({ ...prev, districts: [], clusters: [] }));
            }
        } else {
            setData(prev => ({ ...prev, districts: [], clusters: [] }));
        }
    }, [values.state, isZoneMode]);

    useEffect(() => {
        const districtId = Array.isArray(values.district) ? values.district[0] : values.district;
        if (districtId && !isZoneMode && showLevels.includes('cluster')) fetchClusters(districtId, false);
        else if (!isZoneMode) setData(prev => ({ ...prev, clusters: [] }));
    }, [values.district, isZoneMode]);

    useEffect(() => {
        const clusterId = Array.isArray(values.cluster) ? values.cluster[0] : values.cluster;
        if (clusterId && isZoneMode && showLevels.includes('district')) fetchDistricts(clusterId, true);
        else if (isZoneMode) setData(prev => ({ ...prev, districts: [] }));
    }, [values.cluster, isZoneMode]);

    useEffect(() => {
        const clusterId = Array.isArray(values.cluster) ? values.cluster[0] : values.cluster;
        if (clusterId && showLevels.includes('zone')) fetchZones(clusterId);
        else setData(prev => ({ ...prev, zones: [] }));
    }, [values.cluster]);

    useEffect(() => {
        const zoneId = Array.isArray(values.zone) ? values.zone[0] : values.zone;
        if (zoneId && showLevels.includes('city')) fetchCities(zoneId);
        else setData(prev => ({ ...prev, cities: [] }));
    }, [values.zone]);

    const handleUpdate = (level, val) => {
        const updates = { [level]: val };

        // Reset all children only if single select changed
        if (!multiple[level]) {
            if (level === 'country') Object.assign(updates, { state: '', district: multiple.district ? [] : '', cluster: multiple.cluster ? [] : '', zone: multiple.zone ? [] : '', city: '' });
            if (level === 'state') Object.assign(updates, { district: multiple.district ? [] : '', cluster: multiple.cluster ? [] : '', zone: multiple.zone ? [] : '', city: '' });
            if (level === 'district' && !isZoneMode) Object.assign(updates, { cluster: multiple.cluster ? [] : '', zone: multiple.zone ? [] : '', city: '' });
            if (level === 'cluster' && isZoneMode) Object.assign(updates, { district: multiple.district ? [] : '', zone: multiple.zone ? [] : '', city: '' });
            if (level === 'cluster' && !isZoneMode) Object.assign(updates, { zone: multiple.zone ? [] : '', city: '' });
            if (level === 'district' && isZoneMode) Object.assign(updates, { zone: multiple.zone ? [] : '', city: '' });
            if (level === 'zone') Object.assign(updates, { city: '' });
        }

        onChange({ ...values, ...updates });
    };

    const renderSelect = (level, options, label, parentVal) => {
        if (!showLevels.includes(level)) return null;

        const isMultiselect = multiple[level];
        const isDisabled = level !== 'country' && (!parentVal || (Array.isArray(parentVal) && parentVal.length === 0));

        if (isMultiselect) {
            const selectedValues = Array.isArray(values[level]) ? values[level] : [];
            return (
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        {label} (Multi-select) {errors[level] && <span className="text-red-500">*</span>}
                    </label>
                    <div className={`border rounded-lg p-2 max-h-40 overflow-y-auto ${isDisabled ? 'bg-gray-100' : 'bg-white'} ${errors[level] ? 'border-red-500' : 'border-gray-300'}`}>
                        {options.map(opt => (
                            <label key={opt._id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer text-sm">
                                <input
                                    type="checkbox"
                                    disabled={isDisabled}
                                    checked={selectedValues.includes(opt._id)}
                                    onChange={(e) => {
                                        const newVals = e.target.checked
                                            ? [...selectedValues, opt._id]
                                            : selectedValues.filter(id => id !== opt._id);
                                        handleUpdate(level, newVals);
                                    }}
                                    className="rounded text-blue-500"
                                />
                                {opt.name}
                            </label>
                        ))}
                        {options.length === 0 && <p className="text-gray-400 text-xs p-1">No options available</p>}
                    </div>
                    {errors[level] && <p className="text-xs text-red-500 mt-1">{errors[level]}</p>}
                </div>
            );
        }

        return (
            <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {label} {errors[level] && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={values[level] || ''}
                    onChange={(e) => handleUpdate(level, e.target.value)}
                    disabled={isDisabled || loading[level + 's']}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
                        } ${errors[level] ? 'border-red-500' : 'border-gray-300'}`}
                >
                    <option value="">-- Select {label} --</option>
                    {options.map(opt => (
                        <option key={opt._id} value={opt._id}>
                            {opt.name}
                        </option>
                    ))}
                </select>
                {errors[level] && <p className="text-xs text-red-500 mt-1">{errors[level]}</p>}
            </div>
        );
    };

    return (
        <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
            {renderSelect('country', data.countries, 'Country')}
            {renderSelect('state', data.states, 'State', values.country)}
            {isZoneMode ? renderSelect('cluster', data.clusters, 'Cluster', values.state) : renderSelect('district', data.districts, 'District', values.state)}
            {isZoneMode ? renderSelect('district', data.districts, 'District', values.cluster) : renderSelect('cluster', data.clusters, 'Cluster', values.district)}
            {renderSelect('zone', data.zones, 'Zone', isZoneMode ? values.district : values.cluster)}
            {renderSelect('city', data.cities, 'City', values.zone)}
        </div>
    );
};

export default LocationSelector;
