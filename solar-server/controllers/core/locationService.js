import State from '../../models/core/State.js';
import Cluster from '../../models/core/Cluster.js';
import District from '../../models/core/District.js';
import City from '../../models/core/City.js';
import Zone from '../../models/core/Zone.js';

class LocationService {
    /**
     * Get all active states
     */
    async getStates() {
        return await State.find({ isActive: true }).sort({ name: 1 });
    }

    /**
     * Get districts by state
     */
    async getDistrictsByState(stateId) {
        const query = { isActive: true };
        if (stateId && stateId !== 'all') {
            const val = typeof stateId === 'object' ? (stateId._id || stateId.id || String(stateId)) : String(stateId);
            const ids = val.includes(',') ? val.split(',') : [val];
            query.state = { $in: ids.filter(id => id && id !== '[object Object]') };
        }
        return await District.find(query).sort({ name: 1 });
    }

    /**
     * Get clusters by district
     */
    async getClustersByDistrict(districtId) {
        const query = { isActive: true };
        if (districtId && districtId !== 'all') {
            const val = typeof districtId === 'object' ? (districtId._id || districtId.id || String(districtId)) : String(districtId);
            const ids = val.includes(',') ? val.split(',') : [val];
            query.districts = { $in: ids.filter(id => id && id !== '[object Object]') };
        }
        return await Cluster.find(query).sort({ name: 1 });
    }

    /**
     * Get clusters by state
     */
    async getClustersByState(stateId) {
        const query = { isActive: true };
        if (stateId && stateId !== 'all') {
            const val = typeof stateId === 'object' ? (stateId._id || stateId.id || String(stateId)) : String(stateId);
            const ids = val.includes(',') ? val.split(',') : [val];
            query.state = { $in: ids.filter(id => id && id !== '[object Object]') };
        }
        return await Cluster.find(query).sort({ name: 1 });
    }

    /**
     * Get districts by cluster
     */
    async getDistrictsByCluster(clusterId) {
        if (!clusterId || clusterId === 'all') {
            return await District.find({ isActive: true }).sort({ name: 1 });
        }
        const val = typeof clusterId === 'object' ? (clusterId._id || clusterId.id || String(clusterId)) : String(clusterId);
        const ids = val.includes(',') ? val.split(',') : [val];
        const clusters = await Cluster.find({ _id: { $in: ids.filter(id => id && id !== '[object Object]') } });
        if (!clusters || clusters.length === 0) return [];
        
        const allDistrictIds = clusters.reduce((acc, c) => [...acc, ...c.districts], []);
        return await District.find({ _id: { $in: [...new Set(allDistrictIds)] }, isActive: true }).sort({ name: 1 });
    }

    /**
     * Get zones by cluster
     */
    async getZonesByCluster(clusterId) {
        const query = { isActive: true };
        if (clusterId && clusterId !== 'all') {
            const val = typeof clusterId === 'object' ? (clusterId._id || clusterId.id || String(clusterId)) : String(clusterId);
            const ids = val.includes(',') ? val.split(',') : [val];
            query.clusters = { $in: ids.filter(id => id && id !== '[object Object]') };
        }
        return await Zone.find(query).sort({ name: 1 });
    }

    /**
     * Get cities by district
     */
    async getCitiesByDistrict(districtId) {
        const query = { isActive: true };
        if (districtId && districtId !== 'all') {
            const val = typeof districtId === 'object' ? (districtId._id || districtId.id || String(districtId)) : String(districtId);
            const ids = val.includes(',') ? val.split(',') : [val];
            query.district = { $in: ids.filter(id => id && id !== '[object Object]') };
        }
        return await City.find(query).sort({ name: 1 });
    }

    /**
     * Helper to validate if a location exists and follows the hierarchy
     */
    async validateHierarchy(stateId, districtId, clusterId, zoneId) {
        if (stateId) {
            const state = await State.findById(stateId);
            if (!state) throw new Error('Invalid State');
        }
        if (districtId) {
            const district = await District.findById(districtId);
            if (!district || district.state.toString() !== stateId) throw new Error('Invalid District for selected State');
        }
        if (clusterId) {
            const cluster = await Cluster.findById(clusterId);
            if (!cluster || !cluster.districts.includes(districtId)) throw new Error('Invalid Cluster for selected District');
        }
        if (zoneId) {
            const zone = await Zone.findById(zoneId);
            // Zone has cluster (single) and districts (array). We validate if the zone belongs to the cluster.
            if (!zone || zone.cluster.toString() !== clusterId) throw new Error('Invalid Zone for selected Cluster');
        }
        return true;
    }
}

export default new LocationService();
