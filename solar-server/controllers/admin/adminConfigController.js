import AdminConfig from '../../models/admin/AdminConfig.js';

// GET /api/admin-config/:section/:key
export const getConfig = async (req, res, next) => {
  try {
    const { section, key } = req.params;

    const config = await AdminConfig.findOne({ section, key });

    return res.json({
      section,
      key,
      config: config || null,
      data: config?.data || {},
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin-config/:section/:key
export const upsertConfig = async (req, res, next) => {
  try {
    const { section, key } = req.params;
    const { data } = req.body;

    const updated = await AdminConfig.findOneAndUpdate(
      { section, key },
      {
        section,
        key,
        data: data || {},
        updatedBy: req.user?.id || null,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      message: 'Configuration saved successfully',
      section,
      key,
      config: updated,
      data: updated.data,
    });
  } catch (err) {
    next(err);
  }
};

