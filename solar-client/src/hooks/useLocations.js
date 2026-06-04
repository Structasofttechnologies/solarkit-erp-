'use client';

import { useState, useEffect, useCallback } from 'react';
import * as locationApi from '../services/core/locationApi';

export const useLocations = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch Functions ---

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationApi.getCountries({ silent: true });
      setCountries(data || []);
    } catch (err) {
      setError('Failed to load countries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStates = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const countryId = (params && params.countryId && params.countryId !== 'all') ? params.countryId : undefined;
      // Support both hierarchy and flat fetch based on presence of params
      const data = countryId
        ? await locationApi.getStates(countryId, { silent: true })
        : await locationApi.getStatesHierarchy({ silent: true });
      setStates(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      return data || [];
    } catch (err) {
      setError('Failed to load states');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClusters = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const stateId = (typeof params === 'string' ? params : params.stateId);
      const sanitizedStateId = (stateId && stateId !== 'all') ? stateId : undefined;
      const districtId = (typeof params === 'object' && params.districtId && params.districtId !== 'all') ? params.districtId : null;

      let data;
      if (sanitizedStateId) {
        data = await locationApi.getClustersHierarchy(sanitizedStateId, { silent: true });
      } else if (districtId) {
        data = await locationApi.getClusters(districtId, { silent: true });
      } else {
        data = await locationApi.getClustersHierarchy(undefined, { silent: true });
      }

      setClusters(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      return data || [];
    } catch (err) {
      setError('Failed to load clusters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDistricts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const clusterId = (typeof params === 'string' ? params : params.clusterId);
      const sanitizedClusterId = (clusterId && clusterId !== 'all') ? clusterId : undefined;

      let data;
      if (sanitizedClusterId) {
        data = await locationApi.getDistrictsHierarchy(sanitizedClusterId, { silent: true });
      } else {
        data = await locationApi.getDistrictsHierarchy(undefined, { silent: true });
      }

      setDistricts(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      return data || [];
    } catch (err) {
      setError('Failed to load districts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const districtId = typeof params === 'string' ? params : params.districtId;
      const data = districtId
        ? await locationApi.getCitiesHierarchy(districtId, { silent: true })
        : await locationApi.getCities(districtId, { silent: true });

      setCities(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));

      if (data && Array.isArray(data) && data.length === 1 && districtId === selectedDistrict) {
        setSelectedCity(data[0]._id);
      }
    } catch (err) {
      setError('Failed to load cities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict]);


  // --- side effects ---

  // Load basic data on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Update States when Country changes
  useEffect(() => {
    if (selectedCountry && selectedCountry !== 'all') {
      fetchStates({ countryId: selectedCountry });
    } else {
      fetchStates();
    }
    setSelectedState('');
    setSelectedCluster('');
    setSelectedDistrict('');
    setSelectedCity('');
  }, [selectedCountry, fetchStates]);

  // Update Clusters when State changes
  useEffect(() => {
    if (selectedState && selectedState !== 'all') {
      fetchClusters(selectedState);
    } else {
      // Fetch all clusters hierarchy if no state selected (Select All mode)
      fetchClusters();
    }
    setSelectedCluster('');
    setSelectedDistrict('');
    setSelectedCity('');
  }, [selectedState, fetchClusters]);

  // Update Districts when Cluster changes
  useEffect(() => {
    if (selectedCluster && selectedCluster !== 'all') {
      fetchDistricts(selectedCluster);
    } else {
      // Fetch all districts if no cluster selected
      fetchDistricts();
    }
    setSelectedDistrict('');
    setSelectedCity('');
  }, [selectedCluster, fetchDistricts]);

  // Update Cities when District changes
  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== 'all') {
      fetchCities(selectedDistrict);
    } else {
      // Fetch all cities if no district selected
      fetchCities();
    }
    setSelectedCity('');
  }, [selectedDistrict, fetchCities]);

  return {
    countries,
    states,
    clusters,
    districts,
    cities,
    selectedCountry,
    setSelectedCountry,
    selectedState,
    setSelectedState,
    selectedCluster,
    setSelectedCluster,
    selectedDistrict,
    setSelectedDistrict,
    selectedCity,
    setSelectedCity,
    loading,
    error,
    fetchCountries,
    fetchStates,
    fetchClusters,
    fetchDistricts,
    fetchCities,
    setClusters,
    setDistricts,
    refreshStates: fetchStates
  };
};
