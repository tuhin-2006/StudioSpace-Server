import { Router, Response } from 'express';
import { Booking } from '../models/Booking';
import { Studio } from '../models/Studio';
import { verifyToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Helper to convert "HH:MM" string to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// POST /api/bookings (Create reservation with Double-Booking Prevention)
router.post('/', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      studioId,
      bookingDate,
      startTime,
      endTime,
      userPhone,
      specialRequests,
    } = req.body;

    if (!studioId || !bookingDate || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'Please provide studioId, bookingDate, startTime, and endTime.',
      });
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      res.status(400).json({
        success: false,
        message: 'End time must be later than start time.',
      });
      return;
    }

    const totalHours = Math.ceil((endMinutes - startMinutes) / 60);

    const studio = await Studio.findById(studioId);
    if (!studio) {
      res.status(404).json({ success: false, message: 'Studio workspace not found.' });
      return;
    }

    // =========================================================================
    // Challenge 2: Booking Double-Booking Prevention Algorithm
    // Check against existing "Confirmed" bookings for this studio on this date
    // Overlap condition: (newStart < existingEnd) AND (newEnd > existingStart)
    // =========================================================================
    const existingConfirmedBookings = await Booking.find({
      studioId: studio._id,
      bookingDate,
      status: 'Confirmed',
    });

    const collision = existingConfirmedBookings.find((existing) => {
      const existingStart = timeToMinutes(existing.startTime);
      const existingEnd = timeToMinutes(existing.endTime);
      return startMinutes < existingEnd && endMinutes > existingStart;
    });

    if (collision) {
      res.status(409).json({
        success: false,
        message: `Time slot conflict: Studio is already reserved from ${collision.startTime} to ${collision.endTime} on ${bookingDate}. Please choose another time.`,
        collision: {
          bookingDate,
          startTime: collision.startTime,
          endTime: collision.endTime,
        },
      });
      return;
    }

    const totalPrice = (studio.hourlyRate * totalHours) + studio.securityDeposit;
    const userEmail = req.user?.email?.toLowerCase() || '';
    const userName = req.user?.name || 'Studio Creator';

    const newBooking = await Booking.create({
      studioId: studio._id,
      studioTitle: studio.title,
      studioCategory: studio.category,
      studioImage: studio.imageUrl,
      hourlyRate: studio.hourlyRate,
      securityDeposit: studio.securityDeposit,
      hostEmail: studio.hostEmail,
      userEmail,
      userName,
      userPhone: userPhone || '',
      bookingDate,
      startTime,
      endTime,
      totalHours,
      totalPrice,
      status: 'Pending',
      specialRequests: specialRequests || '',
    });

    res.status(201).json({
      success: true,
      message: 'Workspace reservation submitted successfully! Status: Pending.',
      booking: newBooking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create booking' });
  }
});

// GET /api/bookings/my-bookings (User's Bookings List)
router.get('/my-bookings', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email?.toLowerCase();
    const bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to retrieve bookings' });
  }
});

// PATCH /api/bookings/:id/cancel (Cancel pending reservation)
router.patch('/:id/cancel', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email?.toLowerCase();

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Reservation not found.' });
      return;
    }

    if (booking.userEmail.toLowerCase() !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden. You do not own this booking.' });
      return;
    }

    if (booking.status !== 'Pending') {
      res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status '${booking.status}'. Only Pending bookings can be cancelled directly.`,
      });
      return;
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Studio booking cancelled successfully.',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to cancel booking' });
  }
});

// PATCH /api/bookings/:id/status (Update booking status - e.g. confirm/complete)
router.patch('/:id/status', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid booking status provided.' });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Reservation not found.' });
      return;
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Reservation status updated to ${status}.`,
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
  }
});

export default router;
