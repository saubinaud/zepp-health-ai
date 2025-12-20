'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Sparkles, Loader2, Heart } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HealthPage() {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePrediction = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/health/predictions/generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error generating prediction:', error);
      alert('Error al generar predicción');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return '🟢 Riesgo Bajo';
      case 'medium': return '🟡 Riesgo Medio';
      case 'high': return '🔴 Riesgo Alto';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
          <Heart className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Predicciones de Salud
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Análisis predictivo con IA
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generar Predicción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La IA analizará tus últimos 30 días de datos para predecir posibles riesgos de salud.
          </p>
          <Button onClick={generatePrediction} disabled={loading} size="lg" className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analizando tus datos...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generar Predicción de Salud
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Predicción Generada</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.risk_level)}`}>
                  {getRiskLabel(prediction.risk_level)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Tipo de Predicción</h3>
                <p className="text-gray-700 dark:text-gray-300 capitalize">
                  {prediction.prediction_type?.replace(/_/g, ' ')}
                </p>
              </div>

              {prediction.confidence_score && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Confianza</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${prediction.confidence_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{prediction.confidence_score}%</span>
                  </div>
                </div>
              )}

              {prediction.factors && prediction.factors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Factores de Riesgo
                  </h3>
                  <ul className="space-y-2">
                    {prediction.factors.map((factor: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Recomendaciones
                  </h3>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.warning_signs && prediction.warning_signs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Señales de Advertencia
                  </h3>
                  <ul className="space-y-2">
                    {prediction.warning_signs.map((sign: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                        <span className="text-red-600 mt-0.5">⚠️</span>
                        <span className="text-gray-700 dark:text-gray-300">{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
