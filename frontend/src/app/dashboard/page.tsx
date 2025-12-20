'use client';

import { useEffect, useState } from 'react';
import { dataAPI } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { HRChart } from '@/components/charts/HRChart';
import { SleepChart } from '@/components/charts/SleepChart';
import { Button } from '@/components/ui/button';
import { Footprints, Flame, Moon, Heart, RefreshCw, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dataAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await dataAPI.syncData();
      await fetchDashboard();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const today = dashboardData?.today || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Resumen de tu salud hoy
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pasos"
          value={today.steps?.toLocaleString() || '0'}
          subtitle="Meta: 10,000 pasos"
          icon={Footprints}
          color="blue"
        />
        <MetricCard
          title="Calorías"
          value={today.calories || '0'}
          subtitle="kcal quemadas"
          icon={Flame}
          color="orange"
        />
        <MetricCard
          title="Sueño"
          value={today.sleep_duration ? formatDuration(today.sleep_duration) : 'N/A'}
          subtitle="Duración total"
          icon={Moon}
          color="purple"
        />
        <MetricCard
          title="FC Promedio"
          value={today.heart_rate_avg ? `${today.heart_rate_avg} bpm` : 'N/A'}
          subtitle={`Max: ${today.heart_rate_max || 'N/A'} | Min: ${today.heart_rate_min || 'N/A'}`}
          icon={Heart}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardData?.recentHeartRate && dashboardData.recentHeartRate.length > 0 && (
          <HRChart
            data={dashboardData.recentHeartRate}
            title="Frecuencia Cardíaca (24h)"
            description="Últimas 24 horas"
          />
        )}

        {dashboardData?.last7Days && dashboardData.last7Days.length > 0 && (
          <SleepChart data={dashboardData.last7Days} />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distancia</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {today.distance ? `${(today.distance / 1000).toFixed(2)} km` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Heart className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">HRV Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {today.hrv_avg ? `${today.hrv_avg} ms` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Moon className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sueño Profundo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {today.deep_sleep ? formatDuration(today.deep_sleep) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              ¿Quieres un análisis completo de tu salud?
            </h3>
            <p className="text-blue-100">
              Obtén insights personalizados y recomendaciones basadas en IA
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/dashboard/ai-insights'}
          >
            Analizar con IA
          </Button>
        </div>
      </div>
    </div>
  );
}
