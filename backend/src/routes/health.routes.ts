import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import { HealthPredictionService } from '../services/health-prediction.service';
import { WorkoutAnalysisService } from '../services/workout-analysis.service';
import { CheckInService } from '../services/checkin.service';

const router = Router();
const healthPredictionService = new HealthPredictionService();
const workoutAnalysisService = new WorkoutAnalysisService();
const checkInService = new CheckInService();

/**
 * POST /api/health/predictions/generate
 * Generar predicción de salud
 */
router.post('/predictions/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const prediction = await healthPredictionService.generateHealthPredictions(req.user.id);

    res.json({
      message: 'Predicción generada exitosamente',
      prediction,
    });
  } catch (error: any) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health/predictions
 * Obtener predicciones del usuario
 */
router.get('/predictions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { limit = '10' } = req.query;
    const predictions = await healthPredictionService.getUserPredictions(
      req.user.id,
      parseInt(limit as string)
    );

    res.json(predictions);
  } catch (error: any) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/health/workout-analysis/:workoutId
 * Analizar un workout específico
 */
router.post('/workout-analysis/:workoutId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { workoutId } = req.params;
    const analysis = await workoutAnalysisService.analyzeWorkout(
      req.user.id,
      parseInt(workoutId)
    );

    res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing workout:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health/workout-analysis/:workoutId
 * Obtener análisis de un workout
 */
router.get('/workout-analysis/:workoutId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { workoutId } = req.params;
    const analysis = await workoutAnalysisService.getWorkoutAnalysis(parseInt(workoutId));

    if (!analysis) {
      return res.status(404).json({ error: 'Análisis no encontrado' });
    }

    res.json(analysis);
  } catch (error: any) {
    console.error('Error fetching workout analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health/workout-analyses
 * Obtener todos los análisis de workouts del usuario
 */
router.get('/workout-analyses', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { limit = '20' } = req.query;
    const analyses = await workoutAnalysisService.getUserWorkoutAnalyses(
      req.user.id,
      parseInt(limit as string)
    );

    res.json(analyses);
  } catch (error: any) {
    console.error('Error fetching workout analyses:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health/checkin/today
 * Obtener check-in del día
 */
router.get('/checkin/today', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const checkIn = await checkInService.getTodayCheckIn(req.user.id);
    res.json(checkIn);
  } catch (error: any) {
    console.error('Error fetching today checkin:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/health/checkin
 * Crear o actualizar check-in diario
 */
router.post('/checkin', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const checkIn = await checkInService.createOrUpdateCheckIn(req.user.id, req.body);

    res.json({
      message: 'Check-in guardado exitosamente',
      checkIn,
    });
  } catch (error: any) {
    console.error('Error saving checkin:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health/checkin/history
 * Obtener historial de check-ins
 */
router.get('/checkin/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { limit = '30' } = req.query;
    const history = await checkInService.getCheckInHistory(
      req.user.id,
      parseInt(limit as string)
    );

    res.json(history);
  } catch (error: any) {
    console.error('Error fetching checkin history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health/questions/daily
 * Obtener preguntas diarias
 */
router.get('/questions/daily', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const questions = await checkInService.generateDailyQuestions(req.user.id);
    res.json(questions);
  } catch (error: any) {
    console.error('Error fetching daily questions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health/questions/pending
 * Obtener preguntas pendientes
 */
router.get('/questions/pending', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const questions = await checkInService.getPendingQuestions(req.user.id);
    res.json(questions);
  } catch (error: any) {
    console.error('Error fetching pending questions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/health/questions/:id/answer
 * Responder pregunta diaria
 */
router.post('/questions/:id/answer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { answer } = req.body;

    await checkInService.answerDailyQuestion(req.user.id, parseInt(id), answer);

    res.json({ message: 'Respuesta guardada' });
  } catch (error: any) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
