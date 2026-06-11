import CompanyUser from '../../models/users/CompanyUser.js';
import User from '../../models/users/User.js';
import ProjectType from '../../models/projects/ProjectType.js';
import Partner from '../../models/partner/Partner.js';
import District from '../../models/core/District.js';
import Country from '../../models/core/Country.js';
import State from '../../models/core/State.js';
import Cluster from '../../models/core/Cluster.js';
import City from '../../models/core/City.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// ─── Helper ───────────────────────────────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ─── 1. Create Company User (Admin action) ────────────────────────────────────
// POST /api/company-users
export const createCompanyUser = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      emailAddress,
      country,
      state,
      cluster,
      district,
      city,
      // Partner Goals
      partnerGoalsEnabled,
      partnerMonthlyTargetKw,
      partnerPerKwCommission,
      partnerQuotePermissions,
      partnerTypes,
      // Project Goals
      projectGoalEnabled,
      projectMonthlyTargetKw,
      projectPerKwCommission,
      projectTypes,
    } = req.body;

    // Validate required fields
    if (!fullName || !mobileNumber || !emailAddress || !district) {
      return res.status(400).json({
        success: false,
        message: 'fullName, mobileNumber, emailAddress and district are required.',
      });
    }

    // Check duplicate mobile
    const existingMobile = await CompanyUser.findOne({ mobileNumber });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'A company user with this mobile number already exists.',
      });
    }

    // Check duplicate email
    const existingEmail = await CompanyUser.findOne({ emailAddress: emailAddress.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'A company user with this email address already exists.',
      });
    }

    const newUser = new CompanyUser({
      fullName,
      mobileNumber,
      emailAddress,
      country,
      state,
      cluster,
      district,
      city,

      // Partner Goals
      partnerGoalsEnabled:    partnerGoalsEnabled    || false,
      partnerMonthlyTargetKw: partnerMonthlyTargetKw || 0,
      partnerPerKwCommission: partnerPerKwCommission || 0,
      partnerQuotePermissions: partnerQuotePermissions || {
        create: false,
        edit:   false,
        delete: false,
      },
      partnerTypes: partnerTypes || [],

      // Project Goals
      projectGoalEnabled:    projectGoalEnabled    || false,
      projectMonthlyTargetKw: projectMonthlyTargetKw || 0,
      projectPerKwCommission: projectPerKwCommission || 0,
      projectTypes: projectTypes || [],
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Company user created successfully. User can now log in with their mobile number.',
      data: {
        _id:                 newUser._id,
        fullName:            newUser.fullName,
        mobileNumber:        newUser.mobileNumber,
        emailAddress:        newUser.emailAddress,
        country:             newUser.country,
        state:               newUser.state,
        cluster:             newUser.cluster,
        district:            newUser.district,
        city:                newUser.city,
        role:                newUser.role,
        status:              newUser.status,
        partnerGoalsEnabled: newUser.partnerGoalsEnabled,
        projectGoalEnabled:  newUser.projectGoalEnabled,
        createdAt:           newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in createCompanyUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// ─── 2. Mobile Login — Only mobile number required (no password) ──────────────
// POST /api/company-users/mobile-login
export const mobileLogin = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'mobileNumber is required.',
      });
    }

    // Find user by mobile number — that's all the "auth" needed
    const user = await CompanyUser.findOne({ mobileNumber: mobileNumber.trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this mobile number. Please contact your administrator.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact the administrator.',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id:                    user._id,
        fullName:               user.fullName,
        mobileNumber:           user.mobileNumber,
        emailAddress:           user.emailAddress,
        country:                user.country,
        state:                  user.state,
        cluster:                user.cluster,
        district:               user.district,
        city:                   user.city,
        role:                   user.role,
        status:                 user.status,
        partnerGoalsEnabled:    user.partnerGoalsEnabled,
        partnerMonthlyTargetKw: user.partnerMonthlyTargetKw,
        partnerPerKwCommission: user.partnerPerKwCommission,
        partnerQuotePermissions: user.partnerQuotePermissions,
        partnerTypes:           user.partnerTypes,
        projectGoalEnabled:     user.projectGoalEnabled,
        projectMonthlyTargetKw: user.projectMonthlyTargetKw,
        projectPerKwCommission: user.projectPerKwCommission,
        projectTypes:           user.projectTypes,
      },
    });
  } catch (error) {
    console.error('Error in mobileLogin:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// ─── 3. Get all Company Users ─────────────────────────────────────────────────
// GET /api/company-users
export const getAllCompanyUsers = async (req, res) => {
  try {
    const { projectType, partnerType, district } = req.query;
    let query = {};

    if (district) {
      const dIds = district.split(',').map(d => d.trim()).filter(Boolean);
      if (dIds.length > 0) {
        const resolvedNames = [];
        const plainNames = [];
        const objectIds = [];

        dIds.forEach(d => {
          if (mongoose.Types.ObjectId.isValid(d)) {
            objectIds.push(new mongoose.Types.ObjectId(d));
          } else {
            plainNames.push(d);
          }
        });

        if (objectIds.length > 0) {
          const matchedDistricts = await District.find({ _id: { $in: objectIds } }, 'name');
          matchedDistricts.forEach(md => {
            resolvedNames.push(md.name);
          });
        }

        const allPossibleDistricts = [...dIds, ...resolvedNames, ...plainNames];
        query.district = { $in: allPossibleDistricts };
      }
    }

    if (projectType) {
      const pTypes = projectType.split(',').map(t => t.trim()).filter(Boolean);
      if (pTypes.length > 0) {
        const resolvedNames = [];
        const objectIds = [];
        const plainNames = [];

        pTypes.forEach(t => {
          if (mongoose.Types.ObjectId.isValid(t)) {
            objectIds.push(new mongoose.Types.ObjectId(t));
          } else {
            plainNames.push(t);
          }
        });

        if (objectIds.length > 0) {
          const matchedTypes = await ProjectType.find({ _id: { $in: objectIds } }, 'name');
          matchedTypes.forEach(mt => {
            resolvedNames.push(mt.name);
          });
        }
        
        if (plainNames.length > 0) {
          const matchedTypesById = await ProjectType.find({ name: { $in: plainNames } }, '_id');
          matchedTypesById.forEach(mt => {
            resolvedNames.push(mt._id.toString());
          });
        }

        const finalProjectTypes = [...pTypes, ...resolvedNames, ...plainNames];
        query['projectTypes.type'] = { $in: finalProjectTypes };
      }
    }

    if (partnerType) {
      const pTypes = partnerType.split(',').map(t => t.trim()).filter(Boolean);
      if (pTypes.length > 0) {
        const resolvedNames = [];
        const objectIds = [];
        const plainNames = [];

        pTypes.forEach(t => {
          if (mongoose.Types.ObjectId.isValid(t)) {
            objectIds.push(new mongoose.Types.ObjectId(t));
          } else {
            plainNames.push(t);
          }
        });

        if (objectIds.length > 0) {
          const matchedPartners = await Partner.find({ _id: { $in: objectIds } }, 'name');
          matchedPartners.forEach(mp => {
            resolvedNames.push(mp.name);
          });
        }

        if (plainNames.length > 0) {
          const matchedPartnersById = await Partner.find({ name: { $in: plainNames } }, '_id');
          matchedPartnersById.forEach(mp => {
            resolvedNames.push(mp._id.toString());
          });
        }

        const finalPartnerTypes = [...pTypes, ...resolvedNames, ...plainNames];
        query['partnerTypes.type'] = { $in: finalPartnerTypes };
      }
    }

    const users = await CompanyUser.find(query).sort({ createdAt: -1 }).lean();

    // -- Populate Names for Country, State, Cluster, District, City --
    const countryIds = new Set();
    const stateIds = new Set();
    const clusterIds = new Set();
    const districtIds = new Set();
    const cityIds = new Set();

    users.forEach(u => {
      if (u.country) u.country.split(',').map(id => id.trim()).forEach(id => mongoose.Types.ObjectId.isValid(id) && countryIds.add(id));
      if (u.state) u.state.split(',').map(id => id.trim()).forEach(id => mongoose.Types.ObjectId.isValid(id) && stateIds.add(id));
      if (u.cluster) u.cluster.split(',').map(id => id.trim()).forEach(id => mongoose.Types.ObjectId.isValid(id) && clusterIds.add(id));
      if (u.district) u.district.split(',').map(id => id.trim()).forEach(id => mongoose.Types.ObjectId.isValid(id) && districtIds.add(id));
      if (u.city) u.city.split(',').map(id => id.trim()).forEach(id => mongoose.Types.ObjectId.isValid(id) && cityIds.add(id));
    });

    const [countries, states, clusters, districts, cities] = await Promise.all([
      countryIds.size > 0 ? Country.find({ _id: { $in: Array.from(countryIds) } }, 'name') : [],
      stateIds.size > 0 ? State.find({ _id: { $in: Array.from(stateIds) } }, 'name') : [],
      clusterIds.size > 0 ? Cluster.find({ _id: { $in: Array.from(clusterIds) } }, 'name') : [],
      districtIds.size > 0 ? District.find({ _id: { $in: Array.from(districtIds) } }, 'name') : [],
      cityIds.size > 0 ? City.find({ _id: { $in: Array.from(cityIds) } }, 'name') : []
    ]);

    const countryMap = new Map(countries.map(c => [c._id.toString(), c.name]));
    const stateMap = new Map(states.map(s => [s._id.toString(), s.name]));
    const clusterMap = new Map(clusters.map(c => [c._id.toString(), c.name]));
    const districtMap = new Map(districts.map(d => [d._id.toString(), d.name]));
    const cityMap = new Map(cities.map(c => [c._id.toString(), c.name]));

    const formatNames = (str, map) => {
      if (!str) return '';
      return str.split(',').map(id => id.trim()).map(id => map.get(id) || id).join(', ');
    };

    // Attach count of partners/users created by this company user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const partnersCreatedCount = await User.countDocuments({ createdBy: u._id });
        return {
          ...u,
          country: formatNames(u.country, countryMap),
          state: formatNames(u.state, stateMap),
          cluster: formatNames(u.cluster, clusterMap),
          district: formatNames(u.district, districtMap),
          city: formatNames(u.city, cityMap),
          partnersCreatedCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Company users fetched successfully.',
      count: usersWithCounts.length,
      data: usersWithCounts,
    });
  } catch (error) {
    console.error('Error in getAllCompanyUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// ─── 4. Get single Company User by ID ────────────────────────────────────────
// GET /api/company-users/:id
export const getCompanyUserById = async (req, res) => {
  try {
    const user = await CompanyUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Company user not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error in getCompanyUserById:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// ─── 5. Update Company User ────────────────────────────────────────────────────
// PUT /api/company-users/:id
export const updateCompanyUser = async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 'emailAddress', 'country', 'state', 'cluster', 'district', 'city', 'status',
      'partnerGoalsEnabled', 'partnerMonthlyTargetKw', 'partnerPerKwCommission',
      'partnerQuotePermissions', 'partnerTypes',
      'projectGoalEnabled', 'projectMonthlyTargetKw', 'projectPerKwCommission',
      'projectTypes',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await CompanyUser.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Company user not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company user updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Error in updateCompanyUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// ─── 6. Delete Company User ────────────────────────────────────────────────────
// DELETE /api/company-users/:id
export const deleteCompanyUser = async (req, res) => {
  try {
    const user = await CompanyUser.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Company user not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company user deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteCompanyUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// ─── 7. Get logged-in company user profile ────────────────────────────────────
// GET /api/company-users/me  (requires JWT token in header)
export const getMyProfile = async (req, res) => {
  try {
    const user = await CompanyUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Company user not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error in getMyProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};
