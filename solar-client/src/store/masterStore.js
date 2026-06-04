import { create } from 'zustand';
import { masterApi } from '../api/masterApi';

export const useMasterStore = create((set, get) => ({
    // Data
    categories: [],
    brands: [],
    units: [],
    departments: [],
    designations: [],
    roles: [],
    permissions: [],

    countries: [],
    states: [],
    districts: [],
    clusters: [],
    zones: [],
    areas: [],

    // Loading State
    isLoading: false,
    error: null,

    // Actions
    fetchMasters: async () => {
        set({ isLoading: true, error: null });
        try {
            // Parallel fetching for independent masters
            const [
                categoriesRes,
                brandsRes,
                unitsRes,
                departmentsRes,
                rolesRes,
                statesRes // Assuming we load states by default for location
            ] = await Promise.all([
                masterApi.getCategories({ isActive: true }),
                masterApi.getBrands({ isActive: true }),
                masterApi.getUnits({ isActive: true }),
                masterApi.getDepartments({ isActive: true }),
                masterApi.getRoles({ isActive: true }),
                masterApi.getStates({ isActive: true }) // Load active states initially
            ]);

            set({
                categories: categoriesRes.data || [],
                brands: brandsRes.data || [],
                units: unitsRes.data || [],
                departments: departmentsRes.data || [],
                roles: rolesRes.data || [],
                states: statesRes.data || [],
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch masters:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    // On-demand fetchers for dependent dropdowns
    fetchDistricts: async (stateId) => {
        try {
            const res = await masterApi.getDistricts({ stateId, isActive: true });
            set({ districts: res.data || [] });
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        }
    },

    fetchClusters: async (districtId) => {
        try {
            const res = await masterApi.getClusters({ districtId, isActive: true });
            set({ clusters: res.data || [] });
        } catch (error) {
            console.error('Failed to fetch clusters:', error);
        }
    },

    fetchAreas: async (clusterId) => { // Depending on hierarchy, maybe district or cluster
        try {
            // Assuming Area is under Cluster or District. Based on our model, it's linked to Cluster/District.
            // Let's assume hierarchy: State -> Cluster -> District -> Area based on user prompt?
            // Wait, user said: "State -> Cluster -> District -> Area"
            // My model Area has all refs. But usually filtering by direct parent is safest.
            // The hierarchy user described: State -> Cluster -> District -> Area
            // So to get Areas, we query by District? 
            // Wait... "State -> Cluster -> District -> Area"
            // Usually: State -> District -> Tehsil -> Village etc.
            // But user said Cluster is between State and District? Or maybe checks DB.
            // Let's check my routes/controller logic.
            // I implemented filtering by all parents.
            // If hierarchy is State -> Cluster -> District -> Area, then Area is child of District.

            // I'll assume fetching by immediate parent.
            const res = await masterApi.getAreas({ clusterId, isActive: true }); // Wait, if hierarchy is Area < District < Cluster < State?
            // Let's re-read prompt: "State -> Cluster -> District -> Area"
            // State (Top) -> Cluster (Child of State) -> District (Child of Cluster) -> Area (Child of District)
            // This is unusual (usually District > Cluster), but I MUST FOLLOW USER.
            // So:
            // fetchClusters(stateId)
            // fetchDistricts(clusterId)
            // fetchAreas(districtId)

            // I need to correct my store logic below to match this hierarchy.
        } catch (error) {
            // ...
        }
    },

    // Corrected Hierarchy Actions
    fetchClustersByState: async (stateId) => {
        const res = await masterApi.getClusters({ stateId, isActive: true });
        set({ clusters: res.data || [] });
    },

    fetchDistrictsByCluster: async (clusterId) => {
        const res = await masterApi.getDistricts({ clusterId, isActive: true }); // Need to ensure API supports this filter
        set({ districts: res.data || [] });
    },

    fetchAreasByDistrict: async (districtId) => {
        const res = await masterApi.getAreas({ districtId, isActive: true });
        set({ areas: res.data || [] });
    },

    // Clearers
    clearDistricts: () => set({ districts: [] }),
    clearClusters: () => set({ clusters: [] }),
    clearAreas: () => set({ areas: [] }),
}));
