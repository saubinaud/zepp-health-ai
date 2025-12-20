import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import { query } from '../db';
import CryptoJS from 'crypto-js';

const router = Router();

/**
 * GET /api/settings
 * Obtener configuración del usuario
 */
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await query(
      'SELECT email, zepp_email, openai_api_key FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      email: user.email,
      zepp_email: user.zepp_email,
      has_openai_key: !!user.openai_api_key,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/settings/openai-key
 * Actualizar OpenAI API key
 */
router.put('/openai-key', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Encriptar API key
    const encryptionKey = process.env.JWT_SECRET || 'secret';
    const encryptedKey = CryptoJS.AES.encrypt(apiKey, encryptionKey).toString();

    // Actualizar en base de datos
    await query(
      'UPDATE users SET openai_api_key = $1 WHERE id = $2',
      [encryptedKey, req.user.id]
    );

    res.json({ message: 'API key actualizada exitosamente' });
  } catch (error: any) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/settings/openai-key
 * Eliminar OpenAI API key (usar la global)
 */
router.delete('/openai-key', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await query(
      'UPDATE users SET openai_api_key = NULL WHERE id = $1',
      [req.user.id]
    );

    res.json({ message: 'API key eliminada. Se usará la global.' });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
