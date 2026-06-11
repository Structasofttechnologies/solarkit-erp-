import LoanProvider from '../../models/finance/LoanProvider.js';

export const getLoanProviders = async (req, res) => {
    try {
        const providers = await LoanProvider.find().sort({ name: 1 });
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createLoanProvider = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Check if provider already exists
        const existing = await LoanProvider.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: 'Loan provider already exists' });
        }

        const provider = new LoanProvider({ name });
        await provider.save();
        res.status(201).json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLoanProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const provider = await LoanProvider.findByIdAndUpdate(id, { name }, { new: true });
        if (!provider) {
            return res.status(404).json({ message: 'Loan provider not found' });
        }
        res.status(200).json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteLoanProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await LoanProvider.findByIdAndDelete(id);
        if (!provider) {
            return res.status(404).json({ message: 'Loan provider not found' });
        }
        res.status(200).json({ message: 'Loan provider deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
