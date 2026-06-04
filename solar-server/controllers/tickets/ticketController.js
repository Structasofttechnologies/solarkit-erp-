import Ticket from '../../models/tickets/Ticket.js';
import Project from '../../models/projects/Project.js';

// Helper to generate Ticket ID
const generateTicketId = async () => {
    const count = await Ticket.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // Format: TKT-YYMM-XXXX
    return `TKT-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createTicket = async (req, res) => {
    try {
        const {
            projectId,
            issueType,
            component,
            description,
            priority,
            media // Array of URLs if any
        } = req.body;

        let project = null;
        if (projectId) {
            // Verify project exists if a projectId was provided
            project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
        }

        const ticketId = await generateTicketId();

        const newTicket = new Ticket({
            ticketId,
            project: projectId || null,
            user: req.user.id, // Assumes auth middleware populates req.user
            customerName: project ? project.projectName : 'Unknown', // Or fetch from Lead/User if linked differently
            customerPhone: project ? project.mobile : 'Unknown',
            customerEmail: project ? project.email : '',
            issueType,
            component,
            description,
            priority,
            media,
            history: [{
                status: 'Open',
                note: 'Ticket created',
                updatedBy: req.user.id
            }]
        });

        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllTickets = async (req, res) => {
    try {
        const { status, priority, search } = req.query;
        let query = {};

        // Filter by user role if needed (e.g., dealers see only their tickets)
        if (req.user && req.user.role === 'dealer') {
            query.user = req.user.id;
        } else if (req.user && req.user.role === 'dealerManager') {
            const User = (await import('../../models/users/User.js')).default;
            const myDealers = await User.find({ role: 'dealer', createdBy: req.user.id }).select('_id');
            const dealerIds = myDealers.map(d => d._id);

            const Project = (await import('../../models/projects/Project.js')).default;
            const myProjects = await Project.find({ dealerId: { $in: dealerIds } }).select('_id');
            const projectIds = myProjects.map(p => p._id);

            const rbacCondition = {
                $or: [
                    { user: { $in: [...dealerIds, req.user.id] } },
                    { project: { $in: projectIds } }
                ]
            };

            if (!query.$and) query.$and = [];
            query.$and.push(rbacCondition);
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            const searchCondition = {
                $or: [
                    { ticketId: { $regex: search, $options: 'i' } },
                    { customerName: { $regex: search, $options: 'i' } },
                    { issueType: { $regex: search, $options: 'i' } },
                ]
            };

            if (!query.$and) query.$and = [];
            query.$and.push(searchCondition);
        }

        const tickets = await Ticket.find(query)
            .populate('project', 'projectName projectId')
            .sort({ createdAt: -1 });

        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('project')
            .populate('user', 'name email')
            .populate('history.updatedBy', 'name');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateTicketStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.status = status;
        ticket.history.push({
            status,
            note: note || `Status updated to ${status}`,
            updatedBy: req.user.id
        });

        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
