import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/register
 * Register new user with Zepp credentials
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, zeppEmail, zeppPassword } = req.body;

    if (!email || !password || !zeppEmail || !zeppPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await authService.register(email, password, zeppEmail, zeppPassword);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/refresh-zepp-token
 * Refresh Zepp API token
 */
router.post('/refresh-zepp-token', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await authService.refreshZeppToken(req.user.id);

    res.json({ message: 'Zepp token refreshed successfully' });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
