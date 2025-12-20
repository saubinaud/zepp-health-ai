'use client';

import { useEffect, useState } from 'react';
import { dataAPI } from '@/lib/api';
import { SleepChart } from '@/components/charts/SleepChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Clock, CloudMoon } from 'lucide-react';
import { formatDuration, formatTime } from '@/lib/utils';

export default function SleepPage() {
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dataAPI.getSleep();
        setSleepData(response.data);
      } catch (error) {
        console.error('Error fetching sleep data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const avgSleep = sleepData.length > 0
    ? Math.round(sleepData.reduce((sum, s) => sum + (s.sleep_duration || 0), 0) / sleepData.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Análisis de Sueño</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Historial y calidad de tu sueño</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio de Sueño</CardTitle>
            <Moon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(avgSleep)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Noche</CardTitle>
            <CloudMoon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepData[0] ? formatDuration(sleepData[0].sleep_duration) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Registradas</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sleepData.length}</div>
          </CardContent>
        </Card>
      </div>

      {sleepData.length > 0 && (
        <>
          <SleepChart data={sleepData.slice(0, 7)} />

          <Card>
            <CardHeader>
              <CardTitle>Historial Detallado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sleepData.slice(0, 10).map((sleep, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{sleep.date}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sleep.sleep_start && formatTime(sleep.sleep_start)} - {sleep.sleep_end && formatTime(sleep.sleep_end)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatDuration(sleep.sleep_duration)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Profundo: {formatDuration(sleep.deep_sleep || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
