import express from 'express';
import {
    createTicket,
    getAllTickets,
    getTicketById,
    updateTicketStatus
} from '../../controllers/tickets/ticketController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all ticket routes

router.post('/', createTicket);
router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.put('/:id/status', updateTicketStatus);

export default router;
