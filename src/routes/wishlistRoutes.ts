import { Router, Response } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Studio } from '../models/Studio';
import { verifyToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// GET /api/wishlist (Get user's saved wishlist)
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email?.toLowerCase();
    const items = await Wishlist.find({ userEmail }).populate('studioId');

    const studios = items.map((item) => item.studioId).filter(Boolean);

    res.status(200).json({
      success: true,
      count: studios.length,
      studios,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch wishlist' });
  }
});

// POST /api/wishlist/toggle (Add or Remove studio from wishlist)
router.post('/toggle', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studioId } = req.body;
    const userEmail = req.user?.email?.toLowerCase();

    if (!studioId || !userEmail) {
      res.status(400).json({ success: false, message: 'Studio ID is required.' });
      return;
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      res.status(404).json({ success: false, message: 'Studio workspace not found.' });
      return;
    }

    const existing = await Wishlist.findOne({ userEmail, studioId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Removed from saved wishlist.',
      });
    } else {
      await Wishlist.create({ userEmail, studioId });
      res.status(200).json({
        success: true,
        isSaved: true,
        message: 'Added to saved wishlist!',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle wishlist' });
  }
});

export default router;
