import { selectEntryById } from '../models/entry-model.js';

const isOwner = async (req, res, next) => {
  try {
    const resourceId = req.params.id || req.params.user_id;

    if (req.baseUrl.includes('entries')) {
      const entry = await selectEntryById(resourceId);
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      if (entry.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (req.baseUrl.includes('users')) {
      if (parseInt(resourceId) !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.user_level !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export { isOwner, isAdmin };
