import express from 'express';
import {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  deleteDelivery,
  getDeliveriesByPartner,
} from '../../controllers/orders/deliveryController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllDeliveries);
router.post('/', authorize('admin'), createDelivery);
router.get('/:id', getDeliveryById);
router.put('/:id', updateDelivery);
router.put('/:id/status', authorize('admin', 'delivery_manager'), updateDeliveryStatus);
router.delete('/:id', authorize('admin'), deleteDelivery);
router.get('/partner/:partnerId', getDeliveriesByPartner);

export default router;
