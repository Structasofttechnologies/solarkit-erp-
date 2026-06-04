import BrandManufacturer from '../../models/inventory/BrandManufacturer.js';
import BrandSupplier from '../../models/inventory/BrandSupplier.js';

// --- Brand Manufacturer Controllers ---

export const createManufacturer = async (req, res) => {
    try {
        const {
            companyName,
            companyOriginCountry,
            brand,
            brandLogo,
            product,
            comboKit,
            state,
            district,
            city, // This might be cluster in some contexts, but we use city model
        } = req.body;

        // Check for duplicates (optional, based on company name?)
        const existing = await BrandManufacturer.findOne({ companyName });
        if (existing) {
            return res.status(400).json({ message: 'Manufacturer with this company name already exists.' });
        }

        const newManufacturer = new BrandManufacturer({
            companyName,
            companyOriginCountry,
            brand,
            brandLogo,
            product,
            comboKit,
            state: state || null,
            district: district || null,
            city: city || null,
        });

        const savedManufacturer = await newManufacturer.save();
        res.status(201).json(savedManufacturer);
    } catch (error) {
        console.error('Error creating manufacturer:', error);
        res.status(500).json({ message: 'Server error creating manufacturer', error: error.message });
    }
};

export const getAllManufacturers = async (req, res) => {
    try {
        const { type, company, product } = req.query;
        const filter = { isActive: true }; // Default to active? Or show all? Let's show all and filter in UI or add status filter

        if (type) {
            if (type === 'india') filter.companyOriginCountry = 'India';
            else if (type === 'foreign') filter.companyOriginCountry = { $ne: 'India' };
            else if (type === 'combo') filter.comboKit = true;
        }

        if (company) {
            filter.companyName = { $regex: company, $options: 'i' };
        }

        if (product) {
            filter.product = { $regex: product, $options: 'i' };
        }

        const manufacturers = await BrandManufacturer.find(filter)
            .populate('state', 'name')
            .populate('district', 'name')
            .populate('city', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: manufacturers.length, data: manufacturers });
    } catch (error) {
        console.error('Error fetching manufacturers:', error);
        res.status(500).json({ message: 'Server error fetching manufacturers', error: error.message });
    }
};

export const updateManufacturer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedManufacturer = await BrandManufacturer.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedManufacturer) {
            return res.status(404).json({ message: 'Manufacturer not found' });
        }

        res.status(200).json(updatedManufacturer);
    } catch (error) {
        console.error('Error updating manufacturer:', error);
        res.status(500).json({ message: 'Server error updating manufacturer', error: error.message });
    }
};

export const deleteManufacturer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await BrandManufacturer.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Manufacturer not found' });
        }
        // Also delete associated suppliers?? Usually yes, or set them inactive.
        // For now, let's keep it simple.
        await BrandSupplier.deleteMany({ manufacturer: id });

        res.status(200).json({ message: 'Manufacturer deleted successfully' });
    } catch (error) {
        console.error('Error deleting manufacturer:', error);
        res.status(500).json({ message: 'Server error deleting manufacturer', error: error.message });
    }
};

// --- Brand Supplier Controllers ---

export const createSupplier = async (req, res) => {
    try {
        const {
            type,
            name,
            state,
            cluster,
            district,
            city,
            manufacturer,
            product,
            category,
            subCategory,
            projectType,
            subProjectType,
            procurementType,
        } = req.body;

        const newSupplier = new BrandSupplier({
            type,
            name,
            state,
            cluster,
            district,
            city,
            manufacturer,
            product,
            category,
            subCategory,
            projectType,
            subProjectType,
            procurementType,
        });

        const savedSupplier = await newSupplier.save();
        res.status(201).json(savedSupplier);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ message: 'Server error creating supplier', error: error.message });
    }
};

export const getAllSuppliers = async (req, res) => {
    try {
        // Basic filtering if needed, but extensive filtering often done on frontend for small datasets (<1000)
        // or we can implement dynamic query builder here.
        // Given the complexity of filters (multi-select), simple query params might be tricky.
        // For now, return all and let frontend filter, or implement basic filtering.

        const { manufacturerId } = req.query;
        const filter = {};

        if (manufacturerId) {
            filter.manufacturer = manufacturerId;
        }

        const suppliers = await BrandSupplier.find(filter)
            .populate('state', 'name')
            .populate('cluster', 'name')
            .populate('district', 'name')
            .populate('city', 'name')
            .populate('manufacturer', 'companyName brand')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Server error fetching suppliers', error: error.message });
    }
};

export const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await BrandSupplier.findByIdAndUpdate(id, updateData, { new: true });

        if (!updated) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ message: 'Server error updating supplier', error: error.message });
    }
};

export const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await BrandSupplier.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ message: 'Server error deleting supplier', error: error.message });
    }
};
