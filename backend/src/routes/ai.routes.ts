import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import { AIAnalysisService } from '../services/ai-analysis.service';

const router = Router();
const aiService = new AIAnalysisService();

/**
 * POST /api/ai/analyze
 * Perform AI analysis on health data
 */
router.post('/analyze', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { analysisType, dateFrom, dateTo, question } = req.body;

    if (!analysisType) {
      return res.status(400).json({ error: 'Analysis type is required' });
    }

    const result = await aiService.performAnalysis({
      user_id: req.user.id,
      analysis_type: analysisType,
      date_from: dateFrom,
      date_to: dateTo,
      question,
    });

    res.json(result);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/chat
 * Chat with AI about health data
 */
router.post('/chat', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { question, dateFrom, dateTo } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await aiService.performAnalysis({
      user_id: req.user.id,
      analysis_type: 'chat',
      date_from: dateFrom,
      date_to: dateTo,
      question,
    });

    res.json(result);
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/history
 * Get AI analysis history
 */
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { limit = '10' } = req.query;

    const history = await aiService.getAnalysisHistory(req.user.id, parseInt(limit as string));

    res.json(history);
  } catch (error: any) {
    console.error('AI history error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
