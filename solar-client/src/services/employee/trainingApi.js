import api from '../../api/axios';

export const getMyTraining = async () => {
    try {
        const res = await api.get('/employee/training/my-training');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const completeTraining = async () => {
    try {
        const res = await api.post('/employee/training/complete-training');
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};
