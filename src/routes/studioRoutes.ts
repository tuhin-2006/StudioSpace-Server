import { Router, Request, Response } from 'express';
import { Studio } from '../models/Studio';
import { verifyToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// GET /api/studios/user/my-listings (User-owned listings)
router.get('/user/my-listings', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email;
    const listings = await Studio.find({ hostEmail: userEmail?.toLowerCase() }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      studios: listings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch user listings' });
  }
});

// GET /api/studios (Public exploration & home featured)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, featured, sort, limit } = req.query;

    const filter: any = {};

    // Filter by Category
    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Filter by Search (title, location, address)
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { address: searchRegex },
      ];
    }

    // Filter by Featured flag
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    let query = Studio.find(filter);

    // Sorting
    if (sort === 'price_asc') {
      query = query.sort({ hourlyRate: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ hourlyRate: -1 });
    } else if (sort === 'rating_desc') {
      query = query.sort({ rating: -1, reviewsCount: -1 });
    } else {
      // Default: newest first
      query = query.sort({ createdAt: -1 });
    }

    // Apply limit if specified (e.g. limit(6) for home page)
    if (limit) {
      const parsedLimit = parseInt(limit as string, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const studios = await query.exec();

    res.status(200).json({
      success: true,
      count: studios.length,
      studios,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch studios' });
  }
});

// GET /api/studios/:id (Single studio details)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const studio = await Studio.findById(id);

    if (!studio) {
      res.status(404).json({ success: false, message: 'Studio workspace not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      studio,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching studio details' });
  }
});

// POST /api/studios (Add New Studio - Protected)
router.post('/', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      address,
      imageUrl,
      galleryImages,
      amenities,
      overview,
    } = req.body;

    if (!title || !category || !hourlyRate || !maxCapacity || !location || !address || !imageUrl || !overview) {
      res.status(400).json({
        success: false,
        message: 'Please fill in all required studio fields.',
      });
      return;
    }

    // Enforce read-only host identity from authenticated token
    const hostName = req.user?.name || 'Studio Host';
    const hostEmail = req.user?.email || '';

    const newStudio = await Studio.create({
      title,
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit || 0),
      maxCapacity: Number(maxCapacity),
      location,
      address,
      imageUrl,
      galleryImages: Array.isArray(galleryImages) && galleryImages.length > 0 ? galleryImages : [imageUrl],
      amenities: Array.isArray(amenities) ? amenities : [],
      overview,
      hostName,
      hostEmail: hostEmail.toLowerCase(),
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: false,
    });

    res.status(201).json({
      success: true,
      message: 'Creative workspace listing created successfully!',
      studio: newStudio,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create studio listing' });
  }
});

// PATCH /api/studios/:id (Update Studio - Protected)
router.patch('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email?.toLowerCase();

    const existingStudio = await Studio.findById(id);
    if (!existingStudio) {
      res.status(404).json({ success: false, message: 'Studio workspace not found.' });
      return;
    }

    // Ownership verification
    if (existingStudio.hostEmail.toLowerCase() !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this studio workspace listing.',
      });
      return;
    }

    // Never allow updating read-only host identity
    const updates = { ...req.body };
    delete updates.hostEmail;
    delete updates.hostName;
    delete updates._id;

    if (updates.hourlyRate) updates.hourlyRate = Number(updates.hourlyRate);
    if (updates.securityDeposit !== undefined) updates.securityDeposit = Number(updates.securityDeposit);
    if (updates.maxCapacity) updates.maxCapacity = Number(updates.maxCapacity);

    const updatedStudio = await Studio.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Studio workspace updated successfully!',
      studio: updatedStudio,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update studio listing' });
  }
});

// DELETE /api/studios/:id (Delete Studio - Protected)
router.delete('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email?.toLowerCase();

    const existingStudio = await Studio.findById(id);
    if (!existingStudio) {
      res.status(404).json({ success: false, message: 'Studio workspace not found.' });
      return;
    }

    // Ownership verification
    if (existingStudio.hostEmail.toLowerCase() !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You can only delete workspaces that you own.',
      });
      return;
    }

    await Studio.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Studio workspace deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete studio listing' });
  }
});

export default router;
