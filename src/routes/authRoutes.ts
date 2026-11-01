import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { verifyToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'studiospace_jwt_super_secret_key_2026_b14_a8_harry';

const createToken = (id: string, email: string, name: string, role: string): string => {
  return jwt.sign({ id, email, name, role }, JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = (res: Response, user: any, statusCode: number, message: string) => {
  const token = createToken(user._id.toString(), user.email, user.name, user.role);

  // Set HTTPOnly cookie (Challenge 1)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
    },
  });
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, photoURL } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    // Password validation criteria from requirements:
    // 1. Must have an Uppercase letter
    // 2. Must have a Lowercase letter
    // 3. Length must be at least 6 characters
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (!/[A-Z]/.test(password)) {
      res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter (A-Z).' });
      return;
    }
    if (!/[a-z]/.test(password)) {
      res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter (a-z).' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      photoURL: photoURL || undefined,
      role: 'creator',
      provider: 'credentials',
    });

    sendTokenResponse(res, newUser, 201, 'Account registered successfully!');
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    sendTokenResponse(res, user, 200, 'Logged in successfully!');
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
});

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, photoURL } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Google authentication requires email address.' });
      return;
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        photoURL: photoURL || undefined,
        provider: 'google',
        role: 'creator',
      });
    }

    sendTokenResponse(res, user, 200, 'Authenticated with Google successfully!');
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Google authentication failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch user' });
  }
});

export default router;
