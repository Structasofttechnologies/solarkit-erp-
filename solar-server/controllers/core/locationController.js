import Country from '../../models/core/Country.js';
import CountryMaster from '../../models/core/CountryMaster.js';
import State from '../../models/core/State.js';
import City from '../../models/core/City.js';
import District from '../../models/core/District.js';
import Cluster from '../../models/core/Cluster.js';
import Zone from '../../models/core/Zone.js';
import Area from '../../models/core/Area.js';
import locationService from './locationService.js';

// ==================== COUNTRY CONTROLLERS ====================

export const getAllMasterCountries = async (req, res, next) => {
  try {
    const countries = await CountryMaster.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      count: countries.length,
      data: countries,
    });
  } catch (err) {
    next(err);
  }
};

export const activateCountry = async (req, res, next) => {
  try {
    const { countryId } = req.body;
    const masterCountry = await CountryMaster.findById(countryId);

    if (!masterCountry) {
      return res.status(404).json({ success: false, message: 'Master country not found' });
    }

    // Check if already activated
    let country = await Country.findOne({ name: masterCountry.name });
    if (country) {
      // If already exists but inactive, activate it
      country.isActive = true;
      await country.save();
    } else {
      // Create new activated country
      country = await Country.create({
        name: masterCountry.name,
        isActive: true,
        createdBy: req.user?.id,
      });
    }

    res.status(200).json({ success: true, message: 'Country activated successfully', data: country });
  } catch (err) {
    next(err);
  }
};

export const getAllCountries = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const query = isActive !== undefined ? { isActive: isActive === 'true' } : {};

    const countries = await Country.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: countries.length,
      data: countries,
    });
  } catch (err) {
    next(err);
  }
};

export const getCountryById = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });

    res.json({ success: true, data: country });
  } catch (err) {
    next(err);
  }
};

