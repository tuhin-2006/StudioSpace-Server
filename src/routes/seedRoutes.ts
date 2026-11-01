import { Router, Request, Response } from 'express';
import { seedDatabase } from '../scripts/seed';

const router = Router();

// GET or POST /api/seed - Quick trigger for examiner or development
router.all('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'StudioSpace database seeded successfully with 8 creative workspaces and examiner credentials!',
      data: result,
      examinerCredentials: {
        email: 'examiner@studiospace.io',
        password: 'Test1234',
        name: 'Examiner Test User',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Seeding failed' });
  }
});

export default router;
