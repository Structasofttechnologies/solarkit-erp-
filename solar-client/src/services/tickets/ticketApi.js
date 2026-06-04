import api from '../../api/axios';

export const ticketApi = {
    // Create a new Service Ticket
    createTicket: async (ticketData) => {
        try {
            const response = await api.post('/tickets', ticketData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Fetch all tickets scoped to whoever is logged in
    fetchTickets: async (params = {}) => {
        try {
            // Can pass { status, priority, search } as params
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `/tickets?${queryString}` : '/tickets';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get specific ticket by ID
    getTicketById: async (id) => {
        try {
            const response = await api.get(`/tickets/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update ticket status
    updateTicketStatus: async (id, statusData) => {
        try {
            // statusData = { status: 'Resolved', note: 'Optional note' }
            const response = await api.put(`/tickets/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
