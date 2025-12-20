'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Key, Save, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasKey(response.data.has_openai_key);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setMessage('Por favor ingresa una API key válida');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/settings/openai-key`,
        { apiKey },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setMessage('✅ API key guardada exitosamente');
      setHasKey(true);
      setApiKey('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm('¿Eliminar tu API key? Se usará la global del sistema.')) return;

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/settings/openai-key`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('✅ API key eliminada. Se usará la global.');
      setHasKey(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg">
          <Settings className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personaliza tu experiencia
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key
          </CardTitle>
          <CardDescription>
            {hasKey
              ? 'Tienes una API key personal configurada. Los análisis de IA usarán tu clave.'
              : 'Configura tu propia API key de OpenAI para control total de costos.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasKey && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">
                    ✅ API Key Configurada
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Todos tus análisis usan tu propia clave
                  </p>
                </div>
                <Button
                  onClick={handleDeleteKey}
                  variant="destructive"
                  size="sm"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {hasKey ? 'Actualizar API Key' : 'Tu API Key de OpenAI'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Obtén tu API key en:{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://platform.openai.com/api-keys
              </a>
            </p>
          </div>

          <Button
            onClick={handleSaveKey}
            disabled={loading || !apiKey.trim()}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : hasKey ? 'Actualizar API Key' : 'Guardar API Key'}
          </Button>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              ℹ️ Información sobre costos
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Análisis diario: ~$0.01 - $0.03 USD</li>
              <li>• Pregunta en chat: ~$0.01 - $0.02 USD</li>
              <li>• Predicción de salud: ~$0.02 - $0.04 USD</li>
              <li>• Uso mensual estimado: $3 - $10 USD</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
