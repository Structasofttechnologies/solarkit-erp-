import CompanyUser from '../../models/users/CompanyUser.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Create a new Company User
 * @route   POST /api/company-users
 * @access  Private/Admin
 */
export const createCompanyUser = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      emailAddress,
      district,
      partnerGoalsEnabled,
      partnerMonthlyTargetKw,
      partnerPerKwCommission,
      partnerQuoteCreate,
      partnerQuoteEdit,
      partnerQuoteDelete,
      partnerTypes,
      projectGoalEnabled,
      projectMonthlyTargetKw,
      projectPerKwCommission,
      projectTypes,
    } = req.body;

    // Check if user already exists
    const userExists = await CompanyUser.findOne({
      $or: [{ emailAddress }, { mobileNumber }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or mobile number already exists',
      });
    }

    // Create user
    const user = await CompanyUser.create({
      fullName,
      mobileNumber,
      emailAddress,
      password: mobileNumber, // default password is mobile number
      district,
      partnerGoalsEnabled,
      partnerMonthlyTargetKw,
      partnerPerKwCommission,
      partnerQuotePermissions: {
        create: partnerQuoteCreate,
        edit: partnerQuoteEdit,
        delete: partnerQuoteDelete,
      },
      partnerTypes,
      projectGoalEnabled,
      projectMonthlyTargetKw,
      projectPerKwCommission,
      projectTypes,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Company user created successfully',
    });
  } catch (error) {
    console.error('Error in createCompanyUser:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get all Company Users
 * @route   GET /api/company-users
 * @access  Private/Admin
 */
export const getCompanyUsers = async (req, res) => {
  try {
    const users = await CompanyUser.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error in getCompanyUsers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Login Company User using Mobile Number
 * @route   POST /api/company-users/login
 * @access  Public
 */
export const loginCompanyUser = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number' });
    }

    // Find user by mobile number
    const user = await CompanyUser.findOne({ mobileNumber });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact admin.' });
    }

    // In a real scenario, you'd verify an OTP here. 
    // Since OTP is mocked/requested as "mobile number par login hona chaiye", we just log them in directly or you can add OTP flow.
    // For now, logging in directly with just mobile number as per request "mobile number par login hona chaiye".
    
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        emailAddress: user.emailAddress,
        role: user.role,
        district: user.district,
      },
    });
  } catch (error) {
    console.error('Error in loginCompanyUser:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