export const createCountry = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Country name is required' });
    }

    const country = await Country.create({
      name,
      isActive: true, // Default to active if created manually
      createdBy: req.user?.id,
    });

    res.status(201).json({ success: true, message: 'Country created successfully', data: country });
  } catch (err) {
    next(err);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;

    const country = await Country.findByIdAndUpdate(
      req.params.id,
      { name, isActive, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    );

    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });

    res.json({ success: true, message: 'Country updated successfully', data: country });
  } catch (err) {
    next(err);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });

    res.json({ success: true, message: 'Country deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== STATE CONTROLLERS ====================

export const getAllStates = async (req, res, next) => {
  try {
    const { countryId, isActive } = req.query;
    const query = {};

    if (countryId && countryId !== 'undefined' && countryId !== 'null') {
      const ids = countryId.includes(',') ? countryId.split(',') : [countryId];
      query.country = { $in: ids };
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const states = await State.find(query).populate('country').sort({ name: 1 });
    res.json({ success: true, count: states.length, data: states });
  } catch (err) {
    next(err);
  }
};

export const getStateById = async (req, res, next) => {
  try {
    const state = await State.findById(req.params.id).populate('country');
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });

    res.json({ success: true, data: state });
  } catch (err) {
    next(err);
  }
};

export const createState = async (req, res, next) => {
  try {
    const { name, code, country, description } = req.body;

    if (!name || !country) {
      return res.status(400).json({ success: false, message: 'State name and country are required' });
    }

    const state = await State.create({
      name,
      code,
      country,
      description,
      createdBy: req.user?.id,
    });

    await state.populate('country');
    res.status(201).json({ success: true, message: 'State created successfully', data: state });
  } catch (err) {
    next(err);
  }
};

export const updateState = async (req, res, next) => {
  try {
    const { name, code, country, description, isActive } = req.body;

    const state = await State.findByIdAndUpdate(
      req.params.id,
      { name, code, country, description, isActive, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    ).populate('country');

    if (!state) return res.status(404).json({ success: false, message: 'State not found' });

    res.json({ success: true, message: 'State updated successfully', data: state });
  } catch (err) {
    next(err);
  }
};

export const deleteState = async (req, res, next) => {
  try {
    const state = await State.findByIdAndDelete(req.params.id);
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });

    res.json({ success: true, message: 'State deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== CITY CONTROLLERS ====================

export const getAllCities = async (req, res, next) => {
  try {
    const { districtId, stateId, countryId, isActive } = req.query;
    const query = {};

    if (districtId) query.district = districtId;
    if (stateId) query.state = stateId;
    if (countryId) query.country = countryId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const cities = await City.find(query).populate('district state country').sort({ name: 1 });
    res.json({ success: true, count: cities.length, data: cities });
  } catch (err) {
    next(err);
  }
};

export const getCityById = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id).populate('district state country');
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    res.json({ success: true, data: city });
  } catch (err) {
    next(err);
  }
};

export const createCity = async (req, res, next) => {
  try {
    const { name, district, state, country, areaType, pincodes, description } = req.body;

    if (!district || !state || !country) {
      return res.status(400).json({ success: false, message: 'District, state and country are required' });
    }

    const city = await City.create({
      name,
      district,
      state,
      country,
      areaType,
      pincodes,
      description,
      createdBy: req.user?.id,
    });

    await city.populate('district state country');
    res.status(201).json({ success: true, message: 'City created successfully', data: city });
  } catch (err) {
    next(err);
  }
};

export const bulkCreateCities = async (req, res, next) => {
  try {
    const { cities } = req.body;

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({ success: false, message: 'An array of cities is required' });
    }

    const total = cities.length;
    let added = 0;
    let skipped = 0;

    // 1. Filter internal duplicates (unique by Name + Pincodes string)
    const uniqueInputs = [];
    const seen = new Set();
    
    for (const city of cities) {
      const pinKey = (city.pincodes || []).sort().join(',');
      const key = `${city.name?.toLowerCase()}-${city.district}-${pinKey}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueInputs.push(city);
      } else {
        skipped++;
      }
    }

    // 2. Process unique inputs against DB
    const finalToInsert = [];
    for (const cityData of uniqueInputs) {
      if (!cityData.name || !cityData.district || !cityData.state || !cityData.country) {
        skipped++;
        continue;
      }

      // Check for exact existing record
      const existing = await City.findOne({
        name: { $regex: new RegExp(`^${cityData.name}$`, 'i') },
        district: cityData.district
      });

      if (existing) {
        // Rule: If same Name + District exists, check pincodes
        const existingPins = new Set(existing.pincodes.map(p => String(p)));
        const newPins = cityData.pincodes.filter(p => !existingPins.has(String(p)));

        if (newPins.length === 0) {
          // Exactly the same or subset, skip
          skipped++;
        } else {
          // New pincodes for existing city? User said "Existing records... will not be duplicated"
          // Let's assume skip if the city name already exists in that district to be safe,
          // or we could merge. User's rule 2 says "skip during upload". 
          skipped++;
        }
      } else {
        finalToInsert.push({
          ...cityData,
          createdBy: req.user?.id
        });
      }
    }

    if (finalToInsert.length > 0) {
      const result = await City.insertMany(finalToInsert);
      added = result.length;
    }

    res.status(201).json({ 
      success: true, 
      message: `Process complete: ${added} added, ${skipped} skipped.`,
      summary: { total, added, skipped }
    });
  } catch (err) {
    next(err);
  }
};

export const updateCity = async (req, res, next) => {
  try {
    const { name, district, state, country, areaType, pincodes, description, isActive } = req.body;

    const city = await City.findByIdAndUpdate(
      req.params.id,
      { name, district, state, country, areaType, pincodes, description, isActive, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    ).populate('district state country');

    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    res.json({ success: true, message: 'City updated successfully', data: city });
  } catch (err) {
    next(err);
  }
};

export const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    res.json({ success: true, message: 'City deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== DISTRICT CONTROLLERS ====================

export const getAllDistricts = async (req, res, next) => {
  try {
    const { stateId, countryId, clusterId, isActive } = req.query;
    const query = {};

    if (stateId && stateId !== 'undefined' && stateId !== 'null') {
      const ids = stateId.includes(',') ? stateId.split(',') : [stateId];
      query.state = { $in: ids };
    }
    if (countryId && countryId !== 'undefined' && countryId !== 'null') {
      const ids = countryId.includes(',') ? countryId.split(',') : [countryId];
      query.country = { $in: ids };
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (clusterId && clusterId !== 'undefined' && clusterId !== 'null') {
      const ids = clusterId.includes(',') ? clusterId.split(',') : [clusterId];
      const clusters = await Cluster.find({ _id: { $in: ids } });
      if (clusters && clusters.length > 0) {
        const allDistrictIds = clusters.reduce((acc, c) => [...acc, ...c.districts], []);
        query._id = { $in: [...new Set(allDistrictIds)] };
      } else {
        query._id = null;
      }
    }

    const districts = await District.find(query).populate('state country').sort({ name: 1 });
    res.json({ success: true, count: districts.length, data: districts });
  } catch (err) {
    next(err);
  }
};

export const getDistrictById = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id).populate('city state country');
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });

    res.json({ success: true, data: district });
  } catch (err) {
    next(err);
  }
};

export const createDistrict = async (req, res, next) => {
  try {
    const { name, code, state, country, description } = req.body;

    if (!name || !state || !country) {
      return res.status(400).json({ success: false, message: 'District name, state and country are required' });
    }

    const district = await District.create({
      name,
      code,
      state,
      country,
      description,
      createdBy: req.user?.id,
    });

    await district.populate('state country');
    res.status(201).json({ success: true, message: 'District created successfully', data: district });
  } catch (err) {
    next(err);
  }
};

export const updateDistrict = async (req, res, next) => {
  try {
    const { name, code, state, country, description, isActive } = req.body;

    const district = await District.findByIdAndUpdate(
      req.params.id,
      { name, code, state, country, description, isActive, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    ).populate('state country');

    if (!district) return res.status(404).json({ success: false, message: 'District not found' });

    res.json({ success: true, message: 'District updated successfully', data: district });
  } catch (err) {
    next(err);
  }
};

export const deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });

    res.json({ success: true, message: 'District deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== CLUSTER CONTROLLERS ====================

export const getAllClusters = async (req, res, next) => {
  try {
    const { districtId, stateId, countryId, isActive } = req.query;
    const query = {};

    if (districtId && districtId !== 'undefined' && districtId !== 'null') {
      const ids = districtId.includes(',') ? districtId.split(',') : [districtId];
      query.districts = { $in: ids }; // Matches if any ID in ids array is in the districts array
    }
    if (stateId && stateId !== 'undefined' && stateId !== 'null') {
      const ids = stateId.includes(',') ? stateId.split(',') : [stateId];
      query.state = { $in: ids };
    }
    if (countryId && countryId !== 'undefined' && countryId !== 'null') {
      const ids = countryId.includes(',') ? countryId.split(',') : [countryId];
      query.country = { $in: ids };
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const clusters = await Cluster.find(query).populate('districts state country').sort({ name: 1 });
    res.json({ success: true, count: clusters.length, data: clusters });
  } catch (err) {
    next(err);
  }
};

export const getClusterById = async (req, res, next) => {
  try {
    const cluster = await Cluster.findById(req.params.id).populate('districts state country');
    if (!cluster) return res.status(404).json({ success: false, message: 'Cluster not found' });

    res.json({ success: true, data: cluster });
  } catch (err) {
    next(err);
  }
};

export const createCluster = async (req, res, next) => {
  try {
    const { name, code, districts, state, country, description } = req.body;

    if (!name || !districts || !districts.length || !state || !country) {
      return res.status(400).json({ success: false, message: 'Cluster name, districts (array), state and country are required' });
    }

    const cluster = await Cluster.create({
      name,
      code,
      districts,
      state,
      country,
      description,
      createdBy: req.user?.id,
    });

    await cluster.populate('districts state country');
    res.status(201).json({ success: true, message: 'Cluster created successfully', data: cluster });
  } catch (err) {
    next(err);
  }
};

export const updateCluster = async (req, res, next) => {
  try {
    const { name, code, districts, state, country, description, isActive } = req.body;

    const cluster = await Cluster.findByIdAndUpdate(
      req.params.id,
      { name, code, districts, state, country, description, isActive, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    ).populate('districts state country');

    if (!cluster) return res.status(404).json({ success: false, message: 'Cluster not found' });

    res.json({ success: true, message: 'Cluster updated successfully', data: cluster });
  } catch (err) {
    next(err);
  }
};

export const deleteCluster = async (req, res, next) => {
  try {
    const cluster = await Cluster.findByIdAndDelete(req.params.id);
    if (!cluster) return res.status(404).json({ success: false, message: 'Cluster not found' });

    res.json({ success: true, message: 'Cluster deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== ZONE CONTROLLERS ====================

export const getAllZones = async (req, res, next) => {
  try {
    const { clusterId, stateId, countryId, isActive } = req.query;
    const query = {};

    if (clusterId && clusterId !== 'undefined' && clusterId !== 'null') query.cluster = clusterId;
    if (stateId && stateId !== 'undefined' && stateId !== 'null') query.state = stateId;
    if (countryId && countryId !== 'undefined' && countryId !== 'null') query.country = countryId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const zones = await Zone.find(query).populate('cluster districts state country').sort({ name: 1 });
    res.json({ success: true, count: zones.length, data: zones });
  } catch (err) {
    next(err);
  }
};

export const getZoneById = async (req, res, next) => {
  try {
    const zone = await Zone.findById(req.params.id).populate('cluster districts state country');
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

    res.json({ success: true, data: zone });
  } catch (err) {
    next(err);
  }
};

export const createZone = async (req, res, next) => {
  try {
    const { name, code, cluster, districts, state, country, description } = req.body;

    if (!name || !cluster || !districts || !districts.length || !state || !country) {
      return res.status(400).json({ success: false, message: 'Zone name, cluster (single), districts (array), state and country are required' });
    }

    const zone = await Zone.create({
      name,
      code,
      cluster,
      districts,
      state,
      country,
      description,
      createdBy: req.user?.id,
    });

    await zone.populate('cluster districts state country');
    res.status(201).json({ success: true, message: 'Zone created successfully', data: zone });
  } catch (err) {
    next(err);
  }
};

export const updateZone = async (req, res, next) => {
  try {
    const { name, code, cluster, districts, state, country, description, isActive } = req.body;

    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      { name, code, cluster, districts, state, country, description, isActive, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    ).populate('cluster districts state country');

    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

    res.json({ success: true, message: 'Zone updated successfully', data: zone });
  } catch (err) {
    next(err);
  }
};

export const deleteZone = async (req, res, next) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

    res.json({ success: true, message: 'Zone deleted successfully' });
  } catch (err) {
    next(err);
  }
};


// ==================== AREA CONTROLLERS ====================

export const getAllAreas = async (req, res, next) => {
  try {
    const { districtId, clusterId, stateId, countryId, isActive } = req.query;
    const query = {};

    if (districtId) query.district = districtId;
    if (clusterId) query.cluster = clusterId;
    if (stateId) query.state = stateId;
    if (countryId) query.country = countryId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Note: Area is linked to District, but we can filter by higher levels if needed by querying District?
    // Actually our Area model has references to all levels.

    const areas = await Area.find(query).populate('district cluster state country').sort({ name: 1 });
    res.json({ success: true, count: areas.length, data: areas });
  } catch (err) {
    next(err);
  }
};

export const getAreaById = async (req, res, next) => {
  try {
    const area = await Area.findById(req.params.id).populate('district cluster state country');
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });

    res.json({ success: true, data: area });
  } catch (err) {
    next(err);
  }
};

export const createArea = async (req, res, next) => {
  try {
    const { name, code, district, cluster, state, country, pincodes, description } = req.body;

    if (!name || !district || !cluster || !state || !country) {
      return res.status(400).json({ success: false, message: 'Area name, district, cluster, state and country are required' });
    }

    const area = await Area.create({
      name,
      code,
      district,
      cluster,
      state,
      country,
      pincodes,
      description,
      createdBy: req.user?.id,
    });

    await area.populate('district cluster state country');
    res.status(201).json({ success: true, message: 'Area created successfully', data: area });
  } catch (err) {
    next(err);
  }
};

export const updateArea = async (req, res, next) => {
  try {
    const { name, code, district, cluster, state, country, pincodes, description, isActive } = req.body;

    const area = await Area.findByIdAndUpdate(
      req.params.id,
      { name, code, district, cluster, state, country, pincodes, description, isActive, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    ).populate('district cluster state country');

    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });

    res.json({ success: true, message: 'Area updated successfully', data: area });
  } catch (err) {
    next(err);
  }
};

export const deleteArea = async (req, res, next) => {
  try {
    const area = await Area.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });

    res.json({ success: true, message: 'Area deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== HIERARCHY CONTROLLERS ====================

export const getStatesHierarchy = async (req, res, next) => {
  try {
    const data = await locationService.getStates();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getDistrictsHierarchy = async (req, res, next) => {
  try {
    const { stateId, clusterId } = req.query;
    let data;
    if (clusterId) {
      data = await locationService.getDistrictsByCluster(clusterId);
    } else {
      data = await locationService.getDistrictsByState(stateId);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getClustersHierarchy = async (req, res, next) => {
  try {
    const { districtId, stateId } = req.query;
    let data;
    if (stateId) {
      data = await locationService.getClustersByState(stateId);
    } else {
      data = await locationService.getClustersByDistrict(districtId);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getZonesHierarchy = async (req, res, next) => {
  try {
    const { clusterId } = req.query;
    const data = await locationService.getZonesByCluster(clusterId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getCitiesHierarchy = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const data = await locationService.getCitiesByDistrict(districtId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
// ==================== DUPLICATE CHECK ====================

export const checkDuplicate = async (req, res, next) => {
  try {
    const { type, name, parentId, currentId } = req.query;

    if (!type || !name) {
      return res.status(400).json({ success: false, message: 'Type and name are required' });
    }

    let model;
    let query = { name: { $regex: new RegExp(`^${name}$`, 'i') } };

    switch (type) {
      case 'countries':
        model = Country;
        break;
      case 'states':
        model = State;
        if (!parentId) return res.status(400).json({ success: false, message: 'Parent ID is required for state' });
        query.country = parentId;
        break;
      case 'districts':
        model = District;
        if (!parentId) return res.status(400).json({ success: false, message: 'Parent ID is required for district' });
        query.state = parentId;
        break;
      case 'clusters':
        model = Cluster;
        if (!parentId) return res.status(400).json({ success: false, message: 'Parent ID is required for cluster' });
        query.state = parentId;
        break;
      case 'zones':
        model = Zone;
        if (!parentId) return res.status(400).json({ success: false, message: 'Parent ID is required for zone' });
        query.state = parentId;
        break;
      case 'cities':
        model = City;
        if (!parentId) return res.status(400).json({ success: false, message: 'Parent ID is required for city' });
        query.district = parentId;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid location type' });
    }

    if (currentId) {
      query._id = { $ne: currentId };
    }

    const exists = await model.findOne(query);

    res.json({
      success: true,
      exists: !!exists,
    });
  } catch (err) {
    next(err);
  }
};
