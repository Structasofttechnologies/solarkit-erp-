import express from 'express';
import {
  createCompanyUser,
  mobileLogin,
  getAllCompanyUsers,
  getCompanyUserById,
  updateCompanyUser,
  deleteCompanyUser,
  getMyProfile,
} from '../../controllers/mobile/companyUserController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// ─── Public Routes ─────────────────────────────────────────────────────────────
// Mobile Login: POST /api/company-users/mobile-login
router.post('/mobile-login', mobileLogin);

// ─── Admin / Protected Routes ──────────────────────────────────────────────────
// Create a company user:   POST /api/company-users
router.post('/', createCompanyUser);

// Get all company users:   GET /api/company-users
router.get('/', getAllCompanyUsers);

// Get logged-in profile:   GET /api/company-users/me
router.get('/me', protect, getMyProfile);

// Get by ID:               GET /api/company-users/:id
router.get('/:id', protect, getCompanyUserById);

// Update by ID:            PUT /api/company-users/:id
router.put('/:id', protect, updateCompanyUser);

// Delete by ID:            DELETE /api/company-users/:id
router.delete('/:id', protect, deleteCompanyUser);

export default router;
