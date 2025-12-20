'use client';

import { useState } from 'react';
import { aiAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Send,
  Sparkles,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Calendar,
  Loader2,
} from 'lucide-react';

export default function AIInsightsPage() {
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: any }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);

  const handleQuickAnalysis = async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      setAnalysisLoading(true);
      const response = await aiAPI.analyze({ analysisType: type });
      setCurrentAnalysis(response.data);
    } catch (error: any) {
      console.error('Error al analizar:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');

    // Add user message
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
    ]);

    try {
      setLoading(true);
      const response = await aiAPI.chat({ question: userMessage });

      // Add AI response
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data },
      ]);
    } catch (error: any) {
      console.error('Error en chat:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: { summary: 'Lo siento, hubo un error al procesar tu pregunta.' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '¿Cómo está mi salud cardiovascular?',
    '¿Por qué dormí mal anoche?',
    'Dame recomendaciones para mejorar mi sueño',
    '¿Cuál es mi tendencia de estrés esta semana?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
          <Brain className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Análisis con IA
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights personalizados sobre tu salud
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">
            <Send className="mr-2 h-4 w-4" />
            Chat Interactivo
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <TrendingUp className="mr-2 h-4 w-4" />
            Análisis Rápido
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pregunta lo que quieras sobre tu salud</CardTitle>
              <CardDescription>
                El asistente de IA analizará tus datos y te dará respuestas personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Quick Questions */}
              {chatMessages.length === 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Preguntas sugeridas:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(question)}
                        className="text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Sparkles className="inline mr-2 h-4 w-4 text-blue-600" />
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="space-y-3">
                          {message.content.summary && (
                            <p className="text-gray-900 dark:text-white">
                              {message.content.summary}
                            </p>
                          )}
                          {message.content.insights && message.content.insights.length > 0 && (
                            <div>
                              <p className="font-semibold text-sm mb-2">Insights:</p>
                              <ul className="space-y-1">
                                {message.content.insights.map((insight: string, i: number) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {message.content.recommendations && message.content.recommendations.length > 0 && (
                            <div>
                              <p className="font-semibold text-sm mb-2">Recomendaciones:</p>
                              <ul className="space-y-1">
                                {message.content.recommendations.map((rec: string, i: number) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <TrendingUp className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {message.content.alerts && message.content.alerts.length > 0 && (
                            <div>
                              <p className="font-semibold text-sm mb-2 text-red-600">Alertas:</p>
                              <ul className="space-y-1">
                                {message.content.alerts.map((alert: string, i: number) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                                    <span>{alert}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pregunta sobre tu salud..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                />
                <Button onClick={handleSendMessage} disabled={loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {/* Quick Analysis Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleQuickAnalysis('daily')}
              disabled={analysisLoading}
              className="h-24 flex-col"
              variant="outline"
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>Análisis Diario</span>
            </Button>
            <Button
              onClick={() => handleQuickAnalysis('weekly')}
              disabled={analysisLoading}
              className="h-24 flex-col"
              variant="outline"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Análisis Semanal</span>
            </Button>
            <Button
              onClick={() => handleQuickAnalysis('monthly')}
              disabled={analysisLoading}
              className="h-24 flex-col"
              variant="outline"
            >
              <Brain className="h-6 w-6 mb-2" />
              <span>Análisis Mensual</span>
            </Button>
          </div>

          {/* Analysis Results */}
          {analysisLoading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Analizando tus datos de salud...
                </span>
              </CardContent>
            </Card>
          )}

          {currentAnalysis && !analysisLoading && (
            <div className="space-y-4">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Resumen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{currentAnalysis.summary}</p>
                  {currentAnalysis.confidence_score && (
                    <div className="mt-4">
                      <Badge variant="secondary">
                        Confianza: {currentAnalysis.confidence_score}%
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Insights */}
              {currentAnalysis.insights && currentAnalysis.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentAnalysis.insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Alerts */}
              {currentAnalysis.alerts && currentAnalysis.alerts.length > 0 && (
                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      Alertas Importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentAnalysis.alerts.map((alert: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
