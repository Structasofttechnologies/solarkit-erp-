import api from '../../api/axios';

// Get all orders
export const getAllOrders = async () => {
    try {
        const res = await api.get('/procurement-orders');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Get single order
export const getOrderById = async (id) => {
    try {
        const res = await api.get(`/procurement-orders/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Create order
export const createOrder = async (orderData) => {
    try {
        const res = await api.post('/procurement-orders', orderData);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Update order
export const updateOrder = async (id, orderData) => {
    try {
        const res = await api.put(`/procurement-orders/${id}`, orderData);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Update order status
export const updateOrderStatus = async (id, status) => {
    try {
        const res = await api.put(`/procurement-orders/${id}/status`, { status });
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// Delete order
export const deleteOrder = async (id) => {
    try {
        const res = await api.delete(`/procurement-orders/${id}`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

// --- Helper Data Fetchers ---

// Fetch Suppliers (from Vendor module)
export const getAllSuppliers = async () => {
    try {
        const res = await api.get('/vendors/supplier-vendors');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
}

// Fetch Products (from Inventory/Product module)
export const getAllProducts = async () => {
    try {
        // Assuming there is a route for getting all products
        const res = await api.get('/products');
        return res.data;
    } catch (err) {
        // Fallback or retry if different endpoint
        try {
            const res2 = await api.get('/inventory/items');
            return res2.data;
        } catch (e) {
            throw err.response?.data || err.message;
        }
    }
}

// --- Dynamic Location Fetchers ---

export const getStates = async () => {
    try {
        const res = await api.get('/locations/states?isActive=true');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
}

export const getCities = async (stateId) => {
    try {
        const res = await api.get(`/locations/cities?stateId=${stateId}&isActive=true`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
}

export const getDistricts = async (cityId) => {
    try {
        const res = await api.get(`/locations/districts?cityId=${cityId}&isActive=true`);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
}
